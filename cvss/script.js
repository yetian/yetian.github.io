(function() {
    'use strict';

    // ===== 状态管理 =====
    const state = {
        version: '3.1',
        language: 'zh',
        values: {},
        cvssData: null,
        i18n: null
    };

    // ===== DOM 元素引用 =====
    const elements = {
        metricsContainer: null,
        progressIndicator: null,
        baseScoreValue: null,
        baseSeverityLabel: null,
        baseGaugeCircle: null,
        baseScoreList: null,
        temporalScoreList: null,
        environmentalScoreList: null,
        vectorString: null,
        toast: null,
        versionBtns: null,
        langBtns: null,
        resetBtn: null,
        exportPdfBtn: null,
        exportPngBtn: null
    };

    // ===== 初始化 =====
    async function init() {
        cacheElements();
        await loadData();
        bindEvents();
        renderMetrics();
        updateScores();
        applyTranslations();
    }

    function cacheElements() {
        elements.metricsContainer = document.getElementById('metricsContainer');
        elements.progressIndicator = document.getElementById('progressIndicator');
        elements.baseScoreValue = document.getElementById('baseScoreValue');
        elements.baseSeverityLabel = document.getElementById('baseSeverityLabel');
        elements.baseGaugeCircle = document.getElementById('baseGaugeCircle');
        elements.baseScoreList = document.getElementById('baseScoreList');
        elements.temporalScoreList = document.getElementById('temporalScoreList');
        elements.environmentalScoreList = document.getElementById('environmentalScoreList');
        elements.vectorString = document.getElementById('vectorString');
        elements.toast = document.getElementById('toast');
        elements.versionBtns = document.querySelectorAll('.version-btn');
        elements.langBtns = document.querySelectorAll('.lang-btn');
        elements.resetBtn = document.getElementById('resetBtn');
        elements.exportPdfBtn = document.getElementById('exportPdfBtn');
        elements.exportPngBtn = document.getElementById('exportPngBtn');
    }

    async function loadData() {
        try {
            const [cvssResponse, i18nResponse] = await Promise.all([
                fetch('data/cvss-vectors.json'),
                fetch(`data/i18n/${state.language}.json`)
            ]);
            state.cvssData = await cvssResponse.json();
            state.i18n = await i18nResponse.json();
        } catch (error) {
            console.error('Failed to load data:', error);
            showToast('Failed to load data', 'error');
        }
    }

    // ===== 事件绑定 =====
    function bindEvents() {
        // 版本切换
        elements.versionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const newVersion = btn.dataset.version;
                if (newVersion !== state.version) {
                    switchVersion(newVersion);
                }
            });
        });

        // 语言切换
        elements.langBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const newLang = btn.dataset.lang;
                if (newLang !== state.language) {
                    state.language = newLang;
                    elements.langBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    await loadI18n();
                    renderMetrics();
                    applyTranslations();
                    updateScores();
                }
            });
        });

        // 重置按钮
        elements.resetBtn.addEventListener('click', resetAll);

        // 导出按钮
        elements.exportPdfBtn.addEventListener('click', exportToPDF);
        elements.exportPngBtn.addEventListener('click', exportToPNG);
    }

    // ===== 版本切换 =====
    function switchVersion(newVersion) {
        const oldVersion = state.version;
        const carriedValues = carryOverMetrics(oldVersion, newVersion);

        // 更新状态
        state.version = newVersion;
        state.values = carriedValues;

        // 更新 UI
        elements.versionBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.version === newVersion);
        });

        renderMetrics();
        updateScores();

        // 更新 vector label
        const vectorLabel = document.querySelector('.vector-label');
        if (vectorLabel) {
            vectorLabel.textContent = `CVSS:${newVersion}`;
        }
    }

    function carryOverMetrics(fromVersion, toVersion) {
        const mapping = state.cvssData.carryOverMapping[`${fromVersion}-${toVersion}`];
        if (!mapping) return {};

        const carried = {};

        for (const [fromKey, toKeyOrMap] of Object.entries(mapping)) {
            const fromValue = state.values[fromKey];
            if (fromValue === undefined) continue;

            if (typeof toKeyOrMap === 'string') {
                // 直接映射
                carried[toKeyOrMap] = fromValue;
            } else if (typeof toKeyOrMap === 'object') {
                // 值映射（如 UI 的 R -> P）
                const toValue = toKeyOrMap[fromValue];
                if (toValue) {
                    carried[fromKey] = toValue;
                }
            }
        }

        return carried;
    }

    // ===== 渲染指标 =====
    function renderMetrics() {
        const versionData = state.cvssData.versions[state.version];
        const metrics = versionData.metrics;
        const groupOrder = state.cvssData.groupOrder;

        let html = '';
        let requiredCount = 0;
        let selectedCount = 0;

        for (const groupName of groupOrder) {
            const groupMetrics = metrics[groupName];
            if (!groupMetrics || Object.keys(groupMetrics).length === 0) continue;

            const isBaseGroup = groupName === 'base';
            const groupI18nKey = groupName === 'temporal' && state.version === '4.0' ? 'threat' : groupName;
            const groupTitle = state.i18n.groups[groupI18nKey] || groupName;
            const isOptional = !Object.values(groupMetrics).some(m => m.required);

            // 统计必填项
            if (isBaseGroup) {
                requiredCount = Object.keys(groupMetrics).length;
                selectedCount = Object.keys(groupMetrics).filter(k => state.values[k]).length;
            }

            html += `
                <div class="metric-group" data-group="${groupName}">
                    <div class="group-header" onclick="toggleGroup('${groupName}')">
                        <div class="group-title">
                            <span class="group-toggle">▼</span>
                            ${groupTitle}
                            ${isOptional ? '' : `<span class="group-badge">${state.i18n.ui.required}</span>`}
                            ${isOptional ? `<span class="group-badge optional">${state.i18n.ui.optional}</span>` : ''}
                        </div>
                        ${isBaseGroup ? `<span class="group-progress">${selectedCount}/${requiredCount}</span>` : ''}
                    </div>
                    <div class="group-content">
                        ${renderGroupMetrics(groupMetrics, groupName)}
                    </div>
                </div>
            `;
        }

        elements.metricsContainer.innerHTML = html;

        // 更新进度指示器
        elements.progressIndicator.textContent = `${selectedCount}/${requiredCount}`;

        // 绑定指标选择事件
        bindMetricEvents();
    }

    function renderGroupMetrics(groupMetrics, groupName) {
        let html = '';

        for (const [metricKey, metric] of Object.entries(groupMetrics)) {
            const metricI18n = state.i18n.metrics[metricKey] || {};
            const metricName = metricI18n.name || metric.name;
            const metricDesc = metricI18n.description || '';
            const isRequired = metric.required;
            const hasValue = state.values[metricKey] !== undefined;
            const isUnselected = isRequired && !hasValue;

            html += `
                <div class="metric-item ${isUnselected ? 'unselected' : ''}" data-metric="${metricKey}">
                    <div class="metric-header">
                        <label class="metric-label">
                            ${isRequired ? '<span class="required-star">*</span>' : ''}
                            ${metricName}
                            <span class="metric-info" title="${metricDesc}">?</span>
                        </label>
                    </div>
                    <div class="radio-group">
                        ${renderRadioButtons(metricKey, metric.values, metricI18n)}
                    </div>
                    <div class="metric-detail" id="detail-${metricKey}">
                        <h4>${metricName}</h4>
                        <p>${metricDesc}</p>
                    </div>
                </div>
            `;
        }

        return html;
    }

    function renderRadioButtons(metricKey, values, metricI18n) {
        let html = '';

        for (const [valueKey, value] of Object.entries(values)) {
            const valueI18n = metricI18n.values?.[valueKey] || {};
            const valueName = valueI18n.name || value.name;
            const valueDesc = valueI18n.description || '';
            const isChecked = state.values[metricKey] === valueKey;

            html += `
                <div class="radio-btn">
                    <input type="radio" id="${metricKey}_${valueKey}" name="${metricKey}"
                           value="${valueKey}" ${isChecked ? 'checked' : ''}>
                    <label for="${metricKey}_${valueKey}" title="${valueDesc}">
                        <span>${valueKey}</span>
                        <span class="value-name">${valueName}</span>
                    </label>
                </div>
            `;
        }

        return html;
    }

    function bindMetricEvents() {
        // 单选按钮事件
        document.querySelectorAll('.metric-item input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const metricKey = e.target.name;
                const valueKey = e.target.value;
                state.values[metricKey] = valueKey;

                // 更新未选择状态
                const metricItem = e.target.closest('.metric-item');
                metricItem.classList.remove('unselected');

                // 更新进度
                updateProgress();

                // 更新分数
                updateScores();

                // 显示详情
                showMetricDetail(metricKey);
            });
        });

        // 信息按钮悬停
        document.querySelectorAll('.metric-info').forEach(info => {
            info.addEventListener('mouseenter', (e) => {
                const metricKey = e.target.closest('.metric-item').dataset.metric;
                showMetricDetail(metricKey);
            });
        });
    }

    function showMetricDetail(metricKey) {
        // 隐藏所有详情
        document.querySelectorAll('.metric-detail').forEach(d => d.classList.remove('visible'));

        // 显示当前详情
        const detail = document.getElementById(`detail-${metricKey}`);
        if (detail) {
            detail.classList.add('visible');
        }
    }

    function updateProgress() {
        const versionData = state.cvssData.versions[state.version];
        const baseMetrics = versionData.metrics.base;
        const requiredCount = Object.keys(baseMetrics).length;
        const selectedCount = Object.keys(baseMetrics).filter(k => state.values[k]).length;

        elements.progressIndicator.textContent = `${selectedCount}/${requiredCount}`;
    }

    // ===== 分数计算 =====
    function updateScores() {
        const scores = calculateAllScores();

        // 更新基础分数
        const baseScore = scores.base;
        const severity = getSeverity(baseScore);

        elements.baseScoreValue.textContent = baseScore.toFixed(1);
        elements.baseSeverityLabel.textContent = state.i18n.severity[severity];
        elements.baseSeverityLabel.className = `gauge-label severity-${severity}`;
        elements.baseScoreList.textContent = baseScore.toFixed(1);

        // 更新仪表盘
        updateGauge(baseScore, severity);

        // 更新时间分数
        if (scores.temporal !== null) {
            elements.temporalScoreList.textContent = scores.temporal.toFixed(1);
        } else {
            elements.temporalScoreList.textContent = '-';
        }

        // 更新环境分数
        if (scores.environmental !== null) {
            elements.environmentalScoreList.textContent = scores.environmental.toFixed(1);
        } else {
            elements.environmentalScoreList.textContent = '-';
        }

        // 更新向量字符串
        elements.vectorString.textContent = generateVectorString();
    }

    function calculateAllScores() {
        if (state.version === '4.0') {
            return calculateCVSS40Scores();
        } else {
            return calculateCVSS31Scores();
        }
    }

    // CVSS 3.0/3.1 计算
    function calculateCVSS31Scores() {
        const versionData = state.cvssData.versions[state.version];
        const exponent = versionData.modifiedImpactExponent;
        const metrics = versionData.metrics;

        // 获取基础指标值
        const AV = getWeight('AV', 'base');
        const AC = getWeight('AC', 'base');
        const PR = getPRWeight();
        const UI = getWeight('UI', 'base');
        const S = state.values['S'];
        const C = getWeight('C', 'base');
        const I = getWeight('I', 'base');
        const A = getWeight('A', 'base');

        // 检查必填项
        if (AV === null || AC === null || PR === null || UI === null ||
            S === undefined || C === null || I === null || A === null) {
            return { base: 0, temporal: null, environmental: null };
        }

        // 计算 ISS
        const ISS = 1 - ((1 - C) * (1 - I) * (1 - A));

        // 计算 Impact
        let Impact;
        const scopeChanged = S === 'C';

        if (scopeChanged) {
            Impact = 7.52 * (ISS - 0.029) - 3.25 * Math.pow(ISS - 0.02, exponent);
        } else {
            Impact = 6.42 * ISS;
        }

        // 计算 Exploitability
        const Exploitability = 8.22 * AV * AC * PR * UI;

        // 计算 Base Score
        let baseScore = 0;
        if (Impact > 0) {
            if (scopeChanged) {
                baseScore = Math.min(1.08 * (Impact + Exploitability), 10);
            } else {
                baseScore = Math.min(Impact + Exploitability, 10);
            }
        }

        baseScore = roundUp(baseScore);

        // 计算 Temporal Score
        let temporalScore = null;
        const temporalMetrics = metrics.temporal || {};
        const hasTemporal = Object.keys(temporalMetrics).some(k => state.values[k] && state.values[k] !== 'X');

        if (hasTemporal) {
            const E = getWeight('E', 'temporal') || 1;
            const RL = getWeight('RL', 'temporal') || 1;
            const RC = getWeight('RC', 'temporal') || 1;
            temporalScore = roundUp(baseScore * E * RL * RC);
        }

        // 计算 Environmental Score (简化版)
        let environmentalScore = null;
        const envMetrics = metrics.environmental || {};
        const hasEnv = Object.keys(envMetrics).some(k => state.values[k] && state.values[k] !== 'X');

        if (hasEnv) {
            // 使用 Modified 指标
            const MAV = getModifiedWeight('MAV', 'AV') || AV;
            const MAC = getModifiedWeight('MAC', 'AC') || AC;
            const MPR = getModifiedPRWeight() || PR;
            const MUI = getModifiedWeight('MUI', 'UI') || UI;
            const MS = state.values['MS'] !== 'X' ? state.values['MS'] : S;
            const MC = getModifiedWeight('MC', 'C') || C;
            const MI = getModifiedWeight('MI', 'I') || I;
            const MA = getModifiedWeight('MA', 'A') || A;

            const CR = getWeight('CR', 'environmental') || 1;
            const IR = getWeight('IR', 'environmental') || 1;
            const AR = getWeight('AR', 'environmental') || 1;

            const MISS = Math.min(1 - ((1 - CR * MC) * (1 - IR * MI) * (1 - AR * MA)), 0.915);

            let modImpact;
            const modScopeChanged = MS === 'C';

            if (modScopeChanged) {
                modImpact = 7.52 * (MISS - 0.029) - 3.25 * Math.pow(MISS * 0.9731 - 0.02, 13);
            } else {
                modImpact = 6.42 * MISS;
            }

            const modExploitability = 8.22 * MAV * MAC * MPR * MUI;

            let envBase = 0;
            if (modImpact > 0) {
                if (modScopeChanged) {
                    envBase = Math.min(1.08 * (modImpact + modExploitability), 10);
                } else {
                    envBase = Math.min(modImpact + modExploitability, 10);
                }
            }

            const E = getWeight('E', 'temporal') || 1;
            const RL = getWeight('RL', 'temporal') || 1;
            const RC = getWeight('RC', 'temporal') || 1;

            environmentalScore = roundUp(roundUp(envBase) * E * RL * RC);
        }

        return { base: baseScore, temporal: temporalScore, environmental: environmentalScore };
    }

    // CVSS 4.0 计算（简化版，使用近似公式）
    function calculateCVSS40Scores() {
        const metrics = state.cvssData.versions['4.0'].metrics;

        // 获取基础指标
        const AV = getWeight('AV', 'base');
        const AC = getWeight('AC', 'base');
        const AT = getWeight('AT', 'base');
        const PR = getWeight('PR', 'base');
        const UI = getWeight('UI', 'base');
        const VC = getWeight('VC', 'base');
        const VI = getWeight('VI', 'base');
        const VA = getWeight('VA', 'base');
        const SC = getWeight('SC', 'base');
        const SI = getWeight('SI', 'base');
        const SA = getWeight('SA', 'base');

        // 检查必填项
        if ([AV, AC, AT, PR, UI, VC, VI, VA, SC, SI, SA].some(v => v === null)) {
            return { base: 0, temporal: null, environmental: null };
        }

        // CVSS 4.0 使用查找表方法，这里使用近似公式
        // 参考: https://www.first.org/cvss/v4.0/specification-document

        // EQ1: 攻击难度
        const eq1 = (AV === 0.85 ? 0 : 1) + (PR === 0.85 ? 0 : (PR === 0.62 ? 1 : 2)) + (UI === 0.85 ? 0 : 1);

        // EQ2: 攻击复杂性
        const eq2 = (AC === 0.77 && AT === 0.86) ? 0 : (AC === 0.44 && AT === 0.86) ? 1 : (AC === 0.77 && AT === 0.62) ? 1 : 2;

        // EQ3: 脆弱系统影响
        const eq3Max = Math.max(VC, VI, VA);
        const eq3 = eq3Max === 0 ? 0 : eq3Max === 0.22 ? 1 : 2;

        // EQ4: 后续系统影响
        const eq4Max = Math.max(SC, SI, SA);
        const eq4 = eq4Max === 0 ? 0 : eq4Max === 0.22 ? 1 : eq4Max === 0.56 ? 2 : 3;

        // 使用查找表获取分数
        const baseScore = lookupCVSS40Score(eq1, eq2, eq3, eq4);

        // Temporal
        let temporalScore = null;
        const E = getWeight('E', 'threat');
        if (E !== null && E !== 1) {
            temporalScore = roundUp(baseScore * E);
        }

        return { base: baseScore, temporal: temporalScore, environmental: null };
    }

    // CVSS 4.0 查找表（简化版）
    function lookupCVSS40Score(eq1, eq2, eq3, eq4) {
        // 这是简化版本，完整版本需要完整的查找表
        // 基于官方规范的近似计算

        const scores = [
            // eq4 = 0
            [[8.0, 7.0, 4.0], [7.0, 6.0, 3.0], [5.0, 4.0, 2.0]],
            [[8.0, 7.0, 4.0], [7.0, 6.0, 3.0], [5.0, 4.0, 2.0]],
            [[6.0, 5.0, 2.0], [5.0, 4.0, 2.0], [3.0, 2.0, 1.0]],
            [[3.0, 2.0, 1.0], [2.0, 1.0, 0.0], [1.0, 0.0, 0.0]],
            // eq4 = 1, 2, 3 需要更完整的表
        ];

        // 简化计算
        let baseScore = 10 - (eq1 * 0.5) - (eq2 * 1) - ((2 - eq3) * 2) - ((3 - eq4) * 1);
        baseScore = Math.max(0, Math.min(10, baseScore));

        return roundUp(baseScore);
    }

    // 辅助函数
    function getWeight(metricKey, groupName) {
        const value = state.values[metricKey];
        if (value === undefined) return null;

        const metrics = state.cvssData.versions[state.version].metrics[groupName];
        if (!metrics || !metrics[metricKey]) return null;

        const metric = metrics[metricKey];
        const valueData = metric.values[value];
        if (!valueData) return null;

        return valueData.weight !== undefined ? valueData.weight : null;
    }

    function getPRWeight() {
        const PR = state.values['PR'];
        const S = state.values['S'];
        if (PR === undefined || S === undefined) return null;

        const metrics = state.cvssData.versions[state.version].metrics.base;
        const prData = metrics.PR.values[PR];
        if (!prData) return null;

        return S === 'C' ? prData.weightChanged : prData.weightUnchanged || prData.weight;
    }

    function getModifiedWeight(modifiedKey, baseKey) {
        const value = state.values[modifiedKey];
        if (value === undefined || value === 'X') return null;

        const metrics = state.cvssData.versions[state.version].metrics.environmental;
        if (!metrics || !metrics[modifiedKey]) return null;

        const metric = metrics[modifiedKey];
        const valueData = metric.values[value];
        if (!valueData) return null;

        return valueData.weight !== undefined ? valueData.weight : null;
    }

    function getModifiedPRWeight() {
        const MPR = state.values['MPR'];
        const MS = state.values['MS'];
        if (MPR === undefined || MPR === 'X') return null;

        const metrics = state.cvssData.versions[state.version].metrics.environmental;
        const mprData = metrics.MPR.values[MPR];
        if (!mprData) return null;

        const scopeChanged = MS === 'C';
        return scopeChanged ? mprData.weightChanged : mprData.weightUnchanged || mprData.weight;
    }

    function roundUp(value) {
        return Math.ceil(value * 10) / 10;
    }

    function getSeverity(score) {
        if (score === 0) return 'none';
        if (score >= 9.0) return 'critical';
        if (score >= 7.0) return 'high';
        if (score >= 4.0) return 'medium';
        return 'low';
    }

    function updateGauge(score, severity) {
        const circumference = 2 * Math.PI * 42;
        const offset = circumference - (score / 10) * circumference;

        elements.baseGaugeCircle.style.strokeDashoffset = offset;

        // 设置颜色
        const colors = {
            none: '#53aa33',
            low: '#ffcb0d',
            medium: '#f9812a',
            high: '#cc0500',
            critical: '#871406'
        };
        elements.baseGaugeCircle.style.stroke = colors[severity];

        // 更新分数颜色
        elements.baseScoreValue.style.color = colors[severity];
    }

    // ===== Vector 字符串生成 =====
    function generateVectorString() {
        const versionData = state.cvssData.versions[state.version];
        const metrics = versionData.metrics;
        const parts = [`CVSS:${state.version}`];

        // 按顺序添加指标
        const metricOrder = state.cvssData.groupOrder;

        for (const groupName of metricOrder) {
            const groupMetrics = metrics[groupName];
            if (!groupMetrics) continue;

            for (const metricKey of Object.keys(groupMetrics)) {
                const value = state.values[metricKey];
                if (value !== undefined) {
                    parts.push(`${metricKey}:${value}`);
                }
            }
        }

        return parts.join('/');
    }

    // ===== 重置 =====
    function resetAll() {
        state.values = {};
        renderMetrics();
        updateScores();
        showToast(state.i18n.ui.reset || 'Reset complete');
    }

    // ===== 翻译 =====
    async function loadI18n() {
        try {
            const response = await fetch(`data/i18n/${state.language}.json`);
            state.i18n = await response.json();
        } catch (error) {
            console.error('Failed to load i18n:', error);
        }
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const text = getNestedValue(state.i18n, key);
            if (text) {
                el.textContent = text;
            }
        });
    }

    function getNestedValue(obj, path) {
        return path.split('.').reduce((o, k) => o?.[k], obj);
    }

    // ===== 导出功能 =====
    function exportToPDF() {
        const reportContent = generateReportHTML();

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="${state.language}">
            <head>
                <meta charset="UTF-8">
                <title>CVSS Assessment Report</title>
                <style>
                    @page { margin: 15mm; size: A4; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        padding: 20px;
                        color: #333;
                        line-height: 1.6;
                    }
                    h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .score-section { display: flex; justify-content: space-around; margin: 20px 0; }
                    .score-item { text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px; width: 30%; }
                    .score-value { font-size: 28px; font-weight: bold; }
                    .severity-badge { padding: 4px 12px; border-radius: 4px; color: white; font-size: 12px; }
                    .severity-none { background: #53aa33; }
                    .severity-low { background: #ffcb0d; color: #333; }
                    .severity-medium { background: #f9812a; }
                    .severity-high { background: #cc0500; }
                    .severity-critical { background: #871406; }
                    .vector-section { background: #f0f0f0; padding: 12px; border-radius: 6px; margin: 15px 0; word-break: break-all; font-family: monospace; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background: #f5f5f5; }
                    .report-header { text-align: center; margin-bottom: 20px; }
                    .report-date { color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                ${reportContent}
            </body>
            </html>
        `);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    async function exportToPNG() {
        const template = document.getElementById('exportTemplate');
        const reportContent = document.getElementById('reportContent');

        // 填充报告内容
        populateReportContent();

        // 显示模板
        template.style.display = 'block';
        template.style.position = 'absolute';
        template.style.left = '0';
        template.style.top = '0';
        template.style.zIndex = '-1';

        try {
            const canvas = await html2canvas(reportContent, {
                backgroundColor: '#1c1c1e',
                scale: 2,
                logging: false
            });

            const link = document.createElement('a');
            link.download = `cvss-report-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            showToast(state.i18n.ui.exportPNG + ' ✓');
        } catch (error) {
            console.error('PNG export failed:', error);
            showToast('Export failed', 'error');
        } finally {
            template.style.display = 'none';
            template.style.position = 'absolute';
            template.style.left = '-9999px';
        }
    }

    function generateReportHTML() {
        const scores = calculateAllScores();
        const severity = getSeverity(scores.base);
        const vectorStr = generateVectorString();

        const reportI18n = state.i18n.report || {};

        let metricsRows = '';
        const versionData = state.cvssData.versions[state.version];
        const metrics = versionData.metrics;

        for (const groupName of state.cvssData.groupOrder) {
            const groupMetrics = metrics[groupName];
            if (!groupMetrics) continue;

            for (const [metricKey, metric] of Object.entries(groupMetrics)) {
                const value = state.values[metricKey];
                if (value !== undefined) {
                    const metricI18n = state.i18n.metrics[metricKey] || {};
                    const valueI18n = metricI18n.values?.[value] || {};
                    const metricName = metricI18n.name || metric.name;
                    const valueName = valueI18n.name || metric.values[value]?.name || value;

                    metricsRows += `
                        <tr>
                            <td>${metricName}</td>
                            <td>${value} (${valueName})</td>
                            <td>${valueI18n.description || ''}</td>
                        </tr>
                    `;
                }
            }
        }

        return `
            <div class="report-header">
                <h1>🛡️ ${reportI18n.title || 'CVSS Assessment Report'}</h1>
                <p class="report-date">${reportI18n.generated || 'Generated'}: ${new Date().toLocaleString()}</p>
                <p>${reportI18n.version || 'CVSS Version'}: ${state.version}</p>
            </div>

            <div class="score-section">
                <div class="score-item">
                    <div>${state.i18n.scores.baseScore}</div>
                    <div class="score-value">${scores.base.toFixed(1)}</div>
                    <span class="severity-badge severity-${severity}">${state.i18n.severity[severity]}</span>
                </div>
                <div class="score-item">
                    <div>${state.i18n.scores.temporalScore}</div>
                    <div class="score-value">${scores.temporal !== null ? scores.temporal.toFixed(1) : '-'}</div>
                </div>
                <div class="score-item">
                    <div>${state.i18n.scores.environmentalScore}</div>
                    <div class="score-value">${scores.environmental !== null ? scores.environmental.toFixed(1) : '-'}</div>
                </div>
            </div>

            <div class="vector-section">
                <strong>${state.i18n.ui.vectorString}:</strong><br>
                ${vectorStr}
            </div>

            <h3>${reportI18n.metrics || 'Selected Metrics'}</h3>
            <table>
                <thead>
                    <tr>
                        <th>${reportI18n.metric || 'Metric'}</th>
                        <th>${reportI18n.value || 'Value'}</th>
                        <th>${reportI18n.description || 'Description'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${metricsRows}
                </tbody>
            </table>
        `;
    }

    function populateReportContent() {
        const scores = calculateAllScores();
        const severity = getSeverity(scores.base);

        document.getElementById('reportDate').textContent = `${state.i18n.report.generated}: ${new Date().toLocaleString()}`;
        document.getElementById('reportBaseScore').textContent = scores.base.toFixed(1);
        document.getElementById('reportTemporalScore').textContent = scores.temporal !== null ? scores.temporal.toFixed(1) : '-';
        document.getElementById('reportEnvironmentalScore').textContent = scores.environmental !== null ? scores.environmental.toFixed(1) : '-';

        const severityEl = document.getElementById('reportBaseSeverity');
        severityEl.textContent = state.i18n.severity[severity];
        severityEl.style.background = getComputedStyle(document.documentElement).getPropertyValue(`--severity-${severity}`);

        document.getElementById('reportVector').textContent = generateVectorString();

        // 生成指标表格
        const tableBody = document.getElementById('reportMetricsTable');
        tableBody.innerHTML = '';

        const versionData = state.cvssData.versions[state.version];
        const metrics = versionData.metrics;

        for (const groupName of state.cvssData.groupOrder) {
            const groupMetrics = metrics[groupName];
            if (!groupMetrics) continue;

            for (const [metricKey, metric] of Object.entries(groupMetrics)) {
                const value = state.values[metricKey];
                if (value !== undefined) {
                    const metricI18n = state.i18n.metrics[metricKey] || {};
                    const valueI18n = metricI18n.values?.[value] || {};
                    const metricName = metricI18n.name || metric.name;
                    const valueName = valueI18n.name || metric.values[value]?.name || value;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">${metricName}</td>
                        <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">${value} (${valueName})</td>
                        <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">${valueI18n.description || ''}</td>
                    `;
                    tableBody.appendChild(row);
                }
            }
        }
    }

    // ===== 工具函数 =====
    function showToast(message, type = 'success') {
        elements.toast.textContent = message;
        elements.toast.className = `toast ${type}`;

        requestAnimationFrame(() => {
            elements.toast.classList.add('show');
        });

        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }

    // 全局函数
    window.toggleGroup = function(groupName) {
        const group = document.querySelector(`.metric-group[data-group="${groupName}"]`);
        if (group) {
            group.classList.toggle('collapsed');
        }
    };

    // 启动
    document.addEventListener('DOMContentLoaded', init);
})();

// Threat Modeling Workshop - JavaScript
(function() {
    'use strict';

    // State
    let state = {
        currentStep: 1,
        projectName: '',
        systemDescription: '',
        components: '',
        dataFlow: '',
        trustBoundaries: '',
        threats: [],
        mitigations: [],
        language: 'zh'
    };

    // i18n translations
    const i18n = {
        zh: {
            // Header
            title: '威胁建模工作坊',
            subtitle: '4-Question Framework for Security',

            // Step titles
            step1Title: '我们在构建什么？',
            step2Title: '什么地方会出错？',
            step3Title: '我们要怎么做？',
            step4Title: '我们做得怎么样？',
            step1Subtitle: 'What are we building?',
            step2Subtitle: 'What can go wrong?',
            step3Subtitle: 'What are we going to do?',
            step4Subtitle: 'Did we do a good job?',

            // Step 1 - System Overview
            systemOverview: '系统概述',
            projectName: '项目/系统名称',
            projectNamePlaceholder: '例如：用户认证系统',
            systemDescription: '系统描述',
            systemDescriptionPlaceholder: '简要描述系统的功能、用途和目标用户...',
            components: '核心组件（每行一个）',
            componentsPlaceholder: '例如：\n- Web前端（React）\n- API网关\n- 用户服务\n- 数据库（PostgreSQL）',
            dataFlow: '数据流描述',
            dataFlowPlaceholder: '描述数据如何在系统中流动，例如：用户 -> 前端 -> API -> 数据库',
            trustBoundaries: '信任边界',
            trustBoundariesPlaceholder: '列出系统的信任边界，例如：\n- 互联网与内网之间\n- 用户设备与服务器之间',
            diagramTip: '提示：可使用 draw.io 或 Lucid Chart 等工具绘制数据流图',

            // Step 2 - Threat Identification
            threatIdentification: '威胁识别',
            threatIdSubtitle: '使用 STRIDE 模型识别潜在威胁',
            threatListEmpty: '暂无威胁，点击下方添加',

            // Add threat form
            addThreat: '添加新威胁',
            threatType: '威胁类型',
            threatTitle: '威胁标题',
            threatTitlePlaceholder: '威胁标题',
            threatDescription: '详细描述',
            threatDescriptionPlaceholder: '详细描述这个威胁...',
            affectedComponent: '受影响的组件',
            affectedComponentPlaceholder: '受影响的组件',
            addThreatBtn: '添加威胁',

            // Step 3 - Mitigation
            mitigation: '缓解措施',
            mitigationSubtitle: '为每个威胁制定缓解策略',
            totalThreats: '总威胁数',
            mitigated: '已缓解',
            riskLevel: '风险等级',
            riskLow: '低',
            riskMedium: '中',
            riskHigh: '高',
            severityCritical: '严重',
            severityHigh: '高',
            severityMedium: '中',
            severityLow: '低',
            mitigationStrategy: '缓解措施',
            mitigationStrategyPlaceholder: '描述缓解措施...',
            owner: '负责人',
            ownerPlaceholder: '负责人',
            deadline: '截止日期',
            deadlinePlaceholder: '截止日期',
            save: '保存',
            edit: '编辑',
            delete: '删除',
            addMitigation: '添加缓解措施',
            mitigationListEmpty: '暂无威胁数据，请先完成第二步',

            // Step 4 - Review
            review: '评审与验证',
            reviewSubtitle: '检查威胁建模的完整性和有效性',
            checklist: '检查清单',
            check1: '系统组件已完整列出',
            check2: '数据流已清晰描述',
            check3: '信任边界已识别',
            check4: '所有 STRIDE 类别都有威胁',
            check5: '每个威胁都有缓解措施',
            check6: '缓解措施已分配责任人',
            check7: '缓解措施有明确的截止日期',
            severitySummary: '按严重程度',
            strideSummary: '按 STRIDE 分类',
            reviewNotes: '评审结论',
            reviewNotesPlaceholder: '记录评审过程中的发现、遗留问题和后续行动项...',
            exportJson: '导出 JSON',
            exportMarkdown: '导出 Markdown',
            startOver: '重新开始',

            // Navigation
            next: '下一步',
            prev: '上一步',

            // Confirmations
            resetConfirm: '确定要重新开始吗？所有数据将被清除。'
        },
        en: {
            // Header
            title: 'Threat Modeling Workshop',
            subtitle: '4-Question Framework for Security',

            // Step titles
            step1Title: 'What are we building?',
            step2Title: 'What can go wrong?',
            step3Title: 'What are we going to do?',
            step4Title: 'Did we do a good job?',
            step1Subtitle: 'What are we building?',
            step2Subtitle: 'What can go wrong?',
            step3Subtitle: 'What are we going to do?',
            step4Subtitle: 'Did we do a good job?',

            // Step 1 - System Overview
            systemOverview: 'System Overview',
            projectName: 'Project/System Name',
            projectNamePlaceholder: 'e.g., User Authentication System',
            systemDescription: 'System Description',
            systemDescriptionPlaceholder: 'Briefly describe the system functions, purpose, and target users...',
            components: 'Core Components (one per line)',
            componentsPlaceholder: 'e.g.,\n- Web Frontend (React)\n- API Gateway\n- User Service\n- Database (PostgreSQL)',
            dataFlow: 'Data Flow Description',
            dataFlowPlaceholder: 'Describe how data flows through the system, e.g., User -> Frontend -> API -> Database',
            trustBoundaries: 'Trust Boundaries',
            trustBoundariesPlaceholder: 'List trust boundaries, e.g.:\n- Between internet and internal network\n- Between user device and server',
            diagramTip: 'Tip: Use draw.io or Lucid Chart to draw data flow diagrams',

            // Step 2 - Threat Identification
            threatIdentification: 'Threat Identification',
            threatIdSubtitle: 'Identify potential threats using the STRIDE model',
            threatListEmpty: 'No threats yet, click below to add',

            // Add threat form
            addThreat: 'Add New Threat',
            threatType: 'Threat Type',
            threatTitle: 'Threat Title',
            threatTitlePlaceholder: 'Threat title',
            threatDescription: 'Description',
            threatDescriptionPlaceholder: 'Describe this threat in detail...',
            affectedComponent: 'Affected Component',
            affectedComponentPlaceholder: 'Affected component',
            addThreatBtn: 'Add Threat',

            // Step 3 - Mitigation
            mitigation: 'Mitigation',
            mitigationSubtitle: 'Develop mitigation strategies for each threat',
            totalThreats: 'Total Threats',
            mitigated: 'Mitigated',
            riskLevel: 'Risk Level',
            riskLow: 'Low',
            riskMedium: 'Medium',
            riskHigh: 'High',
            severityCritical: 'Critical',
            severityHigh: 'High',
            severityMedium: 'Medium',
            severityLow: 'Low',
            mitigationStrategy: 'Mitigation Strategy',
            mitigationStrategyPlaceholder: 'Describe the mitigation strategy...',
            owner: 'Owner',
            ownerPlaceholder: 'Owner',
            deadline: 'Deadline',
            deadlinePlaceholder: 'Deadline',
            save: 'Save',
            edit: 'Edit',
            delete: 'Delete',
            addMitigation: 'Add Mitigation',
            mitigationListEmpty: 'No threat data yet, please complete Step 2 first',

            // Step 4 - Review
            review: 'Review & Verification',
            reviewSubtitle: 'Check the completeness and effectiveness of threat modeling',
            checklist: 'Checklist',
            check1: 'System components are fully listed',
            check2: 'Data flow is clearly described',
            check3: 'Trust boundaries are identified',
            check4: 'All STRIDE categories have threats',
            check5: 'Each threat has mitigation measures',
            check6: 'Mitigation measures are assigned to owners',
            check7: 'Mitigation measures have clear deadlines',
            severitySummary: 'By Severity',
            strideSummary: 'By STRIDE Category',
            reviewNotes: 'Review Notes',
            reviewNotesPlaceholder: 'Record findings, open issues, and action items from the review...',
            exportJson: 'Export JSON',
            exportMarkdown: 'Export Markdown',
            startOver: 'Start Over',

            // Navigation
            next: 'Next',
            prev: 'Previous',

            // Confirmations
            resetConfirm: 'Are you sure you want to start over? All data will be cleared.'
        }
    };

    // DOM Elements
    const steps = document.querySelectorAll('.step');
    const panels = document.querySelectorAll('.panel');

    // Step navigation
    const step1Next = document.getElementById('step1Next');
    const step2Prev = document.getElementById('step2Prev');
    const step2Next = document.getElementById('step2Next');
    const step3Prev = document.getElementById('step3Prev');
    const step3Next = document.getElementById('step3Next');
    const step4Prev = document.getElementById('step4Prev');
    const startOver = document.getElementById('startOver');

    // Form elements
    const projectName = document.getElementById('projectName');
    const systemDescription = document.getElementById('systemDescription');
    const components = document.getElementById('components');
    const dataFlow = document.getElementById('dataFlow');
    const trustBoundaries = document.getElementById('trustBoundaries');

    // Threat elements
    const threatList = document.getElementById('threatList');
    const threatType = document.getElementById('threatType');
    const threatTitle = document.getElementById('threatTitle');
    const threatDescription = document.getElementById('threatDescription');
    const threatAffectedComponent = document.getElementById('threatAffectedComponent');
    const addThreatBtn = document.getElementById('addThreat');

    // Mitigation elements
    const mitigationList = document.getElementById('mitigationList');
    const totalThreats = document.getElementById('totalThreats');
    const mitigatedThreats = document.getElementById('mitigatedThreats');
    const riskLevel = document.getElementById('riskLevel');

    // Review elements
    const reviewNotes = document.getElementById('reviewNotes');

    // STRIDE type mapping
    const strideTypes = {
        spoofing: { name: 'Spoofing', nameZh: '欺骗', icon: '🎭' },
        tampering: { name: 'Tampering', nameZh: '篡改', icon: '🔧' },
        repudiation: { name: 'Repudiation', nameZh: '抵赖', icon: '📝' },
        informationDisclosure: { name: 'Info Disclosure', nameZh: '信息泄露', icon: '👁️' },
        denialOfService: { name: 'DoS', nameZh: '拒绝服务', icon: '🛑' },
        elevationOfPrivilege: { name: 'Elevation', nameZh: '权限提升', icon: '⬆️' }
    };

    // Initialize
    function init() {
        setupStepNavigation();
        setupThreatForm();
        setupExport();
        setupLanguage();
        loadFromStorage();
    }

    // DFD (Data Flow Diagram) Setup
    function setupDfd() {
        const dfdCanvas = document.getElementById('dfdCanvas');
        const dfdButtons = document.querySelectorAll('.dfd-btn[data-type]');
        const clearDfdBtn = document.getElementById('clearDfd');

        if (!dfdCanvas || dfdButtons.length === 0) return;

        let dfdElements = [];
        let selectedType = null;

        const elementConfigs = {
            external: { icon: '⬜', label: '外部实体', color: '#60a5fa' },
            process: { icon: '⭕', label: '进程', color: '#a78bfa' },
            dataStore: { icon: '📀', label: '数据存储', color: '#34d399' },
            dataFlow: { icon: '➡️', label: '数据流', color: '#f59e0b' }
        };

        // Remove placeholder if exists
        const placeholder = dfdCanvas.querySelector('.dfd-placeholder');
        if (placeholder) placeholder.remove();

        // Setup button click handlers
        dfdButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedType = btn.dataset.type;

                // Visual feedback
                dfdButtons.forEach(b => b.style.borderColor = '');
                btn.style.borderColor = elementConfigs[selectedType].color;
            });
        });

        // Clear button
        if (clearDfdBtn) {
            clearDfdBtn.addEventListener('click', () => {
                dfdElements = [];
                renderDfd();
            });
        }

        // Canvas click to add element
        dfdCanvas.addEventListener('click', (e) => {
            if (!selectedType) return;
            if (e.target !== dfdCanvas && !e.target.classList.contains('dfd-element')) return;

            const rect = dfdCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const config = elementConfigs[selectedType];
            const name = prompt(`${config.label} 名称:`, '');
            if (!name) return;

            dfdElements.push({
                id: Date.now(),
                type: selectedType,
                name: name,
                x: x,
                y: y
            });

            renderDfd();
            saveDfdToStorage();
        });

        // Render DFD elements
        function renderDfd() {
            // Clear canvas but keep container
            dfdCanvas.innerHTML = '';

            if (dfdElements.length === 0) {
                dfdCanvas.innerHTML = '<div class="dfd-placeholder"><p>点击下方按钮选择元素类型，然后点击画布添加</p></div>';
                return;
            }

            dfdElements.forEach((el, index) => {
                const config = elementConfigs[el.type];
                const div = document.createElement('div');
                div.className = 'dfd-element';
                div.style.cssText = `
                    position: absolute;
                    left: ${el.x}px;
                    top: ${el.y}px;
                    transform: translate(-50%, -50%);
                    background: ${config.color}22;
                    border: 2px solid ${config.color};
                    border-radius: 8px;
                    padding: 0.4rem 0.6rem;
                    font-size: 0.75rem;
                    color: var(--text);
                    cursor: move;
                    white-space: nowrap;
                    z-index: 1;
                `;
                div.innerHTML = `<span>${config.icon}</span> ${el.name}`;

                // Drag functionality
                let isDragging = false;
                let startX, startY, origX, origY;

                div.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    origX = el.x;
                    origY = el.y;
                    div.style.zIndex = 10;
                });

                document.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    el.x = origX + dx;
                    el.y = origY + dy;
                    div.style.left = el.x + 'px';
                    div.style.top = el.y + 'px';
                });

                document.addEventListener('mouseup', () => {
                    if (isDragging) {
                        isDragging = false;
                        div.style.zIndex = 1;
                        saveDfdToStorage();
                    }
                });

                // Right click to delete
                div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (confirm(`删除 "${el.name}"?`)) {
                        dfdElements.splice(index, 1);
                        renderDfd();
                        saveDfdToStorage();
                    }
                });

                dfdCanvas.appendChild(div);
            });

            // Draw connections (data flows)
            const dataFlows = dfdElements.filter(el => el.type === 'dataFlow');
            if (dataFlows.length >= 2) {
                // Simple connection lines
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
                dfdCanvas.appendChild(svg);

                for (let i = 0; i < dataFlows.length - 1; i++) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', dataFlows[i].x);
                    line.setAttribute('y1', dataFlows[i].y);
                    line.setAttribute('x2', dataFlows[i+1].x);
                    line.setAttribute('y2', dataFlows[i+1].y);
                    line.setAttribute('stroke', elementConfigs.dataFlow.color);
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('stroke-dasharray', '5,5');
                    svg.appendChild(line);
                }
            }
        }

        // Save to localStorage
        function saveDfdToStorage() {
            localStorage.setItem('threatModelDfd', JSON.stringify(dfdElements));
        }

        // Load from localStorage
        const savedDfd = localStorage.getItem('threatModelDfd');
        if (savedDfd) {
            dfdElements = JSON.parse(savedDfd);
        }

        // Initial render
        renderDfd();

        // Make functions globally available
        window.renderDfd = renderDfd;
        window.saveDfdToStorage = saveDfdToStorage;
    }

    // Step navigation
    function setupStepNavigation() {
        steps.forEach(step => {
            step.addEventListener('click', () => {
                const targetStep = parseInt(step.dataset.step);
                goToStep(targetStep);
            });
        });

        if (step1Next) {
            step1Next.addEventListener('click', function() {
                saveStep1();
                goToStep(2);
            });
        }
        if (step2Prev) step2Prev.addEventListener('click', () => goToStep(1));
        if (step2Next) step2Next.addEventListener('click', () => goToStep(3));
        if (step3Prev) step3Prev.addEventListener('click', () => goToStep(2));
        if (step3Next) step3Next.addEventListener('click', () => goToStep(4));
        if (step4Prev) step4Prev.addEventListener('click', () => goToStep(3));
        if (startOver) startOver.addEventListener('click', resetAll);
    }

    // Go to specific step
    function goToStep(step) {
        state.currentStep = step;

        steps.forEach(s => s.classList.remove('active'));
        document.querySelector(`.step[data-step="${step}"]`).classList.add('active');

        panels.forEach(p => p.classList.remove('active'));
        document.getElementById(`step${step}`).classList.add('active');

        // Update content for step 3 and 4
        if (step === 3) renderMitigations();
        if (step === 4) renderReview();

        saveToStorage();
    }

    // Save Step 1
    function saveStep1() {
        state.projectName = projectName.value;
        state.systemDescription = systemDescription.value;
        state.components = components.value;
        state.dataFlow = dataFlow.value;
        state.trustBoundaries = trustBoundaries.value;
        return true;
    }

    // Setup threat form
    function setupThreatForm() {
        addThreatBtn.addEventListener('click', addThreat);

        // STRIDE card click
        document.querySelectorAll('.stride-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.stride-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                threatType.value = card.dataset.type;
            });
        });
    }

    // Add threat
    function addThreat() {
        const type = threatType.value;
        const title = threatTitle.value.trim();
        const description = threatDescription.value.trim();
        const component = threatAffectedComponent.value.trim();

        if (!title) {
            threatTitle.focus();
            return;
        }

        const threat = {
            id: Date.now(),
            type,
            title,
            description,
            component,
            severity: 'medium'
        };

        state.threats.push(threat);
        renderThreats();

        // Clear form
        threatTitle.value = '';
        threatDescription.value = '';
        threatAffectedComponent.value = '';
    }

    // Render threats
    function renderThreats() {
        if (state.threats.length === 0) {
            threatList.innerHTML = `<div class="empty-state"><p>${i18n[state.language].threatListEmpty}</p></div>`;
            return;
        }

        threatList.innerHTML = state.threats.map(threat => {
            const typeInfo = strideTypes[threat.type];
            return `
                <div class="threat-item" data-id="${threat.id}">
                    <div class="threat-header">
                        <span class="threat-type">
                            ${typeInfo.icon} ${state.language === 'zh' ? typeInfo.nameZh : typeInfo.name}
                        </span>
                        <button class="threat-delete" onclick="deleteThreat(${threat.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="threat-title">${threat.title}</div>
                    ${threat.description ? `<div class="threat-description">${threat.description}</div>` : ''}
                    ${threat.component ? `<div class="threat-component">${i18n[state.language].affectedComponent}: ${threat.component}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // Delete threat
    window.deleteThreat = function(id) {
        state.threats = state.threats.filter(t => t.id !== id);
        renderThreats();
        renderMitigations();
        saveToStorage();
    };

    // Render mitigations
    function renderMitigations() {
        const t = i18n[state.language];
        totalThreats.textContent = state.threats.length;

        const mitigated = state.mitigations.filter(m => m.strategy && m.strategy.trim()).length;
        mitigatedThreats.textContent = mitigated;

        // Calculate risk level
        if (state.threats.length === 0) {
            riskLevel.textContent = '-';
        } else {
            const ratio = mitigated / state.threats.length;
            if (ratio >= 0.8) riskLevel.textContent = '🟢 ' + t.riskLow;
            else if (ratio >= 0.5) riskLevel.textContent = '🟡 ' + t.riskMedium;
            else riskLevel.textContent = '🔴 ' + t.riskHigh;
        }

        if (state.threats.length === 0) {
            mitigationList.innerHTML = `<div class="empty-state"><p>${t.mitigationListEmpty}</p></div>`;
            return;
        }

        mitigationList.innerHTML = state.threats.map(threat => {
            const mitigation = state.mitigations.find(m => m.threatId === threat.id) || { threatId: threat.id };
            const typeInfo = strideTypes[threat.type];

            if (mitigation.editing) {
                return `
                    <div class="mitigation-item">
                        <div class="mitigation-header">
                            <div>
                                <span class="mitigation-threat">${threat.title}</span>
                                <span class="mitigation-type-badge">${typeInfo.icon} ${state.language === 'zh' ? typeInfo.nameZh : typeInfo.name}</span>
                            </div>
                            <select class="severity-select ${mitigation.severity}" onchange="updateSeverity(${threat.id}, this.value)">
                                <option value="critical" ${mitigation.severity === 'critical' ? 'selected' : ''}>${t.severityCritical}</option>
                                <option value="high" ${mitigation.severity === 'high' ? 'selected' : ''}>${t.severityHigh}</option>
                                <option value="medium" ${mitigation.severity === 'medium' ? 'selected' : ''}>${t.severityMedium}</option>
                                <option value="low" ${mitigation.severity === 'low' ? 'selected' : ''}>${t.severityLow}</option>
                            </select>
                        </div>
                        <div class="mitigation-form">
                            <textarea id="strategy-${threat.id}" placeholder="${t.mitigationStrategyPlaceholder}">${mitigation.strategy || ''}</textarea>
                            <div class="mitigation-form-row">
                                <input type="text" id="owner-${threat.id}" placeholder="${t.ownerPlaceholder}" value="${mitigation.owner || ''}">
                                <input type="text" id="deadline-${threat.id}" placeholder="${t.deadlinePlaceholder}" value="${mitigation.deadline || ''}">
                            </div>
                            <button class="btn primary small" onclick="saveMitigation(${threat.id})">${t.save}</button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="mitigation-item">
                    <div class="mitigation-header">
                        <div>
                            <span class="mitigation-threat">${threat.title}</span>
                            <span class="mitigation-type-badge">${typeInfo.icon} ${state.language === 'zh' ? typeInfo.nameZh : typeInfo.name}</span>
                        </div>
                        <select class="severity-select ${mitigation.severity || 'medium'}" onchange="updateSeverity(${threat.id}, this.value)">
                            <option value="critical" ${(mitigation.severity || 'medium') === 'critical' ? 'selected' : ''}>${t.severityCritical}</option>
                            <option value="high" ${(mitigation.severity || 'medium') === 'high' ? 'selected' : ''}>${t.severityHigh}</option>
                            <option value="medium" ${(mitigation.severity || 'medium') === 'medium' ? 'selected' : ''}>${t.severityMedium}</option>
                            <option value="low" ${(mitigation.severity || 'medium') === 'low' ? 'selected' : ''}>${t.severityLow}</option>
                        </select>
                    </div>
                    ${mitigation.strategy ? `
                        <div class="mitigation-saved">
                            <p>${mitigation.strategy}</p>
                            <div class="mitigation-meta">
                                ${mitigation.owner ? `👤 ${mitigation.owner}` : ''}
                                ${mitigation.deadline ? ` 📅 ${mitigation.deadline}` : ''}
                            </div>
                            <div class="mitigation-actions">
                                <button class="btn-edit" onclick="editMitigation(${threat.id})">${t.edit}</button>
                                <button class="btn-delete" onclick="deleteMitigation(${threat.id})">${t.delete}</button>
                            </div>
                        </div>
                    ` : `
                        <button class="btn secondary small" onclick="editMitigation(${threat.id})">${t.addMitigation}</button>
                    `}
                </div>
            `;
        }).join('');
    }

    // Update severity
    window.updateSeverity = function(threatId, severity) {
        let mitigation = state.mitigations.find(m => m.threatId === threatId);
        if (!mitigation) {
            mitigation = { threatId, severity: 'medium' };
            state.mitigations.push(mitigation);
        }
        mitigation.severity = severity;
        renderMitigations();
        saveToStorage();
    };

    // Edit mitigation
    window.editMitigation = function(threatId) {
        let mitigation = state.mitigations.find(m => m.threatId === threatId);
        if (!mitigation) {
            mitigation = { threatId, severity: 'medium', editing: true };
            state.mitigations.push(mitigation);
        } else {
            mitigation.editing = true;
        }
        renderMitigations();
    };

    // Save mitigation
    window.saveMitigation = function(threatId) {
        const strategy = document.getElementById(`strategy-${threatId}`).value;
        const owner = document.getElementById(`owner-${threatId}`).value;
        const deadline = document.getElementById(`deadline-${threatId}`).value;

        let mitigation = state.mitigations.find(m => m.threatId === threatId);
        if (!mitigation) {
            mitigation = { threatId };
            state.mitigations.push(mitigation);
        }

        mitigation.strategy = strategy;
        mitigation.owner = owner;
        mitigation.deadline = deadline;
        mitigation.editing = false;

        renderMitigations();
        saveToStorage();
    };

    // Delete mitigation
    window.deleteMitigation = function(threatId) {
        state.mitigations = state.mitigations.filter(m => m.threatId !== threatId);
        renderMitigations();
        saveToStorage();
    };

    // Render review
    function renderReview() {
        // Severity distribution
        const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
        const strideCounts = { spoofing: 0, tampering: 0, repudiation: 0, informationDisclosure: 0, denialOfService: 0, elevationOfPrivilege: 0 };

        state.threats.forEach(threat => {
            const mitigation = state.mitigations.find(m => m.threatId === threat.id);
            const severity = mitigation?.severity || 'medium';
            severityCounts[severity]++;
            strideCounts[threat.type]++;
        });

        const maxSeverity = Math.max(...Object.values(severityCounts), 1);

        document.getElementById('criticalBar').style.width = `${(severityCounts.critical / maxSeverity) * 100}%`;
        document.getElementById('highBar').style.width = `${(severityCounts.high / maxSeverity) * 100}%`;
        document.getElementById('mediumBar').style.width = `${(severityCounts.medium / maxSeverity) * 100}%`;
        document.getElementById('lowBar').style.width = `${(severityCounts.low / maxSeverity) * 100}%`;

        document.getElementById('criticalCount').textContent = severityCounts.critical;
        document.getElementById('highCount').textContent = severityCounts.high;
        document.getElementById('mediumCount').textContent = severityCounts.medium;
        document.getElementById('lowCount').textContent = severityCounts.low;

        // STRIDE chart
        const maxStride = Math.max(...Object.values(strideCounts), 1);
        const strideChart = document.getElementById('strideChart');

        strideChart.innerHTML = Object.entries(strideCounts).map(([type, count]) => {
            const typeInfo = strideTypes[type];
            return `
                <div class="stride-row">
                    <span class="stride-row-label">${typeInfo.icon} ${typeInfo.nameZh}</span>
                    <div class="stride-row-bar">
                        <div class="stride-row-fill" style="width: ${(count / maxStride) * 100}%"></div>
                    </div>
                    <span class="stride-row-count">${count}</span>
                </div>
            `;
        }).join('');
    }

    // Setup export
    function setupExport() {
        document.getElementById('exportJson').addEventListener('click', exportJson);
        document.getElementById('exportMarkdown').addEventListener('click', exportMarkdown);
    }

    // Export JSON
    function exportJson() {
        const data = {
            projectName: state.projectName,
            systemDescription: state.systemDescription,
            components: state.components,
            dataFlow: state.dataFlow,
            trustBoundaries: state.trustBoundaries,
            threats: state.threats,
            mitigations: state.mitigations,
            reviewNotes: reviewNotes.value,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `threat-model-${Date.now()}.json`);
    }

    // Export Markdown
    function exportMarkdown() {
        let md = `# 威胁建模报告\n\n`;
        md += `**项目**: ${state.projectName || '未命名'}\n\n`;
        md += `**系统描述**: ${state.systemDescription || '-'}\n\n`;
        md += `## 系统组件\n\n${state.components || '-'}\n\n`;
        md += `## 数据流\n\n${state.dataFlow || '-'}\n\n`;
        md += `## 信任边界\n\n${state.trustBoundaries || '-'}\n\n`;
        md += `## 威胁列表\n\n`;

        state.threats.forEach(threat => {
            const typeInfo = strideTypes[threat.type];
            const mitigation = state.mitigations.find(m => m.threatId === threat.id);
            md += `### ${typeInfo.icon} ${threat.title}\n`;
            md += `- **类型**: ${typeInfo.nameZh} (${typeInfo.name})\n`;
            md += `- **严重程度**: ${mitigation?.severity || 'medium'}\n`;
            if (threat.description) md += `- **描述**: ${threat.description}\n`;
            if (threat.component) md += `- **影响组件**: ${threat.component}\n`;
            if (mitigation?.strategy) md += `- **缓解措施**: ${mitigation.strategy}\n`;
            if (mitigation?.owner) md += `- **负责人**: ${mitigation.owner}\n`;
            if (mitigation?.deadline) md += `- **截止日期**: ${mitigation.deadline}\n`;
            md += `\n`;
        });

        md += `## 评审结论\n\n${reviewNotes.value || '无'}\n`;

        const blob = new Blob([md], { type: 'text/markdown' });
        downloadBlob(blob, `threat-model-${Date.now()}.md`);
    }

    // Download blob
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Apply translations to UI
    function applyTranslations() {
        const t = i18n[state.language];

        // Header
        document.querySelector('header h1').textContent = t.title;
        document.querySelector('.subtitle').textContent = t.subtitle;

        // Step titles
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            const titleKey = `step${stepNum}Title`;
            const subtitleKey = `step${stepNum}Subtitle`;
            step.querySelector('.step-title').textContent = t[titleKey];
            step.querySelector('.step-subtitle').textContent = t[subtitleKey];
        });

        // Panel headers
        const panelHeaders = document.querySelectorAll('.panel-header');
        if (panelHeaders[0]) {
            panelHeaders[0].querySelector('h2').textContent = t.systemOverview + ' 📦';
            panelHeaders[0].querySelector('p').textContent = t.step1Subtitle;
        }
        if (panelHeaders[1]) {
            panelHeaders[1].querySelector('h2').textContent = t.threatIdentification + ' 🔍';
            panelHeaders[1].querySelector('p').textContent = t.threatIdSubtitle;
        }
        if (panelHeaders[2]) {
            panelHeaders[2].querySelector('h2').textContent = t.mitigation + ' 🛡️';
            panelHeaders[2].querySelector('p').textContent = t.mitigationSubtitle;
        }
        if (panelHeaders[3]) {
            panelHeaders[3].querySelector('h2').textContent = t.review + ' ✅';
            panelHeaders[3].querySelector('p').textContent = t.reviewSubtitle;
        }

        // Form labels
        const formLabels = document.querySelectorAll('.form-section label');
        if (formLabels[0]) formLabels[0].textContent = t.projectName;
        if (formLabels[1]) formLabels[1].textContent = t.systemDescription;
        if (formLabels[2]) formLabels[2].textContent = t.components;
        if (formLabels[3]) formLabels[3].textContent = t.dataFlow;
        if (formLabels[4]) formLabels[4].textContent = t.trustBoundaries;

        // Placeholders
        document.getElementById('projectName').placeholder = t.projectNamePlaceholder;
        document.getElementById('systemDescription').placeholder = t.systemDescriptionPlaceholder;
        document.getElementById('components').placeholder = t.componentsPlaceholder;
        document.getElementById('dataFlow').placeholder = t.dataFlowPlaceholder;
        document.getElementById('trustBoundaries').placeholder = t.trustBoundariesPlaceholder;

        // Diagram tip
        const diagramTip = document.querySelector('.diagram-tip p');
        if (diagramTip) {
            const linkText = state.language === 'zh' ? 'draw.io' : 'draw.io';
            diagramTip.innerHTML = state.language === 'zh'
                ? `💡 提示：可使用 <a href="https://app.diagrams.net/" target="_blank">${linkText}</a> 或 Lucid Chart 等工具绘制数据流图`
                : `💡 Tip: Use <a href="https://app.diagrams.net/" target="_blank">${linkText}</a> or Lucid Chart to draw data flow diagrams`;
        }

        // Navigation buttons
        document.getElementById('step1Next').textContent = t.next + ' →';
        document.getElementById('step2Prev').textContent = '← ' + t.prev;
        document.getElementById('step2Next').textContent = t.next + ' →';
        document.getElementById('step3Prev').textContent = '← ' + t.prev;
        document.getElementById('step3Next').textContent = t.next + ' →';
        document.getElementById('step4Prev').textContent = '← ' + t.prev;
        document.getElementById('startOver').textContent = '🔄 ' + t.startOver;

        // Add threat form
        document.querySelector('.add-threat-form h3').textContent = '➕ ' + t.addThreat;
        document.getElementById('threatTitle').placeholder = t.threatTitlePlaceholder;
        document.getElementById('threatDescription').placeholder = t.threatDescriptionPlaceholder;
        document.getElementById('threatAffectedComponent').placeholder = t.affectedComponentPlaceholder;
        document.getElementById('addThreat').textContent = t.addThreatBtn;

        // Mitigation labels
        const mitigationStatLabels = document.querySelectorAll('.stat-label');
        if (mitigationStatLabels[0]) mitigationStatLabels[0].textContent = t.totalThreats;
        if (mitigationStatLabels[1]) mitigationStatLabels[1].textContent = t.mitigated;
        if (mitigationStatLabels[2]) mitigationStatLabels[2].textContent = t.riskLevel;

        // Review section
        const reviewSections = document.querySelectorAll('.review-section');
        if (reviewSections[0]) reviewSections[0].querySelector('h3').textContent = '📋 ' + t.checklist;
        if (reviewSections[1]) reviewSections[1].querySelector('h3').textContent = '📊 ' + t.severitySummary;
        if (reviewSections[2]) reviewSections[2].querySelector('h3').textContent = '📊 ' + t.strideSummary;
        if (reviewSections[3]) {
            reviewSections[3].querySelector('h3').textContent = '📝 ' + t.reviewNotes;
            document.getElementById('reviewNotes').placeholder = t.reviewNotesPlaceholder;
        }

        // Checklist
        const checkItems = document.querySelectorAll('.checklist-item span');
        if (checkItems[0]) checkItems[0].textContent = t.check1;
        if (checkItems[1]) checkItems[1].textContent = t.check2;
        if (checkItems[2]) checkItems[2].textContent = t.check3;
        if (checkItems[3]) checkItems[3].textContent = t.check4;
        if (checkItems[4]) checkItems[4].textContent = t.check5;
        if (checkItems[5]) checkItems[5].textContent = t.check6;
        if (checkItems[6]) checkItems[6].textContent = t.check7;

        // Export buttons
        document.getElementById('exportJson').innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> ${t.exportJson}`;
        document.getElementById('exportMarkdown').innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> ${t.exportMarkdown}`;

        // Update document lang attribute
        document.documentElement.lang = state.language;
    }

    // Setup language
    function setupLanguage() {
        // Apply initial translations
        applyTranslations();

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.language = btn.dataset.lang;
                applyTranslations();
                renderThreats();
                renderMitigations();
            });
        });
    }

    // Save to localStorage
    function saveToStorage() {
        localStorage.setItem('threatModelData', JSON.stringify(state));
    }

    // Load from localStorage
    function loadFromStorage() {
        const saved = localStorage.getItem('threatModelData');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(state, data);

            // Populate form
            projectName.value = state.projectName;
            systemDescription.value = state.systemDescription;
            components.value = state.components;
            dataFlow.value = state.dataFlow;
            trustBoundaries.value = state.trustBoundaries;
            reviewNotes.value = data.reviewNotes || '';

            renderThreats();
        }
    }

    // Reset all
    function resetAll() {
        if (confirm(i18n[state.language].resetConfirm)) {
            localStorage.removeItem('threatModelData');
            state = {
                currentStep: 1,
                projectName: '',
                systemDescription: '',
                components: '',
                dataFlow: '',
                trustBoundaries: '',
                threats: [],
                mitigations: [],
                language: state.language
            };

            // Clear forms
            projectName.value = '';
            systemDescription.value = '';
            components.value = '';
            dataFlow.value = '';
            trustBoundaries.value = '';
            reviewNotes.value = '';

            threatTitle.value = '';
            threatDescription.value = '';
            threatAffectedComponent.value = '';

            renderThreats();
            goToStep(1);
        }
    }

    // Initialize
    init();
})();

// Cron 表达式解析器
(function() {
    'use strict';

    // ===== 常量定义 =====
    const FIELD_INFO = {
        second: { name: '秒', range: [0, 59], shortName: '秒' },
        minute: { name: '分钟', range: [0, 59], shortName: '分' },
        hour: { name: '小时', range: [0, 23], shortName: '时' },
        day: { name: '日', range: [1, 31], shortName: '日' },
        month: { name: '月', range: [1, 12], shortName: '月' },
        weekday: { name: '周', range: [0, 6], shortName: '周' }
    };

    const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const MONTH_NAMES = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

    // ===== DOM 元素 =====
    const elements = {
        // 输入
        cronInput: document.getElementById('cronInput'),
        parseBtn: document.getElementById('parseBtn'),
        copyBtn: document.getElementById('copyBtn'),
        errorMsg: document.getElementById('errorMsg'),

        // 字段切换
        field5: document.getElementById('field5'),
        field6: document.getElementById('field6'),

        // 解析结果
        parseResult: document.getElementById('parseResult'),
        fieldsContainer: document.getElementById('fieldsContainer'),
        humanText: document.getElementById('humanText'),

        // 下次执行
        nextTimes: document.getElementById('nextTimes'),
        nextTimesList: document.getElementById('nextTimesList'),

        // 构建器
        builderFields: document.getElementById('builderFields'),
        buildBtn: document.getElementById('buildBtn'),

        // 预设
        presetsGrid: document.querySelector('.presets-grid')
    };

    // ===== 状态 =====
    let state = {
        fieldCount: 5,  // 5 或 6
        parsedCron: null
    };

    // ===== Cron 解析器 =====
    function parseCronExpression(expression) {
        const parts = expression.trim().split(/\s+/);
        const expectedParts = state.fieldCount;

        if (parts.length !== expectedParts) {
            throw new Error(`表达式需要 ${expectedParts} 个字段，但找到了 ${parts.length} 个`);
        }

        let second = null, minute, hour, day, month, weekday;

        if (expectedParts === 6) {
            [second, minute, hour, day, month, weekday] = parts;
        } else {
            [minute, hour, day, month, weekday] = parts;
        }

        const result = {
            expression: expression,
            fieldCount: expectedParts,
            fields: {}
        };

        if (second !== null) {
            result.fields.second = parseField(second, 'second');
        }
        result.fields.minute = parseField(minute, 'minute');
        result.fields.hour = parseField(hour, 'hour');
        result.fields.day = parseField(day, 'day');
        result.fields.month = parseField(month, 'month');
        result.fields.weekday = parseField(weekday, 'weekday');

        return result;
    }

    function parseField(value, fieldName) {
        const info = FIELD_INFO[fieldName];
        const [min, max] = info.range;

        const result = {
            raw: value,
            values: [],
            description: ''
        };

        if (value === '*') {
            result.values = Array.from({ length: max - min + 1 }, (_, i) => i + min);
            result.description = `每${info.shortName}`;
        } else if (value.includes('/')) {
            const [base, step] = value.split('/');
            const stepNum = parseInt(step, 10);

            if (base === '*') {
                result.values = [];
                for (let i = min; i <= max; i += stepNum) {
                    result.values.push(i);
                }
                result.description = `每${stepNum}${info.shortName}`;
            } else {
                const rangeValues = parseRange(base, min, max);
                result.values = [];
                for (let i = 0; i < rangeValues.length; i += stepNum) {
                    result.values.push(rangeValues[i]);
                }
                result.description = `${rangeValues[0]}${info.shortName}起，每${stepNum}${info.shortName}`;
            }
        } else if (value.includes('-')) {
            result.values = parseRange(value, min, max);
            const [start, end] = value.split('-').map(Number);
            result.description = `${start}到${end}${info.shortName}`;
        } else if (value.includes(',')) {
            result.values = value.split(',').map(Number);
            result.description = result.values.join('、') + info.shortName;
        } else {
            const num = parseInt(value, 10);
            if (isNaN(num) || num < min || num > max) {
                throw new Error(`${info.name}字段值 ${value} 无效，有效范围: ${min}-${max}`);
            }
            result.values = [num];
            result.description = `第${num}${info.shortName}`;
        }

        return result;
    }

    function parseRange(rangeStr, min, max) {
        const [start, end] = rangeStr.split('-').map(Number);
        const values = [];

        const clampedStart = Math.max(min, start);
        const clampedEnd = Math.min(max, end);

        for (let i = clampedStart; i <= clampedEnd; i++) {
            values.push(i);
        }

        return values;
    }

    // ===== 生成人类可读文本 =====
    function generateHumanReadable(parsed) {
        const fields = parsed.fields;
        const parts = [];

        // 秒
        if (fields.second) {
            if (fields.second.raw !== '*') {
                parts.push(fields.second.description);
            }
        }

        // 分钟
        if (fields.minute.raw !== '*') {
            parts.push(fields.minute.description);
        }

        // 小时
        if (fields.hour.raw !== '*') {
            parts.push(fields.hour.description);
        }

        // 日
        if (fields.day.raw !== '*') {
            parts.push(fields.day.description);
        }

        // 月
        if (fields.month.raw !== '*') {
            parts.push(fields.month.description);
        }

        // 周
        if (fields.weekday.raw !== '*') {
            parts.push(fields.weekday.description);
        }

        if (parts.length === 0) {
            return '每分钟执行一次';
        }

        // 构建更自然的描述
        return buildNaturalDescription(fields, parsed.fieldCount);
    }

    function buildNaturalDescription(fields, fieldCount) {
        const desc = [];

        // 处理常见模式
        const minute = fields.minute.raw;
        const hour = fields.hour.raw;
        const day = fields.day.raw;
        const month = fields.month.raw;
        const weekday = fields.weekday.raw;

        // 每分钟
        if (minute === '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
            if (fields.second && fields.second.raw !== '*') {
                return `每分钟的${fields.second.values[0]}秒执行`;
            }
            return '每分钟执行一次';
        }

        // 每小时
        if (minute !== '*' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
            return `每小时的${fields.minute.values.map(v => v + '分').join('、')}执行`;
        }

        // 每天
        if (hour !== '*' && day === '*' && month === '*' && weekday === '*') {
            const times = fields.hour.values.map(h => {
                const minutes = fields.minute.values.map(m => `${h}点${m}分`);
                return minutes.join('、');
            }).flat();
            return `每天${times.join('、')}执行`;
        }

        // 每周
        if (weekday !== '*' && day === '*') {
            const days = fields.weekday.values.map(w => WEEKDAY_NAMES[w]).join('、');
            const times = fields.hour.values.map(h => {
                return `${h}点${fields.minute.values[0]}分`;
            }).join('、');
            return `每${days}的${times}执行`;
        }

        // 每月
        if (day !== '*' && month === '*') {
            const days = fields.day.values.join('日、') + '日';
            const times = fields.hour.values.map(h => {
                return `${h}点${fields.minute.values[0]}分`;
            }).join('、');
            return `每月${days}的${times}执行`;
        }

        // 特定月份
        if (month !== '*') {
            const months = fields.month.values.map(m => MONTH_NAMES[m]).join('、');
            const days = fields.day.raw === '*' ? '每天' : fields.day.values.join('日、') + '日';
            const times = fields.hour.values.map(h => `${h}点${fields.minute.values[0]}分`).join('、');
            return `${months}${days}的${times}执行`;
        }

        // 默认
        return `在${fields.minute.description} ${fields.hour.description} ${fields.day.description} ${fields.month.description} ${fields.weekday.description}执行`;
    }

    // ===== 计算下次执行时间 =====
    function getNextExecutionTimes(parsed, count = 5) {
        const times = [];
        const now = new Date();
        let current = new Date(now);
        current.setMilliseconds(0);

        // 如果有秒字段，从下一秒开始；否则从下一分钟开始
        if (parsed.fieldCount === 6) {
            current.setSeconds(current.getSeconds() + 1);
        } else {
            current.setSeconds(0);
            current.setMinutes(current.getMinutes() + 1);
        }

        const maxIterations = 366 * 24 * 60 * 60; // 最多搜索一年
        let iterations = 0;

        while (times.length < count && iterations < maxIterations) {
            if (matchesCron(current, parsed)) {
                times.push(new Date(current));
            }

            if (parsed.fieldCount === 6) {
                current.setSeconds(current.getSeconds() + 1);
            } else {
                current.setMinutes(current.getMinutes() + 1);
            }
            iterations++;
        }

        return times;
    }

    function matchesCron(date, parsed) {
        const fields = parsed.fields;

        // 秒
        if (fields.second && !fields.second.values.includes(date.getSeconds())) {
            return false;
        }

        // 分钟
        if (!fields.minute.values.includes(date.getMinutes())) {
            return false;
        }

        // 小时
        if (!fields.hour.values.includes(date.getHours())) {
            return false;
        }

        // 月
        if (!fields.month.values.includes(date.getMonth() + 1)) {
            return false;
        }

        // 日和周的特殊处理
        const dayMatch = fields.day.values.includes(date.getDate());
        const weekdayMatch = fields.weekday.values.includes(date.getDay());

        // 如果日和周都不是*，则满足任一即可
        if (fields.day.raw !== '*' && fields.weekday.raw !== '*') {
            return dayMatch || weekdayMatch;
        }

        // 日
        if (fields.day.raw !== '*' && !dayMatch) {
            return false;
        }

        // 周
        if (fields.weekday.raw !== '*' && !weekdayMatch) {
            return false;
        }

        return true;
    }

    // ===== 格式化日期时间 =====
    function formatDateTime(date) {
        const pad = n => n.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());
        const second = pad(date.getSeconds());
        const weekday = WEEKDAY_NAMES[date.getDay()];

        return {
            full: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
            short: `${month}-${day} ${hour}:${minute}`,
            weekday: weekday
        };
    }

    function formatRelativeTime(date) {
        const now = new Date();
        const diff = date - now;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}天后`;
        } else if (hours > 0) {
            return `${hours}小时后`;
        } else if (minutes > 0) {
            return `${minutes}分钟后`;
        } else {
            return '即将';
        }
    }

    // ===== 渲染函数 =====
    function renderParseResult(parsed) {
        // 渲染字段
        const fieldsHtml = [];
        const fieldOrder = state.fieldCount === 6
            ? ['second', 'minute', 'hour', 'day', 'month', 'weekday']
            : ['minute', 'hour', 'day', 'month', 'weekday'];

        fieldOrder.forEach(fieldName => {
            const field = parsed.fields[fieldName];
            const info = FIELD_INFO[fieldName];

            fieldsHtml.push(`
                <div class="field-item">
                    <span class="field-label">${info.name}</span>
                    <span class="field-value">${field.raw}</span>
                    <span class="field-desc">${field.description}</span>
                </div>
            `);
        });

        elements.fieldsContainer.innerHTML = fieldsHtml.join('');

        // 渲染人类可读文本
        elements.humanText.textContent = generateHumanReadable(parsed);

        // 显示结果
        elements.parseResult.classList.remove('hidden');
    }

    function renderNextTimes(times) {
        const timesHtml = times.map((time, index) => {
            const formatted = formatDateTime(time);
            const relative = formatRelativeTime(time);

            return `
                <div class="time-item">
                    <span class="time-index">${index + 1}</span>
                    <span class="time-value">${formatted.full} (${formatted.weekday})</span>
                    <span class="time-relative">${relative}</span>
                </div>
            `;
        });

        elements.nextTimesList.innerHTML = timesHtml.join('');
        elements.nextTimes.classList.remove('hidden');
    }

    // ===== 可视化构建器 =====
    function initBuilder() {
        const fields = state.fieldCount === 6
            ? ['second', 'minute', 'hour', 'day', 'month', 'weekday']
            : ['minute', 'hour', 'day', 'month', 'weekday'];

        const builderHtml = fields.map(fieldName => {
            const info = FIELD_INFO[fieldName];
            const [min, max] = info.range;

            let optionsHtml = `<option value="*">每${info.shortName}</option>`;

            // 添加步长选项
            optionsHtml += `<option value="*/2">每2${info.shortName}</option>`;
            optionsHtml += `<option value="*/5">每5${info.shortName}</option>`;
            optionsHtml += `<option value="*/10">每10${info.shortName}</option>`;
            optionsHtml += `<option value="*/15">每15${info.shortName}</option>`;

            // 添加范围选项
            optionsHtml += `<optgroup label="具体值">`;
            for (let i = min; i <= max; i++) {
                let displayValue = i;
                if (fieldName === 'weekday') {
                    displayValue = `${i} (${WEEKDAY_NAMES[i]})`;
                } else if (fieldName === 'month') {
                    displayValue = `${i} (${MONTH_NAMES[i]})`;
                }
                optionsHtml += `<option value="${i}">${displayValue}</option>`;
            }
            optionsHtml += `</optgroup>`;

            return `
                <div class="builder-field">
                    <label class="builder-label">${info.name}</label>
                    <select class="builder-select" data-field="${fieldName}">
                        ${optionsHtml}
                    </select>
                </div>
            `;
        });

        elements.builderFields.innerHTML = builderHtml.join('');
    }

    function buildCronFromBuilder() {
        const selects = elements.builderFields.querySelectorAll('.builder-select');
        const values = [];

        selects.forEach(select => {
            values.push(select.value);
        });

        elements.cronInput.value = values.join(' ');
        parseCron();
    }

    // ===== 主解析函数 =====
    function parseCron() {
        const expression = elements.cronInput.value.trim();

        if (!expression) {
            showError('请输入 Cron 表达式');
            return;
        }

        try {
            state.parsedCron = parseCronExpression(expression);
            hideError();

            renderParseResult(state.parsedCron);

            const nextTimes = getNextExecutionTimes(state.parsedCron, 5);
            renderNextTimes(nextTimes);

        } catch (error) {
            showError(error.message);
            elements.parseResult.classList.add('hidden');
            elements.nextTimes.classList.add('hidden');
        }
    }

    // ===== 错误处理 =====
    function showError(message) {
        elements.errorMsg.textContent = message;
        elements.errorMsg.classList.remove('hidden');
    }

    function hideError() {
        elements.errorMsg.classList.add('hidden');
    }

    // ===== 复制功能 =====
    function copyCron() {
        const expression = elements.cronInput.value.trim();
        if (!expression) {
            return;
        }

        navigator.clipboard.writeText(expression).then(() => {
            elements.copyBtn.textContent = '✅ 已复制';
            elements.copyBtn.classList.add('copied');

            setTimeout(() => {
                elements.copyBtn.textContent = '📋 复制';
                elements.copyBtn.classList.remove('copied');
            }, 2000);
        });
    }

    // ===== 字段数量切换 =====
    function setFieldCount(count) {
        state.fieldCount = count;

        if (count === 5) {
            elements.field5.classList.add('active');
            elements.field6.classList.remove('active');
        } else {
            elements.field6.classList.add('active');
            elements.field5.classList.remove('active');
        }

        initBuilder();

        // 如果有表达式，重新解析
        if (elements.cronInput.value.trim()) {
            parseCron();
        }
    }

    // ===== 事件监听 =====
    function initEventListeners() {
        // 解析按钮
        elements.parseBtn.addEventListener('click', parseCron);

        // 输入框回车
        elements.cronInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                parseCron();
            }
        });

        // 复制按钮
        elements.copyBtn.addEventListener('click', copyCron);

        // 字段数量切换
        elements.field5.addEventListener('click', () => setFieldCount(5));
        elements.field6.addEventListener('click', () => setFieldCount(6));

        // 构建器生成按钮
        elements.buildBtn.addEventListener('click', buildCronFromBuilder);

        // 预设按钮
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cron = btn.dataset.cron;
                elements.cronInput.value = cron;
                // 预设都是5字段
                setFieldCount(5);
                parseCron();
            });
        });

        // 构建器选择变化时自动更新输入框（但不解析）
        elements.builderFields.addEventListener('change', () => {
            const selects = elements.builderFields.querySelectorAll('.builder-select');
            const values = [];
            selects.forEach(select => {
                values.push(select.value);
            });
            elements.cronInput.value = values.join(' ');
        });
    }

    // ===== 初始化 =====
    function init() {
        initBuilder();
        initEventListeners();

        // 设置默认示例
        elements.cronInput.value = '0 9 * * *';
        parseCron();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

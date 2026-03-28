// Unix 时间戳转换器
(function() {
    'use strict';

    // ===== DOM 元素 =====
    const elements = {
        // 当前时间
        currentTimestamp: document.getElementById('currentTimestamp'),
        currentTimestampMs: document.getElementById('currentTimestampMs'),
        currentDatetime: document.getElementById('currentDatetime'),
        relativeTime: document.getElementById('relativeTime'),
        timezone: document.getElementById('timezone'),
        refreshBtn: document.getElementById('refreshBtn'),

        // 时间戳转日期
        timestampInput: document.getElementById('timestampInput'),
        unitSeconds: document.getElementById('unitSeconds'),
        unitMs: document.getElementById('unitMs'),
        convertBtn: document.getElementById('convertBtn'),
        convertResult: document.getElementById('convertResult'),
        localTime: document.getElementById('localTime'),
        isoTime: document.getElementById('isoTime'),
        utcTime: document.getElementById('utcTime'),
        inputRelativeTime: document.getElementById('inputRelativeTime'),
        rfc2822: document.getElementById('rfc2822'),
        resultTimestampSec: document.getElementById('resultTimestampSec'),
        resultTimestampMs: document.getElementById('resultTimestampMs'),

        // 日期转时间戳
        dateInput: document.getElementById('dateInput'),
        timeInput: document.getElementById('timeInput'),
        convertDateBtn: document.getElementById('convertDateBtn'),
        dateConvertResult: document.getElementById('dateConvertResult'),
        convertedTimestampSec: document.getElementById('convertedTimestampSec'),
        convertedTimestampMs: document.getElementById('convertedTimestampMs')
    };

    // ===== 状态 =====
    let state = {
        unit: 'seconds', // 'seconds' or 'milliseconds'
        updateInterval: null
    };

    // ===== 时区信息 =====
    function getTimezoneInfo() {
        const offset = new Date().getTimezoneOffset();
        const hours = Math.abs(Math.floor(offset / 60));
        const minutes = Math.abs(offset % 60);
        const sign = offset <= 0 ? '+' : '-';

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offsetStr = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        return `${timezone} (${offsetStr})`;
    }

    // ===== 格式化日期 =====
    function formatDate(date, format = 'full') {
        const pad = n => n.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        switch (format) {
            case 'date':
                return `${year}-${month}-${day}`;
            case 'time':
                return `${hours}:${minutes}:${seconds}`;
            case 'full':
            default:
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
    }

    // ===== 相对时间 =====
    function getRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const absDiff = Math.abs(diff);
        const isFuture = diff < 0;

        const seconds = Math.floor(absDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        let result = '';

        if (seconds < 10) {
            result = '刚刚';
        } else if (seconds < 60) {
            result = `${seconds} 秒${isFuture ? '后' : '前'}`;
        } else if (minutes < 60) {
            result = `${minutes} 分钟${isFuture ? '后' : '前'}`;
        } else if (hours < 24) {
            result = `${hours} 小时${isFuture ? '后' : '前'}`;
        } else if (days < 30) {
            result = `${days} 天${isFuture ? '后' : '前'}`;
        } else if (months < 12) {
            result = `${months} 个月${isFuture ? '后' : '前'}`;
        } else {
            result = `${years} 年${isFuture ? '后' : '前'}`;
        }

        return result;
    }

    // ===== RFC 2822 格式 =====
    function toRFC2822(date) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const pad = n => n.toString().padStart(2, '0');

        const dayName = days[date.getDay()];
        const day = pad(date.getDate());
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        const offset = date.getTimezoneOffset();
        const offsetHours = Math.abs(Math.floor(offset / 60));
        const offsetMinutes = Math.abs(offset % 60);
        const offsetSign = offset <= 0 ? '+' : '-';

        return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} ${offsetSign}${pad(offsetHours)}${pad(offsetMinutes)}`;
    }

    // ===== 更新当前时间 =====
    function updateCurrentTime() {
        const now = new Date();
        const timestampSec = Math.floor(now.getTime() / 1000);
        const timestampMs = now.getTime();

        elements.currentTimestamp.textContent = timestampSec.toLocaleString();
        elements.currentTimestampMs.textContent = timestampMs.toLocaleString();
        elements.currentDatetime.textContent = formatDate(now);
        elements.relativeTime.textContent = '刚刚';
    }

    // ===== 时间戳转日期 =====
    function convertTimestamp() {
        const input = elements.timestampInput.value.trim();
        if (!input) {
            alert('请输入时间戳');
            return;
        }

        let timestamp = parseInt(input, 10);
        if (isNaN(timestamp)) {
            alert('请输入有效的时间戳数字');
            return;
        }

        // 如果是秒，转换为毫秒
        let timestampMs = state.unit === 'seconds' ? timestamp * 1000 : timestamp;

        // 自动检测：如果数字小于 1e12，可能是秒
        if (timestamp < 1e12 && state.unit === 'milliseconds') {
            // 用户选择了毫秒但数字很小，提示可能是秒
        } else if (timestamp >= 1e12 && state.unit === 'seconds') {
            // 用户选择了秒但数字很大，提示可能是毫秒
        }

        const date = new Date(timestampMs);

        if (isNaN(date.getTime())) {
            alert('时间戳无效，无法转换为日期');
            return;
        }

        // 更新结果显示
        elements.localTime.textContent = formatDate(date);
        elements.isoTime.textContent = date.toISOString();
        elements.utcTime.textContent = date.toUTCString().replace('GMT', 'UTC');
        elements.inputRelativeTime.textContent = getRelativeTime(timestampMs);
        elements.rfc2822.textContent = toRFC2822(date);
        elements.resultTimestampSec.textContent = Math.floor(timestampMs / 1000);
        elements.resultTimestampMs.textContent = timestampMs;

        elements.convertResult.classList.remove('hidden');
    }

    // ===== 日期转时间戳 =====
    function convertDate() {
        const dateValue = elements.dateInput.value;
        const timeValue = elements.timeInput.value || '00:00:00';

        if (!dateValue) {
            alert('请选择日期');
            return;
        }

        const dateTimeStr = `${dateValue}T${timeValue}`;
        const date = new Date(dateTimeStr);

        if (isNaN(date.getTime())) {
            alert('日期无效');
            return;
        }

        const timestampMs = date.getTime();
        const timestampSec = Math.floor(timestampMs / 1000);

        elements.convertedTimestampSec.textContent = timestampSec;
        elements.convertedTimestampMs.textContent = timestampMs;

        elements.dateConvertResult.classList.remove('hidden');
    }

    // ===== 复制到剪贴板 =====
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = '✅';
            button.classList.add('copied');

            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 1500);
        }).catch(err => {
            console.error('复制失败:', err);
        });
    }

    // ===== 设置日期时间输入框默认值 =====
    function setDefaultDateTime() {
        const now = new Date();
        elements.dateInput.value = formatDate(now, 'date');
        elements.timeInput.value = formatDate(now, 'time');
    }

    // ===== 快速设置日期 =====
    function quickSetDate(offsetSeconds) {
        const now = new Date();
        const target = new Date(now.getTime() + offsetSeconds * 1000);

        elements.dateInput.value = formatDate(target, 'date');
        elements.timeInput.value = formatDate(target, 'time');
    }

    // ===== 事件监听 =====
    function initEventListeners() {
        // 刷新按钮
        elements.refreshBtn.addEventListener('click', () => {
            updateCurrentTime();
        });

        // 单位切换
        elements.unitSeconds.addEventListener('click', () => {
            state.unit = 'seconds';
            elements.unitSeconds.classList.add('active');
            elements.unitMs.classList.remove('active');
        });

        elements.unitMs.addEventListener('click', () => {
            state.unit = 'milliseconds';
            elements.unitMs.classList.add('active');
            elements.unitSeconds.classList.remove('active');
        });

        // 时间戳转日期
        elements.convertBtn.addEventListener('click', convertTimestamp);
        elements.timestampInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') convertTimestamp();
        });

        // 日期转时间戳
        elements.convertDateBtn.addEventListener('click', convertDate);

        // 快速按钮
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const offset = parseInt(btn.dataset.offset, 10);
                quickSetDate(offset);
            });
        });

        // 复制按钮
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    copyToClipboard(targetElement.textContent, btn);
                }
            });
        });
    }

    // ===== 初始化 =====
    function init() {
        // 设置时区
        elements.timezone.textContent = getTimezoneInfo();

        // 设置默认日期时间
        setDefaultDateTime();

        // 更新当前时间
        updateCurrentTime();

        // 每秒更新当前时间
        state.updateInterval = setInterval(updateCurrentTime, 1000);

        // 初始化事件监听
        initEventListeners();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function() {
    'use strict';

    // DOM 元素
    const elements = {
        jwtInput: null,
        formatStatus: null,
        resultSection: null,
        emptyState: null,
        headerContent: null,
        payloadContent: null,
        signatureContent: null,
        iatValue: null,
        expValue: null,
        expStatus: null,
        timeInfo: null,
        pasteBtn: null,
        clearBtn: null
    };

    // 初始化
    function init() {
        // 获取 DOM 元素
        elements.jwtInput = document.getElementById('jwtInput');
        elements.formatStatus = document.getElementById('formatStatus');
        elements.resultSection = document.getElementById('resultSection');
        elements.emptyState = document.getElementById('emptyState');
        elements.headerContent = document.getElementById('headerContent');
        elements.payloadContent = document.getElementById('payloadContent');
        elements.signatureContent = document.getElementById('signatureContent');
        elements.iatValue = document.getElementById('iatValue');
        elements.expValue = document.getElementById('expValue');
        elements.expStatus = document.getElementById('expStatus');
        elements.timeInfo = document.getElementById('timeInfo');
        elements.pasteBtn = document.getElementById('pasteBtn');
        elements.clearBtn = document.getElementById('clearBtn');

        // 绑定事件
        bindEvents();
    }

    // 绑定事件
    function bindEvents() {
        // 输入监听
        elements.jwtInput.addEventListener('input', debounce(handleInput, 300));

        // 粘贴按钮
        elements.pasteBtn.addEventListener('click', handlePaste);

        // 清空按钮
        elements.clearBtn.addEventListener('click', handleClear);

        // 复制按钮
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', handleCopy);
        });
    }

    // 处理输入
    function handleInput() {
        const token = elements.jwtInput.value.trim();

        if (!token) {
            showEmpty();
            return;
        }

        const result = decodeJWT(token);

        if (result.valid) {
            showResult(result);
            updateFormatStatus(true, '格式有效');
        } else {
            showEmpty();
            updateFormatStatus(false, result.error || '格式无效');
        }
    }

    // 解码 JWT
    function decodeJWT(token) {
        // 验证基本格式
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false, error: 'JWT 必须包含三部分（用点分隔）' };
        }

        const [headerB64, payloadB64, signature] = parts;

        // 验证各部分非空
        if (!headerB64 || !payloadB64 || !signature) {
            return { valid: false, error: 'JWT 各部分不能为空' };
        }

        try {
            // 解码 Header
            const header = decodeBase64(headerB64);

            // 解码 Payload
            const payload = decodeBase64(payloadB64);

            return {
                valid: true,
                header: header,
                payload: payload,
                signature: signature
            };
        } catch (e) {
            return { valid: false, error: 'Base64 解码失败: ' + e.message };
        }
    }

    // Base64 解码
    function decodeBase64(str) {
        // 替换 URL 安全字符
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

        // 补齐填充
        while (base64.length % 4) {
            base64 += '=';
        }

        // 解码
        const decoded = atob(base64);

        // 解析 JSON
        return JSON.parse(decoded);
    }

    // 显示结果
    function showResult(result) {
        elements.emptyState.classList.add('hidden');
        elements.resultSection.classList.add('active');

        // 显示 Header
        elements.headerContent.innerHTML = syntaxHighlight(JSON.stringify(result.header, null, 2));

        // 显示 Payload
        elements.payloadContent.innerHTML = syntaxHighlight(JSON.stringify(result.payload, null, 2));

        // 显示 Signature
        elements.signatureContent.textContent = result.signature;

        // 处理时间信息
        handleTimeInfo(result.payload);
    }

    // 处理时间信息
    function handleTimeInfo(payload) {
        elements.timeInfo.style.display = 'flex';

        // 签发时间 (iat)
        if (payload.iat !== undefined) {
            elements.iatValue.textContent = formatTimestamp(payload.iat);
        } else {
            elements.iatValue.textContent = '-';
        }

        // 过期时间 (exp)
        if (payload.exp !== undefined) {
            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            const isExpired = expDate < now;

            elements.expValue.textContent = formatTimestamp(payload.exp);
            elements.expStatus.style.display = 'inline';

            if (isExpired) {
                elements.expStatus.textContent = '已过期';
                elements.expStatus.className = 'exp-status expired';
            } else {
                const remaining = getTimeRemaining(expDate);
                elements.expStatus.textContent = `剩余 ${remaining}`;
                elements.expStatus.className = 'exp-status valid';
            }
        } else {
            elements.expValue.textContent = '-';
            elements.expStatus.style.display = 'none';
        }
    }

    // 格式化时间戳
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // 获取剩余时间
    function getTimeRemaining(expDate) {
        const diff = expDate - new Date();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}天 ${hours}小时`;
        } else if (hours > 0) {
            return `${hours}小时 ${minutes}分钟`;
        } else {
            return `${minutes}分钟`;
        }
    }

    // JSON 语法高亮
    function syntaxHighlight(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, null, 2);
        }

        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                    match = match.replace(/"/g, '').replace(/:$/, '');
                    return '<span class="' + cls + '">"' + match + '"</span>:';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    // 显示空状态
    function showEmpty() {
        elements.resultSection.classList.remove('active');
        elements.emptyState.classList.remove('hidden');
        elements.formatStatus.textContent = '';
        elements.formatStatus.className = 'format-status';
    }

    // 更新格式状态
    function updateFormatStatus(valid, message) {
        elements.formatStatus.textContent = message;
        elements.formatStatus.className = 'format-status ' + (valid ? 'valid' : 'invalid');

        if (valid) {
            elements.formatStatus.innerHTML = '<span>✓</span> ' + message;
        } else {
            elements.formatStatus.innerHTML = '<span>✗</span> ' + message;
        }
    }

    // 处理粘贴
    async function handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            elements.jwtInput.value = text;
            handleInput();
        } catch (e) {
            // 降级方案：聚焦输入框让用户手动粘贴
            elements.jwtInput.focus();
        }
    }

    // 处理清空
    function handleClear() {
        elements.jwtInput.value = '';
        showEmpty();
        elements.jwtInput.focus();
    }

    // 处理复制
    async function handleCopy(e) {
        const btn = e.currentTarget;
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);

        if (!targetEl) return;

        const text = targetEl.textContent || targetEl.innerText;

        try {
            await navigator.clipboard.writeText(text);

            // 更新按钮状态
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ 已复制';
            btn.classList.add('copied');

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('copied');
            }, 1500);
        } catch (e) {
            console.error('复制失败:', e);
        }
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

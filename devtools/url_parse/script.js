/**
 * URL 解析器
 * 使用 IIFE 模式封装
 */
(function() {
    'use strict';

    // ===== DOM 元素 =====
    const elements = {
        urlInput: document.getElementById('urlInput'),
        parseBtn: document.getElementById('parseBtn'),
        clearBtn: document.getElementById('clearBtn'),
        validationMessage: document.getElementById('validationMessage'),
        resultSection: document.getElementById('resultSection'),
        componentsGrid: document.getElementById('componentsGrid'),
        querySection: document.getElementById('querySection'),
        paramsList: document.getElementById('paramsList'),
        paramCount: document.getElementById('paramCount'),
        encodedUrl: document.getElementById('encodedUrl'),
        fullUrl: document.getElementById('fullUrl'),
        statusText: document.getElementById('statusText')
    };

    // ===== URL 组件配置 =====
    const componentConfig = [
        { key: 'protocol', label: '协议 (Protocol)', color: '#0a84ff' },
        { key: 'host', label: '主机 (Host)', color: '#bf5af2' },
        { key: 'port', label: '端口 (Port)', color: '#ff9f0a' },
        { key: 'pathname', label: '路径 (Path)', color: '#30d158' },
        { key: 'hash', label: '片段 (Hash)', color: '#ff453a' }
    ];

    // ===== 工具函数 =====

    /**
     * 验证 URL 格式
     */
    function validateUrl(url) {
        if (!url || url.trim() === '') {
            return { valid: false, message: '请输入 URL' };
        }

        try {
            const urlObj = new URL(url);
            return { valid: true, message: 'URL 格式有效', urlObj: urlObj };
        } catch (e) {
            return { valid: false, message: 'URL 格式无效: ' + e.message };
        }
    }

    /**
     * 解析 URL
     */
    function parseUrl(url) {
        const validation = validateUrl(url);
        if (!validation.valid) {
            return null;
        }

        const urlObj = validation.urlObj;
        const params = new URLSearchParams(urlObj.search);

        // 解析查询参数
        const queryParams = [];
        params.forEach((value, key) => {
            queryParams.push({ key, value });
        });

        return {
            protocol: urlObj.protocol,
            host: urlObj.host,
            hostname: urlObj.hostname,
            port: urlObj.port || getDefaultPort(urlObj.protocol),
            pathname: urlObj.pathname,
            search: urlObj.search,
            hash: urlObj.hash,
            origin: urlObj.origin,
            href: urlObj.href,
            queryParams
        };
    }

    /**
     * 获取协议默认端口
     */
    function getDefaultPort(protocol) {
        const ports = {
            'http:': '80',
            'https:': '443',
            'ftp:': '21',
            'ws:': '80',
            'wss:': '443'
        };
        return ports[protocol] || '';
    }

    /**
     * 复制文本到剪贴板
     */
    async function copyToClipboard(text, button) {
        try {
            await navigator.clipboard.writeText(text);
            button.classList.add('copied');
            button.textContent = '✓';
            setTimeout(() => {
                button.classList.remove('copied');
                button.textContent = '📋';
            }, 1500);
        } catch (err) {
            console.error('复制失败:', err);
        }
    }

    // ===== 渲染函数 =====

    /**
     * 显示验证消息
     */
    function showValidation(isValid, message) {
        elements.validationMessage.textContent = message;
        elements.validationMessage.className = 'validation-message ' + (isValid ? 'valid' : 'invalid');
    }

    /**
     * 渲染组件卡片
     */
    function renderComponents(parsed) {
        elements.componentsGrid.innerHTML = '';

        componentConfig.forEach(config => {
            const value = parsed[config.key];
            const displayValue = value || '';

            const card = document.createElement('div');
            card.className = 'component-card';
            card.innerHTML = `
                <div class="component-header">
                    <span class="component-label" style="color: ${config.color}">${config.label}</span>
                    <button class="copy-btn" data-value="${escapeHtml(displayValue)}" title="复制">📋</button>
                </div>
                <div class="component-value ${!displayValue ? 'empty' : ''}">
                    ${displayValue || '（空）'}
                </div>
            `;
            elements.componentsGrid.appendChild(card);
        });
    }

    /**
     * 渲染查询参数
     */
    function renderQueryParams(parsed) {
        const params = parsed.queryParams;
        elements.paramCount.textContent = `${params.length} 个参数`;

        if (params.length === 0) {
            elements.paramsList.innerHTML = '<div class="param-empty">无查询参数</div>';
            return;
        }

        elements.paramsList.innerHTML = '';

        params.forEach(param => {
            const item = document.createElement('div');
            item.className = 'param-item';
            item.innerHTML = `
                <span class="param-key">${escapeHtml(param.key)}</span>
                <span class="param-arrow">→</span>
                <span class="param-value">${escapeHtml(param.value)}</span>
                <button class="copy-btn" data-value="${escapeHtml(param.key + '=' + param.value)}" title="复制">📋</button>
            `;
            elements.paramsList.appendChild(item);
        });
    }

    /**
     * 渲染编码工具
     */
    function renderEncodeTools(parsed, originalUrl) {
        elements.encodedUrl.textContent = encodeURIComponent(originalUrl);
        elements.fullUrl.textContent = parsed.href;
    }

    /**
     * HTML 转义
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== 事件处理 =====

    /**
     * 处理解析
     */
    function handleParse() {
        const url = elements.urlInput.value.trim();

        if (!url) {
            showValidation(false, '请输入 URL');
            elements.resultSection.classList.remove('active');
            elements.statusText.textContent = '就绪';
            return;
        }

        const parsed = parseUrl(url);

        if (!parsed) {
            showValidation(false, 'URL 格式无效');
            elements.resultSection.classList.remove('active');
            elements.statusText.textContent = '解析失败';
            return;
        }

        showValidation(true, 'URL 格式有效');
        elements.resultSection.classList.add('active');

        renderComponents(parsed);
        renderQueryParams(parsed);
        renderEncodeTools(parsed, url);

        elements.statusText.textContent = `解析成功 - ${parsed.queryParams.length} 个查询参数`;
    }

    /**
     * 处理清空
     */
    function handleClear() {
        elements.urlInput.value = '';
        elements.validationMessage.className = 'validation-message';
        elements.validationMessage.textContent = '';
        elements.resultSection.classList.remove('active');
        elements.statusText.textContent = '已清空';
        elements.urlInput.focus();
    }

    /**
     * 处理复制按钮点击
     */
    function handleCopyClick(e) {
        const button = e.target.closest('.copy-btn');
        if (!button) return;

        // 对于动态值，从 data-value 属性获取
        const value = button.dataset.value || document.getElementById(button.dataset.target)?.textContent || '';
        if (value) {
            copyToClipboard(value, button);
        }
    }

    /**
     * 处理回车键
     */
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            handleParse();
        }
    }

    // ===== 初始化 =====
    function init() {
        // 绑定事件
        elements.parseBtn.addEventListener('click', handleParse);
        elements.clearBtn.addEventListener('click', handleClear);
        elements.urlInput.addEventListener('keypress', handleKeyPress);
        document.addEventListener('click', handleCopyClick);

        // 示例 URL（可选）
        elements.urlInput.value = 'https://www.example.com:8080/path/to/page?id=123&name=test&category=web#section-1';

        elements.statusText.textContent = '就绪 - 输入 URL 后点击解析';
    }

    // 启动应用
    init();
})();

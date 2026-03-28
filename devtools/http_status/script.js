(function() {
    'use strict';

    // HTTP Status Codes Data
    const statusCodes = [
        // 1xx Informational
        { code: 100, name: 'Continue', description: '服务器已接收到请求的初始部分，客户端应继续发送剩余部分。', category: '1xx' },
        { code: 101, name: 'Switching Protocols', description: '服务器已理解客户端的协议升级请求，正在切换协议。', category: '1xx' },
        { code: 102, name: 'Processing', description: '服务器已收到并正在处理请求，但尚无响应可用。', category: '1xx' },
        { code: 103, name: 'Early Hints', description: '在最终HTTP消息之前，返回一些响应头字段，用于预加载资源。', category: '1xx' },

        // 2xx Success
        { code: 200, name: 'OK', description: '请求成功。请求所希望的响应头或数据体将随此响应返回。', category: '2xx' },
        { code: 201, name: 'Created', description: '请求成功，并因此创建了一个新的资源。', category: '2xx' },
        { code: 202, name: 'Accepted', description: '请求已接受处理，但处理尚未完成。', category: '2xx' },
        { code: 203, name: 'Non-Authoritative Information', description: '服务器成功处理了请求，但返回的信息可能来自另一来源。', category: '2xx' },
        { code: 204, name: 'No Content', description: '服务器成功处理了请求，但不返回任何内容。', category: '2xx' },
        { code: 205, name: 'Reset Content', description: '服务器成功处理了请求，且没有返回任何内容。要求请求者重置文档视图。', category: '2xx' },
        { code: 206, name: 'Partial Content', description: '服务器成功处理了部分GET请求。用于大文件的分段下载。', category: '2xx' },
        { code: 207, name: 'Multi-Status', description: '一个由WebDAV扩展的状态码，表示多个操作的状态。', category: '2xx' },
        { code: 208, name: 'Already Reported', description: 'WebDAV扩展状态码，表示DAV绑定的成员已在先前回复中枚举。', category: '2xx' },
        { code: 226, name: 'IM Used', description: '服务器已完成对资源的GET请求，响应是当前实例应用于实例操作的结果。', category: '2xx' },

        // 3xx Redirection
        { code: 300, name: 'Multiple Choices', description: '请求的资源有多个可供选择的表示形式，服务器提供了列表供用户选择。', category: '3xx' },
        { code: 301, name: 'Moved Permanently', description: '请求的资源已被永久移动到新位置，应使用新的URI进行后续请求。', category: '3xx' },
        { code: 302, name: 'Found', description: '请求的资源现在临时从不同的URI响应请求。', category: '3xx' },
        { code: 303, name: 'See Other', description: '对请求的响应可以在另一个URI上找到，客户端应使用GET方法获取该资源。', category: '3xx' },
        { code: 304, name: 'Not Modified', description: '资源未被修改，客户端应使用缓存的版本。', category: '3xx' },
        { code: 305, name: 'Use Proxy', description: '请求的资源必须通过代理访问。（已废弃，不推荐使用）', category: '3xx' },
        { code: 306, name: 'Switch Proxy', description: '保留状态码，不再使用。', category: '3xx' },
        { code: 307, name: 'Temporary Redirect', description: '请求的资源临时从不同的URI响应请求，请求方法不应改变。', category: '3xx' },
        { code: 308, name: 'Permanent Redirect', description: '请求的资源已被永久移动到新位置，请求方法不应改变。', category: '3xx' },

        // 4xx Client Error
        { code: 400, name: 'Bad Request', description: '服务器无法理解请求的格式，客户端不应尝试再次使用相同的内容发起请求。', category: '4xx' },
        { code: 401, name: 'Unauthorized', description: '请求未包含有效的身份验证凭据，需要进行用户身份验证。', category: '4xx' },
        { code: 402, name: 'Payment Required', description: '此状态码保留供将来使用，预期用于数字支付系统。', category: '4xx' },
        { code: 403, name: 'Forbidden', description: '服务器已理解请求，但拒绝执行。客户端没有访问权限。', category: '4xx' },
        { code: 404, name: 'Not Found', description: '请求的资源不存在，或服务器找不到请求的资源。', category: '4xx' },
        { code: 405, name: 'Method Not Allowed', description: '请求中使用的HTTP方法不被目标资源支持。', category: '4xx' },
        { code: 406, name: 'Not Acceptable', description: '服务器无法根据客户端请求的Accept头部返回相应的内容。', category: '4xx' },
        { code: 407, name: 'Proxy Authentication Required', description: '客户端必须先使用代理进行身份验证。', category: '4xx' },
        { code: 408, name: 'Request Timeout', description: '服务器等待请求超时，客户端可重新发起请求。', category: '4xx' },
        { code: 409, name: 'Conflict', description: '请求与服务器当前状态冲突，通常发生在编辑冲突时。', category: '4xx' },
        { code: 410, name: 'Gone', description: '请求的资源已永久删除，不再可用。', category: '4xx' },
        { code: 411, name: 'Length Required', description: '服务器要求请求中包含Content-Length头部。', category: '4xx' },
        { code: 412, name: 'Precondition Failed', description: '请求中的前提条件被服务器评估为false。', category: '4xx' },
        { code: 413, name: 'Payload Too Large', description: '请求实体过大，超出服务器能够处理的范围。', category: '4xx' },
        { code: 414, name: 'URI Too Long', description: '请求的URI过长，服务器无法处理。', category: '4xx' },
        { code: 415, name: 'Unsupported Media Type', description: '请求实体的媒体类型不被服务器支持。', category: '4xx' },
        { code: 416, name: 'Range Not Satisfiable', description: '客户端请求的范围无法被满足。', category: '4xx' },
        { code: 417, name: 'Expectation Failed', description: '服务器无法满足请求头中Expect字段指定的期望。', category: '4xx' },
        { code: 418, name: "I'm a teapot", description: '服务器拒绝冲泡咖啡，因为它是个茶壶。（愚人节玩笑，RFC 2324）', category: '4xx' },
        { code: 421, name: 'Misdirected Request', description: '请求被定向到无法产生响应的服务器。', category: '4xx' },
        { code: 422, name: 'Unprocessable Entity', description: '请求格式正确，但由于语义错误无法处理。', category: '4xx' },
        { code: 423, name: 'Locked', description: '请求的资源被锁定，无法访问。', category: '4xx' },
        { code: 424, name: 'Failed Dependency', description: '由于先前请求失败，导致当前请求失败。', category: '4xx' },
        { code: 425, name: 'Too Early', description: '服务器不愿冒险处理可能被重放的请求。', category: '4xx' },
        { code: 426, name: 'Upgrade Required', description: '客户端应切换到其他协议，如TLS/1.0。', category: '4xx' },
        { code: 428, name: 'Precondition Required', description: '服务器要求请求必须是条件性的。', category: '4xx' },
        { code: 429, name: 'Too Many Requests', description: '客户端在给定时间内发送了过多请求，已被限流。', category: '4xx' },
        { code: 431, name: 'Request Header Fields Too Large', description: '请求头字段过大，服务器拒绝处理请求。', category: '4xx' },
        { code: 451, name: 'Unavailable For Legal Reasons', description: '由于法律原因，用户请求的资源不可用。', category: '4xx' },

        // 5xx Server Error
        { code: 500, name: 'Internal Server Error', description: '服务器遇到错误，无法完成请求。通常由服务器端代码错误引起。', category: '5xx' },
        { code: 501, name: 'Not Implemented', description: '服务器不支持请求的功能，无法完成请求。', category: '5xx' },
        { code: 502, name: 'Bad Gateway', description: '服务器作为网关或代理，从上游服务器收到无效响应。', category: '5xx' },
        { code: 503, name: 'Service Unavailable', description: '服务器暂时无法处理请求，可能是过载或正在维护。', category: '5xx' },
        { code: 504, name: 'Gateway Timeout', description: '服务器作为网关或代理，没有及时从上游服务器收到响应。', category: '5xx' },
        { code: 505, name: 'HTTP Version Not Supported', description: '服务器不支持请求中所使用的HTTP版本。', category: '5xx' },
        { code: 506, name: 'Variant Also Negotiates', description: '服务器内部配置错误，协商变体资源时出现问题。', category: '5xx' },
        { code: 507, name: 'Insufficient Storage', description: '服务器无法存储完成请求所需的内容。', category: '5xx' },
        { code: 508, name: 'Loop Detected', description: '在处理请求时检测到无限循环。', category: '5xx' },
        { code: 510, name: 'Not Extended', description: '需要进一步扩展请求才能完成处理。', category: '5xx' },
        { code: 511, name: 'Network Authentication Required', description: '需要进行网络身份验证才能访问。', category: '5xx' }
    ];

    // Category metadata
    const categories = {
        '1xx': { title: '信息响应', class: 'cat-1xx' },
        '2xx': { title: '成功响应', class: 'cat-2xx' },
        '3xx': { title: '重定向', class: 'cat-3xx' },
        '4xx': { title: '客户端错误', class: 'cat-4xx' },
        '5xx': { title: '服务器错误', class: 'cat-5xx' }
    };

    // State
    const state = {
        currentFilter: 'all',
        searchQuery: ''
    };

    // DOM Elements
    const elements = {
        searchInput: document.getElementById('searchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        statusList: document.getElementById('statusList'),
        totalCount: document.getElementById('totalCount'),
        filteredCount: document.getElementById('filteredCount'),
        notification: document.getElementById('notification')
    };

    // Initialize
    function init() {
        elements.totalCount.textContent = statusCodes.length;
        renderStatusCodes();
        bindEvents();
    }

    // Bind events
    function bindEvents() {
        // Search input
        elements.searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim().toLowerCase();
            updateClearButton();
            renderStatusCodes();
        });

        // Clear search
        elements.clearSearchBtn.addEventListener('click', () => {
            elements.searchInput.value = '';
            state.searchQuery = '';
            updateClearButton();
            renderStatusCodes();
            elements.searchInput.focus();
        });

        // Filter buttons
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentFilter = btn.dataset.filter;
                renderStatusCodes();
            });
        });
    }

    // Update clear button visibility
    function updateClearButton() {
        if (state.searchQuery) {
            elements.clearSearchBtn.classList.add('show');
        } else {
            elements.clearSearchBtn.classList.remove('show');
        }
    }

    // Filter status codes
    function getFilteredStatusCodes() {
        let filtered = statusCodes;

        // Apply category filter
        if (state.currentFilter !== 'all') {
            filtered = filtered.filter(item => item.category === state.currentFilter);
        }

        // Apply search filter
        if (state.searchQuery) {
            filtered = filtered.filter(item =>
                item.code.toString().includes(state.searchQuery) ||
                item.name.toLowerCase().includes(state.searchQuery) ||
                item.description.toLowerCase().includes(state.searchQuery)
            );
        }

        return filtered;
    }

    // Render status codes
    function renderStatusCodes() {
        const filtered = getFilteredStatusCodes();
        elements.filteredCount.textContent = filtered.length;

        if (filtered.length === 0) {
            elements.statusList.innerHTML = `
                <div class="no-results">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                        <path d="M8 8l6 6M14 8l-6 6"/>
                    </svg>
                    <p>未找到匹配的状态码</p>
                </div>
            `;
            return;
        }

        // Group by category
        const grouped = {};
        filtered.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });

        // Sort categories
        const sortedCategories = Object.keys(grouped).sort();

        let html = '';
        sortedCategories.forEach(cat => {
            const catInfo = categories[cat];
            const catItems = grouped[cat];

            // Category header
            html += `
                <div class="category-header">
                    <div class="category-badge ${catInfo.class}">${cat}</div>
                    <span class="category-title">${catInfo.title}</span>
                    <span class="category-count">${catItems.length} 个</span>
                </div>
            `;

            // Status items
            catItems.forEach(item => {
                html += `
                    <div class="status-item" data-code="${item.code}" data-category="${item.category}">
                        <div class="status-code">${item.code}</div>
                        <div class="status-info">
                            <div class="status-name">${item.name}</div>
                            <div class="status-description">${item.description}</div>
                        </div>
                        <div class="copy-indicator">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        </div>
                    </div>
                `;
            });
        });

        elements.statusList.innerHTML = html;

        // Bind click events to status items
        document.querySelectorAll('.status-item').forEach(item => {
            item.addEventListener('click', () => copyStatusCode(item));
        });
    }

    // Copy status code
    async function copyStatusCode(item) {
        const code = item.dataset.code;

        try {
            await navigator.clipboard.writeText(code);

            // Visual feedback
            item.classList.add('copied');
            setTimeout(() => item.classList.remove('copied'), 1500);

            showNotification(`已复制: ${code}`);
        } catch (e) {
            showNotification('复制失败');
        }
    }

    // Show notification
    function showNotification(message) {
        elements.notification.textContent = message;
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2000);
    }

    // Initialize on DOM ready
    init();
})();

/**
 * JSON 格式化工具
 * 纯前端实现，支持格式化、压缩、语法高亮
 */
(function() {
    'use strict';

    // ===== 状态管理 =====
    const state = {
        indent: 4,
        inputText: '',
        outputText: ''
    };

    // ===== DOM 元素 =====
    const elements = {
        inputArea: null,
        outputArea: null,
        outputCode: null,
        inputLineNumbers: null,
        outputLineNumbers: null,
        indentSelect: null,
        formatBtn: null,
        minifyBtn: null,
        clearBtn: null,
        copyBtn: null,
        pasteBtn: null,
        errorBar: null,
        errorMessage: null,
        errorClose: null,
        statusMsg: null,
        inputStats: null,
        outputStats: null
    };

    // ===== 初始化 =====
    function init() {
        // 获取 DOM 元素
        elements.inputArea = document.getElementById('inputArea');
        elements.outputCode = document.getElementById('outputCode');
        elements.inputLineNumbers = document.getElementById('inputLineNumbers');
        elements.outputLineNumbers = document.getElementById('outputLineNumbers');
        elements.indentSelect = document.getElementById('indentSelect');
        elements.formatBtn = document.getElementById('formatBtn');
        elements.minifyBtn = document.getElementById('minifyBtn');
        elements.clearBtn = document.getElementById('clearBtn');
        elements.copyBtn = document.getElementById('copyBtn');
        elements.pasteBtn = document.getElementById('pasteBtn');
        elements.errorBar = document.getElementById('errorBar');
        elements.errorMessage = document.getElementById('errorMessage');
        elements.errorClose = document.getElementById('errorClose');
        elements.statusMsg = document.getElementById('statusMsg');
        elements.inputStats = document.getElementById('inputStats');
        elements.outputStats = document.getElementById('outputStats');

        // 绑定事件
        bindEvents();

        // 初始化行号
        updateLineNumbers(elements.inputLineNumbers, '');
        updateLineNumbers(elements.outputLineNumbers, '');
    }

    // ===== 事件绑定 =====
    function bindEvents() {
        // 输入区域事件
        elements.inputArea.addEventListener('input', handleInput);
        elements.inputArea.addEventListener('scroll', syncScroll);
        elements.inputArea.addEventListener('keydown', handleKeyDown);

        // 按钮事件
        elements.formatBtn.addEventListener('click', formatJSON);
        elements.minifyBtn.addEventListener('click', minifyJSON);
        elements.clearBtn.addEventListener('click', clearAll);
        elements.copyBtn.addEventListener('click', copyOutput);
        elements.pasteBtn.addEventListener('click', pasteInput);

        // 缩进选择
        elements.indentSelect.addEventListener('change', handleIndentChange);

        // 错误关闭
        elements.errorClose.addEventListener('click', hideError);
    }

    // ===== 核心功能 =====

    // 格式化 JSON
    function formatJSON() {
        const input = elements.inputArea.value.trim();

        if (!input) {
            showToast('请输入 JSON 数据', 'error');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const indent = state.indent === 'tab' ? '\t' : state.indent;
            const formatted = JSON.stringify(parsed, null, indent);

            state.outputText = formatted;
            renderOutput(formatted);
            updateStats();
            hideError();
            showToast('格式化成功', 'success');

            elements.statusMsg.textContent = '格式化完成';
            elements.statusMsg.className = 'status-item success';
        } catch (e) {
            showError(e.message);
            elements.statusMsg.textContent = '格式化失败';
            elements.statusMsg.className = 'status-item error';
        }
    }

    // 压缩 JSON
    function minifyJSON() {
        const input = elements.inputArea.value.trim();

        if (!input) {
            showToast('请输入 JSON 数据', 'error');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);

            state.outputText = minified;
            renderOutput(minified);
            updateStats();
            hideError();
            showToast('压缩成功', 'success');

            elements.statusMsg.textContent = '压缩完成';
            elements.statusMsg.className = 'status-item success';
        } catch (e) {
            showError(e.message);
            elements.statusMsg.textContent = '压缩失败';
            elements.statusMsg.className = 'status-item error';
        }
    }

    // 清空所有
    function clearAll() {
        elements.inputArea.value = '';
        elements.outputCode.innerHTML = '';
        state.inputText = '';
        state.outputText = '';
        updateLineNumbers(elements.inputLineNumbers, '');
        updateLineNumbers(elements.outputLineNumbers, '');
        updateStats();
        hideError();

        elements.statusMsg.textContent = '已清空';
        elements.statusMsg.className = 'status-item';
    }

    // 复制输出
    async function copyOutput() {
        if (!state.outputText) {
            showToast('没有可复制的内容', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(state.outputText);
            showToast('已复制到剪贴板', 'success');
        } catch (e) {
            // 降级方案
            fallbackCopy(state.outputText);
        }
    }

    // 粘贴输入
    async function pasteInput() {
        try {
            const text = await navigator.clipboard.readText();
            elements.inputArea.value = text;
            handleInput();
            showToast('已粘贴', 'success');
        } catch (e) {
            showToast('无法访问剪贴板', 'error');
        }
    }

    // ===== 渲染函数 =====

    // 渲染输出（带语法高亮）
    function renderOutput(json) {
        const highlighted = syntaxHighlight(json);
        elements.outputCode.innerHTML = highlighted;
        updateLineNumbers(elements.outputLineNumbers, json);
    }

    // JSON 语法高亮
    function syntaxHighlight(json) {
        // 转义 HTML
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // 高亮处理
        return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function(match) {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            }
        );
    }

    // 更新行号
    function updateLineNumbers(container, text) {
        if (!text) {
            container.innerHTML = '<span>1</span>';
            return;
        }

        const lines = text.split('\n');
        let html = '';
        for (let i = 1; i <= lines.length; i++) {
            html += '<span>' + i + '</span>';
        }
        container.innerHTML = html;
    }

    // 更新统计信息
    function updateStats() {
        const input = elements.inputArea.value;
        const inputLines = input ? input.split('\n').length : 0;
        const inputChars = input.length;
        elements.inputStats.textContent = inputChars + ' 字符 | ' + inputLines + ' 行';

        const output = state.outputText;
        const outputLines = output ? output.split('\n').length : 0;
        const outputChars = output.length;
        elements.outputStats.textContent = outputChars + ' 字符 | ' + outputLines + ' 行';
    }

    // ===== 事件处理 =====

    // 输入处理
    function handleInput() {
        const input = elements.inputArea.value;
        state.inputText = input;
        updateLineNumbers(elements.inputLineNumbers, input);
        updateStats();
    }

    // 缩进变更
    function handleIndentChange() {
        const value = elements.indentSelect.value;
        state.indent = value === 'tab' ? 'tab' : parseInt(value, 10);

        // 如果已有输出，重新格式化
        if (state.outputText) {
            formatJSON();
        }
    }

    // 滚动同步（输入区行号）
    function syncScroll() {
        elements.inputLineNumbers.scrollTop = elements.inputArea.scrollTop;
    }

    // 键盘快捷键
    function handleKeyDown(e) {
        // Ctrl/Cmd + Enter: 格式化
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            formatJSON();
        }

        // Ctrl/Cmd + Shift + M: 压缩
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
            e.preventDefault();
            minifyJSON();
        }
    }

    // ===== UI 辅助 =====

    // 显示错误
    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorBar.classList.add('show');
    }

    // 隐藏错误
    function hideError() {
        elements.errorBar.classList.remove('show');
    }

    // 显示 Toast
    function showToast(message, type) {
        // 移除现有 toast
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }

        // 创建新 toast
        const toast = document.createElement('div');
        toast.className = 'toast ' + (type || '');
        toast.textContent = message;
        document.body.appendChild(toast);

        // 显示动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // 自动消失
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // 降级复制方案
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            showToast('已复制到剪贴板', 'success');
        } catch (e) {
            showToast('复制失败', 'error');
        }

        document.body.removeChild(textarea);
    }

    // ===== 启动 =====
    document.addEventListener('DOMContentLoaded', init);
})();

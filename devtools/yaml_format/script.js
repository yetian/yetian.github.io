/**
 * YAML 格式化工具
 * 纯前端实现，支持格式化、压缩、语法高亮
 */
(function() {
    'use strict';

    // ===== 状态管理 =====
    const state = {
        indent: 2,
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
        elements.formatBtn.addEventListener('click', formatYAML);
        elements.minifyBtn.addEventListener('click', minifyYAML);
        elements.clearBtn.addEventListener('click', clearAll);
        elements.copyBtn.addEventListener('click', copyOutput);
        elements.pasteBtn.addEventListener('click', pasteInput);

        // 缩进选择
        elements.indentSelect.addEventListener('change', handleIndentChange);

        // 错误关闭
        elements.errorClose.addEventListener('click', hideError);
    }

    // ===== YAML 解析器 =====

    /**
     * 简单的 YAML 解析器
     * 将 YAML 转换为 JavaScript 对象
     */
    function parseYAML(yaml) {
        const lines = yaml.split('\n');
        const result = {};
        const stack = [{ obj: result, indent: -1 }];
        let currentKey = null;
        let inMultilineString = false;
        let multilineValue = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;

            // 空行
            if (line.trim() === '') {
                continue;
            }

            // 计算缩进
            const indent = line.search(/\S|$/);

            // 注释行
            if (line.trim().startsWith('#')) {
                continue;
            }

            // 处理多行字符串
            if (inMultilineString) {
                if (indent > stack[stack.length - 1].indent) {
                    multilineValue.push(line.trim());
                    continue;
                } else {
                    // 结束多行字符串
                    const parent = stack[stack.length - 1].obj;
                    parent[currentKey] = multilineValue.join('\n');
                    inMultilineString = false;
                    multilineValue = [];
                }
            }

            // 弹出栈直到找到正确的父级
            while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
                stack.pop();
            }

            const parent = stack[stack.length - 1].obj;

            // 列表项
            if (line.trim().startsWith('- ')) {
                if (!Array.isArray(parent)) {
                    // 转换为数组
                    const grandParent = stack.length > 1 ? stack[stack.length - 2].obj : result;
                    const lastKey = Object.keys(grandParent).find(k => grandParent[k] === parent);
                    if (lastKey) {
                        grandParent[lastKey] = [];
                        stack[stack.length - 1].obj = grandParent[lastKey];
                    }
                }
                const currentArray = stack[stack.length - 1].obj;
                if (!Array.isArray(currentArray)) {
                    throw new Error(`第 ${lineNum} 行: 列表项格式错误`);
                }

                const itemContent = line.trim().substring(2).trim();

                // 检查是否是键值对形式的列表项
                const colonIndex = itemContent.indexOf(':');
                if (colonIndex > 0) {
                    const key = itemContent.substring(0, colonIndex).trim();
                    const value = parseValue(itemContent.substring(colonIndex + 1).trim(), lineNum);
                    const itemObj = {};
                    itemObj[key] = value;
                    currentArray.push(itemObj);
                    // 如果值是对象（需要查看下一行），压栈
                    if (value === null && i + 1 < lines.length) {
                        const nextIndent = lines[i + 1].search(/\S|$/);
                        if (nextIndent > indent) {
                            stack.push({ obj: itemObj, indent: indent });
                            currentKey = key;
                        }
                    }
                } else {
                    const value = parseValue(itemContent, lineNum);
                    currentArray.push(value);
                }
                continue;
            }

            // 键值对
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) {
                throw new Error(`第 ${lineNum} 行: 缺少冒号分隔符`);
            }

            const key = line.substring(0, colonIndex).trim();
            let valueStr = line.substring(colonIndex + 1).trim();
            let value;

            // 处理多行字符串标记
            if (valueStr === '|' || valueStr === '>') {
                value = null;
                inMultilineString = true;
                currentKey = key;
                stack.push({ obj: parent, indent: indent });
                parent[key] = '';
                continue;
            }

            // 解析值
            if (valueStr === '') {
                value = null;
                // 检查下一行是否有嵌套内容
                if (i + 1 < lines.length) {
                    const nextIndent = lines[i + 1].search(/\S|$/);
                    if (nextIndent > indent) {
                        parent[key] = {};
                        stack.push({ obj: parent[key], indent: indent });
                        continue;
                    }
                }
            } else {
                value = parseValue(valueStr, lineNum);
            }

            parent[key] = value;
        }

        // 处理未结束的多行字符串
        if (inMultilineString && multilineValue.length > 0) {
            const parent = stack[stack.length - 1].obj;
            parent[currentKey] = multilineValue.join('\n');
        }

        return result;
    }

    /**
     * 解析 YAML 值
     */
    function parseValue(valueStr, lineNum) {
        if (!valueStr || valueStr === '') {
            return null;
        }

        // 移除行内注释
        const commentIndex = valueStr.indexOf(' #');
        if (commentIndex > 0) {
            valueStr = valueStr.substring(0, commentIndex).trim();
        }

        // 引号字符串
        if ((valueStr.startsWith('"') && valueStr.endsWith('"')) ||
            (valueStr.startsWith("'") && valueStr.endsWith("'"))) {
            return valueStr.slice(1, -1);
        }

        // 布尔值
        if (valueStr === 'true' || valueStr === 'True' || valueStr === 'TRUE') {
            return true;
        }
        if (valueStr === 'false' || valueStr === 'False' || valueStr === 'FALSE') {
            return false;
        }

        // null
        if (valueStr === 'null' || valueStr === 'Null' || valueStr === 'NULL' || valueStr === '~') {
            return null;
        }

        // 数字
        const num = Number(valueStr);
        if (!isNaN(num) && valueStr !== '') {
            return num;
        }

        // 日期
        const dateRegex = /^\d{4}-\d{2}-\d{2}/;
        if (dateRegex.test(valueStr)) {
            return valueStr;
        }

        // 普通字符串
        return valueStr;
    }

    /**
     * 将对象转换为 YAML 字符串
     */
    function toYAML(obj, indent = 0) {
        const spaces = ' '.repeat(indent);
        let result = '';

        if (obj === null) {
            return 'null';
        }

        if (typeof obj === 'object') {
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    if (typeof item === 'object' && item !== null) {
                        const keys = Object.keys(item);
                        if (keys.length > 0) {
                            result += `${spaces}- ${keys[0]}: ${formatValue(item[keys[0]], indent + state.indent)}\n`;
                            const rest = {};
                            for (let i = 1; i < keys.length; i++) {
                                rest[keys[i]] = item[keys[i]];
                            }
                            if (Object.keys(rest).length > 0) {
                                result += toYAML(rest, indent + state.indent);
                            }
                        } else {
                            result += `${spaces}- {}\n`;
                        }
                    } else {
                        result += `${spaces}- ${formatValue(item, indent + state.indent)}\n`;
                    }
                }
            } else {
                for (const key of Object.keys(obj)) {
                    const value = obj[key];
                    if (typeof value === 'object' && value !== null) {
                        if (Array.isArray(value) && value.length === 0) {
                            result += `${spaces}${key}: []\n`;
                        } else if (!Array.isArray(value) && Object.keys(value).length === 0) {
                            result += `${spaces}${key}: {}\n`;
                        } else {
                            result += `${spaces}${key}:\n`;
                            result += toYAML(value, indent + state.indent);
                        }
                    } else {
                        result += `${spaces}${key}: ${formatValue(value, indent)}\n`;
                    }
                }
            }
        }

        return result;
    }

    /**
     * 格式化值
     */
    function formatValue(value, indent) {
        if (value === null) {
            return 'null';
        }
        if (typeof value === 'string') {
            // 如果包含特殊字符，用引号包裹
            if (value.includes(':') || value.includes('#') || value.includes('\n') ||
                value.includes('[') || value.includes(']') || value.includes('{') ||
                value.includes('}') || value.includes(',') ||
                value === 'true' || value === 'false' || value === 'null') {
                return `"${value.replace(/"/g, '\\"')}"`;
            }
            return value;
        }
        if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }
        if (typeof value === 'number') {
            return String(value);
        }
        return String(value);
    }

    // ===== 核心功能 =====

    // 格式化 YAML
    function formatYAML() {
        const input = elements.inputArea.value.trim();

        if (!input) {
            showToast('请输入 YAML 数据', 'error');
            return;
        }

        try {
            const parsed = parseYAML(input);
            const formatted = toYAML(parsed).trim();

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

    // 压缩 YAML
    function minifyYAML() {
        const input = elements.inputArea.value.trim();

        if (!input) {
            showToast('请输入 YAML 数据', 'error');
            return;
        }

        try {
            const parsed = parseYAML(input);
            // 生成最小化的 YAML（单行风格）
            const minified = minifyObject(parsed);

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

    /**
     * 压缩对象为内联 YAML 格式
     */
    function minifyObject(obj, depth = 0) {
        if (obj === null) return 'null';
        if (typeof obj !== 'object') return formatValue(obj, 0);

        if (Array.isArray(obj)) {
            const items = obj.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return `{ ${minifyObject(item, depth + 1)} }`;
                }
                return formatValue(item, 0);
            });
            return `[ ${items.join(', ')} ]`;
        }

        const pairs = Object.keys(obj).map(key => {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                return `${key}: { ${minifyObject(value, depth + 1)} }`;
            }
            return `${key}: ${formatValue(value, 0)}`;
        });

        return pairs.join(', ');
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
    function renderOutput(yaml) {
        const highlighted = syntaxHighlight(yaml);
        elements.outputCode.innerHTML = highlighted;
        updateLineNumbers(elements.outputLineNumbers, yaml);
    }

    // YAML 语法高亮
    function syntaxHighlight(yaml) {
        // 转义 HTML
        yaml = yaml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // 高亮处理
        let result = yaml;

        // 注释
        result = result.replace(/(#.*)$/gm, '<span class="yaml-comment">$1</span>');

        // 键（冒号前的内容）
        result = result.replace(/^(\s*)([^\s:]+)(:)/gm, '$1<span class="yaml-key">$2</span><span class="yaml-colon">$3</span>');

        // 列表项
        result = result.replace(/^(\s*)(- )/gm, '$1<span class="yaml-dash">$2</span>');

        // 布尔值
        result = result.replace(/\b(true|false|True|False|TRUE|FALSE)\b/g, '<span class="yaml-boolean">$1</span>');

        // null
        result = result.replace(/\b(null|Null|NULL|~)\b/g, '<span class="yaml-null">$1</span>');

        // 数字
        result = result.replace(/\b(-?\d+\.?\d*)\b/g, function(match, p1, offset, string) {
            // 确保不是在键里面
            const before = string.substring(0, offset);
            if (before.match(/:\s*$/)) {
                return '<span class="yaml-number">' + match + '</span>';
            }
            return match;
        });

        // 引号字符串
        result = result.replace(/(["'])(.*?)\1/g, '<span class="yaml-string">$1$2$1</span>');

        return result;
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
        state.indent = parseInt(value, 10);

        // 如果已有输出，重新格式化
        if (state.outputText) {
            formatYAML();
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
            formatYAML();
        }

        // Ctrl/Cmd + Shift + M: 压缩
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
            e.preventDefault();
            minifyYAML();
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

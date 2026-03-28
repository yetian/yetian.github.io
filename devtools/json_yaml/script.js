/**
 * JSON-YAML 转换器
 * 纯前端实现，支持双向转换、实时预览
 */
(function() {
    'use strict';

    // ===== 状态管理 =====
    const state = {
        mode: 'jsonToYaml', // 'jsonToYaml' | 'yamlToJson'
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
        jsonToYamlBtn: null,
        yamlToJsonBtn: null,
        convertBtn: null,
        clearBtn: null,
        swapBtn: null,
        copyBtn: null,
        pasteBtn: null,
        errorBar: null,
        errorMessage: null,
        errorClose: null,
        statusMsg: null,
        inputStats: null,
        outputStats: null,
        inputLabel: null,
        outputLabel: null
    };

    // ===== 初始化 =====
    function init() {
        // 获取 DOM 元素
        elements.inputArea = document.getElementById('inputArea');
        elements.outputCode = document.getElementById('outputCode');
        elements.inputLineNumbers = document.getElementById('inputLineNumbers');
        elements.outputLineNumbers = document.getElementById('outputLineNumbers');
        elements.indentSelect = document.getElementById('indentSelect');
        elements.jsonToYamlBtn = document.getElementById('jsonToYamlBtn');
        elements.yamlToJsonBtn = document.getElementById('yamlToJsonBtn');
        elements.convertBtn = document.getElementById('convertBtn');
        elements.clearBtn = document.getElementById('clearBtn');
        elements.swapBtn = document.getElementById('swapBtn');
        elements.copyBtn = document.getElementById('copyBtn');
        elements.pasteBtn = document.getElementById('pasteBtn');
        elements.errorBar = document.getElementById('errorBar');
        elements.errorMessage = document.getElementById('errorMessage');
        elements.errorClose = document.getElementById('errorClose');
        elements.statusMsg = document.getElementById('statusMsg');
        elements.inputStats = document.getElementById('inputStats');
        elements.outputStats = document.getElementById('outputStats');
        elements.inputLabel = document.getElementById('inputLabel');
        elements.outputLabel = document.getElementById('outputLabel');

        // 绑定事件
        bindEvents();

        // 初始化行号
        updateLineNumbers(elements.inputLineNumbers, '');
        updateLineNumbers(elements.outputLineNumbers, '');
    }

    // ===== 事件绑定 =====
    function bindEvents() {
        // 输入区域事件（实时转换）
        elements.inputArea.addEventListener('input', debounce(handleInput, 300));
        elements.inputArea.addEventListener('scroll', syncScroll);
        elements.inputArea.addEventListener('keydown', handleKeyDown);

        // 模式切换
        elements.jsonToYamlBtn.addEventListener('click', () => switchMode('jsonToYaml'));
        elements.yamlToJsonBtn.addEventListener('click', () => switchMode('yamlToJson'));

        // 按钮事件
        elements.convertBtn.addEventListener('click', convert);
        elements.clearBtn.addEventListener('click', clearAll);
        elements.swapBtn.addEventListener('click', swapContent);
        elements.copyBtn.addEventListener('click', copyOutput);
        elements.pasteBtn.addEventListener('click', pasteInput);

        // 缩进选择
        elements.indentSelect.addEventListener('change', handleIndentChange);

        // 错误关闭
        elements.errorClose.addEventListener('click', hideError);
    }

    // ===== 模式切换 =====
    function switchMode(mode) {
        state.mode = mode;

        // 更新按钮状态
        elements.jsonToYamlBtn.classList.toggle('active', mode === 'jsonToYaml');
        elements.yamlToJsonBtn.classList.toggle('active', mode === 'yamlToJson');

        // 更新标签
        if (mode === 'jsonToYaml') {
            elements.inputLabel.textContent = '输入 JSON';
            elements.outputLabel.textContent = 'YAML 输出';
            elements.inputArea.placeholder = '在此粘贴 JSON 数据...';
        } else {
            elements.inputLabel.textContent = '输入 YAML';
            elements.outputLabel.textContent = 'JSON 输出';
            elements.inputArea.placeholder = '在此粘贴 YAML 数据...';
        }

        // 清空输出
        elements.outputCode.innerHTML = '';
        state.outputText = '';
        updateLineNumbers(elements.outputLineNumbers, '');
        updateStats();
        hideError();

        elements.statusMsg.textContent = '已切换到 ' + (mode === 'jsonToYaml' ? 'JSON → YAML' : 'YAML → JSON') + ' 模式';
        elements.statusMsg.className = 'status-item';
    }

    // ===== 核心转换功能 =====

    // 主转换函数
    function convert() {
        const input = elements.inputArea.value.trim();

        if (!input) {
            showToast('请输入数据', 'error');
            return;
        }

        try {
            if (state.mode === 'jsonToYaml') {
                convertJsonToYaml(input);
            } else {
                convertYamlToJson(input);
            }
        } catch (e) {
            showError(e.message);
            elements.statusMsg.textContent = '转换失败';
            elements.statusMsg.className = 'status-item error';
        }
    }

    // JSON 转 YAML
    function convertJsonToYaml(jsonStr) {
        const parsed = JSON.parse(jsonStr);
        const yaml = jsonToYaml(parsed, state.indent);
        state.outputText = yaml;
        renderOutput(yaml, 'yaml');
        updateStats();
        hideError();
        showToast('转换成功', 'success');

        elements.statusMsg.textContent = '转换完成';
        elements.statusMsg.className = 'status-item success';
    }

    // YAML 转 JSON
    function convertYamlToJson(yamlStr) {
        const parsed = parseYaml(yamlStr);
        const indent = state.indent;
        const json = JSON.stringify(parsed, null, indent);
        state.outputText = json;
        renderOutput(json, 'json');
        updateStats();
        hideError();
        showToast('转换成功', 'success');

        elements.statusMsg.textContent = '转换完成';
        elements.statusMsg.className = 'status-item success';
    }

    // ===== JSON 转 YAML 实现 =====
    function jsonToYaml(data, indent, depth) {
        indent = indent || 2;
        depth = depth || 0;
        const spaces = ' '.repeat(depth * indent);

        if (data === null) {
            return 'null';
        }

        if (typeof data === 'boolean') {
            return data ? 'true' : 'false';
        }

        if (typeof data === 'number') {
            return String(data);
        }

        if (typeof data === 'string') {
            // 处理需要引号的字符串
            if (data.includes('\n') || data.includes(':') || data.includes('#') ||
                data.includes('[') || data.includes(']') || data.includes('{') ||
                data.includes('}') || data.includes('&') || data.includes('*') ||
                data.includes('?') || data.includes('|') || data.includes('-') ||
                data.includes('<') || data.includes('>') || data.includes('=') ||
                data.includes('!') || data.includes('%') || data.includes('@') ||
                data.includes('`') || data.includes(',') || data === '' ||
                data === 'true' || data === 'false' || data === 'null' ||
                /^[0-9]/.test(data) || /^\s/.test(data) || /\s$/.test(data)) {
                // 多行字符串使用 |
                if (data.includes('\n')) {
                    const lines = data.split('\n');
                    return '|\n' + lines.map(line => spaces + '  ' + line).join('\n');
                }
                // 使用双引号并转义
                return '"' + data.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
            }
            return data;
        }

        if (Array.isArray(data)) {
            if (data.length === 0) {
                return '[]';
            }
            return data.map(item => {
                const value = jsonToYaml(item, indent, depth + 1);
                if (typeof item === 'object' && item !== null) {
                    return '- ' + value.replace(/^/, '').replace(/\n/g, '\n' + spaces + '  ');
                }
                return '- ' + value;
            }).join('\n' + spaces);
        }

        if (typeof data === 'object') {
            const keys = Object.keys(data);
            if (keys.length === 0) {
                return '{}';
            }
            return keys.map(key => {
                const value = data[key];
                const yamlKey = /^[a-zA-Z0-9_]+$/.test(key) ? key : '"' + key + '"';
                const yamlValue = jsonToYaml(value, indent, depth + 1);

                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value) && value.length > 0) {
                        return yamlKey + ':\n' + spaces + '  ' + yamlValue;
                    } else if (!Array.isArray(value) && Object.keys(value).length > 0) {
                        return yamlKey + ':\n' + spaces + '  ' + yamlValue;
                    }
                }
                return yamlKey + ': ' + yamlValue;
            }).join('\n' + spaces);
        }

        return String(data);
    }

    // ===== YAML 解析器 =====
    function parseYaml(yaml) {
        const lines = yaml.split('\n');
        let currentLine = 0;

        function parseValue(indent) {
            indent = indent || 0;

            if (currentLine >= lines.length) {
                return null;
            }

            const line = lines[currentLine];
            const trimmed = line.trim();

            // 跳过空行和注释
            if (trimmed === '' || trimmed.startsWith('#')) {
                currentLine++;
                return parseValue(indent);
            }

            const currentIndent = line.search(/\S|$/);

            // 检查是否是列表项
            if (trimmed.startsWith('- ')) {
                const result = [];
                while (currentLine < lines.length) {
                    const currentL = lines[currentLine];
                    const currentT = currentL.trim();
                    const currentI = currentL.search(/\S|$/);

                    if (currentT === '' || currentT.startsWith('#')) {
                        currentLine++;
                        continue;
                    }

                    if (currentI < indent) break;

                    if (currentT.startsWith('- ')) {
                        currentLine++;
                        const itemValue = currentT.substring(2).trim();
                        let item;

                        if (itemValue === '' || itemValue.startsWith('#')) {
                            // 检查下一行
                            if (currentLine < lines.length) {
                                const nextLine = lines[currentLine];
                                const nextIndent = nextLine.search(/\S|$/);
                                if (nextIndent > currentI) {
                                    item = parseValue(nextIndent);
                                } else {
                                    item = null;
                                }
                            } else {
                                item = null;
                            }
                        } else if (itemValue.endsWith(':')) {
                            // 列表项是对象
                            const key = itemValue.slice(0, -1).trim();
                            currentLine++;
                            const nextIndent = currentLine < lines.length ? lines[currentLine].search(/\S|$/) : currentI + 2;
                            const nestedValue = nextIndent > currentI ? parseValue(nextIndent) : null;
                            item = { [key]: nestedValue };
                        } else {
                            item = parseScalar(itemValue);
                        }
                        result.push(item);
                    } else {
                        break;
                    }
                }
                return result;
            }

            // 检查是否是键值对
            const colonIndex = findColon(trimmed);
            if (colonIndex !== -1) {
                const result = {};
                while (currentLine < lines.length) {
                    const currentL = lines[currentLine];
                    const currentT = currentL.trim();
                    const currentI = currentL.search(/\S|$/);

                    if (currentT === '' || currentT.startsWith('#')) {
                        currentLine++;
                        continue;
                    }

                    if (currentI < indent) break;

                    const colon = findColon(currentT);
                    if (colon !== -1 && !currentT.startsWith('-')) {
                        let key = currentT.substring(0, colon).trim();
                        // 移除引号
                        if ((key.startsWith('"') && key.endsWith('"')) ||
                            (key.startsWith("'") && key.endsWith("'"))) {
                            key = key.slice(1, -1);
                        }

                        let valueStr = currentT.substring(colon + 1).trim();
                        currentLine++;

                        let value;
                        if (valueStr === '' || valueStr.startsWith('#')) {
                            // 检查下一行
                            if (currentLine < lines.length) {
                                const nextLine = lines[currentLine];
                                const nextIndent = nextLine.search(/\S|$/);
                                if (nextIndent > currentI) {
                                    value = parseValue(nextIndent);
                                } else {
                                    value = null;
                                }
                            } else {
                                value = null;
                            }
                        } else {
                            value = parseScalar(valueStr);
                        }

                        result[key] = value;
                    } else {
                        break;
                    }
                }
                return result;
            }

            // 标量值
            currentLine++;
            return parseScalar(trimmed);
        }

        function findColon(str) {
            let inQuote = false;
            let quoteChar = '';
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                if ((char === '"' || char === "'") && !inQuote) {
                    inQuote = true;
                    quoteChar = char;
                } else if (char === quoteChar && inQuote) {
                    inQuote = false;
                } else if (char === ':' && !inQuote) {
                    return i;
                }
            }
            return -1;
        }

        function parseScalar(value) {
            // 移除注释
            const commentIndex = value.indexOf('#');
            if (commentIndex !== -1) {
                let inQuote = false;
                let quoteChar = '';
                for (let i = 0; i < commentIndex; i++) {
                    if ((value[i] === '"' || value[i] === "'") && !inQuote) {
                        inQuote = true;
                        quoteChar = value[i];
                    } else if (value[i] === quoteChar && inQuote) {
                        inQuote = false;
                    }
                }
                if (!inQuote) {
                    value = value.substring(0, commentIndex).trim();
                }
            }

            // 空值
            if (value === '' || value === '~') {
                return null;
            }

            // 布尔值
            if (value === 'true') return true;
            if (value === 'false') return false;

            // null
            if (value === 'null') return null;

            // 数字
            const num = Number(value);
            if (!isNaN(num) && value !== '') {
                return num;
            }

            // 引号字符串
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                const inner = value.slice(1, -1);
                // 处理转义
                if (value.startsWith('"')) {
                    return inner.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                }
                return inner;
            }

            return value;
        }

        currentLine = 0;
        return parseValue(0);
    }

    // ===== 渲染函数 =====

    // 渲染输出（带语法高亮）
    function renderOutput(text, type) {
        const highlighted = type === 'yaml' ? highlightYaml(text) : highlightJson(text);
        elements.outputCode.innerHTML = highlighted;
        updateLineNumbers(elements.outputLineNumbers, text);
    }

    // JSON 语法高亮
    function highlightJson(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function(match) {
                let cls = 'yaml-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'yaml-key';
                    } else {
                        cls = 'yaml-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'yaml-boolean';
                } else if (/null/.test(match)) {
                    cls = 'yaml-null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            }
        );
    }

    // YAML 语法高亮
    function highlightYaml(yaml) {
        yaml = yaml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const lines = yaml.split('\n');
        return lines.map(line => {
            // 注释
            if (line.trim().startsWith('#')) {
                return '<span class="yaml-comment">' + line + '</span>';
            }

            // 键值对
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const key = line.substring(0, colonIndex);
                const value = line.substring(colonIndex + 1);

                // 检查值类型并高亮
                let highlightedValue = value;
                const trimmedValue = value.trim();

                if (trimmedValue === 'true' || trimmedValue === 'false') {
                    highlightedValue = value.replace(trimmedValue, '<span class="yaml-boolean">' + trimmedValue + '</span>');
                } else if (trimmedValue === 'null' || trimmedValue === '~') {
                    highlightedValue = value.replace(trimmedValue, '<span class="yaml-null">' + trimmedValue + '</span>');
                } else if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
                    highlightedValue = value.replace(trimmedValue, '<span class="yaml-number">' + trimmedValue + '</span>');
                } else if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
                    highlightedValue = value.replace(trimmedValue, '<span class="yaml-string">' + trimmedValue + '</span>');
                }

                return '<span class="yaml-key">' + key + '</span>:' + highlightedValue;
            }

            // 列表项
            if (line.trim().startsWith('- ')) {
                const match = line.match(/^(\s*)(-)(\s+)(.*)$/);
                if (match) {
                    const indent = match[1];
                    const dash = match[2];
                    const space = match[3];
                    let value = match[4];

                    if (value === 'true' || value === 'false') {
                        value = '<span class="yaml-boolean">' + value + '</span>';
                    } else if (value === 'null' || value === '~') {
                        value = '<span class="yaml-null">' + value + '</span>';
                    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
                        value = '<span class="yaml-number">' + value + '</span>';
                    } else if (value.startsWith('"') && value.endsWith('"')) {
                        value = '<span class="yaml-string">' + value + '</span>';
                    }

                    return indent + dash + space + value;
                }
            }

            return line;
        }).join('\n');
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

    // ===== 辅助功能 =====

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

    // 交换内容
    function swapContent() {
        if (!state.outputText) {
            showToast('没有可交换的内容', 'error');
            return;
        }

        // 保存当前输出
        const temp = state.outputText;

        // 切换模式
        switchMode(state.mode === 'jsonToYaml' ? 'yamlToJson' : 'jsonToYaml');

        // 设置输入
        elements.inputArea.value = temp;
        state.inputText = temp;
        updateLineNumbers(elements.inputLineNumbers, temp);
        updateStats();

        // 自动转换
        convert();
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

    // ===== 事件处理 =====

    // 输入处理（实时转换）
    function handleInput() {
        const input = elements.inputArea.value;
        state.inputText = input;
        updateLineNumbers(elements.inputLineNumbers, input);
        updateStats();

        // 实时转换
        if (input.trim()) {
            convert();
        } else {
            elements.outputCode.innerHTML = '';
            state.outputText = '';
            updateLineNumbers(elements.outputLineNumbers, '');
        }
    }

    // 缩进变更
    function handleIndentChange() {
        state.indent = parseInt(elements.indentSelect.value, 10);

        // 如果已有输出，重新转换
        if (state.outputText) {
            convert();
        }
    }

    // 滚动同步
    function syncScroll() {
        elements.inputLineNumbers.scrollTop = elements.inputArea.scrollTop;
    }

    // 键盘快捷键
    function handleKeyDown(e) {
        // Ctrl/Cmd + Enter: 转换
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            convert();
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
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast ' + (type || '');
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

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

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // ===== 启动 =====
    document.addEventListener('DOMContentLoaded', init);
})();

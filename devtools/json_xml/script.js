(function() {
    'use strict';

    // ===== 状态管理 =====
    const state = {
        mode: 'json2xml', // 'json2xml' or 'xml2json'
        autoConvert: true
    };

    // ===== DOM 元素 =====
    const dom = {
        inputArea: document.getElementById('inputArea'),
        outputArea: document.getElementById('outputArea'),
        inputLineNumbers: document.getElementById('inputLineNumbers'),
        outputLineNumbers: document.getElementById('outputLineNumbers'),
        inputTitle: document.getElementById('inputTitle'),
        outputTitle: document.getElementById('outputTitle'),
        inputCharCount: document.getElementById('inputCharCount'),
        inputLineCount: document.getElementById('inputLineCount'),
        outputCharCount: document.getElementById('outputCharCount'),
        outputLineCount: document.getElementById('outputLineCount'),
        statusMsg: document.getElementById('statusMsg'),
        rootElement: document.getElementById('rootElement'),
        indentSize: document.getElementById('indentSize'),
        autoConvert: document.getElementById('autoConvert'),
        convertBtn: document.getElementById('convertBtn'),
        swapBtn: document.getElementById('swapBtn'),
        clearBtn: document.getElementById('clearBtn'),
        formatBtn: document.getElementById('formatBtn'),
        pasteBtn: document.getElementById('pasteBtn'),
        copyBtn: document.getElementById('copyBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        modeSwitchIndicator: document.querySelector('.mode-switch-indicator'),
        modeBtns: document.querySelectorAll('.mode-btn'),
        toast: document.getElementById('toast'),
        toastIcon: document.getElementById('toastIcon'),
        toastMessage: document.getElementById('toastMessage')
    };

    // ===== Toast 提示 =====
    function showToast(message, type = 'info') {
        dom.toast.className = 'toast show ' + type;
        dom.toastMessage.textContent = message;
        dom.toastIcon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠';

        setTimeout(() => {
            dom.toast.classList.remove('show');
        }, 3000);
    }

    // ===== 更新状态消息 =====
    function updateStatus(message, type = '') {
        dom.statusMsg.textContent = message;
        dom.statusMsg.className = 'status-item ' + type;
    }

    // ===== 更新行号 =====
    function updateLineNumbers(textarea, lineNumbersEl) {
        const lines = textarea.value.split('\n').length;
        let html = '';
        for (let i = 1; i <= lines; i++) {
            html += '<span>' + i + '</span>';
        }
        lineNumbersEl.innerHTML = html;
    }

    // ===== 更新统计 =====
    function updateStats(text, charEl, lineEl) {
        const chars = text.length;
        const lines = text ? text.split('\n').length : 0;
        charEl.textContent = chars + ' 字符';
        lineEl.textContent = lines + ' 行';
    }

    // ===== JSON 转 XML =====
    function jsonToXml(obj, rootName, indent, level = 0) {
        const indentStr = ' '.repeat(indent);
        const currentIndent = indentStr.repeat(level);
        let xml = '';

        function escapeXml(str) {
            if (typeof str !== 'string') return str;
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }

        function isValidTagName(name) {
            // XML 标签名必须以字母或下划线开头，只能包含字母、数字、连字符、下划线和点
            return /^[a-zA-Z_][a-zA-Z0-9_\-.]*$/.test(name);
        }

        function sanitizeTagName(name) {
            // 将无效字符替换为下划线
            let sanitized = String(name).replace(/[^a-zA-Z0-9_\-.]/g, '_');
            // 确保以字母或下划线开头
            if (!/^[a-zA-Z_]/.test(sanitized)) {
                sanitized = '_' + sanitized;
            }
            return sanitized || 'item';
        }

        function processValue(key, value, indentLevel) {
            const ind = indentStr.repeat(indentLevel);
            const childIndent = indentStr.repeat(indentLevel + 1);
            const tagName = isValidTagName(key) ? key : sanitizeTagName(key);

            if (value === null || value === undefined) {
                return ind + '<' + tagName + '/>\n';
            } else if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    let result = '';
                    value.forEach((item, index) => {
                        const itemTagName = tagName;
                        if (typeof item === 'object' && item !== null) {
                            result += ind + '<' + itemTagName + '>\n';
                            result += processObject(item, indentLevel + 1);
                            result += ind + '</' + itemTagName + '>\n';
                        } else {
                            result += processValue(itemTagName, item, indentLevel);
                        }
                    });
                    return result;
                } else {
                    let result = ind + '<' + tagName + '>\n';
                    result += processObject(value, indentLevel + 1);
                    result += ind + '</' + tagName + '>\n';
                    return result;
                }
            } else {
                const escaped = escapeXml(String(value));
                return ind + '<' + tagName + '>' + escaped + '</' + tagName + '>\n';
            }
        }

        function processObject(obj, indentLevel) {
            let result = '';
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result += processValue(key, obj[key], indentLevel);
                }
            }
            return result;
        }

        // 开始转换
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
            xml = currentIndent + '<' + rootName + '>\n';
            xml += processObject(obj, level + 1);
            xml += currentIndent + '</' + rootName + '>\n';
        } else if (Array.isArray(obj)) {
            xml = currentIndent + '<' + rootName + '>\n';
            obj.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    xml += currentIndent + indentStr + '<item>\n';
                    xml += processObject(item, level + 2);
                    xml += currentIndent + indentStr + '</item>\n';
                } else {
                    xml += processValue('item', item, level + 1);
                }
            });
            xml += currentIndent + '</' + rootName + '>\n';
        } else {
            xml = currentIndent + '<' + rootName + '>' + escapeXml(String(obj)) + '</' + rootName + '>\n';
        }

        return xml;
    }

    // ===== XML 转 JSON =====
    function xmlToJson(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        // 检查解析错误
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error('XML 解析错误: ' + parseError.textContent);
        }

        function parseNode(node) {
            const obj = {};

            // 处理属性
            if (node.attributes && node.attributes.length > 0) {
                obj['@attributes'] = {};
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    obj['@attributes'][attr.nodeName] = attr.nodeValue;
                }
            }

            // 处理子节点
            if (node.hasChildNodes()) {
                const children = node.childNodes;
                let hasElementChildren = false;
                const textContent = [];

                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.nodeType === Node.ELEMENT_NODE) {
                        hasElementChildren = true;
                        const childName = child.nodeName;
                        const childValue = parseNode(child);

                        if (obj.hasOwnProperty(childName)) {
                            // 如果已存在同名元素，转换为数组
                            if (!Array.isArray(obj[childName])) {
                                obj[childName] = [obj[childName]];
                            }
                            obj[childName].push(childValue);
                        } else {
                            obj[childName] = childValue;
                        }
                    } else if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
                        const text = child.nodeValue.trim();
                        if (text) {
                            textContent.push(text);
                        }
                    }
                }

                // 如果没有元素子节点，返回文本内容
                if (!hasElementChildren) {
                    if (textContent.length === 0) {
                        return null;
                    } else if (textContent.length === 1) {
                        // 尝试转换数字和布尔值
                        const text = textContent[0];
                        if (!isNaN(text) && text !== '') {
                            return text.includes('.') ? parseFloat(text) : parseInt(text, 10);
                        }
                        if (text.toLowerCase() === 'true') return true;
                        if (text.toLowerCase() === 'false') return false;
                        return text;
                    } else {
                        return textContent.join(' ');
                    }
                }
            }

            return obj;
        }

        const root = xmlDoc.documentElement;
        const result = {};
        result[root.nodeName] = parseNode(root);

        return result;
    }

    // ===== 格式化 JSON =====
    function formatJson(jsonString) {
        const obj = JSON.parse(jsonString);
        return JSON.stringify(obj, null, parseInt(dom.indentSize.value));
    }

    // ===== 格式化 XML =====
    function formatXml(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error('XML 解析错误');
        }

        const serializer = new XMLSerializer();
        let formatted = '';
        const indent = ' '.repeat(parseInt(dom.indentSize.value));
        let level = 0;

        function processNode(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const hasChildren = node.hasChildNodes();
                const hasElementChildren = Array.from(node.childNodes).some(n => n.nodeType === Node.ELEMENT_NODE);
                const tagName = node.nodeName;

                // 开始标签
                formatted += indent.repeat(level) + '<' + tagName;

                // 属性
                if (node.attributes) {
                    for (let i = 0; i < node.attributes.length; i++) {
                        const attr = node.attributes[i];
                        formatted += ' ' + attr.nodeName + '="' + attr.nodeValue + '"';
                    }
                }

                if (!hasChildren) {
                    formatted += '/>\n';
                } else if (!hasElementChildren) {
                    // 只有文本内容
                    const text = node.textContent.trim();
                    formatted += '>' + text + '</' + tagName + '>\n';
                } else {
                    formatted += '>\n';
                    level++;
                    for (let i = 0; i < node.childNodes.length; i++) {
                        processNode(node.childNodes[i]);
                    }
                    level--;
                    formatted += indent.repeat(level) + '</' + tagName + '>\n';
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.nodeValue.trim();
                if (text) {
                    formatted += indent.repeat(level) + text + '\n';
                }
            }
        }

        processNode(xmlDoc.documentElement);
        return formatted;
    }

    // ===== 执行转换 =====
    function convert() {
        const input = dom.inputArea.value.trim();

        if (!input) {
            dom.outputArea.value = '';
            updateStats('', dom.outputCharCount, dom.outputLineCount);
            updateLineNumbers(dom.outputArea, dom.outputLineNumbers);
            updateStatus('就绪');
            return;
        }

        try {
            let output;
            const indent = parseInt(dom.indentSize.value);

            if (state.mode === 'json2xml') {
                const jsonObj = JSON.parse(input);
                const rootName = dom.rootElement.value || 'root';
                output = jsonToXml(jsonObj, rootName, indent);
                output = '<?xml version="1.0" encoding="UTF-8"?>\n' + output;
            } else {
                const jsonObj = xmlToJson(input);
                output = JSON.stringify(jsonObj, null, indent);
            }

            dom.outputArea.value = output;
            updateStats(output, dom.outputCharCount, dom.outputLineCount);
            updateLineNumbers(dom.outputArea, dom.outputLineNumbers);
            updateStatus('转换成功', 'success');
        } catch (e) {
            dom.outputArea.value = '';
            updateStats('', dom.outputCharCount, dom.outputLineCount);
            updateLineNumbers(dom.outputArea, dom.outputLineNumbers);
            updateStatus('转换失败: ' + e.message, 'error');
            showToast('转换失败: ' + e.message, 'error');
        }
    }

    // ===== 格式化输入 =====
    function formatInput() {
        const input = dom.inputArea.value.trim();
        if (!input) return;

        try {
            let formatted;
            if (state.mode === 'json2xml') {
                formatted = formatJson(input);
            } else {
                formatted = formatXml(input);
            }
            dom.inputArea.value = formatted;
            updateLineNumbers(dom.inputArea, dom.inputLineNumbers);
            updateStats(formatted, dom.inputCharCount, dom.inputLineCount);
            showToast('格式化成功', 'success');
        } catch (e) {
            showToast('格式化失败: ' + e.message, 'error');
        }
    }

    // ===== 切换模式 =====
    function switchMode(mode) {
        state.mode = mode;

        // 更新按钮状态
        dom.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // 更新指示器位置
        const activeBtn = document.querySelector('.mode-btn.active');
        if (activeBtn && dom.modeSwitchIndicator) {
            dom.modeSwitchIndicator.style.width = activeBtn.offsetWidth + 'px';
            dom.modeSwitchIndicator.style.left = activeBtn.offsetLeft + 'px';
        }

        // 更新面板标题
        if (mode === 'json2xml') {
            dom.inputTitle.textContent = 'JSON 输入';
            dom.outputTitle.textContent = 'XML 输出';
            dom.inputArea.placeholder = '在此输入 JSON...';
        } else {
            dom.inputTitle.textContent = 'XML 输入';
            dom.outputTitle.textContent = 'JSON 输出';
            dom.inputArea.placeholder = '在此输入 XML...';
        }

        // 清空输出
        dom.outputArea.value = '';
        updateStats('', dom.outputCharCount, dom.outputLineCount);
        updateLineNumbers(dom.outputArea, dom.outputLineNumbers);

        // 如果有内容，自动转换
        if (dom.inputArea.value.trim() && state.autoConvert) {
            convert();
        }
    }

    // ===== 交换内容 =====
    function swapContent() {
        const output = dom.outputArea.value.trim();
        if (!output) {
            showToast('没有可交换的内容', 'warning');
            return;
        }

        // 切换模式
        const newMode = state.mode === 'json2xml' ? 'xml2json' : 'json2xml';
        switchMode(newMode);

        // 设置输入为之前的输出
        dom.inputArea.value = output;
        updateLineNumbers(dom.inputArea, dom.inputLineNumbers);
        updateStats(output, dom.inputCharCount, dom.inputLineCount);

        // 执行转换
        convert();

        showToast('已交换并转换', 'success');
    }

    // ===== 清空内容 =====
    function clearContent() {
        dom.inputArea.value = '';
        dom.outputArea.value = '';
        updateLineNumbers(dom.inputArea, dom.inputLineNumbers);
        updateLineNumbers(dom.outputArea, dom.outputLineNumbers);
        updateStats('', dom.inputCharCount, dom.inputLineCount);
        updateStats('', dom.outputCharCount, dom.outputLineCount);
        updateStatus('已清空');
        dom.inputArea.focus();
    }

    // ===== 复制输出 =====
    async function copyOutput() {
        const output = dom.outputArea.value;
        if (!output) {
            showToast('没有可复制的内容', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(output);
            showToast('已复制到剪贴板', 'success');
        } catch (e) {
            showToast('复制失败', 'error');
        }
    }

    // ===== 下载输出 =====
    function downloadOutput() {
        const output = dom.outputArea.value;
        if (!output) {
            showToast('没有可下载的内容', 'warning');
            return;
        }

        const ext = state.mode === 'json2xml' ? 'xml' : 'json';
        const mimeType = state.mode === 'json2xml' ? 'application/xml' : 'application/json';
        const filename = 'converted.' + ext;

        const blob = new Blob([output], { type: mimeType + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        showToast('已下载 ' + filename, 'success');
    }

    // ===== 粘贴 =====
    async function pasteInput() {
        try {
            const text = await navigator.clipboard.readText();
            dom.inputArea.value = text;
            updateLineNumbers(dom.inputArea, dom.inputLineNumbers);
            updateStats(text, dom.inputCharCount, dom.inputLineCount);
            showToast('已粘贴', 'success');

            if (state.autoConvert) {
                convert();
            }
        } catch (e) {
            showToast('粘贴失败，请手动粘贴', 'error');
        }
    }

    // ===== 事件绑定 =====
    function bindEvents() {
        // 输入变化
        let debounceTimer;
        dom.inputArea.addEventListener('input', () => {
            updateLineNumbers(dom.inputArea, dom.inputLineNumbers);
            updateStats(dom.inputArea.value, dom.inputCharCount, dom.inputLineCount);

            if (state.autoConvert) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(convert, 300);
            }
        });

        // 滚动同步
        dom.inputArea.addEventListener('scroll', () => {
            dom.inputLineNumbers.scrollTop = dom.inputArea.scrollTop;
        });

        dom.outputArea.addEventListener('scroll', () => {
            dom.outputLineNumbers.scrollTop = dom.outputArea.scrollTop;
        });

        // 模式切换
        dom.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.classList.contains('active')) {
                    switchMode(btn.dataset.mode);
                }
            });
        });

        // 按钮事件
        dom.convertBtn.addEventListener('click', convert);
        dom.swapBtn.addEventListener('click', swapContent);
        dom.clearBtn.addEventListener('click', clearContent);
        dom.formatBtn.addEventListener('click', formatInput);
        dom.pasteBtn.addEventListener('click', pasteInput);
        dom.copyBtn.addEventListener('click', copyOutput);
        dom.downloadBtn.addEventListener('click', downloadOutput);

        // 设置变化
        dom.autoConvert.addEventListener('change', (e) => {
            state.autoConvert = e.target.checked;
        });

        // 快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter 转换
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                convert();
            }
            // Ctrl+Shift+F 格式化
            if (e.ctrlKey && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                formatInput();
            }
        });

        // 窗口大小变化
        window.addEventListener('resize', () => {
            const activeBtn = document.querySelector('.mode-btn.active');
            if (activeBtn && dom.modeSwitchIndicator) {
                dom.modeSwitchIndicator.style.width = activeBtn.offsetWidth + 'px';
                dom.modeSwitchIndicator.style.left = activeBtn.offsetLeft + 'px';
            }
        });
    }

    // ===== 初始化 =====
    function init() {
        bindEvents();
        updateLineNumbers(dom.inputArea, dom.inputLineNumbers);
        updateLineNumbers(dom.outputArea, dom.outputLineNumbers);
        switchMode('json2xml');

        // 设置示例 JSON
        const exampleJson = {
            "name": "张三",
            "age": 28,
            "email": "zhangsan@example.com",
            "skills": ["JavaScript", "Python", "Java"],
            "address": {
                "city": "北京",
                "street": "朝阳区",
                "zipCode": "100000"
            },
            "active": true
        };
        dom.inputArea.value = JSON.stringify(exampleJson, null, 4);
        updateLineNumbers(dom.inputArea, dom.inputLineNumbers);
        updateStats(dom.inputArea.value, dom.inputCharCount, dom.inputLineCount);

        // 自动转换
        setTimeout(convert, 100);
    }

    // 启动
    init();
})();

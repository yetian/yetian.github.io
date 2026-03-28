// JSON 验证器
(function() {
    'use strict';

    // ===== DOM 元素 =====
    const jsonInput = document.getElementById('jsonInput');
    const lineNumbers = document.getElementById('lineNumbers');
    const validateBtn = document.getElementById('validateBtn');
    const formatBtn = document.getElementById('formatBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statusBadge = document.getElementById('statusBadge');
    const resultContent = document.getElementById('resultContent');
    const summaryPanel = document.getElementById('summaryPanel');
    const charCount = document.getElementById('charCount');
    const lineCount = document.getElementById('lineCount');

    // 摘要元素
    const summaryType = document.getElementById('summaryType');
    const summaryKeys = document.getElementById('summaryKeys');
    const summaryDepth = document.getElementById('summaryDepth');
    const summaryArrayItems = document.getElementById('summaryArrayItems');

    // ===== 更新行号 =====
    function updateLineNumbers() {
        const lines = jsonInput.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) =>
            `<span>${i + 1}</span>`
        ).join('');
    }

    // ===== 更新统计 =====
    function updateStats() {
        const text = jsonInput.value;
        charCount.textContent = `${text.length} 字符`;
        lineCount.textContent = `${text.split('\n').length} 行`;
    }

    // ===== JSON 验证 =====
    function validateJSON(jsonString) {
        if (!jsonString.trim()) {
            return {
                valid: false,
                error: '请输入 JSON 数据',
                line: null,
                column: null
            };
        }

        try {
            const parsed = JSON.parse(jsonString);
            return {
                valid: true,
                data: parsed
            };
        } catch (e) {
            // 解析错误信息，提取行号和列号
            const match = e.message.match(/position\s+(\d+)/);
            let line = null;
            let column = null;

            if (match) {
                const position = parseInt(match[1]);
                const lines = jsonString.substring(0, position).split('\n');
                line = lines.length;
                column = lines[lines.length - 1].length + 1;
            }

            // 尝试提取更友好的错误信息
            let errorMessage = e.message;
            if (errorMessage.includes('Unexpected token')) {
                errorMessage = errorMessage.replace('Unexpected token', '意外的标记');
            } else if (errorMessage.includes('Unexpected end of JSON input')) {
                errorMessage = 'JSON 数据不完整，可能缺少闭合的括号或引号';
            } else if (errorMessage.includes('Expected property name')) {
                errorMessage = '期望属性名，可能缺少键或逗号';
            }

            return {
                valid: false,
                error: errorMessage,
                line: line,
                column: column
            };
        }
    }

    // ===== 分析 JSON 结构 =====
    function analyzeJSON(data) {
        const analysis = {
            type: getDataType(data),
            keyCount: 0,
            maxDepth: 0,
            arrayItemCount: 0
        };

        function traverse(obj, depth) {
            analysis.maxDepth = Math.max(analysis.maxDepth, depth);

            if (Array.isArray(obj)) {
                analysis.arrayItemCount += obj.length;
                obj.forEach(item => traverse(item, depth + 1));
            } else if (typeof obj === 'object' && obj !== null) {
                const keys = Object.keys(obj);
                analysis.keyCount += keys.length;
                keys.forEach(key => traverse(obj[key], depth + 1));
            }
        }

        traverse(data, 1);
        return analysis;
    }

    function getDataType(data) {
        if (Array.isArray(data)) return '数组 (Array)';
        if (data === null) return 'null';
        if (typeof data === 'object') return '对象 (Object)';
        return typeof data;
    }

    // ===== 语法高亮 =====
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
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
        });
    }

    // ===== 显示结果 =====
    function showResult(result) {
        if (result.valid) {
            // 成功状态
            statusBadge.className = 'status-badge valid';
            statusBadge.innerHTML = `
                <span class="status-icon">✓</span>
                <span class="status-text">格式正确</span>
            `;

            // 显示高亮的 JSON
            const highlighted = syntaxHighlight(result.data);
            resultContent.innerHTML = `
                <div class="success-container">
                    <div class="success-header">
                        <span class="success-icon">✓</span>
                        <span>JSON 格式验证通过</span>
                    </div>
                    <div class="json-highlight">${highlighted}</div>
                </div>
            `;

            // 显示结构摘要
            const analysis = analyzeJSON(result.data);
            summaryType.textContent = analysis.type;
            summaryKeys.textContent = analysis.keyCount;
            summaryDepth.textContent = analysis.maxDepth;
            summaryArrayItems.textContent = analysis.arrayItemCount;
            summaryPanel.classList.remove('hidden');
        } else {
            // 错误状态
            statusBadge.className = 'status-badge invalid';
            statusBadge.innerHTML = `
                <span class="status-icon">✗</span>
                <span class="status-text">格式错误</span>
            `;

            // 显示错误信息
            let errorHtml = `
                <div class="error-container">
                    <div class="error-header">
                        <span class="error-icon">✗</span>
                        <span>JSON 格式验证失败</span>
                    </div>
                    <div class="error-message">${result.error}</div>
            `;

            if (result.line !== null) {
                errorHtml += `
                    <div class="error-location">
                        位置：<strong>第 ${result.line} 行</strong>，第 ${result.column} 列
                    </div>
                `;
            }

            errorHtml += '</div>';
            resultContent.innerHTML = errorHtml;

            // 隐藏结构摘要
            summaryPanel.classList.add('hidden');
        }
    }

    // ===== 格式化 JSON =====
    function formatJSON() {
        const input = jsonInput.value.trim();
        if (!input) return;

        try {
            const parsed = JSON.parse(input);
            jsonInput.value = JSON.stringify(parsed, null, 2);
            updateLineNumbers();
            updateStats();
        } catch (e) {
            // 如果解析失败，不做任何操作
        }
    }

    // ===== 清空内容 =====
    function clearContent() {
        jsonInput.value = '';
        updateLineNumbers();
        updateStats();

        statusBadge.className = 'status-badge';
        statusBadge.innerHTML = `
            <span class="status-icon">●</span>
            <span class="status-text">等待验证</span>
        `;

        resultContent.innerHTML = `
            <div class="result-placeholder">
                <div class="placeholder-icon">📋</div>
                <p>点击"验证"按钮检查 JSON 格式</p>
            </div>
        `;

        summaryPanel.classList.add('hidden');
    }

    // ===== 拖拽文件支持 =====
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                jsonInput.value = event.target.result;
                updateLineNumbers();
                updateStats();
            };
            reader.readAsText(file);
        }

        jsonInput.parentElement.classList.remove('drag-over');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        jsonInput.parentElement.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        jsonInput.parentElement.classList.remove('drag-over');
    }

    // ===== 事件绑定 =====
    jsonInput.addEventListener('input', () => {
        updateLineNumbers();
        updateStats();
    });

    jsonInput.addEventListener('scroll', () => {
        lineNumbers.scrollTop = jsonInput.scrollTop;
    });

    validateBtn.addEventListener('click', () => {
        const result = validateJSON(jsonInput.value);
        showResult(result);
    });

    formatBtn.addEventListener('click', formatJSON);
    clearBtn.addEventListener('click', clearContent);

    // 拖拽事件
    const editorWrapper = document.querySelector('.editor-wrapper');
    editorWrapper.addEventListener('drop', handleDrop);
    editorWrapper.addEventListener('dragover', handleDragOver);
    editorWrapper.addEventListener('dragleave', handleDragLeave);

    // Tab 键支持
    jsonInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = jsonInput.selectionStart;
            const end = jsonInput.selectionEnd;
            jsonInput.value = jsonInput.value.substring(0, start) + '    ' + jsonInput.value.substring(end);
            jsonInput.selectionStart = jsonInput.selectionEnd = start + 4;
            updateLineNumbers();
        }
    });

    // Ctrl+Enter 快捷键验证
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            validateBtn.click();
        }
    });

    // ===== 初始化 =====
    updateLineNumbers();
    updateStats();
})();

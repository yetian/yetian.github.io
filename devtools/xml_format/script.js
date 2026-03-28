// XML 格式化工具 - JavaScript
(function() {
    'use strict';

    // State
    let state = {
        xmlDocument: null,
        lastValidXml: null
    };

    // DOM Elements
    const xmlInput = document.getElementById('xmlInput');
    const xmlOutput = document.getElementById('xmlOutput');
    const indentSelect = document.getElementById('indentSelect');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const validateBtn = document.getElementById('validateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const xpathInput = document.getElementById('xpathInput');
    const xpathBtn = document.getElementById('xpathBtn');
    const xpathResults = document.getElementById('xpathResults');
    const validationSection = document.getElementById('validationSection');
    const validationIcon = document.getElementById('validationIcon');
    const validationText = document.getElementById('validationText');
    const validationDetails = document.getElementById('validationDetails');
    const inputCount = document.getElementById('inputCount');
    const outputCount = document.getElementById('outputCount');
    const statusMsg = document.getElementById('statusMsg');

    // Sample XML
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="编程">
    <title lang="zh">JavaScript高级程序设计</title>
    <author>Nicholas C. Zakas</author>
    <year>2020</year>
    <price>99.00</price>
  </book>
  <book category="小说">
    <title lang="zh">三体</title>
    <author>刘慈欣</author>
    <year>2008</year>
    <price>59.00</price>
  </book>
  <book category="科学">
    <title lang="en">A Brief History of Time</title>
    <author>Stephen Hawking</author>
    <year>1988</year>
    <price>45.00</price>
  </book>
</bookstore>`;

    // Update character count
    function updateCharCount() {
        const inputLen = xmlInput.value.length;
        const outputLen = xmlOutput.value.length;
        inputCount.textContent = `${inputLen.toLocaleString()} 字符`;
        outputCount.textContent = `${outputLen.toLocaleString()} 字符`;
    }

    // Set status message
    function setStatus(message, type = 'info') {
        statusMsg.textContent = message;
        statusMsg.className = 'status-item';
        if (type === 'success') {
            statusMsg.classList.add('success');
        } else if (type === 'error') {
            statusMsg.classList.add('error');
        }
    }

    // Parse XML
    function parseXml(xmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'text/xml');

        // Check for parsing errors
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
            return {
                success: false,
                error: parseError.textContent,
                document: null
            };
        }

        return {
            success: true,
            error: null,
            document: doc
        };
    }

    // Format XML
    function formatXml(xmlString, indent) {
        const result = parseXml(xmlString);
        if (!result.success) {
            return {
                success: false,
                error: result.error,
                formatted: null
            };
        }

        const doc = result.document;
        state.xmlDocument = doc;
        state.lastValidXml = xmlString;

        // Serialize with indentation
        const indentStr = indent === 'tab' ? '\t' : ' '.repeat(parseInt(indent));
        const formatted = serializeXml(doc.documentElement, 0, indentStr);

        // Add XML declaration if present
        const declaration = xmlString.match(/<\?xml[^?]*\?>/);
        const output = declaration
            ? declaration[0] + '\n' + formatted
            : formatted;

        return {
            success: true,
            error: null,
            formatted: output
        };
    }

    // Serialize XML node to string with formatting
    function serializeXml(node, level, indent) {
        let output = '';
        const currentIndent = indent.repeat(level);

        if (node.nodeType === Node.ELEMENT_NODE) {
            output += currentIndent + '<' + node.nodeName;

            // Add attributes
            if (node.attributes.length > 0) {
                for (let i = 0; i < node.attributes.length; i++) {
                    const attr = node.attributes[i];
                    output += ` ${attr.name}="${escapeXml(attr.value)}"`;
                }
            }

            // Check for children
            const children = Array.from(node.childNodes).filter(n =>
                n.nodeType === Node.ELEMENT_NODE ||
                (n.nodeType === Node.TEXT_NODE && n.textContent.trim())
            );

            if (children.length === 0) {
                output += '/>\n';
            } else if (children.length === 1 &&
                       children[0].nodeType === Node.TEXT_NODE &&
                       !children[0].textContent.trim().includes('\n')) {
                // Single text child - keep on same line
                output += '>' + escapeXml(children[0].textContent.trim()) + '</' + node.nodeName + '>\n';
            } else {
                output += '>\n';

                for (const child of children) {
                    if (child.nodeType === Node.ELEMENT_NODE) {
                        output += serializeXml(child, level + 1, indent);
                    } else if (child.nodeType === Node.TEXT_NODE) {
                        const text = child.textContent.trim();
                        if (text) {
                            output += indent.repeat(level + 1) + escapeXml(text) + '\n';
                        }
                    }
                }

                output += currentIndent + '</' + node.nodeName + '>\n';
            }
        }

        return output;
    }

    // Escape XML special characters
    function escapeXml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    // Minify XML
    function minifyXml(xmlString) {
        const result = parseXml(xmlString);
        if (!result.success) {
            return {
                success: false,
                error: result.error,
                minified: null
            };
        }

        const doc = result.document;
        state.xmlDocument = doc;
        state.lastValidXml = xmlString;

        // Remove all whitespace between tags
        let minified = new XMLSerializer().serializeToString(doc.documentElement);
        minified = minified.replace(/>\s+</g, '><');

        // Add XML declaration if present
        const declaration = xmlString.match(/<\?xml[^?]*\?>/);
        const output = declaration
            ? declaration[0] + minified
            : minified;

        return {
            success: true,
            error: null,
            minified: output
        };
    }

    // Validate XML
    function validateXml(xmlString) {
        const result = parseXml(xmlString);

        validationSection.classList.add('show');

        if (!result.success) {
            validationSection.classList.remove('valid');
            validationSection.classList.add('invalid');
            validationIcon.textContent = '❌';
            validationText.textContent = 'XML 格式错误';

            // Extract error line and column
            const errorMatch = result.error.match(/line (\d+)/i);
            const columnMatch = result.error.match(/column (\d+)/i);

            let errorDetails = result.error;
            if (errorMatch || columnMatch) {
                errorDetails = `位置：第 ${errorMatch ? errorMatch[1] : '?'} 行`;
                if (columnMatch) {
                    errorDetails += `，第 ${columnMatch[1]} 列`;
                }
                errorDetails += '\n\n' + result.error.split('\n')[0];
            }

            validationDetails.textContent = errorDetails;
            setStatus('验证失败', 'error');
            return false;
        }

        validationSection.classList.remove('invalid');
        validationSection.classList.add('valid');
        validationIcon.textContent = '✅';
        validationText.textContent = 'XML 格式正确';
        validationDetails.textContent = '';

        state.xmlDocument = result.document;
        state.lastValidXml = xmlString;

        setStatus('验证通过', 'success');
        return true;
    }

    // Execute XPath query
    function executeXPath(xpathExpr) {
        xpathResults.innerHTML = '';

        if (!state.xmlDocument) {
            // Try to parse the input first
            const result = parseXml(xmlInput.value);
            if (!result.success) {
                showXPathError('请先输入有效的 XML');
                return;
            }
            state.xmlDocument = result.document;
        }

        try {
            const evaluator = new XPathEvaluator();
            const resolver = evaluator.createNSResolver(state.xmlDocument.documentElement);
            const result = evaluator.evaluate(
                xpathExpr,
                state.xmlDocument.documentElement,
                resolver,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            );

            const count = result.snapshotLength;

            if (count === 0) {
                xpathResults.innerHTML = '<div class="xpath-result">未找到匹配结果</div>';
            } else {
                const countDiv = document.createElement('div');
                countDiv.className = 'xpath-count';
                countDiv.textContent = `找到 ${count} 个结果`;
                xpathResults.appendChild(countDiv);

                for (let i = 0; i < count; i++) {
                    const node = result.snapshotItem(i);
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'xpath-result';

                    if (node.nodeType === Node.ELEMENT_NODE) {
                        resultDiv.textContent = node.outerHTML || node.textContent;
                    } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
                        resultDiv.textContent = `${node.name}="${node.value}"`;
                    } else {
                        resultDiv.textContent = node.textContent || node.nodeValue;
                    }

                    xpathResults.appendChild(resultDiv);
                }
            }

            setStatus(`XPath 查询完成，找到 ${count} 个结果`, 'success');
        } catch (e) {
            showXPathError('XPath 表达式错误: ' + e.message);
        }
    }

    // Show XPath error
    function showXPathError(message) {
        xpathResults.innerHTML = `<div class="xpath-result error">${message}</div>`;
        setStatus('XPath 查询失败', 'error');
    }

    // Copy to clipboard
    async function copyToClipboard() {
        const text = xmlOutput.value;
        if (!text) {
            setStatus('没有内容可复制', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            setStatus('已复制到剪贴板', 'success');

            // Visual feedback
            copyBtn.innerHTML = '<span>✅</span> 已复制';
            setTimeout(() => {
                copyBtn.innerHTML = '<span>📋</span> 复制';
            }, 1500);
        } catch (e) {
            setStatus('复制失败', 'error');
        }
    }

    // Clear all
    function clearAll() {
        xmlInput.value = '';
        xmlOutput.value = '';
        xpathInput.value = '';
        xpathResults.innerHTML = '<div class="xpath-placeholder">执行 XPath 查询后结果将显示在这里</div>';
        validationSection.classList.remove('show', 'valid', 'invalid');
        state.xmlDocument = null;
        state.lastValidXml = null;
        updateCharCount();
        setStatus('已清空', 'info');
    }

    // Load sample XML
    function loadSample() {
        xmlInput.value = sampleXml;
        updateCharCount();
        setStatus('已加载示例 XML', 'success');
    }

    // Handle format button click
    function handleFormat() {
        const xml = xmlInput.value.trim();
        if (!xml) {
            setStatus('请输入 XML 内容', 'error');
            return;
        }

        const indent = indentSelect.value;
        const result = formatXml(xml, indent);

        if (result.success) {
            xmlOutput.value = result.formatted;
            updateCharCount();
            setStatus('格式化成功', 'success');
            validationSection.classList.remove('show');
        } else {
            xmlOutput.value = '';
            updateCharCount();
            validateXml(xml);
        }
    }

    // Handle minify button click
    function handleMinify() {
        const xml = xmlInput.value.trim();
        if (!xml) {
            setStatus('请输入 XML 内容', 'error');
            return;
        }

        const result = minifyXml(xml);

        if (result.success) {
            xmlOutput.value = result.minified;
            updateCharCount();
            setStatus('压缩成功', 'success');
            validationSection.classList.remove('show');
        } else {
            xmlOutput.value = '';
            updateCharCount();
            validateXml(xml);
        }
    }

    // Event listeners
    formatBtn.addEventListener('click', handleFormat);
    minifyBtn.addEventListener('click', handleMinify);
    validateBtn.addEventListener('click', () => validateXml(xmlInput.value));
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearAll);
    loadSampleBtn.addEventListener('click', loadSample);

    xpathBtn.addEventListener('click', () => {
        const expr = xpathInput.value.trim();
        if (!expr) {
            setStatus('请输入 XPath 表达式', 'error');
            return;
        }
        executeXPath(expr);
    });

    xpathInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const expr = xpathInput.value.trim();
            if (expr) {
                executeXPath(expr);
            }
        }
    });

    xmlInput.addEventListener('input', () => {
        updateCharCount();
        // Reset document state when input changes
        state.xmlDocument = null;
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to format
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleFormat();
        }
        // Ctrl+M to minify
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            handleMinify();
        }
    });

    // Initialize
    updateCharCount();
    setStatus('就绪', 'info');
})();

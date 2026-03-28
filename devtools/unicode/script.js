(function() {
    'use strict';

    // State
    const state = {
        mode: 'encode', // 'encode' or 'decode'
        format: 'lower', // 'lower' (\u) or 'upper' (\U)
        separator: 'none' // 'none' or 'space'
    };

    // DOM Elements
    const elements = {
        modeBtns: document.querySelectorAll('.mode-btn'),
        optionBtns: document.querySelectorAll('.option-btn'),
        inputText: document.getElementById('inputText'),
        outputText: document.getElementById('outputText'),
        inputLabel: document.getElementById('inputLabel'),
        outputLabel: document.getElementById('outputLabel'),
        inputCount: document.getElementById('inputCount'),
        outputCount: document.getElementById('outputCount'),
        swapBtn: document.getElementById('swapBtn'),
        clearBtn: document.getElementById('clearBtn'),
        copyBtn: document.getElementById('copyBtn'),
        notification: document.getElementById('notification'),
        notificationText: document.getElementById('notificationText')
    };

    // Convert text to Unicode escape sequences
    function textToUnicode(text) {
        if (!text) return '';

        const prefix = state.format === 'lower' ? '\\u' : '\\U';
        const separator = state.separator === 'space' ? ' ' : '';

        const result = [];
        for (const char of text) {
            const code = char.codePointAt(0);
            if (code <= 0x7F) {
                // ASCII character - keep as is
                result.push(char);
            } else if (code <= 0xFFFF) {
                // BMP character - 4 hex digits
                result.push(prefix + code.toString(16).toUpperCase().padStart(4, '0'));
            } else {
                // Supplementary character - 8 hex digits
                const hex = code.toString(16).toUpperCase().padStart(8, '0');
                result.push(prefix + hex);
            }
        }

        return result.join(separator);
    }

    // Convert Unicode escape sequences to text
    function unicodeToText(unicode) {
        if (!unicode) return '';

        let result = '';

        // Handle both \uXXXX and \UXXXXXXXX formats
        // Also handle variations like %uXXXX for some encodings
        const regex = /\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{8})|%u([0-9a-fA-F]{4})|&#(\d+);|&#x([0-9a-fA-F]+);|./g;

        let match;
        let lastIndex = 0;

        // Reset regex
        regex.lastIndex = 0;

        while ((match = regex.exec(unicode)) !== null) {
            const [fullMatch, u4, u8, percentU, decimal, hex] = match;

            if (u4) {
                // \uXXXX format
                result += String.fromCodePoint(parseInt(u4, 16));
            } else if (u8) {
                // \UXXXXXXXX format
                result += String.fromCodePoint(parseInt(u8, 16));
            } else if (percentU) {
                // %uXXXX format (escape style)
                result += String.fromCodePoint(parseInt(percentU, 16));
            } else if (decimal) {
                // &#dddd; HTML entity
                result += String.fromCodePoint(parseInt(decimal, 10));
            } else if (hex) {
                // &#xXXXX; HTML entity
                result += String.fromCodePoint(parseInt(hex, 16));
            } else {
                // Regular character
                result += fullMatch;
            }
        }

        return result;
    }

    // Perform conversion
    function convert() {
        const input = elements.inputText.value;

        if (state.mode === 'encode') {
            elements.outputText.value = textToUnicode(input);
        } else {
            elements.outputText.value = unicodeToText(input);
        }

        // Update character counts
        updateCharCounts();
    }

    // Update character counts
    function updateCharCounts() {
        const inputLen = elements.inputText.value.length;
        const outputLen = elements.outputText.value.length;

        elements.inputCount.textContent = `${inputLen} 字符`;
        elements.outputCount.textContent = `${outputLen} 字符`;
    }

    // Update labels based on mode
    function updateLabels() {
        if (state.mode === 'encode') {
            elements.inputLabel.textContent = '输入文本';
            elements.outputLabel.textContent = 'Unicode 编码';
            elements.inputText.placeholder = '在此输入文本...';
        } else {
            elements.inputLabel.textContent = '输入 Unicode';
            elements.outputLabel.textContent = '转换文本';
            elements.inputText.placeholder = '在此输入 Unicode 编码 (如 \\u4e2d\\u6587)...';
        }
    }

    // Show notification
    function showNotification(message) {
        elements.notificationText.textContent = message;
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2000);
    }

    // Copy to clipboard
    async function copyToClipboard() {
        const text = elements.outputText.value;
        if (!text) {
            showNotification('没有可复制的内容');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            showNotification('已复制到剪贴板');
        } catch (err) {
            // Fallback for older browsers
            elements.outputText.select();
            document.execCommand('copy');
            showNotification('已复制到剪贴板');
        }
    }

    // Swap input and output
    function swap() {
        const temp = elements.inputText.value;
        elements.inputText.value = elements.outputText.value;
        elements.outputText.value = temp;

        // Toggle mode
        state.mode = state.mode === 'encode' ? 'decode' : 'encode';

        // Update UI
        elements.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === state.mode);
        });

        updateLabels();
        convert();
    }

    // Clear all
    function clearAll() {
        elements.inputText.value = '';
        elements.outputText.value = '';
        updateCharCounts();
    }

    // Initialize event listeners
    function init() {
        // Mode toggle
        elements.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                state.mode = btn.dataset.mode;
                elements.modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateLabels();
                convert();
            });
        });

        // Format options
        document.querySelectorAll('[data-format]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.format = btn.dataset.format;
                document.querySelectorAll('[data-format]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                convert();
            });
        });

        // Separator options
        document.querySelectorAll('[data-separator]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.separator = btn.dataset.separator;
                document.querySelectorAll('[data-separator]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                convert();
            });
        });

        // Real-time conversion
        elements.inputText.addEventListener('input', convert);

        // Action buttons
        elements.swapBtn.addEventListener('click', swap);
        elements.clearBtn.addEventListener('click', clearAll);
        elements.copyBtn.addEventListener('click', copyToClipboard);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to copy
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                copyToClipboard();
            }
        });

        // Initial conversion
        updateLabels();
        updateCharCounts();
    }

    // Start
    init();
})();

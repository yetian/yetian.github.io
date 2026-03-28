// URL Encoder / Decoder - JavaScript
(function() {
    'use strict';

    // DOM Elements
    const modeTabs = document.getElementById('modeTabs');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const inputCount = document.getElementById('inputCount');
    const outputCount = document.getElementById('outputCount');
    const optionHint = document.getElementById('optionHint');
    const swapBtn = document.getElementById('swapBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // State
    let currentMode = 'encode';
    let encodeType = 'full';

    // Initialize
    function init() {
        setupEventListeners();
        updatePlaceholder();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Mode tabs
        modeTabs.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modeTabs.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentMode = tab.dataset.mode;
                updatePlaceholder();
                convert();
            });
        });

        // Encode type radio buttons
        document.querySelectorAll('input[name="encodeType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                encodeType = e.target.value;
                updateHint();
                convert();
            });
        });

        // Input text - real-time conversion
        inputText.addEventListener('input', debounce(convert, 100));

        // Swap button
        swapBtn.addEventListener('click', swapContent);

        // Clear button
        clearBtn.addEventListener('click', clearAll);

        // Copy button
        copyBtn.addEventListener('click', copyResult);
    }

    // Update placeholder based on mode
    function updatePlaceholder() {
        if (currentMode === 'encode') {
            inputText.placeholder = '请输入要编码的文本或 URL...';
            outputText.placeholder = '编码结果将显示在这里...';
        } else {
            inputText.placeholder = '请输入要解码的 URL 编码文本...';
            outputText.placeholder = '解码结果将显示在这里...';
        }
    }

    // Update hint based on encode type
    function updateHint() {
        if (encodeType === 'full') {
            optionHint.textContent = '完整编码保留 URL 特殊字符（如 ://、?、&），适用于完整 URL';
        } else {
            optionHint.textContent = '组件编码会编码所有特殊字符，适用于 URL 参数值';
        }
    }

    // Main conversion function
    function convert() {
        const input = inputText.value;

        // Update input character count
        inputCount.textContent = `${input.length} 字符`;

        if (!input.trim()) {
            outputText.value = '';
            outputCount.textContent = '0 字符';
            return;
        }

        try {
            let result;
            if (currentMode === 'encode') {
                result = encodeType === 'full'
                    ? encodeURI(input)
                    : encodeURIComponent(input);
            } else {
                result = decodeType(input);
            }

            outputText.value = result;
            outputCount.textContent = `${result.length} 字符`;
        } catch (error) {
            outputText.value = `错误: ${error.message}`;
            outputCount.textContent = '错误';
        }
    }

    // Decode with fallback
    function decodeType(str) {
        // Try decodeURIComponent first (more aggressive)
        // Then fallback to decodeURI if it fails
        try {
            // Check if it looks like a full URL or a component
            const hasComponentChars = /%2F|%3F|%23|%26|%3D|%25/gi.test(str);

            if (encodeType === 'full' && !hasComponentChars) {
                return decodeURI(str);
            } else {
                return decodeURIComponent(str);
            }
        } catch (e) {
            // Try the other method as fallback
            try {
                return encodeType === 'full'
                    ? decodeURIComponent(str)
                    : decodeURI(str);
            } catch (e2) {
                throw new Error('无效的编码格式');
            }
        }
    }

    // Swap input and output
    function swapContent() {
        if (!outputText.value) return;

        const temp = inputText.value;
        inputText.value = outputText.value;
        outputText.value = temp;

        // Toggle mode
        const newMode = currentMode === 'encode' ? 'decode' : 'encode';
        currentMode = newMode;

        modeTabs.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === newMode);
        });

        updatePlaceholder();
        convert();

        showNotification('已交换内容');
    }

    // Clear all
    function clearAll() {
        inputText.value = '';
        outputText.value = '';
        inputCount.textContent = '0 字符';
        outputCount.textContent = '0 字符';
        inputText.focus();
    }

    // Copy result
    function copyResult() {
        const text = outputText.value;
        if (!text) {
            showNotification('没有可复制的内容');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            showNotification('已复制到剪贴板');
        }).catch(() => {
            // Fallback for older browsers
            outputText.select();
            document.execCommand('copy');
            showNotification('已复制到剪贴板');
        });
    }

    // Show notification
    function showNotification(text) {
        notificationText.textContent = text;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 1500);
    }

    // Debounce helper
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

    // Initialize
    init();
})();

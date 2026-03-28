(function() {
    'use strict';

    // State
    const state = {
        mode: 'encode'
    };

    // DOM Elements
    const elements = {
        inputText: document.getElementById('inputText'),
        outputText: document.getElementById('outputText'),
        modeTabs: document.querySelectorAll('.mode-tab'),
        clearBtn: document.getElementById('clearBtn'),
        swapBtn: document.getElementById('swapBtn'),
        copyBtn: document.getElementById('copyBtn'),
        dropOverlay: document.getElementById('dropOverlay'),
        inputInfo: document.getElementById('inputInfo'),
        outputInfo: document.getElementById('outputInfo'),
        currentMode: document.getElementById('currentMode'),
        notification: document.getElementById('notification')
    };

    // Base64 encoding with UTF-8 support
    function encodeBase64(str) {
        try {
            const utf8Bytes = new TextEncoder().encode(str);
            const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
            return btoa(binaryString);
        } catch (e) {
            throw new Error('编码失败: ' + e.message);
        }
    }

    // Base64 decoding with UTF-8 support
    function decodeBase64(str) {
        try {
            const binaryString = atob(str);
            const utf8Bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                utf8Bytes[i] = binaryString.charCodeAt(i);
            }
            return new TextDecoder().decode(utf8Bytes);
        } catch (e) {
            throw new Error('解码失败: 无效的 Base64 字符串');
        }
    }

    // Convert based on current mode
    function convert() {
        const input = elements.inputText.value;

        if (!input.trim()) {
            elements.outputText.value = '';
            updateInfo();
            return;
        }

        try {
            if (state.mode === 'encode') {
                elements.outputText.value = encodeBase64(input);
            } else {
                elements.outputText.value = decodeBase64(input);
            }
        } catch (e) {
            elements.outputText.value = e.message;
        }

        updateInfo();
    }

    // Update character info
    function updateInfo() {
        const inputLen = elements.inputText.value.length;
        const outputLen = elements.outputText.value.length;

        elements.inputInfo.textContent = `${inputLen} 字符`;
        elements.outputInfo.textContent = `${outputLen} 字符`;
    }

    // Show notification
    function showNotification(message) {
        elements.notification.textContent = message;
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2000);
    }

    // Switch mode
    function switchMode(newMode) {
        state.mode = newMode;

        elements.modeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === newMode);
        });

        elements.currentMode.textContent = newMode === 'encode' ? '编码' : '解码';

        // Re-convert if there's input
        if (elements.inputText.value) {
            convert();
        }
    }

    // Clear all
    function clearAll() {
        elements.inputText.value = '';
        elements.outputText.value = '';
        updateInfo();
    }

    // Swap input and output
    function swapContent() {
        const temp = elements.inputText.value;
        elements.inputText.value = elements.outputText.value;
        elements.outputText.value = temp;

        // Switch mode as well
        switchMode(state.mode === 'encode' ? 'decode' : 'encode');

        updateInfo();
    }

    // Copy to clipboard
    async function copyToClipboard() {
        const output = elements.outputText.value;

        if (!output) {
            showNotification('没有内容可复制');
            return;
        }

        try {
            await navigator.clipboard.writeText(output);
            elements.copyBtn.classList.add('copied');
            showNotification('已复制到剪贴板');

            setTimeout(() => {
                elements.copyBtn.classList.remove('copied');
            }, 2000);
        } catch (e) {
            showNotification('复制失败');
        }
    }

    // Handle file drop
    function handleFileDrop(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            elements.inputText.value = e.target.result;
            convert();
            showNotification(`已读取文件: ${file.name}`);
        };

        reader.onerror = () => {
            showNotification('文件读取失败');
        };

        reader.readAsText(file);
    }

    // Event Listeners
    // Mode tabs
    elements.modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchMode(tab.dataset.mode);
        });
    });

    // Input text - real-time conversion
    elements.inputText.addEventListener('input', convert);

    // Clear button
    elements.clearBtn.addEventListener('click', clearAll);

    // Swap button
    elements.swapBtn.addEventListener('click', swapContent);

    // Copy button
    elements.copyBtn.addEventListener('click', copyToClipboard);

    // Drag and drop
    const inputWrapper = elements.inputText.closest('.textarea-wrapper') || elements.inputText.parentElement;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        inputWrapper.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        inputWrapper.addEventListener(eventName, () => {
            elements.dropOverlay.classList.add('show');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        inputWrapper.addEventListener(eventName, () => {
            elements.dropOverlay.classList.remove('show');
        });
    });

    inputWrapper.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileDrop(files[0]);
        }
    });

    // Also handle drop on the textarea itself
    elements.inputText.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileDrop(files[0]);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Shift + C to copy
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyToClipboard();
        }

        // Ctrl/Cmd + Shift + S to swap
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            swapContent();
        }

        // Escape to clear
        if (e.key === 'Escape') {
            clearAll();
        }
    });

    // Initial state
    updateInfo();
})();

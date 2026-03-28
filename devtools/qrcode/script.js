(function() {
    'use strict';

    // State
    const state = {
        size: 'small',      // small, medium, large
        errorLevel: 'M',    // L, M, Q, H
        fgColor: '#000000',
        bgColor: '#ffffff',
        hasQR: false
    };

    // Size mappings (module count for canvas)
    const sizeMap = {
        small: 180,
        medium: 280,
        large: 380
    };

    // Error correction level mapping for qrcode-generator
    const errorLevelMap = {
        'L': 1,  // ~7%
        'M': 0,  // ~15%
        'Q': 3,  // ~25%
        'H': 2   // ~30%
    };

    // DOM Elements
    const elements = {
        inputText: document.getElementById('inputText'),
        inputInfo: document.getElementById('inputInfo'),
        clearBtn: document.getElementById('clearBtn'),
        sizeGroup: document.getElementById('sizeGroup'),
        errorGroup: document.getElementById('errorGroup'),
        fgColor: document.getElementById('fgColor'),
        bgColor: document.getElementById('bgColor'),
        fgColorValue: document.getElementById('fgColorValue'),
        bgColorValue: document.getElementById('bgColorValue'),
        qrPreview: document.getElementById('qrPreview'),
        qrCanvas: document.getElementById('qrCanvas'),
        downloadBtn: document.getElementById('downloadBtn'),
        copyBtn: document.getElementById('copyBtn'),
        notification: document.getElementById('notification')
    };

    // Show notification
    function showNotification(message) {
        elements.notification.textContent = message;
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2000);
    }

    // Update character info
    function updateInfo() {
        const len = elements.inputText.value.length;
        elements.inputInfo.textContent = `${len} 字符`;
    }

    // Generate QR code
    function generateQR() {
        const text = elements.inputText.value.trim();

        if (!text) {
            elements.qrPreview.classList.remove('has-qr');
            elements.downloadBtn.disabled = true;
            elements.copyBtn.disabled = true;
            state.hasQR = false;
            return;
        }

        try {
            // Create QR code
            const typeNumber = 0; // Auto-detect
            const errorCorrectionLevel = errorLevelMap[state.errorLevel];
            const qr = qrcode(typeNumber, errorCorrectionLevel);

            qr.addData(text);
            qr.make();

            // Draw on canvas
            const moduleCount = qr.getModuleCount();
            const canvasSize = sizeMap[state.size];
            const moduleSize = canvasSize / moduleCount;

            const canvas = elements.qrCanvas;
            const ctx = canvas.getContext('2d');

            canvas.width = canvasSize;
            canvas.height = canvasSize;

            // Draw background
            ctx.fillStyle = state.bgColor;
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            // Draw QR modules
            ctx.fillStyle = state.fgColor;
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(
                            col * moduleSize,
                            row * moduleSize,
                            moduleSize,
                            moduleSize
                        );
                    }
                }
            }

            // Show preview
            elements.qrPreview.classList.add('has-qr');
            elements.downloadBtn.disabled = false;
            elements.copyBtn.disabled = false;
            state.hasQR = true;

        } catch (e) {
            console.error('QR generation error:', e);
            showNotification('生成失败: 内容过长或包含不支持的字');
            elements.qrPreview.classList.remove('has-qr');
            elements.downloadBtn.disabled = true;
            elements.copyBtn.disabled = true;
            state.hasQR = false;
        }
    }

    // Debounce function
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

    // Debounced generate
    const debouncedGenerate = debounce(generateQR, 300);

    // Download QR code as PNG
    function downloadQR() {
        if (!state.hasQR) return;

        const canvas = elements.qrCanvas;
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        showNotification('二维码已下载');
    }

    // Copy QR code to clipboard
    async function copyToClipboard() {
        if (!state.hasQR) return;

        try {
            const canvas = elements.qrCanvas;
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);

            showNotification('已复制到剪贴板');
        } catch (e) {
            console.error('Copy failed:', e);
            showNotification('复制失败，请尝试下载');
        }
    }

    // Clear input
    function clearInput() {
        elements.inputText.value = '';
        updateInfo();
        generateQR();
    }

    // Event Listeners
    // Input text
    elements.inputText.addEventListener('input', () => {
        updateInfo();
        debouncedGenerate();
    });

    // Clear button
    elements.clearBtn.addEventListener('click', clearInput);

    // Size buttons
    elements.sizeGroup.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.sizeGroup.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.size = btn.dataset.size;
            generateQR();
        });
    });

    // Error level buttons
    elements.errorGroup.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.errorGroup.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.errorLevel = btn.dataset.level;
            generateQR();
        });
    });

    // Color pickers
    elements.fgColor.addEventListener('input', (e) => {
        state.fgColor = e.target.value;
        elements.fgColorValue.textContent = e.target.value;
        generateQR();
    });

    elements.bgColor.addEventListener('input', (e) => {
        state.bgColor = e.target.value;
        elements.bgColorValue.textContent = e.target.value;
        generateQR();
    });

    // Download button
    elements.downloadBtn.addEventListener('click', downloadQR);

    // Copy button
    elements.copyBtn.addEventListener('click', copyToClipboard);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S to download
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (state.hasQR) {
                downloadQR();
            }
        }

        // Ctrl/Cmd + C to copy (when not focused on textarea)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement !== elements.inputText) {
            if (state.hasQR) {
                e.preventDefault();
                copyToClipboard();
            }
        }

        // Escape to clear
        if (e.key === 'Escape') {
            clearInput();
        }
    });

    // Initial state
    updateInfo();
})();

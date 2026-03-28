(function() {
    'use strict';

    // State
    const state = {
        mode: 'imageToBase64',
        currentFile: null,
        currentBase64: '',
        resultImageType: ''
    };

    // DOM Elements
    const elements = {
        // Mode switch
        modeBtns: document.querySelectorAll('.mode-btn'),
        modeSwitchIndicator: document.querySelector('.mode-switch-indicator'),
        panels: document.querySelectorAll('.panel'),

        // Image to Base64
        uploadArea: document.getElementById('uploadArea'),
        fileInput: document.getElementById('fileInput'),
        previewArea: document.getElementById('previewArea'),
        imagePreview: document.getElementById('imagePreview'),
        imageInfo: document.getElementById('imageInfo'),
        infoName: document.getElementById('infoName'),
        infoType: document.getElementById('infoType'),
        infoDimensions: document.getElementById('infoDimensions'),
        infoSize: document.getElementById('infoSize'),
        base64Output: document.getElementById('base64Output'),
        includePrefix: document.getElementById('includePrefix'),
        base64Length: document.getElementById('base64Length'),
        base64Size: document.getElementById('base64Size'),
        clearImageBtn: document.getElementById('clearImageBtn'),
        copyBase64Btn: document.getElementById('copyBase64Btn'),

        // Base64 to Image
        base64Input: document.getElementById('base64Input'),
        convertBtn: document.getElementById('convertBtn'),
        resultArea: document.getElementById('resultArea'),
        resultImage: document.getElementById('resultImage'),
        resultInfo: document.getElementById('resultInfo'),
        resultType: document.getElementById('resultType'),
        resultDimensions: document.getElementById('resultDimensions'),
        resultSize: document.getElementById('resultSize'),
        resultActions: document.getElementById('resultActions'),
        clearBase64InputBtn: document.getElementById('clearBase64InputBtn'),
        pasteBtn: document.getElementById('pasteBtn'),
        clearResultBtn: document.getElementById('clearResultBtn'),
        downloadBtn: document.getElementById('downloadBtn'),

        // UI
        dropOverlay: document.getElementById('dropOverlay'),
        statusText: document.getElementById('statusText'),
        notification: document.getElementById('notification')
    };

    // Constants
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];

    // ===== Utility Functions =====

    function showNotification(message, type = 'info') {
        elements.notification.textContent = message;
        elements.notification.className = 'notification show';

        if (type === 'success') {
            elements.notification.style.background = 'linear-gradient(180deg, rgba(48, 209, 88, 0.95) 0%, rgba(40, 170, 70, 0.95) 100%)';
        } else if (type === 'error') {
            elements.notification.style.background = 'linear-gradient(180deg, rgba(255, 69, 58, 0.95) 0%, rgba(200, 50, 45, 0.95) 100%)';
        } else {
            elements.notification.style.background = 'linear-gradient(180deg, rgba(60, 60, 65, 0.95) 0%, rgba(40, 40, 45, 0.95) 100%)';
        }

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2500);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getFileExtension(type) {
        const extensions = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/svg+xml': 'svg',
            'image/bmp': 'bmp'
        };
        return extensions[type] || 'png';
    }

    // ===== Mode Switch =====

    function updateModeIndicator() {
        const activeBtn = document.querySelector('.mode-btn.active');
        if (activeBtn) {
            const btnRect = activeBtn.getBoundingClientRect();
            const switchRect = activeBtn.parentElement.getBoundingClientRect();
            elements.modeSwitchIndicator.style.width = btnRect.width + 'px';
            elements.modeSwitchIndicator.style.left = (btnRect.left - switchRect.left) + 'px';
        }
    }

    function switchMode(newMode) {
        state.mode = newMode;

        elements.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === newMode);
        });

        elements.panels.forEach(panel => {
            panel.classList.toggle('active', panel.id === newMode + 'Panel');
        });

        updateModeIndicator();

        // Update status
        if (newMode === 'imageToBase64') {
            elements.statusText.textContent = '支持拖放文件或点击上传';
        } else {
            elements.statusText.textContent = '粘贴或输入 Base64 字符串';
        }
    }

    // ===== Image to Base64 =====

    function handleFile(file) {
        // Validate file type
        if (!SUPPORTED_TYPES.includes(file.type)) {
            showNotification('不支持的文件类型', 'error');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            showNotification('文件过大，最大支持 10MB', 'error');
            return;
        }

        state.currentFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            state.currentBase64 = base64;

            // Show preview
            elements.imagePreview.src = base64;
            elements.uploadArea.style.display = 'none';
            elements.previewArea.classList.add('show');

            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                updateImageInfo(file, img.width, img.height);
                updateBase64Output();
            };
            img.src = base64;

            showNotification('图片加载成功', 'success');
            elements.statusText.textContent = `已加载: ${file.name}`;
        };

        reader.onerror = () => {
            showNotification('文件读取失败', 'error');
        };

        reader.readAsDataURL(file);
    }

    function updateImageInfo(file, width, height) {
        elements.infoName.textContent = file.name;
        elements.infoType.textContent = file.type;
        elements.infoDimensions.textContent = `${width} × ${height}`;
        elements.infoSize.textContent = formatFileSize(file.size);
        elements.imageInfo.classList.add('show');
    }

    function updateBase64Output() {
        let output = state.currentBase64;

        // Remove data URI prefix if checkbox is unchecked
        if (!elements.includePrefix.checked) {
            const prefixMatch = output.match(/^data:[^;]+;base64,/);
            if (prefixMatch) {
                output = output.substring(prefixMatch[0].length);
            }
        }

        elements.base64Output.value = output;

        // Update stats
        const length = output.length;
        const sizeInBytes = Math.ceil(length * 3 / 4);
        elements.base64Length.textContent = `${length.toLocaleString()} 字符`;
        elements.base64Size.textContent = `≈ ${formatFileSize(sizeInBytes)}`;
    }

    function clearImageUpload() {
        state.currentFile = null;
        state.currentBase64 = '';

        elements.imagePreview.src = '';
        elements.uploadArea.style.display = 'flex';
        elements.previewArea.classList.remove('show');
        elements.imageInfo.classList.remove('show');
        elements.base64Output.value = '';
        elements.base64Length.textContent = '0 字符';
        elements.base64Size.textContent = '≈ 0 KB';
        elements.fileInput.value = '';
        elements.statusText.textContent = '支持拖放文件或点击上传';
    }

    async function copyBase64() {
        const output = elements.base64Output.value;
        if (!output) {
            showNotification('没有内容可复制', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(output);
            elements.copyBase64Btn.classList.add('copied');
            showNotification('已复制到剪贴板', 'success');

            setTimeout(() => {
                elements.copyBase64Btn.classList.remove('copied');
            }, 2000);
        } catch (e) {
            showNotification('复制失败', 'error');
        }
    }

    // ===== Base64 to Image =====

    function convertBase64ToImage() {
        let input = elements.base64Input.value.trim();

        if (!input) {
            showNotification('请输入 Base64 字符串', 'error');
            return;
        }

        // Add data URI prefix if missing
        if (!input.startsWith('data:')) {
            // Try to detect image type from base64 header
            let mimeType = 'image/png';

            // Check for common image signatures
            if (input.startsWith('/9j/')) {
                mimeType = 'image/jpeg';
            } else if (input.startsWith('R0lGOD')) {
                mimeType = 'image/gif';
            } else if (input.startsWith('UklGR')) {
                mimeType = 'image/webp';
            } else if (input.startsWith('Qk0')) {
                mimeType = 'image/bmp';
            } else if (input.includes('PHN2Zy')) {
                mimeType = 'image/svg+xml';
            }

            input = `data:${mimeType};base64,${input}`;
        }

        state.resultImageType = input.match(/data:([^;]+)/)?.[1] || 'image/png';

        const img = new Image();
        img.onload = () => {
            elements.resultImage.src = input;
            elements.resultImage.style.display = 'block';

            // Hide placeholder
            const placeholder = elements.resultArea.querySelector('.result-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }

            // Update info
            elements.resultType.textContent = state.resultImageType;
            elements.resultDimensions.textContent = `${img.width} × ${img.height}`;

            // Calculate approximate size
            const base64Data = input.split(',')[1] || input;
            const sizeInBytes = Math.ceil(base64Data.length * 3 / 4);
            elements.resultSize.textContent = formatFileSize(sizeInBytes);

            elements.resultInfo.style.display = 'grid';
            elements.resultInfo.classList.add('show');
            elements.resultActions.style.display = 'flex';

            showNotification('转换成功', 'success');
            elements.statusText.textContent = '转换完成';
        };

        img.onerror = () => {
            showNotification('无效的 Base64 图片数据', 'error');
        };

        img.src = input;
    }

    function clearBase64Input() {
        elements.base64Input.value = '';
    }

    function clearResult() {
        elements.resultImage.src = '';
        elements.resultImage.style.display = 'none';
        elements.resultInfo.style.display = 'none';
        elements.resultInfo.classList.remove('show');
        elements.resultActions.style.display = 'none';

        // Show placeholder
        const placeholder = elements.resultArea.querySelector('.result-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }

        elements.statusText.textContent = '粘贴或输入 Base64 字符串';
    }

    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                elements.base64Input.value = text;
                showNotification('已粘贴', 'success');
            }
        } catch (e) {
            showNotification('无法读取剪贴板', 'error');
        }
    }

    function downloadImage() {
        if (!elements.resultImage.src) {
            showNotification('没有图片可下载', 'error');
            return;
        }

        const link = document.createElement('a');
        link.href = elements.resultImage.src;
        link.download = `image_${Date.now()}.${getFileExtension(state.resultImageType)}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('下载已开始', 'success');
    }

    // ===== Drag and Drop =====

    function setupDragAndDrop() {
        const uploadWrapper = elements.uploadArea;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, () => {
                uploadWrapper.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, () => {
                uploadWrapper.classList.remove('drag-over');
            });
        });

        uploadWrapper.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        // Global drop overlay
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, (e) => {
                if (state.mode === 'imageToBase64') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            document.body.addEventListener(eventName, (e) => {
                if (state.mode === 'imageToBase64' && e.dataTransfer.types.includes('Files')) {
                    elements.dropOverlay.classList.add('show');
                }
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, () => {
                elements.dropOverlay.classList.remove('show');
            });
        });

        document.body.addEventListener('drop', (e) => {
            if (state.mode === 'imageToBase64') {
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFile(files[0]);
                }
            }
        });
    }

    // ===== Event Listeners =====

    function initEventListeners() {
        // Mode switch
        elements.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchMode(btn.dataset.mode);
            });
        });

        // File input
        elements.uploadArea.addEventListener('click', () => {
            elements.fileInput.click();
        });

        elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        // Include prefix checkbox
        elements.includePrefix.addEventListener('change', () => {
            if (state.currentBase64) {
                updateBase64Output();
            }
        });

        // Clear buttons
        elements.clearImageBtn.addEventListener('click', clearImageUpload);
        elements.clearBase64InputBtn.addEventListener('click', clearBase64Input);
        elements.clearResultBtn.addEventListener('click', clearResult);

        // Copy button
        elements.copyBase64Btn.addEventListener('click', copyBase64);

        // Paste button
        elements.pasteBtn.addEventListener('click', pasteFromClipboard);

        // Convert button
        elements.convertBtn.addEventListener('click', convertBase64ToImage);

        // Download button
        elements.downloadBtn.addEventListener('click', downloadImage);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + V to paste in Base64 to Image mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && state.mode === 'base64ToImage') {
                if (document.activeElement !== elements.base64Input) {
                    pasteFromClipboard();
                }
            }

            // Escape to clear
            if (e.key === 'Escape') {
                if (state.mode === 'imageToBase64') {
                    clearImageUpload();
                } else {
                    clearBase64Input();
                    clearResult();
                }
            }
        });
    }

    // ===== Initialize =====

    function init() {
        initEventListeners();
        setupDragAndDrop();
        updateModeIndicator();

        // Update indicator on resize
        window.addEventListener('resize', updateModeIndicator);

        // Initial status
        elements.statusText.textContent = '支持拖放文件或点击上传';
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function() {
    'use strict';

    // State
    const state = {
        originalImage: null,
        originalFile: null,
        compressedBlob: null,
        format: 'jpeg',
        quality: 80,
        resize: false,
        targetWidth: 0,
        targetHeight: 0,
        keepRatio: true,
        originalWidth: 0,
        originalHeight: 0
    };

    // Format mappings
    const formatMap = {
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp'
    };

    const extMap = {
        'jpeg': 'jpg',
        'png': 'png',
        'webp': 'webp'
    };

    // DOM Elements
    const elements = {
        uploadCard: document.getElementById('uploadCard'),
        uploadZone: document.getElementById('uploadZone'),
        fileInput: document.getElementById('fileInput'),
        optionsCard: document.getElementById('optionsCard'),
        formatGroup: document.getElementById('formatGroup'),
        qualitySlider: document.getElementById('qualitySlider'),
        qualityValue: document.getElementById('qualityValue'),
        resizeCheck: document.getElementById('resizeCheck'),
        resizeInputs: document.getElementById('resizeInputs'),
        widthInput: document.getElementById('widthInput'),
        heightInput: document.getElementById('heightInput'),
        keepRatio: document.getElementById('keepRatio'),
        previewCard: document.getElementById('previewCard'),
        originalPreview: document.getElementById('originalPreview'),
        compressedPreview: document.getElementById('compressedPreview'),
        originalSize: document.getElementById('originalSize'),
        compressedSize: document.getElementById('compressedSize'),
        compressionRatio: document.getElementById('compressionRatio'),
        dimensions: document.getElementById('dimensions'),
        actionsCard: document.getElementById('actionsCard'),
        resetBtn: document.getElementById('resetBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
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

    // Format file size
    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Handle file select
    function handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification('请选择 PNG、JPG 或 WebP 格式的图片');
            return;
        }

        state.originalFile = file;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                state.originalImage = img;
                state.originalWidth = img.width;
                state.originalHeight = img.height;

                // Set default resize values
                elements.widthInput.value = img.width;
                elements.heightInput.value = img.height;

                // Show UI elements
                elements.optionsCard.style.display = 'block';
                elements.previewCard.style.display = 'block';
                elements.actionsCard.style.display = 'flex';

                // Show original preview
                elements.originalPreview.src = e.target.result;
                elements.originalSize.textContent = formatSize(file.size);

                // Compress image
                compressImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Compress image
    function compressImage() {
        if (!state.originalImage) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let targetWidth = state.originalWidth;
        let targetHeight = state.originalHeight;

        // Handle resize
        if (state.resize && state.targetWidth > 0 && state.targetHeight > 0) {
            targetWidth = state.targetWidth;
            targetHeight = state.targetHeight;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw image
        ctx.drawImage(state.originalImage, 0, 0, targetWidth, targetHeight);

        // Convert to blob
        const quality = state.format === 'png' ? undefined : state.quality / 100;
        const mimeType = formatMap[state.format];

        canvas.toBlob(function(blob) {
            if (!blob) {
                showNotification('压缩失败，请重试');
                return;
            }

            state.compressedBlob = blob;

            // Update preview
            const url = URL.createObjectURL(blob);
            elements.compressedPreview.src = url;
            elements.compressedSize.textContent = formatSize(blob.size);

            // Calculate compression ratio
            const ratio = ((1 - blob.size / state.originalFile.size) * 100).toFixed(1);
            elements.compressionRatio.textContent = ratio + '%';
            elements.compressionRatio.classList.remove('positive', 'negative');

            if (ratio > 0) {
                elements.compressionRatio.textContent = '-' + ratio + '%';
                elements.compressionRatio.classList.add('positive');
            } else if (ratio < 0) {
                elements.compressionRatio.textContent = '+' + Math.abs(ratio) + '%';
                elements.compressionRatio.classList.add('negative');
            }

            // Update dimensions
            elements.dimensions.textContent = `${targetWidth} × ${targetHeight}`;

            // Enable download
            elements.downloadBtn.disabled = false;

        }, mimeType, quality);
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

    // Debounced compress
    const debouncedCompress = debounce(compressImage, 300);

    // Download compressed image
    function downloadImage() {
        if (!state.compressedBlob) return;

        const ext = extMap[state.format];
        const fileName = state.originalFile.name.replace(/\.[^/.]+$/, '') + '_compressed.' + ext;

        const link = document.createElement('a');
        link.download = fileName;
        link.href = URL.createObjectURL(state.compressedBlob);
        link.click();

        showNotification('图片已下载');
    }

    // Reset state
    function resetState() {
        state.originalImage = null;
        state.originalFile = null;
        state.compressedBlob = null;
        state.targetWidth = 0;
        state.targetHeight = 0;

        elements.fileInput.value = '';
        elements.optionsCard.style.display = 'none';
        elements.previewCard.style.display = 'none';
        elements.actionsCard.style.display = 'none';
        elements.resizeCheck.checked = false;
        elements.resizeInputs.style.display = 'none';
        elements.downloadBtn.disabled = true;
    }

    // Update size while keeping ratio
    function updateSizeFromWidth() {
        if (state.keepRatio && state.originalWidth > 0) {
            const ratio = state.originalHeight / state.originalWidth;
            elements.heightInput.value = Math.round(elements.widthInput.value * ratio);
        }
        state.targetWidth = parseInt(elements.widthInput.value) || 0;
        state.targetHeight = parseInt(elements.heightInput.value) || 0;
        debouncedCompress();
    }

    function updateSizeFromHeight() {
        if (state.keepRatio && state.originalHeight > 0) {
            const ratio = state.originalWidth / state.originalHeight;
            elements.widthInput.value = Math.round(elements.heightInput.value * ratio);
        }
        state.targetWidth = parseInt(elements.widthInput.value) || 0;
        state.targetHeight = parseInt(elements.heightInput.value) || 0;
        debouncedCompress();
    }

    // Event Listeners

    // Click to upload
    elements.uploadZone.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // File input change
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Drag and drop
    elements.uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadZone.classList.add('drag-over');
    });

    elements.uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        elements.uploadZone.classList.remove('drag-over');
    });

    elements.uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadZone.classList.remove('drag-over');

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    // Format buttons
    elements.formatGroup.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.formatGroup.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.format = btn.dataset.format;
            compressImage();
        });
    });

    // Quality slider
    elements.qualitySlider.addEventListener('input', (e) => {
        state.quality = parseInt(e.target.value);
        elements.qualityValue.textContent = state.quality;
        debouncedCompress();
    });

    // Resize checkbox
    elements.resizeCheck.addEventListener('change', (e) => {
        state.resize = e.target.checked;
        elements.resizeInputs.style.display = e.target.checked ? 'flex' : 'none';

        if (e.target.checked) {
            state.targetWidth = parseInt(elements.widthInput.value) || state.originalWidth;
            state.targetHeight = parseInt(elements.heightInput.value) || state.originalHeight;
        }

        compressImage();
    });

    // Keep ratio checkbox
    elements.keepRatio.addEventListener('change', (e) => {
        state.keepRatio = e.target.checked;
    });

    // Width input
    elements.widthInput.addEventListener('input', updateSizeFromWidth);

    // Height input
    elements.heightInput.addEventListener('input', updateSizeFromHeight);

    // Reset button
    elements.resetBtn.addEventListener('click', resetState);

    // Download button
    elements.downloadBtn.addEventListener('click', downloadImage);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S to download
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (state.compressedBlob) {
                downloadImage();
            }
        }

        // Escape to reset
        if (e.key === 'Escape') {
            resetState();
        }
    });
})();

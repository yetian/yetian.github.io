// QR码读取器
(function() {
    'use strict';

    // ===== DOM 元素 =====
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const previewCanvas = document.getElementById('previewCanvas');
    const resultSection = document.getElementById('resultSection');
    const resultText = document.getElementById('resultText');
    const resultStatus = document.getElementById('resultStatus');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // ===== 初始化 Canvas 上下文 =====
    const ctx = previewCanvas.getContext('2d');

    // ===== 点击上传区域触发文件选择 =====
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    // ===== 文件选择变化处理 =====
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // ===== 拖拽事件处理 =====
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        } else {
            showError('请上传图片文件');
        }
    });

    // ===== 处理文件 =====
    function handleFile(file) {
        // 隐藏之前的错误信息
        hideError();

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            showError('请上传图片文件');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // 显示预览
                displayPreview(img);

                // 解码 QR 码
                decodeQRCode(img);
            };

            img.onerror = () => {
                showError('图片加载失败');
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            showError('文件读取失败');
        };

        reader.readAsDataURL(file);
    }

    // ===== 显示图片预览 =====
    function displayPreview(img) {
        // 计算缩放比例
        const maxWidth = 400;
        const maxHeight = 260;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }

        // 设置 canvas 尺寸
        previewCanvas.width = width;
        previewCanvas.height = height;

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 显示预览区域
        previewSection.style.display = 'block';
    }

    // ===== 解码 QR 码 =====
    function decodeQRCode(img) {
        // 创建临时 canvas 用于获取完整图片数据
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        // 获取图片数据
        const imageData = tempCtx.getImageData(0, 0, img.width, img.height);

        // 使用 jsQR 解码
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
        });

        // 显示结果
        displayResult(code);
    }

    // ===== 显示解码结果 =====
    function displayResult(code) {
        resultSection.style.display = 'block';

        if (code) {
            // 成功识别
            resultText.value = code.data;
            resultStatus.textContent = '识别成功';
            resultStatus.className = 'result-status success';
            resultSection.classList.add('success');
        } else {
            // 未能识别
            resultText.value = '';
            resultText.placeholder = '未能识别到 QR 码，请确保图片清晰且包含有效的 QR 码';
            resultStatus.textContent = '识别失败';
            resultStatus.className = 'result-status error';
            resultSection.classList.remove('success');
            showError('未能识别到 QR 码，请尝试其他图片');
        }
    }

    // ===== 复制结果 =====
    copyBtn.addEventListener('click', () => {
        const text = resultText.value;
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            // 显示复制成功状态
            copyBtn.innerHTML = '<span>✅</span> 已复制';
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.innerHTML = '<span>📋</span> 复制结果';
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            showError('复制失败，请手动选择复制');
        });
    });

    // ===== 清除 =====
    clearBtn.addEventListener('click', () => {
        // 清除预览
        previewSection.style.display = 'none';
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // 清除结果
        resultSection.style.display = 'none';
        resultText.value = '';
        resultSection.classList.remove('success');

        // 隐藏错误
        hideError();

        // 重置文件输入
        fileInput.value = '';
    });

    // ===== 显示错误信息 =====
    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';

        // 3秒后自动隐藏
        setTimeout(() => {
            hideError();
        }, 3000);
    }

    // ===== 隐藏错误信息 =====
    function hideError() {
        errorMessage.style.display = 'none';
    }

    // ===== 粘贴支持 =====
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                if (file) {
                    handleFile(file);
                }
                break;
            }
        }
    });
})();

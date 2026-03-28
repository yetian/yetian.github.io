(function() {
    'use strict';

    // ===== 预设渐变数据 =====
    const PRESETS = [
        { name: '日落', colors: ['#ff512f', '#f09819'], type: 'linear', direction: 'to right' },
        { name: '海洋', colors: ['#2193b0', '#6dd5ed'], type: 'linear', direction: 'to right' },
        { name: '紫霞', colors: ['#667eea', '#764ba2'], type: 'linear', direction: 'to right' },
        { name: '森林', colors: ['#11998e', '#38ef7d'], type: 'linear', direction: 'to right' },
        { name: '火焰', colors: ['#f12711', '#f5af19'], type: 'linear', direction: 'to right' },
        { name: '星空', colors: ['#0f0c29', '#302b63', '#24243e'], type: 'linear', direction: 'to bottom' },
        { name: '极光', colors: ['#00c6ff', '#0072ff'], type: 'linear', direction: 'to right' },
        { name: '樱花', colors: ['#ff9a9e', '#fecfef'], type: 'linear', direction: 'to right' },
        { name: '薄荷', colors: ['#00b09b', '#96c93d'], type: 'linear', direction: 'to right' },
        { name: '午夜', colors: ['#232526', '#414345'], type: 'linear', direction: 'to right' },
        { name: '彩虹', colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'], type: 'linear', direction: 'to right' },
        { name: '糖果', colors: ['#ff6a88', '#ff99ac'], type: 'linear', direction: 'to right' },
        { name: '暗夜', colors: ['#0f2027', '#203a43', '#2c5364'], type: 'linear', direction: 'to bottom' },
        { name: '金色', colors: ['#f7971e', '#ffd200'], type: 'linear', direction: 'to right' },
        { name: '冰川', colors: ['#83a4d4', '#b6fbff'], type: 'linear', direction: 'to right' },
        { name: '热情', colors: ['#ed213a', '#93291e'], type: 'linear', direction: 'to right' },
        { name: '晨曦', colors: ['#ffecd2', '#fcb69f'], type: 'linear', direction: 'to right' },
        { name: '深海', colors: ['#000046', '#1cb5e0'], type: 'linear', direction: 'to right' },
        { name: '霓虹', colors: ['#fc00ff', '#00dbde'], type: 'linear', direction: 'to right' },
        { name: '日落径向', colors: ['#ff512f', '#dd2476'], type: 'radial', shape: 'circle' },
    ];

    // ===== 状态管理 =====
    const state = {
        type: 'linear',
        direction: 'to right',
        angle: 90,
        radialShape: 'circle',
        radialSize: 'farthest-side',
        radialPosition: 'center',
        colorStops: [
            { color: '#0a84ff', position: 0 },
            { color: '#bf5af2', position: 100 }
        ]
    };

    // ===== DOM 元素 =====
    const elements = {
        typeTabs: document.querySelectorAll('.type-tab'),
        directionCard: document.getElementById('directionCard'),
        radialCard: document.getElementById('radialCard'),
        directionBtns: document.querySelectorAll('.direction-btn'),
        angleSlider: document.getElementById('angleSlider'),
        angleInput: document.getElementById('angleInput'),
        radialShape: document.getElementById('radialShape'),
        radialSize: document.getElementById('radialSize'),
        radialPosition: document.getElementById('radialPosition'),
        colorStops: document.getElementById('colorStops'),
        addColorBtn: document.getElementById('addColorBtn'),
        previewArea: document.getElementById('previewArea'),
        cssCode: document.getElementById('cssCode'),
        copyBtn: document.getElementById('copyBtn'),
        presetGrid: document.getElementById('presetGrid'),
        notification: document.getElementById('notification')
    };

    // ===== 初始化 =====
    function init() {
        renderPresets();
        renderColorStops();
        updateGradient();
        bindEvents();
    }

    // ===== 事件绑定 =====
    function bindEvents() {
        // 渐变类型切换
        elements.typeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                elements.typeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.type = tab.dataset.type;

                if (state.type === 'linear') {
                    elements.directionCard.classList.remove('hidden');
                    elements.radialCard.classList.add('hidden');
                } else {
                    elements.directionCard.classList.add('hidden');
                    elements.radialCard.classList.remove('hidden');
                }
                updateGradient();
            });
        });

        // 方向按钮
        elements.directionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.directionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.direction = btn.dataset.direction;

                // 更新角度显示
                const angleMap = {
                    'to top': 0,
                    'to top right': 45,
                    'to right': 90,
                    'to bottom right': 135,
                    'to bottom': 180,
                    'to bottom left': 225,
                    'to left': 270,
                    'to top left': 315
                };
                const angle = angleMap[state.direction];
                if (angle !== undefined) {
                    state.angle = angle;
                    elements.angleSlider.value = angle;
                    elements.angleInput.value = angle;
                }
                updateGradient();
            });
        });

        // 角度滑块
        elements.angleSlider.addEventListener('input', (e) => {
            state.angle = parseInt(e.target.value);
            elements.angleInput.value = state.angle;

            // 清除方向按钮选中状态
            elements.directionBtns.forEach(b => b.classList.remove('active'));

            // 更新方向
            if (state.angle === 0) state.direction = 'to top';
            else if (state.angle === 45) state.direction = 'to top right';
            else if (state.angle === 90) state.direction = 'to right';
            else if (state.angle === 135) state.direction = 'to bottom right';
            else if (state.angle === 180) state.direction = 'to bottom';
            else if (state.angle === 225) state.direction = 'to bottom left';
            else if (state.angle === 270) state.direction = 'to left';
            else if (state.angle === 315) state.direction = 'to top left';
            else state.direction = `${state.angle}deg`;

            updateGradient();
        });

        // 角度输入框
        elements.angleInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            value = Math.max(0, Math.min(360, value));
            state.angle = value;
            elements.angleSlider.value = value;
            updateGradient();
        });

        // 径向渐变设置
        elements.radialShape.addEventListener('change', (e) => {
            state.radialShape = e.target.value;
            updateGradient();
        });

        elements.radialSize.addEventListener('change', (e) => {
            state.radialSize = e.target.value;
            updateGradient();
        });

        elements.radialPosition.addEventListener('change', (e) => {
            state.radialPosition = e.target.value;
            updateGradient();
        });

        // 添加颜色
        elements.addColorBtn.addEventListener('click', addColorStop);

        // 复制代码
        elements.copyBtn.addEventListener('click', copyCss);
    }

    // ===== 渲染颜色停止点 =====
    function renderColorStops() {
        elements.colorStops.innerHTML = '';

        state.colorStops.forEach((stop, index) => {
            const stopEl = document.createElement('div');
            stopEl.className = 'color-stop';
            stopEl.innerHTML = `
                <div class="color-preview-wrapper">
                    <div class="color-preview-display" style="background: ${stop.color}"></div>
                    <input type="color" value="${stop.color}" data-index="${index}">
                </div>
                <div class="color-input-wrapper">
                    <label>颜色值</label>
                    <input type="text" class="color-hex-input" value="${stop.color}" data-index="${index}" maxlength="7">
                </div>
                <div class="position-wrapper">
                    <label>位置</label>
                    <input type="number" class="position-input" value="${stop.position}" min="0" max="100" data-index="${index}">
                    <span style="color: var(--text-muted); font-size: 0.85rem;">%</span>
                </div>
                <button class="remove-color-btn" data-index="${index}" ${state.colorStops.length <= 2 ? 'disabled' : ''}>&times;</button>
            `;

            elements.colorStops.appendChild(stopEl);
        });

        // 绑定颜色停止点事件
        document.querySelectorAll('.color-stop input[type="color"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                state.colorStops[index].color = e.target.value;
                e.target.previousElementSibling.style.background = e.target.value;
                e.target.closest('.color-stop').querySelector('.color-hex-input').value = e.target.value;
                updateGradient();
            });
        });

        document.querySelectorAll('.color-hex-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                let value = e.target.value;

                // 确保值以 # 开头
                if (!value.startsWith('#')) {
                    value = '#' + value;
                }

                // 验证颜色格式
                if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    state.colorStops[index].color = value;
                    e.target.closest('.color-stop').querySelector('.color-preview-display').style.background = value;
                    e.target.closest('.color-stop').querySelector('input[type="color"]').value = value;
                    updateGradient();
                }
            });
        });

        document.querySelectorAll('.position-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                let value = parseInt(e.target.value) || 0;
                value = Math.max(0, Math.min(100, value));
                state.colorStops[index].position = value;
                updateGradient();
            });
        });

        document.querySelectorAll('.remove-color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (state.colorStops.length > 2) {
                    const index = parseInt(e.target.dataset.index);
                    state.colorStops.splice(index, 1);
                    renderColorStops();
                    updateGradient();
                }
            });
        });
    }

    // ===== 添加颜色停止点 =====
    function addColorStop() {
        if (state.colorStops.length >= 8) {
            showNotification('最多支持 8 个颜色停止点');
            return;
        }

        // 生成随机颜色
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

        // 计算新位置
        const lastPosition = state.colorStops[state.colorStops.length - 1].position;
        const newPosition = Math.min(100, lastPosition + 10);

        state.colorStops.push({ color: randomColor, position: newPosition });
        renderColorStops();
        updateGradient();
    }

    // ===== 更新渐变 =====
    function updateGradient() {
        const colorString = state.colorStops
            .map(stop => `${stop.color} ${stop.position}%`)
            .join(', ');

        let gradient;
        if (state.type === 'linear') {
            gradient = `linear-gradient(${state.angle}deg, ${colorString})`;
        } else {
            gradient = `radial-gradient(${state.radialShape} ${state.radialSize} at ${state.radialPosition}, ${colorString})`;
        }

        // 更新预览
        elements.previewArea.style.background = gradient;

        // 更新CSS代码
        const cssText = `background: ${gradient};`;
        elements.cssCode.textContent = cssText;
    }

    // ===== 渲染预设 =====
    function renderPresets() {
        elements.presetGrid.innerHTML = '';

        PRESETS.forEach((preset, index) => {
            const presetEl = document.createElement('div');
            presetEl.className = 'preset-item';
            presetEl.title = preset.name;

            const colorString = preset.colors.map((c, i) => {
                const pos = (i / (preset.colors.length - 1)) * 100;
                return `${c} ${pos}%`;
            }).join(', ');

            let gradient;
            if (preset.type === 'radial') {
                gradient = `radial-gradient(circle, ${colorString})`;
            } else {
                gradient = `linear-gradient(${preset.direction || 'to right'}, ${colorString})`;
            }

            presetEl.style.background = gradient;

            presetEl.addEventListener('click', () => {
                applyPreset(preset);

                // 更新选中状态
                document.querySelectorAll('.preset-item').forEach(p => p.classList.remove('active'));
                presetEl.classList.add('active');
            });

            elements.presetGrid.appendChild(presetEl);
        });
    }

    // ===== 应用预设 =====
    function applyPreset(preset) {
        // 设置类型
        state.type = preset.type;
        elements.typeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === preset.type);
        });

        if (preset.type === 'linear') {
            elements.directionCard.classList.remove('hidden');
            elements.radialCard.classList.add('hidden');

            // 设置方向
            if (preset.direction) {
                state.direction = preset.direction;
                const angleMap = {
                    'to top': 0,
                    'to top right': 45,
                    'to right': 90,
                    'to bottom right': 135,
                    'to bottom': 180,
                    'to bottom left': 225,
                    'to left': 270,
                    'to top left': 315
                };
                if (angleMap[preset.direction] !== undefined) {
                    state.angle = angleMap[preset.direction];
                    elements.angleSlider.value = state.angle;
                    elements.angleInput.value = state.angle;
                }
                elements.directionBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.direction === preset.direction);
                });
            }
        } else {
            elements.directionCard.classList.add('hidden');
            elements.radialCard.classList.remove('hidden');

            if (preset.shape) {
                state.radialShape = preset.shape;
                elements.radialShape.value = preset.shape;
            }
        }

        // 设置颜色
        state.colorStops = preset.colors.map((color, index) => ({
            color,
            position: Math.round((index / (preset.colors.length - 1)) * 100)
        }));

        renderColorStops();
        updateGradient();
    }

    // ===== 复制CSS =====
    function copyCss() {
        const cssText = elements.cssCode.textContent;
        navigator.clipboard.writeText(cssText).then(() => {
            showNotification('已复制到剪贴板');
        }).catch(() => {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = cssText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('已复制到剪贴板');
        });
    }

    // ===== 显示通知 =====
    function showNotification(message) {
        elements.notification.textContent = message;
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2000);
    }

    // ===== 启动 =====
    init();
})();

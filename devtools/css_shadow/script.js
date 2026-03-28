// CSS Shadow Generator - JavaScript
(function() {
    'use strict';

    // DOM Elements
    const previewBox = document.getElementById('previewBox');
    const shadowsList = document.getElementById('shadowsList');
    const presetsGrid = document.getElementById('presetsGrid');
    const cssCode = document.getElementById('cssCode');
    const addShadowBtn = document.getElementById('addShadowBtn');
    const resetBtn = document.getElementById('resetBtn');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // Preset shadow styles
    const presets = [
        { name: '柔和', shadow: { x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false } },
        { name: '中等', shadow: { x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(0,0,0,0.15)', inset: false } },
        { name: '硬边', shadow: { x: 4, y: 4, blur: 0, spread: 0, color: 'rgba(0,0,0,0.3)', inset: false } },
        { name: '弥散', shadow: { x: 0, y: 20, blur: 60, spread: 0, color: 'rgba(0,0,0,0.2)', inset: false } },
        { name: '内凹', shadow: { x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.3)', inset: true } },
        { name: '凸起', shadow: { x: 0, y: -4, blur: 8, spread: 0, color: 'rgba(255,255,255,0.5)', inset: true } },
        { name: '发光', shadow: { x: 0, y: 0, blur: 20, spread: 5, color: 'rgba(10,132,255,0.6)', inset: false } },
        { name: '霓虹', shadow: { x: 0, y: 0, blur: 10, spread: 2, color: 'rgba(191,90,242,0.8)', inset: false } },
    ];

    // State
    let shadows = [];
    let shadowIdCounter = 0;

    // Initialize
    function init() {
        // Add initial shadow
        addShadow();

        // Render presets
        renderPresets();

        // Setup event listeners
        setupEventListeners();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        addShadowBtn.addEventListener('click', addShadow);
        resetBtn.addEventListener('click', resetAll);
        copyAllBtn.addEventListener('click', copyCSS);
        copyCodeBtn.addEventListener('click', copyCSS);
    }

    // Add a new shadow
    function addShadow(preset = null) {
        const id = shadowIdCounter++;
        const shadow = preset ? { ...preset, id } : {
            id,
            x: 0,
            y: 4,
            blur: 16,
            spread: 0,
            color: 'rgba(0,0,0,0.15)',
            inset: false
        };

        shadows.push(shadow);
        renderShadowItem(shadow);
        updatePreview();
    }

    // Render a single shadow control item
    function renderShadowItem(shadow) {
        const item = document.createElement('div');
        item.className = 'shadow-item';
        item.dataset.id = shadow.id;

        item.innerHTML = `
            <div class="shadow-item-header">
                <span class="shadow-item-title">阴影 #${shadows.indexOf(shadow) + 1}</span>
                <div class="shadow-item-actions">
                    <button class="shadow-action-btn move-up" title="上移">↑</button>
                    <button class="shadow-action-btn move-down" title="下移">↓</button>
                    <button class="shadow-action-btn delete" title="删除">×</button>
                </div>
            </div>
            <div class="slider-group">
                <div class="slider-control">
                    <div class="slider-label">
                        <span>X 偏移</span>
                        <span class="slider-value" data-prop="x">${shadow.x}px</span>
                    </div>
                    <input type="range" class="slider-input" data-prop="x"
                           min="-100" max="100" value="${shadow.x}">
                </div>
                <div class="slider-control">
                    <div class="slider-label">
                        <span>Y 偏移</span>
                        <span class="slider-value" data-prop="y">${shadow.y}px</span>
                    </div>
                    <input type="range" class="slider-input" data-prop="y"
                           min="-100" max="100" value="${shadow.y}">
                </div>
                <div class="slider-control">
                    <div class="slider-label">
                        <span>模糊半径</span>
                        <span class="slider-value" data-prop="blur">${shadow.blur}px</span>
                    </div>
                    <input type="range" class="slider-input" data-prop="blur"
                           min="0" max="200" value="${shadow.blur}">
                </div>
                <div class="slider-control">
                    <div class="slider-label">
                        <span>扩展半径</span>
                        <span class="slider-value" data-prop="spread">${shadow.spread}px</span>
                    </div>
                    <input type="range" class="slider-input" data-prop="spread"
                           min="-50" max="50" value="${shadow.spread}">
                </div>
            </div>
            <div class="color-control">
                <span class="color-label">阴影颜色</span>
                <div class="color-picker-wrapper">
                    <input type="color" class="color-picker" data-prop="color"
                           value="${rgbaToHex(shadow.color)}">
                    <input type="text" class="color-hex-input" data-prop="colorHex"
                           value="${shadow.color}" placeholder="rgba(0,0,0,0.15)">
                </div>
            </div>
            <div class="inset-control">
                <span class="color-label">内阴影</span>
                <div class="toggle-switch ${shadow.inset ? 'active' : ''}" data-prop="inset"></div>
            </div>
        `;

        // Add event listeners for this item
        setupShadowItemListeners(item, shadow);

        shadowsList.appendChild(item);
    }

    // Setup listeners for a shadow item
    function setupShadowItemListeners(item, shadow) {
        // Slider inputs
        item.querySelectorAll('.slider-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const prop = e.target.dataset.prop;
                const value = parseInt(e.target.value);
                shadow[prop] = value;
                item.querySelector(`.slider-value[data-prop="${prop}"]`).textContent = `${value}px`;
                updatePreview();
            });
        });

        // Color picker
        const colorPicker = item.querySelector('.color-picker');
        const colorHexInput = item.querySelector('.color-hex-input');

        colorPicker.addEventListener('input', (e) => {
            const hex = e.target.value;
            const rgba = hexToRgba(hex, getAlphaFromRgba(shadow.color));
            shadow.color = rgba;
            colorHexInput.value = rgba;
            updatePreview();
        });

        // Color hex/rgba input
        colorHexInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            if (isValidColor(value)) {
                shadow.color = value;
                if (value.startsWith('#')) {
                    colorPicker.value = value;
                } else if (value.startsWith('rgba') || value.startsWith('rgb')) {
                    colorPicker.value = rgbaToHex(value);
                }
                updatePreview();
            }
        });

        // Inset toggle
        const insetToggle = item.querySelector('.toggle-switch[data-prop="inset"]');
        insetToggle.addEventListener('click', () => {
            shadow.inset = !shadow.inset;
            insetToggle.classList.toggle('active', shadow.inset);
            updatePreview();
        });

        // Delete button
        item.querySelector('.shadow-action-btn.delete').addEventListener('click', () => {
            if (shadows.length > 1) {
                shadows = shadows.filter(s => s.id !== shadow.id);
                item.remove();
                updateShadowTitles();
                updatePreview();
            } else {
                showNotification('至少保留一个阴影');
            }
        });

        // Move up
        item.querySelector('.shadow-action-btn.move-up').addEventListener('click', () => {
            const index = shadows.indexOf(shadow);
            if (index > 0) {
                [shadows[index], shadows[index - 1]] = [shadows[index - 1], shadows[index]];
                const prevItem = item.previousElementSibling;
                if (prevItem) {
                    shadowsList.insertBefore(item, prevItem);
                    updateShadowTitles();
                    updatePreview();
                }
            }
        });

        // Move down
        item.querySelector('.shadow-action-btn.move-down').addEventListener('click', () => {
            const index = shadows.indexOf(shadow);
            if (index < shadows.length - 1) {
                [shadows[index], shadows[index + 1]] = [shadows[index + 1], shadows[index]];
                const nextItem = item.nextElementSibling;
                if (nextItem) {
                    shadowsList.insertBefore(nextItem, item);
                    updateShadowTitles();
                    updatePreview();
                }
            }
        });
    }

    // Update shadow titles after reordering
    function updateShadowTitles() {
        shadowsList.querySelectorAll('.shadow-item').forEach((item, index) => {
            const title = item.querySelector('.shadow-item-title');
            title.textContent = `阴影 #${index + 1}`;
        });
    }

    // Render presets
    function renderPresets() {
        presetsGrid.innerHTML = presets.map((preset, index) => `
            <button class="preset-btn" data-preset="${index}"
                    style="box-shadow: ${generateShadowCSS([preset.shadow])}">
                <span class="preset-name">${preset.name}</span>
            </button>
        `).join('');

        // Add click listeners
        presetsGrid.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetIndex = parseInt(btn.dataset.preset);
                const preset = presets[presetIndex];

                // Apply preset to the first shadow or add new
                if (shadows.length === 1 && shadows[0].x === 0 && shadows[0].y === 4 && shadows[0].blur === 16) {
                    // Replace default shadow
                    Object.assign(shadows[0], { ...preset.shadow, id: shadows[0].id });
                    updateShadowItem(shadows[0]);
                } else {
                    addShadow(preset.shadow);
                }

                updatePreview();
                showNotification(`已应用 "${preset.name}" 预设`);
            });
        });
    }

    // Update shadow item UI from shadow data
    function updateShadowItem(shadow) {
        const item = shadowsList.querySelector(`[data-id="${shadow.id}"]`);
        if (!item) return;

        item.querySelectorAll('.slider-input').forEach(input => {
            const prop = input.dataset.prop;
            input.value = shadow[prop];
            item.querySelector(`.slider-value[data-prop="${prop}"]`).textContent = `${shadow[prop]}px`;
        });

        item.querySelector('.color-picker').value = rgbaToHex(shadow.color);
        item.querySelector('.color-hex-input').value = shadow.color;
        item.querySelector('.toggle-switch[data-prop="inset"]').classList.toggle('active', shadow.inset);
    }

    // Generate shadow CSS string
    function generateShadowCSS(shadowList) {
        return shadowList.map(s => {
            const parts = [];
            if (s.inset) parts.push('inset');
            parts.push(`${s.x}px`, `${s.y}px`, `${s.blur}px`, `${s.spread}px`);
            parts.push(s.color);
            return parts.join(' ');
        }).join(',\n    ');
    }

    // Update preview and CSS output
    function updatePreview() {
        const cssString = generateShadowCSS(shadows);
        previewBox.style.boxShadow = cssString.replace(/\n\s+/g, ' ');
        cssCode.textContent = `box-shadow: ${cssString};`;
    }

    // Reset all shadows
    function resetAll() {
        shadows = [];
        shadowIdCounter = 0;
        shadowsList.innerHTML = '';
        addShadow();
        showNotification('已重置');
    }

    // Copy CSS
    function copyCSS() {
        const css = cssCode.textContent;
        navigator.clipboard.writeText(css).then(() => {
            showNotification('已复制到剪贴板');
        }).catch(() => {
            showNotification('复制失败');
        });
    }

    // Show notification
    function showNotification(text) {
        notificationText.textContent = text;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Color utility functions
    function hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function rgbaToHex(rgba) {
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const [, r, g, b] = match;
            return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
        }
        return rgba.startsWith('#') ? rgba : '#000000';
    }

    function getAlphaFromRgba(rgba) {
        const match = rgba.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
        return match ? parseFloat(match[1]) : 1;
    }

    function isValidColor(color) {
        // Check for valid hex
        if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(color)) return true;
        // Check for valid rgb/rgba
        if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) return true;
        return false;
    }

    // Initialize
    init();
})();

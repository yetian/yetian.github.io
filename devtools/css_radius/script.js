// CSS Border Radius Generator - JavaScript
(function() {
    'use strict';

    // DOM Elements
    const previewBox = document.getElementById('previewBox');
    const topLeftInput = document.getElementById('topLeft');
    const topRightInput = document.getElementById('topRight');
    const bottomRightInput = document.getElementById('bottomRight');
    const bottomLeftInput = document.getElementById('bottomLeft');
    const linkToggle = document.getElementById('linkToggle');
    const linkIndicator = document.getElementById('linkIndicator');
    const quickSlider = document.getElementById('quickSlider');
    const quickValue = document.getElementById('quickValue');
    const unitBtns = document.querySelectorAll('.unit-btn');
    const presetsGrid = document.getElementById('presetsGrid');
    const cssCode = document.getElementById('cssCode');
    const resetBtn = document.getElementById('resetBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const widthSlider = document.getElementById('widthSlider');
    const heightSlider = document.getElementById('heightSlider');
    const widthValue = document.getElementById('widthValue');
    const heightValue = document.getElementById('heightValue');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // Preset shapes
    const presets = [
        { name: '无圆角', values: [0, 0, 0, 0] },
        { name: '微圆', values: [4, 4, 4, 4] },
        { name: '圆角', values: [16, 16, 16, 16] },
        { name: '大圆角', values: [32, 32, 32, 32] },
        { name: '圆形', values: [50, 50, 50, 50], unit: '%' },
        { name: '胶囊', values: [50, 50, 50, 50], unit: '%', heightRatio: 0.5 },
        { name: '不对称', values: [0, 50, 0, 50], unit: '%' },
        { name: '叶子', values: [0, 50, 50, 0], unit: '%' },
        { name: '水滴', values: [50, 50, 0, 50], unit: '%' },
        { name: '盾牌', values: [50, 50, 10, 10], unit: '%' },
        { name: '花瓣', values: [50, 20, 50, 20], unit: '%' },
        { name: '随机', values: [20, 40, 30, 50] },
    ];

    // State
    let state = {
        corners: {
            topLeft: 16,
            topRight: 16,
            bottomRight: 16,
            bottomLeft: 16
        },
        linked: true,
        unit: 'px',
        previewWidth: 200,
        previewHeight: 200
    };

    // Initialize
    function init() {
        loadState();
        renderPresets();
        setupEventListeners();
        updatePreview();
        updateInputs();
        updateUnitButtons();
        updateLinkIndicator();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Corner inputs
        [topLeftInput, topRightInput, bottomRightInput, bottomLeftInput].forEach(input => {
            input.addEventListener('input', handleCornerInput);
            input.addEventListener('change', handleCornerChange);
        });

        // Link toggle
        linkToggle.addEventListener('click', toggleLink);

        // Quick slider
        quickSlider.addEventListener('input', handleQuickSlider);

        // Unit buttons
        unitBtns.forEach(btn => {
            btn.addEventListener('click', () => handleUnitChange(btn.dataset.unit));
        });

        // Reset button
        resetBtn.addEventListener('click', resetAll);

        // Copy buttons
        copyBtn.addEventListener('click', copyCSS);
        copyCodeBtn.addEventListener('click', copyCSS);

        // Preview size sliders
        widthSlider.addEventListener('input', handleWidthChange);
        heightSlider.addEventListener('input', handleHeightChange);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
    }

    // Handle corner input
    function handleCornerInput(e) {
        const corner = e.target.id;
        let value = parseInt(e.target.value) || 0;

        // Ensure non-negative
        value = Math.max(0, value);

        if (state.linked) {
            // Update all corners
            state.corners.topLeft = value;
            state.corners.topRight = value;
            state.corners.bottomRight = value;
            state.corners.bottomLeft = value;
            updateInputs();
        } else {
            state.corners[corner] = value;
        }

        updateQuickSlider();
        updatePreview();
        saveState();
    }

    // Handle corner change (blur/enter)
    function handleCornerChange(e) {
        const value = parseInt(e.target.value) || 0;
        e.target.value = Math.max(0, value);
    }

    // Handle quick slider
    function handleQuickSlider(e) {
        const value = parseInt(e.target.value);
        quickValue.textContent = value;

        if (state.linked) {
            state.corners.topLeft = value;
            state.corners.topRight = value;
            state.corners.bottomRight = value;
            state.corners.bottomLeft = value;
            updateInputs();
        }

        updatePreview();
        saveState();
    }

    // Update quick slider to match corners
    function updateQuickSlider() {
        if (state.linked) {
            const value = state.corners.topLeft;
            quickSlider.value = value;
            quickValue.textContent = value;
        }
    }

    // Toggle link
    function toggleLink() {
        state.linked = !state.linked;
        linkToggle.classList.toggle('active', state.linked);
        updateLinkIndicator();

        if (state.linked) {
            // Sync all corners to top-left value
            const value = state.corners.topLeft;
            state.corners.topRight = value;
            state.corners.bottomRight = value;
            state.corners.bottomLeft = value;
            updateInputs();
            updatePreview();
        }

        saveState();
    }

    // Update link indicator
    function updateLinkIndicator() {
        linkIndicator.classList.toggle('unlinked', !state.linked);
    }

    // Handle unit change
    function handleUnitChange(unit) {
        state.unit = unit;
        updateUnitButtons();
        updatePreview();
        saveState();
    }

    // Update unit buttons
    function updateUnitButtons() {
        unitBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === state.unit);
        });
    }

    // Handle width change
    function handleWidthChange(e) {
        state.previewWidth = parseInt(e.target.value);
        widthValue.textContent = state.previewWidth + 'px';
        previewBox.style.width = state.previewWidth + 'px';
        saveState();
    }

    // Handle height change
    function handleHeightChange(e) {
        state.previewHeight = parseInt(e.target.value);
        heightValue.textContent = state.previewHeight + 'px';
        previewBox.style.height = state.previewHeight + 'px';
        saveState();
    }

    // Handle keyboard shortcuts
    function handleKeyboard(e) {
        // Ctrl+C to copy CSS
        if (e.ctrlKey && e.key === 'c' && !window.getSelection().toString()) {
            e.preventDefault();
            copyCSS();
        }
        // Ctrl+R to reset
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            resetAll();
        }
    }

    // Update inputs from state
    function updateInputs() {
        topLeftInput.value = state.corners.topLeft;
        topRightInput.value = state.corners.topRight;
        bottomRightInput.value = state.corners.bottomRight;
        bottomLeftInput.value = state.corners.bottomLeft;
    }

    // Update preview
    function updatePreview() {
        const { topLeft, topRight, bottomRight, bottomLeft } = state.corners;
        const unit = state.unit;
        const radius = `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`;

        previewBox.style.borderRadius = radius;
        cssCode.textContent = `border-radius: ${radius};`;

        // Update preview box size
        previewBox.style.width = state.previewWidth + 'px';
        previewBox.style.height = state.previewHeight + 'px';
        widthSlider.value = state.previewWidth;
        heightSlider.value = state.previewHeight;
        widthValue.textContent = state.previewWidth + 'px';
        heightValue.textContent = state.previewHeight + 'px';
    }

    // Render presets
    function renderPresets() {
        presetsGrid.innerHTML = presets.map((preset, index) => {
            const unit = preset.unit || 'px';
            const radius = `${preset.values[0]}${unit} ${preset.values[1]}${unit} ${preset.values[2]}${unit} ${preset.values[3]}${unit}`;

            return `
                <button class="preset-btn" data-preset="${index}"
                        style="border-radius: ${radius}; ${preset.heightRatio ? 'height: 50%;' : ''}">
                    <span class="preset-name">${preset.name}</span>
                </button>
            `;
        }).join('');

        // Add click listeners
        presetsGrid.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetIndex = parseInt(btn.dataset.preset);
                applyPreset(presetIndex);
            });
        });
    }

    // Apply preset
    function applyPreset(index) {
        const preset = presets[index];

        // Apply values
        state.corners.topLeft = preset.values[0];
        state.corners.topRight = preset.values[1];
        state.corners.bottomRight = preset.values[2];
        state.corners.bottomLeft = preset.values[3];

        // Apply unit if specified
        if (preset.unit) {
            state.unit = preset.unit;
            updateUnitButtons();
        }

        // Apply height ratio for pill shape
        if (preset.heightRatio) {
            state.previewHeight = Math.round(state.previewWidth * preset.heightRatio);
        }

        updateInputs();
        updateQuickSlider();
        updatePreview();
        saveState();

        showNotification(`已应用 "${preset.name}" 预设`);
    }

    // Reset all
    function resetAll() {
        state = {
            corners: {
                topLeft: 16,
                topRight: 16,
                bottomRight: 16,
                bottomLeft: 16
            },
            linked: true,
            unit: 'px',
            previewWidth: 200,
            previewHeight: 200
        };

        linkToggle.classList.add('active');
        updateInputs();
        updateQuickSlider();
        updateUnitButtons();
        updateLinkIndicator();
        updatePreview();
        saveState();

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

    // Save state to localStorage
    function saveState() {
        try {
            localStorage.setItem('css_radius_state', JSON.stringify(state));
        } catch (e) {
            // Ignore storage errors
        }
    }

    // Load state from localStorage
    function loadState() {
        try {
            const saved = localStorage.getItem('css_radius_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
                linkToggle.classList.toggle('active', state.linked);
            }
        } catch (e) {
            // Ignore storage errors
        }
    }

    // Initialize
    init();
})();

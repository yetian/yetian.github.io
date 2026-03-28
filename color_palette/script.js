// Color Palette Generator - JavaScript
(function() {
    'use strict';

    const SAVED_KEY = 'color_palettes';

    // DOM Elements
    const colorPreview = document.getElementById('colorPreview');
    const colorPicker = document.getElementById('colorPicker');
    const hexInput = document.getElementById('hexInput');
    const rgbInput = document.getElementById('rgbInput');
    const hslInput = document.getElementById('hslInput');
    const harmonyTabs = document.getElementById('harmonyTabs');
    const paletteColors = document.getElementById('paletteColors');
    const savePaletteBtn = document.getElementById('savePalette');
    const savedList = document.getElementById('savedList');
    const clearSaved = document.getElementById('clearSaved');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    const gradientCard = document.getElementById('gradientCard');
    const gradientStart = document.getElementById('gradientStart');
    const gradientStartPreview = document.getElementById('gradientStartPreview');
    const gradientEnd = document.getElementById('gradientEnd');
    const gradientEndPreview = document.getElementById('gradientEndPreview');
    const colorCount = document.getElementById('colorCount');
    const colorCountValue = document.getElementById('colorCountValue');

    // State
    let currentColor = { h: 239, s: 84, l: 67 };
    let gradientStartColor = { h: 239, s: 84, l: 67 };
    let gradientEndColor = { h: 330, s: 81, l: 60 };
    let currentHarmony = 'monochromatic';
    let currentColorCount = 5;
    let savedPalettes = loadSaved();

    // Initialize
    function init() {
        setupEventListeners();
        updateFromHSL();
        // Set initial background color
        colorPreview.style.backgroundColor = '#6366f1';
        gradientStartPreview.style.backgroundColor = '#6366f1';
        gradientEndPreview.style.backgroundColor = '#ec4899';
        generatePalette();
        renderSaved();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Color picker
        colorPicker.addEventListener('input', (e) => {
            const hex = e.target.value;
            currentColor = hexToHSL(hex);
            updateInputs();
            generatePalette();
        });

        // HEX input
        hexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                currentColor = hexToHSL(hex);
                updateFromHSL();
                generatePalette();
            }
        });

        // RGB input
        rgbInput.addEventListener('input', (e) => {
            const match = e.target.value.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
            if (match) {
                const [, r, g, b] = match.map(Number);
                if (r <= 255 && g <= 255 && b <= 255) {
                    currentColor = rgbToHSL(r, g, b);
                    updateFromHSL();
                    generatePalette();
                }
            }
        });

        // HSL input
        hslInput.addEventListener('input', (e) => {
            const match = e.target.value.match(/^(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?$/);
            if (match) {
                const [, h, s, l] = match.map(Number);
                if (h <= 360 && s <= 100 && l <= 100) {
                    currentColor = { h, s, l };
                    updateFromHSL();
                    generatePalette();
                }
            }
        });

        // Harmony tabs
        harmonyTabs.querySelectorAll('.harmony-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                harmonyTabs.querySelectorAll('.harmony-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentHarmony = tab.dataset.harmony;

                // Show/hide gradient card
                if (currentHarmony === 'gradient') {
                    gradientCard.classList.remove('hidden');
                } else {
                    gradientCard.classList.add('hidden');
                }

                generatePalette();
            });
        });

        // Gradient start color
        gradientStart.addEventListener('input', (e) => {
            gradientStartColor = hexToHSL(e.target.value);
            gradientStartPreview.style.backgroundColor = e.target.value;
            if (currentHarmony === 'gradient') {
                generatePalette();
            }
        });

        // Gradient end color
        gradientEnd.addEventListener('input', (e) => {
            gradientEndColor = hexToHSL(e.target.value);
            gradientEndPreview.style.backgroundColor = e.target.value;
            if (currentHarmony === 'gradient') {
                generatePalette();
            }
        });

        // Color count slider
        colorCount.addEventListener('input', (e) => {
            currentColorCount = parseInt(e.target.value);
            colorCountValue.textContent = currentColorCount;
            generatePalette();
        });

        // Save palette
        savePaletteBtn.addEventListener('click', savePalette);

        // Clear saved
        clearSaved.addEventListener('click', () => {
            savedPalettes = [];
            saveToStorage();
            renderSaved();
            showNotification('已清空收藏');
        });
    }

    // Color Conversion Functions
    function hexToHSL(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return rgbToHSL(r * 255, g * 255, b * 255);
    }

    function rgbToHSL(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function hslToRGB(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    function hslToHex(h, s, l) {
        const { r, g, b } = hslToRGB(h, s, l);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    function interpolateColor(color1, color2, factor) {
        // Convert to RGB for interpolation
        const rgb1 = hslToRGB(color1.h, color1.s, color1.l);
        const rgb2 = hslToRGB(color2.h, color2.s, color2.l);

        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

        return rgbToHSL(r, g, b);
    }

    // Update Inputs
    function updateInputs() {
        const { h, s, l } = currentColor;
        const { r, g, b } = hslToRGB(h, s, l);
        const hex = hslToHex(h, s, l);

        hexInput.value = hex;
        rgbInput.value = `${r}, ${g}, ${b}`;
        hslInput.value = `${h}, ${s}%, ${l}%`;
    }

    function updateFromHSL() {
        const { h, s, l } = currentColor;
        const hex = hslToHex(h, s, l);
        colorPicker.value = hex;
        colorPreview.style.backgroundColor = hex;
        updateInputs();
    }

    // Generate Palette
    function generatePalette() {
        const colors = getHarmonyColors(currentColor, currentHarmony, currentColorCount);
        renderPalette(colors);
    }

    function getHarmonyColors(hsl, harmony, count) {
        const { h, s, l } = hsl;
        const colors = [];

        switch (harmony) {
            case 'gradient':
                // Interpolate between start and end colors
                for (let i = 0; i < count; i++) {
                    const factor = i / (count - 1);
                    colors.push(interpolateColor(gradientStartColor, gradientEndColor, factor));
                }
                break;

            case 'monochromatic':
                // Same hue, different lightness
                for (let i = 0; i < count; i++) {
                    const lightnessOffset = (i - Math.floor(count / 2)) * (60 / count);
                    colors.push({
                        h,
                        s,
                        l: Math.max(10, Math.min(95, l + lightnessOffset))
                    });
                }
                break;

            case 'complementary':
                // Opposite on the color wheel
                colors.push({ h, s, l });
                colors.push({ h: (h + 180) % 360, s, l });
                for (let i = 2; i < count; i++) {
                    const useHue = i % 2 === 0 ? h : (h + 180) % 360;
                    const variation = (i - 2) * 10;
                    colors.push({
                        h: useHue,
                        s: Math.max(s - 20, 20),
                        l: Math.max(20, Math.min(90, l - 15 + variation))
                    });
                }
                break;

            case 'triadic':
                // Three colors evenly spaced
                for (let i = 0; i < count; i++) {
                    const hueOffset = (i % 3) * 120;
                    const variation = Math.floor(i / 3) * 10;
                    colors.push({
                        h: (h + hueOffset) % 360,
                        s: Math.max(30, s - variation),
                        l: Math.min(85, l + variation / 2)
                    });
                }
                break;

            case 'split':
                // Base + two colors adjacent to complement
                const splitAngles = [0, 150, 210];
                for (let i = 0; i < count; i++) {
                    const angleIndex = i % 3;
                    const variation = Math.floor(i / 3) * 10;
                    colors.push({
                        h: (h + splitAngles[angleIndex]) % 360,
                        s: Math.max(25, s - variation),
                        l: Math.max(25, l - variation / 2)
                    });
                }
                break;

            case 'analogous':
                // Adjacent colors on the wheel
                const angleStep = 30 / (count - 1);
                for (let i = 0; i < count; i++) {
                    colors.push({
                        h: (h - 15 + i * angleStep + 360) % 360,
                        s,
                        l
                    });
                }
                break;
        }

        return colors.slice(0, count);
    }

    function renderPalette(colors) {
        paletteColors.innerHTML = colors.map(c => {
            const hex = hslToHex(c.h, c.s, c.l);
            return `
                <div class="palette-color" style="background-color: ${hex}" data-color="${hex}">
                    <span>${hex}</span>
                </div>
            `;
        }).join('');

        // Click to copy
        paletteColors.querySelectorAll('.palette-color').forEach(el => {
            el.addEventListener('click', () => {
                const hex = el.dataset.color;
                navigator.clipboard.writeText(hex).then(() => {
                    showNotification(`已复制 ${hex}`);
                });
            });
        });
    }

    // Save Palette
    function savePalette() {
        const colors = getHarmonyColors(currentColor, currentHarmony, currentColorCount);
        const palette = {
            id: Date.now(),
            colors: colors.map(c => hslToHex(c.h, c.s, c.l)),
            harmony: currentHarmony
        };

        savedPalettes.unshift(palette);
        if (savedPalettes.length > 20) {
            savedPalettes = savedPalettes.slice(0, 20);
        }
        saveToStorage();
        renderSaved();
        showNotification('已收藏此配色');
    }

    // Load/Save
    function loadSaved() {
        try {
            const saved = localStorage.getItem(SAVED_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    function saveToStorage() {
        try {
            localStorage.setItem(SAVED_KEY, JSON.stringify(savedPalettes));
        } catch {
            console.warn('Could not save palettes');
        }
    }

    function renderSaved() {
        if (savedPalettes.length === 0) {
            savedList.innerHTML = '<p class="saved-empty">暂无收藏</p>';
            return;
        }

        savedList.innerHTML = savedPalettes.map((palette, index) => `
            <div class="saved-item" data-index="${index}">
                <div class="saved-palette">
                    ${palette.colors.map(c => `<div class="saved-palette-color" style="background-color: ${c}"></div>`).join('')}
                </div>
                <button class="saved-delete" data-index="${index}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');

        // Click to load
        savedList.querySelectorAll('.saved-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.saved-delete')) return;

                const index = parseInt(item.dataset.index);
                const palette = savedPalettes[index];
                const firstColor = palette.colors[0];

                currentColor = hexToHSL(firstColor);
                currentHarmony = palette.harmony;

                // Update UI
                updateFromHSL();
                harmonyTabs.querySelectorAll('.harmony-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.harmony === palette.harmony);
                });

                // Show/hide gradient card
                if (currentHarmony === 'gradient') {
                    gradientCard.classList.remove('hidden');
                } else {
                    gradientCard.classList.add('hidden');
                }

                generatePalette();
            });
        });

        // Delete handlers
        savedList.querySelectorAll('.saved-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                savedPalettes.splice(index, 1);
                saveToStorage();
                renderSaved();
            });
        });
    }

    // Notification
    function showNotification(text) {
        notificationText.textContent = text;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 1500);
    }

    // Initialize
    init();
})();

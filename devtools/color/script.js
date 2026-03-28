(function() {
    'use strict';

    // State
    const state = {
        hex: '#10b981',
        rgb: { r: 16, g: 185, b: 129 },
        hsl: { h: 160, s: 84, l: 40 },
        cmyk: { c: 91, m: 0, y: 30, k: 28 }
    };

    // DOM Elements
    const elements = {
        colorPicker: document.getElementById('colorPicker'),
        colorPreviewLarge: document.getElementById('colorPreviewLarge'),
        hexInput: document.getElementById('hexInput'),
        hexValue: document.getElementById('hexValue'),
        rgbValue: document.getElementById('rgbValue'),
        hslValue: document.getElementById('hslValue'),
        cmykValue: document.getElementById('cmykValue'),
        copyBtns: document.querySelectorAll('.copy-btn'),
        randomColorBtn: document.getElementById('randomColorBtn'),
        contrastBlackRatio: document.getElementById('contrastBlackRatio'),
        contrastWhiteRatio: document.getElementById('contrastWhiteRatio'),
        contrastBlackAA: document.getElementById('contrastBlackAA'),
        contrastBlackAAA: document.getElementById('contrastBlackAAA'),
        contrastBlackAALarge: document.getElementById('contrastBlackAALarge'),
        contrastWhiteAA: document.getElementById('contrastWhiteAA'),
        contrastWhiteAAA: document.getElementById('contrastWhiteAAA'),
        contrastWhiteAALarge: document.getElementById('contrastWhiteAALarge'),
        contrastBlackPreview: document.getElementById('contrastBlackPreview'),
        contrastWhitePreview: document.getElementById('contrastWhitePreview'),
        complementaryPalette: document.getElementById('complementaryPalette'),
        triadicPalette: document.getElementById('triadicPalette'),
        analogousPalette: document.getElementById('analogousPalette'),
        splitComplementaryPalette: document.getElementById('splitComplementaryPalette'),
        notification: document.getElementById('notification')
    };

    // Color Conversion Functions
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function rgbToHsl(r, g, b) {
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
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function hslToRgb(h, s, l) {
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

    function rgbToCmyk(r, g, b) {
        if (r === 0 && g === 0 && b === 0) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }

        const c = 1 - (r / 255);
        const m = 1 - (g / 255);
        const y = 1 - (b / 255);
        const k = Math.min(c, m, y);

        return {
            c: Math.round(((c - k) / (1 - k)) * 100),
            m: Math.round(((m - k) / (1 - k)) * 100),
            y: Math.round(((y - k) / (1 - k)) * 100),
            k: Math.round(k * 100)
        };
    }

    // WCAG Contrast Calculation
    function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function getContrastRatio(rgb1, rgb2) {
        const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    function getWcagLevel(ratio) {
        return {
            aa: ratio >= 4.5,
            aaa: ratio >= 7,
            aaLarge: ratio >= 3
        };
    }

    // Update all color values
    function updateColor(hex) {
        // Validate hex
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            return;
        }

        state.hex = hex;
        state.rgb = hexToRgb(hex);
        state.hsl = rgbToHsl(state.rgb.r, state.rgb.g, state.rgb.b);
        state.cmyk = rgbToCmyk(state.rgb.r, state.rgb.g, state.rgb.b);

        // Update UI
        elements.colorPicker.value = hex;
        elements.hexInput.value = hex;
        elements.colorPreviewLarge.style.backgroundColor = hex;

        // Update format values
        elements.hexValue.textContent = hex.toUpperCase();
        elements.rgbValue.textContent = `rgb(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b})`;
        elements.hslValue.textContent = `hsl(${state.hsl.h}, ${state.hsl.s}%, ${state.hsl.l}%)`;
        elements.cmykValue.textContent = `cmyk(${state.cmyk.c}%, ${state.cmyk.m}%, ${state.cmyk.y}%, ${state.cmyk.k}%)`;

        // Update contrast
        updateContrast();

        // Update palette
        updatePalette();
    }

    function updateContrast() {
        const black = { r: 0, g: 0, b: 0 };
        const white = { r: 255, g: 255, b: 255 };

        const ratioBlack = getContrastRatio(state.rgb, black);
        const ratioWhite = getContrastRatio(state.rgb, white);

        elements.contrastBlackRatio.textContent = ratioBlack.toFixed(2) + ':1';
        elements.contrastWhiteRatio.textContent = ratioWhite.toFixed(2) + ':1';

        // Update preview background
        elements.contrastBlackPreview.style.color = state.hex;
        elements.contrastWhitePreview.style.color = state.hex;

        // WCAG levels for black
        const levelsBlack = getWcagLevel(ratioBlack);
        updateLevelBadge(elements.contrastBlackAA, levelsBlack.aa);
        updateLevelBadge(elements.contrastBlackAAA, levelsBlack.aaa);
        updateLevelBadge(elements.contrastBlackAALarge, levelsBlack.aaLarge);

        // WCAG levels for white
        const levelsWhite = getWcagLevel(ratioWhite);
        updateLevelBadge(elements.contrastWhiteAA, levelsWhite.aa);
        updateLevelBadge(elements.contrastWhiteAAA, levelsWhite.aaa);
        updateLevelBadge(elements.contrastWhiteAALarge, levelsWhite.aaLarge);
    }

    function updateLevelBadge(element, passed) {
        if (passed) {
            element.classList.add('pass');
            element.textContent = element.textContent.replace('✗', '✓');
            if (!element.textContent.startsWith('✓')) {
                element.textContent = '✓ ' + element.textContent.replace('✓ ', '').replace('✗ ', '');
            }
        } else {
            element.classList.remove('pass');
            element.textContent = '✗ ' + element.textContent.replace('✓ ', '').replace('✗ ', '');
        }
    }

    function updatePalette() {
        const h = state.hsl.h;
        const s = state.hsl.s;
        const l = state.hsl.l;

        // Complementary (180 degrees opposite)
        const complementary = [
            { h: h, s: s, l: l },
            { h: (h + 180) % 360, s: s, l: l }
        ];
        renderPalette(elements.complementaryPalette, complementary);

        // Triadic (120 degrees apart)
        const triadic = [
            { h: h, s: s, l: l },
            { h: (h + 120) % 360, s: s, l: l },
            { h: (h + 240) % 360, s: s, l: l }
        ];
        renderPalette(elements.triadicPalette, triadic);

        // Analogous (30 degrees apart)
        const analogous = [
            { h: (h - 60 + 360) % 360, s: s, l: l },
            { h: (h - 30 + 360) % 360, s: s, l: l },
            { h: h, s: s, l: l },
            { h: (h + 30) % 360, s: s, l: l },
            { h: (h + 60) % 360, s: s, l: l }
        ];
        renderPalette(elements.analogousPalette, analogous);

        // Split Complementary
        const splitComplementary = [
            { h: h, s: s, l: l },
            { h: (h + 150) % 360, s: s, l: l },
            { h: (h + 210) % 360, s: s, l: l }
        ];
        renderPalette(elements.splitComplementaryPalette, splitComplementary);
    }

    function renderPalette(container, colors) {
        container.innerHTML = '';
        colors.forEach((colorHsl, index) => {
            const rgb = hslToRgb(colorHsl.h, colorHsl.s, colorHsl.l);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

            const div = document.createElement('div');
            div.className = 'palette-color' + (index === 0 ? ' active' : '');
            div.style.backgroundColor = hex;
            div.innerHTML = `<span>${hex.toUpperCase()}</span>`;
            div.dataset.hex = hex;

            div.addEventListener('click', () => {
                // Remove active from siblings
                container.querySelectorAll('.palette-color').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                updateColor(hex);
            });

            container.appendChild(div);
        });
    }

    // Show notification
    function showNotification(message) {
        elements.notification.textContent = message;
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2000);
    }

    // Copy to clipboard
    async function copyToClipboard(format) {
        let value = '';
        switch (format) {
            case 'hex':
                value = state.hex.toUpperCase();
                break;
            case 'rgb':
                value = `rgb(${state.rgb.r}, ${state.rgb.g}, ${state.rgb.b})`;
                break;
            case 'hsl':
                value = `hsl(${state.hsl.h}, ${state.hsl.s}%, ${state.hsl.l}%)`;
                break;
            case 'cmyk':
                value = `cmyk(${state.cmyk.c}%, ${state.cmyk.m}%, ${state.cmyk.y}%, ${state.cmyk.k}%)`;
                break;
        }

        if (!value) {
            showNotification('没有内容可复制');
            return;
        }

        try {
            await navigator.clipboard.writeText(value);

            // Update button state
            const btn = document.querySelector(`.copy-btn[data-format="${format}"]`);
            if (btn) {
                btn.classList.add('copied');
                setTimeout(() => btn.classList.remove('copied'), 2000);
            }

            showNotification('已复制到剪贴板');
        } catch (e) {
            showNotification('复制失败');
        }
    }

    // Generate random color
    function generateRandomColor() {
        const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        updateColor(hex);
        showNotification('已生成随机颜色');
    }

    // Validate hex input
    function validateHexInput(value) {
        let hex = value.trim();

        // Add # if missing
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }

        // Validate format
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            return hex.toLowerCase();
        }

        // Try to fix 3-digit hex
        if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
            return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }

        return null;
    }

    // Event Listeners
    elements.colorPicker.addEventListener('input', (e) => {
        updateColor(e.target.value);
    });

    elements.hexInput.addEventListener('input', (e) => {
        const validatedHex = validateHexInput(e.target.value);
        if (validatedHex) {
            updateColor(validatedHex);
        }
    });

    elements.hexInput.addEventListener('blur', (e) => {
        // Reset to current color if invalid
        if (!validateHexInput(e.target.value)) {
            e.target.value = state.hex;
        }
    });

    elements.hexInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const validatedHex = validateHexInput(e.target.value);
            if (validatedHex) {
                updateColor(validatedHex);
            } else {
                e.target.value = state.hex;
            }
        }
    });

    elements.copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            copyToClipboard(btn.dataset.format);
        });
    });

    elements.randomColorBtn.addEventListener('click', generateRandomColor);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to generate random color (when not focused on input)
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            generateRandomColor();
        }
    });

    // Initialize
    updateColor(state.hex);

    // Initialize WCAG badges text
    elements.contrastBlackAA.textContent = 'AA';
    elements.contrastBlackAAA.textContent = 'AAA';
    elements.contrastBlackAALarge.textContent = 'AA Large';
    elements.contrastWhiteAA.textContent = 'AA';
    elements.contrastWhiteAAA.textContent = 'AAA';
    elements.contrastWhiteAALarge.textContent = 'AA Large';
})();

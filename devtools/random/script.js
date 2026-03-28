(function() {
    'use strict';

    // State
    const state = {
        currentTab: 'integer',
        results: [],
        quantity: 5
    };

    // DOM Elements
    const elements = {
        tabs: document.querySelectorAll('.tab'),
        resultsList: document.getElementById('resultsList'),
        copyAllBtn: document.getElementById('copyAllBtn'),
        generateBtn: document.getElementById('generateBtn'),
        notification: document.getElementById('notification'),
        notificationText: document.getElementById('notificationText'),
        quantitySlider: document.getElementById('quantitySlider'),
        quantityValue: document.getElementById('quantityValue'),

        // Option panels
        integerOptions: document.getElementById('integerOptions'),
        floatOptions: document.getElementById('floatOptions'),
        hexOptions: document.getElementById('hexOptions'),
        uuidOptions: document.getElementById('uuidOptions'),
        passwordOptions: document.getElementById('passwordOptions'),

        // Integer options
        intMin: document.getElementById('intMin'),
        intMax: document.getElementById('intMax'),
        intAllowDup: document.getElementById('intAllowDup'),

        // Float options
        floatMin: document.getElementById('floatMin'),
        floatMax: document.getElementById('floatMax'),
        decimalSlider: document.getElementById('decimalSlider'),
        decimalValue: document.getElementById('decimalValue'),

        // Hex options
        hexLengthSlider: document.getElementById('hexLengthSlider'),
        hexLengthValue: document.getElementById('hexLengthValue'),
        hexPrefix: document.getElementById('hexPrefix'),

        // Password options
        pwdLengthSlider: document.getElementById('pwdLengthSlider'),
        pwdLengthValue: document.getElementById('pwdLengthValue'),
        pwdUppercase: document.getElementById('pwdUppercase'),
        pwdLowercase: document.getElementById('pwdLowercase'),
        pwdNumbers: document.getElementById('pwdNumbers'),
        pwdSymbols: document.getElementById('pwdSymbols'),
        pwdExcludeSimilar: document.getElementById('pwdExcludeSimilar')
    };

    // Character sets
    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        similar: '0O1lI'
    };

    // Secure random number generator using crypto.getRandomValues
    function secureRandom() {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] / (0xFFFFFFFF + 1);
    }

    function secureRandomInt(min, max) {
        const range = max - min + 1;
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return min + (array[0] % range);
    }

    function secureRandomFloat(min, max, decimals) {
        const random = secureRandom();
        const value = min + random * (max - min);
        return parseFloat(value.toFixed(decimals));
    }

    // Tab switching
    function switchTab(tabName) {
        state.currentTab = tabName;

        // Update tab buttons
        elements.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update option panels
        const panels = ['integer', 'float', 'hex', 'uuid', 'password'];
        panels.forEach(panel => {
            const panelEl = elements[`${panel}Options`];
            if (panelEl) {
                panelEl.style.display = panel === tabName ? 'flex' : 'none';
            }
        });

        // Clear results when switching tabs
        clearResults();
    }

    // Clear results
    function clearResults() {
        state.results = [];
        elements.resultsList.innerHTML = '<p class="results-empty">点击生成按钮开始</p>';
    }

    // Generate random integer
    function generateInteger() {
        const min = parseInt(elements.intMin.value) || 1;
        const max = parseInt(elements.intMax.value) || 100;
        const allowDup = elements.intAllowDup.checked;
        const quantity = state.quantity;

        if (min > max) {
            showNotification('最小值不能大于最大值');
            return;
        }

        const range = max - min + 1;

        if (!allowDup && quantity > range) {
            showNotification(`不重复模式下最多生成 ${range} 个数字`);
            return;
        }

        const results = [];

        if (allowDup) {
            for (let i = 0; i < quantity; i++) {
                results.push(secureRandomInt(min, max));
            }
        } else {
            const pool = [];
            for (let i = min; i <= max; i++) {
                pool.push(i);
            }
            // Fisher-Yates shuffle using secure random
            for (let i = pool.length - 1; i > 0; i--) {
                const j = secureRandomInt(0, i);
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            for (let i = 0; i < quantity; i++) {
                results.push(pool[i]);
            }
        }

        return results;
    }

    // Generate random float
    function generateFloat() {
        const min = parseFloat(elements.floatMin.value) || 0;
        const max = parseFloat(elements.floatMax.value) || 1;
        const decimals = parseInt(elements.decimalSlider.value) || 4;
        const quantity = state.quantity;

        if (min > max) {
            showNotification('最小值不能大于最大值');
            return;
        }

        const results = [];
        for (let i = 0; i < quantity; i++) {
            results.push(secureRandomFloat(min, max, decimals));
        }

        return results;
    }

    // Generate random hex
    function generateHex() {
        const bytes = parseInt(elements.hexLengthSlider.value) || 8;
        const quantity = state.quantity;
        const useUppercase = document.querySelector('input[name="hexFormat"]:checked').value === 'upper';
        const usePrefix = elements.hexPrefix.checked;

        const results = [];
        for (let i = 0; i < quantity; i++) {
            const array = new Uint8Array(bytes);
            crypto.getRandomValues(array);
            let hex = Array.from(array)
                .map(b => b.toString(16).padStart(2, useUppercase ? 'X' : 'x'))
                .join(useUppercase ? '' : '');
            if (usePrefix) {
                hex = '0x' + hex;
            }
            results.push(hex);
        }

        return results;
    }

    // Generate UUID
    function generateUUID() {
        const quantity = state.quantity;
        const noDashes = document.querySelector('input[name="uuidVersion"]:checked').value === 'v4nodash';

        const results = [];
        for (let i = 0; i < quantity; i++) {
            const array = new Uint8Array(16);
            crypto.getRandomValues(array);

            // Set version (4) and variant bits
            array[6] = (array[6] & 0x0f) | 0x40; // Version 4
            array[8] = (array[8] & 0x3f) | 0x80; // Variant 1

            const hex = Array.from(array)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            if (noDashes) {
                results.push(hex);
            } else {
                // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
                results.push(uuid);
            }
        }

        return results;
    }

    // Generate password
    function generatePassword() {
        const length = parseInt(elements.pwdLengthSlider.value) || 16;
        const quantity = state.quantity;
        const useUppercase = elements.pwdUppercase.checked;
        const useLowercase = elements.pwdLowercase.checked;
        const useNumbers = elements.pwdNumbers.checked;
        const useSymbols = elements.pwdSymbols.checked;
        const excludeSimilar = elements.pwdExcludeSimilar.checked;

        // Build character set
        let chars = '';
        if (useUppercase) chars += charSets.uppercase;
        if (useLowercase) chars += charSets.lowercase;
        if (useNumbers) chars += charSets.numbers;
        if (useSymbols) chars += charSets.symbols;

        if (chars.length === 0) {
            showNotification('请至少选择一种字符类型');
            return;
        }

        // Exclude similar characters
        if (excludeSimilar) {
            chars = chars.split('').filter(c => !charSets.similar.includes(c)).join('');
        }

        const results = [];
        for (let i = 0; i < quantity; i++) {
            const array = new Uint32Array(length);
            crypto.getRandomValues(array);
            let password = '';
            for (let j = 0; j < length; j++) {
                password += chars[array[j] % chars.length];
            }
            results.push(password);
        }

        return results;
    }

    // Generate based on current tab
    function generate() {
        let results;

        switch (state.currentTab) {
            case 'integer':
                results = generateInteger();
                break;
            case 'float':
                results = generateFloat();
                break;
            case 'hex':
                results = generateHex();
                break;
            case 'uuid':
                results = generateUUID();
                break;
            case 'password':
                results = generatePassword();
                break;
        }

        if (results && results.length > 0) {
            state.results = results;
            displayResults(results);
        }
    }

    // Display results
    function displayResults(results) {
        elements.resultsList.innerHTML = '';

        results.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.style.animationDelay = `${index * 0.05}s`;

            const indexSpan = document.createElement('span');
            indexSpan.className = 'result-index';
            indexSpan.textContent = `${index + 1}.`;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'result-value';
            valueSpan.textContent = String(result);

            item.appendChild(indexSpan);
            item.appendChild(valueSpan);

            // Click to copy single item
            item.addEventListener('click', () => {
                copyToClipboard(String(result));
                showNotification('已复制到剪贴板');
            });

            elements.resultsList.appendChild(item);
        });
    }

    // Copy all results
    function copyAll() {
        if (state.results.length === 0) {
            showNotification('没有可复制的内容');
            return;
        }

        const text = state.results.join('\n');
        copyToClipboard(text);
        showNotification(`已复制 ${state.results.length} 条结果`);
    }

    // Copy to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }

    // Show notification
    function showNotification(message) {
        elements.notificationText.textContent = message;
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2500);
    }

    // Update slider display values
    function updateSliderValue(slider, display) {
        display.textContent = slider.value;
    }

    // Event listeners
    function initEventListeners() {
        // Tab switching
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        // Generate button
        elements.generateBtn.addEventListener('click', generate);

        // Copy all button
        elements.copyAllBtn.addEventListener('click', copyAll);

        // Quantity slider
        elements.quantitySlider.addEventListener('input', () => {
            state.quantity = parseInt(elements.quantitySlider.value);
            updateSliderValue(elements.quantitySlider, elements.quantityValue);
        });

        // Decimal slider
        elements.decimalSlider.addEventListener('input', () => {
            updateSliderValue(elements.decimalSlider, elements.decimalValue);
        });

        // Hex length slider
        elements.hexLengthSlider.addEventListener('input', () => {
            updateSliderValue(elements.hexLengthSlider, elements.hexLengthValue);
        });

        // Password length slider
        elements.pwdLengthSlider.addEventListener('input', () => {
            updateSliderValue(elements.pwdLengthSlider, elements.pwdLengthValue);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.target.matches('input')) {
                generate();
            }
        });
    }

    // Initialize
    function init() {
        initEventListeners();
        state.quantity = parseInt(elements.quantitySlider.value);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Number Base Converter - JavaScript
(function() {
    'use strict';

    // DOM Elements
    const numberInput = document.getElementById('numberInput');
    const inputBase = document.getElementById('inputBase');
    const customBaseRow = document.getElementById('customBaseRow');
    const customInputBase = document.getElementById('customInputBase');
    const clearBtn = document.getElementById('clearBtn');
    const errorMessage = document.getElementById('errorMessage');

    const presetButtons = document.querySelectorAll('.preset-btn');

    const binaryResult = document.getElementById('binaryResult');
    const octalResult = document.getElementById('octalResult');
    const decimalResult = document.getElementById('decimalResult');
    const hexResult = document.getElementById('hexResult');

    const outputBase = document.getElementById('outputBase');
    const customOutputBase = document.getElementById('customOutputBase');
    const customResult = document.getElementById('customResult');

    const showBits = document.getElementById('showBits');
    const bitsCount = document.getElementById('bitsCount');
    const bitsDisplay = document.getElementById('bitsDisplay');
    const byteSeparator = document.getElementById('byteSeparator');

    const copyButtons = document.querySelectorAll('.copy-btn');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // State
    let currentDecimalValue = null;

    // Initialize
    function init() {
        setupEventListeners();
        updateFromUrl();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Input handling
        numberInput.addEventListener('input', handleInput);
        inputBase.addEventListener('change', handleBaseChange);
        customInputBase.addEventListener('input', handleInput);
        clearBtn.addEventListener('click', clearInput);

        // Presets
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => handlePresetClick(btn));
        });

        // Output base
        outputBase.addEventListener('change', handleOutputBaseChange);
        customOutputBase.addEventListener('input', convert);

        // Bits display
        showBits.addEventListener('change', convert);
        byteSeparator.addEventListener('change', convert);

        // Copy buttons
        copyButtons.forEach(btn => {
            btn.addEventListener('click', () => copyResult(btn));
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                numberInput.blur();
            }
        });
    }

    // Handle Input Base Change
    function handleBaseChange() {
        const value = inputBase.value;
        customBaseRow.classList.toggle('show', value === 'custom');
        convert();

        // Update preset buttons
        const presetMap = {
            '2': 'binary',
            '8': 'octal',
            '10': 'decimal',
            '16': 'hex'
        };

        presetButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === presetMap[value]);
        });
    }

    // Handle Output Base Change
    function handleOutputBaseChange() {
        const value = outputBase.value;
        customOutputBase.style.display = value === 'custom' ? 'inline-block' : 'none';
        convert();
    }

    // Handle Preset Click
    function handlePresetClick(btn) {
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const preset = btn.dataset.preset;
        const baseMap = {
            'binary': '2',
            'octal': '8',
            'decimal': '10',
            'hex': '16'
        };

        inputBase.value = baseMap[preset];
        customBaseRow.classList.remove('show');
        convert();
    }

    // Handle Input
    function handleInput() {
        convert();
    }

    // Clear Input
    function clearInput() {
        numberInput.value = '';
        currentDecimalValue = null;
        clearResults();
    }

    // Clear Results
    function clearResults() {
        binaryResult.textContent = '-';
        octalResult.textContent = '-';
        decimalResult.textContent = '-';
        hexResult.textContent = '-';
        customResult.textContent = '-';
        bitsCount.textContent = '0 位';
        bitsDisplay.innerHTML = '<span class="bits-placeholder">输入数值后显示位表示</span>';
        errorMessage.textContent = '';
    }

    // Convert
    function convert() {
        const input = numberInput.value.trim();

        if (!input) {
            clearResults();
            return;
        }

        // Get input base
        let base = parseInt(inputBase.value);
        if (inputBase.value === 'custom') {
            base = parseInt(customInputBase.value) || 2;
            base = Math.max(2, Math.min(36, base));
        }

        // Validate and parse
        try {
            // Handle negative numbers
            const isNegative = input.startsWith('-');
            const absInput = isNegative ? input.slice(1) : input;

            // Validate characters for the base
            const validChars = getValidChars(base);
            const inputUpper = absInput.toUpperCase();

            for (const char of inputUpper) {
                if (!validChars.includes(char)) {
                    throw new Error(`无效字符 "${char}"，进制 ${base} 仅支持 ${validChars}`);
                }
            }

            // Parse to decimal (BigInt for large numbers)
            const decimalValue = parseToDecimal(absInput, base);
            currentDecimalValue = isNegative ? -decimalValue : decimalValue;

            errorMessage.textContent = '';

            // Convert to all bases
            const absDecimal = isNegative ? -currentDecimalValue : currentDecimalValue;
            const sign = isNegative ? '-' : '';

            binaryResult.textContent = sign + decimalToBase(absDecimal, 2);
            octalResult.textContent = sign + decimalToBase(absDecimal, 8);
            decimalResult.textContent = sign + absDecimal.toString();
            hexResult.textContent = sign + decimalToBase(absDecimal, 16).toUpperCase();

            // Custom output
            let outBase = parseInt(outputBase.value);
            if (outputBase.value === 'custom') {
                outBase = parseInt(customOutputBase.value) || 36;
                outBase = Math.max(2, Math.min(36, outBase));
            }
            customResult.textContent = sign + decimalToBase(absDecimal, outBase).toUpperCase();

            // Bits display
            updateBitsDisplay(absDecimal, isNegative);

        } catch (e) {
            errorMessage.textContent = e.message;
            clearResults();
        }
    }

    // Get valid characters for a base
    function getValidChars(base) {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return chars.slice(0, base);
    }

    // Parse to decimal
    function parseToDecimal(value, base) {
        try {
            return BigInt(parseInt(value, base));
        } catch {
            // Manual conversion for very large numbers
            let result = BigInt(0);
            const baseBigInt = BigInt(base);

            for (const char of value.toUpperCase()) {
                const digit = parseInt(char, 36);
                result = result * baseBigInt + BigInt(digit);
            }

            return result;
        }
    }

    // Decimal to any base
    function decimalToBase(value, base) {
        if (typeof value === 'bigint') {
            return value.toString(base);
        }
        return value.toString(base);
    }

    // Update Bits Display
    function updateBitsDisplay(value, isNegative) {
        if (!showBits.checked) {
            bitsDisplay.innerHTML = '<span class="bits-placeholder">位显示已关闭</span>';
            bitsCount.textContent = '0 位';
            return;
        }

        // Convert to binary
        const binary = value.toString(2);
        const bitLength = binary.length;
        bitsCount.textContent = `${bitLength} 位`;

        // Format bits with optional byte separation
        let formattedBits = '';
        const useByteSep = byteSeparator.checked;

        if (useByteSep) {
            // Pad to full bytes
            const paddedLength = Math.ceil(bitLength / 8) * 8;
            const paddedBinary = binary.padStart(paddedLength, '0');

            // Group by bytes
            for (let i = 0; i < paddedBinary.length; i += 8) {
                const byte = paddedBinary.slice(i, i + 8);
                let byteHtml = '<span class="bit-group byte-separated">';

                for (const bit of byte) {
                    if (bit === '0') {
                        byteHtml += `<span class="bit-zero">${bit}</span>`;
                    } else {
                        byteHtml += `<span class="bit-one">${bit}</span>`;
                    }
                }

                byteHtml += '</span>';
                formattedBits += byteHtml;
            }
        } else {
            for (const bit of binary) {
                if (bit === '0') {
                    formattedBits += `<span class="bit-zero">${bit}</span>`;
                } else {
                    formattedBits += `<span class="bit-one">${bit}</span>`;
                }
            }
        }

        if (isNegative) {
            formattedBits = '<span style="color: var(--danger);">-</span>' + formattedBits;
        }

        bitsDisplay.innerHTML = formattedBits;
    }

    // Copy Result
    function copyResult(button) {
        const targetId = button.dataset.target;
        const element = document.getElementById(targetId);

        if (!element || element.textContent === '-') {
            return;
        }

        const text = element.textContent;

        navigator.clipboard.writeText(text).then(() => {
            showNotification('已复制到剪贴板');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showNotification('已复制到剪贴板');
        });
    }

    // Show Notification
    function showNotification(text) {
        notificationText.textContent = text;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Update from URL parameters
    function updateFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const num = params.get('num');
        const base = params.get('base');

        if (num) {
            numberInput.value = num;
        }

        if (base && base >= 2 && base <= 36) {
            if ([2, 8, 10, 16].includes(parseInt(base))) {
                inputBase.value = base;
            } else {
                inputBase.value = 'custom';
                customBaseRow.classList.add('show');
                customInputBase.value = base;
            }
        }

        if (num) {
            convert();
        }
    }

    // Initialize on load
    init();
})();

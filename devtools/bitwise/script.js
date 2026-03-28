(function() {
    'use strict';

    // State
    const state = {
        bits: 32,
        operation: 'and',
        inputModeA: 'dec',
        inputModeB: 'dec',
        valueA: 0,
        valueB: 0,
        result: 0
    };

    // Operation names in Chinese
    const opNames = {
        and: 'AND 与运算',
        or: 'OR 或运算',
        xor: 'XOR 异或运算',
        not: 'NOT 非运算',
        shl: '左移运算',
        shr: '右移运算'
    };

    // DOM Elements
    const elements = {
        inputA: document.getElementById('inputA'),
        inputB: document.getElementById('inputB'),
        inputBCard: document.getElementById('inputBCard'),
        bitsA: document.getElementById('bitsA'),
        bitsB: document.getElementById('bitsB'),
        bitsBRow: document.getElementById('bitsBRow'),
        bitsResult: document.getElementById('bitsResult'),
        resultDec: document.getElementById('resultDec'),
        resultHex: document.getElementById('resultHex'),
        resultBin: document.getElementById('resultBin'),
        currentOp: document.getElementById('currentOp'),
        currentBits: document.getElementById('currentBits'),
        notification: document.getElementById('notification'),
        visualSection: document.getElementById('visualSection'),
        modeTabs: document.querySelectorAll('.mode-tab'),
        opBtns: document.querySelectorAll('.op-btn'),
        inputTabs: document.querySelectorAll('.input-tab'),
        clearA: document.getElementById('clearA'),
        clearB: document.getElementById('clearB'),
        copyResult: document.getElementById('copyResult'),
        toggleVisual: document.getElementById('toggleVisual')
    };

    // Get max value for current bit mode
    function getMaxValue() {
        return Math.pow(2, state.bits) - 1;
    }

    // Parse input based on mode
    function parseInput(value, mode) {
        if (!value || value.trim() === '') return 0;

        const maxVal = getMaxValue();
        let result = 0;

        try {
            if (mode === 'hex') {
                // Remove 0x prefix if present
                const cleanValue = value.replace(/^0x/i, '');
                result = parseInt(cleanValue, 16);
            } else if (mode === 'bin') {
                // Remove spaces and 0b prefix if present
                const cleanValue = value.replace(/\s/g, '').replace(/^0b/i, '');
                result = parseInt(cleanValue, 2);
            } else {
                result = parseInt(value, 10);
            }
        } catch (e) {
            return 0;
        }

        if (isNaN(result)) return 0;

        // Handle negative numbers and overflow
        result = result & getMaxValue();
        return result;
    }

    // Format number for display
    function formatDecimal(num) {
        return num.toString(10);
    }

    function formatHex(num) {
        return '0x' + num.toString(16).toUpperCase().padStart(Math.ceil(state.bits / 4), '0');
    }

    function formatBinary(num) {
        return num.toString(2).padStart(state.bits, '0');
    }

    // Perform bitwise operation
    function calculate() {
        const a = state.valueA;
        const b = state.valueB;
        const maxVal = getMaxValue();

        switch (state.operation) {
            case 'and':
                state.result = a & b;
                break;
            case 'or':
                state.result = a | b;
                break;
            case 'xor':
                state.result = a ^ b;
                break;
            case 'not':
                state.result = (~a) & maxVal;
                break;
            case 'shl':
                const shiftAmountLeft = b % state.bits;
                state.result = ((a << shiftAmountLeft) & maxVal);
                break;
            case 'shr':
                const shiftAmountRight = b % state.bits;
                state.result = a >>> shiftAmountRight;
                break;
            default:
                state.result = 0;
        }

        state.result = state.result & maxVal;
    }

    // Update display
    function updateDisplay() {
        // Update result values
        elements.resultDec.textContent = formatDecimal(state.result);
        elements.resultHex.textContent = formatHex(state.result);
        elements.resultBin.textContent = formatBinary(state.result);

        // Update current operation display
        elements.currentOp.textContent = opNames[state.operation];
        elements.currentBits.textContent = state.bits + '位';

        // Update bit visualization
        updateBitVisualization();
    }

    // Create bit visualization
    function updateBitVisualization() {
        const maxVal = getMaxValue();

        // Get binary strings
        const binA = (state.valueA & maxVal).toString(2).padStart(state.bits, '0');
        const binB = (state.valueB & maxVal).toString(2).padStart(state.bits, '0');
        const binResult = (state.result & maxVal).toString(2).padStart(state.bits, '0');

        // Generate bit elements
        elements.bitsA.innerHTML = generateBitHTML(binA, state.operation === 'not' ? 'not' : state.operation);

        if (state.operation === 'not') {
            elements.bitsBRow.style.display = 'none';
        } else {
            elements.bitsBRow.style.display = 'flex';
            elements.bitsB.innerHTML = generateBitHTML(binB, state.operation);
        }

        elements.bitsResult.innerHTML = generateResultBitHTML(binA, binB, binResult);
    }

    // Generate bit HTML for input values
    function generateBitHTML(binStr, operation) {
        let html = '';
        const separatorInterval = state.bits === 64 ? 16 : (state.bits === 32 ? 8 : 4);

        for (let i = 0; i < binStr.length; i++) {
            if (i > 0 && i % separatorInterval === 0) {
                html += '<div class="bit-separator"></div>';
            }

            const isOn = binStr[i] === '1';
            html += `<div class="bit ${isOn ? 'on' : 'off'}">${binStr[i]}</div>`;
        }

        return html;
    }

    // Generate result bit HTML with highlighting
    function generateResultBitHTML(binA, binB, binResult) {
        let html = '';
        const separatorInterval = state.bits === 64 ? 16 : (state.bits === 32 ? 8 : 4);

        for (let i = 0; i < binResult.length; i++) {
            if (i > 0 && i % separatorInterval === 0) {
                html += '<div class="bit-separator"></div>';
            }

            const resultBit = binResult[i];
            const bitA = binA[i];
            const bitB = binB[i];

            let isHighlight = false;

            // Determine if bit should be highlighted (changed bits)
            if (state.operation === 'not') {
                isHighlight = resultBit !== bitA;
            } else if (state.operation === 'and') {
                isHighlight = resultBit === '1';
            } else if (state.operation === 'or') {
                isHighlight = resultBit === '1' && (bitA === '0' && bitB === '0' ? false : true);
            } else if (state.operation === 'xor') {
                isHighlight = resultBit === '1';
            } else if (state.operation === 'shl' || state.operation === 'shr') {
                isHighlight = resultBit === '1';
            }

            html += `<div class="bit ${resultBit === '1' ? 'on' : 'off'} ${isHighlight ? 'highlight' : ''}">${resultBit}</div>`;
        }

        return html;
    }

    // Show/hide input B based on operation
    function updateInputBVisibility() {
        if (state.operation === 'not') {
            elements.inputBCard.style.opacity = '0.4';
            elements.inputBCard.style.pointerEvents = 'none';
        } else {
            elements.inputBCard.style.opacity = '1';
            elements.inputBCard.style.pointerEvents = 'auto';
        }
    }

    // Show notification
    function showNotification(message) {
        elements.notification.textContent = message;
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2000);
    }

    // Handle input change
    function handleInputChange(input, modeKey, valueKey) {
        const mode = state[modeKey];
        state[valueKey] = parseInput(input.value, mode);
        calculate();
        updateDisplay();
    }

    // Event Listeners

    // Bit mode tabs
    elements.modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.bits = parseInt(tab.dataset.bits);
            elements.currentBits.textContent = state.bits + '位';
            calculate();
            updateDisplay();
        });
    });

    // Operation buttons
    elements.opBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.opBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.operation = btn.dataset.op;
            updateInputBVisibility();
            calculate();
            updateDisplay();
        });
    });

    // Input mode tabs for A
    document.querySelectorAll('[data-input^="a-"]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('[data-input^="a-"]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.inputModeA = tab.dataset.input.replace('a-', '');
        });
    });

    // Input mode tabs for B
    document.querySelectorAll('[data-input^="b-"]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('[data-input^="b-"]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.inputModeB = tab.dataset.input.replace('b-', '');
        });
    });

    // Input A change
    elements.inputA.addEventListener('input', () => {
        handleInputChange(elements.inputA, 'inputModeA', 'valueA');
    });

    // Input B change
    elements.inputB.addEventListener('input', () => {
        handleInputChange(elements.inputB, 'inputModeB', 'valueB');
    });

    // Clear buttons
    elements.clearA.addEventListener('click', () => {
        elements.inputA.value = '';
        state.valueA = 0;
        calculate();
        updateDisplay();
    });

    elements.clearB.addEventListener('click', () => {
        elements.inputB.value = '';
        state.valueB = 0;
        calculate();
        updateDisplay();
    });

    // Copy result
    elements.copyResult.addEventListener('click', async () => {
        const result = `十进制: ${formatDecimal(state.result)}\n十六进制: ${formatHex(state.result)}\n二进制: ${formatBinary(state.result)}`;

        try {
            await navigator.clipboard.writeText(result);
            elements.copyResult.classList.add('copied');
            showNotification('已复制到剪贴板');

            setTimeout(() => {
                elements.copyResult.classList.remove('copied');
            }, 2000);
        } catch (e) {
            showNotification('复制失败');
        }
    });

    // Toggle visual section
    elements.toggleVisual.addEventListener('click', () => {
        const isVisible = elements.visualSection.style.display !== 'none';
        elements.visualSection.style.display = isVisible ? 'none' : 'flex';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Number keys 1-4 for operations
        if (e.key === '1') elements.opBtns[0].click(); // AND
        if (e.key === '2') elements.opBtns[1].click(); // OR
        if (e.key === '3') elements.opBtns[2].click(); // XOR
        if (e.key === '4') elements.opBtns[3].click(); // NOT
        if (e.key === '5') elements.opBtns[4].click(); // SHL
        if (e.key === '6') elements.opBtns[5].click(); // SHR
    });

    // Initialize
    (function init() {
        // Set initial active state
        elements.opBtns[0].classList.add('active');
        updateInputBVisibility();
        updateDisplay();
    })();
})();

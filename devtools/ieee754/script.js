/**
 * IEEE 754 浮点数可视化工具
 * 支持单精度 (32-bit) 和双精度 (64-bit)
 */
(function() {
    'use strict';

    // ===== 配置 =====
    const CONFIG = {
        single: {
            name: '单精度',
            bits: 32,
            exponentBits: 8,
            mantissaBits: 23,
            bias: 127
        },
        double: {
            name: '双精度',
            bits: 64,
            exponentBits: 11,
            mantissaBits: 52,
            bias: 1023
        }
    };

    // ===== DOM 元素 =====
    let elements = {};

    // ===== 初始化 =====
    function init() {
        cacheElements();
        bindEvents();
        updatePrecisionInfo();
    }

    function cacheElements() {
        elements = {
            decimalInput: document.getElementById('decimalInput'),
            precisionSelect: document.getElementById('precisionSelect'),
            binaryInput: document.getElementById('binaryInput'),
            hexInput: document.getElementById('hexInput'),
            convertBtn: document.getElementById('convertBtn'),
            clearBtn: document.getElementById('clearBtn'),
            signBits: document.getElementById('signBits'),
            exponentBits: document.getElementById('exponentBits'),
            mantissaBits: document.getElementById('mantissaBits'),
            hexValue: document.getElementById('hexValue'),
            copyHex: document.getElementById('copyHex'),
            signValue: document.getElementById('signValue'),
            signDesc: document.getElementById('signDesc'),
            exponentValue: document.getElementById('exponentValue'),
            exponentDesc: document.getElementById('exponentDesc'),
            biasValue: document.getElementById('biasValue'),
            biasDesc: document.getElementById('biasDesc'),
            actualExponent: document.getElementById('actualExponent'),
            exponentFormula: document.getElementById('exponentFormula'),
            mantissaValue: document.getElementById('mantissaValue'),
            mantissaDesc: document.getElementById('mantissaDesc'),
            significantValue: document.getElementById('significantValue'),
            significantDesc: document.getElementById('significantDesc'),
            formulaExpanded: document.getElementById('formulaExpanded'),
            statusMessage: document.getElementById('statusMessage'),
            precisionInfo: document.getElementById('precisionInfo')
        };
    }

    function bindEvents() {
        elements.convertBtn.addEventListener('click', handleConvert);
        elements.clearBtn.addEventListener('click', handleClear);
        elements.precisionSelect.addEventListener('change', handlePrecisionChange);
        elements.copyHex.addEventListener('click', handleCopyHex);

        // 回车触发转换
        elements.decimalInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleConvert();
        });
        elements.binaryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleConvert();
        });
        elements.hexInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleConvert();
        });

        // 输入时自动清空其他输入框
        elements.decimalInput.addEventListener('input', function() {
            elements.binaryInput.value = '';
            elements.hexInput.value = '';
        });
        elements.binaryInput.addEventListener('input', function() {
            elements.decimalInput.value = '';
            elements.hexInput.value = '';
        });
        elements.hexInput.addEventListener('input', function() {
            elements.decimalInput.value = '';
            elements.binaryInput.value = '';
        });
    }

    // ===== 事件处理 =====
    function handleConvert() {
        const precision = elements.precisionSelect.value;
        const config = CONFIG[precision];

        try {
            let result;

            if (elements.decimalInput.value.trim()) {
                const value = parseFloat(elements.decimalInput.value);
                if (isNaN(value)) {
                    throw new Error('无效的十进制数值');
                }
                result = decimalToIEEE754(value, config);
            } else if (elements.binaryInput.value.trim()) {
                const binary = elements.binaryInput.value.trim().replace(/\s/g, '');
                if (!/^[01]+$/.test(binary)) {
                    throw new Error('二进制输入只能包含 0 和 1');
                }
                result = binaryToIEEE754(binary, config);
            } else if (elements.hexInput.value.trim()) {
                const hex = elements.hexInput.value.trim().replace(/\s/g, '');
                if (!/^[0-9a-fA-F]+$/.test(hex)) {
                    throw new Error('十六进制输入只能包含 0-9 和 A-F');
                }
                result = hexToIEEE754(hex, config);
            } else {
                setStatus('请输入数值', 'warning');
                return;
            }

            displayResult(result, config);
            setStatus('转换成功', 'success');
        } catch (error) {
            setStatus(error.message, 'error');
            clearDisplay();
        }
    }

    function handleClear() {
        elements.decimalInput.value = '';
        elements.binaryInput.value = '';
        elements.hexInput.value = '';
        clearDisplay();
        setStatus('已清空', '');
    }

    function handlePrecisionChange() {
        updatePrecisionInfo();
        // 如果已有结果，重新转换
        if (elements.hexValue.textContent !== '-') {
            handleConvert();
        }
    }

    function handleCopyHex() {
        const hex = elements.hexValue.textContent;
        if (hex && hex !== '-') {
            navigator.clipboard.writeText(hex).then(function() {
                const originalText = elements.copyHex.textContent;
                elements.copyHex.textContent = '✓';
                setTimeout(function() {
                    elements.copyHex.textContent = originalText;
                }, 1000);
            });
        }
    }

    // ===== IEEE 754 转换 =====
    function decimalToIEEE754(value, config) {
        const { bits, exponentBits, mantissaBits, bias } = config;

        // 使用 ArrayBuffer 进行精确转换
        let buffer, view, uintView;

        if (bits === 32) {
            buffer = new ArrayBuffer(4);
            view = new Float32Array(buffer);
            uintView = new Uint32Array(buffer);
        } else {
            buffer = new ArrayBuffer(8);
            view = new Float64Array(buffer);
            uintView = new BigUint64Array(buffer);
        }

        view[0] = value;

        // 获取二进制表示
        let binary;
        if (bits === 32) {
            binary = uintView[0].toString(2).padStart(32, '0');
        } else {
            binary = uintView[0].toString(2).padStart(64, '0');
        }

        return parseIEEE754Binary(binary, config, value);
    }

    function binaryToIEEE754(binary, config) {
        const { bits, exponentBits, mantissaBits } = config;

        // 补齐或截断
        if (binary.length < bits) {
            binary = binary.padStart(bits, '0');
        } else if (binary.length > bits) {
            binary = binary.slice(-bits);
        }

        // 解析并计算实际值
        const sign = parseInt(binary[0], 2);
        const expBinary = binary.slice(1, 1 + exponentBits);
        const mantBinary = binary.slice(1 + exponentBits);

        const expValue = parseInt(expBinary, 2);
        const mantValue = parseInt(mantBinary, 2);

        // 计算实际数值
        let value;
        const bias = config.bias;

        if (expValue === 0) {
            // 非规格化数或零
            if (mantValue === 0) {
                value = sign ? -0 : 0;
            } else {
                // 非规格化数
                value = (sign ? -1 : 1) * Math.pow(2, 1 - bias) * (mantValue / Math.pow(2, mantissaBits));
            }
        } else if (expValue === (Math.pow(2, exponentBits) - 1)) {
            // 无穷大或 NaN
            if (mantValue === 0) {
                value = sign ? -Infinity : Infinity;
            } else {
                value = NaN;
            }
        } else {
            // 规格化数
            value = (sign ? -1 : 1) * Math.pow(2, expValue - bias) * (1 + mantValue / Math.pow(2, mantissaBits));
        }

        return parseIEEE754Binary(binary, config, value);
    }

    function hexToIEEE754(hex, config) {
        const { bits } = config;

        // 确保十六进制长度正确
        const hexLength = bits / 4;
        hex = hex.padStart(hexLength, '0').slice(-hexLength);

        // 转换为二进制
        let binary = '';
        for (let i = 0; i < hex.length; i++) {
            binary += parseInt(hex[i], 16).toString(2).padStart(4, '0');
        }

        return binaryToIEEE754(binary, config);
    }

    function parseIEEE754Binary(binary, config, value) {
        const { exponentBits, mantissaBits, bias } = config;

        const sign = parseInt(binary[0], 2);
        const expBinary = binary.slice(1, 1 + exponentBits);
        const mantBinary = binary.slice(1 + exponentBits);

        const expValue = parseInt(expBinary, 2);
        const mantValue = parseInt(mantBinary, 2);

        // 判断数值类型
        let type = 'normal';
        let actualExp = 0;
        let significant = '1.' + mantBinary;

        if (expValue === 0) {
            if (mantValue === 0) {
                type = 'zero';
            } else {
                type = 'denormalized';
                actualExp = 1 - bias;
                significant = '0.' + mantBinary;
            }
        } else if (expValue === (Math.pow(2, exponentBits) - 1)) {
            if (mantValue === 0) {
                type = 'infinity';
            } else {
                type = 'nan';
            }
        } else {
            actualExp = expValue - bias;
        }

        return {
            binary: binary,
            sign: sign,
            expBinary: expBinary,
            expValue: expValue,
            mantBinary: mantBinary,
            mantValue: mantValue,
            bias: bias,
            actualExp: actualExp,
            significant: significant,
            type: type,
            value: value,
            hex: binaryToHex(binary)
        };
    }

    function binaryToHex(binary) {
        let hex = '';
        for (let i = 0; i < binary.length; i += 4) {
            const nibble = binary.slice(i, i + 4);
            hex += parseInt(nibble, 2).toString(16).toUpperCase();
        }
        return hex;
    }

    // ===== 显示结果 =====
    function displayResult(result, config) {
        const { exponentBits, mantissaBits } = config;

        // 二进制显示 - 带分隔符
        elements.signBits.textContent = result.sign;
        elements.exponentBits.textContent = formatBinaryWithSpaces(result.expBinary, 4);
        elements.mantissaBits.textContent = formatBinaryWithSpaces(result.mantBinary, 4);

        // 十六进制
        elements.hexValue.textContent = result.hex;

        // 符号位
        elements.signValue.textContent = result.sign;
        elements.signDesc.textContent = result.sign === 0 ? '正数 (+)' : '负数 (-)';

        // 指数
        elements.exponentValue.textContent = result.expBinary + ' (二进制)';
        elements.exponentDesc.textContent = '十进制: ' + result.expValue;

        // 偏移量
        elements.biasValue.textContent = result.bias;
        elements.biasDesc.textContent = config.name + ' 标准偏移量';

        // 实际指数
        if (result.type === 'zero') {
            elements.actualExponent.textContent = '-';
            elements.exponentFormula.textContent = '零值无指数';
        } else if (result.type === 'infinity' || result.type === 'nan') {
            elements.actualExponent.textContent = '-';
            elements.exponentFormula.textContent = '特殊值';
        } else if (result.type === 'denormalized') {
            elements.actualExponent.textContent = result.actualExp;
            elements.exponentFormula.textContent = '1 - ' + result.bias + ' (非规格化)';
        } else {
            elements.actualExponent.textContent = result.actualExp;
            elements.exponentFormula.textContent = result.expValue + ' - ' + result.bias + ' = ' + result.actualExp;
        }

        // 尾数
        elements.mantissaValue.textContent = result.mantValue;
        elements.mantissaDesc.textContent = mantissaBits + ' 位';

        // 有效数字
        if (result.type === 'normal') {
            elements.significantValue.textContent = result.significant;
            elements.significantDesc.textContent = '1 + 尾数 (隐含前导1)';
        } else if (result.type === 'denormalized') {
            elements.significantValue.textContent = result.significant;
            elements.significantDesc.textContent = '0 + 尾数 (无隐含1)';
        } else if (result.type === 'zero') {
            elements.significantValue.textContent = '0';
            elements.significantDesc.textContent = '零值';
        } else if (result.type === 'infinity') {
            elements.significantValue.textContent = '∞';
            elements.significantDesc.textContent = result.sign === 0 ? '正无穷' : '负无穷';
        } else if (result.type === 'nan') {
            elements.significantValue.textContent = 'NaN';
            elements.significantDesc.textContent = '非数值';
        }

        // 计算公式展开
        displayFormula(result);
    }

    function displayFormula(result) {
        let formula = '';

        if (result.type === 'normal') {
            formula = `(-1)^${result.sign} × 2^${result.actualExp} × ${result.significant}`;
            formula += '\n= ' + (result.sign === 0 ? '1' : '-1');
            formula += ' × ' + Math.pow(2, result.actualExp);
            formula += ' × ' + (1 + result.mantValue / Math.pow(2, result.mantBinary.length));
            formula += '\n= ' + result.value;
        } else if (result.type === 'denormalized') {
            formula = '非规格化数\n';
            formula += `(-1)^${result.sign} × 2^${result.actualExp} × 0.${result.mantBinary}`;
            formula += '\n= ' + result.value;
        } else if (result.type === 'zero') {
            formula = result.sign === 0 ? '+0 (正零)' : '-0 (负零)';
        } else if (result.type === 'infinity') {
            formula = result.sign === 0 ? '+∞ (正无穷)' : '-∞ (负无穷)';
        } else if (result.type === 'nan') {
            formula = 'NaN (非数值)';
        }

        elements.formulaExpanded.textContent = formula;
    }

    function formatBinaryWithSpaces(binary, groupSize) {
        let result = '';
        for (let i = 0; i < binary.length; i++) {
            if (i > 0 && i % groupSize === 0) {
                result += ' ';
            }
            result += binary[i];
        }
        return result;
    }

    function clearDisplay() {
        elements.signBits.textContent = '-';
        elements.exponentBits.textContent = '-';
        elements.mantissaBits.textContent = '-';
        elements.hexValue.textContent = '-';

        elements.signValue.textContent = '-';
        elements.signDesc.textContent = '-';
        elements.exponentValue.textContent = '-';
        elements.exponentDesc.textContent = '-';
        elements.biasValue.textContent = '-';
        elements.biasDesc.textContent = '-';
        elements.actualExponent.textContent = '-';
        elements.exponentFormula.textContent = '-';
        elements.mantissaValue.textContent = '-';
        elements.mantissaDesc.textContent = '-';
        elements.significantValue.textContent = '-';
        elements.significantDesc.textContent = '-';

        elements.formulaExpanded.textContent = '输入数值后显示计算过程';
    }

    function updatePrecisionInfo() {
        const precision = elements.precisionSelect.value;
        const config = CONFIG[precision];
        elements.precisionInfo.textContent = config.name + ': 1位符号 + ' + config.exponentBits + '位指数 + ' + config.mantissaBits + '位尾数';
    }

    function setStatus(message, type) {
        elements.statusMessage.textContent = message;
        elements.statusMessage.className = 'status-item ' + type;
    }

    // ===== 启动 =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

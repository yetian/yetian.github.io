// HTML Entity Encoder / Decoder - JavaScript
(function() {
    'use strict';

    // Named entity mapping
    const namedEntities = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
        '©': '&copy;',
        '®': '&reg;',
        '™': '&trade;',
        '€': '&euro;',
        '£': '&pound;',
        '¥': '&yen;',
        '¢': '&cent;',
        '§': '&sect;',
        '¶': '&para;',
        '°': '&deg;',
        '±': '&plusmn;',
        '×': '&times;',
        '÷': '&divide;',
        '¼': '&frac14;',
        '½': '&frac12;',
        '¾': '&frac34;',
        '¬': '&not;',
        '¦': '&brvbar;',
        '¨': '&uml;',
        'ª': '&ordf;',
        '«': '&laquo;',
        '¬': '&not;',
        '­': '&shy;',
        '®': '&reg;',
        '¯': '&macr;',
        '°': '&deg;',
        '²': '&sup2;',
        '³': '&sup3;',
        '´': '&acute;',
        'µ': '&micro;',
        '¹': '&sup1;',
        'º': '&ordm;',
        '»': '&raquo;',
        '¿': '&iquest;',
        'À': '&Agrave;',
        'Á': '&Aacute;',
        'Â': '&Acirc;',
        'Ã': '&Atilde;',
        'Ä': '&Auml;',
        'Å': '&Aring;',
        'Æ': '&AElig;',
        'Ç': '&Ccedil;',
        'È': '&Egrave;',
        'É': '&Eacute;',
        'Ê': '&Ecirc;',
        'Ë': '&Euml;',
        'Ì': '&Igrave;',
        'Í': '&Iacute;',
        'Î': '&Icirc;',
        'Ï': '&Iuml;',
        'Ð': '&ETH;',
        'Ñ': '&Ntilde;',
        'Ò': '&Ograve;',
        'Ó': '&Oacute;',
        'Ô': '&Ocirc;',
        'Õ': '&Otilde;',
        'Ö': '&Ouml;',
        'Ø': '&Oslash;',
        'Ù': '&Ugrave;',
        'Ú': '&Uacute;',
        'Û': '&Ucirc;',
        'Ü': '&Uuml;',
        'Ý': '&Yacute;',
        'Þ': '&THORN;',
        'ß': '&szlig;',
        'à': '&agrave;',
        'á': '&aacute;',
        'â': '&acirc;',
        'ã': '&atilde;',
        'ä': '&auml;',
        'å': '&aring;',
        'æ': '&aelig;',
        'ç': '&ccedil;',
        'è': '&egrave;',
        'é': '&eacute;',
        'ê': '&ecirc;',
        'ë': '&euml;',
        'ì': '&igrave;',
        'í': '&iacute;',
        'î': '&icirc;',
        'ï': '&iuml;',
        'ð': '&eth;',
        'ñ': '&ntilde;',
        'ò': '&ograve;',
        'ó': '&oacute;',
        'ô': '&ocirc;',
        'õ': '&otilde;',
        'ö': '&ouml;',
        'ø': '&oslash;',
        'ù': '&ugrave;',
        'ú': '&uacute;',
        'û': '&ucirc;',
        'ü': '&uuml;',
        'ý': '&yacute;',
        'þ': '&thorn;',
        'ÿ': '&yuml;',
        'Œ': '&OElig;',
        'œ': '&oelig;',
        'Š': '&Scaron;',
        'š': '&scaron;',
        'Ÿ': '&Yuml;',
        'ƒ': '&fnof;',
        '•': '&bull;',
        '…': '&hellip;',
        '′': '&prime;',
        '″': '&Prime;',
        '‾': '&oline;',
        '⁄': '&frasl;',
        '℘': '&weierp;',
        'ℑ': '&image;',
        'ℜ': '&real;',
        '™': '&trade;',
        'ℵ': '&alefsym;',
        '←': '&larr;',
        '↑': '&uarr;',
        '→': '&rarr;',
        '↓': '&darr;',
        '↔': '&harr;',
        '↵': '&crarr;',
        '⇐': '&lArr;',
        '⇑': '&uArr;',
        '⇒': '&rArr;',
        '⇓': '&dArr;',
        '⇔': '&hArr;',
        '∀': '&forall;',
        '∂': '&part;',
        '∃': '&exist;',
        '∅': '&empty;',
        '∇': '&nabla;',
        '∈': '&isin;',
        '∉': '&notin;',
        '∋': '&ni;',
        '∏': '&prod;',
        '∑': '&sum;',
        '−': '&minus;',
        '∗': '&lowast;',
        '√': '&radic;',
        '∝': '&prop;',
        '∞': '&infin;',
        '∠': '&ang;',
        '∧': '&and;',
        '∨': '&or;',
        '∩': '&cap;',
        '∪': '&cup;',
        '∫': '&int;',
        '∴': '&there4;',
        '∼': '&sim;',
        '≅': '&cong;',
        '≈': '&asymp;',
        '≠': '&ne;',
        '≡': '&equiv;',
        '≤': '&le;',
        '≥': '&ge;',
        '⊂': '&sub;',
        '⊃': '&sup;',
        '⊄': '&nsub;',
        '⊆': '&sube;',
        '⊇': '&supe;',
        '⊕': '&oplus;',
        '⊗': '&otimes;',
        '⊥': '&perp;',
        '⋅': '&sdot;',
        '⌈': '&lceil;',
        '⌉': '&rceil;',
        '⌊': '&lfloor;',
        '⌋': '&rfloor;',
        '⟨': '&lang;',
        '⟩': '&rang;',
        '◊': '&loz;',
        '♠': '&spades;',
        '♣': '&clubs;',
        '♥': '&hearts;',
        '♦': '&diams;'
    };

    // Reverse mapping for decode
    const entityToChar = {};
    for (const [char, entity] of Object.entries(namedEntities)) {
        entityToChar[entity] = char;
    }

    // DOM Elements
    const modeTabs = document.getElementById('modeTabs');
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const inputCount = document.getElementById('inputCount');
    const outputCount = document.getElementById('outputCount');
    const optionHint = document.getElementById('optionHint');
    const swapBtn = document.getElementById('swapBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // State
    let currentMode = 'encode';
    let entityType = 'named';
    let encodeSpecial = true;
    let encodeSymbols = false;
    let encodeChinese = false;

    // Initialize
    function init() {
        setupEventListeners();
        updatePlaceholder();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Mode tabs
        modeTabs.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modeTabs.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentMode = tab.dataset.mode;
                updatePlaceholder();
                convert();
            });
        });

        // Entity type radio buttons
        document.querySelectorAll('input[name="entityType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                entityType = e.target.value;
                updateHint();
                convert();
            });
        });

        // Character checkboxes
        document.querySelectorAll('input[name="chars"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.value === 'special') encodeSpecial = e.target.checked;
                if (e.target.value === 'symbols') encodeSymbols = e.target.checked;
                if (e.target.value === 'chinese') encodeChinese = e.target.checked;
                convert();
            });
        });

        // Input text - real-time conversion
        inputText.addEventListener('input', debounce(convert, 100));

        // Swap button
        swapBtn.addEventListener('click', swapContent);

        // Clear button
        clearBtn.addEventListener('click', clearAll);

        // Copy button
        copyBtn.addEventListener('click', copyResult);
    }

    // Update placeholder based on mode
    function updatePlaceholder() {
        if (currentMode === 'encode') {
            inputText.placeholder = '请输入要编码的文本...';
            outputText.placeholder = '编码结果将显示在这里...';
        } else {
            inputText.placeholder = '请输入要解码的 HTML 实体...';
            outputText.placeholder = '解码结果将显示在这里...';
        }
    }

    // Update hint based on entity type
    function updateHint() {
        if (entityType === 'named') {
            optionHint.textContent = '命名实体使用预定义名称，更易阅读';
        } else {
            optionHint.textContent = '数字实体使用 Unicode 码点，支持所有字符';
        }
    }

    // Main conversion function
    function convert() {
        const input = inputText.value;

        // Update input character count
        inputCount.textContent = `${input.length} 字符`;

        if (!input) {
            outputText.value = '';
            outputCount.textContent = '0 字符';
            return;
        }

        try {
            let result;
            if (currentMode === 'encode') {
                result = encodeHTML(input);
            } else {
                result = decodeHTML(input);
            }

            outputText.value = result;
            outputCount.textContent = `${result.length} 字符`;
        } catch (error) {
            outputText.value = `错误: ${error.message}`;
            outputCount.textContent = '错误';
        }
    }

    // Encode HTML entities
    function encodeHTML(str) {
        let result = '';

        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const code = str.charCodeAt(i);

            // Handle special characters (< > & " ')
            if (encodeSpecial && ['<', '>', '&', '"', "'"].includes(char)) {
                if (entityType === 'named' && namedEntities[char]) {
                    result += namedEntities[char];
                } else {
                    result += `&#${code};`;
                }
            }
            // Handle common symbols
            else if (encodeSymbols && namedEntities[char] && !['<', '>', '&', '"', "'"].includes(char)) {
                if (entityType === 'named') {
                    result += namedEntities[char];
                } else {
                    result += `&#${code};`;
                }
            }
            // Handle Chinese characters (Unicode > 127 and not already encoded)
            else if (encodeChinese && code > 127 && !namedEntities[char]) {
                result += `&#${code};`;
            }
            // Keep original character
            else {
                result += char;
            }
        }

        return result;
    }

    // Decode HTML entities
    function decodeHTML(str) {
        return str
            // Decode numeric entities (decimal)
            .replace(/&#(\d+);?/g, (match, code) => {
                return String.fromCharCode(parseInt(code, 10));
            })
            // Decode numeric entities (hexadecimal)
            .replace(/&#[xX]([0-9a-fA-F]+);?/g, (match, code) => {
                return String.fromCharCode(parseInt(code, 16));
            })
            // Decode named entities
            .replace(/&([a-zA-Z]+);?/g, (match, name) => {
                const entity = `&${name};`;
                if (entityToChar[entity]) {
                    return entityToChar[entity];
                }
                // Try lowercase version
                const lowerEntity = `&${name.toLowerCase()};`;
                if (entityToChar[lowerEntity]) {
                    return entityToChar[lowerEntity];
                }
                // Unknown entity, return as-is
                return match;
            });
    }

    // Swap input and output
    function swapContent() {
        if (!outputText.value) return;

        const temp = inputText.value;
        inputText.value = outputText.value;
        outputText.value = temp;

        // Toggle mode
        const newMode = currentMode === 'encode' ? 'decode' : 'encode';
        currentMode = newMode;

        modeTabs.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === newMode);
        });

        updatePlaceholder();
        convert();

        showNotification('已交换内容');
    }

    // Clear all
    function clearAll() {
        inputText.value = '';
        outputText.value = '';
        inputCount.textContent = '0 字符';
        outputCount.textContent = '0 字符';
        inputText.focus();
    }

    // Copy result
    function copyResult() {
        const text = outputText.value;
        if (!text) {
            showNotification('没有可复制的内容');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            showNotification('已复制到剪贴板');
        }).catch(() => {
            // Fallback for older browsers
            outputText.select();
            document.execCommand('copy');
            showNotification('已复制到剪贴板');
        });
    }

    // Show notification
    function showNotification(text) {
        notificationText.textContent = text;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 1500);
    }

    // Debounce helper
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize
    init();
})();

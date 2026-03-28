(function() {
    'use strict';

    // State
    const state = {
        hashes: {
            md5: '',
            sha1: '',
            sha256: '',
            sha512: ''
        }
    };

    // DOM Elements
    const elements = {
        inputText: document.getElementById('inputText'),
        inputInfo: document.getElementById('inputInfo'),
        clearBtn: document.getElementById('clearBtn'),
        dropOverlay: document.getElementById('dropOverlay'),
        hashMd5: document.getElementById('hashMd5'),
        hashSha1: document.getElementById('hashSha1'),
        hashSha256: document.getElementById('hashSha256'),
        hashSha512: document.getElementById('hashSha512'),
        copyBtns: document.querySelectorAll('.copy-btn'),
        hashItems: document.querySelectorAll('.hash-item'),
        verifyInput: document.getElementById('verifyInput'),
        verifyBtn: document.getElementById('verifyBtn'),
        verifyResult: document.getElementById('verifyResult'),
        notification: document.getElementById('notification')
    };

    // MD5 Implementation (RFC 1321)
    const MD5 = (function() {
        function safeAdd(x, y) {
            const lsw = (x & 0xFFFF) + (y & 0xFFFF);
            const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        function bitRotateLeft(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        function md5cmn(q, a, b, x, s, t) {
            return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
        }

        function md5ff(a, b, c, d, x, s, t) {
            return md5cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function md5gg(a, b, c, d, x, s, t) {
            return md5cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function md5hh(a, b, c, d, x, s, t) {
            return md5cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function md5ii(a, b, c, d, x, s, t) {
            return md5cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        function binlMD5(x, len) {
            x[len >> 5] |= 0x80 << (len % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            let a = 1732584193;
            let b = -271733879;
            let c = -1732584194;
            let d = 271733878;

            for (let i = 0; i < x.length; i += 16) {
                const olda = a;
                const oldb = b;
                const oldc = c;
                const oldd = d;

                a = md5ff(a, b, c, d, x[i], 7, -680876936);
                d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
                c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
                b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
                a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
                d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
                c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
                b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
                a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
                d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
                c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
                b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
                d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

                a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
                d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
                c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
                b = md5gg(b, c, d, a, x[i], 20, -373897302);
                a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
                d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
                c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
                a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
                d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
                c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
                b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
                a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
                d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
                c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
                b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

                a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
                d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
                c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
                b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
                d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
                c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
                b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
                d = md5hh(d, a, b, c, x[i + 0], 11, -358537222);
                c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
                b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
                a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
                d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
                b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

                a = md5ii(a, b, c, d, x[i], 6, -198630844);
                d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
                c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
                a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
                d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
                c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
                a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
                d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
                b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
                a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
                d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
                b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

                a = safeAdd(a, olda);
                b = safeAdd(b, oldb);
                c = safeAdd(c, oldc);
                d = safeAdd(d, oldd);
            }
            return [a, b, c, d];
        }

        function binl2hex(binarray) {
            const hexTab = '0123456789abcdef';
            let str = '';
            for (let i = 0; i < binarray.length * 4; i++) {
                str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                       hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
            }
            return str;
        }

        function str2binl(str) {
            const bin = [];
            for (let i = 0; i < str.length * 8; i += 8) {
                bin[i >> 5] |= (str.charCodeAt(i / 8) & 0xFF) << (i % 32);
            }
            return bin;
        }

        return function(str) {
            const utf8 = unescape(encodeURIComponent(str));
            return binl2hex(binlMD5(str2binl(utf8), utf8.length * 8));
        };
    })();

    // Web Crypto API for SHA hashes
    async function shaHash(algorithm, text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Generate all hashes
    async function generateHashes(text) {
        if (!text) {
            state.hashes = { md5: '', sha1: '', sha256: '', sha512: '' };
            elements.hashMd5.textContent = '-';
            elements.hashSha1.textContent = '-';
            elements.hashSha256.textContent = '-';
            elements.hashSha512.textContent = '-';
            return;
        }

        // MD5
        state.hashes.md5 = MD5(text);
        elements.hashMd5.textContent = state.hashes.md5;

        // SHA-1
        state.hashes.sha1 = await shaHash('SHA-1', text);
        elements.hashSha1.textContent = state.hashes.sha1;

        // SHA-256
        state.hashes.sha256 = await shaHash('SHA-256', text);
        elements.hashSha256.textContent = state.hashes.sha256;

        // SHA-512
        state.hashes.sha512 = await shaHash('SHA-512', text);
        elements.hashSha512.textContent = state.hashes.sha512;
    }

    // Update input info
    function updateInfo() {
        const text = elements.inputText.value;
        const charCount = text.length;
        const byteCount = new TextEncoder().encode(text).length;
        elements.inputInfo.textContent = `${charCount} 字符 | ${byteCount} 字节`;
    }

    // Clear all
    function clearAll() {
        elements.inputText.value = '';
        generateHashes('');
        updateInfo();
        clearVerifyResult();
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
    async function copyToClipboard(hashType) {
        const hashValue = state.hashes[hashType];
        if (!hashValue) {
            showNotification('没有内容可复制');
            return;
        }

        try {
            await navigator.clipboard.writeText(hashValue);

            // Update button state
            const btn = document.querySelector(`.copy-btn[data-hash="${hashType}"]`);
            if (btn) {
                btn.classList.add('copied');
                setTimeout(() => btn.classList.remove('copied'), 2000);
            }

            showNotification('已复制到剪贴板');
        } catch (e) {
            showNotification('复制失败');
        }
    }

    // Verify hash
    function verifyHash() {
        const expectedHash = elements.verifyInput.value.trim().toLowerCase();

        if (!expectedHash) {
            showNotification('请输入期望的哈希值');
            return;
        }

        if (!elements.inputText.value) {
            showNotification('请先输入文本');
            return;
        }

        // Clear previous results
        elements.hashItems.forEach(item => item.classList.remove('matched'));
        elements.verifyResult.innerHTML = '';
        elements.verifyResult.className = 'verify-result';

        // Check each hash
        const hashTypes = [
            { key: 'md5', name: 'MD5', length: 32 },
            { key: 'sha1', name: 'SHA-1', length: 40 },
            { key: 'sha256', name: 'SHA-256', length: 64 },
            { key: 'sha512', name: 'SHA-512', length: 128 }
        ];

        let matched = false;
        let matchedType = null;

        for (const type of hashTypes) {
            if (expectedHash.length === type.length && state.hashes[type.key] === expectedHash) {
                matched = true;
                matchedType = type;
                const hashItem = document.querySelector(`.hash-item:has(#hash${capitalize(type.key)})`);
                if (hashItem) {
                    hashItem.classList.add('matched');
                }
                break;
            }
        }

        if (matched) {
            elements.verifyResult.className = 'verify-result success';
            elements.verifyResult.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>匹配成功!</span>
                <span class="hash-type">${matchedType.name}</span>
            `;
        } else {
            elements.verifyResult.className = 'verify-result error';
            elements.verifyResult.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>哈希不匹配</span>
            `;
        }
    }

    function capitalize(str) {
        if (str === 'md5') return 'Md5';
        if (str === 'sha1') return 'Sha1';
        if (str === 'sha256') return 'Sha256';
        if (str === 'sha512') return 'Sha512';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function clearVerifyResult() {
        elements.verifyResult.innerHTML = '';
        elements.verifyResult.className = 'verify-result';
        elements.hashItems.forEach(item => item.classList.remove('matched'));
    }

    // Handle file drop
    async function handleFileDrop(file) {
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;
            elements.inputText.value = content;
            await generateHashes(content);
            updateInfo();
            clearVerifyResult();
            showNotification(`已读取文件: ${file.name}`);
        };

        reader.onerror = () => {
            showNotification('文件读取失败');
        };

        reader.readAsText(file);
    }

    // Debounce function
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

    // Debounced hash generation
    const debouncedGenerate = debounce(async (text) => {
        await generateHashes(text);
        clearVerifyResult();
    }, 150);

    // Event Listeners
    // Input text - real-time conversion
    elements.inputText.addEventListener('input', (e) => {
        updateInfo();
        debouncedGenerate(e.target.value);
    });

    // Clear button
    elements.clearBtn.addEventListener('click', clearAll);

    // Copy buttons
    elements.copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            copyToClipboard(btn.dataset.hash);
        });
    });

    // Verify button
    elements.verifyBtn.addEventListener('click', verifyHash);

    // Verify on Enter
    elements.verifyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            verifyHash();
        }
    });

    // Drag and drop
    const inputWrapper = elements.inputText.closest('.textarea-wrapper') || elements.inputText.parentElement;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        inputWrapper.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        inputWrapper.addEventListener(eventName, () => {
            elements.dropOverlay.classList.add('show');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        inputWrapper.addEventListener(eventName, () => {
            elements.dropOverlay.classList.remove('show');
        });
    });

    inputWrapper.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileDrop(files[0]);
        }
    });

    // Also handle drop on the textarea itself
    elements.inputText.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileDrop(files[0]);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to clear
        if (e.key === 'Escape') {
            clearAll();
        }
    });

    // Initial state
    updateInfo();
})();

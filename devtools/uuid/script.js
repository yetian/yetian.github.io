(function() {
    'use strict';

    // State
    const state = {
        uuids: [],
        uppercase: false,
        hyphens: true
    };

    // DOM Elements
    const elements = {
        uppercaseToggle: document.getElementById('uppercaseToggle'),
        hyphensToggle: document.getElementById('hyphensToggle'),
        batchCount: document.getElementById('batchCount'),
        generateV1: document.getElementById('generateV1'),
        generateV4: document.getElementById('generateV4'),
        copyAllBtn: document.getElementById('copyAllBtn'),
        clearBtn: document.getElementById('clearBtn'),
        resultList: document.getElementById('resultList'),
        resultCount: document.getElementById('resultCount'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage')
    };

    // UUID v1 Generator (timestamp-based)
    function generateUUIDv1() {
        // Get current timestamp (100-nanosecond intervals since Oct 15, 1582)
        const now = Date.now();
        const timestamp = now * 10000 + 0x01b21dd213814000;

        // Time components
        const timeLow = timestamp & 0xffffffff;
        const timeMid = (timestamp >>> 32) & 0xffff;
        const timeHiVersion = ((timestamp >>> 48) & 0x0fff) | 0x1000; // Version 1

        // Clock sequence (random for simplicity)
        const clockSeq = crypto.getRandomValues(new Uint16Array(1))[0];
        const clockSeqLow = clockSeq & 0xff;
        const clockSeqHiVariant = ((clockSeq >>> 8) & 0x3f) | 0x80; // Variant 1

        // Node ID (random MAC-like address)
        const nodeBytes = crypto.getRandomValues(new Uint8Array(6));
        nodeBytes[0] |= 0x01; // Set multicast bit

        // Format bytes
        const hexBytes = (n, length) => n.toString(16).padStart(length, '0');
        const hexArray = (arr) => Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');

        return [
            hexBytes(timeLow, 8),
            '-',
            hexBytes(timeMid, 4),
            '-',
            hexBytes(timeHiVersion, 4),
            '-',
            hexBytes(clockSeqHiVariant, 2),
            hexBytes(clockSeqLow, 2),
            '-',
            hexArray(nodeBytes)
        ].join('');
    }

    // UUID v4 Generator (random)
    function generateUUIDv4() {
        return crypto.randomUUID();
    }

    // Format UUID based on options
    function formatUUID(uuid) {
        let formatted = uuid;

        if (!state.hyphens) {
            formatted = formatted.replace(/-/g, '');
        }

        if (state.uppercase) {
            formatted = formatted.toUpperCase();
        }

        return formatted;
    }

    // Generate multiple UUIDs
    function generateUUIDs(version, count) {
        const generator = version === 1 ? generateUUIDv1 : generateUUIDv4;
        const newUUIDs = [];

        for (let i = 0; i < count; i++) {
            const uuid = generator();
            newUUIDs.push({
                value: uuid,
                version: version,
                formatted: formatUUID(uuid)
            });
        }

        return newUUIDs;
    }

    // Render UUID list
    function renderList() {
        if (state.uuids.length === 0) {
            elements.resultList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔗</div>
                    <p>点击上方按钮生成 UUID</p>
                </div>
            `;
            elements.resultCount.textContent = '0 条';
            return;
        }

        // Update formatted values based on current options
        state.uuids.forEach(item => {
            item.formatted = formatUUID(item.value);
        });

        elements.resultList.innerHTML = state.uuids.map((item, index) => `
            <div class="result-item" data-index="${index}">
                <span class="uuid-text">${item.formatted}</span>
                <span class="uuid-version">v${item.version}</span>
                <button class="copy-btn" data-uuid="${item.formatted}">复制</button>
            </div>
        `).join('');

        elements.resultCount.textContent = `${state.uuids.length} 条`;
    }

    // Copy to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (e) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    }

    // Show toast notification
    function showToast(message) {
        elements.toastMessage.textContent = message;
        elements.toast.classList.add('show');

        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 2000);
    }

    // Event Handlers
    function handleUppercaseToggle() {
        state.uppercase = elements.uppercaseToggle.checked;
        renderList();
    }

    function handleHyphensToggle() {
        state.hyphens = elements.hyphensToggle.checked;
        renderList();
    }

    function handleGenerateV1() {
        const count = Math.min(100, Math.max(1, parseInt(elements.batchCount.value) || 1));
        const newUUIDs = generateUUIDs(1, count);
        state.uuids = [...newUUIDs, ...state.uuids];
        renderList();
        showToast(`已生成 ${count} 个 UUID v1`);
    }

    function handleGenerateV4() {
        const count = Math.min(100, Math.max(1, parseInt(elements.batchCount.value) || 1));
        const newUUIDs = generateUUIDs(4, count);
        state.uuids = [...newUUIDs, ...state.uuids];
        renderList();
        showToast(`已生成 ${count} 个 UUID v4`);
    }

    function handleCopyAll() {
        if (state.uuids.length === 0) {
            showToast('列表为空');
            return;
        }

        const allUUIDs = state.uuids.map(item => item.formatted).join('\n');
        copyToClipboard(allUUIDs);
        showToast(`已复制 ${state.uuids.length} 个 UUID`);
    }

    function handleClear() {
        if (state.uuids.length === 0) {
            showToast('列表已为空');
            return;
        }
        state.uuids = [];
        renderList();
        showToast('列表已清空');
    }

    function handleResultClick(e) {
        if (e.target.classList.contains('copy-btn')) {
            const uuid = e.target.dataset.uuid;
            copyToClipboard(uuid);

            // Visual feedback
            e.target.textContent = '已复制';
            e.target.classList.add('copied');

            setTimeout(() => {
                e.target.textContent = '复制';
                e.target.classList.remove('copied');
            }, 1500);
        }
    }

    // Initialize
    function init() {
        // Event listeners
        elements.uppercaseToggle.addEventListener('change', handleUppercaseToggle);
        elements.hyphensToggle.addEventListener('change', handleHyphensToggle);
        elements.generateV1.addEventListener('click', handleGenerateV1);
        elements.generateV4.addEventListener('click', handleGenerateV4);
        elements.copyAllBtn.addEventListener('click', handleCopyAll);
        elements.clearBtn.addEventListener('click', handleClear);
        elements.resultList.addEventListener('click', handleResultClick);

        // Input validation for batch count
        elements.batchCount.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value > 100) this.value = 100;
            if (value < 1 && this.value !== '') this.value = 1;
        });

        // Initial render
        renderList();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

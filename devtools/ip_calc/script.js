(function() {
    'use strict';

    // Common subnet presets
    const SUBNET_PRESETS = [
        { cidr: 8, label: '/8' },
        { cidr: 12, label: '/12' },
        { cidr: 16, label: '/16' },
        { cidr: 20, label: '/20' },
        { cidr: 21, label: '/21' },
        { cidr: 22, label: '/22' },
        { cidr: 23, label: '/23' },
        { cidr: 24, label: '/24' },
        { cidr: 25, label: '/25' },
        { cidr: 26, label: '/26' },
        { cidr: 27, label: '/27' },
        { cidr: 28, label: '/28' },
        { cidr: 29, label: '/29' },
        { cidr: 30, label: '/30' },
        { cidr: 31, label: '/31' },
        { cidr: 32, label: '/32' }
    ];

    // State
    const state = {
        lastResult: null
    };

    // DOM Elements
    const elements = {
        ipAddress: document.getElementById('ipAddress'),
        subnetInput: document.getElementById('subnetInput'),
        calculateBtn: document.getElementById('calculateBtn'),
        clearBtn: document.getElementById('clearBtn'),
        presetsGrid: document.getElementById('presetsGrid'),
        // Results
        networkAddr: document.getElementById('networkAddr'),
        broadcastAddr: document.getElementById('broadcastAddr'),
        firstIP: document.getElementById('firstIP'),
        lastIP: document.getElementById('lastIP'),
        totalHosts: document.getElementById('totalHosts'),
        cidrNotation: document.getElementById('cidrNotation'),
        ipClass: document.getElementById('ipClass'),
        subnetMask: document.getElementById('subnetMask'),
        // Binary
        ipBinary: document.getElementById('ipBinary'),
        maskBinary: document.getElementById('maskBinary'),
        networkBinary: document.getElementById('networkBinary'),
        broadcastBinary: document.getElementById('broadcastBinary'),
        // Converter
        cidrInput: document.getElementById('cidrInput'),
        cidrValue: document.getElementById('cidrValue'),
        cidrToMask: document.getElementById('cidrToMask'),
        wildcardMask: document.getElementById('wildcardMask'),
        cidrHosts: document.getElementById('cidrHosts'),
        // Buttons
        copyAllBtn: document.getElementById('copyAllBtn'),
        copyBinaryBtn: document.getElementById('copyBinaryBtn'),
        notification: document.getElementById('notification')
    };

    // ==================== IP Calculation Functions ====================

    // Convert IP string to integer
    function ipToInt(ip) {
        const parts = ip.split('.').map(Number);
        if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
            throw new Error('无效的 IP 地址格式');
        }
        return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3] >>> 0;
    }

    // Convert integer to IP string
    function intToIp(int) {
        return [
            (int >>> 24) & 255,
            (int >>> 16) & 255,
            (int >>> 8) & 255,
            int & 255
        ].join('.');
    }

    // Convert integer to binary string with dots
    function intToBinary(int) {
        const binary = int.toString(2).padStart(32, '0');
        return [
            binary.slice(0, 8),
            binary.slice(8, 16),
            binary.slice(16, 24),
            binary.slice(24, 32)
        ];
    }

    // CIDR to subnet mask
    function cidrToMask(cidr) {
        if (cidr < 0 || cidr > 32) {
            throw new Error('CIDR 必须在 0-32 之间');
        }
        if (cidr === 0) return 0;
        return (0xFFFFFFFF << (32 - cidr)) >>> 0;
    }

    // Subnet mask to CIDR
    function maskToCidr(mask) {
        const maskInt = ipToInt(mask);
        // Validate it's a valid subnet mask
        const inverted = (~maskInt) >>> 0;
        if ((inverted & (inverted + 1)) !== 0) {
            throw new Error('无效的子网掩码');
        }
        return 32 - Math.log2(inverted + 1);
    }

    // Parse subnet input (can be CIDR or mask)
    function parseSubnet(input) {
        input = input.trim();
        if (input.startsWith('/')) {
            return parseInt(input.slice(1), 10);
        }
        if (/^\d+$/.test(input)) {
            return parseInt(input, 10);
        }
        // It's a subnet mask
        return maskToCidr(input);
    }

    // Get IP class
    function getIpClass(firstOctet) {
        if (firstOctet >= 1 && firstOctet <= 126) return 'A 类';
        if (firstOctet >= 128 && firstOctet <= 191) return 'B 类';
        if (firstOctet >= 192 && firstOctet <= 223) return 'C 类';
        if (firstOctet >= 224 && firstOctet <= 239) return 'D 类 (组播)';
        if (firstOctet >= 240 && firstOctet <= 255) return 'E 类 (保留)';
        return '特殊';
    }

    // Check if IP is private
    function isPrivateIP(ip) {
        const parts = ip.split('.').map(Number);
        if (parts[0] === 10) return true;
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
        if (parts[0] === 192 && parts[1] === 168) return true;
        return false;
    }

    // Calculate all subnet info
    function calculateSubnet(ip, cidr) {
        const ipInt = ipToInt(ip);
        const maskInt = cidrToMask(cidr);
        const wildcardInt = (~maskInt) >>> 0;
        const networkInt = (ipInt & maskInt) >>> 0;
        const broadcastInt = (networkInt | wildcardInt) >>> 0;

        // Total hosts (excluding network and broadcast for cidr < 31)
        let totalHosts;
        let firstUsable;
        let lastUsable;

        if (cidr === 32) {
            totalHosts = 1;
            firstUsable = ip;
            lastUsable = ip;
        } else if (cidr === 31) {
            totalHosts = 2;
            firstUsable = intToIp(networkInt);
            lastUsable = intToIp(broadcastInt);
        } else {
            totalHosts = Math.pow(2, 32 - cidr) - 2;
            firstUsable = intToIp(networkInt + 1);
            lastUsable = intToIp(broadcastInt - 1);
        }

        const parts = ip.split('.').map(Number);

        return {
            ip: ip,
            cidr: cidr,
            mask: intToIp(maskInt),
            wildcard: intToIp(wildcardInt),
            network: intToIp(networkInt),
            broadcast: intToIp(broadcastInt),
            firstUsable: firstUsable,
            lastUsable: lastUsable,
            totalHosts: totalHosts,
            ipClass: getIpClass(parts[0]),
            isPrivate: isPrivateIP(ip),
            // Binary representations
            ipBinary: intToBinary(ipInt),
            maskBinary: intToBinary(maskInt),
            networkBinary: intToBinary(networkInt),
            broadcastBinary: intToBinary(broadcastInt)
        };
    }

    // ==================== UI Functions ====================

    // Show notification
    function showNotification(message, isError = false) {
        elements.notification.textContent = message;
        elements.notification.classList.toggle('error', isError);
        elements.notification.classList.add('show');

        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 2500);
    }

    // Format binary with color classes
    function formatBinary(binaryArray, cidr) {
        return binaryArray.map((octet, i) => {
            const bitPosition = i * 8;
            let html = '';

            for (let j = 0; j < 8; j++) {
                const pos = bitPosition + j;
                const bit = octet[j];

                if (pos < cidr) {
                    html += `<span class="network-bit">${bit}</span>`;
                } else {
                    html += `<span class="host-bit">${bit}</span>`;
                }
            }

            return html;
        });
    }

    // Render binary display
    function renderBinary(elementId, formattedBinary) {
        const element = document.getElementById(elementId);
        element.innerHTML = formattedBinary.map((octet, i) =>
            `<span class="octet">${octet}</span>${i < 3 ? '<span class="dot">.</span>' : ''}`
        ).join('');
    }

    // Update calculation results
    function updateResults(result) {
        state.lastResult = result;

        // Update text values
        elements.networkAddr.textContent = result.network;
        elements.broadcastAddr.textContent = result.broadcast;
        elements.firstIP.textContent = result.firstUsable;
        elements.lastIP.textContent = result.lastUsable;
        elements.totalHosts.textContent = result.totalHosts.toLocaleString();
        elements.cidrNotation.textContent = `${result.ip}/${result.cidr}`;
        elements.ipClass.textContent = result.ipClass + (result.isPrivate ? ' (私有)' : '');
        elements.subnetMask.textContent = result.mask;

        // Update binary displays
        renderBinary('ipBinary', formatBinary(result.ipBinary, result.cidr));
        renderBinary('maskBinary', formatBinary(result.maskBinary, result.cidr));
        renderBinary('networkBinary', formatBinary(result.networkBinary, result.cidr));
        renderBinary('broadcastBinary', formatBinary(result.broadcastBinary, result.cidr));
    }

    // Clear results
    function clearResults() {
        elements.networkAddr.textContent = '-';
        elements.broadcastAddr.textContent = '-';
        elements.firstIP.textContent = '-';
        elements.lastIP.textContent = '-';
        elements.totalHosts.textContent = '-';
        elements.cidrNotation.textContent = '-';
        elements.ipClass.textContent = '-';
        elements.subnetMask.textContent = '-';

        // Reset binary displays
        ['ipBinary', 'maskBinary', 'networkBinary', 'broadcastBinary'].forEach(id => {
            const element = document.getElementById(id);
            element.innerHTML = `
                <span class="octet">00000000</span>
                <span class="dot">.</span>
                <span class="octet">00000000</span>
                <span class="dot">.</span>
                <span class="octet">00000000</span>
                <span class="dot">.</span>
                <span class="octet">00000000</span>
            `;
        });

        state.lastResult = null;
    }

    // Update CIDR converter
    function updateCidrConverter(cidr) {
        const maskInt = cidrToMask(cidr);
        const wildcardInt = (~maskInt) >>> 0;
        const hosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;

        elements.cidrValue.textContent = `/${cidr}`;
        elements.cidrToMask.textContent = intToIp(maskInt);
        elements.wildcardMask.textContent = intToIp(wildcardInt);
        elements.cidrHosts.textContent = hosts.toLocaleString();
    }

    // ==================== Event Handlers ====================

    // Calculate button click
    function handleCalculate() {
        const ip = elements.ipAddress.value.trim();
        const subnetInput = elements.subnetInput.value.trim();

        if (!ip) {
            showNotification('请输入 IP 地址', true);
            return;
        }

        try {
            let cidr;
            if (subnetInput) {
                cidr = parseSubnet(subnetInput);
            } else {
                // Default CIDR based on IP class
                const firstOctet = parseInt(ip.split('.')[0], 10);
                if (firstOctet <= 126) cidr = 8;
                else if (firstOctet <= 191) cidr = 16;
                else cidr = 24;
            }

            const result = calculateSubnet(ip, cidr);
            updateResults(result);

            // Update CIDR slider
            elements.cidrInput.value = cidr;
            updateCidrConverter(cidr);

            // Update preset buttons
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.cidr, 10) === cidr);
            });

            showNotification('计算完成');
        } catch (e) {
            showNotification(e.message, true);
        }
    }

    // Clear button click
    function handleClear() {
        elements.ipAddress.value = '';
        elements.subnetInput.value = '';
        clearResults();
        showNotification('已清空');
    }

    // Copy all results
    function handleCopyAll() {
        if (!state.lastResult) {
            showNotification('没有可复制的结果', true);
            return;
        }

        const r = state.lastResult;
        const text = `IP 地址: ${r.ip}/${r.cidr}
子网掩码: ${r.mask}
网络地址: ${r.network}
广播地址: ${r.broadcast}
首个可用 IP: ${r.firstUsable}
最后可用 IP: ${r.lastUsable}
可用主机数: ${r.totalHosts}
IP 类型: ${r.ipClass}${r.isPrivate ? ' (私有)' : ''}`;

        navigator.clipboard.writeText(text).then(() => {
            elements.copyAllBtn.classList.add('copied');
            showNotification('已复制到剪贴板');
            setTimeout(() => elements.copyAllBtn.classList.remove('copied'), 2000);
        }).catch(() => {
            showNotification('复制失败', true);
        });
    }

    // Copy binary representation
    function handleCopyBinary() {
        if (!state.lastResult) {
            showNotification('没有可复制的结果', true);
            return;
        }

        const r = state.lastResult;
        const ipBin = r.ipBinary.join('');
        const maskBin = r.maskBinary.join('');
        const netBin = r.networkBinary.join('');
        const bcBin = r.broadcastBinary.join('');

        const text = `IP 地址: ${ipBin.slice(0,8)}.${ipBin.slice(8,16)}.${ipBin.slice(16,24)}.${ipBin.slice(24,32)}
子网掩码: ${maskBin.slice(0,8)}.${maskBin.slice(8,16)}.${maskBin.slice(16,24)}.${maskBin.slice(24,32)}
网络地址: ${netBin.slice(0,8)}.${netBin.slice(8,16)}.${netBin.slice(16,24)}.${netBin.slice(24,32)}
广播地址: ${bcBin.slice(0,8)}.${bcBin.slice(8,16)}.${bcBin.slice(16,24)}.${bcBin.slice(24,32)}`;

        navigator.clipboard.writeText(text).then(() => {
            elements.copyBinaryBtn.classList.add('copied');
            showNotification('已复制二进制');
            setTimeout(() => elements.copyBinaryBtn.classList.remove('copied'), 2000);
        }).catch(() => {
            showNotification('复制失败', true);
        });
    }

    // Preset button click
    function handlePresetClick(e) {
        if (!e.target.classList.contains('preset-btn')) return;

        const cidr = parseInt(e.target.dataset.cidr, 10);

        // Update active state
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn === e.target);
        });

        // Update subnet input
        elements.subnetInput.value = `/${cidr}`;
        elements.cidrInput.value = cidr;
        updateCidrConverter(cidr);

        // Recalculate if IP is entered
        if (elements.ipAddress.value.trim()) {
            handleCalculate();
        }
    }

    // Initialize presets
    function initPresets() {
        elements.presetsGrid.innerHTML = SUBNET_PRESETS.map(preset =>
            `<button class="preset-btn" data-cidr="${preset.cidr}">${preset.label}</button>`
        ).join('');
    }

    // ==================== Event Listeners ====================

    // Calculate button
    elements.calculateBtn.addEventListener('click', handleCalculate);

    // Clear button
    elements.clearBtn.addEventListener('click', handleClear);

    // Copy buttons
    elements.copyAllBtn.addEventListener('click', handleCopyAll);
    elements.copyBinaryBtn.addEventListener('click', handleCopyBinary);

    // Preset buttons
    elements.presetsGrid.addEventListener('click', handlePresetClick);

    // CIDR slider
    elements.cidrInput.addEventListener('input', (e) => {
        const cidr = parseInt(e.target.value, 10);
        updateCidrConverter(cidr);

        // Update subnet input
        elements.subnetInput.value = `/${cidr}`;

        // Update preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.cidr, 10) === cidr);
        });

        // Recalculate if IP is entered
        if (elements.ipAddress.value.trim()) {
            handleCalculate();
        }
    });

    // Enter key to calculate
    [elements.ipAddress, elements.subnetInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleCalculate();
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to calculate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleCalculate();
        }
    });

    // ==================== Initialize ====================

    initPresets();
    updateCidrConverter(24);
})();

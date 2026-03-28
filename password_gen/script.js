// Password Generator - JavaScript
(function() {
    'use strict';

    // Configuration
    const CHAR_SETS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    const SIMILAR_CHARS = '0O1lI';
    const HISTORY_KEY = 'password_history';
    const MAX_HISTORY = 10;

    // DOM Elements
    const passwordDisplay = document.getElementById('passwordDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const generateBtn = document.getElementById('generateBtn');
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthValue = document.getElementById('lengthValue');
    const uppercase = document.getElementById('uppercase');
    const lowercase = document.getElementById('lowercase');
    const numbers = document.getElementById('numbers');
    const symbols = document.getElementById('symbols');
    const excludeSimilar = document.getElementById('excludeSimilar');
    const strengthLabel = document.getElementById('strengthLabel');
    const strengthFill = document.getElementById('strengthFill');
    const historyList = document.getElementById('historyList');
    const clearHistory = document.getElementById('clearHistory');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // State
    let currentPassword = '';
    let history = loadHistory();

    // Initialize
    function init() {
        setupEventListeners();
        renderHistory();
        generatePassword();
    }

    // Setup Event Listeners
    function setupEventListeners() {
        generateBtn.addEventListener('click', generatePassword);
        copyBtn.addEventListener('click', copyPassword);
        regenerateBtn.addEventListener('click', generatePassword);
        clearHistory.addEventListener('click', clearAllHistory);

        lengthSlider.addEventListener('input', (e) => {
            lengthValue.textContent = e.target.value;
        });

        // Regenerate on option change
        [uppercase, lowercase, numbers, symbols, excludeSimilar].forEach(el => {
            el.addEventListener('change', generatePassword);
        });
    }

    // Generate Password
    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        let charset = '';

        if (uppercase.checked) charset += CHAR_SETS.uppercase;
        if (lowercase.checked) charset += CHAR_SETS.lowercase;
        if (numbers.checked) charset += CHAR_SETS.numbers;
        if (symbols.checked) charset += CHAR_SETS.symbols;

        // Check if any charset is selected
        if (!charset) {
            charset = CHAR_SETS.lowercase;
            lowercase.checked = true;
        }

        // Exclude similar characters
        if (excludeSimilar.checked) {
            charset = charset.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('');
        }

        // Generate password
        let password = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }

        currentPassword = password;
        displayPassword(password);
        updateStrength(password);
        addToHistory(password);
    }

    // Display Password
    function displayPassword(password) {
        passwordDisplay.textContent = password;
    }

    // Update Strength Indicator
    function updateStrength(password) {
        let score = 0;

        // Length score
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        if (password.length >= 24) score += 1;

        // Character type score
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 2;

        // Determine strength level
        let level, labelClass, fillClass;

        if (score <= 2) {
            level = '弱';
            labelClass = 'weak';
            fillClass = 'weak';
        } else if (score <= 4) {
            level = '一般';
            labelClass = 'fair';
            fillClass = 'fair';
        } else if (score <= 6) {
            level = '良好';
            labelClass = 'good';
            fillClass = 'good';
        } else {
            level = '强';
            labelClass = 'strong';
            fillClass = 'strong';
        }

        strengthLabel.textContent = level;
        strengthLabel.className = 'strength-label ' + labelClass;
        strengthFill.className = 'strength-fill ' + fillClass;
    }

    // Copy Password
    function copyPassword() {
        if (!currentPassword) return;

        navigator.clipboard.writeText(currentPassword).then(() => {
            showNotification('已复制到剪贴板');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = currentPassword;
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

    // History Management
    function loadHistory() {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch {
            console.warn('Could not save history to localStorage');
        }
    }

    function addToHistory(password) {
        // Avoid duplicates
        if (history.some(h => h.password === password)) {
            return;
        }

        const entry = {
            password: password,
            time: new Date().toISOString()
        };

        history.unshift(entry);

        // Keep only last MAX_HISTORY
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        if (history.length === 0) {
            historyList.innerHTML = '<p class="history-empty">暂无历史记录</p>';
            return;
        }

        historyList.innerHTML = history.map((entry, index) => {
            const time = formatTime(entry.time);
            return `
                <div class="history-item" data-index="${index}">
                    <span class="history-password">${escapeHtml(entry.password)}</span>
                    <span class="history-time">${time}</span>
                </div>
            `;
        }).join('');

        // Add click handlers
        historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                const password = history[index].password;
                currentPassword = password;
                displayPassword(password);
                updateStrength(password);
                copyPassword();
            });
        });
    }

    function formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        // Less than 1 minute
        if (diff < 60000) {
            return '刚刚';
        }

        // Less than 1 hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins}分钟前`;
        }

        // Less than 1 day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}小时前`;
        }

        // Show date
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function clearAllHistory() {
        history = [];
        saveHistory();
        renderHistory();
        showNotification('历史记录已清空');
    }

    // Utility Functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize on load
    init();
})();

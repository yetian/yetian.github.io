// Text Sort Tool - JavaScript
(function() {
    'use strict';

    // State
    let state = {
        sortMethod: 'az',
        removeDuplicates: false,
        trimWhitespace: true,
        ignoreCase: false
    };

    // DOM Elements
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const sortBtn = document.getElementById('sortBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const removeDuplicates = document.getElementById('removeDuplicates');
    const trimWhitespace = document.getElementById('trimWhitespace');
    const ignoreCase = document.getElementById('ignoreCase');
    const lineCount = document.getElementById('lineCount');
    const charCount = document.getElementById('charCount');
    const notification = document.getElementById('notification');
    const sortButtons = document.querySelectorAll('.sort-btn');

    // Natural sort comparison
    function naturalCompare(a, b) {
        const ax = [];
        const bx = [];

        a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
            ax.push([$1 ? parseInt($1, 10) : $2, $1 ? 0 : 1]);
        });
        b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
            bx.push([$1 ? parseInt($1, 10) : $2, $1 ? 0 : 1]);
        });

        while (ax.length && bx.length) {
            const an = ax.shift();
            const bn = bx.shift();
            const diff = an[0] - bn[0];
            if (diff !== 0) {
                return diff;
            }
        }

        return ax.length - bx.length;
    }

    // Numeric sort comparison
    function numericCompare(a, b) {
        const numA = parseFloat(a);
        const numB = parseFloat(b);

        // Handle non-numeric values
        if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;

        return numA - numB;
    }

    // Sort lines based on selected method
    function sortLines(lines) {
        const { sortMethod, ignoreCase: ignoreCaseFlag } = state;

        // Prepare lines for comparison
        const preparedLines = lines.map(line => ({
            original: line,
            compare: ignoreCaseFlag ? line.toLowerCase() : line
        }));

        let sorted;

        switch (sortMethod) {
            case 'az':
                sorted = preparedLines.sort((a, b) => a.compare.localeCompare(b.compare, 'zh-CN'));
                break;

            case 'za':
                sorted = preparedLines.sort((a, b) => b.compare.localeCompare(a.compare, 'zh-CN'));
                break;

            case 'natural':
                sorted = preparedLines.sort((a, b) => naturalCompare(a.compare, b.compare));
                break;

            case 'numeric':
                sorted = preparedLines.sort((a, b) => numericCompare(a.compare, b.compare));
                break;

            case 'reverse':
                sorted = preparedLines.reverse();
                break;

            default:
                sorted = preparedLines;
        }

        return sorted.map(item => item.original);
    }

    // Process and sort text
    function processText() {
        let lines = inputText.value.split('\n');

        // Trim whitespace
        if (state.trimWhitespace) {
            lines = lines.map(line => line.trim());
        }

        // Remove empty lines (optional - keeps empty lines if trim is off and input has them)
        // Filter out completely empty lines for better output
        lines = lines.filter(line => line.length > 0 || !state.trimWhitespace);

        // Remove duplicates
        if (state.removeDuplicates) {
            const seen = new Set();
            lines = lines.filter(line => {
                const key = state.ignoreCase ? line.toLowerCase() : line;
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });
        }

        // Filter out empty strings before sorting
        lines = lines.filter(line => line.length > 0);

        // Sort
        const sortedLines = sortLines(lines);

        // Output
        outputText.value = sortedLines.join('\n');
        updateStats();
    }

    // Update statistics
    function updateStats() {
        const lines = outputText.value.split('\n').filter(line => line.trim().length > 0);
        lineCount.textContent = `${lines.length} 行`;
        charCount.textContent = `${outputText.value.length} 字符`;
    }

    // Clear all
    function clearAll() {
        inputText.value = '';
        outputText.value = '';
        updateStats();
        inputText.focus();
    }

    // Copy to clipboard
    async function copyToClipboard() {
        if (!outputText.value) return;

        try {
            await navigator.clipboard.writeText(outputText.value);
            showNotification();
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                已复制
            `;

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    复制结果
                `;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    // Show notification
    function showNotification() {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Set sort method
    function setSortMethod(method) {
        state.sortMethod = method;
        sortButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === method);
        });
    }

    // Event Listeners
    sortBtn.addEventListener('click', processText);
    clearBtn.addEventListener('click', clearAll);
    copyBtn.addEventListener('click', copyToClipboard);

    // Sort button clicks
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setSortMethod(btn.dataset.sort);
            if (inputText.value.trim()) {
                processText();
            }
        });
    });

    // Toggle changes
    removeDuplicates.addEventListener('change', () => {
        state.removeDuplicates = removeDuplicates.checked;
    });

    trimWhitespace.addEventListener('change', () => {
        state.trimWhitespace = trimWhitespace.checked;
    });

    ignoreCase.addEventListener('change', () => {
        state.ignoreCase = ignoreCase.checked;
    });

    // Keyboard shortcut - Ctrl/Cmd + Enter to sort
    inputText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            processText();
        }
    });

    // Update stats when input changes
    inputText.addEventListener('input', () => {
        if (!outputText.value && inputText.value.trim()) {
            const lines = inputText.value.split('\n').filter(line => line.trim().length > 0);
            lineCount.textContent = `${lines.length} 行`;
            charCount.textContent = `${inputText.value.length} 字符`;
        }
    });

    // Initialize
    updateStats();
})();

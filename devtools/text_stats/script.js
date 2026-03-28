// Text Statistics Tool - JavaScript
(function() {
    'use strict';

    // DOM Elements
    const textInput = document.getElementById('textInput');
    const clearBtn = document.getElementById('clearBtn');
    const charCountEl = document.getElementById('charCount');
    const charNoSpaceEl = document.getElementById('charNoSpace');
    const wordCountEl = document.getElementById('wordCount');
    const lineCountEl = document.getElementById('lineCount');
    const sentenceCountEl = document.getElementById('sentenceCount');
    const paragraphCountEl = document.getElementById('paragraphCount');
    const readingTimeZhEl = document.getElementById('readingTimeZh');
    const readingTimeEnEl = document.getElementById('readingTimeEn');
    const frequencyListEl = document.getElementById('frequencyList');

    // Constants
    const WORDS_PER_MINUTE_ZH = 300; // Chinese characters per minute
    const WORDS_PER_MINUTE_EN = 200; // English words per minute

    // Calculate statistics
    function calculateStats(text) {
        if (!text) {
            return {
                charCount: 0,
                charNoSpace: 0,
                wordCount: 0,
                lineCount: 0,
                sentenceCount: 0,
                paragraphCount: 0,
                readingTimeZh: 0,
                readingTimeEn: 0,
                frequency: []
            };
        }

        // Character count
        const charCount = text.length;

        // Character count without spaces
        const charNoSpace = text.replace(/\s/g, '').length;

        // Word count (handle both Chinese and English)
        // Chinese characters + English words
        const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
        const englishWords = text.match(/[a-zA-Z]+/g) || [];
        const wordCount = chineseChars.length + englishWords.length;

        // Line count
        const lines = text.split('\n');
        const lineCount = lines.filter(line => line.trim().length > 0).length || (text.trim().length > 0 ? 1 : 0);

        // Sentence count
        // Match sentences ending with . ! ? 。！？ and also Chinese sentences
        const sentences = text.match(/[^.!?\u3002\uff01\uff1f]*[.!?\u3002\uff01\uff1f]+/g) || [];
        const sentenceCount = sentences.length || (text.trim().length > 0 ? 1 : 0);

        // Paragraph count
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const paragraphCount = paragraphs.length || (text.trim().length > 0 ? 1 : 0);

        // Reading time
        // Chinese: characters / 300
        // English: words / 200
        const readingTimeZh = Math.ceil(chineseChars.length / WORDS_PER_MINUTE_ZH);
        const readingTimeEn = Math.ceil(englishWords.length / WORDS_PER_MINUTE_EN);
        const totalReadingTimeZh = Math.max(1, readingTimeZh + Math.ceil(englishWords.length / WORDS_PER_MINUTE_EN * 0.5));
        const totalReadingTimeEn = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE_EN));

        // Character frequency (excluding spaces and common punctuation)
        const frequency = getCharacterFrequency(text);

        return {
            charCount,
            charNoSpace,
            wordCount,
            lineCount,
            sentenceCount,
            paragraphCount,
            readingTimeZh: totalReadingTimeZh,
            readingTimeEn: totalReadingTimeEn,
            frequency
        };
    }

    // Get character frequency
    function getCharacterFrequency(text) {
        const freq = {};
        const chars = text.replace(/[\s\n\r\t]/g, '');

        for (const char of chars) {
            freq[char] = (freq[char] || 0) + 1;
        }

        // Sort by frequency and get top 10
        const sorted = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        return sorted;
    }

    // Update display
    function updateDisplay(stats) {
        // Animate number changes
        animateValue(charCountEl, stats.charCount);
        animateValue(charNoSpaceEl, stats.charNoSpace);
        animateValue(wordCountEl, stats.wordCount);
        animateValue(lineCountEl, stats.lineCount);
        animateValue(sentenceCountEl, stats.sentenceCount);
        animateValue(paragraphCountEl, stats.paragraphCount);

        // Reading time
        readingTimeZhEl.textContent = formatReadingTime(stats.readingTimeZh);
        readingTimeEnEl.textContent = formatReadingTime(stats.readingTimeEn);

        // Frequency list
        updateFrequencyList(stats.frequency);
    }

    // Animate value change
    function animateValue(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue === newValue) return;

        const duration = 200;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(currentValue + (newValue - currentValue) * easeProgress);

            element.textContent = formatNumber(value);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Format number with locale
    function formatNumber(num) {
        return num.toLocaleString('zh-CN');
    }

    // Format reading time
    function formatReadingTime(minutes) {
        if (minutes < 1) {
            return '< 1 分钟';
        } else if (minutes === 1) {
            return '1 分钟';
        } else if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (mins === 0) {
                return `${hours} 小时`;
            }
            return `${hours} 小时 ${mins} 分钟`;
        }
        return `${minutes} 分钟`;
    }

    // Update frequency list
    function updateFrequencyList(frequency) {
        if (frequency.length === 0) {
            frequencyListEl.innerHTML = '<div class="empty-state">输入文本后显示频率统计</div>';
            return;
        }

        const maxCount = frequency[0][1];

        const html = frequency.map((item, index) => {
            const char = item[0];
            const count = item[1];
            const percentage = (count / maxCount) * 100;
            const displayChar = char === ' ' ? '空格' : char;

            return `
                <div class="frequency-item">
                    <span class="frequency-rank ${index < 3 ? 'top-3' : ''}">${index + 1}</span>
                    <span class="frequency-char">${escapeHtml(displayChar)}</span>
                    <div class="frequency-bar-container">
                        <div class="frequency-bar" style="width: ${percentage}%"></div>
                    </div>
                    <span class="frequency-count">${formatNumber(count)} 次</span>
                </div>
            `;
        }).join('');

        frequencyListEl.innerHTML = html;
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    // Handle input
    const handleInput = debounce(function() {
        const text = textInput.value;
        const stats = calculateStats(text);
        updateDisplay(stats);
    }, 100);

    // Clear input
    function clearInput() {
        textInput.value = '';
        const stats = calculateStats('');
        updateDisplay(stats);
        textInput.focus();
    }

    // Event listeners
    textInput.addEventListener('input', handleInput);
    clearBtn.addEventListener('click', clearInput);

    // Initialize with empty stats
    const initialStats = calculateStats('');
    updateDisplay(initialStats);
})();

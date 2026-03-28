// NLP Toolbox - JavaScript
(function() {
    'use strict';

    // Positive and negative word lists (simplified)
    const POSITIVE_WORDS = new Set([
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
        'love', 'happy', 'joy', 'beautiful', 'best', 'perfect', 'brilliant', 'superb',
        'outstanding', 'remarkable', 'positive', 'pleasant', 'delightful', 'terrific',
        '好', '棒', '优秀', '出色', '精彩', '美丽', '喜欢', '爱', '开心', '快乐',
        '满意', '成功', '完美', '赞', '厉害', '优秀', '极好', '惊喜', '幸福', '美好'
    ]);

    const NEGATIVE_WORDS = new Set([
        'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'hate', 'sad',
        'angry', 'disappointed', 'frustrating', 'annoying', 'boring', 'ugly',
        'negative', 'unpleasant', 'dreadful', 'pathetic', 'mediocre', 'inferior',
        '坏', '差', '糟糕', '可怕', '讨厌', '恨', '悲伤', '难过', '生气',
        '失望', '烦', '无聊', '丑', '失败', '垃圾', '烂', '恶心', '痛苦', '糟糕'
    ]);

    // Stop words (common words to ignore in frequency analysis)
    const STOP_WORDS = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
        'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
        'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where',
        'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
        'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
        'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
        '的', '是', '在', '了', '和', '与', '或', '有', '我', '你', '他', '她',
        '我们', '你们', '他们', '这', '那', '这些', '那些', '什么', '怎么',
        '如何', '为什么', '哪', '谁', '哪里', '就', '也', '都', '而', '及',
        '着', '过', '被', '把', '给', '让', '向', '从', '对', '为', '以'
    ]);

    // DOM Elements
    const toolTabs = document.getElementById('toolTabs');
    const panels = document.querySelectorAll('.panel');

    // Readability elements
    const readabilityInput = document.getElementById('readabilityInput');
    const readabilityScore = document.getElementById('readabilityScore');
    const readabilityDesc = document.getElementById('readabilityDesc');
    const gradeLevel = document.getElementById('gradeLevel');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const sentenceCount = document.getElementById('sentenceCount');
    const syllableCount = document.getElementById('syllableCount');

    // Similarity elements
    const simTextA = document.getElementById('simTextA');
    const simTextB = document.getElementById('simTextB');
    const levDistance = document.getElementById('levDistance');
    const levBar = document.getElementById('levBar');
    const jaccardScore = document.getElementById('jaccardScore');
    const jaccardBar = document.getElementById('jaccardBar');
    const cosineScore = document.getElementById('cosineScore');
    const cosineBar = document.getElementById('cosineBar');

    // Sentiment elements
    const sentimentInput = document.getElementById('sentimentInput');
    const sentimentNeedle = document.getElementById('sentimentNeedle');
    const sentimentScoreValue = document.getElementById('sentimentScoreValue');
    const sentimentClass = document.getElementById('sentimentClass');
    const positiveWords = document.getElementById('positiveWords');
    const negativeWordsEl = document.getElementById('negativeWords');

    // Stats elements
    const statsInput = document.getElementById('statsInput');
    const statsChars = document.getElementById('statsChars');
    const statsWords = document.getElementById('statsWords');
    const statsSentences = document.getElementById('statsSentences');
    const statsParagraphs = document.getElementById('statsParagraphs');
    const wordFreqList = document.getElementById('wordFreqList');
    const avgSentenceLen = document.getElementById('avgSentenceLen');
    const uniqueRatio = document.getElementById('uniqueRatio');
    const lexicalDensity = document.getElementById('lexicalDensity');
    const longestSentence = document.getElementById('longestSentence');

    // Initialize
    function init() {
        setupTabs();
        setupReadability();
        setupSimilarity();
        setupSentiment();
        setupStats();
    }

    // Setup Tabs
    function setupTabs() {
        toolTabs.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tool = tab.dataset.tool;

                toolTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                panels.forEach(p => p.classList.remove('active'));
                document.getElementById(`${tool}Panel`).classList.add('active');
            });
        });
    }

    // Readability Analysis
    function setupReadability() {
        readabilityInput.addEventListener('input', debounce(analyzeReadability, 300));
    }

    function analyzeReadability() {
        const text = readabilityInput.value.trim();

        if (!text) {
            readabilityScore.textContent = '-';
            gradeLevel.textContent = '-';
            charCount.textContent = '0';
            wordCount.textContent = '0';
            sentenceCount.textContent = '0';
            syllableCount.textContent = '0';
            return;
        }

        const stats = getTextStats(text);
        charCount.textContent = stats.chars;
        wordCount.textContent = stats.words;
        sentenceCount.textContent = stats.sentences;
        syllableCount.textContent = stats.syllables;

        if (stats.words === 0 || stats.sentences === 0) {
            readabilityScore.textContent = '-';
            gradeLevel.textContent = '-';
            return;
        }

        // Flesch Reading Ease
        const flesch = 206.835 - 1.015 * (stats.words / stats.sentences) - 84.6 * (stats.syllables / stats.words);
        const clampedFlesch = Math.max(0, Math.min(100, flesch));
        readabilityScore.textContent = clampedFlesch.toFixed(1);
        readabilityDesc.textContent = getFleschDescription(clampedFlesch);

        // Flesch-Kincaid Grade Level
        const grade = 0.39 * (stats.words / stats.sentences) + 11.8 * (stats.syllables / stats.words) - 15.59;
        gradeLevel.textContent = Math.max(0, grade).toFixed(1);
    }

    function getFleschDescription(score) {
        if (score >= 90) return 'Very Easy (5th grade)';
        if (score >= 80) return 'Easy (6th grade)';
        if (score >= 70) return 'Fairly Easy (7th grade)';
        if (score >= 60) return 'Standard (8th-9th grade)';
        if (score >= 50) return 'Fairly Difficult (10th-12th)';
        if (score >= 30) return 'Difficult (College)';
        return 'Very Difficult (Graduate)';
    }

    // Similarity Analysis
    function setupSimilarity() {
        simTextA.addEventListener('input', debounce(analyzeSimilarity, 300));
        simTextB.addEventListener('input', debounce(analyzeSimilarity, 300));
    }

    function analyzeSimilarity() {
        const textA = simTextA.value.trim();
        const textB = simTextB.value.trim();

        if (!textA || !textB) {
            levDistance.textContent = '-';
            levBar.style.width = '0%';
            jaccardScore.textContent = '-';
            jaccardBar.style.width = '0%';
            cosineScore.textContent = '-';
            cosineBar.style.width = '0%';
            return;
        }

        // Levenshtein Distance
        const lev = levenshteinDistance(textA, textB);
        const maxLen = Math.max(textA.length, textB.length);
        const levSim = maxLen > 0 ? ((maxLen - lev) / maxLen) * 100 : 0;
        levDistance.textContent = lev;
        levBar.style.width = `${levSim}%`;

        // Jaccard Similarity
        const jaccard = jaccardSimilarity(textA, textB);
        jaccardScore.textContent = (jaccard * 100).toFixed(1) + '%';
        jaccardBar.style.width = `${jaccard * 100}%`;

        // Cosine Similarity
        const cosine = cosineSimilarity(textA, textB);
        cosineScore.textContent = (cosine * 100).toFixed(1) + '%';
        cosineBar.style.width = `${cosine * 100}%`;
    }

    function levenshteinDistance(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    function jaccardSimilarity(a, b) {
        const wordsA = new Set(tokenize(a));
        const wordsB = new Set(tokenize(b));

        const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
        const union = new Set([...wordsA, ...wordsB]);

        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    function cosineSimilarity(a, b) {
        const wordsA = tokenize(a);
        const wordsB = tokenize(b);

        const freqA = getWordFrequency(wordsA);
        const freqB = getWordFrequency(wordsB);

        const allWords = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        allWords.forEach(word => {
            const a = freqA[word] || 0;
            const b = freqB[word] || 0;
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        });

        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }

    // Sentiment Analysis
    function setupSentiment() {
        sentimentInput.addEventListener('input', debounce(analyzeSentiment, 300));
    }

    function analyzeSentiment() {
        const text = sentimentInput.value.trim();

        if (!text) {
            sentimentNeedle.style.left = '50%';
            sentimentScoreValue.textContent = '0.00';
            sentimentClass.textContent = '中性';
            sentimentClass.className = 'sentiment-class';
            positiveWords.textContent = '0';
            negativeWordsEl.textContent = '0';
            return;
        }

        const words = tokenize(text);
        let positive = 0;
        let negative = 0;

        words.forEach(word => {
            const w = word.toLowerCase();
            if (POSITIVE_WORDS.has(w)) positive++;
            if (NEGATIVE_WORDS.has(w)) negative++;
        });

        const total = positive + negative;
        const score = total === 0 ? 0 : (positive - negative) / total;

        // Update UI
        sentimentScoreValue.textContent = score.toFixed(2);
        positiveWords.textContent = positive;
        negativeWordsEl.textContent = negative;

        // Position needle (score ranges from -1 to 1, map to 0-100%)
        const position = ((score + 1) / 2) * 100;
        sentimentNeedle.style.left = `${position}%`;

        // Set sentiment class
        if (score > 0.1) {
            sentimentClass.textContent = '正面';
            sentimentClass.className = 'sentiment-class positive';
        } else if (score < -0.1) {
            sentimentClass.textContent = '负面';
            sentimentClass.className = 'sentiment-class negative';
        } else {
            sentimentClass.textContent = '中性';
            sentimentClass.className = 'sentiment-class';
        }
    }

    // Stats Analysis
    function setupStats() {
        statsInput.addEventListener('input', debounce(analyzeStats, 300));
    }

    function analyzeStats() {
        const text = statsInput.value.trim();

        if (!text) {
            statsChars.textContent = '0';
            statsWords.textContent = '0';
            statsSentences.textContent = '0';
            statsParagraphs.textContent = '0';
            wordFreqList.innerHTML = '<p class="empty-hint">输入文本后显示词频统计</p>';
            avgSentenceLen.textContent = '-';
            uniqueRatio.textContent = '-';
            lexicalDensity.textContent = '-';
            longestSentence.textContent = '-';
            return;
        }

        const stats = getTextStats(text);
        statsChars.textContent = stats.chars;
        statsWords.textContent = stats.words;
        statsSentences.textContent = stats.sentences;
        statsParagraphs.textContent = stats.paragraphs;

        // Word frequency
        const words = tokenize(text);
        const freq = getWordFrequency(words.filter(w => !STOP_WORDS.has(w.toLowerCase())));
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);

        if (sorted.length === 0) {
            wordFreqList.innerHTML = '<p class="empty-hint">无有效词汇</p>';
        } else {
            wordFreqList.innerHTML = sorted.map(([word, count]) => `
                <span class="word-freq-item">
                    ${word} <span class="count">${count}</span>
                </span>
            `).join('');
        }

        // Advanced stats
        avgSentenceLen.textContent = stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : '0';

        const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
        uniqueRatio.textContent = stats.words > 0 ? ((uniqueWords / stats.words) * 100).toFixed(1) + '%' : '0%';

        lexicalDensity.textContent = stats.words > 0 ? ((uniqueWords / stats.words) * 100).toFixed(1) + '%' : '0%';

        const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim());
        const longest = sentences.reduce((max, s) => s.length > max.length ? s : max, '');
        longestSentence.textContent = longest.length > 20 ? longest.substring(0, 20) + '...' : longest || '-';
    }

    // Utility Functions
    function getTextStats(text) {
        const chars = text.length;
        const words = tokenize(text).length;
        const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim()).length;
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
        const syllables = countSyllables(text);

        return { chars, words, sentences, paragraphs, syllables };
    }

    function tokenize(text) {
        // Handle both English and Chinese
        const english = text.match(/[a-zA-Z]+/g) || [];
        const chinese = text.match(/[\u4e00-\u9fa5]/g) || [];

        return [...english, ...chinese];
    }

    function countSyllables(text) {
        // Simple syllable counting for English
        const words = text.match(/[a-zA-Z]+/g) || [];
        let count = 0;

        words.forEach(word => {
            word = word.toLowerCase();
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            word = word.replace(/^y/, '');
            const matches = word.match(/[aeiouy]{1,2}/g);
            count += matches ? matches.length : 1;
        });

        // Add Chinese characters as one syllable each
        const chinese = text.match(/[\u4e00-\u9fa5]/g) || [];
        count += chinese.length;

        return count;
    }

    function getWordFrequency(words) {
        const freq = {};
        words.forEach(word => {
            const w = word.toLowerCase();
            freq[w] = (freq[w] || 0) + 1;
        });
        return freq;
    }

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

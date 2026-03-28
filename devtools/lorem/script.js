// 假文生成器 Lorem Ipsum Generator
(function() {
    'use strict';

    // ===== 拉丁文词库 =====
    const latinWords = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
        'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
        'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
        'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
        'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
        'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
        'nesciunt', 'neque', 'porro', 'quisquam', 'dolorem', 'adipisci', 'numquam',
        'eius', 'modi', 'tempora', 'magnam', 'quaerat', 'dolorem', 'impedit', 'quo',
        'minus', 'quod', 'maxime', 'placeat', 'facere', 'possimus', 'omnis', 'assumenda',
        'repellendus', 'temporibus', 'quibusdam', 'officiis', 'debitis', 'rerum',
        'necessitatibus', 'saepe', 'eveniet', 'voluptates', 'repudiandae', 'recusandae'
    ];

    // ===== 中文假文词库 =====
    const chineseWords = [
        '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
        '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
        '自己', '这', '那', '什么', '他', '她', '它', '们', '这个', '那个', '时候',
        '可以', '来', '能', '还', '后', '过', '但', '下', '想', '这种', '这样', '知道',
        '因为', '所以', '如果', '虽然', '然而', '或者', '并且', '而且', '然后', '于是',
        '更', '已', '最', '把', '被', '比', '让', '从', '与', '及', '等', '等等',
        '之', '其', '者', '所', '以', '为', '于', '而', '或', '亦', '且', '则', '虽',
        '发展', '通过', '可以', '可能', '应该', '需要', '进行', '实现', '使用', '提供',
        '支持', '包括', '相关', '以下', '以上', '其他', '所有', '一些', '这些', '那些',
        '已经', '正在', '将会', '能够', '应该', '可能', '必须', '应该', '一定', '非常',
        '今天', '明天', '昨天', '现在', '未来', '过去', '开始', '结束', '继续', '完成',
        '工作', '生活', '学习', '问题', '方法', '内容', '信息', '系统', '服务', '管理',
        '功能', '数据', '用户', '界面', '设计', '开发', '测试', '项目', '产品', '技术',
        '应用', '过程', '结果', '效果', '目标', '计划', '活动', '操作', '方式', '方面',
        '情况', '状态', '环境', '条件', '基础', '标准', '要求', '规定', '原则', '特点'
    ];

    // ===== 状态 =====
    const state = {
        type: 'paragraphs',
        quantity: 3,
        language: 'latin',
        startWithLorem: true
    };

    // ===== DOM 元素 =====
    const typeBtns = document.querySelectorAll('.type-btn');
    const langBtns = document.querySelectorAll('.lang-btn');
    const quantityInput = document.getElementById('quantity');
    const startWithLoremCheckbox = document.getElementById('startWithLorem');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const output = document.getElementById('output');
    const statusText = document.getElementById('statusText');

    // ===== 工具函数 =====
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomWord(wordList) {
        return wordList[getRandomInt(0, wordList.length - 1)];
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ===== 生成函数 =====
    function generateWords(count) {
        const words = state.language === 'chinese' ? chineseWords : latinWords;
        const result = [];

        for (let i = 0; i < count; i++) {
            result.push(getRandomWord(words));
        }

        return result.join(state.language === 'chinese' ? '' : ' ');
    }

    function generateSentence(minWords = 8, maxWords = 15) {
        const words = state.language === 'chinese' ? chineseWords : latinWords;
        const wordCount = getRandomInt(minWords, maxWords);
        const sentence = [];

        for (let i = 0; i < wordCount; i++) {
            sentence.push(getRandomWord(words));
        }

        if (state.language === 'chinese') {
            return sentence.join('') + '。';
        } else {
            return capitalizeFirst(sentence.join(' ')) + '.';
        }
    }

    function generateParagraph(minSentences = 4, maxSentences = 7) {
        const sentenceCount = getRandomInt(minSentences, maxSentences);
        const sentences = [];

        for (let i = 0; i < sentenceCount; i++) {
            sentences.push(generateSentence());
        }

        return sentences.join(' ');
    }

    function generateLorem() {
        let result = [];

        switch (state.type) {
            case 'words':
                if (state.startWithLorem && state.language === 'latin') {
                    result.push('Lorem ipsum');
                    const remaining = state.quantity - 2;
                    if (remaining > 0) {
                        result.push(generateWords(remaining));
                    }
                } else {
                    result.push(generateWords(state.quantity));
                }
                break;

            case 'sentences':
                for (let i = 0; i < state.quantity; i++) {
                    if (i === 0 && state.startWithLorem && state.language === 'latin') {
                        result.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
                    } else {
                        result.push(generateSentence());
                    }
                }
                break;

            case 'paragraphs':
                for (let i = 0; i < state.quantity; i++) {
                    if (i === 0 && state.startWithLorem && state.language === 'latin') {
                        result.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
                    } else if (i === 0 && state.startWithLorem && state.language === 'chinese') {
                        result.push('这是一个测试文本段落，用于展示假文生成器的功能。在设计和开发过程中，我们经常需要使用占位文本来测试布局效果。这段文字看起来像是真实的中文内容，但实际上只是随机生成的假文，没有任何实际意义。通过这种方式，我们可以专注于视觉设计，而不被实际内容所干扰。');
                    } else {
                        result.push(generateParagraph());
                    }
                }
                break;
        }

        return result.join(state.type === 'words' ? ' ' : '\n\n');
    }

    // ===== 事件处理 =====
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.type = btn.dataset.type;
        });
    });

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.language = btn.dataset.lang;

            // 切换语言时更新开关文本
            const toggleText = document.querySelector('.toggle-text');
            if (state.language === 'chinese') {
                toggleText.textContent = '以固定开头';
            } else {
                toggleText.textContent = '以 "Lorem ipsum" 开头';
            }
        });
    });

    document.getElementById('decreaseQty').addEventListener('click', () => {
        const current = parseInt(quantityInput.value) || 1;
        if (current > 1) {
            quantityInput.value = current - 1;
            state.quantity = current - 1;
        }
    });

    document.getElementById('increaseQty').addEventListener('click', () => {
        const current = parseInt(quantityInput.value) || 1;
        if (current < 100) {
            quantityInput.value = current + 1;
            state.quantity = current + 1;
        }
    });

    quantityInput.addEventListener('change', () => {
        let value = parseInt(quantityInput.value) || 1;
        value = Math.max(1, Math.min(100, value));
        quantityInput.value = value;
        state.quantity = value;
    });

    startWithLoremCheckbox.addEventListener('change', () => {
        state.startWithLorem = startWithLoremCheckbox.checked;
    });

    generateBtn.addEventListener('click', () => {
        const content = generateLorem();
        output.value = content;

        const wordCount = content.split(/\s+/).filter(w => w).length;
        const charCount = content.length;

        if (state.language === 'chinese') {
            statusText.textContent = `已生成 ${state.quantity} ${getTypeLabel()}，共 ${charCount} 字`;
        } else {
            statusText.textContent = `已生成 ${state.quantity} ${getTypeLabel()}，共 ${wordCount} 词，${charCount} 字符`;
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!output.value) {
            statusText.textContent = '没有可复制的内容';
            return;
        }

        navigator.clipboard.writeText(output.value).then(() => {
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<span>✓</span> 已复制';
            statusText.textContent = '内容已复制到剪贴板';

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = '<span>📋</span> 复制';
            }, 2000);
        }).catch(() => {
            statusText.textContent = '复制失败，请手动选择复制';
        });
    });

    function getTypeLabel() {
        const labels = {
            paragraphs: '段',
            sentences: '句',
            words: state.language === 'chinese' ? '个词' : '词'
        };
        return labels[state.type];
    }

    // ===== 键盘快捷键 =====
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'g') {
                e.preventDefault();
                generateBtn.click();
            } else if (e.key === 'c' && document.activeElement !== output) {
                e.preventDefault();
                copyBtn.click();
            }
        }
    });

    // ===== 初始化 =====
    console.log('Lorem Ipsum Generator initialized');
})();

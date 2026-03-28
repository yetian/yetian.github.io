// 正则表达式测试器
(function() {
    'use strict';

    // ===== 常用正则表达式库 =====
    const patterns = [
        { name: '邮箱', icon: '📧', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
        { name: '手机号', icon: '📱', pattern: '1[3-9]\\d{9}', flags: 'g' },
        { name: 'URL', icon: '🔗', pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*', flags: 'g' },
        { name: 'IP地址', icon: '🌐', pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', flags: 'g' },
        { name: '日期', icon: '📅', pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}', flags: 'g' },
        { name: '时间', icon: '⏰', pattern: '\\d{1,2}:\\d{2}(:\\d{2})?', flags: 'g' },
        { name: '身份证', icon: '🪪', pattern: '[1-9]\\d{5}(?:18|19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', flags: 'g' },
        { name: '数字', icon: '🔢', pattern: '-?\\d+(\\.\\d+)?', flags: 'g' },
        { name: '中文字符', icon: '汉字', pattern: '[\\u4e00-\\u9fa5]+', flags: 'g' },
        { name: '空白字符', icon: '␣', pattern: '\\s+', flags: 'g' },
        { name: '单词', icon: '📝', pattern: '\\b\\w+\\b', flags: 'g' },
        { name: '十六进制', icon: '#️⃣', pattern: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})', flags: 'g' }
    ];

    // ===== DOM 元素 =====
    const regexInput = document.getElementById('regexInput');
    const testString = document.getElementById('testString');
    const highlightedText = document.getElementById('highlightedText');
    const groupsWrapper = document.getElementById('groupsWrapper');
    const errorMessage = document.getElementById('errorMessage');
    const matchCount = document.getElementById('matchCount');
    const charCount = document.getElementById('charCount');
    const patternsGrid = document.getElementById('patternsGrid');
    const clearBtn = document.getElementById('clearBtn');
    const copyRegexBtn = document.getElementById('copyRegexBtn');

    const flagG = document.getElementById('flagG');
    const flagI = document.getElementById('flagI');
    const flagM = document.getElementById('flagM');
    const flagS = document.getElementById('flagS');
    const flagU = document.getElementById('flagU');

    // ===== 状态 =====
    let currentMatches = [];
    let currentRegex = null;

    // ===== 初始化常用正则按钮 =====
    function initPatternsLibrary() {
        patternsGrid.innerHTML = patterns.map((p, i) => `
            <button class="pattern-btn" data-index="${i}">
                <span class="pattern-icon">${p.icon}</span>
                <span>${p.name}</span>
                <span class="pattern-code">${p.pattern.substring(0, 20)}${p.pattern.length > 20 ? '...' : ''}</span>
            </button>
        `).join('');

        // 绑定点击事件
        patternsGrid.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const pattern = patterns[index];
                regexInput.value = pattern.pattern;

                // 设置标志位
                flagG.checked = pattern.flags.includes('g');
                flagI.checked = pattern.flags.includes('i');
                flagM.checked = pattern.flags.includes('m');
                flagS.checked = pattern.flags.includes('s');
                flagU.checked = pattern.flags.includes('u');

                runRegex();
                regexInput.focus();
            });
        });
    }

    // ===== 获取当前标志位 =====
    function getFlags() {
        let flags = '';
        if (flagG.checked) flags += 'g';
        if (flagI.checked) flags += 'i';
        if (flagM.checked) flags += 'm';
        if (flagS.checked) flags += 's';
        if (flagU.checked) flags += 'u';
        return flags;
    }

    // ===== 执行正则匹配 =====
    function runRegex() {
        const pattern = regexInput.value;
        const text = testString.value;
        const flags = getFlags();

        // 清空状态
        errorMessage.textContent = '';
        currentMatches = [];
        currentRegex = null;

        if (!pattern) {
            highlightedText.innerHTML = '<span class="placeholder-text">输入正则表达式和测试文本后，匹配结果将在此显示...</span>';
            groupsWrapper.innerHTML = '<span class="placeholder-text">无捕获组</span>';
            matchCount.textContent = '0 个匹配';
            return;
        }

        if (!text) {
            highlightedText.innerHTML = '<span class="placeholder-text">请输入测试文本...</span>';
            groupsWrapper.innerHTML = '<span class="placeholder-text">无捕获组</span>';
            matchCount.textContent = '0 个匹配';
            return;
        }

        // 尝试创建正则表达式
        try {
            currentRegex = new RegExp(pattern, flags);
        } catch (e) {
            errorMessage.textContent = '正则表达式错误: ' + e.message;
            highlightedText.innerHTML = '<span class="placeholder-text">正则表达式无效</span>';
            groupsWrapper.innerHTML = '<span class="placeholder-text">无捕获组</span>';
            matchCount.textContent = '0 个匹配';
            return;
        }

        // 执行匹配
        const matches = [];
        let match;

        if (flags.includes('g')) {
            while ((match = currentRegex.exec(text)) !== null) {
                matches.push({
                    value: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {},
                    fullMatch: match
                });

                // 防止零宽匹配导致无限循环
                if (match[0].length === 0) {
                    currentRegex.lastIndex++;
                }
            }
        } else {
            match = currentRegex.exec(text);
            if (match) {
                matches.push({
                    value: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {},
                    fullMatch: match
                });
            }
        }

        currentMatches = matches;
        matchCount.textContent = `${matches.length} 个匹配`;

        // 高亮显示
        highlightMatches(text, matches);

        // 显示捕获组
        displayGroups(matches);
    }

    // ===== 高亮匹配结果 =====
    function highlightMatches(text, matches) {
        if (matches.length === 0) {
            highlightedText.textContent = text || '没有匹配结果';
            return;
        }

        // 构建高亮HTML
        let result = '';
        let lastIndex = 0;

        matches.forEach((match, i) => {
            // 添加匹配前的文本
            if (match.index > lastIndex) {
                result += escapeHtml(text.substring(lastIndex, match.index));
            }

            // 添加高亮的匹配文本
            const colorClass = `match-${i % 5}`;
            result += `<span class="match ${colorClass}" data-index="${i}">${escapeHtml(match.value)}</span>`;

            lastIndex = match.index + match.value.length;
        });

        // 添加最后的文本
        if (lastIndex < text.length) {
            result += escapeHtml(text.substring(lastIndex));
        }

        highlightedText.innerHTML = result;

        // 绑定点击事件，显示对应捕获组
        highlightedText.querySelectorAll('.match').forEach(el => {
            el.addEventListener('click', () => {
                const index = parseInt(el.dataset.index);
                showMatchGroups(index);
            });
        });
    }

    // ===== 显示捕获组 =====
    function displayGroups(matches) {
        if (matches.length === 0) {
            groupsWrapper.innerHTML = '<span class="placeholder-text">无捕获组</span>';
            return;
        }

        // 显示第一个匹配的捕获组
        showMatchGroups(0);
    }

    // ===== 显示指定匹配的捕获组 =====
    function showMatchGroups(matchIndex) {
        const match = currentMatches[matchIndex];
        if (!match) return;

        let html = `<div class="group-item">
            <span class="group-number">${matchIndex + 1}</span>
            <span class="group-value">${escapeHtml(match.value) || '<span class="group-empty">空</span>'}</span>
        </div>`;

        // 添加捕获组
        match.groups.forEach((group, i) => {
            const groupName = match.fullMatch.groups ?
                Object.keys(match.fullGroups || {}).find(k => match.fullMatch.groups[k] === group) : null;

            html += `<div class="group-item">
                <span class="group-number">${i + 1}</span>
                ${groupName ? `<span class="group-name">${escapeHtml(groupName)}</span>` : ''}
                <span class="group-value">${escapeHtml(group) || '<span class="group-empty">未匹配</span>'}</span>
            </div>`;
        });

        // 添加命名捕获组
        if (match.namedGroups && Object.keys(match.namedGroups).length > 0) {
            Object.entries(match.namedGroups).forEach(([name, value]) => {
                html += `<div class="group-item">
                    <span class="group-number">?</span>
                    <span class="group-name">${escapeHtml(name)}</span>
                    <span class="group-value">${escapeHtml(value) || '<span class="group-empty">未匹配</span>'}</span>
                </div>`;
            });
        }

        if (match.groups.length === 0 && Object.keys(match.namedGroups).length === 0) {
            html += '<span class="placeholder-text">此匹配无捕获组</span>';
        }

        groupsWrapper.innerHTML = html;
    }

    // ===== HTML 转义 =====
    function escapeHtml(text) {
        if (text === undefined || text === null) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== 更新字符计数 =====
    function updateCharCount() {
        const text = testString.value;
        charCount.textContent = `${text.length} 字符`;
    }

    // ===== 清空所有 =====
    function clearAll() {
        regexInput.value = '';
        testString.value = '';
        errorMessage.textContent = '';
        currentMatches = [];
        currentRegex = null;
        highlightedText.innerHTML = '<span class="placeholder-text">输入正则表达式和测试文本后，匹配结果将在此显示...</span>';
        groupsWrapper.innerHTML = '<span class="placeholder-text">无捕获组</span>';
        matchCount.textContent = '0 个匹配';
        updateCharCount();
        regexInput.focus();
    }

    // ===== 复制正则表达式 =====
    function copyRegex() {
        const pattern = regexInput.value;
        if (!pattern) {
            showToast('请先输入正则表达式');
            return;
        }

        const flags = getFlags();
        const regexString = `/${pattern}/${flags}`;

        navigator.clipboard.writeText(regexString).then(() => {
            showToast('已复制: ' + regexString);
        }).catch(() => {
            showToast('复制失败');
        });
    }

    // ===== 显示提示 =====
    function showToast(message) {
        // 移除现有的toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 显示动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // ===== 防抖函数 =====
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // ===== 事件绑定 =====
    const debouncedRunRegex = debounce(runRegex, 150);

    regexInput.addEventListener('input', debouncedRunRegex);
    testString.addEventListener('input', () => {
        debouncedRunRegex();
        updateCharCount();
    });

    // 标志位变化时重新运行
    [flagG, flagI, flagM, flagS, flagU].forEach(flag => {
        flag.addEventListener('change', runRegex);
    });

    // 按钮事件
    clearBtn.addEventListener('click', clearAll);
    copyRegexBtn.addEventListener('click', copyRegex);

    // ===== 初始化 =====
    initPatternsLibrary();

    // 从 localStorage 恢复上次的输入
    const savedRegex = localStorage.getItem('regex-pattern');
    const savedText = localStorage.getItem('regex-text');
    const savedFlags = localStorage.getItem('regex-flags');

    if (savedRegex) regexInput.value = savedRegex;
    if (savedText) testString.value = savedText;
    if (savedFlags) {
        flagG.checked = savedFlags.includes('g');
        flagI.checked = savedFlags.includes('i');
        flagM.checked = savedFlags.includes('m');
        flagS.checked = savedFlags.includes('s');
        flagU.checked = savedFlags.includes('u');
    }

    // 自动保存
    const saveToStorage = debounce(() => {
        localStorage.setItem('regex-pattern', regexInput.value);
        localStorage.setItem('regex-text', testString.value);
        localStorage.setItem('regex-flags', getFlags());
    }, 300);

    regexInput.addEventListener('input', saveToStorage);
    testString.addEventListener('input', saveToStorage);
    [flagG, flagI, flagM, flagS, flagU].forEach(flag => {
        flag.addEventListener('change', saveToStorage);
    });

    // 如果有保存的内容，运行一次
    if (savedRegex || savedText) {
        runRegex();
        updateCharCount();
    }

    // 快捷键支持
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter 运行正则
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runRegex();
        }
        // Ctrl/Cmd + Shift + C 复制正则
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            copyRegex();
        }
    });
})();

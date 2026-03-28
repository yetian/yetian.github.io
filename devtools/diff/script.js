(function() {
    'use strict';

    // DOM 元素
    const textArea1 = document.getElementById('textArea1');
    const textArea2 = document.getElementById('textArea2');
    const lineNumbers1 = document.getElementById('lineNumbers1');
    const lineNumbers2 = document.getElementById('lineNumbers2');
    const stats1 = document.getElementById('stats1');
    const stats2 = document.getElementById('stats2');
    const compareBtn = document.getElementById('compareBtn');
    const clearBtn = document.getElementById('clearBtn');
    const swapBtn = document.getElementById('swapBtn');
    const pasteBtn1 = document.getElementById('pasteBtn1');
    const pasteBtn2 = document.getElementById('pasteBtn2');
    const ignoreCase = document.getElementById('ignoreCase');
    const ignoreWhitespace = document.getElementById('ignoreWhitespace');
    const resultPanel = document.getElementById('resultPanel');
    const diffView = document.getElementById('diffView');
    const closeResultBtn = document.getElementById('closeResultBtn');
    const addedCount = document.getElementById('addedCount');
    const removedCount = document.getElementById('removedCount');
    const unchangedCount = document.getElementById('unchangedCount');
    const statusMsg = document.getElementById('statusMsg');

    // 状态
    let diffResult = [];

    // 初始化
    function init() {
        updateLineNumbers(textArea1, lineNumbers1);
        updateLineNumbers(textArea2, lineNumbers2);
        updateStats(textArea1, stats1);
        updateStats(textArea2, stats2);
        bindEvents();
    }

    // 绑定事件
    function bindEvents() {
        // 输入事件
        textArea1.addEventListener('input', () => {
            updateLineNumbers(textArea1, lineNumbers1);
            updateStats(textArea1, stats1);
        });

        textArea2.addEventListener('input', () => {
            updateLineNumbers(textArea2, lineNumbers2);
            updateStats(textArea2, stats2);
        });

        // 滚动同步
        textArea1.addEventListener('scroll', () => {
            lineNumbers1.scrollTop = textArea1.scrollTop;
        });

        textArea2.addEventListener('scroll', () => {
            lineNumbers2.scrollTop = textArea2.scrollTop;
        });

        // 按钮事件
        compareBtn.addEventListener('click', performDiff);
        clearBtn.addEventListener('click', clearAll);
        swapBtn.addEventListener('click', swapTexts);
        closeResultBtn.addEventListener('click', () => {
            resultPanel.classList.remove('show');
        });

        // 粘贴按钮
        pasteBtn1.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                textArea1.value = text;
                updateLineNumbers(textArea1, lineNumbers1);
                updateStats(textArea1, stats1);
                showStatus('已粘贴');
            } catch (e) {
                showStatus('无法访问剪贴板', true);
            }
        });

        pasteBtn2.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                textArea2.value = text;
                updateLineNumbers(textArea2, lineNumbers2);
                updateStats(textArea2, stats2);
                showStatus('已粘贴');
            } catch (e) {
                showStatus('无法访问剪贴板', true);
            }
        });

        // 快捷键
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                performDiff();
            }
        });
    }

    // 更新行号
    function updateLineNumbers(textarea, lineNumbers) {
        const lines = textarea.value.split('\n');
        const count = Math.max(lines.length, 1);
        let html = '';
        for (let i = 1; i <= count; i++) {
            html += `<span>${i}</span>`;
        }
        lineNumbers.innerHTML = html;
    }

    // 更新统计
    function updateStats(textarea, statsEl) {
        const text = textarea.value;
        const chars = text.length;
        const lines = text ? text.split('\n').length : 0;
        statsEl.textContent = `${chars} 字符 | ${lines} 行`;
    }

    // 执行对比
    function performDiff() {
        let text1 = textArea1.value;
        let text2 = textArea2.value;

        if (!text1 && !text2) {
            showStatus('请输入要对比的文本', true);
            return;
        }

        // 预处理选项
        const caseSensitive = !ignoreCase.checked;
        const considerWhitespace = !ignoreWhitespace.checked;

        // 分割成行
        let lines1 = text1.split('\n');
        let lines2 = text2.split('\n');

        // 预处理用于比较的行
        let processedLines1 = lines1.map(line => preprocessLine(line, caseSensitive, considerWhitespace));
        let processedLines2 = lines2.map(line => preprocessLine(line, caseSensitive, considerWhitespace));

        // 计算 LCS
        const lcs = computeLCS(processedLines1, processedLines2);

        // 生成 diff 结果
        diffResult = generateDiff(lines1, lines2, processedLines1, processedLines2, lcs);

        // 渲染结果
        renderDiff();
        resultPanel.classList.add('show');

        // 统计
        let added = 0, removed = 0, unchanged = 0;
        diffResult.forEach(item => {
            if (item.type === 'added') added++;
            else if (item.type === 'removed') removed++;
            else unchanged++;
        });

        addedCount.textContent = added;
        removedCount.textContent = removed;
        unchangedCount.textContent = unchanged;

        showStatus(`对比完成: ${added} 行新增, ${removed} 行删除, ${unchanged} 行未变`);
    }

    // 预处理行
    function preprocessLine(line, caseSensitive, considerWhitespace) {
        let result = line;
        if (!caseSensitive) {
            result = result.toLowerCase();
        }
        if (!considerWhitespace) {
            result = result.replace(/\s+/g, ' ').trim();
        }
        return result;
    }

    // 计算 LCS (最长公共子序列)
    function computeLCS(arr1, arr2) {
        const m = arr1.length;
        const n = arr2.length;

        // 创建 DP 表
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        // 填充 DP 表
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (arr1[i - 1] === arr2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        // 回溯找出 LCS
        const lcs = [];
        let i = m, j = n;
        while (i > 0 && j > 0) {
            if (arr1[i - 1] === arr2[j - 1]) {
                lcs.unshift({ i: i - 1, j: j - 1 });
                i--;
                j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        return lcs;
    }

    // 生成 diff 结果
    function generateDiff(lines1, lines2, processed1, processed2, lcs) {
        const result = [];

        // 创建 LCS 索引集合
        const lcsSet1 = new Set(lcs.map(item => item.i));
        const lcsSet2 = new Set(lcs.map(item => item.j));

        let i = 0, j = 0;
        let lcsIndex = 0;

        while (i < lines1.length || j < lines2.length) {
            if (lcsIndex < lcs.length) {
                const lcsItem = lcs[lcsIndex];

                // 处理删除的行 (在 text1 中有但不在 LCS 中)
                while (i < lcsItem.i) {
                    result.push({
                        type: 'removed',
                        lineNum1: i + 1,
                        lineNum2: null,
                        content: lines1[i]
                    });
                    i++;
                }

                // 处理新增的行 (在 text2 中有但不在 LCS 中)
                while (j < lcsItem.j) {
                    result.push({
                        type: 'added',
                        lineNum1: null,
                        lineNum2: j + 1,
                        content: lines2[j]
                    });
                    j++;
                }

                // LCS 行 (未变)
                result.push({
                    type: 'unchanged',
                    lineNum1: i + 1,
                    lineNum2: j + 1,
                    content: lines1[i]
                });
                i++;
                j++;
                lcsIndex++;
            } else {
                // 处理剩余的行
                while (i < lines1.length) {
                    result.push({
                        type: 'removed',
                        lineNum1: i + 1,
                        lineNum2: null,
                        content: lines1[i]
                    });
                    i++;
                }
                while (j < lines2.length) {
                    result.push({
                        type: 'added',
                        lineNum1: null,
                        lineNum2: j + 1,
                        content: lines2[j]
                    });
                    j++;
                }
            }
        }

        return result;
    }

    // 渲染 diff 结果
    function renderDiff() {
        let html = '';

        diffResult.forEach(item => {
            let sign = '';
            let lineNumHtml = '';

            if (item.type === 'added') {
                sign = '+';
                lineNumHtml = `<span class="diff-line-num">${item.lineNum2 || ''}</span>`;
            } else if (item.type === 'removed') {
                sign = '-';
                lineNumHtml = `<span class="diff-line-num">${item.lineNum1 || ''}</span>`;
            } else {
                sign = ' ';
                lineNumHtml = `<span class="diff-line-num">${item.lineNum1 || ''}</span>`;
            }

            const escapedContent = escapeHtml(item.content);
            html += `
                <div class="diff-line ${item.type}">
                    ${lineNumHtml}
                    <span class="diff-line-sign">${sign}</span>
                    <span class="diff-line-content">${escapedContent}</span>
                </div>
            `;
        });

        diffView.innerHTML = html;
    }

    // HTML 转义
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 清空
    function clearAll() {
        textArea1.value = '';
        textArea2.value = '';
        updateLineNumbers(textArea1, lineNumbers1);
        updateLineNumbers(textArea2, lineNumbers2);
        updateStats(textArea1, stats1);
        updateStats(textArea2, stats2);
        resultPanel.classList.remove('show');
        showStatus('已清空');
    }

    // 交换文本
    function swapTexts() {
        const temp = textArea1.value;
        textArea1.value = textArea2.value;
        textArea2.value = temp;
        updateLineNumbers(textArea1, lineNumbers1);
        updateLineNumbers(textArea2, lineNumbers2);
        updateStats(textArea1, stats1);
        updateStats(textArea2, stats2);
        showStatus('已交换');
    }

    // 显示状态
    function showStatus(message, isError = false) {
        statusMsg.textContent = message;
        statusMsg.className = 'status-item' + (isError ? ' error' : ' success');
    }

    // 启动
    init();
})();

// 算术题目生成器 - 核心逻辑
(function() {
    'use strict';

    // DOM 元素
    const generateBtn = document.getElementById('generateBtn');
    const printBtn = document.getElementById('printBtn');
    const previewArea = document.getElementById('previewArea');
    const printArea = document.getElementById('printArea');

    // 表单元素
    const minNumInput = document.getElementById('minNum');
    const maxNumInput = document.getElementById('maxNum');
    const questionCountInput = document.getElementById('questionCount');
    const perRowInput = document.getElementById('perRow');
    const calcTypeRadios = document.querySelectorAll('input[name="calcType"]');

    // 计算方法复选框
    const opAdd = document.getElementById('opAdd');
    const opSub = document.getElementById('opSub');
    const opMul = document.getElementById('opMul');

    // 当前生成的题目
    let currentQuestions = [];

    // 生成随机整数
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 获取启用的运算
    function getEnabledOperations() {
        const ops = [];
        if (opAdd.checked) ops.push('+');
        if (opSub.checked) ops.push('-');
        if (opMul.checked) ops.push('×');
        return ops;
    }

    // 生成单个题目
    function generateQuestion(min, max, ops) {
        // 随机选择运算
        const op = ops[randomInt(0, ops.length - 1)];

        let a, b, answer;
        let displayA, displayB;

        switch (op) {
            case '+':
                // 加法：确保结果在范围内
                a = randomInt(min, max);
                b = randomInt(min, max);
                answer = a + b;
                displayA = a;
                displayB = b;
                break;

            case '-':
                // 减法：确保结果非负
                a = randomInt(min, max);
                b = randomInt(min, a); // 保证 a >= b
                answer = a - b;
                displayA = a;
                displayB = b;
                break;

            case '×':
                // 乘法：限制范围避免数字太大
                const mulMax = Math.min(max, 12); // 乘法口诀范围
                a = randomInt(Math.max(min, 1), mulMax);
                b = randomInt(Math.max(min, 1), mulMax);
                answer = a * b;
                displayA = a;
                displayB = b;
                break;
        }

        return {
            a: displayA,
            b: displayB,
            op: op,
            answer: answer
        };
    }

    // 验证设置
    function validateSettings() {
        const min = parseInt(minNumInput.value) || 1;
        const max = parseInt(maxNumInput.value) || 20;
        const count = parseInt(questionCountInput.value) || 20;
        const perRow = parseInt(perRowInput.value) || 4;
        const ops = getEnabledOperations();

        if (ops.length === 0) {
            alert('请至少选择一种计算方法！');
            return null;
        }

        if (min > max) {
            alert('起始数字不能大于终止数字！');
            return null;
        }

        if (count < 1 || count > 100) {
            alert('题目数量应在 1-100 之间！');
            return null;
        }

        if (perRow < 1 || perRow > 6) {
            alert('每行题目数应在 1-6 之间！');
            return null;
        }

        return { min, max, count, perRow, ops };
    }

    // 生成所有题目
    function generateQuestions() {
        const settings = validateSettings();
        if (!settings) return;

        const { min, max, count, ops } = settings;
        currentQuestions = [];

        for (let i = 0; i < count; i++) {
            currentQuestions.push(generateQuestion(min, max, ops));
        }

        renderPreview(settings);
    }

    // 渲染预览
    function renderPreview(settings) {
        const { perRow } = settings;
        const calcType = document.querySelector('input[name="calcType"]:checked').value;

        if (currentQuestions.length === 0) {
            previewArea.innerHTML = '<p class="placeholder">点击"生成题目"查看预览</p>';
            return;
        }

        if (calcType === 'inline') {
            // 行计算预览 - 使用表格确保每行显示固定数量
            let html = '<div class="preview-questions">';
            html += '<table class="inline-table">';

            // 分行显示，每行 perRow 个题目
            for (let i = 0; i < currentQuestions.length; i += perRow) {
                html += '<tr>';
                for (let j = 0; j < perRow && (i + j) < currentQuestions.length; j++) {
                    const q = currentQuestions[i + j];
                    html += `<td class="inline-cell">${q.a} ${q.op} ${q.b} = </td>`;
                }
                html += '</tr>';
            }

            html += '</table></div>';
            previewArea.innerHTML = html;
        } else {
            // 竖式计算预览 - 使用表格确保数字右对齐
            let html = '<div class="preview-questions vertical">';
            html += '<table class="vertical-table">';

            // 分行显示，每行 perRow 个竖式
            for (let i = 0; i < currentQuestions.length; i += perRow) {
                html += '<tr>';
                for (let j = 0; j < perRow && (i + j) < currentQuestions.length; j++) {
                    const q = currentQuestions[i + j];
                    html += renderVerticalCell(q);
                }
                html += '</tr>';
            }

            html += '</table></div>';
            previewArea.innerHTML = html;
        }
    }

    // 渲染单个竖式单元格
    function renderVerticalCell(q) {
        return `
            <td class="vertical-cell">
                <div class="vertical-problem">
                    <div class="vertical-row">
                        <span class="vertical-op"></span>
                        <span class="vertical-digit">${q.a}</span>
                    </div>
                    <div class="vertical-row">
                        <span class="vertical-op">${q.op}</span>
                        <span class="vertical-digit">${q.b}</span>
                    </div>
                    <div class="vertical-line"></div>
                    <div class="answer-space"></div>
                </div>
            </td>
        `;
    }

    // 渲染打印区域
    function renderPrintArea() {
        const settings = validateSettings();
        if (!settings || currentQuestions.length === 0) {
            alert('请先生成题目！');
            return;
        }

        const { perRow } = settings;
        const calcType = document.querySelector('input[name="calcType"]:checked').value;

        // 渲染到打印区域
        if (calcType === 'inline') {
            // 使用表格确保每行显示固定数量，与预览一致
            let html = `
                <div class="print-title">数学练习题</div>
                <div class="print-questions">
                <table class="print-inline-table">
            `;

            // 分行显示，每行 perRow 个题目
            for (let i = 0; i < currentQuestions.length; i += perRow) {
                html += '<tr>';
                for (let j = 0; j < perRow && (i + j) < currentQuestions.length; j++) {
                    const q = currentQuestions[i + j];
                    html += `<td class="print-inline-cell">${q.a} ${q.op} ${q.b} = </td>`;
                }
                html += '</tr>';
            }

            html += '</table></div>';
            printArea.innerHTML = html;
        } else {
            // 竖式计算 - 使用表格确保数字右对齐
            let html = `
                <div class="print-title">数学练习题（竖式）</div>
                <div class="print-questions vertical">
                <table class="print-vertical-table">
            `;

            // 分行显示，每行 perRow 个竖式
            for (let i = 0; i < currentQuestions.length; i += perRow) {
                html += '<tr>';
                for (let j = 0; j < perRow && (i + j) < currentQuestions.length; j++) {
                    const q = currentQuestions[i + j];
                    html += renderPrintVerticalCell(q);
                }
                html += '</tr>';
            }

            html += '</table></div>';
            printArea.innerHTML = html;
        }
    }

    // 渲染打印竖式单元格
    function renderPrintVerticalCell(q) {
        return `
            <td class="print-vertical-cell">
                <div class="print-vertical-problem">
                    <div class="vertical-row">
                        <span class="vertical-op"></span>
                        <span class="vertical-digit">${q.a}</span>
                    </div>
                    <div class="vertical-row">
                        <span class="vertical-op">${q.op}</span>
                        <span class="vertical-digit">${q.b}</span>
                    </div>
                    <div class="print-vertical-line"></div>
                    <div class="print-answer-space"></div>
                </div>
            </td>
        `;
    }

    // 打印
    function print() {
        renderPrintArea();
        if (printArea.innerHTML) {
            window.print();
        }
    }

    // 事件绑定
    generateBtn.addEventListener('click', generateQuestions);
    printBtn.addEventListener('click', print);

    // 页面加载完成后聚焦到第一个输入框
    minNumInput.focus();

})();

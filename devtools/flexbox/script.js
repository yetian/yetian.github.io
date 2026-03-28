(function() {
    'use strict';

    // 状态管理
    const state = {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        gap: 0,
        boxCount: 5,
        highlightedBox: null
    };

    // DOM 元素
    const elements = {
        flexContainer: null,
        generatedCode: null,
        gapSlider: null,
        gapValue: null,
        boxCountSlider: null,
        boxCountValue: null,
        copyCodeBtn: null,
        resetBtn: null,
        copyStatus: null
    };

    // 初始化
    function init() {
        // 获取 DOM 元素
        elements.flexContainer = document.getElementById('flexContainer');
        elements.generatedCode = document.getElementById('generatedCode');
        elements.gapSlider = document.getElementById('gapSlider');
        elements.gapValue = document.getElementById('gapValue');
        elements.boxCountSlider = document.getElementById('boxCountSlider');
        elements.boxCountValue = document.getElementById('boxCountValue');
        elements.copyCodeBtn = document.getElementById('copyCodeBtn');
        elements.resetBtn = document.getElementById('resetBtn');
        elements.copyStatus = document.getElementById('copyStatus');

        // 绑定事件
        bindEvents();

        // 初始化预览
        renderBoxes();
        updatePreview();
    }

    // 绑定事件
    function bindEvents() {
        // 属性按钮点击
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const prop = this.dataset.prop;
                const value = this.dataset.value;

                // 更新状态
                state[prop] = value;

                // 更新按钮状态
                this.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // 更新预览
                updatePreview();
            });
        });

        // gap 滑块
        elements.gapSlider.addEventListener('input', function() {
            state.gap = parseInt(this.value);
            elements.gapValue.textContent = state.gap;
            updatePreview();
        });

        // 盒子数量滑块
        elements.boxCountSlider.addEventListener('input', function() {
            state.boxCount = parseInt(this.value);
            elements.boxCountValue.textContent = state.boxCount;
            renderBoxes();
            updatePreview();
        });

        // 复制代码
        elements.copyCodeBtn.addEventListener('click', copyCode);

        // 重置按钮
        elements.resetBtn.addEventListener('click', resetAll);
    }

    // 渲染盒子
    function renderBoxes() {
        elements.flexContainer.innerHTML = '';

        for (let i = 1; i <= state.boxCount; i++) {
            const box = document.createElement('div');
            box.className = 'flex-box';
            box.textContent = i;
            box.addEventListener('click', function() {
                toggleHighlight(this);
            });
            elements.flexContainer.appendChild(box);
        }
    }

    // 切换高亮
    function toggleHighlight(box) {
        // 移除之前的高亮
        document.querySelectorAll('.flex-box.highlighted').forEach(b => {
            b.classList.remove('highlighted');
        });

        // 如果点击的不是之前高亮的盒子，则高亮它
        if (state.highlightedBox !== box) {
            box.classList.add('highlighted');
            state.highlightedBox = box;
        } else {
            state.highlightedBox = null;
        }
    }

    // 更新预览
    function updatePreview() {
        // 应用样式到容器
        elements.flexContainer.style.display = 'flex';
        elements.flexContainer.style.flexDirection = state.flexDirection;
        elements.flexContainer.style.justifyContent = state.justifyContent;
        elements.flexContainer.style.alignItems = state.alignItems;
        elements.flexContainer.style.flexWrap = state.flexWrap;
        elements.flexContainer.style.gap = state.gap + 'px';

        // 更新生成的代码
        updateCodeDisplay();
    }

    // 更新代码显示
    function updateCodeDisplay() {
        const code = generateCSSCode();
        elements.generatedCode.innerHTML = code;
    }

    // 生成 CSS 代码
    function generateCSSCode() {
        const lines = [
            '<span class="prop">display</span>: <span class="value">flex</span>;',
            '<span class="prop">flex-direction</span>: <span class="value">' + state.flexDirection + '</span>;',
            '<span class="prop">justify-content</span>: <span class="value">' + state.justifyContent + '</span>;',
            '<span class="prop">align-items</span>: <span class="value">' + state.alignItems + '</span>;',
            '<span class="prop">flex-wrap</span>: <span class="value">' + state.flexWrap + '</span>;',
            '<span class="prop">gap</span>: <span class="value">' + state.gap + 'px</span>;'
        ];
        return lines.join('\n');
    }

    // 复制代码
    function copyCode() {
        const code = [
            'display: flex;',
            'flex-direction: ' + state.flexDirection + ';',
            'justify-content: ' + state.justifyContent + ';',
            'align-items: ' + state.alignItems + ';',
            'flex-wrap: ' + state.flexWrap + ';',
            'gap: ' + state.gap + 'px;'
        ].join('\n');

        navigator.clipboard.writeText(code).then(() => {
            // 更新按钮状态
            elements.copyCodeBtn.textContent = '✓ 已复制';
            elements.copyCodeBtn.classList.add('copied');

            // 更新状态栏
            elements.copyStatus.textContent = 'CSS 代码已复制到剪贴板';
            elements.copyStatus.classList.add('copied');

            // 2秒后恢复
            setTimeout(() => {
                elements.copyCodeBtn.textContent = '📋 复制';
                elements.copyCodeBtn.classList.remove('copied');
                elements.copyStatus.textContent = 'CSS 代码已准备好';
                elements.copyStatus.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            elements.copyStatus.textContent = '复制失败，请手动复制';
        });
    }

    // 重置所有设置
    function resetAll() {
        // 重置状态
        state.flexDirection = 'row';
        state.justifyContent = 'flex-start';
        state.alignItems = 'stretch';
        state.flexWrap = 'nowrap';
        state.gap = 0;
        state.boxCount = 5;
        state.highlightedBox = null;

        // 重置滑块
        elements.gapSlider.value = 0;
        elements.gapValue.textContent = 0;
        elements.boxCountSlider.value = 5;
        elements.boxCountValue.textContent = 5;

        // 重置按钮状态
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 设置默认激活按钮
        document.querySelector('[data-prop="flexDirection"][data-value="row"]').classList.add('active');
        document.querySelector('[data-prop="justifyContent"][data-value="flex-start"]').classList.add('active');
        document.querySelector('[data-prop="alignItems"][data-value="stretch"]').classList.add('active');
        document.querySelector('[data-prop="flexWrap"][data-value="nowrap"]').classList.add('active');

        // 重新渲染
        renderBoxes();
        updatePreview();
    }

    // DOM 加载完成后初始化
    document.addEventListener('DOMContentLoaded', init);
})();

(function() {
    'use strict';

    // 状态
    const state = {
        data: null,
        articles: [],
        currentArticle: null,
        currentIndex: 0,
        activeChapter: 'all',
        searchQuery: ''
    };

    // DOM 元素
    const elements = {
        articleGrid: document.getElementById('articleGrid'),
        searchInput: document.getElementById('searchInput'),
        chapterFilter: document.getElementById('chapterFilter'),
        modal: document.getElementById('modal'),
        modalTitle: document.getElementById('modalTitle'),
        modalTitleEn: document.getElementById('modalTitleEn'),
        modalContentZh: document.getElementById('modalContentZh'),
        modalContentEn: document.getElementById('modalContentEn'),
        modalInterpretation: document.getElementById('modalInterpretation'),
        modalClose: document.getElementById('modalClose'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        statsArticles: document.getElementById('statsArticles'),
        statsChapters: document.getElementById('statsChapters')
    };

    // 初始化
    async function init() {
        await loadData();
        renderStats();
        renderChapterFilter();
        renderGrid();
        setupEventListeners();
    }

    // 加载数据
    async function loadData() {
        try {
            const response = await fetch('data/articles.json');
            state.data = await response.json();
            state.articles = state.data.articles || [];
        } catch (error) {
            console.error('Failed to load data:', error);
            elements.articleGrid.innerHTML = `
                <div class="empty-state">
                    <p>加载数据失败，请刷新页面重试</p>
                </div>
            `;
        }
    }

    // 渲染统计
    function renderStats() {
        if (state.data && state.data.meta) {
            elements.statsArticles.textContent = state.data.meta.totalArticles;
            elements.statsChapters.textContent = state.data.meta.totalChapters;
        }
    }

    // 渲染章节筛选器
    function renderChapterFilter() {
        if (!state.data || !state.data.chapters) return;

        const fragment = document.createDocumentFragment();

        // 添加"全部"选项
        const allTab = document.createElement('button');
        allTab.className = 'filter-tab active';
        allTab.dataset.chapter = 'all';
        allTab.textContent = '全部';
        fragment.appendChild(allTab);

        // 添加各章节
        state.data.chapters.forEach(chapter => {
            const tab = document.createElement('button');
            tab.className = 'filter-tab';
            tab.dataset.chapter = chapter.id;
            tab.textContent = chapter.title;
            fragment.appendChild(tab);
        });

        elements.chapterFilter.appendChild(fragment);
    }

    // 筛选文章
    function filterArticles() {
        let filtered = [...state.articles];

        // 按章节筛选
        if (state.activeChapter !== 'all') {
            filtered = filtered.filter(a => a.chapter === parseInt(state.activeChapter));
        }

        // 按搜索词筛选
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(query) ||
                a.titleEn.toLowerCase().includes(query) ||
                a.number.toString() === query ||
                (a.keywords && a.keywords.some(k => k.toLowerCase().includes(query)))
            );
        }

        return filtered;
    }

    // 渲染卡片网格
    function renderGrid() {
        const filtered = filterArticles();

        if (filtered.length === 0) {
            elements.articleGrid.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>没有找到匹配的条文</p>
                </div>
            `;
            return;
        }

        elements.articleGrid.innerHTML = filtered.map(article => createCard(article)).join('');
    }

    // 创建卡片 HTML
    function createCard(article) {
        const excerpt = article.contentZh[0].slice(0, 60);
        const chapter = state.data.chapters.find(c => c.id === article.chapter);
        const importanceClass = article.importance === 'high' ? 'high' : '';

        return `
            <div class="article-card" data-article="${article.number}">
                <div class="card-inner">
                    <div class="card-face card-front">
                        ${article.importance === 'high' ? `<span class="importance-badge ${importanceClass}"></span>` : ''}
                        <span class="article-number">第 ${article.number} 条</span>
                        <span class="article-title">${article.title}</span>
                        ${chapter ? `<span class="article-chapter">${chapter.title}</span>` : ''}
                    </div>
                    <div class="card-face card-back">
                        <span class="article-title-en">${article.titleEn}</span>
                        <span class="article-excerpt">${excerpt}...</span>
                        ${article.keywords ? `
                            <div class="article-keywords">
                                ${article.keywords.slice(0, 3).map(k => `<span class="keyword-tag">${k}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // 显示文章详情
    function showArticleDetail(article) {
        state.currentArticle = article;
        state.currentIndex = state.articles.findIndex(a => a.number === article.number);

        // 更新 Modal 内容
        elements.modalTitle.textContent = `第 ${article.number} 条 - ${article.title}`;
        elements.modalTitleEn.textContent = `Article ${article.number} - ${article.titleEn}`;

        // 渲染中文内容
        elements.modalContentZh.innerHTML = article.contentZh.map(p => `<p>${p}</p>`).join('');

        // 渲染英文内容
        elements.modalContentEn.innerHTML = article.contentEn.map(p => `<p>${p}</p>`).join('');

        // 渲染解读
        elements.modalInterpretation.textContent = article.interpretation || '暂无解读';

        // 更新导航按钮状态
        updateNavButtons();

        // 显示 Modal
        elements.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 更新导航按钮状态
    function updateNavButtons() {
        const filtered = filterArticles();
        const filteredIndex = filtered.findIndex(a => a.number === state.currentArticle.number);

        elements.prevBtn.disabled = filteredIndex <= 0;
        elements.nextBtn.disabled = filteredIndex >= filtered.length - 1;
    }

    // 导航到上一条/下一条
    function navigateArticle(direction) {
        const filtered = filterArticles();
        const currentIndex = filtered.findIndex(a => a.number === state.currentArticle.number);
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < filtered.length) {
            showArticleDetail(filtered[newIndex]);
            // 滚动内容区到顶部
            elements.modalContentZh.scrollTop = 0;
            elements.modalContentEn.scrollTop = 0;
        }
    }

    // 关闭 Modal
    function closeModal() {
        elements.modal.classList.remove('show');
        document.body.style.overflow = '';
        state.currentArticle = null;
    }

    // 设置事件监听
    function setupEventListeners() {
        // 卡片点击 -> 打开 Modal
        elements.articleGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.article-card');
            if (card) {
                const articleNum = parseInt(card.dataset.article);
                const article = state.articles.find(a => a.number === articleNum);
                if (article) {
                    showArticleDetail(article);
                }
            }
        });

        // 搜索
        elements.searchInput.addEventListener('input', debounce((e) => {
            state.searchQuery = e.target.value.trim();
            renderGrid();
        }, 300));

        // 章节筛选
        elements.chapterFilter.addEventListener('click', (e) => {
            const tab = e.target.closest('.filter-tab');
            if (tab) {
                // 更新激活状态
                elements.chapterFilter.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // 更新筛选并重新渲染
                state.activeChapter = tab.dataset.chapter;
                renderGrid();
            }
        });

        // Modal 关闭
        elements.modalClose.addEventListener('click', closeModal);
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                closeModal();
            }
        });

        // Modal 内导航
        elements.prevBtn.addEventListener('click', () => navigateArticle(-1));
        elements.nextBtn.addEventListener('click', () => navigateArticle(1));

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            // ESC 关闭 Modal
            if (e.key === 'Escape' && elements.modal.classList.contains('show')) {
                closeModal();
            }

            // 左右箭头导航
            if (elements.modal.classList.contains('show')) {
                if (e.key === 'ArrowLeft') {
                    navigateArticle(-1);
                } else if (e.key === 'ArrowRight') {
                    navigateArticle(1);
                }
            }
        });
    }

    // 防抖函数
    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// 我的书架 - 主页脚本
(function() {
    'use strict';

    // 状态管理
    const state = {
        books: [],
        filteredBooks: [],
        categories: ['全部'],
        currentCategory: '全部',
        searchQuery: '',
        viewMode: 'gallery',
        sortBy: 'addedDate',
        sortOrder: 'desc',
        loadedCount: 0,
        batchSize: 20,
        isLoading: false
    };

    // 获取所有分类
    function extractCategories(books) {
        const cats = new Set(['全部']);
        books.forEach(book => {
            if (book.category) cats.add(book.category);
        });
        return Array.from(cats);
    }

    // 渲染星级评分
    function renderStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
        }
        return html;
    }

    // 渲染关键词
    function renderKeywords(keywords) {
        if (!keywords || keywords.length === 0) return '';
        return `
            <div class="keywords">
                ${keywords.map(k => `<span class="keyword">${k}</span>`).join('')}
            </div>
        `;
    }

    // 渲染书籍卡片
    function renderBookCard(book) {
        const categoryHtml = book.category
            ? `<span class="book-category">${book.category}</span>`
            : '';

        return `
            <article class="book-card" data-id="${book.id}" onclick="window.location.href='books/${book.id}/'">
                <div class="cover-area">
                    <img src="${book.cover}" alt="${book.title}" onerror="this.style.display='none'">
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    ${categoryHtml}
                    <p class="book-summary">${book.summary}</p>
                    ${renderKeywords(book.keywords)}
                    <div class="book-meta">
                        <div class="rating">
                            ${renderStars(book.rating)}
                        </div>
                        <span class="read-date">${book.readDate}</span>
                    </div>
                </div>
            </article>
        `;
    }

    // 解析日期字符串为可比较的值
    function parseDate(dateStr) {
        if (!dateStr) return '';
        // 支持 "2026-04" 或 "2026-04-12" 格式
        return dateStr;
    }

    // 解析年份
    function parseYear(yearStr) {
        if (!yearStr) return 0;
        // 提取数字，处理如 "约14000行" 的情况
        const match = yearStr.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    // 排序书籍
    function sortBooks(books) {
        const { sortBy, sortOrder } = state;
        const sorted = [...books];

        sorted.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'addedDate':
                    valueA = parseDate(a.addedDate);
                    valueB = parseDate(b.addedDate);
                    break;
                case 'readDate':
                    valueA = parseDate(a.readDate);
                    valueB = parseDate(b.readDate);
                    break;
                case 'year':
                    valueA = parseYear(a.metadata?.year);
                    valueB = parseYear(b.metadata?.year);
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    // 过滤书籍
    function filterBooks() {
        let filtered = [...state.books];

        // 按分类过滤
        if (state.currentCategory !== '全部') {
            filtered = filtered.filter(book => book.category === state.currentCategory);
        }

        // 按搜索词过滤
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(book => {
                const titleMatch = book.title.toLowerCase().includes(query);
                const authorMatch = book.author.toLowerCase().includes(query);
                const keywordMatch = book.keywords && book.keywords.some(k => k.toLowerCase().includes(query));
                const categoryMatch = book.category && book.category.toLowerCase().includes(query);
                return titleMatch || authorMatch || keywordMatch || categoryMatch;
            });
        }

        // 排序
        filtered = sortBooks(filtered);

        state.filteredBooks = filtered;
        state.loadedCount = 0;
    }

    // 渲染分类按钮
    function renderCategories() {
        // 计算每个分类的书籍数量
        const categoryCounts = {};
        state.books.forEach(book => {
            const cat = book.category || '未分类';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        categoryCounts['全部'] = state.books.length;

        const container = document.getElementById('categoryFilter');
        container.innerHTML = state.categories.map(cat => {
            const count = categoryCounts[cat] || 0;
            return `
                <button class="category-btn ${cat === state.currentCategory ? 'active' : ''}" data-category="${cat}">
                    ${cat} <span class="category-count">(${count})</span>
                </button>
            `;
        }).join('');

        // 绑定事件
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentCategory = btn.dataset.category;
                renderCategories();
                filterBooks();
                renderBooks(true);
            });
        });
    }

    // 渲染书籍（懒加载）
    function renderBooks(clear = false) {
        const grid = document.getElementById('bookGrid');
        const loadingIndicator = document.getElementById('loadingIndicator');

        if (clear) {
            grid.innerHTML = '';
            state.loadedCount = 0;
        }

        // 检查是否有结果
        if (state.filteredBooks.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p>没有找到匹配的书籍</p>
                </div>
            `;
            loadingIndicator.style.display = 'none';
            return;
        }

        // 加载下一批
        const start = state.loadedCount;
        const end = Math.min(start + state.batchSize, state.filteredBooks.length);
        const batch = state.filteredBooks.slice(start, end);

        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');

        batch.forEach(book => {
            tempDiv.innerHTML = renderBookCard(book);
            fragment.appendChild(tempDiv.firstElementChild);
        });

        grid.appendChild(fragment);
        state.loadedCount = end;

        // 显示/隐藏加载指示器
        if (state.loadedCount < state.filteredBooks.length) {
            loadingIndicator.style.display = 'block';
        } else {
            loadingIndicator.style.display = 'none';
        }
    }

    // 加载更多（滚动触发）
    function loadMore() {
        if (state.isLoading || state.loadedCount >= state.filteredBooks.length) return;

        state.isLoading = true;
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'block';

        // 模拟加载延迟
        setTimeout(() => {
            renderBooks(false);
            state.isLoading = false;
        }, 200);
    }

    // 切换视图
    function setViewMode(mode) {
        state.viewMode = mode;
        const grid = document.getElementById('bookGrid');

        if (mode === 'list') {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }

        // 更新按钮状态
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });

        // 保存到 localStorage
        localStorage.setItem('bookshelf_view_mode', mode);
    }

    // 防抖函数
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

    // 滚动监听
    function setupScrollListener() {
        const debouncedScroll = debounce(() => {
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const clientHeight = window.innerHeight;

            if (scrollTop + clientHeight >= scrollHeight - 200) {
                loadMore();
            }
        }, 100);

        window.addEventListener('scroll', debouncedScroll);
    }

    // 更新统计
    function updateStats() {
        document.getElementById('totalBooks').textContent = state.books.length;
    }

    // 加载书籍数据
    async function loadBooks() {
        try {
            const response = await fetch('data/books.json');
            state.books = await response.json();

            // 提取分类
            state.categories = extractCategories(state.books);

            // 初始化过滤
            filterBooks();

            // 渲染
            renderCategories();
            renderBooks(true);
            updateStats();

            // 恢复视图模式
            const savedMode = localStorage.getItem('bookshelf_view_mode') || 'gallery';
            setViewMode(savedMode);

            // 恢复排序设置
            const savedSort = localStorage.getItem('bookshelf_sort');
            if (savedSort) {
                const [sortBy, sortOrder] = savedSort.split('-');
                state.sortBy = sortBy;
                state.sortOrder = sortOrder;
                document.getElementById('sortSelect').value = savedSort;
            }

        } catch (error) {
            console.error('加载书籍数据失败:', error);
            document.getElementById('bookGrid').innerHTML = `
                <p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">
                    暂无书籍数据
                </p>
            `;
        }
    }

    // 初始化
    function init() {
        // 加载数据
        loadBooks();

        // 搜索框事件
        const searchInput = document.getElementById('searchInput');
        const debouncedSearch = debounce((value) => {
            state.searchQuery = value;
            filterBooks();
            renderBooks(true);
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        // 排序事件
        const sortSelect = document.getElementById('sortSelect');
        sortSelect.addEventListener('change', (e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            state.sortBy = sortBy;
            state.sortOrder = sortOrder;
            localStorage.setItem('bookshelf_sort', e.target.value);
            filterBooks();
            renderBooks(true);
        });

        // 视图切换事件
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setViewMode(btn.dataset.view);
            });
        });

        // 滚动监听
        setupScrollListener();
    }

    // DOM Ready
    document.addEventListener('DOMContentLoaded', init);
})();

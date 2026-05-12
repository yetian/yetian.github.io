document.addEventListener('DOMContentLoaded', () => {
    // 状态
    let hanziData = [];
    let currentChar = null;
    let writer = null;
    let isLooping = false;
    let currentStroke = 0;
    let strokeCount = 0;

    // DOM 元素
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-button');
    const randomBtn = document.getElementById('random-button');
    const favoritesBtn = document.getElementById('favorites-button');
    const favCount = document.getElementById('fav-count');

    const btnStroke = document.getElementById('btn-stroke');
    const btnLoop = document.getElementById('btn-loop');
    const btnReset = document.getElementById('btn-reset');
    const btnRandomChar = document.getElementById('btn-random-char');
    const btnFavorite = document.getElementById('btn-favorite');

    const charDisplay = document.getElementById('char-display');
    const pinyinDisplay = document.getElementById('pinyin-display');
    const radicalDisplay = document.getElementById('radical-display');
    const definitionDisplay = document.getElementById('definition-display');
    const decompositionDisplay = document.getElementById('decomposition-display');
    const etymologyDisplay = document.getElementById('etymology-display');

    const radicalList = document.getElementById('radical-list');
    const radicalMore = document.getElementById('radical-more');
    const favoritesModal = document.getElementById('favorites-modal');
    const modalClose = document.getElementById('modal-close');
    const favoritesList = document.getElementById('favorites-list');

    const btnBreakdown = document.getElementById('btn-breakdown');
    const strokeEvolution = document.getElementById('stroke-evolution');

    const btnDots = document.getElementById('btn-dots');
    const connectDots = document.getElementById('connect-dots');
    const showLabels = document.getElementById('show-labels');
    const monochromeMode = document.getElementById('monochrome-mode');
    const transparentBg = document.getElementById('transparent-bg');
    const strokeDots = document.getElementById('stroke-dots');
    const btnDownloadPng = document.getElementById('btn-download-png');
    const btnDownloadSvg = document.getElementById('btn-download-svg');
    const btnPrint = document.getElementById('btn-print');
    const btnPrintBW = document.getElementById('btn-print-bw');

    // 加载汉字数据
    fetch('data/dictionary.json')
        .then(res => res.json())
        .then(data => {
            hanziData = data;
            initRadicalList();

            // 检查 URL 参数
            const queryChar = handleQueryParams();
            if (queryChar) {
                searchCharacter(queryChar);
            } else {
                showRandomCharacter();
            }

            updateFavoritesCount();
        })
        .catch(err => {
            console.error('加载数据失败:', err);
        });

    // 初始化部首列表
    let radicalStrokeCounts = {}; // 部首笔画数缓存

    function initRadicalList() {
        const radicals = new Map();
        hanziData.forEach(item => {
            if (item.radical) {
                radicals.set(item.radical, (radicals.get(item.radical) || 0) + 1);
            }
        });

        // 按数量排序
        const sorted = [...radicals.entries()].sort((a, b) => b[1] - a[1]);

        // 添加"全部"选项
        const allItem = document.createElement('div');
        allItem.className = 'radical-item active';
        allItem.textContent = '全部';
        allItem.dataset.radical = '';
        radicalList.appendChild(allItem);

        // 收起模式：简单列表
        sorted.forEach(([radical, count]) => {
            const item = document.createElement('div');
            item.className = 'radical-item';
            item.textContent = radical;
            item.dataset.radical = radical;
            item.title = `${count} 个汉字`;
            radicalList.appendChild(item);
        });

        // 检查是否需要"更多"按钮
        setTimeout(() => {
            const listHeight = radicalList.scrollHeight;
            const twoRowHeight = 68;
            if (listHeight > twoRowHeight) {
                radicalList.classList.add('collapsed');
                radicalMore.style.display = 'block';
            }
        }, 0);

        // 展开/收起
        let isExpanded = false;
        radicalMore.addEventListener('click', async () => {
            isExpanded = !isExpanded;

            if (isExpanded) {
                // 展开模式：按笔画分组
                await renderGroupedRadicals(sorted);
                radicalMore.textContent = '收起 ▲';
            } else {
                // 收起模式：简单列表
                renderSimpleRadicals(sorted);
                radicalList.classList.add('collapsed');
                radicalMore.textContent = '更多 ▼';
            }
        });

        // 点击事件
        radicalList.addEventListener('click', (e) => {
            if (e.target.classList.contains('radical-item')) {
                document.querySelectorAll('.radical-item').forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');
                const radical = e.target.dataset.radical;
                showRandomByRadical(radical);
            }
        });
    }

    // 渲染简单列表
    function renderSimpleRadicals(sorted) {
        radicalList.innerHTML = '';

        const allItem = document.createElement('div');
        allItem.className = 'radical-item active';
        allItem.textContent = '全部';
        allItem.dataset.radical = '';
        radicalList.appendChild(allItem);

        sorted.forEach(([radical, count]) => {
            const item = document.createElement('div');
            item.className = 'radical-item';
            item.textContent = radical;
            item.dataset.radical = radical;
            item.title = `${count} 个汉字`;
            radicalList.appendChild(item);
        });
    }

    // 渲染按笔画分组的列表
    async function renderGroupedRadicals(sorted) {
        radicalList.innerHTML = '';
        radicalList.classList.remove('collapsed');

        // 添加"全部"选项
        const allItem = document.createElement('div');
        allItem.className = 'radical-item active';
        allItem.textContent = '全部';
        allItem.dataset.radical = '';
        radicalList.appendChild(allItem);

        // 获取所有部首的笔画数
        const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五'];
        const radicalsByStroke = new Map();

        for (const [radical, count] of sorted) {
            const strokeCount = await getRadicalStrokeCount(radical);
            if (!radicalsByStroke.has(strokeCount)) {
                radicalsByStroke.set(strokeCount, []);
            }
            radicalsByStroke.get(strokeCount).push([radical, count]);
        }

        // 按笔画数排序并渲染
        const sortedStrokes = [...radicalsByStroke.entries()].sort((a, b) => a[0] - b[0]);

        sortedStrokes.forEach(([strokeCount, radicals]) => {
            // 添加分组标题
            const header = document.createElement('div');
            header.className = 'radical-group-header';
            header.textContent = `${chineseNumbers[strokeCount - 1] || strokeCount}画`;
            radicalList.appendChild(header);

            // 添加该组部首
            radicals.forEach(([radical, count]) => {
                const item = document.createElement('div');
                item.className = 'radical-item';
                item.textContent = radical;
                item.dataset.radical = radical;
                item.title = `${count} 个汉字`;
                radicalList.appendChild(item);
            });
        });
    }

    // 获取部首笔画数
    async function getRadicalStrokeCount(radical) {
        if (radicalStrokeCounts[radical] !== undefined) {
            return radicalStrokeCounts[radical];
        }

        // 常见部首笔画数（硬编码加速）
        const commonStrokes = {
            '一': 1, '丨': 1, '丿': 1, '丶': 1, '乙': 1,
            '二': 2, '亠': 2, '人': 2, '入': 2, '八': 2, '冂': 2, '冖': 2, '冫': 2, '几': 2, '凵': 2, '刀': 2, '力': 2, '勹': 2, '匕': 2, '匚': 2, '匸': 2, '十': 2, '卜': 2, '卩': 2, '厂': 2, '厶': 2, '又': 2,
            '口': 3, '囗': 3, '土': 3, '士': 3, '夂': 3, '夊': 3, '夕': 3, '大': 3, '女': 3, '子': 3, '宀': 3, '寸': 3, '小': 3, '尢': 3, '尸': 3, '屮': 3, '山': 3, '川': 3, '工': 3, '己': 3, '巾': 3, '干': 3, '幺': 3, '广': 3, '廴': 3, '廾': 3, '弋': 3, '弓': 3, '彐': 3, '彡': 3, '彳': 3,
            '心': 4, '戈': 4, '户': 4, '手': 4, '支': 4, '攵': 4, '文': 4, '斗': 4, '斤': 4, '方': 4, '无': 4, '日': 4, '曰': 4, '月': 4, '木': 4, '欠': 4, '止': 4, '歹': 4, '殳': 4, '毋': 4, '比': 4, '毛': 4, '氏': 4, '气': 4, '水': 4, '火': 4, '爪': 4, '父': 4, '爻': 4, '爿': 4, '片': 4, '牙': 4, '牛': 4, '犬': 4, '王': 4, '礻': 4,
            '玄': 5, '玉': 5, '瓜': 5, '瓦': 5, '甘': 5, '生': 5, '用': 5, '田': 5, '疋': 5, '疒': 5, '癶': 5, '白': 5, '皮': 5, '皿': 5, '目': 5, '矛': 5, '矢': 5, '石': 5, '示': 5, '禸': 5, '禾': 5, '穴': 5, '立': 5,
            '竹': 6, '米': 6, '糸': 6, '缶': 6, '网': 6, '羊': 6, '羽': 6, '老': 6, '而': 6, '耒': 6, '耳': 6, '聿': 6, '肉': 6, '臣': 6, '自': 6, '至': 6, '臼': 6, '舌': 6, '舛': 6, '舟': 6, '艮': 6, '色': 6, '艸': 6, '虍': 6, '虫': 6, '血': 6, '行': 6, '衣': 6, '襾': 6,
            '見': 7, '角': 7, '言': 7, '谷': 7, '豆': 7, '豕': 7, '豸': 7, '貝': 7, '赤': 7, '走': 7, '足': 7, '身': 7, '車': 7, '辛': 7, '辰': 7, '辵': 7, '邑': 7, '酉': 7, '釆': 7, '里': 7, '金字': 7,
            '金': 8, '長': 8, '門': 8, '阜': 8, '隶': 8, '隹': 8, '雨': 8, '青': 8, '非': 8,
            '面': 9, '革': 9, '韋': 9, '韭': 9, '音': 9, '頁': 9, '風': 9, '飛': 9, '食': 9, '首': 9, '香': 9,
            '馬': 10, '骨': 10, '高': 10, '髟': 10, '鬥': 10, '鬯': 10, '鬲': 10, '鬼': 10,
            '魚': 11, '鳥': 11, '鹵': 11, '鹿': 11, '麥': 11, '麻': 11,
            '黃': 12, '黍': 12, '黑': 12, '黹': 12,
            '黽': 13, '鼎': 13, '鼓': 13, '鼠': 13,
            '鼻': 14, '齊': 14,
            '齒': 15,
            '龍': 16, '龜': 16,
            '龠': 17
        };

        if (commonStrokes[radical] !== undefined) {
            radicalStrokeCounts[radical] = commonStrokes[radical];
            return commonStrokes[radical];
        }

        // 动态获取笔画数
        try {
            const data = await HanziWriter.loadCharacterData(radical);
            const strokeCount = data.strokes ? data.strokes.length : 1;
            radicalStrokeCounts[radical] = strokeCount;
            return strokeCount;
        } catch {
            radicalStrokeCounts[radical] = 1;
            return 1;
        }
    }

    // 按部首随机显示
    function showRandomByRadical(radical) {
        const filtered = radical
            ? hanziData.filter(item => item.radical === radical)
            : hanziData;
        if (filtered.length > 0) {
            const randomItem = filtered[Math.floor(Math.random() * filtered.length)];
            updateCharacter(randomItem);
        }
    }

    // 更新汉字显示
    function updateCharacter(charData) {
        if (!charData) return;
        currentChar = charData;
        resetModes();

        // 清空笔画拆解和点阵
        strokeEvolution.innerHTML = '';
        strokeDots.innerHTML = '';

        // 清空并重新创建 writer
        document.getElementById('character-target').innerHTML = '';
        writer = HanziWriter.create('character-target', charData.character, {
            width: 260,
            height: 260,
            padding: 5,
            strokeColor: '#a78bfa',
            radicalColor: '#ec4899',
            highlightColor: '#06b6d4',
            outlineColor: 'rgba(255,255,255,0.1)',
            drawingColor: '#8b5cf6',
            drawingWidth: 6,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 300,
            showCharacter: true,
            showOutline: true
        });

        writer.animateCharacter({
            onComplete: () => {
                strokeCount = 0;
                // 获取笔画数
                HanziWriter.loadCharacterData(charData.character).then(data => {
                    strokeCount = data.strokes.length;
                });
            }
        });

        // 更新详情
        charDisplay.textContent = charData.character;
        pinyinDisplay.textContent = charData.pinyin && charData.pinyin.length > 0
            ? charData.pinyin.join(', ')
            : '-';
        radicalDisplay.textContent = charData.radical || '-';
        definitionDisplay.textContent = charData.definition || '-';

        // 拆解
        if (charData.decomposition && charData.decomposition !== '？') {
            decompositionDisplay.textContent = formatDecomposition(charData.decomposition);
        } else {
            decompositionDisplay.textContent = '-';
        }

        // 字源
        if (charData.etymology) {
            etymologyDisplay.textContent = formatEtymology(charData.etymology);
        } else {
            etymologyDisplay.textContent = '暂无字源信息';
        }

        // 更新收藏状态
        updateFavoriteButton();
    }

    // 格式化拆解
    function formatDecomposition(decomp) {
        const symbols = {
            '⿰': '左右', '⿱': '上下', '⿲': '左中右', '⿳': '上中下',
            '⿴': '全包围', '⿵': '上三包围', '⿶': '下三包围', '⿷': '左三包围',
            '⿸': '左上包围', '⿹': '右上包围', '⿺': '左下包围', '⿻': '穿插'
        };
        let result = decomp;
        for (const [sym, name] of Object.entries(symbols)) {
            result = result.replace(sym, `[${name}]`);
        }
        return result;
    }

    // 格式化字源
    function formatEtymology(ety) {
        const types = {
            'pictographic': '象形字',
            'ideographic': '会意字',
            'pictophonetic': '形声字'
        };
        let text = `[${types[ety.type] || ety.type}] `;
        if (ety.hint) text += ety.hint;
        if (ety.type === 'pictophonetic') {
            if (ety.semantic) text += ` 形旁：${ety.semantic}`;
            if (ety.phonetic) text += ` 声旁：${ety.phonetic}`;
        }
        return text;
    }

    // 重置所有模式
    function resetModes() {
        isLooping = false;
        
        currentStroke = 0;
        btnLoop.classList.remove('active');
        
    }

    // 搜索汉字
    function searchCharacter(char) {
        const found = hanziData.find(item => item.character === char);
        if (found) {
            updateCharacter(found);
        } else {
            // 如果不在字典中，尝试用 HanziWriter 直接加载
            document.getElementById('character-target').innerHTML = '';
            writer = HanziWriter.create('character-target', char, {
                width: 260,
                height: 260,
                padding: 5,
                strokeColor: '#a78bfa',
                outlineColor: 'rgba(255,255,255,0.1)'
            });
            writer.animateCharacter();
            charDisplay.textContent = char;
            pinyinDisplay.textContent = '-';
            radicalDisplay.textContent = '-';
            definitionDisplay.textContent = '-';
            decompositionDisplay.textContent = '-';
            etymologyDisplay.textContent = '字典中暂无此字';
            currentChar = { character: char };
            updateFavoriteButton();
        }
    }

    // 随机汉字
    function showRandomCharacter() {
        if (hanziData.length === 0) return;

        // 检查是否有选中的部首
        const activeRadical = document.querySelector('.radical-item.active');
        const radical = activeRadical ? activeRadical.dataset.radical : '';

        if (radical) {
            showRandomByRadical(radical);
        } else {
            const item = hanziData[Math.floor(Math.random() * hanziData.length)];
            updateCharacter(item);
        }
    }


    // 逐笔学习
    function strokeByStroke() {
        if (!writer || !currentChar) return;
        resetModes();

        HanziWriter.loadCharacterData(currentChar.character).then(data => {
            strokeCount = data.strokes.length;
            currentStroke = 0;

            // 隐藏字符
            writer.hideCharacter();
            writer.showOutline();

            function nextStroke() {
                if (currentStroke < strokeCount) {
                    writer.animateStroke(currentStroke, {
                        onComplete: () => {
                            currentStroke++;
                            setTimeout(nextStroke, 500);
                        }
                    });
                } else {
                    // 完成后显示完整字符
                    setTimeout(() => {
                        writer.showCharacter();
                    }, 500);
                }
            }

            nextStroke();
        });
    }

    // 循环动画
    function toggleLoop() {
        if (!writer) return;

        if (isLooping) {
            writer.pauseAnimation();
            isLooping = false;
            btnLoop.classList.remove('active');
        } else {
            resetModes();
            isLooping = true;
            btnLoop.classList.add('active');
            writer.loopCharacterAnimation();
        }
    }

    // 重置
    function reset() {
        if (!writer || !currentChar) return;
        resetModes();
        writer.cancelQuiz();
        document.getElementById('character-target').innerHTML = '';

        writer = HanziWriter.create('character-target', currentChar.character, {
            width: 260,
            height: 260,
            padding: 5,
            strokeColor: '#a78bfa',
            radicalColor: '#ec4899',
            outlineColor: 'rgba(255,255,255,0.1)'
        });
        writer.animateCharacter();
    }

    // === 生字本功能 ===

    function getFavorites() {
        const stored = localStorage.getItem('hanzi_favorites');
        return stored ? JSON.parse(stored) : [];
    }

    function saveFavorites(favs) {
        localStorage.setItem('hanzi_favorites', JSON.stringify(favs));
        updateFavoritesCount();
    }

    function addFavorite() {
        if (!currentChar) return;
        let favs = getFavorites();
        const existingIndex = favs.findIndex(f => f.character === currentChar.character);

        if (existingIndex >= 0) {
            // 已收藏，则取消收藏
            favs.splice(existingIndex, 1);
        } else {
            // 未收藏，则添加
            favs.push({
                character: currentChar.character,
                pinyin: currentChar.pinyin,
                definition: currentChar.definition
            });
        }
        saveFavorites(favs);
        updateFavoriteButton();
    }

    function removeFavorite(char) {
        let favs = getFavorites();
        favs = favs.filter(f => f.character !== char);
        saveFavorites(favs);
        renderFavorites();
        updateFavoriteButton();
    }

    function updateFavoriteButton() {
        if (!currentChar) return;
        const favs = getFavorites();
        const isFav = favs.some(f => f.character === currentChar.character);
        btnFavorite.classList.toggle('active', isFav);
        btnFavorite.querySelector('.star').textContent = isFav ? '★' : '☆';
    }

    function updateFavoritesCount() {
        favCount.textContent = getFavorites().length;
    }

    function showFavoritesModal() {
        renderFavorites();
        favoritesModal.classList.add('show');
    }

    function hideFavoritesModal() {
        favoritesModal.classList.remove('show');
    }

    function renderFavorites() {
        const favs = getFavorites();
        favoritesList.innerHTML = '';

        if (favs.length === 0) {
            favoritesList.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">暂无收藏的汉字</p>';
            return;
        }

        favs.forEach(item => {
            const div = document.createElement('div');
            div.className = 'fav-item';
            div.innerHTML = `
                <div class="fav-char">${item.character}</div>
                <div class="fav-pinyin">${item.pinyin && item.pinyin.length > 0 ? item.pinyin[0] : ''}</div>
                <button class="fav-remove" data-char="${item.character}">×</button>
            `;
            div.addEventListener('click', (e) => {
                if (!e.target.classList.contains('fav-remove')) {
                    searchCharacter(item.character);
                    hideFavoritesModal();
                }
            });
            favoritesList.appendChild(div);
        });

        // 删除按钮事件
        favoritesList.querySelectorAll('.fav-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFavorite(btn.dataset.char);
            });
        });
    }

    // === 笔画拆解功能 ===

    function generateStrokeBreakdown() {
        if (!currentChar) return;
        strokeEvolution.innerHTML = '<p style="color: var(--text-muted);">加载中...</p>';

        HanziWriter.loadCharacterData(currentChar.character).then(data => {
            const strokes = data.strokes;
            const medians = data.medians; // 笔画中心点
            const numStrokes = strokes.length;

            strokeEvolution.innerHTML = '';

            // 生成每个阶段的 SVG
            for (let i = 0; i <= numStrokes; i++) {
                const stageDiv = document.createElement('div');
                stageDiv.className = 'stroke-stage';
                stageDiv.style.animationDelay = `${i * 0.1}s`;

                // 创建 SVG
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 1024 1024');
                svg.setAttribute('width', '50');
                svg.setAttribute('height', '50');

                // 创建组元素并翻转（修正 Y 轴方向）
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                group.setAttribute('transform', 'translate(0 1024) scale(1 -1)');

                // 添加前 i 笔
                for (let j = 0; j < i; j++) {
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', strokes[j]);
                    // 高亮最新的一笔
                    const isNewStroke = (j === i - 1);
                    path.setAttribute('fill', isNewStroke ? '#ec4899' : '#a78bfa');
                    path.setAttribute('stroke', isNewStroke ? '#ec4899' : '#a78bfa');
                    path.setAttribute('stroke-width', '10');
                    path.setAttribute('stroke-linecap', 'round');
                    path.setAttribute('stroke-linejoin', 'round');
                    group.appendChild(path);
                }

                svg.appendChild(group);
                stageDiv.appendChild(svg);

                // 笔画数标签
                const numLabel = document.createElement('div');
                numLabel.className = 'stroke-num';
                numLabel.textContent = i === 0 ? '空白' : `第${i}笔`;
                stageDiv.appendChild(numLabel);

                strokeEvolution.appendChild(stageDiv);
            }
        }).catch(err => {
            strokeEvolution.innerHTML = '<p style="color: var(--text-muted);">无法加载笔画数据</p>';
            console.error('笔画拆解失败:', err);
        });
    }

    // === 笔画点阵功能 ===

    function generateStrokeDots() {
        if (!currentChar) return;
        strokeDots.innerHTML = '<p class="stroke-dots-empty">加载中...</p>';

        const shouldConnect = connectDots.checked;
        const shouldShowLabels = showLabels.checked;
        const isMonochrome = monochromeMode.checked;
        const isTransparent = transparentBg.checked;

        HanziWriter.loadCharacterData(currentChar.character).then(data => {
            let medians = data.medians; // 每笔的中心点数组
            if (!medians || medians.length === 0) {
                strokeDots.innerHTML = '<p class="stroke-dots-empty">无点阵数据</p>';
                return;
            }

            // 计算距离并插值
            medians = interpolateMedians(medians);

            // 计算边界框以实现居中
            const bounds = calculateBounds(medians);
            const centerX = (bounds.minX + bounds.maxX) / 2;
            const centerY = (bounds.minY + bounds.maxY) / 2;
            const svgCenter = 512; // SVG中心点

            // 偏移量：将内容中心移到SVG中心
            const offsetX = svgCenter - centerX;
            const offsetY = svgCenter - centerY;

            // 创建单个大 SVG
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 1024 1024');
            svg.setAttribute('width', '400');
            svg.setAttribute('height', '400');

            // 创建组元素并翻转（用于点）
            // 先应用偏移，再翻转Y轴
            const dotsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            dotsGroup.setAttribute('transform', `translate(0 1024) scale(1 -1) translate(${offsetX} ${offsetY})`);

            // 创建组元素用于标签（不翻转，只需要偏移）
            const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelsGroup.setAttribute('transform', `translate(${offsetX} ${-offsetY})`);

            // 颜色：根据笔画索引使用不同颜色
            const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];
            const blackColor = '#333333';

            let globalIndex = 1; // 全局标号

            medians.forEach((points, strokeIndex) => {
                const strokeColor = isMonochrome ? blackColor : colors[strokeIndex % colors.length];

                // 绘制连线（可选）
                if (shouldConnect && points.length > 1) {
                    const pathD = points.map((p, i) =>
                        (i === 0 ? 'M' : 'L') + `${p[0]} ${p[1]}`
                    ).join(' ');

                    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    linePath.setAttribute('d', pathD);
                    linePath.setAttribute('fill', 'none');
                    linePath.setAttribute('stroke', strokeColor);
                    linePath.setAttribute('stroke-width', '14');
                    linePath.setAttribute('stroke-linecap', 'round');
                    linePath.setAttribute('stroke-linejoin', 'round');
                    linePath.setAttribute('opacity', '0.4');
                    dotsGroup.appendChild(linePath);
                }

                // 绘制点和标签
                points.forEach((point, i) => {
                    // 绘制点
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', point[0]);
                    circle.setAttribute('cy', point[1]);
                    circle.setAttribute('r', '10');
                    circle.setAttribute('fill', strokeColor);
                    dotsGroup.appendChild(circle);

                    // 绘制标号标签（翻转Y坐标以正着显示）
                    if (shouldShowLabels) {
                        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        // Y坐标需要翻转：1024 - y
                        const flippedY = 1024 - point[1];
                        text.setAttribute('x', point[0] + 15); // 稍微偏移
                        text.setAttribute('y', flippedY + 5);
                        text.setAttribute('fill', strokeColor);
                        text.setAttribute('font-size', '24');
                        text.setAttribute('font-weight', '500');
                        text.textContent = globalIndex;
                        labelsGroup.appendChild(text);
                    }

                    globalIndex++;
                });
            });

            svg.appendChild(dotsGroup);
            svg.appendChild(labelsGroup);
            strokeDots.innerHTML = '';
            strokeDots.appendChild(svg);

            // 切换透明背景类
            strokeDots.classList.toggle('transparent', isTransparent);
        }).catch(err => {
            strokeDots.innerHTML = '<p class="stroke-dots-empty">无法加载点阵数据</p>';
            console.error('笔画点阵失败:', err);
        });
    }

    // 插值处理：在距离过大的相邻点之间插入新点
    function interpolateMedians(medians) {
        // 收集所有相邻点距离
        const allDistances = [];
        medians.forEach(points => {
            for (let i = 0; i < points.length - 1; i++) {
                allDistances.push(distance(points[i], points[i + 1]));
            }
        });

        if (allDistances.length === 0) return medians;

        // 计算中位数作为"正常距离"
        const sorted = [...allDistances].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];

        // 阈值：中位数的2倍
        const threshold = median * 2;

        // 对每条笔画进行插值
        return medians.map(points => {
            const newPoints = [points[0]]; // 起点保留

            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const dist = distance(p1, p2);

                // 如果距离超过阈值，插入点
                if (dist > threshold) {
                    const numInserts = Math.floor(dist / median) - 1;
                    for (let j = 1; j <= numInserts; j++) {
                        const t = j / (numInserts + 1);
                        newPoints.push([
                            p1[0] + (p2[0] - p1[0]) * t,
                            p1[1] + (p2[1] - p1[1]) * t
                        ]);
                    }
                }

                newPoints.push(p2);
            }

            return newPoints;
        });
    }

    // 计算两点距离
    function distance(p1, p2) {
        return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
    }

    // 计算所有点的边界框
    function calculateBounds(medians) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        medians.forEach(points => {
            points.forEach(p => {
                minX = Math.min(minX, p[0]);
                maxX = Math.max(maxX, p[0]);
                minY = Math.min(minY, p[1]);
                maxY = Math.max(maxY, p[1]);
            });
        });

        return { minX, maxX, minY, maxY };
    }

    // === 下载功能 ===

    function downloadAsPNG() {
        const svgElement = strokeDots.querySelector('svg');
        if (!svgElement) {
            alert('请先生成点阵');
            return;
        }

        // 克隆SVG以避免修改原始
        const clonedSvg = svgElement.cloneNode(true);

        // 高分辨率：600 PPI (标准72 PPI的8.33倍)
        const scale = 8;
        const width = 1024 * scale;
        const height = 1024 * scale;

        // 更新SVG尺寸
        clonedSvg.setAttribute('width', width);
        clonedSvg.setAttribute('height', height);

        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // 透明背景（不填充任何颜色）
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);

            // 导出PNG
            canvas.toBlob((blob) => {
                const link = document.createElement('a');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                link.download = `${currentChar.character}_笔画点阵_${timestamp}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            }, 'image/png');
        };
        img.src = url;
    }

    function downloadAsSVG() {
        const svgElement = strokeDots.querySelector('svg');
        if (!svgElement) {
            alert('请先生成点阵');
            return;
        }

        // 克隆SVG
        const clonedSvg = svgElement.cloneNode(true);

        // 添加XML声明和设置
        const svgData = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            new XMLSerializer().serializeToString(clonedSvg);

        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const link = document.createElement('a');
        link.download = `${currentChar.character}_笔画点阵_${timestamp}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // === 打印功能 ===

    function printDots(isBlackWhite = false) {
        if (!currentChar) {
            alert('请先选择汉字');
            return;
        }

        const shouldConnect = connectDots.checked;
        const shouldShowLabels = showLabels.checked;
        // 黑白模式下强制单色
        const isMonochrome = isBlackWhite ? true : monochromeMode.checked;

        HanziWriter.loadCharacterData(currentChar.character).then(data => {
            const strokes = data.strokes;
            let medians = data.medians;
            if (!medians || medians.length === 0) {
                alert('无点阵数据');
                return;
            }

            // 插值处理
            medians = interpolateMedians(medians);

            // A4纸尺寸 210mm x 297mm，1200 DPI
            const width = 9921;
            const height = 14031;
            const viewBoxSize = 1024;
            const scale = width / viewBoxSize * 0.75;

            // 创建打印用SVG
            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svg.setAttribute('width', `${width}px`);
            svg.setAttribute('height', `${height}px`);
            svg.setAttribute('xmlns', svgNS);

            // 白色背景
            const bg = document.createElementNS(svgNS, 'rect');
            bg.setAttribute('width', width);
            bg.setAttribute('height', height);
            bg.setAttribute('fill', 'white');
            svg.appendChild(bg);

            // ========== 标题区域 ==========
            const titleY = 350;

            // 汉字
            const charText = document.createElementNS(svgNS, 'text');
            charText.setAttribute('x', width / 2);
            charText.setAttribute('y', titleY);
            charText.setAttribute('text-anchor', 'middle');
            charText.setAttribute('font-size', 200);
            charText.setAttribute('font-weight', '700');
            charText.setAttribute('font-family', 'SimSun, serif');
            charText.textContent = currentChar.character;
            svg.appendChild(charText);

            // 拼音
            const pinyinText = document.createElementNS(svgNS, 'text');
            pinyinText.setAttribute('x', width / 2);
            pinyinText.setAttribute('y', titleY + 180);
            pinyinText.setAttribute('text-anchor', 'middle');
            pinyinText.setAttribute('font-size', 90);
            pinyinText.setAttribute('font-family', 'Arial, sans-serif');
            pinyinText.setAttribute('fill', '#666');
            const pinyin = currentChar.pinyin && currentChar.pinyin.length > 0 ? currentChar.pinyin.join(', ') : '-';
            pinyinText.textContent = `拼音: ${pinyin}`;
            svg.appendChild(pinyinText);

            // ========== 笔画拆解区域 ==========
            const breakdownY = titleY + 350;
            const breakdownItemSize = 350;
            const breakdownGap = 30;
            const itemsPerRow = 10;
            const numStrokes = strokes.length;

            // 标题
            const breakdownTitle = document.createElementNS(svgNS, 'text');
            breakdownTitle.setAttribute('x', width / 2);
            breakdownTitle.setAttribute('y', breakdownY - 50);
            breakdownTitle.setAttribute('text-anchor', 'middle');
            breakdownTitle.setAttribute('font-size', 70);
            breakdownTitle.setAttribute('font-family', 'Arial, sans-serif');
            breakdownTitle.setAttribute('fill', '#333');
            breakdownTitle.textContent = '笔画拆解';
            svg.appendChild(breakdownTitle);

            // 计算总行数
            const totalItems = numStrokes + 1; // 包含空白
            const rows = Math.ceil(totalItems / itemsPerRow);

            // 生成每个阶段
            for (let i = 0; i <= numStrokes; i++) {
                const row = Math.floor(i / itemsPerRow);
                const col = i % itemsPerRow;

                const rowWidth = Math.min(itemsPerRow, totalItems - row * itemsPerRow) * (breakdownItemSize + breakdownGap);
                const startX = (width - rowWidth) / 2;

                const itemX = startX + col * (breakdownItemSize + breakdownGap);
                const itemY = breakdownY + row * (breakdownItemSize + 80);

                // 创建小SVG
                const miniSvg = document.createElementNS(svgNS, 'svg');
                miniSvg.setAttribute('x', itemX);
                miniSvg.setAttribute('y', itemY);
                miniSvg.setAttribute('viewBox', '0 0 1024 1024');
                miniSvg.setAttribute('width', breakdownItemSize);
                miniSvg.setAttribute('height', breakdownItemSize);

                // 边框
                const border = document.createElementNS(svgNS, 'rect');
                border.setAttribute('x', 0);
                border.setAttribute('y', 0);
                border.setAttribute('width', 1024);
                border.setAttribute('height', 1024);
                border.setAttribute('fill', 'none');
                border.setAttribute('stroke', '#ddd');
                border.setAttribute('stroke-width', 8);
                miniSvg.appendChild(border);

                // 创建组并翻转
                const group = document.createElementNS(svgNS, 'g');
                group.setAttribute('transform', 'translate(0 1024) scale(1 -1)');

                // 添加前 i 笔
                for (let j = 0; j < i; j++) {
                    const path = document.createElementNS(svgNS, 'path');
                    path.setAttribute('d', strokes[j]);
                    const isNewStroke = (j === i - 1);

                    // 颜色设置：黑白模式 vs 普通模式
                    let fillColor, strokeColor;
                    if (isBlackWhite) {
                        // 黑白模式：当前笔画黑色，过往笔画灰色(30%灰度)
                        fillColor = isNewStroke ? '#333333' : '#b3b3b3';
                        strokeColor = fillColor;
                    } else {
                        // 普通模式：当前笔画粉色，过往笔画紫色
                        fillColor = isNewStroke ? '#ec4899' : '#a78bfa';
                        strokeColor = fillColor;
                    }

                    path.setAttribute('fill', fillColor);
                    path.setAttribute('stroke', strokeColor);
                    path.setAttribute('stroke-width', 10);
                    path.setAttribute('stroke-linecap', 'round');
                    path.setAttribute('stroke-linejoin', 'round');
                    group.appendChild(path);
                }

                miniSvg.appendChild(group);
                svg.appendChild(miniSvg);

                // 标签
                const label = document.createElementNS(svgNS, 'text');
                label.setAttribute('x', itemX + breakdownItemSize / 2);
                label.setAttribute('y', itemY + breakdownItemSize + 50);
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('font-size', 40);
                label.setAttribute('font-family', 'Arial, sans-serif');
                label.setAttribute('fill', '#666');
                label.textContent = i === 0 ? '空白' : `第${i}笔`;
                svg.appendChild(label);
            }

            // ========== 笔画点阵区域 ==========
            const dotsStartY = breakdownY + rows * (breakdownItemSize + 80) + 150;

            // 点阵标题
            const dotsTitle = document.createElementNS(svgNS, 'text');
            dotsTitle.setAttribute('x', width / 2);
            dotsTitle.setAttribute('y', dotsStartY);
            dotsTitle.setAttribute('text-anchor', 'middle');
            dotsTitle.setAttribute('font-size', 70);
            dotsTitle.setAttribute('font-family', 'Arial, sans-serif');
            dotsTitle.setAttribute('fill', '#333');
            dotsTitle.textContent = '笔画点阵';
            svg.appendChild(dotsTitle);

            // 计算边界框以居中
            const bounds = calculateBounds(medians);
            const centerX = (bounds.minX + bounds.maxX) / 2;
            const centerY = (bounds.minY + bounds.maxY) / 2;
            const svgCenterX = viewBoxSize / 2;
            const svgCenterY = viewBoxSize / 2;

            // 点阵居中位置
            const dotsCenterX = width / 2;
            const dotsCenterY = dotsStartY + 200 + (height - dotsStartY - 200) / 2;

            // 颜色
            const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];
            const blackColor = '#333333';

            let globalIndex = 1;

            medians.forEach((points, strokeIndex) => {
                const strokeColor = isMonochrome ? blackColor : colors[strokeIndex % colors.length];

                // 绘制连线
                if (shouldConnect && points.length > 1) {
                    const pathD = points.map((p, i) =>
                        (i === 0 ? 'M' : 'L') + `${p[0] * scale} ${(viewBoxSize - p[1]) * scale}`
                    ).join(' ');

                    const linePath = document.createElementNS(svgNS, 'path');
                    linePath.setAttribute('d', pathD);
                    linePath.setAttribute('fill', 'none');
                    linePath.setAttribute('stroke', strokeColor);
                    linePath.setAttribute('stroke-width', 14 * scale);
                    linePath.setAttribute('stroke-linecap', 'round');
                    linePath.setAttribute('stroke-linejoin', 'round');
                    linePath.setAttribute('opacity', '0.4');
                    linePath.setAttribute('transform', `translate(${dotsCenterX - svgCenterX*scale}, ${dotsCenterY - svgCenterY*scale})`);
                    svg.appendChild(linePath);
                }

                // 绘制点和标签
                points.forEach((point, i) => {
                    const scaledX = point[0] * scale;
                    const scaledY = (viewBoxSize - point[1]) * scale;
                    const finalX = scaledX + dotsCenterX - svgCenterX * scale;
                    const finalY = scaledY + dotsCenterY - svgCenterY * scale;

                    // 点
                    const circle = document.createElementNS(svgNS, 'circle');
                    circle.setAttribute('cx', finalX);
                    circle.setAttribute('cy', finalY);
                    circle.setAttribute('r', 12 * scale);
                    circle.setAttribute('fill', strokeColor);
                    svg.appendChild(circle);

                    // 标签
                    if (shouldShowLabels) {
                        const text = document.createElementNS(svgNS, 'text');
                        text.setAttribute('x', finalX + 18 * scale);
                        text.setAttribute('y', finalY + 8 * scale);
                        text.setAttribute('fill', strokeColor);
                        text.setAttribute('font-size', 28 * scale);
                        text.setAttribute('font-weight', '600');
                        text.setAttribute('font-family', 'Arial, sans-serif');
                        text.textContent = globalIndex;
                        svg.appendChild(text);
                    }

                    globalIndex++;
                });
            });

            // 创建打印窗口
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>打印 - ${currentChar.character}</title>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { margin: 0; padding: 0; }
                        svg { width: 100%; height: auto; }
                        @media print {
                            body { margin: 0; }
                            svg { width: 190mm; height: auto; }
                        }
                    </style>
                </head>
                <body>
                    ${new XMLSerializer().serializeToString(svg)}
                </body>
                </html>
            `);
            printWindow.document.close();

            setTimeout(() => {
                printWindow.print();
            }, 500);
        }).catch(err => {
            console.error('打印失败:', err);
            alert('打印失败');
        });
    }

    // === URL 参数处理 ===

    function handleQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const charParam = params.get('char');

        if (charParam && charParam.length > 0) {
            // 取第一个字符
            const char = charParam.charAt(0);
            // 检查是否是汉字（简单判断：Unicode 范围）
            if (/[一-龥]/.test(char)) {
                return char;
            }
        }
        return null;
    }

    // === 事件绑定 ===

    searchBtn.addEventListener('click', () => {
        const val = searchInput.value.trim();
        if (val) searchCharacter(val);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = searchInput.value.trim();
            if (val) searchCharacter(val);
        }
    });

    randomBtn.addEventListener('click', showRandomCharacter);
    favoritesBtn.addEventListener('click', showFavoritesModal);
    modalClose.addEventListener('click', hideFavoritesModal);

    favoritesModal.addEventListener('click', (e) => {
        if (e.target === favoritesModal) hideFavoritesModal();
    });

    btnStroke.addEventListener('click', strokeByStroke);
    btnLoop.addEventListener('click', toggleLoop);
    btnReset.addEventListener('click', reset);
    btnRandomChar.addEventListener('click', showRandomCharacter);
    btnFavorite.addEventListener('click', addFavorite);
    btnBreakdown.addEventListener('click', generateStrokeBreakdown);
    btnDots.addEventListener('click', generateStrokeDots);
    btnDownloadPng.addEventListener('click', downloadAsPNG);
    btnDownloadSvg.addEventListener('click', downloadAsSVG);
    btnPrint.addEventListener('click', () => printDots(false));
    btnPrintBW.addEventListener('click', () => printDots(true));

    // 单色模式：禁用透明背景选项
    monochromeMode.addEventListener('change', () => {
        if (monochromeMode.checked) {
            transparentBg.checked = false;
            transparentBg.disabled = true;
        } else {
            transparentBg.disabled = false;
        }
    });

    // 初始占位
    writer = HanziWriter.create('character-target', '学', {
        width: 260,
        height: 260,
        padding: 5,
        strokeColor: '#a78bfa',
        outlineColor: 'rgba(255,255,255,0.1)'
    });
});

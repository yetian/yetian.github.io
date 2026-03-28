(function() {
    'use strict';

    // DOM Elements
    const elements = {
        inputText: document.getElementById('inputText'),
        outputText: document.getElementById('outputText'),
        clearInput: document.getElementById('clearInput'),
        copyOutput: document.getElementById('copyOutput'),
        swapBtn: document.getElementById('swapBtn'),
        charCount: document.getElementById('charCount'),
        transformBtns: document.querySelectorAll('.btn-transform')
    };

    // Transform functions
    const transforms = {
        // Case conversions
        uppercase: (text) => text.toUpperCase(),
        lowercase: (text) => text.toLowerCase(),
        titleCase: (text) => {
            return text.toLowerCase().replace(/(?:^|\s|[-"'([{])\S/g, (char) => char.toUpperCase());
        },
        sentenceCase: (text) => {
            return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase());
        },

        // Code format conversions
        camelCase: (text) => {
            const words = extractWords(text);
            if (words.length === 0) return '';
            return words[0].toLowerCase() + words.slice(1).map(capitalize).join('');
        },
        pascalCase: (text) => {
            const words = extractWords(text);
            return words.map(capitalize).join('');
        },
        snakeCase: (text) => {
            const words = extractWords(text);
            return words.map(w => w.toLowerCase()).join('_');
        },
        kebabCase: (text) => {
            const words = extractWords(text);
            return words.map(w => w.toLowerCase()).join('-');
        },
        constantCase: (text) => {
            const words = extractWords(text);
            return words.map(w => w.toUpperCase()).join('_');
        },

        // Other transforms
        reverseText: (text) => {
            return text.split('').reverse().join('');
        },
        sortLines: (text) => {
            const lines = text.split('\n');
            return lines.sort((a, b) => a.localeCompare(b, 'zh-CN')).join('\n');
        },
        removeDuplicates: (text) => {
            const lines = text.split('\n');
            const seen = new Set();
            return lines.filter(line => {
                if (seen.has(line)) return false;
                seen.add(line);
                return true;
            }).join('\n');
        },
        trimWhitespace: (text) => {
            // Trim leading/trailing whitespace from each line and remove empty lines
            return text.split('\n')
                .map(line => line.trim())
                .filter((line, i, arr) => line !== '' || i === 0 || i === arr.length - 1)
                .join('\n')
                .trim();
        },
        numberLines: (text) => {
            const lines = text.split('\n');
            const maxDigits = String(lines.length).length;
            return lines.map((line, i) => {
                const num = String(i + 1).padStart(maxDigits, ' ');
                return `${num}. ${line}`;
            }).join('\n');
        },

        // Chinese specific conversions
        fullToHalf: (text) => {
            return text.replace(/[\uff01-\uff5e]/g, (char) => {
                return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
            }).replace(/\u3000/g, ' '); // Full-width space to half-width
        },
        halfToFull: (text) => {
            return text.replace(/[\!-\~]/g, (char) => {
                return String.fromCharCode(char.charCodeAt(0) + 0xfee0);
            }).replace(/ /g, '\u3000'); // Half-width space to full-width
        },
        traditionalToSimplified: (text) => {
            return traditionalToSimplified(text);
        },
        simplifiedToTraditional: (text) => {
            return simplifiedToTraditional(text);
        }
    };

    // Helper: Extract words from text
    function extractWords(text) {
        // Handle camelCase, PascalCase, snake_case, kebab-case
        return text
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[-_\s]+/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(w => w.length > 0);
    }

    // Helper: Capitalize first letter
    function capitalize(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    // Chinese conversion mappings (common characters)
    const traditionalMap = {
        '愛': '爱', '安': '安', '八': '八', '爸': '爸', '白': '白', '百': '百', '北': '北',
        '邊': '边', '變': '变', '錶': '表', '並': '并', '不': '不', '部': '部', '才': '才',
        '參': '参', '冊': '册', '產': '产', '場': '场', '長': '长', '車': '车', '陳': '陈',
        '城': '城', '吃': '吃', '出': '出', '處': '处', '傳': '传', '窗': '窗', '從': '从',
        '聰': '聪', '達': '达', '帶': '带', '單': '单', '當': '当', '黨': '党', '到': '到',
        '導': '导', '得': '得', '燈': '灯', '地': '地', '點': '点', '電': '电', '東': '东',
        '動': '动', '讀': '读', '度': '度', '對': '对', '多': '多', '兒': '儿', '二': '二',
        '發': '发', '法': '法', '飯': '饭', '方': '方', '房': '房', '飛': '飞', '風': '风',
        '服': '服', '副': '副', '改': '改', '幹': '干', '剛': '刚', '個': '个', '給': '给',
        '根': '根', '公': '公', '工': '工', '關': '关', '觀': '观', '國': '国', '過': '过',
        '還': '还', '漢': '汉', '好': '好', '號': '号', '合': '合', '和': '和', '後': '后',
        '會': '会', '畫': '画', '劃': '划', '話': '话', '壞': '坏', '歡': '欢', '回': '回',
        '機': '机', '基': '基', '級': '级', '極': '极', '幾': '几', '計': '计', '記': '记',
        '際': '际', '家': '家', '價': '价', '駕': '驾', '檢': '检', '簡': '简', '見': '见',
        '件': '件', '建': '建', '將': '将', '講': '讲', '教': '教', '階': '阶', '節': '节',
        '結': '结', '姐': '姐', '解': '解', '界': '界', '金': '金', '進': '进', '近': '近',
        '經': '经', '精': '精', '酒': '酒', '舊': '旧', '舉': '举', '據': '据', '卷': '卷',
        '覺': '觉', '開': '开', '看': '看', '考': '考', '科': '科', '可': '可', '客': '客',
        '課': '课', '空': '空', '口': '口', '塊': '块', '來': '来', '老': '老', '樂': '乐',
        '離': '离', '裡': '里', '理': '理', '力': '力', '歷': '历', '立': '立', '兩': '两',
        '亮': '亮', '林': '林', '臨': '临', '路': '路', '錄': '录', '論': '论', '媽': '妈',
        '馬': '马', '嗎': '吗', '買': '买', '賣': '卖', '滿': '满', '毛': '毛', '麼': '么',
        '沒': '没', '美': '美', '們': '们', '麵': '面', '民': '民', '名': '名', '明': '明',
        '能': '能', '你': '你', '年': '年', '鳥': '鸟', '牛': '牛', '農': '农', '歐': '欧',
        '盤': '盘', '旁': '旁', '培': '培', '朋': '朋', '片': '片', '平': '平', '蘋': '苹',
        '憑': '凭', '七': '七', '期': '期', '齊': '齐', '起': '起', '氣': '气', '千': '千',
        '錢': '钱', '前': '前', '槍': '枪', '強': '强', '區': '区', '曲': '曲', '全': '全',
        '權': '权', '確': '确', '卻': '却', '讓': '让', '熱': '热', '人': '人', '認': '认',
        '日': '日', '榮': '荣', '容': '容', '肉': '肉', '三': '三', '色': '色', '山': '山',
        '傷': '伤', '商': '商', '上': '上', '少': '少', '社': '社', '設': '设', '書': '书',
        '術': '术', '樹': '树', '雙': '双', '誰': '谁', '水': '水', '稅': '税', '說': '说',
        '思': '思', '四': '四', '送': '送', '雖': '虽', '歲': '岁', '孫': '孙', '體': '体',
        '天': '天', '條': '条', '鐵': '铁', '聽': '听', '通': '通', '同': '同', '頭': '头',
        '圖': '图', '團': '团', '外': '外', '萬': '万', '網': '网', '往': '往', '為': '为',
        '問': '问', '無': '无', '五': '五', '務': '务', '物': '物', '西': '西', '系': '系',
        '戲': '戏', '細': '细', '蝦': '虾', '下': '下', '夏': '夏', '先': '先', '線': '线',
        '縣': '县', '鄉': '乡', '相': '相', '想': '想', '向': '向', '小': '小', '校': '校',
        '些': '些', '寫': '写', '謝': '谢', '心': '心', '新': '新', '信': '信', '行': '行',
        '形': '形', '型': '型', '姓': '姓', '興': '兴', '學': '学', '雪': '雪', '言': '言',
        '陽': '阳', '樣': '样', '藥': '药', '要': '要', '爺': '爷', '業': '业', '一': '一',
        '醫': '医', '已': '已', '以': '以', '藝': '艺', '義': '义', '議': '议', '英': '英',
        '應': '应', '營': '营', '影': '影', '遊': '游', '友': '友', '有': '有', '右': '右',
        '魚': '鱼', '於': '于', '語': '语', '元': '元', '原': '原', '員': '员', '園': '园',
        '圓': '圆', '遠': '远', '願': '愿', '約': '约', '月': '月', '越': '越', '雲': '云',
        '運': '运', '再': '再', '在': '在', '造': '造', '則': '则', '責': '责', '戰': '战',
        '張': '张', '長': '长', '這': '这', '真': '真', '證': '证', '政': '政', '知': '知',
        '之': '之', '織': '织', '職': '职', '直': '直', '只': '只', '質': '质', '中': '中',
        '種': '种', '眾': '众', '重': '重', '周': '周', '主': '主', '住': '住', '助': '助',
        '專': '专', '裝': '装', '準': '准', '資': '资', '子': '子', '字': '字', '自': '自',
        '總': '总', '走': '走', '族': '族', '組': '组', '作': '作', '做': '做', '臺': '台',
        '體': '体', '豐': '丰', '鳳': '凤', '剛': '刚', '彥': '彦', '華': '华', '黃': '黄',
        '龍': '龙', '龜': '龟', '龍': '龙', '鵬': '鹏', '麗': '丽', '寶': '宝', '實': '实',
        '爾': '尔', '轉': '转', '動': '动', '門': '门', '問': '问', '間': '间', '閒': '闲',
        '聞': '闻', '閱': '阅', '開': '开', '關': '关', '鬥': '斗', '鬧': '闹', '頭': '头',
        '類': '类', '顧': '顾', '飛': '飞', '食': '食', '飲': '饮', '首': '首', '香': '香',
        '馬': '马', '騎': '骑', '驚': '惊', '骨': '骨', '高': '高', '鬼': '鬼', '魚': '鱼',
        '鮮': '鲜', '鳥': '鸟', '鹽': '盐', '麥': '麦', '麻': '麻', '黃': '黄', '黎': '黎',
        '黑': '黑', '默': '默', '鼓': '鼓', '鼠': '鼠', '鼻': '鼻', '齊': '齐', '齒': '齿',
        '龍': '龙', '龜': '龟'
    };

    // Build simplified to traditional map
    const simplifiedMap = {};
    for (const [trad, simp] of Object.entries(traditionalMap)) {
        if (!simplifiedMap[simp] || traditionalMap[simplifiedMap[simp]] !== simp) {
            simplifiedMap[simp] = trad;
        }
    }

    // Traditional to Simplified conversion
    function traditionalToSimplified(text) {
        return text.split('').map(char => traditionalMap[char] || char).join('');
    }

    // Simplified to Traditional conversion
    function simplifiedToTraditional(text) {
        return text.split('').map(char => simplifiedMap[char] || char).join('');
    }

    // Apply transform
    function applyTransform(transformName) {
        const input = elements.inputText.value;

        if (!input.trim()) {
            elements.outputText.value = '';
            updateCharCount();
            return;
        }

        const transformFn = transforms[transformName];
        if (transformFn) {
            try {
                elements.outputText.value = transformFn(input);
            } catch (e) {
                elements.outputText.value = '转换错误: ' + e.message;
            }
        }

        updateCharCount();
    }

    // Update character count
    function updateCharCount() {
        const inputLen = elements.inputText.value.length;
        const outputLen = elements.outputText.value.length;
        elements.charCount.textContent = `输入: ${inputLen} 字符 | 输出: ${outputLen} 字符`;
    }

    // Show toast notification
    function showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Clear input
    function clearInput() {
        elements.inputText.value = '';
        elements.outputText.value = '';
        updateCharCount();
        elements.inputText.focus();
    }

    // Copy output
    async function copyOutput() {
        const output = elements.outputText.value;

        if (!output) {
            showToast('没有内容可复制');
            return;
        }

        try {
            await navigator.clipboard.writeText(output);
            showToast('已复制到剪贴板');
        } catch (e) {
            showToast('复制失败');
        }
    }

    // Swap input and output
    function swapContent() {
        const temp = elements.inputText.value;
        elements.inputText.value = elements.outputText.value;
        elements.outputText.value = temp;
        updateCharCount();
    }

    // Event Listeners
    // Transform buttons
    elements.transformBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state from all buttons
            elements.transformBtns.forEach(b => b.classList.remove('active'));
            // Add active state to clicked button
            btn.classList.add('active');

            applyTransform(btn.dataset.transform);
        });
    });

    // Clear input button
    elements.clearInput.addEventListener('click', clearInput);

    // Copy output button
    elements.copyOutput.addEventListener('click', copyOutput);

    // Swap button
    elements.swapBtn.addEventListener('click', swapContent);

    // Input text - update character count
    elements.inputText.addEventListener('input', updateCharCount);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Shift + C to copy output
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === 'C') {
            e.preventDefault();
            copyOutput();
        }

        // Ctrl/Cmd + Shift + S to swap
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === 'S') {
            e.preventDefault();
            swapContent();
        }

        // Escape to clear
        if (e.key === 'Escape') {
            clearInput();
        }
    });

    // Initialize
    updateCharCount();
})();

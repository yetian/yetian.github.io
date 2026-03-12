/**
 * 五行穿衣 - 核心逻辑
 * 基于八字五行、血型和天气推荐穿衣搭配
 */

// 全局数据存储
let lunarData = {};
let fiveElementData = {};
let zodiacData = {};
let bloodTypeData = {};
let dressingRules = {};

// 加载所有数据文件
async function loadAllData() {
    try {
        const [
            lunarResponse,
            fiveElementResponse,
            zodiacResponse,
            bloodTypeResponse,
            dressingRulesResponse
        ] = await Promise.all([
            fetch('data/lunar-calendar.json'),
            fetch('data/five-element.json'),
            fetch('data/zodiac.json'),
            fetch('data/blood-type.json'),
            fetch('data/dressing-rules.json')
        ]);

        lunarData = await lunarResponse.json();
        fiveElementData = await fiveElementResponse.json();
        zodiacData = await zodiacResponse.json();
        bloodTypeData = await bloodTypeResponse.json();
        dressingRules = await dressingRulesResponse.json();

        console.log('数据加载完成');
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('数据加载失败，请确保所有数据文件存在。');
    }
}

// 天干地支索引
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const branchTimeMap = {
    '子时': { branch: '子', startHour: 23 },
    '丑时': { branch: '丑', startHour: 1 },
    '寅时': { branch: '寅', startHour: 3 },
    '卯时': { branch: '卯', startHour: 5 },
    '辰时': { branch: '辰', startHour: 7 },
    '巳时': { branch: '巳', startHour: 9 },
    '午时': { branch: '午', startHour: 11 },
    '未时': { branch: '未', startHour: 13 },
    '申时': { branch: '申', startHour: 15 },
    '酉时': { branch: '酉', startHour: 17 },
    '戌时': { branch: '戌', startHour: 19 },
    '亥时': { branch: '亥', startHour: 21 }
};

// 计算阳历转阴历
function solarToLunar(year, month, day) {
    // 简化的阳历转阴历算法
    // 实际上需要更复杂的农历计算，这里使用简化版本

    // 计算该年春节的日期（简化）
    const springFestivalInfo = getSpringFestivalInfo(year);

    // 简单的农历月日计算
    const springMonth = springFestivalInfo.month;
    const springDay = springFestivalInfo.day;

    // 计算距离春节的天数
    const springDate = new Date(year, springMonth - 1, springDay);
    const currentDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((currentDate - springDate) / (1000 * 60 * 60 * 24));

    let lunarMonth = 1;
    let lunarDay = 1;
    let isLeapMonth = false;

    if (daysDiff >= 0) {
        // 春节后
        lunarDay = springDay + daysDiff;
        // 简化处理：假设每月30天
        lunarMonth = 1 + Math.floor(lunarDay / 30);
        lunarDay = lunarDay % 30 || 30;
    } else {
        // 春节前（去年）
        const prevYear = year - 1;
        const prevSpringInfo = getSpringFestivalInfo(prevYear);
        const prevSpringDate = new Date(prevYear, prevSpringInfo.month - 1, prevSpringInfo.day);
        const daysInYear = 354; // 农历年天数
        lunarDay = daysInYear + daysDiff;
        lunarMonth = 12;
    }

    return {
        year: year,
        month: lunarMonth,
        day: lunarDay,
        isLeapMonth: isLeapMonth
    };
}

// 获取春节日期（简化版）
function getSpringFestivalInfo(year) {
    // 简化：春节基本在1月21日到2月20日之间
    // 使用更精确的数据
    const festivalDates = {
        1900: { month: 1, day: 26 },
        1950: { month: 2, day: 17 },
        2000: { month: 2, day: 5 },
        2010: { month: 2, day: 14 },
        2020: { month: 1, day: 25 },
        2030: { month: 2, day: 12 },
        2040: { month: 1, day: 30 },
        2050: { month: 2, day: 17 },
        2060: { month: 2, day: 5 },
        2070: { month: 2, day: 14 },
        2080: { month: 1, day: 31 },
        2090: { month: 2, day: 18 },
        2100: { month: 2, day: 6 }
    };

    // 找到最近的已知年份
    let baseYear = Math.floor(year / 10) * 10;
    if (!festivalDates[baseYear]) {
        baseYear = Math.floor(year / 10) * 10 - 10;
    }

    const base = festivalDates[baseYear] || { month: 1, day: 25 };
    // 调整以适应实际年份
    const yearDiff = year - baseYear;
    const adjustedDay = base.day + yearDiff;

    // 春节日期随年份会有规律性变化，这里是简化
    return {
        month: adjustedDay > 28 ? 2 : 1,
        day: adjustedDay > 31 ? adjustedDay - 30 : adjustedDay
    };
}

// 计算八字
function calculateBazi(year, month, day, hour, timeBranch) {
    // 年柱：年天干 + 年地支
    const yearStemIndex = (year - 4) % 10;
    const yearBranchIndex = (year - 4) % 12;
    const yearStem = heavenlyStems[yearStemIndex];
    const yearBranch = earthlyBranches[yearBranchIndex];
    const yearPillar = yearStem + yearBranch;

    // 月柱：使用五虎遁口诀简化公式
    // 月干 = (年干×2 + 月) % 10
    const monthStemIndex = (yearStemIndex * 2 + month) % 10;
    const monthStem = heavenlyStems[monthStemIndex];
    const monthBranchIndex = (month + 1) % 12;
    const monthBranch = earthlyBranches[monthBranchIndex];
    const monthPillar = monthStem + monthBranch;

    // 日柱：使用蔡勒公式简化
    const dayPillar = calculateDayPillar(year, month, day);

    // 时柱
    const timeBranchChar = branchTimeMap[timeBranch]?.branch || '子';
    const dayStemIndex = heavenlyStems.indexOf(dayPillar.charAt(0));
    const timeBranchIdx = earthlyBranches.indexOf(timeBranchChar);
    const timeStemIndex = (dayStemIndex * 2 + timeBranchIdx + 2) % 10;
    const timeStem = heavenlyStems[timeStemIndex];
    const timePillar = timeStem + timeBranchChar;

    return {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        time: timePillar
    };
}

// 计算日柱（简化版）
function calculateDayPillar(year, month, day) {
    // 使用简化算法
    // 基准日期：1900年1月1日是甲子日
    const baseDate = new Date(1900, 0, 1);
    const currentDate = new Date(year, month - 1, day);
    const daysPassed = Math.floor((currentDate - baseDate) / (1000 * 60 * 60 * 24));

    const stemIndex = daysPassed % 10;
    const branchIndex = daysPassed % 12;

    return heavenlyStems[stemIndex] + earthlyBranches[branchIndex];
}

// 获取八字对应的五行
function getBaziElement(pillar) {
    const stem = pillar.charAt(0);
    const branch = pillar.charAt(1);

    // 从天干获取五行
    const stemElement = fiveElementData.heavenlyStems?.find(s => s.name === stem)?.element ||
                       fiveElementData.stemBranchElements?.[pillar] || '土';

    return stemElement;
}

// 计算姓名五行（两种方法结合）
function calculateNameElement(name) {
    if (!name || name.length === 0) return '土';

    const firstChar = name.charAt(0);

    // 方法1：偏旁部首法
    let elementFromRadical = fiveElementData.characterElements?.[firstChar];

    // 方法2：笔画数法
    let elementFromStroke = null;
    const strokeNum = fiveElementData.strokeNumbers?.[firstChar];

    if (strokeNum !== undefined) {
        // 根据笔画数确定五行
        const mod = strokeNum % 10;
        if (mod <= 1) elementFromStroke = '土';
        else if (mod <= 3) elementFromStroke = '木';
        else if (mod <= 5) elementFromStroke = '水';
        else if (mod <= 7) elementFromStroke = '火';
        else if (mod <= 9) elementFromStroke = '金';
    }

    // 两种方法结合
    // 如果两种方法都找不到，默认使用偏旁的
    if (!elementFromRadical) {
        elementFromRadical = elementFromStroke || '土';
    }

    // 如果有两种结果，综合判断
    if (elementFromRadical && elementFromStroke && elementFromRadical !== elementFromStroke) {
        // 根据名字长度选择不同的权重
        // 名字越长，第一个字的影响越小
        const weights = {
            1: { radical: 0.7, stroke: 0.3 },
            2: { radical: 0.5, stroke: 0.5 }
        };

        // 这里简单返回偏旁的结果，实际应用可以更复杂
        return elementFromRadical;
    }

    return elementFromRadical || '土';
}

// 计算喜用神
function calculateFavorableElement(bazi) {
    // 简化的喜用神计算
    // 统计八字中各五行数量
    const elements = {
        木: 0, 火: 0, 土: 0, 金: 0, 水: 0
    };

    const pillars = [bazi.year, bazi.month, bazi.day, bazi.time];
    pillars.forEach(pillar => {
        const stemElement = getBaziElement(pillar);
        const branchElement = fiveElementData.earthlyBranches?.find(b => b.name === pillar.charAt(1))?.element;
        elements[stemElement] = (elements[stemElement] || 0) + 1;
        if (branchElement) elements[branchElement] = (elements[branchElement] || 0) + 0.5;
    });

    // 找出最弱和最强的五行
    let minCount = Infinity;
    let maxCount = -Infinity;
    let minElement = '木';
    let maxElement = '木';

    for (const [element, count] of Object.entries(elements)) {
        if (count < minCount) {
            minCount = count;
            minElement = element;
        }
        if (count > maxCount) {
            maxCount = count;
            maxElement = element;
        }
    }

    // 喜用神通常是八字中最弱的五行
    // 但如果日主本身很弱，则喜用神要帮扶日主
    const dayElement = getBaziElement(bazi.day);
    const dayElementCount = elements[dayElement];

    // 如果日主本身较弱，则用神是日主
    if (dayElementCount < 1.5) {
        return dayElement;
    }

    // 否则喜用神是八字中最弱的
    return minElement;
}

// 获取星座
function getZodiac(month, day) {
    const zodiacList = zodiacData.zodiac || [];
    const date = new Date(2000, month - 1, day); // 使用2000年作为参考

    for (const zodiac of zodiacList) {
        const startDate = new Date(2000, zodiac.startMonth - 1, zodiac.startDay);
        const endDate = new Date(2000, zodiac.endMonth - 1, zodiac.endDay);

        // 处理跨年的情况
        if (zodiac.endMonth < zodiac.startMonth) {
            if (date >= startDate || date <= endDate) {
                return zodiac;
            }
        } else {
            if (date >= startDate && date <= endDate) {
                return zodiac;
            }
        }
    }

    return zodiacList[0]; // 默认返回第一个
}

// 获取穿衣推荐
function getDressingRecommendation(bazi, nameElement, bloodType, weather, zodiac) {
    const fiveElement = getBaziElement(bazi.day);
    const favorableElement = calculateFavorableElement(bazi);

    // 获取各因素的颜色推荐
    const elementColors = fiveElementData.elements?.[fiveElement]?.color || [];
    const favorableColors = fiveElementData.elements?.[favorableElement]?.color || elementColors;
    const bloodColors = bloodTypeData.bloodTypes?.[bloodType]?.recommendedColors || [];
    const weatherData = dressingRules.weatherConditions?.[weather] || {};
    const weatherColors = weatherData.recommendedColors || [];

    // 综合颜色推荐（去重并优先顺序）
    const colorPriority = [...new Set([...favorableColors, ...weatherColors, ...bloodColors, ...elementColors])];

    // 获取款式建议
    const styles = [];

    // 星座风格
    if (zodiac?.clothingStyle) {
        styles.push(...zodiac.clothingStyle);
    }

    // 血型风格
    if (bloodTypeData.bloodTypes?.[bloodType]?.clothingStyle) {
        styles.push(...bloodTypeData.bloodTypes[bloodType].clothingStyle);
    }

    // 五行风格
    const elementRules = dressingRules.fiveElementRules?.[favorableElement];
    if (elementRules?.styleAdvice) {
        styles.push(elementRules.styleAdvice);
    }

    // 天气建议
    if (weatherData.clothingTips) {
        // 已经包含在下面的clothingTips中
    }

    // 材质建议
    const materials = [];
    if (weatherData.material) {
        materials.push(weatherData.material);
    }
    if (elementRules) {
        materials.push('高品质材质');
    }

    // 配饰建议
    const accessories = bloodTypeData.bloodTypes?.[bloodType]?.accessories || [];

    // 生成运势建议
    const dailyAdvice = generateDailyAdvice(fiveElement, favorableElement, weather, zodiac);

    return {
        colors: colorPriority.slice(0, 6), // 最多6个颜色
        styles: [...new Set(styles)],
        materials: [...new Set(materials)],
        accessories: [...new Set(accessories)],
        dailyAdvice: dailyAdvice,
        intro: `根据您的八字五行${fiveElement}、喜用神${favorableElement}，结合${weatherData.description || '当前天气'}和您的${bloodType}型血特点，为您推荐今日穿衣搭配。`
    };
}

// 生成每日运势建议
function generateDailyAdvice(fiveElement, favorableElement, weather, zodiac) {
    let advice = [];

    // 五行建议
    const elementRule = dressingRules.fiveElementRules?.[favorableElement];
    if (elementRule) {
        advice.push(elementRule.colorAdvice);
    }

    // 天气建议
    const weatherRule = dressingRules.weatherConditions?.[weather];
    if (weatherRule) {
        advice.push(weatherRule.advice);
    }

    // 星座幸运
    if (zodiac?.luckyNumber) {
        advice.push(`今天的幸运数字是${zodiac.luckyNumber.join('、')}，可以佩戴相关数字的饰品。`);
    }

    return advice.join(' ');
}

// 保存信息到localStorage
function saveUserInfo() {
    const formData = {
        name: document.getElementById('name').value,
        birthdate: document.getElementById('birthdate').value,
        birthtime: document.getElementById('birthtime').value,
        gender: document.getElementById('gender').value,
        'blood-type': document.getElementById('blood-type').value,
        city: document.getElementById('city').value,
        weather: document.getElementById('weather').value
    };

    // 检查必填字段
    if (!formData.name || !formData.birthdate || !formData.birthtime ||
        !formData.gender || !formData['blood-type'] || !formData.city || !formData.weather) {
        alert('请填写所有必填项后再保存');
        return false;
    }

    try {
        localStorage.setItem('wuxing_user_info', JSON.stringify(formData));

        // 显示保存成功
        const saveBtn = document.getElementById('save-btn');
        saveBtn.textContent = '✓ 已保存';
        saveBtn.classList.add('saved');

        setTimeout(() => {
            saveBtn.textContent = '保存信息';
            saveBtn.classList.remove('saved');
        }, 2000);

        return true;
    } catch (e) {
        console.error('保存失败:', e);
        alert('保存失败，请检查浏览器设置');
        return false;
    }
}

// 从localStorage加载信息
function loadUserInfo() {
    try {
        const saved = localStorage.getItem('wuxing_user_info');
        if (saved) {
            const formData = JSON.parse(saved);

            document.getElementById('name').value = formData.name || '';
            document.getElementById('birthdate').value = formData.birthdate || '';
            document.getElementById('birthtime').value = formData.birthtime || '';
            document.getElementById('gender').value = formData.gender || '';
            document.getElementById('blood-type').value = formData['blood-type'] || '';
            document.getElementById('city').value = formData.city || '';
            document.getElementById('weather').value = formData.weather || '';

            return true;
        }
    } catch (e) {
        console.error('加载失败:', e);
    }
    return false;
}

// 计算八字元素的详细统计
function getElementStats(bazi) {
    const elements = {
        木: 0, 火: 0, 土: 0, 金: 0, 水: 0
    };

    const pillars = [bazi.year, bazi.month, bazi.day, bazi.time];
    pillars.forEach(pillar => {
        const stem = pillar.charAt(0);
        const branch = pillar.charAt(1);

        // 天干五行
        const stemElement = fiveElementData.heavenlyStems?.find(s => s.name === stem)?.element;
        if (stemElement) elements[stemElement] += 1;

        // 地支五行
        const branchElement = fiveElementData.earthlyBranches?.find(b => b.name === branch)?.element;
        if (branchElement) elements[branchElement] += 0.5;
    });

    return elements;
}

// 生成五行平衡分析
function generateElementBalance(bazi) {
    const elements = getElementStats(bazi);
    const dayElement = getBaziElement(bazi.day);

    // 找出最强和最弱的元素
    let maxElement = '木', maxVal = 0;
    let minElement = '木', minVal = Infinity;

    for (const [el, val] of Object.entries(elements)) {
        if (val > maxVal) { maxVal = val; maxElement = el; }
        if (val < minVal) { minVal = val; minElement = el; }
    }

    // 生成柱状图HTML
    const elementColors = {
        '木': '#4caf50',
        '火': '#f44336',
        '土': '#ff9800',
        '金': '#9c27b0',
        '水': '#2196f3'
    };

    const maxHeight = 80; // 最大高度百分比

    let barsHtml = '';
    for (const [el, val] of Object.entries(elements)) {
        const height = Math.min((val / 2) * maxHeight, maxHeight);
        barsHtml += `
            <div class="element-bar">
                <div class="bar-container">
                    <div class="bar-fill" style="height: ${height}%; background: ${elementColors[el]}"></div>
                </div>
                <span class="element-name">${el}</span>
                <span class="element-count">${val.toFixed(1)}</span>
            </div>
        `;
    }

    // 生成描述
    let description = '';
    if (maxElement === dayElement) {
        description = `您的日主为<span class="highlight">${dayElement}</span>，八字中${dayElement}元素较强，说明您是一个很有活力和执行力的人。`;
    } else if (minElement === dayElement) {
        description = `您的日主为<span class="highlight">${dayElement}</span>，但八字中${dayElement}元素较弱，建议多穿戴<span class="highlight">${elementColors[dayElement] ? fiveElementData.elements?.[dayElement]?.color?.[0] : dayElement}</span>色系的衣物来增强运势。`;
    } else {
        description = `您的日主为<span class="highlight">${dayElement}</span>，八字中<span class="highlight">${maxElement}</span>元素最为旺盛，<span class="highlight">${minElement}</span>元素相对较弱。建议通过穿衣搭配来平衡五行。`;
    }

    return {
        barsHtml,
        description
    };
}

// 生成八字详细解读
function generateBaziDetail(bazi, zodiac, nameElement) {
    const dayElement = getBaziElement(bazi.day);
    const favorableElement = calculateFavorableElement(bazi);

    const elementDescriptions = {
        '木': '木代表生发、成长，您可能具有创新思维和领导潜质',
        '火': '火代表热情、活力，您可能具有感染力和行动力',
        '土': '土代表稳重、承载，您可能具有责任感和稳定性',
        '金': '金代表刚毅、决断，您可能具有执行力和判断力',
        '水': '水代表智慧、流动，您可能具有适应力和智慧'
    };

    let detailHtml = `
        <p>您的日柱为<span class="highlight">${bazi.day}</span>，日主五行属<span class="highlight">${dayElement}</span>。${elementDescriptions[dayElement] || ''}</p>
        <p>您的姓名五行属<span class="highlight">${nameElement}</span>，这与您的八字相互影响。</p>
        <p>您的喜用神为<span class="highlight">${favorableElement}</span>，今天建议多接触对应五行的元素。</p>
        <p>您的星座是<span class="highlight">${zodiac?.name || '未知'}</span>（${zodiac?.element}座），${zodiac?.characteristics || ''}</p>
    `;

    return detailHtml;
}

// 生成开运建议
function generateLuckAdvice(bazi, weather, bloodType, zodiac) {
    const favorableElement = calculateFavorableElement(bazi);
    const dayElement = getBaziElement(bazi.day);

    const advices = [];

    // 五行开运
    const elementRule = dressingRules.fiveElementRules?.[favorableElement];
    if (elementRule) {
        advices.push({
            icon: '🌟',
            title: '五行开运',
            desc: elementRule.colorAdvice + ' ' + elementRule.styleAdvice
        });
    }

    // 幸运方位
    const directions = { '木': '东方', '火': '南方', '土': '中央', '金': '西方', '水': '北方' };
    advices.push({
        icon: '🧭',
        title: '幸运方位',
        desc: `今天${directions[favorableElement] || '中央'}是您的幸运方位，有时间可以往这个方向走走。`
    });

    // 血型建议
    const bloodAdvice = bloodTypeData.bloodTypes?.[bloodType]?.advice;
    if (bloodAdvice) {
        advices.push({
            icon: '💉',
            title: '血型提醒',
            desc: bloodAdvice
        });
    }

    // 天气建议
    const weatherData = dressingRules.weatherConditions?.[weather];
    if (weatherData?.advice) {
        advices.push({
            icon: '🌤️',
            title: '天气提醒',
            desc: weatherData.advice
        });
    }

    // 星座幸运
    if (zodiac?.luckyNumber) {
        advices.push({
            icon: '🔢',
            title: '幸运数字',
            desc: `今天的幸运数字是 ${zodiac.luckyNumber.join('、')}，可以关注这些数字。`
        });
    }

    let html = '';
    advices.forEach(advice => {
        html += `
            <div class="luck-item">
                <span class="luck-icon">${advice.icon}</span>
                <div class="luck-content">
                    <div class="luck-title">${advice.title}</div>
                    <div class="luck-desc">${advice.desc}</div>
                </div>
            </div>
        `;
    });

    return html;
}

// 获取穿衣禁忌
function getAvoidAdvice(bazi, weather, bloodType) {
    const dayElement = getBaziElement(bazi.day);
    const favorableElement = calculateFavorableElement(bazi);

    const avoids = [];

    // 五行禁忌
    const elementRules = dressingRules.fiveElementRules?.[favorableElement];
    if (elementRules?.avoid) {
        avoids.push(`避免穿戴${elementRules.avoid}色系的衣物`);
    }

    // 天气禁忌
    if (weather === '雨' || weather === '雪' || weather === '雷雨') {
        avoids.push('避免穿戴过于轻薄的衣物，注意保暖防潮');
    }

    if (weather === '晴' && dayElement === '火') {
        avoids.push('今天阳气较旺，避免穿戴过多红色衣物');
    }

    // 血型禁忌
    const bloodAvoid = bloodTypeData.bloodTypes?.[bloodType]?.avoidColors;
    if (bloodAvoid && bloodAvoid.length > 0) {
        avoids.push(`避免${bloodAvoid.join('、')}的颜色`);
    }

    // 一般禁忌
    avoids.push('避免穿戴与今日喜用神相克的颜色');

    let html = '';
    avoids.forEach(avoid => {
        html += `<div class="avoid-item">${avoid}</div>`;
    });

    return html;
}

// 格式化结果显示
function displayResults(data) {
    const {
        name,
        bazi,
        nameElement,
        zodiac,
        bloodType,
        city,
        weather,
        recommendation
    } = data;

    // 基本信息
    document.getElementById('result-name').textContent = name;
    document.getElementById('result-zodiac').textContent = zodiac?.name || '未知';
    document.getElementById('result-blood').textContent = bloodTypeData.bloodTypes?.[bloodType]?.name || bloodType;
    document.getElementById('result-city').textContent = city;
    document.getElementById('result-weather').textContent = weather;

    // 八字
    document.getElementById('bazi-year').textContent = bazi.year;
    document.getElementById('bazi-month').textContent = bazi.month;
    document.getElementById('bazi-day').textContent = bazi.day;
    document.getElementById('bazi-time').textContent = bazi.time;

    // 五行信息
    const dayElement = getBaziElement(bazi.day);
    document.getElementById('day-element').textContent = dayElement;
    document.getElementById('name-element').textContent = nameElement;
    const favorableElement = calculateFavorableElement(bazi);
    document.getElementById('favorable-element').textContent = favorableElement;

    // 五行平衡分析
    const balance = generateElementBalance(bazi);
    document.getElementById('element-balance').innerHTML = balance.barsHtml;
    document.getElementById('balance-description').innerHTML = balance.description;

    // 八字详细解读
    document.getElementById('bazi-detail').innerHTML = generateBaziDetail(bazi, zodiac, nameElement);

    // 开运建议
    document.getElementById('luck-advice').innerHTML = generateLuckAdvice(bazi, weather, bloodType, zodiac);

    // 穿衣推荐
    document.getElementById('dressing-intro').textContent = recommendation.intro;

    // 颜色块
    const colorContainer = document.getElementById('recommended-colors');
    colorContainer.innerHTML = '';
    recommendation.colors.forEach(color => {
        const colorBlock = document.createElement('div');
        colorBlock.className = 'color-block';
        colorBlock.innerHTML = `
            <span class="color-swatch" style="background: ${getColorHex(color)}"></span>
            <span>${color}</span>
        `;
        colorContainer.appendChild(colorBlock);
    });

    // 款式建议
    const styleList = document.getElementById('style-advice');
    styleList.innerHTML = '';
    recommendation.styles.forEach(style => {
        const li = document.createElement('li');
        li.textContent = style;
        styleList.appendChild(li);
    });

    // 材质建议
    const materialList = document.getElementById('material-advice');
    materialList.innerHTML = '';
    recommendation.materials.forEach(material => {
        const li = document.createElement('li');
        li.textContent = material;
        materialList.appendChild(li);
    });

    // 配饰建议
    const accessoryList = document.getElementById('accessory-advice');
    accessoryList.innerHTML = '';
    recommendation.accessories.forEach(accessory => {
        const li = document.createElement('li');
        li.textContent = accessory;
        accessoryList.appendChild(li);
    });

    // 穿衣禁忌
    document.getElementById('avoid-advice').innerHTML = getAvoidAdvice(bazi, weather, bloodType);

    // 每日建议
    document.getElementById('daily-advice').textContent = recommendation.dailyAdvice;

    // 显示结果区域
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
}

// 颜色名称转十六进制
function getColorHex(colorName) {
    const colorMap = {
        '红': '#FF0000',
        '橙': '#FFA500',
        '黄': '#FFD700',
        '绿': '#00FF00',
        '青': '#00CED1',
        '蓝': '#0000FF',
        '紫': '#800080',
        '白': '#FFFFFF',
        '银': '#C0C0C0',
        '金': '#FFD700',
        '黑': '#000000',
        '灰': '#808080',
        '棕': '#8B4513',
        '米': '#F5DEB3',
        '浅蓝': '#87CEEB',
        '浅绿': '#90EE90',
        '粉红': '#FFC0CB',
        '深蓝': '#00008B',
        '深绿': '#006400',
        '翠': '#00FF7F',
        '墨绿': '#2F4F4F',
        '淡蓝': '#ADD8E6',
        '淡绿': '#98FB98',
        '浅紫': '#D8BFD8',
        '淡粉': '#FFB6C1',
        '橙色': '#FFA500',
        '粉色': '#FFC0CB',
        '白色': '#FFFFFF',
        '浅色': '#F0F0F0',
        '亮色': '#FFFF00',
        '浅黄': '#FFFFE0',
        '浅灰': '#D3D3D3',
        '米色': '#F5F5DC',
        '驼色': '#C19A6B',
        '卡其': '#F0E68C'
    };

    return colorMap[colorName] || colorMap[colorName.replace('色', '')] || '#888888';
}

// 重置表单
function resetForm() {
    document.getElementById('wuxing-form').reset();
    document.getElementById('result-section').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 表单提交处理
function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const name = formData.get('name').trim();
    const birthdate = formData.get('birthdate');
    const timeBranch = formData.get('birthtime');
    const gender = formData.get('gender');
    const bloodType = formData.get('blood-type');
    const city = formData.get('city').trim();
    const weather = formData.get('weather');

    if (!name || !birthdate || !timeBranch || !gender || !bloodType || !city || !weather) {
        alert('请填写所有必填项');
        return;
    }

    // 解析生日
    const birthParts = birthdate.split('-');
    const year = parseInt(birthParts[0]);
    const month = parseInt(birthParts[1]);
    const day = parseInt(birthParts[2]);

    // 假设出生时间为该时辰的中点（简化处理）
    const hour = branchTimeMap[timeBranch]?.startHour || 12;

    // 计算八字
    const bazi = calculateBazi(year, month, day, hour, timeBranch);

    // 计算姓名五行
    const nameElement = calculateNameElement(name);

    // 获取星座
    const zodiac = getZodiac(month, day);

    // 获取穿衣推荐
    const recommendation = getDressingRecommendation(bazi, nameElement, bloodType, weather, zodiac);

    // 显示结果
    displayResults({
        name,
        bazi,
        nameElement,
        zodiac,
        bloodType,
        city,
        weather,
        recommendation
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();

    const form = document.getElementById('wuxing-form');
    form.addEventListener('submit', handleFormSubmit);

    // 保存按钮点击事件
    document.getElementById('save-btn').addEventListener('click', saveUserInfo);

    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('birthdate').max = today;

    // 尝试加载保存的信息
    loadUserInfo();

    // 生成星星背景
    createStars();
});

// 生成星星背景
function createStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;

    // 创建静态星星
    const starCount = 60;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (3 + Math.random() * 3) + 's';
        starsContainer.appendChild(star);
    }

    // 创建流星 (只创建1-2个，减少负担)
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.top = (Math.random() * 50) + '%';
    shootingStar.style.left = (Math.random() * 30) + '%';
    shootingStar.style.animationDelay = (Math.random() * 5) + 's';
    starsContainer.appendChild(shootingStar);
}

document.addEventListener('DOMContentLoaded', () => {
    let hanziData = [];
    let writer;

    // 更新显示的汉字信息
    function updateCharacter(charData) {
        if (!charData) return;

        // 清空旧的汉字
        document.getElementById('character-target').innerHTML = '';

        // 创建新的 HanziWriter 实例
        writer = HanziWriter.create('character-target', charData.character, {
            width: 200,
            height: 200,
            padding: 5,
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 250,
        });
        writer.animateCharacter();

        // 更新拼音和意思
        document.getElementById('pinyin').textContent = `拼音: ${charData.pinyin}`;
        document.getElementById('definition').textContent = `意思: ${charData.definition}`;
    }

    // 显示一个随机汉字
    function showRandomCharacter() {
        if (hanziData.length === 0) return;
        const randomIndex = Math.floor(Math.random() * hanziData.length);
        const charData = hanziData[randomIndex];
        updateCharacter(charData);
    }

    // 搜索汉字
    function searchCharacter(char) {
        const charData = hanziData.find(entry => entry.character === char);
        if (charData) {
            updateCharacter(charData);
        } else {
            alert('没有找到这个汉字');
        }
    }

    // 加载汉字数据
    fetch('data/dictionary.json')
        .then(response => response.json())
        .then(data => {
            hanziData = data;
            // 初始加载时显示一个随机汉字
            showRandomCharacter();
        })
        .catch(error => {
            console.error('加载汉字数据出错:', error);
            alert('加载汉字数据失败，请确保 data/dictionary.json 文件存在。');
        });

    // 事件监听
    document.getElementById('random-button').addEventListener('click', showRandomCharacter);
    document.getElementById('replay-button').addEventListener('click', () => {
        if (writer) {
            writer.animateCharacter();
        }
    });

    document.getElementById('search-button').addEventListener('click', () => {
        const query = document.getElementById('search-input').value;
        if (query) {
            searchCharacter(query.trim());
        }
    });

    // 初始占位符
    writer = HanziWriter.create('character-target', '字', {
        width: 200,
        height: 200,
        padding: 5,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 250,
    });

    // 提示用户加载数据
    writer.quiz();

    // 可以在这里添加加载 dictionary.json 和实现随机显示功能的代码
});

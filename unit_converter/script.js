// Unit Converter - JavaScript
(function() {
    'use strict';

    // Unit Data
    const UNITS = {
        length: {
            name: '长度',
            units: {
                mm: { name: '毫米', factor: 0.001 },
                cm: { name: '厘米', factor: 0.01 },
                m: { name: '米', factor: 1 },
                km: { name: '千米', factor: 1000 },
                inch: { name: '英寸', factor: 0.0254 },
                foot: { name: '英尺', factor: 0.3048 },
                yard: { name: '码', factor: 0.9144 },
                mile: { name: '英里', factor: 1609.344 }
            },
            defaultFrom: 'm',
            defaultTo: 'foot'
        },
        weight: {
            name: '重量',
            units: {
                mg: { name: '毫克', factor: 0.001 },
                g: { name: '克', factor: 1 },
                kg: { name: '千克', factor: 1000 },
                pound: { name: '磅', factor: 453.592 },
                ounce: { name: '盎司', factor: 28.3495 },
                ton: { name: '公吨', factor: 1000000 }
            },
            defaultFrom: 'kg',
            defaultTo: 'pound'
        },
        temperature: {
            name: '温度',
            units: {
                celsius: { name: '摄氏度', symbol: '°C' },
                fahrenheit: { name: '华氏度', symbol: '°F' },
                kelvin: { name: '开尔文', symbol: 'K' }
            },
            defaultFrom: 'celsius',
            defaultTo: 'fahrenheit'
        },
        area: {
            name: '面积',
            units: {
                mm2: { name: '平方毫米', factor: 0.000001 },
                cm2: { name: '平方厘米', factor: 0.0001 },
                m2: { name: '平方米', factor: 1 },
                km2: { name: '平方千米', factor: 1000000 },
                hectare: { name: '公顷', factor: 10000 },
                acre: { name: '英亩', factor: 4046.86 },
                inch2: { name: '平方英寸', factor: 0.00064516 },
                foot2: { name: '平方英尺', factor: 0.092903 }
            },
            defaultFrom: 'm2',
            defaultTo: 'foot2'
        }
    };

    const FAVORITES_KEY = 'unit_converter_favorites';

    // DOM Elements
    const categoryTabs = document.getElementById('categoryTabs');
    const inputValue = document.getElementById('inputValue');
    const inputUnit = document.getElementById('inputUnit');
    const outputValue = document.getElementById('outputValue');
    const outputUnit = document.getElementById('outputUnit');
    const swapBtn = document.getElementById('swapBtn');
    const quickList = document.getElementById('quickList');
    const favoritesList = document.getElementById('favoritesList');
    const addFavorite = document.getElementById('addFavorite');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // State
    let currentCategory = 'length';
    let favorites = loadFavorites();

    // Initialize
    function init() {
        setupCategoryTabs();
        setupEventListeners();
        loadCategory(currentCategory);
        renderFavorites();
    }

    // Setup Category Tabs
    function setupCategoryTabs() {
        const tabs = categoryTabs.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                if (category === currentCategory) return;

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                currentCategory = category;
                loadCategory(category);
            });
        });
    }

    // Setup Event Listeners
    function setupEventListeners() {
        inputValue.addEventListener('input', convert);
        inputUnit.addEventListener('change', convert);
        outputUnit.addEventListener('change', convert);
        swapBtn.addEventListener('click', swapUnits);
        addFavorite.addEventListener('click', addToFavorites);
    }

    // Load Category
    function loadCategory(category) {
        const data = UNITS[category];

        // Populate unit selects
        inputUnit.innerHTML = '';
        outputUnit.innerHTML = '';

        Object.entries(data.units).forEach(([key, unit]) => {
            const optionFrom = document.createElement('option');
            optionFrom.value = key;
            optionFrom.textContent = unit.name;
            inputUnit.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = key;
            optionTo.textContent = unit.name;
            outputUnit.appendChild(optionTo);
        });

        // Set defaults
        inputUnit.value = data.defaultFrom;
        outputUnit.value = data.defaultTo;

        // Update quick conversions
        renderQuickConversions();

        // Convert
        convert();
    }

    // Convert
    function convert() {
        const value = parseFloat(inputValue.value);
        const fromUnit = inputUnit.value;
        const toUnit = outputUnit.value;

        if (isNaN(value)) {
            outputValue.value = '';
            return;
        }

        let result;

        if (currentCategory === 'temperature') {
            result = convertTemperature(value, fromUnit, toUnit);
        } else {
            const fromFactor = UNITS[currentCategory].units[fromUnit].factor;
            const toFactor = UNITS[currentCategory].units[toUnit].factor;
            result = (value * fromFactor) / toFactor;
        }

        // Format result
        if (Math.abs(result) < 0.0001 || Math.abs(result) > 999999999) {
            outputValue.value = result.toExponential(4);
        } else if (Number.isInteger(result)) {
            outputValue.value = result;
        } else {
            outputValue.value = parseFloat(result.toFixed(6));
        }
    }

    // Temperature Conversion
    function convertTemperature(value, from, to) {
        // First convert to Celsius
        let celsius;
        switch (from) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5 / 9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
        }

        // Then convert from Celsius to target
        switch (to) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return celsius * 9 / 5 + 32;
            case 'kelvin':
                return celsius + 273.15;
        }
    }

    // Swap Units
    function swapUnits() {
        const temp = inputUnit.value;
        inputUnit.value = outputUnit.value;
        outputUnit.value = temp;
        convert();
    }

    // Quick Conversions
    function renderQuickConversions() {
        const categoryData = UNITS[currentCategory];
        const unitKeys = Object.keys(categoryData.units);

        // Get a few common quick conversions
        const quickExamples = getQuickExamples(currentCategory);

        quickList.innerHTML = quickExamples.map(example => {
            const from = categoryData.units[example.from];
            const to = categoryData.units[example.to];
            const result = convertQuick(1, example.from, example.to, currentCategory);

            return `
                <div class="quick-item" data-from="${example.from}" data-to="${example.to}">
                    <span class="quick-from">1 ${from.name}</span>
                    <span class="quick-arrow">→</span>
                    <span class="quick-to">${result} ${to.name}</span>
                </div>
            `;
        }).join('');

        // Add click handlers
        quickList.querySelectorAll('.quick-item').forEach(item => {
            item.addEventListener('click', () => {
                inputUnit.value = item.dataset.from;
                outputUnit.value = item.dataset.to;
                convert();
            });
        });
    }

    function getQuickExamples(category) {
        switch (category) {
            case 'length':
                return [
                    { from: 'm', to: 'foot' },
                    { from: 'km', to: 'mile' },
                    { from: 'cm', to: 'inch' }
                ];
            case 'weight':
                return [
                    { from: 'kg', to: 'pound' },
                    { from: 'g', to: 'ounce' },
                    { from: 'kg', to: 'ounce' }
                ];
            case 'temperature':
                return [
                    { from: 'celsius', to: 'fahrenheit' },
                    { from: 'fahrenheit', to: 'celsius' },
                    { from: 'celsius', to: 'kelvin' }
                ];
            case 'area':
                return [
                    { from: 'm2', to: 'foot2' },
                    { from: 'hectare', to: 'acre' },
                    { from: 'km2', to: 'acre' }
                ];
        }
    }

    function convertQuick(value, from, to, category) {
        if (category === 'temperature') {
            return convertTemperature(value, from, to).toFixed(2);
        }
        const fromFactor = UNITS[category].units[from].factor;
        const toFactor = UNITS[category].units[to].factor;
        const result = (value * fromFactor) / toFactor;
        return result < 0.01 ? result.toExponential(2) : parseFloat(result.toFixed(2));
    }

    // Favorites
    function loadFavorites() {
        try {
            const saved = localStorage.getItem(FAVORITES_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        } catch {
            console.warn('Could not save favorites');
        }
    }

    function addToFavorites() {
        const from = inputUnit.value;
        const to = outputUnit.value;

        if (from === to) return;

        // Check if already exists
        const exists = favorites.some(f =>
            f.category === currentCategory && f.from === from && f.to === to
        );

        if (exists) {
            showNotification('已存在');
            return;
        }

        favorites.unshift({
            category: currentCategory,
            from: from,
            to: to
        });

        if (favorites.length > 10) {
            favorites = favorites.slice(0, 10);
        }

        saveFavorites();
        renderFavorites();
        showNotification('已添加收藏');
    }

    function renderFavorites() {
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="favorites-empty">暂无收藏</p>';
            return;
        }

        favoritesList.innerHTML = favorites.map((fav, index) => {
            const categoryData = UNITS[fav.category];
            const fromUnit = categoryData.units[fav.from];
            const toUnit = categoryData.units[fav.to];

            return `
                <div class="favorite-item" data-index="${index}">
                    <span class="favorite-text">${fromUnit.name} → ${toUnit.name}</span>
                    <button class="favorite-delete" data-index="${index}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        // Click handlers
        favoritesList.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.favorite-delete')) return;

                const index = parseInt(item.dataset.index);
                const fav = favorites[index];

                // Switch to category
                const tabs = categoryTabs.querySelectorAll('.tab');
                tabs.forEach(t => {
                    t.classList.toggle('active', t.dataset.category === fav.category);
                });
                currentCategory = fav.category;
                loadCategory(fav.category);

                // Set units
                inputUnit.value = fav.from;
                outputUnit.value = fav.to;
                convert();
            });
        });

        // Delete handlers
        favoritesList.querySelectorAll('.favorite-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                favorites.splice(index, 1);
                saveFavorites();
                renderFavorites();
            });
        });
    }

    // Notification
    function showNotification(text) {
        notificationText.textContent = text;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 1500);
    }

    // Initialize
    init();
})();

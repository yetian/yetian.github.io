// Decision Analyzer - JavaScript
(function() {
    'use strict';

    // Default factors for comparison
    const defaultFactors = [
        { name: '价格', scoreA: 5, scoreB: 5 },
        { name: '质量', scoreA: 5, scoreB: 5 },
        { name: '功能', scoreA: 5, scoreB: 5 },
        { name: '外观', scoreA: 5, scoreB: 5 },
        { name: '售后', scoreA: 5, scoreB: 5 }
    ];

    // State
    let state = {
        currentTab: 'swot',
        factors: [...defaultFactors]
    };

    // DOM Elements
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.panel');

    // SWOT Elements
    const swotTopic = document.getElementById('swotTopic');
    const strengths = document.getElementById('strengths');
    const weaknesses = document.getElementById('weaknesses');
    const opportunities = document.getElementById('opportunities');
    const threats = document.getElementById('threats');
    const swotConclusion = document.getElementById('swotConclusion');
    const clearSwotBtn = document.getElementById('clearSwot');
    const analyzeSwotBtn = document.getElementById('analyzeSwot');

    // Compare Elements
    const optionA = document.getElementById('optionA');
    const optionB = document.getElementById('optionB');
    const compareSetup = document.getElementById('compareSetup');
    const compareView = document.getElementById('compareView');
    const startCompareBtn = document.getElementById('startCompare');
    const displayOptionA = document.getElementById('displayOptionA');
    const displayOptionB = document.getElementById('displayOptionB');
    const factorsList = document.getElementById('factorsList');
    const newFactorInput = document.getElementById('newFactor');
    const addFactorBtn = document.getElementById('addFactor');
    const barA = document.getElementById('barA');
    const barB = document.getElementById('barB');
    const scoreA = document.getElementById('scoreA');
    const scoreB = document.getElementById('scoreB');
    const winner = document.getElementById('winner');
    const resetCompareBtn = document.getElementById('resetCompare');
    const saveCompareBtn = document.getElementById('saveCompare');

    // Initialize
    function init() {
        setupTabs();
        setupSwot();
        setupCompare();
    }

    // Tab switching
    function setupTabs() {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                panels.forEach(p => p.classList.remove('active'));
                document.getElementById(`${targetTab}Panel`).classList.add('active');

                state.currentTab = targetTab;
            });
        });
    }

    // SWOT Analysis
    function setupSwot() {
        clearSwotBtn.addEventListener('click', () => {
            swotTopic.value = '';
            strengths.value = '';
            weaknesses.value = '';
            opportunities.value = '';
            threats.value = '';
            swotConclusion.innerHTML = '<p class="placeholder">完成 SWOT 分析后，系统将自动生成分析结论</p>';
        });

        analyzeSwotBtn.addEventListener('click', generateSwotAnalysis);

        // Auto-analyze on input
        [swotTopic, strengths, weaknesses, opportunities, threats].forEach(el => {
            el.addEventListener('input', debounce(generateSwotAnalysis, 1000));
        });
    }

    // Generate SWOT Analysis
    function generateSwotAnalysis() {
        const topic = swotTopic.value.trim() || '该决策';
        const s = strengths.value.trim();
        const w = weaknesses.value.trim();
        const o = opportunities.value.trim();
        const t = threats.value.trim();

        if (!s && !w && !o && !t) {
            swotConclusion.innerHTML = '<p class="placeholder">完成 SWOT 分析后，系统将自动生成分析结论</p>';
            return;
        }

        let conclusion = '';
        const pros = [];
        const cons = [];

        // Analyze strengths
        if (s) {
            const sLines = s.split('\n').filter(l => l.trim());
            if (sLines.length > 0) {
                pros.push(`<strong>✓ 优势：</strong>${sLines[0]}`);
            }
        }

        // Analyze weaknesses
        if (w) {
            const wLines = w.split('\n').filter(l => l.trim());
            if (wLines.length > 0) {
                cons.push(`<strong>✗ 劣势：</strong>${wLines[0]}`);
            }
        }

        // Analyze opportunities
        if (o) {
            const oLines = o.split('\n').filter(l => l.trim());
            if (oLines.length > 0) {
                pros.push(`<strong>✨ 机会：</strong>${oLines[0]}`);
            }
        }

        // Analyze threats
        if (t) {
            const tLines = t.split('\n').filter(l => l.trim());
            if (tLines.length > 0) {
                cons.push(`<strong>⚠ 威胁：</strong>${tLines[0]}`);
            }
        }

        // Generate overall assessment
        conclusion = `<p><strong>关于「${topic}」的分析：</strong></p>`;

        if (pros.length > 0) {
            conclusion += `<p>${pros.join('；')}</p>`;
        }

        if (cons.length > 0) {
            conclusion += `<p>${cons.join('；')}</p>`;
        }

        // Final recommendation
        const score = pros.length - cons.length;
        if (score > 0) {
            conclusion += `<p style="margin-top: 1rem; color: var(--secondary);"><strong>📊 总体评估：</strong>该决策优势较多，建议可以考虑实施，但需注意规避潜在风险。</p>`;
        } else if (score < 0) {
            conclusion += `<p style="margin-top: 1rem; color: var(--danger);"><strong>📊 总体评估：</strong>该决策劣势和风险较多，建议暂缓或寻找替代方案。</p>`;
        } else {
            conclusion += `<p style="margin-top: 1rem; color: var(--accent);"><strong>📊 总体评估：</strong>该决策各因素较为平衡，建议进一步收集信息后再做决定。</p>`;
        }

        swotConclusion.innerHTML = conclusion;
    }

    // Comparison
    function setupCompare() {
        startCompareBtn.addEventListener('click', () => {
            const a = optionA.value.trim();
            const b = optionB.value.trim();

            if (!a || !b) {
                if (!a) optionA.focus();
                else if (!b) optionB.focus();
                return;
            }

            displayOptionA.textContent = a;
            displayOptionB.textContent = b;

            state.factors = [...defaultFactors];

            compareSetup.classList.add('hidden');
            compareView.classList.remove('hidden');

            renderFactors();
            updateScores();
        });

        addFactorBtn.addEventListener('click', addFactor);
        newFactorInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addFactor();
        });

        resetCompareBtn.addEventListener('click', () => {
            optionA.value = '';
            optionB.value = '';
            state.factors = [...defaultFactors];
            compareSetup.classList.remove('hidden');
            compareView.classList.add('hidden');
        });

        saveCompareBtn.addEventListener('click', saveComparison);
    }

    // Add factor
    function addFactor() {
        const name = newFactorInput.value.trim();
        if (!name) {
            newFactorInput.focus();
            return;
        }

        // Check if factor already exists
        if (state.factors.some(f => f.name === name)) {
            newFactorInput.value = '';
            newFactorInput.focus();
            return;
        }

        state.factors.push({ name, scoreA: 5, scoreB: 5 });
        newFactorInput.value = '';
        renderFactors();
        updateScores();
    }

    // Render factors
    function renderFactors() {
        factorsList.innerHTML = '';

        state.factors.forEach((factor, index) => {
            const item = document.createElement('div');
            item.className = 'factor-item';
            item.innerHTML = `
                <div class="factor-header">
                    <span class="factor-name">${factor.name}</span>
                    <button class="factor-delete" data-index="${index}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="factor-scores">
                    <label>选项 A:</label>
                    <input type="number" class="option-a-score" min="0" max="10" value="${factor.scoreA}" data-index="${index}" data-type="scoreA">
                    <label style="margin-left: 1rem;">选项 B:</label>
                    <input type="number" class="option-b-score" min="0" max="10" value="${factor.scoreB}" data-index="${index}" data-type="scoreB">
                </div>
            `;

            // Delete handler
            item.querySelector('.factor-delete').addEventListener('click', () => {
                state.factors.splice(index, 1);
                renderFactors();
                updateScores();
            });

            // Score handlers
            item.querySelectorAll('input[type="number"]').forEach(input => {
                input.addEventListener('change', (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    const type = e.target.dataset.type;
                    let value = parseInt(e.target.value);

                    if (isNaN(value) || value < 0) value = 0;
                    if (value > 10) value = 10;

                    state.factors[idx][type] = value;
                    updateScores();
                });
            });

            factorsList.appendChild(item);
        });
    }

    // Update scores and winner
    function updateScores() {
        if (state.factors.length === 0) return;

        let totalA = 0;
        let totalB = 0;
        let maxScore = state.factors.length * 10;

        state.factors.forEach(f => {
            totalA += f.scoreA;
            totalB += f.scoreB;
        });

        const percentA = Math.round((totalA / maxScore) * 100);
        const percentB = Math.round((totalB / maxScore) * 100);

        barA.style.width = `${percentA}%`;
        barB.style.width = `${percentB}%`;
        scoreA.textContent = `${percentA}%`;
        scoreB.textContent = `${percentB}%`;

        // Determine winner
        if (totalA > totalB) {
            winner.className = 'winner option-a';
            winner.textContent = `🏆 建议选择：${displayOptionA.textContent}`;
        } else if (totalB > totalA) {
            winner.className = 'winner option-b';
            winner.textContent = `🏆 建议选择：${displayOptionB.textContent}`;
        } else {
            winner.className = 'winner tie';
            winner.textContent = '⚖️ 两个选项势均力敌';
        }
    }

    // Save comparison
    function saveComparison() {
        const data = {
            optionA: displayOptionA.textContent,
            optionB: displayOptionB.textContent,
            factors: state.factors,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comparison-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Debounce utility
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

    // Initialize on load
    init();
})();

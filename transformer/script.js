// Transformer 可视化
(function() {
    'use strict';

    // ===== DOM 元素 =====
    const bgCanvas = document.getElementById('bg-canvas');
    const inputPanel = document.getElementById('inputPanel');
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const startBtn = document.getElementById('startBtn');
    const visualizationArea = document.getElementById('visualizationArea');
    const flowContainer = document.getElementById('flowContainer');
    const tokenCountEl = document.getElementById('tokenCount');
    const currentStageEl = document.getElementById('currentStage');
    const resetBtn = document.getElementById('resetBtn');
    const attentionCanvas = document.getElementById('attentionCanvas');
    const attentionGraph = document.getElementById('attentionGraph');
    const progressSteps = document.querySelectorAll('.step');
    const stageTitle = document.getElementById('stageTitle');
    const stageDesc = document.getElementById('stageDesc');
    const stageBadge = document.getElementById('stageBadge');
    const stageDetails = document.getElementById('stageDetails');
    const formulaDisplay = document.getElementById('formulaDisplay');
    const vectorDisplay = document.getElementById('vectorDisplay');
    const headsContainer = document.getElementById('headsContainer');

    // ===== Three.js 变量 =====
    let scene, camera, renderer, particles;

    // ===== 状态 =====
    let tokens = [];
    let attentionWeights = [];
    let currentStep = -1;
    let highlightedToken = -1;
    let headAttentions = [];
    let headPatterns = []; // 每个头的模式描述

    // ===== 阶段定义 =====
    const STAGES = [
        {
            id: 'tokens',
            name: 'Tokenization (分词)',
            label: 'Token',
            description: '将输入文本分割成Token序列。每个Token可以是单词、子词或字符。',
            formula: 'tokens = tokenize(text)',
            details: [
                { title: 'BPE算法', content: '字节对编码，迭代合并高频字符对' },
                { title: '词表大小', content: 'GPT-2: 50,257 | BERT: 30,000' },
                { title: '示例', content: '"playing" → ["play", "##ing"]' }
            ]
        },
        {
            id: 'embedding',
            name: 'Embedding (词嵌入)',
            label: '向量',
            description: '将每个Token映射到d_model维向量。向量空间中，语义相似的词距离较近。',
            formula: 'x = Embedding(token_id) ∈ ℝ^(d_model)',
            details: [
                { title: '向量维度', content: 'd_model = 512' },
                { title: '语义空间', content: 'king - man + woman ≈ queen' },
                { title: '参数量', content: '|V| × d_model' }
            ]
        },
        {
            id: 'position',
            name: 'Positional Encoding (位置编码)',
            label: '位置',
            description: '用正弦/余弦函数编码位置信息，让模型知道每个词的位置。',
            formula: 'PE(pos,2i) = sin(pos/10000^(2i/d))',
            details: [
                { title: '正弦编码', content: '不同维度使用不同频率' },
                { title: '相对位置', content: '可表示词与词之间的距离' },
                { title: '外推能力', content: '可处理比训练更长的序列' }
            ]
        },
        {
            id: 'attention',
            name: 'Self-Attention (自注意力)',
            label: '注意力',
            description: '计算序列中每个位置与其他所有位置的相关性。通过Q、K、V三个向量实现。',
            formula: 'Attention(Q,K,V) = softmax(QK^T / √d_k) V',
            details: [
                { title: 'Query', content: '"我在找什么？"' },
                { title: 'Key', content: '"我是什么？"' },
                { title: 'Value', content: '"我的内容是..."' }
            ]
        },
        {
            id: 'multihead',
            name: 'Multi-Head Attention (多头注意力)',
            label: '多头',
            description: '并行计算多个注意力头，每个头关注不同类型的关系。',
            formula: 'MultiHead = Concat(head_1,...,head_h) W^O',
            details: [
                { title: '头数', content: 'h = 8' },
                { title: '每头维度', content: 'd_k = 64' },
                { title: '优势', content: '捕获不同类型的语义关系' }
            ]
        },
        {
            id: 'ffn',
            name: 'Feed-Forward Network (前馈网络)',
            label: 'FFN',
            description: '对每个位置独立应用两次线性变换，增强模型的非线性表达能力。',
            formula: 'FFN(x) = max(0, xW_1 + b_1)W_2 + b_2',
            details: [
                { title: '隐藏维度', content: 'd_ff = 2048' },
                { title: '激活函数', content: 'ReLU / GELU' },
                { title: '位置独立', content: '各位置并行计算' }
            ]
        },
        {
            id: 'output',
            name: 'Output (输出层)',
            label: '输出',
            description: '经过N层处理后，输出向量可以用于下游任务。',
            formula: 'P(next_token) = softmax(x · W_vocab)',
            details: [
                { title: '层数', content: 'N = 6' },
                { title: '残差连接', content: 'x_out = Layer(x) + x' },
                { title: 'LayerNorm', content: '稳定训练' }
            ]
        }
    ];

    // ===== 初始化 Three.js =====
    function initThreeJS() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        createBackgroundParticles();
        animate();

        window.addEventListener('resize', onWindowResize);
    }

    function createBackgroundParticles() {
        const geometry = new THREE.BufferGeometry();
        const count = 800;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

            const c = Math.random();
            if (c < 0.5) {
                colors[i * 3] = 0; colors[i * 3 + 1] = 0.96; colors[i * 3 + 2] = 1;
            } else {
                colors[i * 3] = 1; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 1;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        particles = new THREE.Points(geometry, new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        }));
        scene.add(particles);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (particles) {
            particles.rotation.x += 0.0002;
            particles.rotation.y += 0.0003;
        }
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ===== Tokenizer =====
    function tokenize(text) {
        const result = [];
        let position = 0;
        for (const char of text) {
            if (char.trim() || char === ' ') {
                result.push({
                    text: char === ' ' ? '␣' : char,
                    position: position++,
                    embedding: generateVector(16),
                    attentionScore: Math.random()
                });
            }
        }
        return result.slice(0, 20);
    }

    function generateVector(dim) {
        return Array.from({ length: dim }, () => (Math.random() * 2 - 1));
    }

    // 生成不同模式的注意力权重
    function generatePatternedAttention(n, pattern) {
        const weights = [];
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j < n; j++) {
                let w;
                const dist = Math.abs(i - j);

                switch (pattern) {
                    case 'local': // 局部注意力
                        w = Math.exp(-dist * 0.8) + Math.random() * 0.1;
                        break;
                    case 'global': // 全局注意力
                        w = 0.3 + Math.random() * 0.3;
                        break;
                    case 'diagonal': // 对角线注意力
                        w = (i === j) ? 0.8 + Math.random() * 0.2 : Math.random() * 0.1;
                        break;
                    case 'forward': // 前向注意力
                        w = (j <= i) ? Math.exp(-dist * 0.5) + Math.random() * 0.1 : Math.random() * 0.05;
                        break;
                    case 'backward': // 后向注意力
                        w = (j >= i) ? Math.exp(-dist * 0.5) + Math.random() * 0.1 : Math.random() * 0.05;
                        break;
                    case 'first': // 关注第一个token
                        w = (j === 0) ? 0.6 + Math.random() * 0.2 : Math.random() * 0.15;
                        break;
                    case 'last': // 关注最后一个token
                        w = (j === n - 1) ? 0.6 + Math.random() * 0.2 : Math.random() * 0.15;
                        break;
                    case 'mixed': // 混合模式
                        w = Math.exp(-dist * 0.3) * (0.5 + Math.random() * 0.5);
                        break;
                    default:
                        w = Math.exp(-dist * 0.4) + Math.random() * 0.3;
                }
                row.push(w);
            }
            const sum = row.reduce((a, b) => a + b, 0);
            weights.push(row.map(w => w / sum));
        }
        return weights;
    }

    function generateMultiHeadAttention(n) {
        const patterns = ['local', 'global', 'diagonal', 'forward', 'backward', 'first', 'last', 'mixed'];
        const descriptions = [
            { name: '局部注意力', desc: '关注相邻词语', color: '#ff6b6b' },
            { name: '全局注意力', desc: '均匀关注所有位置', color: '#4ecdc4' },
            { name: '自身注意力', desc: '主要关注自己', color: '#ffe66d' },
            { name: '前向注意力', desc: '关注之前的词', color: '#a855f7' },
            { name: '后向注意力', desc: '关注之后的词', color: '#06b6d4' },
            { name: '起始注意力', desc: '关注句首', color: '#f97316' },
            { name: '末尾注意力', desc: '关注句尾', color: '#ec4899' },
            { name: '混合注意力', desc: '综合模式', color: '#10b981' }
        ];

        headPatterns = descriptions;
        return patterns.map(p => generatePatternedAttention(n, p));
    }

    // ===== 开始可视化 =====
    async function startVisualization() {
        const text = textInput.value.trim();
        if (!text) { alert('请输入文本！'); return; }

        tokens = tokenize(text);
        attentionWeights = generatePatternedAttention(tokens.length, 'mixed');
        headAttentions = generateMultiHeadAttention(tokens.length);
        tokenCountEl.textContent = tokens.length;
        currentStep = -1;

        inputPanel.classList.add('hidden');
        visualizationArea.classList.add('active');
        flowContainer.innerHTML = '';

        for (let i = 0; i < STAGES.length; i++) {
            currentStep = i;
            updateProgress(i);
            updateStageExplanation(i);
            currentStageEl.textContent = STAGES[i].name.split(' ')[0];
            await renderStage(i);
            await sleep(1000);
        }

        currentStageEl.textContent = '完成';
        stageBadge.textContent = 'Done';
    }

    function updateProgress(step) {
        progressSteps.forEach((el, i) => {
            el.classList.remove('active', 'completed');
            if (i < step) el.classList.add('completed');
            else if (i === step) el.classList.add('active');
        });
    }

    function updateStageExplanation(step) {
        const stage = STAGES[step];
        stageTitle.textContent = stage.name;
        stageDesc.textContent = stage.description;
        stageBadge.textContent = `Step ${step + 1}/${STAGES.length}`;
        stageDetails.innerHTML = stage.details.map(d => `
            <div class="detail-item"><h5>${d.title}</h5><p>${d.content}</p></div>
        `).join('');
        formulaDisplay.innerHTML = stage.formula.replace(/\n/g, '<br>');
    }

    async function renderStage(stageIndex) {
        const stage = STAGES[stageIndex];
        const row = document.createElement('div');
        row.className = 'token-row';
        row.setAttribute('data-stage', stage.id);

        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = stage.label;

        const tokensDiv = document.createElement('div');
        tokensDiv.className = 'tokens';

        tokens.forEach((token, i) => {
            const cell = document.createElement('div');
            cell.className = 'token-cell';
            cell.setAttribute('data-index', i);
            cell.innerHTML = `<span class="token-text">${token.text}</span><span class="token-value">${getStageValue(stage.id, token, i)}</span>`;

            cell.addEventListener('mouseenter', () => highlightToken(i));
            cell.addEventListener('mouseleave', () => highlightToken(-1));

            tokensDiv.appendChild(cell);
            cell.style.opacity = '0';
            setTimeout(() => { cell.style.opacity = '1'; }, i * 30);
        });

        row.appendChild(label);
        row.appendChild(tokensDiv);
        flowContainer.appendChild(row);

        if (stageIndex >= 3) {
            drawAttentionMatrix();
            drawAttentionGraph();
            drawMultiHeadAttention();
            initNeuronView();
            drawModelView();
        }
    }

    function getStageValue(stageId, token, index) {
        switch (stageId) {
            case 'tokens': return `[${index}]`;
            case 'embedding': return token.embedding.slice(0, 2).map(v => v.toFixed(1)).join(',');
            case 'position': return `p${index}`;
            case 'attention': return token.attentionScore.toFixed(2);
            case 'multihead': return 'h×8';
            case 'ffn': return '→';
            case 'output': return '✓';
            default: return '';
        }
    }

    function highlightToken(index) {
        highlightedToken = index;
        document.querySelectorAll('.token-cell').forEach((cell, i) => {
            cell.classList.toggle('highlighted', i === index);
        });

        if (attentionWeights.length > 0) {
            drawAttentionMatrix();
            drawAttentionGraph();
            showVector(index);
        }
    }

    function showVector(index) {
        if (index < 0 || index >= tokens.length) {
            vectorDisplay.innerHTML = '<div class="vector-placeholder">悬停 Token 查看向量</div>';
            return;
        }

        const embedding = tokens[index].embedding;
        vectorDisplay.innerHTML = embedding.map(v => {
            const intensity = (v + 1) / 2;
            const hue = intensity * 240;
            return `<div class="vector-cell" style="background: hsl(${hue}, 80%, 50%)" title="${v.toFixed(2)}"></div>`;
        }).join('');
    }

    // ===== 注意力矩阵 =====
    function drawAttentionMatrix() {
        const n = tokens.length;
        if (n === 0) return;

        const cellSize = Math.min(25, 200 / n);
        const size = n * cellSize;

        attentionCanvas.width = size;
        attentionCanvas.height = size;
        const ctx = attentionCanvas.getContext('2d');

        // 绘制颜色渐变背景说明
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const w = attentionWeights[i][j];
                const hl = highlightedToken === i || highlightedToken === j;

                // 使用更有区分度的颜色
                const r = Math.floor(w * 255);
                const g = Math.floor(180 + w * 75);
                const b = Math.floor(255 - w * 100);

                ctx.fillStyle = hl
                    ? `rgba(255, 255, 100, ${0.5 + w * 0.5})`
                    : `rgba(${r}, ${g}, ${b}, ${0.3 + w * 0.7})`;

                ctx.fillRect(j * cellSize, i * cellSize, cellSize - 1, cellSize - 1);

                if (w > 0.3) {
                    ctx.fillStyle = '#000';
                    ctx.font = `${Math.max(8, cellSize * 0.4)}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(w.toFixed(1), j * cellSize + cellSize / 2, i * cellSize + cellSize / 2);
                }
            }
        }

        // 更新矩阵标签
        const labelsDiv = document.getElementById('matrixLabels');
        if (labelsDiv) {
            labelsDiv.innerHTML = tokens.map((t, i) =>
                `<span class="matrix-label" data-idx="${i}">${t.text}</span>`
            ).join('');

            labelsDiv.querySelectorAll('.matrix-label').forEach(label => {
                label.addEventListener('click', () => {
                    highlightToken(parseInt(label.dataset.idx));
                });
            });
        }
    }

    // ===== 注意力图 =====
    function drawAttentionGraph() {
        const n = tokens.length;
        if (n === 0) return;

        const width = attentionGraph.clientWidth || 400;
        const height = 280;
        const radius = Math.min(width, height) / 2 - 40;
        const cx = width / 2, cy = height / 2;

        attentionGraph.setAttribute('viewBox', `0 0 ${width} ${height}`);
        attentionGraph.innerHTML = '';

        const positions = tokens.map((_, i) => ({
            x: cx + radius * Math.cos(2 * Math.PI * i / n - Math.PI / 2),
            y: cy + radius * Math.sin(2 * Math.PI * i / n - Math.PI / 2)
        }));

        // 边（连接线）
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && attentionWeights[i][j] > 0.15) {
                    const hl = highlightedToken === i || highlightedToken === j;
                    const w = attentionWeights[i][j];

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const midX = (positions[i].x + positions[j].x) / 2;
                    const midY = (positions[i].y + positions[j].y) / 2 - 10;

                    path.setAttribute('d', `M${positions[i].x},${positions[i].y} Q${midX},${midY} ${positions[j].x},${positions[j].y}`);
                    path.setAttribute('stroke', hl ? '#ffff00' : `rgba(0, 245, 255, ${w})`);
                    path.setAttribute('stroke-width', Math.max(1, w * 4));
                    path.setAttribute('fill', 'none');
                    path.setAttribute('opacity', hl ? 1 : 0.5);
                    attentionGraph.appendChild(path);
                }
            }
        }

        // 节点
        positions.forEach((pos, i) => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${pos.x},${pos.y})`);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', highlightedToken === i ? 16 : 12);
            circle.setAttribute('fill', `hsl(${180 + i * 20}, 70%, 50%)`);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dy', '0.35em');
            text.setAttribute('fill', '#000');
            text.setAttribute('font-size', '10px');
            text.setAttribute('font-weight', 'bold');
            text.textContent = tokens[i].text;

            g.appendChild(circle);
            g.appendChild(text);
            g.addEventListener('mouseenter', () => highlightToken(i));
            g.addEventListener('mouseleave', () => highlightToken(-1));
            attentionGraph.appendChild(g);
        });
    }

    // ===== 多头注意力 =====
    function drawMultiHeadAttention() {
        headsContainer.innerHTML = '';

        headAttentions.forEach((weights, headIdx) => {
            const pattern = headPatterns[headIdx];
            const box = document.createElement('div');
            box.className = 'head-box';

            const canvas = document.createElement('canvas');
            canvas.className = 'head-canvas';
            canvas.width = 120;
            canvas.height = 60;
            const ctx = canvas.getContext('2d');

            const n = tokens.length;
            const cellW = 120 / n;
            const cellH = 60 / n;

            // 使用该头的特定颜色
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const w = weights[i][j];
                    // 基于权重强度调整颜色
                    const alpha = 0.2 + w * 0.8;
                    ctx.fillStyle = `hsla(${180 + headIdx * 25}, 70%, ${40 + w * 40}%, ${alpha})`;
                    ctx.fillRect(j * cellW, i * cellH, cellW - 0.5, cellH - 0.5);
                }
            }

            box.innerHTML = `
                <div class="head-label" style="color: ${pattern.color}">
                    Head ${headIdx + 1}: ${pattern.name}
                </div>
                <div style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 5px;">
                    ${pattern.desc}
                </div>
            `;
            box.appendChild(canvas);

            box.addEventListener('click', () => {
                document.querySelectorAll('.head-box').forEach(b => b.classList.remove('active'));
                box.classList.add('active');
                attentionWeights = weights;

                // 切换到神经元视图
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
                document.querySelector('.tab-btn[data-view="neuron"]').classList.add('active');
                document.getElementById('neuronView').classList.add('active');

                drawAttentionMatrix();
                drawAttentionGraph();
                document.getElementById('headSelect').value = headIdx;
                updateNeuronBars(
                    parseInt(document.getElementById('queryTokenSelect').value) || 0,
                    parseInt(document.getElementById('keyTokenSelect').value) || 0,
                    headIdx
                );
            });

            headsContainer.appendChild(box);
        });
    }

    // ===== 神经元视图 =====
    function initNeuronView() {
        const querySelect = document.getElementById('queryTokenSelect');
        const keySelect = document.getElementById('keyTokenSelect');
        const headSelect = document.getElementById('headSelect');

        querySelect.innerHTML = tokens.map((t, i) => `<option value="${i}">${t.text} [${i}]</option>`).join('');
        keySelect.innerHTML = tokens.map((t, i) => `<option value="${i}">${t.text} [${i}]</option>`).join('');
        headSelect.innerHTML = headPatterns.map((p, i) =>
            `<option value="${i}">Head ${i + 1}: ${p.name}</option>`
        ).join('');

        if (tokens.length > 1) keySelect.value = '1';

        const updateNeuronView = () => updateNeuronBars(
            parseInt(querySelect.value),
            parseInt(keySelect.value),
            parseInt(headSelect.value)
        );

        querySelect.addEventListener('change', updateNeuronView);
        keySelect.addEventListener('change', updateNeuronView);
        headSelect.addEventListener('change', updateNeuronView);

        updateNeuronView();
    }

    function updateNeuronBars(queryIdx, keyIdx, headIdx) {
        if (!tokens[queryIdx] || !tokens[keyIdx] || !headAttentions[headIdx]) return;

        const queryEmbedding = tokens[queryIdx].embedding;
        const keyEmbedding = tokens[keyIdx].embedding;
        const NEURON_DIM = 12;

        // Query bars
        const queryBars = document.getElementById('queryBars');
        queryBars.innerHTML = queryEmbedding.slice(0, NEURON_DIM).map((v, i) => {
            const height = Math.abs(v) * 45;
            const cls = v >= 0 ? 'positive' : 'negative';
            return `<div class="neuron-bar ${cls}" style="height: ${height}px" title="维度${i}: ${v.toFixed(3)}"></div>`;
        }).join('');

        // Key bars
        const keyBars = document.getElementById('keyBars');
        keyBars.innerHTML = keyEmbedding.slice(0, NEURON_DIM).map((v, i) => {
            const height = Math.abs(v) * 45;
            const cls = v >= 0 ? 'positive' : 'negative';
            return `<div class="neuron-bar ${cls}" style="height: ${height}px" title="维度${i}: ${v.toFixed(3)}"></div>`;
        }).join('');

        // Product bars (Q×K)
        const productBars = document.getElementById('productBars');
        const products = queryEmbedding.slice(0, NEURON_DIM).map((q, i) => q * keyEmbedding[i]);
        productBars.innerHTML = products.map((p, i) => {
            const height = Math.abs(p) * 45;
            const cls = p >= 0 ? 'product-pos' : 'product-neg';
            return `<div class="neuron-bar ${cls}" style="height: ${height}px" title="Q[${i}]×K[${i}]=${p.toFixed(3)}"></div>`;
        }).join('');

        // 计算步骤展示
        // Step 1: 点积
        let dotProduct = 0;
        for (let i = 0; i < queryEmbedding.length; i++) {
            dotProduct += queryEmbedding[i] * keyEmbedding[i];
        }
        document.getElementById('dotProductValue').textContent = dotProduct.toFixed(2);

        // Step 2: 缩放 (d_k = 64, √64 = 8)
        const scaled = dotProduct / 8;
        document.getElementById('scaledValue').textContent = scaled.toFixed(2);

        // Step 3: Softmax (使用实际注意力分数)
        const actualScore = headAttentions[headIdx][queryIdx][keyIdx];
        document.getElementById('attentionScore').textContent = actualScore.toFixed(3);
    }

    // ===== 全局视图 =====
    const NUM_LAYERS = 6;

    function drawModelView() {
        const modelGrid = document.getElementById('modelGrid');
        if (!modelGrid || tokens.length === 0) return;

        modelGrid.innerHTML = '';

        for (let layer = 0; layer < NUM_LAYERS; layer++) {
            const layerDiv = document.createElement('div');
            layerDiv.className = 'model-layer';
            layerDiv.innerHTML = `<div class="model-layer-title">Layer ${layer + 1}</div>`;

            for (let head = 0; head < 8; head++) {
                const weights = headAttentions[head];
                const pattern = headPatterns[head];

                const headCanvas = document.createElement('canvas');
                headCanvas.className = 'model-head';
                headCanvas.width = 50;
                headCanvas.height = 25;
                headCanvas.dataset.layer = layer;
                headCanvas.dataset.head = head;
                headCanvas.title = `Layer ${layer + 1} - Head ${head + 1}: ${pattern.name}`;

                const ctx = headCanvas.getContext('2d');
                const n = tokens.length;
                const cellW = 50 / n;
                const cellH = 25 / n;

                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        const w = weights[i][j];
                        ctx.fillStyle = `hsla(${180 + head * 25}, 70%, ${35 + w * 45}%, ${0.3 + w * 0.7})`;
                        ctx.fillRect(j * cellW, i * cellH, cellW, cellH);
                    }
                }

                headCanvas.addEventListener('click', () => {
                    document.querySelectorAll('.model-head').forEach(h => h.classList.remove('active'));
                    headCanvas.classList.add('active');

                    document.getElementById('headSelect').value = head;
                    document.getElementById('headSelect').dispatchEvent(new Event('change'));
                });

                layerDiv.appendChild(headCanvas);
            }

            modelGrid.appendChild(layerDiv);
        }
    }

    // ===== 重置 =====
    function reset() {
        tokens = [];
        attentionWeights = [];
        headAttentions = [];
        currentStep = -1;
        highlightedToken = -1;

        visualizationArea.classList.remove('active');
        inputPanel.classList.remove('hidden');
        textInput.value = '';
        charCount.textContent = '0';
        flowContainer.innerHTML = '';
        currentStageEl.textContent = '准备就绪';
        stageTitle.textContent = STAGES[0].name;
        stageDesc.textContent = '等待输入文本...';
        stageBadge.textContent = 'Step 1/7';
        stageDetails.innerHTML = '';
        formulaDisplay.innerHTML = '';

        progressSteps.forEach(el => el.classList.remove('active', 'completed'));
        progressSteps[0].classList.add('active');

        attentionCanvas.width = 0;
        attentionCanvas.height = 0;
        attentionGraph.innerHTML = '';
        headsContainer.innerHTML = '';
        vectorDisplay.innerHTML = '<div class="vector-placeholder">悬停 Token 查看向量</div>';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    // ===== 标签页切换 =====
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.view + 'View').classList.add('active');
        });
    });

    // ===== 步骤跳转 =====
    progressSteps.forEach((step, i) => {
        step.addEventListener('click', () => {
            if (tokens.length > 0 && i <= currentStep) {
                updateProgress(i);
                updateStageExplanation(i);
                currentStageEl.textContent = STAGES[i].name.split(' ')[0];
            }
        });
    });

    // ===== 事件监听 =====
    textInput.addEventListener('input', () => {
        charCount.textContent = textInput.value.length;
        charCount.parentElement.classList.toggle('warning', textInput.value.length > 80);
    });
    startBtn.addEventListener('click', startVisualization);
    resetBtn.addEventListener('click', reset);
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            startVisualization();
        }
    });

    // 示例按钮
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            textInput.value = btn.dataset.text;
            charCount.textContent = btn.dataset.text.length;
        });
    });

    // ===== 初始化 =====
    initThreeJS();
})();

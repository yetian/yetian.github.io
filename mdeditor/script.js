// Markdown 编辑器
(function() {
    'use strict';

    // ===== DOM 元素 =====
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const lineNumbers = document.getElementById('lineNumbers');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const lineCount = document.getElementById('lineCount');
    const saveStatus = document.getElementById('saveStatus');
    const exportModal = document.getElementById('exportModal');
    const editorPanel = document.getElementById('editorPanel');
    const previewPanel = document.getElementById('previewPanel');
    const resizer = document.getElementById('resizer');

    // ===== 配置 marked =====
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });

    // ===== 实时预览 =====
    function updatePreview() {
        const markdown = editor.value;
        preview.innerHTML = marked.parse(markdown);

        // 渲染数学公式
        renderMathInElement(preview, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\[', right: '\\]', display: true},
                {left: '\\(', right: '\\)', display: false}
            ],
            throwOnError: false
        });

        updateStats();
        autoSave();
    }

    // ===== 更新统计 =====
    function updateStats() {
        const text = editor.value;
        charCount.textContent = `${text.length} 字符`;
        wordCount.textContent = `${text.trim() ? text.trim().split(/\s+/).length : 0} 词`;
        lineCount.textContent = `${text.split('\n').length} 行`;
    }

    // ===== 更新行号 =====
    function updateLineNumbers() {
        const lines = editor.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) =>
            `<span>${i + 1}</span>`
        ).join('');
    }

    // ===== 同步滚动 =====
    function syncScroll() {
        const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        preview.parentElement.scrollTop = percentage * (preview.parentElement.scrollHeight - preview.parentElement.clientHeight);
    }

    // ===== 自动保存 =====
    let saveTimeout;
    function autoSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            localStorage.setItem('mdeditor-content', editor.value);
            saveStatus.textContent = '已自动保存';
            saveStatus.classList.add('saved');
        }, 500);
    }

    // ===== 加载保存的内容 =====
    function loadSavedContent() {
        const saved = localStorage.getItem('mdeditor-content');
        if (saved) {
            editor.value = saved;
            updatePreview();
            updateLineNumbers();
        }
    }

    // ===== 工具栏操作 =====
    const toolbarActions = {
        heading: { prefix: '## ', suffix: '' },
        bold: { prefix: '**', suffix: '**' },
        italic: { prefix: '*', suffix: '*' },
        strikethrough: { prefix: '~~', suffix: '~~' },
        ul: { prefix: '- ', suffix: '' },
        ol: { prefix: '1. ', suffix: '' },
        checkbox: { prefix: '- [ ] ', suffix: '' },
        link: { prefix: '[', suffix: '](url)' },
        image: { prefix: '![alt](', suffix: ')' },
        code: { prefix: '`', suffix: '`' },
        codeblock: { prefix: '```\n', suffix: '\n```' },
        quote: { prefix: '> ', suffix: '' },
        hr: { prefix: '\n---\n', suffix: '' },
        table: {
            insert: '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n'
        },
        math: { prefix: '$', suffix: '$' },
        mathblock: { prefix: '$$\n', suffix: '\n$$' }
    };

    function insertText(action) {
        const config = toolbarActions[action];
        if (!config) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = editor.value.substring(start, end);

        let newText;
        let cursorOffset;

        if (config.insert) {
            newText = editor.value.substring(0, start) + config.insert + editor.value.substring(end);
            cursorOffset = start + config.insert.length;
        } else {
            newText = editor.value.substring(0, start) + config.prefix + selected + config.suffix + editor.value.substring(end);
            cursorOffset = start + config.prefix.length + selected.length + config.suffix.length;
        }

        editor.value = newText;
        editor.focus();
        editor.setSelectionRange(
            start + config.prefix.length,
            start + config.prefix.length + selected.length
        );

        updatePreview();
        updateLineNumbers();
    }

    // 工具栏按钮事件
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            insertText(btn.dataset.action);
        });
    });

    // ===== 视图切换 =====
    const viewIndicator = document.querySelector('.view-switch-indicator');
    const viewBtns = document.querySelectorAll('.view-btn');

    function updateViewIndicator(activeBtn) {
        const index = Array.from(viewBtns).indexOf(activeBtn);
        // 每个按钮宽度30px + 间距2px，初始位置已设置left:4px
        const positions = [0, 32, 64]; // 对应三个按钮的位置偏移
        viewIndicator.style.transform = `translateX(${positions[index]}px)`;
    }

    // 初始化指示器位置
    const initialActiveBtn = document.querySelector('.view-btn.active');
    if (initialActiveBtn) {
        updateViewIndicator(initialActiveBtn);
    }

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateViewIndicator(btn);

            const view = btn.dataset.view;

            // 移除所有动画类
            editorPanel.classList.remove('hidden', 'expand');
            previewPanel.classList.remove('hidden', 'expand');
            resizer.classList.remove('hidden');

            switch (view) {
                case 'split':
                    editorPanel.style.display = 'flex';
                    previewPanel.style.display = 'flex';
                    resizer.style.display = 'flex';
                    editorPanel.classList.add('expand');
                    previewPanel.classList.add('expand');
                    break;
                case 'preview':
                    editorPanel.classList.add('hidden');
                    previewPanel.style.display = 'flex';
                    previewPanel.classList.add('expand');
                    resizer.classList.add('hidden');
                    break;
                case 'editor':
                    editorPanel.style.display = 'flex';
                    editorPanel.classList.add('expand');
                    previewPanel.classList.add('hidden');
                    resizer.classList.add('hidden');
                    break;
            }
        });
    });

    // ===== 分割线拖动 =====
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const container = document.querySelector('.editor-main');
        const containerRect = container.getBoundingClientRect();
        const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        if (percentage > 20 && percentage < 80) {
            editorPanel.style.flex = `0 0 ${percentage}%`;
            previewPanel.style.flex = `0 0 ${100 - percentage}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });

    // ===== 导出功能 =====
    document.getElementById('exportBtn').addEventListener('click', () => {
        exportModal.classList.add('active');
    });

    document.getElementById('closeExportModal').addEventListener('click', () => {
        exportModal.classList.remove('active');
    });

    exportModal.addEventListener('click', (e) => {
        if (e.target === exportModal) {
            exportModal.classList.remove('active');
        }
    });

    document.querySelectorAll('.export-option').forEach(option => {
        option.addEventListener('click', () => {
            const format = option.dataset.format;
            let content, filename, mimeType;

            switch (format) {
                case 'md':
                    content = editor.value;
                    filename = 'document.md';
                    mimeType = 'text/markdown';
                    break;
                case 'html':
                    content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Markdown Document</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <style>
        body {
            font-family: -apple-system, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            background: #1a1a2e;
            color: #eee;
        }
        pre { background: #16213e; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { background: #16213e; padding: 2px 6px; border-radius: 3px; }
        blockquote { border-left: 4px solid #58a6ff; margin: 0; padding-left: 1em; color: #888; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #333; padding: 8px; }
        a { color: #58a6ff; }
        h1 { border-bottom: 1px solid #333; padding-bottom: 0.3em; }
        h2 { border-bottom: 1px solid #333; padding-bottom: 0.3em; }
    </style>
</head>
<body>
${preview.innerHTML}
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"><\/script>
<script>
    renderMathInElement(document.body, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ]
    });
<\/script>
</body>
</html>`;
                    filename = 'document.html';
                    mimeType = 'text/html';
                    break;
                case 'txt':
                    content = editor.value;
                    filename = 'document.txt';
                    mimeType = 'text/plain';
                    break;
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            exportModal.classList.remove('active');
        });
    });

    // ===== 其他按钮 =====
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (confirm('确定要清空所有内容吗？')) {
            editor.value = '';
            updatePreview();
            updateLineNumbers();
        }
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(editor.value).then(() => {
            const btn = document.getElementById('copyBtn');
            btn.textContent = '✅';
            setTimeout(() => btn.textContent = '📋', 1500);
        });
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        localStorage.setItem('mdeditor-content', editor.value);
        saveStatus.textContent = '已保存';
        saveStatus.classList.add('saved');
    });

    // ===== 编辑器事件 =====
    editor.addEventListener('input', () => {
        updatePreview();
        updateLineNumbers();
    });

    editor.addEventListener('scroll', syncScroll);

    // Tab 键支持
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 4;
            updatePreview();
        }
    });

    // ===== 初始化 =====
    loadSavedContent();

    // 快捷键
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    document.getElementById('saveBtn').click();
                    break;
                case 'b':
                    e.preventDefault();
                    insertText('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    insertText('italic');
                    break;
            }
        }
    });
})();

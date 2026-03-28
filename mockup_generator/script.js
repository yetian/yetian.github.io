// Mockup Generator - JavaScript
(function() {
    'use strict';

    // Component Templates
    const COMPONENTS = {
        button: {
            type: 'button',
            content: 'Button',
            style: { width: '100%', background: '#3b82f6', color: '#ffffff', borderRadius: '8px', padding: '12px' }
        },
        input: {
            type: 'input',
            content: 'Enter text...',
            style: { width: '100%', background: '#f3f4f6', color: '#374151', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' }
        },
        card: {
            type: 'card',
            content: 'Card content',
            style: { width: '100%', background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }
        },
        navbar: {
            type: 'navbar',
            content: 'Title',
            style: { width: '100%', background: '#1f2937', color: '#ffffff', borderRadius: '8px', padding: '12px' }
        },
        list: {
            type: 'list',
            content: 'Item 1|Item 2|Item 3',
            style: { width: '100%', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }
        },
        image: {
            type: 'image',
            content: 'Image',
            style: { width: '100%', height: '120px', background: '#f3f4f6', borderRadius: '8px' }
        },
        text: {
            type: 'text',
            content: 'Text content here...',
            style: { width: '100%', color: '#374151', fontSize: '14px', lineHeight: '1.5' }
        },
        divider: {
            type: 'divider',
            content: '',
            style: { width: '100%', height: '1px', background: '#e5e7eb' }
        }
    };

    // Templates
    const TEMPLATES = {
        blank: [],
        login: [
            { type: 'text', content: 'Welcome Back', style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' } },
            { type: 'text', content: 'Sign in to continue', style: { fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '24px' } },
            { type: 'input', content: 'Email address', style: { marginBottom: '12px' } },
            { type: 'input', content: 'Password', style: { marginBottom: '24px' } },
            { type: 'button', content: 'Sign In', style: { marginBottom: '16px' } },
            { type: 'text', content: 'Forgot password?', style: { fontSize: '12px', color: '#3b82f6', textAlign: 'center' } }
        ],
        profile: [
            { type: 'navbar', content: 'Profile', style: { marginBottom: '16px' } },
            { type: 'image', content: '', style: { width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px' } },
            { type: 'text', content: 'John Doe', style: { fontSize: '20px', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' } },
            { type: 'text', content: 'john@example.com', style: { fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '24px' } },
            { type: 'card', content: 'Bio: Software developer passionate about creating great user experiences.', style: { marginBottom: '12px' } },
            { type: 'list', content: 'Settings|Edit Profile|Logout', style: {} }
        ],
        list: [
            { type: 'navbar', content: 'My List', style: { marginBottom: '16px' } },
            { type: 'input', content: 'Search...', style: { marginBottom: '16px' } },
            { type: 'card', content: 'Item 1 - Description goes here', style: { marginBottom: '8px' } },
            { type: 'card', content: 'Item 2 - Description goes here', style: { marginBottom: '8px' } },
            { type: 'card', content: 'Item 3 - Description goes here', style: { marginBottom: '8px' } },
            { type: 'card', content: 'Item 4 - Description goes here', style: {} }
        ]
    };

    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const componentsList = document.getElementById('componentsList');
    const canvas = document.getElementById('canvas');
    const canvasPlaceholder = document.getElementById('canvasPlaceholder');
    const templateSelect = document.getElementById('templateSelect');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    const panelContent = document.getElementById('panelContent');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    // State
    let elements = [];
    let selectedElement = null;
    let history = [];
    let historyIndex = -1;
    let draggedElement = null;
    let dragOverElement = null;

    // Initialize
    function init() {
        setupDragAndDrop();
        setupToolbar();
        setupKeyboard();
        loadTemplate('blank');
    }

    // Drag and Drop
    function setupDragAndDrop() {
        // Component items
        componentsList.querySelectorAll('.component-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('componentType', item.dataset.type);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        // Canvas
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.classList.add('drag-over');
        });

        canvas.addEventListener('dragleave', (e) => {
            if (e.target === canvas) {
                canvas.classList.remove('drag-over');
            }
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');

            const type = e.dataTransfer.getData('componentType');
            if (type && COMPONENTS[type]) {
                addElement(COMPONENTS[type]);
            }
        });

        // Canvas click to deselect
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas) {
                selectElement(null);
            }
        });
    }

    // Setup Element Drag Events
    function setupElementDragEvents(div, element) {
        div.setAttribute('draggable', 'true');

        div.addEventListener('dragstart', (e) => {
            if (e.target !== div) return;
            draggedElement = element;
            div.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', element.id.toString());
        });

        div.addEventListener('dragend', (e) => {
            div.classList.remove('dragging');
            draggedElement = null;
            // Remove all drag-over classes
            canvas.querySelectorAll('.canvas-element').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom');
            });
        });

        div.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedElement || draggedElement.id === element.id) return;

            const rect = div.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;

            // Remove previous classes
            canvas.querySelectorAll('.canvas-element').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            if (e.clientY < midY) {
                div.classList.add('drag-over-top');
                dragOverElement = { element, position: 'before' };
            } else {
                div.classList.add('drag-over-bottom');
                dragOverElement = { element, position: 'after' };
            }
        });

        div.addEventListener('dragleave', (e) => {
            div.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        div.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!draggedElement || draggedElement.id === element.id) return;
            if (!dragOverElement) return;

            // Reorder elements
            const draggedIndex = elements.findIndex(el => el.id === draggedElement.id);
            const targetIndex = elements.findIndex(el => el.id === element.id);

            if (draggedIndex === -1 || targetIndex === -1) return;

            // Remove dragged element
            const [removed] = elements.splice(draggedIndex, 1);

            // Calculate new position
            let newIndex = targetIndex;
            if (draggedIndex < targetIndex) newIndex--;
            if (dragOverElement.position === 'after') newIndex++;

            // Insert at new position
            elements.splice(newIndex, 0, removed);

            renderElements();
            saveHistory();

            // Clean up
            canvas.querySelectorAll('.canvas-element').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom');
            });
            draggedElement = null;
            dragOverElement = null;
        });
    }

    // Add Element
    function addElement(component) {
        const element = {
            id: Date.now(),
            type: component.type,
            content: component.content,
            style: { ...component.style }
        };

        elements.push(element);
        renderElements();
        saveHistory();
        selectElement(element);
    }

    // Render Elements
    function renderElements() {
        // Clear canvas except placeholder
        canvas.querySelectorAll('.canvas-element').forEach(el => el.remove());

        // Toggle placeholder
        canvasPlaceholder.style.display = elements.length === 0 ? 'block' : 'none';

        // Render each element
        elements.forEach(el => {
            const div = document.createElement('div');
            div.className = 'canvas-element';
            div.dataset.id = el.id;

            renderElementContent(div, el);

            // Setup drag events for reordering
            setupElementDragEvents(div, el);

            // Click to select
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                selectElement(el);
            });

            canvas.appendChild(div);
        });

        // Re-select if needed
        if (selectedElement) {
            const selectedDiv = canvas.querySelector(`[data-id="${selectedElement.id}"]`);
            if (selectedDiv) {
                selectedDiv.classList.add('selected');
            }
        }
    }

    // Render Element Content
    function renderElementContent(div, el) {
        div.className = `canvas-element el-${el.type}`;
        if (selectedElement && selectedElement.id === el.id) {
            div.classList.add('selected');
        }

        // Apply styles
        Object.entries(el.style).forEach(([key, value]) => {
            div.style[key] = value;
        });

        // Render content based on type
        switch (el.type) {
            case 'button':
                div.textContent = el.content;
                break;
            case 'input':
                div.textContent = el.content;
                div.style.color = '#9ca3af';
                break;
            case 'card':
                div.textContent = el.content;
                break;
            case 'navbar':
                div.innerHTML = `<span>${el.content}</span><span style="opacity:0.5">☰</span>`;
                break;
            case 'list':
                const items = el.content.split('|');
                div.innerHTML = items.map((item, i) =>
                    `<div class="el-list-item" style="${i < items.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">${item}</div>`
                ).join('');
                break;
            case 'image':
                div.innerHTML = `<span style="color:#9ca3af">📷 Image</span>`;
                break;
            case 'text':
                div.textContent = el.content;
                break;
            case 'divider':
                div.innerHTML = '';
                break;
        }

        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'element-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteElement(el.id);
        });
        div.appendChild(deleteBtn);
    }

    // Select Element
    function selectElement(element) {
        selectedElement = element;

        // Update canvas
        canvas.querySelectorAll('.canvas-element').forEach(div => {
            div.classList.toggle('selected', element && parseInt(div.dataset.id) === element.id);
        });

        // Update properties panel
        renderProperties(element);
    }

    // Render Properties Panel
    function renderProperties(element) {
        if (!element) {
            panelContent.innerHTML = '<p class="no-selection">选择组件以编辑属性</p>';
            return;
        }

        let html = '';

        // Content property
        if (element.type !== 'divider') {
            html += `
                <div class="property-group">
                    <label>内容</label>
                    <input type="text" id="propContent" value="${escapeHtml(element.content)}">
                </div>
            `;
        }

        // Common properties
        html += `
            <div class="property-group">
                <label>背景色</label>
                <div class="color-input">
                    <input type="color" id="propBgColor" value="${rgbToHex(element.style.background || '#ffffff')}">
                    <input type="text" id="propBgColorText" value="${element.style.background || '#ffffff'}">
                </div>
            </div>
            <div class="property-group">
                <label>文字颜色</label>
                <div class="color-input">
                    <input type="color" id="propColor" value="${rgbToHex(element.style.color || '#374151')}">
                    <input type="text" id="propColorText" value="${element.style.color || '#374151'}">
                </div>
            </div>
            <div class="property-group">
                <label>圆角</label>
                <input type="text" id="propBorderRadius" value="${element.style.borderRadius || '0px'}">
            </div>
            <div class="property-group">
                <label>内边距</label>
                <input type="text" id="propPadding" value="${element.style.padding || '0px'}">
            </div>
        `;

        panelContent.innerHTML = html;

        // Add event listeners
        const propContent = document.getElementById('propContent');
        const propBgColor = document.getElementById('propBgColor');
        const propBgColorText = document.getElementById('propBgColorText');
        const propColor = document.getElementById('propColor');
        const propColorText = document.getElementById('propColorText');
        const propBorderRadius = document.getElementById('propBorderRadius');
        const propPadding = document.getElementById('propPadding');

        if (propContent) {
            propContent.addEventListener('input', (e) => {
                element.content = e.target.value;
                renderElements();
            });
        }

        if (propBgColor) {
            propBgColor.addEventListener('input', (e) => {
                element.style.background = e.target.value;
                propBgColorText.value = e.target.value;
                renderElements();
            });
            propBgColorText.addEventListener('input', (e) => {
                element.style.background = e.target.value;
                renderElements();
            });
        }

        if (propColor) {
            propColor.addEventListener('input', (e) => {
                element.style.color = e.target.value;
                propColorText.value = e.target.value;
                renderElements();
            });
            propColorText.addEventListener('input', (e) => {
                element.style.color = e.target.value;
                renderElements();
            });
        }

        if (propBorderRadius) {
            propBorderRadius.addEventListener('input', (e) => {
                element.style.borderRadius = e.target.value;
                renderElements();
            });
        }

        if (propPadding) {
            propPadding.addEventListener('input', (e) => {
                element.style.padding = e.target.value;
                renderElements();
            });
        }
    }

    // Delete Element
    function deleteElement(id) {
        elements = elements.filter(el => el.id !== id);
        if (selectedElement && selectedElement.id === id) {
            selectedElement = null;
        }
        renderElements();
        renderProperties(null);
        saveHistory();
    }

    // Toolbar
    function setupToolbar() {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });

        templateSelect.addEventListener('change', (e) => {
            loadTemplate(e.target.value);
        });

        undoBtn.addEventListener('click', undo);
        redoBtn.addEventListener('click', redo);
        clearBtn.addEventListener('click', clearCanvas);
        exportBtn.addEventListener('click', exportPNG);
    }

    // Load Template
    function loadTemplate(name) {
        const template = TEMPLATES[name] || [];
        elements = template.map((item, index) => ({
            id: Date.now() + index,
            type: item.type,
            content: item.content,
            style: { ...COMPONENTS[item.type].style, ...item.style }
        }));
        selectedElement = null;
        history = [];
        historyIndex = -1;
        renderElements();
        renderProperties(null);
        saveHistory();
    }

    // History
    function saveHistory() {
        history = history.slice(0, historyIndex + 1);
        history.push(JSON.stringify(elements));
        historyIndex = history.length - 1;

        // Limit history
        if (history.length > 50) {
            history.shift();
            historyIndex--;
        }
    }

    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            elements = JSON.parse(history[historyIndex]);
            selectedElement = null;
            renderElements();
            renderProperties(null);
        }
    }

    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            elements = JSON.parse(history[historyIndex]);
            selectedElement = null;
            renderElements();
            renderProperties(null);
        }
    }

    // Clear Canvas
    function clearCanvas() {
        elements = [];
        selectedElement = null;
        renderElements();
        renderProperties(null);
        saveHistory();
    }

    // Export PNG
    function exportPNG() {
        // Hide delete buttons temporarily
        const deleteButtons = canvas.querySelectorAll('.element-delete');
        deleteButtons.forEach(btn => btn.style.display = 'none');

        // Remove selection styling
        const selectedElements = canvas.querySelectorAll('.canvas-element.selected');
        selectedElements.forEach(el => el.classList.remove('selected'));

        // Use html2canvas if available, otherwise create simple screenshot
        if (typeof html2canvas !== 'undefined') {
            html2canvas(canvas, {
                backgroundColor: '#ffffff',
                scale: 2
            }).then(canvasEl => {
                const link = document.createElement('a');
                link.download = `mockup-${Date.now()}.png`;
                link.href = canvasEl.toDataURL();
                link.click();

                // Restore delete buttons
                deleteButtons.forEach(btn => btn.style.display = '');
                selectedElements.forEach(el => el.classList.add('selected'));

                showNotification('已导出PNG');
            });
        } else {
            // Simple fallback - just show notification
            showNotification('请添加html2canvas库以支持导出');
            deleteButtons.forEach(btn => btn.style.display = '');
            selectedElements.forEach(el => el.classList.add('selected'));
        }
    }

    // Keyboard
    function setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedElement && document.activeElement.tagName !== 'INPUT') {
                    e.preventDefault();
                    deleteElement(selectedElement.id);
                }
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                }
            }
        });
    }

    // Utility Functions
    function rgbToHex(color) {
        if (!color) return '#ffffff';
        if (color.startsWith('#')) return color.slice(0, 7);

        // Try to parse rgb
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }

        return '#ffffff';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(text) {
        notificationText.textContent = text;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Initialize
    init();
})();

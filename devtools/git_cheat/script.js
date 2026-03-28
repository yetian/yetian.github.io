// Git Cheatsheet - JavaScript
(function() {
    'use strict';

    // Git commands data organized by category
    const commandsData = {
        basic: {
            title: '基础命令',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
            commands: [
                { cmd: 'git init', desc: '在当前目录创建新的 Git 仓库' },
                { cmd: 'git clone <url>', desc: '克隆远程仓库到本地' },
                { cmd: 'git status', desc: '查看工作区和暂存区状态' },
                { cmd: 'git add <file>', desc: '将文件添加到暂存区' },
                { cmd: 'git add .', desc: '将所有修改添加到暂存区' },
                { cmd: 'git commit -m "message"', desc: '提交暂存区的更改' },
                { cmd: 'git commit -am "message"', desc: '添加并提交已跟踪文件的更改' },
                { cmd: 'git log', desc: '查看提交历史' },
                { cmd: 'git log --oneline', desc: '简洁格式查看提交历史' },
                { cmd: 'git diff', desc: '查看未暂存的更改' },
                { cmd: 'git diff --staged', desc: '查看已暂存但未提交的更改' },
                { cmd: 'git show <commit>', desc: '查看指定提交的详细信息' }
            ]
        },
        branch: {
            title: '分支操作',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>',
            commands: [
                { cmd: 'git branch', desc: '列出所有本地分支' },
                { cmd: 'git branch -a', desc: '列出所有分支（本地+远程）' },
                { cmd: 'git branch <name>', desc: '创建新分支' },
                { cmd: 'git branch -d <name>', desc: '删除已合并的分支' },
                { cmd: 'git branch -D <name>', desc: '强制删除分支' },
                { cmd: 'git checkout <branch>', desc: '切换到指定分支' },
                { cmd: 'git checkout -b <name>', desc: '创建并切换到新分支' },
                { cmd: 'git switch <branch>', desc: '切换分支（新版命令）' },
                { cmd: 'git switch -c <name>', desc: '创建并切换新分支（新版）' },
                { cmd: 'git merge <branch>', desc: '合并指定分支到当前分支' },
                { cmd: 'git merge --no-ff <branch>', desc: '禁用快进合并，保留分支历史' },
                { cmd: 'git rebase <branch>', desc: '变基当前分支到指定分支' }
            ]
        },
        remote: {
            title: '远程操作',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
            commands: [
                { cmd: 'git remote -v', desc: '查看远程仓库信息' },
                { cmd: 'git remote add <name> <url>', desc: '添加远程仓库' },
                { cmd: 'git remote remove <name>', desc: '删除远程仓库' },
                { cmd: 'git fetch <remote>', desc: '从远程仓库获取最新数据' },
                { cmd: 'git fetch --all', desc: '获取所有远程仓库的更新' },
                { cmd: 'git pull <remote> <branch>', desc: '拉取远程分支并合并' },
                { cmd: 'git pull --rebase', desc: '拉取并变基（保持线性历史）' },
                { cmd: 'git push <remote> <branch>', desc: '推送本地分支到远程' },
                { cmd: 'git push -u <remote> <branch>', desc: '推送并设置上游分支' },
                { cmd: 'git push --force', desc: '强制推送（慎用）' },
                { cmd: 'git push --all', desc: '推送所有分支到远程' },
                { cmd: 'git push --tags', desc: '推送所有标签到远程' }
            ]
        },
        undo: {
            title: '撤销修改',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>',
            commands: [
                { cmd: 'git restore <file>', desc: '撤销工作区文件的修改' },
                { cmd: 'git restore --staged <file>', desc: '取消暂存（保留工作区修改）' },
                { cmd: 'git restore --source=HEAD <file>', desc: '恢复文件到最新提交状态' },
                { cmd: 'git reset HEAD <file>', desc: '取消暂存（旧命令）' },
                { cmd: 'git reset --soft HEAD~1', desc: '撤销最近提交，保留更改在暂存区' },
                { cmd: 'git reset --mixed HEAD~1', desc: '撤销提交和暂存，保留工作区更改' },
                { cmd: 'git reset --hard HEAD~1', desc: '完全撤销提交，丢弃所有更改' },
                { cmd: 'git revert <commit>', desc: '创建新提交来撤销指定提交' },
                { cmd: 'git revert --no-commit <commit>', desc: '撤销但不自动提交' },
                { cmd: 'git clean -fd', desc: '删除未跟踪的文件和目录' },
                { cmd: 'git clean -fdn', desc: '预览将要删除的文件（干运行）' },
                { cmd: 'git reflog', desc: '查看引用日志，可用于恢复误删提交' }
            ]
        },
        tag: {
            title: '标签管理',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
            commands: [
                { cmd: 'git tag', desc: '列出所有标签' },
                { cmd: 'git tag <name>', desc: '创建轻量标签' },
                { cmd: 'git tag -a <name> -m "msg"', desc: '创建附注标签' },
                { cmd: 'git tag <name> <commit>', desc: '为指定提交创建标签' },
                { cmd: 'git tag -d <name>', desc: '删除本地标签' },
                { cmd: 'git push <remote> <tag>', desc: '推送标签到远程' },
                { cmd: 'git push <remote> --tags', desc: '推送所有标签到远程' },
                { cmd: 'git push --delete <remote> <tag>', desc: '删除远程标签' },
                { cmd: 'git checkout <tag>', desc: '切换到指定标签' },
                { cmd: 'git show <tag>', desc: '查看标签详细信息' }
            ]
        },
        stash: {
            title: '储藏操作',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
            commands: [
                { cmd: 'git stash', desc: '储藏当前工作区更改' },
                { cmd: 'git stash save "message"', desc: '储藏并添加描述信息' },
                { cmd: 'git stash -u', desc: '储藏更改（包含未跟踪文件）' },
                { cmd: 'git stash list', desc: '查看所有储藏记录' },
                { cmd: 'git stash show', desc: '查看最近储藏的更改摘要' },
                { cmd: 'git stash show -p', desc: '查看最近储藏的详细更改' },
                { cmd: 'git stash pop', desc: '应用最近储藏并删除记录' },
                { cmd: 'git stash apply', desc: '应用最近储藏（保留记录）' },
                { cmd: 'git stash apply stash@{n}', desc: '应用指定储藏' },
                { cmd: 'git stash drop stash@{n}', desc: '删除指定储藏' },
                { cmd: 'git stash clear', desc: '删除所有储藏' },
                { cmd: 'git stash branch <name>', desc: '基于储藏创建新分支' }
            ]
        }
    };

    // State
    let state = {
        searchQuery: '',
        collapsedCategories: new Set()
    };

    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const categoriesWrapper = document.getElementById('categoriesWrapper');
    const notification = document.getElementById('notification');

    // Render all categories
    function renderCategories() {
        categoriesWrapper.innerHTML = '';
        let hasResults = false;

        Object.entries(commandsData).forEach(([key, category]) => {
            const filteredCommands = filterCommands(category.commands);

            if (state.searchQuery && filteredCommands.length === 0) {
                return; // Skip categories with no matching commands
            }

            hasResults = true;
            const isCollapsed = state.collapsedCategories.has(key);

            const section = document.createElement('div');
            section.className = `category-section${isCollapsed ? ' collapsed' : ''}`;
            section.dataset.category = key;

            const displayCommands = state.searchQuery ? filteredCommands : category.commands;

            section.innerHTML = `
                <div class="category-header">
                    <div class="category-icon ${key}">${category.icon}</div>
                    <span class="category-title">${category.title}</span>
                    <span class="category-count">${displayCommands.length}</span>
                    <div class="category-toggle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>
                <div class="category-content">
                    ${displayCommands.map((cmd, index) => `
                        <div class="command-card" data-command="${escapeHtml(cmd.cmd)}">
                            <code class="command-code">${escapeHtml(cmd.cmd)}</code>
                            <p class="command-desc">${escapeHtml(cmd.desc)}</p>
                            <button class="command-copy" title="复制">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;

            categoriesWrapper.appendChild(section);
        });

        if (!hasResults) {
            categoriesWrapper.innerHTML = `
                <div class="no-results">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                        <path d="M8 11h6"/>
                    </svg>
                    <p>未找到匹配的命令</p>
                </div>
            `;
        }
    }

    // Filter commands based on search query
    function filterCommands(commands) {
        if (!state.searchQuery) return commands;

        const query = state.searchQuery.toLowerCase();
        return commands.filter(cmd =>
            cmd.cmd.toLowerCase().includes(query) ||
            cmd.desc.toLowerCase().includes(query)
        );
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Copy command to clipboard
    async function copyCommand(text) {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('已复制到剪贴板');
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showNotification('已复制到剪贴板');
                return true;
            } catch (e) {
                showNotification('复制失败');
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    // Show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    // Event Handlers
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        renderCategories();
    });

    categoriesWrapper.addEventListener('click', async (e) => {
        const card = e.target.closest('.command-card');
        const header = e.target.closest('.category-header');

        if (header) {
            const section = header.closest('.category-section');
            const category = section.dataset.category;

            if (state.collapsedCategories.has(category)) {
                state.collapsedCategories.delete(category);
            } else {
                state.collapsedCategories.add(category);
            }
            section.classList.toggle('collapsed');
            return;
        }

        if (card) {
            const command = card.dataset.command;
            const success = await copyCommand(command);

            if (success) {
                card.classList.add('copied');
                setTimeout(() => {
                    card.classList.remove('copied');
                }, 1500);
            }
        }
    });

    // Keyboard shortcut for search
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }

        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.blur();
            searchInput.value = '';
            state.searchQuery = '';
            renderCategories();
        }
    });

    // Initialize
    renderCategories();
})();

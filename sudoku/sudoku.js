class SudokuGame {
    constructor() {
        this.currentMode = '3x3';
        this.gridSize = 9;
        this.subgridRows = 3;
        this.subgridCols = 3;
        this.grid = [];
        this.solution = [];
        this.fixedCells = [];
        this.timer = null;
        this.seconds = 0;
        this.showErrors = true;
        this.showHints = true;
        this.highlightSelected = false;
        this.selectedNumber = null;
        this.successCount = 0;
        this.bestTime = null;
        this.gameStarted = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadStats();
    }
    
    initializeElements() {
        this.gridElement = document.getElementById('sudokuGrid');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.submitBtn = document.getElementById('submitBtn');

        this.showErrorsCheckbox = document.getElementById('showErrors');
        this.showHintsCheckbox = document.getElementById('showHints');
        this.difficultySelect = document.getElementById('difficulty');
        this.highlightSelectedCheckbox = document.getElementById('highlightSelected');
        this.successCountElement = document.getElementById('successCount');
        this.bestTimeElement = document.getElementById('bestTime');
        this.currentTimeElement = document.getElementById('currentTime');
        this.victoryModal = document.getElementById('victoryModal');
        this.victoryTimeElement = document.getElementById('victoryTime');
        this.numberPanelElement = document.getElementById('numberPanel');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => {
            if (this.gameStarted) {
                this.resetGame();
            } else {
                this.startGame();
            }
        });
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.submitBtn.addEventListener('click', () => this.submitSolution());

        this.showErrorsCheckbox.addEventListener('change', (e) => this.showErrors = e.target.checked);
        this.showHintsCheckbox.addEventListener('change', (e) => this.showHints = e.target.checked);
        this.highlightSelectedCheckbox.addEventListener('change', (e) => {
            this.highlightSelected = e.target.checked;
            this.updateHighlights();
        });
    }
    

    generatePuzzle() {
        // 生成完整的数独解
        this.solution = this.generateCompleteSudoku();
        
        // 根据难度移除一些数字
        const difficulty = this.difficultySelect.value;
        const cellsToRemove = difficulty === 'easy' ? this.gridSize * 2 : 
                             difficulty === 'medium' ? this.gridSize * 3 : 
                             this.gridSize * 4;
        
        this.grid = this.solution.map(row => [...row]);
        this.fixedCells = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(false));
        
        // 随机移除数字
        let removed = 0;
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);
            if (this.grid[row][col] !== 0) {
                this.grid[row][col] = 0;
                removed++;
            }
        }
        
        // 标记固定单元格
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.fixedCells[i][j] = this.grid[i][j] !== 0;
            }
        }
    }
    
    generateCompleteSudoku() {
        const grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        
        // 填充对角线的子网格
        for (let i = 0; i < this.gridSize; i += this.subgridRows) {
            this.fillSubgrid(grid, i, i);
        }
        
        // 使用回溯算法填充剩余单元格
        this.solveSudoku(grid);
        return grid;
    }
    
    fillSubgrid(grid, row, col) {
        const numbers = this.getValidNumbers();
        for (let i = 0; i < this.subgridRows; i++) {
            for (let j = 0; j < this.subgridCols; j++) {
                const randomIndex = Math.floor(Math.random() * numbers.length);
                grid[row + i][col + j] = numbers.splice(randomIndex, 1)[0];
            }
        }
    }
    
    getValidNumbers() {
        const numbers = [];
        for (let i = 1; i <= this.gridSize; i++) {
            numbers.push(i);
        }
        return numbers;
    }
    
    solveSudoku(grid) {
        const emptyCell = this.findEmptyCell(grid);
        if (!emptyCell) return true;
        
        const [row, col] = emptyCell;
        const numbers = this.shuffleArray(this.getValidNumbers());
        
        for (const num of numbers) {
            if (this.isValidMove(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (this.solveSudoku(grid)) {
                    return true;
                }
                
                grid[row][col] = 0;
            }
        }
        
        return false;
    }
    
    findEmptyCell(grid) {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (grid[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null;
    }
    
    isValidMove(grid, row, col, num) {
        // 检查行
        for (let j = 0; j < this.gridSize; j++) {
            if (j !== col && grid[row][j] === num) return false;
        }

        // 检查列
        for (let i = 0; i < this.gridSize; i++) {
            if (i !== row && grid[i][col] === num) return false;
        }

        // 检查子网格
        const startRow = Math.floor(row / this.subgridRows) * this.subgridRows;
        const startCol = Math.floor(col / this.subgridCols) * this.subgridCols;

        for (let i = startRow; i < startRow + this.subgridRows; i++) {
            for (let j = startCol; j < startCol + this.subgridCols; j++) {
                if ((i !== row || j !== col) && grid[i][j] === num) return false;
            }
        }

        return true;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    renderNumberPanel() {
        this.numberPanelElement.innerHTML = '';
        const buttonsPerRow = 3;

        for (let i = 0; i < this.gridSize; i += buttonsPerRow) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'number-row';

            for (let j = 0; j < buttonsPerRow && i + j < this.gridSize; j++) {
                const num = i + j + 1;
                const btn = document.createElement('button');
                btn.textContent = num;
                btn.className = 'number-btn';
                btn.dataset.num = num;
                btn.addEventListener('click', () => this.selectNumber(num));
                rowDiv.appendChild(btn);
            }

            this.numberPanelElement.appendChild(rowDiv);
        }
    }

    updateNumberPanel() {
        for (let num = 1; num <= this.gridSize; num++) {
            const count = this.grid.flat().filter(val => val === num).length;
            const btn = this.numberPanelElement.querySelector(`[data-num="${num}"]`);
            if (btn) {
                if (count === this.gridSize) {
                    btn.disabled = false;
                    btn.classList.add('disabled');
                } else {
                    btn.disabled = false;
                    btn.classList.remove('disabled');
                }
            }
        }
    }

    selectNumber(num) {
        if (!this.gameStarted) return;

        if (this.selectedNumber === num) {
            this.selectedNumber = null;
        } else {
            this.selectedNumber = num;
        }
        this.updateButtonStyles();
        this.updateHighlights();
    }

    updateButtonStyles() {
        for (let btn of this.numberPanelElement.querySelectorAll('.number-btn')) {
            btn.classList.toggle('selected', parseInt(btn.dataset.num) === this.selectedNumber);
        }
    }

    updateHighlights() {
        // Remove all highlight-selected
        for (let cell of this.gridElement.children) {
            cell.classList.remove('highlight-selected');
        }

        if (this.selectedNumber && this.highlightSelected) {
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (this.grid[i][j] === this.selectedNumber) {
                        const cell = this.gridElement.children[i * this.gridSize + j];
                        cell.classList.add('highlight-selected');
                    }
                }
            }
        }
    }
    
    renderGrid() {
        this.gridElement.innerHTML = '';
        this.gridElement.className = `sudoku-grid grid-${this.gridSize}x${this.gridSize}`;
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // 添加子网格边框
                if ((j + 1) % this.subgridCols === 0 && j !== this.gridSize - 1) {
                    cell.classList.add('subgrid-border-right');
                }
                if ((i + 1) % this.subgridRows === 0 && i !== this.gridSize - 1) {
                    cell.classList.add('subgrid-border-bottom');
                }
                
                if (this.fixedCells[i][j]) {
                    cell.textContent = this.grid[i][j];
                    cell.classList.add('fixed');
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.value = this.grid[i][j] === 0 ? '' : this.grid[i][j];
                    
                    input.addEventListener('input', (e) => {
                        // Prevent input if game hasn't started
                        if (!this.gameStarted) {
                            e.target.value = '';
                            return;
                        }

                        const value = e.target.value;
                        const cell = e.target.parentElement;
                        if (value && (value < '1' || value > this.gridSize.toString())) {
                            e.target.value = '';
                            cell.classList.remove('error', 'correct');
                            return;
                        }

                        this.grid[i][j] = value ? parseInt(value) : 0;

                        if (!value) {
                            cell.classList.remove('error', 'correct');
                        } else if (this.showErrors) {
                            this.validateAllCells();
                        }

                        this.updateNumberPanel();
                        this.updateHighlights();
                    });
                    
                    cell.appendChild(input);
                }
                
                this.gridElement.appendChild(cell);
            }
        }

        this.renderNumberPanel();
        this.updateNumberPanel();
        this.updateHighlights();
    }
    
    validateCell(row, col) {
        const value = this.grid[row][col];
        const cell = this.gridElement.children[row * this.gridSize + col];
        
        if (value === 0) {
            cell.classList.remove('error', 'correct');
            return;
        }
        
        const isValid = this.isValidMove(this.grid, row, col, value);
        
        if (isValid) {
            cell.classList.remove('error');
            cell.classList.add('correct');
        } else {
            cell.classList.remove('correct');
            cell.classList.add('error');
        }
    }

    validateAllCells() {
        // 首先清除所有错误标记
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cell = this.gridElement.children[i * this.gridSize + j];
                if (!this.fixedCells[i][j]) {
                    cell.classList.remove('error');
                }
            }
        }
        
        // 然后重新验证所有非空单元格
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== 0 && !this.fixedCells[i][j]) {
                    this.validateCell(i, j);
                }
            }
        }
    }
    
    startGame() {
        // Only generate puzzle if grid doesn't exist (first time or after restart)
        if (this.grid.length === 0) {
            this.generatePuzzle();
            this.renderGrid();
        }
        this.resetTimer();
        this.gameStarted = true;
        this.startBtn.textContent = '重置';
        this.startBtn.disabled = false;
        this.restartBtn.style.display = 'inline-block';
    }

    resetGame() {
        // Clear user input (non-fixed cells)
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.fixedCells[i][j]) {
                    this.grid[i][j] = 0;
                }
            }
        }
        this.renderGrid();
        this.resetTimer();
    }

    resetTimer() {
        this.stopTimer();
        this.seconds = 0;
        this.updateTimeDisplay();
        this.startTimer();
    }
    
    restartGame() {
        this.gameStarted = false;
        this.startBtn.textContent = '开始';
        this.restartBtn.style.display = 'none';
        this.stopTimer();
        this.seconds = 0;
        this.updateTimeDisplay();
        this.startBtn.disabled = false;

        if (this.grid.length > 0) {
            this.generatePuzzle();
            this.renderGrid();
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateTimeDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    updateTimeDisplay() {
        const minutes = Math.floor(this.seconds / 60);
        const seconds = this.seconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timeDisplay.textContent = timeString;
        this.currentTimeElement.textContent = timeString;
    }
    
    submitSolution() {
        if (!this.gameStarted) {
            this.showToast('请先开始游戏！');
            return;
        }

        if (!this.isGridComplete()) {
            this.showToast('请完成所有空格！');
            return;
        }

        if (this.isSolutionCorrect()) {
            this.stopTimer();
            this.successCount++;
            this.updateBestTime();
            this.saveStats();
            this.showVictoryModal();
        } else {
            this.highlightErrors();
            this.showToast('答案不正确，请检查标红的单元格！');
        }
    }
    
    isGridComplete() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }
        return true;
    }
    
    isSolutionCorrect() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== this.solution[i][j]) return false;
            }
        }
        return true;
    }
    
    highlightErrors() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== this.solution[i][j]) {
                    const cell = this.gridElement.children[i * this.gridSize + j];
                    cell.classList.add('error');
                }
            }
        }
    }
    
    showVictoryModal() {
        this.victoryTimeElement.textContent = `完成时间：${this.timeDisplay.textContent}`;
        this.victoryModal.style.display = 'block';
        this.successCountElement.textContent = this.successCount;
    }
    
    updateBestTime() {
        if (!this.bestTime || this.seconds < this.bestTime) {
            this.bestTime = this.seconds;
            const minutes = Math.floor(this.bestTime / 60);
            const seconds = this.bestTime % 60;
            this.bestTimeElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    saveStats() {
        localStorage.setItem('sudokuStats', JSON.stringify({
            successCount: this.successCount,
            bestTime: this.bestTime
        }));
    }
    
    loadStats() {
        const stats = localStorage.getItem('sudokuStats');
        if (stats) {
            const parsed = JSON.parse(stats);
            this.successCount = parsed.successCount || 0;
            this.bestTime = parsed.bestTime;

            this.successCountElement.textContent = this.successCount;
            if (this.bestTime) {
                const minutes = Math.floor(this.bestTime / 60);
                const seconds = this.bestTime % 60;
                this.bestTimeElement.textContent =
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger reflow
        toast.offsetHeight;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// 全局函数
function closeVictoryModal() {
    document.getElementById('victoryModal').style.display = 'none';
    game.restartGame();
}

// 初始化游戏
const game = new SudokuGame();

// Tic-Tac-Toe Game Logic
class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'heart'; // Player is hearts, computer is X
        this.gameActive = true;
        this.cells = document.querySelectorAll('.cell');
        this.statusDisplay = document.getElementById('game-status');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];
        
        this.init();
    }
    
    init() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.updateStatus("Tới lượt em đó! Cho anh một ❤️ đi, năn nỉii");
    }
    
    handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (this.board[clickedCellIndex] !== '' || !this.gameActive) {
            return;
        }
        
        this.makeMove(clickedCellIndex, 'heart');
        
        if (this.gameActive) {
            setTimeout(() => this.computerMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].textContent = player === 'heart' ? '❤️' : '✗';
        this.cells[index].classList.add('taken');
        
        this.checkResult();
    }
    
    computerMove() {
        if (!this.gameActive) return;
        
        // Simple AI: Try to win, block, or random
        let move = this.findBestMove();
        
        if (move !== null) {
            this.makeMove(move, 'x');
        }
    }
    
    findBestMove() {
        // First, try to win
        for (let i = 0; i < 8; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'x';
                if (this.checkWinningMove('x')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Second, block player from winning
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'heart';
                if (this.checkWinningMove('heart')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Third, take center if available
        if (this.board[4] === '') return 4;
        
        // Fourth, take a corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Finally, take any available space
        const availableMoves = this.board.map((cell, idx) => cell === '' ? idx : null).filter(val => val !== null);
        if (availableMoves.length > 0) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        
        return null;
    }
    
    checkWinningMove(player) {
        return this.winningConditions.some(condition => {
            return condition.every(index => this.board[index] === player);
        });
    }
    
    checkResult() {
        let roundWon = false;
        let winningCombination = null;
        
        for (let i = 0; i < this.winningConditions.length; i++) {
            const condition = this.winningConditions[i];
            const a = this.board[condition[0]];
            const b = this.board[condition[1]];
            const c = this.board[condition[2]];
            
            if (a === '' || b === '' || c === '') {
                continue;
            }
            
            if (a === b && b === c) {
                roundWon = true;
                winningCombination = condition;
                break;
            }
        }
        
        if (roundWon) {
            const winner = this.board[winningCombination[0]];
            
            // Highlight winning cells
            winningCombination.forEach(index => {
                this.cells[index].classList.add('winner');
            });
            
            if (winner === 'heart') {
                this.updateStatus("🎉 Giỏi quá! Bé thắng rồi nè 🎉");
                this.gameActive = false;
                
                // Trigger transition to gallery after celebration
                setTimeout(() => {
                    this.triggerVictory();
                }, 2000);
            } else {
                this.updateStatus("Awww! Ráng thử lại lần nữa ii, sắp thắng gòi 💪\nHint nhé: 3 góc là thắng đóoo");
                this.gameActive = false;
            }
            return;
        }
        
        // Check for draw
        const roundDraw = !this.board.includes('');
        if (roundDraw) {
            this.updateStatus("Hòa rùi, chơi lại ii 🤝");
            this.gameActive = false;
            return;
        }
        
        // Continue game
        this.currentPlayer = this.currentPlayer === 'heart' ? 'x' : 'heart';
        if (this.currentPlayer === 'heart') {
            this.updateStatus("Tới lượt em đó! Đi iii");
        }
    }
    
    updateStatus(message) {
        this.statusDisplay.textContent = message;
    }
    
    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.currentPlayer = 'heart';
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'winner');
        });
        
        this.updateStatus("Cho anh một ❤️ đi");
    }
    
    triggerVictory() {
        // Emit custom event for victory
        const victoryEvent = new CustomEvent('gameWon');
        document.dispatchEvent(victoryEvent);
    }
}

// Initialize game when DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new TicTacToe();
});

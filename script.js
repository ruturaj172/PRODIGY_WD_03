document.addEventListener('DOMContentLoaded', () => {
    const gameBoardElement = document.getElementById('gameBoard');
    const statusArea = document.getElementById('statusArea');
    const resetButton = document.getElementById('resetButton');

    let currentPlayer = 'X'; // Human player always starts as X
    const AI_PLAYER = 'O';
    let board = ['', '', '', '', '', '', '', '', '']; // 9 cells
    let gameActive = true;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function initializeBoard() {
        gameBoardElement.innerHTML = '';
        board.forEach((_, index) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = index;
            cell.addEventListener('click', handleCellClick);
            gameBoardElement.appendChild(cell);
        });
    }

    function handleCellClick(event) {
        if (!gameActive || currentPlayer === AI_PLAYER) return; // Ignore clicks if game over or AI's turn

        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.dataset.index);

        if (board[clickedCellIndex] !== '') {
            return; // Cell already played
        }

        makeMove(clickedCellIndex, currentPlayer);

        if (gameActive && currentPlayer === AI_PLAYER) { // If game still active, it's AI's turn
            // Add a small delay for AI's move to make it feel more natural
            setTimeout(aiMakeMove, 500); // 500ms delay
        }
    }

    function makeMove(index, player) {
        if (board[index] !== '' || !gameActive) return false; // Can't make move

        board[index] = player;
        const cellElement = document.querySelector(`.cell[data-index='${index}']`);
        if (cellElement) {
            cellElement.textContent = player;
            cellElement.classList.add(player.toLowerCase());
        }

        if (checkWin(player)) {
            statusArea.textContent = `Player ${player} wins!`;
            gameActive = false;
            highlightWinningCells(player);
        } else if (board.every(cell => cell !== '')) {
            statusArea.textContent = "It's a draw!";
            gameActive = false;
        } else {
            switchPlayer();
        }
        return true;
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusArea.textContent = (gameActive) ? `Player ${currentPlayer}'s turn` : statusArea.textContent;
    }

    function checkWin(player) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] === player && board[b] === player && board[c] === player) {
                return true;
            }
        }
        return false;
    }

    function highlightWinningCells(player) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] === player && board[b] === player && board[c] === player) {
                [a, b, c].forEach(index => {
                    const cell = document.querySelector(`.cell[data-index='${index}']`);
                    if (cell) cell.style.backgroundColor = '#90ee90'; // Light green
                });
                break; // Stop after finding the first win to highlight
            }
        }
    }

    function resetGame() {
        currentPlayer = 'X';
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        statusArea.textContent = `Player ${currentPlayer}'s turn`;

        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
            cell.style.backgroundColor = '';
        });
        // If you re-create cells on reset, you'd call initializeBoard() here.
        // For this setup, clearing is enough.
    }

    // --- AI Logic ---
    function aiMakeMove() {
        if (!gameActive || currentPlayer !== AI_PLAYER) return;

        let bestMove = -1;

        // 1. Check if AI can win
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = AI_PLAYER; // Try move
                if (checkWin(AI_PLAYER)) {
                    bestMove = i;
                    board[i] = ''; // Undo try
                    break;
                }
                board[i] = ''; // Undo try
            }
        }

        // 2. Check if player can win (and block)
        if (bestMove === -1) {
            const humanPlayer = 'X';
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = humanPlayer; // Try opponent's winning move
                    if (checkWin(humanPlayer)) {
                        bestMove = i; // This is the spot to block
                        board[i] = ''; // Undo try
                        break;
                    }
                    board[i] = ''; // Undo try
                }
            }
        }

        // 3. Try to take the center
        if (bestMove === -1 && board[4] === '') {
            bestMove = 4;
        }

        // 4. Try to take a corner
        if (bestMove === -1) {
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(index => board[index] === '');
            if (availableCorners.length > 0) {
                bestMove = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
        }

        // 5. Try to take a side
        if (bestMove === -1) {
            const sides = [1, 3, 5, 7];
            const availableSides = sides.filter(index => board[index] === '');
            if (availableSides.length > 0) {
                bestMove = availableSides[Math.floor(Math.random() * availableSides.length)];
            }
        }
        
        // 6. Fallback: Take any available spot (should be covered by above if game not over)
        if (bestMove === -1) {
            const availableCells = [];
            board.forEach((cell, index) => {
                if (cell === '') availableCells.push(index);
            });
            if (availableCells.length > 0) {
                bestMove = availableCells[Math.floor(Math.random() * availableCells.length)];
            }
        }


        if (bestMove !== -1) {
            makeMove(bestMove, AI_PLAYER);
        }
        // If bestMove is still -1, it means no moves are possible (draw or error),
        // but makeMove should handle gameActive status.
    }

    // Initialize the game
    initializeBoard();
    resetButton.addEventListener('click', resetGame);
    statusArea.textContent = `Player ${currentPlayer}'s turn`; // Initial status
});
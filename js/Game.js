/**
 * Chess Game Engine
 * Manages game state, moves, and UI
 */
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.selectedSquare = null;
        this.validMoves = [];
        this.lastMove = null;
        this.whiteScore = 0;
        this.blackScore = 0;
        this.gameOver = false;
        this.moveCount = 0;

        // Timer properties
        this.whiteTime = 600; // 10 minutes in seconds
        this.blackTime = 600;
        this.timerInterval = null;
        this.timerStarted = false;

        // UI elements
        this.boardElement = document.getElementById('chess-board');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.whiteTimerElement = document.getElementById('white-timer');
        this.blackTimerElement = document.getElementById('black-timer');
        this.whiteScoreElement = document.querySelector('#white-score .score-value');
        this.blackScoreElement = document.querySelector('#black-score .score-value');
        this.whiteCapturedElement = document.getElementById('white-captured');
        this.blackCapturedElement = document.getElementById('black-captured');

        this.setupEventListeners();
        this.renderBoard();
        this.updateUI();
    }

    /**
     * Initialize the chess board with pieces in starting positions
     */
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Black pieces (row 0 and 1)
        board[0][0] = new Rook(0, 0, 'black');
        board[0][1] = new Knight(0, 1, 'black');
        board[0][2] = new Bishop(0, 2, 'black');
        board[0][3] = new Queen(0, 3, 'black');
        board[0][4] = new King(0, 4, 'black');
        board[0][5] = new Bishop(0, 5, 'black');
        board[0][6] = new Knight(0, 6, 'black');
        board[0][7] = new Rook(0, 7, 'black');

        for (let col = 0; col < 8; col++) {
            board[1][col] = new Pawn(1, col, 'black');
        }

        // White pieces (row 6 and 7)
        for (let col = 0; col < 8; col++) {
            board[6][col] = new Pawn(6, col, 'white');
        }

        board[7][0] = new Rook(7, 0, 'white');
        board[7][1] = new Knight(7, 1, 'white');
        board[7][2] = new Bishop(7, 2, 'white');
        board[7][3] = new Queen(7, 3, 'white');
        board[7][4] = new King(7, 4, 'white');
        board[7][5] = new Bishop(7, 5, 'white');
        board[7][6] = new Knight(7, 6, 'white');
        board[7][7] = new Rook(7, 7, 'white');

        return board;
    }

    /**
     * Render the chess board in the DOM
     */
    renderBoard() {
        this.boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = piece.symbol;
                    pieceElement.dataset.color = piece.color;
                    square.appendChild(pieceElement);
                }

                this.boardElement.appendChild(square);
            }
        }
    }

    /**
     * Setup event listeners for the game
     */
    setupEventListeners() {
        // Board clicks
        this.boardElement.addEventListener('click', (e) => this.handleSquareClick(e));

        // Start game button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        // Flip board button
        const flipBtn = document.getElementById('flip-btn');
        if (flipBtn) {
            flipBtn.addEventListener('click', () => this.flipBoard());
        }

        // New game button (from game over modal)
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.resetGame());
        }
    }

    /**
     * Start the game
     */
    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
    }

    /**
     * Handle square click
     */
    handleSquareClick(e) {
        if (this.gameOver) return;

        const square = e.target.closest('.square');
        if (!square) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = this.board[row][col];

        // If a piece is already selected
        if (this.selectedPiece) {
            // Check if the clicked square is a valid move
            const isValidMove = this.validMoves.some(move => move.row === row && move.col === col);

            if (isValidMove) {
                this.makeMove(this.selectedPiece, row, col);
            } else if (piece && piece.color === this.currentTurn) {
                // Select a different piece of the same color
                this.selectPiece(row, col);
            } else {
                // Deselect
                this.deselectPiece();
            }
        } else {
            // Select a piece
            if (piece && piece.color === this.currentTurn) {
                this.selectPiece(row, col);
            }
        }
    }

    /**
     * Select a piece and show valid moves
     */
    selectPiece(row, col) {
        this.deselectPiece();

        const piece = this.board[row][col];
        if (!piece || piece.color !== this.currentTurn) return;

        this.selectedPiece = piece;
        this.selectedSquare = { row, col };

        // Get all possible moves
        let moves = piece.getPossibleMoves(this.board);

        // Add special moves
        if (piece.type === 'king') {
            moves.push(...piece.getCastlingMoves(this.board, this));
        } else if (piece.type === 'pawn') {
            moves.push(...piece.getEnPassantMoves(this.board, this));
        }

        // Filter out moves that would put own king in check
        this.validMoves = moves.filter(move => {
            return !this.wouldMoveExposeKing(piece, move);
        });

        // Highlight selected square and valid moves
        this.highlightSquare(row, col, 'selected');
        this.validMoves.forEach(move => {
            this.highlightSquare(move.row, move.col, 'valid-move');
            const targetPiece = this.board[move.row][move.col];
            if (targetPiece) {
                this.getSquareElement(move.row, move.col).classList.add('has-piece');
            }
        });
    }

    /**
     * Deselect the current piece
     */
    deselectPiece() {
        this.selectedPiece = null;
        this.selectedSquare = null;
        this.validMoves = [];

        // Remove all highlights
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'valid-move', 'has-piece');
        });
    }

    /**
     * Make a move
     */
    makeMove(piece, toRow, toCol) {
        // Start timer on first move
        if (!this.timerStarted) {
            this.startTimer();
            this.timerStarted = true;
        }

        const fromRow = piece.row;
        const fromCol = piece.col;
        const capturedPiece = this.board[toRow][toCol];
        let isEnPassant = false;
        let isCastling = false;

        // Check for special moves
        const move = this.validMoves.find(m => m.row === toRow && m.col === toCol);

        // Handle en passant
        if (move && move.isEnPassant) {
            isEnPassant = true;
            const capturedPawn = this.board[move.captureRow][move.captureCol];
            this.capturePiece(capturedPawn);
            this.board[move.captureRow][move.captureCol] = null;
        }

        // Handle castling
        if (move && move.isCastling) {
            isCastling = true;
            const rookCol = move.isKingside ? 7 : 0;
            const rookNewCol = move.isKingside ? 5 : 3;
            const rook = this.board[toRow][rookCol];

            this.board[toRow][rookNewCol] = rook;
            this.board[toRow][rookCol] = null;
            rook.moveTo(toRow, rookNewCol);
        }

        // Capture piece if present (normal capture)
        if (capturedPiece && !isEnPassant) {
            this.capturePiece(capturedPiece);
        }

        // Move the piece
        this.board[fromRow][fromCol] = null;
        this.board[toRow][toCol] = piece;
        piece.moveTo(toRow, toCol);

        // Handle pawn promotion
        if (piece.type === 'pawn' && piece.shouldPromote()) {
            this.showPromotionModal(piece);
            return; // Don't continue turn until promotion is chosen
        }

        // Store last move for en passant
        this.lastMove = {
            piece: piece,
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol }
        };

        this.moveCount++;
        this.completeTurn();
    }

    /**
     * Complete the current turn
     */
    completeTurn() {
        this.deselectPiece();
        this.switchTurn();
        this.renderBoard();
        this.updateUI();

        // Check for check, checkmate, or stalemate
        if (this.isKingInCheck(this.currentTurn)) {
            this.highlightKingInCheck(this.currentTurn);

            if (this.isCheckmate(this.currentTurn)) {
                this.endGame('checkmate');
                return;
            }
        } else if (this.isStalemate(this.currentTurn)) {
            this.endGame('stalemate');
            return;
        }
    }

    /**
     * Capture a piece
     */
    capturePiece(piece) {
        const capturedElement = piece.color === 'white' ? this.whiteCapturedElement : this.blackCapturedElement;
        const scoreElement = piece.color === 'white' ? this.blackScoreElement : this.whiteScoreElement;

        // Add to captured pieces display
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'captured-piece';
        pieceDiv.textContent = piece.symbol;
        capturedElement.appendChild(pieceDiv);

        // Update score
        if (piece.color === 'white') {
            this.blackScore += piece.getValue();
            this.blackScoreElement.textContent = this.blackScore;
        } else {
            this.whiteScore += piece.getValue();
            this.whiteScoreElement.textContent = this.whiteScore;
        }
    }

    /**
     * Show pawn promotion modal
     */
    showPromotionModal(pawn) {
        const modal = document.getElementById('promotion-modal');
        const choicesDiv = document.getElementById('promotion-choices');
        choicesDiv.innerHTML = '';

        const pieceTypes = ['queen', 'rook', 'bishop', 'knight'];

        pieceTypes.forEach(type => {
            const tempPiece = new (type === 'queen' ? Queen :
                                  type === 'rook' ? Rook :
                                  type === 'bishop' ? Bishop : Knight)(0, 0, pawn.color);

            const choiceDiv = document.createElement('div');
            choiceDiv.className = 'promotion-piece';
            choiceDiv.textContent = tempPiece.symbol;
            choiceDiv.addEventListener('click', () => {
                this.promotePawn(pawn, type);
                modal.classList.add('hidden');
            });

            choicesDiv.appendChild(choiceDiv);
        });

        modal.classList.remove('hidden');
    }

    /**
     * Promote a pawn to another piece
     */
    promotePawn(pawn, pieceType) {
        const PieceClass = pieceType === 'queen' ? Queen :
                          pieceType === 'rook' ? Rook :
                          pieceType === 'bishop' ? Bishop : Knight;

        const newPiece = new PieceClass(pawn.row, pawn.col, pawn.color);
        newPiece.hasMoved = true;
        this.board[pawn.row][pawn.col] = newPiece;

        this.completeTurn();
    }

    /**
     * Switch to the next player's turn
     */
    switchTurn() {
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    }

    /**
     * Check if a move would expose the king to check
     */
    wouldMoveExposeKing(piece, move) {
        // Make a temporary move
        const originalRow = piece.row;
        const originalCol = piece.col;
        const targetPiece = this.board[move.row][move.col];

        // Handle en passant capture
        let enPassantPawn = null;
        if (move.isEnPassant) {
            enPassantPawn = this.board[move.captureRow][move.captureCol];
            this.board[move.captureRow][move.captureCol] = null;
        }

        // Simulate the move
        this.board[originalRow][originalCol] = null;
        this.board[move.row][move.col] = piece;
        piece.row = move.row;
        piece.col = move.col;

        // Check if king is in check
        const inCheck = this.isKingInCheck(piece.color);

        // Undo the move
        piece.row = originalRow;
        piece.col = originalCol;
        this.board[originalRow][originalCol] = piece;
        this.board[move.row][move.col] = targetPiece;

        // Restore en passant pawn
        if (move.isEnPassant) {
            this.board[move.captureRow][move.captureCol] = enPassantPawn;
        }

        return inCheck;
    }

    /**
     * Check if a king is in check
     */
    isKingInCheck(color) {
        // Find the king
        let kingPos = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingPos = { row, col };
                    break;
                }
            }
            if (kingPos) break;
        }

        if (!kingPos) return false;

        return this.isSquareUnderAttack(kingPos.row, kingPos.col, color);
    }

    /**
     * Check if a square is under attack by the opponent
     */
    isSquareUnderAttack(row, col, defenderColor) {
        const attackerColor = defenderColor === 'white' ? 'black' : 'white';

        // Check all opponent pieces
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === attackerColor) {
                    const moves = piece.getPossibleMoves(this.board);

                    for (const move of moves) {
                        if (move.row === row && move.col === col) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if the current player is in checkmate
     */
    isCheckmate(color) {
        if (!this.isKingInCheck(color)) {
            return false;
        }

        return this.hasNoLegalMoves(color);
    }

    /**
     * Check if the current player is in stalemate
     */
    isStalemate(color) {
        if (this.isKingInCheck(color)) {
            return false;
        }

        return this.hasNoLegalMoves(color);
    }

    /**
     * Check if a player has no legal moves
     */
    hasNoLegalMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    let moves = piece.getPossibleMoves(this.board);

                    // Add special moves
                    if (piece.type === 'king') {
                        moves.push(...piece.getCastlingMoves(this.board, this));
                    } else if (piece.type === 'pawn') {
                        moves.push(...piece.getEnPassantMoves(this.board, this));
                    }

                    // Check if any move is legal
                    for (const move of moves) {
                        if (!this.wouldMoveExposeKing(piece, move)) {
                            return false; // Found a legal move
                        }
                    }
                }
            }
        }

        return true; // No legal moves found
    }

    /**
     * Highlight the king square when in check
     */
    highlightKingInCheck(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    this.highlightSquare(row, col, 'in-check');
                    return;
                }
            }
        }
    }

    /**
     * End the game
     */
    endGame(reason) {
        this.gameOver = true;
        this.stopTimer();

        const modal = document.getElementById('game-over-modal');
        const resultText = document.getElementById('game-result');
        const winnerText = document.getElementById('winner-text');

        if (reason === 'checkmate') {
            const winner = this.currentTurn === 'white' ? 'Black' : 'White';
            resultText.textContent = 'Checkmate!';
            winnerText.textContent = `${winner} wins!`;
        } else if (reason === 'stalemate') {
            resultText.textContent = 'Stalemate!';
            winnerText.textContent = 'The game is a draw.';
        } else if (reason === 'timeout') {
            const winner = this.currentTurn === 'white' ? 'Black' : 'White';
            resultText.textContent = 'Time Out!';
            winnerText.textContent = `${winner} wins by timeout!`;
        }

        modal.classList.remove('hidden');
    }

    /**
     * Start the game timer
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.currentTurn === 'white') {
                this.whiteTime--;
                if (this.whiteTime <= 0) {
                    this.whiteTime = 0;
                    this.endGame('timeout');
                }
            } else {
                this.blackTime--;
                if (this.blackTime <= 0) {
                    this.blackTime = 0;
                    this.endGame('timeout');
                }
            }

            this.updateTimerDisplay();
        }, 1000);
    }

    /**
     * Stop the timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        this.whiteTimerElement.textContent = formatTime(this.whiteTime);
        this.blackTimerElement.textContent = formatTime(this.blackTime);
    }

    /**
     * Reset the game
     */
    resetGame() {
        // Close modals
        document.getElementById('game-over-modal').classList.add('hidden');
        document.getElementById('promotion-modal').classList.add('hidden');

        // Reset game state
        this.stopTimer();
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.selectedSquare = null;
        this.validMoves = [];
        this.lastMove = null;
        this.whiteScore = 0;
        this.blackScore = 0;
        this.gameOver = false;
        this.moveCount = 0;
        this.whiteTime = 600;
        this.blackTime = 600;
        this.timerStarted = false;

        // Clear captured pieces
        this.whiteCapturedElement.innerHTML = '';
        this.blackCapturedElement.innerHTML = '';

        // Reset UI
        this.renderBoard();
        this.updateUI();
    }

    /**
     * Flip the board
     */
    flipBoard() {
        this.boardElement.classList.toggle('flipped');
    }

    /**
     * Update UI elements
     */
    updateUI() {
        this.turnIndicator.textContent = `${this.currentTurn.charAt(0).toUpperCase() + this.currentTurn.slice(1)}'s Turn`;
        this.updateTimerDisplay();
    }

    /**
     * Get square element by position
     */
    getSquareElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    /**
     * Highlight a square
     */
    highlightSquare(row, col, className) {
        const square = this.getSquareElement(row, col);
        if (square) {
            square.classList.add(className);
        }
    }
}

// Initialize game when DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new ChessGame();
});

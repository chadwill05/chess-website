/**
 * Base Piece class
 * Uses Unicode chess symbols for display
 */
class Piece {
    constructor(row, col, color, type) {
        this.row = row;
        this.col = col;
        this.color = color; // 'white' or 'black'
        this.type = type;   // 'king', 'queen', 'rook', 'bishop', 'knight', 'pawn'
        this.hasMoved = false;
        this.symbol = this.getSymbol();
    }

    /**
     * Get Unicode symbol for the piece
     */
    getSymbol() {
        const symbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        return symbols[this.color][this.type];
    }

    /**
     * Get the value of the piece for scoring
     */
    getValue() {
        const values = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 0
        };
        return values[this.type];
    }

    /**
     * Check if a position is on the board
     */
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    /**
     * Get all possible moves for this piece (to be overridden by subclasses)
     * Returns array of {row, col} objects
     */
    getPossibleMoves(board) {
        return [];
    }

    /**
     * Helper method to add moves in a direction until blocked
     */
    addMovesInDirection(board, rowDelta, colDelta, limit = 8) {
        const moves = [];
        let currentRow = this.row + rowDelta;
        let currentCol = this.col + colDelta;
        let steps = 0;

        while (this.isValidPosition(currentRow, currentCol) && steps < limit) {
            const targetPiece = board[currentRow][currentCol];

            if (targetPiece === null) {
                // Empty square - can move here
                moves.push({ row: currentRow, col: currentCol });
            } else if (targetPiece.color !== this.color) {
                // Enemy piece - can capture
                moves.push({ row: currentRow, col: currentCol });
                break; // Can't move past this piece
            } else {
                // Friendly piece - can't move here
                break;
            }

            currentRow += rowDelta;
            currentCol += colDelta;
            steps++;
        }

        return moves;
    }

    /**
     * Move the piece to a new position
     */
    moveTo(row, col) {
        this.row = row;
        this.col = col;
        this.hasMoved = true;
    }

    /**
     * Create a copy of this piece
     */
    clone() {
        const PieceClass = this.constructor;
        const cloned = new PieceClass(this.row, this.col, this.color);
        cloned.hasMoved = this.hasMoved;
        return cloned;
    }
}

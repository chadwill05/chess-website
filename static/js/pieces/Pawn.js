/**
 * Pawn piece
 * Moves forward one square (or two from starting position)
 * Captures diagonally
 * Can promote to another piece when reaching the end
 */
class Pawn extends Piece {
    constructor(row, col, color) {
        super(row, col, color, 'pawn');
    }

    getPossibleMoves(board) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1; // White moves up (-1), black moves down (+1)

        // Forward move (one square)
        const oneSquareAhead = this.row + direction;
        if (this.isValidPosition(oneSquareAhead, this.col)) {
            if (board[oneSquareAhead][this.col] === null) {
                moves.push({ row: oneSquareAhead, col: this.col });

                // Forward move (two squares from starting position)
                const startingRow = this.color === 'white' ? 6 : 1;
                if (this.row === startingRow) {
                    const twoSquaresAhead = this.row + (direction * 2);
                    if (board[twoSquaresAhead][this.col] === null) {
                        moves.push({ row: twoSquaresAhead, col: this.col });
                    }
                }
            }
        }

        // Diagonal captures
        const captureOffsets = [-1, 1];
        for (const colOffset of captureOffsets) {
            const newRow = this.row + direction;
            const newCol = this.col + colOffset;

            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];

                // Can capture enemy piece diagonally
                if (targetPiece !== null && targetPiece.color !== this.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    /**
     * Check if pawn can capture en passant
     */
    getEnPassantMoves(board, game) {
        const moves = [];

        if (!game.lastMove) {
            return moves;
        }

        const lastMove = game.lastMove;

        // Check if last move was a pawn moving two squares
        if (lastMove.piece.type !== 'pawn') {
            return moves;
        }

        const movedTwoSquares = Math.abs(lastMove.to.row - lastMove.from.row) === 2;
        if (!movedTwoSquares) {
            return moves;
        }

        // Check if the pawn is adjacent to our pawn
        const direction = this.color === 'white' ? -1 : 1;
        const expectedRow = this.color === 'white' ? 3 : 4;

        if (this.row === expectedRow && lastMove.to.row === expectedRow) {
            const colDiff = Math.abs(this.col - lastMove.to.col);

            if (colDiff === 1) {
                const captureRow = this.row + direction;
                const captureCol = lastMove.to.col;

                moves.push({
                    row: captureRow,
                    col: captureCol,
                    isEnPassant: true,
                    captureRow: lastMove.to.row,
                    captureCol: lastMove.to.col
                });
            }
        }

        return moves;
    }

    /**
     * Check if pawn should be promoted
     */
    shouldPromote() {
        const promotionRow = this.color === 'white' ? 0 : 7;
        return this.row === promotionRow;
    }
}

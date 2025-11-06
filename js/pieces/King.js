/**
 * King piece
 * Moves one square in any direction
 * Can castle if conditions are met
 */
class King extends Piece {
    constructor(row, col, color) {
        super(row, col, color, 'king');
    }

    getPossibleMoves(board) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        // Regular moves (one square in any direction)
        for (const [rowDelta, colDelta] of directions) {
            const newRow = this.row + rowDelta;
            const newCol = this.col + colDelta;

            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];

                if (targetPiece === null || targetPiece.color !== this.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    /**
     * Check if castling is possible
     * Returns array of possible castling moves
     */
    getCastlingMoves(board, game) {
        const moves = [];

        // Can't castle if king has moved
        if (this.hasMoved) {
            return moves;
        }

        // Can't castle if in check
        if (game.isKingInCheck(this.color)) {
            return moves;
        }

        const row = this.row;

        // Kingside castling (short)
        const kingsideRook = board[row][7];
        if (kingsideRook &&
            kingsideRook.type === 'rook' &&
            kingsideRook.color === this.color &&
            !kingsideRook.hasMoved) {

            // Check if squares between king and rook are empty
            if (board[row][5] === null && board[row][6] === null) {
                // Check if king doesn't pass through check
                const squaresToCheck = [
                    { row: row, col: 5 },
                    { row: row, col: 6 }
                ];

                let pathIsSafe = true;
                for (const square of squaresToCheck) {
                    if (game.isSquareUnderAttack(square.row, square.col, this.color)) {
                        pathIsSafe = false;
                        break;
                    }
                }

                if (pathIsSafe) {
                    moves.push({ row: row, col: 6, isCastling: true, isKingside: true });
                }
            }
        }

        // Queenside castling (long)
        const queensideRook = board[row][0];
        if (queensideRook &&
            queensideRook.type === 'rook' &&
            queensideRook.color === this.color &&
            !queensideRook.hasMoved) {

            // Check if squares between king and rook are empty
            if (board[row][1] === null && board[row][2] === null && board[row][3] === null) {
                // Check if king doesn't pass through check
                const squaresToCheck = [
                    { row: row, col: 2 },
                    { row: row, col: 3 }
                ];

                let pathIsSafe = true;
                for (const square of squaresToCheck) {
                    if (game.isSquareUnderAttack(square.row, square.col, this.color)) {
                        pathIsSafe = false;
                        break;
                    }
                }

                if (pathIsSafe) {
                    moves.push({ row: row, col: 2, isCastling: true, isKingside: false });
                }
            }
        }

        return moves;
    }
}

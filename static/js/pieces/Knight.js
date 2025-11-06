/**
 * Knight piece
 * Moves in an L-shape: 2 squares in one direction, 1 square perpendicular
 */
class Knight extends Piece {
    constructor(row, col, color) {
        super(row, col, color, 'knight');
    }

    getPossibleMoves(board) {
        const moves = [];

        // Knight moves in L-shapes
        const knightMoves = [
            [-2, -1], [-2, 1],
            [-1, -2], [-1, 2],
            [1, -2],  [1, 2],
            [2, -1],  [2, 1]
        ];

        for (const [rowDelta, colDelta] of knightMoves) {
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
}

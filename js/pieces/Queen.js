/**
 * Queen piece
 * Moves any number of squares along rank, file, or diagonal
 */
class Queen extends Piece {
    constructor(row, col, color) {
        super(row, col, color, 'queen');
    }

    getPossibleMoves(board) {
        const moves = [];

        // Queen moves like a rook + bishop
        const directions = [
            [-1, 0],  // Up
            [1, 0],   // Down
            [0, -1],  // Left
            [0, 1],   // Right
            [-1, -1], // Up-Left
            [-1, 1],  // Up-Right
            [1, -1],  // Down-Left
            [1, 1]    // Down-Right
        ];

        for (const [rowDelta, colDelta] of directions) {
            moves.push(...this.addMovesInDirection(board, rowDelta, colDelta));
        }

        return moves;
    }
}

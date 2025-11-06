/**
 * Rook piece
 * Moves any number of squares along rank or file
 */
class Rook extends Piece {
    constructor(row, col, color) {
        super(row, col, color, 'rook');
    }

    getPossibleMoves(board) {
        const moves = [];

        // Rook moves horizontally and vertically
        const directions = [
            [-1, 0],  // Up
            [1, 0],   // Down
            [0, -1],  // Left
            [0, 1]    // Right
        ];

        for (const [rowDelta, colDelta] of directions) {
            moves.push(...this.addMovesInDirection(board, rowDelta, colDelta));
        }

        return moves;
    }
}

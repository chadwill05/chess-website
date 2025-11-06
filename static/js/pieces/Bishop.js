/**
 * Bishop piece
 * Moves any number of squares diagonally
 */
class Bishop extends Piece {
    constructor(row, col, color) {
        super(row, col, color, 'bishop');
    }

    getPossibleMoves(board) {
        const moves = [];

        // Bishop moves diagonally
        const directions = [
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

// Core chess board representation and helpers.
//
// The board is stored as an 8x8 matrix of piece codes (or null for empty).
// A piece code is a two-character string: <color><type>.
//   color: 'w' | 'b'
//   type:  'P' | 'N' | 'B' | 'R' | 'Q' | 'K'
// e.g. 'wP' = white pawn, 'bK' = black king.
//
// Row 0 is rank 8 (black's back rank), row 7 is rank 1 (white's back rank).
// Col 0 is file 'a', col 7 is file 'h'. This is the JSON shape we will send
// to the Orleans backend whenever a piece is moved.

export const BOARD_SIZE = 8;

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const BACK_RANK = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];

/**
 * Build the standard chess starting position.
 * @returns {(string|null)[][]} 8x8 matrix of piece codes.
 */
export function createInitialBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );

  for (let col = 0; col < BOARD_SIZE; col += 1) {
    board[0][col] = `b${BACK_RANK[col]}`; // black back rank (rank 8)
    board[1][col] = 'bP'; // black pawns (rank 7)
    board[6][col] = 'wP'; // white pawns (rank 2)
    board[7][col] = `w${BACK_RANK[col]}`; // white back rank (rank 1)
  }

  return board;
}

/**
 * Convert a row/col into algebraic coordinates, e.g. (6, 4) -> 'e2'.
 */
export function toSquareName(row, col) {
  return `${FILES[col]}${BOARD_SIZE - row}`;
}

/**
 * Deep-clone a board matrix so we never mutate React state in place.
 */
export function cloneBoard(board) {
  return board.map((row) => row.slice());
}

/**
 * Produce the JSON snapshot of the game state sent to the backend after a move.
 * Kept intentionally simple/serializable so it maps cleanly to an Orleans grain.
 */
export function toBoardSnapshot(board) {
  return {
    rows: board.length,
    cols: BOARD_SIZE,
    squares: board,
  };
}

/**
 * Parse a board snapshot returned by the backend into the 8x8 matrix.
 * Accepts either a JSON string (from JoinGame) or an already-parsed object (from ReceiveMove).
 * Returns null if the snapshot is null/empty (e.g. a brand-new game with no moves yet).
 */
export function fromBoardSnapshot(snapshot) {
  if (!snapshot) return null;
  const parsed = typeof snapshot === 'string' ? JSON.parse(snapshot) : snapshot;
  return parsed.squares ?? null;
}

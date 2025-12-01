// Core logic for 2048-like gameplay on a square board.
// This module is DOM-free and focused on pure state transformations.

/**
 * Create an empty square board.
 * @param {number} size
 * @returns {number[][]}
 */
export function createEmptyBoard(size = 4) {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

/**
 * Deep clone a board to avoid accidental mutations.
 * @param {number[][]} board
 * @returns {number[][]}
 */
export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

/**
 * Return a list of empty cell coordinates.
 * @param {number[][]} board
 * @returns {{row:number,col:number}[]}
 */
export function getEmptyCells(board) {
  const cells = [];
  board.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value === 0) cells.push({ row: r, col: c });
    });
  });
  return cells;
}

/**
 * Add a random tile (2 with 90% chance, 4 with 10% chance) into a random empty cell.
 * @param {number[][]} board
 * @returns {{board:number[][], added:boolean}}
 */
export function addRandomTile(board) {
  const empty = getEmptyCells(board);
  if (empty.length === 0) {
    return { board: cloneBoard(board), added: false };
  }
  const choice = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const next = cloneBoard(board);
  next[choice.row][choice.col] = value;
  return { board: next, added: true };
}

/**
 * Merge a single line to the left following 2048 rules.
 * @param {number[]} line
 * @returns {{line:number[], delta:number}}
 */
export function mergeLine(line) {
  const filtered = line.filter((v) => v !== 0);
  const merged = [];
  let scoreDelta = 0;
  for (let i = 0; i < filtered.length; i += 1) {
    if (filtered[i] === filtered[i + 1]) {
      const value = filtered[i] * 2;
      merged.push(value);
      scoreDelta += value;
      i += 1; // skip the next because it has been merged
    } else {
      merged.push(filtered[i]);
    }
  }
  while (merged.length < line.length) {
    merged.push(0);
  }
  return { line: merged, delta: scoreDelta };
}

function rotateLeft(matrix) {
  const size = matrix.length;
  const res = createEmptyBoard(size);
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      res[size - c - 1][r] = matrix[r][c];
    }
  }
  return res;
}

function rotateRight(matrix) {
  const size = matrix.length;
  const res = createEmptyBoard(size);
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      res[c][size - r - 1] = matrix[r][c];
    }
  }
  return res;
}

function boardsEqual(a, b) {
  return a.every((row, r) => row.every((v, c) => v === b[r][c]));
}

/**
 * Move the board left and merge tiles.
 * @param {number[][]} board
 * @returns {{board:number[][], moved:boolean, delta:number}}
 */
export function moveLeft(board) {
  const size = board.length;
  const next = createEmptyBoard(size);
  let totalDelta = 0;
  for (let r = 0; r < size; r += 1) {
    const { line, delta } = mergeLine(board[r]);
    next[r] = line;
    totalDelta += delta;
  }
  const moved = !boardsEqual(board, next);
  return { board: next, moved, delta: totalDelta };
}

/**
 * Move right by reversing rows, using left merge, then reversing back.
 */
export function moveRight(board) {
  const reversed = board.map((row) => [...row].reverse());
  const { board: merged, delta } = moveLeft(reversed);
  const restored = merged.map((row) => [...row].reverse());
  const moved = !boardsEqual(board, restored);
  return { board: restored, moved, delta };
}

/**
 * Move up by rotating left, moving left, then rotating right.
 */
export function moveUp(board) {
  const rotated = rotateLeft(board);
  const { board: merged, delta } = moveLeft(rotated);
  const restored = rotateRight(merged);
  const moved = !boardsEqual(board, restored);
  return { board: restored, moved, delta };
}

/**
 * Move down by rotating right, moving left, then rotating left.
 */
export function moveDown(board) {
  const rotated = rotateRight(board);
  const { board: merged, delta } = moveLeft(rotated);
  const restored = rotateLeft(merged);
  const moved = !boardsEqual(board, restored);
  return { board: restored, moved, delta };
}

/**
 * Dispatch a directional move.
 * @param {number[][]} board
 * @param {"left"|"right"|"up"|"down"} direction
 */
export function moveBoard(board, direction) {
  switch (direction) {
    case "left":
      return moveLeft(board);
    case "right":
      return moveRight(board);
    case "up":
      return moveUp(board);
    case "down":
      return moveDown(board);
    default:
      return { board: cloneBoard(board), moved: false, delta: 0 };
  }
}

/**
 * Check if any moves remain.
 * @param {number[][]} board
 */
export function hasMovesAvailable(board) {
  if (getEmptyCells(board).length > 0) return true;
  const size = board.length;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const value = board[r][c];
      if (r + 1 < size && board[r + 1][c] === value) return true;
      if (c + 1 < size && board[r][c + 1] === value) return true;
    }
  }
  return false;
}

/**
 * Get the largest tile on the board.
 * @param {number[][]} board
 */
export function getMaxTile(board) {
  return board.reduce((max, row) => Math.max(max, ...row), 0);
}

export default {
  createEmptyBoard,
  cloneBoard,
  getEmptyCells,
  addRandomTile,
  mergeLine,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  moveBoard,
  hasMovesAvailable,
  getMaxTile,
};

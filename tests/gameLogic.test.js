import assert from "node:assert/strict";
import {
  createEmptyBoard,
  mergeLine,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  hasMovesAvailable,
  getMaxTile,
} from "../game.js";

let failed = 0;
let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`✔ ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`✖ ${name}`);
    console.error(err);
  }
}

function finalize() {
  console.log(`\nTests réussis: ${passed}, échoués: ${failed}`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

test("mergeLine fusion simple", () => {
  const { line, delta } = mergeLine([2, 2, 0, 0]);
  assert.deepEqual(line, [4, 0, 0, 0]);
  assert.equal(delta, 4);
});

test("mergeLine empêche double fusion", () => {
  const { line } = mergeLine([2, 2, 2, 0]);
  assert.deepEqual(line, [4, 2, 0, 0]);
});

test("mergeLine ignore zéros intermédiaires", () => {
  const { line } = mergeLine([2, 0, 2, 2]);
  assert.deepEqual(line, [4, 2, 0, 0]);
});

test("moveLeft fonctionne sur ligne complète", () => {
  const board = [
    [2, 2, 4, 4],
    [0, 0, 0, 0],
    [2, 0, 2, 4],
    [0, 4, 4, 4],
  ];
  const { board: next, delta } = moveLeft(board);
  assert.deepEqual(next[0], [4, 8, 0, 0]);
  assert.equal(delta, 24);
});

test("moveRight inverse correctement", () => {
  const board = [
    [2, 0, 2, 0],
    [4, 4, 0, 0],
    [0, 2, 2, 4],
    [0, 0, 0, 2],
  ];
  const { board: next } = moveRight(board);
  assert.deepEqual(next, [
    [0, 0, 0, 4],
    [0, 0, 0, 8],
    [0, 0, 4, 4],
    [0, 0, 0, 2],
  ]);
});

test("moveUp condense en haut", () => {
  const board = [
    [2, 0, 2, 0],
    [0, 2, 0, 2],
    [2, 2, 2, 2],
    [0, 0, 0, 2],
  ];
  const { board: next } = moveUp(board);
  assert.deepEqual(next, [
    [4, 4, 4, 4],
    [0, 0, 0, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
});

test("moveDown condense en bas", () => {
  const board = [
    [2, 2, 0, 0],
    [2, 0, 0, 2],
    [0, 2, 2, 0],
    [0, 0, 0, 2],
  ];
  const { board: next } = moveDown(board);
  assert.deepEqual(next, [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [4, 4, 2, 4],
  ]);
});

test("hasMovesAvailable détecte fin de partie", () => {
  const full = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ];
  assert.equal(hasMovesAvailable(full), false);
});

test("getMaxTile retourne la plus grande", () => {
  const board = createEmptyBoard();
  board[1][1] = 512;
  board[2][3] = 1024;
  assert.equal(getMaxTile(board), 1024);
});

process.on("exit", finalize);

import {
  createEmptyBoard,
  addRandomTile,
  moveBoard,
  hasMovesAvailable,
  getMaxTile,
} from "./game.js";
import { setupInputHandlers } from "./input.js";

const size = 4;
const state = {
  board: createEmptyBoard(size),
  score: 0,
  best: 0,
  over: false,
  awaitingContinue: false,
};

const gridContainer = document.querySelector(".grid-container");
const tileLayer = document.querySelector(".tiles");
const scoreEl = document.querySelector("#score-value");
const bestEl = document.querySelector("#best-value");
const overlayWin = document.querySelector(".overlay.win");
const overlayLose = document.querySelector(".overlay.lose");
const restartButtons = document.querySelectorAll(".restart-btn");
const continueBtn = document.querySelector(".continue-btn");

function loadBestScore() {
  try {
    const raw = localStorage.getItem("db-2048-best");
    state.best = raw ? Number(raw) : 0;
  } catch (err) {
    state.best = 0;
  }
}

function saveBestScore() {
  try {
    localStorage.setItem("db-2048-best", String(state.best));
  } catch (err) {
    // ignore when storage is unavailable
  }
}

function resetOverlays() {
  overlayWin?.classList.remove("visible");
  overlayLose?.classList.remove("visible");
  state.over = false;
  state.awaitingContinue = false;
}

function updateScores(delta = 0) {
  state.score += delta;
  if (state.score > state.best) {
    state.best = state.score;
    saveBestScore();
  }
  if (scoreEl) scoreEl.textContent = state.score.toLocaleString();
  if (bestEl) bestEl.textContent = state.best.toLocaleString();
}

function tileLabel(value) {
  const starCount = Math.min(7, Math.log2(value));
  const stars = "★".repeat(starCount || 1);
  const kiLevel = value < 64 ? `Ki ${value}` : `Z-Ki ${value}`;
  return `${stars} ${kiLevel}`;
}

function clearTiles() {
  if (tileLayer) tileLayer.innerHTML = "";
}

function renderTiles() {
  if (!tileLayer) return;
  clearTiles();
  const gap = getComputedStyle(gridContainer).getPropertyValue("--cell-gap") || "10px";
  const cellSize = getComputedStyle(gridContainer).getPropertyValue("--cell-size") || "80px";

  state.board.forEach((row, r) => {
    row.forEach((value, c) => {
      if (!value) return;
      const tile = document.createElement("div");
      tile.className = `tile tile-${value}`;
      tile.style.transform = `translate(calc((${cellSize} + ${gap}) * ${c}), calc((${cellSize} + ${gap}) * ${r}))`;
      tile.innerHTML = `<span class="value">${value}</span><span class="label">${tileLabel(
        value
      )}</span>`;
      tileLayer.appendChild(tile);
    });
  });
}

function renderGridBackground() {
  if (!gridContainer) return;
  const bg = document.createElement("div");
  bg.className = "grid-bg";
  for (let i = 0; i < size * size; i += 1) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    bg.appendChild(cell);
  }
  gridContainer.insertBefore(bg, gridContainer.firstChild);
}

function initBoard() {
  state.board = createEmptyBoard(size);
  state.score = 0;
  loadBestScore();
  const first = addRandomTile(state.board).board;
  const second = addRandomTile(first).board;
  state.board = second;
  updateScores(0);
  resetOverlays();
  renderTiles();
}

function checkEndStates() {
  const maxTile = getMaxTile(state.board);
  if (maxTile >= 2048 && !state.awaitingContinue) {
    state.awaitingContinue = true;
    overlayWin?.classList.add("visible");
  }
  if (!hasMovesAvailable(state.board)) {
    state.over = true;
    overlayLose?.classList.add("visible");
  }
}

function handleMove(direction) {
  if (state.over || state.awaitingContinue) return;
  const { board: movedBoard, moved, delta } = moveBoard(state.board, direction);
  if (!moved) return;
  updateScores(delta);
  const { board: withTile } = addRandomTile(movedBoard);
  state.board = withTile;
  renderTiles();
  checkEndStates();
}

function setup() {
  renderGridBackground();
  restartButtons.forEach((btn) => btn.addEventListener("click", initBoard));
  continueBtn?.addEventListener("click", () => {
    state.awaitingContinue = false;
    overlayWin?.classList.remove("visible");
  });
  setupInputHandlers(handleMove, initBoard);
  initBoard();
}

setup();

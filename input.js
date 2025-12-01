// Input handling for keyboard and touch/pointer gestures.

const keyBindings = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right",
};

/**
 * Register event listeners for keyboard and touch gestures.
 * @param {(direction:"left"|"right"|"up"|"down") => void} onMove
 * @param {() => void} onRestart
 */
export function setupInputHandlers(onMove, onRestart) {
  document.addEventListener("keydown", (e) => {
    const dir = keyBindings[e.key];
    if (dir) {
      e.preventDefault();
      onMove(dir);
    }
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      onRestart();
    }
  });

  const surface = document.querySelector(".grid-container");
  if (!surface) return;

  let startX = 0;
  let startY = 0;

  const handleStart = (x, y) => {
    startX = x;
    startY = y;
  };

  const handleEnd = (x, y) => {
    const dx = x - startX;
    const dy = y - startY;
    const threshold = 25;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      onMove(dx > 0 ? "right" : "left");
    } else {
      onMove(dy > 0 ? "down" : "up");
    }
  };

  surface.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  });

  surface.addEventListener("touchend", (e) => {
    const touch = e.changedTouches[0];
    handleEnd(touch.clientX, touch.clientY);
  });

  surface.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    handleStart(e.clientX, e.clientY);
  });

  surface.addEventListener("pointerup", (e) => {
    if (e.pointerType === "mouse") return;
    handleEnd(e.clientX, e.clientY);
  });
}

export default { setupInputHandlers };

// bg.js — animated 3D "coding" background shared by all pages.
// WHAT: a perspective grid floor that moves towards you, plus code symbols
//       floating at different depths (near = big & bright, far = small & dim).
// HOW:  a fixed <canvas> behind the page. Simple 3D projection:
//       screenX = centerX + x / z,  screenY = centerY + y / z
//       (dividing by depth z makes far things smaller and closer to the centre).
// It is kept dim so the text on top stays easy to read.
(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "bg3d";
  canvas.setAttribute("aria-hidden", "true");      // decoration only, ignored by screen readers
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  // page accent colour (set by <body data-accent="...">)
  const accent = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#6ea8ff";
  const TOKENS = ["{ }", "</>", "( )", "=>", "const", "let", "if", "for", "0101", "#", ";", "[ ]", "fn", "&&", "==", "AI", "JS", "CSS"];

  let w, h, symbols = [];
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // one floating symbol at a random 3D position
  function makeSymbol(z) {
    return {
      x: (Math.random() - 0.5) * w * 2.2,          // spread wider than the screen
      y: (Math.random() - 0.5) * h * 2.2,
      z: z || Math.random() * 3 + 0.4,             // depth: 0.4 (near) … 3.4 (far)
      t: TOKENS[(Math.random() * TOKENS.length) | 0]
    };
  }

  function drawGrid(time) {
    // horizon in the lower part of the screen, the grid "floor" below it
    const horizon = h * 0.62;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    // horizontal lines: spacing shrinks towards the horizon (perspective),
    // and an offset that grows with time makes the floor move forward
    const offset = (time * 0.00025) % 1;
    for (let i = 0; i < 18; i++) {
      const d = (i + offset) / 18;                   // 0 = horizon, 1 = bottom
      const y = horizon + (h - horizon) * d * d;     // squared → perspective spacing
      ctx.globalAlpha = 0.18 * d;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    // vertical lines meet at one vanishing point in the centre of the horizon
    for (let i = -14; i <= 14; i++) {
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.moveTo(w / 2 + i * 8, horizon);
      ctx.lineTo(w / 2 + i * w * 0.12, h);
      ctx.stroke();
    }
  }

  function drawSymbols() {
    ctx.textAlign = "center";
    for (const s of symbols) {
      s.z -= 0.0035;                                // move towards the viewer
      if (s.z < 0.35) Object.assign(s, makeSymbol(3.4)); // too close → respawn far away
      const sx = w / 2 + s.x / s.z * 0.35;          // 3D → 2D projection
      const sy = h / 2 + s.y / s.z * 0.35;
      const size = 14 / s.z;
      ctx.globalAlpha = Math.min(0.35, 0.5 / s.z) * 0.6;
      ctx.fillStyle = accent;
      ctx.font = `600 ${size}px ui-monospace, Consolas, monospace`;
      ctx.fillText(s.t, sx, sy);
    }
  }

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function frame(time) {
    ctx.clearRect(0, 0, w, h);
    drawGrid(still ? 0 : time);
    drawSymbols();
    ctx.globalAlpha = 1;
    if (!still) requestAnimationFrame(frame);       // ~60 fps; browser pauses it in hidden tabs
  }

  resize();
  symbols = Array.from({ length: 55 }, () => makeSymbol());
  addEventListener("resize", resize);
  requestAnimationFrame(frame);
})();

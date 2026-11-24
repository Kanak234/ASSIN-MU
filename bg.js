// bg.js — animated 3D galaxy background, written from scratch (no library).
// WHAT: about 2,600 stars arranged in 3 spiral arms, slowly rotating in 3D,
//       plus a few code symbols drifting far away. It is tilted so you
//       look at the galaxy from slightly above.
// HOW:  every star has a 3D point (x, y, z). Each frame:
//       1) rotate it around the Y axis (the galaxy spins)
//       2) tilt it around the X axis (our viewing angle)
//       3) project to 2D:  screen = centre + point * (focal / (focal + z))
//          → far stars get smaller and move towards the centre (perspective).
// It stays dim so the text on top is always easy to read.
(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "bg3d";
  canvas.setAttribute("aria-hidden", "true");      // decoration only
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  const COLORS = ["#ff8a3d", "#f0457a", "#9b4dff", "#ffffff"];   // orange, pink, purple, white
  const TOKENS = ["{ }", "</>", "=>", "01", "fn", "#", "[ ]", ";"];
  let w, h, cx, cy, scale;
  const stars = [], symbols = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w * 0.68; cy = h * 0.38;                   // galaxy centre (upper right, away from the text)
    scale = Math.max(w, h) * 0.62;
  }

  // ---- build the galaxy once ----
  const ARMS = 3;
  for (let i = 0; i < 2600; i++) {
    const r = 0.05 + Math.pow(Math.random(), 1.6) * 0.95; // more stars near the centre (min radius avoids a thin line in the middle)
    const arm = (i % ARMS) * (Math.PI * 2 / ARMS);
    const angle = arm + r * 5.2 + (Math.random() - 0.5) * 0.6; // spiral: angle grows with radius
    stars.push({
      r, angle,
      y: (Math.random() - 0.5) * 0.03 * (1 - r),      // thin disc, a little thicker in the middle
      size: Math.random() * 1.6 + 0.5,
      color: r < 0.12 ? "#ffe2c4" : COLORS[(Math.random() * COLORS.length) | 0],
      speed: 0.00006 / (r + 0.25)                     // inner stars orbit faster (like a real galaxy)
    });
  }
  for (let i = 0; i < 14; i++) {
    symbols.push({ x: Math.random(), y: Math.random(), z: Math.random() * 0.6 + 0.4,
                   t: TOKENS[i % TOKENS.length], v: Math.random() * 0.00002 + 0.00001 });
  }

  const TILT = 0.62;                                  // view angle (radians) around X: ~35°, galaxy seen from above
  const cosT = Math.cos(TILT), sinT = Math.sin(TILT);
  const FOCAL = 2.2;

  function frame(time) {
    ctx.clearRect(0, 0, w, h);

    // 1) galaxy core glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.35);
    glow.addColorStop(0, "rgba(255, 190, 140, .30)");
    glow.addColorStop(1, "rgba(155, 77, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // 2) stars: rotate → tilt → project
    for (const s of stars) {
      const a = s.angle + time * s.speed;
      let x = Math.cos(a) * s.r, z = Math.sin(a) * s.r, y = s.y;
      const y2 = y * cosT - z * sinT;                 // tilt around the X axis
      const z2 = y * sinT + z * cosT;
      const p = FOCAL / (FOCAL + z2);                 // perspective factor
      const sx = cx + x * scale * p, sy = cy + y2 * scale * p;
      ctx.globalAlpha = Math.min(0.85, 0.35 + 0.5 * p * (1 - s.r * 0.5));
      ctx.fillStyle = s.color;
      ctx.fillRect(sx, sy, s.size * p, s.size * p);
    }

    // 3) a few code symbols drifting slowly (far = small & faint)
    ctx.font = "600 14px ui-monospace, Consolas, monospace";
    for (const c of symbols) {
      c.y -= c.v * 16;                                // float upwards
      if (c.y < -0.05) { c.y = 1.05; c.x = Math.random(); }
      ctx.globalAlpha = 0.10 * c.z;
      ctx.fillStyle = "#c8b6ff";
      ctx.save();
      ctx.translate(c.x * w, c.y * h);
      ctx.scale(c.z * 1.4, c.z * 1.4);
      ctx.fillText(c.t, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (!still) requestAnimationFrame(frame);        // browser pauses this in hidden tabs
  }

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches; // user asked for less motion → one still frame
  resize();
  addEventListener("resize", () => { resize(); if (still) frame(0); });
  requestAnimationFrame(frame);
})();

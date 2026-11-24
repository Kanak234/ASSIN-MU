/* =====================================================================
   orbit.js — CANVAS ANIMATION (the "animation" multimedia element)
   ---------------------------------------------------------------------
   WHY:  <canvas> lets us draw pixels with JavaScript, 60 times a second,
         which is how real animations/games work. No GIF, no library.
   USE:  draws stars, the sun, orbit rings and the 8 moving planets;
         also detects which planet the user clicked.
   FLOW: needs PLANETS from data.js → exposes `Orbit` object that
         main.js uses (play/pause, speed, click callback).
   ===================================================================== */

// IIFE = (function(){ ... })() → keeps our variables private so they
// don't clash with variables in other files.
const Orbit = (function () {
  const canvas = document.getElementById("orbitCanvas");
  const ctx = canvas.getContext("2d");      // "2d" drawing brush

  let running = true;     // is the animation playing?
  let speed = 1;          // multiplier set by the speed slider
  let time = 0;           // our own clock; grows every frame
  let lastStamp = 0;      // time of previous frame (to measure gap)
  let selected = null;    // planet the user clicked (gets highlighted)
  let onClick = null;     // function main.js gives us to call on click
  let stars = [];         // background star positions
  let scale = 1;          // shrinks the system on small phone screens

  // Each planet starts at a random angle so they are not in one line.
  const angles = PLANETS.map(() => Math.random() * Math.PI * 2);

  /* ---------- 1. Fit canvas to its box (and to phone screens) ---------- */
  function resize() {
    const box = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;       // sharp on retina/HD screens
    canvas.width = box.width * dpr;
    canvas.height = box.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);          // draw in normal CSS pixels
    // Neptune's orbit is 318px; scale everything so it fits the smaller side.
    scale = Math.min(1, (Math.min(box.width, box.height) / 2 - 20) / 330);
    makeStars(box.width, box.height);
  }
  // NEXT → resize is called once at start and whenever the window changes.

  /* ---------- 2. Random twinkling stars ---------- */
  function makeStars(w, h) {
    stars = [];
    for (let i = 0; i < 160; i++) {
      stars.push({ x: Math.random() * w, y: Math.random() * h,
                   r: Math.random() * 1.3, p: Math.random() * 6 }); // p = twinkle phase
    }
  }

  /* ---------- 3. Draw ONE frame ---------- */
  function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const cx = w / 2, cy = h / 2;                    // centre = sun position

    ctx.clearRect(0, 0, w, h);                       // wipe last frame

    // 3a. stars — brightness follows a sine wave → twinkle effect
    for (const s of stars) {
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.5 + s.p));
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3b. sun — radial gradient = glowing ball
    const sunR = 26 * scale;
    const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, sunR * 2.4);
    glow.addColorStop(0, "#fff7c2");
    glow.addColorStop(0.35, "#ffb52e");
    glow.addColorStop(1, "rgba(255,120,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, sunR * 2.4, 0, Math.PI * 2); ctx.fill();

    // 3c. each planet: orbit ring + body (+ ring for Saturn)
    PLANETS.forEach((p, i) => {
      const r = p.orbit * scale;
      ctx.strokeStyle = selected === i ? "rgba(255,210,120,.7)" : "rgba(255,255,255,.12)";
      ctx.lineWidth = selected === i ? 1.6 : 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

      // position on circle: x = cx + r·cos(θ), y = cy + r·sin(θ)
      const x = cx + r * Math.cos(angles[i]);
      const y = cy + r * Math.sin(angles[i]);
      const size = Math.max(2.5, p.size * scale);
      p._x = x; p._y = y; p._r = size;             // remember for click detection

      if (p.ring) {                                  // Saturn's flat ellipse ring
        ctx.strokeStyle = "rgba(230,207,139,.8)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(x, y, size * 2, size * 0.7, -0.4, 0, Math.PI * 2); ctx.stroke();
      }
      // light comes from the sun → gradient offset towards the sun side
      const g = ctx.createRadialGradient(x - (x - cx) * 0.02, y - (y - cy) * 0.02, size * 0.2, x, y, size);
      g.addColorStop(0, p.color);
      g.addColorStop(1, p.color2);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();

      if (selected === i) {                          // name label for clicked planet
        ctx.fillStyle = "#ffd27a";
        ctx.font = "600 13px system-ui, sans-serif";
        ctx.fillText(p.name, x + size + 6, y - size);
      }
    });
  }
  // NEXT → draw() is called by loop() on every frame.

  /* ---------- 4. Animation loop ---------- */
  function loop(stamp) {
    // dt = seconds since last frame; capped so a hidden tab doesn't "jump"
    const dt = Math.min((stamp - lastStamp) / 1000, 0.05);
    lastStamp = stamp;
    if (running) {
      time += dt;
      // angle grows by speed → inner planets move faster (Kepler-style)
      PLANETS.forEach((p, i) => { angles[i] += p.speed * 0.6 * speed * dt; });
    }
    draw();
    requestAnimationFrame(loop);   // browser calls loop again before next screen refresh (~60 fps)
  }

  /* ---------- 5. Click / tap → which planet? ---------- */
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    // distance formula: if click is within planet radius (+8px easier tap) → hit
    const hit = PLANETS.findIndex(p => Math.hypot(mx - p._x, my - p._y) < p._r + 8);
    if (hit !== -1) select(hit);
  });

  function select(i) {
    selected = i;
    if (onClick) onClick(i);       // tell main.js → it opens the info panel
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(loop);     // START the animation

  // Public controls — only these are visible to other files.
  return {
    toggle() { running = !running; return running; },
    setSpeed(v) { speed = v; },
    select,
    onPlanetClick(fn) { onClick = fn; }
  };
})();
// NEXT → main.js connects buttons/slider/list to these controls.

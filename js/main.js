/* =====================================================================
   main.js — THE CONTROLLER (connects HTML buttons to the other files)
   ---------------------------------------------------------------------
   WHY:  orbit.js, audio.js and data.js each do one job. main.js is the
         "glue": it listens to the user and tells each part what to do.
   FLOW: runs LAST. Uses PLANETS (data.js), Orbit (orbit.js),
         SpaceAudio (audio.js).
   ===================================================================== */

/* ---------- 1. Planet list buttons (keyboard-friendly way to select) ---------- */
// Canvas cannot be focused with Tab key, so we also give real <button>s.
const list = document.getElementById("planetList");
PLANETS.forEach((p, i) => {
  const b = document.createElement("button");
  b.className = "chip";
  b.textContent = p.name;
  b.style.setProperty("--dot", p.color);    // CSS uses this for the coloured dot
  b.addEventListener("click", () => Orbit.select(i));
  list.appendChild(b);
});
// NEXT → both canvas click and these buttons end in showPlanet().

/* ---------- 2. Info panel ---------- */
const panel = document.getElementById("infoPanel");

function planetSVG(p) {
  // We DRAW the planet image as SVG (no downloaded photos → no copyright issue)
  const ring = p.ring
    ? `<ellipse cx="60" cy="60" rx="56" ry="16" fill="none" stroke="${p.color}" stroke-width="5" opacity=".8" transform="rotate(-20 60 60)"/>`
    : "";
  return `<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Illustration of ${p.name}">
      <defs><radialGradient id="g${p.name}" cx="35%" cy="35%">
        <stop offset="0%" stop-color="#fff" stop-opacity=".55"/>
        <stop offset="25%" stop-color="${p.color}"/>
        <stop offset="100%" stop-color="${p.color2}"/></radialGradient></defs>
      <circle cx="60" cy="60" r="34" fill="url(#g${p.name})"/>${ring}</svg>`;
}

function showPlanet(i) {
  const p = PLANETS[i];
  panel.innerHTML = `
    <div class="info-head">${planetSVG(p)}<h3>${p.name}</h3></div>
    <dl class="facts">
      <dt>Diameter</dt><dd>${p.diameter}</dd>
      <dt>Distance from Sun</dt><dd>${p.distance}</dd>
      <dt>Moons</dt><dd>${p.moons}</dd>
      <dt>Length of day</dt><dd>${p.day}</dd>
      <dt>Length of year</dt><dd>${p.year}</dd>
    </dl>
    <p class="fun"><strong>Fun fact:</strong> ${p.fact}</p>`;
  panel.classList.add("show");     // CSS fade-in animation
  SpaceAudio.blip();               // small sound feedback
  // highlight matching chip
  list.querySelectorAll(".chip").forEach((c, k) => c.classList.toggle("active", k === i));
}
Orbit.onPlanetClick(showPlanet);   // orbit.js will call this on canvas click

/* ---------- 3. Play / pause + speed ---------- */
const playBtn = document.getElementById("playBtn");
playBtn.addEventListener("click", () => {
  const running = Orbit.toggle();
  playBtn.textContent = running ? "⏸ Pause" : "▶ Play";
  playBtn.setAttribute("aria-pressed", String(!running));
});

const speedInput = document.getElementById("speed");
const speedOut = document.getElementById("speedVal");
speedInput.addEventListener("input", () => {
  Orbit.setSpeed(Number(speedInput.value));
  speedOut.textContent = speedInput.value + "×";
});

/* ---------- 4. Sound button ---------- */
const soundBtn = document.getElementById("soundBtn");
soundBtn.addEventListener("click", () => {
  const on = SpaceAudio.toggle();
  soundBtn.textContent = on ? "🔊 Sound on" : "🔇 Sound off";
  soundBtn.setAttribute("aria-pressed", String(on));
});

/* ---------- 5. Dark / light theme (remembered) ---------- */
const themeBtn = document.getElementById("themeBtn");
function setTheme(t) {
  document.documentElement.dataset.theme = t;   // CSS switches colours on [data-theme]
  themeBtn.textContent = t === "light" ? "🌙 Dark" : "☀️ Light";
  try { localStorage.setItem("theme", t); } catch (e) { /* storage blocked → ignore */ }
}
let saved = "dark";
try { saved = localStorage.getItem("theme") || "dark"; } catch (e) {}
setTheme(saved);
themeBtn.addEventListener("click", () =>
  setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"));

/* ---------- 6. Mobile menu ---------- */
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("open"); });

/* ---------- 7. Scroll reveal animation ---------- */
// IntersectionObserver tells us when a section enters the screen → add .visible
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ---------- 8. Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

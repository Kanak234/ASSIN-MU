// tilt.js — 3D tilt for the project cards on the home page.
// WHY: the card rotates towards the mouse, so it feels like a real object.
// HOW: we turn the mouse position inside the card into two angles and pass
//      them to CSS as variables (--rx, --ry). CSS does the actual 3D rotate.
document.querySelectorAll(".project").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;    // 0 (left) … 1 (right)
    const y = (e.clientY - r.top) / r.height;    // 0 (top)  … 1 (bottom)
    card.style.setProperty("--ry", (x - 0.5) * 16 + "deg");   // left/right tilt, max ±8°
    card.style.setProperty("--rx", (0.5 - y) * 16 + "deg");   // up/down tilt, max ±8°
    card.style.setProperty("--mx", x * 100 + "%");            // light reflection position
    card.style.setProperty("--my", y * 100 + "%");
  });
  // mouse leaves → card goes back flat
  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  });
});

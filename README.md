# Antariksh – Interactive Solar System Explorer 🚀

Mini-project for the **Multimedia Systems Practical (3IBCA504)**, AISECT University, Hazaribagh.
**Student:** Kanak Prabhakar (BCA, Cyber Security) · **Faculty:** Mr. Prabhat Kumar

Built with plain **HTML, CSS and JavaScript**. No frameworks and no libraries.

## How to run
1. Download or clone this repo.
2. Double-click `index.html`. It opens in any modern browser (Chrome, Edge, Firefox).
   No server or internet connection is needed.

## Multimedia elements used
| Element | Where | How |
|---|---|---|
| Text | Planet facts, quiz | HTML + `data.js` |
| Graphics | Planet illustrations, logo | SVG drawn in code |
| Animation | Live orbits, twinkling stars, scroll reveal | `<canvas>` + `requestAnimationFrame`, CSS transitions |
| Audio | Space ambient drone, click blip | Generated live with the Web Audio API (no mp3 file) |
| Video | "A day around the Sun" | HTML5 `<video>` with controls |
| Interactivity | Click planets, speed slider, play/pause, quiz, dark/light theme | JavaScript events |

## File structure
```
index.html      → page structure (header, canvas, info panel, video, quiz, footer)
404.html        → custom "page not found" page
css/style.css   → colours (CSS variables), layout (grid/flex), animations, mobile rules
js/data.js      → all planet facts in one array (content layer)
js/orbit.js     → canvas animation: stars, sun, orbits, planets, click detection
js/audio.js     → Web Audio API: ambient drone + blip sound
js/quiz.js      → 5-question quiz with score and restart
js/main.js      → connects the buttons to orbit.js, audio.js and the info panel
assets/         → KP logo, favicon, intro.mp4 video, preview.png
```
Script order matters: `data → orbit → audio → quiz → main`.

## Key concepts (viva notes)
- **Planet position:** `x = cx + r·cos(θ)`, `y = cy + r·sin(θ)`. Every frame, θ grows by the planet's speed.
- **Click detection:** a click counts as a hit when the distance `Math.hypot(dx, dy)` is smaller than the planet's radius.
- **Why sound starts OFF:** browsers block autoplay audio until the user clicks something.
- **Accessibility:** skip link, a real `<button>` for every planet (the canvas can't be reached with the Tab key), `aria-live` announcements, visible focus ring, reduced-motion support.
- **Responsive:** CSS grid becomes one column below 800px, and the nav turns into a ☰ menu.

## Credits and originality
- All graphics, the sound and the video were made from scratch for this project.
  The video was rendered frame by frame with a script and encoded with FFmpeg.
- Planet facts come from public information on NASA's Solar System Exploration site (science.nasa.gov).
- No user data is collected. There are no cookies, analytics or third-party embeds.
  Only the theme choice is saved, in the browser's localStorage.

© Kanak Prabhakar

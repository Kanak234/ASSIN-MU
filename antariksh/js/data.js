/* =====================================================================
   data.js — PLANET DATA (the "content" layer of the website)
   ---------------------------------------------------------------------
   WHY:  All facts live in ONE place, separate from drawing code.
         If a fact changes, we edit only this file — orbit.js and
         main.js read from here automatically.
   USE:  orbit.js uses radius/orbit/speed/color to draw the animation;
         main.js uses the text fields to fill the info panel.
   FLOW: loaded FIRST in index.html → then orbit.js → main.js → quiz.js
   ===================================================================== */

// `const` = this list never gets replaced, only read.
const PLANETS = [
  {
    name: "Mercury",          // shown in panel + used as label
    color: "#b5b5b5",         // main colour of the planet drawing
    color2: "#6e6e6e",        // darker shade → gives 3D gradient look
    size: 4,                  // drawing radius in px (NOT real scale — real scale would make planets invisible)
    orbit: 60,                // distance from sun in px on screen
    speed: 4.15,              // relative speed (Earth = 1); real orbital ratio, so Mercury runs fastest
    diameter: "4,879 km",
    distance: "57.9 million km",
    moons: 0,
    day: "59 Earth days",
    year: "88 Earth days",
    fact: "A day on Mercury (sunrise to sunrise) lasts longer than its year."
  },
  {
    name: "Venus", color: "#e8c27a", color2: "#a9773a", size: 7, orbit: 85, speed: 1.62,
    diameter: "12,104 km", distance: "108.2 million km", moons: 0,
    day: "243 Earth days", year: "225 Earth days",
    fact: "Venus is the hottest planet (about 465 °C), even hotter than Mercury, because of its thick CO₂ atmosphere."
  },
  {
    name: "Earth", color: "#4f9de0", color2: "#1d5d2e", size: 7.5, orbit: 115, speed: 1,
    diameter: "12,742 km", distance: "149.6 million km", moons: 1,
    day: "24 hours", year: "365.25 days",
    fact: "Earth is the only known planet with liquid water on its surface and life."
  },
  {
    name: "Mars", color: "#d4623a", color2: "#7a2a14", size: 5.5, orbit: 145, speed: 0.53,
    diameter: "6,779 km", distance: "227.9 million km", moons: 2,
    day: "24 h 37 min", year: "687 Earth days",
    fact: "Olympus Mons on Mars is the tallest volcano in the solar system, about 2.5× Mount Everest."
  },
  {
    name: "Jupiter", color: "#d9a066", color2: "#8a5a32", size: 15, orbit: 190, speed: 0.084,
    diameter: "139,820 km", distance: "778.5 million km", moons: 95,
    day: "9 h 56 min", year: "11.86 Earth years",
    fact: "Jupiter's Great Red Spot is a storm bigger than Earth that has lasted for centuries."
  },
  {
    name: "Saturn", color: "#e6cf8b", color2: "#9c8340", size: 13, orbit: 240, speed: 0.034, ring: true,
    diameter: "116,460 km", distance: "1.43 billion km", moons: 146,
    day: "10 h 34 min", year: "29.45 Earth years",
    fact: "Saturn is so light (low density) that it would float in a giant bathtub of water."
  },
  {
    name: "Uranus", color: "#9fe3e8", color2: "#3f8f99", size: 10, orbit: 282, speed: 0.012,
    diameter: "50,724 km", distance: "2.87 billion km", moons: 28,
    day: "17 h 14 min", year: "84 Earth years",
    fact: "Uranus spins on its side — its axis is tilted about 98°."
  },
  {
    name: "Neptune", color: "#4a6fe3", color2: "#1c2f7a", size: 10, orbit: 318, speed: 0.006,
    diameter: "49,244 km", distance: "4.5 billion km", moons: 16,
    day: "16 h 6 min", year: "164.8 Earth years",
    fact: "Neptune has the fastest winds in the solar system — over 2,000 km/h."
  }
];
// NEXT → orbit.js reads PLANETS to draw and animate them.

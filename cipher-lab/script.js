// script.js — the LOGIC of Cipher Lab
// Five classic ciphers, written by hand so each one is easy to explain:
//   Caesar   – shift every letter by K places (A→D when K=3)
//   ROT13    – Caesar with K=13 (doing it twice gives the original back)
//   Vigenère – a different Caesar shift for each letter, taken from a keyword
//   Atbash   – mirror the alphabet (A↔Z, B↔Y …)
//   Base64   – NOT encryption, only encoding: anyone can decode it
// FLOW: Encrypt/Decrypt → run(algo, text, key, direction) → show output

// shift one letter, keeping upper/lower case; other characters stay the same
function shiftChar(ch, k) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90)  return String.fromCharCode((code - 65 + k + 26 * 10) % 26 + 65);   // A–Z
  if (code >= 97 && code <= 122) return String.fromCharCode((code - 97 + k + 26 * 10) % 26 + 97);   // a–z
  return ch;
}
const caesar = (t, k) => [...t].map(c => shiftChar(c, k)).join("");

function vigenere(t, key, dir) {
  const ks = key.toLowerCase().replace(/[^a-z]/g, "");
  if (!ks) throw new Error("Vigenère needs a key made of letters, e.g. LEMON");
  let j = 0;
  return [...t].map(c => {
    if (!/[a-z]/i.test(c)) return c;              // spaces/digits don't use up a key letter
    const k = ks.charCodeAt(j++ % ks.length) - 97;
    return shiftChar(c, dir * k);
  }).join("");
}

const atbash = t => [...t].map(c => {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCharCode(155 - code);   // 65+90
  if (code >= 97 && code <= 122) return String.fromCharCode(219 - code);  // 97+122
  return c;
}).join("");

// Base64 with full Unicode support (TextEncoder → bytes → btoa)
const b64enc = t => btoa(String.fromCharCode(...new TextEncoder().encode(t)));
const b64dec = t => new TextDecoder().decode(Uint8Array.from(atob(t.trim()), c => c.charCodeAt(0)));

function run(algo, t, key, dir) {
  if (algo === "caesar") {
    const k = parseInt(key, 10);
    if (!(k >= 1 && k <= 25)) throw new Error("Caesar key must be a number from 1 to 25");
    return caesar(t, dir * k);
  }
  if (algo === "rot13") return caesar(t, 13);
  if (algo === "vigenere") return vigenere(t, key, dir);
  if (algo === "atbash") return atbash(t);
  if (algo === "base64") return dir > 0 ? b64enc(t) : b64dec(t);
}

const HINTS = { caesar: "Caesar: a number from 1 to 25", rot13: "ROT13 has no key (always 13)", vigenere: "Vigenère: a word, e.g. LEMON",
                atbash: "Atbash has no key", base64: "Base64 has no key: it is encoding, not encryption" };
const algo = () => document.querySelector('input[name="algo"]:checked').value;
document.querySelectorAll('input[name="algo"]').forEach(r => r.addEventListener("change", () => {
  document.getElementById("keyHint").textContent = HINTS[algo()];
  document.getElementById("key").disabled = !["caesar", "vigenere"].includes(algo());
  if (algo() === "vigenere") document.getElementById("key").value = "LEMON";
  if (algo() === "caesar") document.getElementById("key").value = "3";
}));

function go(dir) {
  const out = document.getElementById("out");
  try { out.textContent = run(algo(), document.getElementById("plain").value, document.getElementById("key").value, dir); }
  catch (e) { out.textContent = "⚠️ " + (e.message.includes("atob") || e.name === "InvalidCharacterError" ? "That isn't valid Base64" : e.message); }
}
document.getElementById("enc").onclick = () => go(+1);
document.getElementById("dec").onclick = () => go(-1);

/* ---------- Brute force: try all 25 Caesar keys and rank them ---------- */
// Ranking trick: compare letter frequencies with normal English using the
// chi-squared test. Lower score = more English-like. (In English, E ≈ 12.7%, T ≈ 9.1% …)
const EN = [8.2, 1.5, 2.8, 4.3, 12.7, 2.2, 2.0, 6.1, 7.0, 0.15, 0.77, 4.0, 2.4, 6.7, 7.5, 1.9, 0.095, 6.0, 6.3, 9.1, 2.8, 0.98, 2.4, 0.15, 2.0, 0.074];
function chiSquared(t) {
  const counts = new Array(26).fill(0);
  let n = 0;
  for (const c of t.toLowerCase()) { const i = c.charCodeAt(0) - 97; if (i >= 0 && i < 26) { counts[i]++; n++; } }
  if (!n) return Infinity;
  return counts.reduce((sum, obs, i) => { const exp = EN[i] / 100 * n; return sum + (obs - exp) ** 2 / exp; }, 0);
}
document.getElementById("crackBtn").onclick = () => {
  const msg = document.getElementById("crack").value;
  const tries = [];
  for (let k = 1; k <= 25; k++) { const t = caesar(msg, -k); tries.push({ k, t, s: chiSquared(t) }); }
  const best = tries.reduce((a, b) => (b.s < a.s ? b : a));   // lowest chi-squared wins
  const ul = document.createElement("ul");
  ul.className = "crack-list";
  tries.forEach(x => {
    const li = document.createElement("li");
    li.textContent = "key " + String(x.k).padStart(2, " ") + " → " + x.t + (x === best ? "   ← most likely" : "");
    if (x === best) li.className = "best";
    ul.appendChild(li);
  });
  const box = document.getElementById("crackOut");
  box.innerHTML = '<div class="alert good"><h3>Cracked in under a millisecond 💥</h3><p>Key ' + best.k + " gives the most English-looking text. That's why Caesar is never used for real security.</p></div>";
  box.appendChild(ul);
};

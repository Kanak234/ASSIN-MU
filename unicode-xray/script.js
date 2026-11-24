// script.js — the LOGIC of Unicode X-Ray
// Two hidden tricks in text:
//  1) INVISIBLE characters (zero-width space, right-to-left override …): you can't
//     see them, but they change what a link, password or command really is.
//  2) LOOK-ALIKE letters (homoglyphs): Cyrillic "а" looks exactly like Latin "a",
//     so "pаypal.com" can be a completely different website.
// FLOW: scan → walk every character → mark invisible / fake ones → show a clean version

// invisible characters and their names
const INVISIBLE = {
  "​": "ZERO WIDTH SPACE", "‌": "ZERO WIDTH NON-JOINER", "‍": "ZERO WIDTH JOINER",
  "⁠": "WORD JOINER", "﻿": "ZERO WIDTH NO-BREAK SPACE", "­": "SOFT HYPHEN",
  "‪": "LEFT-TO-RIGHT EMBEDDING", "‫": "RIGHT-TO-LEFT EMBEDDING", "‬": "POP DIRECTIONAL FORMATTING",
  "‭": "LEFT-TO-RIGHT OVERRIDE", "‮": "RIGHT-TO-LEFT OVERRIDE (reverses text!)",
  "⁦": "LEFT-TO-RIGHT ISOLATE", "⁧": "RIGHT-TO-LEFT ISOLATE", "⁩": "POP DIRECTIONAL ISOLATE"
};
// common look-alikes → the English letter they imitate
const LOOKALIKE = {
  "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x", "і": "i", "ј": "j", "ѕ": "s", "ԁ": "d", "һ": "h",
  "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H", "О": "O", "Р": "P", "С": "C", "Т": "T", "Х": "X",
  "ο": "o", "α": "a", "ν": "v", "ρ": "p", "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I", "Κ": "K", "Μ": "M",
  "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T", "Χ": "X", "Υ": "Y", "ɡ": "g", "ℓ": "l", "ⅼ": "l", "ꞵ": "b"
};
const hex = ch => "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");

function scan(text) {
  const out = document.getElementById("out");
  if (!text) { out.innerHTML = '<p class="muted">Paste some text first 🙂</p>'; return; }

  const view = document.createElement("div");      // the text with problems marked
  view.className = "quote chars";
  const found = [];
  let clean = "";

  for (const ch of text) {                         // for…of walks real characters (also emoji)
    if (INVISIBLE[ch]) {
      const tag = document.createElement("span");
      tag.className = "ch-zw";
      tag.textContent = "⟨" + hex(ch) + "⟩";       // show the invisible char as a red tag
      tag.title = INVISIBLE[ch];
      view.appendChild(tag);
      found.push(hex(ch) + " " + INVISIBLE[ch] + " (invisible)");
      continue;                                    // removed from the clean version
    }
    // a letter that is not from the Latin (English) alphabet?
    if (/\p{L}/u.test(ch) && !/\p{Script=Latin}/u.test(ch)) {
      const tag = document.createElement("span");
      tag.className = "ch-fake";
      tag.textContent = ch;
      tag.title = hex(ch);
      view.appendChild(tag);
      found.push(hex(ch) + " '" + ch + "' " + (LOOKALIKE[ch] ? "looks like English '" + LOOKALIKE[ch] + "'" : "is not an English letter"));
      clean += LOOKALIKE[ch] || ch;
      continue;
    }
    view.appendChild(document.createTextNode(ch));
    clean += ch;
  }

  out.innerHTML = "";
  const alert = document.createElement("div");
  const fakes = found.filter(f => f.includes("looks like")).length;
  alert.className = "alert " + (found.length ? (fakes ? "bad" : "warn") : "good");
  alert.innerHTML = "<h3>" + (found.length
    ? "🚨 Found " + found.length + " hidden or fake character(s)"
    : "✅ Clean: only normal visible characters") + "</h3>";
  out.appendChild(alert);
  out.appendChild(view);
  if (found.length) {
    const ul = document.createElement("ul");
    ul.className = "reasons finding";
    // group duplicates: "U+200B ZERO WIDTH SPACE ×3"
    const counts = {};
    found.forEach(f => counts[f] = (counts[f] || 0) + 1);
    Object.entries(counts).forEach(([f, n]) => { const li = document.createElement("li"); li.textContent = f + (n > 1 ? " ×" + n : ""); ul.appendChild(li); });
    out.appendChild(ul);
    const p = document.createElement("p");
    p.innerHTML = "<b>Clean version:</b> ";
    const code = document.createElement("span");
    code.className = "code";
    code.textContent = clean;
    p.appendChild(code);
    out.appendChild(p);
  }
}

document.getElementById("scan").onclick = () => scan(document.getElementById("text").value);
document.getElementById("sample").onclick = () => {
  // Cyrillic "а" (U+0430) in "pаypal" + a zero-width space after "login"
  const s = "Your account is locked. Verify at https://pаypal.com/login​?id=8841";
  document.getElementById("text").value = s;
  scan(s);
};

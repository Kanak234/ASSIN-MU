/* =====================================================================
   app.js — MAIN LOGIC (check message → score → highlight → explain)
   ---------------------------------------------------------------------
   WHY:  This is the "brain". It is rule-based (no AI, no internet), so
         every result can be explained: "this word matched this rule".
   FLOW: user pastes text → clicks "Check" → analyse() →
         1) find matches of every rule   2) add up risk score
         3) show highlighted message     4) show reason cards
         Optional: "Suno" button reads the result aloud (speech).
   PRIVACY: everything runs in the browser; the message is never sent
            anywhere (no fetch / no server).
   ===================================================================== */

const input = document.getElementById("msg");
const result = document.getElementById("result");

/* ---------- 1. Sample scam messages (for demo in viva) ---------- */
const SAMPLES = {
  kyc: "Dear Customer, aapka SBI account aaj raat block ho jayega. KYC update karne ke liye turant is link par click karein: http://sbi-kyc-update.xyz/login",
  bijli: "Dear consumer your electricity will be disconnected tonight at 9:30 pm because your previous month bill was not updated. Please immediately call our electricity officer 9876543210",
  arrest: "This is CBI cyber cell. Your Aadhaar is linked to a money laundering case. You are under digital arrest. Do not tell anyone. Pay ₹49,999 security deposit immediately.",
  job: "Ghar baithe ₹3000 daily earning! Sirf YouTube like and earn task. Registration fee only Rs 199. WhatsApp karein 9123456789",
  safe: "Hi beta, kal shaam 6 baje mandir chalna hai. Mummy ne kaha hai mithai bhi le aana."
};
document.querySelectorAll("[data-sample]").forEach(btn =>
  btn.addEventListener("click", () => { input.value = SAMPLES[btn.dataset.sample]; analyse(); }));
// NEXT → sample fills the box and directly runs analyse().

/* ---------- 2. Safety: escape HTML ---------- */
// The message is user input. If we put it in innerHTML directly, a
// message like <img onerror=...> could run code (XSS attack). So we
// convert < > & " ' into safe text first. (Cyber-security best practice!)
function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- 3. Find all matches ---------- */
function findMatches(text) {
  const found = [];          // every matched piece: {start, end, rule}
  const hitRules = new Set();// which rules matched at least once
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;            // reset because of the "g" flag
    let m;
    while ((m = rule.pattern.exec(text)) !== null) {
      if (m[0].length === 0) { rule.pattern.lastIndex++; continue; } // avoid infinite loop
      found.push({ start: m.index, end: m.index + m[0].length, rule });
      hitRules.add(rule);
    }
  }
  // sort by position; if two overlap keep the first/longer one
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const clean = [];
  let lastEnd = -1;
  for (const f of found) if (f.start >= lastEnd) { clean.push(f); lastEnd = f.end; }
  return { matches: clean, rules: [...hitRules] };
}
// NEXT → matches go to highlight(), rules go to score + reason cards.

/* ---------- 4. Build highlighted HTML ---------- */
function highlight(text, matches) {
  let html = "", pos = 0;
  for (const m of matches) {
    html += escapeHTML(text.slice(pos, m.start));                   // normal text
    html += `<mark title="${escapeHTML(m.rule.label)}">${escapeHTML(text.slice(m.start, m.end))}</mark>`; // red flag
    pos = m.end;
  }
  return html + escapeHTML(text.slice(pos));
}

/* ---------- 5. Score → verdict ---------- */
function verdictFor(score) {
  // Each rule adds its weight ONCE (repeating a word doesn't add more).
  if (score >= 50) return { level: "danger", title: "🚨 Ye message SCAM lag raha hai", tip: "Link na kholein, call na karein, koi OTP/paise na dein. 1930 par call karke ya cybercrime.gov.in par report karein." };
  if (score >= 20) return { level: "warn", title: "⚠️ Savdhaan — shaq wala message", tip: "Sender ko official number/website se khud verify karein. Jaldbaazi na karein." };
  return { level: "safe", title: "✅ Koi bada red-flag nahi mila", tip: "Phir bhi anjaan link ya paise ki maang par dhyaan rakhein. Ye tool sirf madad ke liye hai." };
}

/* ---------- 6. Main function ---------- */
function analyse() {
  const text = input.value.trim();
  if (!text) {                                    // edge case: empty box
    result.innerHTML = `<p class="empty">Pehle koi message paste karein 🙂</p>`;
    result.hidden = false;
    return;
  }
  const { matches, rules } = findMatches(text);
  const score = Math.min(100, rules.reduce((sum, r) => sum + r.weight, 0)); // cap at 100
  const v = verdictFor(score);

  result.innerHTML = `
    <div class="verdict ${v.level}">
      <div class="meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score}" aria-label="Risk score">
        <span></span>
      </div>
      <h3>${v.title}</h3>
      <p class="score">Risk score: <strong>${score}/100</strong> · ${rules.length} red-flag mile</p>
      <p>${v.tip}</p>
      <button id="speakBtn" class="btn ghost" type="button">🔊 Suno</button>
    </div>
    <h4>Aapka message (red-flag highlight):</h4>
    <div class="highlighted">${highlight(text, matches)}</div>
    ${rules.length ? `<h4>Kyun shaq hai?</h4>
      <div class="reasons">${rules.map(r => `
        <article class="reason"><h5>${r.label}</h5><p>${r.why}</p></article>`).join("")}
      </div>` : ""}`;
  result.hidden = false;
  // Width set from JS (not an inline style="" attribute) because our
  // Content-Security-Policy in vercel.json blocks inline styles.
  // Starting at 0 and growing on the next frame → animated risk bar.
  const bar = result.querySelector(".meter span");
  requestAnimationFrame(() => { bar.style.width = score + "%"; });
  result.scrollIntoView({ behavior: "smooth", block: "start" });

  // Speak button — reads verdict + reasons aloud (audio multimedia)
  document.getElementById("speakBtn").addEventListener("click", () =>
    speak(`${v.title.replace(/[^\p{L}\p{N}\s—,.]/gu, "")}. ${v.tip} ${rules.map(r => r.why).join(" ")}`));
}
document.getElementById("checkBtn").addEventListener("click", analyse);
document.getElementById("clearBtn").addEventListener("click", () => {
  input.value = ""; result.hidden = true; speechSynthesis.cancel(); input.focus();
});
// Ctrl+Enter = shortcut to check (keyboard friendly)
input.addEventListener("keydown", e => { if (e.key === "Enter" && e.ctrlKey) analyse(); });

/* ---------- 7. Text-to-speech (browser built-in, free, offline) ---------- */
function speak(text) {
  if (!("speechSynthesis" in window)) { alert("Aapka browser bolne ka feature support nahi karta."); return; }
  speechSynthesis.cancel();                       // stop old speech first
  const u = new SpeechSynthesisUtterance(text);
  // prefer an Indian voice (Hindi/English-India) if the device has one
  const voice = speechSynthesis.getVoices().find(v => /hi-IN|en-IN/i.test(v.lang));
  if (voice) u.voice = voice;
  u.lang = voice ? voice.lang : "en-IN";
  u.rate = 0.95;
  speechSynthesis.speak(u);
}

/* ---------- 8. Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

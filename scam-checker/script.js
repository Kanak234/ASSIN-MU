// script.js — the LOGIC of the Scam Message Detector
// Idea: scam messages reuse the same tricks (OTP, KYC, fear, prizes...).
// Each trick is one "rule". The more rules a message matches, the higher the risk.
// FLOW: button click → checkMessage() → match rules → score → show result

// ---------- 1. RULES ----------
// words  = suspicious words (regex: | means "or", \b means whole word only)
//          Hindi/Hinglish words are included because real Indian scam SMS use them.
// points = how dangerous the trick is
// why    = short explanation shown to the user
const rules = [
  { words: /\b(otp|upi pin|atm pin|cvv)\b/gi,                           points: 40, why: "Banks never ask for your OTP, UPI PIN or CVV." },
  { words: /\bkyc\b|\baccount\b.{0,20}\b(block(ed)?|band|suspend(ed)?)/gi, points: 30, why: "KYC is never updated through an SMS link." },
  { words: /\b(digital arrest|cbi|police|warrant)\b/gi,                  points: 35, why: "There is no such thing as a 'digital arrest'. It is a fear tactic." },
  { words: /\b(bijli|electricity)\b/gi,                                  points: 25, why: "The electricity board does not threaten disconnection from a personal number." },
  { words: /\b(lottery|won|winner|prize|free gift)\b/gi,                 points: 30, why: "You can't win a contest you never entered." },
  { words: /\b(urgent|immediately|turant|jaldi|tonight|aaj raat)\b/gi,   points: 15, why: "Urgency is used so you act before you think." },
  { words: /https?:\/\/\S+|www\.\S+|bit\.ly\S*/gi,                      points: 15, why: "Unknown link: don't click it." },
  { words: /\b(anydesk|teamviewer|apk)\b/gi,                             points: 35, why: "These apps let a scammer control your phone." }
];

// ---------- 2. SAFETY: HTML escape ----------
// If user text went straight into innerHTML, a message like <script> could run (XSS).
// So we turn < > & into safe text first.
function safe(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- 3. MAIN FUNCTION ----------
function checkMessage() {
  const box = document.getElementById("result");
  const text = document.getElementById("msg").value;

  if (text.trim() === "") {                       // empty box → friendly hint
    box.innerHTML = '<p class="muted">Paste a message first 🙂</p>';
    return;
  }

  let score = 0;
  const reasons = [];
  let highlighted = safe(text);                    // escape first, then highlight

  for (const rule of rules) {
    if (text.match(rule.words)) {                  // does the message use this trick?
      score += rule.points;
      reasons.push(rule.why);
      highlighted = highlighted.replace(rule.words, w => "<mark>" + w + "</mark>");
    }
  }
  score = Math.min(score, 100);                    // never more than 100

  // ---------- 4. VERDICT ----------
  let level, title;
  if (score >= 50)      { level = "bad";  title = "🚨 This looks like a SCAM"; }
  else if (score >= 20) { level = "warn"; title = "⚠️ Suspicious: verify before you act"; }
  else                  { level = "good"; title = "✅ No major red flags found"; }

  // ---------- 5. SHOW RESULT ----------
  box.innerHTML =
    '<div class="alert ' + level + '"><h3>' + title + '</h3>' +
    '<div class="meter"><span></span></div>' +
    '<p>Risk score: <b>' + score + '/100</b></p></div>' +
    '<div class="quote">' + highlighted + '</div>' +
    (reasons.length ? '<ul class="reasons"><li>' + reasons.join("</li><li>") + "</li></ul>" : "");
  // animate the risk bar from 0 to the score
  requestAnimationFrame(() => { box.querySelector(".meter span").style.width = score + "%"; });

  // ---------- 6. READ IT ALOUD (audio) ----------
  // Only on button click (browsers block sound that starts by itself),
  // and the button only appears if this browser supports speech.
  lastSpeech = title.replace(/[^\w\s:]/g, "") + ". " + reasons.join(" ");
  document.getElementById("speak").hidden = !("speechSynthesis" in window);
}
let lastSpeech = "";

// ---------- 7. BUTTONS ----------
document.getElementById("check").onclick = checkMessage;
document.getElementById("speak").onclick = function () {
  speechSynthesis.cancel();                                   // stop anything still talking
  const u = new SpeechSynthesisUtterance(lastSpeech);
  u.lang = "en-IN";                                           // Indian English voice if the device has one
  speechSynthesis.speak(u);
};
document.getElementById("sample").onclick = function () {
  document.getElementById("msg").value =
    "Dear customer, your SBI account will be blocked tonight. Update your KYC immediately: http://sbi-kyc.xyz and share the OTP.";
  checkMessage();
};

// script.js — website ka DIMAAG (logic)
// Idea: scam messages hamesha same tricks use karte hain (OTP, KYC, dar, inaam...).
// Har trick ke liye ek "rule" hai. Message me jitne rules milte hain, utna bada risk.
// FLOW: button click → checkMessage() → rules match → score → result dikhao

// ---------- 1. RULES ----------
// words = shaq wale shabd (regex: | = "ya", \b = poora shabd, taaki 'won' → 'wonderful' me match na ho),  points = kitna khatarnak,  why = simple reason
const rules = [
  { words: /\b(otp|upi pin|atm pin|cvv)\b/gi,                       points: 40, why: "Bank kabhi OTP / PIN nahi maangta." },
  { words: /\bkyc\b|\baccount\b.{0,20}\b(block|band|suspend)/gi,       points: 30, why: "KYC kabhi SMS link se update nahi hota." },
  { words: /\b(digital arrest|cbi|police|warrant)\b/gi,             points: 35, why: "'Digital arrest' jaisa koi kanoon nahi hai — ye dar dikhane ki chaal hai." },
  { words: /\b(bijli|electricity)\b/gi,                             points: 25, why: "Bijli vibhag personal number se 'call karo warna light kategi' nahi bolta." },
  { words: /\b(lottery|won|winner|inaam|prize|free gift)\b/gi,      points: 30, why: "Bina contest join kiye inaam? Ye fraud hai." },
  { words: /\b(urgent|turant|immediately|jaldi|aaj raat|tonight)\b/gi, points: 15, why: "Jaldbaazi karwana — taaki aap sochein nahi." },
  { words: /https?:\/\/\S+|www\.\S+|bit\.ly\S*/gi,           points: 15, why: "Anjaan link — click mat karo." },
  { words: /\b(anydesk|teamviewer|apk)\b/gi,                        points: 35, why: "Ye app install karwake scammer aapka phone control karta hai." }
];
// NEXT → checkMessage() in rules ko message par chalata hai

// ---------- 2. SAFETY: HTML escape ----------
// User ka text seedha innerHTML me daalein to <script> jaisa code chal sakta hai (XSS attack).
// Isliye < > & ko safe text me badal dete hain. (Cyber security point!)
function safe(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- 3. MAIN FUNCTION ----------
function checkMessage() {
  const box = document.getElementById("result");
  const text = document.getElementById("msg").value;

  if (text.trim() === "") {                       // khaali box → kuch mat karo
    box.className = "";
    box.innerHTML = "<p>Pehle koi message paste karo 🙂</p>";
    return;
  }

  let score = 0;
  const reasons = [];
  let highlighted = safe(text);                    // pehle safe banao, phir highlight

  for (const rule of rules) {
    if (text.match(rule.words)) {                  // kya ye trick message me hai?
      score += rule.points;
      reasons.push(rule.why);
      // match hue shabd ko <mark> me lapet do (pila highlight)
      highlighted = highlighted.replace(rule.words, w => "<mark>" + w + "</mark>");
    }
  }
  score = Math.min(score, 100);                    // 100 se zyada nahi

  // ---------- 4. FAISLA (verdict) ----------
  let title;
  if (score >= 50)      { box.className = "danger"; title = "🚨 SCAM hai! Kuch mat bhejo, link mat kholo."; }
  else if (score >= 20) { box.className = "warn";   title = "⚠️ Shaq wala message — pehle verify karo."; }
  else                  { box.className = "safe";   title = "✅ Koi bada khatra nahi dikha."; }

  // ---------- 5. RESULT DIKHAO ----------
  box.innerHTML =
    "<h2>" + title + "</h2>" +
    "<p>Risk score: <b>" + score + "/100</b></p>" +
    "<p>" + highlighted + "</p>" +
    (reasons.length ? "<ul><li>" + reasons.join("</li><li>") + "</li></ul>" : "");

  // ---------- 6. BOLKAR SUNAO (audio — multimedia) ----------
  // Browser ka built-in text-to-speech: bujurg log padh na sakein to sun lein
  if (!window.speechSynthesis) return;          // purana browser → bina awaaz ke chalne do
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(title + " " + reasons.join(" ")));
}

// ---------- 7. BUTTONS ----------
document.getElementById("check").onclick = checkMessage;
document.getElementById("sample").onclick = function () {
  document.getElementById("msg").value =
    "Dear customer, aapka SBI account aaj raat block ho jayega. Turant KYC update karein: http://sbi-kyc.xyz aur OTP share karein.";
  checkMessage();
};

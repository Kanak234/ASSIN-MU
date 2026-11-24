// script.js — the LOGIC of Spot the Phish (a quiz game)
// Each round shows one message. The player answers Real or Phishing,
// then sees the clue that gives it away. Score at the end.
// All brand names, numbers and links below are invented or reserved examples.
// FLOW: show(round) → answer(isFake) → feedback + Next → … → finish()

const ROUNDS = [
  { from: "SMS · VM-SBIUPI", text: "Rs 2,500 debited from A/c XX4417 on 24-11 via UPI. Not you? Call 1800-1234 (no link).", fake: false,
    why: "Real bank alerts show part of your account number, the amount, and tell you to call the official number. There's no link and no request for an OTP." },
  { from: "SMS · +91 98xxx xxx21", text: "Dear user your SBI YONO account blocked today. Update PAN now: http://sbi-yono-pan.xyz", fake: true,
    why: "It comes from a personal mobile number, has a cheap .xyz link, and creates urgency ('blocked today'). Banks never ask you to update your PAN through a link." },
  { from: "Email · security@paypa1-support.com", text: "We noticed unusual activity. Confirm your password within 24 hours or your account will be closed.", fake: true,
    why: "Look at the domain: 'paypa1' uses the number 1 instead of the letter l. It also asks for your password and sets a deadline." },
  { from: "WhatsApp · Unknown number", text: "Hi! I'm HR from a top company. Earn ₹5,000/day by liking YouTube videos. Pay ₹199 registration to start.", fake: true,
    why: "This is a task scam. Real jobs never charge a registration fee, and 'like and earn' offers always end in losing money." },
  { from: "Email · no-reply@accounts.google.com", text: "New sign-in on Windows. If this was you, you don't need to do anything. If not, check activity in your Google Account.", fake: false,
    why: "It comes from Google's real domain, has no attachment, and doesn't ask for your password. It tells you to check your account yourself." },
  { from: "SMS · AD-ELECTR", text: "Dear consumer, power will be disconnected tonight 9:30 PM. Contact electricity officer 7XXXXXXXX9 immediately.", fake: true,
    why: "Electricity boards don't threaten a cut-off 'tonight' and ask you to call a personal mobile number. It's a fear-and-urgency trick." },
  { from: "Call · '+1 CBI Officer'", text: "You are under digital arrest for money laundering. Stay on video call and transfer your savings for 'verification'.", fake: true,
    why: "'Digital arrest' does not exist in Indian law. Police or the CBI never ask for money on a video call. Hang up and call 1930." },
  { from: "SMS · JD-IRCTCi", text: "PNR 4521367890: Train 12345 is running late by 40 min. Expected departure 18:20. Happy journey!", fake: false,
    why: "It's informational only: no link, no payment, no request for details. It simply gives a PNR status update." }
];

let round = 0, score = 0;
const $ = id => document.getElementById(id);

function show() {
  const r = ROUNDS[round];
  $("round").textContent = "Round " + (round + 1) + " / " + ROUNDS.length;
  $("score").textContent = "Score " + score;
  $("q").innerHTML = '<span class="from"></span><span class="msg"></span>';
  $("q").querySelector(".from").textContent = r.from;
  $("q").querySelector(".msg").textContent = r.text;
  $("fb").innerHTML = "";
  $("next").hidden = true;
  $("real").disabled = $("fake").disabled = false;
}

function answer(saidFake) {
  const r = ROUNDS[round];
  const right = saidFake === r.fake;
  if (right) score++;
  $("real").disabled = $("fake").disabled = true;    // one answer per round
  $("score").textContent = "Score " + score;
  $("fb").innerHTML = '<div class="alert ' + (right ? "good" : "bad") + '"><h3>' + (right ? "✅ Correct!" : "❌ Not quite.") +
    " It's " + (r.fake ? "PHISHING" : "REAL") + ".</h3><p></p></div>";
  $("fb").querySelector("p").textContent = r.why;
  $("next").hidden = false;
  $("next").textContent = round === ROUNDS.length - 1 ? "See my result →" : "Next →";
}

function finish() {
  const pct = Math.round(score / ROUNDS.length * 100);
  const msg = pct === 100 ? "🏆 Perfect! Scammers don't stand a chance against you."
            : pct >= 75 ? "🛡️ Great eye! Just a couple of tricks to remember."
            : "🎣 Scammers are clever. Read the clues again and try once more.";
  $("q").textContent = "";
  $("fb").innerHTML = '<div class="alert ' + (pct >= 75 ? "good" : "warn") + '"><h3>You scored ' + score + " / " + ROUNDS.length +
    " (" + pct + "%)</h3><p>" + msg + "</p></div>";
  $("real").disabled = $("fake").disabled = true;
  $("next").hidden = false;
  $("next").textContent = "↻ Play again";
  round = -1; score = 0;                           // the next click restarts the game
}

$("real").onclick = () => answer(false);
$("fake").onclick = () => answer(true);
$("next").onclick = () => { round++; if (round >= ROUNDS.length) finish(); else show(); };
show();

/* =====================================================================
   quiz.js — 5-QUESTION QUIZ (the "interactivity" element)
   ---------------------------------------------------------------------
   WHY:  multimedia is not only showing things — the user should DO
         something and get feedback. A quiz is simple, clear interaction.
   USE:  shows one question at a time, checks the answer, keeps score,
         shows result + restart button.
   FLOW: independent file; it only needs the #quiz box in index.html.
   ===================================================================== */

(function () {
  // q = question, o = options, a = index of correct option
  const QUESTIONS = [
    { q: "Which planet is the hottest?", o: ["Mercury", "Venus", "Mars", "Jupiter"], a: 1 },
    { q: "Which planet has the Great Red Spot?", o: ["Saturn", "Neptune", "Jupiter", "Uranus"], a: 2 },
    { q: "Which planet spins on its side?", o: ["Uranus", "Earth", "Mars", "Venus"], a: 0 },
    { q: "How many moons does Mars have?", o: ["0", "1", "2", "4"], a: 2 },
    { q: "Which planet would float in water?", o: ["Earth", "Saturn", "Mercury", "Mars"], a: 1 }
  ];

  const box = document.getElementById("quiz");
  let index = 0;   // current question number
  let score = 0;

  /* ---------- show current question ---------- */
  function render() {
    const item = QUESTIONS[index];
    // template string builds HTML; buttons get data-i = option index
    box.innerHTML = `
      <p class="quiz-progress">Question ${index + 1} of ${QUESTIONS.length}</p>
      <h3>${item.q}</h3>
      <div class="quiz-options">
        ${item.o.map((opt, i) => `<button class="quiz-opt" data-i="${i}">${opt}</button>`).join("")}
      </div>
      <p class="quiz-feedback" aria-live="polite"></p>`;
    // aria-live → screen readers read the feedback aloud (accessibility)
  }
  // NEXT → user clicks an option → handled below.

  /* ---------- one click listener for the whole box (event delegation) ---------- */
  box.addEventListener("click", (e) => {
    if (e.target.id === "quizRestart") { index = 0; score = 0; render(); return; }

    const btn = e.target.closest(".quiz-opt");
    if (!btn || btn.disabled) return;

    const chosen = Number(btn.dataset.i);
    const correct = QUESTIONS[index].a;
    const buttons = box.querySelectorAll(".quiz-opt");
    buttons.forEach(b => (b.disabled = true));           // stop double answering
    buttons[correct].classList.add("right");              // always show right answer
    const fb = box.querySelector(".quiz-feedback");

    if (chosen === correct) { score++; fb.textContent = "✔ Correct!"; }
    else { btn.classList.add("wrong"); fb.textContent = "✘ Not quite."; }

    // wait 1.1 s so the user can see the colour, then go next
    setTimeout(() => {
      index++;
      if (index < QUESTIONS.length) render();
      else showResult();
    }, 1100);
  });

  /* ---------- final score ---------- */
  function showResult() {
    const msg = score === 5 ? "Perfect — true astronaut! 🚀"
              : score >= 3 ? "Great job, explorer!" : "Keep exploring the planets above!";
    box.innerHTML = `
      <h3>Your score: ${score} / ${QUESTIONS.length}</h3>
      <p>${msg}</p>
      <button id="quizRestart" class="btn">Try again</button>`;
  }

  render();   // START with question 1
})();

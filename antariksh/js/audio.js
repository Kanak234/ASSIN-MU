/* =====================================================================
   audio.js — SPACE AMBIENT SOUND (the "audio" multimedia element)
   ---------------------------------------------------------------------
   WHY:  Instead of downloading someone's music (copyright problem),
         we GENERATE our own sound with the Web Audio API. So the audio
         is 100% original and the site needs no big mp3 file.
   USE:  a soft, slowly-changing "space drone" + a short "blip" when a
         planet is selected.
   FLOW: main.js calls SpaceAudio.toggle() from the sound button and
         SpaceAudio.blip() when a planet is clicked.
   NOTE: browsers block sound until the user clicks something — that is
         why sound is OFF by default and starts only from the button.
   ===================================================================== */

const SpaceAudio = (function () {
  let ctx = null;        // AudioContext = the "sound engine"
  let master = null;     // master volume knob (GainNode)
  let on = false;

  // Build the sound graph once: oscillators → filter → master → speakers
  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;                 // start silent, fade in later
    master.connect(ctx.destination);       // destination = speakers

    // Low-pass filter makes the tone soft and "far away"
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.connect(master);

    // 3 slightly detuned sine waves (A minor-ish chord) → rich, calm drone
    [110, 164.8, 220.5].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.12;
      osc.connect(g).connect(filter);
      osc.start();
    });

    // LFO = very slow oscillator that moves the filter → sound "breathes"
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;            // one cycle ≈ 14 seconds
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 350;               // filter moves 600 ± 350 Hz
    lfo.connect(lfoAmt).connect(filter.frequency);
    lfo.start();
  }
  // NEXT → toggle() fades this graph in/out.

  function toggle() {
    if (!ctx) build();                     // create only on first click
    if (ctx.state === "suspended") ctx.resume();
    on = !on;
    // smooth fade over ~1s instead of a sudden jump (no "click" noise)
    master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.3);
    return on;
  }

  // Short pitch-drop beep for planet selection (only if sound is on)
  function blip() {
    if (!ctx || !on) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.25);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  return { toggle, blip };
})();
// NEXT → main.js wires these to the UI.

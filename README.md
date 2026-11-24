# Browser Jasoos – What Your Browser Reveals About You 🕵️

Opening the page is enough: with no permission popup, it shows what any website can read about your device. That includes OS, browser, screen, time zone, languages, CPU cores, RAM, GPU name, battery and network type. It then combines everything into a unique **fingerprint ID**.

**Files:** `index.html` · `style.css` · `script.js` (reads `navigator`, `screen`, WebGL, a canvas fingerprint and the Battery API, then hashes them with FNV-1a)

**Why it matters:** websites can recognise you again even without cookies or in incognito mode. The page also lists protection tips.

**Run:** open `index.html`. **Deploy:** Vercel → import repo → choose this branch → Framework "Other" → Deploy. Nothing is sent or stored.

Made by Kanak Prabhakar · BCA (Cyber Security), AISECT University

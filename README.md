# Pastejacking Demo – What You Copy Is Not What You Paste 📋

A safe live demo of **pastejacking**: a website secretly changes what goes into your clipboard. You copy `pip install requests`, but what you paste also downloads and runs a script.

- **Demo 1:** a hijacked copy button and Ctrl+C, using the `copy` event and `clipboardData.setData()`
- **Demo 2:** invisible text hidden with CSS that still gets copied with the selection (no JavaScript needed)
- **Paste box:** reveals what was really copied

**Safe:** `evil.example` is a reserved, fake domain, and nothing is ever executed.

**Files:** `index.html` · `style.css` · `script.js`

**Run:** open `index.html`. **Deploy:** Vercel → import repo → choose this branch → Framework "Other" → Deploy.

Made by Kanak Prabhakar · BCA (Cyber Security), AISECT University

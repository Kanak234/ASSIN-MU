# SandeshKavach – Scam Message Checker 🛡️

Paste an SMS or WhatsApp message and find out in 1 second whether it is a scam. The website highlights the suspicious words, shows a risk score, explains the reasons in simple Hinglish, and reads the result aloud.

**Multimedia Systems Practical (3IBCA504)** · Kanak Prabhakar, BCA (Cyber Security), AISECT University · Faculty: Mr. Prabhat Kumar

## Files (just 3)
| File | Kaam |
|---|---|
| `index.html` | Page structure: textbox, buttons, result box |
| `style.css` | Look and colours (green = safe, yellow = suspicious, red = scam) |
| `script.js` | Logic: 8 rules → score → highlight → speech |

## How it works
1. There are 8 rules, one for each scam trick (OTP, KYC, digital arrest, bijli, lottery, urgency, link, AnyDesk). Each rule has a regex and points.
2. The points of every matched rule are added up, and the score is capped at 100. A score of 50 or more is SCAM, 20–49 is suspicious, and below 20 is safe.
3. The matched words are wrapped in `<mark>` so they show up highlighted.
4. The text is HTML-escaped first, which protects against XSS attacks.
5. `speechSynthesis` reads the result aloud, so people who cannot read well can still use it.

## Multimedia
Text · Graphics (logo, colours) · Audio (text-to-speech) · Interactivity

## Run / Deploy
- **Local:** double-click `index.html`.
- **Vercel:** Add New → Project → import this repo → Framework "Other" → Deploy. No build step is needed.

The message never leaves the browser.

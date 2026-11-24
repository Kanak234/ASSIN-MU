# Web Mini-Projects – Multimedia Systems Practical (3IBCA504)

Eleven small web projects built with **plain HTML, CSS and JavaScript**: no frameworks, no libraries and no server. They share one design file, `style.css`.

| Project | Folder | What it does |
|---|---|---|
| 🪐 Antariksh | `antariksh/` | Interactive solar system: canvas orbit animation, planet facts, generated space sound, video, quiz |
| 🛡️ Scam Message Detector | `scam-checker/` | Highlights scam red flags in an SMS/WhatsApp message, gives a risk score, optional read-aloud |
| 📷 Post Se Pehle | `post-se-pehle/` | Reads hidden EXIF data in a photo (GPS, phone, time), makes a safe copy, checks captions for oversharing |
| 🕵️ Browser Jasoos | `browser-jasoos/` | Shows what any website can read about your device, plus a fingerprint ID |
| 📋 Pastejacking Demo | `pastejacking/` | 3 safe clipboard attacks (hijacked copy, invisible text, swapped UPI ID), a terminal simulation and a safe-paste scanner |
| 🔗 Link X-Ray | `link-xray/` | Splits a link into parts, finds the real website, flags phishing tricks, keeps a link history for the visit |
| 👻 Unicode X-Ray | `unicode-xray/` | Reveals zero-width characters and look-alike letters (homoglyphs), gives a clean version |
| 🖼️ Stego Studio | `stego-studio/` | Hides a secret message in an image's pixels (LSB steganography) and reads it back |
| 🧬 Hash Lab | `hash-lab/` | SHA-256/SHA-512 of text and files, avalanche effect, download verification |
| 🔐 Cipher Lab | `cipher-lab/` | Caesar, ROT13, Vigenère, Atbash, Base64, plus a Caesar brute-force cracker |
| 🎣 Spot the Phish | `spot-the-phish/` | 8-round real-or-fake game that teaches a clue in every round |

## Multimedia elements covered
Text · Graphics (SVG/Canvas) · Animation · Audio (Web Audio API, text-to-speech) · Video (HTML5) · Interactivity

## Live
https://assin-mu.vercel.app

## Run
Open `index.html` in any browser.

## Deploy on Vercel
Add New → Project → import `Kanak234/ASSIN-MU` → Framework **Other** → Deploy. No build step is needed.

## Privacy
Everything runs inside the browser. No data is uploaded, stored or tracked.

---
Kanak Prabhakar · BCA, AISECT University, Hazaribagh · Faculty: Mr. Prabhat Kumar

## Launch checklist
- Privacy policy (`privacy.html`): no data collected, no cookies, third-party links, DPDP/GDPR note
- Terms (`terms.html`): no guarantee, fair use, free (so no refunds), Indian law
- Custom `404.html`, `robots.txt`, favicon, meta title and description, social preview image on every page
- HTTPS enforced (HSTS) plus a strict Content-Security-Policy and other security headers in `vercel.json`
- No secrets in the frontend, no inline scripts or styles, all images have alt text, text contrast is about 9:1
- Form validation: max lengths, JPG-only and size limit for photos
- Mobile responsive, keyboard friendly, respects "reduced motion"
- All links checked, with no broken links

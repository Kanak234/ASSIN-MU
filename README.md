# Web Mini-Projects – Multimedia Systems Practical (3IBCA504)

Five small web projects built with **plain HTML, CSS and JavaScript**: no frameworks, no libraries and no server. They share one design file, `style.css`.

| Project | Folder | What it does |
|---|---|---|
| 🪐 Antariksh | `antariksh/` | Interactive solar system: canvas orbit animation, planet facts, generated space sound, video, quiz |
| 🛡️ Scam Message Checker | `scam-checker/` | Highlights scam red flags in an SMS/WhatsApp message, gives a risk score and reads the result aloud |
| 📷 Post Se Pehle | `post-se-pehle/` | Reads the hidden EXIF data in a photo (GPS location, phone, time), makes a safe copy, checks captions for oversharing |
| 🕵️ Browser Jasoos | `browser-jasoos/` | Shows what any website can read about your device, plus a fingerprint ID |
| 📋 Pastejacking Demo | `pastejacking/` | Safe live demo of clipboard hijacking (copy event + invisible text) |

## Multimedia elements covered
Text · Graphics (SVG/Canvas) · Animation · Audio (Web Audio API, text-to-speech) · Video (HTML5) · Interactivity

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

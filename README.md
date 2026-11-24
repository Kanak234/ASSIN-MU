# SandeshKavach – Scam Message Decoder 🛡️

Paste any SMS or WhatsApp message. SandeshKavach **highlights the scam red-flags** (OTP, KYC, digital arrest, bijli cut, parcel, task job, AnyDesk, unknown links…), gives a **0–100 risk score**, and **explains in simple Hinglish** why the message is suspicious. A "Suno" button reads the result aloud.

Mini-project for **Multimedia Systems Practical (3IBCA504)**, AISECT University, Hazaribagh.
**Student:** Kanak Prabhakar (BCA, Cyber Security) · **Faculty:** Mr. Prabhat Kumar

## Why this project
Most scam checkers only say "safe" or "unsafe", or they check a URL. Indian scam messages, though, are often in Hinglish and run on fear tricks ("account block", "digital arrest", "bijli kategi"). This tool shows **which words** are the trick and **why**, so non-technical people (parents, shopkeepers) can learn to spot scams themselves.

## Run locally
Double-click `index.html`. No server, no internet and no install are needed.

## Deploy on Vercel (1 minute)
1. Go to vercel.com → **Add New → Project** → import `Kanak234/ASSIN-MU`.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Click **Deploy**. Vercel serves the static files and reads `vercel.json` for security headers. HTTPS is automatic.

## How it works
1. `js/rules.js` has 13 rules. Each rule is a RegExp pattern, a weight and a Hinglish explanation.
2. `js/app.js` runs every pattern on the message and collects the matches.
3. Score = the sum of the weights of the matched rules, counted once per rule and capped at 100.
   A score of 50 or more is a scam, 20–49 is suspicious, and below 20 has no major red-flag.
4. Matched words are wrapped in `<mark>`. The user's text is **HTML-escaped first**, which prevents XSS.
5. The "Suno" button uses the browser's built-in `speechSynthesis` (text-to-speech).

## Multimedia elements
Text (message and explanations), graphics (KP logo, colour-coded verdict), animation (the risk bar grows smoothly), audio (text-to-speech), interactivity (paste, sample buttons, Ctrl+Enter shortcut).

## Security and privacy
- 100% client-side. The message never leaves the browser: there is no `fetch` and no server.
- `vercel.json` adds a strict Content-Security-Policy, HSTS, X-Frame-Options (DENY), nosniff, Referrer-Policy and Permissions-Policy.
- No cookies, analytics or third-party embeds. See `privacy.html`.

## Files
```
index.html     page structure
css/style.css  styling (traffic-light colours, mobile layout)
js/rules.js    the 13 scam rules (patterns + weights + explanations)
js/app.js      matching, scoring, highlighting, speech
privacy.html   privacy, cookies & terms
404.html       custom error page
vercel.json    security headers + clean URLs
robots.txt     search engine rules
assets/        KP logo, favicon, social preview image
```

## Limitations
Rule-based matching can miss new scam styles (false negatives) or flag a normal message (false positives). It is an awareness tool, not a guarantee. If you have been defrauded, call **1930** or report at **cybercrime.gov.in**.

© Kanak Prabhakar

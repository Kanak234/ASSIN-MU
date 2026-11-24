// script.js — the LOGIC of Link X-Ray
// Idea: phishing links hide the REAL website inside a long, official-looking link.
// We split the link into its parts with the browser's own URL parser, find the
// real website ("registrable domain"), and run simple red-flag checks.
// FLOW: X-Ray button → analyse() → parts + checks → result + history list
// The link is never opened or fetched.

const BRANDS = ["sbi", "hdfc", "icici", "axis", "paytm", "phonepe", "gpay", "upi", "irctc", "amazon", "flipkart",
  "google", "paypal", "whatsapp", "instagram", "facebook", "apple", "microsoft", "netflix", "aadhaar", "uidai", "incometax"];
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc", "ow.ly"];
const RISKY_TLDS = ["xyz", "top", "click", "info", "live", "icu", "buzz", "zip", "mov", "rest", "cam", "monster"];
const BAIT_WORDS = /login|verify|kyc|update|secure|account|bonus|free|reward|refund|unlock|confirm/i;
const history = [];                               // in memory only: gone when the tab closes

// ---- real website = last 2 labels, or last 3 for "co.in", "gov.in", "ac.in"... ----
function registrableDomain(host) {
  const p = host.split(".");
  if (p.length <= 2) return host;
  const sld = p[p.length - 2], tld = p[p.length - 1];
  if (tld.length === 2 && ["co", "com", "net", "org", "gov", "ac", "edu", "nic", "res"].includes(sld)) return p.slice(-3).join(".");
  return p.slice(-2).join(".");
}

function analyse(raw) {
  const out = document.getElementById("out");
  raw = raw.trim();
  if (!raw) { out.innerHTML = '<p class="muted">Paste a link first 🙂</p>'; return; }

  let u;
  try { u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : "http://" + raw); }  // add http:// if missing
  catch (e) { out.innerHTML = '<div class="alert warn"><h3>That doesn\'t look like a link</h3></div>'; return; }

  const flags = [];                               // [points, message]
  const host = u.hostname.toLowerCase();
  const real = registrableDomain(host);
  const sub = host.slice(0, Math.max(0, host.length - real.length - 1));

  if (u.protocol === "javascript:" || u.protocol === "data:") flags.push([60, "It's a '" + u.protocol + "' link, which can run code instead of opening a page."]);
  if (u.protocol === "http:") flags.push([15, "Not HTTPS: anything you type can be read on the network."]);
  if (u.username || raw.includes("@")) flags.push([35, "It contains '@'. Browsers ignore everything before @, so the real site is what comes after it."]);
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) flags.push([35, "It uses a raw IP address instead of a website name."]);
  if (host.includes("xn--") || /[^\x00-\x7f]/.test(raw.split("/")[2] || "")) flags.push([40, "The website name uses non-English look-alike letters (punycode)."]);
  if (SHORTENERS.includes(real) || SHORTENERS.includes(host)) flags.push([20, "It's a link shortener, which hides the real destination."]);
  if (RISKY_TLDS.includes(host.split(".").pop())) flags.push([20, "The ending ." + host.split(".").pop() + " is cheap and often used for scam sites."]);
  const brandInSub = BRANDS.find(b => sub.includes(b) && !real.startsWith(b));
  if (brandInSub) flags.push([40, "'" + brandInSub + "' appears in the link, but the real website is " + real + ". This is the most common phishing trick."]);
  if (host.split(".").length > 4) flags.push([10, "It has many subdomains, which makes it look official."]);
  if ((real.match(/-/g) || []).length >= 2) flags.push([10, "The website name has several hyphens (e.g. sbi-kyc-update)."]);
  if (BAIT_WORDS.test(u.pathname + u.search + sub)) flags.push([15, "It contains bait words like login, verify, KYC or reward."]);
  if (u.port) flags.push([10, "It uses an unusual port (:" + u.port + ")."]);
  if (raw.length > 100) flags.push([5, "It's very long, which can hide the real part."]);

  const score = Math.min(100, flags.reduce((s, f) => s + f[0], 0));
  const level = score >= 50 ? "bad" : score >= 20 ? "warn" : "good";
  const title = level === "bad" ? "🚨 Likely phishing" : level === "warn" ? "⚠️ Suspicious: be careful" : "✅ No major red flags";

  // build result with textContent for every user-controlled value (XSS-safe)
  out.innerHTML = '<div class="alert ' + level + '"><h3>' + title + '</h3><div class="meter"><span></span></div>' +
    '<p>Risk score: <b>' + score + '/100</b> · Real website: <b class="realsite"></b></p></div>' +
    '<dl class="url-parts"><dt>Protocol</dt><dd id="p1"></dd><dt>Subdomain</dt><dd id="p2"></dd>' +
    '<dt>Real website</dt><dd id="p3" class="real"></dd><dt>Path</dt><dd id="p4"></dd><dt>Query</dt><dd id="p5"></dd></dl>' +
    (flags.length ? '<ul class="reasons"></ul>' : "");
  out.querySelector(".realsite").textContent = real;
  [u.protocol, sub || "(none)", real, u.pathname, u.search || "(none)"].forEach((v, i) => { out.querySelector("#p" + (i + 1)).textContent = v; });
  const ul = out.querySelector("ul");
  flags.forEach(f => { const li = document.createElement("li"); li.textContent = f[1]; ul.appendChild(li); });
  requestAnimationFrame(() => { out.querySelector(".meter span").style.width = score + "%"; });

  addHistory(raw, level, real);
}

// ---- history list (newest first, max 10) ----
function addHistory(raw, level, real) {
  history.unshift({ raw, level, real });
  history.length = Math.min(history.length, 10);
  const list = document.getElementById("history");
  list.innerHTML = "";
  history.forEach(h => {
    const li = document.createElement("li");
    li.textContent = h.raw.length > 70 ? h.raw.slice(0, 70) + "…" : h.raw;
    const pill = document.createElement("span");
    pill.className = "pill " + h.level;
    pill.textContent = h.real;
    li.appendChild(pill);
    list.appendChild(li);
  });
}

document.getElementById("scan").onclick = () => analyse(document.getElementById("url").value);
document.getElementById("sample").onclick = () => {
  const s = "http://sbi.co.in.kyc-verify-update.xyz/login?ref=@secure";
  document.getElementById("url").value = s;
  analyse(s);
};

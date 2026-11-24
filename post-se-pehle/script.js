// script.js — the LOGIC of "Post Se Pehle"
// Two jobs:
//  A) Read the hidden EXIF data inside a photo (GPS location, phone model, time)
//     and create a "safe" copy without it.
//  B) Find oversharing in a caption (empty house, school, PNR, phone number...).
// Everything runs in the browser: no server, no library.

/* =====================================================================
   A) PHOTO — EXIF READER
   ---------------------------------------------------------------------
   What is EXIF? A phone camera writes a hidden "note" inside every JPG:
   which phone took it, when, and (if GPS is on) WHERE it was taken.
   You can't see it in the picture, but any tool can read it.
   A JPG file is a box of bytes. EXIF lives in a section called "APP1".
   ===================================================================== */

document.getElementById("photo").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();                 // reads the file as raw bytes
  reader.onload = () => showPhotoReport(file, reader.result);
  reader.readAsArrayBuffer(file);
});
// NEXT → showPhotoReport() calls readExif() to pull the data out

// ---- Find EXIF inside the JPG bytes ----
function readExif(buffer) {
  const view = new DataView(buffer);               // DataView = reads bytes as numbers
  if (view.getUint16(0) !== 0xFFD8) return null;   // every JPG starts with FFD8

  let pos = 2;
  while (pos < view.byteLength - 4) {
    const marker = view.getUint16(pos);
    const size = view.getUint16(pos + 2);
    // FFE1 = APP1 section, and it must contain the word "Exif"
    if (marker === 0xFFE1 && view.getUint32(pos + 4) === 0x45786966) {
      return parseTiff(view, pos + 10);            // the real data (TIFF format) starts after "Exif\0\0"
    }
    if ((marker & 0xFF00) !== 0xFF00) break;       // not a valid marker → stop
    pos += 2 + size;                               // jump to the next section
  }
  return null;                                     // no EXIF found
}

// ---- Read the TIFF format (the format inside EXIF) ----
function parseTiff(view, start) {
  // "II" = Intel (little-endian), "MM" = Motorola (big-endian): the byte order
  const little = view.getUint16(start) === 0x4949;
  const u16 = o => view.getUint16(start + o, little);
  const u32 = o => view.getUint32(start + o, little);

  // An "IFD" is a list of tags. Each tag is 12 bytes: id, type, count, value/offset
  function readIFD(offset) {
    const tags = {};
    const count = u16(offset);
    for (let i = 0; i < count; i++) {
      const e = offset + 2 + i * 12;
      const id = u16(e), type = u16(e + 2), n = u32(e + 4);
      // if the value is bigger than 4 bytes it is stored elsewhere (at an offset)
      const valueAt = (type === 2 && n > 4) || type === 5 ? u32(e + 8) : e + 8;
      if (type === 2) {                            // ASCII text
        let s = "";
        for (let k = 0; k < n - 1; k++) s += String.fromCharCode(view.getUint8(start + valueAt + k));
        tags[id] = s.trim();
      } else if (type === 5) {                     // RATIONAL = fraction (a/b); GPS degrees use this
        const arr = [];
        for (let k = 0; k < n; k++) arr.push(u32(valueAt + k * 8) / u32(valueAt + k * 8 + 4));
        tags[id] = arr;
      } else if (type === 3) {                     // SHORT number
        tags[id] = u16(e + 8);
      } else if (type === 4) {                     // LONG number (pointers are stored this way too)
        tags[id] = u32(e + 8);
      }
    }
    return tags;
  }

  const ifd0 = readIFD(u32(4));                     // first list: phone make/model
  const exif = ifd0[0x8769] ? readIFD(ifd0[0x8769]) : {}; // date/time the photo was taken
  const gps = ifd0[0x8825] ? readIFD(ifd0[0x8825]) : {};  // GPS location

  const result = {
    make: ifd0[0x010F],                             // brand (Samsung, Apple...)
    model: ifd0[0x0110],                            // model (SM-A52...)
    time: exif[0x9003] || ifd0[0x0132]              // when the photo was taken
  };
  // GPS: [degrees, minutes, seconds] → decimal. N/E = +, S/W = −
  if (gps[2] && gps[4]) {
    const toDec = d => d[0] + d[1] / 60 + d[2] / 3600;
    result.lat = toDec(gps[2]) * (gps[1] === "S" ? -1 : 1);
    result.lon = toDec(gps[4]) * (gps[3] === "W" ? -1 : 1);
  }
  return result;
}
// NEXT → showPhotoReport() puts the result on screen

// ---- Show the report ----
function showPhotoReport(file, buffer) {
  const box = document.getElementById("photoResult");
  let data = null;
  try { data = readExif(buffer); } catch (e) { data = null; } // broken file → don't crash

  const rows = [];
  if (data && data.lat !== undefined) {
    const lat = data.lat.toFixed(5), lon = data.lon.toFixed(5);
    rows.push(`<li class="bad">📍 <b>Location found:</b> ${lat}, ${lon}
      — <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}" target="_blank" rel="noopener noreferrer">see it on the map</a>
      <br><small>Anyone with this photo can find the exact place it was taken: your home, school or office.</small></li>`);
  }
  if (data && (data.make || data.model))
    rows.push(`<li class="bad">📱 <b>Phone:</b> ${safe((data.make || "") + " " + (data.model || ""))}</li>`);
  if (data && data.time)
    rows.push(`<li class="bad">🕒 <b>Taken on:</b> ${safe(data.time)}</li>`);

  box.innerHTML = rows.length
    ? `<h3>⚠️ Found ${rows.length} piece(s) of hidden information</h3><ul>${rows.join("")}</ul>
       <button id="clean">🧼 Download a safe copy (no location)</button>`
    : `<h3 class="ok">✅ No hidden location or phone details found in this photo.</h3>
       <p><small>(Apps like WhatsApp often strip this data already.)</small></p>`;

  // preview image
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.alt = "Preview of the uploaded photo";
  img.className = "preview";
  box.prepend(img);

  const btn = document.getElementById("clean");
  if (btn) btn.onclick = () => cleanPhoto(img, file.name);
}

// ---- Safe photo: redraw it on a canvas ----
// A canvas copies only the PIXELS, not the EXIF note, so the new file is "clean".
function cleanPhoto(img, name) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d").drawImage(img, 0, 0);
  c.toBlob(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "safe_" + name;                  // downloads as safe_photo.jpg
    a.click();
  }, "image/jpeg", 0.92);
}

/* =====================================================================
   B) CAPTION — OVERSHARING CHECK
   Each rule = words to look for (regex) + why it is risky.
   ===================================================================== */
const captionRules = [
  { words: /\b(trip|vacation|holiday|out of town|away from home|house is empty|nobody at home)\b/gi,
    why: "Telling people your house is empty is a signal for thieves. Post trip photos after you are back." },
  { words: /\b(from tomorrow|from today|\d+\s?(days?|weeks?)|next week|tomorrow|tonight)\b/gi,
    why: "Exact dates tell strangers how long you will be away." },
  { words: /\b(boarding pass|pnr|ticket|flight)\b/gi,
    why: "A boarding pass or PNR photo lets someone change or cancel your booking." },
  { words: /\b(school|college|class|tuition|coaching|office)\b/gi,
    why: "Naming your school, college or office tells people where to find you (or your kids) every day." },
  { words: /\b(birthday|dob|born on)\b/gi,
    why: "Name + birthday helps attackers guess passwords and answer bank security questions." },
  { words: /(\+91[\s-]?)?\b[6-9]\d{9}\b/g,
    why: "A public mobile number invites spam, scam calls and SIM-swap fraud." },
  { words: /\b\d{6}\b|\b(address|street|flat no|house no)\b/gi,
    why: "A PIN code or address helps someone locate your home." },
  { words: /\b(aadhaa?r|pan card|otp)\b/gi,
    why: "Never post Aadhaar, PAN or an OTP: this can lead to identity theft." }
];

document.getElementById("checkCaption").onclick = function () {
  const text = document.getElementById("caption").value;
  const box = document.getElementById("captionResult");
  if (!text.trim()) { box.innerHTML = "<p>Please type a caption first 🙂</p>"; return; }

  let html = safe(text);                           // escape first to block XSS
  const reasons = [];
  for (const r of captionRules) {
    if (text.match(r.words)) {
      reasons.push(r.why);
      html = html.replace(r.words, w => `<mark>${w}</mark>`);
    }
  }
  box.innerHTML = reasons.length
    ? `<h3>⚠️ Found ${reasons.length} oversharing risk(s)</h3><p class="quote">${html}</p><ul>${reasons.map(r => `<li>${r}</li>`).join("")}</ul>`
    : `<h3 class="ok">✅ This caption looks safe.</h3>`;
};

// ---- HTML escape: stops the user's text from running as code (XSS protection) ----
function safe(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

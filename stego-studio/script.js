// script.js — the LOGIC of Stego Studio (LSB steganography)
// Every pixel has Red, Green and Blue values from 0 to 255 (8 bits each).
// If we change only the LAST bit (the "least significant bit"), the colour
// changes by at most 1/255: the eye cannot see it. So we store our message
// one bit at a time in those last bits.
// Layout of the hidden data:  "SG" marker (2 bytes) · length (4 bytes) · message bytes (UTF-8)
// FLOW: hide → draw image on canvas → write bits into R,G,B → download PNG
//       reveal → read last bits back → check marker → decode text
// PNG is used for output because JPG compression would destroy the hidden bits.

const MAGIC = [0x53, 0x47];                         // "SG" (stego) — tells us a message is present

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read this image"));
    img.src = URL.createObjectURL(file);
  });
}

// draw an image on a canvas and return its pixel data
function toCanvas(img, canvas) {
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  return ctx;
}

/* ---------- HIDE ---------- */
document.getElementById("hide").onclick = async () => {
  const out = document.getElementById("hideOut");
  const file = document.getElementById("cover").files[0];
  const msg = document.getElementById("secret").value;
  if (!file) { out.innerHTML = '<div class="alert warn"><h3>Choose a cover image first</h3></div>'; return; }
  if (!msg) { out.innerHTML = '<div class="alert warn"><h3>Type a secret message</h3></div>'; return; }
  try {
    const img = await loadImage(file);
    const before = document.getElementById("before"), after = document.getElementById("after");
    toCanvas(img, before);
    const ctx = toCanvas(img, after);
    const data = ctx.getImageData(0, 0, after.width, after.height);
    const px = data.data;                          // [R,G,B,A, R,G,B,A, …]

    const body = new TextEncoder().encode(msg);    // text → bytes (works for Hindi/emoji too)
    const len = body.length;
    const bytes = [...MAGIC, len >>> 24 & 255, len >>> 16 & 255, len >>> 8 & 255, len & 255, ...body];
    const capacity = Math.floor(px.length / 4) * 3; // 3 usable bits per pixel (R,G,B; alpha untouched)
    if (bytes.length * 8 > capacity) throw new Error("Image is too small for this message");

    let bit = 0;
    for (const b of bytes) {
      for (let i = 7; i >= 0; i--, bit++) {
        const idx = Math.floor(bit / 3) * 4 + (bit % 3);   // skip every 4th value (alpha)
        px[idx] = (px[idx] & 0xFE) | ((b >> i) & 1);       // clear last bit, then set it to our bit
      }
    }
    for (let i = 3; i < px.length; i += 4) px[i] = 255;    // fully opaque so the browser keeps exact colours
    ctx.putImageData(data, 0, 0);

    document.getElementById("pair").hidden = false;
    after.toBlob(blob => {                                  // PNG = lossless, bits survive
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "secret_" + file.name.replace(/\.\w+$/, "") + ".png";
      a.click();
    }, "image/png");
    out.innerHTML = '<div class="alert good"><h3>✅ Hidden ' + len + " bytes inside " + (after.width * after.height).toLocaleString() +
      " pixels</h3><p>Your PNG is downloading. Only " + (bytes.length * 8) + " colour values changed, each by at most 1. Can you see any difference?</p></div>";
  } catch (e) {
    out.innerHTML = '<div class="alert bad"><h3></h3></div>';
    out.querySelector("h3").textContent = "⚠️ " + e.message;
  }
};

/* ---------- REVEAL ---------- */
document.getElementById("stego").addEventListener("change", async function () {
  const out = document.getElementById("revealOut");
  const file = this.files[0];
  if (!file) return;
  try {
    const img = await loadImage(file);
    const px = toCanvas(img, document.createElement("canvas")).getImageData(0, 0, img.naturalWidth, img.naturalHeight).data;
    let bit = 0;
    const readByte = () => {                        // rebuild one byte from 8 last-bits
      let b = 0;
      for (let i = 0; i < 8; i++, bit++) b = (b << 1) | (px[Math.floor(bit / 3) * 4 + (bit % 3)] & 1);
      return b;
    };
    if (readByte() !== MAGIC[0] || readByte() !== MAGIC[1]) throw new Error("No hidden message found in this image");
    const len = (readByte() << 24 | readByte() << 16 | readByte() << 8 | readByte()) >>> 0;
    if (len > 100000 || len * 8 > (px.length / 4) * 3) throw new Error("No hidden message found in this image");
    const body = new Uint8Array(len);
    for (let i = 0; i < len; i++) body[i] = readByte();
    out.innerHTML = '<div class="alert good"><h3>🔓 Secret message found</h3></div><div class="quote"></div>';
    out.querySelector(".quote").textContent = new TextDecoder().decode(body);   // textContent = XSS-safe
  } catch (e) {
    out.innerHTML = '<div class="alert warn"><h3></h3><p>Only PNG files created with "Hide a message" above can be read.</p></div>';
    out.querySelector("h3").textContent = e.message;
  }
});

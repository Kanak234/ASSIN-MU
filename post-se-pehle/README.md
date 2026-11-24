# Post Se Pehle – Photo & Caption Privacy Checker 📷

Upload a photo to see the hidden **EXIF data** inside it: the exact **GPS location**, the **phone model** and the **time** it was taken. Then download a **safe copy** without that data. You can also check a caption for oversharing (empty house, travel dates, school, phone number, PIN code).

**Files:** `index.html` (structure) · `style.css` (look) · `script.js` (EXIF reader, safe copy, caption rules)

**How it works:** the JPG is read as raw bytes. The script finds the APP1/EXIF section and parses the TIFF tags (GPS IFD 0x8825) to get the location. The safe copy is made by redrawing the photo on a `<canvas>`, which copies only pixels and drops the metadata. No library and no server are used.

**Run:** open `index.html`. **Deploy:** Vercel → import repo → choose this branch → Framework "Other" → Deploy.

Made by Kanak Prabhakar · BCA (Cyber Security), AISECT University

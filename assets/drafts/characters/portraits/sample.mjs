// Samples the eight portraits of a generated expression sheet onto one shared pixel grid, so
// every character ends up with pixels of the same size. Each cell takes the most common colour
// among its inner pixels (generated "pixel art" blurs the cell edges); near-black is empty.
// Writes <name>.cells.json and a k-means palette of the character's colours, darkest first.
//   node sample.mjs <name>
import fs from "fs";
import { readPng } from "./png.mjs";

export const GRID_W = 64, GRID_H = 82;                 // one portrait, in pixels
const BOX_W = 313, BOX_H = 400;                        // one portrait, in sheet pixels
const COLS = [0, 313, 627, 940];
// the top of each row of portraits, per sheet
const ROWS = { lance: [160, 636], pat: [214, 646], ysha: [205, 633] };

const name = process.argv[2];
const im = readPng(new URL(`./src/${name}-sheet.png`, import.meta.url));
const cw = BOX_W / GRID_W, ch = BOX_H / GRID_H;
const faces = [];
for (const top of ROWS[name]) for (const left of COLS) {
  const px = [];
  for (let gy = 0; gy < GRID_H; gy++) for (let gx = 0; gx < GRID_W; gx++) {
    const cnt = new Map();
    for (let y = Math.ceil(top + gy * ch + 1); y < top + (gy + 1) * ch - 1; y++)
      for (let x = Math.ceil(left + gx * cw + 1); x < left + (gx + 1) * cw - 1; x++) {
        if (x >= im.w || y >= im.h) continue;
        const [r, g, b] = im.get(x, y), k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
        cnt.set(k, (cnt.get(k) || 0) + 1);
      }
    let best = 0, bn = -1; for (const [k, n] of cnt) if (n > bn) { bn = n; best = k; }
    const c = [((best >> 10) & 31) * 8 + 4, ((best >> 5) & 31) * 8 + 4, (best & 31) * 8 + 4];
    px.push(c[0] + c[1] + c[2] < 40 ? null : c);
  }
  faces.push(px);
}

// k-means over every face's colours
const pts = faces.flat().filter(Boolean), K = Number(process.argv[3] || 14);
const d2 = (a, b) => (a[0] - b[0]) ** 2 * 0.3 + (a[1] - b[1]) ** 2 * 0.59 + (a[2] - b[2]) ** 2 * 0.11;
const lum = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
const sorted = [...pts].sort((a, b) => lum(a) - lum(b));
let cent = Array.from({ length: K }, (_, i) => [...sorted[Math.floor(((i + 0.5) / K) * sorted.length)]]);
const near = (c) => { let bi = 0, bd = Infinity; cent.forEach((m, i) => { const d = d2(c, m); if (d < bd) { bd = d; bi = i; } }); return bi; };
for (let it = 0; it < 40; it++) {
  const s = cent.map(() => [0, 0, 0, 0]);
  for (const c of pts) { const i = near(c); s[i][0] += c[0]; s[i][1] += c[1]; s[i][2] += c[2]; s[i][3]++; }
  cent = cent.map((m, i) => (s[i][3] ? s[i].slice(0, 3).map((v) => Math.round(v / s[i][3])) : m));
}
cent.sort((a, b) => lum(a) - lum(b));
const counts = cent.map(() => 0); for (const c of pts) counts[near(c)]++;
const hex = (m) => "#" + m.map((v) => v.toString(16).padStart(2, "0")).join("");
const faceIdx = faces.map((f) => f.map((c) => (c ? near(c) : -1)));
fs.writeFileSync(new URL(`./${name}.cells.json`, import.meta.url), JSON.stringify({ w: GRID_W, h: GRID_H, palette: cent.map(hex), faces: faceIdx }));
console.log(name, cent.map((m, i) => `${i}:${hex(m)}(${counts[i]})`).join(" "));

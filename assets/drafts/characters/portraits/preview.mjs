// Draws a character's eight portraits (from <name>.cells.json or <name>.clean.json) side by side,
// four to a row, scaled up, on dark grey: for checking the grid by eye.
//   node preview.mjs <file.json> <out.png> [scale=4]
import fs from "fs";
import { writePng } from "./png.mjs";
const [inp, out, S = "4"] = process.argv.slice(2);
const { w, h, palette, faces } = JSON.parse(fs.readFileSync(inp, "utf8"));
const s = Number(S), gap = 4, W = (w * 4 + gap * 5) * s, H = (h * 2 + gap * 3) * s;
const buf = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) buf.set([40, 40, 44, 255], i * 4);
const rgb = palette.map((x) => [1, 3, 5].map((o) => parseInt(x.slice(o, o + 2), 16)));
faces.forEach((f, n) => {
  const ox = gap + (n % 4) * (w + gap), oy = gap + Math.floor(n / 4) * (h + gap);
  f.forEach((k, i) => {
    if (k < 0) return;
    const x = ox + (i % w), y = oy + Math.floor(i / w);
    for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) buf.set([...rgb[k], 255], (((y * s + dy) * W) + x * s + dx) * 4);
  });
});
writePng(out, W, H, buf);
console.log("wrote", out);

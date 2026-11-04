// Turns sampled cells (cells.ps1) into a pxl sprite: near-black background becomes
// transparent, colours are clustered (k-means) into a small palette, written as asano.px.js.
//   node convert.mjs <cells.json> <out.px.js> [colours=16] [name=lance]
import fs from "fs";
const [inp, out, K = "16", name = "lance"] = process.argv.slice(2);
const { w, h, px } = JSON.parse(fs.readFileSync(inp, "utf8"));
const rgb = px.map((v) => [(v >> 16) & 255, (v >> 8) & 255, v & 255]);
const isBg = (c) => c[0] + c[1] + c[2] < 75;
const pts = rgb.filter((c) => !isBg(c));
// k-means, seeded by spreading over brightness
const k = Number(K);
const sorted = [...pts].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
let cent = Array.from({ length: k }, (_, i) => [...sorted[Math.floor(((i + 0.5) / k) * sorted.length)]]);
const d2 = (a, b) => (a[0] - b[0]) ** 2 * 0.3 + (a[1] - b[1]) ** 2 * 0.59 + (a[2] - b[2]) ** 2 * 0.11;
const near = (c) => { let bi = 0, bd = Infinity; cent.forEach((m, i) => { const d = d2(c, m); if (d < bd) { bd = d; bi = i; } }); return bi; };
for (let it = 0; it < 30; it++) {
  const sum = cent.map(() => [0, 0, 0, 0]);
  for (const c of pts) { const i = near(c); sum[i][0] += c[0]; sum[i][1] += c[1]; sum[i][2] += c[2]; sum[i][3]++; }
  cent = cent.map((m, i) => (sum[i][3] ? [sum[i][0] / sum[i][3], sum[i][1] / sum[i][3], sum[i][2] / sum[i][3]] : m));
}
cent = cent.map((m) => m.map(Math.round));
const keys = "abcdefghijklmnopqrstuvwxyz";
const hex = (m) => "#" + m.map((v) => v.toString(16).padStart(2, "0")).join("");
const order = cent.map((m, i) => i).sort((a, b) => cent[a].reduce((s, v) => s + v, 0) - cent[b].reduce((s, v) => s + v, 0));
const keyOf = {}; order.forEach((ci, n) => (keyOf[ci] = keys[n]));
const rows = [];
for (let y = 0; y < h; y++) {
  let s = "";
  for (let x = 0; x < w; x++) { const c = rgb[y * w + x]; s += isBg(c) ? "." : keyOf[near(c)]; }
  rows.push("  " + s);
}
// smoothing passes (SMOOTH env), keeping the darkest key (the outline)
const passes = Number(process.env.SMOOTH || 0);
for (let p = 0; p < passes; p++) { const copy = rows.map((r) => r.slice(2)); for (let y = 1; y < h - 1; y++) { const line = [...copy[y]]; for (let x = 1; x < w - 1; x++) { if (line[x] === "." || line[x] === keys[0]) continue; const cnt = {}; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) { const n = copy[y + dy][x + dx]; cnt[n] = (cnt[n] || 0) + 1; } const [b, n] = Object.entries(cnt).sort((a, z) => z[1] - a[1])[0]; if (n >= 6 && b !== ".") line[x] = b; } rows[y] = "  " + line.join(""); } }
const pal = order.map((ci) => `${keyOf[ci]}: "${hex(cent[ci])}"`).join(", ");
const src = `// Lance, close-up, traced from the generated expression sheet (the plain face) and snapped to
// a true pixel grid: ${w} x ${h}, ${k} colours, keys dark to light. Made by convert.mjs from cells.ps1.
pal({ ${pal} })
sprite("${name}", \`
${rows.join("\n")}\`)
`;
fs.writeFileSync(out, src);
console.log(`wrote ${out}: ${w}x${h}, ${k} colours`);

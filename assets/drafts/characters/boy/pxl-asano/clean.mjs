// Cleans the traced sprite: merges near-duplicate colours into a small named palette, then
// flattens the hair (a pixel takes its neighbours' colour when most of them agree), keeping
// the outline. Rewrites lance.px.js.
//   node clean.mjs lance.px.js
import fs from "fs";
const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");
// old key -> new key
const merge = { a: "K", b: "K", c: "K", d: "D", e: "D", g: "D", f: "R", h: "H", i: "H", j: "H", k: "L", l: "S", m: "F", n: "F", o: "W", p: "W" };
const pal = { K: "#33201f", D: "#5a2f2b", H: "#76403a", L: "#8e5747", R: "#6a3232", S: "#c3907a", F: "#eab79c", W: "#ecd7c9" };
const grid = src.match(/`\n([\s\S]*?)`/)[1].split("\n").map((r) => [...r.trim()].map((ch) => (ch === "." ? "." : merge[ch] ?? ch)));
const h = grid.length, w = grid[0].length;
const hair = new Set(["D", "H", "L"]);
for (let pass = 0; pass < 2; pass++) {
  const copy = grid.map((r) => [...r]);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (!hair.has(copy[y][x])) continue;
    const count = {};
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) { const n = copy[y + dy][x + dx]; count[n] = (count[n] || 0) + 1; }
    const [best, n] = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
    if (hair.has(best) && n >= 5) grid[y][x] = best;
  }
}
src = src.replace(/pal\(\{[^)]*\}\)/, "pal({ " + Object.entries(pal).map(([k, v]) => `${k}: "${v}"`).join(", ") + " })");
src = src.replace(/`\n[\s\S]*?`/, "`\n" + grid.map((r) => "  " + r.join("")).join("\n") + "`");
src = src.replace("keys dark to light.", "cleaned by clean.mjs: K outline, D/H/L hair, S/F skin, W shirt, R strap.");
fs.writeFileSync(file, src);
console.log("cleaned", file);

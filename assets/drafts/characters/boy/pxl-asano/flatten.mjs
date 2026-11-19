// Rebuilds a traced sprite as clean cel-shaded pixel art: every pixel is assigned to a part
// (hair, skin, eyes, shirt, strap, tie) by its colour and where it is, each part gets exactly
// two colours (a base and one shadow), the shadows are smoothed into clean shapes, and the
// silhouette and the line work are pure black.
//   node flatten.mjs lance-big.px.js lance-flat.px.js
import fs from "fs";
const [inp, out] = process.argv.slice(2);
const src = fs.readFileSync(inp, "utf8");
const grid = src.match(/`\n([\s\S]*?)`/)[1].split("\n").map((r) => [...r.trim()]);
const H = grid.length, W = grid[0].length;

// where the parts are (rows and columns of this trace)
const NECK_TOP = 118, NECK_X = [52, 83], NECK_BOTTOM = 150;
const STRAP = (x) => x < 37 || x > 96;
const TIE = (x, y) => y >= 145 && x >= 50 && x <= 66;

const pal = {
  Z: "#000000",
  H: "#7e4337", h: "#57302b",   // hair: base, shadow
  S: "#ecbba1", s: "#c8907a",   // skin
  E: "#3d2526",                 // eyes (one flat dark brown inside the black lines)
  W: "#efe1d7", w: "#c9aca1",   // shirt
  R: "#713635", r: "#4e2829",   // strap
  T: "#4a3b3d",                 // tie
};
const dark = new Set(["c", "d"]), mid = new Set(["e", "f", "g", "h", "i"]);
const lightShadow = new Set(["j", "k"]), lightBase = new Set(["l", "m", "n"]);

// the face's span on each row: between its first and last skin pixel
const span = grid.map((row) => {
  let a = -1, b = -1;
  row.forEach((k, x) => { if (lightShadow.has(k) || lightBase.has(k)) { if (a < 0) a = x; b = x; } });
  return [a, b];
});

const outG = grid.map((row, y) => row.map((k, x) => {
  if (k === "." ) return ".";
  if (k === "a" || k === "b") return "Z";
  if (y < NECK_TOP) {
    if (lightShadow.has(k)) return "s";
    if (lightBase.has(k)) return "S";
    const inFace = x > span[y][0] && x < span[y][1] && y >= 66 && y <= 96;
    if (dark.has(k)) return inFace ? "E" : "h";
    return "H";
  }
  // below the chin: neck, shirt, straps, tie
  const neck = x >= NECK_X[0] && x <= NECK_X[1] && y < NECK_BOTTOM;
  if (TIE(x, y) && (mid.has(k) || dark.has(k))) return "T";
  if (lightBase.has(k)) return neck && k !== "n" ? "S" : "W";
  if (lightShadow.has(k)) return neck ? "s" : "w";
  if (STRAP(x)) return dark.has(k) ? "r" : "R";
  return dark.has(k) ? "Z" : "w";              // dark lines inside the shirt are folds
}));

// smooth: a pixel takes the colour most of its neighbours share, if it is the other tone of the
// same part (so shadows become clean shapes, but parts never bleed into each other)
const part = { H: "hair", h: "hair", S: "skin", s: "skin", W: "shirt", w: "shirt", R: "strap", r: "strap" };
for (let pass = 0; pass < 3; pass++) {
  const copy = outG.map((r) => [...r]);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const k = copy[y][x]; if (!part[k]) continue;
    const cnt = {};
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) { const n = copy[y + dy][x + dx]; if (part[n] === part[k]) cnt[n] = (cnt[n] || 0) + 1; }
    const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
    if (best && best[0] !== k && best[1] >= 5) outG[y][x] = best[0];
  }
}
// eyes: a dark pixel left alone in the face is noise
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (outG[y][x] === "E") {
  let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && (outG[y + dy][x + dx] === "E" || outG[y + dy][x + dx] === "Z")) n++;
  if (n < 2) outG[y][x] = "S";
}
// --- one brush: every line one pixel wide, no stray pixels --------------------------------
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? "." : outG[y][x]);
// the colour most of a pixel's neighbours have, other than black and empty
const majority = (x, y, skip) => {
  const cnt = {};
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) { const n = at(x + dx, y + dy); if (n !== "." && !skip.has(n)) cnt[n] = (cnt[n] || 0) + 1; }
  const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : null;
};
// 1. small islands of any colour (fewer than 4 pixels touching) take their surroundings' colour
const islands = (minSize, keys, keep = () => false) => {
  const seen = outG.map((r) => r.map(() => false));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = outG[y][x]; if (seen[y][x] || k === "." || !keys.has(k)) continue;
    const cells = [], stack = [[x, y]]; seen[y][x] = true;
    while (stack.length) { const [cx, cy] = stack.pop(); cells.push([cx, cy]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny][nx] && outG[ny][nx] === k) { seen[ny][nx] = true; stack.push([nx, ny]); } } }
    if (cells.length < minSize && !cells.some(([cx, cy]) => keep(cx, cy))) for (const [cx, cy] of cells) { const m = majority(cx, cy, new Set([k, "Z"])); if (m) outG[cy][cx] = m; }
  }
};
islands(5, new Set(["H", "h", "S", "s", "W", "w", "R", "r", "E", "T"]));
// small black marks inside the face (nose, mouth, lids) and in the shirt (folds) are drawing, not noise
islands(2, new Set(["Z"]), (x, y) => y >= 60);
// 2. thin the black lines to one pixel (Zhang-Suen), outside the eyes
const eyeZone = (x, y) => y >= 66 && y <= 96 && outG[y][x] !== undefined && x > span[y][0] && x < span[y][1];
const isZ = (x, y) => at(x, y) === "Z";
for (let changed = true, iter = 0; changed && iter < 20; iter++) {
  changed = false;
  for (const step of [0, 1]) {
    const del = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!isZ(x, y) || eyeZone(x, y)) continue;
      const p = [isZ(x, y - 1), isZ(x + 1, y - 1), isZ(x + 1, y), isZ(x + 1, y + 1), isZ(x, y + 1), isZ(x - 1, y + 1), isZ(x - 1, y), isZ(x - 1, y - 1)];
      const b = p.filter(Boolean).length;
      let a = 0; for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) a++;
      if (b < 2 || b > 6 || a !== 1) continue;
      if (step === 0 && (p[0] && p[2] && p[4] || p[2] && p[4] && p[6])) continue;
      if (step === 1 && (p[0] && p[2] && p[6] || p[0] && p[4] && p[6])) continue;
      del.push([x, y]);
    }
    for (const [x, y] of del) { const m = majority(x, y, new Set(["Z"])); if (m) { outG[y][x] = m; changed = true; } }
  }
}
// 3. pixel-perfect corners: a black pixel in the elbow of an L is one too many
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
  if (!isZ(x, y) || eyeZone(x, y)) continue;
  const n = isZ(x, y - 1), s2 = isZ(x, y + 1), e = isZ(x + 1, y), w2 = isZ(x - 1, y);
  if ((n && e && !s2 && !w2 && !isZ(x + 1, y - 1)) || (n && w2 && !s2 && !e && !isZ(x - 1, y - 1)) ||
      (s2 && e && !n && !w2 && !isZ(x + 1, y + 1)) || (s2 && w2 && !n && !e && !isZ(x - 1, y + 1))) {
    const m = majority(x, y, new Set(["Z"])); if (m) outG[y][x] = m;
  }
}
// 4. a last pass for single pixels that no longer match anything around them, and larger
// shadows only: small shirt and hair shadow patches merge into their base
islands(3, new Set(["H", "h", "S", "s", "W", "w", "R", "r", "T"]));
islands(14, new Set(["w"]));
islands(8, new Set(["h", "s"]));
// 5. the nose and mouth, drawn by hand (the trace filed them under hair shadow)
for (let y = 96; y <= 112; y++) for (let x = 56; x <= 72; x++) if (outG[y][x] === "h" || outG[y][x] === "H") outG[y][x] = "S";
outG[100][64] = "s";                                   // nose
for (let x = 62; x <= 66; x++) outG[108][x] = "Z";     // small closed mouth

// black silhouette
const empty = (x, y) => x < 0 || y < 0 || x >= W || y >= H || outG[y][x] === ".";
const edge = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!empty(x, y) && (empty(x - 1, y) || empty(x + 1, y) || empty(x, y - 1) || empty(x, y + 1))) edge.push([x, y]);
for (const [x, y] of edge) outG[y][x] = "Z";

const used = new Set(outG.flat());
const palStr = Object.entries(pal).filter(([k]) => used.has(k)).map(([k, v]) => `${k}: "${v}"`).join(", ");
fs.writeFileSync(out, `// Lance, close-up, cel-shaded: traced from the generated expression sheet (lance-big.px.js),
// then rebuilt by flatten.mjs so each part has one base and one shadow colour, shadows in clean
// shapes, and every line black. Z black; H/h hair; S/s skin; E eyes; W/w shirt; R/r strap; T tie.
pal({ ${palStr} })
sprite("lance_flat", \`
${outG.map((r) => "  " + r.join("")).join("\n")}\`)
`);
console.log("wrote", out, `${W}x${H}, colours: ${[...used].filter((k) => k !== ".").join("")}`);

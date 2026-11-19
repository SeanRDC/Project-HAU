// Redraws the parts of the traced Lance that tracing can't get right, by hand, as clean shapes:
//   1. the face: kept, with the jaw outlined and the stray stroke across the forehead removed;
//   2. the hair: one base brown, shadow only along the underside of each clump, and a few long
//      one-pixel strand lines that follow the hair out from the crown;
//   3. the shirt: flat cloth, the collar and tie redrawn as clean shapes, a shadow under the
//      collar points and along the straps, the neck with one shadow under the chin.
// Every line is one black pixel wide.
//   node redraw.mjs lance-flat.px.js lance-drawn.px.js
import fs from "fs";
const [inp, out] = process.argv.slice(2);
const src = fs.readFileSync(inp, "utf8");
const pal = src.match(/pal\(\{[^)]*\}\)/)[0];
const g = src.match(/`\n([\s\S]*?)`/)[1].split("\n").map((r) => [...r.trim()]);
const H = g.length, W = g[0].length;
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? "." : g[y][x]);
const set = (x, y, k) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = k; };
const CHIN = 118;

// ---- masks -----------------------------------------------------------------------------
const isHair = (k) => k === "H" || k === "h";
const isSkin = (k) => k === "S" || k === "s";
const mask = (test) => g.map((r, y) => r.map((k, x) => test(k, x, y)));
// hair: brown pixels above the chin, and the black strand lines among them
const hair = mask((k, x, y) => y < CHIN && (isHair(k) || (k === "Z" && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => isHair(at(x + dx, y + dy))).length >= 2)));
const shirt = mask((k, x, y) => y >= CHIN && k !== "." && !isSkin(k) && k !== "R" && k !== "r");
const strap = mask((k, x, y) => y >= CHIN && (k === "R" || k === "r"));
const neck = mask((k, x, y) => y >= CHIN && isSkin(k));

// ---- 1. the face -------------------------------------------------------------------------
// the stray stroke across the right of the forehead
for (let y = 66; y <= 73; y++) for (let x = 70; x <= 92; x++) if (at(x, y) === "h" && isSkin(at(x, y - 1) || "") ) set(x, y, "S");
for (let y = 66; y <= 74; y++) for (let x = 70; x <= 92; x++) if ((at(x, y) === "h" || at(x, y) === "Z") && isSkin(at(x, y - 2)) && isSkin(at(x, y + 2))) set(x, y, "S");

// ---- 2. the hair -------------------------------------------------------------------------
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hair[y][x]) set(x, y, "H");
// shadow: the underside of each clump (hair whose pixel 3 below is not hair)
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!hair[y][x]) continue;
  const below = [1, 2, 3].some((d) => y + d >= H || !hair[y + d][x]);
  if (below && y > 8) set(x, y, "h");
}
// strands: long curves out from the crown, kept to the middle of the hair (not its edges)
// each strand has its own start and bends like a lock of hair, and the side of it away from
// the light (the right, for the left half; the left, for the right half) falls in shadow, so
// the hair reads as clumps
const strands = [
  [[44, 8], [24, 18], [9, 38]], [[52, 12], [34, 26], [20, 50]], [[57, 18], [46, 36], [36, 58]],
  [[62, 24], [56, 42], [50, 64]], [[67, 18], [66, 40], [62, 60]],
  [[73, 14], [80, 34], [86, 56]], [[80, 9], [96, 22], [106, 46]], [[88, 7], [106, 14], [118, 32]],
  [[76, 26], [92, 44], [100, 66]],
];
const bez = (p, t) => [0, 1].map((i) => (1 - t) ** 2 * p[0][i] + 2 * (1 - t) * t * p[1][i] + t ** 2 * p[2][i]);
const inside = (x, y) => hair[y]?.[x] && hair[y]?.[x - 2] && hair[y]?.[x + 2] && hair[y - 2]?.[x] && hair[y + 2]?.[x];
for (const s of strands) {
  const away = s[2][0] < 64 ? 1 : -1;
  let last = null;
  for (let t = 0.08; t <= 0.88; t += 0.004) {
    const [x, y] = bez(s, t).map(Math.round);
    if (last && last[0] === x && last[1] === y) continue;
    last = [x, y];
    if (!inside(x, y)) continue;
    set(x, y, "Z");
    for (const d of [1, 2, 3]) if (hair[y]?.[x + away * d] && at(x + away * d, y) !== "Z") set(x + away * d, y, "h");
  }
}
// pixel-perfect strands: drop the corner pixel of any L
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
  if (at(x, y) !== "Z" || !hair[y][x]) continue;
  const n = at(x, y - 1) === "Z", s2 = at(x, y + 1) === "Z", e = at(x + 1, y) === "Z", w2 = at(x - 1, y) === "Z";
  if ((n && e && !s2 && !w2) || (n && w2 && !s2 && !e) || (s2 && e && !n && !w2) || (s2 && w2 && !n && !e)) set(x, y, "H");
}
// the hair's edge against the face is outlined
for (let y = 0; y < CHIN; y++) for (let x = 0; x < W; x++) if (hair[y][x] && [[1, 0], [-1, 0], [0, 1]].some(([dx, dy]) => isSkin(at(x + dx, y + dy)))) set(x, y, "Z");

// ---- 3. the shirt ------------------------------------------------------------------------
for (let y = CHIN; y < H; y++) for (let x = 0; x < W; x++) {
  if (shirt[y][x]) set(x, y, "W");
  if (strap[y][x]) set(x, y, "R");
  if (neck[y][x]) set(x, y, "S");
}
// neck: one shadow under the chin, curved
for (let y = CHIN; y < H; y++) for (let x = 0; x < W; x++) if (neck[y][x] && y < 129 - Math.abs(x - 68) / 4) set(x, y, "s");
// polygon helpers
const inPoly = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const line = (a, b, k) => { let [x0, y0] = a, [x1, y1] = b; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; for (;;) { set(x0, y0, k); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } };
const poly = (pts, fill) => {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inPoly(pts, x + 0.5, y + 0.5)) set(x, y, fill);
  for (let i = 0; i < pts.length; i++) line(pts[i], pts[(i + 1) % pts.length], "Z");
};
// collar points: shadow first (the cloth under each point), then the points themselves
const leftCollar = [[56, 119], [45, 124], [43, 129], [52, 147], [57, 133]];
const rightCollar = [[81, 119], [92, 124], [95, 130], [85, 147], [80, 133]];
const shadowOf = (pts) => pts.map(([x, y]) => [x + 1, y + 3]);
poly(shadowOf(leftCollar), "w"); poly(shadowOf(rightCollar), "w");
poly(leftCollar, "W"); poly(rightCollar, "W");
// the opening under the neck, in shadow, and the tie
poly([[57, 133], [80, 133], [69, 150]], "w");
for (let y = 133; y <= 150; y++) for (let x = 57; x <= 80; x++) if (inPoly([[57, 133], [80, 133], [69, 150]], x + 0.5, y + 0.5) && neck[y]?.[x]) set(x, y, y < 140 ? "s" : "S");
poly([[66, 146], [72, 146], [71, 151], [67, 151]], "T");               // knot
poly([[67, 151], [71, 151], [74, 161], [69, 162], [64, 161]], "T");     // blade
// straps: the side toward the middle in shadow
for (let y = CHIN; y < H; y++) for (let x = 0; x < W; x++) {
  if (!strap[y][x]) continue;
  const inner = x < 64 ? !strap[y][x + 3] : !strap[y][x - 3];
  if (inner) set(x, y, "r");
}
// shirt shadow beside each strap
for (let y = CHIN; y < H; y++) for (let x = 0; x < W; x++) if (shirt[y][x] && at(x, y) === "W" && [-2, -1, 1, 2].some((d) => strap[y][x + d])) set(x, y, "w");

// ---- outline: the silhouette and every boundary between parts, one pixel ---------------
const partOf = (k) => (k === "." ? "." : isHair(k) ? "hair" : isSkin(k) || k === "E" ? "skin" : k === "W" || k === "w" ? "shirt" : k === "R" || k === "r" ? "strap" : k === "T" ? "tie" : k);
const edges = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const k = at(x, y); if (k === "." || k === "Z") continue;
  for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
    const n = at(x + dx, y + dy);
    if (n === "." || (y >= CHIN && n !== "Z" && partOf(n) !== partOf(k) && (dx > 0 || dy > 0))) { edges.push([x, y]); break; }
  }
}
for (const [x, y] of edges) set(x, y, "Z");
// stray black marks in the shirt (old fold lines cut off by the new collar) go
{
  const seen = g.map((r) => r.map(() => false));
  for (let y = CHIN; y < H; y++) for (let x = 0; x < W; x++) {
    if (seen[y][x] || at(x, y) !== "Z") continue;
    const cells = [], stack = [[x, y]]; seen[y][x] = true;
    while (stack.length) { const [cx, cy] = stack.pop(); cells.push([cx, cy]);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = cx + dx, ny = cy + dy;
        if (ny >= CHIN && at(nx, ny) === "Z" && !seen[ny][nx]) { seen[ny][nx] = true; stack.push([nx, ny]); } } }
    if (cells.length < 6) for (const [cx, cy] of cells) set(cx, cy, "W");
  }
}

fs.writeFileSync(out, `// Lance, close-up, hand-redrawn over the cel-shaded trace (lance-flat.px.js) by redraw.mjs:
// the face kept, the hair and the shirt redrawn as clean shapes, every line one black pixel.
${pal}
sprite("lance_drawn", \`
${g.map((r) => "  " + r.join("")).join("\n")}\`)
`);
console.log("wrote", out);

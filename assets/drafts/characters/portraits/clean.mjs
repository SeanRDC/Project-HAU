// Cleans a sampled sheet (sample.mjs) into finished portraits that follow the same rules for
// every character:
//   - one palette: black lines, the same eye colour and the same shirt, and each part with
//     exactly two tones (a base and one shadow);
//   - every line black; the silhouette outlined in black (open at the bottom, where the
//     portrait is cut);
//   - no stray pixels: specks of fewer than 3 pixels take their surroundings' colour.
// Writes <name>.clean.json and <name>.px.js (one sprite per expression, plus a sheet).
//   node clean.mjs <name>
import fs from "fs";

// the shared colours
const SHARED = {
  Z: "#000000",                   // lines
  E: "#2b1a1c",                   // eyes, brows, mouth
  W: "#efe3d6", w: "#cdb2a5",     // shirt
};
// per character: what each sampled colour (sample.mjs's palette, darkest first) is, and the
// colours of their own parts. Keys: H/h hair, S/s skin, R/r bag strap, A accent (tie, lanyard).
const CHARS = {
  lance: {
    map: ["Z", "h", "r", "h", "R", "H", "H", "H", "H", "w", "s", "S", "S", "W"],
    pal: { H: "#7a4034", h: "#55302b", S: "#ecbba1", s: "#cf9580", R: "#7d2c33", r: "#511f26", A: "#3d3436" },
  },
  pat: {
    map: ["h", "h", "h", "h", "h", "H", "H", "H", "H", "H", "s", "S", "w", "W"],
    pal: { H: "#4a322e", h: "#2e1e1f", S: "#dc9a6e", s: "#b57452", R: "#2e1e1f", r: "#1e1415", A: "#2e1e1f" },
  },
  ysha: {
    map: ["Z", "R", "h", "h", "w", "h", "H", "H", "H", "H", "w", "s", "S", "W"],
    pal: { H: "#d4813f", h: "#ac532f", S: "#ecbba1", s: "#d79a7c", R: "#2d2d4f", r: "#1d1d36", A: "#d4682f" },
  },
};
export const KEYS = { ...SHARED };

const name = process.argv[2];
const cfg = CHARS[name];
const { w, h, palette, faces } = JSON.parse(fs.readFileSync(new URL(`./${name}.cells.json`, import.meta.url), "utf8"));
const pal = { ...SHARED, ...cfg.pal };
const part = (k) => ({ H: "hair", h: "hair", S: "skin", s: "skin", W: "shirt", w: "shirt", R: "strap", r: "strap" })[k] || k;

const cleaned = faces.map((face) => {
  const g = [];
  for (let y = 0; y < h; y++) g.push(face.slice(y * w, (y + 1) * w).map((i) => (i < 0 ? "." : cfg.map[i])));
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? "." : g[y][x]);
  const around = (x, y, r, test) => { let n = 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if ((dx || dy) && test(at(x + dx, y + dy))) n++; return n; };
  const components = (test) => {
    const seen = g.map((r) => r.map(() => false)), out = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (seen[y][x] || !test(g[y][x])) continue;
      const cells = [], stack = [[x, y]]; seen[y][x] = true;
      while (stack.length) { const [cx, cy] = stack.pop(); cells.push([cx, cy]);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && !seen[ny][nx] && test(g[ny][nx])) { seen[ny][nx] = true; stack.push([nx, ny]); } } }
      out.push(cells);
    }
    return out;
  };
  // how much of a group of pixels' rim is a given part
  const rim = (cells, test) => {
    const inside = new Set(cells.map(([x, y]) => x + "," + y)); let all = 0, hit = 0;
    for (const [x, y] of cells) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (inside.has(x + dx + "," + (y + dy))) continue; all++; if (test(at(x + dx, y + dy))) hit++;
    }
    return all ? hit / all : 0;
  };
  const dark = (k) => k === "Z" || k === "h";

  // 1. eyes, brows and mouths: dark pieces set in skin
  for (const c of components(dark)) if (c.length < 60 && rim(c, (k) => part(k) === "skin") > 0.7) for (const [x, y] of c) g[y][x] = "E";
  // strap colour up in the face is the eyes (Ysha's navy straps and dark eyes are close)
  for (let y = 0; y < h * 0.6; y++) for (let x = 0; x < w; x++) if (part(g[y][x]) === "strap") g[y][x] = "E";
  // hair tones under the chin, in the middle, are the neck's shadow (Ysha's sheet shades her
  // neck in the orange of her hair)
  for (let y = Math.floor(h * 0.55); y < h * 0.72; y++) for (let x = Math.floor(w * 0.36); x < w * 0.64; x++)
    if (part(g[y][x]) === "hair" && around(x, y, 2, (n) => part(n) === "skin" || part(n) === "shirt") >= 6) g[y][x] = "s";
  // 2. skin tones inside the shirt are the shirt's own shadow; hair tones inside it are the
  //    accent (Lance's tie, Ysha's lanyard)
  for (let pass = 0; pass < 2; pass++) for (let y = Math.floor(h * 0.6); y < h; y++) for (let x = 0; x < w; x++) {
    const k = g[y][x], shirt = around(x, y, 2, (n) => part(n) === "shirt");
    if (part(k) === "skin" && shirt > around(x, y, 2, (n) => part(n) === "skin") + 4) g[y][x] = k === "S" ? "W" : "w";
    if ((part(k) === "hair" || part(k) === "strap") && shirt >= 14 && y > h * 0.72) g[y][x] = "A";
  }
  // 3. each part's two tones settle into clean shapes: a pixel takes its part's other tone when
  //    nearly all of its neighbours have it (so specks go and lines stay)
  for (let pass = 0; pass < 3; pass++) {
    const copy = g.map((r) => [...r]);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const k = copy[y][x]; if (part(k) === k) continue;
      let same = 0, other = 0, o = null;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) { const n = copy[y + dy][x + dx]; if (part(n) !== part(k)) continue; if (n === k) same++; else { other++; o = n; } }
      if (other >= 6) g[y][x] = o;
    }
  }
  // 4. specks: fewer than 3 pixels of a colour take the colour most of their neighbours have
  const majority = (x, y, skip) => { const cnt = {}; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) { const n = at(x + dx, y + dy); if (n !== "." && n !== skip) cnt[n] = (cnt[n] || 0) + 1; } const b = Object.entries(cnt).sort((a, b2) => b2[1] - a[1])[0]; return b && b[0]; };
  for (const key of Object.keys(pal)) for (const c of components((k) => k === key)) {
    if (c.length >= 4 || key === "E") continue;          // eyes keep their small marks (a sweat drop, a mouth)
    for (const [x, y] of c) { const m = majority(x, y, key); if (m) g[y][x] = m; }
  }
  // empty specks inside the figure are filled, figure specks outside it are dropped
  for (const c of components((k) => k === ".")) if (c.length < 4) for (const [x, y] of c) { const m = majority(x, y, "."); if (m) g[y][x] = m; }
  for (const c of components((k) => k !== ".")) if (c.length < 40) for (const [x, y] of c) g[y][x] = ".";
  // 5. the silhouette in black, one pixel, open along the bottom cut
  const edge = [];
  for (let y = 0; y < h - 1; y++) for (let x = 0; x < w; x++) if (g[y][x] !== "." && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(x + dx, y + dy) === ".")) edge.push([x, y]);
  for (const [x, y] of edge) g[y][x] = "Z";
  // 6. lines one pixel: a black pixel in the elbow of an L is one too many
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (g[y][x] !== "Z") continue;
    const n = at(x, y - 1) === "Z", s = at(x, y + 1) === "Z", e = at(x + 1, y) === "Z", wv = at(x - 1, y) === "Z";
    const out = (dx, dy) => at(x + dx, y + dy) === ".";
    if (((n && e && !s && !wv) || (n && wv && !s && !e) || (s && e && !n && !wv) || (s && wv && !n && !e)) && !out(1, 0) && !out(-1, 0) && !out(0, 1) && !out(0, -1)) {
      const m = majority(x, y, "Z"); if (m && m !== ".") g[y][x] = m;
    }
  }
  return g;
});

const keys = Object.keys(pal);
fs.writeFileSync(new URL(`./${name}.clean.json`, import.meta.url), JSON.stringify({ w, h, palette: keys.map((k) => pal[k]), faces: cleaned.map((g) => g.flat().map((k) => (k === "." ? -1 : keys.indexOf(k)))) }));
const EXPRESSIONS = ["neutral", "smile", "laugh", "sad", "surprised", "worried", "annoyed", "away"];
const used = new Set(cleaned.flat(2));
const src = `// ${name[0].toUpperCase() + name.slice(1)}'s dialogue portraits, ${w} x ${h}: sampled from the generated expression sheet
// (src/${name}-sheet.png) by sample.mjs onto the grid every character shares, then cleaned by
// clean.mjs to the shared rules (black lines, two tones a part, no stray pixels). Do not edit by
// hand; change the scripts and run them again.
pal({ ${keys.filter((k) => used.has(k)).map((k) => `${k}: "${pal[k]}"`).join(", ")} })
${cleaned.map((g, i) => `sprite("${name}_${EXPRESSIONS[i]}", \`\n${g.map((r) => "  " + r.join("")).join("\n")}\`)`).join("\n")}
sheet("${name}_portraits", ["${name}_*"], { pad: 2 })
`;
fs.writeFileSync(new URL(`./${name}.px.js`, import.meta.url), src);
console.log("wrote", `${name}.px.js`);

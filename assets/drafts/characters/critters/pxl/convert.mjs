// The campus cats and the maya through pxl, the way Migo is (../../npcs/pxl/migo/). Reads the
// PixelLab frames in source/ (requests in pixellab/), cleans them for the game's look, puts each
// animal on one shared palette and writes cats.px.js and maya.px.js: one pxl anim per pose, the
// cats' other coats as palette swaps. Then build.ps1 builds them into the game.
//   - alpha is solid or empty (PixelLab leaves soft edges);
//   - near-black edge pixels become a darker tone of the colour beside them (the cast are
//     edged in their own colour, never black);
//   - lone pixels are dropped;
//   - every frame of a pose is trimmed to one box (shared by poses that follow each other in
//     place), feet on the bottom row.
// usage: node convert.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));

// --- PNG in (8-bit RGB or RGBA, as PixelLab and Godot write them) ---------------------------
function readPng(path) {
  const b = readFileSync(path);
  let w = 0, h = 0, type = 6, idat = [];
  for (let at = 8; at < b.length;) {
    const len = b.readUInt32BE(at), kind = b.toString('ascii', at + 4, at + 8), data = b.subarray(at + 8, at + 8 + len);
    if (kind === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; if (data[8] !== 8) throw new Error(`${path}: 8-bit only`); }
    if (kind === 'IDAT') idat.push(data);
    at += 12 + len;
  }
  const bpp = type === 6 ? 4 : 3, raw = inflateSync(Buffer.concat(idat)), stride = w * bpp;
  const px = new Uint8Array(w * h * 4), prev = new Uint8Array(stride), cur = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const x = raw[y * (stride + 1) + 1 + i], a = i >= bpp ? cur[i - bpp] : 0, up = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c);
      cur[i] = (x + [0, a, up, (a + up) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? up : c][f]) & 255;
    }
    for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) px[(y * w + x) * 4 + k] = k < bpp ? cur[x * bpp + k] : 255;
    prev.set(cur);
  }
  return { w, h, px };
}

// --- Cleaning -----------------------------------------------------------------------------
const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
const darken = ([r, g, b], t) => [r * (1 - t), g * (1 - t), b * (1 - t)].map(Math.round);
function clean({ w, h, px }) {
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? null : px[(y * w + x) * 4 + 3] >= 128 ? [...px.subarray((y * w + x) * 4, (y * w + x) * 4 + 3)] : null;
  let grid = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => at(x, y)));
  const near = (g, x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => g[y + dy]?.[x + dx] ?? null);
  // near-black pixels take a darker tone of their brightest non-black neighbour
  grid = grid.map((row, y) => row.map((c, x) => {
    if (!c || lum(c) > 40) return c;
    const others = near(grid, x, y).filter((n) => n && lum(n) > 40).sort((a, b) => lum(b) - lum(a));
    return others.length ? darken(others[0], 0.42) : c;
  }));
  // lone pixels go
  grid = grid.map((row, y) => row.map((c, x) => (c && near(grid, x, y).every((n) => !n)) ? null : c));
  return grid;
}

// --- One palette per animal (k-means, as Migo's) --------------------------------------------
function palette(frames, K) {
  const all = frames.flatMap((g) => g.flat().filter(Boolean));
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  // spread the starting colours out: each next one the colour furthest from those chosen
  const unique = [...new Map(all.map((c) => [c.join(), c])).values()];
  let centres = [unique.reduce((a, b) => lum(a) < lum(b) ? a : b)];
  while (centres.length < K) centres.push(unique.reduce((best, c) =>
    Math.min(...centres.map((k) => d2(c, k))) > Math.min(...centres.map((k) => d2(best, k))) ? c : best));
  const nearest = (c) => centres.reduce((best, k, i) => d2(c, k) < d2(c, centres[best]) ? i : best, 0);
  for (let round = 0; round < 12; round++) {
    const sum = centres.map(() => [0, 0, 0, 0]);
    for (const c of all) { const s = sum[nearest(c)]; s[0] += c[0]; s[1] += c[1]; s[2] += c[2]; s[3]++; }
    centres = centres.map((k, i) => sum[i][3] ? [0, 1, 2].map((j) => Math.round(sum[i][j] / sum[i][3])) : k);
  }
  return { centres, nearest };
}

// --- Frames -------------------------------------------------------------------------------
// pad: [W, H] sets a frame on the canvas PixelLab animated it on (pixellab/run.mjs pads the same
// way: centred, paws on the bottom row), so a pose and the animations made from it line up.
function pad(img, W, H) {
  const px = new Uint8Array(W * H * 4), ox = Math.floor((W - img.w) / 2), oy = H - img.h;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++)
    for (let k = 0; k < 4; k++) px[((y + oy) * W + x + ox) * 4 + k] = img.px[(y * img.w + x) * 4 + k];
  return { w: W, h: H, px };
}
const source = (name, size) => { const img = readPng(`${here}source/${name}.png`); return clean(size ? pad(img, ...size) : img); };
const files = readdirSync(`${here}source`);
const series = (prefix) => files.filter((f) => f.startsWith(prefix)).sort().map((f) => source(f.replace('.png', '')));
// The blink is drawn here, not generated (PixelLab kept giving the eyes a new colour): the eye,
// two dark pixels, becomes fur and the lid a short darker line just under it.
function closeEyes(g) {
  const out = g.map((row) => row.map((c) => c && [...c]));
  const fur = out[14][19], lid = darken(fur, 0.4);   // the eye: (20, 14) and (21, 14) on the 40x40 canvas
  out[14][20] = fur; out[14][21] = fur; out[15][20] = lid; out[15][21] = lid;
  return out;
}
const sit = source('cat-sit', [40, 40]), shut = closeEyes(sit);
const breathe = series('cat-breathe-'), rise = series('cat-rise-');
const CAT = {
  walk: series('cat-walk-'), sit: [sit], sleep: [source('cat-sleep', [48, 32])],
  // the dash away from a running student: a fast stride, looped
  gallop: series('cat-gallop-'),
  // while sitting, now and then (one-shots, back to sit): a tail flick, a blink, grooming, a yawn
  tail: series('cat-tail-'), blink: [sit, shut, shut, sit], groom: series('cat-groom-'), yawn: series('cat-yawn-'),
  // petted: eyes closed, head lifting into the hand (frames 2-5 loop)
  petted: series('cat-petted-'),
  // asleep, the side rising and falling
  breathe: [...breathe, breathe[2], breathe[1]],
  // waking: down into the stretch, held, and back up to standing
  stretch: [...[...rise].reverse(), rise[0], rise[0], ...rise],
};
// poses that follow each other in place share one box, so the cat does not shift between them
const TOGETHER = [['sit', 'tail', 'blink', 'groom', 'yawn', 'petted'], ['sleep', 'breathe']];
const MAYA = { ground: [source('maya-stand'), ...series('maya-peck-').slice(1, 2)], hop: series('maya-hop-'), fly: series('maya-fly-') };

// Trims every frame of each pose to the pose's shared box (feet stay on the bottom row); the
// poses in one `together` group share theirs.
function boxes(poses, together = []) {
  const out = {};
  for (const pose of Object.keys(poses)) {
    const group = together.find((g) => g.includes(pose)) ?? [pose];
    let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    for (const g of group.flatMap((p) => poses[p])) g.forEach((row, y) => row.forEach((c, x) => { if (c) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }));
    out[pose] = poses[pose].map((g) => g.slice(y0, y1 + 1).map((row) => row.slice(x0, x1 + 1)));
  }
  return out;
}

// pxl keys are one character (not . _ # or space); the cats' 16 colours and four coats need more than letters and digits
const KEYS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!%&*+-=?@^~:;<>/|,()[]';
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
function grids(poses, pal) {
  return Object.fromEntries(Object.entries(poses).map(([pose, frames]) => [pose,
    frames.map((g) => g.map((row) => row.map((c) => c ? KEYS[pal.nearest(c)] : '.').join('')))]));
}
const block = (rows) => '`\n' + rows.map((r) => '    ' + r).join('\n') + '`';

// --- The cats: the orange tabby, and four coats as swaps ------------------------------------
const catPoses = boxes(CAT, TOGETHER);
const catPal = palette(Object.values(catPoses).flat(), 16);
const catGrids = grids(catPoses, catPal);
// Each colour is fur (orange), pale (the white chest, paws, muzzle) or a feature (eyes, nose,
// ear pink). Fur takes the coat's ramp by lightness; pale the coat's pale ramp.
const hsv = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const hue = d === 0 ? 0 : mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (hue * 60 + 360) % 360, s: mx ? d / mx : 0, v: mx / 255 }; };
const kind = (c) => { const { h, s, v } = hsv(c); return s < 0.4 && v > 0.62 ? 'pale' : (h >= 8 && h <= 48) || v < 0.35 ? 'fur' : 'feature'; };
const ramp = (stops, t) => { const i = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1))), f = t * (stops.length - 1) - i;
  return stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f)); };
const rgb = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const COATS = {
  tuxedo: { fur: ['#141317', '#2c2a31', '#4a4752'], pale: ['#a9a49b', '#e4dfd4', '#f6f2ea'] },
  grey: { fur: ['#3e3a37', '#7a7570', '#b3ada4'], pale: ['#a9a49b', '#e4dfd4', '#f6f2ea'] },
  black: { fur: ['#101013', '#26252b', '#3d3b43'], pale: ['#2c2b31', '#45434b'] },
  white: { fur: ['#9d978d', '#d9d2c5', '#f3eee5'], pale: ['#b3ada2', '#e9e4d9', '#faf7f1'] },
};
const furLums = catPal.centres.filter((c) => kind(c) === 'fur').map(lum), paleLums = catPal.centres.filter((c) => kind(c) === 'pale').map(lum);
const span = (list, v) => list.length < 2 ? 0.5 : (v - Math.min(...list)) / (Math.max(...list) - Math.min(...list) || 1);
let next = catPal.centres.length;
const extra = {}, swaps = {};
for (const [coat, { fur, pale }] of Object.entries(COATS)) {
  swaps[coat] = {};
  catPal.centres.forEach((c, i) => {
    const k = kind(c);
    const stops = k === 'fur' ? fur : k === 'pale' ? pale : null;
    if (!stops) return;
    const to = ramp(stops.map(rgb), span(k === 'fur' ? furLums : paleLums, lum(c)));
    const key = KEYS[next++];
    extra[key] = hex(to);
    swaps[coat][KEYS[i]] = key;
  });
}
const catPalette = Object.fromEntries([...catPal.centres.map((c, i) => [KEYS[i], hex(c)]), ...Object.entries(extra)]);
const FPS = { walk: 8, sit: 1, sleep: 1, tail: 8, blink: 8, groom: 6, yawn: 6, petted: 4, breathe: 3, stretch: 6, gallop: 12 };
let cats = `// The campus cats in pxl (generated by convert.mjs from source/*.png, the PixelLab frames;
// edit the art here or in convert.mjs, then run build.ps1). Side-on, facing right, feet on the
// bottom row, one shared ${catPal.centres.length}-colour palette. The orange tabby is the drawing; the other coats
// (tuxedo, grey tabby, black, white) are palette swaps of it.
pal(${JSON.stringify(catPalette)})
const COATS = { orange: {}, ${Object.entries(swaps).map(([c, s]) => `${c}: ${JSON.stringify(s)}`).join(', ')} }
const POSES = {
`;
for (const [pose, frames] of Object.entries(catGrids)) cats += `  ${pose}: [${frames.map(block).join(', ')}],\n`;
cats += `}
const FPS = ${JSON.stringify(FPS)}
for (const [coat, swap] of Object.entries(COATS))
  for (const [pose, frames] of Object.entries(POSES))
    anim(\`cat_\${pose}_\${coat}\`, { fps: FPS[pose], swap }, ...frames.map((g) => frame(g)))
`;
writeFileSync(`${here}cats.px.js`, cats);

// --- The maya --------------------------------------------------------------------------------
const mayaPoses = boxes(MAYA, [['ground', 'hop']]);
const mayaPal = palette(Object.values(mayaPoses).flat(), 12);
const mayaGrids = grids(mayaPoses, mayaPal);
let maya = `// The maya (Eurasian tree sparrow) in pxl (generated by convert.mjs from source/*.png, the
// PixelLab frames; run build.ps1). Side-on, facing right, feet on the bottom row, one shared
// ${mayaPal.centres.length}-colour palette. ground: standing, pecking; hop: crouch, legs tucked, landing; fly: four wingbeats.
pal(${JSON.stringify(Object.fromEntries(mayaPal.centres.map((c, i) => [KEYS[i], hex(c)])))})
`;
for (const [pose, frames] of Object.entries(mayaGrids))
  maya += `anim("maya_${pose}", { fps: ${{ fly: 14, hop: 15 }[pose] ?? 4} },\n  ${frames.map((g) => `frame(${block(g)})`).join(',\n  ')})\n`;
writeFileSync(`${here}maya.px.js`, maya);
console.log('cats', Object.fromEntries(Object.entries(catGrids).map(([p, f]) => [p, `${f.length} x ${f[0][0].length}x${f[0].length}`])),
  'maya', Object.fromEntries(Object.entries(mayaGrids).map(([p, f]) => [p, `${f.length} x ${f[0][0].length}x${f[0].length}`])));

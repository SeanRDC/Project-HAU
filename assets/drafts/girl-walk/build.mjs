// Turns the approved ChatGPT frames into one clean pixel-art walk sheet.
// node build.mjs <frames dir> <out dir>
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const [framesDir, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

// art pixel size in each picture: 7.75 in the 1024 x 1536 ones; frames 5 and 7 came out at other
// scales, so their cells are sized to match their partner poses (5 with 1, both contact; 7 with 3, both passing)
const BASE = 7.75;
const FRAMES = [
  ['idle', BASE], ['frame1', BASE], ['frame2', BASE], ['frame3', BASE], ['frame4', BASE],
  ['frame5', (BASE * 1326) / 1380], ['frame6', BASE], ['frame7', (BASE * 1606) / 1364], ['frame8', BASE],
];

const read = (f) => PNG.sync.read(fs.readFileSync(f));
const write = (f, img) => fs.writeFileSync(f, PNG.sync.write(img));
const blank = (w, h) => new PNG({ width: w, height: h });

// 1. the real pixel grid: the offset that puts the most colour change on the cell borders
function gridOffset(im, S) {
  const { width: W, height: H, data: d } = im;
  const score = (o, horiz) => {
    let on = 0, n = 0;
    const len = horiz ? W : H, other = horiz ? H : W;
    for (let k = o; k < len - 1; k += S) {
      const a = Math.floor(k);
      if (a < 1) continue;
      for (let t = 0; t < other; t += 3) {
        const i = horiz ? (t * W + a) * 4 : (a * W + t) * 4;
        const j = horiz ? (t * W + a - 1) * 4 : ((a - 1) * W + t) * 4;
        if (d[i + 3] < 200 || d[j + 3] < 200) continue;
        on += Math.abs(d[i] - d[j]) + Math.abs(d[i + 1] - d[j + 1]) + Math.abs(d[i + 2] - d[j + 2]);
      }
      n++;
    }
    return on / n;
  };
  let bx = 0, by = 0, sx = -1, sy = -1;
  for (let o = 0; o < S; o += 0.25) {
    const a = score(o, true), b = score(o, false);
    if (a > sx) { sx = a; bx = o; }
    if (b > sy) { sy = b; by = o; }
  }
  return [bx, by];
}

// one art pixel per cell: the median colour of the solid pixels in the cell. A cell counts as solid when at least
// a third of it is, so the thin outlines along the legs survive. `legs`, if given, makes the rows below the skirt
// taller or shorter than the rest (cell height `Sy` from native row `from` down), to fix a frame drawn with shorter legs.
function rebuild(im, S, ox, oy, legs = null) {
  const { width: W, height: H, data: d } = im;
  const nw = Math.floor((W - ox) / S);
  const rowY = (ty) => (legs && ty > legs.from ? oy + (legs.from + 1) * S + (ty - legs.from - 1) * legs.Sy : oy + ty * S);
  const rowH = (ty) => (legs && ty > legs.from ? legs.Sy : S);
  let nh = 0;
  while (rowY(nh) + rowH(nh) <= H) nh++;
  const out = blank(nw, nh);
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  for (let ty = 0; ty < nh; ty++) for (let tx = 0; tx < nw; tx++) {
    const ch = rowH(ty);
    const x0 = Math.round(ox + tx * S + S * 0.15), x1 = Math.round(ox + (tx + 1) * S - S * 0.15);
    const y0 = Math.round(rowY(ty) + ch * 0.15), y1 = Math.round(rowY(ty) + ch - ch * 0.15);
    const rs = [], gs = [], bs = [];
    let n = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * 4; n++;
      if (d[i + 3] < 150) continue;
      rs.push(d[i]); gs.push(d[i + 1]); bs.push(d[i + 2]);
    }
    if (rs.length < n * 0.35) continue;
    const o = (ty * nw + tx) * 4;
    out.data[o] = med(rs); out.data[o + 1] = med(gs); out.data[o + 2] = med(bs); out.data[o + 3] = 255;
  }
  return out;
}

// 5. the red and yellow fringe left by the background removal: bright, saturated warm pixels on the edge
function isFringe(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const sat = max ? (max - min) / max : 0;
  return sat > 0.55 && r > 170 && b < 110 && (g < 90 || g > 150);
}
function defringe(im) {
  const { width: W, height: H, data: d } = im;
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0;
  let fixed = 0;
  for (let pass = 0; pass < 2; pass++) {
    const edits = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (!d[i + 3]) continue;
      const edge = !solid(x - 1, y) || !solid(x + 1, y) || !solid(x, y - 1) || !solid(x, y + 1);
      if (edge && isFringe(d[i], d[i + 1], d[i + 2])) edits.push(i);
    }
    for (const i of edits) d[i + 3] = 0;
    fixed += edits.length;
  }
  return fixed;
}

// 4. one shared palette: colours across all frames that are nearly the same become one
const dist = (a, b) => {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
};
function sharedPalette(images) {
  const counts = new Map();
  for (const im of images) for (let i = 0; i < im.data.length; i += 4) {
    if (!im.data[i + 3]) continue;
    const k = (im.data[i] << 16) | (im.data[i + 1] << 8) | im.data[i + 2];
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const pal = [];
  for (const [k] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    const c = [k >> 16, (k >> 8) & 255, k & 255];
    if (!pal.some((p) => dist(p, c) < 90)) pal.push(c);
  }
  return pal;
}
function mapTo(im, pal) {
  const d = im.data;
  const cache = new Map();
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    let best = cache.get(k);
    if (!best) {
      let bd = Infinity;
      for (const p of pal) { const v = dist(p, [d[i], d[i + 1], d[i + 2]]); if (v < bd) { bd = v; best = p; } }
      cache.set(k, best);
    }
    d[i] = best[0]; d[i + 1] = best[1]; d[i + 2] = best[2];
  }
}

// 3. where to pin each frame: the ground under the lowest foot, and the front of the face
function anchors(im) {
  const { width: W, height: H, data: d } = im;
  let top = -1, bottom = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) { if (top < 0) top = y; bottom = y; }
  const xs = [];
  const h = bottom - top;
  for (let y = Math.round(top + h * 0.12); y <= Math.round(top + h * 0.2); y++) {
    for (let x = W - 1; x >= 0; x--) if (d[(y * W + x) * 4 + 3]) { xs.push(x); break; }
  }
  xs.sort((a, b) => a - b);
  return { top, bottom, face: xs[xs.length >> 1] };
}

function blit(dst, src, dx, dy) {
  for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) {
    const i = (y * src.width + x) * 4;
    if (!src.data[i + 3]) continue;
    const X = x + dx, Y = y + dy;
    if (X < 0 || Y < 0 || X >= dst.width || Y >= dst.height) continue;
    const o = (Y * dst.width + X) * 4;
    dst.data[o] = src.data[i]; dst.data[o + 1] = src.data[i + 1]; dst.data[o + 2] = src.data[i + 2]; dst.data[o + 3] = 255;
  }
}


// ---------------------------------------------------------------------------------------------
// Second pass: every frame at the scale that matches frame 1, one shared head, and the walk's
// root motion measured from the planted foot.

const rebuildAt = (im, S) => {
  const [ox, oy] = gridOffset(im, S);
  const n = rebuild(im, S, ox, oy);
  defringe(n);
  return n;
};

// the head and shoulders as a set of solid pixels, measured from the face column and the top of the head
function upperMask(im, rows = 70) {
  const a = anchors(im);
  const set = new Set();
  for (let y = 0; y < rows; y++) for (let x = -70; x < 40; x++) {
    const X = a.face + x, Y = a.top + y;
    if (X < 0 || Y < 0 || X >= im.width || Y >= im.height) continue;
    if (im.data[(Y * im.width + X) * 4 + 3]) set.add(y * 200 + x);
  }
  return set;
}
const iou = (a, b) => {
  let both = 0;
  for (const k of a) if (b.has(k)) both++;
  return both / (a.size + b.size - both);
};

const sources = Object.fromEntries(FRAMES.map(([name]) => [name, read(path.join(framesDir, `${name}.png`))]));

// 2. the scale of each frame, in two parts. ChatGPT drew some frames with a bigger head and body but
// shorter legs, so one scale can't fit: the head and shoulders are matched to frame 1's first, then the
// legs below the skirt are stretched or squeezed to frame 1's leg length.
const ref = rebuildAt(sources.frame1, BASE);
const refMask = upperMask(ref);
const isSkirt = (d, i) => d[i + 3] && Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) < 22 && d[i] > 55 && d[i] < 215;
// the last row of the skirt: the lowest row with a run of plaid grey across it
function hemRow(im) {
  const a = anchors(im);
  for (let y = a.bottom - 20; y > a.top; y--) {
    let n = 0;
    for (let x = 0; x < im.width; x++) if (isSkirt(im.data, (y * im.width + x) * 4)) n++;
    if (n >= 10) return y;
  }
  return a.bottom - 60;
}
// the top of the collar: the first row below the face with a run of white shirt across it
const isShirt = (d, i) => d[i + 3] && d[i] > 225 && d[i + 1] > 220 && d[i + 2] > 220;
function collarRow(im) {
  const a = anchors(im);
  for (let y = a.top + 25; y < a.bottom; y++) {
    let n = 0;
    for (let x = 0; x < im.width; x++) if (isShirt(im.data, (y * im.width + x) * 4)) n++;
    if (n >= 5) return y;
  }
  return a.top + 40;
}
const refLegs = anchors(ref).bottom - hemRow(ref);
const refTorso = hemRow(ref) - collarRow(ref);
const built = [];
for (const [name, guess] of FRAMES) {
  // the body's scale: the art pixel size that makes the torso, collar to hem, as long as frame 1's
  let best = { S: BASE, score: 0 };
  if (name !== 'frame1') {
    let bestErr = 1e9;
    for (let k = 0.8; k <= 1.25; k += 0.01) {
      const S = guess * k;
      const im = rebuildAt(sources[name], S);
      const err = Math.abs(hemRow(im) - collarRow(im) - refTorso) + Math.abs(k - 1) * 0.5;
      if (err < bestErr) { bestErr = err; best = { S, score: iou(upperMask(im), refMask) }; }
    }
  }
  const plain = rebuildAt(sources[name], best.S);
  const hem = hemRow(plain);
  const legs = anchors(plain).bottom - hem;
  const [ox, oy] = gridOffset(sources[name], best.S);
  const Sy = (best.S * legs) / refLegs;
  const im = name === 'frame1' ? plain : rebuild(sources[name], best.S, ox, oy, { from: hem, Sy });
  defringe(im);
  built.push({ name, im, S: best.S });
  console.log(`${name}: art pixel ${best.S.toFixed(2)}, torso ${hemRow(plain) - collarRow(plain)} -> ${refTorso} rows, legs ${legs} -> ${refLegs} rows (cell height ${Sy.toFixed(2)})`);
}

// 4. one palette across every frame
const pal = sharedPalette(built.map((b) => b.im));
console.log(`shared palette: ${pal.length} colours`);
for (const b of built) { mapTo(b.im, pal); b.a = anchors(b.im); }

// 3. one head for all: frame 1's head, from the top of the hair down to just under the chin, pasted into every
// frame where it fits that frame's own head best (searched a few pixels each way), so it sits on the neck
const HEAD_ROWS = 38;
const head = built.find((b) => b.name === 'frame1');
const headPx = [];
for (let y = head.a.top; y < head.a.top + HEAD_ROWS; y++) for (let x = 0; x < head.im.width; x++) {
  const i = (y * head.im.width + x) * 4;
  if (head.im.data[i + 3]) headPx.push([x, y, i]);
}
for (const b of built) {
  if (b === head) continue;
  const W = b.im.width, Hh = b.im.height;
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < Hh && b.im.data[(y * W + x) * 4 + 3] > 0;
  // the head sits on the collar: its chin the same height above the collar as in frame 1, and slid
  // sideways to wherever it covers this frame's own head best
  const dy = collarRow(b.im) - collarRow(head.im);
  const baseDx = b.a.face - head.a.face;
  let best = { dx: baseDx, dy, score: -1e9 };
  for (let dx = baseDx - 6; dx <= baseDx + 6; dx++) {
    let score = 0;
    for (const [x, y] of headPx) score += solid(x + dx, y + dy) ? 1 : -1;
    if (score > best.score) best = { dx, dy, score };
  }
  // this frame's own head goes entirely: everything above where the new chin will be
  const chin = head.a.top + HEAD_ROWS + dy;
  for (let y = 0; y < Math.min(chin, Hh); y++) for (let x = 0; x < W; x++) b.im.data[(y * W + x) * 4 + 3] = 0;
  for (const [x, y, i] of headPx) {
    const X = x + best.dx, Y = y + best.dy;
    if (X < 0 || Y < 0 || X >= W || Y >= Hh) continue;
    b.im.data.set(head.im.data.subarray(i, i + 4), (Y * W + X) * 4);
  }
  b.a = anchors(b.im);
}
console.log(`head: frame 1's top ${HEAD_ROWS} rows in every frame, each placed where it fits best`);

// the sheet: feet on one line, faces on one column
const FACE_X = 80, GROUND = 196, CW = 140, CH = 200;
const placed = built.map((b) => {
  const one = blank(CW, CH);
  blit(one, b.im, FACE_X - b.a.face, GROUND - b.a.bottom);
  return { name: b.name, img: one };
});

// 1. root motion: follow the foot carrying her weight through each step, by the tip of its toe (the part that
// stays planted from heel strike to push-off), and move her by however far it slides back between frames
const walk = placed.filter((p) => p.name !== 'idle');
const isShoe = (d, i) => d[i + 3] && d[i] < 120 && d[i + 1] < 75 && d[i + 2] < 75 && d[i] >= d[i + 1];
function shoes(img) {
  const seen = new Set(), out = [];
  for (let y = GROUND - 32; y <= GROUND; y++) for (let x = 0; x < CW; x++) {
    const k = y * CW + x;
    if (seen.has(k) || !isShoe(img.data, k * 4)) continue;
    const q = [k];
    seen.add(k);
    const blob = { minX: x, maxX: x, bottom: y, n: 0 };
    while (q.length) {
      const p = q.pop(), px = p % CW, py = (p - px) / CW;
      blob.n++;
      blob.minX = Math.min(blob.minX, px);
      blob.maxX = Math.max(blob.maxX, px);
      blob.bottom = Math.max(blob.bottom, py);
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const nx = px + ax, ny = py + ay, nk = ny * CW + nx;
        if (nx < 0 || nx >= CW || ny < GROUND - 32 || ny > GROUND || seen.has(nk) || !isShoe(img.data, nk * 4)) continue;
        seen.add(nk);
        q.push(nk);
      }
    }
    if (blob.n > 25) out.push(blob);
  }
  return out.sort((a, b) => a.minX - b.minX);
}
const feet = walk.map((p) => shoes(p.img));
walk.forEach((p, i) => console.log(`${p.name} shoes: ${feet[i].map((s) => `${s.minX}-${s.maxX} down to ${s.bottom}`).join(', ')}`));
// the shoe carrying her weight, k frames into a step: the front one as the foot lands (k 0 and 1),
// whichever is on the ground while the other passes and reaches (k 2 and 3), the back one as the next foot lands (k 4)
const stance = (f, k) => (k < 2 ? f[f.length - 1] : k < 4 ? f.reduce((a, b) => (b.bottom > a.bottom ? b : a)) : f[0]);
const advance = [];
for (const start of [0, 4]) for (let k = 0; k < 4; k++) {
  const a = stance(feet[(start + k) % 8], k), b = stance(feet[(start + k + 1) % 8], k + 1);
  advance.push(a.maxX - b.maxX);
}
const sum = (a) => a.reduce((s, v) => s + v, 0);
console.log(`planted foot moves back, frame to frame: ${advance.join(' ')} (steps of ${sum(advance.slice(0, 4))} and ${sum(advance.slice(4))})`);
// how long to hold each frame, relative to the others: longer where she covers more ground, so her body keeps an
// even pace, but never so short a frame flickers or so long one sticks
const hold = advance.map((a, i) => {
  const step = advance.slice(i < 4 ? 0 : 4, i < 4 ? 4 : 8);
  return Math.round(Math.min(1.6, Math.max(0.6, a / (sum(step) / 4))) * 100) / 100;
});
console.log(`hold: ${hold.join(' ')}`);

const sheet = blank(CW * placed.length, CH);
placed.forEach((p, i) => {
  blit(sheet, p.img, i * CW, 0);
  write(path.join(outDir, `${p.name}.png`), p.img);
});
write(path.join(outDir, 'girl_walk_sheet.png'), sheet);
fs.writeFileSync(path.join(outDir, 'girl_walk.json'), JSON.stringify({
  cell: [CW, CH], feet: GROUND, face: FACE_X,
  order: placed.map((p) => p.name),
  // pixels to move her forward when going from each walk frame to the next, so her planted foot stays put
  advance,
  // how long each walk frame shows, as a multiple of the normal frame time
  hold,
}, null, 2));
console.log(`sheet: ${placed.length} cells of ${CW} x ${CH}, idle then frames 1 to 8, with girl_walk.json`);

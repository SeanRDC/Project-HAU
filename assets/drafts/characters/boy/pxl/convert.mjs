// The player boy's game sprites through pxl (adapted from npcs/pxl/migo/convert.mjs).
// Reads his sheets (source/*.png, dumped to JSON by build.ps1), puts every frame on one
// shared colour palette (k-means), keeps his chin the same in every frame (PixelLab drew
// the walk's a little differently each time), moves the hair a little in the walk, and
// writes boy.px.js: one pxl anim per sheet at the game's frame size.
// usage: node convert.mjs <dump-dir> <K>
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const [dumps, kArg] = process.argv.slice(2);
const K = Number(kArg || 20);
const SHEETS = { idle: { frames: 24, fps: 4 }, walk: { frames: 12, fps: 10 } };
const load = (kind) => {
  const { w, h, frames, px } = JSON.parse(readFileSync(`${dumps}/src-${kind}.json`, 'utf8'));
  const fw = w / frames;
  return Array.from({ length: frames }, (_, i) => ({ w: fw, h, at: (x, y) => px[y * w + i * fw + x] }));
};
const sheets = Object.fromEntries(Object.keys(SHEETS).map((k) => [k, load(k)]));
const { w: FW, h: FH } = sheets.idle[0];
const rgb = (v) => [(v >> 16) & 255, (v >> 8) & 255, v & 255];
const all = [];
for (const k in sheets) for (const f of sheets[k]) for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const v = f.at(x, y); if (v >= 0) all.push(rgb(v)); }
const sorted = [...all].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
let centres = Array.from({ length: K }, (_, i) => sorted[Math.floor((i + 0.5) * sorted.length / K)].slice());
const dist = (a, b) => 2 * (a[0] - b[0]) ** 2 + 4 * (a[1] - b[1]) ** 2 + 3 * (a[2] - b[2]) ** 2;
const nearest = (c) => { let best = 0, bd = Infinity; centres.forEach((m, i) => { const d = dist(c, m); if (d < bd) { bd = d; best = i; } }); return best; };
for (let it = 0; it < 30; it++) {
  const sum = centres.map(() => [0, 0, 0, 0]);
  for (const c of all) { const i = nearest(c); sum[i][0] += c[0]; sum[i][1] += c[1]; sum[i][2] += c[2]; sum[i][3]++; }
  centres = centres.map((m, i) => (sum[i][3] ? [sum[i][0] / sum[i][3], sum[i][1] / sum[i][3], sum[i][2] / sum[i][3]] : m));
}
centres = centres.map((m) => m.map(Math.round));
const keys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const hex = (m) => '#' + m.map((v) => v.toString(16).padStart(2, '0')).join('');
const keyed = (f) => Array.from({ length: FH }, (_, y) => Array.from({ length: FW }, (_, x) => { const v = f.at(x, y); return v < 0 ? '.' : keys[nearest(rgb(v))]; }));
const grid = (rows) => '`\n' + rows.map((r) => '    ' + r.join('')).join('\n') + '`';
const frames = Object.fromEntries(Object.entries(sheets).map(([k, fs]) => [k, fs.map(keyed)]));
// Where the figure starts in the frame: the coordinates below are from the top-left of
// the box round the standing pose and every walk frame.
let bx = FW, by = FH;
for (const rows of [frames.idle[0], ...frames.walk]) for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (rows[y][x] !== '.') { bx = Math.min(bx, x); by = Math.min(by, y); }
const stand = frames.idle[0].map((r) => r.slice());
const colour = (k) => centres[keys.indexOf(k)];
const skinKey = (k) => { if (k === '.') return false; const [r, g, b] = colour(k); return r > 150 && g > 85 && g < 175 && b < 130 && r - b > 60; };
const darkKey = (k) => { if (k === '.') return false; const [r, g, b] = colour(k); return r + g + b < 260; };
const shirtKey = (k) => { if (k === '.') return false; const [r, g, b] = colour(k); return r + g + b > 520; };
const keyFor = (hexColour) => keys[nearest([1, 3, 5].map((i) => parseInt(hexColour.slice(i, i + 2), 16)))];
const SKIN = keyFor('#cb7e54'), SHADOW = keyFor('#a95c47');
// His drawing has near-black pixels under the mouth that read as a smudge. In the standing
// pose, below the mouth, the first dark pixel under the skin in each column (and the one
// under it, if dark too) become skin, the lowest skin shadow for the jaw's underside; a
// dark pixel sitting on the shirt is the collar's shadow and stays.
// his face: chin rows 26-29 under the mouth (row 25), head matched over rows 0-24
const CHIN = { x: [12, 30], y: [26, 29] }, HEAD = { x: [4, 36], y: [0, 24] };
for (let x = CHIN.x[0] + bx; x <= CHIN.x[1] + bx; x++)
  for (let y = CHIN.y[0] + by; y <= CHIN.y[1] + by + 1; y++) {
    if (!darkKey(stand[y][x]) || !skinKey(stand[y - 1][x])) continue;
    if (shirtKey(stand[y + 1][x])) break;
    if (darkKey(stand[y + 1][x])) { stand[y][x] = SKIN; stand[y + 1][x] = SHADOW; } else stand[y][x] = SHADOW;
    break;
  }
// The chin the same in every frame: find where the head sits (it bobs with the step and
// the breath) by matching it to the standing pose, then copy the clean chin there. Only
// the rows below the mouth.
const keepChin = (rows) => {
  let best = [0, 0], bestScore = Infinity;
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    let miss = 0;
    for (let y = HEAD.y[0] + by; y <= HEAD.y[1] + by; y++) for (let x = HEAD.x[0] + bx; x <= HEAD.x[1] + bx; x++)
      if ((rows[y + dy]?.[x + dx] ?? '.') !== stand[y][x]) miss++;
    if (miss < bestScore) { bestScore = miss; best = [dx, dy]; }
  }
  const [dx, dy] = best;
  for (let y = CHIN.y[0] + by; y <= CHIN.y[1] + by; y++) for (let x = CHIN.x[0] + bx; x <= CHIN.x[1] + bx; x++) {
    const ty = y + dy, tx = x + dx;
    if (!rows[ty] || tx < 0 || tx >= FW) continue;
    const want = stand[y][x], have = rows[ty][tx];
    if (want !== '.' && (skinKey(want) || skinKey(have))) rows[ty][tx] = want;
    else if (want === '.' && skinKey(have)) rows[ty][tx] = '.';
  }
  return best;
};
const walkShift = frames.walk.map(keepChin);
frames.idle.forEach(keepChin);
// Hair in the walk: the crown (above the fringe) lands a frame after the body, and the
// spiky tips trail back a pixel on each push-off.
const CROWN = 12, TIPS = 5, TRAIL = [2, 3, 8, 9];
frames.walk.forEach((rows, i) => {
  const dy = walkShift[i][1], before = walkShift[(i + 11) % 12][1];
  const bottom = CROWN + by + dy, lag = Math.max(-1, Math.min(1, before - dy));
  const old = rows.map((r) => r.slice());
  if (lag < 0) for (let y = 0; y < bottom; y++) rows[y] = old[y + 1].slice();
  if (lag > 0) { for (let y = bottom; y > 0; y--) rows[y] = old[y - 1].slice(); rows[0] = rows[0].map(() => '.'); }
  if (TRAIL.includes(i)) for (let y = 0; y <= TIPS + by + dy; y++) rows[y] = [...rows[y].slice(1), '.'];
});
// Single missing pixels the moves above can leave (transparent with the body on 3 or 4
// sides) get the commonest colour round them, the same rule as the NPC rig and check.ps1.
for (const kind in frames) for (const rows of frames[kind])
  for (let pass = 0; pass < 4; pass++) {
    const fills = [];
    for (let y = 1; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++) {
      if (rows[y][x] !== '.') continue;
      const sides = [rows[y][x - 1], rows[y][x + 1], rows[y - 1][x], rows[y + 1][x]].filter((k) => k !== '.').length;
      if (sides < 3) continue;
      const count = {};
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const k = rows[y + dy][x + dx]; if (k !== '.') count[k] = (count[k] || 0) + 1; }
      fills.push([x, y, Object.entries(count).sort((a, b) => b[1] - a[1])[0][0]]);
    }
    if (!fills.length) break;
    for (const [x, y, k] of fills) rows[y][x] = k;
  }
// Lone specks on the legs (a backpack-red pixel between the knees in one walk frame): a
// pixel whose colour none of its 8 neighbours share takes their commonest colour. Only
// below the shirt (row 45 down), so the eyes' highlights stay. Two passes, for a
// two-pixel speck.
for (const kind in frames) for (const rows of frames[kind]) for (let pass = 0; pass < 2; pass++) {
  const fixes = [];
  for (let y = 45 + by; y < FH - 1; y++) for (let x = 1; x < FW - 1; x++) {
    const k = rows[y][x]; if (k === '.') continue;
    const count = {}; let same = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const n = rows[y + dy][x + dx];
      if (n === k) same = true; if (n !== '.') count[n] = (count[n] || 0) + 1;
    }
    const best = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
    if (!same && best && best[1] >= 4) fixes.push([x, y, best[0]]);
  }
  for (const [x, y, k] of fixes) rows[y][x] = k;
}
const pal = centres.map((m, i) => `${keys[i]}: "${hex(m)}"`).join(', ');
let out = `// The player boy, the game's sprites in pxl (generated by convert.mjs from source/*.png; edit the
// art here or in convert.mjs, then run build.ps1). ${FW} x ${FH} frames, feet on the bottom row,
// one shared ${K}-colour palette. Idle is his reference drawing (the boy rig), walk a
// PixelLab redraw; the chin is the same in every frame and the walk's hair moves.
pal({ ${pal} })
`;
for (const [kind, { fps }] of Object.entries(SHEETS))
  out += `anim("boy_${kind}", { w: ${FW}, h: ${FH}, fps: ${fps} },\n${frames[kind].map((r) => '  frame(' + grid(r) + ')').join(',\n')})\n`;
writeFileSync(`${here}/boy.px.js`, out);
console.log(`${FW}x${FH}`, K, 'colours; figure at', bx, by, '; walk head offsets', JSON.stringify(walkShift.map((s) => s[1])));

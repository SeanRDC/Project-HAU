// Trees, lamps, benches and the other bits of campus furniture. All of these
// draw into a layer canvas once at load time.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, line, poly, px, rect, sign } from '../../engine/pix';
import { P, shade } from './palette';

export interface Tones {
  deep: string;
  dark: string;
  mid: string;
  lit: string;
  hi: string;
}

export const GREEN: Tones = { deep: P.leafDeep, dark: P.leafDark, mid: P.leaf, lit: P.leafLit, hi: P.leafHi };
/** flat dark tones for out-of-focus foreground plants */
export const SILHOUETTE: Tones = { deep: '#141a24', dark: '#18202a', mid: '#1c2630', lit: '#223038', hi: '#28383e' };

/** A clump of leaves: overlapping blobs, lit from the upper left. */
export function foliage(c: Ctx, cx: number, cy: number, rx: number, ry: number, seed: number, t: Tones = GREEN, leafy = false): void {
  const rand = rng(seed);
  const blobs: [number, number, number][] = [];
  const n = Math.max(5, Math.round((rx * ry) / 26));
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand());
    blobs.push([cx + Math.cos(a) * d * rx * 0.8, cy + Math.sin(a) * d * ry * 0.75, 3 + rand() * Math.min(rx, ry) * 0.42]);
  }
  for (const [x, y, r] of blobs) disc(c, x + 1, y + 2, r + 1, t.deep);
  for (const [x, y, r] of blobs) disc(c, x, y, r, t.dark);
  for (const [x, y, r] of blobs) disc(c, x - 1, y - 1.5, r * 0.78, t.mid);
  for (const [x, y, r] of blobs) if (y < cy + ry * 0.2) disc(c, x - 2, y - 3, r * 0.5, t.lit);
  for (let i = 0; i < n * 3; i++) {
    const [x, y, r] = blobs[Math.floor(rand() * blobs.length)];
    px(c, x - r * 0.5 + (rand() - 0.6) * r, y - r * 0.6 + (rand() - 0.6) * r, rand() > 0.5 ? t.hi : t.lit);
  }
  for (let i = 0; i < n * 2; i++) {
    const [x, y, r] = blobs[Math.floor(rand() * blobs.length)];
    px(c, x + rand() * r, y + rand() * r, t.deep);
  }
  if (!leafy) return;
  // break up the round edges: little tufts of leaves sticking out all round each clump,
  // and small clusters of leaves picked out in the lit tones across its face
  for (const [x, y, r] of blobs) {
    const tufts = Math.round(r * 1.6);
    for (let k = 0; k < tufts; k++) {
      const a = rand() * Math.PI * 2;
      const tx = x + Math.cos(a) * (r + 0.5);
      const ty = y + Math.sin(a) * (r + 0.5);
      const col = Math.sin(a) < -0.3 ? t.mid : Math.cos(a) < -0.3 ? t.dark : t.deep;
      px(c, tx, ty, col);
      if (rand() > 0.5) px(c, tx + Math.sign(Math.cos(a)), ty + Math.sign(Math.sin(a)), col);
    }
  }
  for (let i = 0; i < n * 2; i++) {
    const [x, y, r] = blobs[Math.floor(rand() * blobs.length)];
    const lx = x - r * 0.3 + (rand() - 0.5) * r;
    const ly = y - r * 0.4 + (rand() - 0.5) * r;
    px(c, lx, ly, t.lit);
    px(c, lx + 1, ly + 1, t.dark);
  }
}

/** the far side of a canopy, in the shade of the near side */
const BACK_LEAVES: Tones = { deep: shade(P.leafDeep, -0.3), dark: shade(P.leafDeep, -0.14), mid: P.leafDeep, lit: P.leafDark, hi: P.leaf };

/**
 * A tree with depth, for close to the camera: a dark canopy behind, branches
 * showing through the gaps, clumps reaching out to either side at different
 * heights, the lit front clumps over them, and a thick trunk with a light
 * side, a shaded side, bark marks and a flared foot in the canopy's shadow.
 */
export function layeredTree(c: Ctx, x: number, base: number, h: number, spread: number, seed: number): void {
  const rand = rng(seed);
  const lean = Math.round((rand() - 0.5) * 6);
  const crown = base - h * 0.72;
  const top = base - h * 0.55;
  // the back of the canopy, higher and wider, in shade
  foliage(c, x + lean + spread * 0.18, crown - h * 0.08, spread * 1.05, h * 0.28, seed + 11, BACK_LEAVES, true);
  foliage(c, x + lean - spread * 0.7, crown + h * 0.06, spread * 0.5, h * 0.17, seed + 12, BACK_LEAVES, true);
  foliage(c, x + lean + spread * 0.85, crown + h * 0.04, spread * 0.48, h * 0.16, seed + 13, BACK_LEAVES, true);
  // the trunk, thick, lit on the left, with its main limbs forking into the crown
  const girth = h > 100 ? 8 : 6;
  line(c, x, base, x + lean, top, P.trunkDark, girth);
  line(c, x - 1, base, x + lean - 1, top, P.trunk, girth - 3);
  line(c, x - 2, base - 2, x + lean - 2, top + 2, P.trunkHi, 1);
  for (let y = base - 6; y > top + 4; y -= 5 + Math.floor(rand() * 4)) rect(c, x + Math.round(lean * (base - y) / (base - top)) + 1, y, 2, 1, P.trunkDark);
  rect(c, x - girth, base - 2, girth * 2, 2, P.trunkDark);
  rect(c, x - girth - 1, base - 1, 2, 1, P.trunkDark);
  rect(c, x + girth - 1, base - 1, 2, 1, P.trunkDark);
  const limbs: [number, number][] = [[-0.55, -0.24], [0.5, -0.2], [-0.15, -0.34], [0.3, -0.3]];
  for (const [dx, dy] of limbs) line(c, x + lean, top + 2, x + lean + spread * dx, top + h * dy, P.trunkDark, 2);
  // the clumps out to the sides, at different heights
  foliage(c, x + lean - spread * 0.62, crown + h * 0.12, spread * 0.5, h * 0.15, seed + 2, GREEN, true);
  foliage(c, x + lean + spread * 0.66, crown + h * 0.16, spread * 0.46, h * 0.14, seed + 3, GREEN, true);
  // the front of the crown, broken into clumps so the branches show between them
  foliage(c, x + lean - spread * 0.2, crown, spread * 0.62, h * 0.19, seed + 1, GREEN, true);
  foliage(c, x + lean + spread * 0.32, crown - h * 0.05, spread * 0.55, h * 0.18, seed + 4, GREEN, true);
  foliage(c, x + lean + spread * 0.05, crown - h * 0.16, spread * 0.45, h * 0.14, seed + 5, GREEN, true);
  // a few twigs and the shadow the crown throws on the top of the trunk
  for (const [dx, dy] of [[-0.35, 0.02], [0.42, 0.06]]) line(c, x + lean + spread * dx, crown + h * dy + 4, x + lean + spread * dx * 1.4, crown + h * dy, P.trunkDark, 1);
  rect(c, x + lean - girth / 2, top, girth, 3, shade(P.trunkDark, -0.2));
}

/** the rows of trees behind the buildings: muted, a little blue with distance, so they sit back */
const FAR_LEAVES: Tones = { deep: '#2c4639', dark: '#34513f', mid: '#3d5d48', lit: '#4a6b53', hi: '#587a5f' };

/**
 * A row of trees behind the buildings, so they blend into one canopy rather
 * than standing about like cut-outs: their crowns overlap, the trees get
 * shorter towards both ends of the row, slim trunks show between the crowns
 * and the undergrowth, and low shrubs run along their foot. `base` is the
 * ground they stand on.
 */
export function treeline(c: Ctx, x0: number, x1: number, base: number, seed: number): void {
  const rand = rng(seed);
  const span = x1 - x0;
  const trees: [number, number, number][] = [];
  for (let x = x0; x < x1; x += 14 + rand() * 10) {
    const edge = Math.min(x - x0, x1 - x) / Math.min(90, span / 2);
    const h = (44 + rand() * 30) * (0.55 + 0.45 * Math.min(1, edge));
    trees.push([x, h, 16 + rand() * 10]);
  }
  for (const [x, h] of trees) {
    rect(c, x - 1, base - h * 0.6, 2, h * 0.6, '#3a332c');
    rect(c, x, base - h * 0.6, 1, h * 0.6, '#4a4036');
  }
  // the crowns, back ones first so the canopy reads as one mass
  for (const [x, h, r] of trees) foliage(c, x, base - h * 0.72, r, h * 0.28, seed + Math.round(x), FAR_LEAVES, true);
  // the undergrowth along their foot
  for (let x = x0 - 6; x < x1 + 6; x += 9 + rand() * 6) foliage(c, x, base - 5, 9 + rand() * 5, 6, seed + 7 + Math.round(x), FAR_LEAVES);
}

export function tree(c: Ctx, x: number, base: number, h: number, spread: number, seed: number, t: Tones = GREEN): void {
  const rand = rng(seed);
  const lean = (rand() - 0.5) * 8;
  const top = base - h * 0.6;
  const dark = t === GREEN ? P.trunkDark : t.deep;
  const mid = t === GREEN ? P.trunk : t.dark;
  const hi = t === GREEN ? P.trunkHi : t.dark;
  const girth = h > 100 ? 7 : 5;
  line(c, x, base, x + lean, top, dark, girth);
  line(c, x - 1, base, x + lean - 1, top, mid, girth - 2);
  line(c, x - 2, base - 2, x + lean - 2, top, hi, 1);
  rect(c, x - girth + 1, base - 2, girth * 2 - 2, 2, dark);
  // a couple of branches disappearing into the leaves
  line(c, x + lean, top, x + lean - spread * 0.4, top - h * 0.22, dark, 2);
  line(c, x + lean, top + 4, x + lean + spread * 0.45, top - h * 0.18, dark, 2);
  foliage(c, x + lean, base - h * 0.78, spread, h * 0.3, seed + 1, t);
  foliage(c, x + lean - spread * 0.5, base - h * 0.66, spread * 0.55, h * 0.18, seed + 2, t);
  foliage(c, x + lean + spread * 0.55, base - h * 0.7, spread * 0.5, h * 0.17, seed + 3, t);
}

export function palm(c: Ctx, x: number, base: number, h: number, seed: number, t: Tones = GREEN): void {
  const rand = rng(seed);
  const lean = (rand() - 0.5) * 14;
  const trunkDark = t === GREEN ? '#6a5a48' : t.deep;
  const trunkHi = t === GREEN ? '#94826a' : t.dark;
  let px0 = x;
  let py0 = base;
  const steps = Math.max(4, Math.floor(h / 6));
  for (let i = 1; i <= steps; i++) {
    const k = i / steps;
    const nx = x + lean * k * k;
    const ny = base - h * k;
    line(c, px0, py0, nx, ny, trunkDark, i < steps / 2 ? 4 : 3);
    line(c, px0 - 1, py0, nx - 1, ny, trunkHi, 1);
    rect(c, nx - 2, ny, 4, 1, shade(trunkDark, -0.25));
    px0 = nx;
    py0 = ny;
  }
  const cx = x + lean;
  const cy = base - h;
  const fronds = 8 + Math.floor(rand() * 3);
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI * 0.08 - (i / (fronds - 1)) * Math.PI * 0.84 + (rand() - 0.5) * 0.2;
    const len = h * 0.36 + rand() * h * 0.14 + 10;
    const front = i % 2 === 0;
    let fx = cx;
    let fy = cy;
    for (let s = 1; s <= 10; s++) {
      const k = s / 10;
      const nx = cx + Math.cos(a) * len * k;
      const ny = cy + Math.sin(a) * len * k * (1 - k * 0.35) + k * k * len * 0.55;
      line(c, fx, fy, nx, ny, front ? t.dark : t.deep, 1);
      // leaflets hang off the rib
      const leaf = Math.round((1 - Math.abs(k - 0.45)) * 5);
      line(c, nx, ny, nx - Math.cos(a) * 2, ny + leaf, front ? t.mid : t.dark, 1);
      if (front && s % 2 === 0) px(c, nx, ny - 1, t.lit);
      fx = nx;
      fy = ny;
    }
  }
  disc(c, cx, cy + 1, 3, t.deep);
}

export function bush(c: Ctx, x: number, base: number, w: number, h: number, seed: number, t: Tones = GREEN): void {
  foliage(c, x, base - h * 0.55, w * 0.5, h * 0.5, seed, t);
}

/** Trimmed hedge, the kind lining most of the campus paths. */
export function hedge(c: Ctx, x: number, base: number, w: number, h: number, seed: number): void {
  const rand = rng(seed);
  rect(c, x, base - h, w, h, P.leafDark);
  rect(c, x, base - h, w, 2, P.leafLit);
  rect(c, x, base - h + 2, w, 2, P.leaf);
  rect(c, x, base - 2, w, 2, P.leafDeep);
  for (let i = 0; i < w * h * 0.12; i++) {
    px(c, x + rand() * w, base - h + rand() * h, rand() > 0.55 ? P.leaf : P.leafDeep);
  }
  for (let i = 0; i < w * 0.3; i++) px(c, x + rand() * w, base - h - 1, P.leafLit);
}

/** Black iron lamp post with a lantern head. Returns where its light sits. */
export function lampPost(c: Ctx, x: number, base: number, h = 62): { x: number; y: number } {
  rect(c, x - 3, base - 3, 7, 3, P.iron);
  rect(c, x - 2, base - 7, 5, 4, P.iron);
  rect(c, x - 1, base - h + 8, 3, h - 14, P.iron);
  rect(c, x - 1, base - h + 8, 1, h - 14, P.ironHi);
  rect(c, x - 2, base - h * 0.55, 5, 2, P.iron);
  // lantern
  rect(c, x - 3, base - h + 6, 7, 2, P.iron);
  rect(c, x - 3, base - h - 3, 7, 9, '#efe6c8');
  rect(c, x - 3, base - h - 3, 1, 9, P.iron);
  rect(c, x + 3, base - h - 3, 1, 9, P.iron);
  rect(c, x, base - h - 3, 1, 9, P.ironHi);
  rect(c, x - 4, base - h - 5, 9, 2, P.iron);
  rect(c, x - 2, base - h - 7, 5, 2, P.iron);
  rect(c, x, base - h - 9, 1, 2, P.iron);
  return { x, y: base - h + 1 };
}

export function stoneBench(c: Ctx, x: number, base: number, w = 30): void {
  rect(c, x, base - 9, w, 3, P.stoneHi);
  rect(c, x, base - 6, w, 1, P.stoneDark);
  rect(c, x + 3, base - 6, 5, 6, P.stone);
  rect(c, x + w - 8, base - 6, 5, 6, P.stone);
  rect(c, x + 3, base - 6, 1, 6, P.stoneDark);
  rect(c, x + w - 8, base - 6, 1, 6, P.stoneDark);
}

/** Potted plant in a terracotta pot. */
export function pot(c: Ctx, x: number, base: number, seed: number): void {
  const rand = rng(seed);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.33 + (rand() - 0.5) * 0.2;
    const len = 9 + rand() * 6;
    line(c, x, base - 8, x + Math.cos(a) * len, base - 8 + Math.sin(a) * len, i % 2 ? P.leaf : P.leafLit, 1);
  }
  rect(c, x - 4, base - 8, 9, 2, P.terracottaHi);
  rect(c, x - 3, base - 6, 7, 6, P.terracotta);
  rect(c, x - 3, base - 6, 2, 6, P.terracottaDark);
}

/** Classical urn on the stair cheek walls. */
export function urn(c: Ctx, x: number, base: number): void {
  rect(c, x - 2, base - 2, 5, 2, P.trimShade);
  rect(c, x - 1, base - 4, 3, 2, P.trimDeep);
  rect(c, x - 3, base - 9, 7, 5, P.trim);
  rect(c, x + 2, base - 9, 2, 5, P.trimShade);
  rect(c, x - 4, base - 11, 9, 2, P.trim);
  foliage(c, x, base - 15, 5, 4, x * 7 + 3);
}

/** The bronze guardian angel by the main driveway, on its marble pedestal. */
export function angelStatue(c: Ctx, x: number, base: number): void {
  // pedestal
  rect(c, x - 22, base - 6, 44, 6, '#4a2d27');
  rect(c, x - 19, base - 44, 38, 38, '#6a3f33');
  rect(c, x - 19, base - 44, 5, 38, '#84503f');
  rect(c, x + 12, base - 44, 7, 38, '#52312a');
  rect(c, x - 22, base - 48, 44, 4, '#7a4a3b');
  rect(c, x - 22, base - 49, 44, 1, '#99624d');
  rect(c, x - 9, base - 36, 18, 14, '#2c2428');
  rect(c, x - 7, base - 33, 14, 1, P.gold);
  rect(c, x - 7, base - 30, 14, 1, '#8a7a50');
  rect(c, x - 7, base - 27, 10, 1, '#8a7a50');

  const top = base - 49;
  // wings behind the figure
  poly(c, [[x - 2, top - 36], [x - 20, top - 46], [x - 24, top - 22], [x - 14, top - 8], [x - 4, top - 14]], P.bronzeDark);
  poly(c, [[x + 4, top - 36], [x + 20, top - 44], [x + 23, top - 20], [x + 13, top - 8], [x + 6, top - 14]], P.bronzeDark);
  for (let i = 0; i < 5; i++) {
    line(c, x - 18 + i * 3, top - 40 + i * 2, x - 20 + i * 3, top - 16 + i, P.bronze, 1);
    line(c, x + 18 - i * 3, top - 38 + i * 2, x + 20 - i * 3, top - 14 + i, P.bronze, 1);
  }
  // robe
  poly(c, [[x - 5, top - 34], [x + 5, top - 34], [x + 9, top], [x - 9, top]], P.bronze);
  poly(c, [[x - 5, top - 34], [x - 2, top - 34], [x - 5, top], [x - 9, top]], P.bronzeHi);
  line(c, x + 2, top - 26, x + 4, top - 1, P.bronzeDark, 1);
  line(c, x - 1, top - 20, x - 2, top - 1, P.bronzeDark, 1);
  // head and raised arm pointing to heaven
  disc(c, x, top - 39, 4, P.bronze);
  disc(c, x - 1, top - 40, 2, P.bronzeHi);
  line(c, x + 4, top - 32, x + 9, top - 44, P.bronze, 2);
  line(c, x + 9, top - 44, x + 10, top - 52, P.bronzeHi, 1);
  // the child at the angel's side
  rect(c, x - 13, top - 16, 6, 16, P.bronze);
  rect(c, x - 13, top - 16, 2, 16, P.bronzeHi);
  disc(c, x - 10, top - 19, 3, P.bronze);
  line(c, x - 5, top - 28, x - 9, top - 14, P.bronze, 2);
}

export function tricycle(c: Ctx, x: number, base: number, body = '#2f5f9e'): void {
  const dark = shade(body, -0.35);
  // sidecar
  rect(c, x + 8, base - 26, 26, 3, dark);
  rect(c, x + 8, base - 27, 26, 1, shade(body, 0.3));
  rect(c, x + 9, base - 23, 1, 12, P.iron);
  rect(c, x + 32, base - 23, 1, 12, P.iron);
  rect(c, x + 10, base - 13, 24, 9, body);
  rect(c, x + 10, base - 13, 24, 2, shade(body, 0.25));
  rect(c, x + 10, base - 7, 24, 3, dark);
  rect(c, x + 14, base - 22, 14, 9, '#22242e');
  rect(c, x + 15, base - 21, 5, 4, '#3a4660');
  rect(c, x + 12, base - 10, 8, 1, P.gold);
  disc(c, x + 26, base - 4, 4, P.iron);
  disc(c, x + 26, base - 4, 1, P.stoneHi);
  // motorcycle
  disc(c, x - 8, base - 4, 4, P.iron);
  disc(c, x - 8, base - 4, 1, P.stoneHi);
  disc(c, x + 7, base - 4, 4, P.iron);
  disc(c, x + 7, base - 4, 1, P.stoneHi);
  rect(c, x - 6, base - 12, 13, 5, '#2a2a32');
  rect(c, x - 4, base - 14, 9, 2, '#17171c');
  line(c, x - 8, base - 5, x - 6, base - 17, P.ironHi, 1);
  rect(c, x - 9, base - 18, 5, 1, P.iron);
  rect(c, x - 10, base - 15, 2, 2, '#ffe9a8');
}

/** Guard house and the yellow-black boom barrier at the gate. */
export function guardHouse(c: Ctx, x: number, base: number): void {
  rect(c, x, base - 46, 40, 46, P.wall);
  rect(c, x, base - 46, 5, 46, P.wallLit);
  rect(c, x + 32, base - 46, 8, 46, P.wallShade);
  rect(c, x, base - 8, 40, 8, P.trimShade);
  rect(c, x + 8, base - 36, 20, 16, P.glass);
  rect(c, x + 8, base - 36, 20, 1, P.trim);
  rect(c, x + 8, base - 21, 20, 2, P.trim);
  rect(c, x + 17, base - 36, 1, 16, P.trim);
  line(c, x + 10, base - 24, x + 15, base - 34, P.glassHi, 1);
  // tiled hip roof
  poly(c, [[x - 6, base - 46], [x + 46, base - 46], [x + 34, base - 60], [x + 6, base - 60]], '#b4553c');
  poly(c, [[x - 6, base - 46], [x + 10, base - 46], [x + 12, base - 60], [x + 6, base - 60]], '#cc6f4f');
  for (let i = 0; i < 4; i++) rect(c, x - 4 + i * 2, base - 49 - i * 3, 48 - i * 5, 1, '#8f4030');
  rect(c, x - 6, base - 46, 52, 2, '#7a362a');
  sign(c, 'GATE 1', x + 9, base - 16, P.maroon);
}

export function boomBarrier(c: Ctx, x: number, base: number, length: number, angle: number): void {
  rect(c, x - 3, base - 22, 7, 22, '#d8c23a');
  rect(c, x - 3, base - 22, 2, 22, '#f0dc5a');
  rect(c, x - 3, base - 14, 7, 4, P.iron);
  rect(c, x - 3, base - 6, 7, 3, P.iron);
  const segs = Math.floor(length / 7);
  for (let i = 0; i < segs; i++) {
    const a0 = i * 7;
    const a1 = a0 + 7;
    line(
      c,
      x + Math.cos(angle) * a0, base - 20 - Math.sin(angle) * a0,
      x + Math.cos(angle) * a1, base - 20 - Math.sin(angle) * a1,
      i % 2 ? P.iron : '#f0cf3a', 3,
    );
  }
}

/** Small standing sign: a board on two legs. */
export function signBoard(c: Ctx, x: number, base: number, lines: string[], bg = P.trim, fg = P.maroon): void {
  const w = Math.max(...lines.map((l) => l.length)) * 4 + 5;
  const h = lines.length * 7 + 4;
  rect(c, x - w / 2 + 2, base - 10, 1, 10, P.iron);
  rect(c, x + w / 2 - 3, base - 10, 1, 10, P.iron);
  rect(c, x - w / 2, base - 10 - h, w, h, bg);
  rect(c, x - w / 2, base - 10 - h, w, 1, shade(bg, 0.5));
  rect(c, x - w / 2, base - 11, w, 1, shade(bg, -0.3));
  lines.forEach((l, i) => sign(c, l, x - w / 2 + 3, base - 10 - h + 3 + i * 7, fg));
}

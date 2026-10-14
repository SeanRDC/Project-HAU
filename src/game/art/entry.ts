// The side gate entryway, drawn from the six photos in
// `assets/images/sidegate entryway/`, mostly from `closer view.jpg`: the round flag
// plaza at the end of the walk in from the side gate, looking back down the
// walkway to the gatehouse.
//
// The plaza: a ring of pale cobbles round grey concrete, an eight-point star
// of ground cover with eight dark pebble-wash triangles between its points,
// each outlined in cobbles, and in the middle a round raised pad with a
// tapered six-sided granite pedestal. The flagpole stands on the pedestal and
// flies the Philippine flag. Eight yellow and black posts with a rusty chain
// slung between them keep people off the pedestal; an EVACUATION SITE 5
// sign stands by the pole.
//
// The walkway: big diamond tiles of light concrete with pebble-wash joints
// and a small white square where the joints cross, between lawns with stone
// benches, low black path lights and tall palms tied round with white rope.
// At the far end is the back of the side gate: two square white columns, a
// beam that reads LAUS DEO SEMPER 1933 and a low pyramid of glass on top,
// with a covered walk along the fence on either side of it.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, line, poly, px, rect, signCentered } from '../../engine/pix';
import { P, shade } from './palette';
import { GREEN, Tones } from './props';

/** how much the camera flattens a circle on the ground: a little less than at the SFJ fountain, as you stand right at its edge */
export const FLAT = 0.22;
/** the plaza out to its ring of cobbles */
export const STAR_R = 100;
/** the ring of chained posts round the pedestal */
export const RING_R = 44;
const POSTS = 8;

const COBBLE = '#d8d0c0';
const COBBLE_ALT = '#c7bfae';
const MORTAR = '#9d968a';
const FIELD = '#aaa69e';
const PEBBLE = '#5e5a5c';
const PEBBLE_HI = '#78736f';
const PAD_DARK = '#514d51';
const PAD_LIGHT = '#bcb7ae';

const GRANITE = '#a7a29a';
const GRANITE_LIT = '#c3beb4';
const GRANITE_DARK = '#86817b';

const POST_YELLOW = '#e8c55a';
const POST_HI = '#f6df8c';
const POST_BLACK = '#1e1e23';
const CHAIN = '#8a5a2c';
const CHAIN_HI = '#b37b3f';

const WHITE = '#f2f1ec';
const WHITE_HI = '#ffffff';
const WHITE_LO = '#cfcfcc';
const WHITE_DEEP = '#a8a8ab';

/**
 * Where a ray at angle `a` from a star's tip crosses the star's outline:
 * a star of `points` straight-edged points reaching out to `tip`, with the
 * valleys between them at `valley`. All as fractions of the plaza's radius.
 */
function starEdge(a: number, tip: number, valley: number, points: number): number {
  const half = Math.PI / points;
  let f = ((a % (2 * half)) + 2 * half) % (2 * half);
  if (f > half) f = 2 * half - f;
  const ex = valley * Math.cos(half) - tip;
  const ey = valley * Math.sin(half);
  return (tip * ey) / (Math.cos(f) * ey - Math.sin(f) * ex);
}

type Ground = 'cobble' | 'field' | 'pebble' | 'grass' | 'padDark' | 'padLight';

/** What the plaza is at a point, with its radius as 1 and v towards the camera. Null outside it. */
function paving(u: number, v: number): Ground | null {
  const r = Math.hypot(u, v);
  if (r > 1) return null;
  if (r > 0.92) return 'cobble';
  if (r < 0.24) return r > 0.17 ? 'padDark' : 'padLight';
  // one of the green points aims straight at the camera, as in the photo
  const a = Math.atan2(v, u) - Math.PI / 2;
  const green = starEdge(a, 0.7, 0.29, 8);
  const dark = starEdge(a + Math.PI / 8, 0.88, 0.32, 8);
  const band = 0.04;
  if (r < green - band) return 'grass';
  if (r < green) return 'cobble';
  if (r < dark - band) return 'pebble';
  if (r < dark) return 'cobble';
  return 'field';
}

/**
 * The flag plaza on the ground, flattened by the low camera, centred on
 * (x, cy). Draw `ringParts` over it.
 */
export function starPlaza(c: Ctx, x: number, cy: number): void {
  const rand = rng(1933);
  const ry = Math.round(STAR_R * FLAT);
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -STAR_R; dx <= STAR_R; dx++) {
      // a ground pixel covers far more depth than width: look at three depths so the cobble lines don't break up
      const at = (sub: number) => paving(dx / STAR_R, (dy + sub) / (STAR_R * FLAT));
      let kind = at(0);
      if (!kind) continue;
      if (kind !== 'cobble' && (at(-0.4) === 'cobble' || at(0.4) === 'cobble')) kind = 'cobble';
      const gx = x + dx;
      const gy = cy + dy;
      let col: string;
      switch (kind) {
        case 'cobble':
          col = (gx * 2 + gy * 3) % 7 === 0 ? MORTAR : ((gx >> 1) + gy) % 2 ? COBBLE_ALT : COBBLE;
          break;
        case 'grass': {
          // the ground cover is a brighter green than the lawns
          const r = rand();
          col = r > 0.8 ? '#9fd06a' : r > 0.6 ? '#5f9c49' : '#76b452';
          break;
        }
        case 'pebble':
          col = rand() > 0.78 ? PEBBLE_HI : PEBBLE;
          break;
        case 'padDark':
          col = rand() > 0.8 ? shade(PAD_DARK, 0.15) : PAD_DARK;
          break;
        case 'padLight':
          col = rand() > 0.85 ? shade(PAD_LIGHT, -0.08) : PAD_LIGHT;
          break;
        default:
          col = rand() > 0.9 ? shade(FIELD, rand() > 0.5 ? 0.07 : -0.08) : FIELD;
      }
      px(c, gx, gy, col);
    }
  }
  // the pad is a step up from the plaza: show its near edge
  const pr = STAR_R * 0.24;
  for (let dx = -Math.floor(pr); dx <= pr; dx++) {
    const y = cy + Math.sqrt(Math.max(0, 1 - (dx / pr) ** 2)) * pr * FLAT;
    rect(c, x + dx, Math.round(y), 1, 2, dx < -pr * 0.4 ? '#6a666a' : '#3e3b40');
  }
}

/** A tapered six-sided granite pedestal, lit from the left. `base` is the pad it stands on. */
export function flagPedestal(c: Ctx, x: number, base: number): number {
  const h = 26;
  const rand = rng(615);
  for (let y = 0; y < h; y++) {
    const hw = 13 - (4 * y) / h;
    const front = Math.round(hw * 0.52);
    const left = Math.round(x - hw);
    const right = Math.round(x + hw);
    const yy = base - 1 - y;
    rect(c, left, yy, x - front - left, 1, GRANITE_LIT);
    rect(c, x - front, yy, front * 2, 1, GRANITE);
    rect(c, x + front, yy, right - x - front, 1, GRANITE_DARK);
    // the edges between the faces
    px(c, x - front, yy, shade(GRANITE, 0.1));
    px(c, x + front - 1, yy, shade(GRANITE, -0.12));
    for (let i = 0; i < 2; i++) {
      const sx = left + rand() * (right - left);
      px(c, sx, yy, rand() > 0.5 ? shade(GRANITE, -0.25) : shade(GRANITE, 0.25));
    }
  }
  // the top, a thin hexagon seen from just above, and a dark line where it meets the pad
  const top = base - 1 - h;
  rect(c, x - 9, top - 1, 18, 2, '#d3cec5');
  rect(c, x - 7, top - 2, 14, 1, '#dcd8d0');
  rect(c, x - 13, base - 1, 26, 1, '#5c585a');
  return top - 1;
}

/** The pole on top of the pedestal. Returns where the flag hangs from. */
export function flagpole(c: Ctx, x: number, foot: number, top: number): { x: number; y: number } {
  // the collar it is set into
  rect(c, x - 3, foot - 4, 7, 4, '#9ea2a9');
  rect(c, x - 3, foot - 4, 2, 4, '#c9ccd2');
  rect(c, x - 1, top, 3, foot - 4 - top, '#c3c7cd');
  rect(c, x - 1, top, 1, foot - 4 - top, '#eef0f2');
  rect(c, x + 1, top, 1, foot - 4 - top, '#8f939b');
  // the halyard, tied off low down, wound round with yellow rope as in the photo
  line(c, x + 2, top + 4, x + 2, foot - 34, '#e4e1d8', 1);
  rect(c, x + 2, foot - 36, 2, 3, '#7d8189');
  for (let y = foot - 33; y < foot - 18; y += 2) rect(c, x - 1, y, 4, 1, y % 4 ? '#e9c638' : '#c9a62a');
  line(c, x + 3, foot - 18, x + 6, foot - 9, '#e9c638', 1);
  // the gilt ball on top
  disc(c, x + 0.5, top - 2, 2, P.gold);
  px(c, x, top - 3, P.goldHi);
  return { x: x + 2, y: top + 3 };
}

/**
 * The Philippine flag, streaming from the pole at (x, y): blue over red, a
 * white triangle at the hoist with the golden sun and three stars. Every frame.
 */
export function philippineFlag(ctx: Ctx, x: number, y: number, time: number): void {
  const w = 30;
  const h = 15;
  const tri = 13;
  for (let i = 0; i < w; i++) {
    const k = i / w;
    const wave = Math.sin(time * 3.1 - i * 0.36);
    const dy = Math.round(wave * 2 * k + k * 1.5);
    const fold = wave > 0.55 ? 0.12 : wave < -0.55 ? -0.16 : 0;
    for (let j = 0; j < h; j++) {
      const mid = Math.abs(j - (h - 1) / 2) / ((h - 1) / 2);
      let col = j < h / 2 ? '#1d3f96' : '#cc2131';
      if (i < tri * (1 - mid)) col = '#f6f4ee';
      ctx.fillStyle = fold ? shade(col, fold) : col;
      ctx.fillRect(x + i, y + j + dy, 1, 1);
    }
  }
  // the sun and the three stars, which ride the first few columns
  const sun = '#f2c230';
  const at = (i: number, j: number) => {
    const dy = Math.round(Math.sin(time * 3.1 - i * 0.36) * 2 * (i / w) + (i / w) * 1.5);
    px(ctx, x + i, y + j + dy, sun);
  };
  for (const [i, j] of [[4, 6], [5, 6], [4, 7], [5, 7], [4, 8], [5, 8], [3, 7], [6, 7], [4, 5], [5, 9]]) at(i, j);
  at(1, 1);
  at(1, h - 2);
  at(tri - 3, 7);
}

/** One of the yellow and black posts round the pedestal, on its square black foot. */
function chainPost(c: Ctx, x: number, base: number): void {
  rect(c, x - 3, base - 4, 7, 4, POST_BLACK);
  rect(c, x - 3, base - 4, 7, 1, '#3a3a42');
  rect(c, x - 1, base - 19, 3, 15, POST_YELLOW);
  rect(c, x - 1, base - 19, 1, 15, POST_HI);
  for (const y of [base - 9, base - 15]) rect(c, x - 1, y, 3, 2, POST_BLACK);
  rect(c, x - 1, base - 21, 3, 2, POST_BLACK);
  px(c, x + 2, base - 17, '#55555c');
}

/** A rusty chain hung between the tops of two posts. */
function chain(c: Ctx, x0: number, y0: number, x1: number, y1: number): void {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const sag = Math.sin(t * Math.PI) * (2 + n * 0.08);
    px(c, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag, i % 2 ? CHAIN : CHAIN_HI);
  }
}

/** Something in the middle of the plaza, with how far back it stands, so it can be drawn in front of someone walking behind it. */
export interface RingPart {
  depth: number;
  draw(c: Ctx, ox: number): void;
}

/**
 * The pedestal, the pole and the ring of chained posts, as separate pieces in
 * depth order. `cx`, `cy` is the middle of the plaza.
 */
export function ringParts(cx: number, cy: number): RingPart[] {
  const parts: RingPart[] = [];
  const posts = Array.from({ length: POSTS }, (_, i) => {
    const a = Math.PI / 2 + (i * Math.PI * 2) / POSTS;
    return { x: Math.round(cx + Math.cos(a) * RING_R), y: Math.round(cy + Math.sin(a) * RING_R * FLAT) };
  });
  posts.forEach((p, i) => {
    const q = posts[(i + 1) % POSTS];
    parts.push({ depth: (p.y + q.y) / 2 - 0.5, draw: (c, ox) => chain(c, p.x - ox + 1, p.y - 18, q.x - ox + 1, q.y - 18) });
    parts.push({ depth: p.y, draw: (c, ox) => chainPost(c, p.x - ox, p.y) });
  });
  parts.push({
    depth: cy,
    draw: (c, ox) => {
      const top = flagPedestal(c, cx - ox, cy + 1);
      flagpole(c, cx - ox, top, FLAG_TOP);
    },
  });
  return parts.sort((a, b) => a.depth - b.depth);
}

/** how high the top of the flagpole is on the screen */
export const FLAG_TOP = 22;

/** The yellow EVACUATION SITE 5 sign on its post, by the flagpole. */
export function evacuationSign(c: Ctx, x: number, base: number): void {
  rect(c, x, base - 22, 1, 22, '#4a4a52');
  rect(c, x - 7, base - 30, 15, 9, '#f0cf3c');
  rect(c, x - 7, base - 30, 15, 1, '#f8e48a');
  rect(c, x - 7, base - 22, 15, 1, '#b8971e');
  rect(c, x - 5, base - 28, 11, 1, '#3a3428');
  // the big 5
  rect(c, x - 1, base - 26, 3, 1, '#3a3428');
  rect(c, x - 1, base - 25, 1, 1, '#3a3428');
  rect(c, x - 1, base - 24, 3, 1, '#3a3428');
  rect(c, x + 1, base - 23, 1, 1, '#3a3428');
}

// --- the walkway and the far end -----------------------------------------------------

/**
 * The perspective of the walkway: screen rows from the far end of the walk
 * to the near edge of the plaza. `horizon` is where it would all shrink to.
 */
export interface Walkway {
  cx: number;
  far: number;
  near: number;
  /** its half width in pixels at the far and near ends */
  farHalf: number;
  nearHalf: number;
  /** its real half width, metres */
  halfM: number;
  /** metres from the near end to the gate */
  lengthM: number;
}

export function horizonOf(w: Walkway): number {
  // the half width shrinks in step with the distance to the horizon
  return (w.farHalf * w.near - w.nearHalf * w.far) / (w.farHalf - w.nearHalf);
}

/** How big something standing on row `y` is, against someone on row `ref`. */
export function scaleAt(w: Walkway, y: number, ref: number): number {
  const h = horizonOf(w);
  return (y - h) / (ref - h);
}

/** The screen x of a point `m` metres to the side of the walkway's middle, on row `y`. */
export function sideX(w: Walkway, m: number, y: number): number {
  return w.cx + (m / w.halfM) * w.nearHalf * scaleAt(w, y, w.near);
}

/** Metres from the near end of the walkway, on row `y`. */
function depthM(w: Walkway, y: number): number {
  const h = horizonOf(w);
  const k = w.lengthM / (1 / (w.far - h) - 1 / (w.near - h));
  return k / (y - h) - k / (w.near - h);
}

const TILE = '#cdcac2';
const JOINT = '#857f79';
const INSET = '#f1efe9';
const KERB = '#8f8a84';

/**
 * The walkway itself, receding to the gate: diamond tiles of light concrete,
 * pebble-wash joints, a white square where the joints cross, a pebble-wash
 * kerb either side.
 */
export function diamondWalk(c: Ctx, w: Walkway): void {
  const rand = rng(7);
  // the diamonds as laid: about 1.5 m corner to corner
  const P0 = 2;
  for (let y = w.far; y < w.near; y++) {
    const s = scaleAt(w, y, w.near);
    const half = w.nearHalf * s;
    const pxM = w.halfM / half;
    const z0 = depthM(w, y + 1);
    const z1 = depthM(w, y);
    const deep = Math.abs(z1 - z0);
    for (let x = Math.floor(w.cx - half); x <= Math.ceil(w.cx + half); x++) {
      const off = Math.abs(x + 0.5 - w.cx);
      if (off > half) continue;
      if (off > half - Math.max(1, 2.4 * s)) {
        px(c, x, y, rand() > 0.7 ? shade(KERB, 0.15) : KERB);
        continue;
      }
      const sm = (x + 0.5 - w.cx) * pxM;
      // a row covers a strip of ground `deep` metres long: a joint shows if it crosses that strip
      let a = 0;
      let b = 0;
      for (const z of [z0, (z0 + z1) / 2, z1]) {
        const fa = (((sm + z) / P0) % 1 + 1) % 1;
        const fb = (((sm - z) / P0) % 1 + 1) % 1;
        a = Math.max(a, Math.min(fa, 1 - fa) < (pxM * 0.55 + deep * 0.12) / P0 ? 1 : 0);
        b = Math.max(b, Math.min(fb, 1 - fb) < (pxM * 0.55 + deep * 0.12) / P0 ? 1 : 0);
      }
      let col = TILE;
      if (a && b) col = INSET;
      else if (a || b) col = JOINT;
      else if (rand() > 0.9) col = shade(TILE, rand() > 0.5 ? 0.06 : -0.06);
      // further off, the joints fade into the tiles
      if (col === JOINT && s < 0.8) col = shade(JOINT, (0.8 - s) * 1.1);
      px(c, x, y, col);
    }
  }
}

/** A low black path light with a yellow head. Returns where it glows. */
export function pathLight(c: Ctx, x: number, base: number, s: number): { x: number; y: number } {
  const h = Math.max(4, Math.round(11 * s));
  const wd = Math.max(2, Math.round(3 * s));
  rect(c, x - 1, base - h, wd, h, '#1e1e24');
  rect(c, x - 1, base - h, 1, h, '#3b3b44');
  rect(c, x - 1, base - h - 2, wd, 2, '#e9d58c');
  rect(c, x - 1, base - h - 3, wd, 1, '#2a2a30');
  return { x: x - 1 + wd / 2, y: base - h - 1 };
}

/** The row `z` metres up the walkway from its near end. */
export function rowOf(w: Walkway, z: number): number {
  const h = horizonOf(w);
  const k = w.lengthM / (1 / (w.far - h) - 1 / (w.near - h));
  return h + k / (z + k / (w.near - h));
}

/**
 * A concrete slab bench beside the walkway, `m` metres out from its middle,
 * its near end `z` metres up the walk from the plaza. It runs along the walk,
 * so it is seen end-on, its top going back away from the camera.
 */
export function walkBench(c: Ctx, w: Walkway, m: number, z: number, ref: number): void {
  const len = 1.8;
  const y0 = rowOf(w, z);
  const y1 = rowOf(w, z + len);
  const s0 = scaleAt(w, y0, ref);
  const s1 = scaleAt(w, y1, ref);
  const h0 = 9 * s0;
  const h1 = 9 * s1;
  const half = 0.28;
  const n0 = sideX(w, m - half, y0);
  const f0 = sideX(w, m + half, y0);
  const n1 = sideX(w, m - half, y1);
  const f1 = sideX(w, m + half, y1);
  // the legs at either end
  for (const [x, y, s] of [[(n1 + f1) / 2, y1, s1], [(n0 + f0) / 2, y0, s0]] as const) {
    rect(c, x - 2 * s, y - 9 * s, Math.max(2, 4 * s), 9 * s - 1, '#8e8a83');
  }
  // the slab: its top going back, the side that faces the walkway, the near end
  const inner = m < 0 ? [f0, f1] : [n0, n1];
  poly(c, [[n0, y0 - h0], [f0, y0 - h0], [f1, y1 - h1], [n1, y1 - h1]], '#c9c5bd');
  poly(c, [[inner[0], y0 - h0], [inner[1], y1 - h1], [inner[1], y1 - h1 + 2], [inner[0], y0 - h0 + 3]], '#9d9991');
  rect(c, Math.min(n0, f0), y0 - h0, Math.abs(f0 - n0), Math.max(2, 3 * s0), '#b1ada5');
  rect(c, Math.min(n0, f0), y0 - h0, Math.abs(f0 - n0), 1, '#dedbd4');
}

/**
 * One of the tall palms along the walkway: a smooth grey trunk tied round
 * with white rope every so often, a green crownshaft, and a full crown of
 * long fronds that arch up and droop at the tips. `h` is to the crown.
 */
export function tiedPalm(c: Ctx, x: number, base: number, h: number, seed: number): void {
  const rand = rng(seed);
  const lean = (rand() - 0.5) * 10;
  const top = base - h;
  const at = (y: number) => {
    const k = (base - y) / h;
    return x + lean * k * k;
  };
  const w0 = Math.max(3, Math.round(h / 42));
  // the trunk, a little thicker at the foot, lit from the left
  for (let y = base; y > top + 4; y--) {
    const k = (base - y) / h;
    const w = Math.max(2, Math.round(w0 * (1 - k * 0.3)));
    const cx = Math.round(at(y) - w / 2);
    rect(c, cx, y, w, 1, '#8f8a80');
    px(c, cx, y, '#b7b2a6');
    if (w > 2) px(c, cx + w - 1, y, '#6a655e');
    // the faint rings where the old fronds fell off
    if (y % 5 === 0) rect(c, cx + 1, y, w - 1, 1, '#7d786f');
  }
  // the white rope wound round it, from near the foot to two thirds of the way up
  for (let k = 0.08; k < 0.7; k += 0.06 + rand() * 0.03) {
    const y = Math.round(base - h * k);
    const cx = at(y);
    const w = Math.max(2, Math.round(w0 * (1 - k * 0.3)));
    line(c, cx - w / 2 - 0.5, y + 1, cx + w / 2 + 0.5, y - 1, '#f2efe6', 1);
  }
  // the smooth green crownshaft
  const cx = at(top);
  rect(c, Math.round(cx - w0 / 2), top - 2, Math.max(2, w0 - 1), Math.round(h * 0.07) + 4, '#6f8f4a');
  px(c, Math.round(cx - w0 / 2), top, '#93b062');
  palmCrown(c, cx, top - 2, h * 0.3, seed + 1);
}

/** A full crown of palm fronds round (cx, cy), each `len` or so long. */
export function palmCrown(c: Ctx, cx: number, cy: number, len: number, seed: number, t: Tones = GREEN): void {
  const rand = rng(seed);
  const n = 15;
  const fronds: { a: number; l: number; back: boolean }[] = [];
  for (let i = 0; i < n; i++) {
    // fanned all the way round the top, a few hanging down past level
    const a = -Math.PI - 0.35 + ((i + 0.5) / n) * (Math.PI + 0.7) + (rand() - 0.5) * 0.18;
    fronds.push({ a, l: len * (0.8 + rand() * 0.35), back: i % 3 === 1 });
  }
  // the ones behind first, darker
  for (const back of [true, false]) {
    for (const f of fronds) {
      if (f.back !== back) continue;
      const dx = Math.cos(f.a);
      const dy = Math.sin(f.a);
      const steps = Math.round(f.l);
      for (let s = 1; s <= steps; s++) {
        const k = s / steps;
        // up and out, then bending over under its own weight
        const fx = cx + dx * s;
        const fy = cy + dy * s * (1 - k * 0.45) + k * k * f.l * 0.5;
        const leaf = Math.sin(Math.PI * Math.min(1, k * 1.15)) * f.l * 0.16 + 1;
        const side = dx >= 0 ? 1 : -1;
        const mid = back ? t.deep : t.dark;
        const lit = back ? t.dark : t.mid;
        // leaflets hang off both sides of the rib
        line(c, fx, fy, fx + side * leaf * 0.35, fy + leaf, mid, 1);
        line(c, fx, fy, fx - side * leaf * 0.2, fy + leaf * 0.85, lit, 1);
        if (!back && s % 3 === 0) px(c, fx - side, fy, t.lit);
        if (!back && s % 5 === 0 && k < 0.7) px(c, fx, fy - 1, t.hi);
        px(c, fx, fy, back ? t.dark : '#3d6b34');
      }
    }
  }
  disc(c, cx, cy + 1, 3, t.deep);
  px(c, cx - 1, cy - 1, t.dark);
}

/** a stretch of the iron fence along the avenue, small with distance */
function farFence(c: Ctx, x0: number, x1: number, base: number): void {
  for (let x = x0; x < x1; x += 2) rect(c, x, base - 16, 1, 14, P.iron);
  for (const y of [base - 16, base - 11, base - 4]) rect(c, x0, y, x1 - x0, 1, P.iron);
  rect(c, x0, base - 3, x1 - x0, 3, '#d9d2b8');
  for (let x = x0 + 6; x < x1 - 4; x += 46) {
    rect(c, x, base - 21, 6, 21, '#e4ddc4');
    rect(c, x, base - 21, 1, 21, '#f2ecd8');
    rect(c, x + 5, base - 21, 1, 21, '#bdb596');
    rect(c, x - 1, base - 22, 8, 1, '#f2ecd8');
  }
}

/**
 * The covered walk along the fence, either side of the gatehouse: a dark
 * roof on square cream posts, benches in its shade.
 */
export function coveredWalk(c: Ctx, x0: number, x1: number, base: number, seed: number): void {
  const rand = rng(seed);
  farFence(c, x0, x1, base - 2);
  const eave = base - 27;
  // the shade under the roof, darker at the back
  rect(c, x0, eave + 4, x1 - x0, 6, 'rgba(40,34,44,0.35)');
  // people sitting along the benches
  for (let x = x0 + 8; x < x1 - 6; x += 14 + rand() * 22) {
    if (rand() < 0.45) continue;
    const shirt = rand() > 0.4 ? '#eceae4' : rand() > 0.5 ? '#2c3348' : '#6d2b33';
    rect(c, x, base - 10, 3, 4, shirt);
    rect(c, x, base - 12, 3, 2, '#3a2a24');
    rect(c, x, base - 6, 3, 2, '#2a2a34');
  }
  rect(c, x0, base - 6, x1 - x0, 2, '#9a958c');
  // posts
  for (let x = x0 + 10; x < x1 - 3; x += 30) {
    rect(c, x, eave + 3, 3, base - eave - 3, '#e3dcc6');
    rect(c, x, eave + 3, 1, base - eave - 3, '#f4efdf');
    rect(c, x - 1, eave + 3, 5, 1, '#c9c1a6');
  }
  // the roof: a dark band with a pale fascia
  rect(c, x0, eave - 1, x1 - x0, 4, '#5c4c44');
  rect(c, x0, eave - 2, x1 - x0, 1, '#7a665a');
  rect(c, x0, eave + 2, x1 - x0, 1, '#d9d4c8');
}

/**
 * The back of the side gate, at the far end of the walkway: two square white
 * columns, the beam with LAUS DEO SEMPER 1933 on it, a low pyramid of glass
 * on top. Through it the turnstiles, the gate leaves and the avenue beyond.
 * `base` is the row its columns stand on. Returns the strip lights under the beam.
 */
export function lausDeoGate(c: Ctx, cx: number, base: number): { x: number; y: number }[] {
  const W = 88;
  const COL = 12;
  const L = cx - W / 2;
  const R = cx + W / 2;
  const beamBottom = base - 37;
  const beamTop = beamBottom - 11;

  // through the opening: the shade under the roof, the bright avenue at the far end
  rect(c, L + COL, beamBottom, W - COL * 2, base - beamBottom, '#7b7a7d');
  rect(c, L + COL + 7, beamBottom + 7, W - COL * 2 - 14, base - beamBottom - 9, '#e7e3d8');
  // the building across the avenue: white, with rows of dark windows
  for (let y = beamBottom + 9; y < base - 12; y += 6) rect(c, L + COL + 9, y, W - COL * 2 - 18, 3, '#6d7280');
  rect(c, L + COL + 7, base - 11, W - COL * 2 - 14, 9, '#a39f97');
  // the gate leaves folded back, and the two turnstiles with a guard between them
  for (const gx of [L + COL + 2, R - COL - 7]) {
    for (let i = 0; i < 5; i += 2) rect(c, gx + i, beamBottom + 9, 1, base - beamBottom - 10, P.iron);
    rect(c, gx, beamBottom + 9, 5, 1, P.iron);
  }
  for (const tx of [cx - 13, cx + 9]) {
    rect(c, tx, base - 10, 5, 8, '#9ea2aa');
    rect(c, tx, base - 10, 5, 1, '#d9dce2');
    px(c, tx + 2, base - 8, '#4bd07a');
  }
  rect(c, cx - 2, base - 15, 3, 4, '#f1f1f4');
  rect(c, cx - 2, base - 11, 3, 6, '#22283a');
  rect(c, cx - 2, base - 17, 3, 2, '#2a2422');
  // the floor of the covered way
  rect(c, L + COL, base - 3, W - COL * 2, 3, '#c9c4b9');
  // the ceiling, seen from below
  rect(c, L + COL, beamBottom, W - COL * 2, 3, '#5e5d62');
  const lamps = [
    { x: cx - 18, y: beamBottom + 4 },
    { x: cx + 16, y: beamBottom + 4 },
  ];
  for (const l of lamps) rect(c, l.x - 3, l.y - 1, 7, 1, '#fff4d6');

  // the two columns, each on a plinth
  for (const x0 of [L, R - COL]) {
    rect(c, x0, beamBottom, COL, base - beamBottom, WHITE);
    rect(c, x0, beamBottom, 3, base - beamBottom, WHITE_HI);
    rect(c, x0 + COL - 3, beamBottom, 3, base - beamBottom, WHITE_LO);
    rect(c, x0 - 1, base - 4, COL + 2, 4, WHITE_LO);
    rect(c, x0 - 1, base - 5, COL + 2, 1, WHITE_HI);
    // the dark lantern on its inner face
    rect(c, x0 + (x0 === L ? COL - 4 : 1), beamBottom + 12, 3, 6, '#3a3d44');
  }
  // the beam
  rect(c, L - 2, beamTop, W + 4, beamBottom - beamTop, WHITE);
  rect(c, L - 2, beamTop, W + 4, 1, WHITE_HI);
  rect(c, L - 2, beamBottom - 1, W + 4, 1, WHITE_DEEP);
  signCentered(c, 'LAUS DEO SEMPER 1933', cx, beamTop + 3, '#2b2b31');
  // cornice
  rect(c, L - 5, beamTop - 3, W + 10, 3, WHITE);
  rect(c, L - 5, beamTop - 3, W + 10, 1, WHITE_HI);
  rect(c, L - 5, beamTop - 1, W + 10, 1, '#bdb9ac');

  // the glass roof: a low pyramid, its left side catching the sky
  const eave = beamTop - 3;
  const peak = eave - 23;
  poly(c, [[L - 7, eave], [R + 7, eave], [cx + 3, peak], [cx - 3, peak]], '#bcd6da');
  poly(c, [[L - 7, eave], [cx - 8, eave], [cx - 1, peak], [cx - 3, peak]], '#d9eaec');
  poly(c, [[cx + 18, eave], [R + 7, eave], [cx + 3, peak], [cx + 1, peak]], '#9dbcc3');
  // the white lattice of its glazing bars, running diagonally as in the photo
  for (let k = -6; k <= 6; k++) {
    const bx = cx + (k * (W / 2 + 7)) / 6;
    line(c, cx + k * 0.5, peak, bx, eave - 1, '#f2f6f6', 1);
  }
  for (let y = peak + 5; y < eave; y += 5) {
    const t = (y - peak) / (eave - peak);
    const hw = 3 + (W / 2 + 4) * t;
    rect(c, cx - hw, y, hw * 2, 1, '#eef4f4');
  }
  rect(c, cx - 3, peak - 1, 7, 1, WHITE_HI);
  return lamps;
}

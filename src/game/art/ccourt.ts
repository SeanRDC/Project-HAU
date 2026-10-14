// The Covered Court beside the IH Gym, and the Aero Laboratory at its far end,
// drawn from the photos in `assets/images/buildings/covered court beside IH/`.
//
// Outside, its front is the gable end on the gym lane: white corrugated
// sheeting, a big fan of glass panes filling the gable, and under it the open
// hall, its low side roofs sweeping out past the steel columns, a steel mesh
// fence along the front.
//
// Inside: grey steel portal frames under a corrugated roof, a maroon
// basketball court on a tan border with the winged seal at centre court and
// grey circles at the keys, steel bleachers along the gym side, a red
// volleyball court and a red badminton court behind it, and at the far end the
// yellow corrugated gate of the AERO LABORATORY with a plane painted on it.
//
// The Aero Laboratory: a hangar of grey-green corrugated walls with its
// aircraft standing on red bays outlined in white: ANGEL-1, an orange
// high-wing trainer, an older one with a dark red wing, and jet engines hung
// in yellow frames.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect, sign, signCentered } from '../../engine/pix';
import { seal } from './ihgym';
import { shade } from './palette';

const STEEL = '#8d949c';
const STEEL_LIT = '#b7bcc2';
const STEEL_DARK = '#5e646c';
const SHEET = '#e9eae6';
const SHEET_LINE = '#c7c9c6';

/** The front of the covered court, its gable end, centred on `cx`, `w` wide, standing on `base`. */
export function ccFront(c: Ctx, g: Ctx, cx: number, w: number, base: number): void {
  const half = w / 2;
  const eave = base - 58;
  const shoulder = base - 66;
  const ridge = base - 178;
  const inner = half * 0.62;
  // the far end seen through the open hall: the aero gate, the light at the back
  rect(c, cx - half, eave, w, base - eave, '#5c5f63');
  rect(c, cx - inner + 20, eave + 18, (inner - 20) * 2, base - eave - 22, '#7a7d80');
  rect(c, cx - 40, eave + 26, 80, 28, '#d8d48e');
  for (let x = cx - 40; x < cx + 40; x += 4) rect(c, x, eave + 26, 1, 28, '#b9b46c');
  rect(g, cx - inner + 24, eave + 18, 30, 16, '#fff0c0');
  // the courts under the roof: maroon floor, a hoop, people in white PE shirts
  rect(c, cx - half, base - 12, w, 12, '#7b3436');
  rect(c, cx - half, base - 12, w, 1, '#a45453');
  rect(c, cx - 70, base - 40, 2, 28, STEEL_LIT);
  rect(c, cx - 76, base - 46, 12, 8, '#f1f2f0');
  // the columns of the portal frames
  for (const k of [-1, -0.62, -0.22, 0.22, 0.62, 1]) {
    const x = Math.round(cx + k * (half - 4));
    rect(c, x - 3, eave, 6, base - eave, STEEL);
    rect(c, x - 3, eave, 2, base - eave, STEEL_LIT);
  }
  // the low side roofs, sweeping out over the sides of the hall, their trusses showing underneath
  for (const s of [-1, 1]) {
    const outer = cx + s * (half + 14);
    const join = cx + s * inner;
    // the shade under the side roof, its trusses and purlins seen from below
    poly(c, [[outer, eave], [join, shoulder - 26], [join, eave]], '#4c4f54');
    for (let k = 1; k < 8; k++) {
      const t = k / 8;
      const x = outer + (join - outer) * t;
      const y = eave + (shoulder - 26 - eave) * t;
      line(c, x, y, x, eave, '#3a3d42', 1);
      line(c, x, y + 2, x - s * ((join - outer) / 8) * s, eave, '#5e6268', 1);
    }
    // the roof sheeting itself, a band of white corrugations
    poly(c, [[outer - s * 4, eave + 2], [join, shoulder - 34], [join, shoulder - 24], [outer - s * 4, eave + 8]], '#dfe1de');
    line(c, outer - s * 4, eave + 2, join, shoulder - 34, '#f8f9f8', 1);
    line(c, outer - s * 4, eave + 8, join, shoulder - 24, '#a9adb0', 1);
    for (let k = 0; k < 24; k++) {
      const t = k / 24;
      const x = outer - s * 4 + (join - outer + s * 4) * t;
      const y = eave + 2 + (shoulder - 34 - eave - 2) * t;
      px(c, x, y + 3, '#c4c7c5');
    }
  }
  // the gable: white corrugated sheeting from the shoulder up to the ridge
  poly(c, [[cx - inner, shoulder], [cx - inner, shoulder - 24], [cx, ridge], [cx + inner, shoulder - 24], [cx + inner, shoulder]], SHEET);
  for (let x = cx - inner + 2; x < cx + inner; x += 3) {
    const top = ridge + (Math.abs(x - cx) / inner) * (shoulder - 24 - ridge);
    rect(c, x, top, 1, shoulder - top, SHEET_LINE);
  }
  // the fan of glass: a big triangle of grid panes, a few of them darker
  const gl = cx - inner + 18;
  const gr = cx + inner - 18;
  const gb = shoulder - 10;
  const gt = ridge + 34;
  const rand = rng(1919);
  for (let y = gt; y < gb; y++) {
    const t = (y - gt) / (gb - gt);
    const hw = 6 + ((gr - gl) / 2 - 6) * t;
    for (let x = Math.round(cx - hw); x < cx + hw; x++) {
      const row = Math.floor((y - gt) / 9);
      const col = Math.floor((x - gl) / 10);
      px(c, x, y, (row * 7 + col * 3) % 5 === 0 ? '#9fb4c4' : rand() > 0.98 ? '#dfe9ef' : '#7f97ab');
    }
  }
  for (let y = gt + 9; y < gb; y += 9) {
    const t = (y - gt) / (gb - gt);
    const hw = 6 + ((gr - gl) / 2 - 6) * t;
    rect(c, cx - hw, y, hw * 2, 1, '#eef1f2');
  }
  for (let x = gl; x <= gr; x += 10) {
    const top = gt + (Math.abs(x - cx) / ((gr - gl) / 2)) * (gb - gt);
    if (top < gb) rect(c, x, Math.max(gt, top), 1, gb - Math.max(gt, top), '#eef1f2');
  }
  rect(g, gl, gt, gr - gl, gb - gt, 'rgba(255,240,200,0.0)');
  // the trim along the roof edges and the little vent box at the ridge
  line(c, cx - inner - 2, shoulder - 24, cx, ridge - 1, '#f8f9f8', 2);
  line(c, cx, ridge - 1, cx + inner + 2, shoulder - 24, '#f8f9f8', 2);
  rect(c, cx - 8, ridge - 8, 16, 8, '#dfe1df');
  poly(c, [[cx - 10, ridge - 8], [cx + 10, ridge - 8], [cx, ridge - 14]], '#f2f3f1');
  rect(c, cx - inner, shoulder, inner * 2, 4, '#d9dbd8');
  rect(c, cx - inner, shoulder + 4, inner * 2, 1, '#9fa3a6');
  // the steel mesh fence along the front, on a low kerb
  rect(c, cx - half - 14, base - 4, w + 28, 4, '#b9b6ae');
  for (let x = cx - half - 12; x < cx + half + 12; x += 2) rect(c, x, base - 26, 1, 22, 'rgba(180,186,192,0.75)');
  for (const y of [base - 27, base - 15, base - 5]) rect(c, cx - half - 14, y, w + 28, 1, '#d4d8dc');
  for (let x = cx - half - 14; x < cx + half + 14; x += 30) rect(c, x, base - 28, 2, 28, '#c9ced3');
}

// --- inside ------------------------------------------------------------------------------------------------

/**
 * The roof from inside: the corrugated sheeting in perspective, rising to the
 * ridge over the middle of the hall, the grey I-beam rafters of the portal
 * frames every `bay` pixels, and the lattice trusses along the eaves.
 */
export function ccRoof(c: Ctx, x0: number, x1: number, eave: number, bay: number, seed: number): void {
  const rand = rng(seed);
  // the sheeting: light, with the ribs running up towards the ridge
  for (let y = 0; y < eave; y++) {
    const k = y / eave;
    rect(c, x0, y, x1 - x0, 1, k < 0.5 ? '#c9c7c0' : '#d8d6cf');
  }
  for (let x = x0 - 40; x < x1 + 40; x += 6) line(c, x, 0, x + 10, eave, '#aeaba4', 1);
  // translucent sheets let strips of daylight through
  for (let x = x0 + rand() * 60; x < x1; x += 110 + rand() * 60) {
    poly(c, [[x, 0], [x + 14, 0], [x + 24, eave], [x + 10, eave]], '#f2efe2');
  }
  // the purlins across
  for (let y = 6; y < eave; y += 9) rect(c, x0, y, x1 - x0, 2, '#9c9890');
  // the portal frames: a deep grey I-beam coming down from the ridge, its flanges lit
  for (let x = x0 + bay / 2; x < x1 + bay; x += bay) {
    poly(c, [[x - 10, 0], [x + 4, 0], [x + 22, eave], [x + 6, eave]], STEEL);
    line(c, x - 10, 0, x + 6, eave, STEEL_LIT, 1);
    line(c, x + 4, 0, x + 22, eave, STEEL_DARK, 1);
    // hanging lamps on the rafter
    disc(c, x + 2, eave * 0.4, 2, '#f6f4ea');
  }
  // the lattice truss along the far eave
  rect(c, x0, eave, x1 - x0, 3, STEEL_DARK);
  rect(c, x0, eave + 13, x1 - x0, 2, STEEL_DARK);
  for (let x = x0; x < x1; x += 12) {
    line(c, x, eave + 3, x + 6, eave + 13, STEEL, 1);
    line(c, x + 6, eave + 13, x + 12, eave + 3, STEEL, 1);
  }
}

/** A grey steel column of a portal frame, from `top` down to the floor. */
export function ccColumn(c: Ctx, x: number, top: number, base: number, w = 8): void {
  rect(c, x - w / 2, top, w, base - top, STEEL);
  rect(c, x - w / 2, top, 2, base - top, STEEL_LIT);
  rect(c, x + w / 2 - 2, top, 2, base - top, STEEL_DARK);
  rect(c, x - w / 2 - 2, base - 6, w + 4, 6, '#9a9890');
}

/** Steel bleachers seen from the front, low tiers of grey benches stepping up and back. */
export function ccBleachers(c: Ctx, x0: number, x1: number, base: number, tiers: number): void {
  for (let i = tiers - 1; i >= 0; i--) {
    const y = base - (i + 1) * 7;
    rect(c, x0 + i * 2, y, x1 - x0 - i * 4, 7, i % 2 ? '#7f858c' : '#8e949b');
    rect(c, x0 + i * 2, y, x1 - x0 - i * 4, 2, '#c9ced3');
    rect(c, x0 + i * 2, y + 6, x1 - x0 - i * 4, 1, '#5e646c');
  }
  // the scaffold of tubes under them, and the railing along the top
  for (let x = x0 + 4; x < x1; x += 20) rect(c, x, base - tiers * 7, 1, tiers * 7, 'rgba(60,64,72,0.45)');
  rect(c, x0 + tiers * 2, base - tiers * 7 - 12, x1 - x0 - tiers * 4, 2, '#b7bcc2');
  for (let x = x0 + tiers * 2; x < x1 - tiers * 2; x += 24) rect(c, x, base - tiers * 7 - 12, 2, 12, '#9aa0a6');
}

type Mark = 'out' | 'court' | 'border' | 'grey' | 'line';

/**
 * The basketball court, seen from the side across its width: a maroon court
 * on a tan border, grey circles in the keys and at centre court, white lines,
 * the winged seal on the maroon at centre. From `x0` to `x1`, its far
 * sideline on row `far`, its near one below the bottom of the screen.
 */
export function basketballFloor(c: Ctx, x0: number, x1: number, far: number, near: number, seed: number): void {
  const rand = rng(seed);
  const len = x1 - x0;
  const depth = near - far;
  const mark = (u: number, v: number): Mark => {
    const cu = (u - 0.5) * 30;
    const cv = (v - 0.5) * 17;
    if (Math.abs(cu) > 15 || Math.abs(cv) > 8.5) return 'out';
    if (Math.abs(cu) > 14 || Math.abs(cv) > 7.5) return 'border';
    const tol = 0.11;
    if (Math.abs(Math.abs(cu) - 14) < tol || Math.abs(Math.abs(cv) - 7.5) < tol * 2) return 'line';
    if (Math.abs(cu) < tol) return 'line';
    if (Math.abs(Math.hypot(cu, cv) - 1.8) < tol * 1.5) return 'line';
    const toEnd = 14 - Math.abs(cu);
    // the free-throw circle, grey, at the top of each key
    if (Math.abs(Math.hypot(toEnd - 5.8, cv) - 1.8) < tol * 1.5) return 'line';
    if (Math.hypot(toEnd - 5.8, cv) < 1.8) return 'grey';
    if (toEnd < 5.8 && Math.abs(Math.abs(cv) - 2.45) < tol * 2) return 'line';
    const b = Math.hypot(toEnd - 1.575, cv);
    if (Math.abs(b - 6.75) < tol * 1.3 && toEnd > 1.2) return 'line';
    return 'court';
  };
  const tone: Record<Mark, string> = { out: '#9a968c', court: '#7b3436', border: '#a6833e', grey: '#8d969c', line: '#f0efe9' };
  for (let y = far; y < near; y++) {
    for (let x = x0 - 40; x < x1 + 40; x++) {
      const k = mark((x - x0 + 0.5) / len, (y - far + 0.5) / depth);
      if (k === 'out') continue;
      let col = tone[k];
      if (rand() > 0.93) col = shade(col, rand() > 0.5 ? 0.07 : -0.07);
      c.fillStyle = col;
      c.fillRect(x, y, 1, 1);
    }
  }
  // the winged seal, flattened like the floor
  const cx = Math.round(x0 + len / 2);
  const cy = Math.round(far + depth * 0.5);
  c.save();
  c.translate(cx, cy);
  c.scale(1.3, 0.5);
  for (const s of [-1, 1]) {
    poly(c, [[s * 2, 2], [s * 20, -10], [s * 18, -2], [s * 10, 6]], '#ece9e2');
    line(c, s * 6, 0, s * 16, -6, '#c9c4ba', 1);
  }
  seal(c, 0, 0, 8);
  c.restore();
  // worn patches where the paint has gone pale
  for (let i = 0; i < 5; i++) {
    c.globalAlpha = 0.12;
    ellipse(c, x0 + rand() * len, far + rand() * depth, 14, 4, '#c9b9a2');
    c.globalAlpha = 1;
  }
}

/** A red court with an orange edge, for volleyball and badminton. Returns its middle. */
export function redCourt(c: Ctx, x0: number, x1: number, far: number, near: number, seed: number): number {
  const rand = rng(seed);
  for (let y = far; y < near; y++) {
    const t = (y - far) / Math.max(1, near - far);
    // the far edge recedes: a little narrower at the back
    const inset = Math.round((1 - t) * 8);
    rect(c, x0 + inset, y, x1 - x0 - inset * 2, 1, '#a8382f');
    px(c, x0 + inset, y, '#d88a3a');
    px(c, x1 - inset - 1, y, '#d88a3a');
    for (let i = 0; i < (x1 - x0) * 0.04; i++) px(c, x0 + inset + rand() * (x1 - x0 - inset * 2), y, shade('#a8382f', rand() > 0.5 ? 0.08 : -0.08));
  }
  rect(c, x0 + 8, far, x1 - x0 - 16, 1, '#d88a3a');
  rect(c, x0, near - 1, x1 - x0, 1, '#d88a3a');
  const mid = Math.round((x0 + x1) / 2);
  line(c, mid - 4, far, mid, near, '#e7d6c8', 1);
  // the small seal painted at its middle
  c.save();
  c.translate(mid, Math.round((far + near) / 2));
  c.scale(1.2, 0.45);
  seal(c, 0, 0, 5);
  c.restore();
  return mid;
}

/** A volleyball net strung between two black padded posts, seen side on: the posts are at `x` far and near. */
export function volleyNet(c: Ctx, x: number, farY: number, nearY: number): void {
  const post = (px0: number, base: number, h: number) => {
    rect(c, px0 - 2, base - h, 5, h, '#1c1c20');
    rect(c, px0 - 2, base - h, 1, h, '#3a3a40');
    rect(c, px0 - 3, base - 2, 7, 2, '#55555c');
  };
  post(x - 4, farY, 40);
  // the net between them, a band of mesh with a white top tape
  const ft = farY - 34;
  const nt = nearY - 46;
  for (let k = 0; k <= 1; k += 0.02) {
    const y0 = ft + (nt - ft) * k;
    const xx = x - 4 + 4 * k;
    for (let y = y0; y < y0 + 14; y += 2) px(c, xx, y, 'rgba(30,30,34,0.75)');
  }
  line(c, x - 4, ft, x, nt, '#f2f2ee', 1);
  line(c, x - 4, ft + 14, x, nt + 14, '#2a2a30', 1);
  post(x, nearY, 52);
}

/**
 * The yellow corrugated gate of the AERO LABORATORY across the far end, a
 * plane painted on it, and the small door in it on the left. Returns the door's x.
 */
export function aeroGate(c: Ctx, g: Ctx, x0: number, x1: number, base: number, h: number): number {
  const top = base - h;
  rect(c, x0, top, x1 - x0, h, '#d9d389');
  for (let x = x0; x < x1; x += 3) rect(c, x, top, 1, h, '#bdb86c');
  // the frame posts between its panels
  for (let x = x0; x <= x1; x += Math.round((x1 - x0) / 5)) {
    rect(c, x - 1, top, 3, h, '#a8a6a0');
    rect(c, x - 1, top, 1, h, '#d4d2cc');
  }
  rect(c, x0 - 2, top - 3, x1 - x0 + 4, 3, '#a8a6a0');
  rect(c, x0 - 2, base - 2, x1 - x0 + 4, 2, '#8c8a84');
  // the plane painted on it, dark red, nose to the left
  const px0 = x0 + (x1 - x0) * 0.42;
  const py = top + h * 0.42;
  poly(c, [[px0 - 34, py], [px0 + 30, py - 3], [px0 + 36, py - 12], [px0 + 40, py - 12], [px0 + 38, py + 1], [px0 + 30, py + 4], [px0 - 30, py + 5]], '#6e2a2c');
  poly(c, [[px0 - 4, py + 2], [px0 + 10, py + 2], [px0 - 8, py + 20], [px0 - 16, py + 20]], '#6e2a2c');
  poly(c, [[px0 - 4, py - 1], [px0 + 8, py - 1], [px0 - 4, py - 14], [px0 - 10, py - 14]], '#6e2a2c');
  sign(c, 'AERO', px0 + 48, py - 8, '#6e2a2c');
  sign(c, 'LABORATORY', px0 - 20, py + 10, '#3f7fb8');
  // the lion's head in the corner
  rect(c, x1 - 26, py - 10, 12, 14, '#efe7da');
  disc(c, x1 - 20, py - 4, 4, '#a0662f');
  // the small door, a notice over it
  const door = x0 + 22;
  rect(c, door - 9, base - 34, 18, 34, '#c9c5b9');
  rect(c, door - 8, base - 33, 16, 32, '#b6b2a6');
  rect(c, door - 6, base - 30, 12, 10, '#e9e5da');
  rect(c, door - 4, base - 29, 8, 3, '#c43a3a');
  rect(c, door + 5, base - 16, 2, 2, '#4a4a4a');
  rect(g, door - 8, base - 33, 16, 32, '#ffe2a0');
  return door;
}

/** A stack of white monobloc chairs, or one standing on its own. */
export function monobloc(c: Ctx, x: number, base: number, n = 1): void {
  for (let i = 0; i < n; i++) {
    const y = base - 10 - i * 2;
    rect(c, x - 4, y, 9, 2, '#f1f1ed');
    rect(c, x - 4, y - 7 - (i === n - 1 ? 0 : 0), 2, 7, '#f1f1ed');
  }
  rect(c, x - 4, base - 10, 1, 10, '#d9d9d3');
  rect(c, x + 4, base - 10, 1, 10, '#d9d9d3');
  rect(c, x - 4, base - 17 - (n - 1) * 2, 2, 1, '#ffffff');
}

/** A tall black padded post, as stand at the corners of the volleyball court. */
export function paddedPost(c: Ctx, x: number, base: number, h = 44): void {
  rect(c, x - 3, base - h, 6, h, '#18181c');
  rect(c, x - 3, base - h, 2, h, '#2e2e34');
  rect(c, x - 4, base - 3, 8, 3, '#3a3a40');
}

/** A tall aluminium stepladder, the umpire's stand. */
export function ladder(c: Ctx, x: number, base: number): void {
  line(c, x - 6, base, x - 2, base - 38, '#d6d8dc', 1);
  line(c, x + 6, base, x + 2, base - 38, '#d6d8dc', 1);
  for (let y = base - 6; y > base - 38; y -= 6) {
    const t = (base - y) / 38;
    rect(c, x - 6 + 4 * t, y, 12 - 8 * t, 1, '#c3c6cb');
  }
}

// --- the Aero Laboratory -----------------------------------------------------------------------------------

/** A wall of grey-green corrugated sheeting, from `top` to `base`. */
export function corrugatedWall(c: Ctx, x0: number, x1: number, top: number, base: number, colour = '#8f9a92'): void {
  rect(c, x0, top, x1 - x0, base - top, colour);
  for (let x = x0; x < x1; x += 3) rect(c, x, top, 1, base - top, shade(colour, -0.12));
  for (let x = x0 + 1; x < x1; x += 6) rect(c, x, top, 1, base - top, shade(colour, 0.12));
  rect(c, x0, top + Math.round((base - top) * 0.45), x1 - x0, 2, shade(colour, -0.25));
}

/** A red bay on the floor outlined in white, where an aircraft stands. */
export function hangarBay(c: Ctx, x0: number, x1: number, far: number, near: number): void {
  poly(c, [[x0 + 14, far], [x1 - 14, far], [x1, near], [x0, near]], '#7a3a36');
  line(c, x0 + 14, far, x1 - 14, far, '#e9e4dc', 1);
  line(c, x0 + 14, far, x0, near, '#e9e4dc', 1);
  line(c, x1 - 14, far, x1, near, '#e9e4dc', 1);
  // the cross lines that divide it
  for (const k of [0.35, 0.7]) {
    const y = far + (near - far) * k;
    const inset = 14 * (1 - k);
    rect(c, x0 + inset, y, x1 - x0 - inset * 2, 1, '#d9d2c8');
  }
  line(c, (x0 + x1) / 2, far, (x0 + x1) / 2, near, '#d9d2c8', 1);
}

/**
 * A high-wing trainer seen from the side, nose to `dir`, standing on its
 * wheels and a yellow stand: fuselage, the wing on struts over the cabin, the
 * tail, the propeller. `body` and `wing` are its colours; `name` is painted on.
 */
export function trainerPlane(
  c: Ctx, x: number, base: number, dir: 1 | -1, body: string, wing: string, name: string, stripes: string, s = 1,
): void {
  const f = (d: number) => x + d * dir * s;
  const y = (d: number) => base - d * s;
  // the yellow stands under the wing and the tail
  for (const d of [-6, 30]) {
    line(c, f(d) - 6 * s, y(0), f(d), y(18), '#d9a63a', 2);
    line(c, f(d) + 6 * s, y(0), f(d), y(18), '#d9a63a', 2);
  }
  // fuselage: deep at the cabin, tapering to the tail
  poly(c, [[f(-46), y(22)], [f(-30), y(30)], [f(14), y(36)], [f(36), y(32)], [f(42), y(24)], [f(36), y(16)], [f(-10), y(16)], [f(-46), y(20)]], body);
  poly(c, [[f(-46), y(22)], [f(-30), y(30)], [f(14), y(36)], [f(14), y(32)], [f(-30), y(26)]], shade(body, 0.2));
  // the tail fin
  poly(c, [[f(-46), y(22)], [f(-56), y(46)], [f(-48), y(46)], [f(-34), y(28)]], body);
  rect(c, Math.min(f(-58), f(-40)), y(24), 18 * s, 2 * s, shade(body, -0.15));
  // the stripes along it and the name
  line(c, f(-40), y(23), f(30), y(26), stripes, Math.max(1, Math.round(1.5 * s)));
  line(c, f(-30), y(20), f(30), y(22), stripes, 1);
  if (name) sign(c, name, Math.min(f(-30), f(-30) + (dir < 0 ? -name.length * 4 : 0)), y(31), '#1c1c20');
  // the cabin windows
  poly(c, [[f(8), y(34)], [f(20), y(34)], [f(30), y(28)], [f(10), y(28)]], '#3c4b5c');
  rect(c, Math.min(f(-4), f(6)), y(34), 10 * s, 5 * s, '#5c6e82');
  // the wing over the cabin, seen edge on, and its strut
  rect(c, Math.min(f(-24), f(56)), y(40), 80 * s, 4 * s, wing);
  rect(c, Math.min(f(-24), f(56)), y(40), 80 * s, 1, shade(wing, 0.25));
  line(c, f(10), y(39), f(4), y(18), '#5a5a60', 1);
  // the engine cowling, the spinner and the propeller blade
  rect(c, Math.min(f(36), f(46)), y(31), 10 * s, 14 * s, '#c9c9c4');
  disc(c, f(48), y(24), 2 * s, '#3a3a40');
  line(c, f(48), y(40), f(48), y(8), '#1c1c20', Math.max(1, Math.round(1.5 * s)));
  // the landing gear: a wheel under the nose, two under the wing
  for (const d of [36, 6]) {
    line(c, f(d), y(16), f(d), y(5), '#3a3a40', 1);
    disc(c, f(d), y(4), 4 * s, '#1c1c20');
    disc(c, f(d), y(4), 1.5 * s, '#8a8d95');
  }
  ellipse(c, x, base, 48 * s, 2, 'rgba(20,14,34,0.3)');
}

/** A jet engine in its yellow frame: a white nacelle, the dark fan at its mouth. */
export function jetEngine(c: Ctx, x: number, base: number, w = 70): void {
  const top = base - 46;
  // the yellow frame
  for (const fx of [x - w / 2 - 4, x + w / 2 + 4]) {
    rect(c, fx - 2, top, 4, base - top, '#d9a63a');
    rect(c, fx - 2, top, 1, base - top, '#f0c860');
  }
  rect(c, x - w / 2 - 6, top - 2, w + 12, 4, '#d9a63a');
  rect(c, x - w / 2 - 6, base - 8, w + 12, 3, '#c2902c');
  // the nacelle hanging under it
  const cy = top + 22;
  rect(c, x - w / 2, cy - 12, w * 0.6, 24, '#e9e8e2');
  rect(c, x - w / 2, cy - 12, w * 0.6, 3, '#ffffff');
  rect(c, x - w / 2 + w * 0.6, cy - 10, w * 0.4, 20, '#7a7c82');
  for (let k = 0; k < 6; k++) rect(c, x - w / 2 + w * 0.6 + k * (w * 0.4 / 6), cy - 10, 1, 20, '#5a5c62');
  ellipse(c, x - w / 2, cy, 4, 12, '#2a2a30');
  ellipse(c, x - w / 2 + 1, cy, 2, 9, '#45454c');
  for (const d of [-6, 6]) line(c, x - w / 4 + d, top + 2, x - w / 4 + d, cy - 12, '#5a5a60', 1);
}

/** A long grey workbench with white chairs, and a tool box on it. */
export function workbench(c: Ctx, x: number, base: number, w: number): void {
  rect(c, x, base - 16, w, 3, '#9a9c9e');
  rect(c, x, base - 16, w, 1, '#c9cbcd');
  for (const lx of [x + 3, x + w - 5]) rect(c, lx, base - 13, 2, 13, '#6a6c70');
  rect(c, x + 8, base - 24, 12, 8, '#d9d9d4');
  rect(c, x + w - 30, base - 20, 10, 4, '#2f5f9e');
  for (let cx = x + 10; cx < x + w; cx += 22) monobloc(c, cx, base + 3);
}

/** A standing electric fan on its round foot. */
export function standFan(c: Ctx, x: number, base: number): void {
  ellipse(c, x, base - 1, 7, 2, '#1c1c20');
  rect(c, x, base - 26, 1, 25, '#2a2a30');
  disc(c, x, base - 30, 6, '#3a3a40');
  disc(c, x, base - 30, 4, '#55555c');
  disc(c, x, base - 30, 1.5, '#1c1c20');
}

/** A red fire extinguisher on its trolley. */
export function extinguisher(c: Ctx, x: number, base: number): void {
  rect(c, x - 3, base - 18, 6, 16, '#c8282e');
  rect(c, x - 3, base - 18, 2, 16, '#e05a5e');
  rect(c, x - 1, base - 21, 2, 3, '#2a2a30');
  disc(c, x - 2, base - 2, 2, '#1c1c20');
  disc(c, x + 3, base - 2, 2, '#1c1c20');
}

/** A notice board with papers pinned on it. */
export function noticeBoard(c: Ctx, x: number, y: number, w: number, h: number): void {
  rect(c, x, y, w, h, '#efeee8');
  rect(c, x, y, w, 1, '#ffffff');
  const rand = rng(x * 7 + y);
  for (let k = 0; k < 4; k++) {
    const px0 = x + 2 + rand() * (w - 10);
    const py0 = y + 2 + rand() * (h - 10);
    rect(c, px0, py0, 7, 8, rand() > 0.5 ? '#ffffff' : '#e6e9c0');
    for (let l = 2; l < 7; l += 2) rect(c, px0 + 1, py0 + l, 5, 1, '#9a9890');
  }
  signCentered(c, 'NOTICE', x + w / 2, y - 6, '#4a4c52');
}

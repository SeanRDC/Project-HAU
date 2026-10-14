// The inside of the Immaculate Heart Gymnasium, drawn from the photos in
// `assets/ih_gym immaculate heart/`: a big steel-roofed hall with a court of
// grey-blue and red, the university seal at centre court, steel bleachers
// along both long sides on the second floor, the walls under them painted in
// broad diagonal stripes of yellow, red and grey, rows of red, yellow, tan and
// grey sound panels hung under the roof trusses, and a stage at the far end.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect, sign, signCentered, signWidth } from '../../engine/pix';
import { seal } from './ihgym';
import { shade } from './palette';

export const STEEL = '#5b616b';
const STEEL_DARK = '#3d424a';
const STEEL_HI = '#8a919b';
/** the sound panels: red, yellow, tan, grey */
const PANELS = ['#c6303a', '#e2b53b', '#c9a873', '#8e8a85', '#d6bf8c', '#b7383c'];
export const STRIPES = ['#e6c23e', '#c3393a', '#9a9ea6', '#e5dcc4'];
export const WALL_WHITE = '#e9e6dd';

/**
 * The roof from below, from `top` (nearest the camera) down to `bottom`
 * (where it meets the far wall): steel trusses, and rows of sound panels
 * hung under them, smaller with distance. Returns where the lamps are.
 */
export function acousticRoof(c: Ctx, x0: number, x1: number, top: number, bottom: number, seed: number): [number, number][] {
  const rand = rng(seed);
  const w = x1 - x0;
  // the roof sheeting, lighter where the skylights let the day in
  for (let y = top; y < bottom; y++) {
    const k = (y - top) / (bottom - top);
    rect(c, x0, y, w, 1, k < 0.5 ? '#7f848b' : '#999ca1');
  }
  for (let y = top + 3; y < bottom; y += 4 + Math.floor(((y - top) / (bottom - top)) * 2)) rect(c, x0, y, w, 1, '#6c7178');
  // the trusses: deep lattice girders running back away from the camera
  const lamps: [number, number][] = [];
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    // nearer rows are bigger and higher on the screen
    const k = r / rows;
    const y = Math.round(top + (bottom - top) * (1 - Math.pow(1 - k, 1.6)));
    const s = 1 - k * 0.65;
    const ph = Math.max(2, Math.round(9 * s));
    const pw = Math.max(5, Math.round(26 * s));
    const gap = Math.max(3, Math.round(10 * s));
    rect(c, x0, y - 2, w, Math.max(1, Math.round(2 * s)), STEEL_DARK);
    for (let x = x0 - rand() * pw; x < x1; x += pw + gap) {
      // the panels hang in the roof's shade: a little darker than the paint
      const col = shade(PANELS[Math.floor(rand() * PANELS.length)], -0.12);
      rect(c, x, y, pw, ph, col);
      rect(c, x, y, pw, 1, shade(col, 0.25));
      rect(c, x, y + ph - 1, pw, 1, shade(col, -0.3));
    }
    if (r % 2 === 1) for (let x = x0 + 40 + rand() * 30; x < x1; x += 110 + rand() * 20) lamps.push([Math.round(x), y + ph + 2]);
  }
  // the girders across, with their zigzag webs
  for (let x = x0 + 20; x < x1; x += 90) {
    line(c, x, top, x + 6, bottom, STEEL, 2);
    for (let y = top; y < bottom - 6; y += 10) line(c, x + ((y - top) / (bottom - top)) * 6, y, x + 8 + ((y - top) / (bottom - top)) * 6, y + 10, STEEL_HI, 1);
  }
  // the high-bay lamps
  for (const [lx, ly] of lamps) {
    rect(c, lx - 3, ly - 2, 7, 2, '#2d3138');
    disc(c, lx + 0.5, ly + 1, 2.5, '#fbf6e2');
  }
  return lamps;
}

/** A big ceiling fan, seen from below at an angle. */
export function ceilingFan(c: Ctx, x: number, y: number, r: number): void {
  rect(c, x, y - 10, 1, 10, STEEL_DARK);
  for (let a = 0.3; a < Math.PI * 2; a += (Math.PI * 2) / 5) {
    line(c, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.25, '#8f949b', 1);
  }
  disc(c, x, y, 1.5, STEEL_DARK);
}

/** A tall black line-array speaker hanging on its chains. */
export function hangingSpeaker(c: Ctx, x: number, top: number, y: number, h: number): void {
  line(c, x - 2, top, x - 2, y, '#2a2a2e', 1);
  line(c, x + 3, top, x + 3, y, '#2a2a2e', 1);
  for (let i = 0; i < h; i += 4) {
    rect(c, x - 4 - (i / h) * 2, y + i, 10, 4, '#18181c');
    rect(c, x - 4 - (i / h) * 2, y + i, 10, 1, '#2f2f35');
  }
}

/**
 * The wall under the bleachers, painted in broad diagonal stripes of yellow,
 * red, grey and cream, with white paint splashed along the bottom, split by
 * the posts that hold the bleachers up.
 */
export function stripeWall(c: Ctx, x0: number, x1: number, top: number, bottom: number, seed: number): void {
  const rand = rng(seed);
  const h = bottom - top;
  for (let y = top; y < bottom; y++) {
    for (let x = x0; x < x1; x++) {
      const band = Math.floor((x + (y - top) * 1.4) / 22);
      const col = STRIPES[((band % 4) + 4) % 4];
      c.fillStyle = col;
      c.fillRect(x, y, 1, 1);
    }
  }
  // the paint is chipped and splashed with white along the foot of the wall
  for (let i = 0; i < (x1 - x0) * 0.9; i++) {
    const x = x0 + rand() * (x1 - x0);
    const y = bottom - 2 - rand() * h * 0.35;
    px(c, x, y, rand() > 0.3 ? '#f4f2ec' : '#d9d5cc');
  }
  rect(c, x0, top, x1 - x0, 1, '#f4f2ec');
  rect(c, x0, bottom - 2, x1 - x0, 2, '#7d786f');
  for (let x = x0 + 6; x < x1; x += 120) {
    rect(c, x, top, 6, h, '#e3e0d8');
    rect(c, x, bottom - 18, 6, 16, '#2f4fa0');
    rect(c, x, bottom - 18, 6, 1, '#4f6fc0');
  }
}

/**
 * Steel bleachers seen from the front across the hall: rows of benches
 * stepping up and back from `base` to `top`, split into blocks by aisles with
 * yellow-edged steps, the windows behind them bright with the afternoon.
 */
export function bleachers(c: Ctx, g: Ctx, x0: number, x1: number, base: number, top: number, seed: number): void {
  const rand = rng(seed);
  // the windows along the back wall, behind the top rows
  rect(c, x0, top - 18, x1 - x0, 22, '#e2e6e6');
  for (let x = x0 + 4; x < x1; x += 34) {
    rect(c, x, top - 15, 28, 16, '#f6f4e6');
    rect(g, x, top - 15, 28, 16, '#ffe9b8');
    for (let k = 0; k < 28; k += 7) rect(c, x + k, top - 15, 1, 16, '#c9c8bf');
    rect(c, x, top - 8, 28, 1, '#c9c8bf');
  }
  const rows = Math.floor((base - top) / 5);
  for (let r = 0; r < rows; r++) {
    // the lowest row is the nearest: a little taller
    const y = base - (r + 1) * ((base - top) / rows);
    const hh = (base - top) / rows;
    rect(c, x0, y, x1 - x0, hh, r % 2 ? '#7b766c' : '#6c675f');
    rect(c, x0, y, x1 - x0, Math.max(1, hh * 0.45), '#c8b896');
    rect(c, x0, y, x1 - x0, 1, '#e8dcbf');
  }
  // the aisles: a gap in the benches, steps with yellow edges
  for (let x = x0 + 70 + rand() * 20; x < x1 - 30; x += 150 + rand() * 30) {
    rect(c, x, top, 10, base - top, '#5f5a53');
    for (let y = top + 2; y < base; y += 5) rect(c, x, y, 10, 1, '#e2c13a');
    rect(c, x - 1, top, 1, base - top, STEEL_DARK);
    rect(c, x + 10, top, 1, base - top, STEEL_DARK);
  }
  // the scaffold of steel tubes showing between the rows
  for (let x = x0 + 12; x < x1; x += 24) rect(c, x, top + 4, 1, base - top - 4, 'rgba(60,64,72,0.55)');
}

/** A steel pipe railing with uprights, `h` tall, its top at `y`. */
export function pipeRail(c: Ctx, x0: number, x1: number, y: number, h: number, colour = STEEL): void {
  rect(c, x0, y, x1 - x0, 2, colour);
  rect(c, x0, y, x1 - x0, 1, shade(colour, 0.35));
  rect(c, x0, y + Math.round(h * 0.5), x1 - x0, 1, colour);
  for (let x = x0 + 2; x < x1; x += 26) rect(c, x, y, 2, h, colour);
}

/** Where the lines of the court are, as fractions of its length (u) and width (v, 0 far, 1 near). */
type CourtMark = 'border' | 'court' | 'key' | 'line' | 'lane' | 'circle' | 'yellow';

/**
 * The court floor, seen from the side across its width: grey-blue court on a
 * red border, red keys with yellow lane lines, the three-point arcs, and the
 * seal in a yellow ring at centre court. `far` and `near` are the rows of its
 * far and near sidelines; it runs from `x0` to `x1`.
 */
export function courtFloor(c: Ctx, x0: number, x1: number, far: number, near: number, seed: number): void {
  const rand = rng(seed);
  const len = x1 - x0;
  const depth = near - far;
  const mark = (u: number, v: number): CourtMark => {
    // u: 0..1 along, v: 0..1 across
    if (u < 0.04 || u > 0.96 || v < 0.1 || v > 0.94) return 'border';
    const cu = (u - 0.5) * 28; // metres from centre court, along
    const cv = (v - 0.52) * 15; // metres from the middle, across
    const end = Math.abs(cu);
    const toEnd = 14 - end;
    // the lines are about 6 cm, but a pixel covers more: keep them a pixel wide
    const tol = 0.11;
    if (Math.abs(Math.hypot(cu, cv) - 1.8) < tol * 1.6) return 'yellow';
    if (Math.hypot(cu, cv) < 1.8) return 'circle';
    if (Math.abs(cu) < tol) return 'line';
    // the key: 4.9 m wide, 5.8 m deep from the end line
    if (toEnd < 5.8 && Math.abs(cv) < 2.45) {
      if (Math.abs(Math.abs(cv) - 2.45) < tol * 2) return 'lane';
      if (Math.abs(toEnd - 5.8) < tol) return 'line';
      return 'key';
    }
    // the three-point line: 6.75 m from the basket, 1.575 m in from the end
    const b = Math.hypot(toEnd - 1.575, cv);
    if (Math.abs(b - 6.75) < tol * 1.3 && toEnd > 1.2) return 'line';
    if (b > 6.75 && toEnd < 9) return 'key';
    return 'court';
  };
  const tone: Record<CourtMark, string> = {
    border: '#b65a45', court: '#a7b5bb', key: '#b65a45', line: '#f2f2ee', lane: '#e8c23c', circle: '#e2b93a', yellow: '#f2f2ee',
  };
  for (let y = far; y < near; y++) {
    for (let x = x0; x < x1; x++) {
      const k = mark((x - x0 + 0.5) / len, (y - far + 0.5) / depth);
      let col = tone[k];
      if (rand() > 0.94) col = shade(col, rand() > 0.5 ? 0.06 : -0.06);
      c.fillStyle = col;
      c.fillRect(x, y, 1, 1);
    }
  }
  // the seal at centre court, flattened like the floor
  const cx = Math.round(x0 + len / 2);
  const cy = Math.round(far + depth * 0.52);
  c.save();
  c.translate(cx, cy);
  c.scale(1, Math.max(0.55, depth / (len * 0.53)));
  seal(c, 0, 0, 11);
  c.restore();
  // the name along the far side of the border
  const name = 'HOLY ANGEL UNIVERSITY';
  for (let i = 0; i < name.length; i++) sign(c, name[i], x0 + len * 0.2 + i * 7, far + 1, '#e9d6c8');
}

/**
 * A portable basketball hoop on its padded blue base, seen side on: the
 * white frame reaches out over the court towards `dir`, the board edge on.
 */
export function portableHoop(c: Ctx, x: number, base: number, dir: 1 | -1, s = 1): { rim: [number, number] } {
  const f = (d: number) => x + d * dir * s;
  // the base: a blue padded box with wheels
  rect(c, Math.min(f(-10), f(14)), base - 12 * s, 24 * s, 12 * s, '#26408c');
  rect(c, Math.min(f(-10), f(14)), base - 12 * s, 24 * s, 2 * s, '#3d5cb0');
  rect(c, Math.min(f(-10), f(14)), base - 2 * s, 24 * s, 2 * s, '#1a2c66');
  // the white frame: a post leaning up and out, a strut, the arm to the board
  line(c, f(0), base - 12 * s, f(6), base - 74 * s, '#f2f2ee', Math.max(2, Math.round(3 * s)));
  line(c, f(10), base - 12 * s, f(14), base - 70 * s, '#d9d9d4', Math.max(1, Math.round(2 * s)));
  line(c, f(6), base - 74 * s, f(26), base - 74 * s, '#f2f2ee', Math.max(2, Math.round(3 * s)));
  line(c, f(4), base - 48 * s, f(26), base - 70 * s, '#d9d9d4', 1);
  // the board, edge on, and the orange rim with its net
  rect(c, Math.min(f(26), f(28)), base - 86 * s, 2 * s, 24 * s, '#eef2f4');
  const rx = f(34);
  const ry = base - 68 * s;
  rect(c, Math.min(f(28), f(40)), ry, 12 * s, 1, '#e0672c');
  for (let i = 0; i < 5 * s; i++) px(c, Math.min(f(29), f(39)) + ((i * 2) % (10 * s)), ry + 1 + i, '#f2f2ee');
  return { rim: [rx, ry] };
}

/** A small backboard hung from the bleachers' edge for the cross courts. */
export function wallBoard(c: Ctx, x: number, y: number): void {
  rect(c, x - 9, y, 18, 12, '#f1f3f4');
  rect(c, x - 9, y, 18, 1, '#ffffff');
  rect(c, x - 4, y + 5, 8, 5, '#c8303a');
  rect(c, x - 3, y + 6, 6, 3, '#f1f3f4');
  rect(c, x - 4, y + 12, 8, 1, '#e0672c');
  for (let i = 0; i < 4; i++) px(c, x - 3 + i * 2, y + 13 + (i % 2), '#e9e9e4');
  rect(c, x - 1, y - 6, 2, 6, STEEL_DARK);
}

/** The red trophy angel with white wings on its round red base that stands by the stage. */
export function angelTrophy(c: Ctx, x: number, base: number): void {
  ellipse(c, x, base - 2, 9, 3, '#a8232c');
  rect(c, x - 9, base - 4, 18, 3, '#c43039');
  rect(c, x - 3, base - 26, 6, 22, '#c43039');
  rect(c, x - 3, base - 26, 2, 22, '#e05a60');
  for (const s of [-1, 1]) {
    poly(c, [[x + s * 2, base - 18], [x + s * 14, base - 34], [x + s * 12, base - 22], [x + s * 6, base - 14]], '#f6f4ef');
    line(c, x + s * 4, base - 20, x + s * 12, base - 30, '#cfcac0', 1);
  }
  disc(c, x, base - 28, 2.5, '#d9a740');
}

/** A stack of white monobloc chairs. */
export function chairStack(c: Ctx, x: number, base: number, n = 4): void {
  for (let i = 0; i < n; i++) {
    const y = base - 14 - i * 2;
    rect(c, x - 5, y, 10, 2, '#efefeb');
    rect(c, x - 5, y - 8, 2, 8, '#efefeb');
  }
  rect(c, x - 5, base - 12, 1, 12, '#dcdcd6');
  rect(c, x + 4, base - 12, 1, 12, '#dcdcd6');
  rect(c, x - 5, base - 22 - n * 2, 10, 1, '#ffffff');
}

/** A folding steel grille, the kind pulled across the stairs and the gates at night. `open` 0..1 folds it to the left. */
export function foldingGrille(c: Ctx, x: number, top: number, w: number, h: number, open = 0): void {
  const span = Math.max(6, Math.round(w * (1 - open)));
  const bays = Math.max(1, Math.round(span / 8));
  const bw = span / bays;
  for (let i = 0; i <= bays; i++) rect(c, x + i * bw, top, 1, h, '#c9ccd2');
  for (let i = 0; i < bays; i++) {
    const bx = x + i * bw;
    for (let y = top; y < top + h - 8; y += 12) {
      line(c, bx, y, bx + bw, y + 12, '#aeb2b9', 1);
      line(c, bx + bw, y, bx, y + 12, '#aeb2b9', 1);
    }
  }
  rect(c, x, top, span, 2, '#dfe1e5');
  rect(c, x, top + h - 2, span, 2, '#8d9097');
}

/**
 * A straight flight of stairs seen from the side, climbing from (x0, y0) at
 * the foot to (x1, y1) at the top, dark treads with yellow nosings, a grey
 * handrail along the wall.
 */
export function sideStairs(c: Ctx, x0: number, y0: number, x1: number, y1: number, steps: number): void {
  const dx = (x1 - x0) / steps;
  const dy = (y1 - y0) / steps;
  // the stringer: a solid wedge under the steps
  poly(c, [[x0, y0], [x1, y1], [x1, y0]], '#4a4d55');
  for (let i = 0; i < steps; i++) {
    const sx = x0 + dx * i;
    const sy = y0 + dy * (i + 1);
    const w = Math.abs(dx) + 1;
    rect(c, Math.min(sx, sx + dx), sy, w, Math.abs(dy), '#3a3d45');
    rect(c, Math.min(sx, sx + dx), sy, w, 2, '#e2c13a');
  }
  // the handrail along the wall above, and its brackets
  line(c, x0, y0 - 30, x1, y1 - 30, '#8d939c', 2);
  for (let i = 1; i < 4; i++) {
    const hx = x0 + ((x1 - x0) * i) / 4;
    const hy = y0 - 30 + ((y1 - y0) * i) / 4;
    rect(c, hx, hy, 1, 4, '#6b7078');
  }
}

/** A bank of grey steel lockers. */
export function lockers(c: Ctx, x: number, base: number, cols: number): void {
  const w = cols * 9;
  rect(c, x, base - 46, w, 46, '#a9a69c');
  rect(c, x, base - 46, w, 2, '#cfccc2');
  for (let k = 0; k < cols; k++) {
    for (let r = 0; r < 4; r++) {
      const lx = x + k * 9 + 1;
      const ly = base - 44 + r * 11;
      rect(c, lx, ly, 8, 10, '#bdbab0');
      rect(c, lx + 1, ly + 1, 6, 1, '#8c897f');
      rect(c, lx + 1, ly + 3, 6, 1, '#8c897f');
      px(c, lx + 6, ly + 6, '#5a584f');
    }
  }
}

/** The three bins by the gates: green, yellow and blue, with their labels. */
export function bins(c: Ctx, x: number, base: number): void {
  for (const [i, col] of ['#2f7d4f', '#e2b53b', '#2a4a8a'].entries()) {
    const bx = x + i * 13;
    rect(c, bx, base - 20, 11, 20, col);
    rect(c, bx, base - 20, 11, 2, shade(col, 0.3));
    rect(c, bx + 2, base - 14, 7, 4, '#f1efe8');
  }
}

/** The WELCOME ANGELITES banner hung along the front of the stage. */
export function welcomeBanner(c: Ctx, x0: number, x1: number, top: number, h: number): void {
  const w = x1 - x0;
  for (let x = 0; x < w; x++) {
    const k = x / w;
    // purple at the ends, deep red in the middle, as printed
    const col = k < 0.12 || k > 0.88 ? '#7a2f78' : k < 0.2 || k > 0.8 ? '#8a2a4f' : '#5a1a2a';
    rect(c, x0 + x, top, 1, h, col);
  }
  // the printed pattern of dots and slashes at the ends
  for (let x = 0; x < 20; x += 3) {
    for (let y = 2; y < h - 1; y += 3) {
      px(c, x0 + 4 + x, top + y, '#c46ab4');
      px(c, x1 - 6 - x, top + y, '#c46ab4');
    }
  }
  const text = 'WELCOME ANGELITES';
  const scale = Math.max(1, Math.floor((h - 4) / 5));
  const tw = signWidth(text, scale);
  sign(c, text, Math.round(x0 + (w - tw) / 2) + 1, top + Math.round((h - 5 * scale) / 2) + 1, '#2a0f18', scale);
  sign(c, text, Math.round(x0 + (w - tw) / 2), top + Math.round((h - 5 * scale) / 2), '#f6f2ee', scale);
  rect(c, x0, top, w, 1, '#a04a80');
  rect(c, x0, top + h - 1, w, 1, '#2a0f18');
}

/** One of the big striped panels on the stage end walls. */
export function stripePanel(c: Ctx, x: number, y: number, w: number, h: number, flip = false): void {
  const cols = ['#c9a873', '#e2b53b', '#c6303a', '#d6bf8c', '#8e8a85', '#e2b53b'];
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      const t = ((flip ? w - xx : xx) * 0.35 + yy) / (h / cols.length);
      c.fillStyle = cols[Math.min(cols.length - 1, Math.max(0, Math.floor(t * 0.8)))];
      c.fillRect(x + xx, y + yy, 1, 1);
    }
  }
  rect(c, x, y, w, 1, '#f2efe6');
  rect(c, x, y + h - 1, w, 1, '#7d786f');
}

/** A tall window of frosted louvres. */
export function frostedWindow(c: Ctx, g: Ctx, x: number, y: number, w: number, h: number, arched = false): void {
  rect(c, x - 2, y - 2, w + 4, h + 4, '#f6f4ee');
  rect(c, x, y, w, h, '#e4e8ea');
  rect(g, x, y, w, h, '#fff0c0');
  for (let ly = y + 2; ly < y + h; ly += 3) rect(c, x, ly, w, 1, '#c3c9cd');
  for (let lx = x + Math.round(w / 3); lx < x + w - 1; lx += Math.round(w / 3)) rect(c, lx, y, 1, h, '#f6f4ee');
  if (arched) {
    for (let dx = 0; dx < w; dx++) {
      const k = (dx - w / 2) / (w / 2);
      const top = Math.round(y - Math.sqrt(Math.max(0, 1 - k * k)) * 6);
      rect(c, x + dx, top, 1, y - top, '#e4e8ea');
      px(c, x + dx, top - 1, '#f6f4ee');
    }
  }
}

/** A worn white-painted floor with yellow court lines, the kind in front of the stage. */
export function whiteFloor(c: Ctx, x0: number, x1: number, far: number, near: number, seed: number): void {
  const rand = rng(seed);
  rect(c, x0, far, x1 - x0, near - far, '#dcdcd6');
  for (let i = 0; i < (x1 - x0) * (near - far) * 0.04; i++) {
    const r = rand();
    px(c, x0 + rand() * (x1 - x0), far + rand() * (near - far), r > 0.5 ? '#c4c4bd' : r > 0.12 ? '#b0b0a9' : '#76746f');
  }
  // the boards' long joints
  for (let y = far + 5; y < near; y += 7) rect(c, x0, y, x1 - x0, 1, '#c9c9c2');
}

/** A label for a scene where the sign font is too small to fit a word: centred text on a plate. */
export function plate(c: Ctx, text: string, cx: number, y: number, bg: string, fg: string): void {
  const w = signWidth(text) + 6;
  rect(c, cx - w / 2, y, w, 9, bg);
  signCentered(c, text, cx, y + 2, fg);
}

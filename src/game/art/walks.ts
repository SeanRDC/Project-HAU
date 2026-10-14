// The chapel walkway's lanes, drawn from the photos in
// `assets/images/buildings/beside the main building + the main walkways/`.
//
// Both sides of the road have the same two sidewalks. Sidewalk 1 is a covered
// walk: square terracotta block pillars in two rows under a white slatted
// pergola roof, a floor of pale beige tiles with a mosaic rug set in now and
// then, granite benches between the pillars on the building side. Sidewalk 2
// is a path of brown hexagonal pavers with dark brown lamp posts, each with
// two lanterns and a white banner, along a hedge.
//
// On the Main Building side the student center comes first: an arcade along
// the DJN with a tiled ceiling and fans, a floor of terracotta tiles in a
// pattern of circles, Cafe Juan's tall windows, rows of white tables and
// monobloc chairs, and a terracotta planter with a steel rail and lady palms
// along its open side.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect, sign, signCentered } from '../../engine/pix';
import { P, shade } from './palette';
import { foliage } from './props';

export const TERRA = '#d9886b';
const TERRA_LIT = '#eaa688';
const TERRA_DARK = '#b46a53';
const TERRA_JOINT = '#a35f4a';
const SLAT = '#eeece4';
const SLAT_SHADE = '#c9c6bc';
const LAMP_BROWN = '#6b4130';
const LAMP_HI = '#8f5c44';

/** A square pillar of terracotta blocks, lit from the left. */
export function pillar(c: Ctx, x: number, top: number, base: number, w: number): void {
  const h = base - top;
  rect(c, x, top, w, h, TERRA);
  rect(c, x, top, Math.max(1, Math.round(w * 0.25)), h, TERRA_LIT);
  rect(c, x + w - Math.max(1, Math.round(w * 0.22)), top, Math.max(1, Math.round(w * 0.22)), h, TERRA_DARK);
  // the joints between the blocks, about as tall as the pillar is wide
  const block = Math.max(4, Math.round(w * 1.15));
  for (let y = base - block; y > top + 2; y -= block) rect(c, x, y, w, 1, TERRA_JOINT);
  rect(c, x - 1, base - 2, w + 2, 2, shade(TERRA_DARK, -0.2));
}

/** The pergola roof seen from the side at a distance: a white beam with the slat ends over it. */
export function pergolaSide(c: Ctx, x0: number, x1: number, y: number, s = 1): void {
  const bh = Math.max(2, Math.round(4 * s));
  rect(c, x0, y, x1 - x0, bh, SLAT);
  rect(c, x0, y + bh, x1 - x0, 1, SLAT_SHADE);
  rect(c, x0, y - Math.max(1, Math.round(3 * s)), x1 - x0, Math.max(1, Math.round(3 * s)), '#dedbd2');
  for (let x = x0; x < x1; x += Math.max(3, Math.round(6 * s))) rect(c, x, y - Math.max(1, Math.round(3 * s)), 1, Math.max(1, Math.round(3 * s)), SLAT_SHADE);
}

/** The slatted roof seen from below, from `top` to `bottom` rows, slats running across. */
export function slatCeiling(c: Ctx, x0: number, x1: number, top: number, bottom: number): void {
  rect(c, x0, top, x1 - x0, bottom - top, '#d6d3ca');
  for (let y = top; y < bottom; y += 4) {
    rect(c, x0, y, x1 - x0, 2, SLAT);
    rect(c, x0, y + 2, x1 - x0, 1, SLAT_SHADE);
  }
  rect(c, x0, bottom - 3, x1 - x0, 3, '#f6f5f0');
  rect(c, x0, bottom, x1 - x0, 1, '#a9a69c');
}

/** A granite bench: a speckled slab on two blocks. */
export function graniteBench(c: Ctx, x: number, base: number, w: number, s = 1): void {
  const rand = rng(x * 13 + base);
  const h = Math.max(4, Math.round(9 * s));
  const t = Math.max(2, Math.round(3 * s));
  rect(c, x, base - h, w, t, '#c9c3b6');
  rect(c, x, base - h, w, 1, '#e2ddd2');
  for (let i = 0; i < w * 0.6; i++) px(c, x + rand() * w, base - h + rand() * t, rand() > 0.5 ? '#9f998c' : '#e8e3d8');
  for (const bx of [x + Math.round(w * 0.12), x + w - Math.round(w * 0.12) - Math.max(2, Math.round(4 * s))]) {
    rect(c, bx, base - h + t, Math.max(2, Math.round(4 * s)), h - t, '#aaa498');
  }
}

/**
 * A dark brown lamp post with two lanterns on scrolled arms and a white
 * banner hung from it, the kind along sidewalk 2. Returns where the lanterns are.
 */
export function bannerLamp(c: Ctx, x: number, base: number, h: number, seed: number): { x: number; y: number }[] {
  const rand = rng(seed);
  rect(c, x - 3, base - 6, 7, 6, LAMP_BROWN);
  rect(c, x - 2, base - 10, 5, 4, LAMP_BROWN);
  rect(c, x - 1, base - h, 3, h - 10, LAMP_BROWN);
  rect(c, x - 1, base - h, 1, h - 10, LAMP_HI);
  const lights: { x: number; y: number }[] = [];
  for (const s of [-1, 1]) {
    for (let a = 0; a <= 8; a++) {
      const t = (a / 8) * Math.PI;
      px(c, x + s * (5 - Math.cos(t) * 5), base - h + 2 - Math.sin(t) * 5, '#2a2622');
    }
    const lx = x + s * 10;
    rect(c, lx - 2, base - h + 3, 5, 2, '#2a2622');
    rect(c, lx - 2, base - h + 5, 5, 6, '#d9c27a');
    rect(c, lx - 2, base - h + 5, 1, 6, '#2a2622');
    rect(c, lx + 2, base - h + 5, 1, 6, '#2a2622');
    rect(c, lx - 1, base - h + 11, 3, 1, '#2a2622');
    lights.push({ x: lx, y: base - h + 8 });
  }
  // the banner: white, a faint painted figure in the middle
  const by = base - h + 18;
  rect(c, x + 2, by, 1, 2, '#3a3632');
  rect(c, x + 3, by, 14, 26, '#f3f1ea');
  rect(c, x + 3, by, 14, 1, '#ffffff');
  rect(c, x + 16, by, 1, 26, '#cfcbc0');
  const tone = rand() > 0.5 ? '#c99a6a' : '#9aa6b8';
  ellipse(c, x + 10, by + 10, 4, 6, tone);
  disc(c, x + 10, by + 5, 2, shade(tone, -0.2));
  rect(c, x + 5, by + 19, 10, 1, '#8a7a6a');
  rect(c, x + 6, by + 22, 8, 1, '#b0a090');
  return lights;
}

/**
 * A strip of brown hexagonal pavers from row `y`, `h` deep, flattened by the
 * low camera: rows of small six-sided stones, alternate rows shifted half a
 * stone, dark joints between them and moss here and there.
 */
export function hexPavers(c: Ctx, x0: number, x1: number, y: number, h: number, seed: number): void {
  const rand = rng(seed);
  rect(c, x0, y, x1 - x0, h, '#5f4a3e');
  const tones = ['#9a7a66', '#8d6f5c', '#86695a', '#7d6152', '#a3836c'];
  for (let row = 0; row * 4 < h + 4; row++) {
    const ry = y + row * 4;
    // the stones get a little wider towards the camera
    const w = 9 + Math.floor((row * 4) / 16);
    for (let x = x0 - w + (row % 2) * Math.round(w / 2); x < x1; x += w) {
      const col = tones[Math.floor(rand() * tones.length)];
      // a flattened hexagon: two pixels in at the top and bottom rows
      rect(c, x + 2, ry, w - 4, 1, col);
      rect(c, x + 1, ry + 1, w - 2, 2, col);
      rect(c, x + 2, ry + 3, w - 4, 1, shade(col, -0.12));
      px(c, x + 3, ry + 1, shade(col, 0.18));
      if (rand() > 0.94) px(c, x, ry + 2, '#6f8a4a');
    }
  }
  rect(c, x0, y, x1 - x0, 1, '#b39a88');
}

/** Pale beige floor tiles in rows, as on sidewalk 1. */
export function beigeTiles(c: Ctx, x0: number, x1: number, y: number, h: number, seed: number): void {
  const rand = rng(seed);
  rect(c, x0, y, x1 - x0, h, '#e7ddcb');
  for (let ry = y; ry < y + h; ry += 6) {
    rect(c, x0, ry, x1 - x0, 1, '#cdbfa8');
    const off = ((ry - y) / 6) % 2 ? 9 : 0;
    for (let x = x0 + off; x < x1; x += 18) rect(c, x, ry, 1, 6, '#d6c9b3');
  }
  for (let i = 0; i < (x1 - x0) * h * 0.02; i++) px(c, x0 + rand() * (x1 - x0), y + rand() * h, rand() > 0.5 ? '#f2eadb' : '#d9cdb8');
}

/** The mosaic rug set into the tiles of sidewalk 1: a red border round a pattern of cream and black. */
export function mosaicRug(c: Ctx, x: number, y: number, w: number, h: number): void {
  rect(c, x, y, w, h, '#a8452f');
  rect(c, x + 2, y + 1, w - 4, h - 2, '#e6d7bb');
  rect(c, x + 4, y + 2, w - 8, h - 4, '#b5543a');
  for (let k = x + 6; k < x + w - 6; k += 4) px(c, k, y + Math.round(h / 2), '#2a2420');
  disc(c, x + w / 2, y + h / 2, Math.max(1, h / 3), '#e6d7bb');
  px(c, x + w / 2, y + h / 2, '#2a2420');
}

/** Terracotta floor tiles with the pattern of interlocking circles the student center has. */
export function circleTiles(c: Ctx, x0: number, x1: number, y: number, h: number): void {
  const base = '#b05a3c';
  const ring = '#d9925f';
  const dark = '#8c4430';
  for (let yy = y; yy < y + h; yy++) {
    // squashed by the low camera: the circles are wide and flat
    const v = ((yy - y) % 8) / 8;
    for (let x = x0; x < x1; x++) {
      const u = ((x % 20) + 20) % 20 / 20;
      const d = Math.hypot(u - 0.5, v - 0.5);
      const col = Math.abs(d - 0.36) < 0.06 ? ring : Math.abs(d - 0.18) < 0.05 ? ring : d < 0.08 ? dark : base;
      c.fillStyle = col;
      c.fillRect(x, yy, 1, 1);
    }
  }
  rect(c, x0, y, x1 - x0, 1, shade(base, 0.2));
}

/** A lady palm: a clump of thin stems with fans of narrow leaves. */
export function rhapis(c: Ctx, x: number, base: number, h: number, seed: number): void {
  const rand = rng(seed);
  const stems = 5;
  for (let i = 0; i < stems; i++) {
    const sx = x + (i - stems / 2) * 3 + (rand() - 0.5) * 2;
    const top = base - h * (0.65 + rand() * 0.35);
    line(c, sx, base, sx + (rand() - 0.5) * 4, top, '#4f6a34', 1);
    const fx = sx + (rand() - 0.5) * 4;
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI + (k / 6) * Math.PI + (rand() - 0.5) * 0.2;
      const len = 6 + rand() * 6;
      line(c, fx, top, fx + Math.cos(a) * len, top + Math.sin(a) * len * 0.7 + len * 0.3, k % 2 ? P.leafDark : P.leaf, 1);
    }
  }
}

/** The terracotta planter along the student center's open side, its steel rail over it and the palms in it. */
export function planterRail(c: Ctx, x0: number, x1: number, base: number, seed: number, s = 1, gap = 26): void {
  const h = Math.round(16 * s);
  const rand = rng(seed);
  for (let x = x0 + 10; x < x1 - 6; x += Math.round((gap + rand() * 10) * s)) rhapis(c, x, base - h + 2, (20 + rand() * 10) * s, seed + x);
  rect(c, x0, base - h, x1 - x0, h, '#b0614a');
  rect(c, x0, base - h, x1 - x0, 2, '#c97d62');
  rect(c, x0, base - 2, x1 - x0, 2, '#7e4434');
  for (let x = x0; x < x1; x += Math.round(40 * s)) rect(c, x, base - h, 1, h, '#8f4f3c');
  // the rail: steel posts and a round steel top
  const ry = base - h - Math.round(12 * s);
  for (let x = x0 + 4; x < x1; x += Math.round(30 * s)) rect(c, x, ry, Math.max(1, Math.round(2 * s)), base - ry, '#2c2c30');
  rect(c, x0, ry, x1 - x0, Math.max(1, Math.round(2 * s)), '#c9ccd1');
  rect(c, x0, ry, x1 - x0, 1, '#eef0f2');
  rect(c, x0, ry + Math.round(8 * s), x1 - x0, 1, '#2c2c30');
}

/** An areca palm in a big round concrete pot, as along the road side of sidewalk 2. */
export function arecaPot(c: Ctx, x: number, base: number, seed: number, s = 1): void {
  const rand = rng(seed);
  const top = base - 10 * s;
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i - 3.5) * 0.32 + (rand() - 0.5) * 0.12;
    const len = (26 + rand() * 12) * s;
    const steps = 10;
    let lx = x;
    let ly = top;
    for (let k = 1; k <= steps; k++) {
      const t = k / steps;
      // up and out, then arching over
      const nx = x + Math.cos(a) * len * t;
      const ny = top + Math.sin(a) * len * t + t * t * len * 0.55;
      line(c, lx, ly, nx, ny, '#6f8f2a', 1);
      const leaf = Math.max(2, Math.round((1 - Math.abs(t - 0.5)) * 6 * s));
      line(c, nx, ny, nx - leaf * 0.6, ny + leaf, '#9cbc3a', 1);
      line(c, nx, ny, nx + leaf * 0.6, ny + leaf, '#86a632', 1);
      lx = nx;
      ly = ny;
    }
  }
  ellipse(c, x, base - 8 * s, 10 * s, 2.5 * s, '#8f897e');
  poly(c, [[x - 10 * s, base - 8 * s], [x + 10 * s, base - 8 * s], [x + 7 * s, base], [x - 7 * s, base]], '#a8a296');
  rect(c, x - 10 * s, base - 8 * s, 20 * s, 1, '#c9c3b6');
}

/** A concrete urn on a pedestal with flowers, as on the median. */
export function urnPlanter(c: Ctx, x: number, base: number): void {
  rect(c, x - 6, base - 5, 12, 5, '#b9b3a6');
  rect(c, x - 2, base - 9, 4, 4, '#a9a396');
  poly(c, [[x - 10, base - 17], [x + 10, base - 17], [x + 6, base - 9], [x - 6, base - 9]], '#c9a385');
  rect(c, x - 11, base - 18, 22, 2, '#d9b597');
  foliage(c, x, base - 21, 9, 4, x, { deep: '#2f5a2a', dark: '#3f7a35', mid: '#4f8a40', lit: '#d64f8a', hi: '#f07ab0' });
}

/** The yellow SLOW DOWN school zone sign on its A-frame. */
export function slowDown(c: Ctx, x: number, base: number): void {
  line(c, x - 6, base, x - 4, base - 26, '#c9c2a8', 1);
  line(c, x + 6, base, x + 4, base - 26, '#c9c2a8', 1);
  rect(c, x - 9, base - 32, 18, 16, '#f2d43a');
  rect(c, x - 9, base - 32, 18, 1, '#fff08a');
  signCentered(c, 'SLOW', x, base - 30, '#1c1c20');
  signCentered(c, 'DOWN', x, base - 24, '#1c1c20');
  rect(c, x - 8, base - 18, 16, 2, '#d8344a');
}

/** Three bins on a frame: yellow, blue and green. */
export function binRack(c: Ctx, x: number, base: number, s = 1): void {
  for (const [i, col] of ['#f0c83a', '#2f5a9e', '#2f8a5a'].entries()) {
    const bx = x + i * Math.round(9 * s);
    rect(c, bx, base - 18 * s, 8 * s, 18 * s, col);
    rect(c, bx, base - 18 * s, 8 * s, 2, shade(col, 0.3));
  }
  rect(c, x - 1, base - 4 * s, 28 * s, 1, '#3a3a40');
}

/** A white table with two monobloc chairs, seen side on. */
export function tableSet(c: Ctx, x: number, base: number): void {
  rect(c, x - 10, base - 14, 20, 2, '#f1efe8');
  rect(c, x - 10, base - 12, 20, 1, '#cfccc4');
  rect(c, x - 8, base - 12, 2, 12, '#e6e3db');
  rect(c, x + 6, base - 12, 2, 12, '#e6e3db');
  for (const s of [-1, 1]) {
    const cx = x + s * 14;
    rect(c, cx - 3, base - 9, 7, 2, '#f4f4f0');
    rect(c, cx + (s > 0 ? 3 : -3), base - 18, 2, 11, '#f4f4f0');
    rect(c, cx - 3, base - 7, 1, 7, '#dcdcd6');
    rect(c, cx + 3, base - 7, 1, 7, '#dcdcd6');
  }
}

/** A tall window into Cafe Juan: the warm room behind the glass, lights hanging inside, the sky caught across the top, a red sill. */
export function cafeWindow(c: Ctx, g: Ctx, x: number, y: number, w: number, h: number, seed: number): void {
  const rand = rng(seed);
  rect(c, x - 2, y - 2, w + 4, h + 4, '#f2efe6');
  // the room: dark wood at the back, warmer towards the floor
  for (let yy = 0; yy < h; yy++) rect(c, x, y + yy, w, 1, yy < h * 0.5 ? '#4a3b31' : '#5e4a3b');
  // hanging lights and their glow
  for (let i = 0; i < 5; i++) {
    const lx = Math.round(x + 3 + rand() * (w - 6));
    const ly = Math.round(y + 4 + rand() * (h * 0.3));
    rect(c, lx, y, 1, ly - y, '#2a221d');
    rect(c, lx - 1, ly, 3, 2, '#ffd88a');
    px(g, lx, ly, '#ffe2a0');
  }
  // tables and chairs, a plant
  for (let k = x + 3; k < x + w - 6; k += 11) {
    rect(c, k, y + h - 10, 7, 2, '#8a6a50');
    rect(c, k + 3, y + h - 8, 1, 6, '#3a2e26');
  }
  // the reflection: a pale band of sky and a darker band of the trees across the glass
  c.globalAlpha = 0.35;
  rect(c, x, y, w, Math.round(h * 0.28), '#cfe1ee');
  rect(c, x, y + Math.round(h * 0.28), w, Math.round(h * 0.1), '#7f9a7a');
  for (let k = 0; k < w; k += 9) rect(c, x + k, y, 3, h, '#ffffff');
  c.globalAlpha = 1;
  // the frame: a transom bar and the mullions
  rect(c, x, y + Math.round(h * 0.4), w, 1, '#f2efe6');
  for (let k = x + Math.round(w / 3); k < x + w - 2; k += Math.round(w / 3)) rect(c, k, y, 1, h, '#f2efe6');
  rect(g, x, y, w, h, 'rgba(255,214,150,0.45)');
  rect(c, x - 2, y + h + 2, w + 4, 4, '#a23a32');
}

/** The BDO cash machine in its blue kiosk. */
export function atm(c: Ctx, g: Ctx, x: number, base: number): void {
  rect(c, x, base - 40, 18, 40, '#1f3f8f');
  rect(c, x, base - 40, 18, 2, '#3f63b8');
  sign(c, 'BDO', x + 3, base - 36, '#f4f4f0');
  rect(c, x + 3, base - 26, 12, 8, '#9aa6b8');
  rect(g, x + 3, base - 26, 12, 8, '#a8d0ff');
  rect(c, x + 4, base - 16, 10, 2, '#1c1c20');
}

/** The student center's tiled ceiling from below, with a fan every so often. */
export function tiledCeiling(c: Ctx, x0: number, x1: number, top: number, bottom: number): void {
  rect(c, x0, top, x1 - x0, bottom - top, '#ecebe5');
  for (let y = top + 6; y < bottom; y += 7) rect(c, x0, y, x1 - x0, 1, '#c9c7bf');
  for (let x = x0; x < x1; x += 22) rect(c, x, top, 1, bottom - top, '#d6d4cc');
  for (let x = x0 + 60; x < x1; x += 140) {
    rect(c, x, bottom - 4, 1, 4, '#9a9890');
    line(c, x - 14, bottom - 1, x + 14, bottom + 1, '#f4f4f0', 1);
    disc(c, x, bottom - 1, 1.5, '#e4e2dc');
  }
  rect(c, x0, bottom, x1 - x0, 3, '#d6d3c9');
}

// --- buildings beyond the lanes -----------------------------------------------------

/**
 * The north-west side of the DJN rising over the student center's flat
 * roof: cream walls, white pilasters and cornices, tall windows.
 */
export function djnSide(c: Ctx, g: Ctx, x0: number, x1: number, base: number, top: number): void {
  rect(c, x0, top, x1 - x0, base - top, P.wall);
  rect(c, x0, top, x1 - x0, 5, P.trim);
  rect(c, x0, top + 5, x1 - x0, 1, P.trimDeep);
  const floors = 3;
  const fh = (base - top - 8) / floors;
  for (let f = 0; f < floors; f++) {
    const y = top + 8 + f * fh;
    rect(c, x0, y + fh - 3, x1 - x0, 2, P.trim);
    for (let x = x0 + 8; x < x1 - 12; x += 22) {
      rect(c, x, y + 4, 9, fh - 10, P.trim);
      rect(c, x + 1, y + 5, 7, fh - 12, P.glass);
      rect(c, x + 1, y + 5, 2, fh - 12, P.glassHi);
      rect(g, x + 2, y + 6, 5, fh - 14, '#ffd98a');
    }
  }
  for (let x = x0 + 2; x < x1; x += 66) rect(c, x, top + 6, 4, base - top - 6, P.wallLit);
}

/**
 * MGN, closing the end of the Main Building side, from its photos: a white
 * block of open corridors, a deep slab and a steel rail on every floor, square
 * columns between the bays, the doors set back in the shade.
 */
export function mgnBlock(c: Ctx, g: Ctx, x0: number, x1: number, base: number, top: number): void {
  const floors = 5;
  const fh = (base - top) / floors;
  rect(c, x0, top, x1 - x0, base - top, '#ecebe6');
  for (let f = 0; f < floors; f++) {
    const y = Math.round(top + f * fh);
    const h = Math.round(fh);
    // the corridor in the shade, its back wall and doors
    rect(c, x0 + 2, y + 5, x1 - x0 - 4, h - 5, '#a9a8a2');
    rect(c, x0 + 2, y + 5, x1 - x0 - 4, 2, '#7d7c78');
    for (let x = x0 + 8; x < x1 - 8; x += 18) {
      rect(c, x, y + 9, 8, h - 10, '#6c6b68');
      rect(g, x + 1, y + 10, 6, h - 12, '#ffd98a');
    }
    // the slab edge and the rail along it
    rect(c, x0, y, x1 - x0, 5, '#f7f7f4');
    rect(c, x0, y + 4, x1 - x0, 1, '#c9c8c2');
    if (f > 0) {
      rect(c, x0, y - 6, x1 - x0, 1, '#8f8e8a');
      for (let x = x0 + 3; x < x1; x += 6) rect(c, x, y - 6, 1, 6, 'rgba(120,120,116,0.6)');
    }
  }
  // the columns between the bays, standing proud
  for (let x = x0; x <= x1 - 5; x += 36) {
    rect(c, x, top, 5, base - top, '#f4f3ef');
    rect(c, x + 4, top, 1, base - top, '#c9c8c2');
  }
  rect(c, x0 - 2, top - 4, x1 - x0 + 4, 4, '#ffffff');
  rect(c, x0, base - 2, x1 - x0, 2, '#9a9993');
}

/** STL's low cream pavilion at the rotunda end, under its hipped roof. */
export function stlPavilion(c: Ctx, g: Ctx, x0: number, x1: number, base: number, top: number): void {
  const w = x1 - x0;
  rect(c, x0, top, w, base - top, '#ece3c4');
  rect(c, x0, top, 3, base - top, '#f6efd8');
  rect(c, x1 - 4, top, 4, base - top, '#cfc4a0');
  for (let x = x0 + 10; x < x1 - 20; x += 30) {
    for (const y of [top + 10, top + Math.round((base - top) / 2) + 4]) {
      rect(c, x - 1, y - 1, 20, 18, '#f8f4e6');
      rect(c, x, y, 18, 16, '#4f5d76');
      rect(c, x, y, 18, 4, '#7d8ca6');
      rect(c, x + 9, y, 1, 16, '#f8f4e6');
      rect(g, x + 1, y + 5, 16, 10, '#ffd98a');
    }
  }
  rect(c, x0, Math.round((top + base) / 2), w, 2, '#d9cf9f');
  // the hipped roof
  rect(c, x0 - 4, top - 2, w + 8, 3, '#c7bc8c');
  for (let i = 0; i < 12; i++) rect(c, x0 + i * 2, top - 3 - i, w - i * 4, 1, i % 3 ? '#d9cf9f' : '#c7bc8c');
}

/** The PGN tower: white floor slabs with rounded ends, bands of blue glass between them. */
export function pgnTower(c: Ctx, g: Ctx, x0: number, x1: number, base: number, top: number): void {
  const floors = 11;
  const fh = (base - top) / floors;
  rect(c, x0, top, x1 - x0, base - top, '#dfe3e8');
  for (let f = 0; f < floors; f++) {
    const y = Math.round(top + f * fh);
    rect(c, x0 + 3, y + 4, x1 - x0 - 6, Math.round(fh) - 6, '#4f78b8');
    for (let x = x0 + 6; x < x1 - 6; x += 7) rect(c, x, y + 4, 1, Math.round(fh) - 6, '#3c5f99');
    rect(g, x0 + 5, y + 5, x1 - x0 - 10, Math.round(fh) - 8, 'rgba(255,217,138,0.6)');
    rect(c, x0 - 2, y, x1 - x0 + 4, 4, '#f7f8f9');
    rect(c, x0 - 2, y + 4, x1 - x0 + 4, 1, '#b9bec5');
  }
  rect(c, x0, top - 8, (x1 - x0) * 0.4, 8, '#c9ced5');
}

/**
 * The PGN podium behind the PGN side's covered walk: white walls in two
 * storeys, tall windows with white frames and pale glass, a maroon line at
 * each floor and pilasters between the bays.
 */
export function pgnPodium(c: Ctx, g: Ctx, x0: number, x1: number, base: number, top: number): void {
  const w = x1 - x0;
  rect(c, x0, top, w, base - top, '#eceae4');
  rect(c, x0 - 2, top - 4, w + 4, 5, '#ffffff');
  rect(c, x0 - 2, top + 1, w + 4, 1, '#bdbab2');
  const mid = Math.round((top + base) / 2);
  rect(c, x0, mid - 2, w, 3, '#8c3a3c');
  for (let x = x0 + 6; x < x1 - 24; x += 32) {
    for (const [y, h] of [[top + 8, mid - top - 14], [mid + 6, base - mid - 14]] as const) {
      rect(c, x - 1, y - 1, 24, h + 2, '#ffffff');
      rect(c, x, y, 22, h, '#7f94a8');
      rect(c, x, y, 22, Math.round(h * 0.35), '#a9bccc');
      rect(c, x + 11, y, 1, h, '#ffffff');
      rect(c, x, y + Math.round(h * 0.5), 22, 1, '#ffffff');
      rect(g, x + 1, y + 1, 20, h - 2, '#ffd98a');
    }
    rect(c, x + 26, top + 2, 3, base - top - 2, '#f6f5f1');
    rect(c, x + 28, top + 2, 1, base - top - 2, '#cfccc4');
  }
  rect(c, x0, base - 3, w, 3, '#bdb9ae');
}

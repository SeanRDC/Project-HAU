// Things that stand along the campus roads: the walkway lamps and flagpoles,
// the rotunda statue, gates, fences and parked cars. Drawn from the reference
// photos in `assets/`.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect } from '../../engine/pix';
import { P, shade } from './palette';
import { foliage } from './props';

const POST = '#1f2a44';
const POST_HI = '#3d4e78';

/**
 * The walkway lamp: a dark blue post with two scrolled arms, a lantern
 * hanging from each. Returns where the two lights sit.
 */
export function twinLamp(c: Ctx, x: number, base: number, h = 84): { x: number; y: number }[] {
  rect(c, x - 4, base - 4, 9, 4, POST);
  rect(c, x - 3, base - 12, 7, 8, POST);
  rect(c, x - 2, base - 14, 5, 2, POST_HI);
  rect(c, x - 1, base - h, 3, h - 14, POST);
  rect(c, x - 1, base - h, 1, h - 14, POST_HI);
  rect(c, x - 2, base - h * 0.5, 5, 2, POST);
  rect(c, x, base - h - 6, 1, 6, POST);
  disc(c, x, base - h - 7, 1.5, POST);
  const lights: { x: number; y: number }[] = [];
  for (const side of [-1, 1]) {
    // the arm curls out and back in on itself
    for (let a = 0; a <= 12; a++) {
      const t = (a / 12) * Math.PI;
      px(c, x + side * (7 - Math.cos(t) * 7), base - h + 4 - Math.sin(t) * 7, POST);
    }
    for (let a = 0; a <= 8; a++) {
      const t = (a / 8) * Math.PI * 1.5;
      px(c, x + side * (10 + Math.cos(t) * 3), base - h + 7 + Math.sin(t) * 3, POST);
    }
    const lx = x + side * 14;
    rect(c, lx, base - h + 4, 1, 3, POST);
    rect(c, lx - 3, base - h + 7, 7, 2, POST);
    rect(c, lx - 2, base - h + 9, 5, 7, '#efe6c8');
    rect(c, lx - 3, base - h + 9, 1, 7, POST);
    rect(c, lx + 3, base - h + 9, 1, 7, POST);
    rect(c, lx - 2, base - h + 16, 5, 1, POST);
    rect(c, lx, base - h + 17, 1, 2, POST);
    lights.push({ x: lx, y: base - h + 12 });
  }
  return lights;
}

/** A flagpole with no flag; the flag itself is drawn each frame so it can wave. */
export function flagpole(c: Ctx, x: number, base: number, h: number): void {
  rect(c, x - 3, base - 5, 7, 5, '#c9a887');
  rect(c, x - 3, base - 6, 7, 1, '#e2c7a8');
  rect(c, x, base - h, 2, h - 5, '#b9bec6');
  rect(c, x, base - h, 1, h - 5, '#e3e6ea');
  disc(c, x + 0.5, base - h - 1, 1.5, P.gold);
}

/** A flag streaming from the top of a pole at (x, y). Call every frame. */
export function wavingFlag(ctx: Ctx, x: number, y: number, time: number, color: string, emblem: string): void {
  const w = 22;
  const h = 13;
  for (let i = 0; i < w; i++) {
    const k = i / w;
    const dy = Math.round(Math.sin(time * 3.2 - i * 0.42 + x * 0.05) * 2.2 * k + k * 2);
    rect(ctx, x + 2 + i, y + dy, 1, h, i % 7 === 3 ? shade(color, -0.18) : color);
    if (i > 7 && i < 15) rect(ctx, x + 2 + i, y + dy + 4, 1, 5, emblem);
  }
}

/** A clipped spiral shrub, the kind that lines the walkway. */
export function topiary(c: Ctx, x: number, base: number, seed: number): void {
  rect(c, x, base - 30, 1, 30, P.trunkDark);
  foliage(c, x, base - 6, 9, 6, seed);
  foliage(c, x + 1, base - 17, 7, 5, seed + 1);
  foliage(c, x, base - 27, 5, 4, seed + 2);
  foliage(c, x, base - 34, 3, 3, seed + 3);
}

/** Brick pillars with iron rails between them. */
export function brickFence(c: Ctx, x0: number, x1: number, base: number): void {
  const brick = '#b56a4c';
  rect(c, x0, base - 5, x1 - x0, 5, '#c9c4b6');
  rect(c, x0, base - 6, x1 - x0, 1, '#e4dfd2');
  for (let x = x0; x < x1; x += 4) rect(c, x, base - 22, 1, 17, P.iron);
  rect(c, x0, base - 22, x1 - x0, 1, P.iron);
  rect(c, x0, base - 14, x1 - x0, 1, P.ironHi);
  for (let x = x0; x <= x1 - 8; x += 44) {
    rect(c, x, base - 26, 8, 26, brick);
    rect(c, x, base - 26, 2, 26, shade(brick, 0.22));
    rect(c, x + 6, base - 26, 2, 26, shade(brick, -0.25));
    for (let by = base - 22; by < base; by += 4) rect(c, x, by, 8, 1, shade(brick, -0.3));
    rect(c, x - 1, base - 28, 10, 2, '#e4dfd2');
  }
}

/** A strip of red hexagonal pavers, x0 to x1, `h` tall from `y` down. */
export function brickPaving(c: Ctx, x0: number, x1: number, y: number, h: number, seed: number): void {
  const rand = rng(seed);
  const brick = '#b0614a';
  rect(c, x0, y, x1 - x0, h, brick);
  rect(c, x0, y, x1 - x0, 1, shade(brick, 0.3));
  for (let row = 0; row * 4 < h; row++) {
    const ry = y + row * 4;
    for (let x = x0 + (row % 2) * 4; x < x1; x += 8) {
      rect(c, x, ry + 1, 1, 3, shade(brick, -0.28));
      if (rand() > 0.8) rect(c, x + 2, ry + 1, 4, 2, rand() > 0.5 ? shade(brick, 0.16) : shade(brick, -0.14));
    }
    if (row) rect(c, x0, ry, x1 - x0, 1, shade(brick, -0.2));
  }
}

/** Yellow zebra stripes across the road, seen at a low angle. */
export function crosswalk(c: Ctx, x: number, y: number, w: number, h: number): void {
  for (let i = 0; i * 7 < h; i++) {
    const sy = y + i * 7;
    // each stripe leans away from the camera a little
    poly(c, [[x - i, sy], [x + w - i, sy], [x + w - i - 1, sy + 4], [x - i - 1, sy + 4]], '#e6c33a');
    rect(c, x - i, sy, w, 1, '#f3da6a');
  }
}

/** A parked car in side view. */
export function car(c: Ctx, x: number, base: number, body: string, facing: 1 | -1 = 1): void {
  const f = (dx: number) => x + dx * facing;
  const bx = Math.min(f(-22), f(22));
  rect(c, bx, base - 13, 44, 9, body);
  rect(c, bx, base - 13, 44, 2, shade(body, 0.3));
  rect(c, bx, base - 5, 44, 1, shade(body, -0.35));
  poly(c, [[f(-14), base - 13], [f(-9), base - 21], [f(10), base - 21], [f(16), base - 13]], body);
  poly(c, [[f(-11), base - 14], [f(-7), base - 20], [f(-1), base - 20], [f(-1), base - 14]], '#3a4a60');
  poly(c, [[f(1), base - 14], [f(1), base - 20], [f(8), base - 20], [f(12), base - 14]], '#52647e');
  rect(c, f(21) - (facing > 0 ? 0 : 2), base - 11, 2, 2, '#fff0b8');
  rect(c, f(-22) - (facing > 0 ? 0 : 1), base - 11, 1, 3, '#b8322e');
  for (const wx of [f(-13), f(13)]) {
    disc(c, wx, base - 4, 4, '#1c1b20');
    disc(c, wx, base - 4, 2, '#8a8d95');
  }
  ellipse(c, x, base, 24, 1.5, 'rgba(20,14,34,0.3)');
}

/**
 * The statue in the rotunda fountain: the Holy Guardian Angel standing behind
 * two children reading a book, in reddish-brown stone, on an eight-sided
 * pedestal with a plaque and a ram's-head spout on each side.
 * `base` is the water line of the basin it stands in.
 */
export function guardianGroup(c: Ctx, x: number, base: number): void {
  const stone = '#a8623f';
  const hi = '#c98356';
  const lo = '#7c432c';
  const deep = '#5a3022';
  // pedestal
  rect(c, x - 22, base - 8, 44, 8, lo);
  rect(c, x - 22, base - 9, 44, 1, hi);
  rect(c, x - 17, base - 34, 34, 26, stone);
  rect(c, x - 17, base - 34, 6, 26, hi);
  rect(c, x + 9, base - 34, 8, 26, lo);
  rect(c, x - 20, base - 38, 40, 4, stone);
  rect(c, x - 20, base - 39, 40, 1, hi);
  rect(c, x - 9, base - 30, 18, 12, '#2c2428');
  rect(c, x - 7, base - 27, 14, 1, P.gold);
  rect(c, x - 7, base - 24, 14, 1, '#8a7a50');
  rect(c, x - 7, base - 21, 10, 1, '#8a7a50');
  // ram's heads that the water pours from
  for (const side of [-1, 1]) {
    rect(c, x + side * 22 - (side < 0 ? 6 : 0), base - 16, 6, 6, lo);
    disc(c, x + side * 26, base - 15, 3, deep);
    px(c, x + side * 27, base - 16, hi);
  }
  const top = base - 39;
  // wings spread behind all three figures
  for (const side of [-1, 1]) {
    poly(c, [[x + side * 3, top - 40], [x + side * 19, top - 52], [x + side * 23, top - 28], [x + side * 15, top - 10], [x + side * 5, top - 18]], lo);
    for (let i = 0; i < 5; i++) line(c, x + side * (18 - i * 3), top - 46 + i * 2, x + side * (20 - i * 3), top - 18 + i, stone, 1);
    line(c, x + side * 3, top - 40, x + side * 19, top - 52, hi, 1);
  }
  // the angel
  poly(c, [[x - 6, top - 38], [x + 6, top - 38], [x + 9, top], [x - 9, top]], stone);
  poly(c, [[x - 6, top - 38], [x - 2, top - 38], [x - 5, top], [x - 9, top]], hi);
  disc(c, x, top - 44, 4.5, stone);
  disc(c, x - 1, top - 45, 2.5, hi);
  rect(c, x - 5, top - 49, 10, 3, lo); // hair
  // arms come down to rest on the children's shoulders
  line(c, x - 6, top - 34, x - 10, top - 22, stone, 2);
  line(c, x + 6, top - 34, x + 10, top - 24, lo, 2);
  // the girl on the left and the boy on the right, sharing a book
  rect(c, x - 14, top - 18, 9, 18, stone);
  rect(c, x - 14, top - 18, 3, 18, hi);
  poly(c, [[x - 15, top - 8], [x - 4, top - 8], [x - 3, top], [x - 16, top]], stone); // skirt
  disc(c, x - 10, top - 22, 3.5, stone);
  disc(c, x - 11, top - 23, 2, hi);
  rect(c, x + 4, top - 22, 9, 22, stone);
  rect(c, x + 10, top - 22, 3, 22, lo);
  disc(c, x + 8, top - 26, 3.5, stone);
  disc(c, x + 7, top - 27, 2, hi);
  rect(c, x - 5, top - 13, 11, 6, hi); // the open book
  rect(c, x, top - 13, 1, 6, deep);
}

/**
 * One side of the Sto. Rosario Gate seen from inside the campus: a carved
 * cream pillar with a cluster of lamps on top. Returns where its light sits.
 */
export function gatePillar(c: Ctx, x: number, base: number): { x: number; y: number } {
  const col = '#e2dccb';
  const hi = '#f3efe2';
  const lo = '#bdb6a2';
  rect(c, x - 9, base - 6, 18, 6, lo);
  rect(c, x - 7, base - 62, 14, 56, col);
  rect(c, x - 7, base - 62, 3, 56, hi);
  rect(c, x + 4, base - 62, 3, 56, lo);
  rect(c, x - 9, base - 66, 18, 4, col);
  rect(c, x - 9, base - 67, 18, 1, hi);
  // the carved panel
  rect(c, x - 3, base - 54, 6, 34, lo);
  disc(c, x, base - 48, 2, hi);
  disc(c, x, base - 38, 2, hi);
  rect(c, x - 1, base - 34, 2, 12, hi);
  // lamps
  rect(c, x, base - 80, 1, 14, P.iron);
  rect(c, x - 6, base - 76, 13, 1, P.iron);
  for (const dx of [-6, 0, 6]) {
    rect(c, x + dx - 1, base - (dx ? 82 : 86), 3, 5, '#efe6c8');
    rect(c, x + dx - 2, base - (dx ? 83 : 87), 5, 1, P.iron);
  }
  return { x, y: base - 80 };
}

/** Black iron gate leaves between two x's. */
export function ironGate(c: Ctx, x0: number, x1: number, base: number): void {
  const mid = (x0 + x1) / 2;
  for (let x = x0; x <= x1; x += 3) {
    const k = 1 - Math.abs(x - mid) / (mid - x0);
    rect(c, x, base - 44 - k * 10, 1, 44 + k * 10, P.iron);
  }
  rect(c, x0, base - 40, x1 - x0, 1, P.iron);
  rect(c, x0, base - 12, x1 - x0, 2, P.iron);
  rect(c, mid, base - 56, 1, 56, P.ironHi);
}

/** A round patterned plaza with a low fountain in the middle, flattened by the low camera. */
export function fountainPlaza(c: Ctx, x: number, cy: number): void {
  ellipse(c, x, cy, 78, 12, '#8d8a92');
  ellipse(c, x, cy, 74, 11, '#b9b4a6');
  ellipse(c, x, cy, 60, 9, '#8d8a92');
  ellipse(c, x, cy, 56, 8, '#c9c4b6');
  for (let a = 0; a < 12; a++) {
    const t = (a / 12) * Math.PI * 2;
    line(c, x + Math.cos(t) * 30, cy + Math.sin(t) * 4, x + Math.cos(t) * 72, cy + Math.sin(t) * 10.5, '#8d8a92', 1);
  }
  ellipse(c, x, cy - 1, 30, 5, P.stoneDark);
  ellipse(c, x, cy - 2, 30, 5, P.stoneHi);
  ellipse(c, x, cy - 2, 26, 4, '#2c4863');
  ellipse(c, x, cy - 3, 26, 3.5, P.water);
  ellipse(c, x - 4, cy - 4, 12, 1.5, '#517b9e');
  rect(c, x - 2, cy - 12, 5, 9, P.stone);
  ellipse(c, x, cy - 12, 6, 1.5, P.stoneHi);
}

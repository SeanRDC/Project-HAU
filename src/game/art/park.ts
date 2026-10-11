// Pieces for the Epiphany of Angels park and the covered walk beside it.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect } from '../../engine/pix';
import { P, shade } from './palette';
import { Tones } from './props';

const STONE = '#d8d3c8';
const STONE_HI = '#f1eee6';
const STONE_DARK = '#a9a498';
const STONE_DEEP = '#827d74';

/** The shrubs along the walk have red new growth on top. */
export const RED_TIP: Tones = { deep: '#254a2d', dark: '#33693a', mid: '#4f8a43', lit: '#c0643c', hi: '#e58f4e' };

/** White stone angel. `variant` changes the pose so the row doesn't look stamped. */
export function stoneAngel(c: Ctx, x: number, base: number, variant: number): void {
  const flip = variant % 2 ? -1 : 1;
  const top = base - 46;
  // wings
  for (const side of [-1, 1]) {
    poly(c, [[x + side * 3, top + 12], [x + side * 15, top + 4], [x + side * 17, top + 24], [x + side * 10, top + 36], [x + side * 4, top + 30]], side === flip ? STONE : STONE_DARK);
    for (let i = 0; i < 4; i++) line(c, x + side * (13 - i * 2), top + 8 + i * 2, x + side * (14 - i * 2), top + 28 + i, STONE_DARK, 1);
    line(c, x + side * 3, top + 12, x + side * 15, top + 4, STONE_HI, 1);
  }
  // robe, lit from the upper left
  poly(c, [[x - 4, top + 11], [x + 4, top + 11], [x + 8, base], [x - 8, base]], STONE);
  poly(c, [[x - 4, top + 11], [x - 1, top + 11], [x - 4, base], [x - 8, base]], STONE_HI);
  poly(c, [[x + 2, top + 11], [x + 4, top + 11], [x + 8, base], [x + 4, base]], STONE_DARK);
  line(c, x - 1, top + 20, x - 2, base - 1, STONE_DARK, 1);
  line(c, x + 2, top + 24, x + 3, base - 1, STONE_DEEP, 1);
  rect(c, x - 5, top + 22, 10, 1, STONE_DARK); // sash
  // head
  disc(c, x, top + 7, 3.5, STONE);
  disc(c, x - 1, top + 6, 2, STONE_HI);
  rect(c, x - 4, top + 3, 8, 2, STONE_DARK); // hair
  // arms
  switch (variant % 4) {
    case 0: // pointing to heaven
      line(c, x + flip * 4, top + 13, x + flip * 9, top + 2, STONE, 2);
      line(c, x - flip * 4, top + 13, x - flip * 6, top + 24, STONE_DARK, 2);
      break;
    case 1: // hands together
      line(c, x - 4, top + 13, x, top + 19, STONE, 2);
      line(c, x + 4, top + 13, x, top + 19, STONE_DARK, 2);
      break;
    case 2: // holding a staff
      line(c, x + flip * 4, top + 13, x + flip * 8, top + 20, STONE, 2);
      rect(c, x + flip * 8, top - 2, 1, 46, STONE_DEEP);
      line(c, x - flip * 4, top + 13, x - flip * 5, top + 23, STONE_DARK, 2);
      break;
    default: // arms open
      line(c, x - 4, top + 13, x - 10, top + 20, STONE_HI, 2);
      line(c, x + 4, top + 13, x + 10, top + 20, STONE_DARK, 2);
      break;
  }
}

/** Cream stone pedestal with a dark bronze plaque. */
export function pedestal(c: Ctx, x: number, base: number): void {
  const col = '#e2dccb';
  const hi = '#f3efe2';
  const dark = '#bdb6a2';
  rect(c, x - 19, base - 5, 38, 5, dark);
  rect(c, x - 19, base - 6, 38, 1, hi);
  rect(c, x - 16, base - 10, 32, 4, col);
  rect(c, x - 14, base - 40, 28, 30, col);
  rect(c, x - 14, base - 40, 4, 30, hi);
  rect(c, x + 9, base - 40, 5, 30, dark);
  rect(c, x - 17, base - 45, 34, 5, col);
  rect(c, x - 17, base - 46, 34, 1, hi);
  rect(c, x - 17, base - 41, 34, 1, dark);
  rect(c, x - 8, base - 36, 16, 20, '#3c3a3c');
  rect(c, x - 8, base - 36, 16, 1, '#5a585a');
  for (let i = 0; i < 6; i++) rect(c, x - 6, base - 33 + i * 3, 12 - (i % 3) * 2, 1, '#8a8478');
}

/** Stone bench on carved scroll legs. */
export function scrollBench(c: Ctx, x: number, base: number, w = 34): void {
  rect(c, x, base - 11, w, 3, STONE_HI);
  rect(c, x, base - 8, w, 1, STONE_DARK);
  for (const lx of [x + 4, x + w - 10]) {
    rect(c, lx, base - 7, 6, 7, STONE);
    rect(c, lx - 1, base - 7, 8, 2, STONE);
    rect(c, lx - 1, base - 2, 8, 2, STONE_DARK);
    px(c, lx + 2, base - 4, STONE_DEEP);
    px(c, lx + 3, base - 5, STONE_DEEP);
  }
}

/** Tall post whose top curls over like a shepherd's crook, lantern hanging from the end. */
export function crookLamp(c: Ctx, x: number, base: number, h = 78): { x: number; y: number } {
  const iron = '#5a3d30';
  const hi = '#7d5846';
  rect(c, x - 2, base - 4, 5, 4, iron);
  rect(c, x - 1, base - h, 2, h - 4, iron);
  rect(c, x - 1, base - h, 1, h - 4, hi);
  // the curl
  const cx = x - 8;
  for (let a = 0; a <= 10; a++) {
    const t = (a / 10) * Math.PI;
    px(c, cx + Math.cos(t) * 8, base - h - Math.sin(t) * 8, iron);
    px(c, cx + Math.cos(t) * 8, base - h - Math.sin(t) * 8 + 1, iron);
  }
  const lx = cx - 8;
  rect(c, lx, base - h, 1, 4, iron);
  rect(c, lx - 2, base - h + 4, 5, 2, iron);
  rect(c, lx - 2, base - h + 6, 5, 6, '#efe6c8');
  rect(c, lx - 2, base - h + 6, 1, 6, iron);
  rect(c, lx + 2, base - h + 6, 1, 6, iron);
  rect(c, lx - 1, base - h + 12, 3, 1, iron);
  return { x: lx, y: base - h + 9 };
}

/** Covered walk: orange block pillars holding up a white slatted roof. */
export function pergola(c: Ctx, x: number, base: number, bays: number, bay = 62): void {
  const h = 64;
  const w = bays * bay;
  // roof, seen slightly from below
  poly(c, [[x - 10, base - h], [x + w + 10, base - h], [x + w + 22, base - h - 16], [x + 2, base - h - 16]], '#eeece6');
  for (let sx = x - 6; sx < x + w + 12; sx += 5) line(c, sx, base - h - 1, sx + 11, base - h - 15, '#c9c6be', 1);
  rect(c, x + 2, base - h - 17, w + 20, 2, '#ffffff');
  rect(c, x - 10, base - h, w + 20, 3, '#ffffff');
  rect(c, x - 10, base - h + 3, w + 20, 1, '#b8b5ae');
  for (let i = 0; i <= bays; i++) {
    const px0 = x + i * bay - 6;
    rect(c, px0 + 4, base - h + 4, 4, 8, '#f4f2ec'); // white post on top of the pillar
    rect(c, px0, base - h + 12, 12, h - 12, '#e39a6c');
    rect(c, px0, base - h + 12, 3, h - 12, '#f0b185');
    rect(c, px0 + 9, base - h + 12, 3, h - 12, '#c47d54');
    for (let by = base - h + 24; by < base; by += 12) rect(c, px0, by, 12, 1, '#b8734c');
  }
}

/** Bamboo clump against a wall. */
export function bamboo(c: Ctx, x: number, base: number, h: number, seed: number): void {
  const rand = rng(seed);
  for (let i = 0; i < 7; i++) {
    const bx = x + (i - 3) * 3 + rand() * 2;
    const top = base - h * (0.7 + rand() * 0.3);
    const lean = (rand() - 0.5) * 8;
    line(c, bx, base, bx + lean, top, i % 2 ? '#b9b45a' : '#9aa24a', 1);
    for (let k = 0; k < 6; k++) {
      const t = 0.35 + rand() * 0.65;
      const lx = bx + lean * t;
      const ly = base + (top - base) * t;
      const dir = rand() > 0.5 ? 1 : -1;
      line(c, lx, ly, lx + dir * (3 + rand() * 4), ly + 2 + rand() * 3, rand() > 0.5 ? P.leaf : P.leafLit, 1);
    }
  }
}

/** The Memorare stone and the old tree stump beside it. */
export function memorare(c: Ctx, x: number, base: number): void {
  // weathered stump with spreading roots
  const bark = '#7b6a58';
  const barkHi = '#9c8973';
  const barkDark = '#55483c';
  const sx = x - 44;
  poly(c, [[sx - 9, base - 8], [sx + 11, base - 8], [sx + 7, base - 52], [sx + 2, base - 58], [sx - 3, base - 50], [sx - 6, base - 54]], bark);
  poly(c, [[sx - 9, base - 8], [sx - 3, base - 8], [sx - 4, base - 50], [sx - 6, base - 54]], barkHi);
  for (let i = 0; i < 6; i++) line(c, sx - 4 + i * 2, base - 46 + (i % 2) * 6, sx - 5 + i * 3, base - 8, barkDark, 1);
  for (const [dx, len] of [[-26, 5], [-16, 7], [-6, 9], [8, 8], [18, 6], [26, 4]] as const) {
    line(c, sx + Math.sign(dx) * 4, base - 12, sx + dx, base - 1, bark, len > 6 ? 4 : 3);
    line(c, sx + Math.sign(dx) * 4, base - 13, sx + dx, base - 3, barkHi, 1);
  }
  ellipse(c, sx, base, 30, 2, shade(P.grass, -0.2));
  // the marker: grey stone with a white-bordered plaque
  poly(c, [[x - 14, base], [x + 16, base], [x + 15, base - 50], [x - 11, base - 48]], '#8d9399');
  poly(c, [[x - 14, base], [x - 9, base], [x - 7, base - 48], [x - 11, base - 48]], '#a7adb2');
  poly(c, [[x + 11, base], [x + 16, base], [x + 15, base - 50], [x + 11, base - 50]], '#70767c');
  rect(c, x - 6, base - 42, 17, 22, '#f0eee8');
  rect(c, x - 5, base - 41, 15, 20, '#2f3136');
  rect(c, x - 2, base - 39, 9, 1, '#c9c6bd');
  for (let i = 0; i < 6; i++) rect(c, x - 3, base - 36 + i * 2.5, 11 - (i % 2) * 2, 1, '#8b8983');
}

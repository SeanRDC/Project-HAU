// Pixel drawing helpers. Canvas path drawing anti-aliases everything, so the
// art code uses these instead: everything here ends up as whole-pixel rects.

import { Ctx, makeCanvas } from './display';

export function rect(ctx: Ctx, x: number, y: number, w: number, h: number, c: string): void {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function px(ctx: Ctx, x: number, y: number, c: string): void {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

export function ellipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, c: string): void {
  ctx.fillStyle = c;
  for (let dy = -Math.floor(ry); dy <= Math.floor(ry); dy++) {
    const t = 1 - (dy * dy) / (ry * ry + ry * 0.6);
    if (t <= 0) continue;
    const half = Math.round(rx * Math.sqrt(t));
    ctx.fillRect(Math.round(cx) - half, Math.round(cy) + dy, half * 2 + 1, 1);
  }
}

export function disc(ctx: Ctx, cx: number, cy: number, r: number, c: string): void {
  ellipse(ctx, cx, cy, r, r, c);
}

/** Bresenham line, optionally thick. */
export function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, c: string, w = 1): void {
  ctx.fillStyle = c;
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  const o = Math.floor(w / 2);
  for (;;) {
    ctx.fillRect(x0 - o, y0 - o, w, w);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/** Scanline polygon fill (even-odd). Points are [x, y] pairs. */
export function poly(ctx: Ctx, pts: [number, number][], c: string): void {
  ctx.fillStyle = c;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of pts) {
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  for (let y = Math.round(minY); y <= Math.round(maxY); y++) {
    const xs: number[] = [];
    const sy = y + 0.5;
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= sy && by > sy) || (by <= sy && ay > sy)) {
        xs.push(ax + ((sy - ay) / (by - ay)) * (bx - ax));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const xa = Math.round(xs[i]);
      const xb = Math.round(xs[i + 1]);
      if (xb > xa) ctx.fillRect(xa, y, xb - xa, 1);
    }
  }
}

// --- tiny 3x5 font for in-world signs --------------------------------------

const GLYPHS: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100110101010', '7': '111001010010010',
  '8': '010101010101010', '9': '010101011001110',
  '.': '000000000000010', '-': '000000111000000', ':': '000010000010000', '!': '010010010000010',
  '/': '001001010100100',
};

export function signWidth(text: string, scale = 1): number {
  return (text.length * 4 - 1) * scale;
}

/** Draws uppercase text with the 3x5 sign font. x, y is the top-left corner. */
export function sign(ctx: Ctx, text: string, x: number, y: number, c: string, scale = 1): void {
  ctx.fillStyle = c;
  let cx = Math.round(x);
  for (const ch of text.toUpperCase()) {
    const g = GLYPHS[ch];
    if (g) {
      for (let i = 0; i < 15; i++) {
        if (g[i] === '1') ctx.fillRect(cx + (i % 3) * scale, Math.round(y) + Math.floor(i / 3) * scale, scale, scale);
      }
    }
    cx += 4 * scale;
  }
}

export function signCentered(ctx: Ctx, text: string, cx: number, y: number, c: string, scale = 1): void {
  sign(ctx, text, Math.round(cx - signWidth(text, scale) / 2), y, c, scale);
}

// --- mask tinting ----------------------------------------------------------

let scratch: HTMLCanvasElement | null = null;
let sctx: Ctx | null = null;

/**
 * Returns a shared scratch canvas holding `src` recoloured to a flat colour
 * (alpha preserved). Used for silhouettes and clouds whose colour depends on
 * the time of day. The result is only valid until the next call.
 */
export function tinted(src: HTMLCanvasElement, color: string): HTMLCanvasElement {
  if (!scratch || scratch.width < src.width || scratch.height < src.height) {
    [scratch, sctx] = makeCanvas(Math.max(src.width, scratch?.width ?? 0), Math.max(src.height, scratch?.height ?? 0));
  }
  const c = sctx!;
  c.globalCompositeOperation = 'source-over';
  c.clearRect(0, 0, scratch.width, scratch.height);
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = color;
  c.fillRect(0, 0, src.width, src.height);
  c.globalCompositeOperation = 'source-over';
  return scratch;
}

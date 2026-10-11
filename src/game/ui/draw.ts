// UI drawing helpers. Unlike the world, the UI is drawn at the screen's real
// resolution (the context is pre-scaled), so text here is smooth on purpose.

import { Ctx } from '../../engine/display';

export const SANS = '"Segoe UI", "Helvetica Neue", system-ui, sans-serif';
export const SERIF = 'Georgia, "Times New Roman", serif';

export const INK = '#2a2030';
export const PAPER = '#fbf5e6';
export const MAROON = '#7c1f2c';
export const GOLD = '#e3b33b';

export function font(ctx: Ctx, size: number, weight = 500, family = SANS, italic = false): void {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  ctx.textBaseline = 'top';
}

export function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let lineText = '';
    for (const word of para.split(' ')) {
      const next = lineText ? `${lineText} ${word}` : word;
      if (lineText && ctx.measureText(next).width > maxWidth) {
        out.push(lineText);
        lineText = word;
      } else {
        lineText = next;
      }
    }
    out.push(lineText);
  }
  return out;
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

/** Small keyboard key, e.g. the E in "E  Kausapin". Returns its width. */
export function keyCap(ctx: Ctx, key: string, x: number, y: number): number {
  font(ctx, 5.5, 700);
  const w = Math.max(9, ctx.measureText(key).width + 5);
  roundRect(ctx, x, y + 1, w, 9, 2, 'rgba(0,0,0,0.25)');
  roundRect(ctx, x, y, w, 9, 2, PAPER);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText(key, x + w / 2, y + 1.6);
  ctx.textAlign = 'left';
  return w;
}

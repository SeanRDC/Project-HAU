// Screen-space light map. The scene is drawn at full brightness, then this
// buffer (ambient colour plus soft blobs for every light) is multiplied over
// it. A second additive pass gives lamps a bit of bloom.

import { Ctx, VIEW_H, VIEW_W, makeCanvas } from './display';
import { RGB, css } from './math';

interface Blob {
  x: number;
  y: number;
  r: number;
  color: RGB;
  a: number;
}

export class LightMap {
  private canvas: HTMLCanvasElement;
  private ctx: Ctx;
  private blobs: Blob[] = [];
  private baked: { img: HTMLCanvasElement; x: number; a: number } | null = null;

  constructor() {
    [this.canvas, this.ctx] = makeCanvas(VIEW_W, VIEW_H);
  }

  begin(ambient: RGB): void {
    this.blobs.length = 0;
    this.baked = null;
    const c = this.ctx;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = css(ambient);
    c.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  /** x, y in screen pixels. `a` is 0..1. */
  add(x: number, y: number, r: number, color: RGB, a: number): void {
    if (a <= 0.01 || x + r < 0 || x - r > VIEW_W) return;
    this.blobs.push({ x, y, r, color, a });
  }

  private paint(c: Ctx, strength: number, shrink: number): void {
    c.globalCompositeOperation = 'lighter';
    for (const b of this.blobs) {
      const r = b.r * shrink;
      const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, css(b.color, b.a * strength));
      g.addColorStop(0.45, css(b.color, b.a * strength * 0.45));
      g.addColorStop(1, css(b.color, 0));
      c.fillStyle = g;
      c.fillRect(b.x - r, b.y - r, r * 2, r * 2);
    }
    c.globalCompositeOperation = 'source-over';
  }

  /**
   * Light that was worked out once, ahead of time, drawn in at `x` (world to
   * screen) and faded by `a`: the spill round a scene's lit windows, say. It
   * goes into the light map only, no bloom.
   */
  addBaked(img: HTMLCanvasElement, x: number, a: number): void {
    if (a > 0.01) this.baked = { img, x, a };
  }

  /** Multiply the light map over `target`, then add bloom. */
  apply(target: Ctx, bloom = 0.22): void {
    if (this.baked) {
      const c = this.ctx;
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = this.baked.a;
      c.drawImage(this.baked.img, this.baked.x, 0);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    }
    this.paint(this.ctx, 1, 1);
    target.globalCompositeOperation = 'multiply';
    target.drawImage(this.canvas, 0, 0);
    target.globalCompositeOperation = 'source-over';
    if (bloom > 0) this.paint(target, bloom, 0.55);
  }
}

let vignette: HTMLCanvasElement | null = null;

/** Darkened corners, drawn once and reused. */
export function drawVignette(target: Ctx, strength = 1): void {
  if (!vignette) {
    const [c, ctx] = makeCanvas(VIEW_W, VIEW_H);
    const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H * 0.52, VIEW_H * 0.45, VIEW_W / 2, VIEW_H * 0.52, VIEW_W * 0.72);
    g.addColorStop(0, 'rgba(20,10,35,0)');
    g.addColorStop(1, 'rgba(20,10,35,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    vignette = c;
  }
  target.globalAlpha = strength;
  target.drawImage(vignette, 0, 0);
  target.globalAlpha = 1;
}

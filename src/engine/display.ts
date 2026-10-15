// The game renders to a small fixed-size buffer and scales it up with
// nearest-neighbour so the pixel art stays crisp. UI text is drawn after the
// upscale at native resolution so it stays readable.
//
// The buffer itself is DETAIL times the 480x270 view, and the scene is drawn
// into it scaled by DETAIL, so all the drawing code still works in 480x270
// coordinates and a game pixel is a DETAIL x DETAIL block. The extra detail is
// for the students' sprite sheets, which are drawn at half a game pixel per
// pixel so every pixel of them shows.

export const VIEW_W = 480;
export const VIEW_H = 270;
/** buffer pixels per game pixel */
export const DETAIL = 2;

export type Ctx = CanvasRenderingContext2D;

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

export class Display {
  readonly canvas: HTMLCanvasElement;
  readonly screen: Ctx;
  readonly buffer: HTMLCanvasElement;
  readonly ctx: Ctx;
  scale = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.screen = canvas.getContext('2d')!;
    [this.buffer, this.ctx] = makeCanvas(VIEW_W * DETAIL, VIEW_H * DETAIL);
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const fit = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
    // integer scale in device pixels keeps every game pixel the same size
    this.scale = Math.max(1, Math.floor(fit * dpr));
    this.canvas.width = VIEW_W * this.scale;
    this.canvas.height = VIEW_H * this.scale;
    this.canvas.style.width = `${(VIEW_W * this.scale) / dpr}px`;
    this.canvas.style.height = `${(VIEW_H * this.scale) / dpr}px`;
  }

  /** The scene context, scaled so drawing code keeps using 480x270 coordinates. */
  frame(): Ctx {
    this.ctx.setTransform(DETAIL, 0, 0, DETAIL, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    return this.ctx;
  }

  /** Blit the low-res buffer to the screen. */
  present(): void {
    const s = this.screen;
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.imageSmoothingEnabled = false;
    s.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);
  }

  /** Screen context scaled so UI code can keep using 480x270 coordinates. */
  ui(): Ctx {
    const s = this.screen;
    s.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    s.imageSmoothingEnabled = true;
    return s;
  }
}

// Traffic on the street outside the gate. Each vehicle is drawn once onto
// its own little canvas, facing right; the scene then slides them past,
// bigger and faster in the lane nearer the camera, so the street has depth.

import { Ctx, makeCanvas } from '../../engine/display';
import { disc, poly, rect } from '../../engine/pix';
import { P, shade } from './palette';
import { tricycle } from './props';
import { car } from './street';

export type VehicleKind = 'car' | 'suv' | 'jeepney' | 'tricycle' | 'pickup';

export interface Sprite {
  canvas: HTMLCanvasElement;
  /** where the headlight sits, from the sprite's left edge and its bottom, when it faces right */
  lamp: [number, number];
}

function wheel(c: Ctx, x: number, base: number, r = 4): void {
  disc(c, x, base - r, r, '#1c1b20');
  disc(c, x, base - r, r - 2, '#8a8d95');
}

/** A jeepney: long body, a stripe down the side, open windows, the roof rack, a chrome nose. */
function jeepney(c: Ctx, base: number, body: string): void {
  const lo = shade(body, -0.3);
  // body and roof
  rect(c, 4, base - 17, 50, 12, body);
  rect(c, 4, base - 17, 50, 2, shade(body, 0.3));
  rect(c, 4, base - 6, 50, 1, lo);
  rect(c, 6, base - 29, 46, 3, '#e9e6de');
  rect(c, 6, base - 26, 46, 1, '#b9b6ae');
  rect(c, 10, base - 32, 36, 1, '#8a8d95');
  for (let x = 10; x < 47; x += 6) rect(c, x, base - 32, 1, 3, '#8a8d95');
  // open side windows, passengers' heads in them
  rect(c, 8, base - 25, 42, 8, '#2a2c36');
  for (let x = 8; x <= 50; x += 7) rect(c, x, base - 26, 1, 9, '#e9e6de');
  for (const [x, col] of [[12, '#c99468'], [19, '#b8825a'], [33, '#d9a878'], [40, '#c99468']] as const) {
    disc(c, x, base - 20, 2, col);
    rect(c, x - 2, base - 23, 5, 2, '#241a18');
  }
  // the painted stripe and the route board
  rect(c, 4, base - 12, 50, 2, P.gold);
  rect(c, 4, base - 10, 50, 1, '#c8342f');
  rect(c, 22, base - 16, 18, 3, '#f4f1ea');
  // the nose: windscreen, long bonnet, chrome grille and the horse on top
  poly(c, [[50, base - 26], [56, base - 26], [60, base - 17], [50, base - 17]], '#55657c');
  rect(c, 54, base - 17, 9, 12, body);
  rect(c, 54, base - 17, 9, 2, shade(body, 0.3));
  rect(c, 62, base - 15, 2, 9, '#cfd3d8');
  rect(c, 62, base - 13, 2, 1, '#8a8d95');
  rect(c, 62, base - 10, 2, 1, '#8a8d95');
  rect(c, 59, base - 19, 3, 2, '#cfd3d8');
  rect(c, 63, base - 12, 1, 3, '#fff0b8');
  rect(c, 3, base - 12, 1, 4, '#b8322e');
  // the step at the back
  rect(c, 1, base - 7, 4, 2, '#55585f');
  wheel(c, 16, base);
  wheel(c, 52, base);
}

/** A taller, boxier car: the SUVs and vans that drop students off. */
function suv(c: Ctx, base: number, body: string): void {
  rect(c, 2, base - 16, 48, 12, body);
  rect(c, 2, base - 16, 48, 2, shade(body, 0.3));
  rect(c, 2, base - 5, 48, 1, shade(body, -0.35));
  poly(c, [[5, base - 16], [8, base - 26], [36, base - 26], [42, base - 16]], body);
  rect(c, 8, base - 27, 28, 1, shade(body, 0.3));
  rect(c, 10, base - 24, 11, 8, '#3a4a60');
  poly(c, [[23, base - 16], [23, base - 24], [34, base - 24], [39, base - 16]], '#52647e');
  rect(c, 49, base - 13, 2, 3, '#fff0b8');
  rect(c, 2, base - 13, 1, 4, '#b8322e');
  wheel(c, 13, base, 5);
  wheel(c, 40, base, 5);
}

/**
 * A red double-cab Chevrolet pickup, from the photo in `assets/`: black
 * bonnet stripe, black roof rails and wheels, a dark splash of decal down the
 * rear door, the gold bowtie on the nose and the sports bar behind the cab.
 */
function pickup(c: Ctx, base: number, body: string): void {
  const lo = shade(body, -0.3);
  const hi = shade(body, 0.3);
  const black = '#1f1f25';
  // the bed, the cab and the bonnet
  rect(c, 2, base - 19, 24, 12, body);
  rect(c, 2, base - 19, 24, 2, hi);
  rect(c, 24, base - 19, 30, 12, body);
  rect(c, 52, base - 18, 18, 11, body);
  rect(c, 52, base - 18, 18, 2, black);
  rect(c, 2, base - 8, 68, 1, lo);
  poly(c, [[25, base - 19], [28, base - 30], [47, base - 30], [54, base - 19]], body);
  rect(c, 28, base - 31, 19, 1, black);
  rect(c, 27, base - 32, 2, 1, black);
  rect(c, 45, base - 32, 2, 1, black);
  // windows, dark tint
  rect(c, 29, base - 28, 8, 8, '#2a3040');
  poly(c, [[39, base - 20], [39, base - 28], [46, base - 28], [51, base - 20]], '#3a4458');
  rect(c, 37, base - 28, 2, 9, body);
  rect(c, 52, base - 22, 3, 3, black);
  // sports bar and the tailgate
  poly(c, [[20, base - 19], [23, base - 26], [26, base - 26], [26, base - 19]], black);
  rect(c, 1, base - 18, 2, 10, lo);
  rect(c, 1, base - 16, 1, 4, '#ffb0a0');
  // the decal sweeping down the rear door, the side step, the door handles
  poly(c, [[30, base - 9], [36, base - 18], [39, base - 18], [34, base - 9]], black);
  poly(c, [[26, base - 9], [30, base - 15], [32, base - 15], [29, base - 9]], black);
  rect(c, 26, base - 7, 26, 2, '#55585f');
  rect(c, 35, base - 17, 3, 1, black);
  rect(c, 47, base - 17, 3, 1, black);
  // the nose: grille, headlight, the bowtie, the bumper
  rect(c, 69, base - 17, 2, 9, black);
  rect(c, 66, base - 16, 4, 3, '#eef2f6');
  rect(c, 70, base - 13, 1, 2, P.gold);
  rect(c, 66, base - 9, 5, 3, lo);
  // wheel arches and black wheels
  for (const wx of [14, 58]) {
    disc(c, wx, base - 6, 7, black);
    disc(c, wx, base - 5, 5, '#111114');
    disc(c, wx, base - 5, 3, '#34343c');
    disc(c, wx, base - 5, 1, '#111114');
  }
}

/** Draws one vehicle facing right onto its own canvas. */
export function vehicleSprite(kind: VehicleKind, body: string): Sprite {
  const size: Record<VehicleKind, [number, number]> = {
    car: [50, 24], suv: [54, 30], jeepney: [66, 34], tricycle: [50, 30], pickup: [74, 34],
  };
  const [w, h] = size[kind];
  const [canvas, c] = makeCanvas(w, h);
  switch (kind) {
    case 'car':
      car(c, 25, h - 1, body);
      return { canvas, lamp: [47, 11] };
    case 'suv':
      suv(c, h - 1, body);
      return { canvas, lamp: [50, 13] };
    case 'jeepney':
      jeepney(c, h - 1, body);
      return { canvas, lamp: [63, 12] };
    case 'pickup':
      pickup(c, h - 1, body);
      return { canvas, lamp: [68, 15] };
    case 'tricycle': {
      // the stock tricycle faces left, so turn it round
      const [tmp, t] = makeCanvas(w, h);
      tricycle(t, 12, h - 1, body);
      c.translate(w, 0);
      c.scale(-1, 1);
      c.drawImage(tmp, 0, 0);
      return { canvas, lamp: [49, 16] };
    }
  }
}

/**
 * Puts a sprite on the road with its middle at `x` and its wheels on `base`,
 * `scale` times its drawn size, facing the way it is going.
 */
export function drawVehicle(ctx: Ctx, s: Sprite, x: number, base: number, scale: number, dir: 1 | -1): void {
  const w = Math.round(s.canvas.width * scale);
  const h = Math.round(s.canvas.height * scale);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(base - h));
  if (dir < 0) ctx.scale(-1, 1);
  ctx.drawImage(s.canvas, -Math.round(w / 2), 0, w, h);
  ctx.restore();
}

/** Where the headlight of a vehicle drawn with `drawVehicle` ends up on screen. */
export function lampAt(s: Sprite, x: number, base: number, scale: number, dir: 1 | -1): [number, number] {
  return [x + dir * (s.lamp[0] - s.canvas.width / 2) * scale, base - s.lamp[1] * scale];
}

// Shared pieces for the campus street scenes: the backdrop layers, the road
// under your feet, lamps, drifting leaves. The older scenes each carry their
// own copy of these; new streets should use this instead.

import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, line, poly, px, rect } from '../../engine/pix';
import { P, shade } from '../art/palette';
import { SILHOUETTE, bush, foliage, lampPost, tree } from '../art/props';
import { brickPaving } from '../art/street';
import { AreaLight, AreaRuntime, AreaView, Layer } from '../types';

export const GROUND = 206;
export const WALK = 242;

const MID = 0.45;
const FAR = 0.16;
const FRONT = 1.35;

export function layerWidth(width: number, parallax: number): number {
  return Math.ceil(VIEW_W + (width - VIEW_W) * parallax) + 4;
}

/** Where to draw something in a parallax layer so it sits behind scene x when you stand in front of it. */
export function behind(x: number, parallax = MID): number {
  return VIEW_W / 2 + (x - VIEW_W / 2) * parallax;
}

/** Rooftops and the tree line of Angeles City, far beyond the campus wall. */
export function farCity(width: number, seed: number): Layer {
  const [canvas, c] = makeCanvas(layerWidth(width, FAR), VIEW_H);
  const rand = rng(seed);
  for (let x = -10; x < canvas.width; x += 26 + rand() * 34) {
    const h = 14 + rand() * 44;
    const w = 24 + rand() * 26;
    rect(c, x, GROUND - h, w, h, rand() > 0.5 ? '#b9a48f' : '#a7a2a8');
    if (h < 30) poly(c, [[x - 3, GROUND - h], [x + w + 3, GROUND - h], [x + w / 2, GROUND - h - 8]], '#a0584a');
    else for (let wy = GROUND - h + 5; wy < GROUND - 6; wy += 8) for (let wx = x + 3; wx < x + w - 4; wx += 6) rect(c, wx, wy, 3, 4, '#7d8698');
  }
  for (let x = -20; x < canvas.width; x += 16 + rand() * 20) {
    foliage(c, x, GROUND - 8 - rand() * 14, 14 + rand() * 10, 10 + rand() * 8, seed * 7 + x, {
      deep: '#31543f', dark: '#3b6347', mid: '#48754f', lit: '#5a8a5a', hi: '#6b9a62',
    });
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, '#3b6347');
  return { canvas, parallax: FAR, haze: 0.6 };
}

/** A campus building seen over the top of the nearer ones. `x` is the scene x it stands behind. */
export interface Distant {
  x: number;
  w: number;
  h: number;
  wall: string;
  glass?: string;
  /** a tiled roof colour, for the older low buildings */
  roof?: string;
}

/** Other campus buildings further back, with trees between them. */
export function midCampus(width: number, seed: number, blocks: Distant[]): Layer {
  const [canvas, c] = makeCanvas(layerWidth(width, MID), VIEW_H);
  const rand = rng(seed);
  for (const b of blocks) {
    const x = Math.round(behind(b.x) - b.w / 2);
    const glass = b.glass ?? '#56627a';
    rect(c, x, GROUND - b.h, b.w, b.h, b.wall);
    rect(c, x, GROUND - b.h, b.w, 3, shade(b.wall, 0.35));
    rect(c, x + b.w - 8, GROUND - b.h, 8, b.h, shade(b.wall, -0.2));
    for (let wy = GROUND - b.h + 9; wy < GROUND - 12; wy += 14) {
      rect(c, x + 4, wy, b.w - 16, 7, glass);
      for (let wx = x + 4; wx < x + b.w - 12; wx += 9) rect(c, wx, wy, 1, 7, shade(b.wall, -0.1));
    }
    if (b.roof) {
      poly(c, [[x - 4, GROUND - b.h], [x + b.w + 4, GROUND - b.h], [x + b.w - 8, GROUND - b.h - 9], [x + 8, GROUND - b.h - 9]], b.roof);
      rect(c, x - 4, GROUND - b.h, b.w + 8, 1, shade(b.roof, -0.3));
    }
  }
  for (let x = -10; x < canvas.width; x += 46 + rand() * 60) {
    tree(c, x, GROUND + 2, 46 + rand() * 30, 17 + rand() * 9, seed * 3 + Math.round(x));
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, P.grassDark);
  return { canvas, parallax: MID, haze: 0.32 };
}

/** Out-of-focus bushes and branches close to the camera. */
export function frontPlants(width: number, seed: number): Layer {
  const [canvas, c] = makeCanvas(layerWidth(width, FRONT), VIEW_H);
  const rand = rng(seed);
  for (let x = 80; x < canvas.width; x += 270 + rand() * 230) {
    if (rand() < 0.62) bush(c, x, VIEW_H + 34, 120 + rand() * 50, 50 + rand() * 10, seed + x, SILHOUETTE);
    else {
      foliage(c, x, -10, 80, 20, seed + x, SILHOUETTE);
      foliage(c, x + 54, -3, 42, 13, seed + x + 1, SILHOUETTE);
    }
  }
  return { canvas, parallax: FRONT, front: true };
}

export type Walk = 'concrete' | 'brick';

/**
 * The ground of a campus road from x0 to x1: a sidewalk along the buildings,
 * a kerb, then the road the player walks on. A brick walk is wide enough to
 * walk on, with the road beyond it nearer the camera.
 */
export function road(c: Ctx, x0: number, x1: number, walk: Walk, seed: number): void {
  const rand = rng(seed);
  const w = x1 - x0;
  if (walk === 'brick') {
    rect(c, x0, GROUND, w, 4, '#c9c4b6');
    brickPaving(c, x0, x1, GROUND + 4, 44, seed);
    rect(c, x0, GROUND + 48, w, 2, '#e4dfd2');
    rect(c, x0, GROUND + 50, w, 2, '#9d988c');
    rect(c, x0, GROUND + 52, w, VIEW_H - GROUND - 52, P.road);
    for (let i = 0; i < w * 0.5; i++) px(c, x0 + rand() * w, GROUND + 52 + rand() * 12, rand() > 0.5 ? P.roadLine : P.roadDark);
    return;
  }
  rect(c, x0, GROUND, w, 14, P.pave);
  rect(c, x0, GROUND, w, 1, shade(P.pave, 0.35));
  for (let x = x0; x < x1; x += 14) rect(c, x, GROUND + 1, 1, 12, P.paveLine);
  rect(c, x0, GROUND + 7, w, 1, P.paveLine);
  rect(c, x0, GROUND + 14, w, 2, shade(P.pave, 0.3));
  rect(c, x0, GROUND + 16, w, 2, P.paveDark);
  rect(c, x0, GROUND + 18, w, VIEW_H - GROUND - 18, P.road);
  rect(c, x0, GROUND + 18, w, 10, shade(P.road, 0.14));
  rect(c, x0, GROUND + 28, w, 10, shade(P.road, 0.06));
  rect(c, x0, GROUND + 52, w, 20, shade(P.road, -0.12));
  for (let i = 0; i < w * 2; i++) {
    px(c, x0 + rand() * w, GROUND + 18 + rand() * (VIEW_H - GROUND - 18), rand() > 0.5 ? P.roadLine : P.roadDark);
  }
  for (let x = x0 + 40; x < x1; x += 120) line(c, x, GROUND + 18, x - 26, VIEW_H, P.roadDark, 1);
}

/** White parking bay lines on the far side of the road. */
export function parkingBays(c: Ctx, x0: number, x1: number, gap = 50): void {
  for (let x = x0; x <= x1; x += gap) line(c, x, GROUND + 18, x - 5, GROUND + 30, '#dcdad2', 1);
}

/** A strip of lawn with a kerb in front, for the edges of roads where there is no building. */
export function lawnStrip(c: Ctx, x0: number, x1: number, seed: number, depth = 14): void {
  const rand = rng(seed);
  rect(c, x0, GROUND - depth, x1 - x0, depth, P.grass);
  rect(c, x0, GROUND - depth, x1 - x0, 2, P.grassHi);
  for (let i = 0; i < (x1 - x0) * 0.6; i++) px(c, x0 + rand() * (x1 - x0), GROUND - depth + 2 + rand() * (depth - 2), rand() > 0.5 ? P.grassHi : P.grassDark);
}

/** Stands a campus lamp post on the kerb and wires up its light. */
export function lamp(c: Ctx, g: Ctx, lights: AreaLight[], x: number, base = GROUND + 15): void {
  const l = lampPost(c, x, base);
  disc(g, l.x, l.y, 4, P.lamp);
  lights.push({ x: l.x, y: l.y, r: 92, color: hex(P.lamp), strength: 0.95 });
  lights.push({ x: l.x, y: GROUND + 24, r: 60, color: hex(P.lamp), strength: 0.5 });
}

/** The warm light that spills out of a doorway at night. */
export function doorLight(lights: AreaLight[], x: number): void {
  lights.push({ x, y: GROUND - 18, r: 70, color: [255, 208, 140], strength: 0.75 });
}

/** A perimeter wall with iron spikes, closing off the end of a road. */
export function endWall(c: Ctx, x0: number, x1: number): void {
  rect(c, x0, GROUND - 40, x1 - x0, 58, P.wall);
  rect(c, x0, GROUND - 44, x1 - x0, 4, P.trim);
  rect(c, x0, GROUND + 12, x1 - x0, 6, P.wallShade);
  for (let x = x0 + 3; x < x1; x += 5) rect(c, x, GROUND - 60, 1, 16, P.iron);
  rect(c, x0, GROUND - 60, x1 - x0, 1, P.iron);
}

/**
 * Leaves drifting down by day and fireflies at night, the same on every
 * street. Returns the scene's `update`.
 */
export function ambience(seed: number, trees: number[]): (dt: number, area: AreaRuntime, view: AreaView) => void {
  const rand = rng(seed);
  let leaf = 0;
  let fly = 0;
  return (dt, area, view) => {
    leaf -= dt;
    if (leaf <= 0 && trees.length) {
      leaf = 0.7 + rand() * 1.3;
      const from = trees[Math.floor(rand() * trees.length)];
      area.spawnParticle({
        x: from + (rand() - 0.5) * 70,
        y: GROUND - 90 + rand() * 30,
        vx: 6 + rand() * 8,
        vy: 9 + rand() * 6,
        sway: 16,
        max: 9,
        floor: GROUND + 16 + rand() * 40,
        color: rand() > 0.5 ? '#c9a23e' : '#8fbf58',
      });
    }
    if (view.mood.night > 0.6) {
      fly -= dt;
      if (fly <= 0) {
        fly = 0.35;
        area.spawnParticle({
          x: view.camX + rand() * VIEW_W,
          y: GROUND - 20 + rand() * 40,
          vx: (rand() - 0.5) * 8,
          vy: -2 - rand() * 4,
          sway: 14,
          max: 4 + rand() * 3,
          color: '#e9ff9a',
          glow: true,
        });
      }
    }
  };
}

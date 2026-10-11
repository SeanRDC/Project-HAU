// The inner courtyard: terracotta tiles, old trees in brick planters, the
// glass roof overhead and the LAUS DEO SEMPER arch at the far side.

import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, line, px, rect, signCentered } from '../../engine/pix';
import { P, shade } from '../art/palette';
import { SILHOUETTE, bush, foliage, lampPost, pot, stoneBench, tree } from '../art/props';
import { courtyardHotspots, courtyardNpcs } from '../story/courtyard';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 880;
const GROUND = 204;
const WALK = 240;
const ARCH_X = 450;
const DOOR_X = 44;
const CHAIR_X = 318;
const GATE_X = 846;
const TREES = [150, 286, 610, 742];

function layerWidth(parallax: number): number {
  return Math.ceil(VIEW_W + (WIDTH - VIEW_W) * parallax) + 4;
}

/** The classroom wings wrapped around the courtyard, three floors of open corridors. */
function backLayer(): HTMLCanvasElement {
  const w = layerWidth(0.6);
  const [canvas, c] = makeCanvas(w, VIEW_H);
  const rand = rng(17);
  const top = 46;
  rect(c, 0, top, w, GROUND - top, '#e2cf96');
  // tiled roof edge
  rect(c, 0, top - 8, w, 8, '#a9523f');
  for (let x = 0; x < w; x += 4) rect(c, x, top - 8, 1, 8, '#8f4233');
  rect(c, 0, top, w, 3, P.trim);
  const floorH = 52;
  for (let f = 0; f < 3; f++) {
    const y = top + 4 + f * floorH;
    rect(c, 0, y + 6, w, 26, '#5a5266'); // corridor in shade
    for (let x = 8; x < w; x += 38) {
      // classroom doors and windows at the back of the corridor
      const lit = rand() > 0.55;
      rect(c, x + 6, y + 10, 12, 22, '#463f52');
      rect(c, x + 22, y + 12, 10, 10, lit ? '#7d8aa6' : '#6a7590');
    }
    for (let x = 0; x < w; x += 38) {
      rect(c, x, y + 4, 6, floorH - 4, P.trim);
      rect(c, x + 4, y + 4, 2, floorH - 4, P.trimShade);
    }
    // railing
    rect(c, 0, y + 32, w, 2, P.trim);
    rect(c, 0, y + 34, w, 12, '#e8d8a6');
    for (let x = 2; x < w; x += 4) rect(c, x, y + 35, 1, 10, '#cdb97f');
    rect(c, 0, y + 46, w, 3, P.trim);
    rect(c, 0, y + 49, w, 2, P.wallShade);
  }
  return canvas;
}

function arch(c: Ctx, x: number): void {
  const w = 150;
  const top = GROUND - 104;
  rect(c, x - w / 2, top, w, 104, P.wall);
  rect(c, x - w / 2, top, w, 22, P.wallLit);
  rect(c, x + w / 2 - 12, top, 12, 104, P.wallShade);
  // cornice
  rect(c, x - w / 2 - 4, top - 6, w + 8, 3, P.trim);
  rect(c, x - w / 2 - 2, top - 3, w + 4, 4, P.trimShade);
  for (let i = x - w / 2; i < x + w / 2; i += 3) rect(c, i, top + 1, 2, 2, P.trim);
  signCentered(c, 'LAUS DEO SEMPER', x, top + 9, '#5a3a22', 2);
  // garland draped under the lettering
  for (let i = -60; i <= 60; i++) {
    const sag = Math.round(Math.cos((i / 60) * Math.PI * 1.5) * 4);
    px(c, x + i, top + 30 + sag, i % 3 ? P.leaf : P.leafLit);
    px(c, x + i, top + 31 + sag, P.leafDark);
  }
  rect(c, x - w / 2, top + 40, w, 2, P.trim);
  rect(c, x - w / 2, top + 42, w, 1, P.trimShade);
  // three arched openings into the old theatre
  for (const dx of [-46, 0, 46]) {
    const r = 15;
    const ay = top + 52;
    rect(c, x + dx - r - 2, ay + r, r * 2 + 4, GROUND - ay - r, P.trim);
    disc(c, x + dx, ay + r, r + 2, P.trim);
    rect(c, x + dx - r, ay + r, r * 2, GROUND - ay - r, '#2c2733');
    disc(c, x + dx, ay + r, r, '#2c2733');
    rect(c, x + dx - r + 2, ay + r + 6, r * 2 - 4, GROUND - ay - r - 6, '#3a3344');
  }
  // pilasters
  for (const dx of [-w / 2, -24, 22, w / 2 - 6]) {
    rect(c, x + dx, top + 43, 6, 61, P.trim);
    rect(c, x + dx + 4, top + 43, 2, 61, P.trimShade);
  }
  // steps
  for (let i = 0; i < 3; i++) {
    rect(c, x - w / 2 - 4 - i * 4, GROUND + i * 3, w + 8 + i * 8, 3, i % 2 ? P.stoneHi : P.stone);
    rect(c, x - w / 2 - 4 - i * 4, GROUND + i * 3, w + 8 + i * 8, 1, '#d2cfd0');
  }
}

function planter(c: Ctx, x: number, w: number): void {
  const y = GROUND + 12;
  rect(c, x - w / 2, y - 12, w, 12, P.terracotta);
  rect(c, x - w / 2, y - 14, w, 3, P.terracottaHi);
  rect(c, x - w / 2, y - 2, w, 2, P.terracottaDark);
  for (let bx = x - w / 2; bx < x + w / 2; bx += 8) {
    rect(c, bx, y - 11, 1, 4, P.terracottaDark);
    rect(c, bx + 4, y - 6, 1, 4, P.terracottaDark);
  }
  rect(c, x - w / 2, y - 7, w, 1, P.terracottaDark);
  rect(c, x - w / 2 + 2, y - 16, w - 4, 2, '#4b3a2c');
}

function monobloc(c: Ctx, x: number, base: number): void {
  const white = '#f4f2ec';
  const grey = '#cfccc4';
  rect(c, x - 5, base - 8, 11, 2, white);
  rect(c, x - 5, base - 6, 1, 6, grey);
  rect(c, x + 5, base - 6, 1, 6, grey);
  rect(c, x - 3, base - 6, 1, 5, grey);
  rect(c, x + 3, base - 6, 1, 5, grey);
  rect(c, x - 5, base - 19, 2, 11, white);
  rect(c, x - 5, base - 19, 9, 2, white);
  rect(c, x - 3, base - 16, 6, 1, grey);
  rect(c, x - 3, base - 13, 6, 1, grey);
  rect(c, x + 4, base - 12, 2, 1, white);
}

/** Steel and glass roof far overhead. Mostly empty so the sky shows through. */
function glassRoof(c: Ctx): void {
  const steel = 'rgba(244,244,240,0.75)';
  const thin = 'rgba(244,244,240,0.35)';
  rect(c, 0, 20, WIDTH, 2, steel);
  rect(c, 0, 6, WIDTH, 1, steel);
  for (let x = 0; x < WIDTH; x += 22) {
    rect(c, x, 0, 1, 20, thin);
    line(c, x, 20, x + 11, 6, thin, 1);
    line(c, x + 11, 6, x + 22, 20, thin, 1);
  }
  for (const x of [112, 450, 790]) {
    rect(c, x - 2, 20, 4, GROUND - 20, '#e9e7e0');
    rect(c, x + 1, 20, 1, GROUND - 20, '#bdbab2');
  }
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const rand = rng(202);
  const lamp = hex(P.lamp);

  glassRoof(c);
  arch(c, ARCH_X);

  // tiled floor
  rect(c, 0, GROUND, WIDTH, VIEW_H - GROUND, P.terracotta);
  rect(c, 0, GROUND, WIDTH, 8, P.terracottaHi);
  rect(c, 0, GROUND + 46, WIDTH, 20, shade(P.terracotta, -0.12));
  for (const y of [GROUND + 6, GROUND + 15, GROUND + 28, GROUND + 46]) rect(c, 0, y, WIDTH, 1, P.terracottaDark);
  for (let x = -260; x < WIDTH + 260; x += 22) {
    line(c, x, GROUND, x + (x - WIDTH / 2) * 0.3, VIEW_H, P.terracottaDark, 1);
  }
  for (let i = 0; i < 1400; i++) {
    px(c, rand() * WIDTH, GROUND + rand() * (VIEW_H - GROUND), rand() > 0.5 ? P.terracottaHi : P.terracottaDark);
  }
  // pale stone path down the middle
  rect(c, 0, GROUND + 30, WIDTH, 14, '#c9a58c');
  rect(c, 0, GROUND + 30, WIDTH, 1, '#dcbba2');
  for (let x = 0; x < WIDTH; x += 18) rect(c, x, GROUND + 31, 1, 13, '#b38f78');

  // wall and doorway back into the lobby
  rect(c, 0, 26, 86, GROUND - 26, P.wall);
  rect(c, 78, 26, 8, GROUND - 26, P.wallShade);
  rect(c, 0, 22, 90, 5, P.trim);
  rect(c, DOOR_X - 24, GROUND - 82, 48, 82, P.trim);
  disc(c, DOOR_X, GROUND - 82, 24, P.trim);
  rect(c, DOOR_X - 20, GROUND - 82, 40, 82, '#4a3a36');
  disc(c, DOOR_X, GROUND - 82, 20, '#4a3a36');
  rect(c, DOOR_X - 20, GROUND - 60, 40, 60, '#6a5244');
  rect(c, DOOR_X - 20, GROUND - 6, 40, 6, P.marble);
  rect(g, DOOR_X - 20, GROUND - 82, 40, 82, '#d99a4a');
  lights.push({ x: DOOR_X, y: GROUND - 30, r: 90, color: [255, 208, 140], strength: 0.9 });

  // iron gate at the far end
  rect(c, GATE_X - 30, 60, 4, GROUND - 60, P.wallShade);
  for (let x = GATE_X - 24; x < WIDTH; x += 5) rect(c, x, GROUND - 96, 1, 96, P.iron);
  rect(c, GATE_X - 26, GROUND - 96, WIDTH - GATE_X + 26, 2, P.iron);
  rect(c, GATE_X - 26, GROUND - 50, WIDTH - GATE_X + 26, 2, P.iron);
  rect(c, GATE_X - 4, GROUND - 56, 8, 10, P.ironHi);

  for (const [i, x] of TREES.entries()) {
    planter(c, x, 66);
    tree(c, x, GROUND - 2, 132 + (i % 2) * 14, 44, 800 + i * 7);
    bush(c, x - 20, GROUND, 20, 12, 810 + i);
    bush(c, x + 22, GROUND, 18, 11, 820 + i);
  }

  stoneBench(c, 196, GROUND + 14, 34);
  stoneBench(c, 540, GROUND + 14, 34);
  stoneBench(c, 664, GROUND + 14, 34);
  monobloc(c, CHAIR_X, GROUND + 16);
  pot(c, 94, GROUND + 8, 71);
  pot(c, 366, GROUND + 10, 72);
  pot(c, 534, GROUND + 10, 73);

  for (const x of [226, 380, 520, 680]) {
    const l = lampPost(c, x, GROUND + 12, 54);
    lights.push({ x: l.x, y: l.y, r: 84, color: lamp, strength: 0.95 });
    lights.push({ x: l.x, y: GROUND + 24, r: 56, color: lamp, strength: 0.5 });
    disc(g, l.x, l.y, 4, P.lamp);
  }

  // string lights sagging between the trees
  const bulbs = ['#ffd98a', '#ffb0a0', '#bfe3ff', '#ffe9b0'];
  for (let i = 0; i + 1 < TREES.length; i++) {
    const a = TREES[i];
    const b = TREES[i + 1];
    for (let x = a; x <= b; x += 2) {
      const k = (x - a) / (b - a);
      const y = 112 + Math.sin(k * Math.PI) * 16;
      px(c, x, y, '#3a3038');
      if ((x - a) % 12 === 0) {
        px(c, x, y + 1, '#f4ecd4');
        rect(g, x - 1, Math.round(y), 3, 3, bulbs[(x / 12) % 4 | 0]);
      }
    }
    lights.push({ x: (a + b) / 2, y: 132, r: 90, color: [255, 214, 160], strength: 0.45 });
  }
  return { canvas, glow };
}

function frontLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(1.35), VIEW_H);
  const rand = rng(303);
  for (let x = 120; x < canvas.width; x += 300 + rand() * 180) {
    if (rand() > 0.5) {
      foliage(c, x, -14, 70, 18, 600 + x, SILHOUETTE);
    } else {
      bush(c, x, VIEW_H + 36, 130, 52, 602 + x, SILHOUETTE);
    }
  }
  return canvas;
}

export function buildCourtyard(): AreaDef {
  const lights: AreaLight[] = [];
  const back = backLayer();
  const main = mainLayer(lights);
  const rand = rng(909);
  let leaf = 0;
  let fly = 0;

  return {
    id: 'courtyard',
    title: 'DJN Courtyard',
    subtitle: 'Laus Deo Semper',
    width: WIDTH,
    walkY: WALK,
    bounds: [30, WIDTH - 50],
    outdoor: true,
    layers: [
      { canvas: back, parallax: 0.6, haze: 0.22 },
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.35, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: courtyardHotspots({ door: DOOR_X, arch: ARCH_X, chair: CHAIR_X, gate: GATE_X }),
    npcs: courtyardNpcs(),
    spawns: { lobby: { x: DOOR_X + 6, facing: 1 } },

    update(dt, area, view) {
      leaf -= dt;
      if (leaf <= 0) {
        leaf = 0.35 + rand() * 0.6;
        const from = TREES[Math.floor(rand() * TREES.length)];
        area.spawnParticle({
          x: from + (rand() - 0.5) * 80,
          y: 80 + rand() * 40,
          vx: 4 + rand() * 7,
          vy: 8 + rand() * 6,
          sway: 15,
          max: 11,
          floor: GROUND + 10 + rand() * 46,
          color: rand() > 0.6 ? '#d9b048' : rand() > 0.5 ? '#9cc65e' : '#c98a3c',
        });
      }
      if (view.mood.night > 0.55) {
        fly -= dt;
        if (fly <= 0) {
          fly = 0.25;
          area.spawnParticle({
            x: view.camX + rand() * VIEW_W,
            y: 130 + rand() * 80,
            vx: (rand() - 0.5) * 8,
            vy: -2 - rand() * 4,
            sway: 14,
            max: 4 + rand() * 3,
            color: '#e9ff9a',
            glow: true,
          });
        }
      }
    },
  };
}

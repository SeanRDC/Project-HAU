// Ground floor lobby of the DJN building: marble floor, the bust of the
// founder in the middle, tall windows that let the afternoon in.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { css, rng } from '../../engine/math';
import { disc, line, poly, px, rect, sign, signCentered } from '../../engine/pix';
import { P, shade } from '../art/palette';
import { GREEN, SILHOUETTE, bush, foliage, palm, pot } from '../art/props';
import { lobbyHotspots, lobbyNpcs } from '../story/lobby';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 680;
const FLOOR = 206;
const WALK = 238;
const CEIL = 26;

const ENTRANCE_X = 62;
const BUST_X = 340;
const BOARD_X = 150;
const CKS_X = 532;
const ARCH_X = 628;
const WINDOWS = [248, 432];

const WALL = '#ecdcae';
const WALL_LIT = '#f4e8c2';
const WALL_SHADE = '#d3c08e';
const WOOD = '#6b4634';
const WOOD_HI = '#8c6148';
const WOOD_DARK = '#48302a';

/** Cut an arched opening out of the layer so the sky shows through. */
function cutArch(c: Ctx, cx: number, top: number, w: number, bottom: number): void {
  const r = w / 2;
  c.clearRect(cx - r, top + r, w, bottom - top - r);
  for (let dy = 0; dy < r; dy++) {
    const half = Math.round(Math.sqrt(r * r - (r - dy) * (r - dy)));
    c.clearRect(cx - half, top + dy, half * 2, 1);
  }
}

function archTrim(c: Ctx, cx: number, top: number, w: number, bottom: number): void {
  const r = w / 2 + 4;
  rect(c, cx - r, top + r - 4, r * 2, bottom - top - r + 4, P.trim);
  disc(c, cx, top + r - 4, r, P.trim);
  rect(c, cx - r, top + r - 4, 2, bottom - top - r + 4, P.trimShade);
  rect(c, cx - r - 2, top + r - 6, r * 2 + 4, 3, P.trim);
  rect(c, cx - 3, top - 7, 6, 8, P.trimShade); // keystone
}

function column(c: Ctx, cx: number): void {
  const col = '#e9c868';
  const lit = '#f6de8c';
  const dark = '#c29f48';
  rect(c, cx - 7, CEIL + 10, 14, FLOOR - CEIL - 16, col);
  rect(c, cx - 7, CEIL + 10, 3, FLOOR - CEIL - 16, lit);
  rect(c, cx + 3, CEIL + 10, 4, FLOOR - CEIL - 16, dark);
  rect(c, cx - 10, CEIL + 2, 20, 4, lit);
  rect(c, cx - 11, CEIL + 6, 22, 4, col);
  disc(c, cx - 10, CEIL + 8, 2, dark);
  disc(c, cx + 10, CEIL + 8, 2, dark);
  rect(c, cx - 9, FLOOR - 6, 18, 3, col);
  rect(c, cx - 11, FLOOR - 3, 22, 3, dark);
}

function tallWindow(c: Ctx, glow: Ctx, cx: number): void {
  const top = 66;
  const h = 92;
  rect(c, cx - 17, top - 4, 34, h + 8, P.trim);
  rect(c, cx - 17, top - 4, 2, h + 8, P.trimShade);
  c.clearRect(cx - 13, top, 26, h);
  rect(c, cx - 1, top, 2, h, P.trim);
  for (const y of [top + 22, top + 46, top + 70]) rect(c, cx - 13, y, 26, 1, P.trim);
  rect(c, cx - 20, top + h + 4, 40, 3, P.trim);
  rect(c, cx - 20, top + h + 7, 40, 1, WALL_SHADE);
  // curtains tied to the sides
  poly(c, [[cx - 13, top], [cx - 5, top], [cx - 11, top + 44], [cx - 13, top + 60]], P.maroon);
  poly(c, [[cx + 13, top], [cx + 5, top], [cx + 11, top + 44], [cx + 13, top + 60]], P.maroonHi);
  rect(c, cx - 15, top - 2, 30, 3, P.maroon);
  rect(glow, cx - 13, top, 26, h, '#1c2748');
}

function bust(c: Ctx, x: number): void {
  // pedestal
  rect(c, x - 14, FLOOR - 4, 28, 4, '#a8846f');
  rect(c, x - 11, FLOOR - 46, 22, 42, '#cdab94');
  rect(c, x - 11, FLOOR - 46, 4, 42, '#e0c4b0');
  rect(c, x + 6, FLOOR - 46, 5, 42, '#ae8b76');
  rect(c, x - 14, FLOOR - 50, 28, 4, '#3a2a26');
  rect(c, x - 14, FLOOR - 51, 28, 1, '#5a4038');
  rect(c, x - 7, FLOOR - 36, 14, 12, P.gold);
  rect(c, x - 7, FLOOR - 36, 14, 1, P.goldHi);
  rect(c, x - 5, FLOOR - 33, 10, 1, '#7a5a20');
  rect(c, x - 4, FLOOR - 30, 8, 1, '#7a5a20');
  rect(c, x - 5, FLOOR - 27, 6, 1, '#7a5a20');
  // the bust itself, dark bronze
  const b = '#3b2c26';
  const bh = '#62493c';
  poly(c, [[x - 12, FLOOR - 51], [x + 12, FLOOR - 51], [x + 9, FLOOR - 61], [x - 9, FLOOR - 61]], b);
  poly(c, [[x - 12, FLOOR - 51], [x - 5, FLOOR - 51], [x - 6, FLOOR - 61], [x - 9, FLOOR - 61]], bh);
  rect(c, x - 3, FLOOR - 64, 6, 4, b);
  rect(c, x - 2, FLOOR - 61, 1, 3, '#d9d2c4'); // collar
  rect(c, x + 1, FLOOR - 61, 1, 3, '#d9d2c4');
  disc(c, x, FLOOR - 69, 5.5, b);
  disc(c, x - 2, FLOOR - 70, 3, bh);
  rect(c, x - 6, FLOOR - 70, 1, 3, b); // ears
  rect(c, x + 6, FLOOR - 70, 1, 3, b);
  rect(c, x - 5, FLOOR - 75, 10, 3, '#241a18'); // hair
}

function bulletinBoard(c: Ctx, x: number): void {
  rect(c, x - 34, 92, 68, 52, WOOD);
  rect(c, x - 34, 92, 68, 2, WOOD_HI);
  rect(c, x - 31, 95, 62, 46, '#c39562');
  const rand = rng(31);
  const papers = ['#f6f1e4', '#f2d66b', '#9fd0e6', '#f3a5a0', '#bfe3a1', '#f6f1e4', '#e9c9f0'];
  for (let i = 0; i < 9; i++) {
    const px0 = x - 29 + rand() * 48;
    const py0 = 97 + rand() * 30;
    const w = 8 + rand() * 7;
    const h = 9 + rand() * 6;
    const col = papers[Math.floor(rand() * papers.length)];
    rect(c, px0 + 1, py0 + 1, w, h, 'rgba(60,40,20,0.3)');
    rect(c, px0, py0, w, h, col);
    rect(c, px0 + 1, py0 + 2, w - 3, 1, shade(col, -0.45));
    rect(c, px0 + 1, py0 + 4, w - 2, 1, shade(col, -0.3));
    rect(c, px0 + 1, py0 + 6, w - 4, 1, shade(col, -0.3));
    px(c, px0 + w / 2, py0, P.maroon);
  }
  signCentered(c, 'BULLETIN', x, 85, WOOD_DARK);
}

function woodDoor(c: Ctx, cx: number): void {
  const w = 40;
  const h = 76;
  rect(c, cx - w / 2 - 4, FLOOR - h - 4, w + 8, h + 4, P.trim);
  rect(c, cx - w / 2 - 4, FLOOR - h - 4, 2, h + 4, P.trimShade);
  rect(c, cx - w / 2, FLOOR - h, w, h, WOOD);
  rect(c, cx - 1, FLOOR - h, 1, h, WOOD_DARK);
  for (const dx of [-w / 2 + 3, 2]) {
    rect(c, cx + dx, FLOOR - h + 4, w / 2 - 5, 30, WOOD_HI);
    rect(c, cx + dx + 1, FLOOR - h + 5, w / 2 - 7, 28, WOOD);
    rect(c, cx + dx, FLOOR - h + 38, w / 2 - 5, 32, WOOD_HI);
    rect(c, cx + dx + 1, FLOOR - h + 39, w / 2 - 7, 30, WOOD);
  }
  rect(c, cx - 4, FLOOR - 38, 2, 5, P.gold);
  rect(c, cx + 2, FLOOR - 38, 2, 5, P.gold);
  // name plate above
  rect(c, cx - 42, FLOOR - h - 24, 84, 17, P.maroon);
  rect(c, cx - 42, FLOOR - h - 24, 84, 1, P.maroonHi);
  signCentered(c, 'CENTER FOR', cx, FLOOR - h - 21, P.goldHi);
  signCentered(c, 'KAPAMPANGAN STUDIES', cx, FLOOR - h - 14, P.goldHi);
}

function pendant(c: Ctx, glow: Ctx, x: number, lights: AreaLight[]): void {
  rect(c, x, CEIL, 1, 22, P.iron);
  poly(c, [[x - 6, CEIL + 30], [x + 7, CEIL + 30], [x + 3, CEIL + 22], [x - 2, CEIL + 22]], '#2f2a33');
  rect(c, x - 3, CEIL + 30, 7, 2, P.lamp);
  rect(glow, x - 3, CEIL + 30, 7, 3, P.lamp);
  lights.push({ x, y: CEIL + 40, r: 120, color: [255, 214, 150], strength: 0.9 });
  lights.push({ x, y: FLOOR + 14, r: 80, color: [255, 214, 150], strength: 0.45 });
}

function build(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const rand = rng(64);

  // wall
  rect(c, 0, 0, WIDTH, FLOOR, WALL);
  rect(c, 0, CEIL, WIDTH, 34, WALL_LIT);
  for (let i = 0; i < 500; i++) px(c, rand() * WIDTH, CEIL + rand() * (FLOOR - CEIL), rand() > 0.5 ? WALL_LIT : '#e6d4a2');
  // wainscot
  rect(c, 0, FLOOR - 40, WIDTH, 40, '#dccb9c');
  rect(c, 0, FLOOR - 42, WIDTH, 3, P.trim);
  rect(c, 0, FLOOR - 39, WIDTH, 1, WALL_SHADE);
  for (let x = 14; x < WIDTH; x += 46) {
    rect(c, x, FLOOR - 33, 34, 24, '#e6d7ab');
    rect(c, x, FLOOR - 33, 34, 1, WALL_LIT);
    rect(c, x, FLOOR - 10, 34, 1, WALL_SHADE);
  }
  rect(c, 0, FLOOR - 5, WIDTH, 5, WOOD);
  rect(c, 0, FLOOR - 5, WIDTH, 1, WOOD_HI);

  // ceiling and crown moulding
  rect(c, 0, 0, WIDTH, CEIL - 6, '#3d3038');
  for (let x = 0; x < WIDTH; x += 60) rect(c, x, 0, 4, CEIL - 6, '#2c2229');
  rect(c, 0, CEIL - 6, WIDTH, 3, P.trimShade);
  rect(c, 0, CEIL - 3, WIDTH, 4, P.trim);
  rect(c, 0, CEIL + 1, WIDTH, 2, WALL_SHADE);

  // floor: polished marble with small terracotta diamonds
  rect(c, 0, FLOOR, WIDTH, VIEW_H - FLOOR, P.marble);
  rect(c, 0, FLOOR, WIDTH, 6, P.marbleHi);
  for (const y of [FLOOR + 8, FLOOR + 20, FLOOR + 38]) rect(c, 0, y, WIDTH, 1, P.marbleLine);
  for (let x = -200; x < WIDTH + 200; x += 44) {
    const slant = (x - WIDTH / 2) * 0.35;
    line(c, x, FLOOR, x + slant, VIEW_H, P.marbleLine, 1);
    for (const y of [FLOOR + 8, FLOOR + 20, FLOOR + 38]) {
      const k = (y - FLOOR) / (VIEW_H - FLOOR);
      rect(c, x + slant * k - 1, y - 1, 3, 3, P.terracotta);
    }
  }
  for (let i = 0; i < 300; i++) px(c, rand() * WIDTH, FLOOR + rand() * (VIEW_H - FLOOR), rand() > 0.5 ? P.marbleHi : '#dcd1c2');

  // front entrance, open to the driveway
  archTrim(c, ENTRANCE_X, FLOOR - 98, 52, FLOOR);
  cutArch(c, ENTRANCE_X, FLOOR - 98, 52, FLOOR);
  rect(c, ENTRANCE_X - 26, FLOOR - 8, 52, 8, P.pave);
  rect(c, ENTRANCE_X - 26, FLOOR - 14, 52, 6, P.road);
  palm(c, ENTRANCE_X + 12, FLOOR - 8, 46, 415);
  lights.push({ x: ENTRANCE_X, y: FLOOR - 30, r: 120, color: [255, 240, 210], strength: 0.75, daylight: true });
  lights.push({ x: ENTRANCE_X + 30, y: FLOOR + 24, r: 90, color: [255, 240, 210], strength: 0.6, daylight: true });

  for (const wx of WINDOWS) {
    tallWindow(c, g, wx);
    lights.push({ x: wx + 34, y: FLOOR + 10, r: 96, color: [255, 240, 210], strength: 0.7, daylight: true });
    // sheen on the marble under the window
    c.globalAlpha = 0.35;
    poly(c, [[wx - 6, FLOOR], [wx + 22, FLOOR], [wx + 74, VIEW_H], [wx + 30, VIEW_H]], P.marbleHi);
    c.globalAlpha = 1;
  }

  // gold lettering on the wall behind the bust
  signCentered(c, 'LAUS DEO SEMPER', BUST_X, 78, '#b8902c', 2);
  rect(c, BUST_X - 46, 94, 92, 1, '#b8902c');
  signCentered(c, 'HOLY ANGEL UNIVERSITY - 1933', BUST_X, 100, '#9a7a36');
  bust(c, BUST_X);
  lights.push({ x: BUST_X, y: FLOOR - 60, r: 60, color: [255, 226, 170], strength: 0.6, always: true });

  bulletinBoard(c, BOARD_X);
  woodDoor(c, CKS_X);

  // archway through to the courtyard
  archTrim(c, ARCH_X, FLOOR - 92, 50, FLOOR);
  cutArch(c, ARCH_X, FLOOR - 92, 50, FLOOR);
  rect(c, ARCH_X - 25, FLOOR - 14, 50, 14, P.terracotta);
  rect(c, ARCH_X - 25, FLOOR - 14, 50, 2, P.terracottaHi);
  foliage(c, ARCH_X + 6, FLOOR - 44, 22, 18, 91, GREEN);
  rect(c, ARCH_X + 4, FLOOR - 30, 3, 18, P.trunk);
  foliage(c, ARCH_X - 16, FLOOR - 22, 10, 8, 92, GREEN);
  lights.push({ x: ARCH_X, y: FLOOR - 20, r: 100, color: [240, 255, 220], strength: 0.6, daylight: true });

  for (const cx of [198, 482]) column(c, cx);

  // waiting bench and plants
  rect(c, 380, FLOOR - 14, 44, 3, WOOD_HI);
  rect(c, 380, FLOOR - 11, 44, 2, WOOD_DARK);
  rect(c, 383, FLOOR - 9, 3, 9, WOOD);
  rect(c, 418, FLOOR - 9, 3, 9, WOOD);
  rect(c, 380, FLOOR - 26, 44, 2, WOOD_HI);
  rect(c, 382, FLOOR - 24, 2, 10, WOOD);
  rect(c, 420, FLOOR - 24, 2, 10, WOOD);
  pot(c, 108, FLOOR + 2, 51);
  pot(c, 286, FLOOR + 2, 52);
  pot(c, 580, FLOOR + 2, 53);

  for (const x of [130, 300, 380, 560]) pendant(c, g, x, lights);

  sign(c, 'EXIT', ENTRANCE_X - 7, FLOOR - 112, P.maroon);
  return { canvas, glow };
}

function frontLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(WIDTH * 1.3, VIEW_H);
  // leafy plants close to the camera, only their tops in frame
  for (const [i, x] of [60, 450, 820].entries()) {
    bush(c, x, VIEW_H + 34, 110, 50, 670 + i, SILHOUETTE);
  }
  return canvas;
}

export function buildLobby(): AreaDef {
  const lights: AreaLight[] = [];
  const main = build(lights);
  const rand = rng(4321);
  let dust = 0;

  return {
    id: 'lobby',
    title: 'DJN Building Lobby',
    subtitle: 'Itinayo noong 1940',
    subtitleEn: 'Built in 1940',
    width: WIDTH,
    walkY: WALK,
    bounds: [34, WIDTH - 30],
    outdoor: false,
    visitFlag: 'entered_djn',
    layers: [
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.3, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: lobbyHotspots({ entrance: ENTRANCE_X, bust: BUST_X, board: BOARD_X, cks: CKS_X, arch: ARCH_X }),
    npcs: lobbyNpcs(),
    spawns: {
      front: { x: ENTRANCE_X + 6, facing: 1 },
      courtyard: { x: ARCH_X - 4, facing: -1 },
    },

    update(dt, area, view) {
      if (view.mood.night > 0.7) return;
      dust -= dt;
      if (dust <= 0) {
        dust = 0.12;
        const wx = WINDOWS[Math.floor(rand() * WINDOWS.length)];
        const k = rand();
        area.spawnParticle({
          x: wx - 10 + k * 70 + rand() * 20,
          y: 70 + k * 150 + rand() * 20,
          vx: (rand() - 0.5) * 3,
          vy: 1 + rand() * 3,
          sway: 5,
          max: 4 + rand() * 4,
          color: '#fff3c8',
          glow: true,
        });
      }
    },

    drawOver(ctx, view) {
      // sunbeams slanting in through the windows
      const a = (1 - view.mood.night) * (0.045 + view.mood.glow * 0.075);
      if (a < 0.01) return;
      ctx.globalCompositeOperation = 'lighter';
      for (const wx of WINDOWS) {
        const x = wx - Math.round(view.camX);
        const grad = ctx.createLinearGradient(x, 66, x + 70, VIEW_H);
        grad.addColorStop(0, css(view.mood.sun, a));
        grad.addColorStop(1, css(view.mood.sun, a * 0.25));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x - 13, 66);
        ctx.lineTo(x + 13, 66);
        ctx.lineTo(x + 104, VIEW_H);
        ctx.lineTo(x + 34, VIEW_H);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}

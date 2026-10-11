// The main gate on Sto. Rosario St. You come in from the street on the right,
// pass under the gate, get your bag checked under the tent, tap your ID at the
// turnstile, and walk on left to the boom barrier by Gate 1 and the DJN drive.

import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { css, damp, hex, rng } from '../../engine/math';
import { disc, line, poly, px, rect } from '../../engine/pix';
import {
  ARCH_WIDTH, ReaderState, bagOnTable, bagTable, canopy, gateArch, idCard, inspectionSign, noIdBoard, perimeterWall,
  railing, readerScreen, turnstile, turnstileArm,
} from '../art/gate';
import { P, shade } from '../art/palette';
import { baseLook } from '../art/player';
import { SILHOUETTE, boomBarrier, bush, foliage, hedge, lampPost, palm, pot, tree } from '../art/props';
import { Checkpoint, gateArrival, gateHotspots, gateNpcs } from '../story/gate';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 1010;
const GROUND = 206;
const WALK = 242;
/** the line the gate furniture stands on, just behind where people walk */
const BACK = WALK - 6;

const PLAZA_X = 34;
const BOOM_X = 56;
const BOARD_X = 372;
const TURNSTILE_X = 440;
const TABLE_A = 556;
const TABLE_B = 646;
const CANOPY: [number, number] = [508, 700];
const SIGN_X = 718;
const ARCH_X = 800;
const STREET_X = 992;

function layerWidth(parallax: number): number {
  return Math.ceil(VIEW_W + (WIDTH - VIEW_W) * parallax) + 4;
}

/** Rooftops of the city and the tree line far behind the wall. */
function farLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(0.16), VIEW_H);
  const rand = rng(61);
  for (let x = -10; x < canvas.width; x += 26 + rand() * 30) {
    const h = 16 + rand() * 30;
    rect(c, x, GROUND - h, 32, h, rand() > 0.5 ? '#b9a48f' : '#a7a2a8');
    poly(c, [[x - 3, GROUND - h], [x + 35, GROUND - h], [x + 16, GROUND - h - 9]], rand() > 0.4 ? '#a0584a' : '#6f7d8c');
  }
  // a water tower on stilts, the kind every barangay has
  const wx = 300;
  for (const dx of [-8, 8]) line(c, wx + dx, GROUND - 20, wx + dx * 0.6, GROUND - 62, '#7d808a', 1);
  rect(c, wx - 12, GROUND - 82, 24, 20, '#9aa3ae');
  rect(c, wx - 12, GROUND - 82, 6, 20, '#b4bcc6');
  poly(c, [[wx - 14, GROUND - 82], [wx + 14, GROUND - 82], [wx, GROUND - 92]], '#7d8794');
  for (let x = -20; x < canvas.width; x += 16 + rand() * 20) {
    foliage(c, x, GROUND - 8 - rand() * 14, 14 + rand() * 10, 10 + rand() * 8, 620 + x, {
      deep: '#31543f', dark: '#3b6347', mid: '#48754f', lit: '#5a8a5a', hi: '#6b9a62',
    });
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, '#3b6347');
  return canvas;
}

/** Campus buildings rising over the wall on the inside, shophouses on the street side. */
function midLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(0.42), VIEW_H);
  const rand = rng(97);
  const archAt = ARCH_X * 0.42;

  // banded high-rise, same build as the ones behind the DJN
  const tower = (x: number, top: number, w: number, floors: number) => {
    const fh = Math.floor((GROUND - top) / floors);
    rect(c, x, top, w, GROUND - top, '#70747e');
    for (let f = 0; f < floors; f++) {
      const y = top + f * fh;
      rect(c, x - 3, y, w + 6, 5, '#ecebe6');
      rect(c, x - 3, y + 5, w + 6, 1, '#b9b8b6');
      rect(c, x, y + 6, w, fh - 6, '#565c6c');
      for (let wx = x + 3; wx < x + w - 6; wx += 9) rect(c, wx, y + 8, 6, fh - 10, rand() > 0.25 ? '#6b8fc4' : '#8fb1dc');
    }
    rect(c, x + w - 10, top, 13, GROUND - top, '#5a5e68');
  };
  tower(40, 60, 130, 8);
  tower(archAt - 150, 88, 96, 6);

  // two-storey shophouses across the side street
  for (let x = archAt + 60; x < canvas.width; x += 70) {
    const h = 50 + rand() * 20;
    rect(c, x, GROUND - h, 64, h, rand() > 0.5 ? '#d8c9a2' : '#c9b8a8');
    rect(c, x, GROUND - h, 64, 3, '#efe6d2');
    for (let wx = x + 6; wx < x + 58; wx += 14) rect(c, wx, GROUND - h + 10, 9, 10, '#4c5568');
    rect(c, x + 4, GROUND - 26, 56, 4, rand() > 0.5 ? '#3d6a8a' : P.maroon); // awning
    rect(c, x + 6, GROUND - 22, 52, 22, '#5a5462');
  }
  for (let x = -10; x < archAt; x += 44 + rand() * 50) tree(c, x, GROUND + 2, 50 + rand() * 30, 18 + rand() * 10, 960 + Math.round(x));
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, P.grassDark);
  return canvas;
}

function ground(c: Ctx): void {
  const rand = rng(8);
  const inside = ARCH_X;
  // inside: sidewalk then the pebble-wash driveway, like the DJN drive
  rect(c, 0, GROUND, inside, 14, P.pave);
  rect(c, 0, GROUND, inside, 1, shade(P.pave, 0.35));
  for (let x = 0; x < inside; x += 14) rect(c, x, GROUND + 1, 1, 12, P.paveLine);
  rect(c, 0, GROUND + 7, inside, 1, P.paveLine);
  rect(c, 0, GROUND + 14, inside, 2, shade(P.pave, 0.3));
  rect(c, 0, GROUND + 16, inside, 2, P.paveDark);
  rect(c, 0, GROUND + 18, inside, VIEW_H - GROUND - 18, P.road);
  rect(c, 0, GROUND + 18, inside, 10, shade(P.road, 0.14));
  rect(c, 0, GROUND + 52, inside, 20, shade(P.road, -0.12));
  for (let i = 0; i < 1800; i++) {
    px(c, rand() * inside, GROUND + 18 + rand() * (VIEW_H - GROUND - 18), rand() > 0.5 ? P.roadLine : P.roadDark);
  }
  for (let x = 40; x < inside; x += 120) line(c, x, GROUND + 18, x - 26, VIEW_H, P.roadDark, 1);
  // painted lane through the checkpoint
  for (let x = TURNSTILE_X + 14; x < CANOPY[1]; x += 10) rect(c, x, WALK + 4, 6, 1, '#d8c23a');

  // outside: a wide public sidewalk, the curb, then Sto. Rosario St.
  const w = WIDTH - inside;
  rect(c, inside, GROUND, w, 44, '#b3ab9c');
  rect(c, inside, GROUND, w, 1, shade('#b3ab9c', 0.35));
  for (let x = inside; x < WIDTH; x += 18) rect(c, x, GROUND + 1, 1, 43, '#9c9487');
  for (let y = GROUND + 11; y < GROUND + 44; y += 11) rect(c, inside, y, w, 1, '#9c9487');
  rect(c, inside, GROUND + 44, w, 3, P.stoneHi);
  rect(c, inside, GROUND + 47, w, 2, P.stoneDark);
  rect(c, inside, GROUND + 49, w, VIEW_H - GROUND - 49, '#4f4c55');
  for (let i = 0; i < 500; i++) px(c, inside + rand() * w, GROUND + 50 + rand() * 20, rand() > 0.5 ? '#5d5a63' : '#433f48');
  for (let x = inside + 10; x < WIDTH; x += 26) rect(c, x, VIEW_H - 8, 14, 2, '#e8e2d2');
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const lampColor = hex(P.lamp);

  tree(c, 120, GROUND + 2, 110, 40, 401);
  tree(c, 610, GROUND - 40, 96, 34, 402);
  palm(c, 250, GROUND + 2, 80, 410);

  // the wall runs the whole way, broken by the gate
  perimeterWall(c, 0, ARCH_X - ARCH_WIDTH / 2, GROUND);
  perimeterWall(c, ARCH_X + ARCH_WIDTH / 2, WIDTH, GROUND);
  ground(c);
  gateArch(c, ARCH_X, GROUND);
  for (const dx of [-ARCH_WIDTH / 2 + 10, ARCH_WIDTH / 2 - 10]) {
    disc(g, ARCH_X + dx, GROUND - 76, 3, P.lamp);
    lights.push({ x: ARCH_X + dx, y: GROUND - 76, r: 70, color: lampColor, strength: 0.8 });
  }

  // inside: planting along the wall, the barrier by Gate 1, the warning board
  hedge(c, 80, GROUND + 3, 200, 11, 21);
  for (let i = 0; i < 4; i++) bush(c, 96 + i * 50, GROUND + 1, 26, 16, 30 + i);
  pot(c, 300, GROUND + 6, 23);
  pot(c, 330, GROUND + 6, 24);
  boomBarrier(c, BOOM_X, GROUND + 22, 84, 2.05);
  noIdBoard(c, BOARD_X - 23, GROUND - 34);

  // checkpoint
  railing(c, TURNSTILE_X + 20, CANOPY[0] + 12, BACK);
  turnstile(c, TURNSTILE_X, BACK);
  canopy(c, CANOPY[0], CANOPY[1], BACK);
  const mid = Math.round((CANOPY[0] + CANOPY[1]) / 2);
  disc(g, mid, BACK - 64, 3, '#fff1c8');
  lights.push({ x: mid, y: BACK - 62, r: 80, color: [255, 236, 190], strength: 0.85 });
  bagTable(c, TABLE_A, BACK);
  bagTable(c, TABLE_B, BACK);
  inspectionSign(c, SIGN_X, BACK);

  // outside on the street
  bush(c, 900, GROUND + 4, 30, 16, 77);

  for (const x of [170, 330, 890]) {
    const l = lampPost(c, x, GROUND + 15);
    lights.push({ x: l.x, y: l.y, r: 92, color: lampColor, strength: 0.95 });
    disc(g, l.x, l.y, 4, P.lamp);
    lights.push({ x: l.x, y: GROUND + 24, r: 60, color: lampColor, strength: 0.5 });
  }
  // the reader's screen lights the turnstile a little, day and night
  lights.push({ x: TURNSTILE_X + 5, y: BACK - 22, r: 22, color: [140, 190, 255], strength: 0.35, always: true });
  return { canvas, glow };
}

/** Out-of-focus plants and a street sign close to the camera. */
function frontLayer(): HTMLCanvasElement {
  const parallax = 1.35;
  const [canvas, c] = makeCanvas(layerWidth(parallax), VIEW_H);
  const rand = rng(99);
  for (let x = 80; x < canvas.width; x += 280 + rand() * 200) {
    if (rand() < 0.6) bush(c, x, VIEW_H + 34, 120 + rand() * 60, 50 + rand() * 12, 800 + x, SILHOUETTE);
    else {
      foliage(c, x, -8, 84, 22, 840 + x, SILHOUETTE);
      foliage(c, x + 56, -2, 44, 14, 841 + x, SILHOUETTE);
    }
  }
  return canvas;
}

/** Live state of the checkpoint props, worked by the cutscenes in story/gate.ts. */
interface Props {
  arm: number;
  /** a cutscene is holding the arm down */
  held: boolean;
  /** the player has scanned in, so the arm drops whenever they walk up */
  unlocked: boolean;
  reader: ReaderState;
  readerTime: number;
  card: boolean;
  bag: 'none' | 'closed' | 'open';
  flashlight: boolean;
}

export function buildGate(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const rand = rng(4321);
  const st: Props = {
    arm: 0, held: false, unlocked: false, reader: 'idle', readerTime: 0, card: false, bag: 'none', flashlight: false,
  };
  const cp: Checkpoint = {
    scanner: TURNSTILE_X + 16,
    tableA: TABLE_A,
    tableB: TABLE_B,
    bag: (s) => (st.bag = s),
    reader: (s) => {
      st.reader = s;
      st.readerTime = 1.6;
    },
    card: (show) => (st.card = show),
    hold: (open) => (st.held = open),
    flashlight: (on) => (st.flashlight = on),
    unlock: () => (st.unlocked = true),
  };
  let leafTimer = 0;
  let playerX = 0;

  return {
    id: 'gate',
    title: 'Main Gate',
    subtitle: 'Sto. Rosario St., Angeles City',
    width: WIDTH,
    walkY: WALK,
    bounds: [22, WIDTH - 16],
    outdoor: true,
    layers: [
      { canvas: farLayer(), parallax: 0.16, haze: 0.62 },
      { canvas: midLayer(), parallax: 0.42, haze: 0.34 },
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.35, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: gateHotspots({ street: STREET_X, arch: ARCH_X, board: BOARD_X, plaza: PLAZA_X }, cp),
    npcs: gateNpcs(),
    spawns: {
      street: { x: 980, facing: -1 },
      plaza: { x: PLAZA_X + 24, facing: 1 },
    },
    barrier: { x: TURNSTILE_X + 12, until: 'scanned_id' },

    intro(game, x) {
      // props back to rest, whatever a previous visit left them in
      Object.assign(st, { held: false, card: false, bag: 'none', flashlight: false, reader: 'idle' });
      st.unlocked = game.has('scanned_id');
      if (game.has('passed_bag_check') || x < TURNSTILE_X + 12) return null;
      return gateArrival(cp, game.hour());
    },

    update(dt, area) {
      playerX = area.playerX();
      const near = Math.abs(playerX - (TURNSTILE_X + 10)) < 24;
      st.arm = damp(st.arm, st.held || (st.unlocked && near) ? 1 : 0, 9, dt);
      if (st.reader !== 'idle' && (st.readerTime -= dt) <= 0) st.reader = 'idle';

      leafTimer -= dt;
      if (leafTimer <= 0) {
        leafTimer = 0.8 + rand() * 1.4;
        const from = [120, 610][Math.floor(rand() * 2)];
        area.spawnParticle({
          x: from + (rand() - 0.5) * 60,
          y: GROUND - 80 + rand() * 30,
          vx: 6 + rand() * 8,
          vy: 9 + rand() * 6,
          sway: 16,
          max: 9,
          floor: GROUND + 16 + rand() * 40,
          color: rand() > 0.5 ? '#c9a23e' : '#8fbf58',
        });
      }
    },

    drawBack(ctx, view) {
      const cam = Math.round(view.camX);
      const top = BACK - 15;
      if (st.bag !== 'none') bagOnTable(ctx, TABLE_B + 6 - cam, top, baseLook().bag!, st.bag === 'open');
    },

    drawFront(ctx, view) {
      const cam = Math.round(view.camX);
      turnstileArm(ctx, TURNSTILE_X - cam, BACK, st.arm);
      if (st.card) idCard(ctx, TURNSTILE_X + 10 - cam, BACK - 27);
    },

    drawOver(ctx, view) {
      const cam = Math.round(view.camX);
      readerScreen(ctx, TURNSTILE_X - cam, BACK, st.reader, view.time);
      if (st.reader !== 'idle') {
        const x = TURNSTILE_X + 5 - cam;
        const glowCol = st.reader === 'ok' ? [75, 220, 120] : [255, 74, 74];
        const grad = ctx.createRadialGradient(x, BACK - 22, 0, x, BACK - 22, 26);
        grad.addColorStop(0, css(glowCol as [number, number, number], 0.45));
        grad.addColorStop(1, css(glowCol as [number, number, number], 0));
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad;
        ctx.fillRect(x - 26, BACK - 48, 52, 52);
        ctx.globalCompositeOperation = 'source-over';
      }
      if (st.flashlight) {
        // the guard's flashlight poking around inside the bag
        const hx = TABLE_B - 20 - cam;
        const hy = BACK - 20;
        const bx = TABLE_B + 6 - cam + Math.sin(view.time * 5) * 3;
        const by = BACK - 27;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.28;
        poly(ctx, [[hx, hy], [bx - 6, by - 2], [bx + 6, by + 4]], '#fff4c8');
        ctx.globalAlpha = 0.5;
        disc(ctx, bx, by + 1, 3, '#fff4c8');
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    },
  };
}

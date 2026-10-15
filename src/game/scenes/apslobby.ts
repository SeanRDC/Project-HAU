// The open lobby on the ground floor of APS, under the deep canopy, drawn
// from photos 07 to 09 of `assets/APS WALK FROM CHAPEL LAWN/`. You come in
// from the road on the left. Thick square pillars faced in stacked tan stone,
// each with a tall cream poster panel on it, stand in front of the pale back
// wall; between them a brown door into the halls, the cashier's window with
// a TV above it, two whiteboards on green stands, a window behind a white
// grille with the cash machine beside it, and the dark way to the stairs. The
// floor is white tiles crossed by red-brown lines in big diamonds; the
// ceiling is the white underside of the slab with strip lights.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { line, px, rect, sign, signCentered, signWidth } from '../../engine/pix';
import { stonePillar } from '../art/canteen';
import { P, shade } from '../art/palette';
import { SILHOUETTE, bush, hedge } from '../art/props';
import { apsLobbyHotspots } from '../story/apslobby';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 720;
/** the underside of the slab ends here and the back wall begins */
const CEIL = 40;
const FLOOR = 204;
const WALK = 238;

const EXIT_X = 30;
const PILLARS = [70, 200, 330, 460, 590, 700];
const HALL_DOOR = 135;
const CASHIER = 265;
const BOARDS = 395;
const ATM = 548;
const STAIRS = 645;

const WALL = '#e6e1d4';

/** The tall cream poster panel fixed to the front of a pillar, with a poster in some of them. */
function posterPanel(c: Ctx, x: number, w: number, poster: number): void {
  rect(c, x + 4, FLOOR - 74, w - 8, 56, '#efe9d8');
  rect(c, x + 4, FLOOR - 74, w - 8, 1, '#fcf9f0');
  rect(c, x + 4, FLOOR - 19, w - 8, 1, '#b9b09a');
  rect(c, x + w - 5, FLOOR - 74, 1, 56, '#d6ceb8');
  if (poster === 1) {
    // a school event poster: a photo, a title, lines of text
    rect(c, x + 7, FLOOR - 66, w - 14, 18, '#8a3a32');
    rect(c, x + 8, FLOOR - 64, w - 16, 9, '#c9a07a');
    rect(c, x + 7, FLOOR - 45, w - 14, 2, '#7a1f2b');
    for (let ly = FLOOR - 40; ly < FLOOR - 26; ly += 3) rect(c, x + 7, ly, w - 16, 1, '#9a8f7a');
  } else if (poster === 2) {
    rect(c, x + 7, FLOOR - 68, w - 14, 30, '#4f5f8a');
    rect(c, x + 9, FLOOR - 64, w - 18, 12, '#d8b890');
    rect(c, x + 9, FLOOR - 48, w - 18, 2, '#f2d66b');
  }
}

function build(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // the back wall, darker towards the top where the slab shades it
  rect(c, 0, CEIL, WIDTH, FLOOR - CEIL, WALL);
  rect(c, 0, CEIL, WIDTH, 14, shade(WALL, -0.22));
  rect(c, 0, CEIL + 14, WIDTH, 8, shade(WALL, -0.1));
  rect(c, 0, FLOOR - 6, WIDTH, 6, shade(WALL, -0.12));
  rect(c, 0, FLOOR - 6, WIDTH, 1, shade(WALL, 0.1));

  // the open side to the road on the left, bright with daylight: the hedge, the road beyond
  rect(c, 0, CEIL, PILLARS[0] - 12, FLOOR - CEIL, '#cfe0ea');
  rect(c, 0, FLOOR - 58, PILLARS[0] - 12, 30, '#e9eef0');
  bush(c, 26, FLOOR - 4, 70, 30, 911);
  hedge(c, 0, FLOOR, PILLARS[0] - 12, 12, 912);
  lights.push({ x: EXIT_X, y: FLOOR - 50, r: 140, color: [255, 246, 226], strength: 0.85, daylight: true });
  lights.push({ x: EXIT_X + 50, y: FLOOR + 24, r: 110, color: [255, 246, 226], strength: 0.6, daylight: true });

  // the brown door into the halls
  rect(c, HALL_DOOR - 18, FLOOR - 66, 36, 66, '#3a2f2c');
  rect(c, HALL_DOOR - 15, FLOOR - 63, 30, 63, '#5a463e');
  rect(c, HALL_DOOR - 15, FLOOR - 63, 30, 1, '#6e584e');
  rect(c, HALL_DOOR, FLOOR - 63, 1, 63, '#3a2f2c');
  rect(c, HALL_DOOR - 4, FLOOR - 32, 2, 4, '#c9b08a');
  rect(c, HALL_DOOR + 3, FLOOR - 32, 2, 4, '#c9b08a');
  rect(c, HALL_DOOR - 10, FLOOR - 78, 20, 8, '#f4f2ec');
  signCentered(c, 'HALL', HALL_DOOR, FLOOR - 76, P.maroon);

  // the cashier's window: its sign, the TV above, dark glass over a ledge, notices taped on
  rect(c, CASHIER - 30, FLOOR - 142, 60, 34, '#1f1e24');
  rect(c, CASHIER - 28, FLOOR - 140, 56, 30, '#2f4a8a');
  rect(c, CASHIER - 28, FLOOR - 140, 56, 6, '#3f5fa8');
  for (let ly = FLOOR - 130; ly < FLOOR - 114; ly += 4) rect(c, CASHIER - 24, ly, 30 + ((ly * 7) % 16), 1, '#c9d8f0');
  rect(g, CASHIER - 28, FLOOR - 140, 56, 30, '#6f8fd0');
  rect(c, CASHIER - 2, FLOOR - 108, 4, 6, '#2a2830');
  rect(c, CASHIER - 34, FLOOR - 100, 68, 11, '#f4f0e4');
  rect(c, CASHIER - 34, FLOOR - 100, 68, 1, '#ffffff');
  signCentered(c, 'CASHIER', CASHIER, FLOOR - 97, P.maroon);
  rect(c, CASHIER - 38, FLOOR - 86, 76, 44, '#8a8478');
  rect(c, CASHIER - 35, FLOOR - 83, 70, 38, '#3a3c48');
  rect(c, CASHIER - 35, FLOOR - 83, 70, 2, '#5a5e6c');
  rect(c, CASHIER, FLOOR - 83, 1, 38, '#8a8478');
  rect(g, CASHIER - 35, FLOOR - 81, 70, 36, '#e0b878');
  // the cashier inside, behind the glass
  rect(c, CASHIER + 8, FLOOR - 66, 12, 21, '#5a6a8a');
  rect(c, CASHIER + 10, FLOOR - 76, 8, 9, '#c9946a');
  rect(c, CASHIER + 10, FLOOR - 77, 8, 3, '#2a2228');
  // the slot and the ledge
  rect(c, CASHIER - 12, FLOOR - 50, 24, 5, '#26242a');
  rect(c, CASHIER - 42, FLOOR - 45, 84, 4, '#cfc8b8');
  rect(c, CASHIER - 42, FLOOR - 45, 84, 1, '#ece6d8');
  rect(c, CASHIER - 40, FLOOR - 41, 80, 41, shade(WALL, -0.06));
  for (const [nx, ny] of [[-30, -78], [-20, -74], [22, -79]]) {
    rect(c, CASHIER + nx, FLOOR + ny, 8, 10, '#fbf9f2');
    for (let ly = 3; ly < 9; ly += 2) rect(c, CASHIER + nx + 1, FLOOR + ny + ly, 6, 1, '#9a9488');
  }
  lights.push({ x: CASHIER, y: FLOOR - 64, r: 70, color: [255, 220, 170], strength: 0.4 });
  lights.push({ x: CASHIER, y: FLOOR - 125, r: 50, color: [140, 170, 255], strength: 0.35 });

  // two whiteboards on their green stands, with the week's notices scrawled on them
  for (const dx of [-24, 24]) {
    const bx = BOARDS + dx;
    line(c, bx - 14, FLOOR - 30, bx - 18, FLOOR, '#3a6a3a', 2);
    line(c, bx + 14, FLOOR - 30, bx + 18, FLOOR, '#3a6a3a', 2);
    rect(c, bx - 16, FLOOR - 62, 32, 32, '#f7f7f3');
    rect(c, bx - 17, FLOOR - 63, 34, 1, '#9a9aa0');
    rect(c, bx - 17, FLOOR - 30, 34, 2, '#9a9aa0');
    rect(c, bx - 17, FLOOR - 63, 1, 35, '#9a9aa0');
    rect(c, bx + 16, FLOOR - 63, 1, 35, '#9a9aa0');
    const ink = dx < 0 ? '#2f4f9a' : '#b8322e';
    for (let ly = FLOOR - 56; ly < FLOOR - 36; ly += 4) rect(c, bx - 12, ly, 12 + ((ly * 5 + dx) % 13), 1, ink);
    if (dx > 0) sign(c, 'MEMO', bx - signWidth('MEMO') / 2, FLOOR - 60, ink);
  }

  // the window behind its white grille, and the cash machine set into the wall
  rect(c, ATM - 52, FLOOR - 90, 36, 44, '#2c2a30');
  for (let ly = FLOOR - 88; ly < FLOOR - 48; ly += 8) {
    for (let lx = ATM - 50; lx < ATM - 18; lx += 8) {
      rect(c, lx + 2, ly, 4, 1, '#ecebe6');
      rect(c, lx + 2, ly + 7, 4, 1, '#ecebe6');
      rect(c, lx, ly + 2, 1, 4, '#ecebe6');
      rect(c, lx + 7, ly + 2, 1, 4, '#ecebe6');
      px(c, lx + 1, ly + 1, '#ecebe6');
      px(c, lx + 6, ly + 1, '#ecebe6');
      px(c, lx + 1, ly + 6, '#ecebe6');
      px(c, lx + 6, ly + 6, '#ecebe6');
    }
  }
  rect(c, ATM - 54, FLOOR - 92, 40, 2, '#f4f2ec');
  rect(c, ATM - 54, FLOOR - 46, 40, 2, '#cfc8b8');
  rect(c, ATM - 6, FLOOR - 76, 26, 52, '#b9bcc4');
  rect(c, ATM - 6, FLOOR - 76, 26, 1, '#e4e7ec');
  rect(c, ATM - 4, FLOOR - 82, 22, 6, '#c8342f');
  signCentered(c, 'ATM', ATM + 7, FLOOR - 81, '#ffffff');
  rect(c, ATM - 2, FLOOR - 70, 18, 12, '#203048');
  rect(c, ATM, FLOOR - 68, 14, 8, '#3f7fc0');
  rect(g, ATM, FLOOR - 68, 14, 8, '#7fb0f0');
  for (let ky = FLOOR - 54; ky < FLOOR - 44; ky += 3) rect(c, ATM, ky, 8, 2, '#8a8d95');
  rect(c, ATM + 10, FLOOR - 54, 6, 2, '#26242a');
  rect(c, ATM - 6, FLOOR - 24, 26, 24, shade(WALL, -0.05));
  lights.push({ x: ATM + 7, y: FLOOR - 64, r: 40, color: [140, 180, 255], strength: 0.35 });

  // the dark way through to the stairs, with its sign
  rect(c, STAIRS - 20, FLOOR - 70, 40, 70, '#2f2c34');
  rect(c, STAIRS - 20, FLOOR - 70, 40, 2, '#1f1d22');
  for (let k = 0; k < 6; k++) rect(c, STAIRS - 16 + k * 6, FLOOR - 12 - k * 9, 18 - k * 2, 2, '#4a4650');
  rect(c, STAIRS - 14, FLOOR - 84, 28, 9, '#2f7a4a');
  signCentered(c, 'STAIRS', STAIRS, FLOOR - 82, '#ffffff');

  // the pillars: stacked stone with the poster panels, white above the stone, in front of everything
  PILLARS.forEach((x0, i) => {
    rect(c, x0 - 13, CEIL, 26, FLOOR - CEIL - 92, '#ecebe6');
    rect(c, x0 + 10, CEIL, 3, FLOOR - CEIL - 92, '#cfceca');
    stonePillar(c, x0 - 13, FLOOR, 26, 92);
    posterPanel(c, x0 - 13, 26, i % 3);
  });

  // the ceiling: the slab's white underside, its edge, the strip lights in it
  rect(c, 0, 0, WIDTH, CEIL, '#d9d9d6');
  rect(c, 0, CEIL - 3, WIDTH, 3, '#b8bcc2');
  rect(c, 0, CEIL - 1, WIDTH, 1, '#8f939a');
  for (let x = 0; x < WIDTH; x += 60) rect(c, x, 0, 1, CEIL - 3, '#c6c6c2');
  for (let x = 40; x < WIDTH - 20; x += 90) {
    rect(c, x, CEIL - 10, 30, 3, '#fbf8ec');
    rect(g, x - 2, CEIL - 11, 34, 5, '#fff0c8');
    lights.push({ x: x + 15, y: CEIL, r: 80, color: [255, 240, 210], strength: 0.45 });
  }

  // the floor: white tiles, and the red-brown lines crossing them in big diamonds
  rect(c, 0, FLOOR, WIDTH, VIEW_H - FLOOR, '#ece8e0');
  rect(c, 0, FLOOR, WIDTH, 1, '#d4cfc4');
  for (const y of [FLOOR + 8, FLOOR + 20, FLOOR + 38]) rect(c, 0, y, WIDTH, 1, '#dcd7cc');
  const red = '#a3523c';
  const depth = VIEW_H - FLOOR;
  for (let x = -depth * 3; x < WIDTH + depth * 3; x += 90) {
    for (let y = 0; y < depth; y++) {
      // the lines spread out as they come towards you, and get thicker
      const spread = y * (1.2 + y / depth);
      const w = y > depth * 0.5 ? 2 : 1;
      rect(c, x + spread, FLOOR + y, w, 1, red);
      rect(c, x + 90 - spread, FLOOR + y, w, 1, red);
    }
  }
  return { canvas, glow };
}

/** The canopy's edge and the pillars along the road side, close to the camera and out of focus. */
function frontLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(Math.ceil(WIDTH * 1.3), VIEW_H);
  rect(c, 0, 0, canvas.width, 12, SILHOUETTE.dark);
  rect(c, 0, 12, canvas.width, 3, SILHOUETTE.mid);
  for (let x = 260; x < canvas.width; x += 460) {
    rect(c, x, 0, 18, VIEW_H, SILHOUETTE.mid);
    rect(c, x + 13, 0, 5, VIEW_H, SILHOUETTE.dark);
  }
  return canvas;
}

export function buildApsLobby(): AreaDef {
  const lights: AreaLight[] = [];
  const main = build(lights);

  return {
    id: 'apslobby',
    title: 'APS Lobby',
    subtitle: 'Sa ilalim ng canopy',
    subtitleEn: 'Under the canopy',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 24],
    outdoor: false,
    visitFlag: 'visited_aps_lobby',
    layers: [
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.3, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: apsLobbyHotspots({ exit: EXIT_X, hall: HALL_DOOR, cashier: CASHIER, boards: BOARDS, atm: ATM + 7, stairs: STAIRS }),
    npcs: [],
    spawns: {
      front: { x: EXIT_X + 16, facing: 1 },
    },
  };
}

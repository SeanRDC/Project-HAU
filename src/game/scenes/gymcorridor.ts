// The corridor inside the front's left-hand door of the Immaculate Heart
// Gymnasium, looking south-east at the stairs, as in `entering from the left
// entrance...jpg` and `stairs inside IH gym leading to the benches on the
// second floor.jpg`: a straight flight with yellow nosings climbing to the
// bleachers behind a folding steel grille, lockers by its foot. The window of
// the equipment room, where you borrow balls and rackets, is on the camera's
// side, its diagonal grille in the foreground. The door to the lot is on the
// right; the lobby under the side entrance is through the far end on the left.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, line, px, rect, sign } from '../../engine/pix';
import { foldingGrille, lockers, sideStairs } from '../art/ihgymin';
import { Climb, comeDown, gymCorridorHotspots } from '../story/ihgym';
import { AreaDef, AreaLight, Layer } from '../types';

const WIDTH = 500;
const WALK = 240;
const FLOOR = 200;
const CEIL = 30;
/** the foot of the stairs, and where they come out at the top, further back and up */
const STAIRS_FOOT = 346;
const STAIRS_TOP = 196;
const STAIRS_RISE = 74;
const LOBBY_X = 22;
const DOOR_X = 470;
const EQUIPMENT_X = 112;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const rand = rng(7501);

  // the ceiling and the wall
  rect(c, 0, 0, WIDTH, CEIL, '#e9e8e3');
  rect(c, 0, CEIL - 4, WIDTH, 4, '#d6d5cf');
  rect(c, 0, CEIL, WIDTH, FLOOR - CEIL, '#e3e1da');
  for (let i = 0; i < 40; i++) px(c, rand() * WIDTH, CEIL + rand() * (FLOOR - CEIL), '#cfccc4');
  rect(c, 0, FLOOR - 10, WIDTH, 10, '#c9c6bd');
  for (const x of [80, 260, 420]) {
    rect(c, x, 10, 30, 3, '#f8f8f4');
    rect(g, x, 10, 30, 4, '#fff6dc');
    lights.push({ x: x + 15, y: 18, r: 80, color: [240, 248, 255], strength: 0.6, always: true });
  }

  // the far end on the left: the corridor opens into the lobby, the court's light beyond
  rect(c, 0, 60, 46, FLOOR - 60, '#8e8c86');
  rect(c, 6, 70, 34, FLOOR - 70, '#d9d5c6');
  rect(g, 6, 70, 34, FLOOR - 70, '#fff1c8');
  rect(c, 14, 150, 18, FLOOR - 150, '#2a4a9a');

  // the stairwell: the opening up to the second floor, the roof's sound panels showing through it
  rect(c, STAIRS_TOP - 30, CEIL, STAIRS_FOOT - STAIRS_TOP + 40, 44, '#a7aaad');
  for (let k = 0; k < 3; k++) {
    for (let x = STAIRS_TOP - 26; x < STAIRS_FOOT + 6; x += 18) {
      const cols = ['#c6303a', '#e2b53b', '#c9a873', '#8e8a85'];
      rect(c, x + k * 5, CEIL + 6 + k * 12, 12, 5, cols[Math.floor(rand() * 4)]);
    }
  }
  rect(c, STAIRS_TOP - 30, CEIL + 44, STAIRS_FOOT - STAIRS_TOP + 40, 3, '#cfcdc6');
  // the flight, climbing to the left along the wall
  sideStairs(c, STAIRS_FOOT, FLOOR, STAIRS_TOP, FLOOR - STAIRS_RISE - 30, 14);
  // the steel grille pulled back from the foot of the stairs
  foldingGrille(c, STAIRS_FOOT + 4, 104, 54, FLOOR - 104, 0.7);
  // the lockers past it, a bin, the notice on the wall
  lockers(c, 392, FLOOR, 5);
  rect(c, 440, FLOOR - 22, 10, 22, '#9fa2a8');
  rect(c, 440, FLOOR - 22, 10, 2, '#c9ccd2');
  sign(c, 'POR', 441, FLOOR - 14, '#4a4c52');
  rect(c, 240, 90, 30, 22, '#f4f2e8');
  rect(c, 240, 90, 30, 2, '#5aa0c8');
  for (let y = 96; y < 110; y += 3) rect(c, 243, y, 24, 1, '#9a9890');

  // the door to the lot on the right: daylight, the steps down
  rect(c, DOOR_X - 16, 70, 32, FLOOR - 70, '#5b5a56');
  rect(c, DOOR_X - 13, 76, 26, FLOOR - 76, '#f2ecd8');
  rect(g, DOOR_X - 13, 76, 26, FLOOR - 76, '#fff4d0');
  rect(c, DOOR_X - 13, 76, 26, 8, '#b7b2a3');
  for (let y = 77; y < 84; y += 2) rect(c, DOOR_X - 13, y, 26, 1, '#8c877b');
  lights.push({ x: DOOR_X, y: FLOOR - 40, r: 90, color: [255, 240, 210], strength: 0.6, daylight: true });

  // the floor: painted grey, worn, chalked
  rect(c, 0, FLOOR, WIDTH, VIEW_H - FLOOR, '#575a60');
  for (let i = 0; i < WIDTH * 2; i++) px(c, rand() * WIDTH, FLOOR + rand() * (VIEW_H - FLOOR), rand() > 0.5 ? '#63666c' : '#4c4f55');
  line(c, 180, VIEW_H, 290, FLOOR + 6, '#c9cbcf', 1);
  for (let i = 0; i < 14; i++) disc(c, 160 + rand() * 200, FLOOR + 10 + rand() * 50, 1, '#d9dbdf');
  return { canvas, glow };
}

/**
 * The equipment room's window on the camera's side: a diagonal steel grille,
 * the blue shelves of balls behind it, its framed sign.
 */
function equipmentWindow(): Layer {
  const parallax = 1.2;
  const [canvas, c] = makeCanvas(Math.ceil(WIDTH * parallax), VIEW_H);
  const x0 = 40;
  const x1 = 200;
  const top = 150;
  // the shelves and balls
  rect(c, x0, top, x1 - x0, VIEW_H - top, '#2c4a7a');
  for (let y = top + 18; y < VIEW_H; y += 22) rect(c, x0, y, x1 - x0, 3, '#5aa0d8');
  const rand = rng(7502);
  for (let y = top + 6; y < VIEW_H; y += 22) {
    for (let x = x0 + 6; x < x1 - 6; x += 10) disc(c, x, y + 6, 4, rand() > 0.5 ? '#c8642c' : '#e9e6dc');
  }
  // the grille over it, and the frame
  for (let k = -20; k < x1 - x0 + 20; k += 14) {
    line(c, x0 + k, top, x0 + k + 40, VIEW_H, '#b9bcc4', 2);
    line(c, x0 + k + 40, top, x0 + k, VIEW_H, '#b9bcc4', 2);
  }
  rect(c, x0 - 6, top - 6, x1 - x0 + 12, 6, '#d9d8d2');
  rect(c, x0 - 6, top, 6, VIEW_H - top, '#d9d8d2');
  rect(c, x1, top, 6, VIEW_H - top, '#d9d8d2');
  rect(c, x0 + 60, top + 8, 34, 44, '#f4f2e8');
  rect(c, x0 + 59, top + 7, 36, 1, '#5aa0c8');
  rect(c, x0 + 59, top + 52, 36, 1, '#5aa0c8');
  for (let y = top + 14; y < top + 48; y += 4) rect(c, x0 + 64, y, 26, 1, '#9a9890');
  return { canvas, parallax, front: true };
}

export function buildGymCorridor(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const climb: Climb = { foot: STAIRS_FOOT, top: STAIRS_TOP, rise: STAIRS_RISE };
  return {
    id: 'gymcorridor',
    title: 'IH Gym Corridor',
    subtitle: 'Equipment room at hagdan',
    subtitleEn: 'Equipment room and stairs',
    width: WIDTH,
    walkY: WALK,
    bounds: [14, WIDTH - 16],
    outdoor: false,
    layers: [{ canvas: main.canvas, parallax: 1 }, equipmentWindow()],
    glow: main.glow,
    lights,
    hotspots: gymCorridorHotspots({ lobby: LOBBY_X, equipment: EQUIPMENT_X, door: DOOR_X }, climb),
    npcs: [],
    spawns: {
      front: { x: DOOR_X - 10, facing: -1 },
      lobby: { x: LOBBY_X + 14, facing: 1 },
      upstairs: { x: STAIRS_FOOT, facing: 1 },
    },
    // coming down from the second floor: down the flight towards the camera
    intro: (_game, x) => (x === STAIRS_FOOT ? comeDown(climb) : null),
  };
}

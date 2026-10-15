// The court floor of the Immaculate Heart Gymnasium, looking north-east across
// the court at the far bleachers, as in `middle view of the ih gym.jpg`. The
// side entrance's lobby is through the gates on the left; the stage is off to
// the right, past the white floor in front of it. The front's right-hand door
// comes in on the camera's side, near the stage end.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { rect } from '../../engine/pix';
import {
  WALL_WHITE, acousticRoof, angelTrophy, bleachers, ceilingFan, chairStack, courtFloor, foldingGrille, hangingSpeaker,
  pipeRail, portableHoop, stripePanel, stripeWall, wallBoard, whiteFloor,
} from '../art/ihgymin';
import { gymHallHotspots, gymHallNpcs } from '../story/ihgym';
import { AreaDef, AreaLight, Layer } from '../types';

export const HALL_WIDTH = 780;
const WIDTH = HALL_WIDTH;
const WALK = 242;
/** the far edge of the floor, at the foot of the striped wall */
const FAR = 190;
/** the court, end line to end line */
export const COURT_L = 100;
export const COURT_R = 560;
/** the second floor's front edge across the hall, and the top of its bleachers */
const SLAB = 148;
const STAND_TOP = 84;
const ROOF_BOTTOM = 64;
/** the gates through to the lobby, the front door on the camera's side, the way to the stage */
const LOBBY_X = 28;
const DOOR_X = 628;
const STAGE_X = 742;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  const lamps = acousticRoof(c, 0, WIDTH, 0, ROOF_BOTTOM, 7101);
  for (const [lx, ly] of lamps) lights.push({ x: lx, y: ly + 6, r: 90, color: [255, 246, 220], strength: 0.55, always: true });
  for (const fx of [210, 420, 640]) ceilingFan(c, fx, 46, 22);
  hangingSpeaker(c, 700, 0, 30, 30);

  // the far side: the bleachers on the second floor over the striped wall
  rect(c, 0, ROOF_BOTTOM, WIDTH, FAR - ROOF_BOTTOM, WALL_WHITE);
  bleachers(c, g, 40, 620, SLAB, STAND_TOP, 7102);
  // the scoreboard over the middle aisle
  rect(c, 300, STAND_TOP - 8, 44, 18, '#16161a');
  rect(c, 300, STAND_TOP - 8, 44, 1, '#3a3a40');
  for (const [dx, col] of [[6, '#e8483a'], [32, '#e8483a'], [19, '#f2c84a']] as const) rect(c, 300 + dx, STAND_TOP - 2, 6, 5, col);
  rect(g, 304, STAND_TOP - 4, 36, 9, '#ff9a6a');
  // the slab edge and the railing along the front of the bleachers
  rect(c, 0, SLAB, WIDTH, 6, '#f2efe8');
  rect(c, 0, SLAB + 6, WIDTH, 1, '#a9a59b');
  pipeRail(c, 40, 620, SLAB - 12, 12);
  // the end of the hall on the right: the stage end wall with its striped panel
  rect(c, 620, ROOF_BOTTOM, WIDTH - 620, FAR - ROOF_BOTTOM, '#e3dfd5');
  stripePanel(c, 660, 74, 70, 54, true);
  // the balcony at the stage end, and the stairs down from it
  rect(c, 620, SLAB, 50, 6, '#f2efe8');
  pipeRail(c, 620, 670, SLAB - 12, 12);
  for (let i = 0; i < 6; i++) rect(c, 672 + i * 6, SLAB + 4 + i * 6, 7, 6, i % 2 ? '#6c6f76' : '#5d6068');
  // the end on the left: the wall, the gates through to the lobby
  rect(c, 0, ROOF_BOTTOM, 40, FAR - ROOF_BOTTOM, '#dcd8ce');
  rect(c, 38, ROOF_BOTTOM, 2, FAR - ROOF_BOTTOM, '#bdb9ae');

  stripeWall(c, 40, 620, SLAB + 7, FAR, 7103);
  // under the stage-end balcony: a doorway, the angel trophy, chairs stacked by the wall
  rect(c, 620, SLAB + 7, 120, FAR - SLAB - 7, '#e8e4da');
  rect(c, 640, FAR - 30, 14, 30, '#3c3a3e');
  angelTrophy(c, 700, FAR + 2);
  chairStack(c, 668, FAR + 1, 5);
  chairStack(c, 680, FAR + 1, 4);
  // the gate to the lobby, folded back
  rect(c, 4, SLAB + 2, 32, FAR - SLAB - 2, '#4a4a4e');
  rect(c, 6, FAR - 16, 28, 16, '#6a6a6c');
  foldingGrille(c, 4, SLAB + 2, 32, FAR - SLAB - 2, 0.6);
  // the cross-court boards hung over the striped wall
  for (const bx of [210, 330, 450]) wallBoard(c, bx, SLAB + 10);

  // the floor: dark concrete round the court, the court, the white floor in front of the stage
  rect(c, 0, FAR, WIDTH, VIEW_H - FAR, '#5b5d62');
  for (let y = FAR; y < VIEW_H; y += 9) rect(c, 0, y, WIDTH, 1, '#53555a');
  courtFloor(c, COURT_L, COURT_R, FAR + 2, VIEW_H, 7104);
  whiteFloor(c, 590, WIDTH, FAR + 4, VIEW_H, 7105);
  // its yellow lines
  rect(c, 600, FAR + 8, WIDTH - 600, 1, '#e2c13a');
  rect(c, 600, FAR + 8, 1, VIEW_H - FAR - 8, '#e2c13a');
  rect(c, 690, FAR + 8, 1, VIEW_H - FAR - 8, '#e2c13a');

  portableHoop(c, COURT_L - 30, WALK + 8, 1);
  portableHoop(c, COURT_R + 30, WALK + 8, -1);

  // the near side's lights over the floor, and the daylight through the windows
  lights.push({ x: 330, y: STAND_TOP - 10, r: 160, color: [255, 236, 200], strength: 0.4, daylight: true });
  return { canvas, glow };
}

/** Out of focus along the bottom: the near railing, as in the photo taken from behind it. */
function nearRail(): Layer {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const rand = rng(7110);
  for (const [a, b] of [[60, 300], [360, 560]] as const) {
    rect(c, a, VIEW_H - 8, b - a, 3, '#2a2d33');
    rect(c, a, VIEW_H - 8, b - a, 1, '#4a4f58');
    for (let x = a; x < b; x += 40 + rand() * 10) rect(c, x, VIEW_H - 8, 3, 8, '#22252a');
  }
  return { canvas, parallax: 1.15, front: true };
}

export function buildGymHall(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  return {
    id: 'gymhall',
    title: 'IH Gym',
    subtitle: 'Immaculate Heart Gymnasium',
    width: WIDTH,
    walkY: WALK,
    bounds: [16, WIDTH - 20],
    outdoor: false,
    visitFlag: 'entered_gym',
    layers: [{ canvas: main.canvas, parallax: 1 }, nearRail()],
    glow: main.glow,
    lights,
    hotspots: gymHallHotspots({ lobby: LOBBY_X, seal: Math.round((COURT_L + COURT_R) / 2), door: DOOR_X, stage: STAGE_X, hoop: COURT_R + 4 }),
    npcs: gymHallNpcs({ shooter: [COURT_R - 90, COURT_R - 20], coach: COURT_L + 60, class: COURT_L + 110 }),
    spawns: {
      front: { x: DOOR_X, facing: -1 },
      lobby: { x: LOBBY_X + 14, facing: 1 },
      stage: { x: STAGE_X - 10, facing: -1 },
    },
  };
}

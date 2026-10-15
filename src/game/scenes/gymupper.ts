// The second floor of the Immaculate Heart Gymnasium: the walkway along the
// front of the south-west bleachers, behind the railing, looking down across
// the court at the bleachers on the far side, as in `full view from the second
// floor of the ih gym.jpg` and `benches on the ih gym second floor.jpg`. The
// stairs up from the corridor come out at the left end; at the right end,
// stairs go down beside the stage.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { line, rect } from '../../engine/pix';
import {
  WALL_WHITE, acousticRoof, angelTrophy, bleachers, ceilingFan, courtFloor, hangingSpeaker, pipeRail, portableHoop, stripePanel,
  stripeWall, welcomeBanner, whiteFloor,
} from '../art/ihgymin';
import { gymUpperHotspots } from '../story/ihgym';
import { AreaDef, AreaLight, Layer } from '../types';
import { COURT_L, COURT_R, HALL_WIDTH } from './gymhall';

const WIDTH = HALL_WIDTH;
const WALK = 246;
/** the far side, seen from up here: the top of its bleachers, its slab edge, the court far below */
const ROOF_BOTTOM = 44;
const STAND_TOP = 58;
const SLAB = 102;
const COURT_FAR = 128;
const COURT_NEAR = 222;
/** the railing along the edge of the walkway, between you and the drop to the court */
const RAIL = 206;
/** the top of the stairs from the corridor, and the stairs down to the stage */
const DOWN_X = 46;
const STAGE_X = 742;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // up here the roof is close: the panels are big overhead
  const lamps = acousticRoof(c, 0, WIDTH, 0, ROOF_BOTTOM, 7301);
  for (const [lx, ly] of lamps) lights.push({ x: lx, y: ly + 6, r: 90, color: [255, 246, 220], strength: 0.5, always: true });
  for (const fx of [210, 420, 640]) ceilingFan(c, fx, 34, 26);
  hangingSpeaker(c, 690, 0, 22, 36);

  // the far side, level with you: its bleachers, the slab edge, the top of the striped wall under it
  rect(c, 0, ROOF_BOTTOM, WIDTH, COURT_FAR - ROOF_BOTTOM, WALL_WHITE);
  bleachers(c, g, 40, 620, SLAB, STAND_TOP, 7302);
  rect(c, 0, SLAB, WIDTH, 5, '#f2efe8');
  pipeRail(c, 40, 620, SLAB - 10, 10);
  stripeWall(c, 40, 620, SLAB + 5, COURT_FAR, 7303);
  // the stage end on the right, with its panel and the stage itself, seen side on from up here
  rect(c, 620, ROOF_BOTTOM, WIDTH - 620, COURT_FAR - ROOF_BOTTOM, '#e3dfd5');
  stripePanel(c, 650, 52, 64, 46, true);
  rect(c, 716, 96, WIDTH - 716, 26, '#d6d1c6');
  rect(c, 716, 96, WIDTH - 716, 2, '#efebe2');
  welcomeBanner(c, 716, WIDTH, 112, 10);
  angelTrophy(c, 700, COURT_FAR + 2);

  // the court far below, and the white floor in front of the stage
  rect(c, 0, COURT_FAR, WIDTH, RAIL - COURT_FAR, '#5b5d62');
  courtFloor(c, COURT_L, COURT_R, COURT_FAR, COURT_NEAR, 7304);
  whiteFloor(c, 590, WIDTH, COURT_FAR + 2, COURT_NEAR, 7305);
  rect(c, 600, COURT_FAR + 6, WIDTH - 600, 1, '#e2c13a');
  portableHoop(c, COURT_L - 22, COURT_FAR + 46, 1, 0.6);
  portableHoop(c, COURT_R + 22, COURT_FAR + 46, -1, 0.6);

  // the edge of the walkway: a low concrete kerb and the steel railing on it
  rect(c, 0, RAIL + 14, WIDTH, VIEW_H - RAIL - 14, '#585a5f');
  for (let y = RAIL + 18; y < VIEW_H; y += 6) rect(c, 0, y, WIDTH, 1, '#505257');
  const rand = rng(7306);
  for (let i = 0; i < WIDTH * 2; i++) rect(c, rand() * WIDTH, RAIL + 15 + rand() * (VIEW_H - RAIL - 15), 1, 1, rand() > 0.5 ? '#6a6c71' : '#46484c');
  rect(c, 0, RAIL + 12, WIDTH, 3, '#7a7c80');
  pipeRail(c, 70, WIDTH - 50, RAIL - 12, 26, '#4c525c');
  // the top of the stairs from the corridor on the left: a dark well with yellow-edged steps going down
  rect(c, 8, RAIL + 14, 60, 22, '#2f3036');
  for (let i = 0; i < 4; i++) rect(c, 12 + i * 3, RAIL + 18 + i * 5, 52 - i * 6, 2, '#e2c13a');
  pipeRail(c, 8, 70, RAIL - 4, 18, '#4c525c');
  line(c, 8, RAIL - 4, 8, RAIL + 34, '#4c525c', 2);
  // and the stairs down beside the stage on the right
  rect(c, WIDTH - 50, RAIL + 14, 42, 24, '#2f3036');
  for (let i = 0; i < 4; i++) rect(c, WIDTH - 46 + i * 2, RAIL + 18 + i * 5, 34 - i * 4, 2, '#e2c13a');

  // daylight through the windows behind the far bleachers
  lights.push({ x: 330, y: STAND_TOP - 6, r: 170, color: [255, 236, 200], strength: 0.4, daylight: true });
  return { canvas, glow };
}

/** The benches of the near bleachers rising behind you towards the camera, out of focus along the bottom. */
function nearBenches(): Layer {
  const parallax = 1.25;
  const [canvas, c] = makeCanvas(Math.ceil(WIDTH * parallax), VIEW_H);
  for (let i = 0; i < 3; i++) {
    const y = VIEW_H - 14 + i * 7;
    rect(c, 0, y, canvas.width, 4, '#2a2c31');
    rect(c, 0, y, canvas.width, 1, '#4a4d54');
  }
  for (let x = 30; x < canvas.width; x += 90) rect(c, x, VIEW_H - 16, 3, 16, '#22252a');
  return { canvas, parallax, front: true };
}

export function buildGymUpper(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  return {
    id: 'gymupper',
    title: 'IH Gym, Second Floor',
    subtitle: 'Sa bleachers',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 22],
    outdoor: false,
    layers: [{ canvas: main.canvas, parallax: 1 }, nearBenches()],
    glow: main.glow,
    lights,
    hotspots: gymUpperHotspots({ down: DOWN_X, view: 330, stage: STAGE_X }),
    npcs: [],
    spawns: {
      stairs: { x: DOWN_X + 20, facing: 1 },
      stage: { x: STAGE_X - 14, facing: -1 },
    },
  };
}

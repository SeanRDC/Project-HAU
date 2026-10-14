// The Aero Laboratory at the far end of the Covered Court, through the small
// door in its yellow gate: a hangar of grey-green corrugated walls under the
// same steel roof, where the aeronautics students work on real aircraft. From
// the left: the old trainer with the dark red wing, the jet engines in their
// yellow frames, ANGEL-1, the orange high-wing trainer, then the benches by the
// door. From `aero inside the aero.jpg`, `inside aero angle 1.jpg` and
// `inside aero angle 2.jpg` (art/ccourt.ts).

import { VIEW_H, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { line, px, rect } from '../../engine/pix';
import {
  ccColumn, ccRoof, corrugatedWall, extinguisher, hangarBay, jetEngine, noticeBoard, standFan, trainerPlane, workbench,
} from '../art/ccourt';
import { aeroHotspots, aeroNpcs } from '../story/ccourt';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 720;
const WALK = 244;
const EAVE = 70;
const FLOOR = 186;
const DOOR_X = 690;
const ANGEL_X = 470;
const OLD_X = 120;
const ENGINE_X = 300;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const rand = rng(5201);

  ccRoof(c, 0, WIDTH, EAVE, 120, 5202);
  for (let x = 80; x < WIDTH; x += 120) lights.push({ x, y: EAVE * 0.5, r: 90, color: [255, 246, 226], strength: 0.5, always: true });
  // the far wall: corrugated sheeting, the high windows of the covered court's gable over it
  corrugatedWall(c, 0, WIDTH, EAVE + 15, FLOOR);
  for (let x = 30; x < WIDTH; x += 70) {
    rect(c, x, EAVE + 18, 44, 14, '#e9eef0');
    rect(g, x, EAVE + 18, 44, 14, '#fff0c0');
    for (let k = 0; k < 44; k += 11) rect(c, x + k, EAVE + 18, 1, 14, '#9aa0a6');
  }
  lights.push({ x: WIDTH / 2, y: EAVE + 24, r: 200, color: [255, 240, 210], strength: 0.3, daylight: true });
  for (let x = 60; x < WIDTH; x += 120) ccColumn(c, x, EAVE + 15, FLOOR, 7);
  // posters and the notice boards on the wall
  noticeBoard(c, 560, 118, 34, 26);
  noticeBoard(c, 602, 120, 22, 22);
  for (const [x, col] of [[200, '#d9a63a'], [222, '#3f7fb8'], [244, '#c8282e']] as const) {
    rect(c, x, 124, 16, 10, col);
    rect(c, x + 2, 126, 12, 6, '#f1efe8');
  }

  // the floor: grey concrete, the red bays outlined in white, a hazard line along the walkway
  rect(c, 0, FLOOR, WIDTH, VIEW_H - FLOOR, '#7f817f');
  for (let i = 0; i < WIDTH * 3; i++) px(c, rand() * WIDTH, FLOOR + rand() * (VIEW_H - FLOOR), rand() > 0.5 ? '#898b89' : '#727472');
  hangarBay(c, 30, 230, FLOOR + 4, VIEW_H);
  hangarBay(c, 250, 380, FLOOR + 4, VIEW_H);
  hangarBay(c, 390, 590, FLOOR + 4, VIEW_H);
  for (let x = 0; x < WIDTH; x += 8) rect(c, x, FLOOR + 2, 4, 1, x % 16 ? '#e2c13a' : '#1c1c20');

  // a white fuselage lying by the wall, a work table with its chairs at the back
  rect(c, 600, FLOOR - 14, 70, 14, '#ece9e2');
  rect(c, 600, FLOOR - 14, 70, 3, '#ffffff');
  line(c, 600, FLOOR - 1, 670, FLOOR - 1, '#b7b3aa', 1);
  workbench(c, 20, FLOOR + 6, 70);
  // the aircraft and the engines
  trainerPlane(c, OLD_X, FLOOR + 32, -1, '#d9a63a', '#6e2a2c', '', '#2a2a30', 1.05);
  jetEngine(c, ENGINE_X - 40, FLOOR + 20, 54);
  jetEngine(c, ENGINE_X + 36, FLOOR + 36, 70);
  trainerPlane(c, ANGEL_X, FLOOR + 50, 1, '#f0a326', '#1c1c20', 'ANGEL-1', '#1c1c20', 1.25);
  // by the door: the bench, the fan, the extinguisher
  workbench(c, 600, VIEW_H - 8, 60);
  standFan(c, 660, FLOOR + 30);
  extinguisher(c, 700, FLOOR + 22);
  // the door back to the covered court, and the daylight through it
  rect(c, DOOR_X - 12, FLOOR - 58, 24, 58, '#5c5a52');
  rect(c, DOOR_X - 10, FLOOR - 56, 20, 56, '#e7e2c8');
  rect(g, DOOR_X - 10, FLOOR - 56, 20, 56, '#fff2c8');
  lights.push({ x: DOOR_X, y: FLOOR - 20, r: 70, color: [255, 240, 210], strength: 0.5, daylight: true });
  return { canvas, glow };
}

export function buildAeroLab(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  return {
    id: 'aerolab',
    title: 'Aero Laboratory',
    subtitle: 'Sa dulo ng Covered Court',
    width: WIDTH,
    walkY: WALK,
    bounds: [16, WIDTH - 16],
    outdoor: false,
    visitFlag: 'visited_aero',
    layers: [{ canvas: main.canvas, parallax: 1 }],
    glow: main.glow,
    lights,
    hotspots: aeroHotspots({ door: DOOR_X - 6, angel: ANGEL_X, old: OLD_X, engines: ENGINE_X }),
    npcs: aeroNpcs({ students: [ENGINE_X + 70, ANGEL_X - 40], instructor: OLD_X + 60 }),
    spawns: {
      door: { x: DOOR_X - 14, facing: -1 },
    },
  };
}

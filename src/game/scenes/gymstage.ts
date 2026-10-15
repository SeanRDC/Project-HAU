// The stage at the south-east end of the Immaculate Heart Gymnasium, seen from
// the white floor in front of it, as in `front stage view of the ih gym.jpg`:
// the WELCOME ANGELITES banner along the front of the stage, the LED screen and
// the band's drum kit on it, two rows of tall frosted windows in the wall behind,
// and the big striped panels on the walls either side. On the left, under the
// end of the second-floor bleachers, the angel trophy and the stacked chairs; on
// the right, the stairs up to the bleachers. Events are held here.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { disc, line, poly, rect } from '../../engine/pix';
import {
  acousticRoof, angelTrophy, chairStack, frostedWindow, hangingSpeaker, pipeRail, sideStairs, stripePanel, welcomeBanner, whiteFloor,
} from '../art/ihgymin';
import { gymStageHotspots } from '../story/ihgym';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 600;
const WALK = 244;
/** the foot of the stage's front, where the white floor starts */
const FLOOR = 202;
/** the stage itself: its floor, its front edge, its ends */
const DECK = 178;
const STAGE_L = 64;
const STAGE_R = 536;
const MID = Math.round((STAGE_L + STAGE_R) / 2);
/** where you come in from the court, and the stairs up to the bleachers */
const COURT_X = 22;
const STAIRS_X = 574;

/** Where the stage's parts are, for anything an event wants to put on it. */
export const STAGE = { left: STAGE_L, right: STAGE_R, middle: MID, deck: DECK, floor: FLOOR, walk: WALK };

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // the roof: steel trusses and the sound panels, lighter towards the gable
  const lamps = acousticRoof(c, 0, WIDTH, 0, 52, 7201);
  for (const [lx, ly] of lamps) lights.push({ x: lx, y: ly + 6, r: 90, color: [255, 246, 220], strength: 0.5, always: true });

  // the end wall, and the side walls of the stage's bay, set at an angle
  rect(c, 0, 52, WIDTH, FLOOR - 52, '#e6e2d8');
  poly(c, [[0, 52], [130, 66], [130, DECK], [0, FLOOR]], '#d9d5ca');
  poly(c, [[WIDTH, 52], [WIDTH - 130, 66], [WIDTH - 130, DECK], [WIDTH, FLOOR]], '#cfcbbf');
  // the striped panels on them, large, as in the photos
  stripePanel(c, 22, 72, 92, 84);
  stripePanel(c, WIDTH - 114, 72, 92, 84, true);
  // the back of the stage: two rows of three frosted windows, the middle top one arched
  rect(c, 130, 66, WIDTH - 260, DECK - 66, '#ece9e1');
  rect(c, 130, 66, 2, DECK - 66, '#bdb9ae');
  rect(c, WIDTH - 132, 66, 2, DECK - 66, '#bdb9ae');
  for (const [dx, w, arched] of [[-76, 34, false], [-22, 44, true], [42, 34, false]] as const) {
    frostedWindow(c, g, MID + dx, 82, w, 22, arched);
    frostedWindow(c, g, MID + dx, 110, w, 22);
  }
  lights.push({ x: MID, y: 108, r: 150, color: [255, 240, 210], strength: 0.45, daylight: true });
  // the dado rail along the stage walls
  rect(c, 130, 150, WIDTH - 260, 1, '#9c8b6f');

  // on the stage: the LED screen, the black flats either side, the drum kit, a mic stand, chairs at the back
  rect(c, MID - 38, 136, 76, 42, '#121216');
  rect(c, MID - 38, 136, 76, 1, '#33333a');
  rect(g, MID - 36, 138, 72, 38, '#6a8aff');
  for (const fx of [MID - 96, MID + 72]) {
    rect(c, fx, 140, 24, 38, '#1c1c20');
    rect(c, fx + 2, 142, 20, 1, '#38383e');
  }
  // the drums
  disc(c, 168, 168, 7, '#2a2a30');
  disc(c, 168, 168, 5, '#e9e6e0');
  rect(c, 158, 160, 6, 4, '#a3282e');
  rect(c, 176, 162, 6, 4, '#a3282e');
  line(c, 154, 152, 162, 158, '#c9a35a', 1);
  line(c, 176, 150, 186, 156, '#c9a35a', 1);
  rect(c, 158, 150, 10, 1, '#c9a35a');
  rect(c, 180, 148, 10, 1, '#c9a35a');
  rect(c, 165, 174, 2, 4, '#555');
  line(c, 240, 176, 244, 154, '#3a3a40', 1);
  rect(c, 242, 152, 4, 2, '#2a2a30');
  chairStack(c, MID + 120, DECK, 3);
  // the stage floor, its front edge, the banner hung along it
  rect(c, STAGE_L, DECK - 4, STAGE_R - STAGE_L, 4, '#bcb7ac');
  rect(c, STAGE_L, DECK - 4, STAGE_R - STAGE_L, 1, '#d8d3c8');
  rect(c, STAGE_L, DECK, STAGE_R - STAGE_L, FLOOR - DECK, '#5c4a40');
  welcomeBanner(c, STAGE_L + 10, STAGE_R - 10, DECK + 1, FLOOR - DECK - 2);
  // the speakers at the corners of the stage
  for (const sx of [STAGE_L - 20, STAGE_R + 6]) {
    rect(c, sx, FLOOR - 36, 14, 36, '#18181c');
    disc(c, sx + 7, FLOOR - 26, 4, '#2c2c32');
    disc(c, sx + 7, FLOOR - 12, 4, '#2c2c32');
  }
  hangingSpeaker(c, 110, 0, 24, 40);
  hangingSpeaker(c, WIDTH - 110, 0, 24, 40);

  // on the left, the end of the second floor: its slab, the railing, the bleachers going up behind
  rect(c, 0, 116, 56, 6, '#f2efe8');
  pipeRail(c, 0, 56, 104, 12);
  for (let i = 0; i < 6; i++) rect(c, 0, 116 - (i + 1) * 6, 50 - i * 4, 4, '#c8b896');
  rect(c, 0, 122, 56, FLOOR - 122, '#e8e4da');
  rect(c, 30, FLOOR - 30, 14, 30, '#3c3a3e');
  angelTrophy(c, 50, FLOOR + 8);
  chairStack(c, 10, FLOOR + 6, 5);
  chairStack(c, 22, FLOOR + 6, 4);
  // on the right, the stairs up to the bleachers
  rect(c, WIDTH - 56, 116, 56, 6, '#f2efe8');
  pipeRail(c, WIDTH - 56, WIDTH, 104, 12);
  rect(c, WIDTH - 56, 122, 56, FLOOR - 122, '#e1ddd2');
  sideStairs(c, WIDTH - 50, FLOOR + 4, WIDTH - 6, 122, 10);

  // the white floor in front of the stage, with its yellow lines
  whiteFloor(c, 0, WIDTH, FLOOR, VIEW_H, 7202);
  rect(c, 40, FLOOR + 10, WIDTH - 80, 1, '#e2c13a');
  rect(c, 40, FLOOR + 10, 1, VIEW_H - FLOOR - 10, '#e2c13a');
  rect(c, WIDTH - 41, FLOOR + 10, 1, VIEW_H - FLOOR - 10, '#e2c13a');
  rect(c, MID, FLOOR + 10, 1, VIEW_H - FLOOR - 10, '#e2c13a');
  // stage lights on the truss over the front of the stage
  for (let x = STAGE_L + 40; x < STAGE_R - 20; x += 70) {
    rect(c, x, 54, 5, 5, '#202024');
    lights.push({ x: x + 2, y: DECK - 10, r: 46, color: [255, 228, 190], strength: 0.45, always: true });
  }
  return { canvas, glow };
}

export function buildGymStage(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  return {
    id: 'gymstage',
    title: 'IH Gym Stage',
    subtitle: 'Immaculate Heart Gymnasium',
    width: WIDTH,
    walkY: WALK,
    bounds: [12, WIDTH - 16],
    outdoor: false,
    layers: [{ canvas: main.canvas, parallax: 1 }],
    glow: main.glow,
    lights,
    hotspots: gymStageHotspots({ court: COURT_X, banner: MID, stairs: STAIRS_X, drums: 168 }),
    npcs: [],
    spawns: {
      court: { x: COURT_X + 12, facing: 1 },
      upper: { x: STAIRS_X - 8, facing: -1 },
    },
  };
}

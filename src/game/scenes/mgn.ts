// The road along the Mamerto G. Nepomuceno Building, between the chapel lawn
// and St. Joseph Hall. Going round from the chapel it is the chapel, MGN,
// then SJH: this is the middle stop. MGN is drawn from the side photos of SJH
// (`assets/SJH BUILDING/` 05 to 07) and its own (`assets/MGN BUILDING/`): plain
// white, four floors of open corridors over an open ground floor. The chapel
// lot is behind the camera. SJH is off to the left, the lawn to the right.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { bamboo } from '../art/aps';
import { P } from '../art/palette';
import { RED_TIP } from '../art/park';
import { bush, hedge, palm, signBoard, tree } from '../art/props';
import { drawMGN } from '../art/sjh';
import { carEnd } from '../art/street';
import { mgnHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, doorLight, farCity, frontPlants, lamp, midCampus, parkingBays, road } from './kit';

const WIDTH = 760;
/** the way back to St. Joseph Hall, round the bend at its end */
const SJH_EXIT = 40;
/** the way on to the chapel lawn */
const LAWN_EXIT = WIDTH - 40;
const MGN_X = 110;
const MGN_W = 520;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement; door: number } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // the end of SJH's bend on the left: bamboo and a dark shade tree; more trees past MGN on the right
  tree(c, 30, GROUND + 2, 120, 34, 3201);
  bamboo(c, 60, GROUND + 4, 30, 100, 3202);
  tree(c, WIDTH - 70, GROUND + 2, 112, 32, 3203);

  const door = drawMGN(c, g, MGN_X, MGN_W, GROUND, { fh: 22, groundH: 32, seed: 82 });
  doorLight(lights, door);

  road(c, 0, WIDTH, 'concrete', 3210);

  // the garden along its front: hedges, red-tipped shrubs, palms and a big shade tree, kept off the door
  hedge(c, MGN_X - 10, GROUND + 3, door - 30 - (MGN_X - 10), 8, 3220);
  hedge(c, door + 30, GROUND + 3, MGN_X + MGN_W + 10 - (door + 30), 8, 3221);
  for (const [i, x] of [MGN_X + 40, MGN_X + 150, door + 70, MGN_X + MGN_W - 60].entries()) {
    bush(c, x, GROUND + 3, 20, 11, 3230 + i, i % 2 ? RED_TIP : undefined);
  }
  palm(c, door - 46, GROUND + 4, 64, 3240);
  palm(c, door + 48, GROUND + 4, 58, 3241);
  tree(c, MGN_X + 110, GROUND + 3, 96, 28, 3242);

  // cars nosed in along the kerb, as on the chapel side of the lot
  parkingBays(c, door + 58, MGN_X + MGN_W - 4, 36);
  const colours = ['#b9bcc4', '#24242a', '#8a2f34', '#e8e8e4', '#5c5f66'];
  for (let x = MGN_X + MGN_W - 40, i = 0; x > door + 40; x -= 36, i++) {
    carEnd(c, x, GROUND + 31, colours[i % colours.length], i % 3 === 1, i % 2 === 0);
  }

  signBoard(c, SJH_EXIT + 4, GROUND + 5, ['ST. JOSEPH', 'HALL']);
  signBoard(c, LAWN_EXIT, GROUND + 5, ['CHAPEL', 'WALKWAY'], P.maroon, P.goldHi);
  for (const x of [MGN_X + 70, door - 90, door + 110, LAWN_EXIT - 50]) lamp(c, g, lights, x);
  return { canvas, glow, door };
}

export function buildMgn(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);

  return {
    id: 'mgn',
    title: 'Mamerto G. Nepomuceno Building',
    subtitle: 'Sa pagitan ng chapel at SJH',
    width: WIDTH,
    walkY: WALK,
    bounds: [16, WIDTH - 16],
    outdoor: true,
    layers: [
      farCity(WIDTH, 321),
      midCampus(WIDTH, 322, []),
      { canvas: main.canvas, parallax: 1 },
      frontPlants(WIDTH, 323),
    ],
    glow: main.glow,
    lights,
    hotspots: mgnHotspots({ sjh: SJH_EXIT, mgn: main.door, lawn: LAWN_EXIT }),
    npcs: [],
    spawns: {
      sjh: { x: SJH_EXIT + 12, facing: 1 },
      lawn: { x: LAWN_EXIT - 12, facing: -1 },
    },
    update: ambience(324, [30, WIDTH - 70]),
  };
}

// The walkway from the rotunda to the chapel lawn. You are on the brick
// sidewalk on the PGN side, looking north-west: St. Therese of Lisieux first,
// then the long podium and the tower of the Peter G. Nepomuceno Building
// behind its brick fence. The road, the lamps and the flagpoles are between
// you and the camera.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { hex } from '../../engine/math';
import { disc, rect } from '../../engine/pix';
import { facade, nameWall } from '../art/buildings';
import { P } from '../art/palette';
import { bush, hedge, palm, signBoard, tree } from '../art/props';
import { brickFence, crosswalk, flagpole, topiary, twinLamp, wavingFlag } from '../art/street';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { walkwayHotspots } from '../story/streets';
import { AreaDef, AreaLight, Layer } from '../types';
import { GROUND, WALK, ambience, doorLight, farCity, frontPlants, lawnStrip, midCampus, road } from './kit';

const S = STREETS.walkway;
const WIDTH = streetWidth(S);
const ROTUNDA_X = xOf(S, PLACES.rotunda);
const END_X = xOf(S, PLACES.walkwayEnd);
const COURTYARD_X = xOf(S, PLACES.courtyardGate);
const [STL_L, STL_R] = frontage(S, BUILDINGS.stl.blocks[0]);
const [PODIUM_L, PODIUM_R] = frontage(S, BUILDINGS.pgn.blocks[1]);
const [TOWER_L, TOWER_R] = frontage(S, BUILDINGS.pgn.blocks[0]);

/** the tower stops where the road along the lawn starts */
const TOWER_END = Math.min(TOWER_R, END_X - 10);
const STL_DOOR = Math.round((STL_L + STL_R) / 2);
const PGN_DOOR = Math.round((TOWER_L + TOWER_END) / 2);
/** the kerb between the sidewalk and the road, where the lamps and flagpoles stand */
const KERB = GROUND + 56;
const LAMPS = [150, 300, 450, 750, 900];
const FLAGS = [225, 375, 525, 825];
const FLAG_H = 124;

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  tree(c, 34, GROUND + 2, 104, 36, 2101);
  tree(c, STL_R + 4, GROUND + 2, 92, 30, 2102);
  tree(c, END_X + 40, GROUND + 2, 110, 40, 2103);

  // St. Therese of Lisieux
  facade(c, g, STL_L + 4, STL_R - STL_L - 22, GROUND, {
    floors: 4, style: 'ribbon', wall: '#e6e3dc', glass: '#4f5d76', accent: '#2f6b5a', doors: [STL_DOOR - STL_L - 4], name: 'STL', seed: 31,
  });
  doorLight(lights, STL_DOOR);

  // PGN: the podium, then the tower, which runs off the top of the screen
  facade(c, g, PODIUM_L + 12, PODIUM_R - PODIUM_L - 14, GROUND, {
    floors: 4, style: 'grid', wall: '#d9d6cf', glass: '#44506a', seed: 32,
  });
  facade(c, g, TOWER_L + 4, TOWER_END - TOWER_L - 4, GROUND, {
    floors: 11, style: 'ribbon', wall: '#eceae4', glass: '#2f3f63', accent: P.maroon, doors: [PGN_DOOR - TOWER_L - 4], name: 'PGN', seed: 33,
  });
  doorLight(lights, PGN_DOOR);

  road(c, 0, WIDTH, 'brick', 2110);

  // planting and the brick fence along the PGN side, open at the two doors
  hedge(c, STL_L, GROUND + 5, STL_DOOR - 24 - STL_L, 9, 2120);
  hedge(c, STL_DOOR + 24, GROUND + 5, STL_R - 20 - STL_DOOR - 24, 9, 2121);
  brickFence(c, PODIUM_L + 6, PGN_DOOR - 28, GROUND + 5);
  brickFence(c, PGN_DOOR + 28, END_X - 8, GROUND + 5);
  for (let x = PODIUM_L + 40; x < PGN_DOOR - 40; x += 88) bush(c, x, GROUND + 4, 22, 13, 2130 + x);
  nameWall(c, PODIUM_L + 150, GROUND + 5, ['PETER G. NEPOMUCENO', 'BUILDING']);

  // the rotunda end and the lawn end
  lawnStrip(c, 0, STL_L - 6, 2140);
  palm(c, ROTUNDA_X - 30, GROUND + 3, 66, 2141);
  signBoard(c, ROTUNDA_X - 26, GROUND + 5, ['ROTUNDA']);
  lawnStrip(c, END_X + 4, WIDTH, 2142);
  signBoard(c, END_X + 34, GROUND + 5, ['CHAPEL'], P.maroon, P.goldHi);

  // crossings over to the Main Building side
  crosswalk(c, COURTYARD_X - 14, GROUND + 53, 28, 12);
  crosswalk(c, END_X - 30, GROUND + 53, 28, 12);
  return { canvas, glow };
}

/** The strip between the sidewalk and the road: lamps, flagpoles and clipped shrubs, in front of whoever walks by. */
function kerbLayer(lights: AreaLight[], glow: HTMLCanvasElement): Layer {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const g = glow.getContext('2d')!;
  rect(c, 0, KERB - 4, WIDTH, 4, '#a9a498');
  rect(c, 0, KERB - 5, WIDTH, 1, '#d8d3c8');
  for (let x = 110; x < WIDTH - 30; x += 150) {
    if (Math.abs(x - COURTYARD_X) < 34 || Math.abs(x - (END_X - 16)) < 34) continue;
    topiary(c, x, KERB - 4, 2200 + x);
  }
  for (const x of LAMPS) {
    for (const l of twinLamp(c, x, KERB - 4)) {
      disc(g, l.x, l.y, 3, P.lamp);
      lights.push({ x: l.x, y: l.y, r: 84, color: hex(P.lamp), strength: 0.9 });
    }
    lights.push({ x, y: GROUND + 30, r: 70, color: hex(P.lamp), strength: 0.5 });
  }
  for (const x of FLAGS) flagpole(c, x, KERB - 4, FLAG_H);
  return { canvas, parallax: 1, front: true };
}

export function buildWalkway(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const kerb = kerbLayer(lights, main.glow);

  return {
    id: 'walkway',
    title: 'Chapel Walkway',
    subtitle: 'Mula rotunda hanggang Chapel of the Holy Guardian Angel',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 24],
    outdoor: true,
    layers: [
      farCity(WIDTH, 211),
      midCampus(WIDTH, 212, [
        { x: 620, w: 96, h: 74, wall: '#e2d9b4', roof: '#d9cf9f' },
        { x: 1010, w: 150, h: 150, wall: '#d9c88f', glass: '#8a3a34' },
      ]),
      { canvas: main.canvas, parallax: 1 },
      kerb,
      frontPlants(WIDTH, 213),
    ],
    glow: main.glow,
    lights,
    hotspots: walkwayHotspots({ rotunda: ROTUNDA_X - 30, stl: STL_DOOR, courtyard: COURTYARD_X, pgn: PGN_DOOR, lawn: END_X + 34 }),
    npcs: [],
    spawns: {
      rotunda: { x: ROTUNDA_X - 14, facing: 1 },
      courtyard: { x: COURTYARD_X, facing: 1 },
      lawn: { x: END_X + 20, facing: -1 },
    },
    update: ambience(214, [34, STL_R + 4, END_X + 40]),

    drawFront(ctx, view) {
      // the university's red flags, never quite still
      const cam = Math.round(view.camX);
      for (const x of FLAGS) wavingFlag(ctx, x - cam, KERB - 4 - FLAG_H + 2, view.time, '#c22d3a', '#f4f2ec');
    },
  };
}

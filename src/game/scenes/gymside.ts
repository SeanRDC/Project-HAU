// The left side of the Immaculate Heart Gymnasium: its north-west end, seen
// from the lane between it and the covered court, looking south-east. The
// gable of the hall in white panels, three tall louvred windows, and the big
// grey box canopy over the wide side entrance, where PE classes sit out of
// the sun. The covered court is behind the camera; its roof edge hangs in at
// the top. From `assets/ih_gym immaculate heart/`: `left side entrance beside
// the other court`, `left side entrance other angle` and `corner view`.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { line, rect } from '../../engine/pix';
import { gymGable } from '../art/ihgym';
import { pot, tree } from '../art/props';
import { STREETS, streetWidth, xOf } from '../campus/streets';
import { gymSideHotspots, gymSideNpcs } from '../story/ihgym';
import { AreaDef, AreaLight, Layer } from '../types';
import { GROUND, WALK, ambience, doorLight, farCity, lamp, layerWidth, midCampus, road } from './kit';

const S = STREETS.gymside;
const WIDTH = streetWidth(S);
const GYM_L = xOf(S, { u: 96.3, v: 0 });
const GYM_R = xOf(S, { u: 52.6, v: 0 });
/** the gym lane, at the right-hand end */
const LANE_X = xOf(S, { u: 41, v: 0 });

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement; door: number } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // past the gym's front corner on the right: the open lot, a tree, the way back to the lane
  tree(c, GYM_R + 70, GROUND + 2, 110, 38, 4101);

  // the annex along the far side of the gym, dark grey sheeting, at the left end
  rect(c, 0, GROUND - 74, GYM_L + 6, 74, '#3f424a');
  for (let x = 1; x < GYM_L + 6; x += 4) rect(c, x, GROUND - 74, 1, 74, '#575b64');
  rect(c, 0, GROUND - 78, GYM_L + 6, 4, '#e9e9e6');

  const door = gymGable(c, g, GYM_L, GYM_R, GROUND);
  doorLight(lights, door);
  // the lights under the canopy
  for (const dx of [-60, -20, 20, 60]) lights.push({ x: door + dx, y: GROUND - 54, r: 40, color: [255, 240, 200], strength: 0.7 });

  road(c, 0, WIDTH, 'concrete', 4110);
  // a red bucket and a few pots left by the PE classes
  rect(c, door - 70, GROUND + 6, 6, 6, '#c8342f');
  rect(c, door - 70, GROUND + 6, 6, 1, '#e05a50');
  pot(c, GYM_R + 18, GROUND + 4, 4120);
  pot(c, GYM_R + 30, GROUND + 4, 4121);
  for (const x of [GYM_L + 40, GYM_R + 50]) lamp(c, g, lights, x);
  return { canvas, glow, door };
}

/** The edge of the covered court's roof, right over the camera, and its railing posts along the bottom. */
function courtEdge(): Layer {
  const parallax = 1.3;
  const [canvas, c] = makeCanvas(layerWidth(WIDTH, parallax), VIEW_H);
  const rand = rng(4130);
  const dark = '#20262e';
  // the corrugated roof edge and the steel purlins under it
  rect(c, 0, 0, canvas.width, 9, dark);
  for (let x = 0; x < canvas.width; x += 3) rect(c, x, 9, 1, 2 + (x % 6 ? 0 : 1), '#2c343d');
  for (let x = 30; x < canvas.width; x += 150 + rand() * 40) {
    rect(c, x, 0, 6, 26, dark);
    line(c, x + 3, 22, x + 40, 9, dark, 2);
    line(c, x + 3, 22, x - 34, 9, dark, 2);
  }
  // the pipe railing along the court's edge, with the post every so often
  rect(c, 0, VIEW_H - 22, canvas.width, 2, '#4a525c');
  rect(c, 0, VIEW_H - 12, canvas.width, 2, '#4a525c');
  for (let x = 12; x < canvas.width; x += 60) rect(c, x, VIEW_H - 24, 3, 24, '#3a414a');
  return { canvas, parallax, front: true };
}

export function buildGymSide(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  return {
    id: 'gymside',
    title: 'IH Gym, Side Entrance',
    subtitle: 'Immaculate Heart Gymnasium',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 20],
    outdoor: true,
    layers: [
      farCity(WIDTH, 4141),
      midCampus(WIDTH, 4142, [{ x: WIDTH - 60, w: 120, h: 80, wall: '#e3d9b6', glass: '#46536b' }]),
      { canvas: main.canvas, parallax: 1 },
      courtEdge(),
    ],
    glow: main.glow,
    lights,
    hotspots: gymSideHotspots({ door: main.door, lane: LANE_X, annex: GYM_L - 30 }),
    npcs: gymSideNpcs({ door: main.door }),
    spawns: {
      // from the gym lane
      lane: { x: LANE_X - 8, facing: -1 },
      // out of the side entrance
      lobby: { x: main.door, facing: 1 },
    },
    update: ambience(4143, [GYM_R + 70]),
  };
}

// The lane behind the chapel, looking north-east. From Sacred Heart on the
// left: the open-sided Covered Court, the lane between it and the gym that
// goes round to the gym's side entrance, the front of the Immaculate Heart
// Gymnasium (art/ihgym.ts, from the photos), and the dark annex with the
// seal painted on it. The chapel and the formation center are behind the
// camera. The front is set back across a parking lot.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { css, hex, mix } from '../../engine/math';
import { rect } from '../../engine/pix';
import { facade } from '../art/buildings';
import { ccFront } from '../art/ccourt';
import { darkAnnex, greenTent, gymFront, meshBarrier, tyreStack } from '../art/ihgym';
import { P, shade } from '../art/palette';
import { pot, signBoard } from '../art/props';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, xOf } from '../campus/streets';
import { gymHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, doorLight, farCity, frontPlants, lamp, midCampus, road } from './kit';

const S = STREETS.gym;
/** the scene ends at the far corner of the dark annex with the seal */
const DARK_R = xOf(S, { u: 40, v: 78 });
const WIDTH = DARK_R;
const APS_X = xOf(S, PLACES.northEastJunction);
/** the road down to St. Joseph Hall leaves just short of the gym's right door; its sign stands clear of the door */
const SJH_X = xOf(S, PLACES.gymCorner) - 30;
const [, SH_R] = frontage(S, BUILDINGS.sh.blocks[0]);
const [, COURT_R] = frontage(S, BUILDINGS.court.blocks[0]);

/** the covered court's front, its gable end, centred on its frontage */
const [COURT_L] = frontage(S, BUILDINGS.court.blocks[0]);
const COURT_MID = Math.round((COURT_L + COURT_R) / 2);
const COURT_W = COURT_R - COURT_L - 30;
/** the gym's front runs from its north-west corner to where the annex comes out in front of it */
const FRONT_L = xOf(S, { u: 40, v: BUILDINGS.gym.blocks[0].at.v - BUILDINGS.gym.blocks[0].across / 2 + 0.5 });
const FRONT_R = xOf(S, { u: 40, v: 61.5 });
/** the lane round to the side entrance, between the covered court and the gym */
const SIDE_X = Math.round((COURT_R + FRONT_L) / 2);

/** the formation center is behind the camera; its sign stands clear of the lane to the gym's side */
const FORMATION_X = COURT_R - 106;

/** The doors along the front: the gym's left and right ones, the annex's. */
interface Doors {
  left: number;
  right: number;
  annex: number;
}

/**
 * The road going back between the covered court and the gym, towards the
 * gym's side entrance: only the road itself, narrowing as it goes and fading
 * into the haze, so it reads as distance behind the scene. The sky and the
 * far trees of the background show above it.
 */
function sideLane(c: Ctx): void {
  const L = COURT_R - 10;
  const R = FRONT_L;
  const VX = Math.round((L + R) / 2) + 6;
  const top = GROUND - 26;
  const near: [number, number] = [L, R];
  const far: [number, number] = [VX - 3, VX + 3];
  const road = hex(P.road);
  const haze = hex('#c9d6e0');
  for (let y = top; y < GROUND; y++) {
    const t = (y - top) / (GROUND - top);
    const x0 = far[0] + (near[0] - far[0]) * t;
    const x1 = far[1] + (near[1] - far[1]) * t;
    // the far end dissolves into the haze, the near end is the road's own colour
    rect(c, x0, y, x1 - x0, 1, css(mix(haze, road, Math.pow(t, 0.7))));
  }
}

/**
 * The sidewalk opens where the road turns in between the covered court and
 * the gym: the kerb curves round into the lane at both corners, and the road
 * surface runs through the gap.
 */
function laneMouth(c: Ctx): void {
  const L = COURT_R - 10;
  const R = FRONT_L;
  const r = 22;
  const depth = 18;
  for (let y = GROUND; y < GROUND + depth; y++) {
    const t = (y - GROUND + 0.5) / depth;
    // the corners round off: the opening is the lane's width at the back and widens towards the road
    const bend = r * (1 - Math.sqrt(1 - t * t));
    const x0 = Math.round(L - bend);
    const x1 = Math.round(R + bend);
    rect(c, x0, y, x1 - x0, 1, shade(P.road, t > 0.75 ? 0.1 : 0.04));
    // the kerb along each curve
    rect(c, x0 - 2, y, 2, 1, shade(P.pave, 0.3));
    rect(c, x0, y, 1, 1, P.paveDark);
    rect(c, x1, y, 2, 1, shade(P.pave, 0.3));
    rect(c, x1 - 1, y, 1, 1, P.paveDark);
  }
  // a few specks of grit on the concrete
  for (let i = 0; i < 40; i++) {
    const x = L + ((i * 37) % (R - L));
    const y = GROUND + 2 + ((i * 13) % (depth - 4));
    rect(c, x, y, 1, 1, i % 2 ? P.roadLine : P.roadDark);
  }
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement; doors: Doors } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  sideLane(c);

  // the end of Sacred Heart
  facade(c, g, -220, 220 + SH_R - 12, GROUND, {
    floors: 5, style: 'ribbon', wall: '#eef0ee', glass: '#3f8f9c', accent: '#2f6b8a', seed: 62,
  });

  ccFront(c, g, COURT_MID, COURT_W, GROUND);
  for (let x = COURT_MID - COURT_W / 2 + 40; x < COURT_MID + COURT_W / 2; x += 110) {
    lights.push({ x, y: GROUND - 60, r: 110, color: [255, 240, 210], strength: 0.8 });
  }

  const front = gymFront(c, g, FRONT_L, FRONT_R, GROUND);
  doorLight(lights, front.leftDoor);
  doorLight(lights, front.rightDoor);
  const annexDoor = darkAnnex(c, g, FRONT_R, DARK_R, GROUND);


  road(c, 0, WIDTH, 'concrete', 3310);
  laneMouth(c);

  // along the front: the green tents with the tyre seats under them, the barriers by the left door
  meshBarrier(c, front.leftDoor - 64, GROUND + 4, 28);
  meshBarrier(c, front.leftDoor + 22, GROUND + 6, 24);
  pot(c, front.leftDoor + 56, GROUND + 4, 3340);
  for (const tx of [front.rightDoor - 230, front.rightDoor - 180]) {
    greenTent(c, tx, GROUND + 4);
    tyreStack(c, tx - 12, GROUND + 4, 2);
    tyreStack(c, tx + 13, GROUND + 4, 3);
  }
  pot(c, front.rightDoor - 150, GROUND + 4, 3341);
  pot(c, front.rightDoor - 140, GROUND + 4, 3342);
  // the lane round the side, between the covered court and the gym
  signBoard(c, COURT_R - 56, GROUND + 5, ['GYM SIDE', 'ENTRANCE']);

  signBoard(c, APS_X - 30, GROUND + 5, ['APS', 'SACRED HEART']);
  signBoard(c, SJH_X, GROUND + 5, ['SJH', 'CHAPEL'], P.maroon, P.goldHi);
  // the formation center is on the camera's side
  signBoard(c, FORMATION_X, GROUND + 5, ['FORMATION', 'CENTER']);

  for (const x of [COURT_MID - COURT_W / 2 - 24, SIDE_X + 30, FRONT_L + 300, FRONT_R - 20]) lamp(c, g, lights, x);
  return { canvas, glow, doors: { left: front.leftDoor, right: front.rightDoor, annex: annexDoor } };
}

export function buildGym(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);

  return {
    id: 'gym',
    title: 'Immaculate Heart Gymnasium',
    subtitle: 'Covered Court at Gym Annex',
    subtitleEn: 'Covered Court and Gym Annex',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 12],
    outdoor: true,
    layers: [
      farCity(WIDTH, 331),
      midCampus(WIDTH, 332, []),
      { canvas: main.canvas, parallax: 1 },
      frontPlants(WIDTH, 333),
    ],
    glow: main.glow,
    lights,
    hotspots: gymHotspots({
      aps: APS_X - 30,
      court: COURT_MID,
      formation: FORMATION_X,
      side: SIDE_X,
      gymLeft: main.doors.left,
      gymRight: main.doors.right,
      sjh: SJH_X,
      annex: main.doors.annex,
    }),
    npcs: [],
    spawns: {
      aps: { x: APS_X - 20, facing: 1 },
      sjh: { x: SJH_X + 8, facing: -1 },
      side: { x: SIDE_X, facing: 1 },
      court: { x: COURT_MID, facing: 1 },
      gymLeft: { x: main.doors.left, facing: 1 },
      gymRight: { x: main.doors.right, facing: -1 },
    },
    update: ambience(334, [SIDE_X]),
  };
}

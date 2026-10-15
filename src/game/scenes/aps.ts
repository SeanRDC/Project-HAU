// The road from the chapel lawn along the front of APS to the gym lane,
// looking north-west, laid out in the order of the photos in
// `assets/APS WALK FROM CHAPEL LAWN/` (taken walking it from the lawn).
// Almost the whole scene is one building, the hundred-metre Archbishop Pedro
// Santos Building. First its long four-floor wing (art/aps.ts): louvred bays
// and a strip of garden at the lawn end, then the deep canopy over the main
// entrance with its diamond-tiled paving. Where the canopy ends, the tall
// block with the curved balconies, the bust and the campus map; then the
// plain stair tower; then the canteen block, the wing that turns towards the
// lawn, with the canteen open on its ground floor (art/canteen.ts). The brick
// patio with its umbrellas runs along the front of those three. Past the
// canteen the lane to the covered court and the gym turns off. Sacred Heart
// is behind the canteen block, reached through the stair tower. The chapel
// and its lawn are behind the camera.

import { Ctx, VIEW_H, makeCanvas } from '../../engine/display';
import { rect } from '../../engine/pix';
import { bamboo, bottleCage, bust, cafeUmbrella, drawAPS, groundShadow, herringbone, pgnBack, pottedTree, siteFence, twinLantern } from '../art/aps';
import { arecaPalm, balconyBlock, campusMapBoard, canteenBlock, canteenEnd, courtGable, pergola, stairTower } from '../art/canteen';
import { P } from '../art/palette';
import { hedge, pot, signBoard, tree } from '../art/props';
import { BUILDINGS, PLACES } from '../campus/plan';
import { STREETS, frontage, streetWidth, xOf } from '../campus/streets';
import { apsHotspots } from '../story/streets';
import { AreaDef, AreaLight } from '../types';
import { GROUND, WALK, ambience, farCity, frontPlants, lamp, lawnStrip, midCampus, road } from './kit';

const S = STREETS.aps;
const WIDTH = streetWidth(S);
const CORNER_X = xOf(S, PLACES.northJunction);
const GYM_LANE_X = xOf(S, PLACES.northEastJunction);
const [APS_L] = frontage(S, BUILDINGS.aps.blocks[0]);
/** the wing of APS that turns towards the lawn: the canteen block */
const [WING_L, WING_R] = frontage(S, BUILDINGS.aps.blocks[1]);
/** the lanterns' warm, slightly orange light */
const LANTERN: [number, number, number] = [255, 196, 132];

/**
 * The long wing starts a little in from the plan's corner of APS, so the back
 * of PGN shows at the lawn end with the bamboo and the netted structure in
 * the gap, as in photo 06 of the walk.
 */
const PGN_R = APS_L + 82;
const APS_X = PGN_R + 26;
/** the canteen block takes the turned wing's frontage, up to the gym lane */
const CANTEEN_X = WING_L;
const CANTEEN_W = Math.min(WING_R, GYM_LANE_X - 20) - CANTEEN_X;
/** the stair tower, and the tall block with the curved balconies before it */
/** the canteen block's end wall, seen at an angle past its front, with the fire escape on it */
const END_W = 22;
const CANTEEN_END = CANTEEN_X + CANTEEN_W + END_W;
/** the canteen block's height to its parapet, from art/canteen.ts */
const CANTEEN_H = 60 + 4 * 22 + 6;
const TOWER_W = 54;
const TOWER_X = CANTEEN_X - TOWER_W;
const TOWER_H = 178;
const TALL_W = 232;
const TALL_X = TOWER_X - TALL_W;
/** the long wing runs from the lawn end up to the tall block */
const APS_W = TALL_X - APS_X;
/** the canopy over the main entrance, at the tall block end of the long wing */
const CANOPY_HALF = 104;
const MAIN_DOOR = APS_W - CANOPY_HALF - 10;
const CANOPY_L = APS_X + MAIN_DOOR - CANOPY_HALF - 8;
/** one plain way in at the lawn end, then the main one under the canopy */
const APS_DOORS = [116, MAIN_DOOR];
/** the bays with louvres on the middle floors, at the lawn end */
const LOUVRE_BAYS = 6;
/** the door at the foot of the stair tower; Sacred Heart, behind the canteen block, is reached through the back of the canteen */
const SH_DOOR = TOWER_X + 7;

/** A doorway's light at night: soft and close, so it warms the step and the pillars without washing out the white walls. */
function doorLight(lights: AreaLight[], x: number): void {
  lights.push({ x, y: GROUND - 14, r: 46, color: [255, 204, 146], strength: 0.42 });
}

/**
 * The light the lit windows and doors throw on the walls, columns and pavement
 * round them, worked out once from the glow itself so it always lines up with
 * them: copies of the glow pushed out in steps, each fainter, reaching further
 * down than up, as light falls. With a cool wash of moonlight over the front,
 * so it reads at midnight. It goes into the light map, scaled by how dark it is.
 */
function bakeSpill(glow: HTMLCanvasElement): HTMLCanvasElement {
  const [bake, b] = makeCanvas(glow.width, glow.height);
  b.fillStyle = 'rgba(66, 74, 116, 0.5)';
  b.fillRect(0, 0, bake.width, GROUND + 16);
  b.globalCompositeOperation = 'lighter';
  for (const [rad, a] of [[2, 0.09], [5, 0.06], [9, 0.04], [14, 0.025]] as const) {
    b.globalAlpha = a;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -0.5], [0, 1.2], [-0.7, 0.8], [0.7, 0.8], [-0.7, -0.4], [0.7, -0.4]]) {
      b.drawImage(glow, Math.round(dx * rad), Math.round(dy * rad));
    }
  }
  b.globalAlpha = 1;
  b.globalCompositeOperation = 'source-over';
  return bake;
}

/** Clear the glow wherever the scene `c` has changed since `bare` was taken, i.e. wherever something now covers it. */
function hideBehind(g: Ctx, bare: ImageData, c: Ctx): void {
  const now = c.getImageData(0, 0, bare.width, bare.height).data;
  const was = bare.data;
  const lit = g.getImageData(0, 0, bare.width, bare.height);
  for (let i = 0; i < was.length; i += 4) {
    if (now[i] !== was[i] || now[i + 1] !== was[i + 1] || now[i + 2] !== was[i + 2]) lit.data[i + 3] = 0;
  }
  g.putImageData(lit, 0, 0);
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement; spill: HTMLCanvasElement; canteenDoor: number } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);

  // past the canteen (photos 21 to 23 of the walk): the covered court's white gable over big shade trees,
  // and the vine-covered pergola along the lane
  courtGable(c, CANTEEN_END + 6, WIDTH - CANTEEN_END, GROUND - 4);
  tree(c, WIDTH - 22, GROUND + 2, 104, 26, 2701);
  pergola(c, CANTEEN_END + 14, WIDTH + 10, GROUND + 2, 2703);

  // the back of PGN, cut off by the edge of the scene
  pgnBack(c, g, -40, PGN_R + 40, GROUND);

  // the long wing: louvres at the lawn end, the canopy at the far end; the building's name on the canopy
  drawAPS(c, g, APS_X, APS_W, GROUND, {
    doors: APS_DOORS, main: 1, canopyHalf: CANOPY_HALF, louvreBays: LOUVRE_BAYS, name: 'ARCHBISHOP PEDRO SANTOS BUILDING', seed: 61,
  });
  for (const dx of APS_DOORS) doorLight(lights, APS_X + dx);

  // the tall block, the stair tower and the canteen block
  balconyBlock(c, g, TALL_X, TALL_W, GROUND);
  stairTower(c, TOWER_X, TOWER_W, GROUND, TOWER_H);
  doorLight(lights, SH_DOOR);
  const canteenDoor = canteenBlock(c, g, CANTEEN_X, CANTEEN_W, GROUND);
  canteenEnd(c, g, CANTEEN_X + CANTEEN_W, END_W, GROUND, CANTEEN_H);
  doorLight(lights, canteenDoor);
  // the buildings as they are before anything stands in front of them, to tell later what hides their windows
  const bare = c.getImageData(0, 0, WIDTH, GROUND);

  road(c, 0, WIDTH, 'concrete', 2710);

  // the garden along the front of the long wing, up to the canopy: grass and low hedges
  lawnStrip(c, APS_X, CANOPY_L - 2, 2719, 10);
  hedge(c, APS_X + APS_DOORS[0] + 26, GROUND + 3, CANOPY_L - APS_X - APS_DOORS[0] - 34, 9, 2722);
  // right where you come in from the lawn (photo 06 of the walk): a structure wrapped in green net
  // behind a mesh fence on yellow posts, with tall clumps of bamboo either side of it
  siteFence(c, APS_X + 26, GROUND + 2, 64, 21);
  bamboo(c, APS_X - 22, GROUND + 3, 54, 128, 2730);
  bamboo(c, APS_X + 80, GROUND + 3, 30, 100, 2731);
  for (const [i, dx] of [-8, 8].entries()) pot(c, CANOPY_L + dx, GROUND + 4, 2740 + i);

  // under the canopy, the white tiles with the red diamonds, out to the kerb
  // the canopy's shadow reaching out over the sidewalk
  rect(c, CANOPY_L - 8, GROUND, TALL_X - CANOPY_L + 8, 5, 'rgba(40, 30, 44, 0.18)');
  rect(c, CANOPY_L - 8, GROUND, TALL_X - CANOPY_L + 8, 2, 'rgba(40, 30, 44, 0.12)');
  // where the canopy meets the tall block: the potted ficus, the bust, the campus map and the bottle cage
  herringbone(c, TALL_X, CANTEEN_X + CANTEEN_W, GROUND, 14, 2750);
  // the buildings' shade along their feet
  rect(c, 0, GROUND, CANOPY_L - 8, 1, 'rgba(40, 30, 44, 0.16)');
  rect(c, TALL_X, GROUND, CANTEEN_X + CANTEEN_W - TALL_X, 2, 'rgba(40, 30, 44, 0.16)');
  groundShadow(c, TALL_X - 14, GROUND + 7, 11, 2);
  pottedTree(c, TALL_X - 16, GROUND + 6, 2751);
  groundShadow(c, TALL_X + 10, GROUND + 9, 8, 2);
  bust(c, TALL_X + 8, GROUND + 8);
  campusMapBoard(c, TALL_X + 22, GROUND + 8);
  bottleCage(c, TALL_X + 86, GROUND + 6, 26);
  // the patio: tables under the umbrellas in front of the tall block, a crimson one among the faded red
  cafeUmbrella(c, TALL_X + 132, GROUND + 7);
  cafeUmbrella(c, TALL_X + 174, GROUND + 7);
  cafeUmbrella(c, TALL_X + 214, GROUND + 7, '#a8324a');
  // and on the patio in front of the canteen, one each side of the steps
  cafeUmbrella(c, canteenDoor - 46, GROUND + 7);
  cafeUmbrella(c, canteenDoor + 46, GROUND + 7, '#a8324a');
  // areca palms in front of the canteen
  arecaPalm(c, CANTEEN_X + 2, GROUND + 4, 58, 2760);
  arecaPalm(c, CANTEEN_X + CANTEEN_W + 2, GROUND + 4, 52, 2761);

  signBoard(c, CORNER_X + 4, GROUND + 5, ['CHAPEL', 'PGN'], P.maroon, P.goldHi);
  // the lane to the covered court and the gym turns off right after the canteen
  signBoard(c, GYM_LANE_X + 34, GROUND + 5, ['COVERED COURT', 'GYM']);

  // the light of the lit windows falls on the bamboo, trees and signs in front of them (the spill, worked
  // out from every window), but a window's own glow must not shine through the leaves: hide it wherever
  // something now stands in front of the building
  const spill = bakeSpill(glow);
  hideBehind(g, bare, c);

  // the old bronze twin-lantern posts along the kerb
  // each lantern a small warm glow round its head and a soft pool on the pavement under the post,
  // not one big white circle washing out the wall behind it
  for (const x of [APS_X + 170, TOWER_X + TOWER_W + 18]) {
    for (const [lx, ly] of twinLantern(c, g, x, GROUND + 14)) {
      lights.push({ x: lx, y: ly, r: 30, color: LANTERN, strength: 0.55 });
    }
    lights.push({ x, y: GROUND + 20, r: 48, color: LANTERN, strength: 0.35 });
  }
  lamp(c, g, lights, GYM_LANE_X + 76);
  // the windows themselves a little less fierce, now that their light reaches the walls round them
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(0, 0, 0, 0.3)';
  g.fillRect(0, 0, WIDTH, VIEW_H);
  g.globalCompositeOperation = 'source-over';
  return { canvas, glow, spill, canteenDoor };
}

export function buildAps(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);

  return {
    id: 'aps',
    title: 'Archbishop Pedro Santos Building',
    subtitle: 'Hanggang canteen at gym lane',
    width: WIDTH,
    walkY: WALK,
    bounds: [24, WIDTH - 40],
    outdoor: true,
    atmosphere: true,
    layers: [
      farCity(WIDTH, 271),
      // Sacred Heart, tall and white with blue glass, rising behind the canteen block
      midCampus(WIDTH, 272, [{ x: CANTEEN_X + 110, w: 150, h: 176, wall: '#eef0ee', glass: '#4f7fc8' }]),
      { canvas: main.canvas, parallax: 1 },
      frontPlants(WIDTH, 273),
    ],
    glow: main.glow,
    lightBake: main.spill,
    lights,
    hotspots: apsHotspots({
      halls: 30,
      // just past the junction, clear of the back road sign and the main door under the canopy
      lawn: CORNER_X + 10,
      aps: APS_X + MAIN_DOOR,
      canteen: main.canteenDoor,
      gym: GYM_LANE_X,
      sh: SH_DOOR,
    }),
    npcs: [],
    spawns: {
      halls: { x: 44, facing: 1 },
      lawn: { x: CORNER_X + 16, facing: 1 },
      canteen: { x: main.canteenDoor, facing: 1 },
      apslobby: { x: APS_X + MAIN_DOOR, facing: 1 },
      gym: { x: GYM_LANE_X + 6, facing: -1 },
    },
    update: ambience(274, [WIDTH - 22, TALL_X + 110, TOWER_X + 32]),
  };
}

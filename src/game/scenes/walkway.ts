// Sidewalk 2 on the PGN side of the chapel walkway, from the rotunda to the
// crossroads before the chapel lawn, looking north-west: the brown paver path
// with its banner lamps along the hedge, the covered sidewalk 1 beyond it,
// and STL's pavilion, the PGN podium and the PGN tower behind that. The road,
// its median and the tall white poles are between you and the camera.
// From `assets/images/buildings/beside the main building + the main walkways/`;
// the other lanes are in walklanes.ts.

import { VIEW_H, makeCanvas } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, rect } from '../../engine/pix';
import { P } from '../art/palette';
import { hedge, tree } from '../art/props';
import { arecaPot, bannerLamp, binRack, hexPavers, pgnPodium, pgnTower, slowDown, stlPavilion, urnPlanter } from '../art/walks';
import { STREETS, streetWidth } from '../campus/streets';
import { walkwayHotspots } from '../story/walks';
import { AreaDef, AreaLight, Layer } from '../types';
import { GROUND, ambience, farCity, layerWidth } from './kit';
import { U, WALK, at, coveredWalkSide, laneX } from './walklanes';

const S = STREETS.walkway;
const WIDTH = streetWidth(S);

/** STL and PGN beyond the covered walk, and the PGN tower rising over everything. */
function buildingsLayer(): Layer {
  const p = 0.8;
  const [canvas, c] = makeCanvas(layerWidth(WIDTH, p), VIEW_H);
  const [, g] = makeCanvas(layerWidth(WIDTH, p), VIEW_H);
  const base = GROUND - 30;
  const rand = rng(9601);
  for (let x = -10; x < canvas.width; x += 40 + rand() * 40) tree(c, x, base + 2, 80 + rand() * 30, 26, 9602 + Math.round(x));
  stlPavilion(c, g, -20, at(laneX(S, -150), p), base, base - 64);
  pgnPodium(c, g, at(laneX(S, -135), p), at(laneX(S, -92), p), base, base - 80);
  pgnTower(c, g, at(laneX(S, -92), p), at(laneX(S, -69), p), base, 6);
  rect(c, 0, base, canvas.width, VIEW_H - base, P.grassDark);
  return { canvas, parallax: p, haze: 0.1 };
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const ROT = laneX(S, U.rotunda);
  const END = laneX(S, U.pgnEnd);
  const HEDGE = [laneX(S, U.hedgeB), laneX(S, U.hedgeA)];

  // the covered sidewalk 1 beyond the hedge, the same build as on the Main Building side
  coveredWalkSide(c, ROT, END, GROUND - 14, 0.78, 9612, true);
  // the hedge with the banner lamps and bins along it, open where the ways through are
  for (let x = ROT; x < END; x += 110) {
    const e = Math.min(END, x + 104);
    const k = HEDGE.find((v) => v > x - 16 && v < e + 16);
    if (k !== undefined) {
      if (k - 16 > x) hedge(c, x, GROUND + 4, k - 16 - x, 9, 9603 + x);
      if (e > k + 16) hedge(c, k + 16, GROUND + 4, e - k - 16, 9, 9604 + x);
    } else hedge(c, x, GROUND + 4, e - x, 9, 9605 + x);
  }
  for (let x = ROT + 70; x < END; x += 150) {
    if (HEDGE.some((k) => Math.abs(k - x) < 30)) continue;
    for (const l of bannerLamp(c, x, GROUND + 4, 96, 9606 + x)) {
      disc(g, l.x, l.y, 3, P.lamp);
      lights.push({ x: l.x, y: l.y, r: 80, color: hex(P.lamp), strength: 0.85 });
    }
    lights.push({ x, y: GROUND + 24, r: 60, color: hex(P.lamp), strength: 0.45 });
  }
  for (const k of HEDGE) binRack(c, k + 22, GROUND + 6);
  // the paver path; the rotunda end and the crossroads end open out
  hexPavers(c, 0, WIDTH, GROUND + 4, VIEW_H - GROUND - 4, 9607);
  tree(c, END + 30, GROUND + 4, 110, 36, 9608);
  return { canvas, glow };
}

/** In front: the road's kerb, the median with its urns and tall white poles, the SLOW DOWN sign, a palm. */
function frontLayer(): Layer {
  const p = 1.3;
  const [canvas, c] = makeCanvas(layerWidth(WIDTH, p), VIEW_H);
  const ROT = laneX(S, U.rotunda);
  const END = laneX(S, U.pgnEnd);
  const CROSS = [laneX(S, U.crossA), laneX(S, U.crossB)];
  rect(c, 0, VIEW_H - 6, canvas.width, 2, '#d8d3c6');
  rect(c, 0, VIEW_H - 4, canvas.width, 4, '#77737a');
  for (const k of CROSS) for (let i = 0; i < 4; i++) rect(c, at(k, p) - 30 + i * 16, VIEW_H - 4, 10, 4, '#e6c33a');
  // the median's urns of flowers along the road's edge
  const rand = rng(9609);
  for (let x = ROT + 90; x < END; x += 190 + rand() * 30) {
    if (CROSS.some((k) => Math.abs(k - x) < 50)) continue;
    urnPlanter(c, at(x, p), VIEW_H - 4);
  }
  slowDown(c, at(ROT + 130, p), VIEW_H - 2);
  arecaPot(c, at(END - 40, p), VIEW_H - 2, 9610, 1.5);
  return { canvas, parallax: p, front: true };
}

export function buildWalkway(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const ROT = laneX(S, U.rotunda);
  const END = laneX(S, U.pgnEnd);
  const HEDGE = [laneX(S, U.hedgeB), laneX(S, U.hedgeA)];
  const CROSS = [laneX(S, U.crossA), laneX(S, U.crossB)];

  return {
    id: 'walkway',
    title: 'Sidewalk 2',
    subtitle: 'Sa gilid ng PGN, papunta sa chapel',
    subtitleEn: 'Along PGN, toward the chapel',
    width: WIDTH,
    walkY: WALK,
    bounds: [16, WIDTH - 16],
    outdoor: true,
    layers: [farCity(WIDTH, 9611), buildingsLayer(), { canvas: main.canvas, parallax: 1 }, frontLayer()],
    glow: main.glow,
    lights,
    hotspots: walkwayHotspots({ rotunda: 22, hedge: HEDGE, cross: CROSS, lawn: END + 24 }),
    npcs: [],
    spawns: {
      rotunda: { x: ROT - 10, facing: 1 },
      lawn: { x: END + 14, facing: -1 },
      hedgeA: { x: HEDGE[1], facing: 1 },
      hedgeB: { x: HEDGE[0], facing: 1 },
      crossA: { x: CROSS[0], facing: -1 },
      crossB: { x: CROSS[1], facing: -1 },
    },
    update: ambience(214, [END + 30]),
  };
}

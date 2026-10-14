// The road in front of the Don Juan D. Nepomuceno Building, looking
// north-east. The rotunda with the Holy Guardian Angel statue fountain is on
// the left, where the chapel walkway and the parking lane meet; the building
// is in the middle; the bronze guardian angel stands on its lawn beside the
// building, and St. Barachiel Gate, the vehicle entrance on Holy Angel
// Avenue, is on the right. The Epiphany of Angels is behind the camera.
// Holy Rosary Parish peeks over the rooftops.
//
// This scene was drawn before the campus plan existed and keeps its own
// spacing; see FIXED in campus/streets.ts for how it is tied to the plan.

import { VIEW_H, VIEW_W, makeCanvas, Ctx } from '../../engine/display';
import { hex, rng } from '../../engine/math';
import { disc, ellipse, line, poly, px, rect, sign } from '../../engine/pix';
import { chapel } from '../art/buildings';
import { DJN_DOOR_X, DJN_WIDTH, drawDJN } from '../art/djn';
import { P, shade } from '../art/palette';
import {
  SILHOUETTE, angelStatue, boomBarrier, bush, foliage, guardHouse, hedge, lampPost, palm, pot,
  signBoard, tree, tricycle,
} from '../art/props';
import { BASIN_RX, brickBasin, guardianGroup, wetSign } from '../art/street';
import { plazaHotspots, plazaNpcs } from '../story/plaza';
import { AreaDef, AreaLight } from '../types';

const WIDTH = 1340;
const GROUND = 204;
const WALK = 240;
const DJN_X = 410;
const FOUNTAIN_X = 190;
/** the water line of the brick basin */
const FOUNTAIN_Y = 220;
/** the bronze guardian angel on its lawn, beside the building */
const STATUE_X = 1100;
const GATE_X = 1250;
/** the parking lane carries on off the left edge */
const LANE_X = 44;
/** the chapel walkway leaves the rotunda away from the camera */
const WALKWAY_X = 100;
/** the path down to the fountain plaza and the Epiphany of Angels, towards the camera */
const EPIPHANY_X = 470;
/** the east steps up to the flag plaza and the side gate, towards the camera */
const FLAG_X = 556;
/** the covered walk (sidewalk 1) and the student center leave from beside the DJN's left wing, away from the camera */
const SW1_X = 338;
const STUC_X = 400;

export const PLAZA_DOOR_X = DJN_X + DJN_DOOR_X;

function layerWidth(parallax: number): number {
  return Math.ceil(VIEW_W + (WIDTH - VIEW_W) * parallax) + 4;
}

/** Holy Rosary Parish and the far tree line. */
function farLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(0.16), VIEW_H);
  const rand = rng(41);
  const stone = '#8d8a92';
  const stoneDark = '#6c6a76';
  const stoneLit = '#a9a6aa';

  const tower = (x: number, top: number) => {
    rect(c, x, top + 40, 26, GROUND - top - 40, stone);
    rect(c, x, top + 40, 6, GROUND - top - 40, stoneLit);
    rect(c, x + 20, top + 40, 6, GROUND - top - 40, stoneDark);
    rect(c, x - 2, top + 38, 30, 3, stoneLit);
    rect(c, x + 3, top + 20, 20, 18, stone);
    rect(c, x + 3, top + 20, 5, 18, stoneLit);
    rect(c, x + 18, top + 20, 5, 18, stoneDark);
    rect(c, x + 1, top + 18, 24, 3, stoneLit);
    rect(c, x + 10, top + 25, 6, 10, '#3a3846'); // belfry arch
    rect(c, x + 9, top + 50, 8, 14, '#3a3846');
    rect(c, x + 9, top + 76, 8, 14, '#3a3846');
    poly(c, [[x + 3, top + 18], [x + 23, top + 18], [x + 13, top - 6]], '#c9ccd4');
    poly(c, [[x + 3, top + 18], [x + 13, top + 18], [x + 13, top - 6]], '#e6e8ee');
    rect(c, x + 13, top - 12, 1, 7, stoneDark);
    rect(c, x + 11, top - 10, 5, 1, stoneDark);
  };

  // church: dome behind, nave, twin bell towers
  const cx = 640;
  disc(c, cx - 86, 132, 26, '#c5c9d2');
  disc(c, cx - 92, 126, 18, '#e1e4ea');
  rect(c, cx - 112, 134, 54, 70, stone);
  rect(c, cx - 112, 132, 54, 3, stoneLit);
  rect(c, cx - 89, 96, 6, 12, '#aab0bc');
  rect(c, cx - 87, 86, 2, 10, stoneDark);
  rect(c, cx - 60, 128, 130, 76, stone);
  poly(c, [[cx - 64, 128], [cx + 74, 128], [cx + 5, 104]], stoneDark);
  rect(c, cx - 8, 150, 26, 54, stoneLit);
  poly(c, [[cx - 12, 150], [cx + 22, 150], [cx + 5, 132]], stoneLit);
  rect(c, cx, 170, 10, 34, '#3a3846');
  disc(c, cx + 5, 160, 4, '#3a3846');
  tower(cx - 40, 92);
  tower(cx + 26, 88);

  // rooftops and trees along the horizon
  for (let x = -10; x < canvas.width; x += 28 + rand() * 30) {
    const h = 14 + rand() * 22;
    if (Math.abs(x - cx) < 130) continue;
    rect(c, x, GROUND - h, 34, h, rand() > 0.5 ? '#b9a48f' : '#a7a2a8');
    poly(c, [[x - 3, GROUND - h], [x + 37, GROUND - h], [x + 17, GROUND - h - 9]], '#a0584a');
  }
  for (let x = -20; x < canvas.width; x += 16 + rand() * 20) {
    foliage(c, x, GROUND - 8 - rand() * 14, 14 + rand() * 10, 10 + rand() * 8, 500 + x, {
      deep: '#31543f', dark: '#3b6347', mid: '#48754f', lit: '#5a8a5a', hi: '#6b9a62',
    });
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, '#3b6347');
  return canvas;
}

// --- the view down the chapel walkway ---------------------------------------------------------------------
//
// The plaza's backdrop on the rotunda side is the chapel walkway seen from the
// fountain, as in `the whole sidewalk hierarchy from the fountain, facing the
// church.jpg`: the road runs away from you to the chapel, with sidewalk 2 and
// the covered sidewalk 1 on each side, the PGN tower over the left side and
// the student center, the DJN's side and the big trees on the right. Drawn in
// layer pixels, in perspective to one vanishing point.

const MID = 0.42;
/** where every line of the walkway meets, at the chapel */
const VX = 300;
const VY = 138;

/** A point `x` across the walkway's near end, `s` of the way back towards the near end (1 is the near end, at GROUND). */
function far(x: number, s: number): [number, number] {
  return [VX + (x - VX) * s, VY + (GROUND - VY) * s];
}

/** the depths things stand at: evenly spaced along the walk, so they bunch up with distance */
const DEPTHS = Array.from({ length: 18 }, (_, k) => 1 / (1 + k * 0.36)).reverse();
const S0 = 0.05;

// near-end edges of each strip, left to right
const PGN_CW = [-80, 50];
const PGN_SW = [50, 140];
const LANE_L = [140, 238];
const MED = [238, 266];
const LANE_R = [266, 388];
const DJN_SW = [388, 454];
const DJN_CW = [470, 590];
const STUC = [590, 650];
/** the view is only seen to the left of the DJN; past it the backdrop is the rest of the campus */
const VISTA_R = 520;

function band(c: Ctx, x0: number, x1: number, colour: string): void {
  poly(c, [[x0, GROUND], [x1, GROUND], far(x1, S0), far(x0, S0)], colour);
}

/** A wall standing along the line `x`, from depth `s1` back to `s0`, `h` tall at the near end, its floor lines running to the chapel. */
function sideWall(c: Ctx, x: number, s0: number, s1: number, h: number, wall: string, line_: string, floor: number): void {
  const [a, ay] = far(x, s1);
  const [b, by] = far(x, s0);
  poly(c, [[a, ay], [b, by], [b, by - h * s0], [a, ay - h * s1]], wall);
  for (let k = floor; k < h; k += floor) line(c, a, ay - k * s1, b, by - k * s0, line_, 1);
}

function vista(c: Ctx): void {
  const rand = rng(4001);
  c.save();
  c.beginPath();
  c.rect(0, 0, VISTA_R, VIEW_H);
  c.clip();

  // the chapel at the far end, drawn full size and shrunk into place, the trees of its lawn either side
  const [big, bc] = makeCanvas(300, 300);
  const [, bg] = makeCanvas(300, 300);
  chapel(bc, bg, 150, 290, 220);
  for (const [dx, h] of [[-58, 50], [56, 46], [-80, 40], [80, 42]] as const) tree(c, VX + dx, VY + 6, h, 18, 4100 + dx);
  c.imageSmoothingEnabled = false;
  c.drawImage(big, 0, 0, 300, 300, VX - 40, VY + 8 - 80, 80, 80);

  // the PGN side: the podium along the walk, the tower rising over it and out of the top of the picture
  sideWall(c, PGN_CW[0] - 8, S0 * 2, 0.95, 190, '#e7e5df', '#cdcac2', 38);
  for (const s of DEPTHS) {
    if (s > 0.9 || s < S0 * 2) continue;
    const [x, y] = far(PGN_CW[0] - 8, s);
    rect(c, x - 8 * s, y - 150 * s, Math.max(1, 8 * s), 110 * s, '#4f5d70');
  }
  const T0 = 0.22;
  const T1 = 0.42;
  sideWall(c, PGN_CW[0] - 40, T0, T1, 900, '#dfe3e8', '#f7f8f9', 30);
  // the tower's glass between its white floor slabs, and the end facing you
  for (let k = 0; k < 900; k += 30) {
    const [a, ay] = far(PGN_CW[0] - 40, T1);
    const [b, by] = far(PGN_CW[0] - 40, T0);
    poly(c, [[a, ay - (k + 8) * T1], [b, by - (k + 8) * T0], [b, by - (k + 26) * T0], [a, ay - (k + 26) * T1]], '#5a7fb6');
  }
  const [tx, ty] = far(PGN_CW[0] - 40, T1);
  const fw = 260 * T1;
  rect(c, tx - fw, -10, fw, ty + 10, '#e9ecef');
  for (let y = ty; y > -30; y -= 30 * T1) {
    rect(c, tx - fw, y - 22 * T1, fw, 18 * T1, '#5a7fb6');
    rect(c, tx - fw - 4, y - 4 * T1, fw + 4, Math.max(2, 5 * T1), '#ffffff');
  }

  // the Main Building side: the student center's roof and the DJN's side wall over it
  sideWall(c, STUC[1] + 6, S0 * 2, 0.95, 230, P.wall, P.wallShade, 50);
  for (const s of DEPTHS) {
    if (s > 0.9 || s < S0 * 2) continue;
    const [x, y] = far(STUC[1] + 6, s);
    rect(c, x, y - 190 * s, Math.max(1, 7 * s), 34 * s, P.glass);
    rect(c, x, y - 120 * s, Math.max(1, 7 * s), 34 * s, P.glass);
  }
  sideWall(c, STUC[1] + 2, S0 * 2, 0.95, 70, '#e6d8a8', '#a8553c', 62);

  // the ground
  band(c, PGN_CW[0], PGN_CW[1], '#e3d9c6');
  band(c, PGN_SW[0], PGN_SW[1], '#8d6f5c');
  band(c, LANE_L[0], LANE_L[1], P.road);
  band(c, MED[0], MED[1], P.grass);
  band(c, LANE_R[0], LANE_R[1], P.road);
  band(c, DJN_SW[0], DJN_SW[1], '#8d6f5c');
  band(c, DJN_SW[1], DJN_CW[0], P.grassDark);
  band(c, DJN_CW[0], DJN_CW[1], '#e3d9c6');
  band(c, STUC[0], STUC[1], '#b05a3c');
  for (const x of [LANE_L[0], MED[0], MED[1], LANE_R[1]]) line(c, x, GROUND, ...far(x, S0), '#d3cec0', 1);
  // the joints of the pavers and the tiles, closer together with distance
  for (const s of DEPTHS) {
    const y = far(0, s)[1];
    for (const [a, b, col] of [[PGN_SW[0], PGN_SW[1], '#6c5546'], [DJN_SW[0], DJN_SW[1], '#6c5546'], [PGN_CW[0], PGN_CW[1], '#cdbfa8'], [DJN_CW[0], DJN_CW[1], '#cdbfa8']] as const) {
      rect(c, far(a, s)[0], y, far(b, s)[0] - far(a, s)[0], 1, col);
    }
  }
  // the dashes down the middle of the right lane
  for (let i = 0; i + 1 < DEPTHS.length; i += 2) {
    const [x0, y0] = far((LANE_R[0] + LANE_R[1]) / 2, DEPTHS[i]);
    const [x1, y1] = far((LANE_R[0] + LANE_R[1]) / 2, (DEPTHS[i] + DEPTHS[i + 1]) / 2);
    line(c, x0, y0, x1, y1, '#e9e5d8', 1);
  }

  // the covered walks' roofs, seen from under them: slats running across, a white beam along each edge
  for (const cw of [PGN_CW, DJN_CW]) {
    const h = 118;
    const [a, ay] = far(cw[0], 1);
    const [b] = far(cw[1], 1);
    const [fa, fy] = far(cw[0], S0);
    const [fb] = far(cw[1], S0);
    poly(c, [[a, ay - h], [b, ay - h], [fb, fy - h * S0], [fa, fy - h * S0]], '#d8d5cc');
    for (const s of DEPTHS) {
      const [p0, py] = far(cw[0], s);
      const [p1] = far(cw[1], s);
      rect(c, p0, py - h * s, p1 - p0, Math.max(1, 3 * s), '#f2f0e9');
    }
    line(c, a, ay - h, fa, fy - h * S0, '#ffffff', 2);
    line(c, b, ay - h, fb, fy - h * S0, '#ffffff', 2);
  }

  // everything standing along the walk, far to near
  for (const [i, s] of DEPTHS.entries()) {
    const pw = Math.max(1, Math.round(16 * s));
    const ph = 118 * s;
    // the median: grass, an urn of flowers every other step
    if (i % 2 === 1) {
      const [mx, my] = far((MED[0] + MED[1]) / 2, s);
      const u = Math.max(2, Math.round(16 * s));
      rect(c, mx - u / 2, my - u, u, u, '#c9a385');
      rect(c, mx - u / 2, my - u, u, Math.max(1, u / 5), '#e0bfa0');
      foliage(c, mx, my - u - 4 * s, Math.max(2, 12 * s), Math.max(1, 6 * s), 4200 + i, { deep: '#2f5a2a', dark: '#3f7a35', mid: '#4f8a40', lit: '#5f9a4a', hi: '#f07ab0' });
    }
    // the pillars of the covered walks, a pair across each
    for (const cw of [PGN_CW, DJN_CW]) {
      const [x0, y0] = far(cw[0], s);
      const [x1] = far(cw[1], s);
      for (const x of [x0, x1 - pw]) {
        rect(c, x, y0 - ph, pw, ph, '#d9886b');
        if (pw > 2) rect(c, x, y0 - ph, Math.max(1, pw / 4), ph, '#eaa688');
        if (pw > 3) rect(c, x + pw - Math.max(1, pw / 5), y0 - ph, Math.max(1, pw / 5), ph, '#b46a53');
        if (pw > 4) for (let yy = y0 - 16 * s; yy > y0 - ph; yy -= 16 * s) rect(c, x, yy, pw, 1, '#a35f4a');
      }
      // a granite bench between the pillars on the building side
      if (s > 0.2 && i % 2 === 0) {
        const bx = cw === PGN_CW ? x0 + pw + 2 * s : x1 - pw - 26 * s;
        rect(c, bx, y0 - 12 * s, 24 * s, Math.max(1, 4 * s), '#c9c3b6');
      }
    }
    // the banner lamps along both sidewalks 2
    if (i % 2 === 0) {
      for (const lx of [PGN_SW[0] + 8, DJN_SW[1] - 8]) {
        const [x, y] = far(lx, s);
        const h = 170 * s;
        rect(c, x, y - h, Math.max(1, 3 * s), h, '#6b4130');
        rect(c, x - 14 * s, y - h + 6 * s, Math.max(1, 5 * s), Math.max(1, 8 * s), '#d9c27a');
        rect(c, x + 12 * s, y - h + 6 * s, Math.max(1, 5 * s), Math.max(1, 8 * s), '#d9c27a');
        rect(c, x + 3 * s, y - h + 28 * s, Math.max(1, 22 * s), Math.max(2, 38 * s), '#f3f1ea');
        if (s > 0.35) rect(c, x + 8 * s, y - h + 36 * s, 10 * s, 14 * s, rand() > 0.5 ? '#c99a6a' : '#9aa6b8');
      }
    }
    // the big trees between sidewalk 2 and the covered walk on the Main Building side, smaller ones by PGN
    if (i % 3 === 1) {
      const [x, y] = far(DJN_SW[1] + 8, s);
      tree(c, x, y, 280 * s, 80 * s, 4300 + i);
      const [u, v] = far(PGN_SW[0] - 6, s);
      tree(c, u, v, 210 * s, 54 * s, 4400 + i);
    }
  }
  c.restore();
}

/** The campus beyond the plaza: the chapel walkway behind the rotunda, other campus buildings past the DJN. */
function midLayer(): HTMLCanvasElement {
  const [canvas, c] = makeCanvas(layerWidth(MID), VIEW_H);
  const rand = rng(77);
  vista(c);

  // banded high-rise: white slabs, grey spandrels, blue glass
  const tower = (x: number, top: number, w: number, floors: number) => {
    const fh = Math.floor((GROUND - top) / floors);
    rect(c, x, top, w, GROUND - top, '#70747e');
    for (let f = 0; f < floors; f++) {
      const y = top + f * fh;
      rect(c, x - 3, y, w + 6, 5, '#ecebe6');
      rect(c, x - 3, y + 5, w + 6, 1, '#b9b8b6');
      rect(c, x, y + 6, w, fh - 6, '#565c6c');
      for (let wx = x + 3; wx < x + w - 6; wx += 9) {
        rect(c, wx, y + 8, 6, fh - 10, rand() > 0.25 ? '#6b8fc4' : '#8fb1dc');
      }
    }
    rect(c, x + w - 10, top, 13, GROUND - top, '#5a5e68');
    rect(c, x + 4, top - 8, w * 0.4, 8, '#8a8d95');
    rect(c, x + w * 0.6, top - 16, 1, 16, '#55585f');
  };
  // past the DJN: a banded block and a lower one, the trees between them
  tower(640, 70, 120, 7);

  // low covered walk and classroom blocks in between
  for (const [x, w, h] of [[780, 140, 46]] as const) {
    rect(c, x, GROUND - h, w, h, '#d8c9a2');
    rect(c, x, GROUND - h, w, 4, '#f0e8d2');
    for (let wx = x + 6; wx < x + w - 8; wx += 12) rect(c, wx, GROUND - h + 10, 7, 10, '#4c5568');
    for (let wx = x + 6; wx < x + w - 8; wx += 12) rect(c, wx, GROUND - h + 28, 7, 10, '#4c5568');
    poly(c, [[x - 4, GROUND - h], [x + w + 4, GROUND - h], [x + w - 8, GROUND - h - 8], [x + 8, GROUND - h - 8]], '#a8503e');
  }

  for (let x = VISTA_R + 10; x < canvas.width; x += 44 + rand() * 50) {
    tree(c, x, GROUND + 2, 52 + rand() * 34, 18 + rand() * 10, 900 + Math.round(x));
  }
  rect(c, 0, GROUND, canvas.width, VIEW_H - GROUND, P.grassDark);
  return canvas;
}

function ground(c: Ctx): void {
  const rand = rng(5);
  // sidewalk along the building
  rect(c, 0, GROUND, WIDTH, 14, P.pave);
  rect(c, 0, GROUND, WIDTH, 1, shade(P.pave, 0.35));
  for (let x = 0; x < WIDTH; x += 14) rect(c, x, GROUND + 1, 1, 12, P.paveLine);
  rect(c, 0, GROUND + 7, WIDTH, 1, P.paveLine);
  // curb
  rect(c, 0, GROUND + 14, WIDTH, 2, shade(P.pave, 0.3));
  rect(c, 0, GROUND + 16, WIDTH, 2, P.paveDark);
  // driveway: pebble-wash concrete, a touch darker towards the camera
  rect(c, 0, GROUND + 18, WIDTH, VIEW_H - GROUND - 18, P.road);
  rect(c, 0, GROUND + 18, WIDTH, 10, shade(P.road, 0.14));
  rect(c, 0, GROUND + 28, WIDTH, 10, shade(P.road, 0.06));
  rect(c, 0, GROUND + 52, WIDTH, 20, shade(P.road, -0.12));
  for (let i = 0; i < 2600; i++) {
    px(c, rand() * WIDTH, GROUND + 18 + rand() * (VIEW_H - GROUND - 18), rand() > 0.5 ? P.roadLine : P.roadDark);
  }
  // expansion joints
  for (let x = 40; x < WIDTH; x += 120) line(c, x, GROUND + 18, x - 26, VIEW_H, P.roadDark, 1);
  rect(c, 0, GROUND + 44, WIDTH, 1, P.roadDark);
}

function mainLayer(lights: AreaLight[]): { canvas: HTMLCanvasElement; glow: HTMLCanvasElement } {
  const [canvas, c] = makeCanvas(WIDTH, VIEW_H);
  const [glow, g] = makeCanvas(WIDTH, VIEW_H);
  const lampColor = hex(P.lamp);

  // trees standing behind the building line
  tree(c, 60, GROUND + 4, 120, 44, 301);
  tree(c, 1070, GROUND + 2, 110, 38, 303);
  tree(c, 1210, GROUND + 2, 96, 34, 304);

  ground(c);
  drawDJN(c, g, DJN_X, GROUND);

  // planting along the wings
  for (const [x, w] of [[DJN_X + 6, 176], [DJN_X + DJN_WIDTH - 184, 178]] as const) {
    hedge(c, x, GROUND + 3, w, 11, x);
    for (let i = 0; i < 4; i++) bush(c, x + 18 + i * 46, GROUND + 1, 26, 16, x + i * 5);
  }
  palm(c, DJN_X + 34, GROUND + 3, 60, 311);
  palm(c, DJN_X + 122, GROUND + 3, 72, 312);
  palm(c, DJN_X + DJN_WIDTH - 118, GROUND + 3, 68, 313);
  palm(c, DJN_X + DJN_WIDTH - 40, GROUND + 3, 58, 314);
  pot(c, DJN_X + 196, GROUND + 6, 21);
  pot(c, DJN_X + DJN_WIDTH - 196, GROUND + 6, 22);

  // the two lamps flanking the steps, and more along the drive
  for (const x of [112, 236, DJN_X + 178, DJN_X + DJN_WIDTH - 178, 1050, 1180]) {
    const l = lampPost(c, x, GROUND + 15);
    lights.push({ x: l.x, y: l.y, r: 92, color: lampColor, strength: 0.95 });
    disc(g, l.x, l.y, 4, P.lamp);
    lights.push({ x: l.x, y: GROUND + 24, r: 60, color: lampColor, strength: 0.5 });
  }
  // light spilling out of the open door and across the steps
  lights.push({ x: PLAZA_DOOR_X, y: GROUND - 30, r: 110, color: [255, 208, 140], strength: 0.9 });

  // the rotunda: the Holy Guardian Angel and two children stand in the fountain
  // a yellow arrow painted on the road sends cars round it
  poly(c, [
    [FOUNTAIN_X + 96, GROUND + 50], [FOUNTAIN_X + 132, GROUND + 47], [FOUNTAIN_X + 131, GROUND + 44], [FOUNTAIN_X + 150, GROUND + 51],
    [FOUNTAIN_X + 132, GROUND + 57], [FOUNTAIN_X + 132, GROUND + 54], [FOUNTAIN_X + 98, GROUND + 55],
  ], P.gold);
  brickBasin(c, FOUNTAIN_X, FOUNTAIN_Y);
  guardianGroup(c, FOUNTAIN_X, FOUNTAIN_Y - 9);
  wetSign(c, FOUNTAIN_X - BASIN_RX - 16, GROUND + 34);
  lights.push({ x: FOUNTAIN_X, y: FOUNTAIN_Y - 60, r: 84, color: [255, 214, 150], strength: 0.8 });
  hedge(c, 0, GROUND + 4, 26, 10, 9);
  signBoard(c, LANE_X, GROUND + 3, ['PARKING', 'SFJ STL']);
  signBoard(c, WALKWAY_X, GROUND + 3, ['CHAPEL', 'WALKWAY'], P.maroon, P.goldHi);
  signBoard(c, EPIPHANY_X, GROUND + 3, ['EPIPHANY', 'OF ANGELS'], P.maroon, P.goldHi);
  signBoard(c, FLAG_X, GROUND + 3, ['FLAGPOLE', 'SIDE GATE'], P.maroon, P.goldHi);

  // guardian angel on its little lawn
  ellipse(c, STATUE_X, GROUND + 22, 58, 7, P.pave);
  ellipse(c, STATUE_X, GROUND + 21, 54, 6, P.grass);
  ellipse(c, STATUE_X - 6, GROUND + 19, 40, 3, P.grassHi);
  angelStatue(c, STATUE_X, GROUND + 22);
  palm(c, STATUE_X + 42, GROUND + 20, 54, 315);
  lights.push({ x: STATUE_X, y: GROUND - 40, r: 70, color: [255, 214, 150], strength: 0.75 });

  tricycle(c, 1168, GROUND + 28);
  guardHouse(c, GATE_X, GROUND + 14);
  boomBarrier(c, GATE_X - 12, GROUND + 22, 84, 2.05);
  // gate wall closing off the right edge
  rect(c, GATE_X + 52, GROUND - 40, WIDTH - GATE_X - 52, 58, P.wall);
  rect(c, GATE_X + 52, GROUND - 44, WIDTH - GATE_X - 52, 4, P.trim);
  for (let x = GATE_X + 58; x < WIDTH; x += 5) rect(c, x, GROUND - 62, 1, 18, P.iron);
  rect(c, GATE_X + 52, GROUND - 62, WIDTH - GATE_X - 52, 1, P.iron);
  sign(c, 'HOLY ANGEL AVE.', GATE_X + 56, GROUND - 26, P.maroon);
  rect(g, GATE_X + 8, GROUND - 22, 20, 15, '#ffd98a');
  lights.push({ x: GATE_X + 18, y: GROUND - 10, r: 54, color: [255, 220, 160], strength: 0.7 });

  return { canvas, glow };
}

/** Out-of-focus plants close to the camera. */
function frontLayer(): HTMLCanvasElement {
  const parallax = 1.35;
  const [canvas, c] = makeCanvas(layerWidth(parallax), VIEW_H);
  const rand = rng(88);
  for (let x = 60; x < canvas.width; x += 260 + rand() * 220) {
    if (rand() < 0.6) {
      // just the tops of some bushes along the bottom edge
      bush(c, x, VIEW_H + 34, 120 + rand() * 60, 50 + rand() * 12, 700 + x, SILHOUETTE);
    } else {
      // a branch hanging in from the top
      foliage(c, x, -8, 84, 22, 740 + x, SILHOUETTE);
      foliage(c, x + 56, -2, 44, 14, 741 + x, SILHOUETTE);
    }
  }
  return canvas;
}

export function buildPlaza(): AreaDef {
  const lights: AreaLight[] = [];
  const main = mainLayer(lights);
  const rand = rng(1234);

  // thin jets set round the rim that arc in over the water towards the statue,
  // and the two spouts from the ram's heads on its pedestal
  const jets = [
    ...[-56, -44, -30, 30, 44, 56].map((dx) => ({
      x: dx, y: Math.abs(dx) === 44 ? 3 : Math.abs(dx) === 30 ? 5 : 0, power: 58, rate: 22, push: -Math.sign(dx) * (12 + Math.abs(dx) * 0.22),
    })),
    ...[-1, 1].map((side) => ({ x: side * 27, y: -24, power: 16, rate: 40, push: side * 14 })),
  ];
  let leafTimer = 0;
  let fireflyTimer = 0;

  return {
    id: 'plaza',
    title: 'Don Juan D. Nepomuceno Building',
    subtitle: 'Holy Angel University, Angeles City',
    width: WIDTH,
    walkY: WALK,
    bounds: [26, WIDTH - 64],
    outdoor: true,
    layers: [
      { canvas: farLayer(), parallax: 0.16, haze: 0.62 },
      { canvas: midLayer(), parallax: MID, haze: 0.1 },
      { canvas: main.canvas, parallax: 1 },
      { canvas: frontLayer(), parallax: 1.35, front: true },
    ],
    glow: main.glow,
    lights,
    hotspots: plazaHotspots({
      lane: LANE_X, walkway: WALKWAY_X, sw1: SW1_X, stuc: STUC_X, fountain: FOUNTAIN_X, epiphany: EPIPHANY_X, entry: FLAG_X, door: PLAZA_DOOR_X, statue: STATUE_X, gate: 1262,
    }),
    npcs: plazaNpcs(),
    fountainX: FOUNTAIN_X,
    spawns: {
      start: { x: 1130, facing: -1 },
      door: { x: PLAZA_DOOR_X, facing: -1 },
      epiphany: { x: EPIPHANY_X, facing: 1 },
      walkway: { x: WALKWAY_X + 4, facing: 1 },
      lane: { x: LANE_X, facing: 1 },
      // back from the Main Building side of the chapel walkway
      djnwalk: { x: SW1_X, facing: 1 },
      stuc: { x: STUC_X, facing: -1 },
      // down the east steps from the flag plaza
      entry: { x: FLAG_X, facing: 1 },
    },

    update(dt, area, view) {
      for (const j of jets) {
        let n = j.rate * dt;
        while (n > rand()) {
          n -= 1;
          area.spawnParticle({
            x: FOUNTAIN_X + j.x + (rand() - 0.5) * 2,
            y: FOUNTAIN_Y + j.y - 2,
            vx: j.push + (rand() - 0.5) * (j.power * 0.22),
            vy: -j.power * (0.8 + rand() * 0.3),
            gravity: 170,
            max: 2.2,
            floor: FOUNTAIN_Y - 2 + rand() * 4,
            color: rand() > 0.35 ? '#f2fbff' : '#b9dcf0',
            size: rand() > 0.8 ? 2 : 1,
          });
        }
      }
      // leaves drifting down from the big trees
      leafTimer -= dt;
      if (leafTimer <= 0) {
        leafTimer = 0.7 + rand() * 1.4;
        const from = [60, 330, 1070, 1210][Math.floor(rand() * 4)];
        area.spawnParticle({
          x: from + (rand() - 0.5) * 70,
          y: GROUND - 90 + rand() * 30,
          vx: 6 + rand() * 8,
          vy: 9 + rand() * 6,
          sway: 16,
          max: 9,
          floor: GROUND + 16 + rand() * 40,
          color: rand() > 0.5 ? '#c9a23e' : '#8fbf58',
        });
      }
      if (view.mood.night > 0.6) {
        fireflyTimer -= dt;
        if (fireflyTimer <= 0) {
          fireflyTimer = 0.35;
          area.spawnParticle({
            x: view.camX + rand() * VIEW_W,
            y: GROUND - 20 + rand() * 40,
            vx: (rand() - 0.5) * 8,
            vy: -2 - rand() * 4,
            sway: 14,
            max: 4 + rand() * 3,
            color: '#e9ff9a',
            glow: true,
          });
        }
      }
    },

    drawBack(ctx, view) {
      // ripples on the fountain pool
      const x = FOUNTAIN_X - Math.round(view.camX);
      for (let i = 0; i < 5; i++) {
        const k = (view.time * 0.5 + i / 5) % 1;
        ctx.globalAlpha = (1 - k) * 0.5;
        rect(ctx, x - 30 - k * 20, FOUNTAIN_Y - 2 + (i % 3), 5 + k * 5, 1, P.waterHi);
        rect(ctx, x + 28 + k * 18, FOUNTAIN_Y - 3 + ((i + 1) % 3), 5 + k * 5, 1, P.waterHi);
      }
      ctx.globalAlpha = 1;
    },
  };
}

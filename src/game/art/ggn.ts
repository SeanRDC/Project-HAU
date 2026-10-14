// The Geromin G. Nepomuceno Building, the high school, drawn from the four
// photos in `assets/images/buildings/GGN BUILDING/`: a wide cream frame of red floor slabs
// with tan louvre panels and air-con units between them, over a lobby three
// storeys high behind square columns and a deep canopy; a patchwork of white
// panels, dark windows and red, orange and yellow fins either side of it; and
// a tower of brown louvres at each end with a red fin at every floor. The left
// tower carries the university seal and the building's name, and the campus
// map board stands in front of it.
//
// It is eleven storeys, the biggest building on campus, and at the scale of
// the halls beside it it does not fit on the screen: the top runs off it.

import { Ctx } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, poly, px, rect, sign, signCentered, signWidth } from '../../engine/pix';
import { P, shade } from './palette';

const FLOOR_H = 22;
/** storeys above the canopy */
const STOREYS = 8;
/** the top of the canopy: the lobby under it is as tall as the halls next door */
const LOBBY = 4 * FLOOR_H;
const CANOPY_H = 12;
/** the blank wall under the patchwork either side of the lobby */
const PODIUM = 2 * FLOOR_H;
const COLUMN = 14;

const CREAM = '#ebe4d2';
const CREAM_HI = '#f8f4e6';
const CREAM_LO = '#c3bca8';
const RED = '#dc3329';
const RED_HI = '#f2584a';
const RED_LO = '#a8241d';
const TAN = '#d9a473';
const TAN_HI = '#ebbf93';
const TAN_LO = '#bb8657';
const RECESS = '#e7d6c4';
const BROWN = '#6c4135';
const BROWN_HI = '#8e5d4a';
const BROWN_LO = '#4d2c24';
const GLASS = '#3b4458';
const GLASS_HI = '#55627c';
const GLASS_DK = '#272b38';
const PANEL = '#e9e7df';
const PANEL_HI = '#f8f7f2';
const PANEL_LO = '#bfbdb4';
const FINS = [RED, '#ef7f2e', '#f2c230'];
const WOOD = '#b08348';
const LIT = '#ffd98a';

/** An air-con unit hung on the wall: there is one outside almost every room. */
function airCon(c: Ctx, x: number, y: number): void {
  rect(c, x, y, 7, 6, '#f1efe9');
  rect(c, x + 1, y + 2, 5, 1, '#cbc8c0');
  rect(c, x + 1, y + 4, 5, 1, '#cbc8c0');
  rect(c, x, y + 6, 7, 1, 'rgba(30,24,36,0.35)');
}

/** A screen of brown louvres from `y0` down to `y1`. */
function louvres(c: Ctx, x: number, y0: number, y1: number, w: number): void {
  const top = Math.max(y0, -2);
  rect(c, x, top, w, y1 - top, BROWN);
  for (let y = y1 - 2; y >= top; y -= 2) rect(c, x, y, w, 1, BROWN_HI);
  for (let k = x; k < x + w - 4; k += 21) rect(c, k, top, 1, y1 - top, BROWN_LO);
  rect(c, x + w - 2, top, 2, y1 - top, BROWN_LO);
}

/** A tower of louvres with a red fin sticking out at every floor. `wedge` is the side the fins show their ends on. */
function tower(c: Ctx, x: number, w: number, top: number, base: number, wedge: 1 | 0): void {
  louvres(c, x, top, base, w);
  for (let y = base - LOBBY; y > Math.max(top, -FLOOR_H); y -= FLOOR_H) {
    rect(c, x - 2, y - 1, w + 4, 1, RED_HI);
    rect(c, x - 2, y, w + 4, 2, RED);
    rect(c, x - 2, y + 2, w + 4, 1, RED_LO);
    rect(c, x, y + 3, w, 1, BROWN_LO);
    if (wedge) {
      // the fin seen end on: a red wedge standing out from the corner
      poly(c, [[x + w + 2, y - 1], [x + w + 9, y - 1], [x + w + 2, y + 6]], RED);
      rect(c, x + w + 2, y - 1, 7, 1, RED_HI);
    }
  }
}

/** The patchwork: white panels and dark windows a floor high, air-con units, and coloured fins standing off the wall. */
function patchwork(c: Ctx, g: Ctx, x: number, w: number, top: number, bottom: number, rand: () => number): void {
  rect(c, x, Math.max(top, -2), w, bottom - Math.max(top, -2), GLASS_DK);
  const cols = Math.max(2, Math.round(w / 12));
  for (let y = bottom - FLOOR_H; y > Math.max(top, -FLOOR_H) - 1; y -= FLOOR_H) {
    for (let k = 0; k < cols; k++) {
      const cx = x + Math.round((k * w) / cols);
      const cw = x + Math.round(((k + 1) * w) / cols) - cx;
      if (rand() < 0.42) {
        rect(c, cx, y, cw, FLOOR_H, PANEL);
        rect(c, cx, y, cw, 1, PANEL_HI);
        rect(c, cx + cw - 1, y, 1, FLOOR_H, PANEL_LO);
        rect(c, cx, y + 11, cw, 1, PANEL_LO);
      } else {
        rect(c, cx + 1, y + 2, cw - 2, FLOOR_H - 4, rand() > 0.75 ? GLASS_HI : GLASS);
        rect(c, cx + 1, y + 11, cw - 2, 1, GLASS_DK);
        if (rand() > 0.74) rect(g, cx + 1, y + 2, cw - 2, 9, LIT);
        if (rand() > 0.58) airCon(c, cx + 2, y + 13);
      }
      if (rand() > 0.52) {
        const fin = FINS[Math.floor(rand() * FINS.length)];
        rect(c, cx, y + 1, 2, FLOOR_H - 2, fin);
        rect(c, cx + 2, y + 1, 1, FLOOR_H - 2, shade(fin, -0.35));
      }
    }
  }
  rect(c, x, bottom - 1, w, 2, RED);
}

/** The middle of the front: a cream frame, and in it a red slab at every floor with louvre panels and windows between. */
function slabs(c: Ctx, g: Ctx, x: number, w: number, top: number, bottom: number, rand: () => number): void {
  const pier = 9;
  const y0 = Math.max(top, -2);
  rect(c, x, y0, w, bottom - y0, CREAM);
  rect(c, x, y0, 2, bottom - y0, CREAM_HI);
  rect(c, x + w - 3, y0, 3, bottom - y0, CREAM_LO);
  const ix = x + pier;
  const iw = w - pier * 2;
  for (let y = bottom - FLOOR_H; y > Math.max(top, -FLOOR_H) - 1; y -= FLOOR_H) {
    rect(c, ix, y, iw, FLOOR_H, RECESS);
    // the underside of the slab above is painted red too, and colours the shade under it
    rect(c, ix, y + 4, iw, 2, '#c5362d');
    let wx = ix + Math.round(rand() * 6);
    while (wx < ix + iw - 8) {
      const pw = Math.min(13 + Math.round(rand() * 11), ix + iw - wx);
      rect(c, wx, y + 5, pw, FLOOR_H - 5, TAN);
      for (let ly = y + 6; ly < y + FLOOR_H; ly += 2) rect(c, wx, ly, pw, 1, TAN_LO);
      rect(c, wx, y + 5, 1, FLOOR_H - 5, TAN_HI);
      rect(c, wx + pw - 1, y + 5, 1, FLOOR_H - 5, shade(TAN_LO, -0.25));
      wx += pw;
      const gap = 10 + Math.round(rand() * 7);
      if (wx + gap > ix + iw) break;
      rect(c, wx + 1, y + 12, gap - 2, FLOOR_H - 13, '#39343f');
      rect(c, wx + 1, y + 12, gap - 2, 1, '#5b5563');
      if (rand() > 0.7) rect(g, wx + 1, y + 12, gap - 2, FLOOR_H - 13, LIT);
      if (rand() > 0.3) airCon(c, wx + Math.floor((gap - 7) / 2), y + 6);
      wx += gap;
    }
    rect(c, ix - 1, y, iw + 2, 1, RED_HI);
    rect(c, ix - 1, y + 1, iw + 2, 2, RED);
    rect(c, ix - 1, y + 3, iw + 2, 1, RED_LO);
  }
  rect(c, ix - 1, bottom - 3, iw + 2, 3, RED);
}

/** One way into the lobby, between two columns: what you can see of the inside from the road. */
function opening(c: Ctx, g: Ctx, x: number, w: number, base: number, side: 'left' | 'right'): void {
  const top = base - LOBBY + CANOPY_H;
  rect(c, x, top, w, base - top, '#27232c');
  // the slatted wooden ceiling, with its lights
  rect(c, x, top, w, 9, '#4b3628');
  for (let k = x + 2; k < x + w; k += 4) rect(c, k, top, 1, 9, '#6a4c36');
  rect(c, x, top + 9, w, 1, '#1b181f');
  for (let k = x + 10; k < x + w - 4; k += 18) {
    px(c, k, top + 7, '#fff3c8');
    rect(g, k - 1, top + 6, 3, 3, LIT);
  }

  if (side === 'left') {
    // the mezzanine across the back, its railing, the screen under it
    rect(c, x, base - 50, w, 9, WOOD);
    rect(c, x, base - 50, w, 1, shade(WOOD, 0.3));
    rect(c, x, base - 42, w, 1, shade(WOOD, -0.35));
    rect(c, x, base - 57, w, 1, '#5d5866');
    for (let k = x + 3; k < x + w; k += 5) rect(c, k, base - 57, 1, 7, '#4a4552');
    rect(c, x + 6, base - 36, w - 12, 30, '#322d38');
    rect(c, x + Math.round(w * 0.32), base - 30, 11, 7, '#7fc0e6');
    rect(c, x + Math.round(w * 0.32), base - 30, 11, 1, '#b9e0f4');
    rect(g, x + Math.round(w * 0.32), base - 30, 11, 7, '#bfe6ff');
    rect(g, x + 6, base - 36, w - 12, 30, '#c98f4c');
    // wooden slats hanging by the column
    for (let k = x + w - 16; k < x + w - 3; k += 3) rect(c, k, top + 10, 2, 34 + ((k * 7) % 9), '#6b4530');
  } else {
    // a wall of grey stone, a wooden band, and tall slots in the wall beside it
    const sw = Math.round(w * 0.3);
    rect(c, x + 4, top + 10, sw, base - top - 10, '#77736d');
    for (let y = top + 14; y < base - 4; y += 6) rect(c, x + 4, y, sw, 1, '#625e59');
    for (let k = x + 9; k < x + 4 + sw; k += 8) rect(c, k, top + 10, 1, base - top - 10, '#625e59');
    rect(c, x + 4 + sw, base - 44, w - sw - 4, 8, WOOD);
    rect(c, x + 4 + sw, base - 44, w - sw - 4, 1, shade(WOOD, 0.3));
    rect(c, x + 4 + sw, base - 36, w - sw - 4, 36, '#cfc8b8');
    for (let k = x + 8 + sw; k < x + w - 3; k += 6) rect(c, k, base - 34, 2, 26, '#3b3640');
    rect(g, x + 4 + sw, base - 36, w - sw - 4, 14, '#c98f4c');
    // the brick planter by the steps
    rect(c, x + w - 22, base - 14, 20, 8, '#8a4b3b');
    rect(c, x + w - 22, base - 14, 20, 1, '#a9634f');
    for (let k = x + w - 20; k < x + w - 3; k += 4) rect(c, k, base - 18 - (k % 3), 2, 5, P.leaf);
  }

  // the steps up, yellow on every edge, with a red carpet down the middle
  for (let i = 0; i < 3; i++) {
    const y = base - 6 + i * 2;
    rect(c, x, y, w, 2, '#c9c2b2');
    rect(c, x, y, w, 1, '#e3bd3d');
  }
  const cw = Math.round(w * 0.5);
  const cx = x + Math.round((w - cw) / 2);
  rect(c, cx, base - 6, cw, 6, '#b8322e');
  for (let i = 0; i < 3; i++) rect(c, cx, base - 6 + i * 2, cw, 1, '#d44a41');
  // a rail each side
  for (const k of [x + 3, x + w - 4]) {
    rect(c, k, base - 15, 1, 15, '#6f6c74');
    rect(c, k - 2, base - 15, 5, 1, '#8d8a92');
  }
}

/** A potted palm, the kind that stands at each column. */
function pottedPalm(c: Ctx, x: number, base: number): void {
  rect(c, x - 3, base - 9, 7, 9, '#7a4636');
  rect(c, x - 3, base - 9, 7, 1, '#9a5d49');
  for (const [dx, dy] of [[-5, -8], [-3, -11], [0, -13], [3, -11], [5, -8]] as [number, number][]) {
    rect(c, x + dx, base - 9 + dy, 2, -dy, P.leafDark);
    px(c, x + dx, base - 9 + dy, P.leafLit);
  }
}

/** The university seal and the building's name in metal letters, on the louvres of the left tower. */
function nameplate(c: Ctx, cx: number, base: number): void {
  const cy = base - 73;
  disc(c, cx, cy, 10, '#b7b2a6');
  disc(c, cx, cy, 9, '#f4f1e8');
  disc(c, cx, cy, 7, P.maroon);
  disc(c, cx, cy, 6, '#f4f1e8');
  // the shield, the angel on it and the little gold shield the angel holds
  rect(c, cx - 3, cy - 4, 7, 6, P.maroon);
  rect(c, cx - 2, cy + 2, 5, 1, P.maroon);
  rect(c, cx - 1, cy + 3, 3, 1, P.maroon);
  rect(c, cx, cy - 3, 1, 5, '#ffffff');
  rect(c, cx - 2, cy - 2, 5, 1, '#ffffff');
  px(c, cx, cy, P.gold);
  ['GEROMIN G.', 'NEPOMUCENO', 'BUILDING'].forEach((text, i) => {
    const y = base - 59 + i * 8;
    signCentered(c, text, cx, y + 1, '#2c2428');
    signCentered(c, text, cx, y, '#d5d8de');
  });
}

/** The campus map board on its concrete plinth. */
function mapBoard(c: Ctx, x: number, base: number): void {
  const w = signWidth('CAMPUS MAP') + 8;
  rect(c, x, base - 13, w, 13, '#cfcbc0');
  rect(c, x, base - 13, w, 1, '#e6e3da');
  rect(c, x + w - 2, base - 13, 2, 13, '#a9a59a');
  rect(c, x, base - 38, w, 25, '#dfe3e8');
  rect(c, x, base - 38, w, 1, '#f6f8fa');
  rect(c, x + w - 1, base - 38, 1, 25, '#aeb3ba');
  sign(c, 'CAMPUS MAP', x + 4, base - 35, P.maroon);
  // the list of buildings down the left, the drawing of the campus on the right
  for (let i = 0; i < 4; i++) rect(c, x + 3, base - 27 + i * 3, 9 + ((i * 5) % 4), 1, '#8d9199');
  rect(c, x + 17, base - 26, 24, 10, '#c9ced4');
  rect(c, x + 20, base - 24, 6, 4, '#f4f1e8');
  rect(c, x + 28, base - 25, 5, 6, '#8fa0b6');
  rect(c, x + 34, base - 22, 5, 4, '#f4f1e8');
  rect(c, x + 26, base - 19, 6, 2, '#7fae6a');
  px(c, x + 23, base - 20, RED);
}

/** The far end of the building on its own, for the scene that only catches its corner. */
export function ggnCorner(c: Ctx, x: number, w: number, base: number): void {
  tower(c, x, w, base - LOBBY - STOREYS * FLOOR_H, base, 1);
}

export interface Ggn {
  /** scene x of the way in: the middle of the left-hand steps */
  door: number;
  /** scene x of the left and right edges of the lobby, columns and all */
  lobby: [number, number];
  /** scene x of the middle of the campus map board */
  board: number;
}

/**
 * Draws the front of the building with its left edge at `x`, `w` wide,
 * standing on `base`. It is taller than the canvas, so the top is cut off.
 * Lit windows go on `g` for the night glow.
 */
export function drawGGN(c: Ctx, g: Ctx, x: number, w: number, base: number): Ggn {
  const rand = rng(1054);
  const top = base - LOBBY - STOREYS * FLOOR_H;

  const cornerW = 16;
  const towerW = Math.round(w * 0.13);
  const leftW = Math.round(w * 0.2);
  const bayW = Math.round(w * 0.415);
  const stripW = 16;
  const endW = Math.round(w * 0.1);
  const towerX = x + cornerW;
  const leftX = towerX + towerW;
  const bayX = leftX + leftW;
  const rightX = bayX + bayW;
  const rightW = x + w - endW - stripW - rightX;
  const stripX = rightX + rightW;
  const endX = stripX + stripW;

  // the glass corner, with a low screen of louvres in front of it
  rect(c, x, Math.max(top, -2), cornerW, base - Math.max(top, -2), GLASS_DK);
  for (let y = base - 8; y > -2; y -= 11) rect(c, x, y, cornerW, 1, GLASS);
  rect(c, x + 7, -2, 1, base + 2, GLASS);
  rect(c, x, -2, 1, base + 2, GLASS_HI);
  louvres(c, x - 6, base - 58, base, cornerW + 6);

  tower(c, towerX, towerW, top, base, 0);
  nameplate(c, towerX + Math.round(towerW / 2), base);

  // the patchwork either side, each over a blank wall
  patchwork(c, g, leftX, leftW, top, base - PODIUM, rand);
  patchwork(c, g, rightX, rightW, top, base - PODIUM, rand);
  for (const [px0, pw] of [[leftX, leftW], [rightX, rightW]] as [number, number][]) {
    rect(c, px0, base - PODIUM + 1, pw, PODIUM - 1, CREAM);
    rect(c, px0, base - PODIUM + 1, pw, 1, CREAM_HI);
    for (let k = px0 + 24; k < px0 + pw - 4; k += 24) rect(c, k, base - PODIUM + 2, 1, PODIUM - 2, shade(CREAM, -0.07));
    rect(c, px0, base - 3, pw, 3, CREAM_LO);
  }
  airCon(c, leftX + leftW - 26, base - 10);
  // the plant room on the right: grey louvred doors, and the vents above them
  for (let k = 0; k < 2; k++) {
    const dx = rightX + 5 + k * 15;
    if (dx + 13 > rightX + rightW) break;
    rect(c, dx, base - 27, 13, 27, '#8d99a8');
    for (let y = base - 25; y < base - 1; y += 2) rect(c, dx + 1, y, 11, 1, '#6f7b8a');
    rect(c, dx + 6, base - 27, 1, 27, '#5d6876');
  }
  rect(c, rightX + 6, base - 36, 8, 4, '#a9a59a');
  rect(c, rightX + 18, base - 37, 9, 5, '#a9a59a');

  // the strip of grey glass between the patchwork and the far tower
  rect(c, stripX, Math.max(top, -2), stripW, base - Math.max(top, -2), '#7f8792');
  for (let y = base - 30; y > -2; y -= 11) {
    rect(c, stripX + 2, y - 8, stripW - 4, 8, '#56606f');
    rect(c, stripX + 2, y - 8, stripW - 4, 1, '#98a2b0');
  }
  rect(c, stripX, base - 22, stripW, 22, CREAM);

  tower(c, endX, endW, top, base, 1);
  rect(c, endX + Math.round(endW / 2) - 5, base - 26, 10, 26, '#5a5f6a');
  rect(c, endX + Math.round(endW / 2) - 5, base - 26, 10, 1, '#7d838f');

  slabs(c, g, bayX, bayW, top, base - LOBBY, rand);

  // the lobby: three columns, two ways in
  const openW = Math.round((bayW - COLUMN * 3) / 2);
  const leftOpen = bayX + COLUMN;
  const midCol = leftOpen + openW;
  const rightOpen = midCol + COLUMN;
  const lastCol = rightOpen + openW;
  opening(c, g, leftOpen, openW, base, 'left');
  opening(c, g, rightOpen, lastCol - rightOpen, base, 'right');
  for (const k of [bayX, midCol, lastCol]) {
    const cw = k === lastCol ? bayX + bayW - lastCol : COLUMN;
    rect(c, k, base - LOBBY + CANOPY_H, cw, LOBBY - CANOPY_H, CREAM);
    rect(c, k, base - LOBBY + CANOPY_H, 2, LOBBY - CANOPY_H, CREAM_HI);
    rect(c, k + cw - 3, base - LOBBY + CANOPY_H, 3, LOBBY - CANOPY_H, CREAM_LO);
    rect(c, k - 1, base - 3, cw + 2, 3, CREAM_LO);
  }
  rect(c, midCol + 5, base - 34, 4, 5, '#5d5866');
  pottedPalm(c, midCol + Math.round(COLUMN / 2), base);
  pottedPalm(c, bayX + Math.round(COLUMN / 2), base);

  // the canopy, deep enough to throw the whole lobby into shade
  const cx0 = bayX - 12;
  const cw0 = bayW + 24;
  const cy = base - LOBBY;
  rect(c, cx0, cy, cw0, CANOPY_H, '#efe9da');
  rect(c, cx0, cy, cw0, 1, CREAM_HI);
  rect(c, cx0, cy + 6, cw0, 1, '#d8d1bf');
  for (let k = cx0 + 16; k < cx0 + cw0 - 4; k += 16) rect(c, k, cy + 1, 1, CANOPY_H - 3, '#d8d1bf');
  rect(c, cx0, cy + CANOPY_H - 2, cw0, 2, '#b9b2a0');
  // the glass let into it shows from below as two pale strips
  rect(c, cx0 + Math.round(cw0 * 0.27), cy + CANOPY_H - 2, Math.round(cw0 * 0.2), 2, '#bcd3dc');
  rect(c, cx0 + Math.round(cw0 * 0.56), cy + CANOPY_H - 2, Math.round(cw0 * 0.2), 2, '#bcd3dc');
  rect(c, cx0 + 3, cy + CANOPY_H, cw0 - 6, 3, 'rgba(24,18,30,0.4)');

  const boardW = signWidth('CAMPUS MAP') + 8;
  // it stands just past the name, in front of the blank wall
  const boardX = leftX - 6;
  mapBoard(c, boardX, base);

  return {
    door: leftOpen + Math.round(openW / 2),
    lobby: [bayX, bayX + bayW],
    board: boardX + Math.round(boardW / 2),
  };
}

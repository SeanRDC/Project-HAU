// The campus from above, as pixel art, for the campus map and the minimap.
// Painted once per zoom level from campus/plan.ts and the OpenStreetMap data
// in campus/osm.ts, so moving a building there moves it here too. The
// walkway runs left to right, like on the C map.
//
// Looked at from slightly south (the +v side), so every building shows a roof
// and a strip of front wall with windows, the way the official campus map
// shows them. Buildings are painted pixel by pixel from their real outlines.
//
// The roofs are the colours of the aerial photo
// (assets/other references/Aerial shot of HAU enclosed in red line.png), with
// its solar panels and tiles, so the map can be checked against it.
//
// Map data (c) OpenStreetMap contributors, ODbL 1.0.

import { Ctx, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, ellipse, line, rect, sign, signWidth } from '../../engine/pix';
import { CAMPUS, NEIGHBOURS, Pt, ROADS } from '../campus/osm';
import { BUILDINGS, Building, BuildingId, PLACES, Px, Spot, spot } from '../campus/plan';
import { STREETS } from '../campus/streets';
import { P, shade } from './palette';

const ALL = Object.entries(BUILDINGS) as [BuildingId, Building][];

/** Roof colours, picked off the aerial photo. Anything not listed is a white roof. */
const ROOF: Partial<Record<BuildingId, string>> = {
  corazon: '#5f626c',
  martha: '#9d6257',
  sfj: '#cfdcc0',
  stl: '#e2dabb',
  warehouse: '#dcd6b2',
  foodcourt: '#98a279',
  sgh: '#e9e2b6',
  srh: '#e9e2b6',
  smh: '#ddd5ae',
  ggn: '#bcb5a6',
  pgn: '#dfe2e4',
  djdn: '#e3dcb8',
  aps: '#e2dcae',
  mgn: '#e6e0bc',
  chapel: P.marbleHi,
  formation: '#dddcd6',
  sjh: '#e3d9b6',
  sh: '#e1dba2',
  court: '#eceae6',
  gym: '#e1e3e5',
  annex: '#cfc7a4',
};
const WHITE_ROOF = '#e9e5dc';
/** The roof of each extra wing in plan.ts, in the order they are listed there. */
const WING_ROOF: Partial<Record<BuildingId, string[]>> = {
  sh: ['#615f69'],
};
/** Walls that are not just a darker roof: the Red Building is red under its dark roof. */
const WALL: Partial<Record<BuildingId, string>> = {
  corazon: '#b8473d',
  ggn: '#9c4a48',
  pgn: '#7f8ea6',
};

const SOLAR = '#3d4557';
const TILE = '#d98a72';
const CONCRETE = '#94938d';

/** A flat patch on a roof: solar panels, tiles, a lower roof. `grid` dots it like a field of panels. */
interface Patch {
  pts: Spot[];
  colour: string;
  grid?: boolean;
}
/** A patch read off the aerial photo, one pixel per corner. */
const seen = (colour: string, grid: boolean, ...px: Px[]): Patch => ({ pts: px.map(spot), colour, grid });
/** A patch given in plan metres: u from..to, v from..to. */
const laid = (colour: string, grid: boolean, u0: number, u1: number, v0: number, v1: number): Patch => ({
  pts: [{ u: u0, v: v0 }, { u: u1, v: v0 }, { u: u1, v: v1 }, { u: u0, v: v1 }],
  colour,
  grid,
});

/**
 * What the aerial photo shows on each roof. The tall buildings lean in the
 * photo, so theirs are given in plan metres on the footprint instead of in
 * the photo's pixels.
 */
const PATCHES: Partial<Record<BuildingId, Patch[]>> = {
  foodcourt: [
    // the blue-grey roof at its south end
    seen('#8d97ad', false, [385, 303.8], [396.3, 299.5], [411.3, 323.8], [398, 333.8]),
  ],
  ggn: [
    // the tiled roofs along the St. Michael Hall side
    seen(TILE, false, [482.5, 118.8], [507.5, 102.5], [512.5, 83.8], [542.5, 70], [560, 71.3], [586.3, 48], [588.8, 60], [567.5, 90], [538.8, 103.8], [510, 130], [487.5, 150], [480, 145]),
    // the maroon fins down the street side
    seen('#9c3f45', false, [586.3, 48], [665.5, 152], [653, 183], [625, 145], [607.5, 92.5]),
    seen(SOLAR, true, [491.3, 163.8], [532.5, 140], [540, 153.8], [501.3, 178.8]),
    seen(SOLAR, true, [580, 137.5], [602.5, 125], [612.5, 145], [590, 160]),
    seen(SOLAR, true, [545, 217.5], [580, 198.8], [586.3, 212.5], [552.5, 233.8]),
  ],
  pgn: [
    // the podium is bare concrete; the tower roof is white under its panels
    laid(CONCRETE, false, -134.9, -91.5, -37, -7.6),
    laid(SOLAR, true, -88.5, -72, -72, -36),
  ],
  djdn: [
    // the roof over the courtyard
    seen('#5b5d66', false, [618.3, 513.3], [683.3, 485], [713.3, 530], [646.7, 567]),
  ],
  court: [
    // the lower roof on the gym side
    laid('#cfcfcd', false, 43.7, 100.7, -17, -1.8),
  ],
  gym: [
    seen(SOLAR, true, [973, 250], [1007, 231], [1073, 342], [1040, 360]),
    seen(SOLAR, false, [1012, 220], [1032, 210], [1100, 326], [1082, 340]),
  ],
};

const CITY = '#a9a796';
const CITY_ROOF = '#b9b5a6';
const ASPHALT = '#77737a';
const PAVING = '#efe7d2';

// how much of the map to cover, in metres: the campus and the streets round it
const us: number[] = [];
const vs: number[] = [];
for (const [, b] of ALL) {
  for (const k of b.blocks) {
    us.push(k.at.u - k.along / 2, k.at.u + k.along / 2);
    vs.push(k.at.v - k.across / 2, k.at.v + k.across / 2);
  }
  for (const p of shapesOf(b).flat()) {
    us.push(p.u);
    vs.push(p.v);
  }
}
for (const p of Object.values(PLACES)) {
  us.push(p.u);
  vs.push(p.v);
}
const MARGIN = 16;
export const BOUNDS = {
  u0: Math.min(...us) - MARGIN,
  v0: Math.min(...vs) - MARGIN,
  u1: Math.max(...us) + MARGIN,
  v1: Math.max(...vs) + MARGIN,
};

export interface CampusPicture {
  canvas: HTMLCanvasElement;
  /** pixels per metre */
  scale: number;
  /** where a spot on the plan lands on the canvas */
  at(s: Spot): [number, number];
}

type At = CampusPicture['at'];

/** Paint the whole campus at `scale` pixels per metre. */
export function paintCampus(scale: number): CampusPicture {
  const w = Math.ceil((BOUNDS.u1 - BOUNDS.u0) * scale);
  const h = Math.ceil((BOUNDS.v1 - BOUNDS.v0) * scale);
  const [canvas, ctx] = makeCanvas(w, h);
  const at = (s: Spot): [number, number] => [(s.u - BOUNDS.u0) * scale, (s.v - BOUNDS.v0) * scale];
  const pt = (p: Pt) => at({ u: p[0], v: p[1] });
  const m = (metres: number) => Math.max(1, Math.round(metres * scale));
  const rand = rng(1933);

  // the town round the campus, then the campus grounds on top
  rect(ctx, 0, 0, w, h, CITY);
  // OSM still lists a few campus roofs as plain buildings; anything under one of ours is left out
  const ours = ALL.flatMap(([, b]) => shapesOf(b)).map((s) => s.map((p): [number, number] => [p.u, p.v]));
  const town = NEIGHBOURS.filter((r) => {
    const cu = r.reduce((a, p) => a + p[0], 0) / r.length;
    const cv = r.reduce((a, p) => a + p[1], 0) / r.length;
    return !ours.some((o) => inside(o, cu, cv));
  });
  for (const r of town) solid(ctx, r.map(pt), CITY_ROOF, Math.min(2, m(3)), false, true);
  for (const r of CAMPUS) ground(ctx, r.map(pt), rand);
  lawns(ctx, at, m);
  roads(ctx, at, pt, m);
  water(ctx, at, m);

  const shapes = ALL.flatMap(([id, b]) => {
    const all = shapesOf(b);
    // the wings come after the building's own shapes, and bring their own roofs
    const own = all.length - (b.wings?.length ?? 0);
    return all.map((s, i) => ({
      id,
      b,
      pts: s.map((p) => at(p)),
      wing: i >= own,
      roof: (i >= own ? WING_ROOF[id]?.[i - own] : undefined) ?? ROOF[id] ?? WHITE_ROOF,
    }));
  });
  trees(ctx, at, m, rand, shapes.map((s) => s.pts), CAMPUS.map((r) => r.map(pt)));
  // further back first, so nearer buildings overlap the ones behind them
  shapes.sort((a, b) => Math.max(...a.pts.map((p) => p[1])) - Math.max(...b.pts.map((p) => p[1])));
  for (const { id, b, pts, roof, wing } of shapes) {
    const wall = id === 'chapel' || id === 'formation' ? Math.max(1, m(2)) : Math.max(2, m(5));
    solid(ctx, pts, roof, wall, !b.sure, false, WALL[id]);
    if (!wing) for (const p of PATCHES[id] ?? []) patch(ctx, p, pts, at, wall);
    if (id === 'chapel') cross(ctx, at(b.label ?? PLACES.chapel));
  }
  for (const [id, b] of ALL) badge(ctx, b, id, at);
  return { canvas, scale, at };
}

/** A building's footprint: its outline if it has one, otherwise each block as a rectangle. Then any wings. */
function shapesOf(b: Building): Spot[][] {
  const own = b.outline
    ? [b.outline]
    : b.blocks.map((k) => {
        const [u0, u1, v0, v1] = [k.at.u - k.along / 2, k.at.u + k.along / 2, k.at.v - k.across / 2, k.at.v + k.across / 2];
        return [{ u: u0, v: v0 }, { u: u1, v: v0 }, { u: u1, v: v1 }, { u: u0, v: v1 }];
      });
  return [...own, ...(b.wings ?? [])];
}

/** Even-odd point in polygon. */
function inside(pts: [number, number][], x: number, y: number): boolean {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/**
 * One building, pixel by pixel: a soft shadow, the front wall dropped below
 * the roof with rows of windows, then the roof with a lit top edge and a dark
 * right edge. `guess` dots the outline in maroon. `plain` leaves the windows
 * off, for the town round the campus. `walls` is the wall colour when it is not
 * just a darker roof.
 */
function solid(ctx: Ctx, pts: [number, number][], roof: string, wall: number, guess: boolean, plain = false, walls?: string): void {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.floor(Math.min(...xs)) - 1;
  const x1 = Math.ceil(Math.max(...xs)) + 2;
  const y0 = Math.floor(Math.min(...ys)) - 1;
  const y1 = Math.ceil(Math.max(...ys)) + wall + 3;
  // the roof sits `wall` pixels up from the footprint, so the wall shows below it
  const isRoof = (x: number, y: number) => inside(pts, x + 0.5, y + 0.5 + wall);
  const isBase = (x: number, y: number) => inside(pts, x + 0.5, y + 0.5);
  const front = walls ?? shade(roof === WHITE_ROOF ? P.trim : roof, -0.28);
  const hi = shade(roof, 0.35);
  const left = shade(roof, 0.12);
  const right = shade(roof, -0.2);
  for (let y = y0 - wall; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (isRoof(x, y)) {
        let c = roof;
        if (!isRoof(x, y - 1)) c = hi;
        else if (!isRoof(x + 1, y)) c = right;
        else if (!isRoof(x - 1, y)) c = left;
        if (guess && (x + y) % 2 === 0 && (!isRoof(x, y - 1) || !isRoof(x + 1, y) || !isRoof(x - 1, y) || !isRoof(x, y + 1))) c = P.maroon;
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      } else if (isBase(x, y)) {
        // the front wall: windows on every other pixel, a dark line at the foot
        const foot = !isBase(x, y + 1);
        let c = foot ? shade(front, -0.3) : front;
        if (!plain && !foot && x % 2 === 1 && y % 2 === 0 && isBase(x - 1, y) && isBase(x + 1, y)) c = P.glass;
        ctx.fillStyle = c;
        ctx.fillRect(x, y, 1, 1);
      } else if (isBase(x - 1, y - 2)) {
        ctx.fillStyle = 'rgba(30,24,40,0.28)';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

/** Paving inside the campus boundary, with a little speckle so it does not read as flat colour. */
function ground(ctx: Ctx, ring: [number, number][], rand: () => number): void {
  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      if (!inside(ring, x + 0.5, y + 0.5)) continue;
      const r = rand();
      ctx.fillStyle = r < 0.06 ? '#c1b9a3' : r < 0.12 ? '#d4ccb8' : '#cbc3ae';
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // a maroon fence line round the edge
  for (let i = 0; i < ring.length; i++) {
    const [ax, ay] = ring[i];
    const [bx, by] = ring[(i + 1) % ring.length];
    line(ctx, ax, ay, bx, by, shade(P.maroon, -0.1));
  }
}

/** The chapel lawn inside its loop road, the strips along the Epiphany, the beds in front of the Main Building. */
function lawns(ctx: Ctx, at: At, m: (x: number) => number): void {
  const [cx, cy] = at({ u: -8, v: 2 });
  ellipse(ctx, cx, cy, m(54), m(52), P.grassDark);
  ellipse(ctx, cx, cy, m(52), m(50), P.grass);
  ctx.globalAlpha = 0.5;
  ellipse(ctx, cx - m(8), cy - m(8), m(30), m(24), P.grassHi);
  ctx.globalAlpha = 1;
  // the Epiphany of Angels: grass both sides of the paved road
  const [gx, gy] = at(PLACES.mainGate);
  const [ex, ey] = at(PLACES.epiphanyEnd);
  line(ctx, gx, gy, ex, ey, P.grass, m(14));
  // the beds along the front of the Main Building
  const [rx, ry] = at(PLACES.rotunda);
  const [bx, by] = at(PLACES.barachielGate);
  line(ctx, rx, ry + m(10), bx, by - m(4), P.grass, m(6));
}

/** The streets round the campus, the paths through it, and every street you can walk in the game. */
function roads(ctx: Ctx, at: At, pt: (p: Pt) => [number, number], m: (x: number) => number): void {
  const draw = (pts: [number, number][], colour: string, width: number) => {
    for (let i = 0; i + 1 < pts.length; i++) line(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], colour, width);
  };
  const streets = ROADS.filter((r) => r.kind === 'street').map((r) => r.pts.map(pt));
  // only the paths that come on to the campus: driveways out in the town are not on the aerial photo as roads
  const paths = ROADS.filter((r) => r.kind === 'path' && r.pts.some((p) => CAMPUS.some((c) => inside(c, p[0], p[1])))).map((r) => r.pts.map(pt));
  const game = [
    ...Object.values(STREETS).map((s) => s.path),
    [PLACES.rotunda, PLACES.barachielGate],
    [PLACES.mainGate, PLACES.fountainPlaza, PLACES.rotunda],
  ].map((path) => path.map(at));
  // town streets: asphalt with a pale centre line
  for (const s of streets) draw(s, shade(ASPHALT, -0.15), m(9) + 2);
  for (const s of streets) draw(s, ASPHALT, m(9));
  if (m(9) >= 5) for (const s of streets) draw(s, '#9a969c', 1);
  // campus paths and the game's streets: light paving with a darker kerb
  const pw = Math.max(2, m(5));
  for (const s of [...paths, ...game]) draw(s, '#b3a98f', pw + 2);
  for (const s of [...paths, ...game]) draw(s, PAVING, pw);
  // the gates: two maroon posts each
  for (const g of [PLACES.mainGate, PLACES.barachielGate]) {
    const [x, y] = at(g);
    rect(ctx, x - m(5), y - 1, 2, 3, P.maroon);
    rect(ctx, x + m(5) - 1, y - 1, 2, 3, P.maroon);
  }
}

/** The two fountains and the seal in the pavers. */
function water(ctx: Ctx, at: At, m: (x: number) => number): void {
  for (const p of [PLACES.fountainPlaza, PLACES.rotunda]) {
    const [x, y] = at(p);
    disc(ctx, x, y, m(6) + 1, P.stone);
    disc(ctx, x, y, m(6), P.water);
    rect(ctx, x - 1, y - 1, 1, 1, P.waterHi);
    rect(ctx, x, y, 1, 1, P.marbleHi);
  }
  const [sx, sy] = at(PLACES.seal);
  disc(ctx, sx, sy, Math.max(1, m(3)), P.gold);
  rect(ctx, sx, sy, 1, 1, P.maroon);
}

/** Round treetops on the campus grass, never on a building. */
function trees(
  ctx: Ctx,
  at: At,
  m: (x: number) => number,
  rand: () => number,
  buildings: [number, number][][],
  campus: [number, number][][],
): void {
  const r = Math.max(1, m(3));
  const pad = r + 2;
  const free = (x: number, y: number) =>
    campus.some((c) => inside(c, x, y)) &&
    !buildings.some((b) => [[0, 0], [pad, 0], [-pad, 0], [0, pad], [0, -pad - 4]].some(([dx, dy]) => inside(b, x + dx, y + dy)));
  const tree = (x: number, y: number) => {
    if (!free(x, y)) return;
    disc(ctx, x + 1, y + 1, r, 'rgba(26,40,30,0.35)');
    disc(ctx, x, y, r, P.leafDark);
    if (r > 1) disc(ctx, x - 1, y - 1, r - 1, P.leaf);
    rect(ctx, x - 1, y - 1, 1, 1, P.leafHi);
  };
  // a ring just inside the chapel loop road
  const [cx, cy] = at({ u: -8, v: 2 });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + rand() * 0.1;
    tree(Math.round(cx + Math.cos(a) * m(46)), Math.round(cy + Math.sin(a) * m(44)));
  }
  // rows down both sides of the Epiphany
  const [gx, gy] = at(PLACES.mainGate);
  const [ex, ey] = at(PLACES.epiphanyEnd);
  const len = Math.hypot(ex - gx, ey - gy);
  const nx = -(ey - gy) / len;
  const ny = (ex - gx) / len;
  for (let t = 0.08; t < 1; t += 0.16) {
    for (const side of [-1, 1]) {
      tree(Math.round(gx + (ex - gx) * t + nx * m(6) * side), Math.round(gy + (ey - gy) * t + ny * m(6) * side));
    }
  }
  // a few scattered about the rest of the grounds
  for (let i = 0; i < 60; i++) tree(Math.round(rand() * ctx.canvas.width), Math.round(rand() * ctx.canvas.height));
}

/**
 * One patch on a roof, lifted by the wall height like the roof it sits on and
 * kept inside it, with a one pixel rim of roof left showing round the edge.
 */
function patch(ctx: Ctx, p: Patch, roofPts: [number, number][], at: At, wall: number): void {
  const pts = p.pts.map((s) => at(s));
  const xs = pts.map((q) => q[0]);
  const ys = pts.map((q) => q[1]);
  const onRoof = (x: number, y: number) => inside(roofPts, x + 0.5, y + 0.5 + wall);
  const lit = shade(p.colour, 0.22);
  for (let y = Math.floor(Math.min(...ys)) - wall; y <= Math.ceil(Math.max(...ys)) - wall; y++) {
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      if (!inside(pts, x + 0.5, y + 0.5 + wall)) continue;
      if (!onRoof(x, y) || !onRoof(x - 1, y) || !onRoof(x + 1, y) || !onRoof(x, y - 1) || !onRoof(x, y + 1)) continue;
      ctx.fillStyle = p.grid && x % 2 === 0 && y % 2 === 0 ? lit : p.colour;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

/** The gold cross on the chapel roof. */
function cross(ctx: Ctx, [x, y]: [number, number]): void {
  rect(ctx, x, y - 6, 1, 5, P.gold);
  rect(ctx, x - 1, y - 5, 3, 1, P.gold);
}

/** The number each building has on the official campus map, in a maroon tag like the real one. */
function badge(ctx: Ctx, b: Building, id: BuildingId, at: At): void {
  if (b.no === undefined) return;
  const [cx, cy] = at(b.label ?? b.blocks[0].at);
  const text = String(b.no);
  const w = signWidth(text) + 4;
  const x = Math.round(cx - w / 2);
  const y = Math.round(cy - 6 - (id === 'chapel' ? -4 : 0));
  rect(ctx, x + 1, y + 1, w, 9, 'rgba(20,10,30,0.4)');
  rect(ctx, x, y, w, 9, '#f4e9c8');
  rect(ctx, x + 1, y + 1, w - 2, 7, P.maroon);
  sign(ctx, text, x + 2, y + 2, '#f8eed2');
}

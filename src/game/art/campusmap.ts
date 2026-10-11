// The campus from above, as pixel art, for the campus map and the minimap.
// Painted once per zoom level from campus/plan.ts, so moving a building there
// moves it here too. The walkway runs left to right, like on the C map.
//
// Looked at from slightly south (the +v side), so every building shows a roof
// and a strip of front wall with windows, the way the official campus map
// shows them.

import { Ctx, makeCanvas } from '../../engine/display';
import { rng } from '../../engine/math';
import { disc, ellipse, line, rect, sign, signWidth } from '../../engine/pix';
import { BUILDINGS, Block, Building, BuildingId, PLACES, Spot } from '../campus/plan';
import { STREETS } from '../campus/streets';
import { P, shade } from './palette';

const ALL = Object.entries(BUILDINGS) as [BuildingId, Building][];

/** Roof colours, picked off the official campus map. Anything not listed is a white roof. */
const ROOF: Partial<Record<BuildingId, string>> = {
  corazon: '#b8473d',
  foodcourt: '#e8bf45',
  pgn: '#45475a',
  djdn: P.wall,
  ggn: '#e6d6b4',
  court: '#8e9db2',
  gym: '#c3c6cc',
  annex: '#5d6070',
  warehouse: '#a8a196',
  sh: '#dfe3e6',
};
const WHITE_ROOF = '#e9e5dc';

// how much of the campus the map covers, in metres, with a margin all round
const us: number[] = [];
const vs: number[] = [];
for (const [, b] of ALL) {
  for (const k of b.blocks) {
    us.push(k.at.u - k.along / 2, k.at.u + k.along / 2);
    vs.push(k.at.v - k.across / 2, k.at.v + k.across / 2);
  }
}
for (const p of Object.values(PLACES)) {
  us.push(p.u);
  vs.push(p.v);
}
const MARGIN = 10;
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

/** Paint the whole campus at `scale` pixels per metre. */
export function paintCampus(scale: number): CampusPicture {
  const w = Math.ceil((BOUNDS.u1 - BOUNDS.u0) * scale);
  const h = Math.ceil((BOUNDS.v1 - BOUNDS.v0) * scale);
  const [canvas, ctx] = makeCanvas(w, h);
  const at = (s: Spot): [number, number] => [(s.u - BOUNDS.u0) * scale, (s.v - BOUNDS.v0) * scale];
  const m = (metres: number) => Math.max(1, Math.round(metres * scale));
  const rand = rng(1933);

  ground(ctx, w, h, rand);
  lawns(ctx, at, m);
  roads(ctx, at, m);
  water(ctx, at, m);
  const solid = ALL.flatMap(([, b]) => b.blocks.map((k) => box(k, at)));
  trees(ctx, at, m, rand, solid);
  // further back first, so nearer buildings overlap the ones behind them
  const order = ALL.flatMap(([id, b]) => b.blocks.map((k) => ({ id, b, k }))).sort((a, b) => a.k.at.v - b.k.at.v);
  for (const { id, b, k } of order) building(ctx, id, b, k, at, m);
  for (const [id, b] of ALL) badge(ctx, b, id, at);
  return { canvas, scale, at };
}

/** A block's footprint on the canvas: [x, y, w, h], whole pixels. */
function box(k: Block, at: CampusPicture['at']): [number, number, number, number] {
  const [cx, cy] = at(k.at);
  const s = at({ u: BOUNDS.u0 + 1, v: BOUNDS.v0 })[0]; // pixels per metre
  const w = Math.max(3, Math.round(k.along * s));
  const h = Math.max(3, Math.round(k.across * s));
  return [Math.round(cx - w / 2), Math.round(cy - h / 2), w, h];
}

/** Paving everywhere, with a little speckle so it does not read as flat colour. */
function ground(ctx: Ctx, w: number, h: number, rand: () => number): void {
  rect(ctx, 0, 0, w, h, '#cbc3ae');
  for (let i = 0; i < (w * h) / 14; i++) {
    const c = rand() < 0.5 ? '#c1b9a3' : '#d4ccb8';
    rect(ctx, rand() * w, rand() * h, 1, 1, c);
  }
}

/** The chapel lawn, the strips along the Epiphany and the beds in front of the Main Building. */
function lawns(ctx: Ctx, at: CampusPicture['at'], m: (x: number) => number): void {
  const [cx, cy] = at(PLACES.chapel);
  ellipse(ctx, cx, cy, m(78), m(62), P.grassDark);
  ellipse(ctx, cx, cy, m(76), m(60), P.grass);
  // the Epiphany of Angels: grass both sides of the paved road
  const [gx, gy] = at(PLACES.mainGate);
  const [ex, ey] = at(PLACES.epiphanyEnd);
  line(ctx, gx, gy, ex, ey, P.grass, m(16));
  // the beds along the front of the Main Building
  const [rx, ry] = at(PLACES.rotunda);
  const [bx, by] = at(PLACES.barachielGate);
  line(ctx, rx, ry + m(10), bx, by - m(4), P.grass, m(8));
  // dither the grass edge lighter so it catches the light like the scenes do
  ctx.globalAlpha = 0.5;
  ellipse(ctx, cx - m(8), cy - m(8), m(40), m(28), P.grassHi);
  ctx.globalAlpha = 1;
}

/** Every walkable street, plus the bits of road the scenes walk past. */
function roads(ctx: Ctx, at: CampusPicture['at'], m: (x: number) => number): void {
  const paths: Spot[][] = [
    ...Object.values(STREETS).map((s) => s.path),
    [PLACES.rotunda, PLACES.barachielGate],
    [PLACES.mainGate, PLACES.fountainPlaza, PLACES.rotunda],
  ];
  const wide = m(7);
  for (const [colour, width] of [['#b3a98f', wide + 2], ['#efe7d2', wide]] as const) {
    for (const path of paths) {
      for (let i = 0; i + 1 < path.length; i++) {
        const [x0, y0] = at(path[i]);
        const [x1, y1] = at(path[i + 1]);
        line(ctx, x0, y0, x1, y1, colour, width);
      }
    }
  }
  // the gates: two maroon posts each
  for (const g of [PLACES.mainGate, PLACES.barachielGate]) {
    const [x, y] = at(g);
    rect(ctx, x - m(5), y - 1, 2, 3, P.maroon);
    rect(ctx, x + m(5) - 1, y - 1, 2, 3, P.maroon);
  }
}

/** The two fountains and the seal in the pavers. */
function water(ctx: Ctx, at: CampusPicture['at'], m: (x: number) => number): void {
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

/** Round treetops on the grass, never on a building or the road. */
function trees(
  ctx: Ctx,
  at: CampusPicture['at'],
  m: (x: number) => number,
  rand: () => number,
  solid: [number, number, number, number][],
): void {
  const r = Math.max(1, m(3));
  const free = (x: number, y: number) =>
    !solid.some(([bx, by, bw, bh]) => x > bx - r - 1 && x < bx + bw + r + 1 && y > by - r - 1 && y < by + bh + r + 2);
  const tree = (x: number, y: number) => {
    if (!free(x, y)) return;
    disc(ctx, x + 1, y + 1, r, 'rgba(26,40,30,0.35)');
    disc(ctx, x, y, r, P.leafDark);
    if (r > 1) disc(ctx, x - 1, y - 1, r - 1, P.leaf);
    rect(ctx, x - 1, y - 1, 1, 1, P.leafHi);
  };
  // a ring round the chapel lawn
  const [cx, cy] = at(PLACES.chapel);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rand() * 0.1;
    tree(Math.round(cx + Math.cos(a) * m(70)), Math.round(cy + Math.sin(a) * m(55)));
  }
  // rows down both sides of the Epiphany
  const [gx, gy] = at(PLACES.mainGate);
  const [ex, ey] = at(PLACES.epiphanyEnd);
  const len = Math.hypot(ex - gx, ey - gy);
  const nx = -(ey - gy) / len;
  const ny = (ex - gx) / len;
  for (let t = 0.08; t < 1; t += 0.16) {
    for (const side of [-1, 1]) {
      tree(Math.round(gx + (ex - gx) * t + nx * m(7) * side), Math.round(gy + (ey - gy) * t + ny * m(7) * side));
    }
  }
  // a few scattered about the rest of the grounds
  for (let i = 0; i < 40; i++) {
    const x = Math.round(rand() * ctx.canvas.width);
    const y = Math.round(rand() * ctx.canvas.height);
    tree(x, y);
  }
}

/** One block: shadow, roof, then the front wall with rows of windows. */
function building(
  ctx: Ctx,
  id: BuildingId,
  b: Building,
  k: Block,
  at: CampusPicture['at'],
  m: (x: number) => number,
): void {
  const [x, y, w, h] = box(k, at);

  if (id === 'chapel') {
    const [cx, cy] = at(k.at);
    const r = Math.round(Math.min(w, h) / 2);
    disc(ctx, cx + 1, cy + 2, r, 'rgba(30,24,40,0.3)');
    disc(ctx, cx, cy, r, P.trimDeep);
    disc(ctx, cx, cy - 1, r, P.marbleHi);
    disc(ctx, cx, cy - 1, Math.max(1, Math.round(r * 0.55)), P.trimShade);
    disc(ctx, cx, cy - 1, Math.max(1, Math.round(r * 0.45)), P.marble);
    // the cross on top
    rect(ctx, cx, cy - 3, 1, 4, P.gold);
    rect(ctx, cx - 1, cy - 2, 3, 1, P.gold);
    return;
  }

  const roof = ROOF[id] ?? WHITE_ROOF;
  const wall = Math.min(Math.max(2, m(5)), Math.floor(h / 2));
  // soft shadow down and to the right
  ctx.globalAlpha = 0.28;
  rect(ctx, x + 1, y + 2, w, h, '#1e1830');
  ctx.globalAlpha = 1;
  // roof with a lit top edge and a dark rim
  rect(ctx, x, y, w, h - wall, roof);
  rect(ctx, x, y, w, 1, shade(roof, 0.35));
  rect(ctx, x, y, 1, h - wall, shade(roof, 0.15));
  rect(ctx, x + w - 1, y, 1, h - wall, shade(roof, -0.2));
  // the Main Building's courtyard skylight, a glass roof on the campus map
  if (id === 'djdn' && w > 8 && h > 8) {
    rect(ctx, x + Math.round(w * 0.3), y + Math.round(h * 0.2), Math.round(w * 0.4), Math.round(h * 0.35), '#8fb6cc');
    rect(ctx, x + Math.round(w * 0.3), y + Math.round(h * 0.2), Math.round(w * 0.4), 1, '#c3dde9');
  }
  // the gym and annex have rooftop vents in rows
  if ((id === 'gym' || id === 'court') && w > 6) {
    for (let yy = y + 2; yy < y + h - wall - 1; yy += 3) rect(ctx, x + 2, yy, w - 4, 1, shade(roof, -0.12));
  }
  // front wall with windows
  const front = shade(roof === WHITE_ROOF ? P.trim : roof, -0.28);
  rect(ctx, x, y + h - wall, w, wall, front);
  for (let wy = y + h - wall; wy < y + h - 1; wy += 2) {
    for (let wx = x + 1; wx < x + w - 1; wx += 2) rect(ctx, wx, wy, 1, 1, P.glass);
  }
  rect(ctx, x, y + h - 1, w, 1, shade(front, -0.3));

  // a position that is still a guess gets a dotted outline, like a pencil sketch
  if (!b.sure) {
    ctx.fillStyle = P.maroon;
    for (let i = 0; i < w; i += 2) {
      ctx.fillRect(x + i, y - 1, 1, 1);
      ctx.fillRect(x + i, y + h, 1, 1);
    }
    for (let i = 0; i < h; i += 2) {
      ctx.fillRect(x - 1, y + i, 1, 1);
      ctx.fillRect(x + w, y + i, 1, 1);
    }
  }
}

/** The number each building has on the official campus map, in a maroon tag like the real one. */
function badge(ctx: Ctx, b: Building, id: BuildingId, at: CampusPicture['at']): void {
  if (b.no === undefined) return;
  const [cx, cy] = at(b.blocks[0].at);
  const text = String(b.no);
  const w = signWidth(text) + 4;
  const x = Math.round(cx - w / 2);
  const y = Math.round(cy - 4 - (id === 'chapel' ? 0 : 1));
  rect(ctx, x + 1, y + 1, w, 9, 'rgba(20,10,30,0.4)');
  rect(ctx, x, y, w, 9, '#f4e9c8');
  rect(ctx, x + 1, y + 1, w - 2, 7, P.maroon);
  sign(ctx, text, x + 2, y + 2, '#f8eed2');
}

// The walkable streets of the campus. Each outdoor scene is one street: a
// line drawn on the plan. Where a building stands in a scene is worked out
// from where it falls along that line, so the scenes stay true to the plan.

import { Block, BUILDINGS, PLACES, Spot } from './plan';

/** Game pixels per metre. The DJN Building and the angel pedestals were already drawn at about this. */
export const PX_PER_M = 9;

export interface Street {
  /** the area id of the scene that draws it */
  id: string;
  /** points the street runs through, in the order you pass them walking left to right on screen */
  path: Spot[];
  /** the compass direction the camera looks: what you see is on that side of the street */
  looks: 'NE' | 'NW' | 'SE' | 'SW';
  /** extra scenery before the first point and after the last, in game pixels */
  lead: number;
  tail: number;
}

export const STREETS = {
  /** Epiphany of Angels: from the main gate to the fountain plaza */
  park: { id: 'park', path: [PLACES.mainGate, PLACES.fountainPlaza], looks: 'NW', lead: 60, tail: 190 },
  /** the walkway from the rotunda to the chapel lawn, along STL and PGN */
  walkway: { id: 'walkway', path: [PLACES.rotunda, PLACES.walkwayEnd], looks: 'NW', lead: 70, tail: 70 },
  /** the parking lane from the back road down to the rotunda, STL on the far side */
  lane: { id: 'lane', path: [PLACES.westJunction, PLACES.rotunda], looks: 'NE', lead: 60, tail: 70 },
  /** the back road past the food court and the three halls, up to the corner of GGN */
  halls: { id: 'halls', path: [PLACES.westJunction, PLACES.hallsCorner], looks: 'NW', lead: 300, tail: 60 },
  /** the same road carrying on along APS to Sacred Heart */
  aps: { id: 'aps', path: [PLACES.northJunction, PLACES.northEastJunction], looks: 'NW', lead: 60, tail: 260 },
  /** the road along the chapel lawn, in front of PGN */
  lawn: {
    id: 'lawn',
    path: [PLACES.northJunction, PLACES.walkwayEnd, PLACES.southJunction],
    looks: 'NE',
    lead: 60,
    tail: 60,
  },
  /** the road in front of St. Joseph Hall, from the gym back to the lawn */
  sjh: { id: 'sjh', path: [PLACES.gymCorner, PLACES.southJunction], looks: 'SE', lead: 70, tail: 200 },
  /** the lane behind the chapel, past the covered court and the gym */
  gym: { id: 'gym', path: [PLACES.northEastJunction, PLACES.gymCorner], looks: 'NE', lead: 80, tail: 420 },
} satisfies Record<string, Street>;

interface Seg {
  a: Spot;
  du: number;
  dv: number;
  len: number;
  /** metres from the start of the street to the start of this segment */
  from: number;
}

function segments(street: Street): Seg[] {
  const out: Seg[] = [];
  let from = 0;
  for (let i = 0; i + 1 < street.path.length; i++) {
    const a = street.path[i];
    const b = street.path[i + 1];
    const len = Math.hypot(b.u - a.u, b.v - a.v);
    out.push({ a, du: (b.u - a.u) / len, dv: (b.v - a.v) / len, len, from });
    from += len;
  }
  return out;
}

/** Length of the street itself in metres, not counting the lead and tail. */
export function streetMetres(street: Street): number {
  const segs = segments(street);
  const last = segs[segs.length - 1];
  return last.from + last.len;
}

/** How wide the scene for this street is, in game pixels. */
export function streetWidth(street: Street): number {
  return Math.round(street.lead + streetMetres(street) * PX_PER_M + street.tail);
}

/** The piece of the street nearest to a spot, and how far along that piece the spot falls. */
function nearest(street: Street, s: Spot): { seg: Seg; t: number } {
  const segs = segments(street);
  let best = { seg: segs[0], t: 0 };
  let bestD = Infinity;
  segs.forEach((seg, i) => {
    let t = (s.u - seg.a.u) * seg.du + (s.v - seg.a.v) * seg.dv;
    // only the two ends of the street carry on past their last point
    if (i > 0) t = Math.max(0, t);
    if (i < segs.length - 1) t = Math.min(seg.len, t);
    const d = Math.hypot(s.u - (seg.a.u + seg.du * t), s.v - (seg.a.v + seg.dv * t));
    if (d < bestD) {
      bestD = d;
      best = { seg, t };
    }
  });
  return best;
}

/** Where a spot on the plan falls in the street's scene, in game pixels from its left edge. */
export function xOf(street: Street, s: Spot): number {
  const { seg, t } = nearest(street, s);
  return Math.round(street.lead + (seg.from + t) * PX_PER_M);
}

/** The reverse: the spot on the plan under a scene x. */
export function spotAt(street: Street, x: number): Spot {
  const segs = segments(street);
  const m = (x - street.lead) / PX_PER_M;
  let seg = segs[0];
  for (const s of segs) if (m >= s.from) seg = s;
  const t = m - seg.from;
  return { u: seg.a.u + seg.du * t, v: seg.a.v + seg.dv * t };
}

/** The stretch of the scene a building block takes up: [left, right] in game pixels. */
export function frontage(street: Street, b: Block): [number, number] {
  const { seg } = nearest(street, b.at);
  const half = ((Math.abs(seg.du) * b.along + Math.abs(seg.dv) * b.across) / 2) * PX_PER_M;
  const mid = xOf(street, b.at);
  return [Math.round(mid - half), Math.round(mid + half)];
}

/** How far back from the street a block's near wall is, in metres. Further back means draw it further away. */
export function setback(street: Street, b: Block): number {
  const { seg, t } = nearest(street, b.at);
  const off = Math.hypot(b.at.u - (seg.a.u + seg.du * t), b.at.v - (seg.a.v + seg.dv * t));
  const depth = (Math.abs(seg.dv) * b.along + Math.abs(seg.du) * b.across) / 2;
  return Math.max(0, off - depth);
}

// The older scenes were drawn before the plan existed and keep their own
// spacing. These tie each one to the plan so the campus map can still show
// where you are: a scene x at one end, a spot on the plan, and the same for
// the other end.
const FIXED: Record<string, { x0: number; a: Spot; x1: number; b: Spot }> = {
  // the street side of the main gate: it all happens at the gate
  gate: { x0: 0, a: PLACES.mainGate, x1: 1200, b: PLACES.mainGate },
  // the front of the Main Building: rotunda on the left, St. Barachiel Gate on the right
  plaza: { x0: 190, a: PLACES.rotunda, x1: 1250, b: PLACES.barachielGate },
  lobby: { x0: 0, a: BUILDINGS.djdn.blocks[0].at, x1: 1, b: BUILDINGS.djdn.blocks[0].at },
  courtyard: { x0: 0, a: BUILDINGS.djdn.blocks[0].at, x1: 1, b: BUILDINGS.djdn.blocks[0].at },
};

/** Where on the plan the player is, given the scene they are in and their x. Null if the scene is not on the plan. */
export function whereAmI(area: string, x: number): Spot | null {
  const street = (STREETS as Record<string, Street>)[area];
  if (street) return spotAt(street, x);
  const f = FIXED[area];
  if (!f) return null;
  const t = Math.max(0, Math.min(1, (x - f.x0) / (f.x1 - f.x0)));
  return { u: f.a.u + (f.b.u - f.a.u) * t, v: f.a.v + (f.b.v - f.a.v) * t };
}

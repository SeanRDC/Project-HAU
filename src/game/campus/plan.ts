// The campus plan: where everything at Holy Angel University sits.
//
// Every position here was read off one picture, the satellite photo in
// `assets/Aerial shot of HAU enclosed in red line.png` (1308 x 682), and is
// kept in that picture's pixels so it can be checked against it. The code then
// turns those pixels into metres measured from the Chapel of the Holy Guardian
// Angel, which is the anchor for the whole campus.
//
// To fix a position: open the aerial photo, read the new pixel, change it
// here. Every scene and the campus map follow.
//
// Since 2026-10-12 the buildings themselves come from OpenStreetMap instead:
// their real outlines, surveyed, in `osm.ts`, made by `npm run import:osm`.
// The aerial photo is still used for the gates, junctions and the two
// buildings OSM does not have yet (GGN and the Formation Center).

import { OUTLINES } from './osm';

/** A pixel on the aerial photo, [x, y] from its top-left corner. */
export type Px = [number, number];

/**
 * A place on campus in metres from the centre of the chapel.
 * `u` runs along the chapel walkway, positive towards the chapel and beyond.
 * `v` runs across it, positive to your right as you walk to the chapel
 * (towards the Main Building side).
 */
export interface Spot {
  u: number;
  v: number;
}

const CHAPEL: Px = [835, 300];
const ROTUNDA: Px = [510, 488];
const WALKWAY_END: Px = [705, 372];
/** the front tip of the chapel, the point the measurement was taken to */
const CHAPEL_NOSE: Px = [780, 338];

/** Measured in Google Earth, 2026-10-11: rotunda statue to the nose of the chapel. */
export const MEASURED_M = 140.36;

const len = (a: Px, b: Px) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Metres per aerial pixel, from the one distance we have measured. */
export const M_PER_PX = MEASURED_M / len(ROTUNDA, CHAPEL_NOSE);

// The campus is built on a grid that is turned about 31 degrees from north.
// The walkway from the rotunda to the chapel lawn is the cleanest line on it.
const AXIS = len(ROTUNDA, WALKWAY_END);
const UX = (WALKWAY_END[0] - ROTUNDA[0]) / AXIS;
const UY = (WALKWAY_END[1] - ROTUNDA[1]) / AXIS;

/**
 * The walkway read off the photo by eye is a little off the true grid. In
 * OSM the building edges sit 2.64 degrees from it, so the plan is turned by
 * that much to square them up. tools/import-osm.mjs uses the same number.
 */
export const GRID_TURN = (2.64 * Math.PI) / 180;
const TC = Math.cos(GRID_TURN);
const TS = Math.sin(GRID_TURN);

/** Aerial pixel to metres from the chapel. */
export function spot(p: Px): Spot {
  const dx = (p[0] - CHAPEL[0]) * M_PER_PX;
  const dy = (p[1] - CHAPEL[1]) * M_PER_PX;
  const u = dx * UX + dy * UY;
  const v = -dx * UY + dy * UX;
  return { u: TC * u - TS * v, v: TS * u + TC * v };
}

/** Metres from the chapel back to an aerial pixel, for checking against the photo. */
export function toPx(s: Spot): Px {
  const u = TC * s.u + TS * s.v;
  const v = -TS * s.u + TC * s.v;
  const dx = u * UX - v * UY;
  const dy = u * UY + v * UX;
  return [CHAPEL[0] + dx / M_PER_PX, CHAPEL[1] + dy / M_PER_PX];
}

/** One rectangular block of a building, lined up with the campus grid. */
export interface Block {
  at: Spot;
  /** metres along the walkway direction */
  along: number;
  /** metres across it */
  across: number;
}

function block(centre: Px, alongPx: number, acrossPx: number): Block {
  return { at: spot(centre), along: alongPx * M_PER_PX, across: acrossPx * M_PER_PX };
}

/** A block given in plan metres, read off a building's OSM outline: u from..to, v from..to. */
function part(u0: number, u1: number, v0: number, v1: number): Block {
  return { at: { u: (u0 + u1) / 2, v: (v0 + v1) / 2 }, along: u1 - u0, across: v1 - v0 };
}

/** The smallest block that holds a building's whole OSM outline. */
function bounds(id: string): Block {
  const pts = OUTLINES[id];
  const us = pts.map((p) => p[0]);
  const vs = pts.map((p) => p[1]);
  return part(Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs));
}

/** A building's OSM outline as plan spots, if OSM has it. */
function outline(id: string): Spot[] | undefined {
  return OUTLINES[id]?.map(([u, v]) => ({ u, v }));
}

export interface Building {
  /** its number on the official 2022 campus map, if it has one */
  no?: number;
  name: string;
  /** what students call it, and what fits on a sign */
  short: string;
  /** the first block is the main one. The street scenes are laid out from these. */
  blocks: Block[];
  /** the real footprint from OpenStreetMap, for the campus map. Missing if OSM does not have it. */
  outline?: Spot[];
  /** what the campus map says is inside */
  inside: string[];
  /**
   * true when the aerial photo labels it or the team confirmed it.
   * false means the position is a best guess that still needs a photo.
   */
  sure: boolean;
}

export const BUILDINGS = {
  corazon: {
    no: 1,
    name: 'Plaza de Corazon Building',
    short: 'Red Bldg.',
    blocks: [bounds('corazon')],
    outline: outline('corazon'),
    inside: ['Human Resource Development Office', 'Dormitory'],
    sure: false,
  },
  martha: {
    no: 2,
    name: 'St. Martha Hall',
    short: 'St. Martha',
    blocks: [bounds('martha')],
    outline: outline('martha'),
    inside: ['Admissions Office & Testing Center', 'Dormitory'],
    sure: true,
  },
  sfj: {
    no: 3,
    name: 'San Francisco de Javier Building',
    short: 'SFJ',
    blocks: [bounds('sfj')],
    outline: outline('sfj'),
    inside: ["President's Office", 'University Library', 'University Theater'],
    sure: true,
  },
  stl: {
    no: 4,
    name: 'St. Therese of Lisieux Building',
    short: 'STL',
    // main block, the long wing along the back road, the pavilion by the parking lane
    blocks: [part(-168, -148, -60, -35), part(-165, -92, -74, -57), part(-168, -150, -35, -22)],
    outline: outline('stl'),
    inside: ["School of Hospitality and Tourism Management Dean's Office"],
    sure: true,
  },
  warehouse: {
    no: 5,
    name: 'Warehouse & Carpentry',
    short: 'Warehouse',
    blocks: [bounds('warehouse')],
    outline: outline('warehouse'),
    inside: [],
    sure: true,
  },
  foodcourt: {
    no: 6,
    name: 'Yellow Food Court',
    short: 'Food Court',
    blocks: [bounds('foodcourt')],
    outline: outline('foodcourt'),
    inside: [],
    sure: true,
  },
  sgh: {
    no: 7,
    name: 'St. Gabriel Hall',
    short: 'SGH',
    blocks: [bounds('sgh')],
    outline: outline('sgh'),
    inside: [],
    sure: true,
  },
  srh: {
    no: 8,
    name: 'St. Raphael Hall',
    short: 'SRH',
    blocks: [bounds('srh')],
    outline: outline('srh'),
    inside: [],
    sure: true,
  },
  smh: {
    no: 9,
    name: 'St. Michael Hall',
    short: 'SMH',
    blocks: [bounds('smh')],
    outline: outline('smh'),
    inside: [],
    sure: true,
  },
  ggn: {
    no: 10,
    name: 'Geromin G. Nepomuceno Building',
    short: 'GGN',
    blocks: [block([590, 150], 110, 175)],
    inside: ["Principal's Office / Faculty Room", 'High School Library'],
    sure: true,
  },
  pgn: {
    no: 11,
    name: 'Peter G. Nepomuceno Building',
    short: 'PGN',
    // the tower, then the podium
    blocks: [part(-92, -69, -76, -8), part(-135, -92, -37, -8)],
    outline: outline('pgn'),
    inside: ['OSSA - Scholarship & Grants Office', "School of Business and Accountancy Dean's Office", 'PGN Auditorium'],
    sure: true,
  },
  djdn: {
    no: 12,
    name: 'Don Juan D. Nepomuceno Building',
    short: 'Main Bldg.',
    blocks: [bounds('djdn')],
    outline: outline('djdn'),
    inside: ["Registrar's Office", 'Finance Office', 'CKS Office'],
    sure: true,
  },
  aps: {
    no: 13,
    name: 'Archbishop Pedro Santos Building',
    short: 'APS',
    // the long block on the back road, then the end that turns towards the lawn
    blocks: [part(-67, 42, -76, -59), part(24, 42, -59, -34)],
    outline: outline('aps'),
    inside: [],
    sure: true,
  },
  mgn: {
    no: 14,
    name: 'Mamerto G. Nepomuceno Building',
    short: 'MGN',
    // the long block beside the Main Building, then its south end
    blocks: [part(-90, -72, 16, 72), part(-96, -67, 72, 85)],
    outline: outline('mgn'),
    inside: [
      "School of Nursing & Applied Medical Sciences Dean's Office",
      "College of Criminal Justice Education & Forensics Dean's Office",
    ],
    sure: true,
  },
  chapel: {
    no: 15,
    name: 'Chapel of the Holy Guardian Angel',
    short: 'Chapel',
    blocks: [bounds('chapel')],
    outline: outline('chapel'),
    inside: [],
    sure: true,
  },
  formation: {
    no: 16,
    name: 'Sister Josefina Nepomuceno Formation Center',
    short: 'Formation Center',
    blocks: [block([873, 262], 50, 44)],
    inside: [],
    sure: false,
  },
  sjh: {
    no: 17,
    name: 'St. Joseph Hall Building',
    short: 'SJH',
    blocks: [bounds('sjh')],
    outline: outline('sjh'),
    inside: [
      "School of Education Dean's Office",
      "School of Arts and Sciences Dean's Office",
      "School of Computing Dean's Office",
      'Academic Hall',
    ],
    sure: true,
  },
  sh: {
    no: 18,
    name: 'Sacred Heart Building',
    short: 'SH',
    // the main block, then the two wings that come forward
    blocks: [part(50, 100, -83, -65), part(47, 68, -65, -42), part(89, 103, -67, -52)],
    outline: outline('sh'),
    inside: ["School of Engineering & Architecture Dean's Office"],
    sure: true,
  },
  court: {
    no: 19,
    name: 'Covered Court',
    short: 'Covered Court',
    blocks: [bounds('court')],
    outline: outline('court'),
    inside: [],
    sure: true,
  },
  gym: {
    no: 20,
    name: 'Immaculate Heart Gymnasium',
    short: 'Gym',
    blocks: [bounds('gym')],
    outline: outline('gym'),
    inside: [],
    sure: true,
  },
  annex: {
    no: 21,
    name: 'Immaculate Heart Gymnasium Annex',
    short: 'Gym Annex',
    // the annex wraps the gym: along its south side, then down its east side
    blocks: [part(40, 102, 76, 87), part(94, 104, 5, 76)],
    outline: outline('annex'),
    inside: [],
    sure: true,
  },
} satisfies Record<string, Building>;

export type BuildingId = keyof typeof BUILDINGS;

/** Places that are not buildings: gates, junctions, the things you walk past. */
export const PLACES = {
  /** centre of the chapel: (0, 0) by definition */
  chapel: spot(CHAPEL),
  chapelNose: spot(CHAPEL_NOSE),
  /** the Holy Guardian Angel statue fountain in the middle of the rotunda */
  rotunda: spot(ROTUNDA),
  /** where the chapel walkway meets the road along the lawn. Nudged onto the OSM path, clear of PGN. */
  walkwayEnd: { u: -67, v: -2 },
  /** Sto. Rosario Gate, the main gate, at the street end of the Epiphany of Angels */
  mainGate: spot([338, 643]),
  /** the university seal set into the pavers */
  seal: spot([377, 611]),
  /** where the angels stop and the fountain plaza starts */
  epiphanyEnd: spot([425, 583]),
  /** the patterned plaza with the fountain, between the Epiphany and the rotunda */
  fountainPlaza: spot([463, 555]),
  /** St. Barachiel Gate, the vehicle entrance on Holy Angel Avenue */
  barachielGate: spot([575, 612]),
  /** the side of the Main Building that faces the walkway; where its gate is has not been checked */
  courtyardGate: spot([640, 445]),
  /** behind SFJ and STL, where the parking lane meets the back road */
  westJunction: spot([430, 345]),
  /** on the back road (the street outside the halls), at the corner of GGN */
  hallsCorner: { u: -60, v: -88 },
  // The three below were read off the aerial photo at first and landed
  // inside APS, the covered court and the gym once the real outlines came in
  // from OSM. They now sit on the OSM paths beside those buildings.
  /** east of PGN, on the path along the lawn side of APS */
  northJunction: { u: -62, v: -54 },
  /** the far end of APS, between it and the covered court, below Sacred Heart */
  northEastJunction: { u: 43, v: -28 },
  /** the corner of the lawn nearest St. Joseph Hall */
  southJunction: spot([770, 432]),
  /** in front of the gym, on the path at the far end of St. Joseph Hall */
  gymCorner: { u: 38, v: 52 },
} satisfies Record<string, Spot>;

export type PlaceId = keyof typeof PLACES;

/** Straight-line distance between two spots, in metres. */
export function metres(a: Spot, b: Spot): number {
  return Math.hypot(b.u - a.u, b.v - a.v);
}

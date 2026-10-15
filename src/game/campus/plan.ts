// The campus plan: where everything at Holy Angel University sits.
//
// Every position here was read off one picture, the satellite photo in
// `assets/images/other references/Aerial shot of HAU enclosed in red line.png` (1308 x 682), and is
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
//
// Since 2026-10-14 the campus map follows the photo wherever OSM and the photo
// disagree: those outlines are traced off the photo, corner by corner (see
// TRACED below). The street scenes are still laid out from `blocks`, which did
// not move.

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

/** An outline traced off the aerial photo, one pixel per corner. */
function traced(...px: Px[]): Spot[] {
  return px.map(spot);
}

/** The middle of an outline, for the number it carries on the campus map. */
function middle(pts: Spot[]): Spot {
  let area = 0;
  let u = 0;
  let v = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const k = a.u * b.v - b.u * a.v;
    area += k;
    u += (a.u + b.u) * k;
    v += (a.v + b.v) * k;
  }
  return { u: u / (3 * area), v: v / (3 * area) };
}

// Traced off the aerial photo on 2026-10-14, for the buildings OSM does not
// have or puts somewhere the photo does not.
//
// The five on the north-west corner (5 to 9) have the right shapes in OSM but
// sit about 14 m from where the photo shows them. The Red Building and St.
// Martha Hall are about 7 m off. GGN and the Formation Center are not in OSM
// at all, and OSM's "chapel" is the chapel and the Formation Center together.
//
// St. Gabriel and St. Raphael are the two long sides of one building round a
// courtyard; these four points are that building, and the courtyard inside it.
const HALL: Px[] = [[427, 176.3], [498, 285], [447, 318], [375.5, 210]];
const HALL_YARD: Px[] = [[424, 209], [470, 280], [458.8, 288.8], [410, 217.5]];
const mid = (a: Px, b: Px): Px => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
// the line the two halls meet on, end to end
const SEAM: Px[] = [mid(HALL[0], HALL[3]), mid(HALL_YARD[0], HALL_YARD[3]), mid(HALL_YARD[1], HALL_YARD[2]), mid(HALL[1], HALL[2])];

const TRACED = {
  corazon: traced([235, 507.6], [259, 499.6], [281, 538], [257, 546]),
  martha: traced([293, 478.4], [322.4, 463], [376.9, 553.9], [347.5, 569.3]),
  // a row of small roofs and the shed at its south end
  warehouse: traced([326.3, 278.8], [341.3, 269.5], [350, 285.5], [372.5, 329.5], [392.5, 325], [398, 347.5], [380.8, 358], [360, 338.8], [336.3, 297]),
  foodcourt: traced([342, 220.8], [358, 211.8], [411.3, 323.8], [398, 333.8]),
  // the west side of the courtyard building
  sgh: traced(HALL[3], SEAM[0], SEAM[1], HALL_YARD[3], HALL_YARD[2], SEAM[2], SEAM[3], HALL[2]),
  // the east side
  srh: traced(SEAM[0], HALL[0], HALL[1], SEAM[3], SEAM[2], HALL_YARD[1], HALL_YARD[0], SEAM[1]),
  smh: traced([446, 150], [466, 138], [533, 246], [513, 258]),
  // the spine along the street, two wings towards St. Michael Hall, the courtyard between them
  ggn: traced(
    [586.3, 48], [665.5, 152], [653, 183], [622.5, 206.3], [587, 240], [550, 257.5], [526.3, 223.8], [525, 198.8],
    [582.5, 167.5], [572.5, 151.3], [516.3, 181.3], [501.3, 192.5], [476.3, 156.3], [482.5, 118.8], [507.5, 102.5],
    [512.5, 83.8], [542.5, 70], [560, 71.3],
  ),
  // the round end of the white roof, facing the lawn
  chapel: traced(
    [827.6, 268], [816, 278], [800, 282.4], [786, 286], [777, 295], [773, 310], [778, 330], [790, 346], [804, 354.4],
    [816, 356.4], [827, 351.6], [834, 342], [838, 330], [845.6, 320],
  ),
  // the other end of the same roof, with the terraces and the curved wall behind
  formation: traced(
    [827.6, 268], [845.6, 320], [856, 318], [870, 326], [883, 328], [906, 314.4], [906.4, 299], [902, 278], [890, 258],
    [878, 242], [865, 227], [854, 224], [836, 237], [833, 248], [828.4, 256],
  ),
  // the dark hipped roof beside the covered court. Sean, 2026-10-14: it is part of Sacred Heart.
  shWing: traced([947, 96.3], [983.8, 75.5], [1020, 133.8], [983.3, 154.5]),
};

export interface Building {
  /** its number on the official 2022 campus map, if it has one */
  no?: number;
  name: string;
  /** what students call it, and what fits on a sign */
  short: string;
  /** the first block is the main one. The street scenes are laid out from these. */
  blocks: Block[];
  /**
   * the footprint the campus map draws: from OpenStreetMap, or traced off the
   * aerial photo where the two disagree. Missing means the map draws the blocks.
   */
  outline?: Spot[];
  /** other roofs of the same building, drawn on the campus map beside the outline */
  wings?: Spot[][];
  /** where its number goes on the campus map, when the first block is not on the outline */
  label?: Spot;
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
    outline: TRACED.corazon,
    label: middle(TRACED.corazon),
    inside: ['Human Resource Development Office', 'Dormitory'],
    // Sean, 2026-10-14: it is the dark roof with the solar panels, on the street corner
    sure: true,
  },
  martha: {
    no: 2,
    name: 'St. Martha Hall',
    short: 'St. Martha',
    blocks: [bounds('martha')],
    outline: TRACED.martha,
    label: middle(TRACED.martha),
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
    outline: TRACED.warehouse,
    label: middle(TRACED.warehouse),
    inside: [],
    sure: true,
  },
  foodcourt: {
    no: 6,
    name: 'Yellow Food Court',
    short: 'Food Court',
    blocks: [bounds('foodcourt')],
    outline: TRACED.foodcourt,
    label: middle(TRACED.foodcourt),
    inside: [],
    sure: true,
  },
  sgh: {
    no: 7,
    name: 'St. Gabriel Hall',
    short: 'SGH',
    blocks: [bounds('sgh')],
    outline: TRACED.sgh,
    label: middle(TRACED.sgh),
    inside: [],
    sure: true,
  },
  srh: {
    no: 8,
    name: 'St. Raphael Hall',
    short: 'SRH',
    blocks: [bounds('srh')],
    outline: TRACED.srh,
    label: middle(TRACED.srh),
    inside: [],
    sure: true,
  },
  smh: {
    no: 9,
    name: 'St. Michael Hall',
    short: 'SMH',
    blocks: [bounds('smh')],
    outline: TRACED.smh,
    label: middle(TRACED.smh),
    inside: [],
    sure: true,
  },
  ggn: {
    no: 10,
    name: 'Geromin G. Nepomuceno Building',
    short: 'GGN',
    blocks: [block([590, 150], 110, 175)],
    outline: TRACED.ggn,
    // on the spine, clear of the courtyard
    label: spot([600, 150]),
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
    outline: TRACED.chapel,
    label: middle(TRACED.chapel),
    inside: [],
    sure: true,
  },
  formation: {
    no: 16,
    name: 'Sister Josefina Nepomuceno Formation Center',
    short: 'Formation Center',
    blocks: [block([873, 262], 50, 44)],
    outline: TRACED.formation,
    label: spot([872, 285]),
    inside: [],
    sure: true,
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
    wings: [TRACED.shWing],
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
  /**
   * The side gate students come in by, on Holy Angel Avenue facing Holy Rosary
   * Parish: the white gatehouse that reads LAUS DEO SEMPER 1933 on its inner
   * face. The light strip of the walkway runs from it up to the flag plaza.
   */
  sideGate: spot([507, 604]),
  /** the round plaza with the Philippine flag at the end of the side gate walkway, under the "Courtyard" pin on the aerial photo */
  flagCircle: spot([504, 535]),
  /** the foot of the plaza's east steps, on the drive in front of the Main Building */
  flagEast: spot([525.6, 531]),
  /** the foot of its west steps, on the way down to the SFJ fountain and the Epiphany */
  flagWest: spot([482.4, 539]),
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

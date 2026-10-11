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

/** Aerial pixel to metres from the chapel. */
export function spot(p: Px): Spot {
  const dx = (p[0] - CHAPEL[0]) * M_PER_PX;
  const dy = (p[1] - CHAPEL[1]) * M_PER_PX;
  return { u: dx * UX + dy * UY, v: -dx * UY + dy * UX };
}

/** Metres from the chapel back to an aerial pixel, for checking against the photo. */
export function toPx(s: Spot): Px {
  const dx = s.u * UX - s.v * UY;
  const dy = s.u * UY + s.v * UX;
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

export interface Building {
  /** its number on the official 2022 campus map, if it has one */
  no?: number;
  name: string;
  /** what students call it, and what fits on a sign */
  short: string;
  /** the first block is the main one */
  blocks: Block[];
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
    blocks: [block([266, 522], 40, 52)],
    inside: ['Human Resource Development Office', 'Dormitory'],
    sure: false,
  },
  martha: {
    no: 2,
    name: 'St. Martha Hall',
    short: 'St. Martha',
    blocks: [block([336, 520], 44, 110)],
    inside: ['Admissions Office & Testing Center', 'Dormitory'],
    sure: true,
  },
  sfj: {
    no: 3,
    name: 'San Francisco de Javier Building',
    short: 'SFJ',
    blocks: [block([403, 480], 72, 105)],
    inside: ["President's Office", 'University Library', 'University Theater'],
    sure: true,
  },
  stl: {
    no: 4,
    name: 'St. Therese of Lisieux Building',
    short: 'STL',
    blocks: [block([497, 405], 52, 72), block([532, 327], 128, 28), block([520, 426], 30, 30)],
    inside: ["School of Hospitality and Tourism Management Dean's Office"],
    sure: true,
  },
  warehouse: {
    no: 5,
    name: 'Warehouse & Carpentry',
    short: 'Warehouse',
    blocks: [block([350, 300], 24, 85)],
    inside: [],
    sure: false,
  },
  foodcourt: {
    no: 6,
    name: 'Yellow Food Court',
    short: 'Food Court',
    blocks: [block([390, 272], 22, 120)],
    inside: [],
    sure: false,
  },
  sgh: {
    no: 7,
    name: 'St. Gabriel Hall',
    short: 'SGH',
    blocks: [block([427, 262], 34, 160)],
    inside: [],
    sure: true,
  },
  srh: {
    no: 8,
    name: 'St. Raphael Hall',
    short: 'SRH',
    blocks: [block([463, 242], 34, 160)],
    inside: [],
    sure: true,
  },
  smh: {
    no: 9,
    name: 'St. Michael Hall',
    short: 'SMH',
    blocks: [block([506, 213], 28, 135)],
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
    blocks: [block([640, 318], 72, 112), block([583, 398], 110, 72)],
    inside: ['OSSA - Scholarship & Grants Office', "School of Business and Accountancy Dean's Office", 'PGN Auditorium'],
    sure: true,
  },
  djdn: {
    no: 12,
    name: 'Don Juan D. Nepomuceno Building',
    short: 'Main Bldg.',
    blocks: [block([662, 522], 150, 135)],
    inside: ["Registrar's Office", 'Finance Office', 'CKS Office'],
    sure: true,
  },
  aps: {
    no: 13,
    name: 'Archbishop Pedro Santos Building',
    short: 'APS',
    blocks: [block([738, 202], 222, 32)],
    inside: [],
    sure: true,
  },
  mgn: {
    no: 14,
    name: 'Mamerto G. Nepomuceno Building',
    short: 'MGN',
    blocks: [block([752, 470], 30, 110), block([735, 420], 75, 30)],
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
    blocks: [block([835, 300], 105, 95)],
    inside: [],
    sure: true,
  },
  formation: {
    no: 16,
    name: 'Sister Josefina Nepomuceno Formation Center',
    short: 'Formation Center',
    blocks: [block([873, 262], 50, 44)],
    inside: [],
    sure: true,
  },
  sjh: {
    no: 17,
    name: 'St. Joseph Hall Building',
    short: 'SJH',
    blocks: [block([895, 442], 222, 38)],
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
    blocks: [block([882, 108], 95, 70)],
    inside: ["School of Engineering & Architecture Dean's Office"],
    sure: true,
  },
  court: {
    no: 19,
    name: 'Covered Court',
    short: 'Covered Court',
    blocks: [block([943, 165], 105, 105)],
    inside: [],
    sure: true,
  },
  gym: {
    no: 20,
    name: 'Immaculate Heart Gymnasium',
    short: 'Gym',
    blocks: [block([1042, 292], 82, 172)],
    inside: [],
    sure: true,
  },
  annex: {
    no: 21,
    name: 'Immaculate Heart Gymnasium Annex',
    short: 'Gym Annex',
    blocks: [block([1088, 372], 82, 24)],
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
  /** where the chapel walkway meets the road along the lawn */
  walkwayEnd: spot(WALKWAY_END),
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
  /** between PGN, GGN and the end of APS */
  northJunction: spot([640, 255]),
  /** the far end of APS, below Sacred Heart */
  northEastJunction: spot([868, 172]),
  /** the corner of the lawn nearest St. Joseph Hall */
  southJunction: spot([770, 432]),
  /** in front of the gym, at the far end of St. Joseph Hall */
  gymCorner: spot([1000, 338]),
} satisfies Record<string, Spot>;

export type PlaceId = keyof typeof PLACES;

/** Straight-line distance between two spots, in metres. */
export function metres(a: Spot, b: Spot): number {
  return Math.hypot(b.u - a.u, b.v - a.v);
}

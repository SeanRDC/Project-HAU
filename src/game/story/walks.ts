// The chapel walkway's lanes: the student center, sidewalks 1 and 2 on the
// Main Building side, sidewalks 2 and 1 on the PGN side. Every way from one
// lane to the next is a real opening: the gaps in the student center's
// planter, the breaks in the hedges, the two crossings over the road.
// Dialogue is Taglish with a bit of Kapampangan. Edit freely.

import { BUILDINGS } from '../campus/plan';
import { Hotspot, NpcDef } from '../types';
import { closedDoor, deadEnd, wayTo } from './campus';
import { BEA, KATH, MIGS, PE_BOY } from './cast';

const toStu = 'Pumasok sa student center';
const toSw1 = 'Lumipat sa sidewalk 1 (covered walk)';
const toSw2 = 'Lumipat sa sidewalk 2';
const cross = 'Tumawid sa kabilang side';
const rotunda = 'Pumunta sa rotunda';

export function djnLaneHotspots(
  lane: 'stuc' | 'djnsw1' | 'djnsw2',
  x: { courtyard?: number; cafe?: number; atm?: number; openings?: number[]; stu?: number[]; hedge?: number[]; cross?: number[]; end: number; mgn: number },
): Hotspot[] {
  const out: Hotspot[] = [closedDoor('mgn', x.mgn, BUILDINGS.mgn)];
  if (lane === 'stuc') {
    out.push(
      wayTo('courtyard', x.courtyard!, 'Pumasok sa courtyard ng Main Bldg.', 'courtyard', 'gate', 60),
      {
        id: 'cafe',
        x: x.cafe!,
        range: 26,
        label: 'Tingnan ang Cafe Juan',
        height: 70,
        use: (g) =>
          g.say([
            { who: '', text: '"CAFE JUAN." Nakaukit sa kahoy ang pangalan, nakasabit sa itaas ng madilim na gate.' },
            { who: '', text: 'Sa likod ng matataas na bintana, mga mesa at nakasabit na ilaw. Amoy kape hanggang dito.' },
            { who: 'you', text: 'Pag may pera na ako, dito ako magkakape.', set: 'saw_cafe_juan' },
          ]),
      },
      {
        id: 'atm',
        x: x.atm!,
        range: 18,
        label: 'Tingnan ang ATM',
        height: 50,
        use: (g) => g.say([{ who: '', text: 'BDO ATM. May pila na agad, kahit hindi pa sweldo ng kahit sino.' }]),
      },
      wayTo('openA', x.openings![0], toSw1, 'djnsw1', 'stuA', 30),
      wayTo('openB', x.openings![1], toSw1, 'djnsw1', 'stuB', 30),
      wayTo('end', x.end, rotunda, 'plaza', 'stuc'),
    );
  }
  if (lane === 'djnsw1') {
    out.push(
      wayTo('stuA', x.stu![0], toStu, 'stuc', 'openA', 50),
      wayTo('stuB', x.stu![1], toStu, 'stuc', 'openB', 50),
      wayTo('hedgeA', x.hedge![0], toSw2, 'djnsw2', 'hedgeA', 30),
      wayTo('hedgeB', x.hedge![1], toSw2, 'djnsw2', 'hedgeB', 30),
      // the covered walk ends at the rotunda beside sidewalk 2
      wayTo('end', x.end, 'Lumabas papunta sa rotunda (sidewalk 2)', 'djnsw2', 'plaza'),
    );
  }
  if (lane === 'djnsw2') {
    out.push(
      wayTo('hedgeA', x.hedge![0], toSw1, 'djnsw1', 'hedgeA', 50),
      wayTo('hedgeB', x.hedge![1], toSw1, 'djnsw1', 'hedgeB', 50),
      wayTo('crossA', x.cross![0], cross, 'walkway', 'crossA', 30),
      wayTo('crossB', x.cross![1], cross, 'walkway', 'crossB', 30),
      wayTo('end', x.end, rotunda, 'plaza', 'djnwalk'),
    );
  }
  return out;
}

export function pgnSw1Hotspots(x: { rotunda: number; hedge: number[]; stl: number; podium: number; tower: number; end: number }): Hotspot[] {
  return [
    wayTo('rotunda', x.rotunda, 'Lumabas papunta sa rotunda (sidewalk 2)', 'walkway', 'rotunda'),
    closedDoor('stl', x.stl, BUILDINGS.stl),
    wayTo('hedgeB', x.hedge[0], toSw2, 'walkway', 'hedgeB', 30),
    closedDoor('podium', x.podium, BUILDINGS.pgn),
    wayTo('hedgeA', x.hedge[1], toSw2, 'walkway', 'hedgeA', 30),
    closedDoor('tower', x.tower, BUILDINGS.pgn),
    deadEnd('end', x.end, 'Tingnan ang dulo', 'Dito na nagtatapos ang covered walk, sa PGN. Sa sidewalk 2 ka dumaan papunta sa chapel.'),
  ];
}

export function walkwayHotspots(x: { rotunda: number; hedge: number[]; cross: number[]; lawn: number }): Hotspot[] {
  return [
    wayTo('rotunda', x.rotunda, rotunda, 'plaza', 'walkway'),
    wayTo('hedgeB', x.hedge[0], toSw1, 'pgnsw1', 'hedgeB', 50),
    wayTo('crossA', x.cross[0], cross, 'djnsw2', 'crossA', 30),
    wayTo('hedgeA', x.hedge[1], toSw1, 'pgnsw1', 'hedgeA', 50),
    wayTo('crossB', x.cross[1], cross, 'djnsw2', 'crossB', 30),
    wayTo('lawn', x.lawn, 'Pumunta sa chapel', 'lawn', 'walkway'),
  ];
}

/** A couple of students in each lane, standing about or wandering. */
export function laneNpcs(lane: string, xs: number[]): NpcDef[] {
  if (lane === 'stuc') {
    return [
      {
        id: 'stu1',
        name: 'Nica',
        look: BEA,
        x: xs[0],
        depth: -8,
        facing: 1,
        talk: () => [
          { who: 'stu1', text: 'Dito kami tumatambay sa pagitan ng klase. May saksakan pa sa mesa, kaya laging puno.' },
          { who: 'stu1', face: 'happy', text: 'Pag gutom ka, Cafe Juan. Pag kuripot ka... canteen sa APS.' },
        ],
      },
      {
        id: 'stu2',
        name: 'Paul',
        look: MIGS,
        x: xs[1],
        depth: -6,
        facing: -1,
        wander: [xs[1] - 40, xs[1] + 40],
        talk: () => [{ who: 'stu2', face: 'worried', text: 'May quiz kami mamaya. Pahiram nga ng notes... joke lang. Siguro.' }],
      },
    ];
  }
  if (lane === 'djnsw1') {
    return [
      {
        id: 'sw1',
        name: 'Kyle',
        look: PE_BOY,
        x: xs[0],
        depth: -10,
        facing: 1,
        wander: [xs[0] - 60, xs[0] + 60],
        talk: () => [{ who: 'sw1', text: 'Mas presko dito sa covered walk. Pag umuulan, dito ka dumaan para hindi ka mabasa.' }],
      },
    ];
  }
  return [
    {
      id: 'pgn1',
      name: 'Shane',
      look: KATH,
      x: xs[0],
      depth: -10,
      facing: 1,
      talk: () => [{ who: 'pgn1', text: 'Sa PGN ang klase ko. Ang taas ng hagdan, buti may elevator.' }],
    },
  ];
}

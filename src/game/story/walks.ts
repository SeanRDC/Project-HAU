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
// the same, in English
const toStuEn = 'Go into the student center';
const toSw1En = 'Move to sidewalk 1 (covered walk)';
const toSw2En = 'Move to sidewalk 2';
const crossEn = 'Cross to the other side';
const rotundaEn = 'Go to the rotunda';

export function djnLaneHotspots(
  lane: 'stuc' | 'djnsw1' | 'djnsw2',
  x: { courtyard?: number; cafe?: number; atm?: number; openings?: number[]; stu?: number[]; hedge?: number[]; cross?: number[]; end: number; mgn: number },
): Hotspot[] {
  const out: Hotspot[] = [closedDoor('mgn', x.mgn, BUILDINGS.mgn)];
  if (lane === 'stuc') {
    out.push(
      wayTo('courtyard', x.courtyard!, 'Pumasok sa courtyard ng Main Bldg.', 'courtyard', 'gate', 60, 'Go into the Main Bldg. courtyard'),
      {
        id: 'cafe',
        x: x.cafe!,
        range: 26,
        label: 'Tingnan ang Cafe Juan',
        labelEn: 'Look at Cafe Juan',
        height: 70,
        use: (g) =>
          g.say([
            { who: '', text: '"CAFE JUAN." Nakaukit sa kahoy ang pangalan, nakasabit sa itaas ng madilim na gate.', en: '"CAFE JUAN." The name is carved in wood, hanging above a dark gate.' },
            { who: '', text: 'Sa likod ng matataas na bintana, mga mesa at nakasabit na ilaw. Amoy kape hanggang dito.', en: 'Behind the tall windows, tables and hanging lights. You can smell the coffee from here.' },
            { who: 'you', text: 'Pag may pera na ako, dito ako magkakape.', en: 'Once I\'ve got some money, I\'m getting my coffee here.', set: 'saw_cafe_juan' },
          ]),
      },
      {
        id: 'atm',
        x: x.atm!,
        range: 18,
        label: 'Tingnan ang ATM',
        labelEn: 'Look at the ATM',
        height: 50,
        use: (g) => g.say([{ who: '', text: 'BDO ATM. May pila na agad, kahit hindi pa sweldo ng kahit sino.', en: 'BDO ATM. There\'s already a line, even though it isn\'t anyone\'s payday yet.' }]),
      },
      wayTo('openA', x.openings![0], toSw1, 'djnsw1', 'stuA', 30, toSw1En),
      wayTo('openB', x.openings![1], toSw1, 'djnsw1', 'stuB', 30, toSw1En),
      wayTo('end', x.end, rotunda, 'plaza', 'stuc', 50, rotundaEn),
    );
  }
  if (lane === 'djnsw1') {
    out.push(
      wayTo('stuA', x.stu![0], toStu, 'stuc', 'openA', 50, toStuEn),
      wayTo('stuB', x.stu![1], toStu, 'stuc', 'openB', 50, toStuEn),
      wayTo('hedgeA', x.hedge![0], toSw2, 'djnsw2', 'hedgeA', 30, toSw2En),
      wayTo('hedgeB', x.hedge![1], toSw2, 'djnsw2', 'hedgeB', 30, toSw2En),
      // the covered walk ends at the rotunda beside sidewalk 2
      wayTo('end', x.end, 'Lumabas papunta sa rotunda (sidewalk 2)', 'djnsw2', 'plaza', 50, 'Go out to the rotunda (sidewalk 2)'),
    );
  }
  if (lane === 'djnsw2') {
    out.push(
      wayTo('hedgeA', x.hedge![0], toSw1, 'djnsw1', 'hedgeA', 50, toSw1En),
      wayTo('hedgeB', x.hedge![1], toSw1, 'djnsw1', 'hedgeB', 50, toSw1En),
      wayTo('crossA', x.cross![0], cross, 'walkway', 'crossA', 30, crossEn),
      wayTo('crossB', x.cross![1], cross, 'walkway', 'crossB', 30, crossEn),
      wayTo('end', x.end, rotunda, 'plaza', 'djnwalk', 50, rotundaEn),
    );
  }
  return out;
}

export function pgnSw1Hotspots(x: { rotunda: number; hedge: number[]; stl: number; podium: number; tower: number; end: number }): Hotspot[] {
  return [
    wayTo('rotunda', x.rotunda, 'Lumabas papunta sa rotunda (sidewalk 2)', 'walkway', 'rotunda', 50, 'Go out to the rotunda (sidewalk 2)'),
    closedDoor('stl', x.stl, BUILDINGS.stl),
    wayTo('hedgeB', x.hedge[0], toSw2, 'walkway', 'hedgeB', 30, toSw2En),
    closedDoor('podium', x.podium, BUILDINGS.pgn),
    wayTo('hedgeA', x.hedge[1], toSw2, 'walkway', 'hedgeA', 30, toSw2En),
    closedDoor('tower', x.tower, BUILDINGS.pgn),
    deadEnd('end', x.end, 'Tingnan ang dulo', 'Dito na nagtatapos ang covered walk, sa PGN. Sa sidewalk 2 ka dumaan papunta sa chapel.', {
      label: 'Look at the end',
      text: 'The covered walk ends here, at PGN. Take sidewalk 2 to get to the chapel.',
    }),
  ];
}

export function walkwayHotspots(x: { rotunda: number; hedge: number[]; cross: number[]; lawn: number }): Hotspot[] {
  return [
    wayTo('rotunda', x.rotunda, rotunda, 'plaza', 'walkway', 50, rotundaEn),
    wayTo('hedgeB', x.hedge[0], toSw1, 'pgnsw1', 'hedgeB', 50, toSw1En),
    wayTo('crossA', x.cross[0], cross, 'djnsw2', 'crossA', 30, crossEn),
    wayTo('hedgeA', x.hedge[1], toSw1, 'pgnsw1', 'hedgeA', 50, toSw1En),
    wayTo('crossB', x.cross[1], cross, 'djnsw2', 'crossB', 30, crossEn),
    wayTo('lawn', x.lawn, 'Pumunta sa chapel', 'lawn', 'walkway', 50, 'Go to the chapel'),
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
          { who: 'stu1', text: 'Dito kami tumatambay sa pagitan ng klase. May saksakan pa sa mesa, kaya laging puno.', en: 'This is where we hang out between classes. The tables even have outlets, so it\'s always full.' },
          { who: 'stu1', face: 'happy', text: 'Pag gutom ka, Cafe Juan. Pag kuripot ka... canteen sa APS.', en: 'When you\'re hungry, Cafe Juan. When you\'re pinching pennies... the APS canteen.' },
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
        talk: () => [{ who: 'stu2', face: 'worried', text: 'May quiz kami mamaya. Pahiram nga ng notes... joke lang. Siguro.', en: 'We have a quiz later. Can I borrow your notes... kidding. Maybe.' }],
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
        talk: () => [{ who: 'sw1', text: 'Mas presko dito sa covered walk. Pag umuulan, dito ka dumaan para hindi ka mabasa.', en: 'It\'s cooler here on the covered walk. When it rains, come this way so you don\'t get wet.' }],
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
      talk: () => [{ who: 'pgn1', text: 'Sa PGN ang klase ko. Ang taas ng hagdan, buti may elevator.', en: 'My class is in PGN. So many stairs. Good thing there\'s an elevator.' }],
    },
  ];
}

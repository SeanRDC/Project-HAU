// What you can press E on along the campus streets: the ways from one street
// to the next, and the doors of buildings that are not open yet. No one lives
// on these streets yet; the people come once the buildings have insides.
//
// Each function is given the x of everything by its scene, so nothing here
// knows where things are. Writers: change labels and lines freely.

import { BUILDINGS } from '../campus/plan';
import { Choice, GameApi, Hotspot, Line } from '../types';
import { closedDoor, deadEnd, wayTo } from './campus';

/** A menu choice that costs `price` out of your baon, or tells you you are short. */
export function buy(g: GameApi, item: string, price: number, lines: Line[]): Choice {
  const text = `${item} (₱${price})`;
  if (g.pesos() < price) {
    return { text, then: [{ who: '', text: `Kinapa mo ang bulsa mo. ₱${g.pesos()} na lang ang natitira.` }] };
  }
  const [first, ...rest] = lines;
  return { text, then: [{ ...first, pesos: -price, item }, ...rest] };
}

export function walkwayHotspots(x: { rotunda: number; stl: number; courtyard: number; pgn: number; lawn: number }): Hotspot[] {
  return [
    wayTo('rotunda', x.rotunda, 'Bumalik sa rotunda', 'plaza', 'walkway'),
    closedDoor('stl', x.stl, BUILDINGS.stl),
    wayTo('courtyard', x.courtyard, 'Tumawid papunta sa courtyard ng Main Bldg.', 'courtyard', 'gate', 30),
    closedDoor('pgn', x.pgn, BUILDINGS.pgn),
    wayTo('lawn', x.lawn, 'Pumunta sa chapel', 'lawn', 'walkway'),
  ];
}

export function laneHotspots(x: { halls: number; stl: number; sfj: number; entry: number; plaza: number }): Hotspot[] {
  return [
    wayTo('halls', x.halls, 'Pumunta sa back road', 'halls', 'lane'),
    closedDoor('sfj', x.sfj, BUILDINGS.sfj, true),
    closedDoor('stl', x.stl, BUILDINGS.stl),
    wayTo('entry', x.entry, 'Umakyat sa flagpole (side gate)', 'entry', 'stl', 30),
    wayTo('plaza', x.plaza, 'Pumunta sa rotunda', 'plaza', 'lane'),
  ];
}

export function hallsHotspots(x: {
  warehouse: number; food: number; lane: number; sgh: number; srh: number; smh: number; ggn: number; lawn: number; aps: number;
}): Hotspot[] {
  return [
    closedDoor('warehouse', x.warehouse, BUILDINGS.warehouse),
    {
      id: 'food',
      x: x.food,
      range: 30,
      label: 'Tingnan ang Yellow Food Court',
      height: 60,
      use: (g) => {
        const open = g.hour() >= 7 && g.hour() < 19;
        if (!open) {
          g.say([
            { who: '', text: '"YELLOW FOOD COURT." Building 6 sa campus map. Dilaw ang bubong, kaya \'yun na rin ang tawag.' },
            { who: '', text: 'Sarado na ang mga stall. Bukas ulit ng alas-siyete ng umaga.' },
            { who: 'you', text: 'Dito yata \'yung kwek-kwek na ipinangako ni Kath.' },
          ]);
          return;
        }
        g.say([
          {
            who: '',
            text: g.raining()
              ? 'Siksikan sa Yellow Food Court, lahat sumilong sa ulan. Amoy prito at kanin.'
              : 'Yellow Food Court. Mahaba ang pila sa siomai, maikli sa palamig.',
            choices: [
              buy(g, 'Kwek-kwek', 25, [
                { who: '', text: 'Limang kwek-kwek sa stick, may suka na may sibuyas.' },
                { who: 'you', text: 'Mainit pa. Sulit.' },
              ]),
              buy(g, 'Siomai rice', 55, [
                { who: '', text: 'Apat na siomai, kanin, toyo-kalamansi, at maraming chili garlic.' },
                { who: 'you', text: 'Busog na ako hanggang uwian.' },
              ]),
              buy(g, 'Palamig', 15, [
                { who: '', text: 'Sago\'t gulaman sa plastic cup. Malamig, matamis.' },
              ]),
              {
                text: 'May baon akong adobo.',
                then: [{ who: 'you', text: 'Tipid muna. Sayang ang adobo ni Mama.' }],
              },
            ],
          },
        ]);
      },
    },
    wayTo('lane', x.lane, 'Bumaba sa parking lane', 'lane', 'halls', 30),
    closedDoor('sgh', x.sgh, BUILDINGS.sgh),
    closedDoor('srh', x.srh, BUILDINGS.srh),
    closedDoor('smh', x.smh, BUILDINGS.smh),
    closedDoor('ggn', x.ggn, BUILDINGS.ggn),
    wayTo('lawn', x.lawn, 'Pumunta sa chapel lawn', 'lawn', 'halls', 30),
    wayTo('aps', x.aps, 'Dumiretso sa APS', 'aps', 'halls'),
  ];
}

export function apsHotspots(x: { halls: number; canteen: number; lawn: number; aps: number; gym: number; sh: number }): Hotspot[] {
  return [
    wayTo('halls', x.halls, 'Bumalik sa back road', 'halls', 'aps'),
    wayTo('canteen', x.canteen, 'Pumasok sa canteen', 'canteen', 'front', 60),
    wayTo('lawn', x.lawn, 'Pumunta sa chapel lawn', 'lawn', 'aps', 30),
    wayTo('aps', x.aps, 'Pumasok sa APS lobby', 'apslobby', 'front', 60),
    wayTo('gym', x.gym, 'Pumunta sa covered court at gym', 'gym', 'aps', 30),
    // Sacred Heart is behind the canteen block, reached through the back of the canteen; this is just the stair tower's door
    deadEnd('tower', x.sh, 'Tingnan ang pinto', 'Ang pinto sa paanan ng hagdan ng APS. Naka-lock. May papel: "Sa canteen po ang daan papuntang Sacred Heart."'),
  ];
}

export function lawnHotspots(x: { halls: number; aps: number; walkway: number; chapel: number; sjh: number }): Hotspot[] {
  return [
    wayTo('halls', x.halls, 'Pumunta sa back road', 'halls', 'lawn', 30),
    wayTo('aps', x.aps, 'Dumaan sa tabi ng APS', 'aps', 'lawn'),
    wayTo('walkway', x.walkway, 'Bumalik sa walkway', 'walkway', 'lawn', 30),
    {
      id: 'chapel',
      x: x.chapel,
      range: 34,
      label: 'Tingnan ang chapel',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: '"CHAPEL OF THE HOLY GUARDIAN ANGEL." Bilog, puti, patong-patong na parang mga singsing, may krus sa tuktok.' },
          { who: '', text: 'Dito nakasentro ang buong campus. Kahit saan ka manggaling, dito ka rin dadaan.' },
          { who: '', text: 'Sarado pa ang pinto. Tahimik sa loob.', set: 'saw_chapel' },
          { who: 'you', text: 'Babalik ako \'pag bukas na.' },
        ]),
    },
    wayTo('sjh', x.sjh, 'Pumunta sa St. Joseph Hall', 'sjh', 'lawn'),
  ];
}

export function sjhHotspots(x: { gym: number; education: number; sjh: number; computing: number; lawn: number; mgn: number }): Hotspot[] {
  return [
    wayTo('gym', x.gym, 'Pumunta sa gym', 'gym', 'sjh', 30),
    deadEnd('education', x.education, 'Tingnan ang pinto', '"SCHOOL OF EDUCATION" at "SCHOOL OF ARTS AND SCIENCES." Sarado pa ang pinto.'),
    closedDoor('sjh', x.sjh, BUILDINGS.sjh),
    {
      id: 'computing',
      x: x.computing,
      range: 22,
      label: 'Basahin ang karatula',
      height: 60,
      use: (g) =>
        g.say([
          { who: '', text: '"SCHOOL OF COMPUTING." Nasa St. Joseph Hall pala ang Dean\'s Office.' },
          { who: '', text: 'May papel na nakadikit: "Inaayos pa ang loob. Balik ka sa susunod."' },
          { who: 'you', text: 'Malapit na. Konting hintay na lang.' },
        ]),
    },
    wayTo('lawn', x.lawn, 'Pumunta sa chapel lawn', 'lawn', 'sjh', 30),
    closedDoor('mgn', x.mgn, BUILDINGS.mgn),
  ];
}

export function gymHotspots(x: { aps: number; court: number; formation: number; side: number; gymLeft: number; gymRight: number; sjh: number; annex: number }): Hotspot[] {
  return [
    wayTo('aps', x.aps, 'Pumunta sa APS', 'aps', 'gym'),
    wayTo('court', x.court, 'Pumasok sa Covered Court', 'ccourt', 'front', 40),
    closedDoor('formation', x.formation, BUILDINGS.formation, true),
    wayTo('side', x.side, 'Pumunta sa side entrance ng gym', 'gymside', 'lane', 30),
    wayTo('gymLeft', x.gymLeft, 'Pumasok sa gym (kaliwang pinto)', 'gymcorridor', 'front', 50),
    wayTo('gymRight', x.gymRight, 'Pumasok sa gym', 'gymhall', 'front', 50),
    wayTo('sjh', x.sjh, 'Pumunta sa St. Joseph Hall', 'sjh', 'gym', 30),
    closedDoor('annex', x.annex, BUILDINGS.annex),
  ];
}

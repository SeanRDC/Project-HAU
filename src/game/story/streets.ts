// What you can press E on along the campus streets: the ways from one street
// to the next, and the doors of buildings that are not open yet. No one lives
// on these streets yet; the people come once the buildings have insides.
//
// Each function is given the x of everything by its scene, so nothing here
// knows where things are. Writers: change labels and lines freely.

import { BUILDINGS } from '../campus/plan';
import { Choice, GameApi, Hotspot, Line } from '../types';
import { closedDoor, deadEnd, wayTo } from './campus';

/**
 * A menu choice that costs `price` out of your baon, or tells you you are short.
 * `itemEn` is the item's name in English, when it isn't the same.
 */
export function buy(g: GameApi, item: string, price: number, lines: Line[], itemEn?: string): Choice {
  const text = `${item} (₱${price})`;
  const en = `${itemEn ?? item} (₱${price})`;
  if (g.pesos() < price) {
    return {
      text,
      en,
      then: [{ who: '', text: `Kinapa mo ang bulsa mo. ₱${g.pesos()} na lang ang natitira.`, en: `You check your pocket. Only ₱${g.pesos()} left.` }],
    };
  }
  const [first, ...rest] = lines;
  return { text, en, then: [{ ...first, pesos: -price, item, itemEn }, ...rest] };
}

export function laneHotspots(x: { halls: number; stl: number; sfj: number; entry: number; plaza: number }): Hotspot[] {
  return [
    wayTo('halls', x.halls, 'Pumunta sa back road', 'halls', 'lane', 50, 'Go to the back road'),
    closedDoor('sfj', x.sfj, BUILDINGS.sfj, true),
    closedDoor('stl', x.stl, BUILDINGS.stl),
    wayTo('entry', x.entry, 'Umakyat sa flagpole (side gate)', 'entry', 'stl', 30, 'Go up to the flagpole (side gate)'),
    wayTo('plaza', x.plaza, 'Pumunta sa rotunda', 'plaza', 'lane', 50, 'Go to the rotunda'),
  ];
}

export function hallsHotspots(x: {
  warehouse: number; food: number; lane: number; sgh: number; srh: number; smh: number; ggn: number; aps: number;
}): Hotspot[] {
  return [
    closedDoor('warehouse', x.warehouse, BUILDINGS.warehouse),
    {
      id: 'food',
      x: x.food,
      range: 30,
      label: 'Tingnan ang Yellow Food Court',
      labelEn: 'Look at the Yellow Food Court',
      height: 60,
      use: (g) => {
        const open = g.hour() >= 7 && g.hour() < 19;
        if (!open) {
          g.say([
            { who: '', text: '"YELLOW FOOD COURT." Building 6 sa campus map. Dilaw ang bubong, kaya \'yun na rin ang tawag.', en: '"YELLOW FOOD COURT." Building 6 on the campus map. The roof is yellow, hence the name.' },
            { who: '', text: 'Sarado na ang mga stall. Bukas ulit ng alas-siyete ng umaga.', en: 'The stalls are closed. They open again at seven in the morning.' },
            { who: 'you', text: 'Dito yata \'yung kwek-kwek na ipinangako ni Kath.', en: 'This must be where the kwek-kwek Kath promised me comes from.' },
          ]);
          return;
        }
        g.say([
          {
            who: '',
            text: g.raining()
              ? 'Siksikan sa Yellow Food Court, lahat sumilong sa ulan. Amoy prito at kanin.'
              : 'Yellow Food Court. Mahaba ang pila sa siomai, maikli sa palamig.',
            en: g.raining()
              ? 'The Yellow Food Court is packed, everyone sheltering from the rain. It smells of fried food and kanin.'
              : 'Yellow Food Court. A long line for siomai, a short one for palamig.',
            choices: [
              buy(g, 'Kwek-kwek', 25, [
                { who: '', text: 'Limang kwek-kwek sa stick, may suka na may sibuyas.', en: 'Five kwek-kwek on a stick, with suka and onions.' },
                { who: 'you', text: 'Mainit pa. Sulit.', en: 'Still hot. Worth it.' },
              ]),
              buy(g, 'Siomai rice', 55, [
                { who: '', text: 'Apat na siomai, kanin, toyo-kalamansi, at maraming chili garlic.', en: 'Four siomai, kanin, toyo-kalamansi, and lots of chili garlic.' },
                { who: 'you', text: 'Busog na ako hanggang uwian.', en: 'That\'ll keep me full till home time.' },
              ]),
              buy(g, 'Palamig', 15, [
                { who: '', text: 'Sago\'t gulaman sa plastic cup. Malamig, matamis.', en: 'Sago\'t gulaman in a plastic cup. Cold and sweet.' },
              ]),
              {
                text: 'May baon akong adobo.', en: 'I\'ve got adobo in my baon.',
                then: [{ who: 'you', text: 'Tipid muna. Sayang ang adobo ni Mama.', en: 'Better save my money. Can\'t let Mama\'s adobo go to waste.' }],
              },
            ],
          },
        ]);
      },
    },
    wayTo('lane', x.lane, 'Bumaba sa parking lane', 'lane', 'halls', 30, 'Go down to the parking lane'),
    closedDoor('sgh', x.sgh, BUILDINGS.sgh),
    closedDoor('srh', x.srh, BUILDINGS.srh),
    closedDoor('smh', x.smh, BUILDINGS.smh),
    closedDoor('ggn', x.ggn, BUILDINGS.ggn),
    wayTo('aps', x.aps, 'Dumiretso sa APS', 'aps', 'halls', 50, 'Carry on to APS'),
  ];
}

export function apsHotspots(x: { halls: number; canteen: number; lawn: number; aps: number; gym: number; sh: number }): Hotspot[] {
  return [
    wayTo('halls', x.halls, 'Bumalik sa back road', 'halls', 'aps', 50, 'Back to the back road'),
    wayTo('canteen', x.canteen, 'Pumasok sa canteen', 'canteen', 'front', 60, 'Go into the canteen'),
    wayTo('lawn', x.lawn, 'Pumunta sa chapel lawn', 'lawn', 'aps', 30, 'Go to the chapel lawn'),
    wayTo('aps', x.aps, 'Pumasok sa APS lobby', 'apslobby', 'front', 60, 'Go into the APS lobby'),
    wayTo('gym', x.gym, 'Pumunta sa covered court at gym', 'gym', 'aps', 30, 'Go to the covered court and gym'),
    // Sacred Heart is behind the canteen block, reached through the back of the canteen; this is just the stair tower's door
    deadEnd('tower', x.sh, 'Tingnan ang pinto', 'Ang pinto sa paanan ng hagdan ng APS. Naka-lock. May papel: "Sa canteen po ang daan papuntang Sacred Heart."', {
      label: 'Look at the door',
      text: 'The door at the foot of the APS stairs. Locked. A note says: "The way to Sacred Heart is through the canteen, please."',
    }),
  ];
}

export function lawnHotspots(x: { aps: number; walkway: number; chapel: number; sjh: number }): Hotspot[] {
  return [
    wayTo('aps', x.aps, 'Dumaan sa tabi ng APS', 'aps', 'lawn', 50, 'Go along APS'),
    wayTo('walkway', x.walkway, 'Bumalik sa walkway', 'walkway', 'lawn', 30, 'Back to the walkway'),
    {
      id: 'chapel',
      x: x.chapel,
      range: 34,
      label: 'Tingnan ang chapel',
      labelEn: 'Look at the chapel',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: '"CHAPEL OF THE HOLY GUARDIAN ANGEL." Bilog, puti, patong-patong na parang mga singsing, may krus sa tuktok.', en: '"CHAPEL OF THE HOLY GUARDIAN ANGEL." Round and white, stacked in layers like rings, with a cross on top.' },
          { who: '', text: 'Dito nakasentro ang buong campus. Kahit saan ka manggaling, dito ka rin dadaan.', en: 'The whole campus centers on this spot. Wherever you\'re coming from, you end up passing through here.' },
          { who: '', text: 'Sarado pa ang pinto. Tahimik sa loob.', en: 'The door is still closed. It\'s quiet inside.', set: 'saw_chapel' },
          { who: 'you', text: 'Babalik ako \'pag bukas na.', en: 'I\'ll come back when it\'s open.' },
        ]),
    },
    // going round from the chapel it is MGN first, then SJH
    wayTo('mgn', x.sjh, 'Pumunta sa MGN', 'mgn', 'lawn', 50, 'Go to MGN'),
  ];
}

export function sjhHotspots(x: { gym: number; education: number; sjh: number; computing: number; mgn: number }): Hotspot[] {
  return [
    wayTo('gym', x.gym, 'Pumunta sa gym', 'gym', 'sjh', 30, 'Go to the gym'),
    deadEnd('education', x.education, 'Tingnan ang pinto', '"SCHOOL OF EDUCATION" at "SCHOOL OF ARTS AND SCIENCES." Sarado pa ang pinto.', {
      label: 'Look at the door',
      text: '"SCHOOL OF EDUCATION" and "SCHOOL OF ARTS AND SCIENCES." The door is still closed.',
    }),
    closedDoor('sjh', x.sjh, BUILDINGS.sjh),
    {
      id: 'computing',
      x: x.computing,
      range: 22,
      label: 'Basahin ang karatula',
      labelEn: 'Read the sign',
      height: 60,
      use: (g) =>
        g.say([
          { who: '', text: '"SCHOOL OF COMPUTING." Nasa St. Joseph Hall pala ang Dean\'s Office.', en: '"SCHOOL OF COMPUTING." So the Dean\'s Office is in St. Joseph Hall.' },
          { who: '', text: 'May papel na nakadikit: "Inaayos pa ang loob. Balik ka sa susunod."', en: 'A sheet of paper is taped up: "Still fixing up the inside. Come back next time."' },
          { who: 'you', text: 'Malapit na. Konting hintay na lang.', en: 'Almost there. Just a little longer.' },
        ]),
    },
    wayTo('mgn', x.mgn, 'Pumunta sa MGN', 'mgn', 'sjh', 30, 'Go to MGN'),
  ];
}

/** The road along MGN, between SJH and the chapel lawn. */
export function mgnHotspots(x: { sjh: number; mgn: number; lawn: number }): Hotspot[] {
  return [
    wayTo('sjh', x.sjh, 'Pumunta sa St. Joseph Hall', 'sjh', 'mgn', 30, 'Go to St. Joseph Hall'),
    closedDoor('mgn', x.mgn, BUILDINGS.mgn),
    wayTo('lawn', x.lawn, 'Pumunta sa chapel lawn', 'lawn', 'mgn', 30, 'Go to the chapel lawn'),
  ];
}

export function gymHotspots(x: { aps: number; court: number; formation: number; side: number; gymLeft: number; gymRight: number; sjh: number; annex: number }): Hotspot[] {
  return [
    wayTo('aps', x.aps, 'Pumunta sa APS', 'aps', 'gym', 50, 'Go to APS'),
    wayTo('court', x.court, 'Pumasok sa Covered Court', 'ccourt', 'front', 40, 'Go into the Covered Court'),
    closedDoor('formation', x.formation, BUILDINGS.formation, true),
    wayTo('side', x.side, 'Pumunta sa side entrance ng gym', 'gymside', 'lane', 30, 'Go to the gym side entrance'),
    wayTo('gymLeft', x.gymLeft, 'Pumasok sa gym (kaliwang pinto)', 'gymcorridor', 'front', 50, 'Go into the gym (left door)'),
    wayTo('gymRight', x.gymRight, 'Pumasok sa gym', 'gymhall', 'front', 50, 'Go into the gym'),
    wayTo('sjh', x.sjh, 'Pumunta sa St. Joseph Hall', 'sjh', 'gym', 30, 'Go to St. Joseph Hall'),
    closedDoor('annex', x.annex, BUILDINGS.annex),
  ];
}

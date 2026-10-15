// The Covered Court beside the IH Gym, and the Aero Laboratory at its far
// end. Dialogue is Taglish with a bit of Kapampangan. Edit freely.

import { Hotspot, NpcDef } from '../types';
import { wayTo } from './campus';
import { JOMAR, PE_BOY, PE_GIRL } from './cast';

export function ccourtHotspots(x: { aero: number; volley: number; seal: number; bleachers: number; side: number; out: number }): Hotspot[] {
  return [
    wayTo('aero', x.aero, 'Pumasok sa Aero Laboratory', 'aerolab', 'door', 44, 'Go into the Aero Laboratory'),
    {
      id: 'volley',
      x: x.volley,
      range: 30,
      label: 'Tingnan ang volleyball court',
      labelEn: 'Look at the volleyball court',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: 'Pulang volleyball court, may net sa gitna at itim na poste sa magkabilang dulo. Sa likod, isa pang pulang court para sa badminton.', en: 'A red volleyball court, with a net across the middle and black posts at each end. Behind it, another red court for badminton.' },
          { who: '', text: 'Nakatayo ang hagdang aluminum sa tabi ng net: dito umuupo ang referee pag may laro.', en: 'An aluminum ladder stands by the net: that\'s where the referee sits during a game.' },
        ]),
    },
    {
      id: 'seal',
      x: x.seal,
      range: 34,
      label: 'Tingnan ang basketball court',
      labelEn: 'Look at the basketball court',
      height: 40,
      use: (g) =>
        g.say([
          { who: '', text: 'Maroon na basketball court, may seal na may pakpak sa gitna. Mataas ang bubong na bakal, at bukas ang mga gilid kaya pumapasok ang hangin.', en: 'A maroon basketball court with the winged seal in the center. The steel roof is high, and the sides are open, so the breeze comes through.' },
          { who: 'you', text: 'Mas presko pala dito kaysa sa IH.', en: 'It\'s actually cooler here than in the IH.', set: 'saw_ccourt' },
        ]),
    },
    {
      id: 'bleachers',
      x: x.bleachers,
      range: 30,
      label: 'Umupo sa bleachers',
      labelEn: 'Sit on the bleachers',
      height: 50,
      use: (g) =>
        g.say([
          { who: '', text: 'Umupo ka sandali sa bakal na bleachers. Malamig ang upuan kahit tanghali.', en: 'You sit for a moment on the steel bleachers. The seat is cool, even at midday.' },
          { who: '', text: 'Sa kabilang gilid ng daan, kita ang side entrance ng IH Gym at ang malaking canopy nito.', en: 'Across the way, you can see the IH Gym\'s side entrance and its big canopy.' },
          { who: 'you', text: 'Okay, tama na ang pahinga.', en: 'Okay, that\'s enough rest.' },
        ]),
    },
    wayTo('side', x.side, 'Lumabas papunta sa side entrance ng IH', 'gymside', 'court', 30, 'Go out to the IH side entrance'),
    wayTo('out', x.out, 'Lumabas sa gym lane', 'gym', 'court', 50, 'Go out to the gym lane'),
  ];
}

export function ccourtNpcs(x: { hoops: [number, number]; volley: [number, number]; bleachers: number }): NpcDef[] {
  return [
    {
      id: 'cc1',
      name: 'Dennis',
      look: { ...PE_BOY, skin: '#a87650' },
      x: x.hoops[0] + 40,
      facing: 1,
      wander: x.hoops,
      talk: () => [
        { who: 'cc1', face: 'happy', text: 'Tara, laro tayo! Kulang kami ng isa.', en: 'Come on, play with us! We\'re one short.' },
        { who: 'you', face: 'shy', text: 'Hindi ako marunong, eh.', en: 'I don\'t really know how to play.' },
        { who: 'cc1', text: 'Ayos lang, pang-PE lang naman \'to. Pero sige, next time.', en: 'That\'s fine, it\'s just for PE. But okay, next time.' },
      ],
    },
    {
      id: 'cc2',
      name: 'Joanna',
      look: { ...PE_GIRL, hairStyle: 'bun' },
      x: x.volley[0] + 40,
      facing: 1,
      wander: x.volley,
      talk: () => [
        { who: 'cc2', text: 'Volleyball practice namin dito tuwing hapon. Mainit sa IH pag walang aircon, kaya dito kami.', en: 'We have volleyball practice here every afternoon. The IH gets hot without aircon, so we come here.' },
        { who: 'cc2', face: 'happy', text: 'Tsaka pag nag-spike ka dito, rinig hanggang aero lab!', en: 'Plus, when you spike here, they can hear it all the way in the aero lab!' },
      ],
    },
    {
      id: 'cc3',
      name: 'Kiko',
      look: JOMAR,
      x: x.bleachers,
      depth: -12,
      facing: -1,
      talk: () => [
        { who: 'cc3', text: 'Hinihintay ko lang matapos \'yung PE class. Kami na sunod sa court.', en: 'I\'m just waiting for the PE class to finish. We\'re up next on the court.' },
        { who: 'cc3', text: 'Nakapasok ka na sa aero lab? May totoong eroplano sa loob. Sa dulo, sa may dilaw na gate.', en: 'Have you been inside the aero lab? There\'s a real airplane in there. At the far end, by the yellow gate.' },
      ],
    },
  ];
}

export function aeroHotspots(x: { door: number; angel: number; old: number; engines: number }): Hotspot[] {
  return [
    {
      id: 'angel',
      x: x.angel,
      range: 40,
      label: 'Tingnan ang ANGEL-1',
      labelEn: 'Look at ANGEL-1',
      height: 80,
      use: (g) =>
        g.say([
          { who: '', text: '"ANGEL-1." Isang orange na eroplano, mataas ang pakpak, nakapatong sa dilaw na patungan sa ilalim ng pakpak at buntot.', en: '"ANGEL-1." An orange high-wing plane, resting on yellow stands under its wings and tail.' },
          { who: '', text: 'Bukas ang takip ng makina sa harap. May mga estudyanteng naka-black na nakatingin sa papel, mukhang may checklist.', en: 'The engine cover at the front is open. Students in black are looking over a sheet of paper, probably a checklist.' },
          { who: 'you', face: 'surprised', text: 'Totoong eroplano talaga sa loob ng campus!', en: 'A real airplane, right here on campus!', set: 'saw_angel1' },
        ]),
    },
    {
      id: 'engines',
      x: x.engines,
      range: 40,
      label: 'Tingnan ang mga jet engine',
      labelEn: 'Look at the jet engines',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: 'Dalawang jet engine, nakabitin sa dilaw na bakal na frame. Kita ang mga blade sa bunganga ng isa.', en: 'Two jet engines, mounted on yellow steel frames. You can see the blades inside the mouth of one.' },
          { who: '', text: 'May nakasulat sa sahig: "DO NOT TOUCH WITHOUT INSTRUCTOR."', en: 'Written on the floor: "DO NOT TOUCH WITHOUT INSTRUCTOR."' },
        ]),
    },
    {
      id: 'old',
      x: x.old,
      range: 34,
      label: 'Tingnan ang lumang eroplano',
      labelEn: 'Look at the old plane',
      height: 70,
      use: (g) => g.say([{ who: '', text: 'Isang mas lumang eroplano, kulay maroon ang pakpak. Wala na ang ibang bahagi: dito nag-aaral ang mga estudyante kung paano ito binubuo.', en: 'An older plane with maroon wings. Some of its parts are missing: this is where students learn how it all fits together.' }]),
    },
    wayTo('door', x.door, 'Bumalik sa covered court', 'ccourt', 'aero', 50, 'Back to the covered court'),
  ];
}

export function aeroNpcs(x: { students: [number, number]; instructor: number }): NpcDef[] {
  const black = { ...PE_BOY, top: '#1c1c22', bottom: '#2a3048' };
  return [
    {
      id: 'aero1',
      name: 'Lance',
      look: black,
      x: x.students[0],
      facing: 1,
      wander: x.students,
      talk: (g) =>
        g.has('met_lance')
          ? [{ who: 'aero1', text: 'Tsine-check pa namin ang spark plugs. Mamaya, propeller naman.', en: 'We\'re still checking the spark plugs. The propeller\'s next.' }]
          : [
              { who: 'aero1', face: 'happy', text: 'Uy, bisita! Aeronautical engineering kami. Dito ang lab namin.', en: 'Hey, a visitor! We\'re aeronautical engineering. This is our lab.' },
              { who: 'you', text: 'Lumilipad pa ba \'yang ANGEL-1?', en: 'Does ANGEL-1 still fly?' },
              { who: 'aero1', face: 'smug', text: 'Hindi na. Pero gumagana pa ang makina. Pag in-start namin, umuuga ang buong covered court.', en: 'Not anymore. But the engine still runs. When we start it up, the whole covered court shakes.', set: 'met_lance' },
            ],
    },
    {
      id: 'aero2',
      name: 'Engr. Dizon',
      look: { ...black, hairStyle: 'cap', top: '#2f4a6a', height: 1 },
      x: x.instructor,
      depth: -8,
      facing: 1,
      talk: () => [
        { who: 'aero2', text: 'Bawal humawak sa mga makina nang walang kasama, ha. Tingin lang.', en: 'No touching the engines without someone with you, okay? Looking only.' },
        { who: 'you', face: 'shy', text: 'Opo, Engineer.', en: 'Yes, Engineer.' },
      ],
    },
  ];
}

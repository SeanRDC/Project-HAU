// The Covered Court beside the IH Gym, and the Aero Laboratory at its far
// end. Dialogue is Taglish with a bit of Kapampangan. Edit freely.

import { Hotspot, NpcDef } from '../types';
import { wayTo } from './campus';
import { JOMAR, PE_BOY, PE_GIRL } from './cast';

export function ccourtHotspots(x: { aero: number; volley: number; seal: number; bleachers: number; side: number; out: number }): Hotspot[] {
  return [
    wayTo('aero', x.aero, 'Pumasok sa Aero Laboratory', 'aerolab', 'door', 44),
    {
      id: 'volley',
      x: x.volley,
      range: 30,
      label: 'Tingnan ang volleyball court',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: 'Pulang volleyball court, may net sa gitna at itim na poste sa magkabilang dulo. Sa likod, isa pang pulang court para sa badminton.' },
          { who: '', text: 'Nakatayo ang hagdang aluminum sa tabi ng net: dito umuupo ang referee pag may laro.' },
        ]),
    },
    {
      id: 'seal',
      x: x.seal,
      range: 34,
      label: 'Tingnan ang basketball court',
      height: 40,
      use: (g) =>
        g.say([
          { who: '', text: 'Maroon na basketball court, may seal na may pakpak sa gitna. Mataas ang bubong na bakal, at bukas ang mga gilid kaya pumapasok ang hangin.' },
          { who: 'you', text: 'Mas presko pala dito kaysa sa IH.', set: 'saw_ccourt' },
        ]),
    },
    {
      id: 'bleachers',
      x: x.bleachers,
      range: 30,
      label: 'Umupo sa bleachers',
      height: 50,
      use: (g) =>
        g.say([
          { who: '', text: 'Umupo ka sandali sa bakal na bleachers. Malamig ang upuan kahit tanghali.' },
          { who: '', text: 'Sa kabilang gilid ng daan, kita ang side entrance ng IH Gym at ang malaking canopy nito.' },
          { who: 'you', text: 'Okay, tama na ang pahinga.' },
        ]),
    },
    wayTo('side', x.side, 'Lumabas papunta sa side entrance ng IH', 'gymside', 'court', 30),
    wayTo('out', x.out, 'Lumabas sa gym lane', 'gym', 'court', 50),
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
        { who: 'cc1', face: 'happy', text: 'Tara, laro tayo! Kulang kami ng isa.' },
        { who: 'you', face: 'shy', text: 'Hindi ako marunong, eh.' },
        { who: 'cc1', text: 'Ayos lang, pang-PE lang naman \'to. Pero sige, next time.' },
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
        { who: 'cc2', text: 'Volleyball practice namin dito tuwing hapon. Mainit sa IH pag walang aircon, kaya dito kami.' },
        { who: 'cc2', face: 'happy', text: 'Tsaka pag nag-spike ka dito, rinig hanggang aero lab!' },
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
        { who: 'cc3', text: 'Hinihintay ko lang matapos \'yung PE class. Kami na sunod sa court.' },
        { who: 'cc3', text: 'Nakapasok ka na sa aero lab? May totoong eroplano sa loob. Sa dulo, sa may dilaw na gate.' },
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
      height: 80,
      use: (g) =>
        g.say([
          { who: '', text: '"ANGEL-1." Isang orange na eroplano, mataas ang pakpak, nakapatong sa dilaw na patungan sa ilalim ng pakpak at buntot.' },
          { who: '', text: 'Bukas ang takip ng makina sa harap. May mga estudyanteng naka-black na nakatingin sa papel, mukhang may checklist.' },
          { who: 'you', face: 'surprised', text: 'Totoong eroplano talaga sa loob ng campus!', set: 'saw_angel1' },
        ]),
    },
    {
      id: 'engines',
      x: x.engines,
      range: 40,
      label: 'Tingnan ang mga jet engine',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: 'Dalawang jet engine, nakabitin sa dilaw na bakal na frame. Kita ang mga blade sa bunganga ng isa.' },
          { who: '', text: 'May nakasulat sa sahig: "DO NOT TOUCH WITHOUT INSTRUCTOR."' },
        ]),
    },
    {
      id: 'old',
      x: x.old,
      range: 34,
      label: 'Tingnan ang lumang eroplano',
      height: 70,
      use: (g) => g.say([{ who: '', text: 'Isang mas lumang eroplano, kulay maroon ang pakpak. Wala na ang ibang bahagi: dito nag-aaral ang mga estudyante kung paano ito binubuo.' }]),
    },
    wayTo('door', x.door, 'Bumalik sa covered court', 'ccourt', 'aero', 50),
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
          ? [{ who: 'aero1', text: 'Tsine-check pa namin ang spark plugs. Mamaya, propeller naman.' }]
          : [
              { who: 'aero1', face: 'happy', text: 'Uy, bisita! Aeronautical engineering kami. Dito ang lab namin.' },
              { who: 'you', text: 'Lumilipad pa ba \'yang ANGEL-1?' },
              { who: 'aero1', face: 'smug', text: 'Hindi na. Pero gumagana pa ang makina. Pag in-start namin, umuuga ang buong covered court.', set: 'met_lance' },
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
        { who: 'aero2', text: 'Bawal humawak sa mga makina nang walang kasama, ha. Tingin lang.' },
        { who: 'you', face: 'shy', text: 'Opo, Engineer.' },
      ],
    },
  ];
}

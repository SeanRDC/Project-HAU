// The Immaculate Heart Gymnasium: its side entrance, the lobby and corridor on
// the ground floor, the court, the stage and the bleachers on the second floor.
// How they join: the front's left door leads into the corridor past the
// equipment room and the stairs, which comes out in the lobby inside the side
// entrance; the lobby's gates open on the court; the front's right door comes
// straight onto the court; the stage is at the far end from the side entrance.
// Dialogue is Taglish with a bit of Kapampangan. Edit freely.

import { BUILDINGS } from '../campus/plan';
import { Hotspot, NpcDef, Step } from '../types';
import { closedDoor, wayTo } from './campus';
import { COACH, JOMAR, PE_BOY, PE_GIRL } from './cast';

// --- outside: the side entrance -----------------------------------------------------

export function gymSideHotspots(x: { door: number; lane: number; annex: number; court: number }): Hotspot[] {
  return [
    wayTo('court', x.court, 'Pumasok sa Covered Court', 'ccourt', 'side', 30),
    closedDoor('annex', x.annex, BUILDINGS.annex),
    {
      id: 'canopy',
      x: x.door - 56,
      range: 22,
      label: 'Tingnan ang gym',
      height: 90,
      use: (g) =>
        g.say([
          { who: '', text: '"IMMACULATE HEART GYMNASIUM." Building 20 sa campus map. Dito ginaganap ang mga malalaking event ng HAU.' },
          { who: '', text: 'Sa ilalim ng malaking canopy, nakaupo sa sahig ang isang PE class, nagpapahinga bago bumalik sa loob.' },
        ]),
    },
    wayTo('enter', x.door, 'Pumasok sa side entrance', 'gymlobby', 'side', 40),
    wayTo('lane', x.lane, 'Bumalik sa harap ng gym', 'gym', 'side'),
  ];
}

export function gymSideNpcs(x: { door: number }): NpcDef[] {
  return [
    {
      id: 'pe1',
      name: 'Rica',
      look: PE_GIRL,
      x: x.door - 34,
      depth: -6,
      facing: 1,
      talk: (g) =>
        g.hour() < 17
          ? [
              { who: 'pe1', face: 'worried', text: 'Grabe, pinatakbo kami ng sampung ikot sa court. Pahinga muna.' },
              { who: 'you', text: 'Sa loob kayo nag-PE?' },
              { who: 'pe1', text: 'Oo, sa IH. Kasya nga ang tatlong section sa court, eh.' },
            ]
          : [{ who: 'pe1', text: 'Tapos na PE namin. Hinihintay ko lang sundo ko.' }],
    },
    {
      id: 'pe2',
      name: 'Paolo',
      look: PE_BOY,
      x: x.door + 30,
      depth: -4,
      facing: -1,
      wander: [x.door + 10, x.door + 60],
      talk: () => [
        { who: 'pe2', text: 'Freshie ka? Dito sa gym ang mga assembly at ang welcome program.' },
        { who: 'pe2', face: 'happy', text: 'Pag may event, puno \'yang bleachers hanggang taas. Ang ingay!' },
      ],
    },
  ];
}

// --- the ground floor -----------------------------------------------------------------

/** The stairs in the corridor: where their foot is, the far end of their climb, and how far up the screen it goes. */
export interface Climb {
  foot: number;
  top: number;
  rise: number;
}

/** Up the stairs from the corridor to the second floor. */
function goUp(c: Climb): Step[] {
  return [
    { walk: c.foot },
    { face: 'you', dir: -1 },
    { walkIn: 'you', to: c.top, rise: c.rise, time: 2.2 },
    { run: (g) => g.travel('gymupper', 'stairs') },
  ];
}

/** Coming down the stairs into the corridor. */
export function comeDown(c: Climb): Step[] {
  return [{ walkOut: 'you', from: c.top, rise: c.rise, time: 2 }];
}

export function gymCorridorHotspots(x: { lobby: number; equipment: number; door: number }, climb: Climb): Hotspot[] {
  return [
    wayTo('lobby', x.lobby, 'Pumunta sa lobby', 'gymlobby', 'corridor'),
    {
      id: 'equipment',
      x: x.equipment,
      range: 30,
      label: 'Humiram sa equipment room',
      height: 50,
      use: (g) =>
        g.say(
          g.has('saw_equipment')
            ? [{ who: '', text: 'Sarado na ang bintana. May nakasulat: "Isauli ang hiniram bago mag-5:00."' }]
            : [
                { who: '', text: 'Ang equipment room. Sa likod ng grille, mga istante ng bola: basketball, volleyball, at mga raketa ng badminton.' },
                { who: '', text: 'May papel sa bintana: "ID MUNA BAGO HIRAM. Isauli bago mag-5:00."' },
                { who: 'you', text: 'Wala pa akong PE ngayon. Next time na lang.', set: 'saw_equipment' },
              ],
        ),
    },
    {
      id: 'stairs',
      x: climb.foot,
      range: 22,
      label: 'Umakyat sa second floor',
      height: 60,
      use: (g) => g.play(goUp(climb)),
    },
    wayTo('out', x.door, 'Lumabas ng gym', 'gym', 'gymLeft', 50),
  ];
}

export function gymLobbyHotspots(x: { side: number; court: number; corridor: number; tables: number }): Hotspot[] {
  return [
    {
      id: 'tables',
      x: x.tables,
      range: 24,
      label: 'Tingnan ang mga mesa',
      height: 60,
      use: (g) =>
        g.say([
          { who: '', text: 'Mga nakatiklop na mesa ng table tennis, nakasandal sa grille. "JOOLA."' },
          { who: '', text: 'Sa tabi, isang pulang lift na ginagamit sa pagpapalit ng ilaw sa kisame ng gym.' },
        ]),
    },
    wayTo('side', x.side, 'Lumabas sa side entrance', 'gymside', 'lobby', 40),
    wayTo('court', x.court, 'Pumasok sa court', 'gymhall', 'lobby', 60),
    wayTo('corridor', x.corridor, 'Pumunta sa corridor', 'gymcorridor', 'lobby'),
  ];
}

export function gymLobbyNpcs(x: { kid: number }): NpcDef[] {
  return [
    {
      id: 'migo',
      name: 'Migo',
      look: { ...PE_BOY, skin: '#c99468', height: -1 },
      x: x.kid,
      facing: 1,
      wander: [x.kid - 20, x.kid + 60],
      talk: () => [
        { who: 'migo', face: 'happy', text: 'Uy! Hinihintay ko lang \'yung tropa ko, laro raw kami sa court pag-alis ng PE class.' },
        { who: 'migo', text: 'Sa equipment room ka humiram ng bola. Diyan sa corridor, sa may hagdan.' },
      ],
    },
  ];
}

// --- the court, the stage, the bleachers -------------------------------------------------

export function gymHallHotspots(x: { lobby: number; seal: number; door: number; stage: number; hoop: number }): Hotspot[] {
  return [
    wayTo('lobby', x.lobby, 'Pumunta sa lobby', 'gymlobby', 'court', 50),
    {
      id: 'seal',
      x: x.seal,
      range: 30,
      label: 'Tingnan ang court',
      height: 40,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang court ng IH Gym: kulay abo at pula, at sa gitna, ang seal ng Holy Angel University sa loob ng dilaw na bilog.' },
          { who: '', text: 'Sa itaas, daan-daang pula, dilaw at kulay-kapeng panel ang nakasabit sa bubong, para hindi umalingawngaw ang ingay.' },
          { who: 'you', text: 'Ang laki pala sa loob. Parang kasya ang buong batch dito.', set: 'saw_gym' },
        ]),
    },
    {
      id: 'hoop',
      x: x.hoop,
      range: 22,
      label: 'Tingnan ang ring',
      height: 90,
      use: (g) => g.say([{ who: '', text: 'Portable na ring, nakapatong sa asul na base. Pwedeng igulong pag may program sa stage.' }]),
    },
    wayTo('door', x.door, 'Lumabas sa pinto sa harap', 'gym', 'gymRight', 30),
    wayTo('stage', x.stage, 'Pumunta sa stage', 'gymstage', 'court', 40),
  ];
}

export function gymHallNpcs(x: { shooter: [number, number]; coach: number; class: number }): NpcDef[] {
  return [
    {
      id: 'jomar',
      name: 'Jomar',
      look: JOMAR,
      x: x.shooter[0],
      facing: 1,
      wander: x.shooter,
      talk: (g) =>
        g.has('met_jomar')
          ? [{ who: 'jomar', text: 'Pang-dalawampu na \'to. Isa pang shoot!' }]
          : [
              { who: 'jomar', face: 'happy', text: 'Free throw lang ako habang wala pang gumagamit ng court.' },
              { who: 'you', text: 'Varsity ka?' },
              { who: 'jomar', face: 'smug', text: 'Hindi pa. Try-out next week. Kaya nga ako nandito araw-araw.', set: 'met_jomar' },
            ],
    },
    {
      id: 'coach',
      name: 'Coach Gab',
      look: COACH,
      x: x.coach,
      depth: -6,
      facing: 1,
      talk: (g) => [
        { who: 'coach', text: g.hour() < 17 ? 'O, hindi ka sa section na \'to, \'di ba? Bawal ang sapatos na pang-labas sa court, ha.' : 'Tapos na ang klase. Isara mo na lang ang gate paglabas mo.' },
        { who: 'you', face: 'shy', text: 'Opo, Coach. Dadaan lang po.' },
      ],
    },
    {
      id: 'pe3',
      name: 'Bianca',
      look: PE_GIRL,
      x: x.class,
      depth: -10,
      facing: -1,
      talk: () => [{ who: 'pe3', face: 'worried', text: 'Shh, nagbibilang si Coach. Pag nahuli ka sa attendance, ikot ka ng court.' }],
    },
  ];
}

export function gymStageHotspots(x: { court: number; banner: number; stairs: number; drums: number }): Hotspot[] {
  return [
    wayTo('court', x.court, 'Bumalik sa court', 'gymhall', 'stage', 50),
    {
      id: 'drums',
      x: x.drums,
      range: 24,
      label: 'Tingnan ang drums',
      height: 80,
      use: (g) => g.say([{ who: '', text: 'Naka-set up na ang drum set ng banda sa stage. Mukhang may program na darating.' }]),
    },
    {
      id: 'banner',
      x: x.banner,
      range: 40,
      label: 'Tingnan ang stage',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: '"WELCOME ANGELITES." Nakasabit ang banner sa harap ng stage, sa ilalim ng malaking LED screen.' },
          { who: '', text: 'Sa likod, dalawang hanay ng matataas na bintana. Sa magkabilang pader, malalaking panel na may guhit na dilaw, pula at abo.' },
          { who: 'you', face: 'happy', text: 'Dito siguro gaganapin ang welcome program namin.', set: 'saw_stage' },
        ]),
    },
    wayTo('stairs', x.stairs, 'Umakyat sa bleachers', 'gymupper', 'stage', 60),
  ];
}

export function gymUpperHotspots(x: { down: number; view: number; stage: number }): Hotspot[] {
  return [
    wayTo('down', x.down, 'Bumaba sa hagdan', 'gymcorridor', 'upstairs', 40),
    {
      id: 'view',
      x: x.view,
      range: 40,
      label: 'Tumingin sa court',
      height: 50,
      use: (g) =>
        g.say([
          { who: '', text: 'Mula sa second floor, kita ang buong court: ang seal sa gitna, ang mga ring, at ang stage sa dulo.' },
          { who: '', text: 'Bakal na bleachers sa magkabilang gilid. Sa likod ng mga upuan sa kabila, ang matataas na bintana na pinapasukan ng araw.' },
          { who: 'you', text: 'Pag puno \'to, siguradong ang ingay.' },
        ]),
    },
    wayTo('stage', x.stage, 'Bumaba papunta sa stage', 'gymstage', 'upper', 40),
  ];
}

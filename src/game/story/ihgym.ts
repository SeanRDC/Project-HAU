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
    wayTo('court', x.court, 'Pumasok sa Covered Court', 'ccourt', 'side', 30, 'Go into the Covered Court'),
    closedDoor('annex', x.annex, BUILDINGS.annex),
    {
      id: 'canopy',
      x: x.door - 56,
      range: 22,
      label: 'Tingnan ang gym',
      labelEn: 'Look at the gym',
      height: 90,
      use: (g) =>
        g.say([
          { who: '', text: '"IMMACULATE HEART GYMNASIUM." Building 20 sa campus map. Dito ginaganap ang mga malalaking event ng HAU.', en: '"IMMACULATE HEART GYMNASIUM." Building 20 on the campus map. This is where HAU holds its big events.' },
          { who: '', text: 'Sa ilalim ng malaking canopy, nakaupo sa sahig ang isang PE class, nagpapahinga bago bumalik sa loob.', en: 'Under the big canopy, a PE class sits on the floor, resting before heading back inside.' },
        ]),
    },
    wayTo('enter', x.door, 'Pumasok sa side entrance', 'gymlobby', 'side', 40, 'Go in the side entrance'),
    wayTo('lane', x.lane, 'Bumalik sa harap ng gym', 'gym', 'side', 50, 'Back to the front of the gym'),
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
              { who: 'pe1', face: 'worried', text: 'Grabe, pinatakbo kami ng sampung ikot sa court. Pahinga muna.', en: 'Man, they made us run ten laps around the court. Taking a break.' },
              { who: 'you', text: 'Sa loob kayo nag-PE?', en: 'You had PE inside?' },
              { who: 'pe1', text: 'Oo, sa IH. Kasya nga ang tatlong section sa court, eh.', en: 'Yeah, in the IH. Three whole sections fit on the court.' },
            ]
          : [{ who: 'pe1', text: 'Tapos na PE namin. Hinihintay ko lang sundo ko.', en: 'Our PE\'s done. I\'m just waiting for my ride.' }],
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
        { who: 'pe2', text: 'Freshie ka? Dito sa gym ang mga assembly at ang welcome program.', en: 'You a freshie? The assemblies and the welcome program are here in the gym.' },
        { who: 'pe2', face: 'happy', text: 'Pag may event, puno \'yang bleachers hanggang taas. Ang ingay!', en: 'When there\'s an event, those bleachers fill all the way to the top. It gets so loud!' },
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
    wayTo('lobby', x.lobby, 'Pumunta sa lobby', 'gymlobby', 'corridor', 50, 'Go to the lobby'),
    {
      id: 'equipment',
      x: x.equipment,
      range: 30,
      label: 'Humiram sa equipment room',
      labelEn: 'Borrow from the equipment room',
      height: 50,
      use: (g) =>
        g.say(
          g.has('saw_equipment')
            ? [{ who: '', text: 'Sarado na ang bintana. May nakasulat: "Isauli ang hiniram bago mag-5:00."', en: 'The window is closed. A note says: "Return borrowed items before 5:00."' }]
            : [
                { who: '', text: 'Ang equipment room. Sa likod ng grille, mga istante ng bola: basketball, volleyball, at mga raketa ng badminton.', en: 'The equipment room. Behind the grille, shelves of balls: basketballs, volleyballs, and badminton rackets.' },
                { who: '', text: 'May papel sa bintana: "ID MUNA BAGO HIRAM. Isauli bago mag-5:00."', en: 'A sheet on the window: "ID FIRST BEFORE BORROWING. Return before 5:00."' },
                { who: 'you', text: 'Wala pa akong PE ngayon. Next time na lang.', en: 'I don\'t have PE today. Next time.', set: 'saw_equipment' },
              ],
        ),
    },
    {
      id: 'stairs',
      x: climb.foot,
      range: 22,
      label: 'Umakyat sa second floor',
      labelEn: 'Go up to the second floor',
      height: 60,
      use: (g) => g.play(goUp(climb)),
    },
    wayTo('out', x.door, 'Lumabas ng gym', 'gym', 'gymLeft', 50, 'Leave the gym'),
  ];
}

export function gymLobbyHotspots(x: { side: number; court: number; corridor: number; tables: number }): Hotspot[] {
  return [
    {
      id: 'tables',
      x: x.tables,
      range: 24,
      label: 'Tingnan ang mga mesa',
      labelEn: 'Look at the tables',
      height: 60,
      use: (g) =>
        g.say([
          { who: '', text: 'Mga nakatiklop na mesa ng table tennis, nakasandal sa grille. "JOOLA."', en: 'Folded table tennis tables, leaning against the grille. "JOOLA."' },
          { who: '', text: 'Sa tabi, isang pulang lift na ginagamit sa pagpapalit ng ilaw sa kisame ng gym.', en: 'Beside them, a red lift they use to change the lights in the gym\'s ceiling.' },
        ]),
    },
    wayTo('side', x.side, 'Lumabas sa side entrance', 'gymside', 'lobby', 40, 'Go out the side entrance'),
    wayTo('court', x.court, 'Pumasok sa court', 'gymhall', 'lobby', 60, 'Go onto the court'),
    wayTo('corridor', x.corridor, 'Pumunta sa corridor', 'gymcorridor', 'lobby', 50, 'Go to the corridor'),
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
        { who: 'migo', face: 'happy', text: 'Uy! Hinihintay ko lang \'yung tropa ko, laro raw kami sa court pag-alis ng PE class.', en: 'Hey! I\'m just waiting for my crew. We\'re playing on the court once the PE class leaves.' },
        { who: 'migo', text: 'Sa equipment room ka humiram ng bola. Diyan sa corridor, sa may hagdan.', en: 'You can borrow a ball from the equipment room. It\'s in the corridor, by the stairs.' },
      ],
    },
  ];
}

// --- the court, the stage, the bleachers -------------------------------------------------

export function gymHallHotspots(x: { lobby: number; seal: number; door: number; stage: number; hoop: number }): Hotspot[] {
  return [
    wayTo('lobby', x.lobby, 'Pumunta sa lobby', 'gymlobby', 'court', 50, 'Go to the lobby'),
    {
      id: 'seal',
      x: x.seal,
      range: 30,
      label: 'Tingnan ang court',
      labelEn: 'Look at the court',
      height: 40,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang court ng IH Gym: kulay abo at pula, at sa gitna, ang seal ng Holy Angel University sa loob ng dilaw na bilog.', en: 'The IH Gym\'s court: gray and red, with the Holy Angel University seal inside a yellow circle at center court.' },
          { who: '', text: 'Sa itaas, daan-daang pula, dilaw at kulay-kapeng panel ang nakasabit sa bubong, para hindi umalingawngaw ang ingay.', en: 'Overhead, hundreds of red, yellow and brown panels hang from the roof to keep the noise from echoing.' },
          { who: 'you', text: 'Ang laki pala sa loob. Parang kasya ang buong batch dito.', en: 'It\'s huge inside. Our whole batch could probably fit in here.', set: 'saw_gym' },
        ]),
    },
    {
      id: 'hoop',
      x: x.hoop,
      range: 22,
      label: 'Tingnan ang ring',
      labelEn: 'Look at the hoop',
      height: 90,
      use: (g) => g.say([{ who: '', text: 'Portable na ring, nakapatong sa asul na base. Pwedeng igulong pag may program sa stage.', en: 'A portable hoop on a blue base. It can be rolled away when there\'s a program on the stage.' }]),
    },
    wayTo('door', x.door, 'Lumabas sa pinto sa harap', 'gym', 'gymRight', 30, 'Go out the front door'),
    wayTo('stage', x.stage, 'Pumunta sa stage', 'gymstage', 'court', 40, 'Go to the stage'),
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
          ? [{ who: 'jomar', text: 'Pang-dalawampu na \'to. Isa pang shoot!', en: 'That\'s twenty. One more shot!' }]
          : [
              { who: 'jomar', face: 'happy', text: 'Free throw lang ako habang wala pang gumagamit ng court.', en: 'Just shooting free throws while nobody\'s using the court.' },
              { who: 'you', text: 'Varsity ka?', en: 'Are you on varsity?' },
              { who: 'jomar', face: 'smug', text: 'Hindi pa. Try-out next week. Kaya nga ako nandito araw-araw.', en: 'Not yet. Tryouts are next week. That\'s why I\'m here every day.', set: 'met_jomar' },
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
        { who: 'coach', text: g.hour() < 17 ? 'O, hindi ka sa section na \'to, \'di ba? Bawal ang sapatos na pang-labas sa court, ha.' : 'Tapos na ang klase. Isara mo na lang ang gate paglabas mo.',
          en: g.hour() < 17 ? 'Hey, you\'re not in this section, are you? No outdoor shoes on the court, okay?' : 'Class is over. Just close the gate on your way out.' },
        { who: 'you', face: 'shy', text: 'Opo, Coach. Dadaan lang po.', en: 'Yes, Coach. I\'m just passing through.' },
      ],
    },
    {
      id: 'pe3',
      name: 'Bianca',
      look: PE_GIRL,
      x: x.class,
      depth: -10,
      facing: -1,
      talk: () => [{ who: 'pe3', face: 'worried', text: 'Shh, nagbibilang si Coach. Pag nahuli ka sa attendance, ikot ka ng court.', en: 'Shh, Coach is taking attendance. If you\'re late, you run a lap around the court.' }],
    },
  ];
}

export function gymStageHotspots(x: { court: number; banner: number; stairs: number; drums: number }): Hotspot[] {
  return [
    wayTo('court', x.court, 'Bumalik sa court', 'gymhall', 'stage', 50, 'Back to the court'),
    {
      id: 'drums',
      x: x.drums,
      range: 24,
      label: 'Tingnan ang drums',
      labelEn: 'Look at the drums',
      height: 80,
      use: (g) => g.say([{ who: '', text: 'Naka-set up na ang drum set ng banda sa stage. Mukhang may program na darating.', en: 'The band\'s drum set is already set up on the stage. Looks like there\'s a program coming up.' }]),
    },
    {
      id: 'banner',
      x: x.banner,
      range: 40,
      label: 'Tingnan ang stage',
      labelEn: 'Look at the stage',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: '"WELCOME ANGELITES." Nakasabit ang banner sa harap ng stage, sa ilalim ng malaking LED screen.', en: '"WELCOME ANGELITES." The banner hangs across the front of the stage, below a big LED screen.' },
          { who: '', text: 'Sa likod, dalawang hanay ng matataas na bintana. Sa magkabilang pader, malalaking panel na may guhit na dilaw, pula at abo.', en: 'Behind it, two rows of tall windows. On both walls, big panels striped in yellow, red and gray.' },
          { who: 'you', face: 'happy', text: 'Dito siguro gaganapin ang welcome program namin.', en: 'This must be where our welcome program will be.', set: 'saw_stage' },
        ]),
    },
    wayTo('stairs', x.stairs, 'Umakyat sa bleachers', 'gymupper', 'stage', 60, 'Go up to the bleachers'),
  ];
}

export function gymUpperHotspots(x: { down: number; view: number; stage: number }): Hotspot[] {
  return [
    wayTo('down', x.down, 'Bumaba sa hagdan', 'gymcorridor', 'upstairs', 40, 'Go down the stairs'),
    {
      id: 'view',
      x: x.view,
      range: 40,
      label: 'Tumingin sa court',
      labelEn: 'Look down at the court',
      height: 50,
      use: (g) =>
        g.say([
          { who: '', text: 'Mula sa second floor, kita ang buong court: ang seal sa gitna, ang mga ring, at ang stage sa dulo.', en: 'From the second floor, you can see the whole court: the seal in the middle, the hoops, and the stage at the far end.' },
          { who: '', text: 'Bakal na bleachers sa magkabilang gilid. Sa likod ng mga upuan sa kabila, ang matataas na bintana na pinapasukan ng araw.', en: 'Steel bleachers on both sides. Behind the seats across the way, tall windows let in the sun.' },
          { who: 'you', text: 'Pag puno \'to, siguradong ang ingay.', en: 'When this place is full, it must get really loud.' },
        ]),
    },
    wayTo('stage', x.stage, 'Bumaba papunta sa stage', 'gymstage', 'upper', 40, 'Go down to the stage'),
  ];
}

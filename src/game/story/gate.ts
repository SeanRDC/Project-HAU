// The gate on Sto. Rosario St. Everyone gets their bag checked and taps
// their ID at the turnstile before they're let in, and comes out on the drive
// in front of the Main Building. Edit freely.

import { Hotspot, NpcDef, Step } from '../types';
import { ACTDO, ELLA, JOY, NONOY, TAHO } from './cast';

/** Where things stand in the scene, handed over by scenes/gate.ts. */
export interface GateSpots {
  street: number;
  arch: number;
  board: number;
  /** the way on to the Main Building */
  plaza: number;
  /** the path off to the Epiphany of Angels */
  park: number;
  /** the pickup parked at the kerb */
  pickup: number;
}

/** Where the people at the gate stand, handed over by scenes/gate.ts. */
export interface GatePeople {
  joy: number;
  nonoy: number;
  enforcer: number;
  /** the stretch of sidewalk the taho vendor works */
  taho: [number, number];
}

/** The checkpoint props the cutscenes can work, handed over by scenes/gate.ts. */
export interface Checkpoint {
  /** where you stand to tap your ID */
  scanner: number;
  /** where Ella is being checked when you walk up */
  tableA: number;
  /** where you get your own bag checked */
  tableB: number;
  /** where you stop on the sidewalk when you come up to the parked pickup */
  pickup: number;
  /** your bag on Kuya Nonoy's table */
  bag(state: 'none' | 'closed' | 'open'): void;
  reader(state: 'ok' | 'deny'): void;
  /** someone holding an ID up to the reader */
  card(show: boolean): void;
  /** hold the turnstile arm down so someone can walk through */
  hold(open: boolean): void;
  flashlight(on: boolean): void;
  /** from now on the arm drops whenever you walk up */
  unlock(): void;
}

function greeting(hour: number): string {
  if (hour < 12 && hour >= 4) return 'Magandang umaga';
  if (hour < 18) return 'Magandang hapon';
  return 'Magandang gabi';
}

/** Kuya Nonoy goes through your bag. Ends with the passed_bag_check flag. */
function bagCheck(cp: Checkpoint, hour: number): Step[] {
  return [
    { walk: cp.tableB + 28 },
    { face: 'you', dir: -1 },
    { face: 'nonoy', dir: 1 },
    {
      say: [
        { who: 'nonoy', text: `${greeting(hour)}! Bag check po tayo. Pakilapag lang dito sa mesa.` },
        { who: 'you', text: 'Sige po.' },
      ],
    },
    { look: { bag: undefined } },
    { run: () => cp.bag('closed') },
    { pause: 0.4 },
    { sound: 'zip' },
    { run: () => cp.bag('open') },
    { pause: 0.5 },
    { run: () => cp.flashlight(true) },
    { pause: 1.2 },
    {
      say: [
        { who: '', text: 'Binuksan ni Kuya Nonoy ang bag mo at sinilip gamit ang flashlight. Notebook, payong, charger, at baong kanin at adobo.' },
        {
          who: 'nonoy',
          text: 'May dala ka bang matulis? Cutter, gunting?',
          choices: [
            { text: 'Wala po.', then: [{ who: 'nonoy', text: 'Good.' }] },
            {
              text: 'Ballpen lang po.',
              then: [{ who: 'nonoy', text: 'Hahaha! Pwede \'yan. \'Yan nga ang pinaka-kailangan mo dito.' }],
            },
            {
              text: '\'Yung tinidor po sa baon ko?',
              then: [{ who: 'nonoy', text: '...Sige, pwede na rin. Basta pagkain lang ang tutusukin mo.' }],
            },
          ],
        },
        { who: 'nonoy', text: 'Okay, clear! Amoy adobo pa. Ingat, baka tumapon.' },
      ],
    },
    { run: () => cp.flashlight(false) },
    { sound: 'zip' },
    { run: () => cp.bag('closed') },
    { pause: 0.5 },
    { run: () => cp.bag('none') },
    { look: null },
    { say: [{ who: 'nonoy', text: 'I-tap mo na lang ID mo sa scanner diyan. Welcome sa Holy Angel!', set: 'passed_bag_check' }] },
    { face: 'you', dir: -1 },
  ];
}

/**
 * The first thing you meet on the way to the gate: a pickup parked under the
 * NO PARKING sign, half across the way in, and the city traffic enforcer
 * writing it a ticket.
 */
function parkedPickup(cp: Checkpoint): Step[] {
  return [
    { face: 'actdo', dir: 1 },
    { walk: cp.pickup },
    { face: 'you', dir: -1 },
    { pause: 0.5 },
    {
      say: [
        { who: '', text: 'Isang pulang Chevrolet pickup, nakasampa sa sidewalk, katabi mismo ng karatulang "NO PARKING". Halos harang na sa daanan papasok ng gate.' },
        { who: 'you', text: 'Seryoso? Dito pa talaga, sa tapat mismo ng gate? Saan dadaan ang mga tao?' },
        { who: 'actdo', text: 'Sa gilid ka muna dumaan. Tinitiketan ko na \'to.' },
        { who: 'you', text: 'Ang laki-laki ng sasakyan, tapos sa bawal pa pumarada. May parking naman sa loob!' },
        { who: 'actdo', text: 'Araw-araw \'yan. "Sandali lang po, may ihahatid lang." Isang oras na \'yang sandali niya.' },
        {
          who: 'you',
          text: '...',
          choices: [
            {
              text: 'Kami ngang naglalakad, pumipila.',
              then: [
                { who: 'you', text: 'Kami ngang naglalakad, pumipila at nagpapa-bag check. Sila, apat na ang gulong, ayaw pang sumunod.' },
                { who: 'actdo', text: 'Kaya nga may tiket. Illegal parking, obstruction. May babayaran siya pagbalik.' },
              ],
            },
            {
              text: 'Sana ma-tow na lang.',
              then: [
                { who: 'you', text: 'Sana i-tow n\'yo na lang po. Para matuto.' },
                { who: 'actdo', text: 'Parating na ang tow truck. Tiket muna, tapos hila. May proseso tayo.' },
              ],
            },
          ],
        },
        { who: 'actdo', text: 'Sige na, pumasok ka na. Baka ma-late ka pa dahil sa kanya.' },
        { who: 'you', text: 'Unang araw pa lang, may reklamo na agad ako. Welcome to college.', set: 'saw_ticket' },
      ],
    },
    { face: 'actdo', dir: 1 },
  ];
}

/**
 * Walking in from the street for the first time: past the parked pickup,
 * then in under the gatehouse, where Ella is just finishing at the next
 * table. She beeps through the turnstile, then it's your turn.
 */
export function gateArrival(cp: Checkpoint, hour: number): Step[] {
  return [
    { place: 'ella', x: cp.tableA + 26, facing: -1 },
    ...parkedPickup(cp),
    { walk: cp.tableB + 28 },
    {
      say: [
        { who: 'joy', text: 'Okay ka na. Next!' },
        { who: 'ella', text: 'Salamat po!' },
      ],
    },
    { walk: cp.scanner, who: 'ella' },
    { face: 'ella', dir: -1 },
    { run: () => cp.card(true) },
    { pause: 0.4 },
    { sound: 'beep' },
    { run: () => cp.reader('ok') },
    { pause: 0.2 },
    { run: () => cp.card(false) },
    { sound: 'turnstile' },
    { run: () => cp.hold(true) },
    { walk: 330, who: 'ella', together: true },
    { pause: 1.4 },
    { run: () => cp.hold(false) },
    ...bagCheck(cp, hour),
  ];
}

/** Pressing E at the reader. */
function tapId(cp: Checkpoint, g: { has(flag: string): boolean; hour(): number }): Step[] {
  if (!g.has('passed_bag_check')) {
    return [
      { say: [{ who: 'nonoy', text: 'Teka lang, boss! Bag check muna bago mag-tap.' }] },
      ...bagCheck(cp, g.hour()),
    ];
  }
  const tap: Step[] = [{ walk: cp.scanner }, { face: 'you', dir: -1 }, { run: () => cp.card(true) }, { pause: 0.5 }];
  if (g.has('scanned_id')) {
    return [...tap, { sound: 'beep' }, { run: () => cp.reader('ok') }, { pause: 0.3 }, { run: () => cp.card(false) }];
  }
  return [
    ...tap,
    { sound: 'buzz' },
    { run: () => cp.reader('deny') },
    { pause: 0.8 },
    { run: () => cp.card(false) },
    {
      say: [
        { who: '', text: 'Pula ang ilaw. Ayaw basahin.' },
        { who: 'you', text: 'Ha? Bakit?' },
        { who: 'joy', text: 'Tanggalin mo muna sa plastic case \'yung ID mo. Hindi nababasa \'pag nakabalot pa.' },
        { who: 'you', text: 'Ay, opo. Sorry po!', set: 'id_fumble' },
      ],
    },
    { pause: 0.4 },
    { run: () => cp.card(true) },
    { pause: 0.5 },
    { sound: 'beep' },
    { run: () => cp.reader('ok') },
    { run: () => cp.unlock() },
    { pause: 0.3 },
    { run: () => cp.card(false) },
    { sound: 'turnstile' },
    { run: (game) => game.set('scanned_id') },
    // out from under the gatehouse and past the big tree, on to the campus drive
    { walk: cp.scanner - 150 },
    { say: [{ who: 'you', text: 'Okay. Unang araw. Kaya ko \'to.' }] },
  ];
}

export function gateNpcs(at: GatePeople): NpcDef[] {
  return [
    {
      id: 'actdo',
      name: 'Enforcer Dante',
      look: ACTDO,
      x: at.enforcer,
      depth: -3,
      facing: 1,
      talk: (g) =>
        g.raining()
          ? [{ who: 'actdo', text: 'Umuulan na, hindi pa rin bumabalik ang may-ari. Basa na ang tiket niya, pero valid pa rin \'yan.' }]
          : [
              { who: 'actdo', text: 'ACTDO. Angeles City Traffic Development Office. Kami ang naniniket sa mga ganyan.' },
              { who: 'actdo', text: 'Sabihan mo mga kaklase mo: bawal pumarada sa tapat ng gate. Kahit sandali lang.' },
            ],
    },
    {
      id: 'nonoy',
      name: 'Kuya Nonoy',
      look: NONOY,
      x: at.nonoy,
      depth: -6,
      facing: 1,
      talk: (g) =>
        g.has('scanned_id')
          ? [
              { who: 'nonoy', text: g.hour() > 18 || g.hour() < 5 ? 'Pauwi ka na? Ingat sa tawid, maraming jeep.' : 'Oh, ikaw ulit. Wala nang bag check palabas, \'wag kang mag-alala.' },
            ]
          : [
              { who: 'nonoy', text: 'Bag check muna bago pumasok, boss. Kahit si Don Juan pa \'yan.' },
            ],
    },
    {
      id: 'joy',
      name: 'Ate Joy',
      look: JOY,
      x: at.joy,
      depth: -6,
      facing: 1,
      talk: (g) =>
        g.has('met_joy')
          ? [{ who: 'joy', text: 'Isuot mo \'yang ID mo ha. Lagi kaming nagro-roving.' }]
          : [
              { who: 'joy', text: 'Freshie? Kita ko sa mukha mo, kinakabahan ka pa.' },
              { who: 'joy', text: 'Tatlong taon na ako sa gate na \'to. Lahat ng freshman ganyan ang itsura sa unang araw.' },
              { who: 'you', text: 'Halata po pala.' },
              { who: 'joy', text: 'Okay lang \'yan. Pagdating ng finals, iba na \'yang kaba mo.', set: 'met_joy' },
            ],
    },
    {
      id: 'ella',
      name: 'Ella',
      look: ELLA,
      x: 300,
      depth: -8,
      facing: -1,
      wander: [250, 360],
      talk: (g) =>
        g.has('met_ella')
          ? [{ who: 'ella', text: 'Kung makita mo \'yung Accountancy building, sabihan mo \'ko ha.' }]
          : [
              ...(g.has('id_fumble')
                ? [
                    { who: 'ella', text: 'Uy, nakita kita sa pila kanina. \'Yung ID mo, ayaw mabasa, \'no?' },
                    { who: 'you', text: 'Naka-plastic pa kasi. Nakakahiya.' },
                    { who: 'ella', text: 'Ako nga, ilang beses ko tinap \'yung library card ko bago ko na-realize.' },
                  ]
                : [
                    { who: 'ella', text: 'Uy, freshie ka rin? Ang laki pala ng campus, \'no?' },
                    { who: 'you', text: 'Oo nga. Hindi ko pa alam kung saan pupunta.' },
                  ]),
              { who: 'ella', text: 'Ella nga pala. Freshie din. Kita tayo sa orientation!', set: 'met_ella' },
            ],
    },
    {
      id: 'taho',
      name: 'Manong Taho',
      look: TAHO,
      x: (at.taho[0] + at.taho[1]) / 2,
      depth: -4,
      facing: -1,
      wander: at.taho,
      talk: (g) => [
        {
          who: 'taho',
          text: g.raining()
            ? 'Tahooo! Mainit-init, bagay sa ulan. Bente lang!'
            : 'Tahooo! Bente lang, may sago pa. Pampagising bago klase!',
          choices: [
            {
              text: 'Sige po, isa.',
              then:
                g.pesos() >= 20
                  ? [
                      { who: '', text: 'Sinandok niya ang mainit na taho, binuhusan ng arnibal at sago.', pesos: -20, item: 'Taho' },
                      { who: 'you', text: 'Ang sarap. Parang elementary ulit.' },
                    ]
                  : [
                      { who: '', text: 'Kinapa mo ang bulsa mo. Kulang ang barya.' },
                      { who: 'taho', text: 'Ay, sige na. Bukas na lang, ha? Hindi ka naman tatakbo.' },
                    ],
            },
            {
              text: 'Mamaya na lang po.',
              then: [{ who: 'taho', text: 'Sige, nandito lang ako hanggang tanghali. Pag naubos, wala na!' }],
            },
          ],
        },
      ],
    },
  ];
}

export function gateHotspots(x: GateSpots, cp: Checkpoint): Hotspot[] {
  return [
    {
      id: 'scanner',
      x: cp.scanner,
      range: 16,
      label: 'I-tap ang ID',
      height: 46,
      use: (g) => g.play(tapId(cp, g)),
    },
    {
      id: 'plaza',
      x: x.plaza,
      range: 24,
      label: 'Pumasok papunta sa Main Building',
      height: 56,
      use: (g) => g.travel('plaza', 'start'),
    },
    {
      id: 'park',
      x: x.park,
      range: 22,
      label: 'Dumaan sa Epiphany of Angels',
      height: 56,
      use: (g) => g.travel('park', 'gate'),
    },
    {
      id: 'pickup',
      x: x.pickup,
      range: 24,
      label: 'Tingnan ang pickup',
      height: 44,
      use: (g) =>
        g.say([
          { who: '', text: 'Pulang Chevrolet, itim ang mags, may sticker pa ng putik sa pinto. Makintab, bagong hugas. May puting papel na nakaipit sa wiper.' },
          { who: 'you', text: g.has('scanned_id') ? 'Nandito pa rin. Ang tapang.' : 'Ang ganda ng sasakyan. Ang pangit ng parada.' },
        ]),
    },
    {
      id: 'board',
      x: x.board,
      range: 20,
      label: 'Basahin ang karatula',
      height: 66,
      use: (g) =>
        g.say([
          { who: '', text: '"NO ID, NO ENTRY." Malaki, pula, at hindi mo talaga mapapalampas.' },
          { who: 'you', text: 'Okay. Noted. Hindi ko na iiwan sa bahay.' },
        ]),
    },
    {
      id: 'arch',
      x: x.arch,
      range: 30,
      label: 'Tingnan ang gate',
      height: 124,
      use: (g) =>
        g.say([
          { who: '', text: 'HOLY ANGEL UNIVERSITY, sa itim na letra sa puting gate. Sa itaas nito, ang selyo ng unibersidad at ang bubong na salamin. Sa ilalim ng bubong, ang bag check at ang scanner ng ID.' },
          { who: '', text: 'Bukas na ang mga bakal na pinto. Sunod-sunod ang pasok ng mga naka-puti at maroon, habang dumadaan ang mga jeep at trike sa likod mo.' },
        ]),
    },
    {
      id: 'street',
      x: x.street,
      range: 20,
      label: 'Bumalik sa Sto. Rosario St.',
      height: 50,
      use: (g) => g.say([{ who: 'you', text: 'Andito na ako. Wala nang atrasan.' }]),
    },
  ];
}

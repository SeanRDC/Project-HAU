// The side gate by the Main Building. Everyone gets their bag checked and
// taps their ID at a turnstile, then walks in through the gate and comes out
// in front of the Main Building. Edit freely.

import { Hotspot, NpcDef, Step } from '../types';
import { ACTDO, ELLA, JOY, MIKKO, NONOY, TAHO } from './cast';

/** Where things stand in the scene, handed over by scenes/gate.ts. */
export interface GateSpots {
  street: number;
  arch: number;
  board: number;
  /** the pickup parked on the sidewalk */
  pickup: number;
}

/** Where the people at the gate stand, handed over by scenes/gate.ts. */
export interface GatePeople {
  joy: number;
  nonoy: number;
  enforcer: number;
  /** the stretch of sidewalk the taho vendor works */
  taho: [number, number];
  /** where the pickup's owner ends up standing, by his door */
  owner: number;
  /** somewhere off the end of the street, where he is until he comes running */
  away: number;
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
  /** where its owner runs up to */
  owner: number;
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
 * The first thing you meet on the way to the gate: a pickup parked up on the
 * sidewalk beside the NO PARKING sign, and the city traffic enforcer writing
 * it a ticket. Just as he is about to tear it off, the owner comes running.
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
        { who: 'actdo', text: 'Araw-araw \'yan. O, ayan, pipirmahan ko na lang...' },
      ],
    },
    // the owner sees the ticket book out and runs for it
    { place: 'mikko', x: cp.owner + 250, facing: -1 },
    { walk: cp.owner + 110, who: 'mikko', run: true, together: true },
    { pause: 0.8 },
    { face: 'you', dir: 1 },
    { say: [{ who: '', text: 'May humahangos na tumatakbo mula sa kanto, kumakaway pa.' }] },
    { walk: cp.owner, who: 'mikko', run: true },
    { face: 'mikko', dir: -1 },
    {
      say: [
        { who: 'mikko', text: 'Sorry po! Sorry! Sandali lang po, Sir! Sandali lang!' },
        { who: 'mikko', text: 'Aalisin ko na po! May hinatid lang ako sa loob, promise, limang minuto lang!' },
        { who: 'actdo', text: 'Limang minuto? Kanina pa ako nakatayo rito. Nakasampa ka pa sa sidewalk, o.' },
        { who: 'mikko', text: 'Sir, baka naman po pwede pang pag-usapan...' },
        { who: 'actdo', text: 'Pwede. Sa opisina. Pangalan?' },
        { who: 'mikko', text: '...Mikko Panergo po.' },
        { who: 'actdo', text: 'Pa-ner-go. O, ayan. Illegal parking, obstruction. Sa susunod, sa parking sa loob.' },
        {
          who: 'you',
          text: '...',
          choices: [
            {
              text: 'Kami ngang naglalakad, pumipila.',
              then: [
                { who: 'you', text: 'Kuya, kami ngang naglalakad, pumipila at nagpapa-bag check. Ikaw, apat na ang gulong mo, ayaw mo pang sumunod.' },
                { who: 'mikko', text: 'Oo na, oo na. Mali ako. Sorry na rin sa \'yo, boss.' },
              ],
            },
            {
              text: 'Sandali lang pala, ha.',
              then: [
                { who: 'you', text: '"Sandali lang." Kuya, \'yang sandali mo, kalahati ng sidewalk ang sakop.' },
                { who: 'mikko', text: 'Grabe ka naman. ...Pero tama ka. Sorry na.' },
              ],
            },
          ],
        },
        { who: 'actdo', text: 'Sige na, pumasok ka na. Baka ma-late ka pa dahil sa kanya.' },
        { who: 'you', text: 'Unang araw pa lang, may reklamo na agad ako. Welcome to college.', set: 'saw_ticket' },
      ],
    },
    { face: 'actdo', dir: 1 },
    { face: 'mikko', dir: -1 },
  ];
}

/** Coming back to the gate later: the owner is still standing by his pickup. */
export function ownerWaiting(cp: Checkpoint): Step[] {
  return [{ place: 'mikko', x: cp.owner, facing: -1 }];
}

/** Through the lowered arm and in through the gate, away from the camera. */
function goIn(cp: Checkpoint, who = 'you'): Step[] {
  return [
    { sound: 'turnstile' },
    { run: () => cp.hold(true) },
    { walk: cp.scanner - 8, who },
    { walkIn: who, time: who === 'you' ? 1.3 : 1.1 },
    { run: () => cp.hold(false) },
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
    ...goIn(cp, 'ella'),
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
  // through the gate and out in front of the Main Building
  const enter: Step[] = [...goIn(cp), { run: (game) => game.travel('plaza', 'start') }];
  if (g.has('scanned_id')) {
    return [...tap, { sound: 'beep' }, { run: () => cp.reader('ok') }, { pause: 0.3 }, { run: () => cp.card(false) }, ...enter];
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
    { run: (game) => game.set('scanned_id') },
    { say: [{ who: 'you', text: 'Okay. Unang araw. Kaya ko \'to.' }] },
    ...enter,
  ];
}

/** Ella, the freshman ahead of you in the line. She goes in before you and is waiting on the drive inside. */
export function ella(x: number, wander: [number, number]): NpcDef {
  return {
    id: 'ella',
    name: 'Ella',
    look: ELLA,
    x,
    depth: -8,
    facing: -1,
    wander,
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
  };
}

export function gateNpcs(at: GatePeople): NpcDef[] {
  return [
    {
      id: 'mikko',
      name: 'Mikko Panergo',
      look: MIKKO,
      x: at.away,
      depth: -2,
      facing: -1,
      talk: (g) =>
        g.raining()
          ? [{ who: 'mikko', text: 'Umuulan pa. Tiket na nga, basa pa. Ang malas ko ngayong araw.' }]
          : [
              { who: 'mikko', text: 'Limang daan. Para sa "sandali lang".' },
              { who: 'you', text: 'May parking po sa loob, Kuya.' },
              { who: 'mikko', text: 'Alam ko na. Ngayon alam ko na.' },
            ],
    },
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
    // only here for the arrival cutscene: she starts off the end of the street and is put at her table when it begins
    { ...ella(at.away + 40, [at.away + 40, at.away + 40]), wander: undefined },
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
          { who: '', text: 'HOLY ANGEL UNIVERSITY, sa itim na letra sa puting gate. Sa itaas nito, ang selyo ng unibersidad at ang bubong na salamin. Sa ilalim ng bubong, ang bag check at ang dalawang turnstile.' },
          { who: '', text: 'Bukas na ang mga bakal na pinto. Sunod-sunod ang pasok ng mga naka-puti at maroon, habang dumadaan ang mga jeep at trike sa likod mo.' },
        ]),
    },
    {
      id: 'street',
      x: x.street,
      range: 20,
      label: 'Bumalik sa kalsada',
      height: 50,
      use: (g) => g.say([{ who: 'you', text: 'Andito na ako. Wala nang atrasan.' }]),
    },
  ];
}

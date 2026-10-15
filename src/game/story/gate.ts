// The side gate by the Main Building. Everyone gets their bag checked and
// taps their ID at a turnstile, then walks in through the gate and up the
// walkway to the flag plaza (story/entry.ts). Edit freely.

import { Hotspot, Line, NpcDef, Step } from '../types';
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
  /** the way in, between the gate leaves at the back of the gatehouse, and how far up the screen it is */
  door: number;
  doorRise: number;
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

/** The same greeting in English. */
function greetingEn(hour: number): string {
  if (hour < 12 && hour >= 4) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Kuya Nonoy goes through your bag. Ends with the passed_bag_check flag. */
function bagCheck(cp: Checkpoint, hour: number): Step[] {
  return [
    { walk: cp.tableB + 28 },
    { face: 'you', dir: -1 },
    { face: 'nonoy', dir: 1 },
    {
      say: [
        { who: 'nonoy', face: 'happy', text: `${greeting(hour)}! Bag check po tayo. Pakilapag lang dito sa mesa.`, en: `${greetingEn(hour)}! Bag check, please. Just set it down here on the table.` },
        { who: 'you', text: 'Sige po.', en: 'Okay, sir.' },
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
        { who: '', text: 'Binuksan ni Kuya Nonoy ang bag mo at sinilip gamit ang flashlight. Notebook, payong, charger, at baong kanin at adobo.', en: 'Kuya Nonoy opens your bag and checks inside with a flashlight. Notebook, umbrella, charger, and your baon of kanin and adobo.' },
        {
          who: 'nonoy',
          text: 'May dala ka bang matulis? Cutter, gunting?', en: 'Carrying anything sharp? A cutter, scissors?',
          choices: [
            { text: 'Wala po.', en: 'No, sir.', then: [{ who: 'nonoy', text: 'Good.' }] },
            {
              text: 'Ballpen lang po.', en: 'Just a ballpen, sir.',
              then: [{ who: 'nonoy', face: 'happy', text: 'Hahaha! Pwede \'yan. \'Yan nga ang pinaka-kailangan mo dito.', en: 'Hahaha! That\'s fine. That\'s the one thing you\'ll really need here.' }],
            },
            {
              text: '\'Yung tinidor po sa baon ko?', en: 'Does the fork in my baon count, sir?',
              then: [{ who: 'nonoy', face: 'worried', text: '...Sige, pwede na rin. Basta pagkain lang ang tutusukin mo.', en: '...Fine, that passes. Just keep it to stabbing your food.' }],
            },
          ],
        },
        { who: 'nonoy', face: 'happy', text: 'Okay, clear! Amoy adobo pa. Ingat, baka tumapon.', en: 'Okay, all clear! Still smells like adobo in there. Careful it doesn\'t spill.' },
      ],
    },
    { run: () => cp.flashlight(false) },
    { sound: 'zip' },
    { run: () => cp.bag('closed') },
    { pause: 0.5 },
    { run: () => cp.bag('none') },
    { look: null },
    { say: [{ who: 'nonoy', face: 'happy', text: 'I-tap mo na lang ID mo sa scanner diyan. Welcome sa Holy Angel!', en: 'Just tap your ID on the scanner over there. Welcome to Holy Angel!', set: 'passed_bag_check' }] },
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
        { who: '', text: 'Isang pulang Chevrolet pickup, nakasampa sa sidewalk, katabi mismo ng karatulang "NO PARKING". Halos harang na sa daanan papasok ng gate.', en: 'A red Chevrolet pickup, parked up on the sidewalk, right beside a "NO PARKING" sign. It all but blocks the way into the gate.' },
        { who: 'you', face: 'surprised', text: 'Seryoso? Dito pa talaga, sa tapat mismo ng gate? Saan dadaan ang mga tao?', en: 'Seriously? Right here, right in front of the gate? Where are people supposed to walk?' },
        { who: 'actdo', text: 'Sa gilid ka muna dumaan. Tinitiketan ko na \'to.', en: 'Go around the side for now. I\'m ticketing it already.' },
        { who: 'you', face: 'angry', text: 'Ang laki-laki ng sasakyan, tapos sa bawal pa pumarada. May parking naman sa loob!', en: 'A truck that huge, and they park it right where it\'s not allowed? There\'s parking inside!' },
        { who: 'actdo', text: 'Araw-araw \'yan. O, ayan, pipirmahan ko na lang...', en: 'Every single day. There. Just need to sign it...' },
      ],
    },
    // the owner sees the ticket book out and runs for it
    { place: 'mikko', x: cp.owner + 250, facing: -1 },
    { walk: cp.owner + 110, who: 'mikko', run: true, together: true },
    { pause: 0.8 },
    { face: 'you', dir: 1 },
    { say: [{ who: '', text: 'May humahangos na tumatakbo mula sa kanto, kumakaway pa.', en: 'Someone comes running from the corner, out of breath, waving.' }] },
    { walk: cp.owner, who: 'mikko', run: true },
    { face: 'mikko', dir: -1 },
    {
      say: [
        { who: 'mikko', face: 'worried', text: 'Sorry po! Sorry! Sandali lang po, Sir! Sandali lang!', en: 'Sorry! Sorry, sir! Just a second, sir! Just a second!' },
        { who: 'mikko', face: 'worried', text: 'Aalisin ko na po! May hinatid lang ako sa loob, promise, limang minuto lang!', en: 'I\'m moving it now, sir! I was just dropping someone off inside, promise, only five minutes!' },
        { who: 'actdo', face: 'angry', text: 'Limang minuto? Kanina pa ako nakatayo rito. Nakasampa ka pa sa sidewalk, o.', en: 'Five minutes? I\'ve been standing here a while now. And you\'re up on the sidewalk, look.' },
        { who: 'mikko', face: 'shy', text: 'Sir, baka naman po pwede pang pag-usapan...', en: 'Sir, maybe we could talk this over, please...' },
        { who: 'actdo', face: 'smug', text: 'Pwede. Sa opisina. Pangalan?', en: 'We can. At the office. Name?' },
        { who: 'mikko', face: 'sad', text: '...Mikko Panergo po.', en: '...Mikko Panergo, sir.' },
        { who: 'actdo', text: 'Pa-ner-go. O, ayan. Illegal parking, obstruction. Sa susunod, sa parking sa loob.', en: 'Pa-ner-go. There you go. Illegal parking, obstruction. Next time, use the parking inside.' },
        {
          who: 'you',
          text: '...',
          choices: [
            {
              text: 'Kami ngang naglalakad, pumipila.', en: 'We walk, and we still line up.',
              then: [
                { who: 'you', face: 'angry', text: 'Kuya, kami ngang naglalakad, pumipila at nagpapa-bag check. Ikaw, apat na ang gulong mo, ayaw mo pang sumunod.', en: 'Kuya, we\'re on foot and we still line up and get our bags checked. You\'ve got four wheels and you still won\'t follow the rules.' },
                { who: 'mikko', face: 'sad', text: 'Oo na, oo na. Mali ako. Sorry na rin sa \'yo, boss.', en: 'Okay, okay. I was wrong. Sorry to you too, boss.' },
              ],
            },
            {
              text: 'Sandali lang pala, ha.', en: '"Just a second," huh?',
              then: [
                { who: 'you', face: 'smug', text: '"Sandali lang." Kuya, \'yang sandali mo, kalahati ng sidewalk ang sakop.', en: '"Just a second." Kuya, that second of yours takes up half the sidewalk.' },
                { who: 'mikko', face: 'shy', text: 'Grabe ka naman. ...Pero tama ka. Sorry na.', en: 'Wow, harsh. ...But you\'re right. I\'m sorry.' },
              ],
            },
          ],
        },
        { who: 'actdo', text: 'Sige na, pumasok ka na. Baka ma-late ka pa dahil sa kanya.', en: 'Go on, head in. Don\'t end up late because of him.' },
        { who: 'you', face: 'sad', text: 'Unang araw pa lang, may reklamo na agad ako. Welcome to college.', en: 'It\'s only the first day and I\'ve already got a complaint. Welcome to college.', set: 'saw_ticket' },
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

/** Through the lowered arm, then back turned to the street, in between the gate leaves and on into the campus. */
function goIn(cp: Checkpoint, who = 'you'): Step[] {
  return [
    { sound: 'turnstile' },
    { run: () => cp.hold(true) },
    { walk: cp.scanner - 8, who },
    { walkIn: who, to: cp.door, rise: cp.doorRise, time: who === 'you' ? 2.4 : 2.2 },
    { run: () => cp.hold(false) },
  ];
}

/** Back out from the entryway: out between the gate leaves, facing the street. */
export function comeOut(cp: Checkpoint): Step[] {
  return [{ walkOut: 'you', from: cp.door, rise: cp.doorRise, time: 2 }];
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
        { who: 'joy', face: 'happy', text: 'Okay ka na. Next!', en: 'You\'re all set. Next!' },
        { who: 'ella', face: 'happy', text: 'Salamat po!', en: 'Thank you, ma\'am!' },
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
      { say: [{ who: 'nonoy', face: 'surprised', text: 'Teka lang, boss! Bag check muna bago mag-tap.', en: 'Hold on, boss! Bag check first, then you tap.' }] },
      ...bagCheck(cp, g.hour()),
    ];
  }
  const tap: Step[] = [{ walk: cp.scanner }, { face: 'you', dir: -1 }, { run: () => cp.card(true) }, { pause: 0.5 }];
  // through the gate and up the walkway onto the flag plaza
  const enter: Step[] = [...goIn(cp), { run: (game) => game.travel('entry', 'gate') }];
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
        { who: '', text: 'Pula ang ilaw. Ayaw basahin.', en: 'The light goes red. It won\'t read.' },
        { who: 'you', face: 'surprised', emote: '?', text: 'Ha? Bakit?', en: 'Huh? Why?' },
        { who: 'joy', text: 'Tanggalin mo muna sa plastic case \'yung ID mo. Hindi nababasa \'pag nakabalot pa.', en: 'Take your ID out of the plastic case first. It won\'t read while it\'s still wrapped.' },
        { who: 'you', face: 'shy', text: 'Ay, opo. Sorry po!', en: 'Oh, right, ma\'am. Sorry!', set: 'id_fumble' },
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
    { say: [{ who: 'you', face: 'happy', text: 'Okay. Unang araw. Kaya ko \'to.', en: 'Okay. First day. I can do this.' }] },
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
    talk: (g) => {
      if (g.has('met_ella')) return [{ who: 'ella', text: 'Kung makita mo \'yung Accountancy building, sabihan mo \'ko ha.', en: 'If you spot the Accountancy building, let me know, okay?' }];
      const opener: Line[] = g.has('id_fumble')
        ? [
            { who: 'ella', face: 'happy', text: 'Uy, nakita kita sa pila kanina. \'Yung ID mo, ayaw mabasa, \'no?', en: 'Hey, I saw you in line earlier. Your ID wouldn\'t read, right?' },
            { who: 'you', face: 'shy', text: 'Naka-plastic pa kasi. Nakakahiya.', en: 'It was still in the plastic. So embarrassing.' },
            { who: 'ella', face: 'happy', text: 'Ako nga, ilang beses ko tinap \'yung library card ko bago ko na-realize.', en: 'I did worse. I kept tapping my library card before I realized.' },
          ]
        : [
            { who: 'ella', face: 'happy', text: 'Uy, freshie ka rin? Ang laki pala ng campus, \'no?', en: 'Hey, you\'re a freshie too? The campus is huge, right?' },
            { who: 'you', face: 'worried', text: 'Oo nga. Hindi ko pa alam kung saan pupunta.', en: 'Yeah, really. I still don\'t know where I\'m going.' },
          ];
      return [...opener, { who: 'ella', face: 'happy', text: 'Ella nga pala. Freshie din. Kita tayo sa orientation!', en: 'I\'m Ella, by the way. A freshie too. See you at orientation!', set: 'met_ella' }];
    },
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
          ? [{ who: 'mikko', face: 'sad', text: 'Umuulan pa. Tiket na nga, basa pa. Ang malas ko ngayong araw.', en: 'It\'s raining, too. A ticket, and now I\'m soaked. Just my luck today.' }]
          : [
              { who: 'mikko', face: 'sad', text: 'Limang daan. Para sa "sandali lang".', en: 'Five hundred. For "just a second."' },
              { who: 'you', text: 'May parking po sa loob, Kuya.', en: 'There\'s parking inside, Kuya.' },
              { who: 'mikko', face: 'sad', text: 'Alam ko na. Ngayon alam ko na.', en: 'I know. Now I know.' },
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
          ? [{ who: 'actdo', text: 'Umuulan na, hindi pa rin bumabalik ang may-ari. Basa na ang tiket niya, pero valid pa rin \'yan.', en: 'It\'s raining and the owner still hasn\'t come back. His ticket\'s soaked, but it still counts.' }]
          : [
              { who: 'actdo', text: 'ACTDO. Angeles City Traffic Development Office. Kami ang naniniket sa mga ganyan.', en: 'ACTDO. Angeles City Traffic Development Office. We\'re the ones who ticket that sort of thing.' },
              { who: 'actdo', text: 'Sabihan mo mga kaklase mo: bawal pumarada sa tapat ng gate. Kahit sandali lang.', en: 'Tell your classmates: no parking in front of the gate. Not even for a second.' },
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
              { who: 'nonoy', text: g.hour() > 18 || g.hour() < 5 ? 'Pauwi ka na? Ingat sa tawid, maraming jeep.' : 'Oh, ikaw ulit. Wala nang bag check palabas, \'wag kang mag-alala.',
                en: g.hour() > 18 || g.hour() < 5 ? 'Heading home? Careful crossing, there are a lot of jeeps.' : 'Oh, you again. No bag check on the way out, don\'t worry.' },
            ]
          : [
              { who: 'nonoy', text: 'Bag check muna bago pumasok, boss. Kahit si Don Juan pa \'yan.', en: 'Bag check before you go in, boss. Even Don Juan himself would get his bag checked.' },
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
          ? [{ who: 'joy', text: 'Isuot mo \'yang ID mo ha. Lagi kaming nagro-roving.', en: 'Keep that ID on, okay? We\'re always doing rounds.' }]
          : [
              { who: 'joy', face: 'smug', text: 'Freshie? Kita ko sa mukha mo, kinakabahan ka pa.', en: 'Freshie? I can see it on your face. You\'re still nervous.' },
              { who: 'joy', text: 'Tatlong taon na ako sa gate na \'to. Lahat ng freshman ganyan ang itsura sa unang araw.', en: 'Three years I\'ve been at this gate. Every freshman has that same look on the first day.' },
              { who: 'you', face: 'shy', text: 'Halata po pala.', en: 'So it shows, ma\'am.' },
              { who: 'joy', face: 'happy', text: 'Okay lang \'yan. Pagdating ng finals, iba na \'yang kaba mo.', en: 'That\'s fine. Come finals, you\'ll be nervous about something else entirely.', set: 'met_joy' },
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
          en: g.raining()
            ? 'Tahooo! Nice and warm, perfect for the rain. Just twenty!'
            : 'Tahooo! Just twenty, sago included. Wakes you up before class!',
          choices: [
            {
              text: 'Sige po, isa.', en: 'One, please.',
              then:
                g.pesos() >= 20
                  ? [
                      { who: '', text: 'Sinandok niya ang mainit na taho, binuhusan ng arnibal at sago.', en: 'He scoops out warm taho and pours arnibal and sago over it.', pesos: -20, item: 'Taho' },
                      { who: 'you', face: 'happy', text: 'Ang sarap. Parang elementary ulit.', en: 'So good. Feels like elementary school again.' },
                    ]
                  : [
                      { who: '', text: 'Kinapa mo ang bulsa mo. Kulang ang barya.', en: 'You check your pocket. Not enough coins.' },
                      { who: 'taho', face: 'happy', text: 'Ay, sige na. Bukas na lang, ha? Hindi ka naman tatakbo.', en: 'Ah, it\'s fine. Tomorrow, then, okay? You\'re not going anywhere.' },
                    ],
            },
            {
              text: 'Mamaya na lang po.', en: 'Maybe later, thanks.',
              then: [{ who: 'taho', face: 'happy', text: 'Sige, nandito lang ako hanggang tanghali. Pag naubos, wala na!', en: 'Sure, I\'m here till noon. Once it\'s gone, it\'s gone!' }],
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
      labelEn: 'Tap your ID',
      height: 46,
      use: (g) => g.play(tapId(cp, g)),
    },
    {
      id: 'pickup',
      x: x.pickup,
      range: 24,
      label: 'Tingnan ang pickup',
      labelEn: 'Look at the pickup',
      height: 44,
      use: (g) =>
        g.say([
          { who: '', text: 'Pulang Chevrolet, itim ang mags, may sticker pa ng putik sa pinto. Makintab, bagong hugas. May puting papel na nakaipit sa wiper.', en: 'A red Chevrolet with black mags and a mud-splatter sticker on the door. Shiny, freshly washed. A white slip of paper is tucked under the wiper.' },
          { who: 'you', text: g.has('scanned_id') ? 'Nandito pa rin. Ang tapang.' : 'Ang ganda ng sasakyan. Ang pangit ng parada.',
            en: g.has('scanned_id') ? 'Still here. Bold.' : 'Beautiful truck. Ugly parking job.' },
        ]),
    },
    {
      id: 'board',
      x: x.board,
      range: 20,
      label: 'Basahin ang karatula',
      labelEn: 'Read the sign',
      height: 66,
      use: (g) =>
        g.say([
          { who: '', text: '"NO ID, NO ENTRY." Malaki, pula, at hindi mo talaga mapapalampas.', en: '"NO ID, NO ENTRY." Big, red, and impossible to miss.' },
          { who: 'you', text: 'Okay. Noted. Hindi ko na iiwan sa bahay.', en: 'Okay. Noted. I\'m never leaving it at home.' },
        ]),
    },
    {
      id: 'arch',
      x: x.arch,
      range: 30,
      label: 'Tingnan ang gate',
      labelEn: 'Look at the gate',
      height: 124,
      use: (g) =>
        g.say([
          { who: '', text: 'HOLY ANGEL UNIVERSITY, sa itim na letra sa puting gate. Sa itaas nito, ang selyo ng unibersidad at ang bubong na salamin. Sa ilalim ng bubong, ang bag check at ang dalawang turnstile.', en: 'HOLY ANGEL UNIVERSITY in black letters on the white gate. Above it, the university seal and the glass roof. Under the roof, the bag check and the two turnstiles.' },
          { who: '', text: 'Bukas na ang mga bakal na pinto. Sunod-sunod ang pasok ng mga naka-puti at maroon, habang dumadaan ang mga jeep at trike sa likod mo.', en: 'The iron doors are already open. Students in white and maroon file in one after another, while jeeps and trikes go by behind you.' },
        ]),
    },
    {
      id: 'street',
      x: x.street,
      range: 20,
      label: 'Bumalik sa kalsada',
      labelEn: 'Go back to the street',
      height: 50,
      use: (g) => g.say([{ who: 'you', text: 'Andito na ako. Wala nang atrasan.', en: 'I\'m here now. No turning back.' }]),
    },
  ];
}

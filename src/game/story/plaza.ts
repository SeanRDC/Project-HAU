// People and things to look at in front of the DJN building.
// Dialogue is Taglish with a bit of Kapampangan. Edit freely.

import { Hotspot, NpcDef } from '../types';
import { deadEnd, wayTo } from './campus';
import { DRIVER, GUARD, JOPET, TRISHA } from './cast';

export function plazaNpcs(): NpcDef[] {
  return [
    {
      id: 'guard',
      name: 'Kuya Ramil',
      look: GUARD,
      x: 1208,
      depth: -6,
      facing: -1,
      talk: (g) =>
        g.has('met_guard')
          ? [
              { who: 'guard', text: g.hour() > 18.5 || g.hour() < 5 ? 'Gabi na ah. Ingat pauwi, ha.' : 'Ingat sa hagdan ng DJN. Madulas \'yan pag umuulan.',
                en: g.hour() > 18.5 || g.hour() < 5 ? 'It\'s getting late. Get home safe, okay?' : 'Careful on the DJN steps. They get slippery when it rains.' },
              { who: 'you', text: 'Sige po, Kuya. Salamat!', en: 'Will do, Kuya. Thanks!' },
            ]
          : [
              { who: 'guard', text: 'Mayap a gatpanapun! ID po natin?', en: 'Mayap a gatpanapun! Good afternoon! May I see your ID, please?' },
              { who: 'you', text: 'Eto po, Kuya. Freshman po ako. First day.', en: 'Here you go, Kuya. I\'m a freshman. First day.' },
              { who: 'guard', text: 'Ahh, kaya pala parang naliligaw. Bagong-bago pa \'yang lace mo, oh.', en: 'Ahh, that\'s why you look lost. Look, your ID lanyard is still brand new.' },
              {
                who: 'guard',
                text: 'Saan ka ba dapat?', en: 'Where are you supposed to be?',
                choices: [
                  {
                    text: 'Sa School of Computing po.', en: 'The School of Computing, sir.',
                    then: [
                      { who: 'guard', text: 'Malayo-layo pa \'yon. Pero dumaan ka muna diyan sa DJN.', en: 'That\'s a bit of a walk. But stop by the DJN first.' },
                    ],
                  },
                  {
                    text: 'Hindi ko pa po alam, eh.', en: 'I don\'t actually know yet, sir.',
                    then: [
                      { who: 'guard', text: 'Hahaha! Ayos lang \'yan, lahat kami dumaan diyan. Diyan ka muna sa DJN.', en: 'Hahaha! That\'s fine, we\'ve all been there. Start at the DJN.' },
                    ],
                  },
                ],
              },
              { who: 'guard', text: 'Tradisyon ng mga bago: bumati muna kay Don Juan sa lobby bago ang lahat.', en: 'A tradition for new students: say hello to Don Juan in the lobby before anything else.', set: 'met_guard' },
              { who: 'you', text: 'Sige po. Dakal a salamat, Kuya!', en: 'Will do. Dakal a salamat. Thanks so much, Kuya!' },
            ],
    },
    {
      id: 'driver',
      name: 'Mang Dado',
      look: DRIVER,
      x: 1128,
      depth: -3,
      facing: -1,
      talk: () => [
        {
          who: 'driver',
          text: 'Trike, boss? Nepo, Balibago, kahit saan.', en: 'Trike, boss? Nepo, Balibago, anywhere.',
          choices: [
            {
              text: 'Hindi po muna, kararating ko lang.', en: 'Not yet, thanks. I just got here.',
              then: [{ who: 'driver', text: 'Sige, sige. Dito lang ako pag uwian na.', en: 'Okay, okay. I\'ll be right here when it\'s time to go home.' }],
            },
            {
              text: 'Magkano po hanggang Nepo?', en: 'How much to Nepo, sir?',
              then: [
                { who: 'driver', text: 'Bente lang, estudyante ka naman eh.', en: 'Just twenty, since you\'re a student.' },
                { who: 'driver', text: 'Pero mamaya na. Pumasok ka muna, sayang ang tuition.', en: 'But later. Go to class first, don\'t waste your tuition.' },
                { who: 'you', text: '...Opo.', en: '...Yes, sir.' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'trisha',
      name: 'Trisha',
      look: TRISHA,
      x: 838,
      depth: -8,
      facing: -1,
      talk: (g) =>
        g.has('met_trisha')
          ? [
              { who: 'trisha', text: 'Wala pa rin sila. Classic.', en: 'Still not here. Classic.' },
              { who: 'trisha', text: 'Pag nagka-groupmates ka na, maiintindihan mo rin ako.', en: 'Once you\'ve got groupmates, you\'ll understand.' },
            ]
          : [
              { who: 'trisha', text: '"Asan na kayo, 4:30 ang usapan natin"... send.', en: '"Where are you guys, we said 4:30"... send.' },
              { who: 'trisha', text: 'Ay, sorry! Freshie ka \'no? Halata, ang linis pa ng sapatos mo.', en: 'Oh, sorry! You\'re a freshie, right? It shows, your shoes are still spotless.' },
              { who: 'you', text: 'Ganun po ba kahalata?', en: 'Is it that obvious, ma\'am?' },
              { who: 'trisha', text: '\'Wag mo na \'kong i-"po", fourth year lang ako, hindi lola.', en: 'Don\'t "ma\'am" me, I\'m just a fourth year, not your lola.' },
              { who: 'trisha', text: 'Pro tip: \'wag kang tatambay sa fountain pag mahangin. Mababasa notes mo.', en: 'Pro tip: don\'t hang out by the fountain when it\'s windy. Your notes will get wet.', set: 'met_trisha' },
            ],
    },
    {
      id: 'jopet',
      name: 'Jopet',
      look: JOPET,
      x: 282,
      depth: -5,
      facing: -1,
      wander: [262, 352],
      talk: (g) =>
        g.has('gave_piso')
          ? [{ who: 'jopet', text: 'Nahulog ko na. Ngayon, aaral na talaga ako. Promise.', en: 'I dropped it in. Now I\'m really going to study. Promise.' }]
          : g.has('met_jopet')
          ? [
              {
                who: 'jopet',
                text: 'May piso ka ba diyan? Pang-apat na subok.', en: 'Got a peso on you? Fourth try.',
                choices: [
                  {
                    text: 'Eto, o.', en: 'Here you go.',
                    then:
                      g.pesos() >= 1
                        ? [
                            { who: '', text: 'Inabot mo ang piso. Hinalikan niya ito bago ihulog sa fountain.', en: 'You hand over the peso. He kisses it before dropping it into the fountain.', pesos: -1, item: 'Piso kay Jopet', itemEn: 'A peso for Jopet', set: 'gave_piso' },
                            { who: 'jopet', text: 'Salamat, freshie. Pag pumasa ako, libre kita.', en: 'Thanks, freshie. If I pass, it\'s my treat.' },
                          ]
                        : [{ who: 'you', text: 'Ay, ubos na pala ang barya ko.', en: 'Oh, I\'m actually out of coins.' }, { who: 'jopet', text: 'Pareho tayo, pare. Pareho tayo.', en: 'Same here, man. Same here.' }],
                  },
                  { text: 'Wala, eh.', en: 'Sorry, I don\'t.', then: [{ who: 'jopet', text: 'Sige. Baka nga kailangan ko lang talagang mag-aral.', en: 'Okay. Maybe I really just need to study.' }] },
                ],
              },
            ]
          : [
              { who: 'jopet', text: 'Sabi nila, pag naghulog ka ng piso dito bago mag-exam, papasa ka.', en: 'They say if you drop a peso in here before an exam, you\'ll pass.' },
              { who: 'you', text: 'Totoo ba?', en: 'Does it work?' },
              { who: 'jopet', text: 'Tatlong piso na ang nahulog ko.', en: 'I\'ve dropped in three pesos so far.' },
              { who: 'jopet', text: 'Tatlong bagsak din.', en: 'And failed three times.', set: 'met_jopet' },
              { who: 'you', text: '...Baka kailangan mo lang talagang mag-aral.', en: '...Maybe you just need to actually study.' },
              { who: 'jopet', text: 'Aray. First day mo pa lang, ganyan ka na.', en: 'Ouch. It\'s only your first day and you\'re already like this.' },
            ],
    },
  ];
}

export function plazaHotspots(x: {
  lane: number; walkway: number; sw1: number; stuc: number; fountain: number; epiphany: number; entry: number; door: number; statue: number; gate: number;
}): Hotspot[] {
  return [
    wayTo('lane', x.lane, 'Pumunta sa parking lane', 'lane', 'plaza', 66, 'Go to the parking lane'),
    wayTo('walkway', x.walkway, 'Pumunta sa walkway, PGN side', 'walkway', 'rotunda', 66, 'Go to the walkway, PGN side'),
    wayTo('sw1', x.sw1, 'Pumunta sa sidewalk, Main Bldg. side', 'djnsw2', 'plaza', 80, 'Go to the sidewalk, Main Bldg. side'),
    wayTo('stuc', x.stuc, 'Pumunta sa student center', 'stuc', 'plaza', 70, 'Go to the student center'),
    {
      id: 'fountain',
      x: x.fountain,
      range: 40,
      label: 'Tingnan ang fountain',
      labelEn: 'Look at the fountain',
      height: 96,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang Holy Guardian Angel sa gitna ng rotunda, nakatayo sa likod ng dalawang batang nagbabasa ng iisang libro.', en: 'The Holy Guardian Angel in the middle of the rotunda, standing behind two children reading the same book.' },
          { who: '', text: 'May kasamang ambon ang hangin galing sa fountain sa paanan nila.', en: 'The breeze carries a fine mist from the fountain at their feet.' },
          { who: '', text: 'Nakapatong ang mga kamay ng anghel sa balikat ng mga bata. Parang sinasabing: sige, magbasa lang kayo, nandito ako.', en: 'The angel\'s hands rest on the children\'s shoulders, as if to say: go on, keep reading, I\'m right here.' },
          { who: 'you', text: 'Ang sarap tumambay dito.', en: 'This would be a nice spot to hang out.' },
        ]),
    },
    wayTo('epiphany', x.epiphany, 'Bumaba sa Epiphany of Angels', 'park', 'plaza', 30, 'Go down to the Epiphany of Angels'),
    wayTo('entry', x.entry, 'Umakyat sa flagpole (side gate)', 'entry', 'djn', 30, 'Go up to the flagpole (side gate)'),
    {
      id: 'door',
      x: x.door,
      range: 26,
      label: 'Pumasok sa DJN Building',
      labelEn: 'Go into the DJN Building',
      height: 64,
      use: (g) => g.travel('lobby', 'front'),
    },
    {
      id: 'angel',
      x: x.statue,
      range: 30,
      label: 'Tingnan ang rebulto',
      labelEn: 'Look at the statue',
      height: 96,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang Holy Guardian Angel, may kasamang bata. Nakaturo sa langit ang isang kamay.', en: 'The Holy Guardian Angel, with a child beside him. One hand points to the sky.' },
          { who: '', text: 'Parang sinasabing: doon ang tingin, hindi sa cellphone.', en: 'As if to say: eyes up there, not on your phone.', set: 'saw_angel' },
        ]),
    },
    // St. Barachiel Gate is for cars; students come in and go out by the side gate past the flagpole
    deadEnd(
      'gate',
      x.gate,
      'Tingnan ang St. Barachiel Gate',
      'Pang-sasakyan lang ang St. Barachiel Gate. Sa side gate dumadaan ang mga estudyante, sa may flagpole.',
      { label: 'Look at St. Barachiel Gate', text: 'St. Barachiel Gate is for cars only. Students go through the side gate, by the flagpole.' },
    ),
  ];
}

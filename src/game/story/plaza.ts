// People and things to look at in front of the DJN building.
// Dialogue is Taglish with a bit of Kapampangan. Edit freely.

import { Hotspot, NpcDef } from '../types';
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
              { who: 'guard', text: g.hour() > 18.5 || g.hour() < 5 ? 'Gabi na ah. Ingat pauwi, ha.' : 'Ingat sa hagdan ng DJN. Madulas \'yan pag umuulan.' },
              { who: 'you', text: 'Sige po, Kuya. Salamat!' },
            ]
          : [
              { who: 'guard', text: 'Mayap a gatpanapun! ID po natin?' },
              { who: 'you', text: 'Eto po, Kuya. Freshman po ako. First day.' },
              { who: 'guard', text: 'Ahh, kaya pala parang naliligaw. Bagong-bago pa \'yang lace mo, oh.' },
              {
                who: 'guard',
                text: 'Saan ka ba dapat?',
                choices: [
                  {
                    text: 'Sa School of Computing po.',
                    then: [
                      { who: 'guard', text: 'Malayo-layo pa \'yon. Pero dumaan ka muna diyan sa DJN.' },
                    ],
                  },
                  {
                    text: 'Hindi ko pa po alam, eh.',
                    then: [
                      { who: 'guard', text: 'Hahaha! Ayos lang \'yan, lahat kami dumaan diyan. Diyan ka muna sa DJN.' },
                    ],
                  },
                ],
              },
              { who: 'guard', text: 'Tradisyon ng mga bago: bumati muna kay Don Juan sa lobby bago ang lahat.', set: 'met_guard' },
              { who: 'you', text: 'Sige po. Dakal a salamat, Kuya!' },
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
          text: 'Trike, boss? Nepo, Balibago, kahit saan.',
          choices: [
            {
              text: 'Hindi po muna, kararating ko lang.',
              then: [{ who: 'driver', text: 'Sige, sige. Dito lang ako pag uwian na.' }],
            },
            {
              text: 'Magkano po hanggang Nepo?',
              then: [
                { who: 'driver', text: 'Bente lang, estudyante ka naman eh.' },
                { who: 'driver', text: 'Pero mamaya na. Pumasok ka muna, sayang ang tuition.' },
                { who: 'you', text: '...Opo.' },
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
              { who: 'trisha', text: 'Wala pa rin sila. Classic.' },
              { who: 'trisha', text: 'Pag nagka-groupmates ka na, maiintindihan mo rin ako.' },
            ]
          : [
              { who: 'trisha', text: '"Asan na kayo, 4:30 ang usapan natin"... send.' },
              { who: 'trisha', text: 'Ay, sorry! Freshie ka \'no? Halata, ang linis pa ng sapatos mo.' },
              { who: 'you', text: 'Ganun po ba kahalata?' },
              { who: 'trisha', text: '\'Wag mo na \'kong i-"po", fourth year lang ako, hindi lola.' },
              { who: 'trisha', text: 'Pro tip: \'wag kang tatambay sa fountain pag mahangin. Mababasa notes mo.', set: 'met_trisha' },
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
        g.has('met_jopet')
          ? [{ who: 'jopet', text: 'May piso ka ba diyan? Pang-apat na subok.' }]
          : [
              { who: 'jopet', text: 'Sabi nila, pag naghulog ka ng piso dito bago mag-exam, papasa ka.' },
              { who: 'you', text: 'Totoo ba?' },
              { who: 'jopet', text: 'Tatlong piso na ang nahulog ko.' },
              { who: 'jopet', text: 'Tatlong bagsak din.', set: 'met_jopet' },
              { who: 'you', text: '...Baka kailangan mo lang talagang mag-aral.' },
              { who: 'jopet', text: 'Aray. First day mo pa lang, ganyan ka na.' },
            ],
    },
  ];
}

export function plazaHotspots(doorX: number, fountainX: number, statueX: number): Hotspot[] {
  return [
    {
      id: 'door',
      x: doorX,
      range: 26,
      label: 'Pumasok sa DJN Building',
      height: 64,
      use: (g) => g.travel('lobby', 'front'),
    },
    {
      id: 'fountain',
      x: fountainX,
      range: 40,
      label: 'Tingnan ang fountain',
      height: 56,
      use: (g) =>
        g.say([
          { who: '', text: 'May kasamang ambon ang hangin galing sa fountain. Sa likod, tanaw ang mga kampanaryo ng Holy Rosary.' },
          { who: 'you', text: 'Ang sarap tumambay dito.' },
        ]),
    },
    {
      id: 'angel',
      x: statueX,
      range: 30,
      label: 'Tingnan ang rebulto',
      height: 96,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang Holy Guardian Angel, may kasamang bata. Nakaturo sa langit ang isang kamay.' },
          { who: '', text: 'Parang sinasabing: doon ang tingin, hindi sa cellphone.', set: 'saw_angel' },
        ]),
    },
    {
      id: 'park',
      x: 50,
      range: 28,
      label: 'Pumunta sa Epiphany of Angels',
      height: 66,
      use: (g) => g.travel('park', 'drive'),
    },
    {
      id: 'gate',
      x: 1262,
      range: 22,
      label: 'Lumabas ng gate',
      height: 50,
      use: (g) => g.say([{ who: 'you', text: 'Uuwi na agad? Kararating ko lang. Mamaya na.' }]),
    },
  ];
}

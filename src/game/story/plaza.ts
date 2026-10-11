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
        g.has('gave_piso')
          ? [{ who: 'jopet', text: 'Nahulog ko na. Ngayon, aaral na talaga ako. Promise.' }]
          : g.has('met_jopet')
          ? [
              {
                who: 'jopet',
                text: 'May piso ka ba diyan? Pang-apat na subok.',
                choices: [
                  {
                    text: 'Eto, o.',
                    then:
                      g.pesos() >= 1
                        ? [
                            { who: '', text: 'Inabot mo ang piso. Hinalikan niya ito bago ihulog sa fountain.', pesos: -1, item: 'Piso kay Jopet', set: 'gave_piso' },
                            { who: 'jopet', text: 'Salamat, freshie. Pag pumasa ako, libre kita.' },
                          ]
                        : [{ who: 'you', text: 'Ay, ubos na pala ang barya ko.' }, { who: 'jopet', text: 'Pareho tayo, pare. Pareho tayo.' }],
                  },
                  { text: 'Wala, eh.', then: [{ who: 'jopet', text: 'Sige. Baka nga kailangan ko lang talagang mag-aral.' }] },
                ],
              },
            ]
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

export function plazaHotspots(x: {
  lane: number; walkway: number; fountain: number; epiphany: number; door: number; statue: number; gate: number;
}): Hotspot[] {
  return [
    wayTo('lane', x.lane, 'Pumunta sa parking lane', 'lane', 'plaza', 66),
    wayTo('walkway', x.walkway, 'Pumunta sa chapel walkway', 'walkway', 'rotunda', 66),
    {
      id: 'fountain',
      x: x.fountain,
      range: 40,
      label: 'Tingnan ang fountain',
      height: 96,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang Holy Guardian Angel sa gitna ng rotunda, nakatayo sa likod ng dalawang batang nagbabasa ng iisang libro.' },
          { who: '', text: 'May kasamang ambon ang hangin galing sa fountain sa paanan nila.' },
          { who: '', text: 'Nakapatong ang mga kamay ng anghel sa balikat ng mga bata. Parang sinasabing: sige, magbasa lang kayo, nandito ako.' },
          { who: 'you', text: 'Ang sarap tumambay dito.' },
        ]),
    },
    wayTo('epiphany', x.epiphany, 'Bumaba sa Epiphany of Angels', 'park', 'plaza', 30),
    {
      id: 'door',
      x: x.door,
      range: 26,
      label: 'Pumasok sa DJN Building',
      height: 64,
      use: (g) => g.travel('lobby', 'front'),
    },
    {
      id: 'angel',
      x: x.statue,
      range: 30,
      label: 'Tingnan ang rebulto',
      height: 96,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang Holy Guardian Angel, may kasamang bata. Nakaturo sa langit ang isang kamay.' },
          { who: '', text: 'Parang sinasabing: doon ang tingin, hindi sa cellphone.', set: 'saw_angel' },
        ]),
    },
    deadEnd(
      'gate',
      x.gate,
      'Tingnan ang gate',
      '"ST. BARACHIEL GATE." Sasakyan lang ang dumadaan dito, papuntang Holy Angel Avenue. Ang mga estudyante, sa main gate sa Sto. Rosario St. pumapasok at lumalabas, sa dulo ng Epiphany of Angels.',
    ),
  ];
}

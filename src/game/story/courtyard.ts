import { Hotspot, NpcDef } from '../types';
import { BEA, CAT, MIGS } from './cast';
import { TASKS } from './tasks';

export function courtyardNpcs(): NpcDef[] {
  return [
    {
      id: 'bea',
      name: 'Bea',
      look: BEA,
      x: 586,
      depth: -4,
      facing: -1,
      talk: (g) => {
        if (!g.has('met_bea')) {
          return [
            { who: 'bea', text: 'Uy! Akala ko na-late ka na naman. First day na first day.' },
            { who: 'you', text: 'Naligaw ako. Ang laki pala ng campus.' },
            { who: 'bea', text: 'Isang building pa lang \'to, naligaw ka na? Paano pa pag nasa SOC na tayo?' },
            {
              who: 'bea',
              text: 'Kinakabahan ka ba?',
              choices: [
                {
                  text: 'Medyo. Hindi ko alam kung kaya ko.',
                  then: [
                    { who: 'bea', text: 'Ako rin, eh. Pero andito na tayo. Sabay na lang tayong kabahan.' },
                  ],
                },
                {
                  text: 'Hindi ah. Excited nga ako.',
                  then: [
                    { who: 'bea', text: 'Weh. Nanginginig \'yang kamay mo, oh.' },
                    { who: 'you', text: '...Malamig lang.' },
                  ],
                },
              ],
            },
            { who: 'bea', text: 'Tambay muna tayo dito bago mag-orientation. Ang ganda ng ilaw pag ganitong oras, \'no?' },
            { who: 'bea', text: 'Mag-ikot ka muna kung gusto mo. Dito lang ako.', set: 'met_bea' },
          ];
        }
        if (TASKS.every((t) => g.has(t.flag))) {
          return [
            { who: 'bea', text: 'O, nakapag-ikot ka na? Kumusta?' },
            { who: 'you', text: 'May guard na mabait, may pusang masungit, at may senior na tatlong beses nang bumagsak.' },
            { who: 'bea', text: 'Hahaha! So normal na school.' },
            { who: 'you', text: 'Parang gusto ko na dito.' },
            { who: 'bea', text: 'Ako rin. Tara, baka ma-late pa tayo sa orientation.', set: 'day_done' },
            { who: '', text: 'Dito muna nagtatapos ang unang araw. Marami pang susunod. Salamat sa paglalaro!' },
          ];
        }
        return [
          { who: 'bea', text: 'May oras pa. Nakita mo na ba \'yung pusa? Si Mingming daw pangalan niyan.' },
          { who: 'bea', text: 'Tingnan mo \'yung phone mo kung ano pang hindi mo napupuntahan.' },
        ];
      },
    },
    {
      id: 'migs',
      name: 'Migs',
      look: MIGS,
      x: 240,
      depth: -7,
      facing: 1,
      wander: [180, 340],
      talk: (g) =>
        g.has('met_migs')
          ? [{ who: 'migs', text: 'Pag-isipan mo ha! May libreng pizza sa GA. Minsan.' }]
          : [
              { who: 'migs', text: 'Psst! Freshie! Naghahanap ka ba ng org?' },
              {
                who: 'you',
                text: '...',
                choices: [
                  {
                    text: 'Anong org \'yan?',
                    then: [
                      { who: 'migs', text: 'Game dev org. Gumagawa kami ng laro tungkol sa campus.' },
                      { who: 'you', text: 'Laro? Tungkol sa HAU?' },
                      { who: 'migs', text: 'Oo! Naglalakad ka lang tapos kinakausap mo \'yung mga tao. Ang weird \'no?' },
                      { who: 'you', text: '...Medyo pamilyar.' },
                    ],
                  },
                  {
                    text: 'May libre bang pagkain?',
                    then: [
                      { who: 'migs', text: 'Diretso ka, ah. Gusto ko \'yan.' },
                      { who: 'migs', text: 'May pizza sa general assembly. Kung may budget.' },
                    ],
                  },
                ],
              },
              { who: 'migs', text: 'Eto flyer. Booth namin nasa SOC, pag bukas na \'yung daan papunta doon.', set: 'met_migs' },
            ],
    },
    {
      id: 'cat',
      name: 'Mingming',
      look: CAT,
      cat: true,
      x: 700,
      depth: 3,
      facing: -1,
      talk: (g) =>
        g.has('pet_cat')
          ? [
              { who: 'cat', text: 'Mrrp.' },
              { who: '', text: 'Tinitigan ka lang niya. Sapat na raw ang isang himas kada araw.' },
            ]
          : [
              { who: 'cat', text: 'Meow.' },
              { who: '', text: 'Dahan-dahan mong hinimas si Mingming. Pumikit siya at nag-purr.' },
              { who: 'cat', text: 'Prrrrr...' },
              { who: 'you', text: 'Okay. Opisyal na. Gusto ko na dito.', set: 'pet_cat' },
            ],
    },
  ];
}

export function courtyardHotspots(x: { door: number; arch: number; chair: number; gate: number }): Hotspot[] {
  return [
    {
      id: 'lobby',
      x: x.door,
      range: 22,
      label: 'Bumalik sa lobby',
      height: 70,
      use: (g) => g.travel('lobby', 'courtyard'),
    },
    {
      id: 'arch',
      x: x.arch,
      range: 34,
      label: 'Tingnan ang arko',
      height: 90,
      use: (g) =>
        g.say([
          { who: '', text: '"LAUS DEO SEMPER." Nakaukit sa itaas ng tatlong arko, may nakasabit pang garland.' },
          { who: '', text: 'Ilang libong estudyante na kaya ang dumaan dito bago ka?' },
        ]),
    },
    {
      id: 'chair',
      x: x.chair,
      range: 14,
      label: 'Tingnan ang upuan',
      height: 34,
      use: (g) =>
        g.say([
          { who: '', text: 'Isang puting monobloc, mag-isa sa gitna ng courtyard.' },
          { who: 'you', text: 'Kahit saan talaga sa Pilipinas, may ganito.' },
        ]),
    },
    {
      id: 'gate',
      x: x.gate - 22,
      range: 20,
      label: 'Lumabas sa chapel walkway',
      height: 60,
      use: (g) => g.travel('walkway', 'courtyard'),
    },
  ];
}

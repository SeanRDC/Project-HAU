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
            { who: 'bea', text: 'Uy! Akala ko na-late ka na naman. First day na first day.', en: 'Hey! I thought you were late again. On the very first day.' },
            { who: 'you', text: 'Naligaw ako. Ang laki pala ng campus.', en: 'I got lost. The campus is huge.' },
            { who: 'bea', text: 'Isang building pa lang \'to, naligaw ka na? Paano pa pag nasa SOC na tayo?', en: 'This is just one building and you already got lost? What happens when we\'re at SOC?' },
            {
              who: 'bea',
              text: 'Kinakabahan ka ba?', en: 'Are you nervous?',
              choices: [
                {
                  text: 'Medyo. Hindi ko alam kung kaya ko.', en: 'A little. I don\'t know if I can do this.',
                  then: [
                    { who: 'bea', text: 'Ako rin, eh. Pero andito na tayo. Sabay na lang tayong kabahan.', en: 'Me too. But we\'re here now. Let\'s be nervous together.' },
                  ],
                },
                {
                  text: 'Hindi ah. Excited nga ako.', en: 'Nope. I\'m actually excited.',
                  then: [
                    { who: 'bea', text: 'Weh. Nanginginig \'yang kamay mo, oh.', en: 'Yeah, right. Your hands are shaking, look.' },
                    { who: 'you', text: '...Malamig lang.', en: '...It\'s just cold.' },
                  ],
                },
              ],
            },
            { who: 'bea', text: 'Tambay muna tayo dito bago mag-orientation. Ang ganda ng ilaw pag ganitong oras, \'no?', en: 'Let\'s hang out here before orientation. The light\'s really nice this time of day, isn\'t it?' },
            { who: 'bea', text: 'Mag-ikot ka muna kung gusto mo. Dito lang ako.', en: 'Go look around first if you want. I\'ll be right here.', set: 'met_bea' },
          ];
        }
        if (TASKS.every((t) => g.has(t.flag))) {
          return [
            { who: 'bea', text: 'O, nakapag-ikot ka na? Kumusta?', en: 'So, done looking around? How was it?' },
            { who: 'you', text: 'May guard na mabait, may pusang masungit, at may senior na tatlong beses nang bumagsak.', en: 'There\'s a nice guard, a grumpy cat, and a senior who\'s failed three times.' },
            { who: 'bea', text: 'Hahaha! So normal na school.', en: 'Hahaha! So, a normal school.' },
            { who: 'you', text: 'Parang gusto ko na dito.', en: 'I think I like it here.' },
            { who: 'bea', text: 'Ako rin. Tara, baka ma-late pa tayo sa orientation.', en: 'Me too. Come on, or we\'ll be late for orientation.', set: 'day_done' },
            { who: '', text: 'Dito muna nagtatapos ang unang araw. Marami pang susunod. Salamat sa paglalaro!', en: 'The first day ends here for now. There\'s plenty more to come. Thanks for playing!' },
          ];
        }
        return [
          { who: 'bea', text: 'May oras pa. Nakita mo na ba \'yung pusa? Si Mingming daw pangalan niyan.', en: 'There\'s still time. Have you seen the cat yet? Apparently it\'s called Mingming.' },
          { who: 'bea', text: 'Tingnan mo \'yung phone mo kung ano pang hindi mo napupuntahan.', en: 'Check your phone to see where you haven\'t been yet.' },
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
          ? [{ who: 'migs', text: 'Pag-isipan mo ha! May libreng pizza sa GA. Minsan.', en: 'Think about it, okay? There\'s free pizza at the GA. Sometimes.' }]
          : [
              { who: 'migs', text: 'Psst! Freshie! Naghahanap ka ba ng org?', en: 'Psst! Freshie! Looking for an org?' },
              {
                who: 'you',
                text: '...',
                choices: [
                  {
                    text: 'Anong org \'yan?', en: 'What org is it?',
                    then: [
                      { who: 'migs', text: 'Game dev org. Gumagawa kami ng laro tungkol sa campus.', en: 'A game dev org. We\'re making a game about the campus.' },
                      { who: 'you', text: 'Laro? Tungkol sa HAU?', en: 'A game? About HAU?' },
                      { who: 'migs', text: 'Oo! Naglalakad ka lang tapos kinakausap mo \'yung mga tao. Ang weird \'no?', en: 'Yeah! You just walk around and talk to people. Weird, right?' },
                      { who: 'you', text: '...Medyo pamilyar.', en: '...Sounds kind of familiar.' },
                    ],
                  },
                  {
                    text: 'May libre bang pagkain?', en: 'Is there free food?',
                    then: [
                      { who: 'migs', text: 'Diretso ka, ah. Gusto ko \'yan.', en: 'Straight to the point. I like that.' },
                      { who: 'migs', text: 'May pizza sa general assembly. Kung may budget.', en: 'There\'s pizza at the general assembly. If there\'s budget.' },
                    ],
                  },
                ],
              },
              { who: 'migs', text: 'Eto flyer. Booth namin nasa SOC, pag bukas na \'yung daan papunta doon.', en: 'Here\'s a flyer. Our booth\'s at SOC, once the way there opens up.', set: 'met_migs' },
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
              { who: '', text: 'Tinitigan ka lang niya. Sapat na raw ang isang himas kada araw.', en: 'It just stares at you. One pet a day is plenty, apparently.' },
            ]
          : [
              { who: 'cat', text: 'Meow.' },
              { who: '', text: 'Dahan-dahan mong hinimas si Mingming. Pumikit siya at nag-purr.', en: 'You gently pet Mingming. Its eyes close, and it starts to purr.' },
              { who: 'cat', text: 'Prrrrr...' },
              { who: 'you', text: 'Okay. Opisyal na. Gusto ko na dito.', en: 'Okay. It\'s official. I like it here.', set: 'pet_cat' },
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
      labelEn: 'Back to the lobby',
      height: 70,
      use: (g) => g.travel('lobby', 'courtyard'),
    },
    {
      id: 'arch',
      x: x.arch,
      range: 34,
      label: 'Tingnan ang arko',
      labelEn: 'Look at the arch',
      height: 90,
      use: (g) =>
        g.say([
          { who: '', text: '"LAUS DEO SEMPER." Nakaukit sa itaas ng tatlong arko, may nakasabit pang garland.', en: '"LAUS DEO SEMPER." Carved above the three arches, with a garland still hanging there.' },
          { who: '', text: 'Ilang libong estudyante na kaya ang dumaan dito bago ka?', en: 'How many thousands of students have walked through here before you?' },
        ]),
    },
    {
      id: 'chair',
      x: x.chair,
      range: 14,
      label: 'Tingnan ang upuan',
      labelEn: 'Look at the chair',
      height: 34,
      use: (g) =>
        g.say([
          { who: '', text: 'Isang puting monobloc, mag-isa sa gitna ng courtyard.', en: 'A white monobloc chair, all alone in the middle of the courtyard.' },
          { who: 'you', text: 'Kahit saan talaga sa Pilipinas, may ganito.', en: 'Anywhere you go in the Philippines, there\'s one of these.' },
        ]),
    },
    {
      id: 'gate',
      x: x.gate - 22,
      range: 20,
      label: 'Lumabas sa student center',
      labelEn: 'Go out to the student center',
      height: 60,
      use: (g) => g.travel('stuc', 'courtyard'),
    },
  ];
}

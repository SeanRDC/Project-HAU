// The main gate on Sto. Rosario St. Everyone gets their bag checked and taps
// their ID at the turnstile before they're let in. Edit freely.

import { Hotspot, NpcDef } from '../types';
import { ELLA, JOY, NONOY, TAHO } from './cast';

/** Where things stand in the scene, handed over by scenes/gate.ts. */
export interface GateSpots {
  street: number;
  arch: number;
  board: number;
  plaza: number;
}

export function gateNpcs(): NpcDef[] {
  return [
    {
      id: 'nonoy',
      name: 'Kuya Nonoy',
      look: NONOY,
      x: 620,
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
      x: 530,
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
      x: 936,
      depth: -4,
      facing: -1,
      wander: [900, 970],
      talk: () => [
        {
          who: 'taho',
          text: 'Tahooo! Bente lang, may sago pa. Pampagising bago klase!',
          choices: [
            {
              text: 'Sige po, isa.',
              then: [
                { who: '', text: 'Sinandok niya ang mainit na taho, binuhusan ng arnibal at sago.' },
                { who: 'you', text: 'Ang sarap. Parang elementary ulit.' },
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

export function gateHotspots(x: GateSpots): Hotspot[] {
  return [
    {
      id: 'plaza',
      x: x.plaza,
      range: 24,
      label: 'Pumunta sa DJN driveway',
      height: 56,
      use: (g) => g.travel('plaza', 'gate'),
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
          { who: '', text: 'HOLY ANGEL UNIVERSITY, sa gintong letra sa ibabaw ng gate. Sa itaas, ang selyo ng unibersidad.' },
          { who: '', text: 'Bukas na ang mga bakal na pinto. Sunod-sunod ang pasok ng mga naka-puti at maroon.' },
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

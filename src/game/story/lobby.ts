// Lobby of the DJN building. The history bits come from the university's own
// history page and the Angeles City tourism office; double check before
// quoting them anywhere official.

import { Hotspot, NpcDef } from '../types';
import { LIZA } from './cast';

export function lobbyNpcs(): NpcDef[] {
  return [
    {
      id: 'liza',
      name: 'Ate Liza',
      look: LIZA,
      x: 488,
      depth: -6,
      facing: -1,
      talk: (g) =>
        g.has('met_liza')
          ? [
              { who: 'liza', text: 'Kung may assignment ka tungkol sa Pampanga, dito ka pumunta, ha. Marami kaming lumang libro.' },
              { who: 'you', text: 'Tatandaan ko po.' },
            ]
          : [
              { who: 'liza', text: 'Good afternoon! Bago ka, ano? Ngayon lang kita nakita dito.' },
              { who: 'you', text: 'Opo. Ang ganda po pala dito sa loob.' },
              { who: 'liza', text: 'Naku, 1940 pa itong building na \'to. Ito ang pinakaunang gusali ng Holy Angel.' },
              { who: 'liza', text: 'Bago nito, sa kumbento lang ng simbahan nagkaklase ang mga estudyante.' },
              {
                who: 'liza',
                text: 'May gusto ka bang itanong?',
                choices: [
                  {
                    text: 'Ano po \'yung nasa likod ng pintong \'yan?',
                    then: [
                      { who: 'liza', text: 'Ang Center for Kapampangan Studies. May museo, library, at archives.' },
                      { who: 'liza', text: 'Sarado na ngayong hapon. Balik ka sa susunod, ililibot kita.' },
                    ],
                  },
                  {
                    text: 'Totoo po bang may multo dito?',
                    then: [
                      { who: 'liza', text: 'Hay naku, kayo talagang mga freshman.' },
                      { who: 'liza', text: 'Noong giyera, ginawa itong barracks ng mga sundalong Hapon. Kaya maraming kuwento.' },
                      { who: 'liza', text: 'Pero sa tagal ko dito, ang tanging nagpaparamdam lang ay \'yung aircon.' },
                    ],
                  },
                ],
              },
              { who: 'liza', text: 'O siya, mag-ikot ka. Bumati ka kay Don Juan diyan sa gitna.', set: 'met_liza' },
            ],
    },
  ];
}

export function lobbyHotspots(x: { entrance: number; bust: number; board: number; cks: number; arch: number }): Hotspot[] {
  return [
    {
      id: 'exit',
      x: x.entrance,
      range: 24,
      label: 'Lumabas sa driveway',
      height: 70,
      use: (g) => g.travel('plaza', 'door'),
    },
    {
      id: 'bust',
      x: x.bust,
      range: 26,
      label: 'Tingnan ang bust',
      height: 92,
      use: (g) =>
        g.say([
          { who: '', text: 'Nakaukit sa pedestal: "Juan D. Nepomuceno, 1892-1973. Ad Majorem Dei Gloriam."' },
          { who: '', text: 'Siya at si Fr. Pedro Santos ang nagtatag ng Holy Angel noong 1933. Pitumpu\'t walong estudyante lang sila noon.' },
          { who: 'you', text: 'Magandang hapon po, Don Juan. Freshman po. Paki-ingatan po ang grades ko.', set: 'saw_bust' },
        ]),
    },
    {
      id: 'board',
      x: x.board,
      range: 26,
      label: 'Basahin ang bulletin board',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: 'Sari-saring paskil: org recruitment, schedule ng enrollment, at isang "Tutor needed: Calculus. URGENT."' },
          { who: '', text: '"LOST: itim na USB, may sticker na pusa. Pakibalik sa School of Computing. Thesis po ang laman."' },
          { who: 'you', text: 'Kawawa naman. Sana mahanap niya.' },
        ]),
    },
    {
      id: 'cks',
      x: x.cks,
      range: 20,
      label: 'Subukan ang pinto',
      height: 60,
      use: (g) => g.say([{ who: '', text: 'Naka-lock. "Center for Kapampangan Studies: bukas Lunes hanggang Biyernes, 8:00 hanggang 4:00."' }]),
    },
    {
      id: 'arch',
      x: x.arch,
      range: 22,
      label: 'Pumunta sa courtyard',
      height: 70,
      use: (g) => g.travel('courtyard', 'lobby'),
    },
  ];
}

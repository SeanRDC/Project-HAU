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
              { who: 'liza', text: 'Kung may assignment ka tungkol sa Pampanga, dito ka pumunta, ha. Marami kaming lumang libro.', en: 'If you ever have an assignment about Pampanga, come here, okay? We have lots of old books.' },
              { who: 'you', text: 'Tatandaan ko po.', en: 'I\'ll remember that, ma\'am.' },
            ]
          : [
              { who: 'liza', text: 'Good afternoon! Bago ka, ano? Ngayon lang kita nakita dito.', en: 'Good afternoon! You\'re new, aren\'t you? I haven\'t seen you here before.' },
              { who: 'you', text: 'Opo. Ang ganda po pala dito sa loob.', en: 'Yes, ma\'am. It\'s beautiful in here.' },
              { who: 'liza', text: 'Naku, 1940 pa itong building na \'to. Ito ang pinakaunang gusali ng Holy Angel.', en: 'Oh, this building goes all the way back to 1940. It\'s Holy Angel\'s very first building.' },
              { who: 'liza', text: 'Bago nito, sa kumbento lang ng simbahan nagkaklase ang mga estudyante.', en: 'Before it was built, students held their classes in the church convent.' },
              {
                who: 'liza',
                text: 'May gusto ka bang itanong?', en: 'Is there anything you\'d like to ask?',
                choices: [
                  {
                    text: 'Ano po \'yung nasa likod ng pintong \'yan?', en: 'What\'s behind that door, ma\'am?',
                    then: [
                      { who: 'liza', text: 'Ang Center for Kapampangan Studies. May museo, library, at archives.', en: 'The Center for Kapampangan Studies. There\'s a museum, a library and archives.' },
                      { who: 'liza', text: 'Sarado na ngayong hapon. Balik ka sa susunod, ililibot kita.', en: 'It\'s closed this afternoon. Come back another time and I\'ll show you around.' },
                    ],
                  },
                  {
                    text: 'Totoo po bang may multo dito?', en: 'Is it true this place is haunted, ma\'am?',
                    then: [
                      { who: 'liza', text: 'Hay naku, kayo talagang mga freshman.', en: 'Oh, you freshmen, honestly.' },
                      { who: 'liza', text: 'Noong giyera, ginawa itong barracks ng mga sundalong Hapon. Kaya maraming kuwento.', en: 'During the war, Japanese soldiers used it as barracks. That\'s why there are so many stories.' },
                      { who: 'liza', text: 'Pero sa tagal ko dito, ang tanging nagpaparamdam lang ay \'yung aircon.', en: 'But in all my years here, the only thing that haunts this place is the aircon.' },
                    ],
                  },
                ],
              },
              { who: 'liza', text: 'O siya, mag-ikot ka. Bumati ka kay Don Juan diyan sa gitna.', en: 'All right, go and look around. Say hello to Don Juan there in the middle.', set: 'met_liza' },
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
      labelEn: 'Go out to the driveway',
      height: 70,
      use: (g) => g.travel('plaza', 'door'),
    },
    {
      id: 'bust',
      x: x.bust,
      range: 26,
      label: 'Tingnan ang bust',
      labelEn: 'Look at the bust',
      height: 92,
      use: (g) =>
        g.say([
          { who: '', text: 'Nakaukit sa pedestal: "Juan D. Nepomuceno, 1892-1973. Ad Majorem Dei Gloriam."', en: 'Engraved on the pedestal: "Juan D. Nepomuceno, 1892-1973. Ad Majorem Dei Gloriam."' },
          { who: '', text: 'Siya at si Fr. Pedro Santos ang nagtatag ng Holy Angel noong 1933. Pitumpu\'t walong estudyante lang sila noon.', en: 'He and Fr. Pedro Santos founded Holy Angel in 1933. There were only seventy-eight students back then.' },
          { who: 'you', text: 'Magandang hapon po, Don Juan. Freshman po. Paki-ingatan po ang grades ko.', en: 'Good afternoon, Don Juan, sir. I\'m a freshman. Please look after my grades.', set: 'saw_bust' },
        ]),
    },
    {
      id: 'board',
      x: x.board,
      range: 26,
      label: 'Basahin ang bulletin board',
      labelEn: 'Read the bulletin board',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: 'Sari-saring paskil: org recruitment, schedule ng enrollment, at isang "Tutor needed: Calculus. URGENT."', en: 'All sorts of notices: org recruitment, the enrollment schedule, and one that says "Tutor needed: Calculus. URGENT."' },
          { who: '', text: '"LOST: itim na USB, may sticker na pusa. Pakibalik sa School of Computing. Thesis po ang laman."', en: '"LOST: black USB with a cat sticker. Please return it to the School of Computing. My thesis is on it."' },
          { who: 'you', text: 'Kawawa naman. Sana mahanap niya.', en: 'Poor thing. I hope they find it.' },
        ]),
    },
    {
      id: 'cks',
      x: x.cks,
      range: 20,
      label: 'Subukan ang pinto',
      labelEn: 'Try the door',
      height: 60,
      use: (g) => g.say([{ who: '', text: 'Naka-lock. "Center for Kapampangan Studies: bukas Lunes hanggang Biyernes, 8:00 hanggang 4:00."', en: 'Locked. "Center for Kapampangan Studies: open Monday to Friday, 8:00 to 4:00."' }]),
    },
    {
      id: 'arch',
      x: x.arch,
      range: 22,
      label: 'Pumunta sa courtyard',
      labelEn: 'Go to the courtyard',
      height: 70,
      use: (g) => g.travel('courtyard', 'lobby'),
    },
  ];
}

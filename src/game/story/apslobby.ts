// What you can do in the APS lobby, under the canopy. The cashier, the TV,
// the whiteboards and the cash machine are all in the photos; what they say
// is made up. Writers: change it freely.

import { BUILDINGS } from '../campus/plan';
import { Hotspot } from '../types';
import { closedDoor, wayTo } from './campus';

export function apsLobbyHotspots(x: { exit: number; hall: number; cashier: number; boards: number; atm: number; stairs: number }): Hotspot[] {
  return [
    wayTo('exit', x.exit, 'Lumabas sa APS road', 'aps', 'apslobby', 70, 'Go out to the APS road'),
    closedDoor('hall', x.hall, BUILDINGS.aps),
    {
      id: 'cashier',
      x: x.cashier,
      range: 26,
      label: 'Sumilip sa cashier',
      labelEn: 'Peek into the cashier',
      height: 80,
      use: (g) =>
        g.say([
          { who: '', text: 'May pila na sa cashier. Sa TV sa itaas, umiikot ang mga paalala: deadline ng bayad, schedule ng exams.', en: 'There\'s already a line at the cashier. On the TV above, reminders scroll by: payment deadlines, exam schedules.' },
          { who: '', text: 'May papel na nakadikit sa salamin: "PLEASE PREPARE EXACT AMOUNT."', en: 'A sheet of paper taped to the glass: "PLEASE PREPARE EXACT AMOUNT."' },
          { who: 'you', text: 'Hindi pa ako magbabayad ngayon. Sana.', en: 'I\'m not paying anything today. Hopefully.' },
        ]),
    },
    {
      id: 'boards',
      x: x.boards,
      range: 26,
      label: 'Basahin ang whiteboard',
      labelEn: 'Read the whiteboard',
      height: 60,
      use: (g) =>
        g.say([
          { who: '', text: 'Sa kaliwang whiteboard, nakasulat sa asul: mga room na lumipat ngayong linggo.', en: 'On the left whiteboard, in blue: the rooms that moved this week.' },
          { who: '', text: 'Sa kanan, sa pula: "MEMO: Walang pasok ang 3rd floor sa Biyernes. Maglilinis."', en: 'On the right, in red: "MEMO: No classes on the 3rd floor on Friday. Cleaning."' },
          { who: 'you', text: 'Biyernes... Sana ako ang nasa 3rd floor.', en: 'Friday... I wish my classes were on the 3rd floor.' },
        ]),
    },
    {
      id: 'atm',
      x: x.atm,
      range: 20,
      label: 'Gamitin ang ATM',
      labelEn: 'Use the ATM',
      height: 60,
      use: (g) =>
        g.say([
          { who: '', text: 'Kumikislap ang screen: "TEMPORARILY OFFLINE. SORRY FOR THE INCONVENIENCE."', en: 'The screen blinks: "TEMPORARILY OFFLINE. SORRY FOR THE INCONVENIENCE."' },
          { who: 'you', text: 'Siyempre. Kung kailan kailangan.', en: 'Of course. Right when I need it.' },
        ]),
    },
    {
      id: 'stairs',
      x: x.stairs,
      range: 22,
      label: 'Tingnan ang hagdan',
      labelEn: 'Look at the stairs',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang hagdan papunta sa mga classroom sa itaas. May nakaharang na karatula: "INAAYOS PA ANG ITAAS."', en: 'The stairs up to the classrooms. A sign blocks the way: "UPSTAIRS STILL UNDER REPAIR."' },
          { who: 'you', text: 'Next time na lang. Hingal pa ako sa paglakad.', en: 'Next time. I\'m still out of breath from the walk.' },
        ]),
    },
  ];
}

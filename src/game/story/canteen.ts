// What you can do in the APS canteen: buy something at each stall, or sit for
// a bit. The stall names are the ones on their signs in the photos; what they
// sell and the prices are made up. Writers: change the menus freely.

import { BUILDINGS } from '../campus/plan';
import { Choice, GameApi, Hotspot, Line } from '../types';
import { closedDoor } from './campus';
import { buy } from './streets';

/** The stalls open at seven and close at seven, like the Yellow Food Court. */
function open(g: GameApi): boolean {
  return g.hour() >= 7 && g.hour() < 19;
}

/** A food stall; `greetingEn` is its greeting in English. */
function stall(id: string, x: number, name: string, greeting: string, menu: (g: GameApi) => Choice[], greetingEn?: string): Hotspot {
  return {
    id,
    x,
    range: 26,
    label: `Bumili sa ${name}`,
    labelEn: `Buy at ${name}`,
    height: 70,
    use: (g) => {
      if (!open(g)) {
        g.say([{ who: '', text: `Nakababa na ang shutter ng ${name}. Bukas ulit ng alas-siyete ng umaga.`, en: `${name} has its shutter down. It opens again at seven in the morning.` }]);
        return;
      }
      const lines: Line[] = [
        { who: '', text: greeting, en: greetingEn, choices: [...menu(g), { text: 'Titingin-tingin lang po.', en: 'Just looking, thanks.', then: [] }] },
      ];
      g.say(lines);
    },
  };
}

/** The front hallway, the one you come into from the patio. */
export function canteenHotspots(x: { exit: number; yum: number; granny: number; tables: number; back: number; byfrost: number }): Hotspot[] {
  return [
    { id: 'exit', x: x.exit, range: 24, label: 'Lumabas sa APS road', labelEn: 'Go out to the APS road', height: 70, use: (g) => g.travel('aps', 'canteen') },
    stall('yum', x.yum, "Yum-Yum's", '"YUM-YUM\'S, ALL-DAY EATS." Nakahilera sa salamin ang mga ulam, umuusok pa.', (g) => [
      buy(g, 'Chicken rice meal', 75, [
        { who: '', text: 'Isang hita, kanin, at sabaw sa maliit na tasa.', en: 'A chicken thigh, kanin, and soup in a little cup.' },
        { who: 'you', text: 'Ito ang tunay na pampasigla bago mag-lab.', en: 'Now this is real fuel before lab.' },
      ]),
      buy(g, 'Spaghetti', 50, [{ who: '', text: 'Matamis na spaghetti, may hotdog. Parang birthday party.', en: 'Sweet spaghetti with hotdog. Like a birthday party.' }]),
    ], '"YUM-YUM\'S, ALL-DAY EATS." Trays of ulam line the glass, still steaming.'),
    stall('granny', x.granny, "Granny Jing's", '"GRANNY JING\'S FOOD STATION." May mga kakanin at sitsirya na nakasabit sa gilid.', (g) => [
      buy(g, 'Tapsilog', 85, [
        { who: '', text: 'Tapa, sinangag, itlog na malasado. Klasiko.', en: 'Tapa, sinangag, and a runny egg. A classic.' },
        { who: 'you', text: 'Breakfast kahit tanghali na.', en: 'Breakfast, even though it\'s past noon.' },
      ]),
      buy(g, 'Turon', 20, [{ who: '', text: 'Mainit pa ang turon, malutong ang balat, may langka sa loob.', en: 'The turon is still warm, with a crispy wrapper and jackfruit inside.' }]),
    ], '"GRANNY JING\'S FOOD STATION." Kakanin and sitsirya hang along the side.'),
    {
      id: 'tables',
      x: x.tables,
      range: 30,
      label: 'Umupo sandali',
      labelEn: 'Sit for a while',
      height: 40,
      use: (g) =>
        g.say([
          {
            who: '',
            text: g.raining()
              ? 'Puno ang mga mesa. Lahat sumilong dito sa ulan, ang ingay ng patak sa awning.'
              : 'Umupo ka sa bangkong nakadikit sa mesa. May nag-iiwan ng bag para may pwesto, may nagre-review, may natutulog.',
            en: g.raining()
              ? 'Every table is full. Everyone has come in out of the rain, and it drums loudly on the awning.'
              : 'You sit on a bench fixed to a table. Some people leave a bag to save a seat, some are reviewing, some are asleep.',
          },
          { who: 'you', text: 'Ang sarap tumambay dito. Delikado, baka ma-late ako.', en: 'It\'s nice hanging out here. Dangerous, though. I might end up late.' },
        ]),
    },
    { id: 'back', x: x.back, range: 24, label: 'Dumaan sa likod ng canteen', labelEn: 'Go through to the back of the canteen', height: 70, use: (g) => g.travel('canteenback', 'front') },
    stall('byfrost', x.byfrost, 'Byfrost', '"BYFROST." Soft serve at waffle. May mga cooler na nakasalansan sa harap.', (g) => [
      buy(g, 'Soft serve', 30, [{ who: '', text: 'Vanilla sa apa. Natutunaw na agad sa init.', en: 'Vanilla in an apa cone. Already melting in the heat.' }]),
      buy(g, 'Waffle with ice cream', 55, [
        { who: '', text: 'Mainit na waffle, may ice cream at chocolate syrup.', en: 'A warm waffle with ice cream and chocolate syrup.' },
        { who: 'you', text: 'Gantimpala sa sarili. Nag-attend naman ako kanina.', en: 'A reward for myself. I did go to class earlier.' },
      ]),
    ], '"BYFROST." Soft serve and waffles. Coolers are stacked out front.'),
  ];
}

/** The back hallway: the HAU Coop's own stall, Rina's, and the way out across the lot to Sacred Heart. */
export function canteenBackHotspots(x: { front: number; coop: number; tables: number; sh: number; rina: number }): Hotspot[] {
  return [
    { id: 'front', x: x.front, range: 22, label: 'Bumalik sa harap ng canteen', labelEn: 'Back to the front of the canteen', height: 70, use: (g) => g.travel('canteen', 'back') },
    stall('coop', x.coop, 'HAU Coop Canteen', '"HAU COOP CANTEEN. EAT, DRINK, ENJOY." Nakasabit sa buong stall ang mga sitsirya, may tinapay sa salamin.', (g) => [
      buy(g, 'Pandesal at kape', 25, [{ who: '', text: 'Mainit pa ang pandesal. Instant na kape sa styro.', en: 'The pandesal is still warm. Instant coffee in a styrofoam cup.' }], 'Pandesal and coffee'),
      buy(g, 'Sitsirya', 15, [{ who: 'you', text: 'Pang-tawid gutom hanggang uwian.', en: 'Enough to hold me over till home time.' }]),
    ], '"HAU COOP CANTEEN. EAT, DRINK, ENJOY." Sitsirya hangs all over the stall, with bread behind the glass.'),
    {
      id: 'tables',
      x: x.tables,
      range: 30,
      label: 'Umupo sandali',
      labelEn: 'Sit for a while',
      height: 40,
      use: (g) =>
        g.say([
          { who: '', text: 'Mas tahimik dito sa likod. Tanaw ang parking at ang Sacred Heart sa kabila.', en: 'It\'s quieter back here. You can see the parking lot and Sacred Heart across the way.' },
          { who: '', text: 'May karatula sa poste: "CLEAN AS YOU GO."', en: 'A sign on the post: "CLEAN AS YOU GO."' },
          { who: 'you', text: 'Oo na po, liligpitin ko.', en: 'Yes, yes, I\'ll clean up after myself.' },
        ]),
    },
    { ...closedDoor('sh', x.sh, BUILDINGS.sh), label: 'Tumawid papuntang Sacred Heart', labelEn: 'Cross over to Sacred Heart' },
    stall('rina', x.rina, "Rina's Food Station", '"RINA\'S FOOD STATION." Puno ang ref ng softdrinks at tubig.', (g) => [
      buy(g, 'Bottled water', 20, [{ who: '', text: 'Malamig na tubig. Ang sarap sa init sa labas.', en: 'Cold water. So good with the heat outside.' }]),
      buy(g, 'Chips at softdrinks', 45, [{ who: 'you', text: 'Hindi ito healthy. Pero mamaya na ako magsisisi.', en: 'This isn\'t healthy. But I\'ll regret it later.' }], 'Chips and softdrinks'),
    ], '"RINA\'S FOOD STATION." The fridge is packed with softdrinks and water.'),
  ];
}

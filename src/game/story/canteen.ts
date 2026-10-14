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

function stall(id: string, x: number, name: string, greeting: string, menu: (g: GameApi) => Choice[]): Hotspot {
  return {
    id,
    x,
    range: 26,
    label: `Bumili sa ${name}`,
    height: 70,
    use: (g) => {
      if (!open(g)) {
        g.say([{ who: '', text: `Nakababa na ang shutter ng ${name}. Bukas ulit ng alas-siyete ng umaga.` }]);
        return;
      }
      const lines: Line[] = [{ who: '', text: greeting, choices: [...menu(g), { text: 'Titingin-tingin lang po.', then: [] }] }];
      g.say(lines);
    },
  };
}

/** The front hallway, the one you come into from the patio. */
export function canteenHotspots(x: { exit: number; yum: number; granny: number; tables: number; back: number; byfrost: number }): Hotspot[] {
  return [
    { id: 'exit', x: x.exit, range: 24, label: 'Lumabas sa APS road', height: 70, use: (g) => g.travel('aps', 'canteen') },
    stall('yum', x.yum, "Yum-Yum's", '"YUM-YUM\'S, ALL-DAY EATS." Nakahilera sa salamin ang mga ulam, umuusok pa.', (g) => [
      buy(g, 'Chicken rice meal', 75, [
        { who: '', text: 'Isang hita, kanin, at sabaw sa maliit na tasa.' },
        { who: 'you', text: 'Ito ang tunay na pampasigla bago mag-lab.' },
      ]),
      buy(g, 'Spaghetti', 50, [{ who: '', text: 'Matamis na spaghetti, may hotdog. Parang birthday party.' }]),
    ]),
    stall('granny', x.granny, "Granny Jing's", '"GRANNY JING\'S FOOD STATION." May mga kakanin at sitsirya na nakasabit sa gilid.', (g) => [
      buy(g, 'Tapsilog', 85, [
        { who: '', text: 'Tapa, sinangag, itlog na malasado. Klasiko.' },
        { who: 'you', text: 'Breakfast kahit tanghali na.' },
      ]),
      buy(g, 'Turon', 20, [{ who: '', text: 'Mainit pa ang turon, malutong ang balat, may langka sa loob.' }]),
    ]),
    {
      id: 'tables',
      x: x.tables,
      range: 30,
      label: 'Umupo sandali',
      height: 40,
      use: (g) =>
        g.say([
          {
            who: '',
            text: g.raining()
              ? 'Puno ang mga mesa. Lahat sumilong dito sa ulan, ang ingay ng patak sa awning.'
              : 'Umupo ka sa bangkong nakadikit sa mesa. May nag-iiwan ng bag para may pwesto, may nagre-review, may natutulog.',
          },
          { who: 'you', text: 'Ang sarap tumambay dito. Delikado, baka ma-late ako.' },
        ]),
    },
    { id: 'back', x: x.back, range: 24, label: 'Dumaan sa likod ng canteen', height: 70, use: (g) => g.travel('canteenback', 'front') },
    stall('byfrost', x.byfrost, 'Byfrost', '"BYFROST." Soft serve at waffle. May mga cooler na nakasalansan sa harap.', (g) => [
      buy(g, 'Soft serve', 30, [{ who: '', text: 'Vanilla sa apa. Natutunaw na agad sa init.' }]),
      buy(g, 'Waffle with ice cream', 55, [
        { who: '', text: 'Mainit na waffle, may ice cream at chocolate syrup.' },
        { who: 'you', text: 'Gantimpala sa sarili. Nag-attend naman ako kanina.' },
      ]),
    ]),
  ];
}

/** The back hallway: the HAU Coop's own stall, Rina's, and the way out across the lot to Sacred Heart. */
export function canteenBackHotspots(x: { front: number; coop: number; tables: number; sh: number; rina: number }): Hotspot[] {
  return [
    { id: 'front', x: x.front, range: 22, label: 'Bumalik sa harap ng canteen', height: 70, use: (g) => g.travel('canteen', 'back') },
    stall('coop', x.coop, 'HAU Coop Canteen', '"HAU COOP CANTEEN. EAT, DRINK, ENJOY." Nakasabit sa buong stall ang mga sitsirya, may tinapay sa salamin.', (g) => [
      buy(g, 'Pandesal at kape', 25, [{ who: '', text: 'Mainit pa ang pandesal. Instant na kape sa styro.' }]),
      buy(g, 'Sitsirya', 15, [{ who: 'you', text: 'Pang-tawid gutom hanggang uwian.' }]),
    ]),
    {
      id: 'tables',
      x: x.tables,
      range: 30,
      label: 'Umupo sandali',
      height: 40,
      use: (g) =>
        g.say([
          { who: '', text: 'Mas tahimik dito sa likod. Tanaw ang parking at ang Sacred Heart sa kabila.' },
          { who: '', text: 'May karatula sa poste: "CLEAN AS YOU GO."' },
          { who: 'you', text: 'Oo na po, liligpitin ko.' },
        ]),
    },
    { ...closedDoor('sh', x.sh, BUILDINGS.sh), label: 'Tumawid papuntang Sacred Heart' },
    stall('rina', x.rina, "Rina's Food Station", '"RINA\'S FOOD STATION." Puno ang ref ng softdrinks at tubig.', (g) => [
      buy(g, 'Bottled water', 20, [{ who: '', text: 'Malamig na tubig. Ang sarap sa init sa labas.' }]),
      buy(g, 'Chips at softdrinks', 45, [{ who: 'you', text: 'Hindi ito healthy. Pero mamaya na ako magsisisi.' }]),
    ]),
  ];
}

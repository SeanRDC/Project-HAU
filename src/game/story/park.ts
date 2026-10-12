// Epiphany of Angels. The Memorare text is paraphrased from the marker on
// campus; the quiz answers match the facts used in the lobby.

import { BUILDINGS } from '../campus/plan';
import { Hotspot, Line, NpcDef } from '../types';
import { closedDoor, deadEnd, wayTo } from './campus';
import { BONG, ENZO, KATH } from './cast';

function quiz(): Line[] {
  return [
    { who: 'kath', text: 'Sige, ikaw magtanong... ay hindi, ako pala. Ikaw sasagot. Ready?' },
    {
      who: 'kath',
      text: 'Kailan itinatag ang Holy Angel?',
      choices: [
        { text: '1933', then: [{ who: 'kath', text: 'Tama! Academy pa lang noon, sa kumbento ng simbahan.' }] },
        { text: '1940', then: [{ who: 'kath', text: 'Mali. 1940 \'yung DJN Building. 1933 ang school mismo.' }] },
        { text: '1981', then: [{ who: 'kath', text: 'Mali. 1981 naging university. 1933 itinatag.' }] },
      ],
    },
    {
      who: 'kath',
      text: 'Next. Ano ang ibig sabihin ng "Laus Deo Semper"?',
      choices: [
        { text: 'Praise God always', then: [{ who: 'kath', text: 'Korek. Nakasulat kahit saan dito, mahirap kalimutan.' }] },
        { text: 'Para sa Diyos at bayan', then: [{ who: 'kath', text: 'Hindi. "Praise God always." Ibang school yata \'yang iniisip mo.' }] },
        { text: 'Laging mag-aral', then: [{ who: 'kath', text: 'Hahaha! Sana nga. "Praise God always" ang sagot.' }] },
      ],
    },
    {
      who: 'kath',
      text: 'Last. Sino ang nagtatag, kasama si Fr. Pedro Santos?',
      choices: [
        { text: 'Si Don Juan D. Nepomuceno', then: [{ who: 'kath', text: 'Yes! \'Yung may bust sa lobby.' }] },
        { text: 'Si Kuya Ramil', then: [{ who: 'kath', text: 'Si Kuya Ramil na guard?! Matagal na siya dito pero hindi naman ganun katagal.' }] },
      ],
    },
    { who: 'kath', text: 'Okay, medyo kabisado ko na. Salamat ha! Libre kita ng kwek-kwek pag pumasa ako.', set: 'quiz_kath' },
    { who: 'you', text: 'Tatandaan ko \'yan.' },
  ];
}

/** Where each of them stands: Kath by a bench, the other two strolling between the two x's. */
export function parkNpcs(x: { kath: number; bong: [number, number]; enzo: [number, number] }): NpcDef[] {
  return [
    {
      id: 'kath',
      name: 'Kath',
      look: KATH,
      x: x.kath,
      depth: -8,
      facing: 1,
      talk: (g) =>
        g.has('quiz_kath')
          ? [
              { who: 'kath', text: 'Isa pang round? Sige, para sure.' },
              ...quiz().slice(1, 4),
              { who: 'kath', text: 'Ayan. Kaya ko na \'to. Siguro.' },
            ]
          : [
              { who: 'kath', text: '...1933, 1940, 1981... 1933, 1940...' },
              { who: 'you', text: 'Okay ka lang?' },
              { who: 'kath', text: 'May quiz kami sa HAU history mamaya tapos kagabi ko lang nalaman. Pwede mo ba \'kong i-review?' },
              ...quiz(),
            ],
    },
    {
      id: 'bong',
      name: 'Mang Bong',
      look: BONG,
      x: (x.bong[0] + x.bong[1]) / 2,
      depth: -5,
      facing: 1,
      wander: x.bong,
      talk: (g) =>
        g.has('met_bong') && g.raining()
          ? [
              { who: 'bong', text: 'O, buti may payong ka. Ako, sanay na. Basa na rin naman ako kanina pa.' },
              { who: 'bong', text: 'At least hindi ko na kailangang diligan ang damo ngayon.' },
            ]
          : g.has('met_bong')
          ? [
              { who: 'bong', text: 'Dahon na naman. Walis ka nang walis, bukas meron ulit.' },
              { who: 'bong', text: 'Pero ayos lang. Ibig sabihin buhay pa \'yung mga puno.' },
            ]
          : [
              { who: 'bong', text: 'Dahan-dahan sa damo, anak, kadidilig ko lang diyan.' },
              { who: 'you', text: 'Pasensya na po. Matagal na po kayo dito?' },
              { who: 'bong', text: 'Naku. Bata pa \'ko nung pumutok ang Pinatubo, dito na nagtatrabaho tatay ko.' },
              { who: 'bong', text: 'Kulay abo lahat noon. Bubong, kalsada, pati buhok mo. Akala namin wala nang tutubo.' },
              { who: 'bong', text: 'Tingnan mo ngayon. Kaya inaalagaan ko \'tong mga halaman.', set: 'met_bong' },
            ],
    },
    {
      id: 'enzo',
      name: 'Enzo',
      look: ENZO,
      x: (x.enzo[0] + x.enzo[1]) / 2,
      depth: -4,
      facing: -1,
      wander: x.enzo,
      talk: (g) => {
        const h = g.hour();
        const light: Line =
          h >= 16.5 && h < 18.6
            ? { who: 'enzo', text: 'Golden hour! Ito \'yung hinihintay ko. Tingnan mo \'yung ilaw sa pakpak ng mga anghel.' }
            : h >= 18.6 || h < 5
              ? { who: 'enzo', text: 'Gabi na, pero ang ganda ng mga ilaw ng poste. Long exposure tayo.' }
              : { who: 'enzo', text: 'Masyado pang matigas ang araw. Balik ako mamayang hapon, mga alas-singko.' };
        return g.has('met_enzo')
          ? [light]
          : [
              { who: 'enzo', text: 'Teka, \'wag kang gagalaw... ayan. Ganda ng silhouette mo.' },
              { who: 'you', text: 'Ha? Kinunan mo \'ko?' },
              { who: 'enzo', text: 'Para sa school paper. Feature namin \'yung campus sa iba\'t ibang oras ng araw.' },
              light,
              { who: 'enzo', text: 'Pindutin mo \'yung T kung gusto mong bumilis ang oras. Joke lang. ...O hindi.', set: 'met_enzo' },
            ];
      },
    },
  ];
}

export function parkHotspots(x: {
  gate: number; memorare: number; guardian: number; archangels: number; seal: number; sfj: number; fountain: number; exit: number;
}): Hotspot[] {
  return [
    deadEnd(
      'gate',
      x.gate,
      'Tingnan ang gate',
      'Ang gate sa dulo ng Epiphany of Angels. Sarado ito ngayon: sa side gate sa tabi ng Main Building pumapasok at lumalabas ang mga estudyante.',
    ),
    {
      id: 'memorare',
      x: x.memorare,
      range: 28,
      label: 'Basahin ang Memorare',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: '"MEMORARE." Alaala ito sa lahat ng dumanas ng pagputok ng Bundok Pinatubo noong 15 Hunyo 1991, at ng mga lahar mula 1991 hanggang 1995.' },
          { who: '', text: 'Sa mga araw at gabi ng lindol at pag-ulan ng abo. Sa mga nawalan ng tahanan, ng kabuhayan, ng mahal sa buhay.' },
          { who: '', text: '"May we always remember what we suffered. May we always celebrate that we triumphed."' },
          { who: 'you', text: '...Hindi pa \'ko ipinapanganak noon. Pero dito lumaki sina Mama.', set: 'saw_memorare' },
        ]),
    },
    {
      id: 'guardian',
      x: x.guardian,
      range: 26,
      label: 'Tingnan ang anghel',
      height: 100,
      use: (g) =>
        g.say([
          { who: '', text: '"HOLY GUARDIAN ANGEL." Sa plake, nakaukit ang panalangin sa Anghel de la Guardia.' },
          { who: '', text: 'Nakataas ang isang kamay, parang may itinuturo sa itaas. Sa kanya ipinangalan ang buong unibersidad.' },
        ]),
    },
    {
      id: 'archangels',
      x: x.archangels,
      range: 60,
      label: 'Tingnan ang mga arkanghel',
      height: 100,
      use: (g) =>
        g.say([
          { who: '', text: 'Pitong arkanghel na yari sa puting bato, nakahanay sa magkabilang gilid ng daan, bawat isa may sariling plake.' },
          { who: 'you', text: 'Michael, Gabriel, Raphael... at apat pang hindi ko kabisado. Sorry po.' },
        ]),
    },
    {
      id: 'seal',
      x: x.seal,
      range: 30,
      label: 'Tingnan ang seal',
      height: 20,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang seal ng Holy Angel University, nakalatag sa gitna ng daan. "Laus Deo Semper. 1933. Angeles City."' },
          { who: '', text: 'Sabi ng mga senior, malas daw tapakan \'to bago ka grumaduate.' },
          { who: 'you', text: '...Nasa gitna mismo ng daan. Paano iiwasan \'yan?' },
        ]),
    },
    closedDoor('sfj', x.sfj, BUILDINGS.sfj),
    {
      id: 'fountain',
      x: x.fountain,
      range: 26,
      label: 'Tingnan ang fountain',
      height: 40,
      use: (g) =>
        g.say([
          { who: '', text: 'Bilog na fountain sa gitna ng plaza sa harap ng SFJ. Isang singsing ng bumubulang tubig sa paligid ng batong mangkok sa gitna.' },
          { who: 'you', text: 'Uy, bukas ang fountain. Binubuksan lang nila \'to pag may bisita.' },
          { who: 'you', text: '...Sino kayang bisita ngayon?' },
        ]),
    },
    wayTo('exit', x.exit, 'Pumunta sa harap ng Main Bldg.', 'plaza', 'epiphany'),
  ];
}

// Epiphany of Angels. The Memorare text is paraphrased from the marker on
// campus; the quiz answers match the facts used in the lobby.

import { BUILDINGS } from '../campus/plan';
import { Hotspot, Line, NpcDef } from '../types';
import { closedDoor, deadEnd, wayTo } from './campus';
import { BONG, ENZO, KATH } from './cast';

function quiz(): Line[] {
  return [
    { who: 'kath', text: 'Sige, ikaw magtanong... ay hindi, ako pala. Ikaw sasagot. Ready?', en: 'Okay, you ask... wait, no, I ask. You answer. Ready?' },
    {
      who: 'kath',
      text: 'Kailan itinatag ang Holy Angel?', en: 'When was Holy Angel founded?',
      choices: [
        { text: '1933', then: [{ who: 'kath', text: 'Tama! Academy pa lang noon, sa kumbento ng simbahan.', en: 'Right! It was just an academy back then, in the church convent.' }] },
        { text: '1940', then: [{ who: 'kath', text: 'Mali. 1940 \'yung DJN Building. 1933 ang school mismo.', en: 'Wrong. 1940 is the DJN Building. The school itself is 1933.' }] },
        { text: '1981', then: [{ who: 'kath', text: 'Mali. 1981 naging university. 1933 itinatag.', en: 'Wrong. 1981 is when it became a university. It was founded in 1933.' }] },
      ],
    },
    {
      who: 'kath',
      text: 'Next. Ano ang ibig sabihin ng "Laus Deo Semper"?', en: 'Next. What does "Laus Deo Semper" mean?',
      choices: [
        { text: 'Praise God always', then: [{ who: 'kath', text: 'Korek. Nakasulat kahit saan dito, mahirap kalimutan.', en: 'Correct. It\'s written everywhere here, so it\'s hard to forget.' }] },
        { text: 'Para sa Diyos at bayan', en: 'For God and country', then: [{ who: 'kath', text: 'Hindi. "Praise God always." Ibang school yata \'yang iniisip mo.', en: 'Nope. "Praise God always." You must be thinking of another school.' }] },
        { text: 'Laging mag-aral', en: 'Always study', then: [{ who: 'kath', text: 'Hahaha! Sana nga. "Praise God always" ang sagot.', en: 'Hahaha! If only. The answer is "Praise God always."' }] },
      ],
    },
    {
      who: 'kath',
      text: 'Last. Sino ang nagtatag, kasama si Fr. Pedro Santos?', en: 'Last one. Who founded it, together with Fr. Pedro Santos?',
      choices: [
        { text: 'Si Don Juan D. Nepomuceno', en: 'Don Juan D. Nepomuceno', then: [{ who: 'kath', text: 'Yes! \'Yung may bust sa lobby.', en: 'Yes! The one with the bust in the lobby.' }] },
        { text: 'Si Kuya Ramil', en: 'Kuya Ramil', then: [{ who: 'kath', text: 'Si Kuya Ramil na guard?! Matagal na siya dito pero hindi naman ganun katagal.', en: 'Kuya Ramil the guard?! He\'s been here a long time, but not that long.' }] },
      ],
    },
    { who: 'kath', text: 'Okay, medyo kabisado ko na. Salamat ha! Libre kita ng kwek-kwek pag pumasa ako.', en: 'Okay, I think I\'ve mostly got it down. Thanks! Kwek-kwek\'s on me if I pass.', set: 'quiz_kath' },
    { who: 'you', text: 'Tatandaan ko \'yan.', en: 'I\'ll hold you to that.' },
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
              { who: 'kath', text: 'Isa pang round? Sige, para sure.', en: 'Another round? Sure, just to be safe.' },
              ...quiz().slice(1, 4),
              { who: 'kath', text: 'Ayan. Kaya ko na \'to. Siguro.', en: 'There. I\'ve got this. Probably.' },
            ]
          : [
              { who: 'kath', text: '...1933, 1940, 1981... 1933, 1940...' },
              { who: 'you', text: 'Okay ka lang?', en: 'You okay?' },
              { who: 'kath', text: 'May quiz kami sa HAU history mamaya tapos kagabi ko lang nalaman. Pwede mo ba \'kong i-review?', en: 'We have a quiz on HAU history later and I only found out last night. Can you help me review?' },
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
              { who: 'bong', text: 'O, buti may payong ka. Ako, sanay na. Basa na rin naman ako kanina pa.', en: 'Oh, good thing you\'ve got an umbrella. Me, I\'m used to it. I\'ve been soaked for a while anyway.' },
              { who: 'bong', text: 'At least hindi ko na kailangang diligan ang damo ngayon.', en: 'At least I don\'t have to water the grass today.' },
            ]
          : g.has('met_bong')
          ? [
              { who: 'bong', text: 'Dahon na naman. Walis ka nang walis, bukas meron ulit.', en: 'Leaves again. You sweep and sweep, and tomorrow there\'s more.' },
              { who: 'bong', text: 'Pero ayos lang. Ibig sabihin buhay pa \'yung mga puno.', en: 'But that\'s all right. It means the trees are still alive.' },
            ]
          : [
              { who: 'bong', text: 'Dahan-dahan sa damo, anak, kadidilig ko lang diyan.', en: 'Easy on the grass, anak, I just watered it.' },
              { who: 'you', text: 'Pasensya na po. Matagal na po kayo dito?', en: 'Sorry, sir. Have you been working here long?' },
              { who: 'bong', text: 'Naku. Bata pa \'ko nung pumutok ang Pinatubo, dito na nagtatrabaho tatay ko.', en: 'Oh, my. I was still a boy when Pinatubo erupted, and my father was already working here.' },
              { who: 'bong', text: 'Kulay abo lahat noon. Bubong, kalsada, pati buhok mo. Akala namin wala nang tutubo.', en: 'Everything was gray back then. Roofs, roads, even your hair. We thought nothing would ever grow again.' },
              { who: 'bong', text: 'Tingnan mo ngayon. Kaya inaalagaan ko \'tong mga halaman.', en: 'Look at it now. That\'s why I take care of these plants.', set: 'met_bong' },
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
            ? { who: 'enzo', text: 'Golden hour! Ito \'yung hinihintay ko. Tingnan mo \'yung ilaw sa pakpak ng mga anghel.', en: 'Golden hour! This is what I\'ve been waiting for. Look at the light on the angels\' wings.' }
            : h >= 18.6 || h < 5
              ? { who: 'enzo', text: 'Gabi na, pero ang ganda ng mga ilaw ng poste. Long exposure tayo.', en: 'It\'s night, but the lampposts look great. Time for a long exposure.' }
              : { who: 'enzo', text: 'Masyado pang matigas ang araw. Balik ako mamayang hapon, mga alas-singko.', en: 'The sun\'s still too harsh. I\'ll come back this afternoon, around five.' };
        return g.has('met_enzo')
          ? [light]
          : [
              { who: 'enzo', text: 'Teka, \'wag kang gagalaw... ayan. Ganda ng silhouette mo.', en: 'Wait, don\'t move... there. Nice silhouette.' },
              { who: 'you', text: 'Ha? Kinunan mo \'ko?', en: 'Huh? Did you just take my picture?' },
              { who: 'enzo', text: 'Para sa school paper. Feature namin \'yung campus sa iba\'t ibang oras ng araw.', en: 'It\'s for the school paper. We\'re doing a feature on the campus at different times of day.' },
              light,
              { who: 'enzo', text: 'Pindutin mo \'yung T kung gusto mong bumilis ang oras. Joke lang. ...O hindi.', en: 'Press T if you want time to go faster. Just kidding. ...Or am I?', set: 'met_enzo' },
            ];
      },
    },
  ];
}

export function parkHotspots(x: {
  gate: number; memorare: number; guardian: number; archangels: number; seal: number; sfj: number; fountain: number; exit: number; flag: number;
}): Hotspot[] {
  return [
    deadEnd(
      'gate',
      x.gate,
      'Tingnan ang gate',
      'Ang gate sa dulo ng Epiphany of Angels. Sarado ito ngayon: sa side gate sa tabi ng Main Building pumapasok at lumalabas ang mga estudyante.',
      {
        label: 'Look at the gate',
        text: 'The gate at the end of the Epiphany of Angels. It\'s closed for now: students come and go by the side gate beside the Main Building.',
      },
    ),
    {
      id: 'memorare',
      x: x.memorare,
      range: 28,
      label: 'Basahin ang Memorare',
      labelEn: 'Read the Memorare',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: '"MEMORARE." Alaala ito sa lahat ng dumanas ng pagputok ng Bundok Pinatubo noong 15 Hunyo 1991, at ng mga lahar mula 1991 hanggang 1995.', en: '"MEMORARE." A memorial to everyone who lived through the eruption of Mount Pinatubo on 15 June 1991, and the lahars from 1991 to 1995.' },
          { who: '', text: 'Sa mga araw at gabi ng lindol at pag-ulan ng abo. Sa mga nawalan ng tahanan, ng kabuhayan, ng mahal sa buhay.', en: 'To the days and nights of earthquakes and falling ash. To those who lost their homes, their livelihoods, their loved ones.' },
          { who: '', text: '"May we always remember what we suffered. May we always celebrate that we triumphed."' },
          { who: 'you', text: '...Hindi pa \'ko ipinapanganak noon. Pero dito lumaki sina Mama.', en: '...I wasn\'t even born yet. But this is where Mama and her family grew up.', set: 'saw_memorare' },
        ]),
    },
    {
      id: 'guardian',
      x: x.guardian,
      range: 26,
      label: 'Tingnan ang anghel',
      labelEn: 'Look at the angel',
      height: 100,
      use: (g) =>
        g.say([
          { who: '', text: '"HOLY GUARDIAN ANGEL." Sa plake, nakaukit ang panalangin sa Anghel de la Guardia.', en: '"HOLY GUARDIAN ANGEL." The plaque is engraved with the prayer to the Guardian Angel.' },
          { who: '', text: 'Nakataas ang isang kamay, parang may itinuturo sa itaas. Sa kanya ipinangalan ang buong unibersidad.', en: 'One hand is raised, as if pointing at something above. The whole university is named after him.' },
        ]),
    },
    {
      id: 'archangels',
      x: x.archangels,
      range: 60,
      label: 'Tingnan ang mga arkanghel',
      labelEn: 'Look at the archangels',
      height: 100,
      use: (g) =>
        g.say([
          { who: '', text: 'Pitong arkanghel na yari sa puting bato, nakahanay sa magkabilang gilid ng daan, bawat isa may sariling plake.', en: 'Seven archangels carved from white stone, lined up on both sides of the road, each with its own plaque.' },
          { who: 'you', text: 'Michael, Gabriel, Raphael... at apat pang hindi ko kabisado. Sorry po.', en: 'Michael, Gabriel, Raphael... and four more I don\'t know by heart. My apologies.' },
        ]),
    },
    {
      id: 'seal',
      x: x.seal,
      range: 30,
      label: 'Tingnan ang seal',
      labelEn: 'Look at the seal',
      height: 20,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang seal ng Holy Angel University, nakalatag sa gitna ng daan. "Laus Deo Semper. 1933. Angeles City."', en: 'The Holy Angel University seal, set into the middle of the road. "Laus Deo Semper. 1933. Angeles City."' },
          { who: '', text: 'Sabi ng mga senior, malas daw tapakan \'to bago ka grumaduate.', en: 'The seniors say it\'s bad luck to step on it before you graduate.' },
          { who: 'you', text: '...Nasa gitna mismo ng daan. Paano iiwasan \'yan?', en: '...It\'s right in the middle of the road. How are you supposed to avoid it?' },
        ]),
    },
    closedDoor('sfj', x.sfj, BUILDINGS.sfj),
    {
      id: 'fountain',
      x: x.fountain,
      range: 26,
      label: 'Tingnan ang fountain',
      labelEn: 'Look at the fountain',
      height: 40,
      use: (g) =>
        g.say([
          { who: '', text: 'Bilog na fountain sa gitna ng plaza sa harap ng SFJ. Isang singsing ng bumubulang tubig sa paligid ng batong mangkok sa gitna.', en: 'A round fountain in the middle of the plaza in front of SFJ. A ring of bubbling jets around a stone bowl in the center.' },
          { who: 'you', text: 'Uy, bukas ang fountain. Binubuksan lang nila \'to pag may bisita.', en: 'Oh, the fountain\'s on. They only turn it on when there are visitors.' },
          { who: 'you', text: '...Sino kayang bisita ngayon?', en: '...Who could be visiting today?' },
        ]),
    },
    wayTo('exit', x.exit, 'Pumunta sa harap ng Main Bldg.', 'plaza', 'epiphany', 50, 'Go to the front of the Main Bldg.'),
    wayTo('flag', x.flag, 'Umakyat sa flagpole (side gate)', 'entry', 'sfj', 50, 'Go up to the flagpole (side gate)'),
  ];
}

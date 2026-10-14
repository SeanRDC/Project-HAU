// The flag plaza inside the side gate, where you come out after tapping your
// ID. Three flights of steps go down from it: left to the front of the Main
// Building, the middle one to the parking and St. Therese, right to SFJ and
// the Epiphany of Angels. Dialogue is Taglish with a bit of Kapampangan. Edit freely.

import { Hotspot, NpcDef, Step } from '../types';
import { wayTo } from './campus';
import { WENG } from './cast';
import { ella } from './gate';

/** What the story needs from the scene to walk you in and out along the walkway. */
export interface Walk {
  /** where you stand on the plaza before going down the walkway, and after coming up it */
  stand: number;
  /** the x you walk towards, far down the walkway */
  far: number;
  /** how far up the screen the far end is from where you stand */
  rise: number;
  /** tells the scene someone is about to walk away down the walkway, or come up it, so it can keep the posts in front of them */
  trip(out: boolean, time: number): void;
}

const IN_TIME = 2.6;
const OUT_TIME = 2.8;

/** Coming in through the gate: up the walkway towards the camera, onto the plaza. */
export function arrive(w: Walk): Step[] {
  return [{ run: () => w.trip(true, OUT_TIME) }, { walkOut: 'you', from: w.far, rise: w.rise, time: OUT_TIME }];
}

/** Down the walkway, away from the camera, and out through the gate to the street. */
function leave(w: Walk): Step[] {
  return [
    { walk: w.stand },
    { run: () => w.trip(false, IN_TIME) },
    { walkIn: 'you', to: w.far, rise: w.rise, time: IN_TIME },
    { run: (g) => g.travel('gate', 'entry') },
  ];
}

export function entryHotspots(x: { djn: number; flag: number; stl: number; sfj: number }, w: Walk): Hotspot[] {
  return [
    wayTo('djn', x.djn, 'Bumaba papunta sa Main Bldg.', 'plaza', 'entry'),
    {
      id: 'flag',
      x: x.flag,
      range: 24,
      label: 'Tingnan ang flagpole',
      height: 70,
      use: (g) =>
        g.say([
          { who: '', text: 'Ang watawat ng Pilipinas, sa ibabaw ng granite na pedestal sa gitna ng bilog na plaza.' },
          { who: '', text: 'Sa sahig, isang malaking bituin: walong tulis ng damo at walong itim na tatsulok. May kadena sa paligid ng pedestal para walang umupo.' },
          { who: '', text: 'May dilaw na karatula sa tabi ng poste: "EVACUATION SITE 5." Dito pala pupunta kapag may lindol.' },
          { who: '', text: 'Sa dulo ng walkway, sa likod ng gate na dinaanan mo: LAUS DEO SEMPER 1933. "Purihin ang Diyos lagi." Ang taon nang itatag ang HAU.' },
          { who: 'you', text: 'Kaya pala pareho sa nakasulat sa seal.', set: 'saw_flag' },
        ]),
    },
    wayTo('stl', x.stl, 'Bumaba papunta sa parking (STL)', 'lane', 'entry', 30),
    {
      id: 'gate',
      x: w.stand,
      range: 22,
      label: 'Lumabas sa side gate',
      height: 50,
      use: (g) => g.play(leave(w)),
    },
    wayTo('sfj', x.sfj, 'Bumaba papunta sa SFJ at Epiphany', 'park', 'entry'),
  ];
}

export function entryNpcs(x: { weng: number; ella: number; wander: [number, number] }): NpcDef[] {
  return [
    // she came in through the gate just ahead of you
    ella(x.ella, x.wander),
    {
      id: 'weng',
      name: 'Ate Weng',
      look: WENG,
      x: x.weng,
      depth: -10,
      facing: 1,
      talk: (g) => {
        if (g.has('met_weng')) {
          return [{ who: 'weng', text: 'Kaliwa, Main Building. Gitna, parking. Kanan, SFJ. \'Wag kang maliligaw, ha.' }];
        }
        const h = g.hour();
        const hello = h < 12 ? 'Mayap a abak!' : h < 18 ? 'Mayap a gatpanapun!' : 'Mayap a bengi!';
        return [
          { who: 'weng', face: 'happy', text: `${hello} First day mo, \'no? Halata sa mukha mo, naliligaw ka na agad.` },
          { who: 'you', face: 'shy', text: 'Halata po ba?' },
          { who: 'weng', text: 'Tandaan mo lang \'tong tatlong hagdan.' },
          { who: 'weng', text: 'Sa kaliwa, papunta sa harap ng Main Building. Sa gitna, sa parking at sa St. Therese. Sa kanan, sa SFJ at sa Epiphany of Angels.', set: 'met_weng' },
          { who: 'you', face: 'happy', text: 'Kaliwa, Main. Gitna, parking. Kanan, SFJ. Dakal a salamat, Ate!' },
        ];
      },
    },
  ];
}

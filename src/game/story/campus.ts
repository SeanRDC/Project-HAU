// Hotspots shared by the campus streets: doors of buildings that have no
// interior yet, and the signposts that take you from one street to the next.
// What each building holds comes from the 2022 campus map (see campus/plan.ts).

import { Building } from '../campus/plan';
import { Hotspot, Line } from '../types';

function listed(items: string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} at ${items[items.length - 1]}`;
}

/** The same list, joined in English. */
function listedEn(items: string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * The door of a building you can't go into yet. Reading it tells you the
 * building's name and what is inside, so the walk still teaches the campus.
 * `near` is for buildings on the camera's side of the street: you turn to it
 * instead of walking up to a door.
 */
export function closedDoor(id: string, x: number, b: Building, near = false): Hotspot {
  const lines: Line[] = [
    {
      who: '',
      text: `"${b.name.toUpperCase()}."${b.no ? ` Building ${b.no} sa campus map.` : ''}`,
      en: `"${b.name.toUpperCase()}."${b.no ? ` Building ${b.no} on the campus map.` : ''}`,
    },
  ];
  if (b.inside.length) lines.push({ who: '', text: `Nandito ang ${listed(b.inside)}.`, en: `Inside: ${listedEn(b.inside)}.` });
  lines.push(
    near
      ? { who: 'you', text: 'Nasa kabilang side ng daan. Babalikan ko na lang \'pag bukas na.', en: 'It\'s on the other side of the road. I\'ll come back once it\'s open.' }
      : {
          who: '',
          text: 'Sarado pa ang pinto. May papel na nakadikit: "Inaayos pa ang loob. Balik ka sa susunod."',
          en: 'The door is still closed. A sheet of paper is taped to it: "Still fixing up the inside. Come back next time."',
        },
  );
  return {
    id,
    x,
    range: 22,
    label: near ? `Lingunin ang ${b.short}` : `Tingnan ang ${b.short}`,
    labelEn: near ? `Look back at ${b.short}` : `Look at ${b.short}`,
    height: near ? 30 : 60,
    use: (g) => g.say(lines),
  };
}

/** A way out of the scene: walks you to another street. `labelEn` is the label in English. */
export function wayTo(id: string, x: number, label: string, area: string, spawn: string, height = 50, labelEn?: string): Hotspot {
  return { id, x, range: 22, label, labelEn, height, use: (g) => g.travel(area, spawn) };
}

/** Somewhere the road stops: a wall, a locked gate. `en` has the label and the line in English. */
export function deadEnd(id: string, x: number, label: string, text: string, en?: { label?: string; text?: string }): Hotspot {
  return { id, x, range: 22, label, labelEn: en?.label, height: 50, use: (g) => g.say([{ who: '', text, en: en?.text }]) };
}

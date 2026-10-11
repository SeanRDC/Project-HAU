// Hotspots shared by the campus streets: doors of buildings that have no
// interior yet, and the signposts that take you from one street to the next.
// What each building holds comes from the 2022 campus map (see campus/plan.ts).

import { Building } from '../campus/plan';
import { Hotspot, Line } from '../types';

function listed(items: string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} at ${items[items.length - 1]}`;
}

/**
 * The door of a building you can't go into yet. Reading it tells you the
 * building's name and what is inside, so the walk still teaches the campus.
 * `near` is for buildings on the camera's side of the street: you turn to it
 * instead of walking up to a door.
 */
export function closedDoor(id: string, x: number, b: Building, near = false): Hotspot {
  const lines: Line[] = [{ who: '', text: `"${b.name.toUpperCase()}."${b.no ? ` Building ${b.no} sa campus map.` : ''}` }];
  if (b.inside.length) lines.push({ who: '', text: `Nandito ang ${listed(b.inside)}.` });
  lines.push(
    near
      ? { who: 'you', text: 'Nasa kabilang side ng daan. Babalikan ko na lang \'pag bukas na.' }
      : { who: '', text: 'Sarado pa ang pinto. May papel na nakadikit: "Inaayos pa ang loob. Balik ka sa susunod."' },
  );
  return {
    id,
    x,
    range: 22,
    label: near ? `Lingunin ang ${b.short}` : `Tingnan ang ${b.short}`,
    height: near ? 30 : 60,
    use: (g) => g.say(lines),
  };
}

/** A way out of the scene: walks you to another street. */
export function wayTo(id: string, x: number, label: string, area: string, spawn: string, height = 50): Hotspot {
  return { id, x, range: 22, label, height, use: (g) => g.travel(area, spawn) };
}

/** Somewhere the road stops: a wall, a locked gate. */
export function deadEnd(id: string, x: number, label: string, text: string): Hotspot {
  return { id, x, range: 22, label, height: 50, use: (g) => g.say([{ who: '', text }]) };
}

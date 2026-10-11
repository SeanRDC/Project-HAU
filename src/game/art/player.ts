// The two playable students. The chosen one is the player's base look: areas
// reset to it when you walk in, and cutscenes put it back after a costume swap.

import { Look } from './character';

export type Character = 'boy' | 'girl';

export const LOOKS: Record<Character, Look> = {
  boy: {
    skin: '#d9a273',
    hair: '#231a1c',
    hairStyle: 'short',
    top: '#f3f0e8',
    bottom: '#3b3f58',
    shoes: '#22202a',
    bag: '#7c1f2c',
    lace: '#7c1f2c',
  },
  girl: {
    skin: '#d49a6a',
    hair: '#2a1c20',
    hairStyle: 'shoulder',
    top: '#f6f3ec',
    bottom: '#2e3555',
    shoes: '#3a3440',
    skirt: true,
    bag: '#7c1f2c',
    lace: '#7c1f2c',
  },
};

let current: Character = 'boy';

export function isCharacter(v: unknown): v is Character {
  return v === 'boy' || v === 'girl';
}

export function setCharacter(c: Character): void {
  current = c;
}

export function character(): Character {
  return current;
}

/** What the chosen student wears when nothing special is going on. */
export function baseLook(): Look {
  return LOOKS[current];
}

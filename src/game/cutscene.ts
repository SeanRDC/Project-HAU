// Plays a list of Steps (see types.ts) one after another. The game keeps the
// player's hands off the controls while one is running; the E key still
// moves the dialogue along.

import { Area } from './area';
import { baseLook } from './art/player';
import { GameApi, Sound, Step } from './types';

/** What a running cutscene needs from the game. */
export interface CutsceneHost {
  area(): Area;
  talking(): boolean;
  game: GameApi;
  sound(s: Sound): void;
}

export class Cutscene {
  private i = -1;
  private timer = 0;

  constructor(private steps: Step[]) {}

  get done(): boolean {
    return this.i >= this.steps.length;
  }

  update(dt: number, host: CutsceneHost): void {
    if (this.blocked(dt, host)) return;
    // start steps until one of them has to be waited on
    while (++this.i < this.steps.length) {
      if (this.begin(this.steps[this.i], host)) return;
    }
  }

  /** Is the current step still going? */
  private blocked(dt: number, host: CutsceneHost): boolean {
    const s = this.steps[this.i];
    if (!s) return false;
    if ('say' in s) return host.talking();
    if ('walk' in s) return !s.together && host.area().walking(s.who ?? 'you');
    if ('walkIn' in s) return !s.together && host.area().walkingIn(s.walkIn);
    if ('pause' in s) return (this.timer -= dt) > 0;
    return false;
  }

  /** Kicks off a step. Returns true if the cutscene should wait for it. */
  private begin(s: Step, host: CutsceneHost): boolean {
    const area = host.area();
    if ('walk' in s) {
      area.send(s.who ?? 'you', s.walk, s.run);
      return !s.together;
    }
    if ('walkIn' in s) {
      area.walkIn(s.walkIn, s.time);
      return !s.together;
    }
    if ('say' in s) {
      host.game.say(s.say);
      return true;
    }
    if ('pause' in s) {
      this.timer = s.pause;
      return true;
    }
    if ('place' in s) area.place(s.place, s.x, s.facing);
    else if ('face' in s) area.turn(s.face, s.dir);
    else if ('sound' in s) host.sound(s.sound);
    else if ('look' in s) area.playerLook = s.look ? { ...baseLook(), ...s.look } : baseLook();
    else if ('run' in s) s.run(host.game);
    return false;
  }
}

// Weather. For now that means rain: it comes and goes on its own on the game
// clock, greys the sky, dims the light and puts everyone under an umbrella.
// Pampanga in rainy season, more or less.

import { Ctx, VIEW_H, VIEW_W } from '../engine/display';
import { RGB, damp, mix } from '../engine/math';
import { Mood } from '../engine/tod';

/** chance that a dry spell ends in rain */
const RAIN_CHANCE = 0.35;
/** in-game hours */
const DRY_FOR: [number, number] = [1.5, 5];
const WET_FOR: [number, number] = [0.5, 2];
/** above this it counts as raining for dialogue, umbrellas and the HUD */
export const RAINING = 0.25;

const GREY: RGB = [138, 146, 160];
const GREY_DARK: RGB = [92, 100, 118];

const between = ([a, b]: [number, number]) => a + Math.random() * (b - a);

/** cheap repeatable noise, 0..1, so drops keep their place from frame to frame */
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export interface WeatherSave {
  target: number;
  left: number;
}

export class Weather {
  /** how hard it is raining right now, 0..1. Eases towards `target`. */
  rain = 0;
  /** how hard it is about to rain */
  private target = 0;
  /** in-game hours until the weather changes */
  private left = between(DRY_FOR);

  /** `dt` in real seconds; `hours` is how far the game clock moved, including T skips. */
  update(dt: number, hours: number): void {
    this.left -= hours;
    if (this.left <= 0) {
      if (this.target > 0) {
        this.target = 0;
        this.left = between(DRY_FOR);
      } else if (Math.random() < RAIN_CHANCE) {
        // mostly steady rain, sometimes a downpour
        this.target = 0.45 + Math.random() * 0.55;
        this.left = between(WET_FOR);
      } else {
        this.left = between(DRY_FOR);
      }
    }
    // rain takes about half a minute to set in and to clear
    this.rain = damp(this.rain, this.target, 0.12, dt);
  }

  /** Start raining now, for testing (?rain=1) or a scripted scene. */
  force(strength: number): void {
    this.target = strength;
    this.rain = strength;
    this.left = between(strength > 0 ? WET_FOR : DRY_FOR);
  }

  save(): WeatherSave {
    return { target: this.target, left: this.left };
  }

  load(s: WeatherSave | undefined): void {
    if (!s) return;
    this.target = s.target;
    this.rain = s.target;
    this.left = s.left;
  }

  /** The time of day, greyed over for the rain: flat sky, no warm glow, dimmer light. */
  mood(m: Mood): Mood {
    const r = this.rain;
    if (r < 0.01) return m;
    const grey = (c: RGB, k: number) => mix(c, mix(GREY, c, m.night * 0.7), k);
    return {
      ...m,
      skyTop: grey(m.skyTop, r * 0.75),
      skyBottom: grey(m.skyBottom, r * 0.8),
      haze: grey(m.haze, r * 0.7),
      ambient: mix(m.ambient, mix(GREY_DARK, m.ambient, 0.35 + m.night * 0.4), r * 0.55),
      sun: mix(m.sun, GREY, r * 0.6),
      glow: m.glow * (1 - r),
    };
  }

  /**
   * Draw the rain over an outdoor scene: falling streaks, splashes along the
   * walk line, a wet sheen on the ground. `cam` is the camera x, `walkY` the
   * scene's walk line, `width` the scene width.
   */
  render(ctx: Ctx, cam: number, walkY: number, width: number, time: number, night: number): void {
    const r = this.rain;
    if (r < 0.02) return;

    // the whole frame a touch darker and bluer under the cloud
    ctx.fillStyle = `rgba(40,48,70,${0.16 * r})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // wet ground catches a little sky
    ctx.fillStyle = `rgba(190,205,230,${0.07 * r})`;
    ctx.fillRect(0, walkY - 6, VIEW_W, VIEW_H - walkY + 6);

    // streaks: each drop falls at its own speed, slanted by the wind, and
    // drifts against the camera a little so they feel like they are in the world
    const drops = Math.round(170 * r);
    const streak = night > 0.5 ? 'rgba(170,185,220,0.5)' : 'rgba(215,226,242,0.55)';
    ctx.fillStyle = streak;
    for (let i = 0; i < drops; i++) {
      const speed = 230 + hash(i) * 120;
      const fall = (time * speed + hash(i + 999) * (VIEW_H + 40)) % (VIEW_H + 40);
      const y = Math.round(fall - 20);
      let x = (hash(i + 77) * (VIEW_W + 60) - cam * 0.5 + fall * 0.22) % (VIEW_W + 60);
      if (x < 0) x += VIEW_W + 60;
      x = Math.round(x - 30);
      const len = 3 + Math.round(hash(i + 5) * 3);
      ctx.fillRect(x, y, 1, len);
      ctx.fillRect(x + 1, y + len, 1, 2);
    }

    // splashes on the ground in front of you
    const splashes = Math.round(40 * r);
    ctx.fillStyle = 'rgba(225,235,250,0.7)';
    for (let i = 0; i < splashes; i++) {
      const life = (time * (2 + hash(i + 31)) + hash(i + 3)) % 1;
      if (life > 0.3) continue;
      // a new spot each time the splash comes round again
      const round = Math.floor(time * (2 + hash(i + 31)) + hash(i + 3));
      const wx = hash(i * 7 + round * 13) * width;
      const x = Math.round(wx - cam);
      if (x < -2 || x > VIEW_W + 2) continue;
      const y = Math.round(walkY - 3 + hash(i + round) * 12);
      const s = life < 0.15 ? 1 : 2;
      ctx.fillRect(x - s, y - 1, 1, 1);
      ctx.fillRect(x + s, y - 1, 1, 1);
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

// Characters are drawn from a small rig instead of sprite sheets: a few
// rectangles and thick lines, posed from a walk phase. Everything is drawn
// facing right and mirrored for the other direction.

import { Ctx } from '../../engine/display';
import { ellipse, line, rect } from '../../engine/pix';
import { shade } from './palette';

export type Hair = 'short' | 'long' | 'shoulder' | 'bun' | 'cap' | 'bald';

export interface Look {
  skin: string;
  hair: string;
  hairStyle: Hair;
  top: string;
  bottom: string;
  shoes: string;
  skirt?: boolean;
  /** backpack colour */
  bag?: string;
  /** ID lace colour */
  lace?: string;
  /** long sleeves instead of short */
  sleeves?: boolean;
  /** slightly taller or shorter than the default, in pixels */
  height?: number;
  /** umbrella colour, when it rains */
  umbrella?: string;
  /** a reflective vest over the shirt, in this colour */
  vest?: string;
}

export interface Pose {
  facing: 1 | -1;
  /** walk cycle phase in radians */
  phase: number;
  /** 0 standing still, 1 fully walking. Blends the stride in and out. */
  stride: number;
  /** seconds, drives breathing and blinking */
  time: number;
}

export const CHAR_HEIGHT = 33;

export function drawShadow(ctx: Ctx, x: number, y: number, w = 7): void {
  ctx.globalAlpha = 0.22;
  ellipse(ctx, x, y, w, 1.6, '#1a1030');
  ctx.globalAlpha = 1;
}

export function drawCharacter(ctx: Ctx, x: number, feetY: number, look: Look, pose: Pose): void {
  const m = pose.stride;
  const ph = pose.phase;
  const extra = look.height ?? 0;
  const bob = m > 0.3 ? Math.round(Math.abs(Math.sin(ph)) * 1.2) : Math.sin(pose.time * 1.8) > 0.75 ? 1 : 0;
  const hip = -13 - extra;
  const sh = -23 - extra + bob; // shoulder line
  const blink = (pose.time * 0.37) % 1 > 0.965;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(feetY));
  ctx.scale(pose.facing, 1);

  const pantsBack = shade(look.bottom, -0.28);
  const topBack = shade(look.top, -0.25);
  const skinBack = shade(look.skin, -0.22);
  const legColor = look.skirt ? look.skin : look.bottom;
  const legBack = look.skirt ? skinBack : pantsBack;

  const leg = (phase: number, color: string, shoe: string) => {
    const swing = Math.sin(phase) * m;
    const lift = Math.max(0, Math.cos(phase)) * 2.2 * m;
    const fx = swing * 5;
    const fy = -lift;
    const kx = fx * 0.5 + lift * 0.6;
    const ky = hip / 2 - lift * 0.3;
    line(ctx, 0, hip, kx, ky, color, 3);
    line(ctx, kx, ky, fx, fy - 2, color, 3);
    if (look.skirt) rect(ctx, fx - 1, fy - 5, 3, 3, '#f2efe6');
    rect(ctx, fx - 1, fy - 2, 5, 2, shoe);
  };

  const arm = (phase: number, sleeve: string, skin: string) => {
    const swing = Math.sin(phase) * m;
    const hx = swing * 4.2;
    const hy = sh + 10 - Math.abs(swing) * 1.2;
    const ex = hx * 0.45;
    const ey = sh + 5;
    line(ctx, 0, sh + 1, ex, ey, sleeve, 2);
    line(ctx, ex, ey, hx, hy, look.sleeves ? sleeve : skin, 2);
    if (look.sleeves) rect(ctx, hx - 1, hy, 2, 1, skin);
  };

  // back limbs first
  arm(ph, topBack, skinBack);
  leg(ph + Math.PI, legBack, shade(look.shoes, -0.25));

  if (look.bag) {
    rect(ctx, -7, sh + 1, 4, 9, look.bag);
    rect(ctx, -7, sh + 1, 1, 9, shade(look.bag, -0.3));
    rect(ctx, -6, sh + 7, 3, 1, shade(look.bag, -0.3));
  }

  if (look.hairStyle === 'long') rect(ctx, -5, sh - 6, 4, 11, shade(look.hair, -0.15));
  // shoulder-length hair trails behind the shoulders and swings a pixel with the stride
  const swing = Math.round(Math.sin(ph - 1) * m * 1.5);
  if (look.hairStyle === 'shoulder') rect(ctx, -6 + swing, sh - 5, 3, 7, shade(look.hair, -0.15));

  leg(ph, legColor, look.shoes);

  // torso
  rect(ctx, -4, sh, 7, hip - sh + 2, look.top);
  rect(ctx, -4, sh, 2, hip - sh + 2, topBack);
  rect(ctx, 2, sh + 1, 1, 4, shade(look.top, 0.25));
  if (look.skirt) {
    rect(ctx, -4, hip - 1, 8, 3, look.bottom);
    rect(ctx, -5, hip + 2, 10, 4, look.bottom);
    rect(ctx, -5, hip + 2, 3, 4, pantsBack);
  } else {
    rect(ctx, -4, hip - 1, 7, 3, look.bottom);
    rect(ctx, -4, hip - 1, 2, 3, pantsBack);
  }
  if (look.vest) {
    // open at the front, a grey mesh panel and a reflective band across it
    rect(ctx, -4, sh + 1, 7, hip - sh - 1, '#6f7278');
    rect(ctx, -4, sh + 1, 2, hip - sh - 1, shade(look.vest, -0.25));
    rect(ctx, -2, sh + 1, 2, hip - sh - 1, look.vest);
    rect(ctx, 2, sh + 1, 1, hip - sh - 1, look.vest);
    rect(ctx, -4, sh + 5, 7, 2, look.vest);
    rect(ctx, -4, hip - 2, 7, 1, '#15141a');
  }
  if (look.lace) {
    rect(ctx, 1, sh, 1, 5, look.lace);
    rect(ctx, 0, sh + 5, 3, 3, '#f4f1ea');
    rect(ctx, 1, sh + 6, 1, 1, look.lace);
  }

  // neck and head
  rect(ctx, -1, sh - 1, 3, 1, skinBack);
  const hy = sh - 9;
  rect(ctx, -4, hy, 8, 8, look.skin);
  rect(ctx, -4, hy + 7, 2, 1, skinBack);
  rect(ctx, 4, hy + 4, 1, 1, look.skin); // nose
  if (!blink) rect(ctx, 2, hy + 3, 1, 2, '#2a2030');
  else rect(ctx, 2, hy + 4, 1, 1, '#2a2030');
  rect(ctx, -1, hy + 4, 1, 2, skinBack); // ear

  const hairDark = shade(look.hair, -0.3);
  switch (look.hairStyle) {
    case 'short':
      rect(ctx, -4, hy - 1, 8, 3, look.hair);
      rect(ctx, -5, hy, 3, 6, look.hair);
      rect(ctx, -5, hy + 3, 1, 3, hairDark);
      rect(ctx, 3, hy + 1, 1, 2, look.hair);
      break;
    case 'long':
      rect(ctx, -4, hy - 1, 8, 3, look.hair);
      rect(ctx, -5, hy, 4, 9, look.hair);
      rect(ctx, -5, hy + 4, 1, 5, hairDark);
      rect(ctx, 3, hy + 1, 1, 3, look.hair);
      break;
    case 'shoulder':
      rect(ctx, -4, hy - 1, 8, 3, look.hair);
      rect(ctx, -5, hy, 4, 8, look.hair);
      rect(ctx, -5 + swing, hy + 8, 4, 2, look.hair);
      rect(ctx, -5 + swing, hy + 5, 1, 5, hairDark);
      rect(ctx, 3, hy + 1, 1, 3, look.hair);
      break;
    case 'bun':
      rect(ctx, -4, hy - 1, 8, 3, look.hair);
      rect(ctx, -5, hy, 3, 5, look.hair);
      rect(ctx, -7, hy - 2, 4, 4, look.hair);
      rect(ctx, -7, hy + 1, 4, 1, hairDark);
      break;
    case 'cap':
      rect(ctx, -5, hy + 2, 2, 4, hairDark);
      rect(ctx, -4, hy - 1, 8, 3, look.hair);
      rect(ctx, 3, hy + 1, 4, 1, shade(look.hair, -0.25));
      break;
    case 'bald':
      rect(ctx, -4, hy - 1, 7, 1, look.skin);
      rect(ctx, -5, hy + 2, 2, 3, look.hair);
      break;
  }

  if (look.umbrella) {
    umbrella(ctx, sh, look.umbrella);
    // the front arm bends up to hold the handle instead of swinging
    line(ctx, 0, sh + 1, 3, sh + 6, look.top, 2);
    line(ctx, 3, sh + 6, 2, sh + 3, look.sleeves ? look.top : look.skin, 2);
  } else {
    // front arm goes over the torso
    arm(ph + Math.PI, look.top, look.skin);
  }

  ctx.restore();
}

/**
 * The same rig seen straight on: 'front' walking towards the camera, 'back'
 * walking away from it. The legs step up and down instead of swinging, the
 * arms swing shorter and longer, and a backpack shows as its straps from the
 * front and the whole bag from behind. `pose.facing` is ignored.
 */
export function drawCharacterFacing(ctx: Ctx, x: number, feetY: number, look: Look, pose: Pose, view: 'front' | 'back'): void {
  const m = pose.stride;
  const ph = pose.phase;
  const extra = look.height ?? 0;
  const bob = m > 0.3 ? Math.round(Math.abs(Math.sin(ph)) * 1.2) : Math.sin(pose.time * 1.8) > 0.75 ? 1 : 0;
  const hip = -13 - extra;
  const sh = -23 - extra + bob;
  const hy = sh - 9;
  const blink = (pose.time * 0.37) % 1 > 0.965;
  const front = view === 'front';

  ctx.save();
  ctx.translate(Math.round(x), Math.round(feetY));

  const topBack = shade(look.top, -0.25);
  const skinBack = shade(look.skin, -0.22);
  const hairDark = shade(look.hair, -0.3);
  const legColor = look.skirt ? look.skin : look.bottom;
  const shoe = front ? look.shoes : shade(look.shoes, -0.2);

  // legs: the one stepping lifts its foot a little, the other takes the weight
  const swing = Math.sin(ph) * m;
  const legs: [number, number][] = [[-4, Math.max(0, swing) * 2], [1, Math.max(0, -swing) * 2]];
  for (const [lx, lift] of legs) {
    const foot = Math.round(-2 - lift);
    rect(ctx, lx, hip + 1, 3, foot - hip - 1, legColor);
    if (look.skirt) rect(ctx, lx, foot - 2, 3, 2, '#f2efe6');
    rect(ctx, lx, foot, 3, 2, shoe);
  }

  // torso, lit from the right as in the side view
  rect(ctx, -4, sh, 8, hip - sh + 2, look.top);
  rect(ctx, -4, sh, 1, hip - sh + 2, topBack);
  if (front) rect(ctx, 2, sh + 1, 1, 4, shade(look.top, 0.25));
  if (look.skirt) {
    rect(ctx, -4, hip - 1, 8, 3, look.bottom);
    rect(ctx, -5, hip + 2, 10, 4, look.bottom);
    rect(ctx, -5, hip + 2, 2, 4, shade(look.bottom, -0.28));
  } else {
    rect(ctx, -4, hip - 1, 8, 3, look.bottom);
  }
  if (look.vest) {
    rect(ctx, -4, sh + 1, 8, hip - sh - 1, '#6f7278');
    if (front) {
      rect(ctx, -3, sh + 1, 2, hip - sh - 1, look.vest);
      rect(ctx, 1, sh + 1, 2, hip - sh - 1, look.vest);
    }
    rect(ctx, -4, sh + 5, 8, 2, look.vest);
    rect(ctx, -4, hip - 2, 8, 1, '#15141a');
  }
  if (look.bag && front) {
    // just the straps over the shoulders
    rect(ctx, -4, sh + 1, 1, 6, shade(look.bag, -0.3));
    rect(ctx, 3, sh + 1, 1, 6, shade(look.bag, -0.3));
  }
  if (look.lace) {
    if (front) {
      rect(ctx, -2, sh, 1, 4, look.lace);
      rect(ctx, 1, sh, 1, 4, look.lace);
      rect(ctx, -2, sh + 4, 4, 3, '#f4f1ea');
      rect(ctx, -1, sh + 5, 2, 1, look.lace);
    } else {
      rect(ctx, -2, sh, 4, 1, look.lace);
    }
  }

  // arms hang at the sides, a swing forward or back makes them look shorter
  const arm = (ax: number, s: number) => {
    const len = Math.round(10 - Math.abs(s) * 1.5);
    const sleeve = look.sleeves ? len - 1 : 4;
    rect(ctx, ax, sh + 1, 2, sleeve, ax < 0 ? topBack : look.top);
    rect(ctx, ax, sh + 1 + sleeve, 2, len - sleeve, ax < 0 ? skinBack : look.skin);
  };
  arm(-6, swing);
  arm(4, -swing);

  // neck and head
  rect(ctx, -1, sh - 1, 2, 1, skinBack);
  rect(ctx, -4, hy, 8, 8, look.skin);
  rect(ctx, -4, hy, 1, 8, skinBack);
  rect(ctx, -5, hy + 3, 1, 2, skinBack);
  rect(ctx, 4, hy + 3, 1, 2, look.skin);
  if (front) {
    for (const ex of [-2, 1]) {
      if (!blink) rect(ctx, ex, hy + 3, 1, 2, '#2a2030');
      else rect(ctx, ex, hy + 4, 1, 1, '#2a2030');
    }
    rect(ctx, -1, hy + 6, 2, 1, shade(look.skin, -0.3));
  }

  // the backpack sits on the back, under long hair
  if (look.bag && !front) {
    rect(ctx, -4, sh + 1, 8, 9, look.bag);
    rect(ctx, -4, sh + 1, 1, 9, shade(look.bag, -0.3));
    rect(ctx, -3, sh + 6, 6, 3, shade(look.bag, -0.2));
    rect(ctx, -3, sh + 6, 6, 1, shade(look.bag, -0.4));
  }

  const tips = Math.round(Math.sin(ph - 1) * m);
  switch (look.hairStyle) {
    case 'short':
      if (front) {
        rect(ctx, -4, hy - 1, 8, 3, look.hair);
        rect(ctx, -5, hy, 1, 3, look.hair);
        rect(ctx, 4, hy, 1, 3, look.hair);
      } else {
        rect(ctx, -4, hy - 1, 8, 7, look.hair);
        rect(ctx, -4, hy + 4, 8, 1, hairDark);
      }
      break;
    case 'long':
    case 'shoulder': {
      const len = look.hairStyle === 'long' ? 13 : 10;
      if (front) {
        rect(ctx, -4, hy - 1, 8, 3, look.hair);
        rect(ctx, -5, hy, 2, len - 1, look.hair);
        rect(ctx, 3, hy, 2, len - 1, look.hair);
        rect(ctx, -5, hy + 4, 1, len - 5, hairDark);
      } else {
        rect(ctx, -5, hy - 1, 10, len, look.hair);
        rect(ctx, -4 + tips, hy + len - 1, 8, 1, look.hair);
        rect(ctx, -5, hy + 3, 1, len - 4, hairDark);
        rect(ctx, -1, hy + 2, 1, len - 3, hairDark);
      }
      break;
    }
    case 'bun':
      rect(ctx, -4, hy - 1, 8, front ? 3 : 7, look.hair);
      if (front) {
        rect(ctx, -2, hy - 4, 4, 3, look.hair);
        rect(ctx, -5, hy, 1, 3, look.hair);
        rect(ctx, 4, hy, 1, 3, look.hair);
      } else {
        rect(ctx, -2, hy - 2, 4, 4, shade(look.hair, 0.1));
        rect(ctx, -2, hy + 1, 4, 1, hairDark);
      }
      break;
    case 'cap':
      rect(ctx, -4, hy - 1, 8, 3, look.hair);
      if (front) rect(ctx, -5, hy + 1, 10, 1, shade(look.hair, -0.25));
      else {
        rect(ctx, -4, hy + 2, 8, 3, hairDark);
        rect(ctx, -1, hy + 1, 2, 1, '#2a2030');
      }
      break;
    case 'bald':
      rect(ctx, -4, hy - 1, 8, 1, look.skin);
      if (front) {
        rect(ctx, -5, hy + 2, 1, 3, look.hair);
        rect(ctx, 4, hy + 2, 1, 3, look.hair);
      } else {
        rect(ctx, -4, hy + 3, 8, 3, look.hair);
      }
      break;
  }

  if (look.umbrella) {
    ctx.translate(-2, 0);
    umbrella(ctx, sh, look.umbrella);
    rect(ctx, 1, sh + 4, 2, 2, look.skin);
  }

  ctx.restore();
}

/** An open umbrella over the head, held at x = 2. `sh` is the shoulder line. */
function umbrella(ctx: Ctx, sh: number, c: string): void {
  const dark = shade(c, -0.3);
  const pole = '#3a3440';
  line(ctx, 2, sh + 5, 2, sh - 14, pole, 1);
  rect(ctx, 2, sh - 20, 1, 1, pole);
  rect(ctx, -2, sh - 19, 9, 1, c);
  rect(ctx, -5, sh - 18, 15, 1, c);
  rect(ctx, -7, sh - 17, 19, 2, c);
  rect(ctx, -3, sh - 18, 4, 1, shade(c, 0.35));
  rect(ctx, -8, sh - 15, 21, 1, dark);
  // scalloped rim between the ribs
  for (let x = -8; x <= 12; x += 5) rect(ctx, x, sh - 14, 2, 1, dark);
}

/** Campus cat. Sits and flicks its tail; small enough to hand-place. */
export function drawCat(ctx: Ctx, x: number, y: number, time: number, color = '#d98b3a'): void {
  const dark = shade(color, -0.3);
  const X = Math.round(x);
  const Y = Math.round(y);
  const flick = Math.sin(time * 2.4) > 0.3 ? 1 : 0;
  rect(ctx, X - 5, Y - 6, 8, 6, color); // body
  rect(ctx, X - 5, Y - 2, 8, 2, dark);
  rect(ctx, X + 1, Y - 10, 5, 5, color); // head
  rect(ctx, X + 1, Y - 11, 1, 1, color);
  rect(ctx, X + 5, Y - 11, 1, 1, color);
  rect(ctx, X + 4, Y - 8, 1, 1, '#2a2030');
  rect(ctx, X + 2, Y - 6, 3, 1, '#f4ead8');
  rect(ctx, X - 7, Y - 3 - flick, 2, 1, color); // tail
  rect(ctx, X - 8, Y - 5 - flick * 2, 1, 2, color);
  rect(ctx, X + 1, Y - 1, 2, 1, '#f4ead8'); // paw
}

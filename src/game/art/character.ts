// Characters are drawn from a small rig instead of sprite sheets: a few
// rectangles and thick lines, posed from a walk phase. Everything is drawn
// facing right and mirrored for the other direction.

import { Ctx, makeCanvas } from '../../engine/display';
import { ellipse, line, px, rect } from '../../engine/pix';
import { shade } from './palette';

export type Hair = 'short' | 'long' | 'shoulder' | 'bun' | 'cap' | 'bald';

/** How someone looks while they talk: the eyes, brows and mouth, and standing still, the arms. */
export type Face = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'worried' | 'shy' | 'smug';

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
  /** how they feel right now */
  face?: Face;
  /** mouth open, mid-word */
  talk?: boolean;
  /** seconds since the face last changed, for the little jump or shake that goes with it */
  react?: number;
}

const INK = '#2a2030';
const MOUTH = '#5a2630';
const BLUSH = '#e0787a';

/** The jump of surprise, the happy bounce, the angry shake: how far off their spot it puts them, [x, up]. */
function reaction(face: Face, t: number): [number, number] {
  if (t > 1) return [0, 0];
  if (face === 'surprised' && t < 0.35) return [0, Math.round(Math.sin((t / 0.35) * Math.PI) * 3)];
  if (face === 'happy' && t < 0.5) return [0, Math.round(Math.abs(Math.sin((t / 0.25) * Math.PI)) * 2)];
  if (face === 'angry' && t < 0.45) return [Math.floor(t * 30) % 2 ? 1 : -1, 0];
  return [0, 0];
}

/** Eyes, brows, mouth and cheeks on the side-on head, facing right; `hy` is the top of the head. */
function sideFace(ctx: Ctx, hy: number, look: Look, face: Face, talk: boolean, blink: boolean): void {
  const brow = shade(look.hair, -0.1);
  const lip = shade(look.skin, -0.35);
  if (face === 'happy') {
    px(ctx, 2, hy + 3, INK);
    px(ctx, 1, hy + 4, INK);
  } else if (face === 'surprised') rect(ctx, 2, hy + 2, 1, 3, INK);
  else if (blink || face === 'angry' || face === 'sad' || face === 'smug' || face === 'shy') px(ctx, 2, hy + 4, INK);
  else rect(ctx, 2, hy + 3, 1, 2, INK);

  if (face === 'angry') {
    px(ctx, 1, hy + 2, brow);
    px(ctx, 2, hy + 3, brow);
  } else if (face === 'sad' || face === 'worried') {
    px(ctx, 1, hy + 3, brow);
    px(ctx, 2, hy + 2, brow);
  } else if (face === 'surprised') rect(ctx, 1, hy + 1, 2, 1, brow);
  else if (face === 'smug') rect(ctx, 1, hy + 3, 2, 1, brow);

  if (face === 'surprised') rect(ctx, 2, hy + 5, 2, 2, MOUTH);
  else if (talk) rect(ctx, 2, hy + 6, 2, 2, MOUTH);
  else if (face === 'happy' || face === 'smug') {
    px(ctx, 2, hy + 6, MOUTH);
    px(ctx, 3, hy + 5, MOUTH);
  } else if (face === 'angry') rect(ctx, 2, hy + 6, 2, 1, MOUTH);
  else if (face === 'sad') {
    px(ctx, 2, hy + 6, lip);
    px(ctx, 3, hy + 7, lip);
  } else px(ctx, 3, hy + 6, lip);

  if (face === 'happy') px(ctx, 1, hy + 5, BLUSH);
  if (face === 'shy') rect(ctx, 0, hy + 5, 2, 1, BLUSH);
}

/** The same, looking straight at the camera: eyes at x = -2 and 1. */
function frontFace(ctx: Ctx, hy: number, look: Look, face: Face, talk: boolean, blink: boolean): void {
  const brow = shade(look.hair, -0.1);
  const lip = shade(look.skin, -0.3);
  for (const ex of [-2, 1]) {
    if (face === 'happy') px(ctx, ex, hy + 3, INK);
    else if (face === 'surprised') rect(ctx, ex, hy + 2, 1, 3, INK);
    else if (blink || face === 'angry' || face === 'sad' || face === 'smug' || face === 'shy') px(ctx, ex, hy + 4, INK);
    else rect(ctx, ex, hy + 3, 1, 2, INK);
  }
  for (const [outer, inner] of [[-3, -2], [2, 1]]) {
    if (face === 'angry') {
      px(ctx, outer, hy + 2, brow);
      px(ctx, inner, hy + 3, brow);
    } else if (face === 'sad' || face === 'worried') {
      px(ctx, outer, hy + 3, brow);
      px(ctx, inner, hy + 2, brow);
    } else if (face === 'surprised') rect(ctx, Math.min(outer, inner), hy + 1, 2, 1, brow);
    else if (face === 'smug') rect(ctx, Math.min(outer, inner), hy + 3, 2, 1, brow);
  }
  if (face === 'surprised') rect(ctx, -1, hy + 5, 2, 2, MOUTH);
  else if (talk) rect(ctx, -1, hy + 6, 2, 2, MOUTH);
  else if (face === 'happy') {
    rect(ctx, -1, hy + 6, 2, 1, MOUTH);
    px(ctx, -2, hy + 5, MOUTH);
    px(ctx, 1, hy + 5, MOUTH);
  } else if (face === 'angry') rect(ctx, -2, hy + 6, 4, 1, MOUTH);
  else if (face === 'sad') {
    rect(ctx, -1, hy + 6, 2, 1, lip);
    px(ctx, -2, hy + 7, lip);
    px(ctx, 1, hy + 7, lip);
  } else rect(ctx, -1, hy + 6, 2, 1, lip);
  if (face === 'happy' || face === 'shy') {
    // shy blushes wider
    const w = face === 'shy' ? 2 : 1;
    rect(ctx, -2 - w, hy + 5, w, 1, BLUSH);
    rect(ctx, 2, hy + 5, w, 1, BLUSH);
  }
}

/**
 * Standing still, the front arm (side view) shows how they feel: hands up in
 * surprise, a wave when happy, a fist on the hip when angry, a hand to the
 * chin when worried, scratching the back of the head when embarrassed.
 * Returns false when the arm should just hang as usual.
 */
function gesture(ctx: Ctx, face: Face, t: number, sh: number, hip: number, look: Look): boolean {
  const fore = look.sleeves ? look.top : look.skin;
  if (face === 'surprised' && t < 0.9) {
    line(ctx, 0, sh + 1, 3, sh - 2, look.top, 2);
    line(ctx, 3, sh - 2, 4, sh - 7, fore, 2);
  } else if (face === 'happy' && t < 1.1) {
    const wave = Math.sin(t * 22) > 0 ? 1 : 0;
    line(ctx, 0, sh + 1, 3, sh - 2, look.top, 2);
    line(ctx, 3, sh - 2, 4 + wave, sh - 8, fore, 2);
  } else if (face === 'angry') {
    line(ctx, 0, sh + 1, 3, sh + 5, look.top, 2);
    line(ctx, 3, sh + 5, 1, hip - 1, fore, 2);
  } else if (face === 'worried') {
    line(ctx, 0, sh + 1, 3, sh + 6, look.top, 2);
    line(ctx, 3, sh + 6, 3, sh - 1, fore, 2);
  } else if (face === 'shy') {
    line(ctx, 0, sh + 1, -2, sh - 1, look.top, 2);
    line(ctx, -2, sh - 1, -3, sh - 6, fore, 2);
  } else return false;
  return true;
}

export const CHAR_HEIGHT = 33;

export function drawShadow(ctx: Ctx, x: number, y: number, w = 7): void {
  ctx.globalAlpha = 0.22;
  ellipse(ctx, x, y, w, 1.6, '#1a1030');
  ctx.globalAlpha = 1;
}

// --- the outline -------------------------------------------------------------
// The body is drawn on its own small canvas first, then stamped down over a
// dark copy of itself nudged a pixel each way, so every character gets a
// clean one-pixel outline whatever it is wearing or holding.

const OUTLINE = '#2b1d24';
const SPR_W = 64;
const SPR_H = 84;
// where the feet go on the sprite canvas; room above for the umbrella and a jump
const SPR_X = 32;
const SPR_Y = 74;

let spr: [HTMLCanvasElement, Ctx] | null = null;
let rim: [HTMLCanvasElement, Ctx] | null = null;

function outlined(ctx: Ctx, x: number, feetY: number, draw: (c: Ctx) => void): void {
  spr ??= makeCanvas(SPR_W, SPR_H);
  rim ??= makeCanvas(SPR_W, SPR_H);
  const [sc, s] = spr;
  const [rc, r] = rim;
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.clearRect(0, 0, SPR_W, SPR_H);
  s.translate(SPR_X, SPR_Y);
  draw(s);
  s.setTransform(1, 0, 0, 1, 0, 0);

  r.globalCompositeOperation = 'source-over';
  r.clearRect(0, 0, SPR_W, SPR_H);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) r.drawImage(sc, dx, dy);
  r.globalCompositeOperation = 'source-in';
  r.fillStyle = OUTLINE;
  r.fillRect(0, 0, SPR_W, SPR_H);
  r.globalCompositeOperation = 'source-over';

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const dx = Math.round(x) - SPR_X;
  const dy = Math.round(feetY) - SPR_Y;
  ctx.drawImage(rc, dx, dy);
  ctx.drawImage(sc, dx, dy);
  ctx.restore();
}

/** The colours every view shares, worked out once per draw. */
function tones(look: Look) {
  return {
    topHi: shade(look.top, 0.22),
    topFold: shade(look.top, -0.13),
    topBack: shade(look.top, -0.25),
    skinHi: shade(look.skin, 0.14),
    skinBack: shade(look.skin, -0.22),
    hairHi: shade(look.hair, 0.32),
    hairDark: shade(look.hair, -0.3),
    bottomBack: shade(look.bottom, -0.28),
    pleat: shade(look.bottom, -0.18),
    bagHi: look.bag ? shade(look.bag, 0.22) : '',
    bagDark: look.bag ? shade(look.bag, -0.3) : '',
  };
}

/** A rounded crown of hair over the head, with a band of shine across it. `w` widens it for the front view. */
function crown(ctx: Ctx, hy: number, x0: number, w: number, c: string, hi: string): void {
  rect(ctx, x0 + 1, hy - 2, w - 2, 1, c);
  rect(ctx, x0, hy - 1, w, 2, c);
  rect(ctx, x0 + 2, hy - 1, Math.max(2, Math.floor(w / 2) - 1), 1, hi);
  px(ctx, x0 + 1, hy, hi);
}

export function drawCharacter(ctx: Ctx, x: number, feetY: number, look: Look, pose: Pose): void {
  outlined(ctx, x, feetY, (c) => sideBody(c, look, pose));
}

function sideBody(ctx: Ctx, look: Look, pose: Pose): void {
  const m = pose.stride;
  const ph = pose.phase;
  const extra = look.height ?? 0;
  const bob = m > 0.3 ? Math.round(Math.abs(Math.sin(ph)) * 1.2) : Math.sin(pose.time * 1.8) > 0.75 ? 1 : 0;
  const hip = -13 - extra;
  const face = pose.face ?? 'neutral';
  // sad shoulders drop a pixel, and the head with them
  const sh = -23 - extra + bob + (face === 'sad' ? 1 : 0); // shoulder line
  const blink = (pose.time * 0.37) % 1 > 0.965;
  const [jx, jy] = reaction(face, pose.react ?? Infinity);
  const t = tones(look);

  ctx.translate(jx, -jy);
  ctx.scale(pose.facing, 1);

  const legColor = look.skirt ? look.skin : look.bottom;
  const legBack = look.skirt ? t.skinBack : t.bottomBack;

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
    // shoe: lit toe cap over a darker sole
    rect(ctx, fx - 1, fy - 2, 5, 1, shoe);
    rect(ctx, fx - 1, fy - 1, 5, 1, shade(shoe, -0.35));
    px(ctx, fx + 2, fy - 2, shade(shoe, 0.35));
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
  arm(ph, t.topBack, t.skinBack);
  leg(ph + Math.PI, legBack, shade(look.shoes, -0.25));

  if (look.bag) {
    // a rounded pack with a lit top and a front pocket
    rect(ctx, -7, sh + 1, 4, 9, look.bag);
    rect(ctx, -8, sh + 2, 1, 7, t.bagDark);
    rect(ctx, -7, sh + 1, 3, 1, t.bagHi);
    rect(ctx, -7, sh + 6, 3, 3, shade(look.bag, -0.12));
    rect(ctx, -7, sh + 6, 3, 1, t.bagDark);
  }

  if (look.hairStyle === 'long') rect(ctx, -5, sh - 6, 4, 11, shade(look.hair, -0.15));
  // shoulder-length hair trails behind the shoulders and swings a pixel with the stride
  const swing = Math.round(Math.sin(ph - 1) * m * 1.5);
  if (look.hairStyle === 'shoulder') rect(ctx, -6 + swing, sh - 5, 3, 7, shade(look.hair, -0.15));

  leg(ph, legColor, look.shoes);

  // torso: shaded at the back, lit down the front edge, a collar and a crease at the waist
  rect(ctx, -4, sh, 7, hip - sh + 2, look.top);
  rect(ctx, -4, sh, 2, hip - sh + 2, t.topBack);
  rect(ctx, 2, sh + 1, 1, hip - sh - 1, t.topHi);
  rect(ctx, -2, sh, 4, 1, t.topFold);
  px(ctx, 1, sh + 1, t.topFold);
  px(ctx, -1, hip - 2, t.topFold);
  px(ctx, 0, hip - 3, t.topFold);
  if (look.skirt) {
    // pleated, swinging a pixel with the stride
    const hem = Math.round(Math.sin(ph) * m * 0.8);
    rect(ctx, -4, hip - 1, 8, 3, look.bottom);
    rect(ctx, -4, hip - 1, 8, 1, t.pleat);
    rect(ctx, -5 + hem, hip + 2, 10, 4, look.bottom);
    rect(ctx, -5 + hem, hip + 2, 3, 4, t.bottomBack);
    rect(ctx, -1 + hem, hip + 3, 1, 3, t.pleat);
    rect(ctx, 2 + hem, hip + 3, 1, 3, t.pleat);
    rect(ctx, 4 + hem, hip + 2, 1, 3, shade(look.bottom, 0.15));
  } else {
    rect(ctx, -4, hip - 1, 7, 3, look.bottom);
    rect(ctx, -4, hip - 1, 2, 3, t.bottomBack);
    // a belt with a glint of buckle
    rect(ctx, -4, hip - 1, 7, 1, '#2a2228');
    px(ctx, 2, hip - 1, '#c9b27a');
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
  // the backpack strap over the shoulder
  if (look.bag) line(ctx, -2, sh + 1, -1, sh + 7, t.bagDark, 1);
  if (look.lace) {
    rect(ctx, 1, sh, 1, 5, look.lace);
    rect(ctx, 0, sh + 5, 3, 3, '#f4f1ea');
    rect(ctx, 1, sh + 6, 1, 1, look.lace);
  }

  // neck and a rounded head: the chin is a pixel narrower, the jaw shaded
  rect(ctx, -1, sh - 1, 3, 1, t.skinBack);
  const hy = sh - 9;
  rect(ctx, -4, hy, 8, 7, look.skin);
  rect(ctx, -3, hy + 7, 6, 1, look.skin);
  rect(ctx, -3, hy + 7, 2, 1, t.skinBack);
  rect(ctx, -4, hy + 6, 1, 1, t.skinBack);
  px(ctx, 4, hy + 4, look.skin); // nose
  px(ctx, 3, hy + 1, t.skinHi); // brow catches the light
  rect(ctx, -1, hy + 4, 1, 2, t.skinBack); // ear
  px(ctx, 0, hy + 4, t.skinBack);

  const hair = look.hair;
  switch (look.hairStyle) {
    case 'short':
      crown(ctx, hy, -5, 9, hair, t.hairHi);
      rect(ctx, -5, hy + 1, 3, 5, hair);
      rect(ctx, -5, hy + 3, 1, 3, t.hairDark);
      rect(ctx, 1, hy + 1, 3, 1, hair); // fringe
      rect(ctx, 0, hy + 1, 1, 2, hair); // sideburn
      break;
    case 'long':
      crown(ctx, hy, -5, 9, hair, t.hairHi);
      rect(ctx, -5, hy + 1, 4, 9, hair);
      rect(ctx, -5, hy + 4, 1, 5, t.hairDark);
      rect(ctx, -3, hy + 2, 1, 6, t.hairHi);
      rect(ctx, 1, hy + 1, 3, 1, hair);
      px(ctx, 3, hy + 2, hair);
      break;
    case 'shoulder':
      crown(ctx, hy, -5, 9, hair, t.hairHi);
      rect(ctx, -5, hy + 1, 4, 7, hair);
      rect(ctx, -5 + swing, hy + 8, 4, 2, hair);
      rect(ctx, -5 + swing, hy + 5, 1, 5, t.hairDark);
      rect(ctx, -3, hy + 2, 1, 4, t.hairHi);
      rect(ctx, 1, hy + 1, 3, 1, hair);
      px(ctx, 3, hy + 2, hair);
      break;
    case 'bun':
      crown(ctx, hy, -5, 9, hair, t.hairHi);
      rect(ctx, -5, hy + 1, 3, 4, hair);
      rect(ctx, -8, hy - 3, 4, 4, hair);
      rect(ctx, -8, hy, 4, 1, t.hairDark);
      px(ctx, -7, hy - 3, t.hairHi);
      rect(ctx, 1, hy + 1, 3, 1, hair);
      break;
    case 'cap': {
      // the cap takes the hair colour; the hair under it shows dark at the back
      rect(ctx, -5, hy + 2, 2, 4, t.hairDark);
      crown(ctx, hy, -5, 9, hair, shade(hair, 0.3));
      rect(ctx, -5, hy + 1, 9, 1, hair);
      rect(ctx, 3, hy + 1, 4, 1, shade(hair, -0.25)); // brim
      break;
    }
    case 'bald':
      rect(ctx, -3, hy - 1, 6, 1, look.skin);
      rect(ctx, -1, hy - 1, 2, 1, t.skinHi);
      rect(ctx, -5, hy + 2, 2, 3, hair);
      break;
  }

  sideFace(ctx, hy, look, face, !!pose.talk, blink);

  if (look.umbrella) {
    umbrella(ctx, sh, look.umbrella);
    // the front arm bends up to hold the handle instead of swinging
    line(ctx, 0, sh + 1, 3, sh + 6, look.top, 2);
    line(ctx, 3, sh + 6, 2, sh + 3, look.sleeves ? look.top : look.skin, 2);
  } else if (m > 0.3 || !gesture(ctx, face, pose.react ?? Infinity, sh, hip, look)) {
    // front arm goes over the torso, the short sleeve puffed at the shoulder
    arm(ph + Math.PI, look.top, look.skin);
    if (!look.sleeves && !look.vest) {
      rect(ctx, -1, sh, 3, 3, look.top);
      rect(ctx, -1, sh + 3, 3, 1, t.topFold);
      px(ctx, 1, sh, t.topHi);
    }
  }
}

/**
 * The same rig seen straight on: 'front' walking towards the camera, 'back'
 * walking away from it. The legs step up and down instead of swinging, the
 * arms swing shorter and longer, and a backpack shows as its straps from the
 * front and the whole bag from behind. `pose.facing` is ignored.
 */
export function drawCharacterFacing(ctx: Ctx, x: number, feetY: number, look: Look, pose: Pose, view: 'front' | 'back'): void {
  outlined(ctx, x, feetY, (c) => facingBody(c, look, pose, view));
}

function facingBody(ctx: Ctx, look: Look, pose: Pose, view: 'front' | 'back'): void {
  const m = pose.stride;
  const ph = pose.phase;
  const extra = look.height ?? 0;
  const bob = m > 0.3 ? Math.round(Math.abs(Math.sin(ph)) * 1.2) : Math.sin(pose.time * 1.8) > 0.75 ? 1 : 0;
  const hip = -13 - extra;
  const face = pose.face ?? 'neutral';
  const sh = -23 - extra + bob + (face === 'sad' ? 1 : 0);
  const hy = sh - 9;
  const blink = (pose.time * 0.37) % 1 > 0.965;
  const front = view === 'front';
  const [jx, jy] = reaction(face, pose.react ?? Infinity);
  const t = tones(look);

  ctx.translate(jx, -jy);

  const legColor = look.skirt ? look.skin : look.bottom;
  const shoe = front ? look.shoes : shade(look.shoes, -0.2);

  // legs: the one stepping lifts its foot a little, the other takes the weight
  const swing = Math.sin(ph) * m;
  const legs: [number, number][] = [[-4, Math.max(0, swing) * 2], [1, Math.max(0, -swing) * 2]];
  for (const [lx, lift] of legs) {
    const foot = Math.round(-2 - lift);
    rect(ctx, lx, hip + 1, 3, foot - hip - 1, legColor);
    rect(ctx, lx, hip + 1, 1, foot - hip - 1, look.skirt ? t.skinBack : t.bottomBack);
    if (look.skirt) rect(ctx, lx, foot - 2, 3, 2, '#f2efe6');
    rect(ctx, lx, foot, 3, 1, shoe);
    rect(ctx, lx, foot + 1, 3, 1, shade(shoe, -0.35));
    if (front) px(ctx, lx + 1, foot, shade(shoe, 0.35));
  }

  // torso, lit from the right as in the side view
  rect(ctx, -4, sh, 8, hip - sh + 2, look.top);
  rect(ctx, -4, sh, 1, hip - sh + 2, t.topBack);
  rect(ctx, 3, sh + 1, 1, hip - sh - 1, t.topHi);
  if (front) {
    // collar points and a button line
    px(ctx, -2, sh, t.topFold);
    px(ctx, 1, sh, t.topFold);
    rect(ctx, -1, sh + 1, 2, 1, t.topFold);
    rect(ctx, 0, sh + 2, 1, hip - sh - 3, t.topFold);
  } else {
    rect(ctx, -3, sh, 6, 1, t.topFold);
  }
  if (look.skirt) {
    const hem = Math.round(swing * 0.8);
    rect(ctx, -4, hip - 1, 8, 3, look.bottom);
    rect(ctx, -4, hip - 1, 8, 1, t.pleat);
    rect(ctx, -5, hip + 2, 10, 4, look.bottom);
    rect(ctx, -5, hip + 2, 2, 4, t.bottomBack);
    for (const p of [-2, 0, 2]) rect(ctx, p + hem, hip + 3, 1, 3, t.pleat);
    rect(ctx, 4, hip + 2, 1, 3, shade(look.bottom, 0.15));
  } else {
    rect(ctx, -4, hip - 1, 8, 3, look.bottom);
    rect(ctx, -4, hip - 1, 8, 1, '#2a2228');
    if (front) px(ctx, 0, hip - 1, '#c9b27a');
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
    rect(ctx, -4, sh + 1, 1, 6, t.bagDark);
    rect(ctx, 3, sh + 1, 1, 6, t.bagDark);
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
    const lit = ax > 0;
    rect(ctx, ax, sh + 1, 2, sleeve, lit ? look.top : t.topBack);
    rect(ctx, ax, sh + sleeve, 2, 1, t.topFold);
    rect(ctx, ax, sh + 1 + sleeve, 2, len - sleeve, lit ? look.skin : t.skinBack);
  };
  arm(-6, swing);
  arm(4, -swing);

  // neck and a rounded head
  rect(ctx, -1, sh - 1, 2, 1, t.skinBack);
  rect(ctx, -4, hy, 8, 7, look.skin);
  rect(ctx, -3, hy + 7, 6, 1, look.skin);
  rect(ctx, -4, hy, 1, 7, t.skinBack);
  rect(ctx, -3, hy + 7, 1, 1, t.skinBack);
  rect(ctx, -5, hy + 3, 1, 2, t.skinBack);
  rect(ctx, 4, hy + 3, 1, 2, look.skin);
  if (front) {
    px(ctx, 2, hy + 1, t.skinHi);
    frontFace(ctx, hy, look, face, !!pose.talk, blink);
  }

  // the backpack sits on the back, under long hair
  if (look.bag && !front) {
    rect(ctx, -4, sh + 1, 8, 9, look.bag);
    rect(ctx, -4, sh + 1, 1, 9, t.bagDark);
    rect(ctx, -3, sh + 1, 6, 1, t.bagHi);
    rect(ctx, -3, sh + 6, 6, 3, shade(look.bag, -0.15));
    rect(ctx, -3, sh + 6, 6, 1, t.bagDark);
  }

  const hair = look.hair;
  const tips = Math.round(Math.sin(ph - 1) * m);
  switch (look.hairStyle) {
    case 'short':
      crown(ctx, hy, -5, 10, hair, t.hairHi);
      if (front) {
        rect(ctx, -4, hy + 1, 8, 1, hair);
        rect(ctx, -5, hy + 1, 1, 3, hair);
        rect(ctx, 4, hy + 1, 1, 2, hair);
        px(ctx, -1, hy + 2, hair); // a flick of fringe
      } else {
        rect(ctx, -5, hy + 1, 10, 5, hair);
        rect(ctx, -4, hy + 5, 8, 1, t.hairDark);
      }
      break;
    case 'long':
    case 'shoulder': {
      const len = look.hairStyle === 'long' ? 13 : 10;
      crown(ctx, hy, -5, 10, hair, t.hairHi);
      if (front) {
        rect(ctx, -4, hy + 1, 8, 1, hair);
        rect(ctx, -5, hy, 2, len - 1, hair);
        rect(ctx, 3, hy, 2, len - 1, hair);
        rect(ctx, -5, hy + 4, 1, len - 5, t.hairDark);
        rect(ctx, 4, hy + 2, 1, len - 5, t.hairHi);
      } else {
        rect(ctx, -5, hy + 1, 10, len - 2, hair);
        rect(ctx, -4 + tips, hy + len - 1, 8, 1, hair);
        rect(ctx, -5, hy + 3, 1, len - 4, t.hairDark);
        rect(ctx, -1, hy + 2, 1, len - 3, t.hairDark);
        rect(ctx, 2, hy + 1, 1, len - 5, t.hairHi);
      }
      break;
    }
    case 'bun':
      crown(ctx, hy, -5, 10, hair, t.hairHi);
      if (front) {
        rect(ctx, -2, hy - 5, 4, 3, hair);
        px(ctx, -1, hy - 5, t.hairHi);
        rect(ctx, -4, hy + 1, 8, 1, hair);
      } else {
        rect(ctx, -5, hy + 1, 10, 4, hair);
        rect(ctx, -2, hy - 2, 4, 4, shade(hair, 0.1));
        rect(ctx, -2, hy + 1, 4, 1, t.hairDark);
      }
      break;
    case 'cap':
      crown(ctx, hy, -5, 10, hair, shade(hair, 0.3));
      rect(ctx, -5, hy + 1, 10, 1, hair);
      if (front) rect(ctx, -5, hy + 2, 10, 1, shade(hair, -0.25));
      else {
        rect(ctx, -4, hy + 2, 8, 3, t.hairDark);
        rect(ctx, -1, hy + 1, 2, 1, '#2a2030');
      }
      break;
    case 'bald':
      rect(ctx, -3, hy - 1, 6, 1, look.skin);
      rect(ctx, 0, hy - 1, 2, 1, t.skinHi);
      if (front) {
        rect(ctx, -5, hy + 2, 1, 3, hair);
        rect(ctx, 4, hy + 2, 1, 3, hair);
      } else {
        rect(ctx, -4, hy + 3, 8, 3, hair);
      }
      break;
  }

  if (look.umbrella) {
    ctx.translate(-2, 0);
    umbrella(ctx, sh, look.umbrella);
    rect(ctx, 1, sh + 4, 2, 2, look.skin);
  }
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

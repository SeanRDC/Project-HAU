// The two playable students, drawn from sprite sheets made in PixelLab instead
// of the code rig in character.ts (NPCs still use the rig). Each sheet is one
// row of frames facing right (east), all the same size with the feet on the
// bottom row, and is mirrored for walking left. The front and back views are
// single frames, for walking in and out of doorways.

import { Ctx } from '../../engine/display';
import { Face } from './character';
import { Character } from './player';
import girlIdle from '../sprites/girl/idle.png';
import girlTired from '../sprites/girl/tired.png';
import girlWalk from '../sprites/girl/walk.png';
import girlTalk from '../sprites/girl/talk.png';
import girlFront from '../sprites/girl/front.png';
import girlBack from '../sprites/girl/back.png';
import girlPortrait from '../sprites/girl/portrait.png';
import boyIdle from '../sprites/boy/idle.png';
import boyTired from '../sprites/boy/tired.png';
import boyWalk from '../sprites/boy/walk.png';
import boyTalk from '../sprites/boy/talk.png';
import boyFront from '../sprites/boy/front.png';
import boyBack from '../sprites/boy/back.png';
import boyPortrait from '../sprites/boy/portrait.png';

/** idle stands upright; tired slumps a little, and is only used in cutscenes */
export type SpriteAnim = 'idle' | 'tired' | 'walk' | 'talk';

interface Sheet {
  img: HTMLImageElement;
  frames: number;
  fps: number;
}

interface SpriteSet {
  anims: Record<SpriteAnim, Sheet>;
  front: Sheet;
  back: Sheet;
  /** the face for the speech bubble: a row per emotion (or one row), the resting mouth then three talking shapes */
  portrait: Sheet;
  portraitRows: number;
  /** how big the portrait shows in the bubble, a whole multiple of its frame so the pixels stay square */
  portraitSize: number;
  /**
   * How much the sheets are shrunk on screen. Both are drawn at twice the
   * game's pixel size, so at 0.5 each of their pixels is one pixel of the
   * double-detail buffer (DETAIL in display.ts) and nothing is lost.
   */
  scale: number;
}

function load(url: string, frames: number, fps: number): Sheet {
  const img = new Image();
  img.src = url;
  return { img, frames, fps };
}

const GIRL_IDLE = load(girlIdle, 12, 4);
const BOY_IDLE = load(boyIdle, 12, 4);

const SETS: Record<Character, SpriteSet> = {
  girl: {
    anims: { idle: GIRL_IDLE, tired: load(girlTired, 4, 4), walk: load(girlWalk, 6, 10), talk: load(girlTalk, 9, 8) },
    front: load(girlFront, 1, 1),
    back: load(girlBack, 1, 1),
    portrait: load(girlPortrait, 4, 10),
    portraitRows: 8,
    portraitSize: 32,
    scale: 0.5,
  },
  boy: {
    anims: { idle: BOY_IDLE, tired: load(boyTired, 4, 4), walk: load(boyWalk, 9, 12), talk: load(boyTalk, 9, 8) },
    front: load(boyFront, 1, 1),
    back: load(boyBack, 1, 1),
    portrait: load(boyPortrait, 4, 10),
    portraitRows: 1,
    portraitSize: 32,
    scale: 0.5,
  },
};

/** the rows of a portrait sheet that has one per emotion */
const PORTRAIT_FACES: Face[] = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'worried', 'shy', 'smug'];

const ready = (s: Sheet) => s.img.complete && s.img.naturalWidth > 0;

/** True once this student's sheets have loaded; until then the game draws the code rig. */
export function spritesReady(who: Character): boolean {
  const a = SETS[who].anims;
  return ready(a.idle) && ready(a.tired) && ready(a.walk) && ready(a.talk);
}

/** How tall they stand on screen, in game pixels, for placing bubbles over their head. */
export function spriteHeight(who: Character): number {
  const s = SETS[who];
  return Math.round(s.anims.idle.img.naturalHeight * s.scale);
}

/**
 * Draws one frame with its feet at x, feetY. The context is scaled rather than
 * the image stretched, so at a scale of 0.5 on the double-detail buffer every
 * pixel of the sheet lands on exactly one pixel of the buffer.
 */
function blit(ctx: Ctx, s: Sheet, scale: number, frame: number, x: number, feetY: number, flip: boolean): void {
  const fw = s.img.naturalWidth / s.frames;
  const fh = s.img.naturalHeight;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(feetY));
  ctx.scale(flip ? -scale : scale, scale);
  ctx.drawImage(s.img, frame * fw, 0, fw, fh, -Math.floor(fw / 2), -fh, fw, fh);
  ctx.restore();
}

/**
 * A student from the side. `time` drives idle and talk; `phase` is the walk
 * cycle in radians, so their steps keep pace with how far they have moved.
 */
export function drawSprite(ctx: Ctx, who: Character, x: number, feetY: number, facing: 1 | -1, anim: SpriteAnim, time: number, phase: number): void {
  const set = SETS[who];
  const s = set.anims[anim];
  let frame: number;
  if (anim === 'walk') frame = Math.floor(((((phase / (Math.PI * 2)) % 1) + 1) % 1) * s.frames);
  else if (anim === 'talk') {
    // the gesture plays forward then back, so the loop never snaps
    const n = s.frames * 2 - 2;
    const k = Math.floor(time * s.fps) % n;
    frame = k < s.frames ? k : n - k;
  } else frame = Math.floor(time * s.fps) % s.frames;
  blit(ctx, s, set.scale, frame, x, feetY, facing < 0);
}

/** A student seen from the front (coming out of a doorway) or the back (going in). */
export function drawSpriteFacing(ctx: Ctx, who: Character, x: number, feetY: number, view: 'front' | 'back'): void {
  const set = SETS[who];
  const s = view === 'front' ? set.front : set.back;
  if (ready(s)) blit(ctx, s, set.scale, 0, x, feetY, false);
}

/** How big this student's portrait shows in the speech bubble. */
export function portraitSize(who: Character): number {
  return SETS[who].portraitSize;
}

/** True once this student's bubble portrait has loaded. */
export function portraitReady(who: Character): boolean {
  return ready(SETS[who].portrait);
}

/**
 * Their face in the speech bubble, `size` across, showing `face` if the sheet
 * has emotions. While `talking` the mouth cycles through its shapes in a
 * loose, uneven order so it reads as speech; otherwise it rests the way that
 * emotion holds it.
 */
export function drawPortrait(ctx: Ctx, who: Character, x: number, y: number, size: number, face: Face, talking: boolean, time: number): void {
  const set = SETS[who];
  const s = set.portrait;
  const fw = s.img.naturalWidth / s.frames;
  const fh = s.img.naturalHeight / set.portraitRows;
  const row = set.portraitRows > 1 ? Math.max(0, PORTRAIT_FACES.indexOf(face)) : 0;
  const order = [1, 2, 0, 3, 1, 0, 2, 3];
  const frame = talking ? order[Math.floor(time * s.fps) % order.length] : 0;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(s.img, frame * fw, row * fh, fw, fh, x, y, size, size);
  ctx.restore();
}

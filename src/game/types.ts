import { Ctx } from '../engine/display';
import { RGB } from '../engine/math';
import { Particle } from '../engine/particles';
import { Mood } from '../engine/tod';
import { Look } from './art/character';

export interface Choice {
  text: string;
  then: Line[];
}

export interface Line {
  /** npc id, 'you' for the player, or '' for narration */
  who: string;
  text: string;
  choices?: Choice[];
  /** flag to set once this line has been shown */
  set?: string;
  /** pesos to take out of (negative) or put into the player's baon once this line has been shown */
  pesos?: number;
  /** what the money was for, shown on the phone, e.g. 'Taho' */
  item?: string;
}

/** Short synthesised sound effects a cutscene can ask for. */
export type Sound = 'beep' | 'buzz' | 'turnstile' | 'zip';

/**
 * One beat of a cutscene. Steps run in order and each one waits for the last:
 * a walk until they arrive, a say until the lines are read, a pause for its
 * seconds. The rest happen instantly.
 */
export type Step =
  /** walk 'you' (default) or an NPC to x; `together` starts the next step right away; `run` makes an NPC run there */
  | { walk: number; who?: string; together?: boolean; run?: boolean }
  /**
   * 'you' or an NPC turns their back and walks in through the doorway behind them, out of the scene, taking
   * `time` seconds; `to` is the x of the doorway, `rise` how far up the screen it is from the walk line
   */
  | { walkIn: string; time?: number; to?: number; rise?: number; together?: boolean }
  /** the other way: 'you' or an NPC comes out of the doorway at x = `from`, facing the camera, to where they stand */
  | { walkOut: string; time?: number; from?: number; rise?: number; together?: boolean }
  /** put an NPC somewhere instantly */
  | { place: string; x: number; facing?: 1 | -1 }
  /** turn 'you' or an NPC to face left (-1) or right (1) */
  | { face: string; dir: 1 | -1 }
  | { say: Line[] }
  | { pause: number }
  | { sound: Sound }
  /** change what the player is wearing, e.g. { bag: undefined } to hand the bag over; null puts it all back */
  | { look: Partial<Look> | null }
  /** anything else: set a flag, poke the scene's props */
  | { run: (game: GameApi) => void };

/** What scenes are allowed to ask the game to do. */
export interface GameApi {
  has(flag: string): boolean;
  set(flag: string): void;
  say(lines: Line[]): void;
  travel(area: string, spawn: string): void;
  hour(): number;
  /** how much baon the player has left, in pesos */
  pesos(): number;
  /** true while it is raining hard enough to notice */
  raining(): boolean;
  /** start a cutscene; the player has no control until it ends */
  play(steps: Step[]): void;
}

export interface Layer {
  canvas: HTMLCanvasElement;
  /** 1 moves with the world, smaller is further away, larger is in front of the camera */
  parallax: number;
  /** 0..1, how much the layer fades into the sky colour */
  haze?: number;
  /** drawn over the characters */
  front?: boolean;
}

export interface AreaLight {
  x: number;
  y: number;
  r: number;
  color: RGB;
  strength: number;
  /** on during the day too (indoor lights, sun through a door) */
  always?: boolean;
  /** only on during the day, fades out at night (sunlight) */
  daylight?: boolean;
}

export interface Hotspot {
  id: string;
  x: number;
  range: number;
  label: string;
  /** how far above the walk line the prompt floats */
  height?: number;
  use(game: GameApi): void;
}

export interface NpcDef {
  id: string;
  name: string;
  look: Look;
  x: number;
  /** offset from the walk line, negative is further back */
  depth?: number;
  facing: 1 | -1;
  /** min and max x to stroll between; stands still if missing */
  wander?: [number, number];
  cat?: boolean;
  talk(game: GameApi): Line[];
}

export interface AreaView {
  time: number;
  camX: number;
  mood: Mood;
}

export interface AreaDef {
  id: string;
  /** shown briefly when you walk in */
  title: string;
  subtitle: string;
  width: number;
  walkY: number;
  bounds: [number, number];
  outdoor: boolean;
  layers: Layer[];
  /** lit windows etc, added on top once it gets dark */
  glow?: HTMLCanvasElement;
  lights: AreaLight[];
  hotspots: Hotspot[];
  npcs: NpcDef[];
  spawns: Record<string, { x: number; facing: 1 | -1 }>;
  /** story flag set the first time the player walks in */
  visitFlag?: string;
  /** a cutscene to play on walking in (or continuing a save here), or null for none */
  intro?(game: GameApi, playerX: number): Step[] | null;
  /** the player can't cross x from right to left until the flag is set (a turnstile, a locked door) */
  barrier?: { x: number; until: string };
  /** where the fountain is, if there is one, so its sound gets louder nearby */
  fountainX?: number;
  /** per-frame logic, mostly particle emitters */
  update?(dt: number, area: AreaRuntime, view: AreaView): void;
  /** animated things drawn behind the characters */
  drawBack?(ctx: Ctx, view: AreaView): void;
  /** animated things drawn in front of the characters, still lit like the world */
  drawFront?(ctx: Ctx, view: AreaView): void;
  /** drawn after lighting: sunbeams and anything else that should glow */
  drawOver?(ctx: Ctx, view: AreaView): void;
}

/** The bits of the running area that scene callbacks need. */
export interface AreaRuntime {
  spawnParticle(p: Partial<Particle>): void;
  playerX(): number;
}

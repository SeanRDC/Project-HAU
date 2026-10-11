// Runs one location: the player, NPCs, camera, particles and the layered
// render with lighting on top.

import { Camera } from '../engine/camera';
import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../engine/display';
import { Input } from '../engine/input';
import { LightMap, drawVignette } from '../engine/lighting';
import { RGB, clamp, css, damp, mix, smooth } from '../engine/math';
import { Particle, Particles } from '../engine/particles';
import { Mood } from '../engine/tod';
import { CHAR_HEIGHT, Look, drawCat, drawCharacter, drawShadow } from './art/character';
import { baseLook } from './art/player';
import { P } from './art/palette';
import { Sky } from './art/sky';
import { AreaDef, AreaRuntime, AreaView, GameApi, Layer, NpcDef } from './types';
import { RAINING } from './weather';

/** umbrella colours for students, picked by NPC */
const UMBRELLAS = ['#2f5f8a', '#c8553d', '#3f7a52', '#6a4a8a', '#e3b33b', '#22202a'];

const WALK_SPEED = 46;
const RUN_SPEED = 84;
const STRIDE_LENGTH = 22; // world pixels per full walk cycle

interface Walker {
  x: number;
  y: number;
  facing: 1 | -1;
  vx: number;
  phase: number;
  stride: number;
}

interface Npc extends Walker {
  def: NpcDef;
  wait: number;
  target: number | null;
  /** set by a cutscene: walk here no matter what, then stand */
  goal: number | null;
}

/** Something the player can press E on right now. */
export interface Target {
  label: string;
  x: number;
  top: number;
  use(game: GameApi): void;
}

export class Area implements AreaRuntime {
  readonly camera: Camera;
  readonly player: Walker;
  readonly npcs: Npc[];
  /** what the player is wearing right now; cutscenes can swap it (bag off, etc) */
  playerLook: Look = baseLook();
  /** how hard it is raining, 0..1, set by the game every frame */
  rain = 0;
  /** set by a cutscene: the player walks here on their own, then stops */
  walkTo: number | null = null;
  private particles = new Particles();
  private light = new LightMap();
  private time = 0;
  private hazeBuf: HTMLCanvasElement;
  private hazeCtx: Ctx;
  /** called every time a foot lands, for the footstep sound */
  onStep: (() => void) | null = null;

  constructor(readonly def: AreaDef, private sky: Sky) {
    this.camera = new Camera(def.width);
    this.player = { x: 0, y: def.walkY, facing: 1, vx: 0, phase: 0, stride: 0 };
    this.npcs = def.npcs.map((d) => ({
      def: d,
      x: d.x,
      y: def.walkY + (d.depth ?? -4),
      facing: d.facing,
      vx: 0,
      phase: 0,
      stride: 0,
      wait: 1 + Math.random() * 4,
      target: null,
      goal: null,
    }));
    [this.hazeBuf, this.hazeCtx] = makeCanvas(VIEW_W, VIEW_H);
  }

  enter(spawn: string): void {
    const s = this.def.spawns[spawn] ?? Object.values(this.def.spawns)[0];
    this.player.x = s.x;
    this.player.facing = s.facing;
    this.player.vx = 0;
    this.player.stride = 0;
    this.walkTo = null;
    this.playerLook = baseLook();
    this.camera.snap(s.x);
  }

  /** Cutscene helper: send someone ('you' or an NPC id) walking to x. */
  send(who: string, x: number): void {
    if (who === 'you') {
      this.walkTo = x;
      return;
    }
    const n = this.npcs.find((n) => n.def.id === who);
    if (n) n.goal = x;
  }

  /** Cutscene helper: put an NPC somewhere instantly. */
  place(who: string, x: number, facing?: 1 | -1): void {
    const n = this.npcs.find((n) => n.def.id === who);
    if (!n) return;
    n.x = x;
    n.goal = null;
    n.target = null;
    if (facing) n.facing = facing;
  }

  /** True while someone sent by send() is still on the way. */
  walking(who: string): boolean {
    if (who === 'you') return this.walkTo !== null;
    return this.npcs.some((n) => n.def.id === who && n.goal !== null);
  }

  /** Cutscene helper: turn someone without moving them. */
  turn(who: string, dir: 1 | -1): void {
    if (who === 'you') {
      this.player.facing = dir;
      return;
    }
    const n = this.npcs.find((n) => n.def.id === who);
    if (n) n.facing = dir;
  }

  spawnParticle(p: Partial<Particle>): void {
    this.particles.spawn(p);
  }

  playerX(): number {
    return this.player.x;
  }

  /** Screen position just above a speaker's head, for dialogue bubbles. */
  anchor(who: string): { x: number; y: number } | null {
    if (who === 'you') return { x: this.player.x - this.camera.x, y: this.player.y - CHAR_HEIGHT - 4 };
    const n = this.npcs.find((n) => n.def.id === who);
    if (!n) return null;
    return { x: n.x - this.camera.x, y: n.y - (n.def.cat ? 16 : CHAR_HEIGHT + 4 + (n.def.look.height ?? 0)) };
  }

  nameOf(who: string): string {
    return this.npcs.find((n) => n.def.id === who)?.def.name ?? '';
  }

  /** Turn an NPC and the player to face each other when a conversation starts. */
  face(who: string): void {
    const n = this.npcs.find((n) => n.def.id === who);
    if (!n) return;
    n.facing = this.player.x >= n.x ? 1 : -1;
    n.target = null;
    n.wait = 3;
    this.player.facing = n.x >= this.player.x ? 1 : -1;
  }

  target(): Target | null {
    let best: Target | null = null;
    let bestD = Infinity;
    for (const n of this.npcs) {
      const d = Math.abs(n.x - this.player.x);
      if (d < 24 && d < bestD) {
        bestD = d;
        best = {
          label: n.def.cat ? `Lapitan si ${n.def.name}` : `Kausapin si ${n.def.name}`,
          x: n.x,
          top: n.y - (n.def.cat ? 18 : CHAR_HEIGHT + 6),
          use: (g) => {
            this.face(n.def.id);
            g.say(n.def.talk(g));
          },
        };
      }
    }
    for (const h of this.def.hotspots) {
      const d = Math.abs(h.x - this.player.x);
      if (d < h.range && d < bestD) {
        bestD = d;
        best = { label: h.label, x: h.x, top: this.def.walkY - (h.height ?? CHAR_HEIGHT + 10), use: (g) => h.use(g) };
      }
    }
    return best;
  }

  private advance(w: Walker, dt: number): void {
    const before = Math.floor(w.phase / Math.PI);
    w.x += w.vx * dt;
    const moving = Math.abs(w.vx) > 3;
    w.stride = damp(w.stride, moving ? 1 : 0, 12, dt);
    if (moving) w.phase += (Math.abs(w.vx) * dt * Math.PI * 2) / STRIDE_LENGTH;
    else if (w.stride < 0.05) w.phase = 0;
    if (w === this.player && moving && Math.floor(w.phase / Math.PI) !== before) this.onStep?.();
  }

  update(dt: number, input: Input, mood: Mood, locked: boolean): void {
    this.time += dt;
    const p = this.player;
    let axis = locked ? 0 : input.axis();
    let speed = input.down('run') ? RUN_SPEED : WALK_SPEED;
    if (this.walkTo !== null) {
      const d = this.walkTo - p.x;
      if (Math.abs(d) < 1.5) {
        this.walkTo = null;
        axis = 0;
      } else {
        axis = Math.sign(d);
        speed = WALK_SPEED * clamp(Math.abs(d) / 6, 0.4, 1);
      }
    }
    p.vx = damp(p.vx, axis * speed, 14, dt);
    if (axis !== 0) p.facing = axis > 0 ? 1 : -1;
    this.advance(p, dt);
    const [lo, hi] = this.def.bounds;
    if (p.x < lo || p.x > hi) {
      p.x = clamp(p.x, lo, hi);
      p.vx = 0;
    }

    for (const n of this.npcs) {
      n.vx = 0;
      if (n.goal !== null) {
        const d = n.goal - n.x;
        if (Math.abs(d) < 1.5) {
          n.goal = null;
          n.wait = 3 + Math.random() * 4;
        } else {
          n.facing = d > 0 ? 1 : -1;
          n.vx = n.facing * 26;
        }
      } else if (n.def.wander && !locked) {
        if (n.target === null) {
          n.wait -= dt;
          if (n.wait <= 0) n.target = n.def.wander[0] + Math.random() * (n.def.wander[1] - n.def.wander[0]);
        } else {
          const d = n.target - n.x;
          if (Math.abs(d) < 2) {
            n.target = null;
            n.wait = 2 + Math.random() * 5;
          } else {
            n.facing = d > 0 ? 1 : -1;
            n.vx = n.facing * 20;
          }
        }
      }
      this.advance(n, dt);
    }

    this.camera.follow(p.x, p.facing, dt);
    this.def.update?.(dt, this, this.view(mood));
    this.particles.update(dt);
  }

  private view(mood: Mood): AreaView {
    return { time: this.time, camX: this.camera.x, mood };
  }

  private drawLayer(ctx: Ctx, layer: Layer, mood: Mood): void {
    const x = -Math.round(this.camera.x * layer.parallax);
    ctx.drawImage(layer.canvas, x, 0);
    if (layer.haze) {
      const h = this.hazeCtx;
      h.globalCompositeOperation = 'source-over';
      h.clearRect(0, 0, VIEW_W, VIEW_H);
      h.drawImage(layer.canvas, x, 0);
      h.globalCompositeOperation = 'source-in';
      h.fillStyle = css(mood.haze);
      h.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.globalAlpha = layer.haze;
      ctx.drawImage(this.hazeBuf, 0, 0);
      ctx.globalAlpha = 1;
    }
  }

  render(ctx: Ctx, mood: Mood): void {
    const def = this.def;
    const cam = Math.round(this.camera.x);
    const view = this.view(mood);
    const night = smooth(mood.night);

    this.sky.render(ctx, mood, cam);
    for (const l of def.layers) if (!l.front) this.drawLayer(ctx, l, mood);
    def.drawBack?.(ctx, view);
    this.particles.render(ctx, cam, false);

    const walkers: (Walker | Npc)[] = [...this.npcs, this.player];
    walkers.sort((a, b) => a.y - b.y);
    for (const w of walkers) {
      const npc = 'def' in w ? w.def : null;
      const sx = w.x - cam;
      if (sx < -30 || sx > VIEW_W + 30) continue;
      if (npc?.cat) {
        drawShadow(ctx, sx, w.y, 6);
        drawCat(ctx, sx, w.y, this.time);
        continue;
      }
      drawShadow(ctx, sx, w.y);
      let look = npc ? npc.look : this.playerLook;
      // out in the rain, you and the students put up umbrellas; guards and vendors have their tents
      if (def.outdoor && this.rain > RAINING && (!npc || look.lace)) {
        look = { ...look, umbrella: npc ? UMBRELLAS[npc.id.length % UMBRELLAS.length] : P.maroon };
      }
      drawCharacter(ctx, sx, w.y, look, {
        facing: w.facing,
        phase: w.phase,
        stride: w.stride,
        time: this.time + w.x * 0.37,
      });
    }

    def.drawFront?.(ctx, view);
    for (const l of def.layers) if (l.front) this.drawLayer(ctx, l, mood);

    // indoors the sun matters less, the walls keep things warm and even
    const ambient: RGB = def.outdoor ? mood.ambient : mix(mix(mood.ambient, [255, 236, 210], 0.45), [70, 62, 96], night * 0.35);
    this.light.begin(ambient);
    for (const l of def.lights) {
      let a = l.strength;
      if (l.daylight) a *= 1 - night;
      else if (!l.always) a *= night;
      this.light.add(l.x - cam, l.y, l.r, l.daylight ? mood.sun : l.color, a);
    }
    this.light.apply(ctx, 0.2);

    if (def.glow && night > 0.02) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = night * 0.85;
      ctx.drawImage(def.glow, -cam, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    def.drawOver?.(ctx, view);
    this.particles.render(ctx, cam, true);

    if (def.outdoor && mood.glow > 0.02) {
      // low sun flooding the whole frame
      const sun = this.sky.sunPosition(mood);
      const g = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, 330);
      g.addColorStop(0, css(mood.sun, 0.3 * mood.glow));
      g.addColorStop(0.5, css(mood.sun, 0.1 * mood.glow));
      g.addColorStop(1, css(mood.sun, 0));
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.globalCompositeOperation = 'source-over';
    }
    drawVignette(ctx, 0.75 + night * 0.25);
  }
}

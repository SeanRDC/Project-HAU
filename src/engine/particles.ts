import { Ctx, VIEW_W } from './display';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  gravity: number;
  /** sideways wobble, for leaves and dust */
  sway: number;
  /** drawn after lighting so it stays bright at night */
  glow: boolean;
  /** stop and fade when reaching this y (ground level), if set */
  floor: number;
}

const DEFAULTS: Particle = {
  x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, color: '#fff', size: 1, gravity: 0, sway: 0, glow: false, floor: Infinity,
};

export class Particles {
  list: Particle[] = [];

  spawn(p: Partial<Particle>): void {
    if (this.list.length > 600) return;
    this.list.push({ ...DEFAULTS, ...p, life: 0 });
  }

  update(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life += dt;
      if (p.life >= p.max) {
        this.list[i] = this.list[this.list.length - 1];
        this.list.pop();
        continue;
      }
      if (p.y >= p.floor) {
        p.y = p.floor;
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += (p.vx + Math.sin(p.life * 2.3 + p.max * 9) * p.sway) * dt;
      p.y += p.vy * dt;
    }
  }

  render(ctx: Ctx, camX: number, glowPass: boolean): void {
    for (const p of this.list) {
      if (p.glow !== glowPass) continue;
      const sx = Math.round(p.x - camX);
      if (sx < -4 || sx > VIEW_W + 4) continue;
      const t = p.life / p.max;
      // fade in quickly, fade out over the last third
      ctx.globalAlpha = Math.min(1, t * 8) * Math.min(1, (1 - t) * 3);
      ctx.fillStyle = p.color;
      ctx.fillRect(sx, Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}

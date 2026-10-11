import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { css, mix, rng } from '../../engine/math';
import { disc, tinted } from '../../engine/pix';
import { Mood } from '../../engine/tod';

interface Cloud {
  body: HTMLCanvasElement;
  rim: HTMLCanvasElement;
  belly: HTMLCanvasElement;
  x: number;
  y: number;
  speed: number;
  depth: number;
}

const HORIZON = 206;

function buildCloud(rand: () => number, w: number, h: number): Pick<Cloud, 'body' | 'rim' | 'belly'> {
  const [body, b] = makeCanvas(w, h);
  const puffs = 5 + Math.floor(rand() * 5);
  for (let i = 0; i < puffs; i++) {
    const t = (i + 0.5) / puffs;
    // tallest in the middle, flat along the bottom
    const r = (h * 0.28 + rand() * h * 0.2) * (0.55 + Math.sin(t * Math.PI) * 0.6);
    disc(b, w * 0.12 + t * w * 0.76, h - 5 - r * 0.75, r, '#fff');
  }
  b.clearRect(0, h - 5, w, 5);
  b.fillStyle = '#fff';
  b.fillRect(w * 0.14, h - 7, w * 0.72, 2);

  // top edge that catches the sun
  const [rim, r] = makeCanvas(w, h);
  r.drawImage(body, 0, 0);
  r.globalCompositeOperation = 'destination-out';
  r.drawImage(body, 1, 3);

  // shaded underside
  const [belly, s] = makeCanvas(w, h);
  s.drawImage(body, 0, 0);
  s.globalCompositeOperation = 'destination-out';
  s.drawImage(body, -1, -5);

  return { body, rim, belly };
}

export class Sky {
  private clouds: Cloud[] = [];
  private stars: { x: number; y: number; phase: number; bright: number }[] = [];
  private time = 0;

  constructor(seed = 7) {
    const rand = rng(seed);
    for (let i = 0; i < 9; i++) {
      const depth = 0.35 + rand() * 0.65;
      const w = Math.round((50 + rand() * 80) * depth + 20);
      const h = Math.round(w * (0.3 + rand() * 0.14));
      this.clouds.push({
        ...buildCloud(rand, w, h),
        x: rand() * (VIEW_W + 200) - 100,
        y: 8 + rand() * 105 - h * 0.3,
        speed: (1.5 + rand() * 2) * depth,
        depth,
      });
    }
    this.clouds.sort((a, b) => a.depth - b.depth);
    for (let i = 0; i < 90; i++) {
      this.stars.push({ x: rand() * VIEW_W, y: rand() * 170, phase: rand() * 6.28, bright: 0.35 + rand() * 0.65 });
    }
  }

  update(dt: number): void {
    this.time += dt;
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > VIEW_W + 120) c.x = -c.body.width - 60;
    }
  }

  /** Screen position of the sun (or the moon at night). */
  sunPosition(mood: Mood): { x: number; y: number; up: boolean } {
    const p = (mood.hour - 5.7) / 12.9;
    if (p >= 0 && p <= 1) {
      return { x: 60 + p * 330, y: HORIZON - Math.sin(p * Math.PI) * 215 + 18, up: true };
    }
    const q = (((mood.hour + 24 - 18.6) % 24) / 11.1);
    return { x: 90 + q * 300, y: HORIZON - Math.sin(q * Math.PI) * 190 + 20, up: false };
  }

  render(ctx: Ctx, mood: Mood, camX: number): void {
    const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
    g.addColorStop(0, css(mood.skyTop));
    g.addColorStop(0.55, css(mix(mood.skyTop, mood.skyBottom, 0.55)));
    g.addColorStop(1, css(mood.skyBottom));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    if (mood.night > 0.05) {
      for (const s of this.stars) {
        const tw = 0.6 + 0.4 * Math.sin(this.time * 1.7 + s.phase);
        ctx.globalAlpha = mood.night * s.bright * tw * (1 - s.y / 220);
        ctx.fillStyle = '#e8ecff';
        ctx.fillRect(s.x | 0, s.y | 0, 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    const sun = this.sunPosition(mood);
    const sx = sun.x - camX * 0.02;
    if (sun.up) {
      const r = 60 + mood.glow * 70;
      const halo = ctx.createRadialGradient(sx, sun.y, 0, sx, sun.y, r);
      halo.addColorStop(0, css(mood.sun, 0.55 + mood.glow * 0.25));
      halo.addColorStop(0.3, css(mood.sun, 0.22 + mood.glow * 0.15));
      halo.addColorStop(1, css(mood.sun, 0));
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = halo;
      ctx.fillRect(sx - r, sun.y - r, r * 2, r * 2);
      ctx.globalCompositeOperation = 'source-over';
      disc(ctx, sx, sun.y, 8, css(mix(mood.sun, [255, 255, 255], 0.55)));
    } else if (mood.night > 0.3) {
      ctx.globalAlpha = mood.night;
      const halo = ctx.createRadialGradient(sx, sun.y, 0, sx, sun.y, 40);
      halo.addColorStop(0, 'rgba(190,205,255,0.28)');
      halo.addColorStop(1, 'rgba(190,205,255,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(sx - 40, sun.y - 40, 80, 80);
      disc(ctx, sx, sun.y, 6, '#eef1ff');
      disc(ctx, sx + 3, sun.y - 2, 5, css(mix(mood.skyTop, mood.skyBottom, 0.2)));
      ctx.globalAlpha = 1;
    }

    const base = mix(mix([255, 255, 255], mood.haze, 0.3), mood.skyTop, mood.night * 0.72);
    const belly = mix(base, mix(mood.skyTop, mood.haze, 0.5), 0.5);
    const rim = mix(base, mood.sun, 0.35 + mood.glow * 0.5);
    for (const c of this.clouds) {
      const x = Math.round(c.x - camX * 0.04 * c.depth);
      const y = Math.round(c.y);
      ctx.globalAlpha = 0.55 + c.depth * 0.4;
      ctx.drawImage(tinted(c.body, css(base)), 0, 0, c.body.width, c.body.height, x, y, c.body.width, c.body.height);
      ctx.drawImage(tinted(c.belly, css(belly)), 0, 0, c.body.width, c.body.height, x, y, c.body.width, c.body.height);
      ctx.globalAlpha *= 1 - mood.night * 0.8;
      ctx.drawImage(tinted(c.rim, css(rim)), 0, 0, c.body.width, c.body.height, x, y, c.body.width, c.body.height);
    }
    ctx.globalAlpha = 1;
  }
}

// APS's first cinematic art pass. Geometry stays in campus coordinates; only
// the view-sized shadow buffer is redrawn. All other areas retain their look.
import { Ctx, VIEW_H, VIEW_W, makeCanvas } from '../../engine/display';
import { clamp, css, rng, smooth } from '../../engine/math';
import { ellipse, line, poly, px, rect } from '../../engine/pix';
import { AreaSunlight, AreaView, Layer } from '../types';

export interface ApsLayout {
  width: number;
  ground: number;
  wing: number;
  tall: number;
  tower: number;
  canteen: number;
  canteenEnd: number;
  canopyLeft: number;
  canopyRight: number;
  lamps: number[];
  umbrellas: number[];
}

/** Project the same sun onto the architecture, props, and animated sprites. */
function sun(view: AreaView): { x: number; y: number; strength: number } {
  const phase = clamp((view.mood.hour - 5.7) / 12.9, 0, 1);
  const elevation = Math.sin(phase * Math.PI);
  const day = elevation < 0.001 ? 0 : smooth(clamp(elevation * 4, 0, 1)) * (1 - smooth(view.mood.night));
  return {
    x: Math.cos(phase * Math.PI) * (0.4 + (1 - elevation) * 1.8),
    y: 0.17 + (1 - elevation) * 0.36,
    strength: day * (1 - view.rain * 0.9) * 0.38,
  };
}

/** Static material detail and recesses; no orange tint is baked into the art. */
export function deepenAps(c: Ctx, g: Ctx, l: ApsLayout): void {
  const { ground: base, wing: x, tall, canopyLeft: left, canopyRight: right } = l;
  const gy = base - 38;
  const top = gy - 78;
  const rand = rng(61015);

  // A visible return at the garden end: roof plane, shaded side, sun-facing edge.
  poly(c, [[x - 10, top - 5], [x, top], [x, base], [x - 10, base - 4]], '#9ba4b0');
  line(c, x - 10, top - 5, x - 10, base - 4, '#737e91');
  poly(c, [[x - 10, top - 5], [tall - 5, top - 5], [tall, top], [x, top]], '#e8e7df');
  line(c, x, top, tall - 1, top, '#fff7df');

  // Corridor slabs have an underside, a recessed ceiling, and a narrow bevel.
  for (let floor = 0; floor < 3; floor++) {
    const y = gy - (floor + 1) * 22;
    rect(c, x + 3, y + 3, tall - x - 7, 3, 'rgba(31, 43, 69, 0.3)');
    rect(c, x + 3, y + 6, tall - x - 7, 2, 'rgba(47, 60, 85, 0.12)');
    rect(c, x, y + 22, tall - x - 4, 2, '#a3a7b1');
    rect(c, x, y + 24, tall - x - 4, 1, 'rgba(38, 48, 72, 0.22)');
    for (let bx = x; bx < tall - 6; bx += 30) {
      // Short diagonal reveals explain the distance between the rail and wall.
      poly(c, [[bx + 3, y + 3], [bx + 8, y + 6], [bx + 8, y + 12], [bx + 3, y + 12]], 'rgba(35, 46, 72, 0.23)');
      rect(c, bx, y + 2, 1, 20, '#fff5df');
    }
  }

  // Real roof thickness over the entrance; the building name remains on its fascia.
  poly(c, [[left, gy - 8], [left + 13, gy - 16], [right - 14, gy - 16], [right, gy - 8]], '#c4c6c5');
  // The projecting roof hides the corridor windows behind it, including their emission.
  g.save();
  g.globalCompositeOperation = 'destination-out';
  poly(g, [[left, gy - 8], [left + 13, gy - 16], [right - 14, gy - 16], [right, gy - 8]], '#ffffff');
  g.restore();
  line(c, left + 13, gy - 16, right - 14, gy - 16, '#f3eee0');
  for (let rx = left + 27; rx < right - 15; rx += 28) line(c, rx, gy - 15, rx - 7, gy - 9, '#b2b6bb');
  rect(c, left, gy + 2, right - left, 4, '#7c8594');
  rect(c, left + 3, gy + 6, right - left - 6, 5, 'rgba(27, 38, 65, 0.26)');
  rect(c, left + 3, gy + 11, right - left - 6, 14, 'rgba(46, 59, 83, 0.16)');
  rect(c, left + 2, base - 3, right - left - 4, 2, '#aba99f');
  rect(c, left + 2, base - 1, right - left - 4, 1, '#e0d9c8');
  // The side of each stone pier sits behind its lit face.
  const half = (right - left - 16) / 2;
  const cx = left + 8 + half;
  const count = Math.max(2, Math.round(half * 2 / 48));
  const step = (half * 2 - 16) / count;
  for (let i = 0; i <= count; i++) {
    const p = Math.round(cx - half + 2 + i * step);
    if (Math.abs(p + 7 - cx) < 20) continue;
    poly(c, [[p + 14, gy + 6], [p + 19, gy + 3], [p + 19, base - 3], [p + 14, base]], '#797b7e');
    rect(c, p + 13, gy + 6, 1, 32, '#847c70');
    rect(c, p, base - 2, 14, 2, '#8c8173');
  }

  // The rounded block's broad slabs need a cooler underside to stand forward.
  for (let floor = 0; floor < 5; floor++) {
    const y = base - 40 - floor * 20;
    rect(c, tall + 4, y - 2, l.tower - tall - 8, 2, '#9ca2ae');
    rect(c, tall + 5, y, l.tower - tall - 10, 2, 'rgba(34, 45, 68, 0.26)');
  }
  rect(c, tall, base - 158, 3, 158, '#b1b5bc');
  rect(c, l.tower, base - 178, 6, 178, 'rgba(45, 60, 87, 0.18)');

  // Sparse weathering grouped below joints, rather than a uniform noise layer.
  for (let bx = x + 16; bx < tall; bx += 30) {
    for (let n = 0; n < 3; n++) {
      const sy = gy - 22 * (1 + Math.floor(rand() * 3)) + 16;
      rect(c, bx + rand() * 7, sy, 1, 1 + rand() * 3, 'rgba(78, 83, 93, 0.12)');
    }
  }
}

/** Quiet, larger material shapes let the architecture and people carry detail. */
export function apsPavement(c: Ctx, l: ApsLayout): void {
  const { ground: y, width } = l;
  const rand = rng(67103);
  rect(c, 0, y + 18, width, VIEW_H - y - 18, '#85888c');
  for (let row = y + 18; row < VIEW_H; row++) {
    const t = (row - y - 18) / (VIEW_H - y - 18);
    rect(c, 0, row, width, 1, css([169, 172, 175], (1 - t) * 0.23));
  }
  for (let i = 0; i < width * 1.5; i++) {
    const sx = rand() * width;
    const sy = y + 20 + rand() * 42;
    px(c, sx, sy, rand() > 0.6 ? 'rgba(222, 218, 204, 0.16)' : 'rgba(43, 50, 64, 0.12)');
  }
  for (let sx = 34; sx < width; sx += 106) {
    line(c, sx, y + 19, sx - 24, VIEW_H, 'rgba(48, 55, 68, 0.28)');
    line(c, sx + 1, y + 19, sx - 23, VIEW_H, 'rgba(224, 220, 206, 0.13)');
  }
  // Concrete slab tops, the vertical kerb face, a dark seam against the road.
  rect(c, 0, y + 14, width, 1, '#e0ded0');
  rect(c, 0, y + 15, width, 2, '#aeb1ac');
  rect(c, 0, y + 17, width, 1, '#636b76');
  rect(c, 0, y + 18, width, 1, 'rgba(32, 42, 61, 0.22)');
  for (let sx = 0; sx < width; sx += 42) {
    rect(c, sx, y + 15, 1, 2, '#7f898e');
    if (rand() > 0.3) rect(c, sx + 3, y + 18, 5 + rand() * 8, 1, '#646f73');
  }
}

/** Close branches frame the street with small leaf shapes and open sky between them. */
export function apsForeground(width: number): Layer {
  const parallax = 1.18;
  const [canvas, c] = makeCanvas(Math.ceil(VIEW_W + (width - VIEW_W) * parallax) + 4, VIEW_H);
  const rand = rng(61017);
  const leafTones = ['#283a40', '#304349', '#3b4d4c', '#46574f'];
  for (const root of [125, 660, 1160]) {
    for (let branch = 0; branch < 6; branch++) {
      const ex = root + (branch - 2.5) * 35;
      const ey = 10 + rand() * 20;
      line(c, root, -10, ex, ey, '#28363b', branch % 2 ? 2 : 3);
      for (let twig = 0; twig < 5; twig++) {
        const t = (twig + 1) / 5;
        const tx = root + (ex - root) * t;
        const ty = -10 + (ey + 10) * t;
        const dir = twig % 2 ? 1 : -1;
        line(c, tx, ty, tx + dir * 14, ty + 6, '#33444a');
        for (let n = 0; n < 14; n++) {
          const lx = tx + (rand() - 0.4) * 26;
          const ly = ty + (rand() - 0.3) * 13;
          const tone = leafTones[Math.floor(rand() * leafTones.length)];
          // Pointed leaves, separated by air rather than solid circular clumps.
          poly(c, [[lx - 3, ly], [lx, ly - 2], [lx + 4, ly], [lx, ly + 2]], tone);
          if (rand() > 0.65) px(c, lx, ly - 1, '#64715b');
        }
      }
    }
  }
  for (const root of [85, 585, 1080]) {
    const base = VIEW_H + 7;
    for (let frond = 0; frond < 9; frond++) {
      const dx = (frond - 4) * 10;
      const top = base - 13 - rand() * 17;
      line(c, root, base, root + dx, top, '#334647');
      for (let n = 0; n < 8; n++) {
        const t = n / 8;
        const x = root + dx * t;
        const y = base + (top - base) * t;
        const span = (1 - t) * 9 + 2;
        line(c, x, y, x - span, y - 3, '#2b3d42');
        line(c, x, y, x + span, y - 3, '#3c504d');
      }
    }
  }
  return { canvas, parallax, front: true };
}

export function apsLighting(l: ApsLayout, architecture: HTMLCanvasElement): {
  sunlight: AreaSunlight;
  drawBack(c: Ctx, view: AreaView): void;
  drawOver(c: Ctx, view: AreaView): void;
} {
  const [shadows, s] = makeCanvas(VIEW_W, VIEW_H);
  const [leaves, leaf] = makeCanvas(l.width, VIEW_H);
  const rand = rng(61016);
  // Branch and leaf silhouettes baked once and clipped to the buildings, not the sky.
  for (const tree of [l.wing - 20, l.tall + 110, l.canteenEnd + 36]) {
    for (let branch = 0; branch < 9; branch++) {
      const bx = tree + (rand() - 0.5) * 130;
      const by = 95 + rand() * 92;
      line(leaf, tree + 34, l.ground + 15, bx, by, '#26374a', 1);
      for (let cluster = 0; cluster < 6; cluster++) {
        const cx = bx + (rand() - 0.5) * 33;
        const cy = by + (rand() - 0.5) * 17;
        ellipse(leaf, cx, cy, 3 + rand() * 7, 2 + rand() * 4, '#26374a');
      }
    }
  }
  leaf.globalCompositeOperation = 'destination-in';
  leaf.drawImage(architecture, 0, 0);
  leaf.globalCompositeOperation = 'source-over';

  function canopyShadow(view: AreaView): { left: number; right: number; depth: number; dx: number } {
    const light = sun(view);
    return { left: l.canopyLeft, right: l.canopyRight, depth: 20 + light.y * 58, dx: light.x * 48 };
  }

  return {
    sunlight: {
      projection: sun,
      bloom: 0.075,
      glare: 0.22,
      shadeAt(x, y, view) {
        const light = sun(view);
        const canopy = canopyShadow(view);
        const t = clamp((y - l.ground) / canopy.depth, 0, 1);
        const inCanopy = x > canopy.left + canopy.dx * t && x < canopy.right + canopy.dx * t;
        const edge = clamp((l.ground + canopy.depth - y) / 4, 0, 1);
        const shade = inCanopy && y > l.ground - 36 ? 0.8 * edge : 0;
        // Dappled tree shade at the garden end, continuous as the player walks.
        const garden = clamp(1 - Math.abs(x - (l.wing + 15 + light.x * 60)) / 76, 0, 1);
        const dapple = garden * (0.25 + Math.sin(x * 0.14) * 0.12);
        return Math.max(shade, dapple) * light.strength / 0.38;
      },
    },
    drawBack(c, view) {
      const light = sun(view);
      const cam = Math.round(view.camX);
      const day = light.strength / 0.38;
      c.save();
      // Dappled shade moves just a pixel or two; it never swims across the wall.
      c.globalAlpha = day * 0.17;
      c.drawImage(leaves, -cam + Math.round(Math.sin(view.time * 0.33)), 0);
      c.globalAlpha = 1;

      // One union mask keeps intersecting shadows from accumulating to black.
      s.clearRect(0, 0, VIEW_W, VIEW_H);
      const canopy = canopyShadow(view);
      poly(s, [[canopy.left - cam, l.ground], [canopy.right - cam, l.ground],
        [canopy.right + canopy.dx - cam, l.ground + canopy.depth],
        [canopy.left + canopy.dx - cam, l.ground + canopy.depth]], '#303c56');
      // Recessed ground-floor corridor and the stair block's mass.
      poly(s, [[l.tall - cam, l.ground], [l.canteenEnd - cam, l.ground],
        [l.canteenEnd + light.x * 28 - cam, l.ground + 9 + light.y * 20],
        [l.tall + light.x * 28 - cam, l.ground + 9 + light.y * 20]], '#303c56');
      for (const x of l.lamps) {
        line(s, x - cam, l.ground + 14, x + light.x * 76 - cam, l.ground + 14 + light.y * 76, '#303c56', 2);
        ellipse(s, x + light.x * 76 - cam, l.ground + 14 + light.y * 76, 7, 2, '#303c56');
      }
      for (const x of l.umbrellas) {
        line(s, x - cam, l.ground + 7, x + light.x * 30 - cam, l.ground + 7 + light.y * 30, '#303c56', 1);
        ellipse(s, x + light.x * 30 - cam, l.ground + 7 + light.y * 30, 23, 5, '#303c56');
      }
      // Broken foliage shadows reach into the road from the garden trees.
      for (const x of [l.wing - 12, l.wing + 86, l.canteenEnd + 25]) {
        const dx = x + light.x * 70 - cam;
        for (let k = 0; k < 12; k++) {
          const rx = Math.sin(k * 19.3) * 30;
          const ry = Math.cos(k * 7.7) * 9;
          ellipse(s, dx + rx + Math.round(Math.sin(view.time * 0.4 + k)), l.ground + 19 + light.y * 62 + ry, 9 + (k % 4) * 2, 3 + k % 3, '#303c56');
        }
      }
      // Clip shadow projections to the ground plane.
      s.clearRect(0, 0, VIEW_W, l.ground);
      // A one-pixel penumbra softens silhouettes without blurring the pixel art.
      c.globalAlpha = light.strength * 0.12;
      c.drawImage(shadows, -1, 0);
      c.drawImage(shadows, 1, 1);
      c.globalAlpha = light.strength * 0.88;
      c.drawImage(shadows, 0, 0);
      c.globalAlpha = 1;

      // Reflected cool sky at the shaded entrance, warm narrow sunlit slab rims.
      c.globalAlpha = day;
      rect(c, l.canopyLeft - cam, l.ground - 34, l.canopyRight - l.canopyLeft, 22, 'rgba(38, 56, 88, 0.16)');
      for (let floor = 0; floor < 3; floor++) {
        const y = l.ground - 38 - floor * 22 - 9;
        rect(c, l.wing - cam, y, l.tall - l.wing - 4, 1, css(view.mood.sun, 0.35));
      }
      c.restore();
    },
    drawOver(c, view) {
      const cam = Math.round(view.camX);
      const night = smooth(view.mood.night);
      const daylight = sun(view).strength / 0.38;
      c.save();
      // A low, directional veil along the road, not a white wash over the facade.
      const air = c.createLinearGradient(0, l.ground - 8, 0, VIEW_H);
      air.addColorStop(0, css(view.mood.sun, daylight * 0.055));
      air.addColorStop(1, 'rgba(135, 162, 187, 0)');
      c.fillStyle = air;
      c.fillRect(0, l.ground - 8, VIEW_W, VIEW_H - l.ground + 8);

      // Lantern light lands on an elliptical patch of pavement, with a tight core.
      if (night > 0.02) {
        c.globalCompositeOperation = 'screen';
        const door = (l.canopyLeft + l.canopyRight) / 2 - cam;
        poly(c, [[door - 12, l.ground], [door + 12, l.ground],
          [door + 28, l.ground + 30], [door - 34, l.ground + 30]], css([255, 193, 122], night * 0.09));
        for (const x of l.lamps) {
          const sx = x - cam;
          if (sx < -70 || sx > VIEW_W + 70) continue;
          c.save();
          c.translate(sx, l.ground + 25);
          c.scale(1, 0.23);
          const pool = c.createRadialGradient(0, 0, 1, 0, 0, 48);
          pool.addColorStop(0, css([255, 198, 127], night * 0.28));
          pool.addColorStop(0.45, css([255, 188, 111], night * 0.12));
          pool.addColorStop(1, 'rgba(255, 188, 111, 0)');
          c.fillStyle = pool;
          c.fillRect(-48, -48, 96, 96);
          c.restore();
        }
      }
      c.globalCompositeOperation = 'source-over';
      // A few backlit motes around the garden and entrance, absent in rain.
      if (daylight > 0.1 && view.rain < 0.1) {
        for (let i = 0; i < 14; i++) {
          const x = l.canopyLeft - 70 + ((i * 47 + view.time * (0.9 + i % 3 * 0.3)) % 370);
          const y = 153 + Math.sin(i * 3.9 + view.time * 0.32) * 31;
          const pulse = 0.5 + Math.sin(i * 2.1 + view.time * 0.6) * 0.5;
          px(c, x - cam, y, css([255, 232, 183], daylight * pulse * 0.45));
        }
      }
      c.restore();
    },
  };
}

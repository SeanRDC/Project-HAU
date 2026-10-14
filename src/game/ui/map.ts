// The campus map. Press C to see the whole campus from above, with you on it,
// and (for now) pick any place to jump straight there. A small corner of the
// same map rides in the top right of the screen while you walk.
//
// The art is painted in art/campusmap.ts from campus/plan.ts, so it is also
// the quickest way to check the plan against the official campus map.

import { Ctx, VIEW_H, VIEW_W } from '../../engine/display';
import { Input } from '../../engine/input';
import { damp } from '../../engine/math';
import { BOUNDS, CampusPicture, paintCampus } from '../art/campusmap';
import { P } from '../art/palette';
import { BUILDINGS, Building, Spot, metres, spot } from '../campus/plan';
import { GOLD, INK, MAROON, PAPER, SERIF, font, keyCap } from './draw';

/**
 * Jumping from the map is a stand-in while the campus is only partly walkable.
 * Turn it off once every part of the campus is joined up on foot.
 */
export const TELEPORT = true;

/** The places the map can send you, in the order you would walk past them. [area, spawn] */
export const STOPS: [string, string][] = [
  ['gate', 'street'],
  ['entry', 'gate'],
  ['park', 'gate'],
  ['plaza', 'start'],
  ['lobby', 'front'],
  ['courtyard', 'lobby'],
  ['walkway', 'rotunda'],
  ['lane', 'plaza'],
  ['halls', 'lane'],
  ['aps', 'halls'],
  ['lawn', 'walkway'],
  ['sjh', 'lawn'],
  ['gym', 'aps'],
];

export interface Stop {
  area: string;
  spawn: string;
  name: string;
  /** where on the plan you land */
  at: Spot;
}

const PANEL = { x: 8, y: 8, w: VIEW_W - 16, h: VIEW_H - 16 };
const MAP = { x: 16, y: 32, w: 322, h: 214 };
const LIST_X = 346;
const ROW = 11;

const MINI = { w: 92, h: 58, x: VIEW_W - 92 - 8, y: 8 };
/** pixels per metre on the minimap: close enough to see the buildings next to you */
const MINI_SCALE = 0.85;

const ALL: Building[] = Object.values(BUILDINGS);

// which way is north on this map: one aerial pixel straight up, in plan terms
const up = spot([835, 299]);
const NORTH = Math.atan2(up.v, up.u);

export class CampusMap {
  open = false;
  stops: Stop[] = [];
  private fade = 0;
  private pick = 0;
  private big: CampusPicture | null = null;
  private small: CampusPicture | null = null;

  /** Open or close. `area` is where the player is, so the list starts on it. */
  toggle(area: string): void {
    this.open = !this.open;
    if (this.open) this.pick = Math.max(0, this.stops.findIndex((s) => s.area === area));
  }

  update(dt: number): void {
    this.fade = damp(this.fade, this.open ? 1 : 0, 14, dt);
  }

  /** While the map is open: W and S move through the list, E picks. Returns the place to go to, if any. */
  choose(input: Input, onMove: () => void): Stop | null {
    if (!this.open || !TELEPORT || !this.stops.length) return null;
    const n = this.stops.length;
    if (input.pressed('up') || input.pressed('left')) {
      this.pick = (this.pick + n - 1) % n;
      onMove();
    } else if (input.pressed('down') || input.pressed('right')) {
      this.pick = (this.pick + 1) % n;
      onMove();
    } else if (input.pressed('interact')) {
      return this.stops[this.pick];
    }
    return null;
  }

  private picture(): CampusPicture {
    if (!this.big) {
      const fit = Math.min(MAP.w / (BOUNDS.u1 - BOUNDS.u0), MAP.h / (BOUNDS.v1 - BOUNDS.v0));
      this.big = paintCampus(fit);
    }
    return this.big;
  }

  /**
   * The corner minimap. `here` is where the player is on the plan and `ahead`
   * a spot a little way in front of them, for the arrow. Both null hides it.
   */
  renderMini(ui: Ctx, here: Spot | null, ahead: Spot | null, time: number, night: number): void {
    if (!here || this.fade > 0.99) return;
    this.small ??= paintCampus(MINI_SCALE);
    const pic = this.small;
    const [px, py] = pic.at(here);
    // keep the player in the middle, but never show past the edge of the picture
    const sx = Math.round(Math.max(0, Math.min(pic.canvas.width - MINI.w, px - MINI.w / 2)));
    const sy = Math.round(Math.max(0, Math.min(pic.canvas.height - MINI.h, py - MINI.h / 2)));

    ui.save();
    ui.globalAlpha = 1 - this.fade;
    pixelFrame(ui, MINI.x, MINI.y, MINI.w, MINI.h);
    ui.imageSmoothingEnabled = false;
    ui.drawImage(pic.canvas, sx, sy, MINI.w, MINI.h, MINI.x, MINI.y, MINI.w, MINI.h);
    // dim it after dark so it does not glare out of a night scene
    if (night > 0.01) {
      ui.fillStyle = `rgba(16,14,48,${0.4 * night})`;
      ui.fillRect(MINI.x, MINI.y, MINI.w, MINI.h);
    }
    marker(ui, Math.round(MINI.x + px - sx), Math.round(MINI.y + py - sy), here, ahead, pic, time);

    // the C key under the corner, so people know there is more
    font(ui, 5, 600);
    const label = 'Mapa';
    const lw = ui.measureText(label).width;
    const kx = MINI.x + MINI.w - lw - 14;
    const ky = MINI.y + MINI.h + 4;
    keyCap(ui, 'C', kx, ky);
    font(ui, 5, 600);
    ui.fillStyle = 'rgba(20,10,35,0.6)';
    ui.fillText(label, kx + 12.5, ky + 2.3);
    ui.fillStyle = PAPER;
    ui.fillText(label, kx + 12, ky + 1.8);
    ui.restore();
  }

  /** The full map. `here` is where the player is on the plan, or null if this scene is not on it. */
  render(ui: Ctx, here: Spot | null, ahead: Spot | null, time: number): void {
    if (this.fade < 0.01) return;
    const pic = this.picture();
    ui.save();
    ui.globalAlpha = this.fade;
    ui.fillStyle = 'rgba(14,10,24,0.6)';
    ui.fillRect(0, 0, VIEW_W, VIEW_H);
    ui.translate(0, Math.round((1 - this.fade) * 8));

    // a paper board with a pixel border, like a notice on the bulletin board
    ui.fillStyle = 'rgba(0,0,0,0.35)';
    ui.fillRect(PANEL.x + 2, PANEL.y + 3, PANEL.w, PANEL.h);
    pixelFrame(ui, PANEL.x, PANEL.y, PANEL.w, PANEL.h, PAPER);

    font(ui, 11, 400, SERIF, true);
    ui.fillStyle = MAROON;
    ui.fillText('Mapa ng Campus', PANEL.x + 10, PANEL.y + 8);
    font(ui, 5, 500);
    ui.fillStyle = 'rgba(42,32,48,0.7)';
    ui.fillText('Holy Angel University, Angeles City', PANEL.x + 108, PANEL.y + 13);

    // the picture, centred in its box
    const ox = Math.round(MAP.x + (MAP.w - pic.canvas.width) / 2);
    const oy = Math.round(MAP.y + (MAP.h - pic.canvas.height) / 2);
    ui.fillStyle = '#8f8673';
    ui.fillRect(ox - 2, oy - 2, pic.canvas.width + 4, pic.canvas.height + 4);
    ui.imageSmoothingEnabled = false;
    ui.drawImage(pic.canvas, ox, oy);
    northArrow(ui, ox + pic.canvas.width - 12, oy + 14);

    // every place you can jump to, with the picked one blinking
    if (TELEPORT) {
      this.stops.forEach((s, i) => {
        const [x, y] = pic.at(s.at);
        const X = Math.round(ox + x);
        const Y = Math.round(oy + y);
        if (i === this.pick) {
          const r = 5 + Math.round((Math.sin(time * 6) + 1) * 1.5);
          ring(ui, X, Y, r, GOLD);
          ring(ui, X, Y, r + 1, MAROON);
        }
        ui.fillStyle = INK;
        ui.fillRect(X - 2, Y - 2, 4, 4);
        ui.fillStyle = i === this.pick ? GOLD : '#f8eed2';
        ui.fillRect(X - 1, Y - 1, 2, 2);
      });
    }
    if (here) {
      const [x, y] = pic.at(here);
      marker(ui, Math.round(ox + x), Math.round(oy + y), here, ahead, pic, time);
    }

    this.renderList(ui, time);
    ui.restore();
  }

  private renderList(ui: Ctx, time: number): void {
    let y = PANEL.y + 30;
    font(ui, 6.5, 700);
    ui.fillStyle = MAROON;
    ui.fillText(TELEPORT ? 'Puntahan' : 'Mga lugar', LIST_X, y - 12);

    this.stops.forEach((s, i) => {
      const picked = TELEPORT && i === this.pick;
      if (picked) {
        ui.fillStyle = MAROON;
        ui.fillRect(LIST_X - 3, y - 2, VIEW_W - LIST_X - 10, ROW - 1);
        // a little pixel arrow that nudges back and forth
        const nx = LIST_X - 2 + Math.round(Math.sin(time * 6));
        ui.fillStyle = GOLD;
        ui.fillRect(nx, y + 1, 1, 5);
        ui.fillRect(nx + 1, y + 2, 1, 3);
        ui.fillRect(nx + 2, y + 3, 1, 1);
      }
      font(ui, 5.2, picked ? 700 : 500);
      ui.fillStyle = picked ? '#fbefd0' : INK;
      ui.fillText(s.name.length > 30 ? short(s.name) : s.name, LIST_X + 5, y);
      y += ROW;
    });

    // what is near the picked place, by its number on the official map
    const stop = this.stops[this.pick];
    if (TELEPORT && stop) {
      y += 3;
      font(ui, 5, 700);
      ui.fillStyle = MAROON;
      ui.fillText('Malapit dito', LIST_X, y);
      y += 8;
      font(ui, 4.8, 500);
      ui.fillStyle = INK;
      for (const b of nearest(stop.at, 3)) {
        ui.fillText(`${b.no}  ${b.name.length > 28 ? b.short : b.name}`, LIST_X + 2, y);
        y += 7;
      }
    }

    // keys
    const ky = PANEL.y + PANEL.h - 16;
    let kx = LIST_X;
    const keys: [string, string][] = TELEPORT ? [['W S', 'pili'], ['E', 'punta'], ['C', 'isara']] : [['C', 'isara']];
    for (const [key, label] of keys) {
      kx += keyCap(ui, key, kx, ky) + 2;
      font(ui, 5, 500);
      ui.fillStyle = INK;
      ui.fillText(label, kx, ky + 1.8);
      kx += ui.measureText(label).width + 6;
    }
    font(ui, 4.4, 500);
    ui.fillStyle = 'rgba(42,32,48,0.65)';
    if (ALL.some((b) => !b.sure)) ui.fillText('Tuldok-tuldok: hula pa ang pwesto.', LIST_X, ky - 16);
    // the building outlines and streets come from OSM, whose licence asks for this credit
    ui.fillText('Mapa: © OpenStreetMap contributors', LIST_X, ky - 9);
  }
}

/** A long building name cut down to what students call it. */
function short(name: string): string {
  const b = ALL.find((x) => x.name === name);
  return b ? b.short : `${name.slice(0, 28)}...`;
}

/** The `n` numbered buildings closest to a spot. */
function nearest(s: Spot, n: number): Building[] {
  return ALL.filter((b) => b.no !== undefined)
    .map((b) => ({ b, d: Math.min(...b.blocks.map((k) => metres(k.at, s) - Math.min(k.along, k.across) / 2)) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.b);
}

/** A square frame with a dark outline and a gold inner line, every edge on a whole pixel. */
function pixelFrame(ui: Ctx, x: number, y: number, w: number, h: number, fill?: string): void {
  ui.fillStyle = '#1c1426';
  ui.fillRect(x - 2, y - 2, w + 4, h + 4);
  ui.fillStyle = MAROON;
  ui.fillRect(x - 1, y - 1, w + 2, h + 2);
  if (fill) {
    ui.fillStyle = fill;
    ui.fillRect(x, y, w, h);
    ui.fillStyle = GOLD;
    ui.fillRect(x + 2, y + 2, w - 4, 1);
    ui.fillRect(x + 2, y + h - 3, w - 4, 1);
    ui.fillRect(x + 2, y + 2, 1, h - 4);
    ui.fillRect(x + w - 3, y + 2, 1, h - 4);
  }
}

/** A blocky pixel circle outline. */
function ring(ui: Ctx, cx: number, cy: number, r: number, c: string): void {
  ui.fillStyle = c;
  for (let a = 0; a < 32; a++) {
    const t = (a / 32) * Math.PI * 2;
    ui.fillRect(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), 1, 1);
  }
}

/** You are here: a maroon pin with a white rim, and an arrow the way you are facing. */
function marker(ui: Ctx, x: number, y: number, here: Spot, ahead: Spot | null, pic: CampusPicture, time: number): void {
  if (ahead) {
    const [hx, hy] = pic.at(here);
    const [ax, ay] = pic.at(ahead);
    const len = Math.hypot(ax - hx, ay - hy);
    if (len > 0.01) {
      const dx = (ax - hx) / len;
      const dy = (ay - hy) / len;
      ui.fillStyle = '#ffffff';
      for (let i = 3; i <= 6; i++) ui.fillRect(Math.round(x + dx * i), Math.round(y + dy * i), 1, 1);
      ui.fillStyle = MAROON;
      ui.fillRect(Math.round(x + dx * 7) - 1, Math.round(y + dy * 7) - 1, 2, 2);
    }
  }
  if (Math.sin(time * 5) > 0) ring(ui, x, y, 5, 'rgba(124,31,44,0.55)');
  ui.fillStyle = '#ffffff';
  ui.fillRect(x - 2, y - 3, 5, 7);
  ui.fillRect(x - 3, y - 2, 7, 5);
  ui.fillStyle = MAROON;
  ui.fillRect(x - 1, y - 2, 3, 5);
  ui.fillRect(x - 2, y - 1, 5, 3);
  ui.fillStyle = P.maroonHi;
  ui.fillRect(x - 1, y - 1, 1, 1);
}

/** North is not up on this map: the campus grid is turned about 31 degrees. */
function northArrow(ui: Ctx, x: number, y: number): void {
  const tip: [number, number] = [x + Math.cos(NORTH) * 7, y + Math.sin(NORTH) * 7];
  ui.fillStyle = INK;
  for (let i = -7; i <= 7; i++) ui.fillRect(Math.round(x + Math.cos(NORTH) * i), Math.round(y + Math.sin(NORTH) * i), 1, 1);
  for (const side of [-2.6, 2.6]) {
    for (let i = 0; i <= 3; i++) {
      ui.fillRect(
        Math.round(tip[0] + Math.cos(NORTH + side) * i),
        Math.round(tip[1] + Math.sin(NORTH + side) * i),
        1,
        1,
      );
    }
  }
  font(ui, 5, 700);
  ui.fillStyle = INK;
  ui.fillText('N', x + Math.cos(NORTH) * 11 - 1.5, y + Math.sin(NORTH) * 11 - 2.5);
}

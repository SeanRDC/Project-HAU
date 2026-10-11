// The campus map: press C to see the whole plan from above with a dot where
// you are standing. It draws straight from campus/plan.ts, so it is also the
// quickest way to check the plan against the aerial photo.

import { Ctx, VIEW_H, VIEW_W } from '../../engine/display';
import { damp } from '../../engine/math';
import { BUILDINGS, Building, PLACES, Spot, spot } from '../campus/plan';
import { STREETS } from '../campus/streets';
import { GOLD, INK, MAROON, PAPER, SERIF, font, keyCap, roundRect } from './draw';

const PANEL = { x: 10, y: 8, w: VIEW_W - 20, h: VIEW_H - 16 };
const MAP = { x: 20, y: 34, w: 318, h: 206 };
const LEGEND_X = 348;

const ALL: Building[] = Object.values(BUILDINGS);

// fit every building and gate into the map box, the walkway running left to right
const us: number[] = [];
const vs: number[] = [];
for (const b of ALL) {
  for (const k of b.blocks) {
    us.push(k.at.u - k.along / 2, k.at.u + k.along / 2);
    vs.push(k.at.v - k.across / 2, k.at.v + k.across / 2);
  }
}
for (const p of Object.values(PLACES)) {
  us.push(p.u);
  vs.push(p.v);
}
const U0 = Math.min(...us) - 6;
const V0 = Math.min(...vs) - 6;
const SCALE = Math.min(MAP.w / (Math.max(...us) + 6 - U0), MAP.h / (Math.max(...vs) + 6 - V0));
const OX = MAP.x + (MAP.w - (Math.max(...us) + 6 - U0) * SCALE) / 2;
const OY = MAP.y + (MAP.h - (Math.max(...vs) + 6 - V0) * SCALE) / 2;

const sx = (s: Spot) => OX + (s.u - U0) * SCALE;
const sy = (s: Spot) => OY + (s.v - V0) * SCALE;

// which way is north on this map: one aerial pixel straight up, in plan terms
const up = spot([835, 299]);
const NORTH = Math.atan2(up.v, up.u);

export class CampusMap {
  open = false;
  private fade = 0;

  toggle(): void {
    this.open = !this.open;
  }

  update(dt: number): void {
    this.fade = damp(this.fade, this.open ? 1 : 0, 14, dt);
  }

  /** `here` is where the player is on the plan, or null if this scene is not on it. */
  render(ui: Ctx, here: Spot | null, time: number): void {
    if (this.fade < 0.01) return;
    ui.save();
    ui.globalAlpha = this.fade;
    ui.fillStyle = 'rgba(14,10,24,0.55)';
    ui.fillRect(0, 0, VIEW_W, VIEW_H);
    ui.translate(0, (1 - this.fade) * 8);

    roundRect(ui, PANEL.x + 2, PANEL.y + 3, PANEL.w, PANEL.h, 8, 'rgba(0,0,0,0.35)');
    roundRect(ui, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 8, PAPER);
    roundRect(ui, MAP.x - 4, MAP.y - 4, MAP.w + 8, MAP.h + 8, 4, '#dfe6cf');

    font(ui, 11, 400, SERIF, true);
    ui.fillStyle = MAROON;
    ui.fillText('Mapa ng Campus', PANEL.x + 10, PANEL.y + 7);
    font(ui, 5, 500);
    ui.fillStyle = 'rgba(42,32,48,0.7)';
    ui.fillText('Holy Angel University. Sukat mula sa Chapel of the Holy Guardian Angel.', PANEL.x + 108, PANEL.y + 12);

    // the streets you can walk
    ui.strokeStyle = '#f7f3e6';
    ui.lineWidth = 3.2;
    ui.lineCap = 'round';
    ui.lineJoin = 'round';
    const roads: Spot[][] = [
      ...Object.values(STREETS).map((s) => s.path),
      [PLACES.rotunda, PLACES.barachielGate],
      [PLACES.epiphanyEnd, PLACES.fountainPlaza, PLACES.rotunda],
    ];
    for (const path of roads) {
      ui.beginPath();
      path.forEach((p, i) => (i ? ui.lineTo(sx(p), sy(p)) : ui.moveTo(sx(p), sy(p))));
      ui.stroke();
    }

    // buildings: solid when the position is confirmed, pale when it is still a guess
    for (const b of ALL) {
      for (const k of b.blocks) {
        const x = sx(k.at) - (k.along * SCALE) / 2;
        const y = sy(k.at) - (k.across * SCALE) / 2;
        const w = k.along * SCALE;
        const h = k.across * SCALE;
        ui.fillStyle = b.sure ? '#c9b78a' : '#ddd3b8';
        if (b === BUILDINGS.chapel) {
          ui.fillStyle = '#ffffff';
          ui.beginPath();
          ui.ellipse(sx(k.at), sy(k.at), w / 2, h / 2, 0, 0, Math.PI * 2);
          ui.fill();
          ui.strokeStyle = MAROON;
          ui.lineWidth = 0.8;
          ui.stroke();
        } else {
          ui.fillRect(x, y, w, h);
          ui.strokeStyle = b.sure ? '#8f7d55' : '#b3a888';
          ui.lineWidth = 0.5;
          ui.strokeRect(x, y, w, h);
        }
      }
    }
    // the fountain plaza, the rotunda and the seal
    for (const [p, r, col] of [[PLACES.fountainPlaza, 2.6, '#9fb8c9'], [PLACES.rotunda, 2.6, '#9fb8c9'], [PLACES.seal, 1.8, GOLD]] as const) {
      ui.fillStyle = col;
      ui.beginPath();
      ui.arc(sx(p), sy(p), r, 0, Math.PI * 2);
      ui.fill();
    }

    // the number each building has on the official campus map
    font(ui, 4.6, 700);
    ui.textAlign = 'center';
    for (const b of ALL) {
      const at = b.blocks[0].at;
      ui.fillStyle = b === BUILDINGS.chapel ? MAROON : INK;
      ui.fillText(String(b.no), sx(at), sy(at) - 2.6);
    }
    font(ui, 4.2, 600);
    ui.fillStyle = MAROON;
    ui.fillText('Main Gate', sx(PLACES.mainGate) + 4, sy(PLACES.mainGate) + 4);
    ui.textAlign = 'left';

    // north arrow
    const nx = MAP.x + MAP.w - 12;
    const ny = MAP.y + 14;
    ui.strokeStyle = INK;
    ui.lineWidth = 1;
    ui.beginPath();
    ui.moveTo(nx - Math.cos(NORTH) * 7, ny - Math.sin(NORTH) * 7);
    ui.lineTo(nx + Math.cos(NORTH) * 7, ny + Math.sin(NORTH) * 7);
    ui.lineTo(nx + Math.cos(NORTH - 2.6) * 3.5 + Math.cos(NORTH) * 7, ny + Math.sin(NORTH - 2.6) * 3.5 + Math.sin(NORTH) * 7);
    ui.moveTo(nx + Math.cos(NORTH) * 7, ny + Math.sin(NORTH) * 7);
    ui.lineTo(nx + Math.cos(NORTH + 2.6) * 3.5 + Math.cos(NORTH) * 7, ny + Math.sin(NORTH + 2.6) * 3.5 + Math.sin(NORTH) * 7);
    ui.stroke();
    font(ui, 4.6, 700);
    ui.fillStyle = INK;
    ui.fillText('N', nx + Math.cos(NORTH) * 11 - 1.5, ny + Math.sin(NORTH) * 11 - 2.5);

    // you are here
    if (here) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 5);
      ui.fillStyle = `rgba(124,31,44,${0.25 * (1 - pulse)})`;
      ui.beginPath();
      ui.arc(sx(here), sy(here), 3 + pulse * 5, 0, Math.PI * 2);
      ui.fill();
      ui.fillStyle = '#ffffff';
      ui.beginPath();
      ui.arc(sx(here), sy(here), 3.2, 0, Math.PI * 2);
      ui.fill();
      ui.fillStyle = MAROON;
      ui.beginPath();
      ui.arc(sx(here), sy(here), 2.2, 0, Math.PI * 2);
      ui.fill();
    }

    // legend
    let y = PANEL.y + 26;
    for (const b of ALL) {
      font(ui, 4.4, 700);
      ui.fillStyle = MAROON;
      ui.textAlign = 'right';
      ui.fillText(String(b.no), LEGEND_X + 8, y);
      ui.textAlign = 'left';
      font(ui, 4.4, 500);
      ui.fillStyle = INK;
      ui.fillText(b.name.length > 30 ? b.short : b.name, LEGEND_X + 11, y);
      y += 9.6;
    }
    font(ui, 4.2, 500);
    ui.fillStyle = 'rgba(42,32,48,0.7)';
    ui.fillText('Maputla: hula pa lang ang pwesto.', LEGEND_X, y + 2);
    const kw = keyCap(ui, 'C', LEGEND_X, y + 10);
    font(ui, 4.6, 500);
    ui.fillStyle = INK;
    ui.fillText('isara', LEGEND_X + kw + 3, y + 11.4);
    ui.restore();
  }
}

import { Ctx, VIEW_H, VIEW_W } from '../../engine/display';
import { clockLabel } from '../../engine/tod';
import { Target } from '../area';
import { GOLD, INK, PAPER, SERIF, font, keyCap, roundRect } from './draw';

/** "E  Kausapin si ..." floating over whatever is in reach. */
export function drawPrompt(ui: Ctx, t: Target, camX: number, time: number): void {
  font(ui, 6.5, 600);
  const w = ui.measureText(t.label).width + 22;
  const x = Math.max(4, Math.min(VIEW_W - w - 4, t.x - camX - w / 2));
  const y = Math.max(4, t.top - 14 + Math.sin(time * 3) * 1.2);
  roundRect(ui, x, y, w, 13, 6.5, 'rgba(22,16,34,0.78)');
  keyCap(ui, 'E', x + 3, y + 2);
  font(ui, 6.5, 600);
  ui.fillStyle = PAPER;
  ui.fillText(t.label, x + 16, y + 3);
}

/**
 * Top left: the clock, an umbrella while it rains, and the baon left. `change`
 * is the last amount spent or received and how many seconds ago, so it can
 * float up beside the wallet.
 */
export function drawClock(
  ui: Ctx,
  hour: number,
  pesos: number,
  raining: boolean,
  change: { amount: number; age: number } | null,
): void {
  const label = clockLabel(hour);
  font(ui, 6.5, 600);
  const icon = raining ? 10 : 0;
  const w = ui.measureText(label).width + 12 + icon;
  roundRect(ui, 8, 8, w, 12, 6, 'rgba(22,16,34,0.55)');
  if (raining) {
    // a little umbrella
    ui.fillStyle = '#9fc2e8';
    ui.fillRect(14, 11, 7, 1);
    ui.fillRect(13, 12, 9, 2);
    ui.fillStyle = PAPER;
    ui.fillRect(17, 14, 1, 3);
    ui.fillRect(16, 16, 1, 1);
  }
  ui.fillStyle = PAPER;
  ui.fillText(label, 14 + icon, 10.6);

  const money = `₱${pesos}`;
  font(ui, 6.5, 700);
  const mw = ui.measureText(money).width + 12;
  const mx = 8 + w + 3;
  roundRect(ui, mx, 8, mw, 12, 6, 'rgba(22,16,34,0.55)');
  ui.fillStyle = GOLD;
  ui.fillText(money, mx + 6, 10.6);

  if (change && change.age < 2.2) {
    const a = Math.min(1, (2.2 - change.age) * 2);
    ui.globalAlpha = a;
    font(ui, 6, 700);
    ui.fillStyle = change.amount < 0 ? '#ff9a8a' : '#a8e6a0';
    const sign = change.amount < 0 ? '−' : '+';
    ui.fillText(`${sign}₱${Math.abs(change.amount)}`, mx + 4, 22 + change.age * 4);
    ui.globalAlpha = 1;
  }
}

/** Location card shown for a few seconds after walking into an area. `t` is seconds since entering. */
export function drawAreaTitle(ui: Ctx, title: string, subtitle: string, t: number): void {
  const a = Math.min(1, t * 1.5) * Math.min(1, Math.max(0, 4.5 - t));
  if (a <= 0) return;
  ui.globalAlpha = a;
  const slide = (1 - Math.min(1, t * 1.5)) * 6;
  font(ui, 13, 400, SERIF, true);
  ui.fillStyle = 'rgba(20,10,35,0.5)';
  ui.fillText(title, 17 - slide, VIEW_H - 39);
  ui.fillStyle = '#fff6e0';
  ui.fillText(title, 16 - slide, VIEW_H - 40);
  ui.fillStyle = GOLD;
  ui.fillRect(16 - slide, VIEW_H - 24, 26, 1);
  font(ui, 6.5, 500);
  ui.fillStyle = 'rgba(20,10,35,0.5)';
  ui.fillText(subtitle, 16.6 - slide, VIEW_H - 19.4);
  ui.fillStyle = '#fff6e0';
  ui.fillText(subtitle, 16 - slide, VIEW_H - 20);
  ui.globalAlpha = 1;
}

/** Little banner that drops from the top, used when a to-do gets ticked off. */
export function drawToast(ui: Ctx, text: string, t: number): void {
  const a = Math.min(1, t * 4) * Math.min(1, Math.max(0, 3.2 - t) * 2);
  if (a <= 0) return;
  font(ui, 6.5, 600);
  const w = ui.measureText(text).width + 26;
  const x = VIEW_W / 2 - w / 2;
  const y = 10 - (1 - Math.min(1, t * 4)) * 10;
  ui.globalAlpha = a;
  roundRect(ui, x, y, w, 14, 7, PAPER);
  roundRect(ui, x + 3, y + 3, 8, 8, 4, GOLD);
  ui.strokeStyle = INK;
  ui.lineWidth = 1.2;
  ui.beginPath();
  ui.moveTo(x + 5, y + 7.2);
  ui.lineTo(x + 6.6, y + 8.8);
  ui.lineTo(x + 9.2, y + 5.4);
  ui.stroke();
  ui.fillStyle = INK;
  ui.fillText(text, x + 15, y + 3.4);
  ui.globalAlpha = 1;
}

export function drawControlsHint(ui: Ctx, alpha: number): void {
  if (alpha <= 0) return;
  ui.globalAlpha = alpha;
  let x = VIEW_W - 8;
  const items: [string, string][] = [['T', 'Oras'], ['C', 'Mapa'], ['Q', 'Phone'], ['E', 'Kausapin'], ['Shift', 'Takbo'], ['A D', 'Lakad']];
  for (const [key, label] of items) {
    font(ui, 6, 500);
    const lw = ui.measureText(label).width;
    x -= lw;
    ui.fillStyle = 'rgba(20,10,35,0.6)';
    ui.fillText(label, x + 0.5, VIEW_H - 15.5);
    ui.fillStyle = PAPER;
    ui.fillText(label, x, VIEW_H - 16);
    font(ui, 5.5, 700);
    const kw = Math.max(9, ui.measureText(key).width + 5);
    x -= kw + 3;
    keyCap(ui, key, x, VIEW_H - 18);
    x -= 9;
  }
  ui.globalAlpha = 1;
}

/** Black bars top and bottom while a cutscene plays. `t` 0..1 slides them in. */
export function drawLetterbox(ui: Ctx, t: number): void {
  if (t < 0.01) return;
  const h = 16 * t;
  ui.fillStyle = '#0d0b10';
  ui.fillRect(0, 0, VIEW_W, h);
  ui.fillRect(0, VIEW_H - h, VIEW_W, h);
}

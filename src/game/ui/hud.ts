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

export function drawClock(ui: Ctx, hour: number): void {
  const label = clockLabel(hour);
  font(ui, 6.5, 600);
  const w = ui.measureText(label).width + 12;
  roundRect(ui, 8, 8, w, 12, 6, 'rgba(22,16,34,0.55)');
  ui.fillStyle = PAPER;
  ui.fillText(label, 14, 10.6);
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
  const items: [string, string][] = [['T', 'Oras'], ['Q', 'Phone'], ['E', 'Kausapin'], ['Shift', 'Takbo'], ['A D', 'Lakad']];
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

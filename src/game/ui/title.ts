import { Ctx, VIEW_H, VIEW_W } from '../../engine/display';
import { GOLD, SERIF, font, keyCap, roundRect } from './draw';

/** Title card over a slow pan of the driveway. `t` is seconds since load, `out` 0..1 fades it away. */
export function drawTitle(ui: Ctx, t: number, out: number, hasSave: boolean): void {
  const a = Math.min(1, t * 0.8) * (1 - out);
  if (a <= 0) return;
  ui.globalAlpha = a;

  const g = ui.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, 'rgba(20,10,35,0.55)');
  g.addColorStop(0.5, 'rgba(20,10,35,0.1)');
  g.addColorStop(1, 'rgba(20,10,35,0.6)');
  ui.fillStyle = g;
  ui.fillRect(0, 0, VIEW_W, VIEW_H);

  const y = 58 - out * 8;
  ui.textAlign = 'center';
  font(ui, 7, 600);
  ui.fillStyle = GOLD;
  ui.fillText('H O L Y   A N G E L   U N I V E R S I T Y', VIEW_W / 2, y - 14);
  font(ui, 34, 400, SERIF, true);
  ui.fillStyle = 'rgba(20,10,35,0.45)';
  ui.fillText('Project HAU', VIEW_W / 2 + 1, y + 1.5);
  ui.fillStyle = '#fff6e0';
  ui.fillText('Project HAU', VIEW_W / 2, y);
  ui.fillStyle = GOLD;
  ui.fillRect(VIEW_W / 2 - 22, y + 42, 44, 1);
  font(ui, 9, 400, SERIF, true);
  ui.fillStyle = '#fff6e0';
  ui.fillText('Unang Araw', VIEW_W / 2, y + 48);

  if (t > 1.2 && Math.floor(t * 1.6) % 2 === 0) {
    font(ui, 6.5, 600);
    const label = hasSave ? 'para ituloy' : 'para magsimula';
    const w = ui.measureText(label).width;
    ui.textAlign = 'left';
    const kx = VIEW_W / 2 - (w + 30) / 2;
    roundRect(ui, kx - 5, VIEW_H - 43, w + 40, 15, 7.5, 'rgba(22,16,34,0.7)');
    const kw = keyCap(ui, 'Enter', kx, VIEW_H - 40);
    font(ui, 6.5, 600);
    ui.fillStyle = '#fff6e0';
    ui.fillText(label, kx + kw + 4, VIEW_H - 38.5);
  }
  ui.textAlign = 'left';
  if (hasSave && t > 1.2) {
    font(ui, 5.5, 500);
    const label = 'bagong laro';
    const w = ui.measureText(label).width;
    const kx = VIEW_W / 2 - (w + 14) / 2;
    const kw = keyCap(ui, 'N', kx, VIEW_H - 25);
    font(ui, 5.5, 500);
    ui.fillStyle = 'rgba(255,246,224,0.85)';
    ui.fillText(label, kx + kw + 4, VIEW_H - 23.4);
  }
  font(ui, 5, 500);
  ui.fillStyle = 'rgba(255,246,224,0.6)';
  ui.fillText('Isang student project. Hindi opisyal na produkto ng unibersidad.', 8, VIEW_H - 12);
  ui.globalAlpha = 1;
}

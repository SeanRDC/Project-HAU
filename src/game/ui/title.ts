import { Ctx, VIEW_H, VIEW_W } from '../../engine/display';
import { Lang, tr } from '../lang';
import { GOLD, SERIF, font, keyCap, roundRect } from './draw';

/** Title card over a slow pan of the driveway. `t` is seconds since load, `out` 0..1 fades it away; `lang` is lit up bottom right. */
export function drawTitle(ui: Ctx, t: number, out: number, hasSave: boolean, lang: Lang): void {
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
  ui.fillText(tr('Unang Araw', 'First Day'), VIEW_W / 2, y + 48);

  if (t > 1.2 && Math.floor(t * 1.6) % 2 === 0) {
    font(ui, 6.5, 600);
    const label = hasSave ? tr('para ituloy', 'to continue') : tr('para magsimula', 'to start');
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
    const label = tr('bagong laro', 'new game');
    const w = ui.measureText(label).width;
    const kx = VIEW_W / 2 - (w + 14) / 2;
    const kw = keyCap(ui, 'N', kx, VIEW_H - 25);
    font(ui, 5.5, 500);
    ui.fillStyle = 'rgba(255,246,224,0.85)';
    ui.fillText(label, kx + kw + 4, VIEW_H - 23.4);
  }
  if (t > 1.2) {
    // L switches the language: both names showing, the one in use lit
    const names: [Lang, string][] = [['tl', 'Tagalog'], ['en', 'English']];
    font(ui, 5.5, 500);
    let x = VIEW_W - 8 - names.reduce((s, [, n]) => s + ui.measureText(n).width, 0) - ui.measureText(' · ').width;
    const kw = 9;
    keyCap(ui, 'L', x - kw - 4, VIEW_H - 17);
    names.forEach(([id, n], i) => {
      font(ui, 5.5, id === lang ? 700 : 500);
      ui.fillStyle = id === lang ? '#fff6e0' : 'rgba(255,246,224,0.45)';
      ui.fillText(n, x, VIEW_H - 15.4);
      x += ui.measureText(n).width;
      if (i === 0) {
        font(ui, 5.5, 500);
        ui.fillStyle = 'rgba(255,246,224,0.45)';
        ui.fillText(' · ', x, VIEW_H - 15.4);
        x += ui.measureText(' · ').width;
      }
    });
  }
  font(ui, 5, 500);
  ui.fillStyle = 'rgba(255,246,224,0.6)';
  ui.fillText(tr('Isang student project. Hindi opisyal na produkto ng unibersidad.', 'A student project. Not an official product of the university.'), 8, VIEW_H - 12);
  ui.globalAlpha = 1;
}

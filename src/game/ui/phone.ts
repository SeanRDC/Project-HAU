import { Ctx, VIEW_H, VIEW_W } from '../../engine/display';
import { damp } from '../../engine/math';
import { clockLabel } from '../../engine/tod';
import { tr } from '../lang';
import { TASKS } from '../story/tasks';
import { GOLD, INK, MAROON, PAPER, font, roundRect, wrap } from './draw';

const W = 112;
const H = 260;

/** The player's phone: slides in from the right with the day's to-do list. */
export class Phone {
  open = false;
  private slide = 0;

  toggle(): void {
    this.open = !this.open;
  }

  update(dt: number): void {
    this.slide = damp(this.slide, this.open ? 1 : 0, 14, dt);
  }

  /** `baon` is the pesos left and the last thing bought, if anything. */
  render(ui: Ctx, hour: number, has: (flag: string) => boolean, baon: { pesos: number; last: string | null; lastEn: string | null }): void {
    if (this.slide < 0.01) return;
    const x = VIEW_W - (W + 22) * this.slide;
    const y = (VIEW_H - H) / 2 + (1 - this.slide) * 10;

    ui.fillStyle = `rgba(14,10,24,${0.35 * this.slide})`;
    ui.fillRect(0, 0, VIEW_W, VIEW_H);

    ui.save();
    ui.translate(x + W / 2, y + H / 2);
    ui.rotate((1 - this.slide) * 0.12 + 0.02);
    ui.translate(-W / 2, -H / 2);

    roundRect(ui, 2, 4, W, H, 11, 'rgba(0,0,0,0.35)');
    roundRect(ui, 0, 0, W, H, 11, '#1d1a26');
    roundRect(ui, 4, 4, W - 8, H - 8, 8, '#f6efe0');
    roundRect(ui, W / 2 - 12, 6.5, 24, 5, 2.5, '#1d1a26');

    // status bar
    font(ui, 5.5, 700);
    ui.fillStyle = INK;
    ui.fillText(clockLabel(hour), 10, 15);
    ui.textAlign = 'right';
    ui.fillText('HAU-WiFi', W - 10, 15);
    ui.textAlign = 'left';

    // message preview
    roundRect(ui, 9, 26, W - 18, 30, 5, '#ffffff');
    roundRect(ui, 13, 30, 10, 10, 5, GOLD);
    font(ui, 6, 700);
    ui.fillStyle = INK;
    ui.fillText('Bea', 26, 30);
    font(ui, 5.5, 400);
    ui.fillStyle = '#5a5060';
    const done = TASKS.every((t) => has(t.flag));
    const msg = has('met_bea')
      ? done
        ? tr('tara na orientation na!! bilis', 'come on orientation\'s starting!! hurry')
        : tr('ikot ka lang muna, dito lang ako sa courtyard', 'look around for a bit, i\'m just here in the courtyard')
      : tr('san ka na?? nasa courtyard ako ng DJN, pasok ka lang sa main door', 'where are you?? i\'m in the DJN courtyard, just come in the main door');
    wrap(ui, msg, W - 30).slice(0, 3).forEach((s, i) => ui.fillText(s, 13, 41 + i * 6.5 - (i ? 0 : 0)));

    // baon: what is left, and what it last went on
    font(ui, 6, 700);
    ui.fillStyle = INK;
    ui.fillText(`Baon: ₱${baon.pesos}`, 10, 64);
    if (baon.last) {
      font(ui, 5, 500);
      ui.fillStyle = '#7a7080';
      ui.textAlign = 'right';
      ui.fillText(tr(baon.last, baon.lastEn ?? undefined), W - 10, 65);
      ui.textAlign = 'left';
    }

    // checklist
    font(ui, 8, 700);
    ui.fillStyle = MAROON;
    ui.fillText(tr('Unang Araw', 'First Day'), 10, 77);
    font(ui, 5.5, 500);
    ui.fillStyle = '#7a7080';
    const count = TASKS.filter((t) => has(t.flag)).length;
    ui.fillText(tr(`${count} sa ${TASKS.length} tapos na`, `${count} of ${TASKS.length} done`), 10, 88);
    roundRect(ui, 10, 96, W - 20, 3, 1.5, '#e2d8c4');
    if (count > 0) roundRect(ui, 10, 96, ((W - 20) * count) / TASKS.length, 3, 1.5, GOLD);

    let ty = 106;
    for (const t of TASKS) {
      const ok = has(t.flag);
      roundRect(ui, 10, ty, 8, 8, 2, ok ? MAROON : '#e2d8c4');
      if (ok) {
        ui.strokeStyle = PAPER;
        ui.lineWidth = 1.2;
        ui.beginPath();
        ui.moveTo(12, ty + 4.2);
        ui.lineTo(13.6, ty + 5.8);
        ui.lineTo(16.2, ty + 2.4);
        ui.stroke();
      }
      font(ui, 6, ok ? 400 : 600);
      ui.fillStyle = ok ? '#9a90a0' : INK;
      const lines = wrap(ui, tr(t.text, t.en), W - 34);
      lines.forEach((s, i) => ui.fillText(s, 22, ty + 1 + i * 7));
      ty += Math.max(13, lines.length * 7 + 6);
    }

    font(ui, 5, 500);
    ui.fillStyle = '#9a90a0';
    ui.textAlign = 'center';
    ui.fillText(tr('Q para isara', 'Q to close'), W / 2, H - 15);
    ui.textAlign = 'left';
    ui.restore();
  }
}

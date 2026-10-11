import { Ctx, VIEW_H, VIEW_W } from '../../engine/display';
import { drawCharacter, drawShadow } from '../art/character';
import { Character, LOOKS } from '../art/player';
import { GOLD, SERIF, font, keyCap, roundRect } from './draw';

const PANEL_W = 92;
const PANEL_H = 108;
const GAP = 16;
const PANEL_Y = 74;
const SCALE = 2;

const OPTIONS: { id: Character; label: string }[] = [
  { id: 'boy', label: 'BOY' },
  { id: 'girl', label: 'GIRL' },
];

/**
 * Character picker drawn over the title scene. `a` is its overall opacity and
 * `girl` slides the highlight from the boy (0) to the girl (1).
 */
export function drawSelect(ui: Ctx, t: number, a: number, girl: number): void {
  if (a <= 0.01) return;
  ui.globalAlpha = a;

  const g = ui.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, 'rgba(20,10,35,0.7)');
  g.addColorStop(0.5, 'rgba(20,10,35,0.45)');
  g.addColorStop(1, 'rgba(20,10,35,0.75)');
  ui.fillStyle = g;
  ui.fillRect(0, 0, VIEW_W, VIEW_H);

  ui.textAlign = 'center';
  font(ui, 7, 600);
  ui.fillStyle = GOLD;
  ui.fillText('H O L Y   A N G E L   U N I V E R S I T Y', VIEW_W / 2, 24);
  font(ui, 17, 400, SERIF, true);
  ui.fillStyle = '#fff6e0';
  ui.fillText('CHOOSE YOUR CHARACTER', VIEW_W / 2, 38);
  ui.fillStyle = GOLD;
  ui.fillRect(VIEW_W / 2 - 22, 62, 44, 1);

  const left = VIEW_W / 2 - PANEL_W - GAP / 2;
  OPTIONS.forEach((o, i) => {
    const focus = i === 0 ? 1 - girl : girl;
    const x = left + i * (PANEL_W + GAP);
    const cx = x + PANEL_W / 2;
    const feet = PANEL_Y + 82;

    roundRect(ui, x, PANEL_Y, PANEL_W, PANEL_H, 6, `rgba(251,245,230,${0.06 + focus * 0.12})`);
    if (focus > 0.02) {
      ui.strokeStyle = GOLD;
      ui.globalAlpha = a * focus;
      ui.lineWidth = 1.5;
      ui.beginPath();
      ui.roundRect(x, PANEL_Y, PANEL_W, PANEL_H, 6);
      ui.stroke();
      ui.globalAlpha = a;
    }

    // the preview: facing inward, breathing and blinking, a touch brighter when chosen
    ui.globalAlpha = a * (0.5 + focus * 0.5);
    ui.save();
    ui.translate(cx, feet);
    ui.scale(SCALE, SCALE);
    drawShadow(ui, 0, 0, 7);
    drawCharacter(ui, 0, 0, LOOKS[o.id], { facing: i === 0 ? 1 : -1, phase: 0, stride: 0, time: t + i * 1.7 });
    ui.restore();
    ui.globalAlpha = a;

    font(ui, 10, 400, SERIF, true);
    ui.fillStyle = focus > 0.5 ? '#fff6e0' : 'rgba(255,246,224,0.55)';
    ui.fillText(o.label, cx, PANEL_Y + PANEL_H - 20);
  });

  // key hints
  ui.textAlign = 'left';
  const hints: [string[], string][] = [
    [['A', 'D'], 'lumipat'],
    [['Enter'], 'piliin'],
    [['Esc'], 'bumalik'],
  ];
  font(ui, 5.5, 500);
  const widths = hints.map(([keys, label]) => {
    font(ui, 5.5, 500);
    return keys.reduce((s) => s + 13, 0) + ui.measureText(label).width + 6 + (keys[0] === 'Enter' || keys[0] === 'Esc' ? 12 : 0);
  });
  const total = widths.reduce((s, w) => s + w, 0) + (hints.length - 1) * 14;
  let hx = VIEW_W / 2 - total / 2;
  const hy = VIEW_H - 30;
  hints.forEach(([keys, label], i) => {
    let kx = hx;
    for (const k of keys) kx += keyCap(ui, k, kx, hy) + 2;
    font(ui, 5.5, 500);
    ui.fillStyle = 'rgba(255,246,224,0.85)';
    ui.fillText(label, kx + 2, hy + 1.6);
    hx += widths[i] + 14;
  });

  ui.globalAlpha = 1;
}

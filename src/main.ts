import { Display, VIEW_H, VIEW_W } from './engine/display';
import { Input } from './engine/input';
import { startLoop } from './engine/loop';

const display = new Display(document.getElementById('game') as HTMLCanvasElement);
const input = new Input();

let x = VIEW_W / 2;

startLoop(
  (dt) => {
    x += input.axis() * 60 * dt;
    input.endFrame();
  },
  () => {
    const ctx = display.ctx;
    ctx.fillStyle = '#1b1a26';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#e8d08a';
    ctx.fillRect(Math.round(x) - 4, VIEW_H - 60, 8, 20);
    display.present();
  },
);

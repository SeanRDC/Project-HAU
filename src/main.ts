import { Display } from './engine/display';
import { Input } from './engine/input';
import { startLoop } from './engine/loop';
import { Game } from './game/game';

const display = new Display(document.getElementById('game') as HTMLCanvasElement);
const input = new Input();
const game = new Game(display, input);

startLoop(
  (dt) => game.update(dt),
  () => game.render(),
);

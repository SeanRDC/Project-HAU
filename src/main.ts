/// <reference types="vite/client" />
import { Display } from './engine/display';
import { Input } from './engine/input';
import { startLoop } from './engine/loop';
import { Game } from './game/game';

const display = new Display(document.getElementById('game') as HTMLCanvasElement);
const input = new Input();
const game = new Game(display, input);

// In the dev server only: lets tools/check-links.mjs, and you in the browser
// console, look at the running game as `hau`. Not in the built game.
if (import.meta.env.DEV) (window as unknown as { hau: Game }).hau = game;

startLoop(
  (dt) => game.update(dt),
  () => game.render(),
);

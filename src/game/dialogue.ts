// Conversations play as speech bubbles over whoever is talking, with a
// close-up of their face in the corner. Narration (looking at things) goes in
// a strip along the bottom instead.

import { Ctx, VIEW_H, VIEW_W } from '../engine/display';
import { Input } from '../engine/input';
import { clamp } from '../engine/math';
import { Area } from './area';
import { character, playerName } from './art/player';
import { PORTRAIT_SIZE, portrait } from './art/portrait';
import { drawPortrait, portraitReady, portraitSize } from './art/sprites';
import { tr } from './lang';
import { Choice, Line } from './types';
import { GOLD, INK, MAROON, PAPER, SERIF, font, keyCap, roundRect, wrap } from './ui/draw';

const CHARS_PER_SECOND = 42;
const BUBBLE_WIDTH = 150;

/** What a line says in the language picked (lang.ts). */
function says(l: Line | Choice): string {
  return tr(l.text, l.en);
}

export class Dialogue {
  private queue: Line[] = [];
  private line: Line | null = null;
  private shown = 0;
  private choice = 0;
  private age = 0;
  onBlip: ((who: string) => void) | null = null;
  onFlag: ((flag: string) => void) | null = null;
  onPesos: ((amount: number, item: string, itemEn?: string) => void) | null = null;
  onSpeaker: ((who: string) => void) | null = null;
  /** every line as it comes up, for the speaker's face and emote */
  onLine: ((line: Line) => void) | null = null;

  get active(): boolean {
    return this.line !== null;
  }

  start(lines: Line[]): void {
    if (lines.length === 0) return;
    this.queue = [...lines];
    this.next();
  }

  private next(): void {
    if (this.line?.set) this.onFlag?.(this.line.set);
    if (this.line?.pesos) this.onPesos?.(this.line.pesos, this.line.item ?? '', this.line.itemEn);
    this.line = this.queue.shift() ?? null;
    this.shown = 0;
    this.choice = 0;
    this.age = 0;
    if (this.line) {
      this.onSpeaker?.(this.line.who);
      this.onLine?.(this.line);
    }
  }

  /** Whoever's words are still coming out, or null. */
  speaking(): string | null {
    const l = this.line;
    return l && l.who && this.shown < says(l).length ? l.who : null;
  }

  /**
   * The language just changed (lang.ts): keep the typing where it was, as a
   * share of the line. A line that was all out stays all out.
   */
  relang(before: string): void {
    const l = this.line;
    if (!l || !before.length) return;
    const now = says(l).length;
    this.shown = this.shown >= before.length ? now : Math.min(now, (this.shown / before.length) * now);
  }

  /** The current line's text, for relang(); empty when nothing is up. */
  get text(): string {
    return this.line ? says(this.line) : '';
  }

  update(dt: number, input: Input): void {
    const l = this.line;
    if (!l) return;
    const said = says(l);
    this.age += dt;
    const before = Math.floor(this.shown);
    this.shown = Math.min(said.length, this.shown + dt * CHARS_PER_SECOND);
    if (Math.floor(this.shown) !== before && before % 3 === 0 && said[before] !== ' ') this.onBlip?.(l.who);

    const done = this.shown >= said.length;
    if (done && l.choices) {
      if (input.pressed('up') || input.pressed('left')) this.choice = (this.choice + l.choices.length - 1) % l.choices.length;
      if (input.pressed('down') || input.pressed('right')) this.choice = (this.choice + 1) % l.choices.length;
    }
    if (input.pressed('interact')) {
      if (!done) {
        this.shown = said.length;
      } else {
        if (l.choices) this.queue = [...l.choices[this.choice].then, ...this.queue];
        this.next();
      }
    }
  }

  render(ui: Ctx, area: Area): void {
    const l = this.line;
    if (!l) return;
    const said = says(l);
    const text = said.slice(0, Math.floor(this.shown));
    const done = this.shown >= said.length;
    const anchor = l.who ? area.anchor(l.who) : null;

    if (!anchor) {
      this.renderNarration(ui, said, text, done);
      return;
    }

    const mine = l.who === 'you';
    const bg = mine ? '#2d2a44' : PAPER;
    const fg = mine ? '#f6f1e6' : INK;
    font(ui, 7, 500);
    // measure against the full line so the bubble doesn't resize while typing
    const lines = wrap(ui, said, BUBBLE_WIDTH);
    const textW = Math.max(...lines.map((s) => ui.measureText(s).width));
    // the widest choice, so a long one (English ones run longer) stays inside the bubble
    font(ui, 6.2, 700);
    const choiceW = l.choices ? Math.max(...l.choices.map((c) => ui.measureText(says(c)).width + 10)) : 0;
    font(ui, 7, 500);
    const name = mine ? playerName() : area.nameOf(l.who);
    const choiceH = done && l.choices ? l.choices.length * 11 + 3 : 0;
    const face = area.portraitOf(l.who);
    // the students' portraits are cut from their sprites and need a bigger card to show at full size
    const painted = mine && area.playerSprite() && portraitReady(character());
    const size = painted ? portraitSize(character()) : PORTRAIT_SIZE;
    // room on the left for the portrait
    const pad = face ? size + 5 : 0;
    const w = Math.max(textW, l.choices ? Math.max(110, choiceW) : 0) + 14 + pad;
    const h = Math.max(lines.length * 9.5 + 9 + choiceH, face ? size + 6 : 0);
    const pop = Math.min(1, this.age * 9);
    const x = clamp(anchor.x - w / 2, 6, VIEW_W - w - 6);
    const y = Math.max(name ? 14 : 6, anchor.y - h - 7) + (1 - pop) * 4;

    ui.globalAlpha = pop;
    roundRect(ui, x + 1, y + 2, w, h, 5, 'rgba(20,10,35,0.28)');
    roundRect(ui, x, y, w, h, 5, bg);
    // tail pointing at the speaker
    const tx = clamp(anchor.x, x + 8, x + w - 8);
    ui.fillStyle = bg;
    ui.beginPath();
    ui.moveTo(tx - 4, y + h - 0.5);
    ui.lineTo(tx + 4, y + h - 0.5);
    ui.lineTo(tx, y + h + 5);
    ui.fill();

    if (face) {
      // the close-up, on a card of the speaker's shirt colour, with a little hop when their face changes
      const hop = face.since < 0.25 ? Math.round(Math.sin((face.since / 0.25) * Math.PI) * 2) : 0;
      const open = this.shown < said.length && this.age % 0.22 < 0.12;
      const blink = (this.age * 0.37 + 0.3) % 1 > 0.96;
      roundRect(ui, x + 3, y + 3, size, size, 3, mine ? 'rgba(255,255,255,0.1)' : 'rgba(124,31,44,0.1)');
      ui.save();
      ui.imageSmoothingEnabled = false;
      ui.beginPath();
      ui.rect(x + 3, y + 3, size, size);
      ui.clip();
      if (painted) drawPortrait(ui, character(), x + 3, y + 3 - hop, size, face.face, this.shown < l.text.length, this.age);
      else ui.drawImage(portrait(face.look, face.face, open, blink), x + 3, y + 3 - hop + 1);
      ui.restore();
    }

    if (name) {
      font(ui, 5.5, 700);
      const nw = ui.measureText(name).width + 8;
      roundRect(ui, x + 5 + pad, y - 6, nw, 9, 3, MAROON);
      ui.fillStyle = '#fbeed0';
      ui.fillText(name, x + 9 + pad, y - 4.4);
    }

    font(ui, 7, 500);
    ui.fillStyle = fg;
    let left = text.length;
    lines.forEach((s, i) => {
      const part = s.slice(0, Math.max(0, left));
      left -= s.length + 1;
      ui.fillText(part, x + 7 + pad, y + 5 + i * 9.5);
    });

    if (done && l.choices) {
      const cy = y + 6 + lines.length * 9.5 + 1;
      l.choices.forEach((c, i) => {
        const sel = i === this.choice;
        roundRect(ui, x + 5 + pad, cy + i * 11, w - 10 - pad, 9.5, 3, sel ? GOLD : mine ? 'rgba(255,255,255,0.1)' : 'rgba(42,32,48,0.08)');
        font(ui, 6.2, sel ? 700 : 500);
        ui.fillStyle = sel ? INK : fg;
        ui.fillText(says(c), x + 10 + pad, cy + i * 11 + 1.8);
      });
    } else if (done && Math.floor(this.age * 2.5) % 2 === 0) {
      ui.fillStyle = mine ? GOLD : MAROON;
      ui.beginPath();
      ui.moveTo(x + w - 10, y + h - 7);
      ui.lineTo(x + w - 5, y + h - 7);
      ui.lineTo(x + w - 7.5, y + h - 3.5);
      ui.fill();
    }
    ui.globalAlpha = 1;
  }

  private renderNarration(ui: Ctx, said: string, text: string, done: boolean): void {
    font(ui, 7.5, 400, SERIF, true);
    const lines = wrap(ui, said, 300);
    const h = lines.length * 11 + 14;
    const y = VIEW_H - h - 12;
    const fade = Math.min(1, this.age * 6);
    ui.globalAlpha = fade;
    roundRect(ui, 80, y, VIEW_W - 160, h, 4, 'rgba(22,16,34,0.82)');
    ui.fillStyle = GOLD;
    ui.fillRect(80, y + 4, 1.5, h - 8);
    ui.fillStyle = '#f6efe0';
    let left = text.length;
    lines.forEach((s, i) => {
      ui.fillText(s.slice(0, Math.max(0, left)), 92, y + 7 + i * 11);
      left -= s.length + 1;
    });
    if (done && Math.floor(this.age * 2.5) % 2 === 0) keyCap(ui, 'E', VIEW_W - 96, y + h - 13);
    ui.globalAlpha = 1;
  }
}

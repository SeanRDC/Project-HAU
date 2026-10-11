import { Audio } from '../engine/audio';
import { Display, VIEW_H, VIEW_W } from '../engine/display';
import { Input } from '../engine/input';
import { clamp } from '../engine/math';
import { moodAt } from '../engine/tod';
import { Area, Target } from './area';
import { Sky } from './art/sky';
import { Dialogue } from './dialogue';
import { buildCourtyard } from './scenes/courtyard';
import { buildLobby } from './scenes/lobby';
import { buildPark } from './scenes/park';
import { buildPlaza } from './scenes/plaza';
import { TASKS } from './story/tasks';
import { AreaDef, GameApi, Line } from './types';
import { drawAreaTitle, drawClock, drawControlsHint, drawPrompt, drawToast } from './ui/hud';
import { Phone } from './ui/phone';
import { drawTitle } from './ui/title';

/** in-game hours per real second: a full day takes about 12 minutes */
const TIME_RATE = 24 / (12 * 60);
const FADE_TIME = 0.35;
const START_HOUR = 16.4;
const SAVE_KEY = 'project-hau-save-v1';
const SAVE_EVERY = 10;

/** blip pitch per speaker so voices are told apart by ear */
const VOICES: Record<string, number> = {
  you: 440, guard: 220, driver: 196, trisha: 587, jopet: 330, liza: 494, bea: 659, migs: 370, cat: 990, kath: 622, bong: 185, enzo: 392,
};

export class Game implements GameApi {
  private sky = new Sky();
  private audio = new Audio();
  private dialogue = new Dialogue();
  private phone = new Phone();
  private areas = new Map<string, Area>();
  private area: Area;
  private clock = START_HOUR;
  private flags = new Set<string>();
  private time = 0;

  private mode: 'title' | 'play' = 'title';
  private titleOut = 0;
  /** 0 clear, 1 black */
  private fade = 0;
  private pending: { area: string; spawn: string } | null = null;
  private areaAge = 99;
  private playAge = 0;
  private toast: { text: string; age: number } | null = null;
  private target: Target | null = null;
  /** where to put the player when continuing a saved game */
  private resume: { area: string; x: number } | null = null;
  private hasSave = false;
  private persist = true;
  private sinceSave = 0;

  constructor(private display: Display, private input: Input) {
    const defs: AreaDef[] = [buildPlaza(), buildLobby(), buildCourtyard(), buildPark()];
    for (const d of defs) {
      const area = new Area(d, this.sky);
      area.onStep = () => this.audio.footstep(!d.outdoor);
      this.areas.set(d.id, area);
    }
    this.area = this.areas.get('plaza')!;
    this.area.enter('start');

    input.onFirstGesture = () => this.audio.start();
    this.dialogue.onBlip = (who) => this.audio.blip(VOICES[who] ?? 300);
    this.dialogue.onFlag = (flag) => this.set(flag);
    this.dialogue.onSpeaker = (who) => {
      if (who && who !== 'you') this.area.face(who);
    };

    this.load();
    this.applyDebugParams();
  }

  /**
   * Dev shortcuts, e.g. ?area=lobby&x=300&hour=18.5&talk=liza
   * Skips the title screen and drops you where you asked (?title keeps it).
   */
  private applyDebugParams(): void {
    const q = new URLSearchParams(location.search);
    if (location.search.length < 2) return;
    // dev runs start clean and never touch the real save
    this.persist = false;
    this.flags.clear();
    this.clock = START_HOUR;
    this.resume = null;
    this.hasSave = false;
    if (!q.has('title')) {
      this.mode = 'play';
      this.titleOut = 1;
    }
    const area = this.areas.get(q.get('area') ?? '');
    if (area) {
      this.area = area;
      area.enter(q.get('spawn') ?? '');
    }
    if (q.has('hour')) this.clock = Number(q.get('hour'));
    if (q.has('x')) {
      this.area.player.x = Number(q.get('x'));
      this.area.camera.snap(this.area.player.x);
    }
    for (const f of (q.get('flags') ?? '').split(',')) if (f) this.flags.add(f);
    if (q.has('phone')) this.phone.open = true;
    const npc = this.area.npcs.find((n) => n.def.id === q.get('talk'));
    if (npc) {
      this.area.face(npc.def.id);
      this.say(npc.def.talk(this));
    }
    // ?warm=3 runs a few seconds up front so particles are already going
    for (let i = 0; i < Number(q.get('warm') ?? 0) * 60; i++) this.update(1 / 60);
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as { flags: string[]; clock: number; area: string; x: number };
      if (!this.areas.has(data.area)) return;
      this.flags = new Set(data.flags);
      this.clock = data.clock;
      this.resume = { area: data.area, x: data.x };
      this.hasSave = true;
    } catch {
      // a broken or blocked save just means starting over
    }
  }

  private save(): void {
    if (!this.persist || this.mode !== 'play') return;
    this.sinceSave = 0;
    try {
      const data = { flags: [...this.flags], clock: this.clock, area: this.area.def.id, x: Math.round(this.area.player.x) };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // private browsing can refuse storage; the game still plays
    }
  }

  has(flag: string): boolean {
    return this.flags.has(flag);
  }

  set(flag: string): void {
    if (this.flags.has(flag)) return;
    this.flags.add(flag);
    const task = TASKS.find((t) => t.flag === flag);
    if (task) {
      this.toast = { text: task.text, age: 0 };
      this.audio.chime();
    }
    this.save();
  }

  say(lines: Line[]): void {
    this.dialogue.start(lines);
  }

  travel(area: string, spawn: string): void {
    if (this.areas.has(area)) this.pending = { area, spawn };
  }

  hour(): number {
    return this.clock;
  }

  update(dt: number): void {
    const input = this.input;
    this.time += dt;
    this.clock = (this.clock + dt * TIME_RATE) % 24;
    if (input.pressed('mute')) this.audio.toggleMute();
    const mood = moodAt(this.clock);
    this.sky.update(dt);

    if (this.mode === 'title') {
      this.updateTitle(dt, mood);
      input.endFrame();
      return;
    }

    this.playAge += dt;
    if ((this.sinceSave += dt) > SAVE_EVERY && !this.dialogue.active) this.save();
    this.areaAge += dt;
    if (this.toast && (this.toast.age += dt) > 3.4) this.toast = null;
    this.titleOut = Math.min(1, this.titleOut + dt * 2);

    // scene change: fade out, swap, fade back in
    if (this.pending) {
      this.fade = Math.min(1, this.fade + dt / FADE_TIME);
      if (this.fade >= 1) {
        this.area = this.areas.get(this.pending.area)!;
        this.area.enter(this.pending.spawn);
        this.pending = null;
        this.areaAge = 0;
        if (this.area.def.visitFlag) this.set(this.area.def.visitFlag);
        this.save();
      }
    } else {
      this.fade = Math.max(0, this.fade - dt / FADE_TIME);
    }

    const wasTalking = this.dialogue.active;
    if (wasTalking) this.dialogue.update(dt, input);

    if (!wasTalking && !this.pending) {
      if (input.pressed('phone') || (this.phone.open && input.pressed('back'))) {
        this.phone.toggle();
        this.audio.select();
      }
      if (input.pressed('time') && !this.phone.open) this.clock = (this.clock + 1.5) % 24;
    }
    this.phone.update(dt);

    const locked = this.dialogue.active || wasTalking || this.phone.open || this.pending !== null;
    this.area.update(dt, input, mood, locked);
    this.target = locked ? null : this.area.target();
    if (this.target && input.pressed('interact')) {
      this.audio.select();
      this.target.use(this);
      this.target = null;
    }

    this.updateAudio(mood.night);
    input.endFrame();
  }

  private updateTitle(dt: number, mood: ReturnType<typeof moodAt>): void {
    this.area.update(dt, this.input, mood, true);
    // slow drift across the front of the building
    const span = this.area.def.width - VIEW_W;
    this.area.camera.x = span * (0.5 + 0.2 * Math.sin(this.time * 0.07));
    if (this.pending) {
      this.fade = Math.min(1, this.fade + dt / 0.6);
      if (this.fade >= 1) {
        this.mode = 'play';
        this.pending = null;
        if (this.resume) {
          this.area = this.areas.get(this.resume.area)!;
          this.area.enter('');
          this.area.player.x = this.resume.x;
          this.area.camera.snap(this.resume.x);
        } else {
          this.area.enter('start');
        }
        this.areaAge = 0;
      }
    } else if (this.time > 0.6 && this.input.pressed('interact')) {
      this.pending = { area: 'plaza', spawn: 'start' };
      this.audio.chime();
    } else if (this.time > 0.6 && this.hasSave && this.input.pressed('fresh')) {
      // new game: forget the save and start the day again
      this.flags.clear();
      this.clock = START_HOUR;
      this.resume = null;
      this.hasSave = false;
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        // nothing to clear
      }
      this.pending = { area: 'plaza', spawn: 'start' };
      this.audio.chime();
    }
    this.updateAudio(mood.night);
  }

  private updateAudio(night: number): void {
    const def = this.area.def;
    const camMid = this.area.camera.x + VIEW_W / 2;
    const water = def.fountainX === undefined ? 0 : clamp(1 - Math.abs(camMid - def.fountainX) / 320, 0, 1);
    this.audio.update(water, night, !def.outdoor);
  }

  render(): void {
    const area = this.area;
    area.render(this.display.ctx, moodAt(this.clock));
    this.display.present();

    const ui = this.display.ui();
    if (this.mode === 'play') {
      if (this.target) drawPrompt(ui, this.target, area.camera.x, this.time);
      this.dialogue.render(ui, area);
      if (!this.dialogue.active) {
        drawClock(ui, this.clock);
        drawAreaTitle(ui, area.def.title, area.def.subtitle, this.areaAge);
        drawControlsHint(ui, clamp(14 - this.playAge, 0, 1));
      }
      if (this.toast) drawToast(ui, this.toast.text, this.toast.age);
      this.phone.render(ui, this.clock, (f) => this.has(f));
    }
    drawTitle(ui, this.time, this.titleOut, this.hasSave);
    if (this.fade > 0) {
      ui.fillStyle = `rgba(13,11,16,${this.fade})`;
      ui.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }
}

import { Audio } from '../engine/audio';
import { Display, VIEW_H, VIEW_W } from '../engine/display';
import { Input } from '../engine/input';
import { clamp, damp } from '../engine/math';
import { Mood, moodAt } from '../engine/tod';
import { Area, Target } from './area';
import { Character, NAME_MAX, baseLook, character, isCharacter, playerName, setCharacter, setPlayerName } from './art/player';
import { Sky } from './art/sky';
import { whereAmI } from './campus/streets';
import { Cutscene, CutsceneHost } from './cutscene';
import { Dialogue } from './dialogue';
import { buildAps } from './scenes/aps';
import { buildCourtyard } from './scenes/courtyard';
import { buildGate } from './scenes/gate';
import { buildGym } from './scenes/gym';
import { buildHalls } from './scenes/halls';
import { buildLane } from './scenes/lane';
import { buildLawn } from './scenes/lawn';
import { buildLobby } from './scenes/lobby';
import { buildPark } from './scenes/park';
import { buildPlaza } from './scenes/plaza';
import { buildSjh } from './scenes/sjh';
import { buildWalkway } from './scenes/walkway';
import { TASKS } from './story/tasks';
import { AreaDef, GameApi, Line, Sound, Step } from './types';
import { drawAreaTitle, drawClock, drawControlsHint, drawLetterbox, drawPrompt, drawToast } from './ui/hud';
import { RAINING, Weather, WeatherSave } from './weather';
import { CampusMap, STOPS } from './ui/map';
import { Phone } from './ui/phone';
import { drawMenuBackdrop, drawName, drawSelect } from './ui/select';
import { drawTitle } from './ui/title';

/** in-game hours per real second: a full day takes about 12 minutes */
const TIME_RATE = 24 / (12 * 60);
const FADE_TIME = 0.35;
/** how fast an opening screen fades out or in, per second: about a sixth of a second each way */
const SCREEN_FADE = 6;
const START_HOUR = 16.4;
/** a day's allowance, in pesos. Refilled each morning once the game has more than one day. */
const BAON = 150;
const SAVE_KEY = 'project-hau-save-v1';
const SAVE_EVERY = 10;
/** a new day starts out on the street, outside the side gate by the Main Building */
const NEW_GAME = { area: 'gate', spawn: 'street' };

/** blip pitch per speaker so voices are told apart by ear */
const VOICES: Record<string, number> = {
  you: 440, guard: 220, driver: 196, trisha: 587, jopet: 330, liza: 494, bea: 659, migs: 370, cat: 990, kath: 622, bong: 185, enzo: 392,
  nonoy: 233, joy: 523, ella: 698, taho: 165, actdo: 208, mikko: 277,
};

export class Game implements GameApi {
  private sky = new Sky();
  private audio = new Audio();
  private dialogue = new Dialogue();
  private phone = new Phone();
  private map = new CampusMap();
  private areas = new Map<string, Area>();
  private area: Area;
  private clock = START_HOUR;
  private flags = new Set<string>();
  private time = 0;
  private weather = new Weather();
  /** baon left, in pesos */
  private wallet = BAON;
  /** the last thing bought, for the phone, e.g. "Taho −₱20" */
  private lastBuy: string | null = null;
  /** the last money change and how long ago, for the HUD */
  private change: { amount: number; age: number } | null = null;

  private mode: 'title' | 'play' = 'title';
  private titleOut = 0;
  /** the character picker is showing over the title; `selectFade` (the dark wash behind it) and `choiceAnim` are 0..1 */
  private selecting = false;
  private selectFade = 0;
  /**
   * Which of the three opening screens is on show, and how far it has faded
   * in. Only one is ever drawn: the old one fades right out before the next
   * fades in, so their lettering never sits on top of each other.
   */
  private screen: 'title' | 'select' | 'name' = 'title';
  private screenFade = 1;
  private choice: Character = 'boy';
  private choiceAnim = 0;
  /** the picker was opened with N, so confirming wipes the old save (Esc leaves it alone) */
  private startFresh = false;
  /** the name box has taken over from the picker */
  private naming = false;
  private nameDraft = '';
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
  private cutscene: Cutscene | null = null;
  /** 0..1, the black bars that slide in during a cutscene */
  private bars = 0;
  private host: CutsceneHost = {
    area: () => this.area,
    talking: () => this.dialogue.active,
    game: this,
    sound: (s) => this.sound(s),
  };

  constructor(private display: Display, private input: Input) {
    const defs: AreaDef[] = [
      buildGate(), buildPark(), buildPlaza(), buildLobby(), buildCourtyard(),
      // the rest of the campus, outsides only for now
      buildWalkway(), buildLane(), buildHalls(), buildAps(), buildLawn(), buildSjh(), buildGym(),
    ];
    for (const d of defs) {
      const area = new Area(d, this.sky);
      area.onStep = () => this.audio.footstep(!d.outdoor);
      this.areas.set(d.id, area);
    }
    // the places the campus map can send you
    this.map.stops = STOPS.map(([id, spawn]) => {
      const def = this.areas.get(id)!.def;
      return { area: id, spawn, name: def.title, at: whereAmI(id, def.spawns[spawn].x)! };
    });
    this.area = this.areas.get('plaza')!;
    this.area.enter('start');

    input.onFirstGesture = () => this.audio.start();
    this.dialogue.onBlip = (who) => this.audio.blip(VOICES[who] ?? 300);
    this.dialogue.onFlag = (flag) => this.set(flag);
    this.dialogue.onPesos = (amount, item) => this.pay(amount, item);
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
    this.wallet = BAON;
    this.lastBuy = null;
    // ?pesos=20 starts with that much baon; ?rain=1 starts a downpour (0.5 for steady rain)
    if (q.has('pesos')) this.wallet = Number(q.get('pesos'));
    this.weather.force(Number(q.get('rain') ?? 0));
    // ?char=girl plays as the girl
    this.applyCharacter(q.get('char') === 'girl' ? 'girl' : 'boy');
    setPlayerName(q.get('name') ?? '');
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
    if (this.mode === 'play') this.startIntro();
    if (q.has('phone')) this.phone.open = true;
    if (q.has('map')) this.map.open = true;
    const npc = this.area.npcs.find((n) => n.def.id === q.get('talk'));
    if (npc) {
      this.area.face(npc.def.id);
      this.say(npc.def.talk(this));
    }
    // ?warm=3 runs a few seconds up front so particles are already going
    for (let i = 0; i < Number(q.get('warm') ?? 0) * 60; i++) this.update(1 / 60);
  }

  /** Make `c` the player's base look everywhere. Only call between scenes, never mid-cutscene. */
  private applyCharacter(c: Character): void {
    this.choice = c;
    this.choiceAnim = c === 'girl' ? 1 : 0;
    setCharacter(c);
    for (const a of this.areas.values()) a.playerLook = baseLook();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        flags: string[];
        clock: number;
        area: string;
        x: number;
        character?: unknown;
        name?: unknown;
        pesos?: number;
        last?: string | null;
        weather?: WeatherSave;
      };
      if (!this.areas.has(data.area)) return;
      this.flags = new Set(data.flags);
      this.clock = data.clock;
      // saves from before baon existed start with a full day's worth
      this.wallet = typeof data.pesos === 'number' ? data.pesos : BAON;
      this.lastBuy = data.last ?? null;
      this.weather.load(data.weather);
      this.resume = { area: data.area, x: data.x };
      this.hasSave = true;
      // saves from before character selection have no field: they were the boy
      this.applyCharacter(isCharacter(data.character) ? data.character : 'boy');
      // and had no name, so the speech bubbles show none
      setPlayerName(typeof data.name === 'string' ? data.name : '');
    } catch {
      // a broken or blocked save just means starting over
    }
  }

  private save(): void {
    // mid-cutscene positions make bad save points; the next save catches up
    if (!this.persist || this.mode !== 'play' || this.cutscene) return;
    this.sinceSave = 0;
    try {
      const data = {
        flags: [...this.flags],
        clock: this.clock,
        area: this.area.def.id,
        x: Math.round(this.area.player.x),
        character: character(),
        name: playerName(),
        pesos: this.wallet,
        last: this.lastBuy,
        weather: this.weather.save(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // private browsing can refuse storage; the game still plays
    }
  }

  has(flag: string): boolean {
    return this.flags.has(flag);
  }

  pesos(): number {
    return this.wallet;
  }

  raining(): boolean {
    return this.weather.rain > RAINING;
  }

  /** Money in (positive) or out (negative), from a dialogue line. Never goes below zero. */
  private pay(amount: number, item: string): void {
    this.wallet = Math.max(0, this.wallet + amount);
    if (amount < 0) this.lastBuy = `${item} −₱${-amount}`;
    this.change = { amount, age: 0 };
    this.audio.coin();
    this.save();
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

  play(steps: Step[]): void {
    this.cutscene = new Cutscene(steps);
    this.target = null;
    this.phone.open = false;
    this.map.open = false;
  }

  private sound(s: Sound): void {
    if (s === 'beep') this.audio.beep();
    else if (s === 'buzz') this.audio.buzz();
    else if (s === 'turnstile') this.audio.clack();
    else if (s === 'zip') this.audio.zip();
  }

  /** Plays the area's walk-in cutscene, if it has one for right now. */
  private startIntro(): void {
    const steps = this.area.def.intro?.(this, this.area.player.x);
    if (steps) this.play(steps);
  }

  update(dt: number): void {
    const input = this.input;
    this.time += dt;
    this.clock = (this.clock + dt * TIME_RATE) % 24;
    this.weather.update(dt, dt * TIME_RATE);
    for (const a of this.areas.values()) a.rain = this.weather.rain;
    if (this.change) this.change.age += dt;
    if (input.pressed('mute')) this.audio.toggleMute();
    const mood = this.weather.mood(moodAt(this.clock));
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
        this.startIntro();
      }
    } else {
      this.fade = Math.max(0, this.fade - dt / FADE_TIME);
    }

    const wasTalking = this.dialogue.active;
    if (wasTalking) this.dialogue.update(dt, input);

    const scripted = this.cutscene !== null;
    if (this.cutscene && !this.pending) {
      this.cutscene.update(dt, this.host);
      if (this.cutscene.done) {
        this.cutscene = null;
        this.save();
      }
    }
    this.bars = damp(this.bars, this.cutscene ? 1 : 0, 6, dt);

    if (!wasTalking && !this.pending && !scripted) {
      if (!this.map.open && (input.pressed('phone') || (this.phone.open && input.pressed('back')))) {
        this.phone.toggle();
        this.audio.select();
      }
      if (!this.phone.open && (input.pressed('map') || (this.map.open && input.pressed('back')))) {
        this.map.toggle(this.area.def.id);
        this.audio.select();
      }
      const stop = this.map.choose(input, () => this.audio.select());
      if (stop) {
        this.map.open = false;
        this.audio.chime();
        this.travel(stop.area, stop.spawn);
      }
      if (input.pressed('time') && !this.phone.open && !this.map.open) {
        this.clock = (this.clock + 1.5) % 24;
        this.weather.update(0, 1.5);
      }
    }
    this.phone.update(dt);
    this.map.update(dt);

    const locked =
      this.dialogue.active || wasTalking || this.phone.open || this.map.open || this.pending !== null || scripted;
    const before = this.area.player.x;
    this.area.update(dt, input, mood, locked);
    const bar = this.area.def.barrier;
    if (bar && !this.has(bar.until) && before >= bar.x && this.area.player.x < bar.x) {
      this.area.player.x = bar.x;
      this.area.player.vx = 0;
    }
    this.target = locked ? null : this.area.target();
    if (this.target && input.pressed('interact')) {
      this.audio.select();
      this.target.use(this);
      this.target = null;
    }

    this.updateAudio(mood.night);
    input.endFrame();
  }

  private updateTitle(dt: number, mood: Mood): void {
    this.area.update(dt, this.input, mood, true);
    // slow drift across the front of the building
    const span = this.area.def.width - VIEW_W;
    this.area.camera.x = span * (0.5 + 0.2 * Math.sin(this.time * 0.07));
    if (this.pending) {
      this.fade = Math.min(1, this.fade + dt / 0.6);
      if (this.fade >= 1) {
        this.mode = 'play';
        // a new game leaves from the name box under a black screen: nothing of the menus should fade back over the game
        if (this.screen !== 'title') this.titleOut = 1;
        const start = this.pending;
        this.pending = null;
        if (this.resume) {
          this.area = this.areas.get(this.resume.area)!;
          this.area.enter('');
          this.area.player.x = this.resume.x;
          this.area.camera.snap(this.resume.x);
        } else {
          this.area = this.areas.get(start.area)!;
          this.area.enter(start.spawn);
        }
        this.areaAge = 0;
        this.startIntro();
      }
    } else if (this.selecting) {
      this.updateSelect();
    } else if (this.time > 0.6 && this.input.pressed('interact')) {
      if (this.hasSave) {
        // continue: the saved character is already applied
        this.pending = { ...NEW_GAME };
        this.audio.chime();
      } else {
        this.openSelect(false);
      }
    } else if (this.time > 0.6 && this.hasSave && this.input.pressed('fresh')) {
      this.openSelect(true);
    }
    this.selectFade = damp(this.selectFade, this.selecting ? 1 : 0, 12, dt);
    this.choiceAnim = damp(this.choiceAnim, this.choice === 'girl' ? 1 : 0, 14, dt);
    // hand over between screens, unless the game is already starting: then whatever is showing stays put under the fade
    if (!this.pending) {
      const want = this.naming ? 'name' : this.selecting ? 'select' : 'title';
      if (this.screen !== want) {
        this.screenFade -= dt * SCREEN_FADE;
        if (this.screenFade <= 0) {
          this.screenFade = 0;
          this.screen = want;
        }
      } else {
        this.screenFade = Math.min(1, this.screenFade + dt * SCREEN_FADE);
      }
    }
    this.updateAudio(mood.night);
  }

  private openSelect(fresh: boolean): void {
    this.selecting = true;
    this.startFresh = fresh;
    this.audio.select();
  }

  private updateSelect(): void {
    const input = this.input;
    if (this.naming) {
      this.updateNaming();
      return;
    }
    if (input.pressed('left') && this.choice !== 'boy') {
      this.choice = 'boy';
      this.audio.select();
    } else if (input.pressed('right') && this.choice !== 'girl') {
      this.choice = 'girl';
      this.audio.select();
    } else if (input.pressed('back')) {
      this.selecting = false;
      this.startFresh = false;
      this.audio.select();
    } else if (input.pressed('interact')) {
      this.naming = true;
      this.nameDraft = '';
      input.typing = true;
      input.takeTyped();
      this.audio.select();
    }
  }

  private updateNaming(): void {
    const input = this.input;
    for (const k of input.takeTyped()) {
      if (k === 'Backspace') this.nameDraft = this.nameDraft.slice(0, -1);
      else if (/^[\p{L}\p{N} .'-]$/u.test(k) && this.nameDraft.length < NAME_MAX) this.nameDraft += k;
    }
    if (input.pressed('back')) {
      this.naming = false;
      input.typing = false;
      this.audio.select();
    } else if (input.pressed('interact') && this.nameDraft.trim()) {
      input.typing = false;
      this.naming = false;
      setPlayerName(this.nameDraft);
      // a new day: forget any old save, keep the chosen student
      this.flags.clear();
      this.clock = START_HOUR;
      this.resume = null;
      this.wallet = BAON;
      this.lastBuy = null;
      if (this.startFresh && this.persist) {
        try {
          localStorage.removeItem(SAVE_KEY);
        } catch {
          // nothing to clear
        }
      }
      this.hasSave = false;
      this.startFresh = false;
      this.applyCharacter(this.choice);
      this.pending = { ...NEW_GAME };
      this.audio.chime();
    }
  }

  private updateAudio(night: number): void {
    const def = this.area.def;
    const camMid = this.area.camera.x + VIEW_W / 2;
    const water = def.fountainX === undefined ? 0 : clamp(1 - Math.abs(camMid - def.fountainX) / 320, 0, 1);
    this.audio.update(water, night, !def.outdoor, this.weather.rain);
  }

  render(): void {
    const area = this.area;
    const mood = this.weather.mood(moodAt(this.clock));
    area.render(this.display.ctx, mood);
    if (area.def.outdoor) {
      this.weather.render(this.display.ctx, Math.round(area.camera.x), area.def.walkY, area.def.width, this.time, mood.night);
    }
    this.display.present();

    const ui = this.display.ui();
    if (this.mode === 'play') {
      // where you are on the campus plan, and a step ahead of you for the map arrow
      const here = whereAmI(area.def.id, area.player.x);
      const ahead = whereAmI(area.def.id, area.player.x + area.player.facing * 30);
      drawLetterbox(ui, this.bars);
      if (this.target) drawPrompt(ui, this.target, area.camera.x, this.time);
      this.dialogue.render(ui, area);
      if (!this.dialogue.active) {
        if (!this.cutscene) drawClock(ui, this.clock, this.wallet, this.raining(), this.change);
        if (!this.cutscene && !this.phone.open) this.map.renderMini(ui, here, ahead, this.time, mood.night);
        drawAreaTitle(ui, area.def.title, area.def.subtitle, this.areaAge);
        if (!this.cutscene) drawControlsHint(ui, clamp(14 - this.playAge, 0, 1));
      }
      if (this.toast) drawToast(ui, this.toast.text, this.toast.age);
      this.phone.render(ui, this.clock, (f) => this.has(f), { pesos: this.wallet, last: this.lastBuy });
      this.map.render(ui, here, ahead, this.time);
    }
    const showing = (s: Game['screen']) => (this.screen === s ? this.screenFade * (1 - this.titleOut) : 0);
    drawTitle(ui, this.time, 1 - showing('title'), this.hasSave);
    drawMenuBackdrop(ui, this.selectFade * (1 - this.titleOut));
    drawSelect(ui, this.time, showing('select'), this.choiceAnim);
    drawName(ui, this.time, showing('name'), this.choice, this.nameDraft, NAME_MAX);
    if (this.fade > 0) {
      ui.fillStyle = `rgba(13,11,16,${this.fade})`;
      ui.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }
}

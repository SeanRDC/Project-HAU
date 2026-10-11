import { Display } from '../engine/display';
import { Input } from '../engine/input';
import { moodAt } from '../engine/tod';
import { Area } from './area';
import { Sky } from './art/sky';
import { buildPlaza } from './scenes/plaza';
import { AreaDef, GameApi, Line } from './types';

/** in-game hours per real second: a full day takes about 12 minutes */
const TIME_RATE = 24 / (12 * 60);

export class Game implements GameApi {
  private sky = new Sky();
  private areas = new Map<string, Area>();
  private area: Area;
  private clock = 16.4;
  private flags = new Set<string>();

  constructor(private display: Display, private input: Input) {
    const defs: AreaDef[] = [buildPlaza()];
    for (const d of defs) this.areas.set(d.id, new Area(d, this.sky));

    // ?area=plaza&x=700&hour=18 jumps straight somewhere, handy while building scenes
    const q = new URLSearchParams(location.search);
    this.area = this.areas.get(q.get('area') ?? 'plaza') ?? this.areas.get('plaza')!;
    this.area.enter('start');
    if (q.has('hour')) this.clock = Number(q.get('hour'));
    if (q.has('x')) {
      this.area.player.x = Number(q.get('x'));
      this.area.camera.snap(this.area.player.x);
    }
  }

  has(flag: string): boolean {
    return this.flags.has(flag);
  }

  set(flag: string): void {
    this.flags.add(flag);
  }

  say(_lines: Line[]): void {}

  travel(area: string, spawn: string): void {
    const next = this.areas.get(area);
    if (!next) return;
    this.area = next;
    next.enter(spawn);
  }

  hour(): number {
    return this.clock;
  }

  update(dt: number): void {
    this.clock = (this.clock + dt * TIME_RATE) % 24;
    if (this.input.pressed('time')) this.clock = (this.clock + 1.5) % 24;
    const mood = moodAt(this.clock);
    this.sky.update(dt);
    this.area.update(dt, this.input, mood, false);
    this.input.endFrame();
  }

  render(): void {
    this.area.render(this.display.ctx, moodAt(this.clock));
    this.display.present();
  }
}

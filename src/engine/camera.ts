import { VIEW_W } from './display';
import { clamp, damp } from './math';

/** Horizontal follow camera. The world only scrolls sideways. */
export class Camera {
  x = 0;
  private lead = 0;

  constructor(public worldWidth: number) {}

  snap(targetX: number): void {
    this.lead = 0;
    this.x = this.limit(targetX - VIEW_W / 2);
  }

  /** `facing` nudges the view ahead of the player so there's more to see in front. */
  follow(targetX: number, facing: number, dt: number): void {
    this.lead = damp(this.lead, facing * 28, 1.6, dt);
    this.x = damp(this.x, this.limit(targetX + this.lead - VIEW_W / 2), 5, dt);
  }

  private limit(x: number): number {
    return clamp(x, 0, Math.max(0, this.worldWidth - VIEW_W));
  }
}

export type Action = 'left' | 'right' | 'up' | 'down' | 'run' | 'interact' | 'back' | 'phone' | 'time' | 'mute' | 'fresh';

const BINDINGS: Record<string, Action> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ShiftLeft: 'run',
  ShiftRight: 'run',
  KeyE: 'interact',
  Enter: 'interact',
  Space: 'interact',
  Escape: 'back',
  Tab: 'phone',
  KeyQ: 'phone',
  KeyT: 'time',
  KeyM: 'mute',
  KeyN: 'fresh',
};

export class Input {
  private held = new Set<Action>();
  private justPressed = new Set<Action>();
  /** Fires once on the very first key press. Browsers need a gesture before audio can start. */
  onFirstGesture: (() => void) | null = null;

  constructor() {
    window.addEventListener('keydown', (e) => {
      const action = BINDINGS[e.code];
      if (this.onFirstGesture) {
        this.onFirstGesture();
        this.onFirstGesture = null;
      }
      if (!action) return;
      e.preventDefault();
      if (!e.repeat) this.justPressed.add(action);
      this.held.add(action);
    });
    window.addEventListener('keyup', (e) => {
      const action = BINDINGS[e.code];
      if (action) this.held.delete(action);
    });
    window.addEventListener('blur', () => this.held.clear());
  }

  down(a: Action): boolean {
    return this.held.has(a);
  }

  pressed(a: Action): boolean {
    return this.justPressed.has(a);
  }

  /** -1, 0 or 1 */
  axis(): number {
    return (this.down('right') ? 1 : 0) - (this.down('left') ? 1 : 0);
  }

  /** Call at the end of every frame. */
  endFrame(): void {
    this.justPressed.clear();
  }
}

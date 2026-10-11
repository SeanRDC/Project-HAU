export type Tick = (dt: number) => void;

const MAX_DT = 1 / 20;

/** requestAnimationFrame loop. dt is in seconds and clamped so a tab switch doesn't teleport anything. */
export function startLoop(update: Tick, render: () => void): void {
  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// Time of day. A handful of hand-picked keyframes get blended into the
// colours the renderer needs: sky gradient, ambient light, haze, sun.

import { RGB, hex, lerp, mix } from './math';

export interface Mood {
  hour: number;
  skyTop: RGB;
  skyBottom: RGB;
  /** multiplied over the whole scene */
  ambient: RGB;
  /** colour distant layers fade towards */
  haze: RGB;
  sun: RGB;
  /** 0 = day, 1 = full night. Drives lamps, window glow, stars. */
  night: number;
  /** strength of the warm low-sun glow */
  glow: number;
}

type Key = [hour: number, top: string, bottom: string, ambient: string, haze: string, sun: string, night: number, glow: number];

const KEYS: Key[] = [
  [0.0, '#0a0d2a', '#23264f', '#56609e', '#1c2146', '#9fb4ff', 1.0, 0.0],
  [4.6, '#10143a', '#3a3460', '#5a629e', '#272a55', '#9fb4ff', 1.0, 0.0],
  [5.6, '#3a4585', '#e39a86', '#a892b4', '#8f7a9a', '#ffb089', 0.45, 0.5],
  [6.8, '#5f8bd0', '#ffd2a6', '#f3d6c2', '#f0cdb4', '#ffdcaa', 0.0, 0.55],
  [10.0, '#3c8fe2', '#bfe4f6', '#ffffff', '#cfe6f2', '#fff7e0', 0.0, 0.1],
  [15.0, '#4990da', '#d2e6ea', '#fff7e8', '#dbe6e0', '#fff0c4', 0.0, 0.2],
  [16.8, '#5c7fca', '#ffd19a', '#ffe0ba', '#ffcfa2', '#ffc06a', 0.0, 0.7],
  [17.9, '#54509a', '#ff9d6c', '#f6b192', '#ec9480', '#ff8048', 0.12, 1.0],
  [18.7, '#2a2c62', '#b85f7c', '#a184ac', '#6c5282', '#ff7a5a', 0.6, 0.45],
  [19.6, '#12163c', '#3d3766', '#646aa6', '#2a2c58', '#9fb4ff', 0.95, 0.0],
  [24.0, '#0a0d2a', '#23264f', '#56609e', '#1c2146', '#9fb4ff', 1.0, 0.0],
];

export function moodAt(hour: number): Mood {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (h - a[0]) / (b[0] - a[0]);
  return {
    hour: h,
    skyTop: mix(hex(a[1]), hex(b[1]), t),
    skyBottom: mix(hex(a[2]), hex(b[2]), t),
    ambient: mix(hex(a[3]), hex(b[3]), t),
    haze: mix(hex(a[4]), hex(b[4]), t),
    sun: mix(hex(a[5]), hex(b[5]), t),
    night: lerp(a[6], b[6], t),
    glow: lerp(a[7], b[7], t),
  };
}

export function clockLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const twelve = hh % 12 === 0 ? 12 : hh % 12;
  return `${twelve}:${mm.toString().padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`;
}

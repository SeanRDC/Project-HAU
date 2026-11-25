// Nonox's sheet (the handoff's 6 x 2 grid of 26 px cells, nonox_spritesheet.json) into the
// game's one-row-per-pose sheets, like the other cats': nonox_walk (six frames) and one frame
// each for front, loaf, sit, petted and blep. Every cell has an empty row under the feet;
// it is dropped so the feet stand on the bottom row.
// usage: node assets/drafts/characters/critters/nonox/split.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readPng, writePng } from '../../portraits/png.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = fileURLToPath(new URL('../../../../../src/drafts/aps-godot/sprites/critters/', import.meta.url));
const sheet = JSON.parse(readFileSync(here + 'nonox_spritesheet.json', 'utf8'));
const im = readPng(here + sheet.image);
const cell = sheet.cell_px, h = cell - 1;

const POSES = {
  walk: ['walk_1', 'walk_2', 'walk_3', 'walk_4', 'walk_5', 'walk_6'],
  front: ['front'], loaf: ['loaf'], sit: ['curious_sit'], petted: ['petted_happy'], blep: ['stink_eye_blep'],
};

for (const [pose, frames] of Object.entries(POSES)) {
  const w = cell * frames.length, rgba = Buffer.alloc(w * h * 4);
  frames.forEach((name, i) => {
    const f = sheet.frames[name];
    for (let x = 0; x < cell; x++) {
      if (im.data[((f.y + cell - 1) * im.w + f.x + x) * 4 + 3] > 0) throw new Error(`${name}: the dropped row is not empty`);
      for (let y = 0; y < h; y++) im.data.copy(rgba, (y * w + i * cell + x) * 4, ((f.y + y) * im.w + f.x + x) * 4, ((f.y + y) * im.w + f.x + x) * 4 + 4);
    }
  });
  writePng(`${out}nonox_${pose}.png`, w, h, rgba);
  console.log(`nonox_${pose}.png ${w}x${h}`);
}

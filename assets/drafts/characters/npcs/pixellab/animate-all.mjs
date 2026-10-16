// Redraws NPC animations with PixelLab (animate.mjs), at most AT_ONCE (default 2) jobs at a
// time, retrying a job that fails to start. Frames land in frames/<id>/<kind>; then run
// ../rig/build.ps1 to make the sheets. Each 12-frame walk or 4-frame wave costs 3 generations.
// usage: node animate-all.mjs <walk|wave> <seed> <id...>   (PIXELLAB_API_KEY in the environment)
import { writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const S = fileURLToPath(new URL('.', import.meta.url)).replace(/\\/g, '/').replace(/\/$/, '');
const [kind, seed, ...ids] = process.argv.slice(2);
const looks = {
  bea: 'schoolgirl, dark brown hair in a high ponytail, white short-sleeved blouse with a maroon ribbon and maroon buttons, grey plaid pleated skirt, pink backpack, white socks, black school shoes',
  migo: 'schoolboy, messy spiky black hair, white short-sleeved polo shirt, black pants, navy blue backpack, dark brown shoes',
  'kuya-ben': 'traffic marshal man, curly brown hair, orange and yellow reflective safety vest over a dark brown long-sleeved shirt, dark brown pants, dark shoes',
  bianca: 'schoolgirl, long dark brown hair with bangs, white short-sleeved blouse with a maroon ribbon, grey plaid pleated skirt, navy blue backpack, white socks, black school shoes',
  rica: 'schoolgirl, short black bob haircut, white short-sleeved blouse with a maroon ribbon, grey plaid pleated skirt, white socks, black school shoes',
  paolo: 'schoolboy, short black buzz cut, black glasses, white short-sleeved shirt, black pants, green backpack, dark shoes',
  'ate-lorna': 'canteen cook woman, dark brown hair in a bun under a hairnet, red short-sleeved shirt, long white apron, dark pants, dark shoes',
  boy: 'schoolboy, fluffy messy brown hair, white short-sleeved polo shirt, black pants, dark red backpack, brown school shoes',
  'coach-gab':'sports coach, short black hair, dark green tracksuit jacket with a whistle on a cord, navy track pants, white sneakers',
};
const frames = { walk: 12, wave: 4, talk: 4 };
const run = [];
for (const id of ids) {
  const job = {
    first: `${S}/frames/${id}/reference.png`, canvas: [128, 128], scale: 1, offset: [32, 16], skeleton: `${S}/frames/${id}/reference-skeleton.json`,
    description: looks[id], action: kind === 'wave' ? 'wave hello' : kind, frames: frames[kind], kind,
    out: `${S}/frames/${id}/${kind}`, seed: Number(seed),
  };
  const file = `${S}/frames/${id}/${kind}-job.json`;
  writeFileSync(file, JSON.stringify(job));
  run.push([id, file]);
}
let active = 0, next = 0; const tries = {};
const go = () => {
  while (active < Number(process.env.AT_ONCE || 2) && next < run.length) {
    const [id, file] = run[next++];
    active++;
    const p = spawn('node', [`${S}/animate.mjs`, file], { env: process.env });
    let log = '';
    p.stdout.on('data', (d) => (log += d)); p.stderr.on('data', (d) => (log += d));
    p.on('close', (code) => {
      if (code && (tries[id] = (tries[id] || 0) + 1) < 4) { console.log(id, kind, 'retry:', log.trim().slice(0, 500)); run.push([id, file]); }
      else console.log(id, kind, log.trim().slice(-300));
      active--; setTimeout(go, 15000);
    });
  }
};
go();

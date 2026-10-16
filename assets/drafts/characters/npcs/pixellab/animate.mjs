// Animates an NPC with PixelLab animate-with-skeleton-v3, the skeletons taken from the
// rig's own walk (the same angles as NpcRig.Walk) applied to PixelLab's estimate of the
// reference pose.
// Usually run through animate-all.mjs. usage: node animate.mjs <job.json>  (PIXELLAB_API_KEY in the environment)
//  job: { first: png, canvas: [W, H], scale, offset: [ox, oy],   (where the 64x96 sprite sits)
//         skeleton: json (estimated on a 256x256 image, sprite x2 at 64,32),
//         description, action, frames, out, seed, view, kind: "walk"|"idle"|"talk"|"wave" }
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const job = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const api = 'https://api.pixellab.ai/v2';
const headers = { Authorization: `Bearer ${process.env.PIXELLAB_API_KEY}`, 'Content-Type': 'application/json' };
const est = JSON.parse(readFileSync(job.skeleton, 'utf8'));
// reference joints in sprite pixels (64x96 canvas)
const P = {}, Z = {};
for (const k of est) { P[k.label] = [(k.x * 256 - 64) / 2, (k.y * 256 - 32) / 2]; Z[k.label] = Math.round(k.z_index ?? 0); }
const len = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
const rot = (L, deg) => { const a = deg * Math.PI / 180; return [L * Math.sin(a), L * Math.cos(a)]; };
const side = { near: 'RIGHT', far: 'LEFT' };
function pose(p) {
  const out = {};
  for (const l in P) out[l] = [P[l][0], P[l][1] + p.dy];
  for (const [s, thigh, knee] of [['near', p.nearThigh, p.nearKnee], ['far', p.farThigh, p.farKnee]]) {
    const L = side[s];
    const hip = [P[`${L} HIP`][0], P[`${L} HIP`][1] + p.dy];
    const t = rot(len(`${L} HIP`, `${L} KNEE`), thigh);
    const kn = [hip[0] + t[0], hip[1] + t[1]];
    const sh = rot(len(`${L} KNEE`, `${L} LEG`), thigh - knee);
    out[`${L} KNEE`] = kn; out[`${L} LEG`] = [kn[0] + sh[0], kn[1] + sh[1]];
  }
  for (const [s, swing, bend] of [['near', p.nearArm, p.nearBend], ['far', p.farArm, p.farBend]]) {
    const L = side[s];
    const sh = [P[`${L} SHOULDER`][0], P[`${L} SHOULDER`][1] + p.dy];
    const u = rot(len(`${L} SHOULDER`, `${L} ELBOW`), swing);
    const el = [sh[0] + u[0], sh[1] + u[1]];
    const f = rot(len(`${L} ELBOW`, `${L} ARM`), swing + bend);
    out[`${L} ELBOW`] = el; out[`${L} ARM`] = [el[0] + f[0], el[1] + f[1]];
  }
  return out;
}
// lowest foot on the ground: the body drops by however much the legs are shortened
function grounded(p) {
  const base = pose({ ...p, dy: 0 });
  const ground = Math.max(P['RIGHT LEG'][1], P['LEFT LEG'][1]);
  p.dy = ground - Math.max(base['RIGHT LEG'][1], base['LEFT LEG'][1]);
  return p;
}
function walk(i, n) {
  const A = 23, K = 52, C = 19, t = 2 * Math.PI * i / n, s = Math.sin(t), c = Math.cos(t);
  const p = { nearThigh: A * s, farThigh: -A * s };
  p.nearKnee = c > 0 ? K * Math.pow(c, 1.3) : 8 * -c;
  p.farKnee = c < 0 ? K * Math.pow(-c, 1.3) : 8 * c;
  if (c > 0) p.nearThigh += 0.4 * p.nearKnee;
  if (c < 0) p.farThigh += 0.4 * p.farKnee;
  const lag = 2 * Math.PI * 0.04;
  p.nearArm = -C * Math.sin(t - lag); p.farArm = C * Math.sin(t - lag);
  p.nearBend = 6 + 16 * Math.max(0, p.nearArm / C);
  p.farBend = 6 + 16 * Math.max(0, p.farArm / C);
  return grounded(p);
}
const still = { nearThigh: 0, farThigh: 0, nearKnee: 0, farKnee: 0, nearArm: 0, farArm: 0, nearBend: 0, farBend: 0, dy: 0 };
let poses;
if (job.kind === 'walk') poses = Array.from({ length: job.frames }, (_, i) => walk(i, job.frames));
else if (job.kind === 'wave') poses = Array.from({ length: job.frames }, (_, i) => ({ ...still, nearArm: -72 - 2 * (i % 2), nearBend: -96 - 18 * [0, 1, 2, 1][i % 4] }));
else if (job.kind === 'talk') poses = Array.from({ length: job.frames }, (_, i) => ({ ...still, nearArm: [0, 7, 10, 4][i % 4], nearBend: [0, 26, 32, 18][i % 4] }));
else poses = Array.from({ length: job.frames }, (_, i) => ({ ...still, dy: [0, 0, 1, 1][i % 4] * 0.5 }));
const [W, H] = job.canvas, [ox, oy] = job.offset, sc = job.scale;
const frac = (pt) => [Math.min(1, Math.max(0, (ox + pt[0] * sc) / W)), Math.min(1, Math.max(0, (oy + pt[1] * sc) / H))];
const keys = (pts) => Object.entries(pts).map(([label, pt]) => { const [x, y] = frac(pt); return { label, x, y, z_index: Z[label] }; });
const body = {
  description: job.description, action: job.action, direction: job.direction ?? 'south-east', view: job.view ?? 'low top-down',
  first_frame: { type: 'base64', base64: readFileSync(job.first).toString('base64'), format: 'png' },
  first_frame_keypoints: keys(Object.fromEntries(Object.entries(P).map(([l, p]) => [l, p]))),
  keypoints: poses.map((p) => keys(pose(p))),
  seed: job.seed ?? 0, no_background: true,
};
mkdirSync(job.out, { recursive: true });
writeFileSync(`${job.out}/skeletons.json`, JSON.stringify(body.keypoints));
if (process.env.DRY) { console.log('dry run', body.keypoints.length, 'frames'); process.exit(0); }
const start = await fetch(`${api}/animate-with-skeleton-v3`, { method: 'POST', headers, body: JSON.stringify(body) });
const j0 = await start.json();
if (!start.ok) { console.error(start.status, JSON.stringify(j0).slice(0, 1200)); process.exit(1); }
console.log('job', j0.background_job_id);
for (;;) {
  await new Promise((r) => setTimeout(r, 10000));
  const j = await (await fetch(`${api}/background-jobs/${j0.background_job_id}`, { headers })).json();
  if (j.status === 'completed') {
    j.last_response.images.forEach((img, i) => writeFileSync(`${job.out}/f${String(i).padStart(2, '0')}.png`, Buffer.from(img.base64.replace(/^data:image\/png;base64,/, ''), 'base64')));
    console.log('saved', j.last_response.images.length, 'to', job.out, 'usage', JSON.stringify(j.usage ?? j.last_response.usage ?? ''));
    break;
  }
  if (j.status === 'failed') { console.error('failed', JSON.stringify(j).slice(0, 1200)); process.exit(1); }
}

// PixelLab estimate-skeleton on a 256 x 256 image (the 64 x 96 drawing enlarged x2 at 64, 32).
// usage: node skeleton.mjs <in.png> <out.json>  (PIXELLAB_API_KEY in the environment)
import { readFileSync, writeFileSync } from 'node:fs';
const [input, output] = process.argv.slice(2);
const api = 'https://api.pixellab.ai/v2';
const headers = { Authorization: `Bearer ${process.env.PIXELLAB_API_KEY}`, 'Content-Type': 'application/json' };
const res = await fetch(`${api}/estimate-skeleton`, { method: 'POST', headers, body: JSON.stringify({ image: { type: 'base64', base64: readFileSync(input).toString('base64'), format: 'png' } }) });
const j = await res.json();
if (!res.ok) { console.error(res.status, JSON.stringify(j).slice(0, 800)); process.exit(1); }
writeFileSync(output, JSON.stringify(j.keypoints, null, 1));
console.log(JSON.stringify(j.keypoints.map((k) => [k.label, +k.x.toFixed(3), +k.y.toFixed(3), k.z_index])), 'usage', JSON.stringify(j.usage));

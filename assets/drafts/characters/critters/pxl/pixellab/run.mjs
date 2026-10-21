// Sends one of the requests here to PixelLab and saves what comes back.
//   node run.mjs <endpoint> <request.json> <out-prefix>   (PIXELLAB_API_KEY in the environment)
// e.g. node run.mjs animate-with-text-v3 cat-groom.json ../raw/cat-groom
// "@name.png" in the request is ../source/name.png as base64. "pad": [W, H] puts the first frame
// on a bigger clear canvas (paws on the bottom row, centred), so a pose has room to move.
// Frames are written as <out-prefix>-01.png, -02.png...
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync, inflateSync } from 'node:zlib';
const here = dirname(fileURLToPath(import.meta.url));
const [endpoint, requestFile, out] = process.argv.slice(2);
const api = 'https://api.pixellab.ai/v2';
const headers = { Authorization: `Bearer ${process.env.PIXELLAB_API_KEY}`, 'Content-Type': 'application/json' };

// --- PNG (8-bit RGBA in and out) -------------------------------------------------------------
function readPng(b) {
  let w = 0, h = 0, type = 6; const idat = [];
  for (let at = 8; at < b.length;) {
    const len = b.readUInt32BE(at), kind = b.toString('ascii', at + 4, at + 8), data = b.subarray(at + 8, at + 8 + len);
    if (kind === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; }
    if (kind === 'IDAT') idat.push(data);
    at += 12 + len;
  }
  const bpp = type === 6 ? 4 : 3, raw = inflateSync(Buffer.concat(idat)), stride = w * bpp;
  const px = new Uint8Array(w * h * 4), prev = new Uint8Array(stride), cur = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const x = raw[y * (stride + 1) + 1 + i], a = i >= bpp ? cur[i - bpp] : 0, up = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c);
      cur[i] = (x + [0, a, up, (a + up) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? up : c][f]) & 255;
    }
    for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) px[(y * w + x) * 4 + k] = k < bpp ? cur[x * bpp + k] : 255;
    prev.set(cur);
  }
  return { w, h, px };
}
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const v of buf) c = crcTable[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function writePng({ w, h, px }) {
  const chunk = (kind, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(kind, 'ascii'), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(body)); return Buffer.concat([len, body, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) Buffer.from(px.buffer, px.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
function pad(img, W, H) {
  const px = new Uint8Array(W * H * 4), ox = Math.floor((W - img.w) / 2), oy = H - img.h;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++)
    for (let k = 0; k < 4; k++) px[((y + oy) * W + x + ox) * 4 + k] = img.px[(y * img.w + x) * 4 + k];
  return { w: W, h: H, px };
}

// --- The request ------------------------------------------------------------------------------
const request = JSON.parse(readFileSync(resolve(here, requestFile), 'utf8'));
const size = request.pad;
delete request.pad;
const fill = (v) => {
  if (typeof v === 'string' && v.startsWith('@')) {
    let img = readPng(readFileSync(resolve(here, '../source', v.slice(1))));
    if (size) img = pad(img, size[0], size[1]);
    return writePng(img).toString('base64');
  }
  if (Array.isArray(v)) return v.map(fill);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)]));
  return v;
};
const body = fill(request);
const save = (images) => {
  mkdirSync(dirname(resolve(here, out)), { recursive: true });
  images.forEach((img, i) => writeFileSync(resolve(here, `${out}-${String(i + 1).padStart(2, '0')}.png`),
    Buffer.from((img.base64 ?? img).replace(/^data:image\/png;base64,/, ''), 'base64')));
  console.log('saved', images.length, 'frames to', out);
};
const start = await fetch(`${api}/${endpoint}`, { method: 'POST', headers, body: JSON.stringify(body) });
const j0 = await start.json();
if (!start.ok) { console.error(start.status, JSON.stringify(j0).slice(0, 1200)); process.exit(1); }
if (!j0.background_job_id) { save(j0.images ?? [j0.image]); process.exit(0); }
for (;;) {
  await new Promise((r) => setTimeout(r, 8000));
  const j = await (await fetch(`${api}/background-jobs/${j0.background_job_id}`, { headers })).json();
  if (j.status === 'completed') { save(j.last_response.images ?? [j.last_response.image]); break; }
  if (j.status === 'failed') { console.error('failed', JSON.stringify(j).slice(0, 1200)); process.exit(1); }
}

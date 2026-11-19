// A small PNG reader and writer (8-bit RGB/RGBA, not interlaced), so the portrait tools need
// nothing but Node.
import fs from "fs";
import zlib from "zlib";

export function readPng(file) {
  const b = fs.readFileSync(file);
  let p = 8, w, h, type, idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p), kind = b.toString("ascii", p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
    if (kind === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); type = d[9]; if (d[8] !== 8 || d[12]) throw new Error("8-bit, not interlaced only"); }
    if (kind === "IDAT") idat.push(d);
    p += 12 + len;
  }
  const ch = type === 6 ? 4 : type === 2 ? 3 : 0;
  if (!ch) throw new Error("RGB or RGBA only");
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * ch, out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? line[i - ch] : 0, up = prev[i], c = i >= ch ? prev[i - ch] : 0;
      if (f === 1) line[i] += a;
      else if (f === 2) line[i] += up;
      else if (f === 3) line[i] += (a + up) >> 1;
      else if (f === 4) { const q = a + up - c, pa = Math.abs(q - a), pb = Math.abs(q - up), pc = Math.abs(q - c); line[i] += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
    }
    for (let x = 0; x < w; x++) for (let k = 0; k < 4; k++) out[(y * w + x) * 4 + k] = k < ch ? line[x * ch + k] : 255;
    prev = line;
  }
  return { w, h, data: out, get: (x, y) => { const i = (y * w + x) * 4; return [out[i], out[i + 1], out[i + 2]]; } };
}

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const v of buf) c = crcTable[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (kind, d) => { const len = Buffer.alloc(4), body = Buffer.concat([Buffer.from(kind, "ascii"), d]), c = Buffer.alloc(4); len.writeUInt32BE(d.length); c.writeUInt32BE(crc(body)); return Buffer.concat([len, body, c]); };

// writes RGBA pixels (a Buffer of w*h*4)
export function writePng(file, w, h, rgba) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
}

// Turns another picture of her (dumped to JSON) into a pxl sprite on the palette gf.px.js
// already uses, so every pose of her has exactly the same colours.
// usage: node to-palette.mjs <in.json> <out.px.js> <name> <comment>
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const [input, output, name, comment] = process.argv.slice(2);
const palLine = readFileSync(`${here}/gf.px.js`, 'utf8').split('\n').find((l) => l.startsWith('pal('));
const entries = [...palLine.matchAll(/(\w): "#([0-9a-f]{6})"/g)].map(([, k, h]) => [k, [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))]);
const { w, h, px } = JSON.parse(readFileSync(input, 'utf8'));
const dist = (a, b) => 2 * (a[0] - b[0]) ** 2 + 4 * (a[1] - b[1]) ** 2 + 3 * (a[2] - b[2]) ** 2;
const key = (v) => { const c = [(v >> 16) & 255, (v >> 8) & 255, v & 255]; let best = '.', bd = Infinity; for (const [k, m] of entries) { const d = dist(c, m); if (d < bd) { bd = d; best = k; } } return best; };
const rows = [];
for (let y = 0; y < h; y++) { let r = ''; for (let x = 0; x < w; x++) { const v = px[y * w + x]; r += v < 0 ? '.' : key(v); } rows.push('  ' + r); }
writeFileSync(output, `// ${comment}\n${palLine}\nsprite("${name}", \`\n${rows.join('\n')}\`)\n`);
console.log(name, `${w}x${h}`, 'on', entries.length, 'palette keys');

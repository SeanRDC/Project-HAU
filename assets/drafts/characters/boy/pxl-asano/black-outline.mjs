// Makes a traced sprite's outlines pure black: the darkest line colour becomes black, and every
// pixel on the silhouette's edge (next to an empty pixel) is black, so no soft brown steps
// around the shape. Adds the step to the sprite's px.js (once).
//   node black-outline.mjs lance-big.px.js
import fs from "fs";
const file = process.argv[2];
let s = fs.readFileSync(file, "utf8");
if (s.includes("black outline")) { console.log("already has a black outline"); process.exit(0); }
s = s.replace(/pal\(\{ /, 'pal({ Z: "#000000", ');
const step = `, recolor({ a: "Z" }), (c) => {
  // black outline: every pixel next to an empty one, around the whole silhouette
  const empty = (x, y) => x < 0 || y < 0 || x >= c.w || y >= c.h || !(c.get(x, y) & 255)
  const edge = []
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
    if (empty(x, y)) continue
    if (empty(x - 1, y) || empty(x + 1, y) || empty(x, y - 1) || empty(x, y + 1)) edge.push([x, y])
  }
  for (const [x, y] of edge) c.px(x, y, "Z")
}`;
s = s.replace(/`\)\s*$/, "`" + step + ")\n");
fs.writeFileSync(file, s);
console.log("added a black outline to", file);

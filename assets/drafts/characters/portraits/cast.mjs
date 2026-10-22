// Puts every character's cleaned portraits (clean.mjs) in one pxl file, cast.px.js, to see them
// side by side in the live viewer. Each character's colours get their own keys; the shared
// colours (lines, eyes, shirt) stay the same keys for everyone.
//   node cast.mjs && pxl serve cast.px.js
import fs from "fs";
const CAST = ["lance", "pat", "ysha"];
const SHARED = ["#000000", "#2b1a1c", "#efe3d6", "#cdb2a5"];
const EXPRESSIONS = ["neutral", "smile", "laugh", "sad", "surprised", "worried", "annoyed", "away"];
const free = [..."ABCDFGHIJKLMNOPQRSTUVXYabcdfghijklmnopqrstuvxyz0123456789"];
const keyOf = new Map([["#000000", "Z"], ["#2b1a1c", "E"], ["#efe3d6", "W"], ["#cdb2a5", "w"]]);
const sprites = [];
for (const name of CAST) {
  const { w, palette, faces } = JSON.parse(fs.readFileSync(new URL(`./${name}.clean.json`, import.meta.url), "utf8"));
  for (const hex of palette) if (!keyOf.has(hex)) keyOf.set(hex, free.shift());
  faces.forEach((f, i) => {
    const rows = [];
    for (let y = 0; y * w < f.length; y++) rows.push("  " + f.slice(y * w, (y + 1) * w).map((k) => (k < 0 ? "." : keyOf.get(palette[k]))).join(""));
    sprites.push(`sprite("${name}_${EXPRESSIONS[i]}", \`\n${rows.join("\n")}\`)`);
  });
}
fs.writeFileSync(new URL("./cast.px.js", import.meta.url), `// The cast's dialogue portraits side by side (made by cast.mjs from each <name>.clean.json).
// Shared keys: Z lines, E eyes, W/w shirt; the rest are each character's own colours.
pal({ ${[...keyOf].map(([hex, k]) => `${k}: "${hex}"`).join(", ")} })
${sprites.join("\n")}
${CAST.map((n) => `sheet("${n}_portraits", ["${n}_*"], { pad: 2 })`).join("\n")}
`);
console.log("wrote cast.px.js:", sprites.length, "portraits,", keyOf.size, "colours");

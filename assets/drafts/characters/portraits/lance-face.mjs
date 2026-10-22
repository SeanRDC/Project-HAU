// Draws the 3D Lance's face textures: his eight expressions from the sheet (neutral, smile,
// laugh, sad, surprised, worried, annoyed, away), 32 x 36 pixels each, in a strip. The
// texture covers the model's face patch (tools/blender/lance.py, FACE_X and FACE_Z): 7 mm a
// pixel, about the portraits' own density, so in a close-up one texel is one screen pixel.
// The background is his skin colour, the same as the model's skin.
//   node lance-face.mjs   -> src/drafts/aps-godot/models/lance_faces.png and lance-face.px.js
import fs from "fs";
import { writePng } from "./png.mjs";

const W = 32, H = 36;
const PAL = {
  S: "#ecbba1", s: "#cf9580",          // skin, its shadow (the nose, under the lid)
  Z: "#000000",                        // lids and lines
  E: "#2b1a1c", e: "#5a3a36",          // the eye, its lighter lower part
  M: "#8a3b3e", m: "#c96b6b",          // inside an open mouth, the tongue
  B: "#e88f84",                        // blush
  D: "#dff1f6",                        // a sweat drop
};
const EXPRESSIONS = ["neutral", "smile", "laugh", "sad", "surprised", "worried", "annoyed", "away"];
// where things are, in face pixels (row 0 is the top of the patch, at the hairline)
const EYE_X = [8, 23], EYE_Y = 17, BROW_Y = 11, NOSE = [16, 22], MOUTH_Y = 28;

function face(kind) {
  const g = Array.from({ length: H }, () => Array(W).fill("S"));
  const set = (x, y, k) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = k; };
  const line = (pts, k) => pts.forEach(([x, y]) => set(x, y, k));
  // an open eye, like the reference: a small dark oval, 5 wide and `tall` high, with a full
  // black outline, its lower part lighter; over it a thick black lid, wider than the eye,
  // that flicks up at the outer corner. Set wide apart. `look` shifts the eye sideways,
  // `lid` lowers the lid (half-closed).
  const eye = (cx, side, { tall = 7, look = 0, lid = 0 } = {}) => {
    const x0 = cx - 2 + look, top = EYE_Y - Math.floor(tall / 2) + lid, bottom = EYE_Y + Math.ceil(tall / 2);
    for (let y = top; y < bottom; y++) for (let x = x0; x < x0 + 5; x++) {
      const side_ = x === x0 || x === x0 + 4, last = y === bottom - 1;
      if ((last || y === top) && side_) continue;                   // an oval: rounded top and bottom
      set(x, y, side_ || last ? "Z" : y >= bottom - 3 ? "e" : "E");
    }
    const outer = side < 0 ? x0 - 1 : x0 + 5, inner = side < 0 ? x0 + 5 : x0 - 1;
    for (let x = Math.min(outer, inner); x <= Math.max(outer, inner); x++) set(x, top - 1, "Z");
    for (let x = x0; x < x0 + 5; x++) set(x, top - 2, "Z");          // the lid is two pixels thick
    set(inner, top - 1, "S");                                        // ...thinning at the inner end
    set(outer, top - 2, "Z"); set(outer + side, top - 3, "Z");       // the flick at the outer corner
  };
  // a closed, happy eye: an arch
  const happy = (cx) => line([[cx - 2, EYE_Y + 1], [cx - 1, EYE_Y], [cx, EYE_Y - 1], [cx + 1, EYE_Y], [cx + 2, EYE_Y + 1]], "Z");
  // a brow: 5 pixels, tilted (+1 = the inner end up, -1 = the inner end down)
  const brow = (cx, side, tilt = 0, dy = 0) => {
    for (let i = -2; i <= 2; i++) {
      const inner = side < 0 ? i : -i;                              // +2 at the inner end
      set(cx + i, BROW_Y + dy - Math.round((tilt * inner) / 2.5), "E");
    }
  };
  const nose = () => set(NOSE[0], NOSE[1], "s");

  const [L, R] = EYE_X;
  nose();
  switch (kind) {
    case "neutral":
      eye(L, -1); eye(R, 1); brow(L, -1); brow(R, 1);
      line([[15, MOUTH_Y], [16, MOUTH_Y]], "Z");
      break;
    case "smile":
      eye(L, -1, { tall: 6 }); eye(R, 1, { tall: 6 }); brow(L, -1); brow(R, 1);
      line([[14, MOUTH_Y - 1], [15, MOUTH_Y], [16, MOUTH_Y], [17, MOUTH_Y - 1]], "Z");
      break;
    case "laugh":
      happy(L); happy(R); brow(L, -1, 0, -1); brow(R, 1, 0, -1);
      for (const [x, y] of [[13, 24], [14, 24], [15, 24], [16, 24], [17, 24], [18, 24]]) set(x, y, "Z");
      for (let x = 13; x <= 18; x++) set(x, 25, "M");
      for (let x = 14; x <= 17; x++) set(x, 26, x < 16 ? "M" : "m");
      set(15, 27, "m"); set(16, 27, "m");
      for (const cx of [L, R]) for (const [dx, dy] of [[-2, 4], [0, 4], [2, 4]]) { set(cx + dx, EYE_Y + dy, "B"); set(cx + dx + 1, EYE_Y + dy - 1, "B"); }
      break;
    case "sad":
      eye(L, -1, { look: 0, lid: 2 }); eye(R, 1, { lid: 2 }); brow(L, -1, 1.5, 1); brow(R, 1, 1.5, 1);
      line([[14, MOUTH_Y + 1], [15, MOUTH_Y], [16, MOUTH_Y], [17, MOUTH_Y + 1]], "Z");
      break;
    case "surprised":
      eye(L, -1, { tall: 8 }); eye(R, 1, { tall: 8 }); brow(L, -1, 0, -2); brow(R, 1, 0, -2);
      line([[15, MOUTH_Y - 1], [16, MOUTH_Y - 1], [14, MOUTH_Y], [17, MOUTH_Y], [15, MOUTH_Y + 1], [16, MOUTH_Y + 1]], "Z");
      set(15, MOUTH_Y, "M"); set(16, MOUTH_Y, "M");
      break;
    case "worried":
      eye(L, -1, { lid: 1 }); eye(R, 1, { lid: 1 }); brow(L, -1, 1.2, 0); brow(R, 1, 1.2, 0);
      line([[14, MOUTH_Y], [15, MOUTH_Y - 1], [16, MOUTH_Y - 1], [17, MOUTH_Y], [18, MOUTH_Y - 1]], "Z");
      set(15, MOUTH_Y, "M"); set(16, MOUTH_Y, "M");
      set(27, 19, "D"); set(27, 20, "D"); set(26, 21, "D"); set(27, 21, "D"); set(28, 21, "D");
      break;
    case "annoyed":
      eye(L, -1, { lid: 3 }); eye(R, 1, { lid: 3 }); brow(L, -1, -1.5, 1); brow(R, 1, -0.5, 0);
      line([[14, MOUTH_Y], [15, MOUTH_Y], [16, MOUTH_Y], [17, MOUTH_Y + 1]], "Z");
      break;
    case "away":
      eye(L, -1, { look: -2, lid: 1 }); eye(R, 1, { look: -2, lid: 1 }); brow(L, -1, 0.5); brow(R, 1, 0.5);
      line([[14, MOUTH_Y], [15, MOUTH_Y]], "Z");
      break;
  }
  return g;
}

const faces = EXPRESSIONS.map(face);
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const buf = Buffer.alloc(W * EXPRESSIONS.length * H * 4);
faces.forEach((g, n) => g.forEach((row, y) => row.forEach((k, x) => buf.set([...rgb(PAL[k]), 255], (y * W * EXPRESSIONS.length + n * W + x) * 4))));
writePng(new URL("../../../../src/drafts/aps-godot/models/lance_faces.png", import.meta.url), W * EXPRESSIONS.length, H, buf);
fs.writeFileSync(new URL("./lance-face.px.js", import.meta.url), `// The 3D Lance's face textures (made by lance-face.mjs; edit that, not this): ${EXPRESSIONS.join(", ")}.
pal({ ${Object.entries(PAL).map(([k, v]) => `${k}: "${v}"`).join(", ")} })
${faces.map((g, i) => `sprite("lance_face_${EXPRESSIONS[i]}", \`\n${g.map((r) => "  " + r.join("")).join("\n")}\`)`).join("\n")}
`);
console.log("wrote lance_faces.png and lance-face.px.js");

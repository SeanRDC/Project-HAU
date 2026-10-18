// The girlfriend standing still, in both poses:  24 frames at 4 a second, like the other
// characters' idle. She breathes (head and shoulders sink a pixel on the out-breath),
// blinks three times (once a double blink), and the long hair at her sides drifts out in
// a breeze. Hands, skirt, legs and bag stay where they are.
//   gf_idle       hands held together in front (gf.px.js, 34 x 84)
//   gf_arms_idle  the same pose with her arms at her sides (gf-arms.px.js, 34 x 84); her
//                 head is the same pixels, so the eyes are in the same place
include("gf.px.js")
include("gf-arms.px.js")

// a pixel's colour as pxl takes it ("_" erases)
const colour = (v) => ((v & 255) ? "#" + (v >>> 0).toString(16).padStart(8, "0") : "_")
// copy a block of pixels by (dx, dy), reading everything first so nothing is copied twice
const move = (c, x0, y0, x1, y1, dx, dy) => {
  const old = []
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) old.push([x, y, c.get(x, y)])
  for (const [x, y, v] of old) { const tx = x + dx, ty = y + dy; if (tx >= 0 && ty >= 0 && tx < c.w && ty < c.h) c.px(tx, ty, colour(v)) }
}

const BREATH_OUT = [5, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22] // head and shoulders down a pixel
const BLINK = [9, 19, 21]
const BREEZE = [13, 14, 15, 16]

// eyes: [x, width] of each eye, the rows from the upper lash down, the lid's row, skin colour;
// hair: the strands at each side that drift out [x0, y0, x1, y1]
function idle(name, base, { eyes, top, rows, lid, skin, hairLeft, hairRight, chest }) {
  anim(name, { base, frames: 24, fps: 4 }, (c) => {
    const f = c.frame
    if (BLINK.includes(f))
      for (const [x, w] of eyes) { c.rect(x, top, w, rows, skin); c.hline(x, lid, w, "#1d1519") }
    if (BREEZE.includes(f)) {
      move(c, ...hairLeft, -1, 0)
      move(c, ...hairRight, 1, 0)
    }
    if (BREATH_OUT.includes(f)) {
      move(c, 0, 0, c.w - 1, chest, 0, 1)
      for (let x = 0; x < c.w; x++) c.px(x, 0, "_")
    }
  })
}

idle("gf_idle", "gf", { eyes: [[5, 3], [12, 4]], top: 15, rows: 4, lid: 17, skin: "#eba170",
  hairLeft: [1, 28, 3, 41], hairRight: [25, 30, 28, 42], chest: 32 })
idle("gf_arms_idle", "gf_arms", { eyes: [[5, 3], [12, 4]], top: 15, rows: 4, lid: 17, skin: "#eba170",
  hairLeft: [1, 28, 3, 37], hairRight: [25, 30, 28, 42], chest: 32 })

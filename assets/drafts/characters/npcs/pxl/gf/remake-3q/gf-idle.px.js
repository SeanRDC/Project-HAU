// The girlfriend standing still: 24 frames at 4 a second, like the other characters' idle.
// She breathes (head and shoulders sink a pixel on the out-breath), blinks three times (once a
// double blink), and the long hair down her back drifts out in a breeze. Hands, skirt, legs
// and backpack stay where they are. Coordinates are her 35 x 84 sprite (gf.px.js), facing right.
include("gf.px.js")

// a pixel's colour as pxl takes it ("_" erases)
const colour = (v) => ((v & 255) ? "#" + (v >>> 0).toString(16).padStart(8, "0") : "_")
// copy a block of pixels by (dx, dy), reading everything first so nothing is copied twice
const move = (c, x0, y0, x1, y1, dx, dy) => {
  const old = []
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) old.push([x, y, c.get(x, y)])
  for (const [x, y, v] of old) { const tx = x + dx, ty = y + dy; if (tx >= 0 && ty >= 0 && tx < c.w && ty < c.h) c.px(tx, ty, colour(v)) }
}

const BREATH_OUT = [5, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22]
const BLINK = [9, 19, 21]
const BREEZE = [13, 14, 15, 16]
// each eye's box (rows 17-20); shut, it is her skin (A) with a dark lid line across row 19
const EYES = [[21, 23], [29, 31]]

anim("gf_idle", { base: "gf", frames: 24, fps: 4 }, (c) => {
  const f = c.frame
  if (BLINK.includes(f))
    for (const [x0, x1] of EYES) { c.rect(x0, 17, x1 - x0 + 1, 4, "A"); c.hline(x0, 19, x1 - x0 + 1, "a") }
  if (BREEZE.includes(f)) move(c, 1, 22, 6, 44, -1, 0) // the hair down her back
  if (BREATH_OUT.includes(f)) {
    move(c, 0, 0, c.w - 1, 32, 0, 1)
    for (let x = 0; x < c.w; x++) c.px(x, 0, "_")
  }
})

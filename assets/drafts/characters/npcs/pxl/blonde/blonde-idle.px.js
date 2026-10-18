// Blonde short hair standing still: 24 frames at 4 a second, like the other characters'
// idle. She breathes (head and shoulders sink a pixel on the out-breath), blinks three times
// (once a double blink) behind her glasses, and the back of her bob drifts out in a breeze.
// Coordinates are her 33 x 84 sprite (blonde.px.js), facing right.
include("blonde.px.js")

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
// inside each lens of her glasses (the frame, key D, stays; shut, it is her skin, G): [x0, x1], rows 16-20
const LENSES = [[18, 22], [27, 29]]

anim("blonde_idle", { base: "blonde", frames: 24, fps: 4 }, (c) => {
  const f = c.frame
  if (BLINK.includes(f))
    for (const [x0, x1] of LENSES) {
      for (let y = 16; y <= 20; y++) for (let x = x0; x <= x1; x++) if (!c.is(x, y, "D")) c.px(x, y, "G")
      for (let x = x0; x <= x1; x++) if (!c.is(x, 18, "D")) c.px(x, 18, "b")
    }
  if (BREEZE.includes(f)) move(c, 1, 13, 4, 24, -1, 0) // the back of her bob
  if (BREATH_OUT.includes(f)) {
    move(c, 0, 0, c.w - 1, 32, 0, 1)
    for (let x = 0; x < c.w; x++) c.px(x, 0, "_")
  }
})

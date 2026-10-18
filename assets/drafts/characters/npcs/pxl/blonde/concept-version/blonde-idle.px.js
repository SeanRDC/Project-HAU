// Blonde short hair standing still: 24 frames at 4 a second, like the other characters'
// idle. She breathes (head and shoulders sink a pixel on the out-breath), blinks three times
// (once a double blink) behind her glasses, and the back of her bob drifts out in a breeze.
// Coordinates are her 35 x 84 sprite (blonde.px.js), facing right.
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
// each eye behind its lens: the box, and the row the shut lid falls on; the glasses' frame
// (keys w, B, A) stays, everything else in the box becomes skin (C)
const EYES = [{ x0: 17, x1: 21, y0: 16, y1: 19, lid: 18 }, { x0: 25, x1: 29, y0: 15, y1: 18, lid: 17 }]

anim("blonde_idle", { base: "blonde", frames: 24, fps: 4 }, (c) => {
  const f = c.frame
  if (BLINK.includes(f))
    for (const e of EYES) {
      for (let y = e.y0; y <= e.y1; y++) for (let x = e.x0; x <= e.x1; x++) if (!c.is(x, y, "wBA")) c.px(x, y, "C")
      for (let x = e.x0; x <= e.x1; x++) if (!c.is(x, e.lid, "wBA")) c.px(x, e.lid, "a")
    }
  if (BREEZE.includes(f)) move(c, 0, 12, 5, 23, -1, 0) // the back of her bob
  if (BREATH_OUT.includes(f)) {
    move(c, 0, 0, c.w - 1, 32, 0, 1)
    for (let x = 0; x < c.w; x++) c.px(x, 0, "_")
  }
})

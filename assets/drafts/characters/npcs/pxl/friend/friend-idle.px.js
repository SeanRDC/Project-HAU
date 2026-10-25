// The friend standing still, 24 frames at 4 a second like everyone's idle: he breathes (head
// and shoulders sink a pixel on the out-breath), blinks three times and the back of his hair
// drifts in a breeze. Plus his talk-bubble portrait. Coordinates are his 33 x 85 sprite.
include("friend.px.js")

// a pixel's colour as pxl takes it ("_" erases)
const colour = (v) => ((v & 255) ? "#" + (v >>> 0).toString(16).padStart(8, "0") : "_")
// copy a block of pixels by (dx, dy), reading everything first so nothing is copied twice
const move = (c, x0, y0, x1, y1, dx, dy) => {
  const old = []
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) old.push([x, y, c.get(x, y)])
  for (const [x, y, v] of old) { const tx = x + dx, ty = y + dy; if (tx >= 0 && ty >= 0 && tx < c.w && ty < c.h) c.px(tx, ty, colour(v)) }
}

const BREATH_OUT = [5, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22]
const BLINK = [7, 15, 17]
const BREEZE = [11, 12, 13, 14]
// each eye's box, rows 16-18 (his eyes are narrow); shut, it is his skin (z) with the
// dark lid line across row 17
const EYES = [[16, 20, 16], [25, 27, 16]]
const blink = (c) => { for (const [x0, x1, y0] of EYES) { c.rect(x0, y0, x1 - x0 + 1, 19 - y0, "z"); c.hline(x0, 17, x1 - x0 + 1, "K") } }

anim("friend_idle", { base: "friend", frames: 24, fps: 4 }, (c) => {
  const f = c.frame
  if (BLINK.includes(f)) blink(c)
  if (BREEZE.includes(f)) move(c, 2, 9, 8, 26, -1, 0) // the back of his hair, down to the long layers
  if (BREATH_OUT.includes(f)) {
    move(c, 0, 0, c.w - 1, 32, 0, 1)
    for (let x = 0; x < c.w; x++) c.px(x, 0, "_")
  }
})

// The talk bubble's portrait: three 32 x 32 crops round his face, mouth shut, open, blinking.
const FACE = [-2, -3]
sprite("friend_mouth_open", { base: "friend" }, (c) => { c.px(21, 23, "k"); c.px(22, 23, "k"); c.px(21, 24, "q"); c.px(22, 24, "q") })
sprite("friend_blink", { base: "friend" }, (c) => blink(c))
sprite("friend_portrait", { w: 96, h: 32 },
  stamp("friend", FACE[0], FACE[1]),
  stamp("friend_mouth_open", 32 + FACE[0], FACE[1]),
  stamp("friend_blink", 64 + FACE[0], FACE[1]),
  // keep each crop to its own 32 px
  rect(30, 0, 2, 32, "_"), rect(62, 0, 2, 32, "_"),
)

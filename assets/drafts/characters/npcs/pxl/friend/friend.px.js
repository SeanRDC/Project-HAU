// The player's friend (the one in the opening): drawn over the redesigned player boy
// (boy/pxl-new/boy.px.js), so he has the same body, size and style. Black curtain hair
// parted in the middle, a black hoodie with the hood bunched at his neck and long sleeves,
// and a navy backpack instead of the maroon one. 33 x 85, like the boy.
include("../../../boy/pxl-new/boy.px.js")
pal({
  // hair: darkest, base, mid, sheen
  K: "#121016", H: "#1f1b24", J: "#2e2934", L: "#463f4e",
  // hoodie: base, shadow, deep, light, drawstring
  P: "#2b2a32", Q: "#212026", R: "#17161b", S: "#3a3943", T: "#a9a6b0",
  // backpack: navy darkest to lightest
  U: "#141a2c", V: "#1d2640", W: "#283456", X: "#36456e",
})

// The hair, row by row: runs of [from x, to x, key]. Rows 0-13 are all hair and forehead
// (anything not listed is cleared); from row 14 only the runs listed change, the face stays.
const CLEAR_TO = 13
// A wolf cut: choppy tufts on the crown, layers marked with dark strand breaks and light
// on each layer's top, curtain bangs from the middle parting, jagged shaggy sides, and the
// longer wispy layers of the back falling down behind his neck.
const HAIR = [
  [[11, 13, "K"], [16, 18, "K"], [22, 23, "K"]],
  [[9, 10, "K"], [11, 13, "H"], [14, 15, "K"], [16, 18, "J"], [19, 21, "K"], [22, 23, "H"], [24, 24, "K"]],
  [[7, 8, "K"], [9, 24, "H"], [25, 26, "K"], [10, 12, "J"], [16, 19, "L"]],
  [[5, 6, "K"], [7, 26, "H"], [27, 27, "K"], [8, 11, "J"], [13, 17, "L"], [22, 25, "J"]],
  [[4, 4, "K"], [5, 27, "H"], [28, 28, "K"], [6, 9, "J"], [10, 13, "L"], [20, 22, "J"], [24, 26, "L"]],
  [[3, 3, "K"], [4, 28, "H"], [29, 29, "K"], [5, 7, "J"], [8, 10, "L"], [18, 19, "J"], [25, 27, "J"]],
  [[3, 3, "K"], [4, 29, "H"], [30, 30, "K"], [5, 6, "J"], [15, 17, "J"], [22, 23, "J"], [26, 28, "L"]],
  [[2, 2, "K"], [3, 29, "H"], [30, 30, "K"], [4, 5, "J"], [19, 20, "J"], [27, 28, "L"]],
  // the parting, then the forehead between the curtain bangs as an upside-down V
  [[2, 2, "K"], [3, 20, "H"], [21, 22, "K"], [23, 29, "H"], [30, 31, "K"], [17, 19, "J"], [27, 28, "L"]],
  [[2, 2, "K"], [3, 19, "H"], [20, 20, "K"], [21, 22, "z"], [23, 23, "K"], [24, 30, "H"], [31, 31, "K"], [4, 4, "J"], [17, 18, "J"], [25, 26, "J"], [28, 29, "J"]],
  [[3, 3, "K"], [4, 18, "H"], [19, 19, "K"], [20, 23, "z"], [24, 24, "K"], [25, 30, "H"], [31, 31, "K"], [16, 17, "J"], [26, 27, "J"]],
  [[3, 3, "K"], [4, 17, "H"], [18, 18, "K"], [19, 24, "z"], [25, 25, "K"], [26, 29, "H"], [30, 30, "K"], [15, 16, "J"], [27, 28, "J"]],
  [[2, 2, "K"], [3, 16, "H"], [17, 17, "K"], [18, 25, "z"], [26, 26, "K"], [27, 29, "H"], [30, 30, "K"], [14, 15, "J"], [28, 28, "J"]],
  [[2, 2, "K"], [3, 15, "H"], [16, 16, "K"], [17, 26, "z"], [27, 27, "K"], [28, 30, "H"], [31, 31, "K"]],
  // the curtains' ends, the shaggy sides and the back of his head behind the ear
  [[2, 2, "K"], [3, 13, "H"], [14, 15, "K"], [28, 30, "H"], [31, 31, "K"], [32, 32, "_"]],
  [[2, 2, "K"], [3, 12, "H"], [13, 13, "K"], [28, 29, "H"], [30, 30, "K"]],
  [[3, 3, "K"], [4, 12, "H"], [13, 13, "K"], [28, 28, "H"], [29, 29, "K"]],
  [[3, 3, "K"], [4, 6, "H"], [12, 13, "H"], [28, 28, "K"]],
  [[2, 2, "K"], [3, 6, "H"], [7, 7, "K"], [12, 13, "H"]],
  [[2, 2, "K"], [3, 6, "H"], [7, 7, "K"]],
  [[3, 3, "K"], [4, 6, "H"], [7, 7, "K"]],
  // the long wispy layers of the back, down behind his neck
  [[3, 3, "K"], [4, 7, "H"]],
  [[3, 3, "K"], [4, 7, "H"], [8, 8, "K"]],
  [[4, 4, "K"], [5, 8, "H"], [9, 9, "K"]],
  [[4, 4, "K"], [5, 7, "H"], [8, 8, "K"]],
  [[5, 5, "K"], [6, 6, "H"], [7, 7, "K"]],
  [[5, 5, "K"]],
]
// The layers: each a dark break with light just above it, falling from the crown out and
// down the way a wolf cut's layers do (polylines of [x, y]).
const LAYERS = [
  [[14, 3], [12, 7], [10, 11], [9, 15]],
  [[10, 4], [7, 8], [5, 12], [4, 17]],
  [[17, 4], [16, 7], [15, 10]],
  [[6, 13], [5, 18], [5, 22]],
  [[24, 3], [26, 6], [28, 10]],
]

sprite("friend", { base: "boy" },
  // the polo becomes the hoodie (long sleeves down to the wrists), the bag goes navy
  recolor({ E: "P", D: "P", C: "S", B: "Q", A: "R" }, [5, 26, 23, 24]),
  recolor({ v: "P", x: "P", w: "S", z: "P" }, [6, 42, 5, 10]),
  recolor({ v: "Q", x: "P", w: "P", z: "P" }, [23, 42, 4, 10]),
  recolor({ e: "U", i: "U", l: "V", n: "W", r: "X" }),
  recolor({ v: "X", u: "W" }, [0, 28, 6, 14]), // the bag's top handle
  recolor({ j: "U", f: "U", k: "V", m: "V", p: "V", o: "W", u: "W", w: "X" }, [21, 28, 3, 18]), // the strap on his front shoulder
  (c) => {
    for (let y = 0; y < HAIR.length; y++) {
      if (y <= CLEAR_TO) for (let x = 0; x < c.w; x++) c.px(x, y, "_")
      for (const [x0, x1, key] of HAIR[y]) for (let x = x0; x <= x1; x++) c.px(x, y, key)
    }
    // the layers' breaks, lit along their upper side
    for (const line of LAYERS) for (let i = 0; i + 1 < line.length; i++) {
      const [x0, y0] = line[i], [x1, y1] = line[i + 1], steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))
      for (let s = 0; s <= steps; s++) {
        const x = Math.round(x0 + (x1 - x0) * s / steps), y = Math.round(y0 + (y1 - y0) * s / steps)
        c.px(x, y, "K"); if (y > 0) c.px(x + (x1 > x0 ? -1 : 1), y, "J")
      }
    }
    // the boy's brown hair left under the jaw and at the back of the neck, now his black nape
    for (const [x, y, key] of [[9, 22, "H"], [10, 22, "H"], [11, 22, "K"], [9, 24, "H"], [10, 24, "H"], [11, 24, "K"], [8, 25, "K"],
      // the boy's brown edges behind the ear, jaw and neck: his black hair, down to the hood
      [7, 17, "K"], [8, 21, "K"], [10, 23, "H"], [11, 23, "H"], [12, 23, "K"], [12, 24, "K"],
      [9, 25, "H"], [10, 25, "H"], [11, 25, "H"], [12, 25, "K"],
      // a grey pants pixel sticking out behind his left heel
      [5, 80, "f"],
      // a brown pixel left on the bag's top edge
      [3, 31, "U"]])
      c.px(x, y, key)
    // the polo's short-sleeve hem left a dark line across the hoodie's sleeves
    for (let x = 5; x <= 10; x++) c.px(x, 41, "P")
    c.px(24, 41, "P"); c.px(25, 41, "P")
    // light along each curtain's inner edge, so the middle parting reads
    for (const [x, y] of [[19, 9], [18, 10], [17, 11], [16, 12], [15, 13], [24, 9], [25, 10], [26, 11], [27, 12], [20, 8], [23, 8]])
      c.px(x, y, "L")
    // his own eyes, not the boy's: narrower and half-lidded under a heavy lash line, the
    // irises dark, and level brows with a soft arch (relaxed, not cross)
    const FACE = {
      14: { 16: "z", 17: "K", 18: "K", 19: "K", 20: "K", 21: "z", 22: "z", 23: "z", 24: "z", 25: "K", 26: "K", 27: "K" },
      15: { 14: "x", 15: "z", 16: "K", 17: "z", 18: "z", 19: "z", 20: "z", 21: "z", 22: "z", 23: "z", 24: "z", 25: "z", 26: "z", 27: "z" },
      16: { 14: "z", 15: "z", 16: "K", 17: "K", 18: "K", 19: "K", 20: "K", 21: "z", 22: "z", 23: "z", 24: "z", 25: "K", 26: "K", 27: "K" },
      17: { 14: "z", 15: "z", 16: "D", 17: "C", 18: "j", 19: "K", 20: "k", 21: "z", 22: "z", 23: "z", 24: "z", 25: "j", 26: "K", 27: "C" },
      18: { 14: "z", 15: "z", 16: "z", 17: "D", 18: "j", 19: "K", 20: "q", 21: "z", 22: "z", 23: "z", 24: "z", 25: "k", 26: "j", 27: "D" },
      19: { 12: "z", 13: "z", 14: "z", 15: "z", 16: "z", 17: "z", 18: "z", 19: "z", 20: "z", 21: "z", 22: "z", 23: "z", 24: "z", 25: "z", 26: "z", 27: "z" },
    }
    for (const y in FACE) for (const x in FACE[y]) c.px(+x, +y, FACE[y][x])
    // the crew neck with the hood bunched behind it, round where the polo's collar was
    for (const [x, y, key] of [
      [11, 26, "R"], [12, 26, "Q"], [13, 26, "Q"], [17, 26, "Q"], [18, 26, "Q"], [19, 26, "R"],
      [10, 27, "R"], [11, 27, "Q"], [12, 27, "P"], [13, 27, "P"], [14, 27, "Q"], [18, 27, "Q"], [19, 27, "P"], [20, 27, "P"], [21, 27, "R"],
      [14, 28, "R"], [15, 28, "Q"], [16, 28, "Q"], [17, 28, "Q"], [18, 28, "R"],
      [15, 29, "P"], [16, 29, "P"], [17, 29, "P"], [18, 29, "P"],
    ]) c.px(x, y, key)
    // drawstrings with their metal tips
    for (let y = 29; y <= 34; y++) c.px(15, y, "T")
    for (let y = 29; y <= 33; y++) c.px(18, y, "T")
    c.px(15, 35, "A"); c.px(18, 34, "A")
    // the front pocket's seam and the ribbed cuffs and hem
    for (let x = 12; x <= 21; x++) c.px(x, 44, "R")
    for (let x = 7; x <= 10; x++) c.px(x, 51, "R")
    for (let x = 23; x <= 26; x++) c.px(x, 51, "R")
  },
)

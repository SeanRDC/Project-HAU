// Mascot draft (2026-11-14): a doodle Ysha drew in ballpen on a handout, come to life.
// Paper-white blob, a paper boat for a hat, stick limbs, hands she can't draw.
// Build: node <pxl>/bin/pxl.js build mascot.px.js   (see ../README.md)
pal({
  w: "#f6f0e6", // paper
  s: "#d6cab8", // paper in shade
  n: "#2e2d42", // ballpen ink
  o: "#d4935f", // cheeks: the orange of Ysha's lanyard
  l: "#9fb0c8", // the handout's ruled line, showing on the folded hat
  b: "#d9cdbc", // the cast's wall
})

// --- concept, 64 x 64 ---------------------------------------------------------------
const body = [
  ellipse(31, 41, 16, 14, "w"),
  ellipse(33, 46, 13, 8, "s"), ellipse(31, 43, 14, 9, "w"),      // a little shade under the belly
]
const hat = [
  poly([31, 5, 20, 21, 43, 21], "w"),                              // the sail
  poly([14, 19, 49, 19, 44, 26, 19, 26], "w"),                     // the hull, worn as a brim
  line(31, 6, 31, 19, "s"), hline(21, 22, 21, "l"),                // the fold, and one ruled line
]
const face = [
  rect(24, 37, 3, 3, "n"), rect(36, 37, 3, 3, "n"),                // dot eyes
  px(24, 37, "w"), px(36, 37, "w"),
  rect(20, 42, 4, 2, "o"), rect(39, 42, 4, 2, "o"),                // cheeks
  px(30, 43, "n"), px(31, 44, "n"), px(32, 44, "n"), px(33, 43, "n"),   // a small smile
]
const limbs = [
  line(16, 42, 8, 35, "n"), line(47, 43, 55, 49, "n"),             // arms: one up, one down
  line(26, 54, 25, 59, "n"), line(37, 54, 38, 59, "n"),            // legs
  hline(22, 60, 4, "n"), hline(38, 60, 4, "n"),                    // feet
  // the hands: she can't draw hands. One is a mitten with three fat fingers,
  // the other a ball with five too-small ones.
  circ(7, 33, 3, "w"), rect(3, 28, 2, 3, "w"), rect(6, 27, 2, 3, "w"), rect(10, 28, 2, 3, "w"),
  circ(57, 51, 3, "w"), px(54, 55, "w"), px(56, 56, "w"), px(58, 56, "w"), px(60, 55, "w"), px(61, 53, "w"),
]
sprite("mascot_concept", { w: 64, h: 64, outline: "n" }, ...limbs, ...body, ...hat, ...face)
scene("mascot_on_wall", { w: 68, h: 68, bg: "b" }, stamp("mascot_concept", 2, 2))

// --- in the world, 16 x 18: what follows Lance about --------------------------------
sprite("mascot_world", { outline: "n" }, `
  ......w......
  .....www.....
  ....wwwww....
  .wwwwlllwwww.
  ...nnnnnnn...
  ...wwwwwww...
  ..wnwwwwwnw..
  ..owwwnwwwo..
  ..wwwwwwwww..
  ...swwwwws...
  ....n...n....`)
scene("mascot_world_on_wall", { w: 24, h: 24, bg: "b" }, stamp("mascot_world", 5, 6))

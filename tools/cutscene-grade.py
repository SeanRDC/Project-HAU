# Recolours a pixel-art portrait to the cutscene cast's look (assets/drafts/characters/
# cutscene-art/): warm sepia, soft brown lines, no eye whites. For pictures whose own
# colours differ from the cast's (Paeng's sources are pink and purple-tinted with
# near-black outlines). Works on the picture's palette, so no pixel moves.
#   python tools/cutscene-grade.py <in.png> <out.png> --eyes=x1,y1,x2,y2 [--older]
# --eyes: a box round both eyes (below the brows); anything as light as an eye white inside
#         it becomes skin and the iris the cast's brown, as their eyes are a dark lid line
#         over a brown iris. --older: the deeper skin of
#         the ten-years-later pictures.
# Each colour is placed on one of three ramps by its brightness (the skin ramps are level
# across the main skin tone, so two near shades of it become one and the face is not mottled). The ramps' colours are
# the cast's own, read from lance, pat, ysha and their -older pictures.
import sys
import numpy as np
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict((a[2:].split("=", 1) + [""])[:2] for a in sys.argv[1:] if a.startswith("--"))
inp, out = args
LUM = np.array([0.299, 0.587, 0.114])
# (brightness in the source, colour in the cast)
NEUTRAL = [(20, (45, 32, 26)), (30, (50, 36, 29)), (40, (57, 41, 34)), (51, (67, 51, 44)), (68, (80, 62, 54)),
           (85, (115, 88, 79)), (150, (175, 150, 135)), (200, (205, 185, 166)), (221, (217, 205, 188)), (255, (222, 211, 195))]
SKIN = [(50, (80, 42, 30)), (70, (99, 52, 36)), (97, (127, 65, 41)), (114, (160, 79, 48)), (130, (177, 104, 63)),
        (148, (192, 113, 65)), (157, (206, 140, 93)), (178, (206, 140, 93)), (205, (218, 180, 150)), (255, (220, 195, 172))]
SKIN_OLDER = [(50, (75, 38, 24)), (70, (93, 44, 26)), (97, (121, 57, 32)), (114, (150, 76, 44)), (129, (176, 93, 51)),
              (148, (190, 112, 66)), (155, (203, 130, 80)), (178, (203, 130, 80)), (205, (216, 178, 146)), (255, (220, 195, 172))]
IRIS = [(121, 57, 32), (93, 44, 26)]   # the cast's brown eyes, light and dark; already cast colours, so not graded again
BLUE = [(30, (38, 36, 50)), (50, (46, 45, 66)), (65, (60, 60, 86)), (90, (84, 84, 110)), (255, (160, 160, 180))]

def ramp(r, l):
    xs = [x for x, _ in r]
    return np.array([np.interp(l, xs, [c[k] for _, c in r]) for k in range(3)])

def grade(c):
    r, g, b = (int(v) for v in c)
    l = float((np.array(c) * LUM).sum())
    if b > r + 12:
        return ramp(BLUE, l)
    if max(r, g, b) - min(r, g, b) > 34 and r - b > 34:
        return ramp(SKIN_OLDER if "older" in opts else SKIN, l)
    return ramp(NEUTRAL, l)

im = np.asarray(Image.open(inp).convert("RGB")).astype(np.int32)
res = im.copy()
cols = np.unique(im.reshape(-1, 3), axis=0)
skin = max((c for c in cols if c[0] - c[2] > 34), key=lambda c: (im == c).all(2).sum())
if opts.get("eyes"):
    x1, y1, x2, y2 = map(int, opts["eyes"].split(","))
    box = res[y1:y2, x1:x2]
    bl = (box * LUM).sum(2)
    iris = (box.max(2) - box.min(2) > 34) & (bl < 120)       # the coloured part of the eye, brown or purple
    box[bl > 185] = skin
    box[iris & (bl >= 70)] = IRIS[0]
    box[iris & (bl < 70)] = IRIS[1]
    fixed = np.zeros(res.shape[:2], bool)
    fixed[y1:y2, x1:x2] = iris
else:
    fixed = np.zeros(res.shape[:2], bool)
# a light speck (6 pixels or fewer of one colour) touching skin is a gap seen past an ear or a
# strand, too small to read as anything but a wrong pixel: make it skin
Hh, Ww = res.shape[:2]
bright = (res * LUM).sum(2) > 185
warm = (res[:, :, 0] - res[:, :, 2] > 34) & ~bright
seen = np.zeros((Hh, Ww), bool)
for y, x in zip(*np.nonzero(bright)):
    if seen[y, x]:
        continue
    comp = [(y, x)]; seen[y, x] = True; k = 0
    while k < len(comp) and len(comp) <= 6:
        cy, cx = comp[k]; k += 1
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < Hh and 0 <= nx < Ww and not seen[ny, nx] and (res[ny, nx] == res[y, x]).all():
                    seen[ny, nx] = True; comp.append((ny, nx))
    if len(comp) <= 6 and any(warm[max(cy - 1, 0):cy + 2, max(cx - 1, 0):cx + 2].any() for cy, cx in comp):
        for cy, cx in comp:
            res[cy, cx] = skin
src = res.copy()
for c in np.unique(src.reshape(-1, 3), axis=0):
    res[(src == c).all(2) & ~fixed] = np.rint(grade(c)).astype(np.int32)
Image.fromarray(res.astype(np.uint8)).save(out)
print("saved", out, "colours", len(np.unique(res.reshape(-1, 3), axis=0)))

# Turns a picture that is already drawn like pixel art into true pixel art at a set size,
# on this computer (no PixelLab). Stand-in for tools/pixellab-convert.mjs --size when
# there are no credits. Needs Python with Pillow and numpy.
#   python tools/pixelart-local.py <in.png> <out.png> [--size=256x384] [--colors=36] [--merge=12]
# --merge: shades closer than this become one (lower keeps more tone steps in hair and cloth).
#
# Shrinking by averaging blends two colours where they meet (dark hair on a light wall
# becomes orange and blue specks), so nothing here averages:
#  1. palette: from the flat parts of the picture only, shades closer than MERGE joined
#  2. each output pixel is the most common palette colour among the flat pixels of its
#     cell (looking a little past the cell when it sits on an edge)
#  3. a line thinner than about two cells (a mouth, an eyelid, the edge of a face, a collar
#     stripe) is found in the picture first and then drawn one pixel wide where most of
#     it falls. Voting alone drops such a line wherever it straddles two cells, and it
#     comes out broken and ragged.
#  4. clean-up: tiny patches whose brightness sits between a much lighter and a much
#     darker neighbour are leftover blends and join the nearer one; a single pixel no
#     neighbour shares joins a neighbour close to it in colour
import sys
import numpy as np
from PIL import Image, ImageFilter

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opts = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--"))
inp, out = args
OW, OH = map(int, opts.get("size", "256x384").split("x"))
NCOL = int(opts.get("colors", 36))
BASE, FAR = 22, 26                 # area colours, and how far a missed colour must be from them
MERGE, MERGE_LUM = float(opts.get("merge", 12)), 0.07        # shades this close are joined; light colours (skin, wall) more readily
FLAT = 24                          # most a pixel's 3x3 may vary and still count as flat
THIN = 28                          # how much darker or lighter than what is round it a thin line is
LINE_SOME = 0.22                   # a cell needs at least this share of line in it to be drawn as line
LUM = np.array([0.299, 0.587, 0.114])

a = np.asarray(Image.open(inp).convert("RGB")).astype(np.int32)
H, W, _ = a.shape
SPAN = 2 * round(W / OW) + 1          # lines up to about two cells wide count as thin
lum_a = (a * LUM).sum(2)
pad = np.pad(a, ((1, 1), (1, 1), (0, 0)), mode="edge")
stack = np.stack([pad[dy:dy + H, dx:dx + W] for dy in range(3) for dx in range(3)])
flat = (stack.max(0) - stack.min(0)).sum(2) < FLAT
del stack, pad

def nearest(px, pal):
    res = np.empty(px.shape[:-1], np.int32)
    flatpx = px.reshape(-1, 3)
    o = res.reshape(-1)
    for i in range(0, len(flatpx), 200000):
        o[i:i + 200000] = ((flatpx[i:i + 200000, None, :] - pal[None]) ** 2).sum(2).argmin(1)
    return res

# 1. palette
fa = a[flat]
base = Image.fromarray(fa.astype(np.uint8).reshape(1, -1, 3)).quantize(BASE, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
pal = np.unique(np.array(base.getpalette()[:BASE * 3]).reshape(-1, 3).astype(np.int32), axis=0)
uq, cnt = np.unique((fa // 8) * 8 + 4, axis=0, return_counts=True)
for i in np.argsort(-cnt):
    if cnt[i] < 150 or len(pal) >= NCOL + 12:
        break
    if ((pal - uq[i]) ** 2).sum(1).min() > FAR ** 2:
        pal = np.vstack([pal, uq[i]])
use = np.bincount(nearest(fa, pal), minlength=len(pal))
keep = []
for i in np.argsort(-use):                      # commonest first; a close shade joins it
    if use[i] and all(((pal[i] - pal[k]) ** 2).sum() > (MERGE + MERGE_LUM * (pal[i] * LUM).sum()) ** 2 for k in keep):
        keep.append(i)
pal = pal[keep[:NCOL]]
n = len(pal)
lum_p = (pal * LUM).sum(1)
idx = nearest(a, pal)

# 3 first: which pixels belong to a thin line. A closing (max then min) of the brightness
# fills in anything dark and narrower than SPAN; what it filled in is the dark lines.
# Wide shapes come back unchanged, so the edge of the hair is not a line.
L8 = Image.fromarray(np.clip(lum_a, 0, 255).astype(np.uint8))
closed = np.asarray(L8.filter(ImageFilter.MaxFilter(SPAN)).filter(ImageFilter.MinFilter(SPAN))).astype(np.int32)
opened = np.asarray(L8.filter(ImageFilter.MinFilter(SPAN)).filter(ImageFilter.MaxFilter(SPAN))).astype(np.int32)
L = np.asarray(L8).astype(np.int32)
feat = {"dark": closed - L > THIN, "light": L - opened > THIN}
body = flat & ~feat["dark"] & ~feat["light"]

# 2. one colour per cell, and how much of each cell is line
xs = np.rint(np.linspace(0, W, OW + 1)).astype(int)
ys = np.rint(np.linspace(0, H, OH + 1)).astype(int)
res = np.zeros((OH, OW), np.int32)
cov = {k: np.zeros((OH, OW)) for k in feat}
col = {k: np.zeros((OH, OW), np.int32) for k in feat}
for oy in range(OH):
    y1, y2 = ys[oy], max(ys[oy + 1], ys[oy] + 1)
    for ox in range(OW):
        x1, x2 = xs[ox], max(xs[ox + 1], xs[ox] + 1)
        ci = idx[y1:y2, x1:x2].ravel()
        cb = body[y1:y2, x1:x2].ravel()
        if cb.sum() >= 2:
            votes = ci[cb]
        else:
            wy1, wy2, wx1, wx2 = max(y1 - 2, 0), min(y2 + 2, H), max(x1 - 2, 0), min(x2 + 2, W)
            wi = idx[wy1:wy2, wx1:wx2].ravel()
            wb = body[wy1:wy2, wx1:wx2].ravel()
            votes = wi[wb] if wb.sum() >= 2 else ci
        res[oy, ox] = np.bincount(votes, minlength=n).argmax()
        for k in feat:
            m = feat[k][y1:y2, x1:x2].ravel()
            if m.any():
                cov[k][oy, ox] = m.mean()
                cl = lum_a[y1:y2, x1:x2].ravel()[m]
                core = cl <= np.median(cl) if k == "dark" else cl >= np.median(cl)   # the line's own colour, not its soft edge
                col[k][oy, ox] = ((pal - a[y1:y2, x1:x2].reshape(-1, 3)[m][core].mean(0)) ** 2).sum(1).argmin()

# 3. draw the lines one pixel wide: a cell is line only when it holds more of the line
# than the cells on either side of it. A drawn line is often a cell and a half wide;
# counting every cell that is mostly line ("0.45 or more") made those two pixels wide
# and every outline heavy, so there is no such shortcut.
for k in ("light", "dark"):                      # dark lines last: they go over light ones
    c = cov[k]
    p = np.pad(c, 1)
    up, down, left, right = p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]
    along_x = left + right > up + down           # the line runs left to right here
    peak = np.where(along_x, (c > up) & (c >= down), (c > left) & (c >= right))
    line = (c >= LINE_SOME) & peak
    drawn = np.where(line, col[k], res)
    if k == "light":                             # a light dot touching nothing of its own colour is a gap seen through, not a line
        q = np.pad(drawn, 1, constant_values=-1)
        alone = np.all([q[1 + dy:1 + dy + OH, 1 + dx:1 + dx + OW] != drawn for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx], axis=0)
        line &= ~alone
    res = np.where(line, col[k], res)

# 4. clean-up
for _ in range(2):
    seen = np.zeros((OH, OW), bool)
    for y in range(OH):
        for x in range(OW):
            if seen[y, x]:
                continue
            c = res[y, x]
            comp = [(y, x)]
            seen[y, x] = True
            k = 0
            while k < len(comp) and len(comp) <= 8:
                cy, cx = comp[k]
                k += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < OH and 0 <= nx < OW and not seen[ny, nx] and res[ny, nx] == c:
                        seen[ny, nx] = True
                        comp.append((ny, nx))
            if len(comp) > 8:
                continue
            nbs = {res[cy + dy, cx + dx] for cy, cx in comp for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                   if 0 <= cy + dy < OH and 0 <= cx + dx < OW and res[cy + dy, cx + dx] != c}
            if not nbs:
                continue
            lo = min(nbs, key=lambda i: lum_p[i])
            hi = max(nbs, key=lambda i: lum_p[i])
            if lum_p[hi] - lum_p[lo] > 150 and lum_p[lo] + 12 < lum_p[c] < lum_p[hi] - 12:
                t = lo if lum_p[c] - lum_p[lo] < lum_p[hi] - lum_p[c] else hi
                for cy, cx in comp:
                    res[cy, cx] = t
for _ in range(2):
    p = np.pad(res, 1, mode="edge")
    nb = np.stack([p[1 + dy:1 + dy + OH, 1 + dx:1 + dx + OW] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx])
    lone = (nb != res[None]).all(0)
    dist = ((pal[nb] - pal[res][None]) ** 2).sum(3)
    near = dist.argmin(0)[None]
    res = np.where(lone & (np.take_along_axis(dist, near, 0)[0] < 45 ** 2), np.take_along_axis(nb, near, 0)[0], res)

img = Image.fromarray(pal[res].astype(np.uint8))
img.save(out)
k = res
c = k[1:-1, 1:-1]
lone = int(((c != k[:-2, 1:-1]) & (c != k[2:, 1:-1]) & (c != k[1:-1, :-2]) & (c != k[1:-1, 2:])).sum())
print("saved", out, img.size, "colours", len(np.unique(res)), "lone pixels", lone)

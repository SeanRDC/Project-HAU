using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text;

// The boy as a small rig cut from his reference: head (with a crown of hair that
// trails the head), torso and backpack, two arms that swing from the shoulders,
// and two legs drawn from code so both are always the same width.
public static class Rig
{
    const int W = 64, H = 96;
    static int[,] reference;
    static List<int[]> nearUpper = new List<int[]>(), nearLower = new List<int[]>();
    static List<int[]> farUpper = new List<int[]>(), farLower = new List<int[]>();
    static int[,] torso = new int[W, H];
    static int[,] pack = new int[W, H]; // the backpack body, which bounces a frame late
    static int[,] head = new int[W, H];

    // pivots in the reference (continuous pixel coordinates)
    static readonly PointF NearShoulder = new PointF(22.5f, 41.5f), NearElbow = new PointF(22.5f, 53f);
    static readonly PointF FarShoulder = new PointF(41.5f, 41.5f), FarElbow = new PointF(41.5f, 53f);
    const float HipY = 62f, Thigh = 12f, Shin = 12f;
    const float NearHipX = 28.5f, FarHipX = 35.5f;
    const int CrownBottom = 17; // hair rows that trail the head

    static int Rgb(int r, int g, int b) { return Color.FromArgb(255, r, g, b).ToArgb(); }
    // palette (from his own sprite)
    static readonly int PantsOutline = Rgb(0x11, 0x11, 0x14), PantsBase = Rgb(0x2e, 0x2e, 0x36), PantsShade = Rgb(0x1b, 0x1b, 0x20), PantsLight = Rgb(0x4a, 0x4a, 0x56), PantsCrease = Rgb(0x40, 0x40, 0x4b);
    static readonly int FarBase = Rgb(0x1d, 0x1d, 0x23), FarShade = Rgb(0x14, 0x14, 0x18), FarLight = Rgb(0x2e, 0x2e, 0x36), FarCrease = Rgb(0x28, 0x28, 0x2f);
    static readonly int SoleEdge = Rgb(0x3c, 0x20, 0x14);
    static readonly int ShoeOutline = Rgb(0x11, 0x0e, 0x11), ShoeBase = Rgb(0x22, 0x1b, 0x1f), ShoeShade = Rgb(0x1a, 0x15, 0x19), ShoeLight = Rgb(0x4c, 0x2b, 0x1c), ShoeShine = Rgb(0x57, 0x32, 0x20);
    static readonly int SleeveBase = Rgb(0xe5, 0xc8, 0xbb), SleeveLight = Rgb(0xec, 0xd4, 0xc8), SleeveShade = Rgb(0xc4, 0xa8, 0xa6), SleeveCuff = Rgb(0xd6, 0xb9, 0xb0), SleeveOutline = Rgb(0xa8, 0x88, 0x86);
    static readonly int SkinBase = Rgb(0xd6, 0x88, 0x58), SkinLight = Rgb(0xea, 0x9c, 0x62), SkinShade = Rgb(0xc2, 0x76, 0x4e), SkinOutline = Rgb(0xa8, 0x58, 0x40);
    static readonly int FarArmShade = Rgb(0xc2, 0x76, 0x4e);
    static readonly int Skin = Rgb(0xdd, 0x90, 0x5e), Lash = Rgb(0x23, 0x18, 0x19), PackSide = Rgb(0x60, 0x18, 0x18);

    static bool InHead(int x, int y) { return y <= 34 || (y == 35 && x >= 28 && x <= 37); }
    static bool IsSleeve(Color c) { return c.R >= 180 && c.G >= 150 && c.B >= 140; }
    static bool IsSkin(Color c) { return c.R >= 150 && c.B <= 135 && c.R - c.B >= 50; }

    static void Cut(string path)
    {
        reference = new int[W, H];
        using (var im = new Bitmap(path))
            for (int y = 0; y < H; y++)
                for (int x = 0; x < W; x++)
                {
                    var c = im.GetPixel(x, y);
                    reference[x, y] = c.A >= 128 ? c.ToArgb() : 0;
                }
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                int v = reference[x, y];
                if (v == 0) continue;
                var c = Color.FromArgb(v);
                if (InHead(x, y)) { head[x, y] = v; continue; }
                // arms: everything light between the backpack and the straps
                // (the straps, backpack and outlines are dark and stay on the torso)
                bool light = 0.3 * c.R + 0.59 * c.G + 0.11 * c.B > 95;
                bool near = light && x >= 19 && x <= (y >= 61 ? 25 : 24) && y >= 40 && y <= 66; // the hand reaches x 25
                bool far = light && x >= 39 && x <= 44 && y >= 40 && y <= 66;
                if (near) { (y < 53 ? nearUpper : nearLower).Add(new[] { x, y, v }); continue; }
                if (far)
                {
                    // the pale strip down the far forearm was sunset light: shaded skin
                    if (y >= 52 && c.G > 170) v = FarArmShade;
                    (y < 53 ? farUpper : farLower).Add(new[] { x, y, v });
                    continue;
                }
                // torso: everything down to the belt, and the backpack's bottom
                if (y <= 60 || (x <= 21 && y <= 64)) torso[x, y] = v;
            }
        // The far arm is mostly hidden in his drawing (a 3 px strip), so it would look
        // like a stick once it swings out. It is his near arm instead, a shade darker.
        farUpper.Clear(); farLower.Clear();
        int shift = (int)(FarShoulder.X - NearShoulder.X);
        foreach (var p in nearUpper) farUpper.Add(new[] { p[0] + shift, p[1], Darken(p[2], 0.88) });
        foreach (var p in nearLower) farLower.Add(new[] { p[0] + shift, p[1], Darken(p[2], 0.88) });
        // behind the near arm is the side of the backpack
        for (int y = 40; y <= 60; y++)
            for (int x = 19; x <= 24; x++)
                if (torso[x, y] == 0 && reference[x, y] != 0) torso[x, y] = PackSide;
        for (int y = 37; y < H; y++)
            for (int x = 0; x <= 18; x++)
                if (torso[x, y] != 0) { pack[x, y] = torso[x, y]; torso[x, y] = 0; }
    }

    // Rotates a sprite about a pivot and stamps it, choosing each pixel by the
    // most common colour of 4x4 samples so thin lines survive the turn.
    static void Stamp(int[,] dst, List<int[]> sprite, PointF pivotSrc, PointF pivotDst, double deg)
    {
        if (sprite.Count == 0) return;
        var map = new Dictionary<long, int>();
        int minx = 999, miny = 999, maxx = -999, maxy = -999;
        foreach (var p in sprite)
        {
            map[(long)p[0] * 1000 + p[1]] = p[2];
            minx = Math.Min(minx, p[0]); maxx = Math.Max(maxx, p[0]);
            miny = Math.Min(miny, p[1]); maxy = Math.Max(maxy, p[1]);
        }
        double a = deg * Math.PI / 180, ca = Math.Cos(a), sa = Math.Sin(a);
        double reach = Math.Sqrt(Math.Pow(Math.Max(Math.Abs(minx - pivotSrc.X), Math.Abs(maxx + 1 - pivotSrc.X)), 2)
                               + Math.Pow(Math.Max(Math.Abs(miny - pivotSrc.Y), Math.Abs(maxy + 1 - pivotSrc.Y)), 2)) + 2;
        for (int y = (int)(pivotDst.Y - reach); y <= pivotDst.Y + reach; y++)
            for (int x = (int)(pivotDst.X - reach); x <= pivotDst.X + reach; x++)
            {
                if (x < 0 || y < 0 || x >= W || y >= H) continue;
                var votes = new Dictionary<int, int>();
                int empty = 0;
                for (int j = 0; j < 4; j++)
                    for (int i = 0; i < 4; i++)
                    {
                        double qx = x + (i + 0.5) / 4 - pivotDst.X, qy = y + (j + 0.5) / 4 - pivotDst.Y;
                        // inverse of R(a): (x, y) -> (x cos a + y sin a, -x sin a + y cos a)
                        double sx = qx * ca - qy * sa + pivotSrc.X, sy = qx * sa + qy * ca + pivotSrc.Y;
                        int v;
                        if (map.TryGetValue((long)Math.Floor(sx) * 1000 + (long)Math.Floor(sy), out v))
                        { int n; votes.TryGetValue(v, out n); votes[v] = n + 1; }
                        else empty++;
                    }
                int best = 0, bestN = 0;
                foreach (var kv in votes) if (kv.Value > bestN) { best = kv.Key; bestN = kv.Value; }
                if (bestN > empty) dst[x, y] = best;
            }
    }

    // An arm drawn at fixed widths so it never thins when it turns: a 6 px sleeve
    // with a hem, a 5 px forearm and a rounded fist, in his own arm colours.
    // Swing and bend are degrees forward (towards +x) from hanging straight down.
    static void ArmShape(int[,] dst, PointF shoulder, double swing, double bend, int dy, bool far)
    {
        var sh = new PointF(shoulder.X, shoulder.Y + dy);
        var ev = Rot(new PointF(0, 11.5f), swing);
        var el = new PointF(sh.X + ev.X, sh.Y + ev.Y);
        var wv = Rot(new PointF(0, 8.0f), swing + bend);
        var wr = new PointF(el.X + wv.X, el.Y + wv.Y);
        var hv = Rot(new PointF(0, 10.6f), swing + bend);
        var hc = new PointF(el.X + hv.X, el.Y + hv.Y);
        // the sleeve starts a little inside the shoulder with a flat top, so nothing pokes out above it
        var top = Rot(new PointF(0, -1.0f), swing);
        var st = new PointF(sh.X + top.X, sh.Y + top.Y);
        var part = new int[W, H]; // 1 sleeve, 2 forearm, 3 hand
        var side = new float[W, H];
        var along = new float[W, H];
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                float px = x + 0.5f, py = y + 0.5f, s, t;
                if (Seg(px, py, st, el, 3.0f, 2.9f, false, false, out s, out t)) { part[x, y] = 1; side[x, y] = s; along[x, y] = t; continue; }
                if ((px - hc.X) * (px - hc.X) + (py - hc.Y) * (py - hc.Y) <= 2.9f * 2.9f) { part[x, y] = 3; Seg(px, py, el, wr, 1, 1, true, true, out s, out t); side[x, y] = s; along[x, y] = t; continue; }
                if (Seg(px, py, el, wr, 2.45f, 2.3f, true, true, out s, out t)) { part[x, y] = 2; side[x, y] = s; along[x, y] = t; }
            }
        for (int y = 1; y < H - 1; y++)
            for (int x = 1; x < W - 1; x++)
            {
                int pt = part[x, y];
                if (pt == 0) continue;
                bool edge = part[x - 1, y] == 0 || part[x + 1, y] == 0 || part[x, y - 1] == 0 || part[x, y + 1] == 0;
                bool hem = pt == 1 && (part[x - 1, y] == 2 || part[x + 1, y] == 2 || part[x, y + 1] == 2 || part[x, y + 1] == 3);
                float sd = side[x, y], a = along[x, y];
                int c;
                if (pt == 1)
                {
                    if (edge && a < 0.2f) c = SleeveBase; // joins the shoulder
                    else if (edge || hem) c = SleeveOutline;
                    else if (a > 0.82f) c = SleeveCuff;
                    else if (sd < -1.6f) c = SleeveShade;
                    else if (sd > 1.4f) c = SleeveLight;
                    else c = SleeveBase;
                }
                else
                {
                    if (edge) c = SkinOutline;
                    else if (sd < -1.2f) c = SkinLight;
                    else if (sd > 1.2f) c = SkinShade;
                    else c = SkinBase;
                }
                if (far) c = Darken(c, 0.88);
                dst[x, y] = c;
            }
        // knuckles: a short line across the front of the fist
        foreach (var k in new[] { Rot(new PointF(1.2f, -0.6f), swing + bend), Rot(new PointF(1.2f, 0.6f), swing + bend) })
        {
            int kx = (int)Math.Floor(hc.X + k.X), ky = (int)Math.Floor(hc.Y + k.Y);
            if (kx > 0 && ky > 0 && kx < W && ky < H && part[kx, ky] == 3) dst[kx, ky] = far ? Darken(SkinShade, 0.88) : SkinShade;
        }
    }

    // RotSprite: the sprite is enlarged 8x with Scale2x (which keeps edges and
    // line widths), turned, and sampled back at each pixel centre. Turning his
    // own arm pixels this way keeps their shape and shading instead of eroding them.
    static void RotStamp(int[,] dst, List<int[]> sprite, PointF pivotSrc, PointF pivotDst, double deg)
    {
        if (sprite.Count == 0) return;
        int minx = 999, miny = 999, maxx = -999, maxy = -999;
        foreach (var p in sprite) { minx = Math.Min(minx, p[0]); maxx = Math.Max(maxx, p[0]); miny = Math.Min(miny, p[1]); maxy = Math.Max(maxy, p[1]); }
        int x0 = minx - 2, y0 = miny - 2, w = maxx - minx + 5, h = maxy - miny + 5;
        var img = new int[w, h];
        foreach (var p in sprite) img[p[0] - x0, p[1] - y0] = p[2];
        for (int i = 0; i < 3; i++) img = Scale2x(img);
        int bw = img.GetLength(0), bh = img.GetLength(1);
        double a = deg * Math.PI / 180, ca = Math.Cos(a), sa = Math.Sin(a);
        double reach = Math.Sqrt(w * w + h * h) + 2;
        for (int y = (int)(pivotDst.Y - reach); y <= pivotDst.Y + reach; y++)
            for (int x = (int)(pivotDst.X - reach); x <= pivotDst.X + reach; x++)
            {
                if (x < 0 || y < 0 || x >= W || y >= H) continue;
                double qx = x + 0.5 - pivotDst.X, qy = y + 0.5 - pivotDst.Y;
                double sx = qx * ca - qy * sa + pivotSrc.X, sy = qx * sa + qy * ca + pivotSrc.Y;
                int bx = (int)Math.Floor((sx - x0) * 8), by = (int)Math.Floor((sy - y0) * 8);
                if (bx < 0 || by < 0 || bx >= bw || by >= bh) continue;
                if (img[bx, by] != 0) dst[x, y] = img[bx, by];
            }
    }

    static int[,] Scale2x(int[,] s)
    {
        int w = s.GetLength(0), h = s.GetLength(1);
        var o = new int[w * 2, h * 2];
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
            {
                int p = s[x, y];
                int A = y > 0 ? s[x, y - 1] : p, B = x < w - 1 ? s[x + 1, y] : p, C = x > 0 ? s[x - 1, y] : p, D = y < h - 1 ? s[x, y + 1] : p;
                o[2 * x, 2 * y] = (C == A && C != D && A != B) ? A : p;
                o[2 * x + 1, 2 * y] = (A == B && A != C && B != D) ? B : p;
                o[2 * x, 2 * y + 1] = (D == C && D != B && C != A) ? C : p;
                o[2 * x + 1, 2 * y + 1] = (B == D && B != A && D != C) ? D : p;
            }
        return o;
    }

    static PointF Rot(PointF v, double deg)
    {
        double a = deg * Math.PI / 180;
        return new PointF((float)(v.X * Math.Cos(a) + v.Y * Math.Sin(a)), (float)(-v.X * Math.Sin(a) + v.Y * Math.Cos(a)));
    }

    static void Arm(int[,] dst, List<int[]> upper, List<int[]> lower, PointF shoulder, PointF elbow, double swing, double bend, int dy)
    {
        var s = new PointF(shoulder.X, shoulder.Y + dy);
        var e = Rot(new PointF(elbow.X - shoulder.X, elbow.Y - shoulder.Y), swing);
        RotStamp(dst, lower, elbow, new PointF(s.X + e.X, s.Y + e.Y), swing + bend);
        RotStamp(dst, upper, shoulder, s, swing);
    }

    // A shoe pointing right; (3.5, 0) is the ankle. 12 x 6.
    static readonly string[] ShoeRows = {
        ".obbbo......",
        "obbLbbo.....",
        "obbbbLLo....",
        "osbbbbbSLo..",
        "osssbbbbbbo.",
        "ooooooooooo.",
    };
    static List<int[]> shoe;
    static List<int[]> MakeShoe()
    {
        var list = new List<int[]>();
        for (int y = 0; y < ShoeRows.Length; y++)
            for (int x = 0; x < ShoeRows[y].Length; x++)
            {
                char ch = ShoeRows[y][x];
                int v = ch == 'o' ? ShoeOutline : ch == 'b' ? ShoeBase : ch == 's' ? ShoeShade : ch == 'L' ? ShoeLight : ch == 'S' ? ShoeShine : 0;
                if (v != 0) list.Add(new[] { x, y, v });
            }
        return list;
    }

    // One leg: thigh and shin of even width, outlined, shaded on the back edge and
    // lit on the front, with a pressed crease down the front, a fold above the shoe,
    // and wrinkles at the knee when it bends. Angles are degrees forward (towards +x).
    static void Leg(int[,] dst, float hipX, float hipY, double thigh, double knee, bool far)
    {
        var hip = new PointF(hipX, hipY);
        var kv = Rot(new PointF(0, Thigh), thigh);
        var kn = new PointF(hip.X + kv.X, hip.Y + kv.Y);
        var sv = Rot(new PointF(0, Shin), thigh - knee);
        var an = new PointF(kn.X + sv.X, kn.Y + sv.Y);
        var mask = new bool[W, H];
        var side = new float[W, H];
        var along = new float[W, H]; // 0-1 down the thigh, 1-2 down the shin
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                float px = x + 0.5f, py = y + 0.5f, s1, s2, t1, t2;
                bool in1 = Seg(px, py, hip, kn, 3.5f, 3.5f, false, true, out s1, out t1);
                bool in2 = Seg(px, py, kn, an, 3.5f, 3.1f, true, false, out s2, out t2);
                if (!in1 && !in2) continue;
                mask[x, y] = true;
                if (in2) { side[x, y] = s2; along[x, y] = 1 + Math.Max(0, t2); }
                else { side[x, y] = s1; along[x, y] = Math.Min(1, t1); }
            }
        int baseC = far ? FarBase : PantsBase, shade = far ? FarShade : PantsShade, light = far ? FarLight : PantsLight, crease = far ? FarCrease : PantsCrease;
        for (int y = 1; y < H - 1; y++)
            for (int x = 1; x < W - 1; x++)
            {
                if (!mask[x, y]) continue;
                bool edge = !mask[x - 1, y] || !mask[x + 1, y] || !mask[x, y - 1] || !mask[x, y + 1];
                float s = side[x, y], a = along[x, y];
                int v = baseC;
                if (s < -1.6f) v = shade;
                else if (s > 1.7f) v = light;
                else if (s > 0.2f && s < 1.2f && a > 0.12f && a < 1.8f) v = crease;
                // the fabric breaks in a fold just above the shoe
                if (a > 1.8f && a < 1.88f && s > -1.6f) v = shade;
                if (edge) v = PantsOutline;
                // the top edge joins the hips, so it is not outlined
                if (edge && mask[x, y + 1] && !mask[x, y - 1] && y <= hipY + 1) v = baseC;
                dst[x, y] = v;
            }
        if (knee > 15)
        {
            // wrinkles behind the knee, and light catching the front of it
            foreach (var w in new[] { Rot(new PointF(-1.8f, -1.2f), thigh), Rot(new PointF(-1.2f, 0.4f), thigh - knee * 0.5), Rot(new PointF(-1.6f, 1.6f), thigh - knee) })
            {
                int cx = (int)Math.Floor(kn.X + w.X), cy = (int)Math.Floor(kn.Y + w.Y);
                if (cx > 0 && cy > 0 && cx < W && cy < H && mask[cx, cy]) dst[cx, cy] = PantsOutline;
            }
            var f = Rot(new PointF(1.9f, 0), thigh - knee * 0.5);
            int fx = (int)Math.Floor(kn.X + f.X), fy = (int)Math.Floor(kn.Y + f.Y);
            if (fx > 0 && fy > 0 && mask[fx, fy]) dst[fx, fy] = light;
        }
    }

    // inside a capsule-less segment (flat ends unless capped), with the signed
    // distance across it (+ is the front, towards +x when upright) and how far along it is
    static bool Seg(float px, float py, PointF a, PointF b, float r1, float r2, bool capStart, bool capEnd, out float across, out float t)
    {
        float dx = b.X - a.X, dy = b.Y - a.Y, len2 = dx * dx + dy * dy;
        t = ((px - a.X) * dx + (py - a.Y) * dy) / len2;
        float len = (float)Math.Sqrt(len2);
        // perpendicular, pointing to the front: rotate (dx, dy) by -90 deg in screen space
        float nx = -dy / len, ny = dx / len;
        across = (px - a.X) * nx + (py - a.Y) * ny;
        if (t < 0 && !capStart) return false;
        if (t > 1 && !capEnd) return false;
        float tc = Math.Max(0, Math.Min(1, t));
        float cx = a.X + dx * tc, cy = a.Y + dy * tc;
        float r = r1 + (r2 - r1) * tc;
        float d2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
        return d2 <= r * r;
    }

    // A shoe drawn shape by shape in its own frame (u along the foot, v down from
    // the ankle) so it stays crisp at any angle: toe cap with a shine, laces,
    // a brown sole edge, a darker heel. Pitch is degrees, + tips the toe up.
    static void Shoe(int[,] dst, PointF ankle, double pitch, bool far)
    {
        double a = pitch * Math.PI / 180, ca = Math.Cos(a), sa = Math.Sin(a);
        var mask = new bool[W, H];
        var uu = new float[W, H]; var vv = new float[W, H];
        for (int y = (int)ankle.Y - 14; y <= ankle.Y + 14; y++)
            for (int x = (int)ankle.X - 14; x <= ankle.X + 14; x++)
            {
                if (x < 0 || y < 0 || x >= W || y >= H) continue;
                double dx = x + 0.5 - ankle.X, dy = y + 0.5 - ankle.Y;
                double u = dx * ca - dy * sa, v = dx * sa + dy * ca;
                double top = Math.Max(0, (u - 1.5) * 0.42);
                bool inside = u >= -3.5 && u <= 8.6 && v >= top && v <= 6.0;
                // round the heel and the tip of the toe
                if (u < -2.6 && v > 5.2) inside = false;
                if (u > 7.8 && v < top + 0.9) inside = false;
                if (!inside) continue;
                mask[x, y] = true; uu[x, y] = (float)u; vv[x, y] = (float)v;
            }
        for (int y = 1; y < H - 1; y++)
            for (int x = 1; x < W - 1; x++)
            {
                if (!mask[x, y]) continue;
                bool edge = !mask[x - 1, y] || !mask[x + 1, y] || !mask[x, y - 1] || !mask[x, y + 1];
                float u = uu[x, y], v = vv[x, y], top = Math.Max(0, (u - 1.5f) * 0.42f);
                int c;
                if (edge) c = ShoeOutline;
                else if (v >= 4.6f) c = SoleEdge;
                else if (u >= 3.6f && v < top + 1.4f) c = (u >= 4.6f && u <= 7.2f) ? ShoeShine : ShoeLight;
                else if (u >= 0.3f && u <= 3.4f && v >= 0.8f && v <= 2.2f && ((x + y) & 1) == 0) c = ShoeLight;
                else if (u < -1.6f) c = ShoeShade;
                else c = ShoeBase;
                if (far) c = Darken(c, 0.8);
                dst[x, y] = c;
            }
    }

    static int Darken(int argb, double k)
    {
        var c = Color.FromArgb(argb);
        return Rgb((int)(c.R * k), (int)(c.G * k), (int)(c.B * k));
    }

    static PointF Ankle(float hipX, float hipY, double thigh, double knee)
    {
        var kv = Rot(new PointF(0, Thigh), thigh);
        var sv = Rot(new PointF(0, Shin), thigh - knee);
        return new PointF(hipX + kv.X + sv.X, hipY + kv.Y + sv.Y);
    }

    class Pose
    {
        public double NearThigh, NearKnee, NearFoot, FarThigh, FarKnee, FarFoot;
        public double NearArm, NearBend = 6, FarArm, FarBend = 6;
        public int Dy, HairDy, PackDy, CrownDx;
        public bool Blink;
    }

    static int[,] Draw(Pose p)
    {
        var o = new int[W, H];
        float hipY = HipY + p.Dy;
        // far side first: far arm (behind the body), far shoe and leg
        Arm(o, farUpper, farLower, FarShoulder, FarElbow, p.FarArm, p.FarBend, p.Dy);
        var fa = Ankle(FarHipX, hipY, p.FarThigh, p.FarKnee);
        Shoe(o, fa, p.FarFoot, true);
        Leg(o, FarHipX, hipY, p.FarThigh, p.FarKnee, true);
        // hips
        for (int y = (int)hipY - 1; y <= (int)hipY + 1; y++)
            for (int x = 25; x <= 38; x++)
                o[x, y] = (x == 25 || x == 38) ? PantsOutline : PantsBase;
        var na = Ankle(NearHipX, hipY, p.NearThigh, p.NearKnee);
        Shoe(o, na, p.NearFoot, false);
        Leg(o, NearHipX, hipY, p.NearThigh, p.NearKnee, false);
        // the backpack, then the torso over the hips
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
                if (pack[x, y] != 0 && y + p.PackDy < H) o[x, y + p.PackDy] = pack[x, y];
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
                if (torso[x, y] != 0 && y + p.Dy < H) o[x, y + p.Dy] = torso[x, y];
        // head, with the crown of hair trailing by HairDy (stretching, never gapping)
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                if (head[x, y] == 0) continue;
                o[x, y + p.Dy] = head[x, y];
            }
        int lag = p.HairDy - p.Dy;
        if (lag != 0 || p.CrownDx != 0)
        {
            for (int y = 0; y <= CrownBottom; y++)
                for (int x = 0; x < W; x++)
                    if (head[x, y] != 0) o[x, y + p.Dy] = 0;
            for (int y = 0; y <= CrownBottom; y++)
                for (int x = 0; x < W; x++)
                {
                    int dx = y <= 10 ? p.CrownDx : 0;
                    int v = head[x, y];
                    if (v == 0) continue;
                    int tx = x + dx, ty = y + p.Dy + lag;
                    if (tx >= 0 && tx < W && ty >= 0) o[tx, ty] = v;
                    // hair lifted: repeat the crown's last row so nothing opens up
                    if (lag < 0 && y == CrownBottom) o[tx, y + p.Dy] = v;
                }
        }
        if (p.Blink)
        {
            int d = p.Dy;
            // near eye: lids meet in one lash line
            for (int x = 28; x <= 35; x++) for (int y = 25; y <= 29; y++)
                    if (x >= 30 || y >= 26) o[x, y + d] = Skin;
            // a short curve: the outer corner a pixel higher
            for (int x = 29; x <= 33; x++) o[x, 28 + d] = Lash;
            o[28, 27 + d] = Lash;
            // far eye
            for (int x = 38; x <= 40; x++) for (int y = 25; y <= 29; y++) o[x, y + d] = Skin;
            for (int x = 38; x <= 39; x++) o[x, 28 + d] = Lash;
            o[40, 27 + d] = Lash;
        }
        // the near arm passes in front of everything
        Arm(o, nearUpper, nearLower, NearShoulder, NearElbow, p.NearArm, p.NearBend, p.Dy);
        lastFilled = Patch(o, (int)hipY);
        return o;
    }

    // Fills missing pixels: small enclosed holes (up to 4 pixels) and notches
    // (transparent with the body on 3 or 4 sides), with the commonest colour
    // around them, until none are left. Real gaps, like between the legs, stay open.
    static int lastFilled;
    static int Patch(int[,] o, int legTop)
    {
        int filled = 0;
        for (int pass = 0; pass < 64; pass++)
        {
            var outside = new bool[W, H];
            var q = new Queue<int>();
            for (int x = 0; x < W; x++) { q.Enqueue(x); q.Enqueue((H - 1) * W + x); }
            for (int y = 0; y < H; y++) { q.Enqueue(y * W); q.Enqueue(y * W + W - 1); }
            while (q.Count > 0)
            {
                int k = q.Dequeue(), x = k % W, y = k / W;
                if (o[x, y] != 0 || outside[x, y]) continue;
                outside[x, y] = true;
                if (x > 0) q.Enqueue(k - 1); if (x < W - 1) q.Enqueue(k + 1);
                if (y > 0) q.Enqueue(k - W); if (y < H - 1) q.Enqueue(k + W);
            }
            // size of each enclosed hole
            var region = new int[W, H];
            var sizes = new List<int> { 0 };
            var low = new List<bool> { false };
            for (int y = 0; y < H; y++)
                for (int x = 0; x < W; x++)
                {
                    if (o[x, y] != 0 || outside[x, y] || region[x, y] != 0) continue;
                    int id = sizes.Count, size = 0; bool below = true;
                    var st = new Stack<int>(); st.Push(y * W + x); region[x, y] = id;
                    while (st.Count > 0)
                    {
                        int k = st.Pop(), cx = k % W, cy = k / W; size++; if (cy < legTop) below = false;
                        foreach (int nk in new[] { k - 1, k + 1, k - W, k + W })
                        {
                            int nx = nk % W, ny = nk / W;
                            if (nk < 0 || nk >= W * H || Math.Abs(nx - cx) + Math.Abs(ny - cy) != 1) continue;
                            if (o[nx, ny] == 0 && !outside[nx, ny] && region[nx, ny] == 0) { region[nx, ny] = id; st.Push(nk); }
                        }
                    }
                    sizes.Add(size); low.Add(below);
                }
            var fills = new List<int[]>();
            for (int y = 1; y < H - 1; y++)
                for (int x = 1; x < W - 1; x++)
                {
                    if (o[x, y] != 0) continue;
                    int sides = (o[x - 1, y] != 0 ? 1 : 0) + (o[x + 1, y] != 0 ? 1 : 0) + (o[x, y - 1] != 0 ? 1 : 0) + (o[x, y + 1] != 0 ? 1 : 0);
                    bool hole = !outside[x, y] && sizes[region[x, y]] <= 4;
                    // a sliver between the legs reads as the far leg behind
                    if (!outside[x, y] && sizes[region[x, y]] <= 40 && low[region[x, y]]) { fills.Add(new[] { x, y, FarShade }); continue; }
                    if (!hole && sides < 3) continue;
                    var votes = new Dictionary<int, int>();
                    for (int dy = -1; dy <= 1; dy++)
                        for (int dx = -1; dx <= 1; dx++)
                        {
                            int v = o[x + dx, y + dy]; if (v == 0) continue;
                            int n; votes.TryGetValue(v, out n); votes[v] = n + ((dx == 0 || dy == 0) ? 2 : 1);
                        }
                    int best = 0, bestN = 0;
                    foreach (var kv in votes) if (kv.Value > bestN) { best = kv.Key; bestN = kv.Value; }
                    if (best != 0) fills.Add(new[] { x, y, best });
                }
            if (fills.Count == 0) break;
            foreach (var f in fills) o[f[0], f[1]] = f[2];
            filled += fills.Count;
        }
        return filled;
    }

    static Pose Walk(int i, int n)
    {
        const double A = 23, K = 52, C = 19;
        double t = 2 * Math.PI * i / n, s = Math.Sin(t), c = Math.Cos(t);
        var p = new Pose();
        p.NearThigh = A * s; p.FarThigh = -A * s;
        // the leg swinging forward bends its knee most as it passes under the body
        // the standing leg gives a little as it takes the weight
        p.NearKnee = c > 0 ? K * Math.Pow(c, 1.3) : 8 * -c;
        p.FarKnee = c < 0 ? K * Math.Pow(-c, 1.3) : 8 * c;
        // a bending knee lifts the thigh forward, so the foot passes under the body
        if (c > 0) p.NearThigh += 0.4 * p.NearKnee;
        if (c < 0) p.FarThigh += 0.4 * p.FarKnee;
        // foot: flat on the ground, heel up as it pushes off, toe up as it lands
        p.NearFoot = c > 0 ? 0.75 * (p.NearThigh - p.NearKnee) : Math.Min(0, 0.6 * (p.NearThigh + 0.6 * A));
        p.FarFoot = c < 0 ? 0.75 * (p.FarThigh - p.FarKnee) : Math.Min(0, 0.6 * (p.FarThigh + 0.6 * A));
        // arms swing against the legs, a little behind them; forearms bend on the way forward
        double lag = 2 * Math.PI * 0.04;
        p.NearArm = -C * Math.Sin(t - lag); p.FarArm = C * Math.Sin(t - lag);
        p.NearBend = 6 + 16 * Math.Max(0, p.NearArm / C);
        p.FarBend = 6 + 16 * Math.Max(0, p.FarArm / C);
        p.Dy = Bob(p);
        return p;
    }

    // the body drops by however much the longer leg is shortened by its angle
    static int Bob(Pose p)
    {
        double near = Ankle(NearHipX, HipY, p.NearThigh, p.NearKnee).Y, far = Ankle(FarHipX, HipY, p.FarThigh, p.FarKnee).Y;
        return (int)Math.Round(HipY + Thigh + Shin - Math.Max(near, far));
    }

    public static string Run(string referencePath, string outDir, string sheetDir)
    {
        var log = new StringBuilder();
        Cut(referencePath);
        shoe = MakeShoe();
        Directory.CreateDirectory(outDir);
        var frames = new List<int[,]>();
        // walk: 12 frames, the hair landing a frame after the body
        var walk = new Pose[12];
        for (int i = 0; i < 12; i++) walk[i] = Walk(i, 12);
        for (int i = 0; i < 12; i++)
        {
            walk[i].HairDy = walk[(i + 11) % 12].Dy;
            walk[i].PackDy = walk[(i + 11) % 12].Dy;
            var f = Draw(walk[i]);
            frames.Add(f);
            log.Append("[patched " + lastFilled + "] ");
            log.AppendLine(string.Format("walk {0}: legs {1:0}/{2:0} knees {3:0}/{4:0} arms {5:0}/{6:0} bob {7} hair {8}", i,
                walk[i].NearThigh, walk[i].FarThigh, walk[i].NearKnee, walk[i].FarKnee, walk[i].NearArm, walk[i].FarArm, walk[i].Dy, walk[i].HairDy));
        }
        // idle: 24 frames at 4 fps. Two breaths, a blink, a double blink, a breeze in the hair.
        var idle = new Pose[24];
        int[] breath = { 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0 };
        for (int i = 0; i < 24; i++)
        {
            var p = new Pose();
            p.NearThigh = 1; p.FarThigh = -1;
            p.Dy = breath[i % 12];
            p.HairDy = breath[(i + 11) % 12];
            p.PackDy = breath[(i + 11) % 12];
            p.NearArm = 0; p.FarArm = 0; p.NearBend = 0; p.FarBend = 0;
            p.Blink = i == 9 || i == 19 || i == 21;
            p.CrownDx = (i >= 13 && i <= 16) ? 1 : 0;
            idle[i] = p;
            frames.Add(Draw(p));
            log.Append("idle " + i + " [patched " + lastFilled + "]; ");
        }
        // crop every frame to one box with the feet on the bottom row
        int minx = W, maxx = 0, miny = H, maxy = 0;
        foreach (var f in frames)
            for (int y = 0; y < H; y++) for (int x = 0; x < W; x++)
                    if (f[x, y] != 0) { minx = Math.Min(minx, x); maxx = Math.Max(maxx, x); miny = Math.Min(miny, y); maxy = Math.Max(maxy, y); }
        // the ground is row 91 (where the standing shoe's sole is); a toe pushing off goes no lower
        maxy = Math.Min(maxy, 91);
        int fw = maxx - minx + 1; if (fw % 2 == 1) fw++;
        int fh = maxy - miny + 1;
        log.AppendLine(string.Format("box x {0}-{1} y {2}-{3}: {4} x {5}", minx, maxx, miny, maxy, fw, fh));
        Sheet(frames, 0, 12, minx, miny, fw, fh, Path.Combine(sheetDir, "walk.png"));
        Sheet(frames, 12, 24, minx, miny, fw, fh, Path.Combine(sheetDir, "idle.png"));
        for (int i = 0; i < frames.Count; i++) Save(frames[i], Path.Combine(outDir, string.Format("{0}-{1:00}.png", i < 12 ? "walk" : "idle", i < 12 ? i : i - 12)));
        return log.ToString();
    }

    static void Sheet(List<int[,]> frames, int from, int count, int x0, int y0, int fw, int fh, string path)
    {
        using (var bmp = new Bitmap(fw * count, fh, PixelFormat.Format32bppArgb))
        {
            for (int k = 0; k < count; k++)
                for (int y = 0; y < fh; y++)
                    for (int x = 0; x < fw; x++)
                    {
                        int sx = x0 + x, sy = y0 + y;
                        if (sx < W && sy < H && frames[from + k][sx, sy] != 0) bmp.SetPixel(k * fw + x, y, Color.FromArgb(frames[from + k][sx, sy]));
                    }
            bmp.Save(path, ImageFormat.Png);
        }
    }

    static void Save(int[,] a, string path)
    {
        using (var bmp = new Bitmap(W, H, PixelFormat.Format32bppArgb))
        {
            for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) if (a[x, y] != 0) bmp.SetPixel(x, y, Color.FromArgb(a[x, y]));
            bmp.Save(path, ImageFormat.Png);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text;

// The boy's rig made general, for the campus NPCs cut from the style sheet.
// Each NPC is set up in Cast(): where its head, arms, backpack, hips and eyes are
// on the 64 x 96 canvas, and what its legs are (pants, or skin and socks under a
// skirt). Everything else (RotSprite arms, even legs, the walk, the idle, the
// missing-pixel pass) is the boy's, so the NPCs move exactly like him.
public static partial class NpcRig
{
    public class Setup
    {
        public string Id;
        public int HeadBottom, JawRow = -1, JawX0, JawX1, CrownBottom;
        public string ArmMode = "light";           // light, nopack, box
        public int NearX0, NearX1, NearHandX1, NearHandY, NearY0, NearY1, ElbowRow;
        public PointF NearShoulder, NearElbow;
        public float FarShoulderX;
        public int FarX0, FarX1, FarY0, FarY1;      // the drawn far arm, taken out of the torso
        public int PackX = -1, PackY0 = 36, PackY1 = 95, PackSide;
        public int TorsoBottom, PackBottomX = -1, PackBottomY;
        public int ApronBottom = -1;
        public int ArmDarkStays = 999;             // from this row down, very dark pixels in the arm box stay on the body (a belt pouch)               // below the waist, only light pixels (an apron) stay on the torso
        public int[] Shoes;                        // outline, base, shade, light, shine, sole (null: the boy's)
        public float HipY, NearHipX, FarHipX, Thigh = 12f, Shin = 12f;
        public bool Skirt;                         // legs under a skirt: skin, socks, no hip block
        public int HipX0, HipX1;                   // the hip block between pant legs
        public int[] Legs;                         // outline, base, shade, light, crease, farBase, farShade, farLight, farCrease
        public float LegR = 3.5f, LegR2 = 3.1f, SockFrom = 9f;
        public int[] Socks;                        // outline, base, shade
        public int Skin, Lash;
        public int[] NearEye, FarEye;              // x0, x1, y0, y1, lash row
        public int[] Mouth;                        // x, y of the closed mouth (2 px wide)
    }
    static Setup C;
    static int[] LegsNow, ShoesNow;

    const int W = 64, H = 96;
    static int[,] reference;
    static List<int[]> nearUpper = new List<int[]>(), nearLower = new List<int[]>();
    static List<int[]> farUpper = new List<int[]>(), farLower = new List<int[]>();
    static int[,] torso = new int[W, H];
    static int[,] pack = new int[W, H]; // the backpack body, which bounces a frame late
    static int[,] head = new int[W, H];

    static PointF NearShoulder, NearElbow, FarShoulder, FarElbow;
    static float HipY, Thigh, Shin, NearHipX, FarHipX;
    static int CrownBottom;

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

    static bool InHead(int x, int y) { return y <= C.HeadBottom || (y == C.JawRow && x >= C.JawX0 && x <= C.JawX1); }
    static bool ArmPixel(Color c, int x, int y)
    {
        bool light = 0.3 * c.R + 0.59 * c.G + 0.11 * c.B > 95;
        // pants peeking under a hand: only where the pants really are (a dark cuff is fine)
        if (C.ArmMode == "box") return !(x >= C.HipX0 && y >= C.HipY - 2 && PantsColour(c));
        if (C.ArmMode == "nopack") return light && !(c.R > 150 && c.B > 120 && c.R - c.G > 35) && !(c.B > c.R + 15);
        return light;
    }
    // close to any of the legs' colours: pants peeking in under a hand
    static bool PantsColour(Color c)
    {
        foreach (int i in new[] { 0, 1, 2, 5, 6 })
        {
            var p = Color.FromArgb(C.Legs[i]);
            if (Math.Abs(c.R - p.R) + Math.Abs(c.G - p.G) + Math.Abs(c.B - p.B) < 30) return true;
        }
        return false;
    }
    static bool IsSleeve(Color c) { return c.R >= 180 && c.G >= 150 && c.B >= 140; }
    static bool IsSkin(Color c) { return c.R >= 150 && c.B <= 135 && c.R - c.B >= 50; }

    static void Cut(string path)
    {
        reference = new int[W, H];
        nearUpper.Clear(); nearLower.Clear(); farUpper.Clear(); farLower.Clear();
        var farMask = new bool[W, H];
        torso = new int[W, H]; pack = new int[W, H]; head = new int[W, H];
        NearShoulder = C.NearShoulder; NearElbow = C.NearElbow;
        FarShoulder = new PointF(C.FarShoulderX, C.NearShoulder.Y); FarElbow = new PointF(C.FarShoulderX, C.NearElbow.Y);
        HipY = C.HipY; Thigh = C.Thigh; Shin = C.Shin; NearHipX = C.NearHipX; FarHipX = C.FarHipX; CrownBottom = C.CrownBottom;
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
                bool pouch = y >= C.ArmDarkStays && 0.3 * c.R + 0.59 * c.G + 0.11 * c.B < 45;
                bool near = !pouch && ArmPixel(c, x, y) && x >= C.NearX0 && x <= (y >= C.NearHandY ? C.NearHandX1 : C.NearX1) && y >= C.NearY0 && y <= C.NearY1;
                bool far = ArmPixel(c, x, y) && x >= C.FarX0 && x <= C.FarX1 && y >= C.FarY0 && y <= C.FarY1;
                if (near) { (y < C.ElbowRow ? nearUpper : nearLower).Add(new[] { x, y, v }); continue; }
                if (far) { farMask[x, y] = true; continue; } // replaced by a copy of the near arm
                // torso: everything down to the waist (or the hem), and the backpack's bottom
                if (y <= C.TorsoBottom || (x <= C.PackBottomX && y <= C.PackBottomY) || (y <= C.ApronBottom && 0.3 * c.R + 0.59 * c.G + 0.11 * c.B > 120)) torso[x, y] = v;
            }
        // the arm's dark outline on the outside of the body is the arm's too, so it moves
        // with it instead of staying behind as a line
        {
            var arm = new HashSet<long>();
            foreach (var p in nearUpper) arm.Add((long)p[0] * 1000 + p[1]);
            foreach (var p in nearLower) arm.Add((long)p[0] * 1000 + p[1]);
            for (int y = C.NearY0; y <= C.NearY1; y++)
                for (int x = C.NearX0 - 2; x <= C.NearHandX1 + 1; x++)
                {
                    if (x < 1 || x >= W - 1 || torso[x, y] == 0) continue;
                    var c = Color.FromArgb(torso[x, y]);
                    if (0.3 * c.R + 0.59 * c.G + 0.11 * c.B > 95) continue;
                    bool nextToArm = false, outside = false;
                    for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
                        {
                            if (arm.Contains((long)(x + dx) * 1000 + (y + dy))) nextToArm = true;
                            if ((dx == 0 || dy == 0) && reference[x + dx, y + dy] == 0) outside = true;
                        }
                    if (!nextToArm || !outside) continue;
                    (y < C.ElbowRow ? nearUpper : nearLower).Add(new[] { x, y, torso[x, y] });
                    torso[x, y] = 0;
                }
        }
        // the near arm is only what is joined to it: a few shirt pixels at its edge
        // would float on their own once the arm turns (or is copied to the far side)
        {
            var all = new List<int[]>(nearUpper); all.AddRange(nearLower);
            var at = new Dictionary<long, int[]>();
            foreach (var p in all) at[(long)p[0] * 1000 + p[1]] = p;
            var group = new Dictionary<long, int>(); int best = -1, bestSize = 0, gid = 0;
            foreach (var p in all)
            {
                long key = (long)p[0] * 1000 + p[1];
                if (group.ContainsKey(key)) continue;
                int size = 0; var st = new Stack<long>(); st.Push(key); group[key] = gid;
                while (st.Count > 0)
                {
                    long k = st.Pop(); size++;
                    int kx = (int)(k / 1000), ky = (int)(k % 1000);
                    for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
                        {
                            long nk = (long)(kx + dx) * 1000 + (ky + dy);
                            if (at.ContainsKey(nk) && !group.ContainsKey(nk)) { group[nk] = gid; st.Push(nk); }
                        }
                }
                if (size > bestSize) { bestSize = size; best = gid; }
                gid++;
            }
            foreach (var list in new[] { nearUpper, nearLower })
                list.RemoveAll(p =>
                {
                    if (group[(long)p[0] * 1000 + p[1]] == best) return false;
                    if (p[1] <= C.TorsoBottom) torso[p[0], p[1]] = p[2];
                    return true;
                });
        }
        // The far arm is mostly hidden in his drawing (a 3 px strip), so it would look
        // like a stick once it swings out. It is his near arm instead, a shade darker.
        farUpper.Clear(); farLower.Clear();
        int shift = (int)(FarShoulder.X - NearShoulder.X);
        foreach (var p in nearUpper) farUpper.Add(new[] { p[0] + shift, p[1], Darken(p[2], 0.88) });
        foreach (var p in nearLower) farLower.Add(new[] { p[0] + shift, p[1], Darken(p[2], 0.88) });
        // the drawn far arm's dark outline goes with it, so no specks are left behind
        for (int y = C.FarY0; y <= C.FarY1; y++)
            for (int x = C.FarX0 - 1; x <= C.FarX1 + 1; x++)
            {
                if (torso[x, y] == 0) continue;
                var c = Color.FromArgb(torso[x, y]);
                if (0.3 * c.R + 0.59 * c.G + 0.11 * c.B > 95) continue;
                bool touches = false;
                for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) if (farMask[x + dx, y + dy]) touches = true;
                if (touches) torso[x, y] = 0;
            }
        // behind the near arm is the side of the backpack (or the body)
        // (a backpack, or the body to its left); with nothing behind, the gap stays open
        for (int y = C.NearY0; y <= Math.Min(C.NearY1, C.TorsoBottom); y++)
            for (int x = C.NearX0; x <= C.NearX1; x++)
            {
                if (torso[x, y] != 0 || reference[x, y] == 0) continue;
                bool behind = false;
                for (int k = 1; k <= 6 && !behind; k++)
                    if (x - k - 2 >= 0 && torso[x - k, y] != 0 && torso[x - k - 1, y] != 0 && torso[x - k - 2, y] != 0) behind = true;
                if (behind) torso[x, y] = C.PackSide;
            }
        if (C.PackX >= 0)
            for (int y = C.PackY0; y <= Math.Min(H - 1, C.PackY1); y++)
                for (int x = 0; x <= C.PackX; x++)
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
                bool in1 = Seg(px, py, hip, kn, C.LegR, C.LegR, false, true, out s1, out t1);
                bool in2 = Seg(px, py, kn, an, C.LegR, C.LegR2, true, false, out s2, out t2);
                if (!in1 && !in2) continue;
                mask[x, y] = true;
                if (in2) { side[x, y] = s2; along[x, y] = 1 + Math.Max(0, t2); }
                else { side[x, y] = s1; along[x, y] = Math.Min(1, t1); }
            }
        int baseC = LegsNow[far ? 5 : 1], shade = LegsNow[far ? 6 : 2], light = LegsNow[far ? 7 : 3], crease = LegsNow[far ? 8 : 4];
        int outline = LegsNow[0];
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
                if (!C.Skirt && a > 1.8f && a < 1.88f && s > -1.6f) v = shade;
                if (edge) v = outline;
                // socks below the skirt
                if (C.Socks != null && a >= C.SockFrom) v = edge ? C.Socks[0] : s < -1.2f ? C.Socks[2] : C.Socks[1];
                if (C.Skirt)
                {
                    int hem = C.TorsoBottom + (int)Math.Round(hipY - C.HipY);
                    if (y == hem + 1) v = outline;
                    else if (y == hem + 2 && !edge) v = shade;
                }
                if (far && C.Socks != null && a >= C.SockFrom && !edge) v = Darken(v, 0.9);
                // the top edge joins the hips, so it is not outlined
                if (edge && mask[x, y + 1] && !mask[x, y - 1] && y <= hipY + 1) v = baseC;
                dst[x, y] = v;
            }
        if (knee > 15 && !C.Skirt)
        {
            // wrinkles behind the knee, and light catching the front of it
            foreach (var w in new[] { Rot(new PointF(-1.8f, -1.2f), thigh), Rot(new PointF(-1.2f, 0.4f), thigh - knee * 0.5), Rot(new PointF(-1.6f, 1.6f), thigh - knee) })
            {
                int cx = (int)Math.Floor(kn.X + w.X), cy = (int)Math.Floor(kn.Y + w.Y);
                if (cx > 0 && cy > 0 && cx < W && cy < H && mask[cx, cy]) dst[cx, cy] = outline;
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
                if (edge) c = ShoesNow[0];
                else if (v >= 4.6f) c = ShoesNow[5];
                else if (u >= 3.6f && v < top + 1.4f) c = (u >= 4.6f && u <= 7.2f) ? ShoesNow[4] : ShoesNow[3];
                else if (u >= 0.3f && u <= 3.4f && v >= 0.8f && v <= 2.2f && ((x + y) & 1) == 0) c = ShoesNow[3];
                else if (u < -1.6f) c = ShoesNow[2];
                else c = ShoesNow[1];
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
        public bool Blink, MouthOpen;
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
        // hips (a skirt covers them instead)
        if (!C.Skirt)
            for (int y = (int)hipY - 1; y <= (int)hipY + 1; y++)
                for (int x = C.HipX0; x <= C.HipX1; x++)
                    o[x, y] = (x == C.HipX0 || x == C.HipX1) ? LegsNow[0] : LegsNow[1];
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
            // each eye: lids meet in one lash line, its outer corner a pixel higher
            foreach (var e in new[] { C.NearEye, C.FarEye })
            {
                for (int x = e[0]; x <= e[1]; x++) for (int y = e[2]; y <= e[3]; y++) o[x, y + d] = C.Skin;
                for (int x = e[0] + 1; x <= e[1]; x++) o[x, e[4] + d] = C.Lash;
                o[e[0], e[4] - 1 + d] = C.Lash;
            }
        }
        // talking: the mouth opens two pixels deep
        if (p.MouthOpen)
        {
            int mx = C.Mouth[0], my = C.Mouth[1] + p.Dy;
            o[mx, my] = Hex(0x4a1f1e); o[mx + 1, my] = Hex(0x4a1f1e);
            o[mx, my + 1] = Hex(0x8a3a32); o[mx + 1, my + 1] = Hex(0x9a4a40);
        }
        // the near arm passes in front of everything
        Arm(o, nearUpper, nearLower, NearShoulder, NearElbow, p.NearArm, p.NearBend, p.Dy);
        lastFilled = Patch(o, (int)hipY);
        Crumbs(o);
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
                    if (!outside[x, y] && sizes[region[x, y]] <= 60 && low[region[x, y]]) { fills.Add(new[] { x, y, LegsNow[6] }); continue; }
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

    // Removes pieces of 6 pixels or fewer that are not joined to the body.
    static void Crumbs(int[,] o)
    {
        var id = new int[W, H]; var sizes = new List<int> { 0 };
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                if (o[x, y] == 0 || id[x, y] != 0) continue;
                int n = sizes.Count, size = 0; var st = new Stack<int>(); st.Push(y * W + x); id[x, y] = n;
                while (st.Count > 0)
                {
                    int k = st.Pop(), kx = k % W, ky = k / W; size++;
                    for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
                        {
                            int nx = kx + dx, ny = ky + dy;
                            if (nx < 0 || ny < 0 || nx >= W || ny >= H || o[nx, ny] == 0 || id[nx, ny] != 0) continue;
                            id[nx, ny] = n; st.Push(ny * W + nx);
                        }
                }
                sizes.Add(size);
            }
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
                if (o[x, y] != 0 && sizes[id[x, y]] <= 6) o[x, y] = 0;
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

    public static string Run(string id, string canvasDir, string outDir, string sheetDir)
    {
        var log = new StringBuilder();
        C = Cast().Find(x => x.Id == id);
        LegsNow = C.Legs;
        ShoesNow = C.Shoes ?? new[] { ShoeOutline, ShoeBase, ShoeShade, ShoeLight, ShoeShine, SoleEdge };
        Cut(Path.Combine(canvasDir, id + "-canvas.png"));
        Directory.CreateDirectory(sheetDir);
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
        // talk: 4 frames, the mouth opening on every other one. The arms stay as drawn:
        // turning them a few degrees blurred the hands.
        double[][] talk = { new double[] { 0, 0, 0 }, new double[] { 1, 0, 0 }, new double[] { 0, 0, 0 }, new double[] { 1, 0, 0 } };
        foreach (var t in talk)
        {
            var p = new Pose { NearThigh = 1, FarThigh = -1, NearArm = t[1], NearBend = t[2], FarArm = 0, FarBend = 0, MouthOpen = t[0] > 0 };
            frames.Add(Draw(p));
        }
        // wave: 4 frames, the elbow out to the side and the forearm up beside the head, the hand rocking
        double[][] wave = { new double[] { -72, -96 }, new double[] { -74, -114 }, new double[] { -72, -132 }, new double[] { -74, -114 } };
        foreach (var t in wave)
        {
            var p = new Pose { NearThigh = 1, FarThigh = -1, NearArm = t[0], NearBend = t[1], FarArm = 0, FarBend = 0 };
            frames.Add(Draw(p));
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
        Sheet(frames, 36, 4, minx, miny, fw, fh, Path.Combine(sheetDir, "talk.png"));
        Sheet(frames, 40, 4, minx, miny, fw, fh, Path.Combine(sheetDir, "wave.png"));
        // the bubble portrait: a 32 x 32 close-up of the face, mouth closed, open and blinking
        int pcx = (C.NearEye[0] + C.FarEye[1]) / 2, pcy = C.NearEye[2] + 3;
        var faces = new List<int[,]> { frames[12], frames[37], frames[12 + 9] };
        using (var bmp = new Bitmap(32 * 3, 32, PixelFormat.Format32bppArgb))
        {
            for (int k = 0; k < 3; k++)
                for (int y = 0; y < 32; y++)
                    for (int x = 0; x < 32; x++)
                    {
                        int sx = pcx - 15 + x, sy = pcy - 17 + y;
                        if (sx >= 0 && sy >= 0 && sx < W && sy < H && faces[k][sx, sy] != 0) bmp.SetPixel(k * 32 + x, y, Color.FromArgb(faces[k][sx, sy]));
                    }
            bmp.Save(Path.Combine(sheetDir, "portrait.png"), ImageFormat.Png);
        }
        Directory.CreateDirectory(outDir);
        for (int i = 0; i < frames.Count; i++) Save(frames[i], Path.Combine(outDir, string.Format("{0}-{1:00}.png", i < 12 ? "walk" : i < 36 ? "idle" : i < 40 ? "talk" : "wave", i < 12 ? i : i < 36 ? i - 12 : i < 40 ? i - 36 : i - 40)));
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

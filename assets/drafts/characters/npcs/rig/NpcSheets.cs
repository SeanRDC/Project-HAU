using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

// Puts an NPC's sheets together. Idle and talk come from the rig (the reference drawing
// itself, breathing, blinking and talking, untouched); walk and wave are PixelLab
// redraws of the same drawing posed by skeletons (pixellab/skeleton.mjs), which draw
// arms and legs properly where the rig could only turn and stretch pixels.
// PixelLab frames are cleaned the same way every time: alpha made solid, every colour
// snapped to the reference drawing's own palette (so walking does not change colour),
// specks of 6 pixels or fewer removed, and the lowest foot set on the ground row.
public static class NpcSheets
{
    const int S = 128;         // PixelLab canvas: the 64 x 96 drawing sits at (32, 16)
    const int Ground = 107;    // the rig's ground row (91) on that canvas

    public static string Run(string canvasPath, string rigFrames, string walkDir, string waveDir, string sheetDir)
    {
        var palette = Palette(canvasPath);
        var kinds = new List<KeyValuePair<string, List<int[,]>>>();
        kinds.Add(new KeyValuePair<string, List<int[,]>>("walk", LoadPixelLab(walkDir, palette)));
        kinds.Add(new KeyValuePair<string, List<int[,]>>("idle", LoadRig(rigFrames, "idle", 24)));
        // the player has no talk or wave
        if (File.Exists(Path.Combine(rigFrames, "talk-00.png"))) kinds.Add(new KeyValuePair<string, List<int[,]>>("talk", LoadRig(rigFrames, "talk", 4)));
        if (Directory.Exists(waveDir)) kinds.Add(new KeyValuePair<string, List<int[,]>>("wave", LoadPixelLab(waveDir, palette)));
        int x0 = S, x1 = 0, y0 = S;
        foreach (var k in kinds)
            foreach (var f in k.Value)
                for (int y = 0; y < S; y++)
                    for (int x = 0; x < S; x++)
                        if (f[x, y] != 0) { x0 = Math.Min(x0, x); x1 = Math.Max(x1, x); y0 = Math.Min(y0, y); }
        int w = x1 - x0 + 1; if (w % 2 == 1) { w++; }
        int h = Ground - y0 + 1;
        foreach (var k in kinds) Sheet(k.Value, x0, y0, w, h, Path.Combine(sheetDir, k.Key + ".png"));
        return string.Format("box x {0}-{1} y {2}-{3}: {4} x {5}", x0, x0 + w - 1, y0, Ground, w, h);
    }

    static List<int> Palette(string path)
    {
        var set = new HashSet<int>();
        using (var im = new Bitmap(path))
            for (int y = 0; y < im.Height; y++)
                for (int x = 0; x < im.Width; x++)
                {
                    var c = im.GetPixel(x, y);
                    if (c.A >= 128) set.Add(Color.FromArgb(255, c.R, c.G, c.B).ToArgb());
                }
        return new List<int>(set);
    }

    static List<int[,]> LoadRig(string dir, string kind, int count)
    {
        var list = new List<int[,]>();
        for (int i = 0; i < count; i++)
        {
            var f = new int[S, S];
            using (var im = new Bitmap(Path.Combine(dir, string.Format("{0}-{1:00}.png", kind, i))))
                for (int y = 0; y < im.Height; y++)
                    for (int x = 0; x < im.Width; x++)
                    {
                        var c = im.GetPixel(x, y);
                        if (c.A >= 128 && y + 16 <= Ground) f[x + 32, y + 16] = c.ToArgb();
                    }
            list.Add(f);
        }
        return list;
    }

    static List<int[,]> LoadPixelLab(string dir, List<int> palette)
    {
        var list = new List<int[,]>();
        var files = Directory.GetFiles(dir, "f*.png");
        Array.Sort(files, StringComparer.Ordinal);
        var nearest = new Dictionary<int, int>();
        foreach (var file in files)
        {
            var f = new int[S, S];
            using (var im = new Bitmap(file))
                for (int y = 0; y < S; y++)
                    for (int x = 0; x < S; x++)
                    {
                        var c = im.GetPixel(x, y);
                        if (c.A < 128) continue;
                        int key = Color.FromArgb(255, c.R, c.G, c.B).ToArgb();
                        int snapped;
                        if (!nearest.TryGetValue(key, out snapped)) { snapped = Nearest(c, palette); nearest[key] = snapped; }
                        f[x, y] = snapped;
                    }
            Crumbs(f);
            Notches(f);
            // the lowest foot on the ground
            int low = -1;
            for (int y = S - 1; y >= 0 && low < 0; y--)
                for (int x = 0; x < S; x++) if (f[x, y] != 0) { low = y; break; }
            int dy = Ground - low;
            var g = new int[S, S];
            for (int y = 0; y < S; y++)
                for (int x = 0; x < S; x++)
                    if (f[x, y] != 0 && y + dy >= 0 && y + dy < S) g[x, y + dy] = f[x, y];
            list.Add(g);
        }
        return list;
    }

    // nearest by weighted RGB distance, so a light shirt stays light and skin stays skin
    static int Nearest(Color c, List<int> palette)
    {
        int best = palette[0]; double bd = double.MaxValue;
        foreach (var p in palette)
        {
            var q = Color.FromArgb(p);
            double dr = c.R - q.R, dg = c.G - q.G, db = c.B - q.B;
            double d = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
            if (d < bd) { bd = d; best = p; }
        }
        return best;
    }

    // Single missing pixels: transparent with the body on 3 or 4 sides get the commonest
    // colour around them, until none are left (the rig's rule, so check.ps1 agrees).
    static void Notches(int[,] o)
    {
        for (int pass = 0; pass < 8; pass++)
        {
            var fills = new List<int[]>();
            for (int y = 1; y < S - 1; y++)
                for (int x = 1; x < S - 1; x++)
                {
                    if (o[x, y] != 0) continue;
                    int sides = (o[x - 1, y] != 0 ? 1 : 0) + (o[x + 1, y] != 0 ? 1 : 0) + (o[x, y - 1] != 0 ? 1 : 0) + (o[x, y + 1] != 0 ? 1 : 0);
                    if (sides < 3) continue;
                    var count = new Dictionary<int, int>();
                    int best = 0, bestN = 0;
                    for (int dy = -1; dy <= 1; dy++)
                        for (int dx = -1; dx <= 1; dx++)
                        {
                            int v = o[x + dx, y + dy];
                            if (v == 0) continue;
                            int n; count.TryGetValue(v, out n); count[v] = ++n;
                            if (n > bestN) { bestN = n; best = v; }
                        }
                    fills.Add(new[] { x, y, best });
                }
            if (fills.Count == 0) return;
            foreach (var f in fills) o[f[0], f[1]] = f[2];
        }
    }

    // pieces of 6 pixels or fewer that are not joined to the body
    static void Crumbs(int[,] o)
    {
        var id = new int[S, S];
        var sizes = new List<int> { 0 };
        for (int y = 0; y < S; y++)
            for (int x = 0; x < S; x++)
            {
                if (o[x, y] == 0 || id[x, y] != 0) continue;
                int n = sizes.Count, size = 0;
                var st = new Stack<int>(); st.Push(y * S + x); id[x, y] = n;
                while (st.Count > 0)
                {
                    int v = st.Pop(), vx = v % S, vy = v / S; size++;
                    for (int dy = -1; dy <= 1; dy++)
                        for (int dx = -1; dx <= 1; dx++)
                        {
                            int nx = vx + dx, ny = vy + dy;
                            if (nx < 0 || ny < 0 || nx >= S || ny >= S || o[nx, ny] == 0 || id[nx, ny] != 0) continue;
                            id[nx, ny] = n; st.Push(ny * S + nx);
                        }
                }
                sizes.Add(size);
            }
        for (int y = 0; y < S; y++)
            for (int x = 0; x < S; x++)
                if (o[x, y] != 0 && sizes[id[x, y]] <= 6) o[x, y] = 0;
    }

    static void Sheet(List<int[,]> frames, int x0, int y0, int w, int h, string path)
    {
        using (var bmp = new Bitmap(w * frames.Count, h, PixelFormat.Format32bppArgb))
        {
            for (int k = 0; k < frames.Count; k++)
                for (int y = 0; y < h; y++)
                    for (int x = 0; x < w; x++)
                    {
                        int sx = x0 + x, sy = y0 + y;
                        if (sx < S && sy < S && frames[k][sx, sy] != 0) bmp.SetPixel(k * w + x, y, Color.FromArgb(frames[k][sx, sy]));
                    }
            bmp.Save(path, ImageFormat.Png);
        }
    }
}

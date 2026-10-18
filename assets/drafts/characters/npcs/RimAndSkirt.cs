using System;
using System.Drawing;
using System.Drawing.Imaging;

// Prepares a shrunk style-sheet edit the way the NPCs were: the orange sunset rim on
// the back edge (the right, before mirroring) becomes the colour just inside it, the
// grey skirt goes maroon by brightness so Plaid.cs can repaint it as the HAU plaid,
// and the result is mirrored to face right.
public static class RimAndSkirt
{
    static double Lum(Color c) { return 0.3 * c.R + 0.59 * c.G + 0.11 * c.B; }
    static bool Rim(Color c) { return c.A >= 128 && c.R > 170 && c.G > 90 && c.B < 120 && c.R - c.B > 90 && c.R > c.G + 35; }

    public static string Run(string input, string output, int skirtTop, int skirtBottom) { return Run(input, output, skirtTop, skirtBottom, true); }

    // removeRim: false for a character whose hair is the rim's colour (blonde), where it would eat the hair
    public static string Run(string input, string output, int skirtTop, int skirtBottom, bool removeRim)
    {
        int rim = 0, skirt = 0;
        using (var src = new Bitmap(input))
        using (var im = new Bitmap(src))
        {
            int w = im.Width, h = im.Height;
            // rim: orange pixels on the back half or along the top of the hair, touching the
            // outside, become their darkest non-rim neighbour (hair, pack, skirt). The hands
            // and face are at the front and stay.
            // The rim is a band two or three pixels deep, so it is traced in from the outside
            // through rim-coloured pixels first, then every pixel of it is repainted.
            int mid = w / 2;
            var band = new bool[w, h];
            var queue = new System.Collections.Generic.Queue<int>();
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                {
                    if (!removeRim || !Rim(im.GetPixel(x, y)) || (x < mid && y > 10)) continue;
                    bool outside = false;
                    for (int dy = -1; dy <= 1; dy++)
                        for (int dx = -1; dx <= 1; dx++)
                        {
                            int nx = x + dx, ny = y + dy;
                            if (nx < 0 || ny < 0 || nx >= w || ny >= h || im.GetPixel(nx, ny).A < 128) outside = true;
                        }
                    if (outside) { band[x, y] = true; queue.Enqueue(y * w + x); }
                }
            while (queue.Count > 0)
            {
                int v = queue.Dequeue(), vx = v % w, vy = v / w;
                for (int dy = -1; dy <= 1; dy++)
                    for (int dx = -1; dx <= 1; dx++)
                    {
                        int nx = vx + dx, ny = vy + dy;
                        if (nx < 0 || ny < 0 || nx >= w || ny >= h || band[nx, ny]) continue;
                        if (!Rim(im.GetPixel(nx, ny)) || (nx < mid && ny > 10)) continue;
                        band[nx, ny] = true; queue.Enqueue(ny * w + nx);
                    }
            }
            // repaint from the inside out: each band pixel takes its darkest neighbour off the band
            for (int pass = 0; pass < 6; pass++)
                for (int y = 0; y < h; y++)
                    for (int x = 0; x < w; x++)
                    {
                        if (!band[x, y]) continue;
                        Color best = Color.Empty; double bestL = 999;
                        for (int dy = -1; dy <= 1; dy++)
                            for (int dx = -1; dx <= 1; dx++)
                            {
                                int nx = x + dx, ny = y + dy;
                                if (nx < 0 || ny < 0 || nx >= w || ny >= h || band[nx, ny]) continue;
                                var n = im.GetPixel(nx, ny);
                                if (n.A >= 128 && Lum(n) < bestL) { bestL = Lum(n); best = n; }
                            }
                        if (bestL < 150) { im.SetPixel(x, y, best); band[x, y] = false; rim++; }
                    }
            // skirt: low-saturation grey and charcoal in the skirt rows become maroon of the same brightness
            for (int y = skirtTop; y <= skirtBottom; y++)
                for (int x = 0; x < w; x++)
                {
                    var c = im.GetPixel(x, y);
                    if (c.A < 128) continue;
                    int max = Math.Max(c.R, Math.Max(c.G, c.B)), min = Math.Min(c.R, Math.Min(c.G, c.B));
                    if (max - min > 30 || max > 200) continue; // skin, blouse, ribbon stay
                    double l = Lum(c) / 140.0;
                    im.SetPixel(x, y, Color.FromArgb(255, (int)Math.Min(170, 45 + 120 * l), (int)(18 + 30 * l), (int)(28 + 35 * l)));
                    skirt++;
                }
            im.RotateFlip(RotateFlipType.RotateNoneFlipX);
            im.Save(output, ImageFormat.Png);
        }
        return "rim " + rim + ", skirt " + skirt;
    }
}


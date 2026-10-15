using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

// PixelLab draws a near-black outline round the whole character; the boy has none:
// his edges are a darker tone of whatever they belong to (hair, skin, shirt).
// This recolours each dark outline pixel on the silhouette to the colour just
// inside it, a little darker, so the NPCs match him.
public static class SoftEdges
{
    static double Lum(Color c) { return 0.3 * c.R + 0.59 * c.G + 0.11 * c.B; }

    public static int Run(string input, string output)
    {
        int changed = 0;
        using (var im = new Bitmap(input))
        {
            int w = im.Width, h = im.Height;
            var px = new Color[w, h];
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) px[x, y] = im.GetPixel(x, y);
            Func<int, int, bool> solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && px[x, y].A >= 128;
            var result = (Color[,])px.Clone();
            int[][] dirs = { new[] { 1, 0 }, new[] { -1, 0 }, new[] { 0, 1 }, new[] { 0, -1 } };
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                {
                    if (!solid(x, y)) continue;
                    bool rim = false;
                    foreach (var d in dirs) if (!solid(x + d[0], y + d[1])) rim = true;
                    if (!rim || Lum(px[x, y]) > 62) continue;
                    // look inward (away from the empty side) for the colour this edge belongs to
                    Color inside = Color.Empty;
                    int best = int.MaxValue;
                    for (int dy = -2; dy <= 2; dy++)
                        for (int dx = -2; dx <= 2; dx++)
                        {
                            int nx = x + dx, ny = y + dy;
                            if ((dx == 0 && dy == 0) || !solid(nx, ny)) continue;
                            var c = px[nx, ny];
                            if (Lum(c) <= 62) continue; // another outline pixel
                            bool onRim = false;
                            foreach (var d in dirs) if (!solid(nx + d[0], ny + d[1])) onRim = true;
                            int score = dx * dx + dy * dy + (onRim ? 3 : 0);
                            if (score < best) { best = score; inside = c; }
                        }
                    if (inside == Color.Empty) continue; // a dark part, like black hair or shoes: leave it
                    result[x, y] = Color.FromArgb(255, (int)(inside.R * 0.78), (int)(inside.G * 0.78), (int)(inside.B * 0.78));
                    changed++;
                }
            using (var o = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) if (result[x, y].A >= 128) o.SetPixel(x, y, Color.FromArgb(255, result[x, y].R, result[x, y].G, result[x, y].B));
                o.Save(output, ImageFormat.Png);
            }
        }
        return changed;
    }
}

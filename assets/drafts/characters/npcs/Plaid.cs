using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

// Repaints a maroon skirt as the HAU grey plaid: a blue-grey base with light
// checks, dark bands and a thin maroon line, repeating every 6 pixels. Each
// pixel keeps the brightness it had, so the pleats, folds and hem stay.
public static class Plaid
{
    static double Lum(Color c) { return 0.3 * c.R + 0.59 * c.G + 0.11 * c.B; }
    static bool IsSkirt(Color c) { return c.A >= 128 && c.R >= 45 && c.R <= 170 && c.G < 70 && c.B < 85 && c.R > c.G * 1.7; }

    static Color Pattern(int x, int y)
    {
        int u = ((x % 6) + 6) % 6, v = ((y % 6) + 6) % 6;
        if (u == 0 && v == 0) return Color.FromArgb(0x3e, 0x41, 0x55);
        if (u == 0 || v == 0) return Color.FromArgb(0x55, 0x58, 0x6e);
        if (u == 3 || v == 3) return Color.FromArgb(0x74, 0x46, 0x56);
        if (u <= 2 && v <= 2) return Color.FromArgb(0xa6, 0xa8, 0xb6);
        return Color.FromArgb(0x86, 0x89, 0x9b);
    }

    public static int Run(string input, string output, int top, int bottom)
    {
        int n = 0;
        using (var im = new Bitmap(input))
        {
            var lums = new List<double>();
            for (int y = top; y <= bottom; y++) for (int x = 0; x < im.Width; x++) { var c = im.GetPixel(x, y); if (IsSkirt(c)) lums.Add(Lum(c)); }
            if (lums.Count == 0) { im.Save(output, ImageFormat.Png); return 0; }
            lums.Sort();
            double mid = lums[lums.Count * 2 / 3]; // the skirt's lit colour
            int w = im.Width;
            var skirt = new bool[w, im.Height];
            for (int y = top; y <= bottom; y++) for (int x = 0; x < w; x++) skirt[x, y] = IsSkirt(im.GetPixel(x, y));
            // one tone per column (the pleat), from the column median: shadow, mid or light
            var tone = new double[w];
            for (int x = 0; x < w; x++)
            {
                var col = new List<double>();
                for (int y = top; y <= bottom; y++) if (skirt[x, y]) col.Add(Lum(im.GetPixel(x, y)));
                if (col.Count == 0) continue;
                col.Sort();
                double r = col[col.Count / 2] / mid;
                tone[x] = r < 0.8 ? 0.74 : r > 1.02 ? 1.08 : 0.94;
            }
            Color edge = Color.FromArgb(255, 0x34, 0x36, 0x48);
            using (var o = new Bitmap(im))
            {
                for (int y = top; y <= bottom; y++)
                    for (int x = 0; x < w; x++)
                    {
                        if (!skirt[x, y]) continue;
                        bool rim = x == 0 || x == w - 1 || !skirt[x - 1, y] && im.GetPixel(x - 1, y).A < 128 || !skirt[x + 1, y] && im.GetPixel(x + 1, y).A < 128
                            || y == bottom || !skirt[x, y + 1];
                        Color c;
                        if (rim) c = edge;
                        else
                        {
                            var p = Pattern(x, y);
                            double k = tone[x];
                            c = Color.FromArgb(255, (int)Math.Min(255, p.R * k), (int)Math.Min(255, p.G * k), (int)Math.Min(255, p.B * k));
                        }
                        o.SetPixel(x, y, c);
                        n++;
                    }
                o.Save(output, ImageFormat.Png);
            }
        }
        return n;
    }
}

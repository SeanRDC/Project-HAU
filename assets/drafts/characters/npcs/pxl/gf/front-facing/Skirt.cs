using System;
using System.Drawing;
using System.Drawing.Imaging;

// Her grey skirt (rows 43-58, left of the bag) goes maroon by brightness so Plaid.cs can
// repaint it as the HAU plaid. Skin (her hands), the near-black folds and hem, and the
// navy bag stay.
public static class Skirt2
{
    public static int Run(string input, string output)
    {
        int n = 0;
        using (var src = new Bitmap(input))
        using (var im = new Bitmap(src))
        {
            for (int y = 43; y <= 58; y++)
                for (int x = 0; x < im.Width; x++)
                {
                    if (!(x <= 25 || (y >= 55 && x <= 27))) continue;
                    var c = im.GetPixel(x, y);
                    if (c.A < 128) continue;
                    double l = 0.3 * c.R + 0.59 * c.G + 0.11 * c.B;
                    bool skin = c.R > 150 && c.R > c.B + 50;
                    bool navy = c.B > c.R + 12;
                    if (skin || navy || l < 45 || l > 175) continue;
                    double k = l / 140.0;
                    im.SetPixel(x, y, Color.FromArgb(255, (int)Math.Min(170, 45 + 120 * k), (int)(18 + 30 * k), (int)(28 + 35 * k)));
                    n++;
                }
            im.Save(output, ImageFormat.Png);
        }
        return n;
    }
}

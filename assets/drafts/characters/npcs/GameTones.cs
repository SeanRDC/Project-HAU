using System;
using System.Drawing;
using System.Drawing.Imaging;

// Moves a character drawn in another style onto the game's warm palette without redrawing it:
// pure blacks become warm near-blacks (hair, socks, shoes), stark whites become the NPCs'
// cream (blouse), and bright skin goes a little warmer and deeper. Each pixel keeps its place
// in its ramp, so the drawing, face and shading stay as they are. The navy bag, the plaid and
// anything already coloured are left alone. Run SoftEdges.cs after it for the outline.
public static class GameTones
{
    static double Lum(Color c) { return 0.3 * c.R + 0.59 * c.G + 0.11 * c.B; }
    static int Sat(Color c) { return Math.Max(c.R, Math.Max(c.G, c.B)) - Math.Min(c.R, Math.Min(c.G, c.B)); }

    // warm near-black ramp, from Bianca's darkest hair (#332224) down and up
    static readonly Color[] Black = { Color.FromArgb(0x1d, 0x15, 0x19), Color.FromArgb(0x29, 0x1d, 0x21), Color.FromArgb(0x36, 0x28, 0x2b), Color.FromArgb(0x4b, 0x37, 0x36) };
    // cream ramp, from Bianca's blouse (#e2c7bc)
    static readonly Color[] Cream = { Color.FromArgb(0xbe, 0x9f, 0x97), Color.FromArgb(0xd1, 0xb3, 0xa9), Color.FromArgb(0xe2, 0xc7, 0xbc), Color.FromArgb(0xee, 0xd8, 0xcd) };

    public static string Run(string input, string output, int blouseTop, int blouseBottom) { return Run(input, output, blouseTop, blouseBottom, -1, -1, -1, -1); }

    // bag: the box a dark navy bag sits in; there, bluish blacks stay (it is the bag), elsewhere they are hair
    public static string Run(string input, string output, int blouseTop, int blouseBottom, int bagX0, int bagY0, int bagX1, int bagY1)
    {
        int blacks = 0, whites = 0, skins = 0;
        using (var src = new Bitmap(input))
        using (var im = new Bitmap(src))
        {
            for (int y = 0; y < im.Height; y++)
                for (int x = 0; x < im.Width; x++)
                {
                    var c = im.GetPixel(x, y);
                    if (c.A < 128) continue;
                    double l = Lum(c);
                    bool inBag = x >= bagX0 && x <= bagX1 && y >= bagY0 && y <= bagY1;
                    if (l < 70 && Sat(c) < 40 && !(inBag && c.B > c.R + 8))
                    {
                        // near-black, except the navy bag: hair, socks, shoes
                        int k = l < 12 ? 0 : l < 26 ? 1 : l < 42 ? 2 : 3;
                        im.SetPixel(x, y, Black[k]); blacks++;
                    }
                    else if (y >= blouseTop && y <= blouseBottom && l > 165 && Sat(c) < 45)
                    {
                        int k = l < 195 ? 0 : l < 218 ? 1 : l < 236 ? 2 : 3;
                        im.SetPixel(x, y, Cream[k]); whites++;
                    }
                    else if (c.R > 150 && c.R > c.B + 50 && c.G < 200)
                    {
                        im.SetPixel(x, y, Color.FromArgb(255, (int)(c.R * 0.94), (int)(c.G * 0.88), (int)(c.B * 0.84))); skins++;
                    }
                }
            im.Save(output, ImageFormat.Png);
        }
        return string.Format("blacks {0}, whites {1}, skin {2}", blacks, whites, skins);
    }
}

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;

// Sprite review: per frame, the pieces not attached to the body (8-connected
// islands other than the largest), small enclosed holes, and notches.
public static class SpriteCheck
{
    public static string Run(string sheet, int frames)
    {
        var log = new StringBuilder();
        using (var im = new Bitmap(sheet))
        {
            int fw = im.Width / frames, h = im.Height;
            for (int f = 0; f < frames; f++)
            {
                var op = new bool[fw, h];
                for (int y = 0; y < h; y++) for (int x = 0; x < fw; x++) op[x, y] = im.GetPixel(f * fw + x, y).A >= 128;
                // islands
                var id = new int[fw, h]; var sizes = new List<int> { 0 }; var where = new List<string> { "" };
                for (int y = 0; y < h; y++)
                    for (int x = 0; x < fw; x++)
                    {
                        if (!op[x, y] || id[x, y] != 0) continue;
                        int n = sizes.Count, size = 0; var st = new Stack<int[]>(); st.Push(new[] { x, y }); id[x, y] = n;
                        int minx = x, miny = y;
                        while (st.Count > 0)
                        {
                            var p = st.Pop(); size++;
                            minx = Math.Min(minx, p[0]); miny = Math.Min(miny, p[1]);
                            for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++)
                                {
                                    int nx = p[0] + dx, ny = p[1] + dy;
                                    if (nx < 0 || ny < 0 || nx >= fw || ny >= h || !op[nx, ny] || id[nx, ny] != 0) continue;
                                    id[nx, ny] = n; st.Push(new[] { nx, ny });
                                }
                        }
                        sizes.Add(size); where.Add(minx + "," + miny);
                    }
                int main = 1; for (int i = 1; i < sizes.Count; i++) if (sizes[i] > sizes[main]) main = i;
                var bits = new List<string>();
                for (int i = 1; i < sizes.Count; i++) if (i != main) bits.Add(sizes[i] + "px@" + where[i]);
                // notches: transparent with body on 3-4 sides
                var notches = new List<string>();
                for (int y = 1; y < h - 1; y++) for (int x = 1; x < fw - 1; x++)
                    {
                        if (op[x, y]) continue;
                        int s = (op[x - 1, y] ? 1 : 0) + (op[x + 1, y] ? 1 : 0) + (op[x, y - 1] ? 1 : 0) + (op[x, y + 1] ? 1 : 0);
                        if (s >= 3) notches.Add(x + "," + y);
                    }
                if (bits.Count > 0 || notches.Count > 0)
                    log.AppendLine(string.Format("  frame {0}: islands [{1}] notches [{2}]", f, string.Join(" ", bits), string.Join(" ", notches)));
            }
        }
        return log.ToString();
    }
}


using System.Collections.Generic;
using System.Drawing;

// Where each NPC's parts are on its 64 x 96 canvas (npcs/rig/<id>-canvas.png, feet
// on row 91, facing right). Measured from their sprites; see the session notes.
public static partial class NpcRig
{
    static int Hex(int rgb) { return Color.FromArgb(255, (rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255).ToArgb(); }
    static int[] Pal(params int[] rgb) { var a = new int[rgb.Length]; for (int i = 0; i < rgb.Length; i++) a[i] = Hex(rgb[i]); return a; }

    // outline, base, shade, light, crease, then the far leg's base, shade, light, crease
    static readonly int[] BlackPants = Pal(0x111114, 0x2e2e36, 0x1b1b20, 0x4a4a56, 0x40404b, 0x1d1d23, 0x141418, 0x2e2e36, 0x28282f);
    static readonly int[] BrownPants = Pal(0x131011, 0x392821, 0x211716, 0x56402f, 0x4a3628, 0x2a1d18, 0x18110f, 0x3a2a22, 0x33251e);

    public static List<Setup> Cast()
    {
        return new List<Setup>
        {
            new Setup
            {
                Id = "migo", HeadBottom = 33, CrownBottom = 15,
                ArmMode = "light", NearX0 = 21, NearX1 = 26, NearHandX1 = 27, NearHandY = 58, NearY0 = 39, NearY1 = 65, ElbowRow = 51,
                NearShoulder = new PointF(24f, 41.5f), NearElbow = new PointF(24f, 51.5f), FarShoulderX = 42.5f,
                FarX0 = 40, FarX1 = 46, FarY0 = 38, FarY1 = 65,
                PackX = 21, PackY0 = 36, PackSide = Hex(0x21263f), TorsoBottom = 61, PackBottomX = 22, PackBottomY = 65,
                HipY = 63f, NearHipX = 28.5f, FarHipX = 35.5f, Thigh = 11.5f, Shin = 11.5f, HipX0 = 25, HipX1 = 39, Legs = BlackPants,
                Skin = Hex(0xcf8156), Lash = Hex(0x131016), NearEye = new[] { 31, 35, 23, 26, 25 }, FarEye = new[] { 40, 42, 23, 26, 25 }, Mouth = new[] { 36, 30 },
            },
            new Setup
            {
                Id = "kuya-ben", HeadBottom = 34, CrownBottom = 15,
                // his arms are dark sleeves under the vest, so they are cut by area, not by lightness
                ArmMode = "box", NearX0 = 17, NearX1 = 24, NearHandX1 = 24, NearHandY = 60, NearY0 = 38, NearY1 = 65, ElbowRow = 51,
                NearShoulder = new PointF(21.5f, 40.5f), NearElbow = new PointF(21.5f, 51.5f), FarShoulderX = 40.5f,
                FarX0 = 40, FarX1 = 43, FarY0 = 38, FarY1 = 64,
                PackSide = Hex(0x7a5e24), TorsoBottom = 61,
                HipY = 63f, NearHipX = 26.5f, FarHipX = 34.5f, Thigh = 11.5f, Shin = 11.5f, HipX0 = 23, HipX1 = 38, Legs = BrownPants,
                Skin = Hex(0xae5f3e), Lash = Hex(0x1b1719), NearEye = new[] { 30, 34, 23, 27, 26 }, FarEye = new[] { 39, 40, 23, 27, 26 }, Mouth = new[] { 35, 30 },
            },
            new Setup
            {
                Id = "bea", HeadBottom = 34, CrownBottom = 18,
                ArmMode = "nopack", NearX0 = 26, NearX1 = 33, NearHandX1 = 33, NearHandY = 58, NearY0 = 38, NearY1 = 61, ElbowRow = 49,
                NearShoulder = new PointF(29.5f, 40f), NearElbow = new PointF(29.5f, 49.5f), FarShoulderX = 45.5f,
                FarX0 = 44, FarX1 = 49, FarY0 = 38, FarY1 = 64,
                PackX = 26, PackY0 = 36, PackY1 = 61, PackSide = Hex(0xd9949b), TorsoBottom = 76,
                HipY = 64f, NearHipX = 31.5f, FarHipX = 38.5f, Thigh = 11f, Shin = 11f, Skirt = true, LegR = 2.6f, LegR2 = 2.4f,
                Legs = Pal(0x8a4441, 0xd2825e, 0xbc644d, 0xdd9468, 0xd2825e, 0xbc644d, 0xa9574e, 0xc8704f, 0xbc644d),
                SockFrom = 1.45f, Socks = Pal(0x896b75, 0xedd0c9, 0xccb0b0),
                Skin = Hex(0xd2825e), Lash = Hex(0x1d101b), NearEye = new[] { 36, 40, 24, 28, 27 }, FarEye = new[] { 45, 47, 24, 28, 27 }, Mouth = new[] { 42, 31 },
            },
            new Setup
            {
                Id = "bianca", HeadBottom = 34, CrownBottom = 18,
                ArmMode = "nopack", NearX0 = 26, NearX1 = 30, NearHandX1 = 31, NearHandY = 58, NearY0 = 38, NearY1 = 62, ElbowRow = 49,
                NearShoulder = new PointF(28.5f, 40f), NearElbow = new PointF(28.5f, 49.5f), FarShoulderX = 44.5f,
                FarX0 = 43, FarX1 = 48, FarY0 = 38, FarY1 = 64,
                PackX = 25, PackY0 = 36, PackY1 = 61, PackSide = Hex(0x2b3451), TorsoBottom = 75,
                HipY = 63f, NearHipX = 29.5f, FarHipX = 37.5f, Thigh = 11.5f, Shin = 11.5f, Skirt = true, LegR = 2.6f, LegR2 = 2.4f,
                Legs = Pal(0x8d4138, 0xbb6849, 0xa9685a, 0xc97a55, 0xbb6849, 0xa9685a, 0x935a4e, 0xb36a4a, 0xa9685a),
                SockFrom = 1.45f, Socks = Pal(0x645660, 0xd3bbb0, 0xc4ada9),
                Skin = Hex(0xcb7d55), Lash = Hex(0x0d0a15), NearEye = new[] { 35, 38, 25, 28, 27 }, FarEye = new[] { 43, 45, 25, 28, 27 }, Mouth = new[] { 40, 31 },
            },
            new Setup
            {
                Id = "rica", HeadBottom = 35, CrownBottom = 18,
                ArmMode = "light", NearX0 = 20, NearX1 = 27, NearHandX1 = 28, NearHandY = 56, NearY0 = 38, NearY1 = 63, ElbowRow = 52,
                NearShoulder = new PointF(25.5f, 40f), NearElbow = new PointF(25.5f, 51.5f), FarShoulderX = 44.5f,
                FarX0 = 43, FarX1 = 47, FarY0 = 38, FarY1 = 63,
                PackSide = Hex(0xd8c0bc), TorsoBottom = 76,
                HipY = 64f, NearHipX = 29.5f, FarHipX = 37.5f, Thigh = 11f, Shin = 11f, Skirt = true, LegR = 2.6f, LegR2 = 2.4f,
                Legs = Pal(0x8a4441, 0xd2825e, 0xbc644d, 0xdd9468, 0xd2825e, 0xbc644d, 0xa9574e, 0xc8704f, 0xbc644d),
                SockFrom = 1.5f, Socks = Pal(0x896b75, 0xedd0c9, 0xccb0b0),
                Skin = Hex(0xce7d59), Lash = Hex(0x241721), NearEye = new[] { 33, 36, 25, 28, 27 }, FarEye = new[] { 41, 43, 25, 28, 27 }, Mouth = new[] { 38, 31 },
            },
            new Setup
            {
                Id = "paolo", HeadBottom = 34, CrownBottom = 18,
                ArmMode = "light", NearX0 = 21, NearX1 = 27, NearHandX1 = 28, NearHandY = 58, NearY0 = 39, NearY1 = 65, ElbowRow = 51,
                NearShoulder = new PointF(25.5f, 41.5f), NearElbow = new PointF(25.5f, 51.5f), FarShoulderX = 43.5f,
                FarX0 = 41, FarX1 = 45, FarY0 = 39, FarY1 = 64,
                PackX = 23, PackY0 = 35, PackSide = Hex(0x3a4a2e), TorsoBottom = 61, PackBottomX = 24, PackBottomY = 65,
                HipY = 63f, NearHipX = 30.5f, FarHipX = 37.5f, Thigh = 11.5f, Shin = 11.5f, HipX0 = 27, HipX1 = 41, Legs = BlackPants,
                // his eyes sit inside the glasses: the blink stays within the frames
                Skin = Hex(0xcf8968), Lash = Hex(0x1e1c1f), NearEye = new[] { 33, 36, 23, 25, 25 }, FarEye = new[] { 42, 43, 23, 25, 25 }, Mouth = new[] { 38, 30 },
            },
            new Setup
            {
                Id = "ate-lorna", HeadBottom = 36, CrownBottom = 18,
                // a red sleeve is too dark to cut by lightness
                ArmMode = "box", NearX0 = 25, NearX1 = 29, NearHandX1 = 29, NearHandY = 56, NearY0 = 39, NearY1 = 63, ElbowRow = 50,
                NearShoulder = new PointF(27f, 41f), NearElbow = new PointF(27f, 50.5f), FarShoulderX = 45f,
                FarX0 = 44, FarX1 = 47, FarY0 = 39, FarY1 = 63,
                PackSide = Hex(0x7a2626), TorsoBottom = 61, ApronBottom = 80,
                HipY = 63f, NearHipX = 28.5f, FarHipX = 35.5f, Thigh = 11.5f, Shin = 11.5f, HipX0 = 26, HipX1 = 40,
                Legs = Pal(0x19141a, 0x2e2c2f, 0x221f24, 0x3e3c42, 0x38363c, 0x242226, 0x1a171b, 0x2e2c30, 0x2a282c),
                Skin = Hex(0xcd7e5b), Lash = Hex(0x1f121d), NearEye = new[] { 34, 38, 25, 28, 27 }, FarEye = new[] { 43, 45, 25, 28, 27 }, Mouth = new[] { 40, 31 },
            },
            new Setup
            {
                Id = "coach-gab", HeadBottom = 33, CrownBottom = 15,
                // green long sleeves: cut by area
                ArmMode = "box", NearX0 = 17, NearX1 = 24, NearHandX1 = 25, NearHandY = 58, NearY0 = 38, NearY1 = 66, ElbowRow = 50,
                NearShoulder = new PointF(22f, 40.5f), NearElbow = new PointF(22f, 50.5f), FarShoulderX = 41f,
                FarX0 = 39, FarX1 = 43, FarY0 = 38, FarY1 = 66,
                PackSide = Hex(0x245a3c), TorsoBottom = 61,
                HipY = 63f, NearHipX = 27.5f, FarHipX = 34.5f, Thigh = 11.5f, Shin = 11.5f, HipX0 = 24, HipX1 = 38,
                Legs = Pal(0x161325, 0x312f48, 0x1f1d32, 0x46446a, 0x3c3a56, 0x26243a, 0x18172a, 0x34324e, 0x2e2c44),
                Shoes = Pal(0x6a6a78, 0xe6e6ef, 0xb8bdce, 0xffffff, 0xffffff, 0x8e8e99),
                Skin = Hex(0xaf614a), Lash = Hex(0x15131e), NearEye = new[] { 30, 34, 24, 27, 26 }, FarEye = new[] { 39, 41, 24, 27, 26 }, Mouth = new[] { 36, 30 },
            },
        };
    }
}

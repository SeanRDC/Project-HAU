# Builds Lance as a low-poly 3D model for the cutscenes, from his expression sheet
# (assets/drafts/characters/portraits/src/lance-sheet.png) and the game's student sprite:
# a mop of round curls as the sprite has, a white collared shirt with short sleeves and a dark tie, the dark red backpack
# with its straps over both shoulders, black trousers and shoes.
#
# Every part is a named material slot (skin, face, hair, shirt, tie, bag, pants, shoes);
# Godot gives each one its two-tone cel shading and the palette (actor.gd), and the face
# is a flat front patch mapped to a pixel texture, so his expressions swap like portraits.
#
#   blender --background --factory-startup --python tools/blender/lance.py
# writes src/drafts/aps-godot/models/lance.glb and assets/drafts/3d/lance.blend (to edit).
import bpy, bmesh, math, os, random
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
GLB = os.path.join(ROOT, "src", "drafts", "aps-godot", "models", "lance.glb")
BLEND = os.path.join(ROOT, "assets", "drafts", "3d", "lance.blend")

# Blender: z up, the front is -y (the glTF export turns it to Godot's +z).
HEAD_C = Vector((0.0, -0.008, 1.606))
HEAD_R = Vector((0.134, 0.132, 0.148))
# the face patch: where the pixel face texture sits (x across, z up), in metres
FACE_X = (-0.118, 0.118)
FACE_Z = (1.448, 1.694)

PALETTE = {  # the portraits' palette (assets/drafts/characters/portraits), for viewing in Blender
    "skin": "#ecbba1", "face": "#ecbba1", "hair": "#7f4733", "shirt": "#efe3d6", "tie": "#3d3436",
    "bag": "#7d2c33", "pants": "#2a262c", "shoes": "#2f2624",
}

random.seed(20260611)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0   # no lance.blend1 backups
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"

def material(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    h = PALETTE[name].lstrip("#")
    m.diffuse_color = (*[(int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)], 1.0)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = m.diffuse_color
        bsdf.inputs["Roughness"].default_value = 1.0
    return m

class Part:
    """One mesh being built: vertices and faces, each face with a material slot. Faces added
    with crease=True keep sharp edges when the model is smoothed (lance_hd.py): the collar,
    tie, bag and straps are flat things, not blobs."""
    def __init__(self, name):
        self.name, self.verts, self.faces, self.mats, self.slots, self.creased = name, [], [], [], [], []

    def slot(self, mat):
        if mat not in self.slots:
            self.slots.append(mat)
        return self.slots.index(mat)

    def add(self, verts, faces, mat, crease=False):
        o, s = len(self.verts), self.slot(mat)
        self.verts += [Vector(v) for v in verts]
        for f in faces:
            if crease:
                self.creased.append(len(self.faces))
            self.faces.append([o + i for i in f])
            self.mats.append(s)

    def build(self, smooth=True):
        me = bpy.data.meshes.new(self.name)
        me.from_pydata([tuple(v) for v in self.verts], [], self.faces)
        me.update()
        for p, m in zip(me.polygons, self.mats):
            p.material_index = m
            p.use_smooth = smooth
        for m in self.slots:
            me.materials.append(material(m))
        ob = bpy.data.objects.new(self.name, me)
        scene.collection.objects.link(ob)
        bm = bmesh.new(); bm.from_mesh(me)
        flag = bm.faces.layers.int.new("creased")            # marked before welding moves faces about
        bm.faces.ensure_lookup_table()
        for i in self.creased:
            bm.faces[i][flag] = 1
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        if self.creased:
            crease = bm.edges.layers.float.get("crease_edge") or bm.edges.layers.float.new("crease_edge")
            for face in bm.faces:
                if face[flag]:
                    for e in face.edges:
                        e[crease] = 1.0
        bm.faces.layers.int.remove(flag)
        bm.to_mesh(me); bm.free()
        return ob

# --- shapes -----------------------------------------------------------------------------

def tube(part, rings, sides, mat, cap_bottom=True, cap_top=True, phase=0.0):
    """A tube through rings of (centre, rx, ry): an elliptical cross-section at each."""
    verts, faces = [], []
    for c, rx, ry in rings:
        for i in range(sides):
            a = 2 * math.pi * (i + phase) / sides
            verts.append((c[0] + rx * math.cos(a), c[1] + ry * math.sin(a), c[2]))
    for r in range(len(rings) - 1):
        for i in range(sides):
            j = (i + 1) % sides
            faces.append([r * sides + i, r * sides + j, (r + 1) * sides + j, (r + 1) * sides + i])
    n = len(verts)
    if cap_bottom:
        verts.append(tuple(rings[0][0])); faces += [[n, (i + 1) % sides, i] for i in range(sides)]
    if cap_top:
        t = len(verts); top = (len(rings) - 1) * sides
        verts.append(tuple(rings[-1][0])); faces += [[t, top + i, top + (i + 1) % sides] for i in range(sides)]
    part.add(verts, faces, mat)

def limb(part, a, b, ra, rb, sides, mat):
    """A tube from point a to point b, round, radius ra to rb."""
    a, b = Vector(a), Vector(b)
    d = (b - a).normalized()
    u = d.cross(Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0))).normalized()
    v = d.cross(u)
    verts, faces = [], []
    for c, r in ((a, ra), (b, rb)):
        for i in range(sides):
            t = 2 * math.pi * i / sides
            verts.append(tuple(c + (u * math.cos(t) + v * math.sin(t)) * r))
    for i in range(sides):
        j = (i + 1) % sides
        faces.append([i, j, sides + j, sides + i])
    verts += [tuple(a), tuple(b)]
    faces += [[2 * sides, j, i] for i, j in ((i, (i + 1) % sides) for i in range(sides))]
    faces += [[2 * sides + 1, sides + i, sides + (i + 1) % sides] for i in range(sides)]
    part.add(verts, faces, mat)

def box(part, centre, size, mat, rot_x=0.0, crease=True):
    c, (sx, sy, sz) = Vector(centre), size
    vs = []
    for x in (-1, 1):
        for y in (-1, 1):
            for z in (-1, 1):
                p = Vector((x * sx / 2, y * sy / 2, z * sz / 2))
                p.rotate(__import__("mathutils").Euler((rot_x, 0, 0)))
                vs.append(tuple(c + p))
    faces = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]
    part.add(vs, faces, mat, crease)

def strip(part, points, width, thick, mat, side=Vector((1, 0, 0))):
    """A flat band (a strap) along points, width across `side`."""
    verts, faces, n = [], [], len(points)
    for i, p in enumerate(points):
        p = Vector(p)
        d = (Vector(points[min(i + 1, n - 1)]) - Vector(points[max(i - 1, 0)])).normalized()
        out = d.cross(side).normalized()
        for s in (-1, 1):
            for t in (0, 1):
                verts.append(tuple(p + side * (s * width / 2) + out * (t * thick)))
    for i in range(n - 1):
        a, b = i * 4, (i + 1) * 4
        faces += [[a + 0, b + 0, b + 2, a + 2], [a + 1, a + 3, b + 3, b + 1], [a + 0, a + 1, b + 1, b + 0], [a + 2, b + 2, b + 3, a + 3]]
    faces += [[0, 2, 3, 1], [(n - 1) * 4 + 0, (n - 1) * 4 + 1, (n - 1) * 4 + 3, (n - 1) * 4 + 2]]
    part.add(verts, faces, mat, crease=True)

# --- the head -----------------------------------------------------------------------------

head = Part("Head")
SEG, RINGS = 14, 10
hv, hf, face_quads = [], [], []
for r in range(RINGS + 1):
    phi = math.pi * r / RINGS                       # 0 at the top
    for s in range(SEG):
        th = 2 * math.pi * s / SEG + math.pi / SEG  # a column either side of the middle
        x, y, z = math.sin(phi) * math.cos(th), math.sin(phi) * math.sin(th), math.cos(phi)
        # the jaw: the face stays wide and full down the cheeks, then rounds off to a small, soft chin
        if z < -0.05:
            t = min(1.0, (-z - 0.05) / 0.95)
            full = (math.sin(phi) ** 0.45) / max(math.sin(phi), 1e-4)  # cheeks round out: a U, not a V
            x *= full * (1.0 - 0.10 * t ** 2)
            y *= full
            z = -0.05 + (z + 0.05) * 0.95           # the lower face long and full, the eyes near the middle
            y *= 1.0 - 0.16 * t
        hv.append(HEAD_C + Vector((x * HEAD_R.x, y * HEAD_R.y, z * HEAD_R.z)))
for r in range(RINGS):
    for s in range(SEG):
        a, b = r * SEG + s, r * SEG + (s + 1) % SEG
        hf.append([a, b, b + SEG, a + SEG])
head.add(hv, hf, "skin")
# the face: front quads, between the brow and the chin, take the face material
for i, f in enumerate(head.faces):
    c = sum((head.verts[k] for k in f), Vector()) / 4
    if c.y < HEAD_C.y - 0.045 and FACE_Z[0] < c.z < FACE_Z[1] and FACE_X[0] < c.x < FACE_X[1]:
        head.mats[i] = head.slot("face")
# ears
for sx in (-1, 1):
    ex, ez = HEAD_R.x, HEAD_C.z
    tube(head, [((sx * ex * 0.95, 0.004, ez - 0.046), 0.012, 0.022), ((sx * ex * 1.07, 0.006, ez - 0.016), 0.013, 0.027),
                ((sx * ex * 0.99, 0.008, ez + 0.016), 0.008, 0.018)], 6, "skin")
# neck
tube(head, [((0, 0.006, 1.40), 0.042, 0.040), ((0, 0.010, 1.52), 0.040, 0.038)], 8, "skin")
head_ob = head.build()

# planar UVs for the face: x across, z up, over the face patch
me = head_ob.data
uv = me.uv_layers.new(name="UVMap")
face_slot = [m.name for m in me.materials].index("face")
for p in me.polygons:
    for li in p.loop_indices:
        v = me.vertices[me.loops[li].vertex_index].co
        if p.material_index == face_slot:
            uv.data[li].uv = ((v.x - FACE_X[0]) / (FACE_X[1] - FACE_X[0]), (v.z - FACE_Z[0]) / (FACE_Z[1] - FACE_Z[0]))
        else:
            uv.data[li].uv = (0.5, 0.5)

# --- the hair: curls, like the game's boy sprite ---------------------------------------------
# The student sprite (src/drafts/aps-godot/sprites/boy) has a mop of round curls: piled high
# and puffy on top, a curly fringe sweeping across the forehead, lower on one side with a curl
# down to the brow, short at the sides with the ears showing, and rounded off at the nape.
# Every curl is a small, slightly squashed ball; the toon shading gives each one its lit side
# and its shadow, and the outline marks it off from the curls behind, as the sprite's do.

hair = Part("Hair")
CAP_C = HEAD_C + Vector((0.0, 0.006, 0.016))
CAP = Vector((HEAD_R.x * 1.06, HEAD_R.y * 1.07, HEAD_R.z * 1.05))

def on_cap(az, el, grow=1.0):
    """A point on the hair cap: az round from the front (0 = front, +x = 90 deg), el up from level."""
    return CAP_C + Vector((math.sin(az) * math.cos(el) * CAP.x, -math.cos(az) * math.cos(el) * CAP.y, math.sin(el) * CAP.z)) * grow

def normal_at(az, el):
    p = on_cap(az, el) - CAP_C
    return Vector((p.x / CAP.x ** 2, p.y / CAP.y ** 2, p.z / CAP.z ** 2)).normalized()

def hairline(az):
    """Where the hair starts: high over the brow, just above the ears, and from just behind the
    ears down to the jaw at the back, as the sprite's hangs."""
    f = math.cos(az)
    if f > 0:
        return math.radians(10 + 14 * f)
    if f > -0.22:
        return math.radians(10)                     # over the ear
    return math.radians(10 - 68 * min(1.0, (-f - 0.22) / 0.4))

# the cap under the curls
cv, cf, SEGC, RC = [], [], 18, 8
for r in range(RC + 1):
    for s in range(SEGC):
        az = 2 * math.pi * s / SEGC
        el = math.pi / 2 - (math.pi / 2 - hairline(az)) * r / RC
        cv.append(on_cap(az, el))
for r in range(RC):
    for s in range(SEGC):
        a, b = r * SEGC + s, r * SEGC + (s + 1) % SEGC
        cf.append([a, a + SEGC, b + SEGC, b])
hair.add(cv, cf, "hair")

jit = lambda a: random.uniform(-a, a)

def curl(c, r, squash=0.82, seg=7, rings=4, spin=0.0):
    """One curl: a small low-poly ball, a little flattened."""
    verts, faces = [tuple(c + Vector((0, 0, r * squash)))], []
    for i in range(1, rings):
        phi = math.pi * i / rings
        for s in range(seg):
            th = 2 * math.pi * s / seg + spin
            lump = 1.0 + jit(0.14)                  # not a perfect ball: a loose curl
            verts.append(tuple(c + Vector((math.sin(phi) * math.cos(th) * r * lump, math.sin(phi) * math.sin(th) * r * lump, math.cos(phi) * r * squash * lump))))
    verts.append(tuple(c + Vector((0, 0, -r * squash))))
    bottom = len(verts) - 1
    for s in range(seg):
        faces.append([0, 1 + s, 1 + (s + 1) % seg])
        faces.append([bottom, 1 + (rings - 2) * seg + (s + 1) % seg, 1 + (rings - 2) * seg + s])
    for i in range(rings - 2):
        for s in range(seg):
            a, b = 1 + i * seg + s, 1 + i * seg + (s + 1) % seg
            faces.append([a, a + seg, b + seg, b])
    hair.add(verts, faces, "hair")

# the mop: curls spread evenly over the cap (a Fibonacci spiral), bigger and standing further
# out towards the top, so the hair piles up high and round like the sprite's
N = 64
for i in range(N):
    z = 1 - 2 * (i + 0.5) / N
    el = math.asin(z)
    az = (i * math.pi * (3 - math.sqrt(5))) % (2 * math.pi)
    if el < hairline(az) + math.radians(4):
        continue
    if math.cos(az) > 0.35 and el < math.radians(42):
        continue                                    # the fringe covers the front
    up = max(0.0, math.sin(el))
    r = 0.048 + 0.014 * up + jit(0.006)
    n = normal_at(az, el)
    curl(on_cap(az, el) + n * r * (0.35 + 0.75 * up ** 2), r, spin=jit(1))   # standing out: a bumpy outline, piled high on top
# the fringe: a row of curls over the forehead down to the brows, sweeping lower towards his
# left (+x)
for i in range(6):
    t = i / 5
    az = -1.0 + 2.05 * t + jit(0.04)
    el = math.radians(22 - 12 * t + jit(2))
    r = 0.047 + jit(0.004)
    n = normal_at(az, el)
    curl(on_cap(az, el) + n * r * 0.35 + Vector((0, -0.006, -0.014)), r, spin=jit(1))
# ...and the curls that fall from it to the brow on that side
for az, el, r in ((0.30, 2, 0.036), (0.66, 0, 0.034)):
    el = math.radians(el)
    curl(on_cap(az, el) + normal_at(az, el) * r * 0.45, r, spin=jit(1))
# above the ears and round the nape: smaller curls, keeping the sides short
for i in range(10):
    az = math.radians(80) + (2 * math.pi - math.radians(160)) * i / 9 + jit(0.06)
    el = hairline(az) + math.radians(8)
    r = 0.038 + jit(0.004)
    curl(on_cap(az, el) + normal_at(az, el) * r * 0.25, r, spin=jit(1))
hair.build()

# --- the body -------------------------------------------------------------------------------
# A slim, young build: shoulders only a little wider than the head, a narrow, straight chest,
# fitted short sleeves, thin arms hanging close to the sides with the hands at mid-thigh,
# slim legs, and big, round shoes.

body = Part("Body")
# shirt: hem to shoulders, closing in to the collar
tube(body, [((0, 0.004, 0.90), 0.148, 0.094), ((0, 0.004, 1.02), 0.142, 0.090), ((0, 0.0, 1.16), 0.144, 0.088),
            ((0, -0.002, 1.28), 0.152, 0.092), ((0, 0.0, 1.36), 0.160, 0.088), ((0, 0.004, 1.418), 0.124, 0.072),
            ((0, 0.006, 1.452), 0.062, 0.054)], 12, "shirt", cap_top=False, phase=0.5)
# the collar: two pointed flaps either side of the tie, standing a little off the neck
for sx in (-1, 1):
    box(body, (sx * 0.036, -0.066, 1.433), (0.054, 0.012, 0.05), "shirt", rot_x=0.35)
    body.add([(sx * 0.010, -0.074, 1.455), (sx * 0.066, -0.056, 1.458), (sx * 0.028, -0.098, 1.378),
              (sx * 0.010, -0.084, 1.455), (sx * 0.066, -0.066, 1.458), (sx * 0.028, -0.106, 1.381)],
             [[0, 1, 2], [3, 5, 4], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]], "shirt", crease=True)
# tie: knot and blade, down the front of the shirt
box(body, (0, -0.088, 1.425), (0.028, 0.020, 0.028), "tie")
body.add([(-0.016, -0.100, 1.41), (0.016, -0.100, 1.41), (0.023, -0.098, 1.16), (0, -0.098, 1.136), (-0.023, -0.098, 1.16),
          (-0.016, -0.092, 1.41), (0.016, -0.092, 1.41), (0.023, -0.090, 1.16), (0, -0.090, 1.136), (-0.023, -0.090, 1.16)],
         [[0, 1, 2, 3, 4], [9, 8, 7, 6, 5], [0, 5, 6, 1], [1, 6, 7, 2], [2, 7, 8, 3], [3, 8, 9, 4], [4, 9, 5, 0]], "tie", crease=True)
# arms: fitted short sleeves, then each thin arm one piece from under the sleeve to the
# fingertips (the hand flat, its palm to the leg), hanging close to the body
for sx in (-1, 1):
    sh, el, wr = Vector((sx * 0.158, 0.0, 1.365)), Vector((sx * 0.178, 0.008, 1.100)), Vector((sx * 0.186, -0.012, 0.860))
    limb(body, sh, sh.lerp(el, 0.45), 0.046, 0.043, 8, "shirt")
    tube(body, [(tuple(p), rx, ry) for p, rx, ry in (
        (sh.lerp(el, 0.25), 0.033, 0.033), (el, 0.030, 0.029), (el.lerp(wr, 0.5), 0.028, 0.026), (wr, 0.022, 0.020),
        (wr + Vector((sx * 0.003, -0.004, -0.040)), 0.020, 0.036), (wr + Vector((sx * 0.003, -0.008, -0.088)), 0.014, 0.026))],
        8, "skin")
# trousers and shoes
tube(body, [((0, 0.006, 0.80), 0.146, 0.094), ((0, 0.006, 0.93), 0.144, 0.092)], 12, "pants", phase=0.5)
for sx in (-1, 1):
    limb(body, (sx * 0.074, 0.006, 0.86), (sx * 0.078, 0.010, 0.46), 0.066, 0.054, 8, "pants")
    limb(body, (sx * 0.078, 0.010, 0.46), (sx * 0.080, 0.020, 0.08), 0.054, 0.048, 8, "pants")
    tube(body, [((sx * 0.080, -0.020, 0.0), 0.058, 0.128), ((sx * 0.080, -0.020, 0.055), 0.058, 0.126),
                ((sx * 0.080, -0.004, 0.100), 0.050, 0.085)], 10, "shoes")
# the backpack and its straps over both shoulders
box(body, (0, 0.160, 1.150), (0.260, 0.130, 0.360), "bag")
box(body, (0, 0.230, 1.090), (0.200, 0.040, 0.170), "bag")            # front pocket
tube(body, [((0, 0.160, 1.33), 0.130, 0.065), ((0, 0.150, 1.36), 0.095, 0.045)], 8, "bag")  # the rounded top
for sx in (-1, 1):
    strip(body, [(sx * 0.092, 0.100, 1.300), (sx * 0.098, 0.068, 1.418), (sx * 0.104, 0.000, 1.448), (sx * 0.110, -0.082, 1.390),
                 (sx * 0.114, -0.098, 1.300), (sx * 0.118, -0.094, 1.140), (sx * 0.130, -0.072, 1.010), (sx * 0.132, 0.055, 0.985)],
          0.046, 0.013, "bag")
body.build()

# --- out ----------------------------------------------------------------------------------

for ob in scene.collection.objects:
    ob.select_set(True)
os.makedirs(os.path.dirname(GLB), exist_ok=True)
os.makedirs(os.path.dirname(BLEND), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=GLB, export_format="GLB", use_selection=False, export_apply=True,
                          export_materials="PLACEHOLDER" if False else "EXPORT", export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
tris = sum(len(p.vertices) - 2 for o in scene.collection.objects for p in o.data.polygons)
print("LANCE", GLB, "triangles:", tris)

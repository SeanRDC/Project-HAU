# Builds Lance as a low-poly 3D model for the cutscenes, from his expression sheet
# (assets/drafts/characters/portraits/src/lance-sheet.png): messy, wavy brown hair in
# clumps, a white collared shirt with short sleeves and a dark tie, the dark red backpack
# with its straps over both shoulders, black trousers and shoes.
#
# Every part is a named material slot (skin, face, hair, shirt, tie, bag, pants, shoes);
# Godot gives each one its two-tone cel shading and the palette (actor.gd), and the face
# is a flat front patch mapped to a pixel texture, so his expressions swap like portraits.
#
#   blender --background --factory-startup --python tools/blender/lance.py
# writes src/drafts/aps-godot/models/lance.glb and assets/models/lance.blend (to edit).
import bpy, bmesh, math, os, random
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
GLB = os.path.join(ROOT, "src", "drafts", "aps-godot", "models", "lance.glb")
BLEND = os.path.join(ROOT, "assets", "models", "lance.blend")

# Blender: z up, the front is -y (the glTF export turns it to Godot's +z).
HEAD_C = Vector((0.0, -0.008, 1.606))
HEAD_R = Vector((0.134, 0.132, 0.148))
# the face patch: where the pixel face texture sits (x across, z up), in metres
FACE_X = (-0.118, 0.118)
FACE_Z = (1.448, 1.694)

PALETTE = {  # the portraits' palette (assets/drafts/characters/portraits), for viewing in Blender
    "skin": "#ecbba1", "face": "#ecbba1", "hair": "#7a4034", "shirt": "#efe3d6", "tie": "#3d3436",
    "bag": "#7d2c33", "pants": "#2a262c", "shoes": "#2f2624",
}

random.seed(20260611)

bpy.ops.wm.read_factory_settings(use_empty=True)
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
    """One mesh being built: vertices and faces, each face with a material slot."""
    def __init__(self, name):
        self.name, self.verts, self.faces, self.mats, self.slots = name, [], [], [], []

    def slot(self, mat):
        if mat not in self.slots:
            self.slots.append(mat)
        return self.slots.index(mat)

    def add(self, verts, faces, mat):
        o, s = len(self.verts), self.slot(mat)
        self.verts += [Vector(v) for v in verts]
        for f in faces:
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
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
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

def box(part, centre, size, mat, rot_x=0.0):
    c, (sx, sy, sz) = Vector(centre), size
    vs = []
    for x in (-1, 1):
        for y in (-1, 1):
            for z in (-1, 1):
                p = Vector((x * sx / 2, y * sy / 2, z * sz / 2))
                p.rotate(__import__("mathutils").Euler((rot_x, 0, 0)))
                vs.append(tuple(c + p))
    faces = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]
    part.add(vs, faces, mat)

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
    part.add(verts, faces, mat)

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
tube(head, [((0, 0.006, 1.40), 0.048, 0.046), ((0, 0.010, 1.52), 0.045, 0.043)], 8, "skin")
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

# --- the hair: a round, messy mop -----------------------------------------------------------
# A cap a little bigger than the head, then short, wide locks lying along it and falling out
# and down, so the outline is round and full like the sheet's; a few thin wisps stick out,
# and the bangs come over the brow down to the eyebrows, one lock longer between the eyes.

hair = Part("Hair")
CAP_C = HEAD_C + Vector((0.0, 0.008, 0.012))
CAP = Vector((HEAD_R.x * 1.16, HEAD_R.y * 1.14, HEAD_R.z * 1.10))

def on_cap(az, el, grow=1.0):
    """A point on the hair cap: az round from the front (0 = front, +x = 90 deg), el up from level."""
    return CAP_C + Vector((math.sin(az) * math.cos(el) * CAP.x, -math.cos(az) * math.cos(el) * CAP.y, math.sin(el) * CAP.z)) * grow

def normal_at(az, el):
    p = on_cap(az, el) - CAP_C
    return Vector((p.x / CAP.x ** 2, p.y / CAP.y ** 2, p.z / CAP.z ** 2)).normalized()

def hairline(az):
    f = math.cos(az)                                # 1 at the front, -1 at the back
    return math.radians(-5 + 27 * f) if f > 0 else math.radians(-5 + 40 * f)

# the cap
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

def clump(base, direction, length, radius, droop, sides=5, twist=0.0, flat=0.6):
    """A lock of hair: a five-sided cone, flattened against the head, bending down as it goes."""
    d = direction.normalized()
    u = d.cross(Vector((0, 0, 1)) if abs(d.z) < 0.95 else Vector((1, 0, 0))).normalized()
    v = d.cross(u)
    mid = base + d * length * 0.5 + Vector((0, 0, -droop * 0.3))
    tip = base + d * length + Vector((0, 0, -droop))
    verts, faces = [], []
    for c, r in ((base - d * 0.02, radius), (mid, radius * 0.7)):
        for i in range(sides):
            t = 2 * math.pi * i / sides + twist
            verts.append(tuple(c + u * math.cos(t) * r + v * math.sin(t) * r * flat))
    verts.append(tuple(tip))
    for i in range(sides):
        j = (i + 1) % sides
        faces.append([i, j, sides + j, sides + i])
        faces.append([sides + i, sides + j, 2 * sides])
    faces.append(list(range(sides - 1, -1, -1)))
    hair.add(verts, faces, "hair")

jit = lambda a: random.uniform(-a, a)
# the mop: rows of short, wide locks from the crown down, falling along the head
for el_deg in (78, 62, 46, 30, 14, -2, -18, -32):
    el = math.radians(el_deg)
    count = max(4, round(20 * math.cos(el)))
    for i in range(count):
        az = 2 * math.pi * (i + 0.5 * (el_deg // 16 % 2)) / count + jit(0.12)
        if el < hairline(az) + math.radians(4):
            continue                                # below the hairline
        if math.cos(az) > 0.45 and el_deg < 40:
            continue                                # the bangs cover the front
        if math.cos(az) > 0.05 and el_deg < 20 or math.cos(az) > -0.35 and el_deg < -10:
            continue                                # the cheeks and jaw stay clear: the side hair stops at the ears
        n = normal_at(az, el)
        down = Vector((0, 0, -1)) - n * (-n.z)
        down = down.normalized() if down.length > 0.2 else Vector((n.x, n.y, 0)).normalized()
        if el < 0:
            down = Vector((n.x * 0.6, n.y * 0.6, -1.0)).normalized()  # low locks fall straight, not in under the jaw
        back = max(0.0, -math.cos(az))
        d = down + n * (0.5 + 0.45 * abs(math.sin(az))) + Vector((jit(0.25), jit(0.25), jit(0.15)))
        clump(on_cap(az, el), d, 0.075 + 0.04 * back * (el_deg < 10) + jit(0.018), 0.056 + jit(0.006), 0.012, twist=jit(1))
# the crown: a few locks turning out from the top
for i in range(5):
    az = 2 * math.pi * i / 5 + jit(0.3)
    clump(on_cap(az, math.radians(86)), Vector((math.sin(az), -math.cos(az), 0.35)), 0.07, 0.05, 0.0, twist=jit(1))
# wisps: thin strands sticking out of the mop (the sheet's flyaway tips)
for i in range(9):
    az = random.uniform(0.7, 2 * math.pi - 0.7)
    el = math.radians(random.uniform(15, 65))
    n = normal_at(az, el)
    clump(on_cap(az, el, 1.06), n + Vector((jit(0.4), jit(0.4), -0.6)), 0.045 + jit(0.01), 0.016, 0.008, sides=4)
# bangs over the brow, stopping just above the eyebrows; the middle lock reaches between the eyes
for i, az in enumerate([-1.05, -0.75, -0.47, -0.2, 0.07, 0.34, 0.62, 0.92]):
    el = math.radians(30 + jit(4))
    longer = 0.028 if i == 3 else 0.0
    d = Vector((math.sin(az) * 0.38 + jit(0.1), -0.30, -1.0))
    clump(on_cap(az, el), d, 0.058 + abs(az) * 0.03 + longer + jit(0.008), 0.042, 0.010, twist=jit(0.6), flat=0.45)
hair.build()

# --- the body -------------------------------------------------------------------------------

body = Part("Body")
# shirt: hem to shoulders, closing in to the collar
tube(body, [((0, 0.004, 0.90), 0.175, 0.112), ((0, 0.004, 1.02), 0.168, 0.104), ((0, 0.0, 1.16), 0.170, 0.100),
            ((0, -0.004, 1.28), 0.186, 0.108), ((0, 0.0, 1.37), 0.196, 0.104), ((0, 0.004, 1.425), 0.150, 0.082),
            ((0, 0.006, 1.452), 0.070, 0.058)], 12, "shirt", cap_top=False, phase=0.5)
# the collar: two pointed flaps either side of the tie, standing a little off the neck
for sx in (-1, 1):
    box(body, (sx * 0.040, -0.072, 1.433), (0.060, 0.012, 0.05), "shirt", rot_x=0.35)
    body.add([(sx * 0.010, -0.080, 1.455), (sx * 0.075, -0.060, 1.458), (sx * 0.030, -0.106, 1.375),
              (sx * 0.010, -0.090, 1.455), (sx * 0.075, -0.070, 1.458), (sx * 0.030, -0.114, 1.378)],
             [[0, 1, 2], [3, 5, 4], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]], "shirt")
# tie: knot and blade, down the front of the shirt
box(body, (0, -0.096, 1.425), (0.030, 0.020, 0.030), "tie")
body.add([(-0.018, -0.110, 1.41), (0.018, -0.110, 1.41), (0.026, -0.108, 1.15), (0, -0.108, 1.125), (-0.026, -0.108, 1.15),
          (-0.018, -0.100, 1.41), (0.018, -0.100, 1.41), (0.026, -0.098, 1.15), (0, -0.098, 1.125), (-0.026, -0.098, 1.15)],
         [[0, 1, 2, 3, 4], [9, 8, 7, 6, 5], [0, 5, 6, 1], [1, 6, 7, 2], [2, 7, 8, 3], [3, 8, 9, 4], [4, 9, 5, 0]], "tie")
# arms: short sleeves, then bare arms to the hands, hanging a little away from the body
for sx in (-1, 1):
    sh, el, wr = Vector((sx * 0.200, 0.0, 1.375)), Vector((sx * 0.245, 0.012, 1.105)), Vector((sx * 0.262, -0.02, 0.855))
    limb(body, sh, sh.lerp(el, 0.55), 0.064, 0.058, 8, "shirt")
    limb(body, sh.lerp(el, 0.3), el, 0.044, 0.040, 8, "skin")
    limb(body, el, wr, 0.040, 0.032, 8, "skin")
    tube(body, [((wr.x, wr.y, wr.z), 0.022, 0.036), ((wr.x + sx * 0.004, wr.y - 0.004, wr.z - 0.06), 0.024, 0.040),
                ((wr.x + sx * 0.004, wr.y - 0.008, wr.z - 0.10), 0.016, 0.028)], 6, "skin")
# trousers and shoes
tube(body, [((0, 0.006, 0.80), 0.170, 0.108), ((0, 0.006, 0.93), 0.168, 0.106)], 12, "pants", phase=0.5)
for sx in (-1, 1):
    limb(body, (sx * 0.088, 0.006, 0.86), (sx * 0.094, 0.010, 0.46), 0.082, 0.064, 8, "pants")
    limb(body, (sx * 0.094, 0.010, 0.46), (sx * 0.098, 0.022, 0.07), 0.064, 0.056, 8, "pants")
    tube(body, [((sx * 0.098, -0.012, 0.0), 0.052, 0.120), ((sx * 0.098, -0.012, 0.045), 0.050, 0.116),
                ((sx * 0.098, 0.004, 0.085), 0.044, 0.070)], 8, "shoes")
# the backpack and its straps over both shoulders
box(body, (0, 0.175, 1.150), (0.300, 0.140, 0.380), "bag")
box(body, (0, 0.250, 1.090), (0.230, 0.040, 0.180), "bag")            # front pocket
tube(body, [((0, 0.175, 1.34), 0.150, 0.070), ((0, 0.165, 1.37), 0.110, 0.050)], 8, "bag")  # the rounded top
for sx in (-1, 1):
    strip(body, [(sx * 0.105, 0.110, 1.300), (sx * 0.112, 0.075, 1.425), (sx * 0.118, 0.000, 1.452), (sx * 0.124, -0.090, 1.395),
                 (sx * 0.128, -0.112, 1.300), (sx * 0.134, -0.106, 1.140), (sx * 0.150, -0.080, 1.010), (sx * 0.150, 0.060, 0.985)],
          0.052, 0.014, "bag")
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

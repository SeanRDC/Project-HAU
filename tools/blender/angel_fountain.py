# Builds the sandstone group on the angel fountain at the boulevard's head (areas/middle_road.gd,
# _fountain()) as a smooth sculpted model, in place of the group of boxes and cylinders the game
# drew before. From the close-ups in assets/images/other references/: "rotounda statue
# fountain.png" (the front), "SFJ AND FOUNTAIN SIDE VIEW.jpg" and the right edge of "SFJ BUILDING
# CORNER VIEW.jpg" (the sides).
#
# The Holy Guardian Angel stands behind two children, in a long robe with wavy hair to her
# shoulders, her hands on their shoulders; her wings rise past her head and fall behind her to the
# rock. In front, on her right (the viewer's left) a girl in a dress, on her left a boy in a shirt
# and trousers, an open book held between them. They stand on a mound of rock.
#
# Built from metaballs (one family per figure, so the children do not melt into the angel),
# turned to meshes, given a little roughness and decimated; one material, "sandstone" (the game
# replaces it with its own stucco material, so it weathers and lights like the rest).
#
#   blender --background --factory-startup --python tools/blender/angel_fountain.py [-- --preview <dir>]
# writes src/drafts/aps-godot/models/angel_fountain.glb and assets/drafts/3d/angel_fountain.blend;
# --preview renders it from the front, the side and three-quarters into <dir>.
import bpy, math, os, random, sys
from mathutils import Vector, Quaternion

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
GLB = os.path.join(ROOT, "src", "drafts", "aps-godot", "models", "angel_fountain.glb")
BLEND = os.path.join(ROOT, "assets", "drafts", "3d", "angel_fountain.blend")
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
PREVIEW = os.path.abspath(ARGS[ARGS.index("--preview") + 1]) if "--preview" in ARGS else None

# Blender: z up, the group faces -y (in the game it is turned to face east down the boulevard).
# z 0 is the top of the rock the figures stand on. Metres.
RESOLUTION = 0.012
SANDSTONE = (0.86, 0.60, 0.44, 1.0)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
random.seed(1933)


def family(name):
    data = bpy.data.metaballs.new(name)
    data.resolution = RESOLUTION
    data.render_resolution = RESOLUTION
    data.threshold = 0.12
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    return data


# A metaball's surface stands at about three quarters of its radius (threshold 0.12): the radii
# below are the sizes the parts should look, grown by GROW (the bodies, a little fuller than life,
# as the carving is).
GROW = 1.4


def ball(mb, co, r, stiffness=2.0):
    e = mb.elements.new(type="BALL")
    e.co = Vector(co)
    e.radius = r * GROW
    e.stiffness = stiffness
    return e


def ellipsoid(mb, co, r, size, rotation=None, stiffness=2.0):
    e = mb.elements.new(type="ELLIPSOID")
    e.co = Vector(co)
    e.radius = r * GROW
    e.size_x, e.size_y, e.size_z = size
    if rotation is not None:
        e.rotation = rotation
    e.stiffness = stiffness
    return e


def capsule(mb, a, b, r, stiffness=2.0):
    a, b = Vector(a), Vector(b)
    e = mb.elements.new(type="CAPSULE")
    e.co = (a + b) / 2
    e.radius = r * GROW
    e.size_x = (b - a).length / 2
    e.rotation = Vector((1, 0, 0)).rotation_difference((b - a).normalized())
    e.stiffness = stiffness
    return e


def limb(mb, points, radii):
    for i in range(len(points) - 1):
        capsule(mb, points[i], points[i + 1], (radii[i] + radii[i + 1]) / 2)


# --- The angel -----------------------------------------------------------------------------------
A = family("Angel")
AY = 0.16  # she stands behind the children
# The robe: wide at the hem on the rock, narrowing to the waist; its long folds.
for z, rx, ry in [(0.08, 0.36, 0.30), (0.3, 0.33, 0.27), (0.55, 0.30, 0.24), (0.8, 0.27, 0.21), (1.05, 0.24, 0.19), (1.22, 0.22, 0.17)]:
    ellipsoid(A, (0, AY, z), 0.3, (rx / 0.3, ry / 0.3, 0.75))
for x in (-0.2, -0.1, 0.0, 0.1, 0.2):
    capsule(A, (x, AY - 0.2 + abs(x) * 0.5, 0.06), (x * 0.7, AY - 0.15 + abs(x) * 0.4, 1.05), 0.045)
for x in (-0.26, 0.26):
    capsule(A, (x, AY + 0.05, 0.06), (x * 0.8, AY + 0.03, 1.0), 0.05)
# The body: waist and girdle, chest, shoulders, neck.
ellipsoid(A, (0, AY, 1.3), 0.22, (0.95, 0.7, 0.6))
ellipsoid(A, (0, AY - 0.01, 1.48), 0.22, (1.0, 0.68, 0.85))
capsule(A, (-0.19, AY + 0.01, 1.66), (0.19, AY + 0.01, 1.66), 0.1)
capsule(A, (0, AY, 1.7), (0, AY - 0.01, 1.84), 0.06)
# The head, bowed a little towards the children; the hair, wavy to the shoulders.
ellipsoid(A, (0, AY - 0.03, 1.95), 0.12, (0.92, 1.0, 1.18))
ball(A, (0, AY - 0.11, 1.93), 0.035)  # the nose
for co, r in [((0, AY + 0.02, 2.04), 0.11), ((-0.09, AY + 0.01, 1.98), 0.08), ((0.09, AY + 0.01, 1.98), 0.08),
              ((0, AY + 0.08, 1.95), 0.1), ((-0.1, AY + 0.05, 1.86), 0.075), ((0.1, AY + 0.05, 1.86), 0.075),
              ((-0.11, AY + 0.06, 1.77), 0.06), ((0.11, AY + 0.06, 1.77), 0.06), ((0, AY + 0.1, 1.8), 0.08)]:
    ball(A, co, r)
# The arms in their wide sleeves, down to the children's shoulders.
for s, shoulder_to in ((-1, (-0.22, -0.2, 0.96)), (1, (0.22, -0.2, 1.03))):
    limb(A, [(s * 0.23, AY, 1.64), (s * 0.31, AY - 0.06, 1.38), (shoulder_to[0] + s * 0.02, shoulder_to[1] + 0.07, shoulder_to[2] + 0.06)],
         [0.075, 0.07, 0.05])
    ball(A, (s * 0.32, AY - 0.05, 1.36), 0.1)  # the sleeve's fall at the elbow
    ellipsoid(A, (shoulder_to[0] + s * 0.01, shoulder_to[1] + 0.03, shoulder_to[2] + 0.04), 0.07, (1.0, 1.2, 0.6))  # the hand

# --- The wings -----------------------------------------------------------------------------------
# Each wing in its own plane (u out from the spine, v up), leaned back as it goes out: the arch over
# the shoulder to the tip above her head, the long feathers falling behind her to the rock.
WING = [(0.04, 1.55), (0.08, 1.95), (0.14, 2.3), (0.22, 2.5), (0.31, 2.56), (0.39, 2.42), (0.43, 2.1),
        (0.43, 1.7), (0.41, 1.25), (0.37, 0.8), (0.32, 0.4), (0.27, 0.12), (0.2, 0.18), (0.16, 0.6),
        (0.12, 1.0), (0.07, 1.3)]


def inside(u, v, poly):
    hit = False
    for i in range(len(poly)):
        (u1, v1), (u2, v2) = poly[i], poly[(i + 1) % len(poly)]
        if (v1 > v) != (v2 > v) and u < u1 + (v - v1) * (u2 - u1) / (v2 - v1):
            hit = not hit
    return hit


def wing_point(s, u, v, back=0.0):
    return (s * (0.06 + u), AY + 0.12 + u * 0.45 + back, v)


import bmesh

WING_MESHES = []
for s, name in ((-1, "WingR"), (1, "WingL")):
    # The blade: the outline filled, cut into small faces, set in the leaned plane, thickened and
    # its edges rounded.
    bm = bmesh.new()
    bm.faces.new([bm.verts.new((u, v, 0)) for u, v in WING])
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=3, use_grid_fill=True)
    for vert in bm.verts:
        vert.co = Vector(wing_point(s, vert.co.x, vert.co.y))
    data = bpy.data.meshes.new(name + "Blade")
    bm.to_mesh(data)
    bm.free()
    blade = bpy.data.objects.new(name + "Blade", data)
    scene.collection.objects.link(blade)
    solid = blade.modifiers.new("Thick", "SOLIDIFY")
    solid.thickness = 0.06
    solid.offset = 0.0
    soft = blade.modifiers.new("Soft", "BEVEL")
    soft.width = 0.015
    soft.segments = 2
    WING_MESHES.append(blade)
    # The feathers over its face, metaballs swelling softly out of it: coverts in scallops near the
    # top, long flight feathers lower down, and the outer edge's tips.
    W = family(name)
    # Feathers as overlapping scales: rows from the top down, each feather a flattened ellipsoid
    # in the wing's plane, wider than the spacing so their rounded tips make the scalloped edges.
    rows = [(2.42, 0.1), (2.32, 0.12), (2.2, 0.15), (2.06, 0.18), (1.9, 0.22), (1.7, 0.28), (1.46, 0.34), (1.18, 0.4),
            (0.86, 0.42), (0.55, 0.38), (0.3, 0.25)]
    turn = Quaternion((0, 0, 1), s * 0.42)
    for row, (v0, length) in enumerate(rows):
        u = 0.04 + (row % 2) * 0.024
        width = 0.034 if row < 5 else 0.04
        while u < 0.45:
            mid_v = v0 - length / 2
            if inside(u, v0, WING) and inside(u, v0 - length * 0.9, WING):
                ellipsoid(W, wing_point(s, u, mid_v, -0.034), length / 2, (width / (length / 2), 0.016 / (length / 2), 1.0), turn)
            u += 0.048
    for i in range(4, 12):
        (u1, v1), (u2, v2) = WING[i], WING[i + 1]
        for t in (0.25, 0.75):
            u, vv = u1 + (u2 - u1) * t, v1 + (v2 - v1) * t
            capsule(W, wing_point(s, u - 0.02, vv + 0.1, -0.01), wing_point(s, u + 0.02, vv - 0.12, -0.01), 0.028)

# --- The girl --------------------------------------------------------------------------------------
G = family("Girl")
GX, GY = -0.24, -0.2
for x in (GX - 0.05, GX + 0.05):
    capsule(G, (x, GY, 0.03), (x, GY, 0.38), 0.05)
    ellipsoid(G, (x, GY - 0.05, 0.03), 0.05, (0.8, 1.4, 0.6))
for z, r in ((0.7, 0.11), (0.6, 0.13), (0.5, 0.15), (0.42, 0.165)):
    ellipsoid(G, (GX, GY, z), r, (1.0, 0.78, 0.6))  # the skirt, wider to its hem
ellipsoid(G, (GX, GY, 0.78), 0.13, (0.92, 0.66, 1.0))
capsule(G, (GX - 0.09, GY, 0.89), (GX + 0.09, GY, 0.89), 0.055)
capsule(G, (GX, GY, 0.9), (GX, GY, 0.97), 0.04)
ellipsoid(G, (GX, GY - 0.01, 1.04), 0.095, (0.95, 1.0, 1.1))
for co, r in [((GX, GY + 0.02, 1.1), 0.09), ((GX - 0.07, GY + 0.02, 1.03), 0.07), ((GX + 0.07, GY + 0.02, 1.03), 0.07),
              ((GX, GY + 0.06, 1.02), 0.08)]:
    ball(G, co, r)  # her bob of hair
limb(G, [(GX - 0.1, GY, 0.88), (GX - 0.13, GY - 0.02, 0.72), (GX - 0.1, GY - 0.08, 0.6)], [0.04, 0.037, 0.034])
limb(G, [(GX + 0.1, GY, 0.88), (GX + 0.14, GY - 0.08, 0.76), (GX + 0.2, GY - 0.17, 0.72)], [0.04, 0.037, 0.034])

# --- The boy ---------------------------------------------------------------------------------------
B = family("Boy")
BX, BY = 0.23, -0.22
for x in (BX - 0.055, BX + 0.055):
    capsule(B, (x, BY, 0.04), (x, BY, 0.6), 0.064)
    ellipsoid(B, (x, BY - 0.05, 0.035), 0.055, (0.85, 1.5, 0.6))
ellipsoid(B, (BX, BY, 0.62), 0.15, (0.95, 0.7, 0.55))
ellipsoid(B, (BX, BY, 0.82), 0.15, (0.92, 0.66, 1.05))
capsule(B, (BX - 0.1, BY, 0.97), (BX + 0.1, BY, 0.97), 0.06)
capsule(B, (BX, BY, 0.98), (BX, BY, 1.05), 0.045)
ellipsoid(B, (BX, BY - 0.01, 1.12), 0.1, (0.95, 1.0, 1.1))
for co, r in [((BX, BY + 0.02, 1.19), 0.085), ((BX - 0.06, BY + 0.03, 1.15), 0.06), ((BX + 0.06, BY + 0.03, 1.15), 0.06)]:
    ball(B, co, r)  # his short hair
limb(B, [(BX - 0.11, BY, 0.96), (BX - 0.14, BY - 0.1, 0.8), (BX - 0.16, BY - 0.18, 0.72)], [0.045, 0.04, 0.036])
limb(B, [(BX + 0.11, BY, 0.96), (BX + 0.15, BY - 0.1, 0.8), (BX + 0.07, BY - 0.2, 0.72)], [0.045, 0.04, 0.036])

# --- The finer carving -------------------------------------------------------------------------------
# Negative metaballs cut into their figure (eye sockets, the mouth, grooves between the robe's folds);
# small positive ones raise the brows, noses, locks of hair, fingers, collars and seams.


def cut(e):
    e.use_negative = True
    return e


# The angel's face (its front at about y 0): brows, sockets, the nose, the mouth, the chin.
for s in (-1, 1):
    cut(ball(A, (s * 0.042, -0.006, 1.972), 0.014))
ball(A, (0, -0.004, 1.94), 0.016)
ball(A, (0, 0.006, 1.865), 0.024)
# Locks falling either side of her face to the shoulders.
for s in (-1, 1):
    limb(A, [(s * 0.13, 0.1, 2.0), (s * 0.15, 0.1, 1.9), (s * 0.14, 0.11, 1.8), (s * 0.16, 0.12, 1.72)], [0.026, 0.028, 0.026, 0.022])
# Her hair in wavy locks from the crown to the shoulders, round the sides and the back.
for s in (-1, 1):
    for k in range(5):
        spread = 0.08 + k * 0.016
        back = 0.1 + k * 0.035
        limb(A, [(s * spread, back, 2.06), (s * (spread + 0.035), back + 0.02, 1.96), (s * (spread + 0.01), back + 0.035, 1.86),
                 (s * (spread + 0.04), back + 0.05, 1.76), (s * (spread + 0.02), back + 0.06, 1.68)], [0.03, 0.03, 0.028, 0.026, 0.022])
# The robe: grooves between its folds down the front and sides, a girdle at the waist, the neckline.
for x in (-0.24, -0.15, -0.05, 0.05, 0.15, 0.24):
    cut(capsule(A, (x, AY - 0.22 + abs(x) * 0.5, 0.08), (x * 0.7, AY - 0.17 + abs(x) * 0.4, 1.0), 0.02))
for k in range(14):
    a = math.tau * k / 14
    ball(A, (math.cos(a) * 0.17, AY + math.sin(a) * 0.11, 1.26), 0.026)
for s in (-1, 1):
    cut(capsule(A, (s * 0.07, AY - 0.13, 1.68), (0, AY - 0.15, 1.6), 0.014))
# The wide sleeves hanging from her forearms, and her fingers over the children's shoulders.
for s, to in ((-1, (-0.22, -0.2, 0.96)), (1, (0.22, -0.2, 1.03))):
    ellipsoid(A, (s * 0.3, AY - 0.1, 1.2), 0.08, (0.8, 1.0, 1.7))
    hand = Vector((to[0] + s * 0.01, to[1] + 0.03, to[2] + 0.04))
    for f in range(4):
        x = hand.x + (f - 1.5) * 0.022
        capsule(A, (x, hand.y - 0.02, hand.z + 0.01), (x, hand.y - 0.07, hand.z - 0.04), 0.011)

# The girl's face (its front at about y -0.31), her fringe, puffed sleeves, collar and the folds at
# her skirt's hem.
for s in (-1, 1):
    cut(ball(G, (GX + s * 0.034, -0.306, 1.055), 0.012))
ball(G, (GX, -0.308, 1.035), 0.011)
cut(capsule(G, (GX - 0.015, -0.302, 1.006), (GX + 0.015, -0.302, 1.006), 0.004))
capsule(G, (GX - 0.07, -0.285, 1.1), (GX + 0.07, -0.285, 1.1), 0.024)
for s in (-1, 1):
    ball(G, (GX + s * 0.11, GY, 0.87), 0.045)
capsule(G, (GX - 0.06, GY - 0.075, 0.93), (GX + 0.06, GY - 0.075, 0.93), 0.014)
for k in range(14):
    a = math.tau * k / 14
    capsule(G, (GX + math.cos(a) * 0.19, GY + math.sin(a) * 0.14, 0.38), (GX + math.cos(a) * 0.14, GY + math.sin(a) * 0.1, 0.56), 0.012)

# The boy's face (its front at about y -0.34), the parting in his hair, his collar, short sleeves,
# belt and the creases down his trousers.
for s in (-1, 1):
    cut(ball(B, (BX + s * 0.037, -0.336, 1.135), 0.012))
ball(B, (BX, -0.338, 1.11), 0.012)
cut(capsule(B, (BX - 0.017, -0.332, 1.08), (BX + 0.017, -0.332, 1.08), 0.004))
cut(capsule(B, (BX - 0.03, BY - 0.04, 1.25), (BX - 0.03, BY + 0.08, 1.24), 0.01))
for s in (-1, 1):
    ellipsoid(B, (BX + s * 0.05, BY - 0.1, 1.0), 0.03, (1.2, 0.6, 0.8))
    ball(B, (BX + s * 0.12, BY, 0.93), 0.05)
    capsule(B, (BX + s * 0.055, BY - 0.07, 0.08), (BX + s * 0.055, BY - 0.07, 0.56), 0.012)
capsule(B, (BX - 0.13, BY - 0.02, 0.68), (BX + 0.13, BY - 0.02, 0.68), 0.024)

# --- The rock they stand on ------------------------------------------------------------------------
R = family("Rock")
GROW = 1.0
for i in range(46):
    a = random.uniform(0, math.tau)
    d = math.sqrt(random.uniform(0, 1))
    x, y = math.cos(a) * d * 0.62, math.sin(a) * d * 0.5 + 0.02
    z = -0.08 - d * 0.16 + random.uniform(-0.04, 0.04)
    ball(R, (x, y, z), random.uniform(0.16, 0.26))
# Ledges standing out of it, and cracks cut into it.
for i in range(10):
    a = random.uniform(0, math.tau)
    ellipsoid(R, (math.cos(a) * 0.62, math.sin(a) * 0.5, random.uniform(-0.3, -0.12)), random.uniform(0.12, 0.18),
              (1.4, 0.9, 0.5), Quaternion((0, 0, 1), a))
for i in range(8):
    a = random.uniform(0, math.tau)
    cut(capsule(R, (math.cos(a) * 0.62, math.sin(a) * 0.5, -0.1), (math.cos(a) * 0.74, math.sin(a) * 0.61, -0.3), 0.02))

# --- To meshes -------------------------------------------------------------------------------------
bpy.context.view_layer.update()
for obj in [o for o in scene.collection.objects if o.type == "META"]:
    bpy.context.view_layer.objects.active = obj
    for o in scene.collection.objects:
        o.select_set(o == obj)
    bpy.ops.object.convert(target="MESH")
for blade in WING_MESHES:
    bpy.context.view_layer.objects.active = blade
    for o in scene.collection.objects:
        o.select_set(o == blade)
    bpy.ops.object.modifier_apply(modifier="Thick")
    bpy.ops.object.modifier_apply(modifier="Soft")
meshes = [o for o in scene.collection.objects if o.type == "MESH"]

# The open book between them: two pages bent in a shallow V, with their covers.
bpy.ops.mesh.primitive_cube_add(size=1)
book = bpy.context.active_object
book.name = "Book"
book.scale = (0.2, 0.15, 0.012)
book.location = (-0.05, -0.39, 0.735)
book.rotation_euler = (0.25, 0.12, 0)
bpy.ops.mesh.primitive_cube_add(size=1)
page = bpy.context.active_object
page.scale = (0.2, 0.15, 0.012)
page.location = (0.14, -0.39, 0.735)
page.rotation_euler = (0.25, -0.12, 0)
# The leaves between the covers, a little lighter than the covers' edge.
bpy.ops.mesh.primitive_cube_add(size=1)
leaves = bpy.context.active_object
leaves.scale = (0.37, 0.27, 0.03)
leaves.location = (0.045, -0.39, 0.752)
leaves.rotation_euler = (0.25, 0, 0)
meshes += [book, page, leaves]

stone = bpy.data.materials.new("sandstone")
stone.diffuse_color = SANDSTONE
stone.use_nodes = True
stone.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = SANDSTONE
stone.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.95

for o in meshes:
    o.data.materials.clear()
    o.data.materials.append(stone)
    bpy.context.view_layer.objects.active = o
    for other in scene.collection.objects:
        other.select_set(other == o)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if o.name not in ("Book",) and len(o.data.polygons) > 0 and o != page and o not in WING_MESHES:
        # A little roughness, like weathered sandstone, then down to a game budget.
        tex = bpy.data.textures.new(o.name + "Grain", type="CLOUDS")
        tex.noise_scale = 0.035
        disp = o.modifiers.new("Grain", "DISPLACE")
        disp.texture = tex
        disp.strength = 0.008
        dec = o.modifiers.new("Budget", "DECIMATE")
        dec.ratio = 0.3 if o.name.startswith(("Wing", "Rock")) else 0.45
        bpy.ops.object.modifier_apply(modifier="Grain")
        bpy.ops.object.modifier_apply(modifier="Budget")
    for poly in o.data.polygons:
        poly.use_smooth = True

for o in scene.collection.objects:
    o.select_set(o in meshes)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.join()
group = bpy.context.active_object
group.name = "AngelFountain"
bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
tris = sum(len(p.vertices) - 2 for p in group.data.polygons)
points = [group.matrix_world @ v.co for v in group.data.vertices]
lo = [min(p[i] for p in points) for i in range(3)]
hi = [max(p[i] for p in points) for i in range(3)]
print("angel_fountain: %d triangles, from %s to %s" % (tris, [round(x, 2) for x in lo], [round(x, 2) for x in hi]))

os.makedirs(os.path.dirname(GLB), exist_ok=True)
os.makedirs(os.path.dirname(BLEND), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=GLB, export_format="GLB", use_selection=False, export_yup=True, export_apply=True)
bpy.ops.wm.save_as_mainfile(filepath=BLEND)

if PREVIEW:
    os.makedirs(PREVIEW, exist_ok=True)
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_cavity = True
    scene.render.resolution_x, scene.render.resolution_y = 700, 900
    cam_data = bpy.data.cameras.new("Preview")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 3.1
    cam = bpy.data.objects.new("Preview", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    target = Vector((0, 0.1, 1.15))
    for name, direction in (("front", Vector((0, -1, 0.12))), ("side", Vector((1, 0, 0.12))), ("three-quarter", Vector((0.75, -0.75, 0.25))), ("back", Vector((0.3, 1, 0.15)))):
        cam.location = target + direction.normalized() * 8
        cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(PREVIEW, "angel_fountain_%s.png" % name)
        bpy.ops.render.render(write_still=True)

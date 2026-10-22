# Lance as a full, smooth 3D model (not pixel art): opens the low-poly model that
# tools/blender/lance.py builds (assets/models/lance.blend), smooths every part with a
# subdivision surface, draws his face as a smooth high-resolution texture, gives each part
# clean two-tone cel shading (and the curls their highlight) with an ink outline, and lights
# and renders him from every side.
#
#   blender --background --factory-startup --python tools/blender/lance_hd.py
# writes assets/models/lance-hd.blend (open it in Blender to turn him round) and renders into
# builds/lance-3d/ (front, three-quarter, side, back, and two close-ups).
import bpy, math, os
import numpy as np
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "assets", "models", "lance.blend")
OUT_BLEND = os.path.join(ROOT, "assets", "models", "lance-hd.blend")
FACE_PNG = os.path.join(ROOT, "assets", "models", "lance_face_hd.png")
RENDERS = os.path.join(ROOT, "builds", "lance-3d")

bpy.ops.wm.open_mainfile(filepath=SRC)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene

def hexc(h):
    h = h.lstrip("#")
    return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))

# Each part: base, shadow, how far the light wraps round (as in the game's actor.gd), and the
# curls' highlight. The palette is the game's.
PARTS = {
    "skin": ("#ecbba1", "#d9a088", -0.35, None),
    "face": ("#ecbba1", "#d9a088", -0.35, None),
    "hair": ("#7f4733", "#572b23", 0.10, "#ac5b3d"),
    "shirt": ("#efe3d6", "#cdb2a5", 0.12, None),
    "tie": ("#3d3436", "#2a2326", 0.12, None),
    "bag": ("#7d2c33", "#511f26", 0.12, None),
    "pants": ("#2e2a31", "#1c191e", 0.12, None),
    "shoes": ("#33292a", "#1f1819", 0.12, None),
}
LIGHT = Vector((-0.45, -0.70, 0.55)).normalized()   # from the front, his right, above

# --- the face, drawn smooth --------------------------------------------------------------
# The same face as the pixel one (assets/drafts/characters/portraits/lance-face.mjs), on the
# same patch of the head: small dark oval eyes with a black outline, the lower part lighter
# and a white glint, under a thick lid that flicks up at the outer corner; thin brows, a
# small nose and mouth. 16 texels for each of the pixel face's pixels.
W, H, S = 512, 576, 16.0
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32) + 0.5
img = np.zeros((H, W, 3), np.float32)
img[:] = hexc("#ecbba1")

def cover(d):
    return np.clip(0.5 - d, 0.0, 1.0)                 # anti-aliased: one texel of softness

def paint(d, colour):
    a = cover(d)[..., None]
    img[:] = img * (1 - a) + np.array(hexc(colour), np.float32) * a

def ellipse(cx, cy, a, b):
    return (np.sqrt(((xs - cx) / a) ** 2 + ((ys - cy) / b) ** 2) - 1.0) * min(a, b)

def capsule(p, q, r):
    p, q = np.array(p, np.float32), np.array(q, np.float32)
    pa = np.stack([xs - p[0], ys - p[1]], -1); ba = q - p
    t = np.clip((pa @ ba) / (ba @ ba), 0, 1)[..., None]
    return np.linalg.norm(pa - t * ba, axis=-1) - r

for cx, side in ((8.5 * S, -1), (23.5 * S, 1)):
    cy = 17.5 * S
    eye = ellipse(cx, cy + 4, 2.5 * S, 3.4 * S)
    paint(eye, "#000000")                                         # the outline
    inner = ellipse(cx, cy + 4, 2.5 * S - 7, 3.4 * S - 7)
    paint(inner, "#2b1a1c")                                       # the eye
    paint(np.maximum(inner, cy + 18 - ys), "#5a3a36")             # its lighter lower part
    paint(ellipse(cx - 12, cy - 16, 10, 12), "#f6efe9")           # the glint
    lid = np.abs(ellipse(cx, cy + 10, 3.2 * S, 3.9 * S)) - 7
    paint(np.maximum(lid, ys - (cy - 30)), "#000000")             # the thick upper lid
    paint(capsule((cx + side * 46, cy - 30), (cx + side * 64, cy - 50), 5), "#000000")  # its flick
    brow = np.abs(ellipse(cx, 12.5 * S, 2.9 * S, 1.3 * S)) - 3.5
    paint(np.maximum(brow, ys - 12.5 * S + 9), "#3a2420")         # a thin brow
paint(ellipse(16 * S, 22.6 * S, 4, 3), "#d9a088")                 # the nose
mouth = np.abs(ellipse(16 * S, 27.6 * S, 15, 7)) - 3
paint(np.maximum(mouth, 27.6 * S - ys), "#000000")                # a small mouth

face_img = bpy.data.images.new("lance_face_hd", W, H, alpha=False)
rgba = np.concatenate([img[::-1] ** (1 / 2.2), np.ones((H, W, 1), np.float32)], -1)  # Blender's rows go up
face_img.pixels.foreach_set(rgba.ravel())
face_img.filepath_raw = FACE_PNG
face_img.file_format = "PNG"
face_img.save()
face_img.pack()

# --- cel shading: the part's colour by how much it faces the light ------------------------

def toon(mat, base, shade, wrap, light, texture=None):
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    n = nt.nodes.new
    out = n("ShaderNodeOutputMaterial")
    geo = n("ShaderNodeNewGeometry")
    dot = n("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"
    dot.inputs[1].default_value = LIGHT
    nt.links.new(geo.outputs["Normal"], dot.inputs[0])
    def step(at):
        m = n("ShaderNodeMath"); m.operation = "GREATER_THAN"
        nt.links.new(dot.outputs["Value"], m.inputs[0]); m.inputs[1].default_value = at
        return m.outputs[0]
    def mix(fac, a, b):
        m = n("ShaderNodeMix"); m.data_type = "RGBA"
        nt.links.new(fac, m.inputs[0])
        for socket, value in ((m.inputs[6], a), (m.inputs[7], b)):
            if isinstance(value, tuple):
                socket.default_value = (*value, 1.0)
            else:
                nt.links.new(value, socket)
        return m.outputs[2]
    if texture:
        tex = n("ShaderNodeTexImage"); tex.image = texture; tex.interpolation = "Cubic"
        darker = n("ShaderNodeMix"); darker.data_type = "RGBA"; darker.blend_type = "MULTIPLY"
        darker.inputs[0].default_value = 1.0
        nt.links.new(tex.outputs["Color"], darker.inputs[6])
        darker.inputs[7].default_value = (*[s / max(b, 1e-3) for s, b in zip(hexc(shade), hexc(base))], 1.0)
        colour = mix(step(wrap), darker.outputs[2], tex.outputs["Color"])
    else:
        colour = mix(step(wrap), hexc(shade), hexc(base))
    if light:
        colour = mix(step(0.86), colour, hexc(light))
    emit = n("ShaderNodeEmission")
    nt.links.new(colour, emit.inputs["Color"])
    nt.links.new(emit.outputs[0], out.inputs["Surface"])

for name, (base, shade, wrap, light) in PARTS.items():
    mat = bpy.data.materials.get(name)
    if mat:
        toon(mat, base, shade, wrap, light, face_img if name == "face" else None)

def ink(name, colour):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_backface_culling = True
    nt = mat.node_tree
    nt.nodes.clear()
    emit = nt.nodes.new("ShaderNodeEmission"); emit.inputs["Color"].default_value = (*hexc(colour), 1.0)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(emit.outputs[0], out.inputs["Surface"])
    return mat

black, brown = ink("ink", "#000000"), ink("ink_hair", "#46201f")

# --- smooth every part, and give it an ink outline (an inverted hull) ---------------------
for ob in [o for o in scene.objects if o.type == "MESH"]:
    if ob.name == "Hair":
        # the curls melt into one sculpted mass of curly hair: bumps and folds, not loose balls
        shell = ob.modifiers.new("Thicken", "SOLIDIFY")      # the cap is a thin sheet: give it body
        shell.thickness = 0.012
        mesh = ob.modifiers.new("Melt", "REMESH")
        mesh.mode = "VOXEL"; mesh.voxel_size = 0.006; mesh.use_smooth_shade = True
        soft = ob.modifiers.new("Soften", "CORRECTIVE_SMOOTH")
        soft.factor = 1.0; soft.iterations = 24; soft.smooth_type = "LENGTH_WEIGHTED"
        soft.use_only_smooth = True
    else:
        sub = ob.modifiers.new("Smooth", "SUBSURF")
        sub.levels = sub.render_levels = 2
    line = brown if ob.name == "Hair" else black
    ob.data.materials.append(line)
    hull = ob.modifiers.new("Ink", "SOLIDIFY")
    hull.thickness = 0.0045
    hull.offset = 1.0
    hull.use_flip_normals = True
    hull.use_rim = False
    hull.material_offset = len(ob.data.materials)            # every shell face takes the ink

# --- light, world and cameras --------------------------------------------------------------
world = scene.world or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (*hexc("#dfe5e8"), 1.0)
scene.view_settings.view_transform = "Standard"
for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        scene.render.engine = engine
        break
    except TypeError:
        pass
scene.render.film_transparent = False

cam_data = bpy.data.cameras.new("Camera")
cam = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

def shot(name, turn, target_z, distance, lens, size):
    a = math.radians(turn)
    cam_data.lens = lens
    target = Vector((0, 0, target_z))
    cam.location = target + Vector((math.sin(a) * distance, -math.cos(a) * distance, distance * 0.08))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.render.resolution_x, scene.render.resolution_y = size
    scene.render.filepath = os.path.join(RENDERS, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("LANCE-HD", scene.render.filepath)

os.makedirs(RENDERS, exist_ok=True)
for name, turn in (("front", 0), ("three-quarter", 35), ("side", 90), ("back", 180)):
    shot(name, turn, 0.88, 6.2, 85, (1000, 1600))
shot("close-front", 0, 1.56, 1.9, 85, (1200, 1200))
shot("close-three-quarter", 32, 1.56, 1.9, 85, (1200, 1200))
# the saved file opens on the three-quarter view
a = math.radians(35)
cam.location = Vector((math.sin(a) * 6.2, -math.cos(a) * 6.2, 0.88 + 0.5))
cam.rotation_euler = (Vector((0, 0, 0.88)) - cam.location).to_track_quat("-Z", "Y").to_euler()
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
print("LANCE-HD saved", OUT_BLEND)

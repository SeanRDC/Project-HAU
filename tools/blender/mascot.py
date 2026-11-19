# Builds the mascot (draft) as a low-poly 3D model in a T-pose with a skeleton, from its
# pixel design (assets/drafts/characters/mascot/): a doodle Ysha drew in ballpen, come to
# life. A paper-white blob, a paper boat for a hat, stick limbs in ink, two hands that
# don't match (three fat fingers on its left, five tiny ones on its right).
#
# Parts are material names, as for Lance: paper, ink, cheek, rule.
# Bones: root > body > hat, arm.L/R > forearm.L/R > hand.L/R, leg.L/R > foot.L/R.
# Every vertex follows one bone (no blending), so limbs move like cut paper.
#
#   blender --background --factory-startup --python tools/blender/mascot.py [-- --preview <dir>]
# writes src/drafts/aps-godot/models/mascot.glb and assets/drafts/3d/mascot.blend (to pose
# and edit). --preview also renders the T-pose and a waving pose into <dir>.
import bpy, math, os, sys
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
GLB = os.path.join(ROOT, "src", "drafts", "aps-godot", "models", "mascot.glb")
BLEND = os.path.join(ROOT, "assets", "drafts", "3d", "mascot.blend")
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
# made absolute: Blender renders a relative path from the drive root, not from here
PREVIEW = os.path.abspath(ARGS[ARGS.index("--preview") + 1]) if "--preview" in ARGS else None

PALETTE = {"paper": "#f6f0e6", "ink": "#2e2d42", "cheek": "#d4935f", "rule": "#9fb0c8"}  # mascot.px.js

# Blender: z up, the front is -y, its left hand is +x. About half a metre tall, knee-high to Lance.
BODY_C, BODY_R = Vector((0, 0, 0.225)), Vector((0.160, 0.140, 0.145))
ARM_Z = 0.235                    # the T: arms straight out at this height
SHOULDER, ELBOW, WRIST = 0.150, 0.225, 0.300
HAND_R = 0.040
HIP_X, HIP_Z, ANKLE_Z = 0.060, 0.095, 0.022
HAT_Z = 0.345                    # where the boat sits on the head

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"

def material(name):
    m = bpy.data.materials.new(name)
    h = PALETTE[name].lstrip("#")
    m.diffuse_color = (*[(int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)], 1.0)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = m.diffuse_color
        bsdf.inputs["Roughness"].default_value = 1.0
    return m

MATS = {n: material(n) for n in PALETTE}
parts = []   # (object, bone, or a function vertex -> bone)

def done(ob, mat, bone, smooth=True):
    ob.data.materials.append(MATS[mat])
    if smooth:
        for p in ob.data.polygons:
            p.use_smooth = True
    parts.append((ob, bone))
    return ob

def ball(c, r, mat, bone, seg=12, rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1, location=c)
    ob = bpy.context.object
    ob.scale = r if isinstance(r, Vector) else Vector((r, r, r))
    return done(ob, mat, bone)

def stick(a, b, r, mat, bone, cuts=0):
    """A thin tube from a to b. With cuts, rings along it so it can bend at a joint."""
    a, b = Vector(a), Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=r, depth=(b - a).length, location=(a + b) / 2)
    ob = bpy.context.object
    ob.rotation_euler = (b - a).to_track_quat("Z", "Y").to_euler()
    if cuts:
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.mesh.subdivide(number_cuts=cuts)
        bpy.ops.object.mode_set(mode="OBJECT")
    return done(ob, mat, bone)

def mesh(name, verts, faces, mat, bone):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    return done(ob, mat, bone, smooth=False)   # folded paper: flat faces

# --- the body and face --------------------------------------------------------------------
ball(BODY_C, BODY_R, "paper", "body", seg=16, rings=10)
for sx in (-1, 1):
    ball(BODY_C + Vector((sx * 0.052, -0.128, 0.022)), Vector((0.017, 0.010, 0.019)), "ink", "body", 8, 6)      # dot eyes
    ball(BODY_C + Vector((sx * 0.094, -0.108, -0.016)), Vector((0.024, 0.008, 0.013)), "cheek", "body", 8, 6)   # cheeks
for x, z in ((-0.016, -0.018), (0.0, -0.026), (0.016, -0.018)):                                                # a small smile
    ball(BODY_C + Vector((x, -0.136, z)), Vector((0.010, 0.006, 0.006)), "ink", "body", 6, 4)

# --- the paper boat, worn as a hat ----------------------------------------------------------
# hull: pointed at both ends (along x), open folds; then the sail, a flat-sided pyramid
z0, z1 = HAT_Z, HAT_Z + 0.062
mesh("hull", [(-0.250, 0, z1), (0, -0.105, z1), (0.250, 0, z1), (0, 0.105, z1),
              (-0.150, 0, z0), (0, -0.070, z0), (0.150, 0, z0), (0, 0.070, z0)],
     [[0, 1, 2, 3], [7, 6, 5, 4], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], "paper", "hat")
mesh("sail", [(-0.165, 0, z1), (0, -0.070, z1), (0.165, 0, z1), (0, 0.070, z1), (0, 0, z1 + 0.115)],   # low and wide: taller reads as a wizard's hat
     [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [3, 2, 1, 0]], "paper", "hat")
# the handout's ruled line, still showing across the front of the hull
for sx in (-1, 1):
    a, b = Vector((sx * 0.010, -0.0905, z0 + 0.036)), Vector((sx * 0.150, -0.0395, z0 + 0.036))
    stick(a, b, 0.0045, "rule", "hat")

# --- arms, straight out: the T-pose ---------------------------------------------------------
def arm_bone(sx):
    side = "L" if sx > 0 else "R"
    return lambda v: ("arm." if abs(v.x) < ELBOW - 1e-4 else "forearm.") + side

for sx in (-1, 1):
    side = "L" if sx > 0 else "R"
    stick((sx * (SHOULDER - 0.015), 0, ARM_Z), (sx * WRIST, 0, ARM_Z), 0.011, "ink", arm_bone(sx), cuts=1)
    hand = Vector((sx * (WRIST + HAND_R * 0.8), 0, ARM_Z))
    ball(hand, HAND_R, "paper", "hand." + side, 10, 8)
    # the hands she can't draw: three fat fingers on its left, five tiny ones on its right
    fingers = [(a, 0.019, 0.034) for a in (-38, 0, 38)] if sx > 0 else [(a, 0.0095, 0.018) for a in (-60, -30, 0, 30, 60)]
    for ang, r, length in fingers:
        d = Vector((sx * math.cos(math.radians(ang)), 0, math.sin(math.radians(ang))))
        ball(hand + d * (HAND_R + length * 0.35), Vector((r, r, r)) + Vector((abs(d.x), 0, abs(d.z))) * (length * 0.5 - r * 0.2),
             "paper", "hand." + side, 6, 5)

# --- legs and feet --------------------------------------------------------------------------
for sx in (-1, 1):
    side = "L" if sx > 0 else "R"
    stick((sx * HIP_X, 0, HIP_Z + 0.02), (sx * HIP_X, 0, ANKLE_Z), 0.011, "ink", "leg." + side)
    ball((sx * HIP_X, -0.022, 0.014), Vector((0.026, 0.044, 0.014)), "ink", "foot." + side, 8, 5)

# --- one mesh, with a vertex group for every bone -------------------------------------------
BONES = {  # name: (head, tail, parent)
    "root": ((0, 0, 0), (0, 0, 0.08), None),
    "body": ((0, 0, 0.08), (0, 0, HAT_Z), "root"),
    "hat": ((0, 0, HAT_Z), (0, 0, HAT_Z + 0.25), "body"),
}
for sx, side in ((1, "L"), (-1, "R")):
    BONES["arm." + side] = ((sx * SHOULDER, 0, ARM_Z), (sx * ELBOW, 0, ARM_Z), "body")
    BONES["forearm." + side] = ((sx * ELBOW, 0, ARM_Z), (sx * WRIST, 0, ARM_Z), "arm." + side)
    BONES["hand." + side] = ((sx * WRIST, 0, ARM_Z), (sx * (WRIST + 0.10), 0, ARM_Z), "forearm." + side)
    BONES["leg." + side] = ((sx * HIP_X, 0, HIP_Z + 0.02), (sx * HIP_X, 0, ANKLE_Z), "body")
    BONES["foot." + side] = ((sx * HIP_X, 0, ANKLE_Z), (sx * HIP_X, -0.07, ANKLE_Z - 0.008), "leg." + side)

bpy.ops.object.select_all(action="DESELECT")
for ob, bone in parts:
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
tags = []   # the bone of every vertex, in the order the join keeps (the active object's first)
order = [parts[-1]] + parts[:-1]
for ob, bone in order:
    tags += [bone(v.co) if callable(bone) else bone for v in ob.data.vertices]
bpy.context.view_layer.objects.active = order[0][0]
bpy.ops.object.join()
body = bpy.context.object
body.name = body.data.name = "Mascot"
assert len(tags) == len(body.data.vertices)
for name in BONES:
    body.vertex_groups.new(name=name).add([i for i, t in enumerate(tags) if t == name], 1.0, "REPLACE")

arm_data = bpy.data.armatures.new("MascotRig")
rig = bpy.data.objects.new("MascotRig", arm_data)
scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode="EDIT")
for name, (head, tail, parent) in BONES.items():
    b = arm_data.edit_bones.new(name)
    b.head, b.tail = head, tail
    if parent:
        b.parent = arm_data.edit_bones[parent]
bpy.ops.object.mode_set(mode="OBJECT")
body.parent = rig
body.modifiers.new("Armature", "ARMATURE").object = rig

# --- out ------------------------------------------------------------------------------------
os.makedirs(os.path.dirname(GLB), exist_ok=True)
os.makedirs(os.path.dirname(BLEND), exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=GLB, export_format="GLB", use_selection=False, export_yup=True, export_skins=True)
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
tris = sum(len(p.vertices) - 2 for p in body.data.polygons)
print("MASCOT", GLB, "triangles:", tris, "bones:", len(BONES))

if PREVIEW:
    os.makedirs(PREVIEW, exist_ok=True)
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_object_outline = True
    scene.display.shading.object_outline_color = (0.03, 0.03, 0.06)
    scene.view_settings.view_transform = "Standard"   # the default (AgX) greys the paper
    scene.render.resolution_x = scene.render.resolution_y = 560
    scene.world = bpy.data.worlds.new("World")
    scene.world.color = (0.70, 0.62, 0.52)
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.type, cam_data.ortho_scale = "ORTHO", 0.98
    cam = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    target = Vector((0, 0, 0.30))

    def shot(name, az):
        a = math.radians(az)
        cam.location = target + Vector((math.sin(a) * 4, -math.cos(a) * 4, 0.5))
        cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(PREVIEW, name + ".png")
        bpy.ops.render.render(write_still=True)

    for name, az in (("tpose-front", 0), ("tpose-three-quarter", 35), ("tpose-side", 90), ("tpose-back", 180)):
        shot(name, az)
    # proof that it moves: a wave, a step and a tipped hat (the saved files stay in the T-pose)
    pose = rig.pose.bones
    # a bone's own Y runs along it (a twist); X and Z swing it
    for name, axis, deg in (("arm.L", "Z", 55), ("forearm.L", "Z", 45), ("arm.R", "Z", 40), ("leg.R", "X", 30),
                            ("leg.L", "X", -20), ("hat", "Z", 12), ("body", "Z", -6)):
        pose[name].rotation_mode = "XYZ"
        setattr(pose[name].rotation_euler, axis.lower(), math.radians(deg))
    shot("posed-front", 0)
    shot("posed-three-quarter", 35)
    print("PREVIEW", PREVIEW)

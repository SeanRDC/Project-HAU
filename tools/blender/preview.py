# Renders quick looks at a model (.blend) from the front, three-quarters and the side, flat
# shaded in its material colours, to check the shape before taking it into Godot.
#   blender --background <model.blend> --python tools/blender/preview.py -- <out dir> [bust]
import bpy, math, os, sys
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out = args[0] if args else os.path.join(os.getcwd(), "preview")
bust = len(args) > 1 and args[1] == "bust"
os.makedirs(out, exist_ok=True)
scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "MATERIAL"
scene.display.shading.show_object_outline = True
scene.display.shading.object_outline_color = (0, 0, 0)
scene.render.resolution_x, scene.render.resolution_y = (480, 480) if bust else (360, 640)
scene.render.film_transparent = False
scene.world = scene.world or bpy.data.worlds.new("World")
cam_data = bpy.data.cameras.new("Cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 0.62 if bust else 1.95
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
target = Vector((0, 0, 1.47 if bust else 0.90))
for name, az in (("front", 0), ("three-quarter", 35), ("side", 90), ("back", 180)):
    a = math.radians(az)
    cam.location = target + Vector((math.sin(a) * 4, -math.cos(a) * 4, 0.15))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(out, f"{'bust' if bust else 'body'}-{name}.png")
    bpy.ops.render.render(write_still=True)
print("PREVIEW", out)

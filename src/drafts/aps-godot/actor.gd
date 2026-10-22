extends Node3D
## A cutscene character: a low-poly 3D model (built in Blender by tools/blender/<id>.py)
## drawn like the pixel portraits. Every part is exactly two tones from the character's
## palette (shaders/toon.gdshader), the model has a one-pixel black line
## (shaders/outline.gdshader), and the face is a pixel texture of the portrait sheet's
## eight expressions, swapped with set_expression().
##
## --actor-capture=<dir> renders the cast alone, at the portraits' pixel density, into
## <dir>: each expression in a close-up, and the whole body from the front and turned.

const TOON := preload("res://shaders/toon.gdshader")
const OUTLINE := preload("res://shaders/outline.gdshader")
const EXPRESSIONS := ["neutral", "smile", "laugh", "sad", "surprised", "worried", "annoyed", "away"]
## Pixels per metre in a cutscene close-up: the portraits' own (82 px for a 0.6 m bust).
const CLOSE_DENSITY := 136.0

## Each character's parts, by material name. `base` and `shade` are the two tones, from the
## portraits' palette (assets/drafts/characters/portraits). If given: `wrap`, how far the light
## goes round before the shadow starts (skin -0.35: an anime face stays lit but for its edge;
## curls 0.3: each curl gets its dark side); `light`, a third tone where the light hits
## straight on (the tops of the curls); `line`, the outline's colour (black otherwise); `gap`,
## the outline's depth gap (curls 0.006 m: a line round every curl).
## Lance's hair is the game's student sprite's (sprites/boy): its four colours, base, shadow,
## highlight and the dark brown it is drawn in.
const CAST := {
	"lance": {
		"model": "res://models/lance.glb",
		"faces": "res://models/lance_faces.png",
		"parts": {
			"skin": {"base": "#ecbba1", "shade": "#cf9580", "wrap": -0.35},
			"face": {"base": "#ecbba1", "shade": "#cf9580", "wrap": -0.35},
			"hair": {"base": "#7f4733", "shade": "#572b23", "light": "#ac5b3d", "line": "#46201f", "wrap": 0.3, "gap": 0.006},
			"shirt": {"base": "#efe3d6", "shade": "#cdb2a5"},
			"tie": {"base": "#3d3436", "shade": "#2a2326"},
			"bag": {"base": "#7d2c33", "shade": "#511f26"},
			"pants": {"base": "#2e2a31", "shade": "#1c191e"},
			"shoes": {"base": "#33292a", "shade": "#1f1819"},
		},
	},
}

var id := "lance"
var expression := "neutral"
var _face: ShaderMaterial
var _parts := {}

static func wanted(launch: Dictionary) -> bool:
	return launch.has("actor-capture")

func _init(who := "lance") -> void:
	id = who
	name = who.capitalize()

func _ready() -> void:
	var info: Dictionary = CAST[id]
	var model: Node3D = (load(info["model"]) as PackedScene).instantiate()
	add_child(model)
	var faces: Texture2D = load(info["faces"])
	for mesh: MeshInstance3D in model.find_children("*", "MeshInstance3D", true, false):
		for surface in mesh.mesh.get_surface_count():
			var part := mesh.mesh.surface_get_material(surface).resource_name
			if not _parts.has(part):
				_parts[part] = _material(info["parts"].get(part, {"base": "#ff00ff", "shade": "#800080"}), faces if part == "face" else null)
			mesh.set_surface_override_material(surface, _parts[part])
		mesh.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	_face = _parts.get("face")
	set_expression(expression)

func _material(part: Dictionary, faces: Texture2D) -> ShaderMaterial:
	var material := ShaderMaterial.new()
	material.shader = TOON
	material.set_shader_parameter("base_color", Color(part["base"]))
	material.set_shader_parameter("shade_color", Color(part["shade"]))
	if part.has("wrap"):
		material.set_shader_parameter("threshold", part["wrap"])
	if part.has("light"):
		material.set_shader_parameter("light_color", Color(part["light"]))
		material.set_shader_parameter("highlight", 0.72)
	if faces:
		material.set_shader_parameter("textured", true)
		material.set_shader_parameter("faces", faces)
		material.set_shader_parameter("face_count", float(EXPRESSIONS.size()))
	var line := ShaderMaterial.new()
	line.shader = OUTLINE
	if part.has("gap"):
		line.set_shader_parameter("depth_gap", part["gap"])
	if part.has("line"):
		line.set_shader_parameter("color", Color(part["line"]))
	material.next_pass = line
	return material

## Which face to wear: one of EXPRESSIONS.
func set_expression(which: String) -> void:
	expression = which if EXPRESSIONS.has(which) else "neutral"
	if _face:
		_face.set_shader_parameter("face", float(EXPRESSIONS.find(expression)))

## The parts the model has, by material name (for the checks).
func parts() -> Array:
	return _parts.keys()

# --- --actor-capture ---------------------------------------------------------------

## Renders the cast alone into `dir`, then quits.
static func capture(host: Node, dir: String) -> void:
	DirAccess.make_dir_recursive_absolute(dir)
	var viewport := SubViewport.new()
	viewport.own_world_3d = true
	viewport.msaa_3d = Viewport.MSAA_DISABLED
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	host.add_child(viewport)
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("c9d3d6")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("8f98a8")
	environment.ambient_light_energy = 0.35
	environment.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	var world := WorldEnvironment.new()
	world.environment = environment
	viewport.add_child(world)
	var sun := DirectionalLight3D.new()
	sun.light_energy = 1.0
	sun.shadow_enabled = true
	sun.rotation_degrees = Vector3(-38.0, -32.0, 0.0)
	viewport.add_child(sun)
	var actor: Node3D = load("res://actor.gd").new("lance")
	viewport.add_child(actor)
	var camera := Camera3D.new()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.keep_aspect = Camera3D.KEEP_HEIGHT
	viewport.add_child(camera)
	camera.current = true
	# [name, frame height (m), aim height (m), turn (degrees), expression]
	var shots: Array = []
	for which in EXPRESSIONS:
		shots.append(["close-" + which, 0.62, 1.50, 0.0, which])
	shots.append(["close-turned", 0.62, 1.50, 32.0, "smile"])
	shots.append(["body-front", 1.95, 0.92, 0.0, "neutral"])
	shots.append(["body-turned", 1.95, 0.92, 35.0, "neutral"])
	shots.append(["body-side", 1.95, 0.92, 90.0, "neutral"])
	for shot: Array in shots:
		var height: float = shot[1]
		viewport.size = Vector2i(roundi(height * CLOSE_DENSITY * 16.0 / 9.0), roundi(height * CLOSE_DENSITY))
		camera.size = height
		var turn := deg_to_rad(shot[3])
		camera.position = Vector3(sin(turn) * 4.0, shot[2] + 0.1, cos(turn) * 4.0)
		camera.look_at(Vector3(0.0, shot[2], 0.0))
		actor.set_expression(shot[4])
		for frame in 4:
			await RenderingServer.frame_post_draw
		var image := viewport.get_texture().get_image()
		image.resize(image.get_width() * 8, image.get_height() * 8, Image.INTERPOLATE_NEAREST)
		var file := dir.path_join(shot[0] + ".png")
		print("actor capture: ", file, " ", "ok" if image.save_png(file) == OK else "failed")
	host.get_tree().quit()

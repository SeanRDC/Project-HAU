extends RefCounted
## Builds the APS frontage in Godot: the long classroom wing, entrance canopy,
## taller balcony block, stair tower, the five-floor canteen wing and the street.
## Ported from src/drafts/aps-browser (same coordinates, metres, Y up, +Z to the road).
## Proportions are approximate, from the walk photos, not a surveyed model.
##
## The plan is an L, as on the campus: the canteen wing stands forward from the
## stair tower towards the road, its stalls facing west onto a brick patio in the
## corner, and the road bends round the patio with lawn inside the bend.

const COLUMN_X: Array[float] = [-7.5, -3.4, 3.4, 7.5]
## Canteen piers, stalls and steps are in the wing's own frame (see canteen_local).
const CANTEEN_PIERS: Array[float] = [36.8, 46.25, 55.75, 65.2]
const STALL_X: Array[float] = [41.0, 50.8, 60.6]
## The wing's frame: world x = CANTEEN_ORIGIN.x - local z, world z = CANTEEN_ORIGIN.y + local x.
const CANTEEN_ORIGIN := Vector2(36.0, -36.0)
## The road runs along the frontage at z 4..11, turns a quarter circle about this
## centre and runs towards the camera at x 18..25.
const BEND := Vector2(8.5, 20.5)
## Patio umbrellas (world), clear of the canteen steps.
const PATIO_TABLES: Array[Vector2] = [Vector2(23.0, 3.0), Vector2(28.0, 3.4), Vector2(29.8, 9.0),
	Vector2(29.8, 21.5), Vector2(29.8, 27.0)]
const LEAVES_SHADER := preload("res://shaders/leaves.gdshader")

## Texture world size in metres per 128 px tile. Triplanar world mapping keeps
## the pixel density even on every face, so long walls never stretch their texels.
const TILE_METRES := {"stucco": 4.0, "stone": 1.1, "road": 5.0, "tile": 3.2,
	"brick": 2.0, "wood": 1.5, "metal": 2.0, "grass": 3.0}
const PALETTE := {"stucco": "d7d6cb", "stone": "b6a385", "road": "899093", "tile": "d6d1c3",
	"brick": "a7957b", "wood": "8b6b4e", "glass": "455965", "metal": "8c9b9e", "grass": "7c8a5f"}

var root: Node3D
var lamps: Array[Light3D] = []
## Emissive materials whose glow follows the time of day: [material, day energy, night energy].
var glows: Array = []
var box_count := 0
var _batches := {}
var _materials := {}
var _textures := {}
var _room_glass: StandardMaterial3D

static func canteen_local(x: float, z: float) -> Vector2:
	return Vector2(z - CANTEEN_ORIGIN.y, CANTEEN_ORIGIN.x - x)

static func canteen_world(local_x: float, local_z: float) -> Vector2:
	return Vector2(CANTEEN_ORIGIN.x - local_z, CANTEEN_ORIGIN.y + local_x)

## Distance across the road, as on the straight frontage: under 4 is the paved
## side (sidewalk, patio), 4..11 the road between its kerbs, over 11 the lawn.
static func across_road(x: float, z: float) -> float:
	if x < BEND.x:
		return z
	if z < BEND.y:
		return BEND.y - Vector2(x, z).distance_to(BEND)
	return 29.0 - x

static func in_canteen(x: float, z: float) -> bool:
	var local := canteen_local(x, z)
	return local.x > 36.5 and local.x < 65.5 and local.y > -7.3 and local.y < 3.3

static func blocked(x: float, z: float) -> bool:
	for column in COLUMN_X:
		if absf(x - column) < 0.48 and absf(z - 3.05) < 0.48:
			return true
	if x > 30.95 and x < 36.8 and z < 0.65:
		return true # solid stair tower
	var local := canteen_local(x, z)
	if in_canteen(x, z):
		if local.y < -6.4 or local.x < 36.8 or local.x > 65.3:
			return true # rear wall and end walls
	elif across_road(x, z) > 10.6 or x > 36.8 or (x > 26.6 and z > 31.5):
		return true # the lawn, behind the tower, past the wing's end
	for column in CANTEEN_PIERS:
		if absf(local.x - column) < 0.58 and absf(local.y - 1.45) < 0.58:
			return true
	if local.x > 36.3 and local.x < 65.7 and (local.x < 48.8 or local.x > 53.2) and absf(local.y - 2.68) < 0.22:
		return true # patio rail, open at the steps
	for stall in STALL_X:
		if absf(local.x - stall) < 2.75 and absf(local.y + 3.15) < 0.8:
			return true
	for table in PATIO_TABLES:
		if Vector2(x, z).distance_to(table) < 1.12:
			return true
	return false

static func floor_height(x: float, z: float) -> float:
	var local := canteen_local(x, z)
	if local.x >= 36.5 and local.x <= 65.5 and local.y < 2.45 and local.y > -7.3:
		return 0.45
	if local.x > 49.0 and local.x < 53.0 and local.y <= 3.26 and local.y >= 2.45:
		return 0.15 if local.y > 2.8 else 0.3
	var across := across_road(x, z)
	if across > 4.135:
		return -0.2
	if across > 3.85:
		return 0.0
	return 0.03 if absf(x) < 8.75 else -0.04

## The outer bounds; blocked() shapes the L inside them.
static func clamp_position(x: float, z: float) -> Vector2:
	return Vector2(clampf(x, -17.0, 43.3), clampf(z, -1.0, 34.0))

func build(parent: Node3D) -> void:
	root = parent
	_entrance()
	_tower()
	_street()
	_details()
	_patio()
	_flush()
	# The canteen wing is built in its old straight-frontage coordinates under a
	# turned pivot, so its stalls face the patio across the corner.
	var wing := Node3D.new()
	wing.name = "CanteenWing"
	wing.transform = Transform3D(Basis(Vector3.UP, -PI / 2.0), Vector3(CANTEEN_ORIGIN.x, 0, CANTEEN_ORIGIN.y))
	parent.add_child(wing)
	root = wing
	_canteen()
	_flush()
	root = parent
	_flush()

# --- Materials --------------------------------------------------------------

func material(kind: String, tint := Color.WHITE) -> StandardMaterial3D:
	var key := kind + ":" + tint.to_html()
	if _materials.has(key):
		return _materials[key]
	var made := StandardMaterial3D.new()
	made.albedo_color = tint
	made.roughness = 0.9
	made.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	made.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	made.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS_ANISOTROPIC
	if kind == "glass":
		made.albedo_texture = _texture(kind)
		made.uv1_scale = Vector3(3, 2, 1) # one gradient per face of the box
		made.specular_mode = BaseMaterial3D.SPECULAR_SCHLICK_GGX
		made.roughness = 0.3
		made.metallic = 0.12
	elif kind != "plain":
		made.albedo_texture = _texture(kind)
		made.uv1_triplanar = true
		made.uv1_world_triplanar = true
		made.uv1_triplanar_sharpness = 40.0
		made.uv1_scale = Vector3.ONE / float(TILE_METRES[kind])
	_materials[key] = made
	return made

func glow(color: Color, day: float, night: float) -> StandardMaterial3D:
	var made := material("plain", color).duplicate() as StandardMaterial3D
	made.emission_enabled = true
	made.emission = color
	made.emission_energy_multiplier = day
	glows.append([made, day, night])
	return made

func set_night(night: bool) -> void:
	for entry in glows:
		(entry[0] as StandardMaterial3D).emission_energy_multiplier = entry[2] if night else entry[1]
	for light in lamps:
		light.visible = night

func _texture(kind: String) -> Texture2D:
	if _textures.has(kind):
		return _textures[kind]
	var image := Image.create(128, 128, false, Image.FORMAT_RGBA8)
	var random := RandomNumberGenerator.new()
	random.seed = 61015 + kind.hash()
	var base := Color(PALETTE[kind])
	var grain := (2.0 if kind == "stucco" or kind == "road" else (9.0 if kind == "grass" else 5.0)) / 255.0
	for y in 128:
		for x in 128:
			var noise := random.randf_range(-0.5, 0.5) * grain
			image.set_pixel(x, y, Color(base.r + noise, base.g + noise, base.b + noise))
	match kind:
		"stone":
			for y in range(0, 128, 8):
				_rect(image, 0, y, 128, 1, Color("8f8574"))
				var x := -12 if (y / 8) % 2 == 1 else 0
				while x < 128:
					_rect(image, x, y, 1, 8, Color("8f8574"))
					_rect(image, x + 1, y + 1, 23, 1, Color("cec0a8"))
					_rect(image, x + 1, y + 2, 23, 5, Color(0.965, 0.886, 0.745, random.randf() * 0.16))
					x += 24
		"tile":
			for y in 128:
				for x in 128:
					if (x + y) % 64 < 2 or posmod(x - y, 64) < 2:
						image.set_pixel(x, y, Color("91645b"))
					elif x % 64 == 0 or y % 64 == 0:
						image.set_pixel(x, y, Color("bdb8ab"))
		"brick":
			for y in range(-16, 144, 16):
				for x in range(-16, 144, 16):
					var flat := posmod((x + y) / 16, 2) == 0
					var bx := x if flat else x + 1
					var by := y + 1 if flat else y
					_rect(image, bx, by, 16 if flat else 8, 8 if flat else 16, Color("786f5e"))
					_rect(image, bx + 1, by + 1, 14 if flat else 6, 6 if flat else 14,
						Color("b0a18a") if random.randf() > 0.4 else Color("9d927c"))
		"road":
			for i in 160:
				_rect(image, random.randi_range(0, 127), random.randi_range(0, 127), random.randi_range(1, 2), 1,
					Color("a6aaa1") if i % 3 else Color("6f7679"))
		"glass":
			for y in 128:
				var row := Color("a6adad").lerp(Color("929b9d"), float(y) / 127.0)
				for x in 128:
					var sheen := posmod(x - y / 3, 73) < 8
					image.set_pixel(x, y, row.lightened(0.06) if sheen else row)
		"wood":
			for y in range(0, 128, 13):
				_rect(image, 0, y, 128, 1, Color("5f5144"))
				_rect(image, 0, y + 1, 128, 1, Color("b29164"))
		"grass":
			for i in 900:
				var tone: Color = [Color("5a7044"), Color("819a5c"), Color("93a868"), Color("647a49")][i % 4]
				_rect(image, random.randi_range(0, 127), random.randi_range(0, 127), 1, random.randi_range(1, 3), tone)
		"stucco":
			for i in 17:
				_rect(image, random.randi_range(0, 127), random.randi_range(0, 116), 1, random.randi_range(2, 11),
					Color(0.318, 0.325, 0.282, 0.09))
	image.generate_mipmaps()
	var texture := ImageTexture.create_from_image(image)
	_textures[kind] = texture
	return texture

static func _rect(image: Image, x: int, y: int, w: int, h: int, color: Color) -> void:
	for py in range(maxi(y, 0), mini(y + h, image.get_height())):
		for px in range(maxi(x, 0), mini(x + w, image.get_width())):
			if color.a >= 1.0:
				image.set_pixel(px, py, color)
			else:
				var under := image.get_pixel(px, py)
				image.set_pixel(px, py, Color(under.lerp(color, color.a), 1.0))

func _leaf_material(seed_value: int) -> ShaderMaterial:
	var image := Image.create(128, 128, false, Image.FORMAT_RGBA8)
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var colors: Array[Color] = [Color("3a5650"), Color("48664f"), Color("61815a"), Color("89965b"), Color("a8ab70")]
	for i in 2100:
		var x := 3 + random.randi_range(0, 121)
		var y := 4 + random.randi_range(0, 115)
		var nx := (x - 64.0) / 60.0
		var ny := (y - 59.0) / 52.0
		if nx * nx + ny * ny > 0.84 + sin(x * 0.22) * 0.1 + random.randf() * 0.16:
			continue
		var tone := colors[clampi(int(floor((1.0 - y / 128.0) * 4.0 + random.randf() * 2.0 - 1.0)), 0, 4)]
		_rect(image, x - 2, y, 5, 1, tone)
		_rect(image, x - 1, y - 1, 3, 3, tone)
	image.generate_mipmaps()
	var made := ShaderMaterial.new()
	made.shader = LEAVES_SHADER
	made.set_shader_parameter("leaves", ImageTexture.create_from_image(image))
	made.set_shader_parameter("phase", float(seed_value % 17))
	return made

# --- Geometry helpers -------------------------------------------------------

## Boxes that share a size and material become one MultiMesh, like the browser's instancing.
func box(size: Vector3, at: Vector3, made: Material, turn := 0.0) -> void:
	var key := str(size) + "#" + str(made.get_instance_id())
	if not _batches.has(key):
		_batches[key] = {"size": size, "material": made, "at": []}
	(_batches[key]["at"] as Array).append(Transform3D(Basis(Vector3.UP, turn), at))
	box_count += 1

func _flush() -> void:
	for batch in _batches.values():
		var mesh := BoxMesh.new()
		mesh.size = batch["size"]
		mesh.material = batch["material"]
		var multi := MultiMesh.new()
		multi.transform_format = MultiMesh.TRANSFORM_3D
		multi.mesh = mesh
		var positions: Array = batch["at"]
		multi.instance_count = positions.size()
		for i in positions.size():
			multi.set_instance_transform(i, positions[i])
		var instance := MultiMeshInstance3D.new()
		instance.multimesh = multi
		root.add_child(instance)
	_batches.clear()

func _mesh(mesh: Mesh, at: Vector3, made: Material, rotation_y := 0.0) -> MeshInstance3D:
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.material_override = made
	instance.position = at
	instance.rotation.y = rotation_y
	root.add_child(instance)
	return instance

func rod(from: Vector3, to: Vector3, radius: float, color: Color) -> void:
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius * 0.65
	mesh.bottom_radius = radius
	mesh.height = from.distance_to(to)
	mesh.radial_segments = 8
	mesh.rings = 1
	var instance := _mesh(mesh, (from + to) * 0.5, material("plain", color))
	instance.quaternion = Quaternion(Vector3.UP, (to - from).normalized())

## A flat ground surface from xz triangles. Both windings are emitted so it shows
## from above whatever the order; the textures are world-mapped, so no UVs.
func _ground(triangles: PackedVector2Array, y: float, made: Material) -> void:
	var tool := SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	tool.set_normal(Vector3.UP)
	for i in range(0, triangles.size(), 3):
		for order in [[0, 1, 2], [0, 2, 1]]:
			for k in order:
				tool.add_vertex(Vector3(triangles[i + k].x, y, triangles[i + k].y))
	var instance := _mesh(tool.commit(), Vector3.ZERO, made)
	instance.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF

## Points on the road's quarter turn, from the frontage (angle -90°) to the leg towards the camera (0°).
static func bend_point(radius: float, angle: float) -> Vector2:
	return BEND + Vector2(cos(angle), sin(angle)) * radius

## A ring of the bend between two radii, as triangles.
func _ring(inner: float, outer: float, steps := 32) -> PackedVector2Array:
	var triangles := PackedVector2Array()
	for i in steps:
		var a := -PI / 2.0 + PI / 2.0 * i / steps
		var b := -PI / 2.0 + PI / 2.0 * (i + 1) / steps
		var p := [bend_point(inner, a), bend_point(outer, a), bend_point(outer, b), bend_point(inner, b)]
		triangles.append_array([p[0], p[1], p[2], p[0], p[2], p[3]])
	return triangles

## Boxes laid along the bend (kerbs, paint), each turned to its tangent. Without
## a piece length they run a little longer than their arc so the joints close.
func _along_bend(radius: float, size: Vector2, y: float, made: Material, steps := 32, piece := 0.0) -> void:
	var length := piece if piece > 0.0 else radius * PI / 2.0 / steps + 0.04
	for i in steps:
		var a := -PI / 2.0 + PI / 2.0 * (i + 0.5) / steps
		var at := bend_point(radius, a)
		box(Vector3(length, size.y, size.x), Vector3(at.x, y, at.y), made, -a - PI / 2.0)

func window(x: float, y: float, z: float, w := 2.05, h := 1.05) -> void:
	box(Vector3(w + 0.15, h + 0.15, 0.07), Vector3(x, y, z), material("plain", Color("333e49")))
	if _room_glass == null:
		_room_glass = material("glass").duplicate() as StandardMaterial3D
		_room_glass.emission_enabled = true
		_room_glass.emission = Color("ffc281")
		glows.append([_room_glass, 0.0, 1.35])
	var occupied := posmod(roundi(x * 7.0 + y * 11.0), 4) == 0
	box(Vector3(w, h, 0.035), Vector3(x, y, z + 0.05), _room_glass if occupied else material("glass"))
	var frame := material("plain", Color("bbbcb3"))
	for dx in [-w / 2.0, 0.0, w / 2.0]:
		box(Vector3(0.035, h + 0.08, 0.05), Vector3(x + dx, y, z + 0.09), frame)
	for dy in [-h / 2.0, h / 2.0]:
		box(Vector3(w + 0.09, 0.045, 0.075), Vector3(x, y + dy, z + 0.09), frame)
	box(Vector3(w + 0.23, 0.08, 0.24), Vector3(x, y - h / 2.0 - 0.08, z + 0.11), material("stucco"))

## A lit sign: a backing board and shaded text, readable at every zoom.
func panel(text: String, at: Vector3, width: float, height: float, ink: Color, board := Color(0, 0, 0, 0)) -> Label3D:
	if board.a > 0.0:
		box(Vector3(width, height, 0.03), at + Vector3(0, 0, -0.02), material("plain", board))
	var label := Label3D.new()
	label.name = text
	label.text = text
	label.font_size = 64
	label.outline_size = 0
	label.modulate = ink
	label.shaded = true
	label.alpha_cut = Label3D.ALPHA_CUT_OPAQUE_PREPASS
	label.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
	label.pixel_size = minf(height * 0.62 / 64.0, width * 0.9 / (text.length() * 0.62 * 64.0))
	label.position = at
	root.add_child(label)
	return label

func _lamp(light: Light3D, at: Vector3) -> void:
	light.position = at
	light.visible = false
	root.add_child(light)
	lamps.append(light)

func _omni(at: Vector3, color: Color, energy: float, reach: float, shadows := false) -> void:
	var light := OmniLight3D.new()
	light.light_color = color
	light.light_energy = energy
	light.omni_range = reach
	light.omni_attenuation = 1.4
	light.shadow_enabled = shadows
	light.shadow_normal_bias = 1.2
	_lamp(light, at)

# --- APS wing, canopy and tall block ----------------------------------------

func _entrance() -> void:
	var wall := material("stucco")
	var slab := material("stucco", Color("f3f0e5"))
	var metal := material("plain", Color("888f90"))
	box(Vector3(36, 13.4, 0.36), Vector3(0, 6.7, -3.15), wall)
	for x in [-18.0, 18.0]:
		box(Vector3(0.35, 13.4, 3), Vector3(x, 6.7, -1.8), wall)
	for level in 4:
		var y := 3.35 + level * 3.05
		box(Vector3(36.6, 0.26, 3.4), Vector3(0, y, -1.7), slab)
		if level < 3:
			box(Vector3(36.25, 0.85, 0.19), Vector3(0, y + 0.55, -0.12), wall)
			box(Vector3(36.4, 0.07, 0.28), Vector3(0, y + 1.0, -0.12), slab)
			box(Vector3(36.1, 0.025, 0.035), Vector3(0, y + 1.35, -0.12), metal)
			for x in range(-18, 19, 3):
				box(Vector3(0.025, 0.35, 0.035), Vector3(x, y + 1.18, -0.12), metal)
	for x in range(-18, 19, 3):
		box(Vector3(0.23, 12.8, 0.38), Vector3(x, 6.4, -0.2), slab)
		for level in 4:
			if x < 18 and (level > 0 or absi(x) > 2):
				window(x + 1.4, 1.9 + level * 3.05, -2.94)
		if x % 9 == 0:
			box(Vector3(0.065, 12.7, 0.09), Vector3(x + 0.21, 6.35, -0.02), material("metal"))
	box(Vector3(36.8, 0.7, 0.25), Vector3(0, 13.0, -0.05), material("metal", Color("e6e9e3")))
	for x in range(-18, 19):
		box(Vector3(0.018, 0.66, 0.025), Vector3(x, 13.0, 0.09), metal)
	box(Vector3(36.6, 0.3, 3.5), Vector3(0, 13.45, -1.65), material("stucco", Color("c9c7bc")))

	box(Vector3(17.2, 0.42, 4.4), Vector3(0, 3.45, 1.4), slab)
	box(Vector3(17.35, 0.08, 0.16), Vector3(0, 3.65, 3.62), material("plain", Color("fff5dd")))
	for x in COLUMN_X:
		box(Vector3(0.56, 3.22, 0.56), Vector3(x, 1.61, 3.05), material("stone"))
		box(Vector3(0.7, 0.13, 0.7), Vector3(x, 3.15, 3.05), slab)
		box(Vector3(0.67, 0.16, 0.67), Vector3(x, 0.08, 3.05), material("stone", Color("d8d2c4")))
	box(Vector3(17.5, 0.09, 5.4), Vector3(0, -0.015, 1.15), material("tile"))
	box(Vector3(17.6, 0.14, 0.32), Vector3(0, -0.06, 3.95), material("stucco", Color("bbb9ad")))
	box(Vector3(2.6, 2.8, 0.12), Vector3(0, 1.4, -2.9), material("plain", Color("282d37")))
	for x in [-0.63, 0.63]:
		box(Vector3(1.12, 2.47, 0.08), Vector3(x, 1.35, -2.78), material("glass", Color("aab9ba")))
		box(Vector3(0.035, 0.43, 0.08), Vector3(x * 0.18, 1.2, -2.7), metal)
	box(Vector3(0.055, 2.6, 0.08), Vector3(0, 1.35, -2.71), metal)
	window(-5.3, 1.65, -2.94, 2.2, 0.75)
	box(Vector3(2.5, 0.14, 0.38), Vector3(-5.3, 1.1, -2.7), material("stone"))
	panel("ARCHBISHOP PEDRO SANTOS BUILDING", Vector3(0, 3.45, 3.665), 9.73, 0.61, Color("7a303c"))
	var strip := glow(Color("ffe8bc"), 0.35, 2.4)
	for x in [-6.0, -2.0, 2.0, 6.0]:
		box(Vector3(0.75, 0.035, 0.11), Vector3(x, 3.22, 1.2), strip)
		_omni(Vector3(x, 2.98, 1.2), Color("ffcf92"), 0.55, 4.6)

	box(Vector3(13, 21.3, 0.35), Vector3(24.5, 10.65, -4), wall)
	for level in 6:
		var y := 3.35 + level * 3.0
		box(Vector3(13.4, 0.32, 4.2), Vector3(24.5, y, -1.9), slab)
		box(Vector3(13.1, 0.93, 0.25), Vector3(24.5, y + 0.61, 0.05), wall)
		for x in [19.8, 23.0, 26.2, 29.4]:
			window(x, y + 1.9, -3.78, 2.3, 0.8)
	for x in [18.1, 24.5, 30.9]:
		box(Vector3(0.44, 21.3, 0.5), Vector3(x, 10.65, -0.05), slab)
	box(Vector3(13.5, 0.28, 4.2), Vector3(24.5, 21.35, -1.9), slab)

# --- Street -----------------------------------------------------------------

func _street() -> void:
	# Asphalt everywhere underneath: the road, and the parking beyond the canteen wing.
	box(Vector3(160, 0.2, 95), Vector3(20, -0.3, 36), material("road"))
	var kerb := material("stucco", Color("bfc4bc"))
	var walk := material("stucco", Color("cfcdc1"))
	var grass := material("grass")
	# Frontage sidewalk and its kerb, up to where the road starts to turn.
	box(Vector3(58, 0.18, 5), Vector3(-11, -0.13, 1.35), walk)
	box(Vector3(48.5, 0.21, 0.27), Vector3(-15.75, -0.105, 4), kerb)
	for x in range(-35, 18, 2):
		box(Vector3(0.014, 0.008, 4.9), Vector3(x, -0.034, 1.35), material("plain", Color("999f99")))
	# Outside of the bend: kerb, a sidewalk ring, then the sidewalk on to the canteen's end.
	_along_bend(16.5, Vector2(0.27, 0.21), -0.105, kerb)
	_ground(_ring(16.5, 18.1), -0.045, walk)
	box(Vector3(0.27, 0.21, 74.5), Vector3(25, -0.105, 57.75), kerb)
	box(Vector3(1.6, 0.18, 74.5), Vector3(25.8, -0.135, 57.75), walk)
	# Inside of the bend: kerb straight onto lawn, as in the lawn-side photos.
	_along_bend(9.5, Vector2(0.27, 0.21), -0.105, kerb)
	box(Vector3(68.5, 0.21, 0.27), Vector3(-25.75, -0.105, 11), kerb)
	box(Vector3(0.27, 0.21, 74.5), Vector3(18, -0.105, 57.75), kerb)
	_ground(_ring(0.0, 9.5, 24), -0.06, grass)
	box(Vector3(68.5, 0.16, 84), Vector3(-25.75, -0.14, 53), grass)
	box(Vector3(9.5, 0.16, 74.5), Vector3(13.25, -0.14, 57.75), grass)
	box(Vector3(73.4, 0.16, 63.5), Vector3(63.3, -0.14, 63.25), grass)
	# Mown bands give the lawn some rhythm in the wide framings.
	var mown := material("grass", Color("f3f5ec"))
	for x in range(-58, 6, 6):
		box(Vector3(3, 0.01, 84), Vector3(x, -0.055, 53), mown)
	for x in [-12.8, -10.3, 10.3, 13.0]:
		pot(x, 2.65)
	_tree(Vector3(-13.5, 0, 2), 7.1, 610)
	_tree(Vector3(12.7, 0, 3), 6.5, 611)
	_tree(Vector3(-8.8, -0.15, 12.5), 8.6, 612)
	_tree(Vector3(-4.0, -0.15, 18.0), 8.1, 613)
	_tree(Vector3(14.5, -0.15, 36.0), 7.4, 614)
	_tree(Vector3(7.0, -0.15, 34.0), 8.4, 615)
	for x in [-11.5, 11.4]:
		_lantern(x)
	for x in [-10.2, 11.0]:
		for dx in [-1.0, 1.0]:
			box(Vector3(0.09, 0.45, 0.45), Vector3(x + dx, 0.225, 1), material("plain", Color("3d4c4c")))
		for dz in [-0.17, 0.0, 0.17]:
			box(Vector3(2.4, 0.07, 0.145), Vector3(x, 0.47, 1 + dz), material("wood"))
		for y in [0.75, 0.93]:
			box(Vector3(2.4, 0.14, 0.08), Vector3(x, y, 0.76), material("wood"))
	for i in 15:
		var h := 5.0 + (i * 17) % 9
		box(Vector3(8, h, 5), Vector3(-55 + i * 10, h / 2.0, -19), material("plain", Color("93a7ad")))

func pot(x: float, z: float) -> void:
	var mesh := CylinderMesh.new()
	mesh.top_radius = 0.43
	mesh.bottom_radius = 0.3
	mesh.height = 0.65
	mesh.radial_segments = 8
	_mesh(mesh, Vector3(x, 0.325, z), material("plain", Color("a66d50")))
	for i in 7:
		var a := i * TAU / 7.0
		rod(Vector3(x, 0.6, z), Vector3(x + cos(a) * 0.45, 1.05 + (i % 3) * 0.16, z + sin(a) * 0.4), 0.045, Color("708754"))

func _tree(at: Vector3, height: float, seed_value: int) -> void:
	rod(at, at + Vector3(0.1, height * 0.68, 0), 0.13, Color("645e50"))
	var leaves := _leaf_material(seed_value)
	var quad := QuadMesh.new()
	quad.size = Vector2(4.48, 4.48)
	for i in 4:
		var a := i * 2.3
		var offset := at + Vector3(cos(a) * 0.9, height * (0.6 + (i % 2) * 0.16), sin(a) * 0.6)
		rod(at + Vector3(0, height * 0.4, 0), offset, 0.07, Color("645e50"))
		var crown := _mesh(quad, offset, leaves, (i % 2) * 0.7)
		crown.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED

func _lantern(x: float, z := 3.9) -> void:
	var metal := material("plain", Color("66503b"))
	box(Vector3(0.28, 0.18, 0.28), Vector3(x, 0.09, z), metal)
	box(Vector3(0.09, 3.4, 0.09), Vector3(x, 1.7, z), metal)
	box(Vector3(1.15, 0.07, 0.07), Vector3(x, 3.45, z), metal)
	var glass := glow(Color("f2cc92"), 0.4, 3.0)
	for dx in [-0.5, 0.5]:
		box(Vector3(0.22, 0.38, 0.22), Vector3(x + dx, 3.15, z), glass)
		box(Vector3(0.3, 0.07, 0.3), Vector3(x + dx, 3.38, z), metal)
	var light := SpotLight3D.new()
	light.light_color = Color("ffd194")
	light.light_energy = 4.0
	light.spot_range = 9.0
	light.spot_angle = 62.0
	light.spot_angle_attenuation = 0.8
	light.shadow_enabled = true
	light.shadow_normal_bias = 1.0
	light.rotation_degrees.x = -90.0
	_lamp(light, Vector3(x, 3.05, z))

# --- Canteen patio -------------------------------------------------------------

## The herringbone-brick patio in the corner of the L: in front of the tall block
## and the tower, and along the canteen's open side, with the umbrella tables,
## a shade tree in the middle and the tower's ornate lamp post.
func _patio() -> void:
	var brick := material("brick", Color("f0b49a"))
	var corner := Vector2(36.5, -1.15)
	var edge := 18.1
	var fan := PackedVector2Array([Vector2(BEND.x, corner.y), bend_point(edge, -PI / 2.0), corner])
	var steps := 32
	for i in steps:
		fan.append_array([corner, bend_point(edge, -PI / 2.0 + PI / 2.0 * i / steps),
			bend_point(edge, -PI / 2.0 + PI / 2.0 * (i + 1) / steps)])
	fan.append_array([corner, bend_point(edge, 0.0), Vector2(corner.x, BEND.y)])
	_ground(fan, -0.05, brick)
	box(Vector3(6.7, 0.1, 11), Vector3(29.95, -0.1, 26), brick)
	for i in PATIO_TABLES.size():
		var table := PATIO_TABLES[i]
		_umbrella(table.x, table.y, Color("b96058") if i % 2 == 0 else Color("9c6250"))
	_tree(Vector3(25.5, -0.05, 6.5), 8.8, 616)
	_tree(Vector3(27.4, -0.05, 12.0), 7.6, 617)
	_lantern(31.0, 2.4)
	for at in [Vector2(19.5, 1.0), Vector2(26.8, 30.5)]:
		pot(at.x, at.y)

# --- Stair tower and canteen wing --------------------------------------------

## The blank stair tower at the corner of the L (world coordinates).
func _tower() -> void:
	var white := material("stucco", Color("fffef5"))
	box(Vector3(5.2, 23, 6.8), Vector3(33.9, 11.5, -3.2), white)
	box(Vector3(5.5, 0.25, 7), Vector3(33.9, 23.1, -3.2), white)
	for y in [5.8, 6.5, 12.0, 12.7]:
		box(Vector3(5.35, 0.12, 0.2), Vector3(33.9, y, 0.3), white)
	for y in range(4, 23, 3):
		box(Vector3(0.65, 1.7, 0.07), Vector3(31.72, y, 0.24), material("glass"))
	box(Vector3(1.1, 2.5, 0.08), Vector3(31.9, 1.25, 0.25), material("plain", Color("45494a")))

## The canteen wing in its own frame: x along the wing, +z out of the open hall.
func _canteen() -> void:
	var cream := material("stucco", Color("fff8e8"))
	var white := material("stucco", Color("fffef5"))
	var steel := material("plain", Color("414b50"))
	var stone := material("stone")

	box(Vector3(29, 12.4, 7.4), Vector3(51, 11.65, -3.4), cream)
	box(Vector3(29.4, 0.65, 7.6), Vector3(51, 18.05, -3.4), white)
	box(Vector3(29.4, 0.13, 0.18), Vector3(51, 18.35, 0.5), material("plain", Color("8c8e86")))
	for level in 4:
		var y := 6.5 + level * 3.05
		for bay in 6:
			var x := 38.95 + bay * 4.82
			window(x, y + 1.2, 0.35, 3.9, 1.4)
			box(Vector3(4.28, 0.65, 0.65), Vector3(x, y + 0.14, 0.48), white)
			if (level + bay) % 3 != 0:
				for line in 3:
					box(Vector3(3.8, 0.045, 0.03), Vector3(x, y + 1.15 + line * 0.18, 0.465), material("plain", Color("aaa79b")))
	for bay in 7:
		box(Vector3(0.23, 12.4, 0.28), Vector3(36.5 + bay * 4.83, 11.65, 0.4), white)

	box(Vector3(29.1, 0.3, 8.5), Vector3(51, 5.3, -2.7), white)
	# The hall is open to the patio; the building's rear wall closes it behind the stalls.
	box(Vector3(29, 4.9, 0.3), Vector3(51, 2.9, -7.0), material("stucco", Color("e9e0cc")))
	box(Vector3(29, 1.2, 0.04), Vector3(51, 0.95, -6.83), material("plain", Color("c3b8a2")))
	for x in [38.4, 45.9, 55.9, 63.4]:
		box(Vector3(1.6, 2.4, 0.1), Vector3(x, 1.65, -6.82), material("plain", Color("5d5a52")))
	for x in [41.0, 50.8, 60.6]:
		box(Vector3(3.6, 0.7, 0.06), Vector3(x, 3.6, -6.83), material("plain", Color("c9b79a")))
	box(Vector3(29, 0.2, 9.8), Vector3(51, 0.35, -2.4), material("tile"))
	for i in CANTEEN_PIERS.size():
		var x := CANTEEN_PIERS[i]
		box(Vector3(0.65, 4.75, 0.65), Vector3(x, 2.825, 1.45), white)
		box(Vector3(0.68, 2.1, 0.68), Vector3(x, 1.5, 1.45), material("plain", Color("d1ad3d")) if i == 3 else stone)
		box(Vector3(0.83, 0.12, 0.83), Vector3(x, 5.15, 1.45), white)
	for step in 3:
		box(Vector3(4, (step + 1) * 0.15, 0.46), Vector3(51, (step + 1) * 0.075, 3.03 - step * 0.44), white)
	for span in [[36.5, 48.8], [53.2, 65.5]]:
		var left: float = span[0]
		var right: float = span[1]
		for y in [0.65, 1.05]:
			box(Vector3(right - left, 0.045, 0.045), Vector3((left + right) / 2.0, y, 2.68), steel)
		var post := left
		while post < right:
			box(Vector3(0.045, 1.05, 0.045), Vector3(post, 0.525, 2.68), steel)
			post += 1.3

	box(Vector3(30, 0.13, 3.2), Vector3(51, 5.12, 1.6), material("plain", Color("526e8a")))
	var seam := 36.0
	while seam <= 66.0:
		box(Vector3(0.025, 0.045, 3.2), Vector3(seam, 5.2, 1.6), material("plain", Color("8196a8")))
		seam += 0.7
	box(Vector3(30, 0.11, 0.1), Vector3(51, 4.92, 3.2), material("plain", Color("8c4843")))
	var truss := 36.5
	while truss < 65.0:
		rod(Vector3(truss, 4.8, 2.95), Vector3(truss + 1.2, 4.5, 2.95), 0.018, Color("424c52"))
		rod(Vector3(truss + 1.2, 4.5, 2.95), Vector3(truss + 2.4, 4.8, 2.95), 0.018, Color("424c52"))
		truss += 2.4
	_valance()
	panel("APS CANTEEN", Vector3(51, 4.8, 3.3), 3.5, 0.52, Color("fff4dc"), Color("526e75"))

	var stalls := [["YUM-YUMS", "eee3cc", "34528a"], ["GRANNY JINGS", "c36f59", "fff3da"], ["BYFROST", "426db4", "ffffff"]]
	var trays: Array[Color] = [Color("b57738"), Color("d8b55e"), Color("984c35")]
	for i in 3:
		var x := STALL_X[i]
		box(Vector3(5, 1.05, 1.1), Vector3(x, 0.975, -3.15), material("stucco", Color("f5e5c5")))
		box(Vector3(4.8, 0.45, 0.7), Vector3(x, 1.72, -3.15), material("glass", Color("d7eee5")))
		box(Vector3(5.1, 0.08, 1.18), Vector3(x, 1.5, -3.15), material("plain", Color("b95442")))
		for tray in 5:
			box(Vector3(0.65, 0.08, 0.44), Vector3(x - 1.7 + tray * 0.85, 1.99, -3.15), material("plain", trays[tray % 3]))
		panel(stalls[i][0], Vector3(x, 3.25, -3.03), 4.4, 0.7, Color(stalls[i][2]), Color(stalls[i][1]))
		for dx in [-2.35, 2.35]:
			box(Vector3(0.035, 1.8, 0.035), Vector3(x + dx, 2.7, -3.2), steel)
		_omni(Vector3(x, 3.8, -1.2), Color("ffd79d"), 1.6, 7.5)

	for x in [37.6, 64.2]:
		pot(x, 2.1)
	# Rooftop tanks and air-conditioning units under some classroom windows.
	var tank := CylinderMesh.new()
	tank.top_radius = 0.9
	tank.bottom_radius = 0.9
	tank.height = 1.6
	tank.radial_segments = 12
	for x in [44.0, 58.0]:
		box(Vector3(2.2, 0.9, 2.2), Vector3(x, 18.8, -4.2), material("plain", Color("6f7470")))
		_mesh(tank, Vector3(x, 20.05, -4.2), material("plain", Color("3f5f8a")))
	var unit := material("plain", Color("e8e8e2"))
	var grille := material("plain", Color("3f4446"))
	for level in 4:
		for bay in 6:
			if posmod(level * 5 + bay * 3, 4) == 1:
				var x := 38.95 + bay * 4.82 + 1.2
				box(Vector3(0.78, 0.46, 0.42), Vector3(x, 6.5 + level * 3.05 - 0.4, 0.98), unit)
				box(Vector3(0.6, 0.3, 0.02), Vector3(x, 6.5 + level * 3.05 - 0.4, 1.2), grille)
	box(Vector3(0.25, 17.4, 7.2), Vector3(65.65, 9.1, -3.4), cream)
	for level in range(1, 5):
		var y := 4.0 + level * 3.0
		box(Vector3(1.2, 0.09, 2), Vector3(66.3, y, -1.2), steel)
		rod(Vector3(66.6, y, -2.1), Vector3(66.6, y + 3, -0.3), 0.035, Color("414b50"))
		rod(Vector3(66.6, y + 0.8, -2.1), Vector3(66.6, y + 3.8, -0.3), 0.025, Color("414b50"))

func _valance() -> void:
	var image := Image.create(256, 16, false, Image.FORMAT_RGBA8)
	var cloth := Color("ded8c8")
	_rect(image, 0, 0, 256, 4, cloth)
	for cx in range(4, 256, 8):
		for py in range(3, 8):
			for px in range(cx - 4, cx + 4):
				if Vector2(px + 0.5 - cx, py + 0.5 - 3.0).length() <= 4.0:
					image.set_pixel(clampi(px, 0, 255), py, cloth)
	image.generate_mipmaps()
	var made := StandardMaterial3D.new()
	made.albedo_texture = ImageTexture.create_from_image(image)
	made.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
	made.alpha_scissor_threshold = 0.4
	made.cull_mode = BaseMaterial3D.CULL_DISABLED
	made.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	made.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	made.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	var quad := QuadMesh.new()
	quad.size = Vector2(30, 0.4)
	_mesh(quad, Vector3(51, 4.72, 3.24), made).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED

func _umbrella(x: float, z: float, color: Color) -> void:
	var stem := material("plain", Color("4d4740"))
	var cone := CylinderMesh.new()
	cone.top_radius = 0.0
	cone.bottom_radius = 2.05
	cone.height = 0.65
	cone.radial_segments = 8
	cone.rings = 1
	cone.cap_bottom = false
	var canvas := material("plain", color).duplicate() as StandardMaterial3D
	canvas.cull_mode = BaseMaterial3D.CULL_DISABLED
	_mesh(cone, Vector3(x, 3.05, z), canvas, PI / 8.0).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	box(Vector3(0.06, 3.35, 0.06), Vector3(x, 1.675, z), stem)
	var top := CylinderMesh.new()
	top.top_radius = 0.85
	top.bottom_radius = 0.85
	top.height = 0.08
	top.radial_segments = 16
	_mesh(top, Vector3(x, 0.83, z), material("wood"))
	box(Vector3(0.09, 0.8, 0.09), Vector3(x, 0.4, z), stem)
	for dx in [-1.2, 1.2]:
		for dy in [0.5, 0.88, 1.05]:
			box(Vector3(0.55, 0.12, 0.11), Vector3(x + dx, dy, z - (0.24 if dy > 0.6 else 0.0)), material("wood"))
		for leg in [-0.23, 0.23]:
			box(Vector3(0.035, 0.5, 0.45), Vector3(x + dx + leg, 0.25, z), stem)

# --- Small street and roof details (new in the Godot port) -------------------

func _details() -> void:
	# Centre dashes and edge lines follow the road round the bend.
	var paint := material("plain", Color("d9d4c2"))
	var dash := -40.0
	while dash < 7.0:
		box(Vector3(2.2, 0.012, 0.14), Vector3(dash, -0.194, 7.5), paint)
		dash += 5.0
	_along_bend(13.0, Vector2(0.14, 0.012), -0.194, paint, 4, 2.2)
	dash = 23.0
	while dash < 82.0:
		box(Vector3(0.14, 0.012, 2.2), Vector3(21.5, -0.194, dash), paint)
		dash += 5.0
	box(Vector3(48.5, 0.012, 0.1), Vector3(-15.75, -0.194, 4.55), paint)
	box(Vector3(48.5, 0.012, 0.1), Vector3(-15.75, -0.194, 10.6), paint)
	_along_bend(15.95, Vector2(0.1, 0.012), -0.194, paint)
	_along_bend(9.9, Vector2(0.1, 0.012), -0.194, paint)
	box(Vector3(0.1, 0.012, 74.5), Vector3(24.45, -0.194, 57.75), paint)
	box(Vector3(0.1, 0.012, 74.5), Vector3(18.4, -0.194, 57.75), paint)
	var grate := material("plain", Color("3f4446"))
	for x in [-26.0, -14.0, 2.0]:
		box(Vector3(0.9, 0.014, 0.32), Vector3(x, -0.193, 4.4), grate)
		for bar in 5:
			box(Vector3(0.03, 0.016, 0.3), Vector3(x - 0.36 + bar * 0.18, -0.19, 4.4), material("plain", Color("6b7174")))
	# Rooftop equipment so the skyline reads at the wide framings.
	for x in [-12.0, -4.0, 6.0]:
		box(Vector3(1.1, 0.6, 0.8), Vector3(x, 13.9, -2.4), material("plain", Color("c5c8c2")))
		box(Vector3(0.9, 0.04, 0.6), Vector3(x, 14.21, -2.4), material("plain", Color("5f6466")))
	box(Vector3(1.6, 1.1, 1.6), Vector3(27.5, 22.05, -2.6), material("stucco", Color("e4e2d8")))

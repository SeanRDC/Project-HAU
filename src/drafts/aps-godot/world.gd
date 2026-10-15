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
## Its tip lands on the plan's z 24.9 (OSM); its first 4.7 m sit inside the stair
## tower's footprint, where the real wing meets the main block.
const CANTEEN_ORIGIN := Vector2(36.0, -40.7)
## The patio bend's centre (see roads.gd): the road turns a quarter circle about it.
const BEND := Vector2(8.5, 20.5)
## The APS wing's west end: the plan puts it at x -62.2, beside PGN.
const WING_WEST := -63.0
## Patio umbrellas (world), clear of the canteen steps (z 8.3..12.3).
const PATIO_TABLES: Array[Vector2] = [Vector2(23.0, 3.0), Vector2(28.2, 3.2), Vector2(25.2, 9.6),
	Vector2(29.8, 15.8), Vector2(29.8, 21.0)]
## The patio's tall LED street lights, at its kerb side.
const STREET_LIGHTS: Array[Vector2] = [Vector2(26.9, 5.6), Vector2(26.9, 18.4)]
## Between the canteen wing's east wall and the Covered Court (the "FAREST RIGHT SIDE"
## photos): green steel picnic sheds, then a vine-covered timber pergola, on dirt.
const STRIP := Rect2(43.4, 0.4, 4.2, 30.0)
const PERGOLA_POSTS: Array[Vector2] = [Vector2(43.8, 12.0), Vector2(47.2, 12.0), Vector2(43.8, 16.5), Vector2(47.2, 16.5),
	Vector2(43.8, 21.0), Vector2(47.2, 21.0), Vector2(43.8, 25.5), Vector2(47.2, 25.5), Vector2(43.8, 30.0), Vector2(47.2, 30.0)]
const SHEDS: Array[Vector2] = [Vector2(45.5, 3.3), Vector2(45.5, 7.6)]
## More green picnic sheds on the lawn across the road from the APS entrance, each on
## a patch of worn dirt. They stay west of x 0 so the canteen camera (which sits over
## the lawn near x 3.5 looking east) never has one in front of the stalls.
## The corner where the road turns south past PGN ("APS LEFT SIDE"): a dirt garden
## outside the turn with bamboo, shade trees, red-tipped shrubs and a green-netted
## enclosure behind a yellow mesh fence.
const GARDEN_TURN := Vector2(-44.5, 21.5)
const GARDEN_EDGE := 17.6
const LAWN_SHEDS: Array[Vector2] = [Vector2(-14.0, 15.4), Vector2(-7.8, 17.6), Vector2(-2.6, 15.0)]
const LEAVES_SHADER := preload("res://shaders/leaves.gdshader")
const Roads := preload("res://roads.gd")
const Chapel := preload("res://areas/chapel.gd")
const Plots := preload("res://areas/plots.gd")
const Gym := preload("res://areas/gym.gd")
const Hallway := preload("res://areas/hallway.gd")

## Texture world size in metres per 128 px tile. Triplanar world mapping keeps
## the pixel density even on every face, so long walls never stretch their texels.
const TILE_METRES := {"stucco": 4.0, "stone": 1.1, "road": 5.0, "tile": 3.2,
	"brick": 2.0, "wood": 1.5, "metal": 2.0, "grass": 3.0, "dirt": 2.5, "pavers": 2.4,
	"concrete": 4.0, "slate": 2.4, "solar": 1.0, "ribbed": 1.6, "floor": 2.4, "ledge": 1.2}
const PALETTE := {"stucco": "d7d6cb", "stone": "b6a385", "road": "899093", "tile": "d6d1c3",
	"brick": "a7957b", "wood": "8b6b4e", "glass": "455965", "metal": "8c9b9e", "grass": "7c8a5f",
	"dirt": "9a8566", "pavers": "a69b8d", "floor": "d9bfa9", "ledge": "8a7d6a",
	"concrete": "a3a49c", "slate": "605e5c", "solar": "26364f", "ribbed": "a9aeae"}

var root: Node3D
var lamps: Array[Light3D] = []
## Emissive materials whose glow follows the time of day: [material, day energy, night energy].
var glows: Array = []
var box_count := 0
var _batches := {}
var _materials := {}
var _textures := {}
var _room_glass: StandardMaterial3D
var _grass: ShaderMaterial
var _card_meshes := {}

static func canteen_local(x: float, z: float) -> Vector2:
	return Vector2(z - CANTEEN_ORIGIN.y, CANTEEN_ORIGIN.x - x)

static func canteen_world(local_x: float, local_z: float) -> Vector2:
	return Vector2(CANTEEN_ORIGIN.x - local_z, CANTEEN_ORIGIN.y + local_x)

## Distance across the road (see roads.gd): under 4 is the building side
## (sidewalk, patio), 4..11 the carriageway between its kerbs, over 11 the lawn.
static func across_road(x: float, z: float) -> float:
	return Roads.across(x, z)

static func in_garden(x: float, z: float) -> bool:
	var inside_corner := x < GARDEN_TURN.x and x > -62.0 and z < GARDEN_TURN.y and z > 0.3
	return inside_corner and Vector2(x, z).distance_to(GARDEN_TURN) > GARDEN_EDGE

## Where the student may walk outside the buildings: the north road and the APS
## front, the patio and canteen, the road past the canteen's tip, the strip by the
## Covered Court, the west road, the lawn path, the chapel's plaza and parking, and
## the east road down past the gym with its apron and lane. The south road waits for
## SJH (its view needs that building).
static func walkable_ground(x: float, z: float) -> bool:
	var across := across_road(x, z)
	if across >= 2.2 and across <= 10.6 and (z < 38.0 or x < -45.0 or (x > 36.0 and z < 104.0)):
		return true # carriageway and sidewalks
	if Gym.on_apron(x, z):
		return true
	if x > -44.5 and x < 36.8 and z > -1.0 and across < 4.0:
		return true # the APS front, its corridor and the patio
	if STRIP.has_point(Vector2(x, z)) or Hallway.in_hall(x, z):
		return true
	return Chapel.walkable(x, z)

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
		if local.y < -6.4 or local.x < 41.5 or local.x > 65.3:
			return true # rear wall, end walls, and the part inside the tower
	elif not walkable_ground(x, z) or in_garden(x, z) or Plots.occupied(x, z):
		return true
	elif Chapel.blocked(x, z) or Gym.blocked(x, z) or Hallway.blocked(x, z):
		return true
	for post in STREET_LIGHTS + PERGOLA_POSTS:
		if Vector2(x, z).distance_to(post) < 0.3:
			return true
	for shed in SHEDS:
		if absf(x - shed.x) < 1.3 and absf(z - shed.y) < 0.9:
			return true # picnic table and benches
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
	var gym := Gym.floor_height(x, z)
	if not is_nan(gym):
		return gym
	var across := across_road(x, z)
	if across > 4.135 and across < 10.865:
		return -0.19 # carriageway
	if (across >= 3.85 and across <= 4.135) or (across >= 10.865 and across <= 11.135):
		return 0.0 # kerb
	var hall := Hallway.floor_height(x, z)
	if not is_nan(hall):
		return hall
	var plaza := Chapel.floor_height(x, z)
	if not is_nan(plaza):
		return plaza
	if absf(x) < 8.75 and z < 3.85:
		return 0.03 # canopy tile
	return -0.04 if across < 4.0 else -0.2

## The outer bounds; blocked() shapes the walkable campus inside them.
static func clamp_position(x: float, z: float) -> Vector2:
	return Vector2(clampf(x, -63.0, 101.0), clampf(z, Hallway.BACK, 116.0))

func build(parent: Node3D) -> void:
	root = parent
	_entrance()
	_tower()
	_street()
	_details()
	_patio()
	_yard()
	_left_garden()
	Chapel.new().build(self)
	Hallway.new().build(self)
	Plots.new().build(self)
	Gym.new().build(self)
	_grasses()
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
		"floor":
			# Peach ceramic tiles, 30 cm square, with light grout and the odd paler tile.
			for ty in 8:
				for tx in 8:
					if random.randf() < 0.18:
						_rect(image, tx * 16, ty * 16, 16, 16, Color(1, 0.97, 0.93, 0.18))
			for line in range(0, 128, 16):
				_rect(image, line, 0, 1, 128, Color("b9a28f"))
				_rect(image, 0, line, 128, 1, Color("b9a28f"))
		"ledge":
			# Ledgestone: thin stacked slates in browns and greys, staggered, with dark gaps.
			var tones: Array[Color] = [Color("6f6252"), Color("8a7b66"), Color("9d8f7a"), Color("5e554a"), Color("a69a86")]
			var y := 0
			while y < 128:
				var rows := random.randi_range(3, 5)
				var x := -random.randi_range(0, 20)
				while x < 128:
					var length := random.randi_range(12, 30)
					_rect(image, x, y, length - 1, rows - 1, tones[random.randi_range(0, 4)])
					_rect(image, x, y, length - 1, 1, Color(1, 1, 1, 0.12))
					x += length
				_rect(image, 0, y + rows - 1, 128, 1, Color("3c352e"))
				y += rows
		"pavers":
			# Stamped concrete: a square grid of slightly different slabs with dark joints.
			for ty in 8:
				for tx in 8:
					_rect(image, tx * 16, ty * 16, 16, 16, Color(0.3, 0.27, 0.24, random.randf_range(0.0, 0.12)))
			for line in range(0, 128, 16):
				_rect(image, line, 0, 1, 128, Color("7a7064"))
				_rect(image, 0, line, 128, 1, Color("7a7064"))
		"dirt":
			for i in 260:
				var tone: Color = [Color("7d6a50"), Color("b19d7c"), Color("8a785c"), Color("c2b294")][i % 4]
				_rect(image, random.randi_range(0, 127), random.randi_range(0, 127), random.randi_range(1, 3), random.randi_range(1, 2), tone)
			for i in 9:
				var cx := random.randi_range(0, 127)
				var cy := random.randi_range(0, 127)
				for p in 40:
					_rect(image, cx + random.randi_range(-7, 7), cy + random.randi_range(-4, 4), 2, 1, Color(0.42, 0.36, 0.27, 0.35))
		"grass":
			for i in 900:
				var tone: Color = [Color("5a7044"), Color("819a5c"), Color("93a868"), Color("647a49")][i % 4]
				_rect(image, random.randi_range(0, 127), random.randi_range(0, 127), 1, random.randi_range(1, 3), tone)
		"stucco":
			for i in 17:
				_rect(image, random.randi_range(0, 127), random.randi_range(0, 116), 1, random.randi_range(2, 11),
					Color(0.318, 0.325, 0.282, 0.09))
		"concrete":
			# Poured slabs: a saw-cut joint at the tile edge and a few faint stains.
			for i in 26:
				_rect(image, random.randi_range(0, 120), random.randi_range(0, 120), random.randi_range(3, 9),
					random.randi_range(2, 6), Color(0.38, 0.39, 0.36, 0.07))
			_rect(image, 0, 0, 128, 1, Color("85867e"))
			_rect(image, 0, 0, 1, 128, Color("85867e"))
		"slate":
			# Grey stone tiles in staggered courses, as on the gym's lower walls.
			var tones: Array[Color] = [Color("5d5b5a"), Color("676462"), Color("545250"), Color("6f6b67")]
			for y in range(0, 128, 16):
				var x := -random.randi_range(0, 30)
				while x < 128:
					var w := random.randi_range(22, 40)
					_rect(image, x, y, w, 16, tones[random.randi_range(0, 3)])
					_rect(image, x, y, w, 1, Color("434140"))
					_rect(image, x, y, 1, 16, Color("434140"))
					x += w
		"solar":
			# Cells in a fine grid with a faint sheen down every other row.
			for y in 128:
				for x in 128:
					if x % 16 == 0 or y % 16 == 0:
						image.set_pixel(x, y, Color("3d4e69"))
					elif (y / 16) % 2 == 0 and (x + y) % 16 < 3:
						image.set_pixel(x, y, Color("2f4060"))
		"ribbed":
			# Roof sheeting: a raised rib every 8 px, lit on one side.
			for y in range(0, 128, 8):
				_rect(image, 0, y, 128, 1, Color("c9cdcc"))
				_rect(image, 0, y + 1, 128, 1, Color("8a8f90"))
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

## Shade-tree greens (the default), bamboo's yellow-greens and the red-tipped shrubs.
const LEAF_COLORS: Array[Color] = [Color("3a5650"), Color("48664f"), Color("61815a"), Color("89965b"), Color("a8ab70")]
const BAMBOO_COLORS: Array[Color] = [Color("5d7a35"), Color("6f8f3a"), Color("8fae45"), Color("b2c95a"), Color("d0dc78")]
const SHRUB_COLORS: Array[Color] = [Color("3f5f35"), Color("5a7a3c"), Color("7f8f45"), Color("b0573a"), Color("c9743f")]

## One plant's leaves. The light comes from the round volume around `center` (the
## crown), so the tones here only add a little top-lit variation per cluster.
## Bamboo (`narrow`) gets thin drooping blades instead of round leaves.
func _leaf_material(seed_value: int, center: Vector3, colors: Array[Color] = LEAF_COLORS, narrow := false) -> ShaderMaterial:
	var image := Image.create(128, 128, false, Image.FORMAT_RGBA8)
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	if narrow:
		for i in 900:
			var x := random.randi_range(6, 121)
			var y := random.randi_range(6, 121)
			if Vector2((x - 64.0) / 58.0, (y - 60.0) / 54.0).length() > 0.92 + random.randf() * 0.1:
				continue
			var tone := colors[clampi(int(floor((1.0 - y / 128.0) * 1.6 + random.randf() * 3.2)), 0, 4)]
			var slope := random.randf_range(-0.7, 0.7)
			for step in random.randi_range(5, 9):
				_rect(image, x + step, y + roundi(step * slope + step * step * 0.04), 1, 1, tone)
		image.generate_mipmaps()
		return _foliage(image, seed_value, center)
	for i in 2100:
		var x := 3 + random.randi_range(0, 121)
		var y := 4 + random.randi_range(0, 115)
		var nx := (x - 64.0) / 60.0
		var ny := (y - 59.0) / 52.0
		if nx * nx + ny * ny > 0.84 + sin(x * 0.22) * 0.1 + random.randf() * 0.16:
			continue
		var tone := colors[clampi(int(floor((1.0 - y / 128.0) * 1.6 + random.randf() * 3.2)), 0, 4)]
		_rect(image, x - 2, y, 5, 1, tone)
		_rect(image, x - 1, y - 1, 3, 3, tone)
	image.generate_mipmaps()
	return _foliage(image, seed_value, center)

func _foliage(image: Image, seed_value: int, center: Vector3) -> ShaderMaterial:
	var made := ShaderMaterial.new()
	made.shader = LEAVES_SHADER
	made.set_shader_parameter("leaves", ImageTexture.create_from_image(image))
	made.set_shader_parameter("phase", float(seed_value % 17))
	made.set_shader_parameter("center", center)
	# Fully round: the normal depends only on position, so crossed cards meet without
	# a seam and the outline shader does not trace a grid through the crown.
	made.set_shader_parameter("roundness", 1.0)
	return made

## Grass blades for every tuft on campus: one shared material, lit like the lawn.
func _grass_material() -> ShaderMaterial:
	if _grass != null:
		return _grass
	var image := Image.create(48, 32, false, Image.FORMAT_RGBA8)
	var random := RandomNumberGenerator.new()
	random.seed = 4412
	var colors: Array[Color] = [Color("4f6a3f"), Color("647f48"), Color("7f9a58"), Color("9cae66")]
	for i in 34:
		var x := random.randi_range(3, 44)
		var tall := random.randi_range(10, 30)
		var lean := random.randf_range(-0.35, 0.35)
		for step in tall:
			var tone := colors[clampi(int(float(step) / tall * 3.0 + random.randf()), 0, 3)]
			_rect(image, x + roundi(lean * step), 31 - step, 1, 1, tone)
	image.generate_mipmaps()
	_grass = ShaderMaterial.new()
	_grass.shader = LEAVES_SHADER
	_grass.set_shader_parameter("leaves", ImageTexture.create_from_image(image))
	_grass.set_shader_parameter("sway", 0.03)
	_grass.set_shader_parameter("roundness", 0.9)
	return _grass

# --- Geometry helpers -------------------------------------------------------

## Boxes that share a size and material become one MultiMesh, like the browser's instancing.
## turn rotates about Y; tilt then leans the box about its own X (roof slopes, open panes).
func box(size: Vector3, at: Vector3, made: Material, turn := 0.0, tilt := 0.0) -> void:
	var key := str(size) + "#" + str(made.get_instance_id())
	if not _batches.has(key):
		_batches[key] = {"size": size, "material": made, "at": []}
	(_batches[key]["at"] as Array).append(Transform3D(Basis(Vector3.UP, turn) * Basis(Vector3.RIGHT, tilt), at))
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

## Crossed cards sharing one texture: `cross` vertical quads turned evenly about
## the vertical, plus an optional level one. A leaf cluster or a grass tuft built
## this way keeps its volume from every camera angle (the camera turns 90° at the
## canteen). `lift` is the bottom edge's height.
func _cards(width: float, height: float, lift: float, cross: int, cap := false) -> ArrayMesh:
	var key := "%s:%s:%s:%s:%s" % [width, height, lift, cross, cap]
	if _card_meshes.has(key):
		return _card_meshes[key]
	var tool := SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	var uvs := [Vector2(0, 1), Vector2(1, 1), Vector2(1, 0), Vector2(0, 0)]
	var quads := []
	for i in cross:
		var a := PI * i / cross
		var side := Vector3(cos(a), 0, sin(a)) * width / 2.0
		quads.append([Vector3(-sin(a), 0, cos(a)), [-side + Vector3.UP * lift, side + Vector3.UP * lift,
			side + Vector3.UP * (lift + height), -side + Vector3.UP * (lift + height)]])
	if cap:
		var y := lift + height * 0.55
		var h := width / 2.0
		quads.append([Vector3.UP, [Vector3(-h, y, h), Vector3(h, y, h), Vector3(h, y, -h), Vector3(-h, y, -h)]])
	for quad in quads:
		for k in [0, 2, 1, 0, 3, 2]:
			tool.set_normal(quad[0])
			tool.set_uv(uvs[k])
			tool.add_vertex(quad[1][k])
	var mesh := tool.commit()
	_card_meshes[key] = mesh
	return mesh

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

## Window glass; lit glass is the one shared warm glass that glows at night.
func room_glass(lit: bool) -> StandardMaterial3D:
	if _room_glass == null:
		_room_glass = material("glass").duplicate() as StandardMaterial3D
		_room_glass.emission_enabled = true
		_room_glass.emission = Color("ffc281")
		glows.append([_room_glass, 0.0, 1.35])
	return _room_glass if lit else material("glass")

func window(x: float, y: float, z: float, w := 2.05, h := 1.05) -> void:
	box(Vector3(w + 0.15, h + 0.15, 0.07), Vector3(x, y, z), material("plain", Color("333e49")))
	var occupied := posmod(roundi(x * 7.0 + y * 11.0), 4) == 0
	box(Vector3(w, h, 0.035), Vector3(x, y, z + 0.05), room_glass(occupied))
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
	# The classroom wing runs from WING_WEST (beside PGN) to the tall block, in 3 m bays.
	var length := 18.0 - WING_WEST
	var middle := (18.0 + WING_WEST) / 2.0
	var west := int(WING_WEST)
	box(Vector3(length, 13.4, 0.36), Vector3(middle, 6.7, -3.15), wall)
	for x in [WING_WEST, 18.0]:
		box(Vector3(0.35, 13.4, 3), Vector3(x, 6.7, -1.8), wall)
	for level in 4:
		var y := 3.35 + level * 3.05
		box(Vector3(length + 0.6, 0.26, 3.4), Vector3(middle, y, -1.7), slab)
		if level < 3:
			box(Vector3(length + 0.25, 0.85, 0.19), Vector3(middle, y + 0.55, -0.12), wall)
			box(Vector3(length + 0.4, 0.07, 0.28), Vector3(middle, y + 1.0, -0.12), slab)
			box(Vector3(length + 0.1, 0.025, 0.035), Vector3(middle, y + 1.35, -0.12), metal)
			for x in range(west, 19, 3):
				box(Vector3(0.025, 0.35, 0.035), Vector3(x, y + 1.18, -0.12), metal)
	for x in range(west, 19, 3):
		box(Vector3(0.23, 12.8, 0.38), Vector3(x, 6.4, -0.2), slab)
		for level in 4:
			if x < 18 and level > 0: # the ground floor is the hallway (areas/hallway.gd)
				window(x + 1.4, 1.9 + level * 3.05, -2.94)
		if x % 9 == 0:
			box(Vector3(0.065, 12.7, 0.09), Vector3(x + 0.21, 6.35, -0.02), material("metal"))
	box(Vector3(length + 0.8, 0.7, 0.25), Vector3(middle, 13.0, -0.05), material("metal", Color("e6e9e3")))
	for x in range(west, 19):
		box(Vector3(0.018, 0.66, 0.025), Vector3(x, 13.0, 0.09), metal)
	box(Vector3(length + 0.6, 0.3, 3.5), Vector3(middle, 13.45, -1.65), material("stucco", Color("c9c7bc")))

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
	# Lawn everywhere underneath; roads, paving and buildings sit on top of it.
	# It reaches every plot in the plan, from the Red Building to the gym annex.
	box(Vector3(460, 0.2, 340), Vector3(-90, -0.3, 0), material("grass"))
	var kerb := material("stucco", Color("bfc4bc"))
	var walk := material("stucco", Color("cfcdc1"))
	_road_strip(-Roads.HALF, Roads.HALF, -0.19, material("road"))
	_road_strip(Roads.HALF, Roads.HALF + 1.6, -0.045, walk, true)
	_along_road(Roads.HALF, 0.27, 0.21, -0.105, kerb)
	_along_road(-Roads.HALF, 0.27, 0.21, -0.105, kerb)
	# The APS frontage keeps its wide sidewalk, from the garden corner to the patio.
	box(Vector3(62.5, 0.18, 5), Vector3(-13.25, -0.13, 1.35), walk)
	for x in range(-44, 18, 2):
		box(Vector3(0.014, 0.008, 4.9), Vector3(x, -0.034, 1.35), material("plain", Color("999f99")))
	for x in [-12.8, -10.3]: # east of the canopy: the bust and the campus map
		pot(x, 2.65)
	_tree(Vector3(-13.5, 0, 2), 7.1, 610)
	_tree(Vector3(12.7, 0, 3), 6.5, 611)
	_tree(Vector3(-8.8, -0.2, 12.5), 8.6, 612)
	_tree(Vector3(-4.0, -0.2, 18.0), 8.1, 613)
	_tree(Vector3(14.5, -0.2, 34.0), 7.4, 614)
	_tree(Vector3(7.0, -0.2, 31.0), 8.4, 615)
	for x in [-11.5, 11.4]:
		_lantern(x)
	for x in [-10.2]:
		for dx in [-1.0, 1.0]:
			box(Vector3(0.09, 0.45, 0.45), Vector3(x + dx, 0.225, 1), material("plain", Color("3d4c4c")))
		for dz in [-0.17, 0.0, 0.17]:
			box(Vector3(2.4, 0.07, 0.145), Vector3(x, 0.47, 1 + dz), material("wood"))
		for y in [0.75, 0.93]:
			box(Vector3(2.4, 0.14, 0.08), Vector3(x, y, 0.76), material("wood"))

## A band of ground along the road between two offsets from its centre line
## (positive = left, the building side). `walk_only` keeps to the stretches
## that have a sidewalk.
func _road_strip(near: float, far: float, y: float, made: Material, walk_only := false) -> void:
	var road := Roads.points()
	var lefts := Roads.lefts()
	var walks := Roads.walks()
	var triangles := PackedVector2Array()
	for i in road.size() - 1:
		if walk_only and walks[i] == 0:
			continue
		var a0 := road[i] + lefts[i] * near
		var a1 := road[i] + lefts[i] * far
		var b0 := road[i + 1] + lefts[i + 1] * near
		var b1 := road[i + 1] + lefts[i + 1] * far
		triangles.append_array([a0, a1, b1, a0, b1, b0])
	_ground(triangles, y, made)

## Boxes laid along the road at an offset from its centre line (kerbs, paint),
## each turned to the road and as long as its stretch, so the joints close.
func _along_road(offset: float, width: float, height: float, y: float, made: Material, dash := 0.0, period := 5.0) -> void:
	var road := Roads.points()
	var lefts := Roads.lefts()
	var travelled := 0.0
	for i in road.size() - 1:
		var a := road[i] + lefts[i] * offset
		var b := road[i + 1] + lefts[i + 1] * offset
		var step := road[i].distance_to(road[i + 1])
		var middle := (a + b) / 2.0
		var turn := atan2(-(b - a).y, (b - a).x)
		if dash > 0.0:
			if fmod(travelled, period) < step:
				box(Vector3(dash, height, width), Vector3(middle.x, y, middle.y), made, turn)
		else:
			box(Vector3(snappedf(a.distance_to(b) + 0.04, 0.05), height, width), Vector3(middle.x, y, middle.y), made, turn)
		travelled += step

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

## A 2.5D tree: a trunk that forks into limbs, and a round crown of crossed leaf
## clusters spread through an ellipsoid. The crown is lit as one volume (see
## leaves.gdshader), so it reads as a full canopy from the APS front and from the
## canteen alike, and it casts a dappled shadow of its real leaves.
func _tree(at: Vector3, height: float, seed_value: int) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var bark := Color("645e50")
	var fork := at + Vector3(0.05, height * 0.42, 0)
	var middle := at + Vector3(0.1, height * 0.68, 0)
	rod(at, fork, 0.11 + height * 0.006, bark)
	var reach := Vector3(height * 0.26, height * 0.2, height * 0.26)
	var size := height * 0.3
	var leaves := _leaf_material(seed_value, middle)
	var cluster := _cards(size, size, -size / 2.0, 3, true)
	for i in 15:
		var spot := Vector3.ZERO
		while true:
			spot = Vector3(random.randf_range(-1, 1), random.randf_range(-1, 1), random.randf_range(-1, 1))
			if spot.length() <= 1.0 and spot.length() > 0.45:
				break
		var at_cluster := middle + spot * reach
		var leaf := _mesh(cluster, at_cluster, leaves, random.randf() * PI)
		leaf.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
		if i < 5:
			rod(fork, at_cluster.lerp(middle, 0.35), 0.065, bark)

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
	box(Vector3(6.7, 0.1, 6.6), Vector3(29.95, -0.1, 23.8), brick)
	for i in PATIO_TABLES.size():
		var table := PATIO_TABLES[i]
		_umbrella(table.x, table.y, Color("b96058") if i % 2 == 0 else Color("9c6250"))
	_tree(Vector3(25.5, -0.05, 6.5), 8.8, 616)
	_tree(Vector3(27.4, -0.05, 18.2), 7.6, 617)
	_lantern(31.0, 2.4)
	for at in [Vector2(19.5, 1.0), Vector2(27.6, 25.6)]:
		pot(at.x, at.y)
	for at in STREET_LIGHTS:
		_street_light(at.x, at.y)

## The tall grey LED street light at the patio's kerb ("APS RIGHT 3"): a tapered
## pole, an arm over the road with a flat lamp head, and a floodlight halfway up.
func _street_light(x: float, z: float) -> void:
	var grey := Color("8a9093")
	box(Vector3(0.34, 0.5, 0.34), Vector3(x, 0.2, z), material("stucco", Color("d6d4cb")))
	rod(Vector3(x, 0.45, z), Vector3(x, 7.4, z), 0.085, grey)
	rod(Vector3(x, 7.3, z), Vector3(x - 0.75, 7.55, z), 0.04, grey)
	box(Vector3(0.72, 0.11, 0.3), Vector3(x - 1.05, 7.58, z), material("plain", Color("4c5254")))
	box(Vector3(0.6, 0.02, 0.22), Vector3(x - 1.05, 7.52, z), glow(Color("fff3dc"), 0.2, 3.5))
	box(Vector3(0.26, 0.2, 0.12), Vector3(x - 0.12, 3.9, z), material("plain", Color("3d4245")))
	var light := SpotLight3D.new()
	light.light_color = Color("fff0d9")
	light.light_energy = 5.0
	light.spot_range = 12.0
	light.spot_angle = 68.0
	light.spot_angle_attenuation = 0.8
	light.shadow_enabled = true
	light.shadow_normal_bias = 1.0
	light.rotation_degrees.x = -90.0
	_lamp(light, Vector3(x - 1.05, 7.45, z))

# --- Past the canteen's end ------------------------------------------------------

## Between the canteen wing's east wall and the Covered Court (the "FAREST RIGHT
## SIDE" photos): a dirt strip with green steel picnic sheds and a timber pergola
## grown over with vines, running to the road past the canteen's tip.
func _yard() -> void:
	box(Vector3(STRIP.size.x, 0.1, STRIP.size.y), Vector3(STRIP.get_center().x, -0.1, STRIP.get_center().y), material("dirt"))
	var timber := material("wood", Color("c9b39a"))
	for post in PERGOLA_POSTS:
		box(Vector3(0.34, 3.0, 0.34), Vector3(post.x, 1.5, post.y), timber)
		box(Vector3(0.46, 0.7, 0.46), Vector3(post.x, 0.35, post.y), material("stone"))
	for x in [43.8, 47.2]:
		box(Vector3(0.22, 0.28, 18.4), Vector3(x, 3.1, 21.0), timber)
	var rafter := 12.0
	while rafter <= 30.0:
		box(Vector3(3.8, 0.16, 0.12), Vector3(45.5, 3.3, rafter), timber)
		rafter += 0.9
	# The vine roof: level leaf cards over the rafters and a fringe hanging off its road side.
	var vines := _leaf_material(631, Vector3(45.5, -6.0, 21.0))
	var roof := _cards(2.6, 0.9, 3.0, 2, true)
	var fringe := _cards(2.2, 1.1, 2.3, 1)
	var z := 12.6
	while z < 30.0:
		for x in [44.6, 46.4]:
			_mesh(roof, Vector3(x, 0, z), vines, 0.3 if x > 45.0 else 0.0).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
		_mesh(fringe, Vector3(47.5, 0, z), vines, PI / 2.0).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
		z += 2.1
	for shed in SHEDS:
		_shed(shed.x, shed.y)
	for shed in LAWN_SHEDS:
		box(Vector3(4.2, 0.1, 3.5), Vector3(shed.x, -0.14, shed.y), material("dirt"))
		_shed(shed.x, shed.y)

## A green steel picnic shed: four posts, a corrugated roof, a table and two benches.
func _shed(x: float, z: float) -> void:
	var green := material("plain", Color("2f7a55"))
	var dark := material("plain", Color("245f43"))
	for dx in [-1.45, 1.45]:
		for dz in [-1.1, 1.1]:
			box(Vector3(0.08, 2.45, 0.08), Vector3(x + dx, 1.22, z + dz), green)
	box(Vector3(3.5, 0.06, 2.8), Vector3(x, 2.5, z), green)
	var rib := -1.7
	while rib <= 1.7:
		box(Vector3(0.04, 0.035, 2.8), Vector3(x + rib, 2.545, z), dark)
		rib += 0.17
	box(Vector3(3.5, 0.12, 0.05), Vector3(x, 2.44, z + 1.4), dark)
	box(Vector3(2.4, 0.05, 0.8), Vector3(x, 0.76, z), green)
	for dz in [-0.62, 0.62]:
		box(Vector3(2.4, 0.045, 0.3), Vector3(x, 0.45, z + dz), green)
	for dx in [-1.0, 1.0]:
		box(Vector3(0.06, 0.74, 0.06), Vector3(x + dx, 0.37, z), dark)
		box(Vector3(0.06, 0.06, 1.55), Vector3(x + dx, 0.4, z), dark)
		for dz in [-0.62, 0.62]:
			box(Vector3(0.05, 0.43, 0.05), Vector3(x + dx, 0.22, z + dz), dark)

# --- Left of the wing ------------------------------------------------------------

## The garden outside the road's turn at the wing's west end, from the "APS LEFT
## SIDE" photo: dirt to the kerb, a big bamboo clump and a smaller one, two shade
## trees, red-tipped shrubs, and a green-netted enclosure behind a yellow mesh fence.
func _left_garden() -> void:
	# Dirt from the APS front and the wing's end out to the road's kerb round the turn.
	var corner := Vector2(-62.0, 0.3)
	var fan := PackedVector2Array([corner, Vector2(GARDEN_TURN.x, corner.y), GARDEN_TURN + Vector2(0, -GARDEN_EDGE)])
	var steps := 24
	for i in steps:
		var a := -PI / 2.0 - PI / 2.0 * i / steps
		var b := -PI / 2.0 - PI / 2.0 * (i + 1) / steps
		fan.append_array([corner, GARDEN_TURN + Vector2(cos(a), sin(a)) * GARDEN_EDGE, GARDEN_TURN + Vector2(cos(b), sin(b)) * GARDEN_EDGE])
	fan.append_array([corner, GARDEN_TURN + Vector2(-GARDEN_EDGE, 0), Vector2(corner.x, GARDEN_TURN.y)])
	_ground(fan, -0.05, material("dirt"))
	var netting := material("plain", Color("2d8a5c"))
	box(Vector3(6.0, 3.4, 3.2), Vector3(-58.6, 1.7, 2.3), netting)
	box(Vector3(6.1, 0.12, 3.3), Vector3(-58.6, 3.42, 2.3), material("plain", Color("3c9a69")))
	var seam := -61.4
	while seam < -55.8:
		box(Vector3(0.05, 3.3, 0.02), Vector3(seam, 1.7, 3.91), material("plain", Color("257a4f")))
		seam += 0.9
	var yellow := material("plain", Color("d8b23c"))
	var wire := material("plain", Color("a88a2e"))
	var post := -61.8
	while post <= -54.6:
		box(Vector3(0.07, 2.0, 0.07), Vector3(post, 1.0, 4.5), yellow)
		post += 1.6
	for y in [0.12, 1.0, 1.95]:
		box(Vector3(7.3, 0.06, 0.06), Vector3(-58.2, y, 4.5), yellow)
	var strand := -61.7
	while strand < -54.6:
		box(Vector3(0.012, 1.85, 0.012), Vector3(strand, 1.03, 4.5), wire)
		strand += 0.22
	_bamboo(Vector3(-58.6, -0.05, 7.6), 1.5, 30, 640)
	_bamboo(Vector3(-47.4, -0.05, 2.3), 0.8, 14, 641)
	_tree(Vector3(-52.4, -0.05, 3.6), 8.2, 621)
	_tree(Vector3(-60.4, -0.05, 11.6), 7.4, 622)
	for shrub in [Vector3(-50.0, 1.6, 1.4), Vector3(-45.6, 1.4, 1.2), Vector3(-61.0, 15.0, 1.5), Vector3(-55.0, 5.6, 1.3)]:
		_shrub(Vector3(shrub.x, -0.05, shrub.y), shrub.z, 650 + roundi(shrub.x))

## A bamboo clump: culms leaning out from a tight base, feathery blade clusters
## along their upper halves (one MultiMesh, lit as one round volume).
func _bamboo(at: Vector3, radius: float, culms: int, seed_value: int) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var leaves := _leaf_material(seed_value, at + Vector3(0, 5.5, 0), BAMBOO_COLORS, true)
	var spots: Array[Transform3D] = []
	for i in culms:
		var a := random.randf() * TAU
		var r := sqrt(random.randf()) * radius
		var base := at + Vector3(cos(a) * r, 0, sin(a) * r)
		var out := Vector3(cos(a), 0, sin(a))
		var lean := out * (0.4 + r / radius * 1.4) + Vector3(random.randf_range(-0.3, 0.3), 0, random.randf_range(-0.3, 0.3))
		var top := base + Vector3(0, random.randf_range(6.5, 9.5), 0) + lean
		rod(base, top, 0.045, Color("b8a95f") if i % 3 else Color("8f9a4d"))
		# Feathery all the way up the upper two thirds, arching out and drooping a little,
		# so the clump reads as one soft mass rather than balls on sticks.
		for k in 6:
			var t := 0.34 + k * 0.12 + random.randf() * 0.05
			var spot := base.lerp(top, t) + out * random.randf_range(0.15, 0.75) + Vector3(0, -0.25 * k / 5.0, 0)
			spots.append(Transform3D(Basis(Vector3.UP, random.randf() * PI).scaled(Vector3.ONE * random.randf_range(0.55, 0.95)), spot))
	var multi := MultiMesh.new()
	multi.transform_format = MultiMesh.TRANSFORM_3D
	multi.mesh = _cards(1.8, 1.8, -0.9, 3)
	multi.instance_count = spots.size()
	for i in spots.size():
		multi.set_instance_transform(i, spots[i])
	var clump := MultiMeshInstance3D.new()
	clump.multimesh = multi
	clump.material_override = leaves
	clump.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	root.add_child(clump)

## A rounded red-tipped shrub ("Philippine red tip"): six leaf clusters in a low dome.
func _shrub(at: Vector3, size: float, seed_value: int) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var middle := at + Vector3(0, size * 0.5, 0)
	var leaves := _leaf_material(seed_value, middle, SHRUB_COLORS)
	var cluster := _cards(size, size, -size / 2.0, 3, true)
	for i in 6:
		var spot := Vector3(random.randf_range(-1, 1), random.randf_range(-0.6, 0.8), random.randf_range(-1, 1)).limit_length(1.0)
		var leaf := _mesh(cluster, middle + spot * Vector3(size * 0.45, size * 0.3, size * 0.45), leaves, random.randf() * PI)
		leaf.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED

# --- Grass -------------------------------------------------------------------------

## Grass tufts as one MultiMesh of crossed blade cards: a thick band along the
## lawn's kerbs all round the loop, tufts scattered over the chapel lawn and round
## the tree roots, moss where the patio meets the walls and the rail, and patchy
## grass in the corner garden and the strip by the Covered Court.
func _grasses() -> void:
	var random := RandomNumberGenerator.new()
	random.seed = 7151
	var spots: Array[Vector4] = [] # x, y, z, scale
	# The lawn inside the loop: the road's outline pulled in past the far kerb.
	var inner := PackedVector2Array()
	var shrunk := Geometry2D.offset_polygon(Roads.points().slice(0, -1), -3.8)
	for shape in shrunk:
		if shape.size() > inner.size():
			inner = shape
	var lawn := func(x: float, z: float) -> bool:
		for shed in LAWN_SHEDS:
			if absf(x - shed.x) < 2.0 and absf(z - shed.y) < 1.65:
				return false # worn dirt under the picnic sheds
		if absf(z - 33.6) < 1.3 and x > -34.8 and x < 13.8:
			return false # the jogging path
		var at := Vector2(x, z)
		if not Geometry2D.is_point_in_polygon(at, inner) or Chapel.walkable(x, z):
			return false
		return not Geometry2D.is_point_in_polygon(at, Chapel.outline()) and not Plots.occupied(x, z)
	var scatter := func(from: Vector2, to: Vector2, count: int, y: float, scale: float, test: Callable) -> void:
		for i in count:
			var x := random.randf_range(from.x, to.x)
			var z := random.randf_range(from.y, to.y)
			if test.call(x, z):
				spots.append(Vector4(x, y, z, scale * random.randf_range(0.7, 1.25)))
	var anywhere := func(_x: float, _z: float) -> bool: return true
	# A thick band just past the lawn-side kerb, all round the loop.
	var road := Roads.points()
	var lefts := Roads.lefts()
	for i in road.size() - 1:
		for k in 2:
			var at := road[i] + (road[i + 1] - road[i]) * random.randf() - lefts[i] * random.randf_range(3.8, 5.8)
			if lawn.call(at.x, at.y):
				spots.append(Vector4(at.x, -0.2, at.y, random.randf_range(0.7, 1.25)))
	# Across the chapel lawn, thinner further out.
	scatter.call(Vector2(-55, 11), Vector2(37, 107), 1400, -0.2, 1.15, lawn)
	for tree in [Vector2(-8.8, 12.5), Vector2(-4.0, 18.0), Vector2(14.5, 34.0), Vector2(7.0, 31.0),
			Vector2(25.5, 6.5), Vector2(27.4, 18.2)]:
		scatter.call(tree - Vector2(0.7, 0.7), tree + Vector2(0.7, 0.7), 9, -0.05 if tree.x > 20.0 else -0.2, 0.75, anywhere)
	# The corner garden's patchy grass, none under the enclosure.
	scatter.call(Vector2(-62, 0.3), Vector2(-44.5, 21.5), 260, -0.05, 0.9,
		func(x: float, z: float) -> bool: return in_garden(x, z) and not (x > -61.8 and x < -55.4 and z < 4.2) and random.randf() < 0.7)
	# The strip by the Covered Court: grass along its edges and round the posts.
	scatter.call(STRIP.position, STRIP.end, 70, -0.05, 0.8,
		func(x: float, _z: float) -> bool: return x < 43.8 or x > 47.1 or random.randf() < 0.2)
	# Moss and short grass where the patio meets the walls, the rail and the sidewalk.
	scatter.call(Vector2(18.3, 0.35), Vector2(30.9, 0.75), 40, -0.05, 0.5, anywhere)
	scatter.call(Vector2(32.45, 0.8), Vector2(32.7, 24.5), 50, -0.05, 0.5,
		func(_x: float, z: float) -> bool: return z < 7.8 or z > 12.8)
	scatter.call(Vector2(26.7, 18.0), Vector2(26.95, 24.0), 16, -0.05, 0.5, anywhere)
	var multi := MultiMesh.new()
	multi.transform_format = MultiMesh.TRANSFORM_3D
	multi.mesh = _cards(0.62, 0.42, 0.0, 2)
	multi.instance_count = spots.size()
	for i in spots.size():
		var spot := spots[i]
		var turn := Basis(Vector3.UP, random.randf() * PI).scaled(Vector3(spot.w, spot.w * random.randf_range(0.8, 1.2), spot.w))
		multi.set_instance_transform(i, Transform3D(turn, Vector3(spot.x, spot.y, spot.z)))
	var tufts := MultiMeshInstance3D.new()
	tufts.name = "Grass"
	tufts.multimesh = multi
	tufts.material_override = _grass_material()
	tufts.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	root.add_child(tufts)

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

## A patio set as in the photos: a maroon octagonal umbrella with a top vent, a round
## wooden table on a steel pedestal, and four armchairs around it.
func _umbrella(x: float, z: float, color: Color) -> void:
	var steel := Color("2f3133")
	var canvas := material("plain", color).duplicate() as StandardMaterial3D
	canvas.cull_mode = BaseMaterial3D.CULL_DISABLED
	for part in [[1.6, 0.0, 0.5, 2.62], [0.32, 0.0, 0.16, 3.0]]:
		var cone := CylinderMesh.new()
		cone.bottom_radius = part[0]
		cone.top_radius = part[1]
		cone.height = part[2]
		cone.radial_segments = 8
		cone.rings = 1
		cone.cap_bottom = false
		_mesh(cone, Vector3(x, part[3], z), canvas, PI / 8.0).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	rod(Vector3(x, 0.05, z), Vector3(x, 3.0, z), 0.03, Color("4d4740"))
	var top := CylinderMesh.new()
	top.top_radius = 0.56
	top.bottom_radius = 0.56
	top.height = 0.05
	top.radial_segments = 16
	_mesh(top, Vector3(x, 0.74, z), material("wood", Color("c98a5c")))
	box(Vector3(0.07, 0.7, 0.07), Vector3(x, 0.36, z), material("plain", steel))
	for i in 4:
		var a := TAU * i / 4.0 + PI / 4.0
		rod(Vector3(x, 0.05, z), Vector3(x + cos(a) * 0.36, 0.01, z + sin(a) * 0.36), 0.02, steel)
	var turn := posmod(roundi(x * 3.0 + z * 5.0), 7) * 0.12
	for i in 4:
		var a := TAU * i / 4.0 + turn
		_chair(Vector3(x + cos(a) * 0.86, 0, z + sin(a) * 0.86), a + PI)

## A patio armchair: black steel frame, orange wooden slat seat and back. It faces
## `facing` (radians in the ground plane; the back is on the opposite side).
func _chair(at: Vector3, facing: float) -> void:
	var steel := material("plain", Color("2f3133"))
	var wood := material("wood", Color("e39a5a"))
	var forward := Vector3(cos(facing), 0, sin(facing))
	var side := Vector3(-forward.z, 0, forward.x)
	var turn := -facing
	for f in [-0.19, 0.19]:
		for s in [-0.21, 0.21]:
			box(Vector3(0.035, 0.45, 0.035), at + forward * f + side * s + Vector3(0, 0.225, 0), steel, turn)
	for slat in 3:
		box(Vector3(0.12, 0.035, 0.44), at + forward * (-0.14 + slat * 0.14) + Vector3(0, 0.46, 0), wood, turn)
	for row in 2:
		box(Vector3(0.035, 0.12, 0.44), at - forward * 0.22 + Vector3(0, 0.66 + row * 0.16, 0), wood, turn)
	for s in [-0.24, 0.24]:
		box(Vector3(0.42, 0.03, 0.04), at + side * s + Vector3(0, 0.66, 0), steel, turn)
		box(Vector3(0.035, 0.48, 0.035), at - forward * 0.22 + side * s + Vector3(0, 0.69, 0), steel, turn)

# --- Small street and roof details (new in the Godot port) -------------------

func _details() -> void:
	# Centre dashes and edge lines follow the road all round the loop.
	var paint := material("plain", Color("d9d4c2"))
	_along_road(0.0, 0.14, 0.012, -0.182, paint, 2.2)
	_along_road(2.95, 0.1, 0.012, -0.182, paint)
	_along_road(-3.1, 0.1, 0.012, -0.182, paint)
	var grate := material("plain", Color("3f4446"))
	for x in [-26.0, -14.0, 2.0]:
		box(Vector3(0.9, 0.014, 0.32), Vector3(x, -0.183, 4.4), grate)
		for bar in 5:
			box(Vector3(0.03, 0.016, 0.3), Vector3(x - 0.36 + bar * 0.18, -0.18, 4.4), material("plain", Color("6b7174")))
	# Rooftop equipment so the skyline reads at the wide framings.
	for x in [-54.0, -41.0, -30.0, -21.0, -12.0, -4.0, 6.0]:
		box(Vector3(1.1, 0.6, 0.8), Vector3(x, 13.9, -2.4), material("plain", Color("c5c8c2")))
		box(Vector3(0.9, 0.04, 0.6), Vector3(x, 14.21, -2.4), material("plain", Color("5f6466")))
	box(Vector3(1.6, 1.1, 1.6), Vector3(27.5, 22.05, -2.6), material("stucco", Color("e4e2d8")))

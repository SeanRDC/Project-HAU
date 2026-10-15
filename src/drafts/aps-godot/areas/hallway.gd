extends RefCounted
## The APS ground-floor hallway, from the APS HALLWAY photos: an open corridor
## behind ledgestone-clad piers along the whole classroom wing. Along its inner
## wall, from west to east: the left stairs behind a steel gate and the electrical
## room, classroom doors (brown frames, amber glass) with white geometric grilles,
## the high dark-wood strip windows with the mission/vision and quality-policy
## boards and the bell by the lobby doors, then Comlab 1 and Comlab 2, the printing
## shop, and the right stairs. Fluorescent tubes hang from the ceiling and a conduit
## runs along the wall. Outside, on a herringbone-brick patch east of the canopy:
## the bronze bust on its dark marble pedestal and the campus map board.
##
## Walking under the slab makes the camera cut away everything in front of the
## corridor and glide in close (see aps.gd, `hall`). World coordinates.

## The corridor: the wing's ground floor between its end walls, from the inner
## wall (z -2.97) out to the line of the front piers.
const WEST := -62.6
const EAST := 17.7
const BACK := -2.55
## The plane the camera cuts at when inside: just behind the front piers.
const CUT_Z := -0.95
## The ceiling (the underside of the first-floor slab).
const CEILING := 3.22
## Front piers clad in ledgestone, every other bay, clear of the lobby doors.
const PIERS: Array[float] = [-60.0, -54.0, -48.0, -42.0, -36.0, -30.0, -24.0, -18.0, -12.0, -6.0, 6.0, 12.0]
const PIER_Z := -0.2
## Outside, east of the canopy: the bust and the campus map.
const BUST := Vector2(10.0, 2.0)
const MAP := Vector2(14.6, 1.7)
## The two stair halls, against the inner wall.
const LEFT_STAIRS := Rect2(-62.2, -2.97, 3.8, 1.5)
const RIGHT_STAIRS := Rect2(14.0, -2.97, 3.6, 1.5)

static func in_hall(x: float, z: float) -> bool:
	return x > WEST and x < EAST and z >= BACK - 0.05 and z < 0.45

## 0 outside, 1 well inside the corridor: drives the camera's cutaway.
static func hall_for(x: float, z: float) -> float:
	var depth := 1.0 - smoothstep(-0.9, 0.25, z)
	return depth * smoothstep(WEST, WEST + 0.6, x) * (1.0 - smoothstep(EAST - 0.6, EAST, x))

static func blocked(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	for pier in PIERS:
		if absf(x - pier) < 0.42 and absf(z - PIER_Z) < 0.42:
			return true
	if LEFT_STAIRS.grow(0.15).has_point(at) or RIGHT_STAIRS.grow(0.15).has_point(at):
		return true
	if at.distance_to(BUST) < 0.55:
		return true
	return absf(x - MAP.x) < 1.9 and absf(z - MAP.y) < 0.4

## The corridor's tiled floor, or NAN outside it.
static func floor_height(x: float, z: float) -> float:
	return 0.03 if in_hall(x, z) else NAN

var w: RefCounted

func build(world: RefCounted) -> void:
	w = world
	_floor_and_ceiling()
	_piers()
	_inner_wall()
	_stairs(LEFT_STAIRS, -1.0)
	_stairs(RIGHT_STAIRS, 1.0)
	_outside()

# --- Floor, ceiling, piers ---------------------------------------------------------

func _floor_and_ceiling() -> void:
	var length := EAST - WEST
	var middle := (EAST + WEST) / 2.0
	# Peach floor tiles, with a dark band and the maroon-inlay entrance tiles by the lobby.
	w.box(Vector3(length, 0.09, 3.2), Vector3(middle, -0.015, -1.4), w.material("floor"))
	w.box(Vector3(17.5, 0.092, 0.45), Vector3(0, -0.012, -0.55), w.material("plain", Color("2c2a29")))
	w.box(Vector3(5.6, 0.093, 2.0), Vector3(0, -0.011, -1.75), w.material("tile"))
	# Fluorescent tubes on drop rods, every other bay, and a conduit along the wall.
	var tube: Material = w.glow(Color("f4f1e6"), 0.6, 2.2)
	var housing: Material = w.material("plain", Color("c9c6bb"))
	var x := WEST + 3.0
	while x < EAST - 1.0:
		w.box(Vector3(1.25, 0.09, 0.2), Vector3(x, CEILING - 0.36, -1.5), housing)
		w.box(Vector3(1.15, 0.04, 0.08), Vector3(x, CEILING - 0.42, -1.5), tube)
		for dx in [-0.45, 0.45]:
			w.box(Vector3(0.015, 0.3, 0.015), Vector3(x + dx, CEILING - 0.17, -1.5), housing)
		w._omni(Vector3(x, CEILING - 0.6, -1.4), Color("f3f1ea"), 1.3, 6.5)
		x += 6.0
	w.box(Vector3(length, 0.05, 0.05), Vector3(middle, 2.86, -2.9), w.material("plain", Color("b9b6ad")))
	w.box(Vector3(length, 0.035, 0.035), Vector3(middle, 2.78, -2.91), w.material("plain", Color("a9a69d")))

func _piers() -> void:
	var stone: Material = w.material("ledge")
	var cap: Material = w.material("stucco", Color("ece9df"))
	for x in PIERS:
		w.box(Vector3(0.62, 3.2, 0.62), Vector3(x, 1.6, PIER_Z), stone)
		w.box(Vector3(0.66, 0.08, 0.66), Vector3(x, 3.2, PIER_Z), cap)

# --- The inner wall ---------------------------------------------------------------

## One classroom bay: a brown door with amber glass, then a white geometric grille.
func _bay(x: float, sign_text := "") -> void:
	_door(x + 0.9)
	_grille(x + 3.3, 1.65, 2.6, 1.6)
	# A pilaster on the bay line, with a downpipe beside it.
	w.box(Vector3(0.42, 3.2, 0.18), Vector3(x, 1.6, -2.88), w.material("stucco", Color("efece3")))
	w.box(Vector3(0.07, 3.2, 0.07), Vector3(x + 0.32, 1.6, -2.88), w.material("stucco", Color("e6e3da")))
	if sign_text != "":
		w.panel(sign_text, Vector3(x + 0.9, 2.62, -2.85), 1.1, 0.22, Color("f6f1e6"), Color("4b3a2c"))

func _door(x: float) -> void:
	var frame: Material = w.material("plain", Color("3b2c22"))
	w.box(Vector3(1.0, 2.15, 0.06), Vector3(x, 1.075, -2.93), frame)
	w.box(Vector3(0.84, 0.95, 0.03), Vector3(x, 1.6, -2.9), w.material("glass", Color("b08a4c")))
	w.box(Vector3(0.84, 0.86, 0.03), Vector3(x, 0.55, -2.9), w.material("glass", Color("9a7a44")))
	w.box(Vector3(0.84, 0.05, 0.05), Vector3(x, 1.08, -2.88), frame)
	w.box(Vector3(0.05, 0.05, 0.05), Vector3(x + 0.36, 1.1, -2.85), w.material("plain", Color("c9c4b8")))

## The white lattice of squares, diagonals and rings over dark glass.
func _grille_material() -> StandardMaterial3D:
	var image := Image.create(96, 64, false, Image.FORMAT_RGBA8)
	image.fill(Color("1d2123"))
	var white := Color("efece4")
	for x in range(0, 96, 16):
		for y in 64:
			image.set_pixel(x, y, white)
	for y in range(0, 64, 16):
		for x in 96:
			image.set_pixel(x, y, white)
	for cx in range(0, 96, 32):
		for cy in range(0, 64, 32):
			for t in 32:
				for d in [Vector2i(t, t), Vector2i(t, 31 - t)]:
					var px: int = cx + d.x
					var py: int = cy + d.y
					if px < 96 and py < 64:
						image.set_pixel(px, py, white)
	for cx in range(0, 97, 16):
		for cy in range(8, 64, 16):
			for a in 24:
				var r := TAU * a / 24.0
				var px := cx + roundi(cos(r) * 3.0)
				var py := cy + roundi(sin(r) * 3.0)
				if px >= 0 and px < 96 and py >= 0 and py < 64:
					image.set_pixel(px, py, white)
	image.generate_mipmaps()
	var made := StandardMaterial3D.new()
	made.albedo_texture = ImageTexture.create_from_image(image)
	made.uv1_scale = Vector3(3, 2, 1) # one lattice per face of the box
	made.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	made.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	made.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	return made

var _grilles: StandardMaterial3D

func _grille(x: float, y: float, width: float, height: float) -> void:
	if _grilles == null:
		_grilles = _grille_material()
	w.box(Vector3(width + 0.1, height + 0.1, 0.04), Vector3(x, y, -2.95), w.material("plain", Color("4a4642")))
	w.box(Vector3(width, height, 0.03), Vector3(x, y, -2.92), _grilles)

## High strip windows in dark wood, over the boards by the lobby.
func _strip(x: float, width: float) -> void:
	var wood: Material = w.material("plain", Color("3a2a1f"))
	w.box(Vector3(width, 0.62, 0.05), Vector3(x, 2.4, -2.93), wood)
	var panes := maxi(2, roundi(width / 0.75))
	for i in panes:
		var at := x - width / 2.0 + (i + 0.5) * width / panes
		w.box(Vector3(width / panes - 0.08, 0.48, 0.03), Vector3(at, 2.4, -2.9), w.material("glass", Color("5d6668")))

func _inner_wall() -> void:
	# West of the lobby: classroom bays every 6 m, then the boards, strip windows and bell.
	var x := -57.0
	var rooms := 1
	while x < -11.0:
		_bay(x, "APS %d" % (100 + rooms))
		if rooms % 2 == 0:
			_alarm(x + 4.9)
		x += 6.0
		rooms += 1
	_strip(-5.6, 5.2)
	_board(-5.4, 1.62, 1.5, 1.05, "MISSION · VISION")
	_board(-3.1, 1.55, 1.05, 0.72, "QUALITY POLICY")
	_alarm(-7.4)
	_bell(-1.55)
	# The electrical room beside the left stairs.
	_steel_door(-57.6, "ELECTRICAL ROOM")
	# East of the lobby: Comlab 1 and 2, the printing shop.
	_bay(1.6, "COMLAB 1")
	_bay(6.6, "COMLAB 2")
	_shop(12.9)
	_hose(11.55)

func _steel_door(x: float, label: String) -> void:
	w.box(Vector3(1.0, 2.15, 0.05), Vector3(x, 1.075, -2.93), w.material("plain", Color("9a9d9a")))
	w.panel(label, Vector3(x, 1.55, -2.89), 0.36, 0.2, Color("ffffff"), Color("c4262b"))

func _board(x: float, y: float, width: float, height: float, title: String) -> void:
	w.box(Vector3(width, height, 0.03), Vector3(x, y, -2.93), w.material("plain", Color("f7f4ee")))
	w.box(Vector3(width - 0.12, 0.012, 0.01), Vector3(x, y + height / 2.0 - 0.16, -2.91), w.material("plain", Color("7a2a35")))
	for line in 5:
		w.box(Vector3(width * 0.62, 0.012, 0.01), Vector3(x, y + 0.12 - line * 0.11, -2.91), w.material("plain", Color("8d8a84")))
	w.panel(title, Vector3(x, y + height / 2.0 - 0.08, -2.905), width * 0.8, 0.09, Color("6a2430"))

func _alarm(x: float) -> void:
	var red: Material = w.material("plain", Color("c42a2b"))
	w.box(Vector3(0.16, 0.16, 0.07), Vector3(x, 2.45, -2.91), red)
	w.box(Vector3(0.12, 0.12, 0.06), Vector3(x, 1.4, -2.91), red)
	w.box(Vector3(0.02, 1.0, 0.02), Vector3(x, 1.95, -2.93), w.material("plain", Color("d4d1c8")))

func _bell(x: float) -> void:
	var iron := Color("2f2c29")
	w.box(Vector3(0.05, 0.05, 0.42), Vector3(x, 2.62, -2.73), w.material("plain", iron))
	w.rod(Vector3(x, 2.62, -2.55), Vector3(x, 2.5, -2.55), 0.012, iron)
	var bell := CylinderMesh.new()
	bell.top_radius = 0.06
	bell.bottom_radius = 0.13
	bell.height = 0.22
	bell.radial_segments = 10
	w._mesh(bell, Vector3(x, 2.38, -2.55), w.material("plain", Color("6b6455")))
	w.box(Vector3(0.012, 0.32, 0.012), Vector3(x, 2.12, -2.55), w.material("plain", Color("a4262c")))

func _hose(x: float) -> void:
	w.box(Vector3(0.62, 0.82, 0.16), Vector3(x, 1.35, -2.88), w.material("plain", Color("b8bcbc")))
	w.box(Vector3(0.52, 0.7, 0.02), Vector3(x, 1.35, -2.79), w.material("glass", Color("c9d2d2")))
	w.box(Vector3(0.36, 0.1, 0.01), Vector3(x, 1.62, -2.78), w.material("plain", Color("c42a2b")))

## The printing shop: a raised shutter, shelves of paper, and a basket of rolled art paper.
func _shop(x: float) -> void:
	w.box(Vector3(2.0, 0.24, 0.12), Vector3(x, 2.55, -2.86), w.material("metal", Color("a2a6a6")))
	w.box(Vector3(2.0, 2.4, 0.03), Vector3(x, 1.2, -2.95), w.material("plain", Color("6e5d4a")))
	for y in [0.75, 1.25, 1.75]:
		w.box(Vector3(1.8, 0.04, 0.4), Vector3(x, y, -2.75), w.material("plain", Color("efece6")))
	var colours: Array[Color] = [Color("f2f0ea"), Color("e64b8b"), Color("d8d4c8"), Color("4b74b8"), Color("f0d24a")]
	for i in 9:
		w.box(Vector3(0.18, 0.16, 0.3), Vector3(x - 0.75 + i * 0.19, 1.35 + (i % 2) * 0.5, -2.75), w.material("plain", colours[i % 5]))
	w.panel("FAST PRINTING", Vector3(x, 2.25, -2.82), 1.2, 0.16, Color("2a2a2a"), Color("f4f1e8"))
	w.box(Vector3(0.5, 0.4, 0.4), Vector3(x + 0.6, 0.2, -2.45), w.material("plain", Color("3a74c4")))
	for i in 10:
		var dx := -0.18 + (i % 5) * 0.09
		var dz := -0.08 + float(i / 5) * 0.16
		w.rod(Vector3(x + 0.6 + dx, 0.35, -2.45 + dz), Vector3(x + 0.62 + dx, 1.25 + (i % 3) * 0.12, -2.45 + dz), 0.025,
			[Color("e64b8b"), Color("f0d24a"), Color("4bb86a"), Color("4b74b8"), Color("e8873a")][i % 5])

## A stair hall: steps rising along the wall away from the lobby, a steel handrail,
## and the barred gate swung open (`toward` = -1 rises west, +1 rises east).
func _stairs(area: Rect2, toward: float) -> void:
	var tile: Material = w.material("floor", Color("eee9e2"))
	var steps := 11
	var run := area.size.x / steps
	for i in steps:
		var height := (i + 1) * 0.17
		var x := area.position.x + area.size.x - (i + 0.5) * run if toward < 0.0 else area.position.x + (i + 0.5) * run
		w.box(Vector3(run + 0.01, height, area.size.y), Vector3(x, height / 2.0, area.get_center().y), tile)
	var top := area.position.x if toward < 0.0 else area.end.x
	var foot := area.end.x if toward < 0.0 else area.position.x
	w.rod(Vector3(foot, 1.0, area.end.y - 0.05), Vector3(top, 1.0 + steps * 0.17, area.end.y - 0.05), 0.022, Color("c7cbcc"))
	# The side wall closing the stairwell on the corridor side, above the handrail.
	w.box(Vector3(area.size.x, 0.9, 0.12), Vector3(area.get_center().x, CEILING - 0.45, area.end.y), w.material("stucco", Color("ece9df")))
	# The barred gate: a frame across the top and a leaf standing open into the corridor.
	var steel: Material = w.material("plain", Color("2b2a29"))
	w.box(Vector3(area.size.x, 0.06, 0.06), Vector3(area.get_center().x, 2.25, area.end.y + 0.02), steel)
	var bar := 0.0
	while bar < area.size.x:
		w.box(Vector3(0.025, 0.5, 0.025), Vector3(area.position.x + bar, 2.52, area.end.y + 0.02), steel)
		bar += 0.16
	var hinge := Vector2(foot, area.end.y + 0.05)
	var swing := 0.9 if toward < 0.0 else PI - 0.9
	var along := Vector2(cos(swing), sin(swing))
	for k in 9:
		var at := hinge + along * (0.06 + k * 0.13)
		w.box(Vector3(0.025, 2.1, 0.025), Vector3(at.x, 1.08, at.y), steel)
	var middle := hinge + along * 0.58
	for y in [0.06, 2.1]:
		w.box(Vector3(1.16, 0.04, 0.04), Vector3(middle.x, y, middle.y), steel, -swing)

# --- Outside: the bust and the campus map ------------------------------------------

func _outside() -> void:
	var brick: Material = w.material("brick", Color("f0b49a"))
	w.box(Vector3(7.6, 0.06, 3.6), Vector3(12.3, -0.025, 2.1), brick)
	# The bust: bronze shoulders and head on a dark marble pedestal with two plaques.
	w.box(Vector3(0.74, 0.08, 0.74), Vector3(BUST.x, 0.04, BUST.y), w.material("stone", Color("9e8c7a")))
	w.box(Vector3(0.56, 1.45, 0.56), Vector3(BUST.x, 0.8, BUST.y), w.material("plain", Color("1f2b3d")))
	for side in [Vector3(0, 0, 0.285), Vector3(0.285, 0, 0)]:
		var size := Vector3(0.18, 0.42, 0.01) if side.x == 0.0 else Vector3(0.01, 0.42, 0.18)
		w.box(size, Vector3(BUST.x, 0.95, BUST.y) + side, w.material("plain", Color("c9c2b2")))
	var bronze: Material = w.material("plain", Color("9c6a3a"))
	w.box(Vector3(0.5, 0.32, 0.28), Vector3(BUST.x, 1.68, BUST.y), bronze)
	w.box(Vector3(0.12, 0.1, 0.12), Vector3(BUST.x, 1.89, BUST.y), bronze)
	var head := SphereMesh.new()
	head.radius = 0.13
	head.height = 0.3
	head.radial_segments = 10
	head.rings = 6
	w._mesh(head, Vector3(BUST.x, 2.05, BUST.y), bronze)
	# The campus map: a printed board on a concrete plinth, with two solar flood lamps.
	w.box(Vector3(3.5, 0.9, 0.42), Vector3(MAP.x, 0.45, MAP.y), w.material("stucco", Color("c8c5bb")))
	w.box(Vector3(3.4, 1.55, 0.06), Vector3(MAP.x, 1.68, MAP.y), w.material("plain", Color("f4f4f1")))
	var map := _map_material()
	var face: MeshInstance3D = w._mesh(_quad(Vector2(3.3, 1.45)), Vector3(MAP.x, 1.68, MAP.y + 0.035), map)
	face.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	for dx in [-0.9, 0.9]:
		w.box(Vector3(0.24, 0.02, 0.18), Vector3(MAP.x + dx, 2.62, MAP.y - 0.05), w.material("glass", Color("2f3c5a")))
		w.box(Vector3(0.03, 0.18, 0.03), Vector3(MAP.x + dx, 2.52, MAP.y), w.material("plain", Color("222222")))
		w.box(Vector3(0.22, 0.12, 0.12), Vector3(MAP.x + dx * 0.55, 2.38, MAP.y + 0.12), w.material("plain", Color("222222")))

func _quad(size: Vector2) -> QuadMesh:
	var quad := QuadMesh.new()
	quad.size = size
	return quad

## The campus map print: a title bar, a legend column and the buildings as blocks.
func _map_material() -> StandardMaterial3D:
	var image := Image.create(132, 58, false, Image.FORMAT_RGBA8)
	image.fill(Color("f7f7f4"))
	w._rect(image, 4, 4, 30, 3, Color("2b2b2b"))
	for row in 11:
		w._rect(image, 4, 11 + row * 4, 2, 2, Color("b3262e"))
		w._rect(image, 8, 11 + row * 4, 18 + (row * 7) % 9, 1, Color("8b8b8b"))
	w._rect(image, 40, 18, 86, 34, Color("e3e5e2"))
	var blocks := [[46, 30, 10, 12, "b85a43"], [60, 22, 14, 18, "e9e7e2"], [78, 26, 10, 10, "8fb1d4"], [92, 22, 22, 9, "d9d7d0"],
		[96, 34, 18, 12, "e0ded6"], [64, 42, 18, 7, "6aa86a"], [50, 44, 8, 6, "c8c6be"], [116, 30, 8, 14, "cfcdc5"]]
	for b in blocks:
		w._rect(image, b[0], b[1], b[2], b[3], Color(b[4]))
		w._rect(image, b[0], b[1] + b[3], b[2], 1, Color("9a9890"))
	w._rect(image, 108, 50, 18, 4, Color("7a2a35"))
	image.generate_mipmaps()
	var made := StandardMaterial3D.new()
	made.albedo_texture = ImageTexture.create_from_image(image)
	made.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	made.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	made.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	return made

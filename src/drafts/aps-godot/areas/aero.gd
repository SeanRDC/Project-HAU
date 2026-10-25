extends RefCounted
## Aero Hall (no. 21, the plan's "annex"), from Mikko's photo IMG_1519.JPG: the dark navy
## hall in front of the gym's south end, between St. Joseph Hall and the gym, just past the
## gym's HOLY ANGEL UNIVERSITY GYM doorway. One storey of corrugated navy walls on a white
## base under a dark metal gable roof; a taller gabled front block at its north end with
## the HAU seal on its side (drawn to the photo, `_seal`); windows with white aircon units, a NO PARKING sign, a white
## planter with shrubs; free-standing signs on the concrete in front. Past it, towards
## SJH, a yard behind a green-painted wall, walled off at the campus edge, with bins, a
## skip and a small steel-framed shelter.
##
## Only this front part of the plan's plot is built; the strips behind the gym are left
## bare. World coordinates (metres, Y up): the hall is square to x, like the gym.

## The hall's base (x, z), its front block at the north end (z from..to, a little wider and
## taller), the walls' and the roofs' heights.
const HALL := Rect2(45.4, 120.8, 11.6, 14.8)
const FRONT := Vector2(120.8, 125.2)
const FRONT_OUT := 0.6
const BASE_Y := 0.45
const EAVE := 3.7
const RIDGE := 5.3
const FRONT_RIDGE := 6.0
## The concrete between SJH and the hall (from SJH's east face, with room for it moving
## east), the way round the hall's south end, and the yard behind the green wall.
const SIDE := Rect2(38.8, 113.5, HALL.position.x - 38.8, 146.0 - 113.5)
const GAP := Rect2(HALL.position.x, HALL.end.y, 48.6 - HALL.position.x, 146.0 - HALL.end.y)
const YARD := Rect2(48.6, 137.2, 21.4, 8.4)
const GROUND_Y := -0.185
## The planter at the front block's side, the free-standing signs, the green wall (x, z
## from..to), the bins, the skip, the shelter, the pole.
const PLANTER := Rect2(44.0, 121.2, 1.4, 3.8)
const SIGNS: Array[Vector2] = [Vector2(42.8, 127.2), Vector2(41.6, 129.0), Vector2(40.2, 134.2)]
const GREEN_WALL := Vector3(48.6, 137.0, 143.2)
const EDGE_Z := 145.8
## Where the grey wall at the edge starts: west of it the concrete beside the hall runs on
## into the lane behind SJH (`Sjh.ACCESS`), its gate slid open against the wall.
const GATEWAY_X := 44.4
const BIN := Vector2(61.0, 143.9)
const SKIP := Rect2(54.0, 143.2, 3.2, 1.8)
const SHELTER := Rect2(50.2, 138.2, 3.8, 3.0)
const POLE := Vector2(39.4, 141.0)
## Facing the gym's front from out here the camera would stand inside SJH: everything west
## of this world x is cut away (aps.gd).
const CUT_X := 38.6

static func walkable(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	return SIDE.has_point(at) or GAP.has_point(at) or YARD.has_point(at)

static func blocked(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	if HALL.grow(0.05).has_point(at) or PLANTER.has_point(at) or SKIP.grow(0.1).has_point(at):
		return true
	if absf(x - GREEN_WALL.x) < 0.2 and z > GREEN_WALL.y - 0.2 and z < GREEN_WALL.z:
		return true
	if absf(z - GREEN_WALL.y) < 0.2 and x > GREEN_WALL.x and x < YARD.end.x:
		return true # the green wall's return along the gym's end
	if absf(z - EDGE_Z) < 0.2 and x > GATEWAY_X and x < YARD.end.x:
		return true # the grey wall at the edge, open to SJH's back lane west of it
	for post in SIGNS + [BIN, POLE]:
		if at.distance_to(post) < 0.4:
			return true
	for corner in [SHELTER.position, Vector2(SHELTER.end.x, SHELTER.position.y), Vector2(SHELTER.position.x, SHELTER.end.y), SHELTER.end]:
		if at.distance_to(corner) < 0.2:
			return true
	return false

static func floor_height(x: float, z: float) -> float:
	return GROUND_Y if walkable(x, z) else NAN

## Where the gym's view from out here cuts away SJH (0 on the apron and the road).
static func cut_for(z: float) -> float:
	return smoothstep(108.0, 113.0, z)

var w: RefCounted
var navy: Material

func build(world: RefCounted) -> void:
	w = world
	navy = w.material("ribbed", Color("2d3548"))
	_ground()
	_hall()
	_details()
	_yard()

func _rect(area: Rect2, y: float, made: Material) -> void:
	w.box(Vector3(area.size.x, 0.02, area.size.y), Vector3(area.get_center().x, y - 0.01, area.get_center().y), made)

func _ground() -> void:
	var slab: Material = w.material("concrete")
	for area in [SIDE, GAP, YARD]:
		_rect(area, GROUND_Y, slab)

## A gable end filled in pixel steps: thin upright strips from the eave line up to the
## roof's slope, across the end at world z `z`, between x0 and x1.
func _gable(x0: float, x1: float, z: float, eave: float, ridge: float, made: Material) -> void:
	var middle := (x0 + x1) / 2.0
	var half := (x1 - x0) / 2.0
	var strip := 0.2
	var x := x0
	while x < x1 - 0.01:
		var centre := x + strip / 2.0
		var top := lerpf(ridge, eave, absf(centre - middle) / half)
		w.box(Vector3(strip, top - eave, 0.2), Vector3(centre, (eave + top) / 2.0, z), made)
		x += strip

## A pitched roof over x0..x1 along z0..z1, ridge along z: two sloped sheets, a ridge cap
## and black fascias along the eaves.
func _roof(x0: float, x1: float, z0: float, z1: float, eave: float, ridge: float, out: float) -> void:
	var sheet: Material = w.material("ribbed", Color("3b4046"))
	var fascia: Material = w.material("plain", Color("1c1f22"))
	var middle := (x0 + x1) / 2.0
	var slope := atan2(ridge - eave, (x1 - x0) / 2.0) # meets the walls' tops at the eave
	var half := (x1 - x0) / 2.0 + out
	var edge := ridge - half * tan(slope) # the overhang's edge, a little lower
	var length := half / cos(slope)
	var zc := (z0 + z1) / 2.0
	var long := z1 - z0 + 2.0 * out
	for side in [-1.0, 1.0]:
		# Turned a quarter, so the sheet's tilt leans it down across x to the eave.
		var at := Vector3(middle + side * half / 2.0, (ridge + edge) / 2.0 + 0.03, zc)
		w.box(Vector3(long, 0.06, length + 0.05), at, sheet, PI / 2.0, side * slope)
		w.box(Vector3(0.06, 0.3, long), Vector3(middle + side * half, edge - 0.1, zc), fascia)
		for z in [z0 - out, z1 + out]:
			w.box(Vector3(0.06, 0.22, length + 0.05), Vector3(at.x, at.y - 0.06, z), fascia, PI / 2.0, side * slope)
	w.box(Vector3(0.25, 0.1, long), Vector3(middle, ridge + 0.05, zc), fascia)

## The hall: the white base, the navy corrugated walls, the long low roof, and the front
## block at the north end standing a little out and up, its gable facing the gym's door.
func _hall() -> void:
	var white: Material = w.material("stucco", Color("eeece6"))
	var hall := HALL
	w.box(Vector3(hall.size.x + 0.3, BASE_Y - GROUND_Y, hall.size.y + 0.3), Vector3(hall.get_center().x, (BASE_Y + GROUND_Y) / 2.0, hall.get_center().y), white)
	# The step along the west side, as in the photo.
	w.box(Vector3(0.45, 0.2, hall.size.y - 4.4), Vector3(hall.position.x - 0.35, GROUND_Y + 0.1, (FRONT.y + hall.end.y) / 2.0), white)
	# The long part: walls up to the eave, the low gable roof over them.
	var back := Rect2(hall.position.x, FRONT.y, hall.size.x, hall.end.y - FRONT.y)
	w.box(Vector3(back.size.x, EAVE - BASE_Y, back.size.y), Vector3(back.get_center().x, (BASE_Y + EAVE) / 2.0, back.get_center().y), navy)
	_gable(back.position.x, back.end.x, back.end.y - 0.1, EAVE, RIDGE, navy)
	_roof(back.position.x, back.end.x, back.position.y, back.end.y, EAVE, RIDGE, 0.7)
	# The front block, wider and taller, its gable to the north.
	var front := Rect2(hall.position.x - FRONT_OUT, FRONT.x, hall.size.x + FRONT_OUT, FRONT.y - FRONT.x)
	w.box(Vector3(front.size.x, EAVE + 0.4 - BASE_Y, front.size.y), Vector3(front.get_center().x, (BASE_Y + EAVE + 0.4) / 2.0, front.get_center().y), navy)
	_gable(front.position.x, front.end.x, front.position.y + 0.1, EAVE + 0.4, FRONT_RIDGE, navy)
	_gable(front.position.x, front.end.x, front.end.y - 0.1, EAVE + 0.4, FRONT_RIDGE, navy)
	_roof(front.position.x, front.end.x, front.position.y, front.end.y, EAVE + 0.4, FRONT_RIDGE, 0.5)
	# A white band under the front gable, with the building's small sign.
	w.box(Vector3(front.size.x, 0.25, 0.08), Vector3(front.get_center().x, EAVE + 0.3, front.position.y - 0.02), w.material("plain", Color("e8e6de")))

## The seal on the front block, the door, the windows and their aircon units, the signs on
## the wall and on the concrete, the planter.
func _details() -> void:
	var face := HALL.position.x - FRONT_OUT - 0.04 # the front block's west face
	var wall := HALL.position.x - 0.04 # the long part's west face
	_seal(Vector3(face - 0.03, 2.4, 123.0), 1.0)
	# The door, round the front block's corner, facing the gym's doorway.
	w.box(Vector3(1.2, 2.3, 0.05), Vector3(HALL.position.x + 0.7, BASE_Y + 1.15, FRONT.x - 0.03), w.material("glass", Color("1f242b")))
	# Windows along the long part, each with a white aircon unit on the wall beside it.
	var glass: Material = w.material("glass", Color("2b3f74"))
	var frame: Material = w.material("plain", Color("1c1f22"))
	var unit: Material = w.material("ribbed", Color("f2f2ee"))
	for z in [126.6, 129.4, 132.2]:
		w.box(Vector3(0.05, 1.5, 1.5), Vector3(wall - 0.01, BASE_Y + 1.9, z), glass)
		w.box(Vector3(0.06, 0.08, 1.6), Vector3(wall - 0.03, BASE_Y + 2.68, z), frame)
		w.box(Vector3(0.06, 0.08, 1.6), Vector3(wall - 0.03, BASE_Y + 1.12, z), frame)
		w.box(Vector3(0.5, 0.5, 0.95), Vector3(wall - 0.27, BASE_Y + 2.15, z - 0.05), unit)
	w.box(Vector3(0.05, 1.5, 1.2), Vector3(face - 0.01, BASE_Y + 1.6, 124.6), glass)
	# The NO PARKING sign on the wall.
	w.box(Vector3(0.04, 0.6, 1.9), Vector3(wall - 0.03, BASE_Y + 1.15, 128.0), w.material("plain", Color("f7f6f1")))
	var sign: Label3D = w.panel("NO PARKING", Vector3(wall - 0.06, BASE_Y + 1.27, 128.0), 1.6, 0.26, Color("c0302c"))
	sign.rotation.y = -PI / 2.0
	sign.name = "AERO NO PARKING"
	var small: Label3D = w.panel("MOTORCYCLE PARKING AT SJH BASEMENT", Vector3(wall - 0.06, BASE_Y + 1.02, 128.0), 1.7, 0.14, Color("1d1d1d"))
	small.rotation.y = -PI / 2.0
	# The white planter with shrubs at the front block's side.
	var planter := PLANTER
	w.box(Vector3(planter.size.x, 0.85, planter.size.y), Vector3(planter.get_center().x, GROUND_Y + 0.42, planter.get_center().y), w.material("stucco", Color("eeece6")))
	for z in [121.9, 123.2, 124.4]:
		w._shrub(Vector3(planter.get_center().x, GROUND_Y + 0.85, z), 1.1, 1800 + roundi(z), w.HEDGE_COLORS)
	# The free-standing signs: green MOTORCYCLE PARKING, white NO PARKING, a blank board.
	var steel := Color("8a8f92")
	var boards := [[Color("2f8a4a"), "MOTORCYCLE PARKING", Color("f4f4f0")], [Color("f4f4f0"), "NO PARKING", Color("1d1d1d")], [Color("f2f1ea"), "", Color("1d1d1d")]]
	for i in SIGNS.size():
		var at: Vector2 = SIGNS[i]
		var board: Array = boards[i]
		for dz in [-0.32, 0.32]:
			w.rod(Vector3(at.x, GROUND_Y, at.y + dz), Vector3(at.x, 1.4, at.y + dz), 0.02, steel)
		w.box(Vector3(0.04, 0.75, 0.62), Vector3(at.x, 1.0, at.y), w.material("plain", board[0]))
		if board[1] != "":
			var label: Label3D = w.panel(board[1], Vector3(at.x - 0.03, 1.0, at.y), 0.58, 0.16, board[2])
			label.rotation.y = -PI / 2.0

## The university seal as on the hall (IMG_1519.JPG): a white disc with a thin navy ring
## inside its edge, LAUS DEO SEMPER round the top and HOLY ANGEL UNIVERSITY round the
## bottom; inside, a brown shield under a white scalloped mantle, and the white angel with
## its wings spread down holding a small black shield with a gold band reading HAU. Drawn
## as a pixel image facing the wall's outside (west), the lettering as Label3Ds round it.
func _seal(at: Vector3, radius: float) -> void:
	var size := 96
	var image := Image.create(size, size, false, Image.FORMAT_RGBA8)
	var white := Color("f4f3ee")
	var navy := Color("2d3a66")
	var brown := Color("6b3a2a")
	var black := Color("1e1e22")
	var gold := Color("c9a14a")
	var angel := Color("f7f6f2")
	var shade := Color("c9ccd4")
	var c := (size - 1) / 2.0
	for y in size:
		for x in size:
			var d := Vector2(x - c, y - c).length()
			if d <= c:
				image.set_pixel(x, y, white)
			if d <= c and d > c - 1.5:
				image.set_pixel(x, y, navy)
			if absf(d - c * 0.72) < 0.7:
				image.set_pixel(x, y, navy)
	# The brown shield: flat top, straight sides, rounding to a point (y down in the image).
	var top := 24
	var bottom := 74
	for y in range(top, bottom + 1):
		var k := float(y - top) / (bottom - top)
		var half := 18.0 if k < 0.5 else 18.0 * sqrt(maxf(0.0, 1.0 - pow((k - 0.5) / 0.5, 2.0)))
		for x in range(roundi(c - half), roundi(c + half) + 1):
			image.set_pixel(x, y, brown)
	# The white mantle's scallops across its top.
	for k in 3:
		var centre := Vector2(c - 12.0 + 12.0 * k, top + 1.0)
		for y in range(top - 3, top + 6):
			for x in range(roundi(centre.x - 7), roundi(centre.x + 7)):
				if Vector2(x, y).distance_to(centre) < 6.5 and y <= top + 4:
					image.set_pixel(x, y, angel)
	# The angel: the wings spread down and out from the shoulders, the head, the robe.
	for side in [-1, 1]:
		for y in range(36, 66):
			var reach := 6 + (y - 36) * 0.45
			var inner := 3 + (y - 36) * 0.15
			for dx in range(roundi(inner), roundi(minf(reach, 22.0))):
				var x: int = roundi(c) + side * dx
				var feather: bool = (x + y) % 5 == 0
				image.set_pixel(x, y, shade if feather else angel)
	for y in range(36, 80):
		var half := 4.0 + (y - 36) * 0.08
		for x in range(roundi(c - half), roundi(c + half) + 1):
			image.set_pixel(x, y, angel if (x + y) % 7 != 0 else shade)
	for y in range(27, 36):
		for x in range(roundi(c - 4), roundi(c + 5)):
			if Vector2(x, y).distance_to(Vector2(c, 31)) < 4.2:
				image.set_pixel(x, y, Color("f0d9b5"))
	# A soft grey outline where the angel meets the brown, so its wings and robe read.
	var outline: Array[Vector2i] = []
	for y in range(1, size - 1):
		for x in range(1, size - 1):
			if image.get_pixel(x, y) != angel:
				continue
			for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
				if image.get_pixel(x + d.x, y + d.y) == brown:
					outline.append(Vector2i(x, y))
					break
	for spot in outline:
		image.set_pixelv(spot, Color("9da2ae"))
	# The small black shield the angel holds, a gold band down across it reading HAU.
	for y in range(46, 70):
		var k := float(y - 46) / 23.0
		var half := 8.0 if k < 0.55 else 8.0 * sqrt(maxf(0.0, 1.0 - pow((k - 0.55) / 0.45, 2.0)))
		for x in range(roundi(c - half), roundi(c + half) + 1):
			var on_band := absf((x - (c - 8.0)) * 1.3 - (y - 46.0) - 1.0) < 4.0
			image.set_pixel(x, y, gold if on_band else black)
	var glyphs := {"H": ["101", "101", "111", "101", "101"], "A": ["010", "101", "111", "101", "101"], "U": ["101", "101", "101", "101", "111"]}
	var letters := ["H", "A", "U"]
	for n in 3:
		var origin := Vector2i(roundi(c - 7.0) + n * 4, 47 + n * 5)
		for row in 5:
			for col in 3:
				if glyphs[letters[n]][row][col] == "1":
					image.set_pixel(origin.x + col, origin.y + row, black)
	image.generate_mipmaps()
	var made := StandardMaterial3D.new()
	made.albedo_texture = ImageTexture.create_from_image(image)
	made.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
	made.alpha_scissor_threshold = 0.4
	made.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	made.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	made.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	# A node facing the wall's outside (-x), holding the disc and its lettering.
	var seal := Node3D.new()
	seal.name = "AeroSeal"
	seal.position = at
	seal.rotation.y = -PI / 2.0
	w.root.add_child(seal)
	var quad := QuadMesh.new()
	quad.size = Vector2(2.0 * radius, 2.0 * radius)
	var disc := MeshInstance3D.new()
	disc.mesh = quad
	disc.material_override = made
	seal.add_child(disc)
	# The lettering round the ring: LAUS DEO SEMPER over the top, HOLY ANGEL UNIVERSITY
	# under the bottom, each letter turned to the ring, read left to right.
	var ring := radius * 0.86
	for line in [["LAUS DEO SEMPER", 1.0, deg_to_rad(62.0)], ["HOLY ANGEL UNIVERSITY", -1.0, deg_to_rad(72.0)]]:
		var text: String = line[0]
		var up: float = line[1]
		var spread: float = line[2]
		for n in text.length():
			if text[n] == " ":
				continue
			var a := lerpf(-spread, spread, n / float(text.length() - 1))
			var letter := Label3D.new()
			letter.text = text[n]
			letter.font_size = 32
			letter.pixel_size = radius * 0.0042
			letter.outline_size = 0
			letter.modulate = navy
			letter.shaded = true
			letter.alpha_cut = Label3D.ALPHA_CUT_OPAQUE_PREPASS
			letter.position = Vector3(sin(a) * ring, up * cos(a) * ring, 0.01)
			letter.rotation.z = -a if up > 0.0 else a
			seal.add_child(letter)

## The yard: the green-painted wall with its stains, the grey wall at the campus edge, the
## skip, a blue bin, a pile of cut branches, the steel-framed shelter, a pole with a lamp.
func _yard() -> void:
	var green: Material = w.material("stucco", Color("2e8a4c"))
	var stain: Material = w.material("stucco", Color("226b3a"))
	var length := GREEN_WALL.z - GREEN_WALL.y
	w.box(Vector3(0.25, 1.8, length), Vector3(GREEN_WALL.x, GROUND_Y + 0.9, (GREEN_WALL.y + GREEN_WALL.z) / 2.0), green)
	w.box(Vector3(YARD.end.x - GREEN_WALL.x, 1.8, 0.25), Vector3((GREEN_WALL.x + YARD.end.x) / 2.0, GROUND_Y + 0.9, GREEN_WALL.y), green)
	for patch in [[138.2, 0.6, 1.4], [140.4, 0.4, 1.0], [142.0, 0.9, 0.8]]:
		w.box(Vector3(0.04, patch[2], 1.3), Vector3(GREEN_WALL.x - 0.14, GROUND_Y + patch[1] + patch[2] / 2.0, patch[0]), stain)
	var grey: Material = w.material("stucco", Color("a9aaa4"))
	w.box(Vector3(YARD.end.x - GATEWAY_X, 2.6, 0.25), Vector3((GATEWAY_X + YARD.end.x) / 2.0, GROUND_Y + 1.3, EDGE_Z), grey)
	w.box(Vector3(3.2, 2.2, 0.06), Vector3(GATEWAY_X + 1.8, GROUND_Y + 1.1, EDGE_Z - 0.16), w.material("metal", Color("8f9a9c"))) # the gate, slid open
	w.box(Vector3(SKIP.size.x, 1.2, SKIP.size.y), Vector3(SKIP.get_center().x, GROUND_Y + 0.6, SKIP.get_center().y), w.material("metal", Color("2f5e3c")))
	var drum := CylinderMesh.new()
	drum.top_radius = 0.36
	drum.bottom_radius = 0.33
	drum.height = 0.95
	drum.radial_segments = 12
	w._mesh(drum, Vector3(BIN.x, GROUND_Y + 0.48, BIN.y), w.material("plain", Color("2f62b8")))
	for i in 3:
		w._shrub(Vector3(64.0 + i * 1.1, GROUND_Y, 144.6 - (i % 2) * 0.5), 0.9, 1810 + i, w.HEDGE_COLORS)
	for i in 6:
		var a := i * 0.9
		w.rod(Vector3(63.5 + i * 0.5, GROUND_Y + 0.1, 144.2), Vector3(64.4 + cos(a) * 1.2, GROUND_Y + 0.4, 144.6 + sin(a) * 0.4), 0.03, Color("6b5240"))
	# The shelter: four steel posts and a sloped clear roof.
	var steel := Color("6f7477")
	var corners := [SHELTER.position, Vector2(SHELTER.end.x, SHELTER.position.y), Vector2(SHELTER.position.x, SHELTER.end.y), SHELTER.end]
	for i in corners.size():
		var c: Vector2 = corners[i]
		w.rod(Vector3(c.x, GROUND_Y, c.y), Vector3(c.x, 2.6 if i < 2 else 2.1, c.y), 0.035, steel)
	w.box(Vector3(SHELTER.size.x + 0.4, 0.04, SHELTER.size.y + 0.5), Vector3(SHELTER.get_center().x, 2.38, SHELTER.get_center().y), w.material("glass", Color("b9cfc6")), 0.0, atan2(0.5, SHELTER.size.y))
	# The pole with a street lamp, by SJH.
	w.rod(Vector3(POLE.x, GROUND_Y, POLE.y), Vector3(POLE.x, 9.0, POLE.y), 0.12, Color("4a4d50"))
	w.rod(Vector3(POLE.x, 7.6, POLE.y), Vector3(POLE.x + 1.6, 7.9, POLE.y), 0.04, Color("4a4d50"))
	w.box(Vector3(0.55, 0.1, 0.24), Vector3(POLE.x + 1.7, 7.85, POLE.y), w.glow(Color("f4f0e0"), 0.2, 2.4))

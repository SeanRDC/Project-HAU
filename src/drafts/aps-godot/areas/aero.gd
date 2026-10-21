extends RefCounted
## Aero Hall (no. 21, the plan's "annex"), from Mikko's photo IMG_1519.JPG: the dark navy
## hall in front of the gym's south end, between St. Joseph Hall and the gym, just past the
## gym's HOLY ANGEL UNIVERSITY GYM doorway. One storey of corrugated navy walls on a white
## base under a dark metal gable roof; a taller gabled front block at its north end with
## the HAU seal on its side; windows with white aircon units, a NO PARKING sign, a white
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
	if z > EDGE_Z - 0.2:
		return true
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
	# The seal: a white disc in a navy ring with a dark shield and white wings.
	var disc := CylinderMesh.new()
	disc.top_radius = 0.95
	disc.bottom_radius = 0.95
	disc.height = 0.06
	disc.radial_segments = 24
	var seal: MeshInstance3D = w._mesh(disc, Vector3(face - 0.03, 2.4, 123.0), w.material("plain", Color("f4f4f0")))
	seal.rotation.z = PI / 2.0
	var ring := CylinderMesh.new()
	ring.top_radius = 1.05
	ring.bottom_radius = 1.05
	ring.height = 0.04
	ring.radial_segments = 24
	var rim: MeshInstance3D = w._mesh(ring, Vector3(face - 0.01, 2.4, 123.0), w.material("plain", Color("3c4a7a")))
	rim.rotation.z = PI / 2.0
	for side in [-1.0, 1.0]:
		w.box(Vector3(0.04, 0.42, 0.34), Vector3(face - 0.07, 2.55, 123.0 + side * 0.36), w.material("plain", Color("b9bec8")), 0.0, side * 0.4) # the wings
	w.box(Vector3(0.04, 0.62, 0.42), Vector3(face - 0.09, 2.32, 123.0), w.material("plain", Color("2f3a66"))) # the shield
	w.box(Vector3(0.04, 0.1, 0.46), Vector3(face - 0.11, 2.3, 123.0), w.material("plain", Color("c9a65a")), 0.0, 0.5)
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
	w.box(Vector3(YARD.end.x - SIDE.position.x, 2.6, 0.25), Vector3((SIDE.position.x + YARD.end.x) / 2.0, GROUND_Y + 1.3, EDGE_Z), grey)
	w.box(Vector3(3.2, 2.2, 0.06), Vector3(45.0, GROUND_Y + 1.1, EDGE_Z - 0.16), w.material("metal", Color("8f9a9c"))) # the gate
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

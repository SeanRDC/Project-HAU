extends RefCounted
## The Covered Court (no. 19), from Mikko's photos (screenshots 1186-1188): the long open
## shed between the canteen wing and the IH Gym. A low gable roof of pale corrugated sheet
## on white steel columns, its ridge running east from the east road; the west gable over
## the road has a big clerestory of window grids under the roof; the sides are open over
## low white railings, a concrete ramp with steel rails along the lane by the gym. Inside,
## a concrete court with its lines and steel bleachers along the north side. In front of
## the west gable, on the apron, a green picnic shed, a potted tree, the lamp post with the
## bell and the RESERVED CMO GUEST-PRIEST board.
##
## World coordinates (metres, Y up), on the plan's plot (campus_plan.gd "court"): the
## shed is square to x; the plot's east part past it is a concrete pad.

## The shed's floor (x, z) and its height; the columns' rows and their spacing; the
## roof's eave, ridge and overhang.
const SHED := Rect2(49.0, 19.0, 40.5, 37.0)
const FLOOR_Y := 0.3
const BAY := 5.0
const EAVE := 7.2
const RIDGE := 11.2
const OVERHANG := 1.6
## The ramp along the south side, from the lane up to the floor (x from..to, its width).
const RAMP := Vector2(62.0, 82.0)
const RAMP_WIDE := 1.6
## The bleachers along the north side (z from..to; steps).
const STANDS := Vector2(19.4, 23.4)
const STEPS := 5
## Things in front of the west gable, on the apron: the picnic shed, the potted tree, the
## lamp post with the bell, the board.
const SHED_AT := Vector2(46.0, 46.0)
const TREE := Vector2(46.2, 41.5)
const BELL := Vector2(47.0, 53.0)
const BOARD := Vector2(46.0, 55.0)
## Facing south at the gym from the lane the camera stands over the court: everything north
## of this world z (the roof, its columns) is cut away (aps.gd).
const CUT_Z := SHED.position.y + SHED.size.y + 0.3

static func centre_z() -> float:
	return SHED.get_center().y

## The column lines along the shed (world x), both long sides.
static func columns() -> Array[float]:
	var at: Array[float] = []
	var x := SHED.position.x + 0.3
	while x <= SHED.end.x - 0.2:
		at.append(x)
		x += BAY
	return at

## On the floor, or on the ramp up from the lane.
static func walkable(x: float, z: float) -> bool:
	return SHED.has_point(Vector2(x, z)) or on_ramp(x, z)

static func on_ramp(x: float, z: float) -> bool:
	return x >= RAMP.x and x <= RAMP.y and z > SHED.end.y and z <= SHED.end.y + RAMP_WIDE

static func blocked(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	if absf(x - SHED_AT.x) < 1.3 and absf(z - SHED_AT.y) < 0.9:
		return true # the picnic shed's table and benches
	if at.distance_to(TREE) < 0.7 or at.distance_to(BELL) < 0.3 or at.distance_to(BOARD) < 0.45:
		return true
	if not walkable(x, z):
		return false
	for column in columns():
		if absf(x - column) < 0.3 and (absf(z - SHED.position.y - 0.3) < 0.3 or absf(z - SHED.end.y + 0.3) < 0.3):
			return true
	if z > STANDS.x and z < STANDS.y and x > SHED.position.x + 3.0 and x < SHED.end.x - 3.0:
		return true # the bleachers
	# The railing along the south side, open at the ramp's top and at the west end.
	if absf(z - (SHED.end.y - 0.1)) < 0.12 and x > SHED.position.x + 6.0 and (x < RAMP.y - 2.0 or x > RAMP.y):
		return true
	return z > SHED.end.y and absf(z - (SHED.end.y + RAMP_WIDE)) < 0.12 # the ramp's outer rail

static func floor_height(x: float, z: float) -> float:
	if SHED.has_point(Vector2(x, z)):
		return FLOOR_Y
	if on_ramp(x, z):
		return lerpf(-0.185, FLOOR_Y, clampf((x - RAMP.x) / (RAMP.y - 2.0 - RAMP.x), 0.0, 1.0))
	return NAN

var w: RefCounted

func build(world: RefCounted) -> void:
	w = world
	_floor()
	_frame()
	_roof()
	_gables()
	_stands()
	_ramp()
	_front()

## The concrete floor on a low plinth, the court's lines, and the plot's pad past the shed.
func _floor() -> void:
	var slab: Material = w.material("concrete", Color("b4b3ad"))
	var middle := SHED.get_center()
	w.box(Vector3(SHED.size.x, FLOOR_Y + 0.2, SHED.size.y), Vector3(middle.x, (FLOOR_Y - 0.2) / 2.0, middle.y), slab)
	var paint: Material = w.material("plain", Color("efece2"))
	var court := Rect2(middle.x - 14.0, STANDS.y + 3.0, 28.0, 15.0)
	for z in [court.position.y, court.end.y]:
		w.box(Vector3(court.size.x, 0.012, 0.08), Vector3(court.get_center().x, FLOOR_Y + 0.006, z), paint)
	for x in [court.position.x, court.get_center().x, court.end.x]:
		w.box(Vector3(0.08, 0.012, court.size.y), Vector3(x, FLOOR_Y + 0.006, court.get_center().y), paint)
	for i in 24:
		var a := TAU * i / 24.0
		w.box(Vector3(0.08, 0.012, 0.5), Vector3(court.get_center().x + cos(a) * 1.8, FLOOR_Y + 0.006, court.get_center().y + sin(a) * 1.8), paint, a)
	# The hoops at both ends: a white post, a board and a ring.
	for side in [-1.0, 1.0]:
		var x: float = court.get_center().x + side * (court.size.x / 2.0 + 1.0)
		w.box(Vector3(0.2, 3.4, 0.2), Vector3(x, FLOOR_Y + 1.7, court.get_center().y), w.material("plain", Color("e9e9e4")))
		w.box(Vector3(0.06, 1.05, 1.8), Vector3(x - side * 0.9, FLOOR_Y + 3.3, court.get_center().y), w.material("plain", Color("f2f2ee")))
		w.box(Vector3(0.45, 0.04, 0.45), Vector3(x - side * 1.15, FLOOR_Y + 3.05, court.get_center().y), w.material("plain", Color("d0532b")))
		w.box(Vector3(1.0, 0.25, 0.2), Vector3(x - side * 0.45, FLOOR_Y + 3.2, court.get_center().y), w.material("plain", Color("e9e9e4")))
	# The plot past the shed: a concrete pad.
	w.box(Vector3(105.4 - SHED.end.x, 0.02, 57.0 - 43.0), Vector3((SHED.end.x + 105.4) / 2.0, -0.18, 50.0), w.material("concrete"))

## The white steel columns on both long sides, the trusses across at each, the eave beams,
## and the low railings between the columns.
func _frame() -> void:
	var white: Material = w.material("plain", Color("eceeec"))
	var pier: Material = w.material("concrete", Color("c9c8c1"))
	var half := SHED.size.y / 2.0
	var slope := atan2(RIDGE - EAVE, half)
	var length := half / cos(slope)
	for x in columns():
		for z in [SHED.position.y + 0.3, SHED.end.y - 0.3]:
			w.box(Vector3(0.5, 0.5, 0.5), Vector3(x, FLOOR_Y + 0.25, z), pier)
			w.box(Vector3(0.28, EAVE - FLOOR_Y - 0.5, 0.22), Vector3(x, (EAVE + FLOOR_Y + 0.5) / 2.0, z), white)
		# The truss: two sloped rafters up to the ridge, a tie across at the eave.
		for side in [-1.0, 1.0]:
			var mid := Vector3(x, (EAVE + RIDGE) / 2.0 - 0.35, centre_z() + side * half / 2.0)
			w.box(Vector3(0.18, 0.4, length), mid, white, 0.0, side * slope)
		w.box(Vector3(0.12, 0.12, SHED.size.y), Vector3(x, EAVE - 0.6, centre_z()), white)
	for z in [SHED.position.y + 0.3, SHED.end.y - 0.3]:
		w.box(Vector3(SHED.size.x, 0.35, 0.25), Vector3(SHED.get_center().x, EAVE - 0.2, z), white)
	# The low railings: two white rails along the long sides (the south one open at the
	# ramp's top and at the west end).
	var rail := Color("e6e8e6")
	for run in [[SHED.position.x + 6.0, RAMP.y - 2.0], [RAMP.y, SHED.end.x - 0.3]]:
		for y in [FLOOR_Y + 0.55, FLOOR_Y + 1.0]:
			w.rod(Vector3(run[0], y, SHED.end.y - 0.1), Vector3(run[1], y, SHED.end.y - 0.1), 0.025, rail)
	for y in [FLOOR_Y + 0.55, FLOOR_Y + 1.0]:
		w.rod(Vector3(SHED.position.x + 0.3, y, SHED.position.y + 0.1), Vector3(SHED.end.x - 0.3, y, SHED.position.y + 0.1), 0.025, rail)

## The low gable roof: two pale corrugated sheets with the overhang, a ridge cap, fascias.
func _roof() -> void:
	var sheet: Material = w.material("ribbed", Color("dfe2e1"))
	var trim: Material = w.material("plain", Color("c6cac9"))
	var half := SHED.size.y / 2.0
	var slope := atan2(RIDGE - EAVE, half)
	var reach := half + OVERHANG
	var length := reach / cos(slope)
	var long := SHED.size.x + 2.0 * OVERHANG
	for side in [-1.0, 1.0]:
		var at := Vector3(SHED.get_center().x, RIDGE - reach * tan(slope) / 2.0 + 0.04, centre_z() + side * reach / 2.0)
		w.box(Vector3(long, 0.07, length + 0.05), at, sheet, 0.0, side * slope)
		w.box(Vector3(long, 0.35, 0.06), Vector3(at.x, RIDGE - reach * tan(slope) - 0.1, centre_z() + side * reach), trim)
	w.box(Vector3(long, 0.12, 0.4), Vector3(SHED.get_center().x, RIDGE + 0.07, centre_z()), trim)

## The gables: white cladding filling each triangle in pixel steps, a band at the eave; on
## the west one, over the road, the big clerestory of window grids.
func _gables() -> void:
	var clad: Material = w.material("ribbed", Color("eeefec"))
	var band: Material = w.material("plain", Color("dadcd9"))
	var glass: Material = w.material("glass", Color("8c9aa2"))
	var frame: Material = w.material("plain", Color("2e3438"))
	var half := SHED.size.y / 2.0
	for x in [SHED.position.x, SHED.end.x]:
		var west: bool = x == SHED.position.x
		var strip := 0.25
		var z := SHED.position.y
		while z < SHED.end.y - 0.01:
			var c := z + strip / 2.0
			var top := lerpf(RIDGE, EAVE, absf(c - centre_z()) / half)
			w.box(Vector3(0.12, top - EAVE + 0.8, strip), Vector3(x, (EAVE - 0.8 + top) / 2.0, c), clad)
			# The clerestory: glass with dark frames over the middle third, under the roof.
			if west and absf(c - centre_z()) < half * 0.42 and top - EAVE > 1.2:
				w.box(Vector3(0.05, top - EAVE - 0.5, strip), Vector3(x - 0.08, (EAVE + 0.2 + top - 0.3) / 2.0, c), glass)
			z += strip
		w.box(Vector3(0.2, 0.5, SHED.size.y), Vector3(x - (0.05 if west else -0.05), EAVE - 0.55, centre_z()), band)
		if west:
			# The window grid's frames: uprights every metre, rails every 0.8 m.
			var wide := half * 0.84
			var u := -wide
			while u <= wide + 0.01:
				var top := lerpf(RIDGE, EAVE, absf(u) / half) - 0.3
				w.box(Vector3(0.07, top - EAVE - 0.2, 0.06), Vector3(x - 0.12, (EAVE + 0.2 + top) / 2.0, centre_z() + u), frame)
				u += 1.0
			var y := EAVE + 0.2
			while y < RIDGE - 0.6:
				var reach := (1.0 - (y - EAVE) / (RIDGE - EAVE)) * half
				var span := minf(reach - 0.3, wide) * 2.0
				if span > 0.5:
					w.box(Vector3(0.07, 0.06, span), Vector3(x - 0.12, y, centre_z()), frame)
				y += 0.8

## The steel bleachers along the north side: grey steps with white rails behind.
func _stands() -> void:
	var seat: Material = w.material("metal", Color("8d969b"))
	var from := SHED.position.x + 3.0
	var to := SHED.end.x - 3.0
	var deep := (STANDS.y - STANDS.x) / STEPS
	for k in STEPS:
		var height := FLOOR_Y + 0.4 * (STEPS - k)
		var z := STANDS.x + deep * (k + 0.5)
		w.box(Vector3(to - from, height - FLOOR_Y, deep), Vector3((from + to) / 2.0, (height + FLOOR_Y) / 2.0, z), seat)
	w.rod(Vector3(from, FLOOR_Y + 2.9, STANDS.x + 0.1), Vector3(to, FLOOR_Y + 2.9, STANDS.x + 0.1), 0.03, Color("e6e8e6"))

## The concrete ramp along the south side up from the lane, with its steel rails.
func _ramp() -> void:
	var slab: Material = w.material("concrete", Color("bdbcb5"))
	var top := RAMP.y - 2.0
	var length := top - RAMP.x
	var slope := atan2(FLOOR_Y + 0.185, length)
	var z := SHED.end.y + RAMP_WIDE / 2.0
	# Turned a quarter so its length runs along x, then tilted to rise towards the floor.
	w.box(Vector3(RAMP_WIDE, 0.15, length / cos(slope)), Vector3((RAMP.x + top) / 2.0, (FLOOR_Y - 0.185) / 2.0 - 0.07, z), slab, PI / 2.0, -slope)
	w.box(Vector3(2.0, FLOOR_Y + 0.2, RAMP_WIDE), Vector3(top + 1.0, (FLOOR_Y - 0.2) / 2.0, z), slab) # the landing
	var rail := Color("c4c8ca")
	for y in [0.55, 0.95]:
		w.rod(Vector3(RAMP.x, -0.185 + y, SHED.end.y + RAMP_WIDE), Vector3(top, FLOOR_Y + y, SHED.end.y + RAMP_WIDE), 0.025, rail)
		w.rod(Vector3(top, FLOOR_Y + y, SHED.end.y + RAMP_WIDE), Vector3(RAMP.y, FLOOR_Y + y, SHED.end.y + RAMP_WIDE), 0.025, rail)
	var x := RAMP.x
	while x <= RAMP.y + 0.01:
		var base := lerpf(-0.185, FLOOR_Y, clampf((x - RAMP.x) / length, 0.0, 1.0))
		w.rod(Vector3(x, base, SHED.end.y + RAMP_WIDE), Vector3(x, base + 0.97, SHED.end.y + RAMP_WIDE), 0.022, rail)
		x += 2.0

## In front of the west gable: the green picnic shed, the potted tree, the lamp post with
## the bell, the RESERVED CMO GUEST-PRIEST board.
func _front() -> void:
	w._shed(SHED_AT.x, SHED_AT.y)
	w.box(Vector3(1.2, 0.6, 1.2), Vector3(TREE.x, 0.1, TREE.y), w.material("plain", Color("b5653f")))
	w._tree(Vector3(TREE.x, 0.4, TREE.y), 5.5, 1900)
	var iron := Color("3e3833")
	w.rod(Vector3(BELL.x, -0.185, BELL.y), Vector3(BELL.x, 4.2, BELL.y), 0.06, iron)
	w.rod(Vector3(BELL.x, 3.9, BELL.y - 0.4), Vector3(BELL.x, 3.9, BELL.y + 0.4), 0.025, iron)
	w.box(Vector3(0.22, 0.3, 0.22), Vector3(BELL.x, 4.35, BELL.y), w.glow(Color("f6e3b0"), 0.2, 2.2))
	var bell := CylinderMesh.new()
	bell.top_radius = 0.08
	bell.bottom_radius = 0.17
	bell.height = 0.28
	bell.radial_segments = 10
	w._mesh(bell, Vector3(BELL.x, 3.7, BELL.y + 0.34), w.material("metal", Color("8a6a3c")))
	var board := Color("e9dfb8")
	for side in [-0.2, 0.2]:
		w.box(Vector3(0.06, 0.8, 1.0), Vector3(BOARD.x + side, 0.2, BOARD.y), w.material("plain", board), 0.0, 0.0)
	var text: Label3D = w.panel("RESERVED", Vector3(BOARD.x - 0.24, 0.45, BOARD.y), 0.9, 0.16, Color("6b4a2c"))
	text.rotation.y = -PI / 2.0
	text.name = "COURT RESERVED"
	var cmo: Label3D = w.panel("CMO", Vector3(BOARD.x - 0.24, 0.24, BOARD.y), 0.9, 0.22, Color("6b4a2c"))
	cmo.rotation.y = -PI / 2.0
	var guest: Label3D = w.panel("GUEST-PRIEST", Vector3(BOARD.x - 0.24, 0.04, BOARD.y), 0.9, 0.14, Color("6b4a2c"))
	guest.rotation.y = -PI / 2.0

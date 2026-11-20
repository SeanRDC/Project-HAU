extends RefCounted
## The Epiphany of Angels (from the photos in assets/epiphany of angels/, 20261019_153043 to
## 153100, and in assets/images/other references/: "epiphany begin, facing the campus",
## "epiphany end going to gate", "shot where the epiphany of angels walkway ends" and the
## aerial diagram): the road in from the Sto. Rosario Gate on the street (west) to the road by
## Rotonda 2 (east), between two rows of four stone angels on their pedestals.
##
## Across it, from the middle out: the road of dark octagon pavers with a band of white diamonds
## along each side and the university's seal near the gate; a raised walk of pale slabs each side
## behind a sloped kerb; the lawns with the angels, stone benches between them and lamps behind.
## North of it the garden and the covered walk (the "covered shed") with its tiled pavilion at the
## east end; south of it a lawn under big trees (the fallen trunk, the Memorare stone), a path and
## the Main Gate covered walk along the fence on Holy Angel Avenue. At the east end the road
## between the Epiphany and Rotonda 2, the hatched crossing, the black swing gate into the covered
## walk, the Guardian Angel car gate at the fence, and four steps down to it from the side gate
## colonnade's west pavilion.
##
## Square to the grid like SFJ's surveyed outline; the road's axis is z AXIS.

const SideGate := preload("res://areas/side_gate.gd")

## The road's axis, its ends (the Sto. Rosario fence, the road by Rotonda 2) and half width (the
## pavers and the diamond bands), the curb walks' and the lawns' outer edges (from the axis).
const AXIS := 86.0
const WEST := -261.0
const EAST := -213.5
const ROAD_HALF := 3.5
const PAVERS_HALF := 2.5
const CURB_OUT := 5.7
const LAWN_OUT := 9.0
## The curb walks end this far short of EAST, two steps down to the road by Rotonda 2.
const CURB_EAST := -214.3
## Levels: the road (the drives' level), the curb walks, the lawns' surface, the path and the
## covered walks' floors.
const ROAD_Y := -0.19
const CURB_Y := 0.07
const LAWN_Y := 0.0
const PATH_Y := -0.07
const COVER_Y := 0.05

## The road by Rotonda 2: from EAST to its east kerb, from its north end to the fence.
const NS_EAST := -207.0
const NS_NORTH := 74.5
## The fence on Holy Angel Avenue west of the car gate (z), and the car gate's west pier; its east
## pier is the side gate fence's west end (SideGate.FENCE_A).
const FENCE_Z := 104.0
const CAR_WEST := Vector2(-213.5, 104.0)

## The south: the garden under the trees, the path along the covered walk, the Main Gate covered
## walk (its inner row of pillars at SOUTH_ROW, the fence's piers carry the other side).
const SOUTH_GARDEN := 95.0
const PATH_N := 97.4
const SOUTH_WALK := Vector2(100.0, 103.5)
const SOUTH_ROW := 100.3
## The north: the garden, the covered walk (its rows), and the pavilion at its east end; the path
## from the curb walk's east end across the lawn to the pavilion.
const NORTH_GARDEN := 71.6
const NORTH_WALK := Vector2(66.5, 71.0)
const NORTH_WEST := -259.0
const PAVILION := Rect2(-219.2, 65.8, 4.6, 5.9)
const NORTH_PATH := Rect2(-216.6, 71.0, 2.0, 9.6)

## The steps from the side gate colonnade's west pavilion down to the road (in the fence's frame:
## lx from the colonnade's walk end to the strip's west end, lz between its pillars' rows).
const STEPS_LX := Vector2(-17.2, -19.6)
const STEPS_LZ := Vector2(1.2, 3.0)
const RISERS := 4
## The seal in the road (its middle) and radius.
const SEAL := Vector2(-251.5, AXIS)
const SEAL_R := 2.25

const BUILT_NAME := "Epiphany"

# --- Where the student walks ------------------------------------------------------------------

static func on_road(x: float, z: float) -> bool:
	return x >= WEST + 0.4 and x <= EAST and absf(z - AXIS) <= ROAD_HALF

static func on_curb(x: float, z: float) -> bool:
	var d := absf(z - AXIS)
	return x >= WEST + 0.4 and x <= EAST and d > ROAD_HALF and d <= CURB_OUT - 0.05

## The fence line at x: z of the fence west of the car gate, or of the car gate's line.
static func fence_at(x: float) -> float:
	if x <= CAR_WEST.x:
		return FENCE_Z
	var t := clampf((x - CAR_WEST.x) / (SideGate.FENCE_A.x - CAR_WEST.x), 0.0, 1.0)
	return lerpf(CAR_WEST.y, SideGate.FENCE_A.y, t)

static func on_ns_road(x: float, z: float) -> bool:
	return x > EAST - 0.01 and x <= NS_EAST and z >= NS_NORTH and z <= fence_at(x) - 0.35

static func steps_local(x: float, z: float) -> Vector2:
	return SideGate.fence_local(x, z)

## The steps from the colonnade's west pavilion, and the landing at their foot out to the road.
static func on_steps(x: float, z: float) -> bool:
	var p := steps_local(x, z)
	return p.y >= STEPS_LZ.x and p.y <= STEPS_LZ.y and p.x <= STEPS_LX.x and p.x >= STEPS_LX.y - 2.2

static func on_path(x: float, z: float) -> bool:
	return x >= WEST + 0.4 and x <= EAST and z >= PATH_N and z < SOUTH_WALK.x

static func in_south_walk(x: float, z: float) -> bool:
	return x >= WEST + 0.4 and x <= EAST and z >= SOUTH_WALK.x and z <= SOUTH_WALK.y

static func in_north_walk(x: float, z: float) -> bool:
	var walk := x >= NORTH_WEST and x <= PAVILION.position.x and z >= NORTH_WALK.x and z <= NORTH_WALK.y
	return walk or PAVILION.grow(-0.3).has_point(Vector2(x, z))

static func on_north_path(x: float, z: float) -> bool:
	return NORTH_PATH.has_point(Vector2(x, z))

static func walkable(x: float, z: float) -> bool:
	return on_road(x, z) or on_curb(x, z) or on_ns_road(x, z) or on_steps(x, z) or on_path(x, z) \
		or in_south_walk(x, z) or in_north_walk(x, z) or on_north_path(x, z)

static func blocked(x: float, z: float) -> bool:
	if not walkable(x, z):
		return false
	return false

static func floor_height(x: float, z: float) -> float:
	if not walkable(x, z):
		return NAN
	if on_steps(x, z):
		var p := steps_local(x, z)
		if p.x < STEPS_LX.y:
			return ROAD_Y
		var k := floori((STEPS_LX.x - p.x) / (STEPS_LX.x - STEPS_LX.y) * RISERS)
		return SideGate.GATE_Y - (SideGate.GATE_Y - ROAD_Y) * (mini(k, RISERS - 1) + 1) / RISERS
	if on_road(x, z) or on_ns_road(x, z):
		return ROAD_Y
	if on_curb(x, z):
		if x > CURB_EAST:
			return (CURB_Y + ROAD_Y) / 2.0 # the step down at the walk's east end
		return CURB_Y
	if on_path(x, z):
		return PATH_Y
	return COVER_Y

# --- Building ---------------------------------------------------------------------------------

var w: RefCounted

func build(world_builder: RefCounted) -> void:
	w = world_builder
	w._flush()
	var saved: Node3D = w.root
	var grounds := Node3D.new()
	grounds.name = BUILT_NAME
	saved.add_child(grounds)
	w.root = grounds
	_ground()
	_road()
	_diamonds()
	_seal()
	_curb_walks()
	_lawns()
	w._flush()
	w.root = saved

## An axis-aligned box from x0..x1, y0..y1, z0..z1.
func _block(x0: float, x1: float, y0: float, y1: float, z0: float, z1: float, made: Material) -> void:
	w.box(Vector3(absf(x1 - x0), absf(y1 - y0), absf(z1 - z0)), Vector3((x0 + x1) / 2.0, (y0 + y1) / 2.0, (z0 + z1) / 2.0), made)

func _cylinder(radius: float, height: float, at: Vector3, made: Material, segments := 16, top := -1.0) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius if top < 0.0 else top
	mesh.bottom_radius = radius
	mesh.height = height
	mesh.radial_segments = segments
	mesh.rings = 1
	return w._mesh(mesh, at, made)

## A flat rectangle of ground from x0..x1, z0..z1 at y.
func _rect(x0: float, x1: float, z0: float, z1: float, y: float, made: Material) -> void:
	w._ground(PackedVector2Array([Vector2(x0, z0), Vector2(x1, z0), Vector2(x1, z1), Vector2(x0, z0), Vector2(x1, z1), Vector2(x0, z1)]), y, made)

## The grass under it all, from the north covered walk to the fence, so nothing shows the plots'
## old pads.
func _ground() -> void:
	_rect(WEST, EAST, 64.5, FENCE_Z, ROAD_Y - 0.03, w.material("lawn", Color("6f8a4b")))

## The road: dark octagon pavers on a bed, from the gate to the road by Rotonda 2, the band each
## side darker; and the road by Rotonda 2, plain concrete with its joints, out to the fence.
func _road() -> void:
	var pavers: Material = w.material("octagon", Color("55534f"))
	var band: Material = w.material("octagon", Color("45433f"))
	_block(WEST, EAST, ROAD_Y - 0.3, ROAD_Y, AXIS - PAVERS_HALF, AXIS + PAVERS_HALF, pavers)
	for side in [-1.0, 1.0]:
		var z0: float = AXIS + side * PAVERS_HALF
		var z1: float = AXIS + side * ROAD_HALF
		_block(WEST, EAST, ROAD_Y - 0.3, ROAD_Y + 0.002, minf(z0, z1), maxf(z0, z1), band)
	var concrete: Material = w.material("concrete", Color("a9a69e"))
	var joint: Material = w.material("plain", Color("77746d"))
	_block(EAST, NS_EAST, ROAD_Y - 0.3, ROAD_Y, NS_NORTH, FENCE_Z, concrete)
	var z := NS_NORTH + 3.0
	while z < FENCE_Z - 1.0:
		_block(EAST, NS_EAST, ROAD_Y, ROAD_Y + 0.004, z - 0.02, z + 0.02, joint)
		z += 3.0
	_block((EAST + NS_EAST) / 2.0 - 0.02, (EAST + NS_EAST) / 2.0 + 0.02, ROAD_Y, ROAD_Y + 0.004, NS_NORTH, FENCE_Z - 0.6, joint)
	# The east kerb, against Rotonda 2's plot.
	_block(NS_EAST, NS_EAST + 0.2, ROAD_Y - 0.2, 0.0, NS_NORTH, 98.6, w.material("concrete", Color("c3beb3")))

## The white diamonds along both bands every three metres, and the row of white and dark
## diamonds across the road's east end.
func _diamonds() -> void:
	var white: Material = w.material("plain", Color("eeebe3"))
	var dark: Material = w.material("plain", Color("34322f"))
	for side in [-1.0, 1.0]:
		var z: float = AXIS + side * (PAVERS_HALF + ROAD_HALF) / 2.0
		var x := WEST + 2.0
		while x < EAST - 1.5:
			w.box(Vector3(0.5, 0.01, 0.5), Vector3(x, ROAD_Y + 0.006, z), white, PI / 4.0)
			x += 3.0
	var count := 9
	for i in count:
		var z := AXIS - ROAD_HALF + (i + 0.5) * ROAD_HALF * 2.0 / count
		w.box(Vector3(0.52, 0.01, 0.52), Vector3(EAST - 0.75, ROAD_Y + 0.006, z), white if i % 2 == 0 else dark, PI / 4.0)

## The seal set into the road near the gate: a red ring with LAUS DEO SEMPER over it and HOLY
## ANGEL UNIVERSITY under it in gold, round a yellow field; on it the white winged shield, red with
## H A U and the white cross. It reads upright from the south (the side the camera looks from).
func _seal() -> void:
	var at := Vector3(SEAL.x, ROAD_Y, SEAL.y)
	var r := SEAL_R
	_cylinder(r + 0.08, 0.02, at + Vector3(0, 0.005, 0), w.material("plain", Color("f1eee6")), 48)
	_cylinder(r, 0.022, at + Vector3(0, 0.007, 0), w.material("plain", Color("a8262b")), 48)
	_cylinder(r - 0.5, 0.024, at + Vector3(0, 0.009, 0), w.material("plain", Color("f1eee6")), 48)
	_cylinder(r - 0.56, 0.026, at + Vector3(0, 0.011, 0), w.material("plain", Color("e5b52c")), 48)
	_ring_words("LAUS DEO SEMPER", at, r - 0.25, PI * 1.2, PI * 1.8, true)
	_ring_words("HOLY ANGEL UNIVERSITY", at, r - 0.25, PI * 0.88, PI * 0.12, false)
	var top := at.y + 0.026
	var white: Material = w.material("plain", Color("f6f4ee"))
	# The wings: fans of white feathers out either side from the shield's head, lifted north.
	for side in [-1.0, 1.0]:
		var root := Vector2(at.x + side * 0.3, at.z - 0.15)
		for k in 6:
			var t := 0.08 + k * 0.17
			var length := 1.25 - k * 0.07
			var dir := Vector2(side * cos(t), -sin(t))
			var mid := root + dir * length / 2.0
			w.box(Vector3(0.13, 0.006, length), Vector3(mid.x, top + 0.002 + k * 0.0005, mid.y), white, atan2(dir.x, dir.y))
	# The shield: red with its point to the south, the white cross, H and A over it and U under.
	var red: Material = w.material("plain", Color("b02a2e"))
	w.box(Vector3(0.82, 0.008, 0.7), Vector3(at.x, top + 0.004, at.z - 0.05), red)
	w.box(Vector3(0.58, 0.008, 0.58), Vector3(at.x, top + 0.004, at.z + 0.3), red, PI / 4.0)
	w.box(Vector3(0.64, 0.01, 0.08), Vector3(at.x, top + 0.007, at.z + 0.02), white)
	w.box(Vector3(0.08, 0.01, 0.78), Vector3(at.x, top + 0.007, at.z + 0.1), white)
	for i in 3:
		var spot: Vector2 = [Vector2(-0.2, -0.2), Vector2(0.2, -0.2), Vector2(0.0, 0.42)][i]
		_flat_letter(["H", "A", "U"][i], Vector3(at.x + spot.x, top + 0.012, at.z + spot.y), 0.0, 0.0042, Color("f6f4ee"))

## One letter lying flat on the ground, its top turned to `up` (the turn of north about the vertical).
func _flat_letter(text: String, at: Vector3, up: float, size: float, ink: Color) -> void:
	var letter := Label3D.new()
	letter.text = text
	letter.font_size = 64
	letter.pixel_size = size
	letter.outline_size = 0
	letter.modulate = ink
	letter.shaded = true
	letter.double_sided = false
	letter.alpha_cut = Label3D.ALPHA_CUT_OPAQUE_PREPASS
	letter.position = at
	letter.rotation = Vector3(-PI / 2.0, up, 0)
	w.root.add_child(letter)

## Letters round a ring on the ground from angle a0 to a1 (atan2 of z, x about the middle), read
## west to east: the top words' feet towards the middle, the bottom words' heads.
func _ring_words(text: String, at: Vector3, radius: float, a0: float, a1: float, top: bool) -> void:
	var n := text.length()
	for i in n:
		if text[i] == " ":
			continue
		var a := lerpf(a0, a1, (i + 0.5) / n)
		var spot := Vector2(cos(a), sin(a)) * radius
		var up := atan2(-cos(a), -sin(a)) if top else atan2(cos(a), sin(a))
		_flat_letter(text[i], Vector3(at.x + spot.x, at.y + 0.04, at.z + spot.y), up, 0.0042, Color("f2d377"))

## The curb walks: a sloped kerb up from the road's band, pale slabs with ochre panels every
## 2.4 m (from the gate's photos), the two steps down at the east end.
func _curb_walks() -> void:
	var slab: Material = w.material("slab", Color("cdc6b6"))
	var ochre: Material = w.material("plain", Color("c9b67a"))
	var kerb: Material = w.material("concrete", Color("bdb8ad"))
	var edge: Material = w.material("concrete", Color("b1ab9f"))
	for side in [-1.0, 1.0]:
		var inner: float = AXIS + side * ROAD_HALF
		var outer: float = AXIS + side * CURB_OUT
		_block(WEST, CURB_EAST, ROAD_Y - 0.2, CURB_Y, minf(inner, outer), maxf(inner, outer), slab)
		# The kerb: a sloped face of plain concrete along the road (a box leaned over it).
		w.box(Vector3(CURB_EAST - WEST, 0.34, 0.2), Vector3((WEST + CURB_EAST) / 2.0, (ROAD_Y + CURB_Y) / 2.0, inner + side * 0.05), kerb, 0.0, side * 0.45)
		# The ochre panels, two to a slab, and the slabs' joints.
		var x := WEST + 1.2
		while x < CURB_EAST - 1.0:
			var mid: float = AXIS + side * (ROAD_HALF + CURB_OUT) / 2.0
			_block(x - 0.55, x + 0.55, CURB_Y, CURB_Y + 0.004, mid - 0.55, mid + 0.55, ochre)
			_block(x + 1.18, x + 1.22, CURB_Y, CURB_Y + 0.004, minf(inner, outer) + 0.2, maxf(inner, outer) - 0.1, w.material("plain", Color("9d978a")))
			x += 2.4
		# The outer edge, a plain concrete strip a little higher (the lawn's kerb).
		_block(WEST, CURB_EAST, ROAD_Y - 0.2, CURB_Y + 0.06, outer - 0.12, outer + 0.12, edge)
		# The two steps down to the road by Rotonda 2 at the east end.
		var mid_y := (CURB_Y + ROAD_Y) / 2.0
		_block(CURB_EAST, EAST, ROAD_Y - 0.2, mid_y, minf(inner, outer), maxf(inner, outer), slab)
		_block(CURB_EAST - 0.02, CURB_EAST + 0.02, mid_y, CURB_Y + 0.003, minf(inner, outer), maxf(inner, outer), w.material("plain", Color("e3b733")))

## The lawns either side, a low kerb round their outer and east edges, rounded at the corner by
## the road by Rotonda 2 (as in 153055).
func _lawns() -> void:
	var lawn: Material = w.material("lawn", Color("6f8a4b"))
	var kerb: Material = w.material("concrete", Color("c3beb3"))
	for side in [-1.0, 1.0]:
		var inner: float = AXIS + side * CURB_OUT
		var outer: float = AXIS + side * LAWN_OUT
		_rect(WEST, CURB_EAST - 1.6, minf(inner, outer), maxf(inner, outer), LAWN_Y + 0.02, lawn)
		_block(WEST, CURB_EAST - 1.6, LAWN_Y - 0.1, LAWN_Y + 0.12, outer - side * 0.1 - 0.06, outer - side * 0.1 + 0.06, kerb)
		# The east end: the kerb turns in to the walk's end.
		_block(CURB_EAST - 1.66, CURB_EAST - 1.54, LAWN_Y - 0.1, LAWN_Y + 0.12, minf(inner, outer), maxf(inner, outer), kerb)

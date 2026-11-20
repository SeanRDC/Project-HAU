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
## The angels: four a side along the lawns (x), PEDESTAL_OUT from the axis, each facing the road,
## and what each holds (north row west to east, then the south row). The plaques could not be read
## in the photos, so they are not named; the attributes are the archangels' usual ones.
const ANGELS_X: Array[float] = [-254.5, -244.0, -233.5, -223.0]
const PEDESTAL_OUT := 7.35
const PEDESTAL_TOP := 1.95
const HOLDS := ["child", "sword", "lily", "staff", "flame", "prayer", "crown", "roses"]
## The stone benches on the lawns along the walks (x), BENCH_OUT from the axis; the lamps behind.
const BENCHES_X: Array[float] = [-258.4, -249.25, -238.75, -228.25, -218.4]
const BENCH_OUT := 6.35
const LAMPS_X: Array[float] = [-249.25, -238.75, -228.25]
const LAMP_OUT := 8.45
## The yellow and black post on the north walk by the gate.
const POST := Vector2(-259.6, AXIS - 4.95)

const BUILT_NAME := "Epiphany"
const GATE_NAME := "StoRosarioGate"

## The Sto. Rosario Gate ("epiphany end going to gate"): the main piers either side of the road
## and the second piers past the pedestrian gates (z from the axis), the fence along the street
## from the north covered walk's end to the corner on Holy Angel Avenue and its piers' spacing,
## the flags beside the gate (z from the axis), the dark LED board on the south lawn.
const MAIN_PIER := 3.95
const SIDE_PIER := 6.15
const STREET_NORTH := 62.5
const FENCE_STEP := 3.0
const FLAGS: Array[float] = [-9.2, -12.2, 9.2, 12.2]
const BOARD := Vector2(-258.2, 96.9)

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
	if Vector2(x, z).distance_to(POST) < 0.3:
		return true
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
	for i in 8:
		var north := i < 4
		var x: float = ANGELS_X[i % 4]
		var z: float = AXIS + (-PEDESTAL_OUT if north else PEDESTAL_OUT)
		_pedestal(Vector2(x, z), north)
		_angel(Vector3(x, LAWN_Y + PEDESTAL_TOP, z), 0.0 if north else PI, HOLDS[i], 7300 + i)
	_benches()
	_lamps()
	_urns()
	_post()
	w._flush()
	var gate := Node3D.new()
	gate.name = GATE_NAME
	grounds.add_child(gate)
	w.root = gate
	_sto_rosario()
	_street_fence()
	_flags()
	_board()
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
	var pavers: Material = w.material("octagon_grey")
	var band: Material = w.material("octagon_grey", Color("c8c8c8"))
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

# --- The angels -------------------------------------------------------------------------------

## A pedestal of pale stone (from 153055 and the gate's photos): a plinth, a die with a dark bronze
## plaque on the face to the road and smaller ones on its sides, a moulded cap.
func _pedestal(at: Vector2, north: bool) -> void:
	var stone: Material = w.material("concrete", Color("e4ded2"))
	var trim: Material = w.material("concrete", Color("ece7dc"))
	var plaque: Material = w.material("plain", Color("33302c"))
	var y := LAWN_Y
	_block(at.x - 0.85, at.x + 0.85, y, y + 0.3, at.y - 0.85, at.y + 0.85, stone)
	_block(at.x - 0.75, at.x + 0.75, y + 0.3, y + 0.42, at.y - 0.75, at.y + 0.75, trim)
	_block(at.x - 0.62, at.x + 0.62, y + 0.42, y + 1.62, at.y - 0.62, at.y + 0.62, stone)
	_block(at.x - 0.74, at.x + 0.74, y + 1.62, y + 1.76, at.y - 0.74, at.y + 0.74, trim)
	_block(at.x - 0.8, at.x + 0.8, y + 1.76, y + PEDESTAL_TOP, at.y - 0.8, at.y + 0.8, stone)
	var face: float = at.y + (0.63 if north else -0.63)
	_block(at.x - 0.36, at.x + 0.36, y + 0.68, y + 1.38, face - 0.015, face + 0.015, plaque)
	for side in [-1.0, 1.0]:
		_block(at.x + side * 0.63 - 0.015, at.x + side * 0.63 + 0.015, y + 0.75, y + 1.3, at.y - 0.28, at.y + 0.28, plaque)

## A stone angel standing on a cloud of rock, its robe falling in folds, its wings raised behind,
## facing `turn` (0: south, towards the road from the north row), holding what `holds` names.
func _angel(foot: Vector3, turn: float, holds: String, seed_value: int) -> void:
	var stone: Material = w.material("plain", Color("e6e2da"))
	var shade: Material = w.material("plain", Color("d2cdc3"))
	var basis := Basis(Vector3.UP, turn)
	# (right, up, forward) in the statue's frame to the world; forward faces the road.
	var at := func(r: float, u: float, f: float) -> Vector3: return foot + basis * Vector3(-r, u, f)
	var part := func(size: Vector3, r: float, u: float, f: float, made: Material, tilt := 0.0, twist := 0.0) -> void:
		w.box(size, at.call(r, u, f), made, turn + twist, tilt)
	_cylinder(0.46, 0.22, at.call(0.0, 0.11, 0.0), shade, 10, 0.4)
	# The robe: a long skirt, wider at the hem, and its folds; a knee forward, a bare foot.
	_cylinder(0.36, 1.12, at.call(0.0, 0.22 + 0.56, 0.0), stone, 12, 0.21)
	for k in 5:
		var a := -0.9 + k * 0.45
		part.call(Vector3(0.05, 1.0, 0.05), sin(a) * 0.26, 0.74, cos(a) * 0.26, shade, -0.12, a)
	part.call(Vector3(0.2, 0.42, 0.18), 0.1, 0.62, 0.24, stone, -0.25)
	part.call(Vector3(0.12, 0.06, 0.2), 0.12, 0.25, 0.33, stone)
	# The body: chest, the sash across it, shoulders, neck and head with its curls.
	part.call(Vector3(0.44, 0.5, 0.27), 0.0, 1.55, 0.0, stone)
	part.call(Vector3(0.5, 0.09, 0.29), 0.0, 1.6, 0.0, shade, 0.0, 0.5)
	part.call(Vector3(0.6, 0.14, 0.28), 0.0, 1.78, -0.01, stone)
	_cylinder(0.06, 0.12, at.call(0.0, 1.9, 0.0), stone, 8)
	var head := SphereMesh.new()
	head.radius = 0.125
	head.height = 0.27
	w._mesh(head, at.call(0.0, 2.05, 0.02), stone)
	var hair := SphereMesh.new()
	hair.radius = 0.14
	hair.height = 0.24
	w._mesh(hair, at.call(0.0, 2.1, -0.035), shade)
	# The wings: from the shoulder blades, each a fan of long feathers raised and spread outward,
	# swept back a little; a plate of coverts over their roots. Seen from the front they rise either
	# side of the head, their scalloped tips over it.
	var feather := func(size: Vector3, r: float, u: float, f: float, roll: float, sweep: float, made: Material) -> void:
		var turned := basis * Basis(Vector3.UP, sweep) * Basis(Vector3.BACK, roll) * Basis(Vector3.RIGHT, -0.12)
		var mesh := BoxMesh.new()
		mesh.size = size
		var instance := MeshInstance3D.new()
		instance.mesh = mesh
		instance.material_override = made
		instance.transform = Transform3D(turned, at.call(r, u, f) + turned * Vector3(0, size.y / 2.0, 0))
		w.root.add_child(instance)
	for side in [-1.0, 1.0]:
		for k in 6:
			var roll: float = side * (0.03 + k * 0.075)
			var length := 1.5 - k * 0.12
			feather.call(Vector3(0.15, length, 0.045), side * (0.15 + k * 0.03), 1.6 - k * 0.04, -0.2 - k * 0.03, roll, side * 0.75, stone if k % 2 == 0 else shade)
		feather.call(Vector3(0.36, 0.7, 0.06), side * 0.19, 1.5, -0.16, side * 0.18, side * 0.75, shade)
	# The arms and what they hold.
	match holds:
		"sword":
			part.call(Vector3(0.11, 0.42, 0.11), -0.33, 1.95, 0.05, stone)
			part.call(Vector3(0.1, 0.32, 0.1), -0.35, 2.3, 0.08, stone)
			w.rod(at.call(-0.36, 2.42, 0.1), at.call(-0.4, 3.3, 0.14), 0.035, Color("e2ddd3"))
			part.call(Vector3(0.3, 0.05, 0.06), -0.36, 2.48, 0.1, shade)
			part.call(Vector3(0.11, 0.4, 0.11), 0.32, 1.5, 0.1, stone, -0.4)
			var shield := _cylinder(0.3, 0.06, at.call(0.36, 1.35, 0.28), shade, 14)
			shield.rotation = Vector3(PI / 2.0, turn, 0)
		"lily":
			part.call(Vector3(0.11, 0.4, 0.11), -0.3, 1.5, 0.14, stone, -0.6)
			w.rod(at.call(-0.32, 1.4, 0.32), at.call(-0.34, 2.45, 0.36), 0.025, Color("e2ddd3"))
			for k in 3:
				var bloom := SphereMesh.new()
				bloom.radius = 0.07
				bloom.height = 0.12
				w._mesh(bloom, at.call(-0.34 + (k - 1) * 0.06, 2.4 - k * 0.12, 0.38), stone)
			part.call(Vector3(0.11, 0.42, 0.11), 0.3, 1.55, 0.02, stone, 0.3)
		"staff":
			part.call(Vector3(0.11, 0.42, 0.11), -0.32, 1.55, 0.12, stone, -0.4)
			w.rod(at.call(-0.4, 0.25, 0.3), at.call(-0.4, 2.55, 0.3), 0.03, Color("d8d2c6"))
			part.call(Vector3(0.11, 0.4, 0.11), 0.32, 1.5, 0.12, stone, -0.5)
			part.call(Vector3(0.08, 0.06, 0.32), 0.36, 1.32, 0.36, shade) # the fish
		"flame":
			part.call(Vector3(0.11, 0.45, 0.11), -0.32, 1.95, 0.12, stone, -0.3)
			var flame := SphereMesh.new()
			flame.radius = 0.1
			flame.height = 0.32
			w._mesh(flame, at.call(-0.34, 2.35, 0.25), stone)
			part.call(Vector3(0.11, 0.4, 0.11), 0.3, 1.5, 0.12, stone, -0.5)
			part.call(Vector3(0.26, 0.05, 0.2), 0.32, 1.34, 0.32, shade) # the book
		"prayer":
			for side in [-1.0, 1.0]:
				part.call(Vector3(0.11, 0.42, 0.11), side * 0.24, 1.58, 0.13, stone, -0.9, -side * 0.4)
			part.call(Vector3(0.1, 0.22, 0.08), 0.0, 1.72, 0.3, stone)
		"crown":
			for side in [-1.0, 1.0]:
				part.call(Vector3(0.11, 0.45, 0.11), side * 0.3, 1.98, 0.1, stone, -0.25, side * 0.2)
			_cylinder(0.14, 0.12, at.call(0.0, 2.38, 0.2), shade, 10, 0.16)
		"roses":
			for side in [-1.0, 1.0]:
				part.call(Vector3(0.11, 0.4, 0.11), side * 0.26, 1.5, 0.14, stone, -0.9, -side * 0.3)
			for k in 5:
				var rose := SphereMesh.new()
				rose.radius = 0.06
				rose.height = 0.1
				w._mesh(rose, at.call((k - 2) * 0.07, 1.4 + (k % 2) * 0.05, 0.3), shade)
		_: # the guardian angel: one hand raised, the other on the shoulder of a child beside it
			part.call(Vector3(0.11, 0.42, 0.11), -0.33, 1.95, 0.08, stone, -0.2)
			part.call(Vector3(0.11, 0.42, 0.11), 0.34, 1.5, 0.15, stone, -0.6, 0.3)
			_cylinder(0.17, 0.7, at.call(0.5, 0.22 + 0.35, 0.3), stone, 10, 0.12)
			part.call(Vector3(0.24, 0.26, 0.16), 0.5, 1.05, 0.3, stone)
			var child := SphereMesh.new()
			child.radius = 0.09
			child.height = 0.2
			w._mesh(child, at.call(0.5, 1.28, 0.31), stone)

## Stone benches with scroll legs on the lawns, facing the road.
func _benches() -> void:
	var stone: Material = w.material("concrete", Color("cfcac0"))
	var shade: Material = w.material("concrete", Color("bdb7ab"))
	for side in [-1.0, 1.0]:
		for x in BENCHES_X:
			var z: float = AXIS + side * BENCH_OUT
			_block(x - 0.95, x + 0.95, LAWN_Y + 0.4, LAWN_Y + 0.5, z - 0.24, z + 0.24, stone)
			for end in [-0.65, 0.65]:
				_block(x + end - 0.13, x + end + 0.13, LAWN_Y, LAWN_Y + 0.4, z - 0.2, z + 0.2, shade)
				_cylinder(0.11, 0.3, Vector3(x + end, LAWN_Y + 0.28, z), shade, 8).rotation = Vector3(PI / 2.0, 0, 0)

## Crook lamps on the lawns behind the benches: a dark bronze post on a fluted foot, a crook at the
## top and the lantern hung from it, lit at night.
func _lamps() -> void:
	var bronze := Color("3d342b")
	for side in [-1.0, 1.0]:
		for x in LAMPS_X:
			var foot := Vector3(x, LAWN_Y, AXIS + side * LAMP_OUT)
			_cylinder(0.16, 0.6, foot + Vector3(0, 0.3, 0), w.material("plain", bronze), 10, 0.1)
			var top := foot + Vector3(0, 3.7, 0)
			w.rod(foot + Vector3(0, 0.6, 0), top, 0.055, bronze)
			var out := Vector3(0, 0, -side)
			var bend := top + out * 0.25 + Vector3(0, 0.3, 0)
			var tip := top + out * 0.6 + Vector3(0, 0.2, 0)
			w.rod(top, bend, 0.04, bronze)
			w.rod(bend, tip, 0.035, bronze)
			var head := tip + Vector3(0, -0.3, 0)
			w.rod(tip, head + Vector3(0, 0.13, 0), 0.015, bronze)
			_cylinder(0.12, 0.26, head, w.glow(Color("fff0d2"), 0.08, 3.0), 6, 0.09)
			_cylinder(0.16, 0.06, head + Vector3(0, 0.15, 0), w.material("plain", bronze), 6, 0.04)
			var light := SpotLight3D.new()
			light.light_color = Color("ffd194")
			light.light_energy = 3.0
			light.spot_range = 8.0
			light.spot_angle = 65.0
			light.spot_attenuation = 0.8
			light.rotation = Vector3(-PI / 2.0, 0, 0)
			w._lamp(light, head + Vector3(0, -0.2, 0))

## Stone urns with spiky yellow-green plants at the walks' east ends (153055, 153057).
func _urns() -> void:
	var stone: Material = w.material("concrete", Color("d9d4c9"))
	var leaves: Array[Color] = [Color("4f6a2a"), Color("6f8a3a"), Color("8a9a3a"), Color("b7b84a"), Color("d6cf6a")]
	for side in [-1.0, 1.0]:
		var at := Vector3(CURB_EAST - 0.9, LAWN_Y, AXIS + side * (CURB_OUT + 0.55))
		_block(at.x - 0.28, at.x + 0.28, at.y, at.y + 0.2, at.z - 0.28, at.z + 0.28, stone)
		_cylinder(0.1, 0.35, at + Vector3(0, 0.37, 0), stone, 10, 0.12)
		_cylinder(0.18, 0.4, at + Vector3(0, 0.74, 0), stone, 12, 0.32)
		_cylinder(0.34, 0.06, at + Vector3(0, 0.96, 0), stone, 12)
		w._shrub(at + Vector3(0, 0.92, 0), 0.75, 7400 + int(side), leaves)

## The yellow and black striped post on the north walk by the gate.
func _post() -> void:
	var at := Vector3(POST.x, CURB_Y, POST.y)
	_block(at.x - 0.2, at.x + 0.2, at.y, at.y + 0.08, at.z - 0.2, at.z + 0.2, w.material("plain", Color("e3b733")))
	for k in 7:
		_block(at.x - 0.06, at.x + 0.06, at.y + 0.08 + k * 0.2, at.y + 0.28 + k * 0.2, at.z - 0.06, at.z + 0.06,
			w.material("plain", Color("e8b923") if k % 2 == 0 else Color("1e1f20")))

# --- The Sto. Rosario Gate --------------------------------------------------------------------

## A gate pier of pale stone: a plinth, the shaft with a carved cartouche on its faces to the road
## and to the street, a moulded capital and cap; `lamps` puts the cluster of lanterns on top.
func _pier(at: Vector2, half: float, height: float, carved: bool, lamps: int) -> void:
	var stone: Material = w.material("concrete", Color("ddd7c9"))
	var trim: Material = w.material("concrete", Color("e7e2d6"))
	var relief: Material = w.material("plain", Color("cfc8b8"))
	_block(at.x - half - 0.08, at.x + half + 0.08, ROAD_Y - 0.1, CURB_Y + 0.3, at.y - half - 0.08, at.y + half + 0.08, trim)
	_block(at.x - half, at.x + half, CURB_Y + 0.3, height - 0.35, at.y - half, at.y + half, stone)
	_block(at.x - half - 0.07, at.x + half + 0.07, height - 0.35, height - 0.2, at.y - half - 0.07, at.y + half + 0.07, trim)
	_block(at.x - half - 0.12, at.x + half + 0.12, height - 0.2, height, at.y - half - 0.12, at.y + half + 0.12, stone)
	if carved:
		# The cartouche: an oval frame with a shell over it, scrolls either side, a drop under it.
		for face in [-1.0, 1.0]:
			var fx: float = at.x + face * (half + 0.02)
			var mid := (CURB_Y + height) / 2.0 + 0.2
			_block(fx - 0.03, fx + 0.03, mid - 0.75, mid + 0.75, at.y - half * 0.55, at.y + half * 0.55, relief)
			_block(fx - 0.05, fx + 0.05, mid - 0.55, mid + 0.55, at.y - half * 0.35, at.y + half * 0.35, trim)
			_block(fx - 0.05, fx + 0.05, mid + 0.8, mid + 1.05, at.y - half * 0.45, at.y + half * 0.45, relief)
			for side in [-1.0, 1.0]:
				_block(fx - 0.04, fx + 0.04, mid - 0.3, mid + 0.5, at.y + side * half * 0.7 - 0.07, at.y + side * half * 0.7 + 0.07, relief)
			_block(fx - 0.04, fx + 0.04, mid - 1.25, mid - 0.8, at.y - 0.08, at.y + 0.08, relief)
	if lamps > 0:
		_lantern_cluster(Vector3(at.x, height, at.y), lamps)

## Black lanterns on a post over a pier: one on top, the rest on arms round it.
func _lantern_cluster(top: Vector3, count: int) -> void:
	var iron := Color("1f2022")
	w.rod(top, top + Vector3(0, 1.0, 0), 0.05, iron)
	var heads: Array[Vector3] = [top + Vector3(0, 1.2, 0)]
	for i in count - 1:
		var a := TAU * i / float(count - 1) + PI / 4.0
		var out := Vector3(cos(a), 0, sin(a)) * 0.38
		w.rod(top + Vector3(0, 0.55, 0), top + Vector3(0, 0.7, 0) + out, 0.025, iron)
		heads.append(top + Vector3(0, 0.88, 0) + out)
	for head in heads:
		_cylinder(0.07, 0.08, head - Vector3(0, 0.14, 0), w.material("plain", iron), 8)
		_cylinder(0.1, 0.22, head, w.glow(Color("fff0d2"), 0.06, 3.0), 8, 0.12)
		_cylinder(0.15, 0.1, head + Vector3(0, 0.16, 0), w.material("plain", iron), 8, 0.02)
	_omni(top + Vector3(0, 0.9, 0), 4.0, 10.0)

func _omni(at: Vector3, energy: float, reach: float) -> void:
	var light := OmniLight3D.new()
	light.light_color = Color("ffd194")
	light.light_energy = energy
	light.omni_range = reach
	light.omni_attenuation = 1.4
	w._lamp(light, at)

## Iron bars across the street line (x WEST) from z0 to z1 standing on y0: rails, bars with spear
## tips and a band of rings under the top, `top` high.
func _iron(z0: float, z1: float, y0: float, top: float, step := 0.13) -> void:
	var iron := Color("1f2022")
	var x := WEST + 0.12
	var bars := maxi(2, roundi((z1 - z0) / step))
	for k in bars + 1:
		var z := lerpf(z0, z1, float(k) / bars)
		w.rod(Vector3(x, y0, z), Vector3(x, top, z), 0.012, iron)
		w.box(Vector3(0.03, 0.09, 0.05), Vector3(x, top + 0.03, z), w.material("plain", iron))
	for y in [y0 + 0.15, y0 + 0.9, top - 0.35, top - 0.05]:
		w.rod(Vector3(x, y, z0), Vector3(x, y, z1), 0.02, iron)
	var z := z0 + 0.15
	while z < z1 - 0.1:
		var ring := TorusMesh.new()
		ring.inner_radius = 0.07
		ring.outer_radius = 0.09
		ring.rings = 8
		ring.ring_segments = 6
		var made: MeshInstance3D = w._mesh(ring, Vector3(x, top - 0.6, z), w.material("plain", iron))
		made.rotation = Vector3(0, 0, PI / 2.0)
		z += 0.26

## The gate: the two tall carved piers with their lantern clusters either side of the road, the
## iron double gate between them (closed; its top swoops up to the middle), the pedestrian gates
## over the curb walks to the second piers, which carry single lanterns.
func _sto_rosario() -> void:
	for side in [-1.0, 1.0]:
		_pier(Vector2(WEST, AXIS + side * MAIN_PIER), 0.55, 4.5, true, 4)
		_pier(Vector2(WEST, AXIS + side * SIDE_PIER), 0.32, 3.0, false, 1)
		var a: float = AXIS + side * (MAIN_PIER + 0.55)
		var b: float = AXIS + side * (SIDE_PIER - 0.32)
		_iron(minf(a, b), maxf(a, b), CURB_Y, 2.5, 0.12)
	var z0 := AXIS - MAIN_PIER + 0.55
	var z1 := AXIS + MAIN_PIER - 0.55
	_iron(z0, z1, ROAD_Y + 0.05, 3.1, 0.12)
	# The swoop over both leaves, highest in the middle, its bars run up to it; the meeting post.
	var iron := Color("1f2022")
	var previous := Vector3(WEST + 0.12, 3.1, z0)
	for k in range(1, 25):
		var t := k / 24.0
		var z := lerpf(z0, z1, t)
		var lift := sin(t * PI)
		var next := Vector3(WEST + 0.12, 3.1 + 0.75 * lift * lift, z)
		w.rod(previous, next, 0.03, iron)
		w.rod(Vector3(WEST + 0.12, 3.05, z), next, 0.012, iron)
		previous = next
	w.rod(Vector3(WEST + 0.12, ROAD_Y, AXIS), Vector3(WEST + 0.12, 3.9, AXIS), 0.04, iron)

## The fence along the street (x WEST) from the north covered walk's end to the corner on Holy
## Angel Avenue: a low cream wall, cream piers every three metres, iron bars with rings between,
## broken by the gate.
func _street_fence() -> void:
	var runs := [Vector2(STREET_NORTH, AXIS - SIDE_PIER - 0.32), Vector2(AXIS + SIDE_PIER + 0.32, FENCE_Z)]
	for run in runs:
		var count := maxi(1, roundi((run.y - run.x) / FENCE_STEP))
		for k in count:
			var z0: float = lerpf(run.x, run.y, float(k) / count)
			var z1: float = lerpf(run.x, run.y, float(k + 1) / count)
			_block(WEST - 0.05, WEST + 0.3, ROAD_Y - 0.1, 0.55, z0, z1, w.material("stucco", Color("ece0bf")))
			_block(WEST - 0.08, WEST + 0.33, 0.55, 0.62, z0, z1, w.material("plain", Color("f1e9d2")))
			_iron(z0 + 0.25, z1 - 0.25, 0.62, 2.35, 0.16)
			if k > 0:
				_pier(Vector2(WEST + 0.12, z0), 0.26, 2.75, false, 0)
		_pier(Vector2(WEST + 0.12, run.x if run.x < AXIS else run.y), 0.3, 2.9, false, 0)

## The yellow and white flags on poles at the fence either side of the gate.
func _flags() -> void:
	for out in FLAGS:
		var foot := Vector3(WEST + 0.5, LAWN_Y, AXIS + out)
		w.rod(foot, foot + Vector3(0, 4.6, 0), 0.03, Color("d8d8d2"))
		w.rod(foot + Vector3(0, 4.3, 0), foot + Vector3(0.75, 4.3, 0), 0.015, Color("d8d8d2"))
		w.box(Vector3(0.36, 1.05, 0.02), foot + Vector3(0.2, 3.77, 0), w.material("plain", Color("efc93c")))
		w.box(Vector3(0.36, 1.05, 0.02), foot + Vector3(0.56, 3.77, 0), w.material("plain", Color("f4f2ea")))

## The dark LED board on its steel frame on the south lawn by the gate, facing in.
func _board() -> void:
	var steel := Color("2b2d30")
	var at := BOARD
	for dz in [-1.1, 1.1]:
		w.rod(Vector3(at.x, LAWN_Y, at.y + dz), Vector3(at.x, 5.2, at.y + dz), 0.09, steel)
	_block(at.x - 0.25, at.x + 0.05, 2.3, 5.4, at.y - 1.6, at.y + 1.6, w.material("plain", Color("1a1b1d")))
	_block(at.x + 0.05, at.x + 0.08, 2.4, 5.3, at.y - 1.5, at.y + 1.5, w.material("plain", Color("121314")))
	for y in [2.6, 3.5, 4.4, 5.1]:
		w.rod(Vector3(at.x - 0.3, y, at.y - 1.55), Vector3(at.x - 0.3, y, at.y + 1.55), 0.03, steel)

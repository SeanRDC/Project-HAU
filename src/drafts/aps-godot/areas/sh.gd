extends RefCounted
## The Sacred Heart Building (no. 18), from Sean's photos (assets/Sacred  Heart and APS/):
## round its square north of the Covered Court. The west block faces the lane behind the
## APS canteen: grey-beige exposed-aggregate concrete, four storeys of piers and deep
## spandrel bands, dark-framed windows with aircon units, SACRED HEART BUILDING in steel
## letters, a planter of shrubs along its foot, and at its north end a recessed bay with a
## breeze-block screen. A covered bridge crosses the lane to APS at the third floor, and a
## gate closes the lane past it. Along the block's south side, between it and the court, the
## covered walkway: a curved amber roof on a steel truss, lady palms along the wall, a
## concrete path, teal steel picnic tables on red pavers, white pillars and black iron bars
## along the court. It opens into the square: dark herringbone pavers grown over with moss
## and weeds, maroon bands across them, the fountain with the statue of the Sacred Heart on
## its pedestal (a lion's head on its face), navy twin-lantern lampposts, trees and palms,
## and round it the north block's open galleries (SACRED HEART BUILDING on its top
## parapet), the west block's back and the white east wing with its blue glass stair.
##
## World coordinates (metres, Y up), on the plan's plot (campus_plan.gd "sh"): every face
## is square to x or z.

## The west block (its front on the lane at x WEST_X), the north block (its galleried
## face on the square at z NORTH_Z), the east wing (its face on the square at x EAST_X).
const WEST := Rect2(51.2, -7.6, 21.7, 24.6)
const WEST_X := 51.2
const NOTCH := Rect2(64.6, -7.6, 8.3, 6.3) # the square's corner cut into the west block
const NORTH := Rect2(54.4, -24.4, 50.8, 18.5)
const NORTH_Z := -5.9
const EAST := Rect2(94.1, -8.6, 13.8, 15.2)
const EAST_X := 94.1
## Storeys: a tall ground floor, then three; the roof and its parapet.
const GROUND := 3.6
const STOREY := 3.3
const FLOORS := 4
const ROOF := GROUND + (FLOORS - 1) * STOREY
## The planter along the west block's front, its height.
const PLANTER := Vector2(50.35, WEST_X)
const PLANTER_Y := 0.45
## The covered walkway along the west block's south side: the wall's z, the planter's back
## edge, the path's and the tables' strips, the fence along the court, its floor's height.
const WALK := Rect2(WEST_X, 17.0, 72.9 - WEST_X, 4.3)
const WALK_PLANTER := 17.8
const WALK_PATH := 19.3
const FENCE_Z := 21.15
const WALK_Y := 0.08
const WALK_TABLES: Array[float] = [55.5, 59.0, 62.5, 66.0, 69.5]
const WALK_TABLE_Z := 20.2
## The walkway's roof (its own node, faded while the student is under it).
const WALK_ROOF := "SacredHeartWalkRoof"
## The square: from the west block's back to the east wing, the north block to the fence.
const SQUARE := Rect2(72.9, NORTH_Z, EAST_X - 72.9, FENCE_Z - NORTH_Z)
const SQUARE_Y := 0.05
## The fountain (the basin's middle and half size), the pedestal, the statue on it.
const FOUNTAIN := Vector2(83.5, 5.5)
const BASIN := Vector2(2.6, 1.9)
const PEDESTAL := 0.75
## The lampposts, the trees (x, z, height), the palms, the bins along the north block.
const LAMPS: Array[Vector2] = [Vector2(77.0, 1.5), Vector2(90.0, 1.0), Vector2(79.0, 12.5), Vector2(88.5, 13.5), Vector2(83.5, 16.5)]
const TREES: Array[Vector3] = [Vector3(76.0, 8.5, 9.0), Vector3(79.5, -2.0, 8.0), Vector3(90.0, 9.0, 9.5), Vector3(92.0, -2.5, 8.5),
	Vector3(75.0, 16.0, 7.5), Vector3(87.0, -3.2, 7.0)]
const PALMS: Array[Vector2] = [Vector2(85.0, -4.4), Vector2(89.0, -4.4), Vector2(73.8, -3.8)]
const BINS: Array[Vector2] = [Vector2(79.6, -5.3), Vector2(80.25, -5.3), Vector2(80.9, -5.3), Vector2(90.6, -5.3), Vector2(91.25, -5.3)]
## The south strip: shrubs and flowering bushes along the fence, a concrete path in front.
const SOUTH_BED := 19.8
const SOUTH_PATH := 18.4
## The bed along the west block's back (x from..to), along the square's west side.
const BACK_BED := Vector2(72.9, 73.8)
## The covered bridge over the lane to APS (z middle, its width; deck height) and the gate
## across the lane past it.
const BRIDGE := Vector2(-10.5, 2.6)
const BRIDGE_Y := GROUND + STOREY
const GATE_Z := -13.8

static func _in(r: Rect2, x: float, z: float) -> bool:
	return r.has_point(Vector2(x, z))

## Inside the buildings' walls.
static func inside(x: float, z: float) -> bool:
	if _in(WEST, x, z) and not _in(NOTCH, x, z):
		return true
	return _in(NORTH, x, z) or _in(EAST, x, z)

static func in_square(x: float, z: float) -> bool:
	return (_in(SQUARE, x, z) or (_in(NOTCH, x, z) and z >= NORTH_Z)) and not inside(x, z)

static func in_walk(x: float, z: float) -> bool:
	return _in(WALK, x, z) and z < FENCE_Z

static func walkable(x: float, z: float) -> bool:
	return in_walk(x, z) or in_square(x, z)

static func blocked(x: float, z: float) -> bool:
	if inside(x, z):
		return true
	var at := Vector2(x, z)
	if x >= PLANTER.x and x < WEST_X and z > WEST.position.y and z < WEST.end.y:
		return true # the planter along the front
	if absf(z - FENCE_Z) < 0.15 and x > WEST_X and x < EAST_X:
		return true # the fence along the court
	if in_walk(x, z):
		if z < WALK_PLANTER:
			return true
		for table in WALK_TABLES:
			if absf(x - table) < 1.1 and absf(z - WALK_TABLE_Z) < 0.75:
				return true
		return x < WEST_X + 0.7 and (absf(z - 17.3) < 0.3 or absf(z - WALK_PATH) < 0.2) # the gate's pillars
	if not in_square(x, z):
		return false
	if z > SOUTH_BED or (x < BACK_BED.y and z > -1.3):
		return true # the beds along the fence and the west block's back
	var d := (at - FOUNTAIN).abs()
	if d.x < BASIN.x + 0.1 and d.y < BASIN.y + 0.1:
		return true
	for lamp in LAMPS:
		if at.distance_to(lamp) < 0.3:
			return true
	for tree in TREES:
		if at.distance_to(Vector2(tree.x, tree.y)) < 0.35:
			return true
	for palm in PALMS:
		if at.distance_to(palm) < 0.3:
			return true
	for bin in BINS:
		if at.distance_to(bin) < 0.35:
			return true
	return false

static func floor_height(x: float, z: float) -> float:
	if in_walk(x, z):
		return WALK_Y
	if in_square(x, z):
		return SQUARE_Y
	return NAN

## 0..1: how far the camera looks at the square or the walkway from the court's side (north),
## with everything south of the fence (the court) cut away.
static func court_cut_for(x: float, z: float) -> float:
	if x < WEST_X - 0.5 or x > EAST_X:
		return 0.0
	return 1.0 - smoothstep(FENCE_Z - 0.6, FENCE_Z + 0.6, z)

var w: RefCounted

func build(world: RefCounted) -> void:
	w = world
	_west_block()
	_north_block()
	_east_wing()
	_bridge()
	_walkway()
	_square()
	_fountain()
	_planting()
	w._flush()
	var saved: Node3D = w.root
	var roof := Node3D.new()
	roof.name = WALK_ROOF
	saved.add_child(roof)
	w.root = roof
	_walk_roof()
	w._flush()
	w.root = saved

func _concrete() -> Material:
	return w.material("concrete", Color("bdb4a3"))

func _floor_y(level: int) -> float:
	return 0.0 if level == 0 else GROUND + (level - 1) * STOREY

## An aircon unit on a face (normal out of it), hung under a window.
func _aircon(at: Vector3, normal: Vector3) -> void:
	var across := Vector3(-normal.z, 0, normal.x).abs()
	w.box(across * 0.75 + Vector3(0, 0.45, 0) + normal.abs() * 0.5, at + normal * 0.25, w.material("plain", Color("dedfdb")))
	w.box(across * 0.6 + Vector3(0, 0.3, 0) + normal.abs() * 0.02, at + normal * 0.51, w.material("plain", Color("9a9d9b")))

## A run of dark-framed windows (glass or brown blinds) across a face, between x/z from..to.
func _window_row(face: float, along_x: bool, from: float, to: float, y: float, height: float, normal: Vector3, panes: int, seed_value: int) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var width := (to - from) / panes
	for i in panes:
		var u := from + width * (i + 0.5)
		var at := Vector3(u, y, face) if along_x else Vector3(face, y, u)
		w.framed_window(at, width - 0.12, height, normal, random.randf() < 0.25, 1, Color("3a3d3e"))
		if random.randf() < 0.18:
			var blind: Material = w.material("plain", Color("7a5a3c"))
			var across := Vector3(-normal.z, 0, normal.x).abs()
			w.box(across * (width - 0.2) + Vector3(0, height * 0.7, 0) + normal.abs() * 0.02, at + normal * 0.03 + Vector3(0, height * 0.12, 0), blind)

## The west block: its front on the lane (piers, spandrels, windows, aircons, the name,
## the recessed north bay with its screen), its south wall along the walkway, its back on
## the square, the roof's slab and parapet.
func _west_block() -> void:
	var wall := _concrete()
	var band: Material = w.material("concrete", Color("c7bfaf"))
	var depth := WEST.size.x
	var middle := WEST.get_center()
	# The body, in two parts round the square's corner.
	w.box(Vector3(depth, ROOF, WEST.end.y - NOTCH.end.y), Vector3(middle.x, ROOF / 2.0, (NOTCH.end.y + WEST.end.y) / 2.0), wall)
	w.box(Vector3(NOTCH.position.x - WEST.position.x, ROOF, NOTCH.end.y - WEST.position.y), Vector3((WEST.position.x + NOTCH.position.x) / 2.0, ROOF / 2.0, (WEST.position.y + NOTCH.end.y) / 2.0), wall)
	# The roof slab with its overhang and the parapet.
	w.box(Vector3(depth + 1.0, 0.35, WEST.size.y + 1.0), Vector3(middle.x, ROOF + 0.18, middle.y), band)
	w.box(Vector3(0.25, 0.9, WEST.size.y + 1.0), Vector3(WEST_X - 0.4, ROOF + 0.8, middle.y), band)
	# The front: the recessed north bay (z -7.6..1.4), then the main face in bays between piers.
	var out := Vector3(-1, 0, 0)
	var face := WEST_X - 0.02
	var bay_from := 1.4
	var piers: Array[float] = [bay_from, 5.4, 9.3, 13.2, WEST.end.y - 0.3]
	for z in piers:
		w.box(Vector3(0.55, ROOF + 0.2, 0.55), Vector3(WEST_X - 0.27, (ROOF + 0.2) / 2.0, z), band)
	for level in FLOORS:
		var y := _floor_y(level)
		var top := y + (GROUND if level == 0 else STOREY)
		# The spandrel band at each floor, standing out from the face.
		if level > 0:
			w.box(Vector3(0.4, 0.95, WEST.end.y - bay_from), Vector3(WEST_X - 0.2, y + 0.3, (bay_from + WEST.end.y) / 2.0), band)
		for i in piers.size() - 1:
			var from: float = piers[i] + 0.3
			var to: float = piers[i + 1] - 0.3
			if level == 0:
				_window_row(face, false, from, to, 1.55, 1.9, out, 3, 1810 + i)
				continue
			_window_row(face, false, from, to, y + 1.75, 1.35, out, 3, 1820 + level * 7 + i)
			if (i + level) % 2 == 0:
				_aircon(Vector3(face, y + 1.35, (from + to) / 2.0 - 0.6), out)
		# The recessed bay: a deeper face with wide windows, its slab edge.
		w.box(Vector3(0.5, 0.25, bay_from - WEST.position.y), Vector3(WEST_X - 0.1, top - 0.12, (WEST.position.y + bay_from) / 2.0), band)
		if level > 0:
			_window_row(WEST_X + 0.6, false, WEST.position.y + 0.8, bay_from - 0.8, y + 1.6, 1.2, out, 2, 1840 + level)
	# The breeze-block screen at the foot of the recessed bay, and a drainpipe.
	var screen: Material = w.material("plain", Color("d8d1c2"))
	for k in 12:
		w.box(Vector3(0.12, 0.28, 0.32), Vector3(WEST_X + 0.55, 0.9 + (k % 2) * 0.3, WEST.position.y + 1.2 + floorf(k / 2.0) * 0.55), screen)
	w.rod(Vector3(WEST_X - 0.6, 0.0, bay_from - 0.2), Vector3(WEST_X - 0.6, ROOF, bay_from - 0.2), 0.06, Color("e7e7e2"))
	var name_plate: Label3D = w.panel("SACRED HEART BUILDING", Vector3(WEST_X - 0.72, _floor_y(3) + 0.3, 9.6), 9.0, 0.55, Color("e8e9e6"))
	name_plate.rotation.y = -PI / 2.0
	name_plate.name = "SACRED HEART BUILDING"
	# The south wall along the walkway: plain at the ground, windows above, a pipe.
	var south := WEST.end.y + 0.02
	for level in range(1, FLOORS):
		var y := _floor_y(level)
		w.box(Vector3(depth - 0.2, 0.3, 0.35), Vector3(middle.x, y + 0.15, WEST.end.y + 0.17), band)
		_window_row(south, true, WEST_X + 1.0, WEST.end.x - 1.0, y + 1.7, 1.25, Vector3(0, 0, 1), 6, 1860 + level)
	w.rod(Vector3(WEST_X + 3.0, 0.0, south + 0.15), Vector3(WEST_X + 3.0, ROOF, south + 0.15), 0.05, Color("7b8083"))
	# The back on the square: cream bands, windows with blinds and aircons over a dark glazed
	# ground floor.
	var back := WEST.end.x + 0.02
	var cream: Material = w.material("concrete", Color("d9cfb6"))
	for level in FLOORS:
		var y := _floor_y(level)
		if level > 0:
			w.box(Vector3(0.3, 0.6, WEST.end.y - NOTCH.end.y), Vector3(back + 0.15, y + 0.2, (NOTCH.end.y + WEST.end.y) / 2.0), cream)
		_window_row(back, false, NOTCH.end.y + 0.6, WEST.end.y - 0.6, (1.5 if level == 0 else y + 1.7), (1.9 if level == 0 else 1.35), Vector3(1, 0, 0), 5, 1870 + level)
		if level > 0:
			for k in 3:
				_aircon(Vector3(back, y + 2.75, NOTCH.end.y + 2.5 + k * 5.5), Vector3(1, 0, 0))
	for z in [NOTCH.end.y + 0.2, WEST.end.y - 0.2]:
		w.box(Vector3(0.45, ROOF, 0.45), Vector3(back + 0.2, ROOF / 2.0, z), cream)

## The north block's face on the square: the ground floor's cream wall with doors, boards
## and windows, three open galleries over it behind cream parapets and columns, the name on
## the top parapet, the roof slab.
func _north_block() -> void:
	var body: Material = w.material("concrete", Color("d6cfbf"))
	var cream: Material = w.material("concrete", Color("e3dccb"))
	var shade: Material = w.material("plain", Color("6a6c69"))
	var middle := NORTH.get_center()
	var front := NORTH_Z
	var recess := 2.4
	# The body behind the galleries, and the gallery floors' slabs out to the face.
	w.box(Vector3(NORTH.size.x, ROOF, NORTH.size.y - recess), Vector3(middle.x, ROOF / 2.0, (NORTH.position.y + front - recess) / 2.0), body)
	w.box(Vector3(NORTH.size.x, GROUND, recess), Vector3(middle.x, GROUND / 2.0, front - recess / 2.0), body)
	var from := NOTCH.position.x
	var to := EAST_X
	var span := to - from
	var mid := (from + to) / 2.0
	for level in range(1, FLOORS + 1):
		var y := _floor_y(level) if level < FLOORS else ROOF
		w.box(Vector3(span, 0.3, recess + 0.3), Vector3(mid, y + 0.15, front - recess / 2.0 + 0.15), cream)
		if level < FLOORS:
			# The parapet along the gallery, and the dark corridor wall behind with its doors.
			w.box(Vector3(span, 1.05, 0.22), Vector3(mid, y + 0.82, front + 0.1), cream)
			w.box(Vector3(span, STOREY - 0.3, 0.05), Vector3(mid, y + STOREY / 2.0 + 0.15, front - recess + 0.03), shade)
			var door := from + 2.0
			while door < to - 1.0:
				w.box(Vector3(1.0, 2.1, 0.04), Vector3(door, y + 1.35, front - recess + 0.07), w.material("plain", Color("4e5a63")))
				w.box(Vector3(2.4, 0.9, 0.04), Vector3(door + 2.0, y + 2.1, front - recess + 0.07), w.material("glass", Color("55626b")))
				door += 6.0
	# The columns at the face, every 4.5 m, up through the galleries.
	var x := from + 0.3
	while x <= to - 0.2:
		w.box(Vector3(0.45, ROOF, 0.45), Vector3(x, ROOF / 2.0, front + 0.05), cream)
		x += 4.5
	w.box(Vector3(span, 0.9, 0.3), Vector3(mid, ROOF + 0.6, front + 0.1), cream) # the roof's parapet
	# The ground floor: the cream wall with grey-blue doors, notice boards and dark windows.
	var wall := front + 0.02
	var plain: Material = w.material("plain", Color("efe8d6"))
	w.box(Vector3(span, GROUND - 0.3, 0.04), Vector3(mid, (GROUND - 0.3) / 2.0, wall), plain)
	w.box(Vector3(span, 0.25, 0.06), Vector3(mid, 0.12, wall + 0.02), w.material("plain", Color("3e4a5a")))
	var k := 0
	x = from + 2.0
	while x < to - 1.5:
		match k % 3:
			0:
				w.box(Vector3(1.1, 2.2, 0.05), Vector3(x, 1.1, wall + 0.03), w.material("plain", Color("5d6c7a")))
			1:
				# A notice board in a brown frame.
				w.box(Vector3(2.6, 1.2, 0.06), Vector3(x, 1.55, wall + 0.03), w.material("plain", Color("7a4a30")))
				w.box(Vector3(2.4, 1.0, 0.06), Vector3(x, 1.55, wall + 0.05), w.material("plain", Color("c9c2ae")))
				for p in 4:
					w.box(Vector3(0.4, 0.5, 0.02), Vector3(x - 0.9 + p * 0.6, 1.55, wall + 0.09), w.material("plain", [Color("e9e4d6"), Color("4b6fa0"), Color("d9c76a"), Color("e7e7e2")][p]))
			2:
				w.framed_window(Vector3(x, 1.6, wall), 2.2, 1.2, Vector3(0, 0, 1), false, 2, Color("6b4a34"))
		x += 3.2
		k += 1
	var name_plate: Label3D = w.panel("SACRED HEART BUILDING", Vector3(mid - 3.0, ROOF - STOREY + 0.85, front + 0.23), 8.0, 0.5, Color("d9dcdc"))
	name_plate.name = "SH SQUARE NAME"
	var sign: Label3D = w.panel("NO LITTERING", Vector3(mid + 6.0, _floor_y(1) + 2.6, front - recess + 0.1), 1.0, 0.25, Color("b8302a"), Color("efe8d6"))
	sign.name = "SH NO LITTERING"

## The east wing's face on the square: white floor bands over blue windows, a breeze-block
## grille along the ground floor, aircons and red pipes, the blue glass stair at its north end.
func _east_wing() -> void:
	var white: Material = w.material("stucco", Color("f1f1ec"))
	var top := ROOF + STOREY
	var middle := EAST.get_center()
	w.box(Vector3(EAST.size.x, top, EAST.size.y), Vector3(middle.x, top / 2.0, middle.y), white)
	var face := EAST_X - 0.02
	var stair := Vector2(EAST.position.y, EAST.position.y + 3.4)
	for level in FLOORS + 1:
		var y := _floor_y(level) if level < FLOORS else ROOF
		w.box(Vector3(0.9, 0.85, EAST.size.y - (stair.y - stair.x)), Vector3(EAST_X - 0.45, y + 0.45, (stair.y + EAST.end.y) / 2.0), white)
		if level == 0:
			# The grille of breeze blocks over the ground floor's windows.
			var grille: Material = w.material("plain", Color("aeb4b8"))
			var z := stair.y + 0.5
			while z < EAST.end.y - 0.4:
				w.box(Vector3(0.1, 0.9, 0.35), Vector3(face - 0.05, 2.5, z), grille)
				z += 0.45
			_window_row(face, false, stair.y + 0.5, EAST.end.y - 0.5, 1.2, 1.2, Vector3(-1, 0, 0), 4, 1880)
			continue
		w.box(Vector3(0.3, 1.0, EAST.size.y - (stair.y - stair.x)), Vector3(EAST_X - 0.1, y + 1.4, (stair.y + EAST.end.y) / 2.0), w.material("plain", Color("c9ced2")))
		_window_row(face - 0.9, false, stair.y + 0.8, EAST.end.y - 0.8, y + 2.25, 1.2, Vector3(-1, 0, 0), 3, 1890 + level)
		_aircon(Vector3(face - 0.9, y + 1.25, EAST.end.y - 2.0), Vector3(-1, 0, 0))
	w.rod(Vector3(face - 0.95, 0.0, stair.y + 0.4), Vector3(face - 0.95, top, stair.y + 0.4), 0.05, Color("a5442f"))
	# The stair's blue glass, in a grid of dark mullions, over a grey panelled foot.
	var glass: Material = w.material("glass", Color("2f4f9a"))
	w.box(Vector3(0.1, top - GROUND, stair.y - stair.x), Vector3(face - 0.6, (top + GROUND) / 2.0, (stair.x + stair.y) / 2.0), glass)
	w.box(Vector3(0.1, GROUND, stair.y - stair.x), Vector3(face - 0.6, GROUND / 2.0, (stair.x + stair.y) / 2.0), w.material("plain", Color("8f9396")))
	var frame: Material = w.material("plain", Color("26292c"))
	var y := GROUND
	while y < top:
		w.box(Vector3(0.12, 0.06, stair.y - stair.x), Vector3(face - 0.62, y, (stair.x + stair.y) / 2.0), frame)
		y += 1.0
	for z in [stair.x + 1.1, stair.x + 2.3]:
		w.box(Vector3(0.12, top - GROUND, 0.06), Vector3(face - 0.62, (top + GROUND) / 2.0, z), frame)
	w.box(Vector3(EAST.size.x + 0.4, 0.4, EAST.size.y + 0.4), Vector3(middle.x, top + 0.2, middle.y), white)

## The covered bridge over the lane at the third floor: a concrete deck and parapets, steel
## posts, a shallow truss under a ribbed roof; and the pale green gate across the lane past it.
func _bridge() -> void:
	var concrete: Material = w.material("concrete", Color("d8d5cc"))
	var from := 46.7
	var to := NORTH.position.x
	var length := to - from
	var mid := (from + to) / 2.0
	w.box(Vector3(length, 0.45, BRIDGE.y), Vector3(mid, BRIDGE_Y - 0.22, BRIDGE.x), concrete)
	for side in [-1.0, 1.0]:
		w.box(Vector3(length, 1.0, 0.15), Vector3(mid, BRIDGE_Y + 0.5, BRIDGE.x + side * (BRIDGE.y / 2.0 - 0.08)), concrete)
		var x := from + 0.3
		while x <= to - 0.2:
			w.rod(Vector3(x, BRIDGE_Y + 1.0, BRIDGE.x + side * (BRIDGE.y / 2.0 - 0.1)), Vector3(x, BRIDGE_Y + 2.9, BRIDGE.x + side * (BRIDGE.y / 2.0 - 0.1)), 0.04, Color("5b6063"))
			x += 1.4
	var truss := from
	while truss < to - 0.01:
		w.rod(Vector3(truss, BRIDGE_Y + 2.9, BRIDGE.x - 1.2), Vector3(truss + 0.7, BRIDGE_Y + 3.3, BRIDGE.x), 0.025, Color("5b6063"))
		w.rod(Vector3(truss + 0.7, BRIDGE_Y + 3.3, BRIDGE.x), Vector3(truss + 1.4, BRIDGE_Y + 2.9, BRIDGE.x + 1.2), 0.025, Color("5b6063"))
		truss += 1.4
	w.box(Vector3(length + 0.4, 0.06, BRIDGE.y + 0.6), Vector3(mid, BRIDGE_Y + 3.4, BRIDGE.x), w.material("ribbed", Color("9ba1a3")))
	# The gate: pale green panels between posts, a yellow sign on it.
	var gate: Material = w.material("ribbed", Color("b9cfc0"))
	w.box(Vector3(to - from, 1.9, 0.08), Vector3(mid, 0.95, GATE_Z), gate)
	var x := from
	while x <= to + 0.01:
		w.box(Vector3(0.12, 2.1, 0.12), Vector3(x, 1.05, GATE_Z), w.material("plain", Color("6f7a73")))
		x += 2.6
	w.box(Vector3(0.5, 0.5, 0.03), Vector3(mid, 1.1, GATE_Z + 0.06), w.material("plain", Color("e1c22c")))

## The covered walkway's ground: the planter of lady palms in orange-edged boxes along the
## wall, the concrete path, red pavers under the teal tables, the fence along the court, the
## gate's white pillars at the lane end.
func _walkway() -> void:
	var length := WALK.size.x
	var mid := WALK.get_center().x
	w.box(Vector3(length, 0.3, WALK_PLANTER - WALK.position.y), Vector3(mid, 0.15, (WALK.position.y + WALK_PLANTER) / 2.0), w.material("dirt", Color("6d5a45")))
	w.box(Vector3(length, WALK_Y + 0.12, WALK_PATH - WALK_PLANTER), Vector3(mid, (WALK_Y - 0.12) / 2.0, (WALK_PLANTER + WALK_PATH) / 2.0), w.material("concrete", Color("b9b2a3")))
	w.box(Vector3(length, WALK_Y + 0.12, FENCE_Z - WALK_PATH), Vector3(mid, (WALK_Y - 0.12) / 2.0, (WALK_PATH + FENCE_Z) / 2.0), w.material("octagon", Color("c58a72")))
	var orange: Material = w.material("plain", Color("d4692f"))
	var x := WEST_X + 2.0
	while x < WALK.end.x:
		w.box(Vector3(0.35, 0.7, 0.35), Vector3(x, 0.35, WALK_PLANTER - 0.25), orange)
		x += 4.0
	for table in WALK_TABLES:
		_table(Vector2(table, WALK_TABLE_Z))
	_fence(WEST_X + 0.4, EAST_X)
	# The gate's pillars at the lane end, a leaf swung open against the wall.
	var white: Material = w.material("stucco", Color("efece4"))
	for z in [17.3, WALK_PATH, FENCE_Z]:
		w.box(Vector3(0.4, 2.4, 0.4), Vector3(WEST_X + 0.35, 1.2, z), white)
		w.box(Vector3(0.5, 0.15, 0.5), Vector3(WEST_X + 0.35, 2.45, z), white)
	for bar in 6:
		w.rod(Vector3(WEST_X + 0.6 + bar * 0.15, 0.1, WALK_PATH - 0.15), Vector3(WEST_X + 0.6 + bar * 0.15, 2.0, WALK_PATH - 0.15), 0.015, Color("1d1f20"))

## A teal steel picnic table with its two benches, along x.
func _table(at: Vector2) -> void:
	var teal: Material = w.material("plain", Color("6fa3a0"))
	var top: Material = w.material("metal", Color("b8c4bf"))
	var y := WALK_Y
	w.box(Vector3(2.0, 0.05, 0.75), Vector3(at.x, y + 0.75, at.y), top)
	for side in [-1.0, 1.0]:
		w.box(Vector3(2.0, 0.05, 0.28), Vector3(at.x, y + 0.45, at.y + side * 0.62), teal)
		for dx in [-0.85, 0.85]:
			w.box(Vector3(0.05, 0.45, 0.05), Vector3(at.x + dx, y + 0.22, at.y + side * 0.62), teal)
	for dx in [-0.8, 0.8]:
		w.rod(Vector3(at.x + dx, y, at.y - 0.3), Vector3(at.x + dx, y + 0.75, at.y + 0.3), 0.025, Color("6fa3a0"))
		w.rod(Vector3(at.x + dx, y, at.y + 0.3), Vector3(at.x + dx, y + 0.75, at.y - 0.3), 0.025, Color("6fa3a0"))
		w.box(Vector3(0.05, 0.05, 1.5), Vector3(at.x + dx, y + 0.2, at.y), teal)

## The fence along the court: a low white wall, white pillars with caps every 3 m, black
## iron bars between them.
func _fence(from: float, to: float) -> void:
	var white: Material = w.material("stucco", Color("ecebe4"))
	var length := to - from
	w.box(Vector3(length, 0.55, 0.25), Vector3((from + to) / 2.0, 0.27, FENCE_Z), white)
	var x := from
	while x <= to + 0.01:
		w.box(Vector3(0.35, 1.9, 0.35), Vector3(x, 0.95, FENCE_Z), white)
		w.box(Vector3(0.45, 0.14, 0.45), Vector3(x, 1.95, FENCE_Z), white)
		x += 3.0
	var iron := Color("1f2122")
	for y in [0.75, 1.65]:
		w.rod(Vector3(from, y, FENCE_Z), Vector3(to, y, FENCE_Z), 0.02, iron)
	x = from + 0.2
	while x < to:
		w.box(Vector3(0.025, 1.15, 0.025), Vector3(x, 1.12, FENCE_Z), w.material("plain", iron))
		x += 0.14

## The walkway's curved roof: amber translucent sheet bent over in strips, on a steel truss
## along the fence and brackets from the wall; tube lights under it.
func _walk_roof() -> void:
	var sheet := (w.material("plain", Color("e6d3a4")) as StandardMaterial3D).duplicate() as StandardMaterial3D
	sheet.cull_mode = BaseMaterial3D.CULL_DISABLED
	var steel := Color("5d6266")
	var length := WALK.size.x + 0.6
	var mid := WALK.get_center().x
	var a := Vector2(WALK.position.y + 0.1, 3.5) # (z, y) at the wall
	var b := Vector2(FENCE_Z + 0.45, 2.9) # at the fence
	var points: Array[Vector2] = []
	for i in 9:
		var t := i / 8.0
		var p := a.lerp(b, t)
		points.append(Vector2(p.x, p.y + sin(t * PI) * 0.55))
	for i in points.size() - 1:
		var p := points[i]
		var q := points[i + 1]
		var tilt := atan2(q.y - p.y, q.x - p.x)
		w.box(Vector3(length, 0.03, p.distance_to(q) + 0.02), Vector3(mid, (p.y + q.y) / 2.0, (p.x + q.x) / 2.0), sheet, 0.0, -tilt)
	# The arched ribs every 1.5 m, the truss along the fence, brackets to the wall.
	var x := WALK.position.x + 0.3
	while x < WALK.end.x:
		for i in points.size() - 1:
			w.rod(Vector3(x, points[i].y - 0.05, points[i].x), Vector3(x, points[i + 1].y - 0.05, points[i + 1].x), 0.02, steel)
		w.rod(Vector3(x, a.y - 0.05, a.x), Vector3(x, a.y - 0.6, WALK.position.y + 0.02), 0.03, steel)
		x += 1.5
	for y in [b.y - 0.1, b.y - 0.55]:
		w.rod(Vector3(WALK.position.x, y, FENCE_Z), Vector3(WALK.end.x, y, FENCE_Z), 0.04, steel)
	x = WALK.position.x
	while x < WALK.end.x - 0.4:
		w.rod(Vector3(x, b.y - 0.55, FENCE_Z), Vector3(x + 0.5, b.y - 0.1, FENCE_Z), 0.02, steel)
		w.rod(Vector3(x + 0.5, b.y - 0.1, FENCE_Z), Vector3(x + 1.0, b.y - 0.55, FENCE_Z), 0.02, steel)
		x += 1.0
	x = WALK.position.x + 3.0
	while x < WALK.end.x:
		w.rod(Vector3(x, 1.95, FENCE_Z), Vector3(x, b.y - 0.55, FENCE_Z), 0.05, steel)
		x += 3.0
	var tube: Material = w.glow(Color("eef2ee"), 0.1, 2.0)
	x = WALK.position.x + 4.0
	while x < WALK.end.x:
		w.box(Vector3(1.2, 0.05, 0.08), Vector3(x, 3.35, (WALK.position.y + FENCE_Z) / 2.0), tube)
		x += 6.0

## The square's ground: herringbone pavers over it all, maroon bands, the south path and the
## beds; moss and weeds come with the grass.
func _square() -> void:
	var floor_mat: Material = w.material("herringbone")
	var rim := PackedVector2Array([Vector2(NOTCH.position.x, NORTH_Z), Vector2(EAST_X, NORTH_Z), Vector2(EAST_X, SOUTH_BED),
		Vector2(BACK_BED.y, SOUTH_BED), Vector2(BACK_BED.y, NOTCH.end.y), Vector2(NOTCH.position.x, NOTCH.end.y)])
	var triangles := PackedVector2Array()
	for k in Geometry2D.triangulate_polygon(rim):
		triangles.append(rim[k])
	w._ground(triangles, SQUARE_Y, floor_mat)
	w.box(Vector3(EAST_X - NOTCH.position.x, 0.25, SOUTH_BED - NORTH_Z), Vector3((NOTCH.position.x + EAST_X) / 2.0, SQUARE_Y - 0.13, (NORTH_Z + SOUTH_BED) / 2.0), w.material("concrete", Color("6a675f")))
	var maroon: Material = w.material("plain", Color("6e3a3a"))
	for band in [[Vector2(BACK_BED.y, 10.2), Vector2(EAST_X, 10.2)], [Vector2(81.0, NORTH_Z), Vector2(81.0, SOUTH_PATH)]]:
		var p: Vector2 = band[0]
		var q: Vector2 = band[1]
		w.box(Vector3(maxf(q.x - p.x, 0.45), 0.01, maxf(q.y - p.y, 0.45)), Vector3((p.x + q.x) / 2.0, SQUARE_Y + 0.005, (p.y + q.y) / 2.0), maroon)
	w.box(Vector3(EAST_X - BACK_BED.y, 0.04, SOUTH_BED - SOUTH_PATH), Vector3((BACK_BED.y + EAST_X) / 2.0, SQUARE_Y + 0.02, (SOUTH_PATH + SOUTH_BED) / 2.0), w.material("concrete", Color("8d8a80")))
	# The beds: along the fence and along the west block's back, a low kerb at their edge.
	var dirt: Material = w.material("dirt", Color("5f5240"))
	w.box(Vector3(EAST_X - WEST_X, 0.25, FENCE_Z - SOUTH_BED), Vector3((WEST_X + EAST_X) / 2.0 + (BACK_BED.y - WEST_X) / 2.0, 0.12, (SOUTH_BED + FENCE_Z) / 2.0), dirt)
	w.box(Vector3(BACK_BED.y - BACK_BED.x, 0.35, SOUTH_BED - NOTCH.end.y), Vector3((BACK_BED.x + BACK_BED.y) / 2.0, 0.17, (NOTCH.end.y + SOUTH_BED) / 2.0), dirt)
	var kerb: Material = w.material("concrete", Color("a9a59a"))
	w.box(Vector3(EAST_X - BACK_BED.y, 0.3, 0.14), Vector3((BACK_BED.y + EAST_X) / 2.0, 0.15, SOUTH_BED), kerb)
	w.box(Vector3(0.14, 0.4, SOUTH_BED - NOTCH.end.y), Vector3(BACK_BED.y, 0.2, (NOTCH.end.y + SOUTH_BED) / 2.0), kerb)

## The fountain: a brick basin with a white rim, its water, the square pedestal with the lion's
## head and a little spout, and the statue of the Sacred Heart on it, facing the court.
func _fountain() -> void:
	var at := FOUNTAIN
	var brick: Material = w.material("brick", Color("8a6a55"))
	var white: Material = w.material("concrete", Color("e9e6dc"))
	for side in [-1.0, 1.0]:
		w.box(Vector3(BASIN.x * 2.0, 0.55, 0.3), Vector3(at.x, 0.28, at.y + side * (BASIN.y - 0.15)), brick)
		w.box(Vector3(0.3, 0.55, BASIN.y * 2.0), Vector3(at.x + side * (BASIN.x - 0.15), 0.28, at.y), brick)
		w.box(Vector3(BASIN.x * 2.0 + 0.1, 0.12, 0.4), Vector3(at.x, 0.6, at.y + side * (BASIN.y - 0.15)), white)
		w.box(Vector3(0.4, 0.12, BASIN.y * 2.0 + 0.1), Vector3(at.x + side * (BASIN.x - 0.15), 0.6, at.y), white)
		# The inner wall, a white face standing up behind the rim.
		w.box(Vector3(BASIN.x * 2.0 - 0.6, 0.6, 0.12), Vector3(at.x, 0.9, at.y + side * (BASIN.y - 0.4)), white)
		w.box(Vector3(0.12, 0.6, BASIN.y * 2.0 - 0.6), Vector3(at.x + side * (BASIN.x - 0.4), 0.9, at.y), white)
	var water := (w.material("glass", Color("6d8a8c")) as StandardMaterial3D)
	w.box(Vector3(BASIN.x * 2.0 - 0.6, 0.04, BASIN.y * 2.0 - 0.6), Vector3(at.x, 0.42, at.y), water)
	var stone: Material = w.material("concrete", Color("dcd8cc"))
	w.box(Vector3(PEDESTAL * 2.0, 1.9, PEDESTAL * 2.0), Vector3(at.x, 0.95 + 0.4, at.y), stone)
	w.box(Vector3(PEDESTAL * 2.0 + 0.25, 0.22, PEDESTAL * 2.0 + 0.25), Vector3(at.x, 2.45, at.y), stone)
	w.box(Vector3(PEDESTAL * 2.0 + 0.15, 0.15, PEDESTAL * 2.0 + 0.15), Vector3(at.x, 0.47, at.y), stone)
	# The panel and the lion's head on its face (toward the court).
	var face := at.y + PEDESTAL + 0.02
	w.box(Vector3(1.1, 1.1, 0.04), Vector3(at.x, 1.45, face), w.material("concrete", Color("cfcabd")))
	var lion := SphereMesh.new()
	lion.radius = 0.2
	lion.height = 0.34
	w._mesh(lion, Vector3(at.x, 1.4, face + 0.08), w.material("concrete", Color("bdb6a5")))
	w.rod(Vector3(at.x, 1.25, face + 0.12), Vector3(at.x, 1.18, face + 0.35), 0.02, Color("5b5b55"))
	# The flowers in pots at the statue's feet.
	var dried: Array[Color] = [Color("c9a86a"), Color("e0c58a"), Color("a88a55"), Color("b89a63"), Color("d9b779")]
	for dx in [-0.45, 0.45]:
		w._shrub(Vector3(at.x + dx, 2.56, at.y + 0.5), 0.45, 1890 + roundi(dx * 10.0), dried)
	_statue(Vector3(at.x, 2.56, at.y))

## The Sacred Heart: a blue-white cloud at his feet, a long white robe and a red mantle over
## the shoulders, the gold sash, the red heart on his chest, his right hand raised in blessing
## and his left held out, long dark hair; facing +z, the court.
func _statue(foot: Vector3) -> void:
	var white: Material = w.material("plain", Color("f2efe8"))
	var red: Material = w.material("plain", Color("b23a32"))
	var skin: Material = w.material("plain", Color("d9b49a"))
	var hair: Material = w.material("plain", Color("2a211c"))
	var cloud := CylinderMesh.new()
	cloud.top_radius = 0.42
	cloud.bottom_radius = 0.5
	cloud.height = 0.3
	cloud.radial_segments = 10
	w._mesh(cloud, foot + Vector3(0, 0.15, 0), w.material("plain", Color("9fc3dc")))
	var robe := CylinderMesh.new()
	robe.top_radius = 0.2
	robe.bottom_radius = 0.36
	robe.height = 1.5
	robe.radial_segments = 12
	w._mesh(robe, foot + Vector3(0, 0.3 + 0.75, 0), white)
	# The mantle: a red cloak over his back, falling to his knees, open in front.
	w.box(Vector3(0.62, 1.3, 0.12), foot + Vector3(0, 1.25, -0.2), red)
	for side in [-1.0, 1.0]:
		w.box(Vector3(0.12, 1.1, 0.34), foot + Vector3(side * 0.3, 1.35, -0.05), red)
	w.box(Vector3(0.5, 0.06, 0.4), foot + Vector3(0, 1.5, 0.02), w.material("plain", Color("c9a53e")))
	w.box(Vector3(0.14, 0.14, 0.04), foot + Vector3(0, 1.7, 0.2), w.material("plain", Color("d43a2a")))
	var head := SphereMesh.new()
	head.radius = 0.13
	head.height = 0.28
	w._mesh(head, foot + Vector3(0, 2.05, 0.02), skin)
	w.box(Vector3(0.3, 0.42, 0.14), foot + Vector3(0, 1.92, -0.08), hair)
	w.box(Vector3(0.12, 0.1, 0.06), foot + Vector3(0, 1.96, 0.14), hair) # the beard
	# The arms: the right raised from the elbow, the left held out and down.
	w.box(Vector3(0.12, 0.42, 0.12), foot + Vector3(-0.36, 1.68, 0.05), white)
	w.box(Vector3(0.1, 0.36, 0.1), foot + Vector3(-0.42, 2.0, 0.08), white)
	w.box(Vector3(0.1, 0.14, 0.06), foot + Vector3(-0.42, 2.24, 0.1), skin)
	w.box(Vector3(0.12, 0.4, 0.12), foot + Vector3(0.36, 1.62, 0.1), white, 0.0, -0.5)
	w.box(Vector3(0.1, 0.12, 0.06), foot + Vector3(0.44, 1.42, 0.3), skin)

## The trees, palms and papaya, the lampposts, the bins, the shrubs in the beds.
func _planting() -> void:
	for i in TREES.size():
		var tree := TREES[i]
		w._tree(Vector3(tree.x, SQUARE_Y, tree.y), tree.z, 1900 + i)
	for i in PALMS.size():
		var palm := PALMS[i]
		_palm(Vector3(palm.x, SQUARE_Y, palm.y), 7.5 if i < 2 else 4.0, 1910 + i)
	for lamp in LAMPS:
		_lamppost(lamp)
	var colours: Array[Color] = [Color("2f63b5"), Color("e2c52e"), Color("2f8a4e"), Color("2f63b5"), Color("e2c52e")]
	for i in BINS.size():
		w.box(Vector3(0.55, 0.9, 0.55), Vector3(BINS[i].x, SQUARE_Y + 0.45, BINS[i].y), w.material("plain", colours[i]))
		w.box(Vector3(0.6, 0.06, 0.6), Vector3(BINS[i].x, SQUARE_Y + 0.92, BINS[i].y), w.material("plain", colours[i].darkened(0.25)))
	# Shrubs and red-flowering bushes along the fence, lady palms in the back's bed, a few
	# weedy clumps on the pavers.
	var flowers: Array[Color] = [Color("3f6b2c"), Color("4f7f33"), Color("c8323a"), Color("5d8a3a"), Color("2f5a26")]
	var x := BACK_BED.y + 0.8
	var k := 0
	while x < EAST_X - 0.5:
		w._shrub(Vector3(x, 0.25, (SOUTH_BED + FENCE_Z) / 2.0), 1.5 if k % 2 == 0 else 1.1, 1920 + k, flowers)
		x += 1.6
		k += 1
	var z := NOTCH.end.y + 0.8
	while z < SOUTH_BED - 0.4:
		w._shrub(Vector3((BACK_BED.x + BACK_BED.y) / 2.0, 0.35, z), 1.2, 1950 + roundi(z), w.SHRUB_COLORS)
		z += 1.5
	for spot in [Vector2(85.5, 13.0), Vector2(78.0, 4.0), Vector2(91.0, 15.5)]:
		w._shrub(Vector3(spot.x, SQUARE_Y, spot.y), 0.8, 1960 + roundi(spot.x), w.SHRUB_COLORS)
	# The front's planter along the lane: a kerbed box of shrubs and creepers.
	var kerb: Material = w.material("concrete", Color("a6a194"))
	w.box(Vector3(PLANTER.y - PLANTER.x, PLANTER_Y, WEST.size.y - 1.4), Vector3((PLANTER.x + PLANTER.y) / 2.0, PLANTER_Y / 2.0, (WEST.position.y + 1.4 + WEST.end.y) / 2.0), kerb)
	z = WEST.position.y + 2.0
	while z < WEST.end.y - 0.5:
		w._shrub(Vector3((PLANTER.x + PLANTER.y) / 2.0, PLANTER_Y, z), 1.3, 1970 + roundi(z), w.SHRUB_COLORS)
		z += 1.4
	# Lady palms along the walkway's wall.
	x = WEST_X + 1.0
	while x < WALK.end.x - 0.5:
		_palm(Vector3(x, 0.3, (WALK.position.y + WALK_PLANTER) / 2.0), 1.2, 1990 + roundi(x))
		x += 1.3

## A palm: a thin ringed trunk (none for a lady palm under 2 m) under a crown of fronds.
func _palm(at: Vector3, height: float, seed_value: int) -> void:
	var greens: Array[Color] = [Color("3d6a2a"), Color("4f7f33"), Color("6b9a3c"), Color("88ad4a"), Color("2f5622")]
	var crown := at + Vector3(0, height, 0)
	if height > 2.0:
		w.rod(at, crown, 0.12, Color("8b8172"))
	var fronds: Material = w._leaf_material(seed_value, crown, greens, true)
	var size := clampf(height * 0.45, 0.9, 3.2)
	var cluster: ArrayMesh = w._cards(size * 1.6, size, -size * (0.55 if height > 2.0 else 1.0), 3, false)
	w._mesh(cluster, crown, fronds, seed_value * 0.37).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED

## A navy lamppost with two lanterns on a crossarm.
func _lamppost(at: Vector2) -> void:
	var navy := Color("2a3550")
	w.box(Vector3(0.36, 0.25, 0.36), Vector3(at.x, SQUARE_Y + 0.12, at.y), w.material("plain", navy))
	w.rod(Vector3(at.x, SQUARE_Y, at.y), Vector3(at.x, SQUARE_Y + 3.3, at.y), 0.06, navy)
	w.rod(Vector3(at.x - 0.35, SQUARE_Y + 3.3, at.y), Vector3(at.x + 0.35, SQUARE_Y + 3.3, at.y), 0.03, navy)
	var glass: Material = w.glow(Color("f4e6bd"), 0.15, 2.2)
	for dx in [-0.35, 0.35]:
		w.box(Vector3(0.22, 0.3, 0.22), Vector3(at.x + dx, SQUARE_Y + 3.55, at.y), glass)
		w.box(Vector3(0.28, 0.06, 0.28), Vector3(at.x + dx, SQUARE_Y + 3.73, at.y), w.material("plain", navy))
	w._omni(Vector3(at.x, SQUARE_Y + 3.4, at.y), Color("ffd79d"), 1.2, 9.0)

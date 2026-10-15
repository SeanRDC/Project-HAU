extends RefCounted
## St. Joseph Hall, from the SJH photos, on its plan plot along the south road:
## a nine-storey slab, 96 m long and 19 m deep, its front facing north across the
## parking towards the chapel. Open balcony floors with white slab bands and brown-
## posted railings, teal glass panels in staggered bays, brown pilasters, a glazed
## top floor in terracotta frames, a terracotta block and a set-back cream stair tower
## at both ends, and the centre tower: a silver-clad frame, dark glass bands, the
## ST. JOSEPH HALL sign over the entrance, its canopy and steps. Along the ground
## floor runs a covered walkway under an awning on slanted struts, behind a steel
## railing; walking in cuts away the outside, like the APS hallway. At its right
## (west) end, the Mary statue on her plinth in a grass island; north of the road, the parking.
##
## Built in its own frame under a pivot ("SJH"): local x along the front (+x is west),
## local +z out of the front (north), local z 0 the plot's front edge.

const Chapel := preload("res://areas/chapel.gd")
const Roads := preload("res://roads.gd")

## The plot's front edge (plan outline): east end, west end, set back SETBACK metres
## from it. Mikko's map (2026-10-16) has SJH further from the road than the OSM outline,
## with a second row of parked cars and the Mary statue between it and the road.
const SETBACK := 10.0
const EDGE_EAST := Vector2(36.5, 118.3 + SETBACK)
const EDGE_WEST := Vector2(-59.3, 115.1 + SETBACK)
const HALF := 47.9
const DEPTH := 19.4
## Storeys: a tall ground floor, then eight floors.
const GROUND := 4.2
const STOREY := 3.3
const FLOORS := 8
const ROOF := GROUND + FLOORS * STOREY
## The centre tower's half width; the walkway runs from it to WALK_END on each side,
## where the terracotta end blocks stand.
const TOWER := 9.5
const WALK_END := HALF - 7.4
## The ground-floor walkway: its back wall, the railing line, floor and awning heights.
const WALL_Z := -3.6
const RAIL_Z := 0.05
const WALK_Y := 0.15
const CEILING := 3.55
## Openings in the railing (local x), where the walkway meets the sidewalk.
const GAPS: Array[float] = [-36.0, -20.0, 20.0, 36.0]
## Where the camera cuts inside the walkway: this far in front of the corridor's middle.
const CUT_OFFSET := 1.2
## The parking: one row north of the south road (by the chapel), one south of it in
## front of SJH (world). Cars park nose to the road.
const PARKING := Rect2(-44.0, 97.6, 72.0, 8.6)
const FRONT_ROW := Rect2(-48.0, 115.2, 82.0, 5.4)
## The gap in the front row at the entrance steps (world x).
const ENTRANCE_GAP := Vector2(-18.5, -4.5)
## The Mary statue's grass island at the building's right (west) end, as seen from the
## front: between the cream stair tower and the road's turn up the west road (world).
const ISLAND := Rect2(-57.0, 115.6, 6.0, 7.0)
const MARY := Vector2(-54.0, 119.3)

static func origin() -> Vector2:
	return (EDGE_EAST + EDGE_WEST) / 2.0

## The pivot's turn: local +z onto the front edge's outward (north) normal.
static func angle() -> float:
	var edge := (EDGE_WEST - EDGE_EAST).normalized()
	var outward := Vector2(edge.y, -edge.x)
	if outward.y > 0.0:
		outward = -outward
	return atan2(outward.x, outward.y)

static func local(x: float, z: float) -> Vector2:
	var d := Vector2(x, z) - origin()
	var a := angle()
	return Vector2(cos(a) * d.x - sin(a) * d.y, sin(a) * d.x + cos(a) * d.y)

static func world(lx: float, lz: float) -> Vector2:
	var a := angle()
	return origin() + Vector2(cos(a) * lx + sin(a) * lz, -sin(a) * lx + cos(a) * lz)

static func in_walkway(x: float, z: float) -> bool:
	var at := local(x, z)
	return absf(at.x) < WALK_END and absf(at.x) > TOWER + 0.2 and at.y > WALL_Z + 0.25 and at.y < RAIL_Z + 0.2

## 0 outside, 1 inside the covered walkway: drives the camera's cutaway.
static func walkway_for(x: float, z: float) -> float:
	var at := local(x, z)
	var depth := 1.0 - smoothstep(-1.1, 0.0, at.y)
	var along := (1.0 - smoothstep(WALK_END - 0.6, WALK_END, absf(at.x))) * smoothstep(TOWER + 0.2, TOWER + 0.8, absf(at.x))
	return depth * along * smoothstep(WALL_Z - 0.5, WALL_Z, at.y)

## How far the camera should turn to face SJH: on the south road, the parking, the walkway.
static func view_for(x: float, z: float) -> float:
	return smoothstep(99.0, 104.0, z) * smoothstep(-57.0, -51.0, x) * (1.0 - smoothstep(37.0, 42.0, x))

static func on_parking(x: float, z: float) -> bool:
	return PARKING.has_point(Vector2(x, z)) or FRONT_ROW.has_point(Vector2(x, z))

## The paved ground between the road's sidewalk and SJH's front: the front car row,
## the walk up to the railing and the entrance steps.
static func in_front(x: float, z: float) -> bool:
	var at := local(x, z)
	return absf(at.x) < HALF + 2.0 and at.y >= RAIL_Z and at.y < SETBACK + 6.0 and Roads.across(x, z) < 4.0

static func walkable(x: float, z: float) -> bool:
	return in_walkway(x, z) or on_parking(x, z) or in_front(x, z)

static func blocked(x: float, z: float) -> bool:
	if ISLAND.has_point(Vector2(x, z)):
		return true
	var at := local(x, z)
	if absf(at.x) < HALF + 2.2 and at.y < RAIL_Z + 0.1 and at.y > -DEPTH - 0.5:
		if not in_walkway(x, z):
			return true # the building, its end towers, the entrance block
		if absf(at.y - RAIL_Z) < 0.2:
			for gap in GAPS:
				if absf(at.x - gap) < 1.2:
					return false
			return true # the railing
	for car in cars():
		if absf(x - car.x) < 1.05 and absf(z - car.y) < 2.3:
			return true
	return false

static func floor_height(x: float, z: float) -> float:
	if in_walkway(x, z):
		return WALK_Y
	if on_parking(x, z) or in_front(x, z):
		return -0.04
	return NAN

static var _cars: Array[Vector3] = []

## The parked cars: x, z (world), colour index. The chapel-side row faces south, the
## front row north, both nose to the road. Seeded, so every machine parks the same cars.
static func cars() -> Array[Vector3]:
	if not _cars.is_empty():
		return _cars
	var random := RandomNumberGenerator.new()
	random.seed = 1717
	var x := PARKING.position.x + 1.4
	while x < PARKING.end.x - 1.0:
		if random.randf() < 0.78:
			_cars.append(Vector3(x, PARKING.position.y + 4.6, random.randi_range(0, 7)))
		x += 2.6
	x = FRONT_ROW.position.x + 1.4
	while x < FRONT_ROW.end.x - 1.0:
		var at_steps := x > ENTRANCE_GAP.x and x < ENTRANCE_GAP.y
		if not at_steps and random.randf() < 0.72:
			_cars.append(Vector3(x, FRONT_ROW.position.y + 2.5, random.randi_range(0, 7)))
		x += 2.6
	return _cars

var w: RefCounted

func build(world_builder: RefCounted) -> void:
	w = world_builder
	w._flush()
	var pivot := Node3D.new()
	pivot.name = "SJH"
	var at := origin()
	pivot.transform = Transform3D(Basis(Vector3.UP, angle()), Vector3(at.x, 0, at.y))
	w.root.add_child(pivot)
	var saved: Node3D = w.root
	w.root = pivot
	_body()
	_floors()
	_end_towers()
	_centre()
	_walkway()
	_inner_wall()
	w._flush()
	w.root = saved
	_parking()
	_garden()
	_planting()
	w._flush()

# --- The slab ---------------------------------------------------------------------

func _body() -> void:
	var white: Material = w.material("stucco", Color("f4f4ef"))
	# The building's mass behind the balconies, and its roof.
	w.box(Vector3(2.0 * HALF, ROOF, DEPTH + WALL_Z), Vector3(0, ROOF / 2.0, (WALL_Z - DEPTH) / 2.0), white)
	w.box(Vector3(2.0 * HALF + 0.4, 0.4, DEPTH + 0.4), Vector3(0, ROOF + 0.2, -DEPTH / 2.0), w.material("stucco", Color("d9d8d0")))
	w.box(Vector3(2.0 * HALF, 0.9, 0.25), Vector3(0, ROOF + 0.85, -0.6), w.material("stucco", Color("e9e8e1")))
	for x in [-30.0, -12.0, 14.0, 32.0]:
		w.box(Vector3(1.4, 0.8, 1.2), Vector3(x, ROOF + 0.8, -9.0), w.material("plain", Color("c5c8c2")))

## The balcony floors: slab bands, brown-posted railings, the inner wall with windows
## and brown pilasters, and teal glass panels in staggered blocks of bays.
func _floors() -> void:
	var band: Material = w.material("stucco", Color("f7f7f2"))
	var wall: Material = w.material("stucco", Color("e7e7e1"))
	var brown: Material = w.material("plain", Color("6e4a3a"))
	var teal: Material = w.material("glass", Color("8fc4c0"))
	var rail: Material = w.material("plain", Color("dcdcd5"))
	var dark: Material = w.material("glass", Color("5f6b70"))
	# About one classroom in five is lit at night, chosen by position so it never changes.
	var lit: Material = w.glow(Color("ffc281"), 0.0, 1.35)
	var bays := int(HALF / 4.2)
	for k in range(1, FLOORS + 1):
		var y := GROUND + (k - 1) * STOREY
		w.box(Vector3(2.0 * HALF, 0.34, 3.0), Vector3(0, y - 0.17, -2.1), band)
		if k == FLOORS:
			# The top floor: a glazed band in terracotta frames.
			w.box(Vector3(2.0 * HALF, STOREY - 0.6, 0.06), Vector3(0, y + STOREY / 2.0 - 0.1, -1.0), w.material("glass", Color("6f93b8")))
			var mullion := -HALF
			while mullion <= HALF:
				w.box(Vector3(0.14, STOREY - 0.5, 0.12), Vector3(mullion, y + STOREY / 2.0 - 0.1, -0.95), w.material("plain", Color("b5553c")))
				mullion += 2.1
			continue
		w.box(Vector3(2.0 * HALF, 0.22, 0.2), Vector3(0, y + 0.55, -0.7), band)
		w.box(Vector3(2.0 * HALF, 0.05, 0.06), Vector3(0, y + 1.05, -0.7), rail)
		var post := -HALF
		while post < HALF:
			w.box(Vector3(0.06, 0.5, 0.06), Vector3(post, y + 0.8, -0.7), brown)
			post += 1.05
		w.box(Vector3(2.0 * HALF, STOREY - 0.34, 0.2), Vector3(0, y + (STOREY - 0.34) / 2.0, WALL_Z), wall)
		for bay in range(-bays, bays):
			var x := (bay + 0.5) * 4.2
			if absf(x) < TOWER + 1.0 or absf(x) > WALK_END:
				continue
			w.box(Vector3(2.4, 1.1, 0.05), Vector3(x, y + 1.55, WALL_Z + 0.12), lit if posmod(bay * 7 + k * 3, 5) == 0 else dark)
			w.box(Vector3(0.6, STOREY - 0.34, 0.5), Vector3(x + 2.1, y + (STOREY - 0.34) / 2.0, WALL_Z + 0.2), brown)
			var side: int = bay if bay >= 0 else -bay - 1
			var panel := (k in [3, 4] and side >= 2 and side <= 4) or (k in [1, 2] and side >= 5 and side <= 8)
			if panel or (k == 6 and side >= 7):
				w.box(Vector3(4.2, 2.1, 0.08), Vector3(x, y + 1.2, -0.45), teal)

## The ends: a terracotta block on the corner and a cream stair tower set back beside
## it, with stacked windows on its front and its end.
func _end_towers() -> void:
	var terracotta: Material = w.material("stucco", Color("c0745c"))
	var cream: Material = w.material("stucco", Color("ecd9a6"))
	var silver: Material = w.material("metal", Color("c9cdcd"))
	var pane: Material = w.material("glass", Color("8fb3d0"))
	for end in [-1.0, 1.0]:
		var x0: float = end * (HALF - 4.8)
		w.box(Vector3(4.4, ROOF + 2.4, 7.0), Vector3(x0, (ROOF + 2.4) / 2.0, -3.0), terracotta)
		w.box(Vector3(0.5, ROOF + 1.0, 0.4), Vector3(x0 - end * 2.3, (ROOF + 1.0) / 2.0, 0.6), silver)
		w.box(Vector3(4.5, GROUND, 0.08), Vector3(x0, GROUND / 2.0, 0.54), w.material("brick", Color("e1876a")))
		var cx: float = end * (HALF - 0.3)
		w.box(Vector3(4.4, ROOF + 3.4, 9.0), Vector3(cx, (ROOF + 3.4) / 2.0, -6.5), cream)
		for k in range(1, FLOORS + 1):
			var y := GROUND + (k - 1) * STOREY + 1.6
			w.box(Vector3(2.4, 1.6, 0.06), Vector3(cx, y, -1.98), pane)
			w.box(Vector3(2.9, 0.12, 0.5), Vector3(cx, y - 0.9, -1.8), cream)
			w.box(Vector3(0.06, 1.6, 2.2), Vector3(cx + end * 2.22, y, -5.0), pane)

## The centre tower: silver-clad frame, dark glass bands, the brown entrance block with
## the sign, the louvred entrance, the canopy and the steps.
func _centre() -> void:
	var silver: Material = w.material("metal", Color("c3c8ca"))
	var cream: Material = w.material("stucco", Color("efe4c6"))
	var glass: Material = w.material("glass", Color("2c3439"))
	var brown: Material = w.material("stone", Color("a58d7a"))
	var top := ROOF + 2.6
	w.box(Vector3(2.0 * TOWER, top, 4.6), Vector3(0, top / 2.0, -1.3), silver)
	w.box(Vector3(7.0, 3.2, 5.0), Vector3(0, top + 1.6, -2.0), w.material("stucco", Color("e8e6dd")))
	w.box(Vector3(7.4, 0.3, 5.4), Vector3(0, top + 3.3, -2.0), w.material("plain", Color("6a4a3a")))
	for k in range(5, FLOORS + 2):
		var y := GROUND + (k - 1) * STOREY
		w.box(Vector3(10.0, 1.9, 0.08), Vector3(0, y + 1.1, 1.04), glass)
		w.box(Vector3(10.6, 0.7, 0.12), Vector3(0, y + 2.4, 1.04), cream)
		for x in [-6.4, 6.4]:
			w.box(Vector3(2.4, STOREY, 0.1), Vector3(x, y + STOREY / 2.0, 1.04), cream)
	var band := GROUND + 3.0 * STOREY
	w.box(Vector3(2.0 * TOWER - 0.6, 0.5, 0.14), Vector3(0, band + 0.25, 1.06), cream)
	w.box(Vector3(2.0 * TOWER - 0.6, 1.7, 0.12), Vector3(0, band - 0.9, 1.05), w.material("wood", Color("8a6a55")))
	for x in [-6.0, -2.0, 2.0, 6.0]:
		w.box(Vector3(2.6, 0.6, 0.05), Vector3(x, band - 0.8, 1.12), glass)
	w.box(Vector3(2.0 * TOWER - 0.6, 0.45, 0.14), Vector3(0, band - 1.95, 1.06), w.material("stucco", Color("e9dba8")))
	var lower := GROUND + 1.6
	w.box(Vector3(2.0 * TOWER - 0.6, band - 2.2 - lower, 0.12), Vector3(0, (band - 2.2 + lower) / 2.0, 1.05), brown)
	for x in [-7.0, 7.0]:
		w.box(Vector3(4.4, lower, 0.12), Vector3(x, lower / 2.0, 1.05), brown)
	w.box(Vector3(2.0 * TOWER - 0.6, 1.0, 0.1), Vector3(0, GROUND + 3.2, 1.12), w.material("plain", Color("1f2a33")))
	w.panel("ST. JOSEPH HALL", Vector3(0, GROUND + 3.2, 1.2), 8.0, 0.62, Color("f2f2ee"))
	# The entrance: a dark recess, wooden louvres over the doors, glass doors.
	w.box(Vector3(9.6, lower, 0.1), Vector3(0, lower / 2.0, 0.98), w.material("plain", Color("2a2c2d")))
	var slat := GROUND + 0.4
	while slat < lower - 0.1:
		w.box(Vector3(6.4, 0.05, 0.1), Vector3(0, slat, 1.06), w.material("wood", Color("9a7a5c")))
		slat += 0.18
	w.box(Vector3(5.6, 2.6, 0.06), Vector3(0, WALK_Y + 1.3, 1.08), w.glow(Color("c9b48a"), 0.0, 1.0))
	for x in [-2.8, -1.0, 1.0, 2.8]:
		w.box(Vector3(0.08, 2.6, 0.1), Vector3(x, WALK_Y + 1.3, 1.1), w.material("plain", Color("3b3f42")))
	# The canopy: a dark steel slab with a rounded fascia. It stops short of the road:
	# the sidewalk in front is only 1.6 to 4.8 m deep.
	w.box(Vector3(12.4, 0.36, 2.7), Vector3(0, GROUND - 0.2, 2.25), w.material("metal", Color("53666b")))
	w.box(Vector3(12.6, 0.5, 0.3), Vector3(0, GROUND - 0.3, 3.6), w.material("metal", Color("7d9196")))
	for k in 3:
		var height := 0.15 * (3 - k)
		w.box(Vector3(9.0, height + 0.15, 0.4), Vector3(0, height / 2.0, 1.3 + k * 0.4), w.material("stone", Color("bdb3a6")))
	for x in [-4.8, 4.8]:
		w.rod(Vector3(x, 0.0, 2.4), Vector3(x, 1.0, 1.2), 0.03, Color("b9bcbc"))

# --- The covered walkway -------------------------------------------------------------

func _walkway() -> void:
	var floor_tile: Material = w.material("floor", Color("d6cfc6"))
	var ceiling: Material = w.material("stucco", Color("e8e8e2"))
	var steel: Material = w.material("plain", Color("aeb4b6"))
	for side in [-1.0, 1.0]:
		var length := WALK_END + 0.2 - TOWER
		var x0: float = side * (TOWER + length / 2.0)
		w.box(Vector3(length, WALK_Y, -WALL_Z + 0.3), Vector3(x0, WALK_Y / 2.0, WALL_Z / 2.0 + 0.15), floor_tile)
		# The awning: a thin plate on slanted white struts.
		w.box(Vector3(length, 0.2, -WALL_Z + 1.4), Vector3(x0, CEILING + 0.1, (WALL_Z + 1.4) / 2.0), ceiling)
		w.box(Vector3(length, 0.14, 0.12), Vector3(x0, CEILING + 0.05, 1.45), w.material("plain", Color("cfd2cf")))
		var x := x0 - length / 2.0 + 1.6
		while x < x0 + length / 2.0:
			w.rod(Vector3(x, WALK_Y, 0.25), Vector3(x, CEILING, 1.3), 0.05, Color("e4e6e4"))
			x += 3.2
		# The railing, with openings to the sidewalk.
		var segment := x0 - length / 2.0
		while segment < x0 + length / 2.0 - 0.5:
			var open := false
			for gap in GAPS:
				if absf(segment + 0.5 - gap) < 1.2:
					open = true
			if not open:
				w.box(Vector3(1.0, 0.04, 0.04), Vector3(segment + 0.5, 0.95, RAIL_Z), steel)
				w.box(Vector3(1.0, 0.03, 0.03), Vector3(segment + 0.5, 0.55, RAIL_Z), steel)
				w.box(Vector3(0.04, 0.95, 0.04), Vector3(segment, 0.48, RAIL_Z), steel)
			segment += 1.0
	# Tube lights under the awning, lit at night.
	var tube: Material = w.glow(Color("f4f1e6"), 0.6, 2.2)
	var x := -WALK_END + 1.0
	while x < WALK_END:
		if absf(x) > TOWER + 0.6:
			w.box(Vector3(1.2, 0.06, 0.12), Vector3(x, CEILING - 0.08, -1.6), tube)
			w._omni(Vector3(x, CEILING - 0.4, -1.6), Color("f3f1ea"), 1.1, 6.0)
		x += 6.0

## The ground floor's inner wall: room doors, dark windows, notice boards, fire alarms.
func _inner_wall() -> void:
	var frame: Material = w.material("plain", Color("4a3a2e"))
	var sill: Material = w.material("plain", Color("f6f3ec"))
	var cork: Material = w.material("wood", Color("b48a5a"))
	var notes: Array[Color] = [Color("f4f1e8"), Color("e8d27a"), Color("cfe0ef"), Color("f0c0b8")]
	w.box(Vector3(2.0 * HALF, GROUND, 0.2), Vector3(0, GROUND / 2.0, WALL_Z), w.material("stucco", Color("eceae3")))
	var i := 0
	var x := -WALK_END + 1.0
	while x < WALK_END - 0.5:
		if absf(x) < TOWER + 1.0:
			x += 4.2
			continue
		match i % 3:
			0:
				w.box(Vector3(1.0, 2.2, 0.06), Vector3(x, WALK_Y + 1.1, WALL_Z + 0.12), frame)
				w.box(Vector3(0.82, 1.9, 0.04), Vector3(x, WALK_Y + 1.05, WALL_Z + 0.15), w.material("wood", Color("7a5a44")))
				w.panel("SJH G%02d" % (i + 1), Vector3(x, WALK_Y + 2.5, WALL_Z + 0.16), 0.9, 0.18, Color("f6f1e6"), Color("4b3a2c"))
			1:
				w.box(Vector3(2.6, 1.2, 0.05), Vector3(x, WALK_Y + 1.6, WALL_Z + 0.12), w.material("glass", Color("4b585e")))
				w.box(Vector3(2.7, 0.08, 0.2), Vector3(x, WALK_Y + 0.95, WALL_Z + 0.18), sill)
			2:
				w.box(Vector3(1.8, 1.1, 0.04), Vector3(x, WALK_Y + 1.5, WALL_Z + 0.13), cork)
				for p in 4:
					w.box(Vector3(0.36, 0.48, 0.01), Vector3(x - 0.6 + p * 0.4, WALK_Y + 1.5 + (p % 2) * 0.12, WALL_Z + 0.16), w.material("plain", notes[p]))
				w.box(Vector3(0.14, 0.14, 0.06), Vector3(x + 1.3, WALK_Y + 2.3, WALL_Z + 0.14), w.material("plain", Color("c42a2b")))
		x += 4.2
		i += 1

# --- North of the road: the parking and its cars ---------------------------------------

func _parking() -> void:
	var lot: Material = w.material("concrete", Color("c9c7c0"))
	w.box(Vector3(PARKING.size.x, 0.12, PARKING.size.y), Vector3(PARKING.get_center().x, -0.1, PARKING.get_center().y), lot)
	var paint: Material = w.material("plain", Color("e8e6dc"))
	var x := PARKING.position.x + 0.1
	while x <= PARKING.end.x:
		w.box(Vector3(0.08, 0.012, 5.0), Vector3(x, -0.035, PARKING.position.y + 4.5), paint)
		x += 2.6
	# The front row's pad, from the sidewalk to the building.
	var front := Rect2(FRONT_ROW.position.x, FRONT_ROW.position.y, FRONT_ROW.size.x, EDGE_EAST.y - FRONT_ROW.position.y)
	w.box(Vector3(front.size.x, 0.1, front.size.y), Vector3(front.get_center().x, -0.09, front.get_center().y), lot)
	x = FRONT_ROW.position.x + 0.1
	while x <= FRONT_ROW.end.x:
		if x < ENTRANCE_GAP.x or x > ENTRANCE_GAP.y:
			w.box(Vector3(0.08, 0.012, 5.0), Vector3(x, -0.035, FRONT_ROW.position.y + 2.5), paint)
		x += 2.6
	var colours: Array[Color] = [Color("1c2128"), Color("e9e9e6"), Color("8a8e92"), Color("6b1f22"), Color("b8b2a4"),
		Color("2e3f5a"), Color("c44a2c"), Color("43484c")]
	for car in cars():
		_car(Vector3(car.x, -0.04, car.y), colours[int(car.z)], -1.0 if car.y > 110.0 else 1.0)

## A parked car: body, cabin glass, wheels and lights; `nose` +1 faces +z, -1 faces -z.
func _car(at: Vector3, colour: Color, nose := 1.0) -> void:
	var paint: Material = w.material("plain", colour)
	var glass: Material = w.material("glass", Color("2d3a42"))
	w.box(Vector3(1.78, 0.62, 4.3), at + Vector3(0, 0.62, 0), paint)
	w.box(Vector3(1.6, 0.52, 2.2), at + Vector3(0, 1.18, -0.25 * nose), glass)
	w.box(Vector3(1.5, 0.08, 2.0), at + Vector3(0, 1.47, -0.25 * nose), paint)
	var wheel := CylinderMesh.new()
	wheel.top_radius = 0.33
	wheel.bottom_radius = 0.33
	wheel.height = 0.24
	wheel.radial_segments = 10
	for dx in [-0.82, 0.82]:
		for dz in [-1.35, 1.35]:
			var tyre: MeshInstance3D = w._mesh(wheel, at + Vector3(dx, 0.33, dz), w.material("plain", Color("1b1b1b")))
			tyre.rotation.z = PI / 2.0
	for dx in [-0.6, 0.6]:
		w.box(Vector3(0.36, 0.12, 0.04), at + Vector3(dx, 0.78, 2.16 * nose), w.glow(Color("f2efe2"), 0.2, 1.0))
		w.box(Vector3(0.36, 0.12, 0.04), at + Vector3(dx, 0.78, -2.16 * nose), w.material("plain", Color("a3262a")))

# --- The Mary statue garden ------------------------------------------------------------

func _garden() -> void:
	# A rounded grass island with a yellow-edged kerb.
	var middle := ISLAND.get_center()
	var shape := PackedVector2Array()
	for i in 32:
		var a := TAU * i / 32.0
		var c := cos(a)
		var s := sin(a)
		shape.append(middle + Vector2(signf(c) * pow(absf(c), 0.4) * ISLAND.size.x / 2.0, signf(s) * pow(absf(s), 0.4) * ISLAND.size.y / 2.0))
	var triangles := PackedVector2Array()
	for i in shape.size():
		triangles.append_array([middle, shape[i], shape[(i + 1) % shape.size()]])
	w._ground(triangles, 0.08, w.material("grass"))
	for i in shape.size():
		var a := shape[i]
		var b := shape[(i + 1) % shape.size()]
		var mid := (a + b) / 2.0
		var turn := atan2(-(b - a).y, (b - a).x)
		w.box(Vector3(a.distance_to(b) + 0.05, 0.3, 0.32), Vector3(mid.x, -0.05, mid.y), w.material("stucco", Color("cfc9b8")), turn)
		w.box(Vector3(a.distance_to(b) + 0.05, 0.08, 0.33), Vector3(mid.x, 0.12, mid.y), w.material("plain", Color("d4b33a")), turn)
	# The statue: a white robe, a pale-blue mantle, arms open, on an octagonal plinth with flowers.
	var stone: Material = w.material("stucco", Color("f1f1ec"))
	var blue: Material = w.material("plain", Color("a9c3dc"))
	var plinth := CylinderMesh.new()
	plinth.top_radius = 0.75
	plinth.bottom_radius = 0.8
	plinth.height = 1.2
	plinth.radial_segments = 8
	w._mesh(plinth, Vector3(MARY.x, 0.68, MARY.y), stone)
	w.box(Vector3(0.6, 0.7, 0.02), Vector3(MARY.x, 0.75, MARY.y - 0.78), w.material("plain", Color("26282a")))
	var flowers: Array[Color] = [Color("f2e45a"), Color("ffffff"), Color("f0b02a")]
	for i in 14:
		var a := TAU * i / 14.0
		w.box(Vector3(0.16, 0.14, 0.16), Vector3(MARY.x + cos(a) * 0.62, 1.34, MARY.y + sin(a) * 0.62), w.material("plain", flowers[i % 3]))
	var robe := CylinderMesh.new()
	robe.top_radius = 0.2
	robe.bottom_radius = 0.42
	robe.height = 1.75
	robe.radial_segments = 10
	w._mesh(robe, Vector3(MARY.x, 2.16, MARY.y), stone)
	var mantle := CylinderMesh.new()
	mantle.top_radius = 0.24
	mantle.bottom_radius = 0.48
	mantle.height = 1.4
	mantle.radial_segments = 10
	mantle.cap_top = false
	w._mesh(mantle, Vector3(MARY.x, 2.3, MARY.y + 0.04), blue)
	var head := SphereMesh.new()
	head.radius = 0.17
	head.height = 0.36
	w._mesh(head, Vector3(MARY.x, 3.2, MARY.y), w.material("plain", Color("dcd8d0")))
	var veil: MeshInstance3D = w._mesh(head, Vector3(MARY.x, 3.24, MARY.y + 0.05), blue)
	veil.scale = Vector3(1.15, 1.1, 1.15)
	for side in [-1.0, 1.0]:
		w.rod(Vector3(MARY.x + side * 0.25, 2.75, MARY.y - 0.05), Vector3(MARY.x + side * 0.85, 2.45, MARY.y - 0.35), 0.07, Color("ecece6"))
	w.box(Vector3(0.18, 0.18, 0.08), Vector3(MARY.x, 2.75, MARY.y - 0.22), w.material("plain", Color("d9a0a8")))
	var corner := ISLAND.position
	w._shrub(Vector3(corner.x + 4.9, 0.08, corner.y + 5.9), 1.5, 760)
	w._shrub(Vector3(corner.x + 1.1, 0.08, corner.y + 5.6), 1.4, 761)
	w._shrub(Vector3(corner.x + 4.9, 0.08, corner.y + 1.2), 1.2, 762)
	w._bamboo(Vector3(corner.x + 3.0, 0.08, corner.y + 6.3), 0.5, 9, 763) # behind her, as seen from the road

## Palms, bamboo and red-tipped shrubs along the front, as in the photos.
func _planting() -> void:
	var palms := Chapel.new()
	palms.w = w
	for lx in [16.0, 27.0, -14.0]:
		var at := world(lx, 1.2)
		palms._palm(Vector3(at.x, 0.0, at.y), 7.0 + absf(lx) * 0.05, 770 + roundi(lx))
	for lx in [-22.0, 30.5]:
		var at := world(lx, 1.1)
		w._bamboo(Vector3(at.x, 0.0, at.y), 0.7, 12, 780 + roundi(lx))
	for lx in [-40.0, -31.0, -26.0, 12.0, 22.0, 34.0, 40.0]:
		var at := world(lx, 0.8)
		w._shrub(Vector3(at.x, 0.0, at.y), 1.2, 790 + roundi(lx))

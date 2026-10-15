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
	_mary()
	var corner := ISLAND.position
	# Behind her: a trimmed green hedge and red-tipped shrubs, as in the photo.
	w._shrub(Vector3(corner.x + 4.9, 0.08, corner.y + 5.9), 1.7, 760, w.HEDGE_COLORS)
	w._shrub(Vector3(corner.x + 1.1, 0.08, corner.y + 5.6), 1.4, 761)
	w._shrub(Vector3(corner.x + 5.1, 0.08, corner.y + 3.4), 1.2, 764)
	w._shrub(Vector3(corner.x + 0.9, 0.08, corner.y + 3.0), 1.0, 765, w.HEDGE_COLORS)
	w._shrub(Vector3(corner.x + 4.9, 0.08, corner.y + 1.2), 1.1, 762, w.HEDGE_COLORS)
	w._bamboo(Vector3(corner.x + 3.0, 0.08, corner.y + 6.3), 0.5, 9, 763) # behind her, as seen from the road

## A surface of revolution: `profile` is (radius, height) from the bottom up, swept from
## `from` to `to` degrees round the vertical (0 = the front, facing the road). Both sides
## are emitted, so partial sweeps (the mantle, the veil) read from inside too.
func _lathe(profile: PackedVector2Array, from: float, to: float, steps := 20) -> ArrayMesh:
	var tool := SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	var normals := PackedVector2Array()
	for i in profile.size():
		var t := profile[mini(i + 1, profile.size() - 1)] - profile[maxi(i - 1, 0)]
		normals.append(Vector2(t.y, -t.x).normalized())
	for k in steps:
		var a0 := deg_to_rad(lerpf(from, to, float(k) / steps))
		var a1 := deg_to_rad(lerpf(from, to, float(k + 1) / steps))
		for i in profile.size() - 1:
			var quad := []
			for corner in [[a0, i], [a1, i], [a1, i + 1], [a0, i + 1]]:
				var radial := Vector3(sin(corner[0]), 0, -cos(corner[0]))
				var p: Vector2 = profile[corner[1]]
				var n: Vector2 = normals[corner[1]]
				quad.append([radial * p.x + Vector3.UP * p.y, (radial * n.x + Vector3.UP * n.y).normalized()])
			for order in [[0, 1, 2, 0, 2, 3], [0, 2, 1, 0, 3, 2]]:
				var flip := 1.0 if order[1] == 1 else -1.0
				for j in order:
					tool.set_normal(quad[j][1] * flip)
					tool.add_vertex(quad[j][0])
	return tool.commit()

func _profile(points: Array) -> PackedVector2Array:
	var out := PackedVector2Array()
	for p in points:
		out.append(Vector2(p[0], p[1]))
	return out

## The Mary statue, from the "CLOSE UP RIGHT SIDE" photo: Our Lady with her unborn child
## on an octagonal white pedestal with a black plaque ("A Mother's Prayer for Her Unborn
## Child") and a ring of yellow and white flowers. A white robe with a gentle belly; a
## pale-blue mantle over her head, open at the front and falling down her back; arms held
## out and down with wide bell sleeves and open palms; a pink heart on her chest. A ground
## lamp in the lawn lights her at night.
func _mary() -> void:
	var white: Material = w.material("stucco", Color("f3f3ef"))
	var stone: Material = w.material("stucco", Color("eceae3"))
	var blue := (w.material("plain", Color("b3c9de")) as StandardMaterial3D).duplicate() as StandardMaterial3D
	blue.cull_mode = BaseMaterial3D.CULL_DISABLED
	var face: Material = w.material("plain", Color("ebe5dc"))
	var at := Vector3(MARY.x, 0.0, MARY.y)
	# The pedestal: a wide base, the octagonal shaft (a flat face to the road), a capping slab.
	for part in [[0.64, 0.66, 0.14, 0.15, stone], [0.55, 0.55, 1.0, 0.72, white], [0.68, 0.66, 0.1, 1.27, stone]]:
		var octagon := CylinderMesh.new()
		octagon.top_radius = part[0]
		octagon.bottom_radius = part[1]
		octagon.height = part[2]
		octagon.radial_segments = 8
		var block: MeshInstance3D = w._mesh(octagon, at + Vector3(0, part[3], 0), part[4])
		block.rotation.y = PI / 8.0
	# The plaque on the front face, its title and lines of the prayer.
	var front := at + Vector3(0, 0, -0.505)
	w.box(Vector3(0.44, 0.56, 0.02), front + Vector3(0, 0.74, 0), w.material("plain", Color("1d2022")))
	w.box(Vector3(0.32, 0.03, 0.01), front + Vector3(0, 0.95, -0.012), w.material("plain", Color("d9d4c6")))
	for line in 7:
		var length := 0.34 - (line % 3) * 0.04
		w.box(Vector3(length, 0.012, 0.01), front + Vector3(0, 0.88 - line * 0.055, -0.012), w.material("plain", Color("8d8a84")))
	# The flowers round her feet: yellow, white and orange blooms over green leaves.
	var random := RandomNumberGenerator.new()
	random.seed = 7711
	var blooms: Array[Color] = [Color("f2d43a"), Color("f6f6f0"), Color("f0a030"), Color("f2d43a"), Color("fbfbf6")]
	for i in 34:
		var a := TAU * i / 34.0 + random.randf_range(-0.05, 0.05)
		var r := random.randf_range(0.46, 0.6)
		var spot := at + Vector3(cos(a) * r, 1.36 + random.randf_range(0.0, 0.08), sin(a) * r)
		if i % 3 == 0:
			w.box(Vector3(0.14, 0.08, 0.1), spot - Vector3(0, 0.04, 0), w.material("plain", Color("4f7a3a")), a)
		w.box(Vector3(0.09, 0.08, 0.09), spot, w.material("plain", blooms[i % blooms.size()]), a)
	# The figure stands on a low round base on the cap.
	var base := 1.32
	var disc := CylinderMesh.new()
	disc.top_radius = 0.4
	disc.bottom_radius = 0.42
	disc.height = 0.06
	disc.radial_segments = 16
	w._mesh(disc, at + Vector3(0, base + 0.03, 0), white)
	var figure := at + Vector3(0, base + 0.06, 0)
	# The robe: falling straight to the feet, the shoulders broader than deep.
	var robe: MeshInstance3D = w._mesh(_lathe(_profile([[0.36, 0.0], [0.35, 0.18], [0.31, 0.6], [0.29, 0.95], [0.26, 1.25],
		[0.25, 1.42], [0.27, 1.58], [0.28, 1.66], [0.2, 1.73], [0.075, 1.78], [0.07, 1.84], [0.0, 1.85]]), 0.0, 360.0, 24), figure, white)
	robe.scale = Vector3(1.0, 1.0, 0.72)
	# Her unborn child: a gentle swell at the front of the robe.
	var belly := SphereMesh.new()
	belly.radius = 0.17
	belly.height = 0.4
	var swell: MeshInstance3D = w._mesh(belly, figure + Vector3(0, 1.0, -0.09), white)
	swell.scale = Vector3(1.0, 1.0, 0.62)
	# The mantle: over the shoulders and down her back and sides, open at the front.
	var mantle: MeshInstance3D = w._mesh(_lathe(_profile([[0.42, 0.02], [0.4, 0.4], [0.36, 0.9], [0.32, 1.3],
		[0.31, 1.52], [0.32, 1.64], [0.25, 1.74], [0.18, 1.8]]), 42.0, 318.0, 22), figure, blue)
	mantle.scale = Vector3(1.0, 1.0, 0.76)
	# The head, the face turned a little down, and the veil round it.
	var head := SphereMesh.new()
	head.radius = 0.12
	head.height = 0.29
	var skull: MeshInstance3D = w._mesh(head, figure + Vector3(0, 1.98, -0.015), face)
	skull.rotation.x = 0.12
	var veil: MeshInstance3D = w._mesh(_lathe(_profile([[0.17, 1.76], [0.165, 1.88], [0.155, 1.99], [0.13, 2.08],
		[0.085, 2.14], [0.0, 2.16]]), 48.0, 312.0, 18), figure + Vector3(0, 0, 0.01), blue)
	veil.scale = Vector3(1.0, 1.0, 0.95)
	w.box(Vector3(0.012, 0.03, 0.012), figure + Vector3(-0.04, 2.0, -0.12), w.material("plain", Color("8d847a")))
	w.box(Vector3(0.012, 0.03, 0.012), figure + Vector3(0.04, 2.0, -0.12), w.material("plain", Color("8d847a")))
	# Arms held out and down: the forearm in a wide bell sleeve, the hand open.
	for side in [-1.0, 1.0]:
		var elbow: Vector3 = figure + Vector3(side * 0.27, 1.38, -0.04)
		var wrist: Vector3 = figure + Vector3(side * 0.58, 1.24, -0.26)
		w.rod(elbow, wrist, 0.06, Color("f3f3ef"))
		w.rod(wrist + Vector3(0, -0.02, 0), elbow.lerp(wrist, 0.35), 0.12, Color("f3f3ef")) # the sleeve flaring open
		w.rod(wrist + Vector3(-side * 0.06, -0.24, 0.05), wrist, 0.05, Color("eeeee8")) # the sleeve's hanging fold
		var hand := SphereMesh.new()
		hand.radius = 0.05
		hand.height = 0.1
		var palm: MeshInstance3D = w._mesh(hand, wrist + Vector3(side * 0.08, -0.03, -0.05), face)
		palm.scale = Vector3(1.0, 1.4, 0.55)
		palm.rotation = Vector3(0.3, 0, side * 0.5)
	# The Immaculate Heart on her chest: a pink heart with a small gold flame.
	var chest := figure + Vector3(0, 1.5, -0.205)
	var heart := BoxMesh.new()
	heart.size = Vector3(0.1, 0.1, 0.03)
	var shape: MeshInstance3D = w._mesh(heart, chest, w.material("plain", Color("d77f8f")))
	shape.rotation.z = PI / 4.0
	for side in [-1.0, 1.0]:
		w.box(Vector3(0.05, 0.05, 0.03), chest + Vector3(side * 0.03, 0.035, -0.002), w.material("plain", Color("d77f8f")))
	w.box(Vector3(0.03, 0.06, 0.02), chest + Vector3(0, 0.1, -0.01), w.material("plain", Color("e3b54a")))
	# The ground lamp in the lawn in front, lighting her at night.
	var lamp_at := at + Vector3(0.3, 0.12, -1.85)
	w.box(Vector3(0.2, 0.16, 0.2), lamp_at, w.material("plain", Color("26282a")))
	w.box(Vector3(0.14, 0.02, 0.14), lamp_at + Vector3(0, 0.09, 0), w.glow(Color("fff1d6"), 0.1, 2.5))
	var light := SpotLight3D.new()
	light.light_color = Color("fff0d8")
	light.light_energy = 3.5
	light.spot_range = 6.0
	light.spot_angle = 24.0
	light.spot_angle_attenuation = 0.9
	# No shadow: from this low the flowers would cast jagged stripes up her robe.
	light.shadow_enabled = false
	light.basis = Basis.looking_at(figure + Vector3(0, 1.2, 0) - lamp_at, Vector3.UP)
	w._lamp(light, lamp_at + Vector3(0, 0.12, 0))

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

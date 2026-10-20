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
## front of SJH (world). The chapel-side row parks nose to the grass, the front row
## nose to the road.
const PARKING := Rect2(-44.0, 97.6, 72.0, 8.6)
## The chapel-side row parks at a slant (radians off straight), nose to the north-west,
## as in the photos; its bays are wider apart for it.
const SLANT := 0.44
const SLANT_BAY := 2.9
const FRONT_ROW := Rect2(-48.0, 115.2, 82.0, 5.4)
## The gap in the front row at the entrance steps (world x).
const ENTRANCE_GAP := Vector2(-18.5, -4.5)
## The Mary statue's grass island at the building's right (west) end, as seen from the
## front: between the cream stair tower and the road's turn up the west road (world).
const ISLAND := Rect2(-57.0, 115.6, 6.0, 7.0)
const MARY := Vector2(-54.0, 119.3)
## The back, from the SJH rear photos (local z): the back facade's face, the far kerb of
## the lane behind it, and the campus's perimeter wall. The lane runs from past the east end
## (local x -LANE_EAST, world x ~46) to the building's west end, under MGN.
const BACK := -DEPTH
const LANE_EDGE := BACK - 10.6
const BOUNDARY := BACK - 13.2
const LANE_EAST := HALF + 10.0
## The gate pillar across the lane from the east corner (local x), where the perimeter wall
## turns from grey to maroon (photo 2).
const GATE := -49.2
## The lane round SJH's east end, from the south road's corner to the back (world): between
## the building and Aero Hall's reserved plot (x 44.5), where photo 3 has the road bending in.
const ACCESS := Rect2(37.0, 112.0, 7.4, 37.0)
## Bays of brown louvres instead of windows on the back, by bay index (x = (bay + 0.5) * 4.2).
const LOUVRE_BAYS: Array[int] = [-8, -3, 1, 5]
## What stands against the back wall, east (the gym's end) to west, as in the photos:
## local x from, x to, and how far out from the wall. The palm strip, the basement ramp,
## the motorcycles, the yellow shed, the HAU carport's closed east end, the utility block,
## the back entrance's steps, the patched shed's side.
const REAR_SOLID: Array[Vector3] = [Vector3(-47.9, -40.0, 2.4), Vector3(-38.4, -33.0, 6.2), Vector3(-31.6, -29.4, 2.2),
	Vector3(-27.8, -22.0, 4.6), Vector3(-9.7, -9.5, 6.0), Vector3(3.4, 8.4, 4.2), Vector3(9.2, 11.8, 1.6), Vector3(12.2, 12.5, 5.2)]
## The vehicles parked nose out along the back: local x, kind (0 car, 1 van, 2 pickup), colour.
const REAR_CARS := [[-19.8, 2, "f1f1ec"], [-17.2, 0, "3a3f44"], [-14.0, 0, "b9bcbd"], [-11.3, 0, "c9cac6"],
	[-8.2, 1, "e9e2d2"], [-5.4, 1, "e9e2d2"], [-2.5, 2, "f2f2ee"], [0.3, 2, "f2f2ee"], [15.2, 0, "b8322c"],
	[20.4, 0, "1c2128"], [23.2, 1, "f1f1ec"], [26.0, 1, "e6dcc6"], [28.8, 0, "b9bcbd"], [31.6, 0, "e9e9e6"]]
## The carports: local x from, x to, roof height, depth out from the wall. The sedans' lean-to,
## HAU VEHICLE ONLY, the low one to the west.
const CARPORTS: Array[Vector4] = [Vector4(-15.4, -9.8, 2.8, 5.8), Vector4(-9.6, 1.8, 3.2, 6.0), Vector4(19.0, 33.4, 2.6, 5.8)]

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
	return smoothstep(99.0, 104.0, z) * smoothstep(-57.0, -51.0, x) * (1.0 - smoothstep(37.0, 42.0, x)) * (1.0 - rear_for(x, z))

## 1 on the lane behind SJH: the camera keeps its plain north view there, facing the back
## like the APS front; the other zones yield to it. 0 past the east end, by the gym.
static func rear_for(x: float, z: float) -> float:
	var at := local(x, z)
	return (1.0 - smoothstep(BACK - 1.0, BACK + 1.0, at.y)) * (1.0 - smoothstep(HALF + 2.0, HALF + 6.0, absf(at.x)))

## The lane behind SJH and the lane down to it round the east end.
static func on_lane(x: float, z: float) -> bool:
	var at := local(x, z)
	return ACCESS.has_point(Vector2(x, z)) or (at.x > -LANE_EAST and at.x < HALF and at.y > LANE_EDGE and at.y < BACK - 0.6)

## The front's two car rows and the paved lane behind (no grass grows on either).
static func on_parking(x: float, z: float) -> bool:
	return PARKING.has_point(Vector2(x, z)) or FRONT_ROW.has_point(Vector2(x, z)) or on_lane(x, z)

## The carports' front posts (local x, z).
static func carport_posts() -> Array[Vector2]:
	var posts: Array[Vector2] = []
	for port in CARPORTS:
		var count := ceili((port.y - port.x) / 3.0)
		for i in count + 1:
			posts.append(Vector2(lerpf(port.x + 0.1, port.y - 0.1, float(i) / count), BACK - port.w + 0.2))
	return posts

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
	if at.y < BACK - 0.5:
		if not on_lane(x, z):
			return true # the perimeter wall and past it
		for solid in REAR_SOLID:
			if at.x > solid.x and at.x < solid.y and at.y > BACK - solid.z:
				return true
		for car in REAR_CARS:
			if absf(at.x - car[0]) < 1.05 and at.y > BACK - 5.4:
				return true
		for post in carport_posts():
			if at.distance_to(post) < 0.25:
				return true
	for car in cars():
		# In the car's own frame: the chapel-side row is turned by SLANT.
		var turn := slant_for(car.y)
		var d := Vector2(x - car.x, z - car.y)
		var along := Vector2(d.x * cos(turn) - d.y * sin(turn), d.x * sin(turn) + d.y * cos(turn))
		if absf(along.x) < 0.98 and absf(along.y) < 2.2:
			return true
	return false

## The turn of a car parked at world z: the chapel-side row slants, the front row not.
static func slant_for(z: float) -> float:
	return SLANT if z < PARKING.end.y else 0.0

static func floor_height(x: float, z: float) -> float:
	if in_walkway(x, z):
		return WALK_Y
	if on_parking(x, z) or in_front(x, z):
		return -0.04
	return NAN

static var _cars: Array[Vector3] = []

## The parked cars: x, z (world), colour index. The chapel-side row is nosed in to the
## grass by the chapel walk, the front row to the road: both face north. Seeded, so
## every machine parks the same cars.
static func cars() -> Array[Vector3]:
	if not _cars.is_empty():
		return _cars
	var random := RandomNumberGenerator.new()
	random.seed = 1717
	var x := PARKING.position.x + 1.4
	while x < PARKING.end.x - 1.0:
		if random.randf() < 0.78:
			_cars.append(Vector3(x, PARKING.position.y + 4.6, random.randi_range(0, 7)))
		x += SLANT_BAY
	x = FRONT_ROW.position.x + 1.4
	while x < FRONT_ROW.end.x - 1.0:
		var at_steps := x > ENTRANCE_GAP.x and x < ENTRANCE_GAP.y
		if not at_steps and random.randf() < 0.72:
			_cars.append(Vector3(x, FRONT_ROW.position.y + 2.5, random.randi_range(0, 7)))
		x += 2.6
	return _cars

var w: RefCounted
## The cut-branch piles by the gate pillar (local), planted with the world's shrubs.
var _pile_at := []

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
	_details()
	_rear()
	_rear_ground()
	w._flush()
	w.root = saved
	_parking()
	_garden()
	_planting()
	_rear_planting()
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
	var lit := _night_glass(Color("5f6b70"), Color("ffc281"), 1.35)
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
	var silver: Material = w.material("metal", Color("e6eaea"))
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
	w.box(Vector3(5.6, 2.6, 0.06), Vector3(0, WALK_Y + 1.3, 1.08), _night_glass(Color("75858c"), Color("ffe2b0"), 1.0))
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

# --- Facade details (the polish pass) --------------------------------------------------

## Glass that looks like ordinary dark glass by day and glows at night (a plain glow
## material would show its warm colour in daylight too).
func _night_glass(day: Color, night: Color, energy: float) -> StandardMaterial3D:
	var made := (w.material("glass", day) as StandardMaterial3D).duplicate() as StandardMaterial3D
	made.emission_enabled = true
	made.emission = night
	made.emission_energy_multiplier = 0.0
	w.glows.append([made, 0.0, energy])
	return made

## The things that make the slab read like the photos up close: framed classroom
## windows with sills, tube lights under every balcony (lit at night), joints on the
## teal glass and the silver cladding, stone joints on the brown entrance block, a lit
## sign, downlights under the canopy, AC units on the top floor, the roof's overhang and
## fascia, and the telecom tower behind the west wing.
func _details() -> void:
	var frame: Material = w.material("plain", Color("e9e9e3"))
	var sill: Material = w.material("stucco", Color("f1f1ec"))
	var tube: Material = w.glow(Color("f4f1e6"), 0.5, 2.0)
	var fixture: Material = w.material("plain", Color("d4d4cd"))
	var joint: Material = w.material("plain", Color("6f9894"))
	var bays := int(HALF / 4.2)
	for k in range(1, FLOORS):
		var y := GROUND + (k - 1) * STOREY
		for bay in range(-bays, bays):
			var x := (bay + 0.5) * 4.2
			if absf(x) < TOWER + 1.0 or absf(x) > WALK_END:
				continue
			# The window: a white frame, a mullion and a transom, and a sill.
			for dx in [-1.22, 0.0, 1.22]:
				w.box(Vector3(0.06, 1.18, 0.05), Vector3(x + dx, y + 1.55, WALL_Z + 0.16), frame)
			for dy in [-0.57, 0.18, 0.57]:
				w.box(Vector3(2.5, 0.05, 0.05), Vector3(x, y + 1.55 + dy, WALL_Z + 0.16), frame)
			w.box(Vector3(2.6, 0.06, 0.18), Vector3(x, y + 0.94, WALL_Z + 0.2), sill)
			# A tube light on the balcony ceiling in front of each classroom.
			w.box(Vector3(1.2, 0.07, 0.16), Vector3(x, y + STOREY - 0.42, -2.1), fixture)
			w.box(Vector3(1.1, 0.03, 0.08), Vector3(x, y + STOREY - 0.47, -2.1), tube)
			# Joints on the teal glass panels, as on the tiled panels in the photos.
			var side: int = bay if bay >= 0 else -bay - 1
			var panel := (k in [3, 4] and side >= 2 and side <= 4) or (k in [1, 2] and side >= 5 and side <= 8)
			if panel or (k == 6 and side >= 7):
				for dx in [-1.4, 0.0, 1.4]:
					w.box(Vector3(0.03, 2.1, 0.02), Vector3(x + dx, y + 1.2, -0.4), joint)
				w.box(Vector3(4.2, 0.03, 0.02), Vector3(x, y + 1.2, -0.4), joint)
	# A few rooms' worth of light on the balcony ceilings at night.
	for x in [-36.0, -20.0, 20.0, 36.0]:
		w._omni(Vector3(x, GROUND + 3.0 * STOREY - 0.8, -2.0), Color("f3f1ea"), 1.2, 9.0)
	_cladding()
	_entrance_details()
	_roofline()

## Panel joints on the centre tower's silver cladding (behind the cream frames).
func _cladding() -> void:
	var seam: Material = w.material("plain", Color("aab1b3"))
	var top := ROOF + 2.6
	var y := GROUND + 3.0 * STOREY + 0.6
	while y < top:
		w.box(Vector3(2.0 * TOWER, 0.04, 0.02), Vector3(0, y, 1.01), seam)
		y += 1.1
	var x := -TOWER + 1.2
	while x < TOWER:
		w.box(Vector3(0.04, top - GROUND - 3.0 * STOREY, 0.02), Vector3(x, (top + GROUND + 3.0 * STOREY) / 2.0, 1.01), seam)
		x += 1.2

## Stone joints on the brown entrance block, the sign lit from below at night, and
## downlights under the canopy.
func _entrance_details() -> void:
	var joint: Material = w.material("plain", Color("7d6656"))
	var band := GROUND + 3.0 * STOREY
	var lower := GROUND + 1.6
	var y := lower + 0.6
	while y < band - 2.2:
		w.box(Vector3(2.0 * TOWER - 0.6, 0.03, 0.01), Vector3(0, y, 1.115), joint)
		y += 0.6
	for side in [-1.0, 1.0]:
		var z := 0.6
		while z < lower:
			w.box(Vector3(4.4, 0.03, 0.01), Vector3(side * 7.0, z, 1.115), joint)
			z += 0.6
		var x := 5.0
		while x < 9.2:
			w.box(Vector3(0.03, lower, 0.01), Vector3(side * x, lower / 2.0, 1.115), joint)
			x += 1.2
	var x := -TOWER + 1.5
	while x < TOWER - 0.4:
		w.box(Vector3(0.03, band - 2.2 - lower, 0.01), Vector3(x, (band - 2.2 + lower) / 2.0, 1.115), joint)
		x += 1.2
	# The sign's backlight: a warm strip under the letters, glowing at night.
	w.box(Vector3(7.6, 0.05, 0.06), Vector3(0, GROUND + 2.72, 1.2), w.glow(Color("ffe2b0"), 0.0, 2.6))
	w._omni(Vector3(0, GROUND + 2.6, 1.8), Color("ffe2b0"), 1.0, 4.0)
	for spot in [-4.5, -1.5, 1.5, 4.5]:
		w.box(Vector3(0.22, 0.03, 0.22), Vector3(spot, GROUND - 0.4, 2.4), w.glow(Color("fff1d6"), 0.2, 2.4))
	for spot in [-3.0, 3.0]:
		w._omni(Vector3(spot, GROUND - 0.8, 2.4), Color("ffd9a0"), 1.4, 6.0)

## The roof's overhang and fascia, AC units along the top floor, and the telecom tower
## that stands behind the west wing (it shows over the roof in the front photo).
func _roofline() -> void:
	var fascia: Material = w.material("stucco", Color("ecebe5"))
	var soffit: Material = w.material("stucco", Color("bdbdb6"))
	w.box(Vector3(2.0 * HALF - 9.0, 0.2, 1.6), Vector3(0, ROOF + 0.35, 0.3), soffit)
	w.box(Vector3(2.0 * HALF - 9.0, 0.5, 0.16), Vector3(0, ROOF + 0.45, 1.1), fascia)
	var unit: Material = w.material("plain", Color("e8e8e2"))
	var grille: Material = w.material("plain", Color("3f4446"))
	var y := GROUND + (FLOORS - 1) * STOREY
	var x := -WALK_END + 2.0
	while x < WALK_END:
		if absf(x) > TOWER + 1.5:
			w.box(Vector3(0.8, 0.5, 0.36), Vector3(x, y + 0.3, -0.62), unit)
			w.box(Vector3(0.6, 0.32, 0.02), Vector3(x, y + 0.3, -0.43), grille)
		x += 6.3
	# The telecom tower: four tapering legs, cross braces, red and white bands, a mast.
	var foot := Vector3(-(HALF - 12.0), ROOF + 0.4, -12.0) # the east end: left of the front photo
	var height := 16.0
	var red := Color("c4402e")
	var white := Color("eeeeea")
	var legs: Array[Vector3] = []
	for corner in [Vector2(-1, -1), Vector2(1, -1), Vector2(1, 1), Vector2(-1, 1)]:
		legs.append(Vector3(corner.x, 0, corner.y))
	for i in 4:
		w.rod(foot + legs[i] * 1.2, foot + legs[i] * 0.35 + Vector3(0, height, 0), 0.06, Color("b9bdbd"))
	for level in 8:
		var t0 := float(level) / 8.0
		var t1 := float(level + 1) / 8.0
		var colour := red if level % 2 == 0 else white
		for i in 4:
			var a := legs[i]
			var b := legs[(i + 1) % 4]
			var p0 := foot + a * lerpf(1.2, 0.35, t0) + Vector3(0, height * t0, 0)
			var p1 := foot + b * lerpf(1.2, 0.35, t1) + Vector3(0, height * t1, 0)
			w.rod(p0, p1, 0.025, colour)
	w.rod(foot + Vector3(0, height, 0), foot + Vector3(0, height + 3.0, 0), 0.05, red)
	for i in 3:
		w.box(Vector3(0.25, 0.9, 0.12), foot + Vector3(0.3 - i * 0.3, height - 1.0, 0.4), w.material("plain", Color("dfe1df")))

# --- The back (from the SJH rear photos) -------------------------------------------------

## The back facade: on every floor a white slab standing out as a sunshade over a cream
## wall between white piers, brown-framed windows with silver window-AC hoods, a few bays
## of brown louvres; the plinth with its basement louvres; rusticated end blocks with a
## vent; downpipes and a dark eave. Built over the body's plain back face.
func _rear() -> void:
	var out := Vector3(0, 0, -1)
	var white: Material = w.material("stucco", Color("f4f4ef"))
	var cream: Material = w.material("stucco", Color("f6ecd0"))
	var brown := Color("5b4334")
	var hood: Material = w.material("metal", Color("d3d6d4"))
	var grille: Material = w.material("plain", Color("3f4446"))
	var louvre: Material = w.material("wood", Color("6e4a3a"))
	var slat: Material = w.material("plain", Color("4a3328"))
	var span := 2.0 * (HALF - 5.9)
	for k in range(0, FLOORS + 1):
		var y := 1.0 if k == 0 else GROUND + (k - 1) * STOREY
		var tall := GROUND - 1.0 if k == 0 else STOREY - 0.3
		w.box(Vector3(span, tall, 0.06), Vector3(0, y + tall / 2.0, BACK - 0.04), cream)
		if k > 0:
			w.box(Vector3(span + 0.4, 0.3, 0.9), Vector3(0, y - 0.15, BACK - 0.45), white) # the slab's sunshade
		var px := -42.0
		while px <= 42.0:
			w.box(Vector3(0.5, tall, 0.3), Vector3(px, y + tall / 2.0, BACK - 0.15), white)
			px += 4.2
		for bay in range(-10, 10):
			var x := (bay + 0.5) * 4.2
			if k == 0:
				# The ground floor, behind the sheds and carports: windows where nothing tall stands.
				var hidden := absf(x - 10.5) < 2.0
				for solid in REAR_SOLID:
					hidden = hidden or (solid.z > 4.0 and x > solid.x - 1.5 and x < solid.y + 1.5)
				if not hidden:
					w.framed_window(Vector3(x, 2.6, BACK - 0.07), 3.0, 1.4, out, false, 3, brown)
				for dx in [-0.9, 0.9]:
					w.box(Vector3(1.5, 0.55, 0.04), Vector3(x + dx, 0.5, BACK - 0.27), grille) # basement louvres
				continue
			if bay in LOUVRE_BAYS:
				w.box(Vector3(3.2, 2.4, 0.08), Vector3(x, y + 1.4, BACK - 0.08), louvre)
				for s in 8:
					w.box(Vector3(3.2, 0.05, 0.1), Vector3(x, y + 0.35 + s * 0.3, BACK - 0.14), slat)
				continue
			w.framed_window(Vector3(x, y + 1.6, BACK - 0.07), 3.0, 1.4, out, posmod(bay * 7 + k * 3, 5) == 0, 3, brown)
			if posmod(bay * 3 + k * 5, 4) != 0:
				# A window AC unit in its silver hood, at one side of the window.
				var hx := x - 0.85 + 1.7 * posmod(bay + k, 2)
				w.box(Vector3(0.75, 0.55, 0.6), Vector3(hx, y + 1.15, BACK - 0.38), hood)
				w.box(Vector3(0.6, 0.4, 0.02), Vector3(hx, y + 1.15, BACK - 0.69), grille)
				w.streak(Vector3(hx, y + 0.85, BACK - 0.07), 0.7, out)
	w.box(Vector3(span, 1.0, 0.25), Vector3(0, 0.5, BACK - 0.12), white) # the plinth
	# The end blocks: rusticated, a square vent low down.
	for side in [-1.0, 1.0]:
		var cx: float = side * (HALF - 2.95)
		var groove := 0.75
		while groove < ROOF:
			w.box(Vector3(5.9, 0.05, 0.04), Vector3(cx, groove, BACK - 0.02), w.material("plain", Color("cfccc2")))
			groove += 0.75
		w.box(Vector3(0.8, 0.8, 0.05), Vector3(cx, 2.2, BACK - 0.03), grille)
	for x in [-41.0, -21.0, 0.0, 21.0, 41.0]:
		w.rod(Vector3(x, 0.0, BACK - 0.35), Vector3(x, ROOF, BACK - 0.35), 0.06, Color("e9e9e3"))
	w.box(Vector3(2.0 * HALF + 0.4, 0.45, 0.2), Vector3(0, ROOF + 0.2, BACK - 0.3), w.material("plain", Color("5d6062")))
	# The back entrance: a dark opening up five steps from a terracotta landing, a steel
	# handrail, a pipe across and a split AC unit over it.
	w.box(Vector3(2.6, 2.6, 0.05), Vector3(10.5, 0.75 + 1.3, BACK - 0.09), w.material("plain", Color("2a2c2d")))
	for s in 5:
		var deep := 0.3 * (5 - s)
		var step: Material = w.material("stone", Color("bdb3a6")) if s > 0 else w.material("brick", Color("c0745c"))
		w.box(Vector3(2.6, 0.15, deep), Vector3(10.5, 0.075 + 0.15 * s, BACK - deep / 2.0), step)
	w.rod(Vector3(9.3, 0.9, BACK - 1.5), Vector3(9.3, 1.65, BACK - 0.2), 0.03, Color("b9bcbc"))
	w.rod(Vector3(6.0, 3.3, BACK - 0.2), Vector3(14.0, 3.3, BACK - 0.2), 0.07, Color("e9e9e3"))
	w.box(Vector3(0.9, 0.6, 0.35), Vector3(11.4, 3.7, BACK - 0.2), w.material("plain", Color("e8e8e2")))

## On the ground along the back, east (the gym's end) to west, in the photos' order: the
## palm strip, the basement ramp under its pergola, motorcycles, the yellow shed, the parked
## cars and carports (HAU VEHICLE ONLY), the louvred utility block, the patched shed and its
## red vehicle, the low carport. Across the lane: the trench grate, the dirt strip, the
## power poles and the perimeter wall.
func _rear_ground() -> void:
	var length := LANE_EAST + HALF
	var middle := (HALF - LANE_EAST) / 2.0
	var lot: Material = w.material("concrete", Color("c9c7c0"))
	var dark: Material = w.material("plain", Color("3a3633"))
	var rust: Material = w.material("plain", Color("6b3f2c"))
	var roof: Material = w.material("ribbed", Color("5a5f62"))
	w.box(Vector3(length, 0.1, BACK - LANE_EDGE), Vector3(middle, -0.09, (BACK + LANE_EDGE) / 2.0), lot)
	w.box(Vector3(length, 0.012, 0.3), Vector3(middle, -0.035, BACK - 5.6), w.material("brick", Color("c0745c")))
	w.box(Vector3(length, 0.012, 0.4), Vector3(middle, -0.035, LANE_EDGE + 0.25), dark)
	w.box(Vector3(length, 0.1, LANE_EDGE - BOUNDARY), Vector3(middle, -0.12, (LANE_EDGE + BOUNDARY) / 2.0), w.material("dirt"))
	# The perimeter wall: grey west of the gate pillar, maroon with a white iron railing on
	# top east of it (photo 2).
	var grey := HALF + 0.5 - GATE
	w.box(Vector3(grey, 2.6, 0.3), Vector3(GATE + grey / 2.0, 1.1, BOUNDARY), w.material("stucco", Color("aeaba1")))
	var maroon := GATE + LANE_EAST + 0.5
	w.box(Vector3(maroon, 2.2, 0.3), Vector3(GATE - maroon / 2.0, 0.9, BOUNDARY), w.material("stucco", Color("6e2a35")))
	var iron: Material = w.material("plain", Color("e6e4dc"))
	for y in [2.05, 2.75]:
		w.box(Vector3(maroon, 0.05, 0.05), Vector3(GATE - maroon / 2.0, y, BOUNDARY), iron)
	var bar := GATE - 0.2
	while bar > -LANE_EAST - 0.5:
		w.box(Vector3(0.03, 0.7, 0.03), Vector3(bar, 2.4, BOUNDARY), iron)
		w.box(Vector3(0.12, 0.03, 0.03), Vector3(bar, 2.55 + 0.1 * posmod(roundi(bar * 5.0), 2), BOUNDARY), iron)
		bar -= 0.2
	w.box(Vector3(0.3, 2.6, BACK - BOUNDARY), Vector3(HALF + 0.3, 1.1, (BACK + BOUNDARY) / 2.0), w.material("stucco", Color("aeaba1")))
	# The palm strip at the east corner (photo 2): grass inside a rounded concrete kerb
	# that turns in to the wall at the ramp, a garden hose across it, and the wet
	# stain the hose leaves down the lane's edge of the kerb.
	var kerb: Material = w.material("stucco", Color("cfc9b8"))
	w.box(Vector3(9.3, 0.12, 2.4), Vector3(-43.25, -0.1, BACK - 1.2), w.material("grass"))
	w.box(Vector3(8.6, 0.22, 0.2), Vector3(-43.6, 0.0, BACK - 2.45), kerb)
	w.box(Vector3(1.2, 0.22, 0.2), Vector3(-38.95, 0.0, BACK - 2.1), kerb, PI / 4.0)
	w.box(Vector3(0.2, 0.22, 1.6), Vector3(-38.6, 0.0, BACK - 0.9), kerb)
	var hose := [Vector3(-46.8, 0.03, BACK - 0.3), Vector3(-45.2, 0.03, BACK - 1.6), Vector3(-42.5, 0.03, BACK - 2.1),
		Vector3(-41.6, 0.14, BACK - 2.5), Vector3(-41.0, -0.03, BACK - 2.75), Vector3(-38.0, -0.03, BACK - 3.0)]
	for i in hose.size() - 1:
		w.rod(hose[i], hose[i + 1], 0.012, Color("ecebe4"))
	var wet: Material = w.material("plain", Color("4f5352"))
	for stain in [Vector3(-46.0, 3.2, 0.5), Vector3(-43.0, 2.6, 0.7), Vector3(-40.6, 2.0, 0.9), Vector3(-37.4, 1.4, 0.6)]:
		w.box(Vector3(stain.y, 0.006, stain.z), Vector3(stain.x, -0.034, BACK - 2.55 - stain.z / 2.0), wet)
	# The basement ramp: low walls, a dark mouth, the grate, the rusty pergola and its screens.
	# shortcut: the ramp only dips 0.15 m (the lawn under the scene sits at -0.2); cut a real pit if one is ever walked into.
	w.box(Vector3(5.0, 0.02, 6.0), Vector3(-35.7, -0.03, BACK - 3.0), w.material("concrete", Color("8f9089")), 0.0, -0.025)
	w.box(Vector3(4.8, 2.4, 0.05), Vector3(-35.7, 1.0, BACK - 0.1), w.material("plain", Color("16181a")))
	w.box(Vector3(5.0, 0.012, 0.5), Vector3(-35.7, -0.025, BACK - 6.0), dark)
	for sx in [-2.6, 2.6]:
		w.box(Vector3(0.25, 0.9, 6.0), Vector3(-35.7 + sx, 0.45, BACK - 3.0), w.material("concrete", Color("d6d4cc")))
		w.box(Vector3(0.06, 1.1, 5.6), Vector3(-35.7 + sx, 1.5, BACK - 3.0), w.material("wood", Color("6e4a3a")))
		w.box(Vector3(0.15, 0.22, 6.6), Vector3(-35.7 + sx, 3.6, BACK - 3.1), rust)
		for z in [BACK - 0.3, BACK - 6.0]:
			w.box(Vector3(0.12, 3.6, 0.12), Vector3(-35.7 + sx, 1.8, z), rust)
	for i in 11:
		w.box(Vector3(5.8, 0.1, 0.14), Vector3(-35.7, 3.76, BACK - 0.4 - i * 0.6), rust)
	# Motorcycles, nosed to the wall.
	for bike in [[-31.1, Color("3fb6b0")], [-30.4, Color("1d2024")], [-29.7, Color("1d2024")]]:
		var at := Vector3(bike[0], 0.0, BACK - 1.2)
		w.box(Vector3(0.3, 0.45, 1.5), at + Vector3(0, 0.6, 0), w.material("plain", bike[1]))
		w.box(Vector3(0.26, 0.1, 0.7), at + Vector3(0, 0.88, 0.1), w.material("plain", Color("1b1b1b")))
		for dz in [-0.6, 0.6]:
			w.box(Vector3(0.1, 0.55, 0.55), at + Vector3(0, 0.28, dz), w.material("plain", Color("1b1b1b")))
	# The yellow shed: ribbed cream-yellow sheet on a dark lean-to roof.
	w.box(Vector3(5.8, 3.4, 4.6), Vector3(-24.9, 1.6, BACK - 2.3), w.material("metal", Color("e2cf97")))
	var rib := -27.7
	while rib < -22.0:
		w.box(Vector3(0.06, 3.3, 0.05), Vector3(rib, 1.6, BACK - 4.62), w.material("plain", Color("cbb882")))
		rib += 0.45
	w.box(Vector3(6.2, 0.08, 5.0), Vector3(-24.9, 3.36, BACK - 2.4), roof)
	# The carports: dark ribbed roofs on steel posts with braces.
	for port in CARPORTS:
		var at := Vector3((port.x + port.y) / 2.0, port.z, BACK - port.w / 2.0)
		w.box(Vector3(port.y - port.x, 0.1, port.w), at, roof)
	for post in carport_posts():
		var port := CARPORTS[0]
		for each in CARPORTS:
			if post.x >= each.x and post.x <= each.y:
				port = each
		w.rod(Vector3(post.x, 0.0, post.y), Vector3(post.x, port.z, post.y), 0.05, Color("9aa0a2"))
		w.rod(Vector3(post.x, port.z - 0.9, post.y), Vector3(post.x, port.z, post.y + 1.2), 0.03, Color("9aa0a2"))
	w.box(Vector3(0.06, 3.1, 6.0), Vector3(-9.6, 1.55, BACK - 3.0), roof) # HAU carport's closed east end
	for x in [-6.6, -0.8]:
		w.box(Vector3(2.2, 0.32, 0.03), Vector3(x, 2.8, BACK - 5.88), w.material("plain", Color("f2f2ee")))
		var hau := w.panel("HAU VEHICLE ONLY", Vector3(x, 2.8, BACK - 5.91), 2.0, 0.26, Color("1d2022")) as Label3D
		hau.rotation.y = PI # facing the lane (-z)
	# The utility block: white, three tall dark louvres.
	w.box(Vector3(5.0, 3.6, 4.2), Vector3(5.9, 1.8, BACK - 2.1), w.material("stucco", Color("eceae3")))
	for i in 3:
		w.box(Vector3(0.8, 2.6, 0.05), Vector3(4.4 + i * 1.5, 1.7, BACK - 4.23), w.material("plain", Color("3f4446")))
	# The patched shed: corrugated panels in white, yellow and blue-grey, a green post.
	var patches: Array[Color] = [Color("e4e2da"), Color("d9b65a"), Color("8794a0")]
	for i in 3:
		w.box(Vector3(0.06, 3.0, 1.7), Vector3(12.35, 1.5, BACK - 0.9 - i * 1.7), w.material("metal", patches[i]))
	w.box(Vector3(6.2, 0.08, 5.4), Vector3(15.2, 3.1, BACK - 2.7), roof)
	w.box(Vector3(0.25, 3.1, 0.25), Vector3(12.35, 1.55, BACK - 5.2), w.material("plain", Color("2f5b3a")))
	# The NO PARKING sign in front of the back entrance.
	var sign_at := Vector3(10.5, 0.95, BACK - 4.6)
	w.box(Vector3(0.8, 0.6, 0.03), sign_at + Vector3(0, 0, 0.02), w.material("plain", Color("efe39a")))
	var no_parking := w.panel("NO PARKING", sign_at + Vector3(0, 0, -0.01), 0.7, 0.4, Color("1d2022")) as Label3D
	no_parking.rotation.y = PI
	for dx in [-0.38, 0.38]:
		w.rod(sign_at + Vector3(dx, -0.95, -0.15), sign_at + Vector3(dx, 0.3, 0.02), 0.02, Color("c9b85a"))
	for car in REAR_CARS:
		var at := Vector3(car[0], -0.04, BACK - 2.8)
		if car[1] == 0:
			_car(at, Color(car[2]), -1.0)
		else:
			_van(at, Color(car[2]), car[1] == 2)
	# Power poles along the wall, two transformers on the east one, the wires between.
	var tops: Array[Vector3] = []
	for px in [-50.2, -8.0, 30.0]:
		var foot := Vector3(px, 0.0, LANE_EDGE - 0.9)
		w.rod(foot, foot + Vector3(0, 9.5, 0), 0.14, Color("9a9a94"))
		tops.append(foot + Vector3(0, 9.2, 0))
	# At the east pole (photo 2): two grey transformers hung on brackets, one above the
	# other; the gate pillar beside it with the yellow meter box at its foot, and a pile of
	# cut branches on the dirt.
	var drum := CylinderMesh.new()
	drum.top_radius = 0.34
	drum.bottom_radius = 0.34
	drum.height = 0.85
	drum.radial_segments = 12
	var grey_metal: Material = w.material("metal", Color("b4b8b8"))
	for hang in [Vector3(-0.5, -1.0, 0.0), Vector3(0.45, -2.3, 0.1)]:
		w._mesh(drum, tops[0] + hang, grey_metal)
		w.box(Vector3(0.72, 0.06, 0.72), tops[0] + hang + Vector3(0, 0.45, 0), grey_metal)
		w.box(Vector3(0.5, 0.08, 0.08), tops[0] + hang * Vector3(0.5, 1, 1) + Vector3(0, 0.3, 0), grey_metal)
	var pillar := Vector3(GATE, 0.0, LANE_EDGE - 0.7)
	w.box(Vector3(0.75, 4.2, 0.75), pillar + Vector3(0, 2.1, 0), w.material("concrete", Color("b8b6ae")))
	w.box(Vector3(0.55, 1.0, 0.35), pillar + Vector3(-0.1, 0.5, 0.58), w.material("plain", Color("e3b32e")))
	var cut: Array[Color] = [Color("3d5a2a"), Color("56763a"), Color("7a8c48"), Color("a39a5c"), Color("6a6a40")]
	for heap in [Vector2(-1.6, 0.9), Vector2(-2.6, 0.8), Vector2(-3.4, 0.7)]:
		_pile_at.append([pillar + Vector3(heap.x, 0.0, -0.6), heap.y, cut])
	w.rod(pillar + Vector3(-3.6, 0.15, -0.2), pillar + Vector3(-0.8, 0.05, 0.4), 0.03, Color("b9a06a"))
	# The wires: three runs along the wall, two drops from the east pole to the corner.
	for i in tops.size() - 1:
		for dy in [0.0, 0.4, -0.5]:
			w.rod(tops[i] + Vector3(0, dy, 0), tops[i + 1] + Vector3(0, dy - 0.3, 0), 0.015, Color("26282a"))
	for dy in [0.2, -0.3]:
		w.rod(tops[0] + Vector3(0, dy, 0), Vector3(-HALF + 0.3, 8.6 + dy, BACK - 0.1), 0.015, Color("26282a"))

## A van or a pickup nosed out from the wall (-z): a tall body with the vans' brown and
## orange stripe, or a cab and an open bed; a dark windscreen, wheels and lights.
func _van(at: Vector3, colour: Color, pickup: bool) -> void:
	var paint: Material = w.material("plain", colour)
	if pickup:
		w.box(Vector3(1.8, 1.25, 1.9), at + Vector3(0, 1.2, -1.45), paint)
		w.box(Vector3(1.8, 0.75, 3.0), at + Vector3(0, 0.8, 0.95), paint)
	else:
		w.box(Vector3(1.85, 1.6, 4.9), at + Vector3(0, 1.15, 0), paint)
		w.box(Vector3(1.87, 0.12, 4.2), at + Vector3(0, 1.0, 0.2), w.material("plain", Color("8a4a2c")))
	w.box(Vector3(1.6, 0.6, 0.05), at + Vector3(0, 1.55, -2.45), w.material("glass", Color("2d3a42")))
	var wheel := CylinderMesh.new()
	wheel.top_radius = 0.36
	wheel.bottom_radius = 0.36
	wheel.height = 0.24
	wheel.radial_segments = 10
	for dx in [-0.85, 0.85]:
		for dz in [-1.6, 1.6]:
			var tyre: MeshInstance3D = w._mesh(wheel, at + Vector3(dx, 0.36, dz), w.material("plain", Color("1b1b1b")))
			tyre.rotation = Vector3(0, 0, PI / 2.0)
	for dx in [-0.62, 0.62]:
		w.box(Vector3(0.36, 0.14, 0.04), at + Vector3(dx, 0.9, -2.45), w.glow(Color("f2efe2"), 0.2, 1.0))

## The paving of the lane round the east end (5 mm under the road's sidewalk), and the
## palm and shrubs at the east corner (world). The photos' trees along the perimeter wall
## are left out: the camera always looks across them, and its cut cannot hold them back.
func _rear_planting() -> void:
	w.box(Vector3(ACCESS.size.x, 0.1, ACCESS.size.y), Vector3(ACCESS.get_center().x, -0.095, ACCESS.get_center().y),
		w.material("concrete", Color("c9c7c0")))
	var palms := Chapel.new()
	palms.w = w
	var palm := world(-44.5, BACK - 1.2)
	palms._palm(Vector3(palm.x, 0.0, palm.y), 6.5, 801)
	# Along the strip as in photo 2: a big clipped ficus by the corner, a golden bush, small
	# dark round ones, another ficus by the ramp.
	var ficus: Array[Color] = [Color("6f9a2e"), Color("8fb83a"), Color("a9cc4a"), Color("c3dc6a"), Color("7fa832")]
	var golden: Array[Color] = [Color("8a9a3a"), Color("aab448"), Color("c8c45a"), Color("9aa83e"), Color("dcd47a")]
	for bush in [[-46.6, -1.1, 1.8, ficus], [-44.9, -0.7, 1.0, w.HEDGE_COLORS], [-43.3, -1.3, 1.5, golden],
			[-41.9, -1.6, 1.0, w.HEDGE_COLORS], [-40.6, -0.9, 1.1, w.HEDGE_COLORS], [-39.6, -1.0, 1.2, ficus]]:
		var at := world(bush[0], BACK + bush[1])
		w._shrub(Vector3(at.x, 0.05, at.y), bush[2], 802 + roundi(bush[0] * 10.0), bush[3])
	for pile in _pile_at:
		var at := world(pile[0].x, pile[0].z)
		w._shrub(Vector3(at.x, -0.25, at.y), pile[1], 830 + roundi(pile[0].x * 10.0), pile[2])

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
	# The chapel-side row's slanted bay lines, between the cars.
	var x := PARKING.position.x + 1.4 - SLANT_BAY / 2.0
	while x <= PARKING.end.x:
		w.box(Vector3(0.08, 0.012, 5.0), Vector3(x, -0.035, PARKING.position.y + 4.5), paint, SLANT)
		x += SLANT_BAY
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
		_car(Vector3(car.x, -0.04, car.y), colours[int(car.z)], -1.0, slant_for(car.y))

## A parked car: body, cabin glass, wheels and lights; `nose` +1 faces +z, -1 faces -z,
## then the whole car turned by `turn` about the vertical.
func _car(at: Vector3, colour: Color, nose := 1.0, turn := 0.0) -> void:
	var spin := Basis(Vector3.UP, turn)
	var paint: Material = w.material("plain", colour)
	var glass: Material = w.material("glass", Color("2d3a42"))
	w.box(Vector3(1.78, 0.62, 4.3), at + spin * Vector3(0, 0.62, 0), paint, turn)
	w.box(Vector3(1.6, 0.52, 2.2), at + spin * Vector3(0, 1.18, -0.25 * nose), glass, turn)
	w.box(Vector3(1.5, 0.08, 2.0), at + spin * Vector3(0, 1.47, -0.25 * nose), paint, turn)
	var wheel := CylinderMesh.new()
	wheel.top_radius = 0.33
	wheel.bottom_radius = 0.33
	wheel.height = 0.24
	wheel.radial_segments = 10
	for dx in [-0.82, 0.82]:
		for dz in [-1.35, 1.35]:
			var tyre: MeshInstance3D = w._mesh(wheel, at + spin * Vector3(dx, 0.33, dz), w.material("plain", Color("1b1b1b")))
			tyre.rotation = Vector3(0, turn, PI / 2.0)
	for dx in [-0.6, 0.6]:
		w.box(Vector3(0.36, 0.12, 0.04), at + spin * Vector3(dx, 0.78, 2.16 * nose), w.glow(Color("f2efe2"), 0.2, 1.0), turn)
		w.box(Vector3(0.36, 0.12, 0.04), at + spin * Vector3(dx, 0.78, -2.16 * nose), w.material("plain", Color("a3262a")), turn)

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

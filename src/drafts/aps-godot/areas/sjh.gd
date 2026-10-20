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
## The ground floor, from the SJH ground floor photos (assets/images/buildings/SJH
## BUILDING/ground floor/): the cars park at road level and the walkway stands raised on
## a cream plinth over a planter terrace behind a low stone wall, up steps at the
## railing gaps. Square clad piers
## stand along it, with bar tables and wooden chairs and the three bins; the floor is
## cream tiles in grey and maroon diamonds, the inner wall has the room doors, notice
## boards and high windows. In the centre tower the elevator lobby opens between two
## grey pillars up wide steps. At the west end a passage runs through the terracotta
## block to steps down its west face, a ramp runs up along its front, and a lane runs
## south between SJH and MGN under the bridge that joins them upstairs (built in
## areas/mgn.gd).
##
## Built in its own frame under a pivot ("SJH"): local x along the front (+x is west),
## local +z out of the front (north), local z 0 the plot's front edge.

const Chapel := preload("res://areas/chapel.gd")
const Roads := preload("res://roads.gd")

## The plot's front edge (plan outline): east end, west end, set back SETBACK metres
## from it. Mikko's map (2026-10-16) has SJH further from the road than the OSM outline,
## with a second row of parked cars and the Mary statue between it and the road; 2 m
## more (2026-10-20) leave room for the brown sidewalk and the grass strip in front.
const SETBACK := 12.0
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
const WALK_Y := 0.9
const CEILING := 3.55
## The front, from the walkway out to the cars (as in RIGHT SIDE.JPG): a raised planter
## against the plinth out to PLANTER_Z; the brown paver sidewalk at LANDING_Y out to
## WALK_EDGE, sloping down to the ground over END_SLOPE at both ends; beside it at the same
## height a grass and bamboo strip, held up by a low stone wall at the kerb (KERB_Z) by
## the parked cars. At the lobby
## the long stair runs out to the kerb. Risers RISER, treads TREAD (the passage's steps
## at the west end PASSAGE_TREAD).
const PLINTH_Z := 0.3
const RISER := 0.1
const TREAD := 0.33
const LANDING_Y := 0.5
const FLIGHT_STEPS := 5
const PLANTER_Z := 1.6
const WALK_EDGE := 3.6
const END_SLOPE := 6.0
const PASSAGE_TREAD := 0.3
const PASSAGE_STEPS := 9
## The square clad piers along the walkway (local |x|) and the depth they stand in.
const PIERS: Array[float] = [12.6, 21.0, 29.4, 37.8]
const PIER_Z := Vector2(-0.9, -0.1)
## Bar tables with wooden chairs along the piers (|x|), and the three bins (the first's
## x, all at one depth) by a pier on the east side.
const TABLES: Array[float] = [14.4, 23.2, 27.2, 31.2]
const TABLE_Z := -1.45
const BINS := Vector2(-19.9, -1.25)
## The elevator lobby in the centre tower: open between its grey pillars (LOBBY either
## side of the middle) back to the inner wall. In front, across the tower's width, the
## stairs: UPPER_STEPS up to the floor, a landing LOBBY_LANDING deep standing out from
## the one along the building, and its own flight down to the sidewalk; handrails on the
## steps, and a raised planter box past the west pillar (local x range).
const LOBBY := 7.6
const TOWER_FRONT := 1.0
const LOBBY_STEPS := TOWER
const UPPER_STEPS := 4
const UPPER_END := TOWER_FRONT + UPPER_STEPS * TREAD
const LOBBY_LANDING := 2.0
const LOBBY_FLIGHT := UPPER_END + LOBBY_LANDING
const LOBBY_FOOT := LOBBY_FLIGHT + FLIGHT_STEPS * TREAD
const KERB_Z := LOBBY_FOOT
const LOBBY_BOX := Vector2(9.5, 12.1)
## The flight down from the landing is LOWER_HALF either side of the middle, its handrails
## at its edges; either side of it the pavers run on at the landing's height to the kerb.
const LOWER_HALF := 7.0
const LOBBY_RAILS: Array[float] = [-6.9, 6.9]
## The west end (local +x): the passage through the terracotta block (z range), its
## steps down the block's west face, the ramp along its front (z range) from its foot up
## to a landing at the walkway's end, the yard at the foot, and the lane south between
## SJH and MGN (Rect2s in local x, z).
const PINK_FACE := 45.3
const PASSAGE := Vector2(-1.9, 0.2)
const RAMP := Vector2(0.7, 2.3)
const RAMP_FOOT := 49.5
const LANDING := 38.4
const YARD_END := 51.0
const LANE := Rect2(49.95, -11.05, 2.65, 13.65)
const LANE_BACK := Rect2(48.05, -19.2, 2.85, 8.15)
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

## The raised floor at WALK_Y: the walkway, the lobby, the passage through the west
## terracotta block and the landing at the top of the ramp (local x, z).
static func _deck(u: float, v: float) -> bool:
	if v <= WALL_Z + 0.25:
		return false
	if absf(u) < WALK_END and v < PLINTH_Z:
		return true
	if absf(u) < LOBBY and v < TOWER_FRONT:
		return true
	if u >= WALK_END and u < PINK_FACE and v > PASSAGE.x and v < PASSAGE.y:
		return true
	return u > LANDING and u < WALK_END and v >= PLINTH_Z and v < RAMP.y

## The height on the front's steps and landings, the passage's steps or the ramp
## (local x, z), or NAN off them.
static func _stair(u: float, v: float) -> float:
	if absf(u) < LOBBY_STEPS and v >= TOWER_FRONT and v < LOBBY_FOOT:
		if v < UPPER_END:
			return _down(WALK_Y, (v - TOWER_FRONT) / TREAD)
		if v < LOBBY_FLIGHT or absf(u) >= LOWER_HALF:
			return LANDING_Y # the landing, and the pavers either side of the flight
		return _down(LANDING_Y, (v - LOBBY_FLIGHT) / TREAD)
	if absf(u) >= LOBBY_STEPS and u > -WALK_END and u < LANDING and v >= PLANTER_Z and v < WALK_EDGE:
		return _sidewalk(u)
	if v > PASSAGE.x and v < PASSAGE.y and u >= PINK_FACE and u < PINK_FACE + PASSAGE_STEPS * PASSAGE_TREAD:
		return _down(WALK_Y, (u - PINK_FACE) / PASSAGE_TREAD)
	if v > RAMP.x and v < RAMP.y and u >= WALK_END and u < RAMP_FOOT:
		return lerpf(WALK_Y, -0.04, (u - WALK_END) / (RAMP_FOOT - WALK_END))
	return NAN

## The brown sidewalk's height along the front: level at the landing, sloping down to the
## ground at the east end and at the ramp's landing.
static func _sidewalk(u: float) -> float:
	return lerpf(-0.04, LANDING_Y, clampf(minf(u + WALK_END, LANDING - u) / END_SLOPE, 0.0, 1.0))

## The top of the step that many treads down from a floor at `top`.
static func _down(top: float, treads: float) -> float:
	return top - RISER * (floorf(treads) + 1.0)

## The ground at the west end: the yard at the foot of the steps and the ramp, and the
## lane south between SJH and MGN.
static func _yard(u: float, v: float) -> bool:
	if u > PINK_FACE + PASSAGE_STEPS * PASSAGE_TREAD and u < YARD_END and v > PASSAGE.x and v <= RAMP.x:
		return true
	if u >= RAMP_FOOT and u < YARD_END and v > RAMP.x and v < RAMP.y + 0.3:
		return true
	return LANE.has_point(Vector2(u, v)) or LANE_BACK.has_point(Vector2(u, v))

static func in_walkway(x: float, z: float) -> bool:
	var at := local(x, z)
	return _deck(at.x, at.y)

## 0 outside, 1 inside the covered walkway, the lobby or the west passage: drives the
## camera's cutaway.
static func walkway_for(x: float, z: float) -> float:
	var at := local(x, z)
	var depth := 1.0 - smoothstep(-1.1, 0.0, at.y)
	var along := 1.0 - smoothstep(WALK_END - 0.6, WALK_END, absf(at.x))
	var corridor := depth * along * smoothstep(WALL_Z - 0.5, WALL_Z, at.y)
	var passage := smoothstep(WALK_END - 1.0, WALK_END, at.x) * (1.0 - smoothstep(PINK_FACE - 0.6, PINK_FACE, at.x)) \
		* smoothstep(PASSAGE.x - 0.3, PASSAGE.x + 0.3, at.y) * (1.0 - smoothstep(PASSAGE.y - 0.3, PASSAGE.y + 0.3, at.y))
	return maxf(corridor, passage)

## How far the camera should turn to face SJH: on the south road, the parking, the
## walkway, and at the west end (the yard, the steps, the lane) south of the road.
static func view_for(x: float, z: float) -> float:
	var front := smoothstep(99.0, 104.0, z) * smoothstep(-57.0, -51.0, x) * (1.0 - smoothstep(37.0, 42.0, x))
	var west := smoothstep(119.5, 122.5, z) * smoothstep(-66.0, -64.0, x) * (1.0 - smoothstep(-52.0, -50.0, x))
	return maxf(front, west)

static func on_parking(x: float, z: float) -> bool:
	return PARKING.has_point(Vector2(x, z)) or FRONT_ROW.has_point(Vector2(x, z))

## The paved ground between the road's sidewalk and SJH's front: the front car row and
## the walk up to the foot of the front's steps (at the ends, up to the terracotta blocks
## and the ramp).
static func in_front(x: float, z: float) -> bool:
	var at := local(x, z)
	var edge := 0.6
	if absf(at.x) < LOBBY_STEPS:
		edge = LOBBY_FOOT
	elif at.x > -WALK_END and at.x < LANDING:
		edge = KERB_Z
	elif at.x > 0.0:
		edge = RAMP.y + 0.1
	return absf(at.x) < YARD_END and at.y >= edge and at.y < SETBACK + 6.0 and Roads.across(x, z) < 4.0

static func walkable(x: float, z: float) -> bool:
	var at := local(x, z)
	return _deck(at.x, at.y) or not is_nan(_stair(at.x, at.y)) or _yard(at.x, at.y) or on_parking(x, z) or in_front(x, z)

static func blocked(x: float, z: float) -> bool:
	if ISLAND.has_point(Vector2(x, z)):
		return true
	var at := local(x, z)
	var u := at.x
	var v := at.y
	var on_deck := _deck(u, v)
	var footprint := absf(u) < HALF + 2.0 and v > -DEPTH - 0.5 and v < (TOWER_FRONT if absf(u) < TOWER else PLINTH_Z)
	if footprint and not on_deck and is_nan(_stair(u, v)) and not _yard(u, v):
		return true # the building, its end towers, the tower's pillars
	if absf(u) < WALK_END and v >= PLINTH_Z and v < KERB_Z and not on_deck and is_nan(_stair(u, v)):
		return true # the planter, the low wall and the grass strip
	if not is_nan(_stair(u, v)):
		for rail in LOBBY_RAILS:
			if absf(u - rail) < 0.08 and v > TOWER_FRONT:
				return true # the lobby steps' handrails
	if u > LOBBY_BOX.x and u < LOBBY_BOX.y and v > TOWER_FRONT and v < UPPER_END + 0.05:
		return true # the lobby's planter box
	if on_deck:
		var side := absf(u)
		if absf(v - RAIL_Z) < 0.2 and side > TOWER and side < WALK_END and u <= LANDING:
			return true # the railing
		if side > LOBBY and side < TOWER and v > -0.2:
			return true # the lobby's grey pillars
		for pier in PIERS:
			if absf(side - pier) < 0.55 and v > PIER_Z.x and v < PIER_Z.y:
				return true
		for table in TABLES:
			if absf(side - table) < 1.0 and absf(v - TABLE_Z) < 0.4:
				return true # a bar table and its chairs
		if u > BINS.x - 0.4 and u < BINS.x + 1.9 and absf(v - BINS.y) < 0.4:
			return true
		if u > LANDING - 0.12 and u < WALK_END and v > PLINTH_Z and (absf(u - LANDING) < 0.12 or v > RAMP.y - 0.12):
			return true # the landing's railing
	if u > WALK_END and u < RAMP_FOOT and (absf(v - RAMP.x) < 0.12 or absf(v - RAMP.y) < 0.12):
		return true # the ramp's railings
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
	var at := local(x, z)
	var stair := _stair(at.x, at.y)
	if not is_nan(stair):
		return stair
	if _deck(at.x, at.y):
		return WALK_Y
	if on_parking(x, z) or in_front(x, z) or _yard(at.x, at.y):
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
	_furniture()
	_lobby()
	_west_end()
	_details()
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
		if end < 0.0:
			w.box(Vector3(4.4, ROOF + 2.4, 7.0), Vector3(x0, (ROOF + 2.4) / 2.0, -3.0), terracotta)
		else:
			# The west block has the passage through it at walkway height: the block south
			# of it, a sliver north of it, and the block over it.
			var top := ROOF + 2.4
			var over := WALK_Y + 2.6
			w.box(Vector3(4.4, top, PASSAGE.x + 6.5), Vector3(x0, top / 2.0, (PASSAGE.x - 6.5) / 2.0), terracotta)
			w.box(Vector3(4.4, top, 0.5 - PASSAGE.y), Vector3(x0, top / 2.0, (PASSAGE.y + 0.5) / 2.0), terracotta)
			w.box(Vector3(4.4, top - over, PASSAGE.y - PASSAGE.x), Vector3(x0, (top + over) / 2.0, (PASSAGE.x + PASSAGE.y) / 2.0), terracotta)
			# Its west face is rusticated: deep horizontal grooves up two storeys.
			var groove: Material = w.material("plain", Color("97543f"))
			var y := 0.75
			while y < GROUND + 2.0 * STOREY:
				if y > over:
					w.box(Vector3(0.03, 0.04, 7.0), Vector3(PINK_FACE + 0.01, y, -3.0), groove)
				else:
					w.box(Vector3(0.03, 0.04, PASSAGE.x + 6.5), Vector3(PINK_FACE + 0.01, y, (PASSAGE.x - 6.5) / 2.0), groove)
				y += 0.72
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
	w.box(Vector3(2.0 * TOWER, top - GROUND, 4.6), Vector3(0, (top + GROUND) / 2.0, -1.3), silver)
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
		w.box(Vector3(4.4, lower - GROUND, 0.12), Vector3(x, (lower + GROUND) / 2.0, 1.05), brown)
	w.box(Vector3(2.0 * TOWER - 0.6, 1.0, 0.1), Vector3(0, GROUND + 3.2, 1.12), w.material("plain", Color("1f2a33")))
	w.panel("ST. JOSEPH HALL", Vector3(0, GROUND + 3.2, 1.2), 8.0, 0.62, Color("f2f2ee"))
	# Over the lobby: a dark recess with wooden louvres, under the sign.
	w.box(Vector3(9.6, lower - GROUND, 0.1), Vector3(0, (lower + GROUND) / 2.0, 0.98), w.material("plain", Color("2a2c2d")))
	var slat := GROUND + 0.4
	while slat < lower - 0.1:
		w.box(Vector3(6.4, 0.05, 0.1), Vector3(0, slat, 1.06), w.material("wood", Color("9a7a5c")))
		slat += 0.18
	# The canopy: a dark steel slab with a rounded fascia. It stops short of the road:
	# the sidewalk in front is only 1.6 to 4.8 m deep.
	w.box(Vector3(12.4, 0.36, 2.7), Vector3(0, GROUND - 0.2, 2.25), w.material("metal", Color("53666b")))
	w.box(Vector3(12.6, 0.5, 0.3), Vector3(0, GROUND - 0.3, 3.6), w.material("metal", Color("7d9196")))

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

# --- The raised walkway -------------------------------------------------------------

## The cream plinth the ground floor stands on, its diamond-tiled floor, the awning on
## its slanted struts, the railing (open at the steps), the clad piers and the tube lights.
func _walkway() -> void:
	var plinth: Material = w.material("stucco", Color("ece6d6"))
	var floor_tile: Material = w.material("diamond")
	var ceiling: Material = w.material("stucco", Color("e8e8e2"))
	var depth := PLINTH_Z - WALL_Z
	w.box(Vector3(2.0 * WALK_END, WALK_Y - 0.03, depth), Vector3(0, (WALK_Y - 0.03) / 2.0, (WALL_Z + PLINTH_Z) / 2.0), plinth)
	w.box(Vector3(2.0 * WALK_END, 0.03, depth), Vector3(0, WALK_Y - 0.015, (WALL_Z + PLINTH_Z) / 2.0), floor_tile)
	# The lobby's floor runs out to the tower's front.
	w.box(Vector3(2.0 * TOWER, WALK_Y - 0.03, TOWER_FRONT - PLINTH_Z), Vector3(0, (WALK_Y - 0.03) / 2.0, (TOWER_FRONT + PLINTH_Z) / 2.0), plinth)
	w.box(Vector3(2.0 * LOBBY, 0.03, TOWER_FRONT - PLINTH_Z), Vector3(0, WALK_Y - 0.015, (TOWER_FRONT + PLINTH_Z) / 2.0), floor_tile)
	# A darker band at the plinth's foot, where the planter's soil meets it.
	w.box(Vector3(2.0 * WALK_END, 0.18, 0.04), Vector3(0, LANDING_Y + 0.22, PLINTH_Z + 0.02), w.material("stucco", Color("cbc3b0")))
	for side in [-1.0, 1.0]:
		var length := WALK_END + 0.2 - TOWER
		var x0: float = side * (TOWER + length / 2.0)
		# The awning: a thin plate on slanted white struts, standing on the plinth's edge.
		w.box(Vector3(length, 0.2, -WALL_Z + 1.4), Vector3(x0, CEILING + 0.1, (WALL_Z + 1.4) / 2.0), ceiling)
		w.box(Vector3(length, 0.14, 0.12), Vector3(x0, CEILING + 0.05, 1.45), w.material("plain", Color("cfd2cf")))
		var x := x0 - length / 2.0 + 1.6
		while x < x0 + length / 2.0:
			w.rod(Vector3(x, WALK_Y, 0.22), Vector3(x, CEILING, 1.3), 0.05, Color("e4e6e4"))
			x += 3.2
		for pier in PIERS:
			_pier(side * pier)
	_railing()
	# Tube lights under the awning, lit at night.
	var tube: Material = w.glow(Color("f4f1e6"), 0.6, 2.2)
	var x := -WALK_END + 1.0
	while x < WALK_END:
		if absf(x) > TOWER + 0.6:
			w.box(Vector3(1.2, 0.06, 0.12), Vector3(x, CEILING - 0.08, -1.6), tube)
			w._omni(Vector3(x, CEILING - 0.4, -1.6), Color("f3f1ea"), 1.1, 6.0)
		x += 6.0
	_front()

## A square pier clad in pale grey panels, floor to awning, with a joint every metre.
func _pier(x: float) -> void:
	var clad: Material = w.material("stucco", Color("dcdcd6"))
	var joint: Material = w.material("plain", Color("aeb0ab"))
	var middle := (PIER_Z.x + PIER_Z.y) / 2.0
	w.box(Vector3(1.0, CEILING - WALK_Y, PIER_Z.y - PIER_Z.x), Vector3(x, (WALK_Y + CEILING) / 2.0, middle), clad)
	var y := WALK_Y + 1.0
	while y < CEILING - 0.3:
		w.box(Vector3(1.02, 0.03, PIER_Z.y - PIER_Z.x + 0.02), Vector3(x, y, middle), joint)
		y += 1.0

## The railing along the plinth's edge: a stainless top rail, four thin bronze rails and
## posts every metre, from the tower to each end (on the west side, to the ramp's landing).
func _railing() -> void:
	var top: Material = w.material("metal", Color("d9dcdc"))
	var bar: Material = w.material("plain", Color("8f7a62"))
	for side in [-1.0, 1.0]:
		for run: Vector2 in [Vector2(TOWER, LANDING if side > 0.0 else WALK_END)]:
			var length := run.y - run.x
			var middle: float = side * (run.x + run.y) / 2.0
			w.box(Vector3(length, 0.05, 0.05), Vector3(middle, WALK_Y + 1.0, RAIL_Z), top)
			for k in 4:
				w.box(Vector3(length, 0.025, 0.025), Vector3(middle, WALK_Y + 0.2 + k * 0.2, RAIL_Z), bar)
			var post := run.x
			while post < run.y:
				w.box(Vector3(0.04, 1.0, 0.04), Vector3(side * post, WALK_Y + 0.5, RAIL_Z), bar)
				post += 1.0
			w.box(Vector3(0.04, 1.0, 0.04), Vector3(side * run.y, WALK_Y + 0.5, RAIL_Z), bar)

## The front, as in the photos: along the whole building a raised planter of grass and
## trimmed shrubs against the plinth, the brown paver sidewalk and a grass strip with
## bamboo beside it at the same height, a low stone wall at the kerb by the cars. At the
## lobby the long stair: the steps up to the floor across the tower's width, the brown
## landing (joining the sidewalk), the flight down to the kerb between its handrails with
## the pavers running on either side of it, and the planter box beside the upper steps.
func _front() -> void:
	var tread: Material = w.material("slab", Color("efe9dc"))
	var nosing: Material = w.material("plain", Color("4a4440"))
	var base: Material = w.material("stone", Color("aaa79d"))
	var pavers: Material = w.material("brick", Color("c4876f"))
	var grass: Material = w.material("grass", Color("8f9a6a"))
	var kerb: Material = w.material("stucco", Color("d8d2c2"))
	var white: Material = w.material("stucco", Color("e9e6dd"))
	for piece in [Vector2(-WALK_END, -LOBBY_STEPS), Vector2(LOBBY_STEPS, LANDING)]:
		var length: float = piece.y - piece.x
		var x: float = (piece.x + piece.y) / 2.0
		# The planter: a cream box of soil and grass against the plinth.
		w.box(Vector3(length, LANDING_Y + 0.3, PLANTER_Z - PLINTH_Z), Vector3(x, (LANDING_Y + 0.3) / 2.0 - 0.04, (PLINTH_Z + PLANTER_Z) / 2.0), kerb)
		w.box(Vector3(length - 0.1, 0.04, PLANTER_Z - PLINTH_Z - 0.2), Vector3(x, LANDING_Y + 0.25, (PLINTH_Z + PLANTER_Z) / 2.0), grass)
		# The sidewalk and the grass strip beside it at the same height, on a stone base, the
		# low stone wall at the kerb holding them up, a metre at a time so they follow the
		# sidewalk's slope at the ends.
		var at: float = piece.x
		while at < piece.y - 0.01:
			var step := minf(1.0, piece.y - at)
			var top := _sidewalk(at + step / 2.0)
			var middle: float = at + step / 2.0
			w.box(Vector3(step, top + 0.04, KERB_Z - PLANTER_Z), Vector3(middle, (top - 0.04) / 2.0, (PLANTER_Z + KERB_Z) / 2.0), base)
			w.box(Vector3(step, 0.03, WALK_EDGE - PLANTER_Z), Vector3(middle, top - 0.015, (PLANTER_Z + WALK_EDGE) / 2.0), pavers)
			w.box(Vector3(step, 0.04, KERB_Z - WALK_EDGE - 0.25), Vector3(middle, top, (WALK_EDGE + KERB_Z - 0.25) / 2.0), grass)
			w.box(Vector3(step, top + 0.12, 0.25), Vector3(middle, (top + 0.12) / 2.0 - 0.04, KERB_Z - 0.125), base)
			at += step
		w.box(Vector3(length, 0.16, 0.14), Vector3(x, 0.04, KERB_Z + 0.07), white)
	# The lobby's stairs: the landing's mass and its brown pavers, run on either side of the
	# flight down to the kerb; the steps up to the floor; the flight down between the rails.
	w.box(Vector3(2.0 * LOBBY_STEPS, LANDING_Y + 0.04, LOBBY_FLIGHT - TOWER_FRONT), Vector3(0, (LANDING_Y - 0.04) / 2.0, (TOWER_FRONT + LOBBY_FLIGHT) / 2.0), base)
	w.box(Vector3(2.0 * LOBBY_STEPS, 0.03, LOBBY_FLIGHT - UPPER_END), Vector3(0, LANDING_Y - 0.015, (UPPER_END + LOBBY_FLIGHT) / 2.0), pavers)
	for side in [-1.0, 1.0]:
		var wing := LOBBY_STEPS - LOWER_HALF
		var wing_x: float = side * (LOWER_HALF + wing / 2.0)
		w.box(Vector3(wing, LANDING_Y + 0.04, KERB_Z - LOBBY_FLIGHT), Vector3(wing_x, (LANDING_Y - 0.04) / 2.0, (LOBBY_FLIGHT + KERB_Z) / 2.0), base)
		w.box(Vector3(wing, 0.03, KERB_Z - LOBBY_FLIGHT), Vector3(wing_x, LANDING_Y - 0.015, (LOBBY_FLIGHT + KERB_Z) / 2.0), pavers)
		w.box(Vector3(wing, 0.16, 0.14), Vector3(wing_x, 0.04, KERB_Z + 0.07), white)
	_flight(Vector2(-LOBBY_STEPS, LOBBY_STEPS), TOWER_FRONT, WALK_Y, UPPER_STEPS, tread, nosing)
	_flight(Vector2(-LOWER_HALF, LOWER_HALF), LOBBY_FLIGHT, LANDING_Y, FLIGHT_STEPS, tread, nosing)
	for x in LOBBY_RAILS:
		var bends: Array[Vector3] = [Vector3(x, WALK_Y + 0.9, TOWER_FRONT), Vector3(x, LANDING_Y + 0.9, UPPER_END),
			Vector3(x, LANDING_Y + 0.9, LOBBY_FLIGHT), Vector3(x, 0.9, LOBBY_FOOT - 0.15)]
		for i in bends.size() - 1:
			w.rod(bends[i], bends[i + 1], 0.03, Color("c9ccca"))
		for z in [TOWER_FRONT + 0.15, UPPER_END + 0.15, LOBBY_FLIGHT - 0.15, LOBBY_FOOT - 0.15]:
			var foot := _stair(x, z)
			w.rod(Vector3(x, foot, z), Vector3(x, foot + 0.9, z), 0.025, Color("7d6a58"))
	# The raised planter box past the west pillar, beside the steps up to the floor.
	var box_x := (LOBBY_BOX.x + LOBBY_BOX.y) / 2.0
	var box_depth := UPPER_END - TOWER_FRONT
	w.box(Vector3(LOBBY_BOX.y - LOBBY_BOX.x, WALK_Y + 0.1, box_depth), Vector3(box_x, (WALK_Y + 0.1) / 2.0, TOWER_FRONT + box_depth / 2.0), w.material("stucco", Color("ece6d6")))
	w.box(Vector3(LOBBY_BOX.y - LOBBY_BOX.x - 0.3, 0.04, box_depth - 0.3), Vector3(box_x, WALK_Y + 0.08, TOWER_FRONT + box_depth / 2.0), w.material("dirt", Color("8a7660")))
	# Shrubs in the planter, clear of the planter box, and more along the grass strip.
	var seed_value := 900
	var x := -WALK_END + 1.2
	while x < LANDING - 1.0:
		if absf(x) > LOBBY_BOX.y + 0.6:
			w._shrub(Vector3(x, LANDING_Y + 0.27, 0.95 + 0.1 * sin(x * 1.7)), 0.8 + 0.25 * absf(sin(x * 0.9)), seed_value,
				w.HEDGE_COLORS if seed_value % 3 == 0 else w.SHRUB_COLORS)
			seed_value += 1
		x += 2.3
	x = -WALK_END + 2.5
	while x < LANDING - 1.0:
		if absf(x) > LOBBY_STEPS + 1.0:
			w._shrub(Vector3(x, _sidewalk(x) + 0.04, (WALK_EDGE + KERB_Z) / 2.0 + 0.2 * sin(x)), 0.7 + 0.2 * absf(cos(x)), seed_value, w.SHRUB_COLORS)
			seed_value += 1
		x += 5.1

## A flight of `count` steps across local x `span`, from a floor at `top` whose edge is at
## `from` (local z) going down towards the road: each tread's block runs from that edge
## to its own front, where its dark nosing is.
func _flight(span: Vector2, from: float, top: float, count: int, tread: Material, nosing: Material) -> void:
	var width := span.y - span.x
	var x := (span.x + span.y) / 2.0
	for k in count:
		var height := _down(top, k) + 0.04
		var depth := (k + 1) * TREAD
		w.box(Vector3(width, height, depth), Vector3(x, height / 2.0 - 0.04, from + depth / 2.0), tread)
		w.box(Vector3(width, 0.03, 0.05), Vector3(x, height - 0.04, from + depth - 0.025), nosing)

## The ground floor's inner wall: room doors, dark windows, notice boards and fire
## alarms, with a row of high wooden windows over them and a brown skirting.
func _inner_wall() -> void:
	var frame: Material = w.material("plain", Color("4a3a2e"))
	var sill: Material = w.material("plain", Color("f6f3ec"))
	var cork: Material = w.material("wood", Color("b48a5a"))
	var high: Material = w.material("glass", Color("3c4448"))
	var notes: Array[Color] = [Color("f4f1e8"), Color("e8d27a"), Color("cfe0ef"), Color("f0c0b8")]
	w.box(Vector3(2.0 * HALF, GROUND, 0.2), Vector3(0, GROUND / 2.0, WALL_Z), w.material("stucco", Color("eceae3")))
	for side in [-1.0, 1.0]:
		var length := WALK_END - TOWER
		w.box(Vector3(length, 0.12, 0.03), Vector3(side * (TOWER + length / 2.0), WALK_Y + 0.06, WALL_Z + 0.115), w.material("plain", Color("9a6a52")))
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
				w.panel("SJH G%02d" % (i + 1), Vector3(x, WALK_Y + 2.38, WALL_Z + 0.16), 0.9, 0.18, Color("f6f1e6"), Color("4b3a2c"))
			1:
				w.box(Vector3(2.6, 1.2, 0.05), Vector3(x, WALK_Y + 1.5, WALL_Z + 0.12), w.material("glass", Color("4b585e")))
				w.box(Vector3(2.7, 0.08, 0.2), Vector3(x, WALK_Y + 0.85, WALL_Z + 0.18), sill)
			2:
				w.box(Vector3(1.8, 1.1, 0.04), Vector3(x, WALK_Y + 1.5, WALL_Z + 0.13), cork)
				for p in 4:
					w.box(Vector3(0.36, 0.48, 0.01), Vector3(x - 0.6 + p * 0.4, WALK_Y + 1.5 + (p % 2) * 0.12, WALL_Z + 0.16), w.material("plain", notes[p]))
				w.box(Vector3(0.14, 0.14, 0.06), Vector3(x + 1.3, WALK_Y + 2.2, WALL_Z + 0.14), w.material("plain", Color("c42a2b")))
		# The high windows: three dark panes in a wooden frame.
		if i % 3 != 0:
			w.box(Vector3(2.2, 0.5, 0.06), Vector3(x, WALK_Y + 2.35, WALL_Z + 0.12), frame)
			for p in 3:
				w.box(Vector3(0.62, 0.38, 0.03), Vector3(x - 0.7 + p * 0.7, WALK_Y + 2.35, WALL_Z + 0.16), high)
		x += 4.2
		i += 1

## Bar tables with wooden chairs along the piers, and the yellow, blue and green bins.
func _furniture() -> void:
	var black: Material = w.material("plain", Color("26262a"))
	var seat: Material = w.material("wood", Color("a8693f"))
	var top := CylinderMesh.new()
	top.top_radius = 0.42
	top.bottom_radius = 0.42
	top.height = 0.04
	top.radial_segments = 12
	var stone: Material = w.material("stone", Color("cdc5b8"))
	for side in [-1.0, 1.0]:
		for table in TABLES:
			var x: float = side * table
			w._mesh(top, Vector3(x, WALK_Y + 1.0, TABLE_Z), stone)
			w.box(Vector3(0.06, 0.98, 0.06), Vector3(x, WALK_Y + 0.5, TABLE_Z), black)
			w.box(Vector3(0.5, 0.03, 0.5), Vector3(x, WALK_Y + 0.02, TABLE_Z), black)
			for dx in [-0.62, 0.62]:
				var at := Vector3(x + dx, WALK_Y, TABLE_Z)
				w.box(Vector3(0.42, 0.05, 0.4), at + Vector3(0, 0.72, 0), seat)
				w.box(Vector3(0.42, 0.3, 0.04), at + Vector3(0, 1.05, -0.19), seat)
				for post in [-0.18, 0.18]:
					w.box(Vector3(0.03, 0.48, 0.03), at + Vector3(post, 0.96, -0.19), black)
				for corner in [Vector2(-0.18, -0.17), Vector2(0.18, -0.17), Vector2(-0.18, 0.17), Vector2(0.18, 0.17)]:
					w.box(Vector3(0.03, 0.72, 0.03), at + Vector3(corner.x, 0.36, corner.y), black)
	var colours: Array[Color] = [Color("d9b43a"), Color("2f5fae"), Color("2f7d5b")]
	for i in 3:
		var at := Vector3(BINS.x + i * 0.62, WALK_Y, BINS.y)
		w.box(Vector3(0.56, 1.1, 0.56), at + Vector3(0, 0.55, 0), w.material("plain", colours[i]))
		w.box(Vector3(0.6, 0.06, 0.6), at + Vector3(0, 1.13, 0), w.material("plain", colours[i].darkened(0.25)))
	# A yellow wet-floor sign by the east end's pier, as in the photos.
	var sign_at := Vector3(-PIERS[3] + 0.9, WALK_Y, -0.55)
	w.box(Vector3(0.3, 0.62, 0.05), sign_at + Vector3(0, 0.31, 0.06), w.material("plain", Color("e3b622")), 0.0, 0.2)
	w.box(Vector3(0.3, 0.62, 0.05), sign_at + Vector3(0, 0.31, -0.06), w.material("plain", Color("e3b622")), 0.0, -0.2)

## The elevator lobby in the centre tower, open between two grey pillars up the wide
## steps: a cream ceiling with downlights, and on the back wall the two lifts in black
## marble frames on an ochre wall, the plaque between them and the floors they serve.
func _lobby() -> void:
	var grey: Material = w.material("slab", Color("8e959e"))
	var cream: Material = w.material("stucco", Color("ece6d6"))
	var marble: Material = w.material("plain", Color("2a2c31"))
	var vein: Material = w.material("plain", Color("6a6d74"))
	var steel: Material = w.material("metal", Color("c3c8ca"))
	for side in [-1.0, 1.0]:
		var middle: float = side * (LOBBY + TOWER) / 2.0
		w.box(Vector3(TOWER - LOBBY, GROUND, TOWER_FRONT + 0.2), Vector3(middle, GROUND / 2.0, (TOWER_FRONT - 0.2) / 2.0), grey)
	# The ceiling, a step down from the canopy, with square downlights.
	w.box(Vector3(2.0 * TOWER, 0.12, TOWER_FRONT - WALL_Z), Vector3(0, 3.66, (TOWER_FRONT + WALL_Z) / 2.0), cream)
	w.box(Vector3(2.0 * TOWER, GROUND - 3.6, 0.3), Vector3(0, (GROUND + 3.6) / 2.0, TOWER_FRONT - 0.15), w.material("plain", Color("3a3f45")))
	for x in [-4.5, -1.5, 1.5, 4.5]:
		for z in [-2.6, -0.6]:
			w.box(Vector3(0.2, 0.03, 0.2), Vector3(x, 3.59, z), w.glow(Color("fff3dc"), 0.5, 2.2))
	w._omni(Vector3(0, 3.2, -1.6), Color("ffe6c0"), 1.2, 7.0)
	# The lift wall: ochre over a black marble dado, a dark band along the top.
	var wall := WALL_Z + 0.1
	w.box(Vector3(9.4, 2.0, 0.04), Vector3(0, WALK_Y + 1.95, wall + 0.02), w.material("stucco", Color("c99a62")))
	w.box(Vector3(9.4, 0.95, 0.05), Vector3(0, WALK_Y + 0.475, wall + 0.025), marble)
	w.box(Vector3(9.6, 0.16, 0.07), Vector3(0, WALK_Y + 3.0, wall + 0.035), marble)
	for x in [-2.0, 2.0]:
		w.box(Vector3(1.8, 2.65, 0.1), Vector3(x, WALK_Y + 1.325, wall + 0.05), marble)
		for vein_at in [Vector3(-0.7, 1.9, 0), Vector3(0.75, 0.9, 0), Vector3(-0.72, 0.5, 0)]:
			w.box(Vector3(0.02, 0.5, 0.01), Vector3(x + vein_at.x, WALK_Y + vein_at.y, wall + 0.105), vein, 0.0, 0.0)
		w.box(Vector3(1.2, 2.2, 0.04), Vector3(x, WALK_Y + 1.1, wall + 0.12), steel)
		w.box(Vector3(0.02, 2.2, 0.01), Vector3(x, WALK_Y + 1.1, wall + 0.145), w.material("plain", Color("7e8486")))
		w.box(Vector3(0.24, 0.12, 0.02), Vector3(x, WALK_Y + 2.48, wall + 0.11), w.glow(Color("d8342c"), 0.8, 1.6))
	w.box(Vector3(0.14, 0.3, 0.03), Vector3(0, WALK_Y + 1.25, wall + 0.06), steel)
	w.panel("SAINT JOSEPH HALL", Vector3(0, WALK_Y + 1.85, wall + 0.08), 1.25, 0.5, Color("3a3a3a"), Color("d9dcdc"))
	w.panel("FLOORS 1, 4, 6, 8", Vector3(-3.55, WALK_Y + 2.3, wall + 0.06), 0.6, 0.22, Color("1d1d1d"), Color("e8e8e4"))
	w.panel("FLOORS 1, 5, 7, 8", Vector3(3.55, WALK_Y + 2.3, wall + 0.06), 0.6, 0.22, Color("1d1d1d"), Color("e8e8e4"))
	w.panel("USE STAIRWAYS", Vector3(-1.0, WALK_Y + 2.05, wall + 0.06), 0.42, 0.26, Color("f4f4f2"), Color("b3262a"))
	# Notices and a poster stand by the left pillar.
	w.box(Vector3(0.5, 0.65, 0.03), Vector3(3.55, WALK_Y + 1.6, wall + 0.04), w.material("plain", Color("efe7c9")))
	w.box(Vector3(0.6, 1.5, 0.04), Vector3(-6.4, WALK_Y + 1.15, -2.9), w.material("plain", Color("d8d4c0")), 0.5)
	w.box(Vector3(0.5, 0.7, 0.02), Vector3(-6.39, WALK_Y + 1.4, -2.87), w.material("plain", Color("6f8a5a")), 0.5)

# --- The west end ---------------------------------------------------------------------

## The passage through the terracotta block at walkway height and its steps down the
## west face, the ramp up along the block's front to the landing at the walkway's end,
## the concrete yard at their foot and the lane south between SJH and MGN, its louvred
## wall and the wall at its far end.
func _west_end() -> void:
	var cream: Material = w.material("stucco", Color("ece6d6"))
	var concrete: Material = w.material("concrete", Color("c4c2bb"))
	var tread: Material = w.material("slab", Color("efe9dc"))
	var nosing: Material = w.material("plain", Color("4a4440"))
	var granite: Material = w.material("concrete", Color("d2d3d0"))
	var width := PASSAGE.y - PASSAGE.x
	var middle := (PASSAGE.x + PASSAGE.y) / 2.0
	# The passage: plinth, floor, cream lining, a tube light.
	var inside := PINK_FACE - WALK_END
	w.box(Vector3(inside, WALK_Y - 0.03, width), Vector3((WALK_END + PINK_FACE) / 2.0, (WALK_Y - 0.03) / 2.0, middle), cream)
	w.box(Vector3(inside, 0.03, width), Vector3((WALK_END + PINK_FACE) / 2.0, WALK_Y - 0.015, middle), w.material("diamond"))
	for z in [PASSAGE.x + 0.03, PASSAGE.y - 0.03]:
		w.box(Vector3(inside - 0.4, 2.6, 0.04), Vector3((WALK_END + PINK_FACE) / 2.0 + 0.2, WALK_Y + 1.3, z), cream)
	w.box(Vector3(inside - 0.4, 0.04, width), Vector3((WALK_END + PINK_FACE) / 2.0 + 0.2, WALK_Y + 2.6, middle), cream)
	w.box(Vector3(1.2, 0.06, 0.12), Vector3(43.0, WALK_Y + 2.55, middle), w.glow(Color("f4f1e6"), 0.6, 2.2))
	w.box(Vector3(0.6, 0.02, 1.0), Vector3(44.8, WALK_Y + 0.005, middle), w.material("plain", Color("8c2a3a")))
	# Its steps down the west face, with a handrail each side.
	var run := PASSAGE_STEPS * PASSAGE_TREAD
	for k in PASSAGE_STEPS:
		var height := _down(WALK_Y, k) + 0.04
		var depth := (k + 1) * PASSAGE_TREAD
		w.box(Vector3(depth, height, width + 0.4), Vector3(PINK_FACE + depth / 2.0, height / 2.0 - 0.04, middle), tread)
		w.box(Vector3(0.05, 0.03, width + 0.4), Vector3(PINK_FACE + depth - 0.025, height - 0.04, middle), nosing)
	for z in [PASSAGE.x - 0.1, PASSAGE.y + 0.1]:
		w.rod(Vector3(PINK_FACE + run - 0.15, 0.9, z), Vector3(PINK_FACE, WALK_Y + 0.9, z), 0.03, Color("c9ccca"))
		for x in [PINK_FACE + 0.15, PINK_FACE + run - 0.15]:
			var foot := _down(WALK_Y, (x - PINK_FACE) / PASSAGE_TREAD)
			w.rod(Vector3(x, foot, z), Vector3(x, foot + 0.9, z), 0.025, Color("7d6a58"))
	# The ramp: a granite slab sloping down from the landing to the yard, on a cream wall,
	# railed both sides; the landing at its top, railed on its two open sides.
	var length := RAMP_FOOT - WALK_END
	var slope := atan2(WALK_Y + 0.04, length)
	var ramp_width := RAMP.y - RAMP.x
	var ramp_middle := (RAMP.x + RAMP.y) / 2.0
	w.box(Vector3(ramp_width, 0.08, length / cos(slope)), Vector3((WALK_END + RAMP_FOOT) / 2.0, (WALK_Y - 0.04) / 2.0 - 0.04, ramp_middle), granite, PI / 2.0, slope)
	var step := 0.0
	while step < length:
		var height := lerpf(WALK_Y, -0.04, (step + 0.5) / length)
		w.box(Vector3(1.0, height + 0.04, ramp_width), Vector3(WALK_END + step + 0.5, height / 2.0 - 0.06, ramp_middle), cream)
		step += 1.0
	var landing := Vector2(LANDING, WALK_END)
	w.box(Vector3(landing.y - landing.x, WALK_Y - 0.03, RAMP.y - PLINTH_Z), Vector3((landing.x + landing.y) / 2.0, (WALK_Y - 0.03) / 2.0, (PLINTH_Z + RAMP.y) / 2.0), cream)
	w.box(Vector3(landing.y - landing.x, 0.03, RAMP.y - PLINTH_Z), Vector3((landing.x + landing.y) / 2.0, WALK_Y - 0.015, (PLINTH_Z + RAMP.y) / 2.0), granite)
	for z in [RAMP.x, RAMP.y]:
		for k in 4:
			var lift := 0.3 + k * 0.2 if k < 3 else 0.95
			w.rod(Vector3(WALK_END, WALK_Y + lift, z), Vector3(RAMP_FOOT, -0.04 + lift, z), 0.03 if k == 3 else 0.015,
				Color("c9ccca") if k == 3 else Color("8f7a62"))
		var post := WALK_END
		while post <= RAMP_FOOT:
			var foot := lerpf(WALK_Y, -0.04, (post - WALK_END) / length)
			w.box(Vector3(0.04, 0.95, 0.04), Vector3(post, foot + 0.475, z), w.material("plain", Color("8f7a62")))
			post += 1.5
	var rail_top: Material = w.material("metal", Color("d9dcdc"))
	w.box(Vector3(0.05, 0.05, RAMP.y - PLINTH_Z), Vector3(LANDING, WALK_Y + 1.0, (PLINTH_Z + RAMP.y) / 2.0), rail_top)
	w.box(Vector3(landing.y - landing.x, 0.05, 0.05), Vector3((landing.x + landing.y) / 2.0, WALK_Y + 1.0, RAMP.y), rail_top)
	for k in 4:
		w.box(Vector3(0.025, 0.025, RAMP.y - PLINTH_Z), Vector3(LANDING, WALK_Y + 0.2 + k * 0.2, (PLINTH_Z + RAMP.y) / 2.0), w.material("plain", Color("8f7a62")))
	# The yard at the foot and the lane south, in concrete.
	var yard := Rect2(PINK_FACE + run, PASSAGE.x, YARD_END - PINK_FACE - run, RAMP.y + 0.6 - PASSAGE.x)
	for area in [yard, LANE, LANE_BACK]:
		w.box(Vector3(area.size.x, 0.12, area.size.y), Vector3(area.get_center().x, -0.1, area.get_center().y), concrete)
	# The louvres on the stair tower's west wall beside the steps, and the wall at the
	# lane's far end.
	var louvre: Material = w.material("plain", Color("3d4144"))
	w.box(Vector3(0.06, 2.6, 1.3), Vector3(HALF + 1.93, 1.7, -3.2), louvre)
	var y := 0.5
	while y < 3.0:
		w.box(Vector3(0.1, 0.04, 1.3), Vector3(HALF + 1.97, y, -3.2), w.material("plain", Color("5b6064")))
		y += 0.14
	w.box(Vector3(4.6, 2.4, 0.25), Vector3(50.3, 1.0, LANE_BACK.position.y - 0.2), w.material("concrete", Color("b3afa4")))

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
	for lx in [14.6, 27.0, -14.0]:
		var at := world(lx, 1.0)
		palms._palm(Vector3(at.x, LANDING_Y + 0.27, at.y), 7.0 + absf(lx) * 0.05, 770 + roundi(lx))
	for lx in [-36.0, -22.0, -13.5, 17.0, 30.5, 36.0]:
		var at := world(lx, (WALK_EDGE + KERB_Z) / 2.0)
		w._bamboo(Vector3(at.x, _sidewalk(lx) + 0.04, at.y), 0.7, 12, 780 + roundi(lx))
	for lx in [-40.0, -31.0, -26.0, 12.0, 22.0, 31.0]:
		var at := world(lx, 0.8)
		w._shrub(Vector3(at.x, LANDING_Y + 0.27, at.y), 1.2, 790 + roundi(lx))
	# The lobby's planter box: a palm over trimmed shrubs.
	var box := world((LOBBY_BOX.x + LOBBY_BOX.y) / 2.0, (TOWER_FRONT + UPPER_END) / 2.0)
	palms._palm(Vector3(box.x, WALK_Y + 0.08, box.y), 4.2, 777)
	w._shrub(Vector3(box.x, WALK_Y + 0.08, box.y), 1.0, 778, w.HEDGE_COLORS)

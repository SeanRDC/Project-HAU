extends RefCounted
## HAU Boulevard, the "middle road": the divided road between PGN (north) and the Main
## Building (DJDN) and MGN (south), from the boulevard photos (assets/images/buildings/
## hau boulevard/, kept local: they show people), Sean's labelled aerial (the dark orange
## walks, the light orange covered walkways, the black crossings) and the campus aerial.
## It runs straight west from the loop's west road to the angel fountain at its head.
##
## Across it, from PGN to the Main Building, the same on both sides of the median:
##   planter at the building | covered walkway: cream 60 cm tiles under a white slatted
##   roof on two rows of terracotta block pillars, granite benches | concrete edging |
##   shrub strip: red-tipped shrubs, shade trees, the bins | open walk: red octagon
##   pavers, bronze lampposts with two lanterns and a banner | hedge strip: a clipped
##   hedge and tall white poles | one lane, one car wide | grass median: concrete urns,
##   round topiary, tall poles.
## Yellow zebras cross at the mouth and three times along it, through paved gaps in the
## strips and the median, so each crossing joins the two covered walkways. At the mouth
## the open walks widen into paved plazas; at the west end the lanes run onto a round
## apron round the angel fountain (from "SFJ AND FOUNTAIN SIDE VIEW.jpg").
##
## Built straight in world coordinates (the plots either side are square to x). The
## widths are read off the photos (tiles, pavers, a car per lane) and fit the 30.6 m
## between PGN's and the Main Building's faces; plan.ts moves those plots to make room.

const Chapel := preload("res://areas/chapel.gd")
const StudentCenter := preload("res://areas/student_center.gd")

## Where the boulevard's surfaces meet the loop's carriageway (its west kerb face is at
## x -62); east of EAST_X is the loop's own sidewalk, opened across the lanes (roads.gd).
const MOUTH_X := -61.9
const EAST_X := -63.6
## The paved plazas at the mouth: no hedge or shrub strip east of here.
const PLAZA_X := -69.0
## The walks, strips and hedges end here; the lanes run on onto the fountain's apron.
const END_X := -157.5
const LANE_END_X := -158.5
## The shrub strips stop short of END_X, so the covered walkways open onto the walks.
const SHRUB_WEST := -152.6
## The median's noses (east, past the mouth's zebra; west, at the apron).
const NOSE_E := -69.6
const NOSE_W := -155.8
## The bands across the road (world z, from..to), north to south, about the centre line.
const CENTRE := 64.6
const FACE_N := 49.3
const WALK_N := Vector2(50.1, 53.6)
const EDGE_N := Vector2(53.6, 53.9)
const SHRUB_N := Vector2(53.9, 55.7)
const PAVE_N := Vector2(55.7, 58.7)
const HEDGE_N := Vector2(58.7, 60.2)
const LANE_N := Vector2(60.2, 63.8)
const MEDIAN := Vector2(63.8, 65.4)
const LANE_S := Vector2(65.4, 69.0)
const HEDGE_S := Vector2(69.0, 70.5)
const PAVE_S := Vector2(70.5, 73.5)
const SHRUB_S := Vector2(73.5, 75.3)
const EDGE_S := Vector2(75.3, 75.6)
const WALK_S := Vector2(75.6, 79.1)
const FACE_S := 79.9
## Pedestrian crossings (x from..to), from the black marks on the aerial: the mouth, the
## Main Building's courtyard gate (the plan's courtyardGate), and two further west.
const CROSSINGS: Array[Vector2] = [Vector2(-69.0, -66.0), Vector2(-107.5, -104.5), Vector2(-131.5, -128.5), Vector2(-146.5, -143.5)]
## The angel fountain on the centre line at the west end (the plan's rotunda, x -165.6),
## the round apron the lanes loop round, and the basin.
const FOUNTAIN := Vector2(-165.6, 64.6)
const APRON := 11.5
const BASIN := 2.9
## The covered walkways: two rows of pillars 3.0 m apart (front at the road side), a bay
## of 3.2 m, the roof's extent, the floor's height and the beams' underside (the
## cutaway's ceiling).
const PILLAR_EAST := -64.9
const PILLARS := 28
const BAY := 3.2
const ROOF_EAST := -64.4
const ROOF_WEST := -151.8
const FRONT_N := 53.35
const BACK_N := 50.35
const FRONT_S := 75.85
const BACK_S := 78.85
const WALK_Y := 0.0
const CEILING := 3.05
## Under a covered walkway the camera's near plane cuts this far in front of its middle:
## inside the front pillars' inner face by the plane's lean down to the floor, so the whole
## road-side row falls away and the student stays.
const CUT_OFFSET := 0.85
## The nodes holding each side above the ground (its walkway's roof and pillars, its
## trees, lampposts and poles): the camera faces one side across the road from over the
## other, so aps.gd fades the near side out (shadows stay).
const NORTH_GROUP := "MiddleRoadNorth"
const SOUTH_GROUP := "MiddleRoadSouth"
## Kerb half-width either side of a kerb line.
const KERB := 0.135
## The plaza's corner on MGN's side ("mgn rightside to sidewalk.jpg"): the kerb curves from
## the west road round into the south lane (radius CORNER_R, painted yellow), and the red
## pavers run on over the west road's sidewalk down to MGN's north entrance (to PAVED_TO).
const LOOP_KERB_X := -62.0
const CORNER_R := 2.5
const CORNER := Vector2(LOOP_KERB_X - CORNER_R, LANE_S.y + CORNER_R)
const PAVED_TO := 82.4
## Lampposts in the open walks, every four bays; tall white poles in the hedge strips
## between them, and in the median.
const LAMP_EAST := -72.1
const LAMP_STEP := 12.8
## The bins (in the shrub strips at the walk's edge) and the urns on the walks.
const BINS: Array[Vector2] = [Vector2(-73.4, 54.3), Vector2(-118.6, 54.3), Vector2(-89.4, 74.9), Vector2(-137.4, 74.9)]
const URNS: Array[Vector2] = [Vector2(-108.2, 56.15), Vector2(-132.2, 56.15), Vector2(-108.2, 73.05), Vector2(-147.2, 73.05)]
## Big terracotta pots with palms on the mouth's plazas.
const POTS: Array[Vector2] = [Vector2(-64.6, 55.0), Vector2(-68.2, 54.6), Vector2(-64.6, 74.2), Vector2(-68.2, 74.6)]

static var _lamps: Array[Vector2] = []

static func _in(v: float, band: Vector2) -> bool:
	return v >= band.x and v <= band.y

static func in_crossing(x: float) -> bool:
	for crossing in CROSSINGS:
		if x >= crossing.x and x <= crossing.y:
			return true
	return false

static func on_apron(x: float, z: float) -> bool:
	return Vector2(x, z).distance_to(FOUNTAIN) <= APRON

static func in_median(x: float) -> bool:
	return x <= NOSE_E and x >= NOSE_W and not in_crossing(x)

## Ground the student may stand on: the whole width between the two buildings' planters
## from the mouth to END_X, the lanes across the west road's sidewalk, and the apron.
## blocked() then takes out the planters, strips, median, pillars and props.
## In the corner's square but outside its curve: the lane's road surface.
static func in_corner_road(x: float, z: float) -> bool:
	return x <= LOOP_KERB_X + 0.2 and x >= CORNER.x and z >= LANE_S.y and z <= CORNER.y 		and Vector2(x, z).distance_to(CORNER) > CORNER_R + KERB

static func walkable(x: float, z: float) -> bool:
	if in_corner_road(x, z):
		return true
	if x > MOUTH_X:
		return false
	if x >= END_X and x <= EAST_X:
		return z >= FACE_N and z <= FACE_S
	if x > EAST_X:
		return z >= LANE_N.x and z <= LANE_S.y
	return on_apron(x, z)

## Every pillar: both rows of both walkways.
static func pillars() -> Array[Vector2]:
	var at: Array[Vector2] = []
	for k in PILLARS:
		for z in [FRONT_N, BACK_N, FRONT_S, BACK_S]:
			at.append(Vector2(PILLAR_EAST - k * BAY, z))
	return at

## The pillar line nearest x (its index along the walkway, clamped).
static func _pillar_x(x: float) -> float:
	return PILLAR_EAST - clampi(roundi((PILLAR_EAST - x) / BAY), 0, PILLARS - 1) * BAY

## The benches: against the back row inside each walkway, in every other bay.
static func benches() -> Array[Vector2]:
	var at: Array[Vector2] = []
	for k in range(0, PILLARS - 1, 2):
		var x := PILLAR_EAST - (k + 0.5) * BAY
		at.append(Vector2(x, BACK_N + 0.48))
		if not StudentCenter.in_opening(x - 0.9) and not StudentCenter.in_opening(x + 0.9):
			at.append(Vector2(x, BACK_S - 0.48))
	return at

static func lamps() -> Array[Vector2]:
	if _lamps.is_empty():
		var x := LAMP_EAST
		while x > END_X + 2.0:
			if not in_crossing(x) and not in_crossing(x + 1.0) and not in_crossing(x - 1.0):
				_lamps.append(Vector2(x, PAVE_N.y - 0.75))
				_lamps.append(Vector2(x, PAVE_S.x + 0.75))
			x -= LAMP_STEP
	return _lamps

static func blocked(x: float, z: float) -> bool:
	if not walkable(x, z):
		return false
	if Vector2(x, z).distance_to(FOUNTAIN) < BASIN + 0.15:
		return true
	if x < END_X or x > EAST_X:
		return false
	if z < WALK_N.x or z > WALK_S.y and not StudentCenter.in_opening(x):
		return true # the planters at the buildings (the south one open into the Student Center)
	var open := in_crossing(x)
	if not open and x < PLAZA_X:
		if x > SHRUB_WEST and (z > SHRUB_N.x and z < SHRUB_N.y or z > SHRUB_S.x and z < SHRUB_S.y):
			return true # the shrub strips
		if z > HEDGE_N.x and z < HEDGE_N.y - 2.0 * KERB or z > HEDGE_S.x + 2.0 * KERB and z < HEDGE_S.y:
			return true # the hedge strips (their lane kerbs stay walkable)
	if in_median(x) and z > MEDIAN.x + KERB and z < MEDIAN.y - KERB:
		return true
	# The pillars, and the benches between the back pillars.
	if x <= PILLAR_EAST + 0.3 and x >= PILLAR_EAST - (PILLARS - 1) * BAY - 0.3 and absf(x - _pillar_x(x)) < 0.3:
		for row in [FRONT_N, BACK_N, FRONT_S, BACK_S]:
			if absf(z - row) < 0.3:
				return true
	for bench in benches():
		if absf(x - bench.x) < 0.9 and absf(z - bench.y) < 0.25:
			return true
	for lamp in lamps():
		if absf(x - lamp.x) < 0.3 and absf(z - lamp.y) < 0.3:
			return true
	for at in URNS + POTS:
		if Vector2(x, z).distance_to(at) < 0.5:
			return true
	return false

static func floor_height(x: float, z: float) -> float:
	if in_corner_road(x, z):
		return -0.19
	if not walkable(x, z):
		return NAN
	if x < END_X or x > EAST_X:
		return -0.19 # the apron, and the lanes across the west road's sidewalk
	if (_in(z, WALK_N) or _in(z, WALK_S)) and x >= ROOF_WEST:
		return WALK_Y # the covered walkways' tiles
	if z > WALK_S.y and StudentCenter.in_opening(x):
		return WALK_Y # tiled through the south planter's openings
	# The kerb lines: along both lanes' outer edges, and round the median.
	if absf(z - LANE_N.x) < KERB or absf(z - LANE_S.y) < KERB:
		return 0.0
	if in_median(x) and (absf(z - MEDIAN.x) < KERB or absf(z - MEDIAN.y) < KERB):
		return 0.0
	if z > LANE_N.x and z < LANE_S.y:
		if not in_median(x) or z < MEDIAN.x or z > MEDIAN.y:
			if not (in_crossing(x) and x <= NOSE_E and _in(z, MEDIAN)):
				return -0.19 # the lanes
	return -0.04 # the open walks, the plazas and the paved crossings

## How far the camera's boulevard view is on: 1 once off the west road's sidewalk onto
## the boulevard, between the two buildings, out to the fountain; 0 on the loop.
static func view_for(x: float, z: float) -> float:
	return maxf(StudentCenter.view_for(x, z), (1.0 - smoothstep(-66.0, -62.5, x)) * smoothstep(FACE_N - 1.5, FACE_N + 0.5, z) \
		* (1.0 - smoothstep(FACE_S - 0.5, FACE_S + 1.5, z)) * smoothstep(-194.0, -192.0, x))

## Which side the camera faces: 0 north, at PGN's side (the student north of the centre
## line), 1 south, at the Main Building's; crossing the median glides it round.
static func south_for(z: float) -> float:
	return smoothstep(CENTRE - 2.0, CENTRE + 2.0, z)

## 1 under a covered walkway's roof, between its pillar rows; it rises across the last
## half metre inside the front row and the roof's ends, so walking in glides the camera.
static func covered_for(x: float, z: float) -> float:
	var along := (1.0 - smoothstep(ROOF_EAST - 0.6, ROOF_EAST, x)) * smoothstep(ROOF_WEST, ROOF_WEST + 0.6, x)
	var north := (1.0 - smoothstep(FRONT_N - 1.15, FRONT_N - 0.45, z)) * smoothstep(FACE_N - 0.5, FACE_N, z)
	var south := smoothstep(FRONT_S + 0.45, FRONT_S + 1.15, z) * (1.0 - smoothstep(FACE_S, FACE_S + 0.5, z))
	return along * maxf(north, south)

## The middle line of the covered walkway on the student's side.
static func covered_middle(z: float) -> float:
	return (FRONT_N + BACK_N) / 2.0 if z < CENTRE else (FRONT_S + BACK_S) / 2.0

var w: RefCounted

func build(world_builder: RefCounted) -> void:
	w = world_builder
	w._flush()
	_lanes()
	_paint()
	_walks()
	_hedges()
	_median()
	_shrub_beds()
	_planters()
	_benches()
	_props()
	_signs()
	_fountain()
	w._flush()
	_median_planting()
	_bed_planting()
	w._flush()
	# Each side above the ground in its own node, for the camera's fade.
	for north in [true, false]:
		var group := Node3D.new()
		group.name = NORTH_GROUP if north else SOUTH_GROUP
		w.root.add_child(group)
		var saved: Node3D = w.root
		w.root = group
		_covered(north)
		_lampposts(north)
		_poles(north)
		w._flush()
		_trees(north)
		_planter_planting(north)
		w._flush()
		w.root = saved

# --- Helpers ------------------------------------------------------------------------------

## A flat rectangle of ground (world x from..to, z from..to).
func _rect(x0: float, x1: float, z0: float, z1: float, y: float, made: Material) -> void:
	w._ground(PackedVector2Array([Vector2(x0, z0), Vector2(x1, z0), Vector2(x1, z1),
		Vector2(x0, z0), Vector2(x1, z1), Vector2(x0, z1)]), y, made)

## A slab from x0..x1 and z0..z1 (either order) whose top is at `top`.
func _slab(x0: float, x1: float, z0: float, z1: float, top: float, thick: float, made: Material) -> void:
	w.box(Vector3(absf(x1 - x0), thick, absf(z1 - z0)), Vector3((x0 + x1) / 2.0, top - thick / 2.0, (z0 + z1) / 2.0), made)

## A kerb along x at world z, from x0 to x1 (its top level with the walks' kerb line).
func _kerb(x0: float, x1: float, z: float, made: Material) -> void:
	w.box(Vector3(absf(x1 - x0), 0.21, 2.0 * KERB), Vector3((x0 + x1) / 2.0, -0.105, z), made)

## The runs of x from east to west that are not crossings, as [east, west] pairs.
static func _runs(east: float, west: float) -> Array:
	var runs := []
	var x0 := east
	for crossing in CROSSINGS:
		if crossing.y > east or crossing.x < west:
			continue
		if x0 - crossing.y > 0.2:
			runs.append([x0, crossing.y])
		x0 = crossing.x
	if x0 - west > 0.2:
		runs.append([x0, west])
	return runs

func _cylinder(top: float, bottom: float, height: float, at: Vector3, made: Material, segments := 12) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = top
	mesh.bottom_radius = bottom
	mesh.height = height
	mesh.radial_segments = segments
	mesh.rings = 1
	return w._mesh(mesh, at, made)

func _sphere(radius: float, at: Vector3, made: Material, squash := 1.0) -> MeshInstance3D:
	var mesh := SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2.0 * squash
	mesh.radial_segments = 10
	mesh.rings = 6
	return w._mesh(mesh, at, made)

# --- The road surface -------------------------------------------------------------------

## The concrete lanes from the loop's kerb to the apron, the apron round the fountain, the
## slab joints, and concrete under the median.
func _lanes() -> void:
	var concrete: Material = w.material("concrete", Color("f2f1ea"))
	_rect(LANE_END_X, MOUTH_X, LANE_N.x, LANE_S.y, -0.19, concrete)
	var disc := PackedVector2Array()
	var steps := 48
	for i in steps:
		var a := TAU * i / steps
		var b := TAU * (i + 1) / steps
		disc.append_array([FOUNTAIN, FOUNTAIN + Vector2(cos(a), sin(a)) * APRON, FOUNTAIN + Vector2(cos(b), sin(b)) * APRON])
	w._ground(disc, -0.19, concrete)
	var joint: Material = w.material("plain", Color("a19f97"))
	var x := MOUTH_X - 4.5
	while x > LANE_END_X:
		for lane in [LANE_N, LANE_S]:
			w.box(Vector3(0.04, 0.006, lane.y - lane.x), Vector3(x, -0.186, (lane.x + lane.y) / 2.0), joint)
		x -= 4.5
	for z in [(LANE_N.x + LANE_N.y) / 2.0, (LANE_S.x + LANE_S.y) / 2.0]:
		w.box(Vector3(MOUTH_X - LANE_END_X, 0.006, 0.04), Vector3((MOUTH_X + LANE_END_X) / 2.0, -0.186, z), joint)

## The yellow zebras (stripes along the road) and the yellow arrows, one way per lane:
## the north lane runs west, the south lane east.
func _paint() -> void:
	var yellow: Material = w.material("plain", Color("e3c13b"))
	for crossing in CROSSINGS:
		var length: float = crossing.y - crossing.x - 0.3
		var middle: float = (crossing.x + crossing.y) / 2.0
		for lane in [LANE_N, LANE_S]:
			var z: float = lane.x + 0.45
			while z < lane.y - 0.3:
				w.box(Vector3(length, 0.008, 0.4), Vector3(middle, -0.183, z), yellow)
				z += 0.8
	for x in [-84.0, -118.0, -139.0, -151.0]:
		for lane in [LANE_N, LANE_S]:
			var z: float = (lane.x + lane.y) / 2.0
			var way := -1.0 if lane == LANE_N else 1.0
			w.box(Vector3(1.5, 0.008, 0.2), Vector3(x, -0.183, z), yellow)
			for side in [-1.0, 1.0]:
				w.box(Vector3(0.75, 0.008, 0.2), Vector3(x + way * 0.82, -0.183, z + side * 0.24), yellow, side * way * 0.65)

# --- The walks ------------------------------------------------------------------------------

## The walks' surfaces: cream tiles under each roof, the concrete edging, red octagon
## pavers on the open walks, across the mouth's plazas, through every crossing's gaps
## and past the roofs' west ends.
func _walks() -> void:
	var tiles: Material = w.material("slab")
	var pavers: Material = w.material("octagon")
	var edging: Material = w.material("concrete", Color("c9c8c0"))
	for walk in [WALK_N, WALK_S]:
		_slab(EAST_X, ROOF_WEST, walk.x, walk.y, WALK_Y, 0.2, tiles)
		_slab(ROOF_WEST, END_X, walk.x, walk.y, -0.04, 0.16, pavers)
	for edge in [EDGE_N, EDGE_S]:
		_slab(EAST_X, END_X, edge.x, edge.y, -0.03, 0.16, edging)
	# (on the south side, the bands in the corner's square start west of it: _corner paves it)
	_slab(EAST_X, END_X, PAVE_N.x, PAVE_N.y, -0.04, 0.16, pavers)
	_slab(CORNER.x, END_X, PAVE_S.x, CORNER.y, -0.04, 0.16, pavers)
	_slab(EAST_X, END_X, CORNER.y, PAVE_S.y, -0.04, 0.16, pavers)
	# The plazas at the mouth: the shrub and hedge bands paved up to the lane's kerb.
	for band in [SHRUB_N, Vector2(HEDGE_N.x, HEDGE_N.y - 2.0 * KERB), SHRUB_S]:
		_slab(EAST_X, PLAZA_X, band.x, band.y, -0.04, 0.16, pavers)
	_slab(CORNER.x, PLAZA_X, HEDGE_S.x + 2.0 * KERB, HEDGE_S.y, -0.04, 0.16, pavers)
	_corner(pavers)
	# The crossings' gaps through the strips and the median, and the walkways' west ends.
	for crossing in CROSSINGS.slice(1):
		for band in [SHRUB_N, Vector2(HEDGE_N.x, HEDGE_N.y - 2.0 * KERB), Vector2(HEDGE_S.x + 2.0 * KERB, HEDGE_S.y), SHRUB_S, MEDIAN]:
			_slab(crossing.x, crossing.y, band.x, band.y, -0.04, 0.16, pavers)
	for shrub in [SHRUB_N, SHRUB_S]:
		_slab(SHRUB_WEST, END_X, shrub.x, shrub.y, -0.04, 0.16, pavers)
	# The kerb round the walks' west ends, where they step down onto the apron.
	var kerb: Material = w.material("stucco", Color("bfc4bc"))
	w.box(Vector3(0.27, 0.21, LANE_N.x - FACE_N), Vector3(END_X, -0.105, (FACE_N + LANE_N.x) / 2.0), kerb)
	w.box(Vector3(0.27, 0.21, FACE_S - LANE_S.y), Vector3(END_X, -0.105, (FACE_S + LANE_S.y) / 2.0), kerb)
	# A mosaic set in the tiles every few bays, as in the photos.
	var red: Material = w.material("plain", Color("9a4a35"))
	var cream: Material = w.material("plain", Color("efe4cf"))
	var green: Material = w.material("plain", Color("3d5a45"))
	for k in range(3, PILLARS - 1, 7):
		var x := PILLAR_EAST - (k + 0.5) * BAY
		for middle in [(FRONT_N + BACK_N) / 2.0, (FRONT_S + BACK_S) / 2.0]:
			w.box(Vector3(0.95, 0.012, 0.7), Vector3(x, WALK_Y + 0.004, middle), red)
			w.box(Vector3(0.75, 0.014, 0.5), Vector3(x, WALK_Y + 0.006, middle), cream)
			w.box(Vector3(0.32, 0.016, 0.32), Vector3(x, WALK_Y + 0.008, middle), green, PI / 4.0)

## The corner on MGN's side: inside the curve red pavers, outside it the lane's road, the
## curved kerb painted yellow; and the pavers on over the west road's sidewalk to MGN.
func _corner(pavers: Material) -> void:
	var inside := PackedVector2Array()
	var outside := PackedVector2Array()
	var steps := 12
	for k in steps:
		var a0 := PI / 2.0 * k / steps
		var a1 := PI / 2.0 * (k + 1) / steps
		var p0 := CORNER + Vector2(cos(a0), -sin(a0)) * CORNER_R
		var p1 := CORNER + Vector2(cos(a1), -sin(a1)) * CORNER_R
		inside.append_array([CORNER, p0, p1])
		# the road beyond the curve, out to the square's corner at the lanes' kerb lines
		outside.append_array([Vector2(LOOP_KERB_X + 0.2, LANE_S.y), p0, p1])
		var middle := (p0 + p1) / 2.0
		var turn := atan2(-(p1 - p0).y, (p1 - p0).x)
		w.box(Vector3(p0.distance_to(p1) + 0.06, 0.21, 2.0 * KERB), Vector3(middle.x, -0.105, middle.y), w.material("plain", Color("e3c13b")), turn)
	# the square's edges past the curve's ends
	outside.append_array([Vector2(LOOP_KERB_X + 0.2, LANE_S.y), CORNER + Vector2(CORNER_R, 0.0), Vector2(LOOP_KERB_X + 0.2, CORNER.y)])
	outside.append_array([Vector2(LOOP_KERB_X + 0.2, LANE_S.y), Vector2(CORNER.x, LANE_S.y), CORNER + Vector2(0.0, -CORNER_R)])
	w._ground(inside, -0.04, pavers)
	w._ground(outside, -0.19, w.material("road"))
	var strip := PackedVector2Array([Vector2(LOOP_KERB_X, CORNER.y), Vector2(EAST_X, CORNER.y), Vector2(EAST_X, PAVED_TO),
		Vector2(LOOP_KERB_X, CORNER.y), Vector2(EAST_X, PAVED_TO), Vector2(LOOP_KERB_X, PAVED_TO)])
	w._ground(strip, -0.035, pavers)
	# the west road's kerb from the curve down to MGN, its first metres yellow as in the photo
	w.box(Vector3(2.0 * KERB, 0.21, 2.0), Vector3(LOOP_KERB_X - KERB, -0.105, CORNER.y + 1.0), w.material("plain", Color("e3c13b")))

# --- Hedge strips, the median, the shrub strips and the planters -----------------------------

## The hedge strips along the lanes: a kerb at the lane, soil, a low kerb at the walk and a
## clipped hedge, broken at each crossing (its kerb ends painted yellow).
func _hedges() -> void:
	var kerb: Material = w.material("stucco", Color("bfc4bc"))
	var yellow: Material = w.material("plain", Color("e3c13b"))
	var soil: Material = w.material("dirt", Color("c4b294"))
	var hedge: Material = w.material("grass", Color("8fb06a"))
	# The lane-edge kerbs, from the loop's kerb line to the walks' end, yellow at each crossing.
	for z in [LANE_N.x, LANE_S.y]:
		_kerb(MOUTH_X if z == LANE_N.x else CORNER.x, END_X, z, kerb) # the south one starts at the corner's curve
		for crossing in CROSSINGS:
			w.box(Vector3(crossing.y - crossing.x + 1.2, 0.215, 2.0 * KERB + 0.01), Vector3((crossing.x + crossing.y) / 2.0, -0.1, z), yellow)
	for strip in [HEDGE_N, HEDGE_S]:
		var north: bool = strip == HEDGE_N
		var walk_side: float = strip.x if north else strip.y
		var inner: Vector2 = Vector2(strip.x, strip.y - 2.0 * KERB) if north else Vector2(strip.x + 2.0 * KERB, strip.y)
		for run in _runs(PLAZA_X, END_X):
			var x0: float = run[0]
			var x1: float = run[1]
			_slab(x0, x1, inner.x, inner.y, 0.06, 0.26, soil)
			_kerb(x0, x1, walk_side + (KERB if north else -KERB), kerb)
			for end in [x0, x1]:
				w.box(Vector3(0.27, 0.22, inner.y - inner.x), Vector3(end, -0.1, (inner.x + inner.y) / 2.0), yellow if in_crossing(end + 0.5) or in_crossing(end - 0.5) else kerb)
			var hedge_z: float = (inner.x + inner.y) / 2.0
			w.box(Vector3(x0 - x1 - 0.7, 0.5, 0.95), Vector3((x0 + x1) / 2.0, 0.31, hedge_z), hedge)
			w.box(Vector3(x0 - x1 - 0.9, 0.1, 0.8), Vector3((x0 + x1) / 2.0, 0.6, hedge_z), w.material("grass", Color("a3c27a")))

## The grass median: kerbs round it, a low groundcover, paved gaps at the crossings and
## yellow noses.
func _median() -> void:
	var kerb: Material = w.material("stucco", Color("bfc4bc"))
	var yellow: Material = w.material("plain", Color("e3c13b"))
	var soil: Material = w.material("dirt", Color("b9a587"))
	var cover: Material = w.material("grass", Color("b6d48e"))
	var middle := (MEDIAN.x + MEDIAN.y) / 2.0
	var width := MEDIAN.y - MEDIAN.x
	for run in _runs(NOSE_E, NOSE_W):
		var x0: float = run[0]
		var x1: float = run[1]
		_kerb(x0, x1, MEDIAN.x + KERB, kerb)
		_kerb(x0, x1, MEDIAN.y - KERB, kerb)
		_slab(x0, x1, MEDIAN.x + 2.0 * KERB, MEDIAN.y - 2.0 * KERB, 0.04, 0.24, soil)
		_slab(x0 - 0.15, x1 + 0.15, MEDIAN.x + 2.0 * KERB, MEDIAN.y - 2.0 * KERB, 0.1, 0.06, cover)
		for end in [x0, x1]:
			var nose: bool = end == NOSE_E or end == NOSE_W
			w.box(Vector3(0.27, 0.215, width), Vector3(end, -0.1, middle), yellow)
			if nose:
				# The noses' kerbs are yellow round their first two metres.
				var inward := -1.0 if end == NOSE_E else 1.0
				for z in [MEDIAN.x + KERB, MEDIAN.y - KERB]:
					w.box(Vector3(2.0, 0.216, 2.0 * KERB + 0.01), Vector3(end + inward * 1.0, -0.1, z), yellow)

## The shrub strips between each covered walkway and its open walk: soil in a grey
## edging, a red-tipped shrub hedge, broken at the crossings.
func _shrub_beds() -> void:
	var soil: Material = w.material("dirt", Color("b29d7c"))
	var kerb: Material = w.material("concrete", Color("b9b8b0"))
	var body: Material = w.material("grass", Color("9fbf88"))
	var tips: Material = w.material("plain", Color("c47a43"))
	for strip in [SHRUB_N, SHRUB_S]:
		var middle: float = (strip.x + strip.y) / 2.0
		for run in _runs(PLAZA_X, SHRUB_WEST):
			var x0: float = run[0]
			var x1: float = run[1]
			_slab(x0, x1, strip.x, strip.y, 0.04, 0.2, soil)
			for z in [strip.x + 0.06, strip.y - 0.06]:
				w.box(Vector3(x0 - x1, 0.18, 0.12), Vector3((x0 + x1) / 2.0, 0.03, z), kerb)
			for end in [x0, x1]:
				w.box(Vector3(0.12, 0.18, strip.y - strip.x), Vector3(end, 0.03, middle), kerb)
			w.box(Vector3(x0 - x1 - 0.5, 0.82, 1.15), Vector3((x0 + x1) / 2.0, 0.49, middle), body)
			w.box(Vector3(x0 - x1 - 0.7, 0.1, 1.0), Vector3((x0 + x1) / 2.0, 0.93, middle), tips)

## The narrow planters at both buildings' faces, behind the covered walkways.
func _planters() -> void:
	var soil: Material = w.material("dirt", Color("a8926f"))
	var kerb: Material = w.material("concrete", Color("c9c8c0"))
	_slab(EAST_X, END_X, FACE_N, WALK_N.x, 0.1, 0.3, soil)
	w.box(Vector3(EAST_X - END_X, 0.3, 0.12), Vector3((EAST_X + END_X) / 2.0, 0.0, WALK_N.x), kerb)
	# The south planter stops at the Student Center's openings, tiled through like the walkway.
	for run in StudentCenter.runs(EAST_X, END_X):
		var east: float = run[0]
		var west: float = run[1]
		_slab(east, west, WALK_S.y, FACE_S, 0.1, 0.3, soil)
		w.box(Vector3(east - west, 0.3, 0.12), Vector3((east + west) / 2.0, 0.0, WALK_S.y), kerb)
		for end in [east, west]:
			w.box(Vector3(0.12, 0.3, FACE_S - WALK_S.y), Vector3(end, 0.0, (WALK_S.y + FACE_S) / 2.0), kerb)
	for opening in StudentCenter.OPENINGS:
		_slab(opening.x, opening.y, WALK_S.y, FACE_S, WALK_Y, 0.2, w.material("slab"))

# --- The covered walkways ---------------------------------------------------------------------

## A covered walkway's structure (its tiles are laid in _walks): two rows of terracotta
## block pillars with a white steel post on each, white edge beams along both rows, a
## white rafter across at every pillar pair, close white slats across under the roof,
## the pale ribbed roof sheet with fascias, and downlights. `north` is PGN's side.
func _covered(north: bool) -> void:
	var blocks: Material = w.material("stucco", Color("e7957c"))
	var groove: Material = w.material("stucco", Color("a9614c"))
	var plinth: Material = w.material("stucco", Color("c27863"))
	var white: Material = w.material("plain", Color("f1eee4"))
	var slats: Material = w.material("plain", Color("e9e5d8"))
	var sheet: Material = w.material("ribbed", Color("fbf9f1"))
	var front: float = FRONT_N if north else FRONT_S
	var back: float = BACK_N if north else BACK_S
	var middle := (front + back) / 2.0
	var out := 1.0 if north else -1.0 # towards the road
	var length := ROOF_EAST - ROOF_WEST
	var middle_x := (ROOF_EAST + ROOF_WEST) / 2.0
	var top := 0.12 + 5.0 * 0.47 # the pillars' top
	var beam := 2.95 # the beams' underside
	for k in PILLARS:
		var x := PILLAR_EAST - k * BAY
		for z in [front, back]:
			w.box(Vector3(0.54, 0.12, 0.54), Vector3(x, 0.06, z), plinth)
			w.box(Vector3(0.42, top - 0.12, 0.42), Vector3(x, (top + 0.12) / 2.0, z), groove)
			for i in 5:
				w.box(Vector3(0.46, 0.45, 0.46), Vector3(x, 0.12 + i * 0.47 + 0.225, z), blocks)
			w.box(Vector3(0.14, beam - top, 0.14), Vector3(x, (beam + top) / 2.0, z), white)
		# The rafter across, out past both rows, and its rib on the sheet (the roof reads in
		# white bays from above, as on the aerial).
		w.box(Vector3(0.1, 0.18, 3.0 + 1.0), Vector3(x, beam + 0.33, middle), white)
		w.box(Vector3(0.09, 0.04, 4.1), Vector3(x, beam + 0.55, middle), w.material("plain", Color("d9d4c6")))
	for z in [front, back]:
		w.box(Vector3(length, 0.22, 0.16), Vector3(middle_x, beam + 0.11, z), white)
	# Slats across, close together, under the sheet.
	var x := ROOF_EAST - 0.15
	while x > ROOF_WEST:
		w.box(Vector3(0.07, 0.06, 3.9), Vector3(x, beam + 0.45, middle), slats)
		x -= 0.32
	w.box(Vector3(length, 0.05, 4.1), Vector3(middle_x, beam + 0.51, middle), sheet)
	for z in [middle + out * 2.05, middle - out * 2.05]:
		w.box(Vector3(length, 0.2, 0.06), Vector3(middle_x, beam + 0.42, z), white)
	for end in [ROOF_EAST, ROOF_WEST]:
		w.box(Vector3(0.06, 0.2, 4.1), Vector3(end, beam + 0.42, middle), white)
	# A downlight in every bay (it glows at night), a light of its own in every other one.
	var panel: Material = w.glow(Color("fff1d8"), 0.15, 2.6)
	for k in PILLARS - 1:
		var bx := PILLAR_EAST - (k + 0.5) * BAY
		w.box(Vector3(0.28, 0.05, 0.28), Vector3(bx, beam + 0.38, middle), panel)
		if k % 2 == 0:
			w._omni(Vector3(bx, beam - 0.2, middle), Color("ffd9a6"), 0.9, 6.5)

## Granite benches between the back pillars, facing the walk.
func _benches() -> void:
	var granite: Material = w.material("stucco", Color("efe2cf"))
	var legs: Material = w.material("stucco", Color("d9c9b2"))
	for bench in benches():
		for dx in [-0.6, 0.6]:
			w.box(Vector3(0.3, 0.38, 0.32), Vector3(bench.x + dx, WALK_Y + 0.19, bench.y), legs)
		w.box(Vector3(1.75, 0.1, 0.44), Vector3(bench.x, WALK_Y + 0.43, bench.y), granite)

# --- Lampposts, poles, signs and props --------------------------------------------------------

## The bronze lampposts on the open walks: a fluted base, a slim pole, two scrolled arms
## with hanging lanterns, and a banner under them. In the photos the arms and banners
## face along the road; here they face across it, so they read from the camera's side
## views. A downlight at night.
func _lampposts(north: bool) -> void:
	var bronze := Color("4e3c2f")
	var dark: Material = w.material("plain", Color("3a2e26"))
	var lantern: Material = w.material("plain", Color("2a2622"))
	var flame: Material = w.glow(Color("ffe2a8"), 0.25, 3.4)
	var board: Material = w.material("plain", Color("f3efe4"))
	var art: Array[Material] = [w.material("plain", Color("8c3b2f")), w.material("plain", Color("b8963f")), w.material("plain", Color("4d5f86"))]
	var titles := ["Apung\nMamacalulu", "La Naval\nde Angeles", "Los Santos\nAngeles Custodios"]
	var i := 0
	for at in lamps():
		if (at.y < CENTRE) != north:
			continue
		_cylinder(0.17, 0.24, 0.7, Vector3(at.x, 0.31, at.y), dark, 10)
		_cylinder(0.26, 0.26, 0.08, Vector3(at.x, -0.0, at.y), dark, 10)
		w.rod(Vector3(at.x, 0.65, at.y), Vector3(at.x, 4.55, at.y), 0.085, bronze)
		_cylinder(0.1, 0.1, 0.1, Vector3(at.x, 2.25, at.y), dark, 8)
		_sphere(0.09, Vector3(at.x, 4.68, at.y), dark)
		for side in [-1.0, 1.0]:
			# The scroll: out and up, then over and down to the lantern's hook.
			var tip := Vector3(at.x + side * 0.62, 4.42, at.y)
			w.rod(Vector3(at.x, 4.12, at.y), Vector3(at.x + side * 0.42, 4.5, at.y), 0.035, bronze)
			w.rod(Vector3(at.x + side * 0.42, 4.5, at.y), tip, 0.03, bronze)
			w.rod(Vector3(at.x, 3.95, at.y), Vector3(at.x + side * 0.3, 4.1, at.y), 0.025, bronze)
			w.box(Vector3(0.24, 0.05, 0.24), tip + Vector3(0, -0.12, 0), lantern)
			w.box(Vector3(0.2, 0.3, 0.2), tip + Vector3(0, -0.3, 0), lantern)
			w.box(Vector3(0.14, 0.22, 0.21), tip + Vector3(0, -0.3, 0), flame)
			w.box(Vector3(0.21, 0.22, 0.14), tip + Vector3(0, -0.3, 0), flame)
			w.box(Vector3(0.1, 0.08, 0.1), tip + Vector3(0, -0.49, 0), lantern)
		# The banner on two brackets, its picture and its name on both faces.
		for y in [3.75, 2.5]:
			w.box(Vector3(0.7, 0.035, 0.035), Vector3(at.x, y, at.y), dark)
		w.box(Vector3(0.64, 1.3, 0.03), Vector3(at.x, 3.12, at.y), board)
		for face in [-1.0, 1.0]:
			w.box(Vector3(0.48, 0.58, 0.01), Vector3(at.x, 3.36, at.y + face * 0.02), art[i % 3])
			var label: Label3D = w.panel(titles[i % 3], Vector3(at.x, 2.82, at.y + face * 0.026), 0.56, 0.3, Color("6b5a33"))
			label.double_sided = false
			label.rotation.y = 0.0 if face > 0.0 else PI
		var light := SpotLight3D.new()
		light.light_color = Color("ffe2b0")
		light.light_energy = 3.2
		light.spot_range = 9.0
		light.spot_angle = 62.0
		light.spot_angle_attenuation = 0.8
		light.shadow_enabled = false
		light.rotation_degrees.x = -90.0
		w._lamp(light, Vector3(at.x, 4.2, at.y))
		i += 1

## The tall white poles: in each hedge strip, halfway between the lampposts, and (on the
## north side's turn) along the median.
func _poles(north: bool) -> void:
	var white := Color("eceae2")
	var base: Material = w.material("concrete", Color("e3e1d9"))
	var spots: Array[Vector2] = []
	var x := LAMP_EAST - LAMP_STEP / 2.0
	var k := 0
	while x > END_X + 1.5:
		if not in_crossing(x) and not in_crossing(x + 0.8) and not in_crossing(x - 0.8):
			spots.append(Vector2(x, HEDGE_N.y - 0.5 if north else HEDGE_S.x + 0.5))
			if north and k % 2 == 1:
				spots.append(Vector2(x, CENTRE))
		x -= LAMP_STEP
		k += 1
	for at in spots:
		var foot := 0.3 if absf(at.y - CENTRE) < 0.1 else 0.2
		w.box(Vector3(0.3, 0.25, 0.3), Vector3(at.x, foot - 0.05, at.y), base)
		w.rod(Vector3(at.x, foot, at.y), Vector3(at.x, 9.6, at.y), 0.075, white)
		_sphere(0.08, Vector3(at.x, 9.65, at.y), w.material("plain", Color("d9d6cc")))

## A board facing along x (towards `facing`, +1 east), its face a board with shaded text.
func _board(lines: String, at: Vector3, size: Vector2, board: Color, ink: Color, facing: float) -> void:
	w.box(Vector3(0.04, size.y, size.x), at, w.material("plain", board))
	var label: Label3D = w.panel(lines, at + Vector3(facing * 0.03, 0, 0), size.x * 0.9, size.y * 0.55, ink)
	label.rotation.y = facing * PI / 2.0
	label.double_sided = false

## The round SLOW DOWN / 10 KPH signs on the median's noses (facing the traffic coming
## at them), and the yellow SCHOOL ZONE boards at both ends of the open walks.
func _signs() -> void:
	var post := Color("d9d6cc")
	for nose in [[NOSE_E, 1.0], [NOSE_W, -1.0]]:
		var facing: float = nose[1]
		var at := Vector3(nose[0] - facing * 0.9, 0.1, CENTRE)
		w.box(Vector3(0.36, 0.2, 0.36), at + Vector3(0, 0.0, 0), w.material("concrete", Color("e9e6dc")))
		w.rod(at, at + Vector3(0, 2.0, 0), 0.045, post)
		var ring: MeshInstance3D = _cylinder(0.36, 0.36, 0.04, at + Vector3(facing * 0.03, 2.05, 0), w.material("plain", Color("f2f0e8")), 16)
		ring.rotation.z = PI / 2.0
		var face: MeshInstance3D = _cylinder(0.31, 0.31, 0.05, at + Vector3(facing * 0.04, 2.05, 0), w.material("plain", Color("f6f3ea")), 16)
		face.rotation.z = PI / 2.0
		for line in [["SLOW", 0.19, 0.2, 0.07, Color("c0392b")], ["DOWN", 0.11, 0.2, 0.07, Color("c0392b")], ["10", -0.03, 0.3, 0.18, Color("1d1d1d")], ["KPH", -0.19, 0.18, 0.06, Color("1d1d1d")]]:
			var label: Label3D = w.panel(line[0], at + Vector3(facing * 0.075, 2.05 + line[1], 0), line[2], line[3], line[4])
			label.rotation.y = facing * PI / 2.0
			label.double_sided = false
	var boards := [[Vector3(PLAZA_X - 1.2, 0.2, HEDGE_N.x + 0.55), 1.0], [Vector3(END_X + 1.6, 0.2, HEDGE_S.y - 0.55), -1.0]]
	for entry in boards:
		var at: Vector3 = entry[0]
		var facing: float = entry[1]
		for dz in [-0.32, 0.32]:
			w.box(Vector3(0.05, 1.45, 0.05), at + Vector3(0, 0.62, dz), w.material("plain", Color("c9c4b5")))
		_board("SCHOOL ZONE", at + Vector3(facing * 0.05, 1.6, 0), Vector2(0.8, 0.14), Color("f1c232"), Color("1d1d1d"), facing)
		_board("SLOW\nDOWN", at + Vector3(facing * 0.05, 1.3, 0), Vector2(0.8, 0.46), Color("f1c232"), Color("1d1d1d"), facing)
		_board("SPEED LIMIT 10 KPH", at + Vector3(facing * 0.05, 0.97, 0), Vector2(0.8, 0.2), Color("d4334b"), Color("fff6e4"), facing)

## The bins (green, blue, yellow on a black frame), the concrete urns with their agaves,
## and the big terracotta pots with palms on the plazas.
func _props() -> void:
	var frame: Material = w.material("plain", Color("26282a"))
	for at in BINS:
		w.box(Vector3(1.6, 0.05, 0.05), Vector3(at.x, 0.45, at.y + 0.3), frame)
		for k in 3:
			var colour: String = ["2f7a4f", "2c4d93", "e8c21f"][k]
			var bx := at.x - 0.52 + k * 0.52
			w.box(Vector3(0.46, 1.0, 0.46), Vector3(bx, 0.5, at.y), w.material("plain", Color(colour)))
			w.box(Vector3(0.5, 0.06, 0.5), Vector3(bx, 1.02, at.y), w.material("plain", Color(colour).darkened(0.15)))
			w.box(Vector3(0.2, 0.012, 0.2), Vector3(bx, 1.056, at.y), frame)
	var urn: Material = w.material("concrete", Color("d7d3c9"))
	for at in URNS:
		_urn(Vector3(at.x, -0.04, at.y), urn, false)
	for at in POTS:
		_cylinder(0.5, 0.36, 0.75, Vector3(at.x, 0.33, at.y), w.material("plain", Color("a7674b")), 10)
		_cylinder(0.53, 0.53, 0.07, Vector3(at.x, 0.72, at.y), w.material("plain", Color("8f5640")), 10)

## A concrete urn on a pedestal; `pink` plants a bougainvillea in it, else an agave.
func _urn(at: Vector3, made: Material, pink: bool) -> void:
	_cylinder(0.2, 0.26, 0.12, at + Vector3(0, 0.06, 0), made, 10)
	_cylinder(0.11, 0.16, 0.3, at + Vector3(0, 0.27, 0), made, 8)
	_cylinder(0.46, 0.2, 0.36, at + Vector3(0, 0.6, 0), made, 12)
	_cylinder(0.48, 0.48, 0.05, at + Vector3(0, 0.79, 0), made, 12)
	if not pink:
		for i in 9:
			var a := i * TAU / 9.0
			w.rod(at + Vector3(0, 0.75, 0), at + Vector3(cos(a) * 0.42, 1.3 + (i % 3) * 0.15, sin(a) * 0.42), 0.04, Color("5f8a4f"))

# --- The angel fountain ---------------------------------------------------------------------

## The fountain at the boulevard's head, from the SFJ and rotunda photos: a round
## basin in a red-brick wall with a stone cap, a rock mound in the water with jets round
## it, the tapered red stone plinth with its bronze plaque and a ram's head at each
## corner, and on it the sandstone group: the guardian angel, wings raised, behind a girl
## and a boy holding a book. They face east, down the boulevard.
func _fountain() -> void:
	var at := Vector3(FOUNTAIN.x, -0.19, FOUNTAIN.y)
	var brick: Material = w.material("brick", Color("e6a184"))
	var cap: Material = w.material("concrete", Color("d8d3c6"))
	# The wall and its cap as a ring of short straight pieces, so the water shows inside.
	var pieces := 32
	for i in pieces:
		var a := (i + 0.5) * TAU / pieces
		var length := TAU * BASIN / pieces + 0.04
		var mid := at + Vector3(cos(a) * (BASIN - 0.15), 0, sin(a) * (BASIN - 0.15))
		w.box(Vector3(0.3, 0.62, length), mid + Vector3(0, 0.31, 0), brick, -a)
		var rim := at + Vector3(cos(a) * (BASIN - 0.12), 0, sin(a) * (BASIN - 0.12))
		w.box(Vector3(0.42, 0.08, length + 0.02), rim + Vector3(0, 0.66, 0), cap, -a)
	var water: Material = w.glow(Color("6d97a0"), 0.12, 0.5)
	_cylinder(BASIN - 0.25, BASIN - 0.25, 0.04, at + Vector3(0, 0.46, 0), water, 32)
	# The rock mound.
	var rock: Material = w.material("ledge", Color("efe2cf"))
	for piece in [[Vector3(2.2, 0.7, 2.0), Vector3(0, 0.55, 0), 0.3], [Vector3(1.7, 0.6, 1.9), Vector3(0.2, 0.95, -0.1), 1.1],
			[Vector3(1.9, 0.5, 1.5), Vector3(-0.15, 1.05, 0.15), 2.0]]:
		w.box(piece[0], at + piece[1], rock, piece[2])
	# The jets round the mound (they glow a little, for the spray).
	var spray: Material = w.glow(Color("e6f2f4"), 0.35, 0.9)
	for i in 8:
		var a := i * TAU / 8.0 + 0.2
		var foot := at + Vector3(cos(a) * 1.75, 0.5, sin(a) * 1.75)
		var high := 0.8 + 0.35 * float(i % 2)
		w.box(Vector3(0.05, high, 0.05), foot + Vector3(cos(a) * 0.05, high / 2.0, sin(a) * 0.05), spray, -a, 0.1)
		w.box(Vector3(0.3, 0.02, 0.3), foot + Vector3(0, 0.0, 0), spray, a)
	# The plinth, tapering, with a cornice, the plaque on its east face and the rams' heads.
	var stone: Material = w.material("stucco", Color("b4775a"))
	var plinth := at + Vector3(0, 1.3, 0)
	w.box(Vector3(1.55, 0.18, 1.55), plinth + Vector3(0, 0.09, 0), stone)
	for i in 6:
		var size := 1.42 - i * 0.04
		w.box(Vector3(size, 0.2, size), plinth + Vector3(0, 0.28 + i * 0.2, 0), stone)
	w.box(Vector3(1.4, 0.14, 1.4), plinth + Vector3(0, 1.45, 0), stone)
	w.box(Vector3(0.03, 0.42, 0.72), plinth + Vector3(0.685, 0.78, 0), w.material("plain", Color("6b5532")))
	w.box(Vector3(0.035, 0.34, 0.64), plinth + Vector3(0.69, 0.78, 0), w.material("plain", Color("3e3122")))
	var ram: Material = w.material("stucco", Color("9e6a50"))
	for corner in [Vector2(1, 1), Vector2(1, -1), Vector2(-1, 1), Vector2(-1, -1)]:
		var c := plinth + Vector3(corner.x * 0.72, 0.95, corner.y * 0.72)
		_sphere(0.17, c, ram, 0.9)
		_sphere(0.09, c + Vector3(corner.x * 0.14, -0.08, corner.y * 0.14), ram)
	# The sandstone group on the plinth (the base is at y `group`).
	var sand: Material = w.material("stucco", Color("e0a77c"))
	var shade: Material = w.material("stucco", Color("c78d64"))
	var group := plinth + Vector3(0, 1.52, 0)
	w.box(Vector3(1.3, 0.18, 1.1), group + Vector3(0, 0.09, 0), shade)
	# The angel, a little behind (west of) the children.
	var angel := group + Vector3(-0.28, 0.18, 0)
	_cylinder(0.24, 0.36, 1.5, angel + Vector3(0, 0.75, 0), sand, 10)
	_cylinder(0.2, 0.24, 0.45, angel + Vector3(0, 1.7, 0), sand, 10)
	_sphere(0.15, angel + Vector3(0.02, 2.08, 0), sand)
	_sphere(0.16, angel + Vector3(-0.02, 2.12, 0), shade, 0.8)
	for side in [-1.0, 1.0]:
		# Arms reaching down round the children's shoulders.
		w.rod(angel + Vector3(0.05, 1.85, side * 0.22), angel + Vector3(0.38, 1.35, side * 0.3), 0.07, Color("d9a077"))
		# The wing: a fan of long feathers from behind the shoulder, rising past the head and
		# sweeping down behind, with a layer of short coverts over their roots. It is spread
		# out and swept back (60°), so from the side views it shows a wing's outline.
		var sweep := 1.05
		var turn := atan2(-sin(sweep), side * cos(sweep))
		var shoulder := angel + Vector3(-0.14, 1.78, side * 0.16)
		var fan := [[92.0, 1.25], [78.0, 1.5], [64.0, 1.6], [50.0, 1.5], [36.0, 1.35], [22.0, 1.15], [8.0, 0.95]]
		for k in fan.size():
			var rise: float = deg_to_rad(fan[k][0])
			var length: float = fan[k][1]
			var along := Vector3(-sin(sweep), 0, side * cos(sweep)) * cos(rise) + Vector3.UP * sin(rise)
			w.box(Vector3(0.06, length, 0.2), shoulder + along * length / 2.0, sand if k % 2 == 0 else shade, turn, PI / 2.0 - rise)
			w.box(Vector3(0.07, length * 0.55, 0.22), shoulder + along * length * 0.28 + Vector3(0.02, 0, 0), shade, turn, PI / 2.0 - rise)
	# The girl (north, a dress) and the boy (south, with the book), in front of the angel.
	for child in [[1.0, Color("e6ae84")], [-1.0, Color("dda177")]]:
		var s: float = child[0]
		var made: Material = w.material("stucco", child[1])
		var foot := group + Vector3(0.22, 0.18, s * 0.27)
		if s > 0.0:
			_cylinder(0.12, 0.26, 0.75, foot + Vector3(0, 0.375, 0), made, 10)
		else:
			for leg in [-0.07, 0.07]:
				_cylinder(0.065, 0.07, 0.5, foot + Vector3(0, 0.25, leg), made, 6)
			_cylinder(0.14, 0.15, 0.3, foot + Vector3(0, 0.62, 0), made, 8)
		_cylinder(0.12, 0.15, 0.35, foot + Vector3(0, 0.92, 0), made, 8)
		_sphere(0.11, foot + Vector3(0.01, 1.2, 0), made)
		_sphere(0.115, foot + Vector3(-0.02, 1.23, 0), shade, 0.8)
		if s < 0.0:
			w.box(Vector3(0.12, 0.2, 0.3), foot + Vector3(0.16, 0.85, 0), shade, 0.0, 0.3)

# --- Planting -----------------------------------------------------------------------------

## The median's urns with bougainvillea, round topiary between them.
func _median_planting() -> void:
	var urn: Material = w.material("concrete", Color("d7d3c9"))
	var pinks: Array[Color] = [Color("4c7a3c"), Color("6c9445"), Color("c2457e"), Color("d9609a"), Color("e98bb7")]
	var x := NOSE_E - 3.0
	var k := 0
	while x > NOSE_W + 1.5:
		if not in_crossing(x) and not in_crossing(x + 1.2) and not in_crossing(x - 1.2):
			if k % 2 == 0:
				w.box(Vector3(0.75, 0.16, 0.75), Vector3(x, 0.15, CENTRE), w.material("concrete", Color("e1ddd3")))
				_urn(Vector3(x, 0.23, CENTRE), urn, true)
				w._shrub(Vector3(x, 0.95, CENTRE), 0.85, 1800 + k, pinks)
			else:
				w.rod(Vector3(x, 0.1, CENTRE), Vector3(x, 0.45, CENTRE), 0.06, Color("5f5546"))
				w._shrub(Vector3(x, 0.3, CENTRE), 1.15, 1800 + k, w.HEDGE_COLORS)
		x -= 6.4
		k += 1
	# The noses' round bushes.
	for nose in [NOSE_E - 2.1, NOSE_W + 2.1]:
		w._shrub(Vector3(nose, 0.1, CENTRE), 0.9, 1790 + roundi(nose), w.HEDGE_COLORS)

## Red-tipped shrubs along the shrub strips, leafy plants and small palms in the planters,
## palms in the plazas' pots.
func _bed_planting() -> void:
	var palms := Chapel.new()
	palms.w = w
	var k := 0
	for strip in [SHRUB_N, SHRUB_S]:
		var middle: float = (strip.x + strip.y) / 2.0
		for run in _runs(PLAZA_X, SHRUB_WEST):
			var x: float = run[0] - 1.2
			while x > run[1] + 0.8:
				w._shrub(Vector3(x, 0.55, middle + fmod(k * 0.37, 0.5) - 0.25), 1.0, 1900 + k)
				x -= 2.6
				k += 1
	for at in POTS:
		palms._palm(Vector3(at.x, 0.7, at.y), 1.9, 2200 + roundi(at.x * 3.0 + at.y))

## Small palms and leafy plants in one side's planter at its building (in the side's
## group: from across the road they would stand along the bottom of the view).
func _planter_planting(north: bool) -> void:
	var palms := Chapel.new()
	palms.w = w
	var middle: float = (FACE_N + WALK_N.x) / 2.0 if north else (WALK_S.y + FACE_S) / 2.0
	var x := EAST_X - 2.0
	var n := 0
	while x > END_X + 1.0:
		if not north and (StudentCenter.in_opening(x - 0.7) or StudentCenter.in_opening(x + 0.7)):
			x -= 4.1
			n += 1
			continue
		if n % 3 == 0:
			palms._palm(Vector3(x, 0.1, middle), 2.4 + fmod(n * 0.7, 0.9), 2000 + n + roundi(middle))
		else:
			w._shrub(Vector3(x, 0.1, middle), 1.1, 2100 + n + roundi(middle), w.HEDGE_COLORS)
		x -= 4.1
		n += 1

## The shade trees in one side's shrub strip, between the pillars every three bays.
func _trees(north: bool) -> void:
	var z: float = (SHRUB_N.x + SHRUB_N.y) / 2.0 if north else (SHRUB_S.x + SHRUB_S.y) / 2.0
	var i := 0
	for k in range(1, PILLARS - 1, 3):
		var x := PILLAR_EAST - (k + 0.5) * BAY
		if in_crossing(x) or in_crossing(x + 1.6) or in_crossing(x - 1.6) or x > PLAZA_X - 1.0:
			continue
		w._tree(Vector3(x, 0.04, z), 8.2 + fmod(i * 1.37, 1.9), (1600 if north else 1640) + i)
		i += 1

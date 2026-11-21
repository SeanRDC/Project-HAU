extends RefCounted
## The side gate's grounds (from the photos in assets/MAIN BUILDINGS DJDN/, 152951 to 153003): the
## flag circle across the drive from the Main Building's portico, and the walk from it square to
## the fence on Holy Angel Avenue, to the gatehouse; the lawns either side of the walk and the
## empty parking under trees between it and the drive. The gatehouse, the colonnade along the
## fence, the pavilions, the fence and the car gate are built on the plan's Side Gate 1 strip
## (STRIP: everything nearer the fence than that is theirs).
##
## The flag circle: a low mound edged with a yellow kerb, three flights down (east to the zebra
## across the drive, north to the boulevard's south walk, south onto the walk to the gate); its
## plaza of light aggregate with an eight-point star of dark aggregate edged in white cobbles; in
## the middle a round lawn with the flagpole on its granite pedestal, ringed by eight yellow and
## black posts on chains; royal palms tied round with white rope, swan-neck lamps, shrubs, the
## EVACUATION SITE 5 sign. The walk: diamond tiles with dark joints and white dots, dark cobble
## borders, stone benches and black bollard lights on the grass either side, low black fences,
## hedges and palms behind.
##
## Most of it is placed in the fence's frame: lx along the fence (from GATE, east positive),
## lz inward from the fence line (fence_local, fence_world).

## The flag circle: its middle, its radius and the plaza's level (three steps over the walks).
const CIRCLE := Vector2(-178.5, 86.9)
const CIRCLE_R := 6.4
const CIRCLE_Y := 0.45
const WALK_Y := -0.04
const DRIVE_Y := -0.19
## The drive's west kerb (Djdn.DRIVE.x): the circle touches it, the parking runs up to it.
const DRIVE_WEST := -172.1
## The fence line on the street (the plan's Side Gate 1 strip's street edge, 25.5 degrees off x;
## Djdn.fence_z is the same line), its direction, the inward normal, and the gate: the foot of the
## perpendicular from the circle's middle, so the walk runs straight from the circle to the gate.
const FENCE_A := Vector2(-207.6, 102.3)
const FENCE_B := Vector2(-168.0, 121.2)
const ALONG := Vector2(0.90248, 0.43073)
const INWARD := Vector2(0.43073, -0.90248)
const GATE := Vector2(-189.885, 110.755)
## A box turned by TURN lies with its x along the fence and its z along the walk (towards the gate).
const TURN := -0.44539
## The camera's view facing the gate square to the fence: its turn (in quarter turns; 2 faces south).
const GATE_TURNS := 2.0 + 0.44539 / (PI / 2.0)
## The circle's middle in the fence's frame (lz), and the gate strip's inner edge (the gatehouse,
## the colonnade and the fence are nearer the fence than STRIP).
const CIRCLE_LZ := 26.433
const STRIP := 6.75
## The walk: its paving's half width, its walkable half width (the cobble borders), the benches'
## and bollards' lines on the grass, the low fences'.
const PAVING := 2.0
const WALK_HALF := 2.35
const BENCH_LX := 2.85
const BOLLARD_LX := 2.6
const FENCE_LX := 3.35
const BENCHES: Array[float] = [10.5, 15.5]
## The parking between the walk and the drive (lx from PARK_LX, lz from STRIP to PARK_LZ), its trees.
const PARK_LX := 3.6
const PARK_LZ := 17.5
const PARK_TREES: Array[Vector2] = [Vector2(6.5, 10.5), Vector2(7.5, 15.0)]
## The circle: the round lawn in the middle (with the pedestal), the posts' ring, the plaza's
## star (its points' inner and outer radius), the flights' depth.
const LAWN_R := 2.95
const POSTS_R := 3.15
const STAR := Vector2(3.45, 5.2)
const FLIGHT_DEPTH := 1.0
## The flights: [angle from the middle (atan2(z, x)), the floor at their foot, half width, risers]:
## east to the zebra on the drive, south-west onto the walk, north to the boulevard's walk, west
## down to Rotonda 2's drive (the "right" stair to the SFJ fountain).
const FLIGHTS: Array = [[0.0, DRIVE_Y, 1.2, 4], [2.01624, WALK_Y, PAVING, 3], [-PI / 2.0, WALK_Y, 1.2, 3], [PI, DRIVE_Y, 1.2, 4]]
## The north flight's apron across to the boulevard's south walk (MiddleRoad.WALK_S.y 79.1).
const NORTH_APRON := Rect2(CIRCLE.x - 1.2, 78.9, 2.4, 1.8)
## The swan-neck lamps on the plaza (angle) and along the walk (lx, lz).
const PLAZA_LAMPS: Array[float] = [-2.5, -0.6, 0.95]
const WALK_LAMPS: Array[Vector2] = [Vector2(-2.95, 8.4), Vector2(2.95, 8.4), Vector2(-2.95, 13.0), Vector2(2.95, 13.0)]
const LAMP_R := 5.85
## The EVACUATION SITE 5 sign by the walk's head.
const SIGN := Vector2(-3.0, 19.0)
const BUILT_NAME := "SideGate"
## Facing the gate the camera stands over the boulevard: everything further from the fence than
## this (past the circle's palms) is cut away.
const CUT_LZ := 38.0

# --- The gate strip (from 153008, 153020, 153024 and HAU SIDE GATE DESIGN.jpg) --------------------
#
# Along the fence (lz 0) from the strip's west end to the drive: the gatehouse square over the walk
# (white piers, the band with LAUS DEO SEMPER 1933 inside and HOLY ANGEL UNIVERSITY and the seal
# outside, the glass pyramid on its white frame, three steps up from the walk, the turnstiles and
# the guard's desk inside, the iron gates folded back on the street side); either side of it the
# colonnade (square cream pillars with dark inset panels, cream beams, a dark slatted ceiling, the
# floor's dark X in every bay with beige borders, stone benches) to a terracotta-roofed pavilion at
# each end; the iron fence with rings on cream piers over a low wall; at the drive the car gate
# (closed) with the small guardhouse beside it; the bronze angel on its red pedestal on the lawn.

## The gatehouse's floor level (three steps up from the walk), its half width and its piers.
const GATE_Y := WALK_Y + 0.45
const HOUSE_HALF := 3.2
const STEPS := Vector2(5.85, 6.75)
const TURNSTILES := 2.6
const PIER := 0.9
## The colonnade: from the gatehouse along the fence each way (|lx|), its pillars' rows (lz) and
## their spacing, the pavilions at its ends; the covered walk between the rows.
const COLONNADE := Vector2(2.9, 17.2)
const PILLARS: Array[float] = [4.0, 7.0, 10.0, 13.0, 17.4]
const ROWS := Vector2(0.6, 4.1)
const COL_WALK := Vector2(0.95, 3.3)
const COL_CEILING := GATE_Y + 3.05
## The covered walk's cutaway: its middle (lz), the near plane just inside the inner row's faces
## (COL_CUT past the middle towards the camera, so the inner pillars fall away; the walk stops
## short of it), and the band behind it.
const COL_MIDDLE := 2.35
const COL_CUT := 1.4
const COL_BAND := 1.9
const BENCHES_COL: Array[float] = [5.5, 8.5, 11.5]
## The strip's ends along the fence, the car gate across the drive (lx), the fence's far end at
## the Main Building's south-west corner, the guardhouse, the angel.
const STRIP_WEST := -19.6
const CAR_GATE := Vector2(19.7, 25.65)
const FENCE_EAST := 37.35
const GUARDHOUSE := Rect2(17.8, 0.7, 1.7, 1.7)
const ANGEL := Vector2(10.5, 5.6)
const GATEHOUSE_NAME := "SideGateGatehouse"
const COLONNADE_NAME := "SideGateColonnade"
const FENCE_NAME := "SideGateFence"
const CAR_GATE_NAME := "SideGateCarGate"

static func fence_local(x: float, z: float) -> Vector2:
	var d := Vector2(x, z) - GATE
	return Vector2(d.dot(ALONG), d.dot(INWARD))

static func fence_world(lx: float, lz: float) -> Vector2:
	return GATE + ALONG * lx + INWARD * lz

## Which flight a point is on (-1: none), and how far down it (0 at its head, 1 at its foot).
static func flight_at(x: float, z: float) -> Vector2:
	var d := Vector2(x, z) - CIRCLE
	for i in FLIGHTS.size():
		var flight: Array = FLIGHTS[i]
		var a: float = flight[0]
		var along := d.dot(Vector2(cos(a), sin(a)))
		var lateral := d.dot(Vector2(-sin(a), cos(a)))
		if along > CIRCLE_R - FLIGHT_DEPTH and along <= CIRCLE_R + 0.02 and absf(lateral) < flight[2]:
			return Vector2(i, clampf((along - (CIRCLE_R - FLIGHT_DEPTH)) / FLIGHT_DEPTH, 0.0, 0.999))
	return Vector2(-1, 0)

static func on_circle(x: float, z: float) -> bool:
	var r := Vector2(x, z).distance_to(CIRCLE)
	if r >= CIRCLE_R + 0.02:
		return false
	return r < CIRCLE_R - 0.2 or flight_at(x, z).x >= 0.0

static func on_walk(x: float, z: float) -> bool:
	var p := fence_local(x, z)
	return absf(p.x) < WALK_HALF and p.y >= STRIP and p.y <= CIRCLE_LZ

static func on_parking(x: float, z: float) -> bool:
	var p := fence_local(x, z)
	return p.x > PARK_LX and p.y >= STRIP + 0.6 and p.y <= PARK_LZ and x < DRIVE_WEST

## The gatehouse's floor inside the turnstiles and its steps from the walk.
static func in_gatehouse(x: float, z: float) -> bool:
	var p := fence_local(x, z)
	if p.y >= STEPS.x and p.y < STEPS.y:
		return absf(p.x) < PAVING
	return absf(p.x) < COLONNADE.x + 0.1 and p.y >= TURNSTILES and p.y < STEPS.x

## The colonnade's covered walk and the pavilions (either side of the gatehouse).
static func in_colonnade(x: float, z: float) -> bool:
	var p := fence_local(x, z)
	return absf(p.x) >= COLONNADE.x and absf(p.x) <= COLONNADE.y and p.y >= COL_WALK.x and p.y <= COL_WALK.y

static func walkable(x: float, z: float) -> bool:
	if Vector2(x, z).distance_to(CIRCLE) < CIRCLE_R + 0.02:
		return on_circle(x, z)
	return on_walk(x, z) or on_parking(x, z) or NORTH_APRON.has_point(Vector2(x, z)) or in_gatehouse(x, z) or in_colonnade(x, z)

static func blocked(x: float, z: float) -> bool:
	if not walkable(x, z):
		return false
	var p := Vector2(x, z)
	var r := p.distance_to(CIRCLE)
	if r < POSTS_R + 0.25:
		return true # the lawn, the pedestal, the posts and their chains
	for a in PLAZA_LAMPS:
		if p.distance_to(CIRCLE + Vector2(cos(a), sin(a)) * LAMP_R) < 0.3:
			return true
	for tree in PARK_TREES:
		if p.distance_to(fence_world(tree.x, tree.y)) < 0.45:
			return true
	var q := fence_local(x, z)
	if in_colonnade(x, z) or in_gatehouse(x, z):
		# The gatehouse's piers, the colonnade's and pavilions' pillars, the benches, the desk.
		if absf(q.x) > HOUSE_HALF - PIER - 0.2 and absf(q.x) < HOUSE_HALF + 0.2 and q.y > STEPS.x - PIER - 0.4:
			return true
		for pillar in PILLARS:
			for row in [ROWS.x, ROWS.y]:
				if absf(absf(q.x) - pillar) < 0.5 and absf(q.y - row) < 0.5:
					return true
		for bench in BENCHES_COL:
			if absf(absf(q.x) - bench) < 1.1 and q.y > ROWS.y - 0.75:
				return true
	return false

static func floor_height(x: float, z: float) -> float:
	if not walkable(x, z):
		return NAN
	var flight := flight_at(x, z)
	if in_gatehouse(x, z) or in_colonnade(x, z):
		var q := fence_local(x, z)
		if q.y >= STEPS.x and absf(q.x) < PAVING:
			return WALK_Y + (GATE_Y - WALK_Y) * (floori((STEPS.y - q.y) / (STEPS.y - STEPS.x) * 3.0) + 1) / 3.0
		return GATE_Y
	if Vector2(x, z).distance_to(CIRCLE) < CIRCLE_R + 0.02:
		if flight.x < 0.0:
			return CIRCLE_Y
		var steps: Array = FLIGHTS[int(flight.x)]
		var risers: int = steps[3]
		var foot: float = steps[1]
		return CIRCLE_Y - (CIRCLE_Y - foot) * (floori(flight.y * risers) + 1) / risers
	return WALK_Y

## How far the camera faces the gate (1 on the circle, its north apron, the walk and the parking;
## easing out across their edges). aps.gd lets the boulevard's view keep the apron's north end.
static func view_for(x: float, z: float) -> float:
	var r := Vector2(x, z).distance_to(CIRCLE)
	var circle := 1.0 - smoothstep(CIRCLE_R - 0.3, CIRCLE_R + 0.6, r)
	if r < CIRCLE_R + 0.6 and x > DRIVE_WEST - 0.3:
		circle *= 1.0 - smoothstep(DRIVE_WEST - 0.3, DRIVE_WEST + 0.4, x) # the drive is the front's
	var p := fence_local(x, z)
	var walk := (1.0 - smoothstep(WALK_HALF, WALK_HALF + 0.8, absf(p.x))) * smoothstep(STRIP - 4.0, STRIP - 3.0, p.y) \
		* (1.0 - smoothstep(CIRCLE_LZ - 1.0, CIRCLE_LZ, p.y))
	var park := smoothstep(PARK_LX - 0.6, PARK_LX, p.x) * smoothstep(STRIP - 4.0, STRIP - 3.0, p.y) \
		* (1.0 - smoothstep(PARK_LZ, PARK_LZ + 0.8, p.y)) * (1.0 - smoothstep(DRIVE_WEST - 0.3, DRIVE_WEST + 0.4, x))
	# The gate strip: the gatehouse, the colonnade, the pavilions.
	var strip := (1.0 - smoothstep(STRIP - 0.5, STRIP + 0.2, p.y)) * (1.0 - smoothstep(COLONNADE.y, COLONNADE.y + 1.0, absf(p.x)))
	return maxf(maxf(circle, strip), maxf(walk, park))

## How far the student is under the colonnade (the covered walk's cutaway): 1 between its rows,
## easing in from the gatehouse's side.
static func colonnade_for(x: float, z: float) -> float:
	var p := fence_local(x, z)
	return smoothstep(COLONNADE.x - 0.2, COLONNADE.x + 0.6, absf(p.x)) * (1.0 - smoothstep(COLONNADE.y, COLONNADE.y + 0.5, absf(p.x))) \
		* (1.0 - smoothstep(COL_WALK.y, COL_WALK.y + 0.6, p.y)) * smoothstep(-0.2, COL_WALK.x, p.y)

## The colonnade's middle line level with the student (world x, z).
static func colonnade_middle(x: float, z: float) -> Vector2:
	return fence_world(fence_local(x, z).x, COL_MIDDLE)

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
	_lawns()
	_mound()
	_star()
	_middle()
	_walk()
	_walk_sides()
	_parking()
	_planting()
	_lamps()
	_sign()
	w._flush()
	_strip_lawn()
	w.root = _named(grounds, GATEHOUSE_NAME)
	_gatehouse()
	w._flush()
	w.root = _named(grounds, COLONNADE_NAME)
	_colonnade()
	_pavilions()
	w._flush()
	w.root = _named(grounds, FENCE_NAME)
	_fence()
	w._flush()
	w.root = _named(grounds, CAR_GATE_NAME)
	_car_gate()
	w._flush()
	w.root = grounds
	_guardhouse()
	_angel()
	w._flush()
	w.root = saved

## A box in the fence's frame: lx0..lx1 along the fence, y0..y1, lz0..lz1 inward.
func _local_block(lx0: float, lx1: float, y0: float, y1: float, lz0: float, lz1: float, made: Material) -> void:
	var at := fence_world((lx0 + lx1) / 2.0, (lz0 + lz1) / 2.0)
	w.box(Vector3(absf(lx1 - lx0), absf(y1 - y0), absf(lz1 - lz0)), Vector3(at.x, (y0 + y1) / 2.0, at.y), made, TURN)

func _cylinder(radius: float, height: float, at: Vector3, made: Material, segments := 16) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = height
	mesh.radial_segments = segments
	mesh.rings = 1
	return w._mesh(mesh, at, made)

## A ring of boxes round the circle's middle from radius r0 to r1, y0 to y1, leaving out the
## flights (and their sides by `margin`).
func _ring(r0: float, r1: float, y0: float, y1: float, made: Material, skip_flights := true, margin := 0.0) -> void:
	var segments := 64
	var mid := (r0 + r1) / 2.0
	for i in segments:
		var a := TAU * (i + 0.5) / segments
		if skip_flights and _in_flight_angle(a, mid, margin):
			continue
		var length := TAU * mid / segments * 1.04
		var at := CIRCLE + Vector2(cos(a), sin(a)) * mid
		w.box(Vector3(r1 - r0, y1 - y0, length), Vector3(at.x, (y0 + y1) / 2.0, at.y), made, -a)

func _in_flight_angle(a: float, r: float, margin: float) -> bool:
	for flight in FLIGHTS:
		var diff := absf(wrapf(a - float(flight[0]), -PI, PI))
		if r * sin(minf(diff, PI / 2.0)) < float(flight[2]) + margin and diff < PI / 2.0:
			return true
	return false

## The grass round the circle and either side of the walk, up to the drive and the gate strip
## (short of Rotonda 2's plot to the west).
func _lawns() -> void:
	var lawn: Material = w.material("lawn", Color("6f8a4b"))
	var a := fence_world(-6.0, STRIP)
	var d := fence_world(-6.0, 32.0)
	# (b: where the strip's inner edge meets the drive's kerb)
	var b := Vector2(DRIVE_WEST, GATE.y + ((DRIVE_WEST - GATE.x) * INWARD.x - STRIP) / -INWARD.y)
	var c := Vector2(DRIVE_WEST, 79.4)
	w._ground(PackedVector2Array([a, b, c, a, c, d]), WALK_Y - 0.03, lawn)

## The mound: a plaza of light aggregate within a yellow kerb, the three flights cut into its edge.
func _mound() -> void:
	var aggregate: Material = w.material("concrete", Color("cbc6bb"))
	var yellow: Material = w.material("plain", Color("e3b733"))
	var inner := CIRCLE_R - FLIGHT_DEPTH
	_cylinder(inner, CIRCLE_Y + 0.25, Vector3(CIRCLE.x, CIRCLE_Y - (CIRCLE_Y + 0.25) / 2.0, CIRCLE.y), aggregate, 48)
	_ring(inner - 0.05, CIRCLE_R - 0.15, -0.2, CIRCLE_Y, aggregate)
	_ring(CIRCLE_R - 0.15, CIRCLE_R, -0.2, CIRCLE_Y + 0.02, yellow)
	# The flights: a tread per riser, square across, from the plaza down to the foot's level.
	var nosing: Material = w.material("plain", Color("e3b733"))
	for flight in FLIGHTS:
		var a: float = flight[0]
		var foot: float = flight[1]
		var half: float = flight[2]
		var risers: int = flight[3]
		var out := Vector2(cos(a), sin(a))
		for k in risers - 1:
			var r0 := inner + FLIGHT_DEPTH * k / risers
			var r1 := inner + FLIGHT_DEPTH * (k + 1) / risers
			var top := CIRCLE_Y - (CIRCLE_Y - foot) * (k + 1) / risers
			var at := CIRCLE + out * (r0 + r1) / 2.0
			w.box(Vector3(r1 - r0, top + 0.25, half * 2.0), Vector3(at.x, (top - 0.25) / 2.0, at.y), aggregate, -a)
			var edge := CIRCLE + out * (r0 + 0.03)
			w.box(Vector3(0.06, 0.012, half * 2.0), Vector3(edge.x, top + 0.004, edge.y), nosing, -a)
		# The flight's yellow cheeks either side.
		for side in [-1.0, 1.0]:
			var cheek: Vector2 = CIRCLE + out * (inner + FLIGHT_DEPTH / 2.0) + Vector2(-out.y, out.x) * side * (half + 0.08)
			w.box(Vector3(FLIGHT_DEPTH, CIRCLE_Y + 0.22, 0.16), Vector3(cheek.x, (CIRCLE_Y + 0.02 - 0.2) / 2.0, cheek.y), yellow, -a)
	# The north flight's apron across to the boulevard's walk.
	var apron := NORTH_APRON
	w.box(Vector3(apron.size.x, 0.1, apron.size.y), Vector3(apron.get_center().x, WALK_Y - 0.05, apron.get_center().y), aggregate)

## The plaza's eight-point star: dark aggregate points edged in white cobbles, white cobble rings
## round its inside and outside.
func _star() -> void:
	var dark: Material = w.material("concrete", Color("57544f"))
	var cobble: Material = w.material("stone", Color("e6e2d8"))
	var y := CIRCLE_Y + 0.006
	var triangles := PackedVector2Array()
	for i in 8:
		var a := TAU * i / 8.0 + PI / 8.0
		var tip := CIRCLE + Vector2(cos(a), sin(a)) * STAR.y
		var left := CIRCLE + Vector2(cos(a - PI / 8.0), sin(a - PI / 8.0)) * STAR.x
		var right := CIRCLE + Vector2(cos(a + PI / 8.0), sin(a + PI / 8.0)) * STAR.x
		triangles.append_array([left, tip, right])
		for edge in [[left, tip], [tip, right]]:
			var p: Vector2 = edge[0]
			var q: Vector2 = edge[1]
			var mid := (p + q) / 2.0
			w.box(Vector3(0.16, 0.012, p.distance_to(q) + 0.12), Vector3(mid.x, y + 0.004, mid.y), cobble, atan2(q.x - p.x, q.y - p.y))
	w._ground(triangles, y, dark)
	_ring(STAR.x - 0.12, STAR.x + 0.05, CIRCLE_Y, CIRCLE_Y + 0.012, cobble, false)
	_ring(STAR.y + 0.05, STAR.y + 0.22, CIRCLE_Y, CIRCLE_Y + 0.012, cobble, false)

## The middle: the round lawn, the granite pedestal on its dark base, the flagpole and the flag,
## the eight yellow-and-black posts and the chains between them.
func _middle() -> void:
	_cylinder(LAWN_R, 0.12, Vector3(CIRCLE.x, CIRCLE_Y + 0.0, CIRCLE.y), w.material("lawn", Color("6f8a4b")), 32)
	_cylinder(LAWN_R + 0.1, 0.1, Vector3(CIRCLE.x, CIRCLE_Y - 0.01, CIRCLE.y), w.material("stone", Color("e6e2d8")), 32)
	_cylinder(1.05, 0.3, Vector3(CIRCLE.x, CIRCLE_Y + 0.15, CIRCLE.y), w.material("concrete", Color("4d4b48")), 24)
	var granite: Material = w.material("stone", Color("9a958e"))
	w.box(Vector3(1.3, 1.45, 1.3), Vector3(CIRCLE.x, CIRCLE_Y + 0.3 + 0.725, CIRCLE.y), granite)
	w.box(Vector3(1.45, 0.12, 1.45), Vector3(CIRCLE.x, CIRCLE_Y + 1.81, CIRCLE.y), granite)
	var pole_top := Vector3(CIRCLE.x, 14.0, CIRCLE.y)
	w.rod(Vector3(CIRCLE.x, CIRCLE_Y + 1.87, CIRCLE.y), pole_top, 0.09, Color("d3d6d8"))
	var finial := SphereMesh.new()
	finial.radius = 0.12
	finial.height = 0.24
	w._mesh(finial, pole_top + Vector3(0, 0.12, 0), w.material("plain", Color("c9a64a")))
	_flag(pole_top + Vector3(0, -0.25, 0))
	var yellow: Material = w.material("plain", Color("e8b923"))
	var black: Material = w.material("plain", Color("1e1f20"))
	var tops: Array[Vector3] = []
	for i in 8:
		var a := TAU * i / 8.0 + PI / 8.0
		var at := CIRCLE + Vector2(cos(a), sin(a)) * POSTS_R
		w.box(Vector3(0.34, 0.1, 0.34), Vector3(at.x, CIRCLE_Y + 0.05, at.y), black)
		for k in 4:
			_cylinder(0.06, 0.2, Vector3(at.x, CIRCLE_Y + 0.2 + k * 0.2, at.y), yellow if k % 2 == 0 else black, 8)
		tops.append(Vector3(at.x, CIRCLE_Y + 0.82, at.y))
	for i in 8:
		var p := tops[i]
		var q := tops[(i + 1) % 8]
		var previous := p
		for k in range(1, 5):
			var t := k / 4.0
			var at := p.lerp(q, t) + Vector3(0, -0.28 * 4.0 * t * (1.0 - t), 0)
			w.rod(previous, at, 0.012, Color("3a3a3a"))
			previous = at

## The Philippine flag on the pole, flying along the fence (so it faces the walk): blue over red,
## the white triangle at the hoist with the gold sun.
func _flag(hoist_top: Vector3) -> void:
	var length := 1.8
	var height := 0.9
	var along := Vector3(ALONG.x, 0, ALONG.y)
	var to_world := func(u: float, v: float) -> Vector3: return hoist_top + along * (u + 0.1) + Vector3(0, v, 0)
	var parts := [
		[Color("1f3f9a"), [Vector2(0, 0), Vector2(length, 0), Vector2(length, -height / 2.0), Vector2(0.78, -height / 2.0)]],
		[Color("c4202b"), [Vector2(0.78, -height / 2.0), Vector2(length, -height / 2.0), Vector2(length, -height), Vector2(0, -height)]],
		[Color("f3f1ea"), [Vector2(0, 0), Vector2(0.78, -height / 2.0), Vector2(0, -height)]]]
	for part in parts:
		var tool := SurfaceTool.new()
		tool.begin(Mesh.PRIMITIVE_TRIANGLES)
		var points: Array = part[1]
		for i in range(1, points.size() - 1):
			var tri := [points[0], points[i], points[i + 1]]
			for order in [[0, 1, 2], [0, 2, 1]]:
				for k in order:
					var uv: Vector2 = tri[k]
					tool.set_normal(Vector3(INWARD.x, 0, INWARD.y))
					tool.add_vertex(to_world.call(uv.x, uv.y))
		w._mesh(w.commit(tool), Vector3.ZERO, w.material("plain", part[0]))
	var sun: Vector3 = to_world.call(0.25, -height / 2.0)
	w.box(Vector3(0.12, 0.12, 0.12), sun, w.glow(Color("e8c040"), 0.05, 0.0), TURN)

## The walk: diamond tiles (pale squares turned 45 degrees with dark joints, white dots where the
## joints cross) between dark cobble borders, from the gate strip to the circle's flight.
func _walk() -> void:
	var tile: Material = w.material("concrete", Color("d9d5cc"))
	var joint: Material = w.material("plain", Color("6f6b64"))
	var cobble: Material = w.material("stone", Color("6b6862"))
	var white: Material = w.material("plain", Color("f1eee6"))
	var end := CIRCLE_LZ - CIRCLE_R + 0.3
	_local_block(-PAVING, PAVING, WALK_Y - 0.1, WALK_Y, STRIP, end, tile)
	for side in [-1.0, 1.0]:
		_local_block(side * PAVING, side * WALK_HALF, WALK_Y - 0.1, WALK_Y + 0.004, STRIP, end, cobble)
	# The joints: two families of lines at 45 degrees across the paving, clipped to it.
	var spacing := 0.9 * sqrt(2.0)
	var crossings: Array[float] = []
	var c := STRIP - 2.0 * PAVING
	while c < end + 2.0 * PAVING:
		crossings.append(c)
		for slope in [1.0, -1.0]:
			var t0 := maxf(-PAVING, slope * (STRIP - c)) if slope > 0.0 else maxf(-PAVING, (c - end))
			var t1 := minf(PAVING, slope * (end - c)) if slope > 0.0 else minf(PAVING, (c - STRIP))
			if t1 - t0 < 0.05:
				continue
			var tm := (t0 + t1) / 2.0
			var at := fence_world(tm, c + slope * tm)
			w.box(Vector3(0.05, 0.006, (t1 - t0) * sqrt(2.0)), Vector3(at.x, WALK_Y + 0.003, at.y), joint, TURN - slope * PI / 4.0)
		c += spacing
	for c1 in crossings:
		for c2 in crossings:
			var lx := (c2 - c1) / 2.0
			var lz := (c1 + c2) / 2.0
			if absf(lx) < PAVING - 0.1 and lz > STRIP + 0.1 and lz < end - 0.1:
				var at := fence_world(lx, lz)
				w.box(Vector3(0.09, 0.008, 0.09), Vector3(at.x, WALK_Y + 0.004, at.y), white, TURN + PI / 4.0)

## Either side of the walk on the grass: the stone benches, the black bollard lights, the low
## black fences, the hedges behind them.
func _walk_sides() -> void:
	var stone: Material = w.material("concrete", Color("b9b4aa"))
	var black := Color("1e1f20")
	for side in [-1.0, 1.0]:
		for lz in BENCHES:
			_local_block(side * BENCH_LX - 0.25, side * BENCH_LX + 0.25, WALK_Y + 0.38, WALK_Y + 0.48, lz - 0.95, lz + 0.95, stone)
			for end in [-0.7, 0.7]:
				_local_block(side * BENCH_LX - 0.18, side * BENCH_LX + 0.18, WALK_Y - 0.03, WALK_Y + 0.38, lz + end - 0.12, lz + end + 0.12, stone)
		var lz := STRIP + 1.4
		while lz < CIRCLE_LZ - CIRCLE_R - 0.5:
			var at := fence_world(side * BOLLARD_LX, lz)
			_cylinder(0.09, 0.72, Vector3(at.x, WALK_Y + 0.36, at.y), w.material("plain", black), 10)
			_cylinder(0.095, 0.08, Vector3(at.x, WALK_Y + 0.62, at.y), w.glow(Color("fff1d6"), 0.0, 2.2), 10)
			lz += 3.0
		# The low black fence: top and bottom rails, pickets.
		var from := fence_world(side * FENCE_LX, STRIP + 0.3)
		var to := fence_world(side * FENCE_LX, CIRCLE_LZ - CIRCLE_R - 0.4)
		for h in [0.12, 0.6]:
			w.rod(Vector3(from.x, WALK_Y + h, from.y), Vector3(to.x, WALK_Y + h, to.y), 0.018, black)
		var steps := floori(from.distance_to(to) / 0.25)
		for k in steps + 1:
			var at := from.lerp(to, float(k) / steps)
			w.rod(Vector3(at.x, WALK_Y, at.y), Vector3(at.x, WALK_Y + 0.62, at.y), 0.01, black)

## The parking between the walk and the drive: grass-and-cobble pavers (empty: no cars), yellow
## wheel stops at the bays' heads, two shade trees.
func _parking() -> void:
	var pavers: Material = w.material("pavers", Color("8f9585"))
	var a := fence_world(PARK_LX, STRIP + 0.6)
	var b := fence_world(PARK_LX, PARK_LZ)
	var to_drive := func(lz: float) -> Vector2:
		return Vector2(DRIVE_WEST, GATE.y + ((DRIVE_WEST - GATE.x) * INWARD.x - lz) / -INWARD.y)
	var c: Vector2 = to_drive.call(PARK_LZ)
	var d: Vector2 = to_drive.call(STRIP + 0.6)
	w._ground(PackedVector2Array([a, b, c, a, c, d]), WALK_Y, pavers)
	var yellow: Material = w.material("plain", Color("e3b733"))
	var lz := STRIP + 1.6
	while lz < PARK_LZ - 0.8:
		_local_block(PARK_LX + 0.6, PARK_LX + 0.75, WALK_Y, WALK_Y + 0.1, lz - 0.7, lz + 0.7, yellow)
		lz += 2.5
	for i in PARK_TREES.size():
		var at := fence_world(PARK_TREES[i].x, PARK_TREES[i].y)
		w._tree(Vector3(at.x, WALK_Y, at.y), 8.5, 5100 + i)

## Royal palms tied round with white rope, round the circle and along the walk; shrubs round the
## circle's kerb and hedges behind the walk's fences.
func _planting() -> void:
	var seed_value := 5200
	for a in [1.15, 2.55, -2.68, -2.08, -1.38]:
		var at := CIRCLE + Vector2(cos(a), sin(a)) * 7.4
		_royal_palm(Vector3(at.x, WALK_Y, at.y), 10.5 + (seed_value % 3) * 0.8, seed_value)
		seed_value += 1
	for spot in [Vector2(-3.4, 8.0), Vector2(3.4, 9.5), Vector2(-3.4, 14.0), Vector2(3.4, 17.0), Vector2(-3.6, 18.6)]:
		var at := fence_world(spot.x, spot.y)
		_royal_palm(Vector3(at.x, WALK_Y, at.y), 9.5 + (seed_value % 3) * 0.7, seed_value)
		seed_value += 1
	for i in 18:
		var a := TAU * (i + 0.5) / 18.0
		if _in_flight_angle(a, CIRCLE_R + 0.6, 0.6):
			continue
		var at := CIRCLE + Vector2(cos(a), sin(a)) * (CIRCLE_R + 0.55)
		if at.x > DRIVE_WEST - 0.5:
			continue
		w._shrub(Vector3(at.x, WALK_Y, at.y), 0.9, seed_value)
		seed_value += 1
	for side in [-1.0, 1.0]:
		var lz := STRIP + 0.8
		while lz < CIRCLE_LZ - CIRCLE_R - 0.4:
			var at := fence_world(side * (FENCE_LX + 0.6), lz)
			w._shrub(Vector3(at.x, WALK_Y, at.y), 1.0, seed_value)
			seed_value += 1
			lz += 1.3

## A royal palm: a tall straight pale grey trunk, white rope tied round it low down, a crown of
## long fronds.
func _royal_palm(at: Vector3, height: float, seed_value: int) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var crown := at + Vector3(random.randf_range(-0.2, 0.2), height, random.randf_range(-0.2, 0.2))
	w.rod(at, crown, 0.19, Color("a39d92"))
	w.rod(crown + Vector3(0, -1.4, 0), crown, 0.17, Color("6f8a52"))
	var rope: Material = w.material("plain", Color("f1eee6"))
	for h in [1.1, 1.35, 1.6]:
		_cylinder(0.2, 0.05, at.lerp(crown, h / height), rope, 10)
	var greens: Array[Color] = [Color("2f4a26"), Color("3f6430"), Color("557f3c"), Color("6f9a48"), Color("8fb456")]
	var fronds: ShaderMaterial = w._leaf_material(seed_value, crown, greens, true)
	# Two tiers: fronds reaching up and out, and longer ones drooping below them.
	var upper: ArrayMesh = w._cards(1.5, 3.0, 0.0, 2)
	var lower: ArrayMesh = w._cards(1.6, 3.8, 0.0, 2)
	for i in 16:
		var frond := MeshInstance3D.new()
		var droop := i % 2 == 1
		frond.mesh = lower if droop else upper
		frond.material_override = fronds
		var tilt := random.randf_range(105.0, 130.0) if droop else random.randf_range(45.0, 75.0)
		frond.transform = Transform3D(Basis(Vector3.UP, TAU * i / 16.0 + random.randf() * 0.25) * Basis(Vector3.RIGHT, deg_to_rad(tilt)), crown)
		frond.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
		w.root.add_child(frond)

## Swan-neck lamps: on the plaza's edge and along the walk, a black post curving over to a
## lantern, lit at night.
func _lamps() -> void:
	# Each lamp: its foot, and which way its head reaches (over the plaza, over the walk).
	var spots: Array = []
	for a in PLAZA_LAMPS:
		var at := CIRCLE + Vector2(cos(a), sin(a)) * LAMP_R
		spots.append([Vector3(at.x, CIRCLE_Y, at.y), Vector3(-cos(a), 0, -sin(a))])
	for spot in WALK_LAMPS:
		var at := fence_world(spot.x, spot.y)
		spots.append([Vector3(at.x, WALK_Y, at.y), Vector3(ALONG.x, 0, ALONG.y) * -signf(spot.x)])
	var black := Color("23262a")
	for spot in spots:
		var foot: Vector3 = spot[0]
		var out: Vector3 = spot[1]
		var top := foot + Vector3(0, 4.0, 0)
		w.box(Vector3(0.26, 0.3, 0.26), foot + Vector3(0, 0.15, 0), w.material("plain", black))
		w.rod(foot, top, 0.055, black)
		w.rod(top, top + out * 0.35 + Vector3(0, 0.35, 0), 0.045, black)
		w.rod(top + out * 0.35 + Vector3(0, 0.35, 0), top + out * 0.75 + Vector3(0, 0.15, 0), 0.04, black)
		var head := top + out * 0.75
		_cylinder(0.14, 0.22, head, w.material("plain", black), 12)
		w.box(Vector3(0.24, 0.04, 0.24), head + Vector3(0, -0.12, 0), w.glow(Color("fff0d2"), 0.1, 3.0))
		var light := SpotLight3D.new()
		light.light_color = Color("ffd194")
		light.light_energy = 3.5
		light.spot_range = 8.0
		light.spot_angle = 62.0
		light.spot_attenuation = 0.8
		light.rotation = Vector3(-PI / 2.0, 0, 0)
		w._lamp(light, head + Vector3(0, -0.15, 0))

## The EVACUATION SITE 5 sign by the walk's head: a yellow board on two posts, facing the circle.
func _sign() -> void:
	var at := fence_world(SIGN.x, SIGN.y)
	var black := Color("2a2b2c")
	for side in [-0.55, 0.55]:
		var foot := fence_world(SIGN.x + side, SIGN.y)
		w.rod(Vector3(foot.x, WALK_Y, foot.y), Vector3(foot.x, 2.35, foot.y), 0.03, black)
	w.box(Vector3(1.3, 0.5, 0.04), Vector3(at.x, 2.05, at.y), w.material("plain", Color("f0c419")), TURN)
	var label: Label3D = w.panel("EVACUATION SITE 5", Vector3(at.x + INWARD.x * 0.025, 2.05, at.y + INWARD.y * 0.025), 1.2, 0.36, Color("1e1e1e"))
	label.rotation.y = atan2(INWARD.x, INWARD.y)
	label.double_sided = false

# --- The gate strip ---------------------------------------------------------------------------

## A named node under parent (the checks find the gate strip's parts).
func _named(parent: Node3D, node_name: String) -> Node3D:
	var node := Node3D.new()
	node.name = node_name
	parent.add_child(node)
	return node

## A strip of `width` on the ground from local a to local b (lx, lz), y0..y1.
func _local_strip(a: Vector2, b: Vector2, width: float, y0: float, y1: float, made: Material) -> void:
	var p := fence_world(a.x, a.y)
	var q := fence_world(b.x, b.y)
	var mid := (p + q) / 2.0
	w.box(Vector3(width, y1 - y0, p.distance_to(q)), Vector3(mid.x, (y0 + y1) / 2.0, mid.y), made, atan2(q.x - p.x, q.y - p.y))

## A label on a face of the gate strip: facing inward (towards the campus) or out to the street.
func _strip_label(text: String, lx: float, y: float, lz: float, width: float, height: float, inward: bool) -> void:
	var at := fence_world(lx, lz)
	var label: Label3D = w.panel(text, Vector3(at.x, y, at.y), width, height, Color("2a2622"))
	var facing := INWARD if inward else -INWARD
	label.rotation.y = atan2(facing.x, facing.y)
	label.double_sided = false

## The grass on the strip round the gatehouse, the colonnade and the pavilions, out to the fence.
func _strip_lawn() -> void:
	var lawn: Material = w.material("lawn", Color("6f8a4b"))
	var a := fence_world(STRIP_WEST, 0.0)
	var b := fence_world(CAR_GATE.x, 0.0)
	var c := fence_world(CAR_GATE.x, STRIP)
	var d := fence_world(STRIP_WEST, STRIP)
	w._ground(PackedVector2Array([a, b, c, a, c, d]), WALK_Y - 0.03, lawn)

## The gatehouse: four white piers, the band round their heads with its words, the glass pyramid
## on its white frame, the floor and the three steps up from the walk, the turnstiles and the
## guard's desk, a light under the band, the iron gates folded back on the street side.
func _gatehouse() -> void:
	var white: Material = w.material("stucco", Color("f3f0e8"))
	var trim: Material = w.material("plain", Color("f7f5ef"))
	var floor: Material = w.material("concrete", Color("cfc9bd"))
	var h := HOUSE_HALF
	_local_block(-h, h, WALK_Y - 0.1, GATE_Y, 0.2, STEPS.x, floor)
	for k in 3:
		var lz0: float = STEPS.x + (STEPS.y - STEPS.x) * k / 3.0
		var lz1: float = STEPS.x + (STEPS.y - STEPS.x) * (k + 1) / 3.0
		var top := GATE_Y - (GATE_Y - WALK_Y) * k / 3.0
		_local_block(-PAVING - 0.3, PAVING + 0.3, WALK_Y - 0.1, top, lz0, lz1, floor)
		_local_block(-PAVING - 0.3, PAVING + 0.3, top - 0.02, top + 0.004, lz0, lz0 + 0.05, w.material("plain", Color("7d776f")))
	var band := Vector2(GATE_Y + 3.45, GATE_Y + 4.45)
	for side in [-1.0, 1.0]:
		for lz in [0.2, STEPS.x - PIER]:
			var x0: float = side * (h - PIER)
			var x1: float = side * h
			_local_block(x0, x1, GATE_Y, band.x, lz, lz + PIER, white)
			_local_block(x0 - side * 0.06, x1 + side * 0.06, GATE_Y, GATE_Y + 0.3, lz - 0.06, lz + PIER + 0.06, trim)
			_local_block(x0 - side * 0.06, x1 + side * 0.06, band.x - 0.25, band.x, lz - 0.06, lz + PIER + 0.06, trim)
	# The band: four sides round the piers' heads, a cornice over it.
	_local_block(-h - 0.05, h + 0.05, band.x, band.y, 0.15, 0.6, white)
	_local_block(-h - 0.05, h + 0.05, band.x, band.y, STEPS.x - 0.45, STEPS.x + 0.05, white)
	for side in [-1.0, 1.0]:
		_local_block(side * (h - 0.45), side * (h + 0.05), band.x, band.y, 0.15, STEPS.x + 0.05, white)
	_local_block(-h - 0.2, h + 0.2, band.y, band.y + 0.18, 0.0, STEPS.x + 0.2, trim)
	_strip_label("LAUS DEO SEMPER 1933", 0.0, (band.x + band.y) / 2.0, STEPS.x + 0.08, 4.8, 0.5, true)
	_strip_label("HOLY ANGEL UNIVERSITY", 0.0, (band.x + band.y) / 2.0 - 0.1, 0.12, 5.0, 0.5, false)
	var seal_at := fence_world(0.0, 0.05)
	var seal := _cylinder(0.32, 0.05, Vector3(seal_at.x, band.y - 0.05, seal_at.y), w.material("plain", Color("3f4a3c")), 20)
	seal.rotation = Vector3(PI / 2.0, -TURN, 0)
	# The glass pyramid on its white frame, a finial on top.
	var base := band.y + 0.18
	var apex := base + 2.0
	var corners := [fence_world(-h, 0.0), fence_world(h, 0.0), fence_world(h, STEPS.x + 0.2), fence_world(-h, STEPS.x + 0.2)]
	var top_at := fence_world(0.0, (STEPS.x + 0.2) / 2.0)
	var tip := Vector3(top_at.x, apex, top_at.y)
	var tool := SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in 4:
		var a: Vector2 = corners[i]
		var b: Vector2 = corners[(i + 1) % 4]
		var va := Vector3(a.x, base, a.y)
		var vb := Vector3(b.x, base, b.y)
		var normal := (vb - va).cross(tip - va).normalized()
		if normal.y < 0.0:
			normal = -normal
		for v in [va, tip, vb, va, vb, tip]:
			tool.set_normal(normal)
			tool.add_vertex(v)
		w.rod(va, tip, 0.04, Color("f3f1ea"))
		w.rod(va, vb, 0.05, Color("f3f1ea"))
		for t in [0.33, 0.66]:
			w.rod(va.lerp(tip, t), vb.lerp(tip, t), 0.02, Color("f3f1ea"))
	var glass: MeshInstance3D = w._mesh(w.commit(tool), Vector3.ZERO, w.material("glass", Color("bcd6df")))
	glass.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	w.rod(tip, tip + Vector3(0, 0.5, 0), 0.04, Color("e8e6de"))
	# The turnstiles and the guard's desk.
	var steel := Color("9aa0a4")
	for lx in [-1.6, 0.0, 1.6]:
		var at := fence_world(lx, TURNSTILES - 0.1)
		w.box(Vector3(0.3, 1.0, 0.4), Vector3(at.x, GATE_Y + 0.5, at.y), w.material("metal", Color("a8adb0")), TURN)
		for arm in 3:
			var a := TAU * arm / 3.0
			var reach := Vector3(ALONG.x, 0, ALONG.y) * cos(a) * 0.55 + Vector3(0, sin(a) * 0.3, 0)
			w.rod(Vector3(at.x, GATE_Y + 0.85, at.y), Vector3(at.x, GATE_Y + 0.85, at.y) + reach, 0.02, steel)
	_local_block(1.9, 2.25, GATE_Y, GATE_Y + 0.95, 1.2, 2.6, w.material("wood", Color("6b4a36")))
	var lamp := fence_world(0.0, STEPS.x / 2.0)
	w.box(Vector3(0.5, 0.05, 0.5), Vector3(lamp.x, band.x - 0.05, lamp.y), w.glow(Color("fff1d6"), 0.2, 2.0), TURN)
	# The iron gates on the street side, folded back against the outer piers.
	var iron := Color("1f2022")
	for side in [-1.0, 1.0]:
		var from := fence_world(side * (h - PIER - 0.05), 0.25)
		var to := fence_world(side * (h - PIER - 0.05), 1.6)
		for y in [GATE_Y + 0.15, GATE_Y + 2.2]:
			w.rod(Vector3(from.x, y, from.y), Vector3(to.x, y, to.y), 0.025, iron)
		for k in 8:
			var at := from.lerp(to, k / 7.0)
			w.rod(Vector3(at.x, GATE_Y + 0.15, at.y), Vector3(at.x, GATE_Y + 2.2, at.y), 0.012, iron)

## The colonnade either side of the gatehouse: its floor with a dark X in every bay and beige
## borders, the square cream pillars on both rows with dark inset panels, cream beams, the dark
## slatted ceiling under a flat roof, stone benches along the inner row.
func _colonnade() -> void:
	var cream: Material = w.material("stucco", Color("ece0bf"))
	var trim: Material = w.material("plain", Color("f1e9d2"))
	var granite: Material = w.material("concrete", Color("97928a"))
	var dark: Material = w.material("concrete", Color("4e4b47"))
	var beige: Material = w.material("stone", Color("dccdb0"))
	var panel: Material = w.material("plain", Color("2a2a2c"))
	var slat: Material = w.material("plain", Color("2c2723"))
	var stone: Material = w.material("concrete", Color("b9b4aa"))
	for side in [-1.0, 1.0]:
		var x0: float = side * COLONNADE.x
		var x1: float = side * COLONNADE.y
		_local_block(x0, x1, WALK_Y - 0.1, GATE_Y, 0.2, ROWS.y + 0.4, granite)
		# Beige border tiles along both edges, a dark X across each bay between the pillars.
		_local_block(x0, x1, GATE_Y, GATE_Y + 0.004, ROWS.x + 0.32, ROWS.x + 0.55, beige)
		_local_block(x0, x1, GATE_Y, GATE_Y + 0.004, ROWS.y - 0.55, ROWS.y - 0.32, beige)
		var edges: Array[float] = [COLONNADE.x]
		edges.append_array(PILLARS)
		for i in edges.size() - 1:
			var a: float = side * edges[i]
			var b: float = side * edges[i + 1]
			_local_strip(Vector2(a, ROWS.x + 0.55), Vector2(b, ROWS.y - 0.55), 0.28, GATE_Y, GATE_Y + 0.005, dark)
			_local_strip(Vector2(a, ROWS.y - 0.55), Vector2(b, ROWS.x + 0.55), 0.28, GATE_Y, GATE_Y + 0.005, dark)
		# The pillars (the last pair are the pavilion's) with their inset panels, beams on both rows.
		for pillar in PILLARS:
			var lx: float = side * pillar
			for row in [ROWS.x, ROWS.y]:
				_local_block(lx - 0.3, lx + 0.3, GATE_Y, COL_CEILING + 0.1, row - 0.3, row + 0.3, cream)
				_local_block(lx - 0.36, lx + 0.36, GATE_Y, GATE_Y + 0.25, row - 0.36, row + 0.36, trim)
				var face: float = row + (0.305 if row > 2.0 else -0.305)
				_local_block(lx - 0.13, lx + 0.13, GATE_Y + 1.1, GATE_Y + 2.3, face - 0.01, face + 0.01, panel)
		for row in [ROWS.x, ROWS.y]:
			_local_block(x0, side * PILLARS[3], COL_CEILING, COL_CEILING + 0.35, row - 0.25, row + 0.25, trim)
		# The dark slatted ceiling and the flat roof over it.
		var lx: float = COLONNADE.x + 0.15
		while lx < PILLARS[3]:
			_local_block(side * lx - 0.05, side * lx + 0.05, COL_CEILING - 0.02, COL_CEILING + 0.06, ROWS.x, ROWS.y, slat)
			lx += 0.3
		_local_block(x0, side * PILLARS[3], COL_CEILING + 0.35, COL_CEILING + 0.6, ROWS.x - 0.4, ROWS.y + 0.4, cream)
		_local_block(x0, side * PILLARS[3], COL_CEILING + 0.6, COL_CEILING + 0.68, ROWS.x - 0.45, ROWS.y + 0.45, trim)
		for bench in BENCHES_COL:
			var bx: float = side * bench
			_local_block(bx - 0.95, bx + 0.95, GATE_Y + 0.38, GATE_Y + 0.48, ROWS.y - 0.7, ROWS.y - 0.25, stone)
			for end in [-0.7, 0.7]:
				_local_block(bx + end - 0.12, bx + end + 0.12, GATE_Y, GATE_Y + 0.38, ROWS.y - 0.62, ROWS.y - 0.33, stone)
		# Ceiling lights between the slats.
		for bench in BENCHES_COL:
			var at := fence_world(side * bench, COL_MIDDLE)
			w.box(Vector3(0.3, 0.05, 0.3), Vector3(at.x, COL_CEILING - 0.04, at.y), w.glow(Color("fff1d6"), 0.15, 2.0), TURN)

## The pavilions at the colonnade's ends: open on cream pillars (the colonnade's last), a beam
## round their heads and a hipped roof of terracotta tiles.
func _pavilions() -> void:
	var trim: Material = w.material("plain", Color("f1e9d2"))
	var tile: Material = w.material("tile", Color("b45b3b"))
	for side in [-1.0, 1.0]:
		var x0: float = side * PILLARS[3]
		var x1: float = side * PILLARS[4]
		_local_block(x0, x1, COL_CEILING, COL_CEILING + 0.4, ROWS.x - 0.3, ROWS.x + 0.3, trim)
		_local_block(x0, x1, COL_CEILING, COL_CEILING + 0.4, ROWS.y - 0.3, ROWS.y + 0.3, trim)
		_local_block(x1 - side * 0.3, x1 + side * 0.3, COL_CEILING, COL_CEILING + 0.4, ROWS.x, ROWS.y, trim)
		# The hipped roof: four sloping faces to a short ridge along the fence.
		var eave := COL_CEILING + 0.4
		var ridge := eave + 1.6
		var lo := Vector2(minf(x0, x1) - 0.5, ROWS.x - 0.8)
		var hi := Vector2(maxf(x0, x1) + 0.5, ROWS.y + 0.8)
		var mid_z := (lo.y + hi.y) / 2.0
		var ridge_a := Vector2(lo.x + (hi.y - lo.y) / 2.0, mid_z)
		var ridge_b := Vector2(hi.x - (hi.y - lo.y) / 2.0, mid_z)
		if ridge_b.x < ridge_a.x:
			ridge_a = Vector2((lo.x + hi.x) / 2.0, mid_z)
			ridge_b = ridge_a
		var to3 := func(p: Vector2, y: float) -> Vector3:
			var at := fence_world(p.x, p.y)
			return Vector3(at.x, y, at.y)
		var c0: Vector3 = to3.call(Vector2(lo.x, lo.y), eave)
		var c1: Vector3 = to3.call(Vector2(hi.x, lo.y), eave)
		var c2: Vector3 = to3.call(Vector2(hi.x, hi.y), eave)
		var c3: Vector3 = to3.call(Vector2(lo.x, hi.y), eave)
		var ra: Vector3 = to3.call(ridge_a, ridge)
		var rb: Vector3 = to3.call(ridge_b, ridge)
		var faces := [[c0, c1, rb, ra], [c1, c2, rb], [c2, c3, ra, rb], [c3, c0, ra]]
		var tool := SurfaceTool.new()
		tool.begin(Mesh.PRIMITIVE_TRIANGLES)
		for face in faces:
			var points: Array = face
			var p0: Vector3 = points[0]
			var p1: Vector3 = points[1]
			var p2: Vector3 = points[2]
			var normal: Vector3 = (p1 - p0).cross(p2 - p0).normalized()
			var flip := normal.y < 0.0
			if flip:
				normal = -normal
			for i in range(1, points.size() - 1):
				var tri := [points[0], points[i], points[i + 1]]
				if flip:
					tri = [points[0], points[i + 1], points[i]]
				for v in tri:
					tool.set_normal(normal)
					tool.add_vertex(v)
		w._mesh(w.commit(tool), Vector3.ZERO, tile).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
		_local_block(lo.x + 0.4, hi.x - 0.4, eave - 0.06, eave, lo.y + 0.4, hi.y - 0.4, w.material("stucco", Color("efe7d2")))

## The fence on the street: a low cream wall, cream piers every three metres, iron bars between
## with a band of rings across them, from the strip's west end to the Main Building's corner,
## broken by the gatehouse and the car gate.
func _fence() -> void:
	var cream: Material = w.material("stucco", Color("ece0bf"))
	var trim: Material = w.material("plain", Color("f1e9d2"))
	var iron := Color("1f2022")
	var runs := [Vector2(STRIP_WEST, -HOUSE_HALF), Vector2(HOUSE_HALF, CAR_GATE.x), Vector2(CAR_GATE.y, FENCE_EAST)]
	for run in runs:
		var a: float = run.x
		var b: float = run.y
		_local_block(a, b, WALK_Y - 0.05, 0.55, 0.05, 0.35, cream)
		_local_block(a, b, 0.55, 0.62, 0.0, 0.4, trim)
		var count := maxi(1, roundi((b - a) / 3.0))
		for k in count + 1:
			var lx: float = lerpf(a, b, float(k) / count)
			_local_block(lx - 0.25, lx + 0.25, WALK_Y, 2.5, -0.05, 0.45, cream)
			_local_block(lx - 0.3, lx + 0.3, 2.5, 2.62, -0.1, 0.5, trim)
		var from := fence_world(a, 0.2)
		var to := fence_world(b, 0.2)
		for y in [0.75, 1.55, 2.3]:
			w.rod(Vector3(from.x, y, from.y), Vector3(to.x, y, to.y), 0.02, iron)
		var bars := floori((b - a) / 0.16)
		for k in bars + 1:
			var at := from.lerp(to, float(k) / bars)
			w.rod(Vector3(at.x, 0.62, at.y), Vector3(at.x, 2.35, at.y), 0.011, iron)
			if k % 2 == 0 and k < bars:
				var ring_at := from.lerp(to, (k + 1.0) / bars)
				var ring := TorusMesh.new()
				ring.inner_radius = 0.06
				ring.outer_radius = 0.075
				ring.rings = 8
				ring.ring_segments = 6
				var made: MeshInstance3D = w._mesh(ring, Vector3(ring_at.x, 1.95, ring_at.y), w.material("plain", iron))
				made.rotation = Vector3(PI / 2.0, -TURN, 0)

## The car gate across the drive at the fence line: two cream piers and the iron sliding gate
## between them, closed.
func _car_gate() -> void:
	var cream: Material = w.material("stucco", Color("ece0bf"))
	var trim: Material = w.material("plain", Color("f1e9d2"))
	var iron := Color("1f2022")
	for lx in [CAR_GATE.x, CAR_GATE.y]:
		_local_block(lx - 0.35, lx + 0.35, DRIVE_Y, 2.9, -0.1, 0.5, cream)
		_local_block(lx - 0.42, lx + 0.42, 2.9, 3.05, -0.17, 0.57, trim)
	var from := fence_world(CAR_GATE.x + 0.35, 0.2)
	var to := fence_world(CAR_GATE.y - 0.35, 0.2)
	for y in [DRIVE_Y + 0.12, 1.2, 2.25]:
		w.rod(Vector3(from.x, y, from.y), Vector3(to.x, y, to.y), 0.035, iron)
	var bars := floori(from.distance_to(to) / 0.14)
	for k in bars + 1:
		var at := from.lerp(to, float(k) / bars)
		w.rod(Vector3(at.x, DRIVE_Y + 0.12, at.y), Vector3(at.x, 2.45, at.y), 0.014, iron)

## The small guardhouse inside the car gate: white walls, a window on each side, a flat roof.
func _guardhouse() -> void:
	var white: Material = w.material("stucco", Color("f1eee6"))
	var g := GUARDHOUSE
	_local_block(g.position.x, g.end.x, WALK_Y, WALK_Y + 2.5, g.position.y, g.end.y, white)
	_local_block(g.position.x - 0.15, g.end.x + 0.15, WALK_Y + 2.5, WALK_Y + 2.68, g.position.y - 0.15, g.end.y + 0.15, w.material("plain", Color("f6f4ee")))
	var glass: Material = w.material("glass", Color("33414b"))
	_local_block(g.position.x + 0.3, g.end.x - 0.3, WALK_Y + 1.0, WALK_Y + 2.0, g.end.y, g.end.y + 0.03, glass)
	_local_block(g.end.x, g.end.x + 0.03, WALK_Y + 1.0, WALK_Y + 2.0, g.position.y + 0.3, g.end.y - 0.3, glass)

## The bronze angel on its red pedestal on the lawn by the parking.
func _angel() -> void:
	var at := fence_world(ANGEL.x, ANGEL.y)
	var red: Material = w.material("stucco", Color("9c3b2e"))
	var bronze: Material = w.material("plain", Color("5a4a33"))
	_local_block(ANGEL.x - 0.7, ANGEL.x + 0.7, WALK_Y, WALK_Y + 0.2, ANGEL.y - 0.7, ANGEL.y + 0.7, w.material("concrete", Color("a9a49c")))
	_local_block(ANGEL.x - 0.5, ANGEL.x + 0.5, WALK_Y + 0.2, WALK_Y + 1.7, ANGEL.y - 0.5, ANGEL.y + 0.5, red)
	var base := Vector3(at.x, WALK_Y + 1.7, at.y)
	var body := CylinderMesh.new()
	body.top_radius = 0.16
	body.bottom_radius = 0.32
	body.height = 1.3
	body.radial_segments = 10
	w._mesh(body, base + Vector3(0, 0.65, 0), bronze)
	var head := SphereMesh.new()
	head.radius = 0.14
	head.height = 0.28
	w._mesh(head, base + Vector3(0, 1.45, 0), bronze)
	for side in [-1.0, 1.0]:
		var wing: Vector3 = base + Vector3(0, 1.15, 0) + Vector3(ALONG.x, 0, ALONG.y) * side * 0.3 + Vector3(INWARD.x, 0, INWARD.y) * -0.1
		w.box(Vector3(0.6, 0.9, 0.05), wing, bronze, TURN + side * 0.5)
	w.rod(base + Vector3(0, 1.0, 0), base + Vector3(0, 1.9, 0) + Vector3(ALONG.x, 0, ALONG.y) * 0.25, 0.03, Color("5a4a33"))

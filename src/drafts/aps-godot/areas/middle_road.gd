extends RefCounted
## The middle road between PGN and MGN, from Mikko's photo taken on the west road
## looking west (assets/PGN MGN MIDDLE ROAD/, kept local: it shows people) and his
## marked-up aerial screenshot. A divided concrete boulevard runs straight west from
## the loop's west road to the flagpole at the flag circle: PGN on its north side,
## MGN's north block and the Main Building (DJDN) plot on its south side.
##
## Across it, north to south: PGN's covered walkway, a planting strip with shade trees
## and lampposts, the north carriageway, a hedged median with round topiary, the south
## carriageway, the south planting strip and the south covered walkway along MGN.
## The walkways are brick-red pavers under a flat white roof on cream steel, carried
## on square terracotta pillars at the road side. At the mouth: a yellow zebra
## across both carriageways, yellow kerb noses, the round "10 KPH" sign on the
## median's nose and a "SLOW DOWN" sign. Halfway, a second crossing faces the Main
## Building's side (the plan's courtyardGate). At the west end the carriageways run
## onto a round concrete apron round the flagpole's island.
##
## Built straight in world coordinates (PGN's south edge and the plots either side
## are square to x). Widths are fitted to the 24 m between the plots, not surveyed.

const Chapel := preload("res://areas/chapel.gd")

## Where the middle road's surfaces meet the loop's carriageway (its west kerb face is
## at x -62); east of EAST_X is the loop's own sidewalk, opened across the mouth (roads.gd).
const MOUTH_X := -61.9
const EAST_X := -63.6
## The walkways, strips and median end here; the carriageways run on to LANE_END_X and
## onto the apron round the flagpole.
const END_X := -166.0
const LANE_END_X := -170.0
## The median's nose, just past the zebra at the mouth.
const NOSE_X := -70.0
## The bands across the road (world z, from..to), north to south.
const WALK_N := Vector2(51.6, 55.4)
const STRIP_N := Vector2(55.4, 58.0)
const LANE_N := Vector2(58.0, 62.7)
const MEDIAN := Vector2(62.7, 64.3)
const LANE_S := Vector2(64.3, 69.0)
const STRIP_S := Vector2(69.0, 71.6)
const WALK_S := Vector2(71.6, 75.0)
## Pedestrian crossings (x from..to): through the strips and the median, zebra on the lanes.
const CROSSINGS: Array[Vector2] = [Vector2(-69.5, -66.5), Vector2(-107.0, -104.0)]
## The flag circle (campus_plan.gd's flagCircle): the apron's radius and the island's.
const FLAG := Vector2(-179.7, 65.2)
const APRON := 12.0
const ISLAND := 3.2
## The walkways' roof underside and the pillar spacing.
const ROOF_Y := 3.0
const BAY := 5.0
## The node holding PGN's side above the ground (its walkway's roof and pillars, the
## north strip's trees, palm and lampposts): the camera faces south across the road from
## that side, so aps.gd fades it out (shadows stay) while the middle road view is on.
const NORTH_GROUP := "MiddleRoadNorth"
## Kerb half-width either side of a kerb line.
const KERB := 0.135
## Lampposts in the strips, shade trees between them.
const LAMP_STEP := 15.0
const LAMP_FIRST := -72.0
## Benches against the walkways' back edges, the bins by the north walkway near the mouth.
const BENCHES: Array[Vector2] = [Vector2(-84.0, 52.2), Vector2(-124.0, 52.2), Vector2(-149.0, 52.2),
	Vector2(-94.0, 74.4), Vector2(-134.0, 74.4), Vector2(-159.0, 74.4)]
const BINS := Vector2(-74.5, 52.1)
## Terracotta pots on the walkways, at the strip side between pillars.
const POTS: Array[Vector2] = [Vector2(-65.2, 54.6), Vector2(-88.5, 54.6), Vector2(-118.5, 54.6),
	Vector2(-65.2, 72.4), Vector2(-98.5, 72.4), Vector2(-143.5, 72.4)]

static func _in(v: float, band: Vector2) -> bool:
	return v >= band.x and v <= band.y

static func in_crossing(x: float) -> bool:
	for crossing in CROSSINGS:
		if x >= crossing.x and x <= crossing.y:
			return true
	return false

static func on_apron(x: float, z: float) -> bool:
	return Vector2(x, z).distance_to(FLAG) <= APRON

## Ground the student may stand on: the whole corridor between the walkways' outer
## edges, the carriageways across the mouth and on to the apron, and the apron.
## blocked() then takes out the strips, the median, the pillars and the props.
static func walkable(x: float, z: float) -> bool:
	if x > MOUTH_X:
		return false
	if on_apron(x, z):
		return true
	if x < LANE_END_X:
		return false
	if x < END_X or x > EAST_X:
		return z >= LANE_N.x and z <= LANE_S.y # only the carriageways (and the median's end)
	return z >= WALK_N.x and z <= WALK_S.y

## The pillars: terracotta ones at the road side of each walkway, slim steel posts at the back.
static func pillars() -> Array[Vector2]:
	var at: Array[Vector2] = []
	var x := EAST_X - 2.4
	while x > END_X + 1.0:
		if not in_crossing(x) and not in_crossing(x - 1.0) and not in_crossing(x + 1.0):
			at.append(Vector2(x, WALK_N.y - 0.3))
			at.append(Vector2(x, WALK_S.x + 0.3))
		x -= BAY
	return at

static func lamps() -> Array[Vector2]:
	var at: Array[Vector2] = []
	var x := LAMP_FIRST
	while x > END_X + 2.0:
		at.append(Vector2(x, (STRIP_N.x + STRIP_N.y) / 2.0))
		at.append(Vector2(x, (STRIP_S.x + STRIP_S.y) / 2.0))
		x -= LAMP_STEP
	return at

static func blocked(x: float, z: float) -> bool:
	if not walkable(x, z):
		return false
	if Vector2(x, z).distance_to(FLAG) < ISLAND + 0.2:
		return true
	if x <= EAST_X and x >= END_X and not in_crossing(x):
		if z > STRIP_N.x and z < STRIP_N.y - KERB or z > STRIP_S.x + KERB and z < STRIP_S.y:
			return true # the planting strips
		if x <= NOSE_X and z > MEDIAN.x + KERB and z < MEDIAN.y - KERB:
			return true # the median
	for pillar in pillars():
		if absf(x - pillar.x) < 0.5 and absf(z - pillar.y) < 0.5:
			return true
	for bench in BENCHES:
		if absf(x - bench.x) < 1.3 and absf(z - bench.y) < 0.45:
			return true
	if absf(x - BINS.x) < 1.2 and absf(z - BINS.y) < 0.45:
		return true
	for at in POTS:
		if Vector2(x, z).distance_to(at) < 0.55:
			return true
	return false

static func floor_height(x: float, z: float) -> float:
	if not walkable(x, z):
		return NAN
	if on_apron(x, z) or x < END_X:
		return -0.19
	# The kerb lines: along both carriageways' outer edges, and round the median.
	if absf(z - LANE_N.x) < KERB or absf(z - LANE_S.y) < KERB:
		return 0.0
	if x <= NOSE_X and (absf(z - MEDIAN.x) < KERB or absf(z - MEDIAN.y) < KERB):
		return 0.0
	if z > LANE_N.x and z < LANE_S.y:
		if x > NOSE_X or z < MEDIAN.x or z > MEDIAN.y:
			return -0.19 # the carriageways, and across the mouth
	return -0.04 # the walkways, and the paved crossings through the strips and median

## How far the camera turns to face south across the road at the MGN side: 1 once off
## the west road's sidewalk onto the middle road, 0 on the loop.
static func view_for(x: float, z: float) -> float:
	return (1.0 - smoothstep(-66.0, -62.5, x)) * smoothstep(49.5, 52.0, z) * (1.0 - smoothstep(77.5, 80.0, z)) \
		* smoothstep(-194.0, -192.0, x)

var w: RefCounted

func build(world_builder: RefCounted) -> void:
	w = world_builder
	w._flush()
	_carriageways()
	_paint()
	_strips()
	_median()
	for band in [WALK_N, WALK_S]:
		w.box(Vector3(EAST_X - END_X, 0.16, band.y - band.x), Vector3((EAST_X + END_X) / 2.0, -0.12, (band.x + band.y) / 2.0),
			w.material("brick", Color("d99a80")))
	_walkway(WALK_S, false)
	_lampposts(false)
	_signs()
	_props()
	_flag()
	w._flush()
	_planting(false)
	_median_planting()
	w._flush()
	# PGN's side, in its own node for the camera's fade.
	var north := Node3D.new()
	north.name = NORTH_GROUP
	w.root.add_child(north)
	var saved: Node3D = w.root
	w.root = north
	_walkway(WALK_N, true)
	_lampposts(true)
	w._flush()
	_planting(true)
	w._flush()
	w.root = saved

# --- The road surface ------------------------------------------------------------------

## A flat rectangle of ground (world x from..to, z from..to).
func _rect(x0: float, x1: float, z0: float, z1: float, y: float, made: Material) -> void:
	w._ground(PackedVector2Array([Vector2(x0, z0), Vector2(x1, z0), Vector2(x1, z1),
		Vector2(x0, z0), Vector2(x1, z1), Vector2(x0, z1)]), y, made)

## A kerb along x at world z, from x0 to x1 (its top level with the sidewalks).
func _kerb(x0: float, x1: float, z: float, made: Material) -> void:
	w.box(Vector3(absf(x1 - x0), 0.21, 2.0 * KERB), Vector3((x0 + x1) / 2.0, -0.105, z), made)

## The concrete carriageways, from the loop's kerb to the apron, the apron round the
## flagpole, and the joints between the slabs.
func _carriageways() -> void:
	var concrete: Material = w.material("concrete", Color("f2f1ea"))
	_rect(LANE_END_X, MOUTH_X, LANE_N.x, LANE_S.y, -0.19, concrete)
	var disc := PackedVector2Array()
	var steps := 48
	for i in steps:
		var a := TAU * i / steps
		var b := TAU * (i + 1) / steps
		disc.append_array([FLAG, FLAG + Vector2(cos(a), sin(a)) * APRON, FLAG + Vector2(cos(b), sin(b)) * APRON])
	w._ground(disc, -0.19, concrete)
	var joint: Material = w.material("plain", Color("9d9c94"))
	var x := MOUTH_X - 4.5
	while x > LANE_END_X:
		for lane in [LANE_N, LANE_S]:
			w.box(Vector3(0.04, 0.006, lane.y - lane.x), Vector3(x, -0.186, (lane.x + lane.y) / 2.0), joint)
		x -= 4.5
	for z in [(LANE_N.x + LANE_N.y) / 2.0, (LANE_S.x + LANE_S.y) / 2.0]:
		w.box(Vector3(MOUTH_X - LANE_END_X, 0.006, 0.04), Vector3((MOUTH_X + LANE_END_X) / 2.0, -0.186, z), joint)

## The zebras (yellow, stripes along the road) and the yellow kerb noses at the mouth.
func _paint() -> void:
	var yellow: Material = w.material("plain", Color("e3c13b"))
	for crossing in CROSSINGS:
		var length: float = crossing.y - crossing.x - 0.4
		var middle: float = (crossing.x + crossing.y) / 2.0
		for lane in [LANE_N, LANE_S]:
			var z: float = lane.x + 0.5
			while z < lane.y - 0.3:
				w.box(Vector3(length, 0.008, 0.42), Vector3(middle, -0.183, z), yellow)
				z += 0.85

# --- Planting strips and the median -------------------------------------------------------

func _strips() -> void:
	var kerb: Material = w.material("stucco", Color("bfc4bc"))
	var yellow: Material = w.material("plain", Color("e3c13b"))
	var soil: Material = w.material("dirt", Color("c4b294"))
	var hedge: Material = w.material("grass", Color("8fb06a"))
	var pavers: Material = w.material("brick", Color("e8b09a"))
	# The lane-edge kerbs run from the loop's kerb line; across the mouth, yellow.
	for z in [LANE_N.x, LANE_S.y]:
		_kerb(MOUTH_X, END_X, z, kerb)
		w.box(Vector3(MOUTH_X - CROSSINGS[0].x, 0.215, 2.0 * KERB + 0.01), Vector3((MOUTH_X + CROSSINGS[0].x) / 2.0, -0.1, z), yellow)
	for strip in [STRIP_N, STRIP_S]:
		var road_side: float = strip.y if strip == STRIP_N else strip.x
		var walk_side: float = strip.x if strip == STRIP_N else strip.y
		var inner_z: float = (strip.x + strip.y) / 2.0
		var width: float = strip.y - strip.x - 2.0 * KERB
		var x0 := EAST_X
		for crossing in CROSSINGS + [Vector2(END_X, END_X)]:
			var x1: float = crossing.y
			if x0 - x1 > 0.5:
				# Soil, a low kerb on the walkway side, a clipped hedge along the road side.
				w.box(Vector3(x0 - x1, 0.24, width), Vector3((x0 + x1) / 2.0, -0.08, inner_z), soil)
				_kerb(x0, x1, walk_side, kerb)
				var hedge_z: float = road_side + (-0.55 if strip == STRIP_N else 0.55)
				w.box(Vector3(x0 - x1 - 0.6, 0.7, 0.8), Vector3((x0 + x1) / 2.0, 0.39, hedge_z), hedge)
				for end in [x0, x1]:
					w.box(Vector3(0.27, 0.21, strip.y - strip.x), Vector3(end, -0.105, inner_z), kerb)
			if crossing.x != crossing.y:
				# The paved crossing through the strip.
				w.box(Vector3(crossing.y - crossing.x, 0.16, strip.y - strip.x), Vector3((crossing.x + crossing.y) / 2.0, -0.12, inner_z), pavers)
			x0 = crossing.x

func _median() -> void:
	var kerb: Material = w.material("stucco", Color("bfc4bc"))
	var yellow: Material = w.material("plain", Color("e3c13b"))
	var soil: Material = w.material("dirt", Color("c4b294"))
	var hedge: Material = w.material("grass", Color("7fa35c"))
	var pavers: Material = w.material("brick", Color("e8b09a"))
	var middle := (MEDIAN.x + MEDIAN.y) / 2.0
	var width := MEDIAN.y - MEDIAN.x
	# From the nose west; the mouth's zebra is east of the nose, so it starts at the second crossing.
	var x0 := NOSE_X
	for crossing in CROSSINGS.slice(1) + [Vector2(END_X, END_X)]:
		var x1: float = crossing.y
		_kerb(x0, x1, MEDIAN.x, kerb)
		_kerb(x0, x1, MEDIAN.y, kerb)
		for end in [x0, x1]:
			w.box(Vector3(0.27, 0.21, width), Vector3(end, -0.105, middle), kerb)
		w.box(Vector3(x0 - x1, 0.24, width - 2.0 * KERB), Vector3((x0 + x1) / 2.0, -0.08, middle), soil)
		# The hedge leaves the nose's first metres for the round bush and the sign.
		var hedge_from := x0 - (3.2 if x0 == NOSE_X else 0.6)
		w.box(Vector3(hedge_from - x1 - 0.6, 0.55, width - 0.7), Vector3((hedge_from + x1 - 0.6) / 2.0 + 0.3, 0.31, middle), hedge)
		if crossing.x != crossing.y:
			w.box(Vector3(crossing.y - crossing.x, 0.16, width), Vector3((crossing.x + crossing.y) / 2.0, -0.12, middle), pavers)
		x0 = crossing.x
	# The nose's kerb is painted yellow round its end and its first two metres.
	w.box(Vector3(0.28, 0.215, width + 0.01), Vector3(NOSE_X, -0.1, middle), yellow)
	for z in [MEDIAN.x, MEDIAN.y]:
		w.box(Vector3(2.0, 0.215, 2.0 * KERB + 0.01), Vector3(NOSE_X - 1.0, -0.1, z), yellow)

# --- The covered walkways ---------------------------------------------------------------

## A covered walkway's structure along one side (its pavers are laid in build()): the
## terracotta pillars at the road side and slim cream posts at the back, cream steel
## beams, a flat white roof with a fascia, purlins underneath. `north` is PGN's side.
func _walkway(band: Vector2, north: bool) -> void:
	var terracotta: Material = w.material("stucco", Color("b5654a"))
	var cap: Material = w.material("stucco", Color("8f4c38"))
	var steel: Material = w.material("plain", Color("e7e0cc"))
	var roof: Material = w.material("stucco", Color("f4f2ea"))
	var under: Material = w.material("plain", Color("dcd8cc"))
	var length := EAST_X - END_X
	var middle_x := (EAST_X + END_X) / 2.0
	var middle_z := (band.x + band.y) / 2.0
	var width := band.y - band.x
	var front := band.y - 0.3 if north else band.x + 0.3
	var back := band.x + 0.2 if north else band.y - 0.2
	for pillar in pillars():
		if absf(pillar.y - front) > 0.01:
			continue
		w.box(Vector3(0.48, ROOF_Y, 0.48), Vector3(pillar.x, ROOF_Y / 2.0 - 0.04, front), terracotta)
		w.box(Vector3(0.58, 0.14, 0.58), Vector3(pillar.x, ROOF_Y - 0.04, front), cap)
		w.box(Vector3(0.58, 0.18, 0.58), Vector3(pillar.x, 0.05, front), cap)
		w.box(Vector3(0.12, ROOF_Y, 0.12), Vector3(pillar.x, ROOF_Y / 2.0 - 0.04, back), steel)
		# A cross beam from the pillar to the back post.
		w.box(Vector3(0.14, 0.24, width - 0.2), Vector3(pillar.x, ROOF_Y + 0.1, middle_z), steel)
	for z in [front, back]:
		w.box(Vector3(length, 0.26, 0.16), Vector3(middle_x, ROOF_Y + 0.1, z), steel)
	# The roof, a little wider than the walk, and the white fascia on the road side.
	var overhang := 0.45
	var roof_z := middle_z + (overhang / 2.0 if north else -overhang / 2.0)
	w.box(Vector3(length + 0.6, 0.12, width + overhang), Vector3(middle_x, ROOF_Y + 0.3, roof_z), roof)
	var edge := band.y + overhang if north else band.x - overhang
	w.box(Vector3(length + 0.6, 0.34, 0.1), Vector3(middle_x, ROOF_Y + 0.26, edge), roof)
	var x := EAST_X - 0.5
	while x > END_X:
		w.box(Vector3(0.06, 0.08, width), Vector3(x, ROOF_Y + 0.2, middle_z), under)
		x -= 1.25
	# Lit panels under the roof every other bay (they glow at night; no light of their own).
	var panel: Material = w.glow(Color("fff1d8"), 0.15, 2.6)
	x = EAST_X - 2.4 - BAY / 2.0
	var k := 0
	while x > END_X + 1.0:
		w.box(Vector3(0.9, 0.03, 0.3), Vector3(x, ROOF_Y + 0.15, middle_z), panel)
		if k % 2 == 0:
			w._omni(Vector3(x, ROOF_Y - 0.1, middle_z), Color("ffd9a6"), 0.8, 7.0)
		x -= 2.0 * BAY
		k += 1
	# End caps, so the roof does not stop in a thin edge.
	for end in [EAST_X, END_X]:
		w.box(Vector3(0.16, 0.36, width + overhang), Vector3(end, ROOF_Y + 0.26, roof_z), steel)

# --- Lampposts, signs and props ----------------------------------------------------------

## Tall grey lampposts in the strips, each with two cream banners (the university's
## season banners in the photo) and a lamp head; a downlight at night.
func _lampposts(north: bool) -> void:
	var grey := Color("8a9093")
	var banner: Material = w.material("plain", Color("f1ead6"))
	var art: Material = w.material("plain", Color("9c8b3e"))
	var trim: Material = w.material("plain", Color("6c7a3e"))
	var head: Material = w.material("plain", Color("4c5254"))
	var bulb: Material = w.glow(Color("fff1d4"), 0.2, 3.2)
	for at in lamps():
		if (at.y < MEDIAN.x) != north:
			continue
		w.box(Vector3(0.36, 0.45, 0.36), Vector3(at.x, 0.15, at.y), w.material("stucco", Color("d6d4cb")))
		w.rod(Vector3(at.x, 0.35, at.y), Vector3(at.x, 6.4, at.y), 0.08, grey)
		w.box(Vector3(0.5, 0.16, 0.5), Vector3(at.x, 6.45, at.y), head)
		w.box(Vector3(0.36, 0.04, 0.36), Vector3(at.x, 6.36, at.y), bulb)
		# Banners either side of the pole, facing up and down the strip's side of the road.
		for side in [-1.0, 1.0]:
			var bx: float = at.x + side * 0.42
			w.box(Vector3(0.62, 0.035, 0.035), Vector3(at.x + side * 0.31, 5.2, at.y), w.material("plain", grey))
			w.box(Vector3(0.6, 1.5, 0.03), Vector3(bx, 4.4, at.y), banner)
			w.box(Vector3(0.44, 0.62, 0.035), Vector3(bx, 4.55, at.y), art)
			w.box(Vector3(0.6, 0.12, 0.036), Vector3(bx, 3.75, at.y), trim)
		var light := SpotLight3D.new()
		light.light_color = Color("ffeccc")
		light.light_energy = 3.5
		light.spot_range = 10.0
		light.spot_angle = 64.0
		light.spot_angle_attenuation = 0.8
		light.shadow_enabled = false
		light.rotation_degrees.x = -90.0
		w._lamp(light, Vector3(at.x, 6.3, at.y))

## A sign facing east (towards the loop), its face a board with shaded text.
func _east_sign(lines: String, at: Vector3, size: Vector2, board: Color, ink: Color) -> void:
	w.box(Vector3(0.04, size.y, size.x), at, w.material("plain", board))
	var label: Label3D = w.panel(lines, at + Vector3(0.03, 0, 0), size.x * 0.9, size.y * 0.55, ink)
	label.rotation.y = PI / 2.0

func _signs() -> void:
	var post := Color("6d7275")
	# The round 10 KPH sign on the median's nose: a white disc with a red ring.
	var nose := Vector3(NOSE_X - 2.2, 0.1, (MEDIAN.x + MEDIAN.y) / 2.0)
	w.rod(nose, nose + Vector3(0, 2.0, 0), 0.04, post)
	var disc := CylinderMesh.new()
	disc.top_radius = 0.36
	disc.bottom_radius = 0.36
	disc.height = 0.04
	disc.radial_segments = 16
	var ring: MeshInstance3D = w._mesh(disc, nose + Vector3(0.03, 2.05, 0), w.material("plain", Color("c0392b")))
	ring.rotation.z = PI / 2.0
	var face := CylinderMesh.new()
	face.top_radius = 0.29
	face.bottom_radius = 0.29
	face.height = 0.05
	face.radial_segments = 16
	var white: MeshInstance3D = w._mesh(face, nose + Vector3(0.04, 2.05, 0), w.material("plain", Color("f5f2e8")))
	white.rotation.z = PI / 2.0
	var ten: Label3D = w.panel("10", nose + Vector3(0.075, 2.1, 0), 0.32, 0.26, Color("1d1d1d"))
	ten.rotation.y = PI / 2.0
	var kph: Label3D = w.panel("KPH", nose + Vector3(0.075, 1.93, 0), 0.26, 0.09, Color("1d1d1d"))
	kph.rotation.y = PI / 2.0
	# The yellow SLOW DOWN board at the north strip's mouth end.
	var slow := Vector3(EAST_X - 0.6, 0, STRIP_N.y - 0.4)
	for dz in [-0.28, 0.28]:
		w.box(Vector3(0.05, 1.3, 0.05), slow + Vector3(0, 0.6, dz), w.material("plain", Color("c9c4b5")))
	_east_sign("SLOW DOWN", slow + Vector3(0.05, 1.35, 0), Vector2(0.72, 0.42), Color("f1c232"), Color("1d1d1d"))
	_east_sign("10 KPH", slow + Vector3(0.05, 1.02, 0), Vector2(0.72, 0.24), Color("c0392b"), Color("fff6e4"))

## Concrete benches, the three bins and the pots on the walkways.
func _props() -> void:
	var concrete: Material = w.material("concrete", Color("e6e4dc"))
	for bench in BENCHES:
		for dx in [-0.9, 0.9]:
			w.box(Vector3(0.3, 0.4, 0.4), Vector3(bench.x + dx, 0.16, bench.y), concrete)
		w.box(Vector3(2.4, 0.1, 0.5), Vector3(bench.x, 0.41, bench.y), concrete)
	for k in 3:
		var colour: String = ["3b8a4a", "29467d", "e0b833"][k]
		var x := BINS.x - 0.75 + k * 0.75
		w.box(Vector3(0.6, 0.95, 0.6), Vector3(x, 0.44, BINS.y), w.material("plain", Color(colour)))
		w.box(Vector3(0.64, 0.06, 0.64), Vector3(x, 0.94, BINS.y), w.material("plain", Color(colour).darkened(0.2)))
	for at in POTS:
		w.pot(at.x, at.y)

## The flagpole on its island at the west end: a grass island in a white kerb, a
## stepped white base, a tall pole with a gold finial and the flag.
func _flag() -> void:
	var island := CylinderMesh.new()
	island.top_radius = ISLAND
	island.bottom_radius = ISLAND
	island.height = 0.3
	island.radial_segments = 32
	w._mesh(island, Vector3(FLAG.x, -0.05, FLAG.y), w.material("stucco", Color("e9e6dc")))
	var lawn := CylinderMesh.new()
	lawn.top_radius = ISLAND - 0.3
	lawn.bottom_radius = ISLAND - 0.3
	lawn.height = 0.32
	lawn.radial_segments = 32
	w._mesh(lawn, Vector3(FLAG.x, -0.04, FLAG.y), w.material("grass"))
	for step in [[1.3, 0.25, 0.22], [0.9, 0.25, 0.47]]:
		var base := CylinderMesh.new()
		base.top_radius = step[0]
		base.bottom_radius = step[0]
		base.height = step[1]
		base.radial_segments = 24
		w._mesh(base, Vector3(FLAG.x, step[2], FLAG.y), w.material("stucco", Color("f1efe7")))
	var top := Vector3(FLAG.x, 15.0, FLAG.y)
	w.rod(Vector3(FLAG.x, 0.55, FLAG.y), top, 0.12, Color("d9dcdc"))
	var finial := SphereMesh.new()
	finial.radius = 0.16
	finial.height = 0.32
	w._mesh(finial, top + Vector3(0, 0.12, 0), w.material("plain", Color("d4a937")))
	# The Philippine flag: blue over red, the white triangle at the hoist.
	var fly := Vector3(FLAG.x + 1.05, 14.1, FLAG.y)
	w.box(Vector3(1.8, 0.45, 0.03), fly + Vector3(0, 0.225, 0), w.material("plain", Color("1f3f99")))
	w.box(Vector3(1.8, 0.45, 0.03), fly + Vector3(0, -0.225, 0), w.material("plain", Color("c8202f")))
	w.box(Vector3(0.62, 0.9, 0.035), fly + Vector3(-0.59, 0, 0), w.material("plain", Color("f6f3ea")))
	w.box(Vector3(0.14, 0.14, 0.04), fly + Vector3(-0.68, 0, 0), w.material("plain", Color("f2c94c")))

# --- Planting -----------------------------------------------------------------------------

## Shade trees in one side's strip between the lampposts, and the palm at its mouth end.
func _planting(north: bool) -> void:
	var palms := Chapel.new()
	palms.w = w
	var x := LAMP_FIRST - LAMP_STEP / 2.0
	var i := 0
	while x > END_X + 2.0:
		if not in_crossing(x) and not in_crossing(x + 2.0) and not in_crossing(x - 2.0):
			var north_z := STRIP_N.x + 0.9
			var south_z := STRIP_S.y - 0.9
			if north:
				w._tree(Vector3(x, 0.04, north_z), 7.6 + fmod(i * 1.7, 1.8), 1600 + i)
			else:
				w._tree(Vector3(x - 3.0, 0.04, south_z), 7.0 + fmod(i * 1.3, 2.0), 1640 + i)
		x -= LAMP_STEP
		i += 1
	var spot := Vector2(EAST_X - 1.2, STRIP_N.x + 0.8) if north else Vector2(EAST_X - 1.2, STRIP_S.y - 0.8)
	palms._palm(Vector3(spot.x, 0.04, spot.y), 4.6, 1680 + roundi(spot.y))

## Round topiary on the median's nose and along it, and at the strips' crossing ends.
func _median_planting() -> void:
	# Round topiary: on the median's nose, then along the median, and at the strips' ends.
	var middle := (MEDIAN.x + MEDIAN.y) / 2.0
	w._shrub(Vector3(NOSE_X - 0.9, 0.1, middle), 1.2, 1700, w.HEDGE_COLORS)
	var m := NOSE_X - 9.0
	var k := 0
	while m > END_X + 1.0:
		if not in_crossing(m) and not in_crossing(m + 1.0) and not in_crossing(m - 1.0):
			w._shrub(Vector3(m, 0.3, middle), 1.0, 1710 + k, w.HEDGE_COLORS)
		m -= 10.0
		k += 1
	for crossing in CROSSINGS:
		for z in [(STRIP_N.x + STRIP_N.y) / 2.0, (STRIP_S.x + STRIP_S.y) / 2.0]:
			w._shrub(Vector3(crossing.x - 0.9, 0.04, z), 0.9, 1760 + roundi(crossing.x + z), w.HEDGE_COLORS)

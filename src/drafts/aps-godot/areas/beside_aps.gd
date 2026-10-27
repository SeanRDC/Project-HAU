extends RefCounted
## Beside APS, from Sean's photos (assets/Fix beside aps/) and his outline on the satellite
## picture (fix-outline.png): the ground between the canteen wing's east wall and the
## Covered Court. North of the canteen's tip a paved lane runs up to Sacred Heart; south
## of it, past the tip, a long island with a kerb, its west side on the east road: at its
## north end the pergola (cream stone-block pillars, a dark steel roof grown over with
## vines and hanging roots, red concrete tables and benches, palms in stone bowls), at the
## foot of the tip round wooden tables under big square umbrellas, and
## east of the island a parking lane down the court's west side to the gym's lane. No cars
## are parked in the game.
##
## World coordinates (metres, Y up), like the court; the wing's east wall is at x 43.45
## (world.gd's canteen frame), the court's columns start at x 53 (areas/court.gd).

const Roads := preload("res://roads.gd")

## The paved lane north of the canteen's tip, along the wing's east wall (the part
## inside Sacred Heart's plot is the plot's), and its height.
const LANE := Rect2(43.45, 0.4, 9.15, 23.1)
const LANE_Y := -0.05
## Sacred Heart's plot's south-west corner (campus_plan.gd "sh"): the lane is drawn round it.
const SH_CORNER := Vector2(51.2, 16.8)
## The parking lane down the court's west side, at the road's height, into the gym's apron.
const PARKING := Rect2(48.8, 23.5, 3.8, 33.7)
const PARKING_Y := -0.185
## The island: paved in interlocking pavers inside a kerb, a step up from the road.
const ISLAND := Rect2(44.4, 23.5, 4.4, 24.0)
const ISLAND_Y := 0.0
## The pergola's two rows of pillars (x) and the pillars along them (z), their height.
const PILLAR_X: Array[float] = [44.95, 48.25]
const PILLAR_Z: Array[float] = [24.2, 27.2, 30.2, 33.2, 36.2]
const PILLAR_TOP := 2.85
## The red concrete tables down the middle under it (z of each), with a bench either side.
const TABLE_X := 46.6
const TABLES: Array[float] = [25.7, 28.7, 31.7, 34.7]
## Palms in stone bowls on pedestals along the road side.
const BOWLS: Array[Vector2] = [Vector2(44.95, 28.7), Vector2(44.95, 34.7)]
## The paved corner at the foot of the canteen's tip, between its end wall (z 24.8), the
## island and the road's kerb round the bend (roads.gd: the bend's centre and the kerb's
## back edge from it), with the round umbrella tables and the bins by the wall.
const TIP_WALL := 24.85
const PATIO_WEST := 36.0
const BEND := Vector2(34.5, 36.5)
const KERB_BACK := 9.65
const PATIO_Y := -0.03
const UMBRELLAS: Array[Vector2] = [Vector2(39.4, 26.6), Vector2(42.2, 28.6)]
const BINS: Array[Vector2] = [Vector2(37.0, 25.3), Vector2(37.6, 25.3)]

static func in_patio(x: float, z: float) -> bool:
	return x >= PATIO_WEST and x < ISLAND.position.x and z >= TIP_WALL and z <= BEND.y \
		and Vector2(x, z).distance_to(BEND) >= KERB_BACK

static func walkable(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	return LANE.has_point(at) or PARKING.has_point(at) or ISLAND.has_point(at) or in_patio(x, z)

static func blocked(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	if in_patio(x, z):
		for table in UMBRELLAS:
			if at.distance_to(table) < 1.12:
				return true # the table and its chairs
		for bin in BINS:
			if at.distance_to(bin) < 0.3:
				return true
		return false
	if not ISLAND.grow(0.3).has_point(at):
		return false
	for px in PILLAR_X:
		for pz in PILLAR_Z:
			if at.distance_to(Vector2(px, pz)) < 0.4:
				return true
	for tz in TABLES:
		if absf(x - TABLE_X) < 0.95 and absf(z - tz) < 1.3:
			return true # the table and its benches
	for bowl in BOWLS:
		if at.distance_to(bowl) < 0.55:
			return true
	return false

## The island's, the corner's, the lane's or the parking lane's height, or NAN.
static func floor_height(x: float, z: float) -> float:
	var at := Vector2(x, z)
	if ISLAND.has_point(at):
		return ISLAND_Y
	if in_patio(x, z):
		return PATIO_Y
	if LANE.has_point(at):
		return LANE_Y
	if PARKING.has_point(at):
		return PARKING_Y
	return NAN

var w: RefCounted

func build(world: RefCounted) -> void:
	w = world
	_lanes()
	_island()
	_pergola()
	_tables()
	_plants()
	_corner()

## The concrete of the lane (round Sacred Heart's corner) and of the parking lane, with a
## low kerb where the lane steps down to it.
func _lanes() -> void:
	var slab: Material = w.material("concrete", Color("b0afa7"))
	var top := LANE_Y
	for area in [Rect2(LANE.position.x, LANE.position.y, SH_CORNER.x - LANE.position.x, LANE.size.y),
			Rect2(SH_CORNER.x, SH_CORNER.y, LANE.end.x - SH_CORNER.x, LANE.end.y - SH_CORNER.y)]:
		var r: Rect2 = area
		w.box(Vector3(r.size.x, 0.2, r.size.y), Vector3(r.get_center().x, top - 0.1, r.get_center().y), slab)
	var low: Material = w.material("concrete", Color("a6a59d"))
	var reach := 38.0 - PARKING.position.y # the gym's apron takes over from z 38
	w.box(Vector3(PARKING.size.x, 0.02, reach), Vector3(PARKING.get_center().x, PARKING_Y - 0.01, PARKING.position.y + reach / 2.0), low)
	w.box(Vector3(PARKING.size.x, 0.16, 0.2), Vector3(PARKING.get_center().x, LANE_Y - 0.06, LANE.end.y + 0.1), w.material("concrete", Color("b5b3aa")))

## The island's body, paved over with interlocking pavers, inside a pale concrete kerb.
func _island() -> void:
	var body: Material = w.material("pavers", Color("b39d8c"))
	w.box(Vector3(ISLAND.size.x, 0.22, ISLAND.size.y), Vector3(ISLAND.get_center().x, ISLAND_Y - 0.11, ISLAND.get_center().y), body)
	var kerb: Material = w.material("concrete", Color("cbc8bc"))
	var middle := ISLAND.get_center()
	for z in [ISLAND.position.y, ISLAND.end.y]:
		w.box(Vector3(ISLAND.size.x + 0.2, 0.28, 0.2), Vector3(middle.x, ISLAND_Y - 0.1, z), kerb)
	for x in [ISLAND.position.x, ISLAND.end.x]:
		w.box(Vector3(0.2, 0.28, ISLAND.size.y), Vector3(x, ISLAND_Y - 0.1, middle.y), kerb)

## The pergola: cream pillars of stacked stone blocks, the dark steel frame and the
## corrugated roof on them, the wire mesh under it, roots and vines hanging through, the
## vine roof on top and its fringe over both sides, two tube lights.
func _pergola() -> void:
	var stone: Material = w.material("concrete", Color("dccbb3"))
	var joint: Material = w.material("plain", Color("b9a891"))
	for px in PILLAR_X:
		for pz in PILLAR_Z:
			w.box(Vector3(0.45, PILLAR_TOP, 0.45), Vector3(px, ISLAND_Y + PILLAR_TOP / 2.0, pz), stone)
			var y := 0.48
			while y < PILLAR_TOP - 0.1:
				w.box(Vector3(0.47, 0.03, 0.47), Vector3(px, ISLAND_Y + y, pz), joint)
				y += 0.48
	var steel: Material = w.material("plain", Color("37332e"))
	var from: float = PILLAR_Z[0] - 0.9
	var to: float = PILLAR_Z[-1] + 0.9
	var long := to - from
	var mid := (from + to) / 2.0
	var top := ISLAND_Y + PILLAR_TOP
	for px in PILLAR_X:
		w.box(Vector3(0.2, 0.32, long), Vector3(px, top + 0.16, mid), steel)
	for pz in PILLAR_Z:
		w.box(Vector3(4.6, 0.22, 0.14), Vector3(TABLE_X, top + 0.43, pz), steel)
	var x: float = PILLAR_X[0] - 0.6
	while x <= PILLAR_X[1] + 0.61:
		w.box(Vector3(0.06, 0.08, long), Vector3(x, top + 0.58, mid), steel)
		x += 0.6
	var sheet: Material = w.material("ribbed", Color("55534d"))
	w.box(Vector3(5.6, 0.06, long + 0.4), Vector3(TABLE_X, top + 0.66, mid), sheet)
	# The wire mesh under the roof: thin rods both ways.
	var wire := Color("4a453d")
	x = PILLAR_X[0]
	while x <= PILLAR_X[1] + 0.01:
		w.rod(Vector3(x, top + 0.02, from), Vector3(x, top + 0.02, to), 0.008, wire)
		x += 0.55
	var z := from
	while z <= to + 0.01:
		w.rod(Vector3(PILLAR_X[0], top + 0.02, z), Vector3(PILLAR_X[1], top + 0.02, z), 0.008, wire)
		z += 0.55
	# Roots and dry vines hanging through the mesh, some nearly to the tables.
	var random := RandomNumberGenerator.new()
	random.seed = 2710
	var roots: Array[Color] = [Color("6b5a44"), Color("8c6f4e"), Color("a07a4a"), Color("5a4b3a")]
	for i in 90:
		var at := Vector2(random.randf_range(PILLAR_X[0] - 0.5, PILLAR_X[1] + 0.5), random.randf_range(from, to))
		var low := random.randf_range(1.1, 2.6)
		w.rod(Vector3(at.x, top + 0.02, at.y), Vector3(at.x + random.randf_range(-0.06, 0.06), ISLAND_Y + low, at.y), 0.012, roots[i % roots.size()])
	# Roots trained down the pillars.
	for px in PILLAR_X:
		for pz in PILLAR_Z:
			var side := 0.24 if px > TABLE_X else -0.24
			w.rod(Vector3(px + side, top, pz + 0.1), Vector3(px + side, ISLAND_Y + 0.2, pz - 0.05), 0.022, Color("6b5a44"))
	# The vine roof: level leaf cards over the sheet and a fringe hanging off both sides.
	var vines: Material = w._leaf_material(2711, Vector3(TABLE_X, -6.0, mid))
	var roof: ArrayMesh = w._cards(2.8, 0.8, top + 0.55, 2, true)
	var fringe: ArrayMesh = w._cards(2.4, 1.2, top - 0.6, 1)
	z = from + 0.8
	while z < to:
		for vx in [TABLE_X - 1.3, TABLE_X + 1.3]:
			w._mesh(roof, Vector3(vx, 0, z), vines, 0.3 if vx > TABLE_X else 0.0).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
		for fx in [PILLAR_X[0] - 0.75, PILLAR_X[1] + 0.75]:
			w._mesh(fringe, Vector3(fx, 0, z + (0.0 if fx < TABLE_X else 1.0)), vines, PI / 2.0).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
		z += 2.1
	for tz in [TABLES[1], TABLES[3]]:
		w.box(Vector3(0.08, 0.05, 1.2), Vector3(TABLE_X, top - 0.03, tz), w.glow(Color("eef2ee"), 0.1, 2.0))

## The red concrete tables and benches under the pergola, in a row down its middle.
func _tables() -> void:
	var red: Material = w.material("concrete", Color("b04a33"))
	for tz in TABLES:
		w.box(Vector3(0.85, 0.1, 2.5), Vector3(TABLE_X, ISLAND_Y + 0.72, tz), red)
		for dz in [-0.85, 0.85]:
			w.box(Vector3(0.6, 0.67, 0.14), Vector3(TABLE_X, ISLAND_Y + 0.335, tz + dz), red)
		for side in [-0.75, 0.75]:
			w.box(Vector3(0.32, 0.08, 2.4), Vector3(TABLE_X + side, ISLAND_Y + 0.42, tz), red)
			for dz in [-0.85, 0.85]:
				w.box(Vector3(0.26, 0.38, 0.14), Vector3(TABLE_X + side, ISLAND_Y + 0.19, tz + dz), red)

## Palms in grey stone bowls on pedestals by the road, clay pots at the pillars' feet.
func _plants() -> void:
	var bowl_stone: Material = w.material("concrete", Color("aeaca2"))
	for i in BOWLS.size():
		var at := BOWLS[i]
		w.box(Vector3(0.7, 0.08, 0.7), Vector3(at.x, ISLAND_Y + 0.04, at.y), bowl_stone)
		w.rod(Vector3(at.x, ISLAND_Y, at.y), Vector3(at.x, ISLAND_Y + 0.4, at.y), 0.13, Color("aeaca2"))
		var bowl := CylinderMesh.new()
		bowl.top_radius = 0.52
		bowl.bottom_radius = 0.26
		bowl.height = 0.38
		bowl.radial_segments = 12
		w._mesh(bowl, Vector3(at.x, ISLAND_Y + 0.58, at.y), bowl_stone)
		palm(Vector3(at.x, ISLAND_Y + 0.75, at.y), 1.5, 2720 + i)
	for spot in [Vector2(45.35, 24.65), Vector2(47.85, 33.6), Vector2(48.65, 27.2)]:
		w.pot(spot.x, spot.y)

## A small areca palm: a few thin stems fanning out, crowned with narrow-leaved fronds.
func palm(at: Vector3, height: float, seed_value: int) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var greens: Array[Color] = [Color("4f7a2c"), Color("6b9a34"), Color("8fb846"), Color("b9cf5a"), Color("3f6424")]
	var fronds: Material = w._leaf_material(seed_value, at + Vector3(0, height, 0), greens, true)
	var cluster: ArrayMesh = w._cards(height * 0.8, height * 0.6, -height * 0.3, 3, false)
	for i in 5:
		var a := TAU * i / 5.0 + random.randf() * 0.5
		var tip := at + Vector3(cos(a) * 0.25, height * random.randf_range(0.7, 1.0), sin(a) * 0.25)
		w.rod(at, tip, 0.025, Color("7d8a4a"))
		w._mesh(cluster, tip, fronds, a).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED

## The corner at the tip's foot: pavers out to the kerb's curve, two round wooden tables
## under big square brown umbrellas with slatted chairs, a yellow and a blue bin.
func _corner() -> void:
	var rim := PackedVector2Array([Vector2(PATIO_WEST, TIP_WALL), Vector2(ISLAND.position.x, TIP_WALL),
		Vector2(ISLAND.position.x, BEND.y), Vector2(BEND.x + KERB_BACK, BEND.y)])
	var west := asin((PATIO_WEST - BEND.x) / KERB_BACK) - PI / 2.0 # the curve's angle where it meets x PATIO_WEST
	for i in range(1, 13):
		var a := lerpf(0.0, west, i / 12.0)
		rim.append(BEND + Vector2(cos(a), sin(a)) * KERB_BACK)
	var triangles := PackedVector2Array()
	for k in Geometry2D.triangulate_polygon(rim):
		triangles.append(rim[k])
	w._ground(triangles, PATIO_Y, w.material("pavers", Color("a99485")))
	for table in UMBRELLAS:
		parasol(table.x, table.y, PATIO_Y)
	var colours := [Color("e8c22e"), Color("2f6fb5")]
	for i in BINS.size():
		w.box(Vector3(0.42, 0.75, 0.42), Vector3(BINS[i].x, PATIO_Y + 0.375, BINS[i].y), w.material("plain", colours[i]))
		w.box(Vector3(0.46, 0.05, 0.46), Vector3(BINS[i].x, PATIO_Y + 0.77, BINS[i].y), w.material("plain", (colours[i] as Color).darkened(0.2)))

## A big square patio umbrella of faded brown canvas over a round wooden table with four
## slatted chairs (world.gd's _chair), its flaps hanging from the edges.
func parasol(x: float, z: float, y: float) -> void:
	var canvas := (w.material("plain", Color("8e4c38")) as StandardMaterial3D).duplicate() as StandardMaterial3D
	canvas.cull_mode = BaseMaterial3D.CULL_DISABLED
	var cone := CylinderMesh.new()
	cone.bottom_radius = 1.95
	cone.top_radius = 0.06
	cone.height = 0.55
	cone.radial_segments = 4
	cone.rings = 1
	cone.cap_bottom = false
	w._mesh(cone, Vector3(x, y + 2.65, z), canvas, PI / 4.0).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	var half := 1.95 / sqrt(2.0)
	for side in [-1.0, 1.0]:
		w.box(Vector3(half * 2.0, 0.22, 0.02), Vector3(x, y + 2.28, z + side * half), canvas)
		w.box(Vector3(0.02, 0.22, half * 2.0), Vector3(x + side * half, y + 2.28, z), canvas)
	w.rod(Vector3(x, y, z), Vector3(x, y + 2.95, z), 0.03, Color("2f3133"))
	var top := CylinderMesh.new()
	top.top_radius = 0.55
	top.bottom_radius = 0.55
	top.height = 0.05
	top.radial_segments = 16
	w._mesh(top, Vector3(x, y + 0.74, z), w.material("wood", Color("b27a4c")))
	var steel := Color("2f3133")
	for i in 4:
		var a := TAU * i / 4.0 + PI / 4.0
		w.rod(Vector3(x, y + 0.7, z), Vector3(x + cos(a) * 0.4, y + 0.01, z + sin(a) * 0.4), 0.02, steel)
	for i in 4:
		var a := TAU * i / 4.0 + 0.3
		w._chair(Vector3(x + cos(a) * 0.86, y, z + sin(a) * 0.86), a + PI)

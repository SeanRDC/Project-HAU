extends RefCounted
## The Sister Josefina G. Nepomuceno Formation Center (no. 16), from Mikko's photos
## (FORMATION CENTER MIDDLE.JPG and its close-up, LEFT SIDE FORMATION CENTER.JPG): a cream
## building behind the chapel facing east onto the east road. Its middle is three storeys
## over an open colonnade, the name in steel letters over the columns, windows in white
## bands above, and on the roof terrace a white fabric canopy on steel arches. North of it
## the stair tower rises past the roof with two strips of green glass between white
## louvres, then the wing curves back; south of it a lower wing curves back. In front a
## paver drop-off loops round an island with the big double-trunked tree: in off the road
## at its north end, out round the island's south end.
##
## Set back inside the team's plot (campus_plan.gd) so there is room for the sidewalk
## along the road's bend on its north side and for the drop-off by the east road. World
## coordinates (metres, Y up), like the chapel; the front is a plane of constant x.

const Roads := preload("res://roads.gd")

## The front: the upper floors' face and the columns, the ground floor's wall behind the
## colonnade, and the back.
const FRONT_X := 25.0
const RECESS_X := 22.6
const BACK_X := 10.0
## The middle block (z span), the stair tower north of it (z span, its front, its back).
const MIDDLE := Vector2(48.5, 64.5)
const TOWER := Vector2(45.0, 48.5)
const TOWER_FRONT := 25.7
const TOWER_BACK := 19.5
## The curved wings: centre x, z and radius; the north one curves back from the tower,
## the south one, a storey lower, from the middle block's south corner.
const NORTH_WING := Vector3(18.5, 45.0, 6.2)
const SOUTH_WING := Vector3(17.5, 64.5, 7.5)
## The chapel's east wall, which the back meets (the plot edge the two share, campus_plan.gd).
const CHAPEL_EDGE := [Vector2(9.9, 44.8), Vector2(3.7, 69.0)]
## The top of the chapel's roof (chapel.gd's top layer).
const CHAPEL_TOP := 9.32
## Storeys: a tall ground floor (its top is the sign band), then two; the roof terrace;
## the stair tower above it.
const GROUND := 4.4
const STOREY := 3.5
const ROOF := GROUND + 2.0 * STOREY
const SOUTH_ROOF := GROUND + STOREY
const TOWER_TOP := 16.2
## The colonnade's raised floor and the three steps down from it to the drop-off.
const TERRACE := Rect2(RECESS_X, 48.6, 25.4 - RECESS_X, 15.8)
const TERRACE_Y := 0.45
const STEPS := Rect2(25.4, 48.6, 0.9, 15.8)
const COLUMNS: Array[float] = [48.9, 51.45, 54.0, 56.55, 59.1, 61.65, 64.2]
## The drop-off: the paver apron along the steps, the concrete way in from the road at
## its north end, the paver way out round the island's south end, and the walk on south
## past the low wing to the chapel's lawn.
const APRON := Rect2(26.3, 47.0, 4.2, 22.4)
const DRIVE_IN := Rect2(30.5, 47.0, 6.6, 9.8)
const DRIVE_OUT := Rect2(26.3, 69.4, 10.8, 3.4)
const SOUTH_WALK := Rect2(26.3, 72.8, 2.2, 3.6)
const DRIVE_Y := -0.05
const APRON_Y := -0.04
## The island in the loop (an ellipse: centre, radii) with the tree.
const ISLAND := Vector2(33.6, 63.1)
const ISLAND_RADII := Vector2(2.9, 6.1)
## The lawn between the north wing and the sidewalk, with a picnic kiosk and two trees.
const NORTH_LAWN := Rect2(25.2, 36.5, 9.2, 10.5)
const KIOSK := Vector2(30.8, 41.6)
const NORTH_TREES: Array[Vector3] = [Vector3(27.0, 39.6, 8.2), Vector3(33.8, 44.6, 7.4)]
## The sidewalk on the lawn side of the road: round the bend north of the building and
## down the east road to the way in, and from the way out on south past the kiosks.
## Across the road (see roads.gd) it runs from the kerb to SIDEWALK_FAR.
const SIDEWALK_FAR := 13.5
const SIDEWALK_Y := -0.04
## The lamp post with its bell at the island's north end, the RESERVED CMO GUEST-PRIEST
## board beside it facing the road, and a rock among the shrubs (Sean's "View on the curb
## or island behind chapel" and "Covered Court view" photos); the statue in the middle bay.
const BELL := Vector2(33.0, 58.4)
const BOARD := Vector2(34.4, 58.7)
const ROCK := Vector2(34.7, 60.3)
## The island's ground, a step up inside its kerb.
const ISLAND_Y := 0.1
const STATUE := Vector2(23.1, 55.3)
## The electric pole on the south sidewalk (LEFT SIDE FORMATION CENTER.JPG).
const POLE := Vector2(35.3, 83.0)
## Where the camera faces the front from (the drop-off, the steps, the north lawn).
const VIEW_FROM := Vector2(36.5, 77.0)
## Facing it the camera stands over the east road: everything east of this world x (the
## Covered Court's plot, the gym) is cut away, as the MGN view cuts away the chapel lawn.
const CUT_X := 44.8

## The lawn-side sidewalk's stretches, for a point on it.
static func _sidewalk_zone(at: Vector2) -> bool:
	return (at.y >= 22.0 and at.y <= DRIVE_IN.position.y and at.x >= 21.0) \
		or (at.x > 33.5 and at.y >= DRIVE_OUT.end.y and at.y <= 97.6)

static func on_sidewalk(x: float, z: float) -> bool:
	var across := Roads.across(x, z)
	return across >= 10.6 and across <= SIDEWALK_FAR and _sidewalk_zone(Vector2(x, z))

static func in_island(x: float, z: float) -> bool:
	var d := (Vector2(x, z) - ISLAND) / ISLAND_RADII
	return d.length_squared() <= 1.0

## The chapel's east wall's x at z.
static func chapel_x(z: float) -> float:
	var a: Vector2 = CHAPEL_EDGE[0]
	var b: Vector2 = CHAPEL_EDGE[1]
	return lerpf(a.x, b.x, (z - a.y) / (b.y - a.y))

## The piece joining the back to the chapel's east wall, from z to z.
static func join(from: float, to: float) -> PackedVector2Array:
	return PackedVector2Array([Vector2(chapel_x(from) - 0.1, from), Vector2(BACK_X + 0.1, from), Vector2(BACK_X + 0.1, to), Vector2(chapel_x(to) - 0.1, to)])

## The building's footprint on the ground (the colonnade is open in front of RECESS_X).
static func inside(x: float, z: float) -> bool:
	var a: Vector2 = CHAPEL_EDGE[0]
	var b: Vector2 = CHAPEL_EDGE[1]
	if z >= a.y and z <= b.y and x <= BACK_X + 0.1 and x >= chapel_x(z) - 0.1:
		return true # joined to the chapel
	if x >= BACK_X and x <= RECESS_X and z >= MIDDLE.x and z <= MIDDLE.y:
		return true
	if x >= BACK_X and x <= TOWER_FRONT and z >= TOWER.x and z <= TOWER.y:
		return true
	var at := Vector2(x, z)
	if z <= NORTH_WING.y and at.distance_to(Vector2(NORTH_WING.x, NORTH_WING.y)) <= NORTH_WING.z:
		return true
	return z >= SOUTH_WING.y and at.distance_to(Vector2(SOUTH_WING.x, SOUTH_WING.y)) <= SOUTH_WING.z

static func walkable(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	for area in [TERRACE, STEPS, APRON, DRIVE_IN, DRIVE_OUT, SOUTH_WALK, NORTH_LAWN]:
		if area.has_point(at):
			return true
	return on_sidewalk(x, z)

static func blocked(x: float, z: float) -> bool:
	if inside(x, z) or in_island(x, z):
		return true
	var at := Vector2(x, z)
	if TERRACE.has_point(at) or STEPS.has_point(at):
		for column in COLUMNS:
			if absf(x - (FRONT_X - 0.25)) < 0.45 and absf(z - column) < 0.45:
				return true
		if at.distance_to(STATUE) < 0.6:
			return true
	for post in [BELL, POLE]:
		if at.distance_to(post) < 0.3:
			return true
	for tree in NORTH_TREES:
		if at.distance_to(Vector2(tree.x, tree.y)) < 0.35:
			return true
	return absf(x - KIOSK.x) < 1.3 and absf(z - KIOSK.y) < 0.9 # the kiosk's table and benches

## The colonnade's, the steps', the drop-off's, the sidewalk's or the lawn's height, or NAN.
static func floor_height(x: float, z: float) -> float:
	var at := Vector2(x, z)
	if TERRACE.has_point(at):
		return TERRACE_Y
	if STEPS.has_point(at):
		return TERRACE_Y - 0.13 * (1 + floori((x - STEPS.position.x) / 0.3))
	if APRON.has_point(at) or SOUTH_WALK.has_point(at):
		return APRON_Y
	if DRIVE_IN.has_point(at) or DRIVE_OUT.has_point(at):
		return DRIVE_Y
	if on_sidewalk(x, z):
		return SIDEWALK_Y
	if NORTH_LAWN.has_point(at):
		return -0.18
	return NAN

## Where the lawn's grass stays off: the building, its paving, the island, the sidewalk.
static func covers(x: float, z: float) -> bool:
	return inside(x, z) or in_island(x, z) or (walkable(x, z) and not NORTH_LAWN.has_point(Vector2(x, z)))

## 1 in front of the building (the drop-off, the steps, the north lawn): the camera turns
## to face it from over the east road, west.
static func view_for(x: float, z: float) -> float:
	return smoothstep(36.5, 40.0, z) * (1.0 - smoothstep(32.5, VIEW_FROM.x, x)) * (1.0 - smoothstep(73.0, VIEW_FROM.y, z)) 		* smoothstep(18.0, 21.0, x)

var w: RefCounted
var cream: Material
var band: Material

func build(world: RefCounted) -> void:
	w = world
	cream = w.material("stucco", Color("f1e8cb"))
	band = w.material("stucco", Color("f7f1dc"))
	_ground()
	_middle()
	_tower()
	_wings()
	_canopy()
	_front()
	_island()
	_planting()

# --- Shapes ------------------------------------------------------------------------

## A half disc: centre x, z and radius, on the side of z given by `side` (-1 north, 1 south).
static func half_disc(wing: Vector3, side: float, steps := 24) -> PackedVector2Array:
	var shape := PackedVector2Array()
	for i in steps + 1:
		var a := PI * i / steps
		shape.append(Vector2(wing.x + cos(a) * wing.z, wing.y + side * sin(a) * wing.z))
	return shape

## A flat-topped solid from an outline (as the chapel's): caps and side walls.
func _prism(shape: PackedVector2Array, y0: float, y1: float, made: Material) -> void:
	var centre := Vector2.ZERO
	for p in shape:
		centre += p
	centre /= shape.size()
	var tool := SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	var caps := Geometry2D.triangulate_polygon(shape)
	for y in [y0, y1]:
		tool.set_normal(Vector3.UP if y == y1 else Vector3.DOWN)
		for i in range(0, caps.size(), 3):
			for k in [[0, 1, 2], [0, 2, 1]]:
				for j in k:
					var p := shape[caps[i + j]]
					tool.add_vertex(Vector3(p.x, y, p.y))
	for i in shape.size():
		var a := shape[i]
		var b := shape[(i + 1) % shape.size()]
		var out := Vector2(b.y - a.y, a.x - b.x).normalized()
		if out.dot((a + b) / 2.0 - centre) < 0.0:
			out = -out
		tool.set_normal(Vector3(out.x, 0, out.y))
		var quad := [Vector3(a.x, y0, a.y), Vector3(b.x, y0, b.y), Vector3(b.x, y1, b.y), Vector3(a.x, y1, a.y)]
		for k in [[0, 1, 2], [0, 2, 3], [0, 2, 1], [0, 3, 2]]:
			for j in k:
				tool.add_vertex(quad[j])
	w._mesh(tool.commit(), Vector3.ZERO, made)

## The outline grown by `by` metres (for bands and copings round a wing).
static func grown(shape: PackedVector2Array, by: float) -> PackedVector2Array:
	var bigger := Geometry2D.offset_polygon(shape, by)
	return bigger[0] if not bigger.is_empty() else shape

## A box standing on a wing's curve at angle `a` (0 = east, positive towards +z), its
## front `out` metres out from the wall, its width along the curve.
func _on_curve(wing: Vector3, a: float, size: Vector3, y: float, out: float, made: Material) -> void:
	var at := Vector2(wing.x, wing.y) + Vector2(cos(a), sin(a)) * (wing.z + out)
	w.box(size, Vector3(at.x, y, at.y), made, atan2(-cos(a), -sin(a)))

## A window on a wing's curve: dark glass in a white frame with a sill.
func _curved_window(wing: Vector3, a: float, width: float, height: float, y: float, glass: Material) -> void:
	_on_curve(wing, a, Vector3(width + 0.14, height + 0.14, 0.06), y, 0.02, w.material("plain", Color("e9e7df")))
	_on_curve(wing, a, Vector3(width, height, 0.06), y, 0.05, glass)
	_on_curve(wing, a, Vector3(0.05, height, 0.08), y, 0.07, w.material("plain", Color("e9e7df")))
	_on_curve(wing, a, Vector3(width + 0.3, 0.08, 0.22), y - height / 2.0 - 0.06, 0.1, band)

# --- Ground ------------------------------------------------------------------------

func _rect_ground(area: Rect2, y: float, made: Material) -> void:
	var a := area.position
	var b := Vector2(area.end.x, area.position.y)
	var c := area.end
	var d := Vector2(area.position.x, area.end.y)
	w._ground(PackedVector2Array([a, b, c, a, c, d]), y, made)

## The drop-off's paving, the sidewalk along the road's lawn side, and the walks.
func _ground() -> void:
	var pavers: Material = w.material("slab", Color("cdc9c4")) # grey stamped pavers
	var concrete: Material = w.material("concrete", Color("c2c1b9"))
	var edge: Material = w.material("stucco", Color("cfcdc3"))
	_rect_ground(APRON, APRON_Y, pavers)
	_rect_ground(SOUTH_WALK, APRON_Y, pavers)
	_rect_ground(DRIVE_IN, DRIVE_Y, concrete)
	_rect_ground(DRIVE_OUT, DRIVE_Y, pavers)
	# Low grey kerbs where the paving meets the lawn.
	w.box(Vector3(DRIVE_IN.size.x + APRON.size.x - 0.6, 0.14, 0.16), Vector3((APRON.position.x + DRIVE_IN.end.x) / 2.0 + 0.3, -0.06, APRON.position.y), edge)
	w.box(Vector3(0.16, 0.14, TERRACE.position.y - APRON.position.y), Vector3(APRON.position.x, -0.06, (APRON.position.y + TERRACE.position.y) / 2.0), edge)
	w.box(Vector3(0.16, 0.14, SOUTH_WALK.end.y - MIDDLE.y), Vector3(APRON.position.x, -0.06, (MIDDLE.y + SOUTH_WALK.end.y) / 2.0), edge)
	w.box(Vector3(0.16, 0.14, SOUTH_WALK.size.y), Vector3(SOUTH_WALK.end.x, -0.06, SOUTH_WALK.get_center().y), edge)
	w.box(Vector3(34.3 - SOUTH_WALK.end.x, 0.14, 0.16), Vector3((SOUTH_WALK.end.x + 34.3) / 2.0, -0.06, DRIVE_OUT.end.y), edge) # to the sidewalk
	# The sidewalk: grey pavers from the lawn-side kerb out, along the stretches it runs.
	var road := Roads.points()
	var lefts := Roads.lefts()
	var triangles := PackedVector2Array()
	for i in road.size() - 1:
		var middle := (road[i] + road[i + 1]) / 2.0 - lefts[i] * 4.8
		if not _sidewalk_zone(middle):
			continue
		var a0 := road[i] - lefts[i] * 3.635
		var a1 := road[i] - lefts[i] * (SIDEWALK_FAR - 7.5)
		var b0 := road[i + 1] - lefts[i + 1] * 3.635
		var b1 := road[i + 1] - lefts[i + 1] * (SIDEWALK_FAR - 7.5)
		triangles.append_array([a0, a1, b1, a0, b1, b0])
	w._ground(triangles, SIDEWALK_Y, w.material("slab", Color("c6c3bc")))

# --- The building --------------------------------------------------------------------

## The middle block: the colonnade under the sign band, two floors of windows between white
## bands and slim fins, the roof terrace's parapet; the plain back.
func _middle() -> void:
	var length := MIDDLE.y - MIDDLE.x
	var centre := (MIDDLE.x + MIDDLE.y) / 2.0
	var depth := FRONT_X - BACK_X
	var glass: Material = w.material("glass", Color("7f97a4"))
	# The ground floor behind the colonnade, and everything above it out to the front.
	w.box(Vector3(RECESS_X - BACK_X, GROUND, length), Vector3((BACK_X + RECESS_X) / 2.0, GROUND / 2.0, centre), cream)
	w.box(Vector3(depth, ROOF - GROUND + 0.4, length), Vector3((BACK_X + FRONT_X) / 2.0, (GROUND - 0.4 + ROOF) / 2.0, centre), cream)
	w.box(Vector3(depth - 0.1, 0.1, length - 0.1), Vector3((BACK_X + FRONT_X) / 2.0, GROUND - 0.42, centre), band) # the colonnade's soffit
	# The back piece behind the tower, up to the north wing.
	w.box(Vector3(TOWER_BACK - BACK_X, ROOF, TOWER.y - TOWER.x), Vector3((BACK_X + TOWER_BACK) / 2.0, ROOF / 2.0, (TOWER.x + TOWER.y) / 2.0), cream)
	# White bands at the floor lines, standing well out, and the roof's coping.
	for y in [GROUND, GROUND + STOREY]:
		w.box(Vector3(0.55, 0.16, length + 0.3), Vector3(FRONT_X + 0.27, y - 0.08, centre), band)
	w.box(Vector3(0.6, 0.9, length + 0.3), Vector3(FRONT_X + 0.2, ROOF + 0.35, centre), band)
	w.box(Vector3(depth, 0.9, 0.2), Vector3((BACK_X + FRONT_X) / 2.0, ROOF + 0.35, MIDDLE.y - 0.1), band)
	w.box(Vector3(0.2, 0.9, length), Vector3(BACK_X + 0.1, ROOF + 0.35, centre), band)
	w.box(Vector3(depth, 0.06, length), Vector3((BACK_X + FRONT_X) / 2.0, ROOF + 0.03, centre), w.material("concrete", Color("b9b6aa")))
	# Upper floors: four windows a floor (a narrow one, a wide one, two middling), slim
	# fins between them.
	var windows := [[50.7, 2.2], [54.7, 4.0], [58.9, 2.4], [62.4, 2.4]]
	for k in 2:
		var y := GROUND + k * STOREY + 1.75
		for window in windows:
			w.framed_window(Vector3(FRONT_X, y, window[0]), window[1], 1.25, Vector3.RIGHT, posmod(k + roundi(window[0]), 3) == 0, roundi(window[1] / 1.0) - 1)
	for z in [49.1, 52.4, 57.0, 60.75, 64.1]:
		w.box(Vector3(0.3, 2.0 * STOREY, 0.22), Vector3(FRONT_X + 0.15, GROUND + STOREY, z), band)
	# The chapel runs on east to the back, at its own height and under its own roof (its
	# top layer, chapel.gd), so the two stand as one and the back wall rises out of it.
	var edge: Vector2 = CHAPEL_EDGE[0]
	var end: Vector2 = CHAPEL_EDGE[1]
	_prism(join(edge.y, end.y), -0.2, CHAPEL_TOP - 0.2, cream)
	_prism(join(edge.y, end.y), CHAPEL_TOP - 0.2, CHAPEL_TOP, w.material("stucco", Color("e9ebe7")))
	# The colonnade: the recessed wall with white steel grilles over dark glass doors,
	# square columns, the steel name over them on the sign band.
	var grille: Material = w.material("plain", Color("f2f0e8"))
	var dark: Material = w.material("glass", Color("2f3538"))
	for i in COLUMNS.size() - 1:
		var mid := (COLUMNS[i] + COLUMNS[i + 1]) / 2.0
		if absf(mid - STATUE.y) < 0.5:
			w.box(Vector3(0.05, 1.3, 0.9), Vector3(RECESS_X + 0.03, TERRACE_Y + 1.6, mid + 0.9), w.material("plain", Color("f4f2ea"))) # the notice board
			continue
		var wide := 1.9
		w.box(Vector3(0.05, 2.6, wide), Vector3(RECESS_X + 0.03, TERRACE_Y + 1.3, mid), dark)
		var bars := 9
		for b in bars + 1:
			w.box(Vector3(0.05, 2.6, 0.04), Vector3(RECESS_X + 0.07, TERRACE_Y + 1.3, mid - wide / 2.0 + wide * b / bars), grille)
		for y in [TERRACE_Y + 0.05, TERRACE_Y + 1.3, TERRACE_Y + 2.58]:
			w.box(Vector3(0.05, 0.06, wide), Vector3(RECESS_X + 0.07, y, mid), grille)
		w.box(Vector3(0.05, 0.7, wide + 0.3), Vector3(RECESS_X + 0.03, TERRACE_Y + 3.0, mid), glass) # the transom
	var white: Material = w.material("stucco", Color("f6f0dc"))
	for z in COLUMNS:
		w.box(Vector3(0.45, GROUND - 0.4 - TERRACE_Y, 0.45), Vector3(FRONT_X - 0.25, (GROUND - 0.4 + TERRACE_Y) / 2.0, z), white)
	w.box(Vector3(0.3, 0.8, length), Vector3(FRONT_X - 0.05, GROUND - 0.4, centre), band) # the sign band
	var sign: Label3D = w.panel("SISTER JOSEFINA G. NEPOMUCENO FORMATION CENTER", Vector3(FRONT_X + 0.12, GROUND - 0.38, centre), length - 0.8, 0.62, Color("4a4b48"))
	sign.rotation.y = PI / 2.0
	# Small speakers and lamps under the band.
	for z in [50.2, 55.3, 60.4]:
		w.box(Vector3(0.18, 0.14, 0.26), Vector3(FRONT_X - 0.25, GROUND - 0.92, z), w.material("plain", Color("6b6c68")))
		w.box(Vector3(0.3, 0.05, 0.3), Vector3(FRONT_X - 1.2, GROUND - 0.48, z), w.glow(Color("f4ecd6"), 0.4, 2.0))
	# The raised floor, its steps down to the apron and the steel handrails at either end.
	w.box(Vector3(TERRACE.size.x, TERRACE_Y + 0.2, TERRACE.size.y), Vector3(TERRACE.get_center().x, (TERRACE_Y - 0.2) / 2.0, TERRACE.get_center().y), w.material("tile", Color("d9cfbf")))
	for k in 3:
		var top := TERRACE_Y - 0.13 * (k + 1)
		w.box(Vector3(0.3, top + 0.2, STEPS.size.y), Vector3(STEPS.position.x + 0.15 + 0.3 * k, (top - 0.2) / 2.0, STEPS.get_center().y), w.material("stone", Color("cdc7ba")))
	var rail := Color("c8ccca")
	for z in [STEPS.position.y + 0.1, STEPS.end.y - 0.1]:
		var top := Vector3(STEPS.position.x, TERRACE_Y + 0.95, z)
		var foot := Vector3(STEPS.end.x, APRON_Y + 0.9, z)
		w.rod(Vector3(RECESS_X + 0.6, top.y, z), top, 0.03, rail)
		w.rod(top, foot, 0.03, rail)
		for post in [Vector3(RECESS_X + 0.6, TERRACE_Y, z), Vector3(STEPS.position.x, TERRACE_Y, z), Vector3(STEPS.end.x - 0.05, APRON_Y, z)]:
			w.rod(post, Vector3(post.x, post.y + 0.95, z), 0.025, rail)

## The stair tower: taller than the roof, two strips of green glass up its front behind
## white louvres, a flat cap standing out over it.
func _tower() -> void:
	var wide := TOWER.y - TOWER.x
	var centre := (TOWER.x + TOWER.y) / 2.0
	w.box(Vector3(TOWER_FRONT - TOWER_BACK, TOWER_TOP, wide), Vector3((TOWER_BACK + TOWER_FRONT) / 2.0, TOWER_TOP / 2.0, centre), cream)
	w.box(Vector3(TOWER_FRONT - TOWER_BACK + 1.2, 0.3, wide + 0.8), Vector3((TOWER_BACK + TOWER_FRONT) / 2.0 + 0.4, TOWER_TOP + 0.15, centre), band)
	var green: Material = w.material("glass", Color("5f8f7c"))
	var louvre: Material = w.material("plain", Color("f4f3ec"))
	for z in [TOWER.x + 0.95, TOWER.y - 0.95]:
		w.box(Vector3(0.06, TOWER_TOP - 1.6, 0.62), Vector3(TOWER_FRONT + 0.02, (TOWER_TOP - 1.6) / 2.0 + 0.6, z), green)
		var y := 0.9
		while y < TOWER_TOP - 1.0:
			w.box(Vector3(0.22, 0.05, 0.7), Vector3(TOWER_FRONT + 0.11, y, z), louvre)
			y += 0.42
		for side in [-0.36, 0.36]:
			w.box(Vector3(0.24, TOWER_TOP - 1.6, 0.06), Vector3(TOWER_FRONT + 0.12, (TOWER_TOP - 1.6) / 2.0 + 0.6, z + side), louvre)

## The curved wings, with white bands round them at the floor lines, a coping, windows
## round the curve and, on the north one, a strip of green glass and louvres like the tower's.
func _wings() -> void:
	var glass: Material = w.material("glass", Color("6f8a96"))
	var green: Material = w.material("glass", Color("5f8f7c"))
	var north := half_disc(NORTH_WING, -1.0)
	var south := half_disc(SOUTH_WING, 1.0)
	_prism(north, -0.2, ROOF, cream)
	_prism(south, -0.2, SOUTH_ROOF, cream)
	for y in [GROUND, GROUND + STOREY]:
		_prism(grown(north, 0.14), y - 0.16, y, band)
	_prism(grown(north, 0.1), ROOF, ROOF + 0.8, band)
	_prism(grown(south, 0.14), GROUND - 0.16, GROUND, band)
	_prism(grown(south, 0.1), SOUTH_ROOF, SOUTH_ROOF + 0.8, band)
	# North wing: a window a floor every so often round the curve, and the green strip
	# nearest the tower.
	for a in [-1.55, -1.95, -2.35, -2.75]:
		_curved_window(NORTH_WING, a, 1.7, 0.9, 2.3, glass)
		for k in 2:
			_curved_window(NORTH_WING, a, 1.7, 1.2, GROUND + k * STOREY + 1.75, glass)
	var strip := -0.75
	_on_curve(NORTH_WING, strip, Vector3(0.7, ROOF - 1.4, 0.06), (ROOF - 1.4) / 2.0 + 0.8, 0.02, green)
	var y := 0.9
	while y < ROOF - 0.7:
		_on_curve(NORTH_WING, strip, Vector3(0.8, 0.05, 0.22), y, 0.1, w.material("plain", Color("f4f3ec")))
		y += 0.42
	# South wing: a strip of small square panes high on the ground floor, larger windows
	# on the floor above.
	for a in [0.35, 0.8, 1.25, 1.7, 2.15, 2.6]:
		for p in 4:
			_curved_window(SOUTH_WING, a + (p - 1.5) * 0.075, 0.42, 0.42, 2.75, glass)
		_curved_window(SOUTH_WING, a, 1.8, 1.15, GROUND + 1.75, glass)

## The roof terrace's canopy: white fabric over steel arches, a barrel vault running front
## to back over the middle block, on steel posts; a smaller steel arch under its front edge.
func _canopy() -> void:
	var fabric: Material = w.material("plain", Color("eceeea"))
	var steel: Material = w.material("plain", Color("dfe1de"))
	var from := BACK_X + 2.5
	var to := FRONT_X - 0.6
	var centre := Vector2((MIDDLE.x + MIDDLE.y) / 2.0 - 1.0, 9.0) # z and y of the arc's centre
	var radius := 7.6
	var spread := asin(6.0 / radius)
	var strips := 14
	for i in strips:
		var a0 := -spread + 2.0 * spread * i / strips
		var a1 := -spread + 2.0 * spread * (i + 1) / strips
		var p0 := centre + Vector2(sin(a0), cos(a0)) * radius
		var p1 := centre + Vector2(sin(a1), cos(a1)) * radius
		var mid := (p0 + p1) / 2.0
		w.box(Vector3(to - from, 0.05, p0.distance_to(p1) + 0.02), Vector3((from + to) / 2.0, mid.y, mid.x), fabric, 0.0, (a0 + a1) / 2.0)
		for x in [from, (from + to) / 2.0, to]:
			w.box(Vector3(0.12, 0.12, p0.distance_to(p1) + 0.02), Vector3(x, mid.y - 0.08, mid.x), steel, 0.0, (a0 + a1) / 2.0)
	# Its posts down to the roof at each edge.
	for side in [-1.0, 1.0]:
		var edge := centre + Vector2(side * sin(spread), cos(spread)) * radius
		for x in [from, (from + to) / 2.0, to]:
			w.box(Vector3(0.14, edge.y - ROOF, 0.14), Vector3(x, (edge.y + ROOF) / 2.0, edge.x), steel)
	# The low steel arch under the front edge.
	var low := Vector2(centre.x, ROOF - 4.0)
	var low_radius := 6.6
	var low_spread := asin(5.4 / low_radius)
	for i in 10:
		var a0 := -low_spread + 2.0 * low_spread * i / 10.0
		var a1 := -low_spread + 2.0 * low_spread * (i + 1) / 10.0
		var p0 := low + Vector2(sin(a0), cos(a0)) * low_radius
		var p1 := low + Vector2(sin(a1), cos(a1)) * low_radius
		var mid := (p0 + p1) / 2.0
		w.box(Vector3(0.1, 0.1, p0.distance_to(p1) + 0.02), Vector3(to - 0.3, mid.y, mid.x), steel, 0.0, (a0 + a1) / 2.0)

# --- In front ----------------------------------------------------------------------

## The statue in the middle bay, the lamp post with its bell, the A-frame board.
func _front() -> void:
	var white: Material = w.material("stucco", Color("f4f2ea"))
	w.box(Vector3(0.7, 1.0, 0.7), Vector3(STATUE.x, TERRACE_Y + 0.5, STATUE.y), w.material("wood", Color("5a4030")))
	var robe := CylinderMesh.new()
	robe.top_radius = 0.17
	robe.bottom_radius = 0.3
	robe.height = 1.45
	robe.radial_segments = 10
	w._mesh(robe, Vector3(STATUE.x, TERRACE_Y + 1.0 + 0.72, STATUE.y), white)
	var head := SphereMesh.new()
	head.radius = 0.13
	head.height = 0.28
	w._mesh(head, Vector3(STATUE.x, TERRACE_Y + 2.58, STATUE.y), white)
	w.box(Vector3(0.18, 0.12, 0.5), Vector3(STATUE.x + 0.12, TERRACE_Y + 2.0, STATUE.y), white) # the arms, held out

## The island: dry dirt and sparse grass inside a grey kerb, the big tree's two trunks
## and crowns, a yellow-green hedge and dark shrubs, grey bollard lamps round it.
func _island() -> void:
	var rim := PackedVector2Array()
	for i in 40:
		var a := TAU * i / 40.0
		rim.append(ISLAND + Vector2(cos(a), sin(a)) * ISLAND_RADII)
	var fan := PackedVector2Array()
	for i in rim.size():
		fan.append_array([ISLAND, rim[i], rim[(i + 1) % rim.size()]])
	w._ground(fan, 0.1, w.material("dirt", Color("bba889")))
	var kerb: Material = w.material("concrete", Color("b5b3aa"))
	for i in rim.size():
		var a := rim[i]
		var b := rim[(i + 1) % rim.size()]
		var mid := (a + b) / 2.0
		w.box(Vector3(a.distance_to(b) + 0.05, 0.3, 0.22), Vector3(mid.x, -0.03, mid.y), kerb, atan2(-(b - a).y, (b - a).x))
	# The tree: two great trunks side by side, each under its own wide crown over the
	# drop-off (the thin trunks the tree helper draws stand inside them).
	var bark := Color("5b5246")
	for trunk in [Vector3(32.9, 62.3, 18.0), Vector3(34.0, 63.7, 16.5)]:
		w.rod(Vector3(trunk.x, 0.1, trunk.y), Vector3(trunk.x + 0.05, 0.1 + trunk.z * 0.4, trunk.y), 0.4, bark)
		w._tree(Vector3(trunk.x, 0.1, trunk.y), trunk.z, 1601 + roundi(trunk.z))
	var lime: Array[Color] = [Color("7d9a33"), Color("9bb23d"), Color("b9c84c"), Color("d2d667"), Color("6f8a30")]
	for spot in [Vector2(31.7, 58.6), Vector2(32.6, 67.4), Vector2(35.2, 66.2)]:
		w._shrub(Vector3(spot.x, 0.1, spot.y), 1.4, 1610 + roundi(spot.y), lime)
	for spot in [Vector2(31.4, 65.0), Vector2(35.6, 59.4), Vector2(34.4, 68.0)]:
		w._shrub(Vector3(spot.x, 0.1, spot.y), 1.0, 1620 + roundi(spot.y), w.HEDGE_COLORS)
	_bell()
	var body: Material = w.material("plain", Color("8d918f"))
	var lamp: Material = w.glow(Color("f2d38c"), 0.15, 1.8)
	for a in [2.5, 3.2, 3.9, 0.3, 5.9]:
		var post := ISLAND + Vector2(cos(a), sin(a)) * (ISLAND_RADII - Vector2(0.45, 0.45))
		w.box(Vector3(0.18, 0.75, 0.18), Vector3(post.x, 0.45, post.y), body)
		w.box(Vector3(0.15, 0.16, 0.15), Vector3(post.x, 0.9, post.y), lamp)
		w.box(Vector3(0.2, 0.05, 0.2), Vector3(post.x, 1.0, post.y), body)

## On the island's north end: the lamp post with the bell (a dark iron post, a crossarm,
## the bell hanging under it, the lantern on top), the yellow RESERVED CMO GUEST-PRIEST
## folding board facing the road, and a grey rock.
func _bell() -> void:
	var iron := Color("3e3833")
	w.rod(Vector3(BELL.x, ISLAND_Y, BELL.y), Vector3(BELL.x, 4.2, BELL.y), 0.06, iron)
	w.rod(Vector3(BELL.x, 3.9, BELL.y - 0.4), Vector3(BELL.x, 3.9, BELL.y + 0.4), 0.025, iron)
	w.box(Vector3(0.22, 0.3, 0.22), Vector3(BELL.x, 4.35, BELL.y), w.glow(Color("f6e3b0"), 0.2, 2.2))
	var bell := CylinderMesh.new()
	bell.top_radius = 0.08
	bell.bottom_radius = 0.17
	bell.height = 0.28
	bell.radial_segments = 10
	w._mesh(bell, Vector3(BELL.x, 3.7, BELL.y + 0.34), w.material("metal", Color("8a6a3c")))
	var board: Material = w.material("plain", Color("e9dfb8"))
	var frame: Material = w.material("plain", Color("c9a640"))
	for side in [-0.2, 0.2]:
		w.box(Vector3(0.06, 0.8, 1.0), Vector3(BOARD.x + side, ISLAND_Y + 0.55, BOARD.y), board)
		for dz in [-0.5, 0.5]:
			w.box(Vector3(0.05, 1.0, 0.05), Vector3(BOARD.x + side * 1.3, ISLAND_Y + 0.5, BOARD.y + dz), frame)
	var ink := Color("6b4a2c")
	var lines := [["RESERVED", 0.8, 0.16], ["CMO", 0.59, 0.22], ["GUEST-PRIEST", 0.39, 0.14]]
	for line in lines:
		# Lettered on both faces: one to the road, one to the drop-off.
		for side in [1.0, -1.0]:
			var text: Label3D = w.panel(line[0], Vector3(BOARD.x + side * 0.24, ISLAND_Y + line[1], BOARD.y), 0.9, line[2], ink)
			text.rotation.y = side * PI / 2.0
			if line[0] == "RESERVED" and side > 0.0:
				text.name = "CMO RESERVED"
	w.box(Vector3(0.8, 0.55, 0.6), Vector3(ROCK.x, ISLAND_Y + 0.2, ROCK.y), w.material("stone", Color("7a756b")), 0.5, 0.25)

## The north lawn's kiosk and trees, shrubs along the wings' feet, the electric pole on the
## south sidewalk.
func _planting() -> void:
	w._kiosk(KIOSK.x, KIOSK.y)
	for i in NORTH_TREES.size():
		var tree := NORTH_TREES[i]
		w._tree(Vector3(tree.x, -0.18, tree.y), tree.z, 1630 + i)
	for spot in [Vector2(25.0, 41.0), Vector2(22.6, 38.9), Vector2(25.8, 67.2), Vector2(24.2, 70.0), Vector2(22.0, 71.6)]:
		w._shrub(Vector3(spot.x, -0.18, spot.y), 1.2, 1640 + roundi(spot.y), w.HEDGE_COLORS)
	w.rod(Vector3(POLE.x, SIDEWALK_Y, POLE.y), Vector3(POLE.x, 9.0, POLE.y), 0.13, Color("3b332c"))
	w.rod(Vector3(POLE.x, 8.4, POLE.y - 0.9), Vector3(POLE.x, 8.4, POLE.y + 0.9), 0.05, Color("3b332c"))
	w.rod(Vector3(POLE.x, 6.2, POLE.y), Vector3(POLE.x - 1.4, 6.6, POLE.y), 0.04, Color("4a4f52"))
	w.box(Vector3(0.5, 0.1, 0.22), Vector3(POLE.x - 1.5, 6.55, POLE.y), w.glow(Color("f4f0e0"), 0.2, 2.4))

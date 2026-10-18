extends RefCounted
## The Student Center, on its plan plot: the long open arcade along the Main Building's
## (DJDN's) north face, between the boulevard's south covered walkway and the building,
## from the photos in assets/images/buildings/student center/.
##
## Across it, from the boulevard to the Main Building: a red tiled planter of lady palms
## with a steel rail on its inner edge, open where the boulevard's crossings come in; slim
## cream double posts (orange downpipes on some) holding a flat roof whose ceiling is
## white 60 cm tiles with fans and light panels; the floor of small terracotta tiles in
## rows of circles; a row of white study tables with dividers and monobloc chairs; and the
## back wall, the Main Building's ground floor: cream over a maroon dado, Cafe Juan's tall
## glass under its dark corrugated fascia and its doorway under the carved sign, the
## courtyard gate (where the boulevard's courtyard crossing comes in), and further east
## grilled office windows, lockers and stacked chairs.
##
## The west end opens onto a herringbone-brick apron (the BDO ATM, iron cafe tables and
## red benches at the arcade's end) that joins the angel fountain's round apron. The east
## end stops with the Main Building, where a small lawn fills the gap to MGN.
##
## Built straight in world coordinates, as the boulevard is (the plot is square to x).
## Sizes are approximate, from the photos (60 cm ceiling tiles, monobloc chairs, a 3.2 m
## boulevard bay), not surveyed. Cafe Juan is a facade only: no interiors yet.

## The arcade's ends: its west end on the plot's edge, its east end with the Main
## Building's (the plot runs on to MGN; the last 5 m are lawn).
const WEST := -156.2
const EAST := -89.6
## Across (world z): the plot's boulevard edge (the boulevard's FACE_S), the planter, the
## posts' line, the walkable floor's inner edge, the back wall's face and the plot's back.
const FACE := 79.9
const PLANTER := Vector2(79.9, 80.6)
const POST_Z := 80.75
const INNER := 81.45
const WALL := 88.0
const BACK := 88.4
## The floor (one low step up from the boulevard's tiles) and the ceiling: the cutaway's.
const FLOOR_Y := 0.12
const CEILING := 3.3
## The arcade's middle line, and how far in front of it the camera's near plane cuts when
## inside: at 81.3 at the student's chest, so the posts, rail and planter all fall away
## (at the floor the leaning plane is still past the posts) and the walk behind them stays.
const MIDDLE := (INNER + WALL) / 2.0
const CUT_OFFSET := MIDDLE - 81.3
## Openings in the planter, lined up with the boulevard's crossings (MiddleRoad.CROSSINGS):
## the courtyard gate's, and the two further west.
const OPENINGS: Array[Vector2] = [Vector2(-107.5, -104.5), Vector2(-131.5, -128.5), Vector2(-146.5, -143.5)]
## Under the roof the camera's dark band closes this far behind the middle line: at the
## back wall, so the whole wall shows up to the ceiling (the roof fades out, so nothing
## stands over the floor in front of it).
const BAND_BACK := WALL - MIDDLE
## The roof's node (aps.gd fades it while the student is inside) and the inside lights'.
const ROOF_GROUP := "StudentCenterRoof"
const LIGHTS_GROUP := "StudentCenterLights"
## The posts: a pair every two boulevard bays, from the east end.
const POST_STEP := 6.4
## Along the back wall: Cafe Juan's glass and doorway, the courtyard gate.
const CAFE := Vector2(-149.6, -119.9)
const CAFE_DOOR := Vector2(-119.5, -115.1)
const COURTYARD := Vector2(-107.1, -104.1)
## The study tables: runs along the back wall (x east..west), their middle line, the chairs'.
const TABLE_RUNS: Array[Vector2] = [Vector2(-93.0, -102.6), Vector2(-108.4, -112.0), Vector2(-121.0, -148.6)]
const TABLE_Z := 86.6
const CHAIR_Z := 85.82
const TABLE := 1.2
## Props on the floor (rects, x0, z0, size): the ATM, the iron cafe tables, the red benches,
## the drinking fountain, the sink, the lockers, the stacked chairs, the potted palms.
const PROPS: Array[Rect2] = [Rect2(-154.05, 87.0, 0.95, 1.0), Rect2(-155.85, 87.37, 0.5, 0.45),
	Rect2(-154.9, 83.5, 1.5, 0.8), Rect2(-152.6, 84.85, 1.5, 0.8), Rect2(-150.3, 83.25, 1.5, 0.8),
	Rect2(-155.25, 81.5, 1.8, 0.5), Rect2(-152.55, 81.5, 1.8, 0.5),
	Rect2(-125.225, 81.5, 0.45, 0.45), Rect2(-96.2, 81.52, 1.3, 0.56),
	Rect2(-100.25, 87.45, 1.4, 0.5), Rect2(-95.25, 87.35, 1.0, 0.55), Rect2(-114.75, 87.35, 2.2, 0.5),
	Rect2(-120.25, 87.3, 0.5, 0.5)]
## Cafe Juan's potted arecas: three east of its door, one west of it.
const PALM_POTS: Array[Vector2] = [Vector2(-114.5, 87.6), Vector2(-113.65, 87.6), Vector2(-112.8, 87.6), Vector2(-120.0, 87.55)]
## The brick apron past the west end: its outer edge, and where it meets the fountain's apron.
const BRICK_WEST := -166.0
const BRICK_SOUTH := 74.5
const BRICK_BACK := 88.2
const FOUNTAIN := Vector2(-165.6, 64.6)
const APRON := 11.5
const WALKS_END := -157.5
## The lady palms' dark greens.
const PALM_GREENS: Array[Color] = [Color("26442b"), Color("2f5432"), Color("3d6a3a"), Color("4f7d43"), Color("6c9150")]
## A shade tree on the brick apron, and one on the lawn at the east end.
const TREE_WEST := Vector2(-162.4, 84.6)
const TREE_EAST := Vector2(-87.0, 84.4)

static func in_opening(x: float) -> bool:
	for opening in OPENINGS:
		if x >= opening.x and x <= opening.y:
			return true
	return false

## Under the arcade's roof (x along it, z from the planter to the back wall).
static func in_arcade(x: float, z: float) -> bool:
	return x >= WEST and x <= EAST - 0.25 and z >= FACE and z <= WALL - 0.2

## The brick apron: west of the arcade, and down beside the walks' west end to the fountain's
## round apron (that part of it is the boulevard's).
static func on_brick(x: float, z: float) -> bool:
	if x < BRICK_WEST or x >= WEST or z > BRICK_BACK:
		return false
	if z >= FACE:
		return true
	return x < WALKS_END and z >= BRICK_SOUTH and Vector2(x, z).distance_to(FOUNTAIN) > APRON

static func walkable(x: float, z: float) -> bool:
	return in_arcade(x, z) or on_brick(x, z)

static func blocked(x: float, z: float) -> bool:
	if not walkable(x, z):
		return false
	if in_arcade(x, z) and z < INNER and not in_opening(x):
		return true # the planter and its rail
	if absf(x - TREE_WEST.x) < 0.7 and absf(z - TREE_WEST.y) < 0.7:
		return true
	for run in TABLE_RUNS:
		if x <= run.x + 0.1 and x >= run.y - 0.1 and z > CHAIR_Z - 0.32 and z < TABLE_Z + 0.4:
			return true
	for prop in PROPS:
		if prop.grow(0.2).has_point(Vector2(x, z)):
			return true
	return false

static func floor_height(x: float, z: float) -> float:
	if in_arcade(x, z):
		return FLOOR_Y
	if on_brick(x, z):
		return -0.04
	return NAN

## How far the camera's boulevard view (facing south) stays on: across the arcade and the
## brick apron, where the boulevard's own view_for has stopped.
static func view_for(x: float, z: float) -> float:
	return smoothstep(BRICK_WEST - 1.5, BRICK_WEST, x) * (1.0 - smoothstep(EAST + 0.2, EAST + 1.2, x)) \
		* smoothstep(FACE - 0.6, FACE, z) * (1.0 - smoothstep(BACK, BACK + 0.5, z))

## 1 under the arcade's roof, past the planter's line; it rises across the opening's last
## metre and the roof's ends, so walking in glides the camera into the cutaway.
static func covered_for(x: float, z: float) -> float:
	var along := smoothstep(WEST - 0.4, WEST + 0.4, x) * (1.0 - smoothstep(EAST - 0.8, EAST, x))
	return along * smoothstep(FACE + 0.4, INNER - 0.1, z) * (1.0 - smoothstep(WALL, WALL + 0.3, z))

## The posts' x: every POST_STEP from the east end, none in an opening.
static func posts() -> Array[float]:
	var at: Array[float] = []
	var x := EAST - 0.5
	while x > WEST + 0.3:
		if not in_opening(x - 0.3) and not in_opening(x + 0.3):
			at.append(x)
		x -= POST_STEP
	at.append(WEST + 0.25)
	return at

## The runs of x from east to west along the planter that are not openings.
static func runs(east: float, west: float) -> Array:
	var made := []
	var x0 := east
	for opening in OPENINGS:
		if x0 - opening.y > 0.2:
			made.append([x0, opening.y])
		x0 = opening.x
	if x0 - west > 0.2:
		made.append([x0, west])
	return made

var w: RefCounted

func build(world_builder: RefCounted) -> void:
	w = world_builder
	w._flush()
	_floor()
	_planter()
	_rail()
	_posts()
	_back_wall()
	_cafe_juan()
	_courtyard_gate()
	_offices()
	_tables()
	_west_end()
	_props()
	_brick()
	_east_end()
	w._flush()
	_planting()
	w._flush()
	# The roof in its own node: inside, the camera looks down past its front edge, so aps.gd
	# fades it out (its shadow stays) and the back wall shows up to the ceiling.
	var saved: Node3D = w.root
	var roof := Node3D.new()
	roof.name = ROOF_GROUP
	saved.add_child(roof)
	w.root = roof
	_roof()
	w._flush()
	# Daylight fill under the roof, on at every hour while the student is in (the gym's
	# inside lights' way); the night lamps are the roof's own.
	var lights := Node3D.new()
	lights.name = LIGHTS_GROUP
	lights.visible = false
	saved.add_child(lights)
	var x := EAST - 3.2
	while x > WEST:
		var light := OmniLight3D.new()
		light.light_color = Color("fff1dc")
		light.light_energy = 0.8
		light.omni_range = 7.0
		light.omni_attenuation = 1.2
		light.position = Vector3(x, 2.6, MIDDLE)
		lights.add_child(light)
		x -= POST_STEP
	w.root = saved

# --- Helpers ------------------------------------------------------------------------------

## A slab from x0..x1 and z0..z1 (either order) whose top is at `top`.
func _slab(x0: float, x1: float, z0: float, z1: float, top: float, thick: float, made: Material) -> void:
	w.box(Vector3(absf(x1 - x0), thick, absf(z1 - z0)), Vector3((x0 + x1) / 2.0, top - thick / 2.0, (z0 + z1) / 2.0), made)

func _cylinder(top: float, bottom: float, height: float, at: Vector3, made: Material, segments := 12) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = top
	mesh.bottom_radius = bottom
	mesh.height = height
	mesh.radial_segments = segments
	mesh.rings = 1
	return w._mesh(mesh, at, made)

## A sign facing the arcade (towards -z, the boulevard), text on a board.
func _sign(text: String, at: Vector3, size: Vector2, board: Color, ink: Color) -> void:
	w.box(Vector3(size.x, size.y, 0.05), at, w.material("plain", board))
	var label: Label3D = w.panel(text, at + Vector3(0, 0, -0.035), size.x * 0.9, size.y * 0.7, ink)
	label.rotation.y = PI
	label.double_sided = false

# --- The floor, the planter and the rail -----------------------------------------------------

## The terracotta floor in its circles, from the planter to the back wall, and a granite
## step edge where each opening steps up from the boulevard's tiles.
func _floor() -> void:
	_slab(WEST, EAST, FACE, WALL, FLOOR_Y, 0.3, w.material("circles"))
	var granite: Material = w.material("concrete", Color("b9b5ac"))
	for opening in OPENINGS:
		_slab(opening.x, opening.y, FACE, FACE + 0.3, FLOOR_Y + 0.004, 0.2, granite)

## The planter along the open side: a box of red-brown tiles with a darker coping, soil
## on top, broken at each opening (lady palms are planted in _planting).
func _planter() -> void:
	var tiles: Material = w.material("stucco", Color("b4573f"))
	var coping: Material = w.material("stucco", Color("8d3f2f"))
	var soil: Material = w.material("dirt", Color("8a7458"))
	var height := 0.72
	var depth := PLANTER.y - PLANTER.x
	for run in runs(EAST, WEST):
		var x0: float = run[0]
		var x1: float = run[1]
		var middle := (x0 + x1) / 2.0
		var length := x0 - x1
		w.box(Vector3(length, height, depth), Vector3(middle, height / 2.0, (PLANTER.x + PLANTER.y) / 2.0), tiles)
		w.box(Vector3(length + 0.04, 0.06, depth + 0.06), Vector3(middle, height + 0.03, (PLANTER.x + PLANTER.y) / 2.0), coping)
		w.box(Vector3(length - 0.12, 0.02, depth - 0.12), Vector3(middle, height + 0.065, (PLANTER.x + PLANTER.y) / 2.0), soil)
		for end in [x0, x1]:
			w.box(Vector3(0.05, height, depth + 0.02), Vector3(end, height / 2.0, (PLANTER.x + PLANTER.y) / 2.0), coping)

## The rail on the planter's inner edge: dark steel posts every 1.6 m, two dark rails and
## a stainless top rail (as in every photo of the arcade), broken at the openings.
func _rail() -> void:
	var steel: Material = w.material("plain", Color("2c2f31"))
	var top: Material = w.material("plain", Color("c3c7c6"))
	var z := PLANTER.y + 0.08
	for run in runs(EAST, WEST):
		var x0: float = run[0] - 0.1
		var x1: float = run[1] + 0.1
		var length := x0 - x1
		var middle := (x0 + x1) / 2.0
		var gaps := maxi(1, ceili(length / 1.6))
		for i in gaps + 1:
			w.box(Vector3(0.05, 1.06, 0.05), Vector3(x0 - length * i / gaps, FLOOR_Y + 0.53, z), steel)
		for y in [0.42, 0.74]:
			w.box(Vector3(length, 0.04, 0.03), Vector3(middle, FLOOR_Y + y, z), steel)
		w.box(Vector3(length, 0.06, 0.07), Vector3(middle, FLOOR_Y + 1.08, z), top)

# --- The posts and the roof -------------------------------------------------------------------

## The slim cream double posts on the planter's line, an orange downpipe and a cream one
## beside every other pair (from the gutter at the roof's edge, as in the photos).
func _posts() -> void:
	var cream: Material = w.material("plain", Color("efe6c8"))
	var shade: Material = w.material("plain", Color("dccfab"))
	var orange: Material = w.material("plain", Color("d9772e"))
	var pipe: Material = w.material("plain", Color("eee6cf"))
	var height := CEILING - FLOOR_Y
	var k := 0
	for x in posts():
		w.box(Vector3(0.16, height, 0.16), Vector3(x - 0.13, FLOOR_Y + height / 2.0, POST_Z), cream)
		w.box(Vector3(0.16, height, 0.16), Vector3(x + 0.13, FLOOR_Y + height / 2.0, POST_Z), shade)
		w.box(Vector3(0.24, 0.1, 0.24), Vector3(x - 0.13, FLOOR_Y + 0.05, POST_Z), shade)
		w.box(Vector3(0.24, 0.1, 0.24), Vector3(x + 0.13, FLOOR_Y + 0.05, POST_Z), shade)
		if k % 2 == 1:
			w.box(Vector3(0.11, height - 0.15, 0.11), Vector3(x + 0.38, FLOOR_Y + (height - 0.15) / 2.0, POST_Z - 0.04), orange)
			w.box(Vector3(0.11, 0.11, 0.5), Vector3(x + 0.38, CEILING - 0.2, POST_Z - 0.25), orange)
			w.box(Vector3(0.09, height - 0.4, 0.09), Vector3(x - 0.36, FLOOR_Y + (height - 0.4) / 2.0 + 0.2, POST_Z + 0.02), pipe)
		k += 1

## The flat roof: a ceiling of white 60 cm tiles (the slab texture's grid), the roof slab
## over it, a white fascia and gutter along the open side, dark grey beams across every
## so often (one carries a TV), ceiling fans down the middle and light panels nearer the wall.
func _roof() -> void:
	var length := EAST - WEST
	var middle_x := (EAST + WEST) / 2.0
	var ceiling: Material = w.material("slab", Color("f6f4ec"))
	var white: Material = w.material("stucco", Color("f4f1e6"))
	var grey: Material = w.material("plain", Color("4b5352"))
	w.box(Vector3(length, 0.04, WALL - PLANTER.x + 0.1), Vector3(middle_x, CEILING + 0.02, (WALL + PLANTER.x) / 2.0), ceiling)
	w.box(Vector3(length + 0.2, 0.3, BACK - PLANTER.x + 0.4), Vector3(middle_x, CEILING + 0.19, (BACK + PLANTER.x - 0.4) / 2.0), white)
	w.box(Vector3(length + 0.2, 0.55, 0.12), Vector3(middle_x, CEILING + 0.06, PLANTER.x - 0.4), white)
	w.box(Vector3(length + 0.2, 0.14, 0.2), Vector3(middle_x, CEILING + 0.4, PLANTER.x - 0.32), w.material("plain", Color("dedbd0")))
	for end in [WEST - 0.1, EAST + 0.1]:
		w.box(Vector3(0.12, 0.55, BACK - PLANTER.x + 0.4), Vector3(end, CEILING + 0.06, (BACK + PLANTER.x - 0.4) / 2.0), white)
	for x in [-100.8, -124.5, -138.0]:
		w.box(Vector3(0.45, 0.32, WALL - PLANTER.x), Vector3(x, CEILING - 0.16, (WALL + PLANTER.x) / 2.0), grey)
	# The TV hung under the middle beam, facing east down the arcade.
	w.box(Vector3(0.08, 0.3, 0.08), Vector3(-124.5, CEILING - 0.45, 84.0), grey)
	w.box(Vector3(0.1, 0.62, 1.05), Vector3(-124.35, CEILING - 0.86, 84.0), w.material("plain", Color("1c1d1f")))
	# The fans and the light panels, one of each every two bays.
	var hub: Material = w.material("plain", Color("f1efe8"))
	var panel: Material = w.glow(Color("fff6e6"), 0.25, 2.2)
	var x := EAST - 3.4
	var k := 0
	while x > WEST + 1.0:
		var fan := Vector3(x, CEILING, 83.6)
		w.box(Vector3(0.04, 0.42, 0.04), fan + Vector3(0, -0.21, 0), hub)
		w.box(Vector3(0.22, 0.14, 0.22), fan + Vector3(0, -0.48, 0), hub)
		for i in 3:
			var a := i * TAU / 3.0 + k * 0.7
			w.box(Vector3(0.62, 0.02, 0.12), fan + Vector3(cos(a) * 0.42, -0.5, -sin(a) * 0.42), hub, a)
		w.box(Vector3(0.58, 0.03, 0.58), Vector3(x + 1.6, CEILING - 0.005, 86.3), panel)
		if k % 2 == 0:
			w._omni(Vector3(x + 1.6, CEILING - 0.4, 84.6), Color("ffcf92"), 0.55, 4.6)
		x -= POST_STEP
		k += 1

# --- The back wall --------------------------------------------------------------------------

## The Main Building's ground floor, seen from the arcade: cream stucco from the floor to
## the roof slab over a maroon dado, open at Cafe Juan's door and the courtyard gate.
func _back_wall() -> void:
	var cream: Material = w.material("stucco", Color("f4e6bf"))
	var maroon: Material = w.material("stucco", Color("a3463a"))
	var height := CEILING + 0.34
	var pieces := [[EAST, COURTYARD.y], [COURTYARD.x, CAFE_DOOR.y], [CAFE_DOOR.x, WEST]]
	for piece in pieces:
		var x0: float = piece[0]
		var x1: float = piece[1]
		w.box(Vector3(x0 - x1, height, BACK - WALL), Vector3((x0 + x1) / 2.0, height / 2.0, (WALL + BACK) / 2.0), cream)
		w.box(Vector3(x0 - x1, 0.62, 0.05), Vector3((x0 + x1) / 2.0, FLOOR_Y + 0.31, WALL - 0.025), maroon)
	# Over the openings the wall carries on above their heads.
	for opening in [COURTYARD, CAFE_DOOR]:
		var head := 2.75
		w.box(Vector3(opening.y - opening.x, height - head, BACK - WALL), Vector3((opening.x + opening.y) / 2.0, (height + head) / 2.0, (WALL + BACK) / 2.0), cream)

## A window into Cafe Juan: dark frame, warm glass (the lit room behind it; it glows at
## night), white mullions and rails, a red sill.
func _cafe_window(x: float, width: float, glass: Material) -> void:
	var y := 1.75
	var height := 2.0
	var z := WALL - 0.02
	w.box(Vector3(width + 0.14, height + 0.14, 0.06), Vector3(x, y, z), w.material("plain", Color("3a3530")))
	w.box(Vector3(width, height, 0.035), Vector3(x, y, z - 0.045), glass)
	var bar: Material = w.material("plain", Color("f1f0ea"))
	for k in 4:
		w.box(Vector3(0.05, height + 0.08, 0.05), Vector3(x - width / 2.0 + width * k / 3.0, y, z - 0.08), bar)
	for dy in [-height / 2.0, height / 2.0, height / 2.0 - 0.55]:
		w.box(Vector3(width + 0.08, 0.05, 0.06), Vector3(x, y + dy, z - 0.08), bar)
	w.box(Vector3(width + 0.3, 0.08, 0.2), Vector3(x, y - height / 2.0 - 0.06, z - 0.08), w.material("stucco", Color("8d3f2f")))

## Cafe Juan's front: seven tall windows in threes between cream piers, under the dark
## corrugated fascia that slopes out over them; its doorway at the east end under the
## carved wooden sign, low slatted gates folded back, a step up, the warm room behind,
## and potted arecas in a row along the wall beside it.
func _cafe_juan() -> void:
	var glass: Material = w.material("glass", Color("a3825f")).duplicate() as StandardMaterial3D
	glass.emission_enabled = true
	glass.emission = Color("ffc281")
	w.glows.append([glass, 0.12, 1.35])
	var pier: Material = w.material("stucco", Color("f3e3b6"))
	var span := CAFE.y - CAFE.x
	var bays := 7
	for i in bays:
		var x := CAFE.x + span * (i + 0.5) / bays
		_cafe_window(x, span / bays - 0.75, glass)
	for i in bays + 1:
		var x := CAFE.x + span * i / bays
		w.box(Vector3(0.5, CEILING - FLOOR_Y, 0.14), Vector3(x, FLOOR_Y + (CEILING - FLOOR_Y) / 2.0, WALL - 0.07), pier)
	# The fascia: dark corrugated sheet sloping up and out from the windows' heads to the ceiling.
	var sheet: Material = w.material("ribbed", Color("4a4f52"))
	var fascia_w := CAFE_DOOR.y + 0.3 - (CAFE.x - 0.3)
	w.box(Vector3(fascia_w, 0.04, 1.1), Vector3((CAFE.x + CAFE_DOOR.y) / 2.0, CEILING - 0.22, WALL - 0.49), sheet, 0.0, 0.5)
	# The doorway: a dark timber frame, the warm room behind, the gates folded back, a step.
	var door_x := (CAFE_DOOR.x + CAFE_DOOR.y) / 2.0
	var door_w := CAFE_DOOR.y - CAFE_DOOR.x
	var timber: Material = w.material("wood", Color("6a5040"))
	var dark: Material = w.material("plain", Color("2e2620"))
	w.box(Vector3(door_w, 2.75 - FLOOR_Y, 0.05), Vector3(door_x, FLOOR_Y + (2.75 - FLOOR_Y) / 2.0, BACK - 0.03), w.glow(Color("8a6040"), 0.35, 1.1))
	w.box(Vector3(door_w * 0.5, 1.0, 0.06), Vector3(door_x + 0.3, FLOOR_Y + 0.55, BACK - 0.12), timber) # the counter
	for side in [-1.0, 1.0]:
		w.box(Vector3(0.22, 2.75, BACK - WALL + 0.1), Vector3(door_x + side * (door_w / 2.0 - 0.11), 1.375, (WALL + BACK) / 2.0), dark)
		for k in 6:
			w.box(Vector3(0.05, 1.1, 0.04), Vector3(door_x + side * (door_w / 2.0 - 0.32 - k * 0.12), FLOOR_Y + 0.62, WALL - 0.12), dark)
	w.box(Vector3(door_w, 0.18, 0.12), Vector3(door_x, 2.75 + 0.09, WALL - 0.04), dark)
	w.box(Vector3(door_w, 0.12, 0.5), Vector3(door_x, FLOOR_Y + 0.06, WALL - 0.2), w.material("concrete", Color("c9c3b6")))
	for k in 3:
		w.box(Vector3(0.04, 0.45, 0.04), Vector3(door_x - 1.2 + k * 1.2, 2.45, BACK - 0.25), dark)
		w.box(Vector3(0.14, 0.1, 0.14), Vector3(door_x - 1.2 + k * 1.2, 2.18, BACK - 0.25), w.glow(Color("ffd88a"), 0.6, 2.0))
	# The carved sign, hung under the ceiling in front of the door.
	for dx in [-1.0, 1.0]:
		w.box(Vector3(0.03, 0.25, 0.03), Vector3(door_x + dx, CEILING - 0.12, WALL - 0.5), dark)
	_sign("CAFE JUAN", Vector3(door_x, CEILING - 0.6, WALL - 0.5), Vector2(2.5, 0.7), Color("8f5c3c"), Color("f2e2c8"))
	# Potted arecas along the wall east of the door.
	var pot: Material = w.material("plain", Color("b8704f"))
	for at in PALM_POTS:
		_cylinder(0.24, 0.18, 0.42, Vector3(at.x, FLOOR_Y + 0.21, at.y), pot, 10)

## The courtyard gate: an opening through to the Main Building's courtyard (its daylight
## behind), the iron gate folded back against both jambs, the sign over it.
func _courtyard_gate() -> void:
	var x := (COURTYARD.x + COURTYARD.y) / 2.0
	var width := COURTYARD.y - COURTYARD.x
	w.box(Vector3(width, 2.75, 0.05), Vector3(x, 1.375, BACK - 0.03), w.glow(Color("dfe6d4"), 0.55, 0.15))
	w.box(Vector3(width, 0.12, BACK - WALL), Vector3(x, FLOOR_Y + 0.06, (WALL + BACK) / 2.0), w.material("concrete", Color("c9c3b6")))
	var iron: Material = w.material("plain", Color("26282a"))
	for side in [-1.0, 1.0]:
		w.box(Vector3(0.16, 2.75, BACK - WALL + 0.08), Vector3(x + side * (width / 2.0 - 0.08), 1.375, (WALL + BACK) / 2.0), w.material("stucco", Color("e6d29d")))
		for k in 5:
			w.box(Vector3(0.03, 2.3, 0.03), Vector3(x + side * (width / 2.0 - 0.25 - k * 0.1), FLOOR_Y + 1.15, WALL + 0.1), iron)
		w.box(Vector3(0.5, 0.04, 0.04), Vector3(x + side * (width / 2.0 - 0.45), FLOOR_Y + 2.2, WALL + 0.1), iron)
	_sign("COURTYARD", Vector3(x, 3.02, WALL - 0.04), Vector2(1.6, 0.3), Color("efe3c4"), Color("6a4a3a"))

## East of the courtyard gate: offices behind grilled windows, grey lockers, stacked black
## chairs, a notice board; and the fire extinguisher and the health sign at the west end.
func _offices() -> void:
	var iron: Material = w.material("plain", Color("2a2c2d"))
	for x in [-101.9, -97.6, -92.4]:
		w.framed_window(Vector3(x, 1.85, WALL), 2.3, 1.35, Vector3(0, 0, -1), false, 2, Color("3b3631"))
		for k in 9:
			w.box(Vector3(0.025, 1.4, 0.025), Vector3(x - 1.12 + k * 0.28, 1.85, WALL - 0.17), iron)
		for dy in [-0.45, 0.0, 0.45]:
			w.box(Vector3(2.3, 0.025, 0.025), Vector3(x, 1.85 + dy, WALL - 0.17), iron)
	var grey: Material = w.material("metal", Color("c9ccc6"))
	w.box(Vector3(1.4, 1.75, 0.5), Vector3(-99.55, FLOOR_Y + 0.875, 87.7), grey)
	for k in 4:
		w.box(Vector3(0.012, 1.7, 0.02), Vector3(-100.25 + k * 0.35 + 0.175, FLOOR_Y + 0.875, 87.44), w.material("plain", Color("8e928d")))
	var black: Material = w.material("plain", Color("26272a"))
	for k in 2:
		for i in 9:
			w.box(Vector3(0.44, 0.05, 0.45), Vector3(-95.0 + k * 0.5, FLOOR_Y + 0.42 + i * 0.09, 87.6), black)
		w.box(Vector3(0.44, 0.5, 0.05), Vector3(-95.0 + k * 0.5, FLOOR_Y + 1.35, 87.83), black)
	w.box(Vector3(1.1, 0.75, 0.04), Vector3(-109.9, 1.65, WALL - 0.03), w.material("wood", Color("b49a74")))
	w.box(Vector3(0.95, 0.6, 0.02), Vector3(-109.9, 1.65, WALL - 0.055), w.material("plain", Color("e9e5da")))
	w.box(Vector3(0.22, 0.5, 0.12), Vector3(-150.5, 1.2, WALL - 0.07), w.material("plain", Color("c0392b")))
	_sign("HEALTH REMINDER", Vector3(-155.0, 1.6, WALL - 0.03), Vector2(0.55, 0.16), Color("f4f2ea"), Color("b0302a"))

# --- Furniture --------------------------------------------------------------------------------

## The study tables along the back wall: white tops, a divider along the wall side and
## between each pair, and a white monobloc chair at most of them.
func _tables() -> void:
	var white: Material = w.material("plain", Color("efece2"))
	var leg: Material = w.material("plain", Color("dedacd"))
	var chair: Material = w.material("plain", Color("f3f2ed"))
	var k := 0
	for run in TABLE_RUNS:
		var x: float = run.x - TABLE / 2.0
		while x - TABLE / 2.0 >= run.y - 0.01:
			var top := FLOOR_Y + 0.74
			w.box(Vector3(TABLE - 0.04, 0.04, 0.62), Vector3(x, top, TABLE_Z), white)
			for side in [-1.0, 1.0]:
				w.box(Vector3(0.05, 0.74, 0.55), Vector3(x + side * (TABLE / 2.0 - 0.06), FLOOR_Y + 0.37, TABLE_Z), leg)
			w.box(Vector3(TABLE - 0.04, 0.42, 0.03), Vector3(x, top + 0.23, TABLE_Z + 0.3), white)
			if k % 2 == 0:
				w.box(Vector3(0.03, 0.38, 0.6), Vector3(x - TABLE / 2.0, top + 0.21, TABLE_Z), white)
			if posmod(k * 7, 9) < 7:
				_chair(Vector3(x + fmod(k * 0.13, 0.2) - 0.1, FLOOR_Y, CHAIR_Z), chair)
			x -= TABLE
			k += 1

## A monobloc chair facing the wall (+z): a seat, a curved-looking back, four legs.
func _chair(at: Vector3, made: Material) -> void:
	w.box(Vector3(0.44, 0.04, 0.42), at + Vector3(0, 0.44, 0), made)
	w.box(Vector3(0.42, 0.44, 0.04), at + Vector3(0, 0.7, -0.22), made, 0.0, -0.18)
	for corner in [Vector2(-0.18, -0.17), Vector2(0.18, -0.17), Vector2(-0.18, 0.17), Vector2(0.18, 0.17)]:
		w.box(Vector3(0.04, 0.44, 0.04), at + Vector3(corner.x, 0.22, corner.y), made)

## The arcade's west end (from "student center entry way beside the main building"): the
## BDO ATM in its blue kiosk and a water dispenser on the wall, three iron cafe tables with
## their chairs, and two benches on red bases along the rail.
func _west_end() -> void:
	var blue: Material = w.material("plain", Color("203f8e"))
	var steel: Material = w.material("metal", Color("b6babc"))
	w.box(Vector3(0.95, 2.0, 1.0), Vector3(-153.575, FLOOR_Y + 1.0, 87.5), blue)
	w.box(Vector3(0.05, 0.9, 0.7), Vector3(-153.08, FLOOR_Y + 1.1, 87.45), steel)
	w.box(Vector3(0.06, 0.25, 0.5), Vector3(-153.06, FLOOR_Y + 1.5, 87.45), w.glow(Color("8fb5c9"), 0.4, 1.0))
	_sign("BDO", Vector3(-153.575, FLOOR_Y + 1.55, 86.97), Vector2(0.85, 0.42), Color("203f8e"), Color("f4f4f0"))
	w.box(Vector3(0.5, 1.15, 0.45), Vector3(-155.6, FLOOR_Y + 0.575, 87.6), w.material("plain", Color("eeeeea")))
	var iron := Color("232323")
	var top: Material = w.material("plain", Color("3a3836"))
	var seat: Material = w.material("plain", Color("ddd4bf"))
	for at in [Vector2(-154.15, 83.9), Vector2(-151.85, 85.25), Vector2(-149.55, 83.65)]:
		_cylinder(0.36, 0.36, 0.04, Vector3(at.x, FLOOR_Y + 0.74, at.y), top, 14)
		w.rod(Vector3(at.x, FLOOR_Y, at.y), Vector3(at.x, FLOOR_Y + 0.72, at.y), 0.03, iron)
		for side in [-1.0, 1.0]:
			var chair := Vector3(at.x + side * 0.55, FLOOR_Y, at.y + side * 0.15)
			_cylinder(0.19, 0.19, 0.04, chair + Vector3(0, 0.46, 0), seat, 12)
			for leg in [Vector2(-0.12, -0.12), Vector2(0.12, -0.12), Vector2(-0.12, 0.12), Vector2(0.12, 0.12)]:
				w.rod(chair + Vector3(leg.x, 0, leg.y), chair + Vector3(leg.x * 0.8, 0.45, leg.y * 0.8), 0.012, iron)
			w.rod(chair + Vector3(side * 0.15, 0.46, 0), chair + Vector3(side * 0.17, 0.95, 0), 0.012, iron)
	var red: Material = w.material("stucco", Color("a8463a"))
	var wood: Material = w.material("wood", Color("8a6a4e"))
	for x in [-154.35, -151.65]:
		for dx in [-0.65, 0.65]:
			w.box(Vector3(0.24, 0.4, 0.42), Vector3(x + dx, FLOOR_Y + 0.2, 81.75), red)
		w.box(Vector3(1.8, 0.07, 0.48), Vector3(x, FLOOR_Y + 0.44, 81.75), wood)

## The drinking fountain by the rail midway, and the steel sink by the rail near the east end.
func _props() -> void:
	var steel: Material = w.material("metal", Color("bfc3c3"))
	w.box(Vector3(0.45, 1.0, 0.45), Vector3(-125.0, FLOOR_Y + 0.5, 81.72), steel)
	w.box(Vector3(0.3, 0.06, 0.3), Vector3(-125.0, FLOOR_Y + 1.03, 81.72), w.material("plain", Color("8e9292")))
	w.box(Vector3(1.3, 0.3, 0.55), Vector3(-95.55, FLOOR_Y + 0.85, 81.8), steel)
	w.box(Vector3(1.2, 0.04, 0.45), Vector3(-95.55, FLOOR_Y + 0.98, 81.8), w.material("plain", Color("6f7474")))
	w.box(Vector3(1.3, 0.35, 0.04), Vector3(-95.55, FLOOR_Y + 1.15, 82.05), steel)
	for dx in [-0.6, 0.6]:
		w.box(Vector3(0.05, 0.7, 0.05), Vector3(-95.55 + dx, FLOOR_Y + 0.35, 81.8), steel)
	for dx in [-0.3, 0.3]:
		w.rod(Vector3(-95.55 + dx, FLOOR_Y + 1.15, 82.0), Vector3(-95.55 + dx, FLOOR_Y + 1.32, 81.85), 0.015, Color("d7dada"))

# --- Outside the ends -------------------------------------------------------------------------

## The herringbone-brick apron past the west end, down beside the walks' end to the
## fountain's apron (cut round it, with a kerb on the arc), a hedge round its outer
## edges, a granite bench and a shade tree in a round bed.
func _brick() -> void:
	var brick: Material = w.material("brick", Color("a49b95"))
	_slab(BRICK_WEST, WEST, FACE, BRICK_BACK, -0.04, 0.16, brick)
	var outline := PackedVector2Array([Vector2(BRICK_WEST, BRICK_SOUTH), Vector2(WALKS_END, BRICK_SOUTH),
		Vector2(WALKS_END, FACE), Vector2(BRICK_WEST, FACE)])
	var circle := PackedVector2Array()
	for i in 64:
		var a := i * TAU / 64.0
		circle.append(FOUNTAIN + Vector2(cos(a), sin(a)) * APRON)
	for part in Geometry2D.clip_polygons(outline, circle):
		var indices := Geometry2D.triangulate_polygon(part)
		var triangles := PackedVector2Array()
		for index in indices:
			triangles.append(part[index])
		w._ground(triangles, -0.04, brick)
	var kerb: Material = w.material("stucco", Color("bfc4bc"))
	for i in 64:
		var a := (i + 0.5) * TAU / 64.0
		var at := FOUNTAIN + Vector2(cos(a), sin(a)) * (APRON + 0.12)
		if at.x > BRICK_WEST and at.x < WALKS_END and at.y > BRICK_SOUTH:
			w.box(Vector3(TAU * APRON / 64.0 + 0.04, 0.17, 0.24), Vector3(at.x, -0.1, at.y), kerb, -a - PI / 2.0)
	var hedge_base: Material = w.material("dirt", Color("8a7458"))
	w.box(Vector3(0.7, 0.3, BRICK_BACK - BRICK_SOUTH), Vector3(BRICK_WEST - 0.35, -0.05, (BRICK_BACK + BRICK_SOUTH) / 2.0), hedge_base)
	w.box(Vector3(WEST - BRICK_WEST + 0.7, 0.3, 0.7), Vector3((WEST + BRICK_WEST) / 2.0 - 0.35, -0.05, BRICK_BACK + 0.35), hedge_base)
	var granite: Material = w.material("stucco", Color("e7dccb"))
	for dx in [-0.6, 0.6]:
		w.box(Vector3(0.3, 0.38, 0.32), Vector3(-159.6 + dx, 0.15, 87.75), granite)
	w.box(Vector3(1.75, 0.1, 0.44), Vector3(-159.6, 0.39, 87.75), granite)
	_cylinder(0.7, 0.7, 0.18, Vector3(TREE_WEST.x, 0.05, TREE_WEST.y), w.material("concrete", Color("c9c8c0")), 16)
	_cylinder(0.6, 0.6, 0.04, Vector3(TREE_WEST.x, 0.13, TREE_WEST.y), w.material("dirt"), 16)

## The east end: the arcade stops with the Main Building; a low hedge across its end and a
## lawn with a shade tree in the gap to MGN.
func _east_end() -> void:
	w.box(Vector3(0.6, 0.25, WALL - PLANTER.y), Vector3(EAST + 0.3, FLOOR_Y + 0.02, (WALL + PLANTER.y) / 2.0), w.material("dirt", Color("8a7458")))

## The lady palms in the planter, the hedges round the brick apron and across the east
## end, and the two shade trees.
func _planting() -> void:
	var k := 0
	for run in runs(EAST, WEST):
		var x: float = run[0] - 0.45
		while x > run[1] + 0.35:
			_lady_palm(Vector3(x, 0.74, (PLANTER.x + PLANTER.y) / 2.0), 2600 + k)
			x -= 0.8
			k += 1
	for at in PALM_POTS:
		_lady_palm(Vector3(at.x, FLOOR_Y + 0.42, at.y), 2650 + roundi(at.x))
	var z := BRICK_SOUTH + 0.6
	while z < BRICK_BACK:
		w._shrub(Vector3(BRICK_WEST - 0.35, 0.05, z), 0.9, 2700 + k, w.HEDGE_COLORS)
		z += 0.85
		k += 1
	var x := BRICK_WEST + 0.4
	while x < WEST:
		w._shrub(Vector3(x, 0.05, BRICK_BACK + 0.35), 0.9, 2700 + k, w.HEDGE_COLORS)
		x += 0.85
		k += 1
	z = PLANTER.y + 0.5
	while z < WALL - 0.2:
		w._shrub(Vector3(EAST + 0.3, FLOOR_Y + 0.1, z), 0.75, 2800 + k, w.HEDGE_COLORS)
		z += 0.8
		k += 1
	w._tree(Vector3(TREE_WEST.x, 0.1, TREE_WEST.y), 8.6, 2900)
	w._tree(Vector3(TREE_EAST.x, -0.2, TREE_EAST.y), 7.8, 2901)

## A lady palm (rhapis), as in the planter's photos: a few thin stems up to 1.1-1.6 m, each
## topped by a cluster of narrow dark blades.
func _lady_palm(at: Vector3, seed_value: int) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var leaves: ShaderMaterial = w._leaf_material(seed_value, at + Vector3(0, 1.0, 0), PALM_GREENS, true)
	var stem: Material = w.material("plain", Color("4a5a36"))
	var card: ArrayMesh = w._cards(0.75, 0.75, -0.375, 3, true)
	for i in 4:
		var a := random.randf() * TAU
		var height := random.randf_range(0.7, 1.35)
		var top := at + Vector3(cos(a) * 0.16, height, sin(a) * 0.12)
		w.box(Vector3(0.025, height, 0.025), at.lerp(top, 0.5), stem)
		var leaf: MeshInstance3D = w._mesh(card, top, leaves, random.randf() * PI)
		leaf.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED

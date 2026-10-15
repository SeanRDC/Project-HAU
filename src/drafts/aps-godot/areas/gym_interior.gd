extends RefCounted
## Inside the Immaculate Heart Gymnasium, from the photos in assets/images/buildings/
## ih_gym immaculate heart/ and Sean's answers and marked-up screenshots: the main
## court down the middle of the hall, its lines filling the red surface (the HAU seal
## at centre court, HOLY ANGEL UNIVERSITY along the sideline), a white practice court
## laid across the hall in front of the stage; steel bleachers upstairs on both long
## sides over striped parapet walls; the stage at the south end, its front curved,
## with the WELCOME ANGELITES banner, line-array speakers hung over it and a long
## stair up each side wall; the big striped end walls beside it curving round to the
## stage; and a balcony (the mezzanine) across the north end over the side entrance.
##
## Each stand has two stairs, one at each end, each beside an exit, as at the left
## entrance (the "entering from the left entrance" photo): from the doorway a
## corridor runs in, a stair climbs beside it behind a grille, away from the door
## and up to the stand's aisle by the court rail. On the west (front) side these are
## the left and right entrances; on the east side two open doorways in the back
## wall. Downstairs on the west: the equipment room on the left of the entry
## corridor, the lobby with columns, a wooden platform and grille gates onto the
## court, a corridor past closed rooms to the right entrance, and the backstage room.
## The east side mirrors it with a lobby, a corridor, closed rooms and a storage room.
##
## Everything is in the gym's local frame (see gym.gd): x runs north to south along
## the front (71 at the north gable, 140.5 at the south one), z from 0 at the front
## to -41 at the back. Floors are levels: the lobby (0.75) lies under the stands'
## deck (4.95), so floor_at() and blocked() take the height the walker is at now.
##
## The camera inside is a low 2.5D view in three zones (face_for): in the west half
## it faces the west stand, in the east half the east stand, on the stage the stage.
## Whatever would stand in front of it is cut away: the groups in cuts() fade out by
## hidden() (they keep casting shadows, so the hall stays shaded).

## Hall floor, the stands' deck and the stage top, in metres.
const FLOOR := 0.75
const DECK := 4.95
const STAGE_TOP := 1.95
## Walls that are cut away keep a stub this high, so rooms still read as a plan.
const STUB := 1.2
## Inner faces of the outer walls.
const N_IN := 71.4
const S_IN := 140.1
const W_IN := -0.4
const E_IN := -40.6
## The parapets' court faces, the balcony's front edge and the stage front.
const WEST := -11.0
const EAST := -30.0
const MEZZ := 77.5
const STAGE_X := 129.0
## The stage front bulges towards the court: STAGE_X in the middle, CURVE further
## back at the flanking walls, cut square at STAGE_CORNER where its side stairs land.
const CURVE := 2.4
const STAGE_CORNER := 131.0
## The bleacher rows run between the two stairs of each stand; flat deck beyond.
const ROWS_START := 84.0
const ROWS_END := 121.6
## The red surface (79 to RED_END) and the main court's lines on it: baselines at
## COURT_N and COURT_S, sidelines COURT_HALF either side of the hall's middle.
const RED_END := 121.0
const COURT_N := 80.5
const COURT_S := 120.5
const COURT_HALF := 7.5
## The other court (the practice court across the hall in front of the stage).
const OTHER_END := 128.5
## The side entrance (the steps run from the gable at 71 to here) and its middle.
const VESTIBULE_END := 73.5
const SIDE_DOOR := -20.5
const NORTH := 71.0
const BAY := 69.5 / 12.0
## Stair: [x0, x1, z0, z1, axis, rising towards +1/-1 along it, risers, going].
## Every riser is 0.15 m from the hall floor.
const STAIRS := [
	[82.2, 83.8, -9.44, -1.6, "z", -1, 28, 0.28], # west stand, from the left entrance's corridor
	[121.8, 123.4, -9.44, -1.6, "z", -1, 28, 0.28], # west stand, from the right entrance's passage
	[82.2, 83.8, -39.4, -31.56, "z", 1, 28, 0.28], # east stand, from the north back doorway
	[121.8, 123.4, -39.4, -31.56, "z", 1, 28, 0.28], # east stand, from the south back doorway
	[127.8, STAGE_CORNER + 0.01, -12.6, -11.0, "x", 1, 8, 0.4], # up the west side wall onto the stage
	[127.8, STAGE_CORNER + 0.01, -30.0, -28.4, "x", 1, 8, 0.4], # up the east side wall onto the stage
	[136.2, 137.8, -10.6, -8.6, "z", -1, 8, 0.25], # backstage room up to the stage, west
	[136.2, 137.8, -32.4, -30.4, "z", 1, 8, 0.25], # backstage room up to the stage, east
]
## The openings in the stands' decks over their four stairs.
const HOLES := [[82.2, 83.8, -9.44, -1.6], [121.8, 123.4, -9.44, -1.6], [82.2, 83.8, -39.4, -31.56],
	[121.8, 123.4, -39.4, -31.56]]
## The exits: doorway centres along the front and the back wall (local x), as on the front.
const DOORWAYS := [[78.6, 80.8], [119.4, 121.0]]
## Walls: [x0, x1, z0, z1, from, to]: solid for a walker whose floor is in [from, to).
## LOW walls stand under the deck, ALL go up to the roof.
const LOW := 4.6
const WALLS := [
	# Equipment room: its wall on the entry corridor (a door at z -5.4..-6.6) and on the lobby.
	[77.5, 77.7, -5.4, -0.4, -1.0, LOW], [77.5, 77.7, -7.7, -6.6, -1.0, LOW], [71.4, 77.7, -7.7, -7.5, -1.0, LOW],
	# The grille between the entry corridor and the west stand's north stair (open at its
	# foot), the stair's wall on the lobby, and the lockers against the grille.
	[82.0, 82.2, -9.44, -1.6, -1.0, LOW], [83.8, 84.0, -9.44, -0.4, -1.0, LOW], [81.4, 82.0, -6.0, -3.0, -1.0, 3.0],
	# West rooms: on the lobby, along the corridor, between rooms, the right entrance's passage.
	[94.8, 95.0, -5.7, -0.4, -1.0, LOW], [95.0, 118.8, -5.7, -5.5, -1.0, LOW], [105.9, 106.1, -5.5, -0.4, -1.0, LOW],
	[118.6, 118.8, -5.5, -0.4, -1.0, LOW],
	# The grille between the passage and the south stair, and the stair's far wall.
	[121.6, 121.8, -9.44, -1.6, -1.0, LOW], [123.4, 123.6, -9.44, -0.4, -1.0, LOW],
	# West parapet, open at two doorways; the wall to the backstage room, open at its door.
	[95.0, 101.0, -11.0, -10.6, -1.0, LOW], [102.4, 125.4, -11.0, -10.6, -1.0, LOW], [126.8, 129.0, -11.0, -10.6, -1.0, LOW],
	[129.0, 129.4, -7.4, -0.4, -1.0, LOW], [129.0, 129.4, -10.6, -9.0, -1.0, LOW],
	# West flanking wall of the stage, open at the backstage door.
	[129.0, 136.2, -11.0, -10.6, -1.0, 99.0], [137.8, 140.1, -11.0, -10.6, -1.0, 99.0],
	# East parapet with four doorways; the closed north-east room.
	[77.5, 79.0, -30.4, -30.0, -1.0, LOW], [80.6, 88.0, -30.4, -30.0, -1.0, LOW], [89.4, 101.0, -30.4, -30.0, -1.0, LOW],
	[102.4, 125.4, -30.4, -30.0, -1.0, LOW], [126.8, 129.0, -30.4, -30.0, -1.0, LOW],
	[71.4, 77.5, -30.4, -30.0, -1.0, LOW], [77.5, 77.7, -40.6, -30.4, -1.0, LOW],
	# The east stairs' grilles and far walls.
	[82.0, 82.2, -39.4, -31.56, -1.0, LOW], [83.8, 84.0, -40.6, -31.56, -1.0, LOW],
	[121.6, 121.8, -39.4, -31.56, -1.0, LOW], [123.4, 123.6, -40.6, -31.56, -1.0, LOW],
	# East rooms along the back wall, and the wall to the east backstage room.
	[94.8, 95.0, -40.6, -35.2, -1.0, LOW], [95.0, 118.8, -35.2, -35.0, -1.0, LOW], [106.9, 107.1, -40.6, -35.2, -1.0, LOW],
	[118.6, 118.8, -40.6, -35.2, -1.0, LOW],
	[129.0, 129.4, -32.0, -30.4, -1.0, LOW], [129.0, 129.4, -40.6, -33.6, -1.0, LOW],
	# East flanking wall of the stage, open at the backstage door.
	[129.0, 136.2, -30.4, -30.0, -1.0, 99.0], [137.8, 140.1, -30.4, -30.0, -1.0, 99.0],
	# The side entrance's reveals, and the columns under the balcony and the lobby's deck.
	[71.0, 74.0, -17.65, -17.45, -1.0, LOW], [71.0, 74.0, -23.55, -23.35, -1.0, LOW],
	[76.95, 77.45, -13.75, -13.25, -1.0, LOW], [76.95, 77.45, -27.75, -27.25, -1.0, LOW],
	[77.25, 77.75, -11.05, -10.55, -1.0, LOW], [83.05, 83.55, -11.05, -10.55, -1.0, LOW],
	[88.85, 89.35, -11.05, -10.55, -1.0, LOW], [94.75, 95.25, -11.05, -10.55, -1.0, LOW],
	# The lobby's grille fence between the columns, open at its two gates.
	[77.8, 80.0, -10.85, -10.75, -1.0, 3.0], [81.2, 83.0, -10.85, -10.75, -1.0, 3.0], [83.6, 88.8, -10.85, -10.75, -1.0, 3.0],
	[91.6, 94.7, -10.85, -10.75, -1.0, 3.0],
	# Upstairs: the booth on the east stand.
	[101.0, 107.0, -40.6, -36.5, LOW, 99.0],
	# The LED screen on the stage, and the drum kit.
	[136.4, 136.8, -25.0, -16.0, 1.5, 3.0], [131.7, 133.5, -14.4, -12.4, 1.5, 3.0],
	# Equipment room racks along its outer and north walls.
	[71.75, 77.15, -1.3, -0.4, -1.0, 3.0], [71.4, 72.2, -7.4, -1.3, -1.0, 3.0],
	# Portable hoops behind each baseline; the angel trophy and chairs in the court's corner.
	[79.0, 81.2, -21.3, -19.7, -1.0, 3.0], [119.8, 122.0, -21.3, -19.7, -1.0, 3.0],
	[117.0, 120.2, -29.9, -28.7, -1.0, 3.0],
	# Lobby things, as in its photo: the red lift, the folded tables against the fence,
	# the bins, the wooden cabinet by the column, and the low wooden platform.
	[84.2, 85.4, -10.5, -9.6, -1.0, 3.0], [86.4, 88.4, -10.75, -10.4, -1.0, 3.0], [91.8, 93.6, -10.6, -10.1, -1.0, 3.0],
	[93.8, 94.7, -10.6, -9.4, -1.0, 3.0], [85.0, 90.5, -3.4, -0.6, -1.0, 3.0],
	# Lockers in the right entrance's passage and in the north back passage.
	[121.0, 121.6, -6.4, -4.0, -1.0, 3.0], [81.4, 82.0, -38.0, -35.0, -1.0, 3.0],
	# Backstage rooms: a table and racks (west), crates and cases (east).
	[132.5, 135.0, -6.2, -4.4, -1.0, 3.0], [138.6, 140.1, -9.0, -1.0, -1.0, 3.0], [131.0, 135.5, -40.6, -38.4, -1.0, 3.0],
]

var w # the World being built (world.gd)
var groups := {}
var _pending := {}

## The pivot's groups: the first two always show (InteriorLights only once inside);
## the rest are cut away by hidden(). Each bay of the roof structure is two groups,
## its west and east halves (Ceiling0W .. Ceiling11E).
static func group_names() -> Array:
	var names := ["Interior", "InteriorLights", "Roof", "NorthWall", "FrontWall", "BackWall", "Mezzanine",
		"WestStands", "WestWalls", "WestStairs", "EastStands", "EastWalls", "EastStairs", "StageBack"]
	for i in 12:
		names.append("Ceiling%dW" % i)
		names.append("Ceiling%dE" % i)
	return names

static func cuts() -> Array:
	return group_names().slice(2)

## Inside the walls (local), the doorways included.
static func inside(lx: float, lz: float) -> bool:
	return lx > NORTH and lx < 140.5 and lz < 0.0 and lz > -41.0

## Which way the camera faces inside, in quarter turns past the gym's front view:
## 0 east (the east half, L), 1 south (the stage, F), 2 west (the west half, R).
## Across the middle line it glides round through the stage's view.
static func face_for(lx: float, lz: float) -> float:
	var sides := 2.0 * smoothstep(SIDE_DOOR - 2.5, SIDE_DOOR + 2.5, lz)
	return lerpf(sides, 1.0, smoothstep(126.5, 128.5, lx))

## The zone a camera facing face (see face_for) is looking at: "L", "F" or "R".
static func side_for(face: float) -> String:
	return "L" if face < 0.6 else ("R" if face > 1.4 else "F")

## Whether a group is cut away for a student at local (lx, lz) standing at height y,
## with the camera looking at side ("L", "F" or "R").
static func hidden(group: String, lx: float, lz: float, y: float, side: String) -> bool:
	if not inside(lx, lz):
		return false
	var low := y < LOW - 0.1
	var under_west := low and lz > WEST - 0.2
	var under_east := low and lz < EAST + 0.2
	match group:
		"Roof", "NorthWall":
			return true
		"FrontWall":
			return side == "L"
		"BackWall":
			return side == "R"
		"Mezzanine":
			return low and lx < 85.0
		"WestStands":
			# Seen from the court the deck stays over the lobby, as in its photo, until
			# the student is too deep under it to be seen beneath its edge.
			return side == "L" or (under_west and lz > -3.0)
		"WestWalls":
			return side == "L" or under_west
		"EastStands":
			return side == "R" or (under_east and lz < -38.0)
		"EastWalls":
			return side == "R" or under_east
		"WestStairs":
			return side == "L"
		"EastStairs":
			return side == "R"
		"StageBack":
			return lx > 135.8 and lz < -10.6 and lz > -30.4
	if group.begins_with("Ceiling"):
		var half := group.right(1)
		if side == "L":
			return half == "W"
		if side == "R":
			return half == "E"
		# Facing the stage, a bay shows only beyond the student.
		var start := NORTH + int(group.trim_prefix("Ceiling").left(-1)) * BAY
		return start < lx + 1.5
	return false

## Where the camera closes in to a low side view: on the stage, the stands and the
## balcony (a student up there).
static func perched(lx: float, lz: float, y: float) -> bool:
	if not inside(lx, lz):
		return false
	return y >= LOW - 0.1 or (y >= STAGE_TOP - 0.3 and lx >= STAGE_X - 0.3)

## Where the curved stage front stands at local z.
static func stage_front(lz: float) -> float:
	return minf(STAGE_X + CURVE * pow((lz - SIDE_DOOR) / 9.5, 2.0), STAGE_CORNER)

## Where a stand's big end wall stands at local z: it curves from 129 at the outer
## wall round to the stage's corner (STAGE_CORNER) at the flanking wall.
static func end_wall(lz: float) -> float:
	var from := W_IN if lz > SIDE_DOOR else E_IN
	var t := clampf(absf(lz - from) / 10.6, 0.0, 1.0)
	return STAGE_CORNER - 2.0 * sqrt(1.0 - t * t)

# --- Floors and collision ------------------------------------------------------------

## The height of the stair at a point, or NAN off it.
static func _stair(stair: Array, lx: float, lz: float) -> float:
	if lx < stair[0] or lx > stair[1] or lz < stair[2] or lz > stair[3]:
		return NAN
	var low: float = stair[0] if stair[4] == "x" else stair[2]
	var high: float = stair[1] if stair[4] == "x" else stair[3]
	var along := lx if stair[4] == "x" else lz
	var t: float = along - low if stair[5] > 0 else high - along
	var risers: int = stair[6]
	return FLOOR + 0.15 * clampi(floori(t / float(stair[7])) + 1, 1, risers)

static func _in(rect: Array, lx: float, lz: float) -> bool:
	return lx >= rect[0] and lx <= rect[1] and lz >= rect[2] and lz <= rect[3]

## The stands' and balcony's walking surface (the deck or a bleacher row), or NAN.
static func deck_at(lx: float, lz: float) -> float:
	if lx < N_IN or lx > STAGE_CORNER:
		return NAN
	for hole in HOLES:
		if _in(hole, lx, lz):
			return NAN
	if lz > WEST and lz <= W_IN:
		if lx > end_wall(lz):
			return NAN
		if lx < ROWS_START or lx > ROWS_END or lz <= -9.4:
			return DECK # the flat ends and the aisle along the rail
		return DECK + 0.4 * mini(floori((lz + 9.4) / 0.9) + 1, 10)
	if lz >= EAST and lz <= WEST:
		return DECK if lx < MEZZ else NAN
	if lz < EAST and lz >= E_IN:
		if lx > end_wall(lz):
			return NAN
		if lx < ROWS_START or lx > ROWS_END or lz >= -32.0:
			return DECK
		return DECK + 0.4 * mini(floori((-32.0 - lz) / 0.9) + 1, 9)
	return NAN

## Every floor at a point: [height, solid] (solid floors fill down to the hall floor).
static func floors(lx: float, lz: float) -> Array:
	var ground := FLOOR
	if lx < VESTIBULE_END and absf(lz - SIDE_DOOR) < 2.9:
		ground = 0.15 * mini(floori((lx - NORTH) / 0.5) + 1, 5)
	var list := [[ground, false]]
	for stair in STAIRS:
		var h := _stair(stair, lx, lz)
		if not is_nan(h):
			list.append([h, true])
	if lz >= -30.4 and lz <= -10.6 and lx >= stage_front(lz):
		list.append([STAGE_TOP, true])
	var deck := deck_at(lx, lz)
	if not is_nan(deck):
		list.append([deck, false])
	return list

## The floor a walker at height level stands on here: the highest one it can step
## onto (0.5 m up at most). Without a level, the hall floor's storey.
static func floor_at(lx: float, lz: float, level := NAN) -> float:
	var from := FLOOR if is_nan(level) else level
	var best := -INF
	var lowest := INF
	for entry in floors(lx, lz):
		var h: float = entry[0]
		lowest = minf(lowest, h)
		if h <= from + 0.5 and h > best:
			best = h
	return best if best > -INF else lowest

static func _in_doorway(lx: float) -> bool:
	for doorway in DOORWAYS:
		if lx > doorway[0] and lx < doorway[1]:
			return true
	return false

static func blocked(lx: float, lz: float, level := NAN) -> bool:
	var from := FLOOR if is_nan(level) else level
	var at := floor_at(lx, lz, from)
	if not is_nan(level) and at < from - 0.6:
		return true # no stepping off a deck, a row or the stage
	for entry in floors(lx, lz):
		if entry[1] and entry[0] > at + 0.5:
			return true # the side of a stair or of the stage
	# The outer walls, open at the doorways front and back and the side entrance.
	var ground := at < LOW
	if (lz > W_IN or lz < E_IN) and not (ground and _in_doorway(lx)):
		return true
	if lx > S_IN:
		return true
	if lx < N_IN and not (ground and absf(lz - SIDE_DOOR) < 2.85):
		return true
	for wall in WALLS:
		if lx >= wall[0] and lx <= wall[1] and lz >= wall[2] and lz <= wall[3] and at >= wall[4] and at < wall[5]:
			return true
	return false

## The height under the roof sheets at local z.
static func roof_under(lz: float) -> float:
	return 12.0 + 4.6 * (1.0 - absf(lz - SIDE_DOOR) / 23.1) - 0.25

# --- Building ---------------------------------------------------------------------------

func build(world, by_name: Dictionary) -> void:
	w = world
	groups = by_name
	for group in group_names():
		_pending[group] = []
	_floor()
	_court()
	_practice_floor()
	_west_ground()
	_east_ground()
	_stands("WestStands", 1.0)
	_stands("EastStands", -1.0)
	_mezzanine()
	_stairs()
	_stage()
	_end_walls()
	_hall_things()
	_ceiling()
	_lights()
	_emit()

## Queues a box for a group; _emit() builds each group's boxes under its node.
func _put(group: String, size: Vector3, at: Vector3, made: Material, turn := 0.0, tilt := 0.0) -> void:
	(_pending[group] as Array).append([size, at, made, turn, tilt])

## A box between two corners.
func _cube(group: String, x0: float, x1: float, y0: float, y1: float, z0: float, z1: float, made: Material) -> void:
	_put(group, Vector3(absf(x1 - x0), absf(y1 - y0), absf(z1 - z0)), Vector3((x0 + x1) / 2.0, (y0 + y1) / 2.0, (z0 + z1) / 2.0), made)

## A wall that the camera can cut away: its stub always shows, the rest is in group.
func _wall(group: String, x0: float, x1: float, z0: float, z1: float, top: float, made: Material, from := FLOOR) -> void:
	_cube("Interior", x0, x1, from - 0.05, STUB, z0, z1, made)
	_cube(group, x0, x1, STUB, top, z0, z1, made)

func _emit() -> void:
	w._flush()
	var saved: Node3D = w.root
	for group in group_names():
		w.root = groups[group]
		for entry in _pending[group]:
			w.box(entry[0], entry[1], entry[2], entry[3], entry[4])
		w._flush()
	w.root = saved

func _add(group: String, node: Node3D) -> Node3D:
	(groups[group] as Node3D).add_child(node)
	return node

func _plain(hex: String) -> Material:
	return w.material("plain", Color(hex))

func _cream() -> Material:
	return w.material("stucco", Color("f4efe2"))

## A flat textured quad on the floor (u along x, v along -z from z1), for painted floors.
func _floor_quad(group: String, x0: float, x1: float, z0: float, z1: float, y: float, made: Material, name := "") -> void:
	var tool := SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	tool.set_normal(Vector3.UP)
	var corners := [Vector3(x0, y, z1), Vector3(x1, y, z1), Vector3(x1, y, z0), Vector3(x0, y, z0)]
	var uvs := [Vector2(0, 0), Vector2(1, 0), Vector2(1, 1), Vector2(0, 1)]
	for k in [0, 2, 1, 0, 3, 2]:
		tool.set_uv(uvs[k])
		tool.add_vertex(corners[k])
	var instance := MeshInstance3D.new()
	instance.mesh = tool.commit()
	instance.material_override = made
	instance.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	if name != "":
		instance.name = name
	_add(group, instance)

func _painted(image: Image) -> StandardMaterial3D:
	image.generate_mipmaps()
	var made := StandardMaterial3D.new()
	made.albedo_texture = ImageTexture.create_from_image(image)
	made.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	made.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	made.roughness = 0.9
	made.cull_mode = BaseMaterial3D.CULL_DISABLED
	made.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS_ANISOTROPIC
	return made

## Shaded text, turned by a basis (Label3D faces +z, reads along +x).
func _text(group: String, text: String, at: Vector3, height: float, ink: Color, basis := Basis.IDENTITY) -> Label3D:
	var label := Label3D.new()
	label.name = text
	label.text = text
	label.font_size = 64
	label.outline_size = 0
	label.modulate = ink
	label.shaded = true
	label.alpha_cut = Label3D.ALPHA_CUT_OPAQUE_PREPASS
	label.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
	label.pixel_size = height * 0.62 / 64.0
	label.transform = Transform3D(basis, at)
	_add(group, label)
	return label

func _mesh(group: String, mesh: Mesh, at: Vector3, made: Material, basis := Basis.IDENTITY) -> MeshInstance3D:
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.material_override = made
	instance.transform = Transform3D(basis, at)
	_add(group, instance)
	return instance

func _cylinder(group: String, at: Vector3, radius: float, height: float, made: Material, basis := Basis.IDENTITY) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = height
	mesh.radial_segments = 12
	mesh.rings = 1
	return _mesh(group, mesh, at, made, basis)

# --- Floors ----------------------------------------------------------------------------------

## The dark grey epoxy floor of the whole ground storey (the side entrance's steps
## are gym.gd's), with a lighter walkway band round the courts.
func _floor() -> void:
	var epoxy: Material = w.material("concrete", Color("8a9196"))
	_cube("Interior", VESTIBULE_END, S_IN, FLOOR - 0.3, FLOOR, E_IN, W_IN, epoxy)
	_cube("Interior", N_IN, VESTIBULE_END, FLOOR - 0.3, FLOOR, -17.6, W_IN, epoxy)
	_cube("Interior", N_IN, VESTIBULE_END, FLOOR - 0.3, FLOOR, E_IN, -23.4, epoxy)
	_cube("Interior", MEZZ, STAGE_X, FLOOR - 0.29, FLOOR + 0.002, -29.6, -11.4, w.material("concrete", Color("9aa1a5")))

## The main court, painted as in the photos and Sean's sketch: its lines fill the red
## surface from COURT_N to COURT_S, grey-blue inside, terracotta round it and inside
## the three-point lines, yellow keys, the centre circle with the seal, white
## basketball lines and black volleyball lines.
func _court() -> void:
	var scale := 16.0
	var size := Vector2i(roundi((RED_END - 79.0) * scale), roundi(17.0 * scale))
	var image := Image.create(size.x, size.y, false, Image.FORMAT_RGBA8)
	var random := RandomNumberGenerator.new()
	random.seed = 1610
	var terracotta := Color("b4553f")
	var blue := Color("93a9ab")
	var yellow := Color("d8b43a")
	var white := Color("f3f1ea")
	var black := Color("2c2c2e")
	var maroon := Color("6d1f2c")
	var centre_x := (COURT_N + COURT_S) / 2.0
	var half := (COURT_S - COURT_N) / 2.0
	var basket_x := half - 1.575
	var key_x := half - 5.8
	var corner := COURT_HALF - 0.9
	for py in size.y:
		for px in size.x:
			var cx := 79.0 + (px + 0.5) / scale - centre_x
			var cz := 8.5 - (py + 0.5) / scale
			var side := signf(cx) if cx != 0.0 else 1.0
			var r := Vector2(cx, cz).distance_to(Vector2(side * basket_x, 0.0))
			var court := absf(cx) <= half and absf(cz) <= COURT_HALF
			var tone := terracotta
			if court:
				tone = blue
				var arc_reach := basket_x - sqrt(maxf(0.0, 6.75 * 6.75 - corner * corner))
				if absf(cz) <= corner and (absf(cx) >= arc_reach or r <= 6.75):
					tone = terracotta
				var throw := Vector2(cx, cz).distance_to(Vector2(side * key_x, 0.0))
				if throw <= 1.8 and absf(cx) < key_x:
					tone = blue
				if absf(cz) <= 2.45 and absf(cx) >= key_x and absf(cz) >= 1.95:
					tone = yellow
				var ring := Vector2(cx, cz).length()
				if ring <= 1.8:
					tone = yellow
					# The seal: a maroon shield (its top towards the stage, +x) with white wings.
					if cx > -1.0 and cx < 0.9:
						var shield := 0.72 if cx > -0.2 else 0.72 * sqrt(maxf(0.0, 1.0 - pow((-0.2 - cx) / 0.8, 2.0)))
						if absf(cz) <= shield:
							tone = maroon
							if absf(absf(cz) - (0.1 + (cx + 0.3) * 0.55)) < 0.09 and cx > -0.4 and cx < 0.6:
								tone = white
							if absf(cz) < 0.06 and cx > -0.5 and cx < 0.5:
								tone = white
				# White basketball lines.
				var line := absf(absf(cx) - half) < 0.06 or absf(absf(cz) - COURT_HALF) < 0.06 or absf(cx) < 0.04
				line = line or absf(ring - 1.8) < 0.05
				line = line or (absf(cz) <= corner and absf(cx) < arc_reach and absf(r - 6.75) < 0.05)
				line = line or (absf(absf(cz) - corner) < 0.05 and absf(cx) >= arc_reach)
				line = line or (absf(absf(cz) - 2.45) < 0.05 and absf(cx) >= key_x) or (absf(absf(cx) - key_x) < 0.05 and absf(cz) <= 2.45)
				line = line or (absf(throw - 1.8) < 0.05 and absf(cx) < key_x)
				if line:
					tone = white
				# Black volleyball lines.
				var volley := (absf(absf(cx) - 9.0) < 0.04 and absf(cz) <= 4.5) or (absf(absf(cz) - 4.5) < 0.04 and absf(cx) <= 9.0)
				volley = volley or (absf(absf(cx) - 3.0) < 0.04 and absf(cz) <= 4.5)
				if volley and tone != white:
					tone = black
			var noise := random.randf_range(-0.5, 0.5) * 0.03
			image.set_pixel(px, py, Color(tone.r + noise, tone.g + noise, tone.b + noise))
	_floor_quad("Interior", 79.0, RED_END, -29.0, -12.0, FLOOR + 0.006, _painted(image), "Court")
	# HOLY ANGEL UNIVERSITY along the west sideline, lying on the floor.
	_text("Interior", "HOLY ANGEL UNIVERSITY", Vector3(centre_x, FLOOR + 0.012, -12.5), 0.85, Color("3a2027"),
		Basis(Vector3.RIGHT, -PI / 2.0))

## The other court: the white practice floor laid across the hall between the main
## court and the stage, scuffed, with a yellow badminton court along its length.
func _practice_floor() -> void:
	var scale := 16.0
	var depth := OTHER_END - RED_END
	var size := Vector2i(roundi(depth * scale), roundi(15.4 * scale))
	var image := Image.create(size.x, size.y, false, Image.FORMAT_RGBA8)
	var random := RandomNumberGenerator.new()
	random.seed = 1611
	for py in size.y:
		for px in size.x:
			var cx := (px + 0.5) / scale - depth / 2.0
			var cz := 7.7 - (py + 0.5) / scale
			var tone := Color("eeede8")
			if random.randf() < 0.05:
				tone = Color("b9bab6")
			if random.randf() < 0.012:
				tone = Color("6c6d6c")
			# Landscape: the court's length (13.4 m) runs across the hall, along z.
			var line := absf(absf(cz) - 6.7) < 0.04 and absf(cx) <= 3.05
			line = line or (absf(absf(cx) - 3.05) < 0.04 and absf(cz) <= 6.7) or (absf(absf(cx) - 2.59) < 0.04 and absf(cz) <= 6.7)
			line = line or (absf(absf(cz) - 1.98) < 0.04 and absf(cx) <= 3.05) or (absf(absf(cz) - 5.94) < 0.04 and absf(cx) <= 3.05)
			line = line or (absf(cx) < 0.04 and absf(cz) >= 1.98 and absf(cz) <= 6.7) or (absf(cz) < 0.03 and absf(cx) <= 3.05)
			if line:
				tone = Color("dcb52c")
			image.set_pixel(px, py, tone)
	_floor_quad("Interior", RED_END, OTHER_END, -28.2, -12.8, FLOOR + 0.006, _painted(image), "OtherCourt")
	var middle := (RED_END + OTHER_END) / 2.0
	for lz in [-13.4, -27.6]:
		_cube("Interior", middle - 0.04, middle + 0.04, FLOOR, FLOOR + 1.55, lz - 0.04, lz + 0.04, _plain("5d6266"))
		_cylinder("Interior", Vector3(middle, FLOOR + 0.04, lz), 0.22, 0.08, _plain("2f3235"))

# --- Downstairs, west and east -------------------------------------------------------------

## A stair beside an exit, as at the left entrance: the full-height grille on the
## corridor's side with its accordion gate folded back at the stair's foot (foot, a
## local z), and the stair's far wall from wall_z0 to wall_z1.
func _stair_well(group: String, stair_group: String, stair: Array, grille_x: float, wall_x: float, foot: float, wall_z0: float, wall_z1: float) -> void:
	var z0: float = stair[2]
	var z1: float = stair[3]
	_grille(stair_group, Vector3(grille_x, FLOOR + 2.1, (z0 + z1) / 2.0), z1 - z0, 4.2, "z", 0.16)
	for k in 6:
		var at := foot + signf((z0 + z1) / 2.0 - foot) * (0.12 + k * 0.1)
		_put(stair_group, Vector3(0.04, 2.6, 0.04), Vector3(grille_x - 0.08, FLOOR + 1.3, at), _plain("b5b9b8"), 0.0, 0.35 * (1 if k % 2 == 0 else -1))
	_wall(group, wall_x, wall_x + 0.2, wall_z0, wall_z1, DECK, _cream())

func _west_ground() -> void:
	var wall := _cream()
	var grey := _plain("c9cbc8")
	# Equipment room, on the left as you come in at the left entrance: its wall on the
	# entry corridor with a door and a big grille window, a grille counter on the
	# lobby, and the blue racks of balls and boxes.
	_wall("WestWalls", 77.5, 77.7, -5.4, W_IN, DECK, wall)
	_wall("WestWalls", 77.5, 77.7, -7.7, -6.6, DECK, wall)
	_cube("WestWalls", 77.5, 77.7, 3.3, DECK, -6.6, -5.4, wall)
	_wall("WestWalls", N_IN, 77.7, -7.7, -7.5, DECK, wall)
	_grille("Interior", Vector3(77.75, 2.4, -2.9), 3.6, 1.8, "z")
	_grille("Interior", Vector3(74.5, 2.2, -7.75), 4.8, 1.4, "x")
	_cube("Interior", 77.46, 77.74, FLOOR, 3.3, -6.62, -6.55, grey)
	_cube("Interior", 77.46, 77.74, FLOOR, 3.3, -5.45, -5.38, grey)
	# The notice board in a blue frame beside the window.
	_cube("Interior", 77.74, 77.78, 1.4, 2.6, -4.95, -4.2, _plain("4d9ad1"))
	_cube("Interior", 77.75, 77.8, 1.5, 2.5, -4.88, -4.27, _plain("efece2"))
	_racks()
	# The deck over the lobby, as in its photo: an edge beam where there is no
	# parapet, deep beams between the column lines, and strip lights.
	_cube("WestStands", MEZZ, 95.0, DECK - 0.6, DECK, WEST, WEST + 0.4, wall)
	for lx in [83.3, 89.1, 95.0]:
		_cube("WestStands", lx - 0.2, lx + 0.2, DECK - 0.75, DECK - 0.3, WEST, W_IN, wall)
	# The north stair, on the right as you come in, behind its grille; the lockers in
	# front of it and a bin.
	_stair_well("WestWalls", "WestStairs", STAIRS[0], 82.1, 83.8, -1.6, -9.44, W_IN)
	_lockers(Vector3(81.7, FLOOR, -4.5), 3.0, "z", -1.0)
	_cylinder("Interior", Vector3(81.6, FLOOR + 0.45, -6.5), 0.25, 0.9, _plain("8f9497"))
	# Lobby: columns under the deck's edge, the grille fence with its two gates, the red
	# lift, the folded tables against the fence, the bins, the wooden cabinet, and the
	# low wooden platform.
	var column := _plain("efede6")
	for lx in [77.5, 83.3, 89.1, 95.0]:
		_cube("Interior", lx - 0.25, lx + 0.25, FLOOR, DECK - 0.3, -11.05, -10.55, column)
	for piece in [[77.8, 80.0], [81.2, 83.0], [83.6, 88.8], [91.6, 94.7]]:
		_grille("Interior", Vector3((piece[0] + piece[1]) / 2.0, FLOOR + 0.8, -10.8), piece[1] - piece[0], 1.6, "x", 0.11)
	var red := _plain("c9302c")
	_cube("Interior", 84.2, 85.4, FLOOR, FLOOR + 0.3, -10.5, -9.6, red)
	for k in 4:
		_cube("Interior", 84.35, 85.25, FLOOR + 0.3 + k * 0.55, FLOOR + 0.36 + k * 0.55, -10.35, -9.75, _plain("d2322d"))
	_cube("Interior", 84.5, 85.1, FLOOR + 2.4, FLOOR + 2.5, -10.2, -9.9, _plain("2d2d30"))
	for k in 2:
		_put("Interior", Vector3(0.95, 1.45, 0.06), Vector3(86.9 + k * 1.0, FLOOR + 0.72, -10.55 + k * 0.05), _plain("2457a8"), 0.0, 0.18)
	_text("Interior", "JOOLA", Vector3(87.4, FLOOR + 0.9, -10.45), 0.3, Color("f4f4f4"))
	for k in 3:
		var bin: String = ["3b8a4a", "e0b833", "29467d"][k]
		_cube("Interior", 91.85 + k * 0.6, 92.35 + k * 0.6, FLOOR, FLOOR + 1.0, -10.6, -10.1, _plain(bin))
	_cube("Interior", 93.8, 94.7, FLOOR, FLOOR + 1.1, -10.6, -9.4, _plain("6e4a30"))
	var wood := _plain("5a4030")
	_cube("Interior", 85.0, 90.5, FLOOR, FLOOR + 0.25, -3.4, -0.6, wood)
	_cube("Interior", 85.0, 90.5, FLOOR + 0.25, FLOOR + 0.5, -2.0, -0.6, wood)
	_cube("Interior", 85.0, 90.5, FLOOR + 0.24, FLOOR + 0.26, -3.4, -3.35, _plain("7a5a40"))
	# Rooms along the front: closed doors on the corridor; a PE office and a locker
	# room, seen from above once the camera cuts their walls away.
	_wall("WestWalls", 94.8, 95.0, -5.7, W_IN, DECK, wall)
	_wall("WestWalls", 95.0, 118.8, -5.7, -5.5, DECK, wall)
	for lx in [105.9, 118.6]:
		_wall("WestWalls", lx, lx + 0.2, -5.5, W_IN, DECK, wall)
	for lx in [100.0, 112.0]:
		_door("Interior", Vector3(lx, FLOOR, -5.73), "x")
	_desk(Vector3(100.5, FLOOR, -2.5))
	_lockers(Vector3(110.0, FLOOR, -0.75), 8.0, "x", -1.0)
	_cube("Interior", 109.0, 116.0, FLOOR + 0.42, FLOOR + 0.48, -3.6, -3.2, _plain("8a6b48"))
	# The right entrance's passage (a mat at the door) and its stair, as at the left.
	_cube("Interior", 119.4, 121.0, FLOOR, FLOOR + 0.015, -1.6, W_IN, _plain("3b3d40"))
	_stair_well("WestWalls", "WestStairs", STAIRS[1], 121.7, 123.4, -1.6, -9.44, W_IN)
	_lockers(Vector3(121.3, FLOOR, -5.2), 2.4, "z", -1.0)
	# The parapet on the court: striped, open at two doorways, a rail on top, two hoops.
	_parapet("WestWalls", [[95.0, 101.0], [102.4, 125.4], [126.8, 129.0]], -10.6, -11.0)
	for hoop in [99.5, 109.5]:
		_wall_hoop("WestWalls", Vector3(hoop, 0, WEST), 1.0)
	# The backstage room: a wall with its door, a table, a rack of costumes, chair stacks.
	_wall("WestWalls", 129.0, 129.4, -7.4, W_IN, DECK, wall)
	_wall("WestWalls", 129.0, 129.4, -10.6, -9.0, DECK, wall)
	_cube("WestWalls", 129.0, 129.4, 3.3, DECK, -9.0, -7.4, wall)
	_cube("Interior", 132.5, 135.0, FLOOR + 0.72, FLOOR + 0.78, -6.2, -4.4, _plain("d8d3c7"))
	for leg in [[132.6, -6.1], [134.9, -6.1], [132.6, -4.5], [134.9, -4.5]]:
		_cube("Interior", leg[0] - 0.03, leg[0] + 0.03, FLOOR, FLOOR + 0.72, leg[1] - 0.03, leg[1] + 0.03, _plain("6c6e70"))
	_cube("Interior", 138.7, 139.9, FLOOR + 1.6, FLOOR + 1.65, -9.0, -1.0, _plain("8a8f92"))
	for k in 14:
		_cube("Interior", 138.8, 139.8, FLOOR + 0.5, FLOOR + 1.6, -8.8 + k * 0.55, -8.5 + k * 0.55,
			_plain(["7c2a3a", "2d4a7a", "c9a43a", "e4e1d8"][k % 4]))
	for lz in [-2.0, -3.0]:
		_chair_stack(Vector3(130.4, FLOOR, lz), 7)
	_chair_stack(Vector3(126.0, FLOOR, -1.2), 6)

func _east_ground() -> void:
	var wall := _cream()
	_parapet("EastWalls", [[77.5, 79.0], [80.6, 88.0], [89.4, 101.0], [102.4, 125.4], [126.8, 129.0]], -30.0, -30.4)
	for hoop in [99.5, 109.5]:
		_wall_hoop("EastWalls", Vector3(hoop, 0, EAST), -1.0)
	# The closed north-east room (switchgear), its door on the back passage.
	_wall("EastWalls", N_IN, 77.5, -30.4, EAST, DECK, wall)
	_wall("EastWalls", 77.5, 77.7, E_IN, -30.4, DECK, wall)
	_door("Interior", Vector3(77.73, FLOOR, -36.5), "z")
	for k in 4:
		_cube("Interior", 72.0 + k * 1.3, 73.1 + k * 1.3, FLOOR, FLOOR + 1.9, -40.6, -40.0, _plain("7d8288"))
	# The north back doorway's passage (a mat) and its stair, as at the left entrance.
	_cube("Interior", 78.6, 80.8, FLOOR, FLOOR + 0.015, E_IN, -39.4, _plain("3b3d40"))
	_stair_well("EastWalls", "EastStairs", STAIRS[2], 82.1, 83.8, -39.4, E_IN, -31.56)
	_lockers(Vector3(81.7, FLOOR, -36.5), 3.0, "z", -1.0, "EastStairs")
	# The east lobby: benches and stacked mats.
	_cube("Interior", 86.0, 92.0, FLOOR + 0.42, FLOOR + 0.48, -39.8, -39.4, _plain("8a6b48"))
	for k in 5:
		_cube("Interior", 86.0, 89.0, FLOOR + k * 0.12, FLOOR + 0.1 + k * 0.12, -37.6, -35.2, _plain("2f5aa0" if k % 2 == 0 else "b33b37"))
	# The closed rooms along the back: a first-aid room and a store.
	_wall("EastWalls", 94.8, 95.0, E_IN, -35.2, DECK, wall)
	_wall("EastWalls", 95.0, 118.8, -35.2, -35.0, DECK, wall)
	for lx in [106.9, 118.6]:
		_wall("EastWalls", lx, lx + 0.2, E_IN, -35.2, DECK, wall)
	for lx in [100.0, 112.0]:
		_door("Interior", Vector3(lx, FLOOR, -34.97), "x")
	for k in 2:
		_cube("Interior", 97.0 + k * 4.0, 99.0 + k * 4.0, FLOOR, FLOOR + 0.6, -39.8, -37.0, _plain("e7e3da"))
	for k in 3:
		_cube("Interior", 108.5 + k * 3.2, 111.2 + k * 3.2, FLOOR, FLOOR + 2.0, -40.6, -40.0, _plain("2f6fb5"))
	# The south back doorway's passage and its stair.
	_cube("Interior", 119.4, 121.0, FLOOR, FLOOR + 0.015, E_IN, -39.4, _plain("3b3d40"))
	_stair_well("EastWalls", "EastStairs", STAIRS[3], 121.7, 123.4, -39.4, E_IN, -31.56)
	# The wall to the east backstage room (its door at z -32..-33.6) and the room's
	# crates, speaker cases and chair stacks.
	_wall("EastWalls", 129.0, 129.4, -40.6, -33.6, DECK, wall)
	_wall("EastWalls", 129.0, 129.4, -32.0, -30.4, DECK, wall)
	_cube("EastWalls", 129.0, 129.4, 3.3, DECK, -33.6, -32.0, wall)
	for k in 6:
		_cube("Interior", 131.0 + (k % 3) * 1.5, 132.3 + (k % 3) * 1.5, FLOOR, FLOOR + 0.9 + (k / 3) * 0.9, -40.6, -39.5,
			_plain("2a2a2e" if k % 2 == 0 else "6f5a3e"))
	_chair_stack(Vector3(139.0, FLOOR, -37.0), 8)
	_chair_stack(Vector3(139.0, FLOOR, -38.0), 6)

## The striped parapet between the hall and the space under a stand: wall pieces
## (stub and upper part), lintels over the doorways, a cap and a rail on top.
func _parapet(group: String, pieces: Array, z0: float, z1: float) -> void:
	var stripes: Material = w.material("stripes")
	for piece in pieces:
		_wall(group, piece[0], piece[1], minf(z0, z1), maxf(z0, z1), DECK - 0.3, stripes)
	for k in range(1, pieces.size()):
		_cube(group, pieces[k - 1][1], pieces[k][0], 3.4, DECK - 0.3, minf(z0, z1), maxf(z0, z1), _cream())
	var start: float = pieces[0][0]
	var stop: float = pieces[-1][1]
	_cube(group, start, stop, DECK - 0.3, DECK + 0.1, minf(z0, z1) - 0.05, maxf(z0, z1) + 0.05, _plain("ece8dc"))

## A grille of vertical bars between two rails, along x or z, centred at at.
func _grille(group: String, at: Vector3, length: float, height: float, along: String, spacing := 0.13) -> void:
	var steel := _plain("a6aaa9")
	var bars := maxi(2, roundi(length / spacing))
	for k in bars + 1:
		var offset := -length / 2.0 + k * length / bars
		var spot := at + (Vector3(offset, 0, 0) if along == "x" else Vector3(0, 0, offset))
		_put(group, Vector3(0.03, height, 0.03), spot, steel)
	for dy in [-height / 2.0, height / 2.0]:
		var size := Vector3(length, 0.05, 0.05) if along == "x" else Vector3(0.05, 0.05, length)
		_put(group, size, at + Vector3(0, dy, 0), steel)

## A closed grey door with a frame, on a wall along x or z.
func _door(group: String, at: Vector3, along: String) -> void:
	var size := Vector3(1.0, 2.2, 0.05) if along == "x" else Vector3(0.05, 2.2, 1.0)
	_put(group, size, at + Vector3(0, 1.1, 0), _plain("aeb2b8"))
	var frame := Vector3(1.2, 0.1, 0.07) if along == "x" else Vector3(0.07, 0.1, 1.2)
	_put(group, frame, at + Vector3(0, 2.25, 0), _plain("f1efe8"))

## A run of grey steel lockers along x or z, their doors (marked in a grid) facing
## facing (+1/-1) across the run.
func _lockers(at: Vector3, length: float, along: String, facing: float, group := "Interior") -> void:
	var body := _plain("a7aba6")
	var line := _plain("6e736f")
	var run := Vector3(1, 0, 0) if along == "x" else Vector3(0, 0, 1)
	var out := Vector3(0, 0, facing) if along == "x" else Vector3(facing, 0, 0)
	_put(group, run * length + out.abs() * 0.55 + Vector3(0, 1.85, 0), at + Vector3(0, 0.925, 0), body)
	var columns := roundi(length / 0.4)
	for k in range(1, columns):
		_put(group, Vector3(0.02, 1.8, 0.02), at + run * (-length / 2.0 + k * length / columns) + out * 0.28 + Vector3(0, 0.925, 0), line)
	for row in [0.62, 1.24]:
		_put(group, run * length + Vector3(0.02, 0.02, 0.02) - run * 0.02, at + out * 0.28 + Vector3(0, row, 0), line)

## The equipment room's blue racks: three shelves of balls and boxes.
func _racks() -> void:
	var blue := _plain("3f87c2")
	var ball := SphereMesh.new()
	ball.radius = 0.12
	ball.height = 0.24
	ball.radial_segments = 8
	ball.rings = 4
	var colours := ["c8642f", "f0eee6", "e3c13b", "2f5aa0", "c8642f", "3b8a4a"]
	for rack in [[Vector3(74.45, 0, -0.85), 5.4, "x"], [Vector3(71.8, 0, -4.35), 6.1, "z"]]:
		var at: Vector3 = rack[0]
		var length: float = rack[1]
		var along := Vector3(1, 0, 0) if rack[2] == "x" else Vector3(0, 0, 1)
		var shelf_size := Vector3(length, 0.04, 0.8) if rack[2] == "x" else Vector3(0.8, 0.04, length)
		for shelf in [0.25, 0.95, 1.65, 2.35]:
			_put("Interior", shelf_size, at + Vector3(0, FLOOR + shelf, 0), blue)
		for k in 6:
			var post := at + along * (-length / 2.0 + k * length / 5.0)
			_put("Interior", Vector3(0.05, 2.4, 0.05), post + Vector3(0, FLOOR + 1.2, 0), blue)
		var count := 0
		for shelf in [0.25, 0.95, 1.65]:
			for k in 10:
				var spot := at + along * (-length / 2.0 + 0.35 + k * (length - 0.7) / 9.0) + Vector3(0, FLOOR + shelf + 0.14, 0)
				if (k + int(shelf * 10.0)) % 4 == 3:
					_put("Interior", Vector3(0.45, 0.3, 0.45), spot + Vector3(0, 0.03, 0), _plain("b49a72"))
				else:
					_mesh("Interior", ball, spot, _plain(colours[(count + k) % colours.size()]))
				count += 1

## A PE office desk with a chair and a filing cabinet.
func _desk(at: Vector3) -> void:
	_put("Interior", Vector3(1.6, 0.05, 0.8), at + Vector3(0, 0.75, 0), _plain("8f6f4c"))
	for dx in [-0.75, 0.75]:
		_put("Interior", Vector3(0.05, 0.75, 0.75), at + Vector3(dx, 0.375, 0), _plain("6e5338"))
	_monobloc("Interior", at + Vector3(0, 0, -0.8), PI)
	_put("Interior", Vector3(0.5, 1.3, 0.6), at + Vector3(2.0, 0.65, 1.1), _plain("8f969c"))

## A white plastic monobloc chair facing turn (0 faces +z).
func _monobloc(group: String, at: Vector3, turn: float) -> void:
	var white := _plain("ecebe5")
	var forward := Vector3(sin(turn), 0, cos(turn))
	var right := Vector3(cos(turn), 0, -sin(turn))
	_put(group, Vector3(0.44, 0.04, 0.42), at + Vector3(0, 0.44, 0), white, turn)
	_put(group, Vector3(0.44, 0.42, 0.04), at - forward * 0.21 + Vector3(0, 0.68, 0), white, turn)
	for sx in [-0.19, 0.19]:
		for sz in [-0.18, 0.18]:
			_put(group, Vector3(0.04, 0.44, 0.04), at + right * sx + forward * sz + Vector3(0, 0.22, 0), white, turn)

## A stack of monobloc chairs.
func _chair_stack(at: Vector3, count: int) -> void:
	var white := _plain("ecebe5")
	for k in count:
		_put("Interior", Vector3(0.44, 0.04, 0.42), at + Vector3(0, 0.44 + k * 0.11, 0), white)
	_put("Interior", Vector3(0.44, 0.45, 0.06), at + Vector3(0, 0.66 + count * 0.11, -0.2), white)
	for sx in [-0.19, 0.19]:
		for sz in [-0.18, 0.18]:
			_put("Interior", Vector3(0.04, 0.44, 0.04), at + Vector3(sx, 0.22, sz), white)

# --- The stands and the balcony --------------------------------------------------------------

## A slab over [x0, x1] x [z0, z1] at the deck, leaving the stair openings in holes.
func _slab(group: String, x0: float, x1: float, z0: float, z1: float, holes: Array, made: Material) -> void:
	var from := x0
	for hole in holes:
		_cube(group, from, hole[0], DECK - 0.3, DECK, z0, z1, made)
		_cube(group, hole[0], hole[1], DECK - 0.3, DECK, z0, hole[2], made)
		_cube(group, hole[0], hole[1], DECK - 0.3, DECK, hole[3], z1, made)
		from = hole[1]
	_cube(group, from, x1, DECK - 0.3, DECK, z0, z1, made)

## A stand: its deck slab (the ceiling of the rooms below) with its two stair openings,
## the bleacher rows rising to the outer wall between the stairs, rails along the court
## and round the openings, and (east) the booth and the scoreboard. side is +1 for the
## west stand, -1 for the east one.
func _stands(group: String, side: float) -> void:
	var slab: Material = w.material("concrete", Color("e4e1d8"))
	var tread := _plain("7f877f")
	var riser := _plain("4f5550")
	var seat := _plain("a7aea6")
	var aisle := _plain("e0bc34")
	var post := _plain("8d938e")
	var rail := _plain("8a8f8d")
	var edge := WEST if side > 0.0 else EAST
	var wall := W_IN if side > 0.0 else E_IN
	var holes: Array = [HOLES[0], HOLES[1]] if side > 0.0 else [HOLES[2], HOLES[3]]
	_slab(group, N_IN, S_IN, minf(edge, wall), maxf(edge, wall), holes, slab)
	# Bleacher rows: a tread, a riser and a bench plank per row, posts under the front.
	var rows := 10 if side > 0.0 else 9
	var first := -9.4 if side > 0.0 else -32.0
	for k in range(1, rows + 1):
		var a := first + side * (k - 1) * 0.9
		var b := wall if k == rows else first + side * k * 0.9
		var h := DECK + 0.4 * k
		_cube(group, ROWS_START, ROWS_END, h - 0.06, h, minf(a, b), maxf(a, b), tread)
		_cube(group, ROWS_START, ROWS_END, h - 0.4, h - 0.06, a - 0.03, a + 0.03, riser)
		if k < rows:
			_cube(group, ROWS_START, ROWS_END, h, h + 0.02, a + side * 0.02, a + side * 0.3, seat)
			var mark := ROWS_START + 4.35
			while mark < ROWS_END - 0.5:
				_cube(group, mark - 0.3, mark + 0.3, h + 0.02, h + 0.03, a + side * 0.02, a + side * 0.3, aisle)
				mark += BAY * 1.5
		var lx := ROWS_START + 0.3
		while lx < ROWS_END and k > 1:
			_cube(group, lx - 0.04, lx + 0.04, DECK, h - 0.4, a - 0.04, a + 0.04, post)
			lx += BAY / 2.0
		# The rows' ends, closed by a side panel.
		for end_x in [ROWS_START, ROWS_END]:
			_cube(group, end_x - 0.03, end_x + 0.03, DECK, h, minf(a, b), maxf(a, b), riser)
	# Rails along the court edge.
	var rail_z := edge + side * 0.05
	_cube(group, MEZZ, STAGE_X, DECK + 0.98, DECK + 1.04, rail_z - 0.03, rail_z + 0.03, rail)
	_cube(group, MEZZ, STAGE_X, DECK + 0.5, DECK + 0.54, rail_z - 0.02, rail_z + 0.02, rail)
	var post_x := MEZZ
	while post_x <= STAGE_X:
		_cube(group, post_x - 0.03, post_x + 0.03, DECK, DECK + 1.04, rail_z - 0.03, rail_z + 0.03, rail)
		post_x += 1.45
	# Rails round each stair opening, open only where the stair arrives (by the court).
	for hole in holes:
		var deep: float = hole[3] if side > 0.0 else hole[2]
		for hx in [hole[0] - 0.05, hole[1] + 0.05]:
			_cube(group, hx - 0.03, hx + 0.03, DECK + 0.98, DECK + 1.04, hole[2], hole[3], rail)
		_cube(group, hole[0], hole[1], DECK + 0.98, DECK + 1.04, deep - 0.03, deep + 0.03, rail)
	# The booth and the scoreboard on the east stand.
	if side < 0.0:
		_cube(group, 101.0, 107.0, 7.35, 10.4, -40.6, -36.5, _cream())
		_cube(group, 101.2, 106.8, 8.4, 9.6, -36.52, -36.48, w.room_glass(true))
		_cube(group, 100.8, 107.2, 10.4, 10.6, -40.7, -36.3, _plain("bdb8ac"))
		_cube(group, 102.2, 105.8, 10.9, 12.4, -36.3, -35.9, _plain("1b1c1f"))
		_text(group, "HOME 54  GUEST 48", Vector3(104.0, 11.65, -35.88), 0.55, Color("f0a43a"))
		_text(group, "Q4  02:15", Vector3(104.0, 11.1, -35.88), 0.4, Color("e2563a"))
		for hanger in [102.6, 105.4]:
			_cube(group, hanger - 0.03, hanger + 0.03, 12.4, roof_under(-36.0), -36.13, -36.07, _plain("6f7472"))

## A practice hoop on a parapet: a backboard, a red rim and a blue pad below.
func _wall_hoop(group: String, at: Vector3, side: float) -> void:
	var face := at.z - side * 0.02
	_cube(group, at.x - 0.9, at.x + 0.9, FLOOR + 2.55, FLOOR + 3.6, face - side * 0.12, face, _plain("e8eef0"))
	_cube(group, at.x - 0.3, at.x + 0.3, FLOOR + 2.6, FLOOR + 3.0, face - side * 0.13, face - side * 0.12, _plain("c8402f"))
	var rim := TorusMesh.new()
	rim.inner_radius = 0.2
	rim.outer_radius = 0.23
	rim.rings = 12
	rim.ring_segments = 4
	_mesh(group, rim, Vector3(at.x, FLOOR + 2.6, face - side * 0.4), _plain("d4462b"))
	_cube(group, at.x - 0.9, at.x + 0.9, FLOOR, FLOOR + 1.8, face - side * 0.12, face, _plain("2f3f8c"))

## The balcony across the north end over the side entrance: its slab, front rail,
## columns and the chairs and stools left on it.
func _mezzanine() -> void:
	var slab: Material = w.material("concrete", Color("e4e1d8"))
	_cube("Mezzanine", N_IN, MEZZ, DECK - 0.3, DECK, EAST, WEST, slab)
	_cube("Mezzanine", MEZZ - 0.3, MEZZ, DECK - 0.6, DECK - 0.3, EAST, WEST, _cream())
	var rail := _plain("8a8f8d")
	_cube("Mezzanine", MEZZ - 0.08, MEZZ - 0.02, DECK + 0.98, DECK + 1.04, EAST, WEST, rail)
	_cube("Mezzanine", MEZZ - 0.07, MEZZ - 0.03, DECK + 0.5, DECK + 0.54, EAST, WEST, rail)
	var lz := WEST
	while lz >= EAST:
		_cube("Mezzanine", MEZZ - 0.08, MEZZ - 0.02, DECK, DECK + 1.04, lz - 0.03, lz + 0.03, rail)
		lz -= 1.45
	for column in [-13.5, -27.5]:
		_cube("Interior", 76.95, 77.45, FLOOR, DECK - 0.3, column - 0.25, column + 0.25, _plain("efede6"))
	for k in 7:
		_monobloc("Mezzanine", Vector3(75.8, DECK, -13.0 - k * 1.1), PI / 2.0)
	_cylinder("Mezzanine", Vector3(76.4, DECK + 0.3, -26.0), 0.2, 0.6, _plain("d9cba8"))

# --- Stairs, the stage ------------------------------------------------------------------------

## Every stair: grey treads with yellow nosings, solid underneath, and handrails.
func _stairs() -> void:
	var tread: Material = w.material("concrete", Color("6f767a"))
	var nosing := _plain("e2c13a")
	var rail := _plain("8a8f8d")
	for index in STAIRS.size():
		var stair: Array = STAIRS[index]
		var group := "WestStairs" if index < 2 else ("EastStairs" if index < 4 else "Interior")
		var risers: int = stair[6]
		var going: float = stair[7]
		var along_x: bool = stair[4] == "x"
		var rising: int = stair[5]
		for k in risers:
			var top := FLOOR + 0.15 * (k + 1)
			var a: float
			var b: float
			if along_x:
				a = stair[0] + k * going if rising > 0 else stair[1] - (k + 1) * going
				b = a + going
				_cube(group, a, b, FLOOR - 0.05, top, stair[2], stair[3], tread)
				var lip := a if rising > 0 else b
				_cube(group, lip - 0.03, lip + 0.03, top - 0.01, top + 0.005, stair[2], stair[3], nosing)
			else:
				a = stair[2] + k * going if rising > 0 else stair[3] - (k + 1) * going
				b = a + going
				_cube(group, stair[0], stair[1], FLOOR - 0.05, top, a, b, tread)
				var lip := a if rising > 0 else b
				_cube(group, stair[0], stair[1], top - 0.01, top + 0.005, lip - 0.03, lip + 0.03, nosing)
		# Sloped handrails along both sides, 1 m over the nosings.
		var rise := 0.15 * risers
		var run := going * risers
		var tilt := -atan2(rise, run) * rising
		var length := sqrt(rise * rise + run * run)
		var mid_y := FLOOR + rise / 2.0 + 1.0
		for edge in [0, 1]:
			if along_x:
				var rz: float = stair[2] + 0.05 if edge == 0 else stair[3] - 0.05
				_put(group, Vector3(0.05, 0.05, length), Vector3((stair[0] + stair[1]) / 2.0, mid_y, rz), rail, PI / 2.0, tilt)
			else:
				var rx: float = stair[0] + 0.05 if edge == 0 else stair[1] - 0.05
				_put(group, Vector3(0.05, 0.05, length), Vector3(rx, mid_y, (stair[2] + stair[3]) / 2.0), rail, 0.0, tilt)

## The stage at the south end: the raised deck, its front curving out towards the
## court (built in thin slices along the curve), the corners cut square where the
## stairs up the side walls land, doors under it, the WELCOME ANGELITES banner
## following the curve, the drum kit, speakers, the line arrays hung over its front
## and the LED screen.
func _stage() -> void:
	var front := _cream()
	var deck := _plain("e3e1da")
	var trim := _plain("cfcbbf")
	var slices := 96
	var step := 19.8 / slices
	for i in slices:
		var a := -30.4 + i * step
		var lip := stage_front(a + step / 2.0)
		_cube("Interior", lip, S_IN, FLOOR - 0.05, STAGE_TOP, a, a + step + 0.01, front)
		_cube("Interior", lip, S_IN, STAGE_TOP - 0.02, STAGE_TOP + 0.005, a, a + step + 0.01, deck)
		_cube("Interior", lip - 0.12, lip, STAGE_TOP - 0.1, STAGE_TOP + 0.02, a, a + step + 0.01, trim)
		var middle := a + step / 2.0
		if middle > -25.6 and middle < -15.4:
			_cube("Interior", lip - 0.06, lip - 0.02, FLOOR + 0.2, STAGE_TOP - 0.08, a, a + step + 0.01,
				_plain("b04a8e") if middle > -16.6 else _plain("5b1d36"))
	for lz in [-14.2, -26.8]:
		var lip := stage_front(lz)
		_cube("Interior", lip - 0.03, lip, FLOOR, FLOOR + 1.05, lz - 0.45, lz + 0.45, w.room_glass(false))
	# WELCOME ANGELITES letter by letter, each set on the curve and turned with it.
	var holder := _add("Interior", Node3D.new())
	holder.name = "WELCOME ANGELITES"
	var words := "WELCOME ANGELITES"
	var spacing := 0.6
	for i in words.length():
		if words[i] == " ":
			continue
		var lz := SIDE_DOOR - words.length() * spacing / 2.0 + (i + 0.5) * spacing
		var slope := 2.0 * CURVE * (lz - SIDE_DOOR) / (9.5 * 9.5)
		var letter := _text("Interior", words[i], Vector3(stage_front(lz) - 0.16, FLOOR + 0.62, lz), 1.25, Color("f6f3ee"),
			Basis(Vector3.UP, atan2(-1.0, slope)))
		letter.reparent(holder)
	# Drum kit on the west front corner.
	var shell := _plain("1f1f23")
	_cylinder("Interior", Vector3(132.6, STAGE_TOP + 0.28, -13.4), 0.28, 0.4, shell, Basis(Vector3.RIGHT, PI / 2.0))
	for drum in [[132.1, -12.9, 0.18], [133.1, -12.9, 0.16], [133.2, -13.9, 0.2]]:
		_cylinder("Interior", Vector3(drum[0], STAGE_TOP + 0.6, drum[1]), drum[2], 0.22, shell)
	for cymbal in [[131.9, -13.9], [133.4, -12.6]]:
		_cylinder("Interior", Vector3(cymbal[0], STAGE_TOP + 1.05, cymbal[1]), 0.25, 0.01, _plain("c9a64a"))
		_cube("Interior", cymbal[0] - 0.01, cymbal[0] + 0.01, STAGE_TOP, STAGE_TOP + 1.05, cymbal[1] - 0.01, cymbal[1] + 0.01, _plain("9ea3a6"))
	# A speaker on a stand at each corner, beside the stair's top.
	for lz in [-11.3, -29.7]:
		_cube("Interior", 131.6, 132.2, STAGE_TOP, STAGE_TOP + 0.9, lz - 0.3, lz + 0.3, shell)
		_cube("Interior", 131.85, 131.95, STAGE_TOP + 0.9, STAGE_TOP + 2.0, lz - 0.05, lz + 0.05, _plain("6f7472"))
		_cube("Interior", 131.6, 132.2, STAGE_TOP + 2.0, STAGE_TOP + 2.8, lz - 0.25, lz + 0.25, shell)
	# The line-array speakers hung high over the stage's front, as in the photos: a
	# curved column of cabinets on a bar, its wires up to the roof truss.
	for lz in [-14.5, -26.5]:
		for k in 7:
			_put("Interior", Vector3(0.65, 0.36, 1.0), Vector3(130.2 + k * 0.035 * k, 11.0 - k * 0.38, lz), shell, 0.0, 0.0)
		_cube("Interior", 129.9, 130.5, 11.2, 11.28, lz - 0.55, lz + 0.55, _plain("3a3b3e"))
		for dz in [-0.45, 0.45]:
			_cube("Interior", 130.18, 130.22, 11.28, roof_under(lz) - 0.1, lz + dz - 0.02, lz + dz + 0.02, _plain("2a2b2e"))
	# The LED screen on its truss (hidden from the backstage side by hidden()).
	_cube("StageBack", 136.45, 136.75, STAGE_TOP, STAGE_TOP + 4.6, -25.0, -16.0, _plain("141518"))
	_cube("StageBack", 136.42, 136.44, STAGE_TOP + 0.2, STAGE_TOP + 4.4, -24.8, -16.2, _plain("23262c"))
	for lz in [-25.15, -15.85]:
		_cube("StageBack", 136.5, 136.7, STAGE_TOP, STAGE_TOP + 4.9, lz - 0.1, lz + 0.1, _plain("9da2a5"))
	_chair_stack(Vector3(137.6, STAGE_TOP, -27.4), 6)
	_cube("Interior", 138.0, 139.2, STAGE_TOP, STAGE_TOP + 0.6, -14.8, -13.6, _plain("2b2b2f"))

## The walls round the stage and the stands' ends: the flanking walls up to the roof
## (open at the backstage doors), the big end walls above the stands curving round to
## the stage with their striped panels, the windows over the stage, the north end's
## windows and panels, and the louvres along the back wall.
func _end_walls() -> void:
	var cream := _cream()
	var stripes: Material = w.material("stripes")
	for flank in [["WestStands", -11.0, -10.6], ["EastStands", -30.4, -30.0]]:
		var group: String = flank[0]
		var top := roof_under(flank[1])
		_wall(group, STAGE_X, 136.2, flank[1], flank[2], top, cream, FLOOR)
		_wall(group, 137.8, S_IN, flank[1], flank[2], top, cream, FLOOR)
		_cube(group, 136.2, 137.8, STAGE_TOP + 2.4, top, flank[1], flank[2], cream)
	# The end walls: thin slices along the curve from the outer wall to the stage's
	# corner, each up to the roof, with the striped panel on their face.
	for end in [["WestStands", W_IN, -10.6], ["EastStands", -30.4, E_IN]]:
		var group: String = end[0]
		var z0: float = minf(end[1], end[2])
		var z1: float = maxf(end[1], end[2])
		var count := 24
		var step := (z1 - z0) / count
		for i in count:
			var a := z0 + i * step
			var middle := a + step / 2.0
			var x := end_wall(middle)
			_cube(group, x, x + 0.4, DECK, roof_under(middle), a, a + step + 0.01, cream)
			var from_outer := absf(middle - (W_IN if group == "WestStands" else E_IN))
			if from_outer > 1.0 and from_outer < 9.2:
				_cube(group, x - 0.06, x, 6.0, 12.4, a, a + step + 0.01, stripes)
	# The windows over the stage (bright in the day).
	var glass: Material = w.glow(Color("e9eeee"), 0.55, 0.0)
	var mullion := _plain("f4f3ee")
	for window in [[SIDE_DOOR, 5.6, 7.4, 14.0, 5], [-14.6, 3.4, 7.4, 11.3, 3], [-26.4, 3.4, 7.4, 11.3, 3]]:
		_window("Interior", S_IN - 0.02, -1.0, window, glass, mullion)
	# The north wall inside: its windows and panels go with the wall when it is cut away.
	for window in [[SIDE_DOOR, 5.6, 7.4, 14.0, 5], [-8.0, 3.4, 7.4, 11.3, 3], [-33.0, 3.4, 7.4, 11.3, 3]]:
		_window("NorthWall", N_IN + 0.02, 1.0, window, glass, mullion)
	for lz in [[-11.2, -15.8], [-25.2, -29.8]]:
		_cube("NorthWall", N_IN, N_IN + 0.06, 7.4, 12.4, lz[1], lz[0], stripes)
	# The back wall inside: louvred openings over the top row of the east stand (they
	# go with the back wall when it is cut away).
	for bay in 12:
		var centre := NORTH + (bay + 0.5) * BAY
		_cube("BackWall", centre - 2.2, centre + 2.2, 9.0, 10.1, E_IN, E_IN + 0.04, glass)
		for k in 6:
			_cube("BackWall", centre - 2.2, centre + 2.2, 9.1 + k * 0.18, 9.14 + k * 0.18, E_IN + 0.04, E_IN + 0.08, mullion)

## A tall window on an end wall seen from inside: glass, mullions and a white frame.
func _window(group: String, face: float, out: float, window: Array, glass: Material, mullion: Material) -> void:
	var centre: float = window[0]
	var width: float = window[1]
	var y0: float = window[2]
	var y1: float = window[3]
	var panes: int = window[4]
	_cube(group, face, face + out * 0.04, y0, y1, centre - width / 2.0, centre + width / 2.0, glass)
	for k in panes + 1:
		var lz := centre - width / 2.0 + k * width / panes
		_cube(group, face + out * 0.04, face + out * 0.1, y0, y1, lz - 0.05, lz + 0.05, mullion)
	var y := y0
	while y <= y1 + 0.01:
		_cube(group, face + out * 0.04, face + out * 0.1, y - 0.05, y + 0.05, centre - width / 2.0, centre + width / 2.0, mullion)
		y += (y1 - y0) / 2.0 if width > 4.0 else (y1 - y0)
	_cube(group, face, face + out * 0.14, y0 - 0.2, y0, centre - width / 2.0 - 0.3, centre + width / 2.0 + 0.3, mullion)

# --- Things in the hall ---------------------------------------------------------------------

func _hall_things() -> void:
	# Portable hoops behind each baseline, facing the court.
	_hoop(COURT_N - 0.4, 1.0)
	_hoop(COURT_S + 0.4, -1.0)
	# The angel trophy in the main court's south-east corner, chairs stacked beside it.
	var red := _plain("c4302f")
	var white := _plain("f2f1ec")
	_cylinder("Interior", Vector3(119.6, FLOOR + 0.12, -29.3), 0.5, 0.24, red)
	_cube("Interior", 119.45, 119.75, FLOOR + 0.24, FLOOR + 2.2, -29.45, -29.15, red)
	_cube("Interior", 119.3, 119.9, FLOOR + 2.1, FLOOR + 2.3, -29.55, -29.05, white)
	for side: float in [-1.0, 1.0]:
		_put("Interior", Vector3(0.9, 1.4, 0.06), Vector3(119.6 + side * 0.5, FLOOR + 1.8, -29.3), white)
	for k in 3:
		_chair_stack(Vector3(117.4 + k * 0.6, FLOOR, -29.4), 6 + k)
	# A green ball left on the other court, as in the photo.
	var ball := SphereMesh.new()
	ball.radius = 0.12
	ball.height = 0.24
	_mesh("Interior", ball, Vector3(124.7, FLOOR + 0.12, -20.3), _plain("3fa046"))

## A portable hoop: a blue padded base behind the baseline, a white frame reaching
## over it to the backboard, a red rim. dir is +1 at the north end (facing south).
func _hoop(base: float, dir: float) -> void:
	var white := _plain("eef0ef")
	_cube("Interior", base - 1.1, base + 1.1, FLOOR, FLOOR + 0.75, -21.3, -19.7, _plain("2b3f93"))
	for lz in [-20.9, -20.1]:
		_put("Interior", Vector3(0.1, 2.8, 0.1), Vector3(base - dir * 0.4, FLOOR + 2.1, lz), white)
		_put("Interior", Vector3(0.08, 0.08, 2.3), Vector3(base + dir * 0.55, FLOOR + 2.6, lz), white, PI / 2.0, -dir * 0.55)
	var board := base + dir * 1.6
	_cube("Interior", board - 0.04, board + 0.04, FLOOR + 2.9, FLOOR + 3.95, -21.4, -19.6, _plain("dfe9ec"))
	_cube("Interior", board - 0.05, board + 0.05, FLOOR + 3.0, FLOOR + 3.45, -20.8, -20.2, _plain("e4e8ea"))
	var rim := TorusMesh.new()
	rim.inner_radius = 0.21
	rim.outer_radius = 0.24
	rim.rings = 12
	rim.ring_segments = 4
	_mesh("Interior", rim, Vector3(board + dir * 0.3, FLOOR + 3.05, -20.5), _plain("d4462b"))

# --- The roof structure -------------------------------------------------------------------

## The group of a piece of roof structure in bay i at local z: its bay's west or east half.
static func _bay(i: int, lz: float) -> String:
	return "Ceiling%d%s" % [i, "W" if lz > SIDE_DOOR else "E"]

## Steel trusses across every bay line, purlins between them, the hanging acoustic
## panels in red, yellow, beige and grey, the high-bay lights and two big fans. Each
## bay's west and east halves are their own groups.
func _ceiling() -> void:
	var steel := _plain("c8cbc8")
	var dark := _plain("1d1e21")
	var lens: Material = w.glow(Color("fff4de"), 1.6, 2.4)
	var colours: Array[Material] = [_plain("c8343a"), _plain("dcb43c"), _plain("d9c4a2"), _plain("9c9c99"), _plain("c9a46a")]
	var random := RandomNumberGenerator.new()
	random.seed = 1612
	for i in 12:
		var start := NORTH + i * BAY
		if i < 11:
			_truss(i, start + BAY, steel)
		var lz := W_IN - 1.0
		while lz > E_IN:
			_put(_bay(i, lz), Vector3(BAY, 0.12, 0.08), Vector3(start + BAY / 2.0, roof_under(lz) - 0.06, lz), steel)
			lz -= 2.4
		for j in 4:
			lz = -2.2
			while lz > -39.0:
				if random.randf() > 0.18:
					var drop := 1.3 + random.randi_range(0, 3) * 0.3
					var at := Vector3(start + 0.75 + j * 1.45 + random.randf_range(-0.15, 0.15), roof_under(lz) - drop, lz)
					_put(_bay(i, lz), Vector3(1.15, 0.07, 0.7), at, colours[random.randi_range(0, 4)])
				lz -= 1.6
		for row in [-6.5, -13.5, -20.5, -27.5, -34.5]:
			var at := Vector3(start + BAY / 2.0, roof_under(row) - 2.6, row)
			_put(_bay(i, row), Vector3(0.5, 0.3, 0.5), at, _plain("8c9093"))
			_put(_bay(i, row), Vector3(0.44, 0.04, 0.44), at - Vector3(0, 0.17, 0), lens)
		if i == 3 or i == 6:
			var hub := Vector3(start + BAY / 2.0, 10.4, SIDE_DOOR)
			_put(_bay(i, SIDE_DOOR), Vector3(0.08, roof_under(SIDE_DOOR) - 10.4, 0.08), hub + Vector3(0, (roof_under(SIDE_DOOR) - 10.4) / 2.0, 0), dark)
			_put(_bay(i, SIDE_DOOR), Vector3(0.6, 0.35, 0.6), hub, _plain("e8e6df"))
			for k in 8:
				var a := k * PI / 4.0 + 0.2
				var blade := hub + Vector3(cos(a), 0, -sin(a)) * 1.95 - Vector3(0, 0.1, 0)
				_put(_bay(i, blade.z), Vector3(3.4, 0.04, 0.24), blade, _plain("d5d4ce"), a)

## A steel truss across the hall at lx (bay i's south line): top and bottom chords
## following the roof, zigzag web members between them.
func _truss(i: int, lx: float, steel: Material) -> void:
	var step := 40.2 / 24.0
	for k in 24:
		var a := W_IN - k * step
		var b := a - step
		var group := _bay(i, (a + b) / 2.0)
		for depth: float in [0.1, 1.5]:
			var ya := roof_under(a) - depth
			var yb := roof_under(b) - depth
			_member(group, lx, Vector2(a, ya), Vector2(b, yb), 0.14, steel)
		var up := k % 2 == 0
		_member(group, lx, Vector2(a, roof_under(a) - (1.5 if up else 0.1)), Vector2(b, roof_under(b) - (0.1 if up else 1.5)), 0.07, steel)
		_member(group, lx, Vector2(a, roof_under(a) - 0.1), Vector2(a, roof_under(a) - 1.5), 0.07, steel)

## A straight steel member in the plane x = lx, between two (z, y) points.
func _member(group: String, lx: float, from: Vector2, to: Vector2, thick: float, steel: Material) -> void:
	var d := to - from
	var length := d.length()
	var theta := atan2(-d.y, d.x)
	_put(group, Vector3(thick, thick, length), Vector3(lx, (from.y + to.y) / 2.0, (from.x + to.x) / 2.0), steel, 0.0, theta)

# --- Lights -------------------------------------------------------------------------------------

## The hall's lights, on at every hour once the student is inside (aps.gd shows the
## group then): high bays over the court, lamps under the stands, in the rooms and backstage.
func _lights() -> void:
	for lx in [80.0, 91.0, 102.0, 113.0, 124.0]:
		for lz in [-14.5, -26.5]:
			_light(Vector3(lx, 9.6, lz), 1.25, 16.0)
	_light(Vector3(134.0, 7.0, SIDE_DOOR), 1.1, 12.0)
	for spot in [Vector2(74.5, -4.0), Vector2(80.0, -4.5), Vector2(88.0, -6.0), Vector2(100.0, -8.2), Vector2(112.0, -8.2),
			Vector2(126.0, -6.0), Vector2(120.2, -3.0), Vector2(134.5, -5.5), Vector2(100.0, -3.0), Vector2(112.0, -3.0),
			Vector2(80.0, -36.0), Vector2(89.0, -35.5), Vector2(100.0, -32.7), Vector2(112.0, -32.7), Vector2(126.0, -35.0),
			Vector2(120.2, -38.0), Vector2(134.5, -35.5), Vector2(74.5, -15.0), Vector2(74.5, -26.0), Vector2(100.0, -38.0),
			Vector2(112.0, -38.0), Vector2(74.5, -35.5), Vector2(138.5, -20.5)]:
		_light(Vector3(spot.x, 4.1, spot.y), 0.8, 7.0)
	# Strip lights under the deck, as in the lobby photo.
	var tube: Material = w.glow(Color("f6f4ec"), 1.2, 1.6)
	for spot in [Vector2(80.0, -4.5), Vector2(86.2, -6.0), Vector2(92.0, -6.0), Vector2(100.0, -8.2), Vector2(112.0, -8.2),
			Vector2(126.0, -6.0)]:
		_put("WestStands", Vector3(1.2, 0.05, 0.2), Vector3(spot.x, DECK - 0.33, spot.y), tube)
	for spot in [Vector2(80.0, -36.0), Vector2(89.0, -35.5), Vector2(100.0, -32.7), Vector2(112.0, -32.7), Vector2(126.0, -35.0)]:
		_put("EastStands", Vector3(1.2, 0.05, 0.2), Vector3(spot.x, DECK - 0.33, spot.y), tube)

func _light(at: Vector3, energy: float, reach: float) -> void:
	var light := OmniLight3D.new()
	light.light_color = Color("fff1dc")
	light.light_energy = energy
	light.omni_range = reach
	light.omni_attenuation = 1.2
	light.shadow_enabled = false
	light.position = at
	_add("InteriorLights", light)

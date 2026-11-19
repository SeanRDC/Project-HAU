extends RefCounted
## The Don Juan D. Nepomuceno Building, the Main Building (DJDN), on its plan plot, from the
## photos in assets/MAIN BUILDINGS DJDN/ (the front, the portico, the lobby; the courtyard as it
## was before the works, from INSIDE DJN BUILDING.jpg and CLOSER VIEW INSIDE DJN.jpg).
##
## The front faces west onto the drive from the angel fountain to the car gate: two storeys of
## cream wall over a plinth, a string course and a dentil cornice under a plain parapet, each
## wing with one single window at its outer end and four pairs, in white frames, on both floors;
## in the middle the pavilion, a little proud of the wings, with the portico in front of it (four
## white Ionic columns, HOLY ANGEL UNIVERSITY on the entablature, the seal in the pediment, five
## terrazzo steps up to the porch) and three pedimented doors into the lobby; the dark cross on the
## pavilion north of the portico; a balustrade round the pavilion's roof terrace; low roofs behind
## the parapets. The front is symmetric about the portico (the drone shot).
##
## Built straight in world coordinates (the plot is square to x). Sizes are from the photos
## (people, steps, doors and the window rhythm for scale), not surveyed. The north face above the
## Student Center's roof, the south and the east faces are not in the photos: the front's
## vocabulary without the portico.

## The front: the wings' face, the pavilion's, the porch's edge; the portico's middle line.
const FRONT := -156.2
const PAVILION_FACE := -156.8
const PORCH := -159.1
const CENTRE_Z := 107.7
## The plot's other edges (the Student Center's back wall is on NORTH).
const NORTH := 88.4
const SOUTH := 127.0
const EAST := -90.1
## The pavilion's width (z), the porch's and the steps'.
const PAVILION := Vector2(102.2, 113.2)
const PORCH_Z := Vector2(103.4, 112.0)
const STEPS_Z := Vector2(103.0, 112.4)
const STEPS_FOOT := -161.1
const STEP_COUNT := 5
## The four columns (z) on one line (x), and the three doors between them.
const COLUMN_X := -158.55
const COLUMNS: Array[float] = [103.8, 106.4, 109.0, 111.6]
const DOORS: Array[float] = [105.1, 107.7, 110.3]
const DOOR_W := 1.5
const DOOR_H := 3.0
## Levels: the drive's walks, the porch, lobby, corridors and galleries (five steps up), the
## courtyard's tiles, the stage, the upper floor; the cornice's top and the parapet's.
const WALK_Y := -0.04
const FLOOR_Y := 0.9
const YARD_Y := 0.45
const STAGE_Y := 1.35
const UPPER_Y := 5.3
const CORNICE := 10.2
const PARAPET := 10.9
## Inside the plan: the front block's courtyard side, the corridor along it, the north and south
## wings' rooms and galleries, the theatre's front.
const BACK := -146.0
const CORRIDOR := -149.0
const NORTH_ROOMS := 94.4
const NORTH_WING := 97.4
const SOUTH_WING := 118.0
const SOUTH_ROOMS := 121.0
const THEATRE_X := -103.0
## The Student Center's courtyard gate leads south through the north wing here (x).
const PASSAGE := Vector2(-107.1, -104.1)
const PASSAGE_TOP := 3.9
## The building's node (the checks find it).
const BUILT_NAME := "DjdnBuilding"
## The colours, from the photos in daylight: the warm cream-yellow walls, the white trim, the
## plinth a shade deeper, the steps' pink-grey terrazzo, the cross's dark blue.
const WALL := Color("ead497")
const TRIM := Color("f3efe2")
const PLINTH := Color("d6bd7e")
const TERRAZZO := Color("d6c9c4")
const CROSS := Color("2c3550")
const ROOF := Color("b9bcb8")

## The grounds in front (x): the drive, one way along the front from the angel fountain's apron to
## the car gate on the fence line; the parking bays along the wings (empty: no cars); the garden
## between them and the front. At the portico the bays give way to the forecourt up to the steps.
const DRIVE := Vector2(-172.1, -166.75)
const DRIVE_Y := -0.19
const PARKING := Vector2(-166.75, -161.75)
const GARDEN := Vector2(-161.75, FRONT)
## Along z: the north run of bays (from the Student Center's brick apron's hedge), the forecourt
## in front of the portico, the south run on to the fence.
const NORTH_BAYS := Vector2(88.9, 101.4)
const FORECOURT := Vector2(101.4, 114.0)
const BAY := 2.5
## The zebra from the brick apron's west end across the drive to the flag circle's steps (z),
## through a gap in the apron's hedge (StudentCenter.HEDGE_GAP).
const ZEBRA := Vector2(85.8, 88.2)
## The fence on the street (Holy Angel Avenue), from the side gate's west end to the building's
## south-west corner: the plan's Side Gate 1 strip's street edge, 25.6 degrees off x.
const FENCE_A := Vector2(-207.6, 102.3)
const FENCE_SLOPE := 16.3 / 34.1
## Facing the front from the drive the camera stands over the flag circle: everything west of
## this line (through the ground) is cut away.
const CUT_X := -172.7
## The garden's lamp posts, the forecourt's two, and the urn posts on the garden's fence.
const LAMPS: Array[Vector2] = [Vector2(-161.3, 90.6), Vector2(-161.3, 97.8), Vector2(-166.3, 101.9),
	Vector2(-166.3, 113.5), Vector2(-161.3, 117.6), Vector2(-161.3, 123.0)]
const URN_POSTS: Array[Vector2] = [Vector2(-161.6, 89.3), Vector2(-161.6, 94.2), Vector2(-161.6, 101.1),
	Vector2(-161.6, 114.3), Vector2(-161.6, 121.2)]

## The fence line's z at x (the street edge of the plan's Side Gate 1 strip, carried on east).
static func fence_z(x: float) -> float:
	return FENCE_A.y + (x - FENCE_A.x) * FENCE_SLOPE

## The drive, the bays, the forecourt and the zebra's end in the brick apron's hedge.
static func on_grounds(x: float, z: float) -> bool:
	if z > fence_z(x) - 0.45:
		return false
	if x >= DRIVE.x and x <= DRIVE.y:
		return z >= 70.0
	if x > DRIVE.y and x < -166.0:
		return z >= ZEBRA.x and z <= ZEBRA.y # the gap in the brick apron's hedge
	if x > DRIVE.y and x <= PARKING.y:
		return z >= NORTH_BAYS.x
	return x > PARKING.y and x <= STEPS_FOOT and z >= FORECOURT.x and z <= FORECOURT.y

## The steps and the porch, up to the pavilion's doors.
static func on_steps(x: float, z: float) -> bool:
	if x > STEPS_FOOT and x <= PORCH and z >= STEPS_Z.x + 0.05 and z <= STEPS_Z.y - 0.05:
		return true
	return x > PORCH and x < PAVILION_FACE and z >= PORCH_Z.x and z <= PORCH_Z.y

static func walkable(x: float, z: float) -> bool:
	return on_grounds(x, z) or on_steps(x, z)

static func blocked(x: float, z: float, _level := NAN) -> bool:
	if not walkable(x, z):
		return false
	for at in LAMPS:
		if absf(x - at.x) < 0.25 and absf(z - at.y) < 0.25:
			return true
	if x > PORCH:
		for column in COLUMNS:
			if Vector2(x, z).distance_to(Vector2(COLUMN_X, column)) < 0.55:
				return true
	return false

static func floor_height(x: float, z: float, _level := NAN) -> float:
	if on_steps(x, z):
		if x > PORCH:
			return FLOOR_Y
		var step := clampi(floori((x - STEPS_FOOT) / ((PORCH - STEPS_FOOT) / STEP_COUNT)), 0, STEP_COUNT - 1)
		return WALK_Y + (FLOOR_Y - WALK_Y) / STEP_COUNT * (step + 1)
	if not on_grounds(x, z):
		return NAN
	if x >= DRIVE.x and x <= DRIVE.y - 0.15:
		return DRIVE_Y
	if x > DRIVE.y - 0.15 and x <= DRIVE.y + 0.12 and z >= 76.0:
		return 0.0 # the kerb
	return WALK_Y

## How far the camera faces the front from the grounds (east, a quarter turn): 1 on the drive,
## the bays, the forecourt and the steps south of the fountain's apron, eased in across its edge.
## aps.gd multiplies it by what the boulevard's view leaves (that covers the fountain's apron and
## the Student Center's brick apron).
static func front_for(x: float, z: float) -> float:
	var along := smoothstep(79.0, 82.0, z) * (1.0 - smoothstep(130.0, 132.0, z))
	var across := smoothstep(DRIVE.x - 2.5, DRIVE.x - 1.0, x) * (1.0 - smoothstep(PAVILION_FACE + 0.2, FRONT + 0.4, x))
	return along * across

## The front's windows (z), the same on both floors: on each wing one single window at its outer
## end and four pairs towards the pavilion, mirrored about the portico.
static func front_windows() -> Array[float]:
	var north: Array[float] = [89.7]
	for pair in [92.6, 95.3, 98.0, 100.7]:
		north.append(pair - 0.6)
		north.append(pair + 0.6)
	var all: Array[float] = []
	for z in north:
		all.append(z)
		all.append(2.0 * CENTRE_Z - z)
	all.sort()
	return all

var w: RefCounted

func build(world_builder: RefCounted) -> void:
	w = world_builder
	w._flush()
	var saved: Node3D = w.root
	var building := Node3D.new()
	building.name = BUILT_NAME
	saved.add_child(building)
	w.root = building
	_masses()
	_front()
	_pavilion()
	_portico()
	_steps()
	_other_faces()
	_roofs()
	w._flush()
	w.root = saved
	_drive()
	_parking()
	_garden()
	_lamps()
	w._flush()

# --- Helpers ------------------------------------------------------------------------------

## A box from x0..x1, y0..y1, z0..z1 (any order).
func _block(x0: float, x1: float, y0: float, y1: float, z0: float, z1: float, made: Material) -> void:
	w.box(Vector3(absf(x1 - x0), absf(y1 - y0), absf(z1 - z0)), Vector3((x0 + x1) / 2.0, (y0 + y1) / 2.0, (z0 + z1) / 2.0), made)

func _cylinder(top: float, bottom: float, height: float, at: Vector3, made: Material, segments := 14) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = top
	mesh.bottom_radius = bottom
	mesh.height = height
	mesh.radial_segments = segments
	mesh.rings = 1
	return w._mesh(mesh, at, made)

## A sign facing west (the drive): Label3D faces +z, turned a quarter to face -x.
func _west_label(text: String, at: Vector3, width: float, height: float, ink: Color) -> Label3D:
	var label: Label3D = w.panel(text, at, width, height, ink)
	label.rotation.y = -PI / 2.0
	label.double_sided = false
	return label

## A triangular prism: a pediment's tympanum, its base from z0 to z1 at y0 rising to `apex` in
## the middle, from x0 (its face) back to x1.
func _gable(x0: float, x1: float, z0: float, z1: float, y0: float, apex: float, made: Material) -> void:
	var tool := SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	var mid := (z0 + z1) / 2.0
	var front := [Vector3(x0, y0, z0), Vector3(x0, y0, z1), Vector3(x0, apex, mid)]
	var back := [Vector3(x1, y0, z0), Vector3(x1, y0, z1), Vector3(x1, apex, mid)]
	var faces := [[front[0], front[2], front[1]], [back[0], back[1], back[2]],
		[front[0], back[0], back[2]], [front[0], back[2], front[2]],
		[front[1], front[2], back[2]], [front[1], back[2], back[1]],
		[front[0], front[1], back[1]], [front[0], back[1], back[0]]]
	var middle := Vector3((x0 + x1) / 2.0, (y0 * 2.0 + apex) / 3.0, mid)
	for face in faces:
		var normal: Vector3 = (face[1] - face[0]).cross(face[2] - face[0]).normalized()
		if normal.dot((face[0] + face[1] + face[2]) / 3.0 - middle) < 0.0:
			normal = -normal
		# Both windings, so the outward side shows whichever way the engine culls.
		for order in [[0, 1, 2], [0, 2, 1]]:
			for k in order:
				tool.set_normal(normal)
				tool.add_vertex(face[k])
	w._mesh(w.commit(tool), Vector3.ZERO, made)

# --- The masses -----------------------------------------------------------------------------

## The closed parts as solid blocks to the cornice: the rooms either side of the lobby in the
## front block, the rooms of the north and south wings (the north wing open at the Student
## Center gate's passage on the ground floor), and the theatre block, taller.
func _masses() -> void:
	var wall: Material = w.material("stucco", WALL)
	_block(FRONT, CORRIDOR, 0.0, CORNICE, NORTH, PAVILION.x, wall)
	_block(FRONT, CORRIDOR, 0.0, CORNICE, PAVILION.y, SOUTH, wall)
	# The north wing's rooms (above the Student Center's back wall on its north face).
	_block(CORRIDOR, PASSAGE.x, 0.0, CORNICE, NORTH, NORTH_ROOMS, wall)
	_block(PASSAGE.y, THEATRE_X, 0.0, CORNICE, NORTH, NORTH_ROOMS, wall)
	_block(PASSAGE.x, PASSAGE.y, PASSAGE_TOP, CORNICE, NORTH, NORTH_ROOMS, wall)
	_block(CORRIDOR, THEATRE_X, 0.0, CORNICE, SOUTH_ROOMS, SOUTH, wall)
	# The theatre: its front on the courtyard at THEATRE_X, its back on the lawn by MGN.
	_block(THEATRE_X, EAST, 0.0, 12.4, NORTH, SOUTH, wall)

# --- The front ------------------------------------------------------------------------------

## The wings' face: the plinth, the windows on both floors, the string course, the dentil
## cornice and the parapet, and the gaps of the corridor's ends (none on the front).
func _front() -> void:
	var trim: Material = w.material("stucco", TRIM)
	var plinth: Material = w.material("stucco", PLINTH)
	var dentil: Material = w.material("plain", TRIM)
	var shade: Material = w.material("plain", TRIM.darkened(0.18))
	for span in [Vector2(NORTH, PAVILION.x), Vector2(PAVILION.y, SOUTH)]:
		var z0: float = span.x
		var z1: float = span.y
		_block(FRONT - 0.06, FRONT + 0.01, 0.0, FLOOR_Y, z0, z1, plinth)
		_block(FRONT - 0.09, FRONT + 0.01, FLOOR_Y - 0.06, FLOOR_Y + 0.06, z0, z1, trim)
		# The string course between the floors: a band and a lip.
		_block(FRONT - 0.1, FRONT + 0.01, 4.9, 5.25, z0, z1, trim)
		_block(FRONT - 0.16, FRONT + 0.01, 5.25, 5.36, z0, z1, trim)
		# The cornice: frieze, dentils, the corona standing out, its cyma, and the parapet.
		_block(FRONT - 0.08, FRONT + 0.01, 9.3, 9.62, z0, z1, trim)
		var z := z0 + 0.12
		while z < z1 - 0.1:
			w.box(Vector3(0.12, 0.12, 0.1), Vector3(FRONT - 0.14, 9.68, z), dentil)
			z += 0.2
		_block(FRONT - 0.36, FRONT + 0.01, 9.75, 9.98, z0 - 0.0, z1, trim)
		_block(FRONT - 0.32, FRONT + 0.01, 9.74, 9.76, z0, z1, shade)
		_block(FRONT - 0.42, FRONT + 0.01, 9.98, CORNICE, z0, z1, trim)
		_block(FRONT - 0.04, FRONT + 0.25, CORNICE, PARAPET, z0, z1, w.material("stucco", WALL))
		_block(FRONT - 0.1, FRONT + 0.31, PARAPET, PARAPET + 0.08, z0, z1, trim)
		# The quoins at the wings' outer corners, as flat bands up the corner.
		var corner := z0 if z0 == NORTH else z1
		var inward := 1.0 if z0 == NORTH else -1.0
		_block(FRONT - 0.07, FRONT + 0.01, FLOOR_Y, 9.3, corner, corner + inward * 0.45, trim)
	for z in front_windows():
		for y in [2.95, 7.45]:
			w.framed_window(Vector3(FRONT, y, z), 0.9, 1.85, Vector3(-1, 0, 0), false, 1, TRIM)
			# A white head over each window, and a transom under its top third.
			_block(FRONT - 0.14, FRONT + 0.01, y + 1.04, y + 1.2, z - 0.58, z + 0.58, trim)
			_block(FRONT - 0.11, FRONT - 0.03, y + 0.3, y + 0.34, z - 0.45, z + 0.45, dentil)

# --- The pavilion and the portico -------------------------------------------------------------

## The pavilion behind the portico: its front a little proud of the wings, open at the three
## doors (each in a white architrave under a small pediment on consoles), white pilasters behind
## the columns, the dark cross north of the porch, its own cornice and the roof terrace's
## balustrade behind the pediment.
func _pavilion() -> void:
	var wall: Material = w.material("stucco", WALL)
	var trim: Material = w.material("stucco", TRIM)
	var plain: Material = w.material("plain", TRIM)
	var top := 10.6
	# The front wall, in pieces round the doors.
	var edges := [PAVILION.x]
	for z in DOORS:
		edges.append(z - DOOR_W / 2.0)
		edges.append(z + DOOR_W / 2.0)
	edges.append(PAVILION.y)
	for i in range(0, edges.size(), 2):
		_block(PAVILION_FACE, FRONT, 0.0, top, edges[i], edges[i + 1], wall)
	for z in DOORS:
		_block(PAVILION_FACE, FRONT, FLOOR_Y + DOOR_H, top, z - DOOR_W / 2.0, z + DOOR_W / 2.0, wall)
		# The architrave, the frieze and the little pediment on its consoles.
		var head := FLOOR_Y + DOOR_H
		for side in [-1.0, 1.0]:
			_block(PAVILION_FACE - 0.08, PAVILION_FACE + 0.01, FLOOR_Y, head + 0.18, z + side * (DOOR_W / 2.0 + 0.01), z + side * (DOOR_W / 2.0 + 0.2), plain)
			_block(PAVILION_FACE - 0.18, PAVILION_FACE + 0.01, head + 0.25, head + 0.75, z + side * (DOOR_W / 2.0 + 0.08), z + side * (DOOR_W / 2.0 + 0.24), plain)
		_block(PAVILION_FACE - 0.08, PAVILION_FACE + 0.01, head, head + 0.2, z - DOOR_W / 2.0 - 0.2, z + DOOR_W / 2.0 + 0.2, plain)
		_block(PAVILION_FACE - 0.05, PAVILION_FACE + 0.01, head + 0.2, head + 0.72, z - DOOR_W / 2.0 - 0.05, z + DOOR_W / 2.0 + 0.05, trim)
		_block(PAVILION_FACE - 0.24, PAVILION_FACE + 0.01, head + 0.72, head + 0.84, z - DOOR_W / 2.0 - 0.36, z + DOOR_W / 2.0 + 0.36, plain)
		_gable(PAVILION_FACE - 0.2, PAVILION_FACE + 0.01, z - DOOR_W / 2.0 - 0.36, z + DOOR_W / 2.0 + 0.36, head + 0.84, head + 1.36, plain)
		# The reveals: the door's jambs and head inside the wall's thickness.
		var reveal: Material = w.material("stucco", WALL.darkened(0.08))
		for side in [-1.0, 1.0]:
			_block(PAVILION_FACE + 0.02, FRONT, FLOOR_Y, head, z + side * DOOR_W / 2.0, z + side * (DOOR_W / 2.0 - 0.02), reveal)
	# Pilasters on the pavilion's face behind the columns (its corners stay plain: the cross).
	for z in COLUMNS:
		_block(PAVILION_FACE - 0.1, PAVILION_FACE + 0.01, FLOOR_Y, 7.9, z - 0.3, z + 0.3, plain)
		_block(PAVILION_FACE - 0.16, PAVILION_FACE + 0.01, FLOOR_Y, FLOOR_Y + 0.3, z - 0.36, z + 0.36, plain)
		_block(PAVILION_FACE - 0.16, PAVILION_FACE + 0.01, 7.6, 7.9, z - 0.36, z + 0.36, plain)
	# The plinth along the pavilion's foot (its two strips outside the porch).
	for span in [Vector2(PAVILION.x, PORCH_Z.x), Vector2(PORCH_Z.y, PAVILION.y)]:
		_block(PAVILION_FACE - 0.06, PAVILION_FACE + 0.01, 0.0, FLOOR_Y, span.x, span.y, w.material("stucco", PLINTH))
	# The cross, on the strip north of the porch: a dark blue cross with four small squares
	# round its crossing (as in the photo from the parking).
	var cross: Material = w.material("plain", CROSS)
	var cz := (PAVILION.x + PORCH_Z.x) / 2.0 - 0.15
	_block(PAVILION_FACE - 0.05, PAVILION_FACE + 0.01, 3.3, 6.1, cz - 0.09, cz + 0.09, cross)
	_block(PAVILION_FACE - 0.05, PAVILION_FACE + 0.01, 5.1, 5.28, cz - 0.5, cz + 0.5, cross)
	for corner in [Vector2(-0.24, 5.5), Vector2(0.24, 5.5), Vector2(-0.24, 4.85), Vector2(0.24, 4.85)]:
		_block(PAVILION_FACE - 0.05, PAVILION_FACE + 0.01, corner.y - 0.07, corner.y + 0.07, cz + corner.x - 0.07, cz + corner.x + 0.07, cross)
	# The pavilion's own cornice over the wings' line, and the balustrade on the terrace.
	_block(PAVILION_FACE - 0.4, FRONT, 9.9, 10.15, PAVILION.x - 0.1, PAVILION.y + 0.1, plain)
	_block(PAVILION_FACE - 0.46, FRONT, 10.15, 10.35, PAVILION.x - 0.15, PAVILION.y + 0.15, plain)
	_block(PAVILION_FACE, CORRIDOR, top - 0.3, top, PAVILION.x, PAVILION.y, w.material("stucco", TRIM.darkened(0.04)))
	_balustrade(Vector3(PAVILION_FACE + 0.3, top, PAVILION.x + 0.1), Vector3(PAVILION_FACE + 0.3, top, PAVILION.y - 0.1))
	_balustrade(Vector3(PAVILION_FACE + 0.3, top, PAVILION.x + 0.1), Vector3(CORRIDOR + 0.3, top, PAVILION.x + 0.1))
	_balustrade(Vector3(PAVILION_FACE + 0.3, top, PAVILION.y - 0.1), Vector3(CORRIDOR + 0.3, top, PAVILION.y - 0.1))

## A balustrade along a straight line at height `at.y`: a plinth, turned balusters, a top rail.
func _balustrade(from: Vector3, to: Vector3) -> void:
	var white: Material = w.material("plain", TRIM)
	var length := from.distance_to(to)
	var along := (to - from).normalized()
	var turn := atan2(-along.z, along.x)
	var mid := (from + to) / 2.0
	w.box(Vector3(length, 0.14, 0.3), mid + Vector3(0, 0.07, 0), white, turn)
	w.box(Vector3(length, 0.1, 0.34), mid + Vector3(0, 0.82, 0), white, turn)
	var count := maxi(2, floori(length / 0.32))
	for i in count:
		var at := from + along * (length * (i + 0.5) / count)
		w.box(Vector3(0.1, 0.62, 0.1), at + Vector3(0, 0.45, 0), white, turn)
		w.box(Vector3(0.16, 0.16, 0.16), at + Vector3(0, 0.36, 0), white, turn + PI / 4.0)

## The portico: the porch's floor, four Ionic columns (a base on a square plinth, a slightly
## tapering shaft, a capital with its two scrolls facing the drive and a square abacus), the
## entablature with HOLY ANGEL UNIVERSITY, the pediment with the seal, the porch's ceiling, and
## the two lanterns hanging under it.
func _portico() -> void:
	var white: Material = w.material("plain", Color("f6f3ea"))
	var trim: Material = w.material("stucco", TRIM)
	var granite: Material = w.material("pavers", Color("c7b8b2"))
	_block(PORCH, PAVILION_FACE, FLOOR_Y - 0.3, FLOOR_Y, PORCH_Z.x, PORCH_Z.y, granite)
	for z in COLUMNS:
		var base := Vector3(COLUMN_X, FLOOR_Y, z)
		w.box(Vector3(0.92, 0.16, 0.92), base + Vector3(0, 0.08, 0), white)
		_cylinder(0.43, 0.46, 0.1, base + Vector3(0, 0.21, 0), white, 16)
		_cylinder(0.39, 0.42, 0.1, base + Vector3(0, 0.31, 0), white, 16)
		var shaft := 7.55 - FLOOR_Y - 0.36
		_cylinder(0.33, 0.37, shaft, base + Vector3(0, 0.36 + shaft / 2.0, 0), white, 16)
		_cylinder(0.38, 0.34, 0.14, Vector3(COLUMN_X, 7.62, z), white, 16)
		for side in [-1.0, 1.0]:
			var scroll := _cylinder(0.15, 0.15, 0.62, Vector3(COLUMN_X, 7.6, z + side * 0.36), white, 12)
			scroll.rotation = Vector3(0, 0, PI / 2.0)
		w.box(Vector3(0.94, 0.12, 0.94), Vector3(COLUMN_X, 7.78, z), white)
	# The entablature: architrave, frieze with the name, the cornice.
	var front := PORCH - 0.02
	_block(front, PAVILION_FACE, 7.84, 8.2, PORCH_Z.x - 0.15, PORCH_Z.y + 0.15, trim)
	_block(front - 0.03, PAVILION_FACE, 8.2, 8.95, PORCH_Z.x - 0.2, PORCH_Z.y + 0.2, trim)
	_west_label("HOLY ANGEL UNIVERSITY", Vector3(front - 0.05, 8.57, CENTRE_Z), 7.4, 0.62, Color("2a2622"))
	_block(front - 0.32, PAVILION_FACE, 8.95, 9.22, PORCH_Z.x - 0.5, PORCH_Z.y + 0.5, white)
	_block(front - 0.4, PAVILION_FACE, 9.22, 9.32, PORCH_Z.x - 0.56, PORCH_Z.y + 0.56, white)
	var z := PORCH_Z.x - 0.4
	while z < PORCH_Z.y + 0.4:
		w.box(Vector3(0.12, 0.12, 0.1), Vector3(front - 0.24, 8.9, z), white)
		z += 0.2
	# The pediment: the tympanum, its raking cornices and the seal in the middle.
	var apex := 11.15
	_gable(front - 0.02, PAVILION_FACE, PORCH_Z.x - 0.3, PORCH_Z.y + 0.3, 9.32, apex, trim)
	var half := (PORCH_Z.y - PORCH_Z.x) / 2.0 + 0.55
	var rake := atan2(apex - 9.32, half)
	for side in [-1.0, 1.0]:
		var at := Vector3((front + PAVILION_FACE) / 2.0 - 0.2, (9.32 + apex) / 2.0 + 0.12, CENTRE_Z + side * half / 2.0)
		w.box(Vector3(PAVILION_FACE - front + 0.45, 0.24, half / cos(rake) + 0.2), at, white, 0.0, side * rake)
	var seal := _cylinder(0.42, 0.42, 0.06, Vector3(front - 0.05, 10.0, CENTRE_Z), w.material("plain", Color("eae4d2")), 24)
	seal.rotation = Vector3(0, 0, PI / 2.0)
	var ring := _cylinder(0.34, 0.34, 0.07, Vector3(front - 0.06, 10.0, CENTRE_Z), w.material("plain", Color("3f4a3c")), 24)
	ring.rotation = Vector3(0, 0, PI / 2.0)
	var shield := _cylinder(0.24, 0.24, 0.08, Vector3(front - 0.07, 10.0, CENTRE_Z), w.material("plain", Color("efe9d8")), 24)
	shield.rotation = Vector3(0, 0, PI / 2.0)
	_block(front - 0.12, front - 0.06, 9.86, 10.16, CENTRE_Z - 0.09, CENTRE_Z + 0.09, w.material("plain", Color("6b2a2a")))
	# The porch's ceiling, and the lanterns hung from it in front of the side doors.
	_block(front, PAVILION_FACE, 7.84 - 0.08, 7.84, PORCH_Z.x, PORCH_Z.y, w.material("stucco", Color("efe8d6")))
	for zz in [DOORS[0], DOORS[2]]:
		w.box(Vector3(0.03, 0.9, 0.03), Vector3(-157.6, 7.3, zz), w.material("plain", Color("1f1f1f")))
		w.box(Vector3(0.36, 0.55, 0.36), Vector3(-157.6, 6.6, zz), w.material("plain", Color("1f1f1f")))
		w.box(Vector3(0.26, 0.4, 0.26), Vector3(-157.6, 6.6, zz), w.glow(Color("f2cc92"), 0.15, 2.2))
		w._omni(Vector3(-157.6, 6.3, zz), Color("ffd194"), 1.0, 6.0)

## Five terrazzo steps from the forecourt up to the porch (one block per tread, nosings proud),
## between two cheek walls that carry a lamp post each.
func _steps() -> void:
	var terrazzo: Material = w.material("concrete", TERRAZZO)
	var nosing: Material = w.material("plain", Color("6f655f"))
	var rise := (FLOOR_Y - WALK_Y) / STEP_COUNT
	var tread := (PORCH - STEPS_FOOT) / STEP_COUNT
	for i in STEP_COUNT:
		var top := WALK_Y + rise * (i + 1)
		var x0 := STEPS_FOOT + tread * i
		_block(x0, PORCH, top - rise - 0.02, top, STEPS_Z.x, STEPS_Z.y, terrazzo)
		_block(x0 - 0.015, x0 + 0.05, top - 0.03, top + 0.004, STEPS_Z.x, STEPS_Z.y, nosing)
	var cheek: Material = w.material("stucco", TRIM)
	for z in [STEPS_Z.x - 0.35, STEPS_Z.y + 0.35]:
		_block(STEPS_FOOT, PAVILION_FACE, WALK_Y, FLOOR_Y + 0.25, z - 0.35, z + 0.35, cheek)
		_block(STEPS_FOOT - 0.05, STEPS_FOOT + 0.65, FLOOR_Y + 0.25, FLOOR_Y + 0.35, z - 0.42, z + 0.42, w.material("plain", TRIM))

# --- The other faces and the roofs ----------------------------------------------------------

## The north face above the Student Center's roof, the south face on the street side and the
## theatre's east end: the front's string course, cornice and white-framed pairs.
func _other_faces() -> void:
	var trim: Material = w.material("stucco", TRIM)
	# North (above the arcade's roof slab at ~3.64) and south faces of the wings.
	for face in [[NORTH, Vector3(0, 0, -1), 4.0], [SOUTH, Vector3(0, 0, 1), 0.0]]:
		var z: float = face[0]
		var normal: Vector3 = face[1]
		var from: float = face[2]
		var out := normal.z * 0.1
		_block(FRONT, THEATRE_X, 4.9, 5.25, z, z + out, trim)
		_block(FRONT, THEATRE_X, 9.75, 10.0, z, z + normal.z * 0.36, trim)
		_block(FRONT, THEATRE_X, 10.0, CORNICE, z, z + normal.z * 0.42, trim)
		_block(FRONT, THEATRE_X, CORNICE, PARAPET, z - normal.z * 0.25, z + normal.z * 0.04, w.material("stucco", WALL))
		if from < 1.0:
			_block(FRONT, THEATRE_X, 0.0, FLOOR_Y, z, z + normal.z * 0.06, w.material("stucco", PLINTH))
		var x := FRONT + 2.4
		while x < THEATRE_X - 1.5:
			for dx in [-0.6, 0.6]:
				w.framed_window(Vector3(x + dx, 7.45, z), 0.82, 2.05, normal, false, 1, TRIM)
				if from < 1.0 and (x + dx < PASSAGE.x - 0.6 or x + dx > PASSAGE.y + 0.6):
					w.framed_window(Vector3(x + dx, 2.95, z), 0.82, 2.05, normal, false, 1, TRIM)
			x += 3.4
	# The theatre block: high windows and a band on its north, south and east faces.
	var hall: Material = w.material("stucco", TRIM.darkened(0.03))
	_block(THEATRE_X, EAST - 0.1, 12.4, 12.7, NORTH - 0.1, SOUTH + 0.1, hall)
	for z in [NORTH, SOUTH]:
		var normal := Vector3(0, 0, -1) if z == NORTH else Vector3(0, 0, 1)
		var x := THEATRE_X + 2.2
		while x < EAST - 1.5:
			w.framed_window(Vector3(x, 8.6, z), 1.1, 2.4, normal, false, 1, TRIM)
			x += 3.2
	for z in range(0, 5):
		w.framed_window(Vector3(EAST, 8.6, NORTH + 5.0 + z * 7.2), 1.1, 2.4, Vector3(1, 0, 0), false, 1, TRIM)
	_block(EAST, EAST + 0.06, 0.0, FLOOR_Y, NORTH, SOUTH, w.material("stucco", PLINTH))
	_block(EAST, EAST + 0.1, 4.9, 5.25, NORTH, SOUTH, trim)

## The roofs behind the parapets: low slopes of pale sheet from the outer walls up to a ridge
## over the rooms (the drone shot), and over the theatre a low gable. The courtyard's glass roof
## is built with the courtyard.
func _roofs() -> void:
	var sheet: Material = w.material("ribbed", ROOF)
	var pitch := 0.16
	# The front block: one slope from the front up towards the courtyard.
	var depth := CORRIDOR - FRONT + 3.0
	var rise := depth * tan(pitch)
	for span in [Vector2(NORTH, PAVILION.x), Vector2(PAVILION.y, SOUTH)]:
		# (turned a quarter so the box's z runs east; a negative tilt lifts its east end)
		w.box(Vector3(span.y - span.x, 0.12, depth / cos(pitch)), Vector3((FRONT + CORRIDOR + 3.0) / 2.0, CORNICE + rise / 2.0 + 0.1, (span.x + span.y) / 2.0), sheet, PI / 2.0, -pitch)
	# The wings: one slope each from the outer wall up over the rooms.
	var wing_depth := NORTH_ROOMS - NORTH + 0.4
	var wing_rise := wing_depth * tan(pitch)
	w.box(Vector3(THEATRE_X - CORRIDOR, 0.12, wing_depth / cos(pitch)), Vector3((CORRIDOR + THEATRE_X) / 2.0, CORNICE + wing_rise / 2.0 + 0.1, (NORTH + NORTH_ROOMS + 0.4) / 2.0), sheet, 0.0, -pitch)
	w.box(Vector3(THEATRE_X - CORRIDOR, 0.12, wing_depth / cos(pitch)), Vector3((CORRIDOR + THEATRE_X) / 2.0, CORNICE + wing_rise / 2.0 + 0.1, (SOUTH + SOUTH_ROOMS - 0.4) / 2.0), sheet, 0.0, pitch)
	# The theatre: a low gable along x.
	var half := (SOUTH - NORTH) / 2.0 + 0.3
	var gable_pitch := 0.12
	for side in [-1.0, 1.0]:
		w.box(Vector3(EAST - THEATRE_X + 0.4, 0.14, half / cos(gable_pitch)), Vector3((THEATRE_X + EAST) / 2.0, 12.7 + half * tan(gable_pitch) / 2.0, CENTRE_Z + side * half / 2.0), sheet, 0.0, side * gable_pitch)

# --- The grounds ------------------------------------------------------------------------------

## The drive: concrete in slabs from the fountain's apron to the car gate, its kerbs, and the
## yellow zebra across it from the brick apron's hedge gap to the flag circle's steps.
func _drive() -> void:
	var concrete: Material = w.material("concrete", Color("b9b8b0"))
	var kerb: Material = w.material("stucco", Color("bfc4bc"))
	var yellow: Material = w.material("plain", Color("e3b733"))
	var south_x := fence_z(DRIVE.x)
	var south_y := fence_z(DRIVE.y)
	var tri := PackedVector2Array([Vector2(DRIVE.x, 70.0), Vector2(DRIVE.y, 70.0), Vector2(DRIVE.y, south_y),
		Vector2(DRIVE.x, 70.0), Vector2(DRIVE.y, south_y), Vector2(DRIVE.x, south_x)])
	w._ground(tri, DRIVE_Y, concrete)
	# Kerbs along the east side (broken at the zebra, yellow either side of it) and the west side.
	for run in [Vector2(76.0, ZEBRA.x), Vector2(ZEBRA.y, south_y - 0.4)]:
		_block(DRIVE.y - 0.15, DRIVE.y + 0.12, DRIVE_Y - 0.02, 0.0, run.x, run.y, kerb)
	_block(DRIVE.x - 0.12, DRIVE.x + 0.04, DRIVE_Y - 0.02, -0.02, 74.0, south_x - 0.4, kerb)
	_block(DRIVE.y - 0.16, DRIVE.y + 0.13, -0.02, 0.006, ZEBRA.x - 0.6, ZEBRA.x, yellow)
	_block(DRIVE.y - 0.16, DRIVE.y + 0.13, -0.02, 0.006, ZEBRA.y, ZEBRA.y + 0.6, yellow)
	var x := DRIVE.x + 0.35
	while x < DRIVE.y - 0.3:
		_block(x, x + 0.4, DRIVE_Y, DRIVE_Y + 0.006, ZEBRA.x + 0.15, ZEBRA.y - 0.15, yellow)
		x += 0.8
	# Saw-cut joints across the slabs every 4 m and one down the middle, a shade darker.
	var joint: Material = w.material("plain", Color("8f8e88"))
	var z := 78.0
	while z < south_y - 1.0:
		_block(DRIVE.x + 0.05, DRIVE.y - 0.2, DRIVE_Y, DRIVE_Y + 0.005, z, z + 0.04, joint)
		z += 4.0
	var mid := (DRIVE.x + DRIVE.y) / 2.0
	_block(mid - 0.02, mid + 0.02, DRIVE_Y, DRIVE_Y + 0.005, 78.0, south_y - 1.0, joint)

## The parking along the wings: grass growing between square cobbles in each bay, dark cobble
## bands between the bays and along their ends, a yellow wheel stop at each bay's head; and the
## forecourt of dark pavers in front of the portico. Empty: no cars (Sean, 2026-11-20).
func _parking() -> void:
	var grass_cobble: Material = w.material("pavers", Color("9aa58a"))
	var band: Material = w.material("pavers", Color("6b6a66"))
	var stop: Material = w.material("plain", Color("e6b52e"))
	var forecourt: Material = w.material("pavers", Color("8c8a86"))
	var south_end := fence_z(PARKING.x) - 0.45
	for run in [Vector2(NORTH_BAYS.x, NORTH_BAYS.y), Vector2(FORECOURT.y, south_end)]:
		_block(PARKING.x + 0.12, PARKING.y, -0.2, WALK_Y, run.x, run.y, grass_cobble)
		_block(PARKING.x + 0.12, PARKING.x + 0.42, -0.2, WALK_Y + 0.003, run.x, run.y, band)
		_block(PARKING.y - 0.3, PARKING.y, -0.2, WALK_Y + 0.003, run.x, run.y, band)
		var z: float = run.x
		while z < run.y - 0.2:
			_block(PARKING.x + 0.42, PARKING.y - 0.3, -0.2, WALK_Y + 0.003, z, z + 0.22, band)
			if z + BAY < run.y:
				_block(PARKING.y - 1.05, PARKING.y - 0.9, WALK_Y, WALK_Y + 0.12, z + 0.6, z + BAY - 0.38, stop)
			z += BAY
	# The south run narrows with the fence: a triangle of cobbles fills its end.
	var slope := PackedVector2Array([Vector2(PARKING.x + 0.12, south_end), Vector2(PARKING.y, south_end),
		Vector2(PARKING.y, fence_z(PARKING.y) - 0.45)])
	w._ground(slope, WALK_Y + 0.002, band)
	_block(PARKING.x + 0.12, STEPS_FOOT, -0.2, WALK_Y, FORECOURT.x, FORECOURT.y, forecourt)
	_block(PARKING.x + 0.12, PARKING.x + 0.5, -0.2, WALK_Y + 0.003, FORECOURT.x, FORECOURT.y, w.material("concrete", TERRAZZO))

## The garden between the bays and the front: a kerb along its edge with a low white fence and
## urn posts, red-tipped shrubs along the wall's foot, flowering shrubs, small palms in front of
## each wing, and clipped cones either side of the steps.
func _garden() -> void:
	var kerb: Material = w.material("stucco", Color("cfcac0"))
	var white: Material = w.material("plain", Color("eeeee6"))
	var cream: Material = w.material("stucco", TRIM)
	var soil: Material = w.material("dirt", Color("7d6a50"))
	var k := 0
	for run in [Vector2(NORTH_BAYS.x, FORECOURT.x), Vector2(FORECOURT.y, fence_z(GARDEN.x))]:
		var z0: float = run.x
		var z1: float = run.y
		_block(GARDEN.x, GARDEN.x + 0.16, -0.2, 0.1, z0, z1, kerb)
		# The low fence: posts every 1.2 m and two rails, along the kerb.
		var z := z0 + 0.2
		while z < z1 - 0.1:
			w.box(Vector3(0.05, 0.55, 0.05), Vector3(GARDEN.x + 0.08, 0.37, z), white)
			z += 1.2
		for y in [0.3, 0.58]:
			_block(GARDEN.x + 0.06, GARDEN.x + 0.1, y - 0.02, y + 0.02, z0 + 0.2, z1 - 0.1, white)
		# A bed of soil and shrubs along the wall's foot (lower under the windows).
		_block(FRONT - 1.2, FRONT, -0.2, -0.12, z0, minf(z1, SOUTH - 0.2), soil)
		z = z0 + 0.6
		while z < minf(z1, SOUTH) - 0.5:
			var near_window := false
			for wz in front_windows():
				near_window = near_window or absf(wz - z) < 0.5
			w._shrub(Vector3(FRONT - 0.6, -0.14, z), 0.8 if near_window else 1.05, 4100 + k)
			z += 0.9
			k += 1
	for at in URN_POSTS:
		_block(at.x - 0.22, at.x + 0.22, -0.2, 0.85, at.y - 0.22, at.y + 0.22, cream)
		_block(at.x - 0.27, at.x + 0.27, 0.85, 0.93, at.y - 0.27, at.y + 0.27, cream)
		_cylinder(0.16, 0.24, 0.35, Vector3(at.x, 1.1, at.y), cream, 12)
		_cylinder(0.27, 0.14, 0.2, Vector3(at.x, 1.37, at.y), cream, 12)
		w._shrub(Vector3(at.x, 1.4, at.y), 0.45, 4300 + roundi(at.y))
	# Small palms and flowering shrubs in front of each wing (the drone shot).
	var pinks: Array[Color] = [Color("3f6a35"), Color("4f7a3a"), Color("c94f6a"), Color("e07a8c"), Color("b8324a")]
	for z in [91.4, 96.9, 99.9, 115.5, 118.5, 123.4]:
		_areca(Vector3(-159.4, -0.18, z), 2.4, 4400 + roundi(z * 10.0))
	for z in [93.6, 98.3, 117.0, 121.4]:
		w._shrub(Vector3(-158.2, -0.16, z), 1.0, 4500 + roundi(z), pinks)
		w._shrub(Vector3(-160.6, -0.16, z + 1.2), 0.8, 4600 + roundi(z), pinks)
	# Clipped dark cones in white pots on the forecourt, either side of the steps' foot.
	var cone_green: Material = w.material("plain", Color("2f4a2a"))
	for z in [STEPS_Z.x - 1.25, STEPS_Z.y + 1.25]:
		_cylinder(0.32, 0.26, 0.45, Vector3(-161.45, WALK_Y + 0.22, z), cream, 12)
		_cylinder(0.02, 0.34, 1.6, Vector3(-161.45, WALK_Y + 1.25, z), cone_green, 10)

## The lamp posts: tall black poles with a swan-neck arm and a dark dome shade (as along the
## drive and round the flag circle in the photos), lit at night.
func _lamps() -> void:
	var black := Color("23262a")
	for at in LAMPS:
		w.box(Vector3(0.3, 0.3, 0.3), Vector3(at.x, WALK_Y + 0.15, at.y), w.material("plain", black))
		w.rod(Vector3(at.x, WALK_Y, at.y), Vector3(at.x, 4.2, at.y), 0.06, black)
		var toward := 1.0 if at.x > DRIVE.y + 1.0 else -1.0
		w.rod(Vector3(at.x, 4.2, at.y), Vector3(at.x - toward * 0.35, 4.55, at.y), 0.045, black)
		w.rod(Vector3(at.x - toward * 0.35, 4.55, at.y), Vector3(at.x - toward * 0.75, 4.35, at.y), 0.04, black)
		var head := Vector3(at.x - toward * 0.75, 4.2, at.y)
		_cylinder(0.1, 0.3, 0.22, head, w.material("plain", black), 12)
		w.box(Vector3(0.3, 0.04, 0.3), head + Vector3(0, -0.12, 0), w.glow(Color("fff0d2"), 0.1, 3.0))
		var light := SpotLight3D.new()
		light.light_color = Color("ffd194")
		light.light_energy = 4.0
		light.spot_range = 9.0
		light.spot_angle = 62.0
		light.spot_attenuation = 0.8
		light.shadow_enabled = true
		light.rotation = Vector3(-PI / 2.0, 0, 0)
		w._lamp(light, head + Vector3(0, -0.15, 0))

## A small areca palm clump: thin stems fanning out, crowned with narrow-leaved fronds.
func _areca(at: Vector3, height: float, seed_value: int) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var greens: Array[Color] = [Color("4f7a2c"), Color("6b9a34"), Color("8fb846"), Color("b9cf5a"), Color("3f6424")]
	var fronds: Material = w._leaf_material(seed_value, at + Vector3(0, height, 0), greens, true)
	var cluster: ArrayMesh = w._cards(height * 0.7, height * 0.5, -height * 0.25, 3, false)
	for i in 5:
		var a := TAU * i / 5.0 + random.randf() * 0.5
		var tip := at + Vector3(cos(a) * 0.3, height * random.randf_range(0.7, 1.0), sin(a) * 0.3)
		w.rod(at, tip, 0.03, Color("7d8a4a"))
		w._mesh(cluster, tip, fronds, a).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED

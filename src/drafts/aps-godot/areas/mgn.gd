extends RefCounted
## The Mamerto G. Nepomuceno Building (MGN, no. 14), from the outside, on its plan plot
## west of the west road, from the MGN photos (assets/MGN BUILDING/ and "mgn building
## ..." in assets/images/buildings/beside the main building + the main walkways/).
## It runs north to south at right angles to St. Joseph Hall, its east side on the road:
## a white five-storey block (an open ground floor and four floors) with open corridors
## behind thick white balcony bands, a raised garden with big trees in front of it, the
## box-window wing standing forward at the north end over the entrance (the turnstile)
## and the open stair behind its brown grille, the north block on the chapel walkway
## side, and the south wing beside SJH with the service block and its roof tank.
##
## Built in its own frame under a pivot ("MGN"): local +x runs north along the front,
## local +z out of the front (east, towards the road), local z 0 is the long block's
## front edge on the plot. The plot's outline is all straight in this frame (it is
## turned 1.4°), so the parts below are its corners, read off campus_plan.gd.

const Chapel := preload("res://areas/chapel.gd")
const Sjh := preload("res://areas/sjh.gd")

## The long block's front edge on the plot (plan outline): north and south corners.
const EDGE_NORTH := Vector2(-67.6, 101.9)
const EDGE_SOUTH := Vector2(-68.5, 137.8)
## Storeys: a tall open ground floor, then four corridor floors (counted off the photos;
## heights approximate, from the photos). The roof is ~17 m; tanks stand above it.
const GROUND := 3.6
const STOREY := 3.4
const FLOORS := 4
const ROOF := GROUND + FLOORS * STOREY
## The long block: local x -LONG..LONG, from the corridor front back to BACK.
const LONG := 17.96
const BACK := -15.2
## The corridors' inner wall (classroom fronts), and the ground floor's height.
const INNER := -2.6
const FLOOR_Y := 0.15
## The bays along the corridor front (11 columns, 3.59 m apart).
const BAYS := 10
## The box-window wing over the entrance: local x WING.x..WING.y, its face at WING_FRONT.
const WING := Vector2(17.96, 29.9)
const WING_FRONT := 4.1
## Its open ground floor: the back wall, the front columns, the turnstile line, the stair.
const PORCH_BACK := -2.4
const PORCH_COLUMNS: Array[float] = [18.5, 24.2, 29.4]
const COLUMN_Z := 3.55
const TURNSTILE_Z := 0.5
const STAIR := Vector2(24.6, 29.2)
## The north block (on the chapel walkway side) and the south wing (beside SJH).
const NORTH_END := 39.5
const NORTH_BACK := -17.25
## The south wing's front is flush with the long block's (it stood 5.7 m forward on the plan,
## ~1 m from SJH; in the photos the drive and MGN's planting run between them, ~9 m wall to
## wall under the bridge), and the garden runs on in front of it.
const SOUTH_WING := Vector2(-28.9, -17.96)
const SOUTH_FRONT := 0.0
const SOUTH_BACK := -23.0
## MGN's other entrance, on the north block's face to the west road (IMG_6063 and "mgn
## rightside to sidewalk.jpg"): a raised forecourt (FORECOURT, local x, z) of pale grey
## squares in dark grout bands behind a white kerb, under the first floor's overhang on two
## square pillars, a grated drain along the road, bins and potted plants; north of it red
## octagon pavers (CORNER, local x) to the boulevard's covered walkway.
const FORECOURT := Rect2(31.0, -2.4, 6.6, 5.8)
const FORECOURT_Y := 0.25
const FORECOURT_PILLARS: Array[float] = [32.6, 36.0]
const PILLAR_Z := 0.6
const OVERHANG := 1.0
const DRAIN := 0.45
const CORNER := Vector2(37.6, NORTH_END)
## Things standing on the forecourt (local x, z): the bins, the potted plants.
const BINS: Array[Vector2] = [Vector2(37.05, 1.4), Vector2(37.05, 1.95), Vector2(37.05, 2.5)]
const POTS: Array[Vector2] = [Vector2(31.5, 2.9), Vector2(31.5, -1.7), Vector2(37.0, -1.7)]

## The raised garden between the corridor front and the road, behind a white kerb wall,
## from the south wing's far end (GARDEN_FROM) to the long block's north end.
const GARDEN := 3.9
const GARDEN_FROM := SOUTH_WING.x
## The brown paver walk through the garden (MGN FRONT.JPG): from the drive's kerb opposite
## the Mary statue (mgn and Sjh middle.jpg) at WALK_FROM in at a slant to the corridor front
## at WALK_TO, 2 * WALK_HALF wide, between low kerbs, laid just over the grass (the
## photo's is a little below it).
const WALK_FROM := Vector2(0.5, GARDEN + 0.6)
const WALK_TO := Vector2(-1.5, 0.0)
const WALK_HALF := 0.8
const WALK_Y := 0.32
## Facing MGN the camera cuts away everything east of this world x (the chapel lawn,
## its trees and the chapel), the way the SJH view cuts away everything north of its parking.
## It stops just east of SJH's terracotta end block (world x -50.3), so that block stays whole.
const CUT_X := -49.8

static func origin() -> Vector2:
	return (EDGE_NORTH + EDGE_SOUTH) / 2.0

## The pivot's turn: local +z onto the front edge's outward (east) normal.
static func angle() -> float:
	var edge := (EDGE_NORTH - EDGE_SOUTH).normalized()
	var outward := Vector2(-edge.y, edge.x)
	if outward.x < 0.0:
		outward = -outward
	return atan2(outward.x, outward.y)

static func local(x: float, z: float) -> Vector2:
	var d := Vector2(x, z) - origin()
	var a := angle()
	return Vector2(cos(a) * d.x - sin(a) * d.y, sin(a) * d.x + cos(a) * d.y)

static func world(lx: float, lz: float) -> Vector2:
	var a := angle()
	return origin() + Vector2(cos(a) * lx + sin(a) * lz, -sin(a) * lx + cos(a) * lz)

## The plot's footprint, local: the long block, the north part, the wing, the south wing.
static func inside(lx: float, lz: float) -> bool:
	if lx >= -LONG and lx <= LONG and lz <= 0.0 and lz >= BACK:
		return true
	if lx >= LONG - 1.0 and lx <= NORTH_END and lz >= NORTH_BACK and lz <= PORCH_BACK:
		return true
	if lx >= WING.x and lx <= WING.y and lz >= NORTH_BACK and lz <= WING_FRONT:
		return true
	if lx >= SOUTH_WING.x and lx <= SOUTH_WING.y and lz >= SOUTH_BACK and lz <= SOUTH_FRONT:
		return true
	return lx >= -LONG and lx <= -14.5 and lz >= SOUTH_BACK and lz <= BACK

## The paved entry walk under the wing, from the sidewalk to the turnstile.
static func in_entry(x: float, z: float) -> bool:
	var at := local(x, z)
	return at.x > WING.x + 0.3 and at.x < STAIR.x - 0.2 and at.y > TURNSTILE_Z and at.y < WING_FRONT + 0.6

## How far the camera turns to face MGN: on the west road from beside the walkway end
## down to the corner, before the SJH view takes over. The chapel view yields to it.
static func reach(x: float, z: float) -> float:
	return smoothstep(70.8, 78.8, z) * (1.0 - smoothstep(-57.5, -53.5, x))

static func view_for(x: float, z: float) -> float:
	return reach(x, z) * (1.0 - Sjh.view_for(x, z))

static func walkable(x: float, z: float) -> bool:
	return in_entry(x, z) or in_walk(x, z) or in_forecourt(x, z) or on_corner(x, z)

## On the north entrance's raised forecourt (its drain strip is at the ground).
static func in_forecourt(x: float, z: float) -> bool:
	return FORECOURT.has_point(local(x, z))

static func on_corner(x: float, z: float) -> bool:
	var at := local(x, z)
	var drain := at.x > FORECOURT.position.x and at.x < FORECOURT.end.x and at.y >= FORECOURT.end.y and at.y < FORECOURT.end.y + DRAIN
	return drain or (at.x >= CORNER.x and at.x < CORNER.y and at.y > PORCH_BACK and at.y < FORECOURT.end.y + DRAIN)

## On the paver walk through the garden.
static func in_walk(x: float, z: float) -> bool:
	var at := local(x, z)
	return at.y > 0.05 and Geometry2D.get_closest_point_to_segment(at, WALK_FROM, WALK_TO).distance_to(at) < WALK_HALF

static func blocked(x: float, z: float) -> bool:
	var at := local(x, z)
	if in_entry(x, z):
		for column in PORCH_COLUMNS:
			if absf(at.x - column) < 0.45 and absf(at.y - COLUMN_Z) < 0.45:
				return true
		return at.y < TURNSTILE_Z + 0.35 # the turnstile and the guard's desk
	if inside(at.x, at.y):
		return true
	if in_walk(x, z) or on_corner(x, z):
		return false
	if in_forecourt(x, z):
		for pillar in FORECOURT_PILLARS:
			if absf(at.x - pillar) < 0.4 and absf(at.y - PILLAR_Z) < 0.4:
				return true
		for spot in BINS + POTS:
			if at.distance_to(spot) < 0.4:
				return true
		return false
	return at.x > GARDEN_FROM and at.x < LONG and at.y > 0.0 and at.y < GARDEN + 0.05 # the raised garden

static func floor_height(x: float, z: float) -> float:
	if in_entry(x, z):
		return FLOOR_Y
	if in_forecourt(x, z):
		return FORECOURT_Y
	if on_corner(x, z):
		return 0.0
	return WALK_Y if in_walk(x, z) else NAN

var w: RefCounted

func build(world_builder: RefCounted) -> void:
	w = world_builder
	w._flush()
	var pivot := Node3D.new()
	pivot.name = "MGN"
	var at := origin()
	pivot.transform = Transform3D(Basis(Vector3.UP, angle()), Vector3(at.x, 0, at.y))
	w.root.add_child(pivot)
	var saved: Node3D = w.root
	w.root = pivot
	_long_block()
	_corridors()
	_wing()
	_porch()
	_north_block()
	_south_wing()
	_garden()
	_walk()
	_forecourt()
	w._flush()
	w.root = saved
	_planting()
	w._flush()

# --- The long block ------------------------------------------------------------------

## The block behind the corridors, its roof and fascia, the back with rows of windows.
func _long_block() -> void:
	var white: Material = w.material("stucco", Color("f3f2ec"))
	var roof: Material = w.material("stucco", Color("d6d4cc"))
	w.box(Vector3(2.0 * LONG, ROOF, INNER - BACK), Vector3(0, ROOF / 2.0, (INNER + BACK) / 2.0), white)
	w.box(Vector3(2.0 * LONG + 0.4, 0.35, -BACK + 0.6), Vector3(0, ROOF + 0.17, BACK / 2.0 + 0.1), roof)
	# The deep white fascia over the top corridor, as in every photo.
	w.box(Vector3(2.0 * LONG + 0.4, 1.0, 0.3), Vector3(0, ROOF + 0.1, 0.3), white)
	w.box(Vector3(2.0 * LONG, 0.6, 0.22), Vector3(0, ROOF + 0.6, BACK - 0.05), white)
	_back_windows(Vector2(-LONG + 1.5, LONG - 1.5), BACK)

## Rows of windows on a back (west) face at local z `face`, one per 3.6 m per floor.
func _back_windows(along: Vector2, face: float) -> void:
	for k in FLOORS + 1:
		var y := (FLOOR_Y + 1.5) if k == 0 else GROUND + (k - 1) * STOREY + 1.6
		var x := along.x
		while x <= along.y:
			w.framed_window(Vector3(x, y, face), 2.2, 1.3, Vector3.FORWARD, posmod(roundi(x * 3.0) + k * 5, 6) == 0)
			x += 3.6
	_floor_bands(Vector2(along.x - 1.5, along.y + 1.5), face, Vector3.FORWARD)

## The open corridors on the front: columns, thick balcony bands with a steel rail, the
## classroom fronts behind (doors, windows, some lit at night) and tube lights.
func _corridors() -> void:
	var white: Material = w.material("stucco", Color("f6f5ef"))
	var band: Material = w.material("stucco", Color("fbfaf4"))
	# The corridors are deep in shade in every photo: their walls and soffits a step darker.
	var wall: Material = w.material("stucco", Color("bebbb2"))
	var slab: Material = w.material("stucco", Color("cfccc4"))
	var rail: Material = w.material("plain", Color("b9bdbd"))
	var door: Material = w.material("wood", Color("6e5040"))
	var frame: Material = w.material("plain", Color("3f3a36"))
	var dark: Material = w.material("glass", Color("3f4a52"))
	var lit: Material = w.glow(Color("ffc281"), 0.0, 1.35)
	var tube: Material = w.glow(Color("f4f1e6"), 0.0, 2.0)
	var pitch := 2.0 * LONG / BAYS
	# The columns, full height, between the bands.
	for i in BAYS + 1:
		var x := -LONG + i * pitch
		w.box(Vector3(0.45, ROOF, 0.5), Vector3(x, ROOF / 2.0, -0.25), white)
	# The ground floor: a tiled walk behind the columns.
	w.box(Vector3(2.0 * LONG, 0.4, -INNER), Vector3(0, FLOOR_Y - 0.2, INNER / 2.0), w.material("floor", Color("d8d3ca")))
	for k in FLOORS + 1:
		var y := FLOOR_Y if k == 0 else GROUND + (k - 1) * STOREY
		var height := (GROUND - FLOOR_Y) if k == 0 else STOREY
		if k > 0:
			# The floor slab, then the balcony band: a thick white wall with a rail on top.
			w.box(Vector3(2.0 * LONG + 0.3, 0.3, -INNER + 0.3), Vector3(0, y - 0.15, INNER / 2.0 + 0.15), slab)
			w.box(Vector3(2.0 * LONG + 0.3, 1.0, 0.22), Vector3(0, y + 0.35, 0.1), band)
			w.box(Vector3(2.0 * LONG + 0.4, 0.09, 0.3), Vector3(0, y + 0.88, 0.1), band)
			w.box(Vector3(2.0 * LONG, 0.04, 0.04), Vector3(0, y + 1.15, 0.05), rail)
			var post := -LONG + 0.9
			while post < LONG:
				w.box(Vector3(0.035, 0.25, 0.035), Vector3(post, y + 1.02, 0.05), rail)
				post += 1.2
		# The classroom fronts on the inner wall.
		w.box(Vector3(2.0 * LONG, height, 0.2), Vector3(0, y + height / 2.0, INNER), wall)
		for bay in BAYS:
			var x := -LONG + (bay + 0.5) * pitch
			if bay % 3 == 1:
				w.box(Vector3(1.05, 2.25, 0.06), Vector3(x, y + 1.12, INNER + 0.12), frame)
				w.box(Vector3(0.9, 2.1, 0.05), Vector3(x, y + 1.05, INNER + 0.15), door)
				if k == 0:
					w.panel("MGN %02d" % (bay + 1), Vector3(x, y + 2.5, INNER + 0.16), 0.9, 0.18, Color("f6f1e6"), Color("2f5a3c"))
			else:
				w.framed_window(Vector3(x, y + 1.65, INNER + 0.1), 2.35, 1.1, Vector3.BACK, posmod(bay * 7 + k * 3, 5) == 0, 2)
			if bay % 2 == 0:
				w.box(Vector3(1.2, 0.06, 0.12), Vector3(x, y + height - 0.1, -1.4), tube)
	# A steel grille closes the top corridor's north end (photo "04_right-side").
	var grille: Material = w.material("plain", Color("6a5a4c"))
	var bar := LONG - 2.6
	while bar < LONG - 0.3:
		w.box(Vector3(0.04, STOREY - 0.3, 0.04), Vector3(bar, GROUND + 3.0 * STOREY + (STOREY - 0.3) / 2.0, 0.0), grille)
		bar += 0.22

# --- The box-window wing and its porch ------------------------------------------------

func _wing() -> void:
	var white: Material = w.material("stucco", Color("f4f3ed"))
	var trim: Material = w.material("stucco", Color("fbfaf5"))
	var dark: Material = w.material("glass", Color("2f363c"))
	var lit: Material = w.glow(Color("ffc281"), 0.0, 1.35)
	var length := WING.y - WING.x
	var middle := (WING.x + WING.y) / 2.0
	var top := ROOF + 0.6
	# Behind the porch, full height; over it, the floors stand out to the face.
	w.box(Vector3(length, top, PORCH_BACK - NORTH_BACK), Vector3(middle, top / 2.0, (PORCH_BACK + NORTH_BACK) / 2.0), white)
	var bottom := GROUND - 0.45
	w.box(Vector3(length, top - bottom, WING_FRONT - PORCH_BACK), Vector3(middle, (top + bottom) / 2.0, (WING_FRONT + PORCH_BACK) / 2.0), white)
	w.box(Vector3(length + 0.3, 0.3, WING_FRONT - NORTH_BACK + 0.3), Vector3(middle, top + 0.15, (WING_FRONT + NORTH_BACK) / 2.0), w.material("stucco", Color("d6d4cc")))
	# The deep box windows stacked up the face's south half, a narrow window by them.
	for k in FLOORS:
		var y := GROUND + k * STOREY + 1.55
		var x := WING.x + 3.4
		w.box(Vector3(3.2, 0.2, 0.8), Vector3(x, y + 1.15, WING_FRONT + 0.4), trim)
		w.box(Vector3(3.4, 0.18, 0.95), Vector3(x, y - 1.05, WING_FRONT + 0.45), trim)
		for side in [-1.0, 1.0]:
			w.box(Vector3(0.2, 2.3, 0.8), Vector3(x + side * 1.5, y + 0.05, WING_FRONT + 0.4), trim)
		w.box(Vector3(2.8, 1.9, 0.05), Vector3(x, y + 0.05, WING_FRONT + 0.03), lit if k == 2 else dark)
		w.box(Vector3(2.8, 0.05, 0.06), Vector3(x, y - 0.2, WING_FRONT + 0.08), w.material("plain", Color("c7cbcb")))
		# Light mullions split the box window into three, as in the photos.
		for dx in [-0.47, 0.47]:
			w.box(Vector3(0.05, 1.9, 0.06), Vector3(x + dx, y + 0.05, WING_FRONT + 0.08), w.material("plain", Color("c7cbcb")))
		w.framed_window(Vector3(WING.y - 2.2, y + 0.1, WING_FRONT), 0.7, 1.4, Vector3.BACK, k == 1, 0)
		w.box(Vector3(length + 0.2, 0.14, 0.3), Vector3(middle, GROUND + k * STOREY - 0.05, WING_FRONT + 0.12), trim)
	# The roof tank: a grey drum with a domed top on a plinth (approximate, from the photos).
	_tank(Vector3(middle + 1.0, top + 0.3, -5.5), 1.7)

## The open ground floor under the wing: tiles, columns, the glass doors and turnstile
## at the back, the bins by it, and the open stair behind its brown grille.
func _porch() -> void:
	var white: Material = w.material("stucco", Color("f4f3ed"))
	var steel: Material = w.material("plain", Color("4a4f52"))
	var length := WING.y - WING.x
	var middle := (WING.x + WING.y) / 2.0
	w.box(Vector3(length, 0.4, WING_FRONT - PORCH_BACK + 0.4), Vector3(middle, FLOOR_Y - 0.2, (WING_FRONT + PORCH_BACK) / 2.0 + 0.2), w.material("floor", Color("cfcac0")))
	for x in PORCH_COLUMNS:
		w.box(Vector3(0.6, GROUND - 0.45, 0.6), Vector3(x, (GROUND - 0.45) / 2.0, COLUMN_Z), white)
		w.box(Vector3(0.66, 0.15, 0.66), Vector3(x, 0.07, COLUMN_Z), w.material("plain", Color("a8775a")))
	# The back wall: glass doors into the lobby, lit by day like an inside.
	w.box(Vector3(length, GROUND, 0.2), Vector3(middle, GROUND / 2.0, PORCH_BACK), w.material("stucco", Color("e8e6de")))
	w.box(Vector3(4.6, 2.6, 0.06), Vector3(21.2, FLOOR_Y + 1.3, PORCH_BACK + 0.12), w.material("plain", Color("2c3034")))
	w.box(Vector3(4.3, 2.4, 0.05), Vector3(21.2, FLOOR_Y + 1.25, PORCH_BACK + 0.16), w.glow(Color("c9c2ae"), 0.15, 1.0))
	for x in [19.2, 20.2, 21.2, 22.2, 23.2]:
		w.box(Vector3(0.07, 2.4, 0.08), Vector3(x, FLOOR_Y + 1.25, PORCH_BACK + 0.2), steel)
	# The turnstile line: steel posts with arms, a guard's desk at its south end.
	for x in [19.6, 20.8, 22.0]:
		w.box(Vector3(0.3, 1.0, 0.5), Vector3(x, FLOOR_Y + 0.5, TURNSTILE_Z), w.material("plain", Color("8d9496")))
		w.box(Vector3(0.6, 0.05, 0.05), Vector3(x + 0.45, FLOOR_Y + 0.85, TURNSTILE_Z), steel)
	w.box(Vector3(1.2, 0.95, 0.7), Vector3(WING.x + 0.75, FLOOR_Y + 0.47, TURNSTILE_Z - 0.3), w.material("wood", Color("8a6a55")))
	# The green "MGN 09" bin and a yellow one beside the entrance.
	w.box(Vector3(0.6, 1.0, 0.6), Vector3(23.4, FLOOR_Y + 0.5, 0.2), w.material("plain", Color("2f6b45")))
	w.panel("MGN 09", Vector3(23.4, FLOOR_Y + 0.75, 0.52), 0.5, 0.16, Color("f2f2ec"))
	w.box(Vector3(0.55, 0.95, 0.55), Vector3(22.75, FLOOR_Y + 0.47, 0.2), w.material("plain", Color("d8b23c")))
	# The stair: up from the north end of the porch towards the south, to the first landing.
	var steps := 13
	var rise := (GROUND - 0.6 - FLOOR_Y) / steps
	var run := (STAIR.y - STAIR.x) / steps
	var tread: Material = w.material("floor", Color("eee9e2"))
	for i in steps:
		var height := FLOOR_Y + rise * (i + 1)
		w.box(Vector3(run + 0.02, height, 2.1), Vector3(STAIR.y - run * (i + 0.5), height / 2.0, 2.05), tread)
	w.rod(Vector3(STAIR.y, FLOOR_Y + 0.95, 3.05), Vector3(STAIR.x, GROUND - 0.6 + 0.95, 3.05), 0.03, Color("6b4a32"))
	# The brown grille in front of it, floor to slab.
	var brown: Material = w.material("plain", Color("7a5038"))
	var x := STAIR.x - 0.3
	while x <= WING.y - 0.2:
		w.box(Vector3(0.05, GROUND - 0.5, 0.05), Vector3(x, (GROUND - 0.5) / 2.0, COLUMN_Z - 0.35), brown)
		x += 0.28
	for y in [0.4, GROUND - 0.7]:
		w.box(Vector3(WING.y - STAIR.x, 0.06, 0.08), Vector3((WING.y + STAIR.x) / 2.0 - 0.2, y, COLUMN_Z - 0.35), brown)
	# Lights under the porch slab, on at night.
	w.box(Vector3(1.2, 0.06, 0.12), Vector3(21.2, GROUND - 0.52, 1.6), w.glow(Color("f4f1e6"), 0.3, 2.2))
	w._omni(Vector3(21.2, GROUND - 0.9, 1.6), Color("ffd79d"), 1.2, 6.0)

# --- The ends ---------------------------------------------------------------------------

## The north block on the chapel walkway side: plain white, pairs of dark windows
## stacked up its north face (the photo from the PGN walkway), slits on its east face.
func _north_block() -> void:
	var white: Material = w.material("stucco", Color("f3f2ec"))
	var dark: Material = w.material("glass", Color("2f363c"))
	var lit: Material = w.glow(Color("ffc281"), 0.0, 1.35)
	var ledge: Material = w.material("stucco", Color("e4e2da"))
	var from := WING.y
	var length := NORTH_END - from
	var top := ROOF + 0.3
	w.box(Vector3(length, top, PORCH_BACK - NORTH_BACK), Vector3(from + length / 2.0, top / 2.0, (PORCH_BACK + NORTH_BACK) / 2.0), white)
	w.box(Vector3(length + 0.3, 0.3, PORCH_BACK - NORTH_BACK + 0.3), Vector3(from + length / 2.0, top + 0.15, (PORCH_BACK + NORTH_BACK) / 2.0), w.material("stucco", Color("d6d4cc")))
	var unit: Material = w.material("metal", Color("d9dcda"))
	var grille: Material = w.material("plain", Color("6d7476"))
	for k in FLOORS + 1:
		var y := (FLOOR_Y + 1.5) if k == 0 else GROUND + (k - 1) * STOREY + 1.6
		for pair in [-13.4, -6.2]:
			for dz in [-0.8, 0.8]:
				w.framed_window(Vector3(NORTH_END, y, pair + dz), 1.1, 1.4, Vector3.RIGHT, posmod(k + roundi(pair), 4) == 0 and dz > 0.0)
			w.box(Vector3(0.4, 0.12, 3.2), Vector3(NORTH_END + 0.2, y - 0.86, pair), ledge)
			# A split AC unit on a bracket under every other pair.
			if k > 0 and posmod(k + roundi(pair), 2) == 0:
				w.box(Vector3(0.36, 0.55, 0.8), Vector3(NORTH_END + 0.22, y - 1.3, pair + 1.7), unit)
				w.box(Vector3(0.02, 0.4, 0.55), Vector3(NORTH_END + 0.41, y - 1.3, pair + 1.7), grille)
		w.framed_window(Vector3(34.6, y, PORCH_BACK), 0.9, 1.6, Vector3.BACK, posmod(k, 3) == 1, 0)
	_back_windows(Vector2(LONG + 1.0, NORTH_END - 1.5), NORTH_BACK)
	_floor_bands(Vector2(NORTH_BACK, PORCH_BACK), NORTH_END, Vector3.RIGHT)
	_floor_bands(Vector2(from, NORTH_END), PORCH_BACK, Vector3.BACK)
	_parapet(Vector2(from, NORTH_END), Vector2(NORTH_BACK, PORCH_BACK), top)

## The south wing beside SJH: a plain block with rows of windows on its north face, and
## the service block at its east end rising past the roof with a tank on top (the one
## circled in photo 05, between SJH's west end and the long block).
func _south_wing() -> void:
	var white: Material = w.material("stucco", Color("f0efe8"))
	var roof: Material = w.material("stucco", Color("d6d4cc"))
	var dark: Material = w.material("glass", Color("3f4a52"))
	var lit: Material = w.glow(Color("ffc281"), 0.0, 1.35)
	var length := SOUTH_WING.y - SOUTH_WING.x
	var middle := (SOUTH_WING.x + SOUTH_WING.y) / 2.0
	w.box(Vector3(length, ROOF, SOUTH_FRONT - SOUTH_BACK), Vector3(middle, ROOF / 2.0, (SOUTH_FRONT + SOUTH_BACK) / 2.0), white)
	w.box(Vector3(length + 0.3, 0.35, SOUTH_FRONT - SOUTH_BACK + 0.3), Vector3(middle, ROOF + 0.17, (SOUTH_FRONT + SOUTH_BACK) / 2.0), roof)
	# The piece west of the long block's back.
	w.box(Vector3(-14.5 + LONG, ROOF, BACK - SOUTH_BACK), Vector3((-14.5 - LONG) / 2.0, ROOF / 2.0, (BACK + SOUTH_BACK) / 2.0), white)
	for k in FLOORS + 1:
		var y := (FLOOR_Y + 1.5) if k == 0 else GROUND + (k - 1) * STOREY + 1.6
		var z := SOUTH_BACK + 2.0
		while z < SOUTH_FRONT - 4.0:
			if z < BACK - 0.5 or z > 0.5:
				w.framed_window(Vector3(SOUTH_WING.y, y, z), 2.0, 1.3, Vector3.RIGHT, posmod(roundi(z) + k * 3, 5) == 0)
			w.framed_window(Vector3(SOUTH_WING.x, y, z), 2.0, 1.3, Vector3.LEFT, posmod(roundi(z) + k, 7) == 0)
			z += 3.4
	_floor_bands(Vector2(SOUTH_BACK, SOUTH_FRONT), SOUTH_WING.y, Vector3.RIGHT)
	_floor_bands(Vector2(SOUTH_BACK, SOUTH_FRONT), SOUTH_WING.x, Vector3.LEFT)
	_parapet(Vector2(SOUTH_WING.x, SOUTH_WING.y - 5.4), Vector2(SOUTH_BACK, SOUTH_FRONT), ROOF)
	# The service block: narrower, taller, with a dark doorway and the tank.
	var block_top := ROOF + 2.4
	w.box(Vector3(5.2, block_top, 5.0), Vector3(SOUTH_WING.y - 2.8, block_top / 2.0, SOUTH_FRONT - 2.4), white)
	w.box(Vector3(5.6, 0.3, 5.4), Vector3(SOUTH_WING.y - 2.8, block_top + 0.15, SOUTH_FRONT - 2.4), roof)
	w.box(Vector3(1.4, 2.3, 0.06), Vector3(SOUTH_WING.y - 2.8, FLOOR_Y + 1.15, SOUTH_FRONT + 0.13), w.material("plain", Color("2c2e30")))
	for k in FLOORS:
		w.box(Vector3(0.9, 1.0, 0.06), Vector3(SOUTH_WING.y - 2.8, GROUND + k * STOREY + 1.6, SOUTH_FRONT + 0.13), dark)
	_tank(Vector3(SOUTH_WING.y - 2.8, block_top + 0.3, SOUTH_FRONT - 2.4), 1.6)
	_bridge(SOUTH_WING.y - 2.8)

## The covered bridge from the service block's third floor across to SJH's west end, from
## IMG_1542: a concrete deck with solid parapets and a steel rail, under a ribbed tin roof
## on four steel posts.
func _bridge(x: float) -> void:
	var white: Material = w.material("stucco", Color("ecebe4"))
	var steel: Material = w.material("metal", Color("4a4e52"))
	var floor_y := GROUND + STOREY
	# Where SJH's west face crosses the bridge's line, in this frame.
	var mid := world(x, SOUTH_FRONT)
	var face := Sjh.world(Sjh.HALF, Sjh.local(mid.x, mid.y).y)
	var far := local(face.x, face.y).y + 0.1
	var span := far - SOUTH_FRONT
	var centre := (SOUTH_FRONT + far) / 2.0
	w.box(Vector3(2.6, 0.6, span), Vector3(x, floor_y - 0.3, centre), white)
	for side in [-1.0, 1.0]:
		w.box(Vector3(0.16, 1.0, span), Vector3(x + side * 1.22, floor_y + 0.5, centre), white)
		w.box(Vector3(0.05, 0.05, span), Vector3(x + side * 1.22, floor_y + 1.2, centre), steel)
		for z in [SOUTH_FRONT + 0.2, far - 0.2]:
			w.box(Vector3(0.08, 2.6, 0.08), Vector3(x + side * 1.22, floor_y + 1.3, z), steel)
	# The ribbed roof, pitched a little for the rain, and its steel eave on MGN's side.
	w.box(Vector3(3.0, 0.05, span + 0.6), Vector3(x, floor_y + 2.65, centre), w.material("ribbed", Color("9ea4a6")), 0.0, -0.06)
	w.box(Vector3(3.0, 0.14, 0.06), Vector3(x, floor_y + 2.55, SOUTH_FRONT), steel)

## Thin white bands along a face at every floor line, standing a little proud of it, as on
## the APS wing: `span` runs along the face (local x for a ±Z face, local z for ±X),
## `face` is the face's plane and `normal` its outward direction.
func _floor_bands(span: Vector2, face: float, normal: Vector3) -> void:
	var band: Material = w.material("stucco", Color("fbfaf4"))
	var length := span.y - span.x + 0.2
	var middle := (span.x + span.y) / 2.0
	for k in FLOORS:
		var y := GROUND + k * STOREY - 0.12
		if normal.x != 0.0:
			w.box(Vector3(0.14, 0.2, length), Vector3(face + normal.x * 0.07, y, middle), band)
		else:
			w.box(Vector3(length, 0.2, 0.14), Vector3(middle, y, face + normal.z * 0.07), band)

## A low parapet round a flat roof (x and z spans, local) at height `top`, with a coping.
func _parapet(xs: Vector2, zs: Vector2, top: float) -> void:
	var wall: Material = w.material("stucco", Color("f1f0ea"))
	var coping: Material = w.material("stucco", Color("dcdad2"))
	var lx := xs.y - xs.x
	var lz := zs.y - zs.x
	for z in [zs.x + 0.1, zs.y - 0.1]:
		w.box(Vector3(lx, 0.7, 0.2), Vector3((xs.x + xs.y) / 2.0, top + 0.65, z), wall)
		w.box(Vector3(lx + 0.1, 0.07, 0.3), Vector3((xs.x + xs.y) / 2.0, top + 1.03, z), coping)
	for x in [xs.x + 0.1, xs.y - 0.1]:
		w.box(Vector3(0.2, 0.7, lz), Vector3(x, top + 0.65, (zs.x + zs.y) / 2.0), wall)
		w.box(Vector3(0.3, 0.07, lz + 0.1), Vector3(x, top + 1.03, (zs.x + zs.y) / 2.0), coping)

## A roof water tank: a grey drum with a domed lid on a low plinth.
func _tank(at: Vector3, radius: float) -> void:
	var grey: Material = w.material("metal", Color("dfe2e0"))
	w.box(Vector3(radius * 2.2, 0.3, radius * 2.2), at + Vector3(0, 0.15, 0), w.material("stucco", Color("d6d4cc")))
	var drum := CylinderMesh.new()
	drum.top_radius = radius
	drum.bottom_radius = radius
	drum.height = 1.8
	drum.radial_segments = 16
	w._mesh(drum, at + Vector3(0, 1.2, 0), grey)
	var lid := SphereMesh.new()
	lid.radius = radius
	lid.height = radius * 0.9
	lid.is_hemisphere = true
	lid.radial_segments = 16
	w._mesh(lid, at + Vector3(0, 2.1, 0), grey)

# --- In front -------------------------------------------------------------------------

## The raised garden along the corridor front behind a weathered white kerb wall, with
## rocks in the planting (the closeup photo).
func _garden() -> void:
	var length := LONG - GARDEN_FROM
	var middle := (LONG + GARDEN_FROM) / 2.0
	w.box(Vector3(length, 0.5, GARDEN - 0.1), Vector3(middle, 0.05, GARDEN / 2.0 + 0.05), w.material("grass", Color("e9f0dc")))
	w.box(Vector3(length + 0.3, 0.7, 0.28), Vector3(middle, 0.15, GARDEN - 0.1), w.material("stucco", Color("e5e1d6")))
	w.box(Vector3(length + 0.4, 0.08, 0.34), Vector3(middle, 0.52, GARDEN - 0.1), w.material("stucco", Color("eeebe2")))
	var rock: Material = w.material("stone", Color("6d6a66"))
	var random := RandomNumberGenerator.new()
	random.seed = 1414
	for i in 14:
		var x := random.randf_range(GARDEN_FROM + 1.0, LONG - 1.0)
		var size := random.randf_range(0.35, 0.7)
		var lz := random.randf_range(0.8, GARDEN - 0.7)
		if Geometry2D.get_closest_point_to_segment(Vector2(x, lz), WALK_FROM, WALK_TO).distance_to(Vector2(x, lz)) < WALK_HALF + 0.5:
			continue # not on the walk
		w.box(Vector3(size, size * 0.7, size * 0.9), Vector3(x, 0.3 + size * 0.3, lz), rock, random.randf() * PI)

## The north entrance's forecourt, its overhang, pillars and lobby, the drain, the bins and
## pots, and the paver corner beside it.
func _forecourt() -> void:
	var court := FORECOURT
	var middle := court.get_center()
	var grout: Material = w.material("plain", Color("5d6164"))
	var white: Material = w.material("stucco", Color("eceae3"))
	w.box(Vector3(court.size.x, FORECOURT_Y + 0.1, court.size.y), Vector3(middle.x, (FORECOURT_Y - 0.1) / 2.0, middle.y), w.material("slab", Color("e2e3df")))
	var x := court.position.x + 0.5
	while x < court.end.x - 0.2:
		w.box(Vector3(0.13, 0.012, court.size.y - 0.2), Vector3(x, FORECOURT_Y + 0.006, middle.y), grout)
		x += 1.0
	var z := court.position.y + 0.5
	while z < court.end.y - 0.2:
		w.box(Vector3(court.size.x - 0.2, 0.012, 0.13), Vector3(middle.x, FORECOURT_Y + 0.006, z), grout)
		z += 1.0
	# The white kerb along its front and south side, weathered.
	w.box(Vector3(court.size.x + 0.2, FORECOURT_Y + 0.12, 0.2), Vector3(middle.x, (FORECOURT_Y + 0.12) / 2.0 - 0.06, court.end.y), white)
	w.box(Vector3(0.2, FORECOURT_Y + 0.12, court.size.y), Vector3(court.position.x, (FORECOURT_Y + 0.12) / 2.0 - 0.06, middle.y), white)
	# The grated drain along the road.
	w.box(Vector3(court.size.x, 0.04, DRAIN), Vector3(middle.x, 0.0, court.end.y + DRAIN / 2.0), w.material("ribbed", Color("6d7173")))
	# The first floor's overhang on two square pillars, the dark lobby behind them.
	w.box(Vector3(court.size.x + 0.8, 0.45, OVERHANG - PORCH_BACK), Vector3(middle.x, GROUND - 0.225, (OVERHANG + PORCH_BACK) / 2.0), white)
	for pillar in FORECOURT_PILLARS:
		w.box(Vector3(0.55, GROUND - 0.45 - FORECOURT_Y, 0.55), Vector3(pillar, (GROUND - 0.45 + FORECOURT_Y) / 2.0, PILLAR_Z), white)
		w.box(Vector3(0.6, 0.12, 0.6), Vector3(pillar, FORECOURT_Y + 0.06, PILLAR_Z), w.material("plain", Color("b48a6a")))
	w.box(Vector3(4.2, GROUND - 0.45 - FORECOURT_Y, 0.06), Vector3(34.3, (GROUND - 0.45 + FORECOURT_Y) / 2.0, PORCH_BACK + 0.05), w.material("plain", Color("2b2e31")))
	w.box(Vector3(1.6, 0.06, 0.1), Vector3(34.3, GROUND - 0.55, PORCH_BACK + 0.4), w.glow(Color("f4f1e6"), 0.6, 2.0))
	# The bins: yellow, green, blue.
	for i in BINS.size():
		var spot: Vector2 = BINS[i]
		w.box(Vector3(0.42, 0.9, 0.48), Vector3(spot.x, FORECOURT_Y + 0.45, spot.y), w.material("plain", [Color("e1bf22"), Color("2f7a3c"), Color("2b4f9b")][i]))
	# Terracotta pots with leafy plants.
	for spot in POTS:
		w.box(Vector3(0.6, 0.5, 0.6), Vector3(spot.x, FORECOURT_Y + 0.25, spot.y), w.material("plain", Color("b5653f")))
		w._shrub(Vector3(spot.x, FORECOURT_Y + 0.5, spot.y), 0.8, 1460 + roundi(spot.y * 10.0)) # in MGN's frame, like the rest here
	# The corner: red octagon pavers to the covered walkway; they run on along the road to the
	# boulevard's curved corner (middle_road.gd).
	var depth := FORECOURT.end.y + DRAIN - PORCH_BACK
	w.box(Vector3(CORNER.y - CORNER.x, 0.06, depth), Vector3((CORNER.x + CORNER.y) / 2.0, -0.02, PORCH_BACK + depth / 2.0), w.material("octagon"))

## The paver walk, laid over the garden from the kerb to the corridor, with its kerbs.
func _walk() -> void:
	var along := WALK_TO - WALK_FROM
	var turn := atan2(-along.y, along.x)
	var middle := (WALK_FROM + WALK_TO) / 2.0
	var side := Vector2(-along.y, along.x).normalized()
	w.box(Vector3(along.length(), 0.08, 2.0 * WALK_HALF), Vector3(middle.x, WALK_Y - 0.04, middle.y), w.material("brick", Color("8a5446")), turn)
	for k in [-1.0, 1.0]:
		var edge: Vector2 = middle + side * k * (WALK_HALF + 0.08)
		w.box(Vector3(along.length() - 0.4, 0.36, 0.16), Vector3(edge.x, 0.18, edge.y), w.material("stucco", Color("e5e1d6")), turn)

## The big shade trees, short palms and shrubs in the garden (world coordinates).
func _planting() -> void:
	var palms := Chapel.new()
	palms.w = w
	for tree in [Vector3(12.5, 2.0, 13.5), Vector3(-5.0, 1.8, 12.0), Vector3(-15.0, 2.2, 10.5)]:
		var at := world(tree.x, tree.y)
		w._tree(Vector3(at.x, 0.3, at.y), tree.z, 1400 + roundi(tree.x))
	for spot in [Vector2(16.4, 2.6), Vector2(8.0, 1.4), Vector2(1.5, 2.8), Vector2(-10.5, 1.3)]:
		var at := world(spot.x, spot.y)
		palms._palm(Vector3(at.x, 0.3, at.y), 4.2 + absf(spot.x) * 0.05, 1420 + roundi(spot.x))
	for lx in [15.0, 10.0, 5.5, 3.0, -2.0, -8.0, -12.5, -16.5, -20.5, -24.0, -27.5]:
		var at := world(lx, 2.2 + fmod(absf(lx), 1.5))
		w._shrub(Vector3(at.x, 0.3, at.y), 1.1, 1440 + roundi(lx))

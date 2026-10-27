extends RefCounted
## The Covered Court (no. 19), from Sean's photos (assets/images/buildings/covered court
## beside IH/, and assets/Fix beside aps/): the long open shed between the canteen wing and
## the IH Gym, its long axis east from the parking lane. A tall gabled nave on grey steel
## portal frames (I-beam rafters on box columns), and either side of it a low aisle on
## lattice girders, open over a lattice clerestory; both gables clad in white ribbed sheet
## round a big glazed window (an arched grid with louvre panels at its sides), a ridge cap
## on top. Inside, a grey concrete floor raised 0.3 m: the maroon basketball court across
## the west end (an olive border, grey keys and centre circle, the winged seal, HOLY ANGEL
## UNIVERSITY painted beside it), two red volleyball courts with orange edges further east
## with black padded net posts and umpire ladders, white plastic chairs; concrete bleachers
## under the north aisle, a concrete parapet along the south side, steel railings and small
## steel stands at the west front; the yellow AERO LABORATORY gate across the east end (the
## lab behind it is closed). The ramp with steel rails runs up from the gym's lane.
##
## World coordinates (metres, Y up), on the plan's plot (campus_plan.gd "court", 4 m east of
## OSM to leave room for the pergola island and the parking lane by the canteen's tip, 3 m
## south for the covered walkway along Sacred Heart): the shed is square to x; past its east
## end the plot is a concrete pad. The roof and everything over the floor is in its own node
## (ROOF_GROUP), which aps.gd fades while the student is under it; the gables stay, so the
## east one's window still stands over the AERO gate.

## The shed's floor (x, z) and its height; the column lines along it (x of the first, and
## their spacing).
const SHED := Rect2(53.0, 22.0, 46.0, 37.0)
const FLOOR_Y := 0.3
const FIRST_COLUMN := 53.5
const BAY := 5.0
## The aisles' outer columns and the nave's columns (z of each row).
const OUTER: Array[float] = [22.3, 58.7]
const NAVE: Array[float] = [26.3, 54.7]
## Heights: the aisles' eave at the outer columns and their top at the nave's columns; the
## nave's knee and ridge; how far the roofs overhang.
const AISLE_EAVE := 5.4
const AISLE_TOP := 6.3
const KNEE := 9.2
const RIDGE := 15.2
const OVERHANG := 1.2
## The ramp along the south side, from the lane up to the floor (x from..to, its width); the
## parapet along the south side, open at the ramp's top.
const RAMP := Vector2(66.0, 86.0)
const RAMP_WIDE := 1.6
const PARAPET_Z := SHED.end.y - 0.15
const PARAPET := 1.0
## The concrete bleachers under the north aisle (z from..to; steps; x from..to).
const STANDS := Vector2(22.4, 26.4)
const STEPS := 5
const STANDS_X := Vector2(55.0, 92.0)
## The west front: the steel railing along it, open in the middle to the parking lane; the
## small steel stands either side inside it.
const FRONT_X := SHED.position.x + 0.15
const FRONT_GAP := Vector2(38.5, 45.5)
## The basketball court (its playing area; the olive border round it), the volleyball
## courts (playing areas) and their net line.
const BASKETBALL := Rect2(56.0, 27.8, 15.0, 28.0)
const BORDER := 1.3
const VOLLEYBALL: Array[Rect2] = [Rect2(74.0, 29.5, 18.0, 9.0), Rect2(74.0, 45.0, 18.0, 9.0)]
const NET_X := 83.0
## The AERO LABORATORY gate across the east end, on a column line; the lab behind it.
const GATE_X := 93.5
## White plastic chairs about the floor: x, z, facing (radians).
const CHAIRS: Array[Vector3] = [Vector3(73.2, 41.0, 3.1), Vector3(73.4, 42.4, 3.3), Vector3(76.0, 41.5, 0.2),
	Vector3(58.0, 57.4, -1.6), Vector3(59.0, 57.6, -1.5), Vector3(90.5, 40.2, 1.6), Vector3(91.2, 43.5, 2.9)]
## The red standpipe and the orange bin at the north-west corner.
const HYDRANT := Vector2(53.6, 23.0)
## Facing south at the gym from the lane the camera stands over the court: everything north
## of this world z (the roof, its columns) is cut away (aps.gd).
const CUT_Z := SHED.position.y + SHED.size.y + 0.3
## The plot's east edge, where the pad past the shed ends.
const PAD_END := 109.4
## The roof's node (faded while the student is under it).
const ROOF_GROUP := "CoveredCourtRoof"

static func centre_z() -> float:
	return (NAVE[0] + NAVE[1]) / 2.0

## The column lines along the shed (world x).
static func columns() -> Array[float]:
	var at: Array[float] = []
	var x := FIRST_COLUMN
	while x <= SHED.end.x - 0.4:
		at.append(x)
		x += BAY
	return at

## On the floor, or on the ramp up from the lane.
static func walkable(x: float, z: float) -> bool:
	return SHED.has_point(Vector2(x, z)) or on_ramp(x, z)

static func on_ramp(x: float, z: float) -> bool:
	return x >= RAMP.x and x <= RAMP.y and z > SHED.end.y and z <= SHED.end.y + RAMP_WIDE

## 0..1: how far the camera faces east down the courts (1 on the floor, rising across the
## first metre in from the west front and the north and south edges).
static func view_for(x: float, z: float) -> float:
	if not SHED.grow(1.0).has_point(Vector2(x, z)):
		return 0.0
	return smoothstep(SHED.position.x - 1.0, SHED.position.x, x) * smoothstep(SHED.position.y - 1.0, SHED.position.y, z) \
		* (1.0 - smoothstep(SHED.end.y, SHED.end.y + 1.0, z))

## Under the roof (the camera fades it).
static func under_roof(x: float, z: float) -> bool:
	return SHED.grow(0.3).has_point(Vector2(x, z))

static func blocked(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	if not walkable(x, z):
		return false
	if on_ramp(x, z):
		return absf(z - (SHED.end.y + RAMP_WIDE)) < 0.12 # the ramp's outer rail
	if x > GATE_X - 0.2:
		return true # the gate, and the closed lab behind it
	for column in columns():
		if absf(x - column) < 0.35:
			for row in OUTER + NAVE:
				if absf(z - row) < 0.35:
					return true
	if z > STANDS.x and z < STANDS.y and x > STANDS_X.x and x < STANDS_X.y:
		return true # the bleachers
	if absf(z - PARAPET_Z) < 0.2 and (x < RAMP.y - 2.0 or x > RAMP.y):
		return true # the parapet, open at the ramp's top
	if absf(x - FRONT_X) < 0.15 and (z < FRONT_GAP.x or z > FRONT_GAP.y):
		return true # the west railing, open in the middle
	for stand in _front_stands():
		if stand.has_point(at):
			return true
	for court in VOLLEYBALL:
		for post in [Vector2(NET_X, court.position.y - 0.9), Vector2(NET_X, court.end.y + 0.9)]:
			if at.distance_to(post) < 0.25:
				return true
	for chair in CHAIRS:
		if at.distance_to(Vector2(chair.x, chair.y)) < 0.3:
			return true
	for hoop in _hoop_bases():
		if absf(x - hoop.x) < 0.75 and absf(z - hoop.y) < 0.55:
			return true
	return at.distance_to(HYDRANT) < 0.4

static func floor_height(x: float, z: float) -> float:
	if SHED.has_point(Vector2(x, z)):
		return FLOOR_Y
	if on_ramp(x, z):
		return lerpf(-0.185, FLOOR_Y, clampf((x - RAMP.x) / (RAMP.y - 2.0 - RAMP.x), 0.0, 1.0))
	return NAN

## The baskets at both ends of the basketball court, and which way each faces (+1 into +z).
static func _baskets() -> Array[Vector3]:
	var mid := BASKETBALL.get_center()
	return [Vector3(mid.x, BASKETBALL.position.y + 1.575, 1.0), Vector3(mid.x, BASKETBALL.end.y - 1.575, -1.0)]

## The hoops' bases, behind the baselines.
static func _hoop_bases() -> Array[Vector2]:
	var bases: Array[Vector2] = []
	for basket in _baskets():
		bases.append(Vector2(basket.x, basket.y - basket.z * 2.4))
	return bases

## The small steel stands inside the west railing, either side of its opening.
static func _front_stands() -> Array[Rect2]:
	return [Rect2(53.4, 23.5, 1.2, FRONT_GAP.x - 24.5), Rect2(53.4, FRONT_GAP.y + 1.0, 1.2, 57.5 - FRONT_GAP.y - 1.0)]

var w: RefCounted

func build(world: RefCounted) -> void:
	w = world
	_floor()
	_basketball()
	_volleyball()
	_columns()
	_stands()
	_front()
	_parapet()
	_ramp()
	_gate()
	_props()
	_gables()
	w._flush()
	var saved: Node3D = w.root
	var roof := Node3D.new()
	roof.name = ROOF_GROUP
	saved.add_child(roof)
	w.root = roof
	_frames()
	_aisles()
	_roofs()
	_lamps()
	w._flush()
	w.root = saved

## A flat shape on the floor at y, from its corners.
func _paint(points: PackedVector2Array, y: float, made: Material) -> void:
	var triangles := PackedVector2Array()
	for k in Geometry2D.triangulate_polygon(points):
		triangles.append(points[k])
	w._ground(triangles, y, made)

func _rect(r: Rect2) -> PackedVector2Array:
	return PackedVector2Array([r.position, Vector2(r.end.x, r.position.y), r.end, Vector2(r.position.x, r.end.y)])

## A painted line from a to b on the floor.
func _line(a: Vector2, b: Vector2, y: float, made: Material, wide := 0.07) -> void:
	var middle := (a + b) / 2.0
	w.box(Vector3(wide, 0.006, a.distance_to(b) + wide), Vector3(middle.x, y, middle.y), made, atan2(b.x - a.x, b.y - a.y))

## A painted arc about centre from angle a to b (radians in the ground plane).
func _arc(centre: Vector2, radius: float, a: float, b: float, y: float, made: Material) -> void:
	var steps := maxi(6, ceili(absf(b - a) * radius / 0.4))
	for i in steps:
		var p := centre + Vector2(cos(lerpf(a, b, float(i) / steps)), sin(lerpf(a, b, float(i) / steps))) * radius
		var q := centre + Vector2(cos(lerpf(a, b, float(i + 1) / steps)), sin(lerpf(a, b, float(i + 1) / steps))) * radius
		_line(p, q, y, made)

## A filled disc segment (a fan) about centre from angle a to b.
func _fan(centre: Vector2, radius: float, a: float, b: float) -> PackedVector2Array:
	var points := PackedVector2Array([centre])
	for i in 17:
		var t := lerpf(a, b, i / 16.0)
		points.append(centre + Vector2(cos(t), sin(t)) * radius)
	return points

## The concrete floor on its plinth, and the plot's pad past the shed.
func _floor() -> void:
	var slab: Material = w.material("concrete", Color("a9aba7"))
	var middle := SHED.get_center()
	w.box(Vector3(SHED.size.x, FLOOR_Y + 0.2, SHED.size.y), Vector3(middle.x, (FLOOR_Y - 0.2) / 2.0, middle.y), slab)
	w.box(Vector3(PAD_END - SHED.end.x, 0.02, 60.0 - 46.0), Vector3((SHED.end.x + PAD_END) / 2.0, -0.18, 53.0), w.material("concrete"))

## The basketball court across the west end: the olive border, the maroon court, the grey
## keys (with their half circles) and centre circle, the white lines, the winged seal, the
## hoops on their steel frames at both ends, and HOLY ANGEL UNIVERSITY painted beside it.
func _basketball() -> void:
	var court := BASKETBALL
	var mid := court.get_center()
	var olive: Material = w.material("plain", Color("8a7a47"))
	var maroon: Material = w.material("plain", Color("7a2e30"))
	var grey: Material = w.material("plain", Color("7d8382"))
	var white: Material = w.material("plain", Color("ece9e0"))
	_paint(_rect(court.grow(BORDER)), FLOOR_Y + 0.003, olive)
	_paint(_rect(court), FLOOR_Y + 0.006, maroon)
	var y := FLOOR_Y + 0.012
	_paint(_fan(mid, 1.8, 0.0, TAU), FLOOR_Y + 0.009, grey)
	for end in [-1.0, 1.0]:
		var base: float = mid.y + end * court.size.y / 2.0
		var basket := Vector2(mid.x, base - end * 1.575)
		var line: float = base - end * 5.8
		# The key: grey, with its half circle out from the free-throw line.
		_paint(_rect(Rect2(mid.x - 2.45, minf(base, line), 4.9, 5.8)), FLOOR_Y + 0.009, grey)
		var away := -PI / 2.0 if end > 0.0 else PI / 2.0
		_paint(_fan(Vector2(mid.x, line), 1.8, away - PI / 2.0, away + PI / 2.0), FLOOR_Y + 0.009, grey)
		for x in [mid.x - 2.45, mid.x + 2.45]:
			_line(Vector2(x, base), Vector2(x, line), y, white)
		_line(Vector2(mid.x - 2.45, line), Vector2(mid.x + 2.45, line), y, white)
		_arc(Vector2(mid.x, line), 1.8, 0.0, TAU, y, white)
		# The three-point line: straight 0.9 m in from the sides, then the arc round the basket.
		var reach := sqrt(6.75 * 6.75 - (court.size.x / 2.0 - 0.9) * (court.size.x / 2.0 - 0.9))
		var bend := atan2(-end * reach, court.size.x / 2.0 - 0.9)
		for side in [-1.0, 1.0]:
			var x: float = mid.x + side * (court.size.x / 2.0 - 0.9)
			_line(Vector2(x, base), Vector2(x, basket.y - end * reach), y, white)
		# Round the basket on the court's side: through -90° at the south end, +90° at the north.
		var to := (PI - bend) if end < 0.0 else (-PI - bend)
		_arc(basket, 6.75, minf(bend, to), maxf(bend, to), y, white)
	for basket in _baskets():
		_hoop(Vector2(basket.x, basket.y), basket.z)
	for x in [court.position.x, court.end.x]:
		_line(Vector2(x, court.position.y), Vector2(x, court.end.y), y, white)
	for z in [court.position.y, court.end.y, mid.y]:
		_line(Vector2(court.position.x, z), Vector2(court.end.x, z), y, white)
	_arc(mid, 1.8, 0.0, TAU, y, white)
	_seal(mid, FLOOR_Y + 0.014)
	var text: Label3D = w.panel("HOLY ANGEL UNIVERSITY", Vector3(court.end.x + BORDER + 1.0, FLOOR_Y + 0.02, mid.y), 22.0, 2.2, Color("e9e6de"))
	text.rotation = Vector3(-PI / 2.0, -PI / 2.0, 0.0) # reading from the west, along +z
	text.name = "COURT LETTERING"

## The winged seal in the centre circle: two white wings of feathers and the dark shield.
func _seal(at: Vector2, y: float) -> void:
	var white: Material = w.material("plain", Color("f1eee6"))
	for side in [-1.0, 1.0]:
		var wing := PackedVector2Array([at + Vector2(side * 0.35, -0.35)])
		for i in 7:
			var t := i / 6.0
			var tip := Vector2(side * lerpf(0.5, 1.75, t), lerpf(-0.7, 0.35, t) + (0.18 if i % 2 == 1 else 0.0))
			wing.append(at + Vector2(tip.y, tip.x)) # the seal faces the court's long axis
		wing.append(at + Vector2(0.45, side * 0.35))
		_paint(wing, y, white)
	var shield := PackedVector2Array([at + Vector2(-0.45, -0.32), at + Vector2(-0.45, 0.32), at + Vector2(0.2, 0.32), at + Vector2(0.5, 0.0), at + Vector2(0.2, -0.32)])
	_paint(shield, y + 0.002, w.material("plain", Color("5a3a2a")))

## A hoop on a white steel frame behind the baseline: the weighted base, the post, its braces,
## the arm out over the court, the board and the ring over the basket (facing is +1 when the
## basket is in +z of the frame).
func _hoop(basket: Vector2, facing: float) -> void:
	var steel := Color("e4e5e2")
	var post := basket.y - facing * 2.0
	w.box(Vector3(1.4, 0.35, 1.0), Vector3(basket.x, FLOOR_Y + 0.175, post - facing * 0.4), w.material("plain", Color("3e4448")))
	w.rod(Vector3(basket.x, FLOOR_Y + 0.35, post - facing * 0.3), Vector3(basket.x, FLOOR_Y + 3.3, post), 0.08, steel)
	for side in [-0.5, 0.5]:
		w.rod(Vector3(basket.x + side, FLOOR_Y + 0.35, post - facing * 0.8), Vector3(basket.x, FLOOR_Y + 2.6, post - facing * 0.05), 0.04, steel)
	w.box(Vector3(0.12, 0.12, 1.65), Vector3(basket.x, FLOOR_Y + 3.3, post + facing * 0.82), w.material("plain", steel))
	w.box(Vector3(1.8, 1.05, 0.05), Vector3(basket.x, FLOOR_Y + 3.45, basket.y - facing * 0.375), w.material("plain", Color("f4f4f0")))
	w.box(Vector3(0.59, 0.45, 0.06), Vector3(basket.x, FLOOR_Y + 3.3, basket.y - facing * 0.36), w.material("plain", Color("c94a2a")))
	w.box(Vector3(0.45, 0.04, 0.45), Vector3(basket.x, FLOOR_Y + 3.05, basket.y), w.material("plain", Color("d0532b")))

## The two volleyball courts: red with an orange edge and white centre and attack lines,
## black padded net posts, the net, and an umpire's ladder by one post of each.
func _volleyball() -> void:
	var red: Material = w.material("plain", Color("a03f2f"))
	var orange: Material = w.material("plain", Color("d27e34"))
	var white: Material = w.material("plain", Color("e3ddd2"))
	var y := FLOOR_Y + 0.012
	for court in VOLLEYBALL:
		_paint(_rect(court.grow(0.08)), FLOOR_Y + 0.004, orange)
		_paint(_rect(court), FLOOR_Y + 0.007, red)
		for x in [NET_X, NET_X - 3.0, NET_X + 3.0]:
			_line(Vector2(x, court.position.y), Vector2(x, court.end.y), y, white, 0.05)
		var posts := [court.position.y - 0.9, court.end.y + 0.9]
		for z in posts:
			w.box(Vector3(0.22, 2.6, 0.22), Vector3(NET_X, FLOOR_Y + 1.3, z), w.material("plain", Color("1f2224")))
			w.box(Vector3(0.36, 0.08, 0.36), Vector3(NET_X, FLOOR_Y + 0.04, z), w.material("plain", Color("2b2e30")))
		# The net: a white band along its top, a few dark strands under it.
		var span: float = posts[1] - posts[0]
		w.box(Vector3(0.03, 0.07, span), Vector3(NET_X, FLOOR_Y + 2.4, court.get_center().y), w.material("plain", Color("f2f2ee")))
		for k in 4:
			w.rod(Vector3(NET_X, FLOOR_Y + 1.55 + k * 0.25, posts[0]), Vector3(NET_X, FLOOR_Y + 1.55 + k * 0.25, posts[1]), 0.006, Color("2a2c2e"))
		_ladder(Vector2(NET_X - 0.7, posts[0] - 0.5))

## An aluminium step ladder (the umpire's).
func _ladder(at: Vector2) -> void:
	var metal := Color("c7cacb")
	for dx in [-0.25, 0.25]:
		w.rod(Vector3(at.x + dx, FLOOR_Y, at.y - 0.45), Vector3(at.x + dx, FLOOR_Y + 1.9, at.y), 0.025, metal)
		w.rod(Vector3(at.x + dx, FLOOR_Y, at.y + 0.45), Vector3(at.x + dx, FLOOR_Y + 1.9, at.y), 0.025, metal)
	for k in 5:
		var t := (k + 1) / 6.0
		w.box(Vector3(0.5, 0.03, 0.09), Vector3(at.x, FLOOR_Y + 1.9 * t, at.y - 0.45 * (1.0 - t)), w.material("plain", metal))

## The columns: grey steel box columns on concrete bases, the nave's tall, the aisles' short,
## with downpipes on some of the nave's.
func _columns() -> void:
	var steel: Material = w.material("plain", Color("7f8488"))
	var base: Material = w.material("concrete", Color("8f918e"))
	for x in columns():
		for z in NAVE:
			w.box(Vector3(0.6, 0.7, 0.6), Vector3(x, FLOOR_Y + 0.35, z), base)
			w.box(Vector3(0.42, KNEE - FLOOR_Y, 0.42), Vector3(x, (KNEE + FLOOR_Y) / 2.0, z), steel)
		for z in OUTER:
			w.box(Vector3(0.5, 0.8, 0.5), Vector3(x, FLOOR_Y + 0.4, z), base)
			w.box(Vector3(0.3, AISLE_EAVE - FLOOR_Y, 0.3), Vector3(x, (AISLE_EAVE + FLOOR_Y) / 2.0, z), steel)
	var columns_x := columns()
	for i in range(1, columns_x.size(), 2):
		for z in NAVE:
			var out := -0.3 if z < centre_z() else 0.3
			w.rod(Vector3(columns_x[i] + 0.3, FLOOR_Y + 0.2, z + out), Vector3(columns_x[i] + 0.3, KNEE, z + out), 0.06, Color("c9ccce"))

## The portal frames: I-beam rafters from each nave column's knee up to the ridge, deeper at
## the haunch; the purlins along the roof; cross bracing in the end bays.
func _frames() -> void:
	var steel: Material = w.material("plain", Color("7c8186"))
	var dark: Material = w.material("plain", Color("5f6468"))
	var half := (NAVE[1] - NAVE[0]) / 2.0
	var slope := atan2(RIDGE - KNEE, half)
	var length := half / cos(slope)
	var mid_z := centre_z()
	for x in columns():
		for side in [-1.0, 1.0]:
			var middle := Vector3(x, (KNEE + RIDGE) / 2.0 - 0.3, mid_z + side * half / 2.0)
			w.box(Vector3(0.3, 0.6, length), middle, steel, 0.0, side * slope)
			# The haunch at the knee: a deeper piece over the column.
			var knee := Vector3(x, KNEE - 0.25, mid_z + side * (half - 1.2))
			w.box(Vector3(0.32, 1.1, 2.4), knee, steel, 0.0, side * slope)
	var long := SHED.size.x + 0.6
	var mid_x := SHED.get_center().x
	for side in [-1.0, 1.0]:
		for k in 11:
			var t := (k + 0.5) / 11.0
			var z: float = mid_z + side * half * t
			var y := RIDGE - (RIDGE - KNEE) * t - 0.62
			w.box(Vector3(long, 0.2, 0.09), Vector3(mid_x, y, z), dark)
	# Bracing rods in the first and last bays, under the roof.
	var cols := columns()
	for bay in [[cols[0], cols[1]], [cols[-2], cols[-1]]]:
		for side in [-1.0, 1.0]:
			var low := Vector3(0, KNEE - 0.4, mid_z + side * (half - 0.4))
			var high := Vector3(0, RIDGE - 0.8, mid_z + side * 0.6)
			w.rod(Vector3(bay[0], low.y, low.z), Vector3(bay[1], high.y, high.z), 0.025, Color("5f6468"))
			w.rod(Vector3(bay[1], low.y, low.z), Vector3(bay[0], high.y, high.z), 0.025, Color("5f6468"))

## The aisles: a lattice girder along each row of nave columns at the aisle's top and another
## a storey up in the clerestory, the aisle rafters out to the outer columns, the eave beams.
func _aisles() -> void:
	var steel := Color("7f8488")
	var plain: Material = w.material("plain", steel)
	var from := SHED.position.x + 0.3
	var to := SHED.end.x - 0.3
	for row in 2:
		var nave_z: float = NAVE[row]
		var outer_z: float = OUTER[row]
		for band in [[AISLE_TOP - 0.9, AISLE_TOP], [KNEE - 1.5, KNEE - 0.6]]:
			var low: float = band[0]
			var high: float = band[1]
			for y in [low, high]:
				w.box(Vector3(to - from, 0.12, 0.14), Vector3((from + to) / 2.0, y, nave_z), plain)
			var x := from
			var up := true
			while x < to - 0.01:
				var next := minf(x + 1.0, to)
				w.rod(Vector3(x, low if up else high, nave_z), Vector3(next, high if up else low, nave_z), 0.03, steel)
				up = not up
				x = next
		w.box(Vector3(to - from, 0.3, 0.18), Vector3((from + to) / 2.0, AISLE_EAVE + 0.1, outer_z), plain)
		var slope := atan2(AISLE_TOP - AISLE_EAVE, absf(nave_z - outer_z))
		for x in columns():
			var middle := Vector3(x, (AISLE_TOP + AISLE_EAVE) / 2.0, (nave_z + outer_z) / 2.0)
			w.box(Vector3(0.18, 0.35, absf(nave_z - outer_z) / cos(slope) + 0.3), middle, plain, 0.0, (1.0 if nave_z > outer_z else -1.0) * -slope)

## The roofs: the nave's two slopes of pale ribbed sheet with a ridge cap and gutters at the
## knee, the aisles' lean-tos out past the outer columns with fascias.
func _roofs() -> void:
	var sheet: Material = w.material("ribbed", Color("dcdfdd"))
	var trim: Material = w.material("plain", Color("b9bdbc"))
	var half := (NAVE[1] - NAVE[0]) / 2.0 + 0.5
	var slope := atan2(RIDGE - KNEE, half - 0.5)
	var length := half / cos(slope)
	var long := SHED.size.x + 0.8
	var mid_x := SHED.get_center().x
	var mid_z := centre_z()
	for side in [-1.0, 1.0]:
		var at := Vector3(mid_x, RIDGE - half * tan(slope) / 2.0 + 0.05, mid_z + side * half / 2.0)
		w.box(Vector3(long, 0.07, length + 0.05), at, sheet, 0.0, side * slope)
		w.box(Vector3(long, 0.3, 0.3), Vector3(mid_x, RIDGE - half * tan(slope) - 0.05, mid_z + side * half), trim)
	w.box(Vector3(long, 0.25, 1.2), Vector3(mid_x, RIDGE + 0.12, mid_z), trim)
	w.box(Vector3(long - 1.0, 0.5, 0.7), Vector3(mid_x, RIDGE + 0.4, mid_z), sheet) # the ridge cap
	for row in 2:
		var nave_z: float = NAVE[row]
		var outer_z: float = OUTER[row]
		var out := signf(outer_z - nave_z)
		var reach := absf(outer_z - nave_z) + OVERHANG
		var aisle_slope := atan2(AISLE_TOP - AISLE_EAVE, absf(outer_z - nave_z))
		var middle := Vector3(mid_x, AISLE_TOP + 0.15 - reach * tan(aisle_slope) / 2.0, nave_z + out * reach / 2.0)
		w.box(Vector3(long, 0.06, reach / cos(aisle_slope)), middle, sheet, 0.0, out * aisle_slope)
		w.box(Vector3(long, 0.3, 0.06), Vector3(mid_x, AISLE_TOP - reach * tan(aisle_slope), nave_z + out * reach), trim)

## The gables at both ends: white ribbed cladding filling the nave's triangle and the band
## over the aisles in pixel steps, round the big window: a grid of glass in dark frames with
## an arch across it and louvre panels at its sides.
func _gables() -> void:
	var clad: Material = w.material("ribbed", Color("eef0ed"))
	var glass: Material = w.material("glass", Color("93a6b0"))
	var louvre: Material = w.material("plain", Color("c8cdcf"))
	var frame: Material = w.material("plain", Color("4b5256"))
	var half := (NAVE[1] - NAVE[0]) / 2.0
	var mid_z := centre_z()
	var window := half * 0.62
	var sill := AISLE_TOP + 1.1
	for x in [SHED.position.x - 0.2, SHED.end.x + 0.2]:
		var out := -1.0 if x < SHED.get_center().x else 1.0
		var strip := 0.25
		var z := NAVE[0] - 0.4
		while z < NAVE[1] + 0.4:
			var c := z + strip / 2.0
			var top := lerpf(RIDGE, KNEE, clampf(absf(c - mid_z) / half, 0.0, 1.0))
			if absf(c - mid_z) < window:
				w.box(Vector3(0.1, sill - AISLE_TOP + 0.2, strip), Vector3(x, (AISLE_TOP - 0.2 + sill) / 2.0, c), clad)
				var made: Material = louvre if absf(c - mid_z) > window - 2.2 else glass
				w.box(Vector3(0.05, top - sill - 0.5, strip), Vector3(x + out * 0.02, (sill + top - 0.5) / 2.0, c), made)
				w.box(Vector3(0.1, 0.5, strip), Vector3(x, top - 0.25, c), clad)
			else:
				w.box(Vector3(0.1, top - AISLE_TOP + 0.2, strip), Vector3(x, (AISLE_TOP - 0.2 + top) / 2.0, c), clad)
			z += strip
		# The window's frames: uprights every metre, rails every 0.9 m, an arch over its middle.
		var u := -window
		while u <= window + 0.01:
			var top := lerpf(RIDGE, KNEE, absf(u) / half) - 0.5
			w.box(Vector3(0.08, top - sill, 0.07), Vector3(x + out * 0.05, (sill + top) / 2.0, mid_z + u), frame)
			u += 1.0
		var y := sill
		while y < RIDGE - 1.0:
			var reach := minf((1.0 - (y - KNEE) / (RIDGE - KNEE)) * half - 0.5, window) if y > KNEE else window
			if reach > 0.5:
				w.box(Vector3(0.08, 0.07, reach * 2.0), Vector3(x + out * 0.05, y, mid_z), frame)
			y += 0.9
		var arch_r := window - 2.2
		for i in 12:
			var a0 := PI * i / 12.0
			var a1 := PI * (i + 1) / 12.0
			var p := Vector2(cos(a0) * arch_r, sill + 1.2 + sin(a0) * arch_r * 0.75)
			var q := Vector2(cos(a1) * arch_r, sill + 1.2 + sin(a1) * arch_r * 0.75)
			w.rod(Vector3(x + out * 0.06, p.y, mid_z + p.x), Vector3(x + out * 0.06, q.y, mid_z + q.x), 0.04, Color("4b5256"))
		# The band over the aisles' roofs and the fascia along the gable's lower edge.
		w.box(Vector3(0.16, 0.3, NAVE[1] - NAVE[0] + 0.8), Vector3(x, AISLE_TOP - 0.2, mid_z), w.material("plain", Color("dadcd9")))

## Round pendant lamps hung under the nave, lit at night.
func _lamps() -> void:
	var lamp: Material = w.glow(Color("f2efe2"), 0.2, 2.4)
	var x := FIRST_COLUMN + BAY * 0.5
	while x < GATE_X:
		for z in [centre_z() - 7.0, centre_z() + 7.0]:
			w.rod(Vector3(x, KNEE + 1.6, z), Vector3(x, KNEE - 0.4, z), 0.01, Color("3a3d40"))
			w.box(Vector3(0.45, 0.2, 0.45), Vector3(x, KNEE - 0.5, z), lamp)
			w._omni(Vector3(x, KNEE - 0.9, z), Color("ffe6bf"), 1.2, 12.0)
		x += BAY * 2.0

## The concrete bleachers under the north aisle: grey steps rising to the back, steel
## handrails along the front and the back.
func _stands() -> void:
	var seat: Material = w.material("concrete", Color("9c9e9a"))
	var deep := (STANDS.y - STANDS.x) / STEPS
	for k in STEPS:
		var height := FLOOR_Y + 0.42 * (STEPS - k)
		var z := STANDS.x + deep * (k + 0.5)
		w.box(Vector3(STANDS_X.y - STANDS_X.x, height - FLOOR_Y, deep), Vector3((STANDS_X.x + STANDS_X.y) / 2.0, (height + FLOOR_Y) / 2.0, z), seat)
	var rail := Color("c4c8ca")
	w.rod(Vector3(STANDS_X.x, FLOOR_Y + 3.1, STANDS.x + 0.1), Vector3(STANDS_X.y, FLOOR_Y + 3.1, STANDS.x + 0.1), 0.03, rail)
	for x in [STANDS_X.x, STANDS_X.y]:
		w.rod(Vector3(x, FLOOR_Y, STANDS.y), Vector3(x, FLOOR_Y + 2.3, STANDS.x + 0.4), 0.03, rail)
		w.rod(Vector3(x, FLOOR_Y + 1.0, STANDS.y), Vector3(x, FLOOR_Y + 3.1, STANDS.x + 0.4), 0.03, rail)

## The west front: the grey steel railing of mesh panels between posts, open in the middle
## over the step; the small steel stands inside it.
func _front() -> void:
	var rail := Color("aeb3b5")
	var mesh: Material = w.material("plain", Color("9ea4a7"))
	for run in [[SHED.position.y + 0.3, FRONT_GAP.x], [FRONT_GAP.y, SHED.end.y - 0.3]]:
		for y in [FLOOR_Y + 0.15, FLOOR_Y + 0.6, FLOOR_Y + 1.05]:
			w.rod(Vector3(FRONT_X, y, run[0]), Vector3(FRONT_X, y, run[1]), 0.025, rail)
		var z: float = run[0]
		while z <= run[1] + 0.01:
			w.rod(Vector3(FRONT_X, FLOOR_Y, z), Vector3(FRONT_X, FLOOR_Y + 1.1, z), 0.03, rail)
			# The mesh: thin uprights between the posts.
			var k := 0.25
			while k < 1.5 and z + k < run[1]:
				w.box(Vector3(0.012, 0.85, 0.012), Vector3(FRONT_X, FLOOR_Y + 0.6, z + k), mesh)
				k += 0.25
			z += 1.5
	for stand in _front_stands():
		for k in 3:
			var x: float = stand.position.x + 0.2 + k * 0.4
			w.box(Vector3(0.36, 0.05, stand.size.y), Vector3(x, FLOOR_Y + 0.35 + k * 0.35, stand.get_center().y), w.material("plain", Color("8c9396")))
			var z := stand.position.y
			while z <= stand.end.y + 0.01:
				w.rod(Vector3(x, FLOOR_Y, z), Vector3(x, FLOOR_Y + 0.35 + k * 0.35, z), 0.02, Color("8c9396"))
				z += 2.0

## The concrete parapet along the south side, open at the ramp's top.
func _parapet() -> void:
	var wall: Material = w.material("concrete", Color("b3b2a8"))
	for run in [[SHED.position.x, RAMP.y - 2.0], [RAMP.y, SHED.end.x]]:
		var length: float = run[1] - run[0]
		w.box(Vector3(length, PARAPET, 0.22), Vector3((run[0] + run[1]) / 2.0, FLOOR_Y + PARAPET / 2.0, PARAPET_Z), wall)
		w.box(Vector3(length, 0.06, 0.3), Vector3((run[0] + run[1]) / 2.0, FLOOR_Y + PARAPET + 0.03, PARAPET_Z), w.material("concrete", Color("c4c3ba")))

## The concrete ramp along the south side up from the lane, with its steel rails.
func _ramp() -> void:
	var slab: Material = w.material("concrete", Color("bdbcb5"))
	var top := RAMP.y - 2.0
	var length := top - RAMP.x
	var slope := atan2(FLOOR_Y + 0.185, length)
	var z := SHED.end.y + RAMP_WIDE / 2.0
	# Turned a quarter so its length runs along x, then tilted to rise towards the floor.
	w.box(Vector3(RAMP_WIDE, 0.15, length / cos(slope)), Vector3((RAMP.x + top) / 2.0, (FLOOR_Y - 0.185) / 2.0 - 0.07, z), slab, PI / 2.0, -slope)
	w.box(Vector3(2.0, FLOOR_Y + 0.2, RAMP_WIDE), Vector3(top + 1.0, (FLOOR_Y - 0.2) / 2.0, z), slab) # the landing
	var rail := Color("c4c8ca")
	for y in [0.55, 0.95]:
		w.rod(Vector3(RAMP.x, -0.185 + y, SHED.end.y + RAMP_WIDE), Vector3(top, FLOOR_Y + y, SHED.end.y + RAMP_WIDE), 0.025, rail)
		w.rod(Vector3(top, FLOOR_Y + y, SHED.end.y + RAMP_WIDE), Vector3(RAMP.y, FLOOR_Y + y, SHED.end.y + RAMP_WIDE), 0.025, rail)
	var x := RAMP.x
	while x <= RAMP.y + 0.01:
		var base := lerpf(-0.185, FLOOR_Y, clampf((x - RAMP.x) / length, 0.0, 1.0))
		w.rod(Vector3(x, base, SHED.end.y + RAMP_WIDE), Vector3(x, base + 0.97, SHED.end.y + RAMP_WIDE), 0.022, rail)
		x += 2.0

## The AERO LABORATORY gate across the nave at the east end: yellow ribbed panels on a steel
## frame, a small door at its north end, a maroon plane, the letters and the seal; the
## lab behind it closed in yellow sheet up to the aisles' roofs.
func _gate() -> void:
	var yellow: Material = w.material("ribbed", Color("d6d48a"))
	var frame: Material = w.material("plain", Color("8c8f86"))
	var height := 4.1
	var face := GATE_X - 0.3
	var span := NAVE[1] - NAVE[0] - 0.5
	w.box(Vector3(0.12, height, span), Vector3(face, FLOOR_Y + height / 2.0, centre_z()), yellow)
	w.box(Vector3(0.16, 0.15, span), Vector3(face, FLOOR_Y + height, centre_z()), frame)
	for k in 5:
		var z := NAVE[0] + 0.25 + span * k / 4.0
		w.box(Vector3(0.16, height, 0.12), Vector3(face, FLOOR_Y + height / 2.0, z), frame)
	# The closed lab: its walls under the aisles, its roof the nave's.
	for z in [OUTER[0] + 0.2, OUTER[1] - 0.2]:
		w.box(Vector3(SHED.end.x - GATE_X, AISLE_EAVE - FLOOR_Y, 0.1), Vector3((GATE_X + SHED.end.x) / 2.0, (AISLE_EAVE + FLOOR_Y) / 2.0, z), yellow)
	for z in [(OUTER[0] + NAVE[0]) / 2.0, (OUTER[1] + NAVE[1]) / 2.0]:
		w.box(Vector3(0.1, AISLE_EAVE - FLOOR_Y, 4.0), Vector3(face, (AISLE_EAVE + FLOOR_Y) / 2.0, z), yellow)
	# Its dark inside, seen over the gate: a back wall at the gable up to the aisles' roofs.
	w.box(Vector3(0.1, AISLE_TOP + 0.3 - FLOOR_Y, OUTER[1] - OUTER[0]), Vector3(SHED.end.x - 0.1, (AISLE_TOP + 0.3 + FLOOR_Y) / 2.0, centre_z()), w.material("plain", Color("4b5053")))
	var door_z := NAVE[0] + 1.3
	w.box(Vector3(0.06, 2.1, 0.95), Vector3(face - 0.08, FLOOR_Y + 1.05, door_z), w.material("plain", Color("b9b7a6")))
	w.box(Vector3(0.05, 0.35, 0.5), Vector3(face - 0.12, FLOOR_Y + 2.35, door_z), w.material("plain", Color("7b2c2e")))
	# The plane: a maroon fuselage, swept wings and the tail, painted flat on the panels.
	var plane: Material = w.material("plain", Color("7a3330"))
	var plane_z := centre_z() - 4.5
	w.box(Vector3(0.03, 0.42, 4.2), Vector3(face - 0.08, FLOOR_Y + 2.4, plane_z), plane)
	for side in [-1.0, 1.0]:
		w.box(Vector3(0.03, 1.6, 0.5), Vector3(face - 0.08, FLOOR_Y + 2.4 + side * 0.85, plane_z + 0.3), plane, 0.0, side * 0.55)
	w.box(Vector3(0.03, 0.9, 0.35), Vector3(face - 0.08, FLOOR_Y + 2.85, plane_z - 1.9), plane, 0.0, 0.4)
	var aero: Label3D = w.panel("A E R O", Vector3(face - 0.1, FLOOR_Y + 2.85, centre_z() + 1.2), 5.0, 1.5, Color("3f3a35"))
	aero.rotation.y = -PI / 2.0
	aero.name = "AERO LABORATORY"
	var lab: Label3D = w.panel("L A B O R A T O R Y", Vector3(face - 0.1, FLOOR_Y + 1.85, centre_z() + 0.4), 11.0, 1.1, Color("3f7fd0"))
	lab.rotation.y = -PI / 2.0
	w.box(Vector3(0.04, 0.8, 0.7), Vector3(face - 0.08, FLOOR_Y + 2.75, centre_z() + 5.3), w.material("plain", Color("efe6d4")))

## White plastic chairs, the red standpipe and the orange bin at the north-west corner.
func _props() -> void:
	for chair in CHAIRS:
		_monobloc(Vector2(chair.x, chair.y), chair.z)
	var red := Color("b0382c")
	w.rod(Vector3(HYDRANT.x, FLOOR_Y, HYDRANT.y), Vector3(HYDRANT.x, FLOOR_Y + 0.7, HYDRANT.y), 0.09, red)
	w.rod(Vector3(HYDRANT.x - 0.35, FLOOR_Y + 0.5, HYDRANT.y), Vector3(HYDRANT.x + 0.35, FLOOR_Y + 0.5, HYDRANT.y), 0.06, red)
	w.box(Vector3(0.18, 0.12, 0.18), Vector3(HYDRANT.x, FLOOR_Y + 0.75, HYDRANT.y), w.material("metal", Color("b88a3c")))
	w.box(Vector3(0.45, 0.95, 0.45), Vector3(HYDRANT.x + 0.7, FLOOR_Y + 0.475, HYDRANT.y + 0.3), w.material("plain", Color("e3672a")))

## A white monobloc chair facing `facing` (radians in the ground plane).
func _monobloc(at: Vector2, facing: float) -> void:
	var white: Material = w.material("plain", Color("f0f0ec"))
	var forward := Vector2(cos(facing), sin(facing))
	var side := Vector2(-forward.y, forward.x)
	var turn := -facing
	for f in [-0.18, 0.18]:
		for s in [-0.2, 0.2]:
			var p: Vector2 = at + forward * f + side * s
			w.box(Vector3(0.04, 0.44, 0.04), Vector3(p.x, FLOOR_Y + 0.22, p.y), white, turn)
	w.box(Vector3(0.44, 0.04, 0.44), Vector3(at.x, FLOOR_Y + 0.45, at.y), white, turn)
	var back := at - forward * 0.21
	w.box(Vector3(0.05, 0.42, 0.44), Vector3(back.x, FLOOR_Y + 0.7, back.y), white, turn)
	w.box(Vector3(0.05, 0.04, 0.44), Vector3(at.x + side.x * 0.22, FLOOR_Y + 0.62, at.y + side.y * 0.22), white, turn + PI / 2.0)

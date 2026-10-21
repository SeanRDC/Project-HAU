extends RefCounted
## The Peter G. Nepomuceno Building (PGN, no. 11), from Mikko's PGN photos (PGN MIDDLE,
## PGN LEFT VIEW, PGN LEFT ENTRANCE, PGN RIGHT SIDE VIEW ON APS and its close-up): a tall
## white L on its plot, one long block along the boulevard's north side and a wing going
## north beside APS on the west road. A dark grey ground floor sits back under the first
## band; above it nine floors, each a deep white band with rounded corners standing out
## over a row of blue windows, grey louvres between the bands, and a box on the roof. On
## the boulevard face, a tall white louvred stair screen, the name in gold and an orange
## strip over the covered walkway. At the west end, a blue glass stair tower and a dark
## louvred corner with the name in steel, beside a paver lane with potted trees that runs
## north from the boulevard's covered walkway to a small courtyard.
##
## World coordinates (metres, Y up), like the chapel: the plot is square to x.

const MiddleRoad := preload("res://areas/middle_road.gd")

## The plot's faces (campus_plan.gd, squared): the east face on the west road, the east
## wing's back, its north end, the boulevard face, the west end, the long block's back.
const EAST := -64.3
const EAST_BACK := -86.8
const NORTH := -19.5
const FACE := 49.2
const WEST := -130.2
const BACK := 19.85
## Storeys: a dark ground floor, nine banded floors, the box on the roof.
const GROUND := 4.2
const STOREY := 3.3
const FLOORS := 9
const ROOF := GROUND + FLOORS * STOREY
const TOP_BOX := Rect2(-84.0, 23.0, 17.5, 24.0)
const TOP_HEIGHT := 4.2
## Each floor's white band: how far it stands out from the windows, its height (from just
## under the floor line), and how far the ground floor sits back under the first one.
const BAND_OUT := 1.1
const BAND := Vector2(-0.25, 0.85)
const RECESS := 1.0
## The stair screen on the boulevard face (x from..to).
const SCREEN := Vector2(-82.2, -78.6)
## The lane along the west end (x from the boulevard's opening, z up to the courtyard),
## and the courtyard at its north end between PGN and St. Therese (STL's plot).
const LANE := Rect2(MiddleRoad.PGN_LANE.x, 14.4, MiddleRoad.PGN_LANE.y - MiddleRoad.PGN_LANE.x, FACE - 14.4 + 0.1)
const COURT := Rect2(-142.4, 14.4, 24.4, BACK - 14.4)
const LANE_Y := 0.0
## The potted trees along the lane's west side, and two by the blue stair tower.
const POTS: Array[Vector2] = [Vector2(-136.3, 46.0), Vector2(-136.3, 42.6), Vector2(-136.3, 39.2), Vector2(-136.3, 35.8),
	Vector2(-136.3, 32.4), Vector2(-136.3, 29.0), Vector2(-136.3, 25.6), Vector2(-136.3, 22.2), Vector2(-131.0, 35.0),
	Vector2(-131.0, 42.6)]
## The blue glass stair tower and the dark louvred corner on the west end (z from..to).
const BLUE := Vector2(36.0, 41.6)
const DARK := Vector2(43.4, 49.0)

static var _outline := PackedVector2Array()

## The L's outline (the windows' plane).
static func outline() -> PackedVector2Array:
	if _outline.is_empty():
		_outline = PackedVector2Array([Vector2(EAST, NORTH), Vector2(EAST, FACE), Vector2(WEST, FACE), Vector2(WEST, BACK),
			Vector2(EAST_BACK, BACK), Vector2(EAST_BACK, NORTH)])
	return _outline

static func inside(x: float, z: float) -> bool:
	return Geometry2D.is_point_in_polygon(Vector2(x, z), outline())

static func walkable(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	return LANE.has_point(at) or COURT.has_point(at)

static func blocked(x: float, z: float) -> bool:
	if inside(x, z):
		return true
	for pot in POTS:
		if Vector2(x, z).distance_to(pot) < 0.55:
			return true
	if x < WEST - 1.0 or x > WEST:
		return false
	if z > DARK.x and z < DARK.y:
		return true # the dark louvred corner stands out into the lane
	return z > BLUE.x and z < BLUE.y # the blue stair tower

## 1 in the lane and the courtyard: the camera looks north up the lane (as in the photo),
## not east as the chapel's view would turn it this far west.
static func lane_for(x: float, z: float) -> float:
	var grown := Rect2(LANE.position - Vector2(1.5, 0.0), LANE.size + Vector2(3.0, -1.0)).merge(COURT.grow(1.5))
	return 1.0 if grown.has_point(Vector2(x, z)) else 0.0

static func floor_height(x: float, z: float) -> float:
	return LANE_Y if walkable(x, z) else NAN

var w: RefCounted
var white: Material

func build(world: RefCounted) -> void:
	w = world
	white = w.material("stucco", Color("f4f5f1"))
	_ground_floor()
	_floors()
	_front()
	_west_end()
	_roof()
	_lane()

# --- Shapes ------------------------------------------------------------------------

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
		if Geometry2D.is_point_in_polygon((a + b) / 2.0 + out * 0.05, shape):
			out = -out
		tool.set_normal(Vector3(out.x, 0, out.y))
		var quad := [Vector3(a.x, y0, a.y), Vector3(b.x, y0, b.y), Vector3(b.x, y1, b.y), Vector3(a.x, y1, a.y)]
		for k in [[0, 1, 2], [0, 2, 3], [0, 2, 1], [0, 3, 2]]:
			for j in k:
				tool.add_vertex(quad[j])
	w._mesh(tool.commit(), Vector3.ZERO, made)

## The outline moved out (positive) or in by `by` metres; rounded outside corners if asked.
static func offset(by: float, round := false) -> PackedVector2Array:
	var join := Geometry2D.JOIN_ROUND if round else Geometry2D.JOIN_MITER
	var shapes := Geometry2D.offset_polygon(outline(), by, join)
	return shapes[0] if not shapes.is_empty() else outline()

## The faces seen from the boulevard and the west road (the long front, the east face and
## the west end), each [from, to, outward normal]; the back faces get plain windows.
static func faces() -> Array:
	return [[Vector2(WEST, FACE), Vector2(EAST, FACE), Vector2(0, 1)], [Vector2(EAST, FACE), Vector2(EAST, NORTH), Vector2(1, 0)],
		[Vector2(WEST, BACK), Vector2(WEST, FACE), Vector2(-1, 0)]]

static func back_faces() -> Array:
	return [[Vector2(EAST, NORTH), Vector2(EAST_BACK, NORTH), Vector2(0, -1)], [Vector2(EAST_BACK, NORTH), Vector2(EAST_BACK, BACK), Vector2(-1, 0)],
		[Vector2(EAST_BACK, BACK), Vector2(WEST, BACK), Vector2(0, -1)]]

## A box along a face: `along` metres from its start, `out` from its plane.
func _on_face(face: Array, along: float, size: Vector3, y: float, out: float, made: Material, turn := 0.0) -> void:
	var a: Vector2 = face[0]
	var b: Vector2 = face[1]
	var normal: Vector2 = face[2]
	var dir := (b - a).normalized()
	var at := a + dir * along + normal * out
	w.box(size, Vector3(at.x, y, at.y), made, atan2(-dir.y, dir.x) + turn)

# --- The building ------------------------------------------------------------------

## The dark ground floor, set back under the first band, with its windows and the grey
## columns at the bands' line.
func _ground_floor() -> void:
	var dark: Material = w.material("stucco", Color("4e555b"))
	var column: Material = w.material("stucco", Color("8b9298"))
	var glass: Material = w.material("glass", Color("3e5f9e"))
	var frame: Material = w.material("plain", Color("e9ebe8"))
	_prism(offset(-RECESS), -0.2, GROUND, dark)
	for face in faces() + back_faces():
		var a: Vector2 = face[0]
		var b: Vector2 = face[1]
		var length := a.distance_to(b)
		var along := 3.2
		while along < length - 2.0:
			_on_face(face, along, Vector3(0.6, GROUND, 0.6), GROUND / 2.0, 0.0, column)
			along += 6.4
		along = 1.6
		while along < length - 1.0:
			_on_face(face, along, Vector3(2.2, 1.9, 0.05), 1.75, -RECESS + 0.04, glass)
			_on_face(face, along, Vector3(2.32, 0.07, 0.07), 2.7, -RECESS + 0.06, frame)
			_on_face(face, along, Vector3(2.32, 0.07, 0.07), 0.8, -RECESS + 0.06, frame)
			for k in 3:
				_on_face(face, along - 1.1 + k * 1.1, Vector3(0.07, 1.9, 0.07), 1.75, -RECESS + 0.06, frame)
			along += 3.2
	# Steel rails along the east face's ground floor (the close-up photo).
	var rail := Color("c4c8ca")
	for y in [0.55, 1.0]:
		w.rod(Vector3(EAST - RECESS + 0.35, y, NORTH + 2.0), Vector3(EAST - RECESS + 0.35, y, FACE - 3.0), 0.025, rail)

## The banded floors: the core with its rows of blue windows and white frames, a deep
## white band at every floor line (rounded at the outside corners), and grey louvres
## standing between the bands at their outer edge.
func _floors() -> void:
	var core: Material = w.material("stucco", Color("5d656c"))
	var glass: Material = w.material("glass", Color("3c63b4"))
	var frame: Material = w.material("plain", Color("eef0ee"))
	var louvre: Material = w.material("ribbed", Color("a8afb4"))
	_prism(outline(), GROUND, ROOF, core)
	var band := offset(BAND_OUT, true)
	for k in FLOORS + 1:
		var y := GROUND + k * STOREY
		_prism(band, y + BAND.x, y + BAND.y, white)
	for k in FLOORS:
		var y := GROUND + k * STOREY
		var tall := STOREY - (BAND.y - BAND.x) - 0.25
		var middle := y + BAND.y + tall / 2.0 + 0.05
		for face in faces():
			var length: float = (face[0] as Vector2).distance_to(face[1])
			_on_face(face, length / 2.0, Vector3(length, tall, 0.05), middle, 0.03, glass)
			var along := 0.7
			while along < length:
				_on_face(face, along, Vector3(0.07, tall, 0.08), middle, 0.06, frame)
				along += 1.4
			_on_face(face, length / 2.0, Vector3(length, 0.07, 0.08), middle + tall * 0.18, 0.06, frame)
			# The louvres, angled, every few metres at the band's edge.
			along = 2.0 + (k % 2) * 1.8
			while along < length - 1.0:
				_on_face(face, along, Vector3(0.95, tall + 0.2, 0.05), middle, BAND_OUT - 0.15, louvre, 0.45)
				along += 3.6
		for face in back_faces():
			var length: float = (face[0] as Vector2).distance_to(face[1])
			_on_face(face, length / 2.0, Vector3(length, tall * 0.7, 0.05), middle, 0.03, glass)

## On the boulevard face: the tall white louvred stair screen, the gold name on the fourth
## band, the orange strip over the covered walkway, and the entrance's glass doors.
func _front() -> void:
	var slat: Material = w.material("plain", Color("f2f3f0"))
	var post: Material = w.material("plain", Color("dfe2e0"))
	var wide := SCREEN.y - SCREEN.x
	var middle := (SCREEN.x + SCREEN.y) / 2.0
	var z := FACE + BAND_OUT + 0.35
	var y := GROUND + 0.9
	while y < ROOF + 0.6:
		# The screen steps in and out a little floor by floor, as it zigzags in the photo.
		var shift := 0.18 if posmod(floori((y - GROUND) / STOREY), 2) == 0 else -0.18
		w.box(Vector3(wide, 0.06, 0.28), Vector3(middle + shift, y, z), slat)
		y += 0.32
	for x in [SCREEN.x, SCREEN.y]:
		w.box(Vector3(0.12, ROOF - GROUND, 0.12), Vector3(x, (GROUND + ROOF) / 2.0 + 0.5, z), post)
	# The name in gold letters on the fourth band.
	var gold := Color("c9a65a")
	var band_y := GROUND + 3.0 * STOREY
	var name_x := -92.0
	var line: Label3D = w.panel("PETER G. NEPOMUCENO", Vector3(name_x, band_y + 0.3, FACE + BAND_OUT + 0.03), 13.0, 1.0, gold)
	line.name = "PGN NAME"
	w.panel("PROFESSIONAL DEVELOPMENT", Vector3(name_x, band_y - 0.75, FACE + BAND_OUT + 0.03), 13.0, 0.8, gold) # on the windows' row under it
	# The orange strip on the first band's face over the covered walkway.
	w.box(Vector3(46.0, 0.75, 0.05), Vector3(-89.0, GROUND + 0.3, FACE + BAND_OUT + 0.03), w.material("plain", Color("d0702f")))
	# The entrance: wide glass doors in the ground floor, with steps edged in yellow.
	var doors := Vector2(-76.4, -71.6)
	w.box(Vector3(doors.y - doors.x, 2.7, 0.06), Vector3((doors.x + doors.y) / 2.0, 1.55, FACE - RECESS + 0.05), w.material("glass", Color("27313a")))
	for k in 3:
		w.box(Vector3(doors.y - doors.x + 1.0, 0.15, 0.32), Vector3((doors.x + doors.y) / 2.0, 0.075 + 0.15 * k, FACE - RECESS + 0.7 - 0.32 * k), w.material("stone", Color("c9c4b8")))
		w.box(Vector3(doors.y - doors.x + 1.0, 0.03, 0.05), Vector3((doors.x + doors.y) / 2.0, 0.15 + 0.15 * k, FACE - RECESS + 0.84 - 0.32 * k), w.material("plain", Color("e3c33a")))

## The west end: the blue glass stair tower, and the dark louvred corner on the lane with
## the name in steel letters.
func _west_end() -> void:
	var blue: Material = w.material("glass", Color("2648d8"))
	w.box(Vector3(1.0, ROOF + 1.6, BLUE.y - BLUE.x), Vector3(WEST - 0.5, (ROOF + 1.6) / 2.0, (BLUE.x + BLUE.y) / 2.0), blue)
	var dark: Material = w.material("ribbed", Color("4a5056"))
	var height := GROUND + STOREY - 0.3
	w.box(Vector3(1.0, height, DARK.y - DARK.x), Vector3(WEST - 0.5, height / 2.0, (DARK.x + DARK.y) / 2.0), dark)
	# Its louvres: dark horizontal slats standing proud of it.
	var y := 0.3
	while y < height:
		w.box(Vector3(0.08, 0.07, DARK.y - DARK.x), Vector3(WEST - 1.04, y, (DARK.x + DARK.y) / 2.0), w.material("plain", Color("3a3f44")))
		y += 0.22
	var steel := Color("d4d7d8")
	for text in [["PETER G. NEPOMUCENO", 4.6, 0.5], ["PROFESSIONAL DEVELOPMENT", 3.9, 0.36]]:
		var label: Label3D = w.panel(text[0], Vector3(WEST - 1.1, text[1], (DARK.x + DARK.y) / 2.0 + 0.5), 5.5, text[2], steel)
		label.rotation.y = -PI / 2.0

## The roof: the box with its row of small vents, under a white slab standing out over it.
func _roof() -> void:
	var box: Material = w.material("stucco", Color("e3e6e7"))
	var top := ROOF + BAND.y
	var centre := TOP_BOX.get_center()
	w.box(Vector3(TOP_BOX.size.x, TOP_HEIGHT, TOP_BOX.size.y), Vector3(centre.x, top + TOP_HEIGHT / 2.0, centre.y), box)
	w.box(Vector3(TOP_BOX.size.x + 1.2, 0.35, TOP_BOX.size.y + 1.2), Vector3(centre.x, top + TOP_HEIGHT + 0.17, centre.y), white)
	var vent: Material = w.material("plain", Color("3d4449"))
	var x := TOP_BOX.position.x + 1.0
	while x < TOP_BOX.end.x - 0.5:
		w.box(Vector3(0.35, 0.35, 0.05), Vector3(x, top + TOP_HEIGHT - 0.9, TOP_BOX.end.y + 0.02), vent)
		x += 1.6
	var z := TOP_BOX.position.y + 1.0
	while z < TOP_BOX.end.y - 0.5:
		w.box(Vector3(0.05, 0.35, 0.35), Vector3(TOP_BOX.end.x + 0.02, top + TOP_HEIGHT - 0.9, z), vent)
		z += 1.6

## The lane and the courtyard: grey octagon pavers, terracotta pots with small trees, a
## concrete drain cover by the dark corner.
func _lane() -> void:
	var pavers: Material = w.material("pavers", Color("b9b6b1")) # grey-brown, as in the photo
	for area in [Rect2(LANE.position, Vector2(WEST - LANE.position.x, LANE.size.y)), COURT]: # paved up to the wall
		w.box(Vector3(area.size.x, 0.2, area.size.y), Vector3(area.get_center().x, LANE_Y - 0.1, area.get_center().y), pavers)
	for i in POTS.size():
		var pot: Vector2 = POTS[i]
		w.pot(pot.x, pot.y)
		w._tree(Vector3(pot.x, 0.6, pot.y), 2.8 + fmod(i * 0.37, 0.6), 1700 + i)
	w.box(Vector3(1.2, 0.08, 1.6), Vector3(WEST - 1.9, LANE_Y + 0.04, 45.2), w.material("concrete", Color("b5b3ab")))

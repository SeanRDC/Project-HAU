extends RefCounted
## The Immaculate Heart Gymnasium from outside, at its real size, on its plot in the
## team's plan (campus_plan.gd, "gym"): the surveyed OpenStreetMap outline, 41 x 69.5 m.
## Heights are estimated from the photos in assets/images/buildings/ih_gym immaculate
## heart/ and confirmed by Sean (about 12 m to the top of the fascia, 16.6 m to the ridge).
##
## The front is the long west side, on the parking apron: two storeys of cream
## wall with piers between twelve bays, a slatted band under a row of white
## awning-window grids, and a deep eave whose fascia carries HOLY ANGEL
## UNIVERSITY. The left entrance goes up steps under a grey box canopy past the
## grey stone-tile wall and three white fins; the right one is a glass door
## under the seal and HOLY ANGEL UNIVERSITY GYM. The north gable faces the
## covered court: a grey metal band under the roof, three tall louvred windows,
## a wide grey box canopy over the side entrance, a maroon band and stone-tile
## walls. The back faces the alley by the annex: doors up small stoops, roll-up
## grilles, hose boxes and a blue-grey upper band. The low gable roof is covered
## in solar panels, as on the satellite view.
##
## Built in its own frame under a turned pivot, like the canteen: local x runs
## along the front (world z = local x + SHIFT), local +z points out of the front
## (world -x), so window and sign helpers that face +z face the road. The east road
## (roads.gd) runs past the front, across a concrete apron with parking.

## World x of the front wall; local z = FRONT_X - world x.
const FRONT_X := 58.0
## World z of local x 0: the gym's north gable (local 71) lands on the plan's z 66.8.
const SHIFT := -4.2
## The gable ends, local x (world z = local x + SHIFT).
const NORTH := 71.0
const SOUTH := 140.5
const DEPTH := 41.0
## Local z of the ridge, halfway across.
const MIDDLE := -20.5
const BAYS := 12
## Heights in metres (approximate, from the photos).
const WALL_TOP := 10.4 # the soffit under the eave
const EAVE := 12.0 # top of the fascia, where the roof starts
const RIDGE := 16.6
const OVERHANG := 2.6
const GABLE_BASE := 12.3 # where each gable's triangle starts, under the roof
const GABLE_PEAK := 16.4
## Doors along the front (local x), and the raised walk in front of it.
const LEFT_DOOR := 79.7
const RIGHT_DOOR := 120.2
const STRIP := 4.0
const STRIP_END := 124.2
## The side entrance in the north gable (local z of its middle).
const SIDE_DOOR := -20.5

var w # the World being built (world.gd)
var _lamp_glow: StandardMaterial3D

static func bay() -> float:
	return (SOUTH - NORTH) / BAYS

static func gym_local(x: float, z: float) -> Vector2:
	return Vector2(z - SHIFT, FRONT_X - x)

## The open concrete round the gym, in world x/z: the apron between the east road
## and the front (up to the annex), and the lane between the Covered Court and the
## north gable, to the side entrance.
static func on_apron(x: float, z: float) -> bool:
	var p := gym_local(x, z)
	if x >= 44.0 and x <= FRONT_X and z >= 38.0 and p.x <= STRIP_END:
		return true
	return x >= 44.0 and x <= 101.0 and z >= 57.2 and p.x <= NORTH

## Steps up to the two front doors: [local x, half width, risers].
static func _doors() -> Array:
	return [[LEFT_DOOR, 1.8, 4], [RIGHT_DOOR, 1.5, 3]]

## Things standing on the walk in front and in the alley: [local x, local z, radius].
static func _blockers() -> Array:
	var list := []
	for tent in [95.0, 99.0, 103.0]:
		list.append([tent, 2.0, 0.95])
		for dx in [-1.4, 1.4]:
			for dz in [-1.3, 1.3]:
				list.append([tent + dx, 2.0 + dz, 0.12])
	for post in [85.6, 89.1, 92.4, 112.6, 115.2, 117.8]:
		list.append([post, 2.35, 0.12])
	for prop in [[92.9, 3.3, 0.5], [105.3, 0.9, 0.5], [106.4, 3.3, 0.3], [108.4, 2.6, 0.5], [109.7, 1.2, 0.5],
			[110.8, 3.0, 0.5]]:
		list.append(prop)
	return list

## Back doors with a stoop in the alley (local x), one to a bay except the roll-up grilles.
static func back_doors() -> Array:
	var list := []
	for i in BAYS:
		if i != 2 and i != 7:
			list.append(NORTH + (i + 0.5) * bay() - 1.2)
	return list

static func blocked(x: float, z: float) -> bool:
	var p := gym_local(x, z)
	if p.x > NORTH and p.x < SOUTH and p.y < 0.0 and p.y > -DEPTH:
		return true
	for item in _blockers():
		if p.distance_to(Vector2(item[0], item[1])) < item[2]:
			return true
	if p.y < -DEPTH and p.y > -DEPTH - 1.6:
		for door in back_doors():
			if absf(p.x - door) < 0.95:
				return true
	return false

## The gym's own raised ground (walk, steps, the slab under the side canopy), or NAN.
static func floor_height(x: float, z: float) -> float:
	var p := gym_local(x, z)
	for door in _doors():
		var reach: float = 0.5 + (door[2] - 1) * 0.4
		if absf(p.x - door[0]) < door[1] and p.y >= 0.0 and p.y < reach:
			var step := 0 if p.y < 0.5 else 1 + int((p.y - 0.5) / 0.4)
			return 0.15 + 0.15 * (door[2] - step)
	if p.x >= NORTH and p.x <= STRIP_END and p.y >= 0.0 and p.y <= STRIP:
		return 0.15
	if p.x >= NORTH - 3.6 and p.x < NORTH and absf(p.y - SIDE_DOOR) <= 6.0:
		return 0.0
	if on_apron(x, z):
		return -0.185
	return NAN

# --- Building -------------------------------------------------------------------

func build(world) -> void:
	w = world
	w._flush()
	var pivot := Node3D.new()
	pivot.name = "IHGym"
	pivot.transform = Transform3D(Basis(Vector3.UP, -PI / 2.0), Vector3(FRONT_X, 0, SHIFT))
	w.root.add_child(pivot)
	var saved: Node3D = w.root
	w.root = pivot
	_shell()
	_front()
	_eave(0.0, 1.0)
	_eave(-DEPTH, -1.0)
	_gable(NORTH, -1.0)
	_gable(SOUTH, 1.0)
	_side_entrance()
	_back()
	_roof()
	_walk()
	_props()
	w._flush()
	w.root = saved
	_apron()
	w._flush()

## Concrete slabs under the apron and the lane (world coordinates).
func _apron() -> void:
	var slab: Material = w.material("concrete")
	var north := NORTH + SHIFT
	for area in [Rect2(44.0, 38.0, FRONT_X - 44.0, STRIP_END + SHIFT - 38.0), Rect2(FRONT_X, 57.2, 101.0 - FRONT_X, north - 57.2)]:
		var r: Rect2 = area
		w.box(Vector3(r.size.x, 0.02, r.size.y), Vector3(r.get_center().x, -0.195, r.get_center().y), slab)

func _cream() -> Material:
	return w.material("stucco", Color("fff4dc"))

func _white() -> Material:
	return w.material("plain", Color("f1efe7"))

## The walls: front and back to the soffit, the gables up under the roof.
func _shell() -> void:
	var middle := (NORTH + SOUTH) / 2.0
	var length := SOUTH - NORTH
	w.box(Vector3(length, WALL_TOP, 0.4), Vector3(middle, WALL_TOP / 2.0, -0.2), _cream())
	w.box(Vector3(length, WALL_TOP, 0.4), Vector3(middle, WALL_TOP / 2.0, -DEPTH + 0.2), _cream())
	var gable: Material = w.material("stucco", Color("f6f2e6"))
	# The north gable is open under the side canopy; the south one is solid.
	var open_left := SIDE_DOOR - 2.9
	var open_right := SIDE_DOOR + 2.9
	for piece in [[-DEPTH, open_left], [open_right, 0.0]]:
		var width: float = piece[1] - piece[0]
		w.box(Vector3(0.4, 4.7, width), Vector3(NORTH + 0.2, 2.35, (piece[0] + piece[1]) / 2.0), gable)
	w.box(Vector3(0.4, GABLE_BASE - 4.7, DEPTH), Vector3(NORTH + 0.2, (GABLE_BASE + 4.7) / 2.0, MIDDLE), gable)
	w.box(Vector3(0.4, GABLE_BASE, DEPTH), Vector3(SOUTH - 0.2, GABLE_BASE / 2.0, MIDDLE), gable)
	_triangle(NORTH, NORTH + 0.4, gable)
	_triangle(SOUTH - 0.4, SOUTH, gable)

## The triangle of a gable wall, from lx0 to lx1, under the roof.
func _triangle(lx0: float, lx1: float, made: Material) -> void:
	var corners := [Vector2(0.0, GABLE_BASE), Vector2(-DEPTH, GABLE_BASE), Vector2(MIDDLE, GABLE_PEAK)]
	var tool := SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	for face in [[lx0, Vector3.LEFT], [lx1, Vector3.RIGHT]]:
		tool.set_normal(face[1])
		for order in [[0, 1, 2], [0, 2, 1]]:
			for k in order:
				tool.add_vertex(Vector3(face[0], corners[k].y, corners[k].x))
	for edge in [[0, 2], [2, 1]]:
		var a: Vector2 = corners[edge[0]]
		var b: Vector2 = corners[edge[1]]
		tool.set_normal(Vector3(0, -(b.x - a.x), b.y - a.y).normalized())
		var quad := [Vector3(lx0, a.y, a.x), Vector3(lx1, a.y, a.x), Vector3(lx1, b.y, b.x), Vector3(lx0, b.y, b.x)]
		for order in [[0, 1, 2, 0, 2, 3], [0, 2, 1, 0, 3, 2]]:
			for k in order:
				tool.add_vertex(quad[k])
	w._mesh(tool.commit(), Vector3.ZERO, made)

## A grid of white-framed awning windows on a wall at local z = face, facing out
## (+1 the front, -1 the back), a few panes pushed open at the bottom.
func _grid(centre: float, y: float, width: float, height: float, cols: int, rows: int, lit: bool, seed_value: int,
		face := 0.0, out := 1.0) -> void:
	var glass: Material = w.room_glass(lit)
	w.box(Vector3(width, height, 0.03), Vector3(centre, y, face + out * 0.04), glass)
	var bar := _white()
	for k in cols + 1:
		w.box(Vector3(0.06, height + 0.06, 0.08), Vector3(centre - width / 2.0 + k * width / cols, y, face + out * 0.08), bar)
	for r in rows + 1:
		w.box(Vector3(width + 0.06, 0.06, 0.08), Vector3(centre, y - height / 2.0 + r * height / rows, face + out * 0.08), bar)
	var pane: Material = w.material("glass", Color("c9d3d5"))
	var pw := width / cols - 0.08
	var ph := height / rows - 0.08
	var open := 0.45
	for k in cols:
		for r in rows:
			if posmod(seed_value * 7 + k * 5 + r * 3, 11) != 0:
				continue
			var top := y - height / 2.0 + (r + 1) * height / rows - 0.04
			var px := centre - width / 2.0 + (k + 0.5) * width / cols
			w.box(Vector3(pw, ph, 0.03), Vector3(px, top - ph / 2.0 * cos(open), face + out * (0.1 + ph / 2.0 * sin(open))),
				pane, 0.0, -open * out)

# --- Front ----------------------------------------------------------------------

func _front() -> void:
	var pier: Material = w.material("stucco", Color("fffaee"))
	var b := bay()
	for i in BAYS + 1:
		var corner := i == 0 or i == BAYS
		var lx := NORTH + i * b + (0.45 if i == 0 else (-0.45 if i == BAYS else 0.0))
		w.box(Vector3(0.9 if corner else 0.55, WALL_TOP, 0.35), Vector3(lx, WALL_TOP / 2.0, 0.175), pier)
	var band: Material = w.material("plain", Color("c9c3b2"))
	var slat: Material = w.material("plain", Color("a59f8e"))
	var sill := _white()
	for i in BAYS:
		var centre := NORTH + (i + 0.5) * b
		var width := b - 0.6
		if i == 8:
			continue # the plain bay over the right door carries the seal
		w.box(Vector3(width, 0.9, 0.08), Vector3(centre, 5.15, 0.04), band)
		for k in 4:
			w.box(Vector3(width, 0.05, 0.14), Vector3(centre, 4.83 + k * 0.22, 0.09), slat)
		w.box(Vector3(width - 0.1, 0.08, 0.2), Vector3(centre, 5.82, 0.1), sill)
		_grid(centre, 7.6, width - 0.3, 3.4, 6, 4, posmod(i * 5 + 3, 4) == 0, i)
	_front_north()
	_front_middle()
	_front_right()

## The north end: stone-tile wall under a maroon band, three white fins, the left entrance.
func _front_north() -> void:
	var start := NORTH + 0.9
	var stop := LEFT_DOOR - 1.8
	w.box(Vector3(stop - start, 3.1, 0.12), Vector3((start + stop) / 2.0, 1.55, 0.06), w.material("slate"))
	w.box(Vector3(stop - start, 1.55, 0.1), Vector3((start + stop) / 2.0, 3.875, 0.05), w.material("stucco", Color("a84d4b")))
	for lx in [72.4, 72.95, 73.5]:
		w.box(Vector3(0.2, 4.9, 0.75), Vector3(lx, 2.45, 0.375), w.material("plain", Color("f7f6f2")))
	_wall_lamp(Vector3(75.8, 2.7, 0.12))
	_front_door(LEFT_DOOR, 2.3, 4, Vector3(3.4, 0.8, 1.9), 4.85)
	# A slatted transom over the left entrance, as in the photo.
	w.box(Vector3(2.3, 0.5, 0.06), Vector3(LEFT_DOOR, 3.95, 0.05), w.material("plain", Color("d0cbbd")))
	for k in 3:
		w.box(Vector3(2.3, 0.04, 0.09), Vector3(LEFT_DOOR, 3.8 + k * 0.15, 0.08), w.material("plain", Color("8c877b")))
	w._omni(Vector3(LEFT_DOOR, 4.3, 1.0), Color("ffd79d"), 1.2, 6.0)

## A dark doorway with jambs, a grey box canopy and steps up from the walk.
func _front_door(lx: float, width: float, risers: int, canopy: Vector3, canopy_y: float) -> void:
	var landing := 0.15 + 0.15 * risers
	var height := 3.0 if risers > 3 else 2.6
	w.box(Vector3(width, height, 0.06), Vector3(lx, landing + height / 2.0, 0.05), w.material("plain", Color("28292e")))
	for side: float in [-1.0, 1.0]:
		w.box(Vector3(0.25, height + 0.5, 0.2), Vector3(lx + side * (width / 2.0 + 0.12), landing + (height + 0.5) / 2.0, 0.1),
			w.material("stucco", Color("fffaee")))
	w.box(canopy, Vector3(lx, canopy_y, canopy.z / 2.0), w.material("plain", Color("a9adb2")))
	w.box(Vector3(canopy.x - 0.1, 0.04, canopy.z - 0.1), Vector3(lx, canopy_y - canopy.y / 2.0 - 0.02, canopy.z / 2.0),
		w.material("plain", Color("dadcdd")))
	var stone: Material = w.material("concrete", Color("bdbec1"))
	var half: float = 1.8 if risers > 3 else 1.5
	for step in risers:
		var top := 0.15 + 0.15 * (risers - step)
		var near := 0.0 if step == 0 else 0.5 + (step - 1) * 0.4
		var far := 0.5 + step * 0.4
		w.box(Vector3(half * 2.0, top + 0.2, far - near), Vector3(lx, (top - 0.2) / 2.0, (near + far) / 2.0), stone)

## Cream wall with small awning windows and grey doors, and a flat porch on thin posts.
func _front_middle() -> void:
	for lx in [90.6, 94.0, 101.4, 104.8, 109.8]:
		_grid(lx, 2.2, 1.4, 1.3, 2, 2, false, roundi(lx))
	for lx in [87.0, 97.6, 113.9]:
		_plain_door(lx, 0.0, 1.0)
	_porch(85.2, 92.8)
	_wall_lamp(Vector3(95.5, 2.9, 0.12))

func _plain_door(lx: float, face: float, out: float) -> void:
	w.box(Vector3(1.0, 2.3, 0.06), Vector3(lx, 0.15 + 1.15, face + out * 0.04), w.material("plain", Color("b9bcc2")))
	w.box(Vector3(1.2, 0.1, 0.1), Vector3(lx, 2.55, face + out * 0.06), _white())
	w.box(Vector3(0.06, 0.06, 0.06), Vector3(lx + 0.35, 1.3, face + out * 0.1), w.material("plain", Color("5a5a5a")))

func _porch(from: float, to: float) -> void:
	var roof: Material = w.material("plain", Color("dcd9d2"))
	w.box(Vector3(to - from, 0.14, 2.6), Vector3((from + to) / 2.0, 3.5, 1.3), roof)
	w.box(Vector3(to - from, 0.25, 0.06), Vector3((from + to) / 2.0, 3.45, 2.6), w.material("plain", Color("b9b7b0")))
	var posts := [from + 0.4, (from + to) / 2.0, to - 0.4]
	for lx in posts:
		w.box(Vector3(0.1, 3.3, 0.1), Vector3(lx, 0.15 + 1.65, 2.35), w.material("plain", Color("b9bcc2")))

## The right entrance: glass door under the seal and HOLY ANGEL UNIVERSITY GYM,
## a small box canopy, steps with a yellow and black edge, a blue door beside it.
func _front_right() -> void:
	_porch(112.2, 118.2)
	_front_door(RIGHT_DOOR, 1.7, 3, Vector3(2.6, 0.7, 1.4), 3.95)
	w.box(Vector3(1.6, 2.4, 0.04), Vector3(RIGHT_DOOR, 0.6 + 1.25, 0.09), w.room_glass(true))
	w.box(Vector3(0.05, 2.4, 0.06), Vector3(RIGHT_DOOR, 0.6 + 1.25, 0.12), w.material("plain", Color("3d4856")))
	var yellow: Material = w.material("plain", Color("e2c13a"))
	var black: Material = w.material("plain", Color("26262a"))
	for k in 6:
		w.box(Vector3(0.25, 0.12, 0.03), Vector3(RIGHT_DOOR - 1.4 + k * 0.25, 0.22, 1.31), yellow if k % 2 == 0 else black)
	_seal(Vector3(RIGHT_DOOR, 8.35, 0.06), 1.9)
	w.panel("HOLY ANGEL", Vector3(RIGHT_DOOR, 6.85, 0.05), 3.2, 0.5, Color("3d3532"))
	w.panel("UNIVERSITY", Vector3(RIGHT_DOOR, 6.32, 0.05), 3.2, 0.5, Color("b07a22"))
	w.panel("GYM", Vector3(RIGHT_DOOR, 5.7, 0.05), 1.3, 0.55, Color("3d3532"))
	w.box(Vector3(1.0, 2.3, 0.06), Vector3(122.5, 0.15 + 1.15, 0.04), w.material("plain", Color("8fb2cf")))
	_wall_lamp(Vector3(118.9, 3.1, 0.12))
	w._omni(Vector3(RIGHT_DOOR, 3.4, 0.9), Color("ffd79d"), 1.2, 6.0)

func _wall_lamp(at: Vector3) -> void:
	if _lamp_glow == null:
		_lamp_glow = w.glow(Color("f6f1e1"), 0.0, 1.6)
	w.box(Vector3(0.12, 0.26, 0.12), at, _lamp_glow)

## The university seal: a maroon shield, gold rim, a white angel and a gold band.
func _seal(at: Vector3, height: float) -> void:
	var image := Image.create(40, 48, false, Image.FORMAT_RGBA8)
	var maroon := Color("5e1f2b")
	var gold := Color("c4932f")
	var white := Color("f4f1ea")
	for y in 48:
		var k := y / 47.0
		var half := 18.0 if k < 0.55 else 18.0 * sqrt(maxf(0.0, 1.0 - pow((k - 0.55) / 0.45, 2.0)))
		for x in range(roundi(20.0 - half), roundi(20.0 + half)):
			var rim := y < 2 or absf(x + 0.5 - 20.0) > half - 2.0
			image.set_pixel(x, y, gold if rim else maroon)
	for y in range(26, 32):
		for x in range(6, 34):
			if absf((x - 6) * 0.25 - (y - 26) - 1.5) < 2.2 and image.get_pixel(x, y).a > 0.0:
				image.set_pixel(x, y, gold)
	for side in [-1, 1]:
		for i in 12:
			for j in range(0, 12 - i):
				var x: int = 20 + side * (2 + j)
				var y := 20 - i + j / 3
				if y >= 4 and image.get_pixel(x, y).a > 0.0:
					image.set_pixel(x, y, white)
	for y in range(12, 28):
		image.set_pixel(19, y, white)
		image.set_pixel(20, y, white)
	for y in range(9, 12):
		for x in range(18, 22):
			image.set_pixel(x, y, Color("f0d9b5"))
	image.generate_mipmaps()
	var made := StandardMaterial3D.new()
	made.albedo_texture = ImageTexture.create_from_image(image)
	made.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
	made.alpha_scissor_threshold = 0.4
	made.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	made.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	made.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	var quad := QuadMesh.new()
	quad.size = Vector2(height * 40.0 / 48.0, height)
	w._mesh(quad, at, made).name = "Seal"

# --- Eaves and roof ---------------------------------------------------------------

## The deep eave along a long side (face = local z of the wall, out = +1 front, -1 back):
## a ribbed soffit, a bracket at every pier, the white fascia and its end caps.
func _eave(face: float, out: float) -> void:
	var middle := (NORTH + SOUTH) / 2.0
	var length := SOUTH - NORTH + 1.2
	var soffit: Material = w.material("plain", Color("cfcbc0"))
	var rib: Material = w.material("plain", Color("aeaa9f"))
	var fascia: Material = w.material("plain", Color("f3f0e8"))
	var under := face + out * OVERHANG / 2.0
	w.box(Vector3(length, 0.08, OVERHANG), Vector3(middle, WALL_TOP + 0.04, under), soffit)
	var lx := NORTH - 0.5
	while lx < SOUTH + 0.5:
		w.box(Vector3(0.03, 0.03, OVERHANG), Vector3(lx, WALL_TOP - 0.01, under), rib)
		lx += 0.4
	w.box(Vector3(length, 1.65, 0.25), Vector3(middle, 11.2, face + out * OVERHANG), fascia)
	w.box(Vector3(length, 0.06, 0.3), Vector3(middle, 10.4, face + out * OVERHANG), w.material("plain", Color("bdb8ac")))
	for end in [NORTH - 0.5, SOUTH + 0.5]:
		w.box(Vector3(0.2, 1.7, OVERHANG), Vector3(end, 11.2, under), fascia)
	var bracket: Material = w.material("stucco", Color("fffaee"))
	for i in BAYS + 1:
		w.box(Vector3(0.3, 0.55, OVERHANG - 0.3), Vector3(NORTH + i * bay(), WALL_TOP - 0.27, face + out * (OVERHANG - 0.3) / 2.0),
			bracket)
	if out > 0.0:
		_fascia_name()

## HOLY ANGEL UNIVERSITY in letters standing apart on the front fascia, the seal before them.
func _fascia_name() -> void:
	var holder := Node3D.new()
	holder.name = "HOLY ANGEL UNIVERSITY"
	w.root.add_child(holder)
	var text := "HOLY ANGEL UNIVERSITY"
	var spacing := 1.45
	var start := 103.0 - (text.length() - 1) * spacing / 2.0
	for i in text.length():
		if text[i] == " ":
			continue
		var letter := Label3D.new()
		letter.text = text[i]
		letter.font_size = 64
		letter.outline_size = 0
		letter.modulate = Color("6b2730")
		letter.shaded = true
		letter.alpha_cut = Label3D.ALPHA_CUT_OPAQUE_PREPASS
		letter.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
		letter.pixel_size = 0.0178
		letter.position = Vector3(start + i * spacing, 11.2, OVERHANG + 0.14)
		holder.add_child(letter)
	_seal(Vector3(start - 1.9, 11.2, OVERHANG + 0.14), 1.3)

## The low gable roof in ribbed sheets, a ridge cap, and the solar panels in rows.
func _roof() -> void:
	var middle := (NORTH + SOUTH) / 2.0
	var length := SOUTH - NORTH + 1.2
	var run := -MIDDLE + OVERHANG
	var rise := RIDGE - EAVE
	var slope := sqrt(run * run + rise * rise)
	var theta := atan2(rise, run)
	var sheet: Material = w.material("ribbed")
	for side: float in [1.0, -1.0]:
		w.box(Vector3(length, 0.25, slope), Vector3(middle, (EAVE + RIDGE) / 2.0, MIDDLE + side * run / 2.0), sheet, 0.0, side * theta)
	w.box(Vector3(length, 0.35, 1.0), Vector3(middle, RIDGE + 0.1, MIDDLE), w.material("plain", Color("8e9396")))
	var panel: Material = w.material("solar")
	for side: float in [1.0, -1.0]:
		for row in 12:
			var s := 1.0 + row * 1.8 + 0.825
			var y := RIDGE - s * sin(theta) + cos(theta) * 0.32
			var lz := MIDDLE + side * (s * cos(theta) + sin(theta) * 0.32)
			var lx := NORTH + 1.5
			while lx < SOUTH - 1.0:
				w.box(Vector3(1.0, 0.05, 1.65), Vector3(lx, y, lz), panel, 0.0, side * theta)
				lx += 1.055

# --- Gables -----------------------------------------------------------------------

## A gable end at local x = at, facing out (-1 north, +1 south): the grey metal band
## under the roof line, panel joints, three tall louvred windows, a grey belt and the
## maroon band. The north one also has the side entrance (see _side_entrance).
func _gable(at: float, out: float) -> void:
	var face := at + out * 0.0
	var theta := atan2(GABLE_PEAK - GABLE_BASE, -MIDDLE)
	var slope := sqrt(MIDDLE * MIDDLE + pow(GABLE_PEAK - GABLE_BASE, 2.0))
	var band: Material = w.material("plain", Color("9a9fa4"))
	var joint: Material = w.material("plain", Color("7d8287"))
	for side: float in [1.0, -1.0]:
		var lz := MIDDLE / 2.0 if side > 0.0 else MIDDLE * 1.5
		w.box(Vector3(0.15, 2.2, slope), Vector3(face + out * 0.08, (GABLE_BASE + GABLE_PEAK) / 2.0 - 1.1, lz), band, 0.0, side * theta)
	for k in range(1, 20):
		var lz := -DEPTH * k / 20.0
		w.box(Vector3(0.17, 2.0, 0.05), Vector3(face + out * 0.09, _roof_line(lz) - 1.1, lz), joint)
	# Panel joints on the white wall below the band.
	var line: Material = w.material("plain", Color("dcd7c9"))
	for k in range(1, 15):
		var lz := -DEPTH * k / 15.0
		var top := _roof_line(lz) - 2.2
		w.box(Vector3(0.06, top - 6.9, 0.04), Vector3(face + out * 0.03, (top + 6.9) / 2.0, lz), line)
	for y in [9.1, 11.3]:
		var reach := maxf(0.0, (y + 2.2 - GABLE_BASE) / tan(theta))
		w.box(Vector3(0.06, 0.04, DEPTH - reach * 2.0), Vector3(face + out * 0.03, y, MIDDLE), line)
	_louvre(face, out, SIDE_DOOR, 5.6, 7.4, 14.0, 5)
	_louvre(face, out, -8.0, 3.4, 7.4, 11.3, 3)
	_louvre(face, out, -33.0, 3.4, 7.4, 11.3, 3)
	var belt: Material = w.material("plain", Color("c7cacd"))
	w.box(Vector3(0.18, 1.4, DEPTH), Vector3(face + out * 0.09, 6.15, MIDDLE), belt)
	for k in range(1, 18):
		w.box(Vector3(0.2, 1.4, 0.04), Vector3(face + out * 0.1, 6.15, -DEPTH * k / 18.0), w.material("plain", Color("a7aaae")))
	w.box(Vector3(0.12, 1.85, DEPTH), Vector3(face + out * 0.06, 4.525, MIDDLE), w.material("stucco", Color("a84d4b")))
	if out > 0.0:
		return
	# A dark strip of louvres up the west corner, as in the photo of the side entrance.
	w.box(Vector3(0.12, 3.0, 1.2), Vector3(face + out * 0.06, 8.5, -0.9), w.material("plain", Color("4d5056")))
	for k in 12:
		w.box(Vector3(0.15, 0.04, 1.2), Vector3(face + out * 0.08, 7.1 + k * 0.25, -0.9), w.material("plain", Color("2f3136")))

## The height of the roof line along a gable (local z).
static func _roof_line(lz: float) -> float:
	return GABLE_BASE + (GABLE_PEAK - GABLE_BASE) * (1.0 - absf(lz - MIDDLE) / -MIDDLE)

## A tall louvred window: white pilasters and head, grey slats, white mullions.
func _louvre(face: float, out: float, centre: float, width: float, y0: float, y1: float, panes: int) -> void:
	var white := _white()
	w.box(Vector3(0.06, y1 - y0, width), Vector3(face + out * 0.03, (y0 + y1) / 2.0, centre), w.material("plain", Color("6f7377")))
	var y := y0 + 0.1
	while y < y1:
		w.box(Vector3(0.12, 0.06, width), Vector3(face + out * 0.09, y, centre), w.material("plain", Color("dddcd6")))
		y += 0.2
	for k in panes + 1:
		w.box(Vector3(0.16, y1 - y0, 0.1), Vector3(face + out * 0.1, (y0 + y1) / 2.0, centre - width / 2.0 + k * width / panes), white)
	for side: float in [-1.0, 1.0]:
		w.box(Vector3(0.3, y1 - y0 + 0.6, 0.45), Vector3(face + out * 0.15, (y0 + y1) / 2.0, centre + side * (width / 2.0 + 0.22)), white)
	w.box(Vector3(0.3, 0.3, width + 0.9), Vector3(face + out * 0.15, y1 + 0.15, centre), white)
	w.box(Vector3(0.35, 0.12, width + 0.9), Vector3(face + out * 0.17, y0 - 0.06, centre), white)

## The side entrance in the north gable: the wide opening, its grey box canopy, the
## stone-tile walls either side, grey siding and vent boxes at the ends.
func _side_entrance() -> void:
	var face := NORTH
	var left := SIDE_DOOR - 2.9
	var right := SIDE_DOOR + 2.9
	var canopy: Material = w.material("plain", Color("a9adb2"))
	w.box(Vector3(3.6, 1.55, 12.0), Vector3(face - 1.8, 6.15, SIDE_DOOR), canopy)
	w.box(Vector3(3.5, 0.04, 11.9), Vector3(face - 1.8, 5.36, SIDE_DOOR), w.material("plain", Color("d4d6d8")))
	for dz in [-3.0, 3.0]:
		w.box(Vector3(0.2, 0.1, 0.2), Vector3(face - 1.8, 5.3, SIDE_DOOR + dz), w.material("plain", Color("2a2a30")))
		w._omni(Vector3(face - 1.8, 5.0, SIDE_DOOR + dz), Color("ffd79d"), 1.0, 6.5)
	w.box(Vector3(3.6, 0.2, 12.0), Vector3(face - 1.8, -0.1, SIDE_DOOR), w.material("concrete", Color("c4c2b9")))
	var slate: Material = w.material("slate")
	for piece in [[-36.0, left], [right, -5.0]]:
		var width: float = piece[1] - piece[0]
		w.box(Vector3(0.14, 3.6, width), Vector3(face - 0.07, 1.8, (piece[0] + piece[1]) / 2.0), slate)
	var siding: Material = w.material("plain", Color("c9cccf"))
	for end in [[-DEPTH, -36.0], [-5.0, 0.0]]:
		var mid: float = (end[0] + end[1]) / 2.0
		w.box(Vector3(0.1, 3.6, 5.0), Vector3(face - 0.05, 1.8, mid), siding)
		for k in 12:
			w.box(Vector3(0.12, 0.03, 5.0), Vector3(face - 0.06, 0.2 + k * 0.3, mid), w.material("plain", Color("aeb1b5")))
		w.box(Vector3(0.45, 1.0, 2.6), Vector3(face - 0.22, 4.4, mid), w.material("plain", Color("c8b48c")))
		for k in 5:
			w.box(Vector3(0.48, 0.05, 2.6), Vector3(face - 0.24, 4.0 + k * 0.2, mid), w.material("plain", Color("9c8865")))
	for lz in [-38.0, -27.0, -14.0, -3.0]:
		_wall_lamp(Vector3(face - 0.08, 2.6, lz))
	# The opening: a cream surround, reveals and a dark hall beyond.
	var surround: Material = w.material("stucco", Color("fffaee"))
	w.box(Vector3(0.25, 0.3, right - left + 0.5), Vector3(face - 0.12, 4.85, SIDE_DOOR), surround)
	for lz in [left - 0.12, right + 0.12]:
		w.box(Vector3(0.25, 4.7, 0.25), Vector3(face - 0.12, 2.35, lz), surround)
		w.box(Vector3(3.0, 4.7, 0.1), Vector3(face + 1.5, 2.35, lz + (0.06 if lz < SIDE_DOOR else -0.06)), surround)
	w.box(Vector3(0.1, 4.7, right - left), Vector3(face + 3.0, 2.35, SIDE_DOOR), w.material("plain", Color("1d1d21")))
	w.box(Vector3(3.0, 0.1, right - left), Vector3(face + 1.5, 0.0, SIDE_DOOR), w.material("plain", Color("5a4747")))

# --- Back -----------------------------------------------------------------------

## The back, on the alley by the annex: a blue-grey upper band between cream piers,
## doors up small stoops, two roll-up grilles, red hose boxes and awning windows.
func _back() -> void:
	var face := -DEPTH
	var out := -1.0
	var b := bay()
	var pier: Material = w.material("stucco", Color("fffaee"))
	for i in BAYS + 1:
		var lx := NORTH + i * b + (0.45 if i == 0 else (-0.45 if i == BAYS else 0.0))
		w.box(Vector3(0.9 if i == 0 or i == BAYS else 0.55, WALL_TOP, 0.35), Vector3(lx, WALL_TOP / 2.0, face - 0.175), pier)
	var blue: Material = w.material("stucco", Color("c5d4e4"))
	var stoop: Material = w.material("concrete", Color("c9c6bc"))
	for i in BAYS:
		var centre := NORTH + (i + 0.5) * b
		w.box(Vector3(b - 0.6, 4.1, 0.06), Vector3(centre, 6.55, face - 0.03), blue)
		w.box(Vector3(2.0, 0.8, 0.08), Vector3(centre, 7.7, face - 0.07), w.material("plain", Color("9da3a8")))
		for k in 4:
			w.box(Vector3(2.0, 0.04, 0.1), Vector3(centre, 7.4 + k * 0.2, face - 0.1), w.material("plain", Color("eeeee8")))
		_wall_lamp(Vector3(centre + 1.8, 5.2, face - 0.1))
		if i == 2 or i == 7:
			# A roll-up grille, open on a dark store room.
			w.box(Vector3(3.0, 2.8, 0.06), Vector3(centre, 1.4, face - 0.04), w.material("plain", Color("2b2c30")))
			for k in 14:
				w.box(Vector3(0.03, 2.8, 0.05), Vector3(centre - 1.45 + k * 0.22, 1.4, face - 0.08), w.material("plain", Color("6b7174")))
			continue
		var door := centre - 1.2
		w.box(Vector3(1.0, 2.2, 0.06), Vector3(door, 0.45 + 1.1, face - 0.04), w.material("plain", Color("b4a283")))
		w.box(Vector3(1.25, 0.12, 0.1), Vector3(door, 2.72, face - 0.05), _white())
		for side: float in [-1.0, 1.0]:
			w.box(Vector3(0.1, 2.3, 0.1), Vector3(door + side * 0.57, 0.45 + 1.15, face - 0.05), _white())
		w.box(Vector3(1.8, 0.635, 1.2), Vector3(door, 0.1325, face - 0.6), stoop)
		w.box(Vector3(1.8, 0.335, 0.4), Vector3(door, -0.0175, face - 1.4), stoop)
		_grid(centre + 1.1, 1.9, 1.2, 1.1, 2, 2, false, i + 40, face, out)
		if i % 3 == 0:
			w.box(Vector3(0.5, 0.75, 0.15), Vector3(centre + 2.2, 1.6, face - 0.08), w.material("plain", Color("c7362f")))

# --- The walk in front and its things -------------------------------------------------

## The raised concrete walk along the front, under the eave, with its kerb.
func _walk() -> void:
	var length := STRIP_END - NORTH
	var middle := (NORTH + STRIP_END) / 2.0
	w.box(Vector3(length, 0.35, STRIP), Vector3(middle, -0.025, STRIP / 2.0), w.material("concrete", Color("c4c2b9")))
	w.box(Vector3(length, 0.37, 0.18), Vector3(middle, -0.015, STRIP - 0.09), w.material("stucco", Color("bfc4bc")))
	w.box(Vector3(0.18, 0.37, STRIP), Vector3(NORTH + 0.09, -0.015, STRIP / 2.0), w.material("stucco", Color("bfc4bc")))

func _props() -> void:
	for lx in [95.0, 99.0, 103.0]:
		_tent(lx)
	for at in [Vector2(92.9, 3.3), Vector2(105.3, 0.9)]:
		_planter(at)
	w._tree(Vector3(106.4, 0.15, 3.3), 7.4, 618)
	var tyre := TorusMesh.new()
	tyre.inner_radius = 0.22
	tyre.outer_radius = 0.42
	tyre.rings = 12
	tyre.ring_segments = 6
	var rubber: Material = w.material("plain", Color("2a2a2c"))
	for stack in [[108.4, 2.6, 4], [109.7, 1.2, 3], [110.8, 3.0, 2]]:
		for k in stack[2]:
			w._mesh(tyre, Vector3(stack[0], 0.25 + k * 0.2, stack[1]), rubber)
	for lx in [122.0, 123.4]:
		_barrier(lx)

## A green canvas tent over a picnic table, as along the gym's front.
func _tent(lx: float) -> void:
	var canvas := w.material("plain", Color("3d6b4b")).duplicate() as StandardMaterial3D
	canvas.cull_mode = BaseMaterial3D.CULL_DISABLED
	var roof := CylinderMesh.new()
	roof.top_radius = 0.0
	roof.bottom_radius = 2.2
	roof.height = 0.75
	roof.radial_segments = 4
	roof.rings = 1
	roof.cap_bottom = false
	w._mesh(roof, Vector3(lx, 2.98, 2.0), canvas, PI / 4.0).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	var steel: Material = w.material("plain", Color("5a6266"))
	var hem: Material = w.material("plain", Color("2f5a3d"))
	for dx in [-1.4, 1.4]:
		for dz in [-1.3, 1.3]:
			w.box(Vector3(0.05, 2.6, 0.05), Vector3(lx + dx, 0.15 + 1.3, 2.0 + dz), steel)
	for dz in [-1.5, 1.5]:
		w.box(Vector3(3.1, 0.18, 0.04), Vector3(lx, 2.55, 2.0 + dz), hem)
	var green: Material = w.material("plain", Color("4f7d4f"))
	w.box(Vector3(1.8, 0.06, 0.75), Vector3(lx, 0.9, 2.0), green)
	for dz in [-0.65, 0.65]:
		w.box(Vector3(1.8, 0.05, 0.3), Vector3(lx, 0.6, 2.0 + dz), green)
	for dx in [-0.75, 0.75]:
		w.box(Vector3(0.05, 0.75, 1.5), Vector3(lx + dx, 0.15 + 0.375, 2.0), steel)

## A big pale planter with a shrub, as by the gym's front.
func _planter(at: Vector2) -> void:
	var pot := CylinderMesh.new()
	pot.top_radius = 0.42
	pot.bottom_radius = 0.33
	pot.height = 0.7
	pot.radial_segments = 8
	w._mesh(pot, Vector3(at.x, 0.5, at.y), w.material("plain", Color("cfe0dc")))
	for i in 7:
		var a := i * TAU / 7.0
		w.rod(Vector3(at.x, 0.8, at.y), Vector3(at.x + cos(a) * 0.45, 1.3 + (i % 3) * 0.18, at.y + sin(a) * 0.4), 0.05, Color("5f7d47"))

## A rusty wire-mesh barrier on its feet.
func _barrier(lx: float) -> void:
	var rust: Material = w.material("plain", Color("8a5f3c"))
	var wire: Material = w.material("plain", Color("9a7a5c"))
	for y in [0.4, 1.3]:
		w.box(Vector3(1.3, 0.05, 0.05), Vector3(lx, 0.15 + y, 3.55), rust)
	for dx in [-0.65, 0.65]:
		w.box(Vector3(0.05, 1.0, 0.05), Vector3(lx + dx, 0.15 + 0.85, 3.55), rust)
		w.box(Vector3(0.05, 0.05, 0.6), Vector3(lx + dx, 0.18, 3.55), rust)
	var x := lx - 0.6
	while x < lx + 0.6:
		w.box(Vector3(0.015, 0.9, 0.015), Vector3(x, 0.15 + 0.85, 3.55), wire)
		x += 0.15

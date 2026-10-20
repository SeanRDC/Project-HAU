extends RefCounted
## The walk along the chapel's south side, from Mikko's CHAPEL RIGHTSIDE SIDEWALK photos
## (2026-10-19): a narrow black asphalt path with white kerbs leaves the oval plaza's
## south end, runs straight along the chapel between the parking and the trees, then
## curves north-east past low bollard lamps to the east road. North of it, lawn worn to
## dirt under thin shade trees and bamboo, up to the chapel's glass hall and the
## EVACUATION SITE 3 sign; south of it, a grass strip with red-tipped shrubs and young
## trees, then the parked cars nosed in to it. Green picnic sheds stand on worn lawn in
## the corner by the east road.
##
## World coordinates (metres, Y up). Built with world.gd's helpers, like every area.

const Chapel := preload("res://areas/chapel.gd")

## The path's centre line, west to east: the plaza's south end, the straight run along
## the chapel, the curve past the picnic corner, into the east road.
const PATH: Array[Vector2] = [Vector2(-35.3, 80.5), Vector2(-31.6, 86.4), Vector2(-26.6, 90.6), Vector2(-20.0, 91.8),
	Vector2(18.0, 91.8), Vector2(23.0, 90.9), Vector2(27.5, 88.0), Vector2(31.0, 84.2), Vector2(34.2, 80.6),
	Vector2(37.8, 78.8)]
## The asphalt's width (the white kerbs stand just outside it).
const WIDTH := 1.5
## Where the parking starts (Sjh.PARKING's north edge), with its white kerb.
const PARKING_Z := 97.6
## The walkable ground round the path: the lawn up to the chapel and down into the
## parking, all along it from where it starts by the oval (the chapel, the Formation
## Center's plot and every prop still block).
const GROUND := Rect2(-44.0, 76.0, 81.0, PARKING_Z + 0.3 - 76.0)
## Thin shade trees, each over its worn patch: x, z, height.
const TREES: Array[Vector3] = [Vector3(-24.0, 87.0, 7.6), Vector3(-19.5, 84.6, 6.8), Vector3(-15.0, 87.8, 7.2),
	Vector3(-10.5, 83.6, 6.6), Vector3(-6.0, 88.2, 7.8), Vector3(-1.5, 84.8, 7.0), Vector3(2.8, 88.6, 6.6),
	Vector3(7.5, 85.0, 7.4), Vector3(11.8, 88.4, 7.0), Vector3(16.0, 85.6, 7.8), Vector3(20.2, 88.0, 6.8),
	Vector3(24.5, 84.8, 7.2), Vector3(13.5, 82.6, 6.4), Vector3(-13.0, 80.6, 6.2)]
## Young trees in the grass by the path, where the photos have foxtail palms: x, z,
## height. (Palms' level fronds are edge-on to this low view and read as bare poles.)
const SAPLINGS: Array[Vector3] = [Vector3(-17.0, 93.8, 3.6), Vector3(-2.0, 93.6, 3.9), Vector3(13.0, 93.8, 3.4),
	Vector3(29.6, 95.9, 3.0)]
## Red-tipped shrubs on the picnic corner's lawn (the RIGHT SIDE DETAILS photo).
const CORNER_SHRUBS: Array[Vector2] = [Vector2(29.4, 92.2), Vector2(36.0, 96.6), Vector2(27.2, 95.4), Vector2(35.8, 90.9)]
## Bamboo clumps: x, z, radius.
const BAMBOO: Array[Vector3] = [Vector3(-27.0, 85.4, 1.3), Vector3(-23.2, 81.6, 0.9), Vector3(5.8, 79.6, 1.0),
	Vector3(26.8, 82.6, 0.8)]
## The green picnic sheds in the corner by the east road.
const SHEDS: Array[Vector2] = [Vector2(35.0, 84.6), Vector2(32.8, 88.8), Vector2(32.8, 93.4)]
## The EVACUATION SITE 3 sign.
const SIGN := Vector2(4.0, 86.0)
## The red bin by the glass hall's west steps.
const BIN := Vector2(-22.4, 73.6)

static var _line := PackedVector2Array()

## The path's centre line, smoothed through PATH and sampled about half a metre apart.
static func line() -> PackedVector2Array:
	if not _line.is_empty():
		return _line
	for i in PATH.size() - 1:
		var p0 := PATH[maxi(i - 1, 0)]
		var p1 := PATH[i]
		var p2 := PATH[i + 1]
		var p3 := PATH[mini(i + 2, PATH.size() - 1)]
		var steps := maxi(1, ceili(p1.distance_to(p2) / 0.5))
		for s in steps:
			var t := float(s) / steps
			# Catmull-Rom through the control points, so the curves are round.
			_line.append(0.5 * (2.0 * p1 + (p2 - p0) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t * t
				+ (3.0 * p1 - p0 - 3.0 * p2 + p3) * t * t * t))
	_line.append(PATH[-1])
	return _line

## How far (x, z) is from the path's centre line.
static func from_path(x: float, z: float) -> float:
	var at := Vector2(x, z)
	var points := line()
	var best := INF
	for i in points.size() - 1:
		best = minf(best, at.distance_to(Geometry2D.get_closest_point_to_segment(at, points[i], points[i + 1])))
	return best

static func on_path(x: float, z: float) -> bool:
	return from_path(x, z) < WIDTH / 2.0 + 0.2

static func walkable(x: float, z: float) -> bool:
	return GROUND.has_point(Vector2(x, z)) or on_path(x, z)

## The bollards: one each side of the curve, about four metres apart.
static func bollards() -> Array[Vector2]:
	var spots: Array[Vector2] = []
	var points := line()
	var gone := 0.0
	var next := 0.0
	for i in points.size() - 1:
		var a := points[i]
		var b := points[i + 1]
		gone += a.distance_to(b)
		if a.x < 16.0 or gone < next:
			continue
		next = gone + 4.2
		var across := Vector2(a.y - b.y, b.x - a.x).normalized()
		var side := 1.0 if spots.size() % 2 == 0 else -1.0
		spots.append(a + across * side * (WIDTH / 2.0 + 0.45))
	return spots

static func blocked(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	for tree in TREES:
		if at.distance_to(Vector2(tree.x, tree.y)) < 0.35:
			return true
	for sapling in SAPLINGS:
		if at.distance_to(Vector2(sapling.x, sapling.y)) < 0.25:
			return true
	for clump in BAMBOO:
		if at.distance_to(Vector2(clump.x, clump.y)) < clump.z:
			return true
	for shed in SHEDS:
		if absf(x - shed.x) < 1.3 and absf(z - shed.y) < 0.9:
			return true # picnic table and benches
	for shrub in CORNER_SHRUBS:
		if at.distance_to(shrub) < 0.55:
			return true
	for post in bollards() + [SIGN, BIN]:
		if at.distance_to(post) < 0.3:
			return true
	return false

## The path's or the dirt's height, or NAN where this area has no say.
static func floor_height(x: float, z: float) -> float:
	if on_path(x, z):
		return -0.17
	if walkable(x, z):
		return -0.18
	return NAN

static var _patches: Array[Vector3] = []

## The worn dirt patches on the lawn, each x, z, radius: under every tree, in front of
## the glass hall's steps where people walk, and under the picnic sheds. Kept clear of
## the path (a decal there would stain the asphalt).
static func patches() -> Array[Vector3]:
	if not _patches.is_empty():
		return _patches
	var wanted: Array[Vector3] = []
	for tree in TREES:
		wanted.append(Vector3(tree.x, tree.y, tree.z * 0.27))
	for bay in Chapel.south_bays():
		var out := Chapel.outward(bay[0], bay[1])
		var front: Vector2 = (bay[0] + bay[1]) / 2.0 + out * 3.6
		wanted.append(Vector3(front.x, front.y, 2.6))
	for shed in SHEDS:
		wanted.append(Vector3(shed.x, shed.y, 2.4))
	for patch in wanted:
		var room := from_path(patch.x, patch.y) - WIDTH / 2.0 - 0.35
		if room > 0.8:
			_patches.append(Vector3(patch.x, patch.y, minf(patch.z, room)))
	return _patches

## How worn the ground is here: 1 in a dirt patch's middle, fading to 0 at its edge.
static func dirt(x: float, z: float) -> float:
	var worn := 0.0
	for patch in patches():
		worn = maxf(worn, smoothstep(1.0, 0.45, Vector2(x, z).distance_to(Vector2(patch.x, patch.y)) / patch.z))
	return worn

## Where grass grows: everywhere on the walk but the path and the dirt patches' worn
## middles, so it thins out into them rather than stopping at an edge.
static func grassy(x: float, z: float) -> bool:
	if not walkable(x, z):
		return true
	if from_path(x, z) < WIDTH / 2.0 + 0.3:
		return false
	return dirt(x, z) < 0.5

## 1 on the walk (the camera then cuts away the parking and SJH behind it).
static func view_for(x: float, z: float) -> float:
	return smoothstep(76.0, 79.0, z) * (1.0 - smoothstep(PARKING_Z - 0.4, PARKING_Z + 1.0, z)) \
		* smoothstep(-31.0, -26.0, x) * (1.0 - smoothstep(34.0, 37.0, x))

var w: RefCounted

func build(world: RefCounted) -> void:
	w = world
	_dirt()
	_path()
	_planting()
	_corner()
	_details()

# --- Ground and path -------------------------------------------------------------

## Bare dirt from the chapel down to the path, clear of the chapel and the Formation
## Center's plot (its own pad is drawn there).
## The walk's ground is the lawn, worn to dirt in soft patches (decals with ragged,
## fading edges, so the grass blends into them), with faint lighter and darker drifts
## over the grass so it does not read as one freshly mown carpet.
func _dirt() -> void:
	var worn: Array[Texture2D] = []
	for k in 3:
		worn.append(_patch_texture(5100 + k, [Color("b3a184"), Color("a08c6d"), Color("c2b496"), Color("8f7d61")], 0.95))
	for i in patches().size():
		var patch := patches()[i]
		_decal(Vector2(patch.x, patch.y), Vector2(patch.z, patch.z * 0.85) * 2.4, worn[i % 3], i * 1.3)
	var random := RandomNumberGenerator.new()
	random.seed = 5200
	var drifts: Array[Texture2D] = [
		_patch_texture(5210, [Color("6e8a4c"), Color("63804a"), Color("7a9356")], 0.32),
		_patch_texture(5211, [Color("9caf63"), Color("a9b86e"), Color("8fa65e")], 0.28)]
	var placed := 0
	var tries := 0
	while placed < 26 and tries < 400:
		tries += 1
		var at := Vector2(random.randf_range(GROUND.position.x + 14.0, GROUND.end.x - 1.0), random.randf_range(78.0, PARKING_Z - 0.5))
		var size := random.randf_range(2.5, 5.0)
		if from_path(at.x, at.y) - WIDTH / 2.0 - 0.3 < size / 2.0 or not walkable(at.x, at.y):
			continue
		_decal(at, Vector2(size, size * random.randf_range(0.5, 0.9)), drifts[placed % 2], random.randf() * PI)
		placed += 1

## A soft-edged ground patch as a pixel image: speckled in `colors`, its alpha falling
## off from the middle with a ragged, noisy rim in stepped levels (no smooth airbrush).
func _patch_texture(seed_value: int, colors: Array, strength: float) -> Texture2D:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var noise := FastNoiseLite.new()
	noise.seed = seed_value
	noise.frequency = 0.09
	var image := Image.create(64, 64, false, Image.FORMAT_RGBA8)
	for y in 64:
		for x in 64:
			var d := Vector2((x - 31.5) / 31.5, (y - 31.5) / 31.5).length()
			var edge := 1.0 - d + noise.get_noise_2d(x, y) * 0.45
			var alpha := snappedf(clampf(edge * 2.2, 0.0, 1.0), 0.25) * strength
			if random.randf() < 0.15:
				alpha *= 0.6
			var tone: Color = colors[random.randi_range(0, colors.size() - 1)]
			image.set_pixel(x, y, Color(tone, alpha))
	return ImageTexture.create_from_image(image)

func _decal(at: Vector2, size: Vector2, texture: Texture2D, turn: float) -> void:
	var decal := Decal.new()
	decal.texture_albedo = texture
	decal.size = Vector3(size.x, 0.6, size.y)
	decal.position = Vector3(at.x, -0.2, at.y)
	decal.rotation.y = turn
	decal.upper_fade = 0.2
	decal.lower_fade = 0.2
	decal.normal_fade = 0.6 # only the ground, not trunks or kerbs
	w.root.add_child(decal)

func _path() -> void:
	var asphalt: Material = w.material("road", Color("5f6468"))
	var edge: Material = w.material("stucco", Color("e9e7df"))
	var points := line()
	for i in points.size() - 1:
		var a := points[i]
		var b := points[i + 1]
		var middle := (a + b) / 2.0
		var turn := atan2(-(b - a).y, (b - a).x)
		var length := a.distance_to(b) + 0.08
		w.box(Vector3(length, 0.06, WIDTH), Vector3(middle.x, -0.2, middle.y), asphalt, turn)
		var across := Vector2(a.y - b.y, b.x - a.x).normalized()
		for side in [-1.0, 1.0]:
			var kerb: Vector2 = middle + across * side * (WIDTH / 2.0 + 0.07)
			w.box(Vector3(length, 0.1, 0.14), Vector3(kerb.x, -0.16, kerb.y), edge, turn)
	# The parking's white kerb along the grass, from the plaza to the picnic corner.
	w.box(Vector3(72.0, 0.16, 0.2), Vector3(-8.0, -0.12, PARKING_Z - 0.1), edge)

# --- Planting ------------------------------------------------------------------------

func _planting() -> void:
	for i in TREES.size():
		var tree := TREES[i]
		w._tree(Vector3(tree.x, -0.18, tree.y), tree.z, 1300 + i)
	for i in SAPLINGS.size():
		var sapling := SAPLINGS[i]
		w._tree(Vector3(sapling.x, -0.2, sapling.y), sapling.z, 1330 + i)
	for i in BAMBOO.size():
		var clump := BAMBOO[i]
		w._bamboo(Vector3(clump.x, -0.18, clump.y), clump.z, roundi(clump.z * 24.0), 1340 + i)
	# Red-tipped shrubs along the grass by the cars, and a young tree or two.
	var x := -25.0
	var k := 0
	while x < 26.0:
		w._shrub(Vector3(x, -0.2, 96.2 - (k % 2) * 0.5), 1.0 + (k % 3) * 0.15, 1350 + k)
		x += 4.6 + (k % 3) * 0.7
		k += 1
	for i in CORNER_SHRUBS.size():
		var at := CORNER_SHRUBS[i]
		w._shrub(Vector3(at.x, -0.2, at.y), 1.1 + (i % 2) * 0.3, 1370 + i)
	# Dark rounded hedges against the chapel's plinth, between the steps.
	for at in [Vector2(-16.4, 77.6), Vector2(-6.0, 77.0), Vector2(-1.0, 73.6), Vector2(4.6, 72.4)]:
		w._shrub(Vector3(at.x, -0.18, at.y), 1.6, 1380 + roundi(at.x), w.HEDGE_COLORS)

# --- The picnic corner and the bollards ---------------------------------------------

func _corner() -> void:
	for shed in SHEDS:
		w._shed(shed.x, shed.y)
	# Low square bollards, dark grey with a warm glass top, lit at night (glow only).
	var body: Material = w.material("plain", Color("4d5452"))
	var lamp: Material = w.glow(Color("f2d38c"), 0.15, 1.8)
	for post in bollards():
		w.box(Vector3(0.2, 0.62, 0.2), Vector3(post.x, 0.11, post.y), body)
		w.box(Vector3(0.17, 0.2, 0.17), Vector3(post.x, 0.52, post.y), lamp)
		w.box(Vector3(0.22, 0.05, 0.22), Vector3(post.x, 0.645, post.y), body)

# --- Details ---------------------------------------------------------------------------

func _details() -> void:
	# The EVACUATION SITE 3 sign: a yellow board on a yellow post, facing the path.
	var yellow := Color("e8cb3a")
	w.rod(Vector3(SIGN.x, -0.18, SIGN.y), Vector3(SIGN.x, 2.3, SIGN.y), 0.045, yellow)
	w.panel("EVACUATION SITE", Vector3(SIGN.x, 2.45, SIGN.y + 0.06), 1.5, 0.32, Color("1b1b1b"), yellow)
	w.panel("3", Vector3(SIGN.x, 2.12, SIGN.y + 0.06), 1.5, 0.34, Color("1b1b1b"), yellow)
	# The red bin by the west steps.
	w.box(Vector3(0.5, 0.8, 0.45), Vector3(BIN.x, 0.22, BIN.y), w.material("plain", Color("c42d2a")))
	w.box(Vector3(0.56, 0.08, 0.5), Vector3(BIN.x, 0.66, BIN.y), w.material("plain", Color("a32422")))
	# A low steel railing along the curve by the plaza, on the chapel side.
	var points := line()
	for i in points.size() - 1:
		var a := points[i]
		var b := points[i + 1]
		if a.x > -27.5:
			break
		var across := Vector2(a.y - b.y, b.x - a.x).normalized()
		var from := a + across * 1.25
		var to := b + across * 1.25
		for y in [0.35, 0.7, 1.0]:
			w.rod(Vector3(from.x, y, from.y), Vector3(to.x, y, to.y), 0.025, Color("7d7468"))
		if i % 3 == 0:
			w.rod(Vector3(from.x, -0.18, from.y), Vector3(from.x, 1.05, from.y), 0.03, Color("7d7468"))

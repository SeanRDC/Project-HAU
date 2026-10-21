extends RefCounted
## The Chapel of the Holy Guardian Angel and its plaza, from the CHAPEL photos and
## its traced outline in the team's plan (campus_plan.gd). The round end faces west
## onto a stamped-concrete plaza with the HAU seal, inside the oval parking. A white
## plinth with wide steps carries a glass front between white columns; three thin
## oval roof bands step out above it under a gold cross. A black asphalt path with
## white edges comes across the lawn from the APS road; trees and palms stand round it.
##
## World coordinates (metres, Y up). Built with world.gd's helpers, like every area.

const CampusPlan := preload("res://campus_plan.gd")
const Roads := preload("res://roads.gd")

## The front tip of the round end, from the plan.
const NOSE := Vector2(-25.7, 59.5)
## The plane the chapel view frames (the glass front), as z = 0 frames the APS front.
const FACE_X := -26.0
## The oval parking round the plaza, and the planted island in its middle.
const OVAL := Vector2(-41.0, 59.5)
const OVAL_RADII := Vector2(12.5, 24.0)
const ISLAND := Vector2(-45.0, 59.5)
const ISLAND_RADII := Vector2(3.2, 13.0)
## The paved gap from the oval to the west road.
const DRIVE := Rect2(-55.2, 55.0, 2.2, 9.0)
## The lawn between the west road and the oval (z range): walkable, so the parking can be
## reached from the road anywhere along it, not only by the drive.
const ROADSIDE := Vector2(42.0, 78.0)
## The lawn path from the APS road to the oval's north end.
const PATH := Rect2(-37.5, 10.4, 3.0, 28.3)
## Banners (Vatican yellow/white, white/red, white/blue) round the plaza.
## Palm fronds: yellow-greens, lighter than the shade trees.
const PALM_COLORS: Array[Color] = [Color("4f6b33"), Color("66843a"), Color("86a446"), Color("a9c05a"), Color("c8d676")]
const BANNERS: Array[Vector2] = [Vector2(-29.6, 49.2), Vector2(-29.6, 69.8), Vector2(-45.0, 45.0),
	Vector2(-45.0, 74.0), Vector2(-36.6, 39.0), Vector2(-36.6, 80.0)]

static var _outline := PackedVector2Array()

static func outline() -> PackedVector2Array:
	if _outline.is_empty():
		for point in CampusPlan.PLOTS["chapel"]["outline"]:
			_outline.append(point)
	return _outline

## The outline's middle, which the walls' outward sides are measured from.
static func plan_centre() -> Vector2:
	var middle := Vector2.ZERO
	for p in outline():
		middle += p
	return middle / outline().size()

## The outward unit normal of the outline's edge from a to b.
static func outward(a: Vector2, b: Vector2) -> Vector2:
	var out := Vector2(b.y - a.y, a.x - b.x).normalized()
	return -out if out.dot((a + b) / 2.0 - plan_centre()) < 0.0 else out

## The three bays of the glass hall on the south side, facing the walk (from the CHAPEL
## RIGHTSIDE SIDEWALK photos): each [a, b] along the outline, west to east.
static func south_bays() -> Array:
	var bays := []
	var shape := outline()
	for i in shape.size():
		var a := shape[i]
		var b := shape[(i + 1) % shape.size()]
		if outward(a, b).y > 0.7 and (a + b).y / 2.0 > 73.0:
			bays.append([a, b])
	return bays

static func _in_ellipse(at: Vector2, centre: Vector2, radii: Vector2) -> bool:
	var d := (at - centre) / radii
	return d.length_squared() <= 1.0

static func in_plaza(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	return (_in_ellipse(at, OVAL, OVAL_RADII) and not _in_ellipse(at, ISLAND, ISLAND_RADII)) or DRIVE.has_point(at)

## The lawn strip between the west road's kerb and the oval.
static func roadside(x: float, z: float) -> bool:
	if z < ROADSIDE.x or z > ROADSIDE.y or x > OVAL.x or _in_ellipse(Vector2(x, z), OVAL, OVAL_RADII):
		return false
	var across := Roads.across(x, z)
	return across >= 10.6 and across < 22.0

static func walkable(x: float, z: float) -> bool:
	return in_plaza(x, z) or PATH.has_point(Vector2(x, z)) or roadside(x, z)

static func blocked(x: float, z: float) -> bool:
	if Geometry2D.is_point_in_polygon(Vector2(x, z), outline()):
		return true
	if x > NOSE.x - 1.9 and x < NOSE.x + 2.0 and absf(z - NOSE.y) < 6.2:
		return true # the steps up to the glass front
	for bay in south_bays():
		var at := Vector2(x, z)
		if at.distance_to(Geometry2D.get_closest_point_to_segment(at, bay[0], bay[1])) < 2.7:
			return true # the steps up to the south glass hall
	for banner in BANNERS:
		if Vector2(x, z).distance_to(banner) < 0.25:
			return true
	return false

## The plaza's or the path's height, or NAN where this area has no say.
static func floor_height(x: float, z: float) -> float:
	if in_plaza(x, z):
		return -0.04
	if PATH.has_point(Vector2(x, z)):
		return -0.17
	return NAN

var w: RefCounted

func build(world: RefCounted) -> void:
	w = world
	_plaza()
	_building()
	_paths()
	_planting()

# --- Plaza and parking ----------------------------------------------------------

func _ellipse(centre: Vector2, radii: Vector2, steps := 48) -> PackedVector2Array:
	var points := PackedVector2Array()
	for i in steps:
		var a := TAU * i / steps
		points.append(centre + Vector2(cos(a), sin(a)) * radii)
	return points

func _fan(points: PackedVector2Array, centre: Vector2) -> PackedVector2Array:
	var triangles := PackedVector2Array()
	for i in points.size():
		triangles.append_array([centre, points[i], points[(i + 1) % points.size()]])
	return triangles

## Boxes laid along a closed outline (kerbs, edges), each turned to its side.
func _edge(points: PackedVector2Array, width: float, height: float, y: float, made: Material, skip := Callable()) -> void:
	for i in points.size():
		var a := points[i]
		var b := points[(i + 1) % points.size()]
		var middle := (a + b) / 2.0
		if skip.is_valid() and skip.call(middle):
			continue
		w.box(Vector3(snappedf(a.distance_to(b) + 0.05, 0.05), height, width), Vector3(middle.x, y, middle.y), made, atan2(-(b - a).y, (b - a).x))

func _plaza() -> void:
	var pavers: Material = w.material("pavers")
	var rim := _ellipse(OVAL, OVAL_RADII, 64)
	w._ground(_fan(rim, OVAL), -0.04, pavers)
	w.box(Vector3(DRIVE.size.x, 0.18, DRIVE.size.y), Vector3(DRIVE.get_center().x, -0.13, DRIVE.get_center().y), pavers)
	# A white kerb round the oval, open to the lawn path and the drive.
	var openings := func(at: Vector2) -> bool:
		return (absf(at.x - PATH.get_center().x) < 1.8 and at.y < OVAL.y) or (at.x < OVAL.x - 10.0 and absf(at.y - DRIVE.get_center().y) < 4.6)
	_edge(rim, 0.3, 0.24, -0.1, w.material("stucco", Color("eceae2")), openings)
	# The planted island: raised lawn in a low kerb, with trees and the banners round it.
	var island := _ellipse(ISLAND, ISLAND_RADII, 40)
	w._ground(_fan(island, ISLAND), 0.06, w.material("grass"))
	_edge(island, 0.25, 0.3, -0.05, w.material("stucco", Color("d9d6cc")))
	# Low red-tipped shrubs only: trees here would stand between the camera and the steps.
	for z in [49.0, 54.5, 64.5, 70.0]:
		w._shrub(Vector3(ISLAND.x, 0.06, z), 1.5, 700 + roundi(z))
	# Parking bays painted round the rim, clear of the chapel front and the openings.
	var paint: Material = w.material("plain", Color("e8e6dc"))
	for i in 44:
		var a := TAU * i / 44.0
		var on_rim := OVAL + Vector2(cos(a), sin(a)) * OVAL_RADII
		if cos(a) > 0.55 or openings.call(on_rim):
			continue
		var inward := (OVAL - on_rim).normalized()
		var middle := on_rim + inward * 2.6
		w.box(Vector3(4.6, 0.012, 0.1), Vector3(middle.x, -0.03, middle.y), paint, atan2(-inward.y, inward.x))
	_seal(Vector2(NOSE.x - 6.5, NOSE.y))
	for at in BANNERS:
		_banner(at, BANNERS.find(at) % 3)
	for at in [Vector2(-52.0, 48.0), Vector2(-52.0, 71.0)]:
		w._street_light(at.x + 1.05, at.y)

## The HAU seal set into the plaza: a ring, a heart and spread wings, drawn as a
## flat pixel decal in darker stamped concrete.
func _seal(at: Vector2) -> void:
	var image := Image.create(128, 128, false, Image.FORMAT_RGBA8)
	var ink := Color("5f5246")
	for a in 360:
		var r := deg_to_rad(a)
		for t in [26.0, 27.0]:
			image.set_pixel(64 + roundi(cos(r) * t), 64 + roundi(sin(r) * t), ink)
	for y in range(52, 76):
		for x in range(48, 81):
			var nx := (x - 64.0) / 14.0
			var ny := (y - 58.0) / 14.0
			if pow(nx * nx + ny * ny - 0.3, 3.0) - nx * nx * pow(ny, 3.0) < 0.0 and ny > -0.9:
				image.set_pixel(x, 128 - y, ink)
	for side: int in [-1, 1]:
		for feather in 7:
			var length := 30.0 - feather * 2.5
			var lift := 0.15 + feather * 0.12
			for s in int(length):
				var px: int = 64 + side * (24 + s)
				var py := 60 - roundi(s * lift) + feather * 3
				if px >= 0 and px < 128 and py >= 0 and py < 128:
					image.set_pixel(px, py, ink)
	image.generate_mipmaps()
	var made := StandardMaterial3D.new()
	made.albedo_texture = ImageTexture.create_from_image(image)
	made.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
	made.alpha_scissor_threshold = 0.5
	made.diffuse_mode = BaseMaterial3D.DIFFUSE_LAMBERT
	made.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
	made.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	var quad := QuadMesh.new()
	quad.size = Vector2(9.0, 9.0)
	var decal: MeshInstance3D = w._mesh(quad, Vector3(at.x, -0.032, at.y), made)
	decal.rotation = Vector3(-PI / 2.0, -PI / 2.0, 0)
	decal.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	var label := Label3D.new()
	label.text = "HAU"
	label.font_size = 64
	label.pixel_size = 0.018
	label.modulate = ink
	label.shaded = true
	label.outline_size = 0
	label.position = Vector3(at.x + 0.4, -0.03, at.y)
	label.rotation = Vector3(-PI / 2.0, -PI / 2.0, 0)
	w.root.add_child(label)

## A tall banner on a pole: a vertical cloth in two colours, hung from a short arm.
func _banner(at: Vector2, kind: int) -> void:
	var colours: Array = [[Color("f3d23a"), Color("f5f5f0")], [Color("f5f5f0"), Color("c8302f")], [Color("f5f5f0"), Color("8fbfe0")]][kind]
	w.rod(Vector3(at.x, -0.05, at.y), Vector3(at.x, 6.6, at.y), 0.04, Color("c9ccc8"))
	w.rod(Vector3(at.x, 6.4, at.y), Vector3(at.x, 6.4, at.y + 0.95), 0.02, Color("c9ccc8"))
	for half in 2:
		w.box(Vector3(0.03, 3.0, 0.45), Vector3(at.x, 4.85, at.y + 0.25 + half * 0.45), w.material("plain", colours[half]))

# --- The building ----------------------------------------------------------------

## A flat-topped solid from an outline, `scale` times its size about `centre`.
func _prism(points: PackedVector2Array, y0: float, y1: float, made: Material, centre: Vector2, scale := 1.0) -> MeshInstance3D:
	var shape := PackedVector2Array()
	for p in points:
		shape.append(centre + (p - centre) * scale)
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
	return w._mesh(tool.commit(), Vector3.ZERO, made)

func _building() -> void:
	var shape := outline()
	var centre := Vector2.ZERO
	for p in shape:
		centre += p
	centre /= shape.size()
	var white: Material = w.material("stucco", Color("fbfaf4"))
	var frieze: Material = w.material("stucco", Color("f3f1e8"))
	var glass: Material = w.material("glass", Color("9fb4b9"))
	var column: Material = w.material("stucco", Color("fffef8"))
	_prism(shape, -0.2, 0.9, w.material("stucco", Color("e6e2d6")), centre, 1.03)
	# Ground floor: glass where the round end faces the plaza, white wall elsewhere.
	for i in shape.size():
		var a := shape[i]
		var b := shape[(i + 1) % shape.size()]
		var out := Vector2(b.y - a.y, a.x - b.x).normalized()
		if out.dot((a + b) / 2.0 - centre) < 0.0:
			out = -out
		var middle := (a + b) / 2.0 - out * 0.25
		var turn := atan2(-(b - a).y, (b - a).x)
		var length := a.distance_to(b) + 0.06
		if [a, b] in south_bays():
			_glass_bay(a, b, out)
			continue # the bay's arch runs up through the frieze's height
		elif out.x < -0.3:
			w.box(Vector3(length, 4.7, 0.1), Vector3(middle.x, 3.25, middle.y), glass, turn)
			var bars := maxi(1, int(length / 1.6))
			for k in bars:
				var at := a.lerp(b, (k + 0.5) / bars) - out * 0.2
				w.box(Vector3(0.07, 4.7, 0.09), Vector3(at.x, 3.25, at.y), column, turn)
			w.box(Vector3(length, 0.1, 0.16), Vector3(middle.x, 2.3, middle.y), column, turn)
			w.box(Vector3(0.55, 5.3, 0.55), Vector3(a.x - out.x * 0.2, 3.55, a.y - out.y * 0.2), column, turn)
			w.box(Vector3(0.75, 0.22, 0.75), Vector3(a.x - out.x * 0.2, 6.1, a.y - out.y * 0.2), frieze, turn)
		else:
			w.box(Vector3(length, 5.3, 0.4), Vector3(middle.x, 3.55, middle.y), white, turn)
			if out.y > 0.6 and length > 3.0:
				# Further along the south side: tall narrow bronze slots in the white wall
				# over a weathered grey plinth, as in the sidewalk photos.
				var slots := maxi(2, int(length / 1.7))
				for k in slots:
					var at := a.lerp(b, (k + 0.5) / slots) + out * 0.03
					w.box(Vector3(0.46, 4.3, 0.05), Vector3(at.x, 3.35, at.y), w.material("plain", Color("a7843f")), turn)
					at += out * 0.02
					w.box(Vector3(0.2, 4.0, 0.05), Vector3(at.x, 3.35, at.y), w.material("glass", Color("4d4a3e")), turn)
				var plinth := (a + b) / 2.0 + out * 0.35
				w.box(Vector3(length, 1.0, 0.1), Vector3(plinth.x, 0.35, plinth.y), w.material("concrete", Color("b3b0a4")), turn)
			elif absf(out.y) > 0.6 and length > 3.0:
				# The side walls' tall arched windows, as dark recesses with light sills.
				var at := (a + b) / 2.0
				w.box(Vector3(minf(length - 1.2, 3.2), 3.4, 0.05), Vector3(at.x, 3.4, at.y), w.material("glass", Color("6d7f86")), turn)
				w.box(Vector3(minf(length - 1.0, 3.4), 0.12, 0.3), Vector3(at.x, 1.65, at.y), frieze, turn)
		w.box(Vector3(length, 1.3, 0.42), Vector3(middle.x, 6.85, middle.y), frieze, turn)
	# The three roof bands: thin white plates stepping out over a recessed core.
	# Wide dark gaps between them, as in the photos, so they read as plates, not steps.
	_prism(shape, 7.5, 9.3, w.material("plain", Color("8f9596")), centre, 0.95)
	var bands := [[7.5, 7.72, 1.06], [8.2, 8.42, 1.12], [8.9, 9.12, 1.18]]
	for band in bands:
		_prism(shape, band[0], band[1], w.material("stucco", Color("fdfdf9")), centre, band[2])
	_prism(shape, 9.12, 9.32, w.material("stucco", Color("e9ebe7")), centre, 1.02)
	# The gold cross on top, towards the front.
	var top := centre.lerp(NOSE, 0.35)
	var gold: Material = w.material("plain", Color("d9a73a"))
	w.box(Vector3(0.22, 1.7, 0.22), Vector3(top.x, 10.2, top.y), gold)
	w.box(Vector3(0.22, 0.22, 1.1), Vector3(top.x, 10.55, top.y), gold)
	# Wide steps from the plaza up to the glass front, and the red panel beside the doors.
	for k in 5:
		var height := 0.2 + (k + 1) * 0.18
		w.box(Vector3(0.36, height, 12.4), Vector3(NOSE.x - 0.18 - 0.36 * (4 - k), -0.2 + height / 2.0, NOSE.y), w.material("stone", Color("efe9dc")))
	w.box(Vector3(0.5, 4.4, 1.9), Vector3(-23.9, 3.1, 64.6), w.material("plain", Color("b3262e")))
	w._omni(Vector3(NOSE.x - 3.0, 4.5, NOSE.y), Color("ffd8a0"), 1.4, 12.0)

## One bay of the south glass hall, from the sidewalk photos: a glass wall between white
## double columns on the raised plinth, a white beam, and above it a gold half-moon in
## a white arch rising to the roof bands; wide steps down to the dirt, with a white
## cheek block where two bays meet.
func _glass_bay(a: Vector2, b: Vector2, out: Vector2) -> void:
	var turn := atan2(-(b - a).y, (b - a).x)
	var length := a.distance_to(b)
	var along := (b - a).normalized()
	var face := (a + b) / 2.0
	var white: Material = w.material("stucco", Color("fbfaf4"))
	var column: Material = w.material("stucco", Color("fffef8"))
	var glass: Material = w.material("glass", Color("9fb4b9"))
	var at := face - out * 0.3
	w.box(Vector3(length - 0.5, 3.3, 0.1), Vector3(at.x, 2.55, at.y), glass, turn)
	var bars := maxi(2, int(length / 1.4))
	for k in range(1, bars):
		var bar := a.lerp(b, float(k) / bars) - out * 0.25
		w.box(Vector3(0.07, 3.3, 0.09), Vector3(bar.x, 2.55, bar.y), column, turn)
	# Double columns at both ends, with a base and a capital.
	for end in [a + along * 0.35, b - along * 0.35]:
		for pair in [-0.22, 0.22]:
			var c: Vector2 = end + along * pair + out * 0.05
			w.box(Vector3(0.3, 3.65, 0.32), Vector3(c.x, 2.72, c.y), column, turn)
		var cap: Vector2 = end + out * 0.08
		w.box(Vector3(0.95, 0.18, 0.45), Vector3(cap.x, 4.62, cap.y), column, turn)
		w.box(Vector3(0.95, 0.14, 0.45), Vector3(cap.x, 0.97, cap.y), column, turn)
	# The beam over the glass, then the white wall up to the roof bands.
	w.box(Vector3(length, 0.34, 0.46), Vector3(face.x - out.x * 0.2, 4.4, face.y - out.y * 0.2), column, turn)
	w.box(Vector3(length, 2.95, 0.4), Vector3(face.x - out.x * 0.25, 6.03, face.y - out.y * 0.25), white, turn)
	# The arch: a white moulding ring and the gold half-moon inside it, in pixel steps.
	var radius := minf(length / 2.0 - 0.5, 2.55)
	var gold: Material = w.material("plain", Color("c9a24e"))
	var strip := 0.16
	var u := -radius - 0.22
	while u < radius + 0.22:
		var centre_u := u + strip / 2.0
		var rim := sqrt(maxf(0.0, pow(radius + 0.22, 2.0) - centre_u * centre_u))
		var p := face + along * centre_u + out * 0.0
		w.box(Vector3(strip, rim, 0.04), Vector3(p.x, 4.58 + rim / 2.0, p.y), column, turn)
		if absf(centre_u) < radius:
			var fill := sqrt(radius * radius - centre_u * centre_u)
			p += out * 0.025
			w.box(Vector3(strip, fill, 0.04), Vector3(p.x, 4.6 + fill / 2.0, p.y), gold, turn)
		u += strip
	# Steps from the dirt up to the plinth, and a cheek block at each end.
	for k in 5:
		var height := 0.2 + (k + 1) * 0.18
		var step := face + out * (0.7 + 0.36 * (4 - k))
		w.box(Vector3(length - 0.9, height, 0.36), Vector3(step.x, -0.2 + height / 2.0, step.y), w.material("stone", Color("ccbfa6")), turn)
	for end in [a, b]:
		var cheek: Vector2 = end + out * 1.3
		w.box(Vector3(0.7, 1.15, 2.4), Vector3(cheek.x, 0.37, cheek.y), white, turn)

# --- Paths and planting -------------------------------------------------------------

func _paths() -> void:
	# The lawn path from the APS road: black asphalt with white edges, as round the chapel lawn.
	var asphalt: Material = w.material("road", Color("6a6f73"))
	var edge: Material = w.material("plain", Color("e9e7df"))
	w.box(Vector3(PATH.size.x, 0.06, PATH.size.y), Vector3(PATH.get_center().x, -0.2, PATH.get_center().y), asphalt)
	for x in [PATH.position.x, PATH.end.x]:
		w.box(Vector3(0.14, 0.08, PATH.size.y), Vector3(x, -0.17, PATH.get_center().y), edge)
	# The jogging path along the chapel's north side (looked at, not walked: the
	# camera has nowhere to stand between the chapel and APS).
	w.box(Vector3(48.0, 0.06, 2.2), Vector3(-10.5, -0.2, 33.6), asphalt)
	for z in [32.5, 34.7]:
		w.box(Vector3(48.0, 0.08, 0.14), Vector3(-10.5, -0.17, z), edge)

## Shade trees on dirt and grass by the chapel's north side, and palms there. The south
## side's trees are the walk's (areas/chapel_south.gd).
func _planting() -> void:
	var dirt: Material = w.material("dirt")
	var trees: Array[Vector3] = [Vector3(-28.0, 30.0, 8.2), Vector3(-19.0, 37.2, 7.4), Vector3(-6.0, 29.8, 8.8),
		Vector3(-12.0, 38.2, 7.0), Vector3(6.0, 38.5, 7.8)]
	for i in trees.size():
		var tree := trees[i]
		w.box(Vector3(3.4, 0.05, 3.0), Vector3(tree.x, -0.18, tree.y), dirt)
		w._tree(Vector3(tree.x, -0.16, tree.y), tree.z, 720 + i)
	for i in 4:
		_palm(Vector3(-24.0 + i * 9.5, -0.2, 36.6 + (i % 2) * 1.6), 8.0 + (i % 3), 740 + i)

## A palm: a slender ringed trunk with a slight lean and a crown of drooping fronds,
## each a long narrow leaf card (lit round the crown like the trees).
func _palm(at: Vector3, height: float, seed_value: int) -> void:
	var random := RandomNumberGenerator.new()
	random.seed = seed_value
	var lean := Vector3(random.randf_range(-0.5, 0.5), 0, random.randf_range(-0.5, 0.5))
	var crown := at + Vector3(0, height, 0) + lean
	w.rod(at, at.lerp(crown, 0.5) + lean * 0.2, 0.14, Color("8f8574"))
	w.rod(at.lerp(crown, 0.5) + lean * 0.2, crown, 0.11, Color("9a9080"))
	var fronds: ShaderMaterial = w._leaf_material(seed_value, crown, PALM_COLORS, true)
	var card: ArrayMesh = w._cards(1.1, 3.4, 0.0, 1)
	for i in 10:
		var frond := MeshInstance3D.new()
		frond.mesh = card
		frond.material_override = fronds
		frond.transform = Transform3D(Basis(Vector3.UP, TAU * i / 10.0 + random.randf() * 0.3) * Basis(Vector3.RIGHT, deg_to_rad(random.randf_range(78.0, 118.0))), crown)
		frond.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
		w.root.add_child(frond)

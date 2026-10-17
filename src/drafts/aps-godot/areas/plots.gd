extends RefCounted
## Reserved plots for everything on the campus layout that is not built yet: every
## building, covered walk, student gate and ground-level area in the team's plan
## (campus_plan.gd, from plan.ts GODOT_PLOTS and Sean's layout reference) gets a flat pad
## on its footprint, a dashed white outline and its name painted on it, so the space
## stays free and everyone can see what goes where. To merge a building: build it in
## areas/<id>.gd on that footprint, then set "built" for it in
## tools/export-godot-plan.mjs (BUILT) and run `npm run export:godot-plan`; the plot
## disappears and blocked() stops treating it as reserved.

const CampusPlan := preload("res://campus_plan.gd")

## The outline's dashes and gaps along each edge, and its width.
const DASH := 1.2
const GAP := 0.8
const LINE := 0.24

static var _shapes := {}

## The unbuilt plots' outlines, by id.
static func shapes() -> Dictionary:
	if _shapes.is_empty():
		for id in CampusPlan.PLOTS:
			var plot: Dictionary = CampusPlan.PLOTS[id]
			if plot["built"]:
				continue
			var shape := PackedVector2Array()
			for point in plot["outline"]:
				shape.append(point)
			_shapes[id] = shape
	return _shapes

## True on a reserved plot: nobody walks into a building that is on its way.
static func occupied(x: float, z: float) -> bool:
	for shape in shapes().values():
		if Geometry2D.is_point_in_polygon(Vector2(x, z), shape):
			return true
	return false

## A point well inside the shape for its name: the label point if it is on the plot,
## else the middle of the plot's largest triangle.
static func label_point(id: String) -> Vector2:
	var shape: PackedVector2Array = shapes()[id]
	var at: Vector2 = CampusPlan.PLOTS[id]["label"]
	if Geometry2D.is_point_in_polygon(at, shape):
		return at
	var indices := Geometry2D.triangulate_polygon(shape)
	var largest := 0.0
	for i in range(0, indices.size(), 3):
		var a := shape[indices[i]]
		var b := shape[indices[i + 1]]
		var c := shape[indices[i + 2]]
		var area := absf((b - a).cross(c - a))
		if area > largest:
			largest = area
			at = (a + b + c) / 3.0
	return at

func build(w: RefCounted) -> void:
	# Pale trodden ground for a building's plot, paler paving for walks, gates and
	# ground-level areas, so a far plot reads as an empty lot rather than a wall.
	var pads := {"building": w.material("dirt", Color("e8e1cb")), "walk": w.material("pavers", Color("f1ebdc")),
		"gate": w.material("pavers", Color("f1ebdc")), "ground": w.material("pavers", Color("e9eedb"))}
	var paint: Material = w.material("plain", Color("f4f3ee"))
	var shapes := shapes()
	for id in shapes:
		var shape: PackedVector2Array = shapes[id]
		var plot: Dictionary = CampusPlan.PLOTS[id]
		var triangles := PackedVector2Array()
		for i in Geometry2D.triangulate_polygon(shape):
			triangles.append(shape[i])
		w._ground(triangles, -0.17, pads.get(plot["kind"], pads["building"]))
		# The dashed white outline, a dash and a gap at a time along every edge.
		for i in shape.size():
			var a := shape[i]
			var b := shape[(i + 1) % shape.size()]
			var length := a.distance_to(b)
			var turn := atan2(-(b - a).y, (b - a).x)
			var s := 0.0
			while s < length:
				var dash := minf(DASH, length - s)
				var middle := a.lerp(b, (s + dash / 2.0) / length)
				w.box(Vector3(snappedf(dash, 0.05) + 0.001, 0.03, LINE), Vector3(middle.x, -0.155, middle.y), paint, turn)
				s += DASH + GAP
		var at := label_point(id)
		_paint_name(w, id, plot["short"], shape, at)
		# A small tag standing over the plot with its full name (it turns to the camera; a
		# placeholder, not part of the art). The short name is painted on the pad.
		for line in [[plot["name"] + " · reserved", 0.016, 2.2]]:
			var label := Label3D.new()
			label.name = "Plot %s %s" % [id, line[1]]
			label.text = line[0]
			label.font_size = 64
			label.pixel_size = line[1]
			label.modulate = Color("f7f5ee")
			label.outline_size = 10
			label.outline_modulate = Color("3a3a36")
			label.shaded = true
			label.billboard = BaseMaterial3D.BILLBOARD_FIXED_Y
			label.position = Vector3(at.x, line[2], at.y)
			w.root.add_child(label)

## The plot's name painted flat on its pad in white, as big as fits: along x, or along
## z on a plot much longer that way.
func _paint_name(w: RefCounted, id: String, text: String, shape: PackedVector2Array, at: Vector2) -> void:
	var low := Vector2(INF, INF)
	var high := Vector2(-INF, -INF)
	for p in shape:
		low = Vector2(minf(low.x, p.x), minf(low.y, p.y))
		high = Vector2(maxf(high.x, p.x), maxf(high.y, p.y))
	var size := high - low
	var along_z := size.y > size.x * 1.6
	var long_side := size.y if along_z else size.x
	var short_side := size.x if along_z else size.y
	# Glyphs are about 0.6 of the font size wide; keep inside 75% of the long side and
	# 40% of the short one, and never taller than 4 m.
	var pixel := minf(minf(0.75 * long_side / (text.length() * 0.6 * 64.0), 0.4 * short_side / 64.0), 4.0 / 64.0)
	var label := Label3D.new()
	label.name = "Ground %s" % id
	label.text = text
	label.font_size = 64
	label.pixel_size = pixel
	label.modulate = Color("f4f3ee")
	label.outline_size = 0
	label.shaded = true
	label.double_sided = false
	label.alpha_cut = Label3D.ALPHA_CUT_OPAQUE_PREPASS
	# Lying on the pad, read from the south (the default view) or, along z, from the east.
	var yaw := PI / 2.0 if along_z else 0.0
	label.transform = Transform3D(Basis(Vector3.UP, yaw) * Basis(Vector3.RIGHT, -PI / 2.0), Vector3(at.x, -0.14, at.y))
	w.root.add_child(label)

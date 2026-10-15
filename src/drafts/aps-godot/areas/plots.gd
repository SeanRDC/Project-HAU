extends RefCounted
## Reserved plots for the buildings teammates are making: every building in the
## team's plan (campus_plan.gd) that the Godot scene does not draw yet gets a flat
## pad on its real footprint, a gold border and its name, so the space stays free
## and everyone can see where their building goes. To merge a building: build it in
## areas/<id>.gd on that footprint, then set "built" for it in
## tools/export-godot-plan.mjs (BUILT) and run `npm run export:godot-plan`; the pad
## disappears and blocked() stops treating the plot as reserved.

const CampusPlan := preload("res://campus_plan.gd")

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

func build(w: RefCounted) -> void:
	# Pale trodden ground, so a far plot reads as an empty lot rather than a wall.
	var pad: Material = w.material("dirt", Color("e8e1cb"))
	var border: Material = w.material("plain", Color("c9a24a"))
	var shapes := shapes()
	for id in shapes:
		var shape: PackedVector2Array = shapes[id]
		var plot: Dictionary = CampusPlan.PLOTS[id]
		var triangles := PackedVector2Array()
		var indices := Geometry2D.triangulate_polygon(shape)
		for i in indices:
			triangles.append(shape[i])
		w._ground(triangles, -0.17, pad)
		for i in shape.size():
			var a := shape[i]
			var b := shape[(i + 1) % shape.size()]
			var middle := (a + b) / 2.0
			w.box(Vector3(snappedf(a.distance_to(b) + 0.35, 0.05), 0.06, 0.35), Vector3(middle.x, -0.16, middle.y), border, atan2(-(b - a).y, (b - a).x))
		# A marker standing over the plot (it turns to the camera; it is a placeholder,
		# not part of the art): the short name large, the full name and "reserved" small.
		# A label point off its own plot (the annex's lands inside the gym) moves to the
		# middle of the plot's largest triangle.
		var at: Vector2 = plot["label"]
		if not Geometry2D.is_point_in_polygon(at, shape):
			var largest := 0.0
			for i in range(0, indices.size(), 3):
				var a := shape[indices[i]]
				var b := shape[indices[i + 1]]
				var c := shape[indices[i + 2]]
				var area := absf((b - a).cross(c - a))
				if area > largest:
					largest = area
					at = (a + b + c) / 3.0
		for line in [[plot["short"], 0.04, 3.2], [plot["name"] + " · reserved", 0.014, 2.2]]:
			var label := Label3D.new()
			label.name = "Plot %s %s" % [id, line[1]]
			label.text = line[0]
			label.font_size = 64
			label.pixel_size = line[1]
			label.modulate = Color("8a6a2a")
			label.outline_size = 0
			label.shaded = true
			label.billboard = BaseMaterial3D.BILLBOARD_FIXED_Y
			label.position = Vector3(at.x, line[2], at.y)
			w.root.add_child(label)

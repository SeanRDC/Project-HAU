extends RefCounted
## Rotonda 2, the fountain plaza in front of SFJ (from "FOUNTAIN IN FRONT OF SFJ.png", "SFJ
## BUILDING AND FOUNTAIN.jpg", "SFJ AND FOUNTAIN SIDE VIEW.jpg" and 153048): a round drive on the
## plan's plot, between the road by the Epiphany (west) and the flag circle (east).
##
## From the rim in: a band of mid-grey concrete, white lines either side of it; the pale inner disc
## with a six-point star of white bands across it and dark rings round it, one in each gap between
## the star's points, cut off at the disc's edge; black bollard lights round the disc. In the middle,
## raised in a low kerb, a ring of lawn round the fountain: a dark pool in a rim of grey stone slabs,
## a round stone bowl on a pedestal in the middle and ten jets in a ring round it. Tall lamps stand at
## the rim. An apron of the same concrete joins it to the road by the Epiphany; the flag circle's
## new west flight comes down to it on the other side.

## The middle (the plan's plot), the rim, the inner disc, the lawn and the pool (radii).
const CENTER := Vector2(-196.6, 84.3)
const RIM := 9.6
const DISC := 7.5
const LAWN := 4.3
const POOL := 2.9
## The star's points' radius and its bands' width; the dark rings (their centres' radius, radius).
const STAR := 7.15
const BAND := 0.42
const ARC_AT := 5.6
const ARC_R := 2.25
## Levels: the drive (the roads' level), the lawn's top, the water.
const DRIVE_Y := -0.19
const LAWN_Y := 0.07
const WATER_Y := 0.02
## The apron west to the road by the Epiphany (x from its kerb to the middle, z), and east to the
## flag circle's west flight.
const APRON_W := Rect2(-207.05, 76.0, 10.45, 16.6)
const APRON_E := Rect2(-187.8, 85.6, 3.0, 2.6)
## Bollard lights round the disc (count), the tall lamps at the rim (angles: atan2(z, x)).
const BOLLARDS := 8
const LAMPS: Array[float] = [0.55, 1.9, 2.75, -2.2]
const BUILT_NAME := "Rotonda2"
## Facing north at SFJ from the drive, everything nearer than this (z, past the rim) is cut away.
const CUT_Z := 94.6

static func walkable(x: float, z: float) -> bool:
	var p := Vector2(x, z)
	if p.distance_to(CENTER) <= RIM:
		return true
	return APRON_W.has_point(p) or APRON_E.has_point(p)

static func blocked(x: float, z: float) -> bool:
	if not walkable(x, z):
		return false
	var p := Vector2(x, z)
	var r := p.distance_to(CENTER)
	if r < LAWN + 0.2:
		return true # the lawn and the fountain
	for i in BOLLARDS:
		if p.distance_to(_bollard(i)) < 0.25:
			return true
	return false

static func floor_height(x: float, z: float) -> float:
	return DRIVE_Y if walkable(x, z) else NAN

static func _bollard(i: int) -> Vector2:
	var a := TAU * (i + 0.5) / BOLLARDS
	return CENTER + Vector2(cos(a), sin(a)) * (DISC + 0.05)

## 0..1: how far the drive's north view and its cut apply.
static func view_for(x: float, z: float) -> float:
	var p := Vector2(x, z)
	var round_part := 1.0 - smoothstep(RIM - 0.4, RIM + 0.8, p.distance_to(CENTER))
	var apron := 1.0 if APRON_E.grow(0.4).has_point(p) else 0.0
	return maxf(round_part, apron)

## The line across the ground (z) nearer than which everything is cut away, facing north.
static func cut_z(_x: float, z: float) -> float:
	return maxf(CUT_Z, z + 0.45)

# --- Building ---------------------------------------------------------------------------------

var w: RefCounted

func build(world_builder: RefCounted) -> void:
	w = world_builder
	w._flush()
	var saved: Node3D = w.root
	var grounds := Node3D.new()
	grounds.name = BUILT_NAME
	saved.add_child(grounds)
	w.root = grounds
	_drive()
	_star()
	_rings()
	_bollards()
	_lamps()
	w._flush()
	_fountain()
	w._flush()
	w.root = saved

func _cylinder(radius: float, height: float, at: Vector3, made: Material, segments := 32, top := -1.0) -> MeshInstance3D:
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius if top < 0.0 else top
	mesh.bottom_radius = radius
	mesh.height = height
	mesh.radial_segments = segments
	mesh.rings = 1
	return w._mesh(mesh, at, made)

## A flat ring on the ground from r0 to r1 at y, as a strip of triangles.
func _ground_ring(r0: float, r1: float, y: float, made: Material, steps := 96) -> void:
	var tris := PackedVector2Array()
	for i in steps:
		var a0 := TAU * i / steps
		var a1 := TAU * (i + 1) / steps
		var p0 := CENTER + Vector2(cos(a0), sin(a0)) * r0
		var p1 := CENTER + Vector2(cos(a1), sin(a1)) * r0
		var q0 := CENTER + Vector2(cos(a0), sin(a0)) * r1
		var q1 := CENTER + Vector2(cos(a1), sin(a1)) * r1
		tris.append_array([p0, q0, q1, p0, q1, p1])
	w._ground(tris, y, made)

## A band along the ground from a to b (x, z), `width` wide, its top at y.
func _band(a: Vector2, b: Vector2, width: float, y: float, made: Material) -> void:
	var mid := (a + b) / 2.0
	w.box(Vector3(width, 0.01, a.distance_to(b)), Vector3(mid.x, y - 0.005, mid.y), made, atan2(b.x - a.x, b.y - a.y))

## The drive: a bed of concrete under it all and the aprons; the mid-grey band round the rim and
## the pale inner disc; white lines at the rim and round the disc.
func _drive() -> void:
	var bed: Material = w.material("concrete", Color("a9a69e"))
	_cylinder(RIM + 0.05, 0.3, Vector3(CENTER.x, DRIVE_Y - 0.15, CENTER.y), bed, 64)
	for apron in [APRON_W, APRON_E]:
		var r: Rect2 = apron
		w.box(Vector3(r.size.x, 0.3, r.size.y), Vector3(r.get_center().x, DRIVE_Y - 0.15, r.get_center().y), bed)
	_ground_ring(DISC, RIM, DRIVE_Y + 0.003, w.material("concrete", Color("8f8c86")))
	_ground_ring(LAWN, DISC, DRIVE_Y + 0.003, w.material("concrete", Color("cbc7be")))
	var white: Material = w.material("plain", Color("ebe8e0"))
	_ground_ring(RIM - 0.25, RIM, DRIVE_Y + 0.006, white)
	_ground_ring(DISC - 0.12, DISC + 0.12, DRIVE_Y + 0.006, white)

## The six-point star: two triangles of white bands, their points on the disc's edge, crossing the
## dark rings.
func _star() -> void:
	var white: Material = w.material("plain", Color("f1eee6"))
	for start in [PI / 2.0, -PI / 2.0]:
		var points: Array[Vector2] = []
		for k in 3:
			var a: float = start + TAU * k / 3.0
			points.append(CENTER + Vector2(cos(a), sin(a)) * STAR)
		for k in 3:
			var a: Vector2 = points[k]
			var b: Vector2 = points[(k + 1) % 3]
			# The band stops at the lawn's kerb where it crosses it.
			_band_outside_lawn(a, b, white)

## A star band from a to b, left out where it would cross the lawn.
func _band_outside_lawn(a: Vector2, b: Vector2, made: Material) -> void:
	var steps := 40
	var run_start := -1
	for i in steps + 1:
		var t := float(i) / steps
		var p := a.lerp(b, t)
		var clear := p.distance_to(CENTER) > LAWN + 0.1
		if clear and run_start < 0:
			run_start = i
		if (not clear or i == steps) and run_start >= 0:
			var end := i if clear else i - 1
			if end > run_start:
				_band(a.lerp(b, float(run_start) / steps), a.lerp(b, float(end) / steps), BAND, DRIVE_Y + 0.012, made)
			run_start = -1

## The dark rings, one in each gap between the star's points, drawn as short bands and left out
## past the disc's edge and inside the lawn.
func _rings() -> void:
	var dark: Material = w.material("concrete", Color("6f6c67"))
	for k in 6:
		var gap := TAU * k / 6.0
		var middle := CENTER + Vector2(cos(gap), sin(gap)) * ARC_AT
		var steps := 36
		for i in steps:
			var a0 := TAU * i / steps
			var a1 := TAU * (i + 1) / steps
			var p := middle + Vector2(cos(a0), sin(a0)) * ARC_R
			var q := middle + Vector2(cos(a1), sin(a1)) * ARC_R
			var mid := (p + q) / 2.0
			var r := mid.distance_to(CENTER)
			if r < DISC - 0.2 and r > LAWN + 0.15:
				_band(p, q, 0.32, DRIVE_Y + 0.009, dark)

## Black bollard lights round the disc's edge, lit at night.
func _bollards() -> void:
	var black: Material = w.material("plain", Color("1e1f20"))
	for i in BOLLARDS:
		var at := _bollard(i)
		_cylinder(0.1, 0.7, Vector3(at.x, DRIVE_Y + 0.35, at.y), black, 10)
		_cylinder(0.105, 0.08, Vector3(at.x, DRIVE_Y + 0.62, at.y), w.glow(Color("fff1d6"), 0.0, 2.2), 10)

## Tall black lamps at the rim, a lantern on a curved arm over the drive, lit at night.
func _lamps() -> void:
	var black := Color("23262a")
	for a in LAMPS:
		var foot2 := CENTER + Vector2(cos(a), sin(a)) * (RIM + 0.35)
		var foot := Vector3(foot2.x, DRIVE_Y, foot2.y)
		var inward := Vector3(-cos(a), 0, -sin(a))
		w.box(Vector3(0.3, 0.4, 0.3), foot + Vector3(0, 0.2, 0), w.material("plain", black))
		var top := foot + Vector3(0, 4.6, 0)
		w.rod(foot, top, 0.07, black)
		w.rod(top, top + inward * 0.4 + Vector3(0, 0.35, 0), 0.05, black)
		w.rod(top + inward * 0.4 + Vector3(0, 0.35, 0), top + inward * 0.85 + Vector3(0, 0.2, 0), 0.045, black)
		var head := top + inward * 0.85 + Vector3(0, 0.02, 0)
		_cylinder(0.2, 0.22, head, w.material("plain", black), 12, 0.08)
		w.box(Vector3(0.3, 0.04, 0.3), head + Vector3(0, -0.12, 0), w.glow(Color("fff0d2"), 0.1, 3.0))
		var light := SpotLight3D.new()
		light.light_color = Color("ffd194")
		light.light_energy = 4.0
		light.spot_range = 10.0
		light.spot_angle = 60.0
		light.spot_attenuation = 0.8
		light.rotation = Vector3(-PI / 2.0, 0, 0)
		w._lamp(light, head + Vector3(0, -0.15, 0))

## The fountain: the lawn ring in its low kerb, the pool in its rim of grey stone slabs, the dark
## water, the round bowl on its pedestal in the middle (water in it, a little spout), the ten jets
## in a ring round it and their splashes.
func _fountain() -> void:
	var kerb: Material = w.material("concrete", Color("c3beb3"))
	_cylinder(LAWN, LAWN_Y - DRIVE_Y, Vector3(CENTER.x, (LAWN_Y + DRIVE_Y) / 2.0, CENTER.y), kerb, 64)
	_ground_ring(POOL + 0.05, LAWN - 0.12, LAWN_Y + 0.004, w.material("lawn", Color("6f8a4b")))
	var slab: Material = w.material("concrete", Color("9ea4a4"))
	var joint: Material = w.material("plain", Color("4b5152"))
	var slabs := 18
	for i in slabs:
		var a := TAU * (i + 0.5) / slabs
		var mid := CENTER + Vector2(cos(a), sin(a)) * (POOL - 0.28)
		var length := TAU * (POOL - 0.28) / slabs - 0.05
		w.box(Vector3(0.62, 0.1, length), Vector3(mid.x, LAWN_Y + 0.04, mid.y), slab, -a)
		var cut := CENTER + Vector2(cos(a + PI / slabs), sin(a + PI / slabs)) * (POOL - 0.28)
		w.box(Vector3(0.64, 0.105, 0.03), Vector3(cut.x, LAWN_Y + 0.04, cut.y), joint, -(a + PI / slabs))
	var water: Material = w.glow(Color("2f5a5c"), 0.08, 0.35)
	_cylinder(POOL - 0.55, 0.04, Vector3(CENTER.x, WATER_Y, CENTER.y), water, 48)
	# The bowl on its pedestal, water in it.
	var stone: Material = w.material("concrete", Color("b8bcbb"))
	var at := Vector3(CENTER.x, WATER_Y, CENTER.y)
	_cylinder(0.3, 0.3, at + Vector3(0, 0.15, 0), stone, 20)
	_cylinder(0.42, 0.2, at + Vector3(0, 0.38, 0), stone, 24, 0.62)
	_cylinder(0.64, 0.08, at + Vector3(0, 0.52, 0), stone, 28)
	_cylinder(0.54, 0.03, at + Vector3(0, 0.55, 0), water, 28)
	var spray: Material = w.glow(Color("e6f2f4"), 0.35, 0.9)
	_cylinder(0.05, 0.35, at + Vector3(0, 0.72, 0), spray, 8, 0.02)
	# The jets (the photo of the pool): narrow at the nozzle, foaming wider as they rise, a frothy
	# crown at the top; at the foot the water churned white. A little see-through, like spray.
	for i in 10:
		var a := TAU * i / 10.0 + 0.2
		var foot2 := CENTER + Vector2(cos(a), sin(a)) * 1.5
		var foot := Vector3(foot2.x, WATER_Y, foot2.y)
		var high := 1.25 + 0.35 * float(i % 2)
		var column := _cylinder(0.045, high, foot + Vector3(0, high / 2.0, 0), spray, 8, 0.11)
		column.name = "Jet%d" % i # named, so merge_static keeps it apart and see-through
		column.transparency = 0.2
		column.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		var crown := SphereMesh.new()
		crown.radius = 0.14
		crown.height = 0.24
		crown.radial_segments = 10
		crown.rings = 5
		var top: MeshInstance3D = w._mesh(crown, foot + Vector3(0, high + 0.02, 0), spray)
		top.name = "JetCrown%d" % i
		top.transparency = 0.3
		top.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		var churn := _cylinder(0.26, 0.08, foot + Vector3(0, 0.04, 0), w.glow(Color("d6e8ea"), 0.25, 0.6), 12, 0.16)
		churn.name = "JetChurn%d" % i
		churn.transparency = 0.25

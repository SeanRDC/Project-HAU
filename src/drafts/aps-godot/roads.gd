extends RefCounted
## The campus loop road round the chapel lawn, from the team's plan
## (campus_plan.gd): along the APS front, round the patio bend, past the canteen
## wing's tip, down beside the Covered Court and the Formation Center, along St.
## Joseph Hall and back up past PGN. Straights and turns, in the order a car
## drives it: the lawn is always on its right, the buildings on its left.
##
## Everything that asks "where is the road" asks across(): the floor heights,
## collision, the grass and the camera. To change the road, change PIECES; the
## surface, kerbs, sidewalks and paint follow.

## Half the carriageway (the kerbs' faces are 3.5 m from the centre line).
const HALF := 3.5
## The centre line: ["line", from, to] or ["arc", centre, radius, from°, to°]
## (angles in the ground plane, 0° = +x, 90° = +z). "walk" says whether its left
## side has a sidewalk.
const PIECES := [
	{"part": ["line", Vector2(-58.5, 102.0), Vector2(-58.5, 21.5)], "walk": true}, # west road, past PGN
	{"part": ["arc", Vector2(-44.5, 21.5), 14.0, 180.0, 270.0], "walk": false}, # round the garden corner
	{"part": ["line", Vector2(-44.5, 7.5), Vector2(8.5, 7.5)], "walk": false}, # the APS front (its own wide sidewalk)
	{"part": ["arc", Vector2(8.5, 20.5), 13.0, 270.0, 360.0], "walk": true}, # the patio bend
	{"part": ["line", Vector2(21.5, 20.5), Vector2(21.5, 22.5)], "walk": true},
	{"part": ["arc", Vector2(29.5, 22.5), 8.0, 180.0, 90.0], "walk": true}, # round the canteen's tip
	{"part": ["line", Vector2(29.5, 30.5), Vector2(34.5, 30.5)], "walk": true},
	{"part": ["arc", Vector2(34.5, 36.5), 6.0, 270.0, 360.0], "walk": true},
	{"part": ["line", Vector2(40.5, 36.5), Vector2(40.5, 102.0)], "walk": true}, # east road, by the Covered Court
	{"part": ["arc", Vector2(32.5, 102.0), 8.0, 0.0, 90.0], "walk": true},
	{"part": ["line", Vector2(32.5, 110.0), Vector2(-50.5, 110.0)], "walk": true}, # south road, along SJH
	{"part": ["arc", Vector2(-50.5, 102.0), 8.0, 90.0, 180.0], "walk": true},
]

## Where the building-side sidewalk and kerb stop for a side road (world x/z rects):
## the middle road's mouth on the west road (areas/middle_road.gd).
const OPENINGS: Array[Rect2] = [Rect2(-64.0, 58.0, 3.0, 11.0)]

static var _points := PackedVector2Array()
static var _left := PackedVector2Array()
static var _walk := PackedByteArray()

## The centre line resampled about a metre apart, closed (the last point is the first).
static func points() -> PackedVector2Array:
	if _points.is_empty():
		_sample()
	return _points

## The unit normal pointing to the road's left (the building side) at each point.
static func lefts() -> PackedVector2Array:
	if _points.is_empty():
		_sample()
	return _left

## 1 where the segment from this point to the next has a sidewalk on its left.
static func walks() -> PackedByteArray:
	if _points.is_empty():
		_sample()
	return _walk

static func _sample() -> void:
	for piece in PIECES:
		var part: Array = piece["part"]
		var run := PackedVector2Array()
		if part[0] == "line":
			var a: Vector2 = part[1]
			var b: Vector2 = part[2]
			var steps := maxi(1, ceili(a.distance_to(b)))
			for i in steps:
				run.append(a.lerp(b, float(i) / steps))
		else:
			var centre: Vector2 = part[1]
			var radius: float = part[2]
			var from := deg_to_rad(part[3])
			var to := deg_to_rad(part[4])
			var steps := maxi(4, ceili(absf(to - from) * radius))
			for i in steps:
				var a := lerpf(from, to, float(i) / steps)
				run.append(centre + Vector2(cos(a), sin(a)) * radius)
		for p in run:
			_points.append(p)
			_walk.append(1 if piece["walk"] else 0)
	_points.append(_points[0])
	_walk.append(_walk[0])
	var count := _points.size()
	for i in count:
		var before := _points[(i - 1 + count - 1) % (count - 1)] if i == 0 else _points[i - 1]
		var after := _points[1] if i == count - 1 else _points[i + 1]
		var direction := (after - before).normalized()
		_left.append(Vector2(direction.y, -direction.x))

## True where a side road opens the sidewalk and kerb (see OPENINGS).
static func opened(at: Vector2) -> bool:
	for rect in OPENINGS:
		if rect.has_point(at):
			return true
	return false

## Distance across the road, as on the straight APS frontage: under 4 is the left
## (building) side, 4..11 the carriageway between its kerbs, over 11 the lawn.
static func across(x: float, z: float) -> float:
	var at := Vector2(x, z)
	var road := points()
	var best := INF
	var side := 0.0
	for i in road.size() - 1:
		var a := road[i]
		var b := road[i + 1]
		var ab := b - a
		var t := clampf((at - a).dot(ab) / ab.length_squared(), 0.0, 1.0)
		var d := at.distance_squared_to(a + ab * t)
		if d < best:
			best = d
			var left := Vector2(ab.y, -ab.x).normalized()
			side = (at - (a + ab * t)).dot(left)
	return 7.5 - side

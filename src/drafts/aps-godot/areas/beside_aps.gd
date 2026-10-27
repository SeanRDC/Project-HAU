extends RefCounted
## Beside APS, from Sean's photos (assets/Fix beside aps/) and his outline on the satellite
## picture (fix-outline.png): the ground between the canteen wing's east wall and the
## Covered Court. North of the canteen's tip a paved lane runs up to Sacred Heart; south
## of it, past the tip, a parking lane runs down the court's west side to the gym's lane.
## No cars are parked in the game.
##
## World coordinates (metres, Y up), like the court; the wing's east wall is at x 43.45
## (world.gd's canteen frame), the court's columns start at x 53 (areas/court.gd).

const Roads := preload("res://roads.gd")

## The paved lane north of the canteen's tip, along the wing's east wall (the part
## inside Sacred Heart's plot is the plot's), and its height.
const LANE := Rect2(43.45, 0.4, 9.15, 23.1)
const LANE_Y := -0.05
## Sacred Heart's plot's south-west corner (campus_plan.gd "sh"): the lane is drawn round it.
const SH_CORNER := Vector2(51.2, 16.8)
## The parking lane down the court's west side, at the road's height, into the gym's apron.
const PARKING := Rect2(48.8, 23.5, 3.8, 33.7)
const PARKING_Y := -0.185

static func walkable(x: float, z: float) -> bool:
	var at := Vector2(x, z)
	return LANE.has_point(at) or PARKING.has_point(at)

static func blocked(_x: float, _z: float) -> bool:
	return false

## The lane's or the parking lane's height, or NAN.
static func floor_height(x: float, z: float) -> float:
	var at := Vector2(x, z)
	if LANE.has_point(at):
		return LANE_Y
	if PARKING.has_point(at):
		return PARKING_Y
	return NAN

var w: RefCounted

func build(world: RefCounted) -> void:
	w = world
	_lanes()

## The concrete of the lane (round Sacred Heart's corner) and of the parking lane, with a
## low kerb where the lane steps down to it.
func _lanes() -> void:
	var slab: Material = w.material("concrete", Color("b0afa7"))
	var top := LANE_Y
	for area in [Rect2(LANE.position.x, LANE.position.y, SH_CORNER.x - LANE.position.x, LANE.size.y),
			Rect2(SH_CORNER.x, SH_CORNER.y, LANE.end.x - SH_CORNER.x, LANE.end.y - SH_CORNER.y)]:
		var r: Rect2 = area
		w.box(Vector3(r.size.x, 0.2, r.size.y), Vector3(r.get_center().x, top - 0.1, r.get_center().y), slab)
	var low: Material = w.material("concrete", Color("a6a59d"))
	var reach := 38.0 - PARKING.position.y # the gym's apron takes over from z 38
	w.box(Vector3(PARKING.size.x, 0.02, reach), Vector3(PARKING.get_center().x, PARKING_Y - 0.01, PARKING.position.y + reach / 2.0), low)
	w.box(Vector3(PARKING.size.x, 0.16, 0.2), Vector3(PARKING.get_center().x, LANE_Y - 0.06, LANE.end.y + 0.1), w.material("concrete", Color("b5b3aa")))

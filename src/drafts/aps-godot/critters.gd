extends Node3D
## Ambient life: the campus cats and the maya birds. Their sheets are PixelLab frames made
## from Mikko's references and cleaned in pxl (assets/drafts/characters/critters/pxl/),
## side-on, at the characters' density, edged in a darker tone of their own colour like the
## cast, and lit and shadowed like them.
##
## Cats: a dozen strays with names: five at their own spots, the rest scattered over the
## campus's open ground. They sit (now and then flicking the tail, blinking, grooming a paw or
## yawning), stroll, and curl up asleep, breathing (more at noon, at night and in the rain),
## and wake with a stretch. Stand still near one and it may come over; press E beside it to
## pet it (eyes closed, it leans into the hand and purrs). Run at one and it gallops off.
## Birds: flocks of maya (tree sparrows) hopping and pecking on the open ground by day.
## Come close, or run, and the whole flock flutters up and away; it lands again a while
## later. More flocks are scattered over the open ground, and small groups fly over the
## campus now and then. They are gone at night and in the rain.

const World := preload("res://world.gd")
const Npc := preload("res://npc.gd")
const Npcs := preload("res://npcs.gd")
const Opening := preload("res://opening.gd")

## Metres per sprite pixel: the characters' (85 px for 1.83 m).
const DENSITY := 1.83 / 85.0
## How close the student must be to pet a cat.
const PET_REACH := 1.3
## Birds take off when the student comes this close (further when running).
const SCARE := 2.4
const SCARE_RUNNING := 4.5

## name, home (world x, z), coat
const CATS := [
	{"name": "Mingming", "home": Vector2(-6.0, 6.2), "coat": "orange"},
	{"name": "Kiko", "home": Vector2(33.0, 13.0), "coat": "tuxedo"},
	{"name": "Tisay", "home": Vector2(-31.0, 57.0), "coat": "grey"},
	{"name": "Itim", "home": Vector2(-24.0, 118.5), "coat": "black"},
	{"name": "Puti", "home": Vector2(-118.0, 83.0), "coat": "white"},
]
## Where flocks feed (world x, z) and how many birds each.
const FLOCKS := [
	[Vector2(12.0, 7.0), 6], [Vector2(24.0, 11.5), 5], [Vector2(-36.0, 52.5), 8],
	[Vector2(-84.0, 70.5), 6], [Vector2(-150.0, 63.0), 6], [Vector2(-20.0, 108.0), 7],
	[Vector2(52.0, 92.0), 5], [Vector2(-95.0, 56.0), 6],
]

## More cats, scattered over the open ground (the coat cycles); and how many more flocks.
const MORE_CATS := ["Muning", "Tagpi", "Bantot", "Kulot", "Mimi", "Garfield", "Sinta"]
const MORE_FLOCKS := 14
## Scattered spots keep this far (m) from each other and from the fixed ones.
const CAT_SPACING := 22.0
const FLOCK_SPACING := 14.0
## Birds flying over: a group every FLY_EVERY seconds (random within), at most FLYERS at once.
const FLY_EVERY := Vector2(3.0, 8.0)
const FLYERS := 4

var camera: Camera3D
var student: Node3D
var sound: Node
var to_screen: Callable
## Set by the scene each frame.
var hour := 16.5
var rain := 0.0
var cats: Array[Dictionary] = []
var flocks: Array[Dictionary] = []
## Groups flying over now: {birds: [{node, sprite, offset}], at, dir, height, travelled, phase}.
var flyers: Array[Dictionary] = []
var _next_flyers := 1.0
## Times a cat has been petted and a flock has taken off, for the checks.
var pets := 0
var takeoffs := 0
var _rng := RandomNumberGenerator.new()
var _hint := PanelContainer.new()
var _hint_label := Label.new()
var _bubble := PanelContainer.new()
var _bubble_label := Label.new()
var _bubble_cat: Dictionary = {}
var _bubble_age := 0.0
var _time := 0.0

func _ready() -> void:
	name = "Critters"
	_rng.seed = 7171
	for data in CATS:
		_add_cat(data)
	for data in FLOCKS:
		_add_flock(data[0], data[1])
	# the rest scattered over the open ground, apart from each other and the fixed spots
	var open := _open_ground()
	var taken: Array[Vector2] = []
	for data in CATS:
		taken.append(data.home)
	var coats := ["orange", "tuxedo", "grey", "black", "white"]
	for i in MORE_CATS.size():
		var spot := _pick(open, taken, CAT_SPACING)
		if spot != Vector2.INF:
			_add_cat({"name": MORE_CATS[i], "home": spot, "coat": coats[(i + 1) % coats.size()]})
	taken.clear()
	for data in FLOCKS:
		taken.append(data[0])
	for i in MORE_FLOCKS:
		var spot := _pick(open, taken, FLOCK_SPACING)
		if spot != Vector2.INF:
			_add_flock(spot, _rng.randi_range(3, 6))

## Open ground on a 4 m grid over the campus: walkable, at ground level, off the roads.
static func _open_ground() -> Array[Vector2]:
	var spots: Array[Vector2] = []
	for gx in range(-170, 92, 4):
		for gz in range(-2, 136, 4):
			var x := float(gx)
			var z := float(gz)
			if World.blocked(x, z) or World.floor_height(x, z) > 0.2:
				continue
			var across := World.across_road(x, z)
			if across > 3.5 and across < 11.5:
				continue # the carriageway and its kerbs
			spots.append(Vector2(x, z))
	return spots

## A random open spot at least `spacing` from every taken one (and taken with it), or INF.
func _pick(open: Array[Vector2], taken: Array[Vector2], spacing: float) -> Vector2:
	for attempt in 40:
		var spot: Vector2 = open[_rng.randi_range(0, open.size() - 1)]
		if taken.all(func(t: Vector2) -> bool: return t.distance_to(spot) >= spacing):
			taken.append(spot)
			return spot
	return Vector2.INF

# --- Sheets -----------------------------------------------------------------------

## The sheets come from pxl (assets/drafts/characters/critters/pxl/, built by its build.ps1):
## PixelLab frames, cleaned and on one palette per animal; the cats' coats are palette swaps.
## Frames per sheet, side by side.
const FRAMES := {"walk": 8, "sit": 1, "sleep": 1, "tail": 7, "blink": 4, "groom": 9, "yawn": 7, "petted": 5,
	"breathe": 6, "stretch": 12, "gallop": 5, "ground": 2, "hop": 3, "fly": 4}
## Frames a second of the cats' animations.
const FPS := {"tail": 8.0, "blink": 8.0, "groom": 6.0, "yawn": 6.0, "petted": 4.0, "breathe": 3.0, "stretch": 6.0}
## While it sits, a cat now and then flicks its tail, blinks, grooms a paw or yawns
## (each played once): the chances, and the seconds between.
const FIDGETS := {"tail": 0.35, "blink": 0.35, "groom": 0.15, "yawn": 0.15}
const FIDGET_EVERY := Vector2(2.5, 6.0)

static func _load(name: String, frames: int) -> Array:
	return [load("res://sprites/critters/%s.png" % name), frames]

static func _cat_sheets(coat: String) -> Dictionary:
	var sheets := {}
	for pose in ["walk", "gallop", "sit", "sleep", "tail", "blink", "groom", "yawn", "petted", "breathe", "stretch"]:
		sheets[pose] = _load("cat_%s_%s" % [pose, coat], FRAMES[pose])
	return sheets

static var _bird_sheets: Dictionary = {}
static func _birds() -> Dictionary:
	if _bird_sheets.is_empty():
		_bird_sheets = {"ground": _load("maya_ground", FRAMES.ground), "hop": _load("maya_hop", FRAMES.hop),
			"fly": _load("maya_fly", FRAMES.fly)}
	return _bird_sheets

static func _sprite(texture: Texture2D, frames: int) -> Sprite3D:
	var sprite := Sprite3D.new()
	sprite.shaded = true
	sprite.double_sided = true
	sprite.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	sprite.alpha_scissor_threshold = 0.35
	sprite.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS
	sprite.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED
	sprite.pixel_size = DENSITY
	sprite.texture = texture
	sprite.hframes = frames
	return sprite

static func _show(sprite: Sprite3D, sheet: Array, frame: int) -> void:
	if sprite.texture != sheet[0]:
		sprite.texture = sheet[0]
		sprite.hframes = sheet[1]
	sprite.frame = posmod(frame, sheet[1])
	sprite.position.y = sprite.texture.get_height() * DENSITY * 0.5

# --- Cats -------------------------------------------------------------------------

func _add_cat(data: Dictionary) -> void:
	var sheets := _cat_sheets(data.coat)
	var sprite := _sprite(sheets.sit[0], sheets.sit[1])
	sprite.name = "Cat_" + data.name
	var body := Node3D.new()
	body.name = "Cat_" + data.name
	body.add_child(sprite)
	add_child(body)
	var home := Npcs.free_spot(data.home)
	var cat := {"name": data.name, "node": body, "sprite": sprite, "sheets": sheets, "home": home, "at": home,
		"state": "sit", "timer": _rng.randf_range(2.0, 6.0), "target": home, "facing": 1.0, "phase": 0.0, "walked": 0.0,
		"fidget": "", "fidget_t": 0.0, "next_fidget": _rng.randf_range(FIDGET_EVERY.x, FIDGET_EVERY.y), "fidgets": 0}
	_place(body, home, 0.0)
	cats.append(cat)

func _update_cat(cat: Dictionary, delta: float, at: Vector2, still: bool, running: bool, right: Vector2) -> void:
	var toward: Vector2 = at - cat.at
	var near := toward.length()
	cat.timer -= delta
	cat.phase += delta
	var sleepy := 0.6 if (hour >= 18.0 or hour < 6.0 or (hour >= 11.0 and hour < 14.0) or rain > 0.35) else 0.2
	if running and near < 2.2 and cat.state != "dash":
		# startled: dash away from the student
		cat.state = "dash"
		cat.timer = 1.4
		cat.target = _clear_spot(cat.at, cat.at - toward.normalized() * 3.5)
	# seconds in this state; a fidget stops when the cat does something else
	if cat.state != cat.get("was", ""):
		cat.was = cat.state
		cat.t = 0.0
		cat.fidget = ""
	cat.t += delta
	match cat.state:
		"petted":
			# eyes closed, the head lifting into the hand and back
			_show(cat.sprite, cat.sheets.petted, 1 + int(cat.t * FPS.petted) % 4)
			if cat.timer <= 0.0:
				cat.state = "sit"
				cat.timer = _rng.randf_range(2.0, 5.0)
		"sleep":
			_show(cat.sprite, cat.sheets.breathe, int(cat.t * FPS.breathe))
			if cat.timer <= 0.0:
				cat.state = "stretch" # it wakes with a stretch, then strolls off
		"stretch":
			var frame := int(cat.t * FPS.stretch)
			_show(cat.sprite, cat.sheets.stretch, mini(frame, FRAMES.stretch - 1))
			if frame >= FRAMES.stretch:
				cat.state = "walk"
				cat.target = _clear_spot(cat.at, cat.home + Vector2(_rng.randf_range(-5.0, 5.0), _rng.randf_range(-3.0, 3.0)))
		"sit":
			_sit(cat, delta)
			if near < 6.0 and absf(toward.dot(right)) > 0.05:
				cat.facing = signf(toward.dot(right))
			if still and near < 4.5 and near > 1.0 and _rng.randf() < delta * 0.25:
				cat.state = "come" # curious: it walks over to a student standing still
			elif cat.timer <= 0.0:
				if _rng.randf() < sleepy:
					cat.state = "sleep"
					cat.timer = _rng.randf_range(8.0, 20.0)
				else:
					cat.state = "walk"
					cat.target = _clear_spot(cat.at, cat.home + Vector2(_rng.randf_range(-5.0, 5.0), _rng.randf_range(-3.0, 3.0)))
		"come":
			cat.target = cat.at + toward - toward.normalized() * 0.7
			if not still or near < 0.8 or near > 6.0:
				cat.state = "sit"
				cat.timer = _rng.randf_range(4.0, 8.0)
				if near < 1.2 and sound != null:
					sound.meow()
					_say(cat, "Meow!")
			else:
				_walk(cat, delta, 0.9, right)
		"walk", "dash":
			if _walk(cat, delta, 2.6 if cat.state == "dash" else 0.6, right) or cat.timer < -12.0:
				cat.state = "sit"
				cat.timer = _rng.randf_range(3.0, 8.0)

## Sitting: still, with now and then a tail flick, a blink, a groom or a yawn, played once.
func _sit(cat: Dictionary, delta: float) -> void:
	if cat.fidget != "":
		cat.fidget_t += delta
		var frame := int(cat.fidget_t * FPS[cat.fidget])
		if frame < FRAMES[cat.fidget]:
			_show(cat.sprite, cat.sheets[cat.fidget], frame)
			return
		cat.fidget = ""
		cat.next_fidget = _rng.randf_range(FIDGET_EVERY.x, FIDGET_EVERY.y)
	_show(cat.sprite, cat.sheets.sit, 0)
	cat.next_fidget -= delta
	if cat.next_fidget <= 0.0:
		var roll := _rng.randf()
		for fidget in FIDGETS:
			roll -= FIDGETS[fidget]
			if roll <= 0.0 or fidget == FIDGETS.keys()[-1]:
				cat.fidget = fidget
				break
		cat.fidget_t = 0.0
		cat.fidgets += 1

## Steps the cat towards its target; true once it has arrived (or is stuck).
func _walk(cat: Dictionary, delta: float, speed: float, right: Vector2) -> bool:
	var to: Vector2 = cat.target - cat.at
	if to.length() < 0.06:
		return true
	var step := to.limit_length(speed * delta)
	var next: Vector2 = cat.at + step
	if World.blocked(next.x, next.y) or absf(World.floor_height(next.x, next.y) - World.floor_height(cat.at.x, cat.at.y)) > 0.2:
		return true
	cat.at = next
	cat.walked += step.length()
	if absf(step.dot(right)) > 0.0001:
		cat.facing = signf(step.dot(right))
	# dashing off it gallops, a longer stride per frame
	if cat.state == "dash":
		_show(cat.sprite, cat.sheets.gallop, int(cat.walked / 0.2))
	else:
		_show(cat.sprite, cat.sheets.walk, int(cat.walked / 0.09))
	_place(cat.node, cat.at, 0.0)
	return false

## The furthest spot towards `wish` reachable in a straight line.
static func _clear_spot(from: Vector2, wish: Vector2) -> Vector2:
	var best := from
	for i in range(1, 13):
		var spot := from.lerp(wish, i / 12.0)
		if World.blocked(spot.x, spot.y) or absf(World.floor_height(spot.x, spot.y) - World.floor_height(best.x, best.y)) > 0.2:
			break
		best = spot
	return best

func cat_in_reach() -> Dictionary:
	for cat in cats:
		if (cat.at as Vector2).distance_to(Vector2(student.position.x, student.position.z)) < PET_REACH:
			return cat
	return {}

## E beside a cat: it sits for a pet and purrs. False when no cat is near.
func pet() -> bool:
	var cat := cat_in_reach()
	if cat.is_empty():
		return false
	cat.state = "petted"
	cat.timer = 2.2
	pets += 1
	if sound != null:
		sound.purr()
	_say(cat, "Prrr...")
	return true

# --- Birds ------------------------------------------------------------------------

func _add_flock(spot: Vector2, count: int) -> void:
	var flock := {"spot": Npcs.free_spot(spot), "birds": [], "state": "feeding", "timer": 0.0}
	for i in count:
		var sprite := _sprite(_birds().ground[0], _birds().ground[1])
		var node := Node3D.new()
		node.name = "Bird"
		node.add_child(sprite)
		add_child(node)
		var at: Vector2 = flock.spot + Vector2(_rng.randf_range(-1.6, 1.6), _rng.randf_range(-1.0, 1.0))
		at = _clear_spot(flock.spot, at)
		var bird := {"node": node, "sprite": sprite, "at": at, "y": 0.0, "hop": 0.0, "from": at, "to": at,
			"timer": _rng.randf_range(0.2, 2.0), "peck": 0.0, "vel": Vector3.ZERO, "facing": 1.0}
		_place(node, at, 0.0)
		flock.birds.append(bird)
	flocks.append(flock)

func _update_flock(flock: Dictionary, delta: float, at: Vector2, running: bool, right: Vector2) -> void:
	var day := hour >= 6.0 and hour < 18.0 and rain < 0.35
	match flock.state:
		"feeding":
			var scared := not day
			for bird in flock.birds:
				if (bird.at as Vector2).distance_to(at) < (SCARE_RUNNING if running else SCARE):
					scared = true
			if scared:
				_take_off(flock, at)
				return
			for bird in flock.birds:
				_feed(bird, delta, flock.spot, right)
		"flying":
			# up, across and towards the camera (the open side of every view), until each is
			# off the screen; only then gone
			flock.timer += delta
			var all_gone := true
			for bird in flock.birds:
				var node: Node3D = bird.node
				if not node.visible:
					continue
				bird.vel.y += delta * 0.8
				node.position += bird.vel * delta
				_show(bird.sprite, _birds().fly, int(flock.timer * 14.0 + bird.peck * 7.0))
				bird.sprite.flip_h = bird.facing < 0.0
				if flock.timer > 0.5 and not camera.is_position_in_frustum(node.position + Vector3(0, 0.3, 0)):
					node.visible = false
				else:
					all_gone = false
			if all_gone or flock.timer > 14.0:
				flock.state = "away"
				flock.timer = _rng.randf_range(10.0, 20.0)
				for bird in flock.birds:
					bird.node.visible = false
		"away":
			flock.timer -= delta
			if flock.timer <= 0.0 and day and (flock.spot as Vector2).distance_to(at) > 7.0:
				_land(flock, right)
		"landing":
			# gliding in from off the screen to their spots, then feeding
			flock.timer += delta
			var t := clampf(flock.timer / 2.4, 0.0, 1.0)
			var ease := 1.0 - (1.0 - t) * (1.0 - t)
			for bird in flock.birds:
				var ground := Vector3(bird.at.x, World.floor_height(bird.at.x, bird.at.y) + 0.015, bird.at.y)
				(bird.node as Node3D).position = (bird.from3 as Vector3).lerp(ground, ease)
				_show(bird.sprite, _birds().fly, int(flock.timer * 14.0 + bird.peck * 7.0))
				bird.sprite.flip_h = bird.facing < 0.0
			if t >= 1.0:
				flock.state = "feeding"
				for bird in flock.birds:
					bird.to = bird.at
					bird.hop = 1.0
					_place(bird.node, bird.at, 0.0)

## The camera's flat directions: across the screen, and from the view towards the camera.
func _screen() -> Array:
	var b := camera.global_transform.basis
	return [Vector2(b.x.x, b.x.z).normalized(), Vector2(b.z.x, b.z.z).normalized()]

func _take_off(flock: Dictionary, from: Vector2) -> void:
	flock.state = "flying"
	flock.timer = 0.0
	takeoffs += 1
	var near := false
	var dirs := _screen()
	var across: Vector2 = dirs[0]
	var toward: Vector2 = dirs[1]
	# the whole flock goes the same way across the screen, away from the student
	var side := signf((flock.spot - from).dot(across))
	if side == 0.0:
		side = 1.0
	for bird in flock.birds:
		var away: Vector2 = (across * side * _rng.randf_range(3.5, 5.0) + toward * _rng.randf_range(1.0, 2.5)).rotated(_rng.randf_range(-0.15, 0.15))
		bird.vel = Vector3(away.x, _rng.randf_range(2.6, 3.6), away.y)
		bird.facing = side
		bird.peck = _rng.randf()
		near = near or (bird.at as Vector2).distance_to(from) < 8.0
	if near and sound != null:
		sound.flutter()

## Back to the spot: each bird starts off the screen, up and to one side, and glides down.
func _land(flock: Dictionary, right: Vector2) -> void:
	flock.state = "landing"
	flock.timer = 0.0
	var dirs := _screen()
	var side := 1.0 if _rng.randf() < 0.5 else -1.0
	for bird in flock.birds:
		var node: Node3D = bird.node
		bird.at = _clear_spot(flock.spot, flock.spot + Vector2(_rng.randf_range(-1.6, 1.6), _rng.randf_range(-1.0, 1.0)))
		var ground := Vector3(bird.at.x, World.floor_height(bird.at.x, bird.at.y), bird.at.y)
		var out := Vector3((dirs[0] as Vector2).x * side, 0.45, (dirs[0] as Vector2).y * side).normalized()
		bird.from3 = _off_screen(ground + Vector3(0, 1.0, 0), out)
		bird.facing = -side
		node.position = bird.from3
		node.visible = true

## The first point along `dir` from `from` that the camera does not see (searching to 250 m).
func _off_screen(from: Vector3, dir: Vector3) -> Vector3:
	var d := 4.0
	while d < 250.0 and camera.is_position_in_frustum(from + dir * d):
		d += 4.0
	return from + dir * (d + 4.0)

## A feeding bird: pecks, now and then hops a little way (its own frames), a small arc off the ground.
func _feed(bird: Dictionary, delta: float, spot: Vector2, right: Vector2) -> void:
	bird.timer -= delta
	if bird.hop < 1.0:
		bird.hop = minf(1.0, bird.hop + delta * 5.0)
		bird.at = (bird.from as Vector2).lerp(bird.to, bird.hop)
		# crouch, legs tucked, landing (the frames lift the bird a little themselves)
		_place(bird.node, bird.at, sin(PI * bird.hop) * 0.06)
		_show(bird.sprite, _birds().hop, mini(int(bird.hop * FRAMES.hop), FRAMES.hop - 1))
	else:
		bird.peck -= delta
		_show(bird.sprite, _birds().ground, 1 if bird.peck > 0.0 else 0)
		if bird.timer <= 0.0:
			bird.timer = _rng.randf_range(0.4, 2.2)
			if _rng.randf() < 0.45:
				bird.peck = 0.25
			else:
				var wish: Vector2 = bird.at + Vector2(_rng.randf_range(-0.5, 0.5), _rng.randf_range(-0.4, 0.4))
				if wish.distance_to(spot) > 2.5:
					wish = bird.at.lerp(spot, 0.3)
				bird.from = bird.at
				bird.to = _clear_spot(bird.at, wish)
				bird.hop = 0.0
				if absf((bird.to - bird.from).dot(right)) > 0.001:
					bird.facing = signf((bird.to - bird.from).dot(right))
	bird.sprite.flip_h = bird.facing < 0.0

# --- Birds flying over ---------------------------------------------------------------

## By day, now and then a little group of maya flies over: in from one side of the view,
## across above the student at 5-14 m, out the other side, wings beating, bobbing a little.
func _update_flyers(delta: float, at: Vector2, right: Vector2) -> void:
	var day := hour >= 6.0 and hour < 18.0 and rain < 0.35
	_next_flyers -= delta
	if day and _next_flyers <= 0.0 and flyers.size() < FLYERS:
		_next_flyers = _rng.randf_range(FLY_EVERY.x, FLY_EVERY.y)
		_launch(at, right)
	for group in flyers.duplicate():
		group.travelled += group.speed * delta
		group.phase += delta
		var centre: Vector2 = group.start + group.dir * group.travelled
		for bird in group.birds:
			var offset: Vector2 = bird.offset
			var p: Vector2 = centre + group.dir * offset.x + Vector2(-group.dir.y, group.dir.x) * offset.y
			var bob := sin(group.phase * 3.0 + offset.x) * 0.25
			(bird.node as Node3D).position = Vector3(p.x, group.height + bob + offset.y * 0.15, p.y)
			_show(bird.sprite, _birds().fly, int(group.phase * 14.0 + offset.x * 3.0))
			bird.sprite.flip_h = group.dir.dot(right) < 0.0
		if group.travelled > group.length:
			for bird in group.birds:
				(bird.node as Node3D).queue_free()
			flyers.erase(group)

func _launch(at: Vector2, right: Vector2) -> void:
	# straight across the view on its open side, between the camera and the student (the
	# views look across open ground at a building), from off the screen to off the screen
	var side := 1.0 if _rng.randf() < 0.5 else -1.0
	var dir := right * side
	var toward: Vector2 = _screen()[1]
	var line := at + toward * _rng.randf_range(2.5, 7.0)
	var height := _rng.randf_range(3.0, 8.0)
	var floor_y := World.floor_height(at.x, at.y)
	var half := (_off_screen(Vector3(line.x, floor_y + height, line.y), Vector3(-dir.x, 0, -dir.y)) - Vector3(line.x, floor_y + height, line.y)).length()
	var group := {"start": line - dir * half, "dir": dir, "length": half * 2.0 + 6.0, "travelled": 0.0, "phase": _rng.randf() * 4.0,
		"speed": _rng.randf_range(6.0, 9.0), "height": floor_y + height, "birds": []}
	for i in _rng.randi_range(2, 5):
		var node := Node3D.new()
		node.name = "Flying"
		var sprite := _sprite(_birds().fly[0], _birds().fly[1])
		node.add_child(sprite)
		add_child(node)
		# a loose V: each one a little behind and to the side of the one before
		var offset := Vector2(-1.1 * i + _rng.randf_range(-0.3, 0.3), (1.0 if i % 2 == 0 else -1.0) * 0.8 * ceilf(i / 2.0))
		group.birds.append({"node": node, "sprite": sprite, "offset": offset})
	flyers.append(group)

# --- Each frame -------------------------------------------------------------------

static func _place(node: Node3D, at: Vector2, lift: float) -> void:
	node.position = Vector3(at.x, World.floor_height(at.x, at.y) + 0.015 + lift, at.y)

func update(delta: float, still: bool, running: bool, talking: bool, npc_near: bool) -> void:
	_time += delta
	var right := Vector2(camera.global_transform.basis.x.x, camera.global_transform.basis.x.z).normalized()
	var forward := -camera.global_transform.basis.z
	var at := Vector2(student.position.x, student.position.z)
	for cat in cats:
		_update_cat(cat, delta, at, still, running, right)
		cat.sprite.flip_h = cat.facing < 0.0
		cat.sprite.rotation.y = atan2(-forward.x, -forward.z)
	for flock in flocks:
		_update_flock(flock, delta, at, running, right)
		for bird in flock.birds:
			bird.sprite.rotation.y = atan2(-forward.x, -forward.z)
	_update_flyers(delta, at, right)
	for group in flyers:
		for bird in group.birds:
			bird.sprite.rotation.y = atan2(-forward.x, -forward.z)
	# the pet prompt, when no one is there to talk to
	var cat := cat_in_reach()
	_hint.visible = not cat.is_empty() and not talking and not npc_near and to_screen.is_valid() and cat.state != "dash"
	if _hint.visible:
		_hint_label.text = "Hawakan si " + cat.name
		_hint.reset_size()
		var p: Vector2 = to_screen.call(cat.node.position + Vector3(0, 0.95, 0))
		_hint.position = p - Vector2(_hint.size.x * 0.5, _hint.size.y + 4.0 - sin(_time * 3.0) * 3.0)
	if _bubble.visible:
		_bubble_age += delta
		_bubble.modulate.a = clampf((2.0 - _bubble_age) / 0.5, 0.0, 1.0)
		_bubble.visible = _bubble_age < 2.0 and to_screen.is_valid()
		if _bubble.visible:
			_bubble.reset_size()
			var p: Vector2 = to_screen.call(_bubble_cat.node.position + Vector3(0, 0.95, 0))
			_bubble.position = p - Vector2(_bubble.size.x * 0.5, _bubble.size.y + (34.0 if _hint.visible else 4.0))

func _say(cat: Dictionary, words: String) -> void:
	if not to_screen.is_valid():
		return
	_bubble_cat = cat
	_bubble_label.text = words
	_bubble_age = 0.0
	_bubble.visible = true

## The pet prompt and the cat's little bubble, in the talk's style, on the UI layer.
func build_ui(parent: Node) -> void:
	var layer := CanvasLayer.new()
	layer.name = "Critters"
	parent.add_child(layer)
	var lettering := Theme.new()
	lettering.default_font = Opening.lettering()
	_hint.theme = lettering
	_hint.add_theme_stylebox_override("panel", Npcs._box(Color(22 / 255.0, 16 / 255.0, 34 / 255.0, 0.78), 16, 5))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	_hint.add_child(row)
	var key := PanelContainer.new()
	var cap := Npcs._box(Npcs.PAPER, 5)
	cap.content_margin_left = 7
	cap.content_margin_right = 7
	key.add_theme_stylebox_override("panel", cap)
	var key_label := Label.new()
	key_label.text = "E"
	key_label.add_theme_font_size_override("font_size", 13)
	key_label.add_theme_color_override("font_color", Npcs.INK)
	key.add_child(key_label)
	row.add_child(key)
	_hint_label.add_theme_font_size_override("font_size", 15)
	_hint_label.add_theme_color_override("font_color", Npcs.PAPER)
	row.add_child(_hint_label)
	_hint.visible = false
	layer.add_child(_hint)
	_bubble.theme = lettering
	_bubble.add_theme_stylebox_override("panel", Npcs._box(Npcs.PAPER, 10, 6))
	_bubble_label.add_theme_font_size_override("font_size", 14)
	_bubble_label.add_theme_color_override("font_color", Npcs.INK)
	_bubble.add_child(_bubble_label)
	_bubble.visible = false
	layer.add_child(_bubble)

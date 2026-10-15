extends Node
## Sound, synthesised the same way as the browser game's (src/engine/audio.ts),
## so there are still no audio files: soft wind, a slow generative melody,
## footsteps, a menu blip and crickets at night. GDScript is too slow to
## synthesise live, so each sound is rendered once into a small buffer.

const RATE := 22050
const MASTER := 0.7
const MUSIC := 0.5
const SCALE := [0, 2, 4, 7, 9] # major pentatonic
const DAY_ROOT := 261.63
const NIGHT_ROOT := 196.0

var muted := false
var night := false
## Under the canteen roof: the wind drops away.
var indoor := false
## Footsteps played so far, for the checks.
var steps := 0
var wind := AudioStreamPlayer.new()
var _music: Array[AudioStreamPlayer] = []
var _effects: Array[AudioStreamPlayer] = []
var _cache := {}
var _warm: Array[Callable] = []
var _clock := 0.0
var _next_note := 1.0
var _next_chirp := 0.0
var _step := 0

func _ready() -> void:
	name = "Audio"
	var bus := AudioServer.get_bus_index("Music")
	if bus < 0:
		bus = AudioServer.bus_count
		AudioServer.add_bus()
		AudioServer.set_bus_name(bus, "Music")
		AudioServer.set_bus_send(bus, "Master")
		# The browser's 0.42 s feedback delay gives the melody its space.
		var echo := AudioEffectDelay.new()
		echo.tap1_active = false
		echo.tap2_active = false
		echo.feedback_active = true
		echo.feedback_delay_ms = 420.0
		echo.feedback_level_db = linear_to_db(0.45)
		AudioServer.add_bus_effect(bus, echo)
	for i in 8:
		_music.append(_player("Music"))
		_effects.append(_player("Master"))
	var loop := _filter(_noise(RATE * 5), "lowpass", 420.0, 1.12)
	wind.name = "Wind"
	wind.stream = _wav(_seamless(loop, RATE / 2, 0.05 * MASTER), true)
	add_child(wind)
	wind.play()
	# Render the rest a little at a time so the first notes do not stutter.
	for root in [DAY_ROOT, NIGHT_ROOT]:
		_warm.append(_bass.bind(root))
		for step in 10:
			_warm.append(_note.bind(root, step))
	for i in 4:
		_warm.append(_footstep.bind(true, i))
		_warm.append(_footstep.bind(false, i))
	for i in 3:
		_warm.append(_chirp.bind(i))

func _player(bus: String) -> AudioStreamPlayer:
	var player := AudioStreamPlayer.new()
	player.bus = bus
	add_child(player)
	return player

func _play(stream: AudioStream, pool: Array[AudioStreamPlayer], delay := 0.0) -> void:
	var player := pool[0]
	for candidate in pool:
		if not candidate.playing:
			player = candidate
			break
	player.stream = stream
	if delay > 0.0:
		get_tree().create_timer(delay).timeout.connect(player.play)
	else:
		player.play()

func toggle_mute() -> void:
	muted = not muted
	AudioServer.set_bus_mute(AudioServer.get_bus_index("Master"), muted)

func _process(delta: float) -> void:
	if not _warm.is_empty():
		_warm.pop_front().call()
	_clock += delta
	wind.volume_db = lerpf(wind.volume_db, linear_to_db(0.3 if indoor else 1.0), 1.0 - exp(-delta * 2.0))
	if _clock >= _next_note:
		# Wander up and down the scale in small steps, lower and sparser at night.
		_step = clampi(_step + randi_range(-2, 2), 0, 9)
		var root := NIGHT_ROOT if night else DAY_ROOT
		_play(_note(root, _step), _music)
		if randf() < 0.3:
			_play(_bass(root), _music)
		_next_note = _clock + (1.4 if night else 0.9) * (2.0 if randf() < 0.3 else 1.0) + randf() * 0.5
	if night and not indoor and _clock >= _next_chirp:
		_play(_chirp(randi() % 3), _effects)
		_next_chirp = _clock + 0.6 + randf() * 1.6

## A foot landing: tiles and steps click, the road and patio thud.
func footstep(hard: bool) -> void:
	steps += 1
	_play(_footstep(hard, randi() % 4), _effects)

func select() -> void:
	_play(_cached("select", func() -> PackedFloat32Array:
		return _tone(PackedFloat32Array(), 660.0, 0.0, 0.08, 0.05, "triangle")), _effects)

# --- The sounds ----------------------------------------------------------------

func _note(root: float, step: int) -> AudioStreamWAV:
	return _cached("note:%s:%d" % [root, step], func() -> PackedFloat32Array:
		var f := root * pow(2.0, (SCALE[step % 5] + 12 * (step / 5)) / 12.0)
		var buffer := _tone(PackedFloat32Array(), f, 0.0, 2.6, 0.09 * MUSIC, "triangle")
		return _tone(buffer, f * 2.0, 0.0, 1.2, 0.025 * MUSIC, "sine"))

func _bass(root: float) -> AudioStreamWAV:
	return _cached("bass:%s" % root, func() -> PackedFloat32Array:
		return _tone(PackedFloat32Array(), root / 2.0, 0.0, 4.0, 0.06 * MUSIC, "sine"))

func _footstep(hard: bool, variant: int) -> AudioStreamWAV:
	return _cached("step:%s:%d" % [hard, variant], func() -> PackedFloat32Array:
		var buffer := _filter(_noise(int(RATE * 0.08)), "bandpass", (1500.0 if hard else 800.0) + randf() * 300.0, 1.0)
		var gain := 0.09 if hard else 0.06
		for i in buffer.size():
			buffer[i] *= gain * MASTER * pow(0.0001 / gain, minf(float(i) / RATE / 0.07, 1.0))
		return buffer)

func _chirp(variant: int) -> AudioStreamWAV:
	return _cached("chirp:%d" % variant, func() -> PackedFloat32Array:
		var buffer := PackedFloat32Array()
		for i in 3:
			buffer = _tone(buffer, 4200.0 + randf() * 300.0, i * 0.07, 0.05, 0.012, "sine")
		return buffer)

# --- Synthesis -------------------------------------------------------------------

func _cached(key: String, render: Callable) -> AudioStreamWAV:
	if not _cache.has(key):
		_cache[key] = _wav(render.call())
	return _cache[key]

func _noise(count: int) -> PackedFloat32Array:
	var buffer := PackedFloat32Array()
	buffer.resize(count)
	for i in count:
		buffer[i] = randf() * 2.0 - 1.0
	return buffer

## Adds a tone into the buffer: a 15 ms rise, then the browser's exponential fall.
func _tone(buffer: PackedFloat32Array, freq: float, at: float, length: float, gain: float, wave: String) -> PackedFloat32Array:
	var start := int(at * RATE)
	var count := int((length + 0.05) * RATE)
	if buffer.size() < start + count:
		buffer.resize(start + count)
	gain *= MASTER
	for i in count:
		var t := float(i) / RATE
		var level := gain * t / 0.015 if t < 0.015 else gain * pow(0.0001 / gain, minf((t - 0.015) / (length - 0.015), 1.0))
		var phase := fposmod(freq * t, 1.0)
		var sample := 0.0
		match wave:
			"sine": sample = sin(TAU * phase)
			"triangle": sample = 1.0 - 4.0 * absf(phase - 0.5)
			"square": sample = 1.0 if phase < 0.5 else -1.0
		buffer[start + i] += sample * level
	return buffer

## A biquad, as Web Audio's BiquadFilterNode does it.
func _filter(input: PackedFloat32Array, kind: String, freq: float, q: float) -> PackedFloat32Array:
	var w := TAU * freq / RATE
	var alpha := sin(w) / (2.0 * q)
	var c := cos(w)
	var b0 := (1.0 - c) / 2.0 if kind == "lowpass" else alpha
	var b1 := 1.0 - c if kind == "lowpass" else 0.0
	var b2 := b0 if kind == "lowpass" else -alpha
	var a0 := 1.0 + alpha
	var a1 := -2.0 * c / a0
	var a2 := (1.0 - alpha) / a0
	b0 /= a0
	b1 /= a0
	b2 /= a0
	var output := PackedFloat32Array()
	output.resize(input.size())
	var x1 := 0.0
	var x2 := 0.0
	var y1 := 0.0
	var y2 := 0.0
	for i in input.size():
		var y := b0 * input[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
		x2 = x1
		x1 = input[i]
		y2 = y1
		y1 = y
		output[i] = y
	return output

## Crossfades the tail into the head so the loop has no click, and sets its level.
func _seamless(buffer: PackedFloat32Array, fade: int, gain: float) -> PackedFloat32Array:
	var count := buffer.size() - fade
	var output := buffer.slice(0, count)
	for i in fade:
		var mix := float(i) / fade
		output[i] = buffer[i] * mix + buffer[count + i] * (1.0 - mix)
	for i in count:
		output[i] *= gain
	return output

func _wav(buffer: PackedFloat32Array, loop := false) -> AudioStreamWAV:
	var data := PackedByteArray()
	data.resize(buffer.size() * 2)
	for i in buffer.size():
		data.encode_s16(i * 2, int(clampf(buffer[i], -1.0, 1.0) * 32767.0))
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = RATE
	wav.data = data
	if loop:
		wav.loop_mode = AudioStreamWAV.LOOP_FORWARD
		wav.loop_end = buffer.size()
	return wav

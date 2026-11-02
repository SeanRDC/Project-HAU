extends RefCounted
## --bench=<absolute JSON path> (dev): measures every fast-travel place and a run along the
## campus with vsync off, then quits. Frame times are wall clock; gpu_ms and render_cpu_ms are
## Godot's own measured render times for the 3D viewport.

const WARM := 30
const FRAMES := 120
const RUN_SECONDS := 8.0

static func run(aps: Node, path: String) -> void:
	var tree := aps.get_tree()
	DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
	Engine.max_fps = 0
	var vp: RID = aps.viewport.get_viewport_rid()
	RenderingServer.viewport_set_measure_render_time(vp, true)
	await tree.process_frame
	var report := {"startup_ms": aps.startup_ms, "first_frame_ms": Time.get_ticks_msec(),
		"window": [aps.get_window().size.x, aps.get_window().size.y],
		"gpu": RenderingServer.get_video_adapter_name(), "places": []}
	var all_frames: Array[float] = []
	var places: Array = aps.travel_places()
	for i in places.size():
		aps._travel_to(i)
		for f in WARM:
			await tree.process_frame
		var sample := await _sample(aps, vp, FRAMES)
		sample["name"] = places[i][0]
		all_frames.append_array(sample.raw)
		sample.erase("raw")
		report.places.append(sample)
	# A run east along the APS front and round the corner, as a player would: Shift+D held.
	aps._travel_to(0)
	for f in WARM:
		await tree.process_frame
	_key(KEY_SHIFT, true)
	_key(KEY_D, true)
	var run := await _sample(aps, vp, -1)
	_key(KEY_D, false)
	_key(KEY_SHIFT, false)
	run.erase("raw")
	report["run"] = run
	report["all_places"] = _stats(all_frames)
	report["memory"] = {"static_mb": Performance.get_monitor(Performance.MEMORY_STATIC) / 1048576.0,
		"video_mb": Performance.get_monitor(Performance.RENDER_VIDEO_MEM_USED) / 1048576.0,
		"texture_mb": Performance.get_monitor(Performance.RENDER_TEXTURE_MEM_USED) / 1048576.0,
		"buffer_mb": Performance.get_monitor(Performance.RENDER_BUFFER_MEM_USED) / 1048576.0,
		"nodes": Performance.get_monitor(Performance.OBJECT_NODE_COUNT),
		"objects": Performance.get_monitor(Performance.OBJECT_COUNT)}
	var file := FileAccess.open(path, FileAccess.WRITE)
	file.store_string(JSON.stringify(report, " "))
	file.close()
	print("bench written: ", path)
	tree.quit()

static func _key(code: Key, down: bool) -> void:
	var event := InputEventKey.new()
	event.physical_keycode = code
	event.keycode = code
	event.pressed = down
	Input.parse_input_event(event)

## count < 0: sample for RUN_SECONDS of wall time instead.
static func _sample(aps: Node, vp: RID, count: int) -> Dictionary:
	var tree := aps.get_tree()
	var frames: Array[float] = []
	var gpu := 0.0
	var render_cpu := 0.0
	var process := 0.0
	var draws := 0.0
	var objects := 0.0
	var start := Time.get_ticks_usec()
	var last := start
	while (count >= 0 and frames.size() < count) or (count < 0 and Time.get_ticks_usec() - start < RUN_SECONDS * 1e6):
		await tree.process_frame
		var now := Time.get_ticks_usec()
		frames.append((now - last) / 1000.0)
		last = now
		gpu += RenderingServer.viewport_get_measured_render_time_gpu(vp)
		render_cpu += RenderingServer.viewport_get_measured_render_time_cpu(vp)
		process += Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0
		draws += Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)
		objects += Performance.get_monitor(Performance.RENDER_TOTAL_OBJECTS_IN_FRAME)
	var n := float(frames.size())
	var out := _stats(frames)
	out.merge({"gpu_ms": gpu / n, "render_cpu_ms": render_cpu / n, "process_ms": process / n,
		"draw_calls": roundi(draws / n), "objects": roundi(objects / n),
		"student": [snappedf(aps.student.position.x, 0.1), snappedf(aps.student.position.z, 0.1)],
		"raw": frames})
	return out

static func _stats(frames: Array[float]) -> Dictionary:
	var sorted := frames.duplicate()
	sorted.sort()
	var total := 0.0
	for f in sorted:
		total += f
	var mean := total / maxf(sorted.size(), 1)
	return {"frames": sorted.size(), "mean_ms": mean, "fps": 1000.0 / mean,
		"p99_ms": sorted[int(sorted.size() * 0.99)], "max_ms": sorted[-1]}

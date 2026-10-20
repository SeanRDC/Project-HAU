# Atmosphere: new times of day and weathers

**Who:** Mikko, with Claude Code.

## What was asked

From the suggested options Mikko picked golden hour, dusk, dawn, overcast, a thunderstorm,
fog, a windy day, sun rays with dust, and lit windows. (Not a running day cycle: T still
steps through fixed presets.)

## Decisions

- **Times:** `_set_hour` is now a table (`PRESETS`); T steps through dawn 5:45, morning,
  noon, afternoon, golden hour 5:45 PM, dusk 6:30 PM and night. Golden hour: a low warm
  sun from the west, long shadows, glow 0.5, strong warm shafts and dust. Dusk: the sun just
  down, orange to deep blue sky, lamps and lit windows on, first stars, crickets. Dawn: a
  pink-lavender low light, lamps and windows still on, faint stars, a low mist, the birds.
  The existing morning, noon, afternoon and night values are unchanged.
- **Lit windows:** the windows already had night glows; they now come on at dusk and dawn
  too (the presets' `lamps`).
- **Weathers** (`atmosphere.gd`): clear, overcast, rain, thunderstorm, fog, windy, each a
  mix of rain, gloom, fog and wind that the scene eases into; G steps through them, and they
  change on their own by `WEATHER_ODDS`. Overcast flattens the light (sun down, grey
  ambient up, less contrast). Fog: the orthographic camera sees everything at nearly one
  depth, so distance fog barely shows; the fog is height fog. A first try (6 m deep) hid the
  student, so it lies low (up to 1.4 m). Windy: a global shader value `wind` drives the
  foliage's sway; the falling leaves thicken and blow sideways. Thunderstorm: lightning
  (a double flash of ambient and sky) and synthesised thunder.
- **Sun rays and dust:** the shafts' strength comes from the preset (strongest at golden
  hour); dust specks drift round the student in the low clear sun.
- The time badge names the weather when it is not clear; the help line says "G Weather".

- **Fog taken out (Mikko: "remove fog on weather").** The fog weather is gone, and the
  overcast, rain and storm weathers no longer add any low mist. Dawn keeps its own mist.

## What changed

- `aps.gd`: `PRESETS`, `HOURS`, `_set_hour`, `--weather`, `_show_weather`, `wind` added
  before the world; check `weather_and_light`.
- `atmosphere.gd`: weathers, gloom, fog and height fog, wind, lightning, dust, preset shafts.
- `audio.gd`: `thunder()`. `shaders/leaves.gdshader`: the global `wind`.
- `README.md`, `docs/godot-art-style.md` (the lighting table, Weather and atmosphere).

## Checks

`tools
un-aps-godot.cmd --headless -- --test`: all true. `npm run check`, `npm run build`
pass. Captures of dawn, golden hour, dusk, overcast, fog and the storm checked.

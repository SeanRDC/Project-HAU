# 2026-10-15: APS lighting, shading and rain

**Who:** Mikko (H1enZ).

## What was asked
Make the APS building feel lit and alive at night without changing its pixel-art style or architecture: balanced window and lamp light, light that falls on the walls, trees and pavement, shading that shows the building's depth even at night, and wet-road reflections in the rain. Tested at 11:46 PM with rain. Then: the window glow showed through the bamboo; blend it so the light falls on the leaves instead.

## What was wrong
* The twin lanterns threw large near-white light circles that washed out the walls, and the canteen stalls burned out to white.
* Lit windows were flat full-brightness rectangles added over everything, casting no light round them, so windows looked too bright and walls flat and dark.
* The night ambient darkens everything equally, and the building had little shading of its own, so it read as one flat sheet.
* Rain was falling streaks on a flat sheen; nothing reflected.

## Decisions
* **Fix it at the source, APS only.** No new full-screen filter. The renderer gained two opt-in hooks that only APS uses: `atmosphere` (wet streets and lamp motes) and `lightBake` (night light worked out once at load).
* **Window light is worked out from the glow itself** (`bakeSpill` in `scenes/aps.ts`): copies of the glow layer pushed out in fading steps, further down than up, so the spill always lines up with the lit windows and the falloff stays stepped and pixel-like. A cool moonlight fill on the building front comes with it so the details read at midnight. It goes into the light map, scaled by darkness: one image draw a frame.
* **A window's glow is hidden wherever something stands in front of it** (`hideBehind`): the scene is compared with a snapshot of the bare buildings, and the glow cleared wherever they differ. The spill is worked out before that, so the bamboo and the trees in front of lit windows still catch their light.
* **Trees are not animated**: they are drawn once into a static layer; swaying them would mean redrawing every frame.

## What changed
* `art/aps.ts`: shade under each slab and the fascia, columns shading the corridor beside them, recessed windows with sills, rain streaks on the fascia, a contact shadow at the foot; lit rooms at different brightnesses, spilling onto the balcony wall in front; a faint cool moonlight edge on the roof, slabs and columns at night; the lobby's strip lights throwing pools down the wall and floor.
* `art/canteen.ts`: the stalls glow warm, brightest at the counter, instead of white.
* `scenes/aps.ts`: lanterns as a small warm glow at the head and a soft pool on the pavement; softer door lights; `bakeSpill`, `hideBehind`, the glow dimmed by 30%; `atmosphere: true`.
* `engine/lighting.ts`: `LightMap.addBaked` for a pre-worked light layer.
* `area.ts`, `types.ts`: `AreaDef.atmosphere` and `AreaDef.lightBake`. In rain the road darkens and shows the lit windows mirrored and rippling in bands, an unbroken rippling column of light under each lamp, puddles that catch the nearest lamp with rings where drops land, and rain catching the lamplight; on dry nights a few motes round the lamps. It all scales with rain and darkness, so it comes and goes smoothly and dries as the rain eases.

## Checked
* `npm run check`, `npm run build` and `npm run check:links` pass.
* Before-and-after screenshots from the real game at the same camera positions and times (9 PM, 11:46 PM, rain, 3 PM, sunset, sunrise), kept on Mikko's machine. Daytime is unchanged.

## Left unfinished
* Other outdoor scenes can take the same treatment with `atmosphere: true` and a `lightBake`; only APS has it.
* Swaying trees and bamboo.

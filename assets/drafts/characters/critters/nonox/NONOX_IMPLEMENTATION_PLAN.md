# Nonox: Implementation Plan (Project HAU)

Nonox is a 6-month-old blue-grey Persian kitten based on a real cat. He lives mainly in one **home building**, wanders the campus now and then, and every so often walks over to the player. The player can pet him with **E**.

This folder is meant to be dropped into the repo and handed to Claude Code.

```
nonox_handoff/
├── NONOX_IMPLEMENTATION_PLAN.md      ← this file
├── assets/
│   ├── nonox_spritesheet.png         ← 224×64, 7×2 grid of 32px cells, transparent
│   └── nonox_spritesheet.json        ← frame rects + animation definitions
└── reference/
    ├── nonox_poses_labeled.png       ← every pose, labelled, 12× zoom
    ├── nonox_spritesheet_8x_preview.png
    ├── mockup_bench_with_mingming.png← target size vs Mingming
    ├── mockup_petted_prompt.png      ← target look of the interaction prompt
    ├── mockup_interaction.gif        ← target behaviour: approach → stink-eye → prompt → petted → loaf
    └── real_nonox_face.jpeg          ← the real cat, for reference only
```

---

## Prompt to paste into Claude Code

> Read `nonox_handoff/NONOX_IMPLEMENTATION_PLAN.md` and add Nonox to the game.
> First find how **Mingming** (the orange cat at the bench) is implemented: her sprite import settings, her interaction prompt ("Hawakan si Mingming"), her "Meow!" bubble, and how NPCs move and use navigation. Reuse those systems instead of building new ones. Tell me which files you'll touch and which building you'll use as Nonox's home before you write code, then implement the plan section by section and run the test checklist at the end.

---

## 1. Sprite sheet

**File:** `assets/nonox_spritesheet.png`. **224×64**, 7 columns × 2 rows of **32×32 px** cells. The art keeps the fluffy, detailed look of the approved design, adjusted to fit HAU: snapped to a clean pixel grid, Nonox's light-grey fur on a 6-tone, near-neutral ramp (very slightly cool shadows), a selective outline (lighter on the lit upper-left edges, darker in shadow, like the game's cats), a 1px catchlight in each copper eye, and stray single pixels cleaned up.

| Row | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| 0 | `front` | `three_quarter` | `side` | `back` | `loaf` | `sleep` | `curious_sit` |
| 1 | `petted` | `stink_eye_blep` | `walk_1` | `walk_2` | `walk_3` | `walk_4` | (empty) |

**Import settings (must match Mingming):**
- Filter: **nearest / point**, no mipmaps, no compression.
- Pivot: **bottom-center**. His feet rest on y = 30 in every cell; the 4 walk frames share one anchor, so he doesn't jitter.
- Scale: **same pixels-per-unit as Mingming** (about 5.5 screen px per art px at 1600×900). Check against `reference/mockup_bench_with_mingming.png`.
- Same scene lighting, shadows and sorting as Mingming.

**Animations** (also in the JSON):

| Animation | Frames | Notes |
|---|---|---|
| `idle` | `front` | Default when stopped near the player |
| `idle_side` | `side` | Default when stopped mid-wander |
| `curious` | `curious_sit` | Idle variation |
| `loaf` | `loaf` | Resting pose |
| `turn` | `three_quarter` | Brief in-between when turning to face the player |
| `walk_right` / `walk_left` | `walk_1`–`walk_4` | 8 fps loop; flip for left |
| `walk_away` | `back` | Moving away from the camera; bob 1px |
| `petted` | `petted` | Hold 2 s |
| `stink_eye` | `stink_eye_blep` | Hold 1.5 s |
| `sleep` | `sleep` | Slow 1.00→1.03 Y-scale for breathing |

Where section 2 says `idle_loaf`, `idle_sit` or `face_player`, use `loaf`, `curious` and `idle`.

---

## 2. Behaviour

Use a small state machine. The timings below are defaults; put them in a config object so they can be tuned without touching code.

```
            ┌──────────── timer ───────────┐
            ▼                               │
   ┌──► IDLE (loaf / curious_sit) ──► WANDER (inside home building)
   │        │   ▲                           │
   │        │   └──────── arrived ──────────┘
   │        │
   │        ├── roam timer ──► ROAM (walk to a random campus point) ──► RETURN_HOME ──► IDLE
   │        │
   │        └── approach timer & player in range ──► APPROACH_PLAYER ──► GREET (front + "Meow!")
   │                                                                        │
   │                                         player presses E ◄─────────────┤
   │                                                │                       │ ignored for N sec
   │                                              PETTED ──────────────────►│
   └──────────────────────────────────────────────── back to IDLE ◄─────────┘
```

### 2.1 Home building
- Nonox spends most of his time inside **one chosen building**, his "home".
- **Open decision:** which building? Expose it as `homeBuilding` / a reference to that building's area or spawn point. If nothing is chosen yet, Claude Code should list the buildings it finds in the project and ask.
- Spawn point: a cosy spot inside the home building, such as near a bench, under a table, or by a doorway.
- **WANDER:** every 6–12 s (random), pick a random walkable point **inside the home area** within about 4–6 tiles and walk to it. Then go back to IDLE.

### 2.2 Roaming the map
- Every **90–180 s** (random) he may leave home and **ROAM**. Chance: 35%.
- ROAM picks a random walkable point from a list of campus "roam spots" (corridors, café, benches, brick paths) or any random point on the navmesh.
- He stays there for 20–40 s of IDLE/WANDER around that spot, then goes to **RETURN_HOME**.
- Optional time-of-day flavour, since the game already has Morning/Afternoon: he's more likely to roam in the afternoon and more likely to stay home in the morning.
- Target: he's at home about **70–75%** of the time.

### 2.3 Coming to the player ("every few moments")
- Every **45–90 s** (random cooldown), if the player is within **~12 tiles** and reachable by path, enter **APPROACH_PLAYER**.
- Walk toward the player and stop **~1 tile away**, on the side he came from.
- **GREET:** switch to `face_player`, show a **"Meow!"** bubble the same way Mingming does, and show the interact prompt.
- If the player doesn't interact within **8 s**, he loses interest: 30% chance he plays `stink_eye` for 1.5 s, then he goes back to IDLE/WANDER.
- Cancel the approach if the player leaves range or the path fails.
- Don't approach during dialogue, cutscenes, or menus.

### 2.4 Interaction (E to pet)
- Reuse Mingming's interaction component. Prompt text: **"Hawakan si Nonox"**.
- Interact radius: same as Mingming.
- On interact:
  1. Stop moving, face the player, and play `petted` for 2 s.
  2. Show a bubble, randomly picked from `Meow!`, `Prrr...`, `Mrrp!`.
  3. Return to `idle_loaf` next to the player for 3–5 s, then resume normal behaviour.
- **Petting cooldown:** 3 s, so the E prompt can't be spammed.
- **Blep easter egg:** 5% chance on interact to play `stink_eye` (the blep pose) instead of `petted`, with a `...` bubble.
- **Optional:** track `timesPetted`. After 10 pets, he can follow the player for 30 s, a small affection reward.

### 2.5 Movement and facing
- Walk speed: noticeably slower than the player, about **55–65% of player walk speed**. He's a small kitten.
- Use `walk_right` or `walk_left` from the horizontal direction of travel. If movement is mostly vertical, keep the last facing.
- Use the same navmesh / pathfinding and collision layer as other NPCs. He mustn't block the player; let the player pass through him, or give him a tiny collider.
- When he stops, pick `idle_loaf` (70%) or `idle_sit` (30%).

---

## 3. Config (defaults)

```jsonc
{
  "name": "Nonox",
  "homeBuilding": "TBD",            // choose one building
  "walkSpeedMultiplier": 0.6,        // relative to player walk speed
  "wanderIntervalSec": [6, 12],
  "wanderRadiusTiles": [4, 6],
  "roamCheckIntervalSec": [90, 180],
  "roamChance": 0.35,
  "roamStaySec": [20, 40],
  "approachCooldownSec": [45, 90],
  "approachRangeTiles": 12,
  "approachStopDistanceTiles": 1,
  "greetTimeoutSec": 8,
  "ignoredStinkEyeChance": 0.3,
  "pettedDurationSec": 2,
  "petCooldownSec": 3,
  "blepChance": 0.05,
  "promptText": "Hawakan si Nonox",
  "bubbleLines": ["Meow!", "Prrr...", "Mrrp!"]
}
```

---

## 4. Implementation steps for Claude Code

1. **Inspect the project.** Find the engine, Mingming's prefab/scene/class, the NPC movement and pathfinding code, the interaction-prompt UI, and the speech-bubble UI. Write a short summary before you change anything.
2. **Import the assets.** Copy `assets/` into the project's sprite folder. Slice them using `nonox_spritesheet.json`, apply the import settings from section 1, and create the animations.
3. **Create the Nonox entity.** Duplicate or extend Mingming's setup: same sprite renderer and lighting, same interaction component with the new prompt text.
4. **Add the behaviour.** Put the state machine from section 2 in its own script/class, reading the config from section 3.
5. **Place him.** Set up his spawn point in the home building, the home area bounds, and the list of roam spots.
6. **Hook up the interaction:** petting, bubbles, cooldown, blep, and optionally `timesPetted`.
7. **Add a debug toggle,** if the project has a debug menu, to force each state: wander, roam, approach, pet.
8. **Run the test checklist** below and report the results.

---

## 5. Test checklist

- [ ] Nonox shows up in his home building on load, at about 2.5/3 of Mingming's height, with crisp pixels and no blur.
- [ ] His feet stay planted; there's no vertical or horizontal jitter while walking.
- [ ] He faces left and right correctly when walking.
- [ ] He wanders inside the home building without leaving its bounds during WANDER.
- [ ] Over about 5 minutes he leaves home at least once, roams, and comes back.
- [ ] He walks to the player roughly every 45–90 s when the player is nearby, stops about 1 tile away, faces the player, and says "Meow!".
- [ ] If ignored, he leaves after about 8 s, sometimes with the stink-eye.
- [ ] "E – Hawakan si Nonox" shows when in range, and pressing E plays the petted pose with a bubble.
- [ ] The pet cooldown works, so spamming E doesn't break him.
- [ ] The blep shows up occasionally (5%).
- [ ] He never blocks the player or gets stuck on corners, doors, or furniture.
- [ ] He doesn't approach during dialogue, cutscenes, or menus.
- [ ] He's lit and sorted correctly in front of and behind scenery, like Mingming.

---

## 6. Open decisions

| Decision | Default if nobody decides |
|---|---|
| Which building is his home? | Ask the developer; until then, use the building closest to the player's spawn. |
| Can he follow the player after 10 pets? | Off by default (`enableFollowReward: false`). |
| Does he save his position and pet count between sessions? | No; he respawns at home. |
| Sleep? | Included (`sleep`). Suggest napping in his home building after 2 min without player contact. |

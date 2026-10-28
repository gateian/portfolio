# Portfolio v3 – Blender grey-box blockout (v04)

`build_blockout.py` generates `blockout_v04.blend` (`blockout_v01`–`v03.blend` are earlier versions) from scratch, timed to `brain-implant-330416.mp3` using `cues.json`.
It was validated headless on **Blender 5.2.3 LTS** (Linux). It's written to stay compatible with 4.5, but that hasn't been tested yet.

## Run it (Beast / Windows)

Put these files together in one folder, for example `D:\projects\portfolio-v3-blockout\`:

    build_blockout.py
    cues.json
    brain-implant-330416.mp3

Then run:

    "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --python build_blockout.py -- D:\projects\portfolio-v3-blockout

* The argument after `--` is the output folder, where `blockout_v04.blend` is written. Add `--name other.blend` to choose a different file name. If you leave it out, the script writes to its own folder.
* The script looks for `cues.json` and the mp3 in the output folder, then next to the script, then in `..\music`. Whatever it finds is copied into the output folder. The sound strip is saved as `//brain-implant-330416.mp3`, a path relative to the .blend, so keep the mp3 next to the .blend.
* Re-running overwrites the file it writes (`blockout_v04.blend` by default). Use `--name` to save a new version without touching hand-edited copies.
* Optional preview renders (640x360 Workbench stills at the given times in seconds):

      blender.exe -b --python build_blockout.py -- D:\out --render-previews D:\out\previews "2,6,9.8,15,22.4,43.8"

Then open `blockout_v04.blend`. Playback is set to AV-sync with audio scrubbing, so press Space to watch it to the music.

## Timeline

* 30 fps, frame 1 = 0.00 s. The range is frames 1–1561, about 0–52 s. Render resolution is 1920x1080.
* Convert time to frame with `frame = round(t * 30) + 1`. For example, the drop at 22.2 s is frame 667 and the final thump at 43.8 s is frame 1315.
* Markers:
  * Named cues: `OPENING_BOOM`, `LEAP`, `RISER`, `HIT_PRE_PAUSE`, `HANG_PAUSE`, `REENTRY_FALL`, `FREEZE`, `FREEZE_LOW`, `DROP_SMASH`, `SETPIECE_26.3`, `SLOWMO_SWOOP`, `SLOWMO_LOW`, `LAND_THUMP`, `CORE_FADE`, `END_HOLD`.
  * Section edges: `SEC>name` and `SEC|name`.
  * Obstacle hits: `hitA_xx` for the Phase 2 fall and `hitB_xx` for the Phase 3 mantle. hitA_07 (9.5 s) and hitB_06 (26.3 s) share frames with HIT_PRE_PAUSE and SETPIECE_26.3, so they appear under those names.

| Time (s) | Beat | What happens |
|---|---|---|
| 0–5.4 | intro | Rooftop at sunset. He stands at the edge with an idle sway, then crouches. |
| 5.4 | intro_impact_2 | Leap off the edge, with a dust ring. |
| 7.0–9.6 | riser | Belly-down skydive into the chasm, accelerating. |
| 9.6–10.1 | pause | Hang time: speed drops to 6 m/s with a spread pose, and the camera pulls in close. |
| 10.1–19.8 | part A | Monolith fall at about 55 m/s. Each hitA from 9.9 s on spawns a monolith he dodges (2.6 m sidestep plus a 28° bank). |
| 19.8–22.2 | freeze | Head-down dive. The ground crust rushes up and the crust chunks become visible. |
| 22.2 | DROP | Smash through the crust: white flash, fireball, chunks burst and camera shake. He tumbles until 23.6. |
| 22.2–41.4 | mantle | Lava shaft at about 120 m/s. Each hitB spawns a rock with embers, and every third one adds a cliff. Dodges are 3.2 m. |
| 26.3 | biggest accent | Set piece: a giant boulder plus an opposing cliff, threaded through a gap, with shake. |
| 41.4–43.8 | slowdown | The world nearly stops (4 → 2.5 m/s) and debris hangs in the air, while the camera keeps moving at full speed, swooping from behind to a side view. He flips upright. |
| 43.8 | final thump | Superhero-kneel landing on the core platform: shockwave torus, flash disc and shake. |
| 46.6–52 | tail | Kneel idle. The camera settles over his shoulder looking at the data monolith. |

## World scale

**1 Blender unit = 1 metre.**

* The character is about 1.8 m tall.
* The fall line runs along X=0, Y=-8. The rooftop edge is at Y=2, and tower A extends into +Y.
* Z values:

| Z (m) | What's there |
|---|---|
| ≈ +745 | Roof top (`Z_ROOF`) |
| 0 | Top of the ground crust, hit on the drop |
| ≈ -2281 | Core platform top (`Z_CORE`) |

* The total drop is about 3 km. The speeds come from `SPEED_PROFILE`, and Z is computed by integrating it, so the scale follows from the timing.
* The mantle shaft has a radius of 35 m. The core cavern has a radius of 220 m. The platform has a radius of 10 m.
* `GUIDE_Descent_Path` is a curve that shows the full path. It's hidden in renders.

## Collections and naming

| Collection | Contents |
|---|---|
| `01_Rooftop` | Tower A, roof props, tower B, chasm walls, bridges, skyline |
| `02_Fall_Monoliths` | `MONO_hitA_xx_t<time>` |
| `03_Breakthrough_Mantle` | `CRUST_*` (chunk grid), shaft, lava rings, `ROCK_hitB_*`, `CLIFF_hitB_*`, `SETPIECE_*`, `SLOWMO_Debris*` |
| `04_Core` | Cavern, platform, rings, data monolith, core light |
| `Character` | `CHAR_ROOT` → `CHAR_PIVOT` → `CHAR_*` box limbs |
| `Cameras` | `CAM_RIG` → `CAM_SHAKE` → `CAM_AIM` (position + Track To) → `CAM_MAIN` (scene camera; its local Z rotation is the dutch roll), plus `CAM_TARGET` and `GUIDE_Mobile_9x16` |
| `FX_Placeholders` | `FX_Smash_Flash`, `FX_Smash_Fireball`, `FX_Leap_Dust`, `FX_Land_Shockwave`, `FX_Land_Flash`, `GUIDE_Descent_Path` |

* Colours follow the moodboard: sunset/steel for the rooftop, slate for the monoliths, lava for the mantle and teal/gold for the core. Each material has a matching viewport display colour, and the file opens in Workbench solid mode with Material colour, cavity and outline turned on.
* The character body is pale silver so it reads clearly in the blockout.

### Rendering "without the character and moving parts"

* Disable the `Character` and `FX_Placeholders` collections, and optionally the debris, for the environment plates.
* Every moving object is a keyed object (no simulations), so the environment can be rendered static at any frame.

## Swapping in the real character (e.g. Mixamo)

* `CHAR_ROOT` (an empty) carries all the travel: the fall, the dodges and the landing. Its origin is at the feet when standing.
* `CHAR_PIVOT`, about 0.98 m up at the hips, carries body rotation:
  * rotation mode ZXY
  * Z = bank/roll
  * X = pitch/tumble
  * Y = sway
* The limbs are keyed per pose:
  * STAND, CROUCH, LEAP, SKYDIVE, SPREAD, DIVE, TUCK, PRELAND, LAND_KNEEL and KNEEL_IDLE
  * They're all defined in the `POSES` dict and the pose timeline in the script.

To swap:

1. Import the FBX and scale it to about 1.8 m. Mixamo FBX usually needs a scale of 0.01, or "Apply Transform".
2. Parent the armature to `CHAR_PIVOT`, with the hips at the pivot origin, so it inherits the travel and the body rotation. Alternatively, parent it to `CHAR_ROOT` and copy the pivot rotation yourself.
3. Hide or delete the `CHAR_*` box-limb children (keep `CHAR_ROOT` and `CHAR_PIVOT`).
4. Use Mixamo clips for the limb animation (idle, crouch, jump, falling/skydive, superhero landing) in the NLA, aligned to the markers.

The camera follows `CHAR_ROOT`, so it keeps working after the swap.

## Retiming

* **Cues:** edit `cues.json` and re-run the script. Positions, Z depths, obstacles, poses, camera keys and markers all come from the cue times.
  * `key_cues` sets the story beats.
  * `obstacle_hit_candidates.phase2_fall` and `.phase3_mantle` set where obstacles spawn and which way he dodges.
* **Speed and depth:** edit `SPEED_PROFILE` in the script (m/s per breakpoint).
* **Camera:** edit `CAM_KEYS`. Each entry is `(time, camera offset from character, look-target offset, lens mm, dutch roll deg)`.
  * Most of the fall uses `FALL_OFF, FALL_LOOK = BIRD(12, 2.7, 85)`: the camera is 12 m above him and 2.7 m back on the -X/+Y diagonal (45° off the tower faces), with the view pitched 85° down. `BIRD(height, back, pitch)` builds the offset/look pair, so tweak those three numbers.
  * The rig follows the character in Y and Z, and follows its dodge in X at 60%.
  * Shake strength is set in the shake section, at 0.6 for the drop, 0.35 for the set piece and 0.25 for the thump.
* **Dodges:**
  * `DODGE_A`, `DODGE_B` and `BANK` set the sidestep distances and bank angle.
  * Hits less than 0.7 s apart stay on the same side, so the moves stay plausible.
  * Phase 2 hits before 9.9 s (during the leap and riser) only get markers, with no monoliths.

## v04 changes: double height, faster fall

* `SPEED_PROFILE` is ~2.2x v03: chasm 110–125 m/s (v03 50–55), freeze ramps 125→190, mantle 280–295 m/s (v03 120). The brake into slow-mo now starts at 40.6 s (295→60→4 m/s by 41.4 s). Cue times are unchanged.
* Total drop 7,037 m (v03 3,026): rooftop/crust gap 1,655 m (v03 745), crust to core platform 5,383 m (v03 2,281). Everything that hangs off `Z_ROOF`/`Z_CORE`/`zc(t)` (towers, bridges, skyline, shaft, obstacles on their cue times) scales automatically.
* Speed references: every chasm face gets thin ribs + ledge/box greebles every 6–14 m (`*_ribs`, `*_greebles`, one merged mesh per wall); ~660 dust streaks float in the chasm (`SPEED_Chasm_DustStreaks`) and ~1,300 glowing ember streaks in the mantle (`SPEED_Mantle_EmberStreaks`), all kept >= 6.5–7.5 m off the fall line so nothing hits the lens; mantle lava rings every 35–70 m (was 110–170); ~290 wall rocks (was 60); 8 sky bridges (was 4).
* Camera: v03 bird's-eye kept. Added a speed buffet (restricted Noise modifiers on `CAM_SHAKE`, 0.10 m chasm / 0.18 m mantle) and an FOV punch (24→19 mm at re-entry, 24→18 mm after the smash). `clip_end` 15 km.
* Clearance check (`check_cam.py`, every frame 5.3–43.3 s): the camera never enters an obstacle; nearest passes are the set-piece boulder (1.8 m) and flying rocks (now pushed 0.4 m further out). Core gold shards now use their own seed.

## v03 camera changes

* Fall (after the leap to 41.4 s) is now a near top-down bird's-eye: ~85° down at 12 m above him on a 24 mm lens (was ~62° at 7.5 m, 30 mm). He sits small in the upper-middle of the frame (y ≈ 0.55–0.75) and the shaft converges far below, so obstacles rise toward him from below.
* Beat variants: hang-time push-in 8.5 m / 83°; freeze-low and drop 14 m / 88° on 22 mm; set piece 8.5 m / 82° on 22 mm.
* 45° diagonal yaw and the ±5–6° dutch roll are kept. The opener (0 s to the leap) and the ending (41.4 s on) keys are unchanged from v02.
* `CRUST_Underglow` now hides two frames after the drop (it breaks with the crust); from the higher camera it otherwise filled the frame.

## v02 camera changes

* **Opening (0–5 s):** the camera starts on the opposite side from v01, out over the void off his left shoulder and about 6 m above the roof, looking down past him at the facade dropping into the chasm. It orbits round to behind him for the crouch and leap.
* **Fall (leap to 41.4 s):** a high downward three-quarter angle, about 60° down, rising to about 75° for the freeze and the drop, so the chasm floor, the crust and then the lava shaft are always in view below him.
  * The yaw is diagonal, about 45° to the building and chasm walls.
  * A subtle dutch roll drifts between -5° and +6°.
* **Set piece (26.3 s):** the lens widens to 24 mm, and the camera comes in a little closer so the boulder and the gap fit in the frame.
* **Ending (41.4 s on):** unchanged from v01. The swoop now starts from the downward fall pose, and the roll settles to 0 by 42.3 s.
* **Look:** the roof is a warmer sunset tone, the chasm walls darken sooner with depth, and the overhang beam under the edge is gone.

## Mobile 9:16 guide

* `GUIDE_Mobile_9x16` is a wireframe frame parented to the camera. It's driven by the lens so it always marks the centre 9:16 crop of the 16:9 frame.
* It's visible in the viewport and hidden in renders.
* Keep the action inside it.
* For actual mobile renders, either crop in post or duplicate the scene at 1080x1920 with the same camera. With sensor fit set to Auto, the horizontal FOV gets narrower.

## Files

* `build_blockout.py`: the generator.
* `blockout_v01.blend`: the generated file. It also contains a `BLOCKOUT_NOTES` text block.
* `cues.json` and `brain-implant-330416.mp3`: the timing source and the audio.
* `contact_sheet_v04.png` and `previews_v04/`: v04 frames. `contact_sheet_v03.png` and `previews_v03/`: 640x360 Workbench frames of v03 at the key beats. `contact_sheet_v02.png` and `previews_v02/`: 640x360 Workbench frames of v02 at the key beats. `contact_sheet.png` and `previews/` are from v01.
* `render/blockout_v04_preview.mp4` (older: `blockout_v03_preview.mp4`, `blockout_v02_preview.mp4`): full 1280x720 30 fps Workbench render with the music.
* `render_mp4.py`: renders that mp4 from a .blend: `blender -b blockout_v04.blend --python render_mp4.py -- out.mp4`. In Blender 5.x, `media_type = 'VIDEO'` has to be set before `FFMPEG`.
* `make_sheet.py`: rebuilds the contact sheet from `previews/`. It needs Pillow.

* `check_cam.py`: `blender -b blockout_v04.blend --python check_cam.py -- 160 1300` reports frames where the camera is inside an object's bounds or the character is occluded.

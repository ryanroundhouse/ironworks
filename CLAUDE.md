# IRONWORKS

A single-file three.js game: mech hangar with three build bays and a parts inventory, command deck
with contracts and a rotating market, a bar (rumours, pilots for hire, two contests), and field
missions with salvage.
`index.html` is the whole deliverable. It loads three.js from a CDN, so view it through a local
web server with an internet connection.

## Scratch space: use `.scratch/`

- Keep every working file in `.scratch/` at the repo root: build scripts, part files, debug
  builds, browser test profiles, screenshots, notes. It is gitignored.
- Do not use the system temp directory or a session scratchpad for this project. Those are wiped
  between sessions, and the build pipeline was lost that way once.
- `.scratch/` is never committed. On a fresh clone it will be missing: create it, and treat
  `index.html` as the source of truth.

## How `index.html` is built

While `.scratch/` exists, `index.html` is generated rather than hand-edited:

- `.scratch/base.html` is a snapshot of the page from before the current round of work.
- `.scratch/v6/build.py` applies asserted string patches to the base and inserts the part files
  beside it: `r1_radio.js` (the end of the radio player: steady level, desk-set and jukebox
  voices), `m2_engine.js` (music engine), `f1_fit.js` (the fitting browser, which compares every
  part with the fitted one), `b1_bar.js` (the bar: room, people, rumours, pilots for hire, panels,
  resting), `b2_games.js` (the drinking contest and arm wrestling), `bar.html` (the bar's markup),
  plus `ui.css`.
  - `python3 .scratch/v6/build.py` writes `index.html` (release).
  - `python3 .scratch/v6/build.py --debug` writes `.scratch/debug.html` with the test hooks from
    `harness.js` (`__ev`, `__errs`, `__ff`, `__cam`, `__see`, `__strip`, `__poses`, `__mus`,
    `__render`, `__wav`).
  - Follow every build with `node --check .scratch/check.mjs`.
- Earlier rounds (`.scratch/v5/` and before) are history; their output is already in the base.
  Each folder keeps the base it patched (`v5/base_v5.html`) next to its part files.
- Every patch asserts its anchor text, so a build fails loudly instead of drifting. Keep that.
- Starting a new round of work: move `.scratch/base.html` into the round it belonged to, copy the
  current `index.html` to `.scratch/base.html`, make a new `.scratch/vN/` folder with its own
  `build.py`, and patch from there. If `.scratch/` is gone, start the same way from `index.html`.

## Testing

- Serve the repo root: `python3 -m http.server 8765 --bind 127.0.0.1`, then open
  `http://127.0.0.1:8765/index.html`. Serve `.scratch/` on another port for `debug.html`.
- Headless checks: start Chrome with `--headless=new --remote-debugging-port=9222
  --autoplay-policy=no-user-gesture-required --user-data-dir=.scratch/chrome-profile` and drive it
  with the chrome-devtools tools, or with `node .scratch/v6/cdp.mjs` (`nav`, `eval`, `wav`,
  `shot file [scale]`). It brings the tab to the front on every call: a hidden headless tab gets
  no animation frames, so tweens and fades never finish. Module-level names are not on `window`,
  so reach them through `__ev('...')`. Clear that profile's localStorage after test runs; the game
  saves the company under `ironworks.co` and settings under `ironworks.cfg`.
- Check in Firefox as well as Chrome: it is the browser the game is actually played in, and its
  Web Audio differs. Start a second, muted instance with
  `/Applications/Firefox.app/Contents/MacOS/firefox --headless --no-remote --profile
  .scratch/ff-profile --remote-debugging-port 9223` and drive it with
  `node .scratch/v6/ff.mjs run <url|-> script.js ['prelude']` (the file is an async function body;
  `shot file` takes a screenshot). The profile's `user.js` needs `media.autoplay.default` 0,
  `media.autoplay.blocking_policy` 0, `media.volume_scale` "0.0" (silent speakers, the audio graph
  still runs) and `remote.active-protocols` 1. Empty the profile except `user.js` after test runs.
  - `t_scores.js` renders every score offline and counts non-finite samples; `t_soak.js` plays
    every score through the live engine with a meter on the output; `t_release.js` walks the
    release page through its real buttons; `t_nan.js` finds the node that first emits NaN.
- With no save, the page opens on the "found your company" screen. Close it with `#setClose`
  before driving anything else.
- Headless Chrome refuses pointer lock. To run the field, call `startField()` through `__ev`, then
  set `soft = true; locked = true` and hide `#pause`. Re-locking after the map (`M`) therefore
  only shows its fallback headlessly; check it in a real browser.
- `__ff(seconds)` fast-forwards bay tweens, so crane and lift sequences (`fitPart`, `switchBay`)
  can be awaited in a loop instead of in real time. It steps whichever room is showing, the bar
  included, and `__cam` places the camera there too.
- The bar: `.scratch/v6/t_enter.sh` loads the debug build and walks in (`toBar()`);
  `t_talk.sh 'BAR.P.keep' 'BAR.pil[0]' ...` captures a conversation with each. A contest can be
  played out without waiting by calling `barGameHit()` and `barGameTick(dt, t)` in a loop.
  How hard each stake is was set with `sim_drink.py` and `sim_arm.py`, which mirror the rules in
  `b2_games.js`; change the two together.
- Animation is easiest to judge from contact sheets: `__strip(person, frames, dt, dist, angle)`
  and `__poses(person, [acts])` in the debug build tile many frames into one screenshot.
- Audio cannot be heard headlessly. `__mus(which, seconds, seed, track, heat)` renders a score
  offline and reports peak, RMS, band energy and beat alignment. `which` is `'night'` (the deck
  theme), `'amb'`, `'deck'` (the theme running on into the ambience), `'win'` (the jingle),
  `'radio'`, `'juke'` (the radio's band through the bar's jukebox) or `'field'`. For the field, `track` is 0-6 and `heat` is 0 for the patrol
  arrangement, 1 for combat, or `[[seconds, heat], ...]` to render the hand-over between them.
  Keep the tracks near 0.07-0.12 RMS with peaks under 1, and combat about 3 dB above patrol.
- `__wav(...)` takes the same arguments, plus a list of mix buses to solo, and returns a base64
  WAV (`cdp.mjs wav` saves it). `python3 .scratch/v5/an.py file.wav` prints band levels over time
  and, with `--png`, draws a spectrogram, which is how balance and timing were checked.
  `python3 .scratch/v6/env.py file.wav` lists dips in level, for finding dropouts.
- Release builds must contain no `window.__` hooks.

## Conventions

- Everything lives in one `<script type="module">`. Top-level names are shared across the whole
  file, so new helpers need distinctive names; `node --check` catches collisions.
- People are built by `Human` from a seeded `lookOf(seed)`. Crew portraits (`drawFace`) use the
  same seeded draws, so keep the two in step when changing either.
- Units are metres. Mechs are 12-16 m tall, people about 1.7 m, so bay furniture meant for people
  needs to be built at human scale.
- CSS class names are global too, and short ones are taken (`.sn` is the slot name, `.pn` a
  panel, `.ob` an objective). Check before adding one.
- Items are counted in `YARD.inv` under `category.id` keys (`arm.las`, `gear.sink`). A bay build
  is a config whose slots may be `null`; `Mech`, `mechStats` and `mechReady` all accept that.
  Enemies and wingmen still use the complete `PRESETS`.
- The save is one JSON document (`saveBlob()`, `v: 2`), used for both autosave and export.
  Anything new that must persist goes in there and in the matching `*Apply` function, which
  validates on the way in because imported files are untrusted.
- Overlays that take over input carry the `ovl` class; `uiModal()` is how key handlers know to
  stand down.
- Rooms are `mode` values: `hangar`, `hq`, `bar`, `field`. The bar (`BAR`, camera rig `barCam`,
  `updateBar`) is built like the deck. The conversation box `#dlg` and `dlg()` serve both rooms;
  `focusOn` hands over to `barFocusOn` in the bar. People there are `Human`s in `BAR.crowd`; the
  regulars are in `BARC`, and seated ones keep their seat through `barStay`.
- What the bar remembers lives in `BARSV` and is saved under `bar` (`barSave()`, `barApply()`).
  A freelance pilot is rebuilt from a seed by `barPilot(seed)`, so the save holds only seeds;
  `CO.wing` may carry `cfg`, `skill`, `hpK` and `paid` for one of them, while deck pilots still
  name a `PRESETS` index in `mech`. `mechPower(cfg)` and the pilot's rank set the fee.
- Bar rumours go into a contract's `intel` with `src: 'bar'` and a key prefixed `r.`, so they
  never count as known facts (`unknown(c)`) and Mira or the client can still confirm or refute them.
- `humReach(h, arm, point, hint)` puts a hand on a point in the world (two-bone IK). Call it after
  the crowd has updated; it overrides that frame's pose for the arm.
- Music: `makeScore` builds every player (`deck`, `radio`, `field`, `sting`) from the voices in
  `KIT`. The radio plays in the bay and, as the jukebox, in the bar (`radio.voice(0 | 1)`); it
  holds one steady level by design, with no dropouts and no fading with the camera. A player has `out`, `start`, `shift`, `next` and `tick`; the `music` engine fades them by
  room and schedules a little ahead. A mission score writes patrol-only parts to the `D` buses,
  combat-only parts to `H` and shared parts to `C`; `scoreHeat()` decides when it crosses over.
- Never keep a `getChannelData()` view of a buffer that gets played. Firefox detaches the view
  once the buffer is playing, reads from it then give `undefined`, and a sample built from that is
  all NaN. One NaN note silences every score until reload (the music shares one compressor).
  Take a `.slice()` instead, as the guitar strings do with the noise buffer.

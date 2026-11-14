# IRONWORKS

A single-file three.js game: mech hangar with three build bays and a parts inventory, command deck
with contracts and a rotating market, a bar (rumours, pilots for hire, two contests), field
missions with salvage, and three rival mech companies that compete with you, hire you and fly
beside you. Everybody who speaks does so aloud, in a made-up language.
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
- `.scratch/v7/build.py` applies asserted string patches to the base and inserts the part files
  beside it: `v1_vox.js` (the voices: phonemes, each speaker's voice, the synth and its playback
  bus), `m1_comm.js` (in-cockpit comms, and holding the sortie while one is on screen),
  `c1_rivals.js` (the three companies: who they are, standing with them, what is saved),
  `c2_rivops.js` (company offers on the board, their lances, every encounter in the field, the
  books afterwards), `h1_stand.js` (the STANDING tab of the board and hailing a company),
  `b3_gossip.js` (bar rumours, now including talk about the companies), plus `ui.css`.
  - `python3 .scratch/v7/build.py` writes `index.html` (release).
  - `python3 .scratch/v7/build.py --debug` writes `.scratch/debug.html` with the test hooks from
    `harness.js` (`__ev`, `__errs`, `__ff`, `__cam`, `__see`, `__strip`, `__poses`, `__mus`,
    `__render`, `__wav`, `__mk`, `__sim`, `__vox`).
  - Follow every build with `node --check .scratch/check.mjs`.
- Earlier rounds (`.scratch/v6/` and before) are history; their output is already in the base.
  Each folder keeps the base it patched (`v6/base_v6.html`) next to its part files.
- Every patch asserts its anchor text, so a build fails loudly instead of drifting. Keep that.
- Starting a new round of work: move `.scratch/base.html` into the round it belonged to, copy the
  current `index.html` to `.scratch/base.html`, make a new `.scratch/vN/` folder with its own
  `build.py`, and patch from there. If `.scratch/` is gone, start the same way from `index.html`.

## Testing

- Serve the repo root: `python3 -m http.server 8765 --bind 127.0.0.1`, then open
  `http://127.0.0.1:8765/index.html`. Serve `.scratch/` on another port for `debug.html`.
- Headless checks: start Chrome with `--headless=new --remote-debugging-port=9222
  --autoplay-policy=no-user-gesture-required --user-data-dir=.scratch/chrome-profile` and drive it
  with the chrome-devtools tools, or with `node .scratch/v7/cdp.mjs` (`nav`, `eval`, `wav`,
  `shot file [scale]`). It brings the tab to the front on every call: a hidden headless tab gets
  no animation frames, so tweens and fades never finish. Module-level names are not on `window`,
  so reach them through `__ev('...')`. Clear that profile's localStorage after test runs; the game
  saves the company under `ironworks.co` and settings under `ironworks.cfg`.
- Check in Firefox as well as Chrome: it is the browser the game is actually played in, and its
  Web Audio differs. Start a second, muted instance with
  `/Applications/Firefox.app/Contents/MacOS/firefox --headless --no-remote --profile
  .scratch/ff-profile --remote-debugging-port 9223` and drive it with
  `node .scratch/v7/ff.mjs run <url|-> script.js ['prelude']` (the file is an async function body;
  `shot file` takes a screenshot). The profile's `user.js` needs `media.autoplay.default` 0,
  `media.autoplay.blocking_policy` 0, `media.volume_scale` "0.0" (silent speakers, the audio graph
  still runs) and `remote.active-protocols` 1. Empty the profile except `user.js` after test runs.
  - In `.scratch/v6/`: `t_scores.js` renders every score offline and counts non-finite samples;
    `t_soak.js` plays every score through the live engine with a meter on the output; `t_nan.js`
    finds the node that first emits NaN.
  - In `.scratch/v7/`: `t_voxlive.js` has every named character say a line through the real
    engine, with meters on the voice bus and the music; `t_release.js` walks the release page
    through its real buttons (bay, deck, STANDING, a hail, the XO, bar) with the same meters.
    Both run in either browser.
- With no save, the page opens on the "found your company" screen. Close it with `#setClose`
  before driving anything else.
- Headless Chrome refuses pointer lock. To run the field, call `startField()` through `__ev`, then
  set `soft = true; locked = true` and hide `#pause`. Re-locking after the map (`M`) therefore
  only shows its fallback headlessly; check it in a real browser.
- `__mk(type, plot, o)` does all of that for a contract made to order and returns it: `o` is
  merged into the contract, so `{ twists: ['rival'], rival: 'cob' }` books a company against you
  and `{ co: 'car', cok: 'joint' }` or `{ co: 'ver', cok: 'sub' }` one beside or above you.
  `await __sim(seconds, pick, { each, stop, mortal })` then steps the sortie without waiting,
  answers every comm with `pick(comm)` (an option index), keeps the armour topped up unless
  `mortal`, and returns what was said. `t_opp.js`, `t_joint.js`, `t_race.js` (the field),
  `t_deck.js`, `t_deck2.js`, `t_bar.js`, `t_save.js`, `t_debrief.js`, `t_mouse.js` and
  `t_look.js` are async function bodies built on them: run one with
  `node .scratch/v7/cdp.mjs eval "(async () => { $(cat .scratch/v7/t_opp.js) })()"`.
  An open `.ovl` overlay (the salvage picker, say) makes `uiModal()` true and swallows the keys,
  so start field tests from a clean page.
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
- Voices: `node .scratch/v7/t_vox.mjs` renders eight lines from every named voice, a dozen
  strangers and some hostile input offline, counts non-finite samples and writes WAVs to
  `.scratch/v7/wav/` for listening or `an.py`. In the page, `__vox(ch, text, fx)` reports length,
  peak, RMS and bad samples for one line. Nothing is spoken until the AudioContext exists, so
  dispatch a `pointerdown` (or call `sfx.init()`) before testing playback or lip movement.
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
- The other companies are `RIV.cob`, `RIV.car`, `RIV.ver` (`RIVS` lists the keys): paint, emblem,
  commander `ch`, a roster of four machines, and six `facts` for the dossier. `RIV` has no
  prototype on purpose: company keys come out of save files, and `RIV['constructor']` must find
  nothing. Test a key with `RIV[k]` or `RIVS.includes(k)`.
- Standing lives in `CO.riv[k] = { rel, log, know, ask, gift }` (companies) and `CO.rep[f]` with
  `CO.hist[f]` (factions), saved in the ledger by `rivSave()` and validated by `rivApply()`.
  Change it only through `rivRel(k, d, why)` and `repAdd(f, d, why)`, which keep the history the
  STANDING tab shows. During a sortie use `rvRel(k, d, why)` and `rep(f, d)` instead: they are
  held in `MS.relD` / `MS.repD` and applied by `settle()`, so nothing sticks if the page is
  closed mid-mission. `relWord()` and `repWord()` name the bands.
- A contract can involve a company three ways. `c.rival` names one that will turn up (the
  `'rival'` twist, or the recovery plot `race`): `TWISTS.rival` picks help, race or opposition
  from the standing and the mission type. `c.co` with `c.cok === 'sub'` is paper they hold and
  pass down: their commander is `dealer(c)` and the negotiating `PERSONA`, and the client's
  goodwill is halved. `c.co` with `c.cok === 'joint'` puts their lance beside yours (`rivJoint`);
  `c.share` is their cut when the player proposed it. `rivCo()` converts an offer, `rivOffers()`
  deals them onto the board now and then, `rivClean()` checks one loaded from a save, and
  `rivSettle()` does the books.
- In the field a company's lance comes from `rivLance(k, x, z, team, o)` (`rivDrop` to arrive by
  dropship): the commander in whichever roster machine is closest to `mechPower(player.cfg)`,
  and one or two lancemates a class lighter. Their entities carry `rv` (the company key) and
  `rc` / `rh` (radar and map colours). Flying on your side they are team 0 but their shots are
  owned by 4: they hit what yours hit, the kills are theirs (`MS.v.rvk`), not yours.
  `rivFight()` runs a fight to the point where they yield.
- Comms: `say` and `ask` queue lines that hold the sortie while they are on screen, according to
  `CFG.hold` (2 every message, 1 questions only, 0 never: a question then times out to its
  default as it used to). `chatter()` is talk that must never stop the fight. While `commHold`
  is set the frame loop runs only `updateComm`; the pointer stays locked, keys go to
  `commHoldKey`, mouse movement and the wheel walk the highlight, and a click never dismisses a
  plain line.
- Every line in `dlg()` and in the comms is spoken by `vox.say(ch, text, fx)` (`'radio'` in the
  field, `'holo'` for a hail on the deck). `voxOf(ch)` gives a character their voice: the named
  cast by seed (`VOX_WHO` to `VOX_CAST`), everyone else drawn from their seed out of the
  `VOX_KIND` archetypes, with the tongue of their faction (`VOX_LANG`, chosen from `ch.role`).
  A new named character wants an entry in both tables. `voxRender` is pure JS and fills its own
  array, `vox.level()` drives the speaker's mouth, and `CFG.voice` is the VOICES slider.
- Never keep a `getChannelData()` view of a buffer that gets played. Firefox detaches the view
  once the buffer is playing, reads from it then give `undefined`, and a sample built from that is
  all NaN. One NaN note silences every score until reload (the music shares one compressor).
  Take a `.slice()` instead, as the guitar strings do with the noise buffer.

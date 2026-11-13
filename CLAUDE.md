# IRONWORKS

A single-file three.js game: mech hangar, command deck with contracts, and field missions.
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
- `.scratch/v3/build.py` applies asserted string patches to the base and inserts the part files
  beside it (`p1_human.js`, `p2_anim.js`, `p3a_bay.js`, `p3b_deck.js`, `p4_music.js`).
  - `python3 .scratch/v3/build.py` writes `index.html` (release).
  - `python3 .scratch/v3/build.py --debug` writes `.scratch/debug.html` with the test hooks from
    `harness.js` (`__ev`, `__ff`, `__cam`, `__see`, `__strip`, `__poses`, `__mus`).
  - Follow every build with `node --check .scratch/check.mjs`.
- Every patch asserts its anchor text, so a build fails loudly instead of drifting. Keep that.
- Starting a new round of work: copy the current `index.html` to `.scratch/base.html`, make a new
  `.scratch/vN/` folder with its own `build.py`, and patch from there. Do the same if `.scratch/`
  is gone.

## Testing

- Serve the repo root: `python3 -m http.server 8765 --bind 127.0.0.1`, then open
  `http://127.0.0.1:8765/index.html`. Serve `.scratch/` on another port for `debug.html`.
- Headless checks: start Chrome with `--headless=new --remote-debugging-port=9222
  --autoplay-policy=no-user-gesture-required --user-data-dir=.scratch/chrome-profile` and drive it
  with the chrome-devtools tools. Clear that profile's localStorage after test runs; the game
  saves company state under `ironworks.co`.
- Animation is easiest to judge from contact sheets: `__strip(person, frames, dt, dist, angle)`
  and `__poses(person, [acts])` in the debug build tile many frames into one screenshot.
- Audio cannot be heard headlessly. `__mus('amb' | 'radio', seconds, seed)` renders a score
  offline and reports peak, RMS, band energy and beat alignment.
- Release builds must contain no `window.__` hooks.

## Conventions

- Everything lives in one `<script type="module">`. Top-level names are shared across the whole
  file, so new helpers need distinctive names; `node --check` catches collisions.
- People are built by `Human` from a seeded `lookOf(seed)`. Crew portraits (`drawFace`) use the
  same seeded draws, so keep the two in step when changing either.
- Units are metres. Mechs are 12-16 m tall, people about 1.7 m, so bay furniture meant for people
  needs to be built at human scale.

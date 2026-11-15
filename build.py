#!/usr/bin/env python3
"""Build index.html from src/.

  python3 build.py            write index.html (release)
  python3 build.py --debug    write .scratch/debug.html, with the window.__ test hooks from src/debug/harness.js
  python3 build.py --verify   fail unless index.html is exactly what src/ builds (run before committing)

Every build also writes .scratch/check.mjs (the module script alone): follow it with `node --check .scratch/check.mjs`.

src/page.html is the page with two placeholder lines: @@STYLE@@ (replaced by src/style.css) and @@SCRIPT@@ (replaced by
src/js/*.js joined in file-name order). The JS files are plain fragments of ONE module script: they share one top-level
scope, so a name defined in any of them is visible in all the others, and the order of the files is the order of execution.
"""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC, SCRATCH = ROOT / 'src', ROOT / '.scratch'
DEBUG, VERIFY = '--debug' in sys.argv, '--verify' in sys.argv


def build(debug=False):
    page = (SRC / 'page.html').read_text()
    css = (SRC / 'style.css').read_text()
    files = sorted((SRC / 'js').glob('*.js'))
    for f in files:
        t = f.read_text()
        assert t.endswith('\n'), f'{f.name} must end with a newline'
    js = ''.join(f.read_text() for f in files)
    if debug:
        js = patch(js, "  return { amb, radio, field, deck, sting, brief };\n}\n",
                   "  return { amb, radio, field, deck, sting, brief, KIT };\n}\n")
        js = patch(js, "requestAnimationFrame(frame);\n$('boot')",
                   "window.__ev = s => eval(s);\n" + (SRC / 'debug' / 'harness.js').read_text().rstrip() + "\nrequestAnimationFrame(frame);\n$('boot')")
    for ph in ('@@STYLE@@\n', '@@SCRIPT@@\n'):
        assert page.count(ph) == 1, f'src/page.html must hold {ph.strip()} exactly once'
    out = page.replace('@@STYLE@@\n', css).replace('@@SCRIPT@@\n', js)
    assert debug or 'window.__' not in out, 'a release build must contain no window.__ hooks'
    return out, js


def patch(text, old, new):
    assert text.count(old) == 1, ('debug anchor not found exactly once', old)
    return text.replace(old, new)


out, js = build(DEBUG)
SCRATCH.mkdir(exist_ok=True)
(SCRATCH / 'check.mjs').write_text(js)
if VERIFY:
    if (ROOT / 'index.html').read_text() != out:
        sys.exit('index.html is not what src/ builds: run python3 build.py')
    print('index.html matches src/')
else:
    dest = SCRATCH / 'debug.html' if DEBUG else ROOT / 'index.html'
    dest.write_text(out)
    print(f'wrote {dest.relative_to(ROOT)}  ({len(out):,} bytes, {out.count(chr(10)):,} lines)')

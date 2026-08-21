# Visual Recipes — designed cards via HTML/CSS → Playwright PNG

Anything textual (terminal output, comparisons, mappings, flows) becomes a **designed card**,
not a raw screenshot: real data, formatted for slide distance. Working generators:
`session-7/live/make_visuals.py` and `make_visuals2.py` — copy them, don't rewrite from scratch.

## The production harness (verbatim pattern)

```python
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": WIDTH, "height": 400}, device_scale_factor=2)
    pg.goto("file://" + os.path.abspath("_tmp.html")); pg.wait_for_timeout(300)
    pg.screenshot(path=f"../images/{name}", full_page=True)
```

`device_scale_factor=2` always (retina-crisp on the projector). Width per recipe below;
`full_page=True` so height fits content.

## Shared base style

Dark card `#0d1117`, panels `#161b22` with `1px solid #30363d`, radius 8–12px.
Text `#c9d1d9` · dim `#8b949e` · accent blue `#6cc7ff` · success `#7ee787` ·
danger `#ff7b72` · highlight `#e3b341`. Mono = Menlo/'SF Mono'; sans = Helvetica.
**Minimum font sizes (at 1x): mono 17px, captions 14px.** Below that it's unreadable from
the back of the room.

## Recipes

### 1. Terminal card (width ~920–960)
Mac traffic-light dots bar, then `pre` at ~21px/1.65 line-height. Color the semantics:
command dim, labels blue, numbers yellow, the ✅ line green.
**Do:** only the lines that carry the lesson (≤10). Real values from the real run.
**Don't:** paste raw terminal dumps or screenshot an actual terminal window (tiny type,
noise, wrong colors).

### 2. ✓/✗ comparison card (width ~1180)
Two columns: ✗ panel (`#1c1214` / border `#6e2a33`, header `#ff7b72`) vs ✓ panel
(`#101a14` / border `#2a6e42`, header `#7ee787`). Each: header, one-line sub (the controlled
variable — "same schema, same model"), 3 bullets, a sources/footer line.
**Do:** make the ✓ column the star — specific, bolded facts. Real content both sides.
**Don't:** parody the ✗ side; its bullets must be *genuinely plausible* or the contrast is a strawman.

### 3. Step-flow diagram (width ~1250)
3–5 items left→right with `→` arrows; under each a numbered caption (`1.` … `4.`), bolding
the load-bearing phrase. Items can be small screenshots, code chips, or color swatches.
**Do:** end the flow where the output gets *used* ("→ CSS variables (Part 5)") — flows that
end at the output feel pointless.
**Don't:** more than 5 steps; captions over 2 lines.

### 4. Mapping card (width ~1210)
Two mono panels + a column of `⟶` arrows: left = the source vocabulary (`op.headline`),
right = the destination (`<h1>{{ headline }}</h1>`), row-aligned so each arrow lands.
**Do:** row-align by construction (same line-height both panels).
**Don't:** more than ~6 rows.

### 5. Wireframe (width ~1150)
Schema/mono block on the left, page mock on the right (light card `#f5f2ee`, dashed slots
labeled with the field names), one arrow between. This is the "same names, on the page" argument.

### 6. Spine strip (width ~1250)
Station boxes with tiny sublabels, `→` between; active/model-owned stations in accent blue,
code-owned grey; one caption line decoding the color split. Reused on the map slide and dividers.

## Real screenshots (when not to design)

Browser artifacts are captured, never mocked: the form states, rendered one-pagers, Swagger,
homepage captures. Playwright, `device_scale_factor=2`, real runs. If a run costs money,
the capture run doubles as the measurement run (grab the seconds while you're there).

## Don'ts across all visuals

- ❌ Fake data when real data exists — the runs happened; use their output
- ❌ Walls of text in a card — a card carries one argument
- ❌ Rebuilding generators per session — extend `make_visuals*.py`
- ❌ 1x captures (blurry on projection)
- ❌ Forgetting these are *for the sake of the slide*: formatted, curated, legible — "illustrative" means designed presentation of true content, not invented content

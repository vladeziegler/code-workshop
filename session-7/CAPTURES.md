# Session 7 — Deck assets & verified prompt boxes

Everything below was produced by a real run on 2026-07-28 (`live/` — all stations tested,
Supabase store pending bucket decision). The deck's screenshots come from these artifacts;
the 🤖 prompt boxes are derived from the working code and reproduce it.

## Measured numbers (put these on slides, not estimates)

| What | Measured |
|---|---|
| Same brief across the family | luna 97 out (60 reasoning) · sol 78 (46) · terra 33 (0) |
| `temperature=0.7` on gpt-5.6 | 400: "Unsupported parameter: 'temperature' is not supported with this model." |
| Open `dict` field in strict schema | 400: "'additionalProperties' is required to be supplied and to be false" |
| One research call (web_search, terra) | 5 searches · 18 citations · ~42k in / 2.5k out ≈ **12¢** |
| One hero image (gpt-image-2, medium, 1536×1024) | 1,372 image tokens ≈ **4¢** |
| Whole pipeline per one-pager | ≈ **2–3 min, ~20¢** (re-measure exact seconds during prep — the endpoint returns it) |

## Screenshots to capture (source → slide)

1. **Terminal: `s1_models.py` output** — model list converging + 3-row usage table → P1 concept/pair slide
2. **Terminal: the temperature 400** (real body above) → P1 failure beat
3. **Terminal: `s2_schema.py`** — `type: OnePager`, palette list, bullets → P2 checkpoint
4. **Terminal: the open-dict 400** → P2 failure beat
5. **Terminal: `s3_research.py`** — findings excerpt + "18 citations" list → P3 concept pair
6. **Side-by-side: `s3b_contrast.py`** UNGROUNDED vs GROUNDED bullets → P3 beat (the session's slide)
7. **`live/prospect_home.png`** (the screenshot the model *sees*) + terminal Brand fields → P3 vision pair
8. **`live/hero.png`** → P4 checkpoint ("visibly belongs to the prospect's world")
9. **`live/onepager_preview.png`** (Reformation) → P5 "the template lights up" + bookend slide 2
10. **`live/output/sezane_preview.png`** → capstone slide ("same code, different prospect — nothing changed but the form input")
11. **Browser: `index.html` form** mid-generation ("Researching, composing, painting…") and done state → P5 protected moment
12. **`/docs` Swagger page** for `POST /onepagers` → P5 endpoint pair

## Verified 🤖 prompt boxes (deck + HANDOUT verbatim)

**P1 — first calls & the cost table**
> Write `s1_models.py`: load `OPENAI_API_KEY` from `.env`. List available models and print the ones matching "gpt-5.6" or "gpt-image". Then send the same one-sentence brief about Muse (rent-your-closet, NYC) to gpt-5.6-luna, gpt-5.6-sol, and gpt-5.6-terra via `client.responses.create`, printing each model's input/output/reasoning token counts from `usage`. Expect three rows.

**P2 — the nested contract**
> Write `models.py` with nested Pydantic classes mirroring a one-pager: `OnePager` holds `headline: str`, `hero: HeroImageSpec` (an `image_prompt` field described as a creative brief for an image model — a Muse clothing rack styled in the prospect's brand world, no text in the image), `why_us: WhyUs` (title + exactly 3 bullets, each grounded in a real fact about the prospect), `cta: CTA` (line + 2-4 word action), and `brand: Brand` (2-4 hex palette + tone). Every field gets a `Field(description=...)` — the descriptions steer the model. Then `s2_generate.py`: call `client.responses.parse(model="gpt-5.6-terra", text_format=OnePager)` with provided findings text and print `type(response.output_parsed)` — expect `OnePager`.

**P3 — research, two steps**
> Write `s3_research.py`: step 1 — `client.responses.create` with `tools=[{"type": "web_search"}]` asking for concrete facts about the prospect (retail presence, circular-fashion programs, aesthetic, one recent initiative) with sources; collect `url_citation` annotations from the output and save findings + sources to `research.json`. Step 2 is a separate call — `responses.parse` on the findings with `text_format=OnePager`. Never combine search and parse in one call: the citations come back empty.

**P3b — vision**
> Extend research: use Playwright to screenshot the prospect's homepage (1280×1600, wait for load), then pass it to `responses.parse` as an `input_image` content part (base64 data URI, `detail: "low"`) with `text_format=VisualIdentity` (palette actually visible in the screenshot + one-sentence art direction). Print the palette.

**P4 — the commission**
> Write `s5_image.py`: build the image brief from `OnePager.hero.image_prompt` plus the visual identity ("Color palette strictly: …", the art-direction sentence, "No text or logos in the image"), call `client.images.generate(model="gpt-image-2", size="1536x1024", quality="medium")`, decode `data[0].b64_json`, save `hero.png`.

**P5 — template & render**
> Write `template.html` (Jinja2): a one-page Letter layout — header wordmark, `h1` headline, full-bleed hero `<img>`, then two columns: a "why us" div (title + 3 dash bullets) and a CTA div (italic line + solid button), footer. Brand palette flows in as CSS variables `--bg/--ink/--accent`. Then `s6_render.py`: render with the parsed object (hero as base64 data URI), and print to PDF with Playwright — 8.5×11in, `print_background=True`, one page. Expect: the PDF looks like something you'd physically hand a buyer.

**P5b — store (pending bucket)**
> Write `store.py`: upload `hero.png` and the PDF to the Supabase `assets` bucket (`file_options={"content-type": ..., "upsert": "true"}` — the string "true"), and upsert a `onepagers` row (slug, payload JSON, sources) with `on_conflict="slug"`. Read `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from env.

**P5c — the surface**
> Write `app.py` (FastAPI): `POST /onepagers` takes `{prospect, homepage}`, runs research → look → compose → paint → render → store, returns `{headline, seconds, sources, html, pdf}`; mount `output/` as static files; serve `index.html` at `/` — a form with two inputs and a Generate button that `fetch()`es the endpoint and shows the result in an iframe with a PDF download link. Test with curl before opening the browser.

## Open item

**Supabase store**: `SUPABASE_URL`/`SUPabase_SERVICE_KEY` are exported globally in the shell and
point at project `acqwpwor…` — the pipeline reached the upload and got `Bucket not found`.
Decide before the deck's P5 store beat: (a) create `assets` bucket + `onepagers` table in that
project, or (b) use the M6 workshop Supabase project (put its creds in `session-7/.env`,
which overrides). Then re-run `curl -X POST /onepagers` once to capture the stored-URL log line.

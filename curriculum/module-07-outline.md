# Module 7 — The Content Creation Agent: Class Outline

## 1. One-line pitch & the one idea

**Pitch:** Build the agent that does Muse's partnership outreach — type a prospect brand's name, get back a researched, on-brand partnership one-pager: real facts about the prospect, Muse's USP contextualized to them, and a hero image set in their brand world. Words, image, and research all model-made; every pixel and every fact-check owned by code.

**The client:** Muse — rent your closet, NYC. They grow by partnering with shops and brands. Every partnership starts with an outreach one-pager, and today each prospect gets a *researched, personalized* one — in minutes and cents, not an afternoon of a designer's time.

**The one idea — the factory line, grounded:**

```
RESEARCH → MODEL → OBJECT → IMAGE → TEMPLATE → RENDER → STORE → SERVE
```

The model fills exactly two slots on this line — a typed object and one picture — **and research fills the model**: everything it writes must trace to something the search found or the screenshot showed. Everything else (schema, HTML, bucket, endpoint, the form) is deterministic code you own. Brand is **data**, not vibe: palette hexes, tone, and USP are typed fields the template consumes as CSS variables. This is S5's "push determinism outward" and M6's "describe the shape, let a model fill it," grown into a product.

The factory line is the visual spine: whole map on slide 4, one station lit per part.

## Components we teach, and why

- **The OpenAI API, raw (`responses`, the model menu, the reasoning-effort dial)** — every prior session hid the model behind a platform. First time holding the steering wheel; model choice becomes a product decision they can price from their own `usage` numbers. Reading a model page is the durable skill; model names rotate quarterly.
- **Structured output with nested Pydantic** — the technique that turns "the model said something" into "the model returned a value my code can trust." Nested is the point: the `OnePager` mirrors the page — `headline`, a `HeroImageSpec`, a `WhyUs` block, a `CTA`, and a `Brand` (palette, tone) that styles all of it. The schema *is* the document's tree; one class is simultaneously the contract sent to the model, the validator on the way back, and the template's data feed.
- **Image parameters in (vision)** — the model can *look*: feed it the prospect's homepage screenshot and it returns the brand's aesthetic as typed fields. Grounding has two senses — what's **true** and what it **looks like** — and vision covers the second.
- **Web search, in the API** — the first sense: the USP must name real things about the prospect, and the search tool is how generation stops being confident fiction. The ungrounded-vs-grounded contrast is the session's central beat.
- **Image generation as a model class** — text models return words, image models return bytes; same client, different product category and price logic. The agent doesn't select a stock photo — it *commissions* one, and the commission (the image prompt) is itself a typed field the text model wrote from the brand research.
- **HTML templates with text and image slots** — divs, a flex row of cards, an `<img>`, CSS variables fed from `Brand`. The model fills slots; code owns layout. Without this, every generation is un-brandable one-off soup.
- **Supabase buckets** — rows are facts, objects are bytes (they have tables from M6; buckets complete the pair). The hero image and the rendered PDF both land here; an artifact that isn't stored doesn't exist.
- **An endpoint the frontend calls** — FastAPI wraps the whole line in `POST /onepagers`; a thin static page with a form `fetch()`es it and shows the result appearing. The seam between "a script I run" and "a product someone uses" — Module 8 builds the real app on exactly this seam.

Deploy is deferred on purpose: today everything runs and is tested **locally**. The service is already deployed as facilitator infrastructure (`muse-render` on Railway — the Dockerfile ships in `starter/`, unexplained, and just travels with the repo); Module 10's MCP calls it over HTTP. Module 8 builds its own app and doesn't touch this endpoint.

## 2. What they walk out with

- `content_agent/` repo: `models.py` (nested Pydantic), `research.py` (web search + vision), `generate.py` (parse → OnePager), `paint.py` (image gen), `template.html` (Jinja2 + CSS vars), `render.py` (Playwright → PDF), `store.py` (bucket + table), `app.py` (FastAPI), `index.html` (the form), `Dockerfile` (travels quietly until M8)
- Supabase extended with a `onepagers` table and an `assets` bucket holding generated hero images and PDFs
- A locally running `POST /onepagers` endpoint and a browser form that drives it
- **A Muse partnership one-pager for a prospect they chose** — researched facts, contextualized USP, brand-set hero image, downloadable PDF at a public bucket URL
- A working mental model of the LLM API surface: text/vision in, typed objects out, images commissioned, everything priced from real `usage` numbers

## 3. The bookend

**Slide 2 (open):** a browser form on screen. Someone types a prospect brand's name, hits **Generate**. Behind it, the terminal:

```
→ web_search: 4 sources on <prospect>
→ screenshot → Brand(palette=['#1A1A1A','#F5F0E8'], tone='understated, editorial')
→ OnePager validated: usp cites consignment traffic + <prospect>'s resale program
→ image model: hero_c4d2.png — Muse rack inside a <prospect>-styled interior
→ rendered onepager_c4d2.pdf → supabase …/assets/onepager_c4d2.pdf
```

Payoff line, not explained: **"Nobody researched this company. Nobody wrote this page. Nobody drew this picture. Somebody wrote a schema and a search prompt."**

Five things happened that the room will build one station at a time — count them on the log. **Close:** everyone generates against a prospect *they* picked, from the form, and opens the PDF from the bucket URL. Re-read the payoff line once the room can build every line of the log.

## 4. Part-by-part

**P1 — The Model Menu (spine: MODEL lit) · 20 min**
Concept: one model per price point (`gpt-5.6-sol` $5/$30 · `gpt-5.6-terra` $2.50/$15 · `gpt-5.6-luna` $1/$6 per MTok — "same API, one string"); the whole family reasons and `reasoning={"effort": ...}` is the dial (`none → xhigh`; the model page is the source of truth); image models are models too, met in P4; cached input at ~10% — resending a system prompt is nearly free.
BUILD (🤖 prompt box): first `responses.create`, then the same brief across all three models printing `usage` and computed cost. ✅ *Checkpoint: a 3-row cost table from their own terminal — reuse these numbers all day.*
FAILURE BEAT: a "helpful" 2024 snippet with `temperature=0.7` → 400 across the board. Reasoning models don't take sampling knobs; the dial is `effort` and the prompt. *Read the error, not the blog post.* (Capture the real 400 body during prep.)

**P2 — Typed, Nested Objects (spine: OBJECT lit) · 30 min**
Concept: "please respond in JSON" is a wish; a schema is a contract. Strict mode's rules (every field required, `additionalProperties: false`, optional = null union). Then the headline: **the schema mirrors the page** —

```python
class OnePager(BaseModel):
    headline: str                 # the h1
    hero: HeroImageSpec           # the image the text model commissions
    why_us: WhyUs                 # title + 3 bullets, grounded in research
    cta: CTA                      # one line + one action
    brand: Brand                  # palette + tone — styles everything above
```

A flat schema mashes this tree into `bullet_1, bullet_2…` and dies the day the layout grows. `parse()` takes the class, `create()` takes the config dict; validation runs client-side on the way back.
BUILD (🤖 prompt box): define the nested model, call `client.responses.parse(text_format=OnePager)`. ✅ *Checkpoint: `type(response.output_parsed)` prints `OnePager`, and `output_parsed.brand.palette` is a real list of hexes.*
FAILURE BEAT: someone adds a lazy `extras: dict` field → 400 invalid schema. Strict mode refuses open contracts — that refusal is the feature. *"A dict is a rumor; a model instance is a fact."*

**P3 — Grounding: Facts and Looks (spine: RESEARCH lit) · 25 min**
Concept: grounding has two senses. **True** — the web-search tool (`tools=[{"type": "web_search"}]`) researches the prospect and returns findings with `url_citation` sources; **the research call and the typing call are two steps** — search produces grounded text, then `parse()` turns that text into the `OnePager` (the factory line's stations are separate on purpose, and the API agrees: mixing search and structured output in one call silently drops the citations). **Looks like** — pass the prospect's homepage screenshot as an `input_image` part and the model returns the aesthetic as `Brand` fields. Two inputs, one typed object out. Search costs $10 per thousand calls — a rounding error against the designer-hour it replaces.
BUILD (🤖 prompt boxes): `research.py` — step 1: search-grounded findings for the shared prospect (keep the sources); step 2: `parse()` the findings into the schema; then add the screenshot input and watch `Brand.palette` snap from generic to *theirs*. ✅ *Checkpoint: the USP names something real about the prospect (a product line, a program, a location) that isn't in the prompt — and you can click the source it came from.*
FAILURE BEAT — **the beat of the session:** run the same schema *without* search first. The USP is fluent, confident, generic — and wrong in the way that embarrasses you in front of a client. Side by side with the grounded run: same schema, same model, different truth. *"An ungrounded model doesn't lie to you — it fills your schema with plausible fiction, which is worse."*

**P4 — Commission the Image (spine: IMAGE lit) · 20 min**
Concept: the image model is a supplier, and `HeroImageSpec.image_prompt` is the creative brief — written by the text model, from the research, carrying the brand fields ("Muse clothing rack in an interior matching palette #1A1A1A/#F5F0E8, editorial tone"). Quality/size are cost dials.
BUILD (🤖 prompt box): `paint.py` — generate from the typed field, save bytes. ✅ *Checkpoint: a hero image that visibly belongs to the prospect's world, on disk.*
FAILURE BEAT: generate from a bare one-liner instead of the brand-fed spec → stock-photo soup that could be any company. The commission is only as good as the brief, and the brief is only as good as the research feeding it — the factory line's stations exist in this order for a reason.

**P5 — Template, Store, Serve (spine: TEMPLATE → RENDER → STORE → SERVE lit) · 40 min**
Concept: the template is code, the content is data — and the layout is deliberately four slots, because a handout has to breathe:

```
<h1>            ← headline, in the brand's display color
<img>           ← hero, full-bleed
<div> why us    ← title + 3 grounded bullets
<div> cta       ← one line, one action, brand accent
```

`Brand.palette` flows into CSS variables so the page *wears* the prospect's colors; the whole thing is sized to one printed page — this is a PDF you'd physically hand a buyer, which is the design bar ("cool enough to print" is the checkpoint aesthetic). Playwright's Chromium is a free print engine (`print_background=True` or the PDF comes out white); buckets hold bytes, tables hold facts, `get_public_url()` is a string-builder not a check; FastAPI turns the whole line into `POST /onepagers`; a static `index.html` with a form and a `fetch()` is the entire frontend — "the browser asks; your server runs the line."
BUILD (🤖 prompt boxes): template with sample data first — refresh, see *their* model's words in the shared layout; then `store.py` (upsert the image + PDF, insert the row), `app.py` endpoint, the form page. ✅ *Checkpoints: browser shows the branded page → PDF opens from a public bucket URL in an incognito tab → **the form generates end-to-end**.* **Protected moment: someone types a brand name into a plain HTML form and a researched, branded one-pager appears.**
FAILURE BEATS (compressed, pre-empted out loud): upload twice → 409 (`upsert: "true"` — the *string*); PDF ships as garbage text (set `content-type`); white PDF (`print_background=True`).

**P6 — Capstone (whole spine lit) · 25 min**
See §6.

## 5. Run of show (3h)

| Time | Part | What happens |
|---|---|---|
| 0:00–0:10 | Bookend + map | The form demo + log; whiteboard the factory line — exactly this, nothing more |
| 0:10–0:30 | P1 | First call; 3-model cost table; temperature-400 beat |
| 0:30–1:00 | P2 | Strict schema → nested Pydantic; open-dict beat |
| 1:00–1:10 | Break | |
| 1:10–1:35 | P3 | Ungrounded vs grounded (the session's beat); screenshot → Brand fields |
| 1:35–1:55 | P4 | Commissioned image; stock-soup beat |
| 1:55–2:30 | P5 | Template lights up → bucket → endpoint → **the form moment (~2:25, protected)** |
| 2:30–2:55 | P6 Capstone | Their own prospect, end-to-end from the form |
| 2:55–3:00 | Close | Re-read the bookend log; three things to keep; tease M8 |

**Sacrifice rule:** if late, cut P1's third model row and P5's table-insert — never the grounded/ungrounded contrast, never the form moment. Catch-up: `live/` tagged per part; hand it over rather than debug one laptop. Dry-run: every part runs as `python x.py` with a cached research JSON in `starter/` — the whole session reproducible offline except the two live-search moments.

## 6. Capstone: "One prospect, one pager"

Each student picks a real shop or brand they think Muse should partner with. From the form: name goes in → `research.py` grounds it (web search + screenshot) → nested `OnePager` with a USP contextualized to that prospect → brand-set hero image → templated, rendered, stored → PDF opens from the bucket URL.

Every step maps to a station already built — say the mapping out loud. Share-around at 2:50: three students show their prospect's one-pager; the room judges whether the USP would survive a meeting with that brand's buyer. That judgment — *would this embarrass Muse in the room?* — is the eval instinct Module 10 formalizes.

Stretch (printed, not taught): a second template (dark editorial) selected by request param; regenerate the hero at higher quality and diff cost; a `GET /onepagers` list endpoint.

## 7. Prerequisites (send 48h before)

- Python 3.11+, git, Cursor (S4); Supabase project from M6 (URL + service key)
- **Own OpenAI API key** with credit and image-generation access — verify in the preflight with a 1-token text call *and* a 1-image `low`-quality call; image access is the item with lead time
- One copy-paste preflight: install `openai pydantic fastapi "uvicorn[standard]" jinja2 supabase playwright python-dotenv`, `playwright install chromium`, run both API smoke tests, import-check
- Facilitator prep: pick the shared prospect brand and **dry-run it 5×** (research quality varies by brand — choose one with a distinctive public identity); capture the bookend log and the ungrounded-vs-grounded pair for backup slides; cache one research JSON into `starter/` as the offline fallback; measure the real seconds-and-cents of one full run for the slides. **Re-check the model page the week of and pin the current lineup** (today: the gpt-5.6 family for text/vision/search, `gpt-image-2` for images) — a retired model name on a slide undermines the "read the model page" lesson it sits next to

## 8. Gotchas to pre-empt out loud

1. **`temperature` on reasoning models → 400** — uniform across the 5.6 family; the dial is `effort`. Show the real error body.
2. **`parse()` takes the class; `create()` takes the config dict.** Say the sentence once per part until it sticks.
3. **Strict mode refuses open contracts:** every field required, `additionalProperties: false`, optionals as null unions; no open `dict` fields. The refusal is the feature.
4. **First structured call is slow** — one-time schema compilation, cached ~24h. Don't debug the 8-second first call.
5. **Search grounding varies by prospect** — a brand with a thin web presence produces a thin USP. That's the tool telling the truth; pick capstone prospects with a real footprint (keep a shortlist for anyone stuck).
5b. **Search and structured output are two calls, not one** — combined in a single call, the citations come back empty (a long-standing API bug). Two-step is the pattern: search → findings + sources, then parse → typed object. Teach it as architecture, not as a workaround: research and typing are different stations.
6. **Supabase storage 409 on re-upload** — `file_options={"upsert": "true"}`, the *string*; set `"content-type"` or the PDF serves as `text/plain` garbage; buckets are private by default (`public: True`); `get_public_url()` never errors — it's a string-builder.
7. **White PDF** — Chromium strips backgrounds for print; `print_background=True`.
8. **Local Chromium is new** — M6's Playwright drove a remote browser; today's runs on their disk (preflight installs it), or the first `Executable doesn't exist` confuses.
9. **Costs are real but small** — a full run is seconds and cents on their own key; put the measured number on the slide, not an estimate.

## 9. Aphorisms

1. **"The model writes the words; the template owns the pixels."**
2. **"An ungrounded model fills your schema with plausible fiction."** (P3's beat)
3. **"Brand is data."** (palette as typed fields → CSS vars)
4. **"A dict is a rumor; a model instance is a fact."** (P2's beat)
5. **"The commission is only as good as the brief."** (P4's beat)

Close on three to keep: the factory line, grounded-before-generated, brand-is-data. Everything else is recoverable in an afternoon. Tease M8: "Today one form calls your endpoint. Next session it's a real app — login, chat, an agent deciding *when* to call it."

## 10. Doc set plan

- **DECK** ~32 slides: factory-line spine, concept/terminal pairs, 🤖 prompt boxes on every build, the grounded/ungrounded side-by-side as a full slide, the form moment staged; no code beyond 3 lines.
- **SPEAKER-NOTES**: timed gotcha call-outs (1, 5, 6 before the room hits them); stage directions for the two beats ("do not fix it for 90 seconds"; "stop talking at the form moment").
- **HANDOUT**: M1→M6 type-along with full code and every prompt box verbatim; the preflight; capstone spec + prospect shortlist.
- **GUIDE**: "the nine concepts between a prompt and a product" with the real logs (the 400 body, the ungrounded USP, the 409, the white PDF).
- **ANATOMY**: parts catalogue — Researcher, Contract, Painter, Template Engine, Renderer, Object Store, API Surface, Form — with the honest "what this stack does NOT give you" (no auth, no queue, no deploy — **the deployed instance (`muse-render` on Railway) is facilitator infrastructure that Module 10's MCP calls**, stated here and in M10's doc set).
- **README / TROUBLESHOOTING / starter+live**: run of show, preflight, symptom→cause→fix (blank PDF, 409, 400s, thin research), starter with cached research JSON + template skeleton + the quiet Dockerfile; live deployed-and-verified the morning of — locally.

## If you have a full day

Railway deploy done in-session by students (restores ship-every-module; the facilitator instance then becomes their reference); image *editing* via the Responses image tool (iterate on the hero with feedback); the effort ladder measured on one hard brief; a second research pass comparing search-tool citations against the prospect's own site; multi-prospect batch mode (five one-pagers from a CSV — the bridge to M6's pipelines).

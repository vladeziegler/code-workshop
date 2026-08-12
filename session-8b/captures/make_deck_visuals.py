"""Render the deck's designed visuals (HTML -> PNG). Real data, slide-legible formatting.

Patch-panel spine: the module's one drawing — sockets left, plugs right, six cables.
Each divider variant lights the cable being built (blue), keeps built ones green,
leaves future ones dim dashed. Terminal cards replace raw text dumps.
"""
from playwright.sync_api import sync_playwright
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "viz")
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- patch panel

# geometry (1x): canvas 1250x400
SOCKETS = {  # name -> (x, y, w, h, sub)
    "scout":  (70, 60, 300, 96, "the agent you build today"),
    "studio": (70, 250, 300, 96, "last week's agent — untouched"),
}
PLUGS = {  # name -> (x, y, w, h, sub)
    "curl":     (880, 28, 300, 74, "a plain HTTP request"),
    "tui":      (880, 118, 300, 74, "terminal app — no API key"),
    "local":    (880, 208, 300, 74, "web page on your laptop"),
    "console":  (880, 298, 300, 74, "web page, deployed"),
}
PLUG_LABEL = {"curl": "curl", "tui": "terminal chat", "local": "muse-console", "console": "muse-console"}
SOCK_LABEL = {"scout": "muse-scout", "studio": "muse-studio"}

# cables: id -> (socket, plug)
CABLES = {
    "c1": ("scout", "curl"),
    "c2": ("scout", "tui"),
    "c3": ("scout", "local"),
    "c4": ("scout", "console"),
    "c5": ("studio", "console"),
}

BLUE, GREEN, DIM, TXT, SUB = "#6cc7ff", "#7ee787", "#3a4350", "#c9d1d9", "#8b949e"


def _box(x, y, w, h, label, sub, state, extra=""):
    color = {"lit": BLUE, "done": GREEN, "dim": DIM}[state]
    txt = {"lit": BLUE, "done": TXT, "dim": SUB}[state]
    stroke_w = 3 if state == "lit" else 2
    s = (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#161b22" '
         f'stroke="{color}" stroke-width="{stroke_w}"/>'
         f'<text x="{x+w/2}" y="{y+h/2-6}" text-anchor="middle" fill="{txt}" '
         f'font-size="26" font-weight="bold" font-family="Menlo,monospace">{label}{extra}</text>'
         f'<text x="{x+w/2}" y="{y+h/2+26}" text-anchor="middle" fill="{SUB}" '
         f'font-size="17" font-family="Helvetica">{sub}</text>')
    return s


def _cable(cid, state, n=None):
    sx, sy, sw, sh, _ = SOCKETS[CABLES[cid][0]]
    px, py, pw, ph, _ = PLUGS[CABLES[cid][1]]
    x1, y1 = sx + sw, sy + sh / 2
    x2, y2 = px, py + ph / 2
    color = {"lit": BLUE, "done": GREEN, "dim": DIM}[state]
    width = 4 if state == "lit" else 2.5
    dash = ' stroke-dasharray="7,7"' if state == "dim" else ""
    mx = (x1 + x2) / 2
    path = (f'<path d="M {x1} {y1} C {mx} {y1}, {mx} {y2}, {x2} {y2}" fill="none" '
            f'stroke="{color}" stroke-width="{width}"{dash}/>')
    if n is not None:
        path += (f'<circle cx="{mx}" cy="{(y1+y2)/2}" r="16" fill="#0d1117" stroke="{color}" stroke-width="2"/>'
                 f'<text x="{mx}" y="{(y1+y2)/2+6}" text-anchor="middle" fill="{color}" '
                 f'font-size="18" font-weight="bold" font-family="Menlo,monospace">{n}</text>')
    return path


def panel(sock_states, cable_states, numbers=False, caption="", scout_extra=""):
    parts = ['<svg width="1250" height="400" xmlns="http://www.w3.org/2000/svg">']
    parts.append(f'<text x="70" y="34" fill="{SUB}" font-size="18" font-family="Helvetica" '
                 f'letter-spacing="2">AGENTS — DEPLOYED BEHIND A URL</text>')
    parts.append(f'<text x="1180" y="20" text-anchor="end" fill="{SUB}" font-size="18" '
                 f'font-family="Helvetica" letter-spacing="2">THINGS THAT CALL THE URL</text>')
    order = ["c1", "c2", "c3", "c4", "c5"]
    for i, cid in enumerate(order):
        parts.append(_cable(cid, cable_states.get(cid, "dim"), n=(i + 1) if numbers else None))
    # cable 6 = the re-patch: console counts twice (its second socket). mark it on c5 when numbered
    if numbers:
        parts.append(f'<text x="480" y="392" text-anchor="middle" fill="{SUB}" font-size="17" '
                     f'font-family="Helvetica">connection 6 = the same page pointed back at scout — changing one env var</text>')
    for k, (x, y, w, h, sub) in SOCKETS.items():
        extra = scout_extra if k == "scout" else ""
        parts.append(_box(x, y, w, h, SOCK_LABEL[k], sub, sock_states.get(k, "dim"), extra))
    for k, (x, y, w, h, sub) in PLUGS.items():
        st = "done" if any(cable_states.get(c) in ("lit", "done") and CABLES[c][1] == k
                           for c in CABLES) else "dim"
        if any(cable_states.get(c) == "lit" and CABLES[c][1] == k for c in CABLES):
            st = "lit"
        parts.append(_box(x, y, w, h, PLUG_LABEL[k], sub, st))
    if caption:
        parts.append(f'<text x="625" y="392" text-anchor="middle" fill="{SUB}" '
                     f'font-size="18" font-family="Helvetica">{caption}</text>')
    parts.append("</svg>")
    return ('<!DOCTYPE html><html><head><meta charset="utf-8"><style>'
            'body{margin:0;background:#0d1117;}</style></head><body>'
            + "".join(parts) + "</body></html>")


PANELS = {}
D = "dim"
PANELS["panel_map.png"] = panel(
    {"scout": "lit", "studio": "lit"},
    {c: "lit" for c in CABLES}, numbers=True,
)
PANELS["panel_s01.png"] = panel({"scout": "lit"}, {}, caption="step 01 — the agent: just code on your laptop, no server yet")
PANELS["panel_s02.png"] = panel({"scout": "lit"}, {}, scout_extra=" ⚡",
                                caption="step 02 — wrapped in an API endpoint, deployed to a URL")
PANELS["panel_s03.png"] = panel({"scout": "done"}, {"c1": "lit", "c2": "lit"},
                                caption="steps 03–04 — first callers: curl, then a terminal chat app")
PANELS["panel_s05.png"] = panel({"scout": "done"}, {"c1": "done", "c2": "done", "c3": "lit"},
                                caption="step 05 — a web page calls the same endpoint")
PANELS["panel_s06.png"] = panel({"scout": "done"}, {"c1": "done", "c2": "done", "c3": "done", "c4": "lit"},
                                caption="step 06 — the page itself goes online")
PANELS["panel_s07.png"] = panel({"scout": "lit"}, {c: "done" for c in ("c1", "c2", "c3", "c4")},
                                scout_extra=" + memory", caption="step 07 — conversations get stored on the server")
PANELS["panel_s08.png"] = panel({"scout": "lit"}, {c: "done" for c in ("c1", "c2", "c3", "c4")},
                                scout_extra=" + jobs", caption="step 08 — long jobs: reply with a job id, fetch the result later")
PANELS["panel_s09.png"] = panel({"scout": "done", "studio": "lit"},
                                {"c1": "done", "c2": "done", "c3": "done", "c4": "done", "c5": "lit"},
                                caption="steps 09–10 — same page, different agent behind the URL")
PANELS["panel_done.png"] = panel({"scout": "done", "studio": "done"},
                                 {c: "done" for c in CABLES}, numbers=True)

# ---------------------------------------------------------------- terminal cards

BASE = """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#0d1117; font-family:'SF Mono',Menlo,monospace; }
  .card { padding:34px 42px; }
  .bar { display:flex; gap:8px; margin-bottom:22px; }
  .dot { width:13px; height:13px; border-radius:50%; }
  pre { color:#c9d1d9; font-size:21px; line-height:1.65; margin:0; white-space:pre-wrap; }
  .g { color:#7ee787; } .b { color:#6cc7ff; } .y { color:#e3b341; } .r { color:#ff7b72; }
  .dim { color:#8b949e; }
</style></head><body><div class="card">
<div class="bar"><div class="dot" style="background:#ff5f57"></div>
<div class="dot" style="background:#febc2e"></div><div class="dot" style="background:#28c840"></div></div>
{BODY}</div></body></html>"""

CARDS = {}

CARDS["card_tui_local.png"] = (940, BASE.replace("{BODY}", """
<pre><span class="dim">$</span> npm run tui                     <span class="dim"># local — no server anywhere</span>

<span class="b">╭ Tool · web_search ─────────────────────────</span> <span class="y">executing</span> <span class="b">╮</span>

<span class="b">╭ Assistant ────────────────────────────────────────────╮</span>
  The <span class="b">Seattle Seahawks</span> won Super Bowl LX, defeating…
  <span class="dim">sources: nfl.com · espn.com</span>

<span class="g">✅ the tool card appeared — nobody scripted it. The agent chose.</span></pre>"""))

CARDS["card_302.png"] = (940, BASE.replace("{BODY}", """
<pre>HTTP/2 <span class="r">302</span>
<span class="y">location:</span> https://vercel.com/<span class="r">sso-api</span>?url=https%3A%2F%2Fmuse-scout-…
<span class="dim">set-cookie: _vercel_sso_nonce=…</span>

<span class="b">Your socket didn't answer — Vercel did.</span>
<span class="dim">Dashboard → Deployment Protection → off</span></pre>"""))

CARDS["card_wire.png"] = (960, BASE.replace("{BODY}", """
<pre>data: {"type":"<span class="b">start</span>"}
data: {"type":"<span class="b">reasoning-start</span>","id":"rs_0d59…"}
data: {"type":"<span class="b">tool-input-available</span>","toolName":"<span class="y">web_search</span>",…}
data: {"type":"<span class="b">text-delta</span>","id":"msg_00b7…","delta":"<span class="g">The</span>"}
data: {"type":"<span class="b">source-url</span>","url":"https://…"}
data: {"type":"<span class="b">finish</span>","finishReason":"stop"}   …   data: <span class="y">[DONE]</span>

<span class="g">✅ the whole protocol: typed parts over SSE</span></pre>"""))

CARDS["card_logs.png"] = (940, BASE.replace("{BODY}", """
<pre>15:52:39  POST /api/chat
<span class="b">[scout]</span> step 0 · {"inputTokens":<span class="y">4489</span>,…"outputTokens":<span class="y">5</span>,…} · stop
          <span class="dim">4,438 of those input tokens: cache reads — the instructions, re-sent</span>

<span class="g">✅ a production request, watched live, with its cost</span></pre>"""))

CARDS["card_memory.png"] = (940, BASE.replace("{BODY}", """
<pre>- Your name is <span class="b">Vladimir</span>.
- You prefer <span class="b">short bullet-point answers</span>.

<span class="g">✅ told to the browser — recalled by a script. Same id, same history.</span></pre>"""))

CARDS["card_ticket.png"] = (940, BASE.replace("{BODY}", """
<pre>{ "status": "<span class="g">done</span>", "kind": "<span class="b">deep_dive</span>",
  "result": "<span class="b">**Open-source LLMs — snapshot, August 5, 2026**</span> …" }

<span class="g">✅ the console's ticket card polls this same URL — one id, every surface</span></pre>"""))


CARDS["card_404.png"] = (1180, """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#0d1117; font-family:'SF Mono',Menlo,monospace; }
  .frame { margin:30px 36px; background:#161b22; border:1px solid #30363d; border-radius:12px; overflow:hidden; }
  .bar { display:flex; gap:8px; padding:14px 18px; border-bottom:1px solid #30363d; align-items:center; }
  .dot { width:13px; height:13px; border-radius:50%; }
  .addr { margin-left:14px; color:#8b949e; font-size:16px; }
  .body { padding:24px 28px; }
  .label { font-family:Helvetica; color:#8b949e; font-size:16px; margin-bottom:10px; letter-spacing:1px; }
  .banner { background:#1c1214; border:1px solid #6e2a33; border-radius:8px; padding:18px 22px; }
  pre { color:#ff7b72; font-size:19px; line-height:1.6; margin:0; white-space:pre-wrap; }
  .hl { color:#ffb4ad; font-weight:bold; }
  .dim { color:#8b949e; }
  .foot { padding:14px 28px; border-top:1px solid #30363d; color:#8b949e; font-size:17px; }
</style></head><body><div class="frame">
<div class="bar"><div class="dot" style="background:#ff5f57"></div>
<div class="dot" style="background:#febc2e"></div><div class="dot" style="background:#28c840"></div>
<div class="addr">muse-console-&lt;you&gt;.vercel.app</div></div>
<div class="body">
<div class="label">ERROR BANNER — what came back from the chat request:</div>
<div class="banner"><pre>&lt;!DOCTYPE html&gt;&lt;html lang="en"&gt;&lt;head&gt;&lt;meta charSet="utf-8"/&gt;…
&lt;title&gt;<span class="hl">404: This page could not be found.</span>&lt;/title&gt;
&lt;title&gt;<span class="hl">Muse Console</span>&lt;/title&gt;   <span class="dim">← it's the page's OWN 404</span>
<span class="dim">… 6 more KB of the page's own 404 HTML …</span></pre></div>
</div>
<div class="foot">socket: not configured</div>
</div></body></html>""")


CARDS["card_job_status.png"] = (1200, """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#0d1117; font-family:'SF Mono',Menlo,monospace; color:#c9d1d9; }
  .card { padding:30px 36px; }
  .ask { color:#8b949e; font-size:18px; margin-bottom:22px; }
  .ask b { color:#6cc7ff; }
  .row { display:flex; align-items:stretch; gap:0; }
  .panel { flex:1; background:#161b22; border:1px solid #30363d; border-radius:10px; padding:18px 20px; }
  .arrow { display:flex; flex-direction:column; justify-content:center; align-items:center;
           width:86px; color:#8b949e; font-size:15px; font-family:Helvetica; }
  .arrow .a { font-size:26px; color:#3a4350; }
  .badge { font-family:Helvetica; font-weight:bold; font-size:21px; margin-bottom:12px; }
  .q { color:#e3b341; } .r { color:#6cc7ff; } .d { color:#7ee787; }
  pre { margin:0; font-size:18px; line-height:1.55; color:#8b949e; white-space:pre-wrap; }
  pre .v { color:#c9d1d9; }
</style></head><body><div class="card">
<div class="ask">every 2 s the page asks <b>GET /api/jobs/b0fd636f-…</b> and draws what comes back:</div>
<div class="row">
<div class="panel"><div class="badge q">● queued</div>
<pre>{ "status": <span class="v">"queued"</span>,
  "kind": "deep_dive" }</pre></div>
<div class="arrow"><div class="a">→</div><div>poll again</div></div>
<div class="panel"><div class="badge r">◐ running</div>
<pre>{ "status": <span class="v">"running"</span>,
  "kind": "deep_dive" }</pre></div>
<div class="arrow"><div class="a">→</div><div>~3 min later</div></div>
<div class="panel"><div class="badge d">✓ done</div>
<pre>{ "status": <span class="v">"done"</span>,
  "result": <span class="v">"**Open-source
  LLMs — snapshot…"</span> }</pre></div>
</div>
</div></body></html>""")


CARDS["card_wrap.png"] = (1150, """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#0d1117;}</style></head><body>
<svg width="1150" height="360" xmlns="http://www.w3.org/2000/svg">
  <rect x="240" y="40" width="670" height="280" rx="14" fill="#0d1117" stroke="#3a4350" stroke-width="2" stroke-dasharray="8,6"/>
  <text x="575" y="28" text-anchor="middle" fill="#8b949e" font-size="19" font-family="Menlo,monospace">https://muse-scout-&lt;you&gt;.vercel.app/api/chat</text>
  <rect x="300" y="80" width="550" height="200" rx="12" fill="#161b22" stroke="#6cc7ff" stroke-width="2.5"/>
  <text x="575" y="115" text-anchor="middle" fill="#6cc7ff" font-size="21" font-weight="bold" font-family="Menlo,monospace">app/api/chat/route.ts</text>
  <text x="575" y="141" text-anchor="middle" fill="#8b949e" font-size="16" font-family="Helvetica">the endpoint — 3 lines</text>
  <rect x="360" y="160" width="430" height="94" rx="10" fill="#101a14" stroke="#7ee787" stroke-width="2.5"/>
  <text x="575" y="199" text-anchor="middle" fill="#7ee787" font-size="21" font-weight="bold" font-family="Menlo,monospace">lib/agent.ts</text>
  <text x="575" y="227" text-anchor="middle" fill="#8b949e" font-size="16" font-family="Helvetica">the agent — 15 lines</text>
  <line x1="60" y1="150" x2="232" y2="150" stroke="#6cc7ff" stroke-width="3"/>
  <polygon points="232,150 218,143 218,157" fill="#6cc7ff"/>
  <text x="130" y="132" text-anchor="middle" fill="#c9d1d9" font-size="17" font-family="Helvetica">request in</text>
  <line x1="232" y1="230" x2="60" y2="230" stroke="#7ee787" stroke-width="3"/>
  <polygon points="60,230 74,223 74,237" fill="#7ee787"/>
  <text x="146" y="262" text-anchor="middle" fill="#c9d1d9" font-size="17" font-family="Helvetica">response streams out</text>
  <text x="575" y="350" text-anchor="middle" fill="#8b949e" font-size="18" font-family="Helvetica">the endpoint wraps the agent — the URL is how the world reaches it</text>
</svg></body></html>""")

CARDS["card_cors.png"] = (1200, """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#0d1117; font-family:'SF Mono',Menlo,monospace; color:#c9d1d9; }
  .card { padding:28px 34px; }
  .row { display:flex; gap:0; align-items:stretch; }
  .panel { flex:1; background:#161b22; border:1px solid #30363d; border-radius:10px; padding:16px 18px; }
  .arrow { display:flex; align-items:center; justify-content:center; width:64px; color:#3a4350; font-size:26px; }
  .h { font-family:Helvetica; font-weight:bold; font-size:19px; margin-bottom:10px; }
  .h1c { color:#e3b341; } .h2c { color:#6cc7ff; } .h3c { color:#7ee787; }
  pre { margin:0; font-size:17px; line-height:1.55; color:#8b949e; white-space:pre-wrap; }
  pre .v { color:#c9d1d9; }
</style></head><body><div class="card">
<div class="row">
<div class="panel"><div class="h h1c">1 · the browser asks first</div>
<pre>OPTIONS /api/chat
Origin: <span class="v">http://localhost:3001</span>
<span class="v">"is this website allowed?"</span></pre></div>
<div class="arrow">→</div>
<div class="panel"><div class="h h2c">2 · the server answers</div>
<pre>HTTP/2 204
access-control-allow-origin: <span class="v">*</span>
<span class="v">"yes — go ahead"</span></pre></div>
<div class="arrow">→</div>
<div class="panel"><div class="h h3c">3 · the real request flows</div>
<pre>POST /api/chat
<span class="v">data: {"type":"text-delta"…</span>
<span class="v">tokens stream into the page</span></pre></div>
</div>
</div></body></html>""")


CARDS["card_urls.png"] = (1250, """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#0d1117;}</style></head><body>
<svg width="1250" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="90" width="400" height="120" rx="12" fill="#161b22" stroke="#e3b341" stroke-width="2.5"/>
  <text x="240" y="130" text-anchor="middle" fill="#e3b341" font-size="22" font-weight="bold" font-family="Menlo,monospace">muse-console</text>
  <text x="240" y="158" text-anchor="middle" fill="#c9d1d9" font-size="17" font-family="Menlo,monospace">muse-console-&lt;you&gt;.vercel.app</text>
  <text x="240" y="184" text-anchor="middle" fill="#8b949e" font-size="16" font-family="Helvetica">the page — what customers open</text>
  <rect x="810" y="90" width="400" height="120" rx="12" fill="#161b22" stroke="#6cc7ff" stroke-width="2.5"/>
  <text x="1010" y="130" text-anchor="middle" fill="#6cc7ff" font-size="22" font-weight="bold" font-family="Menlo,monospace">muse-scout</text>
  <text x="1010" y="158" text-anchor="middle" fill="#c9d1d9" font-size="17" font-family="Menlo,monospace">muse-scout-&lt;you&gt;.vercel.app</text>
  <text x="1010" y="184" text-anchor="middle" fill="#8b949e" font-size="16" font-family="Helvetica">the agent behind /api/chat — holds the key</text>
  <line x1="440" y1="130" x2="802" y2="130" stroke="#7ee787" stroke-width="3"/>
  <polygon points="802,130 788,123 788,137" fill="#7ee787"/>
  <text x="622" y="112" text-anchor="middle" fill="#7ee787" font-size="17" font-family="Menlo,monospace">fetch(NEXT_PUBLIC_SCOUT_URL + "/api/chat")</text>
  <line x1="802" y1="176" x2="440" y2="176" stroke="#6cc7ff" stroke-width="3" stroke-dasharray="2,4"/>
  <polygon points="440,176 454,169 454,183" fill="#6cc7ff"/>
  <text x="622" y="202" text-anchor="middle" fill="#8b949e" font-size="16" font-family="Helvetica">the answer streams back, event by event</text>
  <rect x="810" y="270" width="400" height="80" rx="12" fill="#0d1117" stroke="#3a4350" stroke-width="2" stroke-dasharray="7,6"/>
  <text x="1010" y="303" text-anchor="middle" fill="#8b949e" font-size="19" font-family="Menlo,monospace">muse-studio (step 09)</text>
  <text x="1010" y="330" text-anchor="middle" fill="#8b949e" font-size="15" font-family="Helvetica">…or any other agent URL</text>
  <path d="M 340 210 C 340 310, 700 310, 802 310" fill="none" stroke="#3a4350" stroke-width="2.5" stroke-dasharray="7,6"/>
  <polygon points="802,310 788,303 788,317" fill="#3a4350"/>
  <text x="520" y="345" text-anchor="middle" fill="#8b949e" font-size="16" font-family="Helvetica">change the env var → same page, different agent</text>
  <text x="625" y="34" text-anchor="middle" fill="#c9d1d9" font-size="19" font-family="Helvetica">two separate deployments — connected by ONE value: a URL in an env var</text>
</svg></body></html>""")


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, html in PANELS.items():
            path = os.path.join(OUT, "_tmp.html")
            open(path, "w").write(html)
            pg = b.new_page(viewport={"width": 1250, "height": 400}, device_scale_factor=2)
            pg.goto("file://" + path); pg.wait_for_timeout(200)
            pg.screenshot(path=os.path.join(OUT, name))
            pg.close()
            print("rendered", name)
        for name, (width, html) in CARDS.items():
            path = os.path.join(OUT, "_tmp.html")
            open(path, "w").write(html)
            pg = b.new_page(viewport={"width": width, "height": 400}, device_scale_factor=2)
            pg.goto("file://" + path); pg.wait_for_timeout(200)
            pg.screenshot(path=os.path.join(OUT, name), full_page=True)
            pg.close()
            print("rendered", name)
        b.close()
    os.remove(os.path.join(OUT, "_tmp.html"))


if __name__ == "__main__":
    main()

"""Render the deck's designed visuals (HTML -> PNG). Real data, slide-legible formatting."""
from playwright.sync_api import sync_playwright
import os

BASE = """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#0d1117; font-family:'SF Mono',Menlo,monospace; }
  .card { padding:34px 42px; }
  .bar { display:flex; gap:8px; margin-bottom:22px; }
  .dot { width:13px; height:13px; border-radius:50%; }
  pre { color:#c9d1d9; font-size:21px; line-height:1.65; margin:0; white-space:pre-wrap; }
  .g { color:#7ee787; } .b { color:#6cc7ff; } .y { color:#e3b341; } .dim { color:#8b949e; }
  .sans { font-family:Helvetica,Arial,sans-serif; }
</style></head><body><div class="card">
<div class="bar"><div class="dot" style="background:#ff5f57"></div>
<div class="dot" style="background:#febc2e"></div><div class="dot" style="background:#28c840"></div></div>
{BODY}</div></body></html>"""

VISUALS = {}

VISUALS["terminal_models.png"] = (920, BASE.replace("{BODY}", """
<pre><span class="dim">$</span> python s1_models.py

<span class="b">same brief, three models</span> — usage from the API:

  gpt-5.6-luna    out=<span class="y"> 97</span> tokens  <span class="dim">(60 reasoning)</span>   $1 / $6 per 1M
  gpt-5.6-sol     out=<span class="y"> 78</span> tokens  <span class="dim">(46 reasoning)</span>   $5 / $30
  gpt-5.6-terra   out=<span class="y"> 33</span> tokens  <span class="dim">( 0 reasoning)</span>   $2.50 / $15

<span class="g">✅ three rows — the price/quality tradeoff, measured</span></pre>"""))

VISUALS["terminal_compose.png"] = (960, BASE.replace("{BODY}", """
<pre><span class="dim">$</span> python compose.py Aritzia

<span class="b">web_search</span> · 4 searches
<span class="b">parsed</span>   → OnePager

headline : <span class="y">Put Everyday Luxury™ in NYC circulation.</span>
palette  : ['#1a1a1a', '#f5f2ee', '#8a8378']
bullets  : Aritzia has a dense Manhattan footprint — Hudson Yards,
           Flatiron Flagship, SoHo Flagship, Fifth Ave Flagship…
sources  : aritzia.com/us/en/store-locator  <span class="dim">+2 more</span>

<span class="g">✅ typed object — facts, look, and receipts in one call</span></pre>"""))

VISUALS["compare_grounded.png"] = (1180, """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#0d1117; font-family:Helvetica,Arial,sans-serif; padding:36px; }
  .row { display:flex; gap:26px; }
  .col { flex:1; border-radius:12px; padding:28px 30px; }
  .bad  { background:#1c1214; border:1px solid #6e2a33; }
  .good { background:#101a14; border:1px solid #2a6e42; }
  h3 { margin:0 0 6px; font-size:20px; letter-spacing:1px; text-transform:uppercase; }
  .bad h3 { color:#ff7b72; } .good h3 { color:#7ee787; }
  .sub { color:#8b949e; font-size:15px; margin-bottom:18px; }
  li { color:#c9d1d9; font-size:17.5px; line-height:1.5; margin-bottom:13px; }
  .src { color:#6cc7ff; font-size:14px; margin-top:14px; }
</style></head><body><div class="row">
<div class="col bad"><h3>✗ Without research</h3><div class="sub">no findings in the prompt</div><ul>
<li>"Founded in Los Angeles in 2009, Reformation has built its identity around lower-impact fashion…"</li>
<li>"Feminine, vintage-inspired silhouettes New Yorkers want access to…"</li>
<li>Fluent. Plausible. <b>Could be any pitch, to anyone.</b></li></ul>
<div class="src">sources: none</div></div>
<div class="col good"><h3>✓ With research</h3><div class="sub">s3_research.py findings pasted in</div><ul>
<li>"<b>Six NYC stores</b> across NoHo, Flatiron, Lower East Side, SoHo, UES, Williamsburg…"</li>
<li>"<b>Happy Endings</b> supports care, repair, resale and recycling…"</li>
<li>"January 2026 <b>'Circular by 2030'</b> framework prioritizes repair and pass-on…"</li></ul>
<div class="src">sources: thereformation.com/stores/… (+15 more, clickable)</div></div>
</div></body></html>""")

VISUALS["wireframe.png"] = (1150, """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#0d1117; font-family:Helvetica,Arial,sans-serif; padding:34px; }
  .wrap { display:flex; gap:44px; align-items:center; }
  .schema { font-family:Menlo,monospace; font-size:19px; line-height:2.15; color:#c9d1d9; }
  .schema b { color:#6cc7ff; }
  .page { width:390px; background:#f5f2ee; border-radius:8px; padding:18px; }
  .slot { border:2px dashed #8a8378; border-radius:6px; color:#4a463f; font-size:15px;
          display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
  .h1s { height:64px; font-size:21px; font-weight:bold; }
  .img { height:150px; background:#e4dfd6; }
  .two { display:flex; gap:10px; }
  .why { flex:1.4; height:130px; } .cta { flex:1; height:130px; }
  .arrow { color:#6cc7ff; font-size:30px; }
</style></head><body><div class="wrap">
<div class="schema">class <b>OnePager</b>:<br>
&nbsp;&nbsp;headline &nbsp;<span style="color:#8b949e"># the h1</span><br>
&nbsp;&nbsp;hero &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#8b949e"># the image</span><br>
&nbsp;&nbsp;why_us &nbsp;&nbsp;&nbsp;<span style="color:#8b949e"># 3 bullets</span><br>
&nbsp;&nbsp;cta &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#8b949e"># the ask</span><br>
&nbsp;&nbsp;brand &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#8b949e"># colors →</span><br>
&nbsp;&nbsp;sources &nbsp;&nbsp;<span style="color:#8b949e"># receipts</span></div>
<div class="arrow">⟶</div>
<div class="page">
  <div class="slot h1s">headline</div>
  <div class="slot img">hero image</div>
  <div class="two"><div class="slot why">why us<br>· · ·</div><div class="slot cta">CTA</div></div>
</div></div></body></html>""")

VISUALS["factory_line.png"] = (1250, """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#0d1117; font-family:Helvetica,Arial,sans-serif; padding:44px 30px; }
  .line { display:flex; align-items:center; justify-content:center; gap:10px; }
  .st { border:1.5px solid #34435a; border-radius:10px; color:#aeb8c6; padding:14px 16px;
        font-size:16.5px; letter-spacing:1px; text-align:center; }
  .model { border-color:#6cc7ff; color:#6cc7ff; }
  .arr { color:#4a5a72; font-size:20px; }
  .cap { text-align:center; color:#8b949e; font-size:16px; margin-top:26px; }
  .cap b { color:#6cc7ff; }
</style></head><body>
<div class="line">
  <div class="st model">RESEARCH<br><span style="font-size:12px">web search</span></div><div class="arr">→</div>
  <div class="st model">OBJECT<br><span style="font-size:12px">typed fields</span></div><div class="arr">→</div>
  <div class="st model">IMAGE<br><span style="font-size:12px">commissioned</span></div><div class="arr">→</div>
  <div class="st">TEMPLATE<br><span style="font-size:12px">4 slots</span></div><div class="arr">→</div>
  <div class="st">PDF<br><span style="font-size:12px">print</span></div><div class="arr">→</div>
  <div class="st">STORE<br><span style="font-size:12px">bucket + table</span></div><div class="arr">→</div>
  <div class="st">SERVE<br><span style="font-size:12px">endpoint + form</span></div>
</div>
<div class="cap"><b>blue = the model works</b> &nbsp;·&nbsp; grey = your code — same result on run #1 and run #500</div>
</body></html>""")

os.makedirs("../images", exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (width, html) in VISUALS.items():
        open("_tmp.html", "w").write(html)
        pg = b.new_page(viewport={"width": width, "height": 400}, device_scale_factor=2)
        pg.goto("file://" + os.path.abspath("_tmp.html"))
        pg.wait_for_timeout(250)
        pg.screenshot(path=f"../images/{name}", full_page=True)
        pg.close()
        print("made", name)
    b.close()
os.remove("_tmp.html")

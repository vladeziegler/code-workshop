"""Second batch of designed visuals: the vision-flow diagram + template-mapping card."""
from playwright.sync_api import sync_playwright
import os, base64

home_b64 = base64.b64encode(open("prospect_home.png", "rb").read()).decode()
page_b64 = base64.b64encode(open("onepager_preview.png", "rb").read()).decode()

VISUALS = {}

# How "their look" works: homepage -> input_image -> palette -> CSS vars
VISUALS["look_flow.png"] = (1250, f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body {{ margin:0; background:#0d1117; font-family:Helvetica,Arial,sans-serif; padding:30px; }}
  .row {{ display:flex; align-items:center; justify-content:center; gap:18px; }}
  .step {{ text-align:center; }}
  .cap {{ color:#8b949e; font-size:14.5px; margin-top:10px; max-width:240px; }}
  .cap b {{ color:#6cc7ff; }}
  img.shot {{ height:250px; border-radius:8px; border:1px solid #30363d; }}
  .arr {{ color:#4a5a72; font-size:30px; }}
  .chips {{ display:flex; flex-direction:column; gap:8px; }}
  .chip {{ width:120px; height:34px; border-radius:6px; border:1px solid #30363d;
           font-family:Menlo,monospace; font-size:13px; display:flex; align-items:center;
           justify-content:center; }}
</style></head><body><div class="row">
  <div class="step"><img class="shot" src="data:image/png;base64,{home_b64}">
    <div class="cap"><b>1.</b> Playwright screenshots their homepage</div></div>
  <div class="arr">→</div>
  <div class="step">
    <div style="font-family:Menlo,monospace;color:#c9d1d9;font-size:15px;background:#161b22;
                border:1px solid #30363d;border-radius:8px;padding:16px 18px;text-align:left">
      {{"type": "input_image",<br>&nbsp;"image_url": "data:…base64…"}}</div>
    <div class="cap"><b>2.</b> the screenshot goes <b>into the API call</b> as an image parameter</div></div>
  <div class="arr">→</div>
  <div class="step"><div class="chips">
      <div class="chip" style="background:#000;color:#fff">#000000</div>
      <div class="chip" style="background:#fff;color:#000">#ffffff</div>
      <div class="chip" style="background:#7b7b7b;color:#fff">#7b7b7b</div></div>
    <div class="cap"><b>3.</b> the model returns the palette it <b>saw</b> — as typed fields</div></div>
  <div class="arr">→</div>
  <div class="step"><img class="shot" src="data:image/png;base64,{page_b64}">
    <div class="cap"><b>4.</b> those hexes become the page's <b>CSS variables</b> (Part 5)</div></div>
</div></body></html>""")

# Object -> template mapping, code level
VISUALS["template_mapping.png"] = (1210, """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin:0; background:#0d1117; font-family:Menlo,monospace; padding:30px; }
  .row { display:flex; gap:22px; align-items:stretch; justify-content:center; }
  .col { background:#161b22; border:1px solid #30363d; border-radius:10px; padding:22px 26px;
         font-size:17.5px; line-height:1.9; color:#c9d1d9; }
  .h { font-family:Helvetica,Arial,sans-serif; font-size:14px; letter-spacing:2px;
       text-transform:uppercase; color:#6cc7ff; margin-bottom:12px; }
  .b { color:#6cc7ff; } .y { color:#e3b341; } .dim { color:#8b949e; }
  .mid { display:flex; flex-direction:column; justify-content:space-around;
         color:#4a5a72; font-size:24px; padding:40px 0; }
</style></head><body><div class="row">
<div class="col"><div class="h">the parsed object</div>
op.<span class="b">headline</span><br>
op.<span class="b">hero</span>  <span class="dim">→ hero.png (Part 4)</span><br>
op.<span class="b">why_us</span>.bullets<br>
op.<span class="b">cta</span>.line, .action<br>
op.<span class="b">brand</span>.palette</div>
<div class="mid"><div>⟶</div><div>⟶</div><div>⟶</div><div>⟶</div><div>⟶</div></div>
<div class="col"><div class="h">template.html</div>
&lt;h1&gt;<span class="y">{{ headline }}</span>&lt;/h1&gt;<br>
&lt;img src="<span class="y">{{ hero_src }}</span>"&gt;<br>
<span class="y">{% for b in bullets %}</span>&lt;li&gt;<span class="y">{{ b }}</span>&lt;/li&gt;<span class="y">{% endfor %}</span><br>
&lt;p&gt;<span class="y">{{ cta_line }}</span>&lt;/p&gt;&lt;button&gt;<span class="y">{{ cta_action }}</span>&lt;/button&gt;<br>
:root { --ink: <span class="y">{{ palette_ink }}</span>; --bg: <span class="y">{{ palette_bg }}</span>; }</div>
</div></body></html>""")

with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (width, html) in VISUALS.items():
        open("_tmp.html", "w").write(html)
        pg = b.new_page(viewport={"width": width, "height": 420}, device_scale_factor=2)
        pg.goto("file://" + os.path.abspath("_tmp.html"))
        pg.wait_for_timeout(300)
        pg.screenshot(path=f"../images/{name}", full_page=True)
        pg.close(); print("made", name)
    b.close()
os.remove("_tmp.html")

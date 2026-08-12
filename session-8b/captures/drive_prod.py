"""Drive the DEPLOYED console. Usage: drive_prod.py <url> <outfile-prefix> [message]"""
import sys
from playwright.sync_api import sync_playwright

url, prefix = sys.argv[1], sys.argv[2]
msg = sys.argv[3] if len(sys.argv) > 3 else None
errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    page.goto(url)
    page.wait_for_timeout(2000)
    if msg:
        page.fill("textarea", msg)
        page.keyboard.press("Enter")
        page.wait_for_timeout(8000)
        page.screenshot(path=f"{prefix}-mid.png")
        page.wait_for_timeout(35000)
    page.screenshot(path=f"{prefix}.png")
    # what URL did the bundle inline?
    inlined = page.evaluate("() => (window.__NEXT_DATA__, null)")
    b.close()
print(f"saved {prefix}.png")
for e in errors[:8]:
    print(e[:300])

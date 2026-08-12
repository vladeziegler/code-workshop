"""Drive muse-console through a scenario and capture screenshots + console errors.

Usage: python3 drive_ui.py <scenario> [message]
Scenarios:
  cors     — submit a message, expect the CORS block, capture error + screenshot
  chat     — submit a message, wait for streamed answer, capture mid + final
  empty    — just screenshot the empty state
"""
import sys, time, json
from playwright.sync_api import sync_playwright

OUT = "."
URL = "http://localhost:3001"
scenario = sys.argv[1] if len(sys.argv) > 1 else "chat"
msg = sys.argv[2] if len(sys.argv) > 2 else "What happened in AI this week? Keep it to three bullets."

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
    page.goto(URL)
    page.wait_for_timeout(1500)

    if scenario == "empty":
        page.screenshot(path=f"{OUT}/ui-empty.png")
        print("saved ui-empty.png")
    else:
        page.fill("textarea", msg)
        page.screenshot(path=f"{OUT}/ui-typed.png")
        page.keyboard.press("Enter")
        if scenario == "cors":
            page.wait_for_timeout(4000)
            page.screenshot(path=f"{OUT}/ui-cors-blocked.png")
            print("saved ui-cors-blocked.png")
        else:
            page.wait_for_timeout(6000)
            page.screenshot(path=f"{OUT}/ui-streaming.png")
            page.wait_for_timeout(30000)
            page.screenshot(path=f"{OUT}/ui-final.png", full_page=False)
            print("saved ui-streaming.png ui-final.png")
    b.close()

print("--- console errors/warnings ---")
for e in errors:
    print(e[:400])

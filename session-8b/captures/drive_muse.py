import time
from playwright.sync_api import sync_playwright

MSG = "Put together a launch campaign kit for Muse's spring collab with a premium womenswear label — research the market first."
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    page.goto("http://localhost:3001")
    page.wait_for_timeout(1500)
    page.fill("textarea", MSG)
    page.keyboard.press("Enter")
    # stage rail should appear while create_brief runs
    try:
        page.wait_for_selector(".stage", timeout=90000)
        page.wait_for_timeout(2500)
        page.screenshot(path="step09-stages-running.png")
        print("STAGES_VISIBLE")
    except Exception:
        page.screenshot(path="step09-no-stages.png")
        print("NO_STAGES_YET")
    # let the full turn finish
    page.wait_for_timeout(75000)
    page.screenshot(path="step09-muse-final.png", full_page=True)
    stages = page.locator(".stage").count()
    tools = page.locator(".tool").count()
    print(f"stages={stages} tools={tools}")
    b.close()

from playwright.sync_api import sync_playwright
errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1440, "height": 900})
    page.on("console", lambda m: errors.append(f"[{m.type}] {m.text[:250]}") if m.type == "error" else None)
    page.goto("http://localhost:3001")
    page.wait_for_timeout(1500)
    page.fill("textarea", "Hi, my name is Repro. What is 2+2?")
    page.keyboard.press("Enter")
    page.wait_for_timeout(20000)
    page.fill("textarea", "What did I say my name was?")
    page.keyboard.press("Enter")
    page.wait_for_timeout(20000)
    page.screenshot(path="repro-followup.png")
    banner = page.locator(".err-banner")
    print("ERROR_BANNER:", banner.inner_text() if banner.count() else "(none)")
    b.close()
for e in errors: print(e)

from playwright.sync_api import sync_playwright
MSG = "Put together a launch campaign kit for Muse's spring collab with a premium womenswear label — research the market first."
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    page.goto("https://muse-console-vladimirdeziegler-gmailcoms-projects.vercel.app")
    page.wait_for_timeout(2000)
    page.fill("textarea", MSG)
    page.keyboard.press("Enter")
    page.wait_for_selector(".tool", timeout=90000)
    page.wait_for_timeout(60000)
    page.wait_for_timeout(30000)
    page.screenshot(path="step10-prod-muse.png", full_page=True)
    print("tools:", page.locator(".tool").count(), "tickets:", page.locator(".ticket").count())
    b.close()

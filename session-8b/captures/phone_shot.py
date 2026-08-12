from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True)
    page.goto("https://muse-console-vladimirdeziegler-gmailcoms-projects.vercel.app")
    page.wait_for_timeout(2000)
    page.fill("textarea", "What is the newest Claude model? One line with a source.")
    page.keyboard.press("Enter")
    page.wait_for_timeout(25000)
    page.screenshot(path="step06-phone.png")
    print("saved step06-phone.png")
    b.close()

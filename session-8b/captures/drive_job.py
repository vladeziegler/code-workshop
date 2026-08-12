import sys, re, time
from playwright.sync_api import sync_playwright

url = "https://muse-console-vladimirdeziegler-gmailcoms-projects.vercel.app"
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    page.goto(url)
    page.wait_for_timeout(2000)
    page.fill("textarea", "Do a deep dive on the current state of open-source LLMs.")
    page.keyboard.press("Enter")
    # wait for the ticket to render
    page.wait_for_selector(".ticket", timeout=60000)
    page.wait_for_timeout(1500)
    page.screenshot(path="step08-ticket-queued.png")
    ticket_id = page.locator(".ticket-id").first.inner_text()
    print("JOB_ID:", ticket_id)
    # wait for done badge (up to 3 min)
    try:
        page.wait_for_selector(".ticket-badge.done", timeout=180000)
        page.wait_for_timeout(800)
        page.screenshot(path="step08-ticket-done.png", full_page=True)
        print("TICKET_DONE")
    except Exception as e:
        page.screenshot(path="step08-ticket-timeout.png")
        print("TIMEOUT waiting for done:", page.locator(".ticket-badge").first.inner_text())
    b.close()

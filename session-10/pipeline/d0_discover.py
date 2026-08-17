#!/usr/bin/env python3
"""Station 0 throwaway: is Gmail connected, what's the fetch slug, which version to pin."""
import json
import os

import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
from composio import Composio  # noqa: E402

USER_ID = os.environ["COMPOSIO_USER_ID"]
API_KEY = os.environ["COMPOSIO_API_KEY"]
composio = Composio()

# 1. Connected accounts for our user — is gmail among them?
try:
    accounts = composio.connected_accounts.list(user_ids=[USER_ID])
    items = getattr(accounts, "items", accounts) or []
    print("connected toolkits for", USER_ID, ":")
    for a in items:
        tk = getattr(getattr(a, "toolkit", None), "slug", None) or getattr(a, "toolkit_slug", "?")
        print("  -", tk, "· status:", getattr(a, "status", "?"))
except Exception as e:
    print("connected_accounts.list failed:", type(e).__name__, str(e)[:200])

# 2. Gmail tools — find fetch/read slugs (REST, most reliable for listing)
r = requests.get(
    "https://backend.composio.dev/api/v3/tools",
    params={"toolkit_slug": "gmail", "limit": 50},
    headers={"x-api-key": API_KEY},
    timeout=30,
)
r.raise_for_status()
tools = r.json().get("items", [])
print(f"\ngmail tools ({len(tools)}):")
for t in tools:
    slug = t.get("slug", "?")
    if any(k in slug for k in ("FETCH", "LIST", "GET", "READ", "SEARCH")):
        print("  *", slug, "—", (t.get("description") or "")[:80])

# 3. Toolkit versions (manual execute rejects "latest")
r2 = requests.get(
    "https://backend.composio.dev/api/v3/toolkits/gmail",
    headers={"x-api-key": API_KEY},
    timeout=30,
)
if r2.ok:
    tk = r2.json()
    versions = tk.get("available_versions") or tk.get("versions") or "?"
    print("\ngmail toolkit versions:", versions)
else:
    print("\ntoolkit endpoint:", r2.status_code, r2.text[:200])

#!/usr/bin/env python3
"""Station 0: connect Gmail for the workshop user. Prints the consent URL; --wait blocks
until the connection is approved."""
import os
import sys

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
from composio import Composio  # noqa: E402

USER_ID = os.environ["COMPOSIO_USER_ID"]
GMAIL_AUTH_CONFIG = "ac_yezQE1VgSGZ6"
composio = Composio()

request = composio.connected_accounts.link(user_id=USER_ID, auth_config_id=GMAIL_AUTH_CONFIG)
print("OPEN THIS URL AND APPROVE GMAIL ACCESS:")
print(request.redirect_url, flush=True)

if "--wait" in sys.argv:
    account = composio.connected_accounts.wait_for_connection(id=request.id, timeout=600)
    print("connected:", getattr(account, "status", "ACTIVE"))

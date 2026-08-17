"""p1 — fetch inquiry emails from Gmail via Composio.

Output: out/p1_emails.json — a list of {subject, sender, body}.
Classroom fallback if Gmail is unreachable: cp seed/emails.json out/p1_emails.json
"""
import json
import os

from dotenv import load_dotenv

HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(HERE, "..", ".env"))
from composio import Composio  # noqa: E402

USER_ID = os.environ["COMPOSIO_USER_ID"]
GMAIL_VERSION = "20260815_00"  # manual execute rejects "latest" — pin it
QUERY = "in:inbox newer_than:7d"  # everything recent; p2 decides what's actually an inquiry

composio = Composio()


def _data(result) -> dict:
    """Composio does not raise on tool failure — check before reading."""
    result = result if isinstance(result, dict) else result.model_dump()
    if not result.get("successful", True):
        raise RuntimeError(f"composio tool failed: {result.get('error')}")
    return result.get("data") or {}


def _body_text(msg: dict) -> str:
    """Take the plain-text body wherever this payload shape put it."""
    for key in ("messageText", "message_text", "body", "snippet"):
        if isinstance(msg.get(key), str) and msg[key].strip():
            return msg[key]
    payload = msg.get("payload") or {}
    if isinstance(payload, dict):
        parts = payload.get("parts") or [payload]
        for part in parts:
            body = (part or {}).get("body") or {}
            if isinstance(body.get("data"), str):
                import base64

                return base64.urlsafe_b64decode(body["data"] + "==").decode("utf-8", "replace")
    return ""


def main() -> list[dict]:
    result = composio.tools.execute(
        "GMAIL_FETCH_EMAILS",
        arguments={"query": QUERY, "max_results": 10, "include_payload": True},
        user_id=USER_ID,
        version=GMAIL_VERSION,
    )
    data = _data(result)
    messages = data.get("messages") or data.get("emails") or []
    emails = []
    for m in messages:
        emails.append(
            {
                "subject": m.get("subject") or m.get("preview", {}).get("subject", ""),
                "sender": m.get("sender") or m.get("from", ""),
                "body": _body_text(m),
            }
        )
    emails = [e for e in emails if e["body"].strip()]
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    out = os.path.join(HERE, "out", "p1_emails.json")
    json.dump(emails, open(out, "w"), indent=2)
    print(f"p1: fetched {len(emails)} emails -> {out}")
    return emails


if __name__ == "__main__":
    main()

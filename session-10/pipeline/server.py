"""The pipeline as a webhook service (deployed on Railway).

Composio watches the Gmail inbox and POSTs every new message here. We answer 200
immediately and qualify the lead in the background — ack fast, work slow. The batch
path (run.py) still exists; this is the same pipeline, event-driven.
"""
import os
import threading

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

import p2_extract  # noqa: E402
import p3_research  # noqa: E402
import p4_decide_store  # noqa: E402

app = FastAPI()
SECRET = os.environ["TRIGGER_SECRET"]
seen_ids: set[str] = set()  # skip duplicate deliveries within this process


def find_payload(body: dict) -> dict:
    """The event envelope varies; the message payload is wherever 'subject' lives."""
    if "subject" in body:
        return body
    for key in ("data", "payload", "event"):
        inner = body.get(key)
        if isinstance(inner, dict):
            found = find_payload(inner)
            if found:
                return found
    return {}


def process(email: dict) -> None:
    lead = p2_extract.extract(email)
    if not lead.is_event_inquiry:
        print(f"skipped '{email['subject'][:50]}' — not an inquiry", flush=True)
        return
    lead_d = lead.model_dump()
    research = p3_research.research(lead_d).model_dump()
    decision = p4_decide_store.decide(lead_d, research)
    p4_decide_store.store(lead_d, research, decision)
    p4_decide_store.ping_webhook(lead_d, decision)
    print(f"qualified {lead.company or '?'} -> {decision.response}", flush=True)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/webhook/email")
async def webhook_email(request: Request, key: str = ""):
    if key != SECRET:
        raise HTTPException(status_code=401, detail="bad key")
    body = await request.json()
    payload = find_payload(body)
    if not payload:
        print("webhook: no message payload in event, ignoring", flush=True)
        return {"ok": True, "note": "no payload"}
    msg_id = str(payload.get("message_id") or payload.get("id") or "")
    if msg_id and msg_id in seen_ids:
        return {"ok": True, "note": "duplicate"}
    if msg_id:
        seen_ids.add(msg_id)
    email = {
        "subject": payload.get("subject") or "",
        "sender": payload.get("sender") or "",
        "body": payload.get("message_text") or payload.get("preview", {}).get("body", "") or "",
    }
    threading.Thread(target=process, args=(email,), daemon=True).start()
    return {"ok": True}

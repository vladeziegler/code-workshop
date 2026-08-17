"""p2 — turn each messy email into a structured Lead.

Claude reads the whole email — body AND sender — and fills the Lead model from wherever
the information lives. Missing stays null; nothing is guessed.
Output: out/p2_leads.json
"""
import json
import os

from dotenv import load_dotenv

HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(HERE, "..", ".env"))

import anthropic  # noqa: E402

from models import Lead  # noqa: E402

MODEL = "claude-sonnet-5"
client = anthropic.Anthropic()

PROMPT = """Here is an inquiry email received by a live-music events company.

Subject: {subject}
Sender: {sender}
Body:
{body}

Pull out the contact and the request from wherever they appear — the signature, the body
text, or the sender field. If a piece of information is not in the email, leave the field
null. Do not guess. For domain: if the contact's email address is present, the domain is
whatever follows the @ (unless it's a generic provider like gmail/outlook — then null
unless the company's own domain is stated)."""


def extract(email: dict) -> Lead:
    content = PROMPT.format(
        subject=email.get("subject", ""),
        sender=email.get("sender", "(not recorded)"),
        body=email.get("body", ""),
    )
    message = client.messages.parse(
        model=MODEL,
        max_tokens=1000,
        messages=[{"role": "user", "content": content}],
        output_format=Lead,
    )
    return message.parsed_output


def main() -> list[dict]:
    emails = json.load(open(os.path.join(HERE, "out", "p1_emails.json")))
    leads = []
    for e in emails:
        lead = extract(e)
        if not lead.is_event_inquiry:
            print(f"p2: skipped '{e.get('subject', '?')[:50]}' — not an inquiry")
            continue
        leads.append(lead.model_dump())
        print(f"p2: {lead.company or '?'} — {lead.full_name or '?'} <{lead.email or '?'}> — {lead.request[:60]}")
    out = os.path.join(HERE, "out", "p2_leads.json")
    json.dump(leads, open(out, "w"), indent=2)
    print(f"p2: {len(leads)} leads -> {out}")
    return leads


if __name__ == "__main__":
    main()

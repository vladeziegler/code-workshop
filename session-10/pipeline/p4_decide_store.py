"""p4 — make the call and land it.

Claude turns each lead + research into a Decision, everything is upserted into Supabase
(the single source of truth), and the app gets a webhook ping per decision — a courtesy
notification that writes nothing and is allowed to fail.
"""
import json
import os

import requests
from dotenv import load_dotenv

HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(HERE, "..", ".env"))

import anthropic  # noqa: E402
from supabase import create_client  # noqa: E402

from models import Decision  # noqa: E402

MODEL = "claude-sonnet-5"
client = anthropic.Anthropic()
sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

RUBRIC = """You qualify inbound leads for a premium live-music events company (weddings
and corporate events, typical engagements start around $50k).

The lead:
{lead}

The research:
{research}

Decide, using this rubric exactly:
- Confirm: lead_quality >= 4 AND an explicit budget AND concrete dates.
- Escalate: lead_quality >= 3 but budget or dates are missing, or more than 250 attendees.
- Reject: lead_quality <= 2 (small budgets far below the entry price, no premium signals).

lead_quality (1-5) weighs: company size and US presence, premium expectation, stated
budget vs the entry price. est_budget is your estimate as a range in text; "unknown" if
you can't estimate. Keep reasoning to two plain sentences."""


def decide(lead: dict, research: dict) -> Decision:
    message = client.messages.parse(
        model=MODEL,
        max_tokens=800,
        messages=[{
            "role": "user",
            "content": RUBRIC.format(lead=json.dumps(lead), research=json.dumps(research)),
        }],
        output_format=Decision,
    )
    return message.parsed_output


def domain_for(lead: dict) -> str:
    """The account's natural key. Falls back to the company name, slugified."""
    if lead.get("domain"):
        return lead["domain"].lower()
    if lead.get("email") and "@" in lead["email"]:
        return lead["email"].split("@", 1)[1].lower()
    return (lead.get("company") or "unknown").lower().replace(" ", "-") + ".unknown"


def store(lead: dict, research: dict, decision: Decision) -> None:
    domain = domain_for(lead)
    account = sb.table("aria_account").upsert(
        {
            "domain": domain,
            "name": lead.get("company"),
            "employees_count": research.get("employees_count"),
            "us_based": research.get("us_based"),
            "premium_score": research.get("premium_score"),
            "lead_quality": decision.lead_quality,
            "est_budget": decision.est_budget,
            "response": decision.response,
        },
        on_conflict="domain",
    ).execute()
    account_id = account.data[0]["id"]

    if lead.get("email"):
        sb.table("aria_people").upsert(
            {
                "account_id": account_id,
                "email": lead["email"].lower(),
                "full_name": lead.get("full_name"),
                "role": lead.get("role"),
                "request": lead.get("request"),
            },
            on_conflict="email",
        ).execute()

    sb.table("aria_news").delete().eq("account_id", account_id).execute()
    for f in research.get("facts", []):
        sb.table("aria_news").insert(
            {"account_id": account_id, "fact": f["fact"], "source_url": f.get("source_url")}
        ).execute()


def ping_webhook(lead: dict, decision: Decision) -> None:
    """Tell the app a decision landed. The DB is the truth; this ping is a courtesy."""
    try:
        r = requests.post(
            os.environ["WEBHOOK_URL"],
            json={"domain": domain_for(lead), "response": decision.response},
            headers={"x-webhook-secret": os.environ["WEBHOOK_SECRET"]},
            timeout=10,
        )
        print(f"p4: webhook -> {r.status_code}")
    except Exception as e:
        print(f"p4: webhook unreachable ({type(e).__name__}) — continuing, the DB has the truth")


def main() -> None:
    leads = json.load(open(os.path.join(HERE, "out", "p2_leads.json")))
    research = json.load(open(os.path.join(HERE, "out", "p3_research.json")))
    for lead, res in zip(leads, research):
        decision = decide(lead, res)
        store(lead, res, decision)
        ping_webhook(lead, decision)
        print(f"p4: {lead.get('company') or '?'} — quality {decision.lead_quality}/5, {decision.est_budget} -> {decision.response}")
    print("p4: done — check aria_account in Supabase")


if __name__ == "__main__":
    main()

"""p3 — research each company on the open web.

Two OpenAI calls per lead, never one: a web-search call (findings + sources), then a
parse call (findings -> the Research model). Combining search and structured output in
one call silently returns empty results — so we don't.
Output: out/p3_research.json
"""
import json
import os

from dotenv import load_dotenv

HERE = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(HERE, "..", ".env"))

from openai import OpenAI  # noqa: E402

from models import Research  # noqa: E402

SEARCH_MODEL = "gpt-5.6-terra"
PARSE_MODEL = "gpt-5.4-mini"
client = OpenAI()

SEARCH_PROMPT = """Research the company "{company}" (domain: {domain}). Find:
1. Roughly how many employees it has.
2. Whether it is US-based, or does its main activity in the US.
If the company name and the domain don't appear to belong to the same organization,
research both briefly and state the mismatch plainly — a sender claiming a big company
from an unrelated domain matters for qualification.
Report what you find with sources. If you can't find the company at all, say so plainly."""

PARSE_PROMPT = """An events company is qualifying an inbound lead. Turn the research
findings below into the structured object.

The inquiry (for the premium score): {request} — event type: {event_type}, location:
{location}, attendees: {attendees}, stated budget: {stated_budget}.

premium_score is 1-5: how big/premium the *expectation* reads — keywords like wedding,
annual offsite, leadership summit, Tuscany, Lake Como, luxury villa score high; a small
casual party scores low.

Research findings:
{findings}

If the findings say the company couldn't be found, employees_count and us_based are null.
Include 2-4 short facts with their source URLs when available."""


def research(lead: dict) -> Research:
    company = lead.get("company") or "(unknown company)"
    domain = lead.get("domain") or "unknown"

    findings = "The company could not be researched (no company name or domain)."
    if lead.get("company") or lead.get("domain"):
        search = client.responses.create(
            model=SEARCH_MODEL,
            tools=[{"type": "web_search"}],
            input=SEARCH_PROMPT.format(company=company, domain=domain),
        )
        findings = search.output_text

    parsed = client.responses.parse(
        model=PARSE_MODEL,
        input=PARSE_PROMPT.format(findings=findings, **{
            k: lead.get(k) for k in ("request", "event_type", "location", "attendees", "stated_budget")
        }),
        text_format=Research,
    )
    return parsed.output_parsed


def main() -> list[dict]:
    leads = json.load(open(os.path.join(HERE, "out", "p2_leads.json")))
    results = []
    for lead in leads:
        r = research(lead)
        results.append(r.model_dump())
        print(f"p3: {lead.get('company') or '?'} — employees: {r.employees_count}, US: {r.us_based}, premium: {r.premium_score}/5")
    out = os.path.join(HERE, "out", "p3_research.json")
    json.dump(results, open(out, "w"), indent=2)
    print(f"p3: {len(results)} researched -> {out}")
    return results


if __name__ == "__main__":
    main()

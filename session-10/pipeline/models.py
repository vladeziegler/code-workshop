"""The contracts. Every stage of the pipeline speaks in these shapes — a field has a
name, a type, and a rule for what happens when it's missing."""
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Lead(BaseModel):
    """What p2 pulls out of a messy inquiry email (body + sender, wherever it lives)."""

    is_event_inquiry: bool = Field(
        description="True only if this email is a real inquiry about booking music or an "
        "event. Security alerts, newsletters, marketing, and service notifications are False."
    )
    full_name: Optional[str] = Field(None, description="Contact's name, if stated anywhere")
    email: Optional[str] = Field(None, description="Contact's email — signature, body, or sender")
    role: Optional[str] = Field(None, description="Their job title, if stated")
    company: Optional[str] = Field(None, description="Company or organization name")
    domain: Optional[str] = Field(None, description="Company web domain, e.g. figma.com — infer from the email address if needed")
    request: str = Field(description="One plain sentence: what they are asking for")
    event_type: Optional[str] = None
    location: Optional[str] = None
    attendees: Optional[int] = None
    dates: Optional[str] = Field(None, description="Dates or timeframe as written, if any")
    stated_budget: Optional[str] = Field(None, description="Budget exactly as written, if any")


class Research(BaseModel):
    """What p3 finds about the company on the open web."""

    employees_count: Optional[int] = Field(None, description="Best estimate of headcount; null if unknown")
    us_based: Optional[bool] = Field(None, description="HQ in the US, or main activity in the US; null if unknown")
    premium_score: int = Field(description="1-5: how big/premium the expectation reads (venue, location, event type keywords)")
    facts: list["Fact"] = Field(default_factory=list, description="2-4 short findings with sources")


class Fact(BaseModel):
    fact: str
    source_url: Optional[str] = None


class Decision(BaseModel):
    """What p4 concludes. response is the model's recommendation; a human owns status."""

    lead_quality: int = Field(description="1-5 overall quality")
    est_budget: str = Field(description="Estimated budget range as text, e.g. '$150k-$250k', or 'unknown'")
    response: Literal["Escalate", "Reject", "Confirm"]
    reasoning: str = Field(description="Two sentences max, plain speech")

import { z } from "zod";

// The typed wire everything downstream trusts.
export const CampaignBrief = z.object({
  campaign: z.string().describe("Campaign title, e.g. 'Muse × Brand — Spring Collab'"),
  audience: z.string().describe("Who this is for, one sentence, specific"),
  angle: z.string().describe("The creative angle, one sentence"),
  headlines: z.array(z.string()).length(3).describe("Three campaign headlines"),
  imageDirection: z.string().describe("Art direction for the hero image, one sentence"),
  facts: z.array(z.string()).min(1).describe("Real facts from the research, with source names"),
});
export type CampaignBrief = z.infer<typeof CampaignBrief>;

export const RouteDecision = z.object({
  route: z.enum(["research", "brief", "full-kit"]),
});

/**
 * The evaluator's output in the feedback loop.
 *
 * Note what is NOT in here: a `pass` boolean. The model SCORES; your code
 * decides whether the score is good enough. Ask a model "is this good enough?"
 * and you've handed it the stopping decision — the same mistake the router
 * exercise is about, made somewhere much harder to notice.
 *
 * The rich fields aren't decoration: `issues` and `suggestions` are the wire
 * into the next draft. A bare "fail" gives the rewrite nothing to act on.
 */
export const BriefEvaluation = z.object({
  specificity: z.number().min(1).max(10).describe("Are the headlines specific, not generic?"),
  grounding: z.number().min(1).max(10).describe("Are the facts real and attributed to named sources?"),
  audienceClarity: z.number().min(1).max(10).describe("Is the audience a real person, not 'urban consumers'?"),
  issues: z.array(z.string()).describe("Concrete problems with this draft"),
  suggestions: z.array(z.string()).describe("Concrete instructions for the rewrite"),
});
export type BriefEvaluation = z.infer<typeof BriefEvaluation>;

/**
 * The threshold lives in code, where you can see it and change it.
 *
 * This is the most important number in the loop and it is not a technical
 * setting — it's how good the work has to be before you'll show a client.
 * Turn it down to 6 and the loop almost never runs a second round: cheap, fast,
 * mediocre. Turn it up to 10 and it burns its whole budget every time and still
 * fails. 9 means "one revision is normal."
 *
 * Change this line and re-run exercise 14. That's the quality/spend dial, and
 * it is a conversation to have with the client, not a default to inherit.
 *
 * Measured on this codebase: at 6 the loop almost always stops at iteration 0.
 * At 8 it typically takes one or two rounds and passes. At 9 it often spends
 * the whole budget and still fails — which is a legitimate answer, as long as
 * you decided in advance what to do about it.
 */
export const BRIEF_THRESHOLD = { specificity: 8, grounding: 8, audienceClarity: 8 };

export function briefIsGoodEnough(e: BriefEvaluation) {
  return (
    e.specificity >= BRIEF_THRESHOLD.specificity &&
    e.grounding >= BRIEF_THRESHOLD.grounding &&
    e.audienceClarity >= BRIEF_THRESHOLD.audienceClarity
  );
}

import type { Persona, PersonaEvaluation, SlideContent } from '@deckster/shared/types.js';

/**
 * Extract a slide title from the first line of its text content.
 */
function getSlideTitle(text: string): string {
  const firstLine = text.split('\n')[0]?.trim() ?? '';
  // Cap at 60 chars to keep the reference concise
  return firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine;
}

export function buildRecommendationsPrompt(
  goal: string,
  personas: Persona[],
  evaluations: PersonaEvaluation[],
  slideContents?: SlideContent[]
): { system: string; user: string } {
  // Build slide reference map for the LLM
  const slideReference = slideContents?.length
    ? `\n\nSLIDE REFERENCE (use these names when referencing slides):\n${slideContents
        .map((s) => `- Slide ${s.slideNumber}: "${getSlideTitle(s.text)}"`)
        .join('\n')}`
    : '';

  const system = `You are a presentation coach synthesizing feedback from a panel of ${evaluations.length} audience member${evaluations.length === 1 ? '' : 's'}. Your job is to distill their reactions into actionable recommendations, strictly ranked by impact.

THE GOLDEN RULE — ONE ACTION PER RECOMMENDATION:
Each recommendation must contain exactly ONE specific, actionable thing for the presenter to do. Not two things bundled together, not a vague umbrella covering multiple changes. One clear action that the presenter can execute and check off.

BAD: "Add financial projections and restructure the narrative arc" — this is TWO actions, split them
BAD: "Improve your financial projections" — too vague, not actionable
GOOD: "On slide 7 (Revenue Forecast), replace the single revenue number with a 3-year projection table showing conservative, base, and optimistic scenarios. Include your assumptions for each."

PRIORITY TIERS:
- "top" = exactly ONE recommendation gets this. The single most impactful change — the one thing that, if fixed, would shift the outcome most.
- "important" = high-impact changes that would meaningfully improve the presentation. As many as warranted.
- "consider" = worthwhile improvements that would polish the presentation. As many as warranted.

Generate as many recommendations as the feedback warrants, up to a maximum of 20. Don't pad with filler, but don't artificially limit either. If there are 12 genuine actionable improvements, list all 12. If there are 4, list 4.

RECOMMENDATION PRIORITY ORDER — what to suggest first:
The most impactful improvements are about HOW you persuade, not just WHAT you show. Prioritize recommendations in this order:

1. MENTAL MODELS — suggest applying specific mental models to strengthen slides or the overall narrative structure. These can be applied per-slide (e.g., "Use Loss Aversion on slide 5 by showing what happens if they DON'T act") or per-structure (e.g., "Restructure the deck using Before-After-Bridge").
   Available models to consider: Opportunity Cost, Loss Aversion, Before-After-Bridge, 5 Whys, Inversion, Power of Defaults, Problem-Solution-Benefit, Worst Case Scenario, Compounding Effect, Pareto Principle, System Consequences, Diminishing Returns, Lollapalooza Effect, Power Law, Emerging Dynamics, Unpredictability of Complex Dynamic Systems, First Principles, Occam's Razor.
   Only suggest models that genuinely fit — don't force a model where it doesn't apply.

2. LANGUAGE — does the language match what this specific audience expects? Investors want ROI language, engineers want technical precision, executives want strategic framing. If the language doesn't match the audience, suggest specific rewording.

3. EVIDENCE TYPE — is the presenter showing the right KIND of evidence for this audience? Data-driven audiences need numbers, story-driven audiences need narratives, risk-averse audiences need case studies and proof points. Suggest adding or replacing evidence to match.

4. EVERYTHING ELSE — structural changes, content additions, slide-level fixes, visual improvements, etc.

RULES FOR EACH RECOMMENDATION:
- Tell the presenter EXACTLY what to do — a specific action they can execute immediately
- When referencing a slide, include both the number and its name, e.g., "On slide 3 (Market Overview), replace..."
- Include the specific action: add, remove, replace, restructure, reword, or move
- If adding content, describe what it should look like
- If changing structure, explain the before and after
- Each recommendation needs a short title (3-6 words, like a headline)
- Include a priorityRationale: 1 sentence explaining WHY it's ranked at this priority level
- Tie each recommendation to which persona(s) raised the concern

MAIN ADVICE:
Before listing specific recommendations, provide a "mainAdvice" — a 2-3 sentence high-level assessment of the presentation's core issue or biggest opportunity. This should capture the overarching theme across all panel feedback: what's the fundamental thing this presentation gets right or wrong? Think of it as the one piece of advice a mentor would give over coffee — strategic, honest, and clear. It should feel different from the specific recommendations below (those are tactical; this is strategic).

Respond with a JSON object:
{
  "mainAdvice": "2-3 sentence strategic assessment — the overarching theme of what this presentation needs most",
  "recommendations": [
    {
      "number": 1,
      "title": "Short headline title",
      "text": "Specific, single actionable instruction the presenter can execute immediately",
      "priority": "top",
      "priorityRationale": "Why this is the #1 priority",
      "relatedPersonaIds": ["persona-1", "persona-3"]
    }
  ]
}

Number recommendations sequentially starting from 1. Exactly one "top", the rest "important" or "consider".`;

  const feedbackSummary = evaluations
    .map((ev) => {
      const persona = personas.find((p) => p.id === ev.personaId);
      return `## ${persona?.name} (${persona?.title})
Reaction: ${ev.reaction}

Green Flags:
${ev.greenFlags.map((p) => `+ ${p}`).join('\n')}

Red Flags:
${ev.redFlags.map((p) => `- ${p}`).join('\n')}

Decision: ${ev.decision} [${ev.decisionSentiment}]`;
    })
    .join('\n\n---\n\n');

  const user = `PRESENTATION GOAL: ${goal}${slideReference}

PANEL FEEDBACK:
${feedbackSummary}

Synthesize recommendations ranked by impact. Remember: ONE actionable item per recommendation. Each must be specific enough that the presenter can act on it immediately — reference exact slides by number and name.`;

  return { system, user };
}

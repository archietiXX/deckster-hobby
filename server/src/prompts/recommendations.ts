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
GOOD: "Replace the single revenue number with a 3-year projection table showing conservative, base, and optimistic scenarios. Include your assumptions for each."

PRIORITY TIERS:
- "top" = exactly ONE recommendation gets this. The single most impactful change — the one thing that, if fixed, would shift the outcome most.
- "critical" = at most 2 recommendations. Near-top-priority changes that would significantly shift the outcome.
- "important" = at most 6 recommendations. High-impact changes that would meaningfully improve the presentation.
- "consider" = worthwhile improvements that would polish the presentation. As many as warranted.

Generate as many recommendations as the feedback warrants — there is no hard cap. Give multiple recommendations per slide if warranted. Don't pad with filler, but don't artificially limit either.

RECOMMENDATION PRIORITY ORDER — what to suggest first:
The most impactful improvements are about HOW you persuade, not just WHAT you show. Prioritize recommendations in this order:

1. MENTAL MODELS — suggest applying specific mental models to strengthen SPECIFIC SLIDES. Always anchor to a concrete slide, e.g., "Frame the problem using Loss Aversion — show what happens if they DON'T act." Do NOT suggest deck-wide restructuring (e.g., "Restructure the deck using Before-After-Bridge") — that's too heavy to act on.
   Available models to consider: Opportunity Cost, Loss Aversion, Before-After-Bridge, 5 Whys, Inversion, Power of Defaults, Problem-Solution-Benefit, Worst Case Scenario, Compounding Effect, Pareto Principle, System Consequences, Diminishing Returns, Lollapalooza Effect, Power Law, Emerging Dynamics, Unpredictability of Complex Dynamic Systems, First Principles, Occam's Razor.
   Only suggest models that genuinely fit — don't force a model where it doesn't apply.

2. LANGUAGE — does the language match what this specific audience expects? Investors want ROI language, engineers want technical precision, executives want strategic framing. If the language doesn't match the audience, suggest specific rewording.

3. EVIDENCE TYPE — is the presenter showing the right KIND of evidence for this audience? Data-driven audiences need numbers, story-driven audiences need narratives, risk-averse audiences need case studies and proof points. Suggest adding or replacing evidence to match.

4. EVERYTHING ELSE — content additions, slide-level fixes, visual improvements, etc. Keep it tactical and anchored to specific slides.

RULES FOR EACH RECOMMENDATION:
- Tell the presenter EXACTLY what to do — a specific action they can execute immediately
- DO NOT reference slide numbers or slide names in the "text" field — the UI already groups recommendations by slide, so the context is provided visually. Just state the action directly.
- Include the specific action: add, remove, replace, restructure, reword, or move
- Keep the "text" short and punchy — a concise bullet point, not a paragraph. 1-2 sentences max.
- Each recommendation needs a short title (3-6 words, like a headline)
- Include a priorityRationale: 2-3 sentences explaining WHY this recommendation matters. Reference specific panel feedback — quote or paraphrase what the personas actually said, using their language and evidence style. E.g., "Sarah (CFO) flagged the lack of unit economics as a dealbreaker — without gross margin data, she can't model the business. Mark (CTO) echoed this, noting the technical architecture slide gives no cost signals."
- Tie each recommendation to which persona(s) raised the concern

STRATEGIC ADVICE:
Before listing specific recommendations, provide a "mainAdvice" — a 2-3 sentence high-level strategic assessment of the presentation's core issue or biggest opportunity. This should capture the overarching theme across all panel feedback: what's the fundamental thing this presentation gets right or wrong? Think of it as the one piece of advice a mentor would give over coffee — strategic, honest, and clear. It should feel different from the specific recommendations below (those are tactical; this is strategic).

STRUCTURE ADVICE:
After strategic advice but before tactical recommendations, assess whether the deck needs structural changes: slides that should be added, removed, or reordered. These are lightweight suggestions — just the action and a brief reason. Only suggest structure changes that are directly supported by persona feedback. If the deck structure is fine, return an empty array.
- "add" = a new slide is needed (describe what it should cover and where it should go)
- "delete" = an existing slide should be removed (explain why it hurts). IMPORTANT: do NOT generate per-slide recommendations for any slide you recommend deleting — it's contradictory to fix a slide you're telling them to remove.
- "reorder" = slides should be rearranged (explain the better flow)
- Each structure suggestion must include a "rationale": 2-3 sentences explaining WHY this structural change matters, referencing specific persona feedback by name. Use their language and evidence.

Respond with a JSON object:
{
  "mainAdvice": "2-3 sentence strategic assessment",
  "structureAdvice": [
    {
      "action": "add",
      "description": "Add a competitive landscape slide after slide 3",
      "rationale": "Sarah (CFO) explicitly asked 'who else is in this space?' — without competitive context, she can't assess defensibility. Mark (CTO) noted the same gap from a technical differentiation angle.",
      "relatedPersonaIds": ["persona-1"]
    }
  ],
  "recommendations": [
    {
      "number": 1,
      "title": "Short headline title",
      "text": "Specific, single actionable instruction",
      "priority": "top",
      "priorityRationale": "Sarah (CFO) flagged X as a dealbreaker — without Y data, she can't model the business. Mark (CTO) echoed this concern from a technical angle.",
      "relatedPersonaIds": ["persona-1", "persona-3"],
      "slideNumbers": [3]
    }
  ]
}

Number recommendations sequentially starting from 1. Exactly one "top", at most 2 "critical", at most 6 "important", the rest "consider".

SLIDE NUMBERS:
Each recommendation must include a "slideNumbers" array indicating which slide(s) it applies to.
- Single slide: [3]
- Multiple slides: [3, 5, 7]
- Use [] only for recommendations that genuinely apply across ALL slides (e.g., language tone). Strongly prefer anchoring to specific slides.`;

  const feedbackSummary = evaluations
    .map((ev) => {
      const persona = personas.find((p) => p.id === ev.personaId);
      return `## ${persona?.name} (${persona?.title}) [id: ${persona?.id}]
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

Synthesize recommendations ranked by impact. Remember: ONE actionable item per recommendation, short and punchy. Don't reference slide numbers in the recommendation text — just state the action. Use the slideNumbers array to indicate which slide(s) each recommendation targets.`;

  return { system, user };
}

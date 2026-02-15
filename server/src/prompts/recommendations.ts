import type { Persona, PersonaEvaluation } from '@deckster/shared/types.js';

export function buildRecommendationsPrompt(
  goal: string,
  personas: Persona[],
  evaluations: PersonaEvaluation[]
): { system: string; user: string } {
  // Scale recommendations with panel size: minimum 3, maximum 7
  const recCount = Math.max(3, Math.min(evaluations.length + 1, 7));

  const system = `You are a presentation coach synthesizing feedback from a panel of ${evaluations.length} audience member${evaluations.length === 1 ? '' : 's'}. Your job is to distill their reactions into ${recCount} actionable recommendations, strictly ranked by impact.

PRIORITY TIERS — you must assign exactly these tiers:
- #1 = "top" priority — the single most impactful change. This is the one thing that, if fixed, would shift the outcome most. Be ruthless — only one recommendation gets this tier.
- #2 ${recCount >= 4 ? 'and #3 ' : ''}= "important" — high-impact changes that would meaningfully improve the presentation.
- Remaining = "consider" — worthwhile improvements that would polish the presentation.

RULES FOR ACTIONABLE RECOMMENDATIONS:
- Each recommendation must tell the presenter EXACTLY what to do — not vague advice
- Reference specific slides, sections, or content when possible (e.g., "On slide 3, replace the generic market size claim with a bottom-up TAM calculation")
- Include the specific action: add, remove, replace, restructure, reword, or move
- If a recommendation involves adding content, describe what that content should look like
- If a recommendation involves changing structure, explain the before and after
- Frame recommendations as direct instructions the presenter can execute immediately
- Each recommendation needs a short title (3-6 words, like a headline)
- For each recommendation, include a priorityRationale: 1 sentence explaining WHY this is ranked at this priority level
- Tie each recommendation back to which persona(s) raised the concern

BAD example: "Improve your financial projections" — too vague
GOOD example: "Replace the single revenue number on slide 7 with a 3-year projection table showing conservative, base, and optimistic scenarios. Include your assumptions for each."

MAIN ADVICE:
Before listing specific recommendations, provide a "mainAdvice" — a 2-3 sentence high-level assessment of the presentation's core issue or biggest opportunity. This should capture the overarching theme across all panel feedback: what's the fundamental thing this presentation gets right or wrong? Think of it as the one piece of advice a mentor would give over coffee — strategic, honest, and clear. It should feel different from the specific recommendations below (those are tactical; this is strategic).

Respond with a JSON object:
{
  "mainAdvice": "2-3 sentence strategic assessment — the overarching theme of what this presentation needs most",
  "recommendations": [
    {
      "number": 1,
      "title": "Short headline title",
      "text": "Specific, actionable instruction the presenter can execute immediately",
      "priority": "top",
      "priorityRationale": "Why this is the #1 priority",
      "relatedPersonaIds": ["persona-1", "persona-3"]
    }
  ]
}

Generate exactly ${recCount} recommendations. Priority values: "top" for #1, "important" for #2${recCount >= 4 ? '-3' : ''}, "consider" for the rest.`;

  const feedbackSummary = evaluations
    .map((ev) => {
      const persona = personas.find((p) => p.id === ev.personaId);
      return `## ${persona?.name} (${persona?.title})
Reaction: ${ev.reaction}

Core Points:
${ev.corePoints.map((p) => `- ${p}`).join('\n')}

Decision: ${ev.decision} [${ev.decisionSentiment}]`;
    })
    .join('\n\n---\n\n');

  const user = `PRESENTATION GOAL: ${goal}

PANEL FEEDBACK:
${feedbackSummary}

Synthesize ${recCount} recommendations, ranked by impact. Each must be specific enough that the presenter can act on it immediately — reference exact slides, sections, and content where possible.`;

  return { system, user };
}

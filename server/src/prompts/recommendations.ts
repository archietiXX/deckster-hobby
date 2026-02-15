import type { Persona, PersonaEvaluation } from '@deckster/shared/types.js';

export function buildRecommendationsPrompt(
  goal: string,
  personas: Persona[],
  evaluations: PersonaEvaluation[]
): { system: string; user: string } {
  const system = `You are a presentation coach synthesizing feedback from a panel of 5 audience members. Your job is to distill their reactions into 5 actionable recommendations, strictly ranked by impact.

PRIORITY TIERS — you must assign exactly these tiers:
- #1 = "top" priority — the single most impactful change. This is the one thing that, if fixed, would shift the outcome most. Be ruthless — only one recommendation gets this tier.
- #2 and #3 = "important" — high-impact changes that would meaningfully improve the presentation. These matter a lot but aren't the #1 blocker.
- #4 and #5 = "consider" — worthwhile improvements that would polish the presentation but aren't dealbreakers.

RULES:
- Each recommendation needs a short title (3-6 words, like a headline) and a detailed explanation
- The explanation must be specific and actionable — not vague advice
- Tie each recommendation back to which persona(s) raised the concern
- Cover different aspects where possible: content, structure, delivery, data/evidence, audience engagement
- Be constructive but honest — the goal is to help the presenter succeed
- The ranking must reflect real impact on the presentation goal, not just order of appearance

Respond with a JSON object:
{
  "recommendations": [
    {
      "number": 1,
      "title": "Short headline title",
      "text": "Detailed, actionable recommendation explaining what to change and why",
      "priority": "top",
      "relatedPersonaIds": ["persona-1", "persona-3"]
    },
    {
      "number": 2,
      "title": "Short headline title",
      "text": "Detailed recommendation...",
      "priority": "important",
      "relatedPersonaIds": ["persona-2"]
    }
  ]
}

priority values: "top" for #1, "important" for #2-3, "consider" for #4-5.`;

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

Synthesize 5 recommendations, ranked by impact. #1 should be the single most important change.`;

  return { system, user };
}

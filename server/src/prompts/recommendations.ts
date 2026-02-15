import type { Persona, PersonaEvaluation } from '@deckster/shared/types.js';

export function buildRecommendationsPrompt(
  goal: string,
  personas: Persona[],
  evaluations: PersonaEvaluation[]
): { system: string; user: string } {
  const system = `You are a presentation coach synthesizing feedback from a panel of 5 audience members. Your job is to distill their reactions into the 5 most critical, actionable recommendations for improving the presentation.

RULES:
- Each recommendation must be specific and actionable — not vague advice
- Tie each recommendation back to which persona(s) raised the concern
- Prioritize by impact: what changes would most improve the presentation's effectiveness?
- Cover different aspects: content, structure, delivery style, data/evidence, audience engagement
- Be constructive but honest — the goal is to help the presenter improve

Respond with a JSON object:
{
  "recommendations": [
    {
      "number": 1,
      "text": "Specific, actionable recommendation text",
      "relatedPersonaIds": ["persona-1", "persona-3"]
    }
  ]
}`;

  const feedbackSummary = evaluations
    .map((ev) => {
      const persona = personas.find((p) => p.id === ev.personaId);
      return `## ${persona?.name} (${persona?.title})
Reaction: ${ev.reaction}

Core Points:
${ev.corePoints.map((p) => `- ${p}`).join('\n')}

Decision: ${ev.decision}`;
    })
    .join('\n\n---\n\n');

  const user = `PRESENTATION GOAL: ${goal}

PANEL FEEDBACK:
${feedbackSummary}

Synthesize the 5 most critical recommendations.`;

  return { system, user };
}

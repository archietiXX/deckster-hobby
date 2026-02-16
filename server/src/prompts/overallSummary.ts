import type { Persona, PersonaEvaluation } from '@deckster/shared/types.js';

export function buildOverallSummaryPrompt(
  goal: string,
  personas: Persona[],
  evaluations: PersonaEvaluation[]
): { system: string; user: string } {
  const system = `You are a concise analyst summarizing a panel's collective reaction to a presentation.

Your job is to produce three things:
1. A 2-3 sentence overall summary of what the panel thought collectively
2. A list of 2-4 things the presentation does well (based on what panelists praised)
3. A list of 2-4 things that need work (based on what panelists criticized or flagged)

Rules:
- Write in third person about "the panel" or "the audience"
- Be specific — reference actual content they reacted to, not vague platitudes
- Strengths and weaknesses should be single clear sentences, not paragraphs
- Base everything strictly on what the panelists actually said

Respond with a JSON object:
{
  "summary": "Your 2-3 sentence overall summary.",
  "strengths": ["What the presentation does well — 2-4 items"],
  "weaknesses": ["What needs work — 2-4 items"]
}`;

  const feedbackSummary = evaluations
    .map((ev) => {
      const persona = personas.find((p) => p.id === ev.personaId);
      return `${persona?.name} (${persona?.title}): ${ev.decision}
Green flags: ${ev.greenFlags.join('; ')}
Red flags: ${ev.redFlags.join('; ')}`;
    })
    .join('\n\n');

  const sentimentCounts = evaluations.reduce(
    (acc, ev) => {
      acc[ev.decisionSentiment] = (acc[ev.decisionSentiment] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const user = `PRESENTATION GOAL: ${goal}

PANEL VERDICTS (${sentimentCounts.positive || 0} positive, ${sentimentCounts.mixed || 0} mixed, ${sentimentCounts.negative || 0} negative):
${feedbackSummary}

Summarize the panel's collective reaction.`;

  return { system, user };
}

import type { Persona, AudienceCategory } from '@deckster/shared/types.js';

export function buildEvaluationPrompt(
  persona: Persona,
  category: AudienceCategory,
  goal: string,
  slideText: string
): { system: string; user: string } {
  const system = `You are ${persona.name}, ${persona.title}.

BACKGROUND: ${persona.background}

YOUR KEY CONCERNS about presentations like this:
${persona.keyConcerns.map((c) => `- ${c}`).join('\n')}

WHAT YOU LOOK FOR IN PRESENTATIONS:
${category.evidenceType}

HOW YOU THINK AND COMMUNICATE:
${category.languageRules}

You have just finished reviewing a presentation. Give your honest, in-character reaction.

RESPONSE FORMAT (respond in JSON):
{
  "reaction": "Two paragraphs of natural, in-character reaction to the presentation. Write as this person would actually think and speak — use their vocabulary, priorities, and communication style. Be specific about what worked and what didn't. Reference actual content from the slides.",
  "corePoints": ["3 to 5 specific, actionable points — things the presenter did well or needs to improve. Each point should be a single clear sentence."]
}`;

  const user = `PRESENTATION GOAL: ${goal}

SLIDE CONTENT:
${slideText}

Give your honest reaction to this presentation as ${persona.name}.`;

  return { system, user };
}

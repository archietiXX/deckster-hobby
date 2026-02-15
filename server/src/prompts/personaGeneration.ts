import type { AudienceCategory } from '@deckster/shared/types.js';

export function buildPersonaGenerationPrompt(
  goal: string,
  categories: AudienceCategory[]
): { system: string; user: string } {
  const categoryList = categories
    .map(
      (c) =>
        `- **${c.label}** (id: ${c.id}): Looks for ${c.evidenceType}. Communication style: ${c.languageRules}`
    )
    .join('\n');

  const system = `You are an expert at simulating realistic audience members for presentation evaluations.

Your task: Generate exactly 5 distinct persona definitions that represent a realistic audience panel for a presentation. Each persona should be a believable professional with a specific name, job title, background, and concerns.

IMPORTANT RULES:
- Distribute personas across the selected audience categories in a way that best serves the presentation goal
- You may assign multiple personas to the same category if it makes strategic sense
- Every selected category should ideally have at least one persona, but prioritize realism over coverage if there are more than 5 categories
- Each persona must feel like a real individual with specific professional concerns
- Give each persona a realistic full name and specific job title
- Personas should represent a diverse range of perspectives

Respond with a JSON object containing a "personas" array with exactly 5 objects, each having:
- "id": a unique string like "persona-1", "persona-2", etc.
- "name": realistic full name
- "title": specific job title
- "role": their role relative to the presenter (e.g., "decision-maker", "budget holder", "end user")
- "background": 1-2 sentences about their professional background and what shaped their perspective
- "keyConcerns": array of 3-4 specific concerns they would have about this presentation
- "audienceCategoryId": the id of the audience category they belong to`;

  const user = `PRESENTATION GOAL: ${goal}

SELECTED AUDIENCE CATEGORIES:
${categoryList}

Generate 5 realistic personas for this evaluation panel.`;

  return { system, user };
}

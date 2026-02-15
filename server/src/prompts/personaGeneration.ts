import type { AudienceCategory } from '@deckster/shared/types.js';

export function buildPersonaGenerationPrompt(
  goal: string,
  categories: AudienceCategory[],
  audienceContext?: string,
  slideTextSample?: string
): { system: string; user: string } {
  const categoryList = categories
    .map(
      (c) =>
        `- **${c.label}** (id: ${c.id}): Looks for ${c.evidenceType}. Communication style: ${c.languageRules}`
    )
    .join('\n');

  const system = `You are an expert at simulating realistic audience members for presentation evaluations.

Your task: Generate a realistic audience panel for a presentation. You must decide the right NUMBER of personas based on the selected categories, presentation goal, and any additional context provided.

HOW TO DETERMINE PERSONA COUNT (generate between 1 and 7 personas):
- Some categories are inherently singular in most real-world settings:
  • "Direct Manager" → typically 1 person
  • "Client" → typically 1 key contact (unless context says otherwise)
  • "Project Stakeholders" → typically 1-2 people
  • "Department Head" → typically 1-2 people
- Some categories are inherently plural:
  • "C-level Executives" → 2-4 people (CEO, CFO, CTO, etc.)
  • "Team" → 2-5 people (different roles and seniority levels)
  • "Investors" → 2-4 people (different investment perspectives)
  • "Board/Advisory Group" → 2-4 people
  • "Senior Leadership" → 2-3 people
  • "General Public" → 2-4 people (different demographics)
  • "Potential Customers" → 2-3 people (different buyer profiles)
  • "External Partners" → 1-2 people
  • "Trainees/New Hires" → 2-3 people (different experience levels)
- If only one category is selected AND it's a singular category (like Direct Manager), generate just 1 persona
- If additional context specifies exact attendees or audience size, respect that
- The total should feel realistic for the scenario — a pitch to your boss is 1 person, a board meeting is 4-6 people, a team presentation is 3-5 people
- Cap at 7 personas maximum — beyond that the evaluation loses focus

IMPORTANT RULES:
- Each persona must feel like a real individual with specific professional concerns
- NAMES MUST MATCH THE CULTURAL CONTEXT of the presentation. Infer the likely country/region from the slide content, company names, language cues, or goal. If the content is German, use German names. If Japanese, use Japanese names. If American, use American names. Always use a realistic diverse mix of names from that culture — not all the same ethnicity. If no cultural signal is detectable, default to a diverse international mix.
- Give each persona a realistic full name and specific job title
- Personas should represent a diverse range of perspectives within and across categories

Respond with a JSON object containing a "personas" array, each having:
- "id": a unique string like "persona-1", "persona-2", etc.
- "name": realistic full name
- "title": specific job title
- "role": their role relative to the presenter (e.g., "decision-maker", "budget holder", "end user")
- "background": 1-2 sentences about their professional background and what shaped their perspective
- "keyConcerns": array of 3-4 specific concerns they would have about this presentation
- "audienceCategoryId": the id of the audience category they belong to`;

  const contextBlock = audienceContext?.trim()
    ? `\n\nADDITIONAL CONTEXT ABOUT THE AUDIENCE:\n${audienceContext.trim()}\n\nUse this context to make personas more specific and realistic. Reflect the dynamics, attitudes, and concerns described above in the personas you generate. If specific people or roles are mentioned, model personas after them.`
    : '';

  const slideHint = slideTextSample
    ? `\n\nPRESENTATION CONTENT SAMPLE (use to infer cultural/regional context for names):\n${slideTextSample}`
    : '';

  const user = `PRESENTATION GOAL: ${goal}

SELECTED AUDIENCE CATEGORIES:
${categoryList}${contextBlock}${slideHint}

Generate the right number of realistic personas for this evaluation panel. Consider which categories are singular vs. plural in a real-world setting.`;

  return { system, user };
}

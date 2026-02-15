import type { Persona, AudienceCategory } from '@deckster/shared/types.js';
import { jsonCompletion } from './openai.js';
import { buildPersonaGenerationPrompt } from '../prompts/personaGeneration.js';

interface PersonaGenerationResponse {
  personas: Persona[];
}

export async function generatePersonas(
  goal: string,
  categories: AudienceCategory[],
  audienceContext?: string,
  slideTextSample?: string
): Promise<Persona[]> {
  const { system, user } = buildPersonaGenerationPrompt(goal, categories, audienceContext, slideTextSample);
  const result = await jsonCompletion<PersonaGenerationResponse>(system, user);
  return result.personas;
}

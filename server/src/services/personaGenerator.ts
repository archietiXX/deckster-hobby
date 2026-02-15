import type { Persona, AudienceCategory } from '@deckster/shared/types.js';
import { jsonCompletion } from './openai.js';
import { buildPersonaGenerationPrompt } from '../prompts/personaGeneration.js';

interface PersonaGenerationResponse {
  personas: Persona[];
}

export async function generatePersonas(
  goal: string,
  categories: AudienceCategory[]
): Promise<Persona[]> {
  const { system, user } = buildPersonaGenerationPrompt(goal, categories);
  const result = await jsonCompletion<PersonaGenerationResponse>(system, user);
  return result.personas;
}

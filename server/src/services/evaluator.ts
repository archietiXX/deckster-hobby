import type { Persona, AudienceCategory, PersonaEvaluation } from '@deckster/shared/types.js';
import { jsonCompletion } from './openai.js';
import { buildEvaluationPrompt } from '../prompts/evaluation.js';

interface EvaluationResponse {
  reaction: string;
  corePoints: string[];
}

/**
 * Evaluate the deck from one persona's perspective.
 */
export async function evaluateAsPersona(
  persona: Persona,
  category: AudienceCategory,
  goal: string,
  slideText: string
): Promise<PersonaEvaluation> {
  const { system, user } = buildEvaluationPrompt(persona, category, goal, slideText);
  const result = await jsonCompletion<EvaluationResponse>(system, user);

  return {
    personaId: persona.id,
    reaction: result.reaction,
    corePoints: result.corePoints,
  };
}

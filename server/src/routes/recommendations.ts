import { Router } from 'express';
import type { Request, Response } from 'express';
import type { RecommendationsRequest, RecommendationsResponse } from '@deckster/shared/types.js';
import { jsonCompletion } from '../services/openai.js';
import { buildRecommendationsPrompt } from '../prompts/recommendations.js';

export const recommendationsRouter = Router();

// POST /api/recommendations — synthesize recommendations from persona feedback
recommendationsRouter.post('/', async (req: Request, res: Response) => {
  const { goal, personas, evaluations } = req.body as RecommendationsRequest;

  if (!goal?.trim() || !personas?.length || !evaluations?.length) {
    res.status(400).json({ error: 'Missing required fields: goal, personas, evaluations' });
    return;
  }

  try {
    const { system, user } = buildRecommendationsPrompt(goal, personas, evaluations);
    const result = await jsonCompletion<RecommendationsResponse>(system, user);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Recommendations generation failed';
    res.status(500).json({ error: message });
  }
});

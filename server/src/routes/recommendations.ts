import { Router } from 'express';

export const recommendationsRouter = Router();

// POST /api/recommendations — synthesize 5 recommendations from persona feedback
recommendationsRouter.post('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

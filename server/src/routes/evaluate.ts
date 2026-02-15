import { Router } from 'express';

export const evaluateRouter = Router();

// POST /api/evaluate — SSE stream of persona generation + evaluations
evaluateRouter.post('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

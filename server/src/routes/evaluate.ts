import { Router } from 'express';
import type { Request, Response } from 'express';
import type { EvaluateRequest, AudienceCategory, SlideContent } from '@deckster/shared/types.js';
import { generatePersonas } from '../services/personaGenerator.js';
import { evaluateAsPersona } from '../services/evaluator.js';
import { jsonCompletion } from '../services/openai.js';
import { buildOverallSummaryPrompt } from '../prompts/overallSummary.js';

// Audience category data — mirrored from client for prompt construction.
// In a larger app this would live in the shared package, but keeping it
// server-side avoids bloating the shared types with prompt-engineering details.
import { audienceCategories } from '../data/audienceCategories.js';

export const evaluateRouter = Router();

function sendSSE(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function formatSlideText(slides: SlideContent[]): string {
  return slides
    .map((s) => `[Slide ${s.slideNumber}]\n${s.text}`)
    .join('\n\n');
}

// POST /api/evaluate — SSE stream of persona generation + evaluations
evaluateRouter.post('/', async (req: Request, res: Response) => {
  const { slideContents, goal, audienceSelections, audienceContext } = req.body as EvaluateRequest;

  // Validate
  if (!slideContents?.length || !goal?.trim() || !audienceSelections?.length) {
    res.status(400).json({ error: 'Missing required fields: slideContents, goal, audienceSelections' });
    return;
  }

  // Set up SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  const selectedCategories: AudienceCategory[] = audienceSelections
    .map((s) => audienceCategories.find((c) => c.id === s.categoryId))
    .filter(Boolean) as AudienceCategory[];

  const slideText = formatSlideText(slideContents);

  try {
    // Phase 1: Generate personas (pass a slide sample for cultural context detection)
    const slideTextSample = slideText.slice(0, 500);
    const rawPersonas = await generatePersonas(goal, selectedCategories, audienceContext, slideTextSample);

    // Attach knowledge level from user selections to each persona
    const personas = rawPersonas.map((persona) => ({
      ...persona,
      knowledgeLevel:
        audienceSelections.find((s) => s.categoryId === persona.audienceCategoryId)
          ?.knowledgeLevel ?? 'intermediate',
    }));
    sendSSE(res, 'personas', personas);

    // Phase 2: Evaluate in parallel, streaming each result as it completes
    const evaluationPromises = personas.map(async (persona) => {
      const category = selectedCategories.find((c) => c.id === persona.audienceCategoryId)
        || selectedCategories[0]; // Fallback to first category

      const evaluation = await evaluateAsPersona(persona, category, goal, slideText);
      sendSSE(res, 'evaluation', evaluation);
      return evaluation;
    });

    const allEvaluations = await Promise.all(evaluationPromises);

    // Phase 3: Generate overall summary with strengths/weaknesses
    const { system: sumSystem, user: sumUser } = buildOverallSummaryPrompt(goal, personas, allEvaluations);
    const summaryResult = await jsonCompletion<{ summary: string; strengths: string[]; weaknesses: string[] }>(sumSystem, sumUser);
    sendSSE(res, 'summary', {
      text: summaryResult.summary,
      strengths: summaryResult.strengths,
      weaknesses: summaryResult.weaknesses,
    });

    sendSSE(res, 'done', {});
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Evaluation failed';
    sendSSE(res, 'error', { message });
    res.end();
  }
});

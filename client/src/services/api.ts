import type {
  SlideContent,
  Persona,
  PersonaEvaluation,
  Recommendation,
  RecommendationsResponse,
  OverallSummary,
} from '@deckster/shared/types';

interface EvaluateCallbacks {
  onPersonas: (personas: Persona[]) => void;
  onEvaluation: (evaluation: PersonaEvaluation) => void;
  onSummary: (summary: OverallSummary) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

/**
 * Start an evaluation via SSE. The server streams events as personas are
 * generated and evaluations complete.
 *
 * We use fetch + ReadableStream instead of EventSource because SSE via
 * EventSource only supports GET requests — we need POST with a JSON body.
 */
export async function startEvaluation(
  slideContents: SlideContent[],
  goal: string,
  audienceCategoryIds: string[],
  audienceContext: string | undefined,
  callbacks: EvaluateCallbacks
): Promise<void> {
  const response = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slideContents, goal, audienceCategoryIds, ...(audienceContext && { audienceContext }) }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    callbacks.onError(error.error || `HTTP ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError('No response stream available');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = '';
  let currentData = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Parse SSE events from buffer
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7);
      } else if (line.startsWith('data: ')) {
        currentData = line.slice(6);
      } else if (line === '' && currentEvent && currentData) {
        // Empty line = end of event
        try {
          const parsed = JSON.parse(currentData);
          switch (currentEvent) {
            case 'personas':
              callbacks.onPersonas(parsed);
              break;
            case 'evaluation':
              callbacks.onEvaluation(parsed);
              break;
            case 'summary':
              callbacks.onSummary(parsed);
              break;
            case 'done':
              callbacks.onDone();
              break;
            case 'error':
              callbacks.onError(parsed.message);
              break;
          }
        } catch {
          // Skip malformed events
        }
        currentEvent = '';
        currentData = '';
      }
    }
  }
}

/**
 * Fetch synthesized recommendations from all persona evaluations.
 */
export async function fetchRecommendations(
  goal: string,
  personas: Persona[],
  evaluations: PersonaEvaluation[],
  slideContents: SlideContent[]
): Promise<RecommendationsResponse> {
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, personas, evaluations, slideContents }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

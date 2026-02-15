import type { Persona, PersonaEvaluation, Recommendation } from '@deckster/shared/types';

interface EvaluationRecord {
  id: string;
  fileName: string;
  goal: string;
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  recommendations: Recommendation[];
  createdAt: string;
}

const STORAGE_KEY = 'deckster_evaluations';

export function saveEvaluation(record: Omit<EvaluationRecord, 'id' | 'createdAt'>): string {
  const id = crypto.randomUUID();
  const entry: EvaluationRecord = {
    ...record,
    id,
    createdAt: new Date().toISOString(),
  };

  const existing = getEvaluations();
  existing.unshift(entry);

  // Keep last 20 evaluations
  const trimmed = existing.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

  return id;
}

export function getEvaluations(): EvaluationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

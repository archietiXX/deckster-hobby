import type {
  AppScreen,
  SlideContent,
  Persona,
  PersonaEvaluation,
  Recommendation,
  OverallSummary,
} from '@deckster/shared/types';

const SESSION_KEY = 'deckster_session';

export interface SessionState {
  screen: AppScreen;
  slideContents: SlideContent[];
  goal: string;
  selectedAudiences: string[];
  audienceContext: string;
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  recommendations: Recommendation[];
  mainAdvice: string;
  overallSummary: OverallSummary | null;
  fileName: string;
}

export function saveSession(state: SessionState): void {
  try {
    // Don't persist the loading screen — it can't be meaningfully resumed
    if (state.screen === 'loading') return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable or full — graceful no-op
  }
}

export function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const state: SessionState = JSON.parse(raw);
    // If somehow saved as loading, fall back to setup
    if (state.screen === 'loading') {
      state.screen = 'setup';
    }
    return state;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // graceful no-op
  }
}

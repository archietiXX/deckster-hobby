// ── Audience Categories ──

export interface AudienceCategory {
  id: string;
  label: string;
  evidenceType: string;
  languageRules: string;
}

// ── Personas ──

export interface Persona {
  id: string;
  name: string;
  title: string;
  role: string;
  background: string;
  keyConcerns: string[];
  audienceCategoryId: string;
}

// ── Evaluation ──

export interface PersonaEvaluation {
  personaId: string;
  reaction: string;       // Inner-monologue style reaction with slide-specific stops
  redFlags: string[];     // 2-4 concerns, weaknesses, or issues noticed
  greenFlags: string[];   // 2-4 strengths, positive aspects, or what's working well
  decision: string;       // Final verdict personalized to the deck's goal
  decisionSentiment: 'positive' | 'negative' | 'mixed'; // For color-coding the verdict
}

export interface Recommendation {
  number: number;
  title: string;
  text: string;
  priority: 'top' | 'important' | 'consider';
  priorityRationale: string;
  relatedPersonaIds: string[];
}

// ── Overall Summary ──

export interface OverallSummary {
  text: string;
  strengths: string[];
  weaknesses: string[];
}

// ── API Request / Response ──

export interface EvaluateRequest {
  slideContents: SlideContent[];
  goal: string;
  audienceCategoryIds: string[];
  audienceContext?: string; // Optional additional context about the audience
}

export interface SlideContent {
  slideNumber: number;
  text: string;
  notes?: string;
}

// SSE event types
export type SSEEvent =
  | { type: 'personas'; data: Persona[] }
  | { type: 'evaluation'; data: PersonaEvaluation }
  | { type: 'summary'; data: OverallSummary }
  | { type: 'error'; data: { message: string } }
  | { type: 'done' };

export interface RecommendationsRequest {
  goal: string;
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  slideContents: SlideContent[];
}

export interface RecommendationsResponse {
  mainAdvice: string;
  recommendations: Recommendation[];
}

// ── App State ──

export type AppScreen = 'upload' | 'setup' | 'loading' | 'results' | 'recommendations';

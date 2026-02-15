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
  reaction: string;       // 2 paragraphs of natural reaction
  corePoints: string[];   // 3-5 bullet points
}

export interface Recommendation {
  number: number;
  text: string;
  relatedPersonaIds: string[];
}

// ── API Request / Response ──

export interface EvaluateRequest {
  slideContents: SlideContent[];
  goal: string;
  audienceCategoryIds: string[];
}

export interface SlideContent {
  slideNumber: number;
  text: string;
}

// SSE event types
export type SSEEvent =
  | { type: 'personas'; data: Persona[] }
  | { type: 'evaluation'; data: PersonaEvaluation }
  | { type: 'error'; data: { message: string } }
  | { type: 'done' };

export interface RecommendationsRequest {
  goal: string;
  personas: Persona[];
  evaluations: PersonaEvaluation[];
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
}

// ── App State ──

export type AppScreen = 'upload' | 'setup' | 'loading' | 'results' | 'recommendations';

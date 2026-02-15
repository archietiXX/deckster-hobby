import type { SlideContent, Persona, PersonaEvaluation } from '@deckster/shared/types';

interface LoadingScreenProps {
  slideContents: SlideContent[];
  goal: string;
  audienceCategoryIds: string[];
  onPersonasGenerated: (personas: Persona[]) => void;
  onEvaluationComplete: (evaluation: PersonaEvaluation) => void;
  onAllComplete: () => void;
}

export function LoadingScreen(props: LoadingScreenProps) {
  return <div>Loading placeholder...</div>;
}

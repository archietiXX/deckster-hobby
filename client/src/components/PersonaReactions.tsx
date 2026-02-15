import type { Persona, PersonaEvaluation, Recommendation } from '@deckster/shared/types';

interface PersonaReactionsProps {
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  goal: string;
  onShowRecommendations: (recs: Recommendation[]) => void;
  onStartOver: () => void;
}

export function PersonaReactions(props: PersonaReactionsProps) {
  return <div>PersonaReactions placeholder</div>;
}

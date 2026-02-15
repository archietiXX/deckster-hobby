import type { Recommendation, Persona } from '@deckster/shared/types';

interface RecommendationsProps {
  recommendations: Recommendation[];
  personas: Persona[];
  onBack: () => void;
  onStartOver: () => void;
}

export function Recommendations(props: RecommendationsProps) {
  return <div>Recommendations placeholder</div>;
}

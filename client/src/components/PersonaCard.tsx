import type { Persona, PersonaEvaluation } from '@deckster/shared/types';

interface PersonaCardProps {
  persona: Persona;
  evaluation?: PersonaEvaluation;
  isExpanded: boolean;
  onToggle: () => void;
}

export function PersonaCard({ persona, evaluation, isExpanded, onToggle }: PersonaCardProps) {
  return <div>PersonaCard placeholder — {persona.name}</div>;
}

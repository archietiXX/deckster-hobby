import type { Persona, PersonaEvaluation } from '@deckster/shared/types';
import { audienceCategories } from '../data/audienceCategories';

interface PersonaCardProps {
  persona: Persona;
  evaluation?: PersonaEvaluation;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export function PersonaCard({ persona, evaluation, isExpanded, onToggle, index }: PersonaCardProps) {
  const categoryLabel =
    audienceCategories.find((c) => c.id === persona.audienceCategoryId)?.label ?? '';

  return (
    <div
      className={`bg-bg-primary border rounded-xl overflow-hidden animate-fade-in-up transition-[border-color,box-shadow] duration-200 ${
        isExpanded
          ? 'border-border shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
          : 'border-border hover:border-gray-300'
      }`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Header -- always visible */}
      <button
        className="flex items-center gap-4 w-full px-6 py-4 bg-transparent border-none text-inherit cursor-pointer text-left font-sans hover:bg-bg-secondary/50"
        onClick={onToggle}
        type="button"
      >
        <div className="w-11 h-11 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xl font-medium shrink-0">
          {persona.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold leading-snug text-text-primary">{persona.name}</h3>
          <p className="text-[13px] text-text-secondary mt-px">{persona.title}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-bg-accent-light text-accent-light text-[11px] font-medium rounded-full">
            {categoryLabel}
          </span>
        </div>
        <svg
          className={`text-text-secondary shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && evaluation && (
        <div className="px-6 pb-6 flex flex-col gap-6 animate-fade-in">
          {/* Reaction paragraphs */}
          <div className="flex flex-col gap-4">
            {evaluation.reaction.split('\n').filter(Boolean).map((paragraph, i) => (
              <p key={i} className="text-[15px] leading-[1.7] text-text-primary">{paragraph}</p>
            ))}
          </div>

          {/* Core points */}
          <div className="p-4 bg-bg-secondary border border-border rounded-lg">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-accent mb-2">
              Core Points
            </h4>
            <ul className="list-none flex flex-col gap-2">
              {evaluation.corePoints.map((point, i) => (
                <li key={i} className="relative pl-4 text-sm leading-normal text-text-secondary before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-accent">
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Background context */}
          <div className="pt-4 border-t border-border">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
              About this reviewer
            </p>
            <p className="text-[13px] leading-relaxed text-text-secondary">{persona.background}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {persona.keyConcerns.map((concern, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-bg-secondary border border-border rounded-full text-[11px] text-text-secondary">
                  {concern}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

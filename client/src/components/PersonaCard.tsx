import { useState } from 'react';
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
  const category = audienceCategories.find((c) => c.id === persona.audienceCategoryId);
  const categoryLabel = category?.label ?? '';
  const [showThinking, setShowThinking] = useState(false);

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
        className="flex items-center gap-3 sm:gap-4 w-full px-4 sm:px-6 py-3 sm:py-4 bg-transparent border-none text-inherit cursor-pointer text-left font-sans hover:bg-bg-secondary/50"
        onClick={() => onToggle()}
        type="button"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg sm:text-xl font-medium shrink-0">
          {persona.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug text-text-primary">{persona.name}</h3>
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
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col gap-6 animate-fade-in">
          {/* 1. Decision — color-coded by sentiment */}
          {evaluation.decision && (() => {
            const sentiment = evaluation.decisionSentiment ?? 'mixed';
            const styles = {
              positive: {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                icon: 'text-emerald-600',
                label: 'text-emerald-700',
              },
              negative: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                icon: 'text-red-500',
                label: 'text-red-600',
              },
              mixed: {
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                icon: 'text-amber-500',
                label: 'text-amber-600',
              },
            }[sentiment];
            return (
              <div className={`flex gap-3 p-4 ${styles.bg} border ${styles.border} rounded-lg`}>
                {sentiment === 'positive' && (
                  <svg className={`w-5 h-5 ${styles.icon} shrink-0 mt-0.5`} viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6.5 10.5L9 13L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {sentiment === 'negative' && (
                  <svg className={`w-5 h-5 ${styles.icon} shrink-0 mt-0.5`} viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 7L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
                {sentiment === 'mixed' && (
                  <svg className={`w-5 h-5 ${styles.icon} shrink-0 mt-0.5`} viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6.5 10H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${styles.label} mb-1`}>
                    Decision
                  </p>
                  <p className="text-[14px] leading-relaxed text-text-primary font-semibold">
                    {evaluation.decision}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* 2. Red Flags & Green Flags */}
          <div className="flex flex-col gap-6">
            {/* Green Flags */}
            {evaluation.greenFlags.length > 0 && (
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 mb-2">
                  Green Flags
                </h4>
                <ul className="list-none flex flex-col gap-2">
                  {evaluation.greenFlags.map((point, i) => (
                    <li key={i} className="relative pl-4 text-[14px] leading-relaxed text-text-primary before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-emerald-500">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Red Flags */}
            {evaluation.redFlags.length > 0 && (
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-red-600 mb-2">
                  Red Flags
                </h4>
                <ul className="list-none flex flex-col gap-2">
                  {evaluation.redFlags.map((point, i) => (
                    <li key={i} className="relative pl-4 text-[14px] leading-relaxed text-text-primary before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-red-500">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 3. Detailed thinking — expandable */}
          <div>
            <button
              className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-150 cursor-pointer bg-transparent border-none p-0 font-sans"
              onClick={() => setShowThinking((prev) => !prev)}
              type="button"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showThinking ? 'rotate-90' : ''}`}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {showThinking ? 'Hide' : 'See'} detailed thinking
            </button>
            {showThinking && (
              <div className="mt-3 border-l-2 border-accent/20 pl-4 flex flex-col gap-1 animate-fade-in">
                {evaluation.reaction.split('\n').filter(Boolean).map((line, i) => (
                  <p key={i} className="text-[14px] leading-[1.6] text-text-primary/80 italic">{line}</p>
                ))}
              </div>
            )}
          </div>

          {/* Evidence type */}
          {category?.evidenceType && (
            <div className="pt-4 border-t border-border">
              <p className="text-[13px] leading-relaxed text-text-secondary">
                <span className="text-[11px] font-semibold uppercase tracking-wide">Looks for:</span>{' '}
                {category.evidenceType}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

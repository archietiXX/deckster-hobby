import { useState, useCallback } from 'react';
import type { Persona, PersonaEvaluation, Recommendation } from '@deckster/shared/types';
import { fetchRecommendations } from '../services/api';
import { PersonaCard } from './PersonaCard';

interface PersonaReactionsProps {
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  goal: string;
  onShowRecommendations: (recs: Recommendation[]) => void;
  onStartOver: () => void;
}

export function PersonaReactions({
  personas,
  evaluations,
  goal,
  onShowRecommendations,
  onStartOver,
}: PersonaReactionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(personas[0]?.id ?? null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState('');

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleShowRecommendations = useCallback(async () => {
    setIsLoadingRecs(true);
    setRecsError('');
    try {
      const recs = await fetchRecommendations(goal, personas, evaluations);
      onShowRecommendations(recs);
    } catch (err) {
      setRecsError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setIsLoadingRecs(false);
    }
  }, [goal, personas, evaluations, onShowRecommendations]);

  return (
    <div className="min-h-screen flex justify-center relative overflow-y-auto bg-bg-primary">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-[1] w-full max-w-2xl px-6 py-12 flex flex-col gap-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 animate-fade-in-up">
          <div>
            <h1 className="font-sans text-[32px] font-normal tracking-tight text-text-primary">
              Panel Reactions
            </h1>
            <p className="text-[15px] text-text-secondary mt-1">
              {personas.length} personas reviewed your presentation. Click each card to see their full feedback.
            </p>
          </div>
          <button
            className="px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-[13px] cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
            onClick={onStartOver}
            type="button"
          >
            Start over
          </button>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2">
          {personas.map((persona, i) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              evaluation={evaluations.find((e) => e.personaId === persona.id)}
              isExpanded={expandedId === persona.id}
              onToggle={() => handleToggle(persona.id)}
              index={i}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-2 py-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent border-none rounded-lg text-white font-sans text-base font-semibold cursor-pointer transition-all duration-200 shadow-[0_2px_12px_rgba(0,21,255,0.2)] hover:enabled:bg-accent-hover hover:enabled:shadow-[0_4px_20px_rgba(0,21,255,0.3)] hover:enabled:-translate-y-px disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleShowRecommendations}
            disabled={isLoadingRecs}
            type="button"
          >
            {isLoadingRecs ? (
              <>
                <div className="w-[18px] h-[18px] border-2 border-white/20 border-t-white rounded-full animate-spin-slow" />
                Generating recommendations...
              </>
            ) : (
              <>
                Show Recommendations
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M11 5L16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
          {recsError && (
            <p className="text-[13px] text-error">{recsError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

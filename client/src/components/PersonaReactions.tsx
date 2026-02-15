import { useState, useCallback, useMemo } from 'react';
import type { Persona, PersonaEvaluation, Recommendation, OverallSummary } from '@deckster/shared/types';
import { fetchRecommendations } from '../services/api';
import { PersonaCard } from './PersonaCard';

function computeSuccessScore(evaluations: PersonaEvaluation[]) {
  if (evaluations.length === 0) return { percent: 0, label: 'No data', color: 'text-text-secondary', bg: 'bg-bg-secondary', bar: 'bg-border' };
  const total = evaluations.reduce((sum, ev) => {
    if (ev.decisionSentiment === 'positive') return sum + 1;
    if (ev.decisionSentiment === 'mixed') return sum + 0.5;
    return sum;
  }, 0);
  const percent = Math.round((total / evaluations.length) * 100);

  if (percent >= 80) return { percent, label: 'High chance', color: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500' };
  if (percent >= 60) return { percent, label: 'Good chance', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-400' };
  if (percent >= 40) return { percent, label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-400' };
  if (percent >= 20) return { percent, label: 'Challenging', color: 'text-orange-600', bg: 'bg-orange-50', bar: 'bg-orange-400' };
  return { percent, label: 'Low chance', color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' };
}

interface PersonaReactionsProps {
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  goal: string;
  overallSummary: OverallSummary | null;
  onShowRecommendations: (recs: Recommendation[]) => void;
  onStartOver: () => void;
}

export function PersonaReactions({
  personas,
  evaluations,
  goal,
  overallSummary,
  onShowRecommendations,
  onStartOver,
}: PersonaReactionsProps) {
  const score = useMemo(() => computeSuccessScore(evaluations), [evaluations]);
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

        {/* Overall Assessment */}
        <div className={`${score.bg} border border-border rounded-xl p-6 flex flex-col gap-4 animate-fade-in-up`} style={{ animationDelay: '0.05s' }}>
          {/* Goal reference */}
          <p className="text-[13px] text-text-secondary leading-relaxed">
            <span className="text-[11px] font-semibold uppercase tracking-wide">Goal:</span>{' '}
            {goal}
          </p>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
                Chance of success
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-[28px] font-semibold tracking-tight ${score.color}`}>
                  {score.percent}%
                </span>
                <span className={`text-sm font-medium ${score.color}`}>
                  {score.label}
                </span>
              </div>
            </div>
            {/* Mini verdict dots */}
            <div className="flex gap-1.5">
              {evaluations.map((ev) => (
                <div
                  key={ev.personaId}
                  className={`w-3 h-3 rounded-full ${
                    ev.decisionSentiment === 'positive'
                      ? 'bg-emerald-500'
                      : ev.decisionSentiment === 'negative'
                        ? 'bg-red-500'
                        : 'bg-amber-400'
                  }`}
                  title={personas.find((p) => p.id === ev.personaId)?.name}
                />
              ))}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${score.bar} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${score.percent}%` }}
            />
          </div>
          {/* Summary text */}
          {overallSummary && (
            <p className="text-[14px] leading-relaxed text-text-primary">
              {overallSummary.text}
            </p>
          )}
          {/* Strengths & Weaknesses — stacked */}
          {overallSummary && (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 mb-1.5">
                  What works well
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {overallSummary.strengths.map((s, i) => (
                    <span key={i} className="relative pl-3 text-[13px] leading-snug text-text-primary before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-emerald-500">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500 mb-1.5">
                  What needs work
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {overallSummary.weaknesses.map((w, i) => (
                    <span key={i} className="relative pl-3 text-[13px] leading-snug text-text-primary before:content-[''] before:absolute before:left-0 before:top-[6px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-red-400">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Recommendations CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-black/5">
            <p className="text-[13px] text-text-secondary">
              Want to improve your score?
            </p>
            <button
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent border-none rounded-lg text-white font-sans text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:enabled:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleShowRecommendations}
              disabled={isLoadingRecs}
              type="button"
            >
              {isLoadingRecs ? (
                <>
                  <div className="w-3.5 h-3.5 border-[1.5px] border-white/20 border-t-white rounded-full animate-spin-slow" />
                  Generating...
                </>
              ) : (
                <>
                  See recommendations
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M11 5L16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>
          {recsError && (
            <p className="text-[13px] text-error">{recsError}</p>
          )}
        </div>

        {/* Detailed breakdown */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-sans text-[22px] font-normal tracking-tight text-text-primary">
            Detailed breakdown
          </h2>
          <p className="text-[14px] text-text-secondary mt-1">
            Each persona's full inner monologue and verdict.
          </p>
        </div>
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

      </div>
    </div>
  );
}

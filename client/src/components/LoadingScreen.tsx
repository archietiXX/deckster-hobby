import { useEffect, useState, useRef } from 'react';
import type { SlideContent, Persona, PersonaEvaluation, OverallSummary } from '@deckster/shared/types';
import { startEvaluation } from '../services/api';
import { audienceCategories } from '../data/audienceCategories';

interface LoadingScreenProps {
  slideContents: SlideContent[];
  goal: string;
  audienceCategoryIds: string[];
  audienceContext?: string;
  onPersonasGenerated: (personas: Persona[]) => void;
  onEvaluationComplete: (evaluation: PersonaEvaluation) => void;
  onSummary: (summary: OverallSummary) => void;
  onAllComplete: () => void;
}

export function LoadingScreen({
  slideContents,
  goal,
  audienceCategoryIds,
  onPersonasGenerated,
  audienceContext,
  onEvaluationComplete,
  onSummary,
  onAllComplete,
}: LoadingScreenProps) {
  const [phase, setPhase] = useState<'generating' | 'evaluating' | 'summarizing' | 'error'>('generating');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let personaCount = 0;
    let evalCount = 0;

    startEvaluation(slideContents, goal, audienceCategoryIds, audienceContext, {
      onPersonas: (newPersonas) => {
        personaCount = newPersonas.length;
        setPersonas(newPersonas);
        setPhase('evaluating');
        onPersonasGenerated(newPersonas);
      },
      onEvaluation: (evaluation) => {
        evalCount++;
        setCompletedIds((prev) => new Set(prev).add(evaluation.personaId));
        onEvaluationComplete(evaluation);
        if (evalCount >= personaCount) {
          setPhase('summarizing');
        }
      },
      onSummary: (summary) => {
        onSummary(summary);
      },
      onDone: () => {
        onAllComplete();
      },
      onError: (message) => {
        setError(message);
        setPhase('error');
      },
    });
  }, []);

  const getCategoryLabel = (categoryId: string) =>
    audienceCategories.find((c) => c.id === categoryId)?.label ?? categoryId;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-primary">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 flex w-full max-w-[560px] animate-fade-in flex-col gap-8 p-8">
        {/* Phase indicator */}
        <div className="flex flex-col gap-6">
          <div className="flex gap-2">
            <div
              className={`h-1 w-8 rounded-full transition-colors duration-500 ${
                phase === 'generating'
                  ? 'animate-pulse-dot bg-accent'
                  : 'bg-success'
              }`}
            />
            <div
              className={`h-1 w-8 rounded-full transition-colors duration-500 ${
                phase === 'evaluating'
                  ? 'animate-pulse-dot bg-accent'
                  : phase === 'generating'
                    ? 'bg-border'
                    : 'bg-success'
              }`}
            />
            <div
              className={`h-1 w-8 rounded-full transition-colors duration-500 ${
                phase === 'summarizing'
                  ? 'animate-pulse-dot bg-accent'
                  : phase === 'generating' || phase === 'evaluating'
                    ? 'bg-border'
                    : 'bg-success'
              }`}
            />
          </div>

          {phase === 'generating' && (
            <div className="flex items-start gap-4">
              <div className="mt-0.5 h-6 w-6 shrink-0 animate-spin-slow rounded-full border-2 border-border border-t-accent" />
              <div>
                <h2 className="font-sans text-[22px] font-normal leading-tight tracking-tight">
                  Building your audience panel
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Generating 5 realistic personas based on your audience selection...
                </p>
              </div>
            </div>
          )}

          {phase === 'evaluating' && (
            <div className="flex items-start gap-4">
              <div className="mt-0.5 h-6 w-6 shrink-0 animate-spin-slow rounded-full border-2 border-border border-t-accent" />
              <div>
                <h2 className="font-sans text-[22px] font-normal leading-tight tracking-tight">
                  Your panel is reviewing the deck
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {completedIds.size} of {personas.length} evaluations complete
                </p>
              </div>
            </div>
          )}

          {phase === 'summarizing' && (
            <div className="flex items-start gap-4">
              <div className="mt-0.5 h-6 w-6 shrink-0 animate-spin-slow rounded-full border-2 border-border border-t-accent" />
              <div>
                <h2 className="font-sans text-[22px] font-normal leading-tight tracking-tight">
                  Synthesizing overall assessment
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Combining all panel feedback into a verdict...
                </p>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex items-start gap-4 text-error">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
              </svg>
              <div>
                <h2 className="font-sans text-[22px] font-normal leading-tight tracking-tight">
                  Something went wrong
                </h2>
                <p className="mt-1 text-sm text-error">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Persona cards */}
        {personas.length > 0 && (
          <div className="flex flex-col gap-2">
            {personas.map((persona, i) => {
              const isDone = completedIds.has(persona.id);
              return (
                <div
                  key={persona.id}
                  className={`flex animate-slide-in-up items-center gap-4 rounded-lg border bg-bg-primary p-4 transition-[border-color,box-shadow] duration-300 ${
                    isDone
                      ? 'border-success/20 shadow-[0_0_20px_rgba(34,197,94,0.04)]'
                      : 'border-border'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-sans text-lg font-medium ${
                      isDone
                        ? 'bg-success/10 text-success'
                        : 'bg-bg-secondary text-accent'
                    }`}
                  >
                    {persona.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-text-primary">
                      {persona.name}
                    </p>
                    <p className="truncate text-[13px] text-text-secondary">
                      {persona.title}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-accent-light/15 px-2 py-0.5 text-[11px] font-medium text-accent-light">
                      {getCategoryLabel(persona.audienceCategoryId)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="shrink-0 text-success">
                    {isDone ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-text-secondary" />
                        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-text-secondary [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-text-secondary [animation-delay:0.4s]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

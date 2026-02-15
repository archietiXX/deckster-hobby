import type { Recommendation, Persona, PersonaEvaluation, OverallSummary } from '@deckster/shared/types';
import { generateReport } from '../services/pdfExport';
import { Footer } from './Footer';

interface RecommendationsProps {
  mainAdvice: string;
  recommendations: Recommendation[];
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  overallSummary: OverallSummary | null;
  goal: string;
  isLoading?: boolean;
  onBack: () => void;
  onStartOver: () => void;
}

const priorityConfig = {
  top: {
    label: 'Top Priority',
    badge: 'bg-red-50 text-red-700 border-red-200',
    accent: 'bg-red-600',
    border: 'border-red-200 hover:border-red-300',
    ring: 'shadow-[0_2px_12px_rgba(220,38,38,0.08)]',
  },
  important: {
    label: 'Important',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    accent: 'bg-amber-500',
    border: 'border-amber-200 hover:border-amber-300',
    ring: '',
  },
  consider: {
    label: 'Consider',
    badge: 'bg-slate-50 text-slate-600 border-slate-200',
    accent: 'bg-slate-400',
    border: 'border-border hover:border-gray-300',
    ring: '',
  },
};

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="flex gap-4 sm:gap-5 p-4 sm:p-6 bg-bg-primary border border-border rounded-xl animate-pulse"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="w-9 h-9 rounded-full bg-border shrink-0" />
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-4 w-40 bg-border rounded" />
          <div className="h-4 w-16 bg-border rounded-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-full bg-border/70 rounded" />
          <div className="h-3 w-5/6 bg-border/70 rounded" />
          <div className="h-3 w-3/4 bg-border/70 rounded" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-28 bg-border/50 rounded-full" />
          <div className="h-5 w-24 bg-border/50 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function Recommendations({
  mainAdvice,
  recommendations,
  personas,
  evaluations,
  overallSummary,
  goal,
  isLoading,
  onBack,
  onStartOver,
}: RecommendationsProps) {
  const getPersonaLabel = (id: string) => {
    const p = personas.find((p) => p.id === id);
    return p ? `${p.name}, ${p.title}` : id;
  };

  const handleSaveReport = () => {
    generateReport({
      goal,
      personas,
      evaluations,
      overallSummary,
      mainAdvice,
      recommendations,
    });
  };

  return (
    <div className="min-h-screen flex justify-center relative overflow-y-auto bg-bg-primary">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-[1] w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12 pb-16 flex flex-col gap-6 sm:gap-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <button
            className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-sm cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
            onClick={onBack}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Back to reactions</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-none rounded-lg text-white font-sans text-[13px] font-semibold cursor-pointer transition-all duration-200 shadow-[0_1px_3px_rgba(0,21,255,0.2)] bg-gradient-to-r from-accent via-accent-light to-accent bg-[length:200%_100%] animate-shimmer hover:shadow-[0_2px_8px_rgba(0,21,255,0.3)]"
              onClick={handleSaveReport}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Save report</span>
              <span className="sm:hidden">Save</span>
            </button>
            <button
              className="px-3 sm:px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-[13px] cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
              onClick={onStartOver}
              type="button"
            >
              Start over
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h1 className="font-sans text-[24px] sm:text-[32px] font-normal tracking-tight text-text-primary">
            Recommendations
          </h1>
          <p className="text-[14px] sm:text-[15px] text-text-secondary mt-1">
            Improvements ranked by impact on your presentation goal.
          </p>
        </div>

        {/* Skeleton state */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* Main advice */}
        {!isLoading && mainAdvice && (
          <div className="p-4 sm:p-5 bg-accent/[0.03] border border-accent/15 rounded-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-2.5">
              <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.81 18.02L10 15.27L5.19 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-accent">
                Main Advice
              </h2>
            </div>
            <p className="text-[14px] sm:text-[15px] leading-[1.7] text-text-primary">
              {mainAdvice}
            </p>
          </div>
        )}

        {/* Practical recommendations */}
        {!isLoading && recommendations.length > 0 && (
          <>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                Practical Steps
              </h2>
            </div>

            <div className="flex flex-col gap-4 -mt-4">
              {recommendations.map((rec, i) => {
                const config = priorityConfig[rec.priority] ?? priorityConfig.consider;
                return (
                  <div
                    key={rec.number}
                    className={`flex gap-4 sm:gap-5 p-4 sm:p-6 bg-bg-primary border rounded-xl animate-fade-in-up transition-[border-color,box-shadow] duration-200 ${config.border} ${config.ring}`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${config.accent} text-white flex items-center justify-center font-sans text-base sm:text-lg font-semibold shrink-0`}>
                      {rec.number}
                    </div>
                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <h3 className="text-[14px] sm:text-[15px] font-semibold text-text-primary leading-snug">
                          {rec.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full border ${config.badge}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-[13px] sm:text-[14px] leading-[1.7] text-text-secondary">{rec.text}</p>
                      {rec.priorityRationale && (
                        <p className="text-[12px] sm:text-[13px] leading-relaxed text-text-secondary/70 italic">
                          <span className="font-semibold not-italic text-text-secondary">Why?</span>{' '}
                          {rec.priorityRationale}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {rec.relatedPersonaIds.map((id) => (
                          <span
                            key={id}
                            className="px-2 sm:px-2.5 py-0.5 bg-bg-accent-light text-accent-light rounded-full text-[11px] sm:text-xs font-medium"
                          >
                            {getPersonaLabel(id)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

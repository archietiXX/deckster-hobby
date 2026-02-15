import type { Recommendation, Persona } from '@deckster/shared/types';

interface RecommendationsProps {
  mainAdvice: string;
  recommendations: Recommendation[];
  personas: Persona[];
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

export function Recommendations({
  mainAdvice,
  recommendations,
  personas,
  onBack,
  onStartOver,
}: RecommendationsProps) {
  const getPersonaName = (id: string) =>
    personas.find((p) => p.id === id)?.name ?? id;

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
        <div className="flex items-center justify-between animate-fade-in-up">
          <button
            className="flex items-center gap-1 px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-sm cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
            onClick={onBack}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to reactions
          </button>
          <button
            className="px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-[13px] cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
            onClick={onStartOver}
            type="button"
          >
            Start over
          </button>
        </div>

        {/* Title */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h1 className="font-sans text-[32px] font-normal tracking-tight text-text-primary">
            Recommendations
          </h1>
          <p className="text-[15px] text-text-secondary mt-1">
            Improvements ranked by impact on your presentation goal.
          </p>
        </div>

        {/* Main advice */}
        {mainAdvice && (
          <div className="p-5 bg-accent/[0.03] border border-accent/15 rounded-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-2.5">
              <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.81 18.02L10 15.27L5.19 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-accent">
                Main Advice
              </h2>
            </div>
            <p className="text-[15px] leading-[1.7] text-text-primary">
              {mainAdvice}
            </p>
          </div>
        )}

        {/* Practical recommendations */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Practical Steps
          </h2>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4 -mt-4">
          {recommendations.map((rec, i) => {
            const config = priorityConfig[rec.priority] ?? priorityConfig.consider;
            return (
              <div
                key={rec.number}
                className={`flex gap-5 p-6 bg-bg-primary border rounded-xl animate-fade-in-up transition-[border-color,box-shadow] duration-200 ${config.border} ${config.ring}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`w-9 h-9 rounded-full ${config.accent} text-white flex items-center justify-center font-sans text-lg font-semibold shrink-0`}>
                  {rec.number}
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-[15px] font-semibold text-text-primary leading-snug">
                      {rec.title}
                    </h3>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full border ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-[14px] leading-[1.7] text-text-secondary">{rec.text}</p>
                  {rec.priorityRationale && (
                    <p className="text-[13px] leading-relaxed text-text-secondary/70 italic">
                      <span className="font-semibold not-italic text-text-secondary">Why?</span>{' '}
                      {rec.priorityRationale}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {rec.relatedPersonaIds.map((id) => (
                      <span
                        key={id}
                        className="px-2.5 py-0.5 bg-bg-accent-light text-accent-light rounded-full text-xs font-medium"
                      >
                        {getPersonaName(id)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import type { Recommendation, Persona } from '@deckster/shared/types';

interface RecommendationsProps {
  recommendations: Recommendation[];
  personas: Persona[];
  onBack: () => void;
  onStartOver: () => void;
}

export function Recommendations({
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
            5 critical improvements synthesized from your panel's feedback.
          </p>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {recommendations.map((rec, i) => (
            <div
              key={rec.number}
              className="flex gap-6 p-6 bg-bg-primary border border-border rounded-xl animate-fade-in-up transition-[border-color] duration-200 hover:border-gray-300"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-sans text-lg font-semibold shrink-0">
                {rec.number}
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <p className="text-[15px] leading-[1.7] text-text-primary">{rec.text}</p>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                    Based on feedback from:
                  </span>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

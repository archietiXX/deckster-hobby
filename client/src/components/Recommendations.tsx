import { useEffect, useMemo, useState } from 'react';
import type { Recommendation, StructureAdvice, Persona, PersonaEvaluation, OverallSummary, SlideContent } from '@deckster/shared/types';
import { generateReport } from '../services/pdfExport';
import { ExportModal } from './ExportModal';
import type { ExportOptions } from './ExportModal';
import { Footer } from './Footer';

interface RecommendationsProps {
  mainAdvice: string;
  structureAdvice: StructureAdvice[];
  recommendations: Recommendation[];
  personas: Persona[];
  evaluations: PersonaEvaluation[];
  overallSummary: OverallSummary | null;
  goal: string;
  slideContents: SlideContent[];
  isLoading?: boolean;
  error?: string;
  onRetry: () => void;
  onBack: () => void;
  onStartOver: () => void;
}

const actionConfig = {
  add: { label: 'Add', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '+' },
  delete: { label: 'Remove', badge: 'bg-red-50 text-red-700 border-red-200', icon: '\u2212' },
  reorder: { label: 'Reorder', badge: 'bg-violet-50 text-violet-700 border-violet-200', icon: '\u2195' },
};

type Priority = 'top' | 'critical' | 'important' | 'consider';
const priorityOrder: Priority[] = ['top', 'critical', 'important', 'consider'];

const priorityConfig = {
  top: {
    label: 'Top Priority',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  critical: {
    label: 'Critical',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  important: {
    label: 'Important',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  consider: {
    label: 'Consider',
    badge: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

interface SlideGroup {
  slideNumber: number | null; // null = General
  title: string;
  recommendations: Recommendation[];
}

function getSlideTitle(text: string): string {
  const firstLine = text.split('\n')[0]?.trim() ?? '';
  return firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine;
}

function groupBySlide(recommendations: Recommendation[], slideContents: SlideContent[]): SlideGroup[] {
  const slideMap = new Map<number, Recommendation[]>();
  const general: Recommendation[] = [];

  for (const rec of recommendations) {
    const slides = rec.slideNumbers ?? [];
    if (slides.length === 0) {
      general.push(rec);
    } else {
      const primary = slides[0];
      if (!slideMap.has(primary)) slideMap.set(primary, []);
      slideMap.get(primary)!.push(rec);
    }
  }

  const titleLookup = new Map(slideContents.map((s) => [s.slideNumber, getSlideTitle(s.text)]));

  const groups: SlideGroup[] = [...slideMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([num, recs]) => ({
      slideNumber: num,
      title: titleLookup.get(num) ?? `Slide ${num}`,
      recommendations: recs,
    }));

  if (general.length > 0) {
    groups.unshift({ slideNumber: null, title: 'General', recommendations: general });
  }

  return groups;
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="flex gap-3 py-3 animate-pulse"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-border shrink-0 mt-2" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-3.5 w-48 bg-border rounded" />
        <div className="h-3 w-full bg-border/70 rounded" />
        <div className="h-3 w-3/4 bg-border/70 rounded" />
      </div>
    </div>
  );
}

/** Inline chevron button — expanded content rendered separately by parent */
function AddressesConcernsToggle({
  count,
  isExpanded,
  onToggle,
}: {
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  if (count === 0) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-text-secondary/60 hover:text-text-secondary transition-colors duration-150 cursor-pointer bg-transparent border-none p-0 text-left"
    >
      <span>Addresses concerns of {count} {count === 1 ? 'person' : 'people'}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}>
        <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function PersonaPills({ personaIds, getPersonaLabel }: { personaIds: string[]; getPersonaLabel: (id: string) => string }) {
  return (
    <div className="flex flex-wrap gap-1.5 pl-0.5 animate-fade-in">
      {personaIds.map((id) => (
        <span key={id} className="px-2 py-0.5 bg-bg-accent-light text-accent-light rounded-full text-[10px] sm:text-[11px] font-medium">
          {getPersonaLabel(id)}
        </span>
      ))}
    </div>
  );
}

function StructureItem({
  advice: sa,
  getPersonaLabel,
}: {
  advice: StructureAdvice;
  getPersonaLabel: (id: string) => string;
}) {
  const ac = actionConfig[sa.action] ?? actionConfig.add;
  const [expanded, setExpanded] = useState<'why' | 'addresses' | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <span className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded border self-start ${ac.badge}`}>
        {ac.icon} {ac.label}
      </span>
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-[13px] leading-[1.6] text-text-primary">{sa.description}</p>
        <div className="flex items-center gap-3">
          {sa.rationale && (
            <button
              type="button"
              onClick={() => setExpanded(expanded === 'why' ? null : 'why')}
              className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-text-secondary/60 hover:text-text-secondary transition-colors duration-150 cursor-pointer bg-transparent border-none p-0"
            >
              <span>Why?</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`transition-transform duration-150 ${expanded === 'why' ? 'rotate-90' : ''}`}
              >
                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <AddressesConcernsToggle
            count={sa.relatedPersonaIds.length}
            isExpanded={expanded === 'addresses'}
            onToggle={() => setExpanded(expanded === 'addresses' ? null : 'addresses')}
          />
        </div>
        {expanded === 'why' && sa.rationale && (
          <p className="text-[12px] sm:text-[13px] leading-[1.7] text-text-secondary/80 italic pl-0.5 animate-fade-in">
            {sa.rationale}
          </p>
        )}
        {expanded === 'addresses' && sa.relatedPersonaIds.length > 0 && (
          <PersonaPills personaIds={sa.relatedPersonaIds} getPersonaLabel={getPersonaLabel} />
        )}
      </div>
    </div>
  );
}

function RecBullet({
  rec,
  index,
  getPersonaLabel,
}: {
  rec: Recommendation;
  index: number;
  getPersonaLabel: (id: string) => string;
}) {
  const config = priorityConfig[rec.priority] ?? priorityConfig.consider;
  const extraSlides = (rec.slideNumbers ?? []).slice(1);
  const [expanded, setExpanded] = useState<'why' | 'addresses' | null>(null);

  return (
    <div
      className="flex gap-3 py-2 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0 mt-[7px]`} />
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] sm:text-[14px] font-semibold text-text-primary leading-snug">
            {rec.title}
          </span>
          <span className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded-full border ${config.badge}`}>
            {config.label}
          </span>
          {extraSlides.map((sn) => (
            <span
              key={sn}
              className="px-1.5 py-0.5 text-[9px] font-medium rounded-full border border-slate-200 bg-slate-50 text-slate-500"
            >
              +Slide {sn}
            </span>
          ))}
        </div>
        <p className="text-[13px] leading-[1.6] text-text-secondary">{rec.text}</p>
        <div className="flex items-center gap-3">
          {rec.priorityRationale && (
            <button
              type="button"
              onClick={() => setExpanded(expanded === 'why' ? null : 'why')}
              className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-text-secondary/60 hover:text-text-secondary transition-colors duration-150 cursor-pointer bg-transparent border-none p-0"
            >
              <span>Why?</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`transition-transform duration-150 ${expanded === 'why' ? 'rotate-90' : ''}`}
              >
                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <AddressesConcernsToggle
            count={rec.relatedPersonaIds.length}
            isExpanded={expanded === 'addresses'}
            onToggle={() => setExpanded(expanded === 'addresses' ? null : 'addresses')}
          />
        </div>
        {expanded === 'why' && rec.priorityRationale && (
          <p className="text-[12px] sm:text-[13px] leading-[1.7] text-text-secondary/80 italic pl-0.5 animate-fade-in">
            {rec.priorityRationale}
          </p>
        )}
        {expanded === 'addresses' && rec.relatedPersonaIds.length > 0 && (
          <PersonaPills personaIds={rec.relatedPersonaIds} getPersonaLabel={getPersonaLabel} />
        )}
      </div>
    </div>
  );
}

export function Recommendations({
  mainAdvice,
  structureAdvice,
  recommendations,
  personas,
  evaluations,
  overallSummary,
  goal,
  slideContents,
  isLoading,
  error,
  onRetry,
  onBack,
  onStartOver,
}: RecommendationsProps) {
  const getPersonaLabel = (id: string) => {
    const p =
      personas.find((p) => p.id === id) ??
      personas.find((p) => p.name === id) ??
      personas.find((p) => p.name.toLowerCase() === id.toLowerCase());
    return p ? `${p.name}, ${p.title}` : id;
  };

  // Countdown timer for recommendation generation (80 seconds = 1:20)
  const [loadingElapsed, setLoadingElapsed] = useState(0);
  useEffect(() => {
    if (!isLoading) { setLoadingElapsed(0); return; }
    const interval = setInterval(() => setLoadingElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isLoading]);
  const loadingRemaining = Math.max(0, 80 - loadingElapsed);
  const loadingOverTime = loadingRemaining === 0;
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Slides marked for deletion — don't show per-slide recommendations for these
  const deletedSlides = useMemo(() => {
    const deleted = new Set<number>();
    for (const sa of structureAdvice) {
      if (sa.action === 'delete') {
        // Extract slide numbers mentioned in the description (e.g., "slide 6")
        const matches = sa.description.matchAll(/slide\s+(\d+)/gi);
        for (const m of matches) deleted.add(Number(m[1]));
      }
    }
    return deleted;
  }, [structureAdvice]);

  // Priority filter — null means "show all"
  const [activePriority, setActivePriority] = useState<Priority | null>(null);

  // Which priorities actually exist in the data (for rendering only relevant chips)
  const availablePriorities = useMemo(
    () => priorityOrder.filter((p) => recommendations.some((r) => r.priority === p)),
    [recommendations],
  );

  const filteredRecommendations = useMemo(() => {
    let recs = recommendations;

    // Filter out deleted slides
    if (deletedSlides.size > 0) {
      recs = recs.filter((rec) => {
        const slides = rec.slideNumbers ?? [];
        return slides.length === 0 || !deletedSlides.has(slides[0]);
      });
    }

    // Filter by priority
    if (activePriority) {
      recs = recs.filter((rec) => rec.priority === activePriority);
    }

    return recs;
  }, [recommendations, deletedSlides, activePriority]);

  const groups = useMemo(
    () => groupBySlide(filteredRecommendations, slideContents),
    [filteredRecommendations, slideContents],
  );

  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportConfirm = (exportOptions: ExportOptions) => {
    setShowExportModal(false);
    window.posthog?.capture('Evaluator_report');
    generateReport({
      goal,
      personas,
      evaluations,
      overallSummary,
      mainAdvice,
      structureAdvice,
      recommendations,
    }, exportOptions);
  };

  let bulletIndex = 0;

  return (
    <div className="min-h-screen flex justify-center relative overflow-y-auto bg-bg-primary">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at center, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 100%)',
        }}
      />

      <div className="relative z-[1] w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12 pb-16 flex flex-col gap-6 sm:gap-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <button
            className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-[13px] cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-bg-primary"
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
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 border-none rounded-lg text-white font-sans text-[14px] font-semibold transition-all duration-200 ${
                isLoading
                  ? 'opacity-35 cursor-not-allowed'
                  : 'cursor-pointer shadow-[0_1px_3px_rgba(0,21,255,0.2)] bg-gradient-to-r from-accent via-accent-light to-accent bg-[length:200%_100%] animate-shimmer hover:shadow-[0_2px_8px_rgba(0,21,255,0.3)]'
              }`}
              onClick={() => setShowExportModal(true)}
              disabled={isLoading}
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
          <div className="flex items-center gap-3">
            {isLoading && (
              <div className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 animate-spin-slow rounded-full border-2 border-border border-t-accent" />
            )}
            <div>
              <h1 className="font-sans text-[24px] sm:text-[32px] font-normal tracking-tight text-text-primary">
                Recommendations
              </h1>
              <p className="text-[14px] sm:text-[15px] text-text-secondary mt-1">
                {isLoading ? 'Synthesizing recommendations...' : 'Improvements ranked by impact on your presentation goal.'}
              </p>
            </div>
          </div>
        </div>

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex flex-col items-center gap-4 py-12 animate-fade-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-error">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-text-primary">Failed to generate recommendations</p>
              <p className="text-[13px] text-text-secondary mt-1 max-w-[360px]">{error}</p>
            </div>
            <button
              className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent border-none rounded-lg text-white text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-accent-hover"
              onClick={onRetry}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8a6 6 0 0110.89-3.48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14 8a6 6 0 01-10.89 3.48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14 2v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 14v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Try again
            </button>
          </div>
        )}

        {/* Skeleton state */}
        {isLoading && (
          <div className="flex flex-col gap-2 px-2">
            <div className="flex items-center gap-2 pb-2">
              <span className="text-[12px] text-text-secondary/60 tabular-nums">
                {formatCountdown(loadingRemaining)}
              </span>
              {loadingOverTime && (
                <span className="text-[12px] text-text-secondary/60 animate-fade-in">
                  — Taking a bit longer than usual, hang tight
                </span>
              )}
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* Strategic advice */}
        {!isLoading && mainAdvice && (
          <div className="p-4 sm:p-5 bg-accent/[0.03] border border-accent/15 rounded-xl animate-fade-in-up mt-4 sm:mt-6" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-2.5">
              <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.81 18.02L10 15.27L5.19 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                Strategic Advice
              </h2>
            </div>
            <p className="text-[14px] sm:text-[15px] leading-[1.7] text-text-primary">
              {mainAdvice}
            </p>
          </div>
        )}

        {/* Section 1: Deck Structure */}
        {!isLoading && structureAdvice.length > 0 && (
          <div className="flex flex-col gap-3 animate-fade-in-up mt-4 sm:mt-6" style={{ animationDelay: '0.15s' }}>
            <h2 className="text-[18px] sm:text-[20px] font-semibold text-text-primary">
              Deck Structure
            </h2>
            <div className="flex flex-col gap-2">
              {structureAdvice.map((sa, i) => (
                <StructureItem key={i} advice={sa} getPersonaLabel={getPersonaLabel} />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Slide Improvements */}
        {!isLoading && recommendations.length > 0 && (
          <div className="flex flex-col gap-5 animate-fade-in-up mt-4 sm:mt-6" style={{ animationDelay: '0.2s' }}>
            {/* Section header with inline filter */}
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-text-primary mr-2">
                Slide Improvements
              </h2>
              {availablePriorities.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActivePriority(null)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all duration-150 cursor-pointer ${
                      activePriority === null
                        ? 'bg-text-primary text-bg-primary border-text-primary'
                        : 'bg-transparent text-text-secondary border-border hover:border-gray-400'
                    }`}
                  >
                    All
                  </button>
                  {availablePriorities.map((p) => {
                    const cfg = priorityConfig[p];
                    const isActive = activePriority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setActivePriority(isActive ? null : p)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all duration-150 cursor-pointer ${
                          isActive
                            ? cfg.badge
                            : 'bg-transparent text-text-secondary border-border hover:border-gray-400'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Slide groups */}
            {groups.length === 0 && activePriority && (
              <p className="text-[13px] text-text-secondary/60 italic">
                No {priorityConfig[activePriority].label.toLowerCase()} recommendations.
              </p>
            )}
            <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <div
                key={group.slideNumber ?? 'general'}
                className="flex flex-col gap-1 animate-fade-in-up"
              >
                {/* Group heading */}
                <div className="flex items-center gap-2.5 pb-1.5 border-b border-border">
                  {group.slideNumber != null ? (
                    <>
                      <span className="text-[12px] sm:text-[13px] font-semibold text-text-secondary whitespace-nowrap">
                        Slide {group.slideNumber}
                      </span>
                      <span className="text-[12px] sm:text-[13px] text-text-secondary/60 truncate">
                        {group.title}
                      </span>
                    </>
                  ) : (
                    <span className="text-[12px] sm:text-[13px] font-semibold text-text-secondary">
                      General
                    </span>
                  )}
                </div>

                {/* Bullet items */}
                <div className="flex flex-col pl-1">
                  {group.recommendations.map((rec) => {
                    const idx = bulletIndex++;
                    return (
                      <RecBullet
                        key={rec.number}
                        rec={rec}
                        index={idx}
                        getPersonaLabel={getPersonaLabel}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
      {showExportModal && (
        <ExportModal
          availablePriorities={availablePriorities}
          hasStructureAdvice={structureAdvice.length > 0}
          onConfirm={handleExportConfirm}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

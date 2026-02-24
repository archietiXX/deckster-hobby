import { useState, useCallback } from 'react';

export interface ExportOptions {
  mainOverview: boolean;
  individualFeedback: boolean;
  deckStructure: boolean;
  priorities: {
    top: boolean;
    critical: boolean;
    important: boolean;
    consider: boolean;
  };
}

type Priority = 'top' | 'critical' | 'important' | 'consider';

interface ExportModalProps {
  availablePriorities: Priority[];
  hasStructureAdvice: boolean;
  onConfirm: (options: ExportOptions) => void;
  onClose: () => void;
}

const priorityLabels: Record<Priority, string> = {
  top: 'Top priority recommendations',
  critical: 'Critical priority recommendations',
  important: 'Important priority recommendations',
  consider: 'Consider priority recommendations',
};

function allPrioritiesState(priorities: Priority[], value: boolean) {
  return Object.fromEntries(priorities.map((p) => [p, value])) as ExportOptions['priorities'];
}

export function ExportModal({ availablePriorities, hasStructureAdvice, onConfirm, onClose }: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    mainOverview: true,
    individualFeedback: true,
    deckStructure: hasStructureAdvice,
    priorities: allPrioritiesState(availablePriorities, true),
  });

  const anyFeedback = options.mainOverview || options.individualFeedback;
  const anyRecommendation = options.deckStructure || Object.values(options.priorities).some(Boolean);
  const canExport = anyFeedback || anyRecommendation;

  const toggle = useCallback((key: 'mainOverview' | 'individualFeedback' | 'deckStructure') => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const togglePriority = useCallback((p: Priority) => {
    setOptions((prev) => ({
      ...prev,
      priorities: { ...prev.priorities, [p]: !prev.priorities[p] },
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-bg-primary rounded-xl border border-border shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-[380px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-64px)] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-[16px] font-semibold text-text-primary">Export Report</h2>
          <p className="text-[13px] text-text-secondary mt-0.5">Choose what to include in the PDF.</p>
        </div>

        {/* Options */}
        <div className="px-5 pb-4 flex flex-col gap-4">
          {/* Audience Feedback Group */}
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">Audience Feedback</p>
            <div className="flex flex-col gap-0.5">
              <CheckboxRow label="Main overview" checked={options.mainOverview} onToggle={() => toggle('mainOverview')} />
              <CheckboxRow label="Individual panel feedback" checked={options.individualFeedback} onToggle={() => toggle('individualFeedback')} />
            </div>
          </div>

          {/* Recommendations Group */}
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide">Recommendations</p>
            <div className="flex flex-col gap-0.5">
              {hasStructureAdvice && (
                <CheckboxRow label="Deck structure" checked={options.deckStructure} onToggle={() => toggle('deckStructure')} />
              )}
              {availablePriorities.map((p) => (
                <CheckboxRow key={p} label={priorityLabels[p]} checked={options.priorities[p]} onToggle={() => togglePriority(p)} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-transparent border border-border rounded-lg text-text-secondary font-sans text-[13px] cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(options)}
            disabled={!canExport}
            className={`flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-white font-sans text-[13px] font-semibold transition-all duration-200 ${
              canExport
                ? 'cursor-pointer bg-accent hover:bg-accent-hover'
                : 'opacity-35 cursor-not-allowed bg-accent'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Save report
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2.5 py-1 bg-transparent border-none cursor-pointer text-left font-sans group"
    >
      <span className={`flex items-center justify-center w-[16px] h-[16px] rounded border-[1.5px] transition-all duration-150 ${
        checked ? 'bg-accent border-accent' : 'bg-transparent border-gray-300 group-hover:border-gray-400'
      }`}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-[13px] text-text-primary">{label}</span>
    </button>
  );
}

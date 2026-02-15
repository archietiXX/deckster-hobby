import { useCallback } from 'react';
import { audienceCategories } from '../data/audienceCategories';
import { AudienceChip } from './AudienceChip';
import { Footer } from './Footer';

interface SetupModalProps {
  fileName: string;
  goal: string;
  onGoalChange: (goal: string) => void;
  selectedAudiences: string[];
  onAudiencesChange: (audiences: string[]) => void;
  audienceContext: string;
  onAudienceContextChange: (context: string) => void;
  onEvaluate: () => void;
  onBack: () => void;
}

export function SetupModal({
  fileName,
  goal,
  onGoalChange,
  selectedAudiences,
  onAudiencesChange,
  audienceContext,
  onAudienceContextChange,
  onEvaluate,
  onBack,
}: SetupModalProps) {
  const toggleAudience = useCallback(
    (id: string) => {
      onAudiencesChange(
        selectedAudiences.includes(id)
          ? selectedAudiences.filter((a) => a !== id)
          : [...selectedAudiences, id]
      );
    },
    [selectedAudiences, onAudiencesChange]
  );

  const isReady = goal.trim().length > 0 && selectedAudiences.length > 0;

  return (
    <div className="min-h-screen flex justify-center relative overflow-y-auto bg-bg-primary">
      <div className="relative z-10 w-full max-w-[640px] px-6 py-12 pb-16 flex flex-col gap-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-transparent border border-border rounded-lg text-text-secondary text-sm cursor-pointer transition-all duration-200 hover:border-gray-400 hover:text-text-primary hover:bg-white"
            onClick={onBack}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg text-text-secondary text-[13px] font-medium max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 2H9L12 5V14H4V2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M9 2V5H12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            {fileName}
          </div>
        </div>

        {/* Title */}
        <div className="animate-fade-in-up [animation-delay:50ms]">
          <h1 className="text-[32px] font-normal tracking-tight leading-[1.2] mb-2 text-text-primary">
            Configure evaluation
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed max-w-[520px]">
            Tell us about your presentation goal and who will be in the room.
            We'll build a realistic audience panel to review your deck.
          </p>
        </div>

        {/* Goal input */}
        <div className="flex flex-col gap-4 animate-fade-in-up [animation-delay:100ms]">
          <label className="flex items-center gap-2 text-base font-medium text-text-primary" htmlFor="goal-input">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-accent text-white text-[13px] font-semibold rounded-full shrink-0">
              1
            </span>
            What is the goal of this presentation?
          </label>
          <textarea
            id="goal-input"
            className="w-full p-4 bg-white border-[1.5px] border-border rounded-lg text-text-primary text-[15px] leading-relaxed resize-y transition-[border-color,box-shadow] duration-200 placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="e.g., Convince the board to approve Q3 budget for the AI initiative..."
            value={goal}
            onChange={(e) => onGoalChange(e.target.value)}
            rows={3}
          />
        </div>

        {/* Audience selection */}
        <div className="flex flex-col gap-4 animate-fade-in-up [animation-delay:100ms]">
          <label className="flex items-center gap-2 text-base font-medium text-text-primary">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-accent text-white text-[13px] font-semibold rounded-full shrink-0">
              2
            </span>
            Who is in the audience?
            <span className="text-[13px] font-normal text-gray-400 ml-auto">Select all that apply</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {audienceCategories.map((cat) => (
              <AudienceChip
                key={cat.id}
                category={cat}
                isSelected={selectedAudiences.includes(cat.id)}
                onToggle={() => toggleAudience(cat.id)}
              />
            ))}
          </div>
          {selectedAudiences.length > 0 && (
            <p className="text-[13px] text-accent font-medium">
              {selectedAudiences.length} audience{selectedAudiences.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Additional context (optional) */}
        <div className="flex flex-col gap-3 animate-fade-in-up [animation-delay:130ms]">
          <label className="flex items-center gap-2 text-base font-medium text-text-primary" htmlFor="context-input">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-bg-secondary text-text-secondary text-[13px] font-semibold rounded-full shrink-0 border border-border">
              3
            </span>
            Additional context
            <span className="text-[13px] font-normal text-gray-400 ml-auto">Optional</span>
          </label>
          <textarea
            id="context-input"
            className="w-full p-4 bg-white border-[1.5px] border-border rounded-lg text-text-primary text-[15px] leading-relaxed resize-y transition-[border-color,box-shadow] duration-200 placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="e.g., The CFO is skeptical about AI spending, the CTO wants technical depth, most attendees saw last quarter's results..."
            value={audienceContext}
            onChange={(e) => onAudienceContextChange(e.target.value)}
            rows={2}
          />
        </div>

        {/* Evaluate button */}
        <div className="flex flex-col items-start gap-2 pt-4 animate-fade-in-up [animation-delay:150ms]">
          <button
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-7 bg-accent border-none rounded-lg text-white text-base font-semibold cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:not-disabled:bg-accent-hover hover:not-disabled:-translate-y-px active:not-disabled:translate-y-0 disabled:opacity-35 disabled:cursor-not-allowed"
            onClick={onEvaluate}
            disabled={!isReady}
            type="button"
          >
            <span>Evaluate my deck</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 5L16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {!isReady && (
            <p className="text-[13px] text-gray-400">
              {!goal.trim() ? 'Enter a presentation goal' : 'Select at least one audience'}
              {' '}to continue
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

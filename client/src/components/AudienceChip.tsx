import type { AudienceCategory } from '@deckster/shared/types';

interface AudienceChipProps {
  category: AudienceCategory;
  isSelected: boolean;
  onToggle: () => void;
}

export function AudienceChip({ category, isSelected, onToggle }: AudienceChipProps) {
  return (
    <button
      className={`
        inline-flex items-center gap-1.5 px-3.5 py-2
        rounded-full text-[14px] font-normal whitespace-nowrap
        cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${
          isSelected
            ? 'border-[1.5px] border-accent bg-accent text-white font-medium'
            : 'border-[1.5px] border-border bg-white text-text-secondary hover:border-gray-400 hover:text-text-primary hover:bg-bg-secondary'
        }
      `}
      onClick={onToggle}
      type="button"
      aria-pressed={isSelected}
    >
      {isSelected && (
        <span className="inline-flex items-center justify-center w-4 h-4 shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      {category.label}
    </button>
  );
}

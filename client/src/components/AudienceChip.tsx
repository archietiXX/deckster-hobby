import type { AudienceCategory } from '@deckster/shared/types';

interface AudienceChipProps {
  category: AudienceCategory;
  isSelected: boolean;
  onToggle: () => void;
}

export function AudienceChip({ category, isSelected, onToggle }: AudienceChipProps) {
  return (
    <button
      className={`audience-chip ${isSelected ? 'audience-chip--selected' : ''}`}
      onClick={onToggle}
      type="button"
      aria-pressed={isSelected}
    >
      <span className="audience-chip-check">
        {isSelected && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {category.label}
    </button>
  );
}

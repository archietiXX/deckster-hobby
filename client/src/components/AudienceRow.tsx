import type { AudienceCategory } from '@deckster/shared/types';

interface AudienceRowProps {
  category: AudienceCategory;
  isSelected: boolean;
  knowledgeLevel: string;
  onToggle: () => void;
  onKnowledgeLevelChange: (level: string) => void;
}

const knowledgeLevels = [
  { value: 'expert', label: 'Expert' },
  { value: 'proficient', label: 'Proficient' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'novice', label: 'Novice' },
  { value: 'business-executive', label: 'Business/Executive' },
  { value: 'technical-specialist', label: 'Technical Specialist' },
];

export function AudienceRow({
  category,
  isSelected,
  knowledgeLevel,
  onToggle,
  onKnowledgeLevelChange,
}: AudienceRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className="flex items-center gap-3 py-3 px-4 bg-white border-[1.5px] border-border rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-300 hover:bg-bg-secondary/30"
    >
      {/* Checkbox */}
      <span
        className={`flex items-center justify-center w-[18px] h-[18px] rounded border-[1.5px] transition-all duration-150 shrink-0 ${
          isSelected ? 'bg-accent border-accent' : 'bg-transparent border-gray-300'
        }`}
      >
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7L6 10L11 4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      {/* Category label */}
      <span className="text-[15px] text-text-primary font-medium flex-1 text-left">
        {category.label}
      </span>

      {/* Knowledge level dropdown - only visible when selected */}
      {isSelected && (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[13px] text-text-secondary">Knowledge level:</span>
          <select
            value={knowledgeLevel}
            onChange={(e) => onKnowledgeLevelChange(e.target.value)}
            aria-label={`Knowledge level for ${category.label}`}
            className="px-3 py-1.5 bg-white border border-border rounded-lg text-[13px] text-text-primary cursor-pointer transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {knowledgeLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </button>
  );
}

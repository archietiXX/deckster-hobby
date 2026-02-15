import { useCallback } from 'react';
import { audienceCategories } from '../data/audienceCategories';
import { AudienceChip } from './AudienceChip';
import './SetupModal.css';

interface SetupModalProps {
  fileName: string;
  goal: string;
  onGoalChange: (goal: string) => void;
  selectedAudiences: string[];
  onAudiencesChange: (audiences: string[]) => void;
  onEvaluate: () => void;
  onBack: () => void;
}

export function SetupModal({
  fileName,
  goal,
  onGoalChange,
  selectedAudiences,
  onAudiencesChange,
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
    <div className="setup-page">
      <div className="setup-grid-bg" />

      <div className="setup-container">
        {/* Header */}
        <div className="setup-header">
          <button className="setup-back" onClick={onBack} type="button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <div className="setup-file-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 2H9L12 5V14H4V2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M9 2V5H12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            {fileName}
          </div>
        </div>

        {/* Title */}
        <div className="setup-title-section">
          <h1 className="setup-title">Configure evaluation</h1>
          <p className="setup-description">
            Tell us about your presentation goal and who will be in the room.
            We'll build a realistic audience panel to review your deck.
          </p>
        </div>

        {/* Goal input */}
        <div className="setup-section">
          <label className="setup-label" htmlFor="goal-input">
            <span className="setup-label-number">1</span>
            What is the goal of this presentation?
          </label>
          <textarea
            id="goal-input"
            className="setup-textarea"
            placeholder="e.g., Convince the board to approve Q3 budget for the AI initiative..."
            value={goal}
            onChange={(e) => onGoalChange(e.target.value)}
            rows={3}
          />
        </div>

        {/* Audience selection */}
        <div className="setup-section">
          <label className="setup-label">
            <span className="setup-label-number">2</span>
            Who is in the audience?
            <span className="setup-label-hint">Select all that apply</span>
          </label>
          <div className="setup-audience-grid">
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
            <p className="setup-audience-count">
              {selectedAudiences.length} audience{selectedAudiences.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Evaluate button */}
        <div className="setup-actions">
          <button
            className="setup-evaluate-btn"
            onClick={onEvaluate}
            disabled={!isReady}
            type="button"
          >
            <span className="setup-evaluate-btn-text">Evaluate my deck</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 5L16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {!isReady && (
            <p className="setup-ready-hint">
              {!goal.trim() ? 'Enter a presentation goal' : 'Select at least one audience'}
              {' '}to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect } from 'react';
import type {
  AppScreen,
  SlideContent,
  Persona,
  PersonaEvaluation,
  Recommendation,
  RecommendationsResponse,
  OverallSummary,
} from '@deckster/shared/types';
import { loadSession, saveSession, clearSession } from './services/sessionStorage';
import { FileDropZone } from './components/FileDropZone';
import { SetupModal } from './components/SetupModal';
import { LoadingScreen } from './components/LoadingScreen';
import { PersonaReactions } from './components/PersonaReactions';
import { Recommendations } from './components/Recommendations';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('upload');
  const [slideContents, setSlideContents] = useState<SlideContent[]>([]);
  const [goal, setGoal] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [audienceContext, setAudienceContext] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [evaluations, setEvaluations] = useState<PersonaEvaluation[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [mainAdvice, setMainAdvice] = useState('');
  const [overallSummary, setOverallSummary] = useState<OverallSummary | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Restore session on mount (handles page refresh / back-navigation)
  useEffect(() => {
    const saved = loadSession();
    if (!saved || saved.screen === 'upload') return;

    // If refreshed while recommendations were loading, go back to results
    if (saved.screen === 'recommendations' && saved.recommendations.length === 0) {
      saved.screen = 'results';
    }

    setScreen(saved.screen);
    setSlideContents(saved.slideContents);
    setGoal(saved.goal);
    setSelectedAudiences(saved.selectedAudiences);
    setAudienceContext(saved.audienceContext);
    setPersonas(saved.personas);
    setEvaluations(saved.evaluations);
    setRecommendations(saved.recommendations);
    setMainAdvice(saved.mainAdvice);
    setOverallSummary(saved.overallSummary);
    setFileName(saved.fileName);
  }, []);

  // Persist session on every state change
  useEffect(() => {
    saveSession({
      screen,
      slideContents,
      goal,
      selectedAudiences,
      audienceContext,
      personas,
      evaluations,
      recommendations,
      mainAdvice,
      overallSummary,
      fileName,
    });
  }, [screen, slideContents, goal, selectedAudiences, audienceContext, personas, evaluations, recommendations, mainAdvice, overallSummary, fileName]);

  const handleFileParsed = useCallback((contents: SlideContent[], name: string) => {
    setSlideContents(contents);
    setFileName(name);
    setScreen('setup');
  }, []);

  const handleEvaluate = useCallback(() => {
    setScreen('loading');
  }, []);

  const handlePersonasGenerated = useCallback((newPersonas: Persona[]) => {
    setPersonas(newPersonas);
  }, []);

  const handleEvaluationComplete = useCallback((evaluation: PersonaEvaluation) => {
    setEvaluations(prev => [...prev, evaluation]);
  }, []);

  const handleSummary = useCallback((summary: OverallSummary) => {
    setOverallSummary(summary);
  }, []);

  const handleAllEvaluationsComplete = useCallback(() => {
    setScreen('results');
  }, []);

  const handleStartLoadingRecommendations = useCallback(() => {
    setIsLoadingRecommendations(true);
    setScreen('recommendations');
  }, []);

  const handleGoToRecommendations = useCallback(() => {
    setScreen('recommendations');
  }, []);

  const handleShowRecommendations = useCallback((result: RecommendationsResponse) => {
    setMainAdvice(result.mainAdvice);
    setRecommendations(result.recommendations);
    setIsLoadingRecommendations(false);
  }, []);

  const handleBackToResults = useCallback(() => {
    setScreen('results');
  }, []);

  const handleStartOver = useCallback(() => {
    clearSession();
    setScreen('upload');
    setSlideContents([]);
    setGoal('');
    setSelectedAudiences([]);
    setAudienceContext('');
    setPersonas([]);
    setEvaluations([]);
    setRecommendations([]);
    setMainAdvice('');
    setOverallSummary(null);
    setFileName('');
  }, []);

  return (
    <div className="app">
      {screen === 'upload' && (
        <FileDropZone onFileParsed={handleFileParsed} />
      )}

      {screen === 'setup' && (
        <SetupModal
          fileName={fileName}
          goal={goal}
          onGoalChange={setGoal}
          selectedAudiences={selectedAudiences}
          onAudiencesChange={setSelectedAudiences}
          audienceContext={audienceContext}
          onAudienceContextChange={setAudienceContext}
          onEvaluate={handleEvaluate}
          onBack={handleStartOver}
        />
      )}

      {screen === 'loading' && (
        <LoadingScreen
          slideContents={slideContents}
          goal={goal}
          audienceCategoryIds={selectedAudiences}
          audienceContext={audienceContext}
          onPersonasGenerated={handlePersonasGenerated}
          onEvaluationComplete={handleEvaluationComplete}
          onSummary={handleSummary}
          onAllComplete={handleAllEvaluationsComplete}
        />
      )}

      {screen === 'results' && (
        <PersonaReactions
          personas={personas}
          evaluations={evaluations}
          goal={goal}
          slideContents={slideContents}
          overallSummary={overallSummary}
          hasRecommendations={recommendations.length > 0}
          onStartLoadingRecommendations={handleStartLoadingRecommendations}
          onShowRecommendations={handleShowRecommendations}
          onGoToRecommendations={handleGoToRecommendations}
          onStartOver={handleStartOver}
        />
      )}

      {screen === 'recommendations' && (
        <Recommendations
          mainAdvice={mainAdvice}
          recommendations={recommendations}
          personas={personas}
          evaluations={evaluations}
          overallSummary={overallSummary}
          goal={goal}
          isLoading={isLoadingRecommendations}
          onBack={handleBackToResults}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}

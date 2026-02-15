import { useState, useCallback } from 'react';
import type {
  AppScreen,
  SlideContent,
  Persona,
  PersonaEvaluation,
  Recommendation,
} from '@deckster/shared/types';
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
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [evaluations, setEvaluations] = useState<PersonaEvaluation[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [fileName, setFileName] = useState('');

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

  const handleAllEvaluationsComplete = useCallback(() => {
    setScreen('results');
  }, []);

  const handleShowRecommendations = useCallback((recs: Recommendation[]) => {
    setRecommendations(recs);
    setScreen('recommendations');
  }, []);

  const handleBackToResults = useCallback(() => {
    setScreen('results');
  }, []);

  const handleStartOver = useCallback(() => {
    setScreen('upload');
    setSlideContents([]);
    setGoal('');
    setSelectedAudiences([]);
    setPersonas([]);
    setEvaluations([]);
    setRecommendations([]);
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
          onEvaluate={handleEvaluate}
          onBack={handleStartOver}
        />
      )}

      {screen === 'loading' && (
        <LoadingScreen
          slideContents={slideContents}
          goal={goal}
          audienceCategoryIds={selectedAudiences}
          onPersonasGenerated={handlePersonasGenerated}
          onEvaluationComplete={handleEvaluationComplete}
          onAllComplete={handleAllEvaluationsComplete}
        />
      )}

      {screen === 'results' && (
        <PersonaReactions
          personas={personas}
          evaluations={evaluations}
          goal={goal}
          onShowRecommendations={handleShowRecommendations}
          onStartOver={handleStartOver}
        />
      )}

      {screen === 'recommendations' && (
        <Recommendations
          recommendations={recommendations}
          personas={personas}
          onBack={handleBackToResults}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}

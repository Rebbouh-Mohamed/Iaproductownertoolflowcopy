import React from 'react';
import { AuthProvider } from './components/AuthContext';
import { ProjectProvider, useProject } from './components/ProjectContext';
import { Router } from './components/Router';
import { Navigation } from './components/Navigation';
import { ProductVisionStep } from './components/steps/ProductVisionStep';
import { ProjectDescriptionStep } from './components/steps/ProjectDescriptionStep';
import { FeaturesStep } from './components/steps/FeaturesStep';
import { PlanningStep } from './components/steps/PlanningStep';
import { TestCasesStep } from './components/steps/TestCasesStep';
import { KanbanSprintStep } from './components/steps/KanbanSprintStep';
import { UserFlowStep } from './components/steps/UserFlowStep';
import { ExportStep } from './components/steps/ExportStep';

function ProjectBuilder() {
  const { state } = useProject();

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <ProductVisionStep />;
      case 2:
        return <ProjectDescriptionStep />;
      case 3:
        return <FeaturesStep />;
      case 4:
        return <PlanningStep />;
      case 5:
        return <KanbanSprintStep />;
      case 6:
        return <UserFlowStep />;
      case 7:
        return <TestCasesStep />;
      case 8:
        return <ExportStep />;
      default:
        return <ProductVisionStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navigation />
      <main className="pb-8">
        {renderCurrentStep()}
      </main>
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <ProjectProvider>
        <ProjectBuilder />
      </ProjectProvider>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
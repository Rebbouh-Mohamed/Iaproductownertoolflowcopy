import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ProjectsPage } from './pages/ProjectsPage';

export type Page = 'auth' | 'projects' | 'project-builder';

interface RouterProps {
  children: React.ReactNode;
}

export function Router({ children }: RouterProps) {
  const { isAuthenticated, currentProject } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('auth');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  // Gestion de la navigation automatique
  React.useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage('auth');
      setAuthView('login');
    } else if (!currentProject) {
      setCurrentPage('projects');
    } else {
      setCurrentPage('project-builder');
    }
  }, [isAuthenticated, currentProject]);

  const handleSelectProject = () => {
    setCurrentPage('project-builder');
  };

  const handleBackToProjects = () => {
    setCurrentPage('projects');
  };

  // Rendu conditionnel basé sur la page actuelle
  switch (currentPage) {
    case 'auth':
      return authView === 'signup' ? (
        <SignUpPage onNavigateToLogin={() => setAuthView('login')} />
      ) : (
        <LoginPage onNavigateToSignUp={() => setAuthView('signup')} />
      );

    case 'projects':
      return <ProjectsPage onSelectProject={handleSelectProject} />;
    
    case 'project-builder':
      return (
        <div className="relative">
          {children}
          {/* Bouton pour retourner aux projets */}
          <button
            onClick={handleBackToProjects}
            className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
          >
            ← Retour aux projets
          </button>
        </div>
      );
    
    default:
      return <LoginPage onNavigateToSignUp={() => setAuthView('signup')} />;
  }
}
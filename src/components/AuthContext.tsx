import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  type: 'web' | 'mobile' | 'desktop' | 'enterprise';
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
}

interface AuthContextType {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock data pour la démonstration
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Power BI Entreprise',
    description: 'Plateforme de business intelligence pour l\'analyse de données d\'entreprise',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-20',
    type: 'enterprise',
    status: 'in-progress'
  },
  {
    id: '2',
    name: 'Application Mobile E-commerce',
    description: 'Application mobile pour la vente en ligne avec paiements intégrés',
    createdAt: '2024-12-10',
    updatedAt: '2024-12-18',
    type: 'mobile',
    status: 'draft'
  },
  {
    id: '3',
    name: 'Système de Gestion RH',
    description: 'Plateforme web pour la gestion des ressources humaines',
    createdAt: '2024-12-05',
    updatedAt: '2024-12-16',
    type: 'web',
    status: 'completed'
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement de l'authentification
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setProjects(mockProjects);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simuler l'authentification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: email,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };
    
    setUser(mockUser);
    setProjects(mockProjects);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Simuler l'authentification Google
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };
    
    setUser(mockUser);
    setProjects(mockProjects);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setProjects([]);
    setCurrentProject(null);
    localStorage.removeItem('user');
  };

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setProjects(prev => [...prev, newProject]);
  };

  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : p
    ));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  const value: AuthContextType = {
    user,
    projects,
    currentProject,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    createProject,
    selectProject,
    updateProject,
    deleteProject
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
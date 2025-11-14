import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { authService, loadSession } from '../services/authService';
import { projectService } from '../services/projectService';
import type {
  SignUpPayload,
  User
} from '../types/auth';
import type {
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload
} from '../types/project';

interface AuthContextType {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  logout: () => Promise<void>;
  createProject: (project: ProjectCreatePayload) => Promise<void>;
  selectProject: (projectId: number | string) => Promise<void>;
  updateProject: (projectId: number | string, updates: ProjectUpdatePayload) => Promise<void>;
  deleteProject: (projectId: number | string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setIsLoading(true);

      try {
        const session = await loadSession();
        if (!isMounted) {
          return;
        }

        setUser(session.user);
        setProjects(session.projects);
        setCurrentProject(session.currentProject);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSessionUpdate = ({
    user: nextUser,
    projects: nextProjects,
    currentProject: nextCurrentProject
  }: {
    user: User | null;
    projects: Project[];
    currentProject?: Project | null;
  }) => {
    setUser(nextUser);
    setProjects(nextProjects);
    if (typeof nextCurrentProject !== 'undefined') {
      setCurrentProject(nextCurrentProject);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const session = await authService.login({ email, password });
      handleSessionUpdate(session);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const session = await authService.loginWithGoogle();
      handleSessionUpdate(session);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (payload: SignUpPayload) => {
    setIsLoading(true);
    try {
      const { user: createdUser, projects: nextProjects, currentProject: nextCurrentProject } =
        await authService.signUp(payload);
      handleSessionUpdate({
        user: createdUser,
        projects: nextProjects,
        currentProject: nextCurrentProject ?? null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      handleSessionUpdate({
        user: null,
        projects: [],
        currentProject: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData: ProjectCreatePayload) => {
    const createdProject = await projectService.create(projectData);
    const nextProjects = await projectService.list();
    setProjects(nextProjects);
    setCurrentProject(createdProject);
  };

  const selectProject = async (projectId: number | string) => {
    const selectedProject = await projectService.select(projectId);
    setCurrentProject(selectedProject);
  };

  const updateProject = async (projectId: number | string, updates: ProjectUpdatePayload) => {
    const updatedProject = await projectService.update(projectId, updates);
    setProjects(prev =>
      prev.map(project => (project.id === updatedProject.id ? updatedProject : project))
    );

    if (currentProject?.id === updatedProject.id) {
      setCurrentProject(updatedProject);
    }
  };

  const deleteProject = async (projectId: number | string) => {
    await projectService.delete(projectId);
    const nextProjects = await projectService.list();
    setProjects(nextProjects);
    const updatedCurrentProject = await projectService.getCurrentProject();
    setCurrentProject(updatedCurrentProject);
  };

  const value: AuthContextType = {
    user,
    projects,
    currentProject,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    signUp,
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
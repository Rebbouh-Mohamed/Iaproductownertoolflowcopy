import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { ProjectFeature } from '../types/project';

export interface CustomQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface ProductVision {
  problem: string;
  persona: string;
  benefit: string;
  kpis: string;
  constraints: string;
  customQuestions: CustomQuestion[];
}

export interface ProjectDescription {
  mainFeatures: string;
  users: string;
  keyScenarios: string;
  constraints: string;
  criticalPoints: string;
  customQuestions: CustomQuestion[];
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
  storyPoints: number;
  epicId?: string;
  status?: 'backlog' | 'in-progress' | 'done';
  estimatedEffort?: number; // Backward compatibility
}

export interface TestCase {
  id: string;
  title: string;
  type: 'Functional' | 'Negative' | 'Performance';
  steps: string[];
  expectedResult: string;
  userStoryId: string;
  status: 'pending' | 'passed' | 'failed';
  failureReason?: string;
}

export interface Epic {
  id: string;
  name?: string; // Backward compatibility
  title?: string; // New format
  description: string;
  userStories: string[];
  priority: 'high' | 'medium' | 'low' | number;
  estimatedEffort: number;
  businessValue?: number;
  quarter?: string;
  progress?: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed';
  startDate?: string;
  endDate?: string;
}

export interface Bug {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  testCaseId: string;
  createdDate: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  userStories: string[];
  velocity: number;
  status: 'planned' | 'active' | 'completed';
}

export interface ProjectSettings {
  workMode: 'kanban' | 'sprint';
  teamVelocity: number; // story points per sprint
  sprintDuration: number; // weeks
}

export interface RoadmapItem {
  id: string;
  epicId: string;
  quarter: string;
  status: 'planned' | 'in-progress' | 'completed' | 'at-risk';
  dependencies: string[];
}

export interface ProjectState {
  currentStep: number;
  productVision: ProductVision;
  projectDescription: ProjectDescription;
  features: ProjectFeature[];
  userStories: UserStory[];
  testCases: TestCase[];
  epics: Epic[];
  bugs: Bug[];
  sprints: Sprint[];
  projectSettings: ProjectSettings;
  roadmapItems: RoadmapItem[];
  roadmapMilestones: Array<{
    id: string;
    name: string;
    date: string;
    startDate?: string;
    duration?: number;
    epics: string[];
    progress?: number;
  }>;
}

type ProjectAction = 
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PRODUCT_VISION'; payload: ProductVision }
  | { type: 'UPDATE_PRODUCT_VISION_FIELD'; payload: { field: keyof ProductVision; value: string } }
  | { type: 'ADD_PRODUCT_VISION_CUSTOM_QUESTION'; payload: CustomQuestion }
  | { type: 'UPDATE_PRODUCT_VISION_CUSTOM_QUESTION'; payload: { id: string; question?: string; answer?: string } }
  | { type: 'DELETE_PRODUCT_VISION_CUSTOM_QUESTION'; payload: string }
  | { type: 'SET_PROJECT_DESCRIPTION'; payload: ProjectDescription }
  | { type: 'ADD_PROJECT_DESCRIPTION_CUSTOM_QUESTION'; payload: CustomQuestion }
  | { type: 'UPDATE_PROJECT_DESCRIPTION_CUSTOM_QUESTION'; payload: { id: string; question?: string; answer?: string } }
  | { type: 'DELETE_PROJECT_DESCRIPTION_CUSTOM_QUESTION'; payload: string }
  | { type: 'SET_FEATURES'; payload: ProjectFeature[] }
  | { type: 'ADD_FEATURE'; payload: ProjectFeature }
  | { type: 'TOGGLE_FEATURE'; payload: string }
  | { type: 'UPDATE_FEATURE'; payload: { id: string; feature: Partial<ProjectFeature> } }
  | { type: 'SET_USER_STORIES'; payload: UserStory[] }
  | { type: 'UPDATE_USER_STORIES'; payload: any[] }
  | { type: 'UPDATE_USER_STORY'; payload: { id: string; story: Partial<UserStory> } }
  | { type: 'SET_TEST_CASES'; payload: TestCase[] }
  | { type: 'UPDATE_TEST_CASE'; payload: { id: string; testCase: Partial<TestCase> } }
  | { type: 'SET_EPICS'; payload: Epic[] }
  | { type: 'UPDATE_EPICS'; payload: any[] }
  | { type: 'ADD_EPIC'; payload: Epic }
  | { type: 'UPDATE_EPIC'; payload: { id: string; epic: Partial<Epic> } }
  | { type: 'DELETE_EPIC'; payload: string }
  | { type: 'SET_BUGS'; payload: Bug[] }
  | { type: 'ADD_BUG'; payload: Bug }
  | { type: 'SET_SPRINTS'; payload: Sprint[] }
  | { type: 'ADD_SPRINT'; payload: Sprint }
  | { type: 'SET_PROJECT_SETTINGS'; payload: ProjectSettings }
  | { type: 'SET_ROADMAP_MILESTONES'; payload: ProjectState['roadmapMilestones'] }
  | { type: 'UPDATE_ROADMAP_MILESTONE'; payload: { id: string; milestone: Partial<ProjectState['roadmapMilestones'][0]> } }
  | { type: 'UPDATE_ROADMAP'; payload: RoadmapItem[] };

const initialState: ProjectState = {
  currentStep: 1,
  productVision: {
    problem: '',
    persona: '',
    benefit: '',
    kpis: '',
    constraints: '',
    customQuestions: []
  },
  projectDescription: {
    mainFeatures: '',
    users: '',
    keyScenarios: '',
    constraints: '',
    criticalPoints: '',
    customQuestions: []
  },
  features: [],
  userStories: [],
  testCases: [],
  epics: [],
  bugs: [],
  sprints: [],
  projectSettings: {
    workMode: 'sprint',
    teamVelocity: 20,
    sprintDuration: 2
  },
  roadmapItems: [],
  roadmapMilestones: []
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_PRODUCT_VISION':
      return { ...state, productVision: action.payload };
    case 'UPDATE_PRODUCT_VISION_FIELD':
      return {
        ...state,
        productVision: {
          ...state.productVision,
          [action.payload.field]: action.payload.value
        }
      };
    case 'ADD_PRODUCT_VISION_CUSTOM_QUESTION':
      return {
        ...state,
        productVision: {
          ...state.productVision,
          customQuestions: [...state.productVision.customQuestions, action.payload]
        }
      };
    case 'UPDATE_PRODUCT_VISION_CUSTOM_QUESTION':
      return {
        ...state,
        productVision: {
          ...state.productVision,
          customQuestions: state.productVision.customQuestions.map(q =>
            q.id === action.payload.id
              ? { ...q, ...(action.payload.question !== undefined && { question: action.payload.question }), ...(action.payload.answer !== undefined && { answer: action.payload.answer }) }
              : q
          )
        }
      };
    case 'DELETE_PRODUCT_VISION_CUSTOM_QUESTION':
      return {
        ...state,
        productVision: {
          ...state.productVision,
          customQuestions: state.productVision.customQuestions.filter(q => q.id !== action.payload)
        }
      };
    case 'SET_PROJECT_DESCRIPTION':
      return { ...state, projectDescription: action.payload };
    case 'ADD_PROJECT_DESCRIPTION_CUSTOM_QUESTION':
      return {
        ...state,
        projectDescription: {
          ...state.projectDescription,
          customQuestions: [...state.projectDescription.customQuestions, action.payload]
        }
      };
    case 'UPDATE_PROJECT_DESCRIPTION_CUSTOM_QUESTION':
      return {
        ...state,
        projectDescription: {
          ...state.projectDescription,
          customQuestions: state.projectDescription.customQuestions.map(q =>
            q.id === action.payload.id
              ? { ...q, ...(action.payload.question !== undefined && { question: action.payload.question }), ...(action.payload.answer !== undefined && { answer: action.payload.answer }) }
              : q
          )
        }
      };
    case 'DELETE_PROJECT_DESCRIPTION_CUSTOM_QUESTION':
      return {
        ...state,
        projectDescription: {
          ...state.projectDescription,
          customQuestions: state.projectDescription.customQuestions.filter(q => q.id !== action.payload)
        }
      };
    case 'SET_FEATURES':
      return { ...state, features: action.payload };
    case 'ADD_FEATURE':
      return { ...state, features: [...state.features, action.payload] };
    case 'TOGGLE_FEATURE':
      return {
        ...state,
        features: state.features.map(f => 
          f.id === action.payload ? { ...f, selected: !f.selected } : f
        )
      };
    case 'UPDATE_FEATURE':
      return {
        ...state,
        features: state.features.map(f =>
          f.id === action.payload.id ? { ...f, ...action.payload.feature } : f
        )
      };
    case 'SET_USER_STORIES':
      return { ...state, userStories: action.payload };
    case 'UPDATE_USER_STORY':
      return {
        ...state,
        userStories: state.userStories.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.story } : s
        )
      };
    case 'SET_TEST_CASES':
      return { ...state, testCases: action.payload };
    case 'UPDATE_TEST_CASE':
      return {
        ...state,
        testCases: state.testCases.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.testCase } : t
        )
      };
    case 'SET_EPICS':
      return { ...state, epics: action.payload };
    case 'ADD_EPIC':
      return { ...state, epics: [...state.epics, action.payload] };
    case 'UPDATE_EPIC':
      return {
        ...state,
        epics: state.epics.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload.epic } : e
        )
      };
    case 'DELETE_EPIC':
      return {
        ...state,
        epics: state.epics.filter(e => e.id !== action.payload)
      };
    case 'SET_BUGS':
      return { ...state, bugs: action.payload };
    case 'ADD_BUG':
      return { ...state, bugs: [...state.bugs, action.payload] };
    case 'SET_SPRINTS':
      return { ...state, sprints: action.payload };
    case 'ADD_SPRINT':
      return { ...state, sprints: [...state.sprints, action.payload] };
    case 'SET_PROJECT_SETTINGS':
      return { ...state, projectSettings: action.payload };
    case 'SET_ROADMAP_MILESTONES':
      return { ...state, roadmapMilestones: action.payload };
    case 'UPDATE_ROADMAP_MILESTONE':
      return {
        ...state,
        roadmapMilestones: state.roadmapMilestones.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload.milestone } : m
        )
      };
    case 'UPDATE_USER_STORIES':
      return { ...state, userStories: action.payload };
    case 'UPDATE_EPICS':
      return { ...state, epics: action.payload };
    case 'UPDATE_ROADMAP':
      return { ...state, roadmapItems: action.payload };
    default:
      return state;
  }
}

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
} | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
export type ProjectType = 'web' | 'mobile' | 'desktop' | 'enterprise';
export type ProjectStatus = 'brouillon' | 'en_cours' | 'termine' | 'archive' | 'annule' | 'en_attente';

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ProjectCreatePayload {
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ProjectUpdatePayload extends Partial<ProjectCreatePayload> {}

export interface ProjectListFilters {
  search?: string;
  status?: ProjectStatus;
  projectType?: ProjectType;
  ordering?: string;
}

export interface ProductVisionApiResponse {
  id: number;
  questions_answers: Record<string, string>;
  generated_at?: string | null;
  updated_at?: string | null;
}

export interface ProjectDescriptionApiResponse {
  id: number;
  details: Record<string, string>;
  generated_at?: string | null;
  updated_at?: string | null;
}

export interface ProductVisionUpdatePayload {
  questions_answers: Record<string, string>;
}

export interface ProjectDescriptionUpdatePayload {
  details: Record<string, string>;
}


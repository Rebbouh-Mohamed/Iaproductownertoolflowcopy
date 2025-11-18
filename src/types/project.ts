export type ProjectStatus =
  | 'brouillon'
  | 'en_cours'
  | 'termine'
  | 'archive'
  | 'annule'
  | 'en_attente';

export interface ProjectType {
  id: number;
  name: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  projectType: ProjectType;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ProjectCreatePayload {
  name: string;
  description: string;
  status: ProjectStatus;
  projectTypeId: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ProjectUpdatePayload extends Partial<ProjectCreatePayload> {}

export interface ProjectListFilters {
  search?: string;
  status?: ProjectStatus;
  projectTypeId?: number;
}

export interface ProjectTypeCreatePayload {
  name: string;
}

export type ProjectTypeUpdatePayload = ProjectTypeCreatePayload;

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

export interface ProjectFeature {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  custom: boolean;
  category?: string;
  source?: 'user' | 'ai' | 'template' | string;
  isPredefined?: boolean;
  preFeatureId?: number;
}

export interface ProjectFeatureApiModel {
  id: number;
  title: string;
  description: string;
  category?: string | null;
  is_predefined: boolean;
  selected: boolean;
  source?: 'user' | 'ai' | 'template' | string;
  pre_feature_id?: number | null;
}

export interface ProjectFeatureCreatePayload {
  title: string;
  description: string;
  category?: string;
  source?: 'user' | 'ai' | 'template';
  preFeatureId?: number;
  selected?: boolean;
}

export type ProjectFeatureUpdatePayload = Partial<ProjectFeatureCreatePayload> & {
  selected?: boolean;
};


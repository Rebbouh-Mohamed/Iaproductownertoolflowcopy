import { apiClient } from './apiClient';
import { getAuthHeaders } from './sessionService';
import type {
  ProductVisionApiResponse,
  ProductVisionUpdatePayload,
  Project,
  ProjectCreatePayload,
  ProjectDescriptionApiResponse,
  ProjectDescriptionUpdatePayload,
  ProjectFeature,
  ProjectFeatureApiModel,
  ProjectFeatureCreatePayload,
  ProjectFeatureUpdatePayload,
  ProjectListFilters,
  ProjectType,
  ProjectTypeCreatePayload,
  ProjectUpdatePayload
} from '../types/project';

const PROJECTS_BASE_PATH = '/api/projects/';
const PROJECT_TYPES_BASE_PATH = '/api/projects/types/';
const CURRENT_PROJECT_STORAGE_KEY = 'prodigy:current-project';

interface ProjectTypeApiModel {
  id: number;
  name: string;
}

interface ProjectApiModel {
  id: number;
  name: string;
  description: string;
  status: string;
  project_type: ProjectTypeApiModel;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadCurrentProjectId(): number | null {
  if (!isBrowserEnvironment()) {
    return null;
  }

  const stored = window.localStorage.getItem(CURRENT_PROJECT_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const parsed = Number(stored);
  return Number.isNaN(parsed) ? null : parsed;
}

function saveCurrentProjectId(projectId: number | null) {
  if (!isBrowserEnvironment()) {
    return;
  }

  if (projectId == null) {
    window.localStorage.removeItem(CURRENT_PROJECT_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(CURRENT_PROJECT_STORAGE_KEY, String(projectId));
}

function ensureProjectId(projectId: number | string): number {
  const parsed = typeof projectId === 'number' ? projectId : Number(projectId);
  if (Number.isNaN(parsed)) {
    throw new Error('Identifiant de projet invalide');
  }
  return parsed;
}

function mapProjectFromApi(apiProject: ProjectApiModel): Project {
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: apiProject.description ?? '',
    projectType: {
      id: apiProject.project_type?.id ?? 0,
      name: apiProject.project_type?.name ?? 'Inconnu'
    },
    status: apiProject.status as Project['status'],
    startDate: apiProject.start_date ?? null,
    endDate: apiProject.end_date ?? null,
    createdAt: apiProject.created_at,
    updatedAt: apiProject.updated_at
  };
}

function normalizeDateValue(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === '' || value === null) {
    return null;
  }

  return value;
}

function mapProjectToApiPayload(payload: ProjectCreatePayload | ProjectUpdatePayload) {
  const body: Record<string, unknown> = {};

  if (payload.name !== undefined) body.name = payload.name;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.status !== undefined) body.status = payload.status;
  if ('projectTypeId' in payload && payload.projectTypeId !== undefined) {
    body.project_type_id = payload.projectTypeId;
  }
  if ('startDate' in payload) {
    const normalizedStart = normalizeDateValue(payload.startDate);
    if (normalizedStart !== undefined) {
      body.start_date = normalizedStart;
    }
  }
  if ('endDate' in payload) {
    const normalizedEnd = normalizeDateValue(payload.endDate);
    if (normalizedEnd !== undefined) {
      body.end_date = normalizedEnd;
    }
  }

  return body;
}

function mapFeatureFromApi(apiFeature: ProjectFeatureApiModel): ProjectFeature {
  return {
    id: String(apiFeature.id),
    name: apiFeature.title,
    description: apiFeature.description ?? '',
    category: apiFeature.category ?? undefined,
    selected: apiFeature.selected,
    custom: !apiFeature.is_predefined,
    isPredefined: apiFeature.is_predefined,
    source: apiFeature.source,
    preFeatureId: apiFeature.pre_feature_id ?? undefined
  };
}

function mapFeatureToApiPayload(
  payload: ProjectFeatureCreatePayload | ProjectFeatureUpdatePayload
) {
  const body: Record<string, unknown> = {};

  if (payload.title !== undefined) body.title = payload.title;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.category !== undefined) body.category = payload.category;
  if (payload.source !== undefined) body.source = payload.source;
  if ('preFeatureId' in payload && payload.preFeatureId !== undefined) {
    body.pre_feature_id = payload.preFeatureId;
  }
  if ('selected' in payload && payload.selected !== undefined) {
    body.selected = payload.selected;
  }

  return body;
}

function getAuthConfig() {
  const headers = getAuthHeaders();
  if (!headers) {
    throw new Error('Jeton d’authentification manquant. Veuillez vous reconnecter.');
  }
  return { headers };
}

export const projectService = {
  async list(_filters?: ProjectListFilters): Promise<Project[]> {
    const projects = await apiClient.get<ProjectApiModel[]>(PROJECTS_BASE_PATH, getAuthConfig());
    return projects.map(mapProjectFromApi);
  },

  async get(projectId: number | string): Promise<Project | null> {
    const id = ensureProjectId(projectId);

    try {
      const project = await apiClient.get<ProjectApiModel>(`${PROJECTS_BASE_PATH}${id}/`, getAuthConfig());
      return mapProjectFromApi(project);
    } catch (error) {
      console.warn(`Impossible de récupérer le projet ${id}`, error);
      return null;
    }
  },

  async getCurrentProject(): Promise<Project | null> {
    const storedId = loadCurrentProjectId();
    if (storedId == null) {
      return null;
    }
    return this.get(storedId);
  },

  async create(payload: ProjectCreatePayload): Promise<Project> {
    const body = mapProjectToApiPayload(payload);
    const project = await apiClient.post<ProjectApiModel, typeof body>(
      PROJECTS_BASE_PATH,
      body,
      getAuthConfig()
    );

    const mapped = mapProjectFromApi(project);
    saveCurrentProjectId(mapped.id);
    return mapped;
  },

  async update(projectId: number | string, updates: ProjectUpdatePayload): Promise<Project> {
    const id = ensureProjectId(projectId);
    const body = mapProjectToApiPayload(updates);

    const project = await apiClient.put<ProjectApiModel, typeof body>(
      `${PROJECTS_BASE_PATH}${id}/`,
      body,
      getAuthConfig()
    );

    const mapped = mapProjectFromApi(project);
    const storedId = loadCurrentProjectId();
    if (storedId === mapped.id) {
      saveCurrentProjectId(mapped.id);
    }

    return mapped;
  },

  async delete(projectId: number | string): Promise<void> {
    const id = ensureProjectId(projectId);
    await apiClient.delete(`${PROJECTS_BASE_PATH}${id}/`, getAuthConfig());

    const storedId = loadCurrentProjectId();
    if (storedId === id) {
      saveCurrentProjectId(null);
    }
  },

  async select(projectId: number | string): Promise<Project | null> {
    const project = await this.get(projectId);
    if (project) {
      saveCurrentProjectId(project.id);
    }
    return project;
  },

  async resetToDefaults(): Promise<Project[]> {
    saveCurrentProjectId(null);
    return [];
  },

  async getProductVision(projectId: number | string): Promise<ProductVisionApiResponse> {
    const id = ensureProjectId(projectId);
    return apiClient.get<ProductVisionApiResponse>(
      `${PROJECTS_BASE_PATH}${id}/vision/`,
      getAuthConfig()
    );
  },

  async updateProductVision(
    projectId: number | string,
    payload: ProductVisionUpdatePayload
  ): Promise<ProductVisionApiResponse> {
    const id = ensureProjectId(projectId);
    return apiClient.put<ProductVisionApiResponse, ProductVisionUpdatePayload>(
      `${PROJECTS_BASE_PATH}${id}/vision/`,
      payload,
      getAuthConfig()
    );
  },

  async getProjectDescription(
    projectId: number | string
  ): Promise<ProjectDescriptionApiResponse> {
    const id = ensureProjectId(projectId);
    return apiClient.get<ProjectDescriptionApiResponse>(
      `${PROJECTS_BASE_PATH}${id}/desc/`,
      getAuthConfig()
    );
  },

  async updateProjectDescription(
    projectId: number | string,
    payload: ProjectDescriptionUpdatePayload
  ): Promise<ProjectDescriptionApiResponse> {
    const id = ensureProjectId(projectId);
    return apiClient.put<ProjectDescriptionApiResponse, ProjectDescriptionUpdatePayload>(
      `${PROJECTS_BASE_PATH}${id}/desc/`,
      payload,
      getAuthConfig()
    );
  },

  async listFeatures(projectId: number | string): Promise<ProjectFeature[]> {
    const id = ensureProjectId(projectId);
    const features = await apiClient.get<ProjectFeatureApiModel[]>(
      `${PROJECTS_BASE_PATH}${id}/features/`,
      getAuthConfig()
    );
    return features.map(mapFeatureFromApi);
  },

  async createFeature(
    projectId: number | string,
    payload: ProjectFeatureCreatePayload
  ): Promise<ProjectFeature> {
    const id = ensureProjectId(projectId);
    const body = mapFeatureToApiPayload(payload);
    const feature = await apiClient.post<ProjectFeatureApiModel, typeof body>(
      `${PROJECTS_BASE_PATH}${id}/features/`,
      body,
      getAuthConfig()
    );
    return mapFeatureFromApi(feature);
  },

  async updateFeature(
    projectId: number | string,
    featureId: number | string,
    payload: ProjectFeatureUpdatePayload
  ): Promise<ProjectFeature> {
    const projId = ensureProjectId(projectId);
    const featId = ensureProjectId(featureId);
    const body = mapFeatureToApiPayload(payload);
    const feature = await apiClient.put<ProjectFeatureApiModel, typeof body>(
      `${PROJECTS_BASE_PATH}${projId}/features/${featId}/`,
      body,
      getAuthConfig()
    );
    return mapFeatureFromApi(feature);
  },

  async deleteFeature(projectId: number | string, featureId: number | string): Promise<void> {
    const projId = ensureProjectId(projectId);
    const featId = ensureProjectId(featureId);
    await apiClient.delete(
      `${PROJECTS_BASE_PATH}${projId}/features/${featId}/`,
      getAuthConfig()
    );
  },

  async listProjectTypes(): Promise<ProjectType[]> {
    const types = await apiClient.get<ProjectTypeApiModel[]>(
      PROJECT_TYPES_BASE_PATH,
      getAuthConfig()
    );
    return types.map(type => ({
      id: type.id,
      name: type.name
    }));
  },

  async createProjectType(payload: ProjectTypeCreatePayload): Promise<ProjectType> {
    const type = await apiClient.post<ProjectTypeApiModel, ProjectTypeCreatePayload>(
      PROJECT_TYPES_BASE_PATH,
      payload,
      getAuthConfig()
    );
    return {
      id: type.id,
      name: type.name
    };
  },

  async updateProjectType(
    projectTypeId: number,
    payload: ProjectTypeCreatePayload
  ): Promise<ProjectType> {
    const updated = await apiClient.put<ProjectTypeApiModel, ProjectTypeCreatePayload>(
      `${PROJECT_TYPES_BASE_PATH}${projectTypeId}/`,
      payload,
      getAuthConfig()
    );
    return {
      id: updated.id,
      name: updated.name
    };
  },

  async deleteProjectType(projectTypeId: number): Promise<void> {
    await apiClient.delete(`${PROJECT_TYPES_BASE_PATH}${projectTypeId}/`, getAuthConfig());
  }
};

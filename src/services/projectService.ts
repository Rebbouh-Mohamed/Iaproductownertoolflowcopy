import { apiClient } from './apiClient';
import { getAuthHeaders } from './sessionService';
import type {
  ProductVisionApiResponse,
  ProductVisionUpdatePayload,
  Project,
  ProjectCreatePayload,
  ProjectDescriptionApiResponse,
  ProjectDescriptionUpdatePayload,
  ProjectListFilters,
  ProjectUpdatePayload
} from '../types/project';

const PROJECTS_BASE_PATH = '/api/projects/';
const CURRENT_PROJECT_STORAGE_KEY = 'prodigy:current-project';

interface ProjectApiModel {
  id: number;
  name: string;
  description: string;
  status: string;
  project_type: string;
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
    type: apiProject.project_type as Project['type'],
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
  if (payload.type !== undefined) body.project_type = payload.type;
  if (payload.status !== undefined) body.status = payload.status;
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

function buildProjectsQuery(filters?: ProjectListFilters): string {
  if (!filters) {
    return '';
  }

  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.projectType) params.set('project_type', filters.projectType);
  if (filters.ordering) params.set('ordering', filters.ordering);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function getAuthConfig() {
  const headers = getAuthHeaders();
  if (!headers) {
    throw new Error('Jeton d’authentification manquant. Veuillez vous reconnecter.');
  }
  return { headers };
}

export const projectService = {
  async list(filters?: ProjectListFilters): Promise<Project[]> {
    const query = buildProjectsQuery(filters);
    const projects = await apiClient.get<ProjectApiModel[]>(`${PROJECTS_BASE_PATH}${query}`, getAuthConfig());
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
  }
};

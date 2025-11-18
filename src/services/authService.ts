import { apiClient } from './apiClient';
import { projectService } from './projectService';
import {
  clearTokens,
  getAuthHeaders as getSessionAuthHeaders,
  getTokens,
  setTokens
} from './sessionService';
import type {
  AuthApiResponse,
  AuthApiUser,
  AuthCredentials,
  SignUpPayload,
  User
} from '../types/auth';
import type { Project } from '../types/project';

const USER_STORAGE_KEY = 'prodigy:user';
const AUTH_BASE_PATH = '/api/auth';

interface SessionState {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
}

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadStoredUser(): User | null {
  if (!isBrowserEnvironment()) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(USER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch (error) {
    console.warn('Unable to parse stored user.', error);
    return null;
  }
}

function persistUser(user: User | null) {
  if (!isBrowserEnvironment()) {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearSessionState() {
  clearTokens();
  persistUser(null);
}

function mapApiUser(apiUser: AuthApiUser): User {
  const fallbackName =
    apiUser.username ||
    apiUser.email?.split('@')[0] ||
    (typeof apiUser.id === 'string' ? apiUser.id : `${apiUser.id}`);
  const fallbackId = apiUser.id ?? apiUser.email ?? Date.now().toString();

  return {
    id: String(fallbackId),
    name: fallbackName || 'Utilisateur',
    username: apiUser.username,
    email: apiUser.email ?? '',
    avatar: typeof apiUser.profile_pic === 'string' ? apiUser.profile_pic : undefined
  };
}

async function resolveUserFromResponse(
  response: AuthApiResponse,
  accessToken: string
): Promise<User> {
  if (response.user) {
    return mapApiUser(response.user);
  }

  return fetchCurrentUser(accessToken);
}

async function fetchCurrentUser(accessToken: string): Promise<User> {
  const apiUser = await apiClient.get<AuthApiUser>(`${AUTH_BASE_PATH}/user/`, {
    headers: getSessionAuthHeaders(accessToken)
  });

  return mapApiUser(apiUser);
}

async function buildSessionState(): Promise<{
  projects: Project[];
  currentProject: Project | null;
}> {
  const [projects, currentProject] = await Promise.all([
    projectService.list(),
    projectService.getCurrentProject()
  ]);

  return { projects, currentProject };
}

export async function loadSession(): Promise<SessionState> {
  const tokens = getTokens();

  if (!tokens?.access) {
    clearSessionState();
    return {
      user: null,
      projects: [],
      currentProject: null
    };
  }

  try {
    const user = await fetchCurrentUser(tokens.access);
    persistUser(user);

    const { projects, currentProject } = await buildSessionState();

    return {
      user,
      projects,
      currentProject
    };
  } catch (error) {
    console.warn('Unable to restore session. Clearing stored credentials.', error);
    clearSessionState();
    return {
      user: null,
      projects: [],
      currentProject: null
    };
  }
}

async function authenticate(
  response: AuthApiResponse
): Promise<{ user: User; projects: Project[]; currentProject: Project | null }> {
  if (!response.access) {
    throw new Error('Le serveur n’a pas renvoyé de jeton d’accès.');
  }

  setTokens({ access: response.access, refresh: response.refresh });

  const user = await resolveUserFromResponse(response, response.access);
  persistUser(user);

  const { projects, currentProject } = await buildSessionState();

  return {
    user,
    projects,
    currentProject
  };
}

export const authService = {
  async signUp(payload: SignUpPayload) {
    const { email, password1, password2, username } = payload;
    const response = await apiClient.post<AuthApiResponse, Record<string, unknown>>(
      `${AUTH_BASE_PATH}/register/`,
      {
        email,
        password1,
        password2,
        username
      }
    );

    return authenticate(response);
  },

  async login(credentials: AuthCredentials) {
    const response = await apiClient.post<AuthApiResponse, AuthCredentials>(
      `${AUTH_BASE_PATH}/login/`,
      credentials
    );

    return authenticate(response);
  },

  async loginWithGoogle() {
    throw new Error('La connexion avec Google n’est pas encore disponible.');
  },

  async logout() {
    const tokens = getTokens();

    if (tokens?.access) {
      try {
        await apiClient.post(
          `${AUTH_BASE_PATH}/logout/`,
          tokens.refresh ? { refresh: tokens.refresh } : undefined,
          {
            headers: getSessionAuthHeaders(tokens.access)
          }
        );
      } catch (error) {
        console.warn('Une erreur est survenue lors de la déconnexion côté serveur.', error);
      }
    }

    clearSessionState();
    await projectService.resetToDefaults();
  }
};


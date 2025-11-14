export interface StoredTokens {
  access: string;
  refresh?: string;
}

const TOKENS_STORAGE_KEY = 'prodigy:auth-tokens';
let cachedTokens: StoredTokens | null = null;

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function setTokens(tokens: StoredTokens | null) {
  cachedTokens = tokens;

  if (!isBrowserEnvironment()) {
    return;
  }

  if (!tokens) {
    window.localStorage.removeItem(TOKENS_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

export function getTokens(): StoredTokens | null {
  if (cachedTokens) {
    return cachedTokens;
  }

  if (!isBrowserEnvironment()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(TOKENS_STORAGE_KEY);
    cachedTokens = raw ? (JSON.parse(raw) as StoredTokens) : null;
    return cachedTokens;
  } catch (error) {
    console.warn('Unable to parse stored auth tokens.', error);
    return null;
  }
}

export function clearTokens() {
  cachedTokens = null;

  if (!isBrowserEnvironment()) {
    return;
  }

  window.localStorage.removeItem(TOKENS_STORAGE_KEY);
}

export function getAuthHeaders(accessToken?: string): Record<string, string> | undefined {
  const token = accessToken ?? getTokens()?.access;

  if (!token) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${token}`
  };
}


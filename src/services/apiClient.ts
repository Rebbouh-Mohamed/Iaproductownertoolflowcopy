const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

async function request<TResponse, TBody = unknown>(
  path: string,
  { method = 'GET', body, headers = {}, signal }: RequestConfig<TBody> = {}
): Promise<TResponse> {
  const targetUrl = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path}`;

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    signal
  };

  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(targetUrl, init);

  if (!response.ok) {
    const errorBody = await safeParseJson(response);
    const message =
      (errorBody && (errorBody.message || errorBody.error)) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await safeParseJson(response)) as TResponse;
}

async function safeParseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export const apiClient = {
  get<TResponse>(path: string, config?: RequestConfig) {
    return request<TResponse>(path, { ...config, method: 'GET' });
  },
  post<TResponse, TBody = unknown>(path: string, body?: TBody, config?: RequestConfig) {
    return request<TResponse, TBody>(path, { ...config, method: 'POST', body });
  },
  put<TResponse, TBody = unknown>(path: string, body?: TBody, config?: RequestConfig) {
    return request<TResponse, TBody>(path, { ...config, method: 'PUT', body });
  },
  patch<TResponse, TBody = unknown>(path: string, body?: TBody, config?: RequestConfig) {
    return request<TResponse, TBody>(path, { ...config, method: 'PATCH', body });
  },
  delete<TResponse>(path: string, config?: RequestConfig) {
    return request<TResponse>(path, { ...config, method: 'DELETE' });
  }
};

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


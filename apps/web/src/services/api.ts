/**
 * Central API Client
 * Handles all HTTP requests with authentication, error handling, and retries
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Error class
export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

// Auth token management
class TokenManager {
  private static TOKEN_KEY = 'auth_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static hasToken(): boolean {
    return !!this.getToken();
  }
}

// Request interceptor
function getHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = TokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// Response handler
async function handleResponse<T>(response: Response): Promise<T> {
  const clonedResponse = response.clone();

  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    const text = await clonedResponse.text();
    data = { message: text };
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiClientError(errorMessage, response.status, data?.code);
  }

  return data.data !== undefined ? data.data : data;
}

// Retry logic
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return await handleResponse<T>(response);
  } catch (error: any) {
    if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
      throw error;
    }

    if (retries > 0) {
      const delay = Math.pow(2, MAX_RETRIES - retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry<T>(url, options, retries - 1);
    }

    if (error.name === 'AbortError') {
      throw new ApiClientError('Request timeout', 408);
    }

    throw error;
  }
}

// Core HTTP methods
export const api = {
  async get<T = any>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetchWithRetry<T>(url, {
      method: 'GET',
      headers: getHeaders(includeAuth),
    });
  },

  async post<T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetchWithRetry<T>(url, {
      method: 'POST',
      headers: getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put<T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetchWithRetry<T>(url, {
      method: 'PUT',
      headers: getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch<T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetchWithRetry<T>(url, {
      method: 'PATCH',
      headers: getHeaders(includeAuth),
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T = any>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    return fetchWithRetry<T>(url, {
      method: 'DELETE',
      headers: getHeaders(includeAuth),
    });
  },

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health', false);
  },
};

// Authentication API
export const authApi = {
  async login(email: string, password: string) {
    const response = await api.post<{
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        is_active: boolean;
      };
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    }>('/api/auth/login', { email, password }, false);

    if (response.accessToken) {
      TokenManager.setToken(response.accessToken);
    }

    return {
      data: {
        token: response.accessToken,
        refreshToken: response.refreshToken,
        user: {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.first_name,
          lastName: response.user.last_name,
          role: response.user.role,
        }
      }
    };
  },

  async logout() {
    try {
      await api.post('/api/auth/logout', {}, true);
    } finally {
      TokenManager.removeToken();
    }
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post<{ accessToken: string; refreshToken: string; expiresIn: string }>(
      '/api/auth/refresh',
      { refreshToken },
      false
    );
    if (response.accessToken) {
      TokenManager.setToken(response.accessToken);
    }
    return response;
  },

  async getCurrentUser() {
    return api.get('/api/auth/me', true);
  },
};

export { TokenManager };
export type { ApiResponse, ApiError };

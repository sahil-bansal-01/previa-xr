/**
 * PREVIA XR API Client
 * Robust handling of local dev and production Render backend endpoints.
 */

const getInitialApiUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  // If running in production (e.g. deployed on Vercel), default to the deployed Render backend
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://previa-xr.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

export const normalizeApiUrl = (url: string): string => {
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }
  return cleaned;
};

export const API_BASE_URL = normalizeApiUrl(getInitialApiUrl());
export const API_SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

export const formatEndpointUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('previa_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private handleNetworkError(err: any): never {
    if (err?.name === 'AbortError') {
      throw new Error(
        'Request timed out. The backend server on Render may be waking up from cold start (~30-50s). Please try again in a few seconds.'
      );
    }
    if (err?.name === 'TypeError' && err?.message?.toLowerCase().includes('fetch')) {
      throw new Error(
        'Unable to connect to the PREVIA XR backend server. The service may be waking up from cold start on Render (~30s) or check your connection.'
      );
    }
    throw err;
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 35000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // If caller provided an external signal, combine them
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(endpoint: string, timeoutMs?: number): Promise<T> {
    try {
      const res = await this.fetchWithTimeout(formatEndpointUrl(endpoint), {
        method: 'GET',
        headers: this.getHeaders(),
      }, timeoutMs);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    } catch (err: any) {
      this.handleNetworkError(err);
    }
  }

  async post<T>(endpoint: string, body?: any, timeoutMs?: number): Promise<T> {
    try {
      const res = await this.fetchWithTimeout(formatEndpointUrl(endpoint), {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      }, timeoutMs);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    } catch (err: any) {
      this.handleNetworkError(err);
    }
  }

  async put<T>(endpoint: string, body: any, timeoutMs?: number): Promise<T> {
    try {
      const res = await this.fetchWithTimeout(formatEndpointUrl(endpoint), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      }, timeoutMs);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    } catch (err: any) {
      this.handleNetworkError(err);
    }
  }

  async delete<T>(endpoint: string, timeoutMs?: number): Promise<T> {
    try {
      const res = await this.fetchWithTimeout(formatEndpointUrl(endpoint), {
        method: 'DELETE',
        headers: this.getHeaders(),
      }, timeoutMs);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    } catch (err: any) {
      this.handleNetworkError(err);
    }
  }
}

export const api = new ApiClient();
export default api;

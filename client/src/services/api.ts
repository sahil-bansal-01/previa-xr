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
    if (err?.name === 'TypeError' && err?.message?.toLowerCase().includes('fetch')) {
      throw new Error(
        'Unable to connect to the PREVIA XR backend server. The service may be waking up from cold start on Render (~30s) or check your connection.'
      );
    }
    throw err;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const res = await fetch(formatEndpointUrl(endpoint), {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    } catch (err: any) {
      this.handleNetworkError(err);
    }
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    try {
      const res = await fetch(formatEndpointUrl(endpoint), {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    } catch (err: any) {
      this.handleNetworkError(err);
    }
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    try {
      const res = await fetch(formatEndpointUrl(endpoint), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }
      return res.json();
    } catch (err: any) {
      this.handleNetworkError(err);
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const res = await fetch(formatEndpointUrl(endpoint), {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
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

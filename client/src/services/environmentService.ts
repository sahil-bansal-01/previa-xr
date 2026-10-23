import api, { formatEndpointUrl } from './api';
import { Environment } from '../simulation/types/simulationTypes';

export interface EnvironmentsResponse {
  success: boolean;
  count: number;
  data: Environment[];
}

export interface SingleEnvironmentResponse {
  success: boolean;
  message?: string;
  isManualFallback?: boolean;
  data: Environment;
}

export interface UploadFilesResponse {
  success: boolean;
  message: string;
  environmentId?: string;
  subfolder?: string;
  files: Array<{
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    isImage?: boolean;
    isVideo?: boolean;
  }>;
}

export const environmentService = {
  async uploadFiles(
    files: (File | Blob)[],
    environmentId?: string,
    subfolderType: 'original' | 'frame' = 'original'
  ): Promise<UploadFilesResponse> {
    const formData = new FormData();
    files.forEach((f, idx) => {
      if (f instanceof File) {
        formData.append('files', f);
      } else {
        const ext = f.type === 'image/png' ? 'png' : 'jpg';
        formData.append('files', f, `frame_${idx}_${Date.now()}.${ext}`);
      }
    });

    const token = localStorage.getItem('previa_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (environmentId) {
      headers['x-environment-id'] = environmentId;
    }

    const queryParams = new URLSearchParams();
    if (environmentId) queryParams.set('environmentId', environmentId);
    queryParams.set('type', subfolderType);

    const endpoint = environmentId
      ? `/environments/${environmentId}/upload?${queryParams.toString()}`
      : `/environments/upload?${queryParams.toString()}`;

    const url = formatEndpointUrl(endpoint);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || `File upload failed with status ${res.status}`);
      }

      return res.json();
    } catch (err: any) {
      if (err?.name === 'TypeError' && err?.message?.toLowerCase().includes('fetch')) {
        throw new Error(
          'Unable to reach backend server for upload. The server may be waking up from sleep on Render, or check your connection.'
        );
      }
      throw err;
    }
  },

  async createEnvironment(envData: Partial<Environment>): Promise<Environment> {
    const res = await api.post<SingleEnvironmentResponse>('/environments', envData);
    return res.data;
  },

  async getEnvironments(): Promise<Environment[]> {
    const res = await api.get<EnvironmentsResponse>('/environments');
    return res.data || [];
  },

  async getEnvironmentById(id: string): Promise<Environment> {
    const res = await api.get<SingleEnvironmentResponse>(`/environments/${id}`);
    return res.data;
  },

  async updateEnvironment(id: string, updates: Partial<Environment>): Promise<Environment> {
    const res = await api.put<SingleEnvironmentResponse>(`/environments/${id}`, updates);
    return res.data;
  },

  async deleteEnvironment(id: string): Promise<{ success: boolean; data: any }> {
    return api.delete<{ success: boolean; data: any }>(`/environments/${id}`);
  },

  async analyzeEnvironment(id: string): Promise<Environment> {
    const res = await api.post<SingleEnvironmentResponse>(`/environments/${id}/analyze`);
    return res.data;
  },

  async confirmEnvironment(id: string): Promise<Environment> {
    const res = await api.post<SingleEnvironmentResponse>(`/environments/${id}/confirm`);
    return res.data;
  },
};

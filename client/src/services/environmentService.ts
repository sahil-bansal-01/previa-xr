import api from './api';
import { Environment } from '../simulation/types/simulationTypes';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

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
  async uploadFiles(files: File[]): Promise<UploadFilesResponse> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const token = localStorage.getItem('previa_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/environments/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'File upload failed');
    }

    return res.json();
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

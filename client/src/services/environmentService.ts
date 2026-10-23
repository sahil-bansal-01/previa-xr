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
  uploadFiles(
    files: (File | Blob)[],
    environmentId?: string,
    subfolderType: 'original' | 'frame' = 'original',
    onProgress?: (percent: number) => void,
    timeoutMs = 60000
  ): Promise<UploadFilesResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      files.forEach((f, idx) => {
        if (f instanceof File) {
          formData.append('files', f);
        } else {
          const ext = f.type === 'image/png' ? 'png' : 'jpg';
          formData.append('files', f, `frame_${idx}_${Date.now()}.${ext}`);
        }
      });

      const cleanEnvId =
        environmentId && environmentId !== 'undefined' && environmentId !== 'null'
          ? String(environmentId).trim()
          : undefined;

      const queryParams = new URLSearchParams();
      if (cleanEnvId) queryParams.set('environmentId', cleanEnvId);
      queryParams.set('type', subfolderType);

      const endpoint = cleanEnvId
        ? `/environments/${cleanEnvId}/upload?${queryParams.toString()}`
        : `/environments/upload?${queryParams.toString()}`;

      const url = formatEndpointUrl(endpoint);
      const xhr = new XMLHttpRequest();

      xhr.open('POST', url, true);
      xhr.timeout = timeoutMs;

      const token = localStorage.getItem('previa_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      if (cleanEnvId) {
        xhr.setRequestHeader('x-environment-id', cleanEnvId);
      }

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            resolve(json);
          } catch {
            resolve({
              success: true,
              message: 'Files uploaded successfully.',
              files: [],
            });
          }
        } else {
          let errMsg = `Upload failed with status ${xhr.status}`;
          try {
            const errorData = JSON.parse(xhr.responseText);
            errMsg = errorData.message || errMsg;
          } catch {
            if (xhr.status === 413) {
              errMsg = 'Uploaded media exceeds the server maximum upload limit (100 MB).';
            } else if (xhr.status === 504) {
              errMsg = 'Server upload gateway timed out. The backend on Render may be busy or waking up. Please retry.';
            }
          }
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => {
        reject(
          new Error(
            'Unable to reach backend server for upload. The server may be waking up from sleep on Render (~30-50s) or check your connection.'
          )
        );
      };

      xhr.ontimeout = () => {
        reject(
          new Error(
            `Upload timed out after ${Math.round(timeoutMs / 1000)}s. Please check your connection or try smaller files.`
          )
        );
      };

      xhr.send(formData);
    });
  },

  async createEnvironment(envData: Partial<Environment>): Promise<Environment> {
    const res = await api.post<SingleEnvironmentResponse>('/environments', envData, 35000);
    return res.data;
  },

  async getEnvironments(): Promise<Environment[]> {
    const res = await api.get<EnvironmentsResponse>('/environments');
    return res.data || [];
  },

  async getEnvironmentById(id: string): Promise<Environment> {
    const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const res = await api.get<SingleEnvironmentResponse>(`/environments/${cleanId}`);
    return res.data;
  },

  async updateEnvironment(id: string, updates: Partial<Environment>): Promise<Environment> {
    const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const res = await api.put<SingleEnvironmentResponse>(`/environments/${cleanId}`, updates);
    return res.data;
  },

  async deleteEnvironment(id: string): Promise<{ success: boolean; data: any }> {
    const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
    return api.delete<{ success: boolean; data: any }>(`/environments/${cleanId}`);
  },

  async analyzeEnvironment(id: string): Promise<Environment> {
    const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const res = await api.post<SingleEnvironmentResponse>(`/environments/${cleanId}/analyze`, undefined, 45000);
    return res.data;
  },

  async confirmEnvironment(id: string): Promise<Environment> {
    const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const res = await api.post<SingleEnvironmentResponse>(`/environments/${cleanId}/confirm`, undefined, 35000);
    return res.data;
  },
};

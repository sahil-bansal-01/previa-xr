import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/register', { name, email, password });
    if (data.token) {
      localStorage.setItem('previa_token', data.token);
      localStorage.setItem('previa_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('previa_token', data.token);
      localStorage.setItem('previa_user', JSON.stringify(data.user));
    }
    return data;
  },

  async demoLogin(): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/demo-login');
    if (data.token) {
      localStorage.setItem('previa_token', data.token);
      localStorage.setItem('previa_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return api.get<{ success: boolean; user: User }>('/auth/me');
  },

  logout(): void {
    localStorage.removeItem('previa_token');
    localStorage.removeItem('previa_user');
  },

  getCurrentUser(): User | null {
    const saved = localStorage.getItem('previa_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('previa_token');
  }
};

import type { RawMaterialPrices } from '../types';

const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
  };
}

interface ConfigResponse {
  success: boolean;
  config: {
    rawMaterials: RawMaterialPrices;
    markup: number;
    customPrices: { [key: string]: number };
  };
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private removeToken(): void {
    localStorage.removeItem('authToken');
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Authentication
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.fetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async verifyToken(): Promise<boolean> {
    try {
      await this.fetch('/auth/verify', {
        method: 'GET',
      });
      return true;
    } catch (error) {
      this.removeToken();
      return false;
    }
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Configuration
  async getConfig(): Promise<ConfigResponse['config']> {
    const response = await this.fetch<ConfigResponse>('/config', {
      method: 'GET',
    });
    return response.config;
  }

  async updateConfig(config: {
    rawMaterials: RawMaterialPrices;
    markup: number;
    customPrices: { [key: string]: number };
  }): Promise<ConfigResponse['config']> {
    const response = await this.fetch<ConfigResponse>('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return response.config;
  }
}

export const api = new ApiService();

import type { RawMaterialPrices, Order } from '../types';

const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email?: string;
      name?: string;
      isAdmin: boolean;
    };
  };
  message: string;
}

interface ConfigResponse {
  success: boolean;
  data: {
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

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address?: string;
    birthday?: string;
    dietaryPreferences?: string;
  }): Promise<{ success: boolean; message: string; user: { id: string; email: string; name: string } }> {
    const response = await this.fetch<{ success: boolean; message: string; user: { id: string; email: string; name: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response;
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await this.fetch<{ success: boolean; message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

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
  async getConfig(): Promise<ConfigResponse['data']> {
    const response = await this.fetch<ConfigResponse>('/config', {
      method: 'GET',
    });
    return response.data;
  }

  async updateConfig(config: {
    rawMaterials: RawMaterialPrices;
    markup: number;
    customPrices: { [key: string]: number };
  }): Promise<ConfigResponse['data']> {
    const response = await this.fetch<ConfigResponse>('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return response.data;
  }

  // File Upload
  async uploadPaymentProof(file: File): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;

          const response = await this.fetch<{ success: boolean; data: { url: string } }>('/upload/payment-proof', {
            method: 'POST',
            body: JSON.stringify({
              filename: file.name,
              data: base64Data
            }),
          });

          resolve({ url: response.data.url });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  // Orders
  async createOrder(orderData: {
    items: Array<{ cevicheType: string; quantity: number; price: number }>;
    total: number;
    personalInfo: { name: string; phone: string; email?: string };
    deliveryMethod: string;
    notes?: string;
    paymentProof: string;
  }): Promise<{ success: boolean; orderId: string; message: string }> {
    const response = await this.fetch<{ success: boolean; orderId: string; message: string }>('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response;
  }

  async getOrders(params?: { status?: string; limit?: number; offset?: number }): Promise<{
    success: boolean;
    data: {
      orders: Order[];
      totalCount: number;
      limit: number;
      offset: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await this.fetch<{
      success: boolean;
      data: {
        orders: Order[];
        totalCount: number;
        limit: number;
        offset: number;
      };
    }>(`/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      method: 'GET',
    });
    return response;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; data: { order: Order }; message?: string }> {
    const response = await this.fetch<{ success: boolean; data: { order: Order }; message?: string }>('/orders/update-status', {
      method: 'PUT',
      body: JSON.stringify({ orderId, status }),
    });
    return response;
  }

  // Email
  async sendEmail(params: {
    email: string;
    subject: string;
    html: string;
  }): Promise<{ success: boolean; message: string; data?: { id: string } }> {
    const response = await this.fetch<{ success: boolean; message: string; data?: { id: string } }>('/send-email', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  }
}

export const api = new ApiService();

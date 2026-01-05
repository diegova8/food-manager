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
      // Handle authentication errors
      if (response.status === 401 || data.error?.includes('token') || data.error?.includes('Unauthorized')) {
        // Token is invalid or expired - clean it up
        this.removeToken();

        // Redirect to login if we're not already there
        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register') &&
            !window.location.pathname.includes('/menu') &&
            !window.location.pathname.includes('/') &&
            !window.location.pathname.includes('/verify-email') &&
            !window.location.pathname.includes('/forgot-password') &&
            !window.location.pathname.includes('/reset-password')) {
          window.location.href = '/login';
        }
      }

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
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
    birthday?: string;
    dietaryPreferences?: string;
  }): Promise<{ success: boolean; message: string; user: { id: string; email: string; firstName: string; lastName: string } }> {
    const response = await this.fetch<{ success: boolean; message: string; user: { id: string; email: string; firstName: string; lastName: string } }>('/auth/register', {
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

  // File Upload - Uses Vercel Blob client upload for large files
  async uploadPaymentProof(file: File): Promise<{ url: string }> {
    const { upload } = await import('@vercel/blob/client');

    const timestamp = Date.now();
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    const filename = `payment-proof-${timestamp}${ext}`;

    const blob = await upload(filename, file, {
      access: 'public',
      handleUploadUrl: `${API_BASE_URL}/upload/client-token`,
    });

    return { url: blob.url };
  }

  // Orders
  async createOrder(orderData: {
    items: Array<{ cevicheType: string; quantity: number; price: number }>;
    total: number;
    personalInfo: { name: string; phone: string; email?: string };
    deliveryMethod: string;
    scheduledDate: string;
    paymentMethod: 'sinpe' | 'paypal' | 'card';
    notes?: string;
    paymentProof: string;
  }): Promise<{ success: boolean; data: { orderId: string; status: string }; message: string }> {
    const response = await this.fetch<{ success: boolean; data: { orderId: string; status: string }; message: string }>('/orders/create', {
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
      totalAmount: number;
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
        totalAmount: number;
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

  async deleteOrder(orderId: string): Promise<{ success: boolean; data: { orderId: string }; message?: string }> {
    const response = await this.fetch<{ success: boolean; data: { orderId: string }; message?: string }>('/orders/delete', {
      method: 'DELETE',
      body: JSON.stringify({ orderId }),
    });
    return response;
  }

  // Bulk delete methods
  async bulkDeleteUsers(userIds: string[]): Promise<{ success: boolean; data: { deletedCount: number }; message?: string }> {
    return this.fetch('/users/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ userIds }),
    });
  }

  async bulkDeleteOrders(orderIds: string[]): Promise<{ success: boolean; data: { deletedCount: number }; message?: string }> {
    return this.fetch('/orders/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ orderIds }),
    });
  }

  async bulkDeleteTickets(ticketIds: string[]): Promise<{ success: boolean; data: { deletedCount: number }; message?: string }> {
    return this.fetch('/tickets/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ ticketIds }),
    });
  }

  async getMyOrders(params?: { status?: string; limit?: number; offset?: number }): Promise<{
    success: boolean;
    data: {
      orders: Order[];
      totalCount: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const url = `/orders/my-orders${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch<{
      success: boolean;
      data: {
        orders: Order[];
        totalCount: number;
      };
    }>(url);
    return response;
  }

  async getOrderById(orderId: string): Promise<{ success: boolean; data: { order: Order } }> {
    const response = await this.fetch<{ success: boolean; data: { order: Order } }>(`/orders/${orderId}`);
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

  // Profile
  async getProfile(): Promise<{
    success: boolean;
    data: {
      id: string;
      username: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      birthday?: string;
      dietaryPreferences?: string;
      marketingConsent?: boolean;
      isAdmin: boolean;
      emailVerified: boolean;
      createdAt: string;
    };
  }> {
    const response = await this.fetch<{
      success: boolean;
      data: {
        id: string;
        username: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        address?: string;
        birthday?: string;
        dietaryPreferences?: string;
        marketingConsent?: boolean;
        isAdmin: boolean;
        emailVerified: boolean;
        createdAt: string;
      };
    }>('/auth/profile', {
      method: 'GET',
    });
    return response;
  }

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    birthday?: string;
    dietaryPreferences?: string;
    marketingConsent?: boolean;
  }): Promise<{
    success: boolean;
    data: {
      token: string;
      user: {
        id: string;
        username: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        address?: string;
        birthday?: string;
        dietaryPreferences?: string;
        marketingConsent?: boolean;
        isAdmin: boolean;
      };
    };
    message: string;
  }> {
    const response = await this.fetch<{
      success: boolean;
      data: {
        token: string;
        user: {
          id: string;
          username: string;
          email?: string;
          firstName?: string;
          lastName?: string;
          phone?: string;
          address?: string;
          birthday?: string;
          dietaryPreferences?: string;
          marketingConsent?: boolean;
          isAdmin: boolean;
        };
      };
      message: string;
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    // Update token in localStorage with new user info
    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Tickets
  async createTicket(data: {
    type: 'suggestion' | 'bug';
    title: string;
    description: string;
    images?: string[];
    email?: string;
    name?: string;
  }): Promise<{
    success: boolean;
    data: {
      ticketId: string;
      type: string;
      title: string;
      status: string;
    };
    message: string;
  }> {
    const response = await this.fetch<{
      success: boolean;
      data: {
        ticketId: string;
        type: string;
        title: string;
        status: string;
      };
      message: string;
    }>('/tickets/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  async getMyTickets(params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      tickets: Array<{
        id: string;
        type: 'suggestion' | 'bug';
        title: string;
        description: string;
        status: 'open' | 'in_progress' | 'resolved' | 'closed';
        images?: string[];
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = `/tickets/my-tickets${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch<{
      success: boolean;
      data: {
        tickets: Array<{
          id: string;
          type: 'suggestion' | 'bug';
          title: string;
          description: string;
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          images?: string[];
          createdAt: string;
          updatedAt: string;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }>(url);
    return response;
  }

  // Tickets (Admin)
  async getTickets(params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      tickets: Array<{
        id: string;
        type: 'suggestion' | 'bug';
        title: string;
        description: string;
        status: 'open' | 'in_progress' | 'resolved' | 'closed';
        images?: string[];
        user?: {
          id: string;
          username: string;
          email: string;
          firstName: string;
          lastName: string;
        } | null;
        guestEmail?: string;
        guestName?: string;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/tickets${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch<{
      success: boolean;
      data: {
        tickets: Array<{
          id: string;
          type: 'suggestion' | 'bug';
          title: string;
          description: string;
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          images?: string[];
          user?: {
            id: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
          } | null;
          guestEmail?: string;
          guestName?: string;
          createdAt: string;
          updatedAt: string;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }>(url);
    return response;
  }

  // Categories
  async getCategories(includeInactive = false): Promise<{
    success: boolean;
    data: {
      categories: Array<{
        _id: string;
        name: string;
        slug: string;
        description?: string;
        displayOrder: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
    };
  }> {
    const url = `/categories${includeInactive ? '?includeInactive=true' : ''}`;
    return this.fetch(url);
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<{ success: boolean; data: { category: unknown }; message: string }> {
    return this.fetch('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<{ success: boolean; data: { category: unknown }; message: string }> {
    return this.fetch(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetch(`/categories/${id}`, { method: 'DELETE' });
  }

  // Products
  async getProducts(category?: string): Promise<{
    success: boolean;
    data: {
      products: Array<{
        _id: string;
        name: string;
        slug: string;
        description?: string;
        category: { _id: string; name: string; slug: string };
        pricingType: 'ingredient-based' | 'fixed';
        ingredients?: Array<{ rawMaterialId: string; quantity: number }>;
        olores?: number;
        mezclaJugo?: number;
        fixedPrice?: number;
        servings?: number;
        comboDescription?: string;
        includedItems?: Array<{ productId: { _id: string; name: string; slug: string }; quantity: number }>;
        imageUrl?: string;
        isActive: boolean;
        isAvailable: boolean;
        displayOrder: number;
        tags?: string[];
        costoProd: number;
        precioVenta: number;
        createdAt: string;
        updatedAt: string;
      }>;
      categories: Array<{
        _id: string;
        name: string;
        slug: string;
        displayOrder: number;
        isActive: boolean;
      }>;
    };
  }> {
    const url = `/products${category ? `?category=${category}` : ''}`;
    return this.fetch(url);
  }

  async getProductsAdmin(params?: {
    category?: string;
    pricingType?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    success: boolean;
    data: {
      products: Array<{
        _id: string;
        name: string;
        slug: string;
        description?: string;
        category: { _id: string; name: string; slug: string };
        pricingType: 'ingredient-based' | 'fixed';
        ingredients?: Array<{ rawMaterialId: string; quantity: number }>;
        olores?: number;
        mezclaJugo?: number;
        fixedPrice?: number;
        servings?: number;
        comboDescription?: string;
        includedItems?: Array<{ productId: { _id: string; name: string; slug: string }; quantity: number }>;
        imageUrl?: string;
        isActive: boolean;
        isAvailable: boolean;
        displayOrder: number;
        tags?: string[];
        costoProd: number;
        precioVenta: number;
        createdAt: string;
        updatedAt: string;
      }>;
      categories: Array<{
        _id: string;
        name: string;
        slug: string;
        displayOrder: number;
        isActive: boolean;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.pricingType) searchParams.set('pricingType', params.pricingType);
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const url = `/products/admin${queryString ? `?${queryString}` : ''}`;
    return this.fetch(url);
  }

  async getProduct(id: string): Promise<{
    success: boolean;
    data: {
      product: {
        _id: string;
        name: string;
        slug: string;
        description?: string;
        category: { _id: string; name: string; slug: string };
        pricingType: 'ingredient-based' | 'fixed';
        ingredients?: Array<{ rawMaterialId: string; quantity: number }>;
        olores?: number;
        mezclaJugo?: number;
        fixedPrice?: number;
        servings?: number;
        comboDescription?: string;
        includedItems?: Array<{ productId: { _id: string; name: string; slug: string }; quantity: number }>;
        imageUrl?: string;
        isActive: boolean;
        isAvailable: boolean;
        displayOrder: number;
        tags?: string[];
        costoProd: number;
        precioVenta: number;
        createdAt: string;
        updatedAt: string;
      };
    };
  }> {
    return this.fetch(`/products/${id}`);
  }

  async createProduct(data: {
    name: string;
    slug: string;
    description?: string;
    category: string;
    pricingType: 'ingredient-based' | 'fixed';
    ingredients?: Array<{ rawMaterialId: string; quantity: number }>;
    olores?: number;
    mezclaJugo?: number;
    fixedPrice?: number;
    servings?: number;
    comboDescription?: string;
    includedItems?: Array<{ productId: string; quantity: number }>;
    imageUrl?: string;
    isActive?: boolean;
    isAvailable?: boolean;
    displayOrder?: number;
    tags?: string[];
  }): Promise<{ success: boolean; data: { product: unknown }; message: string }> {
    return this.fetch('/products/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    category?: string;
    pricingType?: 'ingredient-based' | 'fixed';
    ingredients?: Array<{ rawMaterialId: string; quantity: number }>;
    olores?: number;
    mezclaJugo?: number;
    fixedPrice?: number;
    servings?: number;
    comboDescription?: string;
    includedItems?: Array<{ productId: string; quantity: number }>;
    imageUrl?: string;
    isActive?: boolean;
    isAvailable?: boolean;
    displayOrder?: number;
    tags?: string[];
  }): Promise<{ success: boolean; data: { product: unknown }; message: string }> {
    return this.fetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetch(`/products/${id}`, { method: 'DELETE' });
  }

  async migrateProducts(): Promise<{
    success: boolean;
    data: {
      message: string;
      results: {
        categoriesCreated: number;
        productsCreated: number;
        productsSkipped: number;
        errors: string[];
      };
    };
  }> {
    return this.fetch('/products/migrate', { method: 'POST' });
  }

  // Raw Materials
  async getRawMaterials(includeInactive = false): Promise<{
    success: boolean;
    data: {
      rawMaterials: Array<{
        _id: string;
        name: string;
        slug: string;
        icon?: string;
        imageUrl?: string;
        price: number;
        unit: 'g' | 'ml' | 'unit';
        description?: string;
        isActive: boolean;
        displayOrder: number;
        createdAt: string;
        updatedAt: string;
      }>;
    };
  }> {
    const url = `/raw-materials${includeInactive ? '?includeInactive=true' : ''}`;
    return this.fetch(url);
  }

  async getRawMaterial(id: string): Promise<{
    success: boolean;
    data: {
      rawMaterial: {
        _id: string;
        name: string;
        slug: string;
        icon?: string;
        imageUrl?: string;
        price: number;
        unit: 'g' | 'ml' | 'unit';
        description?: string;
        isActive: boolean;
        displayOrder: number;
        createdAt: string;
        updatedAt: string;
      };
    };
  }> {
    return this.fetch(`/raw-materials/${id}`);
  }

  async createRawMaterial(data: {
    name: string;
    slug: string;
    icon?: string;
    imageUrl?: string;
    price: number;
    unit: 'g' | 'ml' | 'unit';
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<{ success: boolean; data: { rawMaterial: unknown }; message: string }> {
    return this.fetch('/raw-materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRawMaterial(id: string, data: {
    name?: string;
    slug?: string;
    icon?: string;
    imageUrl?: string;
    price?: number;
    unit?: 'g' | 'ml' | 'unit';
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<{ success: boolean; data: { rawMaterial: unknown }; message: string }> {
    return this.fetch(`/raw-materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRawMaterial(id: string): Promise<{ success: boolean; data: { deleted: boolean }; message: string }> {
    return this.fetch(`/raw-materials/${id}`, { method: 'DELETE' });
  }

  async migrateRawMaterials(): Promise<{
    success: boolean;
    data: {
      message: string;
      results: {
        created: number;
        skipped: number;
        updated: number;
        errors: string[];
      };
    };
  }> {
    return this.fetch('/raw-materials/migrate', { method: 'POST' });
  }

  // Notifications (Admin)
  async getNotifications(unreadOnly = false): Promise<{
    success: boolean;
    data: {
      notifications: Array<{
        _id: string;
        type: 'new_order' | 'new_user' | 'new_ticket';
        entityId: string;
        title: string;
        message: string;
        isRead: boolean;
        createdAt: string;
      }>;
      unreadCount: number;
    };
  }> {
    const url = `/notifications${unreadOnly ? '?unreadOnly=true' : ''}`;
    return this.fetch(url);
  }

  async markNotificationAsRead(id: string): Promise<{
    success: boolean;
    data: { notification: unknown };
    message: string;
  }> {
    return this.fetch(`/notifications/${id}`, { method: 'PATCH' });
  }

  async markAllNotificationsAsRead(): Promise<{
    success: boolean;
    data: { modifiedCount: number };
    message: string;
  }> {
    return this.fetch('/notifications/read-all', { method: 'PATCH' });
  }

  async deleteNotification(id: string): Promise<{
    success: boolean;
    data: { deleted: boolean };
    message: string;
  }> {
    return this.fetch(`/notifications/${id}`, { method: 'DELETE' });
  }

  // PayPal
  async createPayPalOrder(orderData: {
    items: Array<{ cevicheType: string; quantity: number; price: number }>;
    total: number;
    personalInfo: { name: string; phone: string; email?: string };
    deliveryMethod: 'pickup' | 'uber-flash';
    scheduledDate: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    data: {
      id: string; // PayPal SDK expects 'id'
      paypalOrderId: string; // Kept for backward compatibility
      totalUsd: number;
      orderData: unknown;
    };
  }> {
    return this.fetch('/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async capturePayPalOrder(paypalOrderId: string, orderData: {
    items: Array<{ cevicheType: string; quantity: number; price: number }>;
    total: number;
    personalInfo: { name: string; phone: string; email?: string };
    deliveryMethod: 'pickup' | 'uber-flash';
    scheduledDate: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    data: {
      orderId: string;
      status: string;
      transactionId: string;
    };
    message: string;
  }> {
    return this.fetch('/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({ paypalOrderId, orderData }),
    });
  }

  // Users (Admin)
  async getUsers(params?: {
    search?: string;
    emailVerified?: boolean;
    isAdmin?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    success: boolean;
    data: {
      users: Array<{
        _id: string;
        username: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        address?: string;
        birthday?: string;
        dietaryPreferences?: string;
        emailVerified: boolean;
        isAdmin: boolean;
        createdAt: string;
      }>;
      totalCount: number;
      limit: number;
      offset: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.emailVerified !== undefined) queryParams.append('emailVerified', params.emailVerified.toString());
    if (params?.isAdmin !== undefined) queryParams.append('isAdmin', params.isAdmin.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = `/users${queryString ? `?${queryString}` : ''}`;

    const response = await this.fetch<{
      success: boolean;
      data: {
        users: Array<{
          _id: string;
          username: string;
          email?: string;
          firstName?: string;
          lastName?: string;
          phone?: string;
          address?: string;
          birthday?: string;
          dietaryPreferences?: string;
          emailVerified: boolean;
          isAdmin: boolean;
          createdAt: string;
        }>;
        totalCount: number;
        limit: number;
        offset: number;
      };
    }>(url);
    return response;
  }
}

export const api = new ApiService();

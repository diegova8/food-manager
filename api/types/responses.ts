/**
 * Standardized API Response Types
 *
 * All API endpoints should use these response types for consistency
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errorId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Specific response types
export interface AuthResponse {
  success: true;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email?: string;
      name: string;
      isAdmin: boolean;
    };
  };
  message: string;
}

export interface OrderResponse {
  success: true;
  data: {
    orderId: string;
    status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  };
  message: string;
}

export interface ConfigResponse {
  success: true;
  data: {
    prices?: Record<string, number>;
    customPrices?: Record<string, number>;
  };
  message?: string;
}

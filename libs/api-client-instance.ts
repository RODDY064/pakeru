import { getSession } from "next-auth/react";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  useBaseUrl?: boolean;
  requiresAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

class ApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: ApiOptions
  ): Promise<ApiResponse<T>> {
    const { useBaseUrl = false, requiresAuth = true, body, ...fetchOptions } = options;
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (useBaseUrl && !baseUrl) {
      throw new Error('NEXT_PUBLIC_BASE_URL not configured');
    }
    
    const url = useBaseUrl ? `${baseUrl}/v1${endpoint}` : `/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((fetchOptions.headers as Record<string, string>) ?? {})
    };

    // Add auth headers if required
    if (requiresAuth && typeof window !== 'undefined') {
      const session = await getSession();
      if (!session?.accessToken) {
        throw new AuthError('No access token available', 'NO_TOKEN');
      }
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    const requestConfig: RequestInit = {
      ...fetchOptions,
      headers,
      signal: AbortSignal.timeout(30000),
      ...(body && { body: JSON.stringify(body) })
    };

    try {
      const response = await fetch(url, requestConfig);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle auth errors specially
        if (response.status === 401) {
          throw new AuthError(
            data.message || 'Authentication failed',
            data.code || 'UNAUTHORIZED',
            data
          );
        }

        throw new ApiError(
          data.message || data.error || 'Request failed',
          response.status,
          data.code
        );
      }

      return { success: true, data };
    } catch (error) {
      if (error instanceof ApiError || error instanceof AuthError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async get<T>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
    return response.data!;
  }

  async post<T>(endpoint: string, body?: any, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body
    });
    return response.data!;
  }

  async patch<T>(endpoint: string, body?: any, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body
    });
    return response.data!;
  }

  async delete<T>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
    return response.data!;
  }

  // Server-side method (for use in API routes or server components)
  async serverRequest<T>(
    endpoint: string, 
    accessToken: string,
    options: Omit<ApiOptions, 'requiresAuth'> = {}
  ): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      ...options,
      requiresAuth: false,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers
      }
    });
    return response.data!;
  }
}

export const apiClient = new ApiClient();
export { ApiError, AuthError };
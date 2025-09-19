import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";
import { useRouter } from "next/navigation";
import { apiClient, AuthError, ApiOptions } from "./api-client-instance";

interface UseApiClientOptions {
  onAuthError?: () => void;
  retryOnAuthError?: boolean;
}

export const useApiClient = (options: UseApiClientOptions = {}) => {
  const { refreshSession, signOut, isAuthenticated: authStatus } = useAuth();
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(authStatus);

  const { onAuthError, retryOnAuthError = true } = options;

  const handleRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> => {
    setIsAuthLoading(true);

    try {
      const result = await requestFn();
      setIsAuthenticated(authStatus); 
      return result;
    } catch (error) {
      if (error instanceof AuthError && retryOnAuthError && retryCount === 0) {
        try {
          await refreshSession();
          setIsAuthenticated(authStatus); // Update after refresh attempt
          return await handleRequest(requestFn, retryCount + 1);
        } catch (refreshError) {
          setIsAuthenticated(false); // Set to false on refresh failure
          if (onAuthError) {
            onAuthError();
          } else {
            await signOut();
            router.push('/sign-in');
          }
          throw error;
        }
      }

      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  }, [refreshSession, signOut, router, onAuthError, retryOnAuthError, authStatus]);

  const get = useCallback(<T>(
    endpoint: string,
    options?: Omit<ApiOptions, 'method'>
  ) => {
    return handleRequest(() => apiClient.get<T>(endpoint, options));
  }, [handleRequest]);

  const post = useCallback(<T>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiOptions, 'method' | 'body'>
  ) => {
    return handleRequest(() => apiClient.post<T>(endpoint, body, options));
  }, [handleRequest]);

  const patch = useCallback(<T>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiOptions, 'method' | 'body'>
  ) => {
    return handleRequest(() => apiClient.patch<T>(endpoint, body, options));
  }, [handleRequest]);

  const del = useCallback(<T>(
    endpoint: string,
    options?: Omit<ApiOptions, 'method'>
  ) => {
    return handleRequest(() => apiClient.delete<T>(endpoint, options));
  }, [handleRequest]);

  return {
    get,
    post,
    patch,
    delete: del,
    isAuthLoading,
    isAuthenticated,
    client: apiClient
  };
};
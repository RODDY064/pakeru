"use client"

import { useSession } from "next-auth/react";
import { useEffect, useCallback, useRef, useState } from "react";

// Clean, focused types
interface RefreshResult {
  accessToken: string;
  expiresAt: number;
  user?: any;
}

interface AuthRefreshHook {
  refreshSession: () => Promise<void>;
  isRefreshing: boolean;
}

// Constants for clarity
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry
const REFRESH_ENDPOINT = "/api/auth/refresh";

// Simplified token utilities
const TokenUtils = {
  getExpiration: (token: string): number => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return 0;
    }
  },

  isExpired: (expiresAt: number): boolean => {
    return Date.now() >= expiresAt - REFRESH_BUFFER_MS;
  }
};

// Clean API service
const AuthAPI = {
  async refreshToken(): Promise<RefreshResult | null> {
    try {
      const response = await fetch(REFRESH_ENDPOINT, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.accessToken) return null;

      return {
        accessToken: data.accessToken,
        expiresAt: TokenUtils.getExpiration(data.accessToken),
        user: data.user
      };
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }
};

export const useAuthRefresh = (): AuthRefreshHook => {
  const { data: session, update, status } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTokenRef = useRef<string>("");

  // Clear timer helper
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Core refresh logic - single responsibility
  const refreshSession = useCallback(async (): Promise<void> => {
    // Don't refresh if already refreshing, no session, or not authenticated
    if (isRefreshing || status !== "authenticated" || !session?.accessToken) {
      return;
    }

    try {
      setIsRefreshing(true);
      
      const tokens = await AuthAPI.refreshToken();
      if (!tokens) return;

      await update({
        accessToken: tokens.accessToken,
        expiresAt: tokens.expiresAt,
        user: tokens.user
      });
    } catch (error) {
      console.error("Session refresh error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [update, isRefreshing, session?.accessToken, status]);

  // Handle expired tokens
  useEffect(() => {
    if (session?.error === "TokenExpiredError" && status === "authenticated" && !isRefreshing) {
      refreshSession();
    }
  }, [session?.error, refreshSession, isRefreshing, status]);

  // Auto-refresh timer with proper guards
  useEffect(() => {
    clearTimer();

    // Early returns for invalid states
    if (
      status !== "authenticated" || 
      !session?.accessToken || 
      isRefreshing ||
      session.accessToken === lastTokenRef.current // Prevent duplicate timers for same token
    ) {
      return;
    }

    // Update token reference
    lastTokenRef.current = session.accessToken;

    // Get expiration from the token itself
    const tokenExpiration = TokenUtils.getExpiration(session.accessToken);
    if (!tokenExpiration) return;

    const timeUntilRefresh = tokenExpiration - Date.now() - REFRESH_BUFFER_MS;

    console.log(timeUntilRefresh, 'time to refresh')

    // Only refresh if we're actually close to expiry
    if (timeUntilRefresh <= 0) {
      refreshSession();
      return;
    }

    console.log(`Scheduling refresh in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);
    timerRef.current = setTimeout(refreshSession, timeUntilRefresh);

    return clearTimer;
  }, [session?.accessToken, refreshSession, isRefreshing, status, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    refreshSession,
    isRefreshing
  };
};
"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useCallback, useRef } from "react";


export const useBackgroundAuth = () => {
  const { data: session, status, update } = useSession();
  
  // Refs for tracking
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const isRefreshing = useRef(false);
  const lastRefreshTime = useRef(0);
  
  // Constants
  const REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes
  const CHECK_INTERVAL = 60 * 1000; // Check every minute
  const MIN_REFRESH_INTERVAL = 2 * 60 * 1000; // Minimum 2 minutes between refreshes
  

  const getTokenExpiry = (token: string): number => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return 0;
    }
  };
  
  const needsRefresh = (expiryTime: number): boolean => {
    return Date.now() >= (expiryTime - REFRESH_BUFFER);
  };
  
  // Core refresh function
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    
    // Rate limiting
    if (now - lastRefreshTime.current < MIN_REFRESH_INTERVAL) {
      console.log("Refresh rate limited");
      return false;
    }
    
    // Prevent concurrent refreshes
    if (isRefreshing.current) {
      console.log("Refresh already in progress");
      return false;
    }
    
    // Only refresh if we have a session
    if (status !== "authenticated" || !session?.accessToken) {
      console.log("No session to refresh");
      return false;
    }
    
    const expiryTime = session.expiresAt || getTokenExpiry(session.accessToken);
    
    // Check if refresh is actually needed
    if (!needsRefresh(expiryTime)) {
      const minutesLeft = Math.round((expiryTime - now) / (1000 * 60));
      console.log(`Token still valid for ${minutesLeft} minutes`);
      return false;
    }
    
    try {
      isRefreshing.current = true;
      lastRefreshTime.current = now;
      
      console.log("Starting background token refresh");
      
      const response = await fetch("/api/auth/refresh", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log("Refresh token expired - auto-login needed");
          return false;
        }
        throw new Error(`Refresh failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.accessToken) {
        throw new Error("No access token in response");
      }
      
      // Update session
      const newExpiryTime = getTokenExpiry(data.accessToken);
      const updatedSession = {
        ...session,
        accessToken: data.accessToken,
        expiresAt: newExpiryTime,
        error: undefined,
        user: {
          ...session.user,
          ...data.user,
          _id: data.user?._id || data.user?.id || session.user._id,
        }
      };
      
      await update(updatedSession);
      
      const newMinutesLeft = Math.round((newExpiryTime - Date.now()) / (1000 * 60));
      console.log(`Background refresh successful - new token valid for ${newMinutesLeft} minutes`);
      
      return true;
      
    } catch (error) {
      console.error("Background refresh failed:", error);
      return false;
    } finally {
      isRefreshing.current = false;
    }
  }, [session, status, update]);
  
  
  const attemptAutoLogin = useCallback(async (): Promise<void> => {
    if (isRefreshing.current || status === "loading") return;
    
    try {
      isRefreshing.current = true;
      console.log("Attempting auto-login");
      
      const response = await fetch("/api/auth/refresh", {
        method: "GET", 
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        console.log("Auto-login failed - no valid refresh token");
        return;
      }
      
      const data = await response.json();
      
      if (!data.accessToken) {
        console.log("Auto-login failed - no access token");
        return;
      }
      
      // Sign in with credentials
      const userPayload = JSON.stringify({
        _id: data.user._id || data.user.id,
        email: data.user.email,
        firstname: data.user.firstName || data.user.firstname,
        lastname: data.user.lastName || data.user.lastname,
        role: data.user.role || "user",
        accessToken: data.accessToken,
        sessionId: data.user.sessionId
      });
      
      const result = await signIn("credentials", {
        username: userPayload,
        password: "refresh_token_signin",
        sessionId: data.user.sessionId,
        redirect: false,
      });
      
      if (result?.ok && !result?.error) {
        await update();
        console.log("Auto-login successful");
      } else {
        console.log("Auto-login failed:", result?.error);
      }
      
    } catch (error) {
      console.error("Auto-login error:", error);
    } finally {
      isRefreshing.current = false;
    }
  }, [status, update]);
  
  // Schedule next check
  const scheduleNextCheck = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }
    
    refreshTimer.current = setTimeout(() => {
      if (status === "authenticated" && session?.accessToken) {
        // Check if refresh is needed
        refreshTokens();
      } else if (status === "unauthenticated") {
        // Try auto-login
        attemptAutoLogin();
      }
      
      // Schedule next check
      scheduleNextCheck();
    }, CHECK_INTERVAL);
  }, [status, session?.accessToken, refreshTokens, attemptAutoLogin]);
  
  // Start background monitoring
  useEffect(() => {
    console.log("Starting background auth monitoring");
    scheduleNextCheck();
    
    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
      console.log(" Stopping background auth monitoring");
    };
  }, [scheduleNextCheck]);
  
  // Handle immediate refresh needs
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      const expiryTime = session.expiresAt || getTokenExpiry(session.accessToken);
      
      // If token is already expired or very close to expiry, refresh immediately
      if (needsRefresh(expiryTime)) {
        console.log(" Token needs immediate refresh");
        refreshTokens();
      }
    }
  }, [session?.accessToken, session?.expiresAt, status, refreshTokens]);
  
  // Try auto-login on mount if no session
  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("No session found - attempting auto-login");
      attemptAutoLogin();
    }
  }, [status, attemptAutoLogin]);

  return {
    isRefreshing: isRefreshing.current,
    hasSession: status === "authenticated" && !!session?.accessToken
  };
};
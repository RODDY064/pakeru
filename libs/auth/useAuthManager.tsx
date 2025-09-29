"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { decodeAuthSyncCookie } from "../signAuth";
import { manualCookieSync } from "@/auth";


// Configuration constants
const CONFIG = {
  REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes
  CHECK_INTERVAL: 30 * 1000, // 30 seconds
  MIN_REFRESH_INTERVAL: 60 * 1000, // 60 seconds
  MAX_RETRIES: 3,
  FETCH_TIMEOUT: 10000, // 10 seconds
  MAX_COOKIE_AGE_DAYS: 1,
  SYNC_CHECK_INTERVAL: 2 * 60 * 1000, // 2 minutes
  MAX_MIDDLEWARE_DATA_AGE: 2 * 60 * 1000, // 2 minutes
  MAX_BACKOFF: 30000, // 30 seconds
};

// Interfaces for type safety
interface AuthSyncData {
  userId: string;
  exp: number;
  [key: string]: unknown;
}

interface Session {
  accessToken: string;
  expiresAt?: number;
  user: {
    _id: string;
    email: string;
    firstname?: string;
    lastname?: string;
    role: string;
  };
  error?: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    _id?: string;
    id?: string;
    email: string;
    firstName?: string;
    firstname?: string;
    lastName?: string;
    lastname?: string;
    role?: string;
  };
}

// Logger utility
const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
};

// Cookie helpers
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() || null : null;
};

const setCookie = (name: string, value: string, days: number): void => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const removeCookie = (name: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

// Network utilities
const isOnline = (): boolean => (typeof navigator !== "undefined" ? navigator.onLine : true);

const isNetworkError = (error: unknown): boolean => {
  if (!error || !(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    error.name === "TypeError" ||
    error.name === "NetworkError" ||
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("timeout") ||
    message.includes("failed to fetch") ||
    message.includes("network error") ||
    message.includes("connection refused")
  );
};

const calculateBackoff = (attempt: number, baseDelay = 1000): number => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), CONFIG.MAX_BACKOFF);
  return delay + Math.random() * 0.1 * delay; // 10% jitter
};

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  maxRetries = CONFIG.MAX_RETRIES,
  timeoutMs = CONFIG.FETCH_TIMEOUT
): Promise<Response> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (!isOnline()) throw new Error("Network offline");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      logger.warn(`Fetch attempt ${attempt + 1} failed`, error);
      if (attempt === maxRetries || !isNetworkError(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, calculateBackoff(attempt)));
    }
  }
  throw new Error("Max retries exceeded");
};

// Auth utilities
const getAuthSyncData = (): AuthSyncData | null => {
  try {
    const cookie = getCookie("auth-sync");
    if (!cookie) return null;
    const decodedData = decodeAuthSyncCookie(cookie);
    return decodedData as AuthSyncData;
  } catch (error) {
    logger.error("Error decoding auth-sync cookie", error);
    return null;
  }
};

const hasValidAuthSync = (): boolean => {
  const syncData = getAuthSyncData();
  if (!syncData || Date.now() > syncData.exp) {
    return false;
  }
  return true;
};

const setAutoLoginFlag = (): void => setCookie("auto-login-in-progress", "true", CONFIG.MAX_COOKIE_AGE_DAYS);
const clearAutoLoginFlag = (): void => removeCookie("auto-login-in-progress");

const getTokenExpiry = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return 0;
  }
};

const needsRefresh = (expiryTime: number): boolean => Date.now() >= expiryTime - CONFIG.REFRESH_BUFFER;

export const useBackgroundAuth = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessing = useRef(false);
  const networkErrorCount = useRef(0);
  const hasTriedAutoLogin = useRef(false);
  const [isSynced, setIsSynced] = useState(false);
  const [lastCheck, setLastCheck] = useState(0);

  const performAutoLogin = useCallback(async (): Promise<boolean> => {

    if (!isProcessing.current || !hasValidAuthSync() || !isOnline() || hasTriedAutoLogin.current) {
      // logger.debug("Skipping auto-login", 
      //   { isProcessing: isProcessing.current, hasAuthSync: hasValidAuthSync(), 
      //     isOnline: isOnline(), 
      //     hasTried: hasTriedAutoLogin.current });
      return false;
    }

    isProcessing.current = true;
    hasTriedAutoLogin.current = true;
    setAutoLoginFlag();

    try {
      logger.debug("Attempting auto-login via refresh");
      const response = await fetchWithRetry( "/api/auth/refresh",
        { method: "GET", credentials: "include", headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logger.warn("Refresh token expired/invalid, removing auth-sync");
          removeCookie("auth-sync");
          hasTriedAutoLogin.current = false;
        }
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data: RefreshResponse = await response.json();

      if (!data.accessToken || !data.user) {
        logger.error("Invalid refresh response", data);
        removeCookie("auth-sync");
        hasTriedAutoLogin.current = false;
        throw new Error("Missing tokens or user data");
      }

      const userPayload = JSON.stringify({
        _id: data.user._id || data.user.id,
        email: data.user.email,
        firstname: data.user.firstName || data.user.firstname,
        lastname: data.user.lastName || data.user.lastname,
        role: data.user.role || "user",
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || "from_cookie",
        expiresAt: getTokenExpiry(data.accessToken),
      });

      const result = await signIn("credentials", { username: userPayload, password: "refresh_token_signin", redirect: false });
      if (!result?.ok || result?.error) {
        logger.error("SignIn failed after refresh", result?.error);
        hasTriedAutoLogin.current = false;
        throw new Error(`SignIn failed: ${result?.error || "Unknown error"}`);
      }

      let sessionSynced = false;
      for (let i = 0; i < 5; i++) {
        await update();
        await new Promise((resolve) => setTimeout(resolve, 200 * (i + 1)));
        const updatedSession = await update();
        if (updatedSession?.accessToken === data.accessToken) {
          sessionSynced = true;
          break;
        }
        logger.debug(`Session sync attempt ${i + 1}/5`);
      }

      if (!sessionSynced) logger.warn("Session may not be fully synced");
      networkErrorCount.current = 0;
      logger.debug("Auto-login completed successfully");
      return true;
    } catch (error) {
      logger.error("Auto-login failed", error);
      if (isNetworkError(error)) {
        networkErrorCount.current++;
        hasTriedAutoLogin.current = false;
      } 
      return false;
    } finally {
      isProcessing.current = false;
      clearAutoLoginFlag();
    }
  }, [update]);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!isProcessing.current ||
      status !== "authenticated" ||
      !session?.accessToken ||
      session?.error
    ) {
      return false;
    }

    const expiryTime = session.expiresAt || getTokenExpiry(session.accessToken);
    if (!needsRefresh(expiryTime)) return true;

    isProcessing.current = true;
    try {
      logger.debug("Refreshing access token");
      const response = await fetchWithRetry(
        "/api/auth/refresh",
        { method: "GET", credentials: "include", headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logger.warn("Refresh token expired, removing auth-sync");
          removeCookie("auth-sync");
          hasTriedAutoLogin.current = false;
        }
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data: RefreshResponse = await response.json();
      if (!data.accessToken) throw new Error("No access token in response");

      const updatedSession: Session = {
        ...session,
        accessToken: data.accessToken,
        expiresAt: getTokenExpiry(data.accessToken),
        error: undefined,
        user: {
          ...session.user,
          ...data.user,
          _id: data.user._id || data.user.id || session.user._id,
        },
      };

      await update(updatedSession);
      networkErrorCount.current = 0;
      logger.debug("Token refresh successful");
      return true;
    } catch (error) {
      logger.error("Token refresh failed", error);
      if (isNetworkError(error)) networkErrorCount.current++;
      return false;
    } finally {
      isProcessing.current = false;
    }
  }, [session, status, update]);

  const handleMiddlewareRefreshData = useCallback(async (): Promise<boolean> => {
    const middlewareSuccess = getCookie("middleware-refresh-success");
    const autoSigninData = getCookie("auto-signin-data");
    if (!middlewareSuccess || !autoSigninData) return false;

    try {
      logger.debug("Processing middleware refresh data");
      const signinData = JSON.parse(autoSigninData);
      if (!signinData.user || !signinData.accessToken) throw new Error("Invalid middleware signin data");

      removeCookie("middleware-refresh-success");
      removeCookie("auto-signin-data");

      const dataAge = Date.now() - (signinData.timestamp || 0);
      if (dataAge > CONFIG.MAX_MIDDLEWARE_DATA_AGE) {
        logger.warn("Middleware refresh data too old");
        return false;
      }

      const payload = JSON.parse(atob(signinData.accessToken.split(".")[1]));
      if (payload.exp * 1000 <= Date.now()) {
        logger.warn("Middleware refresh token expired");
        return false;
      }

      const userPayload = JSON.stringify({
        _id: signinData.user._id || signinData.user.id,
        email: signinData.user.email,
        firstname: signinData.user.firstName || signinData.user.firstname,
        lastname: signinData.user.lastName || signinData.user.lastname,
        role: signinData.user.role || "user",
        accessToken: signinData.accessToken,
        expiresAt: getTokenExpiry(signinData.accessToken),
      });

      const result = await signIn("credentials", {
        username: userPayload,
        password: "middleware_refresh_signin",
        redirect: false,
      });

      if (!result?.ok || result?.error) {
        logger.error("Middleware signin failed", result?.error);
        return false;
      }

      await Promise.race([
        update(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Session update timeout")), 5000)),
      ]);

      networkErrorCount.current = 0;
      hasTriedAutoLogin.current = false;
      logger.debug("Middleware refresh signin successful");
      return true;
    } catch (error) {
      logger.error("Failed to process middleware refresh data", error);
      removeCookie("middleware-refresh-success");
      removeCookie("auto-signin-data");
      return false;
    }
  }, [update]);

  const syncAuthCookies = useCallback(async () => {
    const authSyncData = getAuthSyncData();
    if (authSyncData && Date.now() > authSyncData.exp) {
      logger.debug("Auth-sync expired, removing");
      removeCookie("auth-sync");
    }
  }, []);

  const handleBackgroundTasks = useCallback(async () => {
    if (isProcessing.current || !isOnline()) return;

    isProcessing.current = true;
    try {
      // Handle middleware refresh data first
      if (await handleMiddlewareRefreshData()) return;

      // Sync cookies
      await syncAuthCookies();

      // Check session and auth-sync status
      const hasAuth = hasValidAuthSync();
      const needsAuth = status === "unauthenticated" || session?.error;

      if (hasAuth && needsAuth && !hasTriedAutoLogin.current) {
        logger.debug("Attempting auto-login due to missing/invalid session");
        if (await performAutoLogin()) {
          logger.debug("Auto-login successful, refreshing page");
          router.replace(window.location.pathname);
        }
      } else if (status === "authenticated" && session?.accessToken && !session?.error) {
        const expiryTime = session.expiresAt || getTokenExpiry(session.accessToken);
        if (needsRefresh(expiryTime)) {
          logger.debug("Session needs refresh");
          await refreshAccessToken();
        }
      }
    } finally {
      isProcessing.current = false;
    }
  }, [status, session, performAutoLogin, refreshAccessToken, syncAuthCookies, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleBackgroundTasks();
    }, CONFIG.CHECK_INTERVAL + networkErrorCount.current * CONFIG.CHECK_INTERVAL);

    handleBackgroundTasks(); // Initial check

    const handleOnline = () => {
      logger.debug("Network online, resetting error count");
      networkErrorCount.current = Math.max(0, networkErrorCount.current - 1);
      if (hasValidAuthSync()) hasTriedAutoLogin.current = false;
      handleBackgroundTasks();
    };

    const handleOffline = () => logger.debug("Network offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearAutoLoginFlag();
    };
  }, [handleBackgroundTasks]);

  useEffect(() => {
    const checkSync = async () => {
      const synced = await manualCookieSync();
      setIsSynced(synced);
      setLastCheck(Date.now());
    };

    checkSync();
    const interval = setInterval(checkSync, CONFIG.SYNC_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && !session?.error) {
      hasTriedAutoLogin.current = false;
    }
  }, [status, session?.error]);

  return {
    hasSession: status === "authenticated" && !!session?.accessToken && !session?.error,
    hasAuthSync: hasValidAuthSync(),
    status,
    isSynced,
    lastCheck,
  };
};
"use client";
import { SessionProvider } from "next-auth/react";
import { useBackgroundAuth } from "./useAuthManager";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

function BackgroundAuthHandler({ children }: AuthProviderProps) {
  const { isRefreshing, hasSession } = useBackgroundAuth();
  
  if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
    console.log("🔍 Auth Status:", { isRefreshing, hasSession });
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <BackgroundAuthHandler>{children}</BackgroundAuthHandler>
    </SessionProvider>
  );
}
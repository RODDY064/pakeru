
"use client"

import { SessionProvider } from "next-auth/react";
import { useAuthRefresh } from "./useAuthRefresh";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

function AuthRefreshHandler({ children }: AuthProviderProps) {
  useAuthRefresh(); 

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <AuthRefreshHandler>{children}</AuthRefreshHandler>
    </SessionProvider>
  );
}
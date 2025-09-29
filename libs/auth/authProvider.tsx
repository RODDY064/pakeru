"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

function BackgroundAuthHandler({ children }: AuthProviderProps) {

  

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <BackgroundAuthHandler>{children}</BackgroundAuthHandler>
    </SessionProvider>
  );
}
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    if (!session?.accessToken) return {};
    
    return {
      Authorization: `Bearer ${session.accessToken}`,
    };
  }, [session?.accessToken]);

  const refreshSession = useCallback(async () => {
    try {
      await update();
    } catch (error) {
      console.error("Failed to refresh session:", error);
      // router.push("/sign-in");
    }
  }, [update]);

  const signOut = useCallback(async () => {
    const { signOut: nextAuthSignOut } = await import("next-auth/react");
    await nextAuthSignOut({ callbackUrl: "/sign-in" });
  }, []);

  const isAuthenticated = status === "authenticated" && !!session?.accessToken;
  const isLoading = status === "loading";

  return {
    user: session?.user,
    accessToken: session?.accessToken,
    expiresAt: session?.expiresAt,
    isAuthenticated,
    isLoading,
    getAuthHeaders,
    refreshSession,
    signOut,
  };
}

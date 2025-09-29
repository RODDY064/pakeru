import NextAuthOptions from "next-auth";
import { JWT } from "next-auth/jwt";

// Helper to sync auth-sync cookie with NextAuth session updates
export const syncAuthCookie = (token: JWT, trigger?: "signIn" | "signUp" | "update"): void => {
  // Only sync on server side during JWT callback
  if (typeof window !== "undefined") return;
  
  try {
    // Create auth-sync data that matches backend expectations
    const authSyncData = {
      userId: token.sub || token._id,
      email: token.email,
      exp: token.exp ? token.exp * 1000 : Date.now() + (7 * 24 * 60 * 60 * 1000), // Default 7 days
      iat: token.iat ? token.iat * 1000 : Date.now(),
      // Add any other fields your backend expects
    };

    // Note: In NextAuth JWT callback, we can't directly set cookies
    // Instead, we'll add this data to the token so the session callback can use it
    token.authSyncData = authSyncData;
    
  } catch (error) {
    console.error("Failed to sync auth cookie:", error);
  }
};



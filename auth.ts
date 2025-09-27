// auth.ts - Fixed to prevent refresh loops with proper TypeScript types
import NextAuth, { Session, JWT, User, Account, Profile } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { AuthCache } from "./libs/redis";

const SignInType = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

// Special marker for refresh token auto-login
const REFRESH_TOKEN_SIGNIN = "refresh_token_signin";

export class AuthService {
  private static baseUrl = `${process.env.NEXT_PUBLIC_URL}/api/auth`;

  public static getTokenExpiration(token: string): number {
    try {
      const [, payload] = token.split(".");
      if (!payload) throw new Error("Invalid JWT format");

      const paddedPayload =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);
      const decodedBuffer = Buffer.from(
        paddedPayload.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      );
      const { exp } = JSON.parse(decodedBuffer.toString("utf8"));

      return (exp || 0) * 1000;
    } catch (error) {
      console.error("JWT decode failed:", error);
      return 0;
    }
  }

  static async authenticate(
    username: string,
    password: string,
    sessionId?: string
  ) {
    if (password === REFRESH_TOKEN_SIGNIN) {
      console.log("Processing refresh token signin");
      try {
        const userData = JSON.parse(username);
        return {
          _id: userData._id,
          email: userData.email,
          firstname: userData.firstname,
          lastname: userData.lastname,
          role: userData.role || "user",
          accessToken: userData.accessToken,
          expiresAt: this.getTokenExpiration(userData.accessToken),
          sessionId: userData.sessionId,
        };
      } catch (error) {
        console.error("Failed to parse refresh token signin data:", error);
        throw new Error("Invalid refresh token signin data");
      }
    }

    // Check Redis cache for regular login
    if (sessionId) {
      const cachedResult = await AuthCache.getAuthResult(sessionId);
      if (cachedResult && cachedResult.status === 200) {
        console.log("Using cached authentication result");
        const expiresAt = this.getTokenExpiration(cachedResult.accessToken);

        return {
          _id: cachedResult.user._id,
          email: cachedResult.user.email,
          firstname: cachedResult.user.firstName,
          lastname: cachedResult.user.lastName,
          role: cachedResult.user.role || "user",
          accessToken: cachedResult.accessToken,
          expiresAt,
          sessionId,
        };
      }
    }

    // Regular login flow
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.msg ||
          errorData.message ||
          `Authentication failed: ${response.statusText}`
      );
    }

    const data = await response.json();
    const expiresAt = this.getTokenExpiration(data.accessToken);

    return {
      _id: data.user._id,
      email: data.user.email,
      firstname: data.user.firstName,
      lastname: data.user.lastName,
      role: data.user.role || "user",
      accessToken: data.accessToken,
      expiresAt,
      sessionId,
    };
  }
}

declare module "next-auth" {
  interface User {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
    role: string;
    accessToken: string;
    expiresAt: number;
    sessionId?: string;
  }

  interface Session {
    user: {
      _id: string;
      username: string;
      firstname: string;
      lastname: string;
      role: string;
    };
    accessToken: string;
    expiresAt: number;
    expires: string;
    sessionId?: string;
    error?: "RefreshTokenError" | "TokenExpiredError";
  }

  interface JWT {
    accessToken?: string;
    expiresAt?: number;
    sessionId?: string;
    user?: {
      _id: string;
      username: string;
      firstname: string;
      lastname: string;
      role: string;
    };
    error?: string;
    lastRefresh?: number;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        sessionId: { label: "Session ID", type: "text" },
      },
      async authorize(credentials) {
        try {
          const result = SignInType.safeParse(credentials);
          if (!result.success) {
            const errorMessage = result.error.errors
              .map((err) => err.message)
              .join(", ");
            throw new Error(errorMessage);
          }

          const { username, password, sessionId } = credentials as {
            username: string;
            password: string;
            sessionId?: string;
          };

          const user = await AuthService.authenticate(
            username,
            password,
            sessionId
          );
          if (!user) {
            throw new Error("Invalid credentials");
          }

          return {
            _id: user._id,
            username: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            accessToken: user.accessToken,
            expiresAt: user.expiresAt,
            sessionId: user.sessionId,
          };
        } catch (error) {
          console.error("Authorization failed:", error);
          throw new Error(
            error instanceof Error ? error.message : "Authentication failed"
          );
        }
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
    signOut: "/sign-in",
  },

  callbacks: {
    async signIn({ user, credentials }) {
      // Don't clear cache for refresh token signin
      const isRefreshSignin =
        (credentials as any)?.password === REFRESH_TOKEN_SIGNIN;

      if (!isRefreshSignin) {
        const sessionId = (credentials as any)?.sessionId;
        if (sessionId) {
          await AuthCache.clearAuthResult(sessionId);
          console.log(`Cleared Redis cache for sessionId: ${sessionId}`);
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Initial sign in - set up token
      if (user) {
        return {
          accessToken: (user as any).accessToken,
          expiresAt: (user as any).expiresAt,
          sessionId: (user as any).sessionId,
          user: {
            _id: user.id || (user as any)._id,
            username: (user as any).username || user.email,
            firstname: (user as any).firstname,
            lastname: (user as any).lastname,
            role: (user as any).role,
          },
          lastRefresh: Date.now(),
        };
      }

      // Manual update trigger (from your refresh logic)
      if (trigger === "update" && session) {
        return {
          ...token,
          ...session,
          lastRefresh: Date.now(),
          error: undefined, // Clear any previous errors
        };
      }

      // Check if token is expired - but don't auto-refresh here
      // Let the client-side handle refreshing to avoid loops
      const now = Date.now();
      const expiresAt =
        typeof token.expiresAt === "number" ? token.expiresAt : 0;
      const timeUntilExpiry = expiresAt - now;
      const needsRefresh = timeUntilExpiry <= 2 * 60 * 1000; // 2 minutes buffer

      if (needsRefresh) {
        // Only set error if token is actually expired (not just needs refresh)
        const isExpired = timeUntilExpiry <= 0;
        if (isExpired) {
          console.log("JWT callback: Token expired");
          return { ...token, error: "TokenExpiredError" };
        } else {
          console.log(
            `JWT callback: Token needs refresh in ${Math.round(
              timeUntilExpiry / 1000 / 60
            )} minutes`
          );
        }
      }

      return token;
    },

    async session({ session, token }): Promise<Session> {
      // Handle expired tokens
      if (token?.error === "TokenExpiredError") {
        console.log("Session callback: Handling expired token");

        // Clear cache if we have a session ID
        if (typeof token.sessionId === "string" && token.sessionId.length > 0) {
          await AuthCache.clearAuthResult(token.sessionId);
        }

        return {
          ...session,
          user: {
            _id: "",
            username: "",
            firstname: "",
            lastname: "",
            role: "",
          },
          accessToken: "",
          expiresAt: 0,
          expires: new Date(0).toISOString(),
          sessionId:
            typeof token.sessionId === "string" ? token.sessionId : undefined,
          error: "TokenExpiredError",
        };
      }

      // FIXED: Ensure user ID is properly set - fallback chain
      const userId =
        typeof token.user === "object" &&
        token.user !== null &&
        "_id" in token.user &&
        typeof (token.user as any)._id === "string"
          ? (token.user as any)._id
          : (token as any).userId || "";
      const username =
        (typeof token.user === "object" &&
        token.user !== null &&
        "username" in token.user &&
        typeof (token.user as any).username === "string"
          ? (token.user as any).username
          : "") ||
        (token as any).username ||
        "";

      console.log("Session callback - User data:", {
        tokenUserId:
          typeof token.user === "object" &&
          token.user !== null &&
          "_id" in token.user
            ? (token.user as any)._id
            : undefined,
        tokenUsername:
          typeof token.user === "object" &&
          token.user !== null &&
          "username" in token.user
            ? (token.user as any).username
            : undefined,
        finalUserId: userId,
        finalUsername: username,
      });

      // Return normal session with proper user ID
      return {
        ...session,
        user: {
          _id: userId,
          username: username,
          firstname:
            (token.user &&
            typeof token.user === "object" &&
            "firstname" in token.user &&
            typeof (token.user as any).firstname === "string"
              ? (token.user as any).firstname
              : "") || "",
          lastname:
            (token.user &&
            typeof token.user === "object" &&
            "lastname" in token.user &&
            typeof token.user.lastname === "string"
              ? token.user.lastname
              : "") || "",
          role:
            token.user &&
            typeof token.user === "object" &&
            typeof (token.user as any).role === "string"
              ? (token.user as any).role
              : "user",
        },
        accessToken:
          typeof token.accessToken === "string" ? token.accessToken : "",
        expiresAt: typeof token.expiresAt === "number" ? token.expiresAt : 0,
        sessionId:
          typeof token.sessionId === "string" ? token.sessionId : undefined,
        expires: session.expires,
      };
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  events: {
    async signOut(event) {
      const token = (event as { token?: JWT | null })?.token;
      if (token?.sessionId) {
        await AuthCache.clearAuthResult(token.sessionId);
      }
      try {
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        console.log("Logout successful");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
  },

  // Prevent debug logs in production
  debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET,
});

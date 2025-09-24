import NextAuth, { Session, JWT, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { AuthCache } from "./libs/redis";

const SignInType = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

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
      return Date.now() + 60 * 60 * 1000;
    }
  }

  static async authenticate(username: string, password: string, sessionId?: string) {
    if (sessionId) {
      const cachedResult = await AuthCache.getAuthResult(sessionId);
      if (cachedResult) {
        console.log("Using cached authentication result");
        if (cachedResult.status !== 200) {
          throw new Error(cachedResult.msg || "Cached authentication failed");
        }

        const expiresAt = this.getTokenExpiration(cachedResult.accessToken);

        return {
          _id: cachedResult.user._id,
          email: cachedResult.user.email,
          firstname: cachedResult.user.firstName,
          lastname: cachedResult.user.lastName,
          accessToken: cachedResult.accessToken,
          expiresAt,
          sessionId, 
        };
      }
    }

    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Authentication failed:", errorData);
      throw new Error(
        errorData.msg ||
          errorData.message ||
          `Authentication failed: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Authentication successful");

    const expiresAt = this.getTokenExpiration(data.accessToken);

    return {
      _id: data.user._id,
      email: data.user.email,
      firstname: data.user.firstName,
      lastname: data.user.lastName,
      accessToken: data.accessToken,
      expiresAt,
      sessionId, // Include sessionId
    };
  }
}

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    accessToken: string;
    expiresAt: number;
    sessionId?: string; // Add sessionId
  }

  interface Session {
    user: {
      _id: string;
      username: string;
      firstname: string;
      lastname: string;
    };
    accessToken: string;
    expiresAt: number;
    expires: string;
    sessionId?: string; // Add sessionId
    error?: "RefreshTokenError" | "TokenExpiredError";
  }

  interface JWT {
    accessToken: string;
    expiresAt: number;
    sessionId?: string; // Add sessionId
    user: {
      id: string;
      username: string;
      firstname: string;
      lastname: string;
    };
    error?: string;
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
          const user = await AuthService.authenticate(username, password, sessionId);

          if (!user) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user._id,
            username: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            accessToken: user.accessToken,
            expiresAt: user.expiresAt,
            sessionId: user.sessionId, // Store sessionId
          };
        } catch (error) {
          console.error("Authorization failed:", error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new InvalidLoginError("Authentication failed");
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
      const sessionId = (credentials as any)?.sessionId;
      if (sessionId) {
        await AuthCache.clearAuthResult(sessionId);
        console.log(`Cleared Redis cache for sessionId: ${sessionId}`);
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - storing tokens");
        return {
          accessToken: user.accessToken,
          expiresAt: user.expiresAt,
          sessionId: user.sessionId, // Store sessionId in JWT
          user: {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
          },
        };
      }

      const bufferTime = 5 * 60 * 1000;
      const shouldRefresh = Date.now() >= (token.expiresAt as number) - bufferTime;

      if (!shouldRefresh) return token;

      return {
        ...token,
        error: "TokenExpiredError",
      };
    },

    async session({ session, token }): Promise<Session> {
      if (token?.error === "TokenExpiredError") {
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
          },
          accessToken: "",
          expiresAt: 0,
          expires: new Date(0).toISOString(),
          sessionId: typeof token.sessionId === "string" ? token.sessionId : undefined,
          error: "TokenExpiredError",
        };
      }

      return {
        ...session,
        user: {
          _id: (token.user as any)?.id || "",
          username: (token.user as any)?.username || "",
          firstname: (token.user as any)?.firstname || "",
          lastname: (token.user as any)?.lastname || "",
        },
        accessToken: (token.accessToken as string) || "",
        expiresAt: (token.expiresAt as number) || 0,
        sessionId: typeof token.sessionId === "string" ? token.sessionId : undefined,
        expires: session.expires,
      };
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  events: {
    async signOut(event) {
      const token = (event as { token?: JWT | null })?.token;
      if (token && token.sessionId) {
        await AuthCache.clearAuthResult(token.sessionId);
        console.log(`Cleared Redis cache for sessionId: ${token.sessionId} during sign-out`);
      }
      try {
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    },
  },

  secret: process.env.AUTH_SECRET,
});


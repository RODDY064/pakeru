import NextAuth, { Session, JWT } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { AuthCache } from "./libs/redis";

const SignInType = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

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
  ) {

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

    const setCookie = response.headers.get("set-cookie");
    const cookieNAME = process.env.REFRESH_TOKEN_NAME ?? "refresh_token";
    let refreshToken: string | undefined;
    let refreshTokenExpiresAt: number | undefined;

    if (setCookie) {
      const cookies = setCookie.split(/,(?=\s*\w+=)/);
      for (const cookie of cookies) {
        const parts = cookie.split(";");
        const [name, value] = parts[0].split("=");

        if (name && value && name.trim() === cookieNAME) {
          let isExpired = false;

          const expiresPart = parts.find((p) =>
            p.trim().toLowerCase().startsWith("expires=")
          );
          if (expiresPart) {
            const expiresDate = new Date(expiresPart.split("=")[1].trim());
            if (!isNaN(expiresDate.getTime())) {
              refreshTokenExpiresAt = expiresDate.getTime();
              if (expiresDate.getTime() < Date.now()) isExpired = true;
            }
          }

          const maxAgePart = parts.find((p) =>
            p.trim().toLowerCase().startsWith("max-age=")
          );
          if (maxAgePart) {
            const maxAgeSeconds = parseInt(maxAgePart.split("=")[1].trim(), 10);
            if (!isNaN(maxAgeSeconds)) {
              refreshTokenExpiresAt = Date.now() + maxAgeSeconds * 1000;
              if (maxAgeSeconds <= 0) isExpired = true;
            }
          }

          if (!isExpired) {
            refreshToken = value.trim();
          }
        }
      }
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
      refreshToken,
      refreshTokenExpiresAt,
      expiresAt,
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
    refreshToken?: string;
    expiresAt: number;
    refreshType?: string;
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
    refreshToken?: string;
    refreshTokenExpiresAt?: number;
    expiresAt: number;
    expires: string;
    error?: "RefreshTokenError" | "TokenExpiredError";
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    refreshTokenExpiresAt?: number;
    expiresAt?: number;
    sessionId?: string;
    user?: {
      _id: string;
      username: string;
      firstname: string;
      lastname: string;
      role: string;
    };
    error?: "RefreshTokenError" | "TokenExpiredError";
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
          );

          if (!user) {
            throw new Error("Invalid credentials");
          }

          // Ensure required fields exist and provide sensible fallbacks
          const safeUsername = user.email ?? (user as any).username ?? user._id;
          const safeFirstname = user.firstname ?? "";
          const safeLastname = user.lastname ?? "";
          const safeRole = user.role ?? "user";

          return {
            _id: user._id,
            username: safeUsername,
            firstname: safeFirstname,
            lastname: safeLastname,
            role: safeRole,
            accessToken: user.accessToken,
            expiresAt: user.expiresAt,
            refreshToken: user.refreshToken,
            refreshTokenExpiresAt: user.refreshTokenExpiresAt,
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
    async jwt({ token, user }) {
      // 1. First-time login → store tokens
      if (user) {
        return {
          ...token,
          accessToken: (user as any).accessToken,
          expiresAt: (user as any).expiresAt,
          refreshToken: (user as any).refreshToken,
          refreshTokenExpiresAt: (user as any).refreshTokenExpiresAt,
          sessionId: (user as any).sessionId,
          user: {
            _id: (user as any)._id,
            username: (user as any).username,
            firstname: (user as any).firstname,
            lastname: (user as any).lastname,
            role: (user as any).role,
          },
        };
      }

      // 2. Access token still valid → just return token
      if (
        typeof token.expiresAt === "number" &&
        Date.now() < token.expiresAt - 5 * 60 * 1000 // refresh 5 mins before expiry
      ) {
        return token;
      }

      // 3. Access token expired → try refresh
      if (!token.refreshToken) {
        token.error = "RefreshTokenMissing";
        return token;
      }

      if (typeof token.refreshTokenExpiresAt === "number" && Date.now() > token.refreshTokenExpiresAt ) {
        token.error = "RefreshTokenExpired";
        return token;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/refresh`,
          {
            method: "GET",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.refreshToken}`
             },
            
          }
        );

        const data = await response.json();

        console.log(data)
        if (!response.ok) throw data;

        const expiresAt = AuthService.getTokenExpiration(data.accessToken);

        return {
          ...token,
          accessToken: data.accessToken,
          expiresAt,
        };
      } catch (error) {
        console.error("Error refreshing access token:", error);
        token.error = "RefreshTokenError";
        return token;
      }
    },
    async session({ session, token }): Promise<Session> {
      session.error = (token.error === "RefreshTokenError" || token.error === "TokenExpiredError")? token.error: undefined;
      session.user = (token.user as any) ?? {};
      session.accessToken = (token.accessToken as string) ?? "";
      session.expiresAt = (token.expiresAt as number) ?? 0;
      session.refreshToken = token.refreshToken as string | undefined;
      session.refreshTokenExpiresAt = token.refreshTokenExpiresAt as | number | undefined;

      // console.log(session, "session");
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
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

import NextAuth, { Session, JWT } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

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

  static async authenticate(username: string, password: string) {
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
      isAuthProvider: data.user.isAuthProvider,
      role: data.user.role || "user",
      image: data.user.profilePictureUrl,
      accessToken: data.accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      expiresAt,
    };
  }

  static async authenticateGoogle(
    email: string,
    firstName: string,
    lastName: string,
    profileId: string,
    image?: string
  ) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/google`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, firstName, lastName, image, profileId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(errorData);
      throw new Error(
        errorData.msg ||
          errorData.message ||
          `Google authentication failed: ${response.statusText}`
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
      firstname: data.user.firstName || data.user.firstname || "",
      lastname: data.user.lastName || data.user.lastname || "",
      role: data.user.role || "user",
      isAuthProvider: data.user.isAuthProvider,
      accessToken: data.accessToken,
      refreshToken,
      refreshTokenExpiresAt,
      expiresAt,
      image: data.user.image,
    };
  }
}

declare module "next-auth" {
  interface User {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
    isAuthProvider?: boolean;
    role: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    refreshTokenExpiresAt?: number;
    refreshType?: string;
    image?: string;
  }

  interface Session {
    user: {
      _id: string;
      username: string;
      firstname: string;
      lastname: string;
      isAuthProvider?: boolean;
      role: string;
      image?: string;
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
      isAuthProvider?: boolean;
      role: string;
      image?: string;
    };
    error?: "RefreshTokenError" | "TokenExpiredError";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Critical fix: Check if credentials exist and have the required fields
          if (!credentials || !credentials.username || !credentials.password) {
            console.error("Missing credentials");
            return null;
          }

          const result = SignInType.safeParse(credentials);
          if (!result.success) {
            console.error("Validation failed:", result.error.errors);
            return null;
          }

          const { username, password } = credentials as {
            username: string;
            password: string;
          };

          const user = await AuthService.authenticate(username, password);
          if (!user) return null;

          return {
            _id: user._id,
            username: user.email ?? user._id,
            firstname: user.firstname ?? "",
            lastname: user.lastname ?? "",
            isAuthProvider: user.isAuthProvider ?? "",
            role: user.role ?? "user",
            accessToken: user.accessToken,
            expiresAt: user.expiresAt,
            refreshToken: user.refreshToken,
            refreshTokenExpiresAt: user.refreshTokenExpiresAt,
          };
        } catch (err) {
          console.error("Authorization failed:", err);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
    signOut: "/sign-in",
    error: "/sign-in",
  },

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in
      if (account?.provider === "google") {
        try {
          if (!user.email) {
            console.error("Google user missing email");
            return false;
          }

          const nameParts = user.name?.split(" ") || [];
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          const googleUser = await AuthService.authenticateGoogle(
            user.email,
            firstName,
            lastName,
            user.id!,
            user.image || undefined
          );

          // Attach tokens to user object for jwt callback
          (user as any)._id = googleUser._id;
          (user as any).username = googleUser.email;
          (user as any).firstname = googleUser.firstname;
          (user as any).lastname = googleUser.lastname;
          ((user as any).isAuthProvider = googleUser.isAuthProvider),
            ((user as any).role = googleUser.role);
          (user as any).accessToken = googleUser.accessToken;
          (user as any).refreshToken = googleUser.refreshToken;
          (user as any).refreshTokenExpiresAt =
            googleUser.refreshTokenExpiresAt;
          (user as any).expiresAt = googleUser.expiresAt;
          (user as any).image = googleUser.image;

          return true;
        } catch (error) {
          console.log("Google sign-in failed:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === "object" &&
                error !== null &&
                "message" in error
              ? (error as any).message
              : "Google sign-in failed";
          return `/sign-in?error=${errorMessage}`;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // First-time login (both Google and Credentials)
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
            isAuthProvider: (user as any).isAuthProvider,
            role: (user as any).role,
            image: (user as any).image,
          },
        };
      }

      // Access token still valid
      if (
        typeof token.expiresAt === "number" &&
        Date.now() < token.expiresAt - 5 * 60 * 1000
      ) {
        return token;
      }

      // Access token expired → try refresh
      if (!token.refreshToken) {
        token.error = "RefreshTokenError";
        return token;
      }

      if (
        typeof token.refreshTokenExpiresAt === "number" &&
        Date.now() > token.refreshTokenExpiresAt
      ) {
        token.error = "RefreshTokenError";
        return token;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/auth/refresh`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.refreshToken}`,
            },
          }
        );

        const data = await response.json();

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
      session.error =
        token.error === "RefreshTokenError" ||
        token.error === "TokenExpiredError"
          ? token.error
          : undefined;
      session.user = (token.user as any) ?? {};
      session.accessToken = (token.accessToken as string) ?? "";
      session.expiresAt = (token.expiresAt as number) ?? 0;
      session.refreshToken = token.refreshToken as string | undefined;
      session.refreshTokenExpiresAt = token.refreshTokenExpiresAt as
        | number
        | undefined;

      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  events: {
    async signOut() {
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

  debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET,
});

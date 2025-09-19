import NextAuth, { Session, JWT } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { z } from "zod";

const SignInType = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

class AuthService {
  private static baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  private static refreshTokenName =
    process.env.REFRESH_TOKEN_NAME || "refreshToken";

  // Helper method to decode JWT using Buffer and get expiration
  private static getTokenExpiration(token: string): number {
    try {
      // Split the JWT into parts
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed for base64 decoding
      const paddedPayload =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);

      // Decode from base64url to buffer, then to string
      const decodedBuffer = Buffer.from(
        paddedPayload.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      );
      const decodedPayload = JSON.parse(decodedBuffer.toString("utf8"));

      // JWT exp is in seconds, convert to milliseconds
      return (decodedPayload.exp || 0) * 1000;
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      // Fallback: assume token expires in 1 hour
      return Date.now() + 60 * 60 * 1000;
    }
  }

  static async authenticate(username: string, password: string) {
    const response = await fetch(`${this.baseUrl}/v1/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(errorData);
      throw new Error(
        errorData.msg || `Authentication failed: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(data, "user data from backend");

    // Decode the access token to get expiration
    const expiresAt = this.getTokenExpiration(data.accessToken);

    return {
      _id: data.user._id,
      email: data.user.username,
      firstname: data.user.firstName,
      lastname: data.user.lastName,
      accessToken: data.accessToken,
      expiresAt,
    };
  }

  static async refresh(): Promise<{
    accessToken: string;
    expiresAt: number;
    user?: {
      _id?: string;
      id?: string;
      username?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      firstname?: string;
      lastname?: string;
    };
  } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.log("Refresh failed with status:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("Refresh response:", data);

      // Decode the new access token to get expiration
      const expiresAt = this.getTokenExpiration(data.accessToken);

      return {
        accessToken: data.accessToken,
        expiresAt,
        user: data.user,
      };
    } catch (error) {
      console.error("Refresh token request failed:", error);
      return null;
    }
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
  }

  interface JWT {
    accessToken: string;
    expiresAt: number;
    user: {
      id: string;
      username: string;
      firstname: string;
      lastname: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input with Zod
          const result = SignInType.safeParse(credentials);
          if (!result.success) {
            const errorMessage = result.error.errors
              .map((err) => err.message)
              .join(", ");
            throw new Error(errorMessage);
          }

          const { username, password } = result.data;
          const user = await AuthService.authenticate(username, password);

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
          };
        } catch (error) {
          if (error instanceof Error) {
            console.log(error.message, " from auth");
            throw new Error(error.message);
          } else {
            console.log("Unknown error from auth");
            throw new Error("Invalid credentials");
          }
        }
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - initial sign-in:", user);
        return {
          accessToken: user.accessToken,
          expiresAt: user.expiresAt,
          user: {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
          },
        };
      }

      // Add buffer time (5 minutes) before attempting refresh
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      const shouldRefresh =
        typeof token.expiresAt === "number" &&
        Date.now() >= token.expiresAt - bufferTime;

      if (!shouldRefresh) {
        console.log("JWT callback - token still valid");
        return token;
      }

      console.log("JWT callback - attempting refresh");
      const refreshed = await AuthService.refresh();

      if (!refreshed) {
        console.log("JWT callback - refresh failed");
        // Return null to force re-authentication
        return null;
      }

      console.log("JWT callback - refresh successful:", refreshed);
      return {
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
        user: {
          id: refreshed.user?._id || refreshed.user?.id,
          username: refreshed.user?.username || refreshed.user?.email,
          firstname: refreshed.user?.firstName || refreshed.user?.firstname,
          lastname: refreshed.user?.lastName || refreshed.user?.lastname,
        },
      };
    },

    async session({ session, token }): Promise<Session> {
      // console.log("Session callback - token:", token);

      if (
        !token ||
        !token?.accessToken ||
        typeof token.accessToken !== "string"
      ) {
        console.log("Invalid token, returning minimal session");
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
          expires: new Date(0).toISOString(), // Set to epoch to force expiry
        };
      }

      // Check if token is expired
      if (
        typeof token.expiresAt === "number" &&
        Date.now() >= token.expiresAt
      ) {
        console.log("Token expired, returning expired session");
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
          expires: new Date(0).toISOString(), // Set to epoch to force expiry
        };
      }

      return {
        ...session,
        user: {
          _id:
            (token.user &&
            typeof token.user === "object" &&
            token.user !== null &&
            "id" in token.user
              ? (token.user as any).id
              : "") || "",
          username:
            (token.user &&
            typeof token.user === "object" &&
            token.user !== null &&
            "username" in token.user
              ? (token.user as any).username
              : "") || "",
          firstname:
            (token.user &&
            typeof token.user === "object" &&
            token.user !== null &&
            "firstname" in token.user
              ? (token.user as any).firstname
              : "") || "",
          lastname:
            (token.user &&
            typeof token.user === "object" &&
            token.user !== null &&
            "lastname" in token.user
              ? (token.user as any).lastname
              : "") || "",
        },
        accessToken: token.accessToken,
        expiresAt: typeof token.expiresAt === "number" ? token.expiresAt : 0,
        expires: session.expires,
      };
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days to match your refresh token lifetime
  },

  events: {
    async signOut() {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout request failed:", error);
        // Don't throw error as sign out should complete locally even if backend fails
      }
    },
  },
});

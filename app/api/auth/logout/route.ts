import { NextResponse } from "next/server";
import { AuthCache } from "@/libs/redis";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?._id;
  const sessionId = session?.sessionId;

  // Clear Redis cache for this user
  if (sessionId) {
    await AuthCache.clearAuthResult(sessionId);
    console.log(`Cleared Redis cache for sessionId: ${sessionId}`);
  }
  if (userId) {
    await AuthCache.clearUserCache(userId);
    console.log(`Cleared Redis cache for userId: ${userId}`);
  }

  const backendResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/logout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: backendResponse.status }
  );

  const cookieHeader = backendResponse.headers.get("set-cookie");
  if (cookieHeader) {
    cookieHeader.split(/,(?=\s*\w+\s*=)/).forEach((cookie) => {
      const [nameValue] = cookie.split(";");
      const [name] = nameValue.split("=");
      if (name) {
        response.cookies.set(name.trim(), "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: new Date(0),
        });
      }
    });
  }

  // Clear NextAuth session cookie
  response.cookies.set("authjs.session-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  // Clear the auth-sync cookie
  response.cookies.set("auth-sync", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  console.log("Cleared all authentication cookies");

  return response;
}

import { NextResponse } from "next/server";
import { AuthCache } from "@/libs/redis";
import { v4 as uuidv4 } from "uuid";
import { AuthService } from "@/auth";
import { encodeAuthSyncCookie, signData } from "@/libs/signAuth";

export async function POST(request: Request) {
  const body = await request.json();
  const sessionId = uuidv4();
  const backendResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }
  );

  const result = await backendResponse.json();

  await AuthCache.setAuthResult(
    sessionId,
    {
      ...result,
      status: backendResponse.status,
    },
    30
  );

  const response = NextResponse.json(
    { ...result, sessionId },
    { status: backendResponse.status }
  );

  // Forward cookies from backend
  const cookieHeader = backendResponse.headers.get("set-cookie");
  if (cookieHeader) {
    cookieHeader.split(/,(?=\s*\w+\s*=)/).forEach((cookie) => {
      const [nameValue] = cookie.split(";");
      const [name, value] = nameValue.split("=");
      if (name && value) {
        response.cookies.set(name.trim(), value.trim(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
      }
    });

    // Forward the original set-cookie header
    response.headers.set("set-cookie", cookieHeader);
  }

  // Set signed auth-sync cookie
  if (backendResponse.ok && result.accessToken) {

    const syncData = {
      userId: result.user._id || result.user.id,
      email: result.user.email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days to match refresh token
    };

    // Create signature
    const signedCookie = encodeAuthSyncCookie(syncData);

    // Set client-accessible signed sync cookie
    response.cookies.set("auth-sync", encodeURIComponent(signedCookie), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    console.log(`Set signed auth-sync cookie for user: ${result.user.email}`);
  }

  return response;
}

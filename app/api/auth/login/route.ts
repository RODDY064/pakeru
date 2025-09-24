import { NextResponse } from "next/server";
import { AuthCache } from "@/libs/redis";
import { v4 as uuidv4 } from "uuid";
import { AuthService } from "@/auth";

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

  await AuthCache.setAuthResult(sessionId, {
    ...result,
    status: backendResponse.status,
  }, 30); // Use 30-second TTL

  const response = NextResponse.json({ ...result, sessionId }, {
    status: backendResponse.status,
  });

  const cookieHeader = backendResponse.headers.get("set-cookie");
  if (cookieHeader) {
    cookieHeader
      .split(/,(?=\s*\w+\s*=)/)
      .forEach((cookie) => {
        const [nameValue] = cookie.split(";");
        const [name, value] = nameValue.split("=");

        if (name && value) {
          response.cookies.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(AuthService.getTokenExpiration(result.accessToken)),
          });
        }
      });
  }

  return response;
}
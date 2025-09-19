// app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const Refresh_Token_Name = process.env.NEXT_PUBLIC_REFRESH_TOKEN_NAME || "";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(Refresh_Token_Name)?.value;
    
    console.log(`Refresh token exists: ${!!refreshToken}`);
    console.log(`Cookie name: ${Refresh_Token_Name}`);
    
    if (!refreshToken) {
      console.log("No refresh token found in cookies");
      return NextResponse.json(
        { error: "Refresh token required", code: "NO_REFRESH_TOKEN" },
        { status: 401 }
      );
    }

    console.log(`Calling backend refresh with token: ${refreshToken.substring(0, 20)}...`);

    // CRITICAL: Send refresh token to backend
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/refresh`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
           Cookie: `${Refresh_Token_Name}=${refreshToken}`
        },

        body: JSON.stringify({
          refreshToken: refreshToken
        })
      }
    );

    const data = await backendRes.json();
  

    if (!backendRes.ok) {
      console.log("Backend refresh failed:", data);
      return NextResponse.json(
        {
          error: data.error || "Refresh failed",
          code: data.code || "REFRESH_FAILED",
        },
        { status: backendRes.status }
      );
    }

    if (!data.accessToken) {
      console.log("Backend didn't return access token");
      return NextResponse.json(
        { error: "Invalid refresh response", code: "NO_ACCESS_TOKEN" },
        { status: 500 }
      );
    }

    console.log("Successfully refreshed access token");

    if (data.refreshToken && data.refreshToken !== refreshToken) {
      console.log("Updating refresh token cookie");
      cookieStore.set(Refresh_Token_Name, data.refreshToken, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: data.refreshTokenExpiresAt ? new Date(data.refreshTokenExpiresAt) : undefined
      });
    }

    return NextResponse.json({
      accessToken: data.accessToken,
      user: data.user,
      expiresAt: data.expiresAt || (Date.now() + (data.expiresIn ? data.expiresIn * 1000 : 15 * 60 * 1000)),
      expiresIn: data.expiresIn,
    });

  } catch (error: any) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
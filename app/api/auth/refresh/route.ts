// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    let refreshToken: string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      refreshToken = authHeader.substring(7).trim();
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (refreshToken) {
      headers["Cookie"] = `${
        process.env.REFRESH_TOKEN_NAME ?? "refresh_token"
      }=${refreshToken}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/refresh`,
      {
        method: "GET",
        headers,
        credentials: "include",
      }
    );

    const data = await response.json();
    // console.log("Backend refresh response:", response.status, data.msg);
    const nextResponse = NextResponse.json(data, { status: response.status });

    return nextResponse;
  } catch (error) {
    console.error("Refresh API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Incoming cookies:", request.headers.get("cookie"));

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/refresh`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("cookie") && {
            Cookie: request.headers.get("cookie")!,
          }),
        },
      }
    );

    const data = await response.json();
    console.log("Backend refresh response:", response.status, data.msg);
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

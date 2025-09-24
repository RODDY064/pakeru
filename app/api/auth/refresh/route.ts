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
    console.log("Backend refresh response:", response.status, data);
    const nextResponse = NextResponse.json(data, { status: response.status });

    const cookieHeader = response.headers.get("set-cookie");

    // console.log(cookieHeader, 'cookie')


    if (cookieHeader) {
      cookieHeader.split(/,(?=\s*\w+\s*=)/).forEach((cookie) => {
        const [nameValue, ...attributes] = cookie.split(";");
        const [name, value] = nameValue.split("=");
        if (name && value) {
          nextResponse.cookies.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        }
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Refresh API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

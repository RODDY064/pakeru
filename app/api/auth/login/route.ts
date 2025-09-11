import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward to backend (no need for credentials: "include" here)
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await backendResponse.json();

    const response = NextResponse.json(result, {
      status: backendResponse.status,
    });

    // Forward cookies properly
    const setCookieHeader = backendResponse.headers.get("set-cookie");
    if (setCookieHeader) {
      // Handle multiple cookies if backend sets more than one
      setCookieHeader.split(",").forEach((cookie) => {
        const [cookieName, ...rest] = cookie.trim().split("=");
        const cookieValue = rest.join("=").split(";")[0];
        response.cookies.set(cookieName, cookieValue, {
          httpOnly: true,
          secure: true,
          path: "/",
        });
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { message: "Proxy error", error: err.message },
      { status: 500 }
    );
  }
}

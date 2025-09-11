import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward request to backend
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
      {
        method: "POST",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await backendResponse.json();

    console.log(result,'response')

    // Build response with same status
    const response = NextResponse.json(result, {
      status: backendResponse.status,
    });

    // Forward the Set-Cookie header from backend
    const setCookieHeader = backendResponse.headers.get("set-cookie");
    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { message: "Proxy error", error: err.message },
      { status: 500 }
    );
  }
}

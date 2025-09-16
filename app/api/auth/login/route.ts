import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const result = await backendResponse.json();
    const response = NextResponse.json(result, {
      status: backendResponse.status,
    });

    // cookie forwarding - handle Set-Cookie properly
    const cookieHeader = backendResponse.headers.get("set-cookie");
    if (cookieHeader) {
      // Parse and set cookies with appropriate settings for localhost
      const cookies = cookieHeader.split(/,(?=\s*\w+\s*=)/).map(c => c.trim());
      
      for (const cookie of cookies) {
        const [nameValue, ...attributes] = cookie.split(";");
        const [name, value] = nameValue.split("=");
        
        if (name && value) {
          response.cookies.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        }
      }
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: "Authentication failed", error: error.message },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cookies } from "next/headers";

// Token extraction utility
async function extractTokenFromRequest(
  request: NextRequest
): Promise<string | undefined> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // Fallback to cookie (for server-side requests)
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("accessToken");
  return tokenCookie?.value || undefined;
}

// Clean header forwarding
function getForwardHeaders(
  request: NextRequest,
  token?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // Add authentication if token available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const safeHeaders = ["user-agent", "accept-language", "x-forwarded-for"];
  safeHeaders.forEach((headerName) => {
    const value = request.headers.get(headerName);
    if (value) headers[headerName] = value;
  });
  return headers;
}

export async function POST(req: NextRequest) {
  try {
    const token = await extractTokenFromRequest(req);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/change-password`;
    const backendResponse = await fetch(url, {
      method: "POST",
      headers: getForwardHeaders(req, token),
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await backendResponse.json();
    console.log(data, 'backend data');
    console.log(backendResponse.status);

    if (!backendResponse.ok) {
      if (data.msg === "Current password is incorrect") {
        return NextResponse.json(data, { status: 500 });
      }
    
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
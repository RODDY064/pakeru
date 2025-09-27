import { NextResponse } from "next/server";
import { AuthCache } from "@/libs/redis";
import { v4 as uuidv4 } from "uuid";

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
      signal: AbortSignal.timeout(30000),
    }
  );

  const result = await backendResponse.json();
  
  await AuthCache.setAuthResult(sessionId, {
    ...result,
    status: backendResponse.status,
  }, 30);

  const response = NextResponse.json(
    { ...result, sessionId }, 
    { status: backendResponse.status }
  );

  const cookieHeader = backendResponse.headers.get("set-cookie");
  if (cookieHeader) {
    response.headers.set("set-cookie", cookieHeader);
  }

  return response;
}
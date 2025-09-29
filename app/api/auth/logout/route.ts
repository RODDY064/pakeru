import { NextResponse } from "next/server";
import { AuthCache } from "@/libs/redis";
import { auth } from "@/auth";

export async function POST(request: Request) {

  const backendResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/logout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: backendResponse.status }
  );
  return response;
}

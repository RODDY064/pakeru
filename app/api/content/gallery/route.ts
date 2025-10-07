import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const authorization = request.headers.get("authorization");
    
    let body;
    let headers: HeadersInit = {};

    if (authorization) {
      headers["Authorization"] = authorization;
    }

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = JSON.stringify(await request.json());
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${BACKEND_URL}/v1/landing-page/gallery`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const data = await response.json();

    console.log(response,'response')

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to create gallery content" },
        { status: response.status }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating gallery content:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
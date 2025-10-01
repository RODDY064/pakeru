// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function extractToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

// Helper function to prepare headers
function getForwardHeaders(
  request: NextRequest,
  token?: string | null
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const safeHeaders = [
    "user-agent",
    "accept-language",
    "x-forwarded-for",
    "x-real-ip",
  ];
  safeHeaders.forEach((headerName) => {
    const value = request.headers.get(headerName);
    if (value) headers[headerName] = value;
  });

  return headers;
}

async function handleBackendResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    // console.error(`Backend error ${response.status}:`, data);
  }

  return { data, status: response.status };
}

export async function GET(request: NextRequest) {
  try {
    const url = `${BASE_URL}/v1/categories`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const { data, status } = await handleBackendResponse(response);

    return NextResponse.json(data, {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    // console.error("Categories GET error:", error);

    return NextResponse.json(
      {
        error: "Categories fetch failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!BASE_URL) {
      // console.error("NEXT_PUBLIC_BASE_URL not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Extract and validate token
    const token = await extractToken(request);
    if (!token) {
      return NextResponse.json(
        {
          error: "Authorization required",
          message: "Bearer token missing or invalid",
          code: "TOKEN_REQUIRED",
        },
        { status: 401 }
      );
    }

    // Parse request body (FormData for file upload)
    let formData;
    try {
      formData = await request.formData();
      // console.log("Category POST FormData received");
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid form data in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    const name = formData.get("name");
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const url = `${BASE_URL}/v1/categories`;


    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const safeHeaders = ["user-agent", "x-forwarded-for", "x-real-ip"];
    safeHeaders.forEach((headerName) => {
      const value = request.headers.get(headerName);
      if (value) headers[headerName] = value;
    });

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",
    });

    const { data, status } = await handleBackendResponse(response);

    if (response.ok) {
      console.log("Category created successfully");
    }

    return NextResponse.json(data, {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("Categories POST error:", error);

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout - please try again" },
        { status: 408 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Category creation failed",
        message: error.message || "Unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}


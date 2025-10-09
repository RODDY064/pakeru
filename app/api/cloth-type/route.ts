import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const CLOTH_TYPES_ENDPOINT = `${BASE_URL}/v1/cloth-types`;

function handleApiError(error: any, operation: string) {
  console.error(`${operation} failed:`, error);
  return NextResponse.json(
    {
      error: `${operation} failed`,
      message: error.message || "An unexpected error occurred",
    },
    { status: 500 }
  );
}

async function forwardResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    return NextResponse.json(
      {
        error: "API error",
        message: errorData.message || errorText,
      },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function GET(request: NextRequest) {
  try {
  
    const url = CLOTH_TYPES_ENDPOINT

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    return forwardResponse(response);
  } catch (error: any) {
    return handleApiError(error, "Cloth type fetch");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Copy relevant headers
    const headers: Record<string, string> = {
      "Content-Type": request.headers.get("content-type") || "application/json",
    };

    // Copy authorization header if present
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    console.log("Creating cloth type...");

    const response = await fetch(CLOTH_TYPES_ENDPOINT, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    return forwardResponse(response);
  } catch (error: any) {
    return handleApiError(error, "Cloth type creation");
  }
}


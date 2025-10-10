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
    console.error("API error:", errorText);

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const body = await request.text();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing cloth type ID" },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": request.headers.get("content-type") || "application/json",
    };

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    console.log(`Updating cloth type ${id}...`);

    const response = await fetch(`${CLOTH_TYPES_ENDPOINT}/${id}`, {
      method: "PATCH",
      headers,
      body,
      cache: "no-store",
    });

    // console.log("Response status",response);

    return forwardResponse(response);
  } catch (error: any) {
    return handleApiError(error, "Cloth type update");
  }
}

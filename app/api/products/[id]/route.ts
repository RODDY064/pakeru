import { NextRequest, NextResponse } from "next/server";

// Headers that should never be forwarded to avoid conflicts
const EXCLUDED_HEADERS = new Set([
  "content-length",
  "content-encoding",
  "transfer-encoding",
  "host",
  "connection",
  "upgrade",
  "expect",
]);

function buildForwardHeaders(request: NextRequest): Record<string, string> {
  const forwardHeaders: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!EXCLUDED_HEADERS.has(lowerKey)) {
      forwardHeaders[key] = value;
    }
  });

  return forwardHeaders;
}

async function makeApiRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: BodyInit
) {
  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  
  return NextResponse.json(data, { status: response.status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Product fetch failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const forwardHeaders = buildForwardHeaders(request);

    return await makeApiRequest(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products/${id}`,
      "DELETE",
      forwardHeaders,
      JSON.stringify(body)
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Product deletion failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formData = await request.formData();
    const { id } = await params;

    const forwardHeaders = buildForwardHeaders(request);
    return await makeApiRequest(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products/${id}`,
      "PATCH",
      forwardHeaders,
      formData
    );
  } catch (error: any) {
    console.error("PATCH request failed:", error);
    return NextResponse.json(
      { error: "Product update failed", message: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; 
export const revalidate = 0; 


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

  forwardHeaders["cache-control"] = "no-store, no-cache, must-revalidate";
  forwardHeaders["pragma"] = "no-cache";
  forwardHeaders["expires"] = "0";

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
    cache: "no-store", // ✅ prevents fetch from caching
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // ✅ return non-cacheable response
  return NextResponse.json(data, {
    status: response.status,
    headers: {
      "cache-control": "no-store, no-cache, must-revalidate",
      pragma: "no-cache",
      expires: "0",
    },
  });
}

// ---------------------------
// GET PRODUCT
// ---------------------------
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
        headers: { "Content-Type": "application/json" },
        cache: "no-store", // ✅ no caching here either
      }
    );

    let data: any;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
        pragma: "no-cache",
        expires: "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Product fetch failed", message: error.message },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}

// ---------------------------
// DELETE PRODUCT
// ---------------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const forwardHeaders = buildForwardHeaders(request);

    let body: BodyInit | undefined;
    const contentLength = request.headers.get("content-length");
    const contentType = request.headers.get("content-type");

    if (
      contentLength &&
      parseInt(contentLength) > 0 &&
      contentType?.includes("application/json")
    ) {
      try {
        const jsonBody = await request.json();
        body = JSON.stringify(jsonBody);
      } catch (error) {
        console.warn("Failed to parse JSON body:", error);
      }
    }

    return await makeApiRequest(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products/${id}`,
      "DELETE",
      forwardHeaders,
      body
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Product deletion failed", message: error.message },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}

// ---------------------------
// PATCH PRODUCT
// ---------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";
    const forwardHeaders = buildForwardHeaders(request);

    let body: BodyInit | undefined;

    if (contentType.includes("application/json")) {
      body = JSON.stringify(await request.json());
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const form = new FormData();
      for (const [key, value] of formData.entries()) {
        form.append(key, value);
      }
      body = form;
    } else {
      body = await request.text();
    }

    return await makeApiRequest(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products/${id}`,
      "PATCH",
      forwardHeaders,
      body
    );
  } catch (error: any) {
    console.error("PATCH request failed:", error);
    return NextResponse.json(
      { error: "Product update failed", message: error.message },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}

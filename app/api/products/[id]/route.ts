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
  const cacheBustUrl = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
  
  const response = await fetch(cacheBustUrl, {
    method,
    headers,
    body,
    cache: "no-store",
    next: { revalidate: 0 },
  });

  let data: any;
  const contentType = response.headers.get("content-type");
  
  // Check if response has content and is JSON
  if (contentType && contentType.includes("application/json")) {
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      console.error("JSON parse error:", error);
      data = { error: "Failed to parse response" };
    }
  } else {
    const text = await response.text();
    data = text ? { message: text } : { success: true };
  }

  return NextResponse.json(data, {
    status: response.status,
    headers: {
      "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "pragma": "no-cache",
      "expires": "0",
      "surrogate-control": "no-store",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products/${id}?_t=${Date.now()}`,
      {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("API error:", data);
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: response.status }
      );
    }


    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "pragma": "no-cache",
        "expires": "0",
        "surrogate-control": "no-store",
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

    return await makeApiRequest(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/products/${id}`,"DELETE", forwardHeaders);
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Product deletion failed", message: error.message },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    let body: BodyInit | undefined;
    let headers: Record<string, string> = {};

    if (contentType.includes("application/json")) {
      const forwardHeaders = buildForwardHeaders(request);
      body = JSON.stringify(await request.json());
      headers = { ...forwardHeaders, "content-type": "application/json" };
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      
      // Create a new FormData with proper handling
      const form = new FormData();
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Convert File to Blob with proper metadata
          const buffer = await value.arrayBuffer();
          const blob = new Blob([buffer], { type: value.type });
          form.append(key, blob, value.name);
        } else {
          form.append(key, value);
        }
      }
      
      body = form as any;
      request.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!EXCLUDED_HEADERS.has(lowerKey) && lowerKey !== "content-type") {
          headers[key] = value;
        }
      });
      
      headers["cache-control"] = "no-store, no-cache, must-revalidate";
      headers["pragma"] = "no-cache";
      headers["expires"] = "0";
      
    } else {
      const forwardHeaders = buildForwardHeaders(request);
      body = await request.text();
      headers = forwardHeaders;
    }

    console.log(body)

    const cacheBustUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products/${id}`;

    const response = await fetch(cacheBustUrl, {
      method: "PATCH",
      headers,
      body,
      cache: "no-store",
      next: { revalidate: 0 },
    });

    let data: any;
    const responseContentType = response.headers.get("content-type");
    
    if (responseContentType && responseContentType.includes("application/json")) {
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "pragma": "no-cache",
        "expires": "0",
        "surrogate-control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("PATCH request failed:", error);
    return NextResponse.json(
      { error: "Product update failed", message: error.message },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}
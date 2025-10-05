import { NextRequest, NextResponse } from "next/server";

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

  console.log(body)

  const response = await fetch(url, {
    method,
    headers,
    body,
    cache:"no-store"
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return NextResponse.json(data, { status: response.status });
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";
    const forwardHeaders = buildForwardHeaders(request);
    let body: BodyInit | undefined;
    const contentLength = request.headers.get("content-length");
    
    if (contentLength && parseInt(contentLength) > 0 &&
       contentType.includes("application/json")
    ) {
      try {
        const jsonBody = await request.json();
        console.log(jsonBody,'json body')
        body = JSON.stringify(jsonBody);
      } catch (error) {
        console.warn("Failed to parse JSON body, proceeding without body:",error);
        body = undefined;
      }
    } else if (contentLength && parseInt(contentLength) > 0) {
      try {
        body = await request.text();
      } catch (error) {
        console.warn("Failed to read request body:", error);
        body = undefined;
      }
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
      { error: "Cloth type update failed", message: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; 
export const revalidate = 0;        


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryString = searchParams.toString();
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
      cache: "no-store",
      next: { revalidate: 0}
    });

    const data = await response.json();

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Products fetch failed", message: error.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

// --- CREATE PRODUCT ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const targetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products`;

    // Filter unsafe headers
    const incomingHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      const excluded = [
        "content-length",
        "content-encoding",
        "transfer-encoding",
        "host",
        "connection",
        "upgrade",
        "expect",
      ];
      if (!excluded.includes(key.toLowerCase())) {
        incomingHeaders[key] = value;
      }
    });

    // Clone FormData safely
    const newFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      newFormData.append(key, value);
    }

    delete incomingHeaders["content-type"];

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        ...incomingHeaders,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
      body: newFormData,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "External API error", message: errorText },
        {
          status: response.status,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const data = await response.json();

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Product creation failed",
        message: error.message,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

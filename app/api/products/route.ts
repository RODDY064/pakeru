import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Forward query parameters
    const queryString = searchParams.toString();
    console.log(queryString);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Products fetch failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const targetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products`;

    // Create headers object but exclude problematic headers
    const incomingHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Exclude headers that should not be forwarded
      const excludedHeaders = [
        "content-length",
        "content-encoding",
        "transfer-encoding",
        "host",
        "connection",
        "upgrade",
        "expect",
      ];

      if (!excludedHeaders.includes(key.toLowerCase())) {
        incomingHeaders[key] = value;
      }
    });

    // Recreate FormData to avoid corruption
    const newFormData = new FormData();

    // Copy all fields from original FormData
    for (const [key, value] of formData.entries()) {
      console.log(`FormData entry: ${key} =`, value);
      newFormData.append(key, value);
    }

    // Remove content-type header to let fetch set the correct boundary
    delete incomingHeaders["content-type"];

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: incomingHeaders,
      body: newFormData,
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      return NextResponse.json(
        { error: "External API error", message: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Full error object:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error cause:", error.cause);
    console.error("Error stack:", error.stack);

    let errorMessage = error.message;
    // if (error.cause) {
    //   errorMessage += ` (Cause: ${error.cause.message || error.cause})`;
    // }

    return NextResponse.json(
      {
        error: "Product creation failed",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

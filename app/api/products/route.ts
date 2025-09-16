import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const { searchParams } = new URL(request.url);
    
    // Forward query parameters
    const queryString = searchParams.toString();
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
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
    const cookieHeader = request.headers.get("cookie");
     const formData = await request.formData();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/products`, {
      method: "POST",
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Product creation failed", message: error.message },
      { status: 500 }
    );
  }
}
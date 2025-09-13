import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieHeader = request.headers.get("cookie");
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/products/${params.id}`, {
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
      { error: "Product fetch failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/products/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Product update failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/products/${params.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Product partial update failed", message: error.message },
      { status: 500 }
    );
  }
}


// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieHeader = request.headers.get("cookie");
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/orders/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    const data = await response.json();

     console.log(data,'order')
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Order fetch failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const body = await request.json();

    console.log('hello it being hit')

    
     const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/orders/${params.id}`;

    console.log(url, 'url'); 
    
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log(data, "patch data");
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Order status update failed", message: error.message },
      { status: 500 }
    );
  }
}




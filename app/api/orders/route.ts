
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const { searchParams } = new URL(request.url);
    
    const queryString = searchParams.toString();
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    const data = await response.json();
    // console.log(data,'orders')
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Orders fetch failed", message: error.message },
      { status: 500 }
    );
  }
}


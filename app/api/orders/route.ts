import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryString = searchParams.toString();
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/orders${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: { 
         "Content-Type": "application/json",

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/v1/orders`,
      {
        method: "POST",
         
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    
    console.log(error)
    return NextResponse.json(
      { error: "Order failed to place", message: error.message },
      { status: 500 }
    );
  }
}

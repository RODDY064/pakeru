import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
     const incomingHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      incomingHeaders[key] = value;
    });

    const response = await fetch(`${BASE_URL}/v1/orders/${id}`, {
      method: "GET",
      headers: incomingHeaders,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Order fetch failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const incomingHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      incomingHeaders[key] = value;
    });

    const response = await fetch(`${BASE_URL}/v1/orders/${id}`, {
      method: "PATCH",
      headers: incomingHeaders,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Order update failed", message: error.message },
      { status: 500 }
    );
  }
}

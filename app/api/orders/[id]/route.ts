import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function createHeaders(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  return {
    'Content-Type': 'application/json',
    ...(cookieHeader && { Cookie: cookieHeader }),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(
      `${BASE_URL}/v1/orders/${id}`,
      {
        method: 'GET',
        headers: createHeaders(request),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Order fetch failed', message: error.message },
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
    const response = await fetch(
      `${BASE_URL}/v1/orders/${id}`,
      {
        method: 'PATCH',
        headers: createHeaders(request),
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Order update failed', message: error.message },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function extractTokenFromRequest(request: NextRequest): Promise<string | undefined> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Fallback to cookie (for server-side requests)
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('accessToken');
  return tokenCookie?.value || undefined;
}

// Clean header forwarding 
function getForwardHeaders(request: NextRequest, token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authentication if token available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }


  const safeHeaders = ['user-agent', 'accept-language', 'x-forwarded-for'];
  safeHeaders.forEach(headerName => {
    const value = request.headers.get(headerName);
    if (value) headers[headerName] = value;
  });

  return headers;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await extractTokenFromRequest(request);

  
    console.log(getForwardHeaders(request,token))

    const response = await fetch(`${BASE_URL}/v1/orders/${id}`, {
      method: "GET",
      headers: getForwardHeaders(request, token),
    });

    const data = await response.json();

 

    return NextResponse.json(data.data, { status: response.status });
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

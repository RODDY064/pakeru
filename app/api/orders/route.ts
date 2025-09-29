import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Token extraction utility
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
    'ngrok-skip-browser-warning':'true'
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

function createErrorResponse(message: string, statusCode = 500, details?: any) {
  return NextResponse.json(
    { 
      success: false,
      error: message,
      ...(details && { details })
    },
    { status: statusCode }
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = await extractTokenFromRequest(request);
    
    // Build URL with query parameters
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return createErrorResponse('Server configuration error', 500);
    }

    const queryString = searchParams.toString();
    const url = `${baseUrl}/v1/orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getForwardHeaders(request, token),
      cache:"no-store"
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to fetch orders',
          code: errorData.code
        },
        { status: response.status }
      );
    }

  

    const data = await response.json();


    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('Orders GET failed:', error);
    return createErrorResponse(
      'Orders fetch failed', 
      500, process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = await extractTokenFromRequest(request);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return createErrorResponse('Server configuration error', 500);
    }

    const response = await fetch(`${baseUrl}/v1/orders`, {
      method: 'POST',
      headers: getForwardHeaders(request, token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific authentication errors
      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
            code: 'TOKEN_REQUIRED'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to create order',
          code: errorData.code
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('Orders POST failed:', error);
    return createErrorResponse(
      'Order creation failed',
      500,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
}
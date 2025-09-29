// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const queryString = searchParams.toString();
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/categories${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Categories fetch failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract authorization header - middleware should have validated this
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authorization header missing or invalid',
          code: 'TOKEN_REQUIRED'
        },
        { status: 401 }
      );
    }

    // Forward all relevant headers to backend
    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    };

    // Add other important headers if present
    const userAgent = request.headers.get('user-agent');
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    if (userAgent) forwardHeaders['User-Agent'] = userAgent;
    if (clientIP) forwardHeaders['X-Forwarded-For'] = clientIP;

    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log(`Forwarding order request to: ${backendUrl}/v1/orders`);

    const response = await fetch(`${backendUrl}/v1/orders`, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Log response for debugging
    if (!response.ok) {
      console.error(`Backend responded with ${response.status}:`, data);
    } else {
      console.log('Order created successfully:', data.orderId || 'ID not provided');
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('Orders API route error:', error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - please try again' },
        { status: 408 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Order processing failed',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
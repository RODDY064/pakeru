// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const body = await request.json();
     const { id } = await params;
    
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/categories/${id}`;
    
    const response = await fetch(url, {
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
      { error: "Category update failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const cookieHeader = request.headers.get("cookie");
      const { categoryId } = await params;
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/categories/${categoryId}`;
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Category deletion failed", message: error.message },
      { status: 500 }
    );
  }
}
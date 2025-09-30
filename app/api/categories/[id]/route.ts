// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id:categoryId } = await params;
    console.log(categoryId)
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/categories/${categoryId}`;

    const incomingHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      incomingHeaders[key] = value;
    });

    const response = await fetch(url, {
      method: "DELETE",
      headers: incomingHeaders,
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

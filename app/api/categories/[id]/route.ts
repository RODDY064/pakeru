import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    const formData = await request.formData();
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/categories/${categoryId}`;



    const incomingHeaders: Record<string, string> = {};
    const allowedHeaders = ["authorization", "cookie"];
    request.headers.forEach((value, key) => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        incomingHeaders[key] = value;
      }
    });

    const response = await fetch(url, {
      method: "PATCH",
      headers: incomingHeaders,
      body: formData,
      cache:"no-store"
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

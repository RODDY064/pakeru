import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    
    const contentType = request.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");
    
    // Parse body based on content type
    const body = isFormData 
      ? await request.formData()
      : await request.json();
    
    console.log(isFormData ? "FormData received" : body);
    
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/categories/${categoryId}`;
    
    const incomingHeaders: Record<string, string> = {};
    const allowedHeaders = isFormData 
      ? ["authorization", "cookie"]
      : ["authorization", "cookie", "content-type"];
    
    request.headers.forEach((value, key) => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        incomingHeaders[key] = value;
      }
    });

    const fetchOptions: RequestInit = {
      method: "PATCH",
      headers: isFormData ? incomingHeaders : {
        ...incomingHeaders,
        "Content-Type": "application/json",
      },
      body: isFormData ? body : JSON.stringify(body),
      cache: "no-store",
    };

    const response = await fetch(url, fetchOptions);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Category update failed", message: error.message },
      { status: 500 }
    );
  }
}
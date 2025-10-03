import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const authorization = request.headers.get("authorization");
    
    let body;
    let headers: HeadersInit = {};

    if (authorization) {
      headers["Authorization"] = authorization;
    }

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = JSON.stringify(await request.json());
      headers["Content-Type"] = "application/json";
    }
    
    const { id } =  await params;

    // console.log(body,'body')

    const response = await fetch(`${BACKEND_URL}/v1/landing-page/gallery/${id}`, {
      method: "PATCH",
      headers,
      body,
      cache:"no-store"
    });



    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to update gallery content" },
        { status: response.status }
      );
    }

    // console.log(data)

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
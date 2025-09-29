import { NextRequest, NextResponse } from "next/server";


export async function GET(
  request: NextRequest,
) {
    try {
  
       return NextResponse.json({});
     } catch (error: any) {
       return NextResponse.json(
         { error: "Order fetch failed", message: error.message },
         { status: 500 }
       );
     }
}
import { NextResponse } from "next/server";
import { AuthCache } from "@/libs/redis";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const body = await request.json();
  const sessionId = uuidv4();

  const backendResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }
  );

  const result = await backendResponse.json();

  console.log(result)

  const cookieHeader = backendResponse.headers.get("set-cookie");

  const response = NextResponse.json(
    { ...result  },
    { status: backendResponse.status }
  );



  if (cookieHeader) {
    cookieHeader.split(/,(?=\s*\w+\s*=)/).forEach((cookie) => {
      const parts = cookie.split(";");
      const [name, value] = parts[0].split("=");

      if (name && value) {
        const cookieOptions: Parameters<typeof response.cookies.set>[2] = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        };

        const expiresPart = parts.find((p) =>
          p.trim().toLowerCase().startsWith("expires=")
        );
        if (expiresPart) {
          const expiresDate = new Date(expiresPart.split("=")[1].trim());
          if (!isNaN(expiresDate.getTime())) {
            cookieOptions.expires = expiresDate;
          }
        }

        const maxAgePart = parts.find((p) =>
          p.trim().toLowerCase().startsWith("max-age=")
        );
        if (maxAgePart) {
          const maxAgeSeconds = parseInt(maxAgePart.split("=")[1].trim(), 10);
          if (!isNaN(maxAgeSeconds)) {
            cookieOptions.maxAge = maxAgeSeconds;
          }
        }

        response.cookies.set(name.trim(), value.trim(), cookieOptions);
      }
    });

    response.headers.set("set-cookie", cookieHeader);
  }

  return response;
}

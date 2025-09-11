import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Enhanced debugging
  // console.log("=== MIDDLEWARE DEBUG ===");
  // console.log("Request URL:", request.url);
  // console.log("Pathname:", pathname);
  // console.log("Request headers:", Object.fromEntries(request.headers));
  console.log("All cookies:", request.cookies.getAll());
  console.log("Token cookie:", token);
  console.log("Cookie header:", request.headers.get('cookie'));
  console.log("========================");

  // Define route categories
  const protectedRoutes = ["/payment", "/account"];
  const publicRoutes = ["/sign-in", "/sign-up", "/"];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !token) {
    console.log("Redirecting to sign-in: no token for protected route");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect authenticated users from auth pages
  if (token && pathname === "/sign-in") {
    console.log("Redirecting to home: authenticated user on sign-in page");
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
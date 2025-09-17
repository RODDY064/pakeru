// import { NextResponse, NextRequest } from "next/server";

// // Routes
// const ROUTES = {
//   protected: ["/account", "/admin","/payment"],
//   public: ["/", "/collections", "/products", "/blog", "/about"],
//   auth: ["/sign-up", "/forgot-password", "/reset-password"],
//   api: ["/api", "/sign-in"],
// } as const;

// // Security Headers
// const SECURITY_HEADERS = {
//   "Content-Security-Policy":
//     "default-src 'self'; " +
//     "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.thepakeru.com; " +
//     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
//     "font-src 'self' https://fonts.gstatic.com; " +
//     "img-src 'self' data: https://*.thepakeru.com https://images.unsplash.com; " +
//     "connect-src 'self' https://api.thepakeru.com; " +
//     "frame-ancestors 'none';",
//   "X-Frame-Options": "DENY",
//   "X-Content-Type-Options": "nosniff",
//   "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
//   "X-XSS-Protection": "1; mode=block",
//   "Referrer-Policy": "strict-origin-when-cross-origin",
//   "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
// } as const;

// // -------------------- HELPERS --------------------
// function getClientIP(request: NextRequest): string {
//   return (
//     request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
//     request.headers.get("x-real-ip") ||
//     request.headers.get("cf-connecting-ip") ||
//     "unknown"
//   );
// }

// function isBot(userAgent: string): boolean {
//   return /googlebot|bingbot|yahoobot|slurp|duckduckbot|baiduspider|facebookexternalhit/i.test(
//     userAgent
//   );
// }

// function matchesRoutes(pathname: string, routes: readonly string[]): boolean {
//   return routes.some((route) => pathname.startsWith(route));
// }

// function getRouteType(pathname: string): keyof typeof rateLimiters {
//   if (matchesRoutes(pathname, ROUTES.auth)) return "auth";
//   if (matchesRoutes(pathname, ROUTES.api)) return "api";
//   return "general";
// }

// // Simplified token validation for refresh tokens (from cookies)
// async function validateRefreshToken(token: string | undefined): Promise<boolean> {
//   if (!token) return false;

//   try {
//     const parts = token.split(".");
//     if (parts.length !== 3) return false;

//     const [, payloadBase64] = parts;
//     if (!payloadBase64) return false;

//     const payload = JSON.parse(
//       Buffer.from(payloadBase64, "base64").toString("utf-8")
//     );

//     if (!payload.exp || typeof payload.exp !== "number") return false;

//     // Check expiration with 30s buffer
//     return Date.now() < payload.exp * 1000 - 30000;
//   } catch {
//     return false;
//   }
// }

// // Validate access token from Authorization header
// async function validateAccessToken(authHeader: string | null): Promise<boolean> {
//   if (!authHeader?.startsWith("Bearer ")) return false;

//   const token = authHeader.substring(7);
//   return validateRefreshToken(token); // Same validation logic
// }

// function createRedirectResponse(url: string, pathname: string): NextResponse {
//   const redirectUrl = new URL("/sign-in", url);
//   redirectUrl.searchParams.set("from", pathname);
//   return NextResponse.redirect(redirectUrl);
// }

// function applySecurityHeaders(response: NextResponse): NextResponse {
//   Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
//     response.headers.set(key, value);
//   });
//   return response;
// }

// // -------------------- MEMORY RATE LIMITER --------------------
// const memoryStore = new Map<string, { count: number; resetTime: number }>();

// function createMemoryLimiter(points: number, duration: number) {
//   return {
//     async consume(key: string) {
//       const now = Date.now();
//       const entry =
//         memoryStore.get(key) || { count: 0, resetTime: now + duration * 1000 };

//       if (now > entry.resetTime) {
//         entry.count = 0;
//         entry.resetTime = now + duration * 1000;
//       }

//       if (entry.count >= points) {
//         const msBeforeNext = entry.resetTime - now;
//         const err = new Error("Rate limit exceeded") as any;
//         err.remainingPoints = 0;
//         err.msBeforeNext = msBeforeNext;
//         throw err;
//       }

//       entry.count++;
//       memoryStore.set(key, entry);
//     },
//   };
// }

// const rateLimiters = {
//   auth: createMemoryLimiter(10, 15 * 60), // 10 req / 15min
//   api: createMemoryLimiter(100, 15 * 60), // 100 req / 15min
//   general: createMemoryLimiter(200, 15 * 60), // 200 req / 15min
// } as const;

// async function handleRateLimit(
//   ip: string,
//   routeType: keyof typeof rateLimiters
// ): Promise<NextResponse | null> {
//   try {
//     const limiter = rateLimiters[routeType];
//     await limiter.consume(ip);
//     return null;
//   } catch (err) {
//     const e = err as any;
//     const msBeforeNext = e?.msBeforeNext || 60000;
//     const remainingPoints = e?.remainingPoints || 0;

//     console.warn(
//       `Rate limit exceeded - IP: ${ip}, Route: ${String(
//         routeType
//       )}, Retry in: ${Math.round(msBeforeNext / 1000)}s`
//     );

//     const response = NextResponse.json(
//       {
//         error: "Too many requests",
//         retryAfter: Math.round(msBeforeNext / 1000),
//         remaining: remainingPoints,
//       },
//       { status: 429 }
//     );

//     response.headers.set(
//       "Retry-After",
//       Math.round(msBeforeNext / 1000).toString()
//     );
//     return response;
//   }
// }

// function validateCSRF(
//   request: NextRequest,
//   ip: string,
//   pathname: string
// ): NextResponse | null {
//   if (request.method === "GET" || request.method === "OPTIONS") return null;

//   const csrfToken = request.headers.get("X-CSRF-Token");
//   const sessionCsrfToken = request.cookies.get("csrf_token")?.value;

//   if (!csrfToken || csrfToken !== sessionCsrfToken) {
//     console.warn(
//       `CSRF validation failed - ${request.method} ${pathname}, IP: ${ip}`
//     );
//     return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
//   }

//   return null;
// }

// // -------------------- MAIN MIDDLEWARE --------------------
// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const refreshToken = request.cookies.get("refreshToken")?.value;
//   const authHeader = request.headers.get("authorization");
//   const ip = getClientIP(request);
//   const userAgent = request?.headers?.get("user-agent") || "";

//   const isProtected = matchesRoutes(pathname, ROUTES.protected);
//   const isPublic = matchesRoutes(pathname, ROUTES.public);
//   const isAuth = matchesRoutes(pathname, ROUTES.auth);
//   const isAPI = matchesRoutes(pathname, ROUTES.api);

//   // Allow bots on public pages
//   if (isBot(userAgent) && isPublic) {
//     return applySecurityHeaders(NextResponse.next());
//   }

//   // Rate limiting
//   const routeType = getRouteType(pathname);
//   const rateLimitResponse = await handleRateLimit(ip, routeType);
//   if (rateLimitResponse) return applySecurityHeaders(rateLimitResponse);

//   // CSRF for protected routes
//   if (isProtected) {
//     const csrfResponse = validateCSRF(request, ip, pathname);
//     if (csrfResponse) return applySecurityHeaders(csrfResponse);
//   }

//   // Authentication logic
//   const hasValidAccessToken = await validateAccessToken(authHeader);
//   const hasValidRefreshToken = await validateRefreshToken(refreshToken);

//   // Protected routes: require valid session (refresh token in cookie)
//   if (isProtected) {
//     if (!hasValidRefreshToken) {
//       console.warn(`No valid session - Path: ${pathname}, IP: ${ip}`);
//       return applySecurityHeaders(createRedirectResponse(request.url, pathname));
//     }
//     // For protected routes, we rely on the client-side token management
//     // The middleware only verifies the session exists via refresh token
//     return applySecurityHeaders(NextResponse.next());
//   }

//   // API routes: require valid access token OR valid refresh token for /auth/refresh
//   if (isAPI && !isPublic) {
//     // Allow /auth/refresh with valid refresh token
//     if (pathname === "/auth/refresh" && hasValidRefreshToken) {
//       return applySecurityHeaders(NextResponse.next());
//     }
    
//     // Other API routes need valid access token
//     if (!hasValidAccessToken) {
//       return applySecurityHeaders(
//         NextResponse.json(
//           { 
//             error: "Authentication required",
//             code: "TOKEN_REQUIRED" 
//           }, 
//           { status: 401 }
//         )
//       );
//     }
//     return applySecurityHeaders(NextResponse.next());
//   }

//   // Auth routes: redirect if already authenticated
//   if (isAuth && hasValidRefreshToken) {
//     const redirectTo = request.nextUrl.searchParams.get("from") || "/";
//     return applySecurityHeaders(
//       NextResponse.redirect(new URL(redirectTo, request.url))
//     );
//   }

//   return applySecurityHeaders(NextResponse.next());
// }

// // -------------------- MATCHER --------------------
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|.*\\.(?:jpg|jpeg|png|gif|svg|ico|css|js|woff2?|ttf|eot)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };


import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  console.log(token, "token")

  // Route definitions - clear and maintainable
  const protectedRoutes = ["/payment", "/account"];
  const authRoutes = ["/sign-in", "/sign-up"];
  
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Clean logic flow
  if (isProtected && !token) {
    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
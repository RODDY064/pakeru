// middleware.ts
import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROUTES = {
  protected: ["/account", "/admin", "/payment"],
  public: ["/", "/collections", "/products", "/blog", "/about"],
  auth: ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"],
  api: ["/api"],
} as const;

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function isBot(userAgent: string): boolean {
  return /googlebot|bingbot|yahoobot|slurp|duckduckbot|baiduspider|facebookexternalhit/i.test(
    userAgent
  );
}

function matchesRoutes(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

function getRouteType(pathname: string): keyof typeof rateLimiters {
  if (matchesRoutes(pathname, ROUTES.auth)) return "auth";
  if (matchesRoutes(pathname, ROUTES.api)) return "api";
  return "general";
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

function createMemoryLimiter(points: number, duration: number) {
  return {
    async consume(key: string): Promise<void> {
      const now = Date.now();
      const entry = memoryStore.get(key) || {
        count: 0,
        resetTime: now + duration * 1000,
      };

      if (now > entry.resetTime) {
        entry.count = 0;
        entry.resetTime = now + duration * 1000;
      }

      if (entry.count >= points) {
        const msBeforeNext = entry.resetTime - now;
        const error = new Error("Rate limit exceeded") as any;
        error.remainingPoints = 0;
        error.msBeforeNext = msBeforeNext;
        throw error;
      }

      entry.count++;
      memoryStore.set(key, entry);
    },
  };
}

const rateLimiters = {
  auth: createMemoryLimiter(500, 15 * 60), // 500 requests per 15 minutes
  api: createMemoryLimiter(5000, 15 * 60), // 5,000 requests per 15 minutes
  general: createMemoryLimiter(3000, 15 * 60), // 3,000 requests per 15 minutes
} as const;

async function handleRateLimit(
  ip: string,
  routeType: keyof typeof rateLimiters,
  userAgent?: string
): Promise<NextResponse | null> {
  if (userAgent && isBot(userAgent)) {
    return null;
  }

  try {
    const limiter = rateLimiters[routeType];
    await limiter.consume(ip);
    return null;
  } catch (err: any) {
    const msBeforeNext = err?.msBeforeNext || 60000;
    const remainingPoints = err?.remainingPoints || 0;

    console.warn(
      `Rate limit exceeded - IP: ${ip}, Route: ${routeType}, Retry in: ${Math.round(
        msBeforeNext / 1000
      )}s`
    );

    const response = NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: Math.round(msBeforeNext / 1000),
        remaining: remainingPoints,
      },
      { status: 429 }
    );

    response.headers.set(
      "Retry-After",
      Math.round(msBeforeNext / 1000).toString()
    );

    return response;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";

  const isMobile = /Mobi|iPhone|iPod|Android(?!.*Tablet)/i.test(userAgent);

  // Apply rate limiting first
  const routeType = getRouteType(pathname);
  const rateLimitResponse = await handleRateLimit(ip, routeType, userAgent);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (pathname.startsWith("/admin") && isMobile) {
    return new NextResponse(
      "<h1  style='font-family:sans-serif;text-align:center;margin-top:50%;text-wrap:balance;max-width:600px;margin-left:auto;margin-right:auto;'>Admin is only accessible from tablet or desktop</h1>",
      { headers: { "Content-Type": "text/html" }, status: 403 }
    );
  }

  // Get the session
  const session = await auth();

  // Check if the current path is a protected route
  const isProtectedRoute = ROUTES.protected.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = ROUTES.auth.some((route) => pathname.startsWith(route));

  // Handle protected routes
  if (isProtectedRoute) {
   // No session - redirect to sign-in
    if (!session) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Session exists but token is expired
    if (session.expiresAt && Date.now() >= session.expiresAt) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      signInUrl.searchParams.set("error", "SessionExpired");
      // return NextResponse.redirect(signInUrl);
    }

    // Valid session - allow access
    return NextResponse.next();
  }

  // Handle auth routes when user is already authenticated
  if (isAuthRoute && session && session.accessToken) {
    // User is authenticated and trying to access auth routes like sign-in
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    // Redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};

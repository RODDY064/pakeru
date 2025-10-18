import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { RateLimiterMemory } from "rate-limiter-flexible";

export const ROUTES = {
  protected: ["/payment", "/admin", "/account", "/checkout", "/orders"],
  public: ["/", "/collections", "/products", "/blog", "/about"],
  auth: ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"],
  api: ["/api"],
};

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
  auth: createMemoryLimiter(500, 15 * 60),
  api: createMemoryLimiter(5000, 15 * 60),
  general: createMemoryLimiter(3000, 15 * 60),
} as const;

function getClientIP(req: NextRequest) {
  return req.headers.get("x-forwarded-for") || "unknown";
}

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

const authAttempts = new Map();

export default auth(async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const ip = getClientIP(req);
  const userAgent = req.headers.get("user-agent") || "";
  const isMobile = /Mobi|iPhone|iPod|Android(?!.*Tablet)/i.test(userAgent);

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const routeType = getRouteType(pathname);
  const rateLimitResponse = await handleRateLimit(ip, routeType, userAgent);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (pathname.startsWith("/admin") && isMobile) {
    return new NextResponse(
      "<h1 style='font-family:sans-serif;text-align:center;margin-top:20%;text-wrap:balance;margin-left:auto;margin-right:auto;'>Admin is only accessible from tablet or desktop</h1>",
      { headers: { "Content-Type": "text/html" }, status: 403 }
    );
  }

  const session = await auth();

  const isProtectedRoute = ROUTES.protected.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = ROUTES.auth.some((route) => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith("/admin");

  // If authenticated user tries to access auth routes, redirect them
  if (isAuthRoute && session) {
    console.log("Redirecting authenticated user away from auth route");
    
    // Check for both 'from' and 'callbackUrl' parameters
    const from = req.nextUrl.searchParams.get("from");
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const redirectUrl = from || callbackUrl;
    
    if (redirectUrl) {
      try {
        const decodedUrl = decodeURIComponent(redirectUrl);
        return NextResponse.redirect(new URL(decodedUrl, req.url));
      } catch (error) {
        console.error("Invalid redirect URL:", redirectUrl);
      }
    }
    
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If unauthenticated user tries to access protected routes
  if (isProtectedRoute && !session) {
    console.log("Redirecting unauthenticated user to sign-in");
    
    const url = new URL("/sign-in", req.url);
    
    // Capture the full path they were trying to access (pathname + query params)
    const fullPath = pathname + search;
    
    // Only add 'from' parameter if it's not the sign-in page itself
    if (fullPath !== "/sign-in") {
      url.searchParams.set("from", encodeURIComponent(fullPath));
    }
    
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute && isAdminRoute) {
    const userRole = session?.user?.role;
    console.log("Admin route access - User role:", userRole, "Path:", pathname);

    if (userRole !== "admin") {
      return new NextResponse(
        "<h1 style='font-family:sans-serif;text-align:center;margin-top:50%;text-wrap:balance;max-width:600px;margin-left:auto;margin-right:auto;'>Access denied. Admin privileges required.</h1>",
        { headers: { "Content-Type": "text/html" }, status: 403 }
      );
    }
  }
  if (isProtectedRoute && session) {
    authAttempts.delete(ip);
    console.log("Access granted to protected route:", pathname);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
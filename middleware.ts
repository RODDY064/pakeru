
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
  auth: createMemoryLimiter(500, 15 * 60),
  api: createMemoryLimiter(5000, 15 * 60),
  general: createMemoryLimiter(3000, 15 * 60),
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

// FIXED: Enhanced session validation that properly checks for user identity
function isValidSession(session: any): boolean {
  console.log("Validating session:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    hasAccessToken: !!session?.accessToken,
    hasError: !!session?.error,
    userId: session?.user?._id,
    username: session?.user?.username,
    expiresAt: session?.expiresAt,
    currentTime: Date.now(),
  });

  // Basic session structure check
  if (!session?.user || !session.accessToken) {
    console.log(" Missing session or access token");
    return false;
  }

  // Check for errors (like TokenExpiredError)
  if (session.error) {
    console.log("Session has error:", session.error);
    return false;
  }

  // FIXED: Check for user identity - accept either _id OR username
  const hasUserId = !!(session.user._id || session.user.username);
  if (!hasUserId) {
    console.log(" No user identifier found");
    return false;
  }

  // Check token expiry
  if (session.expiresAt) {
    const BUFFER_MS = 2 * 60 * 1000; // 2 minute buffer (reduced from 5)
    const isExpired = Date.now() >= session.expiresAt - BUFFER_MS;
    if (isExpired) {
      const minutesUntilExpiry = Math.round((session.expiresAt - Date.now()) / 1000 / 60);
      console.log(`Session token will expire in ${minutesUntilExpiry} minutes (within buffer)`);
      return false;
    }
  } else if (session.accessToken) {
    // Fallback: decode token to check expiry
    try {
      const payload = JSON.parse(atob(session.accessToken.split('.')[1]));
      const expTime = payload.exp * 1000;
      const BUFFER_MS = 2 * 60 * 1000;
      const isExpired = Date.now() >= expTime - BUFFER_MS;
      if (isExpired) {
        console.log("Session token expired (decoded) in middleware");
        return false;
      }
    } catch (error) {
      console.warn("Could not decode token in middleware, but allowing access");
      // Don't fail validation just because we can't decode - token might be valid
    }
  }

  console.log("Session is valid");
  return true;
}

// Check if this looks like a refresh attempt in progress
function isRefreshInProgress(request: NextRequest): boolean {
  const referer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent") || "";
 
  return (
    request.headers.has("x-nextjs-data") || // Next.js data request
    userAgent.includes("next-auth") || // NextAuth internal request
    (!!referer && new URL(referer).pathname === request.nextUrl.pathname) 
  );
}

// REDUCED: Grace period for auth operations
const AUTH_GRACE_PERIOD = 10 * 1000; // Reduced to 10 seconds
const authAttempts = new Map<string, number>();

function shouldGrantAuthGrace(ip: string): boolean {
  const lastAttempt = authAttempts.get(ip);
  if (!lastAttempt) return false;
  
  const gracePeriodActive = Date.now() - lastAttempt < AUTH_GRACE_PERIOD;
  if (gracePeriodActive) {
    console.log(`Granting ${Math.round((AUTH_GRACE_PERIOD - (Date.now() - lastAttempt)) / 1000)}s grace period for IP: ${ip}`);
  }
  return gracePeriodActive;
}

function recordAuthAttempt(ip: string): void {
  authAttempts.set(ip, Date.now());
  console.log(`📝 Recorded auth attempt for IP: ${ip}`);
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

  // Block mobile access to admin
  if (pathname.startsWith("/admin") && isMobile) {
    return new NextResponse(
      "<h1 style='font-family:sans-serif;text-align:center;margin-top:20%;text-wrap:balance;margin-left:auto;margin-right:auto;'>Admin is only accessible from tablet or desktop</h1>",
      { headers: { "Content-Type": "text/html" }, status: 403 }
    );
  }

  // Get session
  const session = await auth();
  
  // Check route types
  const isProtectedRoute = ROUTES.protected.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = ROUTES.auth.some((route) => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith("/admin");

  // Handle auth routes - redirect if already authenticated
  if (isAuthRoute && isValidSession(session)) {
    console.log("Redirecting authenticated user away from auth route");
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Handle protected routes with reduced grace period
  if (isProtectedRoute) {
    const hasValidSession = isValidSession(session);
    
    if (!hasValidSession) {
      // Check if we should grant grace period (might be in middle of refresh)
      const inGracePeriod = shouldGrantAuthGrace(ip);
      const possibleRefresh = isRefreshInProgress(request);
      
      // REDUCED: Be more strict about when to allow grace period
      if (inGracePeriod && possibleRefresh) {
        console.log("Granting auth grace period for potential refresh:", pathname);
        return NextResponse.next();
      }
      
      // Record this auth attempt
      recordAuthAttempt(ip);
      
      console.log("No valid session for protected route:", pathname);
      
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      
      // Check if this is a fetch request (likely from client-side)
      const acceptHeader = request.headers.get("accept");
      if (acceptHeader && acceptHeader.includes("application/json")) {
        return NextResponse.json(
          { error: "Authentication required", redirectUrl: signInUrl.toString() },
          { status: 401 }
        );
      }
      
      return NextResponse.redirect(signInUrl);
    }

    // Admin route protection
    if (isAdminRoute) {
      const userRole = session?.user?.role;
      console.log("Admin route access - User role:", userRole, "Path:", pathname);
      
      if (userRole !== "admin") {
        return new NextResponse(
          "<h1 style='font-family:sans-serif;text-align:center;margin-top:50%;text-wrap:balance;max-width:600px;margin-left:auto;margin-right:auto;'>Access denied. Admin privileges required.</h1>",
          { headers: { "Content-Type": "text/html" }, status: 403 }
        );
      }
    }

    // Clear any auth grace period on successful access
    authAttempts.delete(ip);
    console.log("Access granted to protected route:", pathname);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeAuthSyncCookie } from "./libs/signAuth";


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

// Check if auto-login is currently in progress
function isAutoLoginInProgress(request: NextRequest): boolean {
  const autoLoginCookie = request.cookies.get("auto-login-in-progress");
  return !!autoLoginCookie?.value;
}

// Helper function for signed cookie decoding in middleware
function decodeMiddlewareAuthSync(signedCookie: string): any | null {
  try {
    // Use your existing decoding function
    return decodeAuthSyncCookie(signedCookie);
  } catch (err) {
    console.error("Error decoding auth-sync cookie in middleware:", err);
    return null;
  }
}

// Enhanced auth sync cookie validation with proper signed cookie support
function hasValidAuthSyncCookie(request: NextRequest): boolean {
  const authSyncCookie = request.cookies.get("auth-sync");
  if (!authSyncCookie?.value) return false;
  
  try {
    // Try to decode using your signed cookie format
    const syncData = decodeMiddlewareAuthSync(authSyncCookie.value);
    
    if (!syncData) {
      console.log("Could not decode auth-sync cookie in middleware");
      return false;
    }
    
    // Check if cookie has expired
    if (syncData?.exp && Date.now() > syncData.exp) {
      console.log("Auth-sync cookie expired");
      return false;
    }
    
    console.log("Auth-sync cookie is valid, expires:", new Date(syncData?.exp || 0).toISOString());
    return true;
  } catch (error) {
    console.warn("Error validating auth-sync cookie:", error);
    return false;
  }
}

// Enhanced network error detection for middleware
function isMiddlewareNetworkError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = error.toString().toLowerCase();
  
  return (
    error.name === 'TypeError' ||
    error.name === 'NetworkError' ||
    error.name === 'AbortError' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT' ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('aborted') ||
    errorString.includes('failed to fetch') ||
    errorString.includes('network error') ||
    errorString.includes('connection refused') ||
    errorString.includes('timeout')
  );
}

// Enhanced middleware refresh with retry logic and exponential backoff
async function attemptMiddlewareRefresh(request: NextRequest): Promise<{ success: boolean; redirectResponse?: NextResponse; shouldRetry?: boolean }> {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 500; // Start with 500ms
  const MAX_DELAY = 5000; // Max 5 seconds (middleware has time constraints)
  const TIMEOUT_MS = 8000; // 8 second timeout per attempt
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Middleware: Refresh attempt ${attempt}/${MAX_RETRIES}`);
      
      // Build the refresh URL
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      
      try {
        // Make the refresh call with timeout and retry headers
        const refreshResponse = await fetch(refreshUrl.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("cookie") || "",
            "User-Agent": request.headers.get("user-agent") || "",
            "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
            "X-Retry-Attempt": attempt.toString(),
            "Cache-Control": "no-cache",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle HTTP status codes
        if (!refreshResponse.ok) {
          if (refreshResponse.status === 401 || refreshResponse.status === 403) {
            console.log("Middleware: Refresh token expired/invalid, removing auth-sync cookie");
            const response = NextResponse.next();
            response.cookies.delete("auth-sync");
            return { success: false, redirectResponse: response };
          }
          
          // Server errors (5xx) are retryable
          if (refreshResponse.status >= 500 && attempt < MAX_RETRIES) {
            const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), MAX_DELAY);
            console.warn(`Middleware: Server error ${refreshResponse.status}, retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Client errors (4xx except 401/403) are not retryable
          console.warn("Middleware: Non-retryable error:", refreshResponse.status, refreshResponse.statusText);
          return { success: false, shouldRetry: false };
        }

        // Parse response
        const refreshData = await refreshResponse.json();
        
        if (!refreshData.accessToken || !refreshData.user) {
          console.error("Middleware: Invalid refresh response structure");
          
          // Invalid response structure might be temporary, retry
          if (attempt < MAX_RETRIES) {
            const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), MAX_DELAY);
            console.log(`Middleware: Invalid response, retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          return { success: false };
        }

        console.log("Middleware: Refresh successful on attempt", attempt);
        
       
        
        // Create response with auto-signin data
        const response = NextResponse.next();
        
        const autoSigninData = {
          user: refreshData.user,
          accessToken: refreshData.accessToken,
          timestamp: Date.now(),
          attempt: attempt, // Track which attempt succeeded
        };
        
        // Set temporary cookies for client
        response.cookies.set("auto-signin-data", JSON.stringify(autoSigninData), {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 90, // 90 seconds (slightly longer for retry scenarios)
          path: "/",
        });
        
        response.cookies.set("middleware-refresh-success", "true", {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 90, // 90 seconds
          path: "/",
        });

        return { success: true, redirectResponse: response };

      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
    } catch (error) {
      const isNetworkError = isMiddlewareNetworkError(error);
      const isLastAttempt = attempt === MAX_RETRIES;
      
      console.warn(
        `Middleware: Refresh attempt ${attempt} failed:`,
        typeof error === "object" && error !== null && "message" in error
          ? (error as any).message
          : String(error)
      );
      
      // Only retry network errors
      if (isNetworkError && !isLastAttempt) {
        const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), MAX_DELAY);
        const jitter = Math.random() * 0.1 * delay; // Add jitter
        const totalDelay = delay + jitter;
        
        console.log(`Middleware: Network error, retrying in ${Math.round(totalDelay)}ms (attempt ${attempt}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
        continue;
      }
      
      // Non-network errors or max retries reached
      if (isLastAttempt) {
        console.error(`Middleware: All ${MAX_RETRIES} refresh attempts failed`);
      } else {
        if (typeof error === "object" && error !== null && "message" in error) {
          console.error(`Middleware: Non-retryable error:`, (error as any).message);
        } else {
          console.error(`Middleware: Non-retryable error:`, error);
        }
      }
      
      return { 
        success: false, 
        shouldRetry: isNetworkError && !isLastAttempt 
      };
    }
  }
  
  // This should never be reached, but just in case
  return { success: false };
}

// Enhanced session validation
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
    console.log("Missing session or access token");
    return false;
  }

  // Check for errors (like TokenExpiredError)
  if (session.error) {
    console.log("Session has error:", session.error);
    return false;
  }

  // Check for user identity - accept either _id OR username
  const hasUserId = !!(session.user._id || session.user.username || session.user.id);
  if (!hasUserId) {
    console.log("No user identifier found");
    return false;
  }

  // Check token expiry with reduced buffer for middleware
  if (session.expiresAt) {
    const BUFFER_MS = 2 * 60 * 1000; // 2 minute buffer for middleware
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

// Auth grace period for operations
const AUTH_GRACE_PERIOD = 20 * 1000; // 20 seconds (increased for middleware refresh)
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
  console.log(`Recorded auth attempt for IP: ${ip}`);
}

// Enhanced tracking for middleware refresh attempts with retry logic
const middlewareRefreshAttempts = new Map<string, { 
  lastAttempt: number; 
  consecutiveFailures: number;
  totalAttempts: number;
}>(); 

// Enhanced middleware refresh attempt tracking
function canAttemptMiddlewareRefresh(ip: string): boolean {
  const attempts = middlewareRefreshAttempts.get(ip);
  if (!attempts) return true;
  
  const now = Date.now();
  const timeSinceLastAttempt = now - attempts.lastAttempt;
  
  // Base cooldown period that increases with consecutive failures
  const baseCooldown = 15 * 1000; // 15 seconds base
  const failurePenalty = Math.min(attempts.consecutiveFailures * 10 * 1000, 60 * 1000); // Up to 60s penalty
  const totalCooldown = baseCooldown + failurePenalty;
  
  const canRefresh = timeSinceLastAttempt > totalCooldown;
  
  if (!canRefresh) {
    const remainingCooldown = Math.round((totalCooldown - timeSinceLastAttempt) / 1000);
    console.log(`Middleware refresh cooldown active for IP: ${ip}, remaining: ${remainingCooldown}s (failures: ${attempts.consecutiveFailures})`);
  }
  
  return canRefresh;
}

function recordMiddlewareRefresh(ip: string, success: boolean): void {
  const now = Date.now();
  const attempts = middlewareRefreshAttempts.get(ip) || {
    lastAttempt: 0,
    consecutiveFailures: 0,
    totalAttempts: 0,
  };
  
  attempts.lastAttempt = now;
  attempts.totalAttempts++;
  
  if (success) {
    attempts.consecutiveFailures = 0; // Reset on success
    console.log(`Middleware refresh succeeded for IP: ${ip} (total attempts: ${attempts.totalAttempts})`);
  } else {
    attempts.consecutiveFailures++;
    console.log(`Middleware refresh failed for IP: ${ip} (consecutive failures: ${attempts.consecutiveFailures}, total attempts: ${attempts.totalAttempts})`);
  }
  
  middlewareRefreshAttempts.set(ip, attempts);
  
  // Clean up old entries (older than 1 hour)
  const oneHourAgo = now - (60 * 60 * 1000);
  for (const [key, value] of middlewareRefreshAttempts.entries()) {
    if (value.lastAttempt < oneHourAgo) {
      middlewareRefreshAttempts.delete(key);
    }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const isMobile = /Mobi|iPhone|iPod|Android(?!.*Tablet)/i.test(userAgent);

  // Skip middleware refresh for API routes to prevent loops
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

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

  // ENHANCED: Handle protected routes with middleware-level refresh
  if (isProtectedRoute) {
    const hasValidSession = isValidSession(session);
    const hasAuthSyncCookie = hasValidAuthSyncCookie(request);
    const autoLoginActive = isAutoLoginInProgress(request);
    
    if (!hasValidSession) {
      // CRITICAL: If auth-sync exists but no session, attempt middleware refresh with retry
      if (hasAuthSyncCookie && !autoLoginActive && canAttemptMiddlewareRefresh(ip)) {
        console.log("Middleware: Auth-sync present but no valid session - attempting refresh with retry logic");
        
        const refreshResult = await attemptMiddlewareRefresh(request);
        
        // Record the attempt result
        recordMiddlewareRefresh(ip, refreshResult.success);
        
        if (refreshResult.success && refreshResult.redirectResponse) {
          console.log("Middleware: Refresh successful after retry, allowing access with auto-signin data");

          
          return refreshResult.redirectResponse;
        } else if (refreshResult.redirectResponse) {
          // Refresh failed but we have a cleanup response (expired cookies)
          console.log("Middleware: Refresh failed after retry, cleaning up cookies");
          return refreshResult.redirectResponse;
        }
        
        // If refresh failed completely, check if we should retry later or give up
        if (!refreshResult.success) {
          const attempts = middlewareRefreshAttempts.get(ip);
          if (attempts && attempts.consecutiveFailures >= 3) {
            console.log("Middleware: Too many consecutive refresh failures, giving up for this session");
            // Remove auth-sync cookie to prevent further attempts
            const cleanupResponse = NextResponse.next();
            cleanupResponse.cookies.delete("auth-sync");
            return cleanupResponse;
          }
          
          console.log("Middleware: Refresh failed but will retry later, continuing with normal auth flow");
        }
      }
      
      // Check if auto-login is in progress
      if (autoLoginActive) {
        console.log("Auto-login in progress, allowing access:", pathname);
        return NextResponse.next();
      }
      
      // If user has auth sync cookie but no session, give them time for client-side auto-login
      if (hasAuthSyncCookie) {
        console.log("Auth sync cookie present but no session - allowing brief grace period for client auto-login:", pathname);
        recordAuthAttempt(ip);
        return NextResponse.next();
      }
      
      // Check if we should grant grace period (might be in middle of refresh)
      const inGracePeriod = shouldGrantAuthGrace(ip);
      const possibleRefresh = isRefreshInProgress(request);
      
      if (inGracePeriod && possibleRefresh) {
        console.log("Granting auth grace period for potential refresh:", pathname);
        return NextResponse.next();
      }
      
      // Record this auth attempt
      recordAuthAttempt(ip);
      
      console.log("No valid session for protected route:", pathname);
      
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      
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

    // Clear auth attempts on successful access
    authAttempts.delete(ip);
    console.log("Access granted to protected route:", pathname);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
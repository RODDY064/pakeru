

import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import Redis from "ioredis";
import type { RateLimiterRes } from "rate-limiter-flexible";

let RateLimiterRedis: any;
let redisClient: any;
let rateLimiters: any;

const JWT_SECRET_RAW = process.env.JWT_SECRET || "my-secrets";
const REDIS_URL_RAW = process.env.REDIS_URL || "redis://localhost:6379";


const isEdgeRuntime = typeof window === 'undefined' && process.env.NEXT_RUNTIME === 'edge';

if (!isEdgeRuntime) {

  const { RateLimiterRedis: RLR } = await import("rate-limiter-flexible");
  const Redis = await import("ioredis").then(mod => mod.default);
  RateLimiterRedis = RLR;
  
  // RedisManager singleton class for managing Redis connections
  class RedisManager {
    private static instance: any;

    private constructor() {}

    public static getInstance() {
      if (!RedisManager.instance) {
        RedisManager.instance = new Redis(REDIS_URL_RAW);
      }
      return RedisManager.instance;
    }
  }
  
  redisClient = RedisManager.getInstance();
  
  const createRateLimiter = (points: number, duration: number, blockDuration: number) =>
    new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "rate_limit",
      points,
      duration,
      blockDuration,
    });

  rateLimiters = {
    auth: createRateLimiter(5, 15 * 60, 10 * 60),
    api: createRateLimiter(100, 15 * 60, 60),
    general: createRateLimiter(200, 15 * 60, 60),
  } as const;
} else {
  // This uses a Map for per-IP tracking (resets on restart, but works in Edge)
  const memoryStore = new Map<string, { count: number; resetTime: number }>();
  
  const createMemoryLimiter = (points: number, duration: number) => {
    return {
      async consume(key: string) {
        const now = Date.now();
        const entry = memoryStore.get(key) || { count: 0, resetTime: now + duration * 1000 };
        
        if (now > entry.resetTime) {
          entry.count = 0;
          entry.resetTime = now + duration * 1000;
        }
        
        if (entry.count >= points) {
          const msBeforeNext = entry.resetTime - now;
          const err = new Error('Rate limit exceeded') as any;
          err.remainingPoints = 0;
          err.msBeforeNext = msBeforeNext;
          throw err;
        }
        
        entry.count++;
        memoryStore.set(key, entry);
      }
    };
  };
  
  rateLimiters = {
    auth: createMemoryLimiter(10, 15 * 60),
    api: createMemoryLimiter(100, 15 * 60),
    general: createMemoryLimiter(200, 15 * 60),
  } as const;
}


// Route configurations - centralized and clear
const ROUTES = {
  protected: [ "/account", "/dashboard"],
  public: ["/", "/collections", "/products", "/blog", "/about","/payment"],
  auth: [ "/sign-up", "/forgot-password", "/reset-password"],
  api: ["/api","/sign-in"],
} as const;

const SECURITY_HEADERS = {
  "Content-Security-Policy": 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.thepakeru.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https://*.thepakeru.com https://images.unsplash.com; " +
    "connect-src 'self' https://api.thepakeru.com; " +
    "frame-ancestors 'none';",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
} as const;

// Helper functions - single responsibility
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function isBot(userAgent: string): boolean {
  return /googlebot|bingbot|yahoobot|slurp|duckduckbot|baiduspider|facebookexternalhit/i.test(userAgent);
}

function matchesRoutes(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

function getRouteType(pathname: string): keyof typeof rateLimiters {
  if (matchesRoutes(pathname, ROUTES.auth)) return 'auth';
  if (matchesRoutes(pathname, ROUTES.api)) return 'api';
  return 'general';
}

async function validateToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  // console.log(token)

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET_RAW), {
      algorithms: ["HS256"],
    });

    // console.log(payload)


   // Check expiration with 30-second buffer for clock skew
    if (payload.exp && Date.now() >= (payload.exp * 1000 - 30000)) {
      return false;
    }

    return true;
  } catch (error) {
    // Log specific JWT errors for debugging (but don't expose details)
    if (error instanceof Error) {
      console.warn(`JWT validation failed: ${error.name}`);
    }
    return false;
  }
}

function createRedirectResponse(url: string, pathname: string): NextResponse {
  const redirectUrl = new URL("/sign-in", url);
  redirectUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(redirectUrl);
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

async function handleRateLimit(ip: string, routeType: keyof typeof rateLimiters): Promise<NextResponse | null> {
  try {
    const limiter = rateLimiters[routeType];
    await limiter.consume(ip);
    return null;
  } catch (err) {
    const rateLimiterRes = err as RateLimiterRes;
    const remainingPoints = rateLimiterRes?.remainingPoints || 0;
    const msBeforeNext = rateLimiterRes?.msBeforeNext || 60000;
    
    console.warn(`Rate limit exceeded - IP: ${ip}, Route: ${String(routeType)}, Retry in: ${Math.round(msBeforeNext / 1000)}s`);
    
    const response = NextResponse.json(
      { 
        error: "Too many requests", 
        retryAfter: Math.round(msBeforeNext / 1000),
        remaining: remainingPoints 
      }, 
      { status: 429 }
    );
    
    response.headers.set("Retry-After", Math.round(msBeforeNext / 1000).toString());
    return response;
  }
}

function validateCSRF(request: NextRequest, ip: string, pathname: string): NextResponse | null {
  // Skip CSRF for GET requests and OPTIONS (preflight)
  if (request.method === 'GET' || request.method === 'OPTIONS') return null;
  
  const csrfToken = request.headers.get("X-CSRF-Token");
  const sessionCsrfToken = request.cookies.get("csrf_token")?.value;

  if (!csrfToken || csrfToken !== sessionCsrfToken) {
    console.warn(`CSRF validation failed - ${request.method} ${pathname}, IP: ${ip}`);
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  return null;
}



export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // console.log(token)


  const ip = getClientIP(request);
  const userAgent = request?.headers?.get("user-agent") || "";

  // Route classification
  const isProtected = matchesRoutes(pathname, ROUTES.protected);
  const isPublic = matchesRoutes(pathname, ROUTES.public);
  const isAuth = matchesRoutes(pathname, ROUTES.auth);
  const isAPI = matchesRoutes(pathname, ROUTES.api);

  //Allow search engine crawlers and social media bots for public routes
  if (isBot(userAgent) && isPublic) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Rate limiting based on route type
  const routeType = getRouteType(pathname);
  const rateLimitResponse = await handleRateLimit(ip, routeType);
  if (rateLimitResponse) return applySecurityHeaders(rateLimitResponse);

  //CSRF protection for protected routes (uncomment when ready)
  if (isProtected) {
    const csrfResponse = validateCSRF(request, ip, pathname);
    if (csrfResponse) return applySecurityHeaders(csrfResponse);
  }

  // Authentication flow
  const isTokenValid = await validateToken(token);

  // Redirect unauthenticated users from protected routes
  if (isProtected && !isTokenValid) {
    if (!token) {
      return applySecurityHeaders(createRedirectResponse(request.url, pathname));
    }

    // Invalid/expired token - clear and redirect
    console.warn(`Token validation failed - Path: ${pathname}, IP: ${ip}`);
    const response = createRedirectResponse(request.url, pathname);
    response.cookies.set("token", "", { 
      expires: new Date(0), 
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    });
    return applySecurityHeaders(response);
  }

  // Block unauthenticated API access (except public endpoints)
  if (isAPI && !isPublic && !isTokenValid) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Authentication required" }, { status: 401 })
    );
  }

  // Redirect authenticated users away from auth routes
  if (isAuth && isTokenValid) {
    const redirectTo = request.nextUrl.searchParams.get("from") || "/";
    return applySecurityHeaders(NextResponse.redirect(new URL(redirectTo, request.url)));
  }

  // Apply security headers to all responses
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|.*\\.(?:jpg|jpeg|png|gif|svg|ico|css|js|woff2?|ttf|eot)).*)",
    "/(api|trpc)(.*)",
  ],
};




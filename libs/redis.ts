import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheEntry {
  data: any;
}

export class AuthCache {
  static async setAuthResult(sessionId: string, data: any, ttlSeconds: number = 30) {
    const entry: CacheEntry = { data };
    await redis.setex(`auth:${sessionId}`, ttlSeconds, JSON.stringify(entry));

    if (data.user?._id) {
      await redis.setex(`user-session:${data.user._id}`, ttlSeconds, sessionId);
    }
  }

  static async getAuthResult(sessionId: string): Promise<any | null> {
    const data = await redis.get(`auth:${sessionId}`);
    if (!data) return null;

    const entry: CacheEntry = data as CacheEntry;
    await redis.del(`auth:${sessionId}`);

    return entry.data;
  }

  static async clearAuthResult(sessionId: string) {
    await redis.del(`auth:${sessionId}`);
  }

  static async clearUserCache(userId: string) {
    const sessionId = await redis.get(`user-session:${userId}`);
    if (sessionId) {
      await redis.del(`auth:${sessionId}`);
      await redis.del(`user-session:${userId}`);
    }
  }
}
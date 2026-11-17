import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number;      // Max allowed requests per window
  keyPrefix?: string;
}

interface WindowRecord {
  timestamps: number[];
}

// Global in-memory storage for sliding window timestamps
const storage = new Map<string, WindowRecord>();

// Periodic garbage collection to prevent memory leaks
let lastCleanup = Date.now();
function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 60000) return; // run at most once per minute
  lastCleanup = now;

  for (const [key, record] of storage.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length === 0) {
      storage.delete(key);
    }
  }
}

/**
 * Extracts a dependable client IP from incoming request headers
 */
export function getClientIp(request: Request | NextRequest): string {
  const headers = request.headers;
  
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in seconds
  retryAfter: number; // Seconds to wait
  headers: Record<string, string>;
  response?: NextResponse;
}

/**
 * Checks rate limit for the given request and configuration.
 * Returns { success: true, ... } if allowed, or { success: false, response, ... } with an HTTP 429 response.
 */
export function checkRateLimit(
  request: Request | NextRequest,
  config: RateLimitConfig,
  customIdentifier?: string | number
): RateLimitResult {
  cleanupStaleEntries(config.windowMs);

  const ip = getClientIp(request);
  const prefix = config.keyPrefix || "api";
  const idPart = customIdentifier !== undefined ? `:id:${customIdentifier}` : "";
  const key = `${prefix}:${ip}${idPart}`;

  const now = Date.now();
  let record = storage.get(key);

  if (!record) {
    record = { timestamps: [] };
    storage.set(key, record);
  }

  // Filter out timestamps outside the active sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < config.windowMs);

  const limit = config.max;
  const currentCount = record.timestamps.length;
  const resetTime = Math.ceil((now + config.windowMs) / 1000);

  if (currentCount >= limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const retryAfter = Math.max(1, Math.ceil((oldestTimestamp + config.windowMs - now) / 1000));

    const headers: Record<string, string> = {
      "Retry-After": retryAfter.toString(),
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": resetTime.toString(),
    };

    const response = NextResponse.json(
      {
        message: "Too many requests. Please slow down and try again.",
        error: "Rate limit exceeded",
        retryAfter,
      },
      {
        status: 429,
        headers,
      }
    );

    return {
      success: false,
      limit,
      remaining: 0,
      resetTime,
      retryAfter,
      headers,
      response,
    };
  }

  // Record this request
  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetTime.toString(),
  };

  return {
    success: true,
    limit,
    remaining,
    resetTime,
    retryAfter: 0,
    headers,
  };
}

/**
 * Predefined rate limiting configurations
 */
export const rateLimitPresets = {
  // Sensitive financial actions: transfers, QR checkout, on-ramp, off-ramp
  financial: {
    windowMs: 60 * 1000, // 1 minute
    max: 15,             // 15 requests/min
    keyPrefix: "financial",
  },
  // Authentication & account registration: signup, login attempts
  auth: {
    windowMs: 60 * 1000, // 1 minute
    max: 6,              // 6 requests/min
    keyPrefix: "auth",
  },
  // General queries: user search, notifications
  general: {
    windowMs: 60 * 1000, // 1 minute
    max: 60,             // 60 requests/min
    keyPrefix: "general",
  },
};

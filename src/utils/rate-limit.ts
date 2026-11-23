type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const entries = new Map<string, RateLimitEntry>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export const getClientKey = (request: Request, prefix: string): string => {
  const forwardedFor =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for");
  const address = forwardedFor?.split(",")[0]?.trim();
  return `${prefix}:${address || "unknown"}`;
};

const memoryRateLimit = (
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult => {
  if (entries.size > 1_000) {
    for (const [entryKey, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(entryKey);
    }
  }

  const existing = entries.get(key);
  if (!existing || existing.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(limit - 1, 0), retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(Math.ceil((existing.resetAt - now) / 1000), 1);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(limit - existing.count, 0),
    retryAfterSeconds: 0,
  };
};

const redisRateLimit = async (
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult | null> => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const countResponse = await fetch(`${url}/incr/${encodeURIComponent(key)}`, { headers });
    if (!countResponse.ok) return null;
    const countBody = (await countResponse.json()) as { result?: number };
    const count = Number(countBody.result);
    if (!Number.isFinite(count)) return null;

    if (count === 1) {
      await fetch(`${url}/pexpire/${encodeURIComponent(key)}/${windowMs}`, { headers });
    }

    const ttlResponse = await fetch(`${url}/pttl/${encodeURIComponent(key)}`, { headers });
    const ttlBody = await ttlResponse.json().catch(() => null) as { result?: number } | null;
    const ttlMs = Number(ttlBody?.result);
    const retryAfterSeconds =
      ttlMs > 0 ? Math.max(Math.ceil(ttlMs / 1000), 1) : Math.max(Math.ceil(windowMs / 1000), 1);

    return {
      allowed: count <= limit,
      remaining: Math.max(limit - count, 0),
      retryAfterSeconds: count <= limit ? 0 : retryAfterSeconds,
    };
  } catch {
    return null;
  }
};

export const checkRateLimit = async (
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): Promise<RateLimitResult> =>
  (await redisRateLimit(key, limit, windowMs)) ??
  memoryRateLimit(key, limit, windowMs, now);

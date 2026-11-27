import { TOKEN_COOKIE, isPlausibleToken } from "@/utils/token";
import { fetchWithRetry, sanitizeParams } from "@/utils/tmdb";
import { checkRateLimit, getClientKey } from "@/utils/rate-limit";
import { NextRequest } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/** Only the endpoints the app uses, with how long the CDN may cache them (seconds). */
const ROUTES: { pattern: RegExp; ttl: number }[] = [
  { pattern: /^(movie|tv)\/(popular|top_rated)$/, ttl: HOUR },
  { pattern: /^movie\/(now_playing|upcoming)$/, ttl: HOUR },
  { pattern: /^tv\/on_the_air$/, ttl: HOUR },
  { pattern: /^trending\/(movie|tv)\/(day|week)$/, ttl: HOUR },
  { pattern: /^configuration\/countries$/, ttl: 7 * DAY },
  { pattern: /^discover\/(movie|tv)$/, ttl: HOUR },
  { pattern: /^search\/(movie|tv)$/, ttl: HOUR },
  { pattern: /^genre\/(movie|tv)\/list$/, ttl: 7 * DAY },
  { pattern: /^(movie|tv)\/\d+$/, ttl: 6 * HOUR },
  { pattern: /^tv\/\d+\/season\/\d+$/, ttl: 6 * HOUR },
];

/**
 * Responses depend on the visitor's own token, so they are cached by the browser only.
 * A shared CDN cache would hand cached data to visitors that have no valid token.
 */
const cacheHeaders = (ttl: number) => ({
  "Cache-Control": `private, max-age=${Math.min(ttl, 300)}, stale-while-revalidate=300`,
});

const unauthorized = (message: string) =>
  Response.json(
    { success: false, status_message: message },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );

const notFound = () =>
  Response.json({ success: false, status_message: "Not found" }, { status: 404 });

export const GET = async (
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => {
  // block other sites from using this route
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return Response.json({ success: false, status_message: "Forbidden" }, { status: 403 });
  }
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.nextUrl.host) {
        return Response.json({ success: false, status_message: "Forbidden" }, { status: 403 });
      }
    } catch {
      return Response.json({ success: false, status_message: "Forbidden" }, { status: 403 });
    }
  }

  const rateLimit = await checkRateLimit(getClientKey(request, "tmdb"), 120, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { success: false, status_message: "Too many TMDB requests" },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const { path } = await ctx.params;
  const endpoint = path.join("/");
  const route = ROUTES.find(({ pattern }) => pattern.test(endpoint));
  if (!route) return notFound();

  const params = sanitizeParams(request.nextUrl.searchParams);
  if (!params) {
    return Response.json({ success: false, status_message: "Invalid parameters" }, { status: 400 });
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token || !isPlausibleToken(token)) return unauthorized("Missing TMDB token");

  let upstream: Response;
  try {
    upstream = await fetchWithRetry(`${TMDB_BASE_URL}/${endpoint}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return Response.json(
      { success: false, status_message: "Couldn't reach TMDB" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  // TMDB didn't accept the token. Report it but keep the cookie: a one-off hiccup must never
  // wipe a saved token. The client sends the visitor to /setup, where they can replace it.
  if (upstream.status === 401) return unauthorized("TMDB rejected the token");

  const headers: Record<string, string> = { "Content-Type": "application/json; charset=utf-8" };

  if (upstream.ok) Object.assign(headers, cacheHeaders(route.ttl));
  else if (upstream.status === 404) Object.assign(headers, cacheHeaders(60));
  else headers["Cache-Control"] = "no-store";

  return new Response(upstream.body, { status: upstream.status, headers });
};

import {
  TOKEN_COOKIE,
  cleanToken,
  isPlausibleToken,
  isSecureRequest,
  looksLikeApiKey,
  tokenCookieOptions,
} from "@/utils/token";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientKey } from "@/utils/rate-limit";
import { fetchWithRetry } from "@/utils/tmdb";

const TMDB_VALIDATE_URL = "https://api.themoviedb.org/3/authentication";
const tokenRequestSchema = z.object({
  token: z.string(),
});

const respond = (
  body: Record<string, unknown>,
  status = 200,
  headers: Record<string, string> = {},
) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });

/** Blocks other sites from setting or clearing the cookie (login CSRF). */
const isSameOrigin = (request: NextRequest) => {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === request.nextUrl.host;
  } catch {
    return false;
  }
};

/** Validates the token with TMDB, then stores it in an httpOnly cookie. */
export const POST = async (request: NextRequest) => {
  if (!isSameOrigin(request)) return respond({ error: "Forbidden." }, 403);
  const rateLimit = await checkRateLimit(getClientKey(request, "token"), 10, 60_000);
  if (!rateLimit.allowed) {
    return respond(
      { error: "Too many token requests. Try again later." },
      429,
      { "Retry-After": String(rateLimit.retryAfterSeconds) },
    );
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return respond({ error: "Invalid request." }, 415);
  }

  const body = tokenRequestSchema.safeParse(await request.json().catch(() => null));
  const token = body.success ? cleanToken(body.data.token) : "";

  if (!token) return respond({ error: "Paste your TMDB API Read Access Token." }, 400);
  if (looksLikeApiKey(token)) {
    return respond(
      {
        error:
          "That looks like the short API Key. Use the much longer “API Read Access Token” instead (it usually starts with eyJ).",
      },
      400,
    );
  }
  if (!isPlausibleToken(token)) {
    return respond({ error: "That doesn’t look like a valid TMDB access token." }, 400);
  }

  let upstream: Response;
  try {
    upstream = await fetchWithRetry(TMDB_VALIDATE_URL, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return respond(
      { error: "Couldn’t reach TMDB to check the token. Try again in a moment." },
      502,
    );
  }

  if (upstream.status === 401) {
    return respond({ error: "TMDB rejected this token. Check it and try again." }, 401);
  }
  if (!upstream.ok) {
    return respond({ error: `TMDB returned an unexpected error (${upstream.status}).` }, 502);
  }

  const response = respond({ ok: true });
  response.cookies.set(
    TOKEN_COOKIE,
    token,
    tokenCookieOptions(
      isSecureRequest(request.nextUrl.protocol, request.headers.get("x-forwarded-proto")),
    ),
  );
  return response;
};

/** Removes the saved token. */
export const DELETE = async (request: NextRequest) => {
  if (!isSameOrigin(request)) return respond({ error: "Forbidden." }, 403);
  const response = respond({ ok: true });
  response.cookies.delete(TOKEN_COOKIE);
  return response;
};

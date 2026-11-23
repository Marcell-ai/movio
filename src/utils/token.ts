/**
 * Helpers for the user-supplied TMDB token. The token lives in an httpOnly cookie, so page
 * JavaScript can't read it; only this app's server attaches it to requests sent to TMDB.
 * Keep this file dependency-free: it is imported by the proxy, route handlers and pages.
 */

export const TOKEN_COOKIE = "tmdb_token";

/** TMDB "API Read Access Token": a JWT, so base64url characters plus dots. */
const TOKEN_PATTERN = /^[A-Za-z0-9._-]{20,2048}$/;

/** The short "API Key" (32 hex chars) is a different credential and is not accepted. */
const API_KEY_PATTERN = /^[a-f0-9]{32}$/i;

export const isPlausibleToken = (value: string) => TOKEN_PATTERN.test(value);
export const looksLikeApiKey = (value: string) => API_KEY_PATTERN.test(value);

/** Accepts what people paste: surrounding spaces or quotes, with or without a "Bearer " prefix. */
export const cleanToken = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const unquote = (text: string) =>
    text
      .trim()
      .replace(/^["'`]+|["'`]+$/g, "")
      .trim();
  return unquote(unquote(value).replace(/^bearer\s+/i, ""));
};

/** Only allow redirects to a path on this site, never to another origin or back into /setup. */
export const safeNextPath = (value?: string | null): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  if (value === "/setup" || value.startsWith("/setup?") || value.startsWith("/setup/")) return "/";
  return value;
};

/** Browsers cap cookie lifetime at about 400 days, so ask for exactly that. */
export const TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

/** Plain HTTP (e.g. a home server without TLS) can't store `Secure` cookies, so only set it on HTTPS. */
export const isSecureRequest = (protocol: string, forwardedProto: string | null) =>
  protocol === "https:" ||
  forwardedProto?.split(",")[0].trim().toLowerCase() === "https";

/** One definition of the cookie so saving it and renewing it can never drift apart. */
export const tokenCookieOptions = (secure: boolean) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure,
  path: "/",
  maxAge: TOKEN_COOKIE_MAX_AGE,
});

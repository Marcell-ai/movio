import { TOKEN_COOKIE, isPlausibleToken, isSecureRequest, tokenCookieOptions } from "@/utils/token";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Gate: until a TMDB token has been saved, every page redirects to /setup (remembering where
 * the visitor was headed). This is a convenience redirect; the real check happens in
 * /api/tmdb, which refuses requests without a token that TMDB accepts.
 *
 * Once a token is saved it is kept for good: each visit renews the cookie (sliding expiry), so
 * it only lapses if the app goes unused for over a year, and nothing in the app deletes it
 * except the visitor choosing "Remove saved token".
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (token) {
    const response = NextResponse.next();
    if (isPlausibleToken(token)) {
      response.cookies.set(
        TOKEN_COOKIE,
        token,
        tokenCookieOptions(
          isSecureRequest(request.nextUrl.protocol, request.headers.get("x-forwarded-proto")),
        ),
      );
    }
    return response;
  }

  const url = request.nextUrl.clone();
  const target = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/setup";
  url.search = "";
  if (target !== "/") url.searchParams.set("next", target);
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except the setup page, API routes and static files the browser needs up front.
  matcher: ["/((?!api|setup|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)"],
};

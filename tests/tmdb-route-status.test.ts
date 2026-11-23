// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/tmdb/[...path]/route";

const context = (path: string[]) => ({
  params: Promise.resolve({ path }),
});

const request = (url: string, ip: string) =>
  new NextRequest(url, {
    headers: {
      "sec-fetch-site": "same-origin",
      "x-forwarded-for": ip,
    },
  });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("TMDB route status handling", () => {
  it("returns 403 for cross-origin requests", async () => {
    const req = new NextRequest("http://localhost/api/tmdb/movie/popular", {
      headers: { "sec-fetch-site": "cross-site", "x-forwarded-for": "198.51.100.30" },
    });
    const response = await GET(req, context(["movie", "popular"]));
    expect(response.status).toBe(403);
  });

  it("returns 404 for unsupported endpoints", async () => {
    const response = await GET(
      request("http://localhost/api/tmdb/account/private", "198.51.100.31"),
      context(["account", "private"]),
    );
    expect(response.status).toBe(404);
  });

  it("returns 401 when no token cookie exists", async () => {
    const response = await GET(
      request("http://localhost/api/tmdb/movie/popular", "198.51.100.32"),
      context(["movie", "popular"]),
    );
    expect(response.status).toBe(401);
  });

  it("returns 502 when upstream fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const req = request("http://localhost/api/tmdb/movie/popular", "198.51.100.33");
    req.cookies.set("tmdb_token", `eyJ.${"a".repeat(40)}.signature`);
    const response = await GET(req, context(["movie", "popular"]));
    expect(response.status).toBe(502);
  });
});

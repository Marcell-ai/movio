import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithRetry, sanitizeParams } from "@/utils/tmdb";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchWithRetry", () => {
  it("retries transient upstream responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithRetry(
      "https://api.themoviedb.org/3/movie/1",
      { cache: "no-store" },
      { attempts: 2, baseDelayMs: 1 },
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("sanitizeParams", () => {
  it("keeps supported parameters in a stable order", () => {
    const params = sanitizeParams(
      new URLSearchParams({
        include_image_language: "en,null",
        query: "  dune  ",
        page: "2",
        with_genres: "27",
        with_origin_country: "ID",
        append_to_response: "images,videos",
      }),
    );

    expect(params?.toString()).toBe(
      "page=2&query=dune&with_genres=27&with_origin_country=ID&append_to_response=images%2Cvideos&include_image_language=en%2Cnull",
    );
  });

  it("rejects invalid pagination and unsupported append values", () => {
    expect(sanitizeParams(new URLSearchParams({ page: "0" }))).toBeNull();
    expect(
      sanitizeParams(new URLSearchParams({ append_to_response: "images,account" })),
    ).toBeNull();
    expect(sanitizeParams(new URLSearchParams({ with_origin_country: "id" }))).toBeNull();
    expect(sanitizeParams(new URLSearchParams({ with_origin_country: "ID;DROP" }))).toBeNull();
  });

  it("rejects empty or oversized search queries", () => {
    expect(sanitizeParams(new URLSearchParams({ query: "  " }))).toBeNull();
    expect(sanitizeParams(new URLSearchParams({ query: "x".repeat(101) }))).toBeNull();
  });
});

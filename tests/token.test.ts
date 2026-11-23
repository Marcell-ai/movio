// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, POST } from "@/app/api/token/route";

const request = (method: "POST" | "DELETE", body?: object) =>
  new NextRequest("http://localhost/api/token", {
    method,
    headers: {
      "content-type": "application/json",
      "sec-fetch-site": "same-origin",
      "x-forwarded-for": `198.51.100.${method === "POST" ? "20" : "21"}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("token route", () => {
  it("rejects cross-origin POST requests", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/token", {
        method: "POST",
        headers: { "sec-fetch-site": "cross-site" },
      }),
    );
    expect(response.status).toBe(403);
  });

  it("rejects invalid JSON token payloads", async () => {
    const response = await POST(request("POST", { token: "" }));
    expect(response.status).toBe(400);
  });

  it("rejects short API keys", async () => {
    const response = await POST(
      request("POST", { token: "a".repeat(32) }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("short API Key"),
    });
  });

  it("returns 502 when TMDB cannot validate the token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const response = await POST(request("POST", { token: `eyJ.${"a".repeat(40)}.signature` }));
    expect(response.status).toBe(502);
  });

  it("sets an httpOnly token cookie after successful validation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
    const response = await POST(request("POST", { token: `eyJ.${"a".repeat(40)}.signature` }));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("deletes the saved token cookie", async () => {
    const response = await DELETE(request("DELETE"));
    expect(response.status).toBe(200);
    expect(response.cookies.get("tmdb_token")?.value).toBe("");
  });
});

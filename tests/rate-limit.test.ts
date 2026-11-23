import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/utils/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests up to the limit", () => {
    const now = 1_000;
    expect(checkRateLimit("test-limit", 2, 60_000, now).allowed).toBe(true);
    expect(checkRateLimit("test-limit", 2, 60_000, now).allowed).toBe(true);
  });

  it("blocks requests over the limit and reports retry time", () => {
    const now = 10_000;
    checkRateLimit("test-block", 1, 30_000, now);
    const blocked = checkRateLimit("test-block", 1, 30_000, now + 1_000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBe(29);
  });

  it("allows requests again after the window expires", () => {
    const now = 20_000;
    checkRateLimit("test-reset", 1, 1_000, now);
    expect(checkRateLimit("test-reset", 1, 1_000, now + 1_001).allowed).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { cn, formatNumber, isEmpty } from "@/utils/helpers";
import { getImageUrl } from "@/utils/movies";

describe("helpers", () => {
  it("merges conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("recognizes empty supported values", () => {
    expect(isEmpty("  ")).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(0)).toBe(false);
  });

  it("formats abbreviated numbers", () => {
    expect(formatNumber(1_000)).toBe("1k");
    expect(formatNumber(1_250, { decimals: 1 })).toBe("1.3k");
    expect(formatNumber(-1_000_000, { uppercase: true })).toBe("-1M");
  });

  it("uses HTTPS and type-specific TMDB image sizes", () => {
    expect(getImageUrl("/poster.jpg", "poster")).toBe(
      "https://image.tmdb.org/t/p/w185/poster.jpg",
    );
    expect(getImageUrl("/backdrop.jpg", "backdrop")).toBe(
      "https://image.tmdb.org/t/p/w780/backdrop.jpg",
    );
    expect(getImageUrl("/backdrop.jpg", "backdrop", true)).toBe(
      "https://image.tmdb.org/t/p/w1280/backdrop.jpg",
    );
    expect(getImageUrl("/poster.jpg", "poster", true)).toBe(
      "https://image.tmdb.org/t/p/w342/poster.jpg",
    );
  });
});

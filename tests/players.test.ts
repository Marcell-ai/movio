import { describe, expect, it } from "vitest";
import { playerProviders } from "@/config/players";
import { getMoviePlayers, getTvShowPlayers } from "@/utils/players";

describe("player providers", () => {
  it("only exposes enabled providers", () => {
    const enabled = playerProviders.filter(({ enabled }) => enabled);

    expect(getMoviePlayers(603)).toHaveLength(enabled.length);
    expect(getTvShowPlayers(1399, 1, 1)).toHaveLength(enabled.length);
  });

  it("does not put undefined start times in player URLs", () => {
    expect(getMoviePlayers(603).every(({ source }) => !source.includes("undefined"))).toBe(true);
    expect(getTvShowPlayers(1399, 1, 1).every(({ source }) => !source.includes("undefined"))).toBe(
      true,
    );
  });

  it("includes the requested resume time", () => {
    expect(getMoviePlayers(603, 90)[0].source).toContain("startAt=90");
    expect(getTvShowPlayers(1399, 1, 1, 90)[0].source).toContain("startAt=90");
  });

  it("excludes providers switched off in the registry", () => {
    const provider = playerProviders[0];
    const previous = provider.enabled;
    provider.enabled = false;

    expect(getMoviePlayers(603).some((player) => player.title === provider.title)).toBe(false);

    provider.enabled = previous;
  });
});

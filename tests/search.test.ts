import { afterEach, describe, expect, it, vi } from "vitest";
import { tmdb } from "@/api/tmdb-client";
import type { CountryConfiguration, Genre } from "tmdb-ts";
import { parseGenreCountrySearch } from "@/utils/search";

afterEach(() => {
  vi.unstubAllGlobals();
});

const genres: Genre[] = [
  { id: 27, name: "Horror" },
  { id: 18, name: "Drama" },
];

const countries: CountryConfiguration[] = [
  { iso_3166_1: "ID", english_name: "Indonesia", native_name: "Indonesia" },
  { iso_3166_1: "US", english_name: "United States", native_name: "United States" },
];

describe("parseGenreCountrySearch", () => {
  it("parses a country followed by a genre", () => {
    expect(parseGenreCountrySearch("Indonesia horror", "movie", genres, countries)).toEqual({
      content: "movie",
      genreId: 27,
      genreName: "Horror",
      countryCode: "ID",
      countryName: "Indonesia",
    });
  });

  it("parses reversed order and common filler words", () => {
    expect(
      parseGenreCountrySearch(
        "I want to watch Horror movies from Indonesia",
        "movie",
        genres,
        countries,
      ),
    ).toMatchObject({ genreId: 27, countryCode: "ID" });
  });

  it("does not reinterpret ordinary title searches as country-and-genre searches", () => {
    expect(
      parseGenreCountrySearch("Indonesia horror 2024", "movie", genres, countries),
    ).toBeNull();
    expect(parseGenreCountrySearch("Indonesia", "movie", genres, countries)).toBeNull();
  });
});

describe("TMDB discover search", () => {
  it("sends both genre and country filters to the movie discover endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ page: 1, results: [], total_pages: 1, total_results: 0 }), {
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await tmdb.discover.movie({
      page: 1,
      with_genres: "27",
      with_origin_country: "ID",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tmdb/discover/movie?page=1&with_genres=27&with_origin_country=ID",
    );
  });
});

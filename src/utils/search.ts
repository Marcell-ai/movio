import { tmdb } from "@/api/tmdb-client";
import { ActionResponse, ContentType } from "@/types";
import { isEmpty } from "@/utils/helpers";
import type { CountryConfiguration, Genre, Movie, TV } from "tmdb-ts";

export type SearchSuggestion = {
  id: number;
  title: string;
  type: "movie" | "tv";
};

export type GenreCountrySearch = {
  content: ContentType;
  genreId: number;
  genreName: string;
  countryCode: string;
  countryName: string;
};

const normalizeSearchTerm = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const fillerWords = new Set([
  "a",
  "and",
  "film",
  "films",
  "find",
  "for",
  "from",
  "i",
  "in",
  "looking",
  "me",
  "movie",
  "movies",
  "of",
  "please",
  "series",
  "see",
  "show",
  "shows",
  "some",
  "the",
  "to",
  "tv",
  "want",
  "watch",
]);

const findPhrase = <T>(query: string, items: T[], getNames: (item: T) => string[]) =>
  items
    .flatMap((item) =>
      getNames(item)
        .map(normalizeSearchTerm)
        .filter(Boolean)
        .map((name) => ({ item, name })),
    )
    .filter(({ name }) => ` ${query} `.includes(` ${name} `))
    .sort((a, b) => b.name.length - a.name.length)[0];

/** Recognizes a query made of one TMDB country and one genre, in either word order. */
export const parseGenreCountrySearch = (
  query: string,
  content: ContentType,
  genres: Genre[],
  countries: CountryConfiguration[],
): GenreCountrySearch | null => {
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) return null;

  const countryMatch = findPhrase(normalizedQuery, countries, (country) => [
    country.english_name,
    country.native_name,
  ]);
  const genreMatch = findPhrase(normalizedQuery, genres, (genre) => [genre.name]);
  if (!countryMatch || !genreMatch) return null;

  const remainingWords = ` ${normalizedQuery} `
    .replace(` ${countryMatch.name} `, " ")
    .replace(` ${genreMatch.name} `, " ")
    .trim()
    .split(" ")
    .filter((word) => word && !fillerWords.has(word));

  if (remainingWords.length) return null;

  return {
    content,
    genreId: genreMatch.item.id,
    genreName: genreMatch.item.name,
    countryCode: countryMatch.item.iso_3166_1,
    countryName: countryMatch.item.english_name,
  };
};

/** Merges movie and TV results into unique titles, best matches first. */
export const buildSearchSuggestions = (
  query: string,
  movies: Movie[],
  tvShows: TV[],
  limit: number = 10,
): SearchSuggestion[] => {
  const queryLower = query.toLowerCase();

  const suggestions: SearchSuggestion[] = [
    ...movies.map((movie) => ({ id: movie.id, title: movie.title, type: "movie" as const })),
    ...tvShows.map((tv) => ({ id: tv.id, title: tv.name, type: "tv" as const })),
  ];

  return suggestions
    .filter((data) => data.title.toLowerCase().includes(queryLower))
    .filter(
      (data, index, self) =>
        index === self.findIndex((t) => t.title.toLowerCase() === data.title.toLowerCase()),
    )
    .sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      const aStartsWith = aTitle.startsWith(queryLower);
      const bStartsWith = bTitle.startsWith(queryLower);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      const aIndex = aTitle.indexOf(queryLower);
      const bIndex = bTitle.indexOf(queryLower);

      if (aIndex !== bIndex) return aIndex - bIndex;
      return aTitle.localeCompare(bTitle);
    })
    .slice(0, limit);
};

/**
 * Uses the same cached `search/*` requests as the search results page (page 1),
 * so suggestions and results share CDN cache entries.
 */
export const getSearchSuggestions = async (
  query: string,
  limit: number = 10,
): ActionResponse<SearchSuggestion[] | null> => {
  if (isEmpty(query)) {
    return { success: true, message: "No search suggestions", data: null };
  }

  try {
    const [movies, tvShows] = await Promise.all([
      tmdb.search.movies({ query, page: 1 }),
      tmdb.search.tvShows({ query, page: 1 }),
    ]);

    const suggestions = buildSearchSuggestions(query, movies.results, tvShows.results, limit);

    if (isEmpty(suggestions)) {
      return { success: true, message: "No search suggestions", data: null };
    }

    return { success: true, message: "Search suggestions fetched", data: suggestions };
  } catch (error) {
    console.error("Search suggestions error:", error);
    return { success: false, message: "Error fetching search suggestions", data: null };
  }
};

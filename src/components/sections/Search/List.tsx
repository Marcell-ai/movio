"use client";

import { tmdb } from "@/api/tmdb-client";
import { queryClient } from "@/app/providers";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ContentType } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { getLoadingLabel } from "@/utils/movies";
import type { GenreCountrySearch } from "@/utils/search";
import { Spinner } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Movie, Search, TV } from "tmdb-ts/dist/types";
import PosterCard from "../Shared/PosterCard";
import SearchFilter from "./Filter";

type FetchType = {
  page: number;
  type: ContentType;
  query: string;
  genreCountrySearch: GenreCountrySearch | null;
};

type SearchResults =
  | Search<Movie>
  | Search<TV>
  | Awaited<ReturnType<typeof tmdb.discover.movie>>
  | Awaited<ReturnType<typeof tmdb.discover.tvShow>>;

const fetchData = ({
  page,
  type = "movie",
  query,
  genreCountrySearch,
}: FetchType): Promise<SearchResults> => {
  if (genreCountrySearch?.content === type) {
    const options = {
      page,
      with_genres: String(genreCountrySearch.genreId),
      with_origin_country: genreCountrySearch.countryCode,
    };
    if (type === "movie") return tmdb.discover.movie(options);
    return tmdb.discover.tvShow(options);
  }
  if (type === "movie") return tmdb.search.movies({ query, page });
  return tmdb.search.tvShows({ query, page });
};

const SearchList = () => {
  const { content } = useDiscoverFilters();
  const { ref, inViewport } = useInViewport();
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("");
  const [submittedGenreCountrySearch, setSubmittedGenreCountrySearch] =
    useState<GenreCountrySearch | null>(null);
  const genreCountrySearch =
    submittedGenreCountrySearch?.content === content ? submittedGenreCountrySearch : null;
  const triggered = !isEmpty(submittedSearchQuery);
  const { data, isFetching, isPending, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      enabled: triggered,
      queryKey: [
        "search-list",
        content,
        submittedSearchQuery,
        genreCountrySearch?.genreId,
        genreCountrySearch?.countryCode,
      ],
      queryFn: ({ pageParam: page }) =>
        fetchData({
          page,
          type: content,
          query: submittedSearchQuery,
          genreCountrySearch,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inViewport) {
      fetchNextPage();
    }
  }, [fetchNextPage, inViewport]);

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["search-list"] });
  }, [content]);

  const renderSearchResults = () => {
      const resultDescription = genreCountrySearch
        ? `${genreCountrySearch.genreName} ${content === "movie" ? "movies" : "TV shows"} from ${genreCountrySearch.countryName}`
        : `${content === "movie" ? "movies" : "TV series"} with query "${submittedSearchQuery}"`;

      if (isEmpty(data?.pages[0].results)) {
        return (
          <h5 className="mt-56 text-center text-xl">
            No <span className="text-warning font-semibold">{resultDescription}</span> found.
          </h5>
        );
      }

      return (
        <>
          <h5 className="text-center text-xl">
            <span className="motion-preset-focus">
              Found{" "}
              <span className="text-success font-semibold">{data?.pages[0].total_results}</span>{" "}
              <span className="text-warning font-semibold">{resultDescription}</span>
            </span>
          </h5>
          <div className="movie-grid">
            {content === "movie"
              ? data?.pages.map((page) =>
                  page.results.map((movie) => (
                    <PosterCard
                      key={movie.id}
                      type="movie"
                      item={movie as Movie}
                      variant="bordered"
                    />
                  )),
                )
              : data?.pages.map((page) =>
                  page.results.map((tv) => (
                    <PosterCard key={tv.id} type="tv" item={tv as TV} variant="bordered" />
                  )),
                )}
          </div>
        </>
      );
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <SearchFilter
        isLoading={isFetching}
        onSearchSubmit={(value, intent) => {
          setSubmittedSearchQuery(value.trim());
          setSubmittedGenreCountrySearch(intent ?? null);
        }}
      />
      {triggered && (
        <>
          <div className="relative flex flex-col items-center gap-8">
            {isPending ? (
              <Spinner
                size="lg"
                className="absolute-center mt-56"
                color={content === "movie" ? "primary" : "warning"}
                variant="simple"
              />
            ) : (
              renderSearchResults()
            )}
          </div>
          <div ref={ref} className="flex h-24 items-center justify-center">
            {isFetchingNextPage && (
              <Spinner
                color={content === "movie" ? "primary" : "warning"}
                size="lg"
                variant="wave"
                label={getLoadingLabel()}
              />
            )}
            {!isEmpty(data?.pages[0].results) && !hasNextPage && !isPending && (
              <p className="text-muted-foreground text-center text-base">
                You have reached the end of the list.
              </p>
            )}
          </div>
        </>
      )}

      <BackToTopButton />
    </div>
  );
};

export default SearchList;

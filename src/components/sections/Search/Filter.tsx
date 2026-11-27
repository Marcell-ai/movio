"use client";

import { tmdb } from "@/api/tmdb-client";
import { getSearchSuggestions, parseGenreCountrySearch } from "@/utils/search";
import type { GenreCountrySearch } from "@/utils/search";
import SearchInput from "@/components/ui/input/SearchInput";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import Highlight from "@/components/ui/other/Highlight";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { SEARCH_HISTORY_STORAGE_KEY } from "@/utils/constants";
import { cn, isEmpty } from "@/utils/helpers";
import { ArrowUpLeft, Close, History, Movie, Search, TV } from "@/utils/icons";
import { useRouter } from "@bprogress/next/app";
import { Button, Listbox, ListboxItem } from "@heroui/react";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useState } from "react";

interface SearchFilterProps extends React.HTMLAttributes<HTMLFormElement> {
  isLoading?: boolean;
  onSearchSubmit?: (value: string, genreCountrySearch?: GenreCountrySearch | null) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ isLoading, onSearchSubmit, ...props }) => {
  const router = useRouter();
  const { mobile } = useBreakpoints();
  const { content } = useDiscoverFilters();
  const [triggered, setTriggered] = useState(false);
  const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""));
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
  const [searchHistories, setSearchHistories] = useLocalStorage<string[]>({
    key: SEARCH_HISTORY_STORAGE_KEY,
    defaultValue: [],
  });
  const hasMultipleTerms = searchQuery.trim().split(/\s+/).filter(Boolean).length > 1;
  const { data: genres, isPending: isGenresPending, isError: isGenresError } = useQuery({
    enabled: hasMultipleTerms && !triggered,
    queryKey: ["search-intent-genres", content],
    queryFn: () => (content === "movie" ? tmdb.genres.movies() : tmdb.genres.tvShows()),
    staleTime: 1000 * 60 * 60 * 24,
  });
  const {
    data: countries,
    isPending: isCountriesPending,
    isError: isCountriesError,
  } = useQuery({
    enabled: hasMultipleTerms && !triggered,
    queryKey: ["search-intent-countries"],
    queryFn: () => tmdb.configuration.countries(),
    staleTime: 1000 * 60 * 60 * 24,
  });
  const isIntentLookupLoading =
    hasMultipleTerms && !triggered && (isGenresPending || isCountriesPending);
  const intentLookupFailed = hasMultipleTerms && (isGenresError || isCountriesError);
  const genreCountrySearch = parseGenreCountrySearch(
    searchQuery,
    content,
    genres?.genres ?? [],
    countries ?? [],
  );
  const enableFetch = debouncedSearchQuery.length > 3 && !isLoading && !triggered;
  const { data, isFetching } = useQuery({
    enabled: enableFetch,
    queryKey: ["search-suggestions", debouncedSearchQuery],
    queryFn: async () => await getSearchSuggestions(debouncedSearchQuery),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
  const showSuggestions = enableFetch && !isFetching;
  const showIntentSuggestion = Boolean(genreCountrySearch) && !triggered && !isLoading;
  const showHistory =
    !showIntentSuggestion && !showSuggestions && !isEmpty(searchHistories) && !isLoading && !triggered;
  const showSuggestionList =
    showIntentSuggestion || (showSuggestions && !isEmpty(data?.data)) || showHistory;

  const submitSearch = useCallback(
    (value: string, intent?: GenreCountrySearch | null) => {
      setTriggered(!isEmpty(value));
      onSearchSubmit?.(value, intent);
      if (value && !searchHistories.includes(value)) {
        const newHistories = [...searchHistories, value];
        if (newHistories.length > 5) newHistories.shift();
        setSearchHistories(newHistories);
      }
    },
    [onSearchSubmit, searchHistories, setSearchHistories],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isIntentLookupLoading) return;
      submitSearch(searchQuery, genreCountrySearch);
    },
    [genreCountrySearch, isIntentLookupLoading, searchQuery, submitSearch],
  );

  const handleClear = useCallback(() => {
    setSearchQuery("");
    setTriggered(false);
    onSearchSubmit?.("");
  }, [onSearchSubmit, setSearchQuery]);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex w-full max-w-xl flex-col justify-center gap-5 text-center", {
        "absolute-center px-3 md:px-0": !triggered,
      })}
      {...props}
    >
      <ContentTypeSelection className="justify-center" />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2">
          <SearchInput
            autoFocus
            placeholder={`Search your favorite ${content === "movie" ? "movies" : "TV shows"}...`}
            isLoading={isLoading || isIntentLookupLoading}
            value={searchQuery}
            onValueChange={(val) => {
              setSearchQuery(val);
              if (isEmpty(val)) setTriggered(false);
            }}
            onClear={!isEmpty(searchQuery) ? handleClear : undefined}
          />
          <AnimatePresence>
            {!isEmpty(searchQuery) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  aria-label="Submit search"
                  isLoading={isLoading || isIntentLookupLoading}
                  isIconOnly={mobile}
                  type="submit"
                  radius="full"
                  variant="flat"
                  color={content === "movie" ? "primary" : "warning"}
                >
                  {mobile ? <Search /> : "Search"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {isIntentLookupLoading && (
          <p role="status" className="text-muted-foreground absolute top-12 z-999 w-full text-sm md:top-13">
            Checking for a matching country and genre...
          </p>
        )}
        {intentLookupFailed && !isIntentLookupLoading && (
          <p role="status" className="text-danger absolute top-12 z-999 w-full text-sm md:top-13">
            Couldn&apos;t load country and genre filters. You can still search by title.
          </p>
        )}
        {showSuggestionList && (
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Listbox
                variant="flat"
                emptyContent={<p className="text-center">No search suggestions</p>}
                aria-label="Search Suggestions"
                className="bg-content1 rounded-medium absolute top-12 z-999 w-full shadow-2xl md:top-13"
                classNames={{
                  list: "max-h-[10rem] md:max-h-[15rem] overflow-y-auto",
                }}
              >
                <>
                  {genreCountrySearch && (
                    <ListboxItem
                      key="genre-country-search"
                      className="text-start"
                      startContent={<Search className="text-primary" />}
                      textValue={`${genreCountrySearch.genreName} ${content === "movie" ? "movies" : "TV shows"} from ${genreCountrySearch.countryName}`}
                      onPress={() => submitSearch(searchQuery, genreCountrySearch)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>
                          {genreCountrySearch.genreName}{" "}
                          {content === "movie" ? "movies" : "TV shows"} from{" "}
                          {genreCountrySearch.countryName}
                        </span>
                        <span className="text-muted-foreground text-xs">Genre + country</span>
                      </div>
                    </ListboxItem>
                  )}
                  {showHistory &&
                    searchHistories.map((history, index) => (
                      <ListboxItem
                        key={`history-${index}`}
                        className="text-start"
                        startContent={<History />}
                        endContent={
                          <Button
                            aria-label={`Remove ${history} from search history`}
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="size-6"
                            onPress={() =>
                              setSearchHistories(
                                searchHistories.filter(
                                  (currentHistory) => currentHistory !== history,
                                ),
                              )
                            }
                          >
                            <Close size={24} />
                          </Button>
                        }
                        onPress={() => setSearchQuery(history)}
                      >
                        {history}
                      </ListboxItem>
                    ))}
                  {showSuggestions &&
                    (data?.data || []).map(({ id, title, type }, index) => (
                      <ListboxItem
                        key={`suggestion-${index}`}
                        className="text-start"
                        startContent={
                          type === "movie" ? (
                            <Movie className="text-primary" />
                          ) : (
                            <TV className="text-warning" />
                          )
                        }
                        endContent={
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="size-6"
                            onPress={() => {
                              setSearchQuery(title);
                            }}
                          >
                            <ArrowUpLeft size={20} />
                          </Button>
                        }
                        onPress={() => router.push(`/${type}/${id}`)}
                      >
                        <Highlight markType="bold" highlight={debouncedSearchQuery}>
                          {title}
                        </Highlight>
                      </ListboxItem>
                    ))}
                </>
              </Listbox>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </form>
  );
};

export default SearchFilter;

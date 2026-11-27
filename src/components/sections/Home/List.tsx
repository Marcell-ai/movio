"use client";

import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { tmdb } from "@/api/tmdb-client";
import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense } from "react";
const HomeList = dynamic(() => import("@/components/sections/Shared/HomeList"));
const HomeHero = dynamic(() => import("@/components/sections/Home/Hero"));

const HomePageList: React.FC = () => {
  const { movies, tvShows } = siteConfig.queryLists;
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );
  const { data: movieGenres } = useQuery({
    queryKey: ["home-movie-genres"],
    queryFn: () => tmdb.genres.movies(),
    enabled: content === "movie",
  });

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <HomeHero content={content} />
      <ContentTypeSelection
        className="justify-center"
        classNames={{
          tabList: "liquid-glass mx-auto rounded-full p-1",
          cursor: "rounded-full",
          tab: "h-11 px-5 md:px-7",
          tabContent: "pb-0",
        }}
      />
      <div className="relative flex min-h-32 flex-col gap-12">
        <Suspense
          fallback={
            <Spinner
              size="lg"
              variant="simple"
              className="absolute-center"
              color={content === "movie" ? "primary" : "warning"}
            />
          }
        >
          {content === "movie" && (
            <>
              {movies.slice(0, 2).map((movie) => (
                <HomeList key={movie.name} type="movie" {...movie} />
              ))}
              {movieGenres?.genres.map((genre) => (
                <HomeList
                  key={`movie-genre-${genre.id}`}
                  type="movie"
                  name={`${genre.name} Movies`}
                  param="discover"
                  seeAllHref={`/discover?genres=${genre.id}&content=movie`}
                  query={() => tmdb.discover.movie({ with_genres: String(genre.id) })}
                />
              ))}
              {movies.slice(2).map((movie) => (
                <HomeList key={movie.name} type="movie" {...movie} />
              ))}
            </>
          )}
          {content === "tv" && tvShows.map((tv) => <HomeList key={tv.name} type="tv" {...tv} />)}
        </Suspense>
      </div>
    </div>
  );
};

export default HomePageList;

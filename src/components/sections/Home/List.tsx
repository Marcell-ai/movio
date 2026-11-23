"use client";

import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense } from "react";
const HomeList = dynamic(() => import("@/components/sections/Shared/HomeList"));

const HomePageList: React.FC = () => {
  const { movies, tvShows } = siteConfig.queryLists;
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <header className="liquid-glass relative isolate mt-2 overflow-hidden rounded-[2rem] px-5 py-9 text-center sm:px-10 md:mt-4 md:px-14 md:py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(0,110,238,0.22),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(245,165,36,0.12),transparent_30%)]" />
        <p className="mb-3 text-[11px] font-semibold tracking-[0.32em] text-foreground-500 uppercase">
          Curated cinema
        </p>
        <h1 className="mx-auto max-w-3xl text-3xl font-black tracking-[-0.04em] md:text-5xl">
          Discover something
          <span className={content === "movie" ? " text-primary" : " text-warning"}> worth watching.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-foreground-500 md:text-base">
          A refined guide to the stories, films, and series defining the moment.
        </p>
      </header>
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
          {content === "movie" &&
            movies.map((movie) => <HomeList key={movie.name} type="movie" {...movie} />)}
          {content === "tv" && tvShows.map((tv) => <HomeList key={tv.name} type="tv" {...tv} />)}
        </Suspense>
      </div>
    </div>
  );
};

export default HomePageList;

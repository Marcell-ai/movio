"use client";

import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
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
          {content === "movie" &&
            movies.map((movie) => <HomeList key={movie.name} type="movie" {...movie} />)}
          {content === "tv" && tvShows.map((tv) => <HomeList key={tv.name} type="tv" {...tv} />)}
        </Suspense>
      </div>
    </div>
  );
};

export default HomePageList;

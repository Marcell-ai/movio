"use client";

import { tmdb } from "@/api/tmdb-client";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { cn } from "@/utils/helpers";
import { ContentType } from "@/types";
import { Button, Skeleton } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdInfoOutline, MdPlayArrow } from "react-icons/md";
import { Movie, TV } from "tmdb-ts";

type FeaturedItem = Movie | TV;

interface HomeHeroProps {
  content: ContentType;
}

const getTitle = (item: FeaturedItem, content: ContentType) =>
  content === "movie"
    ? mutateMovieTitle(item as Movie)
    : mutateTvShowTitle(item as TV);

const getDate = (item: FeaturedItem, content: ContentType) =>
  content === "movie"
    ? (item as Movie).release_date
    : (item as TV).first_air_date;

const HomeHero: React.FC<HomeHeroProps> = ({ content }) => {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const response =
          content === "movie"
            ? await tmdb.trending.trending("movie", "day")
            : await tmdb.trending.trending("tv", "day");

        if (active) {
          setItems(
            response.results
              .filter((item) => Boolean(item.backdrop_path))
              .slice(0, 8) as FeaturedItem[],
          );
          setActiveIndex(0);
        }
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [content]);

  useEffect(() => {
    if (items.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 7_000);

    return () => window.clearInterval(interval);
  }, [items.length]);

  if (loading) {
    return <Skeleton className="h-[clamp(400px,72svh,520px)] w-full rounded-3xl md:rounded-[2rem]" />;
  }

  if (!items.length) return null;

  const item = items[activeIndex];
  const title = getTitle(item, content);
  const date = getDate(item, content);
  const year = date ? new Date(date).getFullYear() : "";
  const backdrop = getImageUrl(item.backdrop_path, "backdrop");
  const match = Math.round(item.vote_average * 10);

  return (
    <section
      className="relative isolate h-[clamp(400px,72svh,520px)] w-full overflow-hidden rounded-3xl border border-white/10 bg-black md:rounded-[2rem]"
      aria-label={`Featured ${content === "movie" ? "movies" : "TV shows"}`}
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={item.id}
          src={backdrop}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1 }, scale: { duration: 8 } }}
          className="absolute inset-0 size-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,18,0.92)_0%,rgba(3,7,18,0.58)_42%,rgba(3,7,18,0.08)_75%,rgba(3,7,18,0.25)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(3,7,18,0.88)_0%,transparent_52%,rgba(3,7,18,0.12)_100%)]" />

      <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end px-5 pb-16 sm:px-10 md:px-14 md:pb-20">
        <motion.div
          key={`${item.id}-copy`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-white/70 uppercase">
            Featured {content === "movie" ? "movie" : "series"}
          </p>
          <h1 className="max-w-xl text-3xl font-black leading-[0.98] tracking-[-0.045em] text-white uppercase min-[375px]:text-4xl sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/85">
            {match > 0 && <span className="font-bold text-emerald-400">{match}% Match</span>}
            {year && <span>{year}</span>}
            <span className="rounded-sm border border-white/25 px-1.5 py-0.5 text-[10px] font-semibold">
              {content === "movie" ? "HD" : "Series"}
            </span>
            <span className="text-white/70">
              {content === "movie" ? "Movie" : "TV"}
            </span>
          </div>
          <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-6 text-white/75 md:text-base">
            {item.overview || "Explore the story, cast, and available streaming sources."}
          </p>
          <div className="mt-7 flex items-center gap-3">
            {content === "movie" ? (
              <Button
                as={Link}
                href={`/movie/${item.id}/player`}
                color="default"
                variant="solid"
                radius="full"
                className="h-12 px-6 font-bold text-black"
                startContent={<MdPlayArrow size={24} />}
              >
                Watch Now
              </Button>
            ) : null}
            <Button
              as={Link}
              href={`/${content}/${item.id}`}
              variant="flat"
              radius="full"
              className="h-12 bg-white/12 px-5 font-semibold text-white backdrop-blur-md"
              startContent={<MdInfoOutline size={20} />}
            >
              More Info
            </Button>
          </div>
        </motion.div>
      </div>

      <div
        className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
        aria-label="Featured slide navigation"
      >
        {items.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show featured ${getTitle(slide, content)}`}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-1.5 rounded-full bg-white/35 transition-all",
              index === activeIndex ? "w-8 bg-white" : "w-1.5 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeHero;

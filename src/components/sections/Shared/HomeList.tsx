"use client";

import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { ContentType, TvShowListItem } from "@/types";
import { ACCENT } from "@/utils/accent";
import { Link, Skeleton } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { kebabCase } from "string-ts";
import { Movie } from "tmdb-ts/dist/types";
import PosterCard from "./PosterCard";

interface HomeListProps {
  type: ContentType;
  name: string;
  /** `?type=` value understood by the discover page */
  param: string;
  query: () => Promise<{ results: (Movie | TvShowListItem)[] }>;
}

const HomeList: React.FC<HomeListProps> = ({ type, query, name, param }) => {
  const key = kebabCase(name) + "-list";
  const { ref, inViewport } = useInViewport();
  const { data, isPending } = useQuery({
    queryFn: query,
    queryKey: [key],
    enabled: inViewport,
  });

  return (
    <section id={key} className="min-h-[250px] md:min-h-[300px]" ref={ref}>
      {isPending ? (
        <div className="flex w-full flex-col gap-5">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
        </div>
      ) : (
        <div className="z-3 flex flex-col gap-3">
          <div className="flex grow items-end justify-between border-b border-white/6 pb-3">
            <SectionTitle
              color={ACCENT[type].color}
              classNames={{
                container: "gap-3",
                indicator: "h-7 w-1",
                title: "text-xl tracking-[-0.02em] md:text-2xl",
              }}
            >
              {name}
            </SectionTitle>
            <Link
              size="sm"
              href={`/discover?type=${param}${type === "tv" ? "&content=tv" : ""}`}
              isBlock
              color="foreground"
              className="rounded-full px-3 text-xs tracking-wide uppercase"
            >
              See All &gt;
            </Link>
          </div>
          <Carousel>
            {data?.results.map((item) => (
              <div
                key={item.id}
                className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2"
              >
                <PosterCard type={type} item={item} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default HomeList;

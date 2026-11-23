"use client";

import { Suspense, use } from "react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/api/tmdb-client";
import { Cast } from "tmdb-ts/dist/types/credits";
import { notFound } from "next/navigation";
import { Image, Movie } from "tmdb-ts";
import { mutateMovieTitle } from "@/utils/movies";
import dynamic from "next/dynamic";
import { Params } from "@/types";
import { NextPage } from "next";
const PhotosSection = dynamic(() => import("@/components/ui/other/PhotosSection"));
const BackdropSection = dynamic(() => import("@/components/sections/Shared/Backdrop"));
const OverviewSection = dynamic(() => import("@/components/sections/Movie/Detail/Overview"));
const CastsSection = dynamic(() => import("@/components/sections/Shared/Casts"));
const RelatedSection = dynamic(() => import("@/components/sections/Shared/Related"));

const MovieDetailPage: NextPage<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);

  const {
    data: movie,
    isPending,
    error,
  } = useQuery({
    queryFn: () =>
      tmdb.movies.details(id, ["images", "videos", "credits", "recommendations", "similar"]),
    queryKey: ["movie-detail", id],
  });

  if (isPending) {
    return <Spinner size="lg" className="absolute-center" variant="simple" />;
  }

  if (error) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<Spinner size="lg" className="absolute-center" variant="simple" />}>
        <div className="flex flex-col gap-10">
          <BackdropSection
            title={mutateMovieTitle(movie)}
            backdropPath={movie.backdrop_path}
            logos={movie.images.logos}
          />
          <OverviewSection movie={movie} />
          <CastsSection type="movie" casts={movie.credits.cast as Cast[]} />
          <PhotosSection images={movie.images.backdrops as Image[]} />
          <RelatedSection
            type="movie"
            recommendations={movie.recommendations.results as Movie[]}
            similar={movie.similar.results as Movie[]}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default MovieDetailPage;

import { Movie, TV } from "tmdb-ts/dist/types";

export type ContentType = "movie" | "tv";

export type Params<T> = {
  params: Promise<T>;
};

export type ActionResponse<T = null> = Promise<{
  success: boolean;
  message?: string;
  data?: T;
}>;

export type MovieParam =
  "todayTrending" | "thisWeekTrending" | "popular" | "nowPlaying" | "upcoming" | "topRated";

export type TvShowParam =
  "todayTrending" | "thisWeekTrending" | "popular" | "onTheAir" | "topRated";

/**
 * TMDB list endpoints (popular, on the air, top rated) omit `adult` on TV results,
 * so list items can't be typed as the full `TV` interface.
 */
export type TvShowListItem = Omit<TV, "adult"> & { adult?: boolean };

export type QueryList<T extends Movie | TvShowListItem> = {
  name: string;
  query: () => Promise<{
    page: number;
    results: T[];
    total_results: number;
    total_pages: number;
  }>;
  param: T extends Movie ? MovieParam : TvShowParam;
};

export type SiteConfigType = {
  name: string;
  description: string;
  favicon: string;
  navItems: {
    label: string;
    href: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
  }[];
  queryLists: {
    movies: QueryList<Movie>[];
    tvShows: QueryList<TvShowListItem>[];
  };
  themes: {
    name: "light" | "dark" | "system";
    icon: React.ReactNode;
  }[];
};

export type PlayersProps = {
  title: string;
  source: `https://${string}`;
  origin?: `https://${string}`;
  sandbox?: string;
  healthCheckUrl?: `https://${string}`;
  recommended?: boolean;
  fast?: boolean;
  ads?: boolean;
  resumable?: boolean;
};

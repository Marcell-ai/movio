import { playerProviders } from "@/config/players";
import { PlayersProps } from "@/types";

/**
 * Generates enabled movie players for the provided movie.
 */
export const getMoviePlayers = (id: string | number, startAt?: number): PlayersProps[] =>
  playerProviders.filter(({ enabled }) => enabled).map(({ movie, ...player }) => ({
    ...player,
    source: movie(id, startAt),
    origin: new URL(movie(id, startAt)).origin as `https://${string}`,
  }));

/**
 * Generates enabled TV show players for the provided episode.
 */
export const getTvShowPlayers = (
  id: string | number,
  season: number,
  episode: number,
  startAt?: number,
): PlayersProps[] =>
  playerProviders.filter(({ enabled }) => enabled).map(({ tv, ...player }) => ({
    ...player,
    source: tv(id, season, episode, startAt),
    origin: new URL(tv(id, season, episode, startAt)).origin as `https://${string}`,
  }));

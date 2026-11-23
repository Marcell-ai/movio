import { playerProviders } from "@/config/players";
import { PlayersProps } from "@/types";

const enabledPlayers = playerProviders.filter(({ enabled }) => enabled);

/**
 * Generates enabled movie players for the provided movie.
 */
export const getMoviePlayers = (id: string | number, startAt?: number): PlayersProps[] =>
  enabledPlayers.map(({ movie, ...player }) => ({
    ...player,
    source: movie(id, startAt),
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
  enabledPlayers.map(({ tv, ...player }) => ({
    ...player,
    source: tv(id, season, episode, startAt),
  }));

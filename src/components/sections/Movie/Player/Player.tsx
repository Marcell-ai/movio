import {
  ADS_WARNING_STORAGE_KEY,
  MOVIE_PROVIDER_STORAGE_KEY,
  SpacingClasses,
} from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const MoviePlayerHeader = dynamic(() => import("./Header"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));

interface MoviePlayerProps {
  movie: MovieDetails;
  startAt?: number;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });
  const [preferredProvider, setPreferredProvider] = useLocalStorage<string>({
    key: MOVIE_PROVIDER_STORAGE_KEY,
    defaultValue: "",
    getInitialValueInEffect: false,
  });
  const [playerStatus, setPlayerStatus] = useState<"loading" | "loaded" | "failed">("loading");

  const players = getMoviePlayers(movie.id, startAt);
  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  useEffect(() => {
    if (typeof window === "undefined" || new URL(window.location.href).searchParams.has("src")) return;
    const preferredIndex = players.findIndex(({ title }) => title === preferredProvider);
    if (preferredIndex >= 0) setSelectedSource(preferredIndex);
  }, [players, preferredProvider, setSelectedSource]);

  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tryNextPlayer = useCallback(() => {
    if (players.length < 2) return;
    const nextIndex = (selectedSource + 1) % players.length;
    setPlayerStatus("loading");
    setSelectedSource(nextIndex);
    setPreferredProvider(players[nextIndex].title);
  }, [players, selectedSource, setPreferredProvider, setSelectedSource]);

  const selectProvider = useCallback(
    (index: number) => {
      setPlayerStatus("loading");
      setSelectedSource(index);
      const player = players[index];
      if (player) setPreferredProvider(player.title);
    },
    [players, setPreferredProvider, setSelectedSource],
  );

  useEffect(() => {
    if (!seen) return;

    fallbackTimer.current = setTimeout(() => {
      if (selectedSource === players.length - 1) setPlayerStatus("failed");
      else tryNextPlayer();
    }, 20_000);
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, [PLAYER.source, seen, selectedSource, players.length, tryNextPlayer]);

  return (
    <>
      <AdsWarning />

      <div className={cn("relative", SpacingClasses.reset)}>
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile}
        />
        <Card shadow="md" radius="none" className="relative h-screen">
          <Skeleton className="absolute h-full w-full" />
          {seen && (
            <iframe
              allowFullScreen
              key={PLAYER.title}
              src={PLAYER.source}
              loading="eager"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              title={`${PLAYER.title} video player`}
              referrerPolicy="no-referrer"
              onLoad={() => {
                if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
                setPlayerStatus("loaded");
              }}
              onError={tryNextPlayer}
              className={cn("z-10 h-full", { "pointer-events-none": idle && !mobile })}
            />
          )}
        </Card>
        {seen && playerStatus === "loading" && (
          <div
            role="status"
            className="liquid-glass absolute bottom-6 left-1/2 z-20 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full px-4 py-2 text-sm"
          >
            Loading {PLAYER.title}…
          </div>
        )}
        {seen && playerStatus === "failed" && (
          <div role="alert" className="liquid-glass absolute-center z-30 rounded-2xl p-5 text-center">
            <p className="mb-3 font-semibold">This player could not be loaded.</p>
            <button
              type="button"
              className="rounded-full bg-primary px-4 py-2 text-white"
              onClick={() => selectProvider(0)}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <MoviePlayerSourceSelection
        opened={opened}
        onClose={handlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={selectProvider}
      />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";

export default MoviePlayer;

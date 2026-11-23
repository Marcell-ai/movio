import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Episode, TvShowDetails } from "tmdb-ts";
import useBreakpoints from "@/hooks/useBreakpoints";
import {
  ADS_WARNING_STORAGE_KEY,
  TV_PROVIDER_STORAGE_KEY,
  SpacingClasses,
} from "@/utils/constants";
const AdsWarning = dynamic(() => import("@/components/ui/overlay/AdsWarning"));
const TvShowPlayerHeader = dynamic(() => import("./Header"));
const TvShowPlayerSourceSelection = dynamic(() => import("./SourceSelection"));
const TvShowPlayerEpisodeSelection = dynamic(() => import("./EpisodeSelection"));

export interface TvShowPlayerProps {
  tv: TvShowDetails;
  id: number;
  seriesName: string;
  seasonName: string;
  episode: Episode;
  episodes: Episode[];
  nextEpisodeNumber: number | null;
  prevEpisodeNumber: number | null;
  startAt?: number;
}

const TvShowPlayer: React.FC<TvShowPlayerProps> = ({
  id,
  episode,
  episodes,
  startAt,
  ...props
}) => {
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });
  const [preferredProvider, setPreferredProvider] = useLocalStorage<string>({
    key: TV_PROVIDER_STORAGE_KEY,
    defaultValue: "",
    getInitialValueInEffect: false,
  });
  const [playerStatus, setPlayerStatus] = useState<"loading" | "loaded" | "failed">("loading");
  const [offlineOrigins, setOfflineOrigins] = useState<Set<string>>(() => new Set());
  const attemptedProviders = useRef<Set<number>>(new Set([0]));

  const { mobile } = useBreakpoints();
  const players = getTvShowPlayers(id, episode.season_number, episode.episode_number, startAt);
  const idle = useIdle(3000);
  const [sourceOpened, sourceHandlers] = useDisclosure(false);
  const [episodeOpened, episodeHandlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  useEffect(() => {
    if (typeof window === "undefined" || new URL(window.location.href).searchParams.has("src")) return;
    const preferredIndex = players.findIndex(({ title }) => title === preferredProvider);
    if (preferredIndex >= 0) setSelectedSource(preferredIndex);
  }, [players, preferredProvider, setSelectedSource]);

  useDocumentTitle(
    `Play ${props.seriesName} - ${props.seasonName} - ${episode.name} | ${siteConfig.name}`,
  );

  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/providers/health")
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { providers?: { origin: string; online: boolean }[] } | null) => {
        if (!active || !body?.providers) return;
        setOfflineOrigins(
          new Set(body.providers.filter(({ online }) => !online).map(({ origin }) => origin)),
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const tryNextPlayer = useCallback(() => {
    if (players.length < 2) return;
    let nextIndex = -1;
    for (let offset = 1; offset <= players.length; offset++) {
      const candidate = (selectedSource + offset) % players.length;
      if (
        !attemptedProviders.current.has(candidate) &&
        !offlineOrigins.has(players[candidate].origin ?? "")
      ) {
        nextIndex = candidate;
        break;
      }
    }
    if (nextIndex < 0) {
      setPlayerStatus("failed");
      return;
    }
    attemptedProviders.current.add(nextIndex);
    setPlayerStatus("loading");
    setSelectedSource(nextIndex);
    setPreferredProvider(players[nextIndex].title);
  }, [offlineOrigins, players, selectedSource, setPreferredProvider, setSelectedSource]);

  const selectProvider = useCallback(
    (index: number) => {
      attemptedProviders.current = new Set([index]);
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
        <TvShowPlayerHeader
          id={id}
          episode={episode}
          hidden={idle && !mobile}
          selectedSource={selectedSource}
          onOpenSource={sourceHandlers.open}
          onOpenEpisode={episodeHandlers.open}
          {...props}
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
              className="rounded-full bg-warning px-4 py-2 text-white"
              onClick={() => selectProvider(0)}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <TvShowPlayerSourceSelection
        opened={sourceOpened}
        onClose={sourceHandlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={selectProvider}
      />
      <TvShowPlayerEpisodeSelection
        id={id}
        opened={episodeOpened}
        onClose={episodeHandlers.close}
        episodes={episodes}
      />
    </>
  );
};

export default memo(TvShowPlayer);

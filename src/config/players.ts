import { PlayersProps } from "@/types";

type PlayerSource = PlayersProps["source"];

export type PlayerProvider = Omit<PlayersProps, "source"> & {
  enabled: boolean;
  movie: (id: string | number, startAt?: number) => PlayerSource;
  tv: (id: string | number, season: number, episode: number, startAt?: number) => PlayerSource;
};

const startAtQuery = (startAt?: number) => startAt || "";

export const playerProviders: PlayerProvider[] = [
  {
    title: "VidLink",
    enabled: true,
    movie: (id, startAt) =>
      `https://vidlink.pro/movie/${id}?player=jw&primaryColor=006fee&secondaryColor=a2a2a2&iconColor=eefdec&autoplay=false&startAt=${startAtQuery(startAt)}`,
    tv: (id, season, episode, startAt) =>
      `https://vidlink.pro/tv/${id}/${season}/${episode}?player=jw&primaryColor=f5a524&secondaryColor=a2a2a2&iconColor=eefdec&autoplay=false&startAt=${startAtQuery(startAt)}`,
    recommended: true,
    fast: true,
    ads: true,
    resumable: true,
  },
  {
    title: "VidLink 2",
    enabled: true,
    movie: (id, startAt) =>
      `https://vidlink.pro/movie/${id}?primaryColor=006fee&autoplay=false&startAt=${startAtQuery(startAt)}`,
    tv: (id, season, episode, startAt) =>
      `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=f5a524&autoplay=false&startAt=${startAtQuery(startAt)}`,
    recommended: true,
    fast: true,
    ads: true,
    resumable: true,
  },
  {
    title: "VidKing",
    enabled: true,
    // VidKing's progress parameter can pin playback to the wrong timestamp.
    movie: (id) => `https://www.vidking.net/embed/movie/${id}?color=006fee&autoplay=false`,
    tv: (id, season, episode) =>
      `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=f5a524&autoplay=false`,
    recommended: true,
    fast: true,
    resumable: true,
  },
  {
    title: "<Embed>",
    enabled: true,
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, season, episode) => `https://embed.su/embed/tv/${id}/${season}/${episode}`,
    ads: true,
  },
  {
    title: "SuperEmbed",
    enabled: true,
    movie: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    tv: (id, season, episode) =>
      `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
    fast: true,
    ads: true,
  },
  {
    title: "FilmKu",
    enabled: true,
    movie: (id) => `https://filmku.stream/embed/${id}`,
    tv: (id, season, episode) =>
      `https://filmku.stream/embed/series?tmdb=${id}&sea=${season}&epi=${episode}`,
    ads: true,
  },
  {
    title: "NontonGo",
    enabled: true,
    movie: (id) => `https://www.nontongo.win/embed/movie/${id}`,
    tv: (id, season, episode) => `https://www.NontonGo.win/embed/tv/${id}/${season}/${episode}`,
    ads: true,
  },
  {
    title: "AutoEmbed 1",
    enabled: true,
    movie: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    tv: (id, season, episode) => `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`,
    fast: true,
    ads: true,
  },
  {
    title: "AutoEmbed 2",
    enabled: true,
    movie: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id, season, episode) => `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
    ads: true,
  },
  {
    title: "2Embed",
    enabled: true,
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, season, episode) => `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
    ads: true,
  },
  {
    title: "VidSrc 1",
    enabled: true,
    movie: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`,
    ads: true,
  },
  {
    title: "VidSrc 2",
    enabled: true,
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
    ads: true,
  },
  {
    title: "VidSrc 3",
    enabled: true,
    movie: (id) => `https://vidsrc.icu/embed/movie/${id}`,
    tv: (id, season, episode) => `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`,
    ads: true,
  },
  {
    title: "VidSrc 4",
    enabled: true,
    movie: (id) => `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=false`,
    tv: (id, season, episode) =>
      `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=false`,
    ads: true,
  },
  {
    title: "VidSrc 5",
    enabled: true,
    movie: (id) => `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`,
    tv: (id, season, episode) =>
      `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=false`,
    recommended: true,
    fast: true,
    ads: true,
  },
  {
    title: "MoviesAPI",
    enabled: true,
    movie: (id) => `https://moviesapi.club/movie/${id}`,
    tv: (id, season, episode) => `https://moviesapi.club/tv/${id}-${season}-${episode}`,
    ads: true,
  },
];

// Environment variables
const IS_BROWSER = typeof window !== "undefined";
const IS_SERVER = !IS_BROWSER;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const IS_TEST = process.env.NODE_ENV === "test";

// Storage keys
const DISCLAIMER_STORAGE_KEY = "disclaimer-agreed";
const ADS_WARNING_STORAGE_KEY = "ads-warning-seen";
const SEARCH_HISTORY_STORAGE_KEY = "search-histories";
const MOVIE_PROVIDER_STORAGE_KEY = "preferred-movie-provider";
const TV_PROVIDER_STORAGE_KEY = "preferred-tv-provider";

// Others
const ITEMS_PER_PAGE = 20;
const SpacingClasses = {
  main: "px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-12",
  reset: "-mx-4 -my-6 sm:-mx-6 sm:-my-8 lg:-mx-10 xl:-mx-12",
};

// Exports
export {
  IS_BROWSER,
  IS_SERVER,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_TEST,
  DISCLAIMER_STORAGE_KEY,
  ADS_WARNING_STORAGE_KEY,
  SEARCH_HISTORY_STORAGE_KEY,
  MOVIE_PROVIDER_STORAGE_KEY,
  TV_PROVIDER_STORAGE_KEY,
  ITEMS_PER_PAGE,
  SpacingClasses,
};

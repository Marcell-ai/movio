# Movio

Movio is an open-source movie and TV discovery app built with Next.js. Browse titles, search the TMDB catalog, and launch the available video players. The app does not provide accounts, cloud-synced watchlists, or viewing history.

## Features

- Browse popular, trending, upcoming, and top-rated movies and TV shows.
- Search for titles, actors, and genres.
- Responsive layout with light and dark themes.
- Installable as an app from your browser's install menu (web app manifest). It needs an internet connection; there is no offline mode.

## Technology

- Next.js App Router, React, and TypeScript
- Tailwind CSS and HeroUI
- TanStack Query
- TMDB API

## Run locally

1. Install [Bun](https://bun.sh/).
2. Install dependencies with `bun install`.
3. Start the development server with `bun dev` and open `http://localhost:3000`.
4. On first launch Movio asks for your TMDB token before showing anything. Create a free account at [themoviedb.org](https://www.themoviedb.org/), open [Settings → API](https://www.themoviedb.org/settings/api), and paste the **API Read Access Token** (the long one, not the short API Key).

There is no `.env` file to configure. Each visitor supplies their own token. It is checked with TMDB, then stored in an httpOnly cookie in that browser, so page scripts can't read it and only the app's server sends it to TMDB. It stays saved when you close the app and is renewed every time you use it, so you only enter it once. You can replace or remove it from the About page (or at `/setup`). It is lost only if you clear the site's cookies, browse in a private window, or switch between a browser and an installed copy of the app (they keep separate cookies).

For deployment across multiple serverless instances, optional Upstash Redis credentials can be set:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Without them, API rate limiting uses process-local memory and is not shared across instances.

## Architecture

- The App Router serves the UI and keeps the TMDB token in an httpOnly cookie.
- Browser data requests go through `/api/tmdb/[...path]`, which validates allowed routes and parameters before forwarding requests to TMDB with a timeout.
- Movie and TV player URLs are generated from the enabled provider registry in `src/config/players.ts`. The player page renders the selected provider in a sandboxed iframe, while source selection changes the provider without changing the content route.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.

## License

Movio is distributed under the MIT License. See [LICENSE](LICENSE) for the original copyright notice and terms.

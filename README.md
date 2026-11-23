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
4. On first launch, Movio asks for a TMDB API Read Access Token. Follow the [TMDB API token tutorial](#getting-a-tmdb-api-read-access-token) below, then paste the token into Movio.

## Getting a TMDB API Read Access Token

Movio uses the TMDB API catalog but does not ship a shared TMDB key. Each user supplies their own read access token.

1. Go to [themoviedb.org](https://www.themoviedb.org/) and create a free account.
2. Verify the account email address if TMDB requests it, then sign in.
3. Open your profile menu in the top-right corner.
4. Select **Settings**.
5. Open **API** from the settings sidebar.
6. If API access is not available yet, choose the option to request an API key. Use this app for the **Application Name** and describe it as a movie and TV discovery website.
7. Complete TMDB's API application form. Personal or educational use is usually the appropriate choice for this project.
8. After approval, return to [TMDB Settings → API](https://www.themoviedb.org/settings/api).
9. Copy the **API Read Access Token**. It is a long JWT-style token and normally begins with `eyJ`.

Then:

1. Open Movio.
2. Enter the token on the setup page.
3. Movio validates the token with TMDB and stores it in an httpOnly cookie.

### What to copy

- **Use:** API Read Access Token (Bearer token)
- **Do not use:** the short API Key, account password, or session ID
- A read access token should not be committed to Git or added to a public `.env` file
- To replace or remove it, open **About** in Movio or visit `/setup`

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

# React Movie UI

**A React movie and TV streaming UI starter with TypeScript, TanStack Query and cinematic carousels.**

![Complete hero section and carousel with The Odyssey, Spider-Man: Brand New Day and Toy Story 5](docs/images/hero-high-resolution.jpg)

*Complete hero preview rendered from the project components with the movie artwork included in the demo. Entrance motion is paused for capture, and the view is scaled to include the full header, copy, carousel and navigation.*

[راهنمای فارسی](README.fa.md) · [Asset licenses](CREDITS.md) · [MIT implementation license](LICENSE)

Build a movie discovery interface, explore animated sliders, or adapt the components for your own catalog. This is a complete Vite starter app: clone it, customize it and deploy the static build. No API key is needed to run the demo.

The demo includes movie posters and backdrops, with larger published posters replacing low-resolution thumbnails. Artwork retains its owners' rights and is separate from the implementation's MIT license; see [asset licenses](CREDITS.md) and [poster sources](CATALOG-SOURCES.md#refreshed-poster-sources).

## Features

- Expanding hero carousel with directional transitions, staged text entrances, autoplay, swipe and keyboard controls.
- Curved recommendation carousel with a bright active card and shaded neighboring cards.
- Movie rows moving in opposite directions; short collections display each title once.
- Scroll reveals, pause controls and support for the system's reduced-motion preference.
- Search, category filters and a watchlist persisted in local storage.
- Movie and series detail pages with cast, credits, technical information and related titles.
- Season selection, expandable episode lists and sample video playback.
- Direct title links, refresh and browser Back/Forward navigation.
- TanStack Query caching, request cancellation, response validation, loading, error and retry states.

## Stack

React 19 · TypeScript · TanStack Query 5 · Vite 6 · CSS

Animations use CSS and browser APIs. Navigation uses the History API. Component tests use Testing Library, JSDOM and Node's test runner through `tsx`.

## Quick start

Install a supported Node.js LTS version and npm; the project requires Node.js 20 or newer.

```sh
git clone https://github.com/rihwwn/react-movie-ui.git
cd react-movie-ui
npm ci
npm run dev
```

Open **http://localhost:4173**. No environment variables or backend are required for this demo.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with hot reload |
| `npm test` | Run the behavior and catalog tests |
| `npm run typecheck` | Check TypeScript |
| `npm run build` | Type-check and build into `dist/` |
| `npm run preview` | Serve the production build locally |

Development and preview use the same port. Stop one before starting the other.

## Customize

| File | What to change |
| --- | --- |
| `src/content.ts` | Brand, copy and featured/recommended title IDs |
| `public/catalog.json` | Titles, categories, summaries, ratings and artwork paths |
| `src/titleDetails.ts` | Cast, lead credits, country and demo episode counts |
| `src/styles.css` | Layout, colors, typography, responsive rules and motion |
| `src/components/Carousel.tsx` | Hero and recommendation slider behavior |
| `src/components/TitlePage.tsx` | Details, seasons, episodes and the sample player |
| `src/catalog.ts` | Data types, validation, fetch endpoint and Query configuration |

Keep IDs in `content.ts` and `titleDetails.ts` in sync with the catalog when replacing the demo data. Components and their styles can also be copied into an existing React app; this release does not provide an npm component package.

### Connect your API

The demo fetches `/catalog.json`. A catalog entry has this shape:

```ts
{
  id: 'my-film',
  title: 'My Film',
  image: 'assets/my-film.jpg',
  backdrop: 'assets/my-film-backdrop.jpg', // optional
  year: 2026,
  duration: '1h 45m',
  language: 'English',
  rating: '4.5',
  categories: ['Movies'],
  genre: 'Adventure · Drama',
  description: 'Your licensed catalog summary.'
}
```

Allowed categories are `Movies`, `TV Shows`, `Animation`, `Anime` and `Kids`. IDs must be unique. Local artwork paths must match `assets/<lowercase-letters-and-hyphens>.<svg|jpg|png|webp>`.

Replace `loadCatalog`'s endpoint in `src/catalog.ts` and adapt its validator to your provider's response. Remote image URLs are intentionally rejected by the current local-asset contract; allow only your expected image origins when adapting it. Update `TitlePage.tsx` to use authorized playback URLs instead of the shared sample clip. Keep provider secrets on your server.

### Deploy

Run `npm run build`, then serve **`dist/`** from the root or a subdirectory of a static website. The build uses relative asset URLs; subdirectory deployments must end in `/`. Title URLs use query parameters, for example `/react-movie-ui/?title=dragons`, so title navigation does not require SPA path rewrites.

The catalog, movie artwork, sample video and navigation stay inside the deployment directory.

### Cloudflare Workers from GitHub

The included `wrangler.jsonc` and small TypeScript Worker (`src/worker.ts`) serve `dist/` at **`/react-movie-ui/`** through the standard `ASSETS` binding. The Worker removes the public prefix before fetching assets and keeps redirects inside the demo path. This does not require the account-gated `assets.base_path` feature. Root hosting also works, including on an enabled `workers.dev` URL. No account ID or secret is stored in this repository.

In Cloudflare's **Workers & Pages** dashboard, import the GitHub repository and use these settings:

| Setting | Value |
| --- | --- |
| Git repository | `rihwwn/react-movie-ui` (or your own copy) |
| Production branch | `main` |
| Worker name | `react-movie-ui` |
| Root directory | Repository root; leave blank or use `/` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler@4.158.0 deploy` |
| Node.js version | `24`, selected by the included `.node-version` file |

Cloudflare reads `.node-version` from the repository root, so no Node build variable is needed. See the [Cloudflare build image documentation](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/).

The Worker name must match `name` in `wrangler.jsonc`; change both if you choose another name. Cloudflare installs dependencies from the committed lockfile. After the first deployment, pushes to the connected `main` branch trigger a new build and deployment. If `workers.dev` is enabled, append `/react-movie-ui/` to the dashboard's Worker URL.

Automatic builds require the **Cloudflare Workers and Pages** GitHub App to have access to this repository. If the dashboard says the project is disconnected from your Git account, open **Settings > Builds > Git repository > Manage** and add this repository to the app's existing selection, then save. Selecting repositories individually does not automatically include newly created repositories.

To use a path on an existing Cloudflare domain, open **Domains > Add > Route**, select your domain's zone and add only the project pattern, for example `example.com/react-movie-ui*`. The app will be available at `https://example.com/react-movie-ui/`. The Worker handles the public prefix; do not replace the existing homepage's domain binding. To change the demo path, update `prefix` in `src/worker.ts` and your Route pattern together. Prefix routing runs Worker code for requests, so standard Workers request limits apply. See [Static Assets bindings](https://developers.cloudflare.com/workers/static-assets/binding/) and [Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/).

For a manual deployment on Node.js 22 or newer, build the app, sign in to your own Cloudflare account, then deploy:

```sh
npm run build
npx wrangler@4.158.0 login
npx wrangler@4.158.0 deploy
```

The current app uses query-based title links, so no SPA fallback setting is needed. Credentials and local Wrangler state are ignored by Git. See Cloudflare's [Workers Builds settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) and [Static Assets configuration](https://developers.cloudflare.com/workers/static-assets/binding/) for the deployment contract.

## Demo limits

The 23-title catalog is a manually curated snapshot. Scores, season totals, episode counts and episode runtimes are illustrative, not IMDb/TMDB statistics. Every film and episode plays the same CC0 sample clip; movie artwork does not provide access to the actual films.

Watchlists are stored in the current browser under `react-movie-ui-watchlist`; there is no account or server synchronization. This is a web interface, with no production streaming backend, subscription system, Flutter application or television app included.

## License

The implementation and project favicon are provided under [MIT](LICENSE). Movie artwork, film trademarks and other third-party content are not granted rights by that license. Fonts and video retain their own licenses; see [asset licenses](CREDITS.md) and [catalog sources](CATALOG-SOURCES.md).

## Contributing

Issues and focused pull requests are welcome. Describe the behavior you are changing, include a screenshot or short recording for visual changes, and run `npm test` and `npm run build` before submitting. Never commit API secrets or artwork you do not have permission to redistribute.

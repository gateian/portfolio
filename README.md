# Ian Hamblin portfolio

Source for [ianhamblin.xyz](https://ianhamblin.xyz): a full-screen showreel of
3D and real-time graphics work, technical breakdowns of individual projects,
and several CV variants.

Built with React 18, TypeScript, Vite 6, Emotion and React Router 7. It is
served as static assets from a Cloudflare Worker. Analytics are PostHog,
production builds only.

## Getting started

Needs Node 24 (the version CI uses).

```bash
npm install
npm run dev
```

| Script                  | What it does                                                  |
| ----------------------- | ------------------------------------------------------------- |
| `npm run dev`           | Vite dev server (listens on all interfaces)                   |
| `npm run build`         | Type-check, then build to `dist/`                             |
| `npm run preview`       | Serve the built `dist/` locally                               |
| `npm run lint`          | ESLint over `src/`                                            |
| `npm run format`        | Prettier over `src/`                                          |
| `npm run deploy`        | Build and `wrangler deploy` from your machine                 |
| `npm run build:cv-pdfs` | Regenerate the CV PDFs in `public/cv/` (needs local Chrome)   |

## Routes

| Path                                   | Page                                      |
| -------------------------------------- | ----------------------------------------- |
| `/`                                    | Showreel                                  |
| `/tech/:slug`                          | Technical breakdown, e.g. `/tech/zippy-town` |
| `/about`                               | Background, skills and links              |
| `/cvgraphics`                          | CV: Graphics / Technical Art              |
| `/cvart`, `/cv3d`, `/cvweb`, `/cv`     | Other CV variants                         |

## Where things live

- **Showreel items:** [`src/data/mediaItems.ts`](src/data/mediaItems.ts).
  The first item is the hero clip. At build time it is injected into
  `index.html`, and an inline script there downloads it in full while the
  loading screen is up, so the reel never starts on a clip that can stall.
- **Technical breakdowns:** plain data in
  [`src/data/techBreakdowns/`](src/data/techBreakdowns/types.ts). Add a file
  next to `zippyTown.ts` and register it in `index.ts`. Any detail that hasn't
  been verified yet is a `todo`, and the page shows it as a TODO(Ian) note
  rather than a made-up number.
- **Link previews:** Open Graph / Twitter tags per route in
  [`src/data/routeMeta.ts`](src/data/routeMeta.ts). The build writes a copy of
  `index.html` for each listed route (e.g. `dist/tech/zippy-town.html`), so
  crawlers that don't run JavaScript still get the right preview.
- **Contact details and profile links:** [`src/data/site.ts`](src/data/site.ts).
- **Analytics:** call `track()` from [`src/analytics`](src/analytics/index.ts).
  PostHog loads after the hero clip so it doesn't compete for bandwidth.
  Events fired before then are queued, and tracking never throws.

## Deployment

Pushing to `main` builds, lints and deploys the `ianhamblin-portfolio` Worker
to ianhamblin.xyz through GitHub Actions. Pull requests into `main` get a build
check.

The `v2` branch deploys to its own Worker, `ianhamblin-portfolio-v2`, at
[v2.ianhamblin.xyz](https://v2.ianhamblin.xyz). Before merging v2 into `main`,
switch `wrangler.jsonc`, the trigger branch in `.github/workflows/deploy.yml`
and `SITE_URL` in `src/data/routeMeta.ts` back to production.

Deploys need a `CLOUDFLARE_API_TOKEN` repository secret (the "Edit Cloudflare
Workers" token template).

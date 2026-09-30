# Base44 Dev Environment

## What this project is
A prebuilt static PWA ("トワイライト / Twilight" — AI photo management app, Japanese UI). The entire React app is bundled inline in `index.html` (via a `manus-runtime` script tag) plus hashed assets in `assets/`. There is **no source code and no backend** in this repo — only the production build output.

## How it runs
Served by `nginx:alpine` on port 3000 via `docker-compose.base44.yml`. The repo root is bind-mounted read-only into the container. `nginx.conf` handles SPA fallback, asset caching, and service-worker no-cache headers.

## Known limitations
- The bundle calls a backend tRPC API at `/api/trpc` and an OAuth callback at `/api/oauth/callback` — **no backend exists in this repo**, so API-dependent features (photo upload, tagging, search) will not work.
- References Cloudinary for photo storage and Google Maps for geocoding — these require external credentials not present here.
- The favicon at `/manus-storage/twilight-logo-mark_4a2cd9ff.png` does not exist in the repo (404, cosmetic only).

## Setup quirks
- The repo root directory has `700` permissions by default; nginx's worker user cannot traverse it. Run `chmod 755 /app && chmod -R a+r /app` after cloning if nginx returns 403.

## Verify it works
```sh
docker compose -f docker-compose.base44.yml up -d
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/   # expect 200
```

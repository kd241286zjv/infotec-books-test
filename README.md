# Books catalog frontend

## Local development

Copy `.env.example` to `.env.local` and replace `VITE_API_PROXY_TARGET` with the actual Yii2 backend URL. The example value is only for a locally running backend.

```sh
pnpm install
pnpm dev
```

The browser calls `/api/v1`. During development, Vite proxies every `/api/*` request to `VITE_API_PROXY_TARGET`, avoiding a hardcoded backend host in the frontend.

## Production and GitHub Pages

Set `VITE_API_BASE_URL` at build time to the deployed backend API base URL when it differs from `/api/v1`. If it is omitted or empty, the frontend uses `/api/v1`.

The GitHub Pages workflow uses hash routes and derives the Vite base path from GitHub's `GITHUB_REPOSITORY` value. Configure the repository variable `VITE_API_BASE_URL` in GitHub Actions when a production backend URL is available; it is intentionally not supplied by this repository.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Production (Vercel) environment

The browser talks to same-origin `/api/*` on `https://leaguesports.co.za`. Next.js rewrites unmatched `/api` paths to the Railway Express API so Google OAuth cookies are first-party.

Set these on the Vercel project (Production):

| Variable | Required | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://leaguesports.co.za` |
| `NEXT_PUBLIC_API_URL` | recommended | `https://league-sports-api-production.up.railway.app` |
| `API_ORIGIN` | optional | Same Railway origin. Overrides `NEXT_PUBLIC_API_URL` for the rewrite destination if you ever need them to differ. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | Sanity project id (sitemap + pages) |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Sanity dataset |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | optional | Google Analytics id |
| `ABLY_API_KEY` | if padel realtime is used | Ably API key |
| `SANITY_API_TOKEN` | if venue claim writes | Sanity write token |

Do **not** set `NEXT_PUBLIC_API_URL` to `https://leaguesports.co.za` — that loops the `/api` proxy.

The hardcoded production Railway origin is a fallback **only** when `VERCEL_ENV=production`. Vercel Preview and local `next dev` without `API_ORIGIN` / `RAILWAY_API_URL` / `NEXT_PUBLIC_API_URL` do not proxy or server-fetch production.

On the Railway API (not this repo), keep:

```
GOOGLE_REDIRECT_URI=https://leaguesports.co.za/api/auth/providers/google/callback-url
FRONTEND_URL=https://leaguesports.co.za
```

Google Cloud Console authorized redirect URI must be that same callback URL. Local Next.js routes that are **not** proxied: `/api/matches/:id/events`, `/api/realtime*`, `/api/venues/claim`. Match create/get/lock (`/api/matches`, `/api/matches/:id`, `/api/matches/:id/lock`) are proxied to Railway.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

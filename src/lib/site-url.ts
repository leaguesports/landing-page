const PRODUCTION_SITE_URL = "https://leaguesports.co.za";

/** Canonical origin for sitemap, robots, and absolute links. */
export function getSiteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return PRODUCTION_SITE_URL;
}

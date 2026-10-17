import { sitemapIndexUrl } from "../../app/sitemap/entries.ts";
import { getSiteBaseUrl } from "../site-url.ts";

const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters";

export type GoogleSitemapConfig =
  | { ok: false; reason: string }
  | {
      ok: true;
      email: string;
      key: string;
      siteUrl: string;
      feedUrl: string;
    };

function normalizePrivateKey(key: string): string {
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

function credentialsFromJson(raw: string): { email: string; key: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as {
      client_email?: unknown;
      private_key?: unknown;
    };
    if (typeof parsed.client_email !== "string" || typeof parsed.private_key !== "string") {
      return null;
    }
    const email = parsed.client_email.trim();
    const key = normalizePrivateKey(parsed.private_key.trim());
    if (!email || !key) return null;
    return { email, key };
  } catch {
    return null;
  }
}

function credentialsFromEnv(env: NodeJS.Dict<string>): { email: string; key: string } | null {
  const json = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json?.trim()) {
    const fromJson = credentialsFromJson(json);
    if (fromJson) return fromJson;
  }
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? "";
  const key = normalizePrivateKey(env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim() ?? "");
  if (!email || !key) return null;
  return { email, key };
}

/** Search Console `sitemaps.submit` URL. Both path segments are URL-encoded. */
export function searchConsoleSitemapSubmitUrl(siteUrl: string, feedUrl: string): string {
  return `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedUrl)}`;
}

export function resolveGoogleSitemapConfig(
  env: NodeJS.Dict<string>,
  feedUrl = sitemapIndexUrl(getSiteBaseUrl()),
): GoogleSitemapConfig {
  const siteUrl = env.GSC_SITE_URL?.trim() ?? "";
  const credentials = credentialsFromEnv(env);
  if (!siteUrl || !credentials) {
    return {
      ok: false,
      reason: !siteUrl
        ? "GSC_SITE_URL is not set"
        : "Google service account credentials are not set",
    };
  }
  return {
    ok: true,
    email: credentials.email,
    key: credentials.key,
    siteUrl,
    feedUrl,
  };
}

export async function submitSitemapIndex(
  env: NodeJS.Dict<string>,
  fetchImpl: typeof fetch = fetch,
): Promise<{ submitted: true } | { submitted: false; reason: string }> {
  const config = resolveGoogleSitemapConfig(env);
  if (!config.ok) return { submitted: false, reason: config.reason };

  const { JWT } = await import("google-auth-library");
  const client = new JWT({
    email: config.email,
    key: config.key,
    scopes: [SEARCH_CONSOLE_SCOPE],
  });
  const access = await client.getAccessToken();
  const token = access?.token;
  if (!token) {
    throw new Error("Search Console access token was empty");
  }

  const url = searchConsoleSitemapSubmitUrl(config.siteUrl, config.feedUrl);
  const response = await fetchImpl(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Search Console sitemap submit failed (${response.status})`);
  }
  return { submitted: true };
}

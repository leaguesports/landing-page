import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

export type FixtureFollowStatus = {
  following: boolean;
};

export type FollowedFixture = {
  slug: string;
  createdAt: string;
};

export type FixtureFollowDeps = {
  fetch: typeof fetch;
  /** Browser: site origin. Server: Railway origin. */
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

function requestHeaders(cookie?: string): HeadersInit {
  const headers: Record<string, string> = {};
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function followUrl(baseUrl: string, slug: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/fixtures/${encodeURIComponent(slug)}/follow`;
}

function followedListUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/me/followed-fixtures`;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function parseStatus(body: unknown): FixtureFollowStatus | null {
  if (!body || typeof body !== "object") return null;
  const row = body as Record<string, unknown>;
  if (typeof row.following !== "boolean") return null;
  return { following: row.following };
}

function parseFollowedFixtures(body: unknown): FollowedFixture[] {
  if (!body || typeof body !== "object") return [];
  const fixtures = (body as { fixtures?: unknown }).fixtures;
  if (!Array.isArray(fixtures)) return [];
  const out: FollowedFixture[] = [];
  for (const item of fixtures) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.slug !== "string" || typeof row.createdAt !== "string") {
      continue;
    }
    out.push({ slug: row.slug, createdAt: row.createdAt });
  }
  return out;
}

/** 401 (signed out) and 404 (API not deployed) must not fail the page. */
function isSoftFailStatus(status: number): boolean {
  return status === 401 || status === 404;
}

export async function getFixtureFollowStatusWith(
  slug: string,
  deps: FixtureFollowDeps,
): Promise<FixtureFollowStatus | null> {
  const id = slug.trim();
  if (!id || !deps.baseUrl) return null;

  const res = await invokeFetch(deps.fetch, followUrl(deps.baseUrl, id), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (isSoftFailStatus(res.status) || !res.ok) return null;
  return parseStatus(await readJson(res));
}

export async function followFixtureWith(
  slug: string,
  deps: FixtureFollowDeps,
): Promise<FixtureFollowStatus | null> {
  const id = slug.trim();
  if (!id || !deps.baseUrl) return null;

  const res = await invokeFetch(deps.fetch, followUrl(deps.baseUrl, id), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (isSoftFailStatus(res.status) || !res.ok) return null;
  return parseStatus(await readJson(res)) ?? { following: true };
}

export async function unfollowFixtureWith(
  slug: string,
  deps: FixtureFollowDeps,
): Promise<FixtureFollowStatus | null> {
  const id = slug.trim();
  if (!id || !deps.baseUrl) return null;

  const res = await invokeFetch(deps.fetch, followUrl(deps.baseUrl, id), {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (isSoftFailStatus(res.status) || !res.ok) return null;
  return parseStatus(await readJson(res)) ?? { following: false };
}

export async function listFollowedFixturesWith(
  deps: FixtureFollowDeps,
): Promise<FollowedFixture[]> {
  if (!deps.baseUrl) return [];

  const res = await invokeFetch(deps.fetch, followedListUrl(deps.baseUrl), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (isSoftFailStatus(res.status) || !res.ok) return [];
  return parseFollowedFixtures(await readJson(res));
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

/** Browser helpers — same-origin `/api` proxy. */
export async function getFixtureFollowStatus(
  slug: string,
): Promise<FixtureFollowStatus | null> {
  if (!isApiConfigured()) return null;
  try {
    return await getFixtureFollowStatusWith(slug, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return null;
  }
}

export async function followFixture(
  slug: string,
): Promise<FixtureFollowStatus | null> {
  if (!isApiConfigured()) return null;
  try {
    return await followFixtureWith(slug, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return null;
  }
}

export async function unfollowFixture(
  slug: string,
): Promise<FixtureFollowStatus | null> {
  if (!isApiConfigured()) return null;
  try {
    return await unfollowFixtureWith(slug, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return null;
  }
}

export async function listFollowedFixtures(options: {
  cookie?: string;
} = {}): Promise<FollowedFixture[]> {
  if (!isApiConfigured()) return [];
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : getRailwayApiOrigin();
    return await listFollowedFixturesWith({
      fetch,
      baseUrl,
      cookie: options.cookie,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return [];
  }
}

import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { attemptEnsureVenueFromCmsWith } from "./appVenueApi.ts";

export type VenueFollowStatus = {
  following: boolean;
  venueCmsId: string;
};

export type FollowedVenue = {
  id: string;
  cmsId: string;
  name: string;
  slug: string;
  followedAt: string;
};

export type VenueFollowDeps = {
  fetch: typeof fetch;
  /** Browser: site origin. Server: Railway origin. */
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type VenueIdentity = {
  cmsId: string;
  name: string;
  slug: string;
};

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function followUrl(baseUrl: string, cmsId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/venues/${encodeURIComponent(cmsId)}/follow`;
}

function followedListUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/me/followed-venues`;
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

function parseStatus(body: unknown): VenueFollowStatus | null {
  if (!body || typeof body !== "object") return null;
  const row = body as Record<string, unknown>;
  if (typeof row.following !== "boolean" || typeof row.venueCmsId !== "string") {
    return null;
  }
  return { following: row.following, venueCmsId: row.venueCmsId };
}

function parseFollowedVenues(body: unknown): FollowedVenue[] {
  if (!body || typeof body !== "object") return [];
  const venues = (body as { venues?: unknown }).venues;
  if (!Array.isArray(venues)) return [];
  const out: FollowedVenue[] = [];
  for (const item of venues) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (
      typeof row.id !== "string" ||
      typeof row.cmsId !== "string" ||
      typeof row.name !== "string" ||
      typeof row.slug !== "string" ||
      typeof row.followedAt !== "string"
    ) {
      continue;
    }
    out.push({
      id: row.id,
      cmsId: row.cmsId,
      name: row.name,
      slug: row.slug,
      followedAt: row.followedAt,
    });
  }
  return out;
}

export async function getVenueFollowStatusWith(
  cmsId: string,
  deps: VenueFollowDeps,
): Promise<VenueFollowStatus | null> {
  const id = cmsId.trim();
  if (!id || !deps.baseUrl) return null;

  const res = await invokeFetch(deps.fetch, followUrl(deps.baseUrl, id), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) return null;
  return parseStatus(await readJson(res));
}

export async function followVenueWith(
  venue: VenueIdentity,
  deps: VenueFollowDeps,
): Promise<VenueFollowStatus | null> {
  const cmsId = venue.cmsId.trim();
  const name = venue.name.trim();
  const slug = venue.slug.trim();
  if (!cmsId || !name || !slug || !deps.baseUrl) return null;

  const ensured = await attemptEnsureVenueFromCmsWith(
    { cmsId, name, slug },
    {
      fetch: deps.fetch,
      baseUrl: deps.baseUrl,
      cookie: deps.cookie,
      signal: deps.signal,
    },
  );
  if (!ensured.ok) return null;

  const res = await invokeFetch(deps.fetch, followUrl(deps.baseUrl, cmsId), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (!res.ok) return null;
  return parseStatus(await readJson(res)) ?? {
    following: true,
    venueCmsId: cmsId,
  };
}

export async function unfollowVenueWith(
  cmsId: string,
  deps: VenueFollowDeps,
): Promise<VenueFollowStatus | null> {
  const id = cmsId.trim();
  if (!id || !deps.baseUrl) return null;

  const res = await invokeFetch(deps.fetch, followUrl(deps.baseUrl, id), {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (!res.ok) return null;
  return parseStatus(await readJson(res)) ?? {
    following: false,
    venueCmsId: id,
  };
}

export async function listFollowedVenuesWith(
  deps: VenueFollowDeps,
): Promise<FollowedVenue[]> {
  if (!deps.baseUrl) return [];

  const res = await invokeFetch(deps.fetch, followedListUrl(deps.baseUrl), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
  });

  if (!res.ok) return [];
  return parseFollowedVenues(await readJson(res));
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

/** Browser helpers — same-origin `/api` proxy. */
export async function getVenueFollowStatus(
  cmsId: string,
): Promise<VenueFollowStatus | null> {
  if (!isApiConfigured()) return null;
  try {
    return await getVenueFollowStatusWith(cmsId, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return null;
  }
}

export async function followVenue(
  venue: VenueIdentity,
): Promise<VenueFollowStatus | null> {
  if (!isApiConfigured()) return null;
  try {
    return await followVenueWith(venue, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return null;
  }
}

export async function unfollowVenue(
  cmsId: string,
): Promise<VenueFollowStatus | null> {
  if (!isApiConfigured()) return null;
  try {
    return await unfollowVenueWith(cmsId, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return null;
  }
}

export async function listFollowedVenues(options: {
  cookie?: string;
} = {}): Promise<FollowedVenue[]> {
  if (!isApiConfigured()) return [];
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : getRailwayApiOrigin();
    return await listFollowedVenuesWith({
      fetch,
      baseUrl,
      cookie: options.cookie,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return [];
  }
}

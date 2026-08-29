import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";

export type AppVenue = {
  id: string;
  cmsId: string;
  name: string;
  slug: string;
};

export type EnsureVenueInput = {
  cmsId: string;
  name: string;
  slug: string;
};

export type EnsureVenueDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

function venueUrl(baseUrl: string, cmsId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/venues/${encodeURIComponent(cmsId)}`;
}

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function parseAppVenue(value: unknown): AppVenue | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.cmsId !== "string" ||
    typeof row.name !== "string" ||
    typeof row.slug !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    cmsId: row.cmsId,
    name: row.name,
    slug: row.slug,
  };
}

/**
 * GET lookup, PUT create-if-missing only after 404.
 * Never PUT on a successful GET. Failures return null.
 */
export async function ensureVenueFromCmsWith(
  input: EnsureVenueInput,
  deps: EnsureVenueDeps,
): Promise<AppVenue | null> {
  const cmsId = input.cmsId.trim();
  const name = input.name.trim();
  const slug = input.slug.trim();
  if (!cmsId || !name || !slug || !deps.baseUrl) return null;

  const url = venueUrl(deps.baseUrl, cmsId);

  let lookup: Response;
  try {
    lookup = await deps.fetch(url, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
  } catch {
    return null;
  }

  if (lookup.status === 200) {
    return parseAppVenue(await lookup.json().catch(() => null));
  }

  if (lookup.status !== 404) {
    return null;
  }

  try {
    const created = await deps.fetch(url, {
      method: "PUT",
      cache: "no-store",
      credentials: "include",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify({ name, slug }),
      signal: deps.signal,
    });
    if (created.status !== 200 && created.status !== 201) {
      return null;
    }
    return parseAppVenue(await created.json().catch(() => null));
  } catch {
    return null;
  }
}

/** Page-load ensure. Never throws; missing API config is a no-op. */
export async function ensureVenueFromCms(
  input: EnsureVenueInput,
  options: { cookie?: string } = {},
): Promise<AppVenue | null> {
  if (!isApiConfigured()) return null;

  try {
    return await ensureVenueFromCmsWith(input, {
      fetch,
      baseUrl: getRailwayApiOrigin(),
      cookie: options.cookie,
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    return null;
  }
}

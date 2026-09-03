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

export type EnsureVenueAttempt = {
  ok: boolean;
  status: number;
  body: unknown;
  venue: AppVenue | null;
  networkError: boolean;
  /** Present when `networkError` is true — underlying `fetch` failure. */
  networkCause?: string;
  /** Request URL that failed when `networkError` is true. */
  networkUrl?: string;
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

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function missingInputAttempt(): EnsureVenueAttempt {
  return {
    ok: false,
    status: 400,
    body: { error: "Venue slug is required" },
    venue: null,
    networkError: false,
  };
}

function networkCauseMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return "Failed to fetch";
}

function networkAttempt(url: string, err: unknown): EnsureVenueAttempt {
  const cause = networkCauseMessage(err);
  return {
    ok: false,
    status: 0,
    body: { error: "Match API is unreachable (network error)." },
    venue: null,
    networkError: true,
    networkCause: cause,
    networkUrl: url,
  };
}

/**
 * GET lookup, PUT create-if-missing only after 404.
 * Never PUT on a successful GET.
 * 200/201 with an unparseable body is still ok (venue null) so match
 * create can POST with venueCmsId.
 */
export async function attemptEnsureVenueFromCmsWith(
  input: EnsureVenueInput,
  deps: EnsureVenueDeps,
): Promise<EnsureVenueAttempt> {
  const cmsId = input.cmsId.trim();
  const name = input.name.trim();
  const slug = input.slug.trim();
  if (!cmsId || !name || !slug || !deps.baseUrl) return missingInputAttempt();

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
  } catch (err) {
    return networkAttempt(url, err);
  }

  const lookupBody = await readBody(lookup);
  if (lookup.status === 200) {
    const venue = parseAppVenue(lookupBody);
    if (!venue) {
      console.warn(
        "[venues] GET /api/venues/:cmsId succeeded but body was not a parseable AppVenue",
        lookupBody,
      );
    }
    return {
      ok: true,
      status: 200,
      body: lookupBody,
      venue,
      networkError: false,
    };
  }

  if (lookup.status !== 404) {
    return {
      ok: false,
      status: lookup.status,
      body: lookupBody,
      venue: null,
      networkError: false,
    };
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
    const createdBody = await readBody(created);
    if (created.status !== 200 && created.status !== 201) {
      return {
        ok: false,
        status: created.status,
        body: createdBody,
        venue: null,
        networkError: false,
      };
    }
    const venue = parseAppVenue(createdBody);
    if (!venue) {
      console.warn(
        "[venues] PUT /api/venues/:cmsId succeeded but body was not a parseable AppVenue",
        createdBody,
      );
    }
    return {
      ok: true,
      status: created.status,
      body: createdBody,
      venue,
      networkError: false,
    };
  } catch (err) {
    return networkAttempt(url, err);
  }
}

/**
 * GET lookup, PUT create-if-missing only after 404.
 * Never PUT on a successful GET. Failures return null.
 */
export async function ensureVenueFromCmsWith(
  input: EnsureVenueInput,
  deps: EnsureVenueDeps,
): Promise<AppVenue | null> {
  const attempt = await attemptEnsureVenueFromCmsWith(input, deps);
  return attempt.venue;
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

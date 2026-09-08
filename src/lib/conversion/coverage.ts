/**
 * Coverage notify intents — thin “tell us when this city/sport fills in”
 * payload builders. Posts to the Railway API via same-origin `/api`.
 *
 * Email is sent to the API and never returned. Do not put email in GA params.
 */

export const COVERAGE_CREATE_PATH = "/api/intents/coverage" as const;
export const COVERAGE_UNSUBSCRIBE_PATH =
  "/api/intents/coverage/unsubscribe" as const;

/** Explicit Railway rewrite sources. Unsubscribe before the create path. */
export const COVERAGE_PROXY_SOURCES = [
  COVERAGE_CREATE_PATH,
  COVERAGE_UNSUBSCRIBE_PATH,
] as const;

export const COVERAGE_SPORTS = ["padel", "golf", "darts"] as const;
export type CoverageSport = (typeof COVERAGE_SPORTS)[number];

export type CoverageIntentInput = {
  email: string;
  sport?: string | null;
  city?: string | null;
  sourcePage?: string | null;
};

export type CoverageIntentPayload = {
  email: string;
  sport?: CoverageSport;
  city?: string;
  sourcePage?: string;
};

export type PublicCoverageIntent = {
  id: string;
  sport: CoverageSport | null;
  city: string | null;
  sourcePage: string | null;
  createdAt: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SOURCE_PAGE_MAX = 500;
const CITY_MAX = 80;

export function isCoverageSport(value: unknown): value is CoverageSport {
  return value === "padel" || value === "golf" || value === "darts";
}

export function normalizeCoverageEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return null;
  return email;
}

export function normalizeCoverageCity(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const city = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (!city || city.length > CITY_MAX) return undefined;
  return city;
}

export function normalizeCoverageSourcePage(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const raw = value.trim();
  if (!raw) return undefined;
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const url = new URL(raw);
      const path = `${url.pathname}${url.search}`;
      return path.slice(0, SOURCE_PAGE_MAX);
    }
  } catch {
    return undefined;
  }
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw.slice(0, SOURCE_PAGE_MAX);
}

export function normalizeCoverageSport(
  value: unknown,
): CoverageSport | undefined {
  if (typeof value !== "string") return undefined;
  const sport = value.trim().toLowerCase();
  return isCoverageSport(sport) ? sport : undefined;
}

/**
 * Build a POST body for `/api/intents/coverage`.
 * Unknown sports are omitted (API only stores padel / golf / darts).
 * Returns null when the email is invalid.
 */
export function buildCoveragePayload(
  input: CoverageIntentInput,
): CoverageIntentPayload | null {
  const email = normalizeCoverageEmail(input.email);
  if (!email) return null;

  const payload: CoverageIntentPayload = { email };
  const sport = normalizeCoverageSport(input.sport);
  const city = normalizeCoverageCity(input.city);
  const sourcePage = normalizeCoverageSourcePage(input.sourcePage);
  if (sport) payload.sport = sport;
  if (city) payload.city = city;
  if (sourcePage) payload.sourcePage = sourcePage;
  return payload;
}

export function buildCoverageUnsubscribePayload(
  token: unknown,
): { token: string } | null {
  if (typeof token !== "string") return null;
  const value = token.trim();
  if (!value) return null;
  return { token: value };
}

/** Public intent snapshot — never includes email. */
export function parseCoverageIntentResponse(
  body: unknown,
): PublicCoverageIntent | null {
  if (!body || typeof body !== "object") return null;
  const intent = (body as { intent?: unknown }).intent;
  if (!intent || typeof intent !== "object") return null;
  const row = intent as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id) return null;
  if ("email" in row) {
    delete row.email;
  }
  return {
    id: row.id,
    sport: isCoverageSport(row.sport) ? row.sport : null,
    city: typeof row.city === "string" && row.city ? row.city : null,
    sourcePage:
      typeof row.sourcePage === "string" && row.sourcePage
        ? row.sourcePage
        : null,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : "",
  };
}

export function coverageHonestyCopy(input: {
  sportName?: string | null;
  cityName?: string | null;
}): string {
  const sport = input.sportName?.trim();
  const city = input.cityName?.trim();
  if (sport && city) {
    return `We don't list venues we haven't verified. No fake ${sport} listings in ${city}.`;
  }
  if (city) {
    return `We don't list venues we haven't verified. No invented listings in ${city}.`;
  }
  if (sport) {
    return `We don't list venues we haven't verified. No fake ${sport} listings.`;
  }
  return "We don't list venues we haven't verified. No invented listings.";
}

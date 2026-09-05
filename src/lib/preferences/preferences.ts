import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

export type UserPreferences = {
  sports: string[];
  activeSport: string | null;
  onboardingCompletedAt: string | null;
  onboardingSkippedAt: string | null;
};

export type UpdatePreferencesInput = {
  sports?: string[];
  activeSport?: string | null;
  completeOnboarding?: boolean;
  skipOnboarding?: boolean;
};

export type PreferencesDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function preferencesUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/me/preferences`;
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

function parsePreferences(body: unknown): UserPreferences | null {
  if (!body || typeof body !== "object") return null;
  const row = body as Record<string, unknown>;
  if (!Array.isArray(row.sports)) return null;
  const sports = row.sports.filter((item): item is string => typeof item === "string");
  return {
    sports,
    activeSport: typeof row.activeSport === "string" ? row.activeSport : null,
    onboardingCompletedAt:
      typeof row.onboardingCompletedAt === "string"
        ? row.onboardingCompletedAt
        : null,
    onboardingSkippedAt:
      typeof row.onboardingSkippedAt === "string"
        ? row.onboardingSkippedAt
        : null,
  };
}

export function emptyPreferences(): UserPreferences {
  return {
    sports: [],
    activeSport: null,
    onboardingCompletedAt: null,
    onboardingSkippedAt: null,
  };
}

export function needsOnboarding(prefs: UserPreferences): boolean {
  return !prefs.onboardingCompletedAt && !prefs.onboardingSkippedAt;
}

export type PreferencesResult =
  | { ok: true; preferences: UserPreferences }
  | { ok: false; error: string; status: number };

export async function getPreferencesWith(
  deps: PreferencesDeps,
): Promise<PreferencesResult> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, preferencesUrl(deps.baseUrl), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Could not load preferences (${res.status})`,
        status: res.status,
      };
    }

    const preferences = parsePreferences(await readJson(res));
    if (!preferences) {
      return { ok: false, error: "Unexpected preferences response", status: 500 };
    }
    return { ok: true, preferences };
  } catch {
    return { ok: false, error: "Could not reach preferences API", status: 0 };
  }
}

export async function updatePreferencesWith(
  input: UpdatePreferencesInput,
  deps: PreferencesDeps,
): Promise<PreferencesResult> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, preferencesUrl(deps.baseUrl), {
      method: "PUT",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(input),
      signal: deps.signal,
    });

    const body = await readJson(res);
    if (!res.ok) {
      const error =
        body &&
        typeof body === "object" &&
        typeof (body as { error?: unknown }).error === "string"
          ? (body as { error: string }).error
          : `Could not save preferences (${res.status})`;
      return { ok: false, error, status: res.status };
    }

    const preferences = parsePreferences(body);
    if (!preferences) {
      return { ok: false, error: "Unexpected preferences response", status: 500 };
    }
    return { ok: true, preferences };
  } catch {
    return { ok: false, error: "Could not reach preferences API", status: 0 };
  }
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

export async function getPreferences(options: {
  cookie?: string;
} = {}): Promise<PreferencesResult> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : getRailwayApiOrigin();
  return getPreferencesWith({
    fetch,
    baseUrl,
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

export async function updatePreferences(
  input: UpdatePreferencesInput,
): Promise<PreferencesResult> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await updatePreferencesWith(input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach preferences API", status: 0 };
  }
}

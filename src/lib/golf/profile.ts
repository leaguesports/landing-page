import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { getSiteBaseUrl } from "../site-url.ts";
import {
  parseGolfHandicapIndex,
  parseOptionalGolfHandicapIndex,
} from "./handicap.ts";

export const GOLF_HANDICAP_PROFILE_PATHS = [
  "/api/auth/me",
  "/api/me/profile",
] as const;

export type GolfProfile = {
  id: string;
  golfHandicapIndex: number | null;
};

export type GolfProfileResult =
  | { ok: true; profile: GolfProfile }
  | { ok: false; error: string; status: number };

export type GolfProfileDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
};

function requestBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getRailwayApiOrigin() || getSiteBaseUrl();
}

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
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

function apiError(body: unknown, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}

export function parseGolfProfile(value: unknown): GolfProfile | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  const handicap = parseOptionalGolfHandicapIndex(row.golfHandicapIndex);
  return {
    id: row.id.trim(),
    golfHandicapIndex: handicap === undefined ? null : handicap,
  };
}

async function requestProfile(
  method: "GET" | "PATCH",
  deps: GolfProfileDeps,
  body?: unknown,
): Promise<GolfProfileResult> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  let last: GolfProfileResult = {
    ok: false,
    error: "Golf profile API is unavailable",
    status: 0,
  };

  for (const path of GOLF_HANDICAP_PROFILE_PATHS) {
    const url = `${deps.baseUrl.replace(/\/$/, "")}${path}`;
    try {
      const res = await invokeFetch(deps.fetch, url, {
        method,
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, method === "PATCH"),
        body: method === "PATCH" ? JSON.stringify(body) : undefined,
      });
      const payload = await readJson(res);
      if (res.status === 404 || res.status === 405) {
        last = {
          ok: false,
          error: apiError(payload, `Could not ${method} ${path}`),
          status: res.status,
        };
        continue;
      }
      if (!res.ok) {
        return {
          ok: false,
          error: apiError(payload, `Could not ${method} golf handicap (${res.status})`),
          status: res.status,
        };
      }
      const profile = parseGolfProfile(payload);
      if (!profile) {
        return {
          ok: false,
          error: "Unexpected golf profile response",
          status: 502,
        };
      }
      return { ok: true, profile };
    } catch {
      last = { ok: false, error: "Could not reach golf profile API", status: 0 };
    }
  }

  return last;
}

export async function getGolfProfileWith(
  deps: GolfProfileDeps,
): Promise<GolfProfileResult> {
  return requestProfile("GET", deps);
}

export async function patchGolfHandicapIndexWith(
  value: number | null,
  deps: GolfProfileDeps,
): Promise<GolfProfileResult> {
  const parsed = parseGolfHandicapIndex(value);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, status: 400 };
  }
  return requestProfile("PATCH", deps, { golfHandicapIndex: parsed.value });
}

export async function getGolfProfile(): Promise<GolfProfileResult> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return getGolfProfileWith({ fetch, baseUrl: requestBase() });
}

export async function patchGolfHandicapIndex(
  value: number | null,
): Promise<GolfProfileResult> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return patchGolfHandicapIndexWith(value, { fetch, baseUrl: requestBase() });
}

/**
 * Apply a one-round HI override for seated players (API snapshots profile HI).
 * Restores the previous profile value after `run` unless this was a first set.
 */
export async function withRoundHandicapOverride<T>(
  profileHi: number | null,
  roundHi: number | null,
  run: () => Promise<T>,
  deps?: GolfProfileDeps,
): Promise<T> {
  const same =
    profileHi === roundHi ||
    (profileHi == null && roundHi == null);
  if (same) return run();

  const client = deps ?? { fetch, baseUrl: requestBase() };
  const firstSet = profileHi == null && roundHi != null;
  const patched = await patchGolfHandicapIndexWith(roundHi, client);
  if (!patched.ok) {
    throw new Error(patched.error);
  }

  try {
    return await run();
  } finally {
    if (!firstSet) {
      await patchGolfHandicapIndexWith(profileHi, client);
    }
  }
}

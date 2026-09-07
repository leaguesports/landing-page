import { invokeFetch } from "../../invoke-fetch.ts";

const FETCH_TIMEOUT_MS = 8_000;
const USER_AGENT = "leaguesports-fixture-ingest/1.0";

export async function fetchJson(
  url: string,
  init: RequestInit = {},
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const headers = new Headers(init.headers);
  if (!headers.has("user-agent")) headers.set("user-agent", USER_AGENT);
  if (!headers.has("accept")) headers.set("accept", "application/json");

  const res = await invokeFetch(fetchImpl, url, {
    ...init,
    headers,
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  return { ok: res.ok, status: res.status, body };
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function mapProviderStatus(
  raw: string | null | undefined,
): "scheduled" | "live" | "final" {
  const value = (raw ?? "").toLowerCase().replace(/[_\s]+/g, "");
  if (
    /^(ft|aet|pen|finished|final|completed|ended|fulltime|afterextratime)$/.test(
      value,
    )
  ) {
    return "final";
  }
  if (
    /^(1h|2h|et|ht|live|inplay|inprogress|started|racing|qualifying|sprint)$/.test(
      value,
    ) ||
    value.includes("live") ||
    value.includes("inplay") ||
    value.includes("progress")
  ) {
    return "live";
  }
  return "scheduled";
}

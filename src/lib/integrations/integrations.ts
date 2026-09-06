import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

export const GENERIC_IMPORT_PROVIDER_ID = "generic-import";

/** Never render these — even if the catalog flags flip. */
export const HIDDEN_PROVIDER_IDS = ["trackman", "autodarts"] as const;

export const INTEGRATION_SPORTS = ["padel", "golf", "other"] as const;
export type IntegrationSport = (typeof INTEGRATION_SPORTS)[number];

export const INTEGRATION_STATUSES = ["connected", "disconnected"] as const;
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];

export type ImportedSession = {
  id: string;
  sport: IntegrationSport;
  playedAt: string;
  title: string | null;
};

export type IntegrationProvider = {
  id: string;
  name: string;
  description: string;
  available: boolean;
  comingSoon: boolean;
  status: IntegrationStatus;
  lastSyncedAt: string | null;
  importedSessionCount: number;
  connectedAt: string | null;
  disconnectedAt: string | null;
  credentialMasked: string | null;
  lastImportedSession: ImportedSession | null;
};

export type IntegrationsSnapshot = {
  providers: IntegrationProvider[];
};

export type IntegrationsDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type IntegrationsResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

export type ConnectIntegrationInput = {
  token?: string;
};

export type SyncSessionInput = {
  sport: IntegrationSport;
  playedAt: string;
  title?: string;
  notes?: string;
  metrics?: Record<string, string | number>;
};

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function rootUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/me/integrations`;
}

function providerUrl(baseUrl: string, providerId: string): string {
  return `${rootUrl(baseUrl)}/${encodeURIComponent(providerId)}`;
}

function connectUrl(baseUrl: string, providerId: string): string {
  return `${providerUrl(baseUrl, providerId)}/connect`;
}

function syncUrl(baseUrl: string, providerId: string): string {
  return `${providerUrl(baseUrl, providerId)}/sync`;
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

function errorFromBody(body: unknown, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}

export function isIntegrationSport(value: unknown): value is IntegrationSport {
  return (
    value === "padel" || value === "golf" || value === "other"
  );
}

function isIntegrationStatus(value: unknown): value is IntegrationStatus {
  return value === "connected" || value === "disconnected";
}

function isHiddenProviderId(id: string): boolean {
  return (HIDDEN_PROVIDER_IDS as readonly string[]).includes(id);
}

/**
 * Product rule: only surface connectable providers.
 * Trackman / Autodarts stay hidden even if the API catalog lists them.
 */
export function isConnectableProvider(
  provider: Pick<IntegrationProvider, "id" | "available" | "comingSoon">,
): boolean {
  if (isHiddenProviderId(provider.id)) return false;
  return provider.available === true && provider.comingSoon === false;
}

export function parseImportedSession(value: unknown): ImportedSession | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !isIntegrationSport(row.sport) ||
    typeof row.playedAt !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    sport: row.sport,
    playedAt: row.playedAt,
    title: typeof row.title === "string" ? row.title : null,
  };
}

export function parseIntegrationProvider(
  value: unknown,
): IntegrationProvider | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    typeof row.description !== "string" ||
    typeof row.available !== "boolean" ||
    typeof row.comingSoon !== "boolean" ||
    !isIntegrationStatus(row.status) ||
    typeof row.importedSessionCount !== "number" ||
    !Number.isFinite(row.importedSessionCount)
  ) {
    return null;
  }

  const lastImported =
    row.lastImportedSession === null || row.lastImportedSession === undefined
      ? null
      : parseImportedSession(row.lastImportedSession);
  if (row.lastImportedSession != null && !lastImported) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    available: row.available,
    comingSoon: row.comingSoon,
    status: row.status,
    lastSyncedAt: typeof row.lastSyncedAt === "string" ? row.lastSyncedAt : null,
    importedSessionCount: row.importedSessionCount,
    connectedAt: typeof row.connectedAt === "string" ? row.connectedAt : null,
    disconnectedAt:
      typeof row.disconnectedAt === "string" ? row.disconnectedAt : null,
    credentialMasked:
      typeof row.credentialMasked === "string" ? row.credentialMasked : null,
    lastImportedSession: lastImported,
  };
}

export function emptyIntegrationsSnapshot(): IntegrationsSnapshot {
  return { providers: [] };
}

export function parseIntegrationsSnapshot(body: unknown): IntegrationsSnapshot {
  if (!body || typeof body !== "object") {
    return emptyIntegrationsSnapshot();
  }
  const rows = (body as { providers?: unknown }).providers;
  if (!Array.isArray(rows)) return emptyIntegrationsSnapshot();
  return {
    providers: rows
      .map(parseIntegrationProvider)
      .filter((item): item is IntegrationProvider => !!item)
      .filter(isConnectableProvider),
  };
}

function parseProviderResponse(body: unknown): IntegrationProvider | null {
  if (!body || typeof body !== "object") return null;
  const provider = parseIntegrationProvider(
    (body as { provider?: unknown }).provider,
  );
  if (!provider || !isConnectableProvider(provider)) return null;
  return provider;
}

/** Migration lag / unconfigured API — treat as empty, never crash the hub. */
export function isIntegrationsSoftFailure(status: number): boolean {
  return status === 0 || status === 404 || status === 503;
}

/** Real connection copy only — never “Active” for a disconnected provider. */
export function formatProviderStatus(status: IntegrationStatus): string {
  return status === "connected" ? "Connected" : "Not connected";
}

export function formatImportedSessionCount(count: number): string {
  return count === 1 ? "1 session imported" : `${count} sessions imported`;
}

export function formatSessionSport(sport: IntegrationSport): string {
  if (sport === "padel") return "Padel";
  if (sport === "golf") return "Golf";
  return "Other";
}

export function formatLastSyncedAt(
  iso: string | null,
  now: Date = new Date(),
): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;

  const diffMs = now.getTime() - parsed.getTime();
  if (diffMs < 60_000) return "just now";
  if (diffMs < 3_600_000) {
    const mins = Math.max(1, Math.round(diffMs / 60_000));
    return `${mins}m ago`;
  }
  if (diffMs < 48 * 3_600_000) {
    const hrs = Math.max(1, Math.round(diffMs / 3_600_000));
    return `${hrs}h ago`;
  }
  return parsed.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

export function upsertProvider(
  providers: ReadonlyArray<IntegrationProvider>,
  next: IntegrationProvider,
): IntegrationProvider[] {
  if (!isConnectableProvider(next)) {
    return providers.filter((row) => row.id !== next.id);
  }
  const rest = providers.filter((row) => row.id !== next.id);
  return [next, ...rest];
}

export function buildSyncPayload(input: {
  sport: string;
  playedAt: string;
  title?: string;
}): IntegrationsResult<SyncSessionInput> {
  if (!isIntegrationSport(input.sport)) {
    return { ok: false, error: "Choose a sport", status: 400 };
  }
  const playedAt = input.playedAt.trim();
  if (!playedAt) {
    return { ok: false, error: "Enter when you played", status: 400 };
  }
  const date = new Date(playedAt);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Enter a valid date", status: 400 };
  }
  const title = input.title?.trim();
  return {
    ok: true,
    value: {
      sport: input.sport,
      playedAt: date.toISOString(),
      ...(title ? { title } : {}),
    },
  };
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

export async function listIntegrationsWith(
  deps: IntegrationsDeps,
): Promise<IntegrationsResult<IntegrationsSnapshot>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, rootUrl(deps.baseUrl), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Could not load integrations (${res.status})`,
        status: res.status,
      };
    }

    return { ok: true, value: parseIntegrationsSnapshot(await readJson(res)) };
  } catch {
    return { ok: false, error: "Could not reach integrations API", status: 0 };
  }
}

export async function connectIntegrationWith(
  providerId: string,
  input: ConnectIntegrationInput,
  deps: IntegrationsDeps,
): Promise<IntegrationsResult<IntegrationProvider>> {
  const trimmed = providerId.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing provider id", status: 400 };
  }
  if (isHiddenProviderId(trimmed)) {
    return { ok: false, error: "Provider is not available", status: 409 };
  }

  const payload: Record<string, string> = {};
  const token = input.token?.trim();
  if (token) payload.token = token;

  try {
    const res = await invokeFetch(deps.fetch, connectUrl(deps.baseUrl, trimmed), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(payload),
      signal: deps.signal,
    });

    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, "Could not connect provider"),
        status: res.status,
      };
    }

    const provider = parseProviderResponse(body);
    if (!provider) {
      return { ok: false, error: "Unexpected integrations response", status: 500 };
    }
    return { ok: true, value: provider };
  } catch {
    return { ok: false, error: "Could not reach integrations API", status: 0 };
  }
}

export async function disconnectIntegrationWith(
  providerId: string,
  deps: IntegrationsDeps,
): Promise<IntegrationsResult<IntegrationProvider>> {
  const trimmed = providerId.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing provider id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, providerUrl(deps.baseUrl, trimmed), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, "Could not disconnect provider"),
        status: res.status,
      };
    }

    const provider = parseProviderResponse(body);
    if (!provider) {
      return { ok: false, error: "Unexpected integrations response", status: 500 };
    }
    return { ok: true, value: provider };
  } catch {
    return { ok: false, error: "Could not reach integrations API", status: 0 };
  }
}

export async function syncIntegrationWith(
  providerId: string,
  input: SyncSessionInput,
  deps: IntegrationsDeps,
): Promise<IntegrationsResult<IntegrationProvider>> {
  const trimmed = providerId.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing provider id", status: 400 };
  }
  if (isHiddenProviderId(trimmed)) {
    return { ok: false, error: "Provider is not available", status: 409 };
  }

  try {
    const res = await invokeFetch(deps.fetch, syncUrl(deps.baseUrl, trimmed), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(input),
      signal: deps.signal,
    });

    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, "Could not sync session"),
        status: res.status,
      };
    }

    const provider = parseProviderResponse(body);
    if (!provider) {
      return { ok: false, error: "Unexpected integrations response", status: 500 };
    }
    return { ok: true, value: provider };
  } catch {
    return { ok: false, error: "Could not reach integrations API", status: 0 };
  }
}

export async function listIntegrationsResult(options: {
  cookie?: string;
} = {}): Promise<IntegrationsResult<IntegrationsSnapshot>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return listIntegrationsWith({
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

/** RSC-friendly helper: empty snapshot on 401 / 404 / 503 / network failure. */
export async function listIntegrations(options: {
  cookie?: string;
} = {}): Promise<IntegrationsSnapshot> {
  const result = await listIntegrationsResult(options);
  return result.ok ? result.value : emptyIntegrationsSnapshot();
}

export async function connectIntegration(
  providerId: string,
  input: ConnectIntegrationInput = {},
): Promise<IntegrationsResult<IntegrationProvider>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await connectIntegrationWith(providerId, input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach integrations API", status: 0 };
  }
}

export async function disconnectIntegration(
  providerId: string,
): Promise<IntegrationsResult<IntegrationProvider>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await disconnectIntegrationWith(providerId, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Could not reach integrations API", status: 0 };
  }
}

export async function syncIntegration(
  providerId: string,
  input: SyncSessionInput,
): Promise<IntegrationsResult<IntegrationProvider>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await syncIntegrationWith(providerId, input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach integrations API", status: 0 };
  }
}

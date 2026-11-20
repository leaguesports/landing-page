import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

export type RecordSessionEventInput = {
  type: string;
  data?: unknown;
  participantId?: string | null;
};

export type RecordSessionInput = {
  sport: string;
  config: unknown;
  venueId?: string | null;
  events?: RecordSessionEventInput[];
};

export type RecordedSession = {
  id: string;
  sport: string;
  config: unknown;
  status: string;
  venueId: string | null;
  lobbyId: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecordSessionSuccess = {
  session: RecordedSession;
  state: unknown;
  events: { seq: number; type: string; data: unknown; participantId: string | null }[];
};

export type RecordSessionDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type RecordSessionResult =
  | { ok: true; value: RecordSessionSuccess }
  | { ok: false; error: string; status: number };

function requestHeaders(cookie?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function recordUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/sessions/record`;
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

function parseSession(value: unknown): RecordedSession | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.sport !== "string" ||
    typeof row.status !== "string" ||
    typeof row.createdAt !== "string" ||
    typeof row.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    sport: row.sport,
    config: row.config,
    status: row.status,
    venueId: typeof row.venueId === "string" ? row.venueId : null,
    lobbyId: typeof row.lobbyId === "string" ? row.lobbyId : null,
    endedAt: typeof row.endedAt === "string" ? row.endedAt : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseEvents(
  value: unknown,
): RecordSessionSuccess["events"] | null {
  if (!Array.isArray(value)) return null;
  const events: RecordSessionSuccess["events"] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    if (typeof row.seq !== "number" || typeof row.type !== "string") return null;
    events.push({
      seq: row.seq,
      type: row.type,
      data: row.data,
      participantId: typeof row.participantId === "string" ? row.participantId : null,
    });
  }
  return events;
}

export function parseRecordSessionResponse(body: unknown): RecordSessionSuccess | null {
  if (!body || typeof body !== "object") return null;
  const row = body as Record<string, unknown>;
  const session = parseSession(row.session);
  const events = parseEvents(row.events);
  if (!session || !events) return null;
  return { session, state: row.state, events };
}

export async function recordSessionWith(
  input: RecordSessionInput,
  deps: RecordSessionDeps,
): Promise<RecordSessionResult> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  const res = await invokeFetch(deps.fetch, recordUrl(deps.baseUrl), {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: requestHeaders(deps.cookie),
    signal: deps.signal,
    body: JSON.stringify({
      sport: input.sport,
      config: input.config,
      venueId: input.venueId ?? null,
      events: input.events ?? [],
    }),
  });

  const body = await readJson(res);
  if (!res.ok) {
    return {
      ok: false,
      error: errorFromBody(body, "Could not record session"),
      status: res.status,
    };
  }

  const parsed = parseRecordSessionResponse(body);
  if (!parsed) {
    return { ok: false, error: "Unexpected record response", status: 500 };
  }
  return { ok: true, value: parsed };
}

/** Browser helper: same-origin `/api/sessions/record`. */
export async function recordSession(
  input: RecordSessionInput,
): Promise<RecordSessionResult> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : getRailwayApiOrigin();
  return recordSessionWith(input, { fetch, baseUrl });
}

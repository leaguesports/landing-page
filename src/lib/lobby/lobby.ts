import { getRailwayApiOrigin } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { hubOrganisedGameHref } from "../sports/hub-ia.ts";

export const LOBBY_HREF = "/lobby" as const;

export const LOBBY_SPORTS = ["padel", "darts", "golf"] as const;
export type LobbySport = (typeof LOBBY_SPORTS)[number];

export const LOBBY_SKILLS = ["casual", "intermediate", "competitive"] as const;
export type LobbySkill = (typeof LOBBY_SKILLS)[number];

export const LOBBY_OPEN_STATUSES = [
  "open",
  "filled",
  "cancelled",
  "expired",
] as const;
export type LobbyOpenGameStatus = (typeof LOBBY_OPEN_STATUSES)[number];

export const LOBBY_PROPOSAL_STATUSES = [
  "pending",
  "accepted",
  "expired",
  "cancelled",
] as const;
export type LobbyProposalStatus = (typeof LOBBY_PROPOSAL_STATUSES)[number];

export const LOBBY_PROPOSAL_RESPONSES = ["pending", "accept", "pass"] as const;
export type LobbyProposalResponse = (typeof LOBBY_PROPOSAL_RESPONSES)[number];

export const LOBBY_CONVERSION_BLOCKED = [
  "venue_required",
  "venue_not_found",
  "unsupported_sport",
] as const;
export type LobbyConversionBlocked = (typeof LOBBY_CONVERSION_BLOCKED)[number];

/** GA funnel events for lobby v1 — no PII. */
export const LOBBY_GA_EVENTS = [
  "lobby_looking_on",
  "lobby_post_open",
  "lobby_join",
  "lobby_propose_shown",
  "lobby_propose_accept",
] as const;
export type LobbyGaEvent = (typeof LOBBY_GA_EVENTS)[number];

export const LOBBY_PARTY_SIZE_MIN = 1;
export const LOBBY_PARTY_SIZE_MAX = 3;

/**
 * Explicit Railway rewrite sources. Static segments (`looking`,
 * `open-games`, `proposals`) must precede any `:id` catch-alls.
 */
export const LOBBY_PROXY_SOURCES = [
  "/api/lobby",
  "/api/lobby/looking",
  "/api/lobby/open-games",
  "/api/lobby/open-games/:id/join",
  "/api/lobby/open-games/:id/kick",
  "/api/lobby/proposals",
  "/api/lobby/proposals/:id/accept",
  "/api/lobby/proposals/:id/pass",
] as const;

export type PublicLobbyLooking = {
  id: string;
  firstName: string;
  sport: LobbySport;
  windowStart: string;
  windowEnd: string;
  city: string;
  area: string | null;
};

export type PublicOwnLooking = PublicLobbyLooking & {
  partySize: number;
  skill: LobbySkill | null;
  venueCmsId: string | null;
  expiresAt: string;
};

export type PublicLobbyOpenGame = {
  id: string;
  firstName: string;
  sport: LobbySport;
  windowStart: string;
  windowEnd: string;
  city: string;
  area: string | null;
  slotsNeeded: number;
  slotsFilled: number;
  slotsRemaining: number;
};

export type PublicOwnOpenGame = PublicLobbyOpenGame & {
  status: LobbyOpenGameStatus;
  venueCmsId: string | null;
  skill: LobbySkill | null;
  organiseGameId: string | null;
  source: "lobby";
  conversionBlocked: LobbyConversionBlocked | null;
};

export type PublicProposalMember = {
  firstName: string;
  partySize: number;
  response: LobbyProposalResponse;
  isYou: boolean;
};

export type PublicProposal = {
  id: string;
  sport: LobbySport;
  city: string;
  area: string | null;
  windowStart: string;
  windowEnd: string;
  status: LobbyProposalStatus;
  organiseGameId: string | null;
  source: "lobby";
  conversionBlocked: LobbyConversionBlocked | null;
  members: PublicProposalMember[];
};

export type LobbyListSnapshot = {
  lookings: PublicLobbyLooking[];
  openGames: PublicLobbyOpenGame[];
  viewer: { looking: PublicOwnLooking | null };
};

export type LobbyListFilters = {
  sport?: string | null;
  city?: string | null;
};

export type SetLookingInput = {
  sport: LobbySport;
  windowStart: string;
  windowEnd: string;
  city: string;
  area?: string | null;
  venueCmsId?: string | null;
  partySizeWithMe?: number;
  skill?: LobbySkill | null;
};

export type CreateOpenGameInput = SetLookingInput & {
  slotsNeeded?: number;
};

export type LobbyDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type LobbyResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

export type ConversionBlockedCta = {
  reason: LobbyConversionBlocked;
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type LookingTtlDisplay = {
  on: boolean;
  expired: boolean;
  remainingMs: number;
  label: string;
  statusLabel: string;
};

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

function lobbyRoot(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/lobby`;
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

function errorFromBody(body: unknown, status: number, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    const detail = (body as { error: string }).error.trim();
    if (detail) return formatLobbyError(status, detail);
  }
  return formatLobbyError(status, fallback);
}

export function formatLobbyError(status: number, message?: string | null): string {
  const detail = message?.trim() ?? "";
  if (status === 401) return "Sign in to continue.";
  if (status === 403) return detail || "Only the host can do that.";
  if (status === 404) return detail || "That lobby item was not found.";
  if (status === 400) return detail || "Check the details and try again.";
  if (status === 409) return detail || "That lobby action is no longer available.";
  if (status === 503) return detail || "Lobby is temporarily unavailable.";
  return detail || "Could not update the lobby.";
}

export function isLobbySport(value: unknown): value is LobbySport {
  return (
    typeof value === "string" &&
    (LOBBY_SPORTS as readonly string[]).includes(value)
  );
}

export function isLobbySkill(value: unknown): value is LobbySkill {
  return (
    typeof value === "string" &&
    (LOBBY_SKILLS as readonly string[]).includes(value)
  );
}

export function isLobbyConversionBlocked(
  value: unknown,
): value is LobbyConversionBlocked {
  return (
    typeof value === "string" &&
    (LOBBY_CONVERSION_BLOCKED as readonly string[]).includes(value)
  );
}

export function isLobbyGaEvent(value: unknown): value is LobbyGaEvent {
  return (
    typeof value === "string" &&
    (LOBBY_GA_EVENTS as readonly string[]).includes(value)
  );
}

export function canOrganiseLobbySport(sport: LobbySport): boolean {
  return sport === "padel" || sport === "golf";
}

export function defaultSlotsNeeded(sport: LobbySport): number {
  if (sport === "darts") return 2;
  return 4;
}

export function slotsNeededRange(sport: LobbySport): {
  min: number;
  max: number;
  defaultValue: number;
} {
  if (sport === "golf") return { min: 2, max: 4, defaultValue: 4 };
  const n = defaultSlotsNeeded(sport);
  return { min: n, max: n, defaultValue: n };
}

export function normalizeLobbySport(value: unknown): LobbySport | "" {
  if (typeof value !== "string") return "";
  const sport = value.trim().toLowerCase();
  return isLobbySport(sport) ? sport : "";
}

export function normalizeLobbyCity(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function buildLobbyListQuery(filters: LobbyListFilters = {}): string {
  const params = new URLSearchParams();
  const sport = normalizeLobbySport(filters.sport);
  const city = normalizeLobbyCity(filters.city);
  if (sport) params.set("sport", sport);
  if (city) params.set("city", city);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function applyLobbyFilters<
  T extends { sport: string; city: string },
>(items: readonly T[], filters: LobbyListFilters = {}): T[] {
  const sport = normalizeLobbySport(filters.sport);
  const city = normalizeLobbyCity(filters.city).toLowerCase();
  return items.filter((item) => {
    if (sport && item.sport !== sport) return false;
    if (city && item.city.trim().toLowerCase() !== city) return false;
    return true;
  });
}

export function filterLobbySnapshot(
  snapshot: LobbyListSnapshot,
  filters: LobbyListFilters = {},
): LobbyListSnapshot {
  return {
    lookings: applyLobbyFilters(snapshot.lookings, filters),
    openGames: applyLobbyFilters(snapshot.openGames, filters),
    viewer: snapshot.viewer,
  };
}

export function hubLobbyHref(
  query: {
    sport?: string | null;
    city?: string | null;
    intent?: "looking" | "open" | null;
    proposal?: string | null;
  } = {},
): string {
  const params = new URLSearchParams();
  const sport = normalizeLobbySport(query.sport);
  const city = normalizeLobbyCity(query.city);
  if (sport) params.set("sport", sport);
  if (city) params.set("city", city);
  if (query.intent === "looking" || query.intent === "open") {
    params.set("intent", query.intent);
  }
  const proposal = query.proposal?.trim() ?? "";
  if (proposal) params.set("proposal", proposal);
  const qs = params.toString();
  return qs ? `${LOBBY_HREF}?${qs}` : LOBBY_HREF;
}

export function hubLobbyProposalHref(id: string): string {
  return hubLobbyHref({ proposal: id });
}

export const LOBBY_INBOX_TYPES = [
  "lobby_open_game_compatible",
  "lobby_open_game_joined",
  "lobby_open_game_filled",
  "lobby_proposal_ready",
] as const;

export function isLobbyInboxType(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (LOBBY_INBOX_TYPES as readonly string[]).includes(value)
  );
}

/** Deep-link a lobby notification to Organise, a proposal, or the list. */
export function lobbyInboxHref(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return LOBBY_HREF;
  const row = payload as Record<string, unknown>;
  const organise = lobbyOrganiseHandoffHref(
    typeof row.organiseGameId === "string" ? row.organiseGameId : null,
  );
  if (organise) return organise;
  if (typeof row.proposalId === "string" && row.proposalId.trim()) {
    return hubLobbyProposalHref(row.proposalId);
  }
  const sport = normalizeLobbySport(row.sport);
  const city = typeof row.city === "string" ? row.city : "";
  return hubLobbyHref({ sport, city });
}

/** Organise detail from a lobby fill / accept. Null when conversion blocked. */
export function lobbyOrganiseHandoffHref(
  organiseGameId: string | null | undefined,
): string | null {
  if (typeof organiseGameId !== "string") return null;
  const trimmed = organiseGameId.trim();
  if (!trimmed) return null;
  return hubOrganisedGameHref(trimmed);
}

export function isLobbySourceNote(notes: string | null | undefined): boolean {
  if (!notes) return false;
  return /\bsource\s*=\s*lobby\b/i.test(notes);
}

export function lobbyGameStartParams(sport: LobbySport): {
  page_type: "organise";
  sport: LobbySport;
  source: "lobby";
} {
  return { page_type: "organise", sport, source: "lobby" };
}

export function formatLookingTtl(
  expiresAt: string,
  now: Date = new Date(),
): LookingTtlDisplay {
  const end = new Date(expiresAt);
  if (Number.isNaN(end.getTime())) {
    return {
      on: false,
      expired: true,
      remainingMs: 0,
      label: "Expiry unknown",
      statusLabel: "Looking off",
    };
  }
  const remainingMs = end.getTime() - now.getTime();
  if (remainingMs <= 0) {
    return {
      on: false,
      expired: true,
      remainingMs: 0,
      label: "Expired",
      statusLabel: "Looking expired",
    };
  }

  const minutes = Math.floor(remainingMs / 60_000);
  const hours = Math.floor(minutes / 60);
  let label: string;
  if (minutes < 1) label = "Expires in under a minute";
  else if (minutes < 60) {
    label = `Expires in ${minutes} min`;
  } else if (hours < 24) {
    label = hours === 1 ? "Expires in 1 hour" : `Expires in ${hours} hours`;
  } else {
    const days = Math.floor(hours / 24);
    label = days === 1 ? "Expires in 1 day" : `Expires in ${days} days`;
  }

  return {
    on: true,
    expired: false,
    remainingMs,
    label,
    statusLabel: `Looking ON · ${label.toLowerCase()}`,
  };
}

export function conversionBlockedCtas(
  reason: LobbyConversionBlocked | string | null | undefined,
  opts: { sport?: LobbySport | null; city?: string | null } = {},
): ConversionBlockedCta {
  const sport = opts.sport ?? null;
  const city = opts.city?.trim() || null;
  const venueHref = sport
    ? `/venues?sport=${encodeURIComponent(sport)}${city ? `&city=${encodeURIComponent(city)}` : ""}`
    : "/venues";
  const shareHref = hubLobbyHref({ sport, city });

  if (reason === "unsupported_sport") {
    return {
      reason: "unsupported_sport",
      title: "Organise isn’t available for this sport yet",
      body: "You’re matched, but darts can’t start an organised game here. Invite friends to play, or pick a padel or golf venue.",
      primaryLabel: "Invite friends",
      primaryHref: shareHref,
      secondaryLabel: "Find a venue",
      secondaryHref: venueHref,
    };
  }
  if (reason === "venue_not_found") {
    return {
      reason: "venue_not_found",
      title: "That venue isn’t on LeagueSports",
      body: "The lobby filled, but we couldn’t find the venue to organise. We won’t invent one. Invite friends or pick a listed venue.",
      primaryLabel: "Invite friends",
      primaryHref: shareHref,
      secondaryLabel: "Pick a venue",
      secondaryHref: venueHref,
    };
  }
  return {
    reason: "venue_required",
    title: "A venue is needed to organise",
    body: "The lobby filled, but Organise needs a venue. We won’t invent one. Invite friends or pick a listed venue.",
    primaryLabel: "Invite friends",
    primaryHref: shareHref,
    secondaryLabel: "Pick a venue",
    secondaryHref: venueHref,
  };
}

export function needNMoreCopy(slotsRemaining: number): string {
  const n = Math.max(0, Math.floor(slotsRemaining));
  if (n <= 0) return "Game is full";
  if (n === 1) return "Need 1 more";
  return `Need ${n} more`;
}

export function lobbyEmptyCopy(filters: LobbyListFilters = {}): {
  title: string;
  body: string;
} {
  const sport = normalizeLobbySport(filters.sport);
  const city = normalizeLobbyCity(filters.city);
  const where = [sport, city].filter(Boolean).join(" in ");
  return {
    title: where ? `Be first for ${where}` : "Be the first in the lobby",
    body: "No one is looking yet. Set Looking or post an open game — we’ll notify you when a spot is free.",
  };
}

export function buildLobbyWhatsAppShare(input: {
  kind: "open" | "looking" | "need_more";
  sport: LobbySport;
  city: string;
  slotsRemaining?: number;
  origin?: string;
}): { text: string; href: string; pageUrl: string } {
  const origin = (input.origin ?? "").replace(/\/$/, "");
  const pageUrl = `${origin}${hubLobbyHref({
    sport: input.sport,
    city: input.city,
  })}`;
  const sportLabel =
    input.sport === "padel"
      ? "padel"
      : input.sport === "golf"
        ? "golf"
        : "darts";
  const city = input.city.trim() || "your city";
  let text: string;
  if (input.kind === "need_more") {
    text = `${needNMoreCopy(input.slotsRemaining ?? 1)} for ${sportLabel} in ${city}\n${pageUrl}`;
  } else if (input.kind === "looking") {
    text = `Looking for a ${sportLabel} game in ${city}\n${pageUrl}`;
  } else {
    text = `Looking for players — ${sportLabel} in ${city}\n${pageUrl}`;
  }
  return {
    text,
    pageUrl,
    href: `https://wa.me/?text=${encodeURIComponent(text)}`,
  };
}

function isIso(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function parseLookingBase(row: Record<string, unknown>): PublicLobbyLooking | null {
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  if (typeof row.firstName !== "string" || !row.firstName.trim()) return null;
  if (!isLobbySport(row.sport)) return null;
  if (!isIso(row.windowStart) || !isIso(row.windowEnd)) return null;
  if (typeof row.city !== "string" || !row.city.trim()) return null;
  return {
    id: row.id,
    firstName: row.firstName,
    sport: row.sport,
    windowStart: row.windowStart,
    windowEnd: row.windowEnd,
    city: row.city,
    area: typeof row.area === "string" && row.area.trim() ? row.area : null,
  };
}

export function parsePublicLooking(value: unknown): PublicLobbyLooking | null {
  if (!value || typeof value !== "object") return null;
  return parseLookingBase(value as Record<string, unknown>);
}

export function parseOwnLooking(value: unknown): PublicOwnLooking | null {
  const base = parsePublicLooking(value);
  if (!base || !value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.partySize !== "number" || !Number.isInteger(row.partySize)) {
    return null;
  }
  if (!isIso(row.expiresAt)) return null;
  return {
    ...base,
    partySize: row.partySize,
    skill: isLobbySkill(row.skill) ? row.skill : null,
    venueCmsId: typeof row.venueCmsId === "string" ? row.venueCmsId : null,
    expiresAt: row.expiresAt,
  };
}

export function parsePublicOpenGame(value: unknown): PublicLobbyOpenGame | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  if (typeof row.firstName !== "string" || !row.firstName.trim()) return null;
  if (!isLobbySport(row.sport)) return null;
  if (!isIso(row.windowStart) || !isIso(row.windowEnd)) return null;
  if (typeof row.city !== "string" || !row.city.trim()) return null;
  if (typeof row.slotsNeeded !== "number" || typeof row.slotsFilled !== "number") {
    return null;
  }
  if (typeof row.slotsRemaining !== "number") return null;
  return {
    id: row.id,
    firstName: row.firstName,
    sport: row.sport,
    windowStart: row.windowStart,
    windowEnd: row.windowEnd,
    city: row.city,
    area: typeof row.area === "string" && row.area.trim() ? row.area : null,
    slotsNeeded: row.slotsNeeded,
    slotsFilled: row.slotsFilled,
    slotsRemaining: row.slotsRemaining,
  };
}

export function parseOwnOpenGame(value: unknown): PublicOwnOpenGame | null {
  const base = parsePublicOpenGame(value);
  if (!base || !value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.status !== "string" ||
    !(LOBBY_OPEN_STATUSES as readonly string[]).includes(row.status)
  ) {
    return null;
  }
  return {
    ...base,
    status: row.status as LobbyOpenGameStatus,
    venueCmsId: typeof row.venueCmsId === "string" ? row.venueCmsId : null,
    skill: isLobbySkill(row.skill) ? row.skill : null,
    organiseGameId:
      typeof row.organiseGameId === "string" && row.organiseGameId.trim()
        ? row.organiseGameId
        : null,
    source: "lobby",
    conversionBlocked: isLobbyConversionBlocked(row.conversionBlocked)
      ? row.conversionBlocked
      : null,
  };
}

export function parseProposalMember(value: unknown): PublicProposalMember | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.firstName !== "string" || !row.firstName.trim()) return null;
  if (typeof row.partySize !== "number") return null;
  if (
    typeof row.response !== "string" ||
    !(LOBBY_PROPOSAL_RESPONSES as readonly string[]).includes(row.response)
  ) {
    return null;
  }
  return {
    firstName: row.firstName,
    partySize: row.partySize,
    response: row.response as LobbyProposalResponse,
    isYou: row.isYou === true,
  };
}

export function parseProposal(value: unknown): PublicProposal | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  if (!isLobbySport(row.sport)) return null;
  if (typeof row.city !== "string" || !row.city.trim()) return null;
  if (!isIso(row.windowStart) || !isIso(row.windowEnd)) return null;
  if (
    typeof row.status !== "string" ||
    !(LOBBY_PROPOSAL_STATUSES as readonly string[]).includes(row.status)
  ) {
    return null;
  }
  const members = Array.isArray(row.members)
    ? row.members.map(parseProposalMember).filter((item): item is PublicProposalMember =>
        Boolean(item),
      )
    : [];
  return {
    id: row.id,
    sport: row.sport,
    city: row.city,
    area: typeof row.area === "string" && row.area.trim() ? row.area : null,
    windowStart: row.windowStart,
    windowEnd: row.windowEnd,
    status: row.status as LobbyProposalStatus,
    organiseGameId:
      typeof row.organiseGameId === "string" && row.organiseGameId.trim()
        ? row.organiseGameId
        : null,
    source: "lobby",
    conversionBlocked: isLobbyConversionBlocked(row.conversionBlocked)
      ? row.conversionBlocked
      : null,
    members,
  };
}

export function parseLobbyListSnapshot(value: unknown): LobbyListSnapshot {
  if (!value || typeof value !== "object") {
    return { lookings: [], openGames: [], viewer: { looking: null } };
  }
  const row = value as Record<string, unknown>;
  const lookings = Array.isArray(row.lookings)
    ? row.lookings.map(parsePublicLooking).filter((item): item is PublicLobbyLooking =>
        Boolean(item),
      )
    : [];
  const openGames = Array.isArray(row.openGames)
    ? row.openGames.map(parsePublicOpenGame).filter((item): item is PublicLobbyOpenGame =>
        Boolean(item),
      )
    : [];
  const viewer =
    row.viewer && typeof row.viewer === "object"
      ? (row.viewer as { looking?: unknown })
      : {};
  return {
    lookings,
    openGames,
    viewer: { looking: parseOwnLooking(viewer.looking) },
  };
}

export function emptyLobbySnapshot(): LobbyListSnapshot {
  return { lookings: [], openGames: [], viewer: { looking: null } };
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

async function readOkJson<T>(
  res: Response,
  parse: (body: unknown) => T | null,
  fallback: string,
): Promise<LobbyResult<T>> {
  const body = await readJson(res);
  if (!res.ok) {
    return {
      ok: false,
      error: errorFromBody(body, res.status, fallback),
      status: res.status,
    };
  }
  const value = parse(body);
  if (value == null) {
    return { ok: false, error: "Unexpected lobby response", status: 500 };
  }
  return { ok: true, value };
}

export async function listLobbyWith(
  filters: LobbyListFilters,
  deps: LobbyDeps,
): Promise<LobbyResult<LobbyListSnapshot>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    const res = await invokeFetch(
      deps.fetch,
      `${lobbyRoot(deps.baseUrl)}${buildLobbyListQuery(filters)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readOkJson(res, parseLobbyListSnapshot, "Could not load the lobby");
  } catch {
    return { ok: false, error: "Could not reach the lobby API", status: 0 };
  }
}

export async function setLookingWith(
  input: SetLookingInput,
  deps: LobbyDeps,
): Promise<LobbyResult<{ looking: PublicOwnLooking; proposals: PublicProposal[] }>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    const res = await invokeFetch(deps.fetch, `${lobbyRoot(deps.baseUrl)}/looking`, {
      method: "POST",
      credentials: "include",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(input),
      signal: deps.signal,
    });
    return readOkJson(
      res,
      (body) => {
        if (!body || typeof body !== "object") return null;
        const looking = parseOwnLooking((body as { looking?: unknown }).looking);
        if (!looking) return null;
        const raw = (body as { proposals?: unknown }).proposals;
        const proposals = Array.isArray(raw)
          ? raw.map(parseProposal).filter((item): item is PublicProposal => Boolean(item))
          : [];
        return { looking, proposals };
      },
      "Could not set Looking",
    );
  } catch {
    return { ok: false, error: "Could not reach the lobby API", status: 0 };
  }
}

export async function clearLookingWith(
  deps: LobbyDeps,
): Promise<LobbyResult<{ ok: true; cleared: boolean }>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    const res = await invokeFetch(deps.fetch, `${lobbyRoot(deps.baseUrl)}/looking`, {
      method: "DELETE",
      credentials: "include",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    return readOkJson(
      res,
      (body) => {
        if (!body || typeof body !== "object") return { ok: true as const, cleared: true };
        const cleared = (body as { cleared?: unknown }).cleared;
        return { ok: true as const, cleared: cleared !== false };
      },
      "Could not clear Looking",
    );
  } catch {
    return { ok: false, error: "Could not reach the lobby API", status: 0 };
  }
}

export async function createOpenGameWith(
  input: CreateOpenGameInput,
  deps: LobbyDeps,
): Promise<LobbyResult<{ openGame: PublicOwnOpenGame }>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    const res = await invokeFetch(
      deps.fetch,
      `${lobbyRoot(deps.baseUrl)}/open-games`,
      {
        method: "POST",
        credentials: "include",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(input),
        signal: deps.signal,
      },
    );
    return readOkJson(
      res,
      (body) => {
        if (!body || typeof body !== "object") return null;
        const openGame = parseOwnOpenGame((body as { openGame?: unknown }).openGame);
        return openGame ? { openGame } : null;
      },
      "Could not post an open game",
    );
  } catch {
    return { ok: false, error: "Could not reach the lobby API", status: 0 };
  }
}

export async function joinOpenGameWith(
  id: string,
  input: { partySizeWithMe?: number },
  deps: LobbyDeps,
): Promise<LobbyResult<{ openGame: PublicOwnOpenGame }>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing open game", status: 400 };
  }
  try {
    const res = await invokeFetch(
      deps.fetch,
      `${lobbyRoot(deps.baseUrl)}/open-games/${encodeURIComponent(trimmed)}/join`,
      {
        method: "POST",
        credentials: "include",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(input),
        signal: deps.signal,
      },
    );
    return readOkJson(
      res,
      (body) => {
        if (!body || typeof body !== "object") return null;
        const openGame = parseOwnOpenGame((body as { openGame?: unknown }).openGame);
        return openGame ? { openGame } : null;
      },
      "Could not join that open game",
    );
  } catch {
    return { ok: false, error: "Could not reach the lobby API", status: 0 };
  }
}

export async function kickOpenGameWith(
  id: string,
  userId: string,
  deps: LobbyDeps,
): Promise<LobbyResult<{ openGame: PublicOwnOpenGame }>> {
  const gameId = id.trim();
  const target = userId.trim();
  if (!gameId || !target || !deps.baseUrl) {
    return { ok: false, error: "Missing player to remove", status: 400 };
  }
  try {
    const res = await invokeFetch(
      deps.fetch,
      `${lobbyRoot(deps.baseUrl)}/open-games/${encodeURIComponent(gameId)}/kick`,
      {
        method: "POST",
        credentials: "include",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify({ userId: target }),
        signal: deps.signal,
      },
    );
    return readOkJson(
      res,
      (body) => {
        if (!body || typeof body !== "object") return null;
        const openGame = parseOwnOpenGame((body as { openGame?: unknown }).openGame);
        return openGame ? { openGame } : null;
      },
      "Could not remove that player",
    );
  } catch {
    return { ok: false, error: "Could not reach the lobby API", status: 0 };
  }
}

export async function listProposalsWith(
  deps: LobbyDeps,
): Promise<LobbyResult<{ proposals: PublicProposal[] }>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    const res = await invokeFetch(
      deps.fetch,
      `${lobbyRoot(deps.baseUrl)}/proposals`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readOkJson(
      res,
      (body) => {
        if (!body || typeof body !== "object") return { proposals: [] };
        const raw = (body as { proposals?: unknown }).proposals;
        const proposals = Array.isArray(raw)
          ? raw.map(parseProposal).filter((item): item is PublicProposal => Boolean(item))
          : [];
        return { proposals };
      },
      "Could not load proposals",
    );
  } catch {
    return { ok: false, error: "Could not reach the lobby API", status: 0 };
  }
}

async function respondProposalWith(
  id: string,
  decision: "accept" | "pass",
  deps: LobbyDeps,
): Promise<LobbyResult<{ proposal: PublicProposal }>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing proposal", status: 400 };
  }
  try {
    const res = await invokeFetch(
      deps.fetch,
      `${lobbyRoot(deps.baseUrl)}/proposals/${encodeURIComponent(trimmed)}/${decision}`,
      {
        method: "POST",
        credentials: "include",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readOkJson(
      res,
      (body) => {
        if (!body || typeof body !== "object") return null;
        const proposal = parseProposal((body as { proposal?: unknown }).proposal);
        return proposal ? { proposal } : null;
      },
      decision === "accept" ? "Could not accept that proposal" : "Could not pass",
    );
  } catch {
    return { ok: false, error: "Could not reach the lobby API", status: 0 };
  }
}

export async function acceptProposalWith(
  id: string,
  deps: LobbyDeps,
): Promise<LobbyResult<{ proposal: PublicProposal }>> {
  return respondProposalWith(id, "accept", deps);
}

export async function passProposalWith(
  id: string,
  deps: LobbyDeps,
): Promise<LobbyResult<{ proposal: PublicProposal }>> {
  return respondProposalWith(id, "pass", deps);
}

function browserDeps(signal?: AbortSignal): LobbyDeps {
  return { fetch, baseUrl: browserBaseUrl(), signal };
}

export async function listLobby(
  filters: LobbyListFilters = {},
  opts?: { cookie?: string; signal?: AbortSignal },
): Promise<LobbyResult<LobbyListSnapshot>> {
  return listLobbyWith(filters, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: opts?.cookie,
    signal: opts?.signal,
  });
}

export async function setLooking(
  input: SetLookingInput,
  signal?: AbortSignal,
): Promise<LobbyResult<{ looking: PublicOwnLooking; proposals: PublicProposal[] }>> {
  return setLookingWith(input, browserDeps(signal));
}

export async function clearLooking(
  signal?: AbortSignal,
): Promise<LobbyResult<{ ok: true; cleared: boolean }>> {
  return clearLookingWith(browserDeps(signal));
}

export async function createOpenGame(
  input: CreateOpenGameInput,
  signal?: AbortSignal,
): Promise<LobbyResult<{ openGame: PublicOwnOpenGame }>> {
  return createOpenGameWith(input, browserDeps(signal));
}

export async function joinOpenGame(
  id: string,
  input: { partySizeWithMe?: number } = {},
  signal?: AbortSignal,
): Promise<LobbyResult<{ openGame: PublicOwnOpenGame }>> {
  return joinOpenGameWith(id, input, browserDeps(signal));
}

export async function kickOpenGame(
  id: string,
  userId: string,
  signal?: AbortSignal,
): Promise<LobbyResult<{ openGame: PublicOwnOpenGame }>> {
  return kickOpenGameWith(id, userId, browserDeps(signal));
}

export async function listProposals(
  opts?: { cookie?: string; signal?: AbortSignal },
): Promise<LobbyResult<{ proposals: PublicProposal[] }>> {
  return listProposalsWith({
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: opts?.cookie,
    signal: opts?.signal,
  });
}

export async function acceptProposal(
  id: string,
  signal?: AbortSignal,
): Promise<LobbyResult<{ proposal: PublicProposal }>> {
  return acceptProposalWith(id, browserDeps(signal));
}

export async function passProposal(
  id: string,
  signal?: AbortSignal,
): Promise<LobbyResult<{ proposal: PublicProposal }>> {
  return passProposalWith(id, browserDeps(signal));
}

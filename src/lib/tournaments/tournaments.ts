import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { teamMatchHref } from "../team-matches/team-matches.ts";
import { TEAM_SPORTS, type KnownTeamSport } from "../teams/teams.ts";

export const TOURNAMENT_SPORTS = TEAM_SPORTS;
export type TournamentSport = KnownTeamSport;

export const TOURNAMENT_SIZES = [4, 8, 16] as const;
export type TournamentSize = (typeof TOURNAMENT_SIZES)[number];

export const TOURNAMENT_STATUSES = [
  "draft",
  "registration",
  "active",
  "completed",
] as const;
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const TOURNAMENT_REGISTRATION_STATUSES = [
  "pending",
  "accepted",
  "withdrawn",
] as const;
export type TournamentRegistrationStatus =
  (typeof TOURNAMENT_REGISTRATION_STATUSES)[number];

export const TOURNAMENT_VIEWER_ROLES = [
  "organizer",
  "captain",
  "member",
] as const;
export type TournamentViewerRole = (typeof TOURNAMENT_VIEWER_ROLES)[number];

export const TOURNAMENT_SLOT_SIDES = ["home", "away"] as const;
export type TournamentSlotSide = (typeof TOURNAMENT_SLOT_SIDES)[number];

export const TOURNAMENTS_HREF = "/tournaments" as const;
export const TOURNAMENTS_NEW_HREF = "/tournaments/new" as const;

export type PublicTournamentTeamRef = {
  id: string;
  name: string;
  sport: TournamentSport;
};

export type PublicTournamentViewer = {
  role: TournamentViewerRole;
  teamId: string | null;
};

export type PublicRegistration = {
  team: PublicTournamentTeamRef;
  status: TournamentRegistrationStatus;
  seed: number | null;
  registeredBy: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicSlot = {
  id: string;
  round: number;
  position: number;
  homeTeam: PublicTournamentTeamRef | null;
  awayTeam: PublicTournamentTeamRef | null;
  homeSeed: number | null;
  awaySeed: number | null;
  teamMatchId: string | null;
  teamMatchPath: string | null;
  winnerTeamId: string | null;
  nextSlotId: string | null;
  nextSide: TournamentSlotSide | null;
};

export type PublicTournamentSummary = {
  id: string;
  name: string;
  sport: TournamentSport;
  size: TournamentSize;
  status: TournamentStatus;
  venueCmsId: string | null;
  startsAt: string | null;
  organizerUserId: string;
  winnerTeamId: string | null;
  acceptedCount: number;
  createdAt: string;
  updatedAt: string;
  viewer: PublicTournamentViewer;
};

export type PublicTournament = PublicTournamentSummary & {
  inviteToken: string | null;
  registrations: PublicRegistration[];
  bracket: {
    rounds: number;
    slots: PublicSlot[];
  };
};

export type TournamentsMineSnapshot = {
  organizing: PublicTournamentSummary[];
  entered: PublicTournamentSummary[];
};

export type TournamentsMineLists = {
  organizing: PublicTournamentSummary[];
  entered: PublicTournamentSummary[];
  completed: PublicTournamentSummary[];
};

export type CreateTournamentInput = {
  name: string;
  sport: TournamentSport | string;
  size: TournamentSize | number | string;
  venueCmsId?: string | null;
  startsAt?: string | null;
};

export type UpdateTournamentInput = {
  name?: string;
  sport?: TournamentSport | string;
  size?: TournamentSize | number | string;
  venueCmsId?: string | null;
  startsAt?: string | null;
};

export type JoinTournamentInput = {
  token: string;
  teamId: string;
};

export type StartFixtureResult = {
  tournament: PublicTournament;
  fixture: {
    slotId: string;
    teamMatchId: string;
    path: string;
  };
};

export type TournamentsDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type TournamentsResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

export function tournamentsRootUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/tournaments`;
}

export function tournamentJoinUrl(baseUrl: string): string {
  return `${tournamentsRootUrl(baseUrl)}/join`;
}

export function tournamentMineUrl(baseUrl: string): string {
  return `${tournamentsRootUrl(baseUrl)}/mine`;
}

export function tournamentUrl(baseUrl: string, id: string): string {
  return `${tournamentsRootUrl(baseUrl)}/${encodeURIComponent(id)}`;
}

export function tournamentActionUrl(
  baseUrl: string,
  id: string,
  action: "open-registration" | "register" | "invite" | "generate-draw" | "start",
): string {
  return `${tournamentUrl(baseUrl, id)}/${action}`;
}

export function tournamentRegistrationActionUrl(
  baseUrl: string,
  id: string,
  teamId: string,
  action: "accept" | "withdraw" | "decline",
): string {
  return `${tournamentUrl(baseUrl, id)}/registrations/${encodeURIComponent(teamId)}/${action}`;
}

export function tournamentFixtureStartUrl(
  baseUrl: string,
  id: string,
  slotId: string,
): string {
  return `${tournamentUrl(baseUrl, id)}/fixtures/${encodeURIComponent(slotId)}/start`;
}

export function teamTournamentsUrl(baseUrl: string, teamId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/teams/${encodeURIComponent(teamId)}/tournaments`;
}

export function tournamentHref(id: string): string {
  const trimmed = id.trim();
  return trimmed ? `/tournaments/${encodeURIComponent(trimmed)}` : TOURNAMENTS_HREF;
}

export function tournamentJoinHref(token: string): string {
  const trimmed = token.trim();
  return trimmed
    ? `/tournaments/join/${encodeURIComponent(trimmed)}`
    : TOURNAMENTS_HREF;
}

/**
 * Static sources — join/mine must precede :id so those segments are not ids.
 * Nested fixture/registration paths stay explicit.
 */
export const TOURNAMENT_PROXY_SOURCES = [
  "/api/tournaments",
  "/api/tournaments/join",
  "/api/tournaments/mine",
  "/api/tournaments/:id",
  "/api/tournaments/:id/open-registration",
  "/api/tournaments/:id/register",
  "/api/tournaments/:id/invite",
  "/api/tournaments/:id/registrations/:teamId/accept",
  "/api/tournaments/:id/registrations/:teamId/withdraw",
  "/api/tournaments/:id/registrations/:teamId/decline",
  "/api/tournaments/:id/generate-draw",
  "/api/tournaments/:id/start",
  "/api/tournaments/:id/fixtures/:slotId/start",
] as const;

export function isTournamentSport(value: unknown): value is TournamentSport {
  return (
    typeof value === "string" &&
    (TOURNAMENT_SPORTS as readonly string[]).includes(value)
  );
}

export function isTournamentSize(value: unknown): value is TournamentSize {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    (TOURNAMENT_SIZES as readonly number[]).includes(value)
  );
}

export function parseTournamentSize(
  value: unknown,
): TournamentSize | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : NaN;
  return isTournamentSize(parsed) ? parsed : null;
}

export function isTournamentStatus(value: unknown): value is TournamentStatus {
  return (
    typeof value === "string" &&
    (TOURNAMENT_STATUSES as readonly string[]).includes(value)
  );
}

export function isTournamentRegistrationStatus(
  value: unknown,
): value is TournamentRegistrationStatus {
  return (
    typeof value === "string" &&
    (TOURNAMENT_REGISTRATION_STATUSES as readonly string[]).includes(value)
  );
}

export function isTournamentViewerRole(
  value: unknown,
): value is TournamentViewerRole {
  return (
    typeof value === "string" &&
    (TOURNAMENT_VIEWER_ROLES as readonly string[]).includes(value)
  );
}

export function isTournamentSlotSide(
  value: unknown,
): value is TournamentSlotSide {
  return (
    typeof value === "string" &&
    (TOURNAMENT_SLOT_SIDES as readonly string[]).includes(value)
  );
}

export function formatTournamentSport(sport: TournamentSport): string {
  if (sport === "padel") return "Padel";
  if (sport === "golf") return "Golf";
  return "Darts";
}

export function formatTournamentStatus(status: TournamentStatus): string {
  if (status === "draft") return "Draft";
  if (status === "registration") return "Registration";
  if (status === "active") return "Active";
  return "Completed";
}

export function formatTournamentSize(size: TournamentSize): string {
  return `${size} teams`;
}

export function formatRegistrationStatus(
  status: TournamentRegistrationStatus,
): string {
  if (status === "pending") return "Pending";
  if (status === "accepted") return "Accepted";
  return "Withdrawn";
}

export function formatRoundLabel(round: number, size: TournamentSize): string {
  const totalRounds = Math.log2(size);
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semi-finals";
  if (fromEnd === 2) return "Quarter-finals";
  return `Round of ${2 ** (fromEnd + 1)}`;
}

export function formatAcceptedProgress(
  acceptedCount: number,
  size: TournamentSize,
): string {
  return `${acceptedCount} / ${size} accepted`;
}

export function hasDraw(
  tournament: Pick<PublicTournament, "bracket"> | PublicTournamentSummary,
): boolean {
  if (!("bracket" in tournament)) return false;
  return tournament.bracket.slots.length > 0;
}

export function isOpenForRegistration(
  status: TournamentStatus,
): boolean {
  return status === "registration";
}

export function isDraftStatus(status: TournamentStatus): boolean {
  return status === "draft";
}

export function isCompletedStatus(status: TournamentStatus): boolean {
  return status === "completed";
}

export function uniqueById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

/** Organizing / entered stay live; completed is a third list. */
export function partitionMineLists(
  snapshot: TournamentsMineSnapshot,
): TournamentsMineLists {
  const organizing = snapshot.organizing.filter(
    (row) => row.status !== "completed",
  );
  const organizingIds = new Set(organizing.map((row) => row.id));
  const entered = snapshot.entered.filter(
    (row) => row.status !== "completed" && !organizingIds.has(row.id),
  );
  const completed = uniqueById(
    [...snapshot.organizing, ...snapshot.entered].filter(
      (row) => row.status === "completed",
    ),
  );
  return { organizing, entered, completed };
}

export function canEditDraft(
  tournament: Pick<PublicTournamentSummary, "status" | "viewer">,
): boolean {
  return tournament.viewer.role === "organizer" && tournament.status === "draft";
}

export function canDeleteDraft(
  tournament: Pick<PublicTournamentSummary, "status" | "viewer">,
): boolean {
  return canEditDraft(tournament);
}

export function canOpenRegistration(
  tournament: Pick<PublicTournamentSummary, "status" | "viewer">,
): boolean {
  return tournament.viewer.role === "organizer" && tournament.status === "draft";
}

export function canInviteTeam(
  tournament: Pick<PublicTournamentSummary, "status" | "viewer">,
): boolean {
  return (
    tournament.viewer.role === "organizer" &&
    tournament.status === "registration"
  );
}

export function canGenerateDraw(
  tournament: Pick<
    PublicTournament,
    "status" | "viewer" | "acceptedCount" | "size" | "bracket"
  >,
): boolean {
  return (
    tournament.viewer.role === "organizer" &&
    tournament.status === "registration" &&
    tournament.acceptedCount === tournament.size &&
    !hasDraw(tournament)
  );
}

export function canStartTournament(
  tournament: Pick<
    PublicTournament,
    "status" | "viewer" | "acceptedCount" | "size" | "bracket"
  >,
): boolean {
  if (tournament.viewer.role !== "organizer") return false;
  if (tournament.status !== "registration") return false;
  return hasDraw(tournament) || tournament.acceptedCount === tournament.size;
}

export function canStartFixture(
  tournament: Pick<PublicTournament, "status" | "viewer">,
  slot: PublicSlot,
): boolean {
  if (tournament.status !== "active") return false;
  if (!slot.homeTeam || !slot.awayTeam) return false;
  if (tournament.viewer.role === "organizer") return true;
  if (tournament.viewer.role !== "captain") return false;
  const teamId = tournament.viewer.teamId;
  if (!teamId) return false;
  return teamId === slot.homeTeam.id || teamId === slot.awayTeam.id;
}

export function canRegisterTeam(
  tournament: Pick<PublicTournament, "status" | "registrations">,
  teamId: string,
  role: string,
): boolean {
  if (tournament.status !== "registration") return false;
  if (role !== "owner" && role !== "captain") return false;
  const trimmed = teamId.trim();
  if (!trimmed) return false;
  return !tournament.registrations.some(
    (entry) =>
      entry.team.id === trimmed &&
      (entry.status === "accepted" || entry.status === "pending"),
  );
}

export function canAcceptRegistration(
  tournament: Pick<PublicTournament, "status" | "viewer">,
  entry: PublicRegistration,
): boolean {
  if (tournament.status !== "registration") return false;
  if (entry.status !== "pending") return false;
  if (tournament.viewer.role !== "captain") return false;
  return tournament.viewer.teamId === entry.team.id;
}

export function canWithdrawRegistration(
  tournament: Pick<PublicTournament, "status" | "viewer" | "bracket">,
  entry: PublicRegistration,
): boolean {
  if (tournament.status !== "registration") return false;
  if (hasDraw(tournament)) return false;
  if (entry.status === "withdrawn") return false;
  if (tournament.viewer.role === "organizer") return true;
  if (tournament.viewer.role !== "captain") return false;
  return tournament.viewer.teamId === entry.team.id;
}

export function fixtureNavigateHref(slot: PublicSlot): string | null {
  const id = slot.teamMatchId?.trim() ?? "";
  return id ? teamMatchHref(id) : null;
}

export function slotsByRound(slots: readonly PublicSlot[]): Map<number, PublicSlot[]> {
  const grouped = new Map<number, PublicSlot[]>();
  for (const slot of slots) {
    const list = grouped.get(slot.round) ?? [];
    list.push(slot);
    grouped.set(slot.round, list);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.position - b.position);
  }
  return grouped;
}

export function buildCreateTournamentPayload(input: CreateTournamentInput):
  | {
      ok: true;
      payload: {
        name: string;
        sport: string;
        size: TournamentSize;
        venueCmsId?: string;
        startsAt?: string;
      };
    }
  | { ok: false; error: string } {
  const name = input.name.trim();
  const sport = typeof input.sport === "string" ? input.sport.trim() : "";
  const size = parseTournamentSize(input.size);
  if (!name) return { ok: false, error: "Name is required" };
  if (name.length > 80) {
    return { ok: false, error: "Name must be 80 characters or fewer" };
  }
  if (!isTournamentSport(sport)) return { ok: false, error: "Sport is required" };
  if (!size) return { ok: false, error: "Size must be 4, 8, or 16" };

  const payload: {
    name: string;
    sport: string;
    size: TournamentSize;
    venueCmsId?: string;
    startsAt?: string;
  } = { name, sport, size };

  const venue = input.venueCmsId?.trim();
  if (venue) payload.venueCmsId = venue;
  const startsAt = input.startsAt?.trim();
  if (startsAt) payload.startsAt = startsAt;
  return { ok: true, payload };
}

export function buildUpdateTournamentPayload(input: UpdateTournamentInput):
  | {
      ok: true;
      payload: {
        name?: string;
        sport?: string;
        size?: TournamentSize;
        venueCmsId?: string | null;
        startsAt?: string | null;
      };
    }
  | { ok: false; error: string } {
  const payload: {
    name?: string;
    sport?: string;
    size?: TournamentSize;
    venueCmsId?: string | null;
    startsAt?: string | null;
  } = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) return { ok: false, error: "Name is required" };
    if (name.length > 80) {
      return { ok: false, error: "Name must be 80 characters or fewer" };
    }
    payload.name = name;
  }
  if (input.sport !== undefined) {
    const sport = input.sport.trim();
    if (!isTournamentSport(sport)) return { ok: false, error: "Sport is required" };
    payload.sport = sport;
  }
  if (input.size !== undefined) {
    const size = parseTournamentSize(input.size);
    if (!size) return { ok: false, error: "Size must be 4, 8, or 16" };
    payload.size = size;
  }
  if (input.venueCmsId !== undefined) {
    const venue = input.venueCmsId?.trim() ?? "";
    payload.venueCmsId = venue || null;
  }
  if (input.startsAt !== undefined) {
    const startsAt = input.startsAt?.trim() ?? "";
    payload.startsAt = startsAt || null;
  }

  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "Nothing to update" };
  }
  return { ok: true, payload };
}

export function buildRegisterPayload(teamId: string):
  | { ok: true; payload: { teamId: string } }
  | { ok: false; error: string } {
  const trimmed = teamId.trim();
  if (!trimmed) return { ok: false, error: "Pick a team" };
  return { ok: true, payload: { teamId: trimmed } };
}

export function buildJoinTournamentPayload(input: JoinTournamentInput):
  | { ok: true; payload: { token: string; teamId: string } }
  | { ok: false; error: string } {
  const token = input.token.trim();
  const teamId = input.teamId.trim();
  if (!token) return { ok: false, error: "Missing invite token" };
  if (!teamId) return { ok: false, error: "Pick a team to join with" };
  return { ok: true, payload: { token, teamId } };
}

export function parseTournamentTeamRef(
  value: unknown,
): PublicTournamentTeamRef | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    !isTournamentSport(row.sport)
  ) {
    return null;
  }
  return { id: row.id, name: row.name, sport: row.sport };
}

export function parseTournamentViewer(
  value: unknown,
): PublicTournamentViewer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!isTournamentViewerRole(row.role)) return null;
  return {
    role: row.role,
    teamId: typeof row.teamId === "string" ? row.teamId : null,
  };
}

export function parseRegistration(value: unknown): PublicRegistration | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const team = parseTournamentTeamRef(row.team);
  if (
    !team ||
    !isTournamentRegistrationStatus(row.status) ||
    typeof row.registeredBy !== "string" ||
    typeof row.createdAt !== "string" ||
    typeof row.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    team,
    status: row.status,
    seed: typeof row.seed === "number" && Number.isFinite(row.seed) ? row.seed : null,
    registeredBy: row.registeredBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function parseSlot(value: unknown): PublicSlot | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.round !== "number" ||
    !Number.isFinite(row.round) ||
    typeof row.position !== "number" ||
    !Number.isFinite(row.position)
  ) {
    return null;
  }

  let homeTeam: PublicTournamentTeamRef | null = null;
  if (row.homeTeam != null) {
    homeTeam = parseTournamentTeamRef(row.homeTeam);
    if (!homeTeam) return null;
  }
  let awayTeam: PublicTournamentTeamRef | null = null;
  if (row.awayTeam != null) {
    awayTeam = parseTournamentTeamRef(row.awayTeam);
    if (!awayTeam) return null;
  }

  return {
    id: row.id,
    round: row.round,
    position: row.position,
    homeTeam,
    awayTeam,
    homeSeed:
      typeof row.homeSeed === "number" && Number.isFinite(row.homeSeed)
        ? row.homeSeed
        : null,
    awaySeed:
      typeof row.awaySeed === "number" && Number.isFinite(row.awaySeed)
        ? row.awaySeed
        : null,
    teamMatchId: typeof row.teamMatchId === "string" ? row.teamMatchId : null,
    teamMatchPath: typeof row.teamMatchPath === "string" ? row.teamMatchPath : null,
    winnerTeamId: typeof row.winnerTeamId === "string" ? row.winnerTeamId : null,
    nextSlotId: typeof row.nextSlotId === "string" ? row.nextSlotId : null,
    nextSide: isTournamentSlotSide(row.nextSide) ? row.nextSide : null,
  };
}

export function parseTournamentSummary(
  value: unknown,
): PublicTournamentSummary | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const viewer = parseTournamentViewer(row.viewer);
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    !isTournamentSport(row.sport) ||
    !isTournamentSize(row.size) ||
    !isTournamentStatus(row.status) ||
    typeof row.organizerUserId !== "string" ||
    typeof row.acceptedCount !== "number" ||
    !Number.isFinite(row.acceptedCount) ||
    typeof row.createdAt !== "string" ||
    typeof row.updatedAt !== "string" ||
    !viewer
  ) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    sport: row.sport,
    size: row.size,
    status: row.status,
    venueCmsId: typeof row.venueCmsId === "string" ? row.venueCmsId : null,
    startsAt: typeof row.startsAt === "string" ? row.startsAt : null,
    organizerUserId: row.organizerUserId,
    winnerTeamId: typeof row.winnerTeamId === "string" ? row.winnerTeamId : null,
    acceptedCount: row.acceptedCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    viewer,
  };
}

export function parseTournament(value: unknown): PublicTournament | null {
  const summary = parseTournamentSummary(value);
  if (!summary || !value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const registrations = row.registrations;
  const bracket = row.bracket;
  if (!Array.isArray(registrations) || !bracket || typeof bracket !== "object") {
    return null;
  }
  const slotsRaw = (bracket as { slots?: unknown }).slots;
  const rounds = (bracket as { rounds?: unknown }).rounds;
  if (!Array.isArray(slotsRaw) || typeof rounds !== "number" || !Number.isFinite(rounds)) {
    return null;
  }
  const slots = slotsRaw
    .map(parseSlot)
    .filter((item): item is PublicSlot => !!item);
  if (slots.length !== slotsRaw.length) return null;
  return {
    ...summary,
    inviteToken: typeof row.inviteToken === "string" ? row.inviteToken : null,
    registrations: registrations
      .map(parseRegistration)
      .filter((item): item is PublicRegistration => !!item),
    bracket: { rounds, slots },
  };
}

export function parseTournamentList(value: unknown): PublicTournamentSummary[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseTournamentSummary)
    .filter((item): item is PublicTournamentSummary => !!item);
}

export function parseMineSnapshot(body: unknown): TournamentsMineSnapshot {
  if (!body || typeof body !== "object") return emptyMineSnapshot();
  const row = body as Record<string, unknown>;
  return {
    organizing: parseTournamentList(row.organizing),
    entered: parseTournamentList(row.entered),
  };
}

export function emptyMineSnapshot(): TournamentsMineSnapshot {
  return { organizing: [], entered: [] };
}

function tournamentFromBody(body: unknown): PublicTournament | null {
  if (!body || typeof body !== "object") return null;
  return parseTournament((body as { tournament?: unknown }).tournament);
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
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

async function readTournamentResponse(
  res: Response,
  fallback: string,
): Promise<TournamentsResult<PublicTournament>> {
  const body = await readJson(res);
  if (!res.ok) {
    return {
      ok: false,
      error: errorFromBody(body, fallback),
      status: res.status,
    };
  }
  const tournament = tournamentFromBody(body);
  if (!tournament) {
    return { ok: false, error: "Unexpected tournament response", status: 500 };
  }
  return { ok: true, value: tournament };
}

export async function createTournamentWith(
  input: CreateTournamentInput,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  const built = buildCreateTournamentPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, tournamentsRootUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readTournamentResponse(res, "Could not create tournament");
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

export async function getTournamentWith(
  id: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing tournament id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, tournamentUrl(deps.baseUrl, trimmed), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    return readTournamentResponse(res, `Could not load tournament (${res.status})`);
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

export async function updateTournamentWith(
  id: string,
  input: UpdateTournamentInput,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  const trimmed = id.trim();
  const built = buildUpdateTournamentPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing tournament id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, tournamentUrl(deps.baseUrl, trimmed), {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readTournamentResponse(res, "Could not update tournament");
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

export async function deleteTournamentWith(
  id: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<true>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing tournament id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, tournamentUrl(deps.baseUrl, trimmed), {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    if (!res.ok) {
      const body = await readJson(res);
      return {
        ok: false,
        error: errorFromBody(body, "Could not delete tournament"),
        status: res.status,
      };
    }
    return { ok: true, value: true };
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

async function postTournamentAction(
  id: string,
  action: "open-registration" | "generate-draw" | "start",
  deps: TournamentsDeps,
  fallback: string,
): Promise<TournamentsResult<PublicTournament>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing tournament id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      tournamentActionUrl(deps.baseUrl, trimmed, action),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readTournamentResponse(res, fallback);
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

export async function openRegistrationWith(
  id: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  return postTournamentAction(
    id,
    "open-registration",
    deps,
    "Could not open registration",
  );
}

export async function generateDrawWith(
  id: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  return postTournamentAction(id, "generate-draw", deps, "Could not generate draw");
}

export async function startTournamentWith(
  id: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  return postTournamentAction(id, "start", deps, "Could not start tournament");
}

export async function registerTeamWith(
  id: string,
  teamId: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  const trimmed = id.trim();
  const built = buildRegisterPayload(teamId);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing tournament id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      tournamentActionUrl(deps.baseUrl, trimmed, "register"),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    return readTournamentResponse(res, "Could not register team");
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

export async function inviteTeamWith(
  id: string,
  teamId: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  const trimmed = id.trim();
  const built = buildRegisterPayload(teamId);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing tournament id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      tournamentActionUrl(deps.baseUrl, trimmed, "invite"),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    return readTournamentResponse(res, "Could not invite team");
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

export async function joinTournamentWith(
  input: JoinTournamentInput,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  const built = buildJoinTournamentPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, tournamentJoinUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readTournamentResponse(res, "Could not join tournament");
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

async function postRegistrationAction(
  id: string,
  teamId: string,
  action: "accept" | "withdraw" | "decline",
  deps: TournamentsDeps,
  fallback: string,
): Promise<TournamentsResult<PublicTournament>> {
  const tournamentId = id.trim();
  const trimmedTeam = teamId.trim();
  if (!tournamentId || !trimmedTeam || !deps.baseUrl) {
    return { ok: false, error: "Missing tournament or team id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      tournamentRegistrationActionUrl(
        deps.baseUrl,
        tournamentId,
        trimmedTeam,
        action,
      ),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readTournamentResponse(res, fallback);
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

export async function acceptRegistrationWith(
  id: string,
  teamId: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  return postRegistrationAction(
    id,
    teamId,
    "accept",
    deps,
    "Could not accept entry",
  );
}

export async function withdrawRegistrationWith(
  id: string,
  teamId: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournament>> {
  return postRegistrationAction(
    id,
    teamId,
    "withdraw",
    deps,
    "Could not withdraw entry",
  );
}

export async function startFixtureWith(
  id: string,
  slotId: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<StartFixtureResult>> {
  const tournamentId = id.trim();
  const trimmedSlot = slotId.trim();
  if (!tournamentId || !trimmedSlot || !deps.baseUrl) {
    return { ok: false, error: "Missing tournament or slot id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      tournamentFixtureStartUrl(deps.baseUrl, tournamentId, trimmedSlot),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, "Could not start fixture"),
        status: res.status,
      };
    }
    const tournament = tournamentFromBody(body);
    const fixtureRaw =
      body && typeof body === "object"
        ? (body as { fixture?: unknown }).fixture
        : null;
    const fixture =
      fixtureRaw && typeof fixtureRaw === "object"
        ? (fixtureRaw as Record<string, unknown>)
        : null;
    if (
      !tournament ||
      !fixture ||
      typeof fixture.slotId !== "string" ||
      typeof fixture.teamMatchId !== "string" ||
      typeof fixture.path !== "string"
    ) {
      return { ok: false, error: "Unexpected start fixture response", status: 500 };
    }
    return {
      ok: true,
      value: {
        tournament,
        fixture: {
          slotId: fixture.slotId,
          teamMatchId: fixture.teamMatchId,
          path: fixture.path,
        },
      },
    };
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

export async function listMyTournamentsWith(
  deps: TournamentsDeps,
): Promise<TournamentsResult<TournamentsMineSnapshot>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, tournamentMineUrl(deps.baseUrl), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, `Could not load tournaments (${res.status})`),
        status: res.status,
      };
    }
    return { ok: true, value: parseMineSnapshot(body) };
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

export async function listTeamTournamentsWith(
  teamId: string,
  deps: TournamentsDeps,
): Promise<TournamentsResult<PublicTournamentSummary[]>> {
  const trimmed = teamId.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamTournamentsUrl(deps.baseUrl, trimmed),
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, `Could not load tournaments (${res.status})`),
        status: res.status,
      };
    }
    return {
      ok: true,
      value: parseTournamentList(
        body && typeof body === "object"
          ? (body as { tournaments?: unknown }).tournaments
          : null,
      ),
    };
  } catch {
    return { ok: false, error: "Could not reach tournaments API", status: 0 };
  }
}

function browserDeps(timeoutMs: number, cookie?: string): TournamentsDeps {
  return {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie,
    signal: AbortSignal.timeout(timeoutMs),
  };
}

export async function listMyTournaments(options: {
  cookie?: string;
} = {}): Promise<TournamentsMineSnapshot> {
  if (!isApiConfigured()) return emptyMineSnapshot();
  const result = await listMyTournamentsWith(browserDeps(8000, options.cookie));
  return result.ok ? result.value : emptyMineSnapshot();
}

export async function listTeamTournaments(
  teamId: string,
  options: { cookie?: string } = {},
): Promise<PublicTournamentSummary[]> {
  if (!isApiConfigured()) return [];
  const result = await listTeamTournamentsWith(
    teamId,
    browserDeps(8000, options.cookie),
  );
  return result.ok ? result.value : [];
}

export async function getTournament(
  id: string,
  options: { cookie?: string } = {},
): Promise<PublicTournament | null> {
  if (!isApiConfigured()) return null;
  const result = await getTournamentWith(id, browserDeps(8000, options.cookie));
  return result.ok ? result.value : null;
}

export async function createTournament(
  input: CreateTournamentInput,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return createTournamentWith(input, browserDeps(10000));
}

export async function updateTournament(
  id: string,
  input: UpdateTournamentInput,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return updateTournamentWith(id, input, browserDeps(10000));
}

export async function deleteTournament(id: string): Promise<TournamentsResult<true>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return deleteTournamentWith(id, browserDeps(8000));
}

export async function openRegistration(
  id: string,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return openRegistrationWith(id, browserDeps(10000));
}

export async function generateDraw(
  id: string,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return generateDrawWith(id, browserDeps(10000));
}

export async function startTournament(
  id: string,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return startTournamentWith(id, browserDeps(10000));
}

export async function registerTeam(
  id: string,
  teamId: string,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return registerTeamWith(id, teamId, browserDeps(10000));
}

export async function inviteTeam(
  id: string,
  teamId: string,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return inviteTeamWith(id, teamId, browserDeps(10000));
}

export async function joinTournament(
  input: JoinTournamentInput,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return joinTournamentWith(input, browserDeps(10000));
}

export async function acceptRegistration(
  id: string,
  teamId: string,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return acceptRegistrationWith(id, teamId, browserDeps(10000));
}

export async function withdrawRegistration(
  id: string,
  teamId: string,
): Promise<TournamentsResult<PublicTournament>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return withdrawRegistrationWith(id, teamId, browserDeps(10000));
}

export async function startFixture(
  id: string,
  slotId: string,
): Promise<TournamentsResult<StartFixtureResult>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return startFixtureWith(id, slotId, browserDeps(15000));
}

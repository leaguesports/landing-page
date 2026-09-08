import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { uniqueUserIds } from "../teams/teams.ts";

export const TEAM_MATCH_SPORTS = ["padel", "golf", "darts"] as const;
export type TeamMatchSport = (typeof TEAM_MATCH_SPORTS)[number];

export const TEAM_MATCH_STATUSES = [
  "pending",
  "scheduled",
  "live",
  "completed",
  "declined",
  "cancelled",
] as const;
export type TeamMatchStatus = (typeof TEAM_MATCH_STATUSES)[number];

export const TEAM_MATCH_VIEWER_ROLES = [
  "home_staff",
  "away_staff",
  "member",
] as const;
export type TeamMatchViewerRole = (typeof TEAM_MATCH_VIEWER_ROLES)[number];

export const LINEUP_RULES: Record<
  TeamMatchSport,
  { min: number; max: number }
> = {
  padel: { min: 2, max: 2 },
  golf: { min: 1, max: 2 },
  darts: { min: 1, max: 1 },
};

export const TEAM_MATCHES_HREF = "/team-matches" as const;
export const TEAM_MATCHES_NEW_HREF = "/team-matches/new" as const;

/** Opponent search is a 1-char `contains` on the API — never fire with empty/`q` < 2. */
export const TEAM_SEARCH_MIN_QUERY = 2;
export const TEAM_MATCH_VENUE_LIMIT = 24;
export const CHALLENGE_TOKEN_STASH_PREFIX = "ls_team_match_challenge:" as const;
const SCORECARD_ID_RE = /^[A-Za-z0-9_-]+$/;
const STASHED_CHALLENGE_TOKEN_RE = /^[A-Za-z0-9_-]{8,256}$/;

export type PublicUser = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
};

export type PublicTeamRef = {
  id: string;
  name: string;
  sport: TeamMatchSport;
};

export type PublicScorecard = {
  sport: TeamMatchSport;
  id: string;
  path: string;
};

export type PublicTeamMatchViewer = {
  role: TeamMatchViewerRole;
  teamId: string | null;
};

export type PublicTeamMatch = {
  id: string;
  sport: TeamMatchSport;
  status: TeamMatchStatus;
  homeTeam: PublicTeamRef;
  awayTeam: PublicTeamRef | null;
  venueCmsId: string | null;
  startsAt: string | null;
  challengeToken: string | null;
  lineups: {
    home: PublicUser[];
    away: PublicUser[];
  };
  scorecard: PublicScorecard | null;
  winnerTeamId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  viewer: PublicTeamMatchViewer;
};

/** List/hub/profile row — no tokens, lineups, or scorecard ids. */
export type TeamMatchPreview = {
  id: string;
  sport: TeamMatchSport;
  status: TeamMatchStatus;
  startsAt: string | null;
  homeName: string;
  awayName: string | null;
};

export type TeamMatchesMineSnapshot = {
  upcoming: TeamMatchPreview[];
  recent: TeamMatchPreview[];
};

export type ParseTeamMatchOptions = {
  /** Only the POST create response may keep the captain challenge token. */
  keepChallengeToken?: boolean;
};

export type CreateTeamMatchInput = {
  homeTeamId: string;
  awayTeamId?: string | null;
  generateChallengeLink?: boolean;
  venueCmsId?: string | null;
  startsAt?: string | null;
};

export type JoinTeamMatchInput = {
  token: string;
  teamId: string;
};

export type ScheduleTeamMatchInput = {
  startsAt?: string | null;
  venueCmsId?: string | null;
};

export type SetLineupInput = {
  userIds: readonly string[];
  teamId?: string;
};

export type StartTeamMatchResult = {
  match: PublicTeamMatch;
  scorecard: PublicScorecard;
};

export type TeamMatchesDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type TeamMatchesResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

export function teamMatchesRootUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/team-matches`;
}

export function teamMatchJoinUrl(baseUrl: string): string {
  return `${teamMatchesRootUrl(baseUrl)}/join`;
}

export function teamMatchMineUrl(baseUrl: string): string {
  return `${teamMatchesRootUrl(baseUrl)}/mine`;
}

export function teamMatchUrl(baseUrl: string, id: string): string {
  return `${teamMatchesRootUrl(baseUrl)}/${encodeURIComponent(id)}`;
}

export function teamMatchActionUrl(
  baseUrl: string,
  id: string,
  action: "accept" | "decline" | "start" | "cancel" | "complete" | "lineup",
): string {
  return `${teamMatchUrl(baseUrl, id)}/${action}`;
}

export function teamMatchesForTeamUrl(baseUrl: string, teamId: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/teams/${encodeURIComponent(teamId)}/matches`;
}

export function teamsSearchUrl(
  baseUrl: string,
  sport: string,
  query?: string,
): string {
  const params = new URLSearchParams({ sport: sport.trim() });
  const q = query?.trim();
  if (q) params.set("q", q);
  return `${baseUrl.replace(/\/$/, "")}/api/teams/search?${params.toString()}`;
}

export function teamMatchHref(id: string): string {
  const trimmed = id.trim();
  return trimmed ? `/team-matches/${encodeURIComponent(trimmed)}` : TEAM_MATCHES_HREF;
}

export function teamMatchNewHref(teamId?: string): string {
  const trimmed = teamId?.trim();
  if (!trimmed) return TEAM_MATCHES_NEW_HREF;
  return `${TEAM_MATCHES_NEW_HREF}?teamId=${encodeURIComponent(trimmed)}`;
}

export function teamMatchJoinHref(token: string): string {
  const trimmed = token.trim();
  return trimmed
    ? `/team-matches/join/${encodeURIComponent(trimmed)}`
    : TEAM_MATCHES_HREF;
}

/** Static sources — join/mine must precede :id so those segments are not ids. */
export const TEAM_MATCH_PROXY_SOURCES = [
  "/api/team-matches",
  "/api/team-matches/join",
  "/api/team-matches/mine",
  "/api/team-matches/:id",
  "/api/team-matches/:id/lineup",
  "/api/team-matches/:id/accept",
  "/api/team-matches/:id/decline",
  "/api/team-matches/:id/start",
  "/api/team-matches/:id/cancel",
  "/api/team-matches/:id/complete",
] as const;

export function isTeamMatchSport(value: unknown): value is TeamMatchSport {
  return (
    typeof value === "string" &&
    (TEAM_MATCH_SPORTS as readonly string[]).includes(value)
  );
}

export function isTeamMatchStatus(value: unknown): value is TeamMatchStatus {
  return (
    typeof value === "string" &&
    (TEAM_MATCH_STATUSES as readonly string[]).includes(value)
  );
}

export function isTeamMatchViewerRole(
  value: unknown,
): value is TeamMatchViewerRole {
  return (
    typeof value === "string" &&
    (TEAM_MATCH_VIEWER_ROLES as readonly string[]).includes(value)
  );
}

export function formatTeamMatchStatus(status: TeamMatchStatus): string {
  if (status === "pending") return "Pending";
  if (status === "scheduled") return "Scheduled";
  if (status === "live") return "Live";
  if (status === "completed") return "Completed";
  if (status === "declined") return "Declined";
  return "Cancelled";
}

export function formatTeamMatchSport(sport: TeamMatchSport): string {
  if (sport === "padel") return "Padel";
  if (sport === "golf") return "Golf";
  return "Darts";
}

export function formatLineupRule(sport: TeamMatchSport): string {
  const rule = LINEUP_RULES[sport];
  if (rule.min === rule.max) {
    return `${rule.min} vs ${rule.min}`;
  }
  return `${rule.min}–${rule.max} per side, same size`;
}

export function formatTeamMatchVersus(
  match: PublicTeamMatch | TeamMatchPreview,
): string {
  const home =
    "homeName" in match ? match.homeName : match.homeTeam.name;
  const awayRaw =
    "homeName" in match ? match.awayName : match.awayTeam?.name;
  const away = awayRaw?.trim() || "Open challenge";
  return `${home} vs ${away}`;
}

export function shouldSearchTeams(query: string): boolean {
  return query.trim().length >= TEAM_SEARCH_MIN_QUERY;
}

export function toTeamMatchPreview(match: PublicTeamMatch): TeamMatchPreview {
  return {
    id: match.id,
    sport: match.sport,
    status: match.status,
    startsAt: match.startsAt,
    homeName: match.homeTeam.name,
    awayName: match.awayTeam?.name ?? null,
  };
}

export function challengeTokenStashKey(matchId: string): string {
  return `${CHALLENGE_TOKEN_STASH_PREFIX}${matchId}`;
}

export function stashChallengeToken(matchId: string, token: string): void {
  if (typeof sessionStorage === "undefined") return;
  const id = matchId.trim();
  const value = token.trim();
  if (!id || !STASHED_CHALLENGE_TOKEN_RE.test(value)) return;
  try {
    sessionStorage.setItem(challengeTokenStashKey(id), value);
  } catch {
    // quota / private mode
  }
}

export function readStashedChallengeToken(matchId: string): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const id = matchId.trim();
  if (!id) return null;
  try {
    const value = sessionStorage.getItem(challengeTokenStashKey(id));
    if (!value || !STASHED_CHALLENGE_TOKEN_RE.test(value)) return null;
    return value;
  } catch {
    return null;
  }
}

export function isUpcomingStatus(status: TeamMatchStatus): boolean {
  return status === "pending" || status === "scheduled" || status === "live";
}

export function isOpenStatus(status: TeamMatchStatus): boolean {
  return status === "pending" || status === "scheduled";
}

export function isTerminalStatus(status: TeamMatchStatus): boolean {
  return (
    status === "completed" || status === "declined" || status === "cancelled"
  );
}

export function partitionTeamMatches<T extends { status: TeamMatchStatus }>(
  matches: readonly T[],
): {
  upcoming: T[];
  recent: T[];
} {
  const upcoming: T[] = [];
  const recent: T[] = [];
  for (const match of matches) {
    if (isUpcomingStatus(match.status)) upcoming.push(match);
    else recent.push(match);
  }
  return { upcoming, recent };
}

export function lineupSizeValid(
  sport: TeamMatchSport,
  count: number,
): boolean {
  const rule = LINEUP_RULES[sport];
  return (
    Number.isInteger(count) && count >= rule.min && count <= rule.max
  );
}

export function describeLineupSizeError(
  sport: TeamMatchSport,
  count: number,
): string | null {
  if (lineupSizeValid(sport, count)) return null;
  const rule = LINEUP_RULES[sport];
  const needed =
    rule.min === rule.max ? `${rule.min}` : `${rule.min}–${rule.max}`;
  return `${formatTeamMatchSport(sport)} lineup must include ${needed} player(s)`;
}

export function lineupsReady(match: Pick<PublicTeamMatch, "sport" | "lineups">): boolean {
  const home = match.lineups.home.length;
  const away = match.lineups.away.length;
  if (!lineupSizeValid(match.sport, home) || !lineupSizeValid(match.sport, away)) {
    return false;
  }
  if (match.sport === "golf" && home !== away) return false;
  return true;
}

export function venueRequiredToStart(sport: TeamMatchSport): boolean {
  return sport !== "darts";
}

export function isReadyToStart(match: PublicTeamMatch): boolean {
  if (match.status !== "scheduled") return false;
  if (!match.awayTeam) return false;
  if (!lineupsReady(match)) return false;
  if (venueRequiredToStart(match.sport) && !match.venueCmsId) return false;
  return true;
}

export function startBlockedReason(match: PublicTeamMatch): string | null {
  if (match.status === "live" && match.scorecard) return null;
  if (match.status !== "scheduled") {
    if (match.status === "pending") return "Challenge has not been accepted";
    return "Match cannot be started in this status";
  }
  if (!match.awayTeam) return "Opponent has not joined yet";
  if (!lineupsReady(match)) {
    if (match.sport === "golf" && match.lineups.home.length !== match.lineups.away.length) {
      return "Golf lineups must be the same size";
    }
    return `Both teams need a valid ${match.sport} lineup`;
  }
  if (venueRequiredToStart(match.sport) && !match.venueCmsId) {
    return "venueCmsId is required to start";
  }
  return null;
}

export function canCreateChallenge(role: string): boolean {
  return role === "owner" || role === "captain";
}

export function canAcceptChallenge(match: PublicTeamMatch): boolean {
  return (
    match.status === "pending" &&
    match.viewer.role === "away_staff" &&
    match.awayTeam !== null
  );
}

export function canDeclineChallenge(match: PublicTeamMatch): boolean {
  return canAcceptChallenge(match);
}

export function canCancelMatch(match: PublicTeamMatch): boolean {
  return isOpenStatus(match.status) && match.viewer.role === "home_staff";
}

export function canScheduleMatch(match: PublicTeamMatch): boolean {
  return isOpenStatus(match.status) && match.viewer.role === "home_staff";
}

export function canSetLineup(
  match: PublicTeamMatch,
  teamId?: string,
): boolean {
  if (!isOpenStatus(match.status)) return false;
  const trimmed = teamId?.trim();
  if (match.viewer.role === "home_staff") {
    return !trimmed || trimmed === match.homeTeam.id;
  }
  if (match.viewer.role === "away_staff" && match.awayTeam) {
    return !trimmed || trimmed === match.awayTeam.id;
  }
  return false;
}

export function canStartMatch(match: PublicTeamMatch): boolean {
  if (match.viewer.role !== "home_staff" && match.viewer.role !== "away_staff") {
    return false;
  }
  if (match.status === "live" && match.scorecard) return true;
  return isReadyToStart(match);
}

export function canCompleteMatch(match: PublicTeamMatch): boolean {
  return (
    match.status === "live" &&
    (match.viewer.role === "home_staff" || match.viewer.role === "away_staff")
  );
}

export function viewerTeamId(match: PublicTeamMatch): string | null {
  if (match.viewer.teamId) return match.viewer.teamId;
  if (match.viewer.role === "home_staff") return match.homeTeam.id;
  if (match.viewer.role === "away_staff") return match.awayTeam?.id ?? null;
  return null;
}

export function scorecardNavigatePath(
  scorecard: PublicScorecard | null,
): string | null {
  if (!scorecard) return null;
  const id = scorecard.id.trim();
  if (!SCORECARD_ID_RE.test(id)) return null;
  return `/${scorecard.sport}/${id}`;
}

export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export function datetimeLocalToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function buildCreateChallengePayload(input: CreateTeamMatchInput):
  | {
      ok: true;
      payload: {
        homeTeamId: string;
        awayTeamId?: string;
        generateChallengeLink?: boolean;
        venueCmsId?: string | null;
        startsAt?: string | null;
      };
    }
  | { ok: false; error: string } {
  const homeTeamId = input.homeTeamId.trim();
  if (!homeTeamId) return { ok: false, error: "Pick your team" };

  const awayTeamId = input.awayTeamId?.trim() ?? "";
  const generateLink = input.generateChallengeLink === true;
  if (!awayTeamId && !generateLink) {
    return { ok: false, error: "Pick an opponent or create a challenge link" };
  }
  if (awayTeamId && awayTeamId === homeTeamId) {
    return { ok: false, error: "Cannot challenge the same team" };
  }

  const payload: {
    homeTeamId: string;
    awayTeamId?: string;
    generateChallengeLink?: boolean;
    venueCmsId?: string | null;
    startsAt?: string | null;
  } = { homeTeamId };

  if (awayTeamId) payload.awayTeamId = awayTeamId;
  else payload.generateChallengeLink = true;

  const venue = input.venueCmsId?.trim() ?? "";
  if (input.venueCmsId !== undefined) payload.venueCmsId = venue || null;
  if (input.startsAt !== undefined) {
    const startsAt = input.startsAt?.trim() ?? "";
    payload.startsAt = startsAt || null;
  }
  return { ok: true, payload };
}

export function buildJoinChallengePayload(input: JoinTeamMatchInput):
  | { ok: true; payload: { token: string; teamId: string } }
  | { ok: false; error: string } {
  const token = input.token.trim();
  const teamId = input.teamId.trim();
  if (!token) return { ok: false, error: "Missing challenge token" };
  if (!teamId) return { ok: false, error: "Pick a team to join with" };
  return { ok: true, payload: { token, teamId } };
}

export function buildSchedulePayload(input: ScheduleTeamMatchInput):
  | { ok: true; payload: { startsAt?: string | null; venueCmsId?: string | null } }
  | { ok: false; error: string } {
  const payload: { startsAt?: string | null; venueCmsId?: string | null } = {};
  if (input.startsAt !== undefined) {
    payload.startsAt = input.startsAt?.trim() ? input.startsAt.trim() : null;
  }
  if (input.venueCmsId !== undefined) {
    payload.venueCmsId = input.venueCmsId?.trim() ? input.venueCmsId.trim() : null;
  }
  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "At least one field is required" };
  }
  return { ok: true, payload };
}

export function buildLineupPayload(
  input: SetLineupInput,
  sport: TeamMatchSport,
):
  | { ok: true; payload: { userIds: string[]; teamId?: string } }
  | { ok: false; error: string } {
  const userIds = uniqueUserIds(input.userIds);
  const sizeError = describeLineupSizeError(sport, userIds.length);
  if (sizeError) return { ok: false, error: sizeError };
  const payload: { userIds: string[]; teamId?: string } = { userIds };
  const teamId = input.teamId?.trim();
  if (teamId) payload.teamId = teamId;
  return { ok: true, payload };
}

export function buildCompletePayload(winnerTeamId?: string | null): {
  winnerTeamId?: string;
} {
  const trimmed = winnerTeamId?.trim();
  return trimmed ? { winnerTeamId: trimmed } : {};
}

export function parsePublicUser(value: unknown): PublicUser | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.displayName !== "string" ||
    typeof row.handle !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    displayName: row.displayName,
    handle: row.handle,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
  };
}

export function parseTeamRef(value: unknown): PublicTeamRef | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    !isTeamMatchSport(row.sport)
  ) {
    return null;
  }
  return { id: row.id, name: row.name, sport: row.sport };
}

export function parseScorecard(value: unknown): PublicScorecard | null {
  if (value == null) return null;
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    !isTeamMatchSport(row.sport) ||
    typeof row.id !== "string" ||
    typeof row.path !== "string"
  ) {
    return null;
  }
  return { sport: row.sport, id: row.id, path: row.path };
}

export function parseViewer(value: unknown): PublicTeamMatchViewer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!isTeamMatchViewerRole(row.role)) return null;
  return {
    role: row.role,
    teamId: typeof row.teamId === "string" ? row.teamId : null,
  };
}

function parseUserList(value: unknown): PublicUser[] | null {
  if (!Array.isArray(value)) return null;
  const users = value
    .map(parsePublicUser)
    .filter((item): item is PublicUser => !!item);
  return users.length === value.length ? users : null;
}

export function parseTeamMatch(
  value: unknown,
  options: ParseTeamMatchOptions = {},
): PublicTeamMatch | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const homeTeam = parseTeamRef(row.homeTeam);
  const viewer = parseViewer(row.viewer);
  const lineups = row.lineups;
  if (
    typeof row.id !== "string" ||
    !isTeamMatchSport(row.sport) ||
    !isTeamMatchStatus(row.status) ||
    !homeTeam ||
    !viewer ||
    !lineups ||
    typeof lineups !== "object" ||
    typeof row.createdBy !== "string" ||
    typeof row.createdAt !== "string" ||
    typeof row.updatedAt !== "string"
  ) {
    return null;
  }

  const home = parseUserList((lineups as { home?: unknown }).home);
  const away = parseUserList((lineups as { away?: unknown }).away);
  if (!home || !away) return null;

  let awayTeam: PublicTeamRef | null = null;
  if (row.awayTeam != null) {
    awayTeam = parseTeamRef(row.awayTeam);
    if (!awayTeam) return null;
  }

  let scorecard: PublicScorecard | null = null;
  if (row.scorecard != null) {
    scorecard = parseScorecard(row.scorecard);
    if (!scorecard) return null;
  }

  const rawToken =
    typeof row.challengeToken === "string" ? row.challengeToken : null;

  return {
    id: row.id,
    sport: row.sport,
    status: row.status,
    homeTeam,
    awayTeam,
    venueCmsId: typeof row.venueCmsId === "string" ? row.venueCmsId : null,
    startsAt: typeof row.startsAt === "string" ? row.startsAt : null,
    challengeToken: options.keepChallengeToken ? rawToken : null,
    lineups: { home, away },
    scorecard,
    winnerTeamId: typeof row.winnerTeamId === "string" ? row.winnerTeamId : null,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    viewer,
  };
}

export function parseTeamMatchList(value: unknown): PublicTeamMatch[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => parseTeamMatch(item))
    .filter((item): item is PublicTeamMatch => !!item);
}

export function parseMineSnapshot(body: unknown): TeamMatchesMineSnapshot {
  if (!body || typeof body !== "object") {
    return emptyMineSnapshot();
  }
  const row = body as Record<string, unknown>;
  return {
    upcoming: parseTeamMatchList(row.upcoming).map(toTeamMatchPreview),
    recent: parseTeamMatchList(row.recent).map(toTeamMatchPreview),
  };
}

export function emptyMineSnapshot(): TeamMatchesMineSnapshot {
  return { upcoming: [], recent: [] };
}

function matchFromBody(
  body: unknown,
  options: ParseTeamMatchOptions = {},
): PublicTeamMatch | null {
  if (!body || typeof body !== "object") return null;
  return parseTeamMatch((body as { match?: unknown }).match, options);
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

async function readMatchResponse(
  res: Response,
  fallback: string,
  options: ParseTeamMatchOptions = {},
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  const body = await readJson(res);
  if (!res.ok) {
    return {
      ok: false,
      error: errorFromBody(body, fallback),
      status: res.status,
    };
  }
  const match = matchFromBody(body, options);
  if (!match) {
    return { ok: false, error: "Unexpected team match response", status: 500 };
  }
  return { ok: true, value: match };
}

export async function createTeamMatchWith(
  input: CreateTeamMatchInput,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  const built = buildCreateChallengePayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamMatchesRootUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readMatchResponse(res, "Could not create challenge", {
      keepChallengeToken: true,
    });
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

export async function joinTeamMatchWith(
  input: JoinTeamMatchInput,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  const built = buildJoinChallengePayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamMatchJoinUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readMatchResponse(res, "Could not join challenge");
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

export async function getTeamMatchWith(
  id: string,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team match id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamMatchUrl(deps.baseUrl, trimmed), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    return readMatchResponse(res, `Could not load team match (${res.status})`);
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

async function postMatchAction(
  id: string,
  action: "accept" | "decline" | "cancel" | "complete",
  deps: TeamMatchesDeps,
  body?: unknown,
  fallback = "Could not update team match",
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team match id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamMatchActionUrl(deps.baseUrl, trimmed, action),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, body !== undefined),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: deps.signal,
      },
    );
    return readMatchResponse(res, fallback);
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

export async function acceptTeamMatchWith(
  id: string,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  return postMatchAction(id, "accept", deps, undefined, "Could not accept challenge");
}

export async function declineTeamMatchWith(
  id: string,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  return postMatchAction(id, "decline", deps, undefined, "Could not decline challenge");
}

export async function cancelTeamMatchWith(
  id: string,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  return postMatchAction(id, "cancel", deps, undefined, "Could not cancel match");
}

export async function completeTeamMatchWith(
  id: string,
  winnerTeamId: string | null | undefined,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  return postMatchAction(
    id,
    "complete",
    deps,
    buildCompletePayload(winnerTeamId),
    "Could not complete match",
  );
}

export async function scheduleTeamMatchWith(
  id: string,
  input: ScheduleTeamMatchInput,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  const trimmed = id.trim();
  const built = buildSchedulePayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team match id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamMatchUrl(deps.baseUrl, trimmed), {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readMatchResponse(res, "Could not update schedule");
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

export async function setTeamMatchLineupWith(
  id: string,
  input: SetLineupInput,
  sport: TeamMatchSport,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  const trimmed = id.trim();
  const built = buildLineupPayload(input, sport);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team match id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamMatchActionUrl(deps.baseUrl, trimmed, "lineup"),
      {
        method: "PUT",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    return readMatchResponse(res, "Could not save lineup");
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

export async function startTeamMatchWith(
  id: string,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<StartTeamMatchResult>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team match id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamMatchActionUrl(deps.baseUrl, trimmed, "start"),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify({}),
        signal: deps.signal,
      },
    );
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, "Could not start team match"),
        status: res.status,
      };
    }
    const match = matchFromBody(body);
    const scorecard = parseScorecard(
      body && typeof body === "object"
        ? (body as { scorecard?: unknown }).scorecard
        : null,
    );
    if (!match || !scorecard) {
      return { ok: false, error: "Unexpected start response", status: 500 };
    }
    return { ok: true, value: { match, scorecard } };
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

export async function listTeamMatchesWith(
  teamId: string,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<TeamMatchPreview[]>> {
  const trimmed = teamId.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamMatchesForTeamUrl(deps.baseUrl, trimmed),
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
        error: errorFromBody(body, `Could not load matches (${res.status})`),
        status: res.status,
      };
    }
    const matches = parseTeamMatchList(
      body && typeof body === "object"
        ? (body as { matches?: unknown }).matches
        : null,
    ).map(toTeamMatchPreview);
    return { ok: true, value: matches };
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

export async function listMyTeamMatchesWith(
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<TeamMatchesMineSnapshot>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamMatchMineUrl(deps.baseUrl), {
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
        error: errorFromBody(body, `Could not load matches (${res.status})`),
        status: res.status,
      };
    }
    return { ok: true, value: parseMineSnapshot(body) };
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

export async function searchTeamsWith(
  sport: string,
  query: string,
  deps: TeamMatchesDeps,
): Promise<TeamMatchesResult<PublicTeamRef[]>> {
  const trimmedSport = sport.trim();
  if (!trimmedSport) return { ok: false, error: "Sport is required", status: 400 };
  if (!shouldSearchTeams(query)) {
    return { ok: true, value: [] };
  }
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamsSearchUrl(deps.baseUrl, trimmedSport, query),
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
        error: errorFromBody(body, `Could not search teams (${res.status})`),
        status: res.status,
      };
    }
    const raw =
      body && typeof body === "object"
        ? (body as { teams?: unknown }).teams
        : null;
    const teams = Array.isArray(raw)
      ? raw.map(parseTeamRef).filter((item): item is PublicTeamRef => !!item)
      : [];
    return { ok: true, value: teams };
  } catch {
    return { ok: false, error: "Could not reach team matches API", status: 0 };
  }
}

function browserDeps(timeoutMs: number, cookie?: string): TeamMatchesDeps {
  return {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie,
    signal: AbortSignal.timeout(timeoutMs),
  };
}

export async function listTeamMatches(
  teamId: string,
  options: { cookie?: string } = {},
): Promise<TeamMatchPreview[]> {
  if (!isApiConfigured()) return [];
  const result = await listTeamMatchesWith(teamId, browserDeps(8000, options.cookie));
  return result.ok ? result.value : [];
}

export async function listMyTeamMatches(options: {
  cookie?: string;
} = {}): Promise<TeamMatchesMineSnapshot> {
  if (!isApiConfigured()) return emptyMineSnapshot();
  const result = await listMyTeamMatchesWith(browserDeps(8000, options.cookie));
  return result.ok ? result.value : emptyMineSnapshot();
}

export async function getTeamMatch(
  id: string,
  options: { cookie?: string } = {},
): Promise<PublicTeamMatch | null> {
  if (!isApiConfigured()) return null;
  const result = await getTeamMatchWith(id, browserDeps(8000, options.cookie));
  return result.ok ? result.value : null;
}

export async function createTeamMatch(
  input: CreateTeamMatchInput,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return createTeamMatchWith(input, browserDeps(10000));
}

export async function joinTeamMatch(
  input: JoinTeamMatchInput,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return joinTeamMatchWith(input, browserDeps(10000));
}

export async function acceptTeamMatch(
  id: string,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return acceptTeamMatchWith(id, browserDeps(10000));
}

export async function declineTeamMatch(
  id: string,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return declineTeamMatchWith(id, browserDeps(10000));
}

export async function cancelTeamMatch(
  id: string,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return cancelTeamMatchWith(id, browserDeps(10000));
}

export async function scheduleTeamMatch(
  id: string,
  input: ScheduleTeamMatchInput,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return scheduleTeamMatchWith(id, input, browserDeps(10000));
}

export async function setTeamMatchLineup(
  id: string,
  input: SetLineupInput,
  sport: TeamMatchSport,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return setTeamMatchLineupWith(id, input, sport, browserDeps(10000));
}

export async function startTeamMatch(
  id: string,
): Promise<TeamMatchesResult<StartTeamMatchResult>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return startTeamMatchWith(id, browserDeps(15000));
}

export async function completeTeamMatch(
  id: string,
  winnerTeamId?: string | null,
): Promise<TeamMatchesResult<PublicTeamMatch>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return completeTeamMatchWith(id, winnerTeamId, browserDeps(10000));
}

export async function searchTeams(
  sport: string,
  query: string,
): Promise<TeamMatchesResult<PublicTeamRef[]>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return searchTeamsWith(sport, query, browserDeps(8000));
}

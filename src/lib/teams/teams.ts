import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";

/** Known create/filter sports. API may return additional slugs later. */
export const TEAM_SPORTS = ["padel", "golf", "darts"] as const;
export type KnownTeamSport = (typeof TEAM_SPORTS)[number];
export type TeamSport = KnownTeamSport | (string & {});

export const TEAM_ROLES = ["owner", "captain", "member"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const TEAM_MEMBER_STATUSES = ["active", "invited"] as const;
export type TeamMemberStatus = (typeof TEAM_MEMBER_STATUSES)[number];

export const TEAM_LIST_SPORT_ALL = "all" as const;
export type TeamListSportFilter = typeof TEAM_LIST_SPORT_ALL | TeamSport;

export const TEAM_TOURNAMENTS_COMING_LATER =
  "Tournaments — coming later" as const;

export const TEAM_OWNER_LEAVE_ERROR =
  "Owner must transfer ownership before leaving or changing role" as const;

export type PublicTeamMember = {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  role: TeamRole;
  status: TeamMemberStatus;
  joinedAt: string;
};

export type PublicInviteLink = {
  token: string;
  createdAt: string;
};

export type PublicTeamSummary = {
  id: string;
  name: string;
  sport: TeamSport;
  homeVenueCmsId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  myRole: TeamRole;
  myStatus: TeamMemberStatus;
};

export type PublicTeam = PublicTeamSummary & {
  members: PublicTeamMember[];
  inviteLink: PublicInviteLink | null;
};

export type TeamsSnapshot = {
  teams: PublicTeamSummary[];
  pendingInvites: PublicTeamSummary[];
};

export type CreateTeamInput = {
  name: string;
  sport: TeamSport;
  homeVenueCmsId?: string | null;
};

export type UpdateTeamInput = {
  name?: string;
  sport?: TeamSport;
  homeVenueCmsId?: string | null;
};

export type TeamsDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type TeamsResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

export function teamsRootUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/teams`;
}

export function teamJoinUrl(baseUrl: string): string {
  return `${teamsRootUrl(baseUrl)}/join`;
}

export function teamUrl(baseUrl: string, id: string): string {
  return `${teamsRootUrl(baseUrl)}/${encodeURIComponent(id)}`;
}

export function teamInviteUrl(baseUrl: string, id: string): string {
  return `${teamUrl(baseUrl, id)}/invite`;
}

export function teamInviteLinkUrl(baseUrl: string, id: string): string {
  return `${teamUrl(baseUrl, id)}/invite-link`;
}

export function teamLeaveUrl(baseUrl: string, id: string): string {
  return `${teamUrl(baseUrl, id)}/leave`;
}

export function teamTransferUrl(baseUrl: string, id: string): string {
  return `${teamUrl(baseUrl, id)}/transfer-ownership`;
}

export function teamMemberUrl(
  baseUrl: string,
  id: string,
  userId: string,
): string {
  return `${teamUrl(baseUrl, id)}/members/${encodeURIComponent(userId)}`;
}

export function teamProfileHref(id: string): string {
  const trimmed = id.trim();
  return trimmed ? `/teams/${encodeURIComponent(trimmed)}` : "/teams";
}

export function teamJoinHref(token: string): string {
  const trimmed = token.trim();
  return trimmed ? `/teams/join/${encodeURIComponent(trimmed)}` : "/teams";
}

export function uniqueUserIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const trimmed = id.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function isKnownTeamSport(value: unknown): value is KnownTeamSport {
  return (
    typeof value === "string" &&
    (TEAM_SPORTS as readonly string[]).includes(value)
  );
}

export function isTeamSport(value: unknown): value is TeamSport {
  return typeof value === "string" && value.trim().length > 0;
}

export function isTeamRole(value: unknown): value is TeamRole {
  return (
    typeof value === "string" &&
    (TEAM_ROLES as readonly string[]).includes(value)
  );
}

export function isTeamMemberStatus(value: unknown): value is TeamMemberStatus {
  return (
    typeof value === "string" &&
    (TEAM_MEMBER_STATUSES as readonly string[]).includes(value)
  );
}

export function formatTeamSport(sport: TeamSport): string {
  if (sport === "padel") return "Padel";
  if (sport === "golf") return "Golf";
  if (sport === "darts") return "Darts";
  const trimmed = sport.trim();
  if (!trimmed) return "Sport";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function formatTeamRole(role: TeamRole): string {
  if (role === "owner") return "Owner";
  if (role === "captain") return "Captain";
  return "Member";
}

export function formatMemberCount(count: number): string {
  return count === 1 ? "1 member" : `${count} members`;
}

export function teamsListEmptyCopy(
  teamCount: number,
  listSport: TeamListSportFilter,
): string {
  if (listSport && listSport !== TEAM_LIST_SPORT_ALL) {
    return `No ${formatTeamSport(listSport)} teams yet.`;
  }
  if (teamCount === 0) return "No teams yet — create one and it’ll show here.";
  return "No teams yet.";
}

/** List-page filter only. Hub sport must not be passed here. */
export function filterTeamsByListSport<T extends Pick<PublicTeamSummary, "sport">>(
  teams: readonly T[],
  listSport: TeamListSportFilter,
): T[] {
  const filter = typeof listSport === "string" ? listSport.trim() : "";
  if (!filter || filter === TEAM_LIST_SPORT_ALL) return [...teams];
  return teams.filter((team) => team.sport === filter);
}

/**
 * People tab always shows every team. Hub sport scopes Home/Play only.
 */
export function teamsVisibleOnHubPeople<T>(
  teams: readonly T[],
  hubSport?: string | null,
): T[] {
  void hubSport;
  return [...teams];
}

export function canEditTeam(role: TeamRole): boolean {
  return role === "owner";
}

export function canAppointCaptains(role: TeamRole): boolean {
  return role === "owner";
}

export function canInvite(role: TeamRole): boolean {
  return role === "owner" || role === "captain";
}

export function canDeleteTeam(role: TeamRole): boolean {
  return role === "owner";
}

export function canTransferOwnership(role: TeamRole): boolean {
  return role === "owner";
}

/** Owner must transfer first — Leave is hidden, not offered. */
export function canLeave(role: TeamRole): boolean {
  return role === "captain" || role === "member";
}

export function canRemoveMember(
  actorRole: TeamRole,
  targetRole: TeamRole,
): boolean {
  if (targetRole === "owner") return false;
  if (actorRole === "owner") return targetRole === "captain" || targetRole === "member";
  if (actorRole === "captain") return targetRole === "member";
  return false;
}

export function canChangeMemberRole(
  actorRole: TeamRole,
  targetRole: TeamRole,
  nextRole: TeamRole,
): boolean {
  if (!canAppointCaptains(actorRole)) return false;
  if (targetRole === "owner" || nextRole === "owner") return false;
  return nextRole === "captain" || nextRole === "member";
}

export function buildCreateTeamPayload(input: CreateTeamInput): {
  ok: true;
  payload: { name: string; sport: string; homeVenueCmsId?: string };
} | { ok: false; error: string } {
  const name = input.name.trim();
  const sport = typeof input.sport === "string" ? input.sport.trim() : "";
  if (!name) return { ok: false, error: "Name is required" };
  if (!sport) return { ok: false, error: "Sport is required" };

  const payload: { name: string; sport: string; homeVenueCmsId?: string } = {
    name,
    sport,
  };
  const venue = input.homeVenueCmsId?.trim();
  if (venue) payload.homeVenueCmsId = venue;
  return { ok: true, payload };
}

export function buildUpdateTeamPayload(input: UpdateTeamInput): {
  ok: true;
  payload: { name?: string; sport?: string; homeVenueCmsId?: string | null };
} | { ok: false; error: string } {
  const payload: {
    name?: string;
    sport?: string;
    homeVenueCmsId?: string | null;
  } = {};

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) return { ok: false, error: "Name is required" };
    payload.name = name;
  }
  if (input.sport !== undefined) {
    const sport = input.sport.trim();
    if (!sport) return { ok: false, error: "Sport is required" };
    payload.sport = sport;
  }
  if (input.homeVenueCmsId !== undefined) {
    const venue = input.homeVenueCmsId?.trim() ?? "";
    payload.homeVenueCmsId = venue || null;
  }

  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "Nothing to update" };
  }
  return { ok: true, payload };
}

export function buildInvitePayload(userIds: readonly string[]): {
  ok: true;
  payload: { userIds: string[] };
} | { ok: false; error: string } {
  const ids = uniqueUserIds(userIds);
  if (ids.length === 0) return { ok: false, error: "Select at least one friend" };
  return { ok: true, payload: { userIds: ids } };
}

export function buildJoinPayload(token: string): {
  ok: true;
  payload: { token: string };
} | { ok: false; error: string } {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "Missing invite token" };
  return { ok: true, payload: { token: trimmed } };
}

export function buildMemberRolePayload(role: TeamRole): {
  ok: true;
  payload: { role: "captain" | "member" };
} | { ok: false; error: string } {
  if (role === "captain" || role === "member") {
    return { ok: true, payload: { role } };
  }
  return { ok: false, error: "Use transfer to change the owner" };
}

export function buildTransferOwnershipPayload(userId: string): {
  ok: true;
  payload: { userId: string };
} | { ok: false; error: string } {
  const trimmed = userId.trim();
  if (!trimmed) return { ok: false, error: "Select a teammate" };
  return { ok: true, payload: { userId: trimmed } };
}

export const TEAM_PROXY_SOURCES = [
  "/api/teams",
  "/api/teams/join",
  "/api/teams/search",
  "/api/teams/:id",
  "/api/teams/:id/invite",
  "/api/teams/:id/invite-link",
  "/api/teams/:id/leave",
  "/api/teams/:id/transfer-ownership",
  "/api/teams/:id/members/:userId",
  "/api/teams/:id/matches",
] as const;

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

export function parseInviteLink(value: unknown): PublicInviteLink | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.token !== "string" || typeof row.createdAt !== "string") {
    return null;
  }
  return { token: row.token, createdAt: row.createdAt };
}

export function parseTeamMember(value: unknown): PublicTeamMember | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.displayName !== "string" ||
    typeof row.handle !== "string" ||
    !isTeamRole(row.role) ||
    !isTeamMemberStatus(row.status) ||
    typeof row.joinedAt !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    displayName: row.displayName,
    handle: row.handle,
    avatarUrl: typeof row.avatarUrl === "string" ? row.avatarUrl : null,
    role: row.role,
    status: row.status,
    joinedAt: row.joinedAt,
  };
}

export function parseTeamSummary(value: unknown): PublicTeamSummary | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    !isTeamSport(row.sport) ||
    typeof row.createdBy !== "string" ||
    typeof row.createdAt !== "string" ||
    typeof row.updatedAt !== "string" ||
    typeof row.memberCount !== "number" ||
    !Number.isFinite(row.memberCount) ||
    !isTeamRole(row.myRole) ||
    !isTeamMemberStatus(row.myStatus)
  ) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    sport: row.sport,
    homeVenueCmsId:
      typeof row.homeVenueCmsId === "string" ? row.homeVenueCmsId : null,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    memberCount: row.memberCount,
    myRole: row.myRole,
    myStatus: row.myStatus,
  };
}

export function parseTeam(value: unknown): PublicTeam | null {
  const summary = parseTeamSummary(value);
  if (!summary || !value || typeof value !== "object") return null;
  const members = (value as { members?: unknown }).members;
  if (!Array.isArray(members)) return null;
  const rawLink = (value as { inviteLink?: unknown }).inviteLink;
  return {
    ...summary,
    members: members
      .map(parseTeamMember)
      .filter((item): item is PublicTeamMember => !!item),
    inviteLink: rawLink == null ? null : parseInviteLink(rawLink),
  };
}

function parseSummaryList(value: unknown): PublicTeamSummary[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseTeamSummary)
    .filter((item): item is PublicTeamSummary => !!item);
}

export function parseTeamsSnapshot(body: unknown): TeamsSnapshot {
  if (!body || typeof body !== "object") {
    return emptyTeamsSnapshot();
  }
  const row = body as Record<string, unknown>;
  return {
    teams: parseSummaryList(row.teams),
    pendingInvites: parseSummaryList(row.pendingInvites),
  };
}

export function emptyTeamsSnapshot(): TeamsSnapshot {
  return { teams: [], pendingInvites: [] };
}

function teamFromBody(body: unknown): PublicTeam | null {
  if (!body || typeof body !== "object") return null;
  return parseTeam((body as { team?: unknown }).team);
}

function browserBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getRailwayApiOrigin();
}

async function readTeamResponse(
  res: Response,
  fallback: string,
): Promise<TeamsResult<PublicTeam>> {
  const body = await readJson(res);
  if (!res.ok) {
    return {
      ok: false,
      error: errorFromBody(body, fallback),
      status: res.status,
    };
  }
  const team = teamFromBody(body);
  if (!team) {
    return { ok: false, error: "Unexpected team response", status: 500 };
  }
  return { ok: true, value: team };
}

export async function listTeamsWith(
  deps: TeamsDeps,
): Promise<TeamsResult<TeamsSnapshot>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamsRootUrl(deps.baseUrl), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });

    if (!res.ok) {
      const body = await readJson(res);
      return {
        ok: false,
        error: errorFromBody(body, `Could not load teams (${res.status})`),
        status: res.status,
      };
    }

    return { ok: true, value: parseTeamsSnapshot(await readJson(res)) };
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function getTeamWith(
  id: string,
  deps: TeamsDeps,
): Promise<TeamsResult<PublicTeam>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamUrl(deps.baseUrl, trimmed), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    return readTeamResponse(res, `Could not load team (${res.status})`);
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function createTeamWith(
  input: CreateTeamInput,
  deps: TeamsDeps,
): Promise<TeamsResult<PublicTeam>> {
  const built = buildCreateTeamPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamsRootUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readTeamResponse(res, "Could not create team");
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function updateTeamWith(
  id: string,
  input: UpdateTeamInput,
  deps: TeamsDeps,
): Promise<TeamsResult<PublicTeam>> {
  const trimmed = id.trim();
  const built = buildUpdateTeamPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamUrl(deps.baseUrl, trimmed), {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readTeamResponse(res, "Could not update team");
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function deleteTeamWith(
  id: string,
  deps: TeamsDeps,
): Promise<TeamsResult<true>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamUrl(deps.baseUrl, trimmed), {
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
        error: errorFromBody(body, "Could not delete team"),
        status: res.status,
      };
    }
    return { ok: true, value: true };
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function inviteTeamMembersWith(
  id: string,
  userIds: readonly string[],
  deps: TeamsDeps,
): Promise<TeamsResult<PublicTeam>> {
  const trimmed = id.trim();
  const built = buildInvitePayload(userIds);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamInviteUrl(deps.baseUrl, trimmed), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readTeamResponse(res, "Could not invite friends");
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function createTeamInviteLinkWith(
  id: string,
  deps: TeamsDeps,
): Promise<TeamsResult<PublicInviteLink>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamInviteLinkUrl(deps.baseUrl, trimmed),
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
        error: errorFromBody(body, "Could not create invite link"),
        status: res.status,
      };
    }
    const link = parseInviteLink(
      body && typeof body === "object"
        ? (body as { inviteLink?: unknown }).inviteLink
        : null,
    );
    if (!link) {
      return { ok: false, error: "Unexpected invite link response", status: 500 };
    }
    return { ok: true, value: link };
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function joinTeamWith(
  token: string,
  deps: TeamsDeps,
): Promise<TeamsResult<PublicTeam>> {
  const built = buildJoinPayload(token);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamJoinUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readTeamResponse(res, "Could not join team");
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function updateTeamMemberRoleWith(
  id: string,
  userId: string,
  role: TeamRole,
  deps: TeamsDeps,
): Promise<TeamsResult<PublicTeam>> {
  const teamId = id.trim();
  const memberId = userId.trim();
  const built = buildMemberRolePayload(role);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!teamId || !memberId || !deps.baseUrl) {
    return { ok: false, error: "Missing team or member id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamMemberUrl(deps.baseUrl, teamId, memberId),
      {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    return readTeamResponse(res, "Could not update member role");
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function removeTeamMemberWith(
  id: string,
  userId: string,
  deps: TeamsDeps,
): Promise<TeamsResult<PublicTeam>> {
  const teamId = id.trim();
  const memberId = userId.trim();
  if (!teamId || !memberId || !deps.baseUrl) {
    return { ok: false, error: "Missing team or member id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamMemberUrl(deps.baseUrl, teamId, memberId),
      {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readTeamResponse(res, "Could not remove member");
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function leaveTeamWith(
  id: string,
  deps: TeamsDeps,
): Promise<TeamsResult<true>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing team id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, teamLeaveUrl(deps.baseUrl, trimmed), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    if (!res.ok) {
      const body = await readJson(res);
      return {
        ok: false,
        error: errorFromBody(body, TEAM_OWNER_LEAVE_ERROR),
        status: res.status,
      };
    }
    return { ok: true, value: true };
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function transferTeamOwnershipWith(
  id: string,
  userId: string,
  deps: TeamsDeps,
): Promise<TeamsResult<PublicTeam>> {
  const teamId = id.trim();
  const built = buildTransferOwnershipPayload(userId);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!teamId || !deps.baseUrl) {
    return { ok: false, error: "Missing team id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      teamTransferUrl(deps.baseUrl, teamId),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    return readTeamResponse(res, "Could not transfer ownership");
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function listTeamsResult(options: {
  cookie?: string;
} = {}): Promise<TeamsResult<TeamsSnapshot>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return listTeamsWith({
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

/** RSC-friendly helper: empty snapshot on 401 / 404 / migration lag. */
export async function listTeams(options: {
  cookie?: string;
} = {}): Promise<TeamsSnapshot> {
  const result = await listTeamsResult(options);
  return result.ok ? result.value : emptyTeamsSnapshot();
}

export async function getTeamResult(
  id: string,
  options: { cookie?: string } = {},
): Promise<TeamsResult<PublicTeam>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return getTeamWith(id, {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie: options.cookie,
    signal: AbortSignal.timeout(8000),
  });
}

/** RSC-friendly helper: null on 404 / migration lag / network failure. */
export async function getTeam(
  id: string,
  options: { cookie?: string } = {},
): Promise<PublicTeam | null> {
  const result = await getTeamResult(id, options);
  return result.ok ? result.value : null;
}

export async function createTeam(
  input: CreateTeamInput,
): Promise<TeamsResult<PublicTeam>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await createTeamWith(input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function updateTeam(
  id: string,
  input: UpdateTeamInput,
): Promise<TeamsResult<PublicTeam>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await updateTeamWith(id, input, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function deleteTeam(id: string): Promise<TeamsResult<true>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await deleteTeamWith(id, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function inviteTeamMembers(
  id: string,
  userIds: readonly string[],
): Promise<TeamsResult<PublicTeam>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await inviteTeamMembersWith(id, userIds, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function createTeamInviteLink(
  id: string,
): Promise<TeamsResult<PublicInviteLink>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await createTeamInviteLinkWith(id, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function joinTeam(token: string): Promise<TeamsResult<PublicTeam>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await joinTeamWith(token, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function updateTeamMemberRole(
  id: string,
  userId: string,
  role: TeamRole,
): Promise<TeamsResult<PublicTeam>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await updateTeamMemberRoleWith(id, userId, role, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function removeTeamMember(
  id: string,
  userId: string,
): Promise<TeamsResult<PublicTeam>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await removeTeamMemberWith(id, userId, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function leaveTeam(id: string): Promise<TeamsResult<true>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await leaveTeamWith(id, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

export async function transferTeamOwnership(
  id: string,
  userId: string,
): Promise<TeamsResult<PublicTeam>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  try {
    return await transferTeamOwnershipWith(id, userId, {
      fetch,
      baseUrl: browserBaseUrl(),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { ok: false, error: "Could not reach teams API", status: 0 };
  }
}

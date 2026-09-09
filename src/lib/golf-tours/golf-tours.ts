import { getRailwayApiOrigin, isApiConfigured } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import type {
  GolfCourseSnapshot,
  GolfHolesPlayed,
  GolfPlayerSlot,
} from "../../types/golf-round.ts";
import { isHolesPlayed, isStartingHole, isValidTeeName, normalizeTeeName } from "../golf/pre-round.ts";
import { attemptEnsureVenueFromCmsWith } from "../venues/appVenueApi.ts";

export const GOLF_TOURS_HREF = "/golf-tours" as const;
export const GOLF_TOURS_NEW_HREF = "/golf-tours/new" as const;

export const GOLF_TOUR_NAME_MAX = 80;
export const GOLF_TOUR_CAMP_NAME_MAX = 40;
export const GOLF_TOUR_STANDING_NAME_MAX = 40;
export const GOLF_TOUR_ROSTER_NAME_MAX = 80;
export const GOLF_TOUR_DEFAULT_CAMP_NAMES = ["Camp A", "Camp B"] as const;
export const GOLF_TOUR_HOW_IT_WORKS_KEY = "golf-tour-how-it-works-v2" as const;

export const GOLF_TOUR_STATUSES = ["draft", "active", "completed"] as const;
export type GolfTourStatus = (typeof GOLF_TOUR_STATUSES)[number];

export const GOLF_TOUR_VIEWER_ROLES = ["host", "player"] as const;
export type GolfTourViewerRole = (typeof GOLF_TOUR_VIEWER_ROLES)[number];

export const GOLF_TOUR_FOURBALL_STATUSES = [
  "pending",
  "live",
  "locked",
  "cancelled",
] as const;
export type GolfTourFourballStatus =
  (typeof GOLF_TOUR_FOURBALL_STATUSES)[number];

export const GOLF_TOUR_FORMATS = ["stroke"] as const;
export type GolfTourFormat = (typeof GOLF_TOUR_FORMATS)[number];

/**
 * Static sources — `mine` must precede `:id` so that segment is not an id.
 * Nest roster under camps, standing-fourballs before/alongside other nested
 * routes, prepare + copy-from under rounds.
 */
export const GOLF_TOUR_PROXY_SOURCES = [
  "/api/golf-tours",
  "/api/golf-tours/mine",
  "/api/golf-tours/:id",
  "/api/golf-tours/:id/complete",
  "/api/golf-tours/:id/camps",
  "/api/golf-tours/:id/camps/:campId",
  "/api/golf-tours/:id/camps/:campId/roster",
  "/api/golf-tours/:id/camps/:campId/roster/:memberId",
  "/api/golf-tours/:id/standing-fourballs",
  "/api/golf-tours/:id/standing-fourballs/:templateId",
  "/api/golf-tours/:id/rounds",
  "/api/golf-tours/:id/rounds/:roundId",
  "/api/golf-tours/:id/rounds/:roundId/prepare",
  "/api/golf-tours/:id/rounds/:roundId/copy-from/:sourceRoundId",
  "/api/golf-tours/:id/rounds/:roundId/fourballs",
  "/api/golf-tours/:id/fourballs/:fourballId",
  "/api/golf-tours/:id/fourballs/:fourballId/start",
  "/api/golf-tours/:id/leaderboard",
] as const;

export type PublicGolfTourPlayer = {
  slot: GolfPlayerSlot;
  userId: string | null;
  displayName: string;
  isGuest: boolean;
  sitOut: boolean;
};

export type PublicGolfTourRosterMember = {
  id: string;
  campId: string;
  userId: string | null;
  displayName: string;
  isGuest: boolean;
};

export type PublicGolfTourStandingFourball = {
  id: string;
  campId: string;
  name: string | null;
  sortOrder: number;
  players: PublicGolfTourPlayer[];
};

export type PublicGolfTourFourball = {
  id: string;
  roundId: string;
  campId: string;
  status: GolfTourFourballStatus;
  golfRoundId: string | null;
  path: string | null;
  standingFourballId: string | null;
  sitOut: boolean;
  players: PublicGolfTourPlayer[];
};

export type PublicGolfTourCamp = {
  id: string;
  name: string;
  color: string | null;
  sortOrder: number;
  roster: PublicGolfTourRosterMember[];
};

export type PublicGolfTourRound = {
  id: string;
  date: string;
  venueCmsId: string;
  label: string | null;
  format: GolfTourFormat;
};

export type PublicGolfTourViewer = {
  role: GolfTourViewerRole;
};

export type PublicGolfTourSummary = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: GolfTourStatus;
  hostUserId: string;
  viewer: PublicGolfTourViewer;
  campCount: number;
  roundCount: number;
  fourballCount: number;
  updatedAt: string;
};

export type PublicGolfTour = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: GolfTourStatus;
  hostUserId: string;
  viewer: PublicGolfTourViewer;
  camps: PublicGolfTourCamp[];
  rounds: PublicGolfTourRound[];
  standingFourballs: PublicGolfTourStandingFourball[];
  fourballs: PublicGolfTourFourball[];
  createdAt: string;
  updatedAt: string;
};

export type PublicLeaderboardPlayer = {
  playerKey: string;
  userId: string | null;
  displayName: string;
  isGuest: boolean;
  avgGross: number;
  playerRoundsCounted: number;
  totalStrokes: number;
};

export type PublicCampLeaderboard = {
  campId: string;
  name: string;
  color: string | null;
  players: PublicLeaderboardPlayer[];
};

export type PublicGolfTourLeaderboard = {
  tourId: string;
  status: GolfTourStatus;
  camps: PublicCampLeaderboard[];
};

export type GolfToursMineLists = {
  hosting: PublicGolfTourSummary[];
  playing: PublicGolfTourSummary[];
  completed: PublicGolfTourSummary[];
};

export type CreateGolfTourInput = {
  name: string;
  startDate: string;
  endDate: string;
  campNames?: string[];
};

export type UpdateGolfTourInput = {
  name?: string;
  startDate?: string;
  endDate?: string;
};

export type EnsureVenueRef = {
  name: string;
  slug: string;
};

export type AddGolfTourRoundInput = {
  date: string;
  venueCmsId: string;
  label?: string | null;
  format?: GolfTourFormat | string;
  venue?: EnsureVenueRef;
};

export type UpdateGolfTourRoundInput = {
  date?: string;
  venueCmsId?: string;
  label?: string | null;
  format?: GolfTourFormat | string;
  venue?: EnsureVenueRef;
};

export type GolfTourPlayerInput = {
  slot: GolfPlayerSlot;
  displayName: string;
  isGuest: boolean;
  userId?: string | null;
  sitOut?: boolean;
};

export type GolfTourRosterMemberInput = {
  displayName: string;
  isGuest: boolean;
  userId?: string | null;
};

export type GolfTourStandingPlayerInput = {
  slot: GolfPlayerSlot;
  rosterMemberId?: string;
  displayName?: string;
  isGuest?: boolean;
  userId?: string | null;
};

export type GolfTourPlayerSitOutInput = {
  slot: GolfPlayerSlot;
  sitOut: boolean;
};

export type UpdateGolfTourFourballInput = {
  players?: GolfTourPlayerInput[];
  campId?: string;
  status?: "cancelled";
  sitOut?: boolean;
  playerSitOuts?: GolfTourPlayerSitOutInput[];
};

export type AddGolfTourStandingFourballInput = {
  campId: string;
  name?: string | null;
  players?: GolfTourStandingPlayerInput[];
  sortOrder?: number;
};

export type UpdateGolfTourStandingFourballInput = {
  campId?: string;
  name?: string | null;
  players?: GolfTourStandingPlayerInput[];
};

export type StartGolfTourFourballInput = {
  teeName: string;
  holesPlayed?: GolfHolesPlayed;
  startingHole?: number;
  course?: GolfCourseSnapshot;
  players?: GolfTourPlayerInput[];
};

export type StartGolfTourFourballResult = {
  tour: PublicGolfTour;
  fourball: PublicGolfTourFourball;
  golfRoundId: string;
  path: string;
};

export type GolfToursDeps = {
  fetch: typeof fetch;
  baseUrl: string;
  cookie?: string;
  signal?: AbortSignal;
};

export type GolfToursResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; status: number };

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

function requestHeaders(cookie?: string, json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return headers;
}

export function golfToursRootUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/golf-tours`;
}

export function golfTourMineUrl(baseUrl: string): string {
  return `${golfToursRootUrl(baseUrl)}/mine`;
}

export function golfTourUrl(baseUrl: string, id: string): string {
  return `${golfToursRootUrl(baseUrl)}/${encodeURIComponent(id)}`;
}

export function golfTourCompleteUrl(baseUrl: string, id: string): string {
  return `${golfTourUrl(baseUrl, id)}/complete`;
}

export function golfTourCampsUrl(baseUrl: string, id: string): string {
  return `${golfTourUrl(baseUrl, id)}/camps`;
}

export function golfTourCampUrl(
  baseUrl: string,
  id: string,
  campId: string,
): string {
  return `${golfTourCampsUrl(baseUrl, id)}/${encodeURIComponent(campId)}`;
}

export function golfTourCampRosterUrl(
  baseUrl: string,
  id: string,
  campId: string,
): string {
  return `${golfTourCampUrl(baseUrl, id, campId)}/roster`;
}

export function golfTourCampRosterMemberUrl(
  baseUrl: string,
  id: string,
  campId: string,
  memberId: string,
): string {
  return `${golfTourCampRosterUrl(baseUrl, id, campId)}/${encodeURIComponent(memberId)}`;
}

export function golfTourStandingFourballsUrl(baseUrl: string, id: string): string {
  return `${golfTourUrl(baseUrl, id)}/standing-fourballs`;
}

export function golfTourStandingFourballUrl(
  baseUrl: string,
  id: string,
  templateId: string,
): string {
  return `${golfTourStandingFourballsUrl(baseUrl, id)}/${encodeURIComponent(templateId)}`;
}

export function golfTourRoundsUrl(baseUrl: string, id: string): string {
  return `${golfTourUrl(baseUrl, id)}/rounds`;
}

export function golfTourRoundUrl(
  baseUrl: string,
  id: string,
  roundId: string,
): string {
  return `${golfTourRoundsUrl(baseUrl, id)}/${encodeURIComponent(roundId)}`;
}

export function golfTourRoundPrepareUrl(
  baseUrl: string,
  id: string,
  roundId: string,
): string {
  return `${golfTourRoundUrl(baseUrl, id, roundId)}/prepare`;
}

export function golfTourRoundCopyFromUrl(
  baseUrl: string,
  id: string,
  roundId: string,
  sourceRoundId: string,
): string {
  return `${golfTourRoundUrl(baseUrl, id, roundId)}/copy-from/${encodeURIComponent(sourceRoundId)}`;
}

export function golfTourRoundFourballsUrl(
  baseUrl: string,
  id: string,
  roundId: string,
): string {
  return `${golfTourRoundUrl(baseUrl, id, roundId)}/fourballs`;
}

export function golfTourFourballUrl(
  baseUrl: string,
  id: string,
  fourballId: string,
): string {
  return `${golfTourUrl(baseUrl, id)}/fourballs/${encodeURIComponent(fourballId)}`;
}

export function golfTourFourballStartUrl(
  baseUrl: string,
  id: string,
  fourballId: string,
): string {
  return `${golfTourFourballUrl(baseUrl, id, fourballId)}/start`;
}

export function golfTourLeaderboardUrl(baseUrl: string, id: string): string {
  return `${golfTourUrl(baseUrl, id)}/leaderboard`;
}

export function golfTourHref(id: string): string {
  const trimmed = id.trim();
  return trimmed
    ? `${GOLF_TOURS_HREF}/${encodeURIComponent(trimmed)}`
    : GOLF_TOURS_HREF;
}

export function golfRoundScorecardHref(golfRoundId: string): string {
  const trimmed = golfRoundId.trim();
  return trimmed ? `/golf/${encodeURIComponent(trimmed)}` : GOLF_TOURS_HREF;
}

/** Prefer the API `path` (`/golf/{id}`); fall back to golfRoundId. */
export function fourballStartNavigateHref(result: {
  path?: string | null;
  golfRoundId?: string | null;
}): string | null {
  const path = result.path?.trim() ?? "";
  if (path.startsWith("/golf/")) return path;
  const id = result.golfRoundId?.trim() ?? "";
  return id ? golfRoundScorecardHref(id) : null;
}

export function isGolfTourStatus(value: unknown): value is GolfTourStatus {
  return (
    typeof value === "string" &&
    (GOLF_TOUR_STATUSES as readonly string[]).includes(value)
  );
}

export function isGolfTourViewerRole(
  value: unknown,
): value is GolfTourViewerRole {
  return (
    typeof value === "string" &&
    (GOLF_TOUR_VIEWER_ROLES as readonly string[]).includes(value)
  );
}

export function isGolfTourFourballStatus(
  value: unknown,
): value is GolfTourFourballStatus {
  return (
    typeof value === "string" &&
    (GOLF_TOUR_FOURBALL_STATUSES as readonly string[]).includes(value)
  );
}

export function isGolfTourFormat(value: unknown): value is GolfTourFormat {
  return (
    typeof value === "string" &&
    (GOLF_TOUR_FORMATS as readonly string[]).includes(value)
  );
}

export function isIsoDay(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const match = trimmed.match(ISO_DAY);
  if (!match) return false;
  const iso = `${match[1]}-${match[2]}-${match[3]}`;
  const date = new Date(`${iso}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso
  );
}

export function parseIsoDay(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (isIsoDay(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (match && isIsoDay(match[1])) return match[1];
  return null;
}

/** Local calendar date as YYYY-MM-DD (matches `<input type="date">`). */
export function todayIsoDay(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysIso(day: string, days: number): string | null {
  const parsed = parseIsoDay(day);
  if (!parsed) return null;
  const date = new Date(`${parsed}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function compareIsoDays(a: string, b: string): number {
  return a.localeCompare(b);
}

export function formatIsoDayLabel(day: string): string {
  const parsed = parseIsoDay(day);
  if (!parsed) return day.trim();
  const date = new Date(`${parsed}T00:00:00.000Z`);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatGolfTourStatus(status: GolfTourStatus): string {
  if (status === "draft") return "Draft";
  if (status === "active") return "Active";
  return "Completed";
}

export function formatFourballStatus(status: GolfTourFourballStatus): string {
  if (status === "pending") return "Pending";
  if (status === "live") return "Live";
  if (status === "locked") return "Locked";
  return "Cancelled";
}

export function formatAvgGross(avg: number): string {
  if (!Number.isFinite(avg)) return "—";
  return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}

export function formatTourDateRange(startDate: string, endDate: string): string {
  const start = formatIsoDayLabel(startDate);
  const end = formatIsoDayLabel(endDate);
  if (startDate === endDate) return start;
  return `${start} – ${end}`;
}

export function isHost(
  tour: Pick<PublicGolfTourSummary, "viewer" | "hostUserId">,
  userId?: string | null,
): boolean {
  if (tour.viewer.role === "host") return true;
  const trimmed = userId?.trim() ?? "";
  return trimmed.length > 0 && tour.hostUserId === trimmed;
}

export function isCompletedStatus(status: GolfTourStatus): boolean {
  return status === "completed";
}

export function canMutateTour(
  tour: Pick<PublicGolfTourSummary, "status" | "viewer" | "hostUserId">,
  userId?: string | null,
): boolean {
  return isHost(tour, userId) && !isCompletedStatus(tour.status);
}

export function canCompleteTour(
  tour: Pick<PublicGolfTourSummary, "status" | "viewer" | "hostUserId">,
  userId?: string | null,
): boolean {
  return isHost(tour, userId) && !isCompletedStatus(tour.status);
}

export type GolfTourHostNextStep =
  | "camps"
  | "roster"
  | "standing"
  | "rounds"
  | "prepare"
  | "start"
  | "complete"
  | "done";

export function tourRosterCount(
  tour: Pick<PublicGolfTour, "camps">,
): number {
  return tour.camps.reduce((sum, camp) => sum + (camp.roster?.length ?? 0), 0);
}

export function standingFourballsForCamp(
  tour: Pick<PublicGolfTour, "standingFourballs">,
  campId: string,
): PublicGolfTourStandingFourball[] {
  return (tour.standingFourballs ?? []).filter(
    (template) => template.campId === campId,
  );
}

export function scoringPlayers(
  fourball: Pick<PublicGolfTourFourball, "sitOut" | "players">,
): PublicGolfTourPlayer[] {
  if (fourball.sitOut) return [];
  return fourball.players.filter((player) => !player.sitOut);
}

export function roundNeedsPrepare(
  tour: Pick<PublicGolfTour, "standingFourballs" | "fourballs">,
  roundId: string,
): boolean {
  const templates = tour.standingFourballs ?? [];
  if (templates.length === 0) return false;
  const instances = fourballsForRound(tour, roundId).filter(
    (fourball) => fourball.status !== "cancelled",
  );
  return templates.some(
    (template) =>
      !instances.some((fourball) => fourball.standingFourballId === template.id),
  );
}

export function previousRound(
  rounds: readonly PublicGolfTourRound[],
  roundId: string,
): PublicGolfTourRound | null {
  const sorted = [...rounds].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );
  const index = sorted.findIndex((round) => round.id === roundId);
  return index > 0 ? (sorted[index - 1] ?? null) : null;
}

/**
 * Roster-first + standing fourballs. After create the API seeds 2 camps,
 * so the host's first blocking step is adding players.
 */
export function golfTourHostNextStep(
  tour: Pick<
    PublicGolfTour,
    "status" | "camps" | "rounds" | "standingFourballs" | "fourballs"
  >,
): GolfTourHostNextStep {
  if (isCompletedStatus(tour.status)) return "done";
  if (tour.camps.length < 2) return "camps";

  const playable = tour.fourballs.filter(
    (fourball) => fourball.status !== "cancelled",
  );
  const startable = playable.some(
    (fourball) =>
      fourball.status === "pending" && scoringPlayers(fourball).length >= 1,
  );
  const inPlay = playable.some(
    (fourball) => fourball.status === "live" || fourball.status === "locked",
  );

  if (tourRosterCount(tour) === 0 && playable.length === 0) return "roster";
  if (
    (tour.standingFourballs ?? []).length === 0 &&
    playable.length === 0
  ) {
    return "standing";
  }
  if (tour.rounds.length === 0) return "rounds";
  if ((tour.standingFourballs ?? []).length > 0) {
    const needsPrepare = tour.rounds.some((round) =>
      roundNeedsPrepare(tour, round.id),
    );
    if (needsPrepare) return "prepare";
  }
  if (startable) return "start";
  if (inPlay) return "complete";
  if (playable.some((fourball) => fourball.status === "pending")) return "start";
  if (playable.length === 0) return "standing";
  return "complete";
}

export function golfTourHostNextStepCopy(step: GolfTourHostNextStep): string {
  if (step === "camps") {
    return "Add at least two camps (teams), then add players to each roster.";
  }
  if (step === "roster") {
    return "Add players to each camp roster. Standing fourballs use this list.";
  }
  if (step === "standing") {
    return "Build standing fourballs (up to 4 players, tagged to a camp). They repeat each round.";
  }
  if (step === "rounds") {
    return "Add a round — date and golf course. Standing groups are prepared automatically.";
  }
  if (step === "prepare") {
    return "Prepare the round to spawn standing fourball instances.";
  }
  if (step === "start") {
    return "Open a scorecard when the group is ready. Sit someone out without rebuilding pairings.";
  }
  if (step === "complete") {
    return "Fourballs are underway. Refresh the leaderboard, then complete the tour when you are done.";
  }
  return "";
}

export function golfTourHostNextStepAction(step: GolfTourHostNextStep): string {
  if (step === "camps") return "Add camp";
  if (step === "roster") return "Add players";
  if (step === "standing") return "Build standing fourballs";
  if (step === "rounds") return "Add round";
  if (step === "prepare") return "Prepare round";
  if (step === "start") return "Start scorecard";
  if (step === "complete") return "Complete tour";
  return "";
}

export function golfTourHostNextStepHref(step: GolfTourHostNextStep): string {
  if (step === "camps" || step === "roster") return "#golf-tour-camps";
  if (step === "standing") return "#golf-tour-standing";
  if (step === "rounds" || step === "prepare" || step === "start") {
    return "#golf-tour-rounds";
  }
  return "#golf-tour-leaderboard";
}

/** Round composer opens when the host is ready for a course + day. */
export function shouldShowHostRoundComposer(
  host: boolean,
  addingRound: boolean,
  nextStep: GolfTourHostNextStep,
): boolean {
  return host && (addingRound || nextStep === "rounds");
}

export function isGolfTourHowItWorksDismissed(
  storage?: Pick<Storage, "getItem"> | null,
): boolean {
  const store = storage ?? (typeof window === "undefined" ? null : window.localStorage);
  if (!store) return false;
  try {
    return store.getItem(GOLF_TOUR_HOW_IT_WORKS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissGolfTourHowItWorks(
  storage?: Pick<Storage, "setItem"> | null,
): void {
  const store = storage ?? (typeof window === "undefined" ? null : window.localStorage);
  if (!store) return;
  try {
    store.setItem(GOLF_TOUR_HOW_IT_WORKS_KEY, "1");
  } catch {
    // ignore quota / private-mode failures
  }
}

export function fourballSharePath(fourball: {
  path?: string | null;
  golfRoundId?: string | null;
}): string | null {
  return fourballStartNavigateHref(fourball);
}

export function absoluteAppUrl(path: string, origin: string): string {
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const root = origin.replace(/\/$/, "");
  return `${root}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export function nextCampPlaceholder(
  camps: readonly Pick<PublicGolfTourCamp, "name">[],
): string {
  const used = new Set(camps.map((camp) => camp.name.trim().toLowerCase()));
  for (let index = 0; index < 26; index += 1) {
    const name = `Camp ${String.fromCharCode(65 + index)}`;
    if (!used.has(name.toLowerCase())) return name;
  }
  return `Camp ${camps.length + 1}`;
}

export function isSeatedRegisteredPlayer(
  fourball: Pick<PublicGolfTourFourball, "players">,
  userId: string | null | undefined,
): boolean {
  const trimmed = userId?.trim() ?? "";
  if (!trimmed) return false;
  return fourball.players.some(
    (player) => !player.isGuest && player.userId === trimmed,
  );
}

export function canStartFourball(
  tour: Pick<PublicGolfTour, "status" | "viewer">,
  fourball: PublicGolfTourFourball,
  userId?: string | null,
): boolean {
  if (isCompletedStatus(tour.status)) return false;
  if (fourball.status === "cancelled") return false;
  if (fourball.status === "live" || fourball.status === "locked") {
    return fourballStartNavigateHref(fourball) !== null;
  }
  if (fourball.status !== "pending") return false;
  if (fourball.sitOut) return false;
  if (scoringPlayers(fourball).length < 1) return false;
  if (tour.viewer.role === "host") return true;
  return isSeatedRegisteredPlayer(fourball, userId);
}

export function fourballsForRound(
  tour: Pick<PublicGolfTour, "fourballs">,
  roundId: string,
): PublicGolfTourFourball[] {
  return tour.fourballs.filter((fourball) => fourball.roundId === roundId);
}

export function campById(
  tour: Pick<PublicGolfTour, "camps">,
  campId: string,
): PublicGolfTourCamp | null {
  return tour.camps.find((camp) => camp.id === campId) ?? null;
}

export function roundById(
  tour: Pick<PublicGolfTour, "rounds">,
  roundId: string,
): PublicGolfTourRound | null {
  return tour.rounds.find((round) => round.id === roundId) ?? null;
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

export function partitionMineTours(
  tours: readonly PublicGolfTourSummary[],
): GolfToursMineLists {
  const hosting = tours.filter(
    (row) => row.viewer.role === "host" && row.status !== "completed",
  );
  const hostingIds = new Set(hosting.map((row) => row.id));
  const playing = tours.filter(
    (row) =>
      row.viewer.role === "player" &&
      row.status !== "completed" &&
      !hostingIds.has(row.id),
  );
  const completed = uniqueById(
    tours.filter((row) => row.status === "completed"),
  );
  return { hosting, playing, completed };
}

function trimName(value: string, max: number, field: string):
  | { ok: true; value: string }
  | { ok: false; error: string } {
  const name = value.trim();
  if (!name) return { ok: false, error: `${field} is required` };
  if (name.length > max) {
    return { ok: false, error: `${field} must be ${max} characters or fewer` };
  }
  return { ok: true, value: name };
}

function requireIsoDay(
  value: string,
  field: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const parsed = parseIsoDay(value);
  if (!parsed) {
    return { ok: false, error: `${field} must be an ISO date (YYYY-MM-DD)` };
  }
  return { ok: true, value: parsed };
}

export function buildCreateGolfTourPayload(input: CreateGolfTourInput):
  | {
      ok: true;
      payload: {
        name: string;
        startDate: string;
        endDate: string;
        campNames?: string[];
      };
    }
  | { ok: false; error: string } {
  const name = trimName(input.name, GOLF_TOUR_NAME_MAX, "Name");
  if (!name.ok) return name;
  const startDate = requireIsoDay(input.startDate, "startDate");
  if (!startDate.ok) return startDate;
  const endDate = requireIsoDay(input.endDate, "endDate");
  if (!endDate.ok) return endDate;
  if (compareIsoDays(endDate.value, startDate.value) < 0) {
    return { ok: false, error: "endDate must be on or after startDate" };
  }

  const payload: {
    name: string;
    startDate: string;
    endDate: string;
    campNames?: string[];
  } = {
    name: name.value,
    startDate: startDate.value,
    endDate: endDate.value,
  };

  if (input.campNames) {
    const campNames = input.campNames
      .map((row) => row.trim())
      .filter(Boolean);
    if (campNames.length > 0 && campNames.length < 2) {
      return { ok: false, error: "Provide at least two camp names" };
    }
    for (const camp of campNames) {
      if (camp.length > GOLF_TOUR_CAMP_NAME_MAX) {
        return {
          ok: false,
          error: `Camp names must be ${GOLF_TOUR_CAMP_NAME_MAX} characters or fewer`,
        };
      }
    }
    if (campNames.length >= 2) payload.campNames = campNames;
  }

  return { ok: true, payload };
}

export function buildUpdateGolfTourPayload(input: UpdateGolfTourInput):
  | {
      ok: true;
      payload: { name?: string; startDate?: string; endDate?: string };
    }
  | { ok: false; error: string } {
  const payload: { name?: string; startDate?: string; endDate?: string } = {};
  if (input.name !== undefined) {
    const name = trimName(input.name, GOLF_TOUR_NAME_MAX, "Name");
    if (!name.ok) return name;
    payload.name = name.value;
  }
  if (input.startDate !== undefined) {
    const startDate = requireIsoDay(input.startDate, "startDate");
    if (!startDate.ok) return startDate;
    payload.startDate = startDate.value;
  }
  if (input.endDate !== undefined) {
    const endDate = requireIsoDay(input.endDate, "endDate");
    if (!endDate.ok) return endDate;
    payload.endDate = endDate.value;
  }
  if (
    payload.startDate &&
    payload.endDate &&
    compareIsoDays(payload.endDate, payload.startDate) < 0
  ) {
    return { ok: false, error: "endDate must be on or after startDate" };
  }
  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "Nothing to update" };
  }
  return { ok: true, payload };
}

export function buildCampPayload(input: { name: string; color?: string | null }):
  | { ok: true; payload: { name: string; color?: string | null } }
  | { ok: false; error: string } {
  const name = trimName(input.name, GOLF_TOUR_CAMP_NAME_MAX, "Camp name");
  if (!name.ok) return name;
  const payload: { name: string; color?: string | null } = { name: name.value };
  if (input.color !== undefined) {
    const color = input.color?.trim() ?? "";
    payload.color = color || null;
  }
  return { ok: true, payload };
}

export function buildRoundPayload(input: AddGolfTourRoundInput):
  | {
      ok: true;
      payload: {
        date: string;
        venueCmsId: string;
        label?: string | null;
        format?: GolfTourFormat;
      };
    }
  | { ok: false; error: string } {
  const date = requireIsoDay(input.date, "date");
  if (!date.ok) return date;
  const venueCmsId = input.venueCmsId.trim();
  if (!venueCmsId) return { ok: false, error: "Pick a golf course" };
  const payload: {
    date: string;
    venueCmsId: string;
    label?: string | null;
    format?: GolfTourFormat;
  } = { date: date.value, venueCmsId };
  if (input.label !== undefined) {
    const label = input.label?.trim() ?? "";
    payload.label = label || null;
  }
  if (input.format !== undefined) {
    if (!isGolfTourFormat(input.format)) {
      return { ok: false, error: "v1 only supports stroke play" };
    }
    payload.format = input.format;
  }
  return { ok: true, payload };
}

export function buildPlayersPayload(
  players: readonly GolfTourPlayerInput[] | undefined,
):
  | { ok: true; players: GolfTourPlayerInput[] }
  | { ok: false; error: string } {
  if (!players) return { ok: true, players: [] };
  const next: GolfTourPlayerInput[] = [];
  const seen = new Set<GolfPlayerSlot>();
  for (const player of players) {
    const displayName = player.displayName.trim();
    if (!displayName) continue;
    if (seen.has(player.slot)) {
      return { ok: false, error: "Each player slot must be unique" };
    }
    seen.add(player.slot);
    const userId = player.userId?.trim() || null;
    const isGuest = player.isGuest || !userId;
    next.push({
      slot: player.slot,
      displayName,
      isGuest,
      userId: isGuest ? null : userId,
      ...(player.sitOut ? { sitOut: true } : {}),
    });
  }
  return { ok: true, players: next };
}

export function buildRosterPayload(input: GolfTourRosterMemberInput):
  | { ok: true; payload: GolfTourRosterMemberInput }
  | { ok: false; error: string } {
  const displayName = trimName(
    input.displayName,
    GOLF_TOUR_ROSTER_NAME_MAX,
    "Player name",
  );
  if (!displayName.ok) return displayName;
  const userId = input.userId?.trim() || null;
  const isGuest = input.isGuest || !userId;
  return {
    ok: true,
    payload: {
      displayName: displayName.value,
      isGuest,
      userId: isGuest ? null : userId,
    },
  };
}

export function buildStandingPlayersPayload(
  players: readonly GolfTourStandingPlayerInput[] | undefined,
):
  | { ok: true; players: GolfTourStandingPlayerInput[] }
  | { ok: false; error: string } {
  if (!players) return { ok: true, players: [] };
  const next: GolfTourStandingPlayerInput[] = [];
  const seen = new Set<GolfPlayerSlot>();
  for (const player of players) {
    if (seen.has(player.slot)) {
      return { ok: false, error: "Each player slot must be unique" };
    }
    seen.add(player.slot);
    const rosterMemberId = player.rosterMemberId?.trim() || "";
    if (rosterMemberId) {
      next.push({ slot: player.slot, rosterMemberId });
      continue;
    }
    const displayName = player.displayName?.trim() ?? "";
    if (!displayName) continue;
    const userId = player.userId?.trim() || null;
    const isGuest = player.isGuest || !userId;
    next.push({
      slot: player.slot,
      displayName,
      isGuest,
      userId: isGuest ? null : userId,
    });
  }
  return { ok: true, players: next };
}

export function buildStandingFourballPayload(
  input: AddGolfTourStandingFourballInput,
):
  | {
      ok: true;
      payload: {
        campId: string;
        name?: string | null;
        players?: GolfTourStandingPlayerInput[];
        sortOrder?: number;
      };
    }
  | { ok: false; error: string } {
  const campId = input.campId.trim();
  if (!campId) return { ok: false, error: "Pick a camp for this fourball" };
  const payload: {
    campId: string;
    name?: string | null;
    players?: GolfTourStandingPlayerInput[];
    sortOrder?: number;
  } = { campId };
  if (input.name !== undefined) {
    const name = input.name?.trim() ?? "";
    if (name.length > GOLF_TOUR_STANDING_NAME_MAX) {
      return {
        ok: false,
        error: `Name must be ${GOLF_TOUR_STANDING_NAME_MAX} characters or fewer`,
      };
    }
    payload.name = name || null;
  }
  if (input.players) {
    const players = buildStandingPlayersPayload(input.players);
    if (!players.ok) return players;
    if (players.players.length > 4) {
      return { ok: false, error: "Standing fourballs can have at most 4 players" };
    }
    if (players.players.length > 0) payload.players = players.players;
  }
  if (input.sortOrder !== undefined) {
    if (!Number.isFinite(input.sortOrder)) {
      return { ok: false, error: "sortOrder must be a number" };
    }
    payload.sortOrder = input.sortOrder;
  }
  return { ok: true, payload };
}

export function buildPlayerSitOutsPayload(
  updates: readonly GolfTourPlayerSitOutInput[] | undefined,
):
  | { ok: true; playerSitOuts: GolfTourPlayerSitOutInput[] }
  | { ok: false; error: string } {
  if (!updates || updates.length === 0) {
    return { ok: false, error: "playerSitOuts must be a non-empty array" };
  }
  const seen = new Set<GolfPlayerSlot>();
  const next: GolfTourPlayerSitOutInput[] = [];
  for (const row of updates) {
    if (seen.has(row.slot)) {
      return { ok: false, error: "Each player slot must be unique" };
    }
    seen.add(row.slot);
    next.push({ slot: row.slot, sitOut: Boolean(row.sitOut) });
  }
  return { ok: true, playerSitOuts: next };
}

export function buildStartFourballPayload(input: StartGolfTourFourballInput):
  | {
      ok: true;
      payload: {
        teeName: string;
        holesPlayed?: GolfHolesPlayed;
        startingHole?: number;
        course?: GolfCourseSnapshot;
        players?: GolfTourPlayerInput[];
      };
    }
  | { ok: false; error: string } {
  if (!isValidTeeName(input.teeName)) {
    return { ok: false, error: "Pick a tee before starting" };
  }
  const payload: {
    teeName: string;
    holesPlayed?: GolfHolesPlayed;
    startingHole?: number;
    course?: GolfCourseSnapshot;
    players?: GolfTourPlayerInput[];
  } = { teeName: normalizeTeeName(input.teeName) };

  if (input.holesPlayed !== undefined) {
    if (!isHolesPlayed(input.holesPlayed)) {
      return { ok: false, error: "Holes played must be 9 or 18" };
    }
    payload.holesPlayed = input.holesPlayed;
  }
  if (input.startingHole !== undefined) {
    if (!isStartingHole(input.startingHole)) {
      return { ok: false, error: "Starting hole must be 1–18" };
    }
    payload.startingHole = input.startingHole;
  }
  if (input.course) payload.course = input.course;
  if (input.players) {
    const players = buildPlayersPayload(input.players);
    if (!players.ok) return players;
    if (players.players.length > 0) payload.players = players.players;
  }
  return { ok: true, payload };
}

function parseSlot(value: unknown): GolfPlayerSlot | null {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return null;
}

export function parseGolfTourPlayer(value: unknown): PublicGolfTourPlayer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const slot = parseSlot(row.slot);
  if (!slot || typeof row.displayName !== "string" || !row.displayName.trim()) {
    return null;
  }
  return {
    slot,
    displayName: row.displayName,
    isGuest: Boolean(row.isGuest) || !row.userId,
    userId: typeof row.userId === "string" && row.userId.trim() ? row.userId : null,
    sitOut: Boolean(row.sitOut),
  };
}

export function parseGolfTourRosterMember(
  value: unknown,
): PublicGolfTourRosterMember | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.campId !== "string" ||
    typeof row.displayName !== "string" ||
    !row.displayName.trim()
  ) {
    return null;
  }
  return {
    id: row.id,
    campId: row.campId,
    displayName: row.displayName,
    isGuest: Boolean(row.isGuest) || !row.userId,
    userId: typeof row.userId === "string" && row.userId.trim() ? row.userId : null,
  };
}

export function parseGolfTourStandingFourball(
  value: unknown,
): PublicGolfTourStandingFourball | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.campId !== "string") {
    return null;
  }
  const players = Array.isArray(row.players)
    ? row.players
        .map(parseGolfTourPlayer)
        .filter((item): item is PublicGolfTourPlayer => !!item)
    : [];
  let sortOrder = 0;
  if (typeof row.sortOrder === "number" && Number.isFinite(row.sortOrder)) {
    sortOrder = row.sortOrder;
  }
  return {
    id: row.id,
    campId: row.campId,
    name: typeof row.name === "string" && row.name.trim() ? row.name : null,
    sortOrder,
    players,
  };
}

export function parseGolfTourFourball(
  value: unknown,
): PublicGolfTourFourball | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.roundId !== "string" ||
    typeof row.campId !== "string" ||
    !isGolfTourFourballStatus(row.status) ||
    !Array.isArray(row.players)
  ) {
    return null;
  }
  const players = row.players
    .map(parseGolfTourPlayer)
    .filter((item): item is PublicGolfTourPlayer => !!item);
  return {
    id: row.id,
    roundId: row.roundId,
    campId: row.campId,
    status: row.status,
    golfRoundId: typeof row.golfRoundId === "string" ? row.golfRoundId : null,
    path: typeof row.path === "string" ? row.path : null,
    standingFourballId:
      typeof row.standingFourballId === "string" ? row.standingFourballId : null,
    sitOut: Boolean(row.sitOut),
    players,
  };
}

export function parseGolfTourCamp(value: unknown): PublicGolfTourCamp | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.name !== "string") {
    return null;
  }
  let sortOrder = 0;
  if (typeof row.sortOrder === "number" && Number.isFinite(row.sortOrder)) {
    sortOrder = row.sortOrder;
  } else if (typeof row.sortOrder === "string" && row.sortOrder.trim()) {
    const parsed = Number(row.sortOrder);
    if (Number.isFinite(parsed)) sortOrder = parsed;
  }
  const roster = Array.isArray(row.roster)
    ? row.roster
        .map(parseGolfTourRosterMember)
        .filter((item): item is PublicGolfTourRosterMember => !!item)
    : [];
  return {
    id: row.id,
    name: row.name,
    color: typeof row.color === "string" ? row.color : null,
    sortOrder,
    roster,
  };
}

export function parseGolfTourRound(value: unknown): PublicGolfTourRound | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const date = parseIsoDay(row.date);
  if (
    typeof row.id !== "string" ||
    !date ||
    typeof row.venueCmsId !== "string" ||
    !row.venueCmsId.trim()
  ) {
    return null;
  }
  return {
    id: row.id,
    date,
    venueCmsId: row.venueCmsId,
    label: typeof row.label === "string" ? row.label : null,
    format: isGolfTourFormat(row.format) ? row.format : "stroke",
  };
}

export function parseGolfTourViewer(value: unknown): PublicGolfTourViewer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!isGolfTourViewerRole(row.role)) return null;
  return { role: row.role };
}

export function parseGolfTourSummary(value: unknown): PublicGolfTourSummary | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const viewer = parseGolfTourViewer(row.viewer);
  const startDate = parseIsoDay(row.startDate);
  const endDate = parseIsoDay(row.endDate);
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    !startDate ||
    !endDate ||
    !isGolfTourStatus(row.status) ||
    typeof row.hostUserId !== "string" ||
    typeof row.campCount !== "number" ||
    !Number.isFinite(row.campCount) ||
    typeof row.roundCount !== "number" ||
    !Number.isFinite(row.roundCount) ||
    typeof row.fourballCount !== "number" ||
    !Number.isFinite(row.fourballCount) ||
    typeof row.updatedAt !== "string" ||
    !viewer
  ) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    startDate,
    endDate,
    status: row.status,
    hostUserId: row.hostUserId,
    viewer,
    campCount: row.campCount,
    roundCount: row.roundCount,
    fourballCount: row.fourballCount,
    updatedAt: row.updatedAt,
  };
}

export function parseGolfTour(value: unknown): PublicGolfTour | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const viewer = parseGolfTourViewer(row.viewer);
  const startDate = parseIsoDay(row.startDate);
  const endDate = parseIsoDay(row.endDate);
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    !startDate ||
    !endDate ||
    !isGolfTourStatus(row.status) ||
    typeof row.hostUserId !== "string" ||
    typeof row.createdAt !== "string" ||
    typeof row.updatedAt !== "string" ||
    !viewer ||
    !Array.isArray(row.camps) ||
    !Array.isArray(row.rounds) ||
    !Array.isArray(row.fourballs)
  ) {
    return null;
  }
  const camps = row.camps
    .map(parseGolfTourCamp)
    .filter((item): item is PublicGolfTourCamp => !!item);
  const rounds = row.rounds
    .map(parseGolfTourRound)
    .filter((item): item is PublicGolfTourRound => !!item);
  const fourballs = row.fourballs
    .map(parseGolfTourFourball)
    .filter((item): item is PublicGolfTourFourball => !!item);
  const standingSource = Array.isArray(row.standingFourballs)
    ? row.standingFourballs
    : [];
  const standingFourballs = standingSource
    .map(parseGolfTourStandingFourball)
    .filter((item): item is PublicGolfTourStandingFourball => !!item);
  if (
    camps.length !== row.camps.length ||
    rounds.length !== row.rounds.length ||
    fourballs.length !== row.fourballs.length ||
    standingFourballs.length !== standingSource.length
  ) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    startDate,
    endDate,
    status: row.status,
    hostUserId: row.hostUserId,
    viewer,
    camps,
    rounds,
    standingFourballs,
    fourballs,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function parseGolfTourList(value: unknown): PublicGolfTourSummary[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(parseGolfTourSummary)
    .filter((item): item is PublicGolfTourSummary => !!item);
}

export function parseLeaderboardPlayer(
  value: unknown,
): PublicLeaderboardPlayer | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.playerKey !== "string" ||
    !row.playerKey.trim() ||
    typeof row.displayName !== "string" ||
    !row.displayName.trim() ||
    typeof row.avgGross !== "number" ||
    !Number.isFinite(row.avgGross) ||
    typeof row.playerRoundsCounted !== "number" ||
    !Number.isFinite(row.playerRoundsCounted) ||
    typeof row.totalStrokes !== "number" ||
    !Number.isFinite(row.totalStrokes)
  ) {
    return null;
  }
  return {
    playerKey: row.playerKey,
    userId: typeof row.userId === "string" ? row.userId : null,
    displayName: row.displayName,
    isGuest: Boolean(row.isGuest),
    avgGross: row.avgGross,
    playerRoundsCounted: row.playerRoundsCounted,
    totalStrokes: row.totalStrokes,
  };
}

export function parseCampLeaderboard(value: unknown): PublicCampLeaderboard | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.campId !== "string" ||
    typeof row.name !== "string" ||
    !Array.isArray(row.players)
  ) {
    return null;
  }
  const players = row.players
    .map(parseLeaderboardPlayer)
    .filter((item): item is PublicLeaderboardPlayer => !!item);
  if (players.length !== row.players.length) return null;
  return {
    campId: row.campId,
    name: row.name,
    color: typeof row.color === "string" ? row.color : null,
    players,
  };
}

export function parseGolfTourLeaderboard(
  value: unknown,
): PublicGolfTourLeaderboard | null {
  const row =
    value && typeof value === "object"
      ? ((value as { leaderboard?: unknown }).leaderboard ?? value)
      : null;
  if (!row || typeof row !== "object") return null;
  const body = row as Record<string, unknown>;
  if (
    typeof body.tourId !== "string" ||
    !isGolfTourStatus(body.status) ||
    !Array.isArray(body.camps)
  ) {
    return null;
  }
  const camps = body.camps
    .map(parseCampLeaderboard)
    .filter((item): item is PublicCampLeaderboard => !!item);
  if (camps.length !== body.camps.length) return null;
  return { tourId: body.tourId, status: body.status, camps };
}

function tourFromBody(body: unknown): PublicGolfTour | null {
  if (!body || typeof body !== "object") return null;
  return parseGolfTour((body as { tour?: unknown }).tour);
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

async function readTourResponse(
  res: Response,
  fallback: string,
): Promise<GolfToursResult<PublicGolfTour>> {
  const body = await readJson(res);
  if (!res.ok) {
    return {
      ok: false,
      error: errorFromBody(body, fallback),
      status: res.status,
    };
  }
  const tour = tourFromBody(body);
  if (!tour) {
    return { ok: false, error: "Unexpected golf tour response", status: 500 };
  }
  return { ok: true, value: tour };
}

async function ensureRoundVenue(
  venueCmsId: string,
  venue: EnsureVenueRef | undefined,
  deps: GolfToursDeps,
): Promise<GolfToursResult<true> | null> {
  const name = venue?.name.trim() ?? "";
  const slug = venue?.slug.trim() ?? "";
  if (!name || !slug) return null;
  const ensured = await attemptEnsureVenueFromCmsWith(
    { cmsId: venueCmsId, name, slug },
    {
      fetch: deps.fetch,
      baseUrl: deps.baseUrl,
      cookie: deps.cookie,
      signal: deps.signal,
    },
  );
  if (!ensured.ok) {
    return {
      ok: false,
      error: errorFromBody(ensured.body, "Could not register golf course"),
      status: ensured.status,
    };
  }
  return { ok: true, value: true };
}

export async function createGolfTourWith(
  input: CreateGolfTourInput,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const built = buildCreateGolfTourPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, golfToursRootUrl(deps.baseUrl), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readTourResponse(res, "Could not create golf tour");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function getGolfTourWith(
  id: string,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, golfTourUrl(deps.baseUrl, trimmed), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie),
      signal: deps.signal,
    });
    return readTourResponse(res, `Could not load golf tour (${res.status})`);
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function updateGolfTourWith(
  id: string,
  input: UpdateGolfTourInput,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const built = buildUpdateGolfTourPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour id", status: 400 };
  }

  try {
    const res = await invokeFetch(deps.fetch, golfTourUrl(deps.baseUrl, trimmed), {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: requestHeaders(deps.cookie, true),
      body: JSON.stringify(built.payload),
      signal: deps.signal,
    });
    return readTourResponse(res, "Could not update golf tour");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function completeGolfTourWith(
  id: string,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourCompleteUrl(deps.baseUrl, trimmed),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not complete golf tour");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function addGolfTourCampWith(
  id: string,
  input: { name: string; color?: string | null },
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const built = buildCampPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourCampsUrl(deps.baseUrl, trimmed),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not add camp");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function updateGolfTourCampWith(
  id: string,
  campId: string,
  input: { name?: string; color?: string | null },
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedCamp = campId.trim();
  if (!trimmed || !trimmedCamp || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or camp id", status: 400 };
  }
  const payload: { name?: string; color?: string | null } = {};
  if (input.name !== undefined) {
    const name = trimName(input.name, GOLF_TOUR_CAMP_NAME_MAX, "Camp name");
    if (!name.ok) return { ok: false, error: name.error, status: 400 };
    payload.name = name.value;
  }
  if (input.color !== undefined) {
    payload.color = input.color?.trim() || null;
  }
  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "Nothing to update", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourCampUrl(deps.baseUrl, trimmed, trimmedCamp),
      {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(payload),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not update camp");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function addGolfTourRoundWith(
  id: string,
  input: AddGolfTourRoundInput,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const built = buildRoundPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour id", status: 400 };
  }

  try {
    const ensured = await ensureRoundVenue(
      built.payload.venueCmsId,
      input.venue,
      deps,
    );
    if (ensured && !ensured.ok) return ensured;

    const res = await invokeFetch(
      deps.fetch,
      golfTourRoundsUrl(deps.baseUrl, trimmed),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not add round");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function updateGolfTourRoundWith(
  id: string,
  roundId: string,
  input: UpdateGolfTourRoundInput,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedRound = roundId.trim();
  if (!trimmed || !trimmedRound || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or round id", status: 400 };
  }
  const payload: {
    date?: string;
    venueCmsId?: string;
    label?: string | null;
    format?: GolfTourFormat;
  } = {};
  if (input.date !== undefined) {
    const date = requireIsoDay(input.date, "date");
    if (!date.ok) return { ok: false, error: date.error, status: 400 };
    payload.date = date.value;
  }
  if (input.venueCmsId !== undefined) {
    const venueCmsId = input.venueCmsId.trim();
    if (!venueCmsId) return { ok: false, error: "Pick a golf course", status: 400 };
    payload.venueCmsId = venueCmsId;
  }
  if (input.label !== undefined) {
    payload.label = input.label?.trim() || null;
  }
  if (input.format !== undefined) {
    if (!isGolfTourFormat(input.format)) {
      return { ok: false, error: "v1 only supports stroke play", status: 400 };
    }
    payload.format = input.format;
  }
  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "Nothing to update", status: 400 };
  }

  try {
    if (payload.venueCmsId) {
      const ensured = await ensureRoundVenue(
        payload.venueCmsId,
        input.venue,
        deps,
      );
      if (ensured && !ensured.ok) return ensured;
    }
    const res = await invokeFetch(
      deps.fetch,
      golfTourRoundUrl(deps.baseUrl, trimmed, trimmedRound),
      {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(payload),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not update round");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function addGolfTourFourballWith(
  id: string,
  roundId: string,
  input: { campId: string; players?: GolfTourPlayerInput[] },
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedRound = roundId.trim();
  const campId = input.campId.trim();
  if (!trimmed || !trimmedRound || !campId || !deps.baseUrl) {
    return { ok: false, error: "Pick a camp for this fourball", status: 400 };
  }
  const players = buildPlayersPayload(input.players);
  if (!players.ok) return { ok: false, error: players.error, status: 400 };

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourRoundFourballsUrl(deps.baseUrl, trimmed, trimmedRound),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify({
          campId,
          ...(players.players.length > 0 ? { players: players.players } : {}),
        }),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not add fourball");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function listGolfTourRosterWith(
  id: string,
  campId: string,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTourRosterMember[]>> {
  const trimmed = id.trim();
  const trimmedCamp = campId.trim();
  if (!trimmed || !trimmedCamp || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or camp id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourCampRosterUrl(deps.baseUrl, trimmed, trimmedCamp),
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
        error: errorFromBody(body, "Could not load roster"),
        status: res.status,
      };
    }
    const rows =
      body && typeof body === "object"
        ? (body as { roster?: unknown }).roster
        : null;
    const roster = Array.isArray(rows)
      ? rows
          .map(parseGolfTourRosterMember)
          .filter((item): item is PublicGolfTourRosterMember => !!item)
      : [];
    return { ok: true, value: roster };
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function addGolfTourRosterMemberWith(
  id: string,
  campId: string,
  input: GolfTourRosterMemberInput,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedCamp = campId.trim();
  const built = buildRosterPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !trimmedCamp || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or camp id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourCampRosterUrl(deps.baseUrl, trimmed, trimmedCamp),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not add player");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function updateGolfTourRosterMemberWith(
  id: string,
  campId: string,
  memberId: string,
  input: Partial<GolfTourRosterMemberInput>,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedCamp = campId.trim();
  const trimmedMember = memberId.trim();
  if (!trimmed || !trimmedCamp || !trimmedMember || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour, camp, or member id", status: 400 };
  }
  const payload: {
    displayName?: string;
    isGuest?: boolean;
    userId?: string | null;
  } = {};
  if (input.displayName !== undefined) {
    const name = trimName(
      input.displayName,
      GOLF_TOUR_ROSTER_NAME_MAX,
      "Player name",
    );
    if (!name.ok) return { ok: false, error: name.error, status: 400 };
    payload.displayName = name.value;
  }
  if (input.isGuest !== undefined) payload.isGuest = input.isGuest;
  if (input.userId !== undefined) {
    payload.userId = input.userId?.trim() || null;
  }
  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "Nothing to update", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourCampRosterMemberUrl(deps.baseUrl, trimmed, trimmedCamp, trimmedMember),
      {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(payload),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not update player");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function removeGolfTourRosterMemberWith(
  id: string,
  campId: string,
  memberId: string,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedCamp = campId.trim();
  const trimmedMember = memberId.trim();
  if (!trimmed || !trimmedCamp || !trimmedMember || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour, camp, or member id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourCampRosterMemberUrl(deps.baseUrl, trimmed, trimmedCamp, trimmedMember),
      {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not remove player");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function addGolfTourStandingFourballWith(
  id: string,
  input: AddGolfTourStandingFourballInput,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const built = buildStandingFourballPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourStandingFourballsUrl(deps.baseUrl, trimmed),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not add standing fourball");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function updateGolfTourStandingFourballWith(
  id: string,
  templateId: string,
  input: UpdateGolfTourStandingFourballInput,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedTemplate = templateId.trim();
  if (!trimmed || !trimmedTemplate || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or template id", status: 400 };
  }
  const payload: {
    campId?: string;
    name?: string | null;
    players?: GolfTourStandingPlayerInput[];
  } = {};
  if (input.campId !== undefined) {
    const campId = input.campId.trim();
    if (!campId) return { ok: false, error: "Pick a camp", status: 400 };
    payload.campId = campId;
  }
  if (input.name !== undefined) {
    const name = input.name?.trim() ?? "";
    if (name.length > GOLF_TOUR_STANDING_NAME_MAX) {
      return {
        ok: false,
        error: `Name must be ${GOLF_TOUR_STANDING_NAME_MAX} characters or fewer`,
        status: 400,
      };
    }
    payload.name = name || null;
  }
  if (input.players !== undefined) {
    const players = buildStandingPlayersPayload(input.players);
    if (!players.ok) return { ok: false, error: players.error, status: 400 };
    payload.players = players.players;
  }
  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "Nothing to update", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourStandingFourballUrl(deps.baseUrl, trimmed, trimmedTemplate),
      {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(payload),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not update standing fourball");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function removeGolfTourStandingFourballWith(
  id: string,
  templateId: string,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedTemplate = templateId.trim();
  if (!trimmed || !trimmedTemplate || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or template id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourStandingFourballUrl(deps.baseUrl, trimmed, trimmedTemplate),
      {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not remove standing fourball");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function prepareGolfTourRoundWith(
  id: string,
  roundId: string,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedRound = roundId.trim();
  if (!trimmed || !trimmedRound || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or round id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourRoundPrepareUrl(deps.baseUrl, trimmed, trimmedRound),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not prepare round");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function copyGolfTourRoundFromWith(
  id: string,
  roundId: string,
  sourceRoundId: string,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedRound = roundId.trim();
  const trimmedSource = sourceRoundId.trim();
  if (!trimmed || !trimmedRound || !trimmedSource || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or round id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourRoundCopyFromUrl(deps.baseUrl, trimmed, trimmedRound, trimmedSource),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not copy from previous round");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function updateGolfTourFourballWith(
  id: string,
  fourballId: string,
  input: UpdateGolfTourFourballInput,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTour>> {
  const trimmed = id.trim();
  const trimmedFourball = fourballId.trim();
  if (!trimmed || !trimmedFourball || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or fourball id", status: 400 };
  }
  const payload: UpdateGolfTourFourballInput = {};
  if (input.players !== undefined) {
    const players = buildPlayersPayload(input.players);
    if (!players.ok) return { ok: false, error: players.error, status: 400 };
    payload.players = players.players;
  }
  if (input.campId !== undefined) {
    const campId = input.campId.trim();
    if (!campId) return { ok: false, error: "Pick a camp", status: 400 };
    payload.campId = campId;
  }
  if (input.status !== undefined) {
    if (input.status !== "cancelled") {
      return { ok: false, error: "status can only be set to cancelled", status: 400 };
    }
    payload.status = "cancelled";
  }
  if (input.sitOut !== undefined) {
    payload.sitOut = Boolean(input.sitOut);
  }
  if (input.playerSitOuts !== undefined) {
    const sitOuts = buildPlayerSitOutsPayload(input.playerSitOuts);
    if (!sitOuts.ok) return { ok: false, error: sitOuts.error, status: 400 };
    payload.playerSitOuts = sitOuts.playerSitOuts;
  }
  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "Nothing to update", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourFourballUrl(deps.baseUrl, trimmed, trimmedFourball),
      {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(payload),
        signal: deps.signal,
      },
    );
    return readTourResponse(res, "Could not update fourball");
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function startGolfTourFourballWith(
  id: string,
  fourballId: string,
  input: StartGolfTourFourballInput,
  deps: GolfToursDeps,
): Promise<GolfToursResult<StartGolfTourFourballResult>> {
  const trimmed = id.trim();
  const trimmedFourball = fourballId.trim();
  const built = buildStartFourballPayload(input);
  if (!built.ok) return { ok: false, error: built.error, status: 400 };
  if (!trimmed || !trimmedFourball || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour or fourball id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourFourballStartUrl(deps.baseUrl, trimmed, trimmedFourball),
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: requestHeaders(deps.cookie, true),
        body: JSON.stringify(built.payload),
        signal: deps.signal,
      },
    );
    const body = await readJson(res);
    if (!res.ok) {
      return {
        ok: false,
        error: errorFromBody(body, "Could not start fourball"),
        status: res.status,
      };
    }
    const tour = tourFromBody(body);
    const fourball = parseGolfTourFourball(
      body && typeof body === "object"
        ? (body as { fourball?: unknown }).fourball
        : null,
    );
    const golfRoundId =
      body && typeof body === "object"
        ? (body as { golfRoundId?: unknown }).golfRoundId
        : null;
    const path =
      body && typeof body === "object"
        ? (body as { path?: unknown }).path
        : null;
    const href = fourballStartNavigateHref({
      path: typeof path === "string" ? path : null,
      golfRoundId: typeof golfRoundId === "string" ? golfRoundId : null,
    });
    if (!tour || !fourball || !href || typeof golfRoundId !== "string") {
      return { ok: false, error: "Unexpected start fourball response", status: 500 };
    }
    return {
      ok: true,
      value: {
        tour,
        fourball,
        golfRoundId,
        path: href,
      },
    };
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function getGolfTourLeaderboardWith(
  id: string,
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTourLeaderboard>> {
  const trimmed = id.trim();
  if (!trimmed || !deps.baseUrl) {
    return { ok: false, error: "Missing golf tour id", status: 400 };
  }

  try {
    const res = await invokeFetch(
      deps.fetch,
      golfTourLeaderboardUrl(deps.baseUrl, trimmed),
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
        error: errorFromBody(body, `Could not load leaderboard (${res.status})`),
        status: res.status,
      };
    }
    const leaderboard = parseGolfTourLeaderboard(body);
    if (!leaderboard) {
      return { ok: false, error: "Unexpected leaderboard response", status: 500 };
    }
    return { ok: true, value: leaderboard };
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

export async function listMyGolfToursWith(
  deps: GolfToursDeps,
): Promise<GolfToursResult<PublicGolfTourSummary[]>> {
  if (!deps.baseUrl) {
    return { ok: false, error: "API is not configured", status: 0 };
  }

  try {
    const res = await invokeFetch(deps.fetch, golfTourMineUrl(deps.baseUrl), {
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
        error: errorFromBody(body, `Could not load golf tours (${res.status})`),
        status: res.status,
      };
    }
    return {
      ok: true,
      value: parseGolfTourList(
        body && typeof body === "object"
          ? (body as { tours?: unknown }).tours
          : null,
      ),
    };
  } catch {
    return { ok: false, error: "Could not reach golf tours API", status: 0 };
  }
}

function browserDeps(timeoutMs: number, cookie?: string): GolfToursDeps {
  return {
    fetch,
    baseUrl: browserBaseUrl(),
    cookie,
    signal: AbortSignal.timeout(timeoutMs),
  };
}

export async function listMyGolfTours(options: {
  cookie?: string;
} = {}): Promise<PublicGolfTourSummary[]> {
  if (!isApiConfigured()) return [];
  const result = await listMyGolfToursWith(browserDeps(8000, options.cookie));
  return result.ok ? result.value : [];
}

export async function getGolfTour(
  id: string,
  options: { cookie?: string } = {},
): Promise<PublicGolfTour | null> {
  if (!isApiConfigured()) return null;
  const result = await getGolfTourWith(id, browserDeps(8000, options.cookie));
  return result.ok ? result.value : null;
}

export async function getGolfTourLeaderboard(
  id: string,
  options: { cookie?: string } = {},
): Promise<PublicGolfTourLeaderboard | null> {
  if (!isApiConfigured()) return null;
  const result = await getGolfTourLeaderboardWith(
    id,
    browserDeps(8000, options.cookie),
  );
  return result.ok ? result.value : null;
}

export async function createGolfTour(
  input: CreateGolfTourInput,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return createGolfTourWith(input, browserDeps(10000));
}

export async function updateGolfTour(
  id: string,
  input: UpdateGolfTourInput,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return updateGolfTourWith(id, input, browserDeps(10000));
}

export async function completeGolfTour(
  id: string,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return completeGolfTourWith(id, browserDeps(10000));
}

export async function addGolfTourCamp(
  id: string,
  input: { name: string; color?: string | null },
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return addGolfTourCampWith(id, input, browserDeps(10000));
}

export async function updateGolfTourCamp(
  id: string,
  campId: string,
  input: { name?: string; color?: string | null },
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return updateGolfTourCampWith(id, campId, input, browserDeps(10000));
}

export async function addGolfTourRound(
  id: string,
  input: AddGolfTourRoundInput,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return addGolfTourRoundWith(id, input, browserDeps(10000));
}

export async function updateGolfTourRound(
  id: string,
  roundId: string,
  input: UpdateGolfTourRoundInput,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return updateGolfTourRoundWith(id, roundId, input, browserDeps(10000));
}

export async function addGolfTourFourball(
  id: string,
  roundId: string,
  input: { campId: string; players?: GolfTourPlayerInput[] },
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return addGolfTourFourballWith(id, roundId, input, browserDeps(10000));
}

export async function updateGolfTourFourball(
  id: string,
  fourballId: string,
  input: UpdateGolfTourFourballInput,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return updateGolfTourFourballWith(id, fourballId, input, browserDeps(10000));
}

export async function startGolfTourFourball(
  id: string,
  fourballId: string,
  input: StartGolfTourFourballInput,
): Promise<GolfToursResult<StartGolfTourFourballResult>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return startGolfTourFourballWith(id, fourballId, input, browserDeps(15000));
}

export async function listGolfTourRoster(
  id: string,
  campId: string,
): Promise<GolfToursResult<PublicGolfTourRosterMember[]>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return listGolfTourRosterWith(id, campId, browserDeps(8000));
}

export async function addGolfTourRosterMember(
  id: string,
  campId: string,
  input: GolfTourRosterMemberInput,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return addGolfTourRosterMemberWith(id, campId, input, browserDeps(10000));
}

export async function updateGolfTourRosterMember(
  id: string,
  campId: string,
  memberId: string,
  input: Partial<GolfTourRosterMemberInput>,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return updateGolfTourRosterMemberWith(
    id,
    campId,
    memberId,
    input,
    browserDeps(10000),
  );
}

export async function removeGolfTourRosterMember(
  id: string,
  campId: string,
  memberId: string,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return removeGolfTourRosterMemberWith(id, campId, memberId, browserDeps(10000));
}

export async function addGolfTourStandingFourball(
  id: string,
  input: AddGolfTourStandingFourballInput,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return addGolfTourStandingFourballWith(id, input, browserDeps(10000));
}

export async function updateGolfTourStandingFourball(
  id: string,
  templateId: string,
  input: UpdateGolfTourStandingFourballInput,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return updateGolfTourStandingFourballWith(
    id,
    templateId,
    input,
    browserDeps(10000),
  );
}

export async function removeGolfTourStandingFourball(
  id: string,
  templateId: string,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return removeGolfTourStandingFourballWith(id, templateId, browserDeps(10000));
}

export async function prepareGolfTourRound(
  id: string,
  roundId: string,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return prepareGolfTourRoundWith(id, roundId, browserDeps(10000));
}

export async function copyGolfTourRoundFrom(
  id: string,
  roundId: string,
  sourceRoundId: string,
): Promise<GolfToursResult<PublicGolfTour>> {
  if (!isApiConfigured()) {
    return { ok: false, error: "API is not configured", status: 0 };
  }
  return copyGolfTourRoundFromWith(
    id,
    roundId,
    sourceRoundId,
    browserDeps(10000),
  );
}

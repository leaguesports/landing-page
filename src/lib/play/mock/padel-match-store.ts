/**
 * MOCK localStorage for padel Record a match.
 * The gate is `?mock=1` or the localStorage flag. No network.
 */

import { padelMockVenue } from "./padel-mock-data.ts";
import {
  formatPlayerList,
  playersFromIds,
  teamsReady,
  type PadelDraft,
  type PadelFormat,
} from "./padel-record.ts";
import {
  canSaveMatch,
  formatSetsLine,
  matchWinner,
  setsToSave,
  type PadelSet,
  type PadelSide,
} from "./padel-score.ts";

export const PADEL_MOCK_FLAG_KEY = "leaguesports.play.padel.mock";
export const PADEL_MOCK_MATCHES_KEY = "leaguesports.play.padel.mock.matches";

export const PADEL_MOCK_SHARE_TOAST = "Demo only. Nothing was shared.";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

type Store = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type SavedPadelPlayer = { id: string; name: string };

export type SavedPadelMatch = {
  id: string;
  savedAt: string;
  playedOn: string;
  format: PadelFormat;
  teamA: SavedPadelPlayer[];
  teamB: SavedPadelPlayer[];
  venueId: string | null;
  venueName: string | null;
  sets: PadelSet[];
  winner: PadelSide;
};

export type PadelRecentCard = {
  id: string;
  teams: string;
  score: string;
  detail: string;
  demo: true;
};

export type PadelSummary = {
  formatLabel: "Singles" | "Doubles";
  teamA: string;
  teamB: string;
  sets: string[];
  scoreLine: string;
  winner: "Team A" | "Team B";
  venue: string;
  date: string;
};

export function searchRequestsPadelMock(search: string): boolean {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(raw).get("mock") === "1";
}

export function flagRequestsPadelMock(flag: string | null | undefined): boolean {
  return flag === "1" || flag === "true";
}

export function isPadelMockEnabled(input: {
  search: string;
  flag: string | null | undefined;
}): boolean {
  return searchRequestsPadelMock(input.search) || flagRequestsPadelMock(input.flag);
}

export function readPadelMockFlag(storage: Pick<Store, "getItem"> | null): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(PADEL_MOCK_FLAG_KEY);
  } catch {
    return null;
  }
}

export function readPadelMockEnabled(input: {
  search: string;
  storage: Pick<Store, "getItem"> | null;
}): boolean {
  return isPadelMockEnabled({
    search: input.search,
    flag: readPadelMockFlag(input.storage),
  });
}

/** Record a match opens the mock flow only while the gate is on. */
export function padelRecordDecision(
  mockEnabled: boolean,
): { open: true } | { open: false; notice: "Coming soon" } {
  if (mockEnabled) return { open: true };
  return { open: false, notice: "Coming soon" };
}

export function localDateISO(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatPlayedOn(playedOn: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(playedOn);
  if (!match) return playedOn;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return playedOn;
  return `${Number(match[3])} ${month} ${match[1]}`;
}

function winnerName(winner: PadelSide): "Team A" | "Team B" {
  return winner === "A" ? "Team A" : "Team B";
}

export function summaryFromMatch(match: SavedPadelMatch): PadelSummary {
  return {
    formatLabel: match.format === "doubles" ? "Doubles" : "Singles",
    teamA: formatPlayerList(match.teamA),
    teamB: formatPlayerList(match.teamB),
    sets: match.sets.map((set) => formatSetsLine([set])),
    scoreLine: formatSetsLine(match.sets),
    winner: winnerName(match.winner),
    venue: match.venueName ?? "No venue",
    date: formatPlayedOn(match.playedOn),
  };
}

export function summaryFromDraft(draft: PadelDraft, now: Date): PadelSummary | null {
  const saved = buildSavedMatch(draft, { id: "preview", now });
  return saved ? summaryFromMatch(saved) : null;
}

export function buildSavedMatch(
  draft: PadelDraft,
  input: { id: string; now: Date },
): SavedPadelMatch | null {
  if (!input.id || !teamsReady(draft) || !canSaveMatch(draft.sets)) return null;
  const sets = setsToSave(draft.sets);
  const winner = sets ? matchWinner(sets) : null;
  const teamA = playersFromIds(draft.teamA);
  const teamB = playersFromIds(draft.teamB);
  const playedOn = localDateISO(input.now);
  if (!sets || !winner || !teamA || !teamB || !playedOn) return null;
  const venue = draft.venueId ? padelMockVenue(draft.venueId) : null;
  if (draft.venueId && !venue) return null;
  return {
    id: input.id,
    savedAt: input.now.toISOString(),
    playedOn,
    format: draft.format,
    teamA,
    teamB,
    venueId: venue?.id ?? null,
    venueName: venue?.name ?? null,
    sets,
    winner,
  };
}

function isPlayer(value: unknown): value is SavedPadelPlayer {
  if (!value || typeof value !== "object") return false;
  const player = value as SavedPadelPlayer;
  return typeof player.id === "string" && player.id.length > 0 && typeof player.name === "string" && player.name.length > 0;
}

function isSet(value: unknown): value is PadelSet {
  if (!value || typeof value !== "object") return false;
  const set = value as PadelSet;
  const points = (point: number | null) => point === null || Number.isInteger(point);
  return Number.isInteger(set.gamesA) && Number.isInteger(set.gamesB) && points(set.tiebreakA) && points(set.tiebreakB);
}

function isSavedMatch(value: unknown): value is SavedPadelMatch {
  if (!value || typeof value !== "object") return false;
  const match = value as SavedPadelMatch;
  return (
    typeof match.id === "string" &&
    match.id.length > 0 &&
    typeof match.savedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(match.playedOn) &&
    (match.format === "singles" || match.format === "doubles") &&
    Array.isArray(match.teamA) &&
    match.teamA.every(isPlayer) &&
    Array.isArray(match.teamB) &&
    match.teamB.every(isPlayer) &&
    (match.venueId === null || typeof match.venueId === "string") &&
    (match.venueName === null || typeof match.venueName === "string") &&
    Array.isArray(match.sets) &&
    match.sets.length > 0 &&
    match.sets.every(isSet) &&
    (match.winner === "A" || match.winner === "B")
  );
}

export function orderMatchesNewestFirst(matches: readonly SavedPadelMatch[]): SavedPadelMatch[] {
  return [...matches].sort((a, b) => (a.savedAt < b.savedAt ? 1 : a.savedAt > b.savedAt ? -1 : 0));
}

export function readPadelMatches(storage: Pick<Store, "getItem"> | null): SavedPadelMatch[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(PADEL_MOCK_MATCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return orderMatchesNewestFirst(parsed.filter(isSavedMatch));
  } catch {
    return [];
  }
}

/** Returns the stored list, newest first, or null when the write fails. */
export function savePadelMatch(
  storage: Store | null,
  match: SavedPadelMatch,
): SavedPadelMatch[] | null {
  if (!storage || !isSavedMatch(match)) return null;
  try {
    const next = orderMatchesNewestFirst([
      match,
      ...readPadelMatches(storage).filter((item) => item.id !== match.id),
    ]);
    storage.setItem(PADEL_MOCK_MATCHES_KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}

export function toRecentCard(match: SavedPadelMatch): PadelRecentCard {
  const bits = [`${winnerName(match.winner)} won`, match.venueName, formatPlayedOn(match.playedOn)].filter(
    (bit): bit is string => Boolean(bit),
  );
  return {
    id: match.id,
    teams: `${formatPlayerList(match.teamA)} vs ${formatPlayerList(match.teamB)}`,
    score: formatSetsLine(match.sets),
    detail: bits.join(" · "),
    demo: true,
  };
}

/** Without mock mode the home keeps its empty recent list, even if matches are stored. */
export function recentCardsForHome(
  mockEnabled: boolean,
  matches: readonly SavedPadelMatch[],
): PadelRecentCard[] {
  if (!mockEnabled) return [];
  return matches.map(toRecentCard);
}

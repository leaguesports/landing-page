import type { PadelMatch, SetScore } from "../../types/padel-match.ts";
import { getTeamLabel } from "./padelReducer.ts";

const WHATSAPP_SHARE_ENDPOINT = "https://wa.me/?text=";
const WHATSAPP_TEAM_SEPARATOR = " & ";

export type PadelWhatsAppShareMatch = Pick<
  PadelMatch,
  "id" | "pairings" | "venue"
>;

/** Fields needed to build locked-result share copy. */
export type PadelLockedShareMatch = Pick<
  PadelMatch,
  "id" | "pairings" | "venue" | "sets" | "startsAt" | "lockedAt" | "createdAt"
>;

export type PadelShareTextInput = {
  matchId: string;
  teamALabel: string;
  teamBLabel: string;
  venueName?: string | null;
  origin: string;
};

export type PadelLockedShareTextInput = PadelShareTextInput & {
  scoreLine: string;
  dateLine?: string | null;
};

export type PadelWhatsAppShare = {
  text: string;
  matchUrl: string;
  href: string;
};

/** Absolute `/padel/{id}` URL. `origin` should be `window.location.origin` in the client. */
export function padelMatchAbsoluteUrl(matchId: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}/padel/${encodeURIComponent(matchId)}`;
}

/** Compact set scores for share copy, e.g. `6-4, 7-6 (7-5)`. */
export function formatPadelShareScore(sets: SetScore[]): string {
  return sets
    .map((set) => {
      const games = `${set.gamesA}-${set.gamesB}`;
      if (set.tieBreak) {
        return `${games} (${set.tieBreak.pointsA}-${set.tieBreak.pointsB})`;
      }
      return games;
    })
    .join(", ");
}

/** Short calendar date for share copy (local timezone). */
export function formatPadelShareDate(iso: string): string | null {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function lockedShareDateIso(match: PadelLockedShareMatch): string | null {
  return match.startsAt || match.lockedAt || match.createdAt || null;
}

/** Short mobile WhatsApp body: optional court line, teams, absolute match URL. */
export function padelShareText(input: PadelShareTextInput): string {
  const matchUrl = padelMatchAbsoluteUrl(input.matchId, input.origin);
  const venue = input.venueName?.trim() || null;
  const teams = `${input.teamALabel} vs ${input.teamBLabel}`;
  if (venue) {
    return `Live padel at ${venue}\n${teams}\n${matchUrl}`;
  }
  return `${teams}\n${matchUrl}`;
}

/**
 * Locked-result body: players, set score, optional venue + date, deep link.
 * Keeps live `padelShareText` unchanged.
 */
export function padelLockedShareText(input: PadelLockedShareTextInput): string {
  const matchUrl = padelMatchAbsoluteUrl(input.matchId, input.origin);
  const venue = input.venueName?.trim() || null;
  const teams = `${input.teamALabel} vs ${input.teamBLabel}`;
  const date = input.dateLine?.trim() || null;
  const lines: string[] = [];
  if (venue) {
    lines.push(`Padel result at ${venue}`);
  }
  lines.push(teams);
  if (input.scoreLine.trim()) {
    lines.push(input.scoreLine.trim());
  }
  if (date) {
    lines.push(date);
  }
  lines.push(matchUrl);
  return lines.join("\n");
}

export function padelWhatsAppHref(text: string): string {
  return `${WHATSAPP_SHARE_ENDPOINT}${encodeURIComponent(text)}`;
}

/**
 * One-tap WhatsApp share payload. No phone number — `wa.me/?text=` opens
 * the chat picker (mobile) or WhatsApp Web (desktop).
 */
export function buildPadelWhatsAppShare(
  match: PadelWhatsAppShareMatch,
  origin: string,
): PadelWhatsAppShare {
  const text = padelShareText({
    matchId: match.id,
    teamALabel: getTeamLabel(match, "A", WHATSAPP_TEAM_SEPARATOR),
    teamBLabel: getTeamLabel(match, "B", WHATSAPP_TEAM_SEPARATOR),
    venueName: match.venue?.name ?? null,
    origin,
  });
  return {
    text,
    matchUrl: padelMatchAbsoluteUrl(match.id, origin),
    href: padelWhatsAppHref(text),
  };
}

/** Locked-result share: score + date + deep link (same wa.me encoding as live). */
export function buildPadelLockedShare(
  match: PadelLockedShareMatch,
  origin: string,
): PadelWhatsAppShare {
  const dateIso = lockedShareDateIso(match);
  const text = padelLockedShareText({
    matchId: match.id,
    teamALabel: getTeamLabel(match, "A", WHATSAPP_TEAM_SEPARATOR),
    teamBLabel: getTeamLabel(match, "B", WHATSAPP_TEAM_SEPARATOR),
    venueName: match.venue?.name ?? null,
    scoreLine: formatPadelShareScore(match.sets),
    dateLine: dateIso ? formatPadelShareDate(dateIso) : null,
    origin,
  });
  return {
    text,
    matchUrl: padelMatchAbsoluteUrl(match.id, origin),
    href: padelWhatsAppHref(text),
  };
}

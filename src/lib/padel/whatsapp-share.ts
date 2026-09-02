import type { PadelMatch } from "../../types/padel-match.ts";
import { getTeamLabel } from "./padelReducer.ts";

const WHATSAPP_SHARE_ENDPOINT = "https://wa.me/?text=";
const WHATSAPP_TEAM_SEPARATOR = " & ";

export type PadelWhatsAppShareMatch = Pick<
  PadelMatch,
  "id" | "pairings" | "venue"
>;

export type PadelShareTextInput = {
  matchId: string;
  teamALabel: string;
  teamBLabel: string;
  venueName?: string | null;
  origin: string;
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

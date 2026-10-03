/**
 * Last locked results for a one-sport Play venue.
 *
 * Missing, empty, or failed lookups are an empty list. The page omits the
 * block — no sign-in wall and no loading state.
 */

import { getRailwayApiOrigin } from "../api-origin.ts";
import { formatDartsHistoryPlayers, formatDartsHistoryScore } from "../darts/history.ts";
import { parseDartsHistoryItem } from "../darts/api-match.ts";
import { parseGolfHistoryItem } from "../golf/api-round.ts";
import { formatGolfHistoryPlayers, formatGolfHistoryScore } from "../golf/history.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { parseHistoryItem } from "../padel/api-match.ts";
import {
  formatHistoryOpponents,
  formatHistoryScore,
} from "../padel/history.ts";
import { FIXTURE_TIMEZONE } from "../sports/events-feed.ts";

export const VENUE_LOCKED_RESULT_LIMIT = 3;

export type VenueLockedResult = {
  id: string;
  /** Scorecard for this result. Not a venue page. */
  href: string;
  when: string;
  summary: string;
};

export type LockedResultDeps = {
  fetch?: typeof fetch;
  baseUrl?: string;
};

const WHEN_FORMAT = new Intl.DateTimeFormat("en-ZA", {
  timeZone: FIXTURE_TIMEZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

function resultPath(sportKey: string): string | null {
  if (sportKey === "padel") return "matches";
  if (sportKey === "golf") return "golf-rounds";
  if (sportKey === "darts") return "darts";
  return null;
}

function scorecardHref(sportKey: string, id: string): string | null {
  if (sportKey === "padel") return `/padel/${encodeURIComponent(id)}`;
  if (sportKey === "golf") return `/golf/${encodeURIComponent(id)}`;
  if (sportKey === "darts") return `/darts/${encodeURIComponent(id)}`;
  return null;
}

function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const row = payload as Record<string, unknown>;
  for (const key of ["items", "matches", "rounds", "games", "results"]) {
    if (Array.isArray(row[key])) return row[key];
  }
  return [];
}

function formatWhen(startsAt: string): string {
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return "";
  return WHEN_FORMAT.format(parsed);
}

function summaryParts(parts: string[]): string {
  return parts
    .map((part) => part.trim())
    .filter((part) => part && part !== "—" && part !== "-")
    .join(" · ");
}

function belongsHere(venueCmsId: string | null | undefined, cmsId: string): boolean {
  const listed = venueCmsId?.trim() ?? "";
  if (!listed) return true;
  return listed === cmsId;
}

type ParsedResult = {
  id: string;
  startsAt: string;
  venueCmsId: string | null;
  summary: string;
};

function parseRow(sportKey: string, row: unknown): ParsedResult | null {
  try {
    if (sportKey === "padel") {
      const item = parseHistoryItem(row);
      if (!item?.id) return null;
      return {
        id: item.id,
        startsAt: item.startsAt,
        venueCmsId: item.venueCmsId || null,
        summary: summaryParts([
          formatHistoryOpponents(item.opponents),
          formatHistoryScore(item.score),
        ]),
      };
    }
    if (sportKey === "golf") {
      const item = parseGolfHistoryItem(row);
      if (!item?.id) return null;
      return {
        id: item.id,
        startsAt: item.startsAt,
        venueCmsId: item.venueCmsId || null,
        summary: summaryParts([
          formatGolfHistoryPlayers(item.players),
          formatGolfHistoryScore(item),
        ]),
      };
    }
    if (sportKey === "darts") {
      const item = parseDartsHistoryItem(row);
      if (!item?.id) return null;
      return {
        id: item.id,
        startsAt: item.startsAt,
        venueCmsId: item.venueCmsId,
        summary: summaryParts([
          formatDartsHistoryPlayers(item.players),
          formatDartsHistoryScore(item),
        ]),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function lookupVenueLockedResults(
  cmsId: string,
  sportKey: string,
  deps: LockedResultDeps = {},
): Promise<VenueLockedResult[]> {
  const id = cmsId.trim();
  const path = resultPath(sportKey);
  if (!id || !path) return [];

  const baseUrl = (deps.baseUrl ?? getRailwayApiOrigin()).replace(/\/$/, "");
  if (!baseUrl) return [];

  const fetchImpl = deps.fetch ?? fetch;
  const url = `${baseUrl}/api/venues/${encodeURIComponent(id)}/${path}`;
  let payload: unknown;
  try {
    const response = await invokeFetch(fetchImpl, url, {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) return [];
    payload = await response.json();
  } catch {
    return [];
  }

  const parsed = unwrapList(payload)
    .map((row) => parseRow(sportKey, row))
    .filter((item): item is ParsedResult => Boolean(item))
    .filter((item) => belongsHere(item.venueCmsId, id))
    .filter((item) => item.summary)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .slice(0, VENUE_LOCKED_RESULT_LIMIT);

  return parsed.flatMap((item) => {
    const href = scorecardHref(sportKey, item.id);
    if (!href || href.includes("/venues/")) return [];
    return [
      {
        id: item.id,
        href,
        when: formatWhen(item.startsAt),
        summary: item.summary,
      },
    ];
  });
}

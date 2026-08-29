import { createInitialPadelMatch } from "./padelReducer.ts";
import type {
  CreatePadelMatchInput,
  PadelMatch,
  PadelMatchVenue,
  PadelPairing,
  PadelPlayer,
  PadelRuleset,
  PadelTeamId,
} from "../../types/padel-match.ts";

export const MATCH_API_UNAVAILABLE =
  "Match API is unavailable. The match was not created.";

export type ApiPadelPlayer = {
  userId?: string | null;
  displayName: string;
  isGuest: boolean;
};

export type CreatePadelMatchBody = {
  venueCmsId: string;
  startsAt: string;
  ruleset: PadelRuleset;
  pairings: {
    teamA: [ApiPadelPlayer, ApiPadelPlayer];
    teamB: [ApiPadelPlayer, ApiPadelPlayer];
  };
  servingTeam?: PadelTeamId;
};

export function toApiPlayer(player: PadelPlayer): ApiPadelPlayer {
  if (player.isGuest || !player.userId) {
    return {
      displayName: player.displayName,
      isGuest: true,
      userId: null,
    };
  }
  return {
    userId: player.userId,
    displayName: player.displayName,
    isGuest: false,
  };
}

export function toCreateMatchBody(
  input: CreatePadelMatchInput,
): CreatePadelMatchBody {
  return {
    venueCmsId: input.venueCmsId,
    startsAt: input.startsAt,
    ruleset: input.ruleset,
    pairings: {
      teamA: [
        toApiPlayer(input.pairings.teamA[0]),
        toApiPlayer(input.pairings.teamA[1]),
      ],
      teamB: [
        toApiPlayer(input.pairings.teamB[0]),
        toApiPlayer(input.pairings.teamB[1]),
      ],
    },
    ...(input.servingTeam ? { servingTeam: input.servingTeam } : {}),
  };
}

export function toDatetimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function datetimeLocalToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function fromApiPlayer(player: ApiPadelPlayer, index: number): PadelPlayer {
  const isGuest = Boolean(player.isGuest) || !player.userId;
  const displayName = player.displayName?.trim() || (isGuest ? "Guest" : "Player");
  return {
    id:
      player.userId ||
      `guest_${index}_${displayName.toLowerCase().replace(/\s+/g, "_")}`,
    displayName,
    isGuest,
    userId: player.userId ?? null,
  };
}

function isApiPlayer(value: unknown): value is ApiPadelPlayer {
  if (!value || typeof value !== "object") return false;
  const p = value as ApiPadelPlayer;
  return typeof p.displayName === "string";
}

function parsePairings(value: unknown): PadelPairing | null {
  if (!value || typeof value !== "object") return null;
  const p = value as { teamA?: unknown; teamB?: unknown };
  if (!Array.isArray(p.teamA) || !Array.isArray(p.teamB)) return null;
  if (p.teamA.length !== 2 || p.teamB.length !== 2) return null;
  if (!p.teamA.every(isApiPlayer) || !p.teamB.every(isApiPlayer)) return null;
  return {
    teamA: [fromApiPlayer(p.teamA[0], 0), fromApiPlayer(p.teamA[1], 1)],
    teamB: [fromApiPlayer(p.teamB[0], 2), fromApiPlayer(p.teamB[1], 3)],
  };
}

function parseVenue(value: unknown): PadelMatchVenue | null {
  if (!value || typeof value !== "object") return null;
  const v = value as PadelMatchVenue;
  if (typeof v.id !== "string" || typeof v.name !== "string") return null;
  return {
    id: v.id,
    slug: typeof v.slug === "string" ? v.slug : "",
    name: v.name,
    suburb: v.suburb ?? null,
    city: v.city ?? null,
    latitude: v.latitude ?? null,
    longitude: v.longitude ?? null,
  };
}

function isLiveSnapshot(value: Record<string, unknown>): boolean {
  return (
    typeof value.id === "string" &&
    value.sport === "padel" &&
    Boolean(value.pairings) &&
    Boolean(value.game) &&
    Array.isArray(value.sets)
  );
}

export function parseApiMatch(
  value: unknown,
  fallback?: { venue?: PadelMatchVenue | null },
): PadelMatch | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;

  if (isLiveSnapshot(row)) {
    return row as unknown as PadelMatch;
  }

  const ruleset = row.ruleset as PadelRuleset | undefined;
  if (ruleset !== "golden_point" && ruleset !== "advantage") return null;

  const pairings = parsePairings(row.pairings);
  if (!pairings) return null;

  const venueCmsId =
    typeof row.venueCmsId === "string" && row.venueCmsId.trim()
      ? row.venueCmsId.trim()
      : "";
  const venue =
    parseVenue(row.venue) ??
    fallback?.venue ??
    (venueCmsId
      ? {
          id: venueCmsId,
          slug: "",
          name: "",
          suburb: null,
          city: null,
          latitude: null,
          longitude: null,
        }
      : null);

  const servingTeam: PadelTeamId = row.servingTeam === "B" ? "B" : "A";
  const startsAt =
    typeof row.startsAt === "string" && row.startsAt
      ? row.startsAt
      : undefined;

  const match = createInitialPadelMatch({
    id: row.id,
    ruleset,
    venue,
    pairings,
    servingTeam,
    startsAt,
    venueCmsId: venueCmsId || venue?.id || undefined,
  });

  if (row.status === "locked" || row.status === "finalized") {
    match.status = "finalized";
  } else if (row.status === "live") {
    match.status = "live";
  }

  return match;
}

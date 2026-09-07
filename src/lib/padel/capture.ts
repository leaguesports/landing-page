import type {
  CapturePadelMatchInput,
  CapturePadelSetInput,
  PadelMatch,
  PadelMatchVenue,
  PadelPlayer,
  PadelRuleset,
  PadelTeamId,
} from "../../types/padel-match.ts";
import {
  MATCH_API_ORIGIN_UNCONFIGURED,
  MatchApiError,
  jsonError,
  parseApiMatch,
  toApiPlayer,
  type ApiPadelPlayer,
  type CreatePadelMatchDeps,
} from "./api-match.ts";
import { getLoopbackApiProxyOrigin } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { attemptEnsureVenueFromCmsWith } from "../venues/appVenueApi.ts";

export const CAPTURE_PADEL_PATH = "/api/matches/capture" as const;

export type CapturePadelMatchBody = {
  venueCmsId: string;
  startsAt?: string;
  playedAt?: string;
  ruleset: PadelRuleset;
  servingTeam?: PadelTeamId;
  pairings: {
    teamA: [ApiPadelPlayer, ApiPadelPlayer];
    teamB: [ApiPadelPlayer, ApiPadelPlayer];
  };
  score: {
    sets: Array<{
      gamesA: number;
      gamesB: number;
      tieBreak: { pointsA: number; pointsB: number } | null;
      winner?: PadelTeamId;
    }>;
  };
  winner: PadelTeamId;
};

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isTeamId(value: unknown): value is PadelTeamId {
  return value === "A" || value === "B";
}

function requirePlayer(player: PadelPlayer | null | undefined, label: string): PadelPlayer {
  if (!player?.displayName?.trim()) {
    throw new MatchApiError(400, `${label} needs a display name`);
  }
  return player;
}

export function inferPadelSetWinner(
  set: Pick<CapturePadelSetInput, "gamesA" | "gamesB" | "tieBreak" | "winner">,
): PadelTeamId | null {
  if (isTeamId(set.winner)) return set.winner;
  const tb = set.tieBreak;
  if (tb && tb.pointsA !== tb.pointsB) {
    return tb.pointsA > tb.pointsB ? "A" : "B";
  }
  if (set.gamesA > set.gamesB) return "A";
  if (set.gamesB > set.gamesA) return "B";
  return null;
}

export function inferPadelMatchWinner(
  sets: readonly CapturePadelSetInput[],
  winner?: PadelTeamId | null,
): PadelTeamId | null {
  if (isTeamId(winner)) return winner;
  let a = 0;
  let b = 0;
  for (const set of sets) {
    const setWinner = inferPadelSetWinner(set);
    if (setWinner === "A") a += 1;
    if (setWinner === "B") b += 1;
  }
  if (a > b) return "A";
  if (b > a) return "B";
  return null;
}

export function toCapturePadelMatchBody(
  input: CapturePadelMatchInput,
): CapturePadelMatchBody {
  const venueCmsId = input.venueCmsId.trim();
  if (!venueCmsId) {
    throw new MatchApiError(400, "Venue cmsId is required");
  }

  const startsAt = input.startsAt?.trim() || "";
  const playedAt = input.playedAt?.trim() || "";
  if (!startsAt && !playedAt) {
    throw new MatchApiError(400, "startsAt or playedAt is required");
  }

  if (input.ruleset !== "golden_point" && input.ruleset !== "advantage") {
    throw new MatchApiError(400, "Invalid match payload");
  }

  const a1 = requirePlayer(input.pairings.teamA[0], "Team A player 1");
  const a2 = requirePlayer(input.pairings.teamA[1], "Team A player 2");
  const b1 = requirePlayer(input.pairings.teamB[0], "Team B player 1");
  const b2 = requirePlayer(input.pairings.teamB[1], "Team B player 2");

  const rawSets = input.score?.sets ?? [];
  if (!Array.isArray(rawSets) || rawSets.length === 0) {
    throw new MatchApiError(400, "At least one set is required");
  }

  const sets = rawSets.map((set, index) => {
    if (!isNonNegativeInt(set.gamesA) || !isNonNegativeInt(set.gamesB)) {
      throw new MatchApiError(400, `Set ${index + 1} games must be non-negative integers`);
    }
    let tieBreak: { pointsA: number; pointsB: number } | null = null;
    if (set.tieBreak) {
      if (
        !isNonNegativeInt(set.tieBreak.pointsA) ||
        !isNonNegativeInt(set.tieBreak.pointsB)
      ) {
        throw new MatchApiError(400, `Set ${index + 1} tie-break points are invalid`);
      }
      tieBreak = {
        pointsA: set.tieBreak.pointsA,
        pointsB: set.tieBreak.pointsB,
      };
    }
    const winner = inferPadelSetWinner({ ...set, tieBreak });
    return {
      gamesA: set.gamesA,
      gamesB: set.gamesB,
      tieBreak,
      ...(winner ? { winner } : {}),
    };
  });

  const winner = inferPadelMatchWinner(rawSets, input.winner);
  if (!winner) {
    throw new MatchApiError(400, "Match winner A or B is required");
  }

  return {
    venueCmsId,
    ...(startsAt ? { startsAt } : { playedAt }),
    ruleset: input.ruleset,
    ...(input.servingTeam === "A" || input.servingTeam === "B"
      ? { servingTeam: input.servingTeam }
      : {}),
    pairings: {
      teamA: [toApiPlayer(a1), toApiPlayer(a2)],
      teamB: [toApiPlayer(b1), toApiPlayer(b2)],
    },
    score: { sets },
    winner,
  };
}

function fetchFailureDetail(err: unknown): string {
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return "";
}

function unreachableCapture(opts?: { cause?: unknown; url?: string }): never {
  const origin = getLoopbackApiProxyOrigin();
  const base = origin
    ? `Match API is unreachable (network error). Start league-sports-api on ${origin} (Postgres required).`
    : "Match API is unreachable (network error).";
  const detail = fetchFailureDetail(opts?.cause);
  const url = opts?.url?.trim() ?? "";
  throw new MatchApiError(0, [base, detail, url].filter(Boolean).join(" · "));
}

async function readResponseBody(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Ensure the court exists, then POST /api/matches/capture.
 * Session cookie is forwarded the same way as live create.
 */
export async function capturePadelMatchWith(
  input: CapturePadelMatchInput,
  venue: Pick<PadelMatchVenue, "name" | "slug">,
  deps: CreatePadelMatchDeps,
): Promise<PadelMatch> {
  const name = venue.name.trim();
  const slug = venue.slug.trim();
  if (!input.venueCmsId.trim()) {
    throw new MatchApiError(400, "Venue cmsId is required");
  }
  if (!name) {
    throw new MatchApiError(400, "Venue name is required");
  }
  if (!slug) {
    throw new MatchApiError(400, "Venue slug is required");
  }
  if (!deps.baseUrl) {
    throw new MatchApiError(503, MATCH_API_ORIGIN_UNCONFIGURED);
  }

  const body = toCapturePadelMatchBody(input);

  const ensured = await attemptEnsureVenueFromCmsWith(
    { cmsId: body.venueCmsId, name, slug },
    {
      fetch: deps.fetch,
      baseUrl: deps.baseUrl,
      cookie: deps.cookie,
    },
  );
  if (!ensured.ok) {
    if (ensured.networkError) {
      unreachableCapture({
        cause: ensured.networkCause,
        url: ensured.networkUrl,
      });
    }
    throw jsonError(ensured.status, ensured.body);
  }

  const captureUrl = `${deps.baseUrl.replace(/\/$/, "")}${CAPTURE_PADEL_PATH}`;
  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (deps.cookie) headers.Cookie = deps.cookie;
    res = await invokeFetch(deps.fetch, captureUrl, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    unreachableCapture({ cause: err, url: captureUrl });
  }

  const payload = await readResponseBody(res);
  if (!res.ok) {
    throw jsonError(res.status, payload);
  }

  const match = parseApiMatch(payload, {
    venue: {
      id: body.venueCmsId,
      name,
      slug,
    },
  });
  if (!match?.id) {
    throw new MatchApiError(502, "Match API did not return a captured match");
  }
  return match;
}

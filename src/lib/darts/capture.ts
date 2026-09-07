import type {
  CaptureDartsMatchInput,
  CaptureDartsTurnInput,
  DartsMatch,
  DartsMatchVenue,
  DartsPlayer,
  DartsPlayerSlot,
} from "../../types/darts-match.ts";
import {
  DARTS_API_ORIGIN_UNCONFIGURED,
  DartsApiError,
  jsonError,
  parseApiDartsMatch,
  type CreateDartsMatchDeps,
} from "./api-match.ts";
import {
  isDartsPlayerSlot,
  parseDartsPlayerSlot,
  replayTurns,
} from "./rules.ts";
import { getLoopbackApiProxyOrigin } from "../api-origin.ts";
import { getRailwayApiOrigin } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { getSiteBaseUrl } from "../site-url.ts";
import { attemptEnsureVenueFromCmsWith } from "../venues/appVenueApi.ts";
import {
  DARTS_MAX_PLAYERS,
  DARTS_MIN_PLAYERS,
} from "../../types/darts-match.ts";

export const CAPTURE_DARTS_PATH = "/api/darts/capture" as const;

export type CaptureDartsMatchBody = {
  venueCmsId?: string | null;
  startsAt?: string;
  playedAt?: string;
  players: Array<{
    slot: DartsPlayerSlot;
    displayName: string;
    isGuest: boolean;
    userId: string | null;
  }>;
  turns: Array<{
    playerSlot: DartsPlayerSlot;
    score: number;
    checkout?: true;
  }>;
};

function normalizePlayers(
  players: CaptureDartsMatchInput["players"],
): CaptureDartsMatchBody["players"] {
  if (!Array.isArray(players) || players.length < DARTS_MIN_PLAYERS) {
    throw new DartsApiError(400, "Capture needs 2–8 seated players");
  }
  if (players.length > DARTS_MAX_PLAYERS) {
    throw new DartsApiError(400, "Capture needs 2–8 seated players");
  }

  const slots = new Set<DartsPlayerSlot>();
  return players.map((player, index) => {
    const slot = isDartsPlayerSlot(player.slot)
      ? player.slot
      : ((index + 1) as DartsPlayerSlot);
    if (!isDartsPlayerSlot(slot)) {
      throw new DartsApiError(400, "Player slots must be 1–8");
    }
    if (slots.has(slot)) {
      throw new DartsApiError(400, "Player slots must be unique");
    }
    slots.add(slot);
    const displayName = player.displayName.trim();
    if (!displayName) {
      throw new DartsApiError(400, `Player ${slot} needs a display name`);
    }
    const isGuest = Boolean(player.isGuest) || !player.userId;
    return {
      slot,
      displayName,
      isGuest,
      userId: isGuest ? null : (player.userId ?? null),
    };
  });
}

function normalizeTurns(
  turns: readonly CaptureDartsTurnInput[],
): CaptureDartsMatchBody["turns"] {
  if (!Array.isArray(turns) || turns.length === 0) {
    throw new DartsApiError(400, "Capture needs a turns log with a checkout");
  }
  return turns.map((turn, index) => {
    const slot = parseDartsPlayerSlot(turn.playerSlot);
    if (!slot) {
      throw new DartsApiError(400, `Turn ${index + 1} needs a player slot`);
    }
    return {
      playerSlot: slot,
      score: turn.score,
      ...(turn.checkout === true ? { checkout: true as const } : {}),
    };
  });
}

export function toCaptureDartsMatchBody(
  input: CaptureDartsMatchInput,
): CaptureDartsMatchBody {
  const venueCmsId = input.venueCmsId?.trim() || "";
  const startsAt = input.startsAt?.trim() || "";
  const playedAt = input.playedAt?.trim() || "";
  if (!startsAt && !playedAt) {
    throw new DartsApiError(400, "startsAt or playedAt is required");
  }

  const players = normalizePlayers(input.players);
  const turns = normalizeTurns(input.turns);
  const replay = replayTurns(players, turns);
  if (!replay.ok) {
    throw new DartsApiError(400, replay.message);
  }
  if (!replay.state.winnerSlot) {
    throw new DartsApiError(400, "Turns log must include a finishing checkout");
  }

  return {
    ...(venueCmsId ? { venueCmsId } : { venueCmsId: null }),
    ...(startsAt ? { startsAt } : { playedAt }),
    players,
    turns,
  };
}

export function playersFromNames(
  names: readonly string[],
  self?: { userId: string; displayName: string } | null,
): DartsPlayer[] {
  return names.map((name, index) => {
    const slot = (index + 1) as DartsPlayerSlot;
    const trimmed = name.trim();
    if (
      index === 0 &&
      self?.userId &&
      (trimmed === self.displayName || !trimmed)
    ) {
      return {
        slot,
        displayName: trimmed || self.displayName,
        isGuest: false,
        userId: self.userId,
        remaining: 501,
      };
    }
    return {
      slot,
      displayName: trimmed || `Player ${slot}`,
      isGuest: true,
      userId: null,
      remaining: 501,
    };
  });
}

function fetchFailureDetail(err: unknown): string {
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return "";
}

function unreachableCapture(opts?: { cause?: unknown; url?: string }): never {
  const origin = getLoopbackApiProxyOrigin();
  const base = origin
    ? `Darts API is unreachable (network error). Start league-sports-api on ${origin} (Postgres required).`
    : "Darts API is unreachable (network error).";
  const detail = fetchFailureDetail(opts?.cause);
  const url = opts?.url?.trim() ?? "";
  throw new DartsApiError(0, [base, detail, url].filter(Boolean).join(" · "));
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
 * Optionally ensure the venue, then POST /api/darts/capture.
 */
export async function captureDartsMatchWith(
  input: CaptureDartsMatchInput,
  venue: Pick<DartsMatchVenue, "name" | "slug"> | null,
  deps: CreateDartsMatchDeps,
): Promise<DartsMatch> {
  if (!deps.baseUrl) {
    throw new DartsApiError(503, DARTS_API_ORIGIN_UNCONFIGURED);
  }

  const body = toCaptureDartsMatchBody(input);
  const cmsId = body.venueCmsId?.trim() || "";
  if (cmsId) {
    const name = venue?.name.trim() || "";
    const slug = venue?.slug.trim() || "";
    if (!name) {
      throw new DartsApiError(400, "Venue name is required");
    }
    if (!slug) {
      throw new DartsApiError(400, "Venue slug is required");
    }
    const ensured = await attemptEnsureVenueFromCmsWith(
      { cmsId, name, slug },
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
  }

  const captureUrl = `${deps.baseUrl.replace(/\/$/, "")}${CAPTURE_DARTS_PATH}`;
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

  const match = parseApiDartsMatch(payload, {
    venue:
      cmsId && venue
        ? {
            id: cmsId,
            name: venue.name,
            slug: venue.slug,
          }
        : null,
  });
  if (!match?.id) {
    throw new DartsApiError(502, "Darts API did not return a captured game");
  }
  return match;
}

function getRequestBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getRailwayApiOrigin() || getSiteBaseUrl();
}

export async function captureDartsMatch(
  input: CaptureDartsMatchInput,
  venue: Pick<DartsMatchVenue, "name" | "slug"> | null,
): Promise<DartsMatch> {
  return captureDartsMatchWith(input, venue, {
    fetch,
    baseUrl: getRequestBase(),
  });
}

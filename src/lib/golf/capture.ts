import type {
  CaptureGolfRoundInput,
  GolfHolesPlayed,
  GolfPlayer,
  GolfPlayerSlot,
  GolfRound,
  GolfRoundVenue,
  GolfScore,
} from "../../types/golf-round.ts";
import {
  GOLF_API_ORIGIN_UNCONFIGURED,
  GolfApiError,
  jsonError,
  parseApiGolfRound,
  type CreateGolfRoundDeps,
} from "./api-round.ts";
import {
  mergeTeeRatingsInput,
  toGolfTeeRatingsPayload,
} from "./handicap.ts";
import {
  isHolesPlayed,
  isStartingHole,
  isValidTeeName,
  normalizeTeeName,
} from "./pre-round.ts";
import { getLoopbackApiProxyOrigin, getRailwayApiOrigin } from "../api-origin.ts";
import { invokeFetch } from "../invoke-fetch.ts";
import { getSiteBaseUrl } from "../site-url.ts";
import { attemptEnsureVenueFromCmsWith } from "../venues/appVenueApi.ts";

export const CAPTURE_GOLF_PATH = "/api/golf-rounds/capture" as const;

export type CaptureGolfRoundBody = {
  venueCmsId: string;
  startsAt?: string;
  playedAt?: string;
  holesPlayed: GolfHolesPlayed;
  startingHole: number;
  teeName: string;
  course: {
    name?: string | null;
    holes: Array<{ number: number; par: number; strokeIndex: number }>;
  };
  players: Array<{
    slot: GolfPlayerSlot;
    displayName: string;
    isGuest: boolean;
    userId: string | null;
  }>;
  score: GolfScore;
  tee?: {
    id?: string;
    courseRating?: number;
    slopeRating?: number;
    par?: number;
  };
  courseRating?: number;
  slopeRating?: number;
  teePar?: number;
};

function isSlot(value: unknown): value is GolfPlayerSlot {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

function isStroke(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 15;
}

export function toCaptureGolfRoundBody(
  input: CaptureGolfRoundInput,
): CaptureGolfRoundBody {
  const venueCmsId = input.venueCmsId.trim();
  if (!venueCmsId) {
    throw new GolfApiError(400, "Venue cmsId is required");
  }

  const startsAt = input.startsAt?.trim() || "";
  const playedAt = input.playedAt?.trim() || "";
  if (!startsAt && !playedAt) {
    throw new GolfApiError(400, "startsAt or playedAt is required");
  }

  if (!isHolesPlayed(input.holesPlayed)) {
    throw new GolfApiError(400, "holesPlayed must be 9 or 18");
  }

  const holes = input.course?.holes ?? [];
  if (holes.length !== input.holesPlayed) {
    throw new GolfApiError(400, "course.holes length must equal holesPlayed");
  }

  const players = input.players ?? [];
  if (players.length < 1 || players.length > 4) {
    throw new GolfApiError(400, "Capture needs 1–4 players");
  }

  const slots = new Set<GolfPlayerSlot>();
  const normalizedPlayers = players.map((player, index) => {
    const slot = isSlot(player.slot) ? player.slot : ((index + 1) as GolfPlayerSlot);
    if (slots.has(slot)) {
      throw new GolfApiError(400, "Player slots must be unique");
    }
    slots.add(slot);
    const displayName = player.displayName.trim();
    if (!displayName) {
      throw new GolfApiError(400, `Player ${slot} needs a display name`);
    }
    const isGuest = Boolean(player.isGuest) || !player.userId;
    return {
      slot,
      displayName,
      isGuest,
      userId: isGuest ? null : (player.userId ?? null),
    };
  });

  const scoreHoles = input.score?.holes ?? [];
  if (scoreHoles.length !== holes.length) {
    throw new GolfApiError(400, "score.holes must match the course");
  }

  const score: GolfScore = {
    holes: scoreHoles.map((hole, index) => {
      const expected = holes[index];
      if (!expected || hole.number !== expected.number) {
        throw new GolfApiError(400, "score.holes must follow course hole order");
      }
      const strokes: Record<string, number> = {};
      for (const player of normalizedPlayers) {
        const key = String(player.slot);
        const value = hole.strokes?.[key];
        if (!isStroke(value)) {
          throw new GolfApiError(
            400,
            `Hole ${hole.number} needs strokes 1–15 for slot ${key}`,
          );
        }
        strokes[key] = value;
      }
      return { number: hole.number, strokes };
    }),
  };

  const startingHole = input.startingHole ?? 1;
  if (!isStartingHole(startingHole)) {
    throw new GolfApiError(400, "startingHole must be 1–18");
  }
  if (!isValidTeeName(input.teeName)) {
    throw new GolfApiError(400, "teeName must be 1–40 characters");
  }

  return {
    venueCmsId,
    ...(startsAt ? { startsAt } : { playedAt }),
    holesPlayed: input.holesPlayed,
    startingHole,
    teeName: normalizeTeeName(input.teeName),
    ...toGolfTeeRatingsPayload(mergeTeeRatingsInput(input)),
    course: {
      name: input.course.name ?? null,
      holes: holes.map((hole) => ({
        number: hole.number,
        par: hole.par,
        strokeIndex: hole.strokeIndex,
      })),
    },
    players: normalizedPlayers,
    score,
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
    ? `Golf round API is unreachable (network error). Start league-sports-api on ${origin} (Postgres required).`
    : "Golf round API is unreachable (network error).";
  const detail = fetchFailureDetail(opts?.cause);
  const url = opts?.url?.trim() ?? "";
  throw new GolfApiError(0, [base, detail, url].filter(Boolean).join(" · "));
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

export function playersFromNames(
  names: readonly string[],
  self?: { userId: string; displayName: string } | null,
): GolfPlayer[] {
  return names.map((name, index) => {
    const slot = (index + 1) as GolfPlayerSlot;
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
      };
    }
    return {
      slot,
      displayName: trimmed || `Player ${slot}`,
      isGuest: true,
      userId: null,
    };
  });
}

/**
 * Ensure the course exists, then POST /api/golf-rounds/capture.
 */
export async function captureGolfRoundWith(
  input: CaptureGolfRoundInput,
  venue: Pick<GolfRoundVenue, "name" | "slug">,
  deps: CreateGolfRoundDeps,
): Promise<GolfRound> {
  const name = venue.name.trim();
  const slug = venue.slug.trim();
  if (!input.venueCmsId.trim()) {
    throw new GolfApiError(400, "Venue cmsId is required");
  }
  if (!name) {
    throw new GolfApiError(400, "Venue name is required");
  }
  if (!slug) {
    throw new GolfApiError(400, "Venue slug is required");
  }
  if (!deps.baseUrl) {
    throw new GolfApiError(503, GOLF_API_ORIGIN_UNCONFIGURED);
  }

  const body = toCaptureGolfRoundBody(input);

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

  const captureUrl = `${deps.baseUrl.replace(/\/$/, "")}${CAPTURE_GOLF_PATH}`;
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

  const round = parseApiGolfRound(payload, {
    venue: {
      id: body.venueCmsId,
      name,
      slug,
    },
  });
  if (!round?.id) {
    throw new GolfApiError(502, "Golf round API did not return a captured round");
  }
  return round;
}

function getRequestBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getRailwayApiOrigin() || getSiteBaseUrl();
}

/** Browser/same-origin finished-score capture. */
export async function captureGolfRound(
  input: CaptureGolfRoundInput,
  venue: Pick<GolfRoundVenue, "name" | "slug">,
): Promise<GolfRound> {
  return captureGolfRoundWith(input, venue, {
    fetch,
    baseUrl: getRequestBase(),
  });
}

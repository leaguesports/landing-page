import {
  f1ReplayEventUrl,
  f1ReplayLocationUrl,
  f1ReplaySessionUrl,
  type LocationChunkResponse,
  type ReplayBootstrap,
} from "./replay.ts";
import { parseLocationPoints } from "./replay-parse.ts";

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

export async function fetchReplayBootstrap(
  sessionKey: number,
  signal?: AbortSignal,
): Promise<ReplayBootstrap> {
  const res = await fetch(f1ReplaySessionUrl(sessionKey), { signal });
  if (!res.ok) {
    throw new Error(`Replay session failed (${res.status})`);
  }
  return (await readJson(res)) as ReplayBootstrap;
}

export async function fetchReplayBootstrapByEventSlug(
  eventSlug: string,
  signal?: AbortSignal,
): Promise<ReplayBootstrap> {
  const res = await fetch(f1ReplayEventUrl(eventSlug), { signal });
  if (!res.ok) {
    throw new Error(`Replay event failed (${res.status})`);
  }
  return (await readJson(res)) as ReplayBootstrap;
}

export async function fetchReplayLocationChunk(
  sessionKey: number,
  fromIso: string,
  toIso: string,
  signal?: AbortSignal,
): Promise<LocationChunkResponse> {
  const res = await fetch(f1ReplayLocationUrl(sessionKey, fromIso, toIso), {
    signal,
  });
  if (!res.ok) {
    throw new Error(`Replay location failed (${res.status})`);
  }
  const body = (await readJson(res)) as { from?: string; to?: string; points?: unknown };
  return {
    from: typeof body.from === "string" ? body.from : fromIso,
    to: typeof body.to === "string" ? body.to : toIso,
    points: parseLocationPoints(body.points),
  };
}

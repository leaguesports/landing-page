import {
  findOpenF1RaceSession,
  type OpenF1Session,
  type OpenF1Weekend,
} from "./openf1.ts";

export const F1_REPLAY_API_PREFIX = "/api/f1-replay" as const;

export const LOCATION_CHUNK_MS = 40_000;
export const LOCATION_LOOKAHEAD_MS = 90_000;
export const LOCATION_MIN_INTERVAL_MS = 200;
export const LOCATION_MAX_WINDOW_MS = 60_000;
export const INTERP_MAX_GAP_MS = 2_500;
export const HEADING_LOOKAHEAD_MS = 400;
export const F1_REPLAY_SPEEDS = [1, 2, 5, 10, 20] as const;

export type RaceReplayConfig = {
  meetingKey: number;
  sessionKey: number;
  circuitKey: number;
  year: number;
  raceStartIso: string;
  raceEndIso: string;
  title: string;
  circuitShortName: string;
  eventSlug: string | null;
};

export type ReplayDriver = {
  driverNumber: number;
  acronym: string;
  fullName: string;
  teamName: string;
  teamColour: string;
};

export type ReplayCircuitCorner = {
  number: number;
  x: number;
  y: number;
};

export type ReplayCircuit = {
  circuitKey: number;
  circuitName: string;
  year: number;
  rotation: number;
  x: number[];
  y: number[];
  corners: ReplayCircuitCorner[];
};

export type LocationSample = {
  t: number;
  x: number;
  y: number;
  z: number;
};

export type LocationPoint = LocationSample & {
  driverNumber: number;
};

export type PositionEvent = {
  t: number;
  driverNumber: number;
  position: number;
};

export type RaceControlEvent = {
  t: number;
  flag: string | null;
  category: string;
  scope: string | null;
  sector: number | null;
  message: string;
};

export type ReplayScrubMark = {
  t: number;
  kind: "yellow" | "red" | "sc" | "vsc" | "chequered";
};

export type ReplayWindow = {
  startIso: string;
  endIso: string;
  startMs: number;
  endMs: number;
  durationMs: number;
};

export type ReplayBootstrap = {
  config: RaceReplayConfig;
  window: ReplayWindow;
  drivers: ReplayDriver[];
  circuit: ReplayCircuit;
  positions: PositionEvent[];
  raceControl: RaceControlEvent[];
  scrubMarks: ReplayScrubMark[];
};

export type LocationChunkResponse = {
  from: string;
  to: string;
  points: LocationPoint[];
};

export type LoadedRange = { from: number; to: number };

export function f1ReplaySessionUrl(sessionKey: number): string {
  return `${F1_REPLAY_API_PREFIX}/sessions/${sessionKey}`;
}

export function f1ReplayLocationUrl(
  sessionKey: number,
  fromIso: string,
  toIso: string,
): string {
  const params = new URLSearchParams({ from: fromIso, to: toIso });
  return `${f1ReplaySessionUrl(sessionKey)}/location?${params.toString()}`;
}

export function f1ReplayEventUrl(eventSlug: string): string {
  return `${F1_REPLAY_API_PREFIX}/events/${encodeURIComponent(eventSlug)}`;
}

export function f1ReplayMeetingsUrl(year: number): string {
  return `${F1_REPLAY_API_PREFIX}/meetings?year=${year}`;
}

export function replayHrefForEventSlug(eventSlug: string): string {
  return `/events/${eventSlug}/replay`;
}

export function replayConfigFromWeekend(
  weekend: OpenF1Weekend,
): RaceReplayConfig | null {
  const race = findOpenF1RaceSession(weekend.sessions);
  if (!race) return null;
  return replayConfigFromSession(race, weekend.meeting.meetingName, weekend.meeting.eventSlug);
}

export function replayConfigFromSession(
  session: Pick<
    OpenF1Session,
    | "sessionKey"
    | "meetingKey"
    | "circuitKey"
    | "year"
    | "dateStart"
    | "dateEnd"
    | "sessionName"
    | "circuitShortName"
  >,
  meetingName: string,
  eventSlug: string | null = null,
): RaceReplayConfig {
  return {
    meetingKey: session.meetingKey,
    sessionKey: session.sessionKey,
    circuitKey: session.circuitKey,
    year: session.year,
    raceStartIso: session.dateStart,
    raceEndIso: session.dateEnd,
    title: meetingName.trim() || session.sessionName,
    circuitShortName: session.circuitShortName,
    eventSlug,
  };
}

export function lookaheadMsForSpeed(speed: number): number {
  const scale = Math.max(1, speed / 2);
  return Math.min(240_000, Math.round(LOCATION_LOOKAHEAD_MS * scale));
}

export function chunkWindows(
  startMs: number,
  endMs: number,
  chunkMs: number = LOCATION_CHUNK_MS,
): Array<{ from: number; to: number }> {
  if (!(endMs > startMs) || chunkMs <= 0) return [];
  const windows: Array<{ from: number; to: number }> = [];
  for (let from = startMs; from < endMs; from += chunkMs) {
    windows.push({ from, to: Math.min(endMs, from + chunkMs) });
  }
  return windows;
}

export function mergeLoadedRanges(ranges: readonly LoadedRange[]): LoadedRange[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.from - b.from);
  const merged: LoadedRange[] = [{ ...sorted[0]! }];
  for (const range of sorted.slice(1)) {
    const last = merged[merged.length - 1]!;
    if (range.from <= last.to + 1) {
      last.to = Math.max(last.to, range.to);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

export function bufferFillRatio(
  ranges: readonly LoadedRange[],
  startMs: number,
  endMs: number,
): number {
  const total = endMs - startMs;
  if (total <= 0) return 0;
  let covered = 0;
  for (const range of mergeLoadedRanges(ranges)) {
    const from = Math.max(startMs, range.from);
    const to = Math.min(endMs, range.to);
    if (to > from) covered += to - from;
  }
  return Math.min(1, covered / total);
}

export function formatReplayClock(ms: number): string {
  const clamped = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

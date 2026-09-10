import { findOpenF1RaceSession, parseOpenF1EventSlug } from "./openf1.ts";
import { buildScrubMarks } from "./race-control.ts";
import {
  chunkWindows,
  replayConfigFromSession,
  type ReplayBootstrap,
  type ReplayCircuit,
  type ReplayDriver,
  type ReplayWindow,
} from "./replay.ts";
import { resolveReplayWindow } from "./replay-window.ts";
import {
  ELEVATION_CHUNK_MS,
  ELEVATION_SAMPLE_MS,
  withCircuitElevation,
} from "./elevation.ts";
import {
  fetchMultiviewerCircuit,
  fetchOpenF1Drivers,
  fetchOpenF1LocationChunk,
  fetchOpenF1Meeting,
  fetchOpenF1MeetingsByYear,
  fetchOpenF1Positions,
  fetchOpenF1RaceControl,
  fetchOpenF1Session,
  fetchOpenF1SessionsForMeeting,
  meetingMatchesEventSlug,
  OpenF1UpstreamError,
} from "./upstream.ts";

export async function loadReplayBootstrap(
  sessionKey: number,
): Promise<ReplayBootstrap | null> {
  const session = await fetchOpenF1Session(sessionKey);
  if (!session) return null;

  const [meeting, drivers, positions, raceControl, circuit] = await Promise.all([
    fetchOpenF1Meeting(session.meetingKey),
    fetchOpenF1Drivers(sessionKey),
    fetchOpenF1Positions(sessionKey),
    fetchOpenF1RaceControl(sessionKey),
    fetchMultiviewerCircuit(session.circuitKey, session.year),
  ]);

  if (!circuit) {
    throw new OpenF1UpstreamError(502, "Circuit outline unavailable");
  }

  const title = meeting?.meetingName ?? session.circuitShortName;
  const config = replayConfigFromSession(session, title, meeting?.eventSlug ?? null);
  const window = resolveReplayWindow({
    sessionStartIso: session.dateStart,
    sessionEndIso: session.dateEnd,
    raceControl,
  });
  config.raceStartIso = window.startIso;
  config.raceEndIso = window.endIso;

  const elevated = await paintSessionElevation(
    sessionKey,
    circuit,
    drivers,
    window,
  );

  return {
    config,
    window,
    drivers,
    circuit: elevated,
    positions,
    raceControl,
    scrubMarks: buildScrubMarks(raceControl),
  };
}

async function paintSessionElevation(
  sessionKey: number,
  circuit: ReplayCircuit,
  drivers: readonly ReplayDriver[],
  window: ReplayWindow,
): Promise<ReplayCircuit> {
  const driverNumber = drivers[0]?.driverNumber;
  if (!driverNumber) return circuit;
  const endMs = Math.min(window.endMs, window.startMs + ELEVATION_SAMPLE_MS);
  const slices = chunkWindows(window.startMs, endMs, ELEVATION_CHUNK_MS);
  if (slices.length === 0) return circuit;
  try {
    const samples = [];
    for (const slice of slices) {
      const points = await fetchOpenF1LocationChunk(
        sessionKey,
        new Date(slice.from).toISOString(),
        new Date(slice.to).toISOString(),
        driverNumber,
      );
      for (const point of points) {
        samples.push({ x: point.x, y: point.y, z: point.z });
      }
    }
    return withCircuitElevation(circuit, samples);
  } catch (error) {
    console.error("[f1-replay] elevation samples failed", error);
    return circuit;
  }
}

export async function resolveSessionKeyByEventSlug(
  eventSlugRaw: string,
): Promise<number | null> {
  const parsed = parseOpenF1EventSlug(eventSlugRaw);
  if (!parsed) return null;
  const year = Number(parsed.date.slice(0, 4));
  const meetings = await fetchOpenF1MeetingsByYear(year);
  const meeting = meetings.find((row) =>
    meetingMatchesEventSlug(row, `${parsed.nameSlug}-${parsed.date}`),
  );
  if (!meeting) return null;
  const sessions = await fetchOpenF1SessionsForMeeting(meeting.meetingKey);
  return (
    findOpenF1RaceSession(sessions, { includeCancelled: true })?.sessionKey ??
    null
  );
}

import { findOpenF1RaceSession, parseOpenF1EventSlug } from "./openf1.ts";
import { buildScrubMarks } from "./race-control.ts";
import { replayConfigFromSession, type ReplayBootstrap } from "./replay.ts";
import { resolveReplayWindow } from "./replay-window.ts";
import {
  fetchMultiviewerCircuit,
  fetchOpenF1Drivers,
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
  if (!session || session.isCancelled) return null;

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

  return {
    config,
    window,
    drivers,
    circuit,
    positions,
    raceControl,
    scrubMarks: buildScrubMarks(raceControl),
  };
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
  return findOpenF1RaceSession(sessions)?.sessionKey ?? null;
}

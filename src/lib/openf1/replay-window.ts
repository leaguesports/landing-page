import type { RaceControlEvent, ReplayWindow } from "./replay.ts";

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

function windowOf(startMs: number, endMs: number): ReplayWindow {
  const start = Math.min(startMs, endMs);
  const end = Math.max(startMs, endMs);
  return {
    startIso: iso(start),
    endIso: iso(end),
    startMs: start,
    endMs: end,
    durationMs: Math.max(0, end - start),
  };
}

function messageUpper(event: RaceControlEvent): string {
  return event.message.trim().toUpperCase();
}

function flagUpper(event: RaceControlEvent): string {
  return (event.flag ?? "").trim().toUpperCase();
}

/**
 * Lights-out → chequered, using race-control when present so formation laps
 * and post-flag cooldown are not in the scrubber.
 */
export function resolveReplayWindow(input: {
  sessionStartIso: string;
  sessionEndIso: string;
  raceControl: readonly RaceControlEvent[];
}): ReplayWindow {
  const sessionStart = Date.parse(input.sessionStartIso);
  const sessionEnd = Date.parse(input.sessionEndIso);
  const fallbackStart = Number.isFinite(sessionStart) ? sessionStart : Date.now();
  const fallbackEnd = Number.isFinite(sessionEnd) ? sessionEnd : fallbackStart + 7_200_000;

  let start = fallbackStart;
  const raceStart = input.raceControl.find((event) => messageUpper(event) === "RACE START");
  const sessionStarted = input.raceControl.find(
    (event) => messageUpper(event) === "SESSION STARTED",
  );
  if (raceStart) start = raceStart.t;
  else if (sessionStarted) start = sessionStarted.t;

  let end = fallbackEnd;
  const chequered = input.raceControl.find(
    (event) =>
      flagUpper(event) === "CHEQUERED" ||
      messageUpper(event).includes("CHEQUERED FLAG") ||
      messageUpper(event) === "SESSION FINISHED",
  );
  if (chequered) {
    end = Math.min(fallbackEnd, chequered.t + 20_000);
  }

  if (end <= start) end = start + 60_000;
  return windowOf(start, end);
}

import { isMotorsportSport } from "../../../types/fixture-feed.ts";
import type { IngestFixture } from "./types.ts";

const MATCH_BEFORE_MS = 20 * 60 * 1000;
const MATCH_AFTER_MS = 3 * 60 * 60 * 1000;
const MOTORSPORT_BEFORE_MS = 30 * 60 * 1000;
const MOTORSPORT_AFTER_MS = 4 * 60 * 60 * 1000;

export function isInLiveWindow(
  fixture: IngestFixture,
  now: Date = new Date(),
): boolean {
  if (!fixture.startsAt) return false;
  const start = new Date(fixture.startsAt).getTime();
  if (Number.isNaN(start)) return false;
  const motorsport = isMotorsportSport(fixture.sportSlug);
  const before = motorsport ? MOTORSPORT_BEFORE_MS : MATCH_BEFORE_MS;
  const after = motorsport ? MOTORSPORT_AFTER_MS : MATCH_AFTER_MS;
  const t = now.getTime();
  return t >= start - before && t <= start + after;
}

export function filterLiveWindow(
  fixtures: readonly IngestFixture[],
  now: Date = new Date(),
): IngestFixture[] {
  return fixtures.filter((fixture) => isInLiveWindow(fixture, now));
}

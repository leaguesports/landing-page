import {
  isMotorsportSport,
  prefersMatchScoreBoard,
} from "../../../types/fixture-feed.ts";
import { parseMatchSides } from "../feed-store.ts";
import { motorsportTitlesMatch, teamsMatch } from "./aliases.ts";
import type { IngestFixture, MatchedIngest, ProviderLiveUpdate } from "./types.ts";

const KICKOFF_SLACK_MS = 6 * 60 * 60 * 1000;

function kickoffClose(
  fixtureStart: string | null,
  eventStart: string | null,
): boolean {
  if (!fixtureStart || !eventStart) return true;
  const a = new Date(fixtureStart).getTime();
  const b = new Date(eventStart).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return true;
  return Math.abs(a - b) <= KICKOFF_SLACK_MS;
}

function fixtureSides(fixture: IngestFixture): { home: string; away: string } | null {
  const fromTitle = parseMatchSides(fixture.title);
  if (fromTitle) return fromTitle;
  const home = fixture.teams?.[0]?.name?.trim();
  const away = fixture.teams?.[1]?.name?.trim();
  if (home && away) return { home, away };
  return null;
}

function matchScoreFit(
  fixture: IngestFixture,
  update: ProviderLiveUpdate,
): MatchedIngest | null {
  if (update.sportFamily !== "match" || !update.match) return null;
  if (isMotorsportSport(fixture.sportSlug)) return null;
  if (
    fixture.sportSlug &&
    !prefersMatchScoreBoard(fixture.sportSlug)
  ) {
    return null;
  }

  const sides = fixtureSides(fixture);
  if (!sides) return null;
  if (!kickoffClose(fixture.startsAt, update.startsAt)) return null;

  const homeHome =
    teamsMatch(sides.home, update.match.home) &&
    teamsMatch(sides.away, update.match.away);
  const swapped =
    teamsMatch(sides.home, update.match.away) &&
    teamsMatch(sides.away, update.match.home);

  if (homeHome) return { fixture, update, swapped: false };
  if (swapped) return { fixture, update, swapped: true };
  return null;
}

function motorsportFit(
  fixture: IngestFixture,
  update: ProviderLiveUpdate,
): MatchedIngest | null {
  if (update.sportFamily !== "motorsport" || !update.motorsport) return null;
  if (fixture.sportSlug && !isMotorsportSport(fixture.sportSlug)) return null;
  if (!kickoffClose(fixture.startsAt, update.startsAt)) return null;
  if (
    !motorsportTitlesMatch(fixture, update.motorsport.meetingName, update.motorsport.circuit)
  ) {
    return null;
  }
  return { fixture, update, swapped: false };
}

export function matchProviderUpdate(
  fixture: IngestFixture,
  update: ProviderLiveUpdate,
): MatchedIngest | null {
  return matchScoreFit(fixture, update) ?? motorsportFit(fixture, update);
}

/**
 * Pair each live CMS fixture with at most one provider event.
 * First unique match wins; leftover provider rows are ignored.
 */
export function matchFixturesToUpdates(
  fixtures: readonly IngestFixture[],
  updates: readonly ProviderLiveUpdate[],
): MatchedIngest[] {
  const used = new Set<string>();
  const matched: MatchedIngest[] = [];

  for (const fixture of fixtures) {
    for (const update of updates) {
      if (used.has(update.providerEventId)) continue;
      const row = matchProviderUpdate(fixture, update);
      if (!row) continue;
      used.add(update.providerEventId);
      matched.push(row);
      break;
    }
  }

  return matched;
}

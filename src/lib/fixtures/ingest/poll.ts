import { applyMatchedUpdate } from "./apply.ts";
import { matchFixturesToUpdates } from "./match.ts";
import { fetchProviderUpdates } from "./providers/index.ts";
import type { IngestFixture, IngestSummary, ProviderLiveUpdate } from "./types.ts";
import { filterLiveWindow } from "./window.ts";

export function toIngestFixture(row: {
  slug: string;
  title: string;
  sportSlug: string | null;
  startsAt: string | null;
  teams?: ReadonlyArray<{ name: string }>;
  competition?: string | null;
  series?: string | null;
}): IngestFixture {
  return {
    slug: row.slug,
    title: row.title,
    sportSlug: row.sportSlug,
    startsAt: row.startsAt,
    teams: row.teams,
    competition: row.competition,
    series: row.series,
  };
}

export type IngestDeps = {
  listFixtures?: () => Promise<IngestFixture[]>;
  fetchUpdates?: () => Promise<{
    updates: ProviderLiveUpdate[];
    errors: string[];
  }>;
  now?: Date;
};

/**
 * Server-side ingest: poll providers only for CMS fixtures in a live window,
 * map onto `FixtureLiveBoard`, publish Ably. Browsers never hit the APIs.
 */
export async function ingestLiveFixtureBoards(
  deps: IngestDeps = {},
): Promise<IngestSummary> {
  const now = deps.now ?? new Date();
  const listFixtures =
    deps.listFixtures ??
    (async () => {
      const { getUpcomingFixtures } = await import("../../../services/events.ts");
      const rows = await getUpcomingFixtures({ limit: 48, now });
      return rows.map(toIngestFixture);
    });
  const fetchUpdates =
    deps.fetchUpdates ?? (() => fetchProviderUpdates({ now }));

  const liveFixtures = filterLiveWindow(await listFixtures(), now);
  if (liveFixtures.length === 0) {
    return {
      liveFixtures: 0,
      providerEvents: 0,
      matched: 0,
      applied: [],
      errors: [],
    };
  }

  const { updates, errors } = await fetchUpdates();
  const matched = matchFixturesToUpdates(liveFixtures, updates);
  const applied = [];
  for (const row of matched) {
    applied.push(await applyMatchedUpdate(row));
  }

  return {
    liveFixtures: liveFixtures.length,
    providerEvents: updates.length,
    matched: matched.length,
    applied,
    errors,
  };
}

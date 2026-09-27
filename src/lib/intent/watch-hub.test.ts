import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UpcomingFixture } from "../sports/events-feed.ts";
import { isWatchCityHubLocation } from "./routes.ts";
import {
  buildWatchHubModel,
  filterWatchHubCards,
  isWatchHubSport,
  formatWatchDistanceKm,
  orderWatchSports,
  resolveWatchFixtureSelection,
  sortWatchHubCards,
  watchCityEventsHref,
  watchCityHubHeading,
  watchCueLabels,
  watchFixtureBucket,
  watchHubHook,
  watchHubPromise,
  watchLivingCount,
  watchPlaceLine,
  watchShowingLabel,
  watchSiblingSportLinks,
  watchSportChipHref,
  watchSuburbChips,
  watchWeekendDays,
  type WatchHubVenueInput,
} from "./watch-hub.ts";

const saturday = new Date("2026-09-26T08:00:00.000Z");
const monday = new Date("2026-09-28T08:00:00.000Z");

const derby: UpcomingFixture = {
  slug: "orlando-pirates-vs-kaizer-chiefs-2026-10-31",
  title: "Orlando Pirates vs Kaizer Chiefs",
  sportSlug: "soccer",
  startsAt: "2026-10-31T13:30:00.000Z",
  venues: [
    { name: "Beer Park Sandton", slug: "beer-park-sandton" },
    { name: "Cesco's Randburg", slug: "cescos-randburg" },
  ],
  series: "premier-soccer-league",
  competition: "Soweto Derby",
  kind: "both",
};

const sharks: UpcomingFixture = {
  slug: "sharks-vs-lions-2026-09-27",
  title: "Sharks vs Lions",
  sportSlug: "rugby",
  startsAt: "2026-09-27T13:00:00.000Z",
  venues: [{ name: "Beer Park Sandton", slug: "beer-park-sandton" }],
  series: "urc",
  competition: null,
  kind: "screening",
};

const grandPrix: UpcomingFixture = {
  slug: "azerbaijan-grand-prix-2026-09-26",
  title: "Azerbaijan Grand Prix",
  sportSlug: "motorsport",
  startsAt: "2026-09-26T11:00:00.000Z",
  venues: [{ name: "Beer Park Sandton", slug: "beer-park-sandton" }],
  series: "f1",
  competition: null,
  kind: "event",
};

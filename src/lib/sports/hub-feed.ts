import { guideHref } from "../guides/slugs.ts";
import {
  eventHref,
  inferSportSlug,
  normalizeSportSlug,
  resolveSportSlug,
  SPORT_CATALOG,
  toHubSportSlug,
  type SportDefinition,
} from "./catalog.ts";
import type { UpcomingFixture } from "./events-feed.ts";

import { cache } from "react";
import { getUpcomingFixtures } from "@/services/events";

/** One fixture read per request, shared by metadata, calendar, and venue cards. */
export const loadWatchCityFixtures = cache(() =>
  getUpcomingFixtures({ limit: 48 }),
);

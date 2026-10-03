/**
 * CMS event kickoffs for Watch venue cards.
 *
 * The merged fixture feed prefers the earlier screening clock. This read
 * uses the event document's own kickoff (`startDateTime`, then legacy
 * fields) so a venue card can show that time.
 */

import { sanityClient } from "../../sanity/client.ts";
import { EVENT_KICKOFF_GROQ, saDayBounds } from "../sports/events-feed.ts";
import {
  eventKickoffsFromRows,
  type WatchEventKickoff,
} from "./watch-week.ts";

export const VENUE_EVENT_KICKOFFS_QUERY = `*[
  _type == "event" &&
  defined(${EVENT_KICKOFF_GROQ}) &&
  ${EVENT_KICKOFF_GROQ} >= $dayStart &&
  ${EVENT_KICKOFF_GROQ} < $dayEnd
]{
  title,
  "slug": slug.current,
  "startsAt": ${EVENT_KICKOFF_GROQ},
  "teams": teams[]{ name, shortCode, primaryColour, secondaryColour }
}`;

function sanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

/** Events whose kickoff falls on any of these Africa/Johannesburg days. */
export async function loadEventKickoffs(
  days: readonly string[],
): Promise<WatchEventKickoff[]> {
  const sorted = [...new Set(days)]
    .filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day))
    .sort();
  if (!sanityConfigured() || sorted.length === 0) return [];

  const { dayStart } = saDayBounds(sorted[0]!);
  const { dayEnd } = saDayBounds(sorted[sorted.length - 1]!);
  try {
    const rows = await sanityClient.fetch<unknown[]>(VENUE_EVENT_KICKOFFS_QUERY, {
      dayStart,
      dayEnd,
    });
    return eventKickoffsFromRows(rows);
  } catch (error) {
    console.error("[venues] event kickoff lookup failed", error);
    return [];
  }
}

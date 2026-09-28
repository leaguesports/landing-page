import type { FixtureFaq } from "@/lib/sports/events-feed";

/**
 * Canonical Soweto Derby slug (31 Oct 2026, 15:30 SAST).
 * `/events/kaizer-chiefs-vs-orlando-pirates-2026` canonicalizes to this slug.
 */
export const SOWETO_DERBY_EVENT_SLUG =
  "orlando-pirates-vs-kaizer-chiefs-2026-10-31";

/**
 * Frontend FAQs keyed by canonical event slug. Same pattern as guide FAQs:
 * the visible block and FAQPage JSON-LD share this list.
 *
 * Injected questions replace a CMS FAQ with the same wording. The derby
 * "how do I find bars" answer in CMS still says to wait until venues are
 * listed; the live page already lists screening venues, so the frontend
 * copy points at that list plus the Joburg sports-bar guide and soccer hub.
 */
export const EVENT_FAQS_BY_SLUG: Record<string, FixtureFaq[]> = {
  [SOWETO_DERBY_EVENT_SLUG]: [
    {
      question: "Where to watch the Soweto Derby?",
      answer:
        "In Johannesburg, use the screening venues listed on this page, then the [best sports bars in Johannesburg](/guides/best-sports-bars-johannesburg) for Rosebank, Sandton, Midrand and the other ranked bars. [Watch soccer in Johannesburg](/watch/soccer/johannesburg) is the hub for bars tagged for soccer near you. Kickoff is listed as 15:30 SAST on 31 October 2026—confirm on the day because Premiership kickoffs sometimes move for TV.",
    },
    {
      question: "How do I find bars showing the Soweto derby?",
      answer:
        "Screening venues for this Soweto Derby are listed on this page. For a Johannesburg shortlist beyond the fixture, open the [best sports bars in Johannesburg](/guides/best-sports-bars-johannesburg) and [Watch soccer in Johannesburg](/watch/soccer/johannesburg).",
    },
  ],
};

export function getEventFaqs(slug: string): FixtureFaq[] {
  return EVENT_FAQS_BY_SLUG[slug.trim().toLowerCase()] ?? [];
}

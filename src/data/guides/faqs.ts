export type GuideFaq = {
  question: string;
  answer: string;
};

export const JOBURG_PADEL_GUIDE_SLUG = "best-padel-courts-joburg";

/**
 * Structured FAQs keyed by guide slug. Used for both the visible FAQ
 * section and FAQPage JSON-LD so the two cannot drift.
 *
 * Add entries here until a Sanity `faqs` field exists. After adding a
 * question, matching h3 blocks in the Portable Text body are stripped
 * at render time so the page does not duplicate them.
 */
export const GUIDE_FAQS_BY_SLUG: Record<string, GuideFaq[]> = {
  [JOBURG_PADEL_GUIDE_SLUG]: [
    {
      question:
        "How much does it cost to book a padel court in Johannesburg?",
      answer:
        "Rates generally range from R240 to R300 per hour during off-peak times (typically midday on weekdays). For peak hours—such as early mornings, evenings, and weekends—rates scale up to R450 to R500 per hour. When you split the cost between a standard group of four players, it is highly affordable, working out to roughly R100 to R125 per person for an hour of intense action.",
    },
    {
      question: "Do I need to buy an expensive racket before my first game?",
      answer:
        "Not at all. Don't drop thousands on a top-tier racket before you've even mastered the walls. Almost every premium club listed across Johannesburg offers high-quality racket rentals (usually around R50 a session) and sells fresh cans of balls directly at the front desk.",
    },
    {
      question: "How do I find other players if I don't have a four-ball?",
      answer:
        'The easiest route is to download the Playtomic app and browse for "public matches" looking for players in your specific skill rating. Alternatively, you can use the LeagueSports discovery network to tap into hyper-local club WhatsApp groups. These groups are specifically tailored to suburbs across Joburg, making it incredibly simple to find players at your exact experience level for a casual game or a competitive league match.',
    },
  ],
};

export function getGuideFaqs(slug: string): GuideFaq[] {
  return GUIDE_FAQS_BY_SLUG[slug] ?? [];
}

export type GuideFaq = {
  question: string;
  answer: string;
  /**
   * Extra Portable Text headings treated as this FAQ when stripping the
   * Sanity body (reworded CMS titles that would otherwise duplicate).
   */
  aliases?: string[];
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
      aliases: ["How much does a padel court cost in Johannesburg?"],
    },
    {
      question: "Do I need to buy an expensive racket before my first game?",
      answer:
        "Not at all. Don't drop thousands on a top-tier racket before you've even mastered the walls. Almost every premium club listed across Johannesburg offers high-quality racket rentals (usually around R50 a session) and sells fresh cans of balls directly at the front desk.",
      aliases: ["Do I need to buy a racket first?"],
    },
    {
      question: "How do I find other players if I don't have a four-ball?",
      answer:
        'The easiest route is to download the Playtomic app and browse for "public matches" looking for players in your specific skill rating. Alternatively, you can use the LeagueSports discovery network to tap into hyper-local club WhatsApp groups. These groups are specifically tailored to suburbs across Joburg, making it incredibly simple to find players at your exact experience level for a casual game or a competitive league match.',
      aliases: ["How do I find players if I do not have a four-ball?"],
    },
    {
      question: "What are the best indoor padel courts in Johannesburg?",
      answer:
        "For weather-proof play today, Coalition Padel in Midrand is the standout live option—panoramic indoor championship courts and a serious training arena when Jozi storms or winter chill hit. Indoor Padel Revolution (Laser Park) and other covered spots such as Balwin Waterfall are on the way; we will add venue pages as soon as they are live on LeagueSports. Until then, book Coalition or look for covered courts at public-booking hubs listed above.",
    },
    {
      question: "Do I need a membership, or can I book publicly?",
      answer:
        "Both exist in Joburg. Many commercial hubs (Africa Padel / Discovery Sandton, Net Set, Match Padel, Coalition, and similar Playtomic-friendly clubs) let you book publicly by the hour without a full club membership. Traditional sports and country clubs often prefer members or guest rules—check the venue page before you go. Start with Play · Padel to browse bookable courts and open games.",
    },
    {
      question: "Which Joburg suburbs have padel courts?",
      answer:
        "Padel now spans most of the northern and central belt: Sandton (Discovery Padel Park), Fourways / Magaliessig (The Golf Place, Match Padel Fourways Mall), Midrand / Kyalami (Coalition Padel, Kyalami Padel), Rivonia (Padel Lab), Greenside / Illovo (Pirates Club, The Wanderers Club), Bryanston (Bryanston Sports Club), Houghton (Houghton Golf Club), and Randpark (Randpark Golf Club).",
    },
  ],
};

export function getGuideFaqs(slug: string): GuideFaq[] {
  return GUIDE_FAQS_BY_SLUG[slug] ?? [];
}

export function faqHeadingsToStrip(faqs: GuideFaq[]): string[] {
  return faqs.flatMap((faq) => [faq.question, ...(faq.aliases ?? [])]);
}

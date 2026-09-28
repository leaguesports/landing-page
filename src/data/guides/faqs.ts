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
export const JOBURG_SPORTS_BARS_GUIDE_SLUG = "best-sports-bars-johannesburg";
export const JOBURG_RUGBY_WATCH_GUIDE_SLUG =
  "where-to-watch-rugby-johannesburg";

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
  [JOBURG_SPORTS_BARS_GUIDE_SLUG]: [
    {
      question: "Where can I find sports bars near me in Johannesburg?",
      answer:
        "This guide is grouped by suburb: Rosebank ([Bench Warmers](/venues/benchwarmers-sports-bar)), Illovo ([Hog's Head](/venues/hogshead-illovo)), Sandton ([The Baron](/venues/the-baron-sandton)), Fourways ([Molly Malone's](/venues/molly-malones-fourways)), Troyeville ([The Troyeville](/venues/the-troyeville)), Bryanston ([Tiger's Milk](/venues/tigers-milk-bryanston)), Craighall Park ([Founders at Giles](/venues/founders-at-giles)), Randburg ([Cesco's](/venues/cescos-randburg)) and Midrand ([Time Out Sports Bar](/venues/time-out-sports-bar)). To see who is screening a sport, open [Watch in Johannesburg](/watch/johannesburg) or filter [rugby](/watch/rugby), [soccer](/watch/soccer), [cricket](/watch/cricket) or [motorsport](/watch/motorsport).",
    },
    {
      question: "Which sports bars are in Sandton?",
      answer:
        "[The Baron](/venues/the-baron-sandton) at Sandton Gate is the Sandton sports bar in this guide: polished pub-grub and HD projectors for soccer and rugby. It suits international matches and a premium meal with the game. Confirm the fixture on the venue page before you go.",
    },
    {
      question: "Which sports bars are in Midrand?",
      answer:
        "For Midrand and the northern corridor, [Time Out Sports Bar](/venues/time-out-sports-bar) at Kyalami Downs covers soccer and motorsport with daily live broadcasts. Verify the fixture before you drive. It is this guide's pick for Midrand soccer and F1 or motorsport weekends.",
    },
    {
      question: "Which sports bars are in Rosebank?",
      answer:
        "[Bench Warmers](/venues/benchwarmers-sports-bar) is the Rosebank sports bar in this guide. Screens everywhere, loud on big fixtures, and built for nights when rugby, soccer and F1 overlap. Best for F1 race weekends and Springboks Tests.",
    },
    {
      question: "Which Johannesburg sports bars have multiple screens?",
      answer:
        "[Bench Warmers](/venues/benchwarmers-sports-bar) in Rosebank is the multi-screen sports-bar blast. [Hog's Head](/venues/hogshead-illovo) in Illovo is the pick when several matches run at once. [The Baron](/venues/the-baron-sandton) uses HD projectors, and [Cesco's](/venues/cescos-randburg) has big screens for rugby, soccer and cricket. Check the venue page for what is actually on.",
    },
    {
      question: "Do I need to book a Johannesburg sports bar?",
      answer:
        "For Springboks Tests, derbies and big Premier League derbies, yes—message the venue early or use the LeagueSports venue page to see who's going. Midweek fixtures are usually walk-in.",
      aliases: ["Do I need to book?"],
    },
    {
      question: "What are the opening hours for these Johannesburg sports bars?",
      answer:
        "This guide only states days for [Cesco's](/venues/cescos-randburg) in Randburg: big screens, draft beer and food for rugby, soccer and cricket, Monday–Saturday. It does not list opening hours for Rosebank, Sandton, Midrand or the other bars. Check the venue page before you go.",
    },
    {
      question: "Best for Springboks?",
      answer:
        "[The Troyeville](/venues/the-troyeville) for hardcore rugby locals; [Bench Warmers](/venues/benchwarmers-sports-bar) and [Hog's Head](/venues/hogshead-illovo) when you want volume and multiple screens. Check LeagueSports events or the venue page before you go. For a rugby-first list, see [where to watch rugby in Johannesburg](/guides/where-to-watch-rugby-johannesburg).",
    },
    {
      question: "Best for Premier League Saturday?",
      answer:
        "[Hog's Head Illovo](/venues/hogshead-illovo) and [Molly Malone's Fourways](/venues/molly-malones-fourways) are strong Premier League Saturday picks; [The Baron Sandton](/venues/the-baron-sandton) works if you want a more polished Sandton watch. Confirm kick-off screens on LeagueSports events or the venue page before you go.",
    },
    {
      question: "Generators / load-shedding?",
      answer:
        "Many Joburg sports bars run backup power on big nights, but it varies. Check amenities on the venue page and confirm with the bar before a night fixture.",
    },
  ],
  [JOBURG_RUGBY_WATCH_GUIDE_SLUG]: [
    {
      question: "Where can I watch rugby near me in Johannesburg?",
      answer:
        "From the Ellis Park corridor in Troyeville to Illovo, Fourways, Sandton and Rosebank, these rugby-first pubs have screens and venue pages so you can confirm the fixture before you drive. Open [Watch rugby in Johannesburg](/watch/rugby/johannesburg) for bars tagged near you. [The Troyeville](/venues/the-troyeville) is the stadium-side local; northern picks include [Hogshead Illovo](/venues/hogshead-illovo), [Molly Malone's Fourways](/venues/molly-malones-fourways), [Benchwarmers](/venues/benchwarmers-sports-bar) in Rosebank and [Beer Park Sandton](/venues/beer-park-sandton).",
    },
    {
      question: "Which sports bars near me show rugby in Johannesburg?",
      answer:
        "This rugby guide lists [The Troyeville](/venues/the-troyeville), [Hogshead Illovo](/venues/hogshead-illovo), [Molly Malone's Fourways](/venues/molly-malones-fourways), [Benchwarmers Sports Bar](/venues/benchwarmers-sports-bar) in Rosebank, [Founders at Giles](/venues/founders-at-giles), [Hooters Fourways](/venues/hooters-fourways) (eighteen screens at The Buzz), [Pirates Club](/venues/pirates-club) in Greenside, [Beer Park Sandton](/venues/beer-park-sandton) and [The Baron Sandton](/venues/the-baron-sandton). For multi-sport bars, including Midrand, see the [best sports bars in Johannesburg](/guides/best-sports-bars-johannesburg).",
    },
    {
      question: "Best for Bok Tests?",
      answer:
        "[The Troyeville](/venues/the-troyeville) for stadium-corridor atmosphere; [Hogshead Illovo](/venues/hogshead-illovo) or [Molly Malone's Fourways](/venues/molly-malones-fourways) for the north; [Benchwarmers Rosebank](/venues/benchwarmers-sports-bar) for max screens.",
    },
    {
      question: "Do I need to book for a Springboks Test in Johannesburg?",
      answer:
        "Yes—for Springboks Tests and knockout rugby, especially Friday and Saturday kick-offs. Book early; those kick-offs fill tables hours ahead. Midweek URC is usually walk-in; still check the venue page before you drive.",
      aliases: ["Book for Tests?"],
    },
    {
      question: "Ellis Park area vs northern suburbs?",
      answer:
        "Troyeville ([The Troyeville](/venues/the-troyeville)) for Ellis Park Test-day energy and hardcore rugby locals. Illovo, Fourways, Sandton and Rosebank for easier parking, decks and multi-screen pubs if you're staying north — including [Hogshead Illovo](/venues/hogshead-illovo), [Molly Malone's Fourways](/venues/molly-malones-fourways), [Beer Park Sandton](/venues/beer-park-sandton) and [Benchwarmers](/venues/benchwarmers-sports-bar).",
    },
    {
      question: "Where to watch URC in Johannesburg?",
      answer:
        "The same rugby-first pubs: [Hogshead Illovo](/venues/hogshead-illovo), [Molly Malone's Fourways](/venues/molly-malones-fourways), [Benchwarmers](/venues/benchwarmers-sports-bar) and [Hooters Fourways](/venues/hooters-fourways) are strong for overlapping Friday and Saturday URC. Open the fixture on Events or filter [Watch rugby](/watch/rugby) to see who is screening.",
      aliases: ["Where to watch URC?"],
    },
  ],
};

export function getGuideFaqs(slug: string): GuideFaq[] {
  return GUIDE_FAQS_BY_SLUG[slug] ?? [];
}

export function faqHeadingsToStrip(faqs: GuideFaq[]): string[] {
  return faqs.flatMap((faq) => [faq.question, ...(faq.aliases ?? [])]);
}

import { eventsListCopy } from "../events/scope.ts";
import { intentBrowseDescription, intentLandingDescription } from "../intent/copy.ts";
import { intentPath, type IntentKind } from "../intent/paths.ts";

export type Sitelink = {
  href: string;
  /** Short label Google can reuse as a sitelink title. */
  title: string;
  /** Matches the destination page's meta description. */
  description: string;
};

function sportHub(intent: IntentKind, slug: string, title: string): Sitelink {
  return {
    href: intentPath(intent, slug),
    title,
    description: intentBrowseDescription(intent, title),
  };
}

const VENUES_LINK: Sitelink = {
  href: "/venues",
  title: "Venues",
  description:
    "Search venues by name, see what’s on, and browse Watch, Play, cities, and sports.",
};

const ABOUT_LINK: Sitelink = {
  href: "/about",
  title: "About",
  description:
    "Why LeagueSports exists: from finding venues as a sports fan in Germany to building something for South Africa.",
};

const WATCH_SPORT_LINKS: readonly Sitelink[] = [
  sportHub("watch", "soccer", "Soccer"),
  sportHub("watch", "rugby", "Rugby"),
  sportHub("watch", "cricket", "Cricket"),
  sportHub("watch", "motorsport", "Motorsport"),
];

export const SITEMAP_PAGE_LINK: Sitelink = {
  href: "/site-map",
  title: "Site Map",
  description: "Sports, venues, fixtures, and guides on LeagueSports.",
};

export type SitemapSection = {
  heading: string;
  links: readonly Sitelink[];
};

/** HTML site map. Titles stay short so they can become sitelink labels. */
export function sitemapSections(): SitemapSection[] {
  return [
    {
      heading: "Watch",
      links: [
        ...WATCH_SPORT_LINKS,
        {
          href: "/watch",
          title: "Watch",
          description: intentLandingDescription("watch"),
        },
      ],
    },
    {
      heading: "Play",
      links: [
        // /play/padel, /play/golf, and /play/darts are noindex scorecards.
        // The public finder is the city page.
        {
          href: intentPath("play", "padel", "johannesburg"),
          title: "Padel",
          description: "Find courts and clubs for padel in Johannesburg.",
        },
        {
          href: intentPath("play", "golf", "johannesburg"),
          title: "Golf",
          description: "Find courses and clubs for golf in Johannesburg.",
        },
        {
          href: intentPath("play", "darts", "johannesburg"),
          title: "Darts",
          description: "Find boards and clubs for darts in Johannesburg.",
        },
        {
          href: "/play",
          title: "Play",
          description:
            "Pick padel, golf, or darts to start a live scorecard, capture a result, or play with others.",
        },
      ],
    },
    {
      heading: "Explore",
      links: [
        VENUES_LINK,
        {
          href: "/events",
          title: "Events",
          description: eventsListCopy({}).description,
        },
        {
          href: "/guides",
          title: "Guides",
          description: "Local tips for fans and players across South Africa.",
        },
        ABOUT_LINK,
        {
          href: "/communities",
          title: "Communities",
          description:
            "Discover and create communities of athletes in your city — join a Sunday group or start your own.",
        },
      ],
    },
  ];
}

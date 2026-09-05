const DEFAULT_SITE_URL = "https://leaguesports.co.za";

export type HomeJsonLdGraph = {
  "@context": "https://schema.org";
  "@graph": Array<Record<string, unknown>>;
};

/** Organization + WebSite graph for the marketing homepage. */
export function buildHomeJsonLd(siteUrl = DEFAULT_SITE_URL): HomeJsonLdGraph {
  const origin = siteUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "LeagueSports",
        url: origin,
        description:
          "South Africa's local sports platform for live scorecards, play venues, and places to watch fixtures.",
        areaServed: {
          "@type": "Country",
          name: "South Africa",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: "LeagueSports",
        description:
          "Find padel and golf scorecards, play courts, and watch venues across South Africa.",
        publisher: { "@id": `${origin}/#organization` },
        inLanguage: "en-ZA",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${origin}/venues?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${origin}/#webpage`,
        url: origin,
        name: "LeagueSports | Live scorecards & sports venues in South Africa",
        isPartOf: { "@id": `${origin}/#website` },
        about: { "@id": `${origin}/#organization` },
        description:
          "Play padel on a live scorecard, lock results to your history, and find courts or watch venues near you.",
        inLanguage: "en-ZA",
      },
    ],
  };
}

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
          "South Africa's local sports platform to watch fixtures, find play venues, and lock live scorecards.",
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
          "Watch venues, play courts, and live scorecards across South Africa.",
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
        name: "LeagueSports | Watch, play & track sport in South Africa",
        isPartOf: { "@id": `${origin}/#website` },
        about: { "@id": `${origin}/#organization` },
        description:
          "Find screens for the big game, book a court, and lock padel or golf scores to your hub.",
        inLanguage: "en-ZA",
      },
    ],
  };
}

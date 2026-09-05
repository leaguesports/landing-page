import type { IntentFaq } from "./copy.ts";
import type { IntentKind } from "./paths.ts";
import { intentPath } from "./paths.ts";

export type IntentVenueListItem = {
  name: string;
  slug: string;
};

export type IntentJsonLdInput = {
  intent: IntentKind;
  title: string;
  description: string;
  activitySlug?: string | null;
  activityName?: string | null;
  locationSlug?: string | null;
  locationTitle?: string | null;
  venues?: IntentVenueListItem[];
  faqs?: IntentFaq[];
  siteUrl: string;
};

function absoluteUrl(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildIntentJsonLd(input: IntentJsonLdInput) {
  const path = intentPath(
    input.intent,
    input.activitySlug,
    input.locationSlug,
  );
  const pageUrl = absoluteUrl(input.siteUrl, path);
  const graph: Record<string, unknown>[] = [];

  const crumbs: { name: string; item: string }[] = [
    { name: "Home", item: absoluteUrl(input.siteUrl, "/") },
    {
      name: input.intent === "watch" ? "Watch" : "Play",
      item: absoluteUrl(input.siteUrl, `/${input.intent}`),
    },
  ];
  if (input.activitySlug && input.activityName) {
    crumbs.push({
      name: input.activityName,
      item: absoluteUrl(
        input.siteUrl,
        intentPath(input.intent, input.activitySlug),
      ),
    });
  }
  if (input.locationSlug && input.locationTitle) {
    crumbs.push({
      name: input.locationTitle,
      item: pageUrl,
    });
  }

  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  });

  graph.push({
    "@type": "CollectionPage",
    "@id": pageUrl,
    name: input.title,
    description: input.description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "LeagueSports",
      url: absoluteUrl(input.siteUrl, "/"),
    },
  });

  if (input.venues && input.venues.length > 0) {
    graph.push({
      "@type": "ItemList",
      name: input.title,
      numberOfItems: input.venues.length,
      itemListElement: input.venues.map((venue, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: venue.name,
        url: absoluteUrl(input.siteUrl, `/venues/${venue.slug}`),
      })),
    });
  }

  if (input.faqs && input.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: input.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
